import fs from 'node:fs';
import path from 'node:path';
import { resolvePoliticsSurfaceMapping } from '../src/lib/politicsSurfaceMapping.mjs';

const root = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const allowPartial = process.argv.includes('--allow-partial');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read('content/politics/projection/manifest.json');

const ALLOWED_STATES = new Set(['ORIENT', 'EXTERNAL_LEARN', 'CLOSE', 'VERIFY_POST', 'REPAIR', 'CONTINUE']);
const ALLOWED_ZONES = new Set(['PRIMARY', 'COMPANION', 'SUPPORT', 'HANDOFF', 'CLOSURE', 'REPAIR_ONLY']);
const ALLOWED_PRIMITIVES = new Set(['STATEMENT', 'PARALLEL_SET', 'RELATION_SET', 'DIRECTED_SEQUENCE', 'COMPARE', 'HIERARCHY', 'TIMELINE']);
const PROVENANCE_FIELDS = new Set(['id', 'source_evidence', 'source_ref', 'source_refs', 'source_owner_ids', 'schema', 'status', 'audit', 'learning_priority', 'learner_tier']);
const STATE_ZONES = {
  ORIENT: new Set(['PRIMARY', 'COMPANION', 'SUPPORT']),
  EXTERNAL_LEARN: new Set(['HANDOFF', 'COMPANION', 'SUPPORT']),
  CLOSE: new Set(['CLOSURE', 'SUPPORT']),
  VERIFY_POST: new Set(['COMPANION', 'SUPPORT', 'REPAIR_ONLY']),
  REPAIR: new Set(['REPAIR_ONLY']),
  CONTINUE: new Set(['CLOSURE', 'COMPANION'])
};

const rows = [];
const errors = [];
const missing = [];
let chapterCount = 0;
let ownerCount = 0;
let passCount = 0;
let referenceOnlyCount = 0;
let blockedCount = 0;
let mappedPassCount = 0;
let labeledRelationTransitionCount = 0;
let orderOnlyTransitionCount = 0;

function fail(code, detail) {
  errors.push(`${code}:${detail}`);
}

function rawUnitsFor(source) {
  return source.units || source.unit_projections || (source.unit ? [source.unit] : []);
}

function validateResolvedGroup(group, prefix) {
  if (!Array.isArray(group.items) || group.items.length === 0) fail('RESOLVED_GROUP_EMPTY', prefix);
  if (group.primitive === 'STATEMENT' && group.items.length !== 1) {
    fail('STATEMENT_MUST_BE_SINGLE_CLAIM', `${prefix}:${group.items.length}`);
  }
  if (group.primitive === 'RELATION_SET') {
    if (group.items.length < 2) fail('RELATION_SET_TOO_SHORT', prefix);
    if (group.transitions.length) fail('RELATION_SET_HAS_SEQUENCE_TRANSITIONS', prefix);
    for (const item of group.items) {
      if (!(item?.from_label && item?.relation && item?.to_label)) {
        fail('RELATION_SET_ITEM_NOT_EXPLICIT', `${prefix}:${item?.id || '<item>'}`);
      }
    }
  }
  if (group.primitive === 'DIRECTED_SEQUENCE') {
    if (group.items.length < 2) fail('DIRECTED_SEQUENCE_TOO_SHORT', prefix);
    if (group.transitions.length !== Math.max(0, group.items.length - 1)) fail('DIRECTED_SEQUENCE_TRANSITION_COUNT', prefix);
    for (let index = 0; index < group.items.length - 1; index += 1) {
      const from = group.items[index]?.id;
      const to = group.items[index + 1]?.id;
      const transition = group.transitions.find((row) => row.from === from && row.to === to);
      if (!transition) {
        fail('DIRECTED_SEQUENCE_NON_ADJACENT_MAPPING', `${prefix}:${from}->${to}`);
        continue;
      }
      if (transition.relation_mode === 'LABELED_RELATION') {
        if (typeof transition.relation !== 'string' || !transition.relation.trim()) {
          fail('DIRECTED_SEQUENCE_LABELED_RELATION_EMPTY', `${prefix}:${from}->${to}`);
        }
      } else if (transition.relation_mode === 'ORDER_ONLY') {
        if (transition.relation != null) fail('DIRECTED_SEQUENCE_ORDER_ONLY_HAS_RELATION', `${prefix}:${from}->${to}`);
      } else {
        fail('DIRECTED_SEQUENCE_TRANSITION_MODE_INVALID', `${prefix}:${from}->${to}:${transition.relation_mode || '<missing>'}`);
      }
    }
  }
  if (group.primitive === 'PARALLEL_SET' && group.transitions.length) fail('PARALLEL_SET_HAS_TRANSITIONS', prefix);
  if (group.primitive === 'COMPARE') {
    for (const item of group.items) {
      if (!(item?.left && item?.right && item?.distinction)) fail('COMPARE_NOT_STRUCTURED', `${prefix}:${item?.id || '<item>'}`);
    }
  }
  if (group.primitive === 'HIERARCHY') {
    for (const item of group.items) {
      if (!(item?.label && item?.text)) fail('HIERARCHY_LEVEL_INCOMPLETE', `${prefix}:${item?.id || '<item>'}`);
    }
  }
}

