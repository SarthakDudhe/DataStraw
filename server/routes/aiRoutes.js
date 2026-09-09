import express from 'express';
import { summarizeTicket, generateReply } from '../controllers/aiController.js';

const router = express.Router();

router.post('/summarize', summarizeTicket);
router.post('/reply', generateReply);

export default router;
