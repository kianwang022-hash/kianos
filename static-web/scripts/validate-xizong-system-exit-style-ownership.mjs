import fs from 'node:fs';
import path from 'node:path';

const read = (relative) => fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`XIZONG_SYSTEM_EXIT_STYLE_OWNER:${code}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${code}${detail ? ` · ${detail}` : ''}`);
};
const hasClassToken = (source, token) => [...source.matchAll(/\bclass\s*=\s*["']([^"']+)["']/g)]
  .some((match) => match[1].split(/\s+/).includes(token));
const stripCssComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

const route = read('src/pages/xizong/[system]/index.astro');
const exit = read('src/components/XizongSystemExitRuntime.astro');
const crosswalk = read('src/components/XizongQuestionCrosswalkConsumer.astro');
const repair = read('src/components/XizongSystemRepairReturn.astro');
const owner = read('src/styles/xizong-system-exit-workspace.css');
const systemStyle = read('src/styles/xizong-system-workspace.css');
const broadStyle = read('src/styles/xizong-presentation.css');
const denseCalmStyle = read('src/styles/xizong-dense-calm.css');

check(route.includes("../../../styles/xizong-system-exit-workspace.css"), 'route_imports_exact_owner');
check(hasClassToken(route, 'xzExitStage'), 'route_uses_current_later_stage_namespace');
check(!hasClassToken(route, 'xizongLaterStage'), 'route_retired_legacy_later_stage_namespace');

for (const [name, source] of [['SystemExit', exit], ['Crosswalk', crosswalk], ['RepairReturn', repair]]) {
  check(!source.includes('<style'), `${name}_has_no_component_visual_owner`);
  check(!/\sstyle\s*=/.test(source), `${name}_has_no_inline_visual_patch`);
}

check(hasClassToken(exit, 'xzExitCard'), 'exit_cards_use_current_visual_namespace');
check(hasClassToken(exit, 'xzExitStem'), 'exit_stem_uses_current_visual_namespace');
check(hasClassToken(exit, 'xzExitOptions'), 'exit_options_use_current_visual_namespace');
check(!hasClassToken(exit, 'xseCard'), 'exit_retired_broad_card_selector');
check(!hasClassToken(exit, 'xseStem'), 'exit_retired_broad_stem_selector');
check(!hasClassToken(exit, 'xseOptions'), 'exit_retired_broad_options_selector');

for (const token of ['.xzExitStage', '.xse', '.xzExitCard', '.xzExitStem', '.xzExitOptions', '.xqc', '.xrr']) {
  check(owner.includes(token), 'owner_contains_surface_family', token);
}
check(!/!\s*important\b/i.test(stripCssComments(owner)), 'owner_has_no_cascade_recovery');

const fontSizes = [...owner.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
check(fontSizes.length > 0, 'owner_has_explicit_type_scale');
check(fontSizes.every((size) => size >= 15), 'owner_type_floor_15', `min=${Math.min(...fontSizes)}`);

// Current Exit presentation belongs only to the dedicated owner. Closed-surface
// legacy selectors must be physically absent from broad, System and dense-calm styles.
check(!systemStyle.includes('.xzExitStage'), 'first_pass_system_style_cannot_own_current_exit_namespace');
check(!systemStyle.includes('.xizongLaterStage'), 'retired_system_workspace_exit_css_physically_removed');
check(!broadStyle.includes('.xzExitStage') && !broadStyle.includes('.xzExitCard') && !broadStyle.includes('.xzExitStem') && !broadStyle.includes('.xzExitOptions'), 'broad_presentation_cannot_own_current_exit_namespace');
for (const token of ['.xseCard', '.xseStem', '.xseOptions', '.xseRecall', '.xseNav', '.xseActions', '.xseToolbar', '.xizongRepairInbox']) {
  check(!broadStyle.includes(token), 'legacy_broad_exit_css_physically_removed', token);
}
const denseCalmNoComments = stripCssComments(denseCalmStyle);
check(!/\.xzExit(?:\b|[A-Z])/.test(denseCalmNoComments), 'dense_calm_cannot_own_current_exit_namespace');
check(!denseCalmNoComments.includes('.xizongLaterStage'), 'dense_calm_retired_later_stage_physically_removed');
check(!/\.xse(?:\b|[A-Z])/.test(denseCalmNoComments), 'dense_calm_cannot_style_exit_behavior_classes');
check(!/\.(?:xqc|xrr)(?:\b|[A-Z])/.test(denseCalmNoComments), 'dense_calm_cannot_style_crosswalk_or_repair_return');

// Runtime semantics must remain owned by the original components.
for (const token of [
  "startRecall?.addEventListener('click'",
  "completeRecall?.addEventListener('click'",
  "startSweep?.addEventListener('click'",
  'recordXizongQuestionAttempt',
  'startNextXizongQuestionRound',
  "['wrong', 'uncertain'].includes(result.status)",
  '暂无审核过的精确 KP 回链：保留题号给 Chat，不让网页自己猜。'
]) check(exit.includes(token), 'exit_runtime_contract_preserved', token);
check(crosswalk.includes("currentPhase() !== 'SECOND_PASS'"), 'crosswalk_second_pass_gate_preserved');
check(crosswalk.includes('暂无 REVIEWED Crosswalk'), 'crosswalk_missing_mapping_fallback_preserved');
check(repair.includes('allowed.has(row.questionId)'), 'repair_only_accepts_current_wu');
check(repair.includes('!relation?.blockId || !relation?.primaryKpId'), 'repair_requires_reviewed_precise_relation');

console.log(JSON.stringify({
  ok: true,
  presentation_owner: 'src/styles/xizong-system-exit-workspace.css',
  route_namespace: 'xzExitStage',
  runtime_owners: ['XizongSystemExitRuntime', 'XizongQuestionCrosswalkConsumer', 'XizongSystemRepairReturn'],
  broad_legacy_exit_css: 'physically removed',
  system_workspace_legacy_exit_css: 'physically removed',
  dense_calm_exit_css: 'physically removed',
  remaining_cleanup_namespaces: [],
  visible_type_floor_px: 15
}, null, 2));