function validateMapping(unit, file, source, rawUnit) {
  const mapping = unit.surface_mapping;
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    missing.push(`${file}:${unit.unit_id}`);
    if (!allowPartial) fail('MISSING_SURFACE_MAPPING', `${file}:${unit.unit_id}`);
    return false;
  }

  const groupIds = new Set();
  let groupCount = 0;
  for (const [state, groups] of Object.entries(mapping)) {
    if (!ALLOWED_STATES.has(state)) fail('INVALID_STATE', `${file}:${unit.unit_id}:${state}`);
    if (!Array.isArray(groups)) {
      fail('STATE_GROUPS_NOT_ARRAY', `${file}:${unit.unit_id}:${state}`);
      continue;
    }
    for (const [index, group] of groups.entries()) {
      groupCount += 1;
      const prefix = `${file}:${unit.unit_id}:${state}[${index}]`;
      if (!group || typeof group !== 'object' || Array.isArray(group)) {
        fail('GROUP_NOT_OBJECT', prefix);
        continue;
      }
      if (!group.id || groupIds.has(group.id)) fail('GROUP_ID_MISSING_OR_DUPLICATE', `${prefix}:${group.id || '<missing>'}`);
      else groupIds.add(group.id);
      if (!ALLOWED_ZONES.has(group.zone)) fail('INVALID_ZONE', `${prefix}:${group.zone}`);
      if (STATE_ZONES[state] && !STATE_ZONES[state].has(group.zone)) fail('ZONE_WRONG_FOR_STATE', `${prefix}:${group.zone}`);
      if (!ALLOWED_PRIMITIVES.has(group.primitive)) fail('INVALID_PRIMITIVE', `${prefix}:${group.primitive}`);
      if (!group.source && !(Array.isArray(group.sources) && group.sources.length > 0)) fail('GROUP_SOURCE_MISSING', prefix);
      if (group.source && Array.isArray(group.sources) && group.sources.length > 0) fail('GROUP_HAS_SOURCE_AND_SOURCES', prefix);
      for (const field of group.item_fields || []) {
        if (PROVENANCE_FIELDS.has(field)) fail('PROVENANCE_FIELD_EXPOSED', `${prefix}:${field}`);
      }
      if (group.primitive === 'DIRECTED_SEQUENCE' && (!Array.isArray(group.transitions) || group.transitions.length === 0)) {
        fail('DIRECTED_SEQUENCE_WITHOUT_TRANSITIONS', prefix);
      }
      if (group.primitive === 'DIRECTED_SEQUENCE' && Array.isArray(group.transitions)) {
        for (const [transitionIndex, transition] of group.transitions.entries()) {
          const transitionPrefix = `${prefix}:transition[${transitionIndex}]`;
          if (!transition || typeof transition !== 'object' || Array.isArray(transition)) {
            fail('DIRECTED_SEQUENCE_TRANSITION_NOT_OBJECT', transitionPrefix);
            continue;
          }
          if (typeof transition.from !== 'string' || !transition.from || typeof transition.to !== 'string' || !transition.to) {
            fail('DIRECTED_SEQUENCE_TRANSITION_ENDPOINT_MISSING', transitionPrefix);
          }
          const ownsRelation = Object.prototype.hasOwnProperty.call(transition, 'relation');
          if (ownsRelation) {
            if (typeof transition.relation !== 'string' || !transition.relation.trim()) {
              fail('DIRECTED_SEQUENCE_TRANSITION_RELATION_EMPTY', transitionPrefix);
            } else {
              labeledRelationTransitionCount += 1;
            }
          } else {
            orderOnlyTransitionCount += 1;
          }
        }
      }
      if (['PARALLEL_SET', 'RELATION_SET', 'STATEMENT'].includes(group.primitive) && Array.isArray(group.transitions) && group.transitions.length) {
        fail(`${group.primitive}_HAS_TRANSITIONS`, prefix);
      }
      if (group.primitive === 'HIERARCHY' && (!Array.isArray(group.levels) || group.levels.length === 0)) {
        fail('HIERARCHY_WITHOUT_LEVELS', prefix);
      }
    }
  }

  if (!Array.isArray(mapping.ORIENT) || mapping.ORIENT.length === 0) fail('ORIENT_MAPPING_MISSING', `${file}:${unit.unit_id}`);

  try {
    const resolved = resolvePoliticsSurfaceMapping(mapping, source, rawUnit);
    for (const [state, groups] of Object.entries(resolved?.states || {})) {
      groups.forEach((group, index) => validateResolvedGroup(group, `${file}:${unit.unit_id}:${state}[${index}]`));
    }
  } catch (error) {
    fail('SURFACE_MAPPING_RESOLUTION_FAIL', `${file}:${unit.unit_id}:${error instanceof Error ? error.message : String(error)}`);
  }

  return groupCount > 0;
}

