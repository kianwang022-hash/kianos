import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const KNOWLEDGE_ROOT = 'content/xizong/knowledge';
const OWNER_MANIFEST = `${KNOWLEDGE_ROOT}/manifest.json`;
const SYSTEMS_ROOT = `${KNOWLEDGE_ROOT}/systems`;

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
  if (!fs.existsSync(absolute(OWNER_MANIFEST))) throw new Error('CURRENT_XIZONG_OWNER_MANIFEST_MISSING');
  const manifest = readJson(OWNER_MANIFEST);
  if (manifest?.status !== 'CURRENT') throw new Error(`CURRENT_XIZONG_OWNER_MANIFEST_INVALID:${manifest?.status || 'unknown'}`);
  if (manifest?.owner_resolution?.system_level?.parallel_owner_forbidden !== true) {
    throw new Error('CURRENT_XIZONG_OWNER_RESOLUTION_INVALID');
  }
  return manifest;
}

function systemIdentity(system) {
  return {
    systemId: system?.system_id || system?.identity?.system_id || '',
    canonicalId: system?.canonical_id || system?.identity?.canonical_id || '',
    title: system?.title || system?.identity?.title || ''
  };
}

function isChatApproved(system) {
  return String(system?.semantic_authority || '').startsWith('CHAT_APPROVED');
}

function directBlockRoute(system) {
  const route = Array.isArray(system?.block_route) ? system.block_route : [];
  return route.filter((row) => row && !Array.isArray(row?.blocks) && row?.id);
}

