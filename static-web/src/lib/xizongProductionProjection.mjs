import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { loadXizongSemanticBlock, XIZONG_SEMANTIC_ADAPTER_SCHEMA } from './xizongSemanticAdapter.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const PROJECTION_MANIFEST = 'content/xizong/projection/manifest.json';
const PROJECTION_ROOT = 'content/xizong/projection';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_PRODUCTION_PROJECTION_${code}${detail ? `:${detail}` : ''}`);
}

function jsonPointer(value, pointer) {
  if (pointer === '') return value;
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) fail('JSON_POINTER_INVALID', String(pointer));
  let current = value;
  for (const raw of pointer.slice(1).split('/')) {
    if (/~(?![01])/.test(raw)) fail('JSON_POINTER_ESCAPE_INVALID', pointer);
    const part = raw.replaceAll('~1', '/').replaceAll('~0', '~');
    if (Array.isArray(current)) {
      if (!/^(?:0|[1-9]\d*)$/.test(part)) fail('JSON_POINTER_ARRAY_INDEX_INVALID', pointer);
      const index = Number(part);
      if (index >= current.length) fail('JSON_POINTER_MISSING', pointer);
      current = current[index];
    } else if (current && typeof current === 'object') {
      if (!Object.prototype.hasOwnProperty.call(current, part)) fail('JSON_POINTER_MISSING', pointer);
      current = current[part];
    } else {
      fail('JSON_POINTER_SCALAR', pointer);
    }
  }
  return current;
}

function markdownHeadings(text) {
  const lines = String(text).split('\n');
  const headings = [];
  let fence = null;
  lines.forEach((line, index) => {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const token = fenceMatch[1];
      if (!fence) fence = token;
      else if (token[0] === fence[0] && token.length >= fence.length) fence = null;
      return;
    }
    if (fence) return;
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!match) return;
    headings.push({ index, level: match[1].length, title: match[2].replace(/\s+#+$/, '').trim() });
  });
  return { lines, headings };
}

function selectHeadingExact(text, title) {
  const { lines, headings } = markdownHeadings(text);
  const matches = headings.filter((row) => row.title === title);
  if (matches.length !== 1) fail('HEADING_EXACT_UNRESOLVED', title);
  const start = matches[0];
  const end = headings.find((row) => row.index > start.index && row.level <= start.level)?.index ?? lines.length;
  return lines.slice(start.index, end).join('\n').trim();
}

function selectLabeledBlockquote(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^>\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*[：:](?:\\*\\*)?\\s*(.+)$`, 'm');
  const rows = String(text).split('\n');
  const indexes = rows.map((line, index) => ({ line, index })).filter(({ line }) => pattern.test(line));
  if (indexes.length !== 1) fail('LABELED_BLOCKQUOTE_UNRESOLVED', label);
  const match = indexes[0].line.match(pattern);
  const body = [match?.[1] || ''];
  for (let index = indexes[0].index + 1; index < rows.length; index += 1) {
    const line = rows[index];
    if (!line.startsWith('>') || !line.slice(1).trim()) break;
    body.push(line.slice(1).trim());
  }
  return body.join('\n').trim();
}

