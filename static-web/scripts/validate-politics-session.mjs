import fs from 'node:fs';
import path from 'node:path';
import { buildPoliticsSessionTargetCatalog } from '../src/lib/politicsSessionCatalog.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import {
  normalizePoliticsSessionInstruction,
  emptyPoliticsSessionEvidence,
  appendPoliticsSessionEvidence
} from '../src/lib/politicsSession.mjs';

const root = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const failures = [];
const pass = (condition, code, detail = '') => {
  if (!condition) failures.push({ code, detail });
};
const mustThrow = (fn, code, expected = '') => {
  try {
    fn();
    failures.push({ code, detail: 'DID_NOT_THROW' });
  } catch (error) {
    if (expected && !String(error?.message || '').includes(expected)) {
      failures.push({ code, detail: String(error?.message || '') });
    }
  }
};

const targets = buildPoliticsSessionTargetCatalog('/');
const practice = buildPoliticsPracticeCatalogCurrent('/');
const targetRefs = new Set(targets.targets.map((row) => row.ref));
const questionIds = new Set(practice.questions.map((row) => row.id));

pass(targets.schema === 'kianos.politics.session-target-catalog.v1', 'TARGET_CATALOG_SCHEMA');
pass(targets.target_count === targets.targets.length && targets.target_count > 151, 'TARGET_CATALOG_NONEMPTY', String(targets.target_count));
pass(targetRefs.size === targets.targets.length, 'TARGET_REF_UNIQUE', String(targetRefs.size));
const finalTargets = targets.targets.filter((row) => row.target_kind === 'FINAL');
const memoryTargets = targets.targets.filter((row) => row.target_kind === 'MEMORY');
const memoryModelTargets = memoryTargets.filter((row) => row.memory_shape === 'MODEL');
const memoryPointTargets = memoryTargets.filter((row) => row.memory_shape === 'POINT');
pass(finalTargets.length === 1083, 'TARGET_FINAL_OBJECT_COUNT', String(finalTargets.length));
pass(memoryModelTargets.length === 53, 'TARGET_MEMORY_MODEL_COUNT', String(memoryModelTargets.length));
pass(memoryPointTargets.length === 128, 'TARGET_MEMORY_POINT_COUNT', String(memoryPointTargets.length));
pass(memoryTargets.length === 181, 'TARGET_MEMORY_TOTAL_COUNT', String(memoryTargets.length));
pass(finalTargets.every((row) => row.ref.startsWith('politics-final:') && row.group), 'TARGET_FINAL_PREFIX_AND_PAYLOAD');
pass(memoryTargets.every((row) =>
  row.ref.startsWith('politics-memory:')
  && row.memory_admission === 'ADMITTED_STABLE'
  && row.group
), 'TARGET_MEMORY_ADMITTED_LITERAL_PAYLOAD');
pass(memoryTargets.every((row) =>
  ['CANDIDATE_EXACTNESS', 'CANDIDATE_FRESHNESS', 'ADMITTED_STABLE', 'NOT_APPLICABLE'].includes(row.precision_admission)
), 'TARGET_MEMORY_PRECISION_STATE_VALID');
pass(memoryModelTargets.every((row) =>
  row.memory_admission === 'ADMITTED_STABLE'
  && row.precision_admission === 'NOT_APPLICABLE'
  && row.group
), 'TARGET_MEMORY_MODEL_IS_STABLE_NON_PRECISION');
pass(memoryModelTargets.every((row) => row.memory_shape === 'MODEL'), 'TARGET_MEMORY_MODEL_SHAPE_LITERAL');
pass(memoryPointTargets.every((row) => row.memory_shape === 'POINT'), 'TARGET_MEMORY_POINT_SHAPE_LITERAL');
const modelCounts = Object.fromEntries(['marxism','history','mao','xi','ethics_law'].map((subject) => [
  subject,
  memoryModelTargets.filter((row) => row.subject === subject).length
]));
pass(
  modelCounts.marxism === 9
  && modelCounts.history === 10
  && modelCounts.mao === 9
  && modelCounts.xi === 18
  && modelCounts.ethics_law === 7,
  'TARGET_MEMORY_MODEL_SUBJECT_COVERAGE',
  JSON.stringify(modelCounts)
);

