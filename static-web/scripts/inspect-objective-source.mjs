import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const bankPath = path.join(repoRoot, 'content/english/source/question_bank.v1.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const sets = Array.isArray(bank.passage_or_sets) ? bank.passage_or_sets : [];
const questions = Array.isArray(bank.questions_or_prompts) ? bank.questions_or_prompts : [];
const bySet = new Map();
for (const question of questions) {
  const id = String(question?.set_id || '');
  if (!bySet.has(id)) bySet.set(id, []);
  bySet.get(id).push(question);
}

const sectionMap = new Map();
for (const set of sets) {
  const section = String(set?.section || 'UNSPECIFIED');
  if (!sectionMap.has(section)) sectionMap.set(section, []);
  sectionMap.get(section).push(set);
}

const inventory = [...sectionMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([section, sectionSets]) => {
    const sample = sectionSets[0] || {};
    const sampleQuestions = bySet.get(String(sample.id || '')) || [];
    const question = sampleQuestions[0] || {};
    return {
      section,
      setCount: sectionSets.length,
      questionCount: sectionSets.reduce((sum, set) => sum + (bySet.get(String(set.id || '')) || []).length, 0),
      sampleSetId: sample.id || null,
      sampleSetKeys: Object.keys(sample).sort(),
      sampleContextKeys: sample.context && typeof sample.context === 'object' ? Object.keys(sample.context).sort() : [],
      sampleQuestionKeys: Object.keys(question).sort(),
      sampleOptionsKind: Array.isArray(question.options) ? 'array' : question.options && typeof question.options === 'object' ? 'object' : typeof question.options,
      sampleQuestionCount: sampleQuestions.length
    };
  });

function shape(value) {
  if (Array.isArray(value)) return `array:${value.length}`;
  if (value && typeof value === 'object') return `object:${Object.keys(value).sort().join(',')}`;
  return typeof value;
}

function compactValue(value) {
  if (typeof value === 'string') return value.length > 180 ? `${value.slice(0, 180)}…` : value;
  if (Array.isArray(value)) return value.slice(0, 3).map(compactValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 12).map(([key, child]) => [key, compactValue(child)]));
  }
  return value;
}

function variantsFor(section) {
  const rows = sectionMap.get(section) || [];
  const signatures = new Map();
  for (const set of rows) {
    const qs = bySet.get(String(set.id || '')) || [];
    const q = qs[0] || {};
    const signature = JSON.stringify({
      setKeys: Object.keys(set).sort(),
      contextKeys: set.context && typeof set.context === 'object' ? Object.keys(set.context).sort() : [],
      questionKeys: Object.keys(q).sort(),
      options: shape(q.options),
      questionCount: qs.length
    });
    if (!signatures.has(signature)) {
      signatures.set(signature, {
        representativeId: set.id,
        paperId: set.paper_id || null,
        questionCount: qs.length,
        setKeys: Object.keys(set).sort(),
        contextKeys: set.context && typeof set.context === 'object' ? Object.keys(set.context).sort() : [],
        contextPreview: compactValue(set.context || {}),
        questionKeys: Object.keys(q).sort(),
        firstQuestionPreview: compactValue({
          id: q.id || q.question_id || null,
          ordinal: q.ordinal,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer
        }),
        count: 0
      });
    }
    signatures.get(signature).count += 1;
  }
  return [...signatures.values()];
}

const report = {
  setCount: sets.length,
  questionCount: questions.length,
  sections: inventory,
  clozeVariants: variantsFor('cloze'),
  readingBVariants: variantsFor('reading_part_b')
};

console.log(JSON.stringify(report, null, 2));

if (!sets.length || !questions.length) process.exitCode = 1;
if (!(sectionMap.get('cloze') || []).length) throw new Error('CURRENT_CLOZE_SETS_MISSING');
if (!(sectionMap.get('reading_part_b') || []).length) throw new Error('CURRENT_READING_B_SETS_MISSING');
