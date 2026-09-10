import { KnowledgeArticle } from '../models/KnowledgeArticle.js';

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'your', 'are', 'not', 'but', 'into', 'when', 'will', 'unable', 'issue', 'help', 'please', 'about', 'during']);
const STARTER_ARTICLES = [
  { slug: 'payment-failure-checklist', title: 'Payment failure troubleshooting checklist', summary: 'Confirm the error code, payment method, account state, and gateway health before escalating.', content: 'Ask for the exact error code and timestamp. Confirm whether the failure affects one card or all methods. Check the payment gateway status and avoid requesting full card details in a support reply.', tags: ['Billing', 'Payments'], keywords: ['payment', 'checkout', 'card', 'billing', 'gateway', 'failed'] },
  { slug: 'password-reset-and-login', title: 'Login and password-reset recovery', summary: 'Validate account identity, check reset-token expiry, and provide safe recovery steps.', content: 'Confirm the account email, request the timestamp of the reset email, and check for a token-expiry or account-lock issue. Never request a password. Offer a new reset link only after identity checks are complete.', tags: ['Account access'], keywords: ['login', 'password', 'reset', 'token', 'access', 'locked'] },
  { slug: 'incident-customer-update', title: 'Writing a customer update during an incident', summary: 'Acknowledge impact, state the current investigation status, and set the next update expectation.', content: 'Use plain language. Confirm that the team is investigating, describe the affected capability without speculation, and commit to the next update window. Do not claim resolution until monitoring confirms recovery.', tags: ['Incidents', 'Communication'], keywords: ['outage', 'incident', 'down', 'status', 'update', 'investigating'] },
];

export const normalizeKnowledgeTerms = (value = '') => [...new Set(
  value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((term) => !STOP_WORDS.has(term)) || []
)];

export const rankKnowledgeArticle = (article, terms) => {
  const corpus = `${article.title} ${article.summary} ${article.tags.join(' ')} ${article.keywords.join(' ')}`.toLowerCase();
  return terms.reduce((score, term) => score + (corpus.includes(term) ? 1 : 0), 0);
};

export const ensureStarterArticles = async () => {
  if (await KnowledgeArticle.exists({})) return;
  await KnowledgeArticle.insertMany(STARTER_ARTICLES);
};

export const getKnowledgeSuggestionsForTicket = async ({ subject = '', description = '', limit = 3 }) => {
  await ensureStarterArticles();
  const terms = normalizeKnowledgeTerms(`${subject} ${description}`);
  const articles = await KnowledgeArticle.find({ status: 'Published' }).lean();
  return articles
    .map((article) => ({ ...article, relevance: rankKnowledgeArticle(article, terms) }))
    .filter((article) => article.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance || right.helpful_count - left.helpful_count)
    .slice(0, limit);
};
