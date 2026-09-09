const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/+$/, '') : '';

/**
 * Helper to parse and format clean user-friendly API error messages.
 */
async function parseError(response, defaultMessage) {
  try {
    const errorData = await response.json();
    return errorData.message || errorData.error || `${defaultMessage} (${response.status})`;
  } catch {
    return `${defaultMessage} (${response.status})`;
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
 */
export const ticketApi = {
  /**
   * Fetch all tickets with optional search and status filters.
   * @param {Object} params - { search, status }
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
      if (!response.ok) {
        const message = await parseError(response, 'Unable to load tickets');
        throw new Error(message);
      }
      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please verify the backend is running.');
      }
      throw err;
    }
  },

  /**
   * Fetch details for a specific ticket.
   * @param {string} ticketId
   */
  async getTicket(ticketId) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url);
      if (response.status === 404) {
        const notFoundError = new Error('Ticket not found');
        notFoundError.status = 404;
        throw notFoundError;
      }
      if (!response.ok) {
        const message = await parseError(response, 'Unable to load this ticket');
        throw new Error(message);
      }
      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please verify the backend is running.');
      }
      throw err;
    }
  },

  /**
   * Create a new support ticket.
   * @param {Object} data - { customer_name, customer_email, subject, description }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseError(response, 'Unable to create ticket');
        throw new Error(message);
      }
      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please verify the backend is running.');
      }
      throw err;
    }
  },

  /**
   * Update an existing ticket status and/or append notes.
   * @param {string} ticketId
   * @param {Object} data - { status, notes }
   */
  async updateTicket(ticketId, data) {
    const url = `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await parseError(response, 'Unable to update ticket');
        throw new Error(message);
      }
      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please verify the backend is running.');
      }
      throw err;
    }
  },
};

export const { getTickets, getTicket, createTicket, updateTicket } = ticketApi;
