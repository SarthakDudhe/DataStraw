import { Ticket, getNextTicketId } from '../models/Ticket.js';
import { Note } from '../models/Note.js';

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];

/**
 * POST /api/tickets
 * Creates a new ticket with auto-generated ticket_id and status "Open"
 */
export const createTicket = async (req, res, next) => {
  try {
    let { customer_name, customer_email, subject, description } = req.body || {};

    // Validate customer_name
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return res.status(400).json({ error: 'customer_name is required' });
    }
    customer_name = customer_name.trim();

    // Validate customer_email
    if (!customer_email || typeof customer_email !== 'string' || !customer_email.trim()) {
      return res.status(400).json({ error: 'customer_email is required' });
    }
    customer_email = customer_email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(customer_email)) {
      return res.status(400).json({ error: 'customer_email must be a valid email address' });
    }

    // Validate subject
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'subject is required' });
    }
    subject = subject.trim();

    // Validate description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'description is required' });
    }
    description = description.trim();

    // Generate safe sequential ticket_id (TKT-001, TKT-002, etc.)
    const ticket_id = await getNextTicketId();
    const now = new Date();

    const ticket = new Ticket({
      ticket_id,
      customer_name,
      customer_email,
      subject,
      description,
      status: 'Open',
      created_at: now,
      updated_at: now,
    });

    await ticket.save();

    return res.status(201).json({
      ticket_id: ticket.ticket_id,
      created_at: ticket.created_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets
 * Retrieves all tickets with optional search and status filters
 */
export const getTickets = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filterConditions = [];

    // Filter by status if provided
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      filterConditions.push({ status });
    }

    // Search query across customer_name, ticket_id, customer_email, and description
    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitized, 'i');
      filterConditions.push({
        $or: [
          { customer_name: searchRegex },
          { ticket_id: searchRegex },
          { customer_email: searchRegex },
          { description: searchRegex },
          { subject: searchRegex },
        ],
      });
    }

    const query = filterConditions.length > 0 ? { $and: filterConditions } : {};

    const tickets = await Ticket.find(query)
      .sort({ created_at: -1 })
      .select('ticket_id customer_name subject status created_at -_id')
      .lean();

    return res.json(tickets);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets/:ticket_id
 * Retrieves a single ticket along with its individual notes
 */
export const getTicketById = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ error: 'ticket_id is required' });
    }

    const ticket = await Ticket.findOne({ ticket_id })
      .select('ticket_id customer_name customer_email subject description status created_at updated_at -_id')
      .lean();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Retrieve notes from Note collection
    const notes = await Note.find({ ticket_id })
      .sort({ created_at: 1 })
      .select('note_text created_at -_id')
      .lean();

    return res.json({
      ...ticket,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tickets/:ticket_id
 * Updates ticket status and/or adds a note to the ticket
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { ticket_id } = req.params;
    const { status, notes } = req.body || {};

    if (!ticket_id) {
      return res.status(400).json({ error: 'ticket_id is required' });
    }

    const ticket = await Ticket.findOne({ ticket_id });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const hasStatus = typeof status === 'string' && status.trim() !== '';
    const hasNotes = typeof notes === 'string' && notes.trim() !== '';

    if (!hasStatus && !hasNotes) {
      return res.status(400).json({ error: 'At least status or notes must be provided' });
    }

    // Validate status if provided
    if (hasStatus) {
      const cleanStatus = status.trim();
      if (!VALID_STATUSES.includes(cleanStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      ticket.status = cleanStatus;
    }

    const now = new Date();

    // Append new note document if provided
    if (hasNotes) {
      const newNote = new Note({
        ticket_id,
        note_text: notes.trim(),
        created_at: now,
      });
      await newNote.save();
    }

    // Update timestamp
    ticket.updated_at = now;
    await ticket.save();

    return res.json({
      success: true,
      updated_at: ticket.updated_at,
    });
  } catch (error) {
    next(error);
  }
};
