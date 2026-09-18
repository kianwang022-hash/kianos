export const TRANSLATION_RUNTIME_VERSION = 2;
export const TRANSLATION_RETURN_SCHEMA = 'KIANOS_TRANSLATION_RETURN_V1';
export const TRANSLATION_TRANSFER_STORAGE_KEY = 'kianos-translation-transfer-v1';

const VALID_DECISIONS = new Set(['PASS', 'REPAIR_NEEDED']);
const VALID_STAGES = new Set(['attempt', 'decision', 'diagnosis', 'reconstruct', 'passed', 'repaired', 'transfer_pending']);
const VALID_FAILURE_LAYERS = new Set([
  'Lexical',
  'English Representation',
  'Relation / Information Preservation',
  'Chinese Reconstruction',
  'Execution / Self-check'
]);
const VALID_TRANSFER_RELATIONS = new Set(['support', 'contradict', 'irrelevant']);

function nowIso(now) {
  if (typeof now === 'string' && now) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
}

function isoMillis(value) {
  const ms = Date.parse(clean(value));
  return Number.isFinite(ms) ? ms : NaN;
}

function repairSignature(payload) {
  const failure = payload?.primary_failure || {};
  const target = payload?.transfer_target || {};
  return JSON.stringify({
    decision: clean(payload?.decision),
    layer: clean(failure?.layer),
    skill: clean(failure?.skill),
    affectedSegments: Array.isArray(failure?.affected_segments) ? failure.affected_segments.map(clean) : [],
    minimalRepair: clean(failure?.minimal_repair),
    reconstructionPrompt: clean(failure?.reconstruction_prompt),
    transferAdmit: target?.admit === true,
    transferId: clean(target?.target_id),
    transferLabel: clean(target?.label),
    transferLayer: clean(target?.layer),
    transferSkill: clean(target?.skill),
    transferDemand: clean(target?.underlying_demand)
  });
}

function freshTransferClosureEligible(target, context = {}) {
  // No local history is not proof of freshness or unassisted performance.
  if (!['fresh','unseen'].includes(context.contextNovelty) || context.assistance !== 'unassisted' || context.sameDemand !== true) return false;
  const historyCount = Number(context.taskHistoryCount);
  if (!Number.isFinite(historyCount) || historyCount !== 0) return false;
  const attemptAt = isoMillis(context.attemptFirstSubmittedAt);
  const targetCreatedAt = isoMillis(target?.createdAt);
  if (!Number.isFinite(attemptAt) || !Number.isFinite(targetCreatedAt)) return false;
  return attemptAt > targetCreatedAt;
}

export function translationPromptIds(prompts = []) {
  return prompts.map((prompt) => clean(prompt?.id)).filter(Boolean);
}

export function blankTranslationState(prompts = [], history = []) {
  const drafts = {};
  const reconstructDrafts = {};
  for (const id of translationPromptIds(prompts)) {
    drafts[id] = '';
    reconstructDrafts[id] = '';
  }
  return {
    version: TRANSLATION_RUNTIME_VERSION,
    stage: 'attempt',
    drafts,
    firstAttempts: {},
    firstSubmittedAt: '',
    decision: '',
    chatReturn: null,
    affectedSegments: [],
    reconstructDrafts,
    reconstructions: [],
    pendingTransferCandidate: null,
    referenceRevealed: false,
    completeReferenceOpen: false,
    history: Array.isArray(history) ? history : []
  };
}

