import {
  captureXizongPrivateCheckpoint,
  validateXizongPrivateCheckpoint,
  xizongDurableStorageIsEmpty
} from './xizongPrivateCheckpoint.mjs';
import {
  englishCheckpointKeyAllowed,
  exportEnglishCheckpoint
} from './englishLearnerEvidence.mjs';
import {
  exportPoliticsCheckpoint,
  politicsCheckpointKeyAllowed,
  validatePoliticsPrivatePayload
} from './politicsChatReturn.mjs';

export const LEXICAL_PRIVATE_PAYLOAD_SCHEMA = 'kianos.lexical.private-payload.v1';
const ENGLISH_PRIVATE_PAYLOAD_SCHEMA = 'kianos.english.private-payload.v1';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const listStorageKeys = (storage) => {
  if (!storage?.getItem || typeof storage.key !== 'function' || !Number.isFinite(Number(storage.length))) return [];
  const keys = [];
  for (let index = 0; index < Number(storage.length); index += 1) {
    const key = storage.key(index);
    if (typeof key === 'string') keys.push(key);
  }
  return [...new Set(keys)];
};

const lexicalCheckpointKeyAllowed = (key) => {
  const value = String(key || '');
  return value.startsWith('kianos-lexical-') || value.startsWith('kianos-vocabulary-');
};

const subjectStorageIsEmpty = (storage, allowed) =>
  !listStorageKeys(storage).some((key) => allowed(key));

const validateEntriesPayload = (value, { schema, allowed, label }) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== schema || !value.entries || typeof value.entries !== 'object'
      || Array.isArray(value.entries)) {
    throw new Error(`PRIVATE_CHECKPOINT_${label}_SCHEMA_INVALID`);
  }
  const entries = [];
  for (const [key, raw] of Object.entries(value.entries)) {
    if (!allowed(key) || typeof raw !== 'string') throw new Error(`PRIVATE_CHECKPOINT_${label}_KEY_INVALID:${key}`);
    try { JSON.parse(raw); }
    catch { throw new Error(`PRIVATE_CHECKPOINT_${label}_JSON_INVALID:${key}`); }
    entries.push([key, raw]);
  }
  return entries.sort(([a], [b]) => a.localeCompare(b));
};

const captureLexicalCheckpoint = (storage) => {
  const entries = {};
  for (const key of listStorageKeys(storage).filter(lexicalCheckpointKeyAllowed).sort()) {
    const raw = storage.getItem(key);
    if (typeof raw !== 'string') continue;
    try { JSON.parse(raw); }
    catch { throw new Error('PRIVATE_CHECKPOINT_LEXICAL_JSON_INVALID:' + key); }
    entries[key] = raw;
  }
  return Object.keys(entries).length
    ? { schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA, entries }
    : null;
};

const captureEnglishCheckpoint = (storage) => {
  const value = exportEnglishCheckpoint(storage);
  return Object.keys(value.entries || {}).length ? value : null;
};

const validateEnglishCheckpoint = (value) =>
  validateEntriesPayload(value, {
    schema: ENGLISH_PRIVATE_PAYLOAD_SCHEMA,
    allowed: englishCheckpointKeyAllowed,
    label: 'ENGLISH'
  });

const validateLexicalCheckpoint = (value) =>
  validateEntriesPayload(value, {
    schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA,
    allowed: lexicalCheckpointKeyAllowed,
    label: 'LEXICAL'
  });

