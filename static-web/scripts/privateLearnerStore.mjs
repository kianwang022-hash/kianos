import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const PRIVATE_CHECKPOINT_SCHEMA = 'kianos.private-checkpoint.v1';
export const PRIVATE_CHECKPOINT_FILENAME = 'latest.json';

const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'))
  && new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day;

const objectOrNull = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : null;

export function resolvePrivateLearnerDir({
  env = process.env,
  platform = process.platform,
  home = os.homedir()
} = {}) {
  const configured = String(env.KIANOS_PRIVATE_DIR || '').trim();
  if (configured) return path.resolve(configured);
  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'KianOS', 'learner-state');
  }
  return path.join(home, '.kianos', 'learner-state');
}

export function validatePrivateLearnerCheckpoint(value) {
  const root = objectOrNull(value);
  if (!root) throw new Error('PRIVATE_CHECKPOINT_OBJECT_REQUIRED');
  if (root.schema !== PRIVATE_CHECKPOINT_SCHEMA) throw new Error('PRIVATE_CHECKPOINT_SCHEMA_INVALID');
  if (!validDay(root.study_day)) throw new Error('PRIVATE_CHECKPOINT_STUDY_DAY_INVALID');
  if (!root.generated_at || Number.isNaN(Date.parse(root.generated_at))) {
    throw new Error('PRIVATE_CHECKPOINT_GENERATED_AT_INVALID');
  }
  const payload = objectOrNull(root.payload);
  if (!payload) throw new Error('PRIVATE_CHECKPOINT_PAYLOAD_REQUIRED');
  const shared = payload.shared == null ? {} : objectOrNull(payload.shared);
  const subjects = payload.subjects == null ? {} : objectOrNull(payload.subjects);
  if (!shared) throw new Error('PRIVATE_CHECKPOINT_SHARED_INVALID');
  if (!subjects) throw new Error('PRIVATE_CHECKPOINT_SUBJECTS_INVALID');

  return {
    schema: PRIVATE_CHECKPOINT_SCHEMA,
    checkpoint_id: String(root.checkpoint_id || '').trim().slice(0, 160)
      || ('checkpoint-' + new Date(root.generated_at).getTime()),
    study_day: root.study_day,
    generated_at: new Date(root.generated_at).toISOString(),
    payload: {
      shared: JSON.parse(JSON.stringify(shared)),
      subjects: JSON.parse(JSON.stringify(subjects))
    }
  };
}

export function privateCheckpointPath(privateDir = resolvePrivateLearnerDir()) {
  return path.join(privateDir, PRIVATE_CHECKPOINT_FILENAME);
}

export function readPrivateLearnerCheckpoint(privateDir = resolvePrivateLearnerDir()) {
  const file = privateCheckpointPath(privateDir);
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    return validatePrivateLearnerCheckpoint(value);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export function writePrivateLearnerCheckpoint(value, privateDir = resolvePrivateLearnerDir()) {
  const checkpoint = validatePrivateLearnerCheckpoint(value);
  fs.mkdirSync(privateDir, { recursive: true, mode: 0o700 });
  try { fs.chmodSync(privateDir, 0o700); } catch {}
  const file = privateCheckpointPath(privateDir);
  const temp = file + '.tmp-' + process.pid + '-' + Date.now();
  const bytes = JSON.stringify(checkpoint, null, 2) + '\n';
  fs.writeFileSync(temp, bytes, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, file);
  try { fs.chmodSync(file, 0o600); } catch {}
  return checkpoint;
}
