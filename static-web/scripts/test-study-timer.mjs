import assert from 'node:assert/strict';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_STATE_KEY,
  aggregateStudyTime,
  buildDailyStudyTimePacket,
  buildStudyTimerReviewCandidates,
  editStudySession,
  pauseStudyTimer,
  readStudyTimerLedger,
  readStudyTimerState,
  resolveStudyTimerContext,
  resumeStudyTimer,
  setStudyTimerContext,
  studyDayAt
} from '../src/lib/studyTimer.mjs';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const base = '/kianos/';
assert.equal(resolveStudyTimerContext('/kianos/', base), null, 'Home must not become a study subject.');
assert.equal(resolveStudyTimerContext('/kianos/current/', base), null, 'Current must not become a study subject.');
assert.equal(resolveStudyTimerContext('/kianos/xizong/circulation/b01/', base)?.subject, 'xizong');
assert.equal(resolveStudyTimerContext('/kianos/politics/marxism/c01/', base)?.subject, 'politics');
assert.deepEqual(
  { subject: resolveStudyTimerContext('/kianos/reading/2025-01/', base)?.subject, detail: resolveStudyTimerContext('/kianos/reading/2025-01/', base)?.detailKey },
  { subject: 'english', detail: 'objective' }
);
assert.equal(resolveStudyTimerContext('/kianos/vocabulary/42/', base)?.subject, 'english');
assert.equal(resolveStudyTimerContext('/kianos/lexical/', base)?.subject, 'english', 'Legacy lexical route still belongs to English time.');

const storage = new MemoryStorage();
const x = { subject: 'xizong', route: 'xizong/circulation/b01', detailKey: 'circulation/b01', detailLabel: 'A1 B01' };
const p = { subject: 'politics', route: 'politics/marxism/c01', detailKey: 'marxism/c01', detailLabel: 'Marx C01' };
const e = { subject: 'english', route: 'reading/2025-01', detailKey: 'reading', detailLabel: 'Reading A' };
const t0 = Date.parse('2026-09-17T01:00:00Z');

let state = setStudyTimerContext(storage, x, t0);
assert.equal(state.running, true, 'First recognized subject route auto-starts the timer.');
assert.equal(state.subject, 'xizong');

state = setStudyTimerContext(storage, p, t0 + 30 * 60_000);
assert.equal(state.subject, 'politics');
let ledger = readStudyTimerLedger(storage);
assert.equal(ledger.sessions.length, 1);
assert.equal(ledger.sessions[0].subject, 'xizong');
assert.equal(ledger.sessions[0].endedAt - ledger.sessions[0].startedAt, 30 * 60_000);

state = pauseStudyTimer(storage, t0 + 50 * 60_000);
assert.equal(state.running, false);
assert.equal(state.manualPaused, true);
ledger = readStudyTimerLedger(storage);
assert.equal(ledger.sessions.length, 2);
assert.equal(ledger.sessions[1].subject, 'politics');

// Moving into another subject while manually paused must not silently resume.
state = setStudyTimerContext(storage, e, t0 + 60 * 60_000);
assert.equal(state.running, false);
assert.equal(state.subject, 'english');
state = resumeStudyTimer(storage, e, t0 + 65 * 60_000);
assert.equal(state.running, true);
assert.equal(state.manualPaused, false);

// A single continuous session crossing China-study midnight is split by day at read time.
const midnightStorage = new MemoryStorage();
const crossStart = Date.parse('2026-09-17T15:30:00Z'); // 23:30 Asia/Shanghai
const crossEnd = Date.parse('2026-09-17T16:30:00Z');   // 00:30 next day
setStudyTimerContext(midnightStorage, x, crossStart);
pauseStudyTimer(midnightStorage, crossEnd);
assert.equal(studyDayAt(crossStart), '2026-09-17');
assert.equal(studyDayAt(crossEnd), '2026-09-18');
const d17 = aggregateStudyTime(midnightStorage, { day: '2026-09-17', now: crossEnd });
const d18 = aggregateStudyTime(midnightStorage, { day: '2026-09-18', now: crossEnd });
assert.equal(Math.round(d17.bySubject.xizong.ms / 60_000), 30);
assert.equal(Math.round(d18.bySubject.xizong.ms / 60_000), 30);

const packet = buildDailyStudyTimePacket(midnightStorage, { day: '2026-09-17', now: crossEnd });
assert.equal(packet.schema, 'kianos.study-time-packet.v1');
assert.equal(packet.subjects.xizong.minutes, 30);
assert.equal(packet.total_minutes, 30);
assert.ok(packet.subjects.xizong.details.some((item) => item.detail === 'circulation/b01' && item.minutes === 30));

// Long/stale running time is reviewable, never auto-deleted or auto-paused.
const reviewStorage = new MemoryStorage();
setStudyTimerContext(reviewStorage, p, t0);
const review = buildStudyTimerReviewCandidates(reviewStorage, t0 + 7 * 60 * 60_000);
assert.ok(review.some((item) => item.kind === 'long_active'));
assert.ok(review.some((item) => item.kind === 'heartbeat_gap'));
assert.equal(readStudyTimerState(reviewStorage).running, true, 'Review candidate must not mutate timer state.');

// Forgotten-time correction edits the ledger instead of destroying history.
const editable = readStudyTimerLedger(midnightStorage).sessions[0];
const edited = editStudySession(midnightStorage, editable.id, { endedAt: editable.endedAt - 10 * 60_000 });
assert.equal(edited.edited, true);
assert.equal(Math.round((edited.endedAt - edited.startedAt) / 60_000), 50);

assert.ok(storage.getItem(STUDY_TIMER_STATE_KEY));
assert.ok(storage.getItem(STUDY_TIMER_LEDGER_KEY));
console.log('PASS shared study timer logic');
