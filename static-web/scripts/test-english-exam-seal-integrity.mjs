// Regression for F0-02. Synthetic papers and disposable storage only.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as E from '../src/lib/englishExamSession.mjs';

const copy = value => JSON.parse(JSON.stringify(value));
const now = Date.parse('2026-09-22T01:00:00Z');
const definitions = [['cloze',20], ['reading_a',5], ['reading_a',5],
  ['reading_a',5], ['reading_a',5], ['reading_b',5], ['translation',5],
  ['writing',0,'small'], ['writing',0,'big']];
const paper = {
  schema: 'kianos.english.exam-paper.v1', paper_id: 'seal-integrity-paper',
  source_hash: 'synthetic-paper-v1', year: 2025, duration_minutes: 180,
  total_points: 100, objective_max_points: 60, productive_max_points: 40,
  default_task_order: ['cloze','reading_a','reading_b','translation','writing'],
  steps: definitions.map(([task,count,kind], index) => ({
    step_id: `step-${index}`, task, object_id: `synthetic-${index}`,
    source_hash: `synthetic-source-${index}`, max_points: kind === 'big' ? 20 : 10,
    ...(kind ? {writing_kind: kind} : {}),
    question_ids: Array.from({length: count}, (_, q) => `q-${index}-${q}`)
  }))
};
class MemoryStorage {
  constructor(entries = []) { this.map = new Map(entries); this.failKey = null; }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.get(key) ?? null; }
  setItem(key, value) {
    if (key === this.failKey) throw new Error('SYNTHETIC_WRITE_DENIED');
    this.map.set(key, String(value));
  }
  removeItem(key) { this.map.delete(key); }
  snapshot() { return [...this.map].sort(([a],[b]) => a.localeCompare(b)); }
}
const answers = step => Object.fromEntries(step.question_ids.map(id =>
  [id, step.task === 'translation' ? 'Synthetic translation' : 'A']));
const keyFor = (state, step) => E.englishExamTaskStorageKey(state.session_id, step.task, step.object_id);
const outputField = step => step.task === 'writing' ? 'draftEssay'
  : step.task === 'translation' ? 'drafts' : 'answers';
function fixture() {
  let state = E.startEnglishExamSession(paper, {now, sessionId: 'seal-integrity-session'});
  const storage = new MemoryStorage([['unrelated-healthy-sibling', 'preserve']]);
  for (const [index, step] of state.steps.entries()) {
    const common = {source_hash: step.source_hash, prior_exposure: 'unseen',
      assistance: 'unassisted', source_kind: 'synthetic'};
    const payload = {...common, ...(step.task === 'writing'
      ? {essay: 'Synthetic essay', first_draft: ''}
      : {answers: answers(step), ...(step.task === 'translation' ? {first_attempts: {}} : {})})};
    state = E.captureEnglishExamStep(state, {stepId: step.step_id, task: step.task,
      objectId: step.object_id, payload, now: now + index + 1});
    storage.setItem(keyFor(state, step), JSON.stringify({
      binding: {...common, task: step.task, object_id: step.object_id, attempt_id: `a-${index}`},
      saved_at: new Date(now + 1000).toISOString(),
      ...(step.task === 'writing' ? {draftEssay: 'Synthetic essay', firstDraft: ''}
        : step.task === 'translation' ? {drafts: answers(step), firstAttempts: {}}
        : {answers: answers(step)})
    }));
  }
  E.writeEnglishExamSession(storage, state);
  return {state, storage};
}
const answerPacket = {schema: E.ENGLISH_EXAM_ANSWER_SCHEMA, paper_id: paper.paper_id,
  steps: Object.fromEntries(paper.steps.filter(step => !['translation','writing'].includes(step.task))
    .map(step => [step.step_id, {task: step.task, object_id: step.object_id,
      source_hash: step.source_hash, answers: answers(step)}]))};
function scoreReturn(state) {
  const payload = E.englishExamProductiveScoreReturnContract(state);
  delete payload.boundary;
  for (const [channel, row] of Object.entries(payload.channels)) Object.assign(row, {
    score_range: channel === 'writing_big' ? {low:15,high:18} : {low:7,high:9},
    confidence: 'MEDIUM', review_mode: 'ANCHORED_SINGLE', requires_independent_rescore: false
  });
  return payload;
}
function assertRejectedWithoutMutation(state, storage) {
  const original = copy(state), before = storage.snapshot();
  assert.throws(() => E.sealEnglishExamSession(state, now + 60000, {storage}));
  assert.deepEqual(state, original);
  assert.deepEqual(storage.snapshot(), before);
  const restarted = new MemoryStorage(before);
  assert.equal(E.inspectEnglishExamSession(restarted).status, 'ready');
  assert.equal(E.readEnglishExamSession(restarted).status, 'ACTIVE');
  assert.deepEqual(E.buildEnglishExamForecastInput(E.readEnglishExamSession(restarted)).score_channels, {});
}