export function normalizeTranslationState(prompts = [], saved = null) {
  const ids = translationPromptIds(prompts);
  if (!saved || Number(saved?.version) !== TRANSLATION_RUNTIME_VERSION) {
    const history = Array.isArray(saved?.history) ? [...saved.history] : [];
    if (saved?.firstAttempt) {
      history.push({
        legacy: true,
        firstAttempt: String(saved.firstAttempt),
        firstSubmittedAt: String(saved.firstSubmittedAt || ''),
        reconstructions: Array.isArray(saved.reconstructions) ? saved.reconstructions : [],
        archivedAt: nowIso()
      });
    }
    const state = blankTranslationState(prompts, history);
    if (ids.length && clean(saved?.draft)) state.drafts[ids[0]] = String(saved.draft);
    return state;
  }

  const state = {
    ...blankTranslationState(prompts, saved?.history || []),
    ...saved,
    drafts: { ...(saved?.drafts || {}) },
    firstAttempts: { ...(saved?.firstAttempts || {}) },
    reconstructDrafts: { ...(saved?.reconstructDrafts || {}) },
    reconstructions: Array.isArray(saved?.reconstructions) ? saved.reconstructions : [],
    affectedSegments: Array.isArray(saved?.affectedSegments) ? saved.affectedSegments : [],
    history: Array.isArray(saved?.history) ? saved.history : []
  };
  for (const id of ids) {
    if (!(id in state.drafts)) state.drafts[id] = '';
    if (!(id in state.reconstructDrafts)) state.reconstructDrafts[id] = '';
  }
  const hasFirst = ids.length > 0 && ids.every((id) => clean(state.firstAttempts?.[id]));
  if (!hasFirst) {
    state.stage = 'attempt';
    state.firstAttempts = {};
    state.firstSubmittedAt = '';
    state.decision = '';
    state.chatReturn = null;
    state.affectedSegments = [];
    state.pendingTransferCandidate = null;
  } else if (!VALID_STAGES.has(state.stage)) {
    state.stage = 'decision';
    state.decision = '';
    state.chatReturn = null;
    state.affectedSegments = [];
    state.pendingTransferCandidate = null;
    state.referenceRevealed = false;
    state.completeReferenceOpen = false;
  }
  return state;
}

export function wholeAttemptMissing(prompts = [], drafts = {}) {
  return translationPromptIds(prompts).filter((id) => !clean(drafts?.[id]));
}

export function freezeWholeAttempt(state, prompts = [], now) {
  if (state?.firstSubmittedAt && Object.keys(state?.firstAttempts || {}).length) return { ok: true, missing: [], state: structuredClone(state) };
  if (state?.stage !== 'attempt') throw new Error('TRANSLATION_FREEZE_INVALID_STAGE');
  const missing = wholeAttemptMissing(prompts, state?.drafts || {});
  if (missing.length) return { ok: false, missing, state };
  const next = structuredClone(state);
  next.firstAttempts = {};
  for (const id of translationPromptIds(prompts)) next.firstAttempts[id] = clean(next.drafts[id]);
  next.firstSubmittedAt = nowIso(now);
  next.stage = 'decision';
  next.decision = '';
  next.referenceRevealed = false;
  return { ok: true, missing: [], state: next };
}

export function passCleanAttempt(state, now) {
  if (!state?.firstSubmittedAt || !Object.keys(state?.firstAttempts || {}).length || state.stage === 'attempt') throw new Error('TRANSLATION_PASS_REQUIRES_FIRST_ATTEMPT');
  const next = structuredClone(state);
  next.stage = 'passed';
  next.decision = 'PASS';
  next.passedAt = nowIso(now);
  next.pendingTransferCandidate = null;
  next.affectedSegments = [];
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;
  return next;
}

export function routeAttemptToReview(state) {
  const next = structuredClone(state);
  next.stage = 'diagnosis';
  next.decision = 'REPAIR_NEEDED';
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;
  return next;
}

export function blankTransferLedger() {
  return { version: 1, targets: [] };
}

export function normalizeTransferLedger(saved = null) {
  if (!saved || Number(saved?.version) !== 1 || !Array.isArray(saved?.targets)) return blankTransferLedger();
  return {
    version: 1,
    targets: saved.targets.map((target) => ({
      ...target,
      status: target?.status === 'closed' ? 'closed' : 'pending',
      evidence: Array.isArray(target?.evidence)
        ? target.evidence.map((item) => ({ ...item }))
        : []
    }))
  };
}

export function pendingTransferTargets(ledger) {
  return normalizeTransferLedger(ledger).targets.filter((target) => target.status === 'pending');
}

function parsePacketJson(text) {
  const raw = clean(text);
  if (!raw) throw new Error('RETURN_PACKET_EMPTY');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('RETURN_PACKET_JSON_MISSING');
  return JSON.parse(raw.slice(start, end + 1));
}

