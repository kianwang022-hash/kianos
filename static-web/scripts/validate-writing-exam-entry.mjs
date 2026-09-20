import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import { listWritingTasks, loadWritingById } from '../src/lib/englishWriting.mjs';
import {
  WRITING_TRUE_EXAM_ENTRY_POLICY,
  getFirstProtectedTrueExamTask,
  inspectWritingTrueExamEntry,
  listWritingExamRuntimeTasks,
  listWritingRuntimeTasks,
  loadWritingRuntimeTask
} from '../src/lib/englishWritingRuntimeTask.mjs';
import { createInitialWritingRecord, WRITING_STATES } from '../src/lib/writingRuntimeModel.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(webRoot, relativePath), 'utf8');
}

function forbiddenPaths(value, prefix = '') {
  const forbidden = new Set([
    'answer', 'answers', 'analysis', 'explanation', 'solution', 'reference',
    'reference_answer', 'sample_answer', 'model_answer', 'template_answer',
    'taxonomy', 'qa_state', 'seal_state'
  ]);
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((child, index) => forbiddenPaths(child, `${prefix}[${index}]`));
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return [
      ...(forbidden.has(String(key).toLowerCase()) ? [next] : []),
      ...forbiddenPaths(child, next)
    ];
  });
}

const synthetic = listWritingSyntheticTasks();
assert.ok(synthetic.length >= 2, 'Writing must keep learner-safe synthetic Small and Big task coverage');
assert.deepEqual(new Set(synthetic.map((task) => task.kind)), new Set(['small', 'big']));

const currentExamCatalog = listWritingTasks();
const expectedFirst = currentExamCatalog.find((task) => task.sourceReady);
assert.ok(expectedFirst, 'CURRENT Writing source must expose a source-ready protected exam task');

const entry = inspectWritingTrueExamEntry();
assert.equal(entry.status, 'ready');
assert.equal(entry.policy.schema, WRITING_TRUE_EXAM_ENTRY_POLICY.schema);
assert.equal(entry.policy.protectedCatalogVisibleBeforeGate, true);
assert.equal(entry.policy.protectedPromptVisibleBeforeOpen, false);
assert.equal(entry.policy.engineeringAttemptConsumesTrueExam, false);
assert.deepEqual(entry.syntheticGateIds, synthetic.map((task) => task.id));
assert.equal(entry.firstExam.id, expectedFirst.id, 'entry selection must use canonical source order, not a UI-specific hard-code');

const examTask = getFirstProtectedTrueExamTask();
const sourceTask = loadWritingById(expectedFirst.id);
assert.equal(examTask.id, sourceTask.objectId);
assert.equal(examTask.sourceKind, 'exam');
assert.ok(['small', 'big'].includes(examTask.kind));
assert.equal(examTask.navigation?.previousId, null);
assert.equal(examTask.navigation?.nextId, null);
assert.equal(examTask.sourcePath, sourceTask.sourcePaths.questions);
assert.equal(examTask.officialEvidence?.paperId, sourceTask.paperId);
assert.equal(examTask.officialEvidence?.year, sourceTask.year);
assert.deepEqual(examTask.officialEvidence?.prompt, sourceTask.prompts);
assert.deepEqual(examTask.officialEvidence?.material, sourceTask.material);
assert.deepEqual(examTask.officialEvidence?.context, sourceTask.context);
assert.equal(forbiddenPaths(examTask.learnerTask).length, 0, 'clean true-exam learner projection must not leak answers/analysis/model prose');

const routes = listWritingRuntimeTasks();
const examRoutes = listWritingExamRuntimeTasks();
assert.equal(routes.length, synthetic.length + examRoutes.length,
  'current learner route exposes skippable synthetic calibration plus every source-ready exam identity');
assert.deepEqual(routes.slice(0, synthetic.length).map((task) => task.id), synthetic.map((task) => task.id));
assert.deepEqual(
  routes.slice(synthetic.length).map((task) => task.id),
  examRoutes.map((task) => task.id),
  'exam choices must preserve Current source-ready catalog order'
);
assert.equal(routes[synthetic.length].id, examTask.id);
assert.equal(loadWritingRuntimeTask(examTask.id).sourceKind, 'exam');
assert.ok(examRoutes.every((task) => task.sourceKind === 'exam'));
if (examRoutes.length > 1) {
  assert.equal(loadWritingRuntimeTask(examRoutes[1].id).sourceKind, 'exam',
    'a learner-selected source-ready exam identity must be loadable without synthetic completion');
}

const fakeExam = {
  id: 'WRITING-EXAM-FIXTURE',
  kind: 'small',
  sourceKind: 'exam',
  learnerTask: { directions: 'Synthetic exam-shaped fixture. No protected prompt.' }
};
const fakeRecord = createInitialWritingRecord(fakeExam, [], '2026-09-12T00:00:00.000Z');
assert.equal(fakeRecord.sourceKind, 'exam');
assert.equal(fakeRecord.state, WRITING_STATES.ATTEMPT);

const home = read('src/pages/writing.astro');
const route = read('src/pages/writing/[id].astro');
const gate = read('src/components/WritingProtectedExamGate.astro');
assert.match(home, /data-true-exam-entry/);
assert.match(home, /data-writing-task-card/);
assert.match(home, /finalStates/);
assert.match(home, /起步练习可跳过；真题由你选择/, 'Home must state that calibration is skippable');
assert.match(home, /data-writing-exam-select/, 'source-ready exam identities must be learner-selectable without calibration completion');
assert.doesNotMatch(home, /data-synthetic-gate/, 'manual first-learning checkbox must not own true-exam qualification');
assert.match(route, /WritingProtectedExamGate/);
assert.match(route, /listWritingRuntimeTasks/);
assert.match(gate, /data-writing-open-task/, 'protected prompt must require an explicit open action');
assert.match(gate, /data-exam-runtime/);
assert.match(gate, /kianos:writing-task-opened/, 'opening must explicitly release the existing runtime');
assert.doesNotMatch(gate, /localStorage\.setItem/, 'unopened protected gate must not create learner state or exposure');

console.log(JSON.stringify({
  schema: 'kianos.english.writing.true-exam-entry-validation.v2',
  status: 'PASS',
  checks: {
    canonicalFirstExamSelection: true,
    sourceReadyExamCatalogSelectable: true,
    protectedPromptHiddenUntilOpen: true,
    cleanProjectionPreserved: true,
    sourcePromptMaterialContextPreserved: true,
    sharedRuntimeAcceptsExamShapeViaSyntheticFixture: true,
    syntheticCompletionUsesRuntimeTerminalEvidence: true,
    manualGuideCheckboxNotQualificationAuthority: true,
    noProtectedTrueExamAttemptConsumedByValidation: true
  },
  protectedTaskId: examTask.id,
  protectedTaskKind: examTask.kind,
  note: 'Validator reads CURRENT source/projection metadata but does not submit or simulate a learner attempt on a protected true-exam prompt.'
}, null, 2));
