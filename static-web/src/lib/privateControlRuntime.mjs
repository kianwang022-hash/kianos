import {
  buildPrivateControlReceipt,
  privateControlCommandSignature,
  validatePrivateControlCommand
} from './privateControlCommand.mjs';
import { writeExamChatPlan } from './examChatPlan.mjs';
import {
  activateXizongSessionNext,
  applyXizongSessionInstruction
} from './xizongSessionInstruction.mjs';

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
    return {
      schema: 'kianos.private-control-runtime-state.v1',
      active_by_target: {},
      receipts: []
    };
  }
  return {
    schema: 'kianos.private-control-runtime-state.v1',
    active_by_target: value.active_by_target && typeof value.active_by_target === 'object'
      ? { ...value.active_by_target }
      : {},
    receipts: Array.isArray(value.receipts) ? value.receipts.slice(-100) : []
  };
}

function persistState(storage, state) {
  writeJson(storage, PRIVATE_CONTROL_RUNTIME_STATE_KEY, {
    schema: 'kianos.private-control-runtime-state.v1',
    active_by_target: { ...(state.active_by_target || {}) },
    receipts: [...(state.receipts || [])].slice(-100)
  });
}

function recordReceipt(storage, state, receipt, { activate = false } = {}) {
  const next = {
    ...state,
    active_by_target: { ...state.active_by_target },
    receipts: [...state.receipts, receipt].slice(-100)
  };
  if (activate && ['APPLIED','IDEMPOTENT'].includes(receipt.status)) {
    next.active_by_target[receipt.target] = {
      command_id: receipt.command_id,
      command_signature: receipt.command_signature,
      issued_at: receipt.issued_at,
      applied_at: receipt.applied_at
    };
  }
  persistState(storage, next);
  return receipt;
}

export function applyPrivateControlCommand(storage, rawCommand, {
  expectedDay,
  now = Date.now(),
  holdoutYears = []
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('PRIVATE_CONTROL_STORAGE_UNAVAILABLE');
  const state = readPrivateControlRuntimeState(storage);
  const command = validatePrivateControlCommand(rawCommand, expectedDay);
  const signature = privateControlCommandSignature(command);

  const sameId = state.receipts.find((row) => row.command_id === command.command_id);
  if (sameId) {
    if (sameId.command_signature !== signature) {
      throw new Error('PRIVATE_CONTROL_COMMAND_ID_CONFLICT');
    }
    return sameId;
  }

  const active = state.active_by_target?.[command.target] || null;
  if (active) {
    if (command.supersedes && command.supersedes !== active.command_id) {
      return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
        status: 'REJECTED',
        detail: 'supersedes does not match active command for target',
        appliedAt: now
      }));
    }
    if (!command.supersedes) {
      return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
        status: 'REJECTED',
        detail: 'new command must explicitly supersede active command for target',
        appliedAt: now
      }));
    }
    if (Date.parse(command.issued_at) <= Date.parse(active.issued_at)) {
      return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
        status: 'STALE',
        detail: 'command is not newer than active command for target',
        appliedAt: now
      }));
    }
  } else if (command.supersedes) {
    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'REJECTED',
      detail: 'supersedes provided but no active command exists for target',
      appliedAt: now
    }));
  }

  try {
    if (command.target === 'exam.chat_plan') {
      writeExamChatPlan(storage, command.payload, expectedDay);
    } else if (command.target === 'xizong.session') {
      const installed = applyXizongSessionInstruction(storage, command.payload, {
        expectedDay,
        now
      });
      if (installed.status === 'applied' || installed.status === 'idempotent') {
        activateXizongSessionNext(storage, installed.instruction, { holdoutYears, now });
      }
    } else {
      throw new Error('PRIVATE_CONTROL_TARGET_UNIMPLEMENTED:' + command.target);
    }

    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'APPLIED',
      appliedAt: now
    }), { activate: true });
  } catch (error) {
    return recordReceipt(storage, state, buildPrivateControlReceipt(command, {
      status: 'REJECTED',
      detail: error instanceof Error ? error.message : String(error),
      appliedAt: now
    }));
  }
}
