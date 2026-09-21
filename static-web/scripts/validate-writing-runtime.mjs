import fs from 'node:fs';
import path from 'node:path';
import {
  inspectWritingSyntheticTasks,
  listWritingSyntheticTasks
} from '../src/lib/englishWritingSynthetic.mjs';
import {
  WRITING_REVIEW_RETURN_SCHEMA,
  WRITING_REPAIR_RETURN_SCHEMA,
  WRITING_STATES,
  WRITING_REPAIR_CONTINUATIONS,
  createInitialWritingRecord,
  lockFirstAttempt,
  buildWritingReviewPacket,
  validateWritingReviewReturn,
  applyWritingReviewReturn,
  lockWritingRegeneration,
  buildWritingRepairCheckPacket,
  validateWritingRepairReturn,
  applyWritingRepairReturn,
  syntheticTaskQualifiesForColdStartExit
} from '../src/lib/writingRuntimeModel.mjs';

const failures = [];
function check(condition, code) {
  if (!condition) failures.push(code);
}
function expectThrow(fn, code) {
  try { fn(); failures.push(`${code}:DID_NOT_THROW`); }
  catch { /* expected */ }
}
function forbiddenPaths(value, prefix = '') {
  const forbidden = new Set(['answer', 'answers', 'analysis', 'reference', 'reference_answer', 'sample_answer', 'model_answer', 'solution']);
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((child, index) => forbiddenPaths(child, `${prefix}[${index}]`));
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (forbidden.has(String(key).toLowerCase())) hits.push(next);
    hits.push(...forbiddenPaths(child, next));
  }
  return hits;
}

const source = inspectWritingSyntheticTasks();
const tasks = listWritingSyntheticTasks();
check(source.status === 'ready', `SYNTHETIC_SOURCE:${source.status}`);
check(tasks.length === 10, `SYNTHETIC_TASK_COUNT:${tasks.length}`);
check(tasks.filter((task) => task.kind === 'small').length === 4, `SYNTHETIC_SMALL_COUNT:${tasks.filter((task) => task.kind === 'small').length}`);
check(tasks.filter((task) => task.kind === 'big').length === 6, `SYNTHETIC_BIG_COUNT:${tasks.filter((task) => task.kind === 'big').length}`);
check(tasks.filter((task) => task.evidenceRole === 'CALIBRATION').length === 2, `SYNTHETIC_CALIBRATION_COUNT:${tasks.filter((task) => task.evidenceRole === 'CALIBRATION').length}`);
check(tasks.every((task) => task.sourceKind === 'synthetic'), 'TRUE_EXAM_CONSUMPTION');
check(tasks.every((task) => forbiddenPaths(task).length === 0), 'SYNTHETIC_LEARNER_LEAK');

const small = tasks.find((task) => task.kind === 'small' && task.evidenceRole === 'CALIBRATION');
const big = tasks.find((task) => task.kind === 'big' && task.evidenceRole === 'CALIBRATION');
check(Boolean(small && big), 'SYNTHETIC_KIND_COVERAGE');

const t0 = '2026-09-12T12:00:00.000Z';
const t1 = '2026-09-12T12:05:00.000Z';
const t2 = '2026-09-12T12:10:00.000Z';
const t3 = '2026-09-12T12:15:00.000Z';

let planned = createInitialWritingRecord(small, [], t0);
planned.binding = { source_hash: small.sourceHash, prior_exposure: 'unknown', assistance: 'unassisted', legacy_unversioned: false };
expectThrow(() => lockFirstAttempt(planned, { planMode: 'planned', firstPlan: '', firstDraft: 'Complete draft.' }, t1), 'PLANNED_MODE_MUST_CAPTURE_REAL_PLAN');
planned = lockFirstAttempt(planned, {
  planMode: 'planned',
  firstPlan: 'inform change -> bring device -> reply if absent',
  firstDraft: 'Dear students, this is a complete synthetic first draft for runtime validation.'
}, t1);
check(planned.state === WRITING_STATES.REVIEW_PENDING, `PLANNED_LOCK_STATE:${planned.state}`);
check(planned.firstPlan === 'inform change -> bring device -> reply if absent', 'FIRST_PLAN_NOT_PRESERVED');
check(planned.firstDraft.includes('complete synthetic first draft'), 'FIRST_DRAFT_NOT_PRESERVED');

