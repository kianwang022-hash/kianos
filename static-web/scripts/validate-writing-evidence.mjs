import fs from 'node:fs';
import path from 'node:path';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import {
  WRITING_REVIEW_RETURN_SCHEMA,
  WRITING_REPAIR_RETURN_SCHEMA,
  createInitialWritingRecord,
  lockFirstAttempt,
  validateWritingReviewReturn,
  applyWritingReviewReturn,
  lockWritingRegeneration,
  validateWritingRepairReturn,
  applyWritingRepairReturn
} from '../src/lib/writingRuntimeModel.mjs';
import {
  WRITING_EVIDENCE_LEDGER_SCHEMA,
  WRITING_TRANSFER_RETURN_SCHEMA,
  WRITING_TRANSFER_STATUS,
  createWritingEvidenceLedger,
  summarizeWritingEvidenceLedger,
  admitWritingTransferCandidate,
  listEligibleWritingTransferTargets,
  buildWritingTransferCheckPacket,
  validateWritingTransferReturn,
  applyWritingTransferReturn
} from '../src/lib/writingEvidenceModel.mjs';

const failures = [];
function check(condition, code) {
  if (!condition) failures.push(code);
}
function expectThrow(fn, code) {
  try { fn(); failures.push(`${code}:DID_NOT_THROW`); }
  catch { /* expected */ }
}

const tasks = listWritingSyntheticTasks();
const small = tasks.find((task) => task.kind === 'small');
const big = tasks.find((task) => task.kind === 'big');
check(Boolean(small && big), 'SYNTHETIC_TASKS_REQUIRED');
check(tasks.every((task) => task.sourceKind === 'synthetic'), 'PROTECTED_TRUE_EXAM_CONSUMED');

const t0 = '2026-09-12T12:00:00.000Z';
const t1 = '2026-09-12T12:05:00.000Z';
const t2 = '2026-09-12T12:10:00.000Z';
const t3 = '2026-09-12T12:15:00.000Z';
const t4 = '2026-09-12T13:00:00.000Z';
const t5 = '2026-09-12T14:00:00.000Z';
const t6 = '2026-09-12T15:00:00.000Z';

function completeFreshTask(task, id, firstDraft, at) {
  const freshTask = { ...task, id };
  let record = createInitialWritingRecord(freshTask, [], at);
  record = lockFirstAttempt(record, {
    planMode: 'direct',
    firstPlan: '',
    firstDraft
  }, at);
  const passReturn = validateWritingReviewReturn({
    schema: WRITING_REVIEW_RETURN_SCHEMA,
    taskId: freshTask.id,
    reviewOf: 'FIRST_DRAFT',
    verdict: 'PASS_ACCEPTABLE',
    firstFailureLayer: null,
    repairScope: null,
    smallestRepair: null,
    reason: 'Synthetic fresh task is complete enough for evidence-gate validation.'
  }, freshTask.id);
  record = applyWritingReviewReturn(record, passReturn, at);
  return { task: freshTask, record };
}

let origin = createInitialWritingRecord(big, [], t0);
origin = lockFirstAttempt(origin, {
  planMode: 'direct',
  firstPlan: '',
  firstDraft: 'People should cooperate because cooperation is important. Cooperation helps everyone.'
}, t1);
const rootReview = validateWritingReviewReturn({
  schema: WRITING_REVIEW_RETURN_SCHEMA,
  taskId: big.id,
  reviewOf: 'FIRST_DRAFT',
  verdict: 'REPAIR_NEEDED',
  firstFailureLayer: 'Content',
  repairScope: 'central claim development',
  smallestRepair: 'Add one causal or operational link instead of repeating the slogan.',
  reason: 'The claim is asserted but not developed.'
}, big.id);
origin = applyWritingReviewReturn(origin, rootReview, t2);
origin = lockWritingRegeneration(origin, 'Shared coordination reduces duplicated work because responsibilities are divided and each person contributes a distinct part.', t3);
const originRepair = validateWritingRepairReturn({
  schema: WRITING_REPAIR_RETURN_SCHEMA,
  taskId: big.id,
  repairOf: 'REGENERATION',
  verdict: 'REPAIR_COMPLETE',
  reason: 'The named content gap is repaired.',
  memoryAdmission: {
    admit: true,
    targetId: 'writing-content-mechanism-v1',
    label: 'Develop abstract claims with a real mechanism',
    underlyingDemand: 'When making an abstract claim, generate at least one causal or operational link that adds information.'
  }
}, origin);
origin = applyWritingRepairReturn(origin, originRepair, t3);
check(origin.state === 'TRANSFER_PENDING', `ORIGIN_NOT_TRANSFER_PENDING:${origin.state}`);

