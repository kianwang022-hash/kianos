import fs from 'node:fs';
import path from 'node:path';

const read = (relative) => fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`XIZONG_SYSTEM_EXIT_STYLE_OWNER:${code}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${code}${detail ? ` · ${detail}` : ''}`);
};

const route = read('src/pages/xizong/[system]/index.astro');
const exit = read('src/components/XizongSystemExitRuntime.astro');
const crosswalk = read('src/components/XizongQuestionCrosswalkConsumer.astro');
const repair = read('src/components/XizongSystemRepairReturn.astro');
const owner = read('src/styles/xizong-system-exit-workspace.css');
const systemStyle = read('src/styles/xizong-system-workspace.css');
const broadStyle = read('src/styles/xizong-presentation.css');

check(route.includes("../../../styles/xizong-system-exit-workspace.css"), 'route_imports_exact_owner');
check(route.includes('class="xzExitStage"'), 'route_uses_current_later_stage_namespace');
check(!route.includes('class="xizongLaterStage"'), 'route_retired_legacy_later_stage_namespace');

for (const [name, source] of [['SystemExit', exit], ['Crosswalk', crosswalk], ['RepairReturn', repair]]) {
  check(!source.includes('<style'), `${name}_has_no_component_visual_owner`);
  check(!/\sstyle\s*=/.test(source), `${name}_has_no_inline_visual_patch`);
}

check(exit.includes('class="xzExitCard xseRecallCard"'), 'exit_cards_use_current_visual_namespace');
check(exit.includes('class="xzExitStem"'), 'exit_stem_uses_current_visual_namespace');
check(exit.includes('class="xzExitOptions"'), 'exit_options_use_current_visual_namespace');
check(!exit.includes('class="xseCard'), 'exit_retired_broad_card_selector');
check(!exit.includes('class="xseStem"'), 'exit_retired_broad_stem_selector');
check(!exit.includes('class="xseOptions"'), 'exit_retired_broad_options_selector');

for (const token of ['.xzExitStage', '.xse', '.xzExitCard', '.xzExitStem', '.xzExitOptions', '.xqc', '.xrr']) {
  check(owner.includes(token), 'owner_contains_surface_family', token);
}
check(!owner.includes('!important'), 'owner_has_no_cascade_recovery');

const fontSizes = [...owner.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
check(fontSizes.length > 0, 'owner_has_explicit_type_scale');
check(fontSizes.every((size) => size >= 15), 'owner_type_floor_15', `min=${Math.min(...fontSizes)}`);

// Old owners may physically remain until the bounded cleanup slice, but must be unreachable.
check(!systemStyle.includes('.xzExitStage'), 'first_pass_system_style_cannot_own_current_exit_namespace');
check(!broadStyle.includes('.xzExitStage') && !broadStyle.includes('.xzExitCard') && !broadStyle.includes('.xzExitStem') && !broadStyle.includes('.xzExitOptions'), 'broad_presentation_cannot_own_current_exit_namespace');
check(systemStyle.includes('.xizongLaterStage'), 'legacy_system_exit_css_is_explicit_dead_cleanup_debt');
check(broadStyle.includes('.xseCard') && broadStyle.includes('.xseStem') && broadStyle.includes('.xseOptions button'), 'legacy_broad_exit_css_is_explicit_dead_cleanup_debt');

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
  dead_cleanup_namespaces: ['xizongLaterStage', 'xseCard', 'xseStem', 'xseOptions'],
  visible_type_floor_px: 15
}, null, 2));
