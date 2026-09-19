import {
  PRACTICE_KEYS,
  isPoliticsStorageValue,
  politicsReviewPacket,
  readPoliticsSnapshot
} from './politicsPracticeState.mjs';

export const POLITICS_CHAT_RETURN_SCHEMA = 'kianos.politics.chat-return.v1';
export const POLITICS_PRIVATE_PAYLOAD_SCHEMA = 'kianos.politics.private-payload.v1';
export const POLITICS_CHAT_RETURN_PREFIX = 'kianos-politics-chat-return-v1:';
export const POLITICS_CHAT_RETURN_LATEST_KEY = 'kianos-politics-chat-return-latest-v1';

const ACTIONS = new Set(['SOURCE_RETURN', 'RETEST', 'DISCUSS', 'MEMORY_CANDIDATE']);
const SUBJECTS = new Set(['all', 'marxism', 'history', 'mao', 'xi', 'ethics_law']);
const PRACTICE_KEY_SET = new Set(Object.values(PRACTICE_KEYS));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const clean = (value, max = 4000) => String(value ?? '').trim().slice(0, max);
const validIso = (value) => {
  const text = clean(value, 80);
  return text && Number.isFinite(Date.parse(text)) ? text : '';
};

const listStorageKeys = (storage) => {
  if (!storage?.getItem || typeof storage.key !== 'function' || !Number.isFinite(Number(storage.length))) return [];
  const keys = [];
  for (let index = 0; index < Number(storage.length); index += 1) {
    const key = storage.key(index);
    if (typeof key === 'string') keys.push(key);
  }
  return [...new Set(keys)];
};

export function politicsCheckpointKeyAllowed(key) {
  const value = String(key || '');
  return PRACTICE_KEY_SET.has(value)
    || value === POLITICS_CHAT_RETURN_LATEST_KEY
    || value.startsWith(POLITICS_CHAT_RETURN_PREFIX);
}

function validateStoredChatReturn(value) {
  if (!record(value)
      || value.schema !== POLITICS_CHAT_RETURN_SCHEMA
      || value.direction !== 'CHAT_TO_LEARNER'
      || !clean(value.batch_id, 200)
      || !clean(value.catalog_revision, 240)
      || !clean(value.study_day, 20)
      || !['NO_ACTION', 'FOLLOW_UP'].includes(value.verdict)
      || !Array.isArray(value.follow_ups)
      || !clean(value.return_signature, 120)) {
    throw new Error('POLITICS_CHAT_RETURN_STORED_INVALID');
  }
  return value;
}

function validateCheckpointRaw(key, raw) {
  if (typeof raw !== 'string') throw new Error('PRIVATE_CHECKPOINT_POLITICS_RAW_INVALID:' + key);
  let value;
  try { value = JSON.parse(raw); }
  catch { throw new Error('PRIVATE_CHECKPOINT_POLITICS_JSON_INVALID:' + key); }
  if (PRACTICE_KEY_SET.has(key)) {
    if (!isPoliticsStorageValue(key, value)) throw new Error('PRIVATE_CHECKPOINT_POLITICS_VALUE_INVALID:' + key);
    return value;
  }
  validateStoredChatReturn(value);
  return value;
}

export function exportPoliticsCheckpoint(storage) {
  const entries = {};
  for (const key of listStorageKeys(storage).filter(politicsCheckpointKeyAllowed).sort()) {
    const raw = storage.getItem(key);
    if (raw == null) continue;
    validateCheckpointRaw(key, raw);
    entries[key] = raw;
  }
  return { schema: POLITICS_PRIVATE_PAYLOAD_SCHEMA, entries };
}

export function validatePoliticsPrivatePayload(value) {
  if (!record(value)
      || value.schema !== POLITICS_PRIVATE_PAYLOAD_SCHEMA
      || !record(value.entries)) {
    throw new Error('PRIVATE_CHECKPOINT_POLITICS_SCHEMA_INVALID');
  }
  const entries = [];
  for (const [key, raw] of Object.entries(value.entries)) {
    if (!politicsCheckpointKeyAllowed(key)) throw new Error('PRIVATE_CHECKPOINT_POLITICS_KEY_INVALID:' + key);
    validateCheckpointRaw(key, raw);
    entries.push([key, raw]);
  }
  return entries.sort(([a], [b]) => a.localeCompare(b));
}