let ledger = createWritingEvidenceLedger();
ledger = admitWritingTransferCandidate(ledger, big, origin, t3);
check(ledger.schema === WRITING_EVIDENCE_LEDGER_SCHEMA, `LEDGER_SCHEMA:${ledger.schema}`);
check(ledger.targets.length === 1, `ADMISSION_COUNT:${ledger.targets.length}`);
const target = ledger.targets[0];
check(target.status === WRITING_TRANSFER_STATUS.PENDING, `ADMISSION_STATUS:${target.status}`);
check(target.originEvidence?.firstDraft === origin.firstDraft, 'ORIGIN_FIRST_DRAFT_NOT_PRESERVED');
check(target.originEvidence?.finalDiagnosis?.firstFailureLayer === 'Content', 'ROOT_DIAGNOSIS_NOT_PRESERVED');
check(target.originEvidence?.finalRepairReturn?.verdict === 'REPAIR_COMPLETE', 'COMPLETED_REPAIR_EVIDENCE_NOT_PRESERVED');

const duplicate = admitWritingTransferCandidate(ledger, big, origin, t3);
check(duplicate.targets.length === 1, `DUPLICATE_ADMISSION:${duplicate.targets.length}`);
check(listEligibleWritingTransferTargets(ledger, big, origin).length === 0, 'SAME_PROMPT_BECAME_TRANSFER_EVIDENCE');
expectThrow(() => buildWritingTransferCheckPacket(big, origin, target), 'SAME_PROMPT_PACKET_MUST_FAIL');

const fresh1 = completeFreshTask(
  small,
  `${small.id}-fresh-support`,
  'The event matters because it gives students one shared place to compare progress, although the mechanism is only briefly stated.',
  t4
);
let eligible = listEligibleWritingTransferTargets(ledger, fresh1.task, fresh1.record);
check(eligible.length === 1, `FRESH_SUPPORT_ELIGIBLE:${eligible.length}`);
let packet = buildWritingTransferCheckPacket(fresh1.task, fresh1.record, eligible[0]);
check(packet.transferContract.freshFirstDraftOutranksSamePromptRepair === true, 'FRESH_EVIDENCE_PRIORITY_MISSING');
check(packet.transferContract.closureUsesSemanticEvidenceNotCounters === true, 'COUNTER_BASED_CLOSURE_PRESENT');
check(packet.target.originEvidence?.finalRepairReturn?.verdict === 'REPAIR_COMPLETE', 'PACKET_LOST_ORIGIN_REPAIR');

const supportReturn = validateWritingTransferReturn({
  schema: WRITING_TRANSFER_RETURN_SCHEMA,
  targetId: target.targetId,
  freshTaskId: fresh1.task.id,
  evidenceId: packet.freshEvidence.evidenceId,
  judgedAgainst: 'FRESH_FIRST_DRAFT',
  verdict: 'SUPPORT',
  reason: 'The fresh first draft attempts causal development but the link is still thin.',
  evidenceAnchor: 'because it gives students one shared place to compare progress'
}, packet);
ledger = applyWritingTransferReturn(ledger, target.targetId, supportReturn, t4);
check(ledger.targets[0].status === WRITING_TRANSFER_STATUS.PENDING, 'SUPPORT_CLOSED_TARGET');
check(ledger.targets[0].events.length === 1, `SUPPORT_EVENT_COUNT:${ledger.targets[0].events.length}`);

