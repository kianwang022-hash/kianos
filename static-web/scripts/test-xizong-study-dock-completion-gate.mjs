import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Execute the actual presentation-dock callback. BlockV6 and its existing
// native/controller/browser suites own the complete eligibility predicate.
// The dock must preserve that owner's disabled state, including when simple
// learned/rating counts alone look complete. No browser or learner state here.
const source = fs.readFileSync(new URL('../src/components/XizongStudyEnhancer.astro', import.meta.url), 'utf8');
const render = source.match(/    const renderDock = \(\) => \{[\s\S]*?\n    \};/)?.[0];
assert.ok(render, 'exercise shipped dock rendering callback');
// If a future implementation adds a completion callback again, execute it too
// rather than merely checking absence of a function name or matching text.
const gate = source.match(/    const applyCompletionGate = \(\) => \{[\s\S]*?\n    \};/)?.[0] || '';
const checks = [];
for (const [reason, disabled, study] of [
  ['Source missing', true, { sourceContactDone:false }],
  ['Source flag without coverage', true, { sourceContactDone:true, sourceContactEvidence:[] }],
  ['partial allSource coverage', true, { sourceContactDone:true, sourceContactEvidence:[{kp_ids:['one']}] }],
  ['required visual missing', true, {}],
  ['content revalidation pending', true, { sourceRevisionPending:true }],
  ['reviewed TTSX pending', true, { pendingTtsx:{key:'declared'} }],
  ['fully ready owner', false, {}],
  ['previously completed owner', true, { completed:true }]
]) {
  const button = {disabled,title:''};
  const state = { learned:{one:true,two:true}, ratings:{one:'known',two:'known'}, blockRecallDone:true, completed:false, ...study };
  const context = { root:{querySelector:selector=>selector==='[data-block-complete]'?button:null},
    readStudy:()=>state,kpRows:[{kpId:'one'},{kpId:'two'}],currentRow:()=>null,currentLocal:()=>null,syncReviewVisibility:()=>{} };
  vm.runInNewContext(`${gate}\n${render}\nrenderDock();`,context);
  assert.equal(button.disabled,disabled,`${reason}: dock cannot overwrite canonical completion eligibility`);
  checks.push(reason);
}
console.log(`Study dock completion ownership PASS | ${checks.length} actual-callback cases`);
