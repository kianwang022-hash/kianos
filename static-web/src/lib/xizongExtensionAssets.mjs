import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { listProjectableXizongSystems, loadXizongBlock } from './xizong.mjs';
import { loadXizongLearningCues } from './xizongLearningCues.mjs';

export const EXTENSION_SCHEMA = 'kianos.xizong.extension_assets.v1';
export const EXTENSION_ASSET_TYPES = Object.freeze(['STRUCTURED_TABLE', 'SOURCE_VISUAL', 'SUMMARY_VISUAL']);
export const EXTENSION_TIMINGS = Object.freeze(['ORIENTATION_SAFE', 'LEARNING_MOMENT', 'POST_REVEAL', 'REFERENCE_ONLY']);
export const EXTENSION_DEFAULT_STATES = Object.freeze(['EXPANDED', 'COLLAPSED']);
export const EXTENSION_PROVENANCE_KINDS = Object.freeze([
  'LECTURE_SOURCE',
  'MARGINNOTE_REVIEWED',
  'USER_UPLOAD_REVIEWED',
  'CHAT_STRUCTURED_FROM_CURRENT'
]);

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const MANIFEST_ROOT = 'content/xizong/knowledge/learner';
const MANIFEST_SUFFIX = '-extensions.json';
const EXTENSION_ASSET_ROOT = path.join(repoRoot, 'static-web/src/assets/xizong/extensions');

