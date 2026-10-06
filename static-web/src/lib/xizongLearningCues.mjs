import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadXizongBlock } from './xizong.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNER_ROOT = 'content/xizong/knowledge/learner';
const BUILD_CACHE_ENABLED = process.env.KIANOS_XIZONG_BUILD_CACHE === '1';
const learningCuesCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function loadXizongLearningCues(system) {
  const canonicalId = String(system?.canonicalId || '').toLowerCase();
  const systemId = String(system?.systemId || '');
  if (!canonicalId || !systemId) return null;
  const cacheKey = `${canonicalId}:${systemId}`;
  if (BUILD_CACHE_ENABLED && learningCuesCache.has(cacheKey)) return learningCuesCache.get(cacheKey);

  const sourcePath = `${LEARNER_ROOT}/${canonicalId}-${systemId}-learning-cues.json`;
  if (!fs.existsSync(absolute(sourcePath))) {
    if (BUILD_CACHE_ENABLED) learningCuesCache.set(cacheKey, null);
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(absolute(sourcePath), 'utf8'));
  if (raw?.status !== 'CURRENT' || !String(raw?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_LEARNING_CUES_INVALID:${systemId}`);
  }
  if (raw?.system_id !== systemId || raw?.canonical_id !== system?.canonicalId) {
    throw new Error(`CURRENT_XIZONG_LEARNING_CUES_IDENTITY_MISMATCH:${systemId}`);
  }

  const blockIds = new Set((system.blocks || []).map((block) => block.blockId));
  const cueRows = [...(raw.precision_index || []), ...(raw.visual_bindings || [])];
  const cueIds = new Set();
  for (const row of cueRows) {
    if (!row?.id) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ID_MISSING:${systemId}`);
    if (cueIds.has(row.id)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ID_DUPLICATE:${row.id}`);
    cueIds.add(row.id);
    if (!blockIds.has(row?.anchor?.block_id)) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_BLOCK_UNKNOWN:${row?.id || systemId}`);
    }
    if (!row?.anchor?.kp_id && !row?.anchor?.logic_group_id) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ANCHOR_MISSING:${row.id}`);
    }
  }

  const result = {
    sourcePath,
    rules: raw.rules || {},
    precisionIndex: Array.isArray(raw.precision_index) ? raw.precision_index : [],
    visualBindings: Array.isArray(raw.visual_bindings) ? raw.visual_bindings : []
  };
  if (BUILD_CACHE_ENABLED) learningCuesCache.set(cacheKey, result);
  return result;
}

// Prepared answers stay in their existing Content owner. A cue holds only an
// explicitly reviewed reference; this is not blanket admission of retained rows.
const PREPARED_MEMORY_OWNER = `${LEARNER_ROOT}/shared-fields.json`;
const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
export const preparedMemoryDigest = value => createHash('sha256')
  .update(typeof value === 'string' ? value : JSON.stringify(stable(value))).digest('hex');
const escapeHtml = value => String(value || '').replace(/[&<>"']/g,
  char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

// Native cue answers reuse precision_fields and actual native KP/LG ownership.
// This fixed projection is shared by explicit reviewed authoring and resolution;
// resolution compares existing witnesses and never re-signs them.
const nativeObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const nativeShape = (value, required, optional = []) => nativeObject(value)
  && required.every(key => Object.hasOwn(value, key))
  && Object.keys(value).every(key => [...required, ...optional].includes(key));
const nativeString = value => typeof value === 'string' && Boolean(value.trim());
const nativeEqual = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));
const coreIdentityKeys = ['system_id', 'block_id', 'kp_id', 'source_path'];
const nativeReferenceKeys = ['collection', 'owner_mode', 'precision_id', 'item_sha256', 'owner_kp_ids', 'owner_sha256', 'core_refs'];
const nativeFailure = row => code => { throw new Error(`CURRENT_XIZONG_PREPARED_MEMORY_${code}:${row?.id || ''}`); };

export function preparedNativeCueWitness(row, block, item, shared, { loadBlock = loadXizongBlock } = {}) {
  const fail = nativeFailure(row);
  if (block?.systemId !== 'respiratory' || block?.systemCanonicalId !== 'A2') fail('NATIVE_SYSTEM_UNSUPPORTED');
  const anchor = row?.anchor;
  const kpOwned = nativeShape(anchor, ['block_id', 'kp_id']);
  const lgOwned = nativeShape(anchor, ['block_id', 'logic_group_id']);
  if ((!kpOwned && !lgOwned) || anchor.block_id !== block.blockId
    || Object.values(anchor).some(value => !nativeString(value))) fail('NATIVE_ANCHOR_INVALID');
  if (!nativeShape(item, ['cue', 'answer', 'retention_metadata'],
    ['answer_scope', 'scope_note', 'source_conflict', 'mnemonic', 'source', 'source_refs'])
    || !nativeShape(item.retention_metadata, ['native_owner', 'required_core_refs'], ['source_scope_notes', 'source_bindings'])) fail('NATIVE_ITEM_SHAPE_INVALID');
  const nativeOwner = item.retention_metadata.native_owner;
  if (!nativeShape(nativeOwner, ['system_id', 'canonical_id', 'anchor'])
    || nativeOwner.system_id !== block.systemId || nativeOwner.canonical_id !== block.systemCanonicalId
    || !nativeEqual(nativeOwner.anchor, anchor)) fail('NATIVE_ITEM_OWNER_MISMATCH');
  if (!nativeString(item.answer) || !nativeString(row.id) || !nativeString(row.cue) || item.cue !== row.cue) fail('ANSWER_OR_CUE_MISMATCH');
  if (!String(shared?.authority || '').startsWith('CHAT_APPROVED')) fail('OWNER_UNAPPROVED');
  const matchOne = (values, key, id, code) => {
    const matches = (values || []).filter(value => value?.[key] === id);
    if (matches.length !== 1) fail(code);
    return matches[0];
  };
  const group = lgOwned ? matchOne(block.logicGroups, 'groupId', anchor.logic_group_id, 'NATIVE_GROUP_UNKNOWN') : null;
  const ownerIds = kpOwned ? [anchor.kp_id] : group.kpIds;
  if (!Array.isArray(ownerIds) || !ownerIds.length || ownerIds.some(id => !nativeString(id))
    || new Set(ownerIds).size !== ownerIds.length) fail('NATIVE_MEMBERSHIP_INVALID');
  for (const id of ownerIds) {
    const kp = matchOne(block.kpRecords, 'kpId', id, 'NATIVE_MEMBER_UNKNOWN');
    if (lgOwned && kp.groupId !== group.groupId) fail('NATIVE_MEMBER_MOVED');
  }
  const required = item.retention_metadata.required_core_refs;
  if (!Array.isArray(required) || required.length < ownerIds.length
    || required.some(ref => !nativeShape(ref, coreIdentityKeys) || Object.values(ref).some(value => !nativeString(value)))) fail('NATIVE_CORE_IDENTITIES_INVALID');
  const identity = ref => `${ref.system_id}:${ref.block_id}:${ref.kp_id}`;
  if (new Set(required.map(identity)).size !== required.length) fail('NATIVE_CORE_DUPLICATE');
  const ownerRefs = ownerIds.map(kp_id => ({ system_id: block.systemId, block_id: block.blockId, kp_id, source_path: block.sourcePath }));
  if (!nativeEqual(required.slice(0, ownerIds.length), ownerRefs)) fail('NATIVE_CORE_MEMBERSHIP_MISMATCH');
  const extras = required.slice(ownerIds.length).map(identity);
  if (!nativeEqual(extras, [...extras].sort())) fail('NATIVE_CORE_ORDER_INVALID');
  const blockIdentity = owner => {
    const fields = ['systemId', 'systemCanonicalId', 'blockId', 'sourcePath', 'systemSourcePath', 'learningSupportSourcePath'];
    if (fields.some(key => !nativeString(owner?.[key]))) fail('NATIVE_OWNER_METADATA_MISSING');
    if (shared?.source_bindings?.[owner.blockId] !== owner.sourcePath) fail('SOURCE_BINDING_MISMATCH');
    return Object.fromEntries(fields.map(key => [key, owner[key]]));
  };
  const qualifiers = owner => {
    const fields = ['firstPassFocus', 'stopLine', 'recallSpine'];
    if (fields.some(key => typeof owner?.[key] !== 'string')) fail('NATIVE_BLOCK_QUALIFIER_MISSING');
    return { ...blockIdentity(owner), ...Object.fromEntries(fields.map(key => [key, owner[key]])) };
  };
  const blockQualifiers = [qualifiers(block)];
  const seenBlocks = new Set([`${block.systemId}:${block.blockId}`]);
  const dependencyOwners = [], coreRefs = [];
  for (const ref of required) {
    let owner;
    try { owner = ref.system_id === block.systemId && ref.block_id === block.blockId ? block : loadBlock(ref.system_id, ref.block_id); }
    catch { fail('NATIVE_CORE_MISSING'); }
    if (!owner || owner.systemId !== ref.system_id || owner.blockId !== ref.block_id || owner.sourcePath !== ref.source_path) fail('NATIVE_CORE_OWNER_MISMATCH');
    const kp = matchOne(owner.kpRecords, 'kpId', ref.kp_id, 'NATIVE_CORE_MISSING');
    const fields = ['kpId', 'ordinal', 'title', 'prompt', 'sourceLocator', 'outlineLocator', 'groupId', 'groupLabel'];
    if (!Number.isInteger(kp.ordinal) || kp.ordinal < 1
      || fields.filter(key => !['ordinal', 'sourceLocator', 'outlineLocator'].includes(key)).some(key => !nativeString(kp[key]))
      || ['sourceLocator', 'outlineLocator'].some(key => typeof kp[key] !== 'string')) fail('NATIVE_KP_METADATA_MISSING');
    if (kp.contentDiagnostics !== undefined && (!Array.isArray(kp.contentDiagnostics) || kp.contentDiagnostics.length)) fail('NATIVE_KP_METADATA_DIAGNOSTIC');
    if (!nativeString(kp.detailMarkdown)) fail('NATIVE_CORE_EMPTY');
    dependencyOwners.push({ ...blockIdentity(owner), ...Object.fromEntries(fields.map(key => [key, kp[key]])), contentDiagnostics: kp.contentDiagnostics || [] });
    coreRefs.push({ ...ref, kp_core_sha256: preparedMemoryDigest(kp.detailMarkdown) });
    const blockKey = `${owner.systemId}:${owner.blockId}`;
    if (!seenBlocks.has(blockKey)) { seenBlocks.add(blockKey); blockQualifiers.push(qualifiers(owner)); }
  }
  let groupWitness = null;
  if (group) {
    const fields = ['groupId', 'order', 'label', 'membershipMode', 'kpOrdinals', 'kpCount', 'kpIds', 'jobs', 'goal', 'closure', 'visualRequired', 'visualSourceState', 'continuityRationale', 'receiptAnchor', 'start', 'end'];
    if (fields.some(key => group[key] === undefined || group[key] === null)
      || !Array.isArray(group.kpOrdinals) || group.kpCount !== ownerIds.length) fail('NATIVE_GROUP_METADATA_MISSING');
    groupWitness = Object.fromEntries(fields.map(key => [key, group[key]]));
  }
  const snapshot = { ...blockIdentity(block), anchor, owner_kp_ids: ownerIds, dependency_owners: dependencyOwners,
    logic_group: groupWitness, block_qualifiers: blockQualifiers };
  return { owner_kp_ids: [...ownerIds], owner_sha256: preparedMemoryDigest(snapshot), core_refs: coreRefs };
}

function resolveNativePreparedMemoryCue(row, block, shared, options) {
  const fail = nativeFailure(row), ref = row.prepared_memory_ref;
  if (!nativeShape(ref, nativeReferenceKeys) || ref.collection !== 'precision_fields' || ref.owner_mode !== 'NATIVE_CUE'
    || !nativeString(ref.item_sha256) || !nativeString(ref.owner_sha256)) fail('NATIVE_REFERENCE_SHAPE_INVALID');
  if (row.answerHtml || row.answer_html) fail('PARALLEL_ANSWER_OWNER');
  if (ref.precision_id !== row.id) fail('IDENTITY_MISMATCH');
  const item = shared?.precision_fields?.[ref.precision_id];
  const witnesses = preparedNativeCueWitness(row, block, item, shared, options);
  if (ref.item_sha256 !== preparedMemoryDigest(item)) fail('ITEM_REVIEW_STALE');
  if (!nativeEqual(ref.owner_kp_ids, witnesses.owner_kp_ids)) fail('NATIVE_MEMBERSHIP_STALE');
  if (!Array.isArray(ref.core_refs) || ref.core_refs.some(value => !nativeShape(value, [...coreIdentityKeys, 'kp_core_sha256']))
    || !nativeEqual(ref.core_refs, witnesses.core_refs)) fail('NATIVE_CORE_REVIEW_STALE');
  if (ref.owner_sha256 !== witnesses.owner_sha256) fail('NATIVE_OWNER_REVIEW_STALE');
  return renderPreparedMemoryCue(row, item);
}

export function resolvePreparedMemoryCue(row, block, shared, { loadBlock = loadXizongBlock } = {}) {
  const ref = row?.prepared_memory_ref;
  if (!Object.hasOwn(row || {}, 'prepared_memory_ref')) return row;
  const fail = code => { throw new Error(`CURRENT_XIZONG_PREPARED_MEMORY_${code}:${row?.id || ''}`); };
  const object = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const shape = (value, required, optional = []) => object(value)
    && required.every(key => Object.hasOwn(value, key))
    && Object.keys(value).every(key => [...required, ...optional].includes(key));
  if (!object(ref)) fail('REFERENCE_SHAPE_INVALID');
  if (!String(shared?.authority || '').startsWith('CHAT_APPROVED')) fail('OWNER_UNAPPROVED');
  if (shared?.source_bindings?.[block.blockId] !== block.sourcePath) fail('SOURCE_BINDING_MISMATCH');
  if (ref.owner_mode === 'NATIVE_CUE') return resolveNativePreparedMemoryCue(row, block, shared, { loadBlock });
  if (Object.hasOwn(ref, 'owner_mode')) fail('OWNER_MODE_UNSUPPORTED');
  const kp = (block.kpRecords || []).find(k => k.kpId === row?.anchor?.kp_id);
  if (!kp || row?.anchor?.block_id !== block.blockId) fail('KP_OWNER_MISMATCH');
  const aliases = [...new Set([kp.kpId, `${block.blockId}-kp${String(Number(kp.ordinal)).padStart(3, '0')}`])];
  if (!aliases.includes(ref.kp_field_key)) fail('FIELD_OWNER_MISMATCH');
  const precisionMode = ref.collection === 'precision_fields';
  if (!['memory_items', 'source_memory_items', 'precision_fields'].includes(ref.collection)) fail('COLLECTION_UNSUPPORTED');
  const common = ['collection', 'kp_field_key', 'kp_core_sha256', 'item_sha256'];
  if (!shape(ref, [...common, ...(precisionMode
    ? ['precision_id', 'source_memory_refs', 'expected_missing_source_memory_ids'] : ['memory_id'])], ['additional_core_refs'])) fail('REFERENCE_SHAPE_INVALID');
  if (row.answerHtml || row.answer_html) fail('PARALLEL_ANSWER_OWNER');
  if (ref.kp_core_sha256 !== preparedMemoryDigest(String(kp.detailMarkdown || ''))) fail('CORE_REVIEW_STALE');

  // These are additional medical premises, not new learning/release targets.
  // Cross-Block reads reuse the native loader and its existing build cache.
  const additional = ref.additional_core_refs ?? [];
  if (!Array.isArray(additional)) fail('ADDITIONAL_CORE_INVALID');
  const seen = new Set([`${block.systemId}:${block.blockId}:${kp.kpId}`]);
  for (const witness of additional) {
    if (!shape(witness, ['system_id', 'block_id', 'kp_id', 'source_path', 'kp_core_sha256'])) fail('ADDITIONAL_CORE_INVALID');
    const identity = `${witness.system_id}:${witness.block_id}:${witness.kp_id}`;
    if (seen.has(identity)) fail('ADDITIONAL_CORE_DUPLICATE');
    seen.add(identity);
    let owner;
    try { owner = witness.system_id === block.systemId && witness.block_id === block.blockId
      ? block : loadBlock(witness.system_id, witness.block_id); }
    catch { fail('ADDITIONAL_CORE_MISSING'); }
    if (!owner || owner.systemId !== witness.system_id || owner.blockId !== witness.block_id
      || owner.sourcePath !== witness.source_path
      || shared?.source_bindings?.[owner.blockId] !== owner.sourcePath) fail('ADDITIONAL_CORE_OWNER_MISMATCH');
    const premise = (owner.kpRecords || []).find(value => value.kpId === witness.kp_id);
    if (!premise || !witness.kp_core_sha256
      || witness.kp_core_sha256 !== preparedMemoryDigest(String(premise.detailMarkdown || ''))) fail('ADDITIONAL_CORE_REVIEW_STALE');
  }
  const sourceItem = (fieldKey, memoryId, collection) => {
    if (!aliases.includes(fieldKey)) fail('MEMBER_OWNER_MISMATCH');
    const matches = key => (shared?.kp_fields?.[key]?.retention_metadata?.[collection] || [])
      .filter(item => item.memory_id === memoryId);
    const items = matches(fieldKey);
    if (items.length !== 1) fail('ITEM_MISSING_OR_DUPLICATE');
    const item = items[0];
    for (const alias of aliases) {
      const other = matches(alias);
      if (other.length > 1 || other.some(value => preparedMemoryDigest(value) !== preparedMemoryDigest(item))) fail('AMBIGUOUS_IDENTITY_ALIAS');
    }
    if (collection === 'source_memory_items' && item.binding_status !== 'RETAINED_EXACT_SINGLE_OWNER') fail('ITEM_NOT_REVIEWED');
    return item;
  };
  let item, members = [];
  if (precisionMode) {
    if (row.id !== ref.precision_id) fail('IDENTITY_MISMATCH');
    item = shared?.precision_fields?.[ref.precision_id];
    if (!object(item)) fail('ITEM_MISSING_OR_DUPLICATE');
    const declared = item.retention_metadata?.source_memory_ids;
    if (!Array.isArray(declared) || !declared.length || declared.some(id => typeof id !== 'string' || !id)
      || new Set(declared).size !== declared.length) fail('MEMBERSHIP_INVALID');
    if (!Array.isArray(ref.source_memory_refs) || !Array.isArray(ref.expected_missing_source_memory_ids)) fail('MEMBERSHIP_INVALID');
    const refs = ref.source_memory_refs;
    if (refs.some(value => !shape(value, ['kp_field_key', 'memory_id', 'item_sha256']))
      || new Set(refs.map(value => value.memory_id)).size !== refs.length) fail('MEMBERSHIP_INVALID');
    // Derive actual membership, including expected absence. Newly appearing,
    // disappearing, moved or reassigned rows need review; no row is invented.
    const extant = new Set();
    for (const [fieldKey, field] of Object.entries(shared.kp_fields || {})) {
      for (const member of field?.retention_metadata?.source_memory_items || []) {
        if (!declared.includes(member.memory_id)) {
          if (member.precision_id === ref.precision_id) fail('MEMBERSHIP_MISMATCH');
          continue;
        }
        if (!aliases.includes(fieldKey) || member.precision_id !== ref.precision_id) fail('MEMBER_OWNER_MISMATCH');
        extant.add(member.memory_id);
      }
    }
    const expectedPresent = declared.filter(id => extant.has(id));
    const expectedMissing = declared.filter(id => !extant.has(id));
    if (JSON.stringify(refs.map(value => value.memory_id)) !== JSON.stringify(expectedPresent)
      || JSON.stringify(ref.expected_missing_source_memory_ids) !== JSON.stringify(expectedMissing)) fail('MEMBERSHIP_MISMATCH');
    members = refs.map(memberRef => {
      const member = sourceItem(memberRef.kp_field_key, memberRef.memory_id, 'source_memory_items');
      if (memberRef.item_sha256 !== preparedMemoryDigest(member)) fail('MEMBER_REVIEW_STALE');
      return member;
    });
  } else {
    if (ref.memory_id !== row.id) fail('IDENTITY_MISMATCH');
    item = sourceItem(ref.kp_field_key, ref.memory_id, ref.collection);
    // Precision identities cannot be copied into a second ordinary card.
    if (item.precision_id) fail('PRECISION_OWNER_REQUIRED');
  }
  if (typeof item.answer !== 'string' || !item.answer.trim() || !item.cue || item.cue !== row.cue) fail('ANSWER_OR_CUE_MISMATCH');
  if (ref.item_sha256 !== preparedMemoryDigest(item)) fail('ITEM_REVIEW_STALE');
  return renderPreparedMemoryCue(row, item, members, precisionMode);
}

function renderPreparedMemoryCue(row, item, members = [], precisionMode = true) {
  const rendered = new Set();
  const note = (label, value) => {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.map(part => note(label, part)).join('');
    const content = typeof value === 'string' ? value : JSON.stringify(stable(value));
    const key = `${label}:${content}`;
    if (rendered.has(key)) return '';
    rendered.add(key);
    return `<p><strong>${label}</strong>${escapeHtml(content)}</p>`;
  };
  const qualifications = value => {
    const scopes = [...new Set([value.answer_scope, value.scope_note].filter(Boolean))];
    return scopes.map(scope => note('适用范围：', scope)).join('')
      + note('来源差异：', value.source_conflict?.conflict)
      + note('处理边界：', value.source_conflict?.policy)
      + note('助记（不能代替答案）：', value.mnemonic)
      + note('来源（保留记录，非本次原文核验）：', value.source)
      + note('来源引用：', value.source_refs);
  };
  const html = `<section data-prepared-memory="${escapeHtml(row.id)}">`
    + `<p>${escapeHtml(item.answer)}</p>` + qualifications(item)
    + (precisionMode ? note('适用范围：', item.retention_metadata?.source_scope_notes)
      + note('来源（保留记录，非本次原文核验）：', item.retention_metadata?.source_bindings)
      + members.map(member => `<section data-prepared-memory-member="${escapeHtml(member.memory_id)}">`
        + note('条目：', member.cue) + qualifications(member) + '</section>').join('') : '')
    + '</section>';
  return {
    ...row, answer_html: html,
    answer_bearing: true,
    display_policy: { ...(row.display_policy || {}), timing: 'POST_REVEAL' },
    source_locator: row.source_locator || item.source
      || (Array.isArray(item.source_pdf_pages) ? `原记忆项 Source PDF P${item.source_pdf_pages.join(', ')}` : ''),
    prepared_memory_owner: PREPARED_MEMORY_OWNER
  };
}

export function learningCuesForBlock(cues, block) {
  if (!cues || !block) return { precision: [], visuals: [], sourcePath: '' };

  const kpIds = new Set((block.kpRecords || []).map((kp) => kp.kpId));
  const groupIds = new Set((block.logicGroups || []).map((group) => group.groupId));
  const groupForKp = new Map();
  for (const group of block.logicGroups || []) {
    for (const kpId of group.kpIds || []) {
      if (groupForKp.has(kpId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_KP_MULTI_GROUP:${kpId}`);
      groupForKp.set(kpId, group.groupId);
    }
  }

  const rows = [
    ...(cues.precisionIndex || []).filter((row) => row?.anchor?.block_id === block.blockId),
    ...(cues.visualBindings || []).filter((row) => row?.anchor?.block_id === block.blockId)
  ];

  for (const row of rows) {
    const kpId = row?.anchor?.kp_id;
    const groupId = row?.anchor?.logic_group_id;
    if (kpId && !kpIds.has(kpId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_KP_UNKNOWN:${row.id}:${kpId}`);
    if (groupId && !groupIds.has(groupId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_GROUP_UNKNOWN:${row.id}:${groupId}`);
    if (kpId && groupId && groupForKp.get(kpId) !== groupId) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ANCHOR_INCONSISTENT:${row.id}:${kpId}:${groupId}`);
    }
  }

  const precision = (cues.precisionIndex || []).filter(row => row?.anchor?.block_id === block.blockId);
  const shared = precision.some(row => row.prepared_memory_ref)
    ? JSON.parse(fs.readFileSync(absolute(PREPARED_MEMORY_OWNER), 'utf8')) : null;
  return {
    sourcePath: cues.sourcePath,
    rules: cues.rules || {},
    precision: precision.map(row => resolvePreparedMemoryCue(row, block, shared)),
    visuals: (cues.visualBindings || []).filter((row) => row?.anchor?.block_id === block.blockId)
  };
}
