export const LEXICAL_LEDGER_SCHEMA = 'kianos.lexical.evidence_ledger.v2';
export const LEXICAL_LEDGER_STORAGE_KEY = 'kianos-lexical-evidence-ledger-v2';

const repairOutcomes = new Set(['ADDED', 'REACTIVATED', 'WRONG', 'AGAIN', 'SLOW', 'CORRECT', 'CLEAR']);
const englishSources = new Set(['reading', 'cloze', 'translation', 'writing']);
const questionSources = new Set(['challenge', 'reconstruction', 'blind_probe']);

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function hashString(value) {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function emptyLexicalLedger() {
  return { schema: LEXICAL_LEDGER_SCHEMA, events: [], conflicts: [], identity_lineage: {} };
}

export function normalizeLexicalLedger(value) {
  if (!value || typeof value !== 'object' || value.schema !== LEXICAL_LEDGER_SCHEMA) return emptyLexicalLedger();
  return {
    schema: LEXICAL_LEDGER_SCHEMA,
    events: Array.isArray(value.events) ? clone(value.events) : [],
    conflicts: Array.isArray(value.conflicts) ? clone(value.conflicts) : [],
    identity_lineage: value.identity_lineage && typeof value.identity_lineage === 'object' && !Array.isArray(value.identity_lineage)
      ? clone(value.identity_lineage)
      : {}
  };
}

export function lexicalTargetKey(event) {
  const wordId = String(event?.word_id || '');
  const kind = String(event?.target_kind || '');
  if (!wordId || !kind || kind === 'card') return null;
  const targetId = String(event?.target_id || '');
  if (targetId) return `${wordId}|${kind}|id:${targetId}`;
  const locator = String(event?.target_locator || '');
  const revision = String(event?.target_revision || '');
  if (locator && revision) return `${wordId}|${kind}|loc:${locator}@${revision}`;
  return null;
}

function lineageKey(wordId, kind, targetId) {
  if (!wordId || !kind || !targetId) return null;
  return `${wordId}|${kind}|id:${targetId}`;
}

export function reconcileEvidenceIdentity(ledgerInput, lineageEntries = []) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const statuses = [];
  for (const raw of Array.isArray(lineageEntries) ? lineageEntries : []) {
    const wordId = String(raw?.word_id || '');
    const kind = String(raw?.target_kind || 'sense');
    const fromTargetId = String(raw?.from_target_id || '');
    const status = String(raw?.status || '').toLowerCase();
    const toTargetId = raw?.to_target_id ? String(raw.to_target_id) : null;
    const fromKey = lineageKey(wordId, kind, fromTargetId);
    if (!fromKey || status === 'active') continue;

    let resolution;
    if (status === 'merged' && toTargetId && toTargetId !== fromTargetId) {
      resolution = {
        resolution: 'REMAP',
        source: 'current_identity_refs',
        lifecycle_status: status,
        word_id: wordId,
        target_kind: kind,
        from_target_id: fromTargetId,
        to_target_id: toTargetId,
        target_key: lineageKey(wordId, kind, toTargetId)
      };
    } else {
      resolution = {
        resolution: 'FROZEN',
        source: 'current_identity_refs',
        lifecycle_status: status || 'unknown',
        word_id: wordId,
        target_kind: kind,
        from_target_id: fromTargetId,
        to_target_id: null,
        target_key: null,
        reason: status === 'merged' ? 'MERGED_WITHOUT_VALID_SUCCESSOR' : 'NO_EXPLICIT_CURRENT_SUCCESSOR'
      };
    }

    const existing = ledger.identity_lineage[fromKey];
    if (existing && stableJson(existing) !== stableJson(resolution)) {
      ledger.identity_lineage[fromKey] = {
        resolution: 'FROZEN',
        source: 'current_identity_refs',
        lifecycle_status: 'conflict',
        word_id: wordId,
        target_kind: kind,
        from_target_id: fromTargetId,
        to_target_id: null,
        target_key: null,
        reason: 'LINEAGE_CONFLICT'
      };
      statuses.push('LINEAGE_CONFLICT_FROZEN');
      continue;
    }
    ledger.identity_lineage[fromKey] = resolution;
    statuses.push(resolution.resolution === 'REMAP' ? 'LINEAGE_REMAP_REGISTERED' : 'LINEAGE_FROZEN_REGISTERED');
  }
  return { ledger, statuses };
}

