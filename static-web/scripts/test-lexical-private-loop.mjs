import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { publishPrivateControlCommand } from './privateControlStore.mjs';
import { readLexicalLedger, writeLexicalLedger, emptyLexicalLedger, appendEvidenceEvent, LEXICAL_LEDGER_STORAGE_KEY as ledgerKey } from '../src/lib/lexicalEvidence.mjs';
import { readLexicalChatState } from '../src/lib/lexicalChatState.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import { installLexicalChallengePacket, readLexicalChallengeSession, dismissLexicalChallengeSession, LEXICAL_CHALLENGE_PACKET_KEY as packetKey, LEXICAL_CHALLENGE_PROGRESS_KEY as progressKey } from '../src/lib/lexicalChallenge.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';
import { browserControlCommand, CONTROL_LOCAL_RECEIPT_KEY as receiptKey } from '../src/lib/privateControlCommand.mjs';
import { buildExamChatPlanBasis } from '../src/lib/examChatPlan.mjs';

class Storage {
  constructor() { this.map = new Map(); this.failKey = null; }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { if (key === this.failKey) throw new Error('QuotaExceededError'); this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}
let receiptAvailable = false, receiptWrites = 0;
globalThis.window = { dispatchEvent() {} };
globalThis.fetch = async (url, options) => {
  assert.ok(url.endsWith('/receipt'));
  receiptWrites++;
  return { ok: receiptAvailable, json: async () => ({ status: 'saved', receipt: JSON.parse(options.body) }) };
};
const day = '2026-09-24', now = Date.parse(day + 'T02:00:00Z');
const event = { event_id: 'synthetic-plus', word_id: 'lexical.word.o0004', ordinal: 4, word: 'abide',
  target_kind: 'sense', target_id: 'sense:abide', source: 'depth_plus', outcome: 'ADDED', observed_at: day + 'T01:00:00Z' };
const challenge = { schema: 'kianos.lexical.challenge_packet.v1', study_day: day, generated_at: day + 'T01:30:00Z',
  challenges: [{ challenge_id: 'synthetic-1', word_id: event.word_id, ordinal: 4, target_kind: 'sense', target_id: event.target_id,
    question_type: 'spatial_choice', stem: 'Synthetic test?', options: [{ key: 'left', text: 'A' }, { key: 'right', text: 'B' }], correct_key: 'right' }] };
const command = payload => browserControlCommand({ schema: 'kianos.control-command.v1', command_id: 'lexical-loop-0001', study_day: day,
  generated_at: day + 'T01:31:00Z', operations: [{ kind: 'lexical.challenge', payload }] }, { commandHash: 'a'.repeat(64) });
const results = [];
async function test(name, run) { await run(); results.push(name); }

await test('malformed, unknown-schema and malformed-event bytes preserved on read/write', () => {
  for (const raw of ['{', 'null', JSON.stringify({ schema: 'future', events: [{ event_id: 'unique' }] }),
    JSON.stringify({ ...emptyLexicalLedger(), events: [null] })]) {
    const s = new Storage(); s.setItem(ledgerKey, raw);
    assert.throws(() => readLexicalLedger(s), /UNREADABLE/);
    assert.throws(() => writeLexicalLedger(s, emptyLexicalLedger()), /UNREADABLE/);
    assert.equal(s.getItem(ledgerKey), raw);
    assert.equal(readLexicalChatState(s, { now }).status, 'unreadable');
  }
});
await test('missing is a first visit, not existing corrupt state', () => {
  const s = new Storage(); assert.equal(readLexicalChatState(s, { now }).status, 'missing');
  assert.deepEqual(readLexicalLedger(s), emptyLexicalLedger()); assert.equal(s.length, 0);
});
await test('lexical-only evidence reaches automatic Daily Packet without fabricating English attempts', () => {
  const s = new Storage(); writeLexicalLedger(s, appendEvidenceEvent(emptyLexicalLedger(), event).ledger);
  s.setItem('kianos-vocabulary-last-ordinal', '5');
  s.setItem('kianos-lexical-card-routing-v1', JSON.stringify({ schema: 'kianos.lexical.card_routing.v1', history: [], latest_by_word: {} }));
  const { packet, coverage } = buildHomeDailyLearningPacket({ storage: s, day, now });
  assert.equal(coverage.english, 'attached');
  const en = packet.subjects.english.evidence;
  assert.equal(en.lexical.chat_state.packet.repair.active_target_count, 1);
  assert.equal(en.lexical.chat_state.packet.coverage.cursor.ordinal, 5);
  assert.equal(en.inventory.length, 0);
  assert.equal(packet.total_minutes, 0);
});
await test('unreadable lexical stays unknown and preserves original bytes in automatic projection', () => {
  const s = new Storage(); s.setItem(ledgerKey, '{');
  const { packet, coverage, warnings } = buildHomeDailyLearningPacket({ storage: s, day, now });
  assert.equal(coverage.english, 'attached');
  assert.equal(packet.subjects.english.evidence.lexical.chat_state.packet, null);
  assert.ok(warnings.some(w => w.includes('LEXICAL_STATE_UNREADABLE')));
  assert.equal(s.getItem(ledgerKey), '{');
});
await test('manual duplicate preserves progress; changed content under same identity rejects', () => {
  const s = new Storage(); installLexicalChallengePacket(s, challenge);
  const progress = JSON.parse(s.getItem(progressKey)); progress.answered = true;
  s.setItem(progressKey, JSON.stringify(progress));
  assert.equal(installLexicalChallengePacket(s, challenge).status, 'idempotent');
  assert.equal(readLexicalChallengeSession(s).progress.answered, true);
  const mutated = structuredClone(challenge); mutated.challenges[0].stem = 'Changed';
  assert.throws(() => installLexicalChallengePacket(s, mutated), /ID_CONFLICT/);
  assert.equal(readLexicalChallengeSession(s).packet.challenges[0].stem, 'Synthetic test?');
});
await test('invalid, duplicate, missing-target and stale-day commands apply nothing', async () => {
  for (const payload of [ { ...challenge, challenges: [...challenge.challenges, ...challenge.challenges] },
    { ...challenge, challenges: [{ ...challenge.challenges[0], target_id: null }] },
    { ...challenge, study_day: '2026-09-23' } ]) {
    const s = new Storage(); await assert.rejects(async () => applyPrivateControlCommand(s, command(payload), { day, now }));
    assert.equal(s.length, 0);
  }
});
await test('partial local write failure rolls back all operation and receipt bytes', async () => {
  const s = new Storage(); s.failKey = receiptKey;
  const beforePuts = receiptWrites;
  await assert.rejects(applyPrivateControlCommand(s, command(challenge), { day, now }), /Quota/);
  assert.equal(s.length, 0); assert.equal(receiptWrites, beforePuts);
  s.failKey = null;
  const result = await applyPrivateControlCommand(s, command(challenge), { day, now });
  assert.equal(result.status, 'applied'); assert.equal(result.receipt_saved, false);
});
await test('lost receipt retry after answering preserves progress and evidence', async () => {
  const s = new Storage(); await applyPrivateControlCommand(s, command(challenge), { day, now });
  const progress = JSON.parse(s.getItem(progressKey)); progress.answered = true; s.setItem(progressKey, JSON.stringify(progress));
  writeLexicalLedger(s, appendEvidenceEvent(emptyLexicalLedger(), event).ledger);
  const before = [...s.map]; receiptAvailable = true;
  const result = await applyPrivateControlCommand(s, command(challenge), { day, now });
  assert.equal(result.status, 'idempotent'); assert.equal(result.receipt_saved, true);
  assert.deepEqual([...s.map], before);
});
await test('restore unreadable progress is retained and blocks replacement', () => {
  const s = new Storage(); installLexicalChallengePacket(s, challenge); s.setItem(progressKey, '{');
  const before = [...s.map];
  assert.throws(() => installLexicalChallengePacket(s, { ...challenge, generated_at: day + 'T01:45:00Z' }), /UNREADABLE/);
  assert.deepEqual([...s.map], before);
});
await test('ending a completed session survives command retry and accepts a genuinely new packet', async () => {
  const s = new Storage(); await applyPrivateControlCommand(s, command(challenge), { day, now });
  assert.throws(() => dismissLexicalChallengeSession(s), /NOT_COMPLETE/);
  const progress = JSON.parse(s.getItem(progressKey)); progress.index = challenge.challenges.length;
  s.setItem(progressKey, JSON.stringify(progress)); dismissLexicalChallengeSession(s);
  const before = [...s.map];
  assert.equal((await applyPrivateControlCommand(s, command(challenge), { day, now })).status, 'idempotent');
  assert.deepEqual([...s.map], before);
  assert.equal(readLexicalChatState(s, { now }).packet.challenge_session.dismissed, true);
  installLexicalChallengePacket(s, { ...challenge, generated_at: day + 'T01:45:00Z' });
  assert.equal(readLexicalChallengeSession(s).progress.dismissed, undefined);
  assert.equal(readLexicalChallengeSession(s).progress.index, 0);
});
await test('Challenge and Plan share one transaction and plan binds post-command state', async () => {
  const s = new Storage(); const cmd = command(challenge);
  cmd.operations.push({ kind: 'exam.chat_plan', payload: { schema: 'kianos.exam.chat-plan.v1', study_day: day,
    generated_at: cmd.generated_at, learner_evidence_basis: buildExamChatPlanBasis(s, day),
    subjects: { xizong: null, english: null, politics: null }, next_subject: null } });
  await applyPrivateControlCommand(s, cmd, { day, now });
  assert.ok(s.getItem(packetKey));
  const plan = JSON.parse(s.getItem('kianos-exam-chat-plan-v1'));
  assert.deepEqual(plan.learner_evidence_basis, buildExamChatPlanBasis(s, day));
});
await test('server publishes valid lexical operation and rejects invalid payload before persistence', () => {
  const privateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lexical-command-'));
  try {
    const envelope = { ...command(challenge), schema: 'kianos.control-command.v1' };
    const invalid = { ...envelope, operations: [{ kind: 'lexical.challenge', payload: { study_day: day } }] };
    assert.throws(() => publishPrivateControlCommand(invalid, { privateDir }), /SCHEMA_INVALID/);
    assert.equal(fs.existsSync(path.join(privateDir, 'current.json')), false);
    publishPrivateControlCommand(envelope, { privateDir });
    assert.equal(JSON.parse(fs.readFileSync(path.join(privateDir, 'current.json'))).operations[0].kind, 'lexical.challenge');
    assert.equal(publishPrivateControlCommand(envelope, { privateDir }).status, 'idempotent');
  } finally { fs.rmSync(privateDir, { recursive: true, force: true }); }
});
console.log(JSON.stringify({ status: 'PASS', scenarios: results.length, results }, null, 2));