export function parseTranslationReturn(text, expectedTaskId = '') {
  const raw = clean(text);
  if (!raw.includes(TRANSLATION_RETURN_SCHEMA)) throw new Error('RETURN_PACKET_SCHEMA_MISSING');
  const payload = parsePacketJson(raw);
  if (payload?.schema !== TRANSLATION_RETURN_SCHEMA) throw new Error('RETURN_PACKET_SCHEMA_INVALID');
  const task = clean(payload?.task);
  if (expectedTaskId && task !== clean(expectedTaskId)) throw new Error(`RETURN_PACKET_TASK_MISMATCH:${task || 'missing'}`);
  if (!VALID_DECISIONS.has(payload?.decision)) throw new Error('RETURN_PACKET_DECISION_INVALID');
  if (payload.decision === 'REPAIR_NEEDED') {
    const failure = payload?.primary_failure;
    if (!failure || !VALID_FAILURE_LAYERS.has(clean(failure.layer)) || !clean(failure.minimal_repair)) {
      throw new Error('RETURN_PACKET_PRIMARY_FAILURE_INCOMPLETE');
    }
    const affectedSegments = Array.isArray(failure.affected_segments)
      ? failure.affected_segments.map(clean).filter(Boolean)
      : [];
    if (!affectedSegments.length) throw new Error('RETURN_PACKET_AFFECTED_SEGMENTS_MISSING');
    const candidate = payload?.transfer_target;
    if (candidate?.admit === true && (!clean(candidate.target_id) || !clean(candidate.label) || !clean(candidate.underlying_demand))) {
      throw new Error('RETURN_PACKET_TRANSFER_TARGET_INCOMPLETE');
    }
    if (clean(failure.layer) === 'Lexical' && candidate?.admit === true) {
      throw new Error('RETURN_PACKET_TRANSFER_TARGET_LEXICAL_OWNER');
    }
  }
  const updates = Array.isArray(payload?.transfer_updates) ? payload.transfer_updates : [];
  const seenUpdateTargets = new Set();
  for (const update of updates) {
    const targetId = clean(update?.target_id);
    if (!targetId || !VALID_TRANSFER_RELATIONS.has(update?.relation)) {
      throw new Error('RETURN_PACKET_TRANSFER_UPDATE_INVALID');
    }
    if (seenUpdateTargets.has(targetId)) {
      throw new Error(`RETURN_PACKET_TRANSFER_UPDATE_DUPLICATE:${targetId}`);
    }
    seenUpdateTargets.add(targetId);
    if (update?.close === true && update.relation !== 'support') {
      throw new Error('RETURN_PACKET_TRANSFER_CLOSE_INVALID');
    }
  }
  return payload;
}

export function applyTransferUpdates(ledger, updates = [], context = {}) {
  const next = normalizeTransferLedger(ledger);
  const task = clean(context.task);
  for (const update of updates) {
    const targetId = clean(update?.target_id);
    const target = next.targets.find((item) => item.id === targetId);
    if (!target) throw new Error(`RETURN_PACKET_TRANSFER_TARGET_UNKNOWN:${targetId || 'missing'}`);
    const relation = update.relation;
    if (!VALID_TRANSFER_RELATIONS.has(relation)) continue;
    if (!task || task === clean(target.sourceTask) || task === clean(target.lastSourceTask)) continue;

    const freshForClosure = freshTransferClosureEligible(target, context);
    if (update?.close === true && !freshForClosure) {
      throw new Error(`RETURN_PACKET_TRANSFER_CLOSE_REQUIRES_FRESH_TASK:${targetId}`);
    }

    const evidence = {
      task,
      relation,
      note: clean(update.note),
      close: relation === 'support' && update.close === true,
      freshForClosure,
      firstSubmittedAt: clean(context.attemptFirstSubmittedAt),
      taskHistoryCount: Number.isFinite(Number(context.taskHistoryCount)) ? Number(context.taskHistoryCount) : null,
      at: nowIso(context.now)
    };
    const priorIndex = target.evidence.findIndex((item) => clean(item?.task) === task);
    if (priorIndex >= 0) target.evidence[priorIndex] = evidence;
    else target.evidence.push(evidence);

    if (relation === 'support' && update.close === true) {
      target.status = 'closed';
      target.closedAt = nowIso(context.now);
      target.closedByTask = task;
    } else if (relation === 'contradict' || clean(target.closedByTask) === task) {
      target.status = 'pending';
      delete target.closedAt;
      delete target.closedByTask;
    }
  }
  return next;
}

function normalizedAffectedSegments(payload, prompts) {
  const ids = translationPromptIds(prompts);
  const valid = new Set(ids);
  const supplied = Array.isArray(payload?.primary_failure?.affected_segments)
    ? payload.primary_failure.affected_segments.map(clean).filter(Boolean)
    : [];
  if (!supplied.length) throw new Error('RETURN_PACKET_AFFECTED_SEGMENTS_MISSING');
  const invalid = supplied.filter((id) => !valid.has(id));
  if (invalid.length) throw new Error(`RETURN_PACKET_AFFECTED_SEGMENT_INVALID:${invalid.join('|')}`);
  return [...new Set(supplied)];
}

