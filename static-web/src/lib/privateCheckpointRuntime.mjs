import {
  EXAM_CHAT_PLAN_KEY
} from './examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY
} from './examOrchestrator.mjs';
import {
  PRIVATE_CHECKPOINT_SCHEMA,
  buildPrivateLearnerCheckpoint,
  readPrivateLearnerCheckpoint,
  writePrivateLearnerCheckpoint
} from './privateLearnerCheckpoint.mjs';
import {
  SHARED_CONTROL_CHECKPOINT_SCHEMA,
  captureSharedControlCheckpoint,
  restoreSharedControlCheckpoint
} from './sharedControlCheckpoint.mjs';
import {
  capturePrivateSubjectCheckpoints,
  preparePrivateSubjectCheckpointRestore,
  applyPrivateSubjectCheckpointRestore
} from './privateSubjectCheckpoint.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_STATE_KEY,
  studyDayAt
} from './studyTimer.mjs';

export const PRIVATE_CHECKPOINT_RUNTIME_SCHEMA = 'kianos.private-checkpoint-runtime.v1';

const SHARED_STORAGE_KEYS = Object.freeze([
  EXAM_PROFILE_KEY,
  EXAM_CHAT_PLAN_KEY,
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY
]);

const safeGet = (storage, key) => {
  try { return storage?.getItem?.(key) ?? null; }
  catch { return null; }
};

export function sharedControlStorageIsEmpty(storage) {
  return SHARED_STORAGE_KEYS.every((key) => safeGet(storage, key) == null);
}

function sharedForCurrentDay(shared, currentDay) {
  if (!shared || shared.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    throw new Error('PRIVATE_CHECKPOINT_SHARED_CONTROL_INVALID');
  }
  return {
    ...shared,
    study_day: currentDay,
    chat_plan: shared.study_day === currentDay ? shared.chat_plan : null
  };
}

export async function restoreSharedControlFromPrivate(storage, {
  now = Date.now(),
  readCheckpoint = readPrivateLearnerCheckpoint
} = {}) {
  const studyDay = studyDayAt(now);
  const sharedEmpty = sharedControlStorageIsEmpty(storage);
  const remote = await readCheckpoint();
  if (remote?.status !== 'ready' || remote?.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA) {
    if (!sharedEmpty) {
      return { status: 'skipped', reason: 'local-state-present', remote_status: remote?.status || 'unavailable', study_day: studyDay };
    }
    return { status: remote?.status || 'unavailable', reason: remote?.error || null, study_day: studyDay };
  }

  const shared = remote.checkpoint?.payload?.shared;
  if (!shared || shared.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    return { status: 'invalid', reason: 'shared-control-payload-missing', study_day: studyDay };
  }

  const subjectChanges = preparePrivateSubjectCheckpointRestore(storage, remote.checkpoint?.payload?.subjects || {});
  if (!sharedEmpty && subjectChanges.length === 0) {
    return { status: 'skipped', reason: 'local-state-present', study_day: studyDay };
  }

  const touched = new Set(subjectChanges.map(([key]) => key));
  if (sharedEmpty) SHARED_STORAGE_KEYS.forEach((key) => touched.add(key));
  const before = new Map([...touched].map((key) => [key, safeGet(storage, key)]));
  try {
    if (sharedEmpty) {
      const prepared = sharedForCurrentDay(shared, studyDay);
      restoreSharedControlCheckpoint(storage, prepared, { expectedDay: studyDay });
    }
    applyPrivateSubjectCheckpointRestore(storage, subjectChanges);
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem?.(key, raw);
      } catch {}
    }
    throw error;
  }
  return {
    status: 'restored',
    study_day: studyDay,
    checkpoint_id: remote.checkpoint.checkpoint_id,
    source_day: remote.checkpoint.study_day,
    restored_shared: sharedEmpty,
    restored_subject_entries: subjectChanges.length
  };
}

export async function saveSharedControlToPrivate(storage, {
  now = Date.now(),
  readCheckpoint = readPrivateLearnerCheckpoint,
  writeCheckpoint = writePrivateLearnerCheckpoint
} = {}) {
  const studyDay = studyDayAt(now);
  const shared = captureSharedControlCheckpoint(storage, { studyDay, now });

  let subjects = {};
  const existing = await readCheckpoint();
  if (existing?.status === 'unavailable' || existing?.status === 'invalid') {
    throw new Error('PRIVATE_CHECKPOINT_READ_UNSAFE:' + (existing?.error || existing?.status));
  }
  if (existing?.status === 'ready') {
    if (existing?.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA
        || !existing?.checkpoint?.payload?.subjects
        || typeof existing.checkpoint.payload.subjects !== 'object'
        || Array.isArray(existing.checkpoint.payload.subjects)) {
      throw new Error('PRIVATE_CHECKPOINT_EXISTING_SUBJECTS_INVALID');
    }
    subjects = existing.checkpoint.payload.subjects;
  }
  subjects = { ...subjects, ...capturePrivateSubjectCheckpoints(storage) };

  const checkpoint = buildPrivateLearnerCheckpoint({
    studyDay,
    now,
    shared,
    subjects
  });
  await writeCheckpoint(checkpoint);
  return {
    status: 'saved',
    study_day: studyDay,
    checkpoint_id: checkpoint.checkpoint_id
  };
}

export function initPrivateCheckpointAutosave(storage, {
  intervalMs = 5 * 60 * 1000,
  debounceMs = 2500,
  now = () => Date.now()
} = {}) {
  if (!storage?.getItem) return { stop() {}, checkpoint() {} };

  let timer = null;
  let interval = null;
  let stopped = false;

  const checkpoint = async () => {
    if (stopped) return;
    try {
      await saveSharedControlToPrivate(storage, { now: now() });
      globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-saved'));
    } catch (error) {
      globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-error', {
        detail: { message: error instanceof Error ? error.message : String(error) }
      }));
    }
  };

  const schedule = () => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void checkpoint();
    }, debounceMs);
  };

  globalThis.addEventListener?.('kianos:study-timer-change', schedule);
  globalThis.addEventListener?.('kianos:exam-plan-read-model', schedule);
  globalThis.addEventListener?.('storage', (event) => {
    if (SHARED_STORAGE_KEYS.includes(event?.key)) schedule();
  });
  globalThis.addEventListener?.('focus', schedule);

  interval = setInterval(() => void checkpoint(), intervalMs);
  schedule();

  return {
    schema: PRIVATE_CHECKPOINT_RUNTIME_SCHEMA,
    checkpoint,
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    }
  };
}
