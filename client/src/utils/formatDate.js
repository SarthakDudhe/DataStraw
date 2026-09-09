/**
 * Formats a date string safely for CRM display.
 * Handles valid, missing, or invalid dates gracefully.
 * 
 * Example output: "Sep 8, 2026 · 4:32 PM" or "Sep 8, 2026"
 * 
 * @param {string|number|Date} dateInput 
 * @param {boolean} includeTime - whether to include the time portion
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, includeTime = true) => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  if (!includeTime) {
    return datePart;
  }

  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${datePart} · ${timePart}`;
};
