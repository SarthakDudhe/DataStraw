import { KnowledgeArticle } from '../models/KnowledgeArticle.js';
import { ensureStarterArticles, getKnowledgeSuggestionsForTicket, normalizeKnowledgeTerms, rankKnowledgeArticle } from '../services/knowledgeSuggestions.js';

export const getKnowledgeArticles = async (req, res, next) => {
  try {
    await ensureStarterArticles();
    const { status = 'Published', search = '' } = req.query;
    const query = status === 'All' ? {} : { status };
    const articles = await KnowledgeArticle.find(query).sort({ updated_at: -1 }).lean();
    const terms = normalizeKnowledgeTerms(search);
    const filtered = terms.length
      ? articles.filter((article) => rankKnowledgeArticle(article, terms) > 0)
      : articles;
    return res.json(filtered);
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeSuggestions = async (req, res, next) => {
  try {
    const suggestions = await getKnowledgeSuggestionsForTicket(req.query);
    return res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

export const createKnowledgeArticle = async (req, res, next) => {
  try {
    const { slug, title, summary, content, tags = [], keywords = [], status = 'Published' } = req.body || {};
    if (![slug, title, summary, content].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ error: 'slug, title, summary, and content are required' });
    }
    const article = await KnowledgeArticle.create({
      slug: slug.trim().toLowerCase(), title: title.trim(), summary: summary.trim(), content: content.trim(),
      tags: tags.map((tag) => String(tag).trim()).filter(Boolean),
      keywords: keywords.map((keyword) => String(keyword).trim().toLowerCase()).filter(Boolean),
      status,
    });
    return res.status(201).json(article);
  } catch (error) {
    next(error);
  }
};

export const updateKnowledgeArticle = async (req, res, next) => {
  try {
    const allowed = ['title', 'summary', 'content', 'tags', 'keywords', 'status'];
    const update = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(update).length) return res.status(400).json({ error: 'No supported fields supplied' });
    update.updated_at = new Date();
    const article = await KnowledgeArticle.findOneAndUpdate({ slug: req.params.slug }, { $set: update }, { new: true }).lean();
    if (!article) return res.status(404).json({ error: 'Knowledge article not found' });
    return res.json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

export const incrementArticleHelpful = async (req, res, next) => {
  try {
    const article = await KnowledgeArticle.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { helpful_count: 1 }, $set: { updated_at: new Date() } },
      { new: true }
    ).lean();
    if (!article) return res.status(404).json({ error: 'Knowledge article not found' });
    return res.json({ success: true, helpful_count: article.helpful_count });
  } catch (error) {
    next(error);
  }
};
