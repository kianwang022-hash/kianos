import {
  XIZONG_MEMORY_STORAGE_KEY,
  activeRepairTasks,
  normalizeXizongMemoryState
} from './xizongMemoryModel.mjs';
import { studyDayAt } from './studyTimer.mjs';

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
  for (const key of keys.filter((value) => value.startsWith('kianos-xizong-astro-v2:xizong:'))) {
    const state = readJson(storage, key, null);
    if (!record(state)) continue;
    const blockId = blockIdFromObjectKey(key, 'kianos-xizong-astro-v2:');

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
    if (!record(state) || !onDay(state.completedAt, day)) continue;
    const systemId = key.match(/^kianos:xizong:system-recall:([^:]+):v1$/)?.[1] || '';
    systemRecallEvents.push({
      system_id: systemId,
      completed_at: String(state.completedAt || ''),
      after_round_id: state.afterRoundId || null
    });
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
      memory_recall: memoryEvents,
      question_attempt: questionEvents,
      repair_lifecycle: repairEvents,
      system_recall: systemRecallEvents
    },
    current: {
      active_repairs: activeRepairTasks(memory).map((task) => ({
        task_id: String(task?.id || ''),
        system_id: String(task?.systemId || ''),
        block_id: String(task?.blockId || ''),
        kp_id: String(task?.kpId || ''),
        priority: String(task?.priority || ''),
        origin: String(task?.origin || '')
      }))
    },
    coverage: {
      block_recall_timestamp_history: 'MISSING_IN_CURRENT_RUNTIME',
      block_complete_timestamp_history: 'MISSING_IN_CURRENT_RUNTIME',
      system_recall_history: 'LATEST_COMPLETION_ONLY'
    },
    evidence_semantics: {
      chat_command: 'not learner evidence',
      repair_completed: 'repair execution only; not mastery',
      memory_recall: 'real retrieval observation on an existing released Memory asset',
      kp_recall: 'real KP retrieval observation; bootstrap compatibility events excluded',
      question_attempt: 'formal question attempt; bootstrap compatibility events excluded',
      source_contact: 'original Lecture contact confirmation',
      system_recall: 'latest recorded System reconstruction completion; historical attempts are not yet append-preserved'
    }
  };

  packet.summary = {
    source_contact_events: sourceContactEvents.length,
    ttsx_events: ttsxEvents.length,
    kp_recall_events: kpRecallEvents.length,
    memory_recall_events: memoryEvents.length,
    question_attempts: questionEvents.length,
    repair_events: repairEvents.length,
    system_recall_events: systemRecallEvents.length,
    active_repairs: packet.current.active_repairs.length
  };

  return packet;
}
