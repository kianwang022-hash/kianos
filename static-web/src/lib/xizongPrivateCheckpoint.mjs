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
  /^kianos:xizong:session-runtime:v1$/,
  /^kianos-xizong-chat-handoff-v1:[A-Za-z0-9._:-]+$/,
  /^kianos-xizong-chat-return-v1:[A-Za-z0-9._:-]+$/,
  /^kianos:xizong:pending-chat-return:v1$/,
  /^kianos:xizong:pending-system-wu-return:v1$/
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

// Native fill-only preparation. Archive/meta ownership stays here; callers may
// apply changes transactionally or to a shadow store before capturing a backup.
export function prepareXizongPrivateCheckpointRestore(storage, input) {
  const checkpoint = validateXizongPrivateCheckpoint(input);
  const local = new Map(listStorageKeys(storage).filter(isXizongDurableStorageKey)
    .map((key) => [key, validateRawJson(key, storage.getItem(key))]));
  const incoming = new Map(checkpoint.entries.map(({ key, raw }) => [key, raw]));
  const merged = new Map([...incoming, ...local]);
  const parse = (map, key) => map.has(key) ? JSON.parse(map.get(key)) : null;
  const retired = new Map();
  const archiveVersions = new Map();
  const add = (key, value, metaKey, version) => {
    if (value == null) return;
    const rows = retired.get(key) || [];
    rows.push({ value, metaKey, version: String(version || '') });
    retired.set(key, rows);
  };
  const rememberVersion = (meta, archive, key) => {
    const at = Date.parse(archive?.archived_at) || Number(key.match(/:(\d+)$/)?.[1]) || 0;
    if (!archiveVersions.has(meta) || at >= archiveVersions.get(meta).at) archiveVersions.set(meta, { version: String(archive?.current_version || ''), at });
  };
  for (const [key, raw] of merged) {
    const archive = JSON.parse(raw);
    let match = key.match(/^kianos-xizong-stale-system-evidence:(.+):\d+$/);
    if (match) {
      const id = match[1];
      const meta = `kianos:xizong:system-evidence-meta:${id}:v1`;
      rememberVersion(meta, archive, key);
      for (const [kind, field] of [['system-recall','recall'],['system-question-sweep','sweep'],['system-repair-return','repair'],['system-evidence','ledger']]) {
        add(`kianos:xizong:${kind}:${id}:v1`, archive?.[field], meta, archive?.current_version);
      }
      for (const [block, value] of Object.entries(archive?.stale_block_repair_inboxes || {})) {
        add(`kianos-xizong-repair-inbox-v1:xizong:${block}`, value, meta, archive?.current_version);
      }
    }
    match = key.match(/^kianos-xizong-stale-evidence-v1:(xizong:.+):\d+$/);
    if (match) {
      const id = match[1];
      const meta = `kianos-xizong-evidence-meta-v1:${id}`;
      rememberVersion(meta, archive, key);
      for (const [prefix, field] of [['kianos-xizong-astro-v2','study'],['kianos-xizong-memory-review-v2','extension'],['kianos-xizong-repair-inbox-v1','repair_inbox']]) {
        add(`${prefix}:${id}`, archive?.[field], meta, archive?.current_version);
      }
    }
  }
  const canonical = (value) => value && typeof value === 'object'
    ? (Array.isArray(value) ? value.map(canonical) : Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])))
    : value;
  const changes = [], skipped = [], blocked = [];
  for (const entry of checkpoint.entries) {
    if (local.has(entry.key)) { skipped.push({ key: entry.key, reason: 'LOCAL_VALUE_PRESENT' }); continue; }
    const evidence = retired.get(entry.key) || [];
    let reason = '';
    for (const row of evidence) {
      const localVersion = String(parse(local, row.metaKey)?.version || archiveVersions.get(row.metaKey)?.version || '');
      const incomingVersion = String(parse(incoming, row.metaKey)?.version || '');
      if (localVersion && incomingVersion) {
        if (localVersion !== incomingVersion) { reason = 'NATIVE_REVISION_CHANGED'; break; }
        continue; // Same canonical version may legitimately repeat the same value.
      }
      if (JSON.stringify(canonical(JSON.parse(entry.raw))) === JSON.stringify(canonical(row.value))) {
        reason = 'NATIVE_ARCHIVE_RETIRED_VALUE'; break;
      }
      reason = 'NATIVE_RETIREMENT_AMBIGUOUS';
    }
    // Metadata alone also establishes that an older revision cannot be filled.
    const system = entry.key.match(/^kianos:xizong:(?:system-recall|system-question-sweep|system-repair-return|system-evidence):([^:]+):v1$/);
    const block = entry.key.match(/^kianos-xizong-(?:astro-v2|memory-review-v2|repair-inbox-v1):(xizong:.+)$/);
    const metaKey = system ? `kianos:xizong:system-evidence-meta:${system[1]}:v1`
      : block ? `kianos-xizong-evidence-meta-v1:${block[1]}` : null;
    if (!reason && archiveVersions.has(entry.key)) {
      const expected = archiveVersions.get(entry.key).version;
      const incomingVersion = String(JSON.parse(entry.raw)?.version || '');
      if (expected && expected !== incomingVersion) reason = 'NATIVE_REVISION_CHANGED';
    }
    if (!reason && metaKey && local.has(metaKey)) {
      const current = String(parse(local, metaKey)?.version || '');
      const previous = String(parse(incoming, metaKey)?.version || '');
      if (current && previous && current !== previous) reason = 'NATIVE_REVISION_CHANGED';
      else if (current && !previous) reason = 'NATIVE_RETIREMENT_AMBIGUOUS';
    }
    if (reason) {
      const row = { key: entry.key, reason };
      skipped.push(row);
      if (reason === 'NATIVE_RETIREMENT_AMBIGUOUS') blocked.push(row);
    } else changes.push(entry);
  }
  return { status: blocked.length ? 'blocked' : changes.length ? 'prepared' : 'skipped', changes, skipped, blocked };
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
