export const XIZONG_MEMORY_RELEASE_SCHEMA = 'kianos.xizong.memory_release.v1';

function text(value) {
  return String(value || '');
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_MEMORY_RELEASE_${code}${detail ? `:${detail}` : ''}`);
}

function htmlForKp(kp) {
  return text(kp?.detailHtml || kp?.coreHtml);
}

function groupMap(block) {
  return new Map(array(block?.logicGroups).map((group) => [group.groupId, group]));
}

function kpMap(block) {
  return new Map(array(block?.kpRecords).map((kp) => [kp.kpId, kp]));
}

function ownerContextForPrecision(block, cue, kps, groups) {
  const kpId = text(cue?.anchor?.kp_id);
  if (kpId) {
    const kp = kps.get(kpId);
    if (!kp) fail('PRECISION_KP_UNKNOWN', `${text(cue?.id)}:${kpId}`);
    return {
      kpId,
      logicGroupId: text(kp?.groupId),
      displayId: text(kp?.displayId),
      title: text(kp?.title),
      ownerContextHtml: htmlForKp(kp)
    };
  }

  const logicGroupId = text(cue?.anchor?.logic_group_id);
  if (!logicGroupId) fail('PRECISION_OWNER_MISSING', text(cue?.id));
  const group = groups.get(logicGroupId);
  if (!group) fail('PRECISION_GROUP_UNKNOWN', `${text(cue?.id)}:${logicGroupId}`);
  const owned = array(group?.kpIds).map((id) => kps.get(id));
  if (owned.some((kp) => !kp)) fail('PRECISION_GROUP_KP_UNKNOWN', `${text(cue?.id)}:${logicGroupId}`);
  const ownerContextHtml = owned.map((kp) => {
    const heading = [text(kp?.displayId), text(kp?.title)].filter(Boolean).join('｜');
    return `<section data-memory-owner-kp="${text(kp?.kpId)}"><h4>${heading}</h4>${htmlForKp(kp)}</section>`;
  }).join('');
  return {
    kpId: '',
    logicGroupId,
    displayId: '',
    title: text(group?.label),
    ownerContextHtml
  };
}

function coreCard(block, kp) {
  return {
    id: `core:${kp.kpId}`,
    systemId: text(block?.systemId),
    canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
    blockId: text(block?.blockId),
    blockLabel: text(block?.label),
    blockTitle: text(block?.title),
    logicGroupId: text(kp?.groupId),
    groupLabel: text(kp?.groupLabel),
    kpId: text(kp?.kpId),
    displayId: text(kp?.displayId),
    title: text(kp?.title),
    promptCanonical: text(kp?.prompt),
    coreHtml: htmlForKp(kp),
    sourceLocator: text(kp?.sourceLocator),
    outlineLocator: text(kp?.outlineLocator)
  };
}

function precisionCard(block, cue, kps, groups) {
  const owner = ownerContextForPrecision(block, cue, kps, groups);
  const explicitAnswer = text(cue?.answer_html || cue?.answerHtml);
  return {
    id: `precision:${text(cue?.id)}`,
    systemId: text(block?.systemId),
    canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
    blockId: text(block?.blockId),
    blockLabel: text(block?.label),
    blockTitle: text(block?.title),
    logicGroupId: owner.logicGroupId,
    groupLabel: text(groups.get(owner.logicGroupId)?.label),
    kpId: owner.kpId,
    displayId: owner.displayId,
    title: owner.title || text(cue?.id),
    cue: text(cue?.cue || cue?.task || cue?.micro_task),
    answerHtml: explicitAnswer,
    ownerContextHtml: owner.ownerContextHtml,
    sourceLocator: text(cue?.source_locator || cue?.sourceLocator),
    answerResolution: explicitAnswer ? 'EXACT_CURRENT_OWNER' : 'OWNER_CONTEXT_ONLY',
    precisionCueId: text(cue?.id)
  };
}

export function buildXizongBlockMemoryReleaseDescriptor(block, learningCues = null, options = {}) {
  const blockId = text(block?.blockId);
  if (!blockId) fail('BLOCK_ID_MISSING');
  const kps = kpMap(block);
  const groups = groupMap(block);
  if (!kps.size) fail('CORE_KP_MISSING', blockId);
  const coreCards = [...kps.values()].map((kp) => coreCard(block, kp));
  const precisionRows = array(learningCues?.precision);
  const precisionCards = precisionRows.map((cue) => {
    if (cue?.anchor?.block_id && cue.anchor.block_id !== blockId) fail('PRECISION_BLOCK_MISMATCH', text(cue?.id));
    return precisionCard(block, cue, kps, groups);
  });
  const cardIds = [...coreCards, ...precisionCards].map((card) => card.id);
  if (new Set(cardIds).size !== cardIds.length) fail('CARD_ID_DUPLICATE', blockId);

  const recallRatings = options?.recallRatings && typeof options.recallRatings === 'object' ? options.recallRatings : {};
  const attentionSignals = coreCards.flatMap((card) => {
    const rating = text(recallRatings[card.kpId]);
    if (!['unknown', 'fuzzy'].includes(rating)) return [];
    return [{ cardId: card.id, reviewRequested: true, reason: `FIRST_PASS_${rating.toUpperCase()}` }];
  });

  return {
    schema: XIZONG_MEMORY_RELEASE_SCHEMA,
    blockId,
    systemId: text(block?.systemId),
    canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
    blockLabel: text(block?.label),
    blockTitle: text(block?.title),
    sourceHash: text(block?.sourceHash),
    coreCards,
    precisionCards,
    attentionSignals
  };
}
