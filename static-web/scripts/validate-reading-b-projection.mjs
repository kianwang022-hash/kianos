import {
  listReadingBSets,
  loadReadingBById
} from '../src/lib/englishObjective.mjs';

const issues = [];
const counts = {};
const expectedCounts = { gap_match: 8, heading_match: 3, ordering: 9, comment_match: 2 };
const allowedForms = new Set(Object.keys(expectedCounts));
const items = listReadingBSets().map((entry) => loadReadingBById(entry.id));

for (const item of items) {
  const form = String(item.context?.taskForm || '');
  counts[form] = (counts[form] || 0) + 1;
  if (!allowedForms.has(form)) issues.push(`${item.objectId}: unresolved taskForm ${form || 'empty'}`);
  if (!String(item.context?.directions || '').trim()) issues.push(`${item.objectId}: directions missing from learner projection`);
  if (item.questions.length !== 5) issues.push(`${item.objectId}: expected 5 questions, got ${item.questions.length}`);
  if (![7, 8].includes(item.candidates.length)) issues.push(`${item.objectId}: expected 7/8 candidates, got ${item.candidates.length}`);
  if (item.candidates.some((candidate) => !candidate.text || candidate.text.trim() === candidate.label)) {
    issues.push(`${item.objectId}: candidate text unresolved; label-only candidate leaked into learner projection`);
  }
  if (item.context?.candidateUsePolicy !== 'single_use') issues.push(`${item.objectId}: known English I Part B form should project single_use candidates`);

  if (form === 'ordering') {
    const skeleton = item.context?.orderingSkeleton || [];
    const fixed = item.context?.fixedGivens || [];
    const questionOrdinals = item.questions.map((question, index) => String(question.ordinal || index + 41));
    const skeletonQuestions = skeleton.filter((token) => /^4[1-5]$/.test(String(token)));
    if (!skeleton.length) issues.push(`${item.objectId}: ordering skeleton missing`);
    if (skeletonQuestions.join('|') !== questionOrdinals.join('|')) issues.push(`${item.objectId}: ordering skeleton does not preserve 41-45 in source order`);
    if (!fixed.length) issues.push(`${item.objectId}: fixed givens missing`);
    if (fixed.some((label) => !skeleton.includes(label))) issues.push(`${item.objectId}: fixed given missing from skeleton`);
    if (item.material.length) issues.push(`${item.objectId}: ordering should not duplicate candidate paragraphs into generic MATERIAL panel`);
  } else if (!item.material.length) {
    issues.push(`${item.objectId}: ${form} learner material missing`);
  }

  if (form === 'comment_match' && item.questions.some((question) => !String(question.displayLabel || '').trim())) {
    issues.push(`${item.objectId}: comment names were not recovered for 41-45`);
  }
}

for (const [form, expected] of Object.entries(expectedCounts)) {
  if ((counts[form] || 0) !== expected) issues.push(`task form count ${form}: expected ${expected}, got ${counts[form] || 0}`);
}
if (items.length !== 22) issues.push(`expected 22 Reading B sets, got ${items.length}`);

console.log(JSON.stringify({
  schema: 'kianos.english.reading_b.projection_validation.v1',
  sets: items.length,
  taskFormCounts: counts,
  issueCount: issues.length
}, null, 2));

if (issues.length) {
  console.error('\nReading B projection issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
}
