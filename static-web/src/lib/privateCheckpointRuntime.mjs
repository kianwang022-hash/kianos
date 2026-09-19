import {
  EXAM_CHAT_PLAN_KEY
} from './examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY
} from './examOrchestrator.mjs';
import {
  PRIVATE_CONTROL_RUNTIME_STATE_KEY
} from './privateControlRuntime.mjs';
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
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_STATE_KEY,
  studyDayAt
} from './studyTimer.mjs';
import {
  applyPrivateSubjectCheckpointRestore,
  capturePrivateSubjectCheckpoints,
  preparePrivateSubjectCheckpointRestore
} from './privateSubjectCheckpoints.mjs';

export const PRIVATE_CHECKPOINT_RUNTIME_SCHEMA = 'kianos.private-checkpoint-runtime.v1';

const SHARED_STORAGE_KEYS = Object.freeze([
  EXAM_PROFILE_KEY,
  EXAM_CHAT_PLAN_KEY,
  PRIVATE_CONTROL_RUNTIME_STATE_KEY,
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
      return {
        status: 'skipped',
        reason: 'local-state-present',
        remote_status: remote?.status || 'unavailable',
        study_day: studyDay
      };
    }
    return { status: remote?.status || 'unavailable', reason: remote?.error || null, study_day: studyDay };
  }

  const shared = remote.checkpoint?.payload?.shared;
  if (sharedEmpty && (!shared || shared.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA)) {
    return { status: 'invalid', reason: 'shared-control-payload-missing', study_day: studyDay };
  }

  // Validate every subject payload and every keep-local conflict before mutating
  // shared control. A conflict in English/Lexical must not leave Xizong/shared
  // half-restored, and an existing Xizong state remains non-overwritable.
  const preparedSubjects = preparePrivateSubjectCheckpointRestore(
    storage,
    remote.checkpoint?.payload?.subjects || {},
    { onlyIfEmpty: true }
  );

  const subjectNeeded = preparedSubjects.changes.length > 0;
  if (!sharedEmpty && !subjectNeeded) {
    return {
      status: 'skipped',
      reason: 'local-state-present',
      study_day: studyDay,
      subjects: preparedSubjects.results
    };
  }

  const touched = new Set(preparedSubjects.changes.map(([key]) => key));
  if (sharedEmpty) SHARED_STORAGE_KEYS.forEach((key) => touched.add(key));
  const before = new Map([...touched].map((key) => [key, safeGet(storage, key)]));

  let sharedStatus = 'skipped';
  let subjectResults = preparedSubjects.results;
  try {
    if (sharedEmpty) {
      restoreSharedControlCheckpoint(storage, sharedForCurrentDay(shared, studyDay), { expectedDay: studyDay });
      sharedStatus = 'restored';
    }
    subjectResults = applyPrivateSubjectCheckpointRestore(storage, preparedSubjects);
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem?.(key, raw);
      } catch {}
    }
    throw error;
  }

  const subjectRestored = Object.values(subjectResults).some((row) => row?.status === 'restored');
  return {
    status: sharedStatus === 'restored' || subjectRestored ? 'restored' : 'skipped',
    study_day: studyDay,
    checkpoint_id: remote.checkpoint.checkpoint_id,
    source_day: remote.checkpoint.study_day,
    shared: sharedStatus,
    subjects: subjectResults
  };
}

export async function saveSharedControlToPrivate(storage, {
  now = Date.now(),
  readCheckpoint = readPrivateLearnerCheckpoint,
  writeCheckpoint = writePrivateLearnerCheckpoint
} = {}) {
  const studyDay = studyDayAt(now);
  const shared = captureSharedControlCheckpoint(storage, { studyDay, now });

  const existing = await readCheckpoint();
  let existingSubjects = {};
  if (existing?.status === 'ready') {
    if (existing?.checkpoint?.schema !== PRIVATE_CHECKPOINT_SCHEMA) {
      throw new Error('PRIVATE_CHECKPOINT_EXISTING_SCHEMA_INVALID');
    }
    const rawSubjects = existing.checkpoint?.payload?.subjects;
    if (!rawSubjects || typeof rawSubjects !== 'object' || Array.isArray(rawSubjects)) {
      throw new Error('PRIVATE_CHECKPOINT_EXISTING_SUBJECTS_INVALID');
    }
    existingSubjects = rawSubjects;
  } else if (existing?.status !== 'missing') {
    throw new Error('PRIVATE_CHECKPOINT_EXISTING_READ_UNSAFE:' + (existing?.status || 'unknown'));
  }

  const subjects = capturePrivateSubjectCheckpoints(storage, existingSubjects, { now });

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
  let inFlight = null;

  const checkpoint = async () => {
    if (stopped) return;
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        await saveSharedControlToPrivate(storage, { now: now() });
        globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-saved'));
      } catch (error) {
        globalThis.dispatchEvent?.(new CustomEvent('kianos:private-checkpoint-error', {
          detail: { message: error instanceof Error ? error.message : String(error) }
        }));
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  };

  const schedule = () => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void checkpoint();
    }, debounceMs);
  };

  const storageHandler = (event) => {
    if (SHARED_STORAGE_KEYS.includes(event?.key)) schedule();
  };
  const visibilityHandler = () => {
    if (globalThis.document?.visibilityState !== 'hidden') return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void checkpoint();
  };

  globalThis.addEventListener?.('kianos:study-timer-change', schedule);
  globalThis.addEventListener?.('kianos:exam-plan-read-model', schedule);
  globalThis.addEventListener?.('kianos:private-control-change', schedule);
  globalThis.addEventListener?.('storage', storageHandler);
  globalThis.addEventListener?.('focus', schedule);
  globalThis.document?.addEventListener?.('visibilitychange', visibilityHandler);

  interval = setInterval(() => void checkpoint(), intervalMs);
  schedule();

  return {
    schema: PRIVATE_CHECKPOINT_RUNTIME_SCHEMA,
    checkpoint,
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
      globalThis.removeEventListener?.('kianos:study-timer-change', schedule);
      globalThis.removeEventListener?.('kianos:exam-plan-read-model', schedule);
      globalThis.removeEventListener?.('kianos:private-control-change', schedule);
      globalThis.removeEventListener?.('storage', storageHandler);
      globalThis.removeEventListener?.('focus', schedule);
      globalThis.document?.removeEventListener?.('visibilitychange', visibilityHandler);
    }
  };
}
