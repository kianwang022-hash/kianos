import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXAM_CHAT_PLAN_KEY,
  EXAM_CHAT_PLAN_SCHEMA,
  buildExamChatPlanBasis,
  validateExamChatPlan,
  readExamChatPlan,
  writeExamChatPlan,
  examChatPlanEffectMatches
} from '../src/lib/examChatPlan.mjs';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = path.resolve(webRoot, '..');
const readWeb = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const readRepo = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const fail = (code, detail = '') => { throw new Error(`${code}${detail ? `:${detail}` : ''}`); };

const client = readWeb('src/lib/examOrchestratorClient.mjs');
const orchestrator = readWeb('src/lib/examOrchestrator.mjs');
const home = readWeb('src/components/ExamOrchestratorHome.astro');
const contract = readRepo('EXAM_ORCHESTRATOR_CONTRACT.md');

for (const forbidden of ['buildExamPlan(', 'readExamDemand(', "from './examDemand.mjs'"]) {
  if (client.includes(forbidden)) fail('PRODUCTION_WEB_STRATEGY_ENGINE_REMAINS', forbidden);
}
for (const required of ['readExamChatPlan', 'buildChatControlledExamReadModel', "root.dataset.strategyOwner = 'chat'"]) {
  if (!client.includes(required)) fail('CHAT_CONTROL_PRODUCTION_BINDING_MISSING', required);
}
// Chat ownership is a runtime/contract invariant, not mandatory learner-facing copy.
if (home.includes('保存并重排') || home.includes('自动重排三科')) fail('HOME_LOCAL_REPLAN_COPY_REGRESSION');
if (!contract.includes('## 0｜Current control boundary — Chat owns orchestration')) fail('CHAT_AUTHORITY_CONTRACT_MISSING');
if (orchestrator.includes('buildExamPlan')) fail('AUTONOMOUS_PLANNER_IMPLEMENTATION_REINTRODUCED');
if (fs.existsSync(path.join(webRoot, 'src/lib/examDemand.mjs'))) fail('AUTONOMOUS_DEMAND_READER_REINTRODUCED');
if (!contract.includes('It may not independently choose subject allocation, priority or next action.')) {
  fail('CHAT_ONLY_STRATEGY_CONTRACT_MISSING');
}

let futurePlanRejected = false;
try {
  validateExamChatPlan({
    schema: EXAM_CHAT_PLAN_SCHEMA,
    study_day: '2099-01-01',
    generated_at: '2099-01-01T00:00:00Z',
    subjects: {}
  }, '2099-01-01');
} catch (error) {
  futurePlanRejected = String(error?.message || '') === 'CHAT_PLAN_FUTURE_GENERATED_AT';
}
if (!futurePlanRejected) fail('FUTURE_CHAT_PLAN_MUST_REJECT_AT_NATIVE_OWNER');

const sample = validateExamChatPlan({
  schema: EXAM_CHAT_PLAN_SCHEMA,
  study_day: '2026-09-18',
  generated_at: '2026-09-18T04:30:00+08:00',
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: 'finish bounded first-pass work' },
    english: { target_minutes: 120, role: '保连续' },
    politics: { target_minutes: 90, role: '稳推进', session_ref: 'politics-session:demo' }
  },
  next_subject: 'xizong',
  attention: { text: '先完成西综当前 Block，再回英语。', action: '查看依据' },
  capacity: {
    state: 'REDUCED',
    summary: '上午高负荷后可用认知容量下降，但仍可继续推进。',
    basis: '当前主观状态 + 学习表现 + 可用 Health 上下文',
    load: '西综高负荷主块后出现恢复需求',
    action: '先做一次足量低输入恢复，再回到当前主线',
    recheck: '看下一学习块是否恢复持续注意和处理速度'
  }
}, '2026-09-18');

const nativeContinue = {
  xizong: { subject: 'xizong', href: '/xizong/', title: '西综' },
  english: { subject: 'english', href: '/english/', title: '英语' },
  politics: { subject: 'politics', href: '/politics/', title: '政治' }
};

