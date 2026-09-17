export const POLITICS_CONTENT_TIERS = Object.freeze([
  'H1_ORIENTATION_CORE',
  'H2_FIRST_ROUND_CARRY',
  'H3_SUPPORTING_UNDERSTANDING',
  'H4_ON_DEMAND',
  'H5_REPAIR_REFERENCE'
]);

const TIER_SET = new Set(POLITICS_CONTENT_TIERS);
const EARLY_TIERS = new Set(['H1_ORIENTATION_CORE', 'H2_FIRST_ROUND_CARRY', 'H3_SUPPORTING_UNDERSTANDING']);
const PROVENANCE_KEYS = new Set([
  'id', 'source_evidence', 'source_ref', 'source_refs', 'source_owner_ids', 'natural_unit_id',
  'schema', 'status', 'content_stage_only', 'audit', 'learning_priority', 'learning_rule', 'learner_tier'
]);
const present = value => value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
const asItems = value => Array.isArray(value) ? value : (present(value) ? [value] : []);

function explicitTier(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const tier = value.learner_tier;
  if (tier == null) return null;
  if (!TIER_SET.has(tier)) throw new Error(`POLITICS_CONTENT_HIERARCHY_INVALID_TIER:${tier}`);
  return tier;
}

function assertTierGuard(kind, value, tier) {
  if (kind === 'problem' && tier !== 'H1_ORIENTATION_CORE') {
    throw new Error('POLITICS_CONTENT_HIERARCHY_PROBLEM_MUST_BE_H1');
  }
  if (kind === 'exact') {
    // `exact` reaches this function only after the accepted Projection has
    // selected it through `first_round_exact`. That selector is the Current
    // first-round decision across subject-specific content schemas; do not
    // re-derive it from one Marxism-only metadata shape here.
    if (tier !== 'H2_FIRST_ROUND_CARRY') {
      throw new Error(`POLITICS_CONTENT_HIERARCHY_SELECTED_EXACT_MUST_BE_H2:${value?.id || value?.name || '<unknown>'}`);
    }
    if (['REFERENCE_OR_QUESTION_TRIGGERED', 'REPAIR_ONLY'].includes(value?.learning_priority)) {
      throw new Error(`POLITICS_CONTENT_HIERARCHY_REPAIR_EXACT_SELECTED_FIRST_ROUND:${value?.id || value?.name || '<unknown>'}`);
    }
  }
}

function stripProvenance(value) {
  if (Array.isArray(value)) return value.map(stripProvenance).filter(item => item !== undefined);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (PROVENANCE_KEYS.has(key)) continue;
    const clean = stripProvenance(child);
    if (clean !== undefined) out[key] = clean;
  }
  return out;
}

function extractProvenance(value) {
  if (Array.isArray(value)) {
    const rows = value.map(extractProvenance).filter(present);
    return rows.length ? rows : null;
  }
  if (!value || typeof value !== 'object') return null;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (PROVENANCE_KEYS.has(key)) {
      if (present(child)) out[key] = child;
      continue;
    }
    const nested = extractProvenance(child);
    if (present(nested)) out[key] = nested;
  }
  return Object.keys(out).length ? out : null;
}

function pushRaw(bucket, tier, kind, value, meta = {}) {
  if (!present(value)) return;
  bucket[tier].push({ kind, value, ...meta });
}

function pushLearner(bucket, tier, kind, rawValue, meta = {}) {
  if (!present(rawValue)) return;
  assertTierGuard(kind, rawValue, tier);
  const learnerValue = stripProvenance(rawValue);
  if (present(learnerValue)) bucket[tier].push({ kind, value: learnerValue, ...meta });
  const provenance = extractProvenance(rawValue);
  if (present(provenance)) {
    bucket.H5_REPAIR_REFERENCE.push({ kind: 'provenance', forKind: kind, value: provenance, ...meta });
  }
}

function routeValues(bucket, kind, values, defaultTier, meta = {}) {
  for (const value of asItems(values)) {
    const tier = explicitTier(value) || defaultTier;
    pushLearner(bucket, tier, kind, value, meta);
  }
}

