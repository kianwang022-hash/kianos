import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  setRepairTasks
} from './xizongMemoryModel.mjs';

export const XIZONG_CHAT_HANDOFF_SCHEMA = 'kianos.xizong.chat_handoff.v1';
export const XIZONG_CHAT_RETURN_SCHEMA = 'kianos.xizong.chat_return.v1';
export const XIZONG_CHAT_HANDOFF_PREFIX = 'kianos-xizong-chat-handoff-v1:';
export const XIZONG_CHAT_RETURN_PREFIX = 'kianos-xizong-chat-return-v1:';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const clean = (value, max = 1000) => String(value || '').trim().slice(0, max);
const PRIORITIES = new Set(['high', 'medium', 'low', 'normal']);

function fail(code, detail = '') {
  throw new Error('XIZONG_CHAT_RETURN_' + code + (detail ? ':' + detail : ''));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function fingerprint(value) {
  const raw = JSON.stringify(stable(value));
  let hash = 0x811c9dc5;
  for (let index = 0; index < raw.length; index += 1) {
    hash ^= raw.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return 'ev-' + hash.toString(16).padStart(8, '0');
}

function packetResume(packet) {
  const resume = packet?.learning_state?.resume || {};
  return {
    current_stage: clean(packet?.learning_state?.current_stage, 80),
    group_index: Math.max(0, Number(resume.group_index || 0)),
    logic_group_id: clean(resume.logic_group_id, 200),
    kp_index: Math.max(0, Number(resume.kp_index || 0)),
    kp_id: clean(resume.kp_id, 200),
    source_locator: clean(resume.source_locator, 300)
  };
}

export function xizongStudyPacketEvidenceVersion(packet) {
  if (!packet || packet.schema !== 'kianos.xizong.study_packet.v3') fail('STUDY_PACKET_INVALID');
  const basis = {
    current: {
      object_id: clean(packet.current?.object_id, 240),
      source_hash: clean(packet.current?.source_hash, 160)
    },
    resume: packetResume(packet),
    source_contact: clone(packet.learning_state?.source_contact || {}),
    learned_kp_ids: [...(packet.learning_state?.learned_kp_ids || [])].map(String).sort(),
    recall_ratings: clone(packet.learning_state?.recall_ratings || {}),
    block_recall_done: packet.learning_state?.block_recall_done === true,
    block_complete: packet.learning_state?.block_complete === true,
    evidence_tail: (Array.isArray(packet.block_evidence_history) ? packet.block_evidence_history : []).slice(-40),
    repair_ids: (Array.isArray(packet.memory?.active_repairs) ? packet.memory.active_repairs : [])
      .map((row) => String(row?.id || '')).filter(Boolean).sort(),
    wrong_uncertain: (Array.isArray(packet.practice?.wrong_uncertain) ? packet.practice.wrong_uncertain : [])
      .map((row) => ({
        question_id: clean(row?.question_id, 160),
        status: clean(row?.status, 40),
        submitted_at: clean(row?.submitted_at, 80)
      }))
      .sort((a, b) => a.question_id.localeCompare(b.question_id)),
    marked_question_ids: [...(packet.practice?.marked_question_ids || [])].map(String).sort()
  };
  return fingerprint(basis);
}

function validateStudyPacketIdentity(packet) {
  if (!packet || packet.schema !== 'kianos.xizong.study_packet.v3') fail('STUDY_PACKET_INVALID');
  const objectId = clean(packet.current?.object_id, 240);
  const sourceHash = clean(packet.current?.source_hash, 160);
  const systemId = clean(packet.current?.system_id, 120);
  const blockId = clean(packet.current?.block_id, 160);
  if (!objectId || !sourceHash || !systemId || !blockId) fail('STUDY_PACKET_IDENTITY_INCOMPLETE');
  const kpIds = (Array.isArray(packet.kp_evidence) ? packet.kp_evidence : [])
    .map((row) => clean(row?.kp_id, 200)).filter(Boolean);
  if (!kpIds.length) fail('STUDY_PACKET_KP_SET_EMPTY');
  return { objectId, sourceHash, systemId, blockId, kpIds: [...new Set(kpIds)] };
}

export function buildXizongChatHandoff(packet, {
  returnHref = '',
  now = Date.now(),
  makeId = null
} = {}) {
  const identity = validateStudyPacketIdentity(packet);
  const createdAt = new Date(now).toISOString();
  const handoffId = clean(
    typeof makeId === 'function' ? makeId() : 'xz-' + now + '-' + Math.random().toString(36).slice(2, 10),
    160
  );
  if (!handoffId) fail('HANDOFF_ID_INVALID');
  return {
    schema: XIZONG_CHAT_HANDOFF_SCHEMA,
    handoff_id: handoffId,
    created_at: createdAt,
    origin: {
      object_id: identity.objectId,
      system_id: identity.systemId,
      block_id: identity.blockId,
      source_hash: identity.sourceHash,
      evidence_version: xizongStudyPacketEvidenceVersion(packet)
    },
    resume: packetResume(packet),
    return_href: clean(returnHref, 500),
    allowed_kp_ids: identity.kpIds,
    allowed_question_ids: (Array.isArray(packet.practice?.wrong_uncertain) ? packet.practice.wrong_uncertain : [])
      .map((row) => clean(row?.question_id, 160)).filter(Boolean)
  };
}

export function validateXizongChatHandoff(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('HANDOFF_OBJECT_REQUIRED');
  if (value.schema !== XIZONG_CHAT_HANDOFF_SCHEMA) fail('HANDOFF_SCHEMA_INVALID');
  const handoffId = clean(value.handoff_id, 160);
  const origin = value.origin || {};
  if (!handoffId || !clean(origin.object_id, 240) || !clean(origin.source_hash, 160) || !clean(origin.evidence_version, 80)) {
    fail('HANDOFF_IDENTITY_INVALID');
  }
  const allowedKpIds = [...new Set((value.allowed_kp_ids || []).map((id) => clean(id, 200)).filter(Boolean))];
  if (!allowedKpIds.length) fail('HANDOFF_KP_SET_EMPTY');
  return {
    schema: XIZONG_CHAT_HANDOFF_SCHEMA,
    handoff_id: handoffId,
    created_at: new Date(value.created_at).toISOString(),
    origin: {
      object_id: clean(origin.object_id, 240),
      system_id: clean(origin.system_id, 120),
      block_id: clean(origin.block_id, 160),
      source_hash: clean(origin.source_hash, 160),
      evidence_version: clean(origin.evidence_version, 80)
    },
    resume: {
      current_stage: clean(value.resume?.current_stage, 80),
      group_index: Math.max(0, Number(value.resume?.group_index || 0)),
      logic_group_id: clean(value.resume?.logic_group_id, 200),
      kp_index: Math.max(0, Number(value.resume?.kp_index || 0)),
      kp_id: clean(value.resume?.kp_id, 200),
      source_locator: clean(value.resume?.source_locator, 300)
    },
    return_href: clean(value.return_href, 500),
    allowed_kp_ids: allowedKpIds,
    allowed_question_ids: [...new Set((value.allowed_question_ids || []).map((id) => clean(id, 160)).filter(Boolean))]
  };
}

export function writeXizongChatHandoff(storage, value) {
  if (!storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const handoff = validateXizongChatHandoff(value);
  storage.setItem(XIZONG_CHAT_HANDOFF_PREFIX + handoff.handoff_id, JSON.stringify(handoff));
  return handoff;
}

export function ensureXizongChatHandoff(storage, packet, {
  returnHref = '',
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const identity = validateStudyPacketIdentity(packet);
  const version = xizongStudyPacketEvidenceVersion(packet);
  const stableId = [
    'xz',
    identity.blockId,
    version
  ].join('-').replace(/[^A-Za-z0-9._:-]+/g, '-').slice(0, 160);

  const key = XIZONG_CHAT_HANDOFF_PREFIX + stableId;
  const raw = storage.getItem(key);
  if (raw != null) {
    let existing;
    try { existing = validateXizongChatHandoff(JSON.parse(raw)); }
    catch { fail('HANDOFF_CORRUPT', stableId); }
    if (existing.origin.object_id !== identity.objectId
        || existing.origin.source_hash !== identity.sourceHash
        || existing.origin.evidence_version !== version) {
      fail('HANDOFF_STABLE_ID_CONFLICT', stableId);
    }
    return existing;
  }

  const handoff = buildXizongChatHandoff(packet, {
    returnHref,
    now,
    makeId: () => stableId
  });
  return writeXizongChatHandoff(storage, handoff);
}

export function attachXizongChatReturnContract(storage, packet, options = {}) {
  const handoff = ensureXizongChatHandoff(storage, packet, options);
  return buildXizongChatExport(packet, handoff);
}

export function readXizongChatHandoff(storage, handoffId) {
  if (!storage?.getItem) fail('STORAGE_UNAVAILABLE');
  const id = clean(handoffId, 160);
  if (!id) fail('HANDOFF_ID_INVALID');
  const raw = storage.getItem(XIZONG_CHAT_HANDOFF_PREFIX + id);
  if (raw == null) fail('HANDOFF_NOT_FOUND', id);
  try { return validateXizongChatHandoff(JSON.parse(raw)); }
  catch (error) {
    if (String(error?.message || error).startsWith('XIZONG_CHAT_RETURN_')) throw error;
    fail('HANDOFF_CORRUPT', id);
  }
}

export function buildXizongChatExport(packet, handoff) {
  const validHandoff = validateXizongChatHandoff(handoff);
  return {
    ...clone(packet),
    chat_return_contract: {
      schema: XIZONG_CHAT_RETURN_SCHEMA,
      handoff_id: validHandoff.handoff_id,
      origin: clone(validHandoff.origin),
      resume: clone(validHandoff.resume),
      decision: 'NO_ACTION | REPAIR',
      repair_shape: {
        kp_id: '<must be one of allowed_kp_ids>',
        reason: '<why repair is justified>',
        action: '<smallest useful repair>',
        priority: 'high | medium | low | normal',
        source_question_ids: ['<optional; must be from allowed_question_ids>']
      },
      rule: 'Echo handoff_id/origin/resume exactly. Return NO_ACTION when no repair is justified. Never invent KP/question identity.'
    }
  };
}

export function parseXizongChatReturn(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) return input;
  const raw = String(input || '').trim();
  if (!raw) fail('IMPORT_EMPTY');
  const candidates = [raw];
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) candidates.push(raw.slice(start, end + 1));
  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    } catch {}
  }
  fail('IMPORT_INVALID');
}