test('healthy seal, score, restart and duplicate write preserve reference-only evidence', () => {
  const {state,storage} = fixture();
  const sealed = E.sealEnglishExamSession(state, now + 60000, {storage});
  E.writeEnglishExamSession(storage, sealed);
  assert.deepEqual(E.sealEnglishExamSession(sealed, now + 61000, {storage}), sealed);
  const released = E.releaseEnglishExamObjective(sealed, answerPacket, now + 62000);
  assert.equal(released.release.objective.points, 60);
  E.writeEnglishExamSession(storage, released);
  const scored = E.applyEnglishExamProductiveScoreReturn(released, scoreReturn(released), now + 63000);
  E.writeEnglishExamSession(storage, scored);
  E.writeEnglishExamSession(storage, scored);
  const restored = E.readEnglishExamSession(new MemoryStorage(storage.snapshot()));
  assert.deepEqual(restored.release.integrated.score_range, {low:89,high:96});
  assert.equal(restored.release.integrated.score_eligible, false);
  assert.equal(storage.getItem('unrelated-healthy-sibling'), 'preserve');
});

test('missing primary autosave output is rejected for every exam step', () => {
  for (let index = 0; index < paper.steps.length; index++) {
    const {state,storage} = fixture(), step = state.steps[index];
    const key = keyFor(state,step), local = JSON.parse(storage.getItem(key));
    delete local[outputField(step)]; storage.setItem(key, JSON.stringify(local));
    assertRejectedWithoutMutation(state,storage);
    assert.throws(() => E.englishExamPayload(step.task,local), /OUTPUT_UNREADABLE/);
  }
});

test('malformed, null and wrong-shaped autosaves never erase captures', () => {
  for (const raw of ['{', 'null', '[]', 'true', '42', '"text"', '{}']) {
    const {state,storage} = fixture(); storage.setItem(keyFor(state,state.steps[0]),raw);
    assertRejectedWithoutMutation(state,storage);
  }
  for (const index of [0,5,6,7,8]) for (const value of [null, false, [], 42, {}]) {
    const {state,storage} = fixture(), step = state.steps[index];
    if (step.task !== 'writing' && value && !Array.isArray(value) && typeof value === 'object') continue;
    const key = keyFor(state,step), local = JSON.parse(storage.getItem(key));
    local[outputField(step)] = value; storage.setItem(key, JSON.stringify(local));
    assertRejectedWithoutMutation(state,storage);
  }
});

test('a legitimately unvisited paper is still unanswered, not corrupt', () => {
  const state = E.startEnglishExamSession(paper, {now}), storage = new MemoryStorage();
  const sealed = E.sealEnglishExamSession(state, now + 60000, {storage});
  assert.deepEqual(sealed.captures, {});
  assert.equal(E.releaseEnglishExamObjective(sealed,answerPacket,now + 61000).release.objective.points, 0);
});

test('explicit empty answers and essays remain legal even after an earlier capture', () => {
  const {state,storage} = fixture();
  for (const step of state.steps) {
    const key = keyFor(state,step), local = JSON.parse(storage.getItem(key));
    local[outputField(step)] = step.task === 'writing' ? '' : {};
    storage.setItem(key,JSON.stringify(local));
  }
  const sealed = E.sealEnglishExamSession(state,now + 60000,{storage});
  const released = E.releaseEnglishExamObjective(sealed,answerPacket,now + 61000);
  assert.equal(released.release.objective.points,0);
  for (const step of sealed.steps.filter(s => s.task === 'writing')) {
    assert.equal(sealed.captures[step.step_id].payload.essay,'');
  }
  assert.throws(() => E.applyEnglishExamProductiveScoreReturn(released,scoreReturn(released)), /WITHOUT_PRODUCTIVE_OUTPUT/);
});

test('absent task-local autosave retains an existing valid capture', () => {
  const {state,storage} = fixture();
  for (const step of state.steps) storage.removeItem(keyFor(state,step));
  const sealed = E.sealEnglishExamSession(state,now + 60000,{storage});
  assert.deepEqual(sealed.captures,state.captures);
});

test('latest readable autosave, not older capture, supplies the sealed answer', () => {
  const {state,storage} = fixture(), step = state.steps[0], key = keyFor(state,step);
  const local = JSON.parse(storage.getItem(key)); local.answers[step.question_ids[0]] = 'B';
  storage.setItem(key,JSON.stringify(local));
  const sealed = E.sealEnglishExamSession(state,now + 60000,{storage});
  assert.equal(sealed.captures[step.step_id].payload.answers[step.question_ids[0]],'B');
  assert.equal(state.captures[step.step_id].payload.answers[step.question_ids[0]],'A');
});

