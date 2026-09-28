import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const LEARNER_ROOT = 'content/xizong/knowledge/learner';

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

export function loadXizongLearningCues(system) {
  const canonicalId = String(system?.canonicalId || '').toLowerCase();
  const systemId = String(system?.systemId || '');
  if (!canonicalId || !systemId) return null;

  const sourcePath = `${LEARNER_ROOT}/${canonicalId}-${systemId}-learning-cues.json`;
  if (!fs.existsSync(absolute(sourcePath))) return null;

  const raw = JSON.parse(fs.readFileSync(absolute(sourcePath), 'utf8'));
  if (raw?.status !== 'CURRENT' || !String(raw?.authority || '').startsWith('CHAT_APPROVED')) {
    throw new Error(`CURRENT_XIZONG_LEARNING_CUES_INVALID:${systemId}`);
  }
  if (raw?.system_id !== systemId || raw?.canonical_id !== system?.canonicalId) {
    throw new Error(`CURRENT_XIZONG_LEARNING_CUES_IDENTITY_MISMATCH:${systemId}`);
  }

  const blockIds = new Set((system.blocks || []).map((block) => block.blockId));
  const cueRows = [...(raw.precision_index || []), ...(raw.visual_bindings || [])];
  const cueIds = new Set();
  for (const row of cueRows) {
    if (!row?.id) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ID_MISSING:${systemId}`);
    if (cueIds.has(row.id)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ID_DUPLICATE:${row.id}`);
    cueIds.add(row.id);
    if (!blockIds.has(row?.anchor?.block_id)) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_BLOCK_UNKNOWN:${row?.id || systemId}`);
    }
    if (!row?.anchor?.kp_id && !row?.anchor?.logic_group_id) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ANCHOR_MISSING:${row.id}`);
    }
  }

  return {
    sourcePath,
    rules: raw.rules || {},
    precisionIndex: Array.isArray(raw.precision_index) ? raw.precision_index : [],
    visualBindings: Array.isArray(raw.visual_bindings) ? raw.visual_bindings : []
  };
}

export function learningCuesForBlock(cues, block) {
  if (!cues || !block) return { precision: [], visuals: [], sourcePath: '' };

  const kpIds = new Set((block.kpRecords || []).map((kp) => kp.kpId));
  const groupIds = new Set((block.logicGroups || []).map((group) => group.groupId));
  const groupForKp = new Map();
  for (const group of block.logicGroups || []) {
    for (const kpId of group.kpIds || []) {
      if (groupForKp.has(kpId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_KP_MULTI_GROUP:${kpId}`);
      groupForKp.set(kpId, group.groupId);
    }
  }

  const rows = [
    ...(cues.precisionIndex || []).filter((row) => row?.anchor?.block_id === block.blockId),
    ...(cues.visualBindings || []).filter((row) => row?.anchor?.block_id === block.blockId)
  ];

  for (const row of rows) {
    const kpId = row?.anchor?.kp_id;
    const groupId = row?.anchor?.logic_group_id;
    if (kpId && !kpIds.has(kpId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_KP_UNKNOWN:${row.id}:${kpId}`);
    if (groupId && !groupIds.has(groupId)) throw new Error(`CURRENT_XIZONG_LEARNING_CUE_GROUP_UNKNOWN:${row.id}:${groupId}`);
    if (kpId && groupId && groupForKp.get(kpId) !== groupId) {
      throw new Error(`CURRENT_XIZONG_LEARNING_CUE_ANCHOR_INCONSISTENT:${row.id}:${kpId}:${groupId}`);
    }
  }

  return {
    sourcePath: cues.sourcePath,
    rules: cues.rules || {},
    precision: (cues.precisionIndex || []).filter((row) => row?.anchor?.block_id === block.blockId),
    visuals: (cues.visualBindings || []).filter((row) => row?.anchor?.block_id === block.blockId)
  };
}
