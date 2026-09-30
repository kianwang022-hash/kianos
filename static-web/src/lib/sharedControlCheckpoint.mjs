import { EXAM_PROFILE_KEY, validateExamProfile } from './examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_KEY, assertExamChatPlanTimeReadable, validateExamChatPlan
} from './examChatPlan.mjs';
import {
  STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY,
  readStudyTimerState, readStudyTimerLedger
} from './studyTimer.mjs';
import { commitLearnerStorageChanges } from './browserLearnerWriter.mjs';
import { CONTROL_LOCAL_RECEIPT_KEY, validateControlReceipt } from './privateControlCommand.mjs';
import { STEWARD_REALITY_KEY, validateStewardReality } from './stewardReality.mjs';

export const SHARED_CONTROL_CHECKPOINT_SCHEMA = 'kianos.shared-control-checkpoint.v1';

const timerValidator = key => value => {
  if (value == null) throw new Error('SHARED_CHECKPOINT_TIMER_MISSING');
  assertExamChatPlanTimeReadable({ getItem: candidate => candidate === key ? JSON.stringify(value) : null });
  return value;
};
const fields = [
  ['exam_profile', EXAM_PROFILE_KEY, validateExamProfile],
  ['chat_plan', EXAM_CHAT_PLAN_KEY, validateExamChatPlan],
  ['study_timer_state', STUDY_TIMER_STATE_KEY, timerValidator(STUDY_TIMER_STATE_KEY), readStudyTimerState],
  ['study_timer_ledger', STUDY_TIMER_LEDGER_KEY, timerValidator(STUDY_TIMER_LEDGER_KEY), readStudyTimerLedger],
  ['steward_reality_raw', STEWARD_REALITY_KEY, validateStewardReality],
  ['control_receipt_raw', CONTROL_LOCAL_RECEIPT_KEY, validateControlReceipt]
];
const isRaw = field => field.endsWith('_raw');
const fieldWarning = field => 'SHARED_CHECKPOINT_' + ({
  exam_profile: 'PROFILE', chat_plan: 'CHAT_PLAN', study_timer_state: 'TIMER_STATE',
  study_timer_ledger: 'TIMER_LEDGER', steward_reality_raw: 'STEWARD_REALITY', control_receipt_raw: 'RECEIPT'
}[field]) + '_INVALID';

// Transport entries only, including unsupported bytes. Never apply these to
// native storage without validation. Strings in object fields are opaque failed
// captures, not a new executable schema or a repaired native record.
export function sharedControlCheckpointStorageEntries(checkpoint) {
  return fields.map(([field, key]) => {
    const value = checkpoint?.[field];
    return [key, value == null ? null : typeof value === 'string' ? value : JSON.stringify(value), field];
  });
}

export function captureSharedControlCheckpoint(storage, { studyDay, now = Date.now() } = {}) {
  if (!storage?.getItem) throw new Error('SHARED_CHECKPOINT_STORAGE_UNAVAILABLE');
  const checkpoint = {
    schema: SHARED_CONTROL_CHECKPOINT_SCHEMA,
    study_day: studyDay,
    captured_at: new Date(now).toISOString()
  };
  const warnings = [];
  for (const [field, key, validate, readEmpty] of fields) {
    // A denied read is not missing evidence and must still fail the capture.
    const raw = storage.getItem(key);
    if (raw == null) {
      checkpoint[field] = readEmpty ? readEmpty(storage) : null;
      continue;
    }
    try {
      const value = JSON.parse(raw);
      // Validate even yesterday's plan before deciding it is inapplicable.
      const validated = validate(value, field === 'chat_plan' ? null : studyDay);
      checkpoint[field] = isRaw(field) ? raw
        : field === 'chat_plan' && studyDay && value.study_day !== studyDay ? null
          : readEmpty ? readEmpty(storage) : validated;
    } catch {
      checkpoint[field] = raw;
      warnings.push(fieldWarning(field));
    }
  }
  checkpoint.capture_warnings = warnings;
  return checkpoint;
}

export function restoreSharedControlCheckpoint(storage, checkpoint, {
  expectedDay = checkpoint?.study_day || null,
  restoreReceipt = false
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('SHARED_CHECKPOINT_STORAGE_UNAVAILABLE');
  if (!checkpoint || checkpoint.schema !== SHARED_CONTROL_CHECKPOINT_SCHEMA) {
    throw new Error('SHARED_CHECKPOINT_SCHEMA_INVALID');
  }
  const warnings = [];
  const writes = [];
  let receipt = null;
  for (const [field, key, validate, requiredTimer] of fields) {
    const value = checkpoint[field];
    if (value == null && !requiredTimer) continue;
    let raw;
    try {
      // Opaque failed captures in object fields remain unsupported for restore.
      if (!isRaw(field) && typeof value === 'string') throw new Error('OPAQUE_NATIVE_BYTES');
      if (isRaw(field) && typeof value !== 'string') throw new Error('RAW_INVALID');
      const validated = validate(isRaw(field) ? JSON.parse(value) : value, expectedDay);
      raw = isRaw(field) ? value : JSON.stringify(validated);
    } catch {
      warnings.push(fieldWarning(field));
      continue;
    }
    if (field === 'control_receipt_raw') receipt = raw;
    else if (storage.getItem(key) == null) writes.push([key, raw]);
  }
  // Validate existing destination evidence as well; skipping a nonempty local
  // field must not make its corrupt bytes support a success receipt.
  const pending = new Map(writes);
  const overlay = { getItem: key => pending.has(key) ? pending.get(key) : storage.getItem(key) };
  warnings.push(...captureSharedControlCheckpoint(overlay, { studyDay: expectedDay }).capture_warnings);
  // A shared-only restore cannot prove native subject recovery. The coordinator
  // opts in only in its disposable projection; partial shared evidence never
  // admits a receipt, even there. Durable receipt bytes remain untouched.
  if (restoreReceipt && receipt != null && storage.getItem(CONTROL_LOCAL_RECEIPT_KEY) == null) {
    if (Array.isArray(checkpoint.capture_warnings)) {
      // A recorded local-base conflict describes a rejected writer, not corrupt
      // durable bytes. The explicit recovery owner must be able to resolve it.
      // All integrity/partial-source warnings still withhold acknowledgement.
      warnings.push(...checkpoint.capture_warnings.filter(warning =>
        warning !== 'checkpoint:shared:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'));
    }
    if (!warnings.length) writes.push([CONTROL_LOCAL_RECEIPT_KEY, receipt]);
    else warnings.push('SHARED_CHECKPOINT_RECEIPT_WITHHELD_PARTIAL');
  }
  commitLearnerStorageChanges(storage, writes);
  return {
    schema: SHARED_CONTROL_CHECKPOINT_SCHEMA,
    restored: true,
    study_day: expectedDay,
    warnings: [...new Set(warnings)]
  };
}
