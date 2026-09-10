import { Incident } from '../models/Incident.js';
import { Ticket } from '../models/Ticket.js';

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'your', 'are', 'not', 'but', 'into', 'when', 'will', 'unable', 'issue', 'help', 'please', 'about', 'during']);

const getTerms = (ticket) => new Set(
  `${ticket.subject || ''} ${ticket.description || ''}`
    .toLowerCase()
    .match(/[a-z0-9]{3,}/g)
    ?.filter((term) => !STOP_WORDS.has(term)) || []
);

const similarity = (left, right) => {
  const shared = [...left].filter((term) => right.has(term));
  const union = new Set([...left, ...right]);
  return { shared, score: union.size ? shared.length / union.size : 0 };
};

export const findPotentialDuplicates = async (ticket, limit = 5) => {
  const ticketTerms = getTerms(ticket);
  const candidates = await Ticket.find({
    ticket_id: { $ne: ticket.ticket_id },
    status: { $ne: 'Closed' },
  })
    .sort({ created_at: -1 })
    .limit(100)
    .lean();

  return candidates
    .map((candidate) => {
      const result = similarity(ticketTerms, getTerms(candidate));
      return {
        ticket_id: candidate.ticket_id,
        subject: candidate.subject,
        customer_name: candidate.customer_name,
        status: candidate.status,
        incident_id: candidate.incident_id,
        confidence: Math.round(result.score * 100),
        shared_terms: result.shared.slice(0, 5),
      };
    })
    .filter((candidate) => candidate.shared_terms.length >= 2 && candidate.confidence >= 18)
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, limit);
};

export const attachTicketToIncident = async (ticket) => {
  const matches = await findPotentialDuplicates(ticket, 1);
  if (!matches.length) return null;

  const match = matches[0];
  if (match.incident_id) {
    const incident = await Incident.findOneAndUpdate(
      { incident_id: match.incident_id },
      { $addToSet: { ticket_ids: ticket.ticket_id }, $set: { updated_at: new Date() } },
      { new: true }
    );
    ticket.incident_id = match.incident_id;
    await ticket.save();
    return incident;
  }

  const fingerprint = [...match.shared_terms].sort().join('-');
  const existing = await Incident.findOne({ fingerprint });
  const incident = existing || await Incident.create({
    incident_id: `INC-${Date.now().toString(36).toUpperCase()}`,
    fingerprint,
    title: ticket.subject,
    ticket_ids: [match.ticket_id],
  });

  if (!incident.ticket_ids.includes(ticket.ticket_id)) {
    incident.ticket_ids.push(ticket.ticket_id);
  }
  incident.updated_at = new Date();
  await incident.save();

  await Ticket.updateMany(
    { ticket_id: { $in: incident.ticket_ids } },
    { $set: { incident_id: incident.incident_id } }
  );
  return incident;
};