const idempotent = applyWritingTransferReturn(ledger, target.targetId, supportReturn, t4);
check(idempotent.targets[0].events.length === 1, `IDEMPOTENT_DUPLICATED_EVENT:${idempotent.targets[0].events.length}`);
expectThrow(() => applyWritingTransferReturn(ledger, target.targetId, {
  ...supportReturn,
  verdict: 'CLOSE',
  reason: 'Conflicting mutation for identical evidence.'
}, t4), 'CONFLICTING_SAME_EVIDENCE_MUST_FAIL');

const fresh2 = completeFreshTask(
  small,
  `${small.id}-fresh-close`,
  'A shared calendar reduces missed deadlines because every member can see ownership, due dates, and changes in one place before acting.',
  t5
);
eligible = listEligibleWritingTransferTargets(ledger, fresh2.task, fresh2.record);
check(eligible.length === 1, `FRESH_CLOSE_ELIGIBLE:${eligible.length}`);
packet = buildWritingTransferCheckPacket(fresh2.task, fresh2.record, eligible[0]);
const closeReturn = validateWritingTransferReturn({
  schema: WRITING_TRANSFER_RETURN_SCHEMA,
  targetId: target.targetId,
  freshTaskId: fresh2.task.id,
  evidenceId: packet.freshEvidence.evidenceId,
  judgedAgainst: 'FRESH_FIRST_DRAFT',
  verdict: 'CLOSE',
  reason: 'A different fresh task independently develops the abstract claim through a concrete causal mechanism.',
  evidenceAnchor: 'reduces missed deadlines because every member can see ownership, due dates, and changes'
}, packet);
ledger = applyWritingTransferReturn(ledger, target.targetId, closeReturn, t5);
check(ledger.targets[0].status === WRITING_TRANSFER_STATUS.CLOSED, `CLOSE_STATUS:${ledger.targets[0].status}`);
check(Boolean(ledger.targets[0].closedAt), 'CLOSE_TIME_MISSING');

const fresh3 = completeFreshTask(
  small,
  `${small.id}-fresh-reopen`,
  'Teamwork is useful because teamwork is very useful and everyone should value teamwork.',
  t6
);
eligible = listEligibleWritingTransferTargets(ledger, fresh3.task, fresh3.record);
check(eligible.length === 1, `FRESH_REOPEN_ELIGIBLE:${eligible.length}`);
packet = buildWritingTransferCheckPacket(fresh3.task, fresh3.record, eligible[0]);
expectThrow(() => validateWritingTransferReturn({
  schema: WRITING_TRANSFER_RETURN_SCHEMA,
  targetId: target.targetId,
  freshTaskId: fresh3.task.id,
  evidenceId: packet.freshEvidence.evidenceId,
  judgedAgainst: 'FRESH_FIRST_DRAFT',
  verdict: 'CLOSE',
  reason: 'Closed targets cannot be closed again.',
  evidenceAnchor: 'teamwork is useful'
}, packet), 'CLOSED_TARGET_MUST_NOT_ACCEPT_CLOSE');
const reopenReturn = validateWritingTransferReturn({
  schema: WRITING_TRANSFER_RETURN_SCHEMA,
  targetId: target.targetId,
  freshTaskId: fresh3.task.id,
  evidenceId: packet.freshEvidence.evidenceId,
  judgedAgainst: 'FRESH_FIRST_DRAFT',
  verdict: 'REOPEN',
  reason: 'The same reusable weakness recurs in a later different first draft through slogan repetition without a mechanism.',
  evidenceAnchor: 'teamwork is useful because teamwork is very useful'
}, packet);
ledger = applyWritingTransferReturn(ledger, target.targetId, reopenReturn, t6);
check(ledger.targets[0].status === WRITING_TRANSFER_STATUS.PENDING, `REOPEN_STATUS:${ledger.targets[0].status}`);
check(Boolean(ledger.targets[0].reopenedAt), 'REOPEN_TIME_MISSING');

