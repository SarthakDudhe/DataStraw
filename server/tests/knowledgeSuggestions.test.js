import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeKnowledgeTerms, rankKnowledgeArticle } from '../services/knowledgeSuggestions.js';

test('normalizeKnowledgeTerms - strips stop words and extracts 3+ char terms', () => {
  const input = 'The user is unable to reset password and has an issue with login';
  const terms = normalizeKnowledgeTerms(input);

  // Stop words: 'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'your', 'are', 'not', 'but', 'into', 'when', 'will', 'unable', 'issue', 'help', 'please', 'about', 'during'
  assert.ok(!terms.includes('the'));
  assert.ok(!terms.includes('and'));
  assert.ok(!terms.includes('unable'));
  assert.ok(!terms.includes('issue'));
  assert.ok(!terms.includes('with'));

  // Meaningful terms extracted
  assert.ok(terms.includes('user'));
  assert.ok(terms.includes('reset'));
  assert.ok(terms.includes('password'));
  assert.ok(terms.includes('has'));
  assert.ok(terms.includes('login'));
});

test('rankKnowledgeArticle - correctly scores keyword and tag matches', () => {
  const article = {
    title: 'Payment failure troubleshooting checklist',
    summary: 'Confirm the error code, payment method, account state, and gateway health.',
    tags: ['Billing', 'Payments'],
    keywords: ['payment', 'checkout', 'card', 'billing', 'gateway', 'failed'],
  };

  const matchingTerms = ['payment', 'gateway', 'failed'];
  const score = rankKnowledgeArticle(article, matchingTerms);
  assert.equal(score, 3);

  const nonMatchingTerms = ['kubernetes', 'docker'];
  const zeroScore = rankKnowledgeArticle(article, nonMatchingTerms);
  assert.equal(zeroScore, 0);
});