let direct = createInitialWritingRecord(big, [], t0);
direct.binding = { source_hash: big.sourceHash, prior_exposure: 'unknown', assistance: 'unassisted', legacy_unversioned: false };
direct = lockFirstAttempt(direct, {
  planMode: 'direct',
  firstPlan: '',
  firstDraft: 'A complete essay produced without a separate explicit plan.'
}, t1);
check(direct.state === WRITING_STATES.REVIEW_PENDING, `DIRECT_LOCK_STATE:${direct.state}`);
check(direct.planMode === 'direct' && direct.firstPlan === '', 'DIRECT_MODE_MANUFACTURED_PLAN');

const reviewPacket = buildWritingReviewPacket(small, planned);
check(reviewPacket.reviewContract.learnerUnit === 'one complete essay', 'REVIEW_UNIT_NOT_WHOLE_ESSAY');
check(reviewPacket.reviewContract.acceptableWorkCanPassWithoutRepair === true, 'NO_EXPLICIT_PASS_PATH');
check(reviewPacket.reviewContract.noCosmeticRepairDebt === true, 'COSMETIC_REPAIR_DEBT_ALLOWED');
check(forbiddenPaths(reviewPacket).length === 0, `REVIEW_PACKET_LEAK:${forbiddenPaths(reviewPacket).join('|')}`);

const passReturn = validateWritingReviewReturn({
  schema: WRITING_REVIEW_RETURN_SCHEMA,
  taskId: small.id,
  reviewOf: 'FIRST_DRAFT',
  attemptSubmittedAt: planned.firstSubmittedAt,
  sourceHash: small.sourceHash,
  verdict: 'PASS_ACCEPTABLE',
  firstFailureLayer: null,
  repairScope: null,
  smallestRepair: null,
  reason: 'Task, content, structure, language and register are sufficiently stable.'
}, small.id);
const passed = applyWritingReviewReturn(planned, passReturn, t2);
check(passed.state === WRITING_STATES.PASS_ACCEPTABLE, `PASS_STATE:${passed.state}`);
check(passed.transferCandidate === null, 'PASS_CREATED_TRANSFER_DEBT');
check(syntheticTaskQualifiesForColdStartExit(passed), 'PASS_NOT_COLD_START_EXIT');

const repairReturn = validateWritingReviewReturn({
  schema: WRITING_REVIEW_RETURN_SCHEMA,
  taskId: big.id,
  reviewOf: 'FIRST_DRAFT',
  attemptSubmittedAt: direct.firstSubmittedAt,
  sourceHash: big.sourceHash,
  verdict: 'REPAIR_NEEDED',
  firstFailureLayer: 'Content',
  repairScope: 'development after the core message',
  smallestRepair: 'Add one mechanism explaining why shared coordination reduces duplicated effort.',
  reason: 'The essay has a usable message but the central claim is asserted rather than developed.'
}, big.id);
let repairRecord = applyWritingReviewReturn(direct, repairReturn, t2);
check(repairRecord.state === WRITING_STATES.REPAIR_NEEDED, `REPAIR_ROUTE_STATE:${repairRecord.state}`);
repairRecord = lockWritingRegeneration(repairRecord, 'Coordination reduces duplicated search because responsibilities are divided and everyone works from one shared outline.', t3);
check(repairRecord.state === WRITING_STATES.REPAIR_CHECK_PENDING, `REGEN_STATE:${repairRecord.state}`);
const repairPacket = buildWritingRepairCheckPacket(big, repairRecord);
check(repairPacket.repairCheckContract.samePromptSuccessIsRepairEvidenceNotTransferClosure === true, 'SAME_PROMPT_CLOSURE_ALLOWED');
check(repairPacket.repairCheckContract.noAutomaticTransferDebt === true, 'AUTO_TRANSFER_DEBT_ALLOWED');
check(repairPacket.firstMeaningfulPlanning.mode === 'direct', 'DIRECT_FIRST_EVIDENCE_LOST_IN_REPAIR_PACKET');
check(forbiddenPaths(repairPacket).length === 0, `REPAIR_PACKET_LEAK:${forbiddenPaths(repairPacket).join('|')}`);

