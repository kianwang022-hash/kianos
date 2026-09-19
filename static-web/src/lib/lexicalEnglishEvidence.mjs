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
  const occurrence = validIso(attemptSubmittedAt);
  if (!occurrence) return {status:'REJECTED_MISSING_ATTEMPT_IDENTITY',event:null};
  const observedAt = validIso(evidence.observed_at) || occurrence;

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
  const eventId = [
    'english', eventPart(task), eventPart(objectId), eventPart(attemptSubmittedAt), eventPart(threadId),
    eventPart(wordId), eventPart(targetKind), eventPart(targetIdentity), eventPart(outcome)
  ].join(':');

  if(explicitEventId && explicitEventId!==eventId)return {status:'REJECTED_EVENT_IDENTITY_MISMATCH',event:null};
  if(!DEMANDS.has(clean(evidence.demand)))return {status:'REJECTED_MISSING_EXACT_DEMAND',event:null};
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
    source_task_id: `${clean(task)}:${clean(objectId)}`,
    context_id: `${clean(task)}:${clean(objectId)}:${occurrence}:${threadId}`,
    attribution: 'lexical',
    observed_at: observedAt
  };

  if(evidence.source_hash)event.source_hash=clean(evidence.source_hash);
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

// Resolve against the existing Current word renderer, never a parallel vocabulary database.
export function validateCurrentLexicalTarget(event, descriptor) {
 if(descriptor?.word_id!==event.word_id || Number(descriptor.ordinal)!==Number(event.ordinal))throw new Error('LEXICAL_CURRENT_WORD_IDENTITY_MISMATCH');
 const target=(descriptor.targets||[]).find(t=>t.target_kind===event.target_kind && (event.target_id ? t.target_id===event.target_id : t.target_locator===event.target_locator));
 if(!target)throw new Error('LEXICAL_CURRENT_TARGET_NOT_FOUND');
 if(!event.target_id && event.target_revision!==descriptor.source_hash)throw new Error('LEXICAL_CURRENT_LOCATOR_REVISION_MISMATCH');
 if(event.source_hash && event.source_hash!==descriptor.source_hash)throw new Error('LEXICAL_CURRENT_SOURCE_CHANGED');
 return {...event,target_label:target.target_label||event.target_label||null};
}

export async function resolveCurrentLexicalTarget(event,{fetcher=globalThis.fetch,base='/',parseDocument=null}={}) {
 const response=await fetcher(`${base}vocabulary/${Number(event.ordinal)}/`,{headers:{Accept:'text/html'},cache:'no-store'});
 if(!response.ok)throw new Error('LEXICAL_CURRENT_OWNER_UNAVAILABLE');
 const html=await response.text();
 const doc=parseDocument?parseDocument(html):new DOMParser().parseFromString(html,'text/html');
 const root=doc.querySelector('[data-local-port="vocabulary"]');
 if(!root)throw new Error('LEXICAL_CURRENT_OWNER_MISSING');
 return validateCurrentLexicalTarget(event,{word_id:root.getAttribute('data-vocab-object'),ordinal:Number(root.getAttribute('data-vocab-ordinal')),source_hash:root.getAttribute('data-vocab-source-hash'),targets:[...root.querySelectorAll('[data-vocab-repair]')].map(n=>({target_kind:n.getAttribute('data-target-kind'),target_id:n.getAttribute('data-target-id')||null,target_locator:n.getAttribute('data-target-locator')||null,target_label:n.getAttribute('data-target-label')}))});
}
