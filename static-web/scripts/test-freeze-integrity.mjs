// Bounded F0-03/04/05/06 regressions. Complete native modules, synthetic data.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as E from '../src/lib/englishExamSession.mjs';
import * as L from '../src/lib/englishLearnerEvidence.mjs';
import * as S from '../src/lib/englishSessionControl.mjs';
import * as X from '../src/lib/xizongForecastModel.mjs';
import * as C from '../src/lib/privateControlCommand.mjs';
import { applyPrivateControlCommand } from '../src/lib/privateControlRuntime.mjs';
import { buildPrivateLearnerCheckpoint } from '../src/lib/privateLearnerCheckpoint.mjs';
import { captureSharedControlCheckpoint, restoreSharedControlCheckpoint } from '../src/lib/sharedControlCheckpoint.mjs';
import { restoreSharedControlFromPrivate, PRIVATE_CHECKPOINT_BASE_KEY } from '../src/lib/privateCheckpointRuntime.mjs';
import { commitLearnerStorageChanges } from '../src/lib/browserLearnerWriter.mjs';

const day='2026-09-22', now=Date.parse(day+'T01:00:00Z');
const clone=x=>JSON.parse(JSON.stringify(x));
class Storage {
  constructor(rows={}) { this.map=new Map(Object.entries(rows)); this.hook=null; }
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){return this.map.get(key)??null;}
  setItem(key,raw){this.hook?.(key,raw);this.map.set(key,String(raw));}
  removeItem(key){this.map.delete(key);}
  snapshot(){return Object.fromEntries([...this.map].sort(([a],[b])=>a.localeCompare(b)));}
}
const tasks=[['cloze',20],['reading_a',5],['reading_a',5],['reading_a',5],['reading_a',5],['reading_b',5],['translation',5],['writing',0,'small'],['writing',0,'big']];
const paper={schema:'kianos.english.exam-paper.v1',paper_id:'freeze-integrity',source_hash:'synthetic:v1',year:2025,
  duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,
  default_task_order:['cloze','reading_a','reading_b','translation','writing'],
  steps:tasks.map(([task,n,kind],i)=>({step_id:'s'+i,task,object_id:'o'+i,source_hash:'source'+i,
    max_points:kind==='big'?20:10,...(kind?{writing_kind:kind}:{}),question_ids:Array.from({length:n},(_,j)=>'q'+i+'-'+j)}))};
function released(essay='Synthetic first essay') {
  let state=E.startEnglishExamSession(paper,{now,sessionId:'synthetic-session'});
  for(const [i,step] of state.steps.entries()) state=E.captureEnglishExamStep(state,{
    stepId:step.step_id,task:step.task,objectId:step.object_id,now:now+i+1,
    payload:{source_hash:step.source_hash,...(step.task==='writing'?{essay}:
      {answers:Object.fromEntries(step.question_ids.map(q=>[q,step.task==='translation'?'Synthetic translation':'A']))})}});
  return E.releaseEnglishExamObjective(E.sealEnglishExamSession(state,now+60000),{
    schema:E.ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:paper.paper_id,
    steps:Object.fromEntries(paper.steps.filter(s=>['cloze','reading_a','reading_b'].includes(s.task)).map(s=>[s.step_id,
      {task:s.task,object_id:s.object_id,source_hash:s.source_hash,answers:Object.fromEntries(s.question_ids.map(q=>[q,'A']))}]))
  },now+61000);
}
function scoreReturn(state) {
  const value=E.englishExamProductiveScoreReturnContract(state);delete value.boundary;
  for(const [id,row] of Object.entries(value.channels))Object.assign(row,{
    score_range:id==='writing_big'?{low:15,high:18}:{low:7,high:9},confidence:'MEDIUM',
    review_mode:'ANCHORED_SINGLE',requires_independent_rescore:false});
  return value;
}
function scoreCommand(state) {return {schema:C.CONTROL_BROWSER_SCHEMA,command_id:'freeze-score-command',command_hash:'synthetic-exact-hash',
  study_day:day,generated_at:new Date(now+90000).toISOString(),expires_at:null,
  operations:[{kind:'english.exam_score_return',payload:scoreReturn(state)}]};}
async function withTransport(fn) {
  const before={window:globalThis.window,fetch:globalThis.fetch};
  globalThis.window={dispatchEvent(){}};
  globalThis.fetch=async(_url,options)=>({ok:true,json:async()=>({status:'saved',receipt:JSON.parse(options.body)})});
  try {return await fn();} finally {globalThis.window=before.window;globalThis.fetch=before.fetch;}
}
async function scoredCheckpoint() {
  const source=new Storage();const state=released();E.writeEnglishExamSession(source,state);
  const command=scoreCommand(state);
  await withTransport(()=>applyPrivateControlCommand(source,command,{day,now:now+120000}));
  const checkpoint=buildPrivateLearnerCheckpoint({studyDay:day,now:now+130000,
    shared:captureSharedControlCheckpoint(source,{studyDay:day,now:now+130000}),subjects:{english:L.exportEnglishCheckpoint(source)}});
  return {source,state,command,checkpoint};
}

