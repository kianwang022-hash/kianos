export const XIZONG_MEMORY_RELEASE_SCHEMA = 'kianos.xizong.memory_release.v1';
export const XIZONG_LEARNER_OBJECT_SCHEMA = 'kianos.xizong.learner_object.v1';

function text(value) {
  return String(value || '');
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_MEMORY_RELEASE_${code}${detail ? `:${detail}` : ''}`);
}

function htmlEscape(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function attentionSignals(coreCards, recallRatings = {}) {
  return coreCards.flatMap((card) => {
    const rating = text(recallRatings?.[card.kpId]);
    if (!['unknown', 'fuzzy'].includes(rating)) return [];
    return [{ cardId: card.id, reviewRequested: true, reason: `FIRST_PASS_${rating.toUpperCase()}` }];
  });
}

function finalizeDescriptor(meta, coreCards, precisionCards, options = {}) {
  const cardIds = [...coreCards, ...precisionCards].map((card) => card.id);
  if (cardIds.some((id) => !id)) fail('CARD_ID_MISSING', meta.blockId);
  if (new Set(cardIds).size !== cardIds.length) fail('CARD_ID_DUPLICATE', meta.blockId);
  return {
    schema: XIZONG_MEMORY_RELEASE_SCHEMA,
    ...meta,
    coreCards,
    precisionCards,
    attentionSignals: attentionSignals(coreCards, options?.recallRatings || {}),
    promptOverrides: options?.promptOverrides && typeof options.promptOverrides === 'object'
      ? { ...options.promptOverrides }
      : {},
    markedFragments: array(options?.markedFragments).map((row) => ({ ...row }))
  };
}

// ---------------------------------------------------------------------------
// Preferred final integration boundary: consume the already-resolved learner
// object. Memory must not become another Projection / cue resolver.
// ---------------------------------------------------------------------------

function learnerMaps(learnerObject) {
  const kps = new Map();
  for (const kp of array(learnerObject?.kps)) {
    const kpId = text(kp?.identity?.kpId);
    if (!kpId) fail('LEARNER_KP_ID_MISSING', text(learnerObject?.identity?.blockId));
    if (kps.has(kpId)) fail('LEARNER_KP_DUPLICATE', kpId);
    kps.set(kpId, kp);
  }
  const groups = new Map();
  for (const group of array(learnerObject?.logicGroups)) {
    const groupId = text(group?.identity?.logicGroupId);
    if (!groupId) fail('LEARNER_GROUP_ID_MISSING', text(learnerObject?.identity?.blockId));
    if (groups.has(groupId)) fail('LEARNER_GROUP_DUPLICATE', groupId);
    groups.set(groupId, group);
  }
  return { kps, groups };
}

function learnerCoreHtml(kp) {
  return text(kp?.core?.html);
}

function learnerCoreCard(learnerObject, kp) {
  const identity = kp?.identity || {};
  const block = learnerObject?.identity || {};
  const kpId = text(identity.kpId);
  return {
    id: `core:${kpId}`,
    systemId: text(block.systemId),
    canonicalId: text(block.canonicalId),
    blockId: text(block.blockId),
    blockLabel: text(block.blockLabel),
    blockTitle: text(block.title),
    logicGroupId: text(identity.logicGroupId),
    groupLabel: text(identity.groupLabel),
    kpId,
    displayId: text(identity.displayId),
    title: text(identity.title),
    promptCanonical: text(kp?.prompt?.canonical),
    coreHtml: learnerCoreHtml(kp),
    coreMarkdown: text(kp?.core?.markdown),
    semanticRevision: learnerObject.revisionWitness?.kps?.[kpId] || '',
    sourceLocator: text(kp?.source?.locator),
    outlineLocator: text(kp?.outline?.locator)
  };
}

function exactAnswerFromResolvedCue(cue) {
  return text(
    cue?.answerHtml
    || cue?.answer_html
    || cue?.raw?.answerHtml
    || cue?.raw?.answer_html
  );
}

function learnerPrecisionCard(meta, cue, owner) {
  const cueId = text(cue?.id || cue?.cueId);
  if (!cueId) fail('LEARNER_PRECISION_ID_MISSING', meta.blockId);
  const explicitAnswer = exactAnswerFromResolvedCue(cue);
  return {
    id: `precision:${cueId}`,
    systemId: meta.systemId,
    canonicalId: meta.canonicalId,
    blockId: meta.blockId,
    blockLabel: meta.blockLabel,
    blockTitle: meta.blockTitle,
    logicGroupId: text(owner.logicGroupId),
    groupLabel: text(owner.groupLabel),
    kpId: text(owner.kpId),
    displayId: text(owner.displayId),
    title: text(owner.title || cueId),
    cue: text(cue?.cue || cue?.task),
    answerHtml: explicitAnswer,
    ownerContextHtml: text(owner.ownerContextHtml),
    sourceLocator: text(cue?.sourceLocator || cue?.source_locator || cue?.raw?.source_locator),
    answerResolution: explicitAnswer ? 'EXACT_CURRENT_OWNER' : 'OWNER_CONTEXT_ONLY',
    precisionCueId: cueId
  };
}

function learnerGroupContext(group, kps) {
  const groupId = text(group?.identity?.logicGroupId);
  const owned = array(group?.kpIds).map((kpId) => kps.get(kpId));
  if (owned.some((kp) => !kp)) fail('LEARNER_GROUP_KP_UNKNOWN', groupId);
  return owned.map((kp) => {
    const identity = kp?.identity || {};
    const heading = [text(identity.displayId), text(identity.title)].filter(Boolean).join('｜');
    const body = learnerCoreHtml(kp);
    return `<section data-memory-owner-kp="${htmlEscape(identity.kpId)}"><h4>${htmlEscape(heading)}</h4>${body}</section>`;
  }).join('');
}

export function buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject, options = {}) {
  if (learnerObject?.schema !== XIZONG_LEARNER_OBJECT_SCHEMA || learnerObject?.objectType !== 'BLOCK') {
    fail('LEARNER_OBJECT_SCHEMA_INVALID', text(learnerObject?.schema));
  }
  if (!/^[a-f0-9]{64}$/.test(learnerObject.sourceHash || '') || (options.sourceHash && options.sourceHash !== learnerObject.sourceHash)) fail('PREPARED_SOURCE_STALE');
  if (!equal(learnerObject.identity, learnerObject.preparedMemory?.identity)) fail('COMPILED_IDENTITY_MISMATCH');
  if (learnerObject.preparedMemory?.semanticOwner && (learnerObject.semanticOwnership?.mode !== 'CANONICAL_BLOCK'
    || learnerObject.semanticOwnership?.sourcePath !== learnerObject.preparedMemory.semanticOwner)) fail('COMPILED_OWNER_MISMATCH');
  if (learnerObject.revisionWitness?.schema !== 'kianos.xizong.content-revision-witness.v1'
    || learnerObject.revisionWitness.sourceHash !== learnerObject.sourceHash
    || !learnerObject.revisionWitness.kps || !learnerObject.revisionWitness.groups) fail('COMPILED_REVISION_MISSING');
  for (const kp of array(learnerObject.kps)) {
    if (!/^[a-f0-9]{64}$/.test(learnerObject.revisionWitness.kps[kp?.identity?.kpId] || '')) fail('COMPILED_REVISION_INVALID');
  }
  const identity = learnerObject?.identity || {};
  const blockId = text(identity.blockId);
  if (!blockId) fail('BLOCK_ID_MISSING');
  const meta = {
    blockId,
    systemId: text(identity.systemId),
    canonicalId: text(identity.canonicalId),
    blockLabel: text(identity.blockLabel),
    blockTitle: text(identity.title),
    sourceHash: text(options?.sourceHash || learnerObject?.sourceHash),
    revisionWitness: learnerObject.revisionWitness || null
  };

  const { kps, groups } = learnerMaps(learnerObject);
  if (!kps.size) fail('CORE_KP_MISSING', blockId);

  const coreCards = [...kps.values()].map((kp) => learnerCoreCard(learnerObject, kp));
  let precisionCards = [];
  for (const kp of kps.values()) {
    const kpIdentity = kp?.identity || {};
    const owner = {
      logicGroupId: text(kpIdentity.logicGroupId),
      groupLabel: text(kpIdentity.groupLabel),
      kpId: text(kpIdentity.kpId),
      displayId: text(kpIdentity.displayId),
      title: text(kpIdentity.title),
      ownerContextHtml: learnerCoreHtml(kp)
    };
    for (const cue of array(kp?.precision)) precisionCards.push(learnerPrecisionCard(meta, cue, owner));
  }
  for (const group of groups.values()) {
    const groupIdentity = group?.identity || {};
    const owner = {
      logicGroupId: text(groupIdentity.logicGroupId),
      groupLabel: text(groupIdentity.label),
      kpId: '',
      displayId: '',
      title: text(groupIdentity.label),
      ownerContextHtml: learnerGroupContext(group, kps)
    };
    for (const cue of array(group?.precision)) precisionCards.push(learnerPrecisionCard(meta, cue, owner));
  }

  const admitted = learnerObject.preparedMemory;
  if (!admitted || admitted.blockId !== blockId || admitted.sourceHash !== learnerObject.sourceHash
    || !Array.isArray(admitted.items)) fail('COMPILED_ADMISSION_REQUIRED', blockId);
  if (admitted.mode === 'CURRENT_NATIVE') {
    if (learnerObject.semanticOwnership) fail('COMPILED_OWNER_MISMATCH');
    if (new Set(admitted.items.map(row => row.id)).size !== admitted.items.length) fail('PREPARED_ADMISSION_INVALID', blockId);
    precisionCards = admitted.items.map(expected => {
      const cards = precisionCards.filter(card => card.precisionCueId === expected.id);
      if (cards.length !== 1) fail('PREPARED_OWNER_AMBIGUOUS', expected.id);
      const cues = [...[...kps.values()].flatMap(kp => array(kp.precision)), ...[...groups.values()].flatMap(group => array(group.precision))].filter(cue => cue.id === expected.id);
      if (cues.length !== 1 || !equal(cues[0], expected.cue)) fail('PREPARED_OWNER_MISMATCH', expected.id);
      const card = cards[0];
      card.semanticRevision = card.kpId ? learnerObject.revisionWitness.kps[card.kpId] || '' : learnerObject.revisionWitness.groups[card.logicGroupId] || '';
      if (!equal(card, expected.card)) fail('PREPARED_OWNER_MISMATCH', expected.id);
      return card;
    });
    return finalizeDescriptor(meta, coreCards, precisionCards, options);
  }
  const cueRows = [
    ...[...kps.values()].flatMap(kp => array(kp.precision).map(cue => ({ cue, kpId: kp.identity.kpId, logicGroupId: kp.identity.logicGroupId }))),
    ...[...groups.values()].flatMap(group => array(group.precision).map(cue => ({ cue, kpId: '', logicGroupId: group.identity.logicGroupId })))
  ];
  if (new Set(admitted.items.map(row => row.id)).size !== admitted.items.length) fail('PREPARED_ADMISSION_INVALID', blockId);
  const ids = new Set(admitted.items.map(row => row.id));
  for (const { cue } of cueRows) {
    if (!ids.has(cue.id) && exactAnswerFromResolvedCue(cue)) fail('PREPARED_UNADMITTED_ANSWER', cue.id);
  }
  precisionCards = admitted.items.map(expected => {
    const matches = cueRows.filter(row => row.cue.id === expected.id);
    if (matches.length !== 1) fail('PREPARED_OWNER_AMBIGUOUS', expected.id);
    const { cue, kpId, logicGroupId } = matches[0], raw = cue.raw || cue;
    const anchor = expected.anchor;
    if (!equal(cue.anchor, anchor) || !equal(raw.anchor, anchor)
      || (anchor.kp_id ? kpId !== anchor.kp_id : kpId || logicGroupId !== anchor.logic_group_id)
      || anchor.block_id !== blockId || cue.cue !== expected.cue || raw.cue !== expected.cue
      || !equal(raw.prepared_memory_ref, expected.prepared_memory_ref)
      || raw.prepared_memory_owner !== expected.prepared_memory_owner
      || raw.answer_bearing !== true || cue.answerBearing !== true
      || raw.display_policy?.timing !== 'POST_REVEAL' || cue.displayPolicy?.timing !== 'POST_REVEAL'
      || raw.answer_html !== expected.answer_html || !text(expected.answer_html).trim()) fail('PREPARED_OWNER_MISMATCH', expected.id);
    const cards = precisionCards.filter(card => card.precisionCueId === expected.id);
    if (cards.length !== 1 || cards[0].answerHtml !== expected.answer_html
      || cards[0].answerResolution !== 'EXACT_CURRENT_OWNER'
      || !cards[0].answerHtml.includes(`data-prepared-memory="${expected.id}"`)) fail('PREPARED_EXACT_ANSWER_MISSING', expected.id);
    return cards[0];
  });
  for (const card of precisionCards) {
    card.semanticRevision = card.kpId ? learnerObject.revisionWitness?.kps?.[card.kpId] || '' : learnerObject.revisionWitness?.groups?.[card.logicGroupId] || '';
  }
  return finalizeDescriptor(meta, coreCards, precisionCards, options);
}


// These inputs are projections of one compiler-validated object, never a second
// editable answer/admission source. A malformed compiled object cannot fallback.
function equal(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
}
export function supportsXizongPreparedMemoryBlock(learnerObject) {
  const prepared = learnerObject?.preparedMemory;
  return Boolean(prepared?.mode === 'CURRENT_NATIVE' ? prepared.availabilityCardIds?.length : prepared?.items?.length);
}
export function buildXizongPreparedMemoryAvailability(learnerObject, options = {}) {
  if (!supportsXizongPreparedMemoryBlock(learnerObject)) fail('PREPARED_BLOCK_UNSUPPORTED');
  if (options.sourceHash && options.sourceHash !== learnerObject.sourceHash) fail('PREPARED_SOURCE_STALE');
  const descriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject);
  const ids = learnerObject.preparedMemory.mode === 'CURRENT_NATIVE' ? learnerObject.preparedMemory.availabilityCardIds : descriptor.precisionCards.map(card => card.id);
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length
    || ids.some(id => !descriptor.precisionCards.some(card => card.id === id && card.answerResolution === 'EXACT_CURRENT_OWNER'))) fail('PREPARED_ADMISSION_INVALID');
  return { ...descriptor, coreCards: [], precisionCards:descriptor.precisionCards.filter(card => ids.includes(card.id)), attentionSignals: [], promptOverrides: {}, markedFragments: [] };
}
export function isXizongPreparedMemoryCard(card, currentDescriptor) {
  const expected = array(currentDescriptor?.precisionCards).filter(row => row.id === card?.id);
  if (expected.length !== 1) return false;
  const current = expected[0];
  return ['id', 'precisionCueId', 'systemId', 'canonicalId', 'blockId', 'kpId', 'logicGroupId', 'cue', 'answerHtml', 'answerResolution', 'semanticRevision']
    .every(key => card[key] === current[key]);
}
