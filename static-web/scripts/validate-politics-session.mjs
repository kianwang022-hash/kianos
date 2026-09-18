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
pass(targets.targets.every((row) =>
  row.ref.startsWith('politics-final:')
  && row.subject
  && row.chapter
  && row.unit_id
  && row.state
  && row.group_id
  && row.group
), 'TARGET_REF_EXACT_FINAL_OBJECT_ONLY');

const sampleTarget = targets.targets.find((row) => row.state === 'ORIENT' && row.subject === 'marxism') || targets.targets[0];
const sampleQuestions = practice.questions.slice(0, 2).map((row) => row.id);
pass(Boolean(sampleTarget), 'SAMPLE_TARGET_MISSING');
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
  session_id: 'session-audit-precision',
  steps: [{
    step_id: 'precision-no-guard',
    recipe_type: 'PRECISION',
    target_refs: [sampleTarget.ref]
  }]
}, { targetRefs, questionIds }), 'SESSION_PRECISION_REQUIRES_GUARD', 'PRECISION_GUARD_REQUIRED');

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
pass(!sessionClient.includes('politicsCurrent') && !sessionClient.includes('loadPoliticsChapterCurrent') && !sessionClient.includes('loadPoliticsCompiledPresentation'), 'SESSION_CLIENT_NO_RAW_CONTENT_OWNER');
pass(sessionClient.includes("step.recipe_type === 'PRECISION'") && sessionClient.includes('fail closed'), 'SESSION_PRECISION_RUNTIME_FAIL_CLOSED');
pass(sessionClient.includes('timed-task executor 还未验收'), 'SESSION_TIMER_RUNTIME_FAIL_CLOSED');
pass(sessionClient.includes("const completed = status === 'COMPLETED' || nextIndex >= instruction.steps.length"), 'SESSION_EXPLICIT_CLOSE_TERMINATES_PLAN');
const sessionClientLines = sessionClient.split('\n').map((line) => line.trimStart());
const evidenceBindingLine = sessionClientLines.findIndex((line) =>
  line.includes("[data-session-copy-evidence]") && line.includes(".forEach")
);
const evidenceBinding = evidenceBindingLine >= 0 ? sessionClientLines[evidenceBindingLine] : '';
const safeEvidenceBinding = evidenceBinding.charAt(0) === '$' && evidenceBinding.charAt(1) === '$' && evidenceBinding.charAt(2) === '(';
const unsafeEvidenceBinding = evidenceBinding.charAt(0) === '$' && evidenceBinding.charAt(1) === '(';
const keyboardBindingLine = sessionClientLines.findIndex((line) => line.startsWith("window.addEventListener('keydown'"));
pass(safeEvidenceBinding, 'SESSION_ALL_EVIDENCE_COPY_CONTROLS_BOUND');
pass(!unsafeEvidenceBinding, 'SESSION_SINGLE_NODE_FOREACH_INIT_CRASH_ABSENT');
pass(evidenceBindingLine >= 0 && keyboardBindingLine > evidenceBindingLine, 'SESSION_INIT_REACHES_KEYBOARD_BINDING');
pass(!sessionClient.includes("if (runtime.status === 'PAUSED_CHAT') {\n      $('[data-session-step]').hidden = true;"), 'SESSION_PAUSED_CHAT_SURFACE_VISIBLE');
pass(practiceClient.includes('if (explicitRetest) return explicitQuestionIds.map'), 'PRACTICE_EXPLICIT_RETEST_EXACT_POOL');
pass(practiceClient.includes("if (!explicitRetest && controls.mode.value === 'random')"), 'PRACTICE_EXPLICIT_RETEST_ORDER_NOT_SHUFFLED');
pass(practiceClient.includes("const ids = (explicitRetest ? pool : pool.slice"), 'PRACTICE_EXPLICIT_RETEST_NO_COUNT_EXPANSION');
pass(practiceClient.includes("if (!explicitRetest && controls.mode.value === 'random')"), 'PRACTICE_EXPLICIT_RETEST_ORDER_NOT_RANDOMIZED');
pass(practiceClient.includes("mode: explicitRetest ? 'explicit_retest'"), 'PRACTICE_EXPLICIT_RETEST_IDENTITY');

console.log(JSON.stringify({
  schema: 'kianos.politics.session-executor-audit.v1',
  target_count: targets.target_count,
  question_count: practice.questionCount,
  sample_target: sampleTarget.ref,
  sample_questions: sampleQuestions,
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
