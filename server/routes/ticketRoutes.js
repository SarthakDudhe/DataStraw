import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
} from '../controllers/ticketController.js';

const router = express.Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:ticket_id', getTicketById);
router.put('/:ticket_id', updateTicket);

export default router;