function systemDirectoryCandidates() {
  const root = absolute(SYSTEMS_ROOT);
  if (!fs.existsSync(root)) throw new Error('CURRENT_XIZONG_SYSTEMS_ROOT_MISSING');
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function systemRecordFromDir(dirName) {
  const systemPath = `${SYSTEMS_ROOT}/${dirName}/system.json`;
  if (!fs.existsSync(absolute(systemPath))) return null;
  const text = readText(systemPath);
  const system = JSON.parse(text);
  const identity = systemIdentity(system);
  if (!identity.systemId || !identity.title || !isChatApproved(system)) return null;
  return { dirName, systemPath, system, identity, sourceHash: sha256(text) };
}

function blockOrdinalFromFile(filename) {
  const match = String(filename).match(/^Block(\d+)_/i);
  return match ? Number(match[1]) : null;
}

function blockOrdinalFromId(blockId) {
  const match = String(blockId).match(/-(?:r|b)(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function blockFiles(dirName) {
  const blocksPath = `${SYSTEMS_ROOT}/${dirName}/blocks`;
  if (!fs.existsSync(absolute(blocksPath))) throw new Error(`CURRENT_XIZONG_BLOCKS_MISSING:${dirName}`);
  return fs.readdirSync(absolute(blocksPath))
    .filter((name) => /^Block\d+_.+\.md$/i.test(name))
    .map((name) => ({ name, ordinal: blockOrdinalFromFile(name), path: `${blocksPath}/${name}` }))
    .filter((row) => Number.isInteger(row.ordinal))
    .sort((a, b) => a.ordinal - b.ordinal);
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
  return [...String(markdown).matchAll(/^(#{1,4})\s+(.+)$/gm)].map((match) => ({
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

function metadataValue(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`^>\\s*\\*\\*${escaped}\\*\\*[：:]?\\s*(.+)$`, 'm'),
    new RegExp(`^>\\s*\\*\\*${escaped}[：:]\\*\\*\\s*(.+)$`, 'm')
  ];
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function stripKpMetadata(body) {
  return String(body)
    .replace(/^>\s*\*\*(?:讲义定位[^*]*|Outline[^*]*|主提示[^*]*)\*\*[：:]?.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseKps(markdown, blockId) {
  const source = String(markdown);
  const matches = [...source.matchAll(/^(#{2,4})\s+(KP(\d+))[｜|]\s*(.+)$/gm)];
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
      prompt: metadataValue(body, '主提示'),
      sourceLocator: metadataValue(body, '讲义定位 →') || metadataValue(body, '讲义定位'),
      outlineLocator: metadataValue(body, 'Outline'),
      detailMarkdown: stripKpMetadata(body)
    };
  });
}

function normalizeLogicGroups(system, blockId, kpRecords) {
  const groups = system?.logic_index?.[blockId];
  if (!Array.isArray(groups) || !groups.length) throw new Error(`CURRENT_XIZONG_LOGIC_INDEX_MISSING:${blockId}`);

  const ordinals = [];
  const normalized = groups.map((group, index) => {
    const range = Array.isArray(group?.kp) ? group.kp : [];
    const start = Number(range[0]);
    const end = Number(range[1]);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      throw new Error(`CURRENT_XIZONG_LOGIC_RANGE_INVALID:${blockId}:${group?.id || index}`);
    }
    const kpIds = [];
    for (let ordinal = start; ordinal <= end; ordinal += 1) {
      ordinals.push(ordinal);
      kpIds.push(`${blockId}-kp${pad2(ordinal)}`);
    }
    return {
      groupId: group?.id || `${blockId}-lg${pad2(index + 1)}`,
      order: index + 1,
      label: String(group?.label || `Logic Group ${index + 1}`),
      start,
      end,
      kpIds,
      kpCount: end - start + 1
    };
  });

  const expected = kpRecords.map((record) => record.ordinal);
  if (ordinals.length !== expected.length || ordinals.some((value, index) => value !== expected[index])) {
    throw new Error(`CURRENT_XIZONG_LOGIC_FLATTEN_MISMATCH:${blockId}`);
  }

  const groupByOrdinal = new Map();
  for (const group of normalized) {
    for (let ordinal = group.start; ordinal <= group.end; ordinal += 1) groupByOrdinal.set(ordinal, group);
  }
  for (const record of kpRecords) {
    const group = groupByOrdinal.get(record.ordinal);
    if (!group) throw new Error(`CURRENT_XIZONG_KP_UNASSIGNED:${record.kpId}`);
    record.groupId = group.groupId;
    record.groupLabel = group.label;
  }
  return normalized;
}

function normalizeFailureModes(system) {
  return (Array.isArray(system?.failure_modes) ? system.failure_modes : []).map((item, index) => {
    if (Array.isArray(item)) return { id: item[0] || `fm${index + 1}`, label: item[1] || '', chain: item[2] || '' };
    return { id: item?.id || `fm${index + 1}`, label: item?.label || '', chain: item?.chain || item?.description || '' };
  });
}

function normalizeSystem(record) {
  const { system, identity, dirName, systemPath, sourceHash } = record;
  const route = directBlockRoute(system);
  const files = blockFiles(dirName);
  const fileByOrdinal = new Map(files.map((file) => [file.ordinal, file]));
  const blocks = route.map((row, index) => {
    const ordinal = blockOrdinalFromId(row.id) || index + 1;
    const file = fileByOrdinal.get(ordinal);
    if (!file) throw new Error(`CURRENT_XIZONG_BLOCK_FILE_MISSING:${row.id}`);
    const match = String(row.id).match(/-(r|b)(\d+)$/i);
    return {
      blockId: row.id,
      label: String(row.label || `B${ordinal}`),
      title: String(row.title || file.name),
      kpCount: Number(row.kp || 0),
      outlineCount: Number(row.outline || 0),
      ordinal,
      slug: match ? `${match[1].toLowerCase()}${pad2(Number(match[2]))}` : `b${pad2(ordinal)}`,
      sourcePath: file.path
    };
  });

  if (blocks.length !== Number(system?.identity?.block_count || route.length)) {
    throw new Error(`CURRENT_XIZONG_BLOCK_COUNT_MISMATCH:${identity.systemId}`);
  }
  const kpSum = blocks.reduce((sum, block) => sum + block.kpCount, 0);
  const expectedKp = Number(system?.identity?.canonical_kp_count || kpSum);
  if (expectedKp && kpSum !== expectedKp) throw new Error(`CURRENT_XIZONG_KP_COUNT_MISMATCH:${identity.systemId}`);

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
    raw: system
  };
}

export function listProjectableXizongSystems() {
  assertCurrentManifest();
  return systemDirectoryCandidates()
    .map(systemRecordFromDir)
    .filter(Boolean)
    .filter((record) => directBlockRoute(record.system).length > 0 && record.system?.logic_index)
    .map(normalizeSystem);
}

export function loadXizongSystem(systemId) {
  assertCurrentManifest();
  const record = systemDirectoryCandidates()
    .map(systemRecordFromDir)
    .filter(Boolean)
    .find((candidate) => candidate.identity.systemId === systemId);
  if (!record) throw new Error(`CURRENT_XIZONG_SYSTEM_NOT_FOUND:${systemId}`);
  if (!record.system?.logic_index) throw new Error(`CURRENT_XIZONG_SYSTEM_NOT_PROJECTABLE:${systemId}`);
  return normalizeSystem(record);
}

export function loadXizongBlock(systemId, blockSlugOrId) {
  const system = loadXizongSystem(systemId);
  const blockMeta = system.blocks.find((block) => block.slug === blockSlugOrId || block.blockId === blockSlugOrId);
  if (!blockMeta) throw new Error(`CURRENT_XIZONG_BLOCK_NOT_FOUND:${systemId}:${blockSlugOrId}`);

  const markdown = readText(blockMeta.sourcePath);
  const kpRecords = parseKps(markdown, blockMeta.blockId);
  if (kpRecords.length !== blockMeta.kpCount) {
    throw new Error(`CURRENT_XIZONG_BLOCK_KP_COUNT_MISMATCH:${blockMeta.blockId}:${kpRecords.length}/${blockMeta.kpCount}`);
  }
  kpRecords.forEach((record, index) => {
    if (record.ordinal !== index + 1) throw new Error(`CURRENT_XIZONG_KP_ORDER_INVALID:${blockMeta.blockId}:${record.displayId}`);
  });

  const logicGroups = normalizeLogicGroups(system.raw, blockMeta.blockId, kpRecords);
  const intro = sectionByTitle(markdown, (title) => /^(?:0[｜|])?.*这个 Block 到底解决什么/.test(title));
  const visualGate = sectionByTitle(markdown, (title) => /原图门禁/.test(title));
  if (!intro) throw new Error(`CURRENT_XIZONG_BLOCK_LEARN_MISSING:${blockMeta.blockId}`);

  return {
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
    logicGroups,
    kpRecords,
    sourceHash: sha256(markdown)
  };
}
