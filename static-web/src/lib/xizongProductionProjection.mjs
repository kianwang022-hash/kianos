import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
    if (!/^[a-f0-9]{40}$/.test(String(expected || '')) || expected !== actual) fail('STRICT_SOURCE_STALE', source.path);
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

function derivedBaselineProjection(canonicalBlock, semanticBlock) {
  const problem = String(
    canonicalBlock?.centerQuestion
    || semanticBlock?.attention?.currentProblem
    || semanticBlock?.learning?.firstPassFocus
    || canonicalBlock?.title
    || ''
  ).trim();
  const stageObjects = problem
    ? [{
      objectId: `${canonicalBlock.blockId}-derived-problem`,
      role: 'PROBLEM',
      geometry: 'TEXT_STRUCTURE',
      stageRole: 'PRIMARY_STAGE',
      answerBearing: false,
      placement: 'STAGE',
      referenceOnly: false,
      referenceMessage: '',
      referenceSourcePath: '',
      html: marked.parse(problem, { gfm: true }),
      items: []
    }]
    : [];
  return {
    available: stageObjects.length > 0,
    compiled: false,
    materialized: false,
    derived: true,
    status: 'DERIVED_BASELINE_CURRENT',
    assetPath: null,
    projectionLevel: 'SHARED_SEMANTIC_BASELINE',
    stageObjects,
    locationObjects: [],
    referenceObjects: []
  };
}

export function resolveXizongBlockCognitiveProjection(canonicalBlock, semanticBlock) {
  const found = projectionAssetForBlock(canonicalBlock.systemId, canonicalBlock.blockId);
  if (!found) return derivedBaselineProjection(canonicalBlock, semanticBlock);

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
    available: true,
    compiled: true,
    materialized: true,
    derived: false,
    status: String(found.asset.status || ''),
    assetPath: found.assetPath,
    projectionLevel: String(found.asset.projection_level || ''),
    stageObjects: resolved.filter((row) => row.placement === 'STAGE'),
    locationObjects: resolved.filter((row) => row.placement === 'LOCATION'),
    referenceObjects: resolved.filter((row) => row.placement === 'REFERENCE')
  };
}

const SURGERY_SOURCE_MAP = 'content/xizong/knowledge/learner/surgery-27-source-map.json';

