import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  PRIVATE_CHECKPOINT_SCHEMA,
  readPrivateLearnerCheckpoint as readFileCheckpoint,
  writePrivateLearnerCheckpoint as writeFileCheckpoint
} from './privateLearnerStore.mjs';
import {
  buildPrivateLearnerCheckpoint,
  readPrivateLearnerCheckpoint as readRemoteCheckpoint,
  writePrivateLearnerCheckpoint as writeRemoteCheckpoint
} from '../src/lib/privateLearnerCheckpoint.mjs';
import {
  captureSharedControlCheckpoint,
  restoreSharedControlCheckpoint,
  SHARED_CONTROL_CHECKPOINT_SCHEMA
} from '../src/lib/sharedControlCheckpoint.mjs';
import {
  restoreSharedControlFromPrivate,
  saveSharedControlToPrivate,
  sharedControlStorageIsEmpty
} from '../src/lib/privateCheckpointRuntime.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  EXAM_CHAT_PLAN_SCHEMA
} from '../src/lib/examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY,
  emptyExamProfile
} from '../src/lib/examOrchestrator.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const day = '2026-09-19';
const now = Date.parse('2026-09-19T01:00:00Z');
const profile = emptyExamProfile();
const chatPlan = {
  schema: EXAM_CHAT_PLAN_SCHEMA,
  study_day: day,
  generated_at: new Date(now).toISOString(),
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: 'continue current block' },
    english: { target_minutes: 120, role: '保连续' },
    politics: { target_minutes: 90, role: '稳推进' }
  },
  next_subject: 'xizong',
  attention: { text: '先继续西综。', action: '查看依据' }
};
const timerState = {
  schema: STUDY_TIMER_SCHEMA,
  running: false,
  manualPaused: true,
  subject: 'xizong',
  context: { subject: 'xizong', route: 'xizong/a1/', detailKey: 'A1/B03', detailLabel: 'A1 B03' },
  segmentStartedAt: null,
  lastSeenAt: now,
  revision: 1,
  updatedAt: now
};
const timerLedger = {
  schema: STUDY_TIMER_SCHEMA,
  sessions: [{
    id: 's1',
    subject: 'xizong',
    context: timerState.context,
    startedAt: now - 3600000,
    endedAt: now,
    source: 'timer'
  }]
};

const source = new MemoryStorage({
  [EXAM_PROFILE_KEY]: JSON.stringify(profile),
  [EXAM_CHAT_PLAN_KEY]: JSON.stringify(chatPlan),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify(timerLedger)
});

const shared = captureSharedControlCheckpoint(source, { studyDay: day, now });
assert.equal(shared.schema, SHARED_CONTROL_CHECKPOINT_SCHEMA);
assert.equal(shared.chat_plan.next_subject, 'xizong');
assert.equal(shared.study_timer_ledger.sessions.length, 1);

const checkpoint = buildPrivateLearnerCheckpoint({
  studyDay: day,
  now,
  shared,
  subjects: {}
});
assert.equal(checkpoint.schema, PRIVATE_CHECKPOINT_SCHEMA);
assert.equal(checkpoint.study_day, day);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-private-checkpoint-'));
try {
  const saved = writeFileCheckpoint(checkpoint, dir);
  const loaded = readFileCheckpoint(dir);
  assert.equal(saved.checkpoint_id, loaded.checkpoint_id);
  assert.equal(loaded.payload.shared.schema, SHARED_CONTROL_CHECKPOINT_SCHEMA);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

let remoteSaved = null;
const fakeFetch = async (_url, options = {}) => {
  if (options.method === 'PUT') {
    remoteSaved = JSON.parse(options.body);
    return new Response(JSON.stringify({ status: 'saved', checkpoint_id: remoteSaved.checkpoint_id }), { status: 200 });
  }
  if (!remoteSaved) return new Response(JSON.stringify({ status: 'missing' }), { status: 404 });
  return new Response(JSON.stringify({ status: 'ready', checkpoint: remoteSaved }), { status: 200 });
};
await writeRemoteCheckpoint(checkpoint, { fetchImpl: fakeFetch });
const remoteRead = await readRemoteCheckpoint({ fetchImpl: fakeFetch });
assert.equal(remoteRead.status, 'ready');
assert.equal(remoteRead.checkpoint.payload.shared.chat_plan.next_subject, 'xizong');

const target = new MemoryStorage();
restoreSharedControlCheckpoint(target, remoteRead.checkpoint.payload.shared, { expectedDay: day });
assert.equal(JSON.parse(target.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');
assert.equal(JSON.parse(target.getItem(STUDY_TIMER_LEDGER_KEY)).sessions.length, 1);

const staleStorage = new MemoryStorage({
  [EXAM_CHAT_PLAN_KEY]: JSON.stringify({ ...chatPlan, study_day: '2026-09-18' }),
  [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify(timerLedger)
});
const staleShared = captureSharedControlCheckpoint(staleStorage, { studyDay: day, now });
assert.equal(staleShared.chat_plan, null, 'stale Chat plan must not be promoted into durable checkpoint');

assert.throws(() => writeFileCheckpoint({ ...checkpoint, schema: 'wrong' }, os.tmpdir()), /SCHEMA_INVALID/);

const empty = new MemoryStorage();
assert.equal(sharedControlStorageIsEmpty(empty), true);
const restoredRuntime = await restoreSharedControlFromPrivate(empty, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint })
});
assert.equal(restoredRuntime.status, 'restored');
assert.equal(JSON.parse(empty.getItem(EXAM_CHAT_PLAN_KEY)).next_subject, 'xizong');

const present = new MemoryStorage({ [STUDY_TIMER_STATE_KEY]: JSON.stringify(timerState) });
const skippedRuntime = await restoreSharedControlFromPrivate(present, {
  now,
  readCheckpoint: async () => { throw new Error('must not read private checkpoint when local shared state exists'); }
});
assert.equal(skippedRuntime.status, 'skipped');

const yesterdayCheckpoint = buildPrivateLearnerCheckpoint({
  studyDay: '2026-09-18',
  now: now - 86400000,
  shared: {
    ...shared,
    study_day: '2026-09-18',
    chat_plan: { ...chatPlan, study_day: '2026-09-18', generated_at: new Date(now - 86400000).toISOString() }
  },
  subjects: { xizong: { schema: 'future.subject.payload.v1', keep: true } }
});
const nextDay = new MemoryStorage();
const crossDay = await restoreSharedControlFromPrivate(nextDay, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: yesterdayCheckpoint })
});
assert.equal(crossDay.status, 'restored');
assert.equal(nextDay.getItem(EXAM_CHAT_PLAN_KEY), null, 'previous-day Chat plan must not revive');
assert.equal(JSON.parse(nextDay.getItem(STUDY_TIMER_LEDGER_KEY)).sessions.length, 1, 'durable timer history survives day boundary');

let writtenCheckpoint = null;
await saveSharedControlToPrivate(source, {
  now,
  readCheckpoint: async () => ({ status: 'ready', checkpoint: yesterdayCheckpoint }),
  writeCheckpoint: async (value) => { writtenCheckpoint = value; return { status: 'saved' }; }
});
assert.equal(writtenCheckpoint.payload.subjects.xizong.keep, true, 'shared autosave must preserve future subject-owned payloads');

console.log('PASS private learner checkpoint foundation: external durable store + shared control capture/restore + safe autosave');
