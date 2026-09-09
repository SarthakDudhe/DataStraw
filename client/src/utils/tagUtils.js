/**
 * Dynamic Ticket Tag Classifier
 * Classifies tickets into domain tags based on subject & description keywords.
 */

export const AVAILABLE_TAGS = [
  { id: 'all', label: 'All Categories' },
  { id: 'bug', label: 'Bug / Incident', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { id: 'billing', label: 'Billing & Payments', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'auth', label: 'Auth & Access', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'performance', label: 'Performance & Latency', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { id: 'feature', label: 'Feature Request', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'api', label: 'API & Webhooks', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'general', label: 'General Inquiry', color: 'text-zinc-400 bg-zinc-800/80 border-zinc-700/60' },
];

export const getTicketTags = (ticket) => {
  if (!ticket) return [];

  const text = `${ticket.subject || ''} ${ticket.description || ''}`.toLowerCase();
  const tags = [];

  // Bug
  if (/(bug|error|fail|crash|broken|exception|not working|broken|500|404|issue|glitch)/i.test(text)) {
    tags.push({ id: 'bug', label: 'Bug', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' });
  }

  // Billing
  if (/(bill|invoice|charge|refund|payment|credit card|subscription|pricing|receipt)/i.test(text)) {
    tags.push({ id: 'billing', label: 'Billing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' });
  }

  // Auth
  if (/(login|password|auth|token|session|sso|2fa|credential|access|locked|sign in)/i.test(text)) {
    tags.push({ id: 'auth', label: 'Auth', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' });
  }

  // Performance
  if (/(slow|latency|timeout|lag|delay|freeze|performance|hanging)/i.test(text)) {
    tags.push({ id: 'performance', label: 'Performance', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' });
  }

  // Feature
  if (/(feature|request|suggest|wish|add|enhance|integration|roadmap)/i.test(text)) {
    tags.push({ id: 'feature', label: 'Feature', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' });
  }

  // API
  if (/(api|webhook|endpoint|rest|graphql|payload|sdk|postman|curl)/i.test(text)) {
    tags.push({ id: 'api', label: 'API', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' });
  }

  // Default if no specific tags matched
  if (tags.length === 0) {
    tags.push({ id: 'general', label: 'General', color: 'text-zinc-400 bg-zinc-800/80 border-zinc-700/60' });
  }

  return tags.slice(0, 2); // Return top 2 relevant tags to prevent clutter
};