const model = buildChatControlledExamReadModel({
  day: '2026-09-18',
  phase: { id: 'A', label: '一轮收口', outsideCycle: false },
  gate: { date: '2026-09-27', label: '一轮收口', daysRemaining: 9 },
  chatPlanState: { status: 'ready', plan: sample, error: null },
  dayCapacity: 600,
  actualBySubject: { xizong: 60, english: 30, politics: 0 },
  nativeContinue,
  readable: true
});

if (model?.control?.strategyOwner !== 'CHAT') fail('READ_MODEL_STRATEGY_OWNER_NOT_CHAT');
if (model?.next?.subject !== 'xizong') fail('CHAT_NEXT_SUBJECT_NOT_PRESERVED');
if (model?.subjects?.xizong?.targetMinutes !== 360) fail('CHAT_TARGET_NOT_PRESERVED');
if (model?.subjects?.xizong?.remainingMinutes !== 300) fail('CHAT_TARGET_FACT_ARITHMETIC_INVALID');
if (model?.subjects?.xizong?.requiredMinutes !== null || model?.subjects?.xizong?.scoreGap !== null) {
  fail('WEB_REINTRODUCED_STRATEGY_FIELDS');
}
if (sample.capacity?.state !== 'REDUCED'
    || !sample.capacity?.action?.includes('低输入恢复')
    || !sample.capacity?.recheck?.includes('下一学习块')) {
  fail('CAPACITY_PROJECTION_NOT_PRESERVED');
}

let pseudoScoreRejected = false;
try {
  validateExamChatPlan({
    schema: EXAM_CHAT_PLAN_SCHEMA,
    study_day: '2026-09-18',
    generated_at: '2026-09-18T04:30:00+08:00',
    subjects: {},
    capacity: {
      state: 'REDUCED',
      summary: 'test',
      readiness_score: 63
    }
  }, '2026-09-18');
} catch (error) {
  pseudoScoreRejected = String(error?.message || '').includes('must not contain a readiness/recovery score');
}
if (!pseudoScoreRejected) fail('CAPACITY_PSEUDO_SCORE_MUST_REJECT');

const missing = buildChatControlledExamReadModel({
  day: '2026-09-18',
  phase: { id: 'A', label: '一轮收口', outsideCycle: false },
  gate: null,
  chatPlanState: { status: 'missing', plan: null, error: null },
  dayCapacity: 600,
  actualBySubject: { xizong: 0, english: 0, politics: 0 },
  nativeContinue,
  readable: true
});
if (missing.next !== null) fail('MISSING_CHAT_PLAN_MUST_NOT_INFER_NEXT');
if (Object.values(missing.subjects).some((row) => row.targetMinutes !== null)) {
  fail('MISSING_CHAT_PLAN_MUST_NOT_INFER_ALLOCATION');
}
if (!missing.attention?.text?.includes('不自动替你分配三科')) fail('MISSING_PLAN_FAIL_CLOSED_COPY_MISSING');

const storage = {
  getItem() { return JSON.stringify({ ...sample, study_day: '2026-09-17' }); }
};
const stale = readExamChatPlan(storage, '2026-09-18');
if (stale.status !== 'stale' || stale.plan !== null) fail('STALE_PLAN_MUST_FAIL_CLOSED');

const staleProjection = buildChatControlledExamReadModel({
  day: '2026-09-18',
  chatPlanState: {
    status: 'stale',
    plan: null,
    presentation: {
      today_tasks: [{ id: 'old-task', label: 'old task' }],
      week_reference: [],
      schedule_blocks: [{ id: 'old-block', start: '10:00', end: null, label: 'old block' }]
    }
  },
  nativeContinue
});
if (staleProjection.presentation !== null) {
  fail('STALE_PLAN_PRESENTATION_MUST_FAIL_CLOSED');
}


