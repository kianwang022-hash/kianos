import {
  XIZONG_QUESTION_PREFERENCES_KEY,
  collectXizongRetainedEvidence,
  xizongQuestionMarkOverrides
} from './xizongRetainedPractice.mjs';
import { summarizeXizongScoreAttribution } from './xizongScoreAttribution.mjs';
import {
  buildXizongWorkloadForecast,
  XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE,
  xizongHistoricalDisciplineForQuestion
} from './xizongForecastModel.mjs';
import {
  aggregateStudyTime,
  readStudyTimerLedger,
  studyDayAt
} from './studyTimer.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  normalizeXizongMemoryState,
  memorySummary,
  memoryFamilySummary,
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

function studyDayFromIso(value) {
  const timestamp = Date.parse(String(value || ''));
  return Number.isFinite(timestamp) ? studyDayAt(timestamp) : null;
}

function eventYear(event) {
  const direct = Number(event?.year);
  if (Number.isInteger(direct)) return direct;
  const match = String(event?.question_id || '').match(/^xizong-official-(\d{4})-n\d{3}$/);
  return match ? Number(match[1]) : null;
}

function timerMinutesForDetail(storage, detailKey, { startAt = null, endAt = null } = {}) {
  const key = String(detailKey || '');
  if (!key) return 0;
  const start = startAt == null ? Number.NEGATIVE_INFINITY : Date.parse(String(startAt));
  const end = endAt == null ? Number.POSITIVE_INFINITY : Date.parse(String(endAt));
  if (startAt != null && !Number.isFinite(start)) return 0;
  if (endAt != null && !Number.isFinite(end)) return 0;
  let ms = 0;
  for (const session of readStudyTimerLedger(storage).sessions || []) {
    if (session?.excluded || session?.subject !== 'xizong') continue;
    if (String(session?.context?.detailKey || '') !== key) continue;
    const from = Math.max(Number(session.startedAt || 0), start);
    const to = Math.min(Number(session.endedAt || 0), end);
    if (Number.isFinite(from) && Number.isFinite(to) && to > from) ms += to - from;
  }
  return Math.round(ms / 60000);
}

