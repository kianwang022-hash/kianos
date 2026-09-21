import fs from 'node:fs';
import path from 'node:path';
import {
  XIZONG_CHAT_SET_KEY,
  installAndActivateXizongSessionInstruction,
  normalizeXizongInlinePracticeQuestions,
  xizongChatSetSweepKey
} from '../src/lib/xizongSessionInstruction.mjs';
import { recordXizongQuestionAttempt } from '../src/lib/xizongQuestionAttempts.mjs';
import { xizongQuestionSemanticRevision, xizongQuestionSemanticRevisions } from '../src/lib/xizongQuestions.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  createXizongMemoryState,
  releaseBlockMemory
} from '../src/lib/xizongMemoryModel.mjs';
import { collectXizongRetainedEvidence } from '../src/lib/xizongRetainedPractice.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(`XIZONG_TARGETED_PRACTICE_FAIL:${message}`);
}

class Storage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const officialId = 'xizong-official-2025-n005';
const probeRaw = {
  question_id: 'xizong-ai-probe:circulation-b01-kp01-001',
  source_kind: 'AI_TRANSFER_PROBE',
  probe_kind: 'CONDITION_CHANGE',
  question_type: 'A',
  stem: '若只改变一个决定性条件，哪一项最符合当前循环机制？',
  options: [
    { label: 'A', text: 'fixture A' },
    { label: 'B', text: 'fixture B' },
    { label: 'C', text: 'fixture C' },
    { label: 'D', text: 'fixture D' }
  ],
  correct_answer: 'C',
  target_kp_ids: ['circulation-b01-kp01'],
  canonical_source_hash: 'fixture-current-owner-hash',
  evidence_intent: 'FRESH_TRANSFER_CHECK',
  semantic_family_id: 'sf:circulation-b01-kp01:condition-change',
  derived_from_ids: [officialId],
  changed_dimensions: ['决定性条件'],
  explanation: {
    exam_target: '验证同一机制在条件变化后的调用',
    decision_axis: '先找决定性变量',
    reasoning_chain: ['识别变化条件', '保持其他变量不变', '调用当前机制'],
    correct_option_reason: 'fixture C follows the bound mechanism',
    valuable_distractors: [{ option: 'B', reason: '混淆了原因与后果' }],
    common_failure_node: '只记原题答案',
    transfer_rule: '条件变了以后重新跑机制，不靠题面记忆'
  }
};

const normalized = normalizeXizongInlinePracticeQuestions([probeRaw], 'TEST');
assert(normalized.length === 1, 'probe-normalize-count');
assert(normalized[0].sourceKind === 'AI_TRANSFER_PROBE', 'probe-source');
assert(normalized[0].scoringRole === 'TRANSFER_ONLY', 'probe-scoring-role');
assert(normalized[0].targetKpIds[0] === 'circulation-b01-kp01', 'probe-target');
assert(normalized[0].correctAnswer === 'C', 'probe-answer');
assert(normalized[0].qualityGate === 'TARGET+DECISION_AXIS+FAILURE+TRANSFER+DISTRACTOR+SEMANTIC_IDENTITY', 'probe-quality-gate');
assert(normalized[0].freshTransferEligible === true, 'probe-fresh-transfer-eligibility');
assert(normalized[0].semanticFamilyId === 'sf:circulation-b01-kp01:condition-change', 'probe-semantic-family');

let rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{ ...probeRaw, source_kind: 'OFFICIAL_EXAM' }], 'TEST_BAD');
} catch { rejected = true; }
assert(rejected, 'probe-cannot-impersonate-official');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{ ...probeRaw, target_kp_ids: [] }], 'TEST_BAD_TARGET');
} catch { rejected = true; }
assert(rejected, 'probe-requires-canonical-target');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{
    ...probeRaw,
    explanation: { ...probeRaw.explanation, decision_axis: '' }
  }], 'TEST_BAD_DECISION_AXIS');
} catch { rejected = true; }
assert(rejected, 'probe-requires-decision-axis');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{
    ...probeRaw,
    explanation: { ...probeRaw.explanation, reasoning_chain: ['只有一步'] }
  }], 'TEST_THIN_REASONING');
} catch { rejected = true; }
assert(rejected, 'probe-requires-nontrivial-reasoning-chain');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{
    ...probeRaw,
    explanation: {
      ...probeRaw.explanation,
      valuable_distractors: [{ option: 'C', reason: '把正确项伪装成 distractor' }]
    }
  }], 'TEST_BAD_DISTRACTOR_BINDING');
} catch { rejected = true; }
assert(rejected, 'probe-distractor-must-bind-wrong-option');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{
    ...probeRaw,
    explanation: { ...probeRaw.explanation, valuable_distractors: [] }
  }], 'TEST_NO_DISTRACTOR_MECHANISM');
} catch { rejected = true; }
assert(rejected, 'probe-requires-distractor-mechanism');

rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([{
    ...probeRaw,
    semantic_family_id: ''
  }], 'TEST_FRESH_WITHOUT_SEMANTIC_FAMILY');
} catch { rejected = true; }
assert(rejected, 'fresh-intent-requires-semantic-family');

const trainingOnly = normalizeXizongInlinePracticeQuestions([{
  ...probeRaw,
  question_id: 'xizong-ai-probe:circulation-b01-kp01-training',
  evidence_intent: 'TRANSFER_TRAINING',
  semantic_family_id: '',
  derived_from_ids: [],
  changed_dimensions: []
}], 'TEST_TRAINING_ONLY')[0];
assert(trainingOnly.freshTransferEligible === false,
  'unverified synthetic training must not become fresh transfer evidence');



rejected = false;
try {
  normalizeXizongInlinePracticeQuestions([
    probeRaw,
    { ...probeRaw, question_id: 'xizong-ai-probe:circulation-b01-kp01-002' },
    { ...probeRaw, question_id: 'xizong-ai-probe:circulation-b01-kp01-003' }
  ], 'TEST_BURDEN_CAP');
} catch { rejected = true; }
assert(rejected, 'probe-burden-cap-must-reject-third-inline-question');

const storage = new Storage();
const currentMemory = releaseBlockMemory(createXizongMemoryState(), {
  blockId: 'circulation-b01',
  systemId: 'circulation',
  canonicalId: 'A1',
  blockLabel: 'B01',
  blockTitle: '正常机械循环',
  sourceHash: 'fixture-current-owner-hash',
  coreCards: [{
    id: 'core:circulation-b01-kp01',
    blockId: 'circulation-b01',
    systemId: 'circulation',
    canonicalId: 'A1',
    blockLabel: 'B01',
    blockTitle: '正常机械循环',
    kpId: 'circulation-b01-kp01',
    displayId: 'KP01',
    title: '循环机制',
    promptCanonical: '主动恢复循环主链',
    coreHtml: '<p>fixture</p>',
    sourceHash: 'fixture-current-owner-hash'
  }],
  precisionCards: []
}, '2026-09-20T00:30:00.000Z');
storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(currentMemory));

const day = '2026-09-20';
const generatedAt = '2026-09-20T01:00:00.000Z';
const instruction = {
  schema: 'kianos.xizong.session-instruction.v1',
  session_id: 'xz-targeted-practice-fixture',
  study_day: day,
  generated_at: generatedAt,
  steps: [{
    step_id: 'weakness-upgrade',
    kind: 'PRACTICE_SET',
    label: '专项训练',
    reason: '官方真题复刷优先，AI 只补精确迁移',
    question_ids: [officialId],
    inline_questions: [probeRaw],
    study_phase: 'SECOND_PASS',
    speed: 'normal',
    allow_holdout: true
  }]
};

const installed = installAndActivateXizongSessionInstruction(storage, instruction, {
  expectedDay: day,
  now: Date.parse('2026-09-20T01:01:00.000Z'),
  holdoutYears: []
});
assert(installed.installed.status === 'applied', 'session-not-applied');

const staleStorage = new Storage();
const staleMemory = releaseBlockMemory(createXizongMemoryState(), {
  blockId: 'circulation-b01',
  sourceHash: 'fixture-new-owner-hash',
  coreCards: [{
    id: 'core:circulation-b01-kp01',
    blockId: 'circulation-b01',
    kpId: 'circulation-b01-kp01',
    sourceHash: 'fixture-new-owner-hash'
  }],
  precisionCards: []
}, '2026-09-20T00:40:00.000Z');
staleStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(staleMemory));
let staleRejected = false;
try {
  installAndActivateXizongSessionInstruction(staleStorage, instruction, {
    expectedDay: day,
    now: Date.parse('2026-09-20T01:01:00.000Z'),
    holdoutYears: []
  });
} catch (error) {
  staleRejected = /INLINE_QUESTION_SOURCE_REVISION_MISMATCH/.test(String(error));
}
assert(staleRejected, 'stale-ai-probe-source-hash-was-accepted');