class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const recoveryStorage = new MemoryStorage();
const recoveryBasis = buildExamChatPlanBasis(recoveryStorage, '2026-09-18');
const recoveryPlan = {
  ...sample,
  generated_at: '2026-09-18T05:00:00+08:00',
  learner_evidence_basis: recoveryBasis
};
recoveryStorage.setItem(EXAM_CHAT_PLAN_KEY, JSON.stringify({
  ...recoveryPlan,
  generated_at: '2099-01-01T00:00:00Z'
}));
if (readExamChatPlan(recoveryStorage, '2026-09-18').status !== 'invalid') {
  fail('FUTURE_POISONED_PLAN_MUST_NOT_READ_READY');
}
writeExamChatPlan(recoveryStorage, recoveryPlan, '2026-09-18');
const recoveredPlan = readExamChatPlan(recoveryStorage, '2026-09-18');
if (recoveredPlan.status !== 'ready'
    || Date.parse(recoveredPlan.plan?.generated_at || 0) !== Date.parse(recoveryPlan.generated_at)) {
  fail('VALID_PLAN_MUST_RECOVER_FROM_FUTURE_POISON');
}
if (!examChatPlanEffectMatches(recoveryStorage, recoveryPlan, '2026-09-18')) {
  fail('RECOVERED_PLAN_EFFECT_READBACK_MUST_MATCH');
}
recoveryStorage.removeItem(EXAM_CHAT_PLAN_KEY);
if (examChatPlanEffectMatches(recoveryStorage, recoveryPlan, '2026-09-18')) {
  fail('MISSING_PLAN_EFFECT_MUST_NOT_MATCH');
}

const evidenceStorage = new MemoryStorage();
const basisE0 = buildExamChatPlanBasis(evidenceStorage, '2026-09-18');
const e0Plan = {
  ...sample,
  generated_at: '2026-09-18T05:00:00+08:00',
  learner_evidence_basis: basisE0
};
writeExamChatPlan(evidenceStorage, e0Plan, '2026-09-18');
if (readExamChatPlan(evidenceStorage, '2026-09-18').status !== 'ready') {
  fail('CURRENT_BASIS_PLAN_MUST_BE_READY');
}

let olderPlanRejected = false;
try {
  writeExamChatPlan(evidenceStorage, {
    ...e0Plan,
    generated_at: '2026-09-18T04:59:00+08:00',
    subjects: { ...e0Plan.subjects, english: { target_minutes: 30, role: 'older' } }
  }, '2026-09-18');
} catch (error) {
  olderPlanRejected = String(error?.message || '') === 'CHAT_PLAN_OLDER_THAN_CURRENT';
}
if (!olderPlanRejected) fail('OLDER_SAME_DAY_PLAN_MUST_NOT_OVERWRITE_CURRENT');
const currentAfterOlderReject = readExamChatPlan(evidenceStorage, '2026-09-18').plan;
if (!currentAfterOlderReject
    || Date.parse(currentAfterOlderReject.generated_at) !== Date.parse(e0Plan.generated_at)) {
  fail('OLDER_PLAN_REJECTION_MUST_PRESERVE_CURRENT');
}

const idempotentPlan = writeExamChatPlan(evidenceStorage, e0Plan, '2026-09-18');
if (Date.parse(idempotentPlan.generated_at) !== Date.parse(e0Plan.generated_at)) fail('IDENTICAL_PLAN_REPLAY_MUST_BE_IDEMPOTENT');

let sameGenerationConflictRejected = false;
try {
  writeExamChatPlan(evidenceStorage, {
    ...e0Plan,
    subjects: { ...e0Plan.subjects, english: { target_minutes: 31, role: 'conflict' } }
  }, '2026-09-18');
} catch (error) {
  sameGenerationConflictRejected = String(error?.message || '') === 'CHAT_PLAN_GENERATION_CONFLICT';
}
if (!sameGenerationConflictRejected) fail('SAME_GENERATION_CONFLICT_MUST_REJECT');

