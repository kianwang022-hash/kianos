import {
  POLITICS_CHAT_RETURN_SCHEMA,
  applyPoliticsChatReturn
} from './politicsChatReturn.mjs';

export const POLITICS_CONTROL_COMMAND_SCHEMA = 'kianos.politics.control-command.v1';
export const POLITICS_CONTROL_RECEIPT_PREFIX = 'kianos-politics-control-receipt-v1:';

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function fail(code, detail = '') {
  throw new Error('POLITICS_CONTROL_' + code + (detail ? ':' + detail : ''));
}

export function validatePoliticsControlCommand(input, {
  expectedDay = null,
  now = Date.now()
} = {}) {
  if (!record(input) || input.schema !== POLITICS_CONTROL_COMMAND_SCHEMA) fail('SCHEMA_INVALID');
  const commandId = clean(input.command_id, 160);
  const studyDay = clean(input.study_day, 20);
  const issuedAt = clean(input.issued_at, 80);
  if (!commandId) fail('ID_REQUIRED');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(studyDay)) fail('DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) fail('STALE_DAY', studyDay);
  if (!issuedAt || Number.isNaN(Date.parse(issuedAt))) fail('ISSUED_AT_INVALID');
  if (Date.parse(issuedAt) > Number(now) + 60_000) fail('FUTURE_COMMAND');
  if (!record(input.payload) || input.payload.schema !== POLITICS_CHAT_RETURN_SCHEMA) {
    fail('PAYLOAD_INVALID');
  }
  if (String(input.payload.study_day || '') !== studyDay) fail('PAYLOAD_DAY_MISMATCH');

  return {
    schema: POLITICS_CONTROL_COMMAND_SCHEMA,
    command_id: commandId,
    study_day: studyDay,
    issued_at: new Date(issuedAt).toISOString(),
    payload: JSON.parse(JSON.stringify(input.payload))
  };
}

export function applyPoliticsControlCommand(storage, catalog, input, options = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const command = validatePoliticsControlCommand(input, options);
  const receiptKey = POLITICS_CONTROL_RECEIPT_PREFIX + command.command_id;
  const previous = storage.getItem(receiptKey);

  if (previous != null) {
    let receipt;
    try { receipt = JSON.parse(previous); }
    catch { fail('RECEIPT_UNREADABLE', command.command_id); }
    if (receipt?.command_id !== command.command_id) fail('RECEIPT_CONFLICT', command.command_id);
    return { status: 'idempotent', receipt };
  }

  let result;
  try {
    result = applyPoliticsChatReturn(storage, catalog, command.payload, options);
  } catch (error) {
    const message = String(error?.message || error);
    const receipt = {
      schema: 'kianos.politics.control-receipt.v1',
      command_id: command.command_id,
      study_day: command.study_day,
      applied_at: new Date(Number(options.now ?? Date.now())).toISOString(),
      status: /STALE|DAY_MISMATCH|CATALOG_MISMATCH|STALE_BATCH/.test(message) ? 'STALE' : 'REJECTED',
      error: message
    };
    storage.setItem(receiptKey, JSON.stringify(receipt));
    return { status: 'rejected', receipt };
  }

  const receipt = {
    schema: 'kianos.politics.control-receipt.v1',
    command_id: command.command_id,
    study_day: command.study_day,
    applied_at: new Date(Number(options.now ?? Date.now())).toISOString(),
    status: result.status === 'idempotent' ? 'IDEMPOTENT' : 'APPLIED',
    batch_id: result.value?.batch_id || null,
    return_signature: result.value?.return_signature || null
  };
  storage.setItem(receiptKey, JSON.stringify(receipt));
  return { status: result.status, receipt, value: result.value };
}
