import assert from 'node:assert/strict';
import * as exam from '../src/lib/englishExamSession.mjs';
import * as evidence from '../src/lib/englishLearnerEvidence.mjs';
import {englishSemanticSourceHash as hash} from '../src/lib/englishSemanticSourceIdentity.mjs';
import * as forecast from '../src/lib/englishForecastModel.mjs';
class MemoryStorage {
  constructor(entries={}) { this.data = new Map(Object.entries(entries)); }
  get length() { return this.data.size; }
  key(i) { return [...this.data.keys()][i] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key,value) { this.data.set(key,String(value)); }
  removeItem(key) { this.data.delete(key); }
}
const now=Date.parse('2026-09-21T15:00:00Z');
const kinds=['cloze',...Array(4).fill('reading_a'),'reading_b','translation','writing','writing'];
const paper={
  schema:'kianos.english.exam-paper.v1',paper_id:'synthetic-l2-proof',source_hash:'synthetic-paper-source',year:2099,
  duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,
  default_task_order:['cloze','reading_a','reading_b','translation','writing'],
  steps:kinds.map((task,i)=>({step_id:'s'+i,task,object_id:'synthetic-object-'+i,source_hash:'synthetic-source-'+i,
    max_points:i===8?20:10,...(task==='writing'?{writing_kind:i===7?'small':'big'}:{}),
    question_ids:Array.from({length:task==='cloze'?20:5},(_,j)=>'q'+j)}))
};
function releasedSession(id='A') {
  let state=exam.startEnglishExamSession(paper,{now,sessionId:id});
  for (const step of paper.steps) state=exam.captureEnglishExamStep(state,{
    stepId:step.step_id,task:step.task,objectId:step.object_id,now:now+1000,
    payload:{source_hash:step.source_hash,prior_exposure:'unseen',assistance:'unassisted',source_kind:'SYNTHETIC',
      answers:Object.fromEntries(step.question_ids.map(q=>[q,'A'])),first_attempts:{q0:'synthetic learner output'},
      essay:'synthetic learner essay',first_draft:'synthetic learner essay'}});
  state=exam.sealEnglishExamSession(state,now+2000);
  const packet={schema:exam.ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:paper.paper_id,
    steps:Object.fromEntries(paper.steps.filter(s=>['cloze','reading_a','reading_b'].includes(s.task)).map(s=>[s.step_id,{
      task:s.task,object_id:s.object_id,source_hash:s.source_hash,
      answers:Object.fromEntries(s.question_ids.map(q=>[q,'A']))}]))};
  return {sealed:state,packet,released:exam.releaseEnglishExamObjective(state,packet,now+3000)};
}
function scoreReturn(state,value=0) {
  const c=exam.englishExamProductiveScoreReturnContract(state);
  for(const row of Object.values(c.channels)) Object.assign(row,{score_range:{low:value,high:value},confidence:'LOW',review_mode:'ANCHORED_SINGLE'});
  delete c.boundary; return c;
}