// This glob is deliberately scoped to the generic Extension directory. The
// accepted legacy Source Visual pipeline has its own loader and remains
// untouched for backward compatibility.
const assetUrls = (() => {
  try {
    return import.meta.glob('../assets/xizong/extensions/**/*.{webp,png,jpg,jpeg,svg}', {
    eager: true,
    query: '?url',
    import: 'default'
    });
  } catch {
    return {};
  }
})();

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isSha256 = (value) => /^[0-9a-f]{64}$/i.test(String(value || ''));
const sha256File = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_EXTENSION_${code}${detail ? `:${detail}` : ''}`);
}

function safeRelativeAssetPath(value) {
  const normalized = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  return normalized && !normalized.includes('..') && !path.isAbsolute(normalized) ? normalized : '';
}

function imageResolution(assetPath) {
  const safePath = safeRelativeAssetPath(assetPath);
  if (!safePath) return { exists: false, sha256: '', src: null, absolutePath: '' };
  const root = path.resolve(EXTENSION_ASSET_ROOT);
  const absolutePath = path.resolve(root, safePath);
  if (!absolutePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(absolutePath)) {
    return { exists: false, sha256: '', src: null, absolutePath };
  }
  const viteKey = `../assets/xizong/extensions/${safePath}`;
  return {
    exists: true,
    sha256: sha256File(absolutePath),
    src: assetUrls[viteKey] || null,
    absolutePath
  };
}

function validateManifestHeader(manifest, fileName) {
  if (!isObject(manifest)) fail('MANIFEST_INVALID', fileName);
  if (manifest.schema !== EXTENSION_SCHEMA) fail('MANIFEST_SCHEMA_INVALID', fileName);
  if (manifest.status !== 'CURRENT') fail('MANIFEST_STATUS_INVALID', fileName);
  if (!String(manifest.authority || '').startsWith('CHAT_APPROVED')) fail('MANIFEST_AUTHORITY_INVALID', fileName);
  if (!Array.isArray(manifest.assets)) fail('MANIFEST_ASSETS_INVALID', fileName);

  const hasSystem = manifest.system_id !== undefined || manifest.canonical_id !== undefined;
  if (hasSystem && (!String(manifest.system_id || '').trim() || !String(manifest.canonical_id || '').trim())) {
    fail('MANIFEST_IDENTITY_INCOMPLETE', fileName);
  }
}

function validateString(value, code, detail, { optional = false } = {}) {
  if (optional && value === undefined) return;
  if (typeof value !== 'string' || !value.trim()) fail(code, detail);
}

function validateOwner(asset, context, detail) {
  if (!isObject(asset.owner)) fail('OWNER_INVALID', detail);
  const owner = asset.owner;
  validateString(owner.block_id, 'OWNER_BLOCK_MISSING', detail);
  const hasGroup = owner.logic_group_id !== undefined;
  const hasKp = owner.kp_id !== undefined;

  const block = context.blocks.get(owner.block_id);
  if (!block) fail('OWNER_BLOCK_UNKNOWN', `${detail}:${owner.block_id}`);
  if (!hasGroup && !hasKp) return { block, kind: 'block' };

  const loadedBlock = context.loadedBlocks.get(owner.block_id) || loadXizongBlock(block.systemId, owner.block_id);
  context.loadedBlocks.set(owner.block_id, loadedBlock);

  let logicGroup = null;
  if (hasGroup) {
    validateString(owner.logic_group_id, 'OWNER_LOGIC_GROUP_MISSING', detail);
    logicGroup = (loadedBlock.logicGroups || []).find((group) => group.groupId === owner.logic_group_id) || null;
    if (!logicGroup) fail('OWNER_LOGIC_GROUP_UNKNOWN', `${detail}:${owner.logic_group_id}`);
  }

  if (hasKp) {
    validateString(owner.kp_id, 'OWNER_KP_MISSING', detail);
    if (!(loadedBlock.kpRecords || []).some((kp) => kp.kpId === owner.kp_id)) {
      fail('OWNER_KP_UNKNOWN', `${detail}:${owner.kp_id}`);
    }
    if (logicGroup && !(logicGroup.kpIds || []).includes(owner.kp_id)) {
      fail('OWNER_KP_OUTSIDE_LOGIC_GROUP', `${detail}:${owner.logic_group_id}:${owner.kp_id}`);
    }
    return { block, loadedBlock, logicGroup, kind: 'kp' };
  }

  return { block, loadedBlock, logicGroup, kind: 'logic_group' };
}

function cueForOwner(asset, ownerInfo, context, detail) {
  if (asset.cue_id === undefined) return null;
  validateString(asset.cue_id, 'CUE_ID_INVALID', detail);
  const system = context.systemsById.get(ownerInfo.block.systemId);
  const cues = context.cuesBySystem.get(ownerInfo.block.systemId) || loadXizongLearningCues(system);
  context.cuesBySystem.set(ownerInfo.block.systemId, cues);
  const rows = [...(cues?.precisionIndex || []), ...(cues?.visualBindings || [])];
  const cue = rows.find((row) => row?.id === asset.cue_id);
  if (!cue) fail('CUE_UNKNOWN', `${detail}:${asset.cue_id}`);
  const anchor = cue.anchor || {};
  if (anchor.block_id !== asset.owner.block_id) fail('CUE_OWNER_MISMATCH', `${detail}:${asset.cue_id}`);
  if (asset.owner.logic_group_id !== undefined && anchor.logic_group_id !== undefined && anchor.logic_group_id !== asset.owner.logic_group_id) {
    fail('CUE_OWNER_MISMATCH', `${detail}:${asset.cue_id}`);
  }
  if (asset.owner.kp_id !== undefined && anchor.kp_id !== undefined && anchor.kp_id !== asset.owner.kp_id) {
    fail('CUE_OWNER_MISMATCH', `${detail}:${asset.cue_id}`);
  }
  return cue;
}

function validateProvenance(provenance, detail) {
  if (!isObject(provenance)) fail('PROVENANCE_MISSING', detail);
  if (!EXTENSION_PROVENANCE_KINDS.includes(provenance.kind)) fail('PROVENANCE_KIND_INVALID', detail);
  const sourceBacked = ['LECTURE_SOURCE', 'MARGINNOTE_REVIEWED', 'USER_UPLOAD_REVIEWED'].includes(provenance.kind);
  if (sourceBacked) validateString(provenance.source_locator, 'PROVENANCE_LOCATOR_MISSING', detail);
  else validateString(provenance.source_locator, 'PROVENANCE_LOCATOR_INVALID', detail, { optional: true });
  for (const key of ['source_sha256', 'source_asset_sha256']) {
    if (provenance[key] !== undefined && !isSha256(provenance[key])) fail('PROVENANCE_HASH_INVALID', `${detail}:${key}`);
  }
}

function validateScalar(value, detail) {
  if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) fail('TABLE_CELL_INVALID', detail);
  if (typeof value === 'number' && !Number.isFinite(value)) fail('TABLE_CELL_INVALID', detail);
}

function validateStructuredTable(payload, detail) {
  if (!isObject(payload) || !Array.isArray(payload.columns) || !payload.columns.length || !Array.isArray(payload.rows)) {
    fail('TABLE_SCHEMA_INVALID', detail);
  }
  const columnKeys = [];
  for (const [index, column] of payload.columns.entries()) {
    if (!isObject(column) || Object.keys(column).some((key) => !['key', 'label'].includes(key))) {
      fail('TABLE_SCHEMA_INVALID', `${detail}:column-${index}`);
    }
    validateString(column.key, 'TABLE_COLUMN_KEY_INVALID', `${detail}:column-${index}`);
    validateString(column.label, 'TABLE_COLUMN_LABEL_INVALID', `${detail}:column-${index}`);
    if (columnKeys.includes(column.key)) fail('TABLE_COLUMN_DUPLICATE', `${detail}:${column.key}`);
    columnKeys.push(column.key);
  }

  const allowedRowKeys = new Set([...columnKeys, 'row_label', 'emphasis']);
  for (const [index, row] of payload.rows.entries()) {
    if (!isObject(row)) fail('TABLE_SCHEMA_INVALID', `${detail}:row-${index}`);
    for (const key of Object.keys(row)) {
      if (!allowedRowKeys.has(key)) fail('TABLE_ROW_KEY_INVALID', `${detail}:row-${index}:${key}`);
    }
    for (const key of columnKeys) {
      if (!Object.prototype.hasOwnProperty.call(row, key)) fail('TABLE_ROW_COLUMN_MISSING', `${detail}:row-${index}:${key}`);
      validateScalar(row[key], `${detail}:row-${index}:${key}`);
    }
    if (row.row_label !== undefined) validateString(row.row_label, 'TABLE_ROW_LABEL_INVALID', `${detail}:row-${index}`, { optional: false });
    if (row.emphasis !== undefined && typeof row.emphasis !== 'boolean') fail('TABLE_ROW_EMPHASIS_INVALID', `${detail}:row-${index}`);
  }
}

function validateImagePayload(payload, detail, resolveImage) {
  if (!isObject(payload)) fail('IMAGE_PAYLOAD_INVALID', detail);
  const assetPath = safeRelativeAssetPath(payload.asset_path);
  if (!assetPath) fail('IMAGE_PATH_INVALID', detail);
  if (!/\.(?:webp|png|jpe?g|svg)$/i.test(assetPath)) fail('IMAGE_PATH_INVALID', detail);
  if (!Number.isInteger(payload.width) || payload.width <= 0 || !Number.isInteger(payload.height) || payload.height <= 0) {
    fail('IMAGE_DIMENSIONS_INVALID', detail);
  }
  validateString(payload.alt, 'IMAGE_ALT_MISSING', detail);
  if (!isSha256(payload.derived_asset_sha256)) fail('IMAGE_DERIVED_HASH_INVALID', detail);
  if (payload.source_crop_sha256 !== undefined && !isSha256(payload.source_crop_sha256)) fail('IMAGE_CROP_HASH_INVALID', detail);

  const resolved = resolveImage(assetPath);
  if (!resolved?.exists) fail('IMAGE_MISSING', `${detail}:${assetPath}`);
  if (String(resolved.sha256).toLowerCase() !== String(payload.derived_asset_sha256).toLowerCase()) {
    fail('IMAGE_HASH_MISMATCH', `${detail}:${assetPath}`);
  }
  return { assetPath, resolved };
}

function validateDisplayPolicy(policy, ownerKind, detail) {
  if (!isObject(policy)) fail('DISPLAY_POLICY_MISSING', detail);
  if (!EXTENSION_TIMINGS.includes(policy.timing)) fail('DISPLAY_TIMING_INVALID', detail);
  if (!EXTENSION_DEFAULT_STATES.includes(policy.default_state)) fail('DISPLAY_DEFAULT_STATE_INVALID', detail);
  if (policy.timing === 'REFERENCE_ONLY' && policy.default_state !== 'COLLAPSED') {
    fail('DISPLAY_REFERENCE_MUST_COLLAPSE', detail);
  }

  const allowed = {
    block: ['ORIENTATION_SAFE', 'REFERENCE_ONLY'],
    logic_group: ['ORIENTATION_SAFE', 'LEARNING_MOMENT', 'POST_REVEAL', 'REFERENCE_ONLY'],
    kp: ['POST_REVEAL', 'REFERENCE_ONLY']
  }[ownerKind] || [];
  if (!allowed.includes(policy.timing)) fail('DISPLAY_OWNER_TIMING_UNSAFE', `${detail}:${ownerKind}:${policy.timing}`);
}

export function createCurrentExtensionOwnerContext() {
  const systems = listProjectableXizongSystems();
  const systemsById = new Map(systems.map((system) => [system.systemId, system]));
  const blocks = new Map();
  for (const system of systems) {
    for (const block of system.blocks || []) blocks.set(block.blockId, { ...block, systemId: system.systemId, canonicalId: system.canonicalId });
  }
  return { systemsById, blocks, loadedBlocks: new Map(), cuesBySystem: new Map() };
}

export function validateExtensionAsset(asset, options = {}) {
  const detail = options.detail || 'asset';
  const context = options.context || createCurrentExtensionOwnerContext();
  if (!isObject(asset)) fail('ASSET_INVALID', detail);
  validateString(asset.slot_id, 'SLOT_ID_INVALID', detail);
  if (!Number.isInteger(asset.revision) || asset.revision <= 0) fail('REVISION_INVALID', detail);
  validateString(asset.title, 'TITLE_MISSING', detail);
  validateString(asset.task, 'TASK_INVALID', detail, { optional: true });
  validateString(asset.caption, 'CAPTION_INVALID', detail, { optional: true });
  const ownerInfo = validateOwner(asset, context, detail);
  cueForOwner(asset, ownerInfo, context, detail);
  validateProvenance(asset.provenance, detail);
  validateDisplayPolicy(asset.display_policy, ownerInfo.kind, detail);
  if (!EXTENSION_ASSET_TYPES.includes(asset.asset_type)) fail('ASSET_TYPE_INVALID', detail);

  const forbidden = ['core_owner', 'medical_core_owner', 'source_precedence', 'learning_order', 'kp_order', 'logic_group_order'];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(asset, key))) fail('AUTHORITY_OVERRIDE', detail);

  const resolveImage = options.resolveImage || imageResolution;
  let image = null;
  if (asset.asset_type === 'STRUCTURED_TABLE') validateStructuredTable(asset.payload, detail);
  else image = validateImagePayload(asset.payload, detail, resolveImage);

  return { ownerInfo, image };
}

export function validateExtensionManifests(manifests, options = {}) {
  const context = options.context || createCurrentExtensionOwnerContext();
  const seenSlots = new Set();
  const normalized = [];
  for (const item of manifests || []) {
    const fileName = item.fileName || item.manifestPath || 'manifest';
    const manifest = item.raw || item;
    validateManifestHeader(manifest, fileName);
    if (manifest.system_id !== undefined) {
      const system = context.systemsById.get(manifest.system_id);
      if (!system || system.canonicalId !== manifest.canonical_id) fail('MANIFEST_IDENTITY_MISMATCH', fileName);
    }
    for (const [index, asset] of manifest.assets.entries()) {
      const detail = `${fileName}:${index}`;
      if (seenSlots.has(asset?.slot_id)) fail('SLOT_DUPLICATE', `${detail}:${asset?.slot_id || ''}`);
      seenSlots.add(asset?.slot_id);
      const result = validateExtensionAsset(asset, { ...options, context, detail });
      const ownerBlock = context.blocks.get(asset.owner.block_id);
      if (manifest.system_id !== undefined && ownerBlock?.systemId !== manifest.system_id) {
        fail('MANIFEST_OWNER_SYSTEM_MISMATCH', detail);
      }
      normalized.push({ ...asset, manifestPath: item.manifestPath || fileName, _validation: result });
    }
  }
  return { assets: normalized, slots: seenSlots };
}

function readCurrentManifests() {
  const root = path.join(repoRoot, MANIFEST_ROOT);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root)
    .filter((name) => name.endsWith(MANIFEST_SUFFIX))
    .sort()
    .map((fileName) => ({
      fileName,
      manifestPath: `${MANIFEST_ROOT}/${fileName}`,
      raw: JSON.parse(fs.readFileSync(path.join(root, fileName), 'utf8'))
    }));
}

const currentValidation = validateExtensionManifests(readCurrentManifests());
const currentAssets = Object.freeze(currentValidation.assets.map((asset) => {
  const image = asset._validation.image;
  const { _validation, ...clean } = asset;
  return Object.freeze({
    ...clean,
    src: image?.resolved?.src || null,
    asset_path: image?.assetPath || null
  });
}));

export function allXizongExtensionAssets() {
  return currentAssets;
}

export function extensionAssetsForBlock(block) {
  const blockId = String(block?.blockId || '');
  return currentAssets.filter((asset) => asset.owner?.block_id === blockId);
}

export function extensionAssetsForCue(cueId) {
  return currentAssets.filter((asset) => asset.cue_id === String(cueId || ''));
}
