export const TRANSLATION_RUNTIME_VERSION = 2;
export const TRANSLATION_RETURN_SCHEMA = 'KIANOS_TRANSLATION_RETURN_V1';
export const TRANSLATION_TRANSFER_STORAGE_KEY = 'kianos-translation-transfer-v1';

const VALID_DECISIONS = new Set(['PASS', 'REPAIR_NEEDED']);
const VALID_TRANSFER_RELATIONS = new Set(['support', 'contradict', 'irrelevant']);

function nowIso(now) {
  if (typeof now === 'string' && now) return now;
  if (now instanceof Date) return now.toISOString();
  return new Date().toISOString();
}

function clean(value) {
  return String(value ?? '').trim();
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
  }
  return state;
}

export function wholeAttemptMissing(prompts = [], drafts = {}) {
  return translationPromptIds(prompts).filter((id) => !clean(drafts?.[id]));
}

export function freezeWholeAttempt(state, prompts = [], now) {
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
  const next = structuredClone(state);
  next.stage = 'passed';
  next.decision = 'PASS';
  next.passedAt = nowIso(now);
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;
  return next;
}

export function routeAttemptToReview(state) {
  const next = structuredClone(state);
  next.stage = 'diagnosis';
  next.decision = 'REPAIR_NEEDED';
  next.referenceRevealed = false;
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
      evidence: Array.isArray(target?.evidence) ? target.evidence : []
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
  if (payload?.schema && payload.schema !== TRANSLATION_RETURN_SCHEMA) throw new Error('RETURN_PACKET_SCHEMA_INVALID');
  const task = clean(payload?.task);
  if (expectedTaskId && task !== clean(expectedTaskId)) throw new Error(`RETURN_PACKET_TASK_MISMATCH:${task || 'missing'}`);
  if (!VALID_DECISIONS.has(payload?.decision)) throw new Error('RETURN_PACKET_DECISION_INVALID');
  if (payload.decision === 'REPAIR_NEEDED') {
    const failure = payload?.primary_failure;
    if (!failure || !clean(failure.layer) || !clean(failure.minimal_repair)) {
      throw new Error('RETURN_PACKET_PRIMARY_FAILURE_INCOMPLETE');
    }
  }
  const updates = Array.isArray(payload?.transfer_updates) ? payload.transfer_updates : [];
  for (const update of updates) {
    if (!clean(update?.target_id) || !VALID_TRANSFER_RELATIONS.has(update?.relation)) {
      throw new Error('RETURN_PACKET_TRANSFER_UPDATE_INVALID');
    }
  }
  return payload;
}

export function applyTransferUpdates(ledger, updates = [], context = {}) {
  const next = normalizeTransferLedger(ledger);
  for (const update of updates) {
    const target = next.targets.find((item) => item.id === clean(update?.target_id));
    if (!target) continue;
    const relation = update.relation;
    if (!VALID_TRANSFER_RELATIONS.has(relation)) continue;
    target.evidence.push({
      task: clean(context.task),
      relation,
      note: clean(update.note),
      at: nowIso(context.now)
    });
    if (relation === 'support' && update.close === true) {
      target.status = 'closed';
      target.closedAt = nowIso(context.now);
    }
    if (relation === 'contradict') {
      target.status = 'pending';
      delete target.closedAt;
    }
  }
  return next;
}

function normalizedAffectedSegments(payload, prompts) {
  const valid = new Set(translationPromptIds(prompts));
  const supplied = Array.isArray(payload?.primary_failure?.affected_segments)
    ? payload.primary_failure.affected_segments.map(clean).filter((id) => valid.has(id))
    : [];
  return supplied.length ? [...new Set(supplied)] : [...valid];
}

export function applyTranslationReturn(state, payload, prompts = [], ledger = null, context = {}) {
  let nextLedger = applyTransferUpdates(ledger, payload?.transfer_updates || [], context);
  const next = structuredClone(state);
  next.chatReturn = payload;
  next.referenceRevealed = false;
  next.completeReferenceOpen = false;

  if (payload.decision === 'PASS') {
    next.stage = 'passed';
    next.decision = 'PASS';
    next.passedAt = nowIso(context.now);
    return { state: next, ledger: nextLedger };
  }

  next.stage = 'reconstruct';
  next.decision = 'REPAIR_NEEDED';
  next.affectedSegments = normalizedAffectedSegments(payload, prompts);
  next.pendingTransferCandidate = payload?.transfer_target?.admit === true ? payload.transfer_target : null;
  for (const id of next.affectedSegments) {
    if (!(id in next.reconstructDrafts)) next.reconstructDrafts[id] = '';
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
  let nextLedger = admitTransferTarget(ledger, next.pendingTransferCandidate, context);
  next.stage = next.pendingTransferCandidate?.admit === true ? 'transfer_pending' : 'repaired';
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