const ADAPTERS = Object.freeze({
  xizong: Object.freeze({
    capture: captureXizongPrivateCheckpoint,
    validate: validateXizongPrivateCheckpoint,
    isEmpty: xizongDurableStorageIsEmpty,
    prepare(storage, value, { onlyIfEmpty = true } = {}) {
      const checkpoint = validateXizongPrivateCheckpoint(value);
      if (!onlyIfEmpty) {
        return {
          status: 'prepared',
          changes: checkpoint.entries.map(({ key, raw }) => [key, raw]),
          preserved_local_keys: []
        };
      }

      const changes = [];
      const preservedLocalKeys = [];
      for (const { key, raw } of checkpoint.entries) {
        const existing = storage.getItem(key);
        if (existing == null) {
          changes.push([key, raw]);
          continue;
        }
        if (existing !== raw) preservedLocalKeys.push(key);
      }

      if (!changes.length) {
        return {
          status: 'skipped',
          reason: preservedLocalKeys.length
            ? 'xizong-local-state-preserved'
            : 'xizong-local-state-complete',
          changes: [],
          preserved_local_keys: preservedLocalKeys
        };
      }
      return {
        status: 'prepared',
        changes,
        preserved_local_keys: preservedLocalKeys
      };
    }
  }),
  english: Object.freeze({
    capture: captureEnglishCheckpoint,
    validate: validateEnglishCheckpoint,
    isEmpty: (storage) => subjectStorageIsEmpty(storage, englishCheckpointKeyAllowed),
    prepare(storage, value) {
      const entries = validateEnglishCheckpoint(value);
      const changes = [];
      for (const [key, raw] of entries) {
        const existing = storage.getItem(key);
        if (existing != null && existing !== raw) {
          throw new Error('PRIVATE_CHECKPOINT_ENGLISH_CONFLICT_KEEP_LOCAL:' + key);
        }
        if (existing !== raw) changes.push([key, raw]);
      }
      return { status: 'prepared', changes };
    }
  }),
  politics: Object.freeze({
    capture(storage) {
      const value = exportPoliticsCheckpoint(storage);
      return Object.keys(value.entries || {}).length ? value : null;
    },
    validate: validatePoliticsPrivatePayload,
    isEmpty: (storage) => subjectStorageIsEmpty(storage, politicsCheckpointKeyAllowed),
    prepare(storage, value) {
      const entries = validatePoliticsPrivatePayload(value);
      const changes = [];
      for (const [key, raw] of entries) {
        const existing = storage.getItem(key);
        if (existing != null && existing !== raw) {
          throw new Error('PRIVATE_CHECKPOINT_POLITICS_CONFLICT_KEEP_LOCAL:' + key);
        }
        if (existing !== raw) changes.push([key, raw]);
      }
      return { status: 'prepared', changes };
    }
  }),
  lexical: Object.freeze({
    capture: captureLexicalCheckpoint,
    validate: validateLexicalCheckpoint,
    isEmpty: (storage) => subjectStorageIsEmpty(storage, lexicalCheckpointKeyAllowed),
    prepare(storage, value) {
      const entries = validateLexicalCheckpoint(value);
      const changes = [];
      for (const [key, raw] of entries) {
        const existing = storage.getItem(key);
        if (existing != null && existing !== raw) {
          throw new Error('PRIVATE_CHECKPOINT_LEXICAL_CONFLICT_KEEP_LOCAL:' + key);
        }
        if (existing !== raw) changes.push([key, raw]);
      }
      return { status: 'prepared', changes };
    }
  })
});

export function capturePrivateSubjectCheckpoints(storage, existingSubjects = {}, { now = Date.now() } = {}) {
  if (!existingSubjects || typeof existingSubjects !== 'object' || Array.isArray(existingSubjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  const next = clone(existingSubjects) || {};
  for (const [subject, adapter] of Object.entries(ADAPTERS)) {
    const captured = adapter.capture(storage, { now });
    if (captured) next[subject] = captured;
  }
  return next;
}

export function preparePrivateSubjectCheckpointRestore(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  const changes = [];
  const results = {};
  for (const [subject, adapter] of Object.entries(ADAPTERS)) {
    const value = subjects[subject];
    if (value == null) {
      results[subject] = { status: 'missing', restored: 0 };
      continue;
    }
    const prepared = adapter.prepare(storage, value, { onlyIfEmpty });
    if (prepared.status === 'skipped') {
      results[subject] = {
        status: 'skipped',
        reason: prepared.reason,
        restored: 0,
        preserved_local_keys: [...(prepared.preserved_local_keys || [])]
      };
      continue;
    }
    const subjectChanges = prepared.changes || [];
    subjectChanges.forEach(([key, raw]) => changes.push([key, raw, subject]));
    results[subject] = {
      status: subjectChanges.length ? 'prepared' : 'present',
      restored: 0,
      pending: subjectChanges.length,
      preserved_local_keys: [...(prepared.preserved_local_keys || [])]
    };
  }
  return { changes, results };
}

export function applyPrivateSubjectCheckpointRestore(storage, prepared) {
  const changes = Array.isArray(prepared?.changes) ? prepared.changes : [];
  const results = clone(prepared?.results || {});
  const restoredBySubject = {};
  for (const [key, raw, subject] of changes) {
    storage.setItem(key, raw);
    restoredBySubject[subject] = (restoredBySubject[subject] || 0) + 1;
  }
  for (const [subject, count] of Object.entries(restoredBySubject)) {
    results[subject] = { status: 'restored', restored: count };
  }
  for (const [subject, row] of Object.entries(results)) {
    if (row.status === 'present') results[subject] = { status: 'present', restored: 0 };
  }
  return results;
}

export function restorePrivateSubjectCheckpoints(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  const prepared = preparePrivateSubjectCheckpointRestore(storage, subjects, { onlyIfEmpty });
  const touched = new Map(prepared.changes.map(([key]) => [key, storage.getItem(key)]));
  try {
    return applyPrivateSubjectCheckpointRestore(storage, prepared);
  } catch (error) {
    for (const [key, raw] of touched.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }
}

export function privateSubjectRestoreNeeded(storage, subjects = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) return false;
  return Object.entries(ADAPTERS).some(([subject, adapter]) =>
    subjects[subject] != null && adapter.isEmpty(storage)
  );
}
