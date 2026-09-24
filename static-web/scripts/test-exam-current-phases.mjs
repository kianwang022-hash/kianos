import assert from 'node:assert/strict';
import { GATES, resolveExamPhase } from '../src/lib/examOrchestrator.mjs';

const hardCheckpoints = GATES.filter((gate) => gate.kind === 'hard_checkpoint').map((gate) => gate.date);
assert.deepEqual(hardCheckpoints, ['2026-10-20', '2026-11-15']);
assert.equal(GATES.at(-1).date, '2026-12-20');
assert.equal(GATES.at(-1).kind, 'exam');

for (const [day, phase] of [
  ['2026-09-17', 'A'], ['2026-09-27', 'A'], ['2026-09-28', 'B'],
  ['2026-10-20', 'B'], ['2026-10-21', 'C'], ['2026-11-15', 'C'],
  ['2026-11-16', 'D'], ['2026-12-05', 'E'], ['2026-12-20', 'E']
]) assert.equal(resolveExamPhase(day).id, phase, day);

console.log('PASS current exam phase and mandatory Gate projection');
