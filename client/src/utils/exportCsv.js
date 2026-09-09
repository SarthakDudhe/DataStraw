/**
 * Utility to export an array of support tickets to RFC-compliant CSV
 */
import { calculateSlaStatus } from './slaUtils';
import { formatDate } from './formatDate';

export const exportTicketsToCsv = (tickets, filename = 'support_tickets.csv') => {
  if (!tickets || tickets.length === 0) return false;

  const headers = [
    'Ticket ID',
    'Customer Name',
    'Customer Email',
    'Subject',
    'Status',
    'SLA Status',
    'Created At',
    'Updated At',
    'Notes Count',
  ];

  const rows = tickets.map((t) => {
    const id = t.ticket_id || t.id || '';
    const name = (t.customer_name || t.customerName || '').replace(/"/g, '""');
    const email = (t.customer_email || t.customerEmail || '').replace(/"/g, '""');
    const subject = (t.subject || '').replace(/"/g, '""');
    const status = t.status || '';
    const sla = calculateSlaStatus(t.created_at || t.createdAt, t.status).text;
    const createdAt = formatDate(t.created_at || t.createdAt, false);
    const updatedAt = t.updated_at || t.updatedAt ? formatDate(t.updated_at || t.updatedAt, false) : '';
    const notesCount = Array.isArray(t.notes) ? t.notes.length : (t.notes ? 1 : 0);

    return [
      `"${id}"`,
      `"${name}"`,
      `"${email}"`,
      `"${subject}"`,
      `"${status}"`,
      `"${sla}"`,
      `"${createdAt}"`,
      `"${updatedAt}"`,
      notesCount,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