function repairDetailKey(task) {
  const href = String(task?.blockHref || task?.returnHref || '');
  const match = href.match(/(?:^|\/)xizong\/([^/]+)\/([^/]+)(?:\/|$)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

function xizongPracticeMinutesForDay(storage, day, now, detailKeys = null) {
  if (!day) return 0;
  const aggregate = aggregateStudyTime(storage, { day, now });
  const allowed = detailKeys instanceof Set ? detailKeys : null;
  return Math.round(
    Object.entries(aggregate?.bySubject?.xizong?.details || {})
      .filter(([detail]) => {
        const key = String(detail);
        if (allowed) return allowed.has(key);
        return key.startsWith('practice/');
      })
      .reduce((sum, [, value]) => sum + Number(value || 0), 0) / 60000
  );
}


function attemptIndex(event) {
  const value = Number(event?.attempt_index);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function attemptTimestamp(event) {
  const value = Date.parse(String(event?.submitted_at || event?.updatedAt || ''));
  return Number.isFinite(value) ? value : null;
}

function earlierAttempt(candidate, current) {
  if (!current) return true;
  const candidateIndex = attemptIndex(candidate);
  const currentIndex = attemptIndex(current);
  if (candidateIndex !== null && currentIndex !== null && candidateIndex !== currentIndex) {
    return candidateIndex < currentIndex;
  }
  const candidateAt = attemptTimestamp(candidate);
  const currentAt = attemptTimestamp(current);
  if (candidateAt !== null && currentAt !== null && candidateAt !== currentAt) {
    return candidateAt < currentAt;
  }
  return false;
}

function laterAttempt(candidate, current) {
  if (!current) return true;
  const candidateIndex = attemptIndex(candidate);
  const currentIndex = attemptIndex(current);
  if (candidateIndex !== null && currentIndex !== null && candidateIndex !== currentIndex) {
    return candidateIndex > currentIndex;
  }
  const candidateAt = attemptTimestamp(candidate);
  const currentAt = attemptTimestamp(current);
  if (candidateAt !== null && currentAt !== null && candidateAt !== currentAt) {
    return candidateAt > currentAt;
  }
  return false;
}

function summarizeXizongForecastPractice(storage, {
  holdoutYears = [],
  now = Date.now(),
  questionScope = null
} = {}) {
  const storageEntries = listStorageKeys(storage)
    .filter((key) => /^kianos:xizong:(?:system|chat-set|retained|paper)-question-sweep:.*:v1$/.test(key))
    .map((key) => [key, storage.getItem(key)]);
  const allEvents = scoreAttemptHistoryFromStorageEntries(storageEntries);
  const events = allEvents
    .filter((event) => /^xizong-official-\d{4}-n\d{3}$/.test(String(event?.question_id || '')));
  const transferLatest = new Map();
  for (const event of allEvents) {
    const questionId = String(event?.question_id || '');
    if (String(event?.question_source || '') !== 'AI_TRANSFER_PROBE' || !questionId) continue;
    if (laterAttempt(event, transferLatest.get(questionId))) transferLatest.set(questionId, event);
  }

  const firstPass = new Map();
  const latest = new Map();
  for (const event of events) {
    const questionId = String(event?.question_id || '');
    if (!questionId) continue;
    if (String(event?.study_phase || '') === 'FIRST_PASS' && earlierAttempt(event, firstPass.get(questionId))) {
      firstPass.set(questionId, event);
    }
    if (laterAttempt(event, latest.get(questionId))) latest.set(questionId, event);
  }

  const firstPassCounts = { stable: 0, uncertain: 0, wrong: 0 };
  const holdout = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number).filter(Number.isInteger));
  const byDay = new Map();
  const bySystem = new Map();
  const currentScopeBySystem = new Map(
    (Array.isArray(questionScope?.systems) ? questionScope.systems : [])
      .filter((row) => row?.status === 'EXACT')
      .map((row) => [String(row?.system_id || ''), row])
  );
  const currentCoverageBySystem = new Map();
  const currentScopeFirstAttempt = new Map();
  let eligibleAttempted = 0;
  let currentScopeEligibleAttempted = 0;
  let heldoutObserved = 0;
  for (const event of firstPass.values()) {
    const status = String(event?.status || '');
    if (Object.hasOwn(firstPassCounts, status)) firstPassCounts[status] += 1;
    const year = eventYear(event);
    const eligible = !holdout.has(year);
    if (eligible) eligibleAttempted += 1;
    else heldoutObserved += 1;
    const eventSystemId = String(event?.system_id || '');
    const currentScope = currentScopeBySystem.get(eventSystemId);
    const systemKey = String(currentScope?.canonical_id || event?.canonical_id || eventSystemId || 'UNKNOWN');
    if (!bySystem.has(systemKey)) {
      bySystem.set(systemKey, {
        canonical_id: systemKey,
        system_id: eventSystemId || String(currentScope?.system_id || ''),
        attempted: 0,
        eligible_attempted: 0,
        current_scope_eligible_attempted: 0,
        stable: 0,
        uncertain: 0,
        wrong: 0
      });
    }
    const systemRow = bySystem.get(systemKey);
    systemRow.attempted += 1;
    if (eligible) systemRow.eligible_attempted += 1;
    if (Object.hasOwn(firstPassCounts, status)) systemRow[status] += 1;
    const day = studyDayFromIso(event?.submitted_at);
    if (!day) continue;
    if (!byDay.has(day)) byDay.set(day, { day, attempted: 0, stable: 0, uncertain: 0, wrong: 0 });
    const row = byDay.get(day);
    row.attempted += 1;
    if (Object.hasOwn(firstPassCounts, status)) row[status] += 1;
  }

  for (const event of events) {
    if (String(event?.study_phase || '') !== 'FIRST_PASS') continue;
    if (String(event?.context || '') !== 'SYSTEM_SWEEP') continue;
    const eventSystemId = String(event?.system_id || '');
    const currentScope = currentScopeBySystem.get(eventSystemId);
    if (!currentScope) continue;
    if (String(event?.scope_hash || '') !== String(currentScope?.scope_hash || '')) continue;
    if (String(event?.question_inventory_hash || '') !== String(currentScope?.question_inventory_hash || '')) continue;
    if (holdout.has(eventYear(event))) continue;
    const questionId = String(event?.question_id || '');
    if (!questionId) continue;
    const canonicalId = String(currentScope?.canonical_id || event?.canonical_id || eventSystemId);
    if (!currentCoverageBySystem.has(canonicalId)) currentCoverageBySystem.set(canonicalId, new Set());
    currentCoverageBySystem.get(canonicalId).add(questionId);
    if (earlierAttempt(event, currentScopeFirstAttempt.get(questionId))) {
      currentScopeFirstAttempt.set(questionId, event);
    }
  }
  for (const [canonicalId, ids] of currentCoverageBySystem.entries()) {
    let row = bySystem.get(canonicalId);
    if (!row) {
      row = {
        canonical_id: canonicalId,
        system_id: String(
          [...currentScopeBySystem.values()].find((scope) => String(scope?.canonical_id || '') === canonicalId)?.system_id || ''
        ),
        attempted: 0,
        eligible_attempted: 0,
        current_scope_eligible_attempted: 0,
        stable: 0,
        uncertain: 0,
        wrong: 0
      };
      bySystem.set(canonicalId, row);
    }
    row.current_scope_eligible_attempted = ids.size;
    currentScopeEligibleAttempted += ids.size;
  }

  const wrongUncertain = firstPassCounts.wrong + firstPassCounts.uncertain;
  const currentScopeCounts = { stable: 0, uncertain: 0, wrong: 0 };
  for (const event of currentScopeFirstAttempt.values()) {
    const status = String(event?.status || '');
    if (Object.hasOwn(currentScopeCounts, status)) currentScopeCounts[status] += 1;
  }
  const currentScopeWrongUncertain = currentScopeCounts.wrong + currentScopeCounts.uncertain;
  const unresolvedWrongUncertain = [...firstPass.entries()]
    .filter(([, event]) => ['wrong', 'uncertain'].includes(String(event?.status || '')))
    .filter(([questionId]) => ['wrong', 'uncertain'].includes(String(latest.get(questionId)?.status || '')))
    .length;
  const latestSubmittedAt = [...latest.values()]
    .map((event) => String(event?.submitted_at || ''))
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  const currentByDay = new Map();
  for (const event of currentScopeFirstAttempt.values()) {
    const day = studyDayFromIso(event?.submitted_at);
    if (!day) continue;
    if (!currentByDay.has(day)) {
      currentByDay.set(day, { attempted: 0, stable: 0, uncertain: 0, wrong: 0, system_ids: new Set() });
    }
    const row = currentByDay.get(day);
    row.attempted += 1;
    const systemId = String(event?.system_id || '');
    if (systemId) row.system_ids.add(systemId);
    const status = String(event?.status || '');
    if (Object.hasOwn(row, status)) row[status] += 1;
  }

  const dayRows = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)).slice(-30)
    .map((row) => {
      const practiceTimerMinutes = xizongPracticeMinutesForDay(storage, row.day, now);
      const current = currentByDay.get(row.day)
        || { attempted: 0, stable: 0, uncertain: 0, wrong: 0, system_ids: new Set() };
      const currentDetailKeys = new Set(
        [...current.system_ids].map((systemId) => `practice/${systemId}`)
      );
      const currentTimerMinutes = currentDetailKeys.size
        ? xizongPracticeMinutesForDay(storage, row.day, now, currentDetailKeys)
        : 0;
      return {
        ...row,
        practice_timer_minutes: practiceTimerMinutes,
        observed_minutes_per_attempt:
          row.attempted > 0 && practiceTimerMinutes > 0
            ? Number((practiceTimerMinutes / row.attempted).toFixed(3))
            : null,
        current_scope_attempted: current.attempted,
        current_scope_stable: current.stable,
        current_scope_uncertain: current.uncertain,
        current_scope_wrong: current.wrong,
        current_scope_practice_timer_minutes: currentTimerMinutes,
        current_scope_observed_minutes_per_attempt:
          current.attempted > 0 && currentTimerMinutes > 0
            ? Number((currentTimerMinutes / current.attempted).toFixed(3))
            : null
      };
    });

  const transferCounts = { stable: 0, uncertain: 0, wrong: 0 };
  const transferKinds = {};
  for (const event of transferLatest.values()) {
    const status = String(event?.status || '');
    if (Object.hasOwn(transferCounts, status)) transferCounts[status] += 1;
    const kind = String(event?.probe_kind || 'UNSPECIFIED');
    transferKinds[kind] = (transferKinds[kind] || 0) + 1;
  }

  return {
    schema: 'kianos.xizong.practice-forecast-evidence.v1',
    official_attempt_events: events.length,
    first_pass: {
      attempted_questions: firstPass.size,
      stable: firstPassCounts.stable,
      uncertain: firstPassCounts.uncertain,
      wrong: firstPassCounts.wrong,
      wrong_or_uncertain: wrongUncertain,
      wrong_or_uncertain_rate: firstPass.size ? Number((wrongUncertain / firstPass.size).toFixed(4)) : null,
      eligible_attempted_questions: eligibleAttempted,
      current_scope_eligible_attempted_questions: currentScopeEligibleAttempted,
      current_scope_unique_attempted_questions: currentScopeFirstAttempt.size,
      current_scope_stable: currentScopeCounts.stable,
      current_scope_uncertain: currentScopeCounts.uncertain,
      current_scope_wrong: currentScopeCounts.wrong,
      current_scope_wrong_or_uncertain: currentScopeWrongUncertain,
      current_scope_wrong_or_uncertain_rate:
        currentScopeFirstAttempt.size
          ? Number((currentScopeWrongUncertain / currentScopeFirstAttempt.size).toFixed(4))
          : null,
      heldout_observed_questions: heldoutObserved,
      by_system: [...bySystem.values()].sort((a, b) => String(a.canonical_id).localeCompare(String(b.canonical_id), undefined, { numeric: true })),
      by_day: dayRows
    },
    latest: {
      observed_questions: latest.size,
      unresolved_wrong_uncertain_questions: unresolvedWrongUncertain,
      last_submitted_at: latestSubmittedAt
    },
    fresh_transfer: {
      observed_probes: transferLatest.size,
      stable: transferCounts.stable,
      uncertain: transferCounts.uncertain,
      wrong: transferCounts.wrong,
      by_probe_kind: transferKinds
    },
    evidence_boundary:
      'Official question attempts are deduplicated by question id. Only FIRST_PASS SYSTEM_SWEEP attempts bound to the Current exact scope hash + inventory hash reduce remaining workload and calibrate preferred System-sweep error/speed rates; whole-paper/chat-set/retained/stale attempts remain broader performance evidence only.'
  };
}