const sampleTarget = finalTargets.find((row) => row.state === 'ORIENT' && row.subject === 'marxism') || finalTargets[0];
const sampleMemoryModelTarget = memoryModelTargets.find((row) => row.subject === 'xi') || memoryModelTargets[0];
const sampleMemoryTarget = memoryPointTargets.find((row) => row.subject === 'marxism') || memoryPointTargets[0];
const sampleQuestions = practice.questions.slice(0, 2).map((row) => row.id);
pass(Boolean(sampleTarget), 'SAMPLE_TARGET_MISSING');
pass(Boolean(sampleMemoryModelTarget), 'SAMPLE_MEMORY_MODEL_TARGET_MISSING');
pass(Boolean(sampleMemoryTarget), 'SAMPLE_MEMORY_TARGET_MISSING');
pass(sampleQuestions.length === 2, 'SAMPLE_QUESTIONS_MISSING');

const instruction = normalizePoliticsSessionInstruction({
  schema: 'kianos.politics.session-instruction.v1',
  session_id: 'session-audit-001',
  subject_id: sampleTarget.subject,
  phase: 'CONSOLIDATION',
  anchor_ref: sampleTarget.unit_id,
  steps: [
    {
      step_id: 'reconstruct-1',
      recipe_type: 'RECONSTRUCT',
      target_refs: [sampleTarget.ref],
      learner_prompt: '闭卷想回来，再翻面核对。'
    },
    {
      step_id: 'questions-1',
      recipe_type: 'QUESTION_RETEST',
      question_ids: sampleQuestions
    },
    {
      step_id: 'close-1',
      recipe_type: 'CLOSE'
    }
  ],
  return_policy: { on_complete: 'CHAT', on_interrupt: 'RESUME' }
}, { targetRefs, questionIds });

pass(instruction.steps.length === 3, 'SESSION_NORMALIZATION_STEP_COUNT');
pass(instruction.steps[0].target_refs[0] === sampleTarget.ref, 'SESSION_TARGET_LITERAL');
pass(JSON.stringify(instruction.steps[1].question_ids) === JSON.stringify(sampleQuestions), 'SESSION_QUESTION_ORDER_LITERAL');

mustThrow(() => normalizePoliticsSessionInstruction({
  ...instruction,
  priority: 9
}, { targetRefs, questionIds }), 'SESSION_STRATEGY_FIELD_FORBIDDEN', 'STRATEGY_FIELD_FORBIDDEN');

mustThrow(() => normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-unresolved',
  steps: [{
    step_id: 'bad-target',
    recipe_type: 'TARGETED_RECALL',
    target_refs: ['politics-final:missing']
  }]
}, { targetRefs, questionIds }), 'SESSION_UNRESOLVED_TARGET_FAILS_CLOSED', 'TARGET_UNRESOLVED');

mustThrow(() => normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-question',
  steps: [{
    step_id: 'bad-question',
    recipe_type: 'QUESTION_RETEST',
    question_ids: ['X1000-NOT-REAL']
  }]
}, { targetRefs, questionIds }), 'SESSION_UNRESOLVED_QUESTION_FAILS_CLOSED', 'QUESTION_UNRESOLVED');

mustThrow(() => normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-precision-missing-target',
  steps: [{
    step_id: 'precision-no-target',
    recipe_type: 'PRECISION'
  }]
}, { targetRefs, questionIds }), 'SESSION_PRECISION_REQUIRES_TARGET', 'PRECISION_TARGET_REQUIRED');

const memoryRecall = normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-memory-recall',
  steps: [{
    step_id: 'memory-recall',
    recipe_type: 'TARGETED_RECALL',
    target_refs: [sampleMemoryModelTarget.ref]
  }]
}, { targetRefs, questionIds });
pass(memoryRecall.steps[0].target_refs[0] === sampleMemoryModelTarget.ref, 'SESSION_MEMORY_MODEL_RECALL_TARGET_LITERAL');

const precisionCandidate = normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-precision-candidate',
  steps: [{
    step_id: 'precision-candidate',
    recipe_type: 'PRECISION',
    target_refs: [sampleMemoryTarget.ref]
  }]
}, { targetRefs, questionIds });
pass(precisionCandidate.steps[0].target_refs[0] === sampleMemoryTarget.ref, 'SESSION_PRECISION_CANDIDATE_IMPORTS_FOR_FAIL_CLOSED_RUNTIME');

