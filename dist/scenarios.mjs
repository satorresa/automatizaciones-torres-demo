/** Independent fictional workflow models. No network, storage, money or messaging authority. */
export const SCENARIO_IDS=Object.freeze(['evidence-workspace','document-consistency','order-operations','customer-order-portal','commerce-operations','transport-settlement','operations-product-design','commercial-operations','private-case-intake']);
const clone=value=>structuredClone(value);
const money=value=>typeof value==='number'&&Number.isFinite(value)&&Number.isSafeInteger(value)&&value>=0;
const positive=value=>money(value)&&value>0;
const period=value=>typeof value==='string'&&/^\d{4}-(?:0[1-9]|1[0-2])$/.test(value);
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=300;
const DEFAULTS={
 'evidence-workspace':{expectedPeriod:'2026-04',documentPeriod:'2026-05',attachment:true,version:1,reviewVersion:1,approvedVersion:null,closed:false,archives:[],role:'reviewer'},
 'document-consistency':{referenceHolder:'Registro A',documentHolder:'Registro B',referencePeriod:'2026-07',documentPeriod:'2026-07',readable:true,sourcePresent:true,reviewed:false,decision:null,role:'reviewer'},
 'order-operations':{reference:'TRY-SAMPLE-42',item:'Kit de montaje',units:14,knownStock:24,committed:4,permission:true,providerOutcome:'uncertain',attempts:0,receipt:null,orders:[],role:'operator'},
 'customer-order-portal':{reference:'ORDER-SAMPLE-47',account:'Cuenta de muestra',currentRevision:5,visibleRevision:4,reviewedRevision:null,requestRevision:null,requested:false,status:'submitted',active:true,role:'customer'},
 'commerce-operations':{product:'Bolso de muestra',expectedAmount:210000,reportedAmount:210000,availableUnits:2,units:1,proofPresent:true,reported:false,confirmed:false,inventoryCommitted:false,fulfillment:'pending',role:'buyer'},
 'transport-settlement':{reference:'TRIP-SAMPLE-63',quantity:13.8,rate:54000,advance:160000,adjustmentA:5000,adjustmentB:6000,evidence:true,resolvedAdjustment:null,approved:false,role:'reviewer'},
 'operations-product-design':{advance:70000,supportedCost:45000,supportPresent:true,reviewed:false,role:'analyst'},
 'commercial-operations':{account:'Fabricante de muestra',signal:'explicit',sourceVerified:true,sourceFresh:true,routeReviewed:true,priorContact:false,suppressed:false,humanApproved:false,acknowledged:false,role:'reviewer'},
 'private-case-intake':{summary:'Conciliar un registro con sus soportes.',file:'muestra-proceso.pdf',fileAllowed:true,version:1,reviewedVersion:null,receipt:null,records:0,providerOutcome:'uncertain',role:'visitor'}
};
export function createScenario(caseId){if(!SCENARIO_IDS.includes(caseId))throw new RangeError('Unknown scenario');return{caseId,...clone(DEFAULTS[caseId]),history:[],lastIssue:null};}
const NUMBERS=new Set(['units','knownStock','committed','reportedAmount','expectedAmount','availableUnits','rate','advance','adjustmentA','adjustmentB','supportedCost','quantity']);
const PERIODS=new Set(['documentPeriod','expectedPeriod','referencePeriod']);
const ROLES={
 'evidence-workspace':['reviewer','contributor'],'document-consistency':['reviewer','viewer'],'order-operations':['operator','viewer'],
 'customer-order-portal':['customer','staff'],'commerce-operations':['buyer','admin'],'transport-settlement':['reviewer','supervisor','finance'],
 'operations-product-design':['analyst','reviewer'],'commercial-operations':['reviewer','viewer'],'private-case-intake':['visitor']
};
const EDITABLE={
 'evidence-workspace':['documentPeriod','attachment','role'],
 'document-consistency':['documentHolder','documentPeriod','readable','sourcePresent','role'],
 'order-operations':['units','permission','providerOutcome','role'],
 'customer-order-portal':['role'],
 'commerce-operations':['reportedAmount','proofPresent','role'],
 'transport-settlement':['quantity','rate','advance','adjustmentA','adjustmentB','evidence','role'],
 'operations-product-design':['advance','supportedCost','supportPresent','role'],
 'commercial-operations':['signal','sourceVerified','sourceFresh','routeReviewed','priorContact','suppressed','acknowledged','role'],
 'private-case-intake':['summary','fileAllowed','providerOutcome']
};
const result=(stage,issues,facts)=>({stage,issues,facts,category:stage==='invalid'?'invalid':['blocked','stale','conflict','access_revoked'].includes(stage)?'blocked':['ready','closed','confirmed','received','resolved','design_checked','prepared'].includes(stage)?'ready':'needs_review'});
function orderIssues(s){const issues=[];if(!positive(s.units)||!money(s.knownStock)||!money(s.committed)||s.committed>s.knownStock)issues.push('quantity_invalid');else if(s.units>s.knownStock-s.committed)issues.push('stock_insufficient');if(s.permission!==true)issues.push('permission_required');return issues;}
function transportIssues(s){const issues=[];if(typeof s.quantity!=='number'||!Number.isFinite(s.quantity)||s.quantity<=0||s.quantity>100000||![s.rate,s.advance,s.adjustmentA,s.adjustmentB].every(money)||s.rate===0||!Number.isSafeInteger(Math.round(s.quantity*s.rate)))issues.push('amount_invalid');if(s.evidence!==true)issues.push('evidence_missing');return issues;}
function intakeIssues(s){const issues=[];if(!text(s.summary)||s.summary.trim().length<10)issues.push('context_missing');if(s.fileAllowed!==true)issues.push('file_rejected');return issues;}
export function evaluateScenario(s){
 if(!s||!SCENARIO_IDS.includes(s.caseId))return result('invalid',['scenario_invalid'],{});
 let issues=[],facts={};
 switch(s.caseId){
 case'evidence-workspace':
  if(!period(s.expectedPeriod)||!period(s.documentPeriod))issues.push('period_invalid');
  else if(s.expectedPeriod!==s.documentPeriod)issues.push('period_mismatch');
  if(s.attachment!==true)issues.push('attachment_missing');if(s.reviewVersion!==s.version)issues.push('stale_revision');
  facts={expectedPeriod:s.expectedPeriod,documentPeriod:s.documentPeriod,version:s.version,reviewVersion:s.reviewVersion,approved:s.approvedVersion===s.version,archives:s.archives.length};
  return result(s.closed?'closed':issues.includes('period_invalid')?'invalid':issues.includes('stale_revision')?'stale':issues.length?'clarification':s.approvedVersion===s.version?'ready':'awaiting_review',issues,facts);
 case'document-consistency':
  if(s.readable!==true)issues.push('document_unreadable');if(s.sourcePresent!==true)issues.push('source_missing');
  if(!text(s.documentHolder)||!text(s.referenceHolder))issues.push('identity_missing');else if(s.documentHolder.trim().toLowerCase()!==s.referenceHolder.trim().toLowerCase())issues.push('identity_mismatch');
  if(!period(s.documentPeriod)||!period(s.referencePeriod))issues.push('period_invalid');else if(s.documentPeriod!==s.referencePeriod)issues.push('period_mismatch');
  facts={referenceHolder:s.referenceHolder,documentHolder:s.documentHolder,referencePeriod:s.referencePeriod,documentPeriod:s.documentPeriod,readable:s.readable,reviewed:s.reviewed,decision:s.decision};
  return result(issues.some(x=>['document_unreadable','source_missing','identity_missing','period_invalid'].includes(x))?'inconclusive':issues.length?'clarification':s.reviewed?'ready':'awaiting_review',issues,facts);
 case'order-operations':
  issues=orderIssues(s);facts={reference:s.reference,units:s.units,available:s.knownStock-s.committed,attempts:s.attempts,orders:s.orders.length,receipt:s.receipt?.status||'none'};
  return result(issues.includes('quantity_invalid')?'invalid':issues.length?'blocked':s.receipt?.status==='confirmed'?'confirmed':s.receipt?.status==='uncertain'?'uncertain':s.receipt?.status==='failed'?'review':'draft',issues,facts);
 case'customer-order-portal':
  if(s.role==='customer'&&!s.active)issues.push('access_revoked');if(s.requested&&s.reviewedRevision!==s.currentRevision)issues.push('stale_revision');
  facts=s.role==='customer'&&!s.active?{active:false,visibleOrders:0}:{reference:s.reference,currentRevision:s.currentRevision,visibleRevision:s.visibleRevision,requested:s.requested,status:s.status,active:s.active,visibleOrders:1};
  return result(issues.includes('access_revoked')?'access_revoked':s.status==='cancelled'?'resolved':issues.length?'stale':s.requested?'awaiting_review':'draft',issues,facts);
 case'commerce-operations':
  if(!positive(s.expectedAmount)||!money(s.reportedAmount)||!positive(s.units)||!money(s.availableUnits))issues.push('amount_invalid');
  if(s.reported&&s.reportedAmount!==s.expectedAmount)issues.push('amount_mismatch');if(s.reported&&!s.proofPresent)issues.push('evidence_missing');
  facts={expectedAmount:s.expectedAmount,reportedAmount:s.reportedAmount,reported:s.reported,confirmed:s.confirmed,stockRemaining:s.availableUnits-(s.inventoryCommitted?s.units:0),fulfillment:s.fulfillment};
  return result(issues.includes('amount_invalid')?'invalid':issues.length?'review':s.fulfillment==='prepared'?'prepared':s.confirmed?'confirmed':s.reported?'awaiting_review':'draft',issues,facts);
 case'transport-settlement':{
  issues=transportIssues(s);const gross=issues.includes('amount_invalid')?null:Math.round(s.quantity*s.rate),adjustment=s.resolvedAdjustment??(s.adjustmentA===s.adjustmentB?s.adjustmentA:null);
  if(adjustment===null)issues.push('reviews_disagree');const due=gross===null||adjustment===null?null:gross-s.advance-adjustment;if(due!==null&&due<0)issues.push('advance_exceeds_settlement');
  facts={quantity:s.quantity,gross,advance:s.advance,adjustmentA:s.adjustmentA,adjustmentB:s.adjustmentB,resolvedAdjustment:adjustment,due,approved:s.approved};
  return result(issues.includes('amount_invalid')?'invalid':issues.includes('reviews_disagree')?'conflict':issues.length?'review':s.approved?'ready':'awaiting_review',issues,facts);}
 case'operations-product-design':
  if(!money(s.advance)||!money(s.supportedCost))issues.push('amount_invalid');if(!s.supportPresent)issues.push('evidence_missing');
  facts={advance:s.advance,supportedCost:s.supportedCost,unsettledAdvance:issues.includes('amount_invalid')?null:Math.max(0,s.advance-s.supportedCost),additionalCost:issues.includes('amount_invalid')?null:Math.max(0,s.supportedCost-s.advance),reviewed:s.reviewed,productionProduct:false};
  return result(issues.includes('amount_invalid')?'invalid':s.reviewed&&!issues.length?'design_checked':'design_review',issues,facts);
 case'commercial-operations':{
  if(s.sourceVerified!==true)issues.push('source_unverified');if(s.sourceFresh!==true)issues.push('source_stale');if(s.routeReviewed!==true)issues.push('route_unreviewed');if(s.priorContact||s.acknowledged)issues.push('existing_history');if(s.suppressed)issues.push('suppressed');if(s.humanApproved!==true)issues.push('human_review_required');
  const tier=s.sourceVerified&&s.sourceFresh?(s.signal==='explicit'?'A':s.signal==='activity'?'B':'C'):'review';
  facts={tier,routeReviewed:s.routeReviewed,priorContact:s.priorContact||s.acknowledged,suppressed:s.suppressed,humanApproved:s.humanApproved,acknowledged:s.acknowledged,sent:0,meetings:0,sales:0};return result(s.suppressed||s.priorContact||s.acknowledged?'blocked':issues.length?'awaiting_review':'ready',issues,facts);}
 case'private-case-intake':
  issues=intakeIssues(s);if(s.reviewedVersion!==s.version)issues.push('review_required');facts={version:s.version,reviewedVersion:s.reviewedVersion,file:s.file,receipt:s.receipt?.reference||'none',receiptStatus:s.receipt?.status||'none',records:s.receipt?.status==='uncertain'?null:s.records,emailsSent:0,bookings:0};
  return result(s.receipt?.status==='received'?'received':s.receipt?.status==='uncertain'?'uncertain':issues.length?'awaiting_review':'prepared',issues,facts);
 }
}
export function transitionScenario(state,action={}){
 if(!state||!SCENARIO_IDS.includes(state.caseId))throw new RangeError('Unknown scenario');
 const s=clone(state);s.lastIssue=null;const fail=issue=>{s.lastIssue=issue;return finish();};
 const finish=()=>{s.history.push({sequence:s.history.length+1,action:action.type||'unknown',role:s.role,result:s.lastIssue||'recorded'});return s;};
 if(action.type==='set'){
  const {field,value}=action;if(!EDITABLE[s.caseId].includes(field))return fail('field_not_editable');
  if(field==='role'&&!ROLES[s.caseId].includes(value))return fail('role_invalid');
  if(NUMBERS.has(field)&&!(field==='quantity'?typeof value==='number'&&Number.isFinite(value)&&value>0:money(value)))return fail('number_invalid');
  if(PERIODS.has(field)&&!period(value))return fail('period_invalid');
  if(typeof DEFAULTS[s.caseId][field]==='boolean'&&typeof value!=='boolean')return fail('boolean_required');
  if(field==='providerOutcome'&&!['uncertain','confirmed','failed'].includes(value))return fail('provider_invalid');
  if(field==='signal'&&!['explicit','activity','fit'].includes(value))return fail('signal_invalid');
  if(['summary','documentHolder'].includes(field)&&!text(value))return fail('text_invalid');
  if(s.caseId==='private-case-intake'&&s.receipt?.status==='received')return fail('record_locked');
  if(s.caseId==='private-case-intake'&&s.receipt&&field!=='providerOutcome')return fail('record_locked');
  if(s.caseId==='commerce-operations'&&s.confirmed&&field!=='role')return fail('record_locked');
  if(s.caseId==='evidence-workspace'&&s.closed)return fail('record_closed');
  if(s[field]===value)return finish();s[field]=value;
  if(s.caseId==='evidence-workspace'&&field!=='role'){s.version++;s.approvedVersion=null;s.reviewVersion=s.version;}
  if(s.caseId==='document-consistency'&&field!=='role'){s.reviewed=false;s.decision=null;}
  if(s.caseId==='transport-settlement'&&field!=='role'){s.resolvedAdjustment=null;s.approved=false;}
  if(s.caseId==='operations-product-design'&&field!=='role')s.reviewed=false;
  if(s.caseId==='commercial-operations'&&field!=='role')s.humanApproved=false;
  if(s.caseId==='private-case-intake'&&field!=='providerOutcome'){s.version++;s.reviewedVersion=null;}
  return finish();
 }
 switch(s.caseId){
 case'evidence-workspace':
  if(action.type==='correct'){if(s.closed)return fail('record_closed');s.documentPeriod=s.expectedPeriod;s.version++;s.reviewVersion=s.version;s.approvedVersion=null;}
  else if(action.type==='stale')s.reviewVersion=Math.max(1,s.version-1);
  else if(action.type==='refresh')s.reviewVersion=s.version;
  else if(action.type==='approve'){if(s.role!=='reviewer')return fail('reviewer_required');if(evaluateScenario(s).issues.length)return fail('resolve_checks_first');s.approvedVersion=s.version;}
  else if(action.type==='close'){if(s.role!=='reviewer')return fail('reviewer_required');if(s.closed)return finish();if(s.approvedVersion!==s.version||evaluateScenario(s).issues.length)return fail('approval_required');s.archives.push({closure:s.archives.length+1,version:s.version,period:s.documentPeriod});s.closed=true;}
  else if(action.type==='reopen'){if(s.role!=='reviewer')return fail('reviewer_required');if(!s.closed)return fail('not_closed');s.closed=false;s.version++;s.reviewVersion=s.version;s.approvedVersion=null;}
  else return fail('unknown_action');break;
 case'document-consistency':
  if(action.type==='correct'){s.documentHolder=s.referenceHolder;s.documentPeriod=s.referencePeriod;s.readable=true;s.reviewed=false;s.decision=null;}
  else if(action.type==='review'){if(s.role!=='reviewer')return fail('reviewer_required');s.reviewed=true;s.decision=evaluateScenario(s).issues.length?'clarification':'document_consistent';}
  else return fail('unknown_action');break;
 case'order-operations':{
  if(s.role!=='operator')return fail('operator_required');const issues=orderIssues(s);if(issues.length)return fail(issues[0]);const signature=JSON.stringify({units:s.units});if(s.receipt&&s.receipt.signature!==signature)return fail('reference_conflict');
  if(action.type==='submit'){
   if(s.receipt&&s.receipt.signature!==signature)return fail('reference_conflict');
   if(s.receipt?.status==='confirmed')return finish();
   if(s.receipt?.status==='uncertain')return fail('inspect_before_retry');
   s.attempts++;s.receipt={reference:s.reference,signature,status:s.providerOutcome};
  }else if(action.type==='check'){if(!s.receipt)return fail('receipt_missing');s.receipt.status=s.providerOutcome;}
  else return fail('unknown_action');
  if(s.receipt.status==='confirmed'&&!s.orders.some(x=>x.reference===s.reference))s.orders.push({reference:s.reference,units:s.units});break;}
 case'customer-order-portal':
  if(action.type==='request'){if(s.role!=='customer')return fail('customer_required');if(!s.active)return fail('access_revoked');if(s.status==='cancelled')return finish();s.requested=true;s.requestRevision=s.visibleRevision;s.status='on_hold';}
  else if(action.type==='refresh'){s.visibleRevision=s.currentRevision;if(s.role==='staff')s.reviewedRevision=s.currentRevision;}
  else if(action.type==='resolve'){if(s.role!=='staff')return fail('staff_required');if(!s.requested)return fail('request_missing');if(s.reviewedRevision!==s.currentRevision)return fail('stale_revision');if(s.status==='cancelled')return finish();s.status='cancelled';s.currentRevision++;s.visibleRevision=s.currentRevision;s.reviewedRevision=s.currentRevision;}
  else if(action.type==='revoke'){if(s.role!=='staff')return fail('staff_required');s.active=false;}
  else return fail('unknown_action');break;
 case'commerce-operations':
  if(action.type==='report'){if(s.role!=='buyer')return fail('buyer_required');if(s.confirmed)return finish();s.reported=true;}
  else if(action.type==='confirm'){if(s.role!=='admin')return fail('admin_required');if(s.confirmed)return finish();if(!s.reported)return fail('report_missing');if(evaluateScenario(s).issues.length)return fail('resolve_checks_first');if(s.availableUnits<s.units)return fail('stock_insufficient');s.confirmed=true;s.inventoryCommitted=true;}
  else if(action.type==='prepare'){if(s.role!=='admin')return fail('admin_required');if(!s.confirmed)return fail('payment_unconfirmed');s.fulfillment='prepared';}
  else return fail('unknown_action');break;
 case'transport-settlement':
  if(transportIssues(s).length)return fail('resolve_checks_first');
  if(action.type==='resolve'){if(s.role!=='supervisor')return fail('supervisor_required');if(!['first','second'].includes(action.choice))return fail('choice_required');s.resolvedAdjustment=action.choice==='first'?s.adjustmentA:s.adjustmentB;s.approved=false;}
  else if(action.type==='approve'){if(s.role!=='finance')return fail('finance_required');if(evaluateScenario(s).issues.length)return fail('resolve_checks_first');s.approved=true;}
  else return fail('unknown_action');break;
 case'operations-product-design':
  if(action.type!=='review')return fail('unknown_action');if(s.role!=='reviewer')return fail('reviewer_required');if(evaluateScenario(s).issues.length)return fail('resolve_checks_first');s.reviewed=true;break;
 case'commercial-operations':
  if(action.type!=='approve')return fail('unknown_action');if(s.role!=='reviewer')return fail('reviewer_required');if(s.suppressed)return fail('suppressed');if(s.priorContact||s.acknowledged)return fail('existing_history');if(!s.sourceVerified||!s.sourceFresh||!s.routeReviewed)return fail('resolve_checks_first');s.humanApproved=true;break;
 case'private-case-intake':
  if(action.type==='review'){if(intakeIssues(s).length)return fail('resolve_checks_first');s.reviewedVersion=s.version;}
  else if(action.type==='submit'){if(s.reviewedVersion!==s.version)return fail('review_required');if(intakeIssues(s).length)return fail('resolve_checks_first');if(s.receipt?.status==='received')return finish();if(s.receipt?.status==='uncertain')return fail('inspect_before_retry');s.receipt={reference:'CASE-SAMPLE-48',status:s.providerOutcome==='confirmed'?'received':s.providerOutcome};if(s.receipt.status==='received')s.records=1;}
  else if(action.type==='check'){if(!s.receipt)return fail('receipt_missing');s.receipt.status=s.providerOutcome==='confirmed'?'received':s.providerOutcome;if(s.receipt.status==='received')s.records=1;}
  else return fail('unknown_action');break;
 }
 return finish();
}
