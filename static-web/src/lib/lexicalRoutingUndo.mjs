import { normalizeLexicalRouting, normalizeLexicalIntake } from './lexicalSettings.mjs';

const SCHEMA = 'kianos.lexical.routing_undo.v1';
const clone = value => JSON.parse(JSON.stringify(value));
const snapshot = event => {
  if (!event) return null;
  const value = clone(event);
  // Undo history owns its own witnesses; do not recursively copy that history.
  delete value.undo_before;
  return value;
};
const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const validPrior = (value, wordId) => value === null || (value && typeof value === 'object'
  && value.word_id === wordId && typeof value.event_id === 'string' && value.event_id
  && ['UNKNOWN', 'FUZZY', 'KNOWN', 'MASTERED'].includes(value.route)
  && Number.isFinite(Date.parse(value.observed_at)));

export function appendLexicalRoutingJudgment(routingInput, eventInput, introductionBefore = null) {
  const routing = normalizeLexicalRouting(routingInput);
  const event = { ...clone(eventInput), undo_before: {
    schema: SCHEMA,
    latest: snapshot(routing.latest_by_word[eventInput.word_id]),
    introduction_day: introductionBefore
  } };
  routing.history = [...routing.history, event].slice(-300);
  routing.latest_by_word = { ...routing.latest_by_word, [event.word_id]: event };
  return routing;
}

export function undoLexicalRoutingJudgment(routingInput, intakeInput) {
  const routing = normalizeLexicalRouting(routingInput);
  const intake = normalizeLexicalIntake(intakeInput);
  const event = routing.history.at(-1);
  const blocked = reason => ({ status: 'BLOCKED', reason });
  if (!event) return { status: 'EMPTY' };
  if (routing.latest_by_word[event.word_id]?.event_id !== event.event_id) {
    return blocked('LATEST_JUDGMENT_CHANGED');
  }
  const history = routing.history.slice(0, -1);
  const previous = [...history].reverse().find(row => row.word_id === event.word_id);
  const before = event.undo_before;
  let restored;
  if (before !== undefined) {
    if (!before || before.schema !== SCHEMA || !validPrior(before.latest, event.word_id)
      || !(before.introduction_day === null || validDay(before.introduction_day))) {
      return blocked('UNDO_WITNESS_INVALID');
    }
    // Retained history carries any older Undo witness needed by the next Undo.
    restored = previous?.event_id === before.latest?.event_id ? previous : before.latest;
    if (before.introduction_day === null) delete intake.introduced[event.word_id];
    else intake.introduced[event.word_id] = before.introduction_day;
  } else {
    // Legacy history proves a prior judgment only if it is actually retained.
    // Its absence cannot prove this was the first judgment of that word.
    if (!previous) return blocked('PRIOR_JUDGMENT_UNAVAILABLE');
    restored = previous;
  }
  routing.history = history;
  if (restored) routing.latest_by_word[event.word_id] = clone(restored);
  else delete routing.latest_by_word[event.word_id];
  return { status: 'UNDONE', routing, intake, event };
}
