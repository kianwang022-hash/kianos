import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const POLITICS = path.join(repoRoot, 'content/politics');
const learningManifest = JSON.parse(fs.readFileSync(path.join(POLITICS, 'learning/manifest.json'), 'utf8'));
const regions = fs.readFileSync(path.join(POLITICS, 'source/politics_unified_regions.v1.jsonl'), 'utf8')
  .split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);

function unitIds(raw) {
  if (Array.isArray(raw?.unit_projections)) return raw.unit_projections.map((unit) => unit?.natural_unit_id).filter(Boolean);
  if (Array.isArray(raw?.units)) return raw.units.map((unit) => unit?.natural_unit_id).filter(Boolean);
  if (raw?.unit?.natural_unit_id) return [raw.unit.natural_unit_id];
  return [];
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

const report = {
  canonicalRegionRows: canonicalRows.length,
  canonicalNaturalUnits: byUnit.size,
  representedNaturalUnits: representedRows.length,
  missingNaturalUnits: missingRegions.map((row) => ({
    subject: row.subject,
    natural_unit_id: row.natural_unit_id,
    title: row.title,
    priority: row.chat_decision?.priority || '',
    p2_provisional: Boolean(row.p2_provisional),
    xiao_question_refs: row.xiao_question_refs || []
  })),
  canonicalQuestionRefs: allQuestions.size,
  representedQuestionRefs: representedQuestions.size,
  missingQuestionRefs: missingQuestions
};

console.log('POLITICS_COVERAGE_AUDIT');
console.log(JSON.stringify(report, null, 2));
