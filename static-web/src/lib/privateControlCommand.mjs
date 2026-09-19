export const PRIVATE_CONTROL_COMMAND_SCHEMA = 'kianos.private-control-command.v1';
export const PRIVATE_CONTROL_RECEIPT_SCHEMA = 'kianos.private-control-receipt.v1';

const TARGETS = new Set(['exam.chat_plan','xizong.session']);
const clean = (value, max = 500) => String(value || '').trim().slice(0, max);

const validDay = (day) => typeof day === 'string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day + 'T00:00:00Z'));

function fail(code, detail = '') {
  throw new Error('PRIVATE_CONTROL_' + code + (detail ? ':' + detail : ''));
}

export function validatePrivateControlCommand(value, expectedDay = null) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('OBJECT_REQUIRED');
  if (value.schema !== PRIVATE_CONTROL_COMMAND_SCHEMA) fail('SCHEMA_INVALID');

  const commandId = clean(value.command_id || value.commandId, 160);
  if (!commandId) fail('COMMAND_ID_REQUIRED');

  const issuedAt = clean(value.issued_at || value.issuedAt, 80);
  if (!issuedAt || Number.isNaN(Date.parse(issuedAt))) fail('ISSUED_AT_INVALID');

  const studyDay = clean(value.study_day || value.studyDay, 20);
  if (!validDay(studyDay)) fail('STUDY_DAY_INVALID');
  if (expectedDay && studyDay !== expectedDay) fail('STALE_DAY', studyDay);

  const target = clean(value.target, 80);
  if (!TARGETS.has(target)) fail('TARGET_INVALID', target);

  if (!value.payload || typeof value.payload !== 'object' || Array.isArray(value.payload)) {
    fail('PAYLOAD_REQUIRED');
  }

  const supersedes = value.supersedes == null ? null : clean(value.supersedes, 160);
  return {
    schema: PRIVATE_CONTROL_COMMAND_SCHEMA,
    command_id: commandId,
    issued_at: new Date(issuedAt).toISOString(),
    study_day: studyDay,
    target,
    payload: JSON.parse(JSON.stringify(value.payload)),
    supersedes
  };
}

export function buildPrivateControlReceipt(command, {
  status,
  detail = '',
  appliedAt = Date.now()
} = {}) {
  const valid = validatePrivateControlCommand(command);
  const normalizedStatus = clean(status, 40).toUpperCase();
  if (!['APPLIED','IDEMPOTENT','STALE','REJECTED','SUPERSEDED','ERROR'].includes(normalizedStatus)) {
    fail('RECEIPT_STATUS_INVALID', normalizedStatus);
  }
  return {
    schema: PRIVATE_CONTROL_RECEIPT_SCHEMA,
    command_id: valid.command_id,
    target: valid.target,
    study_day: valid.study_day,
    issued_at: valid.issued_at,
    command_signature: privateControlCommandSignature(valid),
    status: normalizedStatus,
    detail: clean(detail, 1000),
    applied_at: new Date(appliedAt).toISOString()
  };
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function privateControlCommandSignature(input) {
  const value = validatePrivateControlCommand(input);
  const raw = JSON.stringify(stable(value));
  let hash = 0x811c9dc5;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return 'cmd-' + hash.toString(16).padStart(8, '0');
}
