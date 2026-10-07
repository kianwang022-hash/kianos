import * as compiledMemory from './xizongCompiledMemoryRelease.mjs';
import nativePreparedCues from '../../../content/xizong/knowledge/learner/a2-respiratory-learning-cues.json' with { type: 'json' };
import urinaryPreparedCues from '../../../content/xizong/knowledge/learner/a3-urinary-learning-cues.json' with { type: 'json' };
import digestivePreparedCues from '../../../content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json' with { type: 'json' };
import preparedCues from '../../../content/xizong/knowledge/learner/a1-circulation-learning-cues.json' with { type: 'json' };

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
  if (learnerObject?.semanticOwnership) return compiledMemory.buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject, options);
  if (learnerObject?.schema !== XIZONG_LEARNER_OBJECT_SCHEMA || learnerObject?.objectType !== 'BLOCK') {
    fail('LEARNER_OBJECT_SCHEMA_INVALID', text(learnerObject?.schema));
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
  assertNativePreparedIdentity(meta);
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

  if (isNativePreparedSystem(meta)) {
    const rows = [
      ...[...kps.values()].flatMap(kp => array(kp.precision).map(cue => ({ cue, kpId: kp.identity.kpId, logicGroupId: kp.identity.logicGroupId }))),
      ...[...groups.values()].flatMap(group => array(group.precision).map(cue => ({ cue, kpId: '', logicGroupId: group.identity.logicGroupId, kpIds: group.kpIds })))
    ];
    precisionCards = selectNativePreparedCards(meta, rows, precisionCards);
  }
  for (const card of precisionCards) {
    card.semanticRevision = card.kpId ? learnerObject.revisionWitness?.kps?.[card.kpId] || '' : learnerObject.revisionWitness?.groups?.[card.logicGroupId] || '';
  }
  return finalizeDescriptor(meta, coreCards, precisionCards, options);
}

// The selective index remains the only admission owner. Exact answer / aid
// freshness is checked by resolvePreparedMemoryCue before the learner object is
// built; this consumer additionally rejects stale references or ambiguous owners.
// Only the reviewed A1/A2/A3/B slices may use explicit card-only availability.
// The IDs, owners and witnesses remain in the existing index, never a second list.
// Strict structural equality survives JSON serialization without discarding
// nested member/Core witnesses. Object key order is irrelevant; arrays are ordered.
function strictPreparedReferenceEqual(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  if (Array.isArray(left)) return left.length === right.length
    && left.every((value, i) => strictPreparedReferenceEqual(value, right[i]));
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key)
    && strictPreparedReferenceEqual(left[key], right[key]));
}

const nativeBBlock = blockId => /^(?:D(?:[1-9]|1[0-9]|2[0-3])|M(?:[1-9]|10)|G[1-5])$/.test(blockId);
function nativePreparedIndex(blockId) {
  if (nativeBBlock(blockId)) return digestivePreparedCues;
  if (/^respiratory-r(?:0[1-9]|1[0-2])$/.test(blockId)) return nativePreparedCues;
  if (/^urinary-b(?:0[1-9]|1[0-4])$/.test(blockId)) return urinaryPreparedCues;
  return null;
}
const isNativePreparedSystem = meta => (meta?.systemId === 'respiratory' && meta?.canonicalId === 'A2'
  && /^respiratory-r(?:0[1-9]|1[0-2])$/.test(meta?.blockId))
  || (meta?.systemId === 'urinary' && meta?.canonicalId === 'A3'
    && /^urinary-b(?:0[1-9]|1[0-4])$/.test(meta?.blockId))
  || (meta?.systemId === 'digestive-metabolic-endocrine-tumor' && meta?.canonicalId === 'B'
    && nativeBBlock(meta?.blockId));
