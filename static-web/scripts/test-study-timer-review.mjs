import assert from 'node:assert/strict';
import { aggregateStudyTime, readStudyTimerState, setStudyTimerContext } from '../src/lib/studyTimer.mjs';
import { captureStudyTimerRuntimeGap, readPendingStudyTimerReviews, resolveStudyTimerReview } from '../src/lib/studyTimerReview.mjs';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const storage = new MemoryStorage();
const context = { subject: 'xizong', route: 'xizong/circulation/b01', detailKey: 'circulation/b01', detailLabel: 'A1 B01' };
const start = Date.parse('2026-09-17T01:00:00Z');
setStudyTimerContext(storage, context, start);

// Simulate one trustworthy heartbeat at +20m, followed by a runtime-dead 2h gap.
let state = readStudyTimerState(storage);
state.lastSeenAt = start + 20 * 60_000;
storage.setItem('kianos-study-timer-state-v2', JSON.stringify(state));
const returnAt = start + 140 * 60_000;
const review = captureStudyTimerRuntimeGap(storage, returnAt);
assert.ok(review);
assert.equal(review.kind, 'runtime_gap');
assert.equal(review.minutes, 120);
assert.equal(readPendingStudyTimerReviews(storage).length, 1);
assert.equal(readStudyTimerState(storage).running, true, 'Gap isolation must continue timing after return.');
assert.equal(readStudyTimerState(storage).segmentStartedAt, returnAt, 'New active segment starts at return, not at the old heartbeat.');

// Pending gap is not silently counted. Only the trusted 20m survives until review.
const before = aggregateStudyTime(storage, { day: '2026-09-17', now: returnAt });
assert.equal(Math.round(before.bySubject.xizong.ms / 60000), 20);

resolveStudyTimerReview(storage, review.id, { action: 'keep' });
assert.equal(readPendingStudyTimerReviews(storage).length, 0);
const kept = aggregateStudyTime(storage, { day: '2026-09-17', now: returnAt });
assert.equal(Math.round(kept.bySubject.xizong.ms / 60000), 140, 'Keep restores the isolated gap as counted time.');

// Reclassification restores a pending gap under another subject without changing the trusted time.
const second = new MemoryStorage();
setStudyTimerContext(second, context, start);
state = readStudyTimerState(second);
state.lastSeenAt = start + 10 * 60_000;
second.setItem('kianos-study-timer-state-v2', JSON.stringify(state));
const secondReturn = start + 70 * 60_000;
const review2 = captureStudyTimerRuntimeGap(second, secondReturn);
resolveStudyTimerReview(second, review2.id, { action: 'reclassify', subject: 'english' });
const reclassified = aggregateStudyTime(second, { day: '2026-09-17', now: secondReturn });
assert.equal(Math.round(reclassified.bySubject.xizong.ms / 60000), 10);
assert.equal(Math.round(reclassified.bySubject.english.ms / 60000), 60);

console.log('PASS study timer runtime-gap review');
