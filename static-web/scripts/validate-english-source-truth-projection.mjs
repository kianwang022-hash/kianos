import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  inspectEnglishSourceTruth,
  sourceTruthFor,
  sourceTruthBlocks
} from '../src/lib/englishSourceTruth.mjs';
import {
  listReadingSets,
  loadReadingById
} from '../src/lib/englishReadingSourceTruth.mjs';
import { loadReadingById as loadBaseReadingById } from '../src/lib/englishReading.mjs';
import {
  listClozeSets,
  loadClozeById,
  listReadingBSets,
  loadReadingBById
} from '../src/lib/englishObjectiveSourceTruth.mjs';
import {
  listTranslationSets,
  loadTranslationById
} from '../src/lib/englishTranslationSourceTruth.mjs';
import {
  getFirstProtectedTrueExamTask
} from '../src/lib/englishWritingRuntimeSourceTruth.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const bank = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/english/source/question_bank.v1.json'), 'utf8'));
const allSets = Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [];


const learnerRouteBoundaries = [
  {
    path: 'static-web/src/pages/english.astro',
    required: ['englishReadingSourceTruth.mjs', 'englishTranslationSourceTruth.mjs'],
    forbidden: ["../lib/current.mjs", "englishTranslation.mjs"]
  },
  {
    path: 'static-web/src/pages/reading.astro',
    required: ['englishReadingSourceTruth.mjs'],
    forbidden: ["../lib/current.mjs", "englishReading.mjs"]
  },
  {
    path: 'static-web/src/pages/reading/[id].astro',
    required: ['englishReadingSourceTruth.mjs'],
    forbidden: ['englishReading.mjs']
  },
  {
    path: 'static-web/src/pages/cloze.astro',
    required: ['englishObjectiveSourceTruth.mjs'],
    forbidden: ['englishObjective.mjs']
  },
  {
    path: 'static-web/src/pages/cloze/[id].astro',
    required: ['englishObjectiveSourceTruth.mjs'],
    forbidden: ['englishObjective.mjs']
  },
  {
    path: 'static-web/src/pages/reading-b.astro',
    required: ['englishObjectiveSourceTruth.mjs'],
    forbidden: ['englishObjective.mjs']
  },
  {
    path: 'static-web/src/pages/reading-b/[id].astro',
    required: ['englishObjectiveSourceTruth.mjs'],
    forbidden: ['englishObjective.mjs']
  },
  {
    path: 'static-web/src/pages/translation.astro',
    required: ['englishTranslationSourceTruth.mjs'],
    forbidden: ['englishTranslation.mjs']
  },
  {
    path: 'static-web/src/pages/translation/[id].astro',
    required: ['englishTranslationSourceTruth.mjs'],
    forbidden: ['englishTranslation.mjs']
  },
  {
    path: 'static-web/src/pages/writing.astro',
    required: ['englishWritingRuntimeSourceTruth.mjs'],
    forbidden: ['englishWritingRuntimeTask.mjs']
  },
  {
    path: 'static-web/src/pages/writing/[id].astro',
    required: ['englishWritingRuntimeSourceTruth.mjs'],
    forbidden: ['englishWritingRuntimeTask.mjs']
  }
];

const checks = [];
const pass = (name, detail = '') => checks.push({ name, pass: true, detail });
const fail = (name, detail = '') => checks.push({ name, pass: false, detail });
const assert = (condition, name, detail = '') => condition ? pass(name, detail) : fail(name, detail);

for (const boundary of learnerRouteBoundaries) {
  const source = fs.readFileSync(path.join(repoRoot, boundary.path), 'utf8');
  const missingRequired = boundary.required.filter((token) => !source.includes(token));
  const forbiddenHits = boundary.forbidden.filter((token) => source.includes(token));
  assert(
    missingRequired.length === 0 && forbiddenHits.length === 0,
    `learner_route_uses_source_truth_boundary:${boundary.path}`,
    [
      missingRequired.length ? `missing=${missingRequired.join('|')}` : '',
      forbiddenHits.length ? `forbidden=${forbiddenHits.join('|')}` : ''
    ].filter(Boolean).join(';')
  );
}

const truth = inspectEnglishSourceTruth();
assert(truth.status === 'ready', 'global_source_truth_ready', JSON.stringify(truth));

const missingUnits = [];
for (const set of allSets) {
  try { sourceTruthFor(set.id); }
  catch (error) { missingUnits.push(`${set.id}:${error instanceof Error ? error.message : String(error)}`); }
}
assert(missingUnits.length === 0, 'all_current_sets_have_source_truth_unit', missingUnits.slice(0, 10).join(' | '));

function samples(items) {
  if (!items.length) return [];
  return [...new Set([items[0]?.id, items[Math.floor(items.length / 2)]?.id, items[items.length - 1]?.id].filter(Boolean))];
}

function assertIdentity(item, family) {
  assert(item?.sourceTruthStatus === 'SOURCE_READY', `${family}_source_truth_status`, item?.objectId || item?.id || '');
  assert(item?.sourcePaths?.sourceTruth === 'content/english/source/global_source_truth.v1.json' || item?.sourcePath === 'content/english/source/global_source_truth.v1.json', `${family}_source_truth_path`, item?.objectId || item?.id || '');
  const unitHash = item?.sourceHashes?.sourceTruthUnit || item?.sourceHash;
  assert(Boolean(unitHash), `${family}_source_truth_hash`, item?.objectId || item?.id || '');
}

