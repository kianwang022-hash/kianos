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
assert.equal(synthetic.length, 2, 'cold-start calibration currently owns one synthetic Small and one synthetic Big task');
assert.deepEqual(new Set(synthetic.map((task) => task.kind)), new Set(['small', 'big']));

const currentExamCatalog = listWritingTasks();
const expectedFirst = currentExamCatalog.find((task) => task.sourceReady);
assert.ok(expectedFirst, 'CURRENT Writing source must expose a source-ready protected exam task');

const entry = inspectWritingTrueExamEntry();
assert.equal(entry.status, 'ready');
assert.equal(entry.policy.schema, WRITING_TRUE_EXAM_ENTRY_POLICY.schema);
assert.equal(entry.policy.protectedCatalogVisibleBeforeGate, false);
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
assert.equal(routes.length, 3, 'current cold-start learner route exposes two synthetic calibration tasks plus one protected true-exam entry');
assert.deepEqual(routes.slice(0, 2).map((task) => task.id), synthetic.map((task) => task.id));
assert.equal(routes[2].id, examTask.id);
assert.equal(loadWritingRuntimeTask(examTask.id).sourceKind, 'exam');
assert.throws(() => loadWritingRuntimeTask(currentExamCatalog.find((task) => task.id !== examTask.id)?.id || '__missing__'), /WRITING_RUNTIME_ROUTE_NOT_RELEASED/);

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
assert.match(home, /completed === tasks\.length/);
assert.match(home, /finalStates/);
assert.doesNotMatch(home, /data-synthetic-gate/, 'manual first-learning checkbox must not own true-exam qualification');
assert.match(route, /WritingProtectedExamGate/);
assert.match(route, /listWritingRuntimeTasks/);
assert.match(gate, /PASS_ACCEPTABLE/);
assert.match(gate, /REPAIR_COMPLETE/);
assert.match(gate, /TRANSFER_PENDING/);
assert.match(gate, /data-exam-runtime/);

console.log(JSON.stringify({
  schema: 'kianos.english.writing.true-exam-entry-validation.v2',
  status: 'PASS',
  checks: {
    canonicalFirstExamSelection: true,
    onlyOneProtectedExamReleased: true,
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