evidenceStorage.setItem('kianos-politics-evidence-v1', JSON.stringify([{
  schema: 'kianos.politics.analysis-evidence.v1',
  event_id: 'basis-e1-blocker',
  study_day: '2026-09-18',
  observed_at: '2026-09-18T05:10:00+08:00',
  verdict: 'BROKEN'
}]));
const staleAfterPoliticsEvidence = readExamChatPlan(evidenceStorage, '2026-09-18');
if (staleAfterPoliticsEvidence.status !== 'stale'
    || !String(staleAfterPoliticsEvidence.error || '').includes('CHAT_PLAN_EVIDENCE_BASIS_STALE')) {
  fail('NEW_POLITICS_EVIDENCE_MUST_STALE_OLD_PLAN', JSON.stringify(staleAfterPoliticsEvidence));
}
let staleWriteRejected = false;
try {
  writeExamChatPlan(evidenceStorage, {
    ...e0Plan,
    generated_at: '2026-09-18T05:11:00+08:00'
  }, '2026-09-18');
} catch (error) {
  staleWriteRejected = String(error?.message || '').includes('CHAT_PLAN_EVIDENCE_BASIS_STALE');
}
if (!staleWriteRejected) fail('STALE_BASIS_REIMPORT_MUST_FAIL_CLOSED');

const basisE1 = buildExamChatPlanBasis(evidenceStorage, '2026-09-18');
const e1Plan = {
  ...e0Plan,
  generated_at: '2026-09-18T05:12:00+08:00',
  learner_evidence_basis: basisE1
};
writeExamChatPlan(evidenceStorage, e1Plan, '2026-09-18');
if (readExamChatPlan(evidenceStorage, '2026-09-18').status !== 'ready') {
  fail('REFRESHED_BASIS_PLAN_MUST_BE_READY');
}

evidenceStorage.setItem('kianos-politics-evidence-v1', JSON.stringify([{
  schema: 'kianos.politics.analysis-evidence.v1',
  event_id: 'basis-e1-blocker',
  study_day: '2026-09-18',
  observed_at: '2026-09-18T05:15:00+08:00',
  verdict: 'STABLE'
}]));
const staleAfterStability = readExamChatPlan(evidenceStorage, '2026-09-18');
if (staleAfterStability.status !== 'stale') {
  fail('NEW_STABILITY_EVIDENCE_MUST_STALE_OLD_BUILD_REPAIR_PLAN');
}


const controlStorage = new MemoryStorage();
const controlBasisE0 = buildExamChatPlanBasis(controlStorage, '2026-09-18');
const controlPlanE0 = {
  ...sample,
  generated_at: '2026-09-18T05:20:00+08:00',
  learner_evidence_basis: controlBasisE0
};
controlStorage.setItem('kianos-politics-evidence-v1', JSON.stringify([{
  event_id: 'private-control-e1',
  study_day: '2026-09-18',
  observed_at: '2026-09-18T05:21:00+08:00'
}]));
globalThis.window = globalThis.window || { dispatchEvent() {} };
globalThis.CustomEvent = globalThis.CustomEvent || class {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
};
const browserCommand = (id, plan) => ({
  schema: 'kianos.control-browser-command.v1',
  command_id: id,
  command_hash: id + '-hash',
  study_day: '2026-09-18',
  generated_at: '2026-09-18T05:22:00+08:00',
  expires_at: null,
  operations: [{ kind: 'exam.chat_plan', payload: plan }]
});
let privateControlStaleRejected = false;
try {
  await applyPrivateControlCommand(
    controlStorage,
    browserCommand('control-basis-stale-001', controlPlanE0),
    { day: '2026-09-18', now: Date.parse('2026-09-18T05:23:00+08:00') }
  );
} catch (error) {
  privateControlStaleRejected = String(error?.message || '').includes('CHAT_PLAN_EVIDENCE_BASIS_STALE');
}
if (!privateControlStaleRejected) fail('PRIVATE_CONTROL_STALE_BASIS_MUST_REJECT');
if (controlStorage.getItem(EXAM_CHAT_PLAN_KEY) !== null) {
  fail('PRIVATE_CONTROL_STALE_BASIS_MUST_NOT_WRITE_PLAN');
}

