import assert from 'node:assert/strict';

import { loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';
import {
  appendEvidenceEvent,
  compileRepairTargets,
  emptyLexicalLedger,
  reconcileEvidenceIdentity
} from '../src/lib/lexicalEvidence.mjs';

const current = loadLexicalWordByOrdinal(7);
assert.equal(current.objectId, 'word:abnormal');
assert.equal(current.record.word, 'abnormal');

const merged = current.senseLineage.find((row) => row.status === 'merged');
const deprecated = current.senseLineage.find((row) => row.status === 'deprecated');
assert.ok(merged?.from_target_id && merged?.to_target_id, 'real Current merged lineage required');
assert.ok(deprecated?.from_target_id && !deprecated?.to_target_id, 'real Current deprecated lineage required');

let result = reconcileEvidenceIdentity(emptyLexicalLedger(), current.senseLineage);
let ledger = result.ledger;
assert.deepEqual(
  result.statuses,
  ['LINEAGE_REMAP_REGISTERED', 'LINEAGE_FROZEN_REGISTERED'],
  'Current owner must register one exact remap and one fail-closed target'
);

const firstBytes = JSON.stringify(ledger);
result = reconcileEvidenceIdentity(ledger, current.senseLineage);
assert.equal(JSON.stringify(result.ledger), firstBytes, 're-registering identical Current lineage must be idempotent');
ledger = result.ledger;

const oldMergedEvent = {
  event_id: 'current-lineage:old-merged',
  word_id: current.objectId,
  ordinal: 7,
  word: 'abnormal',
  target_kind: 'sense',
  target_id: merged.from_target_id,
  source: 'challenge',
  outcome: 'WRONG',
  question_valid: true,
  demand: 'reading',
  observed_at: '2026-09-25T00:00:00.000Z'
};
const deprecatedEvent = {
  event_id: 'current-lineage:deprecated',
  word_id: current.objectId,
  ordinal: 7,
  word: 'abnormal',
  target_kind: 'sense',
  target_id: deprecated.from_target_id,
  source: 'challenge',
  outcome: 'WRONG',
  question_valid: true,
  demand: 'reading',
  observed_at: '2026-09-25T00:01:00.000Z'
};

let appended = appendEvidenceEvent(ledger, oldMergedEvent);
assert.equal(appended.status, 'APPENDED');
ledger = appended.ledger;
appended = appendEvidenceEvent(ledger, deprecatedEvent);
assert.equal(appended.status, 'APPENDED');
ledger = appended.ledger;

const targets = compileRepairTargets(ledger);
assert.equal(targets.length, 1, 'deprecated/no-successor evidence must create no actionable Repair target');
assert.equal(targets[0].target_id, merged.to_target_id, 'merged evidence must project to the exact Current successor');
assert.equal(ledger.events[0].target_id, merged.from_target_id, 'historical event identity must remain immutable');
assert.equal(ledger.events[1].target_id, deprecated.from_target_id, 'deprecated historical event identity must remain immutable');

const conflicting = reconcileEvidenceIdentity(ledger, [{
  ...merged,
  to_target_id: deprecated.from_target_id
}]);
assert.ok(conflicting.statuses.includes('LINEAGE_CONFLICT_FROZEN'), 'conflicting Current lineage must freeze rather than guess');
const conflictKey = `${current.objectId}|sense|id:${merged.from_target_id}`;
assert.equal(conflicting.ledger.identity_lineage[conflictKey]?.resolution, 'FROZEN');
assert.equal(conflicting.ledger.identity_lineage[conflictKey]?.reason, 'LINEAGE_CONFLICT');
assert.equal(compileRepairTargets(conflicting.ledger).length, 0, 'conflicted lineage must not leave an actionable guessed target');

console.log('PASS lexical Current identity lineage: real-owner remap + deprecated freeze + idempotency + conflict fail-closed');
