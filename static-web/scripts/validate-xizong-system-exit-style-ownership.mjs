import fs from 'node:fs';
import path from 'node:path';

const read = (relative) => fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`XIZONG_RECALL_PRACTICE_OWNER:${code}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${code}${detail ? ` · ${detail}` : ''}`);
};
const stripCssComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

const systemRoute = read('src/pages/xizong/[system]/index.astro');
const recallRoute = read('src/pages/xizong/[system]/recall.astro');
const practiceRoute = read('src/pages/xizong/practice/[system].astro');
const exit = read('src/components/XizongSystemExitRuntime.astro');
const practice = read('src/components/XizongPracticeWorkbench.astro');
const repair = read('src/components/XizongSystemRepairReturn.astro');
const questions = read('src/lib/xizongQuestions.mjs');
const exitOwner = read('src/styles/xizong-system-exit-workspace.css');
const practiceOwner = read('src/styles/xizong-practice-workspace.css');
const systemStyle = read('src/styles/xizong-system-workspace.css');
const broadStyle = read('src/styles/xizong-presentation.css');
const denseCalmStyle = read('src/styles/xizong-dense-calm.css');

check(recallRoute.includes("../../../styles/xizong-system-exit-workspace.css"), 'recall_route_imports_recall_owner');
check(recallRoute.includes('XizongSystemExitRuntime'), 'recall_route_owns_recall_runtime');
check(systemRoute.includes('data-xizong-system-recall-entry'), 'system_route_owns_recall_release_handoff');
check(!systemRoute.includes('XizongSystemExitRuntime'), 'system_route_does_not_embed_recall_runtime');
check(practiceRoute.includes("../../../styles/xizong-practice-workspace.css"), 'practice_route_imports_practice_owner');
check(!practiceRoute.includes('xizong-system-exit-workspace.css'), 'practice_does_not_import_recall_owner');
check(!systemRoute.includes('XizongSystemRepairReturn'), 'system_route_does_not_own_repair');
check(practiceRoute.includes('XizongSystemRepairReturn'), 'practice_route_owns_repair_return');

for (const [name, source] of [['SystemRecall', exit], ['Practice', practice], ['RepairReturn', repair]]) {
  check(!source.includes('<style'), `${name}_has_no_component_visual_owner`);
  check(!/\sstyle\s*=/.test(source), `${name}_has_no_inline_visual_patch`);
}

check(exit.includes('data-recall-workspace'), 'system_recall_workspace_present');
check(exit.includes('data-practice-handoff'), 'system_recall_handoff_present');
check(!exit.includes('data-question-map'), 'system_recall_has_no_question_map');
check(!exit.includes('recordXizongQuestionAttempt'), 'system_recall_has_no_question_attempt_runtime');
check(!exit.includes('data-recall-scratch'), 'system_recall_scratch_removed');

for (const token of ['data-xizong-practice', 'data-question-map', 'data-fast-sweep', 'data-question-mark', 'data-answer-panel', 'data-reasoning-chain']) {
  check(practice.includes(token), 'practice_runtime_surface_present', token);
}
for (const token of ['recordXizongQuestionAttempt', 'startNextXizongQuestionRound', 'setXizongQuestionMarked']) {
  check(practice.includes(token), 'practice_runtime_contract_present', token);
}
check(questions.includes('reasoningChain'), 'question_loader_preserves_reasoning_chain');
check(questions.includes('row.reasoning_chain'), 'question_loader_reads_canonical_reasoning_chain');

for (const token of ['.xzSystemRecallPage', '.xseRecallWorkspace', '.xseRecallPaper', '.xsePracticeHandoff']) {
  check(exitOwner.includes(token), 'recall_owner_contains_surface_family', token);
}
check(!exitOwner.includes('.xzp'), 'recall_owner_cannot_style_practice_namespace');
check(!exitOwner.includes('.xrr'), 'recall_owner_cannot_style_practice_repair');

for (const token of ['.xzp', '.xzpBody', '.xzpMap', '.xzpQuestionPane', '.xzpReviewPane', '.xrr']) {
  check(practiceOwner.includes(token), 'practice_owner_contains_surface_family', token);
}
check(!practiceOwner.includes('.xzSystemRecallPage'), 'practice_owner_cannot_style_recall_namespace');

check(/font-family\s*:\s*var\(--study-font\)/.test(practiceOwner), 'practice_inherits_shared_l1_font_token');
check(!/"PingFang SC"|BlinkMacSystemFont|"SF Pro Text"/.test(practiceOwner), 'practice_has_no_local_font_stack');

for (const [name, source] of [['recall', exitOwner], ['practice', practiceOwner]]) {
  check(!/!\s*important\b/i.test(stripCssComments(source)), `${name}_owner_has_no_cascade_recovery`);
  const sizes = [...source.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
  check(sizes.length > 0, `${name}_owner_has_explicit_type_scale`);
  check(sizes.every((size) => size >= 15), `${name}_owner_type_floor_15`, `min=${Math.min(...sizes)}`);
}

check(!systemStyle.includes('.xzExitStage'), 'first_pass_system_style_cannot_own_recall_namespace');
check(!broadStyle.includes('.xzExitStage') && !broadStyle.includes('.xzSystemRecallPage') && !broadStyle.includes('.xzp'), 'broad_presentation_cannot_own_recall_or_practice');
const dense = stripCssComments(denseCalmStyle);
check(!/\.xzExit(?:\b|[A-Z])/.test(dense), 'dense_calm_cannot_own_recall_namespace');
check(!/\.xzp(?:\b|[A-Z])/.test(dense), 'dense_calm_cannot_own_practice_namespace');

check(repair.includes('allowed.has(row.questionId)'), 'repair_only_accepts_current_wu');
check(repair.includes('!relation?.blockId || !relation?.primaryKpId'), 'repair_requires_reviewed_precise_relation');

console.log(JSON.stringify({
  ok: true,
  recall_owner: 'src/styles/xizong-system-exit-workspace.css',
  practice_owner: 'src/styles/xizong-practice-workspace.css',
  recall_runtime: 'XizongSystemExitRuntime',
  practice_runtime: 'XizongPracticeWorkbench',
  question_explanation_projection: 'reasoningChain+adaptive Current fields',
  visible_type_floor_px: 15
}, null, 2));