const missingOwnerStorage = new Storage();
missingOwnerStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(currentMemory));
const missingOwnerInstruction = JSON.parse(JSON.stringify(instruction));
missingOwnerInstruction.session_id = 'xz-targeted-practice-missing-owner';
missingOwnerInstruction.steps[0].inline_questions[0].target_kp_ids = ['circulation-b99-kp99'];
let missingOwnerRejected = false;
try {
  installAndActivateXizongSessionInstruction(missingOwnerStorage, missingOwnerInstruction, {
    expectedDay: day,
    now: Date.parse('2026-09-20T01:02:00.000Z'),
    holdoutYears: []
  });
} catch (error) {
  missingOwnerRejected = /INLINE_QUESTION_TARGET_OWNER_MISSING/.test(String(error));
}
assert(missingOwnerRejected, 'ai-probe-missing-current-owner-was-accepted');

const multiSourceStorage = new Storage();
let multiSourceMemory = currentMemory;
multiSourceMemory = releaseBlockMemory(multiSourceMemory, {
  blockId: 'circulation-b02',
  sourceHash: 'fixture-second-owner-hash',
  coreCards: [{
    id: 'core:circulation-b02-kp01',
    blockId: 'circulation-b02',
    kpId: 'circulation-b02-kp01',
    sourceHash: 'fixture-second-owner-hash'
  }],
  precisionCards: []
}, '2026-09-20T00:50:00.000Z');
multiSourceStorage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(multiSourceMemory));
const multiSourceInstruction = JSON.parse(JSON.stringify(instruction));
multiSourceInstruction.session_id = 'xz-targeted-practice-multi-source';
multiSourceInstruction.steps[0].inline_questions[0].target_kp_ids = [
  'circulation-b01-kp01',
  'circulation-b02-kp01'
];
let multiSourceRejected = false;
try {
  installAndActivateXizongSessionInstruction(multiSourceStorage, multiSourceInstruction, {
    expectedDay: day,
    now: Date.parse('2026-09-20T01:03:00.000Z'),
    holdoutYears: []
  });
} catch (error) {
  multiSourceRejected = /INLINE_QUESTION_MULTI_SOURCE_TARGET_UNSUPPORTED/.test(String(error));
}
assert(multiSourceRejected, 'cross-owner-ai-probe-was-accepted');
const set = JSON.parse(storage.getItem(XIZONG_CHAT_SET_KEY));
assert(set.schema === 'kianos.xizong.chat_set.v1', 'chat-set-schema');
assert(set.question_ids.length === 1 && set.question_ids[0] === officialId, 'official-question-preserved');
assert(set.inline_questions.length === 1, 'inline-probe-not-preserved');
assert(set.inline_questions[0].scoringRole === 'TRANSFER_ONLY', 'stored-probe-score-role');

const officialQuestion = {
  questionId: officialId,
  year: 2025,
  number: 5,
  questionType: 'A',
  correctAnswer: 'D',
  sourceKind: 'OFFICIAL_EXAM',
  scoringRole: 'OFFICIAL_EVIDENCE'
};
officialQuestion.semanticRevision = xizongQuestionSemanticRevision(officialQuestion);
const probeQuestion = set.inline_questions[0];
const nearDerivativeQuestion = normalizeXizongInlinePracticeQuestions([{
  ...probeRaw,
  question_id: 'xizong-ai-probe:circulation-b01-kp01-near-derivative',
  stem: '同一语义族的第二个表面变式，改变同一个决定性条件后哪项成立？'
}], 'TEST_NEAR_DERIVATIVE')[0];

const context = {
  systemId: 'chat-set:xz-targeted-practice-fixture:weakness-upgrade',
  canonicalId: 'TARGETED',
  scopeHash: 'targeted-practice:fixture',
  questionInventoryHash: 'targeted-practice:fixture',
  questions: [officialQuestion, probeQuestion, nearDerivativeQuestion],
  attemptContext: 'TARGETED_PRACTICE',
  resultVisibility: 'immediate',
  studyPhase: 'SECOND_PASS',
  queueMode: 'EXPLICIT_SET'
};

let sweep = {};
let serial = 0;
const runtime = {
  now: '2026-09-20T01:02:00.000Z',
  makeId: (prefix) => `${prefix}-fixture-${++serial}`
};
sweep = recordXizongQuestionAttempt(sweep, {
  question: officialQuestion,
  status: 'wrong',
  selected: ['A'],
  context,
  holdoutYears: []
}, runtime);
sweep = recordXizongQuestionAttempt(sweep, {
  question: probeQuestion,
  status: 'wrong',
  selected: ['B'],
  context,
  holdoutYears: []
}, {
  now: '2026-09-20T01:03:00.000Z',
  makeId: (prefix) => `${prefix}-fixture-${++serial}`
});

