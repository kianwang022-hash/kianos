import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const PROJECTION_ROOT = 'content/xizong/projection';
const MANIFEST_PATH = `${PROJECTION_ROOT}/manifest.json`;
const manifestCache = { value: null };
const assetCache = new Map();
const textCache = new Map();
const jsonCache = new Map();

function absolute(relativePath) {
  const normalized = path.posix.normalize(String(relativePath || ''));
  if (!normalized || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`XIZONG_COGNITIVE_PROJECTION_UNSAFE_PATH:${relativePath}`);
  }
  return path.join(repoRoot, normalized);
}

function readText(relativePath) {
  if (!textCache.has(relativePath)) textCache.set(relativePath, fs.readFileSync(absolute(relativePath), 'utf8'));
  return textCache.get(relativePath);
}

function readJson(relativePath) {
  if (!jsonCache.has(relativePath)) jsonCache.set(relativePath, JSON.parse(readText(relativePath)));
  return jsonCache.get(relativePath);
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function manifest() {
  if (manifestCache.value) return manifestCache.value;
  const raw = readJson(MANIFEST_PATH);
  if (raw?.runtime_authority !== false || raw?.contract !== `${PROJECTION_ROOT}/PROJECTION_CONTRACT.md`) {
    throw new Error('XIZONG_COGNITIVE_PROJECTION_MANIFEST_INVALID');
  }
  manifestCache.value = raw;
  return raw;
}

function pointerGet(root, pointer) {
  if (pointer === '') return root;
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) throw new Error(`XIZONG_COGNITIVE_PROJECTION_BAD_POINTER:${pointer}`);
  let current = root;
  for (const raw of pointer.slice(1).split('/')) {
    if (/~(?![01])/.test(raw)) throw new Error(`XIZONG_COGNITIVE_PROJECTION_BAD_POINTER_ESCAPE:${pointer}`);
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(current)) {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) throw new Error(`XIZONG_COGNITIVE_PROJECTION_POINTER_MISSING:${pointer}`);
      current = current[index];
    } else if (current && typeof current === 'object' && Object.hasOwn(current, key)) {
      current = current[key];
    } else {
      throw new Error(`XIZONG_COGNITIVE_PROJECTION_POINTER_MISSING:${pointer}`);
    }
  }
  return current;
}

function markdownLines(text) {
  const lines = String(text).split(/\r?\n/);
  const outside = [];
  let fence = '';
  for (const line of lines) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    outside.push(!fence && !match);
    if (!match) continue;
    const token = match[1];
    if (!fence) fence = token;
    else if (token[0] === fence[0] && token.length >= fence.length) fence = '';
  }
  return { lines, outside };
}