function resolvedTargetIdentity(ledgerInput, event) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const rawKey = lexicalTargetKey(event);
  if (!rawKey) return null;
  let key = rawKey;
  let targetId = event?.target_id ? String(event.target_id) : null;
  let targetLocator = event?.target_locator ? String(event.target_locator) : null;
  let targetRevision = event?.target_revision ? String(event.target_revision) : null;
  const visited = new Set();

  while (ledger.identity_lineage[key]) {
    if (visited.has(key)) {
      return { key: rawKey, raw_key: rawKey, frozen: true, reason: 'LINEAGE_CYCLE' };
    }
    visited.add(key);
    const resolution = ledger.identity_lineage[key];
    if (resolution?.resolution !== 'REMAP' || !resolution?.target_key || !resolution?.to_target_id) {
      return {
        key: rawKey,
        raw_key: rawKey,
        frozen: true,
        reason: resolution?.reason || 'IDENTITY_FROZEN',
        lineage: clone(resolution)
      };
    }
    key = String(resolution.target_key);
    targetId = String(resolution.to_target_id);
    targetLocator = null;
    targetRevision = null;
  }

  return {
    key,
    raw_key: rawKey,
    frozen: false,
    word_id: String(event?.word_id || ''),
    target_kind: String(event?.target_kind || ''),
    target_id: targetId,
    target_locator: targetLocator,
    target_revision: targetRevision
  };
}

function eventPayload(event) {
  const copy = clone(event || {});
  delete copy.imported_at;
  return copy;
}

function migrationSignature(event) {
  if (!String(event?.event_id || '').startsWith('migration:')) return null;
  return stableJson({
    word_id: event?.word_id || null,
    target_kind: event?.target_kind || null,
    target_id: event?.target_id || null,
    target_locator: event?.target_locator || null,
    target_revision: event?.target_revision || null,
    source: event?.source || null,
    outcome: event?.outcome || null
  });
}

export function legacyEventId(event) {
  const basis = {
    word_id: event?.word_id || null,
    ordinal: Number(event?.ordinal || 0),
    target_kind: event?.target_kind || null,
    target_id: event?.target_id || null,
    target_locator: event?.target_locator || null,
    target_revision: event?.target_revision || null,
    source: event?.source || null,
    outcome: event?.outcome || null,
    challenge_id: event?.challenge_id || null,
    selected_key: event?.selected_key || null,
    correct_key: event?.correct_key || null,
    observed_at: event?.observed_at || null,
    corrects_event_id: event?.corrects_event_id || null
  };
  return `legacy:${hashString(stableJson(basis))}`;
}

export function normalizeEvidenceEvent(event, { fallbackEventId = true } = {}) {
  const result = clone(event || {});
  if (!result.event_id && fallbackEventId) result.event_id = legacyEventId(result);
  result.word_id = String(result.word_id || '');
  result.ordinal = Number(result.ordinal || 0);
  result.target_kind = String(result.target_kind || '');
  result.target_id = result.target_id ? String(result.target_id) : null;
  result.target_locator = result.target_locator ? String(result.target_locator) : null;
  result.target_revision = result.target_revision ? String(result.target_revision) : null;
  result.source = String(result.source || '');
  result.outcome = String(result.outcome || '');
  result.observed_at = String(result.observed_at || '');
  if (result.demand) result.demand = String(result.demand);
  if (result.assistance) result.assistance = String(result.assistance);
  if (result.context_novelty) result.context_novelty = String(result.context_novelty);
  if (result.attribution) result.attribution = String(result.attribution);
  if (typeof result.delayed !== 'boolean') delete result.delayed;
  if (typeof result.question_valid !== 'boolean') delete result.question_valid;
  return result;
}

