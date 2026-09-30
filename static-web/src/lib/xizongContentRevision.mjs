// Evidence reconciliation inside the existing Block state, never a second store.
const clone = value => JSON.parse(JSON.stringify(value));
const ids = value => Array.isArray(value) ? value : [];
export function revisionText(value) {
  // Only known Markdown presentation syntax. Keep numbers, punctuation, math,
  // table cells, image targets and all ordinary text; no semantic paraphrasing.
  return String(value || '').replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/\*\*([^*\n]+)\*\*/g, '$1').trim())
    .filter(Boolean).join('\n');
}
export function revisionStable(value) {
  if (Array.isArray(value)) return value.map(revisionStable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, revisionStable(value[k])]));
  return typeof value === 'string' ? revisionText(value) : value;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function studyHasEvidence(s = {}) {
  return s.completed === true || s.blockRecallDone === true || s.sourceContactDone === true
    || Object.values(s.learned || {}).some(Boolean) || Object.keys(s.ratings || {}).length > 0
    || ids(s.sourceContactEvidence).length > 0 || Object.keys(s.ttsxEvidence || {}).length > 0;
}
export function reconcileXizongRevision(input = {}, current) {
  if (!current?.kpOrder) return clone(input);
  const state = clone(input || {}), previous = state.contentRevision?.witness;
  if (previous && same(previous, current)) return state;
  const oldHash = String(state.sourceHash || ids(state.sourceContactEvidence).findLast(e => e?.source_hash)?.source_hash || '');
  const progress = studyHasEvidence(state);
  const baselineKnown = previous?.schema === current.schema;
  // Legacy whole-file hashes do not bind all resolved support owners. Never
  // retrospectively certify their ratings with a newly created witness.
  const old = state.contentRevision || {};
  const pendingKp = { ...(old.pendingKp || {}) }, pendingGroup = { ...(old.pendingGroup || {}) };
  const unknown = progress && !baselineKnown;
  for (const id of current.kpOrder) {
    if (unknown) pendingKp[id] = 'UNCLASSIFIED_REVISION';
    else if (progress && baselineKnown && previous.kps[id] !== current.kps[id]) pendingKp[id] = previous.kps[id] ? 'LOCAL_SEMANTIC_CHANGE' : 'TOPOLOGY_CHANGE';
  }
  for (const id of current.groupOrder) {
    if (unknown) pendingGroup[id] = 'UNCLASSIFIED_REVISION';
    else if (progress && baselineKnown && (previous.groups[id] !== current.groups[id] || !same(previous.members[id], current.members[id]))) pendingGroup[id] = previous.groups[id] ? 'LOCAL_SEMANTIC_CHANGE' : 'TOPOLOGY_CHANGE';
  }
  const topology = baselineKnown && (!same(previous.kpOrder, current.kpOrder) || !same(previous.members, current.members) || !same(previous.groupOrder, current.groupOrder) || !same(previous.segmentOrder, current.segmentOrder));
  if (baselineKnown && topology) {
    const oldKpId = state.resumeKpId || previous.kpOrder[state.kpIndex || 0];
    const oldGroupId = state.resumeGroupId || previous.groupOrder[state.groupIndex || 0];
    const nearest = current.kpOrder.includes(oldKpId) ? oldKpId : previous.kpOrder.slice(0, (state.kpIndex || 0) + 1).reverse().find(id => current.kpOrder.includes(id));
    state.kpIndex = Math.max(0, nearest ? current.kpOrder.indexOf(nearest) : Math.min(state.kpIndex || 0, current.kpOrder.length - 1));
    const group = current.groupOrder.find(id => current.members[id].includes(current.kpOrder[state.kpIndex]));
    state.groupIndex = Math.max(0, current.groupOrder.indexOf(group || oldGroupId));
    const segmentId = state.resumeSourceSegmentId || previous.segmentOrder?.[state.sourceSegmentIndex || 0];
    if (segmentId && current.segmentOrder?.includes(segmentId)) state.sourceSegmentIndex = current.segmentOrder.indexOf(segmentId);
    else state.sourceSegmentIndex = Math.max(0, Math.min(state.sourceSegmentIndex || 0, (current.segmentOrder?.length || 1) - 1));
  }
  const changed = current.kpOrder.filter(id => pendingKp[id]);
  const changedGroups = current.groupOrder.filter(id => pendingGroup[id]);
  const blockChanged = progress && baselineKnown && previous.block !== current.block;
  const sourceChanged = progress && baselineKnown && previous.contact !== current.contact;
  const transition = { from: previous?.sourceHash || oldHash || null, to: current.sourceHash,
    classification: unknown ? 'UNCLASSIFIED_REVISION' : topology ? 'TOPOLOGY_CHANGE' : changed.length || changedGroups.length || blockChanged || sourceChanged ? 'LOCAL_SEMANTIC_CHANGE' : 'RETRIEVAL_OR_PRESENTATION_ONLY',
    impactedKpIds: changed, impactedGroupIds: changedGroups };
  state.contentRevision = { ...old, witness: current, pendingKp, pendingGroup,
    // Without the old topology, an index is not proof of a historical KP ID.
    // Keep the original position verbatim; the visible current index is only
    // a continuation fallback, never a claim of recovered stable identity.
    legacyResume: old.legacyResume || (unknown && !state.resumeKpId ? {
      identityStatus:'UNKNOWN', sourceHash:oldHash || null, stage:state.stage || null,
      kpIndex:state.kpIndex ?? null, groupIndex:state.groupIndex ?? null,
      sourceSegmentIndex:state.sourceSegmentIndex ?? null
    } : null),
    blockPending: old.blockPending || blockChanged || unknown,
    blockReason: blockChanged ? 'LOCAL_SEMANTIC_CHANGE' : old.blockReason || (unknown ? 'UNCLASSIFIED_REVISION' : null),
    contactPending: old.contactPending || sourceChanged || unknown,
    contactReason: sourceChanged ? 'LOCAL_SEMANTIC_CHANGE' : old.contactReason || (unknown ? 'UNCLASSIFIED_REVISION' : null),
    history: [...ids(old.history), ...(progress && (previous || oldHash !== current.sourceHash) ? [transition] : [])],
    // Original evidence/sourceHash stays untouched. Compatibility is witnessed,
    // not achieved by stamping old ratings/contact with the new artifact hash.
    incompatibleContactHashes: [...new Set([...ids(old.incompatibleContactHashes), ...(sourceChanged ? [previous.sourceHash, ...ids(old.compatibleSourceHashes)] : [])].filter(Boolean))],
    compatibleSourceHashes: sourceChanged || unknown ? [] : [...new Set([...ids(old.compatibleSourceHashes), ...[...(baselineKnown ? [previous.sourceHash] : []), current.sourceHash].filter(Boolean)])],
    classification: transition.classification };
  if (!progress) state.sourceHash = current.sourceHash;
  state.resumeSourceSegmentId = current.segmentOrder?.[state.sourceSegmentIndex || 0] || null;
  state.resumeKpId = current.kpOrder[state.kpIndex || 0] || null;
  state.resumeGroupId = current.groupOrder[state.groupIndex || 0] || null;
  return state;
}
export function revisionStatus(state = {}, currentSourceHash = '', witness = null) {
  const s = witness ? reconcileXizongRevision(state, witness) : (state || {});
  const revision = s.contentRevision;
  const current = String(currentSourceHash || witness?.sourceHash || '');
  const bound = String(s.sourceHash || ids(s.sourceContactEvidence).findLast(e => e?.source_hash)?.source_hash || '');
  if (!studyHasEvidence(s)) return { status: 'NO_PROGRESS', blocked: false, current_source_hash: current, evidence_source_hash: bound || null, impacted_kp_ids: [], impacted_group_ids: [] };
  const valid = revision?.witness?.sourceHash === current;
  const impacted = valid ? revision.witness.kpOrder.filter(id => revision.pendingKp?.[id]) : [];
  const groups = valid ? revision.witness.groupOrder.filter(id => revision.pendingGroup?.[id]) : [];
  const blocked = valid ? impacted.length > 0 || groups.length > 0 || revision.blockPending === true || revision.contactPending === true : s.sourceRevisionPending === true || !bound || bound !== current;
  const unknown = !valid || [...impacted.map(id => revision.pendingKp[id]), ...groups.map(id => revision.pendingGroup[id]), revision.blockPending && revision.blockReason, revision.contactPending && revision.contactReason].includes('UNCLASSIFIED_REVISION');
  return { status: blocked ? (unknown ? 'UNCLASSIFIED_REVISION' : 'REVALIDATION_REQUIRED') : 'CURRENT', blocked,
    current_source_hash: current, evidence_source_hash: bound || null, impacted_kp_ids: impacted, impacted_group_ids: groups,
    block_review_required: valid && revision.blockPending === true, contact_review_required: valid && revision.contactPending === true,
    baseline_known: !unknown,
    legacy_resume: valid ? revision.legacyResume || null : null,
    historical_evidence_preserved: true, current_claim: blocked ? (unknown ? 'UNKNOWN' : 'REVALIDATION_REQUIRED') : 'SUPPORTED' };
}
export function currentKpClaim(state, id) { return !state?.contentRevision?.pendingKp?.[id]; }
export function needsFreshKpRecall(state, id) { return Boolean(state?.contentRevision?.pendingKp?.[id]) && state.contentRevision.pendingKp[id] !== 'UNCLASSIFIED_REVISION'; }
export function currentGroupClaim(state, id) { return !state?.contentRevision?.pendingGroup?.[id]; }
export function sourceContactCompatible(state, evidence, currentHash) {
  const r = state?.contentRevision;
  const hash = String(typeof evidence === 'object' ? evidence?.source_hash || '' : evidence || '');
  if (evidence?.contact_witness && r?.witness?.sourceHash === currentHash) return evidence.contact_witness === r.witness.contact;
  // A Learning/support owner can change without changing the Block artifact.
  // Retain old observations, but require a fresh contact witness for those hashes.
  if (ids(r?.incompatibleContactHashes).includes(hash)) return false;
  if (r?.contactPending && r.contactReason !== 'UNCLASSIFIED_REVISION') return false;
  if (hash && hash === String(currentHash || '')) return true;
  if (r?.contactReason === 'UNCLASSIFIED_REVISION' && hash && (hash === state.sourceHash || ids(r.history).some(row => row.from === hash))) return true;
  return r?.witness?.sourceHash === currentHash && !r.contactPending && ids(r.compatibleSourceHashes).includes(hash);
}
export function revalidateXizongUnit(state, kind, id, at = new Date().toISOString()) {
  const r = state.contentRevision;
  if (!r) return;
  const priorUnit = ids(r.revalidations).findLast(row => row.kind === kind && row.id === id);
  r.revalidations = [...ids(r.revalidations), { kind, id, at, sourceHash: r.witness.sourceHash }];
  if (kind === 'KP') {
    r.priorRatings = [...ids(r.priorRatings), { kpId:id, rating:state.ratings?.[id] || null, sourceHash:priorUnit?.sourceHash || state.sourceHash || null, priorClaim:r.pendingKp[id] || null, replacedAt:at }];
    delete r.pendingKp[id];
  }
  if (kind === 'GROUP') delete r.pendingGroup[id];
  if (kind === 'BLOCK') r.blockPending = false;
  if (kind === 'CONTACT') {
    r.contactPending = false;
    r.compatibleSourceHashes = [...new Set([...ids(r.compatibleSourceHashes), r.witness.sourceHash])];
  }
}