function sameResume(a, b) {
  return ['current_stage','group_index','logic_group_id','kp_index','kp_id','source_locator']
    .every((key) => String(a?.[key] ?? '') === String(b?.[key] ?? ''));
}

export function validateXizongChatReturn(value, handoff, currentPacket) {
  const h = validateXizongChatHandoff(handoff);
  const raw = parseXizongChatReturn(value);
  if (raw.schema !== XIZONG_CHAT_RETURN_SCHEMA) fail('SCHEMA_INVALID');
  if (clean(raw.handoff_id, 160) !== h.handoff_id) fail('HANDOFF_MISMATCH');

  const origin = raw.origin || {};
  for (const key of ['object_id','system_id','block_id','source_hash','evidence_version']) {
    if (clean(origin[key], 240) !== String(h.origin[key] || '')) fail('ORIGIN_MISMATCH', key);
  }
  if (!sameResume(raw.resume, h.resume)) fail('RESUME_MISMATCH');

  const currentVersion = xizongStudyPacketEvidenceVersion(currentPacket);
  const currentIdentity = validateStudyPacketIdentity(currentPacket);
  if (currentIdentity.objectId !== h.origin.object_id || currentIdentity.sourceHash !== h.origin.source_hash) {
    fail('CURRENT_OBJECT_CHANGED');
  }
  if (currentVersion !== h.origin.evidence_version) fail('STALE_EVIDENCE');

  const decision = clean(raw.decision, 20).toUpperCase();
  if (!['NO_ACTION','REPAIR'].includes(decision)) fail('DECISION_INVALID');
  const allowedKp = new Set(h.allowed_kp_ids);
  const allowedQuestions = new Set(h.allowed_question_ids);
  const seen = new Set();
  const repairs = (Array.isArray(raw.repairs) ? raw.repairs : []).map((row) => {
    const kpId = clean(row?.kp_id || row?.kpId, 200);
    if (!kpId || !allowedKp.has(kpId) || seen.has(kpId)) fail('REPAIR_KP_INVALID', kpId);
    seen.add(kpId);
    const priority = clean(row?.priority || 'normal', 20).toLowerCase();
    if (!PRIORITIES.has(priority)) fail('REPAIR_PRIORITY_INVALID', priority);
    const sourceQuestionIds = [...new Set((row?.source_question_ids || row?.sourceQuestionIds || [])
      .map((id) => clean(id, 160)).filter(Boolean))];
    if (sourceQuestionIds.some((id) => !allowedQuestions.has(id))) fail('REPAIR_QUESTION_INVALID');
    return {
      kp_id: kpId,
      reason: clean(row?.reason, 1200),
      action: clean(row?.action, 1600),
      priority,
      source_question_ids: sourceQuestionIds
    };
  });

  if (decision === 'NO_ACTION' && repairs.length) fail('NO_ACTION_WITH_REPAIRS');
  if (decision === 'REPAIR' && !repairs.length) fail('REPAIR_EMPTY');

  const returnId = clean(raw.return_id, 160);
  if (!returnId) fail('RETURN_ID_REQUIRED');
  return {
    schema: XIZONG_CHAT_RETURN_SCHEMA,
    return_id: returnId,
    handoff_id: h.handoff_id,
    origin: clone(h.origin),
    resume: clone(h.resume),
    decision,
    repairs,
    note: clean(raw.note, 1200)
  };
}

