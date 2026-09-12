import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const bankPath = path.join(repoRoot, 'content/english/source/question_bank.v1.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

const ids = new Set([
  'english1-2022-translation-main-q47',
  'english1-2022-translation-main-q48',
  'english1-2022-translation-main-q49',
  'english1-2022-translation-main-q50',
  'english1-2025-translation-main-q45',
  'english1-2025-translation-main-q46',
  'english1-2025-translation-main-q47'
]);

const rows = (bank.questions_or_prompts || [])
  .filter((row) => ids.has(String(row?.id || row?.question_id || '')))
  .sort((a, b) => String(a.id || a.question_id || '').localeCompare(String(b.id || b.question_id || '')));

if (rows.length !== ids.size) {
  const found = new Set(rows.map((row) => String(row?.id || row?.question_id || '')));
  const missing = [...ids].filter((id) => !found.has(id));
  throw new Error(`INSPECTION_ROWS_MISSING:${missing.join('|')}`);
}

const out = process.env.KIANOS_TRANSLATION_SOURCE_INSPECTION_OUT
  || path.join(process.cwd(), 'translation-source-inspection.json');
fs.writeFileSync(out, `${JSON.stringify({ schema: 'kianos.translation.source-debt-inspection.v1', rows }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${rows.length} inspected rows to ${out}`);