sweep = recordXizongQuestionAttempt(sweep, {
  question: nearDerivativeQuestion,
  status: 'stable',
  selected: ['C'],
  context,
  holdoutYears: []
}, {
  now: '2026-09-20T01:04:00.000Z',
  makeId: (prefix) => `${prefix}-fixture-${++serial}`
});

const officialEvent = sweep.attemptHistory.find((row) => row.question_id === officialId);
const probeEvent = sweep.attemptHistory.find((row) => row.question_id === probeQuestion.questionId);
assert(officialEvent.question_source === 'OFFICIAL_EXAM', 'official-source-provenance');
assert(officialEvent.scoring_role === 'OFFICIAL_EVIDENCE', 'official-score-provenance');
assert(probeEvent.question_source === 'AI_TRANSFER_PROBE', 'probe-attempt-source');
assert(probeEvent.scoring_role === 'TRANSFER_ONLY', 'probe-attempt-score-role');
assert(probeEvent.target_kp_ids[0] === 'circulation-b01-kp01', 'probe-attempt-target');

const sweepKey = xizongChatSetSweepKey('xz-targeted-practice-fixture', 'weakness-upgrade');
const entries = [[sweepKey, JSON.stringify(sweep)]];
const questionSemanticRevisions = xizongQuestionSemanticRevisions([officialQuestion]);
const retained = collectXizongRetainedEvidence(entries, { holdoutYears: [], questionSemanticRevisions });
assert(collectXizongRetainedEvidence(entries, { holdoutYears: [] }).wrongUncertainIds.length === 0,
  'unverified-official-revision-must-not-become-current-wu');
const changedRevision = xizongQuestionSemanticRevisions([{ ...officialQuestion, stem: 'changed fixture source' }]);
assert(collectXizongRetainedEvidence(entries, { holdoutYears: [], questionSemanticRevisions: changedRevision }).wrongUncertainIds.length === 0,
  'stale-official-revision-must-not-become-current-wu');
assert(sweep.attemptHistory.length === 3, 'revision-filtering-must-preserve-attempt-history');
assert(retained.wrongUncertainIds.length === 1 && retained.wrongUncertainIds[0] === officialId,
  'ai-probe-polluted-official-wu');
assert(retained.transferProbeEvents.length === 2, 'probe-evidence-missing');
assert(retained.transferProbeEvents.every((row) => row.scoring_role === 'TRANSFER_ONLY'), 'probe-evidence-score-boundary');
assert(retained.freshTransferEvents.length === 1,
  'same semantic family must contribute only one fresh transfer observation');
assert(retained.freshTransferEvents[0].question_id === nearDerivativeQuestion.questionId,
  'fresh transfer family should retain only the latest observation');
assert(retained.freshTransferEvents[0].semantic_family_id === 'sf:circulation-b01-kp01:condition-change', 'fresh-transfer-semantic-family');
assert(retained.freshTransferEvents[0].fresh_transfer_eligible === true, 'fresh-transfer-eligible');

const component = fs.readFileSync(path.resolve(process.cwd(), 'src/components/XizongPracticeWorkbench.astro'), 'utf8');
const landing = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/xizong/practice/index.astro'), 'utf8');
const targetedPage = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/xizong/practice/chat-set.astro'), 'utf8');
assert(component.includes('questions: [...officialQuestions, ...inlineQuestions]'), 'official-first-render-order');
assert(component.includes("currentQuestion.sourceKind === 'AI_TRANSFER_PROBE'"), 'probe-ui-provenance-branch');
assert(component.includes('validateXizongInlinePracticeQuestionBindings'), 'workbench-does-not-revalidate-probe-binding');
assert(landing.includes('validateXizongInlinePracticeQuestionBindings'), 'manual-fallback-bypasses-probe-binding');
assert(landing.includes('专项训练') && landing.includes('真题复刷与精准变式'), 'targeted-entry-copy');
assert(targetedPage.includes('专项训练'), 'targeted-route-copy');

console.log(JSON.stringify({
  ok: true,
  schema: 'xizong-targeted-practice-validation.v1',
  official_reuse_priority: true,
  mixed_practice_set: true,
  existing_workbench_reused: true,
  ai_probe_score_boundary: 'TRANSFER_ONLY',
  ai_probe_official_queue_pollution: 0,
  current_owner_binding: 'SESSION+MANUAL_FALLBACK+WORKBENCH',
  stale_source_rejected: true,
  missing_owner_rejected: true,
  multi_source_probe_rejected: true,
  probe_budget_policy: 'owned by Xizong study policy'
}, null, 2));
console.log('PASS Xizong targeted practice: official reuse + inline AI probe, one Workbench, evidence boundaries preserved');
