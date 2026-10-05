import assert from 'node:assert/strict';

import {
  compileRepairTargets,
  emptyLexicalLedger
} from '../src/lib/lexicalEvidence.mjs';

const ledger = emptyLexicalLedger();
for (let i = 0; i < 256; i += 1) {
  ledger.events.push({
    event_id: `complexity:${i}`,
    word_id: `word:${i}`,
    ordinal: i + 1,
    word: `word-${i}`,
    target_kind: 'sense',
    target_id: `sense:${i}`,
    source: 'depth_plus',
    outcome: 'ADDED',
    observed_at: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString()
  });
}

const before = JSON.stringify(ledger);
const stringify = JSON.stringify;
let fullEventArraySerializations = 0;
JSON.stringify = function countedStringify(value, ...args) {
  if (
    Array.isArray(value)
    && value.length === ledger.events.length
    && value[0]?.event_id === 'complexity:0'
    && value.at(-1)?.event_id === `complexity:${ledger.events.length - 1}`
  ) {
    fullEventArraySerializations += 1;
  }
  return stringify(value, ...args);
};

let targets;
try {
  targets = compileRepairTargets(ledger);
} finally {
  JSON.stringify = stringify;
}

assert.equal(targets.length, ledger.events.length, 'synthetic active targets must remain semantically complete');
assert.equal(JSON.stringify(ledger), before, 'repair projection must not mutate evidence history');
assert.ok(
  fullEventArraySerializations <= 3,
  `repair projection re-copied the full event array inside its event loop: ${fullEventArraySerializations} serializations`
);

console.log(`PASS lexical repair projection stays linear: ${fullEventArraySerializations} full-event-array serializations for ${ledger.events.length} events`);