// Used by Return/checkpoint only for a proven compatible artifact transition.
// Structural/semantic changes are not transaction-compatible even if a subset
// of claims survives; callers retain their normal stale/replay checks.
export function compatibleRevisionWitnesses(before, after) {
  if (!before?.schema || before.schema !== after?.schema) return false;
  const { sourceHash: a, ...left } = before;
  const { sourceHash: b, ...right } = after;
  return same(left, right);
}

// UNKNOWN limits a mastery/current-semantic inference, not the learner's right
// to continue from observed completion. Only proven changes schedule new work.
export function revisionRequiresAction(state) {
  const r = state?.contentRevision;
  if (!r) return false;
  const known = value => Boolean(value) && value !== 'UNCLASSIFIED_REVISION';
  return r.witness.kpOrder.some(id => known(r.pendingKp?.[id]))
    || r.witness.groupOrder.some(id => known(r.pendingGroup?.[id]))
    || (r.blockPending && known(r.blockReason)) || (r.contactPending && known(r.contactReason));
}

// Shared Source coverage predicate for the Website and completion consumers.
// Source units remain independent of LG order and may have non-contiguous KPs.
export function xizongSourceContactCovered(state, { sourceHash = '', sourceContact = {}, kps = [], logicGroups = [] } = {}) {
  if (!sourceHash) return false;
  // Whole-LG producers historically left this flag false; actual member
  // contact records, not that cumulative-only flag, own their coverage.
  if (state.sourceContactDone === false && sourceContact.logicGroupIsAutomaticSourceChunk !== true) return false;
  const rows = kps.map(kp => ({ id: String(kp.kpId || kp.identity?.kpId || ''), ordinal: Number(kp.ordinal ?? kp.identity?.ordinal) }));
  if (!rows.length || rows.some(row => !row.id)) return false;
  const evidence = ids(state.sourceContactEvidence).filter(entry => sourceContactCompatible(state, entry, sourceHash));
  const covers = (entries, kpIds) => {
    const covered = new Set(entries.flatMap(entry => ids(entry.kp_ids).map(String)));
    return kpIds.every(id => covered.has(id));
  };
  const allLearned = rows.every(row => state.learned?.[row.id] === true);
  const segments = ids(sourceContact.segments);
  const segmentDone = (segment, selectedEvidence = evidence) => {
    const expectedIds = ids(segment.kpIds).length ? segment.kpIds.map(String)
      : ids(segment.kpOrdinals).map(ordinal => rows.find(row => row.ordinal === Number(ordinal))?.id);
    if (!segment.segmentId || expectedIds.some(id => !id)) return false;
    const entries = selectedEvidence.filter(entry => entry.segment_id === segment.segmentId);
    if (!entries.length || !covers(entries, expectedIds)) return false;
    const requiredVisuals = ids(segment.visualDebt).map(String).filter(id => logicGroups.some(group =>
      String(group.groupId || group.identity?.logicGroupId || '') === id && group.visualRequired === true
      && /GAP.*NOT_MOUNTED/i.test(String(group.visualSourceState || ''))));
    const reviewed = new Set(entries.flatMap(entry => ids(entry.visual_reviewed_lg_ids).map(String)));
    return requiredVisuals.every(id => reviewed.has(id));
  };
  const mode = String(sourceContact.mode || 'NATURAL_SOURCE_UNIT');
  if (mode === 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT') {
    return state.sourceContactDone === true && allLearned && segments.length > 0 && segments.every(segment => {
      const entries = evidence.filter(entry => entry.segment_id === segment.segmentId
        && entry.coverage_kind === 'GLOBAL_BIOCHEMISTRY_SOURCE_UNIT'
        && entry.source_unit_id === segment.sourceUnitId
        && entry.lane_source_hash === sourceContact.sourceLaneHash);
      return entries.length > 0 && segmentDone({ ...segment, visualDebt: [] }, entries);
    });
  }
  if (mode === 'INTEGRATION_PRIMARY') {
    const targeted = sourceContact.integrationTargetedSourceReturns === true;
    const kind = targeted ? 'INTEGRATION_PRIMARY_DIRECT_RELEASE' : 'INTEGRATION_PRIMARY_NO_NEW_CONTINUOUS_SOURCE';
    const directGroupIds = targeted ? ids(sourceContact.integrationReleaseLogicGroupIds).map(String)
      : logicGroups.map(group => String(group.groupId || group.identity?.logicGroupId || ''));
    const directIds = logicGroups.filter(group => directGroupIds.includes(String(group.groupId || group.identity?.logicGroupId || '')))
      .flatMap(group => ids(group.kpIds).map(String));
    return state.sourceContactDone === true && allLearned
      && evidence.some(entry => entry.coverage_kind === kind)
      && covers(evidence.filter(entry => entry.coverage_kind === kind), directIds)
      && (!targeted || (segments.length > 0 && segments.every(segment => segmentDone(segment))));
  }
  if (mode === 'NATURAL_SOURCE_UNITS') return state.sourceContactDone === true && allLearned && segments.length > 0 && segments.every(segment => segmentDone(segment));
  if (sourceContact.logicGroupIsAutomaticSourceChunk === true) return covers(evidence, rows.map(row => row.id));
  return state.sourceContactDone === true
    && covers(evidence.filter(entry => entry.coverage_kind === 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION'), rows.map(row => row.id));
}

// A missing semantic/contact baseline limits Current claims, not lawful
// continuation from an observed complete first pass. No flags/evidence are made.
export function historicalXizongSourceContinuation(state) {
  const r = state?.contentRevision;
  return r?.contactPending === true && r.contactReason === 'UNCLASSIFIED_REVISION'
    && !revisionRequiresAction(state) && state.completed === true && state.blockRecallDone === true
    && r.witness.kpOrder.length > 0 && r.witness.kpOrder.every(id => state.learned?.[id] === true
      && ['unknown','fuzzy','known','mastered'].includes(state.ratings?.[id]));
}
