import express from 'express';
import { 
  getIncident, 
  getIncidents, 
  getTicketImpact, 
  updateIncident,
  broadcastIncidentNote,
  mergeIncidents,
  linkTicketToIncident,
  createIncidentFromTicket,
  dismissDuplicate
} from '../controllers/operationsController.js';

const router = express.Router();

// Incident routes
router.get('/incidents', getIncidents);
router.get('/incidents/:incident_id', getIncident);
router.put('/incidents/:incident_id', updateIncident);
router.post('/incidents/:incident_id/broadcast-note', broadcastIncidentNote);
router.post('/incidents/:incident_id/merge', mergeIncidents);

// Ticket operations routes
router.get('/tickets/:ticket_id/impact', getTicketImpact);
router.post('/tickets/:ticket_id/link-incident', linkTicketToIncident);
router.post('/tickets/:ticket_id/create-incident', createIncidentFromTicket);
router.post('/tickets/:ticket_id/dismiss-duplicate', dismissDuplicate);

export default router;