export function applyTranslationReturn(state, payload, prompts = [], ledger = null, context = {}) {
  const affectedSegments = payload?.decision === 'REPAIR_NEEDED'
    ? normalizedAffectedSegments(payload, prompts)
    : [];
  const evidenceContext = {
    ...context,
    taskHistoryCount: context.taskHistoryCount ?? (Array.isArray(state?.history) ? state.history.length : 0),
    attemptFirstSubmittedAt: context.attemptFirstSubmittedAt || clean(state?.firstSubmittedAt)
  };
  const nextLedger = applyTransferUpdates(ledger, payload?.transfer_updates || [], evidenceContext);
  const next = structuredClone(state);
  const previousRepairSignature = repairSignature(next.chatReturn);
  next.chatReturn = payload;
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;

  if (payload.decision === 'PASS') {
    next.stage = 'passed';
    next.decision = 'PASS';
    next.passedAt = nowIso(context.now);
    next.pendingTransferCandidate = null;
    next.affectedSegments = [];
    return { state: next, ledger: nextLedger };
  }

  next.stage = 'reconstruct';
  next.decision = 'REPAIR_NEEDED';
  next.affectedSegments = affectedSegments;
  next.pendingTransferCandidate = payload?.transfer_target?.admit === true ? payload.transfer_target : null;
  const repairChanged = previousRepairSignature !== repairSignature(payload);
  for (const id of next.affectedSegments) {
    if (!(id in next.reconstructDrafts) || repairChanged) next.reconstructDrafts[id] = '';
  }
  return { state: next, ledger: nextLedger };
}

export function reconstructionMissing(state) {
  return (state?.affectedSegments || []).filter((id) => !clean(state?.reconstructDrafts?.[id]));
}

export function admitTransferTarget(ledger, candidate, context = {}) {
  const next = normalizeTransferLedger(ledger);
  if (!candidate || candidate.admit !== true) return next;
  const id = clean(candidate.target_id);
  const label = clean(candidate.label);
  const demand = clean(candidate.underlying_demand);
  if (!id || !label || !demand) return next;
  const existing = next.targets.find((item) => item.id === id);
  if (existing) {
    existing.status = 'pending';
    existing.label = label;
    existing.layer = clean(candidate.layer || existing.layer);
    existing.skill = clean(candidate.skill || existing.skill);
    existing.underlyingDemand = demand;
    existing.lastSourceTask = clean(context.task || existing.lastSourceTask);
    delete existing.closedAt;
    delete existing.closedByTask;
    return next;
  }
  next.targets.push({
    id,
    label,
    layer: clean(candidate.layer),
    skill: clean(candidate.skill),
    underlyingDemand: demand,
    status: 'pending',
    sourceTask: clean(context.task),
    lastSourceTask: clean(context.task),
    createdAt: nowIso(context.now),
    evidence: []
  });
  return next;
}

export function saveReconstruction(state, ledger = null, context = {}) {
  const missing = reconstructionMissing(state);
  if (missing.length) return { ok: false, missing, state, ledger: normalizeTransferLedger(ledger) };
  const next = structuredClone(state);
  const answers = {};
  for (const id of next.affectedSegments) answers[id] = clean(next.reconstructDrafts[id]);
  next.reconstructions.push({ answers, createdAt: nowIso(context.now) });
  next.reconstructDrafts = { ...next.reconstructDrafts };
  for (const id of next.affectedSegments) next.reconstructDrafts[id] = '';
  const candidateId = clean(next.pendingTransferCandidate?.target_id);
  const nextLedger = admitTransferTarget(ledger, next.pendingTransferCandidate, context);
  const admitted = Boolean(candidateId && pendingTransferTargets(nextLedger).some((target) => target.id === candidateId));
  next.stage = admitted ? 'transfer_pending' : 'repaired';
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;
  return { ok: true, missing: [], state: next, ledger: nextLedger };
}

export function archiveTranslationAttempt(state, now) {
  if (!state?.firstSubmittedAt) return null;
  return {
    firstAttempts: { ...(state.firstAttempts || {}) },
    firstSubmittedAt: state.firstSubmittedAt,
    decision: state.decision || '',
    chatReturn: state.chatReturn || null,
    reconstructions: Array.isArray(state.reconstructions) ? state.reconstructions : [],
    archivedAt: nowIso(now)
  };
}
