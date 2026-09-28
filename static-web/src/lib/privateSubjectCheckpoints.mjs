import {
  captureXizongPrivateCheckpoint,
  validateXizongPrivateCheckpoint,
  xizongDurableStorageIsEmpty,
  isXizongDurableStorageKey,
  prepareXizongPrivateCheckpointRestore
} from './xizongPrivateCheckpoint.mjs';
import {
  englishCheckpointKeyAllowed,
  exportEnglishCheckpoint,
  inspectEnglishCheckpoint,
  restoreEnglishCheckpoint
} from './englishLearnerEvidence.mjs';
import {
  exportPoliticsCheckpoint,
  politicsCheckpointKeyAllowed,
  validatePoliticsPrivatePayload
} from './politicsChatReturn.mjs';

import { LEXICAL_LEDGER_STORAGE_KEY, assertLexicalLedgerReadable } from './lexicalEvidence.mjs';

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

const validateEnglishCheckpoint = (value) => {
  const integrity = inspectEnglishCheckpoint(value);
  if (integrity.status === 'corrupt-retained') throw new Error('PRIVATE_CHECKPOINT_ENGLISH_CORRUPT_RETAINED');
  return Object.entries(value.entries);
};
const validateLexicalCheckpoint = (value) => {
  const entries = validateEntriesPayload(value, {
    schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA, allowed: lexicalCheckpointKeyAllowed, label: 'LEXICAL'
  });
  const ledger = value.entries[LEXICAL_LEDGER_STORAGE_KEY];
  if (ledger != null) assertLexicalLedgerReadable(JSON.parse(ledger));
  return entries;
};

// Disposable transaction storage only; never a second persistent learner store.
class RestoreStorage {
  constructor(storage) {
    this.map = new Map(listStorageKeys(storage).filter(key =>
      englishCheckpointKeyAllowed(key) || lexicalCheckpointKeyAllowed(key)
      || politicsCheckpointKeyAllowed(key) || isXizongDurableStorageKey(key)
    ).map(key => [key, storage.getItem(key)]));
  }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, raw) { this.map.set(key, String(raw)); }
  removeItem(key) { this.map.delete(key); }
}
const changesBetween = (before, after) => [...new Set([...before.map.keys(), ...after.map.keys()])]
  .filter(key => before.getItem(key) !== after.getItem(key))
  .map(key => [key, after.getItem(key)]);
const applyChanges = (storage, changes) => changes.forEach(([key, raw]) =>
  raw == null ? storage.removeItem(key) : storage.setItem(key, raw));

const ADAPTERS = Object.freeze({
  xizong: Object.freeze({
    capture: captureXizongPrivateCheckpoint,
    validate: validateXizongPrivateCheckpoint,
    isEmpty: xizongDurableStorageIsEmpty,
    prepare(storage, value) {
      const result = prepareXizongPrivateCheckpointRestore(storage, value);
      return { ...result, changes: result.changes.map(({ key, raw }) => [key, raw]) };
    }
  }),
  english: Object.freeze({
    capture: captureEnglishCheckpoint,
    validate: validateEnglishCheckpoint,
    isEmpty: (storage) => subjectStorageIsEmpty(storage, englishCheckpointKeyAllowed),
    prepare(storage, value) {
      validateEnglishCheckpoint(value);
      const before = new RestoreStorage(storage), staged = new RestoreStorage(storage);
      restoreEnglishCheckpoint(staged, value, { keepLocal: true });
      return { status: 'prepared', changes: changesBetween(before, staged) };
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
          continue;
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
          continue;
        }
        if (existing !== raw) changes.push([key, raw]);
      }
      return { status: 'prepared', changes };
    }
  })
});

export const SUBJECT_CHECKPOINT_GROUPS = Object.freeze([
  Object.freeze({ id: 'xizong', subjects: Object.freeze(['xizong']) }),
  Object.freeze({ id: 'english+lexical', subjects: Object.freeze(['english', 'lexical']) }),
  Object.freeze({ id: 'politics', subjects: Object.freeze(['politics']) })
]);
const RESTORE_GROUPS = SUBJECT_CHECKPOINT_GROUPS.map(({ id, subjects }) => ({ id, subjects: [...subjects] }));