function normalizeScope(value) {
  const filter = clean(value?.filter || 'all', 30);
  const subject = clean(value?.subject || 'all', 80);
  if (!['all', 'today', 'discussion', 'problems'].includes(filter)) {
    throw new Error('POLITICS_CHAT_RETURN_SCOPE_FILTER_INVALID');
  }
  if (!SUBJECTS.has(subject || 'all')) throw new Error('POLITICS_CHAT_RETURN_SCOPE_SUBJECT_INVALID');
  return { filter, subject: subject || 'all' };
}

function returnSignature(value) {
  const basis = {
    batch_id: value.batch_id,
    catalog_revision: value.catalog_revision,
    study_day: value.study_day,
    scope: value.scope,
    generated_at: value.generated_at,
    verdict: value.verdict,
    diagnosis_summary: value.diagnosis_summary,
    follow_ups: value.follow_ups
  };
  return JSON.stringify(basis);
}

export function validatePoliticsChatReturn(input, currentPacket) {
  if (!record(input) || input.schema !== POLITICS_CHAT_RETURN_SCHEMA || input.direction !== 'CHAT_TO_LEARNER') {
    throw new Error('POLITICS_CHAT_RETURN_SCHEMA_INVALID');
  }
  if (!record(currentPacket) || currentPacket.schema !== 'kianos.politics.return_packet.v1') {
    throw new Error('POLITICS_CHAT_RETURN_CURRENT_PACKET_INVALID');
  }

  const scope = normalizeScope(input.scope);
  const batchId = clean(input.batch_id, 200);
  const revision = clean(input.catalog_revision, 240);
  const studyDay = clean(input.study_day, 20);
  const generatedAt = validIso(input.generated_at);
  const verdict = clean(input.verdict, 40);

  if (!batchId || batchId !== currentPacket.batch_id) throw new Error('POLITICS_CHAT_RETURN_STALE_BATCH');
  if (!revision || revision !== String(currentPacket.catalog_revision || '')) throw new Error('POLITICS_CHAT_RETURN_CATALOG_MISMATCH');
  if (!studyDay || studyDay !== String(currentPacket.study_day || '')) throw new Error('POLITICS_CHAT_RETURN_DAY_MISMATCH');
  if (JSON.stringify(scope) !== JSON.stringify(currentPacket.scope || { filter: 'all', subject: 'all' })) {
    throw new Error('POLITICS_CHAT_RETURN_SCOPE_MISMATCH');
  }
  if (!generatedAt) throw new Error('POLITICS_CHAT_RETURN_GENERATED_AT_INVALID');
  if (!['NO_ACTION', 'FOLLOW_UP'].includes(verdict)) throw new Error('POLITICS_CHAT_RETURN_VERDICT_INVALID');

  const contexts = new Map((currentPacket.review_context || []).map((row) => [String(row.question_id || ''), row]));
  const rawFollowUps = Array.isArray(input.follow_ups) ? input.follow_ups : [];
  if (verdict === 'NO_ACTION' && rawFollowUps.length) throw new Error('POLITICS_CHAT_RETURN_NO_ACTION_HAS_FOLLOWUP');
  if (verdict === 'FOLLOW_UP' && !rawFollowUps.length) throw new Error('POLITICS_CHAT_RETURN_FOLLOWUP_MISSING');

  const seenItemIds = new Set();
  const claimedQuestions = new Set();
  const followUps = rawFollowUps.map((raw, index) => {
    if (!record(raw)) throw new Error('POLITICS_CHAT_RETURN_FOLLOWUP_INVALID:' + index);
    const id = clean(raw.id || ('follow-up-' + (index + 1)), 160);
    const action = clean(raw.action, 80);
    const reason = clean(raw.reason, 2400);
    const instruction = clean(raw.instruction, 2400);
    const sourceBasis = clean(raw.source_basis, 2400) || null;
    const questionIds = [...new Set((Array.isArray(raw.question_ids) ? raw.question_ids : [])
      .map((value) => clean(value, 200)).filter(Boolean))];

    if (!id || seenItemIds.has(id)) throw new Error('POLITICS_CHAT_RETURN_FOLLOWUP_ID_INVALID:' + id);
    if (!ACTIONS.has(action)) throw new Error('POLITICS_CHAT_RETURN_ACTION_INVALID:' + action);
    if (!reason || !instruction || !questionIds.length) throw new Error('POLITICS_CHAT_RETURN_FOLLOWUP_FIELDS_MISSING:' + id);
    if (action === 'MEMORY_CANDIDATE' && !sourceBasis) throw new Error('POLITICS_CHAT_RETURN_MEMORY_SOURCE_REQUIRED:' + id);

    const itemContexts = questionIds.map((questionId) => {
      const context = contexts.get(questionId);
      if (!context) throw new Error('POLITICS_CHAT_RETURN_QUESTION_OUT_OF_SCOPE:' + questionId);
      if (claimedQuestions.has(questionId)) throw new Error('POLITICS_CHAT_RETURN_QUESTION_DUPLICATED:' + questionId);
      claimedQuestions.add(questionId);
      return {
        question_id: questionId,
        unit_key: String(context.unit_key || ''),
        subject: String(context.subject || ''),
        chapter: String(context.chapter || ''),
        unit_id: String(context.unit_id || ''),
        current_outcome: String(context.current_outcome || ''),
        source_href: String(context.source_href || '')
      };
    });

    seenItemIds.add(id);
    const returnTargets = [...new Map(itemContexts
      .filter((row) => row.source_href)
      .map((row) => [row.source_href, { href: row.source_href, unit_key: row.unit_key, unit_id: row.unit_id }])).values()];

    return {
      id,
      action,
      reason,
      instruction,
      source_basis: sourceBasis,
      question_ids: questionIds,
      contexts: itemContexts,
      return_targets: returnTargets,
      status: 'ACTIVE'
    };
  });

  const normalized = {
    schema: POLITICS_CHAT_RETURN_SCHEMA,
    direction: 'CHAT_TO_LEARNER',
    batch_id: batchId,
    catalog_revision: revision,
    study_day: studyDay,
    scope,
    generated_at: generatedAt,
    verdict,
    diagnosis_summary: clean(input.diagnosis_summary, 4000) || null,
    follow_ups: followUps
  };
  normalized.return_signature = returnSignature(normalized);
  return normalized;
}

