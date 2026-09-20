import {
  XIZONG_QUESTION_PREFERENCES_KEY,
  collectXizongRetainedEvidence,
  xizongQuestionMarkOverrides
} from './xizongRetainedPractice.mjs';
import { summarizeXizongScoreAttribution } from './xizongScoreAttribution.mjs';
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

function scoreAttemptHistoryFromStorageEntries(entries) {
  const events = [];
  for (const [, raw] of Array.isArray(entries) ? entries : []) {
    let state = null;
    try { state = JSON.parse(String(raw || 'null')); } catch {}
    if (!record(state)) continue;
    const history = Array.isArray(state.attemptHistory) ? state.attemptHistory : [];
    const hiddenSealed = Boolean(state?.paperSeal?.sealedAt);
    for (const event of history) {
      if (event?.type && event.type !== 'QUESTION_ATTEMPT') continue;
      if (String(event?.result_visibility || '') === 'hidden' && !hiddenSealed) continue;
      events.push(event);
    }
  }
  return events;
}

function boundedScoreAttribution(attribution) {
  const source = record(attribution) ? attribution : {};
  const targets = Array.isArray(source.targets) ? source.targets : [];
  return {
    schema: String(source.schema || 'kianos.xizong.score-attribution.v1'),
    semantics: String(source.semantics || ''),
    totals: clone(source.totals || {}),
    top_targets: targets
      .filter((row) => String(row?.owner_kind || '') !== 'UNKNOWN')
      .slice(0, 12)
      .map((row) => ({
        owner_kind: String(row?.owner_kind || ''),
        owner_id: String(row?.owner_id || ''),
        block_id: String(row?.block_id || ''),
        primary_kp_id: String(row?.primary_kp_id || ''),
        stable_points: Number(row?.stable_points || 0),
        uncertain_points: Number(row?.uncertain_points || 0),
        wrong_points: Number(row?.wrong_points || 0),
        first_attempt_wrong_points: Number(row?.first_attempt_wrong_points || 0),
        reuse_wrong_points: Number(row?.reuse_wrong_points || 0),
        question_ids: [...new Set((Array.isArray(row?.question_ids) ? row.question_ids : []).map(String).filter(Boolean))].slice(0, 5)
      }))
  };
}

function clampIndex(value, length) {
  if (!length) return 0;
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(n)));
}

