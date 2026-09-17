import fs from 'node:fs';
import path from 'node:path';
import {
  XIZONG_REPRESENTATION_SCHEMA,
  composeXizongFrameworkRepresentation,
  resolveXizongLearnerAssetRepresentation,
  resolveXizongProjectionRepresentation
} from '../src/lib/xizongRepresentationGate.mjs';

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`CURRENT_XIZONG_REPRESENTATION_GATE:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
}

const repoRoot = path.resolve(process.cwd(), '..');
const a1b1Path = path.join(repoRoot, 'content/xizong/projection/a1-circulation/blocks/b01.projection.json');
const a1b1 = JSON.parse(fs.readFileSync(a1b1Path, 'utf8'));
const objects = new Map((a1b1.objects || []).map((object) => [object.object_id, object]));

const problem = resolveXizongProjectionRepresentation(objects.get('circulation-b01-problem'));
const chain = resolveXizongProjectionRepresentation(objects.get('circulation-b01-mechanism-spine'));
const formula = resolveXizongProjectionRepresentation(objects.get('circulation-b01-formula-language'));
const framework = resolveXizongProjectionRepresentation(objects.get('circulation-b01-framework'));

check(problem.schema === XIZONG_REPRESENTATION_SCHEMA && problem.kind === 'STRUCTURED_TEXT', 'a1_b1_problem_is_text');
check(chain.kind === 'SIMPLE_CHAIN', 'a1_b1_explicit_chain_stays_simple_chain');
check(formula.kind === 'FORMULA_STRIP', 'a1_b1_formula_stays_formula_strip');
check(framework.kind === 'STRUCTURED_TEXT', 'a1_b1_map_sequence_does_not_auto_graph', framework.reason);

const unsafeNetwork = resolveXizongProjectionRepresentation({
  object_id: 'fixture-network',
  role: 'MAP',
  geometry: 'NETWORK',
  answer_bearing: true
});
check(unsafeNetwork.kind === 'STRUCTURED_TEXT', 'generic_network_falls_back_to_text', unsafeNetwork.reason);

const unsafeTree = resolveXizongProjectionRepresentation({
  object_id: 'fixture-tree',
  role: 'MAP',
  geometry: 'TREE'
});
check(unsafeTree.kind === 'STRUCTURED_TEXT', 'generic_tree_falls_back_to_text', unsafeTree.reason);

const unsafeSpatial = resolveXizongProjectionRepresentation({
  object_id: 'fixture-spatial',
  role: 'MAP',
  geometry: 'SPATIAL_MAP'
});
check(unsafeSpatial.kind === 'STRUCTURED_TEXT', 'spatial_map_without_visual_owner_falls_back_to_text', unsafeSpatial.reason);

const unreviewedOverride = resolveXizongProjectionRepresentation({
  object_id: 'fixture-unreviewed-visual',
  role: 'MAP',
  geometry: 'NETWORK',
  presentation: { representation: 'REVIEWED_VISUAL' }
});
check(unreviewedOverride.kind === 'STRUCTURED_TEXT', 'visual_override_requires_current_fidelity');

const reviewedOverride = resolveXizongProjectionRepresentation({
  object_id: 'fixture-reviewed-visual',
  role: 'MAP',
  geometry: 'NETWORK',
  presentation: {
    representation: 'REVIEWED_VISUAL',
    semantic_fidelity: 'CURRENT_EXPLICIT'
  }
});
check(reviewedOverride.kind === 'REVIEWED_VISUAL', 'explicit_current_visual_override_is_admitted');

const protectedRecall = resolveXizongProjectionRepresentation(objects.get('circulation-b01-mechanism-spine'), {
  stage: 'KP_RECALL_FRONT'
});
check(protectedRecall.visible === false, 'answer_bearing_projection_hidden_on_recall_front');

const sourceVisual = resolveXizongLearnerAssetRepresentation({
  id: 'fixture-source-visual',
  kind: 'VISUAL',
  sourceVisualBundle: {
    assets: [{ src: '/fixture.webp' }]
  }
});
check(sourceVisual.kind === 'SOURCE_VISUAL' && sourceVisual.visible === true, 'reviewed_source_visual_keeps_visual_representation');

const precision = resolveXizongLearnerAssetRepresentation({
  id: 'fixture-precision',
  kind: 'PRECISION',
  cue: 'exact item'
});
check(precision.kind === 'STRUCTURED_TEXT', 'precision_does_not_get_card_or_graph_entitlement');

const protectedAux = resolveXizongLearnerAssetRepresentation({
  id: 'fixture-source-visual',
  kind: 'VISUAL',
  sourceVisualBundle: { assets: [{ src: '/fixture.webp' }] }
}, { stage: 'KP_RECALL_FRONT' });
check(protectedAux.visible === false, 'auxiliary_assets_hidden_on_recall_front');

const plan = composeXizongFrameworkRepresentation(a1b1.objects || []);
check(plan.componentEntitlement === false, 'framework_objects_do_not_entitle_one_component_each');
check(plan.regions.problem.length === 1, 'framework_plan_keeps_problem_anchor');
check(plan.regions.primary.length >= 1, 'framework_plan_keeps_primary_structure');
check(plan.regions.support.length >= 1, 'framework_plan_demotes_secondary_support');
check(plan.regions.primary.some((row) => row.representation.kind === 'STRUCTURED_TEXT'), 'framework_plan_can_keep_map_as_text');

console.log(JSON.stringify({
  ok: true,
  schema: XIZONG_REPRESENTATION_SCHEMA,
  calibration: 'A1_B1',
  primitives: {
    problem: problem.kind,
    mechanism: chain.kind,
    formula: formula.kind,
    framework: framework.kind
  },
  hardFallback: 'STRUCTURED_TEXT'
}, null, 2));
