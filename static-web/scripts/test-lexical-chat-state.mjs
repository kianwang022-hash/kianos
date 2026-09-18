import assert from 'node:assert/strict';
import { buildLexicalChatStatePacket, LEXICAL_CHAT_STATE_SCHEMA } from '../src/lib/lexicalChatState.mjs';
import { appendEvidenceEvent, emptyLexicalLedger } from '../src/lib/lexicalEvidence.mjs';

const now = new Date('2099-09-18T12:00:00Z');
let ledger = emptyLexicalLedger();
const base = {
  word_id: 'word:abide',
  ordinal: 4,
  word: 'abide',
  target_kind: 'core',
  target_id: 'core:abide',
  observed_at: '2099-09-18T09:00:00.000Z'
};
ledger = appendEvidenceEvent(ledger, { ...base, event_id: 'plus-1', source: 'depth_plus', outcome: 'ADDED' }).ledger;
ledger = appendEvidenceEvent(ledger, {
  ...base,
  event_id: 'challenge-1',
  challenge_id: 'c1',
  source: 'challenge',
  outcome: 'WRONG',
  question_valid: true,
  demand: 'discrimination',
  context_novelty: 'fresh',
  assistance: 'unassisted',
  delayed: true,
  observed_at: '2099-09-18T10:00:00.000Z'
}).ledger;

const routing = {
  schema: 'kianos.lexical.card_routing.v1',
  history: [
    { event_id:'r1', word_id:'word:abide', ordinal:4, word:'abide', route:'FUZZY', observed_at:'2099-09-18T08:30:00.000Z' },
    { event_id:'r2', word_id:'word:about', ordinal:5, word:'about', route:'MASTERED', observed_at:'2099-09-17T08:30:00.000Z' }
  ],
  latest_by_word: {
    'word:abide': { event_id:'r1', word_id:'word:abide', ordinal:4, word:'abide', route:'FUZZY', observed_at:'2099-09-18T08:30:00.000Z' },
    'word:about': { event_id:'r2', word_id:'word:about', ordinal:5, word:'about', route:'MASTERED', observed_at:'2099-09-17T08:30:00.000Z' }
  }
};
const intake = { schema:'kianos.lexical.intake.v1', introduced:{ 'word:abide':'2099-09-18', 'word:about':'2099-09-17' } };
const settings = { schema:'kianos.lexical.settings.v1', daily_new_limit:50, default_pronunciation:'en-US' };
const challengePacket = {
  schema:'kianos.lexical.challenge_packet.v1',
  challenges:[{ challenge_id:'c1', word_id:'word:abide', ordinal:4, word:'abide', target_kind:'core', target_id:'core:abide' }]
};
const packet = buildLexicalChatStatePacket({
  ledger, routing, intake, settings,
  cursor:{ word_id:'word:abide', ordinal:4, word:'abide' },
  challengePacket,
  challengeProgress:{ index:0, mode:'main', answered:true },
  challengeEvents:[{ challenge_id:'c1', outcome:'WRONG' }],
  now
});

assert.equal(packet.schema, LEXICAL_CHAT_STATE_SCHEMA);
assert.equal(packet.coverage.cursor.word, 'abide');
assert.equal(packet.coverage.introduced_total, 2);
assert.equal(packet.coverage.today_new, 1);
assert.equal(packet.coverage.remaining_new_capacity, 49);
assert.equal(packet.routing.latest_counts.fuzzy, 1);
assert.equal(packet.routing.latest_counts.mastered, 1);
assert.equal(packet.routing.same_day_revisit.length, 1);
assert.equal(packet.routing.same_day_revisit[0].word, 'abide');
assert.equal(packet.repair.active_target_count, 1);
assert.equal(packet.repair.active_targets[0].target_id, 'core:abide');
assert.equal(packet.today_evidence.length, 2);
assert.equal(packet.challenge_session.current_challenge_id, 'c1');
assert.match(packet.chat_instruction, /Coverage as traversal/);
assert.match(packet.semantics.repair, /exact ACTIVE/);

console.log(JSON.stringify({
  status:'PASS',
  schema:packet.schema,
  coverage:packet.coverage,
  routing:packet.routing,
  repair:packet.repair,
  challenge_session:packet.challenge_session,
  today_evidence_count:packet.today_evidence.length
}, null, 2));
