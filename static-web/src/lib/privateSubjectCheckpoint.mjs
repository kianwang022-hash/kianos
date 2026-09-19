import {
  englishCheckpointKeyAllowed,
  exportEnglishCheckpoint
} from './englishLearnerEvidence.mjs';

export const LEXICAL_PRIVATE_PAYLOAD_SCHEMA = 'kianos.lexical.private-payload.v1';

const lexicalCheckpointKeyAllowed = (key) => {
  const value = String(key || '');
  return value.startsWith('kianos-lexical-') || value.startsWith('kianos-vocabulary-');
};

const readEntries = (storage, allowed) => {
  if (!storage?.getItem || !Number.isFinite(Number(storage.length)) || typeof storage.key !== 'function') return {};
  const entries = {};
  for (let index = 0; index < Number(storage.length); index += 1) {
    const key = storage.key(index);
    if (!allowed(key)) continue;
    const raw = storage.getItem(key);
    if (typeof raw === 'string') entries[key] = raw;
  }
  return entries;
};

export function exportLexicalCheckpoint(storage) {
  return {
    schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA,
    entries: readEntries(storage, lexicalCheckpointKeyAllowed)
  };
}

export function capturePrivateSubjectCheckpoints(storage) {
  const subjects = {};
  const english = exportEnglishCheckpoint(storage);
  if (Object.keys(english.entries || {}).length) subjects.english = english;
  const lexical = exportLexicalCheckpoint(storage);
  if (Object.keys(lexical.entries || {}).length) subjects.lexical = lexical;
  return subjects;
}

function prepareEntries(storage, payload, { schema, allowed, label }) {
  if (!payload || payload.schema !== schema || !payload.entries || typeof payload.entries !== 'object' || Array.isArray(payload.entries)) {
    throw new Error(`PRIVATE_CHECKPOINT_${label}_SCHEMA_INVALID`);
  }
  const changes = [];
  for (const [key, raw] of Object.entries(payload.entries)) {
    if (!allowed(key) || typeof raw !== 'string') throw new Error(`PRIVATE_CHECKPOINT_${label}_KEY_INVALID`);
    const existing = storage.getItem(key);
    if (existing != null && existing !== raw) throw new Error(`PRIVATE_CHECKPOINT_${label}_CONFLICT_KEEP_LOCAL:${key}`);
    if (existing !== raw) changes.push([key, raw]);
  }
  return changes;
}

export function preparePrivateSubjectCheckpointRestore(storage, subjects = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) {
    throw new Error('PRIVATE_CHECKPOINT_SUBJECTS_INVALID');
  }
  const changes = [];
  if (subjects.english) {
    changes.push(...prepareEntries(storage, subjects.english, {
      schema: 'kianos.english.private-payload.v1',
      allowed: englishCheckpointKeyAllowed,
      label: 'ENGLISH'
    }));
  }
  if (subjects.lexical) {
    changes.push(...prepareEntries(storage, subjects.lexical, {
      schema: LEXICAL_PRIVATE_PAYLOAD_SCHEMA,
      allowed: lexicalCheckpointKeyAllowed,
      label: 'LEXICAL'
    }));
  }
  return changes;
}

export function applyPrivateSubjectCheckpointRestore(storage, changes = []) {
  for (const [key, raw] of changes) storage.setItem(key, raw);
  return changes.length;
}
