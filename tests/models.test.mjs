import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectPacket, reviseOrder, reserveUnits, inspectEquipment, reconcileReceipt, qualifyOpportunity } from '../dist/models.mjs';

test('a packet becomes ready only with matching valid periods, its attachment and explicit approval', () => {
  assert.deepEqual(inspectPacket({ expectedPeriod: '2027-04', documentPeriod: '2027-04', hasAttachment: true, approved: true }), { ok: true, issues: [], stage: 'ready' });
  assert.equal(inspectPacket({ expectedPeriod: '2027-Q2', documentPeriod: '2027-Q2', hasAttachment: true, approved: true }).ok, true);
});
test('packet differences and missing evidence remain reviewable', () => {
  const result = inspectPacket({ expectedPeriod: '2027-Q2', documentPeriod: '2027-Q1', hasAttachment: false, approved: false });
  assert.equal(result.ok, false); assert.equal(result.stage, 'review');
  assert.deepEqual(result.issues, ['attachment_missing', 'period_mismatch', 'approval_required']);
});
test('invalid packet periods are never silently converted or certified', () => {
  for (const value of ['2027-00', '2027-13', '2027-Q5', '04/2027', '', null, 202704]) {
    const result = inspectPacket({ expectedPeriod: value, documentPeriod: value, hasAttachment: true, approved: true });
    assert.equal(result.ok, false); assert.ok(result.issues.includes('expected_period_invalid')); assert.ok(result.issues.includes('document_period_invalid'));
  }
});
test('truthy strings do not satisfy attachment or approval controls', () => {
  const result = inspectPacket({ expectedPeriod: '2027-04', documentPeriod: '2027-04', hasAttachment: 'true', approved: 'true' });
  assert.deepEqual(result.issues, ['attachment_missing', 'approval_required']);
});
test('order review reports the two real changes while holding production', () => {
  const result = reviseOrder({ baseline: { units: 12, finish: 'arena' }, requested: { units: 14, finish: 'grafito' }, approved: false });
  assert.deepEqual(result.changes, [{ field: 'units', before: 12, after: 14 }, { field: 'finish', before: 'arena', after: 'grafito' }]);
  assert.equal(result.productionAllowed, false); assert.equal(result.stage, 'review');
});
test('approval refers to the current requested order and requires boolean true', () => {
  const input = { baseline: { units: 3, finish: 'perla' }, requested: { units: 3, finish: 'perla' } };
  assert.equal(reviseOrder({ ...input, approved: true }).productionAllowed, true);
  assert.equal(reviseOrder({ ...input, approved: 'true' }).productionAllowed, false);
  assert.equal(reviseOrder(input).productionAllowed, false);
});
test('invalid quantities or a missing finish cannot reach production', () => {
  for (const units of [NaN, Infinity, -1, 0, 1.5, '3', true, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(reviseOrder({ baseline: { units: 3, finish: 'perla' }, requested: { units, finish: 'perla' }, approved: true }).stage, 'invalid');
  }
  assert.equal(reviseOrder({ baseline: { units: 3, finish: 'perla' }, requested: { units: 4, finish: ' ' }, approved: true }).productionAllowed, false);
});
test('an unknown stock count is distinct from a confirmed zero', () => {
  assert.deepEqual(reserveUnits({ stock: null, committed: 0, requested: 1 }), { ok: false, availableBefore: null, availableAfter: null, reservedNow: 0, reason: 'stock_unknown' });
  assert.deepEqual(reserveUnits({ stock: 0, committed: 0, requested: 1 }), { ok: false, availableBefore: 0, availableAfter: 0, reservedNow: 0, reason: 'insufficient_units' });
});
test('a new reservation conserves the previous balance and subtracts only its own quantity', () => {
  assert.deepEqual(reserveUnits({ stock: 8, committed: 2, requested: 3 }), { ok: true, availableBefore: 6, availableAfter: 3, reservedNow: 3, reason: 'reserved' });
});
test('insufficient availability never changes the balance or creates a partial reservation', () => {
  assert.deepEqual(reserveUnits({ stock: 6, committed: 4, requested: 3 }), { ok: false, availableBefore: 2, availableAfter: 2, reservedNow: 0, reason: 'insufficient_units' });
});
test('replaying a caller-confirmed existing reservation adds no units even with no balance left', () => {
  const input = { stock: 8, committed: 8, requested: 3, existingReservation: true };
  const once = reserveUnits(input), twice = reserveUnits(input);
  assert.deepEqual(once, { ok: true, availableBefore: 0, availableAfter: 0, reservedNow: 0, reason: 'already_reserved' });
  assert.deepEqual(once, twice);
});
test('invalid reservation amounts are rejected without NaN or negative output balances', () => {
  for (const field of ['stock', 'committed', 'requested']) for (const value of [NaN, Infinity, -1, 1.2, '2', true, Number.MAX_SAFE_INTEGER + 1]) {
    const result = reserveUnits({ stock: 9, committed: 1, requested: 2, [field]: value });
    assert.equal(result.ok, false); assert.equal(result.reservedNow, 0); assert.equal(result.availableBefore, null); assert.equal(result.availableAfter, null);
  }
  assert.equal(reserveUnits({ stock: 9, committed: 1, requested: 0 }).reason, 'requested_invalid');
});
test('inconsistent commitments and truthy reservation flags require correction', () => {
  assert.equal(reserveUnits({ stock: 2, committed: 3, requested: 1 }).reason, 'commitment_exceeds_stock');
  assert.equal(reserveUnits({ stock: 4, committed: 1, requested: 1, existingReservation: 'true' }).reason, 'reservation_flag_invalid');
});
test('equipment preparation requires identity, work authorization and its support', () => {
  assert.deepEqual(inspectEquipment({ tagged: true, authorized: true, attachment: true }), { ok: true, missing: [], stage: 'ready' });
  assert.deepEqual(inspectEquipment({ tagged: true, authorized: false, attachment: false }), { ok: false, missing: ['work_authorization_missing', 'service_attachment_missing'], stage: 'review' });
  assert.equal(inspectEquipment({ tagged: 'true', authorized: true, attachment: true }).ok, false);
});
test('a consistent reviewed fictional receipt never recognizes actual income', () => {
  assert.deepEqual(reconcileReceipt({ expected: 137500, received: 137500, referenceMatches: true, reviewed: true }), { ok: true, difference: 0, stage: 'ready', recognizedIncome: 0 });
});
test('matching amount alone is not reference verification or human review', () => {
  for (const flags of [{ referenceMatches: false, reviewed: true }, { referenceMatches: true, reviewed: false }, { referenceMatches: true, reviewed: 'true' }]) {
    const result = reconcileReceipt({ expected: 137500, received: 137500, ...flags });
    assert.equal(result.ok, false); assert.equal(result.stage, 'review'); assert.equal(result.recognizedIncome, 0);
  }
});
test('receipt difference is received minus expected and neither sign authorizes a settlement', () => {
  const under = reconcileReceipt({ expected: 137500, received: 137000, referenceMatches: true, reviewed: true });
  const over = reconcileReceipt({ expected: 137500, received: 138000, referenceMatches: true, reviewed: true });
  assert.equal(under.difference, -500); assert.equal(over.difference, 500); assert.equal(under.ok, false); assert.equal(over.ok, false);
});
test('invalid demo amounts remain unknown rather than zero or recognized income', () => {
  for (const value of [NaN, Infinity, -1, 1.5, '137500', Number.MAX_SAFE_INTEGER + 1]) {
    const result = reconcileReceipt({ expected: 137500, received: value, referenceMatches: true, reviewed: true });
    assert.equal(result.stage, 'invalid'); assert.equal(result.difference, null); assert.equal(result.recognizedIncome, 0);
  }
  assert.equal(reconcileReceipt({ expected: 0, received: 0, referenceMatches: true, reviewed: true }).ok, false);
});
const eligible = { sourceVerified: true, mailboxVerified: true, priorContact: false, suppressed: false, humanApproved: true, acknowledged: false, meetingConfirmed: false };
test('only all gates allow a fictional new first approach', () => {
  assert.deepEqual(qualifyOpportunity(eligible), { allowed: true, stage: 'ready', reasons: [] });
  for (const field of ['sourceVerified', 'mailboxVerified', 'humanApproved']) assert.equal(qualifyOpportunity({ ...eligible, [field]: false }).allowed, false);
});
test('suppression takes priority over approval, acknowledgement and a meeting', () => {
  const result = qualifyOpportunity({ ...eligible, suppressed: true, acknowledged: true, meetingConfirmed: true });
  assert.equal(result.allowed, false); assert.equal(result.stage, 'blocked'); assert.ok(result.reasons.includes('suppressed'));
});
test('previous contact requires history review instead of another first approach', () => {
  const result = qualifyOpportunity({ ...eligible, priorContact: true });
  assert.equal(result.allowed, false); assert.equal(result.stage, 'history_review');
});
test('a receipt acknowledgement is conversation history and never a deal', () => {
  const result = qualifyOpportunity({ ...eligible, acknowledged: true });
  assert.equal(result.allowed, false); assert.equal(result.stage, 'acknowledged'); assert.ok(result.reasons.includes('history_requires_review')); assert.notEqual(result.stage, 'won');
});
test('a meeting is still not a sale and does not permit another initial approach', () => {
  const result = qualifyOpportunity({ ...eligible, meetingConfirmed: true });
  assert.equal(result.allowed, false); assert.equal(result.stage, 'meeting'); assert.notEqual(result.stage, 'won');
});
test('strings or numbers cannot fabricate a verified opportunity flag', () => {
  for (const value of ['true', 1, null]) {
    const result = qualifyOpportunity({ ...eligible, mailboxVerified: value });
    assert.equal(result.allowed, false); assert.equal(result.stage, 'invalid'); assert.ok(result.reasons.includes('invalid_flags'));
  }
});
test('models remain deterministic and do not mutate the caller records', () => {
  const baseline = Object.freeze({ units: 2, finish: 'nube' }), requested = Object.freeze({ units: 5, finish: 'nube' });
  const order = Object.freeze({ baseline, requested, approved: false });
  assert.deepEqual(reviseOrder(order), reviseOrder(order)); assert.equal(baseline.units, 2); assert.equal(requested.units, 5);
  for (const fn of [inspectPacket, reviseOrder, reserveUnits, inspectEquipment, reconcileReceipt, qualifyOpportunity]) {
    assert.deepEqual(fn(null), fn(null)); assert.deepEqual(fn(Object.freeze({})), fn({}));
  }
});
