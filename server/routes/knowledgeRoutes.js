import express from 'express';
import { createKnowledgeArticle, getKnowledgeArticles, getKnowledgeSuggestions, updateKnowledgeArticle, incrementArticleHelpful } from '../controllers/knowledgeController.js';

const router = express.Router();

router.get('/', getKnowledgeArticles);
router.get('/suggestions', getKnowledgeSuggestions);
router.post('/', createKnowledgeArticle);
router.put('/:slug', updateKnowledgeArticle);
router.post('/:slug/helpful', incrementArticleHelpful);

export default router;
