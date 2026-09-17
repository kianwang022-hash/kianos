import assert from 'node:assert/strict';
import { emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
import { buildExamStudyTimeOverlay } from '../src/lib/examStudyTime.mjs';
import { pauseStudyTimer, setStudyTimerContext } from '../src/lib/studyTimer.mjs';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const day = '2026-09-17';
const start = Date.parse('2026-09-17T01:00:00Z');
const storage = new MemoryStorage();
const xizong = { subject: 'xizong', route: 'xizong/circulation/b01', detailKey: 'circulation/b01', detailLabel: 'A1 B01' };
const english = { subject: 'english', route: 'reading/2025-01', detailKey: 'reading', detailLabel: 'Reading A' };

setStudyTimerContext(storage, xizong, start);
setStudyTimerContext(storage, english, start + 90 * 60_000);
pauseStudyTimer(storage, start + 150 * 60_000);

const profile = emptyExamProfile();
profile.observations.push(
  { id: 'legacy-x', day, subject: 'xizong', minutes: 60, confirmed: true },
  { id: 'legacy-e', day, subject: 'english', minutes: 80, confirmed: true },
  { id: 'legacy-p', day, subject: 'politics', minutes: 45, confirmed: true },
  { id: 'yesterday-p', day: '2026-09-16', subject: 'politics', minutes: 70, confirmed: true }
);

const overlay = buildExamStudyTimeOverlay(storage, profile, day, start + 150 * 60_000);
assert.deepEqual(overlay.timerBySubject, { xizong: 90, english: 60, politics: 0 });
assert.deepEqual(overlay.manualBySubject, { xizong: 60, english: 80, politics: 45 });
assert.deepEqual(overlay.effectiveBySubject, { xizong: 90, english: 80, politics: 45 });
assert.equal(overlay.effectiveTotal, 215, 'Timer/manual compatibility must not double count overlapping same-day subject time.');
assert.equal(overlay.sourceBySubject.xizong, 'timer');
assert.equal(overlay.sourceBySubject.english, 'manual');
assert.equal(overlay.sourceBySubject.politics, 'manual');

const today = overlay.profile.observations.filter((observation) => observation.day === day);
assert.equal(today.length, 3);
assert.equal(today.find((observation) => observation.subject === 'xizong')?.minutes, 90);
assert.equal(today.find((observation) => observation.subject === 'english')?.minutes, 80);
assert.equal(today.find((observation) => observation.subject === 'politics')?.minutes, 45);
assert.ok(overlay.profile.observations.some((observation) => observation.id === 'yesterday-p'), 'Historical manual evidence must remain untouched.');
assert.equal(profile.observations.find((observation) => observation.id === 'legacy-x')?.minutes, 60, 'Overlay must not mutate the stored profile.');

console.log('PASS timer -> exam orchestrator time overlay');