function assertNativePreparedIdentity(meta) {
  const claimed = ['respiratory', 'urinary', 'digestive-metabolic-endocrine-tumor'].includes(meta?.systemId) || ['A2', 'A3', 'B'].includes(meta?.canonicalId)
    || /^(?:respiratory|urinary)-/.test(meta?.blockId) || /^[DMG]\d+$/i.test(meta?.blockId);
  if (claimed && !isNativePreparedSystem(meta)) fail('PREPARED_OWNER_MISMATCH', meta?.blockId);
}
const hasPreparedRef = row => Object.hasOwn(row || {}, 'prepared_memory_ref');
const objectShape = (value, keys) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
function nativeAdmissionRows(blockId) {
  const index = nativePreparedIndex(blockId);
  if (!index) return [];
  const urinary = index === urinaryPreparedCues, digestive = index === digestivePreparedCues;
  if (index.status !== 'CURRENT' || !index.authority?.startsWith('CHAT_APPROVED')
    || index.system_id !== (digestive ? 'digestive-metabolic-endocrine-tumor' : urinary ? 'urinary' : 'respiratory')
    || index.canonical_id !== (digestive ? 'B' : urinary ? 'A3' : 'A2')) fail('PREPARED_INDEX_UNREVIEWED', blockId);
  const rows = array(index.precision_index).filter(row => row.anchor?.block_id === blockId);
  if (new Set(rows.map(row => row.id)).size !== rows.length) fail('PREPARED_ADMISSION_INVALID', blockId);
  const admitted = rows.filter(hasPreparedRef);
  for (const row of admitted) {
    const ref = row.prepared_memory_ref;
    if (!row.id || !objectShape(ref, ['collection', 'owner_mode', 'precision_id', 'item_sha256', 'owner_kp_ids', 'owner_sha256', 'core_refs'])
      || ref.owner_mode !== 'NATIVE_CUE' || ref.collection !== 'precision_fields' || ref.precision_id !== row.id
      || !/^[a-f0-9]{64}$/.test(ref.item_sha256) || !/^[a-f0-9]{64}$/.test(ref.owner_sha256)
      || !Array.isArray(ref.owner_kp_ids) || !ref.owner_kp_ids.length || ref.owner_kp_ids.some(id => !text(id))
      || new Set(ref.owner_kp_ids).size !== ref.owner_kp_ids.length || !Array.isArray(ref.core_refs) || !ref.core_refs.length
      || ref.core_refs.some(w => !objectShape(w, ['system_id', 'block_id', 'kp_id', 'source_path', 'kp_core_sha256'])
        || !/^[a-f0-9]{64}$/.test(w.kp_core_sha256))
      || !(objectShape(row.anchor, ['block_id', 'kp_id']) || objectShape(row.anchor, ['block_id', 'logic_group_id']))) fail('PREPARED_ADMISSION_INVALID', row.id);
  }
  return admitted;
}

// Selected prepared views intersect the current admission owner with stored
// actual ownership. Historical owner-context cards remain in general history.
export function isXizongPreparedMemoryCard(card, blockId) {
  const index = /^circulation-b(?:0[1-9]|1[0-2])$/.test(blockId) ? preparedCues : nativePreparedIndex(blockId);
  if (!index) return false;
  const rows = index === preparedCues
    ? array(index.precision_index).filter(row => row.anchor?.block_id === blockId && row.prepared_memory_ref)
    : nativeAdmissionRows(blockId);
  const row = rows.find(row => card?.id === `precision:${row.id}` && card.precisionCueId === row.id);
  if (!row || card.blockId !== blockId || card.systemId !== index.system_id || card.canonicalId !== index.canonical_id
    || card.answerResolution !== 'EXACT_CURRENT_OWNER' || !text(card.answerHtml).trim()) return false;
  return row.anchor.kp_id ? card.kpId === row.anchor.kp_id
    : !card.kpId && card.logicGroupId === row.anchor.logic_group_id;
}

function selectNativePreparedCards(meta, rows, cards) {
  const admitted = nativeAdmissionRows(meta.blockId);
  const ids = new Set(admitted.map(row => row.id));
  for (const { cue } of rows) {
    if (!ids.has(cue.id) && (hasPreparedRef(cue.raw || cue) || exactAnswerFromResolvedCue(cue))) fail('PREPARED_UNADMITTED_ANSWER', cue.id);
  }
  return admitted.map(expected => {
    const matches = rows.filter(row => row.cue.id === expected.id);
    if (matches.length !== 1) fail('PREPARED_OWNER_AMBIGUOUS', expected.id);
    const { cue, kpId, logicGroupId, kpIds } = matches[0];
    const raw = cue.raw || cue;
    if (!strictPreparedReferenceEqual(raw.prepared_memory_ref, expected.prepared_memory_ref)) fail('PREPARED_REFERENCE_STALE', expected.id);
    if (!strictPreparedReferenceEqual(cue.anchor, expected.anchor) || !strictPreparedReferenceEqual(raw.anchor, expected.anchor)
      || raw.prepared_memory_owner !== 'content/xizong/knowledge/learner/shared-fields.json'
      || raw.answer_bearing !== true || raw.display_policy?.timing !== 'POST_REVEAL'
      || cue.cue !== expected.cue || raw.cue !== expected.cue
      || (expected.anchor.kp_id ? kpId !== expected.anchor.kp_id
        : Boolean(kpId) || logicGroupId !== expected.anchor.logic_group_id || !strictPreparedReferenceEqual(kpIds, expected.prepared_memory_ref.owner_kp_ids))) fail('PREPARED_OWNER_MISMATCH', expected.id);
    const matchesCards = cards.filter(card => card.precisionCueId === expected.id), card = matchesCards[0];
    if (matchesCards.length !== 1 || !isXizongPreparedMemoryCard(card, meta.blockId)
      || card.answerHtml !== raw.answer_html || card.cue !== expected.cue
      || !card.answerHtml.includes(`data-prepared-memory="${expected.id}"`)
      || !card.answerHtml.replace(/<[^>]*>/g, '').trim()) fail('PREPARED_EXACT_ANSWER_MISSING', expected.id);
    return card;
  });
}

export function supportsXizongPreparedMemoryBlock(blockId) {
  return /^circulation-b(?:0[1-9]|1[0-2])$/.test(blockId) || nativeAdmissionRows(blockId).length > 0;
}

