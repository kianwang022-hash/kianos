import {
  captureXizongPrivateCheckpoint,
  restoreXizongPrivateCheckpoint,
  validateXizongPrivateCheckpoint,
  xizongDurableStorageIsEmpty
} from './xizongPrivateCheckpoint.mjs';

const ADAPTERS = Object.freeze({
  xizong: Object.freeze({
    capture: captureXizongPrivateCheckpoint,
    restore: restoreXizongPrivateCheckpoint,
    validate: validateXizongPrivateCheckpoint,
    isEmpty: xizongDurableStorageIsEmpty
  })
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

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

export function restorePrivateSubjectCheckpoints(storage, subjects = {}, { onlyIfEmpty = true } = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) {
    throw new Error('PRIVATE_SUBJECT_CHECKPOINTS_INVALID');
  }
  const results = {};
  for (const [subject, adapter] of Object.entries(ADAPTERS)) {
    if (subjects[subject] == null) {
      results[subject] = { status: 'missing', restored: 0 };
      continue;
    }
    adapter.validate(subjects[subject]);
    results[subject] = adapter.restore(storage, subjects[subject], { onlyIfEmpty });
  }
  return results;
}

export function privateSubjectRestoreNeeded(storage, subjects = {}) {
  if (!subjects || typeof subjects !== 'object' || Array.isArray(subjects)) return false;
  return Object.entries(ADAPTERS).some(([subject, adapter]) =>
    subjects[subject] != null && adapter.isEmpty(storage)
  );
}
