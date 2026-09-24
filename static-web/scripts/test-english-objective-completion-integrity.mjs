import assert from 'node:assert/strict';
import test from 'node:test';
import * as L from '../src/lib/englishLearnerEvidence.mjs';
import * as S from '../src/lib/englishSessionControl.mjs';

const day = '2026-09-22';
const clone = value => JSON.parse(JSON.stringify(value));

class Storage {
  constructor(rows = {}) { this.map = new Map(Object.entries(rows)); }
  get length() { return this.map.size; }
  key(i) { return [...this.map.keys()][i] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, raw) { this.map.set(key, String(raw)); }
  removeItem(key) { this.map.delete(key); }
}

for (const task of ['reading_a', 'cloze', 'reading_b']) test(`${task}: malformed or incomplete results never complete the task`, () => {
  const prefix = {
    reading_a: 'kianos-reading-attempt-v1:',
    cloze: 'kianos-cloze-attempt-v1:',
    reading_b: 'kianos-reading-b-attempt-v1:'
  }[task];
  const step = { task, object_id: 'objective-fixture', source_hash: 'source-v1' };
  const healthy = {
    submitted: true,
    answers: { q1: 'A', q2: 'B' },
    results: { q1: 'correct', q2: 'wrong' },
    uncertain: [],
    binding: {
      task, object_id: step.object_id, source_hash: step.source_hash, attempt_id: 'attempt-1',
      source_snapshot: { questions: [{ id: 'q1' }, { id: 'q2' }] }
    }
  };
  const storage = new Storage();
  const key = prefix + step.object_id;
  for (const results of [undefined, null, {}, [], { q1: 'correct' }, { q1: 'correct', other: 'correct' }, { q1: 'correct', q2: 'invented' }]) {
    const bad = { ...clone(healthy), results, reviewResolved: true };
    if (results === undefined) delete bad.results;
    storage.setItem(key, JSON.stringify(bad));
    const before = storage.getItem(key);
    assert.equal(S.englishStepIsComplete(storage, step), false);
    assert.equal(L.inspectEnglishObjectiveResults(bad).problem_count, null);
    assert.equal(L.exportEnglishCheckpoint(storage).native_integrity.status, 'corrupt-retained');
    assert.equal(storage.getItem(key), before);
  }
  storage.setItem(key, JSON.stringify(healthy));
  assert.equal(S.englishStepIsComplete(storage, step), false);
  healthy.reviewResolved = true;
  storage.setItem(key, JSON.stringify(healthy));
  assert.equal(S.englishStepIsComplete(storage, step), true);
  healthy.reviewResolved = false;
  healthy.results.q2 = 'correct';
  storage.setItem(key, JSON.stringify(healthy));
  assert.equal(S.englishStepIsComplete(storage, step), true);
  healthy.results = { q1: 'unanswered', q2: 'unanswered' };
  healthy.answers = {};
  storage.setItem(key, JSON.stringify(healthy));
  assert.equal(L.inspectEnglishObjectiveResults(healthy).valid, true);
  assert.equal(S.englishStepIsComplete(storage, step), false);
});

test('Resume retains an incomplete objective instead of jumping to the next step', () => {
  const step = { task: 'cloze', object_id: 'incomplete', source_hash: 'v1' };
  const storage = new Storage({
    'kianos-cloze-attempt-v1:incomplete': JSON.stringify({ submitted: true, answers: { q1: 'A' }, binding: { source_hash: 'v1' } })
  });
  const instruction = { current_step: 0, study_day: day, steps: [step, { task: 'translation', object_id: 'next', source_hash: 'v1' }] };
  assert.equal(S.resolveEnglishSessionStep(storage, instruction, instruction.steps).index, 0);
});