export function applyXizongChatReturn(storage, input, {
  currentPacket,
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) fail('STORAGE_UNAVAILABLE');
  const raw = parseXizongChatReturn(input);
  const handoffId = text(raw.handoff_id, 160);
  if (!handoffId) fail('RETURN_HANDOFF_REQUIRED');
  const handoff = readXizongChatHandoff(storage, handoffId);
  const valid = validateXizongChatReturn(raw, { handoff, currentPacket });
  const receiptKey = receiptKeyFor(handoff.handoff_id);
  const existing = storage.getItem(receiptKey);
  if (existing != null) {
    let receipt;
    try { receipt = JSON.parse(existing); } catch { fail('RECEIPT_CORRUPT', handoff.handoff_id); }
    if (receipt?.schema !== 'kianos.xizong.chat_return_receipt.v1') fail('RECEIPT_SCHEMA_INVALID');
    if (receipt.return_id !== valid.return_id) fail('RETURN_CONFLICT', handoff.handoff_id);
    if (JSON.stringify(receipt.return_packet) !== JSON.stringify(valid)) fail('RETURN_CONFLICT', handoff.handoff_id);

    const memory = normalizeXizongMemoryState(
      JSON.parse(storage.getItem(XIZONG_MEMORY_STORAGE_KEY) || 'null')
    );
    const taskIds = (valid.repairs || []).map((repair) =>
      'repair:block-chat:' + handoff.origin.block_id + ':' + repair.kp_id
    );
    return {
      status: 'already_applied',
      return_packet: valid,
      return_href: handoff.return_href,
      receipt,
      repair_tasks: (memory.repairTasks || []).filter((task) => taskIds.includes(String(task?.id || '')))
    };
  }

  const importedAt = new Date(now).toISOString();
  const inboxKey = repairInboxKeyFor(handoff.origin.object_id);
  const memoryBefore = storage.getItem(XIZONG_MEMORY_STORAGE_KEY);
  const inboxBefore = storage.getItem(inboxKey);
  const receiptBefore = storage.getItem(receiptKey);

  const plans = valid.repairs.map((repair) => ({
    kpId: repair.kp_id,
    reason: repair.reason,
    action: repair.action,
    priority: repair.priority,
    sourceQuestionIds: [...repair.source_question_ids]
  }));

  let repairTasks = [];
  let nextMemory = null;
  if (plans.length) {
    const memory = normalizeXizongMemoryState(
      memoryBefore == null ? null : JSON.parse(memoryBefore)
    );
    const cards = Object.values(memory.cards || {});
    repairTasks = plans.map((plan) => {
      const coreCard = cards.find((card) =>
        String(card?.family || '') === 'CORE'
        && String(card?.kpId || '') === plan.kpId
        && String(card?.blockId || '') === handoff.origin.block_id
      ) || null;
      return {
        id: 'repair:block-chat:' + handoff.origin.block_id + ':' + plan.kpId,
        cardId: coreCard?.id || '',
        kpId: plan.kpId,
        blockId: handoff.origin.block_id,
        systemId: handoff.origin.system_id,
        title: [currentPacket?.current?.block_label, plan.kpId].filter(Boolean).join(' · '),
        reason: plan.reason,
        action: plan.action,
        priority: plan.priority,
        origin: 'BLOCK_CHAT_RETURN',
        sourceQuestionIds: [...plan.sourceQuestionIds],
        blockHref: handoff.return_href,
        returnHref: handoff.return_href,
        createdAt: importedAt,
        status: 'ACTIVE'
      };
    });
    const incomingIds = new Set(repairTasks.map((task) => task.id));
    const preserved = (memory.repairTasks || []).filter((task) => !incomingIds.has(String(task?.id || '')));
    nextMemory = setRepairTasks(memory, [...preserved, ...repairTasks]);
  }

  const receipt = {
    schema: 'kianos.xizong.chat_return_receipt.v1',
    handoff_id: handoff.handoff_id,
    return_id: valid.return_id,
    imported_at: importedAt,
    return_packet: valid,
    repair_task_ids: repairTasks.map((task) => task.id)
  };

  const rollback = () => {
    try {
      if (memoryBefore == null) storage.removeItem?.(XIZONG_MEMORY_STORAGE_KEY);
      else storage.setItem(XIZONG_MEMORY_STORAGE_KEY, memoryBefore);
      if (inboxBefore == null) storage.removeItem?.(inboxKey);
      else storage.setItem(inboxKey, inboxBefore);
      if (receiptBefore == null) storage.removeItem?.(receiptKey);
      else storage.setItem(receiptKey, receiptBefore);
    } catch {
      fail('RETURN_ROLLBACK_INCOMPLETE', handoff.handoff_id);
    }
  };

  try {
    if (plans.length) {
      storage.setItem(inboxKey, JSON.stringify({
        importedAt,
        sourceSystemId: handoff.origin.system_id,
        sourceHandoffId: handoff.handoff_id,
        sourceReturnId: valid.return_id,
        sourceHash: handoff.origin.source_hash,
        returnHref: handoff.return_href,
        plans
      }));
      storage.setItem(XIZONG_MEMORY_STORAGE_KEY, JSON.stringify(nextMemory));
    }
    storage.setItem(receiptKey, JSON.stringify(receipt));
  } catch (error) {
    rollback();
    throw error;
  }

  return {
    status: 'applied',
    return_packet: valid,
    return_href: handoff.return_href,
    receipt,
    repair_tasks: repairTasks
  };
}