test('captured translation first outputs cannot disappear; new first outputs may accumulate', () => {
  for (const mutation of ['missing','empty','changed']) {
    const {state,storage} = fixture(), step = state.steps[6], id = step.question_ids[0], key = keyFor(state,step);
    state.captures[step.step_id].payload.first_attempts = {[id]:'Original first translation'};
    storage.setItem(E.ENGLISH_EXAM_SESSION_KEY,JSON.stringify(state));
    const local = JSON.parse(storage.getItem(key));
    if (mutation === 'missing') delete local.firstAttempts;
    if (mutation === 'empty') local.firstAttempts = {};
    if (mutation === 'changed') local.firstAttempts = {[id]:'Changed first translation'};
    storage.setItem(key,JSON.stringify(local)); assertRejectedWithoutMutation(state,storage);
  }
  const {state,storage} = fixture(), step = state.steps[6], key = keyFor(state,step);
  state.captures[step.step_id].payload.first_attempts = {[step.question_ids[0]]:'Original'};
  const local = JSON.parse(storage.getItem(key));
  local.firstAttempts = {[step.question_ids[0]]:'Original',[step.question_ids[1]]:'Additional'};
  storage.setItem(key,JSON.stringify(local));
  assert.equal(Object.keys(E.sealEnglishExamSession(state,now + 60000,{storage}).captures[step.step_id].payload.first_attempts).length,2);
});

test('captured writing first drafts cannot disappear or change', () => {
  for (const index of [7,8]) for (const value of [undefined,null,'','Changed']) {
    const {state,storage} = fixture(), step = state.steps[index], key = keyFor(state,step);
    state.captures[step.step_id].payload.first_draft = 'Original first draft';
    storage.setItem(E.ENGLISH_EXAM_SESSION_KEY,JSON.stringify(state));
    const local = JSON.parse(storage.getItem(key));
    if (value === undefined) delete local.firstDraft; else local.firstDraft = value;
    storage.setItem(key,JSON.stringify(local)); assertRejectedWithoutMutation(state,storage);
  }
});

test('source mismatch and late autosave are rejected before a SEALED result is returned', () => {
  for (const mutation of ['source','late']) {
    const {state,storage} = fixture(), step = state.steps[0], key = keyFor(state,step);
    const local = JSON.parse(storage.getItem(key));
    if (mutation === 'source') local.binding.source_hash = 'wrong-source';
    else local.saved_at = new Date(now + 181 * 60000).toISOString();
    storage.setItem(key,JSON.stringify(local)); assertRejectedWithoutMutation(state,storage);
  }
});

test('a denied session write after healthy seal leaves the durable active record untouched', () => {
  const {state,storage} = fixture(), before = storage.snapshot();
  const sealed = E.sealEnglishExamSession(state,now + 60000,{storage});
  storage.failKey = E.ENGLISH_EXAM_SESSION_KEY;
  assert.throws(() => E.writeEnglishExamSession(storage,sealed),/SYNTHETIC_WRITE_DENIED/);
  assert.deepEqual(storage.snapshot(),before);
});

test('existing captures with missing output are invalid, not numeric unanswered scores', () => {
  for (let index = 0; index < paper.steps.length; index++) {
    const {state,storage} = fixture(), step = state.steps[index];
    delete state.captures[step.step_id].payload[step.task === 'writing' ? 'essay' : 'answers'];
    const raw = JSON.stringify(state);
    storage.setItem(E.ENGLISH_EXAM_SESSION_KEY,raw);
    assert.throws(() => E.validateEnglishExamSession(state),/CAPTURE_OUTPUT_UNREADABLE/);
    assert.equal(E.inspectEnglishExamSession(storage).status,'invalid');
    assert.equal(storage.getItem(E.ENGLISH_EXAM_SESSION_KEY),raw);
    assert.throws(() => E.releaseEnglishExamObjective({...state,status:'SEALED'},answerPacket),/CAPTURE_OUTPUT_UNREADABLE/);
  }
});

test('capture API requires explicit outputs while accepting an explicitly blank response', () => {
  const initial = E.startEnglishExamSession(paper,{now});
  const step = initial.steps[0], args = {stepId:step.step_id,task:step.task,
    objectId:step.object_id,now:now+1000};
  assert.throws(() => E.captureEnglishExamStep(initial,args),/CAPTURE_OUTPUT_UNREADABLE/);
  const blank = E.captureEnglishExamStep(initial,{...args,payload:{answers:{}}});
  assert.deepEqual(blank.captures[step.step_id].payload.answers,{});
});
