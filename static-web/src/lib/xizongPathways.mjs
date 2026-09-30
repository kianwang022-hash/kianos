import fs from 'node:fs';
import path from 'node:path';
import { loadXizongSemanticBlock } from './xizongSemanticAdapter.mjs';
import { loadXizongSystem } from './xizong.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNER_ROOT = 'content/xizong/knowledge/learner';
const BUILD_CACHE_ENABLED = process.env.KIANOS_XIZONG_BUILD_CACHE === '1';
const pathwaysCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function normalizeConnection(row) {
  return {
    ...row,
    reserveLearning: row?.reserve_learning === true
  };
}

function validateEndpoint(systemId, connectionId, side, endpoint, semanticCache) {
  const blockId = String(endpoint?.block_id || '');
  if (!blockId) throw new Error(`CURRENT_XIZONG_PATHWAY_BLOCK_MISSING:${connectionId}:${side}`);

  let semanticBlock = semanticCache.get(blockId);
  if (!semanticBlock) {
    semanticBlock = loadXizongSemanticBlock(systemId, blockId).block;
    semanticCache.set(blockId, semanticBlock);
  }

  const groupId = String(endpoint?.logic_group_id || '');
  const kpId = String(endpoint?.kp_id || '');
  const groupById = new Map((semanticBlock.logicGroups || []).map((group) => [group.groupId, group]));
  const kpToGroup = new Map();
  for (const group of semanticBlock.logicGroups || []) {
    for (const ordinal of group.kpOrdinals || []) {
      const padded = String(ordinal).padStart(2, '0');
      kpToGroup.set(`${blockId}-kp${padded}`, group.groupId);
    }
  }

  if (groupId && !groupById.has(groupId)) {
    throw new Error(`CURRENT_XIZONG_PATHWAY_GROUP_UNKNOWN:${connectionId}:${side}:${groupId}`);
  }
  if (kpId && !kpToGroup.has(kpId)) {
    throw new Error(`CURRENT_XIZONG_PATHWAY_KP_UNKNOWN:${connectionId}:${side}:${kpId}`);
  }
  if (groupId && kpId && kpToGroup.get(kpId) !== groupId) {
    throw new Error(`CURRENT_XIZONG_PATHWAY_ANCHOR_INCONSISTENT:${connectionId}:${side}:${kpId}:${groupId}`);
  }
}

