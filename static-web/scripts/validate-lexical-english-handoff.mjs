import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lexicalEventFromObjectiveThread, objectiveTaskToLexicalSource } from '../src/lib/lexicalEnglishEvidence.mjs';
import { appendEvidenceEvent, buildLexicalRetentionTransferSummary, compileRepairTargets, emptyLexicalLedger, repairStateForEvent, serializeLexicalReturnPacketForChat } from '../src/lib/lexicalEvidence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (relative) => fs.readFileSync(path.resolve(here, '..', relative), 'utf8');
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`PASS ${String(passed).padStart(2, '0')} ${name}`); };
const baseThread = (overrides = {}) => ({
  threadId: 'lex-1',
  route: 'lexical',
  summary: 'Exact lexical failure isolated in deep review.',
  repairCompleted: false,
  repairEvidence: 'Learner confused this exact sense in the submitted task.',
  lexicalEvidence: {
    word_id: 'word:abide', ordinal: 4, word: 'abide',
    target_kind: 'sense', target_id: 'sense:abide:main',
    outcome: 'WRONG', demand: 'recognition',
    ...overrides
  }
});
const prepare = (thread = baseThread(), task = 'reading_a', objectId = 'reading:test') => lexicalEventFromObjectiveThread({
  task, objectId, attemptSubmittedAt: '2026-09-16T08:00:00Z', thread
});

test('Lexical learner packet is self-describing for a fresh Chat', () => {
  const packet = {
    schema: 'kianos.lexical.return_packet.v1',
    study_day: '2026-09-18',
    exported_at: '2026-09-18T10:00:00.000Z',
    events: [{
      event_id: 'evt-1',
      word_id: 'word:abide',
      ordinal: 4,
      target_kind: 'sense',
      target_id: 'sense:abide:main',
      source: 'reading',
      outcome: 'WRONG',
      observed_at: '2026-09-18T09:00:00.000Z'
    }]
  };
  const text = serializeLexicalReturnPacketForChat(packet);
  assert.match(text, /^KIANOS_LEXICAL_HANDOFF_V1/m);
  assert.match(text, /HOW TO READ IT/);
  assert.match(text, /WHAT CHAT SHOULD DO/);
  assert.match(text, /content\/lexical\/CURRENT\.md/);
  assert.match(text, /kianos\.lexical\.challenge_packet\.v1/);
  assert.match(text, /LEXICAL_RETURN_PACKET_JSON/);
  assert.match(text, /"word_id": "word:abide"/);
});

test('task source mapping stays inside lexical evidence contract', () => {
  assert.equal(objectiveTaskToLexicalSource('reading_a'), 'reading');
  assert.equal(objectiveTaskToLexicalSource('reading_b'), 'reading');
  assert.equal(objectiveTaskToLexicalSource('cloze'), 'cloze');
  assert.equal(objectiveTaskToLexicalSource('translation'), 'translation');
  assert.equal(objectiveTaskToLexicalSource('writing'), 'writing');
  assert.equal(objectiveTaskToLexicalSource('politics'), null);
});

test('non lexical thread is ignored', () => {
  assert.equal(prepare({ ...baseThread(), route: 'reading' }).status, 'IGNORED_NON_LEXICAL');
});

test('lexical route without exact evidence is rejected', () => {
  const result = prepare({ threadId: 'x', route: 'lexical', summary: 'vague' });
  assert.equal(result.status, 'REJECTED_MISSING_EXACT_EVIDENCE');
});

test('locator-only target requires revision', () => {
  const thread = baseThread({ target_id: null, target_locator: 'record.secondary_senses[0]', target_revision: null });
  assert.equal(prepare(thread).status, 'REJECTED_UNRESOLVED_TARGET');
});

test('exact reading failure becomes attributable lexical event at occurrence time', () => {
  const result = prepare();
  assert.equal(result.status, 'READY');
  assert.equal(result.event.source, 'reading');
  assert.equal(result.event.attribution, 'lexical');
  assert.equal(result.event.observed_at, '2026-09-16T08:00:00Z');
  assert.equal(result.event.target_id, 'sense:abide:main');
});

test('cloze maps to cloze without inventing question validity', () => {
  const result = prepare(baseThread(), 'cloze', 'cloze:test');
  assert.equal(result.status, 'READY');
  assert.equal(result.event.source, 'cloze');
  assert.equal(Object.hasOwn(result.event, 'question_valid'), false);
});

