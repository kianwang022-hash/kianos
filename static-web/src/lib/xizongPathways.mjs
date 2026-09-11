import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNER_ROOT = 'content/xizong/knowledge/learner';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function loadXizongPathways(system) {
  const canonicalId = String(system?.canonicalId || '').toLowerCase();
  const systemId = String(system?.systemId || '');
  if (!canonicalId || !systemId) return null;

  const sourcePath = `${LEARNER_ROOT}/${canonicalId}-${systemId}-pathways.json`;
  if (!fs.existsSync(absolute(sourcePath))) return null;

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
  for (const connection of raw.connections || []) {
    if (!connection?.id) throw new Error(`CURRENT_XIZONG_PATHWAY_CONNECTION_ID_MISSING:${systemId}`);
    if (!blockIds.has(connection?.source?.block_id) || !blockIds.has(connection?.target?.block_id)) {
      throw new Error(`CURRENT_XIZONG_PATHWAY_BLOCK_UNKNOWN:${connection.id}`);
    }
  }

  return {
    sourcePath,
    systemFailureViews: raw.system_failure_views || {},
    connections: Array.isArray(raw.connections) ? raw.connections : []
  };
}

export function pathwaysForBlock(pathways, blockId) {
  const connections = pathways?.connections || [];
  return {
    outgoing: connections.filter((row) => row?.source?.block_id === blockId),
    incoming: connections.filter((row) => row?.target?.block_id === blockId)
  };
}
