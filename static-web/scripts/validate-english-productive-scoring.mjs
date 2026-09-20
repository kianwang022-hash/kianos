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
assert.equal(fixtures.scoring_standard_version, 'english.productive-scoring.v2');
assert.equal(fixtures.rules?.protected_true_exam_consumption, false);
assert.equal(fixtures.rules?.learner_visible, false);
assert.equal(fixtures.rules?.expected_results_sealed_separately, keyPath);
assert.ok(!Object.prototype.hasOwnProperty.call(fixtures.rules || {}, 'non_length_fixture_control'),
  'BLIND_RULE_LEAK_NON_LENGTH_CONTROL');
assert.match(String(fixtures.rules?.blind_metadata_policy || ''), /opaque/i,
  'BLIND_METADATA_POLICY_MISSING');

assert.equal(key.schema, 'kianos.english.productive_scoring_fixtures_key.v1');
assert.equal(key.source_bank, fixturesPath);
assert.equal(key.scoring_standard_version, 'english.productive-scoring.v2');
assert.equal(key.exact_score_gold, false);

for (const marker of [
  'Band first, not fake weighted arithmetic',
  'Translation fidelity first',
  'First output is the score anchor',
  'Score uncertainty is mandatory',
  'Independent re-score trigger',
  'Independent re-score trigger — all productive channels',
  'Topic-package guard',
  'Writing length / delivery handling',
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
const forbiddenBlindIdToken = /(strong|weak|low|mid|wrong|misread|missing|under|length|error|fragment|complete|polished|plain|fluent|major|reference)/i;
const assertExactKeys = (row, allowed, label) => {
  assert.deepEqual(
    Object.keys(row).sort(),
    [...allowed].sort(),
    'BLIND_FIXTURE_METADATA_LEAK:' + label + ':' + row.fixture_id
  );
};
const allFixtures = [
  ...(fixtures.translation || []),
  ...(fixtures.translation_section || []),
  ...(fixtures.writing_small || []),
  ...(fixtures.writing_big || [])
];

for (const row of allFixtures) {
  assert.ok(row.fixture_id && !fixtureIds.has(row.fixture_id), 'DUPLICATE_FIXTURE:' + row.fixture_id);
  fixtureIds.add(row.fixture_id);
  assert.ok(!forbiddenBlindIdToken.test(row.fixture_id), 'BLIND_FIXTURE_ID_SEMANTIC_LEAK:' + row.fixture_id);
  for (const forbiddenField of ['controlled_axis','calibration_axis','controlled_features','guardrail','expected_relation','expected_band','expected_range_hint','expected_uncertainty','requires_independent_rescore']) {
    assert.ok(!Object.prototype.hasOwnProperty.call(row, forbiddenField),
      'BLIND_FIXTURE_FIELD_LEAK:' + forbiddenField + ':' + row.fixture_id);
  }
  const hasSingleResponse = row.response && String(row.response).trim();
  const hasSectionResponses = Array.isArray(row.responses) && row.responses.length > 0;
  assert.ok(hasSingleResponse || hasSectionResponses, 'EMPTY_FIXTURE_RESPONSE:' + row.fixture_id);
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_relation'), 'BLIND_FIXTURE_LEAK_EXPECTED_RELATION:' + row.fixture_id);
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_band'), 'BLIND_FIXTURE_LEAK_EXPECTED_BAND:' + row.fixture_id);
  assert.ok(!Object.prototype.hasOwnProperty.call(row, 'expected_range_hint'), 'BLIND_FIXTURE_LEAK_EXPECTED_RANGE:' + row.fixture_id);
  assert.ok(key.expectations?.[row.fixture_id], 'SEALED_EXPECTATION_MISSING:' + row.fixture_id);
}

for (const row of fixtures.translation || []) {
  assert.match(row.fixture_id, /^fx-[0-9a-f]{6}$/, 'TRANSLATION_FIXTURE_ID_NOT_OPAQUE:' + row.fixture_id);
  assertExactKeys(row, ['fixture_id','task_id','source_segment','response'], 'translation');
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

for (const row of fixtures.translation_section || []) {
  assert.match(row.fixture_id, /^fx-[0-9a-f]{6}$/, 'TRANSLATION_SECTION_ID_NOT_OPAQUE:' + row.fixture_id);
  assertExactKeys(row, ['fixture_id','task_id','unit','responses'], 'translation_section');
  assert.ok(translationIds.has(row.task_id), 'TRANSLATION_SECTION_TASK_NOT_CURRENT:' + row.fixture_id);
  assert.equal(row.unit, 'complete_section', 'TRANSLATION_SECTION_UNIT_INVALID:' + row.fixture_id);
  assert.equal(row.responses?.length, 5, 'TRANSLATION_SECTION_MUST_HAVE_FIVE_SEGMENTS:' + row.fixture_id);
  assert.deepEqual(row.responses.map((x) => x.source_segment), [1,2,3,4,5],
    'TRANSLATION_SECTION_SEGMENT_ORDER_INVALID:' + row.fixture_id);
  for (const item of row.responses) {
    assertExactKeys(item, ['source_segment','response'], 'translation_section_response');
    assert.ok(String(item.response || '').trim(), 'TRANSLATION_SECTION_EMPTY_SEGMENT:' + row.fixture_id);
  }
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'translation');
  assert.ok(Array.isArray(expected.expected_range_hint) && expected.expected_range_hint.length === 2,
    'TRANSLATION_SECTION_RANGE_MISSING:' + row.fixture_id);
  const [low, high] = expected.expected_range_hint.map(Number);
  assert.ok(Number.isFinite(low) && Number.isFinite(high) && low >= 0 && high <= 10 && low <= high,
    'TRANSLATION_SECTION_RANGE_INVALID:' + row.fixture_id);
  const isHalfPoint = (n) => Number.isInteger(n * 2);
  assert.ok(isHalfPoint(low) && isHalfPoint(high), 'TRANSLATION_SECTION_RANGE_FAKE_PRECISION:' + row.fixture_id);
}

const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;

for (const row of fixtures.writing_small || []) {
  assert.match(row.fixture_id, /^fx-[0-9a-f]{6}$/, 'SMALL_FIXTURE_ID_NOT_OPAQUE:' + row.fixture_id);
  assertExactKeys(row, ['fixture_id','task_id','response'], 'writing_small');
  assert.ok(writingIds.has(row.task_id), 'WRITING_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'writing_small');
  assert.ok(expected.expected_band, 'WRITING_BAND_MISSING:' + row.fixture_id);
  const wc = wordCount(row.response);
  const isLengthStress = expected.calibration_axis === 'length_deficit';
  if (isLengthStress) {
    assert.ok(wc < 80, 'SMALL_LENGTH_STRESS_NOT_SHORT:' + row.fixture_id);
    assert.equal(expected.requires_independent_rescore, true, 'SMALL_LENGTH_STRESS_MUST_RESCORE:' + row.fixture_id);
  } else {
    assert.ok(wc >= 80 && wc <= 120, 'SMALL_NON_LENGTH_FIXTURE_CONFOUNDED_BY_LENGTH:' + row.fixture_id + ':' + wc);
  }
}

for (const row of fixtures.writing_big || []) {
  assert.match(row.fixture_id, /^fx-[0-9a-f]{6}$/, 'BIG_FIXTURE_ID_NOT_OPAQUE:' + row.fixture_id);
  assertExactKeys(row, ['fixture_id','task_id','response'], 'writing_big');
  assert.ok(writingIds.has(row.task_id), 'WRITING_FIXTURE_TASK_NOT_CURRENT:' + row.fixture_id);
  const expected = key.expectations[row.fixture_id];
  assert.equal(expected.channel, 'writing_big');
  assert.ok(expected.expected_band, 'WRITING_BAND_MISSING:' + row.fixture_id);
  const wc = wordCount(row.response);
  const isLengthStress = expected.calibration_axis === 'length_deficit';
  if (isLengthStress) {
    assert.ok(wc < 160, 'BIG_LENGTH_STRESS_NOT_SHORT:' + row.fixture_id);
    assert.equal(expected.requires_independent_rescore, true, 'BIG_LENGTH_STRESS_MUST_RESCORE:' + row.fixture_id);
  } else {
    assert.ok(wc >= 160 && wc <= 200, 'BIG_NON_LENGTH_FIXTURE_CONFOUNDED_BY_LENGTH:' + row.fixture_id + ':' + wc);
  }
}

const invariants = key.pairwise_invariants || [];
assert.ok(invariants.length >= 6, 'PAIRWISE_INVARIANTS_TOO_THIN');
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
assert.deepEqual(new Set(equivalenceInvariant.better_or_equal || []), new Set(['fx-a5c741','fx-b84d30']));

for (const requiredInvariant of [
  'translation-section-major-error-visible',
  'small-length-deficit-matters',
  'big-length-deficit-matters'
]) {
  assert.ok(invariants.some((row) => row.invariant_id === requiredInvariant),
    'REQUIRED_SCORING_INVARIANT_MISSING:' + requiredInvariant);
}

console.log(JSON.stringify({
  schema: 'kianos.english.productive-scoring-structure-validation.v2',
  status: 'PASS',
  counts: {
    translation_segment: fixtures.translation.length,
    translation_section: (fixtures.translation_section || []).length,
    writing_small: fixtures.writing_small.length,
    writing_big: fixtures.writing_big.length,
    pairwise_invariants: invariants.length
  },
  checks: {
    blind_fixture_bank_has_no_expected_scores: true,
    blind_fixture_ids_are_opaque: true,
    blind_fixture_ids_do_not_encode_channel: true,
    blind_fixture_rows_have_no_calibration_metadata: true,
    blind_presentation_order_is_non_ordinal: true,
    sealed_expectation_key_complete: true,
    scoring_standard_version_bound: true,
    no_exact_gold_score: true,
    no_protected_true_exam_consumption: true,
    task_ids_bind_to_current_synthetic_assets: true,
    translation_ranges_are_bounded_without_quarter_point_pseudoprecision: true,
    semantic_equivalence_guard_present: true,
    complete_translation_section_fixture_present: true,
    task_over_style_guard_present: true,
    grounding_over_fluency_guard_present: true,
    writing_length_deconfounding_present: true,
    writing_length_stress_present: true,
    provenance_confidence_classes_present: true,
    typed_vs_exam_mode_boundary_present: true
  }
}, null, 2));
