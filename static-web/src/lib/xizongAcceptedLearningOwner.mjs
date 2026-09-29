function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_ACCEPTED_LEARNING_${code}${detail ? `:${detail}` : ''}`);
}

export function normalizeBlockToken(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const direct = text.match(/^([A-Za-z]{1,4})0*(\d+)$/);
  if (direct) return `${direct[1].toUpperCase()}${Number(direct[2])}`;
  const tail = text.match(/(?:^|[-_])([A-Za-z]{1,4})0*(\d+)$/);
  if (tail) return `${tail[1].toUpperCase()}${Number(tail[2])}`;
  return text.toUpperCase();
}

function acceptedBlockKey(routeId, defaultKey, logicGroups) {
  if (Object.prototype.hasOwnProperty.call(logicGroups, routeId)) return routeId;
  if (defaultKey && normalizeBlockToken(routeId) === normalizeBlockToken(defaultKey)) return defaultKey;
  const matches = Object.keys(logicGroups).filter((key) => normalizeBlockToken(key) === normalizeBlockToken(routeId));
  if (matches.length === 1) return matches[0];
  fail('BLOCK_KEY_UNRESOLVED', `${routeId}:${defaultKey || ''}`);
}

function synthesizeLogicGroups(rawGroups, routeId, acceptedKey) {
  if (!Array.isArray(rawGroups) || !rawGroups.length) fail('LOGIC_GROUPS_MISSING', `${routeId}:${acceptedKey}`);
  const logic_groups = {};
  const learner_order = [];
  for (const [index, row] of rawGroups.entries()) {
    const groupId = String(row?.id || '').trim();
    if (!groupId || logic_groups[groupId]) fail('LOGIC_GROUP_ID_INVALID', `${routeId}:${index}`);
    const members = Array.isArray(row?.members) ? row.members.map(Number) : [];
    if (!members.length || members.some((value) => !Number.isInteger(value) || value < 1)) {
      fail('LOGIC_MEMBERS_INVALID', `${routeId}:${groupId}`);
    }
    if (new Set(members).size !== members.length) fail('LOGIC_MEMBERS_DUPLICATE', `${routeId}:${groupId}`);
    logic_groups[groupId] = {
      ...row,
      kp_members: members,
      cognitive_job: String(row?.job || row?.cognitive_job || ''),
      visual_required: row?.visual_required === true,
      goal: String(row?.goal || ''),
      closure: String(row?.closure || '')
    };
    learner_order.push(groupId);
  }
  const flattened = learner_order.flatMap((groupId) => logic_groups[groupId].kp_members);
  const unique = new Set(flattened);
  const kp_count = flattened.length ? Math.max(...flattened) : 0;
  if (!kp_count || unique.size !== flattened.length || unique.size !== kp_count) {
    fail('LOGIC_COVERAGE_INVALID', `${routeId}:${unique.size}/${kp_count}`);
  }
  for (let ordinal = 1; ordinal <= kp_count; ordinal += 1) {
    if (!unique.has(ordinal)) fail('LOGIC_COVERAGE_GAP', `${routeId}:KP${ordinal}`);
  }
  return { logic_groups, learner_order, kp_count };
}

function sourceContactFromRealization(realization, logicGroups, routeId, acceptedKey) {
  if (!realization || typeof realization !== 'object') fail('CONTENT_REALIZATION_MISSING', `${routeId}:${acceptedKey}`);
  const mode = String(realization.source_mode || '').trim();
  if (!['WHOLE_BLOCK_SOURCE', 'NATURAL_SOURCE_UNITS', 'INTEGRATION_PRIMARY'].includes(mode)) {
    fail('SOURCE_MODE_INVALID', `${routeId}:${mode || 'missing'}`);
  }
  const groupMap = logicGroups.logic_groups;
  const sourceUnits = (Array.isArray(realization.source_units) ? realization.source_units : []).map((unit, index) => {
    const sourceUnitId = String(unit?.id || '').trim();
    if (!sourceUnitId) fail('SOURCE_UNIT_ID_MISSING', `${routeId}:${index}`);
    const logicGroupIds = Array.isArray(unit?.lg_refs) ? unit.lg_refs.map(String) : [];
    const contributesToLogicGroupIds = Array.isArray(unit?.contributes_to) ? unit.contributes_to.map(String) : [];
    const reactivateLogicGroupIds = Array.isArray(unit?.reactivate_lg_refs) ? unit.reactivate_lg_refs.map(String) : [];
    const postUnitClosureLogicGroupIds = Array.isArray(unit?.post_unit_closure_lg_refs) ? unit.post_unit_closure_lg_refs.map(String) : [];
    const allRefs = [...new Set([
      ...logicGroupIds,
      ...contributesToLogicGroupIds,
      ...reactivateLogicGroupIds,
      ...postUnitClosureLogicGroupIds
    ])];
    for (const groupId of allRefs) {
      if (!groupMap[groupId]) fail('SOURCE_UNIT_LOGIC_GROUP_UNKNOWN', `${routeId}:${sourceUnitId}:${groupId}`);
    }
    const coverageGroups = [...new Set([...logicGroupIds, ...postUnitClosureLogicGroupIds])];
    const kpOrdinals = [...new Set(coverageGroups.flatMap((groupId) => groupMap[groupId]?.kp_members || []))]
      .sort((a, b) => a - b);
    return {
      sourceUnitId,
      label: String(unit?.label || sourceUnitId),
      logicGroupIds,
      contributesToLogicGroupIds,
      kpOrdinals,
      reactivateLogicGroupIds,
      postUnitClosureLogicGroupIds,
      sourceDebt: String(unit?.source_debt || ''),
      sourceVerified: unit?.source_verified === true,
      verifiedSource: String(unit?.verified_source || ''),
      visualDebt: String(unit?.visual_debt || ''),
      visualState: String(unit?.visual_state || ''),
      visualSourceRequired: unit?.visual_source_required === true,
      raw: unit
    };
  });
  if (mode === 'NATURAL_SOURCE_UNITS' && !sourceUnits.length) fail('SOURCE_UNITS_MISSING', routeId);
  if (mode !== 'NATURAL_SOURCE_UNITS' && sourceUnits.length) fail('SOURCE_UNITS_UNEXPECTED', `${routeId}:${mode}`);
  return {
    mode,
    content_pattern: String(realization.content_pattern || ''),
    source_units: sourceUnits,
    hard_readiness: Array.isArray(realization.hard_readiness) ? realization.hard_readiness.map(String) : [],
    required_prior_owners: Array.isArray(realization.required_prior_owners) ? realization.required_prior_owners.map(String) : [],
    targeted_source_returns: Array.isArray(realization.targeted_source_returns) ? realization.targeted_source_returns.map(String) : [],
    boundary: String(realization.boundary || ''),
    rule: String(realization.rule || ''),
    owner_block_key: acceptedKey
  };
}

export function normalizeAcceptedLearningOwner({ learning, routeIds, content = null }) {
  const existing = learning?.blocks && typeof learning.blocks === 'object' && !Array.isArray(learning.blocks)
    ? learning.blocks
    : null;
  if (existing && Object.keys(existing).length) {
    return { owner: learning, schemaFamily: 'BLOCK_MAP', blockKeyMap: Object.fromEntries(routeIds.map((id) => [id, id])) };
  }

  const logicGroups = learning?.logic_groups;
  const defaultRoute = Array.isArray(learning?.system_route?.default_route)
    ? learning.system_route.default_route.map(String)
    : [];
  if (!logicGroups || typeof logicGroups !== 'object' || Array.isArray(logicGroups) || !defaultRoute.length) {
    return { owner: learning, schemaFamily: 'UNRESOLVED', blockKeyMap: {} };
  }
  if (!content?.block_realization || typeof content.block_realization !== 'object') {
    fail('CONTENT_OWNER_REQUIRED', learning?.system_id || 'unknown');
  }
  if (routeIds.length !== defaultRoute.length) {
    fail('ROUTE_COUNT_MISMATCH', `${routeIds.length}/${defaultRoute.length}`);
  }

  const blocks = {};
  const blockKeyMap = {};
  const used = new Set();
  for (let index = 0; index < routeIds.length; index += 1) {
    const routeId = String(routeIds[index]);
    const defaultKey = String(defaultRoute[index]);
    const acceptedKey = acceptedBlockKey(routeId, defaultKey, logicGroups);
    if (used.has(acceptedKey)) fail('BLOCK_KEY_DUPLICATE', acceptedKey);
    used.add(acceptedKey);
    const normalizedGroups = synthesizeLogicGroups(logicGroups[acceptedKey], routeId, acceptedKey);
    const source_contact = sourceContactFromRealization(content.block_realization[acceptedKey], normalizedGroups, routeId, acceptedKey);
    blocks[routeId] = {
      owner_block_key: acceptedKey,
      label: acceptedKey,
      kp_count: normalizedGroups.kp_count,
      logic_groups: normalizedGroups.logic_groups,
      learner_order: normalizedGroups.learner_order,
      source_contact
    };
    blockKeyMap[routeId] = acceptedKey;
  }
  if (used.size !== Object.keys(logicGroups).length) {
    fail('UNROUTED_LOGIC_GROUP_BLOCK', `${used.size}/${Object.keys(logicGroups).length}`);
  }

  return {
    owner: { ...learning, blocks },
    schemaFamily: 'TOP_LEVEL_LOGIC_GROUPS_WITH_CONTENT_REALIZATION',
    blockKeyMap
  };
}
