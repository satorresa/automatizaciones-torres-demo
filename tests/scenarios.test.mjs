import test from 'node:test';
import assert from 'node:assert/strict';
import {createScenario as make,transitionScenario as act,evaluateScenario as inspect} from '../dist/scenarios.mjs';
const set=(s,field,value)=>act(s,{type:'set',field,value});

test('evidence: correction keeps a new version and stale review cannot approve',()=>{
 const original=make('evidence-workspace');let s=act(original,{type:'correct'});assert.equal(original.version,1);assert.equal(s.version,2);
 s=act(s,{type:'stale'});assert.equal(inspect(s).stage,'stale');s=act(s,{type:'approve'});assert.equal(s.approvedVersion,null);
 s=act(s,{type:'refresh'});s=act(s,{type:'approve'});assert.equal(inspect(s).stage,'ready');
});
test('evidence: contributor cannot accept and reopen retains immutable earlier closure',()=>{
 let s=act(make('evidence-workspace'),{type:'correct'});s=set(s,'role','contributor');assert.equal(act(s,{type:'approve'}).lastIssue,'reviewer_required');
 s=set(s,'role','reviewer');s=act(s,{type:'approve'});s=act(s,{type:'close'});const archive=structuredClone(s.archives);
 s=act(s,{type:'reopen'});assert.deepEqual(s.archives,archive);assert.equal(s.approvedVersion,null);assert.equal(s.closed,false);
});
test('document: unreadable remains inconclusive even after review',()=>{
 let s=set(make('document-consistency'),'readable',false);s=act(s,{type:'review'});assert.equal(inspect(s).stage,'inconclusive');assert.equal(s.decision,'clarification');
});
test('document: correction requires a new reviewer decision and never a legal determination',()=>{
 let s=act(make('document-consistency'),{type:'correct'});assert.equal(inspect(s).stage,'awaiting_review');
 s=set(s,'role','viewer');assert.equal(act(s,{type:'review'}).lastIssue,'reviewer_required');s=set(s,'role','reviewer');s=act(s,{type:'review'});
 assert.equal(inspect(s).stage,'ready');assert.equal(s.decision,'document_consistent');assert.equal('legalCompliance' in inspect(s).facts,false);
});
test('order: uncertainty requires inspection, confirmation and replay create only one operation',()=>{
 let s=act(make('order-operations'),{type:'submit'});assert.equal(s.receipt.status,'uncertain');assert.equal(s.orders.length,0);
 s=act(s,{type:'submit'});assert.equal(s.attempts,1);assert.equal(s.lastIssue,'inspect_before_retry');
 s=set(s,'providerOutcome','confirmed');s=act(s,{type:'check'});s=act(s,{type:'submit'});s=act(s,{type:'check'});
 assert.equal(s.orders.length,1);assert.equal(s.attempts,1);assert.equal(inspect(s).stage,'confirmed');
});
test('order: changed payload on same receipt cannot be reconciled as a different order',()=>{
 let s=act(make('order-operations'),{type:'submit'});s=set(s,'units',12);s=set(s,'providerOutcome','confirmed');s=act(s,{type:'check'});assert.equal(s.lastIssue,'reference_conflict');assert.equal(s.orders.length,0);
});
test('order: invalid quantity and viewer role never reserve an attempt',()=>{
 let s=set(make('order-operations'),'role','viewer');assert.equal(act(s,{type:'submit'}).attempts,0);
 s=make('order-operations');s.units=NaN;assert.equal(inspect(s).stage,'invalid');assert.equal(act(s,{type:'submit'}).attempts,0);
});
test('portal: customer requests, staff refreshes stale revision before resolving',()=>{
 let s=act(make('customer-order-portal'),{type:'request'});assert.equal(act(s,{type:'resolve'}).lastIssue,'staff_required');
 s=set(s,'role','staff');assert.equal(act(s,{type:'resolve'}).lastIssue,'stale_revision');s=act(s,{type:'refresh'});s=act(s,{type:'resolve'});assert.equal(s.status,'cancelled');assert.equal(s.currentRevision,6);
});
test('portal: revocation removes customer access without deleting the record',()=>{
 let s=set(make('customer-order-portal'),'role','staff');s=act(s,{type:'revoke'});s=set(s,'role','customer');assert.equal(inspect(s).facts.visibleOrders,0);assert.equal(inspect(s).stage,'access_revoked');assert.equal('reference'in inspect(s).facts,false);assert.equal('status'in inspect(s).facts,false);assert.equal(act(s,{type:'request'}).lastIssue,'access_revoked');assert.equal(s.reference,'ORDER-SAMPLE-47');
});
test('commerce: reporting is not paid, buyer cannot confirm or prepare',()=>{
 let s=act(make('commerce-operations'),{type:'report'});assert.equal(s.confirmed,false);assert.equal(inspect(s).facts.stockRemaining,2);assert.equal(act(s,{type:'confirm'}).lastIssue,'admin_required');assert.equal(act(s,{type:'prepare'}).fulfillment,'pending');
});
test('commerce: confirmation commits inventory once and fulfillment stays separate',()=>{
 let s=act(make('commerce-operations'),{type:'report'});s=set(s,'role','admin');s=act(s,{type:'confirm'});s=act(s,{type:'confirm'});assert.equal(inspect(s).facts.stockRemaining,1);assert.equal(s.fulfillment,'pending');s=act(s,{type:'prepare'});assert.equal(s.fulfillment,'prepared');
});
test('commerce: amount difference blocks confirmation',()=>{
 let s=set(make('commerce-operations'),'reportedAmount',200000);s=act(s,{type:'report'});s=set(s,'role','admin');assert.equal(act(s,{type:'confirm'}).confirmed,false);assert.ok(inspect(s).issues.includes('amount_mismatch'));
});
test('commerce: a confirmed sample keeps the reviewed amount immutable',()=>{
 let s=act(make('commerce-operations'),{type:'report'});s=set(s,'role','admin');s=act(s,{type:'confirm'});s=set(s,'reportedAmount',1);assert.equal(s.lastIssue,'record_locked');assert.equal(s.reportedAmount,210000);assert.equal(inspect(s).facts.stockRemaining,1);
});
test('transport: conflicting reviews require supervisor resolution and finance approval',()=>{
 let s=make('transport-settlement');assert.equal(inspect(s).stage,'conflict');assert.equal(act(s,{type:'approve'}).approved,false);
 s=set(s,'role','supervisor');s=act(s,{type:'resolve',choice:'second'});assert.equal(inspect(s).facts.due,579200);assert.equal(act(s,{type:'approve'}).lastIssue,'finance_required');
 s=set(s,'role','finance');s=act(s,{type:'approve'});assert.equal(inspect(s).stage,'ready');
});
test('transport: changing evidence/cost invalidates earlier resolution and approval',()=>{
 let s=set(make('transport-settlement'),'role','supervisor');s=act(s,{type:'resolve',choice:'first'});s=set(s,'role','finance');s=act(s,{type:'approve'});s=set(s,'advance',170000);assert.equal(s.approved,false);assert.equal(s.resolvedAdjustment,null);assert.equal(inspect(s).stage,'conflict');
});
test('transport: invalid and negative money cannot produce a ready amount',()=>{
 const s=make('transport-settlement');s.rate=-1;assert.equal(inspect(s).stage,'invalid');assert.equal(inspect(s).facts.due,null);assert.equal(act(s,{type:'approve'}).approved,false);
});
test('transport: unsafe multiplication produces no candidate balance',()=>{const s=make('transport-settlement');s.rate=Number.MAX_SAFE_INTEGER;assert.equal(inspect(s).stage,'invalid');assert.equal(inspect(s).facts.due,null);});
test('product design separates advance from cost without adding them together',()=>{
 let s=make('operations-product-design');assert.equal(inspect(s).facts.unsettledAdvance,25000);assert.equal(inspect(s).facts.supportedCost,45000);assert.equal(inspect(s).facts.productionProduct,false);
 assert.equal(act(s,{type:'review'}).reviewed,false);s=set(s,'role','reviewer');s=act(s,{type:'review'});assert.equal(inspect(s).stage,'design_checked');assert.equal(inspect(s).facts.productionProduct,false);
});
test('commercial: suppression overrides demand and acknowledgment creates no sale or meeting',()=>{
 let s=make('commercial-operations');s=act(s,{type:'approve'});assert.equal(inspect(s).stage,'ready');s=set(s,'acknowledged',true);assert.equal(inspect(s).facts.meetings,0);assert.equal(inspect(s).facts.sales,0);assert.equal(inspect(s).stage,'blocked');assert.equal(act(s,{type:'approve'}).lastIssue,'existing_history');
 s=set(s,'suppressed',true);s=act(s,{type:'approve'});assert.equal(inspect(s).stage,'blocked');assert.equal(s.humanApproved,false);assert.equal(inspect(s).facts.sent,0);
});
test('commercial: stale evidence cannot produce A and prior history blocks a fresh approach',()=>{
 let s=set(make('commercial-operations'),'sourceFresh',false);assert.equal(inspect(s).facts.tier,'review');assert.equal(act(s,{type:'approve'}).humanApproved,false);
 s=set(make('commercial-operations'),'priorContact',true);assert.equal(act(s,{type:'approve'}).lastIssue,'existing_history');
});
test('intake: edits invalidate review, uncertainty prevents duplicate submission',()=>{
 let s=act(make('private-case-intake'),{type:'review'});s=set(s,'summary','Una operación ficticia corregida con soportes.');assert.equal(s.reviewedVersion,null);assert.equal(act(s,{type:'submit'}).lastIssue,'review_required');
 s=act(s,{type:'review'});s=act(s,{type:'submit'});assert.equal(inspect(s).stage,'uncertain');assert.equal(act(s,{type:'submit'}).lastIssue,'inspect_before_retry');assert.equal(inspect(s).facts.records,null);
});
test('intake: recovered receipt is one record, replay is harmless and no email/calendar action occurs',()=>{
 let s=act(make('private-case-intake'),{type:'review'});s=act(s,{type:'submit'});s=set(s,'providerOutcome','confirmed');s=act(s,{type:'check'});s=act(s,{type:'submit'});assert.equal(s.records,1);assert.equal(inspect(s).stage,'received');assert.equal(inspect(s).facts.emailsSent,0);assert.equal(inspect(s).facts.bookings,0);assert.equal(set(s,'summary','Otra descripción de muestra.').lastIssue,'record_locked');
});
test('intake: invalid file blocks review and submit',()=>{
 let s=set(make('private-case-intake'),'fileAllowed',false);s=act(s,{type:'review'});assert.equal(s.reviewedVersion,null);assert.equal(act(s,{type:'submit'}).receipt,null);
});
test('intake: an uncertain attempt retains its original reviewed payload',()=>{let s=act(make('private-case-intake'),{type:'review'});s=act(s,{type:'submit'});const original=s.summary;s=set(s,'summary','Otro contexto que no fue enviado.');assert.equal(s.lastIssue,'record_locked');assert.equal(s.summary,original);s=set(s,'providerOutcome','confirmed');s=act(s,{type:'check'});assert.equal(s.records,1);assert.equal(s.summary,original);});
