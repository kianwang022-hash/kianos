export const XIZONG_MEMORY_SCHEMA = 'kianos.xizong.memory.v1';
export const XIZONG_MEMORY_STORAGE_KEY = 'kianos-xizong-memory-v1';
export const MEMORY_FAMILIES = Object.freeze(['CORE', 'PRECISION']);
export const MEMORY_RATINGS = Object.freeze(['unknown', 'fuzzy', 'known', 'mastered']);

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
  ].slice(-3000);
  const attention = { ...state.attention };
  const current = { ...(attention[cardId] || {}) };
  if (rating === 'unknown' || rating === 'fuzzy') {
    current.reviewRequested = true;
    current.reason = current.reason || 'UNSTABLE_MEMORY_EVIDENCE';
  } else if (rating === 'mastered') {
    current.reviewRequested = false;
    current.reason = '';
  }
  current.updatedAt = stamp;
  attention[cardId] = current;
  return { ...state, evidence, attention };
}

const EVIDENCE_SCORE = Object.freeze({ unknown: 4, fuzzy: 2.2, known: -1.1, mastered: -3 });

export function weakWeightForCard(stateInput, cardId) {
  const state = normalizeXizongMemoryState(stateInput);
  const id = text(cardId);
  const events = state.evidence.filter((row) => row?.cardId === id).slice(-8);
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

export function isWeakMemoryCard(stateInput, cardId) {
  return weakWeightForCard(stateInput, cardId) >= 1;
}

export function releasedMemoryCards(stateInput, family = null) {
  const state = normalizeXizongMemoryState(stateInput);
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

export function todayMemoryQueue(stateInput) {
  const state = normalizeXizongMemoryState(stateInput);
  return releasedMemoryCards(state)
    .map((card) => ({
      ...card,
      weakWeight: weakWeightForCard(state, card.id),
      reviewRequested: state.attention?.[card.id]?.reviewRequested === true
    }))
    .filter((card) => card.reviewRequested || card.weakWeight >= 1)
    .sort((a, b) => {
      if (b.weakWeight !== a.weakWeight) return b.weakWeight - a.weakWeight;
      if (a.family !== b.family) return a.family === 'PRECISION' ? -1 : 1;
      return text(a.id).localeCompare(text(b.id));
    });
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

export function selectMemoryView(stateInput, view) {
  const state = normalizeXizongMemoryState(stateInput);
  const name = text(view).toUpperCase();
  if (name === 'TODAY') return { kind: 'CARDS', items: todayMemoryQueue(state) };
  if (name === 'CORE') return { kind: 'CARDS', items: releasedMemoryCards(state, 'CORE').map((card) => ({ ...card, weakWeight: weakWeightForCard(state, card.id) })) };
  if (name === 'PRECISION') return { kind: 'CARDS', items: releasedMemoryCards(state, 'PRECISION').map((card) => ({ ...card, weakWeight: weakWeightForCard(state, card.id) })) };
  if (name === 'MARKED') return { kind: 'MARKS', items: markedFragments(state) };
  if (name === 'REPAIR') return { kind: 'REPAIR', items: activeRepairTasks(state) };
  fail('VIEW_UNKNOWN', name);
}

export function memorySummary(stateInput) {
  const state = normalizeXizongMemoryState(stateInput);
  const cards = releasedMemoryCards(state);
  const core = cards.filter((card) => card.family === 'CORE').length;
  const precision = cards.filter((card) => card.family === 'PRECISION').length;
  return {
    releasedBlocks: Object.keys(state.releasedBlocks).length,
    core,
    precision,
    marked: Object.keys(state.marks).length,
    weak: cards.filter((card) => isWeakMemoryCard(state, card.id)).length,
    today: todayMemoryQueue(state).length,
    repair: activeRepairTasks(state).length
  };
}

export function cloneMemoryState(stateInput) {
  return clone(normalizeXizongMemoryState(stateInput));
}
