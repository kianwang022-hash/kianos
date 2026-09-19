import {
  XIZONG_MEMORY_STORAGE_KEY,
  activeRepairTasks,
  normalizeXizongMemoryState,
  todayMemoryQueue
} from './xizongMemoryModel.mjs';
import { studyDayAt } from './studyTimer.mjs';
import { readXizongPendingChatReturnState } from './xizongPendingChatReturn.mjs';
import {
  XIZONG_SYSTEM_WU_RETURN_SCHEMA,
  currentXizongSystemWuEvidence,
  readXizongSystemWuPendingState
} from './xizongSystemWuReturn.mjs';

export const XIZONG_DAILY_EVIDENCE_SCHEMA = 'kianos.xizong.daily_evidence.v1';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage?.getItem?.(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch {
    return fallback;
  }
}

function listKeys(storage) {
  if (!storage || typeof storage.key !== 'function') return [];
  const rows = [];
  for (let i = 0; i < Number(storage.length || 0); i += 1) {
    const key = storage.key(i);
    if (typeof key === 'string') rows.push(key);
  }
  return [...new Set(rows)];
}

function dayOf(value) {
  const ms = Date.parse(String(value || ''));
  return Number.isFinite(ms) ? studyDayAt(ms) : null;
}

function onDay(value, day) {
  return dayOf(value) === day;
}

function blockIdFromObjectKey(key, prefix) {
  const objectId = String(key || '').slice(prefix.length);
  return objectId.startsWith('xizong:') ? objectId.slice('xizong:'.length) : objectId;
}

