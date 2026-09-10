import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateImpactScore } from '../services/impactScoring.js';

test('calculateImpactScore - base ticket with no triggers returns Normal level', () => {
  const ticket = {
    subject: 'Question about feature documentation',
    description: 'Where can I read more about the export format?',
    created_at: new Date(),
    status: 'Open',
  };

  const result = calculateImpactScore({ ticket, priorTicketCount: 0, incidentTicketCount: 0 });
  assert.equal(result.score, 0);
  assert.equal(result.level, 'Normal');
  assert.equal(result.factors.length, 0);
});

test('calculateImpactScore - high-impact keyword awards 25 points and High level', () => {
  const ticket = {
    subject: 'Payment failed during invoice generation',
    description: 'Customer sees billing error',
    created_at: new Date(),
    status: 'Open',
  };

  const result = calculateImpactScore({ ticket, priorTicketCount: 0, incidentTicketCount: 0 });
  assert.equal(result.score, 25);
  assert.equal(result.level, 'Moderate'); // score >= 20 is Moderate, >= 40 is High
  assert.ok(result.factors.includes('high-impact issue signal'));
});

test('calculateImpactScore - critical outage keyword awards 40 points and High level', () => {
  const ticket = {
    subject: 'Production outage detected in checkout service',
    description: 'The server is completely down',
    created_at: new Date(),
    status: 'Open',
  };

  const result = calculateImpactScore({ ticket, priorTicketCount: 0, incidentTicketCount: 0 });
  assert.equal(result.score, 40);
  assert.equal(result.level, 'High');
  assert.ok(result.factors.includes('critical issue signal'));
});

test('calculateImpactScore - compounding factors (critical + repeat customer + shared incident) yield Critical level', () => {
  const sixHoursAgo = new Date(Date.now() - 12 * 3600000);
  const ticket = {
    subject: 'Major security breach and data loss',
    description: 'Production database breach reported',
    created_at: sixHoursAgo,
    status: 'Open',
  };

  const result = calculateImpactScore({ ticket, priorTicketCount: 4, incidentTicketCount: 5 });
  // 40 (critical) + min(20, 16) (waiting time) + min(20, 20) (repeat) + min(25, 25) (incident) = 101 -> capped at 100
  assert.equal(result.score, 100);
  assert.equal(result.level, 'Critical');
  assert.ok(result.factors.includes('critical issue signal'));
  assert.ok(result.factors.includes('waiting time'));
  assert.ok(result.factors.includes('repeat customer contact'));
  assert.ok(result.factors.includes('shared incident impact'));
});
