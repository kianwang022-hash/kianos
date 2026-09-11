import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const K03_UNIT_ID = 'POL27-CF-MARX-C02-K03';
const K03_REGION_ID = 'POL27-REGION-PILOT-MARX-REG-01';
const PARENT_UNIT_ID = 'POL27-CF-MARX-C02-S01';
const EXPECTED_K03_QUESTION_COUNT = 15;

function readJsonl(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(JSON.parse);
}

function fail(message) {
  console.error(`POLITICS_K03_PILOT_AUDIT_FAIL: ${message}`);
  process.exitCode = 1;
}

function sourceQuestionId(canonicalId) {
  const match = String(canonicalId || '').match(/^X1000-([A-Z]+)-([SM])-(\d{3})$/i);
  if (!match) return String(canonicalId || '');
  const subject = match[1].toLowerCase();
  const kind = match[2].toUpperCase() === 'S' ? 'single' : 'multiple';
  return `xiao_2027_${subject}_${kind}_${match[3]}`;
}

function questionRowId(row) {
  for (const key of ['question_id', 'asset_id', 'id', 'stable_id', 'source_id']) {
    if (typeof row?.[key] === 'string' && row[key]) return row[key];
  }
  return '';
}

const regions = readJsonl('content/politics/source/politics_unified_regions.v1.jsonl');
const ownerMatches = regions.filter((row) => row?.natural_unit_id === K03_UNIT_ID || row?.unified_region_id === K03_REGION_ID);
const exactOwnerMatches = ownerMatches.filter((row) => row?.natural_unit_id === K03_UNIT_ID && row?.unified_region_id === K03_REGION_ID);

if (exactOwnerMatches.length !== 1) {
  fail(`expected exactly one authoritative K03 owner row, found ${exactOwnerMatches.length}`);
}

const owner = exactOwnerMatches[0] || null;
const ownerQuestionIds = [...new Set((owner?.xiao_question_refs || []).map(String).filter(Boolean))];
if (owner && owner?.frozen_pilot !== true) fail('authoritative K03 owner must remain frozen_pilot=true');
if (owner && ownerQuestionIds.length !== EXPECTED_K03_QUESTION_COUNT) {
  fail(`expected ${EXPECTED_K03_QUESTION_COUNT} K03 questions, found ${ownerQuestionIds.length}`);
}

const parent = regions.find((row) => row?.natural_unit_id === PARENT_UNIT_ID) || null;
const parentQuestionIds = new Set((parent?.xiao_question_refs || []).map(String));
const sharedWithParentRegion = ownerQuestionIds.filter((id) => parentQuestionIds.has(id));
const k03OnlyRelativeToParentRegion = ownerQuestionIds.filter((id) => !parentQuestionIds.has(id));

const questionRows = readJsonl('content/politics/source/xiao_2027_questions.jsonl');
const sourceQuestionIds = new Set(questionRows.map(questionRowId).filter(Boolean));
const missingQuestionRows = ownerQuestionIds.filter((id) => !sourceQuestionIds.has(sourceQuestionId(id)));
if (missingQuestionRows.length) fail(`unresolved Xiao1000 rows: ${missingQuestionRows.join(', ')}`);

console.log('POLITICS_K03_PILOT_AUDIT');
console.log(JSON.stringify({
  status: process.exitCode ? 'FAIL' : 'PASS',
  owner: {
    naturalUnitId: owner?.natural_unit_id || null,
    regionId: owner?.unified_region_id || null,
    frozenPilot: owner?.frozen_pilot === true,
    questionCount: ownerQuestionIds.length,
    questionIds: ownerQuestionIds
  },
  parentRegionOverlap: {
    parentNaturalUnitId: parent?.natural_unit_id || null,
    sharedCount: sharedWithParentRegion.length,
    sharedQuestionIds: sharedWithParentRegion,
    k03OnlyCount: k03OnlyRelativeToParentRegion.length
  },
  resolvedQuestionRows: ownerQuestionIds.length - missingQuestionRows.length,
  missingQuestionRows
}));
