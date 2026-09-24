import assert from 'node:assert/strict';
import {
  STEWARD_REALITY_KEY,
  beginStewardBreak,
  buildStewardRealityDailySummary,
  endLatestStewardBreak,
  readStewardReality,
  recordStewardBreakReentry,
  updateStewardBreak
} from '../src/lib/stewardReality.mjs';

class MemoryStorage {
  constructor(rows = {}) { this.map = new Map(Object.entries(rows)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const storage = new MemoryStorage();
const start = Date.parse('2026-09-25T09:00:00+08:00');
const event = beginStewardBreak(storage, {
  startedAt: start,
  preBreakContext: {
    subject: 'xizong',
    route: 'xizong/circulation/b02',
    detailKey: 'circulation/b02',
    detailLabel: '循环 B02'
  }
});
assert.equal(event.endedAt, null);
assert.equal(event.reentry, null);

const detailed = updateStewardBreak(storage, event.id, {
  plannedRestMinutes: 10,
  methods: ['walk', 'eyes_closed'],
  customMethod: '阳台吹风',
  note: '有点困，先离开屏幕'
});
assert.equal(detailed.plannedRestMinutes, 10);
assert.deepEqual(detailed.methods, ['walk', 'eyes_closed']);
assert.equal(detailed.note, '有点困，先离开屏幕');

const ended = endLatestStewardBreak(storage, start + 12 * 60_000);
assert.equal(ended.endedAt, start + 12 * 60_000);
assert.equal(readStewardReality(storage).events.length, 1);

const reentered = recordStewardBreakReentry(storage, event.id, {
  status: 'PARTIAL',
  note: '清醒些了，但还没完全恢复',
  at: start + 13 * 60_000
});
assert.equal(reentered.reentry.status, 'PARTIAL');

const summary = buildStewardRealityDailySummary(storage, { day: '2026-09-25' });
assert.equal(summary.breaks.length, 1);
assert.equal(summary.breaks[0].observed_minutes, 12);
assert.equal(summary.breaks[0].planned_rest_minutes, 10);
assert.deepEqual(summary.breaks[0].methods, ['walk', 'eyes_closed']);
assert.equal(summary.breaks[0].reentry.status, 'PARTIAL');
assert.equal(Object.hasOwn(summary, 'readiness'), false);
assert.equal(JSON.stringify(summary).includes('recovery_score'), false);
assert.equal(JSON.stringify(summary).includes('debt'), false);

const malformed = new MemoryStorage({ [STEWARD_REALITY_KEY]: '{broken' });
const original = malformed.getItem(STEWARD_REALITY_KEY);
assert.equal(readStewardReality(malformed).unavailable, 'STEWARD_REALITY_INVALID');
const unavailable = buildStewardRealityDailySummary(malformed, { day: '2026-09-25' });
assert.equal(unavailable.breaks, null);
assert.equal(unavailable.error, 'STEWARD_REALITY_UNAVAILABLE');
assert.throws(() => beginStewardBreak(malformed, { startedAt: start }), /STEWARD_REALITY_INVALID/);
assert.equal(malformed.getItem(STEWARD_REALITY_KEY), original, 'malformed reality bytes must remain untouched');

console.log('PASS Steward reality: break/re-entry facts, no readiness score, malformed fail-closed');
