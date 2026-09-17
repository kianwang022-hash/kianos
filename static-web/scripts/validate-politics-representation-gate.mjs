import fs from 'node:fs';
import path from 'node:path';
import {
  POLITICS_REPRESENTATION_SCHEMA,
  composePoliticsOrientationPlan,
  resolvePoliticsChapterGeometry,
  resolvePoliticsUnitRepresentation
} from '../src/lib/politicsRepresentationGate.mjs';

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`CURRENT_POLITICS_REPRESENTATION_GATE:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
}

const repoRoot = path.resolve(process.cwd(), '..');
const readProjection = (subject, chapter) => JSON.parse(fs.readFileSync(
  path.join(repoRoot, `content/politics/projection/${subject}/${chapter}.projection.json`),
  'utf8'
));
const unit = (projection, id) => projection.units.find((row) => row.unit_id === id);

const c00 = readProjection('marxism', 'ch00');
const c01 = readProjection('marxism', 'ch01');

const s01 = resolvePoliticsUnitRepresentation(unit(c00, 'POL27-CF-MARX-C00-S01'));
check(s01.schema === POLITICS_REPRESENTATION_SCHEMA, 'schema_current');
check(s01.kind === 'STRUCTURED_TEXT', 'c00_s01_topology_does_not_auto_graph', s01.reason);

const s02 = resolvePoliticsUnitRepresentation(unit(c00, 'POL27-CF-MARX-C00-S02'));
check(s02.kind === 'STRUCTURED_TEXT', 'c00_s02_multi_map_stays_text_default', s02.reason);
check(s02.simultaneous === true, 'c00_s02_simultaneous_visibility_preserved_without_graph_entitlement');

const c01s01 = resolvePoliticsUnitRepresentation(unit(c01, 'POL27-CF-MARX-C01-S01'));
check(c01s01.kind === 'COMPARE', 'c01_s01_explicit_multi_axis_matrix_can_compare', c01s01.reason);

const c01s02 = resolvePoliticsUnitRepresentation(unit(c01, 'POL27-CF-MARX-C01-S02'));
check(c01s02.kind === 'STRUCTURED_TEXT', 'c01_s02_chain_name_does_not_auto_draw_arrows', c01s02.reason);

const chapterReasoning = resolvePoliticsChapterGeometry(c00.chapter_context.stage_context[0]);
check(chapterReasoning.kind === 'STRUCTURED_TEXT', 'chapter_reasoning_chain_defaults_to_readable_text', chapterReasoning.reason);

const genericTopology = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-topology',
  projection_shape: 'NETWORK_TOPOLOGY_MAP',
  primary_geometry: [{ role: 'framework_maps', topology_source: 'edges' }]
});
check(genericTopology.kind === 'STRUCTURED_TEXT', 'generic_topology_never_grants_graph', genericTopology.reason);

const longChain = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-chain',
  projection_shape: 'LONG_REASONING_CHAIN'
});
check(longChain.kind === 'STRUCTURED_TEXT', 'chain_name_alone_never_grants_arrow_layout', longChain.reason);

const unreviewedVisual = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-unreviewed-chain',
  projection_shape: 'TOPOLOGY_MAP',
  representation_hint: 'SIMPLE_CHAIN'
});
check(unreviewedVisual.kind === 'STRUCTURED_TEXT', 'representation_override_requires_current_fidelity');

const reviewedChain = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-reviewed-chain',
  projection_shape: 'TOPOLOGY_MAP',
  representation_hint: 'SIMPLE_CHAIN',
  representation_fidelity: 'CURRENT_EXPLICIT'
});
check(reviewedChain.kind === 'SIMPLE_CHAIN', 'reviewed_current_simple_chain_is_allowed');

const timeline = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-timeline',
  projection_shape: 'STAGE_TIMELINE_WITH_TURNING_POINTS'
});
check(timeline.kind === 'TIMELINE', 'explicit_timeline_semantics_can_use_timeline');

const hierarchy = resolvePoliticsUnitRepresentation({
  unit_id: 'fixture-hierarchy',
  projection_shape: 'IDENTITY_HIERARCHY_WITH_ROLE_BOUNDARIES'
});
check(hierarchy.kind === 'HIERARCHY', 'explicit_hierarchy_semantics_can_use_hierarchy');

const protectedVerify = resolvePoliticsUnitRepresentation(unit(c00, 'POL27-CF-MARX-C00-S02'), { stage: 'VERIFY' });
check(protectedVerify.visible === false, 'verify_hides_orientation_model');

const plan = composePoliticsOrientationPlan(c00, unit(c00, 'POL27-CF-MARX-C00-S02'));
check(plan.componentEntitlement === false, 'projection_fields_do_not_entitle_one_component_each');
check(plan.representation.kind === 'STRUCTURED_TEXT', 'orientation_plan_keeps_s02_text_default');

console.log(JSON.stringify({
  ok: true,
  schema: POLITICS_REPRESENTATION_SCHEMA,
  calibration: ['MARX_C00', 'MARX_C01'],
  hardFallback: 'STRUCTURED_TEXT',
  visualEntitlement: 'EXPLICIT_SAFE_SEMANTICS_OR_CURRENT_REVIEW_ONLY'
}, null, 2));
