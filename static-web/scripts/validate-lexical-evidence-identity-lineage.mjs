import assert from 'node:assert/strict';
import { loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';
import {
  appendEvidenceEvent,
  compileRepairTargets,
  deriveRepairStates,
  emptyLexicalLedger,
  exportReturnEvents,
  lexicalTargetKey,
  reconcileEvidenceIdentity,
  repairStateForEvent
} from '../src/lib/lexicalEvidence.mjs';

const abnormal = loadLexicalWordByOrdinal(7);
assert.equal(abnormal.objectId, 'word:abnormal');
const merged = abnormal.senseLineage.find((row) => row.status === 'merged');
const deprecated = abnormal.senseLineage.find((row) => row.status === 'deprecated');
assert.ok(merged, 'real abnormal merged lineage missing');
assert.ok(deprecated, 'real abnormal deprecated lineage missing');
assert.equal(merged.from_target_id, 'sense:abnormal:3271d9f4317951c3');
assert.equal(merged.to_target_id, 'sense:abnormal:98807d28524a5607');
assert.equal(deprecated.from_target_id, 'sense:abnormal:eb663cac3ad15b02');
assert.equal(deprecated.to_target_id, null);

const baseEvent = (overrides = {}) => ({
  event_id: `e:${Math.random()}`,
  word_id: 'word:abnormal',
  ordinal: 7,
  word: 'abnormal',
  target_kind: 'sense',
  target_id: merged.from_target_id,
  target_locator: null,
  target_revision: null,
  source: 'depth_plus',
  outcome: 'ADDED',
  observed_at: '2026-09-01T08:00:00Z',
  ...overrides
});
const append = (ledger, event) => appendEvidenceEvent(ledger, event).ledger;
const reconcile = (ledger) => reconcileEvidenceIdentity(ledger, abnormal.senseLineage).ledger;

// Historical evidence remains historically addressed, but explicit merge lineage projects it to the Current successor.
let ledger = append(emptyLexicalLedger(), baseEvent({ event_id: 'merged-old-add' }));
ledger = reconcile(ledger);
assert.equal(ledger.events.length, 1);
assert.equal(ledger.events[0].target_id, merged.from_target_id, 'history must not be rewritten');
let targets = compileRepairTargets(ledger);
assert.equal(targets.length, 1);
assert.equal(targets[0].target_id, merged.to_target_id);
assert.equal(targets[0].key, `word:abnormal|sense|id:${merged.to_target_id}`);
assert.equal(ledger.identity_lineage[`word:abnormal|sense|id:${merged.from_target_id}`].resolution, 'REMAP');

// Reconciliation is idempotent and does not manufacture learner observations.
const eventCountBefore = ledger.events.length;
const identityBefore = JSON.stringify(ledger.identity_lineage);
ledger = reconcile(ledger);
assert.equal(ledger.events.length, eventCountBefore);
assert.equal(JSON.stringify(ledger.identity_lineage), identityBefore);

// Current successor evidence and old merged evidence fold into one causal state.
ledger = append(ledger, baseEvent({
  event_id: 'successor-good',
  target_id: merged.to_target_id,
  source: 'challenge',
  outcome: 'CORRECT',
  question_valid: true,
  demand: 'discrimination',
  assistance: 'unassisted',
  context_novelty: 'unseen',
  delayed: true,
  observed_at: '2026-09-03T08:00:00Z'
}));
const successorState = repairStateForEvent(ledger, baseEvent({ target_id: merged.to_target_id }));
assert.equal(successorState.state, 'DORMANT');
assert.equal(compileRepairTargets(ledger).length, 0);

// Deprecated target with no explicit successor is fail-closed: history retained, no actionable Repair debt.
let frozenLedger = append(emptyLexicalLedger(), baseEvent({
  event_id: 'deprecated-add',
  target_id: deprecated.from_target_id
}));
frozenLedger = reconcile(frozenLedger);
assert.equal(frozenLedger.events.length, 1);
assert.equal(frozenLedger.events[0].target_id, deprecated.from_target_id);
assert.equal(compileRepairTargets(frozenLedger).length, 0);
const frozenKey = `word:abnormal|sense|id:${deprecated.from_target_id}`;
assert.equal(frozenLedger.identity_lineage[frozenKey].resolution, 'FROZEN');
assert.equal(frozenLedger.identity_lineage[frozenKey].reason, 'NO_EXPLICIT_CURRENT_SUCCESSOR');

// A lineage row cannot steal evidence from another Natural Owner.
let otherWordLedger = append(emptyLexicalLedger(), {
  ...baseEvent({ event_id: 'other-word-old' }),
  word_id: 'word:other'
});
otherWordLedger = reconcile(otherWordLedger);
assert.equal(compileRepairTargets(otherWordLedger)[0].target_id, merged.from_target_id);

// Conflicting Current lineage fails closed rather than guessing.
let conflictLedger = append(emptyLexicalLedger(), baseEvent({ event_id: 'conflict-old' }));
conflictLedger = reconcileEvidenceIdentity(conflictLedger, [merged]).ledger;
conflictLedger = reconcileEvidenceIdentity(conflictLedger, [{
  ...merged,
  to_target_id: 'sense:abnormal:impossible-other-successor'
}]).ledger;
assert.equal(conflictLedger.identity_lineage[`word:abnormal|sense|id:${merged.from_target_id}`].resolution, 'FROZEN');
assert.equal(compileRepairTargets(conflictLedger).length, 0);

// Correction may target the Current successor while correcting an old merged event; explicit lineage makes them the same target.
let correctionLedger = append(emptyLexicalLedger(), baseEvent({
  event_id: 'old-wrong',
  source: 'challenge',
  outcome: 'WRONG',
  question_valid: true,
  challenge_id: 'c1'
}));
correctionLedger = reconcile(correctionLedger);
correctionLedger = append(correctionLedger, baseEvent({
  event_id: 'successor-question-issue',
  target_id: merged.to_target_id,
  source: 'challenge',
  outcome: 'QUESTION_ISSUE',
  question_valid: false,
  challenge_id: 'c1',
  corrects_event_id: 'old-wrong',
  observed_at: '2026-09-01T08:05:00Z'
}));
assert.equal(Object.keys(deriveRepairStates(correctionLedger)).length, 0);

// Return transport keeps historical event payload intact; Current lineage is local projection metadata, not rewritten history.
const exported = exportReturnEvents(reconcile(append(emptyLexicalLedger(), baseEvent({ event_id: 'export-old' }))), '2026-09-01');
assert.equal(exported.length, 1);
assert.equal(exported[0].target_id, merged.from_target_id);
assert.equal(lexicalTargetKey(exported[0]), `word:abnormal|sense|id:${merged.from_target_id}`);

console.log(JSON.stringify({
  status: 'PASS',
  fixture: 'abnormal@7',
  explicit_merge: `${merged.from_target_id} -> ${merged.to_target_id}`,
  deprecated_frozen: deprecated.from_target_id,
  learner_event_rewrites: 0,
  claim: 'Current owner identity_refs drive explicit merge remap; no-successor lifecycle freezes evidence without guessed transfer or invisible Repair debt.'
}));
