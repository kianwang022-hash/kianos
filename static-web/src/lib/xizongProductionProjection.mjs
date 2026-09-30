import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import { loadXizongSemanticBlock, XIZONG_SEMANTIC_ADAPTER_SCHEMA } from './xizongSemanticAdapter.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const PROJECTION_MANIFEST = 'content/xizong/projection/manifest.json';
const PROJECTION_ROOT = 'content/xizong/projection';
const SHARED_FIELDS = 'content/xizong/knowledge/learner/shared-fields.json';
const candidateRuntime = process.env.KIANOS_CANDIDATE_RUNTIME === '1';
const candidateHeadBlobCache = new Map();

function candidateHeadBlob(relativePath) {
  if (!candidateRuntime) return null;
  if (candidateHeadBlobCache.has(relativePath)) return candidateHeadBlobCache.get(relativePath);
  let sha = null;
  try {
    const value = execFileSync('git', ['rev-parse', 'HEAD:' + relativePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    if (/^[a-f0-9]{40}$/.test(value)) sha = value;
  } catch {}
  candidateHeadBlobCache.set(relativePath, sha);
  return sha;
}

function candidateDirtySourceAllowed(relativePath, expected) {
  return candidateRuntime && candidateHeadBlob(relativePath) === expected;
}

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

  if (type === 'TABLE' || type === 'MARKDOWN_TABLE') {
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

function cleanExplicitAttentionText(value) {
  return String(value || '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function appendExplicitAttention(rows, seen, {
  kp,
  blockId,
  role,
  semanticRole,
  cue,
  sourcePath,
  marker
}) {
  const text = cleanExplicitAttentionText(cue);
  if (!text) return;
  const key = `${role}|${semanticRole}|${text}`;
  if (seen.has(key)) return;
  seen.add(key);
  rows.push({
    id: `${kp.kpId}:attention:${rows.length + 1}`,
    kind: 'ATTENTION',
    semanticRole,
    attentionRole: role,
    answerBearing: true,
    displayPolicy: { timing: 'LEARN_ONLY' },
    anchor: {
      blockId: String(blockId || ''),
      logicGroupId: String(kp.groupId || ''),
      kpId: String(kp.kpId || '')
    },
    cue: text,
    sourcePath: String(sourcePath || ''),
    marker
  });
}

function reviewedGateAttentionForBlock(canonicalBlock, kpRecords) {
  if (!exists(SHARED_FIELDS)) return [];
  const shared = readJson(SHARED_FIELDS);
  if (!String(shared?.authority || '').startsWith('CHAT_APPROVED')) return [];
  if (String(shared?.source_bindings?.[canonicalBlock?.blockId] || '') !== String(canonicalBlock?.sourcePath || '')) return [];

  const rows = [];
  for (const kp of kpRecords) {
    const legacyId = `${canonicalBlock.blockId}-kp${String(Number(kp?.ordinal || 0)).padStart(3, '0')}`;
    const field = shared?.kp_fields?.[legacyId] || shared?.kp_fields?.[kp?.kpId] || null;
    const gates = Array.isArray(field?.retention_metadata?.gate_knowledge)
      ? field.retention_metadata.gate_knowledge
      : [];
    const coreText = cleanExplicitAttentionText(kp?.detailMarkdown || '');
    const seen = new Set();
    for (const gate of gates) {
      const anchors = [
        ...(gate?.anchor ? [gate.anchor] : []),
        ...(Array.isArray(gate?.anchors) ? gate.anchors : [])
      ].map(cleanExplicitAttentionText).filter(Boolean);
      if (!anchors.length || !anchors.every((value) => coreText.includes(value))) continue;
      appendExplicitAttention(rows, seen, {
        kp,
        blockId: canonicalBlock.blockId,
        role: 'CURRENT_TAKEAWAY',
        semanticRole: 'GATING_MEMORY',
        cue: anchors.join('；'),
        sourcePath: canonicalBlock.sourcePath,
        marker: 'SHARED_GATE_KNOWLEDGE'
      });
    }
  }
  return rows;
}

// Author labels only. A sentence merely mentioning a boundary is not a label.
function explicitAttentionLabel(value, { bold = false } = {}) {
  const label = cleanExplicitAttentionText(value).replace(/\s*\d+$/, '').trim();
  if (/^(?:边界|重要边界|使用边界|易错边界|统一边界|核心边界)$/.test(label)
    || (bold && /^[\p{L}\p{N} /-]{1,16}边界$/u.test(label))) return 'BOUNDARY';
  if (/^(?:易混|易错点|易混点)$/.test(label)) return 'CONFUSABLE';
  return '';
}

export function compileXizongExplicitAttentionCues(canonicalBlock, kpRecords = canonicalBlock?.kpRecords || []) {
  const rows = [];
  // The expanded author-label grammar is calibrated on A1 only. Other Systems
  // keep their accepted output until their own content/surface review.
  const expandedLabels = canonicalBlock?.systemId === 'circulation';
  for (const kp of kpRecords) {
    const seen = new Set();
    const lines = String(kp?.detailMarkdown || '').split('\n');
    let fence = null;
    let labeledSection = null;

    for (const rawLine of lines) {
      const fenceMatch = rawLine.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (fenceMatch) {
        const token = fenceMatch[1];
        if (!fence) fence = token;
        else if (token[0] === fence[0] && token.length >= fence.length) fence = null;
        continue;
      }
      if (fence) continue;

      const heading = rawLine.match(/^(#{1,6})\s+(.+)$/);
      if (heading && labeledSection && heading[1].length <= labeledSection.level) labeledSection = null;
      if (heading && expandedLabels) {
        const label = heading[2].replace(/^\d+\s*[｜|]\s*/, '').trim();
        const semanticRole = explicitAttentionLabel(label);
        if (semanticRole) {
          labeledSection = { level: heading[1].length, label, semanticRole };
          continue;
        }
      }
      if (labeledSection && rawLine.trim() && !/^\s*(?:---|<!--)/.test(rawLine)) {
        appendExplicitAttention(rows, seen, {
          kp, blockId: canonicalBlock?.blockId, role: 'CURRENT_TAKEAWAY',
          semanticRole: labeledSection.semanticRole,
          cue: rawLine.replace(/^\s*(?:[-*+]\s+|>\s*|\d+[.)、]\s*)/, ''),
          sourcePath: canonicalBlock?.sourcePath, marker: labeledSection.label
        });
        continue;
      }

      for (const [marker, semanticRole, pattern] of [
        ['易混', 'CONFUSABLE', /（易混[：:]\s*([^）]+)）/g],
        ['边界', 'BOUNDARY', /（边界[：:]\s*([^）]+)）/g]
      ]) {
        for (const match of rawLine.matchAll(pattern)) {
          appendExplicitAttention(rows, seen, {
            kp,
            blockId: canonicalBlock?.blockId,
            role: 'CURRENT_TAKEAWAY',
            semanticRole,
            cue: match[1],
            sourcePath: canonicalBlock?.sourcePath,
            marker
          });
        }
      }

      const normalized = rawLine
        .trim()
        .replace(/^#{1,6}\s*/, '')
        .replace(/^\d+\s*[｜|]\s*/, '')
        .trim();

      const connection = normalized.match(/^\/\/串联[：:]\s*(.+)$/);
      if (connection?.[1]) {
        appendExplicitAttention(rows, seen, {
          kp,
          blockId: canonicalBlock?.blockId,
          role: 'FUTURE_CONNECTION',
          semanticRole: 'CONNECTION_NOTICE',
          cue: connection[1],
          sourcePath: canonicalBlock?.sourcePath,
          marker: '//串联'
        });
      }

      const labeledLine = expandedLabels ? normalized.replace(/^(?:>\s*)+/, '').replace(/^(?:[-*+]\s+|\d+[.)、]\s*)/, '') : normalized;
      const boldLabel = expandedLabels && (labeledLine.match(/^\*\*([^*：:]+)\*\*\s*[：:]\s*(.+)$/)
        || labeledLine.match(/^\*\*([^*：:]+)[：:]\*\*\s*(.+)$/));
      const explicitLabel = expandedLabels
        ? boldLabel || labeledLine.match(/^([^：:]+)[：:]\s*(.+)$/)
        : labeledLine.match(/^(重要边界)[：:]\s*(.+)$/);
      const semanticRole = explicitLabel && explicitAttentionLabel(explicitLabel[1], { bold: Boolean(boldLabel) });
      if (semanticRole) {
        appendExplicitAttention(rows, seen, {
          kp,
          blockId: canonicalBlock?.blockId,
          role: 'CURRENT_TAKEAWAY',
          semanticRole,
          cue: explicitLabel[2],
          sourcePath: canonicalBlock?.sourcePath,
          marker: explicitLabel[1]
        });
      }
    }
  }
  for (const row of reviewedGateAttentionForBlock(canonicalBlock, kpRecords)) {
    rows.push({ ...row, id: `reviewed:${row.id}` });
  }
  return rows;
}

function normalizePreentryHeading(title) {
  return cleanExplicitAttentionText(title)
    .replace(/^\d+(?:\.\d+)*\s*/, '')
    .replace(/^\/\/\s*/, '')
    .trim();
}

function explicitPreentrySection(markdown, token, ownerPath) {
  const { lines, headings } = markdownHeadings(markdown);
  const matches = headings.filter((row) => {
    const title = normalizePreentryHeading(row.title);
    return title === token || title.startsWith(`${token}｜`) || title.startsWith(`${token}|`);
  });
  // Optional support fails closed locally: an ambiguous heading does not block
  // the Block or license the renderer to guess which section is authoritative.
  if (matches.length !== 1) return null;
  const start = matches[0];
  const end = headings.find((row) => row.index > start.index && row.level <= start.level)?.index ?? lines.length;
  const bodyLines = lines.slice(start.index + 1, end);
  const explicitItems = bodyLines
    .map((line) => line.match(/^\s*(?:[-*+]\s+|\d+[.)、]\s*)(.+?)\s*$/)?.[1] || '')
    .map(cleanExplicitAttentionText)
    .filter(Boolean);
  const paragraph = cleanExplicitAttentionText(
    bodyLines
      .filter((line) => !/^\s*<!--/.test(line))
      .filter((line) => !/^\s*#{1,6}\s+/.test(line))
      .join(' ')
  );
  return {
    present: true,
    ownerPath,
    anchor: start.title,
    items: explicitItems.length ? explicitItems : (paragraph ? [paragraph] : []),
    markdown: lines.slice(start.index, end).join('\n').trim()
  };
}

export function compileXizongBlockPreentry(canonicalBlock) {
  const ownerPath = String(canonicalBlock?.sourcePath || '');
  if (!ownerPath || !exists(ownerPath)) {
    return {
      framework: { present: false, ownerPath: ownerPath || null, anchor: null, items: [], markdown: '' },
      memoryRouting: { present: false, ownerPath: ownerPath || null, anchor: null, miG: [], miD: [], miGAnchor: null, miDAnchor: null }
    };
  }
  const markdown = readText(ownerPath);
  const framework = explicitPreentrySection(markdown, '总 Framework', ownerPath);
  const memoryRouting = explicitPreentrySection(markdown, 'Memory Routing', ownerPath);
  const miG = explicitPreentrySection(markdown, 'MI-G', ownerPath);
  const miD = explicitPreentrySection(markdown, 'MI-D', ownerPath);
  return {
    framework: framework || { present: false, ownerPath, anchor: null, items: [], markdown: '' },
    memoryRouting: {
      present: Boolean(memoryRouting || miG || miD),
      ownerPath,
      anchor: memoryRouting?.anchor || null,
      miG: miG?.items || [],
      miD: miD?.items || [],
      miGAnchor: miG?.anchor || null,
      miDAnchor: miD?.anchor || null
    }
  };
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
    if (binding.owner_type === 'BLOCK' && binding.id !== canonicalBlock.blockId) fail('OWNER_ID_MISMATCH', String(binding.id));
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
  const sourceBytes = fs.readFileSync(absolute(source.path));
  if (binding.kind === 'DERIVED_FRAGMENT' || source.kind === 'EXTERNAL_SOURCE_CONTRACT' || source.freshness === 'STRICT_BLOB') {
    const expected = source.blob_sha || source.baseline_blob_sha;
    const actual = crypto.createHash('sha1').update(`blob ${sourceBytes.length}\0`).update(sourceBytes).digest('hex');
    if (!/^[a-f0-9]{40}$/.test(String(expected || ''))) fail('STRICT_SOURCE_STALE', source.path);
    if (expected !== actual && !candidateDirtySourceAllowed(source.path, expected)) fail('STRICT_SOURCE_STALE', source.path);
  }


  if (binding.kind === 'FIELD_REF') {
    const pointer = binding?.selector?.value;
    // Old Projection assets may still point at a System logic_index representation.
    // Current accepted Learning topology wins; never re-introduce contiguous-only LG semantics here.
    if (typeof pointer === 'string' && pointer.includes('/logic_index/') && pointer.endsWith(`/${semanticBlock.blockId}`)) {
      return semanticLogicMap(semanticBlock);
    }
    const value = jsonPointer(JSON.parse(sourceBytes.toString('utf8')), pointer);
    const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (!binding.value_type || actualType !== binding.value_type) fail('FIELD_TYPE_MISMATCH', `${source.path}:${pointer}`);
    return value;
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

  if (found.asset.system_id !== canonicalBlock.systemId || found.asset.canonical_scope?.id !== canonicalBlock.blockId) fail('ASSET_SCOPE_MISMATCH', canonicalBlock.blockId);
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
      visualRequired: group.visualRequired === true,
      visualSourceState: String(group.visualSourceState || ''),
      continuityRationale: group.continuityRationale,
      jobs: [...group.jobs]
    };
  });

  const kpRecords = (canonicalBlock.kpRecords || []).map((kp) => {
    const group = groupForOrdinal.get(Number(kp.ordinal));
    if (!group) fail('SEMANTIC_KP_GROUP_MISSING', kp.kpId);
    return { ...kp, groupId: group.groupId, groupLabel: group.label };
  });

  const semanticAttentionCues = compileXizongExplicitAttentionCues(canonicalBlock, kpRecords);
  const blockPreentry = compileXizongBlockPreentry(canonicalBlock);
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
    semanticAttentionCues,
    blockPreentry,
    cognitiveProjection
  };
}
