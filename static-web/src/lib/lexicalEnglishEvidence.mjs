const TASK_SOURCE = new Map([
  ['reading_a', 'reading'],
  ['reading_b', 'reading'],
  ['cloze', 'cloze'],
  ['translation', 'translation'],
  ['writing', 'writing']
]);

const OUTCOMES = new Set(['WRONG', 'AGAIN', 'SLOW', 'CORRECT']);
const DEMANDS = new Set(['recognition', 'discrimination', 'production']);
const ASSISTANCE = new Set(['unassisted', 'assisted']);
const NOVELTY = new Set(['unseen', 'fresh', 'repeated']);

const clean = (value) => String(value ?? '').trim();
const validIso = (value) => {
  const text = clean(value);
  return text && Number.isFinite(Date.parse(text)) ? text : '';
};
const eventPart = (value) => encodeURIComponent(clean(value)).slice(0, 180);

export function objectiveTaskToLexicalSource(task) {
  return TASK_SOURCE.get(clean(task)) || null;
}

export function lexicalEventFromObjectiveThread({
  task,
  objectId,
  attemptSubmittedAt,
  thread,
  threadIndex = 0
} = {}) {
  if (!thread || typeof thread !== 'object' || clean(thread.route) !== 'lexical') {
    return { status: 'IGNORED_NON_LEXICAL', event: null };
  }

  const source = objectiveTaskToLexicalSource(task);
  if (!source) return { status: 'REJECTED_UNSUPPORTED_TASK', event: null };

  const evidence = thread.lexicalEvidence;
  if (!evidence || typeof evidence !== 'object') {
    return { status: 'REJECTED_MISSING_EXACT_EVIDENCE', event: null };
  }

  const wordId = clean(evidence.word_id);
  const ordinal = Number(evidence.ordinal || 0);
  const targetKind = clean(evidence.target_kind);
  const targetId = clean(evidence.target_id) || null;
  const targetLocator = clean(evidence.target_locator) || null;
  const targetRevision = clean(evidence.target_revision) || null;
  const outcome = clean(evidence.outcome).toUpperCase();
  const observedAt = validIso(evidence.observed_at) || validIso(attemptSubmittedAt);

  if (!wordId || !Number.isInteger(ordinal) || ordinal <= 0 || !targetKind || targetKind === 'card') {
    return { status: 'REJECTED_INVALID_TARGET', event: null };
  }
  if (!targetId && !(targetLocator && targetRevision)) {
    return { status: 'REJECTED_UNRESOLVED_TARGET', event: null };
  }
  if (!OUTCOMES.has(outcome)) return { status: 'REJECTED_INVALID_OUTCOME', event: null };
  if (!observedAt) return { status: 'REJECTED_MISSING_OCCURRENCE_TIME', event: null };

  const threadId = clean(thread.threadId) || `t${Number(threadIndex) + 1}`;
  const targetIdentity = targetId || `${targetLocator}@${targetRevision}`;
  const explicitEventId = clean(evidence.event_id);
  const eventId = explicitEventId || [
    'english', eventPart(task), eventPart(objectId), eventPart(threadId),
    eventPart(wordId), eventPart(targetKind), eventPart(targetIdentity), eventPart(outcome)
  ].join(':');

  const event = {
    event_id: eventId,
    word_id: wordId,
    ordinal,
    word: clean(evidence.word) || null,
    target_kind: targetKind,
    target_id: targetId,
    target_locator: targetLocator,
    target_revision: targetId ? null : targetRevision,
    source,
    outcome,
    source_task_id: clean(evidence.source_task_id) || `${clean(task)}:${clean(objectId)}`,
    context_id: clean(evidence.context_id) || `${clean(task)}:${clean(objectId)}:${threadId}`,
    attribution: 'lexical',
    observed_at: observedAt
  };

  const demand = clean(evidence.demand);
  if (DEMANDS.has(demand)) event.demand = demand;
  const assistance = clean(evidence.assistance);
  if (ASSISTANCE.has(assistance)) event.assistance = assistance;
  const novelty = clean(evidence.context_novelty);
  if (NOVELTY.has(novelty)) event.context_novelty = novelty;
  if (typeof evidence.delayed === 'boolean') event.delayed = evidence.delayed;
  const note = clean(evidence.note) || clean(thread.repairEvidence) || clean(thread.summary);
  if (note) event.note = note.slice(0, 1600);
  const label = clean(evidence.target_label);
  if (label) event.target_label = label.slice(0, 240);

  return { status: 'READY', event };
}
