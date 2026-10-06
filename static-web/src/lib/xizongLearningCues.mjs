import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

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

export function resolvePreparedMemoryCue(row, block, shared) {
  const ref = row?.prepared_memory_ref;
  if (!ref) return row;
  const fail = code => { throw new Error(`CURRENT_XIZONG_PREPARED_MEMORY_${code}:${row?.id || ''}`); };
  if (!String(shared?.authority || '').startsWith('CHAT_APPROVED')) fail('OWNER_UNAPPROVED');
  if (shared?.source_bindings?.[block.blockId] !== block.sourcePath) fail('SOURCE_BINDING_MISMATCH');
  const kp = (block.kpRecords || []).find(k => k.kpId === row?.anchor?.kp_id);
  if (!kp || row?.anchor?.block_id !== block.blockId) fail('KP_OWNER_MISMATCH');
  const aliases = [...new Set([kp.kpId, `${block.blockId}-kp${String(Number(kp.ordinal)).padStart(3, '0')}`])];
  if (!aliases.includes(ref.kp_field_key)) fail('FIELD_OWNER_MISMATCH');
  if (!['memory_items', 'source_memory_items'].includes(ref.collection)) fail('COLLECTION_UNSUPPORTED');
  if (ref.memory_id !== row.id) fail('IDENTITY_MISMATCH');
  const matches = key => (shared?.kp_fields?.[key]?.retention_metadata?.[ref.collection] || [])
    .filter(item => item.memory_id === ref.memory_id);
  const items = matches(ref.kp_field_key);
  if (items.length !== 1) fail('ITEM_MISSING_OR_DUPLICATE');
  const item = items[0];
  for (const alias of aliases) {
    const other = matches(alias);
    if (other.length > 1 || other.some(value => preparedMemoryDigest(value) !== preparedMemoryDigest(item))) {
      fail('AMBIGUOUS_IDENTITY_ALIAS');
    }
  }
  if (typeof item.answer !== 'string' || !item.answer.trim() || item.cue !== row.cue) fail('ANSWER_OR_CUE_MISMATCH');
  if (ref.collection === 'source_memory_items' && item.binding_status !== 'RETAINED_EXACT_SINGLE_OWNER') fail('ITEM_NOT_REVIEWED');
  // Any change in current KP body or retained answer/aid/scope requires bounded
  // content review. Do not guess equality or silently re-sign stale evidence.
  if (ref.kp_core_sha256 !== preparedMemoryDigest(String(kp.detailMarkdown || ''))) fail('CORE_REVIEW_STALE');
  if (ref.item_sha256 !== preparedMemoryDigest(item)) fail('ITEM_REVIEW_STALE');
  if (row.answerHtml || row.answer_html) fail('PARALLEL_ANSWER_OWNER');
  const note = (label, value) => value ? `<p><strong>${label}</strong>${escapeHtml(value)}</p>` : '';
  const html = `<section data-prepared-memory="${escapeHtml(row.id)}">`
    + `<p>${escapeHtml(item.answer)}</p>`
    + note('适用范围：', item.answer_scope)
    + note('来源差异：', item.source_conflict?.conflict)
    + note('处理边界：', item.source_conflict?.policy)
    + note('助记（不能代替答案）：', item.mnemonic)
    + '</section>';
  return {
    ...row, answer_html: html,
    // Adding exact answers must not leak them via formerly cue-only KP Context.
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
