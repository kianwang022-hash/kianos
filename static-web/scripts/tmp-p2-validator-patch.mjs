import fs from 'node:fs';

const path = 'static-web/scripts/validate-xizong-learning.mjs';
let text = fs.readFileSync(path, 'utf8');
const before = "has(exitUi, 'const computeActive = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));', 'holdout-filter-runtime-missing');";
const after = "has(exitUi, 'const eligibleQuestions = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));', 'holdout-filter-runtime-missing');\nhas(exitUi, 'deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])', 'phase-aware-question-queue-derivation-missing');";
const count = text.split(before).length - 1;
if (count !== 1) throw new Error(`P2_VALIDATOR_PATCH_MATCH:${count}`);
text = text.replace(before, after);
fs.writeFileSync(path, text);