const clone = (v) => JSON.parse(JSON.stringify(v));
const tests = [];
const test = (name, fn) => { fn(); tests.push(name); };
const x = releasedSession();
for (const invalid of [null, '', false, true, [], [0], ' ', '0', 'UNKNOWN', {}, -1, 100, NaN, Infinity]) {
  test('invalid score rejected: ' + String(invalid), () => assert.throws(() =>
    exam.applyEnglishExamProductiveScoreReturn(x.released, scoreReturn(x.released, invalid), now + 4000), /SCORE_RANGE/));
}
test('genuine zero score remains valid', () => {
  const scored = exam.applyEnglishExamProductiveScoreReturn(x.released, scoreReturn(x.released, 0), now + 4000);
  assert.deepEqual(scored.release.productive.score_range, {low: 0, high: 0});
  assert.equal(exam.validateEnglishExamSession(scored).status, 'SCORED');
});
for (const invalid of [null, '', false, [], -1, 61]) test('corrupt objective cannot become zero: ' + String(invalid), () => {
  const state = clone(x.released); state.release.objective.points = invalid;
  assert.throws(() => exam.applyEnglishExamProductiveScoreReturn(state, scoreReturn(x.released), now + 4000), /OBJECTIVE_SCORE/);
});
test('corrupt objective answers cannot become blank', () => {
  const state = clone(x.sealed); state.captures.s0.payload.answers = false;
  assert.throws(() => exam.releaseEnglishExamObjective(state, x.packet), /ANSWERS_UNREADABLE/);
});
test('SCORED requires actual productive evidence', () => {
  const state = clone(x.released); state.status = 'SCORED';
  assert.throws(() => exam.summarizeEnglishExamSession(state), /PRODUCTIVE_EVIDENCE_MISSING/);
});
test('nonzero score requires sealed productive output', () => {
  const state = clone(x.released); delete state.captures.s6;
  assert.throws(() => exam.applyEnglishExamProductiveScoreReturn(state, scoreReturn(state, 1)), /WITHOUT_PRODUCTIVE_OUTPUT/);
});
test('corrupt context is UNKNOWN, never clean', () => {
  const state = clone(x.released);
  for (const row of Object.values(state.captures)) { row.payload.assistance = 'corrupt'; row.payload.prior_exposure = 'corrupt'; }
  const scored = exam.applyEnglishExamProductiveScoreReturn(state, scoreReturn(state, 1));
  assert.equal(scored.release.integrated.evidence_quality, 'UNKNOWN');
});
test('forged integrated aggregate is rejected', () => {
  const scored = exam.applyEnglishExamProductiveScoreReturn(x.released, scoreReturn(x.released, 1));
  scored.release.integrated.score_range.low = 0;
  assert.throws(() => exam.validateEnglishExamSession(scored), /INTEGRATED_EVIDENCE_INVALID/);
});
test('old async release does not replace new session or alter storage', () => {
  const storage = new MemoryStorage(); exam.writeEnglishExamSession(storage, x.sealed);
  exam.writeEnglishExamSession(storage, exam.startEnglishExamSession(paper, {now: now + 5000, sessionId: 'B'}));
  const before = [...storage.data];
  assert.throws(() => exam.writeEnglishExamSession(storage, exam.releaseEnglishExamObjective(x.sealed, x.packet, now + 6000)), /CURRENT_SESSION_CHANGED/);
  assert.deepEqual([...storage.data], before);
  assert.equal(exam.readEnglishExamSession(storage).session_id, 'B');
});
test('same-session source identity cannot change', () => {
  const storage = new MemoryStorage(); const active = exam.startEnglishExamSession(paper, {now, sessionId:'IMM'});
  exam.writeEnglishExamSession(storage, active);
  const stale = {...active, source_hash:'changed', revision: 1};
  assert.throws(() => exam.writeEnglishExamSession(storage, stale), /IDENTITY_IMMUTABLE/);
});
test('sealed first captures remain immutable', () => {
  const storage = new MemoryStorage(); exam.writeEnglishExamSession(storage, x.sealed);
  const altered = clone(x.sealed); altered.captures.s6.payload.answers.q0 = 'rewritten'; altered.revision++;
  assert.throws(() => exam.writeEnglishExamSession(storage, altered), /SEALED_IMMUTABLE/);
});
test('quota failure does not discard the prior active slot', () => {
  const storage = new MemoryStorage(); exam.writeEnglishExamSession(storage, x.sealed);
  const old = storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY), set = storage.setItem.bind(storage);
  storage.setItem = (key, value) => { if (key === exam.ENGLISH_EXAM_SESSION_KEY) throw new Error('quota'); set(key,value); };
  assert.throws(() => exam.writeEnglishExamSession(storage, exam.startEnglishExamSession(paper, {now:now+1000,sessionId:'quota-B'})), /quota/);
  assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY), old);
  assert.equal(storage.getItem('kianos-english-exam-archive-v1:' + x.sealed.session_id), null);
});
for (const raw of ['', '{bad-json']) test('corrupt raw session is visible and never overwritten: '+raw, () => {
  const storage = new MemoryStorage({[exam.ENGLISH_EXAM_SESSION_KEY]: raw});
  assert.equal(exam.inspectEnglishExamSession(storage).status, 'invalid');
  assert.throws(() => exam.writeEnglishExamSession(storage, exam.startEnglishExamSession(paper,{now})), /UNREADABLE/);
  assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY), raw);
});
test('unreadable exam storage does not authorize an unrelated attempt', () => {
  const storage = new MemoryStorage(); const get = storage.getItem.bind(storage);
  storage.getItem = key => {if(key===exam.ENGLISH_EXAM_SESSION_KEY)throw new Error('unavailable');return get(key);};
  assert.equal(exam.inspectEnglishExamSession(storage).status, 'unavailable');
  assert.throws(() => evidence.inspectEnglishAttempt(storage, 'attempt', {task:'reading_a',object_id:'other',source_hash:'x'}), /RECOVERY_REQUIRED/);
});
const source={task:'reading_a',paragraphs:[{id:'p1',ordinal:1,text:'A synthetic passage. More text.'}],questions:[{id:'q1',ordinal:1,prompt:'Which claim?',options:{A:'One',B:'Two'}}]};
test('first answer immutable; changed Source does not reuse current attempt', () => {
  const storage = new MemoryStorage(), key='kianos-reading-attempt-v1:test';
  const meta={task:'reading_a',object_id:'test',source_hash:'v1',semantic_source_hash:hash(source),snapshot:{}};
  const value={answers:{q:'A'},submitted:false}; evidence.saveEnglishAttempt(storage,key,value,meta,{now});
  value.submitted=true;evidence.saveEnglishAttempt(storage,key,value,meta,{now:now+1000});
  const altered=clone(value);altered.answers.q='B';
  assert.throws(()=>evidence.saveEnglishAttempt(storage,key,altered,meta,{now:now+2000}),/IMMUTABLE/);
  assert.throws(()=>evidence.inspectEnglishAttempt(storage,key,{...meta,source_hash:'v2'}),/CURRENT_CHANGED/);
  assert.equal(value.firstEvidenceMeta.prior_exposure,'unknown');assert.equal(value.firstEvidenceMeta.independent_transfer_candidate,false);
});
test('same material repair cannot become fresh transfer under a renamed object', () => {
  const storage=new MemoryStorage(), semantic=hash(source);
  const meta={task:'reading_a',object_id:'old',source_hash:'v1',semantic_source_hash:semantic,snapshot:{}};
  evidence.saveEnglishAttempt(storage,'kianos-reading-attempt-v1:old',{answers:{},submitted:false},meta,{now});
  const fresh={answers:{q:'A'},submitted:true};
  evidence.saveEnglishAttempt(storage,'kianos-reading-attempt-v1:new',fresh,{...meta,object_id:'new',source_hash:'v2'},{now:now+2000});
  assert.equal(fresh.firstEvidenceMeta.prior_exposure,'exposed');assert.equal(fresh.firstEvidenceMeta.independent_transfer_candidate,false);
});
test('unproven generated drill cannot claim independent transfer', () => {
  const storage=new MemoryStorage(), meta={task:'reading_a',object_id:'generated',source_hash:'g1',semantic_source_hash:'g-semantic',
    snapshot:{question_origin:'CHAT_GENERATED',evidence:{evidence_role:'TRANSFER'}}};
  storage.setItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY,JSON.stringify({schema:evidence.ENGLISH_EXPOSURE_SCHEMA,materials:{generated:{events:[],declaration:{state:'unseen',semantic_source_hash:'g-semantic',source_hash:'g1'}}}}));
  const value={answers:{q:'A'},submitted:true};evidence.saveEnglishAttempt(storage,'kianos-reading-attempt-v1:generated',value,meta,{now});
  assert.equal(value.firstEvidenceMeta.independent_transfer_candidate,false);
});
test('real native score evidence reaches Forecast, without workload or formal-score invention', () => {
  const scored=exam.applyEnglishExamProductiveScoreReturn(x.released,scoreReturn(x.released,1),now+5000);
  const input=exam.buildEnglishExamForecastInput(scored), model=forecast.buildEnglishWorkloadForecast(input);
  assert.equal(model.evidence_basis.session_id, scored.session_id);
  assert.deepEqual(model.score.local_channel_band,{low:63,high:63});
  assert.deepEqual(model.score.integrated_whole_paper.range,{low:63,high:63});
  assert.equal(model.score.formal_local_channel_band,null);
  assert.equal(model.score.integrated_whole_paper.score_eligible,false);
  assert.equal(model.workload.full_band_minutes,null);
});
const report={basis:'bounded L2 candidate repair; base 418c8a24607d5708c6fbd5dac1f7828e199c61b7',
  execution:'Node isolated in-memory synthetic fixtures; no real learner data, protected source consumption, browser or deployed claim',
  status:'PASS_BOUNDED_REPAIR_ONLY',native_closure_ready:false,tests:tests.length,checks:tests};
console.log(JSON.stringify(report,null,2));
