import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXAM_CHAT_PLAN_SCHEMA,
  buildExamChatPlanBasis,
  validateExamChatPlan,
  readExamChatPlan,
  writeExamChatPlan
} from '../src/lib/examChatPlan.mjs';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '..');
const repoRoot = path.resolve(webRoot, '..');
const readWeb = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const readRepo = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const fail = (code, detail = '') => { throw new Error(`${code}${detail ? `:${detail}` : ''}`); };

const client = readWeb('src/lib/examOrchestratorClient.mjs');
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
if (!contract.includes('no production learner surface may call it')) fail('LEGACY_PLANNER_PRODUCTION_BAN_MISSING');

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
  attention: { text: '先完成西综当前 Block，再回英语。', action: '查看依据' }
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


class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
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

console.log(JSON.stringify({
  status: 'PASS',
  strategy_owner: model.control.strategyOwner,
  chat_plan_schema: EXAM_CHAT_PLAN_SCHEMA,
  production_buildExamPlan_calls: 0,
  production_readExamDemand_calls: 0,
  missing_plan_infers_allocation: false,
  missing_plan_infers_next: false,
  stale_plan_fails_closed: true,
  learner_evidence_basis_required: true,
  politics_e1_stales_e0_plan: true,
  later_stability_stales_old_heavy_plan: true
}, null, 2));
