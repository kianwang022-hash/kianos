import {
  buildPrivateControlReceipt,
  privateControlCommandSignature,
  validatePrivateControlCommand
} from './privateControlCommand.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  readExamChatPlan,
  validateExamChatPlan,
  writeExamChatPlan
} from './examChatPlan.mjs';
import {
  XIZONG_CHAT_SET_KEY,
  XIZONG_SESSION_KEY,
  XIZONG_SESSION_RUNTIME_KEY,
  installAndActivateXizongSessionInstruction
} from './xizongSessionInstruction.mjs';
import { XIZONG_MEMORY_STORAGE_KEY } from './xizongMemoryModel.mjs';
import {
  XIZONG_PENDING_CHAT_RETURN_KEY,
  stageXizongChatReturn
} from './xizongPendingChatReturn.mjs';
import {
  XIZONG_SYSTEM_WU_PENDING_KEY,
  stageXizongSystemWuReturn
} from './xizongSystemWuReturn.mjs';

export const PRIVATE_CONTROL_RUNTIME_STATE_KEY = 'kianos:private-control-runtime:v1';
export const PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA = 'kianos.private-control-runtime-state.v1';

function fail(code, detail = '') {
  throw new Error('PRIVATE_CONTROL_RUNTIME_' + code + (detail ? ':' + detail : ''));
}

function emptyState() {
  return {
    schema: PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA,
    active_by_target: {},
    receipts: []
  };
}

export function validatePrivateControlRuntimeState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA
      || !value.active_by_target || typeof value.active_by_target !== 'object'
      || Array.isArray(value.active_by_target)
      || !Array.isArray(value.receipts)) {
    fail('STATE_INVALID');
  }
  const activeByTarget = {};
  for (const [target, row] of Object.entries(value.active_by_target)) {
    if (!row || typeof row !== 'object' || Array.isArray(row)
        || !row.command_id || !row.command_signature || !row.issued_at || !row.applied_at) {
      fail('STATE_ACTIVE_INVALID', target);
    }
    activeByTarget[target] = {
      command_id: String(row.command_id),
      command_signature: String(row.command_signature),
      issued_at: new Date(row.issued_at).toISOString(),
      applied_at: new Date(row.applied_at).toISOString(),
      study_day: row.study_day ? String(row.study_day) : null
    };
  }
  return {
    schema: PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA,
    active_by_target: activeByTarget,
    receipts: value.receipts.slice(-100).map((row) => ({ ...row }))
  };
}

export function privateControlRuntimeForDay(value, studyDay) {
  const state = validatePrivateControlRuntimeState(value);
  return {
    ...state,
    active_by_target: Object.fromEntries(
      Object.entries(state.active_by_target).filter(([, row]) => row.study_day === studyDay)
    )
  };
}

export function readPrivateControlRuntimeState(storage) {
  if (!storage?.getItem) fail('STORAGE_UNAVAILABLE');
  let raw;
  try { raw = storage.getItem(PRIVATE_CONTROL_RUNTIME_STATE_KEY); }
  catch { fail('STATE_READ_FAILED'); }
  if (raw == null) return emptyState();

  let value;
  try { value = JSON.parse(raw); }
  catch { fail('STATE_JSON_INVALID'); }
  return validatePrivateControlRuntimeState(value);
}

function stateWithReceipt(state, receipt, { activate = false } = {}) {
  const next = {
    schema: PRIVATE_CONTROL_RUNTIME_STATE_SCHEMA,
    active_by_target: { ...(state.active_by_target || {}) },
    receipts: [...(state.receipts || []), receipt].slice(-100)
  };
  if (activate && ['APPLIED','IDEMPOTENT'].includes(receipt.status)) {
    next.active_by_target[receipt.target] = {
      command_id: receipt.command_id,
      command_signature: receipt.command_signature,
      issued_at: receipt.issued_at,
      applied_at: receipt.applied_at,
      study_day: receipt.study_day
    };
  }
  return next;
}

function persistState(storage, state) {
  storage.setItem(PRIVATE_CONTROL_RUNTIME_STATE_KEY, JSON.stringify(state));
  try {
    if (typeof globalThis.CustomEvent === 'function') {
      globalThis.dispatchEvent?.(new CustomEvent('kianos:private-control-change', {
        detail: { key: PRIVATE_CONTROL_RUNTIME_STATE_KEY }
      }));
    }
  } catch {}
}

function targetKeys(target) {
  if (target === 'exam.chat_plan') {
    return [EXAM_CHAT_PLAN_KEY, PRIVATE_CONTROL_RUNTIME_STATE_KEY];
  }
  if (target === 'xizong.session') {
    return [
      XIZONG_SESSION_KEY,
      XIZONG_SESSION_RUNTIME_KEY,
      XIZONG_MEMORY_STORAGE_KEY,
      XIZONG_CHAT_SET_KEY,
      PRIVATE_CONTROL_RUNTIME_STATE_KEY
    ];
  }
  if (target === 'xizong.chat_return') {
    return [
      XIZONG_PENDING_CHAT_RETURN_KEY,
      PRIVATE_CONTROL_RUNTIME_STATE_KEY
    ];
  }
  if (target === 'xizong.system_wu_return') {
    return [
      XIZONG_SYSTEM_WU_PENDING_KEY,
      PRIVATE_CONTROL_RUNTIME_STATE_KEY
    ];
  }
  return [PRIVATE_CONTROL_RUNTIME_STATE_KEY];
}