function cleanMarkdownCell(value) {
  return String(value || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

function kpOrdinalsFromText(value) {
  const out = [];
  const source = String(value || '');
  const pattern = /KP\s*0*(\d+)(?:\s*[–—-]\s*(?:KP\s*)?0*(\d+))?/gi;
  for (const match of source.matchAll(pattern)) {
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end < start) continue;
    for (let value = start; value <= end; value += 1) out.push(value);
  }
  return [...new Set(out)];
}

function looksLikeOutlineIdentity(value) {
  return /(?:\b(?:PHY|IM|SUR|PATH|SURG)[-\s]?U\d|(?:生理(?:学)?|病理(?:学)?|内科(?:学)?|外科(?:学)?|Physiology|Pathology|Internal(?:\s+Medicine)?|Surgery)\s*[- ]?U\d)/i.test(String(value || ''));
}

function normalizeOutlineHeading(value) {
  const raw = cleanMarkdownCell(value)
    .replace(/^\d+(?:\.\d+)*\s*/, '')
    .replace(/^[｜|]\s*/, '');
  return cleanMarkdownCell(raw.split(/[｜|]/)[0]);
}

function singleOutlinePrimary(value) {
  const raw = cleanMarkdownCell(value);
  if (!raw) return '';
  const hits = [...raw.matchAll(/U\s*0*(\d+)/gi)];
  if (hits.length !== 1 || /U\s*\d+\s*[–—-]\s*U?\s*\d+/i.test(raw)) return '';
  return raw;
}

function outlinePrimaryUnitCounts(markdown, headings, lines) {
  const units = [];
  const ownerSections = headings.filter((row) => /^(?:Outline Primary|Outline Coverage)$/i.test(row.title.trim()));
  for (const section of ownerSections) {
    const endLine = headings.find((row) => row.index > section.index && row.level <= section.level)?.index ?? lines.length;
    for (let index = section.index + 1; index < endLine; index += 1) {
      const raw = cleanMarkdownCell(lines[index]).replace(/^[-*+]\s*/, '');
      if (!looksLikeOutlineIdentity(raw)) continue;
      const countMatch = raw.match(/=\s*(\d+)\b/) || raw.match(/\b(\d+)\s*\/\s*\1\b/);
      if (!countMatch) continue;
      const count = Number(countMatch[1]);
      if (!Number.isInteger(count) || count <= 0) continue;
      let identity = raw.includes('=') ? raw.split('=')[0] : raw.split(/[：:]/)[0];
      identity = cleanMarkdownCell(identity.replace(/[;；,，]$/, ''));
      if (!looksLikeOutlineIdentity(identity)) continue;
      if (!units.some((row) => row.identity === identity && row.count === count)) units.push({ identity, count });
    }
  }
  return units;
}

function reconcileOutlineRowsByCounts(units, rows, add) {
  if (!units.length || !rows.length) return;
  const unitTotal = units.reduce((sum, row) => sum + row.count, 0);
  const rowTotal = rows.reduce((sum, row) => sum + row.count, 0);
  if (unitTotal !== rowTotal) return;
  let unitCum = 0;
  const unitBoundaries = new Map();
  units.forEach((row, index) => {
    unitCum += row.count;
    unitBoundaries.set(unitCum, index + 1);
  });
  let rowCum = 0;
  const rowBoundaries = new Map();
  rows.forEach((row, index) => {
    rowCum += row.count;
    rowBoundaries.set(rowCum, index + 1);
  });
  const common = [...unitBoundaries.keys()].filter((value) => rowBoundaries.has(value)).sort((a, b) => a - b);
  let prevUnit = 0;
  let prevRow = 0;
  for (const boundary of common) {
    const nextUnit = unitBoundaries.get(boundary);
    const nextRow = rowBoundaries.get(boundary);
    const identities = units.slice(prevUnit, nextUnit).map((row) => row.identity);
    if (identities.length) {
      const locator = identities.join(' + ');
      rows.slice(prevRow, nextRow).forEach((row) => row.ordinals.forEach((ordinal) => add(ordinal, locator)));
    }
    prevUnit = nextUnit;
    prevRow = nextRow;
  }
}

function derivedOutlineLocatorByOrdinal(canonicalBlock) {
  const out = new Map();
  if (!canonicalBlock?.sourcePath || !exists(canonicalBlock.sourcePath)) return out;
  const markdown = readText(canonicalBlock.sourcePath);
  const { lines, headings } = markdownHeadings(markdown);
  const coverageSections = headings.filter((row) => /Outline Coverage/i.test(row.title));
  const fallback = singleOutlinePrimary(canonicalBlock.outlinePrimary);
  const add = (ordinal, locator) => {
    if (!Number.isInteger(ordinal) || ordinal <= 0 || !locator) return;
    const current = out.get(ordinal) || [];
    if (!current.includes(locator)) current.push(locator);
    out.set(ordinal, current);
  };
  const pendingRows = [];
  for (const coverage of coverageSections) {
    const endLine = headings.find((row) => row.index > coverage.index && row.level <= coverage.level)?.index ?? lines.length;
    let context = '';
    for (let index = coverage.index; index < Math.min(lines.length, endLine); index += 1) {
      const line = lines[index];
      const heading = line.match(/^#{2,4}\s+(.+?)\s*$/);
      if (heading) {
        const candidate = normalizeOutlineHeading(heading[1]);
        context = looksLikeOutlineIdentity(candidate) ? candidate : '';
        continue;
      }
      if (!/^\|.*\|\s*$/.test(line) || /^\|\s*[-:]+/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map(cleanMarkdownCell);
      if (!cells.length || /^(?:Outline|Outline范围|Outline 范围|Outline身份|原题身份|当前Primary合计|D11 Primary合计|合计)$/i.test(cells[0])) continue;
      const rowText = cells.join(' | ');
      if (/explicit[_ ](?:deferred|recall)|owned_by/i.test(rowText)) continue;
      const ordinals = kpOrdinalsFromText(rowText);
      if (!ordinals.length) continue;
      const rowIdentity = looksLikeOutlineIdentity(cells[0]) ? cells[0] : '';
      const locator = rowIdentity || context || fallback;
      if (locator) {
        ordinals.forEach((ordinal) => add(ordinal, locator));
        continue;
      }
      const count = Number(String(cells[1] || '').replace(/[^0-9]/g, ''));
      if (Number.isInteger(count) && count > 0) pendingRows.push({ count, ordinals });
    }
  }
  if (pendingRows.length) reconcileOutlineRowsByCounts(outlinePrimaryUnitCounts(markdown, headings, lines), pendingRows, add);
  if (fallback) {
    for (const kp of canonicalBlock.kpRecords || []) {
      const ordinal = Number(kp.ordinal);
      if (!out.has(ordinal)) out.set(ordinal, [fallback]);
    }
  }
  return new Map([...out].map(([ordinal, locators]) => [ordinal, locators.join(' · ')]));
}

function kpRangeSpecOrdinals(spec, detail) {
  const hits = [...String(spec || '').matchAll(/KP(\d+)/g)].map((match) => Number(match[1]));
  if (!hits.length || hits.some((value) => !Number.isInteger(value) || value <= 0)) fail('SURGERY_SOURCE_KP_RANGE_INVALID', detail);
  if (hits.length === 1) return [hits[0]];
  const [start, end] = hits;
  if (end < start) fail('SURGERY_SOURCE_KP_RANGE_REVERSED', detail);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function canonicalLectureLocatorByOrdinal(canonicalBlock) {
  const out = new Map();
  if (!canonicalBlock?.sourcePath || !exists(canonicalBlock.sourcePath)) return out;
  const markdown = readText(canonicalBlock.sourcePath);
  for (const line of markdown.split('\n')) {
    if (!/^\|.*\|\s*$/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(cleanMarkdownCell);
    if (cells.length < 2) continue;
    const locator = cells[0];
    if (!/(?:\b(?:PHY|SUR|IM|PATH)\s*P\d|(?:生理|病理|内科|外科)(?:\s+Lecture)?\s*P\d)/i.test(locator)) continue;
    const ordinals = kpOrdinalsFromText(cells.slice(1).join(' | '));
    if (!ordinals.length) continue;
    for (const ordinal of ordinals) {
      const current = out.get(ordinal) || [];
      if (!current.includes(locator)) current.push(locator);
      out.set(ordinal, current);
    }
  }
  return new Map([...out].map(([ordinal, locators]) => [ordinal, {
    locator: locators.join(' · '),
    owner: canonicalBlock.sourcePath
  }]));
}

function derivedSourceLocatorByOrdinal(canonicalBlock, semanticBlock) {
  const out = new Map();
  const set = (ordinal, locator, owner, detail) => {
    const key = Number(ordinal);
    if (!Number.isInteger(key) || key <= 0) fail('SOURCE_KP_ORDINAL_INVALID', detail);
    if (out.has(key)) fail('SOURCE_KP_LOCATOR_AMBIGUOUS', `${canonicalBlock.blockId}:KP${key}`);
    out.set(key, { locator, owner });
  };

  if (semanticBlock?.sourceContact?.mode === 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT') {
    const sourceName = String(semanticBlock?.sourceContact?.sourceName || '').trim();
    const owner = String(semanticBlock?.sourceContact?.sourceMapOwner || '').trim();
    if (!sourceName || !owner) fail('BIOCHEMISTRY_SOURCE_IDENTITY_MISSING', semanticBlock?.blockId || '');
    for (const segment of semanticBlock?.sourceContact?.segments || []) {
      const pages = Array.isArray(segment?.pdf) ? segment.pdf.map(Number) : [];
      if (pages.length !== 2 || !pages.every(Number.isFinite)) fail('BIOCHEMISTRY_SOURCE_PAGES_INVALID', segment?.sourceUnitId || semanticBlock?.blockId || '');
      const page = (value) => `P${String(value).padStart(3, '0')}`;
      const pageRange = pages[0] === pages[1] ? page(pages[0]) : `${page(pages[0])}–${page(pages[1])}`;
      const locator = `${sourceName} · PDF ${pageRange}`;
      for (const ordinal of segment?.kpOrdinals || []) set(ordinal, locator, owner, segment?.sourceUnitId || semanticBlock?.blockId || '');
    }
  }

  if (canonicalBlock.systemId === 'digestive-metabolic-endocrine-tumor' && exists(SURGERY_SOURCE_MAP)) {
    const sourceMap = readJson(SURGERY_SOURCE_MAP);
    const sourceName = String(sourceMap?.source_identity?.visible_name_or_source_id || '').trim();
    if (!sourceName) fail('SURGERY_SOURCE_NAME_MISSING', canonicalBlock.blockId);
    for (const unit of sourceMap?.units || []) {
      const architecture = unit?.architecture_v3 || {};
      if (architecture?.exact_binding_status !== 'REVIEWED_DIRECT_BINDING') continue;
      for (const binding of architecture?.bindings || []) {
        if (String(binding?.system || '') !== 'B' || String(binding?.block || '') !== canonicalBlock.blockId) continue;
        const locator = `${sourceName} · ${String(unit?.id || '')} · PDF ${String(unit?.pdf_pages || '')}`;
        for (const spec of binding?.kp_ranges || []) {
          for (const ordinal of kpRangeSpecOrdinals(spec, `${unit?.id || ''}:${canonicalBlock.blockId}:${spec}`)) {
            set(ordinal, locator, SURGERY_SOURCE_MAP, unit?.id || canonicalBlock.blockId);
          }
        }
      }
    }
  }
  return out;
}

export function buildXizongProductionBlock(canonicalBlock) {
  const { block: semanticBlock } = loadXizongSemanticBlock(canonicalBlock.systemId, canonicalBlock.blockId);
  const sourceLocatorByOrdinal = derivedSourceLocatorByOrdinal(canonicalBlock, semanticBlock);
  const lectureLocatorByOrdinal = canonicalLectureLocatorByOrdinal(canonicalBlock);
  const outlineLocatorByOrdinal = derivedOutlineLocatorByOrdinal(canonicalBlock);
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
    const ordinal = Number(kp.ordinal);
    const group = groupForOrdinal.get(ordinal);
    if (!group) fail('SEMANTIC_KP_GROUP_MISSING', kp.kpId);
    const canonicalSourceLocator = String(kp.sourceLocator || '').trim();
    const canonicalOutlineLocator = String(kp.outlineLocator || '').trim();
    const derivedSource = sourceLocatorByOrdinal.get(ordinal) || null;
    const lectureLedgerSource = lectureLocatorByOrdinal.get(ordinal) || null;
    const derivedOutlineLocator = outlineLocatorByOrdinal.get(ordinal) || '';
    return {
      ...kp,
      sourceLocator: canonicalSourceLocator || derivedSource?.locator || lectureLedgerSource?.locator || '',
      sourceLocatorAuthority: canonicalSourceLocator
        ? 'CANONICAL_BLOCK'
        : derivedSource
          ? 'CURRENT_SOURCE_MAP'
          : lectureLedgerSource
            ? 'CANONICAL_LECTURE_LEDGER'
            : 'UNRESOLVED',
      sourceLocatorOwner: canonicalSourceLocator
        ? canonicalBlock.sourcePath
        : derivedSource?.owner || lectureLedgerSource?.owner || '',
      outlineLocator: canonicalOutlineLocator || derivedOutlineLocator,
      outlineLocatorAuthority: canonicalOutlineLocator
        ? 'CANONICAL_KP'
        : derivedOutlineLocator
          ? 'CANONICAL_OUTLINE_LEDGER'
          : 'UNRESOLVED',
      outlineLocatorOwner: canonicalOutlineLocator || derivedOutlineLocator ? canonicalBlock.sourcePath : '',
      groupId: group.groupId,
      groupLabel: group.label
    };
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