export function buildXizongPreparedMemoryAvailability(learnerObject, options = {}) {
  if (learnerObject?.semanticOwnership) return compiledMemory.buildXizongPreparedMemoryAvailability(learnerObject, options);
  const blockId = text(learnerObject?.identity?.blockId);
  assertNativePreparedIdentity(learnerObject?.identity);
  const native = isNativePreparedSystem(learnerObject?.identity);
  if ((!native && (learnerObject?.identity?.systemId !== 'circulation' || learnerObject?.identity?.canonicalId !== 'A1'))
    || !supportsXizongPreparedMemoryBlock(blockId)) fail('PREPARED_BLOCK_UNSUPPORTED');
  if (!learnerObject?.sourceHash || (options.sourceHash && options.sourceHash !== learnerObject.sourceHash)) {
    fail('PREPARED_SOURCE_STALE', blockId);
  }
  if (native) {
    const descriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject);
    return { ...descriptor, coreCards: [], attentionSignals: [], promptOverrides: {}, markedFragments: [] };
  }
  if (preparedCues.status !== 'CURRENT' || !preparedCues.authority?.startsWith('CHAT_APPROVED')) {
    fail('PREPARED_INDEX_UNREVIEWED', blockId);
  }
  const admitted = preparedCues.precision_index.filter(row => row.anchor?.block_id === blockId);
  if (!admitted.length || admitted.some(row => !row.id || !row.prepared_memory_ref)
    || new Set(admitted.map(row => row.id)).size !== admitted.length) {
    fail('PREPARED_ADMISSION_INVALID', blockId);
  }
  const descriptor = buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject);
  const rows = array(learnerObject.kps).flatMap(kp => array(kp.precision).map(cue => ({ kp, cue })));
  const precisionCards = admitted.map(expected => {
    const matches = rows.filter(row => row.cue.id === expected.id);
    if (matches.length !== 1) fail('PREPARED_OWNER_AMBIGUOUS', expected.id);
    const { kp, cue } = matches[0];
    const raw = cue.raw || {};
    const ref = raw.prepared_memory_ref;
    const expectedRef = expected.prepared_memory_ref;
    if (!expectedRef || !ref || !strictPreparedReferenceEqual(ref, expectedRef)) {
      fail('PREPARED_REFERENCE_STALE', expected.id);
    }
    if (kp.identity.kpId !== expected.anchor.kp_id
      || cue.anchor?.kp_id !== expected.anchor.kp_id || cue.anchor?.block_id !== blockId
      || raw.anchor?.kp_id !== expected.anchor.kp_id || raw.anchor?.block_id !== blockId
      || raw.prepared_memory_owner !== 'content/xizong/knowledge/learner/shared-fields.json') {
      fail('PREPARED_OWNER_MISMATCH', expected.id);
    }
    const cards = descriptor.precisionCards.filter(card => card.precisionCueId === expected.id);
    const card = cards[0];
    if (cards.length !== 1 || card.kpId !== expected.anchor.kp_id
      || card.answerResolution !== 'EXACT_CURRENT_OWNER' || !card.answerHtml.trim()
      || card.answerHtml !== raw.answer_html || card.cue !== expected.cue
      || !card.answerHtml.includes(`data-prepared-memory="${expected.id}"`)
      || !card.answerHtml.replace(/<[^>]*>/g, '').trim()) {
      fail('PREPARED_EXACT_ANSWER_MISSING', expected.id);
    }
    return card;
  });
  // No Core, first-pass signals, ratings or private annotations enter this path.
  return { ...descriptor, coreCards: [], precisionCards, attentionSignals: [], promptOverrides: {}, markedFragments: [] };
}

// ---------------------------------------------------------------------------
// Transitional compatibility builder. This keeps Phase 1 usable before the
// Asset Closure PR lands, but final Block Complete integration should call the
// learner-object entrypoint above rather than resolve cue ownership again.
// ---------------------------------------------------------------------------

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
    return `<section data-memory-owner-kp="${htmlEscape(kp?.kpId)}"><h4>${htmlEscape(heading)}</h4>${htmlForKp(kp)}</section>`;
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
    coreMarkdown: text(kp?.detailMarkdown),
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
  let precisionCards = precisionRows.map((cue) => {
    if (cue?.anchor?.block_id && cue.anchor.block_id !== blockId) fail('PRECISION_BLOCK_MISMATCH', text(cue?.id));
    return precisionCard(block, cue, kps, groups);
  });
  const meta = {
    blockId,
    systemId: text(block?.systemId),
    canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
    blockLabel: text(block?.label),
    blockTitle: text(block?.title),
    sourceHash: text(block?.sourceHash)
  };
  assertNativePreparedIdentity(meta);
  if (isNativePreparedSystem(meta)) {
    const rows = precisionRows.map(cue => ({ cue, kpId: text(cue.anchor?.kp_id),
      logicGroupId: text(cue.anchor?.logic_group_id), kpIds: groups.get(cue.anchor?.logic_group_id)?.kpIds }));
    precisionCards = selectNativePreparedCards(meta, rows, precisionCards);
  }
  return finalizeDescriptor(meta, coreCards, precisionCards, options);
}