mustThrow(() => normalizePoliticsSessionInstruction({
  ...instruction,
  session_id: 'session-audit-href',
  steps: [{
    step_id: 'unsafe-source',
    recipe_type: 'SOURCE_REPAIR',
    source_href: 'javascript:alert(1)'
  }]
}, { targetRefs, questionIds }), 'SESSION_UNSAFE_SOURCE_HREF_FAILS_CLOSED', 'SOURCE_HREF_INVALID');

const legacy = normalizePoliticsSessionInstruction({
  schema: 'kianos.politics.consolidation_plan.v1',
  session_id: 'legacy-normalize-001',
  scope: {
    subject_id: sampleTarget.subject,
    phase: 'CONSOLIDATION',
    anchor_ref: sampleTarget.unit_id
  },
  actions: [{
    action_id: 'legacy-recall',
    type: 'TARGETED_RECALL',
    target_refs: [sampleTarget.ref]
  }]
}, { targetRefs, questionIds });

pass(legacy.schema === 'kianos.politics.session-instruction.v1', 'LEGACY_PLAN_NORMALIZES_TO_SINGLE_ENVELOPE');
pass(legacy.phase === 'CONSOLIDATION', 'LEGACY_PLAN_PHASE_PRESERVED');
pass(legacy.steps[0].step_id === 'legacy-recall', 'LEGACY_ACTION_ID_PRESERVED');

let evidence = emptyPoliticsSessionEvidence(instruction);
evidence = appendPoliticsSessionEvidence(evidence, instruction, {
  step_id: 'reconstruct-1',
  recipe_type: 'RECONSTRUCT',
  target_refs: [sampleTarget.ref],
  response: 'learner response',
  mark: 'UNCERTAIN',
  revealed: true,
  elapsed_ms: 1200
}, { step_index: 1, step_id: 'questions-1', status: 'ACTIVE' });

pass(evidence.events.length === 1, 'SESSION_EVIDENCE_EVENT_APPENDED');
pass(evidence.events[0].response === 'learner response', 'SESSION_EVIDENCE_RESPONSE_FACT_ONLY');
pass(evidence.events[0].mark === 'UNCERTAIN', 'SESSION_EVIDENCE_MARK_PRESERVED');
pass(!Object.prototype.hasOwnProperty.call(evidence.events[0], 'recommended_next'), 'SESSION_EVIDENCE_NO_RECOMMENDATION');

evidence = appendPoliticsSessionEvidence(evidence, instruction, {
  step_id: 'questions-1',
  recipe_type: 'QUESTION_RETEST',
  question_ids: sampleQuestions,
  deterministic_result: {
    results: sampleQuestions.map((id) => ({ question_id: id, correct: true }))
  }
}, { step_index: 2, step_id: 'close-1', status: 'ACTIVE' });

pass(Array.isArray(evidence.events[1]?.deterministic_result?.results), 'SESSION_EVIDENCE_DETERMINISTIC_RESULT');

const reviewPage = fs.readFileSync(path.join(root, 'static-web/src/pages/politics/review.astro'), 'utf8');
const sessionClient = fs.readFileSync(path.join(root, 'static-web/src/lib/politicsSessionClient.mjs'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'static-web/src/components/PoliticsSessionTargetRegistry.astro'), 'utf8');
const practiceClient = fs.readFileSync(path.join(root, 'static-web/src/lib/politicsPracticeClient.mjs'), 'utf8');

