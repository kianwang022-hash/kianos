import fs from 'node:fs';
import path from 'node:path';
import {
  XIZONG_REPRESENTATION_SCHEMA,
  composeXizongFrameworkRepresentation,
  composeXizongSystemFrameworkRepresentation,
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

// System Framework calibration uses real A1 Current semantics but normalizes only
// already-explicit fields. Representation may choose a safe primitive; it may not
// add medical relations or turn the dependency DAG into a generated graph.
const a1SystemRaw = JSON.parse(fs.readFileSync(path.join(repoRoot, 'content/xizong/knowledge/systems/a1-circulation/system.json'), 'utf8'));
const systemPlan = composeXizongSystemFrameworkRepresentation({
  mission: a1SystemRaw.mission,
  mentalModel: {
    motherModel: a1SystemRaw.mental_model?.mother_model,
    spine: a1SystemRaw.mental_model?.spine,
    parallelControls: a1SystemRaw.mental_model?.parallel_controls
  },
  coreVariables: a1SystemRaw.core_variables,
  coreRelations: a1SystemRaw.core_relations,
  failureModes: a1SystemRaw.failure_modes,
  judgmentAxes: a1SystemRaw.judgment_axes,
  dependencyDag: a1SystemRaw.dependency_dag
});
check(systemPlan.schema === XIZONG_REPRESENTATION_SCHEMA, 'system_framework_uses_shared_representation_schema');
check(systemPlan.componentEntitlement === false, 'system_fields_do_not_entitle_one_card_each');
check(systemPlan.graphEntitlement === false, 'system_framework_has_no_generic_graph_entitlement');
check(systemPlan.spine.representation.kind === 'SIMPLE_CHAIN', 'system_explicit_spine_is_simple_chain');
check(systemPlan.spine.items.length === a1SystemRaw.mental_model.spine.length, 'system_spine_preserves_current_order');
check(systemPlan.variables.representation.kind === 'STRUCTURED_TABLE', 'system_variables_use_safe_structured_table');
check(systemPlan.formulas.length === a1SystemRaw.core_relations.length && systemPlan.formulas.every((row) => row.representation.kind === 'FORMULA_STRIP'), 'system_explicit_relations_are_formula_strips');
check(systemPlan.judgmentAxes.representation.kind === 'STRUCTURED_TEXT', 'system_judgment_axes_do_not_auto_graph');
check(systemPlan.dependencies.representation.kind === 'STRUCTURED_TEXT', 'system_dependency_dag_does_not_auto_graph');
check(systemPlan.failures.some((row) => row.representation.kind === 'SIMPLE_CHAIN'), 'system_explicit_failure_chain_can_stay_simple_chain');

// Integration readback: final learner components must consume the gate rather than
// rediscovering presentation from raw Projection geometry / asset presence.
const frameworkComponent = fs.readFileSync(path.join(process.cwd(), 'src/components/XizongCognitiveProjectionStage.astro'), 'utf8');
const learnerBridge = fs.readFileSync(path.join(process.cwd(), 'src/components/XizongLearnerObjectBridge.astro'), 'utf8');
const systemComponent = fs.readFileSync(path.join(process.cwd(), 'src/components/XizongSystemWorkspace.astro'), 'utf8');
const blockPage = fs.readFileSync(path.join(process.cwd(), 'src/pages/xizong/[system]/[block].astro'), 'utf8');

check(frameworkComponent.includes('composeXizongFrameworkRepresentation'), 'block_framework_consumes_representation_gate');
check(frameworkComponent.includes('data-representation-kind'), 'block_framework_exposes_resolved_representation');
check(frameworkComponent.includes('representation-${representation.kind.toLowerCase()}'), 'block_framework_css_keys_off_representation_kind');
check(!frameworkComponent.includes("class:list={['xv6ProjectionObject', `geometry-"), 'block_framework_does_not_style_from_raw_geometry');
check(!frameworkComponent.includes('{stageObjects.length} 个结构对象'), 'block_framework_does_not_expose_backend_object_inventory');

check(learnerBridge.includes('resolveXizongLearnerAssetRepresentation'), 'auxiliary_presenter_consumes_representation_gate');
check(learnerBridge.includes("root.dataset.representationGate = 'kianos.xizong.representation.v1'"), 'runtime_marks_active_representation_gate');
check(learnerBridge.includes('resolvedSlotWeight'), 'auxiliary_width_uses_resolved_representation_weight');
check(learnerBridge.includes("['SOURCE_VISUAL', 'REVIEWED_VISUAL', 'STRUCTURED_TABLE']"), 'rich_aux_is_bounded_to_reviewed_visual_or_table_primitives');
check(!learnerBridge.includes("if (array(slot?.visual).length || richExtension) return 'rich'"), 'raw_asset_existence_no_longer_controls_aux_width');
check(learnerBridge.includes("representationStage = 'KP_RECALL_FRONT'"), 'recall_front_routes_through_protected_representation_stage');

check(systemComponent.includes('composeXizongSystemFrameworkRepresentation'), 'system_framework_consumes_representation_gate');
check(systemComponent.includes('data-system-framework-plan="purpose-first"'), 'system_workspace_marks_purpose_first_plan');
check(systemComponent.includes('data-representation-kind={framework.spine.representation.kind}'), 'system_spine_uses_resolved_representation');
check(systemComponent.includes('data-representation-kind={framework.dependencies.representation.kind}'), 'system_dependencies_use_resolved_safe_representation');
check(systemComponent.includes('class="xzSystemWorkspace"'), 'system_workspace_uses_current_namespace');
check(!systemComponent.includes('xv6System'), 'system_workspace_retired_legacy_namespace');
check(!systemComponent.includes('Block 依赖图'), 'system_dependency_graph_label_retired');
check(!systemComponent.includes('geometry-'), 'system_workspace_does_not_style_from_geometry_taxonomy');

check(blockPage.includes('XizongBlockWorkspaceShell'), 'one_screen_workspace_shell_mounted_by_block_page');
check(blockPage.includes('XizongBlockAuxLayoutSync'), 'dynamic_aux_layout_sync_mounted_by_block_page');
check(blockPage.includes('data-xizong-legacy-crosswalk-bridge'), 'crosswalk_remains_hidden_query_bridge');
check(!blockPage.includes('XizongMemoryReviewV6'), 'legacy_after_learn_memory_surface_not_mounted');

console.log(JSON.stringify({
  ok: true,
  schema: XIZONG_REPRESENTATION_SCHEMA,
  calibration: 'A1_B1_AND_A1_SYSTEM',
  primitives: {
    problem: problem.kind,
    mechanism: chain.kind,
    formula: formula.kind,
    framework: framework.kind,
    systemSpine: systemPlan.spine.representation.kind,
    systemVariables: systemPlan.variables.representation.kind,
    systemDependencies: systemPlan.dependencies.representation.kind
  },
  integration: {
    framework: 'GATE_DRIVEN_COMPOSED_SURFACE',
    systemFramework: 'PURPOSE_FIRST_GATE_DRIVEN_WORKSPACE',
    auxiliary: 'GATE_DRIVEN_DYNAMIC_SUPPORT',
    recallFront: 'WORKSPACE_WIDE_PROTECTED'
  },
  hardFallback: 'STRUCTURED_TEXT'
}, null, 2));