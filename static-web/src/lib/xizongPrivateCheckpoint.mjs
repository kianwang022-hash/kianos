export const XIZONG_PRIVATE_CHECKPOINT_SCHEMA = 'kianos.xizong.private-checkpoint.v1';

const MAX_ENTRIES = 5000;
const MAX_RAW_CHARS = 16 * 1024 * 1024;

const DURABLE_KEY_PATTERNS = Object.freeze([
  /^kianos-xizong-last-location-v1$/,
  /^kianos-xizong-memory-v1$/,
  /^kianos-xizong-astro-v2:xizong:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-personal-v1:xizong:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-memory-review-v2:xizong:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-repair-inbox-v1:xizong:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-evidence-meta-v1:xizong:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-stale-evidence-v1:xizong:[A-Za-z0-9._:-]+:\d+$/,
  /^kianos-xizong-stale-system-evidence:[A-Za-z0-9._:-]+:\d+$/,
  /^kianos:xizong:system-recall:[^:]+:v1$/,
  /^kianos:xizong:(?:system|chat-set|retained|paper)-question-sweep:.*:v1$/,
  /^kianos:xizong:system-repair-return:[^:]+:v1$/,
  /^kianos:xizong:system-evidence:[^:]+:v1$/,
  /^kianos:xizong:system-evidence-meta:[^:]+:v1$/,
  /^kianos:xizong:full-paper-holdout-years:v1$/,
  /^kianos:xizong:chat-set:v1$/,
  /^kianos:xizong:retained-set:v1$/,
  /^kianos:xizong:question-preferences:v1$/,
  /^kianos:xizong:session-instruction:v1$/,
  /^kianos:xizong:session-runtime:v1$/
]);

export function isXizongDurableStorageKey(key) {
  const value = String(key || '');
  return DURABLE_KEY_PATTERNS.some((pattern) => pattern.test(value));
}

function listStorageKeys(storage) {
  if (!storage?.getItem) throw new Error('XIZONG_CHECKPOINT_STORAGE_UNAVAILABLE');
  if (typeof storage.key !== 'function' || !Number.isInteger(storage.length) || storage.length < 0) return [];
  const keys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (typeof key === 'string') keys.push(key);
  }
  return [...new Set(keys)];
}

function validateRawJson(key, raw) {
  if (typeof raw !== 'string') throw new Error('XIZONG_CHECKPOINT_ENTRY_INVALID:' + key);
  try {
    JSON.parse(raw);
  } catch {
    throw new Error('XIZONG_CHECKPOINT_ENTRY_JSON_INVALID:' + key);
  }
  return raw;
}

export function xizongDurableStorageIsEmpty(storage) {
  return !listStorageKeys(storage).some(isXizongDurableStorageKey);
}

export function validateXizongPrivateCheckpoint(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('XIZONG_CHECKPOINT_OBJECT_REQUIRED');
  }
  if (value.schema !== XIZONG_PRIVATE_CHECKPOINT_SCHEMA) {
    throw new Error('XIZONG_CHECKPOINT_SCHEMA_INVALID');
  }
  if (!Array.isArray(value.entries) || value.entries.length > MAX_ENTRIES) {
    throw new Error('XIZONG_CHECKPOINT_ENTRIES_INVALID');
  }

  const seen = new Set();
  let chars = 0;
  const entries = value.entries.map((entry) => {
    const key = String(entry?.key || '');
    if (!isXizongDurableStorageKey(key) || seen.has(key)) {
      throw new Error('XIZONG_CHECKPOINT_KEY_INVALID:' + key);
    }
    seen.add(key);
    const raw = validateRawJson(key, entry?.raw);
    chars += raw.length;
    if (chars > MAX_RAW_CHARS) throw new Error('XIZONG_CHECKPOINT_TOO_LARGE');
    return { key, raw };
  }).sort((a, b) => a.key.localeCompare(b.key));

  return {
    schema: XIZONG_PRIVATE_CHECKPOINT_SCHEMA,
    captured_at: value.captured_at && !Number.isNaN(Date.parse(value.captured_at))
      ? new Date(value.captured_at).toISOString()
      : null,
    entry_count: entries.length,
    entries
  };
}

export function captureXizongPrivateCheckpoint(storage, { now = Date.now() } = {}) {
  const keys = listStorageKeys(storage).filter(isXizongDurableStorageKey).sort();
  if (!keys.length) return null;

  const entries = keys.map((key) => {
    let raw;
    try { raw = storage.getItem(key); }
    catch { throw new Error('XIZONG_CHECKPOINT_READ_FAILED:' + key); }
    return { key, raw: validateRawJson(key, raw) };
  });

  return validateXizongPrivateCheckpoint({
    schema: XIZONG_PRIVATE_CHECKPOINT_SCHEMA,
    captured_at: new Date(now).toISOString(),
    entries
  });
}

export function restoreXizongPrivateCheckpoint(storage, input, { onlyIfEmpty = true } = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('XIZONG_CHECKPOINT_STORAGE_UNAVAILABLE');
  const checkpoint = validateXizongPrivateCheckpoint(input);
  if (onlyIfEmpty && !xizongDurableStorageIsEmpty(storage)) {
    return { status: 'skipped', reason: 'xizong-local-state-present', restored: 0 };
  }

  const before = new Map(checkpoint.entries.map(({ key }) => {
    try { return [key, storage.getItem(key)]; }
    catch { throw new Error('XIZONG_CHECKPOINT_PREWRITE_READ_FAILED:' + key); }
  }));

  try {
    for (const { key, raw } of checkpoint.entries) storage.setItem(key, raw);
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }

  return { status: 'restored', restored: checkpoint.entries.length };
}
