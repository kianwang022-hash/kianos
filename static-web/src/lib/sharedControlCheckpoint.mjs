import {
  EXAM_PROFILE_KEY,
  validateExamProfile
} from './examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  assertExamChatPlanTimeReadable,
  validateExamChatPlan
} from './examChatPlan.mjs';
import {
  STUDY_TIMER_STATE_KEY,
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  readStudyTimerState,
  readStudyTimerLedger
} from './studyTimer.mjs';

import { CONTROL_LOCAL_RECEIPT_KEY, validateControlReceipt } from './privateControlCommand.mjs';

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

  // Keep the original bytes for recovery; validation is not allowed to make
  // corrupt transport metadata prevent healthy learner evidence backup.
  const receiptRaw = storage.getItem(CONTROL_LOCAL_RECEIPT_KEY);
  assertExamChatPlanTimeReadable(storage);

  return {
    schema: SHARED_CONTROL_CHECKPOINT_SCHEMA,
    study_day: studyDay,
    captured_at: new Date(now).toISOString(),
    exam_profile: profile,
    chat_plan: chatPlan,
    control_receipt_raw: receiptRaw,
    study_timer_state: readStudyTimerState(storage),
    study_timer_ledger: readStudyTimerLedger(storage)
  };
}

export function restoreSharedControlCheckpoint(storage, checkpoint, {
  expectedDay = checkpoint?.study_day || null,
  restoreReceipt = false
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('SHARED_CHECKPOINT_STORAGE_UNAVAILABLE');
  if (!checkpoint || checkpoint.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    throw new Error('SHARED_CHECKPOINT_SCHEMA_INVALID');
  }

  const profile = checkpoint.exam_profile == null ? null : validateExamProfile(checkpoint.exam_profile, expectedDay);
  const chatPlan = checkpoint.chat_plan == null ? null : validateExamChatPlan(checkpoint.chat_plan, expectedDay);
  const timerState = checkpoint.study_timer_state;
  const timerLedger = checkpoint.study_timer_ledger;
  if (!timerState || timerState.schema !== STUDY_TIMER_SCHEMA) throw new Error('SHARED_CHECKPOINT_TIMER_STATE_INVALID');
  if (!timerLedger || timerLedger.schema !== STUDY_TIMER_SCHEMA || !Array.isArray(timerLedger.sessions)) {
    throw new Error('SHARED_CHECKPOINT_TIMER_LEDGER_INVALID');
  }

  const writes = [
    [EXAM_PROFILE_KEY, profile],
    [EXAM_CHAT_PLAN_KEY, chatPlan],
    [STUDY_TIMER_STATE_KEY, timerState],
    [STUDY_TIMER_LEDGER_KEY, timerLedger]
  ];
  const warnings = [];
  // A shared-only restore cannot prove a subject operation survived. The full
  // recovery coordinator opts in only in its disposable projection, then admits
  // the receipt after the matching native checkpoint is actually present.
  // Raw receipt bytes always remain in the durable checkpoint.
  if (checkpoint.control_receipt_raw != null && storage.getItem(CONTROL_LOCAL_RECEIPT_KEY) == null) {
    try {
      if (typeof checkpoint.control_receipt_raw !== 'string') throw new Error('RECEIPT_RAW_INVALID');
      validateControlReceipt(JSON.parse(checkpoint.control_receipt_raw));
      if (restoreReceipt) writes.push([CONTROL_LOCAL_RECEIPT_KEY, checkpoint.control_receipt_raw]);
    } catch {
      warnings.push('SHARED_CHECKPOINT_RECEIPT_INVALID');
    }
  }
  const before = new Map(writes.map(([key]) => [key, storage.getItem(key)]));

  try {
    for (const [key, value] of writes) {
      if (value == null) storage.removeItem?.(key);
      else storage.setItem(key, key === CONTROL_LOCAL_RECEIPT_KEY ? value : JSON.stringify(value));
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
    study_day: expectedDay,
    warnings
  };
}
