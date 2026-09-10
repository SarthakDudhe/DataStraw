import { Ticket } from '../models/Ticket.js';
import { Incident } from '../models/Incident.js';

const CRITICAL_TERMS = ['outage', 'down', 'security', 'breach', 'fraud', 'data loss', 'production'];
const HIGH_TERMS = ['payment', 'billing', 'login', 'blocked', 'failed', 'error', 'crash'];

const includesTerm = (text, terms) => terms.some((term) => text.includes(term));

export const calculateImpactScore = ({ ticket, priorTicketCount = 0, incidentTicketCount = 0 }) => {
  const text = `${ticket.subject || ''} ${ticket.description || ''}`.toLowerCase();
  const ageHours = Math.max(0, (Date.now() - new Date(ticket.created_at || Date.now()).getTime()) / 3600000);
  const factors = [];
  let score = 0;

  if (includesTerm(text, CRITICAL_TERMS)) {
    score += 40;
    factors.push('critical issue signal');
  } else if (includesTerm(text, HIGH_TERMS)) {
    score += 25;
    factors.push('high-impact issue signal');
  }

  if (ticket.status !== 'Closed' && ageHours >= 6) {
    score += Math.min(20, Math.floor(ageHours / 3) * 4);
    factors.push('waiting time');
  }

  if (priorTicketCount >= 2) {
    score += Math.min(20, priorTicketCount * 5);
    factors.push('repeat customer contact');
  }

  if (incidentTicketCount >= 2) {
    score += Math.min(25, incidentTicketCount * 5);
    factors.push('shared incident impact');
  }

  score = Math.min(100, score);
  return {
    score,
    level: score >= 70 ? 'Critical' : score >= 40 ? 'High' : score >= 20 ? 'Moderate' : 'Normal',
    factors,
  };
};

export const refreshTicketImpact = async (ticketId) => {
  if (!ticketId) return null;
  const ticket = await Ticket.findOne({ ticket_id: ticketId });
  if (!ticket) return null;

  const [priorTicketCount, incident] = await Promise.all([
    Ticket.countDocuments({ customer_email: ticket.customer_email, ticket_id: { $ne: ticket.ticket_id } }),
    ticket.incident_id ? Incident.findOne({ incident_id: ticket.incident_id }).lean() : null,
  ]);

  const impact = calculateImpactScore({
    ticket,
    priorTicketCount,
    incidentTicketCount: incident?.ticket_ids?.length || 0,
  });

  ticket.impact_score = impact.score;
  ticket.impact_level = impact.level;
  ticket.impact_factors = impact.factors;
  ticket.updated_at = new Date();
  await ticket.save();

  return impact;
};
