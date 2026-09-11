import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const POLITICS = path.join(repoRoot, 'content/politics');
const learningManifest = JSON.parse(fs.readFileSync(path.join(POLITICS, 'learning/manifest.json'), 'utf8'));
const regions = fs.readFileSync(path.join(POLITICS, 'source/politics_unified_regions.v1.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
const questionRows = fs.readFileSync(path.join(POLITICS, 'source/xiao_2027_questions.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);

function projectedUnits(raw) {
  if (Array.isArray(raw?.unit_projections)) return raw.unit_projections;
  if (Array.isArray(raw?.units)) return raw.units;
  if (raw?.unit && typeof raw.unit === 'object') return [raw.unit];
  return [];
}

function unitIds(raw) {
  return projectedUnits(raw).flatMap((unit) => [unit?.natural_unit_id, ...(Array.isArray(unit?.embedded_natural_unit_ids) ? unit.embedded_natural_unit_ids : [])]).filter(Boolean);
}

function firstString(value, predicate, depth = 0) {
  if (typeof value === 'string') return predicate(value) ? value : '';
  if (!value || typeof value !== 'object' || depth > 5) return '';
  for (const entry of Array.isArray(value) ? value : Object.values(value)) {
    const found = firstString(entry, predicate, depth + 1);
    if (found) return found;
  }
  return '';
}

function sourceQuestionId(row) {
  return firstString(row, (value) => /^xiao_2027_(?:marx|history|mao|xi|ethics)_(?:single|multiple)_\d+$/i.test(value));
}

const SOURCE_TO_CANONICAL_SUBJECT = Object.freeze({
  marx: 'MARX',
  history: 'HISTORY',
  mao: 'MAO',
  xi: 'XI',
  ethics: 'ETHICS'
});

function canonicalQuestionId(sourceId) {
  const match = String(sourceId || '').match(/^xiao_2027_(marx|history|mao|xi|ethics)_(single|multiple)_(\d+)$/i);
  if (!match) return '';
  const subject = SOURCE_TO_CANONICAL_SUBJECT[match[1].toLowerCase()];
  const kind = match[2].toLowerCase() === 'single' ? 'S' : 'M';
  return `X1000-${subject}-${kind}-${String(Number(match[3])).padStart(3, '0')}`;
}

const represented = new Set();
for (const [subject, row] of Object.entries(learningManifest.subjects || {})) {
  const root = path.join(repoRoot, String(row.path || `content/politics/learning/${subject}`).replace(/\/$/, ''));
  if (!fs.existsSync(root)) continue;
  for (const name of fs.readdirSync(root).filter((name) => /^ch\d+\.json$/i.test(name))) {
    const raw = JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
    for (const id of unitIds(raw)) represented.add(id);
  }
}

const currentSubjects = new Set(['MARX', 'HISTORY', 'MAO', 'XI', 'ETHICS']);
const canonicalRows = regions.filter((row) => row?.status === 'canonical' && currentSubjects.has(String(row?.subject || '').toUpperCase()));
const byUnit = new Map();
for (const row of canonicalRows) if (row?.natural_unit_id && !byUnit.has(row.natural_unit_id)) byUnit.set(row.natural_unit_id, row);

const missingRegions = [...byUnit.values()].filter((row) => !represented.has(row.natural_unit_id));
const representedRows = [...byUnit.values()].filter((row) => represented.has(row.natural_unit_id));
const allQuestions = new Set([...byUnit.values()].flatMap((row) => row.xiao_question_refs || []));
const representedQuestions = new Set(representedRows.flatMap((row) => row.xiao_question_refs || []));
const missingQuestions = [...allQuestions].filter((id) => !representedQuestions.has(id));

const sourceQuestionIds = questionRows.map(sourceQuestionId).filter(Boolean);
const sourceCanonicalQuestionIds = new Set(sourceQuestionIds.map(canonicalQuestionId).filter(Boolean));
const unlinkedTrainingQuestionIds = [...sourceCanonicalQuestionIds].filter((id) => !allQuestions.has(id));

const report = {
  canonicalRegionRows: canonicalRows.length,
  canonicalNaturalUnits: byUnit.size,
  representedNaturalUnits: representedRows.length,
  missingNaturalUnits: missingRegions.map((row) => ({
    subject: row.subject,
    natural_unit_id: row.natural_unit_id,
    title: row.title,
    frozen_pilot: Boolean(row.frozen_pilot),
    priority: row.chat_decision?.priority || '',
    p2_provisional: Boolean(row.p2_provisional),
    xiao_question_refs: row.xiao_question_refs || []
  })),
  canonicalQuestionRefs: allQuestions.size,
  representedQuestionRefs: representedQuestions.size,
  missingQuestionRefs: missingQuestions,
  questionDatabaseRows: questionRows.length,
  trainingQuestionRowsByIdPattern: sourceQuestionIds.length,
  referenceOrNonQuestionRowsByIdPattern: questionRows.length - sourceQuestionIds.length,
  trainingQuestionIds: sourceCanonicalQuestionIds.size,
  unlinkedTrainingQuestionCount: unlinkedTrainingQuestionIds.length,
  unlinkedTrainingQuestionIds
};

console.log('POLITICS_COVERAGE_AUDIT');
console.log(JSON.stringify(report, null, 2));