export function appendEvidenceEvent(ledgerInput, eventInput) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const event = normalizeEvidenceEvent(eventInput);
  if (!event.event_id || !event.word_id || !event.source || !event.outcome || !event.observed_at) {
    return { ledger, status: 'REJECTED_INVALID_EVENT' };
  }
  const migration = migrationSignature(event);
  if (migration && ledger.events.some((candidate) => migrationSignature(candidate) === migration)) {
    return { ledger, status: 'DUPLICATE_MIGRATION_IGNORED' };
  }
  const existing = ledger.events.find((candidate) => candidate.event_id === event.event_id);
  if (existing) {
    if (stableJson(eventPayload(existing)) === stableJson(eventPayload(event))) return { ledger, status: 'DUPLICATE_IGNORED' };
    ledger.conflicts.push({ event_id: event.event_id, existing: clone(existing), incoming: clone(event) });
    return { ledger, status: 'CONFLICT_QUARANTINED' };
  }
  ledger.events.push(event);
  return { ledger, status: 'APPENDED' };
}

export function ingestReturnPacket(ledgerInput, packet) {
  let ledger = normalizeLexicalLedger(ledgerInput);
  if (packet?.schema !== 'kianos.lexical.return_packet.v1' || !Array.isArray(packet.events)) {
    return { ledger, statuses: ['REJECTED_INVALID_PACKET'] };
  }
  const statuses = [];
  for (const raw of packet.events) {
    const { ledger: next, status } = appendEvidenceEvent(ledger, raw);
    ledger = next;
    statuses.push(status);
  }
  return { ledger, statuses };
}

function millis(value) {
  const n = Date.parse(String(value || ''));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function correctionMatches(correction, original, ledger) {
  if (!correction || !original || correction.word_id !== original.word_id) return false;
  const correctionRawKey = lexicalTargetKey(correction);
  const originalRawKey = lexicalTargetKey(original);
  const correctionIdentity = resolvedTargetIdentity(ledger, correction);
  const originalIdentity = resolvedTargetIdentity(ledger, original);
  const sameTarget = Boolean(correctionRawKey && originalRawKey && correctionRawKey === originalRawKey)
    || Boolean(correctionIdentity && originalIdentity && !correctionIdentity.frozen && !originalIdentity.frozen && correctionIdentity.key === originalIdentity.key);
  if (!sameTarget) return false;
  if (correction.challenge_id && original.challenge_id && correction.challenge_id !== original.challenge_id) return false;
  return true;
}

function sortedEffectiveEvents(ledgerInput) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const byId = new Map(ledger.events.map((event) => [String(event.event_id || ''), event]));
  const voided = new Set();
  for (const event of ledger.events) {
    if (!['QUESTION_ISSUE', 'SEMANTIC_ISSUE'].includes(event.outcome) || !event.corrects_event_id) continue;
    const original = byId.get(String(event.corrects_event_id));
    if (correctionMatches(event, original, ledger)) voided.add(String(event.corrects_event_id));
  }
  return ledger.events
    .filter((event) => !voided.has(String(event.event_id || '')))
    .sort((a, b) => millis(a.observed_at) - millis(b.observed_at) || String(a.event_id).localeCompare(String(b.event_id)));
}

function qualifiedTargetObservation(event) {
  if (!lexicalTargetKey(event)) return false;
  if (questionSources.has(event.source)) return event.question_valid === true;
  if (englishSources.has(event.source)) return event.attribution === 'lexical';
  return false;
}

function eventCanAdmit(event) {
  if (!lexicalTargetKey(event)) return false;
  if (event.outcome === 'ADDED' || event.outcome === 'REACTIVATED') return true;
  if (event.outcome === 'WRONG' || event.outcome === 'AGAIN') return qualifiedTargetObservation(event);
  return false;
}

function weakEvidenceCanAccumulate(event) {
  if (event.outcome !== 'SLOW') return false;
  return qualifiedTargetObservation(event);
}

function demandMatches(requiredDemand, successDemand) {
  if (!requiredDemand) return true;
  return Boolean(successDemand) && requiredDemand === successDemand;
}

export function qualifiesForDormancy(event, requiredDemand = null) {
  if (event?.outcome !== 'CORRECT' || event?.source === 'reconstruction') return false;
  if (!qualifiedTargetObservation(event)) return false;
  if (event?.delayed !== true) return false;
  if (event?.assistance !== 'unassisted') return false;
  if (!['unseen', 'fresh'].includes(String(event?.context_novelty || ''))) return false;
  return demandMatches(requiredDemand, event?.demand || null);
}

