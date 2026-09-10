import express from 'express';
import { createKnowledgeArticle, getKnowledgeArticles, getKnowledgeSuggestions, updateKnowledgeArticle } from '../controllers/knowledgeController.js';

const router = express.Router();

router.get('/', getKnowledgeArticles);
router.get('/suggestions', getKnowledgeSuggestions);
router.post('/', createKnowledgeArticle);
router.put('/:slug', updateKnowledgeArticle);

export default router;
