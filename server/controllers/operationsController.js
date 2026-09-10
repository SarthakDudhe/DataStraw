import { Incident } from '../models/Incident.js';
import { Ticket } from '../models/Ticket.js';
import { calculateImpactScore } from '../services/impactScoring.js';

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
    const incident = await Incident.findOne({ incident_id: req.params.incident_id }).lean();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const tickets = await Ticket.find({ ticket_id: { $in: incident.ticket_ids } })
      .select('ticket_id customer_name subject status created_at -_id')
      .sort({ created_at: -1 })
      .lean();
    return res.json({ ...incident, tickets });
  } catch (error) {
    next(error);
  }
};

export const updateIncident = async (req, res, next) => {
  try {
    const { status, public_update } = req.body || {};
    const update = { updated_at: new Date() };

    if (status) {
      if (!INCIDENT_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid incident status' });
      update.status = status;
    }
    if (typeof public_update === 'string') update.public_update = public_update.trim();
    if (Object.keys(update).length === 1) return res.status(400).json({ error: 'Provide a status or public_update' });

    const incident = await Incident.findOneAndUpdate(
      { incident_id: req.params.incident_id },
      { $set: update },
      { new: true }
    ).lean();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    return res.json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

export const getTicketImpact = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticket_id: req.params.ticket_id }).lean();
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
