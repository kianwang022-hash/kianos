import assert from 'node:assert/strict';
import { buildExamPlan, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';

function planFor(day, minutes, profileMutator = null) {
  const profile = emptyExamProfile();
  profile.defaultDailyMinutes = minutes;
  profileMutator?.(profile);
  return buildExamPlan({ day, profile, demands: {} });
}

const phaseA = planFor('2026-09-17', 600);
const a = Object.fromEntries(phaseA.rows.map((row) => [row.subject, row]));
assert.equal(phaseA.phase.id, 'A');
assert.equal(phaseA.provisional, false);
assert.ok(a.english.minutes >= 120, 'Phase A must protect the accepted English seed.');
assert.ok(a.politics.minutes >= 90, 'Phase A must protect the accepted Politics seed.');
assert.ok(a.xizong.minutes > a.english.minutes, 'Phase A remaining capacity should still main-push Xizong.');

const phaseB = planFor('2026-10-01', 600);
const bMinutes = phaseB.rows.map((row) => row.minutes);
assert.equal(phaseB.phase.id, 'B');
assert.equal(phaseB.provisional, true, 'Later phases without new floors must be explicitly provisional.');
assert.ok(Math.max(...bMinutes) - Math.min(...bMinutes) <= 5,
  'Phase B without evidence/new floors must not silently inherit Phase-A 120/90 seeds.');

const phaseBExplicit = planFor('2026-10-01', 600, (profile) => {
  profile.floorMinutes = { xizong: 180, english: 120, politics: 60 };
});
const explicit = Object.fromEntries(phaseBExplicit.rows.map((row) => [row.subject, row]));
assert.equal(phaseBExplicit.provisional, false);
assert.ok(explicit.xizong.minutes >= 180);
assert.ok(explicit.english.minutes >= 120);
assert.ok(explicit.politics.minutes >= 60);

console.log('PASS exam phase-bound floor policy');
