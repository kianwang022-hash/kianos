import { listReadingSets, loadReadingById, loadReadingReviewById } from '../src/lib/englishReading.mjs';

const sets = listReadingSets();
const issues = [];
let questionCount = 0;
let reviewCount = 0;
let taskCount = 0;
let evidenceCount = 0;
let diagnosisCount = 0;

for (const item of sets) {
  try {
    const reading = loadReadingById(item.id);
    const review = loadReadingReviewById(item.id);
    const questions = reading.questions || [];
    const projected = review.questions || {};
    questionCount += questions.length;

    if (!reading.paragraphs?.length) issues.push(`${item.id}: no passage paragraphs`);
    if (!questions.length) issues.push(`${item.id}: no questions`);
    if (review.objectId !== item.id) issues.push(`${item.id}: review object mismatch`);

    for (const question of questions) {
      const id = String(question?.id || question?.question_id || '');
      if (!id) {
        issues.push(`${item.id}: question without stable id`);
        continue;
      }
      const asset = projected[id];
      if (!asset) {
        issues.push(`${id}: no projected review asset`);
        continue;
      }
      reviewCount += 1;
      if (asset.questionTask) taskCount += 1;
      if (asset.minimalEvidence?.length) evidenceCount += 1;
      if (Object.keys(asset.optionDiagnosis || {}).length) diagnosisCount += 1;
    }
  } catch (error) {
    issues.push(`${item.id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const summary = {
  readingSets: sets.length,
  questions: questionCount,
  projectedReviewQuestions: reviewCount,
  withQuestionTask: taskCount,
  withEvidence: evidenceCount,
  withOptionDiagnosis: diagnosisCount,
  issueCount: issues.length
};

console.log(JSON.stringify(summary, null, 2));
if (issues.length) {
  console.error('\nReading runtime coverage issues:');
  issues.slice(0, 80).forEach((issue) => console.error(`- ${issue}`));
  if (issues.length > 80) console.error(`- … ${issues.length - 80} more`);
  process.exitCode = 1;
}
