import assert from 'node:assert/strict';
import {
  inspectEnglishSyntheticBaseline,
  listSyntheticReadingSets,
  loadSyntheticReadingById,
  loadSyntheticReadingAnswersById,
  listSyntheticClozeSets,
  loadSyntheticClozeById,
  loadSyntheticClozeAnswersById,
  listSyntheticReadingBSets,
  loadSyntheticReadingBById,
  loadSyntheticReadingBAnswersById,
  listSyntheticTranslationSets,
  loadSyntheticTranslationById,
  loadSyntheticTranslationReferencesById
} from '../src/lib/englishSyntheticBaseline.mjs';
import {
  listReadingSets,
  listExecutableReadingSets,
  loadReadingById
} from '../src/lib/englishReadingSourceTruth.mjs';
import {
  listClozeSets,
  listExecutableClozeSets,
  listReadingBSets,
  listExecutableReadingBSets,
  loadClozeById,
  loadReadingBById
} from '../src/lib/englishObjectiveSourceTruth.mjs';
import {
  listTranslationSets,
  listExecutableTranslationSets,
  loadTranslationById
} from '../src/lib/englishTranslationSourceTruth.mjs';
import {
  inspectWritingSyntheticTasks,
  listWritingSyntheticTasks
} from '../src/lib/englishWritingSynthetic.mjs';
import { listWritingRuntimeTasks } from '../src/lib/englishWritingRuntimeSourceTruth.mjs';
import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';
import { validateEnglishSessionInstruction } from '../src/lib/englishSessionControl.mjs';

const forbidden = new Set([
  'answer','answers','formal_answer','correct_answer','analysis','explanation',
  'rationale','solution','reference','reference_answer','model_answer','sample_answer'
]);

function forbiddenPaths(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((child, index) => forbiddenPaths(child, prefix + '[' + index + ']'));
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? prefix + '.' + key : key;
    return [
      ...(forbidden.has(String(key).toLowerCase()) ? [next] : []),
      ...forbiddenPaths(child, next)
    ];
  });
}

const inspection = inspectEnglishSyntheticBaseline();
assert.equal(inspection.status, 'ready', inspection.issues.join('|'));
assert.deepEqual(
  {
    readingA: inspection.readingA,
    cloze: inspection.cloze,
    partB: inspection.partB,
    translation: inspection.translation
  },
  { readingA: 4, cloze: 2, partB: 8, translation: 5 }
);

const readingSynthetic = listSyntheticReadingSets();
const clozeSynthetic = listSyntheticClozeSets();
const partBSynthetic = listSyntheticReadingBSets();
const translationSynthetic = listSyntheticTranslationSets();

assert.equal(listExecutableReadingSets().length, listReadingSets().length + readingSynthetic.length);
assert.equal(listExecutableClozeSets().length, listClozeSets().length + clozeSynthetic.length);
assert.equal(listExecutableReadingBSets().length, listReadingBSets().length + partBSynthetic.length);
assert.equal(listExecutableTranslationSets().length, listTranslationSets().length + translationSynthetic.length);

for (const row of readingSynthetic) {
  const task = loadReadingById(row.id);
  assert.equal(task.sourceKind, 'synthetic');
  assert.ok(task.sourceHashes?.renderedObject);
  assert.equal(task.questions.length, 5);
  assert.equal(forbiddenPaths(task).length, 0, 'Reading learner payload leaked answer/reference: ' + row.id);
  const answer = loadSyntheticReadingAnswersById(row.id);
  assert.equal(Object.keys(answer.answers).length, 5);
}

for (const row of clozeSynthetic) {
  const task = loadClozeById(row.id);
  assert.equal(task.sourceKind, 'synthetic');
  assert.ok(task.sourceHashes?.renderedObject);
  assert.equal(task.questions.length, 20);
  assert.equal(forbiddenPaths(task).length, 0, 'Cloze learner payload leaked answer/reference: ' + row.id);
  const answer = loadSyntheticClozeAnswersById(row.id);
  assert.equal(Object.keys(answer.answers).length, 20);
}

