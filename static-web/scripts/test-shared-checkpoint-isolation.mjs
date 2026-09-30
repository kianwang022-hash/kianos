import assert from 'node:assert/strict';
import { captureSharedControlCheckpoint, restoreSharedControlCheckpoint } from '../src/lib/sharedControlCheckpoint.mjs';
import { buildPrivateLearnerCheckpoint } from '../src/lib/privateLearnerCheckpoint.mjs';
import {
  saveSharedControlToPrivate, restoreSharedControlFromPrivate,
  PRIVATE_CHECKPOINT_BASE_KEY, PRIVATE_CHECKPOINT_LINEAGE_KEY
} from '../src/lib/privateCheckpointRuntime.mjs';
import { EXAM_PROFILE_KEY, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
import { EXAM_CHAT_PLAN_KEY, EXAM_CHAT_PLAN_SCHEMA } from '../src/lib/examChatPlan.mjs';
import {
  STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_SCHEMA,
  emptyStudyTimerState, readStudyTimerLedger
} from '../src/lib/studyTimer.mjs';
import { STEWARD_REALITY_KEY, STEWARD_REALITY_SCHEMA } from '../src/lib/stewardReality.mjs';
import { CONTROL_LOCAL_RECEIPT_KEY, CONTROL_RECEIPT_SCHEMA } from '../src/lib/privateControlCommand.mjs';

// No browser, real storage, network, account, or filesystem fixtures.
globalThis.fetch = () => { throw Error('TEST_NETWORK_FORBIDDEN'); };
class MemoryStorage {
  constructor(entries = []) { this.map = new Map(entries); }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(i) { return [...this.map.keys()][i] ?? null; }
  get length() { return this.map.size; }
}
const now = Date.parse('2026-09-19T01:00:00Z'), day = '2026-09-19';
const plan = {
  schema: EXAM_CHAT_PLAN_SCHEMA, study_day: day, generated_at: new Date(now).toISOString(),
  subjects: { xizong: { target_minutes: 360 }, english: { target_minutes: 120 }, politics: { target_minutes: 90 } },
  next_subject: 'xizong'
};
const reality = {
  schema: STEWARD_REALITY_SCHEMA, revision: 3, generation: 1, mealDrafts: [], trainingDrafts: [],
  events: [{ id: 'note', kind: 'QUICK', type: 'NOTE', note: 'isolated fixture', observedAt: now, revision: 1 }]
};
const receipt = { schema: CONTROL_RECEIPT_SCHEMA, command_id: 'isolated-command', status: 'APPLIED', observed_at: new Date(now).toISOString() };
const ledger = count => ({ schema: STUDY_TIMER_SCHEMA, sessions: Array.from({ length: count }, (_, i) => ({
  id: 'session-' + i, subject: 'english', startedAt: now - (i + 1) * 60000, endedAt: now - i * 60000
})) });
const source = () => new MemoryStorage([
  [EXAM_PROFILE_KEY, JSON.stringify(emptyExamProfile())], [EXAM_CHAT_PLAN_KEY, JSON.stringify(plan)],
  [STUDY_TIMER_STATE_KEY, JSON.stringify(emptyStudyTimerState())], [STUDY_TIMER_LEDGER_KEY, JSON.stringify(ledger(1))],
  [STEWARD_REALITY_KEY, JSON.stringify(reality)], [CONTROL_LOCAL_RECEIPT_KEY, JSON.stringify(receipt)]
]);
const capture = storage => captureSharedControlCheckpoint(storage, { studyDay: day, now });
const wrap = (shared, subjects = {}) => buildPrivateLearnerCheckpoint({ studyDay: day, now, shared, subjects });
const restore = (storage, checkpoint) => restoreSharedControlFromPrivate(storage, {
  now, readCheckpoint: async () => ({ status: 'ready', checkpoint })
});
async function save(storage, previous = null, write = null) {
  let checkpoint;
  const result = await saveSharedControlToPrivate(storage, {
    now, readCheckpoint: async () => previous ? { status: 'ready', checkpoint: previous } : { status: 'missing' },
    writeCheckpoint: async (value, options) => {
      assert.equal(options.expectedCheckpoint, previous, 'remote compare-and-swap basis unchanged');
      if (write) await write(value);
      checkpoint = value;
    }
  });
  return { result, checkpoint };
}
const healthy = capture(source());
assert.deepEqual(healthy.capture_warnings, []);
const target = new MemoryStorage();
assert.deepEqual((await restore(target, wrap(healthy))).warnings, []);
assert.equal(target.getItem(CONTROL_LOCAL_RECEIPT_KEY), JSON.stringify(receipt));
assert.deepEqual(capture(target), healthy, 'healthy native roundtrip');
assert.equal((await save(target, wrap(healthy))).result.status, 'saved');

// Both malformed JSON and unsupported object schemas must remain opaque while
// independent native timer and Steward records survive capture AND recovery.
for (const [field, key, warning] of [
  ['chat_plan', EXAM_CHAT_PLAN_KEY, 'CHAT_PLAN'], ['exam_profile', EXAM_PROFILE_KEY, 'PROFILE'],
  ['study_timer_state', STUDY_TIMER_STATE_KEY, 'TIMER_STATE'], ['study_timer_ledger', STUDY_TIMER_LEDGER_KEY, 'TIMER_LEDGER'],
  ['steward_reality_raw', STEWARD_REALITY_KEY, 'STEWARD_REALITY'], ['control_receipt_raw', CONTROL_LOCAL_RECEIPT_KEY, 'RECEIPT']
]) {
  for (const raw of [' {broken bytes ', '{ "schema": "unsupported.v0", "keep": [1,2] }']) {
    const local = source(); local.setItem(key, raw);
    const shared = capture(local);
    assert.equal(shared[field], raw, field + ' preserves exact corrupt bytes');
    assert.ok(shared.capture_warnings.some(w => w.includes(warning + '_INVALID')));
    const { result, checkpoint } = await save(local);
    assert.equal(result.status, 'partial');
    assert.equal(checkpoint.payload.shared[field], raw);
    assert.equal(local.getItem(key), raw, 'capture never repairs local bytes');
    assert.equal(local.getItem(PRIVATE_CHECKPOINT_BASE_KEY), null);
    const restored = new MemoryStorage();
    const recovery = await restore(restored, checkpoint);
    assert.ok(recovery.warnings.some(w => w.includes(warning + '_INVALID')));
    assert.equal(restored.getItem(key), null, 'unsupported field fails closed for its own action');
    assert.equal(restored.getItem(CONTROL_LOCAL_RECEIPT_KEY), null, 'partial native evidence cannot admit receipt');
    assert.equal(restored.getItem(PRIVATE_CHECKPOINT_BASE_KEY), null);
    if (key !== STUDY_TIMER_LEDGER_KEY) assert.equal(readStudyTimerLedger(restored).sessions.length, 1);
    if (key !== STEWARD_REALITY_KEY) assert.equal(restored.getItem(STEWARD_REALITY_KEY), JSON.stringify(reality));
    assert.equal(checkpoint.payload.shared[field], raw, 'restore does not mutate durable bytes');
  }
}

// Regression of the two original native-function failures, including previous
// object-shaped corrupt checkpoints (before opaque capture strings existed).
for (const field of ['chat_plan', 'exam_profile']) {
  const damaged = { ...healthy, [field]: { schema: 'unsupported.v0', study_day: day, keep: 'original' } };
  const direct = new MemoryStorage();
  const directResult = restoreSharedControlCheckpoint(direct, damaged, { restoreReceipt: true });
  assert.ok(directResult.warnings.length);
  assert.equal(readStudyTimerLedger(direct).sessions.length, 1);
  assert.equal(direct.getItem(STEWARD_REALITY_KEY), JSON.stringify(reality));
  assert.equal(direct.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);
  const previous = wrap(damaged), local = new MemoryStorage();
  local.setItem(PRIVATE_CHECKPOINT_BASE_KEY, previous.checkpoint_id);
  local.setItem(STUDY_TIMER_LEDGER_KEY, JSON.stringify(ledger(2)));
  const { checkpoint, result } = await save(local, previous);
  assert.equal(result.status, 'partial');
  assert.deepEqual(checkpoint.payload.shared[field], damaged[field]);
  assert.equal(checkpoint.payload.shared.study_timer_ledger.sessions.length, 2, 'fresh authorized time reaches durable backup');
  assert.equal(checkpoint.payload.shared.steward_reality_raw, healthy.steward_reality_raw);
  const lineage = JSON.parse(local.getItem(PRIVATE_CHECKPOINT_LINEAGE_KEY));
  assert.equal(lineage.groups.shared, undefined, 'partial group gains no overwrite authority');

  const unauthorized = new MemoryStorage([[STUDY_TIMER_LEDGER_KEY, JSON.stringify(ledger(2))]]);
  const denied = await save(unauthorized, previous);
  assert.match(denied.result.warnings.join(' '), /PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT/);
  assert.deepEqual(denied.checkpoint.payload.shared[field], damaged[field]);
  assert.equal(denied.checkpoint.payload.shared.study_timer_ledger.sessions.length, 1);
  const replacedBadField = source(); replacedBadField.removeItem(STUDY_TIMER_LEDGER_KEY);
  assert.match((await save(replacedBadField, previous)).result.warnings.join(' '), /PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT/,
    'invalid previous fields still participate in concurrency guard');
}

// Missing timer source is partial, not an empty valid native record; a stale
// unsupported plan must not disappear merely because the day has changed.
for (const field of ['study_timer_state', 'study_timer_ledger']) {
  const incomplete = { ...healthy }; delete incomplete[field];
  const local = new MemoryStorage();
  assert.ok((await restore(local, wrap(incomplete))).warnings.length);
  assert.equal(local.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);
  assert.equal(local.getItem(STEWARD_REALITY_KEY), healthy.steward_reality_raw);
  const backup = await save(new MemoryStorage(), wrap(incomplete));
  assert.equal(backup.result.status, 'partial');
  assert.equal(backup.checkpoint.payload.shared[field], undefined, 'missing durable source is not manufactured as empty');
}

const oldBroken = { ...healthy, study_day: '2026-09-18', chat_plan: { schema: 'unsupported.v0', study_day: '2026-09-18' } };
const oldTarget = new MemoryStorage();
assert.ok((await restore(oldTarget, wrap(oldBroken))).warnings.some(w => w.includes('CHAT_PLAN_INVALID')));
assert.equal(readStudyTimerLedger(oldTarget).sessions.length, 1);
assert.equal(oldTarget.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);
const oldBackup = await save(new MemoryStorage(), wrap(oldBroken));
assert.deepEqual(oldBackup.checkpoint.payload.shared.chat_plan, oldBroken.chat_plan);
assert.equal(oldBackup.result.status, 'partial');
const bothBroken = source();
bothBroken.setItem(EXAM_PROFILE_KEY, '{profile'); bothBroken.setItem(EXAM_CHAT_PLAN_KEY, '{plan');
const bothBackup = await save(bothBroken);
const bothTarget = new MemoryStorage();
await restore(bothTarget, bothBackup.checkpoint);
assert.equal(readStudyTimerLedger(bothTarget).sessions.length, 1);
assert.equal(bothTarget.getItem(STEWARD_REALITY_KEY), healthy.steward_reality_raw);
assert.equal(bothTarget.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);

// Healthy local records, including revisions/tombstones, never get replaced by
// older checkpoint data; a conflict or corrupt native subject withholds receipt.
const newer = source(); newer.removeItem(CONTROL_LOCAL_RECEIPT_KEY);
newer.setItem(STUDY_TIMER_LEDGER_KEY, JSON.stringify(ledger(2)));
const tombstone = { ...reality, generation: 2, events: [{ ...reality.events[0], revision: 2, deletedAt: now + 1 }] };
newer.setItem(STEWARD_REALITY_KEY, JSON.stringify(tombstone));
const beforeNewer = [...newer.map];
assert.ok((await restore(newer, wrap(healthy))).warnings.length);
assert.deepEqual([...newer.map], beforeNewer);
restoreSharedControlCheckpoint(newer, healthy);
assert.deepEqual([...newer.map], beforeNewer, 'direct restore also preserves healthy local records');
for (const checkpoint of [
  wrap(healthy, { lexical: { schema: 'unsupported.v0', entries: {} } }),
  wrap({ ...healthy, capture_warnings: ['checkpoint:lexical:FAILED_NATIVE_CAPTURE'] })
]) {
  const local = new MemoryStorage();
  assert.ok((await restore(local, checkpoint)).warnings.length);
  assert.equal(local.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);
  assert.equal(readStudyTimerLedger(local).sessions.length, 1);
}
const corruptDestination = new MemoryStorage([[EXAM_PROFILE_KEY, '{bad-local-profile']]);
restoreSharedControlCheckpoint(corruptDestination, healthy, { restoreReceipt: true });
assert.equal(corruptDestination.getItem(CONTROL_LOCAL_RECEIPT_KEY), null);
assert.equal(corruptDestination.getItem(EXAM_PROFILE_KEY), '{bad-local-profile');

// Actual native storage transaction failures roll back the whole admitted
// write-set, including the receipt; a remote write failure grants no lineage.
for (const key of [STUDY_TIMER_LEDGER_KEY, STEWARD_REALITY_KEY, CONTROL_LOCAL_RECEIPT_KEY]) {
  for (const direct of [true, false]) {
    const local = new MemoryStorage([['unrelated', 'preserved']]);
    const before = [...local.map];
    const original = local.setItem.bind(local); let armed = true;
    local.setItem = (k, raw) => { if (armed && k === key) { armed = false; throw Error('injected storage failure'); } original(k, raw); };
    if (direct) assert.throws(() => restoreSharedControlCheckpoint(local, healthy, { restoreReceipt: true }), /injected storage failure/);
    else await assert.rejects(restore(local, wrap(healthy)), /injected storage failure/);
    assert.deepEqual([...local.map], before, 'atomic rollback includes all earlier fields');
  }
}
const unsaved = source(), unsavedBefore = [...unsaved.map];
await assert.rejects(save(unsaved, null, async () => { throw Error('durable write failed'); }), /durable write failed/);
assert.deepEqual([...unsaved.map], unsavedBefore);
console.log('PASS shared checkpoint isolation: native capture/restore, opaque bytes, fresh authorized backup, fail-closed receipts, concurrency, tombstones, atomic failure, healthy roundtrip');