export function buildXizongForecastProgress(storage, packetIndex = []) {
  if (!storage?.getItem) throw new Error('XIZONG_FORECAST_PROGRESS_STORAGE_UNAVAILABLE');
  if (!Array.isArray(packetIndex) || !packetIndex.length) {
    throw new Error('XIZONG_FORECAST_PROGRESS_PACKET_INDEX_REQUIRED');
  }

  const systems = new Map();
  const completedBlockIds = [];
  const startedIncomplete = [];
  let observedBlocks = 0;

  for (const row of packetIndex) {
    const systemId = String(row?.systemId || '');
    const canonicalId = String(row?.packetMeta?.canonicalId || '');
    const blockId = String(row?.blockId || row?.packetMeta?.blockId || '');
    const kpRows = Array.isArray(row?.kpRows) ? row.kpRows : [];
    if (!systemId || !canonicalId || !blockId || !kpRows.length) {
      throw new Error('XIZONG_FORECAST_PROGRESS_INDEX_ROW_INVALID');
    }

    if (!systems.has(systemId)) {
      systems.set(systemId, {
        system_id: systemId,
        canonical_id: canonicalId,
        canonical_blocks: 0,
        canonical_kp: 0,
        runtime_observed_blocks: 0,
        runtime_completed_blocks: 0,
        runtime_started_incomplete_blocks: 0,
        runtime_observed_learned_kp: 0
      });
    }
    const system = systems.get(systemId);
    system.canonical_blocks += 1;
    system.canonical_kp += kpRows.length;

    const objectId = String(row?.packetMeta?.objectId || `xizong:${blockId}`);
    const state = readJson(storage, `kianos-xizong-astro-v2:${objectId}`, null);
    if (!record(state)) continue;

    observedBlocks += 1;
    system.runtime_observed_blocks += 1;
    const learnedKp = Object.values(state.learned || {}).filter(Boolean).length;
    system.runtime_observed_learned_kp += learnedKp;

    if (state.completed === true) {
      completedBlockIds.push(blockId);
      system.runtime_completed_blocks += 1;
      continue;
    }

    system.runtime_started_incomplete_blocks += 1;
    startedIncomplete.push({
      system_id: systemId,
      canonical_id: canonicalId,
      block_id: blockId,
      kp_count: kpRows.length,
      learned_kp_count: learnedKp,
      current_stage: String(state.stage || ''),
      group_index: Number.isInteger(Number(state.groupIndex)) ? Number(state.groupIndex) : null,
      kp_index: Number.isInteger(Number(state.kpIndex)) ? Number(state.kpIndex) : null,
      block_recall_done: state.blockRecallDone === true
    });
  }

  const systemRows = [...systems.values()].sort((a,b) =>
    String(a.canonical_id).localeCompare(String(b.canonical_id), undefined, { numeric: true })
  );
  const canonicalBlocks = packetIndex.length;
  const canonicalKp = packetIndex.reduce((sum,row)=>sum+(Array.isArray(row?.kpRows)?row.kpRows.length:0),0);

  return {
    schema: 'kianos.xizong.forecast-progress.v1',
    forecast_role: 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY',
    gate_workload_authority: false,
    canonical_scope: {
      systems: systemRows.length,
      blocks: canonicalBlocks,
      canonical_kp: canonicalKp,
      block_weights: packetIndex.map((row) => ({
        system_id: String(row.systemId || ''),
        canonical_id: String(row.packetMeta?.canonicalId || ''),
        block_id: String(row.blockId || row.packetMeta?.blockId || ''),
        kp_count: Array.isArray(row.kpRows) ? row.kpRows.length : 0
      }))
    },
    runtime_evidence: {
      observed_blocks: observedBlocks,
      completed_blocks: completedBlockIds.length,
      started_incomplete_blocks: startedIncomplete.length,
      no_runtime_evidence_blocks: Math.max(0, canonicalBlocks - observedBlocks),
      completed_block_ids: completedBlockIds.sort(),
      started_incomplete: startedIncomplete
    },
    systems: systemRows,
    evidence_boundary:
      'Factual KianOS runtime progress only. NO_RUNTIME_EVIDENCE does not prove unstudied; learned_kp is not mastery; Gate workload still requires subject-owned reconciliation into exam.subject-demand.v1.'
  };
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
  const scoreAttribution = boundedScoreAttribution(
    summarizeXizongScoreAttribution(scoreAttemptHistoryFromStorageEntries(storageEntries))
  );
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
      marked_question_ids: clone(retained.markedIds),
      ai_transfer_probes: clone((retained.transferProbeEvents || []).slice(0, 50)),
      score_attribution: scoreAttribution
    },
    pending_repair_inbox: clone(readJson(storage, repairInboxKey, null)),
    reserve_learning: clone(packetMeta.reserveItems || []),
    evidence_semantics: {
      source_contact: 'original Lecture / MarginNote contact evidence; repository readiness never counts as learner contact',
      ttsx: 'reviewed Lecture-attached checkpoint evidence; absence does not create a checkpoint',
      kp_recall: 'primary active-recall evidence; repeated real attempts remain append-preserved',
      memory: 'later recovery evidence; repair may clear a local weak queue but does not rewrite original Recall',
      repair: 'bounded repair task; completion does not automatically mean mastery',
      question_attempt: 'formal official-question evidence; latest unresolved Wrong/Uncertain drives the default retained queue',
      ai_transfer_probe: 'generated transfer-only probe evidence; useful for targeted application/repair judgment but never formal score truth or official-question truth',
      score_attribution: 'bounded latest-official-attempt point-weight summary routed only through reviewed primary Knowledge owners; observed evidence, never guaranteed future score gain/loss'
    },
    request_to_chat: [
      '请先按 current + learning_state.resume 说明我现在学到哪里，再看 evidence；不要把仓库完成度当成我的学习进度。',
      '区分原讲义接触、KP Recall、TTSX、Memory、Repair、Question Attempt，它们不是同一种掌握证据。',
      '只指出最有价值的少数断点；稳定内容不要制造额外复习债务。',
      'practice.score_attribution 只表示已经观察到的官方题分值权重；必须结合 Recall / Remember / Transfer / 复刷新鲜度判断，不得把它解释成某个 KP 固定值多少分。',
      '如果问题属于 canonical Content / Prompt / 页面时机，请明确指出这是产品或内容问题，不要伪装成 learner weakness。',
      '需要看具体题或 KP 时，用 packet 中的稳定 ID 回 main@HEAD 读取当前 owner；不要凭 packet 文本补猜。'
    ]
  };
}