function selectMarker(text, markerId) {
  const { lines, headings } = markdownHeadings(text);
  const escaped = markerId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^\\s*<!--\\s*kianos:[\\w-]+\\s+id=["']${escaped}["']\\s*-->\\s*$`);
  const matches = lines.map((line, index) => ({ line, index })).filter(({ line }) => pattern.test(line));
  if (matches.length !== 1) fail('MARKER_UNRESOLVED', markerId);
  const markerIndex = matches[0].index;
  const following = headings.find((row) => row.index > markerIndex);
  const prior = [...headings].reverse().find((row) => row.index < markerIndex);
  const owned = prior && !lines.slice(prior.index + 1, markerIndex).some((line) => line.trim()) ? prior : following;
  if (!owned) fail('MARKER_HEADING_UNRESOLVED', markerId);
  const end = headings.find((row) => row.index > owned.index && row.level <= owned.level)?.index ?? lines.length;
  return lines.slice(owned.index, end).join('\n').trim();
}

function selectStructureAfterAnchor(text, selector) {
  const anchor = String(selector?.anchor || '');
  if (!anchor) fail('STRUCTURE_ANCHOR_MISSING');
  const source = String(text);
  const first = source.indexOf(anchor);
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) fail('STRUCTURE_ANCHOR_UNRESOLVED', anchor);
  const lines = source.slice(first + anchor.length).split('\n');
  while (lines.length && (!lines[0].trim() || lines[0].trim().startsWith('<!--'))) lines.shift();
  if (!lines.length) fail('STRUCTURE_MISSING', anchor);

  const type = selector?.structure_type;
  if (type === 'CODE_BLOCK') {
    const open = lines[0].match(/^\s{0,3}(`{3,}|~{3,})/);
    if (!open) fail('STRUCTURE_CODE_BLOCK_MISSING', anchor);
    const char = open[1][0];
    const min = open[1].length;
    let end = -1;
    for (let index = 1; index < lines.length; index += 1) {
      const close = lines[index].match(/^\s*(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === char && close[1].length >= min) { end = index; break; }
    }
    if (end < 0) fail('STRUCTURE_CODE_BLOCK_UNCLOSED', anchor);
    return lines.slice(0, end + 1).join('\n').trim();
  }

  if (type === 'MARKDOWN_TABLE') {
    const output = [];
    for (const line of lines) {
      if (!line.trim().startsWith('|')) break;
      output.push(line);
    }
    if (output.length < 2) fail('STRUCTURE_TABLE_MISSING', anchor);
    return output.join('\n').trim();
  }

  fail('STRUCTURE_TYPE_UNSUPPORTED', String(type || ''));
}

function resolveDerivedFragment(sourceText, selector) {
  if (!selector || typeof selector !== 'object') fail('DERIVED_SELECTOR_INVALID');
  if (selector.type === 'HEADING_EXACT') return selectHeadingExact(sourceText, String(selector.value || ''));
  if (selector.type === 'LABELED_BLOCKQUOTE') return selectLabeledBlockquote(sourceText, String(selector.label || ''));
  if (selector.type === 'MARKER_ID') return selectMarker(sourceText, String(selector.value || ''));
  if (selector.type === 'STRUCTURE_AFTER_ANCHOR') return selectStructureAfterAnchor(sourceText, selector);
  fail('DERIVED_SELECTOR_UNSUPPORTED', String(selector.type || ''));
}

function semanticLogicMap(semanticBlock) {
  return semanticBlock.logicGroups.map((group) => ({ id: group.groupId, label: group.label }));
}

function sourceRegistry(asset) {
  return new Map((asset?.sources || []).map((row) => [row.id, row]));
}

function resolveBinding(asset, binding, canonicalBlock, semanticBlock) {
  if (!binding || typeof binding !== 'object') fail('BINDING_INVALID', asset?.block_id || 'unknown');
  const sources = sourceRegistry(asset);

  if (binding.kind === 'OWNER_REF') {
    if (binding.owner_type === 'BLOCK' && binding.role === 'CENTER_QUESTION') return canonicalBlock.centerQuestion;
    if (binding.owner_type === 'BLOCK' && binding.role === 'CANONICAL_GUIDE') {
      return {
        referenceOnly: true,
        sourcePath: canonicalBlock.sourcePath,
        message: '完整 Current Block Core 保留为参考；连续解释仍由原讲义 / MarginNote 承担。'
      };
    }
    if (binding.owner_type === 'LOGIC_GROUP_SET') return semanticLogicMap(semanticBlock);
    if (binding.owner_type === 'BLOCK') return { id: semanticBlock.blockId, label: semanticBlock.label, title: semanticBlock.title };
    fail('OWNER_REF_UNSUPPORTED', `${binding.owner_type || ''}:${binding.role || ''}`);
  }

  const source = sources.get(binding.source_id);
  if (!source?.path || !exists(source.path)) fail('SOURCE_UNRESOLVED', String(binding.source_id || ''));

  if (binding.kind === 'FIELD_REF') {
    const pointer = binding?.selector?.value;
    // Old Projection assets may still point at a System logic_index representation.
    // Current accepted Learning topology wins; never re-introduce contiguous-only LG semantics here.
    if (typeof pointer === 'string' && pointer.includes('/logic_index/') && pointer.endsWith(`/${semanticBlock.blockId}`)) {
      return semanticLogicMap(semanticBlock);
    }
    return jsonPointer(readJson(source.path), pointer);
  }

  if (binding.kind === 'DERIVED_FRAGMENT') {
    return resolveDerivedFragment(readText(source.path), binding.selector);
  }

  fail('BINDING_KIND_UNSUPPORTED', String(binding.kind || ''));
}

function projectionAssetForBlock(systemId, blockId) {
  if (!exists(PROJECTION_MANIFEST)) return null;
  const manifest = readJson(PROJECTION_MANIFEST);
  const system = manifest?.systems?.[systemId];
  if (!system) return null;
  for (const shortPath of system.blocks || []) {
    const assetPath = `${PROJECTION_ROOT}/${shortPath}`;
    if (!exists(assetPath)) fail('ASSET_MISSING', assetPath);
    const asset = readJson(assetPath);
    if (asset?.block_id === blockId) return { manifest, assetPath, asset };
  }
  return null;
}

function presentationPlacement(object, value) {
  if (value?.referenceOnly) return 'REFERENCE';
  if (Array.isArray(value) && object?.role === 'MAP') return 'LOCATION';
  return 'STAGE';
}

function presentationObject(object, value) {
  const placement = presentationPlacement(object, value);
  const referenceOnly = Boolean(value?.referenceOnly);
  let html = '';
  let items = [];
  if (!referenceOnly && typeof value === 'string') html = marked.parse(value, { gfm: true });
  else if (Array.isArray(value)) {
    items = value.map((row) => ({
      id: String(row?.id || row?.groupId || ''),
      label: String(row?.label || row?.title || row?.id || '')
    })).filter((row) => row.id || row.label);
  }
  return {
    objectId: String(object?.object_id || ''),
    role: String(object?.role || ''),
    geometry: String(object?.geometry || ''),
    stageRole: String(object?.stage_role || ''),
    answerBearing: object?.answer_bearing === true,
    placement,
    referenceOnly,
    referenceMessage: referenceOnly ? String(value?.message || '') : '',
    referenceSourcePath: referenceOnly ? String(value?.sourcePath || '') : '',
    html,
    items
  };
}

export function loadCompiledXizongProjectionAsset(systemId, blockId) {
  return projectionAssetForBlock(systemId, blockId);
}

export function resolveXizongBlockCognitiveProjection(canonicalBlock, semanticBlock) {
  const found = projectionAssetForBlock(canonicalBlock.systemId, canonicalBlock.blockId);
  if (!found) {
    return {
      compiled: false,
      status: 'ELIGIBLE_OR_CURRENT_BUT_UNCOMPILED',
      assetPath: null,
      stageObjects: [],
      locationObjects: [],
      referenceObjects: []
    };
  }

  const view = found.asset?.views?.BLOCK_ORIENT;
  if (!view || !Array.isArray(view.object_ids)) fail('BLOCK_ORIENT_VIEW_MISSING', canonicalBlock.blockId);
  const objectById = new Map((found.asset.objects || []).map((row) => [row.object_id, row]));
  const resolved = view.object_ids.map((objectId) => {
    const object = objectById.get(objectId);
    if (!object) fail('VIEW_OBJECT_MISSING', `${canonicalBlock.blockId}:${objectId}`);
    const value = resolveBinding(found.asset, object.binding, canonicalBlock, semanticBlock);
    return presentationObject(object, value);
  });

  return {
    compiled: true,
    status: String(found.asset.status || ''),
    assetPath: found.assetPath,
    projectionLevel: String(found.asset.projection_level || ''),
    stageObjects: resolved.filter((row) => row.placement === 'STAGE'),
    locationObjects: resolved.filter((row) => row.placement === 'LOCATION'),
    referenceObjects: resolved.filter((row) => row.placement === 'REFERENCE')
  };
}

export function buildXizongProductionBlock(canonicalBlock) {
  const { block: semanticBlock } = loadXizongSemanticBlock(canonicalBlock.systemId, canonicalBlock.blockId);
  const kpByOrdinal = new Map((canonicalBlock.kpRecords || []).map((kp) => [Number(kp.ordinal), { ...kp }]));
  const groupForOrdinal = new Map();
  const logicGroups = semanticBlock.logicGroups.map((group) => {
    const kpIds = group.kpOrdinals.map((ordinal) => {
      const kp = kpByOrdinal.get(Number(ordinal));
      if (!kp) fail('SEMANTIC_KP_UNRESOLVED', `${canonicalBlock.blockId}:kp${ordinal}`);
      groupForOrdinal.set(Number(ordinal), group);
      return kp.kpId;
    });
    return {
      groupId: group.groupId,
      order: group.order,
      label: group.label,
      start: Math.min(...group.kpOrdinals),
      end: Math.max(...group.kpOrdinals),
      kpIds,
      kpCount: kpIds.length,
      membershipMode: group.membershipMode,
      kpOrdinals: [...group.kpOrdinals],
      goal: group.goal,
      closure: group.closure,
      continuityRationale: group.continuityRationale,
      jobs: [...group.jobs]
    };
  });

  const kpRecords = (canonicalBlock.kpRecords || []).map((kp) => {
    const group = groupForOrdinal.get(Number(kp.ordinal));
    if (!group) fail('SEMANTIC_KP_GROUP_MISSING', kp.kpId);
    return { ...kp, groupId: group.groupId, groupLabel: group.label };
  });

  const cognitiveProjection = resolveXizongBlockCognitiveProjection(canonicalBlock, semanticBlock);
  return {
    ...canonicalBlock,
    semanticAdapterSchema: XIZONG_SEMANTIC_ADAPTER_SCHEMA,
    logicGroups,
    kpRecords,
    sourceContact: semanticBlock.sourceContact,
    retrievalPoints: semanticBlock.retrievalPoints,
    ttsx: semanticBlock.ttsx,
    attention: semanticBlock.attention,
    semanticVisualGates: semanticBlock.visualGates,
    semanticPrecisionCues: semanticBlock.precisionCues,
    semanticExtensionRefs: semanticBlock.extensionRefs,
    cognitiveProjection
  };
}