function summarizeXizongForecastRepairs(storage) {
  const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  const allRepairs = Array.isArray(memory.repairTasks) ? memory.repairTasks : [];
  const activeRepairs = activeRepairTasks(memory);
  const sourceQuestionIds = new Set();
  let questionBackedClusters = 0;
  let activeQuestionBackedClusters = 0;
  let completedClusters = 0;
  let completedQuestionBackedClusters = 0;
  const calibrationSamples = [];
  for (const task of allRepairs) {
    const ids = Array.isArray(task?.sourceQuestionIds) ? task.sourceQuestionIds.map(String).filter(Boolean) : [];
    const officialIds = ids.filter((id) => /^xizong-official-\d{4}-n\d{3}$/.test(id));
    const done = String(task?.status || '') === 'DONE';
    if (done) completedClusters += 1;
    if (!officialIds.length) continue;
    questionBackedClusters += 1;
    if (done) completedQuestionBackedClusters += 1;
    else activeQuestionBackedClusters += 1;
    officialIds.forEach((id) => sourceQuestionIds.add(id));
    if (done) {
      const detailKey = repairDetailKey(task);
      const timerMinutes = detailKey && task?.createdAt && task?.completedAt
        ? timerMinutesForDetail(storage, detailKey, { startAt: task.createdAt, endAt: task.completedAt })
        : null;
      calibrationSamples.push({
        repair_id: String(task?.id || ''),
        source_question_count: officialIds.length,
        detail_key: detailKey,
        created_at: String(task?.createdAt || '') || null,
        completed_at: String(task?.completedAt || '') || null,
        timer_minutes_in_repair_window: Number.isFinite(timerMinutes) ? timerMinutes : null
      });
    }
  }
  return {
    schema: 'kianos.xizong.repair-forecast-evidence.v1',
    total_repair_clusters: allRepairs.length,
    active_repair_clusters: activeRepairs.length,
    active_question_backed_clusters: activeQuestionBackedClusters,
    completed_repair_clusters: completedClusters,
    completed_question_backed_clusters: completedQuestionBackedClusters,
    question_backed_clusters: questionBackedClusters,
    unique_source_question_ids: sourceQuestionIds.size,
    observed_question_to_cluster_ratio:
      questionBackedClusters > 0 ? Number((sourceQuestionIds.size / questionBackedClusters).toFixed(3)) : null,
    calibration_samples: calibrationSamples,
    evidence_boundary:
      'Repair lifecycle is subject-owned. Official-question compression ratios use official question ids only; AI probes and non-official sources cannot reduce predicted official W/U workload. Several Wrong/Uncertain questions may share one root cause, and DONE still requires later fresh verification.'
  };
}

