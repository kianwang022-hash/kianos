import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const KNOWLEDGE_ROOT = 'content/xizong/knowledge';
const OWNER_MANIFEST = `${KNOWLEDGE_ROOT}/manifest.json`;
const SYSTEMS_ROOT = `${KNOWLEDGE_ROOT}/systems`;
const LEARNER_ROOT = `${KNOWLEDGE_ROOT}/learner`;

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

function systemProjectionAccepted(dirName) {
  const acceptancePath = `${SYSTEMS_ROOT}/${dirName}/ACCEPTANCE.md`;
  if (!fs.existsSync(absolute(acceptancePath))) return false;
  return /^P\s+PASS(?:\s|$)/m.test(readText(acceptancePath));
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
  return {
    dirName,
    systemPath,
    system,
    identity,
    sourceHash: sha256(text),
    projectionAccepted: systemProjectionAccepted(dirName)
  };
}

function forecastSystemRecordFromDir(dirName) {
  const systemPath = SYSTEMS_ROOT + '/' + dirName + '/system.json';
  if (!fs.existsSync(absolute(systemPath))) return null;
  const text = readText(systemPath);
  const system = JSON.parse(text);
  const identity = systemIdentity(system);
  const blockCount = Number(system?.identity?.block_count || 0);
  const kpCount = Number(system?.identity?.canonical_kp_count || 0);
  if (!identity.systemId || !identity.canonicalId || !identity.title) return null;
  if (!Number.isInteger(blockCount) || blockCount < 1) {
    throw new Error('CURRENT_XIZONG_FORECAST_SYSTEM_BLOCK_COUNT_INVALID:' + identity.systemId);
  }
  if (!Number.isInteger(kpCount) || kpCount < 1) {
    throw new Error('CURRENT_XIZONG_FORECAST_SYSTEM_KP_COUNT_INVALID:' + identity.systemId);
  }
  return {
    dirName,
    systemPath,
    system,
    identity,
    sourceHash: sha256(text),
    projectionAccepted: systemProjectionAccepted(dirName)
  };
}
function blockOrdinalFromFile(filename) {
  const match = String(filename).match(/(?:^|_)Block(\d+)_/i);
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
    .filter((name) => /\.md$/i.test(name) && Number.isInteger(blockOrdinalFromFile(name)))
    .map((name) => ({ name, ordinal: blockOrdinalFromFile(name), path: `${blocksPath}/${name}` }))
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

function blockOpeningOrientation(markdown) {
  const explicit = sectionByTitle(markdown, (title) => /^(?:0[｜|])?.*这个 Block 到底解决什么/.test(title));
  if (explicit) return explicit;

  const source = String(markdown).replace(/^---\s*\n[\s\S]*?\n---\s*\n+/, '');
  const firstKpIndex = source.search(/^(?:#{2,4})\s+KP\d+[｜|]\s*.+$/m);
  const end = firstKpIndex >= 0 ? firstKpIndex : source.length;
  const opening = source
    .slice(0, end)
    .replace(/^#\s+.+\n+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!opening) return null;
  return { title: 'Block orientation', markdown: opening };
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
      outlineLocator: metadataValue(body, 'Outline →') || metadataValue(body, 'Outline'),
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

function loadLearningSupport(record) {
  const pathName = `${LEARNER_ROOT}/${String(record.identity.canonicalId).toLowerCase()}-${record.identity.systemId}-learning.json`;
  if (!fs.existsSync(absolute(pathName))) return null;
  const text = readText(pathName);
  const support = JSON.parse(text);
  if (!String(support?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_INVALID:${record.identity.systemId}`);
  }
  if (support?.system_id !== record.identity.systemId || support?.canonical_id !== record.identity.canonicalId) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_IDENTITY_MISMATCH:${record.identity.systemId}`);
  }

  const expectedBlocks = directBlockRoute(record.system).map((row) => row.id);
  const actualBlocks = Object.keys(support?.blocks || {});
  if (expectedBlocks.length !== actualBlocks.length || expectedBlocks.some((id) => !actualBlocks.includes(id))) {
    throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_BLOCK_MISMATCH:${record.identity.systemId}`);
  }
  for (const blockId of expectedBlocks) {
    const expectedGroups = (record.system?.logic_index?.[blockId] || []).map((group) => group.id);
    const actualGroups = Object.keys(support?.blocks?.[blockId]?.logic_groups || {});
    if (expectedGroups.length !== actualGroups.length || expectedGroups.some((id) => !actualGroups.includes(id))) {
      throw new Error(`CURRENT_XIZONG_LEARNING_SUPPORT_LOGIC_MISMATCH:${blockId}`);
    }
  }
  return { path: pathName, sourceHash: sha256(text), raw: support };
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
    learningSupport: loadLearningSupport(record),
    raw: system
  };
}


function xizongForecastBlockRecords(record) {
  const expectedBlocks = Number(record.system?.identity?.block_count || 0);
  const expectedKp = Number(record.system?.identity?.canonical_kp_count || 0);

  const direct = directBlockRoute(record.system);
  if (direct.length && (!expectedBlocks || direct.length === expectedBlocks)) {
    const rows = direct.map((row, index) => ({
      blockId: String(row.id || ''),
      order: index + 1,
      kpCount: Number(row.kp || 0)
    }));
    if (rows.some((row) => !row.blockId || !Number.isInteger(row.kpCount) || row.kpCount < 1)) {
      throw new Error('CURRENT_XIZONG_FORECAST_DIRECT_ROUTE_INVALID:' + record.identity.systemId);
    }
    const kpSum = rows.reduce((sum, row) => sum + row.kpCount, 0);
    if (expectedKp && kpSum !== expectedKp) {
      throw new Error('CURRENT_XIZONG_FORECAST_KP_COUNT_MISMATCH:' + record.identity.systemId + ':' + kpSum + '/' + expectedKp);
    }
    return rows;
  }

  const stableIds = Array.isArray(record.system?.identity?.stable_block_ids)
    ? record.system.identity.stable_block_ids.map((value) => String(value || '')).filter(Boolean)
    : [];
  if (!stableIds.length) {
    throw new Error('CURRENT_XIZONG_FORECAST_STABLE_BLOCK_IDS_MISSING:' + record.identity.systemId);
  }
  if (expectedBlocks && stableIds.length !== expectedBlocks) {
    throw new Error('CURRENT_XIZONG_FORECAST_STABLE_BLOCK_COUNT_MISMATCH:' + record.identity.systemId + ':' + stableIds.length + '/' + expectedBlocks);
  }

  const systemRoot = SYSTEMS_ROOT + '/' + record.dirName;
  const markdownFiles = [];
  const walk = (relativeDir) => {
    const entries = fs.readdirSync(absolute(relativeDir), { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = relativeDir + '/' + entry.name;
      if (entry.isDirectory()) { walk(relativePath); continue; }
      if (entry.isFile() && /\.md$/i.test(entry.name)) markdownFiles.push(relativePath);
    }
  };
  walk(systemRoot);

  const stableSet = new Set(stableIds);
  const found = new Map();
  for (const relativePath of markdownFiles) {
    const source = readText(relativePath);
    const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---/m)?.[1] || '';
    const blockMatch = frontmatter.match(/^block_id:\s*['\"]?([^'\"\n]+)['\"]?\s*$/m);
    const blockId = String(blockMatch?.[1] || '').trim();
    if (!stableSet.has(blockId)) continue;
    if (found.has(blockId)) {
      throw new Error('CURRENT_XIZONG_FORECAST_BLOCK_ID_DUPLICATE:' + record.identity.systemId + ':' + blockId);
    }

    const kpFrontmatter = Number((frontmatter.match(/^kp_count:\s*(\d+)\s*$/m) || [])[1] || 0);
    const markerCount = (source.match(/kianos:kp/gi) || []).length;
    const headingCount = (source.match(/^#{1,4}\s+KP\d+\b/gm) || []).length;
    const kpCount = Number.isInteger(kpFrontmatter) && kpFrontmatter > 0
      ? kpFrontmatter
      : markerCount > 0 ? markerCount : headingCount;
    if (!Number.isInteger(kpCount) || kpCount < 1) {
      throw new Error('CURRENT_XIZONG_FORECAST_BLOCK_KP_MISSING:' + record.identity.systemId + ':' + blockId);
    }
    found.set(blockId, { blockId, kpCount });
  }

  const missing = stableIds.filter((blockId) => !found.has(blockId));
  if (missing.length) {
    throw new Error('CURRENT_XIZONG_FORECAST_BLOCK_FILES_MISSING:' + record.identity.systemId + ':' + missing.join(','));
  }

  const rows = stableIds.map((blockId, index) => ({
    blockId,
    order: index + 1,
    kpCount: found.get(blockId).kpCount
  }));
  const kpSum = rows.reduce((sum, row) => sum + row.kpCount, 0);
  if (expectedKp && kpSum !== expectedKp) {
    throw new Error('CURRENT_XIZONG_FORECAST_KP_COUNT_MISMATCH:' + record.identity.systemId + ':' + kpSum + '/' + expectedKp);
  }
  return rows;
}

export function listXizongForecastScope() {
  const manifest = assertCurrentManifest();
  const systems = systemDirectoryCandidates()
    .map(forecastSystemRecordFromDir)
    .filter(Boolean)
    .map((record) => {
      const blocks = xizongForecastBlockRecords(record);
      return {
        systemId: record.identity.systemId,
        canonicalId: record.identity.canonicalId,
        title: record.identity.title,
        projectionAccepted: Boolean(record.projectionAccepted),
        blockCount: blocks.length,
        canonicalKpCount: blocks.reduce((sum, row) => sum + row.kpCount, 0),
        blocks: blocks.map((row) => ({ blockId: row.blockId, order: row.order, kpCount: row.kpCount }))
      };
    })
    .sort((a, b) => String(a.canonicalId).localeCompare(String(b.canonicalId), undefined, { numeric: true }));

  const blockCount = systems.reduce((sum, row) => sum + row.blockCount, 0);
  const kpCount = systems.reduce((sum, row) => sum + row.canonicalKpCount, 0);
  const expectedSystems = Number(manifest?.identity?.numbered_systems || systems.length);
  const expectedBlocks = Number(manifest?.identity?.numbered_blocks || blockCount);
  const expectedKp = Number(manifest?.identity?.numbered_canonical_kps || kpCount);

  if (systems.length !== expectedSystems) {
    throw new Error('CURRENT_XIZONG_FORECAST_SYSTEM_COUNT_MISMATCH:' + systems.length + '/' + expectedSystems);
  }
  if (blockCount !== expectedBlocks) {
    throw new Error('CURRENT_XIZONG_FORECAST_TOTAL_BLOCK_MISMATCH:' + blockCount + '/' + expectedBlocks);
  }
  if (kpCount !== expectedKp) {
    throw new Error('CURRENT_XIZONG_FORECAST_TOTAL_KP_MISMATCH:' + kpCount + '/' + expectedKp);
  }

  return {
    schema: 'kianos.xizong.forecast-scope.v1',
    systemCount: systems.length,
    blockCount,
    canonicalKpCount: kpCount,
    systems
  };
}

export function listProjectableXizongSystems() {
  assertCurrentManifest();
  return systemDirectoryCandidates()
    .map(systemRecordFromDir)
    .filter(Boolean)
    .filter((record) => record.projectionAccepted)
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
  if (!record.projectionAccepted) throw new Error(`CURRENT_XIZONG_PROJECTION_NOT_ACCEPTED:${systemId}`);
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
  const kpOrdinalSet = new Set(kpRecords.map((record) => record.ordinal));
  if (kpOrdinalSet.size !== blockMeta.kpCount) {
    throw new Error(`CURRENT_XIZONG_KP_IDENTITY_SET_MISMATCH:${blockMeta.blockId}:duplicate-or-count`);
  }
  for (let ordinal = 1; ordinal <= blockMeta.kpCount; ordinal += 1) {
    if (!kpOrdinalSet.has(ordinal)) throw new Error(`CURRENT_XIZONG_KP_IDENTITY_SET_MISMATCH:${blockMeta.blockId}:missing-${ordinal}`);
  }

  let logicGroups = normalizeLogicGroups(system.raw, blockMeta.blockId, kpRecords);
  const blockSupport = system.learningSupport?.raw?.blocks?.[blockMeta.blockId] || null;
  if (system.learningSupport && !blockSupport) {
    throw new Error(`CURRENT_XIZONG_BLOCK_LEARNING_SUPPORT_MISSING:${blockMeta.blockId}`);
  }
  if (blockSupport) {
    logicGroups = logicGroups.map((group) => {
      const learning = blockSupport.logic_groups?.[group.groupId];
      if (!learning?.goal || !learning?.closure) {
        throw new Error(`CURRENT_XIZONG_LOGIC_LEARNING_SUPPORT_INCOMPLETE:${group.groupId}`);
      }
      return { ...group, goal: String(learning.goal), closure: String(learning.closure) };
    });
  }

  const intro = blockOpeningOrientation(markdown);
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
    firstPassFocus: String(blockSupport?.first_pass_focus || ''),
    stopLine: String(blockSupport?.stop_line || ''),
    recallSpine: String(blockSupport?.recall_spine || ''),
    learningSupportSourcePath: system.learningSupport?.path || '',
    learningSupportSourceHash: system.learningSupport?.sourceHash || '',
    logicGroups,
    kpRecords,
    sourceHash: sha256(markdown)
  };
}

// Identity-only Current requirements; never ship medical Core to a stage guard.
export function loadXizongSystemCompletionRequirements(system) {
  return (system?.blocks || []).map((ref) => {
    const block = loadXizongBlock(system.systemId, ref.slug);
    return {
      schema: 'kianos.xizong.learner_object.v1', objectType: 'BLOCK',
      identity: { blockId: block.blockId },
      kps: block.kpRecords.map((kp) => ({ identity: { kpId: kp.kpId } })),
      evidenceVersion: [block.sourceHash, block.systemSourceHash, block.learningSupportSourceHash].join(':')
    };
  });
}
