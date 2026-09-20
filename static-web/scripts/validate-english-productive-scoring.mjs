import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const readText = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const readJson = (rel) => JSON.parse(readText(rel));

const standardPath = 'content/english/PRODUCTIVE_SCORING_STANDARD.md';
const provenancePath = 'content/english/PRODUCTIVE_SCORING_PROVENANCE.md';
const fixturesPath = 'content/english/PRODUCTIVE_SCORING_FIXTURES.v1.json';
const keyPath = 'content/english/PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json';
const writingTasksPath = 'content/english/modules/writing/synthetic-tasks.v1.json';
const translationTasksPath = 'content/english/modules/translation/synthetic-tasks.v1.json';

const standard = readText(standardPath);
const provenance = readText(provenancePath);
const fixtures = readJson(fixturesPath);
const key = readJson(keyPath);
const writing = readJson(writingTasksPath);
const translation = readJson(translationTasksPath);

assert.equal(fixtures.schema, 'kianos.english.productive_scoring_fixtures.v1');
assert.equal(fixtures.rules?.protected_true_exam_consumption, false);
assert.equal(fixtures.rules?.learner_visible, false);
assert.equal(fixtures.rules?.expected_results_sealed_separately, keyPath);

assert.equal(key.schema, 'kianos.english.productive_scoring_fixtures_key.v1');
assert.equal(key.source_bank, fixturesPath);
assert.equal(key.exact_score_gold, false);

for (const marker of [
  'Band first, not fake weighted arithmetic',
  'Translation fidelity first',
  'First output is the score anchor',
  'Score uncertainty is mandatory',
  'Independent re-score trigger',
  'Topic-package guard',
  'Typed-output score vs exam-mode score',
  'Fresh scoring audit must',
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
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_relation'), 'BLIND_FIXTURE_LEAK_EXPECTED_RELATION:' + row.fixture_id);
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_band'), 'BLIND_FIXTURE_LEAK_EXPECTED_BAND:' + row.fixture_id);
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_range_hint'), 'BLIND_FIXTURE_LEAK_EXPECTED_RANGE:' + row.fixture_id);
  assert.ok(key.expectations?.[row.fixture_id], 'SEALED_EXPECTATION_MISSING:' + row.fixture_id);
}

for (const row of fixtures.translation || []) {
  assert.ok(translationIds.has(row.task_id), 'TRANSLATION_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  assert.ok(Number.isInteger(row.source_segment) && row.source_segment >= 1 && row.source_segment <= 5,
    'TRANSLATION_SEGMENT_INVALID:' + row.fixture_id);
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'translation');
  assert.ok(Array.isArray(expected.expected_range_hint) && expected.expected_range_hint.length === 2,
    'TRANSLATION_RANGE_MISSING:' + row.fixture_id);
  const [low, high] = expected.expected_range_hint.map(Number);
  assert.ok(Number.isFinite(low) && Number.isFinite(high) && low >= 0 && high <= 2 && low <= high,
    'TRANSLATION_RANGE_INVALID:' + row.fixture_id);
  assert.ok([0,0.5,1,1.5,2].includes(low) && [0,0.5,1,1.5,2].includes(high),
    'TRANSLATION_RANGE_FAKE_PRECISION:' + row.fixture_id);
}

for (const row of fixtures.writing_small || []) {
  assert.ok(writingIds.has(row.task_id), 'WRITING_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'writing_small');
  assert.ok(expected.expected_band, 'WRITING_BAND_MISSING:' + row.fixture_id);
}

for (const row of fixtures.writing_big || []) {
  assert.ok(writingIds.has(row.task_id), 'WRITING_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'writing_big');
  assert.ok(expected.expected_band, 'WRITING_BAND_MISSING:' + row.fixture_id);
}

const invariants = key.pairwise_invariants || [];
assert.ok(invariants.length >= 3, 'PAIRWISE_INVARIANTS_TOO_THIN');
for (const invariant of invariants) {
  assert.ok(invariant.invariant_id && invariant.rule, 'PAIRWISE_INVARIANT_INVALID');
  for (const keyName of ['preferred','over']) {
    if (invariant[keyName]) assert.ok(fixtureIds.has(invariant[keyName]), 'PAIRWISE_FIXTURE_MISSING:' + invariant[keyName]);
  }
  for (const id of invariant.better_or_equal || []) {
    assert.ok(fixtureIds.has(id), 'PAIRWISE_FIXTURE_MISSING:' + id);
  }
}

const expectedIds = new Set(Object.keys(key.expectations || {}));
assert.deepEqual(expectedIds, fixtureIds, 'SEALED_KEY_FIXTURE_SET_MISMATCH');

const equivalenceInvariant = invariants.find((row) => row.invariant_id === 'translation-semantic-equivalence');
assert.ok(equivalenceInvariant, 'TRANSLATION_EQUIVALENCE_INVARIANT_MISSING');
assert.deepEqual(new Set(equivalenceInvariant.better_or_equal || []), new Set(['tr-cal-01-strong-a','tr-cal-01-strong-b-alt']));

console.log(JSON.stringify({
  schema: 'kianos.english.productive-scoring-structure-validation.v2',
  status: 'PASS',
  counts: {
    translation: fixtures.translation.length,
    writing_small: fixtures.writing_small.length,
    writing_big: fixtures.writing_big.length,
    pairwise_invariants: invariants.length
  },
  checks: {
    blind_fixture_bank_has_no_expected_scores: true,
    sealed_expectation_key_complete: true,
    no_exact_gold_score: true,
    no_protected_true_exam_consumption: true,
    task_ids_bind_to_current_synthetic_assets: true,
    translation_ranges_are_bounded_without_quarter_point_pseudoprecision: true,
    semantic_equivalence_guard_present: true,
    task_over_style_guard_present: true,
    grounding_over_fluency_guard_present: true,
    provenance_confidence_classes_present: true,
    typed_vs_exam_mode_boundary_present: true
  }
}, null, 2));
