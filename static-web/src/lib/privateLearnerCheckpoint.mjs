export const PRIVATE_CHECKPOINT_SCHEMA = 'kianos.private-checkpoint.v1';
export const PRIVATE_CHECKPOINT_ENDPOINT = '/__kianos-private/checkpoint';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'))
  && new Date(day + 'T00:00:00Z').toISOString().slice(0, 10) === day;

export function buildPrivateLearnerCheckpoint({
  studyDay,
  now = Date.now(),
  shared = {},
  subjects = {},
  checkpointId = null
} = {}) {
  if (!validDay(studyDay)) throw new Error('PRIVATE_CHECKPOINT_STUDY_DAY_INVALID');
  if (!shared || typeof shared !== 'object' || Array.isArray(shared)) throw new Error('PRIVATE_CHECKPOINT_SHARED_INVALID');
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) throw new Error('PRIVATE_CHECKPOINT_SUBJECTS_INVALID');
  const generatedAt = new Date(now).toISOString();
  return {
    schema: PRIVATE_CHECKPOINT_SCHEMA,
    checkpoint_id: checkpointId || ('checkpoint-' + now),
    study_day: studyDay,
    generated_at: generatedAt,
    payload: {
      shared: clone(shared),
      subjects: clone(subjects)
    }
  };
}

export async function writePrivateLearnerCheckpoint(checkpoint, {
  fetchImpl = globalThis.fetch,
  endpoint = PRIVATE_CHECKPOINT_ENDPOINT
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('PRIVATE_CHECKPOINT_FETCH_UNAVAILABLE');
  const response = await fetchImpl(endpoint, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(checkpoint)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || ('PRIVATE_CHECKPOINT_WRITE_FAILED:' + response.status));
  return body;
}

export async function readPrivateLearnerCheckpoint({
  fetchImpl = globalThis.fetch,
  endpoint = PRIVATE_CHECKPOINT_ENDPOINT
} = {}) {
  if (typeof fetchImpl !== 'function') return { status: 'unavailable', checkpoint: null, error: 'fetch unavailable' };
  try {
    const response = await fetchImpl(endpoint, { method: 'GET', cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (response.status === 404) return { status: 'missing', checkpoint: null, error: null };
    if (!response.ok) return { status: 'unavailable', checkpoint: null, error: body?.error || String(response.status) };
    if (body?.status !== 'ready' || body?.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA) {
      return { status: 'invalid', checkpoint: null, error: 'invalid checkpoint response' };
    }
    return { status: 'ready', checkpoint: clone(body.checkpoint), error: null };
  } catch (error) {
    return { status: 'unavailable', checkpoint: null, error: error instanceof Error ? error.message : String(error) };
  }
}
