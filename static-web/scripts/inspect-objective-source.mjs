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

console.log(JSON.stringify({
  setCount: sets.length,
  questionCount: questions.length,
  sections: inventory
}, null, 2));

if (!sets.length || !questions.length) process.exitCode = 1;
