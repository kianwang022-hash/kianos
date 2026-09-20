export const XIZONG_MEMORY_SCHEMA = 'kianos.xizong.memory.v1';
export const XIZONG_MEMORY_STORAGE_KEY = 'kianos-xizong-memory-v1';
export const MEMORY_FAMILIES = Object.freeze(['CORE', 'PRECISION']);
export const MEMORY_RATINGS = Object.freeze(['unknown', 'fuzzy', 'known', 'mastered']);
export const XIZONG_KNOWN_RECHECK_DAYS = 1;
export const XIZONG_RETENTION_WINDOWS_DAYS = Object.freeze([2, 4, 7, 14]);

const DAY_MS = 86400000;
const WEAK_RATINGS = new Set(['unknown', 'fuzzy']);
const STABLE_RATINGS = new Set(['mastered']);

function text(value) {
  return String(value || '');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso(value) {
  if (value) return new Date(value).toISOString();
  return new Date().toISOString();
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_MEMORY_${code}${detail ? `:${detail}` : ''}`);
}

export function createXizongMemoryState() {
  return {
    schema: XIZONG_MEMORY_SCHEMA,
    revision: 1,
    releasedBlocks: {},
    cards: {},
    promptOverrides: {},
    marks: {},
    evidence: [],
    attention: {},
    repairTasks: []
  };
}

export function normalizeXizongMemoryState(raw) {
  const base = createXizongMemoryState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  if (raw.schema && raw.schema !== XIZONG_MEMORY_SCHEMA) return base;
  return {
    ...base,
    ...raw,
    schema: XIZONG_MEMORY_SCHEMA,
    revision: 1,
    releasedBlocks: raw.releasedBlocks && typeof raw.releasedBlocks === 'object' ? { ...raw.releasedBlocks } : {},
    cards: raw.cards && typeof raw.cards === 'object' ? { ...raw.cards } : {},
    promptOverrides: raw.promptOverrides && typeof raw.promptOverrides === 'object' ? { ...raw.promptOverrides } : {},
    marks: raw.marks && typeof raw.marks === 'object' ? { ...raw.marks } : {},
    evidence: Array.isArray(raw.evidence) ? [...raw.evidence] : [],
    attention: raw.attention && typeof raw.attention === 'object' ? { ...raw.attention } : {},
    repairTasks: Array.isArray(raw.repairTasks) ? [...raw.repairTasks] : []
  };
}

function normalizeCard(card, family, blockId, sourceHash) {
  const id = text(card?.id);
  if (!id) fail('CARD_ID_MISSING', `${blockId}:${family}`);
  if (family === 'CORE' && !id.startsWith('core:')) fail('CORE_CARD_ID_INVALID', id);
  if (family === 'PRECISION' && !id.startsWith('precision:')) fail('PRECISION_CARD_ID_INVALID', id);
  return {
    ...card,
    id,
    family,
    blockId: text(card?.blockId || blockId),
    sourceHash: text(card?.sourceHash || sourceHash),
    systemId: text(card?.systemId),
    canonicalId: text(card?.canonicalId),
    blockLabel: text(card?.blockLabel),
    blockTitle: text(card?.blockTitle),
    logicGroupId: text(card?.logicGroupId),
    groupLabel: text(card?.groupLabel),
    kpId: text(card?.kpId),
    displayId: text(card?.displayId),
    title: text(card?.title),
    promptCanonical: text(card?.promptCanonical),
    coreHtml: text(card?.coreHtml),
    cue: text(card?.cue),
    answerHtml: text(card?.answerHtml),
    ownerContextHtml: text(card?.ownerContextHtml),
    sourceLocator: text(card?.sourceLocator),
    answerResolution: text(card?.answerResolution || (card?.answerHtml ? 'EXACT_CURRENT_OWNER' : 'OWNER_CONTEXT_ONLY'))
  };
}

function validateDescriptor(descriptor) {
  const blockId = text(descriptor?.blockId);
  if (!blockId) fail('RELEASE_BLOCK_ID_MISSING');
  const coreCards = Array.isArray(descriptor?.coreCards) ? descriptor.coreCards : [];
  const precisionCards = Array.isArray(descriptor?.precisionCards) ? descriptor.precisionCards : [];
  const ids = [
    ...coreCards.map((card) => text(card?.id)),
    ...precisionCards.map((card) => text(card?.id))
  ];
  if (ids.some((id) => !id)) fail('RELEASE_CARD_ID_MISSING', blockId);
  if (new Set(ids).size !== ids.length) fail('RELEASE_CARD_DUPLICATE', blockId);
  return { blockId, coreCards, precisionCards };
}

export function releaseBlockMemory(stateInput, descriptor, releasedAt = null) {
  const state = normalizeXizongMemoryState(stateInput);
  const { blockId, coreCards, precisionCards } = validateDescriptor(descriptor);
  const stamp = nowIso(releasedAt);
  const sourceHash = text(descriptor?.sourceHash);
  const cards = { ...state.cards };
  const coreIds = [];
  const precisionIds = [];

  for (const raw of coreCards) {
    const card = normalizeCard(raw, 'CORE', blockId, sourceHash);
    const previous = cards[card.id];
    cards[card.id] = {
      ...(previous || {}),
      ...card,
      releasedAt: previous?.releasedAt || stamp,
      contentChangedAt: previous?.sourceHash && previous.sourceHash !== card.sourceHash ? stamp : previous?.contentChangedAt || null
    };
    coreIds.push(card.id);
  }
  for (const raw of precisionCards) {
    const card = normalizeCard(raw, 'PRECISION', blockId, sourceHash);
    const previous = cards[card.id];
    cards[card.id] = {
      ...(previous || {}),
      ...card,
      releasedAt: previous?.releasedAt || stamp,
      contentChangedAt: previous?.sourceHash && previous.sourceHash !== card.sourceHash ? stamp : previous?.contentChangedAt || null
    };
    precisionIds.push(card.id);
  }

  const previousRelease = state.releasedBlocks[blockId] || null;
  const releasedBlocks = {
    ...state.releasedBlocks,
    [blockId]: {
      blockId,
      systemId: text(descriptor?.systemId),
      canonicalId: text(descriptor?.canonicalId),
      blockLabel: text(descriptor?.blockLabel),
      blockTitle: text(descriptor?.blockTitle),
      sourceHash,
      releasedAt: previousRelease?.releasedAt || stamp,
      refreshedAt: stamp,
      coreCardIds: coreIds,
      precisionCardIds: precisionIds
    }
  };

  // Release itself creates library availability only. It does not manufacture Today debt.
  const next = { ...state, cards, releasedBlocks };
  for (const signal of Array.isArray(descriptor?.attentionSignals) ? descriptor.attentionSignals : []) {
    if (!cards[signal?.cardId]) continue;
    next.attention[signal.cardId] = {
      ...(next.attention[signal.cardId] || {}),
      reviewRequested: signal.reviewRequested === true,
      reason: text(signal.reason),
      updatedAt: stamp
    };
  }
  return next;
}

export function setPersonalPrompt(stateInput, kpId, prompt) {
  const state = normalizeXizongMemoryState(stateInput);
  const id = text(kpId);
  if (!id) fail('PROMPT_KP_ID_MISSING');
  const value = text(prompt).trim();
  const promptOverrides = { ...state.promptOverrides };
  if (value) promptOverrides[id] = value;
  else delete promptOverrides[id];
  return { ...state, promptOverrides };
}

export function resolvedCorePrompt(stateInput, card) {
  const state = normalizeXizongMemoryState(stateInput);
  return text(state.promptOverrides?.[card?.kpId]) || text(card?.promptCanonical);
}

export function addMarkedFragment(stateInput, mark, createdAt = null) {
  const state = normalizeXizongMemoryState(stateInput);
  const cardId = text(mark?.cardId);
  const card = state.cards[cardId];
  if (!card || card.family !== 'CORE') fail('MARK_CARD_UNKNOWN', cardId);
  const kpId = text(mark?.kpId || card.kpId);
  if (!kpId || kpId !== card.kpId) fail('MARK_KP_MISMATCH', cardId);
  const surface = text(mark?.surface).toUpperCase();
  if (!['PROMPT', 'CORE'].includes(surface)) fail('MARK_SURFACE_INVALID', surface);
  const fragment = text(mark?.text).trim();
  if (!fragment) fail('MARK_TEXT_MISSING', cardId);
  const stamp = nowIso(createdAt);
  const id = text(mark?.id) || `mark:${kpId}:${surface.toLowerCase()}:${stamp}`;
  return {
    ...state,
    marks: {
      ...state.marks,
      [id]: {
        id,
        cardId,
        kpId,
        surface,
        text: fragment,
        createdAt: stamp,
        reviewRequested: mark?.reviewRequested === true
      }
    }
  };
}

export function removeMarkedFragment(stateInput, markId) {
  const state = normalizeXizongMemoryState(stateInput);
  const marks = { ...state.marks };
  delete marks[text(markId)];
  return { ...state, marks };
}

export function requestMemoryReview(stateInput, cardId, requested = true, reason = '') {
  const state = normalizeXizongMemoryState(stateInput);
  const id = text(cardId);
  if (!state.cards[id]) fail('ATTENTION_CARD_UNKNOWN', id);
  return {
    ...state,
    attention: {
      ...state.attention,
      [id]: {
        ...(state.attention[id] || {}),
        reviewRequested: requested === true,
        reason: text(reason),
        updatedAt: nowIso()
      }
    }
  };
}

export function appendMemoryEvidence(stateInput, event, at = null) {
  const state = normalizeXizongMemoryState(stateInput);
  const cardId = text(event?.cardId);
  if (!state.cards[cardId]) fail('EVIDENCE_CARD_UNKNOWN', cardId);
  const rating = text(event?.rating);
  if (!MEMORY_RATINGS.includes(rating)) fail('EVIDENCE_RATING_INVALID', rating);
  const stamp = nowIso(at || event?.at);
  const evidence = [
    ...state.evidence,
    {
      id: text(event?.id) || `memory:${cardId}:${stamp}:${state.evidence.length + 1}`,
      cardId,
      family: state.cards[cardId].family,
      rating,
      origin: text(event?.origin || 'MEMORY_RECALL'),
      at: stamp
    }
  ];
  const attention = { ...state.attention };
  const current = { ...(attention[cardId] || {}) };
  if (rating === 'unknown' || rating === 'fuzzy') {
    current.reviewRequested = true;
    current.reason = current.reason || 'UNSTABLE_MEMORY_EVIDENCE';
  } else if (rating === 'known' || rating === 'mastered') {
    // A successful retrieval clears immediate Today pressure.
    // "known" means recovered now, not yet durable; retention schedules the next delayed check.
    current.reviewRequested = false;
    current.reason = '';
  }
  current.updatedAt = stamp;
  attention[cardId] = current;
  return { ...state, evidence, attention };
}

const EVIDENCE_SCORE = Object.freeze({ unknown: 4, fuzzy: 2.2, known: -1.1, mastered: -3 });

function weakWeightForCardFromState(state, cardId, eventsByCard = null) {
  const id = text(cardId);
  const events = eventsByCard
    ? (eventsByCard.get(id) || []).slice(-8)
    : state.evidence.filter((row) => row?.cardId === id).slice(-8);
  let score = 0;
  events.forEach((row, index) => {
    const distance = events.length - 1 - index;
    const recencyWeight = Math.pow(0.82, distance);
    score += (EVIDENCE_SCORE[row?.rating] || 0) * recencyWeight;
  });
  if (state.attention?.[id]?.reviewRequested) score += 2;
  const card = state.cards[id];
  if (card?.contentChangedAt) score += 0.75;
  return Math.round(score * 100) / 100;
}

export function weakWeightForCard(stateInput, cardId) {
  const state = normalizeXizongMemoryState(stateInput);
  return weakWeightForCardFromState(state, cardId);
}

function retentionContext(state, now = Date.now()) {
  const rawNow = now instanceof Date ? now.getTime() : typeof now === 'number' ? now : Date.parse(String(now || ''));
  const nowMs = Number.isFinite(rawNow) ? rawNow : Date.now();
  const eventsByCard = new Map();
  for (const row of state.evidence) {
    const cardId = text(row?.cardId);
    if (!cardId) continue;
    if (!eventsByCard.has(cardId)) eventsByCard.set(cardId, []);
    eventsByCard.get(cardId).push(row);
  }
  return { nowMs, eventsByCard };
}

function eventTime(row) {
  const value = Date.parse(text(row?.at));
  return Number.isFinite(value) ? value : null;
}

function qualifiedStableClock(events, contentChangedAt = null) {
  const tail = [];
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const row = events[index];
    if (!STABLE_RATINGS.has(text(row?.rating))) break;
    tail.unshift(row);
  }

  let stage = 0;
  let anchorAt = null;
  for (const row of tail) {
    const at = eventTime(row);
    if (at === null) continue;
    if (Number.isFinite(contentChangedAt) && at < contentChangedAt) continue;

    if (stage === 0) {
      stage = 1;
      anchorAt = at;
      continue;
    }

    const priorIntervalDays = XIZONG_RETENTION_WINDOWS_DAYS[
      Math.min(stage - 1, XIZONG_RETENTION_WINDOWS_DAYS.length - 1)
    ];
    const qualifiesAt = anchorAt + priorIntervalDays * DAY_MS;
    if (at < qualifiesAt) continue;

    stage += 1;
    anchorAt = at;
  }

  return { stage, anchorAt };
}

function retentionStateFromContext(state, cardId, context) {
  const id = text(cardId);
  const card = state.cards[id];
  if (!card) fail('RETENTION_CARD_UNKNOWN', id);

  const events = context.eventsByCard.get(id) || [];
  const attention = state.attention?.[id] || {};
  const reviewRequested = attention.reviewRequested === true;
  const latest = events.at(-1) || null;
  const latestAt = eventTime(latest);
  const latestRating = text(latest?.rating);
  const base = {
    admitted: reviewRequested || events.length > 0,
    state: 'LIBRARY_ONLY',
    due: false,
    dueReason: '',
    dueAt: null,
    overdueDays: 0,
    stabilityStage: 0,
    nextIntervalDays: null,
    latestRating,
    latestEvidenceAt: latest?.at || null
  };

  if (!events.length) {
    if (reviewRequested) {
      return { ...base, admitted: true, state: 'DUE_REQUESTED', due: true, dueReason: text(attention.reason || 'REVIEW_REQUESTED') };
    }
    return base;
  }

  if (WEAK_RATINGS.has(latestRating)) {
    return { ...base, state: 'DUE_WEAK', due: true, dueReason: 'UNSTABLE_MEMORY_EVIDENCE' };
  }

  const contentChangedAt = Date.parse(text(card.contentChangedAt));
  if (Number.isFinite(contentChangedAt) && latestAt !== null && contentChangedAt > latestAt) {
    return { ...base, state: 'DUE_CONTENT_CHANGED', due: true, dueReason: 'CONTENT_CHANGED_AFTER_LAST_EVIDENCE' };
  }

  if (reviewRequested) {
    return { ...base, state: 'DUE_REQUESTED', due: true, dueReason: text(attention.reason || 'REVIEW_REQUESTED') };
  }

  if (latestAt === null) {
    return { ...base, state: 'EVIDENCE_UNRESOLVED', due: false, dueReason: 'LATEST_EVIDENCE_UNUSABLE_FOR_RETENTION_CLOCK' };
  }

  // "known / 会了" proves retrieval now, but not durable stability.
  // Give it one delayed re-check without allowing repeated "known" ratings to inflate the long interval.
  if (latestRating === 'known') {
    const intervalDays = XIZONG_KNOWN_RECHECK_DAYS;
    const dueAtMs = latestAt + intervalDays * DAY_MS;
    const due = context.nowMs >= dueAtMs;
    return {
      ...base,
      state: due ? 'DUE_DELAYED_STABILITY' : 'KNOWN_WAIT',
      due,
      dueReason: due ? 'DELAYED_STABILITY_CHECK' : '',
      dueAt: new Date(dueAtMs).toISOString(),
      overdueDays: due ? Math.floor((context.nowMs - dueAtMs) / DAY_MS) : 0,
      stabilityStage: 0,
      nextIntervalDays: intervalDays
    };
  }

  if (!STABLE_RATINGS.has(latestRating)) {
    return { ...base, state: 'EVIDENCE_UNRESOLVED', due: false, dueReason: 'LATEST_EVIDENCE_UNUSABLE_FOR_RETENTION_CLOCK' };
  }

  const stableClock = qualifiedStableClock(
    events,
    Number.isFinite(contentChangedAt) ? contentChangedAt : null
  );
  if (stableClock.stage < 1 || stableClock.anchorAt === null) {
    return { ...base, state: 'EVIDENCE_UNRESOLVED', due: false, dueReason: 'STABILITY_CLOCK_UNPROVEN' };
  }

  const stage = stableClock.stage;
  const intervalDays = XIZONG_RETENTION_WINDOWS_DAYS[Math.min(stage - 1, XIZONG_RETENTION_WINDOWS_DAYS.length - 1)];
  const dueAtMs = stableClock.anchorAt + intervalDays * DAY_MS;
  const due = context.nowMs >= dueAtMs;

  return {
    ...base,
    state: due ? 'DUE_DELAYED_STABILITY' : 'STABLE_WAIT',
    due,
    dueReason: due ? 'DELAYED_STABILITY_CHECK' : '',
    dueAt: new Date(dueAtMs).toISOString(),
    overdueDays: due ? Math.floor((context.nowMs - dueAtMs) / DAY_MS) : 0,
    stabilityStage: stage,
    nextIntervalDays: intervalDays
  };
}

export function xizongRetentionState(stateInput, cardId, now = Date.now()) {
  const state = normalizeXizongMemoryState(stateInput);
  return retentionStateFromContext(state, cardId, retentionContext(state, now));
}

function retentionPriority(retention) {
  return ({ DUE_WEAK: 5, DUE_CONTENT_CHANGED: 4, DUE_REQUESTED: 3, DUE_DELAYED_STABILITY: 2 })[retention?.state] || 0;
}

export function isWeakMemoryCard(stateInput, cardId) {
  return weakWeightForCard(stateInput, cardId) >= 1;
}

function releasedMemoryCardsFromState(state, family = null) {
  return Object.values(state.cards)
    .filter((card) => !family || card.family === family)
    .sort((a, b) => {
      const system = text(a.canonicalId).localeCompare(text(b.canonicalId), undefined, { numeric: true });
      if (system) return system;
      const block = text(a.blockLabel).localeCompare(text(b.blockLabel), undefined, { numeric: true });
      if (block) return block;
      return text(a.displayId || a.id).localeCompare(text(b.displayId || b.id), undefined, { numeric: true });
    });
}

export function releasedMemoryCards(stateInput, family = null) {
  const state = normalizeXizongMemoryState(stateInput);
  return releasedMemoryCardsFromState(state, family);
}

function todayMemoryQueueFromState(state, { now = Date.now(), maxItems = null } = {}, context = null) {
  const retentionCtx = context || retentionContext(state, now);
  let rows = releasedMemoryCardsFromState(state)
    .map((card) => {
      const retention = retentionStateFromContext(state, card.id, retentionCtx);
      return {
        ...card,
        weakWeight: weakWeightForCardFromState(state, card.id, retentionCtx.eventsByCard),
        reviewRequested: state.attention?.[card.id]?.reviewRequested === true,
        retentionState: retention.state,
        dueReason: retention.dueReason,
        dueAt: retention.dueAt,
        overdueDays: retention.overdueDays,
        stabilityStage: retention.stabilityStage,
        nextIntervalDays: retention.nextIntervalDays
      };
    })
    .filter((card) => card.reviewRequested || ['DUE_WEAK', 'DUE_CONTENT_CHANGED', 'DUE_REQUESTED', 'DUE_DELAYED_STABILITY'].includes(card.retentionState))
    .sort((a, b) => {
      const retentionDelta = retentionPriority({ state: b.retentionState }) - retentionPriority({ state: a.retentionState });
      if (retentionDelta) return retentionDelta;
      if (b.overdueDays !== a.overdueDays) return b.overdueDays - a.overdueDays;
      if (b.weakWeight !== a.weakWeight) return b.weakWeight - a.weakWeight;
      if (a.family !== b.family) return a.family === 'PRECISION' ? -1 : 1;
      return text(a.id).localeCompare(text(b.id));
    });
  if (Number.isFinite(maxItems) && maxItems >= 0) rows = rows.slice(0, Math.floor(maxItems));
  return rows;
}

export function todayMemoryQueue(stateInput, options = {}) {
  const state = normalizeXizongMemoryState(stateInput);
  return todayMemoryQueueFromState(state, options);
}

export function markedFragments(stateInput, { reviewRequestedOnly = false } = {}) {
  const state = normalizeXizongMemoryState(stateInput);
  return Object.values(state.marks)
    .filter((mark) => !reviewRequestedOnly || mark.reviewRequested === true)
    .sort((a, b) => text(b.createdAt).localeCompare(text(a.createdAt)));
}

export function setRepairTasks(stateInput, tasks) {
  const state = normalizeXizongMemoryState(stateInput);
  const seen = new Set();
  const normalized = (Array.isArray(tasks) ? tasks : []).map((task, index) => {
    const id = text(task?.id || task?.taskId || `repair:${index + 1}`);
    const cardId = text(task?.cardId);
    if (seen.has(id)) fail('REPAIR_TASK_DUPLICATE', id);
    seen.add(id);
    return {
      id,
      cardId: state.cards[cardId] ? cardId : '',
      kpId: text(task?.kpId || (state.cards[cardId]?.kpId)),
      blockId: text(task?.blockId || state.cards[cardId]?.blockId),
      systemId: text(task?.systemId || state.cards[cardId]?.systemId),
      title: text(task?.title),
      reason: text(task?.reason),
      action: text(task?.action),
      priority: text(task?.priority || 'normal'),
      origin: text(task?.origin || 'CHAT_OR_QUESTION_REPAIR'),
      sourceQuestionIds: [...new Set((Array.isArray(task?.sourceQuestionIds) ? task.sourceQuestionIds : []).map(text).filter(Boolean))],
      blockHref: text(task?.blockHref),
      returnHref: text(task?.returnHref),
      createdAt: text(task?.createdAt || task?.created_at),
      completedAt: text(task?.completedAt || task?.completed_at),
      status: text(task?.status || 'ACTIVE')
    };
  });
  return { ...state, repairTasks: normalized };
}

export function activeRepairTasks(stateInput) {
  const state = normalizeXizongMemoryState(stateInput);
  return state.repairTasks.filter((task) => task?.status !== 'DONE');
}

export function completeRepairTask(stateInput, taskId, completedAt = null) {
  const state = normalizeXizongMemoryState(stateInput);
  const id = text(taskId);
  let found = false;
  const stamp = nowIso(completedAt);
  const repairTasks = state.repairTasks.map((task) => {
    if (task?.id !== id) return task;
    found = true;
    return { ...task, status: 'DONE', completedAt: stamp };
  });
  if (!found) fail('REPAIR_TASK_UNKNOWN', id);
  return { ...state, repairTasks };
}

export function selectMemoryView(stateInput, view, options = {}) {
  const state = normalizeXizongMemoryState(stateInput);
  const name = text(view).toUpperCase();
  if (name === 'TODAY') return { kind: 'CARDS', items: todayMemoryQueueFromState(state, options) };
  if (name === 'CORE' || name === 'PRECISION') {
    const context = retentionContext(state, options?.now);
    const family = name === 'CORE' ? 'CORE' : 'PRECISION';
    return {
      kind: 'CARDS',
      items: releasedMemoryCardsFromState(state, family).map((card) => ({
        ...card,
        weakWeight: weakWeightForCardFromState(state, card.id, context.eventsByCard)
      }))
    };
  }
  if (name === 'MARKED') return { kind: 'MARKS', items: markedFragments(state) };
  if (name === 'REPAIR') return { kind: 'REPAIR', items: activeRepairTasks(state) };
  fail('VIEW_UNKNOWN', name);
}

export function memorySummary(stateInput, now = Date.now()) {
  const state = normalizeXizongMemoryState(stateInput);
  const cards = releasedMemoryCardsFromState(state);
  const context = retentionContext(state, now);
  const retention = cards.map((card) => retentionStateFromContext(state, card.id, context));
  const today = todayMemoryQueueFromState(state, { now }, context);
  const core = cards.filter((card) => card.family === 'CORE').length;
  const precision = cards.filter((card) => card.family === 'PRECISION').length;
  return {
    releasedBlocks: Object.keys(state.releasedBlocks).length,
    core,
    precision,
    marked: Object.keys(state.marks).length,
    weak: cards.filter((card) => weakWeightForCardFromState(state, card.id, context.eventsByCard) >= 1).length,
    today: today.length,
    repair: state.repairTasks.filter((task) => task?.status !== 'DONE').length,
    admitted: retention.filter((row) => row.admitted).length,
    dueWeak: retention.filter((row) => row.state === 'DUE_WEAK').length,
    dueDelayed: retention.filter((row) => row.state === 'DUE_DELAYED_STABILITY').length,
    dueChanged: retention.filter((row) => row.state === 'DUE_CONTENT_CHANGED').length,
    dueRequested: retention.filter((row) => row.state === 'DUE_REQUESTED').length,
    stableWaiting: retention.filter((row) => row.state === 'STABLE_WAIT').length,
    libraryOnly: retention.filter((row) => row.state === 'LIBRARY_ONLY').length
  };
}

export function cloneMemoryState(stateInput) {
  return clone(normalizeXizongMemoryState(stateInput));
}
