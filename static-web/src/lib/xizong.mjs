import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeAcceptedLearningOwner, normalizeBlockToken, normalizeAcceptedLogicGroups, normalizeAcceptedBlockRoute, hydrateAcceptedLearningOwner } from './xizongAcceptedLearningOwner.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const KNOWLEDGE_ROOT = 'content/xizong/knowledge';
const OWNER_MANIFEST = `${KNOWLEDGE_ROOT}/manifest.json`;
const SYSTEMS_ROOT = `${KNOWLEDGE_ROOT}/systems`;
const LEARNER_ROOT = `${KNOWLEDGE_ROOT}/learner`;
const PROJECTION_MANIFEST = 'content/xizong/projection/manifest.json';
const BUILD_CACHE_ENABLED = process.env.KIANOS_XIZONG_BUILD_CACHE === '1';

// A candidate build sees one immutable Git worktree for its entire process.
// Cache canonical owner reads/projections only within that process; a new
// release/build gets a fresh module graph and therefore a fresh cache.
let currentManifestCache = null;
let projectionManifestCache = null;
let systemDirectoryCache = null;
const learningIdentityCache = new Map();
const systemRecordCache = new Map();
const normalizedSystemCache = new Map();
const blockCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function assertCurrentManifest() {
  if (BUILD_CACHE_ENABLED && currentManifestCache) return currentManifestCache;
  if (!fs.existsSync(absolute(OWNER_MANIFEST))) throw new Error('CURRENT_XIZONG_OWNER_MANIFEST_MISSING');
  const manifest = readJson(OWNER_MANIFEST);
  if (manifest?.status !== 'CURRENT') throw new Error(`CURRENT_XIZONG_OWNER_MANIFEST_INVALID:${manifest?.status || 'unknown'}`);
  if (manifest?.owner_resolution?.system_level?.parallel_owner_forbidden !== true) {
    throw new Error('CURRENT_XIZONG_OWNER_RESOLUTION_INVALID');
  }
  if (BUILD_CACHE_ENABLED) currentManifestCache = manifest;
  return manifest;
}

function systemIdentity(system) {
  return {
    systemId: system?.system_id || system?.identity?.system_id || '',
    canonicalId: system?.canonical_id || system?.identity?.canonical_id || '',
    title: system?.title || system?.identity?.title || ''
  };
}

function hydrateLearningOwner(learningPath, learning) {
  const hydrated = hydrateAcceptedLearningOwner({ repoRoot, learningPath, learning });
  return { raw: { ...hydrated.owner, blocks: hydrated.owner.blocks || {} }, sourceHash: hydrated.sourceHash };
}