function summarizeXizongSystemRecallForecast(storage, systemRows = []) {
  return (Array.isArray(systemRows) ? systemRows : []).map((system) => {
    const systemId = String(system?.system_id || '');
    const recall = readJson(storage, `kianos:xizong:system-recall:${systemId}:v1`, {}) || {};
    const sweep = readJson(storage, `kianos:xizong:system-question-sweep:${systemId}:v1`, {}) || {};
    const firstPassRoundIds = new Set(
      (Array.isArray(sweep?.attemptHistory) ? sweep.attemptHistory : [])
        .filter((event) => String(event?.study_phase || '') === 'FIRST_PASS')
        .map((event) => String(event?.round_id || ''))
        .filter(Boolean)
    );
    const history = (Array.isArray(recall?.history) ? recall.history : [])
      .filter((event) => Number.isFinite(Date.parse(String(event?.completed_at || ''))))
      .sort((a, b) => Date.parse(a.completed_at) - Date.parse(b.completed_at));
    let previousAt = null;
    const events = history.map((event) => {
      const afterRoundId = String(event?.after_round_id || '');
      const completedAt = String(event?.completed_at || '');
      const timerMinutes = timerMinutesForDetail(storage, `${systemId}/recall`, {
        startAt: previousAt,
        endAt: completedAt
      });
      previousAt = completedAt;
      return {
        completed_at: completedAt,
        after_round_id: afterRoundId || null,
        role: !afterRoundId
          ? 'PRE_QUESTION_OR_MANUAL'
          : firstPassRoundIds.has(afterRoundId)
            ? 'POST_FIRST_PASS'
            : 'POST_OTHER_ROUND',
        timer_minutes_since_previous_recall: timerMinutes
      };
    });
    return {
      system_id: systemId,
      canonical_id: String(system?.canonical_id || ''),
      pre_question_recall_observed: events.some((event) => event.role === 'PRE_QUESTION_OR_MANUAL'),
      post_first_pass_recall_observed: events.some((event) => event.role === 'POST_FIRST_PASS'),
      first_pass_round_ids: [...firstPassRoundIds],
      events
    };
  });
}

