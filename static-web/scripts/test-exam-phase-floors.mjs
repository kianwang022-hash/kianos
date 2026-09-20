import assert from 'node:assert/strict';
import { GATES, buildExamPlan, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';

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


const hardCheckpoints = GATES
  .filter((gate) => gate.kind === 'hard_checkpoint')
  .map((gate) => gate.date);
assert.deepEqual(hardCheckpoints, ['2026-10-20', '2026-11-15'],
  '10/20 and 11/15 must remain the two mandatory strategic hard checkpoints before the exam.');
assert.equal(GATES.at(-1).date, '2026-12-20');
assert.equal(GATES.at(-1).kind, 'exam');

const hardGate1 = planFor('2026-10-20', 600);
assert.equal(hardGate1.phase.id, 'B');
assert.equal(hardGate1.gate.date, '2026-10-20',
  '10/20 must resolve to the first mandatory hard checkpoint, not a retired 10/21 gate.');

const afterHardGate1 = planFor('2026-10-21', 600);
assert.equal(afterHardGate1.phase.id, 'C');
assert.equal(afterHardGate1.gate.date, '2026-11-15',
  'after 10/20 the next mandatory strategic checkpoint is 11/15.');

console.log('PASS mandatory strategic checkpoints: 10/20, 11/15, 12/20');