function snapshot(storage, keys) {
  return new Map([...new Set(keys)].map((key) => [key, storage.getItem(key)]));
}

function restore(storage, before) {
  let rollbackError = null;
  for (const [key, raw] of before.entries()) {
    try {
      if (raw == null) storage.removeItem?.(key);
      else storage.setItem(key, raw);
    } catch (error) {
      rollbackError ||= error;
    }
  }
  if (rollbackError) fail('ROLLBACK_INCOMPLETE');
}

function persistNonAppliedReceipt(storage, state, command, status, detail, now) {
  const receipt = buildPrivateControlReceipt(command, {
    status,
    detail,
    appliedAt: now
  });
  persistState(storage, stateWithReceipt(state, receipt));
  return receipt;
}

function applyExamPlan(storage, command, expectedDay) {
  const plan = validateExamChatPlan(command.payload, expectedDay);
  if (Date.parse(plan.generated_at) > Date.parse(command.issued_at) + 60_000) {
    fail('PLAN_GENERATED_AFTER_COMMAND');
  }
  const current = readExamChatPlan(storage, expectedDay);
  if (current.status === 'invalid' || current.status === 'unavailable') {
    fail('PLAN_CURRENT_UNREADABLE');
  }
  if (current.status === 'ready'
      && Date.parse(plan.generated_at) <= Date.parse(current.plan.generated_at)) {
    fail('PLAN_NOT_NEWER_THAN_CURRENT');
  }
  writeExamChatPlan(storage, plan, expectedDay);
}

export function applyPrivateControlCommand(storage, rawCommand, {
  expectedDay,
  now = Date.now(),
  holdoutYears = []
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const rawState = readPrivateControlRuntimeState(storage);
  const state = expectedDay ? privateControlRuntimeForDay(rawState, expectedDay) : rawState;
  const command = validatePrivateControlCommand(rawCommand);
  const signature = privateControlCommandSignature(command);

  const sameId = state.receipts.find((row) => row.command_id === command.command_id);
  if (sameId) {
    if (sameId.command_signature !== signature) fail('COMMAND_ID_CONFLICT');
    return sameId;
  }

  if (Date.parse(command.issued_at) > Number(now) + 60_000) {
    return persistNonAppliedReceipt(
      storage, state, command, 'REJECTED',
      'command issued_at is too far in the future', now
    );
  }

  if (expectedDay && command.study_day !== expectedDay) {
    return persistNonAppliedReceipt(
      storage, state, command, 'STALE',
      'command study_day does not match current study day', now
    );
  }

  const active = state.active_by_target?.[command.target] || null;
  if (active) {
    if (Date.parse(command.issued_at) <= Date.parse(active.issued_at)) {
      return persistNonAppliedReceipt(
        storage, state, command, 'STALE',
        'command is not newer than active command for target', now
      );
    }
    if (command.supersedes && command.supersedes !== active.command_id) {
      return persistNonAppliedReceipt(
        storage, state, command, 'REJECTED',
        'supersedes does not match active command for target', now
      );
    }
  }
  // supersedes is an optional compare-and-swap guard, not a delivery prerequisite.
  // A newer trusted command may replace the active target without waiting for a
  // remote receipt; this keeps asynchronous relay updates low-friction.

  const before = snapshot(storage, targetKeys(command.target));
  try {
    if (command.target === 'exam.chat_plan') {
      applyExamPlan(storage, command, expectedDay);
    } else if (command.target === 'xizong.session') {
      installAndActivateXizongSessionInstruction(storage, command.payload, {
        expectedDay,
        now,
        holdoutYears
      });
    } else if (command.target === 'xizong.chat_return') {
      // The private control layer has already enforced command identity/replay/time ordering.
      // A newer trusted Return may replace an older unconsumed Return for the same Block.
      stageXizongChatReturn(storage, command.payload, { now, replace: true });
    } else if (command.target === 'xizong.system_wu_return') {
      // Stage only. The exact System Practice page owns current-W/U + reviewed-relation validation.
      stageXizongSystemWuReturn(storage, command.payload, { now, replace: true });
    } else {
      fail('TARGET_UNIMPLEMENTED', command.target);
    }

    const receipt = buildPrivateControlReceipt(command, {
      status: 'APPLIED',
      appliedAt: now
    });
    persistState(storage, stateWithReceipt(state, receipt, { activate: true }));
    return receipt;
  } catch (error) {
    restore(storage, before);
    const detail = error instanceof Error ? error.message : String(error);
    try {
      return persistNonAppliedReceipt(storage, state, command, 'REJECTED', detail, now);
    } catch (receiptError) {
      // Target state has already been rolled back. If even the receipt cannot be
      // persisted, fail loudly rather than pretending the command was observed.
      throw receiptError;
    }
  }
}
