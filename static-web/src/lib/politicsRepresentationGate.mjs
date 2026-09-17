export const POLITICS_REPRESENTATION_SCHEMA = 'kianos.politics.representation.v1';

export const POLITICS_REPRESENTATION_KINDS = Object.freeze([
  'STRUCTURED_TEXT',
  'SIMPLE_CHAIN',
  'TIMELINE',
  'COMPARE',
  'HIERARCHY'
]);

const KIND_SET = new Set(POLITICS_REPRESENTATION_KINDS);
const PROTECTED_STAGES = new Set(['VERIFY', 'RECALL', 'RECALL_FRONT']);

function text(value) {
  return String(value || '').trim();
}

function upper(value) {
  return text(value).toUpperCase();
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function currentExplicitRepresentation(object) {
  const kind = upper(object?.presentation?.representation || object?.representation_hint);
  if (!KIND_SET.has(kind)) return null;
  const fidelity = upper(object?.presentation?.semantic_fidelity || object?.representation_fidelity);
  return fidelity === 'CURRENT_EXPLICIT' ? kind : null;
}

function inferredSafeRepresentation(shape) {
  const normalized = upper(shape);

  // These shapes carry an explicit spatial meaning in Current. The renderer may
  // use that meaning without inventing a new relation.
  if (normalized.includes('TIMELINE') || normalized.includes('CHRONOLOGY')) {
    return { kind: 'TIMELINE', reason: 'CURRENT_EXPLICIT_TIME_ORDER' };
  }

  if (normalized.includes('HIERARCHY')) {
    return { kind: 'HIERARCHY', reason: 'CURRENT_EXPLICIT_HIERARCHY' };
  }

  if (
    normalized.includes('MATRIX') ||
    normalized.includes('COMPARE') ||
    normalized.includes('MULTI_AXIS') ||
    normalized.includes('DUAL_AXIS')
  ) {
    return { kind: 'COMPARE', reason: 'CURRENT_EXPLICIT_COMPARISON_AXES' };
  }

  // Deliberately conservative:
  // - MAP / TOPOLOGY / NETWORK do not grant a graph.
  // - CHAIN in a Projection name does not by itself grant arrows; a long reasoning
  //   chain is often clearer as large-type structured text.
  // - simultaneous_visibility means content should be available together, not that
  //   multiple diagrams must be drawn.
  return {
    kind: 'STRUCTURED_TEXT',
    reason: normalized ? `SAFE_TEXT_FALLBACK_${normalized}` : 'SAFE_TEXT_FALLBACK'
  };
}

export function resolvePoliticsUnitRepresentation(unitProjection, { stage = 'ORIENT' } = {}) {
  const normalizedStage = upper(stage) || 'ORIENT';
  const unitId = text(unitProjection?.unit_id || unitProjection?.unitId);
  const projectionShape = upper(unitProjection?.projection_shape || unitProjection?.projectionShape);
  const primaryGeometry = array(unitProjection?.primary_geometry || unitProjection?.primaryGeometry);
  const simultaneous = primaryGeometry.some((geometry) => geometry?.simultaneous_visibility === true || geometry?.simultaneousVisibility === true);

  if (PROTECTED_STAGES.has(normalizedStage)) {
    return {
      schema: POLITICS_REPRESENTATION_SCHEMA,
      kind: 'STRUCTURED_TEXT',
      visible: false,
      reason: `${normalizedStage}_ANSWER_PROTECTED`,
      unitId,
      projectionShape,
      simultaneous,
      componentEntitlement: false
    };
  }

  const explicit = currentExplicitRepresentation(unitProjection);
  const resolved = explicit
    ? { kind: explicit, reason: 'CURRENT_EXPLICIT_REPRESENTATION' }
    : inferredSafeRepresentation(projectionShape);

  return {
    schema: POLITICS_REPRESENTATION_SCHEMA,
    kind: resolved.kind,
    visible: true,
    reason: resolved.reason,
    unitId,
    projectionShape,
    simultaneous,
    compact: normalizedStage === 'EXTERNAL_LEARN',
    componentEntitlement: false
  };
}

export function resolvePoliticsChapterGeometry(geometry, { stage = 'ORIENT' } = {}) {
  const normalizedStage = upper(stage) || 'ORIENT';
  const shape = upper(geometry?.shape);

  if (PROTECTED_STAGES.has(normalizedStage)) {
    return {
      schema: POLITICS_REPRESENTATION_SCHEMA,
      kind: 'STRUCTURED_TEXT',
      visible: false,
      reason: `${normalizedStage}_CHAPTER_CONTEXT_PROTECTED`,
      shape
    };
  }

  const explicit = currentExplicitRepresentation(geometry);
  const resolved = explicit
    ? { kind: explicit, reason: 'CURRENT_EXPLICIT_REPRESENTATION' }
    : inferredSafeRepresentation(shape);

  return {
    schema: POLITICS_REPRESENTATION_SCHEMA,
    kind: resolved.kind,
    visible: true,
    reason: resolved.reason,
    shape,
    componentEntitlement: false
  };
}

export function composePoliticsOrientationPlan(chapterProjection, unitProjection) {
  const representation = resolvePoliticsUnitRepresentation(unitProjection, { stage: 'ORIENT' });
  const chapterContext = array(chapterProjection?.chapter_context?.stage_context)
    .map((geometry) => ({ geometry, representation: resolvePoliticsChapterGeometry(geometry, { stage: 'ORIENT' }) }))
    .filter((row) => row.representation.visible);

  return {
    schema: POLITICS_REPRESENTATION_SCHEMA,
    kind: 'ORIENTATION_PLAN',
    unitId: representation.unitId,
    representation,
    chapterContext,
    // Projection fields may feed one composed learner surface. No field/object
    // receives an automatic card or diagram merely because it exists.
    componentEntitlement: false
  };
}
