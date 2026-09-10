import express from 'express';
import { getIncident, getIncidents, getTicketImpact, updateIncident } from '../controllers/operationsController.js';

const router = express.Router();

router.get('/incidents', getIncidents);
router.get('/incidents/:incident_id', getIncident);
router.put('/incidents/:incident_id', updateIncident);
router.get('/tickets/:ticket_id/impact', getTicketImpact);

export default router;
