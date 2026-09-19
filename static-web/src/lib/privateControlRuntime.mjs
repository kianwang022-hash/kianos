import {
  PRIVATE_CONTROL_COMMAND_SCHEMA,
  buildPrivateControlReceipt,
  validatePrivateControlCommand
} from './privateControlCommand.mjs';
import { writeExamChatPlan } from './examChatPlan.mjs';
import { applyXizongSessionInstruction } from './xizongSessionInstruction.mjs';

export const PRIVATE_CONTROL_RUNTIME_STATE_KEY = 'kianos:private-control-runtime:v1';

const readJson = (storage, key, fallback = null) => {
  try {
    const raw = storage?.getItem?.(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch {
    return fallback;
  }
};

const writeJson = (storage, key, value) => {
  storage.setItem(key, JSON.stringify(value));
};

export function readPrivateControlRuntimeState(storage) {
  const value = readJson(storage, PRIVATE_CONTROL_RUNTIME_STATE_KEY, null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { schema: 'kianos.private-control-runtime-state.v1', last_command_id: null, receipts: [] };
  }
  return {
    schema: 'kianos.private-control-runtime-state.v1',
    last_command_id: value.last_command_id || null,
    receipts: Array.isArray(value.receipts) ? value.receipts.slice(-100) : []
  };
}

function recordReceipt(storage, state, receipt) {
  const next = {
    ...state,
    last_command_id: receipt.command_id,
    receipts: [...state.receipts, receipt].slice(-100)
  };
  writeJson(storage, PRIVATE_CONTROL_RUNTIME_STATE_KEY, next);
  return receipt;
}

export function applyPrivateControlCommand(storage, rawCommand, {
  expectedDay,
  now = Date.now(),
  englishCatalog = [],
  holdoutYears = []
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('PRIVATE_CONTROL_STORAGE_UNAVAILABLE');
  const state = readPrivateControlRuntimeState(storage);

  let command;
  try {
    command = validatePrivateControlCommand(rawCommand, expectedDay);
  } catch (error) {
    // Invalid envelopes cannot safely name a receipt identity.
    throw error;
  }

  const existing = state.receipts.find((row) => row.command_id === command.command_id);
  if (existing) {
    if (existing.target !== command.target || existing.study_day !== command.study_day) {
      throw new Error('PRIVATE_CONTROL_COMMAND_ID_CONFLICT');
    }
    return existing;
  }

  const active = state.receipts.at(-1) || null;
  if (active && command.supersedes && command.supersedes !== active.command_id) {
    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'REJECTED',
      detail: 'supersedes does not match latest applied/seen command',
      appliedAt: now
    }));
  }

  if (active && Date.parse(command.issued_at) <= Date.parse(active.applied_at)
      && command.command_id !== active.command_id) {
    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'STALE',
      detail: 'older than latest consumed control command',
      appliedAt: now
    }));
  }

  try {
    if (command.target === 'exam.chat_plan') {
      writeExamChatPlan(storage, command.payload, expectedDay);
    } else if (command.target === 'xizong.session') {
      applyXizongSessionInstruction(storage, command.payload, {
        expectedDay,
        now,
        holdoutYears
      });
    } else {
      throw new Error('PRIVATE_CONTROL_TARGET_UNIMPLEMENTED:' + command.target);
    }

    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'APPLIED',
      appliedAt: now
    }));
  } catch (error) {
    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'REJECTED',
      detail: error instanceof Error ? error.message : String(error),
      appliedAt: now
    }));
  }
}
