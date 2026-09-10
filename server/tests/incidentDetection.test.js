import test from 'node:test';
import assert from 'node:assert/strict';
import { getTerms, similarity } from '../services/incidentDetection.js';

test('getTerms - extracts meaningful alphanumeric keywords ignoring stop words', () => {
  const ticket = {
    subject: 'Stripe webhook 504 gateway timeout',
    description: 'The checkout request failed with timeout when processing customer card',
  };

  const terms = getTerms(ticket);

  assert.ok(terms.has('stripe'));
  assert.ok(terms.has('webhook'));
  assert.ok(terms.has('504'));
  assert.ok(terms.has('gateway'));
  assert.ok(terms.has('timeout'));
  assert.ok(terms.has('checkout'));
  assert.ok(terms.has('processing'));

  // Stop words should not be present
  assert.ok(!terms.has('the'));
  assert.ok(!terms.has('with'));
  assert.ok(!terms.has('when'));
});

test('similarity - identical ticket terms yield score of 1.0 (100%)', () => {
  const left = new Set(['stripe', 'webhook', 'timeout']);
  const right = new Set(['stripe', 'webhook', 'timeout']);

  const result = similarity(left, right);
  assert.equal(result.score, 1);
  assert.equal(result.shared.length, 3);
});

test('similarity - overlapping tickets detect shared incident terms accurately', () => {
  const ticketA = {
    subject: 'Payment failed at checkout',
    description: 'Customer sees stripe card processing error',
  };
  const ticketB = {
    subject: 'Checkout error with stripe card payment',
    description: 'Card was charged but payment failed at checkout',
  };

  const termsA = getTerms(ticketA);
  const termsB = getTerms(ticketB);

  const result = similarity(termsA, termsB);

  // Common terms: checkout, stripe, card, payment, error, failed
  assert.ok(result.shared.includes('checkout'));
  assert.ok(result.shared.includes('stripe'));
  assert.ok(result.shared.includes('payment'));
  assert.ok(result.shared.includes('error'));
  assert.ok(result.score > 0.4, `Expected similarity score > 0.4, got ${result.score}`);
});

test('similarity - unrelated tickets yield zero or negligible similarity score', () => {
  const ticketA = {
    subject: 'How do I change my organization name?',
    description: 'Updating profile display preferences in settings',
  };
  const ticketB = {
    subject: 'Stripe webhook 504 gateway timeout',
    description: 'Production cluster down in region us-east-1',
  };

  const termsA = getTerms(ticketA);
  const termsB = getTerms(ticketB);

  const result = similarity(termsA, termsB);
  assert.equal(result.shared.length, 0);
  assert.equal(result.score, 0);
});