function summarizeXizongFormalScoreEvidence(storage) {
  const rows = [];
  for (const key of listStorageKeys(storage)) {
    if (!/^kianos:xizong:paper-question-sweep:paper-\d{4}:v1$/.test(key)) continue;
    const state = readJson(storage, key, null);
    const seal = state?.paperSeal;
    if (!record(seal) || !seal.sealedAt || !record(seal.summary)) continue;
    const match = key.match(/paper-(\d{4})/);
    const year = match ? Number(match[1]) : null;
    let disciplineBreakdown = null;
    if (Number.isInteger(year) && year >= 2017 && year <= 2026) {
      const byQuestion = new Map();
      for (const event of Array.isArray(state?.attemptHistory) ? state.attemptHistory : []) {
        if (event?.type && event.type !== 'QUESTION_ATTEMPT') continue;
        const questionId = String(event?.question_id || '');
        if (!questionId || Number(event?.year) !== year) continue;
        if (!byQuestion.has(questionId) || laterAttempt(event, byQuestion.get(questionId))) {
          byQuestion.set(questionId, event);
        }
      }
      const disciplineRows = Object.fromEntries(
        Object.entries(XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE.disciplines).map(([id, profile]) => [
          id,
          {
            id,
            label: profile.label,
            max_points: Number(profile.points || 0),
            answered_points: 0,
            earned_points: 0,
            wrong_points: 0,
            uncertain_correct_points: 0,
            unanswered_points: Number(profile.points || 0),
            answered_questions: 0
          }
        ])
      );
      for (const event of byQuestion.values()) {
        const discipline = xizongHistoricalDisciplineForQuestion(year, event?.number);
        const row = disciplineRows[discipline];
        if (!row) continue;
        const points = Number(event?.points_possible || 0);
        if (!Number.isFinite(points) || points <= 0) continue;
        row.answered_points += points;
        row.answered_questions += 1;
        const status = String(event?.status || '');
        if (status === 'stable' || status === 'uncertain') row.earned_points += points;
        if (status === 'wrong') row.wrong_points += points;
        if (status === 'uncertain') row.uncertain_correct_points += points;
      }
      for (const row of Object.values(disciplineRows)) {
        row.answered_points = Number(row.answered_points.toFixed(1));
        row.earned_points = Number(row.earned_points.toFixed(1));
        row.wrong_points = Number(row.wrong_points.toFixed(1));
        row.uncertain_correct_points = Number(row.uncertain_correct_points.toFixed(1));
        row.unanswered_points = Number(Math.max(0, row.max_points - row.answered_points).toFixed(1));
      }
      disciplineBreakdown = {
        authority: XIZONG_HISTORICAL_MODERN_165_SCORE_PROFILE.authority,
        disciplines: disciplineRows
      };
    }
    rows.push({
      year,
      sealed_at: String(seal.sealedAt || ''),
      review_unlocked_at: String(seal.reviewUnlockedAt || '') || null,
      answered_count: Number(seal.summary.answeredCount || 0),
      correct_count: Number(seal.summary.correctCount || 0),
      wrong_count: Number(seal.summary.wrongCount || 0),
      unanswered_count: Number(seal.summary.unansweredCount || 0),
      question_count: Number(seal.summary.questionCount || 0),
      earned_score: Number(seal.summary.earnedScore || 0),
      max_score: Number(seal.summary.maxScore || 0),
      discipline_breakdown: disciplineBreakdown
    });
  }
  rows.sort((a, b) => String(a.sealed_at).localeCompare(String(b.sealed_at)));
  return {
    schema: 'kianos.xizong.formal-score-evidence.v1',
    sealed_papers: rows,
    latest: rows.at(-1) || null,
    evidence_boundary:
      'Sealed whole-paper score is formal paper evidence. Review unlock or prior exposure affects future freshness but does not rewrite the score observed at seal time.'
  };
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

function reconcileForecastQuestionScope(questionScope, practiceEvidence, holdoutYears = []) {
  if (!record(questionScope) || questionScope.schema !== 'kianos.xizong.forecast-question-scope.v1') {
    return {
      schema: 'kianos.xizong.forecast-question-workload.v1',
      status: 'UNKNOWN',
      reason: 'CURRENT_QUESTION_SCOPE_NOT_ATTACHED',
      unknown_systems: [],
      known_eligible_questions: null,
      known_remaining_questions: null
    };
  }

  const holdout = new Set((Array.isArray(holdoutYears) ? holdoutYears : []).map(Number).filter(Number.isInteger));
  const practiceBySystem = new Map(
    (practiceEvidence?.first_pass?.by_system || []).map((row) => [String(row?.canonical_id || ''), row])
  );
  const systems = (questionScope.systems || []).map((row) => {
    if (row?.status !== 'EXACT') {
      return {
        canonical_id: String(row?.canonical_id || ''),
        system_id: String(row?.system_id || ''),
        status: 'UNKNOWN',
        eligible_questions: null,
        attempted_questions: null,
        remaining_questions: null,
        reason: String(row?.reason || 'EXACT_SCOPE_UNAVAILABLE')
      };
    }
    const heldout = Object.entries(row?.year_counts || {})
      .filter(([year]) => holdout.has(Number(year)))
      .reduce((sum, [, count]) => sum + Number(count || 0), 0);
    const eligible = Math.max(0, Number(row?.question_count || 0) - heldout);
    const practice = practiceBySystem.get(String(row?.canonical_id || ''));
    const attempted = Math.min(eligible, Math.max(0, Number(practice?.current_scope_eligible_attempted || 0)));
    return {
      canonical_id: String(row?.canonical_id || ''),
      system_id: String(row?.system_id || ''),
      status: 'EXACT',
      exact_questions: Number(row?.question_count || 0),
      heldout_questions: heldout,
      eligible_questions: eligible,
      attempted_questions: attempted,
      remaining_questions: Math.max(0, eligible - attempted)
    };
  });
  const knownEligible = systems
    .filter((row) => row.status === 'EXACT')
    .reduce((sum, row) => sum + Number(row.eligible_questions || 0), 0);
  const knownRemainingBySystem = systems
    .filter((row) => row.status === 'EXACT')
    .reduce((sum, row) => sum + Number(row.remaining_questions || 0), 0);
  const duplicateMemberships = Number(questionScope.cross_system_duplicate_memberships || 0);
  const unionHeldout = Object.entries(questionScope.union_year_counts || {})
    .filter(([year]) => holdout.has(Number(year)))
    .reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const unionEligible = Math.max(0, Number(questionScope.exact_union_questions || 0) - unionHeldout);

  return {
    schema: 'kianos.xizong.forecast-question-workload.v1',
    status: questionScope.scope_complete ? 'EXACT_COMPLETE' : 'EXACT_PARTIAL',
    holdout_years: [...holdout].sort((a, b) => a - b),
    exact_union_questions: Number(questionScope.exact_union_questions || 0),
    exact_union_eligible_questions: unionEligible,
    summed_system_eligible_questions: knownEligible,
    cross_system_duplicate_memberships: duplicateMemberships,
    known_remaining_questions: duplicateMemberships === 0 ? knownRemainingBySystem : null,
    known_remaining_is_lower_bound: !questionScope.scope_complete,
    unknown_systems: [...(questionScope.unknown_systems || [])],
    systems,
    evidence_boundary:
      'Known remaining questions are exact only when System scopes are exact and duplicate membership is zero. UNKNOWN systems remain unpriced and make the known total a lower bound.'
  };
}

function clampIndex(value, length) {
  if (!length) return 0;
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(n)));
}