export function buildXizongDailyEvidencePacket(storage, {
  day,
  now = Date.now(),
  currentBlockPacket = null
} = {}) {
  if (!storage?.getItem) throw new Error('XIZONG_DAILY_EVIDENCE_STORAGE_UNAVAILABLE');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day || ''))) {
    throw new Error('XIZONG_DAILY_EVIDENCE_DAY_INVALID');
  }

  const keys = listKeys(storage);
  const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  const pendingReturnState = readXizongPendingChatReturnState(storage);
  const systemWuPendingState = readXizongSystemWuPendingState(storage);
  const chatReturnReceipt = pendingReturnState.last_receipt && onDay(pendingReturnState.last_receipt.at, day)
    ? clone(pendingReturnState.last_receipt)
    : null;
  const pendingChatReturns = Object.values(pendingReturnState.pending_by_object || {})
    .map((row) => ({
      handoff_id: String(row?.handoff_id || ''),
      return_id: String(row?.return_id || ''),
      object_id: String(row?.object_id || ''),
      system_id: String(row?.system_id || ''),
      block_id: String(row?.block_id || ''),
      source_hash: String(row?.source_hash || ''),
      evidence_version: String(row?.evidence_version || ''),
      return_href: String(row?.return_href || ''),
      received_at: String(row?.received_at || '')
    }))
    .filter((row) => row.object_id && row.return_id)
    .sort((a, b) => a.received_at.localeCompare(b.received_at));

  const currentSystemWu = [];
  for (const key of keys.filter((value) => /^kianos:xizong:system-question-sweep:[^:]+:v1$/.test(value))) {
    const systemId = key.match(/^kianos:xizong:system-question-sweep:([^:]+):v1$/)?.[1] || '';
    if (!systemId) continue;
    const rows = currentXizongSystemWuEvidence(storage, systemId);
    if (!rows.length) continue;
    currentSystemWu.push({
      system_id: systemId,
      items: rows,
      return_contract: {
        schema: XIZONG_SYSTEM_WU_RETURN_SCHEMA,
        system_id: systemId,
        decision: 'NO_ACTION | REPAIR',
        plan_shape: {
          question_id: '<must be one of items.question_id>',
          status: '<echo exact items.status>',
          attempt_id: '<echo exact items.attempt_id when present>',
          submitted_at: '<echo exact items.submitted_at when present>',
          round_id: '<echo exact items.round_id when present>',
          reason: '<why repair is justified>',
          action: '<smallest useful repair>',
          priority: 'high | medium | low | normal'
        },
        rule: 'Do not provide Block/KP mapping. KianOS resolves only current reviewed Question→Knowledge relations and rejects stale attempt evidence.'
      }
    });
  }
  currentSystemWu.sort((a, b) => a.system_id.localeCompare(b.system_id));

  const pendingSystemWuReturns = Object.values(systemWuPendingState.pending_by_system || {})
    .map((row) => ({
      return_id: String(row?.return_id || ''),
      system_id: String(row?.system_id || ''),
      study_day: row?.study_day ? String(row.study_day) : null,
      received_at: String(row?.received_at || '')
    }))
    .filter((row) => row.return_id && row.system_id);

  const systemWuReceipt = systemWuPendingState.last_receipt
    && onDay(systemWuPendingState.last_receipt.at, day)
      ? clone(systemWuPendingState.last_receipt)
      : null;

  const memoryEvents = (memory.evidence || [])
    .filter((row) => onDay(row?.at, day))
    .map((row) => {
      const card = memory.cards?.[row.cardId] || {};
      return {
        card_id: String(row.cardId || ''),
        family: String(row.family || card.family || ''),
        system_id: String(card.systemId || ''),
        block_id: String(card.blockId || ''),
        kp_id: String(card.kpId || ''),
        rating: String(row.rating || ''),
        origin: String(row.origin || ''),
        at: String(row.at || '')
      };
    });

  const kpRecallEvents = [];
  for (const key of keys.filter((value) => value.startsWith('kianos-xizong-memory-review-v2:xizong:'))) {
    const ext = readJson(storage, key, null);
    if (!record(ext) || !Array.isArray(ext.evidenceHistory)) continue;
    const blockId = blockIdFromObjectKey(key, 'kianos-xizong-memory-review-v2:');
    for (const row of ext.evidenceHistory) {
      if (row?.type !== 'KP_RECALL' || !onDay(row?.at, day)) continue;
      // Compatibility/bootstrap events preserve historical state but are not new
      // learner actions for this study day.
      if (String(row?.evidence_origin || '') === 'BOOTSTRAP_EXISTING_STATE') continue;
      kpRecallEvents.push({
        block_id: blockId,
        kp_id: String(row?.kp_id || ''),
        rating: String(row?.rating || ''),
        evidence_origin: String(row?.evidence_origin || ''),
        source_hash: String(row?.source_hash || ''),
        at: String(row?.at || '')
      });
    }
  }

  const sourceContactEvents = [];
  const ttsxEvents = [];
  const blockRecallEvents = [];
  const blockCompleteEvents = [];
  for (const key of keys.filter((value) => value.startsWith('kianos-xizong-astro-v2:xizong:'))) {
    const state = readJson(storage, key, null);
    if (!record(state)) continue;
    const blockId = blockIdFromObjectKey(key, 'kianos-xizong-astro-v2:');

    if (onDay(state.blockRecallCompletedAt, day)) {
      blockRecallEvents.push({
        block_id: blockId,
        completed_at: String(state.blockRecallCompletedAt || '')
      });
    }
    if (onDay(state.completedAt, day)) {
      blockCompleteEvents.push({
        block_id: blockId,
        completed_at: String(state.completedAt || '')
      });
    }

    for (const row of Array.isArray(state.sourceContactEvidence) ? state.sourceContactEvidence : []) {
      if (!onDay(row?.completed_at, day)) continue;
      sourceContactEvents.push({
        block_id: blockId,
        segment_id: String(row?.segment_id || ''),
        coverage_kind: String(row?.coverage_kind || ''),
        source_contact_mode: String(row?.source_contact_mode || ''),
        kp_ids: Array.isArray(row?.kp_ids) ? row.kp_ids.map(String) : [],
        source_hash: String(row?.source_hash || ''),
        completed_at: String(row?.completed_at || '')
      });
    }

    for (const [ttsxKey, row] of Object.entries(record(state.ttsxEvidence) ? state.ttsxEvidence : {})) {
      if (!onDay(row?.completedAt, day)) continue;
      ttsxEvents.push({
        block_id: blockId,
        checkpoint_key: ttsxKey,
        completed_at: String(row?.completedAt || ''),
        checkpoint_ids: Array.isArray(row?.checkpointIds) ? row.checkpointIds.map(String) : [],
        annotations: clone(row?.annotations || {})
      });
    }
  }

  const questionEvents = [];
  const sweepPattern = /^kianos:xizong:(?:system|chat-set|retained|paper)-question-sweep:.*:v1$/;
  for (const key of keys.filter((value) => sweepPattern.test(value))) {
    const state = readJson(storage, key, null);
    if (!record(state)) continue;
    for (const row of Array.isArray(state.attemptHistory) ? state.attemptHistory : []) {
      if (row?.type !== 'QUESTION_ATTEMPT' || !onDay(row?.submitted_at, day)) continue;
      if (String(row?.evidence_origin || '') === 'BOOTSTRAP_EXISTING_RESULT') continue;
      questionEvents.push({
        question_id: String(row?.question_id || ''),
        status: String(row?.status || ''),
        system_id: String(row?.system_id || ''),
        canonical_id: String(row?.canonical_id || ''),
        study_phase: String(row?.study_phase || ''),
        context: String(row?.context || ''),
        round_id: String(row?.round_id || ''),
        evidence_origin: String(row?.evidence_origin || ''),
        submitted_at: String(row?.submitted_at || '')
      });
    }
  }

  const repairEvents = [];
  for (const task of memory.repairTasks || []) {
    if (onDay(task?.createdAt, day)) {
      repairEvents.push({
        event: 'CREATED',
        task_id: String(task?.id || ''),
        system_id: String(task?.systemId || ''),
        block_id: String(task?.blockId || ''),
        kp_id: String(task?.kpId || ''),
        priority: String(task?.priority || ''),
        origin: String(task?.origin || ''),
        source_question_ids: Array.isArray(task?.sourceQuestionIds) ? task.sourceQuestionIds.map(String) : [],
        at: String(task?.createdAt || '')
      });
    }
    if (onDay(task?.completedAt, day)) {
      repairEvents.push({
        event: 'COMPLETED',
        task_id: String(task?.id || ''),
        system_id: String(task?.systemId || ''),
        block_id: String(task?.blockId || ''),
        kp_id: String(task?.kpId || ''),
        priority: String(task?.priority || ''),
        origin: String(task?.origin || ''),
        source_question_ids: Array.isArray(task?.sourceQuestionIds) ? task.sourceQuestionIds.map(String) : [],
        at: String(task?.completedAt || '')
      });
    }
  }

  const systemRecallEvents = [];
  for (const key of keys.filter((value) => /^kianos:xizong:system-recall:[^:]+:v1$/.test(value))) {
    const state = readJson(storage, key, null);
    if (!record(state)) continue;
    const systemId = key.match(/^kianos:xizong:system-recall:([^:]+):v1$/)?.[1] || '';
    const history = Array.isArray(state.history) ? state.history : [];
    if (history.length) {
      for (const row of history) {
        if (!onDay(row?.completed_at, day)) continue;
        systemRecallEvents.push({
          system_id: systemId,
          event_id: String(row?.event_id || ''),
          completed_at: String(row?.completed_at || ''),
          after_round_id: row?.after_round_id || null
        });
      }
    } else if (onDay(state.completedAt, day)) {
      // Legacy latest-only compatibility. Preserve the observation but expose that
      // it has weaker provenance than append-preserved history.
      systemRecallEvents.push({
        system_id: systemId,
        event_id: '',
        completed_at: String(state.completedAt || ''),
        after_round_id: state.afterRoundId || null,
        evidence_origin: 'LEGACY_LATEST_ONLY'
      });
    }
  }

  const packet = {
    schema: XIZONG_DAILY_EVIDENCE_SCHEMA,
    study_day: day,
    generated_at: new Date(now).toISOString(),
    current_block: currentBlockPacket ? clone(currentBlockPacket) : null,
    events: {
      source_contact: sourceContactEvents,
      ttsx: ttsxEvents,
      kp_recall: kpRecallEvents,
      block_recall: blockRecallEvents,
      block_complete: blockCompleteEvents,
      memory_recall: memoryEvents,
      question_attempt: questionEvents,
      repair_lifecycle: repairEvents,
      system_recall: systemRecallEvents
    },
    current: {
      pending_chat_returns: pendingChatReturns,
      chat_return_receipt: chatReturnReceipt,
      current_system_wu: currentSystemWu,
      pending_system_wu_returns: pendingSystemWuReturns,
      system_wu_return_receipt: systemWuReceipt,
      memory_today: todayMemoryQueue(memory).map((card) => ({
        card_id: String(card?.id || ''),
        family: String(card?.family || ''),
        system_id: String(card?.systemId || ''),
        canonical_id: String(card?.canonicalId || ''),
        block_id: String(card?.blockId || ''),
        kp_id: String(card?.kpId || ''),
        display_id: String(card?.displayId || ''),
        title: String(card?.title || ''),
        source_hash: String(card?.sourceHash || ''),
        weak_weight: Number(card?.weakWeight || 0),
        review_requested: card?.reviewRequested === true
      })),
      active_repairs: activeRepairTasks(memory).map((task) => ({
        task_id: String(task?.id || ''),
        system_id: String(task?.systemId || ''),
        block_id: String(task?.blockId || ''),
        kp_id: String(task?.kpId || ''),
        title: String(task?.title || ''),
        reason: String(task?.reason || ''),
        action: String(task?.action || ''),
        priority: String(task?.priority || ''),
        origin: String(task?.origin || ''),
        source_question_ids: Array.isArray(task?.sourceQuestionIds) ? task.sourceQuestionIds.map(String) : [],
        block_href: String(task?.blockHref || ''),
        return_href: String(task?.returnHref || ''),
        created_at: String(task?.createdAt || '')
      }))
    },
    coverage: {
      block_recall_timestamp_history: 'PROTOTYPE_FIRST_COMPLETION_TIMESTAMP',
      block_complete_timestamp_history: 'PROTOTYPE_FIRST_COMPLETION_TIMESTAMP',
      system_recall_history: 'PROTOTYPE_APPEND_PRESERVED_WITH_LEGACY_FALLBACK'
    },
    evidence_semantics: {
      chat_command: 'not learner evidence',
      repair_completed: 'repair execution only; not mastery',
      memory_recall: 'real retrieval observation on an existing released Memory asset',
      kp_recall: 'real KP retrieval observation; bootstrap compatibility events excluded',
      question_attempt: 'formal question attempt; bootstrap compatibility events excluded',
      source_contact: 'original Lecture contact confirmation',
      block_recall: 'first-pass Block reconstruction completion timestamp; repeated later-pass Block Recall is not yet a separate executor',
      block_complete: 'first-pass Block completion timestamp; not a mastery claim beyond the existing completion contract',
      system_recall: 'append-preserved System reconstruction event when current prototype history exists; legacy latest-only state remains labeled',
      memory_today: 'current native attention queue only; presence is not mastery debt and Chat may thin, defer, or ignore it based on current evidence',
      chat_return_receipt: 'subject-level typed Return validation result; APPLIED/STALE/REJECTED is transport/repair-routing state, not mastery evidence',
      chat_return_control: 'pending_chat_returns and chat_return_receipt are transport/control state only; APPLIED/STALE never equals learner mastery or Repair success',
      system_wu_return: 'current_system_wu binds exact current Wrong/Uncertain attempts; Chat may diagnose them but must not invent Block/KP mapping. Subject receipt is routing state, never mastery.'
    }
  };

  packet.summary = {
    source_contact_events: sourceContactEvents.length,
    ttsx_events: ttsxEvents.length,
    kp_recall_events: kpRecallEvents.length,
    block_recall_events: blockRecallEvents.length,
    block_complete_events: blockCompleteEvents.length,
    memory_recall_events: memoryEvents.length,
    question_attempts: questionEvents.length,
    repair_events: repairEvents.length,
    system_recall_events: systemRecallEvents.length,
    pending_chat_returns: packet.current.pending_chat_returns.length,
    current_system_wu: packet.current.current_system_wu.reduce((sum, row) => sum + (row.items?.length || 0), 0),
    pending_system_wu_returns: packet.current.pending_system_wu_returns.length,
    system_wu_return_receipt: packet.current.system_wu_return_receipt ? 1 : 0,
    memory_today: packet.current.memory_today.length,
    chat_return_receipt: packet.current.chat_return_receipt ? 1 : 0,
    active_repairs: packet.current.active_repairs.length
  };

  return packet;
}
