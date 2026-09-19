import {
  XIZONG_CHAT_RETURN_SCHEMA,
  applyXizongChatReturn,
  parseXizongChatReturn,
  readXizongChatHandoff
} from './xizongChatReturn.mjs';

export const XIZONG_PENDING_CHAT_RETURN_SCHEMA = 'kianos.xizong.pending-chat-return.v1';
export const XIZONG_PENDING_CHAT_RETURN_KEY = 'kianos:xizong:pending-chat-return:v1';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const text = (value, max = 1200) => String(value || '').trim().slice(0, max);

function fail(code, detail = '') {
  throw new Error('XIZONG_PENDING_RETURN_' + code + (detail ? ':' + detail : ''));
}

function readJson(storage, key, fallback = null) {
  const raw = storage?.getItem?.(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); }
  catch { fail('STATE_JSON_INVALID', key); }
}

function emptyState() {
  return {
    schema: XIZONG_PENDING_CHAT_RETURN_SCHEMA,
    pending_by_object: {},
    last_receipt: null
  };
}

export function validateXizongPendingChatReturnState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || value.schema !== XIZONG_PENDING_CHAT_RETURN_SCHEMA
      || !value.pending_by_object || typeof value.pending_by_object !== 'object'
      || Array.isArray(value.pending_by_object)) {
    fail('STATE_INVALID');
  }
  return {
    schema: XIZONG_PENDING_CHAT_RETURN_SCHEMA,
    pending_by_object: clone(value.pending_by_object),
    last_receipt: value.last_receipt == null ? null : clone(value.last_receipt)
  };
}

export function readXizongPendingChatReturnState(storage) {
  if (!storage?.getItem) fail('STORAGE_UNAVAILABLE');
  const value = readJson(storage, XIZONG_PENDING_CHAT_RETURN_KEY, null);
  return value == null ? emptyState() : validateXizongPendingChatReturnState(value);
}

function writeState(storage, state) {
  storage.setItem(
    XIZONG_PENDING_CHAT_RETURN_KEY,
    JSON.stringify(validateXizongPendingChatReturnState(state))
  );
}

function storedEnvelope(raw, handoff, now) {
  return {
    handoff_id: handoff.handoff_id,
    return_id: text(raw.return_id, 160),
    object_id: handoff.origin.object_id,
    system_id: handoff.origin.system_id,
    block_id: handoff.origin.block_id,
    source_hash: handoff.origin.source_hash,
    evidence_version: handoff.origin.evidence_version,
    return_href: handoff.return_href,
    received_at: new Date(now).toISOString(),
    return_packet: clone(raw)
  };
}

export function stageXizongChatReturn(storage, input, {
  now = Date.now(),
  replace = false
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const raw = parseXizongChatReturn(input);
  if (raw.schema !== XIZONG_CHAT_RETURN_SCHEMA) fail('RETURN_SCHEMA_INVALID');
  const handoffId = text(raw.handoff_id, 160);
  const returnId = text(raw.return_id, 160);
  if (!handoffId || !returnId) fail('RETURN_IDENTITY_REQUIRED');

  const handoff = readXizongChatHandoff(storage, handoffId);
  const objectId = handoff.origin.object_id;
  const state = readXizongPendingChatReturnState(storage);
  const existing = state.pending_by_object[objectId] || null;
  const incoming = storedEnvelope(raw, handoff, now);

  if (existing) {
    const same = existing.handoff_id === incoming.handoff_id
      && existing.return_id === incoming.return_id
      && JSON.stringify(existing.return_packet) === JSON.stringify(incoming.return_packet);
    if (same) return { status:'already_staged', entry:clone(existing) };
    if (!replace) fail('OBJECT_PENDING_CONFLICT', objectId);
  }

  writeState(storage, {
    ...state,
    pending_by_object: {
      ...state.pending_by_object,
      [objectId]: incoming
    }
  });
  return { status:existing ? 'replaced' : 'staged', entry:clone(incoming) };
}

function receipt(entry, status, {
  decision = '',
  repairKpIds = [],
  detail = '',
  at = Date.now()
} = {}) {
  return {
    schema:'kianos.xizong.pending-chat-return-receipt.v1',
    handoff_id:entry.handoff_id,
    return_id:entry.return_id,
    object_id:entry.object_id,
    system_id:entry.system_id,
    block_id:entry.block_id,
    source_hash:entry.source_hash,
    evidence_version:entry.evidence_version,
    status,
    decision:text(decision, 40),
    repair_kp_ids:[...new Set((repairKpIds || []).map(String).filter(Boolean))],
    detail:text(detail, 1000),
    at:new Date(at).toISOString()
  };
}

function consumeFailureStatus(error) {
  const message = String(error?.message || error);
  if (message.includes('STALE_EVIDENCE')
      || message.includes('CURRENT_OBJECT_CHANGED')
      || message.includes('ORIGIN_MISMATCH')) return 'STALE';
  return 'REJECTED';
}

export function consumePendingXizongChatReturnForObject(storage, {
  objectId,
  currentPacket,
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const id = text(objectId, 240);
  if (!id) fail('OBJECT_ID_REQUIRED');

  const state = readXizongPendingChatReturnState(storage);
  const entry = state.pending_by_object[id] || null;
  if (!entry) return { status:'no_pending', receipt:state.last_receipt };

  if (!currentPacket || currentPacket?.schema !== 'kianos.xizong.study_packet.v3') {
    return { status:'waiting_current_packet', entry:clone(entry), receipt:state.last_receipt };
  }

  let result;
  let nextReceipt;
  try {
    result = applyXizongChatReturn(storage, entry.return_packet, {
      currentPacket,
      now
    });
    const decision = String(result?.return_packet?.decision || '');
    const repairKpIds = (result?.return_packet?.repairs || []).map((row) => row?.kp_id).filter(Boolean);
    nextReceipt = receipt(entry, result.status === 'already_applied' ? 'ALREADY_APPLIED' : 'APPLIED', {
      decision,
      repairKpIds,
      at:now
    });
  } catch (error) {
    nextReceipt = receipt(entry, consumeFailureStatus(error), {
      detail:String(error?.message || error),
      at:now
    });
    result = null;
  }

  const latest = readXizongPendingChatReturnState(storage);
  const current = latest.pending_by_object[id];
  // Never delete a newer pending return that arrived during validation/apply.
  const sameEntry = current
    && current.handoff_id === entry.handoff_id
    && current.return_id === entry.return_id;
  const pending = { ...latest.pending_by_object };
  if (sameEntry) delete pending[id];
  writeState(storage, {
    ...latest,
    pending_by_object:pending,
    last_receipt:nextReceipt
  });

  return {
    status:nextReceipt.status.toLowerCase(),
    receipt:clone(nextReceipt),
    apply_result:result
  };
}

export function pendingXizongChatReturnForObject(storage, objectId) {
  const state = readXizongPendingChatReturnState(storage);
  return clone(state.pending_by_object[text(objectId, 240)] || null);
}