export function buildXizongForecastProgress(storage, packetIndex = [], {
  questionScope = null,
  day = studyDayAt(Date.now()),
  now = Date.now()
} = {}) {
  if (!storage?.getItem) throw new Error('XIZONG_FORECAST_PROGRESS_STORAGE_UNAVAILABLE');
  if (!Array.isArray(packetIndex) || !packetIndex.length) {
    throw new Error('XIZONG_FORECAST_PROGRESS_PACKET_INDEX_REQUIRED');
  }

  const systems = new Map();
  const completedBlockIds = [];
  const completedBlockRows = [];
  const startedIncomplete = [];
  const recallTotals = { rated: 0, unknown: 0, fuzzy: 0, known: 0, mastered: 0 };
  let observedBlocks = 0;

  for (const row of packetIndex) {
    const systemId = String(row?.systemId || '');
    const canonicalId = String(row?.packetMeta?.canonicalId || '');
    const blockId = String(row?.blockId || row?.packetMeta?.blockId || '');
    const kpRows = Array.isArray(row?.kpRows) ? row.kpRows : [];
    const logicGroupCount = new Set(kpRows.map((kp) => String(kp?.groupId || '')).filter(Boolean)).size;
    const routeKey = String(row?.routeKey || (row?.slug ? `${systemId}/${row.slug}` : ''));
    if (!systemId || !canonicalId || !blockId || !kpRows.length) {
      throw new Error('XIZONG_FORECAST_PROGRESS_INDEX_ROW_INVALID');
    }

    if (!systems.has(systemId)) {
      systems.set(systemId, {
        system_id: systemId,
        canonical_id: canonicalId,
        canonical_blocks: 0,
        canonical_kp: 0,
        canonical_logic_groups: 0,
        runtime_observed_blocks: 0,
        runtime_completed_blocks: 0,
        runtime_started_incomplete_blocks: 0,
        runtime_observed_learned_kp: 0,
        runtime_recall_rated_kp: 0,
        runtime_recall_unknown: 0,
        runtime_recall_fuzzy: 0,
        runtime_recall_known: 0,
        runtime_recall_mastered: 0
      });
    }
    const system = systems.get(systemId);
    system.canonical_blocks += 1;
    system.canonical_kp += kpRows.length;
    system.canonical_logic_groups += logicGroupCount;

    const objectId = String(row?.packetMeta?.objectId || `xizong:${blockId}`);
    const state = readJson(storage, `kianos-xizong-astro-v2:${objectId}`, null);
    if (!record(state)) continue;

    observedBlocks += 1;
    system.runtime_observed_blocks += 1;
    const learnedKp = Object.values(state.learned || {}).filter(Boolean).length;
    system.runtime_observed_learned_kp += learnedKp;
    const recallCounts = { rated: 0, unknown: 0, fuzzy: 0, known: 0, mastered: 0 };
    for (const rating of Object.values(state.ratings || {})) {
      const value = String(rating || '');
      if (!['unknown','fuzzy','known','mastered'].includes(value)) continue;
      recallCounts.rated += 1;
      recallCounts[value] += 1;
      recallTotals.rated += 1;
      recallTotals[value] += 1;
    }
    system.runtime_recall_rated_kp += recallCounts.rated;
    system.runtime_recall_unknown += recallCounts.unknown;
    system.runtime_recall_fuzzy += recallCounts.fuzzy;
    system.runtime_recall_known += recallCounts.known;
    system.runtime_recall_mastered += recallCounts.mastered;

    if (state.completed === true) {
      completedBlockIds.push(blockId);
      completedBlockRows.push({
        system_id: systemId,
        canonical_id: canonicalId,
        block_id: blockId,
        route_key: routeKey || null,
        kp_count: kpRows.length,
        logic_group_count: logicGroupCount,
        learned_kp_count: learnedKp,
        recall_counts: recallCounts,
        block_recall_done: state.blockRecallDone === true,
        block_recall_completed_at: String(state.blockRecallCompletedAt || '') || null,
        completed_at: String(state.completedAt || '') || null,
        study_day: studyDayFromIso(state.completedAt),
        timer_minutes_to_completion: routeKey && state.completedAt
          ? timerMinutesForDetail(storage, routeKey, { endAt: state.completedAt })
          : null
      });
      system.runtime_completed_blocks += 1;
      continue;
    }

    system.runtime_started_incomplete_blocks += 1;
    startedIncomplete.push({
      system_id: systemId,
      canonical_id: canonicalId,
      block_id: blockId,
      route_key: routeKey || null,
      kp_count: kpRows.length,
      learned_kp_count: learnedKp,
      recall_counts: recallCounts,
      current_stage: String(state.stage || ''),
      group_index: Number.isInteger(Number(state.groupIndex)) ? Number(state.groupIndex) : null,
      kp_index: Number.isInteger(Number(state.kpIndex)) ? Number(state.kpIndex) : null,
      block_recall_done: state.blockRecallDone === true,
      timer_minutes_recorded: routeKey ? timerMinutesForDetail(storage, routeKey) : null
    });
  }

  const systemRows = [...systems.values()].sort((a,b) =>
    String(a.canonical_id).localeCompare(String(b.canonical_id), undefined, { numeric: true })
  );
  const canonicalBlocks = packetIndex.length;
  const canonicalKp = packetIndex.reduce((sum,row)=>sum+(Array.isArray(row?.kpRows)?row.kpRows.length:0),0);
  const canonicalLogicGroups = packetIndex.reduce((sum, row) => {
    const groups = new Set((Array.isArray(row?.kpRows) ? row.kpRows : [])
      .map((kp) => String(kp?.groupId || ''))
      .filter(Boolean));
    return sum + groups.size;
  }, 0);
  const holdoutYears = readJson(storage, 'kianos:xizong:full-paper-holdout-years:v1', []) || [];
  const practiceEvidence = summarizeXizongForecastPractice(storage, { holdoutYears, now, questionScope });
  const repairEvidence = summarizeXizongForecastRepairs(storage);
  const memory = normalizeXizongMemoryState(readJson(storage, XIZONG_MEMORY_STORAGE_KEY, null));
  const memoryEvidence = {
    schema: 'kianos.xizong.memory-forecast-evidence.v1',
    total: memorySummary(memory, now),
    core: memoryFamilySummary(memory, 'CORE', now),
    precision: memoryFamilySummary(memory, 'PRECISION', now),
    evidence_boundary:
      'Memory contains selectively admitted future-review objects only. Absence from Memory does not prove stability or weakness.'
  };
  const questionWorkload = reconcileForecastQuestionScope(questionScope, practiceEvidence, holdoutYears);
  const systemRecallEvidence = summarizeXizongSystemRecallForecast(storage, systemRows);
  const formalScoreEvidence = summarizeXizongFormalScoreEvidence(storage);

  const progress = {
    schema: 'kianos.xizong.forecast-progress.v1',
    forecast_role: 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY',
    gate_workload_authority: false,
    canonical_scope: {
      systems: systemRows.length,
      blocks: canonicalBlocks,
      canonical_kp: canonicalKp,
      logic_groups: canonicalLogicGroups,
      block_weights: packetIndex.map((row) => ({
        system_id: String(row.systemId || ''),
        canonical_id: String(row.packetMeta?.canonicalId || ''),
        block_id: String(row.blockId || row.packetMeta?.blockId || ''),
        route_key: String(row.routeKey || (row?.slug ? `${row.systemId}/${row.slug}` : '')),
        kp_count: Array.isArray(row.kpRows) ? row.kpRows.length : 0,
        logic_group_count: new Set((Array.isArray(row?.kpRows) ? row.kpRows : [])
          .map((kp) => String(kp?.groupId || ''))
          .filter(Boolean)).size
      }))
    },
    runtime_evidence: {
      observed_blocks: observedBlocks,
      completed_blocks: completedBlockIds.length,
      started_incomplete_blocks: startedIncomplete.length,
      no_runtime_evidence_blocks: Math.max(0, canonicalBlocks - observedBlocks),
      completed_block_ids: completedBlockIds.sort(),
      completed_blocks_detail: completedBlockRows.sort((a, b) =>
        String(a.completed_at || '').localeCompare(String(b.completed_at || ''))
      ),
      started_incomplete: startedIncomplete,
      recall: recallTotals
    },
    practice_evidence: practiceEvidence,
    memory_evidence: memoryEvidence,
    repair_evidence: repairEvidence,
    question_workload: questionWorkload,
    system_recall_evidence: systemRecallEvidence,
    formal_score_evidence: formalScoreEvidence,
    observation_day: day,
    systems: systemRows,
    evidence_boundary:
      'Factual KianOS runtime progress only. NO_RUNTIME_EVIDENCE does not prove unstudied; learned_kp is not mastery; Gate workload still requires subject-owned reconciliation into exam.subject-demand.v1.'
  };
  progress.workload_forecast = buildXizongWorkloadForecast(progress);
  return progress;
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