for (const marker of [
  'PoliticsSessionTargetRegistry',
  'data-session-workspace',
  'data-session-reveal',
  'data-session-mark',
  'data-session-question-start',
  'data-session-blocked'
]) {
  pass(reviewPage.includes(marker), 'REVIEW_SESSION_SURFACE_MARKER', marker);
}
pass(registry.includes('PoliticsExplicitSurfacePlan groups={[target.group]}'), 'SESSION_TARGET_REGISTRY_LITERAL_RENDER');
pass(registry.includes('data-session-memory-admission') && registry.includes('data-session-precision-admission'), 'SESSION_TARGET_REGISTRY_EXPOSES_ADMISSION_ONLY');
pass(!sessionClient.includes('politicsCurrent') && !sessionClient.includes('loadPoliticsChapterCurrent') && !sessionClient.includes('loadPoliticsCompiledPresentation'), 'SESSION_CLIENT_NO_RAW_CONTENT_OWNER');
pass(sessionClient.includes("row.kind !== 'MEMORY' || row.memory_admission === 'ADMITTED_STABLE'"), 'SESSION_MEMORY_RUNTIME_ENFORCES_ADMISSION');
pass(sessionClient.includes("row.kind === 'MEMORY' && row.precision_admission === 'ADMITTED_STABLE'"), 'SESSION_PRECISION_RUNTIME_ENFORCES_SEPARATE_ADMISSION');
pass(sessionClient.includes('timed-task executor 还未验收'), 'SESSION_TIMER_RUNTIME_FAIL_CLOSED');
pass(sessionClient.includes("const completed = status === 'COMPLETED' || nextIndex >= instruction.steps.length"), 'SESSION_EXPLICIT_CLOSE_TERMINATES_PLAN');

const sessionClientLines = sessionClient.split('\n').map((line) => line.trimStart());
const evidenceBindingLine = sessionClientLines.findIndex((line) =>
  line.includes('[data-session-copy-evidence]') && line.includes('.forEach')
);
const evidenceBinding = evidenceBindingLine >= 0 ? sessionClientLines[evidenceBindingLine] : '';
const safeEvidenceBinding = evidenceBinding.charCodeAt(0) === 36 && evidenceBinding.charCodeAt(1) === 36 && evidenceBinding.charCodeAt(2) === 40;
const unsafeEvidenceBinding = evidenceBinding.charCodeAt(0) === 36 && evidenceBinding.charCodeAt(1) === 40;
const keyboardBindingLine = sessionClientLines.findIndex((line) => line.startsWith("window.addEventListener('keydown'"));
pass(safeEvidenceBinding, 'SESSION_ALL_EVIDENCE_COPY_CONTROLS_BOUND');
pass(!unsafeEvidenceBinding, 'SESSION_SINGLE_NODE_FOREACH_INIT_CRASH_ABSENT');
pass(evidenceBindingLine >= 0 && keyboardBindingLine > evidenceBindingLine, 'SESSION_INIT_REACHES_KEYBOARD_BINDING');
pass(!sessionClient.includes("if (runtime.status === 'PAUSED_CHAT') {\n      $('[data-session-step]').hidden = true;"), 'SESSION_PAUSED_CHAT_SURFACE_VISIBLE');

const practiceClientLines = practiceClient.split('\n').map((line) => line.trimStart());
const explicitModeBindingLine = practiceClientLines.find((line) =>
  line.includes('[data-mode-value]') && line.includes('.forEach') && line.includes('button.disabled = true')
) || '';
const explicitModeBindingSafe = explicitModeBindingLine.charCodeAt(0) === 36 && explicitModeBindingLine.charCodeAt(1) === 36 && explicitModeBindingLine.charCodeAt(2) === 40;
pass(explicitModeBindingSafe, 'PRACTICE_EXPLICIT_RETEST_MODE_BINDING_SAFE');
pass(practiceClient.includes('if (explicitRetest) return explicitQuestionIds.map'), 'PRACTICE_EXPLICIT_RETEST_EXACT_POOL');
pass(practiceClient.includes("if (!explicitRetest && controls.mode.value === 'random')"), 'PRACTICE_EXPLICIT_RETEST_ORDER_NOT_SHUFFLED');
pass(practiceClient.includes('const ids = (explicitRetest ? pool : pool.slice'), 'PRACTICE_EXPLICIT_RETEST_NO_COUNT_EXPANSION');
pass(practiceClient.includes("mode: explicitRetest ? 'explicit_retest'"), 'PRACTICE_EXPLICIT_RETEST_IDENTITY');

console.log(JSON.stringify({
  schema: 'kianos.politics.session-executor-audit.v1',
  target_count: targets.target_count,
  question_count: practice.questionCount,
  sample_target: sampleTarget.ref,
  sample_memory_target: sampleMemoryTarget.ref,
  memory_target_count: memoryTargets.length,
  sample_questions: sampleQuestions,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