export function deriveRepairStates(ledgerInput) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const events = sortedEffectiveEvents(ledger);
  const states = new Map();
  const slowContexts = new Map();

  for (const event of events) {
    const identity = resolvedTargetIdentity(ledger, event);
    if (!identity || identity.frozen || !repairOutcomes.has(event.outcome)) continue;
    const key = identity.key;
    const state = states.get(key) || {
      key,
      word_id: identity.word_id,
      ordinal: Number(event.ordinal || 0),
      word: event.word || null,
      target_kind: identity.target_kind,
      target_id: identity.target_id || null,
      target_locator: identity.target_locator || null,
      target_revision: identity.target_revision || null,
      state: 'NONE',
      required_demand: null,
      activated_at: null,
      last_evidence_at: null,
      last_event_id: null,
      failure_count_since_dormant: 0,
      diagnosis_required: false
    };

    if (eventCanAdmit(event)) {
      state.state = 'ACTIVE';
      state.activated_at = event.observed_at;
      state.last_evidence_at = event.observed_at;
      state.last_event_id = event.event_id;
      if (event.demand) state.required_demand = event.demand;
      if (event.outcome === 'WRONG' || event.outcome === 'AGAIN') {
        state.failure_count_since_dormant += 1;
        if (state.failure_count_since_dormant >= 2) state.diagnosis_required = true;
      }
    } else if (weakEvidenceCanAccumulate(event)) {
      const contexts = slowContexts.get(key) || new Set();
      if (event.context_id) contexts.add(String(event.context_id));
      slowContexts.set(key, contexts);
      if (contexts.size >= 2) {
        state.state = 'ACTIVE';
        state.activated_at = state.activated_at || event.observed_at;
        state.last_evidence_at = event.observed_at;
        state.last_event_id = event.event_id;
        if (event.demand) state.required_demand = event.demand;
      }
    } else if (event.outcome === 'CLEAR') {
      slowContexts.set(key, new Set());
      state.state = 'DORMANT';
      state.last_evidence_at = event.observed_at;
      state.last_event_id = event.event_id;
      state.failure_count_since_dormant = 0;
      state.diagnosis_required = false;
    } else if (qualifiesForDormancy(event, state.required_demand)) {
      slowContexts.set(key, new Set());
      state.state = 'DORMANT';
      state.last_evidence_at = event.observed_at;
      state.last_event_id = event.event_id;
      state.failure_count_since_dormant = 0;
      state.diagnosis_required = false;
    } else if (event.outcome === 'CORRECT') {
      state.last_evidence_at = event.observed_at;
      state.last_event_id = event.event_id;
    }
    states.set(key, state);
  }
  return Object.fromEntries(states.entries());
}

export function compileRepairTargets(ledgerInput) {
  return Object.values(deriveRepairStates(ledgerInput))
    .filter((target) => target.state === 'ACTIVE')
    .sort((a, b) => millis(b.last_evidence_at) - millis(a.last_evidence_at) || a.key.localeCompare(b.key));
}

export function repairStateForEvent(ledgerInput, event) {
  const ledger = normalizeLexicalLedger(ledgerInput);
  const identity = resolvedTargetIdentity(ledger, event);
  if (!identity || identity.frozen) return null;
  return deriveRepairStates(ledger)[identity.key] || null;
}

export function exportReturnEvents(ledgerInput, studyDay, toLocalDay = (iso) => String(iso || '').slice(0, 10)) {
  const allowed = new Set(['ADDED', 'CLEAR', 'REACTIVATED', 'CORRECT', 'WRONG', 'SLOW', 'AGAIN', 'QUESTION_ISSUE', 'SEMANTIC_ISSUE']);
  return sortedEffectiveEvents(ledgerInput)
    .filter((event) => !String(event.event_id || '').startsWith('migration:'))
    .filter((event) => allowed.has(event.outcome) && toLocalDay(event.observed_at) === studyDay)
    .map((event) => clone(event));
}
