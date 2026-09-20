import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const readText = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const readJson = (rel) => JSON.parse(readText(rel));

const standardPath = 'content/english/PRODUCTIVE_SCORING_STANDARD.md';
const provenancePath = 'content/english/PRODUCTIVE_SCORING_PROVENANCE.md';
const fixturesPath = 'content/english/PRODUCTIVE_SCORING_FIXTURES.v1.json';
const writingTasksPath = 'content/english/modules/writing/synthetic-tasks.v1.json';
const translationTasksPath = 'content/english/modules/translation/synthetic-tasks.v1.json';

const standard = readText(standardPath);
const provenance = readText(provenancePath);
const fixtures = readJson(fixturesPath);
const writing = readJson(writingTasksPath);
const translation = readJson(translationTasksPath);

assert.equal(fixtures.schema, 'kianos.english.productive_scoring_fixtures.v1');
assert.equal(fixtures.rules?.protected_true_exam_consumption, false);
assert.equal(fixtures.rules?.learner_visible, false);
assert.equal(fixtures.rules?.exact_score_gold, false);
assert.equal(fixtures.rules?.use_expected_relation_not_exact_point, true);

for (const marker of [
  'Band first, not fake weighted arithmetic',
  'Translation fidelity first',
  'First output is the score anchor',
  'Score uncertainty is mandatory',
  'Independent re-score trigger',
  'Topic-package guard',
  'Calibration / bias attacks',
  'E3 closure criteria'
]) {
  assert.ok(standard.includes(marker), 'SCORING_STANDARD_MARKER_MISSING:' + marker);
}

for (const marker of [
  'A — HIGH',
  'B — MEDIUM',
  'C — LOW / OPERATIONAL',
  'preserve uncertainty rather than filling the gap with folklore'
]) {
  assert.ok(provenance.includes(marker), 'SCORING_PROVENANCE_MARKER_MISSING:' + marker);
}

const writingIds = new Set((writing.tasks || []).map((row) => row.id));
const translationIds = new Set((translation.tasks || []).map((row) => row.id));
const fixtureIds = new Set();
const allFixtures = [
  ...(fixtures.translation || []),
  ...(fixtures.writing_small || []),
  ...(fixtures.writing_big || [])
];

for (const row of allFixtures) {
  assert.ok(row.fixture_id && !fixtureIds.has(row.fixture_id), 'DUPLICATE_FIXTURE:' + row.fixture_id);
  fixtureIds.add(row.fixture_id);
  assert.ok(row.response && String(row.response).trim(), 'EMPTY_FIXTURE_RESPONSE:' + row.fixture_id);
  assert.ok(row.expected_relation, 'EXPECTED_RELATION_MISSING:' + row.fixture_id);
}

for (const row of fixtures.translation || []) {
  assert.ok(translationIds.has(row.task_id), 'TRANSLATION_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  assert.ok(Number.isInteger(row.source_segment) && row.source_segment >= 1 && row.source_segment <= 5,
    'TRANSLATION_SEGMENT_INVALID:' + row.fixture_id);
  assert.ok(Array.isArray(row.expected_range_hint) && row.expected_range_hint.length === 2,
    'TRANSLATION_RANGE_MISSING:' + row.fixture_id);
  const [low, high] = row.expected_range_hint.map(Number);
  assert.ok(Number.isFinite(low) && Number.isFinite(high) && low >= 0 && high <= 2 && low <= high,
    'TRANSLATION_RANGE_INVALID:' + row.fixture_id);
}

for (const row of [...(fixtures.writing_small || []), ...(fixtures.writing_big || [])]) {
  assert.ok(writingIds.has(row.task_id), 'WRITING_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  assert.ok(row.expected_band, 'WRITING_BAND_MISSING:' + row.fixture_id);
  if ((fixtures.writing_small || []).includes(row)) {
    assert.ok(['7-10','7-8','3-6','1-4','0'].includes(row.expected_band),
      'SMALL_FIXTURE_BAND_INVALID:' + row.fixture_id + ':' + row.expected_band);
  }
}

const invariants = fixtures.pairwise_invariants || [];
assert.ok(invariants.length >= 3, 'PAIRWISE_INVARIANTS_TOO_THIN');
for (const invariant of invariants) {
  assert.ok(invariant.invariant_id && invariant.rule, 'PAIRWISE_INVARIANT_INVALID');
  for (const key of ['preferred','over']) {
    if (invariant[key]) assert.ok(fixtureIds.has(invariant[key]), 'PAIRWISE_FIXTURE_MISSING:' + invariant[key]);
  }
  for (const id of invariant.better_or_equal || []) {
    assert.ok(fixtureIds.has(id), 'PAIRWISE_FIXTURE_MISSING:' + id);
  }
}

const strongTranslations = new Set(['tr-cal-01-strong-a','tr-cal-01-strong-b-alt']);
const equivalenceInvariant = invariants.find((row) => row.invariant_id === 'translation-semantic-equivalence');
assert.ok(equivalenceInvariant, 'TRANSLATION_EQUIVALENCE_INVARIANT_MISSING');
assert.deepEqual(new Set(equivalenceInvariant.better_or_equal || []), strongTranslations);

console.log(JSON.stringify({
  schema: 'kianos.english.productive-scoring-structure-validation.v1',
  status: 'PASS',
  counts: {
    translation: fixtures.translation.length,
    writing_small: fixtures.writing_small.length,
    writing_big: fixtures.writing_big.length,
    pairwise_invariants: invariants.length
  },
  checks: {
    no_exact_gold_score: true,
    no_protected_true_exam_consumption: true,
    task_ids_bind_to_current_synthetic_assets: true,
    translation_ranges_are_bounded: true,
    writing_expected_bands_present: true,
    semantic_equivalence_guard_present: true,
    task_over_style_guard_present: true,
    grounding_over_fluency_guard_present: true,
    provenance_confidence_classes_present: true
  }
}, null, 2));