function headingRows(text) {
  const { lines, outside } = markdownLines(text);
  return lines.flatMap((line, index) => {
    if (!outside[index]) return [];
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    return match ? [{ index, level: match[1].length, title: match[2].replace(/\s+#+$/, '').trim() }] : [];
  });
}

function sectionByHeading(text, headingIndex, level) {
  const { lines } = markdownLines(text);
  const headings = headingRows(text);
  const end = headings.find((row) => row.index > headingIndex && row.level <= level)?.index ?? lines.length;
  return lines.slice(headingIndex, end).join('\n').trim();
}

function selectMarkdown(text, selector) {
  const type = selector?.type;
  const { lines, outside } = markdownLines(text);
  const headings = headingRows(text);

  if (type === 'FRONTMATTER_FIELD') {
    if (lines[0] !== '---') throw new Error('XIZONG_COGNITIVE_PROJECTION_FRONTMATTER_MISSING');
    const stop = lines.indexOf('---', 1);
    const field = String(selector?.value || '');
    const matches = [];
    for (let i = 1; i < stop; i += 1) if (new RegExp(`^${field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(lines[i])) matches.push(i);
    if (matches.length !== 1) throw new Error(`XIZONG_COGNITIVE_PROJECTION_FRONTMATTER_FIELD:${field}`);
    const start = matches[0];
    let end = start + 1;
    while (end < stop && !/^\S[^:]*:/.test(lines[end])) end += 1;
    return lines.slice(start, end).join('\n').trim();
  }

  if (type === 'LABELED_BLOCKQUOTE') {
    const label = String(selector?.label || '');
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^>\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*[：:]\\s*(?:\\*\\*)?\\s*(.+)$`);
    const matches = lines.map((line, index) => ({ index, match: outside[index] ? line.match(pattern) : null })).filter((row) => row.match);
    if (matches.length !== 1) throw new Error(`XIZONG_COGNITIVE_PROJECTION_BLOCKQUOTE:${label}`);
    const out = [matches[0].match[1]];
    for (let i = matches[0].index + 1; i < lines.length && lines[i].startsWith('>') && lines[i].slice(1).trim(); i += 1) out.push(lines[i].slice(1).trim());
    return out.join('\n').trim();
  }

  if (type === 'HEADING_EXACT') {
    const found = headings.filter((row) => row.title === selector?.value);
    if (found.length !== 1) throw new Error(`XIZONG_COGNITIVE_PROJECTION_HEADING:${selector?.value}`);
    return sectionByHeading(text, found[0].index, found[0].level);
  }

  if (type === 'MARKER_ID') {
    const wanted = String(selector?.value || '');
    const escaped = wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const marker = new RegExp(`^\\s*<!--\\s*kianos:[\\w-]+\\s+id=["']${escaped}["']\\s*-->\\s*$`);
    const markerIndexes = lines.flatMap((line, index) => outside[index] && marker.test(line) ? [index] : []);
    if (markerIndexes.length !== 1) throw new Error(`XIZONG_COGNITIVE_PROJECTION_MARKER:${wanted}`);
    const markerIndex = markerIndexes[0];
    const next = headings.find((row) => row.index > markerIndex);
    if (!next) throw new Error(`XIZONG_COGNITIVE_PROJECTION_MARKER_OWNER:${wanted}`);
    return sectionByHeading(text, next.index, next.level);
  }

  if (type === 'STRUCTURE_AFTER_ANCHOR') {
    const anchor = String(selector?.anchor || '');
    const indexes = lines.flatMap((line, index) => outside[index] && line.includes(anchor) ? [index] : []);
    if (indexes.length !== 1 || String(text).split(anchor).length !== 2) throw new Error(`XIZONG_COGNITIVE_PROJECTION_ANCHOR:${anchor}`);
    let cursor = indexes[0] + 1;
    while (cursor < lines.length && (!lines[cursor].trim() || lines[cursor].trim().startsWith('<!--'))) cursor += 1;
    const structure = selector?.structure_type;
    if (structure === 'CODE_BLOCK') {
      const open = lines[cursor]?.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (!open) throw new Error(`XIZONG_COGNITIVE_PROJECTION_CODE_BLOCK:${anchor}`);
      const token = open[1];
      let end = cursor + 1;
      while (end < lines.length && !new RegExp(`^\\s*${token[0]}{${token.length},}\\s*$`).test(lines[end])) end += 1;
      if (end >= lines.length) throw new Error(`XIZONG_COGNITIVE_PROJECTION_CODE_BLOCK_UNCLOSED:${anchor}`);
      return lines.slice(cursor, end + 1).join('\n');
    }
    if (structure === 'TABLE') {
      let end = cursor;
      while (end < lines.length && lines[end].trim().startsWith('|')) end += 1;
      if (end - cursor < 3) throw new Error(`XIZONG_COGNITIVE_PROJECTION_TABLE:${anchor}`);
      return lines.slice(cursor, end).join('\n');
    }
    if (structure === 'LIST') {
      let end = cursor;
      while (end < lines.length && lines[end].trim() && !/^#/.test(lines[end])) end += 1;
      return lines.slice(cursor, end).join('\n');
    }
  }

  throw new Error(`XIZONG_COGNITIVE_PROJECTION_SELECTOR_UNSUPPORTED:${type || 'unknown'}`);
}

function dotGet(object, dotted) {
  let current = object;
  for (const key of String(dotted).split('.')) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, key)) throw new Error(`XIZONG_COGNITIVE_PROJECTION_FIELD_MISSING:${dotted}`);
    current = current[key];
  }
  return current;
}

function sourceRegistry(asset) {
  return Object.fromEntries((asset?.sources || []).map((source) => [source.id, source]));
}

function canonicalGuideBinding(binding) {
  return binding?.kind === 'OWNER_REF' && binding?.owner_type === 'BLOCK' && binding?.role === 'CANONICAL_GUIDE';
}

function resolveOwnerRef(binding, block) {
  if (binding?.owner_type === 'BLOCK') {
    if (binding?.id !== block.blockId) throw new Error(`XIZONG_COGNITIVE_PROJECTION_OWNER_MISMATCH:${binding?.id}`);
    if (binding?.role === 'CENTER_QUESTION') return block.centerQuestion;
    if (binding?.role === 'CANONICAL_GUIDE') return block.blockLearnMarkdown;
    return { id: block.blockId, title: block.title };
  }
  if (binding?.owner_type === 'LOGIC_GROUP_SET') {
    if (binding?.block_id !== block.blockId) throw new Error(`XIZONG_COGNITIVE_PROJECTION_LG_OWNER_MISMATCH:${binding?.block_id}`);
    return (block.logicGroups || []).map((group) => ({ id: group.groupId, label: group.label }));
  }
  if (binding?.owner_type === 'KP_SET') return (block.kpRecords || []).map((kp) => ({ id: kp.kpId, label: kp.displayId }));
  throw new Error(`XIZONG_COGNITIVE_PROJECTION_OWNER_REF_UNSUPPORTED:${binding?.owner_type || 'unknown'}`);
}

function resolveBinding(asset, binding, block) {
  if (binding?.kind === 'OWNER_REF') return resolveOwnerRef(binding, block);
  const sources = sourceRegistry(asset);
  const source = sources[binding?.source_id];
  if (!source?.path) throw new Error(`XIZONG_COGNITIVE_PROJECTION_SOURCE_MISSING:${binding?.source_id || 'unknown'}`);

  if (binding?.kind === 'FIELD_REF') return pointerGet(readJson(source.path), binding?.selector?.value);
  if (binding?.kind === 'DERIVED_FRAGMENT') return selectMarkdown(readText(source.path), binding?.selector || {});
  if (binding?.kind === 'INDEX_REF' || binding?.kind === 'INDEX_MATCH') {
    const root = readJson(source.path);
    const rows = Array.isArray(root?.[binding.index]) ? root[binding.index] : [];
    if (binding.kind === 'INDEX_REF') {
      const found = rows.filter((row) => row?.id === binding.item_id);
      if (found.length !== 1) throw new Error(`XIZONG_COGNITIVE_PROJECTION_INDEX_REF:${binding.item_id}`);
      return found[0];
    }
    const where = binding?.where || {};
    return rows.filter((row) => Object.entries(where).every(([field, wanted]) => {
      try { return dotGet(row, field) === wanted; } catch { return false; }
    }));
  }
  throw new Error(`XIZONG_COGNITIVE_PROJECTION_BINDING_UNSUPPORTED:${binding?.kind || 'unknown'}`);
}

function blockAsset(systemId, blockId) {
  const key = `${systemId}:${blockId}`;
  if (assetCache.has(key)) return assetCache.get(key);
  const slot = manifest()?.systems?.[systemId];
  if (!slot) {
    assetCache.set(key, null);
    return null;
  }
  for (const relative of slot.blocks || []) {
    const assetPath = `${PROJECTION_ROOT}/${relative}`;
    const asset = readJson(assetPath);
    if (asset?.block_id !== blockId) continue;
    const record = { asset, assetPath, assetHash: sha256(readText(assetPath)) };
    assetCache.set(key, record);
    return record;
  }
  assetCache.set(key, null);
  return null;
}

function normalizedObject(asset, raw, block) {
  const value = resolveBinding(asset, raw.binding, block);
  return {
    objectId: raw.object_id,
    role: raw.role,
    geometry: raw.geometry,
    stageRole: raw.stage_role || 'CONTEXT',
    answerBearing: Boolean(raw.answer_bearing),
    bindingKind: raw.binding?.kind || '',
    bindingRole: raw.binding?.role || '',
    referenceOnly: canonicalGuideBinding(raw.binding),
    value
  };
}

export function loadXizongBlockCognitiveProjection(system, block, viewName = 'BLOCK_ORIENT') {
  if (!system?.systemId || !block?.blockId) return null;
  const record = blockAsset(system.systemId, block.blockId);
  if (!record) return null;
  const { asset, assetPath, assetHash } = record;
  if (!String(asset?.schema || '').startsWith('kianos.xizong.cognitive_projection.block.')) {
    throw new Error(`XIZONG_COGNITIVE_PROJECTION_SCHEMA:${assetPath}`);
  }
  const view = asset?.views?.[viewName];
  if (!view) throw new Error(`XIZONG_COGNITIVE_PROJECTION_VIEW_MISSING:${assetPath}:${viewName}`);
  const byId = new Map((asset.objects || []).map((object) => [object.object_id, object]));
  const selected = (view.object_ids || view.block_object_ids || []).map((id) => {
    const raw = byId.get(id);
    if (!raw) throw new Error(`XIZONG_COGNITIVE_PROJECTION_OBJECT_MISSING:${assetPath}:${id}`);
    return normalizedObject(asset, raw, block);
  });
  return {
    schema: asset.schema,
    status: asset.status,
    projectionLevel: asset.projection_level || '',
    systemId: system.systemId,
    blockId: block.blockId,
    viewName,
    assetPath,
    assetHash,
    primaryObjects: selected.filter((object) => !object.referenceOnly),
    referenceObjects: selected.filter((object) => object.referenceOnly),
    learningSupportKeys: Array.isArray(view.learning_support_keys) ? view.learning_support_keys : [],
    presentationPolicy: 'SEMANTIC_OBJECTS_PRIMARY_CANONICAL_GUIDE_REFERENCE_ONLY'
  };
}