const poisonedControlStorage = new MemoryStorage();
const poisonedControlBasis = buildExamChatPlanBasis(poisonedControlStorage, '2026-09-18');
const poisonedRecoveryPlan = {
  ...sample,
  generated_at: '2026-09-18T05:30:00+08:00',
  learner_evidence_basis: poisonedControlBasis
};
poisonedControlStorage.setItem(EXAM_CHAT_PLAN_KEY, JSON.stringify({
  ...poisonedRecoveryPlan,
  generated_at: '2099-01-01T00:00:00Z'
}));
const poisonedRecovery = await applyPrivateControlCommand(
  poisonedControlStorage,
  browserCommand('control-future-poison-recovery-001', poisonedRecoveryPlan),
  { day: '2026-09-18', now: Date.parse('2026-09-18T05:31:00+08:00') }
);
if (poisonedRecovery.status !== 'applied') fail('PRIVATE_CONTROL_FUTURE_POISON_MUST_REAPPLY');
const recoveredControlPlan = readExamChatPlan(poisonedControlStorage, '2026-09-18');
if (recoveredControlPlan.status !== 'ready'
    || Date.parse(recoveredControlPlan.plan?.generated_at || 0) !== Date.parse(poisonedRecoveryPlan.generated_at)) {
  fail('PRIVATE_CONTROL_FUTURE_POISON_RECOVERY_FAILED');
}

const controlBasisE1 = buildExamChatPlanBasis(controlStorage, '2026-09-18');
const controlPlanE1 = {
  ...controlPlanE0,
  generated_at: '2026-09-18T05:24:00+08:00',
  learner_evidence_basis: controlBasisE1
};
const privateApplied = await applyPrivateControlCommand(
  controlStorage,
  browserCommand('control-basis-fresh-001', controlPlanE1),
  { day: '2026-09-18', now: Date.parse('2026-09-18T05:25:00+08:00') }
);
if (privateApplied.status !== 'applied' || !controlStorage.getItem(EXAM_CHAT_PLAN_KEY)) {
  fail('PRIVATE_CONTROL_FRESH_BASIS_MUST_APPLY');
}

// A durable control receipt is not proof that its native effect still exists.
// If local plan bytes disappear, replay of the exact same command must
// reconcile through the native plan owner instead of returning false idempotency.
controlStorage.removeItem(EXAM_CHAT_PLAN_KEY);
const repairedAfterLostEffect = await applyPrivateControlCommand(
  controlStorage,
  browserCommand('control-basis-fresh-001', controlPlanE1),
  { day: '2026-09-18', now: Date.parse('2026-09-18T05:26:00+08:00') }
);
if (repairedAfterLostEffect.status === 'idempotent') {
  fail('CONTROL_RECEIPT_MUST_NOT_HIDE_MISSING_NATIVE_EFFECT');
}
if (!controlStorage.getItem(EXAM_CHAT_PLAN_KEY)
    || readExamChatPlan(controlStorage, '2026-09-18').status !== 'ready') {
  fail('CONTROL_REPLAY_MUST_RESTORE_MISSING_NATIVE_EFFECT');
}

console.log(JSON.stringify({
  status: 'PASS',
  strategy_owner: model.control.strategyOwner,
  chat_plan_schema: EXAM_CHAT_PLAN_SCHEMA,
  production_buildExamPlan_calls: 0,
  production_readExamDemand_calls: 0,
  missing_plan_infers_allocation: false,
  missing_plan_infers_next: false,
  stale_plan_fails_closed: true,
  stale_plan_presentation_hidden: true,
  older_same_day_plan_rejected: true,
  identical_plan_replay_idempotent: true,
  same_generation_conflict_rejected: true,
  future_plan_rejected: true,
  future_poison_recoverable: true,
  native_plan_effect_readback_required: true,
  learner_evidence_basis_required: true,
  politics_e1_stales_e0_plan: true,
  later_stability_stales_old_heavy_plan: true,
  private_control_stale_basis_rejected: true,
  private_control_fresh_basis_applied: true,
  private_control_future_poison_recoverable: true,
  private_control_receipt_requires_native_effect: true
}, null, 2));