const forms = new Set();
for (const row of partBSynthetic) {
  const task = loadReadingBById(row.id);
  forms.add(task.context.taskForm);
  assert.equal(task.sourceKind, 'synthetic');
  assert.ok(task.sourceHashes?.renderedObject);
  assert.equal(task.questions.length, 5);
  assert.equal(forbiddenPaths(task).length, 0, 'Part B learner payload leaked answer/reference: ' + row.id);
  const answer = loadSyntheticReadingBAnswersById(row.id);
  assert.equal(Object.keys(answer.answers).length, 5);
}
assert.deepEqual(forms, new Set(['gap_match','ordering','heading_match','comment_match']));

for (const row of translationSynthetic) {
  const task = loadTranslationById(row.id);
  assert.equal(task.sourceKind, 'synthetic');
  assert.ok(task.sourceHashes?.renderedObject);
  assert.equal(task.prompts.length, 5);
  assert.equal(forbiddenPaths(task).length, 0, 'Translation learner payload leaked reference: ' + row.id);
  const refs = loadSyntheticTranslationReferencesById(row.id);
  assert.equal(refs.totalCount, 5);
  assert.equal(refs.missingCount, 0);
  assert.ok(refs.references.every((item) => item.official === false));
}

const writingInspection = inspectWritingSyntheticTasks();
assert.equal(writingInspection.status, 'ready', writingInspection.issues.join('|'));
assert.equal(writingInspection.taskCount, 10);
assert.deepEqual(new Set(writingInspection.kinds), new Set(['small','big']));
const writingSynthetic = listWritingSyntheticTasks();
assert.equal(writingSynthetic.length, 10);
const writingRuntimeIds = new Set(listWritingRuntimeTasks().map((row) => row.id));
assert.ok(writingSynthetic.every((row) => writingRuntimeIds.has(row.id)));

const catalog = englishSessionCatalog();
const catalogByKey = new Map(catalog.map((row) => [row.task + ':' + row.object_id, row]));
const sampleSteps = [
  ['reading_a', readingSynthetic[0].id, loadSyntheticReadingById(readingSynthetic[0].id).sourceHashes.renderedObject],
  ['cloze', clozeSynthetic[0].id, loadSyntheticClozeById(clozeSynthetic[0].id).sourceHashes.renderedObject],
  ['reading_b', partBSynthetic[0].id, loadSyntheticReadingBById(partBSynthetic[0].id).sourceHashes.renderedObject],
  ['translation', translationSynthetic[0].id, loadSyntheticTranslationById(translationSynthetic[0].id).sourceHashes.renderedObject],
  ['writing', writingSynthetic[0].id, writingSynthetic[0].sourceHash]
];

for (const [task, objectId, sourceHash] of sampleSteps) {
  const row = catalogByKey.get(task + ':' + objectId);
  assert.ok(row, 'Session Catalog missing ' + task + ':' + objectId);
  assert.equal(row.source_hash, sourceHash, 'Session Catalog source hash mismatch for ' + objectId);
}

const instruction = validateEnglishSessionInstruction({
  schema: 'kianos.english.session-instruction.v1',
  session_id: 'synthetic-baseline-validation',
  study_day: '2026-09-20',
  generated_at: '2026-09-20T12:00:00.000Z',
  current_step: 0,
  steps: sampleSteps.map(([task, objectId, sourceHash], index) => ({
    step_id: 's' + (index + 1),
    task,
    object_id: objectId,
    source_hash: sourceHash,
    label: 'Synthetic baseline validation'
  }))
}, '2026-09-20');
assert.equal(instruction.steps.length, sampleSteps.length);

console.log(JSON.stringify({
  schema: 'kianos.english.synthetic-baseline-readiness.v1',
  status: 'PASS',
  inventory: {
    reading_a: readingSynthetic.length,
    cloze: clozeSynthetic.length,
    part_b: partBSynthetic.length,
    translation: translationSynthetic.length,
    writing: writingSynthetic.length
  },
  checks: {
    learner_payload_has_no_answer_reference_leak: true,
    sealed_answer_reference_paths_resolve: true,
    all_part_b_forms_present: true,
    writing_expanded_bank_ready: true,
    session_catalog_addresses_synthetic_objects: true,
    typed_instruction_accepts_synthetic_objects: true,
    official_lists_remain_separate_from_synthetic_lists: true
  }
}, null, 2));