function assertNoAnswerLeak(projectedQuestions, family, objectId) {
  const forbidden = ['answer', 'formal_answer', 'correct_answer', 'analysis', 'explanation', 'rationale'];
  const leaks = [];
  for (const question of projectedQuestions || []) {
    const id = String(question?.id || question?.question_id || 'unknown');
    for (const key of forbidden) {
      if (Object.prototype.hasOwnProperty.call(question || {}, key)) leaks.push(`${id}:${key}`);
    }
    const options = question?.options;
    const rows = Array.isArray(options) ? options : options && typeof options === 'object' ? Object.values(options) : [];
    rows.forEach((option, index) => {
      if (!option || typeof option !== 'object') return;
      for (const key of ['answer', 'formal_answer', 'correct_answer', 'is_correct', 'correct', 'analysis', 'explanation', 'rationale']) {
        if (Object.prototype.hasOwnProperty.call(option, key)) leaks.push(`${id}:option${index}:${key}`);
      }
    });
  }
  assert(leaks.length === 0, `${family}_no_answer_leak_before_gate`, `${objectId}:${leaks.slice(0, 8).join('|')}`);
}

function assertQuestionOverlay(projectedQuestions, unit, family, objectId, projectedField = 'prompt') {
  const overlays = unit?.question_overlays || {};
  const overlayIds = Object.keys(overlays);
  if (!overlayIds.length) {
    pass(`${family}_question_overlay_optional`, `${objectId}:none`);
    return;
  }
  const overlayId = overlayIds[0];
  const expected = overlays[overlayId] || {};
  const projected = (projectedQuestions || []).find((row) => String(row?.id || row?.question_id || '') === overlayId);
  assert(Boolean(projected), `${family}_overlay_question_present`, `${objectId}:${overlayId}`);
  if (!projected) return;
  if (expected.prompt) {
    assert(String(projected?.[projectedField] || '') === String(expected.prompt), `${family}_overlay_prompt_exact`, `${objectId}:${overlayId}`);
  }
  if (expected.options && projectedField === 'prompt') {
    assert(JSON.stringify(projected.options) === JSON.stringify(expected.options), `${family}_overlay_options_exact`, `${objectId}:${overlayId}`);
  }
}

for (const id of samples(listReadingSets())) {
  const item = loadReadingById(id);
  const base = loadBaseReadingById(id);
  const unit = sourceTruthFor(id);
  assertIdentity(item, 'reading_a');
  assert(
    JSON.stringify(item.paragraphs || []) === JSON.stringify(base.paragraphs || []),
    'reading_a_structured_paragraph_geometry_preserved',
    `${id}:paragraphs=${item.paragraphs?.length || 0}`
  );
  assertQuestionOverlay(item.questions, unit, 'reading_a', id);
  assertNoAnswerLeak(item.questions, 'reading_a', id);
}

for (const id of samples(listClozeSets())) {
  const item = loadClozeById(id);
  const unit = sourceTruthFor(id);
  assertIdentity(item, 'cloze');
  const blocks = sourceTruthBlocks(unit, 'm');
  if (blocks.length) assert(item.material?.[0]?.text === blocks[0].text, 'cloze_first_block_exact', id);
  assertQuestionOverlay(item.questions, unit, 'cloze', id);
  assertNoAnswerLeak(item.questions, 'cloze', id);
}

for (const id of samples(listReadingBSets())) {
  const item = loadReadingBById(id);
  const unit = sourceTruthFor(id);
  assertIdentity(item, 'reading_b');
  const blocks = sourceTruthBlocks(unit, 'm');
  if (blocks.length) assert(item.material?.[0]?.text === blocks[0].text, 'reading_b_first_block_exact', id);
  assertQuestionOverlay(item.questions, unit, 'reading_b', id);
  assertNoAnswerLeak(item.questions, 'reading_b', id);
  if (unit.shared_option_pool && Object.keys(unit.shared_option_pool).length) {
    assert(item.candidates?.length === Object.keys(unit.shared_option_pool).length, 'reading_b_shared_pool_cardinality', id);
  }
}

for (const id of samples(listTranslationSets())) {
  const item = loadTranslationById(id);
  const unit = sourceTruthFor(id);
  assertIdentity(item, 'translation');
  const blocks = sourceTruthBlocks(unit, 'm');
  if (blocks.length) assert(item.material?.[0]?.text === blocks[0].text, 'translation_first_block_exact', id);
  assertQuestionOverlay(item.prompts, unit, 'translation', id, 'sourceText');
  assertNoAnswerLeak(item.prompts, 'translation', id);
}

const writing = getFirstProtectedTrueExamTask();
if (writing?.sourceKind === 'exam') {
  const unit = sourceTruthFor(writing.id);
  assertIdentity(writing, 'writing');
  const blocks = sourceTruthBlocks(unit, 'm');
  if (blocks.length) assert(writing.officialEvidence?.material?.[0]?.text === blocks[0].text, 'writing_first_block_exact', writing.id);
  assertQuestionOverlay(writing.officialEvidence?.prompt, unit, 'writing', writing.id, 'promptText');
  assertNoAnswerLeak(writing.officialEvidence?.prompt, 'writing', writing.id);
} else {
  fail('writing_true_exam_source_truth_available', 'No protected true-exam task');
}

const failed = checks.filter((row) => !row.pass);
console.log(JSON.stringify({
  status: failed.length ? 'FAIL' : 'PASS',
  checks: checks.length,
  failed: failed.length,
  failures: failed,
  coverage: {
    allCurrentSets: allSets.length,
    readingA: listReadingSets().length,
    cloze: listClozeSets().length,
    readingB: listReadingBSets().length,
    translation: listTranslationSets().length,
    writingProtectedExam: writing?.id || null
  }
}, null, 2));

if (failed.length) process.exitCode = 1;