export function loadXizongPathways(system) {
  const canonicalId = String(system?.canonicalId || '').toLowerCase();
  const systemId = String(system?.systemId || '');
  if (!canonicalId || !systemId) return null;
  const cacheKey = `${canonicalId}:${systemId}`;
  if (BUILD_CACHE_ENABLED && pathwaysCache.has(cacheKey)) return pathwaysCache.get(cacheKey);

  const sourcePath = `${LEARNER_ROOT}/${canonicalId}-${systemId}-pathways.json`;
  if (!fs.existsSync(absolute(sourcePath))) {
    if (BUILD_CACHE_ENABLED) pathwaysCache.set(cacheKey, null);
    return null;
  }

  const raw = JSON.parse(fs.readFileSync(absolute(sourcePath), 'utf8'));
  if (raw?.status !== 'CURRENT' || !String(raw?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_PATHWAYS_INVALID:${systemId}`);
  }
  if (raw?.system_id !== systemId || raw?.canonical_id !== system?.canonicalId) {
    throw new Error(`CURRENT_XIZONG_PATHWAYS_IDENTITY_MISMATCH:${systemId}`);
  }

  const failureIds = new Set((system.failureModes || []).map((mode) => mode.id));
  for (const id of Object.keys(raw.system_failure_views || {})) {
    if (!failureIds.has(id)) throw new Error(`CURRENT_XIZONG_PATHWAY_FAILURE_UNKNOWN:${id}`);
  }

  const blockIds = new Set((system.blocks || []).map((block) => block.blockId));
  const connections = (Array.isArray(raw.connections) ? raw.connections : []).map(normalizeConnection);
  const connectionIds = new Set();
  const semanticCache = new Map();
  for (const connection of connections) {
    if (!connection?.id) throw new Error(`CURRENT_XIZONG_PATHWAY_CONNECTION_ID_MISSING:${systemId}`);
    if (connectionIds.has(connection.id)) throw new Error(`CURRENT_XIZONG_PATHWAY_CONNECTION_ID_DUPLICATE:${connection.id}`);
    connectionIds.add(connection.id);
    if (!blockIds.has(connection?.source?.block_id) || !blockIds.has(connection?.target?.block_id)) {
      throw new Error(`CURRENT_XIZONG_PATHWAY_BLOCK_UNKNOWN:${connection.id}`);
    }
    validateEndpoint(systemId, connection.id, 'source', connection.source, semanticCache);
    validateEndpoint(systemId, connection.id, 'target', connection.target, semanticCache);
  }

  const result = {
    sourcePath,
    systemFailureViews: raw.system_failure_views || {},
    connections
  };
  if (BUILD_CACHE_ENABLED) pathwaysCache.set(cacheKey, result);
  return result;
}

export function pathwaysForBlock(pathways, blockId) {
  const connections = pathways?.connections || [];
  return {
    outgoing: connections.filter((row) => row?.source?.block_id === blockId),
    incoming: connections.filter((row) => row?.target?.block_id === blockId)
  };
}

// Adapt the existing reviewed retention owner into the same Connection shape.
// A deferred seed belongs only to its source KP; no reverse learning obligation
// or new pathway owner is inferred for its downstream Block.
export function reviewedRetentionConnectionsForBlock(system, block, shared = null) {
  const sourcePath = `${LEARNER_ROOT}/shared-fields.json`;
  const owner = shared || JSON.parse(fs.readFileSync(absolute(sourcePath), 'utf8'));
  if (!String(owner?.authority || '').startsWith('CHAT_APPROVED')) return [];
  if (owner?.source_bindings?.[block.blockId] !== block.sourcePath) return [];
  const targets = new Map((system.blocks || []).map((row) => [row.blockId, row]));
  const rows = [];
  const seen = new Set();
  for (const kp of block.kpRecords || []) {
    const legacyId = `${block.blockId}-kp${String(kp.ordinal).padStart(3, '0')}`;
    const field = owner?.kp_fields?.[legacyId] || owner?.kp_fields?.[kp.kpId];
    for (const connection of field?.retention_metadata?.connections || []) {
      const targetBlock = targets.get(connection.downstream_owner_id);
      const targetSystem = connection.downstream_system_id ? loadXizongSystem(connection.downstream_system_id) : null;
      const target = targetBlock ? {
        block_id: targetBlock.blockId, label: `${targetBlock.label} · ${targetBlock.title}`,
        href: `/xizong/${system.systemId}/${targetBlock.slug}/`
      } : targetSystem ? {
        system_id: targetSystem.systemId, label: targetSystem.title,
        href: `/xizong/${targetSystem.systemId}/`
      } : null;
      if (connection.kind !== 'DEFERRED_SEED' || !connection.connection_id || !connection.front || !target) {
        throw new Error(`CURRENT_XIZONG_RETENTION_CONNECTION_UNRESOLVED:${kp.kpId}:${connection.connection_id || ''}`);
      }
      if (seen.has(connection.connection_id)) throw new Error(`CURRENT_XIZONG_RETENTION_CONNECTION_DUPLICATE:${connection.connection_id}`);
      seen.add(connection.connection_id);
      rows.push({
        id: connection.connection_id,
        attentionRole: 'FUTURE_CONNECTION',
        answerBearing: true,
        displayPolicy: { timing: 'POST_REVEAL' },
        sourcePath,
        source: { block_id: block.blockId, kp_id: kp.kpId, cue: connection.front.replace(/^\/\/串联[：:]\s*/, '') },
        target,
        seed: String(connection.seed || '')
      });
    }
  }
  return rows;
}
