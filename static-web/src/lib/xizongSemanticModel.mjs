import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT ? path.resolve(process.env.KIANOS_REPO_ROOT) : path.resolve(process.cwd(), '..');
const SYSTEMS_ROOT = 'content/xizong/knowledge/systems';
const LEARNER_ROOT = 'content/xizong/knowledge/learner';
const absolute = (relativePath) => path.join(repoRoot, relativePath);
const readText = (relativePath) => fs.readFileSync(absolute(relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const approved = (value) => String(value || '').startsWith('CHAT_APPROVED');
const pad2 = (value) => String(value).padStart(2, '0');

function systemIdentity(system) {
  return {
    systemId: system?.system_id || system?.identity?.system_id || '',
    canonicalId: system?.canonical_id || system?.identity?.canonical_id || '',
    title: system?.title || system?.identity?.title || ''
  };
}

function learnerPath(identity) {
  return `${LEARNER_ROOT}/${String(identity.canonicalId).toLowerCase()}-${identity.systemId}-learning.json`;
}

function listSystemRecords() {
  return fs.readdirSync(absolute(SYSTEMS_ROOT), { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((entry) => {
    const systemPath = `${SYSTEMS_ROOT}/${entry.name}/system.json`;
    if (!fs.existsSync(absolute(systemPath))) return [];
    const system = readJson(systemPath);
    const identity = systemIdentity(system);
    if (!identity.systemId || !identity.canonicalId || !approved(system?.semantic_authority)) return [];
    const learningPath = learnerPath(identity);
    if (!fs.existsSync(absolute(learningPath))) return [];
    const learning = readJson(learningPath);
    if (learning?.status !== 'CURRENT' || !approved(learning?.authority)) return [];
    return [{ dirName: entry.name, systemPath, system, identity, learningPath, learning }];
  });
}

function loadLearningBlocks(record) {
  const blocks = { ...(record.learning?.blocks || {}) };
  for (const shard of Array.isArray(record.learning?.storage?.shards) ? record.learning.storage.shards : []) {
    const shardPath = `${LEARNER_ROOT}/${shard}`;
    if (!fs.existsSync(absolute(shardPath))) throw new Error(`XIZONG_SEMANTIC_LEARNING_SHARD_MISSING:${shard}`);
    const payload = readJson(shardPath);
    if (payload?.system_id !== record.identity.systemId || payload?.canonical_id !== record.identity.canonicalId) throw new Error(`XIZONG_SEMANTIC_LEARNING_SHARD_IDENTITY:${shard}`);
    for (const [blockId, block] of Object.entries(payload?.blocks || {})) {
      if (Object.hasOwn(blocks, blockId)) throw new Error(`XIZONG_SEMANTIC_LEARNING_BLOCK_DUPLICATE:${blockId}`);
      blocks[blockId] = block;
    }
  }
  if (!Object.keys(blocks).length) throw new Error(`XIZONG_SEMANTIC_LEARNING_BLOCKS_EMPTY:${record.identity.canonicalId}`);
  return blocks;
}

function walkMarkdown(relativeDir) {
  if (!fs.existsSync(absolute(relativeDir))) return [];
  return fs.readdirSync(absolute(relativeDir), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) return walkMarkdown(relative);
    return entry.isFile() && /\.md$/i.test(entry.name) ? [relative] : [];
  });
}

function frontmatterScalar(markdown, field) {
  const frontmatter = String(markdown).match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)?.[1] || '';
  if (!frontmatter) return '';
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return frontmatter.match(new RegExp(`^${escaped}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'))?.[1]?.trim() || '';
}

function canonicalShortAlias(canonicalBlockId) {
  const match = String(canonicalBlockId || '').match(/-(d|m|g)0*(\d+)$/i);
  return match ? `${match[1].toUpperCase()}${Number(match[2])}` : '';
}

function filenameBlockOrdinal(relativePath) {
  const match = path.posix.basename(relativePath).match(/(?:^|_)Block0*(\d+)(?:_|\D)/i);
  return match ? Number(match[1]) : null;
}

function legacyOrdinal(blockId) {
  const match = String(blockId).match(/-(?:b|r)(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function discoverBlockSources(record, learningBlocks) {
  const files = walkMarkdown(`${SYSTEMS_ROOT}/${record.dirName}`);
  const textByPath = new Map();
  const rows = files.map((sourcePath) => {
    const text = readText(sourcePath);
    textByPath.set(sourcePath, text);
    const canonicalBlockId = frontmatterScalar(text, 'block_id');
    return {
      sourcePath,
      canonicalBlockId,
      orderAlias: frontmatterScalar(text, 'order'),
      shortAlias: canonicalShortAlias(canonicalBlockId)
    };
  });
  const sourceById = new Map();
  const identityById = new Map();

  for (const learningBlockId of Object.keys(learningBlocks)) {
    const exact = rows.filter((row) => row.canonicalBlockId === learningBlockId || row.orderAlias === learningBlockId || row.shortAlias === learningBlockId);
    if (exact.length > 1) throw new Error(`XIZONG_SEMANTIC_BLOCK_OWNER_DUPLICATE:${learningBlockId}`);
    if (exact.length === 1) {
      const row = exact[0];
      sourceById.set(learningBlockId, row.sourcePath);
      identityById.set(learningBlockId, {
        learningBlockId,
        canonicalBlockId: row.canonicalBlockId || learningBlockId,
        identityResolution: row.canonicalBlockId === learningBlockId ? 'FRONTMATTER_BLOCK_ID' : row.orderAlias === learningBlockId ? 'FRONTMATTER_ORDER_ALIAS' : 'CANONICAL_SHORT_ALIAS'
      });
      continue;
    }
    const ordinal = legacyOrdinal(learningBlockId);
    if (!Number.isInteger(ordinal)) throw new Error(`XIZONG_SEMANTIC_BLOCK_OWNER_MISSING:${learningBlockId}`);
    const legacy = rows.filter((row) => !row.canonicalBlockId && filenameBlockOrdinal(row.sourcePath) === ordinal);
    if (legacy.length !== 1) throw new Error(`XIZONG_SEMANTIC_BLOCK_OWNER_LEGACY_RESOLUTION:${learningBlockId}:${legacy.length}`);
    sourceById.set(learningBlockId, legacy[0].sourcePath);
    identityById.set(learningBlockId, { learningBlockId, canonicalBlockId: learningBlockId, identityResolution: 'LEGACY_NUMBERED_FILENAME' });
  }
  return { sourceById, identityById, textByPath };
}

function routingTags(body) {
  const seen = new Set();
  return [...String(body).matchAll(/^[ \t]*\*\*Routing\*\*[ \t]*[：:][ \t]*(.+?)[ \t]*$/gmi)]
    .flatMap((match) => String(match[1] || '').split(/[｜|]/))
    .map((tag) => tag.trim().toUpperCase())
    .filter((tag) => tag && !seen.has(tag) && seen.add(tag));
}

function parseHeadingFromChunk(chunk, blockId, kpId) {
  const match = String(chunk).match(/^[ \t]*(#{2,4})[ \t]+KP[ \t]*0*(\d+)[ \t]*[｜|][ \t]*(.+?)[ \t]*$/mi);
  if (!match) throw new Error(`XIZONG_SEMANTIC_KP_HEADING_MISSING:${blockId}:${kpId}`);
  return { ordinal: Number(match[2]), title: String(match[3] || '').trim(), end: (match.index || 0) + match[0].length };
}

function parseKps(markdown, learningBlockId, canonicalBlockId) {
  const source = String(markdown);
  const markers = [...source.matchAll(/^[ \t]*<!--\s*kianos:kp\s+id=["']([^"']+)["']\s*-->[ \t]*$/gmi)];
  if (markers.length) {
    return markers.map((marker, index) => {
      const start = (marker.index || 0) + marker[0].length;
      const end = markers[index + 1]?.index ?? source.length;
      const chunk = source.slice(start, end);
      const heading = parseHeadingFromChunk(chunk, learningBlockId, marker[1]);
      return {
        kpId: marker[1],
        ordinal: heading.ordinal,
        displayId: `KP${pad2(heading.ordinal)}`,
        title: heading.title,
        semanticTags: routingTags(chunk.slice(heading.end)),
        identityResolution: 'KIANOS_KP_MARKER'
      };
    });
  }

  const headings = [...source.matchAll(/^[ \t]*(#{2,4})[ \t]+KP[ \t]*0*(\d+)[ \t]*[｜|][ \t]*(.+?)[ \t]*$/gmi)];
  return headings.map((heading, index) => {
    const ordinal = Number(heading[2]);
    const start = (heading.index || 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? source.length;
    return {
      kpId: `${canonicalBlockId || learningBlockId}-kp${pad2(ordinal)}`,
      ordinal,
      displayId: `KP${pad2(ordinal)}`,
      title: String(heading[3] || '').trim(),
      semanticTags: routingTags(source.slice(start, end)),
      identityResolution: 'DETERMINISTIC_CANONICAL_BLOCK_PLUS_ORDINAL'
    };
  });
}

function routeRows(route) {
  if (!Array.isArray(route)) return [];
  return route.flatMap((row) => row && typeof row === 'object' ? (row.id ? [row] : []).concat(routeRows(row.blocks)) : []);
}

function normalizeFailureModes(system) {
  return (Array.isArray(system?.failure_modes) ? system.failure_modes : []).map((item, index) => Array.isArray(item)
    ? { id: item[0] || `fm${index + 1}`, label: item[1] || '', chain: item[2] || '' }
    : { id: item?.id || `fm${index + 1}`, label: item?.label || '', chain: item?.chain || item?.description || '' });
}

function rangeOrdinals(range, groupId) {
  if (!Array.isArray(range) || range.length !== 2) throw new Error(`XIZONG_SEMANTIC_LOGIC_RANGE_INVALID:${groupId}`);
  const start = Number(range[0]);
  const end = Number(range[1]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) throw new Error(`XIZONG_SEMANTIC_LOGIC_RANGE_INVALID:${groupId}`);
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function normalizeMembership(group, legacyGroup, kpByOrdinal, groupId) {
  let ordinals;
  let membershipSource;
  if (Array.isArray(group?.kp_members) && group.kp_members.length) {
    membershipSource = 'LEARNING_EXPLICIT_MEMBERS';
    ordinals = group.kp_members.map((member) => {
      if (Number.isInteger(Number(member))) return Number(member);
      const kp = [...kpByOrdinal.values()].find((candidate) => candidate.kpId === member);
      if (!kp) throw new Error(`XIZONG_SEMANTIC_LOGIC_MEMBER_UNKNOWN:${groupId}:${member}`);
      return kp.ordinal;
    });
  } else if (Array.isArray(group?.kp)) {
    membershipSource = 'LEARNING_RANGE';
    ordinals = rangeOrdinals(group.kp, groupId);
  } else if (Array.isArray(legacyGroup?.kp)) {
    membershipSource = 'LEGACY_K_LOGIC_INDEX_RANGE';
    ordinals = rangeOrdinals(legacyGroup.kp, groupId);
  } else {
    throw new Error(`XIZONG_SEMANTIC_LOGIC_MEMBERSHIP_MISSING:${groupId}`);
  }
  const kpIds = ordinals.map((ordinal) => {
    const kp = kpByOrdinal.get(ordinal);
    if (!kp) throw new Error(`XIZONG_SEMANTIC_LOGIC_MEMBER_OUT_OF_RANGE:${groupId}:${ordinal}`);
    return kp.kpId;
  });
  return {
    ordinals,
    kpIds,
    membershipSource,
    isContiguous: ordinals.every((ordinal, index) => index === 0 || ordinal === ordinals[index - 1] + 1)
  };
}

function normalizeLogicGroups(system, blockId, blockLearning, kpRecords) {
  const learningGroups = blockLearning?.logic_groups || {};
  const groupIds = Object.keys(learningGroups);
  if (!groupIds.length) throw new Error(`XIZONG_SEMANTIC_LOGIC_GROUPS_EMPTY:${blockId}`);
  const legacyRows = Array.isArray(system?.logic_index?.[blockId]) ? system.logic_index[blockId] : [];
  const legacyById = new Map(legacyRows.map((row) => [row.id, row]));
  const explicitOrder = Array.isArray(blockLearning?.learner_order) ? blockLearning.learner_order : [];
  const learnerOrder = explicitOrder.length ? explicitOrder : legacyRows.length ? legacyRows.map((row) => row.id) : groupIds;
  if (learnerOrder.length !== groupIds.length || new Set(learnerOrder).size !== learnerOrder.length || groupIds.some((id) => !learnerOrder.includes(id))) throw new Error(`XIZONG_SEMANTIC_LEARNER_ORDER_MISMATCH:${blockId}`);

  const kpByOrdinal = new Map(kpRecords.map((kp) => [kp.ordinal, kp]));
  if (kpByOrdinal.size !== kpRecords.length) throw new Error(`XIZONG_SEMANTIC_KP_ORDINAL_DUPLICATE:${blockId}`);
  const assigned = new Set();
  const groups = learnerOrder.map((groupId, index) => {
    const group = learningGroups[groupId];
    const legacy = legacyById.get(groupId);
    if (!group?.goal || !group?.closure) throw new Error(`XIZONG_SEMANTIC_LOGIC_CLOSURE_MISSING:${groupId}`);
    const membership = normalizeMembership(group, legacy, kpByOrdinal, groupId);
    for (const ordinal of membership.ordinals) {
      if (assigned.has(ordinal)) throw new Error(`XIZONG_SEMANTIC_LOGIC_MEMBER_DUPLICATE:${blockId}:${ordinal}`);
      assigned.add(ordinal);
    }
    const label = String(group?.label || legacy?.label || '');
    if (!label) throw new Error(`XIZONG_SEMANTIC_LOGIC_LABEL_MISSING:${groupId}`);
    return {
      groupId,
      order: index + 1,
      label,
      kpOrdinals: membership.ordinals,
      kpIds: membership.kpIds,
      kpCount: membership.kpIds.length,
      membershipSource: membership.membershipSource,
      isContiguous: membership.isContiguous,
      goal: String(group.goal),
      closure: String(group.closure),
      continuityRationale: String(group?.continuity_rationale || ''),
      jobs: Array.isArray(group?.jobs) ? group.jobs.map(String) : [],
      receiptAnchor: String(group?.receipt_anchor || '')
    };
  });
  if (assigned.size !== kpRecords.length) throw new Error(`XIZONG_SEMANTIC_LOGIC_COVERAGE_COUNT:${blockId}:${assigned.size}/${kpRecords.length}`);
  for (const kp of kpRecords) if (!assigned.has(kp.ordinal)) throw new Error(`XIZONG_SEMANTIC_LOGIC_KP_UNASSIGNED:${kp.kpId}`);
  const groupByOrdinal = new Map(groups.flatMap((group) => group.kpOrdinals.map((ordinal) => [ordinal, group])));
  return {
    learnerOrder,
    groups,
    kps: kpRecords.map((kp) => ({ ...kp, logicGroupId: groupByOrdinal.get(kp.ordinal).groupId, logicGroupLabel: groupByOrdinal.get(kp.ordinal).label }))
  };
}

function adapterMode(blocks) {
  const kinds = new Set(blocks.flatMap((block) => block.logicGroups.map((group) => group.membershipSource)));
  if (kinds.size === 1 && kinds.has('LEARNING_EXPLICIT_MEMBERS')) return 'LEARNING_NATIVE_EXPLICIT_MEMBERS';
  if (kinds.size === 1 && kinds.has('LEARNING_RANGE')) return 'LEARNING_NATIVE_RANGE';
  if (kinds.has('LEGACY_K_LOGIC_INDEX_RANGE')) return 'LEGACY_K_MEMBERSHIP_PLUS_L_SEMANTICS';
  return 'MIXED_COMPATIBILITY_ADAPTER';
}

function sourceHandoff(learning) {
  const contract = learning?.surface_handoff_contract || {};
  if (contract?.source_contact_unit) return {
    sourceContactUnit: String(contract.source_contact_unit),
    logicGroupRole: String(contract?.logic_group_role || ''),
    lgSourceReentryDefault: typeof contract?.lg_source_reentry_default === 'boolean' ? contract.lg_source_reentry_default : null,
    policySource: 'SYSTEM_LEARNING_OWNER'
  };
  const serialized = JSON.stringify(contract);
  if (/whole-Logic-Group/i.test(serialized) || /whole LG/i.test(serialized)) return {
    sourceContactUnit: 'LOGIC_GROUP',
    logicGroupRole: 'SOURCE_CONTACT_AND_RETRIEVAL_CLOSURE_UNIT',
    lgSourceReentryDefault: true,
    policySource: 'SYSTEM_LEARNING_OWNER'
  };
  return {
    sourceContactUnit: 'LANE_INHERITED_UNSPECIFIED_NATURAL_UNIT',
    logicGroupRole: 'LEARNING_CONTINUITY_AND_CLOSURE_UNIT',
    lgSourceReentryDefault: null,
    policySource: 'XIZONG_LEARNING_CONTRACT'
  };
}

function buildSemanticSystem(record) {
  const learningBlocks = loadLearningBlocks(record);
  const { sourceById, identityById, textByPath } = discoverBlockSources(record, learningBlocks);
  const route = routeRows(record.system?.block_route);
  const routeById = new Map(route.map((row) => [row.id, row]));
  const blocks = Object.entries(learningBlocks).map(([blockId, blockLearning]) => {
    const sourcePath = sourceById.get(blockId);
    const sourceIdentity = identityById.get(blockId);
    const markdown = textByPath.get(sourcePath) || readText(sourcePath);
    const kpRecords = parseKps(markdown, blockId, sourceIdentity.canonicalBlockId);
    const expectedKp = Number(blockLearning?.kp_count || routeById.get(blockId)?.kp || kpRecords.length);
    if (kpRecords.length !== expectedKp) throw new Error(`XIZONG_SEMANTIC_BLOCK_KP_COUNT:${blockId}:${kpRecords.length}/${expectedKp}`);
    const normalized = normalizeLogicGroups(record.system, blockId, blockLearning, kpRecords);
    return {
      blockId,
      learningBlockId: sourceIdentity.learningBlockId,
      canonicalBlockId: sourceIdentity.canonicalBlockId,
      identityResolution: sourceIdentity.identityResolution,
      title: String(blockLearning?.title || routeById.get(blockId)?.title || path.posix.basename(sourcePath, '.md')),
      kpCount: kpRecords.length,
      firstPassFocus: String(blockLearning?.first_pass_focus || ''),
      stopLine: String(blockLearning?.stop_line || ''),
      recallSpine: String(blockLearning?.recall_spine || ''),
      readiness: blockLearning?.readiness || null,
      learnerOrder: normalized.learnerOrder,
      logicGroups: normalized.groups,
      kpRecords: normalized.kps,
      sourcePath
    };
  });

  const expectedBlocks = Number(record.learning?.identity?.stable_block_count || record.system?.identity?.block_count || blocks.length);
  const expectedKps = Number(record.learning?.identity?.stable_kp_count || record.system?.identity?.canonical_kp_count || blocks.reduce((sum, block) => sum + block.kpCount, 0));
  const totalKps = blocks.reduce((sum, block) => sum + block.kpCount, 0);
  if (blocks.length !== expectedBlocks) throw new Error(`XIZONG_SEMANTIC_SYSTEM_BLOCK_COUNT:${record.identity.canonicalId}:${blocks.length}/${expectedBlocks}`);
  if (totalKps !== expectedKps) throw new Error(`XIZONG_SEMANTIC_SYSTEM_KP_COUNT:${record.identity.canonicalId}:${totalKps}/${expectedKps}`);

  const systemRoute = Array.isArray(record.learning?.system_route?.default_route) ? record.learning.system_route.default_route : route.length ? route.map((row) => row.id).filter((id) => Object.hasOwn(learningBlocks, id)) : Object.keys(learningBlocks);
  return {
    schema: 'kianos.xizong.semantic_model.v1',
    systemId: record.identity.systemId,
    canonicalId: record.identity.canonicalId,
    title: record.identity.title,
    adapterMode: adapterMode(blocks),
    semanticOwnerPaths: { system: record.systemPath, learning: record.learningPath },
    systemModel: {
      mission: String(record.system?.mission || ''),
      motherModel: String(record.system?.mental_model?.mother_model || ''),
      spine: Array.isArray(record.system?.mental_model?.spine) ? record.system.mental_model.spine : [],
      parallelControls: Array.isArray(record.system?.mental_model?.parallel_controls) ? record.system.mental_model.parallel_controls : [],
      coreVariables: Array.isArray(record.system?.core_variables) ? record.system.core_variables : [],
      coreRelations: Array.isArray(record.system?.core_relations) ? record.system.core_relations : [],
      failureModes: normalizeFailureModes(record.system),
      judgmentAxes: Array.isArray(record.system?.judgment_axes) ? record.system.judgment_axes : []
    },
    sourceHandoff: sourceHandoff(record.learning),
    systemRoute,
    blocks,
    totals: {
      blocks: blocks.length,
      kps: totalKps,
      logicGroups: blocks.reduce((sum, block) => sum + block.logicGroups.length, 0),
      nonContiguousLogicGroups: blocks.reduce((sum, block) => sum + block.logicGroups.filter((group) => !group.isContiguous).length, 0),
      kpSemanticTagRows: blocks.reduce((sum, block) => sum + block.kpRecords.filter((kp) => kp.semanticTags.length).length, 0)
    }
  };
}

export function listXizongSemanticSystems() {
  return listSystemRecords().map(buildSemanticSystem).sort((a, b) => a.canonicalId.localeCompare(b.canonicalId));
}

export function loadXizongSemanticSystem(systemIdOrCanonicalId) {
  const wanted = String(systemIdOrCanonicalId || '');
  const record = listSystemRecords().find((candidate) => candidate.identity.systemId === wanted || candidate.identity.canonicalId === wanted);
  if (!record) throw new Error(`XIZONG_SEMANTIC_SYSTEM_NOT_FOUND:${wanted}`);
  return buildSemanticSystem(record);
}
