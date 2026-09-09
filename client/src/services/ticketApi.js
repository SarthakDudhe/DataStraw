const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Frontend API client abstraction for Support Tickets.
 * Endpoints:
 * - GET    /api/tickets           -> getTickets(params)
 * - GET    /api/tickets/:ticketId -> getTicket(ticketId)
 * - POST   /api/tickets           -> createTicket(data)
 * - PUT    /api/tickets/:ticketId -> updateTicket(ticketId, data)
 */
export const ticketApi = {
  /**
   * Fetch all tickets with optional query filters (search, status).
   * @param {Object} params 
   * @returns {Promise<Array>}
   */
  async getTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/tickets${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tickets (${response.status})`);
    }
    return response.json();
  },

  /**
   * Fetch a single ticket by its ID.
   * @param {string} ticketId 
   * @returns {Promise<Object>}
   */
  async getTicket(ticketId) {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ticket ${ticketId} (${response.status})`);
    }
    return response.json();
  },

  /**
   * Create a new ticket.
   * @param {Object} data - { customerName, customerEmail, subject, description }
   * @returns {Promise<Object>}
   */
  async createTicket(data) {
    const url = `${API_BASE_URL}/api/tickets`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create ticket (${response.status})`);
    }
    return response.json();
  },

  /**
   * Update an existing ticket (e.g. status, notes).
   * @param {string} ticketId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateTicket(ticketId, data) {
    const url = `${API_BASE_URL}/api/tickets/${ticketId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update ticket ${ticketId} (${response.status})`);
    }
    return response.json();
  },
};

export const { getTickets, getTicket, createTicket, updateTicket } = ticketApi;
