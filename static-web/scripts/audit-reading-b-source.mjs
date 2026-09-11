import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const bank = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/english/source/question_bank.v1.json'), 'utf8'));
const sets = (bank.passage_or_sets || []).filter((set) => set?.section === 'reading_part_b');
const questions = bank.questions_or_prompts || [];
const bySet = new Map();
for (const q of questions) {
  const id = String(q?.set_id || '');
  if (!bySet.has(id)) bySet.set(id, []);
  bySet.get(id).push(q);
}

const compact = (value, max = 500) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
const sourceCandidateCount = (set) => {
  const context = set?.context || {};
  const sources = [set?.candidates, set?.options, set?.choices, context?.candidates, context?.options, context?.choices, context?.shared_option_pool, context?.headings];
  for (const source of sources) {
    if (Array.isArray(source)) return source.length;
    if (source && typeof source === 'object') return Object.keys(source).length;
  }
  return 0;
};

const signature = new Map();
for (const set of sets) {
  const qs = (bySet.get(String(set.id || '')) || []).sort((a, b) => Number(a?.ordinal || 0) - Number(b?.ordinal || 0));
  const context = set?.context || {};
  const instruction = compact(context.instruction || set.instruction || '');
  const subtitle = compact(context.subtitle || '');
  const sig = JSON.stringify({
    contextKeys: Object.keys(context).sort(),
    questionCount: qs.length,
    candidateCount: sourceCandidateCount(set),
    questionOptionKinds: [...new Set(qs.map((q) => Array.isArray(q.options) ? 'array' : q.options && typeof q.options === 'object' ? 'object' : typeof q.options))].sort(),
    promptShapes: [...new Set(qs.map((q) => compact(q.prompt, 120)))].slice(0, 3),
    hasInstruction: Boolean(instruction),
    instruction,
    subtitle
  });
  if (!signature.has(sig)) signature.set(sig, { count: 0, examples: [] });
  const entry = signature.get(sig);
  entry.count += 1;
  if (entry.examples.length < 4) entry.examples.push({ id: set.id, paperId: set.paper_id || null });
}

const report = {
  readingBSetCount: sets.length,
  distinctSourceShapes: signature.size,
  shapes: [...signature.entries()].map(([sig, value]) => ({ ...JSON.parse(sig), ...value }))
};
console.log(JSON.stringify(report, null, 2));
if (!sets.length) throw new Error('READING_B_SOURCE_EMPTY');