const irrelevantFresh = completeFreshTask(
  small,
  `${small.id}-fresh-irrelevant`,
  'Please bring your student card to Room 204 before 3 p.m. and reply if you cannot attend.',
  '2026-09-12T16:00:00.000Z'
);
eligible = listEligibleWritingTransferTargets(ledger, irrelevantFresh.task, irrelevantFresh.record);
packet = buildWritingTransferCheckPacket(irrelevantFresh.task, irrelevantFresh.record, eligible[0]);
const irrelevantReturn = validateWritingTransferReturn({
  schema: WRITING_TRANSFER_RETURN_SCHEMA,
  targetId: target.targetId,
  freshTaskId: irrelevantFresh.task.id,
  evidenceId: packet.freshEvidence.evidenceId,
  judgedAgainst: 'FRESH_FIRST_DRAFT',
  verdict: 'IRRELEVANT',
  reason: 'This notice does not meaningfully require development of an abstract claim with a mechanism.',
  evidenceAnchor: ''
}, packet);
ledger = applyWritingTransferReturn(ledger, target.targetId, irrelevantReturn, '2026-09-12T16:00:00.000Z');
check(ledger.targets[0].status === WRITING_TRANSFER_STATUS.PENDING, 'IRRELEVANT_MUTATED_TARGET_STATE');
check(listEligibleWritingTransferTargets(ledger, irrelevantFresh.task, irrelevantFresh.record).length === 0, 'IRRELEVANT_EVIDENCE_RECHECKED');

const summary = summarizeWritingEvidenceLedger(ledger);
check(summary.total === 1 && summary.pending === 1 && summary.closed === 0, `SUMMARY:${JSON.stringify(summary)}`);

const panelPath = path.resolve(process.cwd(), 'src/components/WritingEvidencePanel.astro');
const routePath = path.resolve(process.cwd(), 'src/pages/writing/[id].astro');
check(fs.existsSync(panelPath), 'WRITING_EVIDENCE_PANEL_MISSING');
check(fs.existsSync(routePath), 'WRITING_EVIDENCE_ROUTE_MISSING');
if (fs.existsSync(panelPath)) {
  const panel = fs.readFileSync(panelPath, 'utf8');
  check(panel.includes('kianos-writing-evidence-v1'), 'PRIVATE_LEDGER_STORAGE_MISSING');
  check(panel.includes('buildWritingTransferCheckPacket') && panel.includes('applyWritingTransferReturn'), 'TRANSFER_ROUNDTRIP_NOT_EXECUTABLE');
  check(panel.includes('same-prompt repair') && panel.includes('REOPEN'), 'TRANSFER_SEMANTIC_BOUNDARY_NOT_VISIBLE');
}
if (fs.existsSync(routePath)) {
  const route = fs.readFileSync(routePath, 'utf8');
  check(route.includes('WritingEvidencePanel'), 'WRITING_EVIDENCE_PANEL_NOT_ROUTED');
}

const validation = {
  schema: 'kianos.english.writing.evidence-gate-validation.v1',
  gate: 'E',
  pass: failures.length === 0,
  semantics: {
    privateLedger: true,
    originDiagnosisPreserved: true,
    completedRepairEvidencePreserved: true,
    samePromptRepairClosesTransfer: false,
    explicitMemoryAdmissionOnly: true,
    laterDifferentFirstDraftRequired: true,
    irrelevantEvidenceMutatesTarget: false,
    supportWithoutForcedClosure: true,
    semanticCloseWithoutCounters: true,
    conservativeReopenSameTarget: true,
    idempotentEvidenceApplication: true,
    protectedTrueExamConsumed: false
  },
  failures,
  note: 'A green E validator proves the executable Evidence semantics for the synthetic engineering path. It does not prove learner U or imply that Kian has performed any Writing transfer.'
};

console.log(`${JSON.stringify(validation, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
