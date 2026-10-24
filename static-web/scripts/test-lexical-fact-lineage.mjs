// Tiny synthetic consumer contract. No browser storage or real learner ledger.
import assert from 'node:assert/strict';
import { emptyLexicalLedger, appendEvidenceEvent, reconcileEvidenceIdentity, compileRepairTargets } from '../src/lib/lexicalEvidence.mjs';

const rows = ['construction', 'secondary_sense'].map((kind) => ({
  word_id: 'word:synthetic', target_kind: kind, from_target_id: `original-${kind}`,
  status: 'deprecated', to_target_id: null
}));
let ledger = emptyLexicalLedger();
const keys = [];
function add(kind, id, label) {
  keys.push(`${kind}|${id}`);
  for (const outcome of ['ADDED', 'WRONG']) {
    ledger = appendEvidenceEvent(ledger, {
      word_id: 'word:synthetic', target_kind: kind, target_id: id,
      event_id: `${label}-${outcome}`, source: 'depth_plus', outcome,
      observed_at: '2026-10-24T00:00:00Z'
    }).ledger;
  }
}
for (const row of rows) {
  add(row.target_kind, row.from_target_id, row.target_kind);
  add('synthetic_other_kind', row.from_target_id, `${row.target_kind}-other-kind`);
}
add('construction', 'current-active', 'active-control');
add('construction', 'reference-not-transported', 'reference-control');
const original = JSON.stringify(ledger);
assert.deepEqual(reconcileEvidenceIdentity(ledger, []).ledger, ledger);
const reconciled = reconcileEvidenceIdentity(ledger, rows).ledger;
assert.equal(JSON.stringify(ledger), original);
assert.deepEqual(reconciled.events, ledger.events);
assert.equal(Object.values(reconciled.identity_lineage).filter(r => r.resolution === 'FROZEN').length, 2);
const active = compileRepairTargets(reconciled).map(r => `${r.target_kind}|${r.target_id}`);
assert.deepEqual(new Set(active), new Set(keys.filter(key => !rows.some(r => key === `${r.target_kind}|${r.from_target_id}`))));
assert.deepEqual(reconcileEvidenceIdentity(reconciled, rows).ledger, reconciled);
console.log('PASS same-kind fact lineage, immutable events, controls and idempotence');
