export const XIZONG_REPRESENTATION_SCHEMA = 'kianos.xizong.representation.v1';

export const XIZONG_REPRESENTATION_KINDS = Object.freeze([
  'STRUCTURED_TEXT',
  'SIMPLE_CHAIN',
  'STRUCTURED_TABLE',
  'FORMULA_STRIP',
  'SOURCE_VISUAL',
  'REVIEWED_VISUAL',
  'DECISION_PATH'
]);

const KIND_SET = new Set(XIZONG_REPRESENTATION_KINDS);
const REVIEW_REQUIRED = new Set(['REVIEWED_VISUAL', 'DECISION_PATH']);
const RECALL_FRONT_STAGES = new Set(['KP_RECALL_FRONT', 'BLOCK_RECALL_FRONT', 'SYSTEM_RECALL_FRONT']);

function text(value) {
  return String(value || '').trim();
}

function upper(value) {
  return text(value).toUpperCase();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function representation(kind, reason) {
  return {
    schema: XIZONG_REPRESENTATION_SCHEMA,
    kind,
    visible: true,
    reason
  };
}

export function splitXizongExplicitChain(value) {
  const raw = text(value);
  if (!raw.includes('→')) return raw ? [raw] : [];
  return raw.split('→').map((item) => text(item)).filter(Boolean);
}

function explicitRepresentation(object) {
  const kind = upper(object?.presentation?.representation || object?.representation_hint);
  if (!KIND_SET.has(kind)) return null;

  if (REVIEW_REQUIRED.has(kind)) {
    const fidelity = upper(object?.presentation?.semantic_fidelity || object?.representation_fidelity);
    if (fidelity !== 'CURRENT_EXPLICIT') return null;
  }

  return kind;
}

function projectionDefault(object) {
  const role = upper(object?.role);
  const geometry = upper(object?.geometry);

  if (geometry === 'FORMULA_STRIP') {
    return {
      kind: 'FORMULA_STRIP',
      reason: 'EXPLICIT_FORMULA_GEOMETRY'
    };
  }

  if (role === 'CHAIN' && geometry === 'SEQUENCE') {
    return {
      kind: 'SIMPLE_CHAIN',
      reason: 'EXPLICIT_CHAIN_SEQUENCE'
    };
  }

  if (role === 'COMPARE' && (geometry === 'MATRIX' || geometry === 'TABLE')) {
    return {
      kind: 'STRUCTURED_TABLE',
      reason: 'EXPLICIT_COMPARE_MATRIX'
    };
  }

  if (geometry === 'TABLE') {
    return {
      kind: 'STRUCTURED_TABLE',
      reason: 'EXPLICIT_TABLE_GEOMETRY'
    };
  }

  // MAP / TREE / NETWORK / LOOP / AXES / SPATIAL_MAP intentionally fall back.
  // Their semantic structure is preserved by Projection, but V1 refuses to infer a
  // graphical layout that could invent hierarchy, causality, centrality or order.
  return {
    kind: 'STRUCTURED_TEXT',
    reason: geometry ? `SAFE_FALLBACK_${geometry}` : 'SAFE_FALLBACK_NO_GEOMETRY'
  };
}

export function resolveXizongProjectionRepresentation(object, { stage = 'LEARN' } = {}) {
  const normalizedStage = upper(stage) || 'LEARN';
  const answerBearing = object?.answer_bearing === true || object?.answerBearing === true;

  if (RECALL_FRONT_STAGES.has(normalizedStage) && answerBearing) {
    return {
      schema: XIZONG_REPRESENTATION_SCHEMA,
      kind: 'STRUCTURED_TEXT',
      visible: false,
      reason: 'RECALL_FRONT_ANSWER_PROTECTED',
      sourceObjectId: text(object?.object_id || object?.objectId),
      role: upper(object?.role),
      geometry: upper(object?.geometry)
    };
  }

  const explicit = explicitRepresentation(object);
  const resolved = explicit
    ? { kind: explicit, reason: 'EXPLICIT_CURRENT_REPRESENTATION' }
    : projectionDefault(object);

  return {
    schema: XIZONG_REPRESENTATION_SCHEMA,
    kind: resolved.kind,
    visible: true,
    reason: resolved.reason,
    sourceObjectId: text(object?.object_id || object?.objectId),
    role: upper(object?.role),
    geometry: upper(object?.geometry)
  };
}

function assetType(asset) {
  return upper(asset?.assetType || asset?.asset_type || asset?.kind);
}

function hasSourceVisual(asset) {
  const bundleAssets = array(asset?.sourceVisualBundle?.assets || asset?.source_visual_bundle?.assets);
  return bundleAssets.length > 0 || Boolean(text(asset?.src));
}

export function resolveXizongLearnerAssetRepresentation(asset, { stage = 'LEARN' } = {}) {
  const normalizedStage = upper(stage) || 'LEARN';
  const type = assetType(asset);

  // KP Recall is Core-protected only: learner support may remain visible.
  // Block/System Recall retain stricter neutral-front protection.
  if (RECALL_FRONT_STAGES.has(normalizedStage) && normalizedStage !== 'KP_RECALL_FRONT') {
    return {
      schema: XIZONG_REPRESENTATION_SCHEMA,
      kind: 'STRUCTURED_TEXT',
      visible: false,
      reason: 'RECALL_FRONT_AUXILIARY_PROTECTED',
      sourceAssetId: text(asset?.id)
    };
  }

  const timing = upper(asset?.displayPolicy?.timing || asset?.display_policy?.timing || asset?.raw?.display_policy?.timing);
  const answerBearing = asset?.answerBearing === true || asset?.answer_bearing === true || asset?.raw?.answer_bearing === true || asset?.raw?.answerBearing === true;
  if (normalizedStage === 'KP_RECALL_FRONT' && (answerBearing || timing === 'POST_REVEAL')) {
    return { schema: XIZONG_REPRESENTATION_SCHEMA, kind: 'STRUCTURED_TEXT', visible: false,
      reason: answerBearing ? 'KP_ANSWER_PAYLOAD_PROTECTED' : 'OWNED_POST_REVEAL_TIMING', sourceAssetId: text(asset?.id) };
  }

  if ((type === 'VISUAL' || type === 'SOURCE_VISUAL') && hasSourceVisual(asset)) {
    return {
      schema: XIZONG_REPRESENTATION_SCHEMA,
      kind: 'SOURCE_VISUAL',
      visible: true,
      reason: 'REVIEWED_SOURCE_VISUAL_ASSET',
      sourceAssetId: text(asset?.id)
    };
  }

  if (type === 'STRUCTURED_TABLE') {
    return {
      schema: XIZONG_REPRESENTATION_SCHEMA,
      kind: 'STRUCTURED_TABLE',
      visible: true,
      reason: 'REVIEWED_STRUCTURED_TABLE_ASSET',
      sourceAssetId: text(asset?.id)
    };
  }

  if (type === 'SUMMARY_VISUAL' && hasSourceVisual(asset)) {
    return {
      schema: XIZONG_REPRESENTATION_SCHEMA,
      kind: 'REVIEWED_VISUAL',
      visible: true,
      reason: 'REVIEWED_SUMMARY_VISUAL_ASSET',
      sourceAssetId: text(asset?.id)
    };
  }

  return {
    schema: XIZONG_REPRESENTATION_SCHEMA,
    kind: 'STRUCTURED_TEXT',
    visible: true,
    reason: type ? `SAFE_ASSET_FALLBACK_${type}` : 'SAFE_ASSET_FALLBACK',
    sourceAssetId: text(asset?.id)
  };
}

export function composeXizongFrameworkRepresentation(objects, { stage = 'BLOCK_ORIENT' } = {}) {
  const rows = array(objects).map((object) => ({
    object,
    representation: resolveXizongProjectionRepresentation(object, { stage })
  })).filter((row) => row.representation.visible);

  const problem = [];
  const primary = [];
  const support = [];
  const reference = [];

  for (const row of rows) {
    const role = upper(row.object?.role);
    const stageRole = upper(row.object?.stage_role || row.object?.stageRole);

    if (role === 'PROBLEM') {
      problem.push(row);
      continue;
    }
    if (role === 'REFERENCE' || stageRole === 'REFERENCE') {
      reference.push(row);
      continue;
    }
    if (stageRole === 'PRIMARY_STAGE') {
      primary.push(row);
      continue;
    }
    support.push(row);
  }

  return {
    schema: XIZONG_REPRESENTATION_SCHEMA,
    kind: 'FRAMEWORK_PLAN',
    stage: upper(stage),
    objectCount: rows.length,
    regions: {
      problem,
      primary,
      support,
      reference
    },
    // A renderer may compose adjacent objects into one learner surface. This plan
    // deliberately does not declare one component per object.
    componentEntitlement: false
  };
}

// System Framework consumes canonical System semantics directly. The gate chooses
// only learner representation; it does not infer new medical relations or reorder
// Current-owned arrays. Explicit ordered arrays/chains stay simple chains, explicit
// formulas stay formula strips, while judgment axes and dependency DAGs stay text.
export function composeXizongSystemFrameworkRepresentation(system) {
  const spineItems = array(system?.mentalModel?.spine).map(text).filter(Boolean);
  const parallelItems = array(system?.mentalModel?.parallelControls).map(text).filter(Boolean);
  const variableRows = array(system?.coreVariables).map((item) => ({
    id: text(typeof item === 'string' ? '' : item?.id),
    label: text(typeof item === 'string' ? item : item?.label || item?.id),
    role: text(typeof item === 'string' ? '' : item?.role)
  })).filter((item) => item.label);
  const formulaRows = array(system?.coreRelations).map((item) => text(typeof item === 'string' ? item : item?.formula || item?.relation || item?.label)).filter(Boolean);
  const judgmentRows = array(system?.judgmentAxes).map(text).filter(Boolean);
  const dependencyRows = array(system?.dependencyDag).map(text).filter(Boolean);
  const failures = array(system?.failureModes).map((mode) => {
    const chain = text(mode?.chain);
    const chainItems = splitXizongExplicitChain(chain);
    return {
      id: text(mode?.id),
      label: text(mode?.label || mode?.id),
      chain,
      chainItems,
      representation: chainItems.length >= 2
        ? representation('SIMPLE_CHAIN', 'CURRENT_EXPLICIT_FAILURE_CHAIN')
        : representation('STRUCTURED_TEXT', 'CURRENT_FAILURE_TEXT')
    };
  });

  return {
    schema: XIZONG_REPRESENTATION_SCHEMA,
    kind: 'SYSTEM_FRAMEWORK_PLAN',
    componentEntitlement: false,
    graphEntitlement: false,
    mission: {
      text: text(system?.mission),
      representation: representation('STRUCTURED_TEXT', 'CURRENT_SYSTEM_MISSION')
    },
    motherModel: {
      text: text(system?.mentalModel?.motherModel),
      representation: representation('STRUCTURED_TEXT', 'CURRENT_MOTHER_MODEL')
    },
    spine: {
      items: spineItems,
      representation: spineItems.length >= 2
        ? representation('SIMPLE_CHAIN', 'CURRENT_ORDERED_SYSTEM_SPINE')
        : representation('STRUCTURED_TEXT', 'CURRENT_SYSTEM_SPINE_TEXT')
    },
    parallelControls: {
      items: parallelItems,
      representation: representation('STRUCTURED_TEXT', 'CURRENT_PARALLEL_CONTROLS')
    },
    variables: {
      rows: variableRows,
      representation: representation('STRUCTURED_TABLE', 'CURRENT_VARIABLE_LABEL_ROLE_TABLE')
    },
    formulas: formulaRows.map((formula) => ({
      formula,
      representation: representation('FORMULA_STRIP', 'CURRENT_EXPLICIT_CORE_RELATION')
    })),
    judgmentAxes: {
      items: judgmentRows,
      representation: representation('STRUCTURED_TEXT', 'SAFE_JUDGMENT_AXIS_TEXT')
    },
    failures,
    dependencies: {
      items: dependencyRows,
      representation: representation('STRUCTURED_TEXT', 'SAFE_DEPENDENCY_TEXT_NO_GRAPH')
    }
  };
}
