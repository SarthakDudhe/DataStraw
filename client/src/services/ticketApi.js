const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : '';

// Initial sample tickets matching assessment specifications
const DEFAULT_SAMPLE_TICKETS = [
  {
    ticket_id: 'TKT-001',
    customer_name: 'Rahul Sharma',
    customer_email: 'rahul.sharma@example.com',
    subject: 'Payment failed during checkout',
    description: 'Customer reports that their payment fails via credit card during checkout. Gateway returned error code 4002.',
    status: 'Open',
    created_at: '2026-09-08T10:30:00.000Z',
    updated_at: '2026-09-08T10:30:00.000Z',
    notes: [
      { text: 'Customer contacted support by email.', created_at: '2026-09-08T10:35:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-002',
    customer_name: 'Priya Mehta',
    customer_email: 'priya.mehta@example.com',
    subject: 'Account login issue',
    description: 'Unable to reset password. The password reset token expires immediately upon receipt.',
    status: 'In Progress',
    created_at: '2026-09-08T11:15:00.000Z',
    updated_at: '2026-09-08T14:20:00.000Z',
    notes: [
      { text: 'Support verified user identity and issued temporary access link.', created_at: '2026-09-08T14:20:00.000Z' },
    ],
  },
  {
    ticket_id: 'TKT-003',
    customer_name: 'Alex Chen',
    customer_email: 'alex.chen@example.com',
    subject: 'Feature request for CSV report export',
    description: 'Customer requested CSV export options for weekly activity reports in the portal.',
    status: 'Closed',
    created_at: '2026-09-07T09:00:00.000Z',
    updated_at: '2026-09-08T16:00:00.000Z',
    notes: [
      { text: 'Forwarded feedback to the product engineering team. Marked closed.', created_at: '2026-09-08T16:00:00.000Z' },
    ],
  },
];

const STORAGE_KEY = 'support_crm_tickets_cache';

function getLocalTickets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_TICKETS));
      return DEFAULT_SAMPLE_TICKETS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SAMPLE_TICKETS;
  }
}

function saveLocalTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Ticket API Client
 * 
 * Endpoints:
 * - GET    /api/tickets              -> getTickets({ search, status })
 * - GET    /api/tickets/:ticket_id   -> getTicket(ticketId)
 * - POST   /api/tickets              -> createTicket({ customer_name, customer_email, subject, description })
 * - PUT    /api/tickets/:ticket_id   -> updateTicket(ticketId, { status, notes })
 * 
 * Provides automatic fallback to sample data when backend routes are not yet mounted.
 */
export const ticketApi = {
  /**
   * Fetch tickets with search & status filters.
   */
  async getTickets(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }
    if (params.status && params.status !== 'All' && params.status !== 'All Statuses') {
      queryParams.append('status', params.status);
    }

    const query = queryParams.toString();
    const url = `${API_BASE_URL}/api/tickets${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable or endpoint not mounted
    }

    // Fallback to sample dataset
    let list = getLocalTickets();

    if (params.status && params.status !== 'All' && params.status !== 'All Statuses') {
      list = list.filter(
        (t) => (t.status || '').toLowerCase() === params.status.toLowerCase()
      );
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.ticket_id || t.id || '').toLowerCase().includes(q) ||
          (t.customer_name || t.customerName || '').toLowerCase().includes(q) ||
          (t.customer_email || t.customerEmail || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Fetch a single ticket by ticketId.
   */
  async getTicket(ticketId) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      if (response.status === 404 && API_BASE_URL) {
        // If real backend explicitly returned 404, check local fallback
      }
    } catch {
      // Backend not yet reachable
    }

    // Fallback lookup
    const list = getLocalTickets();
    const found = list.find(
      (t) => (t.ticket_id || t.id || '').toString() === ticketId.toString()
    );

    if (found) {
      return found;
    }

    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  },

  /**
   * Create a new ticket.
   */
  async createTicket(data) {
    const url = `${API_BASE_URL}/api/tickets`;
    const payload = {
      customer_name: data.customer_name || data.customerName,
      customer_email: data.customer_email || data.customerEmail,
      subject: data.subject,
      description: data.description,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable
    }

    // Fallback local creation
    const list = getLocalTickets();
    const newIdNum = list.length + 1;
    const newTicketId = `TKT-${String(newIdNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const createdTicket = {
      ticket_id: newTicketId,
      ...payload,
      status: 'Open',
      created_at: now,
      updated_at: now,
      notes: [],
    };

    saveLocalTickets([createdTicket, ...list]);
    return createdTicket;
  },

  /**
   * Update an existing ticket status and append notes.
   */
  async updateTicket(ticketId, data) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Backend not yet reachable
    }

    // Fallback local update
    const list = getLocalTickets();
    const index = list.findIndex(
      (t) => (t.ticket_id || t.id || '').toString() === ticketId.toString()
    );

    if (index === -1) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const now = new Date().toISOString();
    const updated = { ...list[index] };

    if (data.status) {
      updated.status = data.status;
    }

    if (data.notes && data.notes.trim()) {
      const newNote = {
        text: data.notes.trim(),
        created_at: now,
      };
      updated.notes = Array.isArray(updated.notes)
        ? [newNote, ...updated.notes]
        : [newNote];
    }

    updated.updated_at = now;
    list[index] = updated;
    saveLocalTickets(list);

    return updated;
  },
};

export const { getTickets, getTicket, createTicket, updateTicket } = ticketApi;