function routeObjects(bucket, kind, objects, defaultTier) {
  for (const object of objects || []) {
    for (const value of asItems(object?.value)) {
      const tier = explicitTier(value) || defaultTier;
      pushLearner(bucket, tier, kind, value, { role: object?.role || null });
    }
  }
}

export function buildPoliticsContentHierarchy({
  problem = null,
  primary = [],
  secondary = [],
  boundaries = [],
  exact = [],
  takeaway = [],
  next = null,
  handoff = null,
  closure = null
} = {}) {
  const buckets = Object.fromEntries(POLITICS_CONTENT_TIERS.map(tier => [tier, []]));

  if (present(problem)) {
    const tier = explicitTier(problem) || 'H1_ORIENTATION_CORE';
    pushLearner(buckets, tier, 'problem', problem);
  }

  routeObjects(buckets, 'primary', primary, 'H1_ORIENTATION_CORE');
  routeValues(buckets, 'boundary', boundaries, 'H2_FIRST_ROUND_CARRY');
  routeValues(buckets, 'exact', exact, 'H2_FIRST_ROUND_CARRY');
  routeValues(buckets, 'takeaway', takeaway, 'H2_FIRST_ROUND_CARRY');
  routeObjects(buckets, 'secondary', secondary, 'H3_SUPPORTING_UNDERSTANDING');

  if (handoff) {
    const visibleHandoff = {
      locator: handoff.locator || null,
      lookFor: Array.isArray(handoff.lookFor) ? handoff.lookFor : []
    };
    if (present(visibleHandoff.locator) || visibleHandoff.lookFor.length) {
      pushRaw(buckets, 'H1_ORIENTATION_CORE', 'handoff', visibleHandoff);
    }
    const handoffMeta = {
      surface: handoff.surface || null,
      sourceOwnerIds: Array.isArray(handoff.sourceOwnerIds) ? handoff.sourceOwnerIds : []
    };
    if (present(handoffMeta.surface) || handoffMeta.sourceOwnerIds.length) {
      pushRaw(buckets, 'H5_REPAIR_REFERENCE', 'handoff_provenance', handoffMeta);
    }
  }

  if (present(closure)) pushLearner(buckets, 'H4_ON_DEMAND', 'closure', closure);
  if (present(next)) pushLearner(buckets, 'H4_ON_DEMAND', 'next', next);

  return {
    schema: 'kianos.politics.content_hierarchy.resolved.v1',
    tiers: buckets
  };
}

function containsForbiddenLearnerKey(value) {
  if (Array.isArray(value)) return value.some(containsForbiddenLearnerKey);
  if (!value || typeof value !== 'object') return false;
  for (const [key, child] of Object.entries(value)) {
    if (PROVENANCE_KEYS.has(key)) return true;
    if (containsForbiddenLearnerKey(child)) return true;
  }
  return false;
}

export function validatePoliticsContentHierarchy(hierarchy) {
  if (hierarchy?.schema !== 'kianos.politics.content_hierarchy.resolved.v1') {
    throw new Error('POLITICS_CONTENT_HIERARCHY_SCHEMA_INVALID');
  }
  for (const tier of POLITICS_CONTENT_TIERS) {
    if (!Array.isArray(hierarchy?.tiers?.[tier])) throw new Error(`POLITICS_CONTENT_HIERARCHY_BUCKET_MISSING:${tier}`);
  }
  const h1 = hierarchy.tiers.H1_ORIENTATION_CORE;
  if (!h1.some(item => item.kind === 'problem')) throw new Error('POLITICS_CONTENT_HIERARCHY_H1_PROBLEM_MISSING');

  for (const tier of POLITICS_CONTENT_TIERS.slice(0, 4)) {
    for (const item of hierarchy.tiers[tier]) {
      if (containsForbiddenLearnerKey(item.value)) {
        throw new Error(`POLITICS_CONTENT_HIERARCHY_PROVENANCE_LEAK:${tier}:${item.kind}`);
      }
    }
  }
  return true;
}