function currentLearningIdentity(dirName) {
  if (BUILD_CACHE_ENABLED && learningIdentityCache.has(dirName)) return learningIdentityCache.get(dirName);
  const learningPath = LEARNER_ROOT + '/' + dirName + '-learning.json';
  if (!fs.existsSync(absolute(learningPath))) throw new Error('CURRENT_XIZONG_LEARNING_OWNER_MISSING:' + dirName);
  const text = readText(learningPath);
  const learningBase = JSON.parse(text);
  if (learningBase?.status !== 'CURRENT' || !String(learningBase?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error('CURRENT_XIZONG_LEARNING_OWNER_INVALID:' + dirName);
  }
  const hydrated = hydrateLearningOwner(learningPath, learningBase);
  const learning = hydrated.raw;
  const blocks = learning.blocks || {};
  const blockCount = Number(learning?.identity?.stable_block_count ?? Object.keys(blocks).length);
  const kpCount = Number(learning?.identity?.stable_kp_count);
  const logicGroupCount = Number(learning?.identity?.logic_group_count ?? Object.values(blocks).reduce((sum, block) => sum + Object.keys(block?.logic_groups || {}).length, 0));
  const result = {
    learningPath, learning,
    sourceHash: hydrated.sourceHash || sha256(text),
    blockCount: Number.isFinite(blockCount) && blockCount > 0 ? blockCount : null,
    kpCount: Number.isFinite(kpCount) && kpCount > 0 ? kpCount : null,
    logicGroupCount: Number.isFinite(logicGroupCount) && logicGroupCount > 0 ? logicGroupCount : null
  };
  if (BUILD_CACHE_ENABLED) learningIdentityCache.set(dirName, result);
  return result;
}
function isChatApproved(system) {
  return String(system?.semantic_authority || '').startsWith('CHAT_APPROVED');
}

function systemProjectionMaterialized(identity) {
  if (!fs.existsSync(absolute(PROJECTION_MANIFEST))) {
    throw new Error('CURRENT_XIZONG_PROJECTION_MANIFEST_MISSING');
  }
  const manifest = BUILD_CACHE_ENABLED && projectionManifestCache
    ? projectionManifestCache
    : readJson(PROJECTION_MANIFEST);
  if (BUILD_CACHE_ENABLED) projectionManifestCache = manifest;
  if (!String(manifest?.status || '').startsWith('CURRENT_')) {
    throw new Error(`CURRENT_XIZONG_PROJECTION_MANIFEST_INVALID:${manifest?.status || 'unknown'}`);
  }
  const projection = manifest?.systems?.[identity.systemId];
  if (!projection) return false;
  if (projection.canonical_id !== identity.canonicalId) {
    throw new Error(`CURRENT_XIZONG_PROJECTION_IDENTITY_MISMATCH:${identity.systemId}`);
  }
  return Boolean(
    String(projection.system_projection || '').trim()
    && Number(projection.block_count || 0) > 0
    && Array.isArray(projection.blocks)
    && projection.blocks.length === Number(projection.block_count)
  );
}

function directBlockRoute(system, learningBlocks = {}) {
  // Display defaults only; structural identity/order has one shared interpreter.
  return normalizeAcceptedBlockRoute(system).map((row) => {
    const support = learningBlocks[row.id] || {};
    const suffix = row.id.match(/-([a-z]+)0*(\d+)$/i);
    const stableLabel = suffix ? `${suffix[1].toUpperCase()}${Number(suffix[2])}` : row.id;
    return { label: stableLabel, title: String(support.title || row.id), kp: Number(support.kp_count || 0), ...row };
  });
}

function systemDirectoryCandidates() {
  if (BUILD_CACHE_ENABLED && systemDirectoryCache) return systemDirectoryCache;
  const root = absolute(SYSTEMS_ROOT);
  if (!fs.existsSync(root)) throw new Error('CURRENT_XIZONG_SYSTEMS_ROOT_MISSING');
  const rows = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  if (BUILD_CACHE_ENABLED) systemDirectoryCache = rows;
  return rows;
}

function systemRecordFromDir(dirName) {
  if (BUILD_CACHE_ENABLED && systemRecordCache.has(dirName)) return systemRecordCache.get(dirName);
  const systemPath = `${SYSTEMS_ROOT}/${dirName}/system.json`;
  if (!fs.existsSync(absolute(systemPath))) {
    if (BUILD_CACHE_ENABLED) systemRecordCache.set(dirName, null);
    return null;
  }
  const text = readText(systemPath);
  const system = JSON.parse(text);
  const identity = systemIdentity(system);
  if (!identity.systemId || !identity.title || !isChatApproved(system)) {
    if (BUILD_CACHE_ENABLED) systemRecordCache.set(dirName, null);
    return null;
  }
  const record = {
    dirName,
    systemPath,
    system,
    identity,
    sourceHash: sha256(text),
    projectionAccepted: systemProjectionMaterialized(identity)
  };
  if (BUILD_CACHE_ENABLED) systemRecordCache.set(dirName, record);
  return record;
}

function blockOrdinalFromFile(filename) {
  const text = String(filename);
  const match = text.match(/(?:^|_)Block(\d+)_/i) || text.match(/(?:^|_)H0?(\d+)_/i);
  return match ? Number(match[1]) : null;
}

function blockOrdinalFromId(blockId) {
  const match = String(blockId).match(/-(?:r|b|h)(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function blockFiles(dirName) {
  const blocksPath = `${SYSTEMS_ROOT}/${dirName}/blocks`;
  if (!fs.existsSync(absolute(blocksPath))) throw new Error(`CURRENT_XIZONG_BLOCKS_MISSING:${dirName}`);
  return fs.readdirSync(absolute(blocksPath))
    .filter((name) => /\.md$/i.test(name) && Number.isInteger(blockOrdinalFromFile(name)))
    .map((name) => ({ name, ordinal: blockOrdinalFromFile(name), path: `${blocksPath}/${name}` }))
    .sort((a, b) => a.ordinal - b.ordinal);
}

function normalizeBStableBlockId(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(?:dme-)?([dmg])0*(\d{1,2})$/i);
  return match ? `${match[1].toUpperCase()}${Number(match[2])}` : null;
}

function bBlockIdFromFile(pathName, text) {
  const front = String(text || '').startsWith('---\n')
    ? String(text).slice(0, String(text).indexOf('\n---', 4))
    : '';
  const explicit = front.match(/^block_id:\s*(\S+)\s*$/m)?.[1];
  const order = front.match(/^order:\s*(\S+)\s*$/m)?.[1];
  const fromExplicit = normalizeBStableBlockId(explicit);
  const fromOrder = normalizeBStableBlockId(order);
  const fileMatch = String(pathName).match(/(?:^|_)([DMG])0*(\d{1,2})(?=_|\.md$)/i);
  const fromFile = fileMatch ? `${fileMatch[1].toUpperCase()}${Number(fileMatch[2])}` : null;
  const candidates = [fromExplicit, fromOrder, fromFile].filter(Boolean);
  if (!candidates.length) return null;
  if (new Set(candidates).size !== 1) throw new Error(`CURRENT_XIZONG_B_BLOCK_ID_CONFLICT:${pathName}:${candidates.join('/')}`);
  return candidates[0];
}

function bBlockFiles(dirName, route) {
  const familyDirs = ['d-d1-d23', 'm-m1-m10', 'g-g1-g5'];
  const rows = [];
  for (const family of familyDirs) {
    const root = `${SYSTEMS_ROOT}/${dirName}/${family}`;
    if (!fs.existsSync(absolute(root))) throw new Error(`CURRENT_XIZONG_B_BLOCK_FAMILY_MISSING:${family}`);
    for (const name of fs.readdirSync(absolute(root)).filter((item) => /\.md$/i.test(item))) {
      const pathName = `${root}/${name}`;
      const text = readText(pathName);
      const blockId = bBlockIdFromFile(name, text);
      if (blockId) rows.push({ name, blockId, path: pathName });
    }
  }
  const byId = new Map();
  for (const row of rows) {
    if (byId.has(row.blockId)) throw new Error(`CURRENT_XIZONG_B_BLOCK_DUPLICATE:${row.blockId}`);
    byId.set(row.blockId, row);
  }
  return route.map((row, index) => {
    const file = byId.get(String(row.id || ''));
    if (!file) throw new Error(`CURRENT_XIZONG_B_BLOCK_FILE_MISSING:${row.id}`);
    return { ...file, ordinal: index + 1 };
  });
}

function frontmatterScalar(text, key) {
  const source = String(text || '');
  if (!source.startsWith('---\n')) return '';
  const end = source.indexOf('\n---', 4);
  if (end < 0) return '';
  const front = source.slice(4, end);
  const escaped = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = front.match(new RegExp(`^${escaped}:\\s*(.+?)\\s*$`, 'm'));
  return String(match?.[1] || '').trim().replace(/^['"]|['"]$/g, '');
}

function recursiveCanonicalBlockFiles(record, route) {
  const root = `${SYSTEMS_ROOT}/${record.dirName}`;
  const candidates = [];
  const visit = (relativeDir) => {
    for (const entry of fs.readdirSync(absolute(relativeDir), { withFileTypes: true })) {
      const child = `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        const text = readText(child);
        const declaredBlockId = frontmatterScalar(text, 'block_id');
        if (!declaredBlockId) continue;
        candidates.push({
          name: entry.name,
          path: child,
          declaredBlockId,
          title: frontmatterScalar(text, 'title'),
          kpCount: Number(frontmatterScalar(text, 'kp_count') || 0) || 0
        });
      }
    }
  };
  visit(root);

  return route.map((row, index) => {
    const routeId = String(row.id || '');
    let matches = candidates.filter((file) => file.declaredBlockId === routeId);
    if (!matches.length) {
      const token = normalizeBlockToken(routeId);
      matches = candidates.filter((file) => normalizeBlockToken(file.declaredBlockId) === token);
    }
    if (matches.length !== 1) {
      throw new Error(`CURRENT_XIZONG_BLOCK_FILE_RESOLUTION_INVALID:${record.identity.systemId}:${routeId}:${matches.length}`);
    }
    return { ...matches[0], ordinal: index + 1 };
  });
}

function blockFilesForRecord(record, route) {
  if (record.identity.canonicalId === 'B') return bBlockFiles(record.dirName, route);
  try {
    const rows = blockFiles(record.dirName);
    if (rows.length === route.length) return rows;
  } catch (error) {
    if (!String(error?.message || '').startsWith('CURRENT_XIZONG_BLOCKS_MISSING:')) throw error;
  }
  return recursiveCanonicalBlockFiles(record, route);
}

function extractCenterQuestion(markdown) {
  const source = String(markdown);
  const patterns = [
    /^>\s*\*\*中心问题\*\*[：:]\s*(.+)$/m,
    /^>\s*\*\*中心问题[：:]\*\*\s*(.+)$/m
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function headingRecords(markdown) {
  return [...String(markdown).matchAll(/^\s{0,4}(#{1,4})\s+(.+)$/gm)].map((match) => ({
    index: match.index || 0,
    level: match[1].length,
    title: String(match[2] || '').trim()
  }));
}

function sectionByTitle(markdown, predicate) {
  const headings = headingRecords(markdown);
  const current = headings.find((heading) => predicate(heading.title));
  if (!current) return null;
  const end = headings.find((heading) => heading.index > current.index && heading.level <= current.level)?.index ?? markdown.length;
  return { title: current.title, markdown: markdown.slice(current.index, end).trim() };
}

function blockOpeningOrientation(markdown) {
  const explicit = sectionByTitle(markdown, (title) => /^(?:0[｜|])?.*这个 Block 到底解决什么/.test(title));
  if (explicit) return explicit;

  const source = String(markdown).replace(/^---\s*\n[\s\S]*?\n---\s*\n+/, '');
  const firstKpIndex = source.search(/^\s{0,4}(?:#{2,4})\s+KP\d+[｜|]\s*.+$/m);
  const end = firstKpIndex >= 0 ? firstKpIndex : source.length;
  const opening = source
    .slice(0, end)
    .replace(/^#\s+.+\n+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!opening) return null;
  return { title: 'Block orientation', markdown: opening };
}

function readMetadataDeclaration(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}\\*\\*[：:]?\\s*(.+)$`),
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}[：:]\\*\\*\\s*(.+)$`),
    new RegExp(`^\\s{0,4}>\\s*\\*\\*${escaped}[：:]\\s*(.+?)\\*\\*\\s*$`)
  ];
  const declarations = [];
  for (const [lineIndex, line] of String(body).split(/\r?\n/).entries()) {
    for (const [formatPriority, pattern] of patterns.entries()) {
      const match = line.match(pattern);
      if (match?.[1]?.trim()) {
        declarations.push({ value: match[1].trim(), formatPriority, lineIndex });
        break;
      }
    }
  }
  declarations.sort((a, b) => a.formatPriority - b.formatPriority || a.lineIndex - b.lineIndex);
  const values = [...new Set(declarations.map(row => row.value))];
  const conflict = values.length > 1;
  // Preserve already-effective legacy fields. Newly readable but ambiguous
  // whole-line declarations cannot silently choose a replacement. Surface the
  // exact conflicting owner text to inspection; resolving it is Content review.
  const selected = declarations[0];
  const value = conflict && selected?.formatPriority === 2 ? '' : selected?.value || '';
  return { value, ...(conflict ? { diagnostic: {
    code: 'MULTIPLE_AUTHORED_METADATA_VALUES', label, values,
    effectiveValue: value, resolution: 'CONTENT_REVIEW_REQUIRED'
  } } : {}) };
}

function readKpMetadata(body) {
  const prompt = readMetadataDeclaration(body, '主提示');
  const sourceArrow = readMetadataDeclaration(body, '讲义定位 →');
  const source = readMetadataDeclaration(body, '讲义定位');
  const outlineArrow = readMetadataDeclaration(body, 'Outline →');
  const outline = readMetadataDeclaration(body, 'Outline');
  const contentDiagnostics = [prompt, sourceArrow, source, outlineArrow, outline]
    .flatMap(row => row.diagnostic ? [row.diagnostic] : []);
  return {
    prompt: prompt.value,
    sourceLocator: sourceArrow.value || source.value,
    outlineLocator: outlineArrow.value || outline.value,
    ...(contentDiagnostics.length ? { contentDiagnostics } : {})
  };
}

function stripKpMetadata(body) {
  return String(body)
    .replace(/^\s{0,4}>\s*\*\*(?:讲义定位[^*]*|Outline[^*]*|主提示[^*]*)\*\*[：:]?.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseKps(markdown, blockId) {
  const source = String(markdown);
  const matches = [...source.matchAll(/^\s{0,4}(#{2,4})\s+(KP(\d+))[｜|]\s*(.+)$/gm)];
  const headings = headingRecords(source);
  return matches.map((match, index) => {
    const level = match[1].length;
    const start = match.index || 0;
    const afterHeading = start + match[0].length;
    const nextKp = matches[index + 1]?.index ?? source.length;
    const nextBoundary = headings.find((heading) => heading.index > start && heading.level <= level)?.index ?? source.length;
    const end = Math.min(nextKp, nextBoundary);
    const body = source.slice(afterHeading, end).trim();
    const ordinal = Number(match[3]);
    return {
      kpId: `${blockId}-kp${pad2(ordinal)}`,
      displayId: match[2],
      ordinal,
      title: String(match[4] || '').trim(),
      ...readKpMetadata(body),
      detailMarkdown: stripKpMetadata(body)
    };
  });
}

function parseKpsFromStableMarkers(markdown, blockId) {
  const source = String(markdown);
  const matches = [...source.matchAll(/^\s{0,4}(#{2,4})\s+(KP(\d+))[｜|]\s*(.+)$/gm)];
  const headings = headingRecords(source);
  const markerRows = [...source.matchAll(/<!--\s*kianos:kp\s+id=["']([^"']+)["']\s*-->/g)]
    .map((match) => ({ id: String(match[1] || ''), index: match.index || 0 }));
  if (markerRows.length !== matches.length || new Set(markerRows.map((row) => row.id)).size !== markerRows.length) {
    throw new Error(`CURRENT_XIZONG_B_KP_MARKER_COUNT_MISMATCH:${blockId}:${markerRows.length}/${matches.length}`);
  }
  return matches.map((match, index) => {
    const level = match[1].length;
    const start = match.index || 0;
    const afterHeading = start + match[0].length;
    const nextKp = matches[index + 1]?.index ?? source.length;
    const nextBoundary = headings.find((heading) => heading.index > start && heading.level <= level)?.index ?? source.length;
    const end = Math.min(nextKp, nextBoundary);
    const body = source.slice(afterHeading, end).trim();
    const ordinal = Number(match[3]);
    const suffix = `-kp${pad2(ordinal)}`;
    const candidates = markerRows.filter((row) => row.index < start && row.id.toLowerCase().endsWith(suffix));
    const marker = candidates.at(-1);
    if (!marker) throw new Error(`CURRENT_XIZONG_B_KP_MARKER_MISSING:${blockId}:KP${pad2(ordinal)}`);
    return {
      kpId: marker.id,
      displayId: match[2],
      ordinal,
      title: String(match[4] || '').trim(),
      ...readKpMetadata(body),
      detailMarkdown: stripKpMetadata(body)
    };
  });
}

function normalizeLogicGroups(system, blockId, kpRecords, blockSupport = null) {
  const accepted = normalizeAcceptedLogicGroups({ system, blockId, blockSupport, kpCount: kpRecords.length });
  const byOrdinal = new Map(kpRecords.map(kp => [kp.ordinal, kp]));
  return accepted.map(group => {
    const kpIds = group.kpOrdinals.map(ordinal => {
      const kp = byOrdinal.get(ordinal);
      if (!kp) throw new Error(`CURRENT_XIZONG_KP_UNASSIGNED:${blockId}:${ordinal}`);
      kp.groupId = group.groupId;
      kp.groupLabel = group.label;
      return kp.kpId;
    });
    return {
      ...group,
      start: Math.min(...group.kpOrdinals),
      end: Math.max(...group.kpOrdinals),
      kpIds
    };
  });
}

function normalizeFailureModes(system) {
  return (Array.isArray(system?.failure_modes) ? system.failure_modes : []).map((item, index) => {
    if (Array.isArray(item)) return { id: item[0] || `fm${index + 1}`, label: item[1] || '', chain: item[2] || '' };
    return { id: item?.id || `fm${index + 1}`, label: item?.label || '', chain: item?.chain || item?.description || '' };
  });
}

function loadLearningSupport(record) {
  const pathName = `${LEARNER_ROOT}/${String(record.identity.canonicalId).toLowerCase()}-${record.identity.systemId}-learning.json`;
  if (!fs.existsSync(absolute(pathName))) return null;
  const text = readText(pathName);
  const supportBase = JSON.parse(text);
  if (!String(supportBase?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_INVALID:${record.identity.systemId}`);
  }
  if (supportBase?.system_id !== record.identity.systemId || supportBase?.canonical_id !== record.identity.canonicalId) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_IDENTITY_MISMATCH:${record.identity.systemId}`);
  }
  const hydrated = hydrateLearningOwner(pathName, supportBase);
  const routeIds = directBlockRoute(record.system, hydrated.raw?.blocks || {}).map((row) => row.id);
  let contentPath = null;
  let contentText = '';
  let contentOwner = null;
  if (!(hydrated.raw?.blocks && Object.keys(hydrated.raw.blocks).length)) {
    const candidate = pathName.replace(/-learning\.json$/i, '-content.json');
    if (fs.existsSync(absolute(candidate))) {
      contentText = readText(candidate);
      contentOwner = JSON.parse(contentText);
      if (contentOwner?.status !== 'ACCEPTED'
        || contentOwner?.system_id !== record.identity.systemId
        || contentOwner?.canonical_id !== record.identity.canonicalId) {
        throw new Error(`CURRENT_XIZONG_CONTENT_OWNER_INVALID:${record.identity.systemId}`);
      }
      contentPath = candidate;
    }
  }
  const normalized = normalizeAcceptedLearningOwner({
    learning: hydrated.raw,
    routeIds,
    content: contentOwner
  });
  const support = normalized.owner;

  const expectedBlocks = directBlockRoute(record.system, support.blocks).map((row) => row.id);
  const actualBlocks = Object.keys(support?.blocks || {});
  if (expectedBlocks.length !== actualBlocks.length || expectedBlocks.some((id) => !actualBlocks.includes(id))) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_BLOCK_MISMATCH:${record.identity.systemId}`);
  }
  for (const blockId of expectedBlocks) {
    const blockSupport = support?.blocks?.[blockId] || {};
    const expectedGroups = (record.system?.logic_index?.[blockId] || []).map((group) => group.id);
    const actualGroups = Object.keys(blockSupport.logic_groups || {});
    if (!actualGroups.length) throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_LOGIC_MISSING:${blockId}`);
    if (expectedGroups.length) {
      if (expectedGroups.length !== actualGroups.length || expectedGroups.some((id) => !actualGroups.includes(id))) {
        throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_LOGIC_MISMATCH:${blockId}`);
      }
    } else {
      const learnerOrder = Array.isArray(blockSupport.learner_order) ? blockSupport.learner_order.map(String) : [];
      if (learnerOrder.length !== actualGroups.length || new Set(learnerOrder).size !== learnerOrder.length || learnerOrder.some((id) => !actualGroups.includes(id))) {
        throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_ORDER_MISMATCH:${blockId}`);
      }
    }
  }
  return {
    path: pathName,
    contentPath,
    schemaFamily: normalized.schemaFamily,
    blockKeyMap: normalized.blockKeyMap,
    sourceHash: contentText
      ? sha256([hydrated.sourceHash || sha256(text), contentText].join('\n'))
      : (hydrated.sourceHash || sha256(text)),
    raw: support
  };
}


function loadBiochemistrySourceLane(record, learningSupport, blocks) {
  if (record?.identity?.canonicalId !== 'B') return null;
  const lane = learningSupport?.raw?.biochemistry_first_pass_lane;
  if (!lane) return null;
  if (lane.status !== 'CURRENT_27_REACCEPTED') {
    throw new Error(`CURRENT_XIZONG_BIOCHEMISTRY_LANE_INVALID:${lane.status || 'unknown'}`);
  }

  const sourceMapPath = String(lane.source_map_owner || '').trim();
  if (!sourceMapPath || !fs.existsSync(absolute(sourceMapPath))) {
    throw new Error('CURRENT_XIZONG_BIOCHEMISTRY_SOURCE_MAP_MISSING');
  }
  const sourceMapText = readText(sourceMapPath);
  const sourceMap = JSON.parse(sourceMapText);
  if (sourceMap?.status !== 'CURRENT_27_SOURCE_ROUTING_REACCEPTED') {
    throw new Error(`CURRENT_XIZONG_BIOCHEMISTRY_SOURCE_MAP_INVALID:${sourceMap?.status || 'unknown'}`);
  }
  const sourceHash = String(sourceMap?.source?.sha256 || '').trim();
  const sourceName = String(sourceMap?.source?.visible_name || '').trim();
  if (!sourceHash || !sourceName) throw new Error('CURRENT_XIZONG_BIOCHEMISTRY_SOURCE_IDENTITY_MISSING');

  const blockById = new Map((blocks || []).map((block) => [String(block.blockId || ''), block]));
  const reviewedConnectionRoutes = (lane?.cross_system_integration?.reviewed_routes || []).map((row, index) => {
    const sourceBlocks = Array.isArray(row?.source) ? row.source.map(String) : [];
    const targets = Array.isArray(row?.targets) ? row.targets.map(String) : [];
    return {
      id: `bio-connection-${index + 1}`,
      sourceBlocks,
      targets,
      localTargetBlockIds: targets.filter((target) => blockById.has(target)),
      externalTargetRefs: targets.filter((target) => !blockById.has(target)),
      sharedModel: String(row?.shared_model || ''),
      firstPass: String(row?.first_pass || ''),
      postFormation: String(row?.post_formation || '')
    };
  }).filter((row) => row.sourceBlocks.length && row.targets.length);

  const biochemistryScope = new Set(Array.isArray(lane?.scope_blocks) ? lane.scope_blocks.map(String) : []);
  const reconstructions = (learningSupport?.raw?.system_route?.partial_system_reconstructions || [])
    .filter((row) => Array.isArray(row?.after_when_ready) && row.after_when_ready.length
      && row.after_when_ready.every((blockId) => biochemistryScope.has(String(blockId))));

  const units = (sourceMap.source_units || []).map((unit, index) => {
    const canonical = Array.isArray(unit?.canonical_content) ? unit.canonical_content : [];
    const normalizeTarget = (row) => {
      const blockId = String(row?.block || '');
      const block = blockById.get(blockId);
      if (!block) throw new Error(`CURRENT_XIZONG_BIOCHEMISTRY_SOURCE_TARGET_UNKNOWN:${unit?.id || index}:${blockId}`);
      return {
        blockId,
        blockLabel: String(block.label || blockId),
        blockTitle: String(block.title || blockId),
        role: String(row?.role || ''),
        logicGroupId: String(row?.logic_group || ''),
        kpRange: Array.isArray(row?.kp_range) ? row.kp_range.map(Number) : [],
        closesBlock: row?.closes_block_source_contact === true
      };
    };
    const targets = canonical.map(normalizeTarget);
    const primaryBlockIds = new Set(targets.filter((target) => target.role.startsWith('PRIMARY')).map((target) => target.blockId));
    const connectionRoutes = reviewedConnectionRoutes.filter((route) =>
      route.sourceBlocks.some((blockId) => primaryBlockIds.has(blockId))
    );
    return {
      id: String(unit?.id || `BIO27-S${String(index + 1).padStart(2, '0')}`),
      order: index + 1,
      label: String(unit?.label || ''),
      pdf: Array.isArray(unit?.pdf) ? unit.pdf.map(Number) : [],
      connections: Array.isArray(unit?.connections) ? unit.connections.map(String) : [],
      notes: String(unit?.notes || ''),
      primaryTargets: targets.filter((target) => target.role.startsWith('PRIMARY')),
      connectionRoutes,
      supportTargets: targets.filter((target) => !target.role.startsWith('PRIMARY')),
      closesBlocks: [...new Set(targets.filter((target) => target.closesBlock).map((target) => target.blockId))]
    };
  });

  return {
    schema: 'kianos.xizong.biochemistry_source_lane_runtime.v1',
    role: 'DERIVED_EXECUTION_VIEW_ONLY',
    sourceMapPath,
    sourceMapHash: sha256(sourceMapText),
    sourceHash,
    sourceName,
    sourcePages: Number(sourceMap?.source?.pages || 0) || null,
    units,
    closureCheckpoints: sourceMap.block_source_closure_checkpoints || {},
    minimalPrelude: lane.minimal_prelude || null,
    mentalModels: lane.mental_models || null,
    scopeBlockIds: Array.isArray(lane.scope_blocks) ? lane.scope_blocks.map(String) : [],
    questionDiagnosticAxes: Array.isArray(lane.question_diagnostic_axes) ? lane.question_diagnostic_axes.map(String) : [],
    crossSystemIntegration: lane.cross_system_integration || null,
    reconstructions,
    learnerRule: 'One continuous 27 Source lane; canonical M/G owners receive formed knowledge without creating a second course.'
  };
}

function normalizeSystem(record) {
  const { system, identity, dirName, systemPath, sourceHash } = record;
  const learningSupport = loadLearningSupport(record);
  const route = directBlockRoute(system, learningSupport?.raw?.blocks || {});
  const files = blockFilesForRecord(record, route);
  const fileByOrdinal = new Map(files.map((file) => [file.ordinal, file]));
  const fileByBlockId = new Map(files.filter((file) => file.blockId).map((file) => [file.blockId, file]));
  const blocks = route.map((row, index) => {
    const ordinal = blockOrdinalFromId(row.id) || index + 1;
    const file = identity.canonicalId === 'B' ? fileByBlockId.get(String(row.id)) : fileByOrdinal.get(ordinal);
    if (!file) throw new Error(`CURRENT_XIZONG_BLOCK_FILE_MISSING:${row.id}`);
    const blockSupport = learningSupport?.raw?.blocks?.[row.id] || {};
    const tokenMatch = normalizeBlockToken(row.id).match(/^([A-Z]{1,4})(\d+)$/);
    return {
      blockId: row.id,
      label: String(row.label || blockSupport.label || blockSupport.owner_block_key || `B${ordinal}`),
      title: String(row.title || blockSupport.title || file.title || file.name),
      kpCount: Number(row.kp || blockSupport.kp_count || file.kpCount || 0),
      outlineCount: Number(row.outline || 0),
      ordinal,
      slug: tokenMatch
        ? `${tokenMatch[1].toLowerCase()}${pad2(Number(tokenMatch[2]))}`
        : `b${pad2(ordinal)}`,
      sourcePath: file.path
    };
  });

  if (blocks.length !== Number(system?.identity?.block_count || route.length)) {
    throw new Error(`CURRENT_XIZONG_BLOCK_COUNT_MISMATCH:${identity.systemId}`);
  }
  const kpSum = blocks.reduce((sum, block) => sum + block.kpCount, 0);
  const expectedKp = Number(system?.identity?.canonical_kp_count || kpSum);
  if (expectedKp && kpSum !== expectedKp) throw new Error(`CURRENT_XIZONG_KP_COUNT_MISMATCH:${identity.systemId}`);
  const biochemistryLane = loadBiochemistrySourceLane(record, learningSupport, blocks);

  return {
    systemId: identity.systemId,
    canonicalId: identity.canonicalId,
    title: identity.title,
    status: system.status || '',
    semanticAuthority: system.semantic_authority || '',
    mission: system.mission || '',
    mentalModel: {
      motherModel: system?.mental_model?.mother_model || '',
      spine: Array.isArray(system?.mental_model?.spine) ? system.mental_model.spine : [],
      parallelControls: Array.isArray(system?.mental_model?.parallel_controls) ? system.mental_model.parallel_controls : []
    },
    coreVariables: Array.isArray(system?.core_variables) ? system.core_variables : [],
    coreRelations: Array.isArray(system?.core_relations) ? system.core_relations : [],
    failureModes: normalizeFailureModes(system),
    judgmentAxes: Array.isArray(system?.judgment_axes) ? system.judgment_axes : [],
    dependencyDag: Array.isArray(system?.dependency_dag) ? system.dependency_dag : [],
    systemRecall: system?.system_recall || null,
    systemExit: system?.system_exit || null,
    blocks,
    sourcePath: systemPath,
    sourceHash,
    learningSupport,
    biochemistryLane,
    raw: system
  };
}

export function listCurrentXizongSystemIdentities() {
  const manifest = assertCurrentManifest();
  const ownerPaths = Object.values(manifest?.macro_domain_taxonomy?.domains || {})
    .flatMap((domain) => Array.isArray(domain?.system_owners) ? domain.system_owners : [])
    .map(String)
    .filter(Boolean);
  const rows = ownerPaths.map((ownerPath) => {
    const match = ownerPath.match(/^systems\/([^/]+)\/?$/);
    if (!match) throw new Error(`CURRENT_XIZONG_SYSTEM_OWNER_PATH_INVALID:${ownerPath}`);
    const dirName = match[1];
    const systemPath = `${SYSTEMS_ROOT}/${dirName}/system.json`;
    if (!fs.existsSync(absolute(systemPath))) {
      throw new Error(`CURRENT_XIZONG_SYSTEM_OWNER_MISSING:${dirName}`);
    }
    const system = readJson(systemPath);
    const identity = systemIdentity(system);
    const learning = currentLearningIdentity(dirName);
    const canonicalBlockCount = Number(system?.identity?.block_count ?? learning.blockCount);
    const canonicalKpCount = Number(system?.identity?.canonical_kp_count ?? learning.kpCount);
    const canonicalLogicGroupCount = Number(learning.logicGroupCount);
    if (!identity.systemId || !identity.canonicalId || !identity.title) {
      throw new Error(`CURRENT_XIZONG_SYSTEM_IDENTITY_INVALID:${dirName}`);
    }
    return {
      systemId: identity.systemId,
      canonicalId: identity.canonicalId,
      title: identity.title,
      semanticAuthority: String(system?.semantic_authority || ''),
      lifecycleStatus: String(system?.status || ''),
      projectionAccepted: systemProjectionMaterialized(identity),
      blockCount: Number.isFinite(canonicalBlockCount) && canonicalBlockCount > 0 ? canonicalBlockCount : null,
      kpCount: Number.isFinite(canonicalKpCount) && canonicalKpCount > 0 ? canonicalKpCount : null,
      logicGroupCount: Number.isFinite(canonicalLogicGroupCount) && canonicalLogicGroupCount > 0 ? canonicalLogicGroupCount : null,
      learningPath: learning.learningPath
    };
  });
  const expected = Number(manifest?.identity?.numbered_systems || 0);
  if (!expected || rows.length !== expected) {
    throw new Error(`CURRENT_XIZONG_SYSTEM_ROSTER_COUNT_MISMATCH:${rows.length}/${expected}`);
  }
  return rows.sort((a,b) =>
    String(a.canonicalId).localeCompare(String(b.canonicalId), undefined, { numeric: true })
  );
}

export function buildXizongForecastCanonicalScope(packetIndex = []) {
  const roster = listCurrentXizongSystemIdentities();
  const packets = Array.isArray(packetIndex) ? packetIndex : [];
  const blockWeights = [];
  const systems = [];

  for (const system of roster) {
    const canonicalId = String(system.canonicalId || '');
    const systemId = String(system.systemId || '');
    const expectedBlocks = Number(system.blockCount);
    const expectedKp = Number(system.kpCount);
    const expectedLg = Number(system.logicGroupCount);
    if (![expectedBlocks, expectedKp, expectedLg].every((value) => Number.isFinite(value) && value > 0)) {
      throw new Error('CURRENT_XIZONG_FORECAST_SCOPE_COUNT_MISSING:' + (canonicalId || systemId));
    }

    const rows = packets.filter((row) => String(row?.packetMeta?.canonicalId || '') === canonicalId || String(row?.systemId || '') === systemId);
    const observedBlocks = rows.length;
    const observedKp = rows.reduce((sum, row) => sum + (Array.isArray(row?.kpRows) ? row.kpRows.length : 0), 0);
    const observedLg = rows.reduce((sum, row) => {
      const ids = new Set((Array.isArray(row?.kpRows) ? row.kpRows : []).map((kp) => String(kp?.groupId || '')).filter(Boolean));
      return sum + ids.size;
    }, 0);

    if (observedBlocks > expectedBlocks || observedKp > expectedKp || observedLg > expectedLg) {
      throw new Error('CURRENT_XIZONG_FORECAST_SCOPE_EXCEEDS_OWNER:' + canonicalId + ':' + observedBlocks + '/' + expectedBlocks + ':' + observedKp + '/' + expectedKp + ':' + observedLg + '/' + expectedLg);
    }

    for (const row of rows) {
      const kpRows = Array.isArray(row?.kpRows) ? row.kpRows : [];
      const logicGroupCount = new Set(kpRows.map((kp) => String(kp?.groupId || '')).filter(Boolean)).size;
      blockWeights.push({
        system_id: systemId, canonical_id: canonicalId,
        block_id: String(row?.blockId || row?.packetMeta?.blockId || ''),
        route_key: String(row?.routeKey || (row?.slug ? systemId + '/' + row.slug : '')),
        block_count: 1, kp_count: kpRows.length, logic_group_count: logicGroupCount,
        scope_kind: 'PROJECTABLE_BLOCK'
      });
    }

    const gapBlocks = expectedBlocks - observedBlocks;
    const gapKp = expectedKp - observedKp;
    const gapLg = expectedLg - observedLg;
    if ((gapBlocks === 0) !== (gapKp === 0 && gapLg === 0)) {
      throw new Error('CURRENT_XIZONG_FORECAST_SCOPE_PARTIAL_IDENTITY_MISMATCH:' + canonicalId + ':' + gapBlocks + ':' + gapKp + ':' + gapLg);
    }
    if (gapBlocks > 0) {
      blockWeights.push({
        system_id: systemId, canonical_id: canonicalId,
        block_id: '__unprojected__:' + canonicalId, route_key: '',
        block_count: gapBlocks, kp_count: gapKp, logic_group_count: gapLg,
        scope_kind: 'UNPROJECTED_AGGREGATE'
      });
    }

    systems.push({
      system_id: systemId, canonical_id: canonicalId,
      block_count: expectedBlocks, kp_count: expectedKp, logic_group_count: expectedLg,
      projectable_blocks: observedBlocks, unprojected_blocks: gapBlocks
    });
  }

  return {
    schema: 'kianos.xizong.forecast-canonical-scope.v1',
    authority: 'DERIVED_FROM_CURRENT_KNOWLEDGE_AND_LEARNING_OWNERS',
    systems,
    blocks: systems.reduce((sum, row) => sum + row.block_count, 0),
    canonical_kp: systems.reduce((sum, row) => sum + row.kp_count, 0),
    logic_groups: systems.reduce((sum, row) => sum + row.logic_group_count, 0),
    block_weights: blockWeights,
    website_projection_is_scope_authority: false,
    boundary: 'Canonical workload scope comes from Current Knowledge/Learning owners. Website packet rows provide execution identity only; unprojected Systems remain explicit aggregate workload and never disappear from Forecast.'
  };
}
function normalizedSystem(record) {
  const key = String(record?.identity?.systemId || '');
  if (BUILD_CACHE_ENABLED && key && normalizedSystemCache.has(key)) return normalizedSystemCache.get(key);
  const value = normalizeSystem(record);
  if (BUILD_CACHE_ENABLED && key) normalizedSystemCache.set(key, value);
  return value;
}

export function listProjectableXizongSystems() {
  assertCurrentManifest();
  return systemDirectoryCandidates()
    .map(systemRecordFromDir)
    .filter(Boolean)
    .filter((record) => record.projectionAccepted)
    .filter((record) => directBlockRoute(record.system).length > 0)
    .map(normalizedSystem);
}

export function loadXizongSystem(systemId) {
  assertCurrentManifest();
  if (BUILD_CACHE_ENABLED && normalizedSystemCache.has(systemId)) return normalizedSystemCache.get(systemId);
  const record = systemDirectoryCandidates()
    .map(systemRecordFromDir)
    .filter(Boolean)
    .find((candidate) => candidate.identity.systemId === systemId);
  if (!record) throw new Error(`CURRENT_XIZONG_SYSTEM_NOT_FOUND:${systemId}`);
  if (!record.projectionAccepted) throw new Error(`CURRENT_XIZONG_PROJECTION_NOT_ACCEPTED:${systemId}`);
  if (!directBlockRoute(record.system).length) throw new Error(`CURRENT_XIZONG_SYSTEM_NOT_PROJECTABLE:${systemId}`);
  return normalizedSystem(record);
}

export function loadXizongBlock(systemId, blockSlugOrId) {
  const cacheKey = `${systemId}:${blockSlugOrId}`;
  if (BUILD_CACHE_ENABLED && blockCache.has(cacheKey)) return blockCache.get(cacheKey);
  const system = loadXizongSystem(systemId);
  const blockMeta = system.blocks.find((block) => block.slug === blockSlugOrId || block.blockId === blockSlugOrId);
  if (!blockMeta) throw new Error(`CURRENT_XIZONG_BLOCK_NOT_FOUND:${systemId}:${blockSlugOrId}`);

  const markdown = readText(blockMeta.sourcePath);
  const blockSupport = system.learningSupport?.raw?.blocks?.[blockMeta.blockId] || null;
  if (system.learningSupport && !blockSupport) {
    throw new Error(`CURRENT_XIZONG_BLOCK_LEARNING_SUPPORT_MISSING:${blockMeta.blockId}`);
  }
  const kpRecords = markdown.includes('kianos:kp')
    ? parseKpsFromStableMarkers(markdown, blockMeta.blockId)
    : parseKps(markdown, blockMeta.blockId);
  if (kpRecords.length !== blockMeta.kpCount) {
    throw new Error(`CURRENT_XIZONG_BLOCK_KP_COUNT_MISMATCH:${blockMeta.blockId}:${kpRecords.length}/${blockMeta.kpCount}`);
  }
  const kpOrdinalSet = new Set(kpRecords.map((record) => record.ordinal));
  if (kpOrdinalSet.size !== blockMeta.kpCount) {
    throw new Error(`CURRENT_XIZONG_KP_IDENTITY_SET_MISMATCH:${blockMeta.blockId}:duplicate-or-count`);
  }
  for (let ordinal = 1; ordinal <= blockMeta.kpCount; ordinal += 1) {
    if (!kpOrdinalSet.has(ordinal)) throw new Error(`CURRENT_XIZONG_KP_IDENTITY_SET_MISMATCH:${blockMeta.blockId}:missing-${ordinal}`);
  }

  const logicGroups = normalizeLogicGroups(system.raw, blockMeta.blockId, kpRecords, blockSupport);

  const intro = blockOpeningOrientation(markdown);
  const visualGate = sectionByTitle(markdown, (title) => /原图门禁/.test(title));
  if (!intro) throw new Error(`CURRENT_XIZONG_BLOCK_LEARN_MISSING:${blockMeta.blockId}`);

  const result = {
    ...blockMeta,
    objectId: `xizong:${blockMeta.blockId}`,
    systemId: system.systemId,
    systemCanonicalId: system.canonicalId,
    systemTitle: system.title,
    systemSourcePath: system.sourcePath,
    systemSourceHash: system.sourceHash,
    centerQuestion: extractCenterQuestion(markdown),
    blockLearnMarkdown: intro.markdown,
    visualGateMarkdown: visualGate?.markdown || '',
    firstPassFocus: String(blockSupport?.first_pass_focus || ''),
    stopLine: String(blockSupport?.stop_line || ''),
    recallSpine: String(blockSupport?.recall_spine || ''),
    learningSupportSourcePath: system.learningSupport?.path || '',
    learningSupportSourceHash: system.learningSupport?.sourceHash || '',
    logicGroups,
    kpRecords,
    sourceHash: system.learningSupport?.schemaFamily === 'TOP_LEVEL_LOGIC_GROUPS_WITH_CONTENT_REALIZATION'
      ? sha256(`${markdown}\n${JSON.stringify(blockSupport)}`)
      : sha256(markdown)
  };
  if (BUILD_CACHE_ENABLED) {
    blockCache.set(cacheKey, result);
    // Also admit the alternate stable block-id/slug key for the same object.
    blockCache.set(`${systemId}:${blockMeta.blockId}`, result);
    blockCache.set(`${systemId}:${blockMeta.slug}`, result);
  }
  return result;
}

// Identity-only Current requirements; never ship medical Core to a stage guard.
export function loadXizongSystemCompletionRequirements(system) {
  return (system?.blocks || []).map((ref) => {
    const block = loadXizongBlock(system.systemId, ref.slug);
    return {
      schema: 'kianos.xizong.learner_object.v1', objectType: 'BLOCK',
      sourceHash: block.sourceHash,
      identity: { blockId: block.blockId },
      logicGroups: (block.logicGroups || []).map((group) => ({
        identity: { logicGroupId: group.groupId },
        visualRequired: group.visualRequired === true,
        visualSourceState: String(group.visualSourceState || '')
      })),
      kps: block.kpRecords.map((kp) => ({ identity: { kpId: kp.kpId } })),
      evidenceVersion: [block.sourceHash, block.systemSourceHash, block.learningSupportSourceHash].join(':')
    };
  });
}
