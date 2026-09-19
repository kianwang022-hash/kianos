import {
  EXAM_PROFILE_KEY,
  validateExamProfile
} from './examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  validateExamChatPlan
} from './examChatPlan.mjs';
import {
  PRIVATE_CONTROL_RUNTIME_STATE_KEY,
  privateControlRuntimeForDay,
  readPrivateControlRuntimeState,
  validatePrivateControlRuntimeState
} from './privateControlRuntime.mjs';
import {
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  readStudyTimerState,
  readStudyTimerLedger
} from './studyTimer.mjs';

export const SHARED_CONTROL_CHECKPOINT_SCHEMA = 'kianos.shared-control-checkpoint.v1';

const parse = (storage, key) => {
  const raw = storage?.getItem?.(key);
  if (raw == null) return null;
  return JSON.parse(raw);
};

export function captureSharedControlCheckpoint(storage, {
  studyDay,
  now = Date.now()
} = {}) {
  if (!storage?.getItem) throw new Error('SHARED_CHECKPOINT_STORAGE_UNAVAILABLE');
  const profileRaw = parse(storage, EXAM_PROFILE_KEY);
  const profile = profileRaw == null ? null : validateExamProfile(profileRaw, studyDay);

  const chatRaw = parse(storage, EXAM_CHAT_PLAN_KEY);
  const chatPlan = chatRaw == null || (studyDay && chatRaw?.study_day !== studyDay)
    ? null
    : validateExamChatPlan(chatRaw, studyDay);

  const privateControl = readPrivateControlRuntimeState(storage);
  return {
    schema: SHARED_CONTROL_CHECKPOINT_SCHEMA,
    study_day: studyDay,
    captured_at: new Date(now).toISOString(),
    exam_profile: profile,
    chat_plan: chatPlan,
    private_control_runtime: privateControl,
    study_timer_state: readStudyTimerState(storage),
    study_timer_ledger: readStudyTimerLedger(storage)
  };
}

export function restoreSharedControlCheckpoint(storage, checkpoint, {
  expectedDay = checkpoint?.study_day || null
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('SHARED_CHECKPOINT_STORAGE_UNAVAILABLE');
  if (!checkpoint || checkpoint.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    throw new Error('SHARED_CHECKPOINT_SCHEMA_INVALID');
  }

  const profile = checkpoint.exam_profile == null ? null : validateExamProfile(checkpoint.exam_profile, expectedDay);
  const chatPlan = checkpoint.chat_plan == null ? null : validateExamChatPlan(checkpoint.chat_plan, expectedDay);
  const privateControl = checkpoint.private_control_runtime == null
    ? null
    : privateControlRuntimeForDay(
        validatePrivateControlRuntimeState(checkpoint.private_control_runtime),
        expectedDay
      );
  const timerState = checkpoint.study_timer_state;
  const timerLedger = checkpoint.study_timer_ledger;
  if (!timerState || timerState.schema !== STUDY_TIMER_SCHEMA) throw new Error('SHARED_CHECKPOINT_TIMER_STATE_INVALID');
  if (!timerLedger || timerLedger.schema !== STUDY_TIMER_SCHEMA || !Array.isArray(timerLedger.sessions)) {
    throw new Error('SHARED_CHECKPOINT_TIMER_LEDGER_INVALID');
  }

  const writes = [
    [EXAM_PROFILE_KEY, profile],
    [EXAM_CHAT_PLAN_KEY, chatPlan],
    [PRIVATE_CONTROL_RUNTIME_STATE_KEY, privateControl],
    [STUDY_TIMER_STATE_KEY, timerState],
    [STUDY_TIMER_LEDGER_KEY, timerLedger]
  ];
  const before = new Map(writes.map(([key]) => [key, storage.getItem(key)]));

  try {
    for (const [key, value] of writes) {
      if (value == null) storage.removeItem?.(key);
      else storage.setItem(key, JSON.stringify(value));
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

  return {
    schema: SHARED_CONTROL_CHECKPOINT_SCHEMA,
    restored: true,
    study_day: expectedDay
  };
}
