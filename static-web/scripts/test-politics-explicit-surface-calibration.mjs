import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

const failures = [];
const pass = (condition, name, detail = '') => {
  if (!condition) failures.push(`${name}${detail ? `:${detail}` : ''}`);
  else console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

const chapter = (subject, code) => {
  const compiled = loadPoliticsCompiledPresentation(subject, code);
  if (!(compiled instanceof Map)) throw new Error(`CALIBRATION_CHAPTER_MISSING:${subject}:${code}`);
  return compiled;
};
const unit = (compiled, id) => {
  const row = compiled.get(id);
  if (!row) throw new Error(`CALIBRATION_UNIT_MISSING:${id}`);
  return row;
};
const group = (row, state, id) => row?.surfacePlan?.states?.[state]?.find((entry) => entry.id === id) || null;

const marx = chapter('marxism', 'ch00');
const marxS01 = unit(marx, 'POL27-CF-MARX-C00-S01');
const origins = group(marxS01, 'ORIENT', 's01-origin-conditions');
const development = group(marxS01, 'ORIENT', 's01-development-sequence');
pass(origins?.primitive === 'PARALLEL_SET', 'marx_s01_origins_are_parallel');
pass(origins?.items?.map((item) => item.id).join('|') === 'social_root|class_basis|thought_source', 'marx_s01_origin_members_exact');
pass((origins?.transitions || []).length === 0, 'marx_s01_origins_have_no_invented_direction');
pass(development?.primitive === 'DIRECTED_SEQUENCE', 'marx_s01_development_is_directed');
pass(development?.items?.map((item) => item.id).join('|') === 'creation|theory_system|development', 'marx_s01_development_members_exact');
pass(development?.transitions?.length === 2, 'marx_s01_development_transitions_exact', String(development?.transitions?.length || 0));

const marxS02 = unit(marx, 'POL27-CF-MARX-C00-S02');
const characteristics = group(marxS02, 'ORIENT', 's02-four-characteristics');
pass(characteristics?.primitive === 'PARALLEL_SET', 'marx_s02_four_characteristics_are_peers');
pass(characteristics?.items?.map((item) => item.id).join('|') === 'scientificity|people_nature|practicality|development_quality', 'marx_s02_peer_members_exact');

const history = chapter('history', 'ch01');
const historyS01 = unit(history, 'POL27-CF-HISTORY-C01-S01');
const historyTurn = group(historyS01, 'ORIENT', 'h-c01-s01-cause-to-turn');
pass(historyTurn?.primitive === 'DIRECTED_SEQUENCE', 'history_c01_s01_cause_to_turn_is_directed');
pass(historyTurn?.items?.map((item) => item.id).join('|') === 'cause|turning_point', 'history_c01_s01_members_exact');
const historyS04 = unit(history, 'POL27-CF-HISTORY-C01-S04');
const causeHierarchy = group(historyS04, 'ORIENT', 'h-c01-s04-causes');
pass(causeHierarchy?.primitive === 'HIERARCHY', 'history_c01_s04_cause_layers_are_hierarchy');
pass(causeHierarchy?.items?.map((item) => item.label).join('|') === '根本原因|重要原因', 'history_c01_s04_levels_exact');

const mao = chapter('mao', 'ch00');
const maoC00 = unit(mao, 'POL27-CF-MAO-C00');
const combinations = group(maoC00, 'ORIENT', 'mao-c00-two-combinations');
pass(combinations?.primitive === 'PARALLEL_SET', 'mao_two_combinations_are_parallel');
pass(combinations?.items?.length === 2, 'mao_two_combinations_count_exact', String(combinations?.items?.length || 0));

const xi = chapter('xi', 'ch00');
const xiC00 = unit(xi, 'POL27-CF-XI-C00');
const roles = group(xiC00, 'ORIENT', 'xi-c00-role-set');
pass(roles?.primitive === 'PARALLEL_SET', 'xi_role_field_does_not_become_hierarchy');
pass(roles?.items?.map((item) => item.role).join('|') === '形成背景|理论创新路径|方法工具|历史地位', 'xi_role_members_exact');
pass(!(xiC00.surfacePlan.states.ORIENT || []).some((entry) => entry.primitive === 'HIERARCHY'), 'xi_orient_has_no_invented_hierarchy');

const ethics = chapter('ethics_law', 'ch00');
const ethicsC00 = unit(ethics, 'POL27-CF-ETHICS-C00');
const threeRelations = group(ethicsC00, 'ORIENT', 'ethics-c00-three-relations');
pass(threeRelations?.primitive === 'PARALLEL_SET', 'ethics_three_relations_are_parallel_layers');
pass(threeRelations?.items?.length === 3, 'ethics_three_relations_count_exact', String(threeRelations?.items?.length || 0));
pass((threeRelations?.transitions || []).length === 0, 'ethics_three_relations_have_no_invented_arrows');

const calibrated = [
  ...marx.values(),
  ...history.values(),
  ...mao.values(),
  ...xi.values(),
  ...ethics.values()
].filter((row) => row?.surfacePlan?.states?.ORIENT?.length);
pass(calibrated.length === 9, 'calibration_batch_maps_9_pass_units', String(calibrated.length));

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log('POLITICS_EXPLICIT_SURFACE_CALIBRATION_PASS');
}
