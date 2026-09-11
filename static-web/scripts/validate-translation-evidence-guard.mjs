import fs from 'node:fs';
import {
  blankTranslationState,
  freezeWholeAttempt,
  passCleanAttempt,
  routeAttemptToReview
} from '../src/lib/translationRuntimeModel.mjs';

const issues = [];
const guard = fs.readFileSync(new URL('../src/components/TranslationEvidenceGuard.astro', import.meta.url), 'utf8');
const taskPage = fs.readFileSync(new URL('../src/pages/translation/[id].astro', import.meta.url), 'utf8');

function check(condition, message) {
  if (!condition) issues.push(message);
}

check(guard.includes("stage === 'attempt' || stage === 'decision'"), 'fresh Attempt / PASS-decision must hide Pending target detail');
check(guard.includes('dataset.reopenReview'), 'PASS view must create an explicit reopen-review action');
check(guard.includes("root.querySelector('[data-route-review]')"), 'reopen-review must route through canonical Review action');
check(taskPage.includes('TranslationEvidenceGuard'), 'task page must attach TranslationEvidenceGuard');

const prompts = [{ id: 's1', ordinal: 1, sourceText: 'Fresh source.' }];
let state = blankTranslationState(prompts);
state.drafts.s1 = '干净第一版';
state = freezeWholeAttempt(state, prompts, '2026-09-12T00:00:00.000Z').state;
state = passCleanAttempt(state, '2026-09-12T00:01:00.000Z');
check(state.stage === 'passed', 'test setup must reach PASS');
state = routeAttemptToReview(state);
check(state.stage === 'diagnosis' && state.decision === 'REPAIR_NEEDED', 'PASS must remain recoverable into Review if later evidence reveals a real issue');

console.log(JSON.stringify({
  guardChecks: 6,
  issueCount: issues.length
}, null, 2));

if (issues.length) {
  console.error('\nTranslation evidence guard issues:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
}