for(const task of ['reading_a','cloze','reading_b'])test(task+': missing, partial, wrong-key and malformed results never complete',()=>{
  const prefix={reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:'}[task];
  const step={task,object_id:'objective-fixture',source_hash:'source-v1'};
  const healthy={submitted:true,answers:{q1:'A',q2:'B'},results:{q1:'correct',q2:'wrong'},uncertain:[],
    binding:{task,object_id:step.object_id,source_hash:step.source_hash,attempt_id:'attempt-1',source_snapshot:{questions:[{id:'q1'},{id:'q2'}]}}};
  const storage=new Storage();const key=prefix+step.object_id;
  for(const results of [undefined,null,{},[],{q1:'correct'},{q1:'correct',other:'correct'},{q1:'correct',q2:'invented'}]) {
    const bad={...clone(healthy),results,reviewResolved:true};if(results===undefined)delete bad.results;
    storage.setItem(key,JSON.stringify(bad));const before=storage.getItem(key);
    assert.equal(S.englishStepIsComplete(storage,step),false);
    assert.equal(L.inspectEnglishObjectiveResults(bad).problem_count,null);
    assert.equal(L.exportEnglishCheckpoint(storage).native_integrity.status,'corrupt-retained');
    assert.equal(storage.getItem(key),before);
  }
  storage.setItem(key,JSON.stringify(healthy));assert.equal(S.englishStepIsComplete(storage,step),false);
  healthy.reviewResolved=true;storage.setItem(key,JSON.stringify(healthy));assert.equal(S.englishStepIsComplete(storage,step),true);
  healthy.reviewResolved=false;healthy.results.q2='correct';storage.setItem(key,JSON.stringify(healthy));assert.equal(S.englishStepIsComplete(storage,step),true);
  healthy.results={q1:'unanswered',q2:'unanswered'};healthy.answers={};storage.setItem(key,JSON.stringify(healthy));
  assert.equal(L.inspectEnglishObjectiveResults(healthy).valid,true);assert.equal(S.englishStepIsComplete(storage,step),false);
});

test('Resume retains an incomplete objective instead of jumping to the next step',()=>{
  const step={task:'cloze',object_id:'incomplete',source_hash:'v1'};
  const storage=new Storage({'kianos-cloze-attempt-v1:incomplete':JSON.stringify({submitted:true,answers:{q1:'A'},binding:{source_hash:'v1'}})});
  const instruction={current_step:0,study_day:day,steps:[step,{task:'translation',object_id:'next',source_hash:'v1'}]};
  assert.equal(S.resolveEnglishSessionStep(storage,instruction,instruction.steps).index,0);
});

test('Xizong missing counts do not prove closure; explicit zero observations stay zero',()=>{
  for(const absent of [undefined,null]) {
    const p={schema:'kianos.xizong.forecast-progress.v1',runtime_evidence:{completed_blocks:absent},canonical_scope:{blocks:absent}};
    const result=X.buildXizongScoreEvidence(p).capabilities.source_model;
    assert.equal(result.evidence_status,'PARTIAL_OR_UNKNOWN');assert.equal(result.completed_blocks,null);assert.equal(result.canonical_blocks,null);
  }
  const p={schema:'kianos.xizong.forecast-progress.v1',runtime_evidence:{completed_blocks:0},canonical_scope:{blocks:3}};
  assert.equal(X.buildXizongScoreEvidence(p).capabilities.source_model.completed_blocks,0);
  p.runtime_evidence.completed_blocks=3;assert.equal(X.buildXizongScoreEvidence(p).capabilities.source_model.evidence_status,'FULL_RUNTIME_CLOSURE_OBSERVED');
});

test('Xizong invalid bands never become zero work or full-scope fit',()=>{
  for(const band of [{},{p20:0},{p20:null,p50:null,p80:null},{p20:0,p50:NaN,p80:0},{p20:3,p50:2,p80:1}]){
    const forecast={schema:X.XIZONG_FORECAST_MODEL_SCHEMA,first_round:{full_band_minutes:band},score_formation:{full_band_minutes:band}};
    const result=X.assessXizongDeadlineFeasibility(forecast,{startDay:day,deadlineDay:day,dailyMinutes:0});
    assert.equal(result.status,'UNPRICED');assert.equal(result.fit,null);assert.equal(result.full_scope,false);
  }
  const band={p20:0,p50:0,p80:0};
  const forecast={schema:X.XIZONG_FORECAST_MODEL_SCHEMA,first_round:{full_band_minutes:band},score_formation:{full_band_minutes:band}};
  assert.equal(X.assessXizongDeadlineFeasibility(forecast,{startDay:day,deadlineDay:day,dailyMinutes:0}).status,'P80_FITS');
  forecast.score_formation={full_band_minutes:{},known_priced_band_minutes:{p20:1,p50:2,p80:3}};
  const lower=X.assessXizongDeadlineFeasibility(forecast,{startDay:day,deadlineDay:day,dailyMinutes:100});
  assert.equal(lower.status,'UNPRICED');assert.equal(lower.full_scope,false);assert.equal(lower.fit,null);
});

test('whole restore admits exact native scoring successor and only then its receipt',async()=>{
  const {source,state,command,checkpoint}=await scoredCheckpoint();
  const target=new Storage();E.writeEnglishExamSession(target,state);
  const result=await restoreSharedControlFromPrivate(target,{now:now+140000,readCheckpoint:async()=>({status:'ready',checkpoint})});
  assert.deepEqual(result.warnings,[]);
  assert.equal(target.getItem(E.ENGLISH_EXAM_SESSION_KEY),source.getItem(E.ENGLISH_EXAM_SESSION_KEY));
  assert.equal(target.getItem(C.CONTROL_LOCAL_RECEIPT_KEY),source.getItem(C.CONTROL_LOCAL_RECEIPT_KEY));
  assert.equal(target.getItem(PRIVATE_CHECKPOINT_BASE_KEY),checkpoint.checkpoint_id);
  const before=target.snapshot();
  const replay=await withTransport(()=>applyPrivateControlCommand(target,command,{day,now:now+150000}));
  assert.equal(replay.status,'idempotent');assert.deepEqual(target.snapshot(),before);
});

test('conflicting native work remains intact and cannot inherit success receipt',async()=>{
  const {checkpoint}=await scoredCheckpoint();const target=new Storage();
  E.writeEnglishExamSession(target,released('A different preserved original essay'));
  const before=target.getItem(E.ENGLISH_EXAM_SESSION_KEY);
  const result=await restoreSharedControlFromPrivate(target,{now:now+140000,readCheckpoint:async()=>({status:'ready',checkpoint})});
  assert.equal(target.getItem(E.ENGLISH_EXAM_SESSION_KEY),before);
  assert.equal(target.getItem(C.CONTROL_LOCAL_RECEIPT_KEY),null);
  assert.ok(result.warnings.some(x=>x.includes('RECEIPT_WITHHELD_NATIVE_CONFLICT')));
  assert.equal(target.getItem(PRIVATE_CHECKPOINT_BASE_KEY),null);
});

test('standalone shared restore transports no unverified native success receipt',async()=>{
  const {checkpoint}=await scoredCheckpoint();const target=new Storage();
  restoreSharedControlCheckpoint(target,checkpoint.payload.shared,{expectedDay:day});
  assert.equal(target.getItem(C.CONTROL_LOCAL_RECEIPT_KEY),null);
});

test('pre-repair dangling score receipt is not enough for idempotent success',async()=>{
  const {source,state,command}=await scoredCheckpoint();const target=new Storage();
  E.writeEnglishExamSession(target,state);target.setItem(C.CONTROL_LOCAL_RECEIPT_KEY,source.getItem(C.CONTROL_LOCAL_RECEIPT_KEY));
  const result=await withTransport(()=>applyPrivateControlCommand(target,command,{day,now:now+150000}));
  assert.equal(result.status,'applied');assert.equal(E.readEnglishExamSession(target).status,'SCORED');
  assert.equal(E.englishExamProductiveScoreMatches(E.readEnglishExamSession(target),command.operations[0].payload),true);
});

test('restore write failure preserves original native state and withholds success',async()=>{
  const {checkpoint,state}=await scoredCheckpoint();const target=new Storage();E.writeEnglishExamSession(target,state);
  const raw=target.getItem(E.ENGLISH_EXAM_SESSION_KEY);
  target.hook=(key)=>{if(key===C.CONTROL_LOCAL_RECEIPT_KEY)throw new Error('SYNTHETIC_QUOTA');};
  await assert.rejects(restoreSharedControlFromPrivate(target,{now:now+140000,readCheckpoint:async()=>({status:'ready',checkpoint})}),/SYNTHETIC_QUOTA/);
  assert.equal(target.getItem(E.ENGLISH_EXAM_SESSION_KEY),raw);assert.equal(target.getItem(C.CONTROL_LOCAL_RECEIPT_KEY),null);
});

test('rollback never deletes an unexpected later writer value',()=>{
  const target=new Storage({a:'before'});
  target.hook=key=>{if(key==='b'){target.map.set('a','newer-other-writer');throw new Error('SYNTHETIC_QUOTA');}};
  assert.throws(()=>commitLearnerStorageChanges(target,[['a','our-value'],['b','our-b']]),/ROLLBACK_CONFLICT_PRESERVED/);
  assert.equal(target.getItem('a'),'newer-other-writer');assert.equal(target.getItem('b'),null);
});


test('exact restored score without a receipt is acknowledged without rescoring',async()=>{
  const {source,command}=await scoredCheckpoint();const target=new Storage();
  const raw=source.getItem(E.ENGLISH_EXAM_SESSION_KEY);target.setItem(E.ENGLISH_EXAM_SESSION_KEY,raw);
  const result=await withTransport(()=>applyPrivateControlCommand(target,command,{day,now:now+150000}));
  assert.equal(result.status,'applied');assert.equal(target.getItem(E.ENGLISH_EXAM_SESSION_KEY),raw);
  assert.equal(JSON.parse(target.getItem(C.CONTROL_LOCAL_RECEIPT_KEY)).command_id,command.command_id);
});
