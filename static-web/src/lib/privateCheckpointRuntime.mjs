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
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_STATE_KEY,
  studyDayAt
} from './studyTimer.mjs';
import {
  capturePrivateSubjectCheckpoints,
  privateSubjectRestoreNeeded,
  restorePrivateSubjectCheckpoints
} from './privateSubjectCheckpoints.mjs';

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
    return { status: remote?.status || 'unavailable', reason: remote?.error || null, study_day: studyDay };
  }

  const subjects = remote.checkpoint?.payload?.subjects || {};
  const subjectNeeded = privateSubjectRestoreNeeded(storage, subjects);
  if (!sharedEmpty && !subjectNeeded) {
    return { status: 'skipped', reason: 'local-state-present', study_day: studyDay };
  }

  let sharedStatus = 'skipped';
  if (sharedEmpty) {
    const shared = remote.checkpoint?.payload?.shared;
    if (!shared || shared.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
      return { status: 'invalid', reason: 'shared-control-payload-missing', study_day: studyDay };
    }
    const prepared = sharedForCurrentDay(shared, studyDay);
    restoreSharedControlCheckpoint(storage, prepared, { expectedDay: studyDay });
    sharedStatus = 'restored';
  }

  const subjectResults = restorePrivateSubjectCheckpoints(storage, subjects, { onlyIfEmpty: true });
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