export function readPoliticsChatReturn(storage, batchId = null) {
  const key = batchId ? POLITICS_CHAT_RETURN_PREFIX + batchId : POLITICS_CHAT_RETURN_LATEST_KEY;
  const raw = storage?.getItem?.(key);
  if (raw == null) return null;
  try { return validateStoredChatReturn(JSON.parse(raw)); }
  catch { return null; }
}

export function applyPoliticsChatReturn(storage, catalog, input, {
  now = Date.now(),
  expectedDay = new Date(now).toLocaleDateString('en-CA')
} = {}) {
  if (!storage?.getItem || !storage?.setItem) throw new Error('POLITICS_CHAT_RETURN_STORAGE_UNAVAILABLE');
  const snapshot = readPoliticsSnapshot(storage);
  if (snapshot.errors.length) throw new Error('POLITICS_CHAT_RETURN_EVIDENCE_UNREADABLE');

  const scope = normalizeScope(input?.scope);
  const day = clean(input?.study_day, 20);
  if (!day || day !== expectedDay) throw new Error('POLITICS_CHAT_RETURN_STALE_DAY');
  const currentPacket = politicsReviewPacket(catalog, snapshot, {
    day,
    filter: scope.filter,
    subject: scope.subject
  });
  const normalized = validatePoliticsChatReturn(input, currentPacket);
  const exactKey = POLITICS_CHAT_RETURN_PREFIX + normalized.batch_id;
  const existingRaw = storage.getItem(exactKey);

  if (existingRaw != null) {
    const existing = validateStoredChatReturn(JSON.parse(existingRaw));
    if (existing.return_signature !== normalized.return_signature) {
      throw new Error('POLITICS_CHAT_RETURN_CONFLICT_KEEP_FIRST');
    }
    return { status: 'idempotent', value: clone(existing), current_packet: currentPacket };
  }

  const stored = {
    ...normalized,
    applied_at: new Date(now).toISOString()
  };
  const writes = [
    [exactKey, JSON.stringify(stored)],
    [POLITICS_CHAT_RETURN_LATEST_KEY, JSON.stringify(stored)]
  ];
  const before = new Map(writes.map(([key]) => [key, storage.getItem(key)]));
  try {
    for (const [key, raw] of writes) storage.setItem(key, raw);
  } catch (error) {
    for (const [key, raw] of before.entries()) {
      try {
        if (raw == null) storage.removeItem?.(key);
        else storage.setItem(key, raw);
      } catch {}
    }
    throw error;
  }

  return { status: 'applied', value: clone(stored), current_packet: currentPacket };
}