for (const subject of Object.values(manifest.subjects || {})) {
  for (const file of subject.files || []) {
    chapterCount += 1;
    const projection = read(`content/politics/projection/${file}`);
    const source = read(projection.source?.path);
    const rawById = new Map(rawUnitsFor(source).map((unit) => [unit.natural_unit_id, unit]));
    for (const unit of projection.units || []) {
      ownerCount += 1;
      const disposition = unit.projection_disposition || 'UNKNOWN';
      if (disposition === 'PASS') passCount += 1;
      else if (disposition === 'REFERENCE_ONLY') referenceOnlyCount += 1;
      else if (disposition === 'BLOCKED') blockedCount += 1;

      let mapped = false;
      if (disposition === 'PASS') {
        const rawUnit = rawById.get(unit.unit_id);
        if (!rawUnit) fail('RAW_UNIT_MISSING', `${file}:${unit.unit_id}`);
        else mapped = validateMapping(unit, file, source, rawUnit);
      }
      if (mapped) mappedPassCount += 1;
      if (disposition === 'REFERENCE_ONLY' && unit.surface_mapping) fail('REFERENCE_ONLY_HAS_TEACHING_MAPPING', `${file}:${unit.unit_id}`);
      rows.push({ file, unit_id: unit.unit_id, disposition, mapped });
    }
  }
}

if (chapterCount !== 53) fail('CHAPTER_ACCOUNTING_MISMATCH', `${chapterCount}`);
if (ownerCount !== 160) fail('OWNER_ACCOUNTING_MISMATCH', `${ownerCount}`);
if (passCount !== 151) fail('PASS_ACCOUNTING_MISMATCH', `${passCount}`);
if (referenceOnlyCount !== 9) fail('REFERENCE_ONLY_ACCOUNTING_MISMATCH', `${referenceOnlyCount}`);
if (blockedCount !== 0) fail('BLOCKED_ACCOUNTING_MISMATCH', `${blockedCount}`);
if (!allowPartial && mappedPassCount !== passCount) fail('FULL_MAPPING_INCOMPLETE', `${mappedPassCount}/${passCount}`);

const report = {
  schema: 'kianos.politics.explicit_surface_mapping_audit.v3',
  mode: allowPartial ? 'PARTIAL_DEVELOPMENT' : 'STRICT_ACCEPTANCE',
  chapters: chapterCount,
  owners: ownerCount,
  pass: passCount,
  reference_only: referenceOnlyCount,
  blocked: blockedCount,
  mapped_pass: mappedPassCount,
  unmapped_pass: passCount - mappedPassCount,
  labeled_relation_transitions: labeledRelationTransitionCount,
  order_only_transitions: orderOnlyTransitionCount,
  missing,
  errors,
  rows
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
