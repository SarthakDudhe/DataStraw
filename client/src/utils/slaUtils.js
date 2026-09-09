/**
 * Utilities for calculating Service Level Agreement (SLA) status and urgency.
 */

// Default standard target SLA: 12 hours for resolution
export const DEFAULT_SLA_HOURS = 12;

export const calculateSlaStatus = (createdAt, status, targetHours = DEFAULT_SLA_HOURS) => {
  if (!createdAt) return { status: 'unknown', text: 'No SLA' };

  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedMs = now - createdTime;
  const targetMs = targetHours * 60 * 60 * 1000;
  const remainingMs = targetMs - elapsedMs;

  const isClosed = (status || '').toLowerCase() === 'closed';

  if (isClosed) {
    const elapsedHours = Math.max(0.1, (elapsedMs / (1000 * 60 * 60))).toFixed(1);
    const isMet = elapsedMs <= targetMs;
    return {
      status: isMet ? 'met' : 'resolved_breached',
      text: isMet ? `SLA Met (${elapsedHours}h)` : `Resolved (${elapsedHours}h)`,
      urgencyScore: -1, // Lowest urgency
      isBreached: !isMet,
    };
  }

  // Active ticket (Open / In Progress)
  if (remainingMs <= 0) {
    const breachedMs = Math.abs(remainingMs);
    const breachedHours = Math.floor(breachedMs / (1000 * 60 * 60));
    const breachedMins = Math.floor((breachedMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeStr = breachedHours > 0 ? `${breachedHours}h ${breachedMins}m` : `${breachedMins}m`;

    return {
      status: 'breached',
      text: `SLA Breached (${timeStr})`,
      shortText: `Breached +${timeStr}`,
      urgencyScore: 10000000 + breachedMs, // Highest urgency (longer breach = higher priority)
      isBreached: true,
    };
  }

  const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeStr = remainingHours > 0 ? `${remainingHours}h ${remainingMins}m` : `${remainingMins}m`;

  if (remainingHours < 3) {
    return {
      status: 'urgent',
      text: `SLA Warning: ${timeStr} left`,
      shortText: `${timeStr} left`,
      urgencyScore: 5000000 - remainingMs,
      isBreached: false,
    };
  }

  return {
    status: 'healthy',
    text: `SLA: ${timeStr} left`,
    shortText: `${timeStr} left`,
    urgencyScore: 1000000 - remainingMs,
    isBreached: false,
  };
};
