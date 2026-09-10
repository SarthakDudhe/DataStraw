import { KnowledgeArticle } from '../models/KnowledgeArticle.js';

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'your', 'are', 'not', 'but', 'into', 'when', 'will', 'unable', 'issue', 'help', 'please', 'about', 'during']);
const STARTER_ARTICLES = [
  {
    slug: 'payment-failure-checklist',
    title: 'Payment failure troubleshooting checklist',
    summary: 'Confirm the error code, payment method, account state, and gateway health before escalating.',
    content: 'Ask for the exact error code and timestamp. Confirm whether the failure affects one card or all methods. Check the payment gateway status and avoid requesting full card details in a support reply.',
    tags: ['Billing', 'Payments'],
    keywords: ['payment', 'checkout', 'card', 'billing', 'gateway', 'failed'],
  },
  {
    slug: 'password-reset-and-login',
    title: 'Login and password-reset recovery',
    summary: 'Validate account identity, check reset-token expiry, and provide safe recovery steps.',
    content: 'Confirm the account email, request the timestamp of the reset email, and check for a token-expiry or account-lock issue. Never request a password. Offer a new reset link only after identity checks are complete.',
    tags: ['Account access'],
    keywords: ['login', 'password', 'reset', 'token', 'access', 'locked'],
  },
  {
    slug: 'incident-customer-update',
    title: 'Writing a customer update during an incident',
    summary: 'Acknowledge impact, state the current investigation status, and set the next update expectation.',
    content: 'Use plain language. Confirm that the team is investigating, describe the affected capability without speculation, and commit to the next update window. Do not claim resolution until monitoring confirms recovery.',
    tags: ['Incidents', 'Communication'],
    keywords: ['outage', 'incident', 'down', 'status', 'update', 'investigating'],
  },
];

const normalizeTerms = (value = '') => [...new Set(
  value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((term) => !STOP_WORDS.has(term)) || []
)];

const rankArticle = (article, terms) => {
  const corpus = `${article.title} ${article.summary} ${article.tags.join(' ')} ${article.keywords.join(' ')}`.toLowerCase();
  return terms.reduce((score, term) => score + (corpus.includes(term) ? 1 : 0), 0);
};

const ensureStarterArticles = async () => {
  if (await KnowledgeArticle.exists({})) return;
  await KnowledgeArticle.insertMany(STARTER_ARTICLES);
};

export const getKnowledgeArticles = async (req, res, next) => {
  try {
    await ensureStarterArticles();
    const { status = 'Published', search = '' } = req.query;
    const query = status === 'All' ? {} : { status };
    const articles = await KnowledgeArticle.find(query).sort({ updated_at: -1 }).lean();
    const terms = normalizeTerms(search);
    const filtered = terms.length
      ? articles.filter((article) => rankArticle(article, terms) > 0)
      : articles;
    return res.json(filtered);
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeSuggestions = async (req, res, next) => {
  try {
    await ensureStarterArticles();
    const terms = normalizeTerms(`${req.query.subject || ''} ${req.query.description || ''}`);
    const articles = await KnowledgeArticle.find({ status: 'Published' }).lean();
    const suggestions = articles
      .map((article) => ({ ...article, relevance: rankArticle(article, terms) }))
      .filter((article) => article.relevance > 0)
      .sort((left, right) => right.relevance - left.relevance || right.helpful_count - left.helpful_count)
      .slice(0, 3);
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
