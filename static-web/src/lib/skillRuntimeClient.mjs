import { commitLearnerStorageChanges } from './browserLearnerWriter.mjs';
export const SKILL_PROGRESS_SCHEMA = 'kianos.skill-progress.v1';
export const SKILL_PROGRESS_KEY = 'kianos:skills:progress:v1';

function blank() { return { schema: SKILL_PROGRESS_SCHEMA, skills: {} }; }

export function readSkillProgress(storage = window.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(SKILL_PROGRESS_KEY) || 'null');
    if (!parsed || parsed.schema !== SKILL_PROGRESS_SCHEMA || typeof parsed.skills !== 'object') return blank();
    return parsed;
  } catch { return blank(); }
}

function writeSkillProgress(value, storage = window.localStorage) {
  commitLearnerStorageChanges(storage, [[SKILL_PROGRESS_KEY, JSON.stringify(value)]]);
  window.dispatchEvent(new CustomEvent('kianos:skill-progress-updated', { detail: value }));
  return value;
}

function ensureSkill(root, skillId) {
  root.skills[skillId] ||= { last_asset: null, visited: [], completed: [], updated_at: null };
  const state = root.skills[skillId];
  state.visited = Array.isArray(state.visited) ? state.visited : [];
  state.completed = Array.isArray(state.completed) ? state.completed : [];
  return state;
}

export function recordSkillAssetVisit(skillId, assetId, storage = window.localStorage) {
  const root = readSkillProgress(storage);
  const state = ensureSkill(root, skillId);
  state.last_asset = assetId;
  if (!state.visited.includes(assetId)) state.visited.push(assetId);
  state.updated_at = new Date().toISOString();
  return writeSkillProgress(root, storage);
}

export function setSkillAssetCompleted(skillId, assetId, completed, storage = window.localStorage) {
  const root = readSkillProgress(storage);
  const state = ensureSkill(root, skillId);
  state.completed = state.completed.filter((id) => id !== assetId);
  if (completed) state.completed.push(assetId);
  state.last_asset = assetId;
  if (!state.visited.includes(assetId)) state.visited.push(assetId);
  state.updated_at = new Date().toISOString();
  return writeSkillProgress(root, storage);
}

export function skillProgressFor(skillId, storage = window.localStorage) {
  const root = readSkillProgress(storage);
  return root.skills[skillId] || { last_asset: null, visited: [], completed: [], updated_at: null };
}