export const sameCheckpointRaw = (a, b) => {
  if (a === b) return true;
  const normalize = value => Array.isArray(value) ? value.map(normalize)
    : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])])) : value;
  try { return JSON.stringify(normalize(JSON.parse(a))) === JSON.stringify(normalize(JSON.parse(b))); }
  catch { return false; }
};
export const subjectCheckpointEntries = value => Array.isArray(value?.entries)
  ? value.entries.map(({key, raw}) => [key, raw]) : Object.entries(value?.entries || {});
export const subjectCheckpointConflicts = (storage, value) => subjectCheckpointEntries(value)
  .some(([key, raw]) => storage.getItem(key) != null && !sameCheckpointRaw(storage.getItem(key), raw));

export function capturePrivateSubjectCheckpoints(storage, existingSubjects = {}, {
  now = Date.now(),
  warnings = [],
  allowLocalChanges = false,
  allowLocalChangesByGroup = {}
} = {}) {
  if (!existingSubjects || typeof existingSubjects !== 'object' || Array.isArray(existingSubjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  const next = clone(existingSubjects) || {};
  for (const group of RESTORE_GROUPS) {
    try {
      const staged = new RestoreStorage(storage);
      const localGroupChangesAllowed = Object.prototype.hasOwnProperty.call(allowLocalChangesByGroup, group.id)
        ? Boolean(allowLocalChangesByGroup[group.id])
        : Boolean(allowLocalChanges);
      for (const subject of group.subjects) {
        const adapter = ADAPTERS[subject], current = adapter.capture(staged, { now });
        if (current) adapter.validate(current);
        const prior = existingSubjects[subject];
        if (prior) {
          if (!localGroupChangesAllowed && subjectCheckpointConflicts(storage, prior)) {
            throw new Error('PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT');
          }
          const prepared = adapter.prepare(staged, prior, { onlyIfEmpty: true });
          if (prepared.blocked?.length) throw new Error('PRIVATE_CHECKPOINT_NATIVE_RETIREMENT_AMBIGUOUS');
          applyChanges(staged, prepared.changes || []);
        }
      }
      const captured = Object.fromEntries(group.subjects.map(subject => [subject, ADAPTERS[subject].capture(staged, { now })]));
      for (const [subject, value] of Object.entries(captured)) if (value) next[subject] = value;
    } catch (error) {
      // Preserve the last durable group and raw local bytes; healthy siblings save.
      warnings.push('checkpoint:' + group.id + ':' + String(error.message || error));
    }
  }
  return next;
}

export function preparePrivateSubjectCheckpointRestore(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  const changes = [], results = {};
  for (const group of RESTORE_GROUPS) {
    const pending = [], rows = {};
    try {
      for (const subject of group.subjects) {
        const adapter = ADAPTERS[subject], value = subjects[subject];
        const local = adapter.capture(storage);
        if (local) adapter.validate(local);
        if (value == null) { rows[subject] = { status: 'missing', restored: 0 }; continue; }
        const prepared = adapter.prepare(storage, value, { onlyIfEmpty });
        const subjectChanges = prepared.changes || [];
        subjectChanges.forEach(([key, raw]) => pending.push([key, raw, subject]));
        rows[subject] = {
          status: prepared.blocked?.length ? (subjectChanges.length ? 'partial' : 'blocked') : subjectChanges.length ? 'prepared' : 'present',
          restored: 0, pending: subjectChanges.length,
          ...(prepared.blocked?.length ? { blocked: prepared.blocked } : {})
        };
      }
      changes.push(...pending); Object.assign(results, rows);
    } catch (error) {
      for (const subject of group.subjects) results[subject] = { status: 'blocked', restored: 0, reason: String(error.message || error) };
    }
  }
  return { changes, results };
}

export function applyPrivateSubjectCheckpointRestore(storage, prepared) {
  const changes = Array.isArray(prepared?.changes) ? prepared.changes : [];
  const results = clone(prepared?.results || {});
  const restoredBySubject = {};
  for (const [key, raw, subject] of changes) {
    if (raw == null) storage.removeItem(key);
    else storage.setItem(key, raw);
    restoredBySubject[subject] = (restoredBySubject[subject] || 0) + 1;
  }
  for (const [subject, count] of Object.entries(restoredBySubject)) {
    results[subject] = { ...results[subject], status: results[subject]?.blocked?.length ? 'partial' : 'restored', restored: count, pending: 0 };
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