const completeNoDebt = validateWritingRepairReturn({
  schema: WRITING_REPAIR_RETURN_SCHEMA,
  taskId: big.id,
  repairOf: 'REGENERATION',
  attemptSubmittedAt: repairRecord.firstSubmittedAt,
  regenerationSubmittedAt: repairRecord.regenerationSubmittedAt,
  sourceHash: big.sourceHash,
  verdict: 'REPAIR_COMPLETE',
  reason: 'The named development gap is now repaired.',
  memoryAdmission: { admit: false }
}, repairRecord);
const repaired = applyWritingRepairReturn(repairRecord, completeNoDebt, t3);
check(repaired.state === WRITING_STATES.REPAIR_COMPLETE, `REPAIR_COMPLETE_STATE:${repaired.state}`);
check(repaired.transferCandidate === null, 'REPAIR_COMPLETE_MANUFACTURED_TRANSFER');
check(syntheticTaskQualifiesForColdStartExit(repaired), 'REPAIR_COMPLETE_NOT_COLD_START_EXIT');

const completeWithTarget = validateWritingRepairReturn({
  schema: WRITING_REPAIR_RETURN_SCHEMA,
  taskId: big.id,
  repairOf: 'REGENERATION',
  attemptSubmittedAt: repairRecord.firstSubmittedAt,
  regenerationSubmittedAt: repairRecord.regenerationSubmittedAt,
  sourceHash: big.sourceHash,
  verdict: 'REPAIR_COMPLETE',
  reason: 'The repair works, but the repeated generation problem is reusable across prompts.',
  memoryAdmission: {
    admit: true,
    targetId: 'writing-content-mechanism-v1',
    label: 'Develop a claim with mechanism rather than slogan repetition',
    underlyingDemand: 'When making an abstract claim, generate at least one causal or operational link that adds information.'
  }
}, repairRecord);
const pending = applyWritingRepairReturn(repairRecord, completeWithTarget, t3);
check(pending.state === WRITING_STATES.TRANSFER_PENDING, `TRANSFER_PENDING_STATE:${pending.state}`);
check(pending.transferCandidate?.targetId === 'writing-content-mechanism-v1', 'TRANSFER_TARGET_NOT_PRESERVED');
check(syntheticTaskQualifiesForColdStartExit(pending), 'TRANSFER_PENDING_NOT_COLD_START_EXIT');

const stillDownstream = validateWritingRepairReturn({
  schema: WRITING_REPAIR_RETURN_SCHEMA,
  taskId: big.id,
  repairOf: 'REGENERATION',
  attemptSubmittedAt: repairRecord.firstSubmittedAt,
  regenerationSubmittedAt: repairRecord.regenerationSubmittedAt,
  sourceHash: big.sourceHash,
  verdict: 'REPAIR_STILL_NEEDED',
  continuation: WRITING_REPAIR_CONTINUATIONS.INDEPENDENT_DOWNSTREAM,
  nextFailureLayer: 'Language',
  repairScope: 'two sentences realizing the repaired mechanism',
  smallestRepair: 'Split the overloaded sentence and realize the causal relation with one stable connector.',
  reason: 'The Content repair succeeded; an independent downstream realization problem remains.'
}, repairRecord);
const continued = applyWritingRepairReturn(repairRecord, stillDownstream, t3);
check(continued.state === WRITING_STATES.REPAIR_NEEDED, `DOWNSTREAM_CONTINUATION_STATE:${continued.state}`);
check(continued.reviewReturn.firstFailureLayer === 'Language', `DOWNSTREAM_LAYER:${continued.reviewReturn.firstFailureLayer}`);
check(continued.repairHistory.length === 1, `REPAIR_HISTORY:${continued.repairHistory.length}`);

