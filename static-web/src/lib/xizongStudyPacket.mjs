import {
  XIZONG_QUESTION_PREFERENCES_KEY,
  collectXizongRetainedEvidence,
  xizongQuestionMarkOverrides
} from './xizongRetainedPractice.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  memorySummary,
  todayMemoryQueue,
  markedFragments,
  activeRepairTasks
} from './xizongMemoryModel.mjs';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage?.getItem?.(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function listStorageKeys(storage) {
  if (!storage || typeof storage.key !== 'function') return [];
  const length = Number(storage.length || 0);
  const keys = [];
  for (let index = 0; index < length; index += 1) {
    const key = storage.key(index);
    if (typeof key === 'string') keys.push(key);
  }
  return [...new Set(keys)];
}

function clampIndex(value, length) {
  if (!length) return 0;
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(n)));
}

export function buildXizongStudyPacketFromStorage({
  storage,
  packetMeta,
  kpRows,
  currentStage = '',
  currentIndex = null,
  studyState = undefined,
  now = Date.now()
} = {}) {
  if (!storage?.getItem) throw new Error('XIZONG_STUDY_PACKET_STORAGE_UNAVAILABLE');
  if (!record(packetMeta) || !packetMeta.blockId || !packetMeta.systemId || !packetMeta.sourceHash) {
    throw new Error('XIZONG_STUDY_PACKET_META_INVALID');
  }
  if (!Array.isArray(kpRows) || !kpRows.length || kpRows.some((row) => !row?.kpId)) {
    throw new Error('XIZONG_STUDY_PACKET_KP_SET_INVALID');
  }

  const objectId = String(packetMeta.objectId || `xizong:${packetMeta.blockId}`);
  const studyKey = `kianos-xizong-astro-v2:${objectId}`;
  const personalKey = `kianos-xizong-personal-v1:${objectId}`;
  const extensionKey = `kianos-xizong-memory-review-v2:${objectId}`;
  const repairInboxKey = `kianos-xizong-repair-inbox-v1:${objectId}`;
  const holdoutKey = 'kianos:xizong:full-paper-holdout-years:v1';

  const storedStudy = readJson(storage, studyKey, null);
  const study = record(studyState) ? studyState : storedStudy;
  if (!record(study)) return null;

  const currentPersonal = readJson(storage, personalKey, {}) || {};
  const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  const ext = readJson(storage, extensionKey, {}) || {};
  const history = Array.isArray(ext?.evidenceHistory) ? ext.evidenceHistory : [];

  const activeIndex = clampIndex(currentIndex == null ? study.kpIndex : currentIndex, kpRows.length);
  const activeKp = kpRows[activeIndex] || kpRows[0];
  const activeGroupId = String(activeKp?.groupId || '');
  const activeGroupKps = activeGroupId
    ? kpRows.filter((kp) => String(kp.groupId || '') === activeGroupId)
    : [];

  const unstableCount = (kpId) => history.filter((row) => row?.kp_id === kpId && (
    (row?.type === 'KP_RECALL' && ['unknown', 'fuzzy'].includes(String(row?.rating || '')))
    || (row?.type === 'MEMORY' && ['HOT', 'WARM'].includes(String(row?.state || '')))
  )).length;

  const kpEvidence = kpRows.map((kp) => ({
    kp_id: kp.kpId,
    display_id: kp.displayId || '',
    title: kp.title || '',
    logic_group_id: kp.groupId || '',
    logic_group_label: kp.groupLabel || '',
    source_locator: kp.sourceLocator || '',
    prompt: kp.prompt || '',
    prompt_override: String(memory.promptOverrides?.[kp.kpId] || ''),
    marks: Array.isArray(currentPersonal?.kp?.[kp.kpId]?.marks)
      ? clone(currentPersonal.kp[kp.kpId].marks)
      : [],
    learned: Boolean(study?.learned?.[kp.kpId]),
    recall_rating: String(study?.ratings?.[kp.kpId] || ''),
    repeated_unstable_count: unstableCount(kp.kpId),
    note: String(currentPersonal?.kp?.[kp.kpId]?.comment || '')
  }));

  const blockCardIds = new Set(Object.values(memory.cards || {})
    .filter((card) => String(card?.blockId || '') === String(packetMeta.blockId || ''))
    .map((card) => String(card.id || '')));
  const belongsToBlock = (task) => String(task?.blockId || '') === String(packetMeta.blockId || '')
    || kpRows.some((kp) => kp.kpId === String(task?.kpId || ''));

  const blockMemoryEvidence = (memory.evidence || [])
    .filter((row) => blockCardIds.has(String(row?.cardId || '')))
    .slice(-120);
  const blockToday = todayMemoryQueue(memory, { now })
    .filter((card) => String(card?.blockId || '') === String(packetMeta.blockId || ''))
    .map((card) => ({
      id: card.id,
      family: card.family,
      kp_id: card.kpId,
      weak_weight: card.weakWeight,
      review_requested: card.reviewRequested,
      retention_state: card.retentionState || '',
      due_reason: card.dueReason || '',
      due_at: card.dueAt || null,
      overdue_days: Number(card.overdueDays || 0),
      stability_stage: Number(card.stabilityStage || 0),
      next_interval_days: card.nextIntervalDays == null ? null : Number(card.nextIntervalDays)
    }));
  const blockMarks = markedFragments(memory)
    .filter((mark) => blockCardIds.has(String(mark?.cardId || '')))
    .map((mark) => ({
      id: mark.id,
      kp_id: mark.kpId,
      surface: mark.surface,
      text: mark.text,
      created_at: mark.createdAt
    }));
  const blockRepairs = activeRepairTasks(memory)
    .filter(belongsToBlock)
    .map((task) => ({
      id: task.id,
      kp_id: task.kpId,
      reason: task.reason,
      action: task.action,
      priority: task.priority,
      origin: task.origin,
      source_question_ids: task.sourceQuestionIds || [],
      block_href: task.blockHref || '',
      return_href: task.returnHref || ''
    }));

  const holdoutYears = readJson(storage, holdoutKey, []) || [];
  const preferences = readJson(storage, XIZONG_QUESTION_PREFERENCES_KEY, {}) || {};
  const storageEntries = listStorageKeys(storage)
    .filter((key) => /^kianos:xizong:(?:system|chat-set|retained|paper)-question-sweep:.*:v1$/.test(key))
    .map((key) => [key, storage.getItem(key)]);

  const retained = collectXizongRetainedEvidence(storageEntries, {
    holdoutYears,
    markOverrides: xizongQuestionMarkOverrides(preferences)
  });
  const latestAttempt = retained.latestAttemptByQuestion || {};
  const attemptSummary = (questionId) => {
    const row = latestAttempt[questionId] || {};
    return {
      question_id: questionId,
      status: String(row.status || ''),
      submitted_at: String(row.submitted_at || row.updatedAt || ''),
      study_phase: String(row.study_phase || ''),
      result_visibility: String(row.result_visibility || '')
    };
  };

  const systemRecall = packetMeta.systemId
    ? readJson(storage, `kianos:xizong:system-recall:${packetMeta.systemId}:v1`, null)
    : null;

  return {
    schema: 'kianos.xizong.study_packet.v3',
    exported_at: new Date(now).toISOString(),
    current: {
      object_id: objectId,
      system_id: packetMeta.systemId || '',
      canonical_id: packetMeta.canonicalId || '',
      block_id: packetMeta.blockId || '',
      block_label: packetMeta.blockLabel || '',
      block_title: packetMeta.blockTitle || '',
      source_path: packetMeta.sourcePath || '',
      source_hash: packetMeta.sourceHash || ''
    },
    learning_state: {
      current_stage: String(currentStage || study.stage || ''),
      source_contact: {
        confirmed_segments: Array.isArray(study.sourceContactEvidence)
          ? clone(study.sourceContactEvidence)
          : [],
        mode: packetMeta.sourceContactMode || '',
        per_logic_group: Boolean(packetMeta.sourcePerGroup),
        whole_block_confirmed: Boolean(study.sourceContactDone),
        active_group_contacted: activeGroupKps.length > 0
          && activeGroupKps.every((kp) => Boolean(study?.learned?.[kp.kpId]))
      },
      resume: {
        group_index: Math.max(0, Number(study.groupIndex || 0)),
        logic_group_id: activeGroupId,
        logic_group_label: activeKp?.groupLabel || '',
        kp_index: activeIndex,
        kp_id: activeKp?.kpId || '',
        kp_display_id: activeKp?.displayId || '',
        source_locator: activeKp?.sourceLocator || ''
      },
      ttsx: {
        pending: clone(study.pendingTtsx || null),
        evidence: clone(study.ttsxEvidence || {}),
        annotations: clone(study.ttsxAnnotations || {})
      },
      learned_kp_ids: Object.entries(study.learned || {})
        .filter(([, done]) => Boolean(done))
        .map(([id]) => id),
      recall_ratings: clone(study.ratings || {}),
      block_recall_done: Boolean(study.blockRecallDone),
      block_complete: Boolean(study.completed),
      system_recall: clone(systemRecall)
    },
    summary: {
      total_kp: kpRows.length,
      learned_kp: Object.values(study.learned || {}).filter(Boolean).length,
      recalled_kp: Object.keys(study.ratings || {}).length,
      active_logic_group_id: activeGroupId,
      active_kp_id: activeKp?.kpId || '',
      repeated_unstable_kp_ids: kpEvidence
        .filter((row) => row.repeated_unstable_count > 1)
        .map((row) => row.kp_id),
      notes_count: kpEvidence.filter((row) => Boolean(row.note)).length,
      xizong_memory: memorySummary(memory, now),
      unresolved_wu_questions: retained.wrongUncertainIds.length,
      marked_questions: retained.markedIds.length
    },
    kp_evidence: kpEvidence,
    block_evidence_history: clone(history),
    memory: {
      today: blockToday,
      marked_fragments: blockMarks,
      active_repairs: blockRepairs,
      evidence: blockMemoryEvidence
    },
    practice: {
      holdout_years: clone(holdoutYears),
      wrong_uncertain: retained.wrongUncertainIds.map(attemptSummary),
      marked_question_ids: clone(retained.markedIds)
    },
    pending_repair_inbox: clone(readJson(storage, repairInboxKey, null)),
    reserve_learning: clone(packetMeta.reserveItems || []),
    evidence_semantics: {
      source_contact: 'original Lecture / MarginNote contact evidence; repository readiness never counts as learner contact',
      ttsx: 'reviewed Lecture-attached checkpoint evidence; absence does not create a checkpoint',
      kp_recall: 'primary active-recall evidence; repeated real attempts remain append-preserved',
      memory: 'later recovery evidence; repair may clear a local weak queue but does not rewrite original Recall',
      repair: 'bounded repair task; completion does not automatically mean mastery',
      question_attempt: 'formal question evidence; latest unresolved Wrong/Uncertain drives the default retained queue'
    },
    request_to_chat: [
      '请先按 current + learning_state.resume 说明我现在学到哪里，再看 evidence；不要把仓库完成度当成我的学习进度。',
      '区分原讲义接触、KP Recall、TTSX、Memory、Repair、Question Attempt，它们不是同一种掌握证据。',
      '只指出最有价值的少数断点；稳定内容不要制造额外复习债务。',
      '如果问题属于 canonical Content / Prompt / 页面时机，请明确指出这是产品或内容问题，不要伪装成 learner weakness。',
      '需要看具体题或 KP 时，用 packet 中的稳定 ID 回 main@HEAD 读取当前 owner；不要凭 packet 文本补猜。'
    ]
  };
}
