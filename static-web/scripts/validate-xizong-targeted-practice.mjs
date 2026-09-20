import fs from 'node:fs';
import path from 'node:path';
import {
  XIZONG_CHAT_SET_KEY,
  installAndActivateXizongSessionInstruction,
  normalizeXizongInlinePracticeQuestions,
  xizongChatSetSweepKey
} from '../src/lib/xizongSessionInstruction.mjs';
import { recordXizongQuestionAttempt } from '../src/lib/xizongQuestionAttempts.mjs';
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

const storage = new Storage();
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
const probeQuestion = set.inline_questions[0];

const context = {
  systemId: 'chat-set:xz-targeted-practice-fixture:weakness-upgrade',
  canonicalId: 'TARGETED',
  scopeHash: 'targeted-practice:fixture',
  questionInventoryHash: 'targeted-practice:fixture',
  questions: [officialQuestion, probeQuestion],
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

const officialEvent = sweep.attemptHistory.find((row) => row.question_id === officialId);
const probeEvent = sweep.attemptHistory.find((row) => row.question_id === probeQuestion.questionId);
assert(officialEvent.question_source === 'OFFICIAL_EXAM', 'official-source-provenance');
assert(officialEvent.scoring_role === 'OFFICIAL_EVIDENCE', 'official-score-provenance');
assert(probeEvent.question_source === 'AI_TRANSFER_PROBE', 'probe-attempt-source');
assert(probeEvent.scoring_role === 'TRANSFER_ONLY', 'probe-attempt-score-role');
assert(probeEvent.target_kp_ids[0] === 'circulation-b01-kp01', 'probe-attempt-target');

const sweepKey = xizongChatSetSweepKey('xz-targeted-practice-fixture', 'weakness-upgrade');
const retained = collectXizongRetainedEvidence([[sweepKey, JSON.stringify(sweep)]], { holdoutYears: [] });
assert(retained.wrongUncertainIds.length === 1 && retained.wrongUncertainIds[0] === officialId,
  'ai-probe-polluted-official-wu');
assert(retained.transferProbeEvents.length === 1, 'probe-evidence-missing');
assert(retained.transferProbeEvents[0].question_id === probeQuestion.questionId, 'probe-evidence-identity');
assert(retained.transferProbeEvents[0].scoring_role === 'TRANSFER_ONLY', 'probe-evidence-score-boundary');

const component = fs.readFileSync(path.resolve(process.cwd(), 'src/components/XizongPracticeWorkbench.astro'), 'utf8');
const landing = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/xizong/practice/index.astro'), 'utf8');
const targetedPage = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/xizong/practice/chat-set.astro'), 'utf8');
assert(component.includes('questions: [...officialQuestions, ...inlineQuestions]'), 'official-first-render-order');
assert(component.includes("currentQuestion.sourceKind === 'AI_TRANSFER_PROBE'"), 'probe-ui-provenance-branch');
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
  probe_budget_policy: 'owned by Xizong study policy'
}, null, 2));
console.log('PASS Xizong targeted practice: official reuse + inline AI probe, one Workbench, evidence boundaries preserved');