test('event identity is deterministic for replay', () => {
  const a = prepare().event.event_id;
  const b = prepare().event.event_id;
  assert.equal(a, b);
});

test('exact English failure activates only that repair target', () => {
  const event = prepare().event;
  const result = appendEvidenceEvent(emptyLexicalLedger(), event);
  assert.equal(result.status, 'APPENDED');
  const active = compileRepairTargets(result.ledger);
  assert.equal(active.length, 1);
  assert.equal(active[0].target_id, 'sense:abide:main');
});

test('same imported English evidence is idempotent', () => {
  const event = prepare().event;
  let result = appendEvidenceEvent(emptyLexicalLedger(), event);
  result = appendEvidenceEvent(result.ledger, event);
  assert.equal(result.status, 'DUPLICATE_IGNORED');
  assert.equal(result.ledger.events.length, 1);
});

test('qualified later real reading success may dormancy same recognition target', () => {
  const failure = prepare().event;
  let ledger = appendEvidenceEvent(emptyLexicalLedger(), failure).ledger;
  const successThread = baseThread({
    outcome: 'CORRECT', demand: 'recognition', assistance: 'unassisted',
    context_novelty: 'unseen', delayed: true, observed_at: '2026-09-20T08:00:00Z'
  });
  const success = lexicalEventFromObjectiveThread({ task: 'reading_a', objectId: 'reading:fresh', attemptSubmittedAt: '2026-09-20T08:00:00Z', thread: successThread }).event;
  ledger = appendEvidenceEvent(ledger, success).ledger;
  assert.equal(repairStateForEvent(ledger, success).state, 'DORMANT');
});

test('reading recognition success cannot retire production demand', () => {
  const failure = prepare(baseThread({ outcome: 'WRONG', demand: 'production' }), 'writing', 'writing:test').event;
  let ledger = appendEvidenceEvent(emptyLexicalLedger(), failure).ledger;
  const success = lexicalEventFromObjectiveThread({
    task: 'reading_a', objectId: 'reading:fresh', attemptSubmittedAt: '2026-09-20T08:00:00Z',
    thread: baseThread({ outcome: 'CORRECT', demand: 'recognition', assistance: 'unassisted', context_novelty: 'unseen', delayed: true })
  }).event;
  ledger = appendEvidenceEvent(ledger, success).ledger;
  assert.equal(repairStateForEvent(ledger, success).state, 'ACTIVE');
});

test('fresh Chat retention projection preserves delayed and real-context lexical evidence', () => {
  const failure = prepare().event;
  let ledger = appendEvidenceEvent(emptyLexicalLedger(), failure).ledger;
  const success = lexicalEventFromObjectiveThread({
    task: 'reading_a',
    objectId: 'reading:fresh-retention',
    attemptSubmittedAt: '2026-09-20T08:00:00Z',
    thread: baseThread({
      outcome: 'CORRECT',
      demand: 'recognition',
      assistance: 'unassisted',
      context_novelty: 'unseen',
      delayed: true
    })
  }).event;
  ledger = appendEvidenceEvent(ledger, success).ledger;
  const summary = buildLexicalRetentionTransferSummary(ledger);
  assert.equal(summary.qualified_delayed_success_count, 1);
  assert.equal(summary.clean_english_transfer_success_count, 1);
  assert.equal(summary.recent_clean_english_transfer_successes[0].source, 'reading');
  assert.match(summary.semantics, /NOT_MASTERY/);
  assert.ok(summary.guardrails.includes('NO_CALENDAR_DUE_LIST_IS_CREATED'));
});

test('browser compatibility bridge delegates mutation to the atomic English return owner', () => {
  const bridge = read('src/components/VocabularyEnglishEvidenceBridge.astro');
  const returnOwner = read('src/lib/englishLexicalReturn.mjs');
  const frame = read('src/layouts/BaseFrame.astro');
  assert.match(bridge, /englishLexicalReturn\.mjs/);
  assert.match(bridge, /No second post-click writer may partially apply/);
  assert.match(returnOwner, /appendEvidenceEvent/);
  assert.match(returnOwner, /repairStateForEvent/);
  assert.match(returnOwner, /DUPLICATE_IGNORED/);
  assert.match(returnOwner, /guards/);
  assert.match(frame, /VocabularyEnglishEvidenceBridge/);
});

console.log(JSON.stringify({
  status: 'PASS',
  scenarios: passed,
  claim: 'exact English objective lexical evidence bridge validation; no unresolved attribution becomes lexical debt'
}));