expectThrow(() => validateWritingRepairReturn({
  schema: WRITING_REPAIR_RETURN_SCHEMA,
  taskId: big.id,
  repairOf: 'REGENERATION',
  attemptSubmittedAt: repairRecord.firstSubmittedAt,
  regenerationSubmittedAt: repairRecord.regenerationSubmittedAt,
  sourceHash: big.sourceHash,
  verdict: 'REPAIR_STILL_NEEDED',
  continuation: WRITING_REPAIR_CONTINUATIONS.INDEPENDENT_DOWNSTREAM,
  nextFailureLayer: 'Task',
  repairScope: 'whole task model',
  smallestRepair: 'rebuild the task model',
  reason: 'This should be rejected because Task is upstream of Content.'
}, repairRecord), 'CASCADE_UPSTREAM_REWRITE_MUST_BE_REJECTED');

const workspacePath = path.resolve(process.cwd(), 'src/components/WritingWorkspace.astro');
const homePath = path.resolve(process.cwd(), 'src/pages/writing.astro');
const routePath = path.resolve(process.cwd(), 'src/pages/writing/[id].astro');
for (const [file, code] of [[workspacePath, 'WORKSPACE'], [homePath, 'HOME'], [routePath, 'ROUTE']]) {
  check(fs.existsSync(file), `${code}_MISSING`);
}
if (fs.existsSync(workspacePath)) {
  const workspace = fs.readFileSync(workspacePath, 'utf8');
  check(workspace.includes('data-copy-review') && workspace.includes('data-import-review'), 'CHAT_REVIEW_NOT_EXECUTABLE');
  check(workspace.includes('data-lock-regeneration') && workspace.includes('data-copy-repair'), 'REGEN_REPAIR_CHECK_NOT_EXECUTABLE');
  check(workspace.includes('PASS / ACCEPTABLE'), 'PASS_UI_MISSING');
  check(workspace.includes('REPAIR_COMPLETE'), 'NO_DEBT_REPAIR_EXIT_UI_MISSING');
  check(workspace.includes('TRANSFER_PENDING'), 'TRANSFER_PENDING_UI_MISSING');
  check(!workspace.includes('model_answer') && !workspace.includes('sample_answer'), 'WORKSPACE_MODEL_ANSWER_LEAK');
  check(!/scoreEssay|localScore|autoScore/i.test(workspace), 'FAKE_LOCAL_SCORING_PRESENT');
}

const validation = {
  schema: 'kianos.english.writing.runtime-gate-validation.v1',
  gate: 'R',
  pass: failures.length === 0,
  source: {
    syntheticTaskOwner: source.sourcePath,
    syntheticTaskHash: source.sourceHash,
    taskCount: source.taskCount
  },
  semantics: {
    learnerUnit: 'one complete essay',
    firstEvidencePreserved: true,
    explicitPassWithoutRepairDebt: true,
    semanticJudgment: 'Chat-mediated',
    fakeLocalScoring: false,
    earliestFailureThenSmallestRepair: true,
    learnerRegenerationRequired: true,
    samePromptRepairDoesNotCloseTransfer: true,
    automaticTransferDebt: false,
    independentDownstreamFailureSupported: true,
    protectedTrueExamConsumed: false
  },
  failures,
  note: 'A green validator is evidence for Runtime behavior only. It does not by itself prove Evidence closure or User Validation.'
};

console.log(`${JSON.stringify(validation, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
