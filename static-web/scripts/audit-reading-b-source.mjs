import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const bank = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/english/source/question_bank.v1.json'), 'utf8'));
const layout = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/english/source/reading_b_layout.v1.json'), 'utf8'));
const sets = (bank.passage_or_sets || []).filter((set) => set?.section === 'reading_part_b');
const questions = bank.questions_or_prompts || [];
const bySet = new Map();
for (const q of questions) {
  const id = String(q?.set_id || '');
  if (!bySet.has(id)) bySet.set(id, []);
  bySet.get(id).push(q);
}

const compact = (value, max = 500) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
const directionsFromRaw = (raw) => {
  const text = String(raw || '');
  const matches = [...text.matchAll(/Directions\s*:?\s*/gi)];
  const relevant = matches.find((match) => /(?:Questions?|questions?)\s*4\s*1\s*[-–—]?\s*4\s*5|4\s*1\s*[-–—]\s*4\s*5/.test(text.slice(match.index, match.index + 1400)));
  if (!relevant) return '';
  const section = text.slice(relevant.index);
  const block = section.match(/^Directions\s*:?\s*([\s\S]*?)(?:\n\s*\n)/i);
  return compact(block?.[1] || '', 1000);
};

const expected = {
  GAP_MATCHING: 8,
  HEADING_MATCHING: 3,
  PARAGRAPH_ORDERING: 9,
  OTHER: 2
};
const counts = {};
const issues = [];
const objects = [];

for (const set of sets.sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
  const context = set?.context || {};
  const groupType = String(context.question_group_type || '').trim();
  counts[groupType] = (counts[groupType] || 0) + 1;
  const directions = compact(context.directions || directionsFromRaw(context.raw_text), 1000);
  const qs = (bySet.get(String(set.id || '')) || []).sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
  const sourcePool = Array.isArray(context.shared_option_pool) ? context.shared_option_pool : [];
  const layoutObject = layout?.objects?.[set.id] || null;

  if (!groupType) issues.push(`${set.id}: missing question_group_type`);
  if (!directions) issues.push(`${set.id}: directions not recoverable`);
  if (qs.length !== 5) issues.push(`${set.id}: expected 5 questions, got ${qs.length}`);
  if (![7, 8].includes(sourcePool.length)) issues.push(`${set.id}: expected 7/8 candidate labels, got ${sourcePool.length}`);
  if (groupType === 'PARAGRAPH_ORDERING') {
    const skeleton = context.ordering_skeleton || layoutObject?.ordering_skeleton;
    if (!Array.isArray(skeleton) || !skeleton.length) issues.push(`${set.id}: ordering skeleton missing`);
  }

  objects.push({
    id: set.id,
    groupType,
    directionsRecoveredFrom: context.directions ? 'context.directions' : 'context.raw_text',
    candidateLabelCount: sourcePool.length,
    questionCount: qs.length,
    orderingSkeleton: groupType === 'PARAGRAPH_ORDERING' ? (context.ordering_skeleton || layoutObject?.ordering_skeleton || []) : undefined
  });
}

for (const [type, count] of Object.entries(expected)) {
  if ((counts[type] || 0) !== count) issues.push(`group count ${type}: expected ${count}, got ${counts[type] || 0}`);
}
if (sets.length !== 22) issues.push(`expected 22 Reading B sets, got ${sets.length}`);

const report = {
  schema: 'kianos.english.reading_b.source_audit.v2',
  readingBSetCount: sets.length,
  groupTypeCounts: counts,
  orderingLayoutOwnerCount: Object.keys(layout?.objects || {}).length,
  issueCount: issues.length,
  issues,
  objects
};
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
