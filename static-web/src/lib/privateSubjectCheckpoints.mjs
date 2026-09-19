import {
  captureXizongPrivateCheckpoint,
  restoreXizongPrivateCheckpoint,
  validateXizongPrivateCheckpoint,
  xizongDurableStorageIsEmpty
} from './xizongPrivateCheckpoint.mjs';
import {
  englishCheckpointKeyAllowed,
  exportEnglishCheckpoint
} from './englishLearnerEvidence.mjs';

export const LEXICAL_PRIVATE_PAYLOAD_SCHEMA = 'kianos.lexical.private-payload.v1';
export const ENGLISH_PRIVATE_PAYLOAD_SCHEMA = 'kianos.english.private-payload.v1';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function storageKeys(storage) {
  if (!storage?.getItem || typeof storage.key !== 'function') return [];
  const keys = [];
  for (let index = 0; index < Number(storage.length || 0); index += 1) {
    const key = storage.key(index);
    if (typeof key === 'string') keys.push(key);
  }
  return [...new Set(keys)];
}

function lexicalCheckpointKeyAllowed(key) {
  const value = String(key || '');
  return value.startsWith('kianos-lexical-') || value.startsWith('kianos-vocabulary-');
}

function payloadEntries(value, { schema, allowed, label }) {
  if (!value || value.schema !== schema || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) {
    throw new Error(`PRIVATE_CHECKPOINT_${label}_SCHEMA_INVALID`);
  }
  const entries = [];
  for (const [key, raw] of Object.entries(value.entries)) {
    if (!allowed(key) || typeof raw !== 'string') throw new Error(`PRIVATE_CHECKPOINT_${label}_KEY_INVALID:${key}`);
    try { JSON.parse(raw); }
    catch { throw new Error(`PRIVATE_CHECKPOINT_${label}_JSON_INVALID:${key}`); }
    entries.push({ key, raw });
  }
  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

function captureLexicalPrivateCheckpoint(storage) {
  const entries = {};
  for (const key of storageKeys(storage).filter(lexicalCheckpointKeyAllowed).sort()) {
    const raw = storage.getItem(key);
    if (typeof raw !== 'string') continue;
    try { JSON.parse(raw); }
    catch { throw new Error('PRIVATE_CHECKPOINT_LEXICAL_JSON_INVALID:' + key); }
    entries[key] = raw;
  }
  return Object.keys(entries).length ? { schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA, entries } : null;
}

function validateEnglishPrivateCheckpoint(value) {
  const entries = payloadEntries(value, {
    schema: ENGLISH_PRIVATE_PAYLOAD_SCHEMA,
    allowed: englishCheckpointKeyAllowed,
    label: 'ENGLISH'
  });
  return { schema: ENGLISH_PRIVATE_PAYLOAD_SCHEMA, entries };
}

function validateLexicalPrivateCheckpoint(value) {
  const entries = payloadEntries(value, {
    schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA,
    allowed: lexicalCheckpointKeyAllowed,
    label: 'LEXICAL'
  });
  return { schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA, entries };
}

function englishDurableStorageIsEmpty(storage) {
  return !storageKeys(storage).some(englishCheckpointKeyAllowed);
}

function lexicalDurableStorageIsEmpty(storage) {
  return !storageKeys(storage).some(lexicalCheckpointKeyAllowed);
}

function restoreEntryPayload(storage, validated, { onlyIfEmpty, isEmpty, label }) {
  if (onlyIfEmpty && !isEmpty(storage)) {
    return { status: 'skipped', reason: `${label.toLowerCase()}-local-state-present`, restored: 0 };
  }
  for (const { key, raw } of validated.entries) storage.setItem(key, raw);
  return { status: 'restored', restored: validated.entries.length };
}

const ADAPTERS = Object.freeze({
  xizong: Object.freeze({
    capture: captureXizongPrivateCheckpoint,
    validate: validateXizongPrivateCheckpoint,
    isEmpty: xizongDurableStorageIsEmpty,
    touched(input) { return validateXizongPrivateCheckpoint(input).entries.map(({ key }) => key); },
    restore: restoreXizongPrivateCheckpoint
  }),
  english: Object.freeze({
    capture(storage) {
      const payload = exportEnglishCheckpoint(storage);
      return Object.keys(payload.entries || {}).length ? payload : null;
    },
    validate: validateEnglishPrivateCheckpoint,
    isEmpty: englishDurableStorageIsEmpty,
    touched(input) { return validateEnglishPrivateCheckpoint(input).entries.map(({ key }) => key); },
    restore(storage, input, { onlyIfEmpty = true } = {}) {
      return restoreEntryPayload(storage, validateEnglishPrivateCheckpoint(input), {
        onlyIfEmpty,
        isEmpty: englishDurableStorageIsEmpty,
        label: 'ENGLISH'
      });
    }
  }),
  lexical: Object.freeze({
    capture: captureLexicalPrivateCheckpoint,
    validate: validateLexicalPrivateCheckpoint,
    isEmpty: lexicalDurableStorageIsEmpty,
    touched(input) { return validateLexicalPrivateCheckpoint(input).entries.map(({ key }) => key); },
    restore(storage, input, { onlyIfEmpty = true } = {}) {
      return restoreEntryPayload(storage, validateLexicalPrivateCheckpoint(input), {
        onlyIfEmpty,
        isEmpty: lexicalDurableStorageIsEmpty,
        label: 'LEXICAL'
      });
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

export function validatePrivateSubjectCheckpoints(subjects = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  for (const [subject, adapter] of Object.entries(ADAPTERS)) {
    if (subjects[subject] != null) adapter.validate(subjects[subject]);
  }
  return true;
}

export function privateSubjectRestoreTouchedKeys(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  validatePrivateSubjectCheckpoints(subjects);
  const keys = [];
  for (const [subject, adapter] of Object.entries(ADAPTERS)) {
    if (subjects[subject] == null) continue;
    if (onlyIfEmpty && !adapter.isEmpty(storage)) continue;
    keys.push(...adapter.touched(subjects[subject]));
  }
  return [...new Set(keys)];
}

export function restorePrivateSubjectCheckpoints(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  validatePrivateSubjectCheckpoints(subjects);
  const touched = privateSubjectRestoreTouchedKeys(storage, subjects, { onlyIfEmpty });
  const before = new Map(touched.map((key) => [key, storage.getItem(key)]));
  const results = {};
  try {
    for (const [subject, adapter] of Object.entries(ADAPTERS)) {
      if (subjects[subject] == null) {
        results[subject] = { status: 'missing', restored: 0 };
        continue;
      }
      results[subject] = adapter.restore(storage, subjects[subject], { onlyIfEmpty });
    }
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }
  return results;
}

export function privateSubjectRestoreNeeded(storage, subjects = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) return false;
  return Object.entries(ADAPTERS).some(([subject, adapter]) =>
    subjects[subject] != null && adapter.isEmpty(storage)
  );
}
