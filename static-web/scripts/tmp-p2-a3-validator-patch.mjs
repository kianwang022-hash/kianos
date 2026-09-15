import fs from 'node:fs';
const path = 'static-web/scripts/validate-xizong-a3-evidence.mjs';
let text = fs.readFileSync(path, 'utf8');
const before = "assert(exitUi.includes('const computeActive = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));'), 'holdout-not-excluded-from-active-sweep');";
const after = "assert(exitUi.includes('const eligibleQuestions = () => data.questions.filter((question) => !holdoutYears.includes(Number(question.year)));'), 'holdout-not-excluded-from-active-sweep');\nassert(exitUi.includes('deriveXizongQuestionIdsForCurrentRound(sweepState, eligible, [])'), 'phase-aware-active-sweep-not-derived');";
const count = text.split(before).length - 1;
if (count !== 1) throw new Error(`A3_EVIDENCE_PATCH_MATCH:${count}`);
fs.writeFileSync(path, text.replace(before, after));
