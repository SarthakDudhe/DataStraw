import { Incident } from '../models/Incident.js';
import { Ticket } from '../models/Ticket.js';
import { Note } from '../models/Note.js';
import { calculateImpactScore, refreshTicketImpact } from '../services/impactScoring.js';

const INCIDENT_STATUSES = ['Investigating', 'Monitoring', 'Resolved'];

export const getIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find()
      .sort({ updated_at: -1 })
      .select('incident_id title status ticket_ids public_update created_at updated_at -_id')
      .lean();
    return res.json(incidents.map((incident) => ({ ...incident, ticket_count: incident.ticket_ids.length })));
  } catch (error) {
    next(error);
  }
};

export const getIncident = async (req, res, next) => {
  try {
    const { incident_id } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const incident = await Incident.findOne({ incident_id }).lean();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const totalTickets = incident.ticket_ids.length;

    // Fetch paginated tickets
    const tickets = await Ticket.find({ ticket_id: { $in: incident.ticket_ids } })
      .select('ticket_id customer_name customer_email subject status impact_score impact_level created_at updated_at -_id')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate unique affected customers across all linked tickets
    const allLinkedTickets = await Ticket.find({ ticket_id: { $in: incident.ticket_ids } })
      .select('customer_name customer_email ticket_id')
      .lean();

    const customerMap = new Map();
    allLinkedTickets.forEach((t) => {
      const email = (t.customer_email || '').toLowerCase().trim();
      if (!email) return;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name: t.customer_name || 'Customer',
          ticket_count: 0,
        });
      }
      customerMap.get(email).ticket_count += 1;
    });

    const affected_customers = Array.from(customerMap.values())
      .sort((a, b) => b.ticket_count - a.ticket_count);

    return res.json({
      ...incident,
      tickets,
      total_tickets: totalTickets,
      page,
      limit,
      total_pages: Math.ceil(totalTickets / limit),
      affected_customers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const { status, public_update, title } = req.body || {};
    const update = { updated_at: new Date() };

    if (status) {
      if (!INCIDENT_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid incident status' });
      update.status = status;
    }
    if (typeof public_update === 'string') update.public_update = public_update.trim();
    if (typeof title === 'string' && title.trim()) update.title = title.trim();

    if (Object.keys(update).length === 1) return res.status(400).json({ error: 'Provide a title, status, or public_update' });

    const incident = await Incident.findOneAndUpdate(
      { incident_id: req.params.incident_id },
      { $set: update },
      { returnDocument: 'after' }
    ).lean();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    return res.json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

export const broadcastIncidentNote = async (req, res, next) => {
  try {
    const { incident_id } = req.params;
    const { note_text } = req.body || {};

    if (!note_text || typeof note_text !== 'string' || !note_text.trim()) {
      return res.status(400).json({ error: 'note_text is required' });
    }

    const incident = await Incident.findOne({ incident_id });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const cleanText = note_text.trim();
    const now = new Date();

    // Insert note for every linked ticket
    const noteDocs = incident.ticket_ids.map((tId) => ({
      ticket_id: tId,
      note_text: `[Incident Update - ${incident_id}] ${cleanText}`,
      created_at: now,
    }));

    if (noteDocs.length > 0) {
      await Note.insertMany(noteDocs);
      await Ticket.updateMany(
        { ticket_id: { $in: incident.ticket_ids } },
        { $set: { updated_at: now } }
      );
    }

    incident.public_update = cleanText;
    incident.updated_at = now;
    await incident.save();

    return res.json({
      success: true,
      broadcast_count: noteDocs.length,
      public_update: cleanText,
      updated_at: now,
    });
  } catch (error) {
    next(error);
  }
};

export const mergeIncidents = async (req, res, next) => {
  try {
    const sourceIncidentId = req.params.incident_id;
    const { target_incident_id } = req.body || {};

    if (!target_incident_id || typeof target_incident_id !== 'string' || !target_incident_id.trim()) {
      return res.status(400).json({ error: 'target_incident_id is required' });
    }

    const targetId = target_incident_id.trim();
    if (sourceIncidentId === targetId) {
      return res.status(400).json({ error: 'Cannot merge an incident into itself' });
    }

    const [sourceIncident, targetIncident] = await Promise.all([
      Incident.findOne({ incident_id: sourceIncidentId }),
      Incident.findOne({ incident_id: targetId }),
    ]);

    if (!sourceIncident) return res.status(404).json({ error: `Source incident ${sourceIncidentId} not found` });
    if (!targetIncident) return res.status(404).json({ error: `Target incident ${targetId} not found` });

    const now = new Date();
    const ticketsToMove = sourceIncident.ticket_ids || [];

    // Union ticket_ids into target
    const combinedTicketIds = Array.from(new Set([...targetIncident.ticket_ids, ...ticketsToMove]));
    targetIncident.ticket_ids = combinedTicketIds;
    targetIncident.updated_at = now;
    await targetIncident.save();

    // Re-point all source tickets to target incident
    if (ticketsToMove.length > 0) {
      await Ticket.updateMany(
        { ticket_id: { $in: ticketsToMove } },
        { $set: { incident_id: targetId, updated_at: now } }
      );

      // Add audit notes
      const auditNotes = ticketsToMove.map((tId) => ({
        ticket_id: tId,
        note_text: `[Operations Audit] Incident ${sourceIncidentId} was merged into ${targetId}.`,
        created_at: now,
      }));
      await Note.insertMany(auditNotes);
    }

    // Resolve source incident with merge notice
    sourceIncident.status = 'Resolved';
    sourceIncident.public_update = `Merged into ${targetId}.`;
    sourceIncident.updated_at = now;
    await sourceIncident.save();

    // Refresh impact scores on moved tickets
    await Promise.all(combinedTicketIds.slice(0, 25).map((tId) => refreshTicketImpact(tId)));

    return res.json({
      success: true,
      merged_count: ticketsToMove.length,
      target_incident: {
        incident_id: targetIncident.incident_id,
        ticket_count: combinedTicketIds.length,
        status: targetIncident.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const linkTicketToIncident = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const { incident_id } = req.body || {};

    if (!incident_id || typeof incident_id !== 'string' || !incident_id.trim()) {
      return res.status(400).json({ error: 'incident_id is required' });
    }

    const cleanIncidentId = incident_id.trim();
    const [ticket, incident] = await Promise.all([
      Ticket.findOne({ ticket_id }),
      Incident.findOne({ incident_id: cleanIncidentId }),
    ]);

    if (!ticket) return res.status(404).json({ error: `Ticket ${ticket_id} not found` });
    if (!incident) return res.status(404).json({ error: `Incident ${cleanIncidentId} not found` });

    const now = new Date();

    // Add to incident ticket list
    if (!incident.ticket_ids.includes(ticket_id)) {
      incident.ticket_ids.push(ticket_id);
      incident.updated_at = now;
      await incident.save();
    }

    // Link ticket
    ticket.incident_id = cleanIncidentId;
    ticket.updated_at = now;
    await ticket.save();

    // Add audit note to ticket
    await Note.create({
      ticket_id,
      note_text: `[Operations] Explicitly linked to incident ${cleanIncidentId}.`,
      created_at: now,
    });

    // Refresh impact
    const impact = await refreshTicketImpact(ticket_id);

    return res.json({
      success: true,
      ticket_id,
      incident_id: cleanIncidentId,
      impact,
    });
  } catch (error) {
    next(error);
  }
};

export const createIncidentFromTicket = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const { title, public_update } = req.body || {};

    const ticket = await Ticket.findOne({ ticket_id });
    if (!ticket) return res.status(404).json({ error: `Ticket ${ticket_id} not found` });

    const now = new Date();
    const incident_id = `INC-${Date.now().toString(36).toUpperCase()}`;
    const incidentTitle = (typeof title === 'string' && title.trim()) ? title.trim() : ticket.subject;
    const fingerprint = `${ticket_id}-${ticket.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`;

    const incident = await Incident.create({
      incident_id,
      fingerprint,
      title: incidentTitle,
      status: 'Investigating',
      ticket_ids: [ticket_id],
      public_update: (typeof public_update === 'string' && public_update.trim()) ? public_update.trim() : '',
      created_at: now,
      updated_at: now,
    });

    ticket.incident_id = incident_id;
    ticket.updated_at = now;
    await ticket.save();

    // Add audit note
    await Note.create({
      ticket_id,
      note_text: `[Operations] Incident ${incident_id} created from this ticket.`,
      created_at: now,
    });

    const impact = await refreshTicketImpact(ticket_id);

    return res.status(201).json({
      success: true,
      incident,
      impact,
    });
  } catch (error) {
    next(error);
  }
};

export const dismissDuplicate = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const { duplicate_ticket_id } = req.body || {};

    if (!duplicate_ticket_id || typeof duplicate_ticket_id !== 'string' || !duplicate_ticket_id.trim()) {
      return res.status(400).json({ error: 'duplicate_ticket_id is required' });
    }

    const cleanDuplicateId = duplicate_ticket_id.trim();
    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id },
      { 
        $addToSet: { dismissed_duplicates: cleanDuplicateId },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!ticket) return res.status(404).json({ error: `Ticket ${ticket_id} not found` });

    return res.json({
      success: true,
      ticket_id,
      dismissed: cleanDuplicateId,
      dismissed_duplicates: ticket.dismissed_duplicates,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketImpact = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const ticket = await Ticket.findOne({ ticket_id }).lean();
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const [priorTicketCount, incident] = await Promise.all([
      Ticket.countDocuments({ customer_email: ticket.customer_email, ticket_id: { $ne: ticket.ticket_id } }),
      ticket.incident_id ? Incident.findOne({ incident_id: ticket.incident_id }).lean() : null,
    ]);

    const impact = calculateImpactScore({
      ticket,
      priorTicketCount,
      incidentTicketCount: incident?.ticket_ids?.length || 0,
    });

    return res.json({
      ticket_id: ticket.ticket_id,
      incident_id: ticket.incident_id || null,
      prior_ticket_count: priorTicketCount,
      incident_ticket_count: incident?.ticket_ids?.length || 0,
      impact,
    });
  } catch (error) {
    next(error);
  }
};
