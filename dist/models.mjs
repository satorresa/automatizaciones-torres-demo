/**
 * Deterministic models for a synthetic public demonstration.
 * No storage, network, identities, external AI, payment or messaging transport.
 * The caller supplies fictional JSON-like inputs; returned decisions are simulated.
 */

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
const count = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const positiveCount = value => count(value) && value > 0;
const period = value => typeof value === 'string' && /^\d{4}-(?:0[1-9]|1[0-2]|Q[1-4])$/.test(value);
const finishText = value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80 && !/[\u0000-\u001f\u007f]/.test(value);

export function inspectPacket(input = {}) {
  const { expectedPeriod, documentPeriod, hasAttachment, approved } = record(input);
  const issues = [];
  if (!period(expectedPeriod)) issues.push('expected_period_invalid');
  if (!period(documentPeriod)) issues.push('document_period_invalid');
  if (hasAttachment !== true) issues.push('attachment_missing');
  if (period(expectedPeriod) && period(documentPeriod) && expectedPeriod !== documentPeriod) issues.push('period_mismatch');
  if (approved !== true) issues.push('approval_required');
  return { ok: issues.length === 0, issues, stage: issues.length === 0 ? 'ready' : 'review' };
}

export function reviseOrder(input = {}) {
  const { baseline, requested, approved } = record(input);
  const before = record(baseline), after = record(requested);
  if (!positiveCount(before.units) || !positiveCount(after.units) || !finishText(before.finish) || !finishText(after.finish)) {
    return { changes: [], stage: 'invalid', productionAllowed: false };
  }
  const changes = [];
  if (before.units !== after.units) changes.push({ field: 'units', before: before.units, after: after.units });
  const previousFinish = before.finish.trim(), proposedFinish = after.finish.trim();
  if (previousFinish !== proposedFinish) changes.push({ field: 'finish', before: previousFinish, after: proposedFinish });
  const productionAllowed = approved === true;
  return { changes, stage: productionAllowed ? 'ready' : 'review', productionAllowed };
}

export function reserveUnits(input = {}) {
  const { stock, committed, requested, existingReservation = false } = record(input);
  const invalid = reason => ({ ok: false, availableBefore: null, availableAfter: null, reservedNow: 0, reason });
  if (stock === null || stock === undefined) return invalid('stock_unknown');
  if (!count(stock)) return invalid('stock_invalid');
  if (!count(committed)) return invalid('committed_invalid');
  if (!positiveCount(requested)) return invalid('requested_invalid');
  if (typeof existingReservation !== 'boolean') return invalid('reservation_flag_invalid');
  if (committed > stock) return invalid('commitment_exceeds_stock');
  const availableBefore = stock - committed;
  // This flag represents a caller-confirmed reservation already included in committed.
  if (existingReservation) return { ok: true, availableBefore, availableAfter: availableBefore, reservedNow: 0, reason: 'already_reserved' };
  if (requested > availableBefore) return { ok: false, availableBefore, availableAfter: availableBefore, reservedNow: 0, reason: 'insufficient_units' };
  return { ok: true, availableBefore, availableAfter: availableBefore - requested, reservedNow: requested, reason: 'reserved' };
}

export function inspectEquipment(input = {}) {
  const { tagged, authorized, attachment } = record(input);
  const missing = [];
  if (tagged !== true) missing.push('equipment_identity_missing');
  if (authorized !== true) missing.push('work_authorization_missing');
  if (attachment !== true) missing.push('service_attachment_missing');
  return { ok: missing.length === 0, missing, stage: missing.length === 0 ? 'ready' : 'review' };
}

export function reconcileReceipt(input = {}) {
  const { expected, received, referenceMatches, reviewed } = record(input);
  if (!positiveCount(expected) || !count(received)) return { ok: false, difference: null, stage: 'invalid', recognizedIncome: 0 };
  const difference = received - expected;
  const ok = difference === 0 && referenceMatches === true && reviewed === true;
  // Even an internally consistent fictional receipt recognizes no actual income.
  return { ok, difference, stage: ok ? 'ready' : 'review', recognizedIncome: 0 };
}

export function qualifyOpportunity(input = {}) {
  const data = record(input);
  const fields = ['sourceVerified', 'mailboxVerified', 'priorContact', 'suppressed', 'humanApproved', 'acknowledged', 'meetingConfirmed'];
  const invalidFlags = fields.some(key => data[key] !== undefined && typeof data[key] !== 'boolean');
  const sourceVerified = data.sourceVerified === true, mailboxVerified = data.mailboxVerified === true;
  const priorContact = data.priorContact === true, suppressed = data.suppressed === true;
  const humanApproved = data.humanApproved === true, acknowledged = data.acknowledged === true;
  const meetingConfirmed = data.meetingConfirmed === true;
  const reasons = [];
  if (invalidFlags) reasons.push('invalid_flags');
  if (suppressed) reasons.push('suppressed');
  // A receipt or a meeting is already conversation history, even if its flag was omitted.
  if (priorContact || acknowledged || meetingConfirmed) reasons.push('history_requires_review');
  if (!sourceVerified) reasons.push('source_unverified');
  if (!mailboxVerified) reasons.push('mailbox_unverified');
  if (!humanApproved) reasons.push('human_approval_required');
  const allowed = reasons.length === 0;
  let stage = allowed ? 'ready' : 'review';
  if (invalidFlags) stage = 'invalid';
  else if (meetingConfirmed) stage = 'meeting';
  else if (acknowledged) stage = 'acknowledged';
  else if (priorContact) stage = 'history_review';
  if (suppressed) stage = 'blocked';
  return { allowed, stage, reasons };
}
