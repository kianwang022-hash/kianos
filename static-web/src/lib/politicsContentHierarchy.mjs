export const POLITICS_CONTENT_TIERS = Object.freeze([
  'H1_ORIENTATION_CORE',
  'H2_FIRST_ROUND_CARRY',
  'H3_SUPPORTING_UNDERSTANDING',
  'H4_ON_DEMAND',
  'H5_REPAIR_REFERENCE'
]);

const TIER_SET = new Set(POLITICS_CONTENT_TIERS);
const present = value => value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
const asItems = value => Array.isArray(value) ? value : (present(value) ? [value] : []);

function explicitTier(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const tier = value.learner_tier;
  if (tier == null) return null;
  if (!TIER_SET.has(tier)) throw new Error(`POLITICS_CONTENT_HIERARCHY_INVALID_TIER:${tier}`);
  return tier;
}

function precisionDefaultTier(value) {
  switch (value?.learning_priority) {
    case 'FIRST_ROUND_EXACT': return 'H2_FIRST_ROUND_CARRY';
    case 'PRECISION_NOT_ORIENTATION':
    case 'LATER_PRECISION': return 'H4_ON_DEMAND';
    case 'REFERENCE_OR_QUESTION_TRIGGERED':
    case 'REPAIR_ONLY': return 'H5_REPAIR_REFERENCE';
    default: return 'H5_REPAIR_REFERENCE';
  }
}

function push(bucket, tier, kind, value, meta = {}) {
  if (!present(value)) return;
  bucket[tier].push({ kind, value, ...meta });
}

function routeValues(bucket, kind, values, defaultTier, meta = {}) {
  for (const value of asItems(values)) {
    const tier = explicitTier(value) || (typeof defaultTier === 'function' ? defaultTier(value) : defaultTier);
    push(bucket, tier, kind, value, meta);
  }
}

function routeObjects(bucket, kind, objects, defaultTier) {
  for (const object of objects || []) {
    for (const value of asItems(object?.value)) {
      const tier = explicitTier(value) || defaultTier;
      push(bucket, tier, kind, value, { role: object?.role || null });
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
    if (tier !== 'H1_ORIENTATION_CORE') throw new Error('POLITICS_CONTENT_HIERARCHY_PROBLEM_MUST_BE_H1');
    push(buckets, tier, 'problem', problem);
  }

  routeObjects(buckets, 'primary', primary, 'H1_ORIENTATION_CORE');
  routeValues(buckets, 'boundary', boundaries, 'H2_FIRST_ROUND_CARRY');
  routeValues(buckets, 'exact', exact, precisionDefaultTier);
  routeValues(buckets, 'takeaway', takeaway, 'H2_FIRST_ROUND_CARRY');
  routeObjects(buckets, 'secondary', secondary, 'H3_SUPPORTING_UNDERSTANDING');

  if (handoff) {
    const visibleHandoff = {
      surface: handoff.surface || null,
      locator: handoff.locator || null,
      lookFor: Array.isArray(handoff.lookFor) ? handoff.lookFor : []
    };
    if (present(visibleHandoff.locator) || visibleHandoff.lookFor.length) {
      push(buckets, 'H1_ORIENTATION_CORE', 'handoff', visibleHandoff);
    }
    if (Array.isArray(handoff.sourceOwnerIds) && handoff.sourceOwnerIds.length) {
      push(buckets, 'H5_REPAIR_REFERENCE', 'source_owner_ids', [...handoff.sourceOwnerIds]);
    }
  }

  if (present(closure)) push(buckets, 'H4_ON_DEMAND', 'closure', closure);
  if (present(next)) push(buckets, 'H4_ON_DEMAND', 'next', next);

  return {
    schema: 'kianos.politics.content_hierarchy.resolved.v1',
    tiers: buckets
  };
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
  for (const item of hierarchy.tiers.H2_FIRST_ROUND_CARRY) {
    if (item.kind === 'exact' && item.value?.learning_priority && item.value.learning_priority !== 'FIRST_ROUND_EXACT') {
      throw new Error(`POLITICS_CONTENT_HIERARCHY_NON_FIRST_ROUND_EXACT_IN_H2:${item.value?.id || '<unknown>'}`);
    }
  }
  return true;
}
