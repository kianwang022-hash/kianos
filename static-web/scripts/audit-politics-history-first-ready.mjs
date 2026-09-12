import fs from 'node:fs';
import path from 'node:path';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNING_ROOT = path.join(repoRoot, 'content/politics/learning/history');
const REGIONS = path.join(repoRoot, 'content/politics/source/politics_unified_regions.v1.jsonl');
const NODE_MANIFEST = path.join(repoRoot, 'content/politics/source/nodes/manifest.json');
const SOURCE_REVIEW = path.join(LEARNING_ROOT, 'source-review.json');
const SEMANTIC_REVIEW = path.join(LEARNING_ROOT, 'semantic-review.json');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}
function asList(value) { return Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function countByCode(rows) {
  return rows.reduce((counts, row) => {
    const code = String(row?.code || 'UNKNOWN');
    counts[code] = (counts[code] || 0) + 1;
    return counts;
  }, {});
}

const nodeManifest = readJson(NODE_MANIFEST);
const sourceReview = readJson(SOURCE_REVIEW);
const semanticReview = readJson(SEMANTIC_REVIEW);
const failures = [];

if (semanticReview?.status !== 'CURRENT_MAINLINE_SCAN_COMPLETE') {
  failures.push({ code: 'HISTORY_SEMANTIC_REVIEW_NOT_COMPLETE', status: semanticReview?.status || 'missing' });
}
if (sourceReview?.status !== 'CURRENT_REVIEW_COMPLETE') {
  failures.push({ code: 'HISTORY_SOURCE_REVIEW_NOT_COMPLETE', status: sourceReview?.status || 'missing' });
}
if (sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 !== nodeManifest?.canonical_row_digest_sha256) {
  failures.push({
    code: 'HISTORY_SOURCE_REVIEW_SNAPSHOT_STALE',
    reviewed: sourceReview?.review_snapshot?.node_registry_canonical_row_digest_sha256 || '',
    current: nodeManifest?.canonical_row_digest_sha256 || ''
  });
}

const chapterNames = fs.readdirSync(LEARNING_ROOT)
  .filter((name) => /^ch\d+\.json$/i.test(name))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const orderedCanonicalUnitIds = [];
const learnerGroups = [];
const seenCanonical = new Set();
for (const name of chapterNames) {
  const chapterCode = path.basename(name, '.json').toLowerCase();
  const raw = readJson(path.join(LEARNING_ROOT, name));
  for (const unit of asList(raw?.units)) {
    const represented = uniq([
      String(unit?.natural_unit_id || ''),
      ...asList(unit?.embedded_natural_unit_ids).map(String)
    ]);
    if (!represented.length) continue;
    const learnerKey = `${chapterCode}::${represented[0]}`;
    learnerGroups.push({ chapterCode, learnerKey, primaryId: represented[0], represented });
    for (const id of represented) {
      if (seenCanonical.has(id)) {
        failures.push({ code: 'HISTORY_CANONICAL_UNIT_REPRESENTED_TWICE', unit_id: id });
        continue;
      }
      seenCanonical.add(id);
      orderedCanonicalUnitIds.push(id);
    }
  }
}

const regionRows = readJsonl(REGIONS).filter((row) => row?.status === 'canonical' && row?.subject === 'HISTORY');
const regionByUnit = new Map(regionRows.map((row) => [String(row.natural_unit_id), row]));
const canonicalRegionIds = new Set(regionByUnit.keys());

const missingRegions = orderedCanonicalUnitIds.filter((id) => !regionByUnit.has(id));
const unrepresentedRegions = [...canonicalRegionIds].filter((id) => !seenCanonical.has(id));
if (missingRegions.length) failures.push({ code: 'HISTORY_LEARNER_UNIT_HAS_NO_CANONICAL_REGION', unit_ids: missingRegions });
if (unrepresentedRegions.length) failures.push({ code: 'HISTORY_CANONICAL_REGION_NOT_REPRESENTED', unit_ids: unrepresentedRegions });

// Independent oracle from Current canonical ownership: each later required Natural Unit overwrites earlier ownership.
const expectedOwnerByQuestion = new Map();
const allQuestionRefsByUnit = new Map();
for (const unitId of orderedCanonicalUnitIds) {
  const refs = asList(regionByUnit.get(unitId)?.xiao_question_refs).map(String);
  allQuestionRefsByUnit.set(unitId, refs);
  for (const questionId of refs) expectedOwnerByQuestion.set(questionId, unitId);
}

const learnerGroupByCanonicalOwner = new Map();
for (const group of learnerGroups) for (const id of group.represented) learnerGroupByCanonicalOwner.set(id, group);

const appearances = new Map();
const currentChapters = new Map();
for (const name of chapterNames) {
  const chapterCode = path.basename(name, '.json').toLowerCase();
  const current = loadPoliticsChapterCurrent('history', chapterCode);
  currentChapters.set(chapterCode, current);
  for (const unit of current?.units || []) {
    const represented = uniq([
      String(unit?.unitId || ''),
      ...asList(unit?.representedNaturalUnitIds).map(String)
    ]);
    for (const question of unit?.questions || []) {
      const id = String(question?.id || '');
      if (!id) continue;
      if (!appearances.has(id)) appearances.set(id, []);
      appearances.get(id).push({
        chapter: chapterCode,
        runtimeUnitId: String(unit?.unitId || ''),
        represented
      });
    }
  }
}

const expectedIds = new Set(expectedOwnerByQuestion.keys());
const runtimeIds = new Set(appearances.keys());
const missingQuestions = [...expectedIds].filter((id) => !runtimeIds.has(id));
const extraQuestions = [...runtimeIds].filter((id) => !expectedIds.has(id));
if (missingQuestions.length) failures.push({ code: 'HISTORY_FIRST_READY_QUESTIONS_MISSING', question_ids: missingQuestions });
if (extraQuestions.length) failures.push({ code: 'HISTORY_FIRST_READY_QUESTIONS_EXTRA', question_ids: extraQuestions });

const duplicateQuestions = [];
const wrongOwners = [];
for (const [questionId, expectedOwner] of expectedOwnerByQuestion.entries()) {
  const rows = appearances.get(questionId) || [];
  if (rows.length !== 1) {
    duplicateQuestions.push({ question_id: questionId, appearances: rows });
    continue;
  }
  const row = rows[0];
  if (!row.represented.includes(expectedOwner)) {
    wrongOwners.push({
      question_id: questionId,
      expected_last_owner: expectedOwner,
      runtime_chapter: row.chapter,
      runtime_unit_id: row.runtimeUnitId,
      runtime_represented: row.represented
    });
  }
}
if (duplicateQuestions.length) failures.push({ code: 'HISTORY_FIRST_READY_NOT_EXACTLY_ONCE', rows: duplicateQuestions });
if (wrongOwners.length) failures.push({ code: 'HISTORY_FIRST_READY_OWNER_MISMATCH', rows: wrongOwners });

// C04 K03-K07 is deliberately one continuous learner segment. First-ready may move questions inside
// the represented evidence set, but must never fragment this learner journey for bookkeeping convenience.
const c04Cluster = [
  'POL27-CF-HISTORY-C04-K03',
  'POL27-CF-HISTORY-C04-K04',
  'POL27-CF-HISTORY-C04-K05',
  'POL27-CF-HISTORY-C04-K06',
  'POL27-CF-HISTORY-C04-K07'
];
const c04 = currentChapters.get('ch04');
const c04CarrierUnits = (c04?.units || []).filter((unit) => {
  const represented = new Set(asList(unit?.representedNaturalUnitIds).map(String));
  return c04Cluster.some((id) => represented.has(id));
});
if (c04CarrierUnits.length !== 1) {
  failures.push({ code: 'HISTORY_C04_CONTINUOUS_SEGMENT_FRAGMENTED', carrier_count: c04CarrierUnits.length });
} else {
  const represented = new Set(asList(c04CarrierUnits[0]?.representedNaturalUnitIds).map(String));
  const missing = c04Cluster.filter((id) => !represented.has(id));
  if (missing.length) failures.push({ code: 'HISTORY_C04_CONTINUOUS_SEGMENT_INCOMPLETE', missing });
}

const countsByCanonicalOwner = Object.fromEntries(orderedCanonicalUnitIds.map((id) => [id, 0]));
for (const owner of expectedOwnerByQuestion.values()) countsByCanonicalOwner[owner] = (countsByCanonicalOwner[owner] || 0) + 1;
const countsByLearnerUnit = Object.fromEntries(learnerGroups.map((group) => [group.learnerKey, 0]));
for (const owner of expectedOwnerByQuestion.values()) {
  const group = learnerGroupByCanonicalOwner.get(owner);
  if (group) countsByLearnerUnit[group.learnerKey] = (countsByLearnerUnit[group.learnerKey] || 0) + 1;
}

const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'HISTORY_GLOBAL_FIRST_READY',
  rule: 'CURRENT_CANONICAL_LAST_NECESSARY_OWNER',
  canonical_natural_units: orderedCanonicalUnitIds.length,
  learner_units: learnerGroups.length,
  canonical_regions: regionRows.length,
  expected_unique_questions: expectedOwnerByQuestion.size,
  runtime_unique_questions: runtimeIds.size,
  c04_continuous_cluster_size: c04Cluster.length,
  counts_by_canonical_owner: countsByCanonicalOwner,
  counts_by_learner_unit: countsByLearnerUnit,
  failure_count: failures.length,
  failures
};

const compact = {
  status: report.status,
  scope: report.scope,
  rule: report.rule,
  canonical_natural_units: report.canonical_natural_units,
  learner_units: report.learner_units,
  canonical_regions: report.canonical_regions,
  expected_unique_questions: report.expected_unique_questions,
  runtime_unique_questions: report.runtime_unique_questions,
  c04_continuous_cluster_size: report.c04_continuous_cluster_size,
  failure_count: report.failure_count,
  failure_codes: countByCode(failures),
  failure_sample: failures.slice(0, 8)
};

console.log('POLITICS_HISTORY_FIRST_READY_AUDIT');
console.log(JSON.stringify(process.env.KIANOS_AUDIT_VERBOSE === '1' ? report : compact, null, 2));
if (failures.length) process.exit(2);
