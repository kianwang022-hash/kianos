import assert from 'node:assert/strict';
import * as exam from '../src/lib/englishExamSession.mjs';
import * as evidence from '../src/lib/englishLearnerEvidence.mjs';
import {englishSemanticSourceHash as hash} from '../src/lib/englishSemanticSourceIdentity.mjs';
import * as forecast from '../src/lib/englishForecastModel.mjs';
import * as session from '../src/lib/englishSessionControl.mjs';
import * as lexicalBridge from '../src/lib/englishLexicalReturn.mjs';
import * as lexical from '../src/lib/lexicalEvidence.mjs';
import {validateCurrentLexicalTarget} from '../src/lib/lexicalEnglishEvidence.mjs';
import {rebindRenderedEnglishSourceIdentity} from '../src/lib/englishSourceTruth.mjs';

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

// L2 continuation: primary history and real native interfaces, never a second learner ledger.
const day=new Date(now).toLocaleDateString('en-CA');
const currentKey=id=>'kianos-reading-attempt-v1:'+id;
const metaFor=(id,snapshot=source)=>({task:'reading_a',object_id:id,source_hash:'exact:'+id,semantic_source_hash:hash(snapshot),snapshot});
function declareUnseen(storage,meta){
 const ledger=evidence.readEnglishExposure(storage);
 ledger.materials[meta.object_id]={events:[],declaration:{state:'unseen',source_hash:meta.source_hash,semantic_source_hash:meta.semantic_source_hash}};
 storage.setItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY,JSON.stringify(ledger));
}
function historicalAttempt(storage,{archive=false,partial=false,event=true}={}){
 const value={answers:{q1:'A'},submitted:true,firstEvidenceMeta:{prior_exposure:'unseen',independent_transfer_candidate:true},
  binding:{task:'reading_a',object_id:'legacy',attempt_id:'legacy-attempt',source_hash:'legacy-exact',semantic_source_hash:'942a49de64145123227ced877bc58ece581d2ce7fa117b70b1223904357de997',revision:3,prior_exposure:'unseen',assistance:'unassisted',source_snapshot:partial?{questions:source.questions}:clone(source)}};
 storage.setItem(archive?'kianos-english-attempt-archive-v1:legacy-attempt':currentKey('legacy'),JSON.stringify(value));
 if(event)storage.setItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY,JSON.stringify({schema:evidence.ENGLISH_EXPOSURE_SCHEMA,materials:{legacy:{events:[{event_id:'legacy-attempt:opened',attempt_id:'legacy-attempt',source_hash:'legacy-exact',semantic_source_hash:value.binding.semantic_source_hash}]}}}));
 return value;
}
const alias=clone(source);alias.objectId='alias';alias.paragraphs[0].ordinal=91;alias.paragraphs[0].id='other';alias.paragraphs[0].text='  A synthetic\n passage.  More\ttext. ';alias.questions[0].ordinal=27;alias.questions[0].id='q99';alias.context={source_kind:'synthetic',evidence_role:'TRANSFER'};
test('ordinal/whitespace/role aliases share one exposure identity',()=>assert.equal(hash(source),hash(alias)));
test('punctuation and candidate ordering remain meaningful',()=>{
 const changed=clone(source);changed.paragraphs[0].text+=' Not.';assert.notEqual(hash(source),hash(changed));
 assert.notEqual(hash({material:[{text:'One'},{text:'Two'}]}),hash({material:[{text:'Two'},{text:'One'}]}));
});
for(const archive of [false,true])test('old '+(archive?'archived':'current')+' snapshot binds new alias without rewriting first evidence',()=>{
 const storage=new MemoryStorage();historicalAttempt(storage,{archive});
 const key=archive?'kianos-english-attempt-archive-v1:legacy-attempt':currentKey('legacy'),raw=storage.getItem(key);
 const meta=metaFor('alias',alias);declareUnseen(storage,meta);
 const value={answers:{q1:'A'},submitted:true};evidence.saveEnglishAttempt(storage,currentKey('alias'),value,meta,{now:now+5000});
 assert.equal(value.binding.prior_exposure,'exposed');assert.equal(value.firstEvidenceMeta.independent_transfer_candidate,false);assert.equal(storage.getItem(key),raw);
});
test('archive alone is primary exposure evidence even when exposure summary is absent',()=>{
 const storage=new MemoryStorage();historicalAttempt(storage,{archive:true,event:false});
 const meta=metaFor('alias',alias);declareUnseen(storage,meta);
 assert.equal(evidence.inspectEnglishExposureHistory(storage,meta).exposed,true);
});
test('incomplete legacy snapshot remains UNKNOWN but ordinary practice is usable',()=>{
 const storage=new MemoryStorage();historicalAttempt(storage,{partial:true});const meta=metaFor('unknown-alias',alias);declareUnseen(storage,meta);
 const value={answers:{q1:'B'},submitted:true};evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),value,meta,{now});
 assert.equal(value.binding.prior_exposure,'unknown');assert.equal(value.firstEvidenceMeta.independent_transfer_candidate,false);assert.equal(value.answers.q1,'B');
});
test('different reconstructible material may still carry an explicit unseen declaration',()=>{
 const storage=new MemoryStorage();historicalAttempt(storage);const changed=clone(source);changed.paragraphs[0].text='A genuinely different passage with a distinct demand.';
 const meta=metaFor('new-material',changed);declareUnseen(storage,meta);const value={answers:{q1:'A'},submitted:true};
 evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),value,meta,{now});assert.equal(value.binding.prior_exposure,'unseen');assert.equal(value.firstEvidenceMeta.independent_transfer_candidate,true);
});
test('new-version write preserves an old exposed declaration as existing exposure evidence',()=>{
 const storage=new MemoryStorage(),meta=metaFor('declaration-only');
 storage.setItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY,JSON.stringify({schema:evidence.ENGLISH_EXPOSURE_SCHEMA,materials:{'declaration-only':{events:[],declaration:{state:'exposed',source_hash:'old-exact',semantic_source_hash:'old-legacy',observed_at:new Date(now-5000).toISOString(),session_instruction_id:'old'}}}}));
 const instruction={schema:session.ENGLISH_SESSION_SCHEMA,session_id:'new-declaration',study_day:day,generated_at:new Date(now).toISOString(),steps:[{step_id:'s1',task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash,params:{material_exposure:{state:'unseen',basis:'learner_statement',observed_at:new Date(now-1000).toISOString(),note:'New source statement'}}}]};
 session.writeEnglishSessionInstruction(storage,instruction,day,{catalog:[meta],now});
 const value={answers:{q1:'A'},submitted:true};evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),value,meta,{now});
 assert.equal(value.binding.prior_exposure,'unknown');assert.equal(evidence.readEnglishExposure(storage).materials[meta.object_id].events[0].state,'exposed');
});
test('cross-tab alias exposure before first submit downgrades the pending attempt',()=>{
 const storage=new MemoryStorage(),a=metaFor('tab-a'),b=metaFor('tab-b',alias);declareUnseen(storage,a);
 const first={answers:{},submitted:false};evidence.saveEnglishAttempt(storage,currentKey('tab-a'),first,a,{now});
 evidence.saveEnglishAttempt(storage,currentKey('tab-b'),{answers:{},submitted:false},b,{now:now+100});
 first.submitted=true;evidence.saveEnglishAttempt(storage,currentKey('tab-a'),first,a,{now:now+1000});assert.equal(first.firstEvidenceMeta.prior_exposure,'exposed');
});
test('malformed exposure ledger never becomes an empty history',()=>{
 const storage=new MemoryStorage({[evidence.ENGLISH_MATERIAL_EXPOSURE_KEY]:JSON.stringify({schema:evidence.ENGLISH_EXPOSURE_SCHEMA,materials:{bad:{events:'broken'}}})});
 const raw=storage.getItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY);
 assert.throws(()=>evidence.saveEnglishAttempt(storage,currentKey('blocked'),{submitted:true},metaFor('blocked'),{now}),/EXPOSURE_DATA_UNREADABLE/);assert.equal(storage.getItem(evidence.ENGLISH_MATERIAL_EXPOSURE_KEY),raw);
});
test('final-rendered Source identity includes the delivered passage, context and candidates',()=>{
 const original={objectId:'rendered',paragraphs:source.paragraphs,questions:source.questions,context:{directions:'Choose one'},candidates:['A','B'],sourceHashes:{sourceTruthUnit:'u'}};
 const bound=rebindRenderedEnglishSourceIdentity(original);
 const final=rebindRenderedEnglishSourceIdentity({...bound,paragraphs:[{id:'p1',text:'Actually rendered content'}]});
 assert.notEqual(final.sourceHashes.renderedObject,bound.sourceHashes.renderedObject);assert.equal(final.sourceHashes.semanticSource,hash(final));
 assert.notEqual(rebindRenderedEnglishSourceIdentity({...original,candidates:['B','A']}).sourceHashes.renderedObject,bound.sourceHashes.renderedObject);
 assert.notEqual(rebindRenderedEnglishSourceIdentity({...original,context:{directions:'Choose two'}}).sourceHashes.renderedObject,bound.sourceHashes.renderedObject);
});
test('Writing snapshot and server learner task use the same recipe; image bytes remain significant',()=>{
 const learnerTask={directions:'Describe the picture',images:[{asset_path:'a.png',asset_sha256:'bytes-a',alt:'Scene'}]};
 assert.equal(hash({learnerTask}),hash({task:learnerTask,evidence:{source_kind:'official'}}));
 assert.notEqual(hash({learnerTask}),hash({learnerTask:{...learnerTask,images:[{asset_path:'a.png',asset_sha256:'bytes-b',alt:'Scene'}]}}));
});
function installedV1(){
 const storage=new MemoryStorage(),meta=metaFor('source-v2');
 const value={answers:{q1:'A'},submitted:true,results:{q1:'correct'}};evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),value,meta,{now});
 const instruction={schema:session.ENGLISH_SESSION_SCHEMA,session_id:'m4',study_day:day,generated_at:new Date(now).toISOString(),steps:[{step_id:'s1',task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash}]};
 session.writeEnglishSessionInstruction(storage,instruction,day,{catalog:[meta],now});
 return {storage,meta,value,instruction,v2:{...meta,source_hash:'current-v2'}};
}
test('same-day Source v2 invalidates native Resume and progress, retaining historical first evidence',()=>{
 const {storage,meta,value,v2}=installedV1();const raw=storage.getItem(currentKey(meta.object_id));
 assert.equal(session.readEnglishSessionInstruction(storage,day,{catalog:[meta]}).executable,true);
 assert.equal(session.readEnglishSessionInstruction(storage,day,{catalog:[v2]}).status,'stale_source');
 const packet=session.buildEnglishEvidencePacket(storage,{day,now,catalog:[v2]});
 assert.equal(packet.resume.status,'stale_source');assert.equal(packet.resume.href,null);assert.equal(packet.forecast_progress.remaining_steps,null);
 assert.equal(packet.inventory[0].source_current,false);assert.equal(packet.performance_profile.source_stale_attempt_count,1);assert.equal(storage.getItem(currentKey(meta.object_id)),raw);
 assert.equal(value.binding.source_hash,meta.source_hash);
});
test('missing catalogue is not executable current Source proof',()=>{
 const {storage}=installedV1();assert.equal(session.readEnglishSessionInstruction(storage,day).executable,false);
 const state=session.readEnglishSessionInstruction(storage,day,{catalog:[]});assert.equal(state.status,'source_unverified');assert.equal(state.executable,false);
});
test('explicit current-version continuation archives old output and starts no invented attempt',()=>{
 const {storage,meta,v2,value}=installedV1();const raw=storage.getItem(currentKey(meta.object_id));
 const result=evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[v2],expectedRaw:raw,now});
 assert.equal(result.archived,true);assert.equal(storage.getItem(currentKey(meta.object_id)),null);assert.equal(storage.getItem(result.archive_key),raw);
 const next={answers:{},submitted:false};evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),next,v2,{now:now+1000});
 assert.notEqual(next.binding.attempt_id,value.binding.attempt_id);assert.equal(next.binding.source_hash,v2.source_hash);assert.equal(next.binding.prior_exposure,'exposed');
});
test('old tab cannot resurrect a retired attempt in the gap before the new attempt opens',()=>{
 const {storage,meta,v2,value}=installedV1();evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[v2],expectedRaw:storage.getItem(currentKey(meta.object_id)),now});
 assert.throws(()=>evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),value,meta,{now}),/RETIRED/);assert.equal(storage.getItem(currentKey(meta.object_id)),null);
});
test('Source-version continuation rejects concurrent evidence and a moving catalogue',()=>{
 const {storage,meta,v2}=installedV1();const raw=storage.getItem(currentKey(meta.object_id));
 assert.throws(()=>evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[{...v2,source_hash:'v3'}],expectedRaw:raw,now}),/UNVERIFIED/);
 const changed=JSON.parse(raw);changed.binding.revision++;storage.setItem(currentKey(meta.object_id),JSON.stringify(changed));
 assert.throws(()=>evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[v2],expectedRaw:raw,now}),/STALE/);assert.equal(JSON.parse(storage.getItem(currentKey(meta.object_id))).binding.revision,changed.binding.revision);
});
test('fresh native instruction can continue without a cross-subject Chat Plan',()=>{
 const {storage,meta}=installedV1();assert.equal(storage.getItem('kianos-exam-chat-plan-v1'),null);
 const state=session.readEnglishSessionInstruction(storage,day,{catalog:[meta]});assert.equal(state.status,'ready');assert.equal(state.executable,true);
});
test('native archive retirement suppresses restored old current without deleting a newer attempt',()=>{
 const {storage,meta,v2}=installedV1(),old=evidence.exportEnglishCheckpoint(storage);
 evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[v2],expectedRaw:storage.getItem(currentKey(meta.object_id)),now});
 const archived=evidence.exportEnglishCheckpoint(storage);assert.equal(archived.native_integrity.retired_current.length,1);assert.equal(archived.native_integrity.absence_is_deletion,false);
 evidence.restoreEnglishCheckpoint(storage,old);assert.equal(storage.getItem(currentKey(meta.object_id)),null);
 const next={answers:{},submitted:false};evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),next,v2,{now:now+1000});
 const newer=storage.getItem(currentKey(meta.object_id));const oldCurrentOnly={schema:old.schema,entries:{[currentKey(meta.object_id)]:old.entries[currentKey(meta.object_id)]}};
 evidence.restoreEnglishCheckpoint(storage,oldCurrentOnly);assert.equal(storage.getItem(currentKey(meta.object_id)),newer);
});
test('fresh browser restore respects native archive evidence even if a backup contains both keys',()=>{
 const sourceStorage=new MemoryStorage();const old=historicalAttempt(sourceStorage),raw=sourceStorage.getItem(currentKey('legacy'));
 evidence.archiveEnglishAttempt(sourceStorage,currentKey('legacy'),now);
 const payload=evidence.exportEnglishCheckpoint(sourceStorage);payload.entries[currentKey('legacy')]=raw;
 const target=new MemoryStorage();evidence.restoreEnglishCheckpoint(target,payload);assert.equal(target.getItem(currentKey('legacy')),null);assert.equal(JSON.parse(target.getItem('kianos-english-attempt-archive-v1:'+old.binding.attempt_id)).binding.attempt_id,old.binding.attempt_id);
});
for(const raw of ['', '{bad-json', 'null', '{"schema":"kianos.english.exam-session.v1"}'])test('raw corrupt Whole Paper is exportable, retained and never a valid session: '+raw,()=>{
 const storage=new MemoryStorage({[exam.ENGLISH_EXAM_SESSION_KEY]:raw});const payload=evidence.exportEnglishCheckpoint(storage);
 assert.equal(payload.entries[exam.ENGLISH_EXAM_SESSION_KEY],raw);assert.equal(payload.native_integrity.status,'corrupt-retained');
 const target=new MemoryStorage();evidence.restoreEnglishCheckpoint(target,payload);assert.equal(target.getItem(exam.ENGLISH_EXAM_SESSION_KEY),raw);assert.equal(exam.inspectEnglishExamSession(target).status,'invalid');
});
test('restore cannot consume conflicting archive evidence as retirement authority',()=>{
 const storage=new MemoryStorage();historicalAttempt(storage,{archive:true});const local=storage.getItem('kianos-english-attempt-archive-v1:legacy-attempt');
 const changed=JSON.parse(local);changed.answers.q1='B';const payload={schema:'kianos.english.private-payload.v1',entries:{'kianos-english-attempt-archive-v1:legacy-attempt':JSON.stringify(changed)}};
 assert.throws(()=>evidence.restoreEnglishCheckpoint(storage,payload),/CONFLICT_KEEP_LOCAL/);assert.equal(storage.getItem('kianos-english-attempt-archive-v1:legacy-attempt'),local);
});
test('native checkpoint restore rolls back partial writes on quota failure',()=>{
 const storage=new MemoryStorage(),set=storage.setItem.bind(storage);let once=true;
 storage.setItem=(key,value)=>{if(key==='kianos-reading-last-location-v1'&&once){once=false;throw new Error('quota');}set(key,value);};
 assert.throws(()=>evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{'kianos-cloze-last-location-v1':'{}','kianos-reading-last-location-v1':'{}'}}),/quota/);assert.equal(storage.length,0);
});
test('malformed Lexical evidence stays UNKNOWN in the English producer',()=>{
 const broken={...lexical.emptyLexicalLedger(),events:'not-an-array'},storage=new MemoryStorage({[lexical.LEXICAL_LEDGER_STORAGE_KEY]:JSON.stringify(broken)});
 const packet=session.buildEnglishEvidencePacket(storage,{day,now,catalog:[]});assert.equal(packet.lexical.status,'unreadable');assert.equal(packet.lexical.summary,null);assert.equal(JSON.parse(storage.getItem(lexical.LEXICAL_LEDGER_STORAGE_KEY)).events,broken.events);
});
const asyncTest=async(name,fn)=>{await fn();tests.push(name);};
const lexicalThread={threadId:'m3-return',route:'lexical',summary:'Synthetic exact native bridge',lexicalEvidence:{word_id:'word:abide',word:'abide',ordinal:4,target_kind:'sense',target_id:'sense:abide:main',outcome:'WRONG',demand:'production'}};
const resolver=event=>validateCurrentLexicalTarget(event,{word_id:'word:abide',ordinal:4,source_hash:'lex-source',targets:[{target_kind:'sense',target_id:'sense:abide:main'}]});
const returnArgs={task:'writing',objectId:'writing-m3',attemptSubmittedAt:new Date(now).toISOString(),attemptBinding:{prior_exposure:'unseen',assistance:'unassisted'},threads:[lexicalThread],resolve:resolver};
await asyncTest('real English-Lexical prepare and atomic commit are replay-idempotent',async()=>{
 const storage=new MemoryStorage();const first=await lexicalBridge.prepareEnglishLexicalReturn(storage,returnArgs);
 evidence.atomicEnglishWrites(storage,first.changes);const second=await lexicalBridge.prepareEnglishLexicalReturn(storage,returnArgs);evidence.atomicEnglishWrites(storage,second.changes);
 assert.equal(JSON.parse(storage.getItem(lexical.LEXICAL_LEDGER_STORAGE_KEY)).events.length,1);
 assert.equal(storage.getItem('kianos-vocabulary-coverage-v1'),null);
 const success=clone(lexicalThread);success.lexicalEvidence={...success.lexicalEvidence,outcome:'CORRECT',demand:'recognition',context_novelty:'unseen',delayed:true};
 const prepared=await lexicalBridge.prepareEnglishLexicalReturn(storage,{...returnArgs,task:'reading_a',objectId:'reading-fresh',attemptSubmittedAt:new Date(now+86400000).toISOString(),threads:[success]});evidence.atomicEnglishWrites(storage,prepared.changes);
 assert.equal(Object.keys(JSON.parse(storage.getItem('kianos-vocabulary-astro-v2:word:abide')).repairTargets).length,1,'recognition cannot discharge the existing production demand');
});
await asyncTest('malformed native Lexical ledger is rejected before any bridge write',async()=>{
 const storage=new MemoryStorage({[lexical.LEXICAL_LEDGER_STORAGE_KEY]:JSON.stringify({...lexical.emptyLexicalLedger(),events:null})}),before=[...storage.data];
 await assert.rejects(lexicalBridge.prepareEnglishLexicalReturn(storage,returnArgs),/UNREADABLE/);assert.deepEqual([...storage.data],before);
});
await asyncTest('real bridge guard catches evidence changed during lexical target resolution',async()=>{
 const storage=new MemoryStorage();const prepared=await lexicalBridge.prepareEnglishLexicalReturn(storage,{...returnArgs,resolve:async event=>{storage.setItem(lexical.LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify(lexical.emptyLexicalLedger()));return resolver(event);}});
 const before=[...storage.data];const meta=metaFor('guarded-return');
 assert.throws(()=>evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),{answers:{},submitted:false},meta,{now,guards:prepared.guards,extraChanges:prepared.changes}),/RETURN_STALE/);assert.deepEqual([...storage.data],before);
});
await asyncTest('stale Lexical source identity rejects without creating an English or Lexical write',async()=>{
 const storage=new MemoryStorage(),thread=clone(lexicalThread);thread.lexicalEvidence.source_hash='stale';
 await assert.rejects(lexicalBridge.prepareEnglishLexicalReturn(storage,{...returnArgs,threads:[thread]}),/CURRENT_SOURCE_CHANGED/);assert.equal(storage.length,0);
});
test('native first Source snapshot cannot be rewritten under the same revision',()=>{
 const {storage,meta,value}=installedV1();const changed=clone(value);changed.binding.source_snapshot={material:'invented'};
 assert.throws(()=>evidence.saveEnglishAttempt(storage,currentKey(meta.object_id),changed,meta,{now}),/BINDING_IMMUTABLE/);
});
test('equal-revision divergent local draft is not retired by a backup archive',()=>{
 const key='kianos-reading-attempt-v1:fork',archiveKey='kianos-english-attempt-archive-v1:fork-attempt';
 const archived={answers:{q1:'A'},binding:{task:'reading_a',object_id:'fork',source_hash:'h',attempt_id:'fork-attempt',revision:4}};
 const local=clone(archived);local.answers.q1='B';const raw=JSON.stringify(local),storage=new MemoryStorage({[key]:raw});
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:JSON.stringify(archived)}});
 assert.equal(storage.getItem(key),raw);
});
test('lower-revision divergent local draft is not retired by a backup archive',()=>{
 const key='kianos-reading-attempt-v1:older-fork',archiveKey='kianos-english-attempt-archive-v1:older-fork-attempt';
 const archived={answers:{q1:'A'},binding:{task:'reading_a',object_id:'older-fork',source_hash:'h',attempt_id:'older-fork-attempt',revision:4}};
 const local=clone(archived);local.answers.q1='unique local answer';local.binding.revision=3;
 const raw=JSON.stringify(local),storage=new MemoryStorage({[key]:raw});
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:JSON.stringify(archived)}});
 assert.equal(storage.getItem(key),raw);
});
test('content-equivalent older revision may retire when its complete content is archived',()=>{
 const key='kianos-reading-attempt-v1:older-copy',archiveKey='kianos-english-attempt-archive-v1:older-copy-attempt';
 const archived={answers:{q1:'A'},binding:{task:'reading_a',object_id:'older-copy',source_hash:'h',attempt_id:'older-copy-attempt',revision:4},saved_at:new Date(now).toISOString()};
 const local=clone(archived);local.binding.revision=3;local.saved_at=new Date(now-1000).toISOString();
 const storage=new MemoryStorage({[key]:JSON.stringify(local)});
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:JSON.stringify(archived)}});
 assert.equal(storage.getItem(key),null);
});
test('keepLocal recovery preserves divergent current bytes and fills absent native entries',()=>{
 const key='kianos-reading-attempt-v1:keep',meta=metaFor('keep'),storage=new MemoryStorage();
 const local={answers:{q1:'my local answer'},submitted:false};evidence.saveEnglishAttempt(storage,key,local,meta,{now});
 const raw=storage.getItem(key),incoming=clone(local);incoming.answers.q1='backup answer';
 const payload={schema:'kianos.english.private-payload.v1',entries:{[key]:JSON.stringify(incoming),'kianos-reading-last-location-v1':'{"id":"keep"}'}};
 assert.throws(()=>evidence.restoreEnglishCheckpoint(storage,payload),/CONFLICT_KEEP_LOCAL/);
 evidence.restoreEnglishCheckpoint(storage,payload,{keepLocal:true});
 assert.equal(storage.getItem(key),raw);assert.equal(storage.getItem('kianos-reading-last-location-v1'),payload.entries['kianos-reading-last-location-v1']);
});
test('keepLocal conflicting archive never authorizes retirement',()=>{
 const key='kianos-reading-attempt-v1:conflict',archiveKey='kianos-english-attempt-archive-v1:conflict-attempt';
 const local={answers:{q1:'keep'},binding:{task:'reading_a',object_id:'conflict',source_hash:'h',attempt_id:'conflict-attempt',revision:4}};
 const raw=JSON.stringify(local),storage=new MemoryStorage({[key]:raw,[archiveKey]:raw});
 const incoming=clone(local);incoming.answers.q1='different';
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:JSON.stringify(incoming)}},{keepLocal:true});
 assert.equal(storage.getItem(key),raw);assert.equal(storage.getItem(archiveKey),raw);
});
test('keepLocal does not resurrect archived current and preserves corrupt local bytes',()=>{
 const {storage,meta,v2}=installedV1(),old=evidence.exportEnglishCheckpoint(storage);
 evidence.advanceEnglishSourceRevision(storage,v2,{catalog:[v2],expectedRaw:storage.getItem(currentKey(meta.object_id)),now});
 storage.setItem(exam.ENGLISH_EXAM_SESSION_KEY,'{local-corrupt');
 const incoming={...old,entries:{...old.entries,[exam.ENGLISH_EXAM_SESSION_KEY]:JSON.stringify(releasedSession('backup').released)}};
 evidence.restoreEnglishCheckpoint(storage,incoming,{keepLocal:true});
 assert.equal(storage.getItem(currentKey(meta.object_id)),null);assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY),'{local-corrupt');
 assert.equal(evidence.exportEnglishCheckpoint(storage).native_integrity.status,'corrupt-retained');
});
test('native restore does not resurrect an exactly archived Whole-Paper session',()=>{
 const state=releasedSession('archived-paper').released,raw=JSON.stringify(state),archiveKey='kianos-english-exam-archive-v1:'+state.session_id;
 const storage=new MemoryStorage({[archiveKey]:raw});
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[exam.ENGLISH_EXAM_SESSION_KEY]:raw}},{keepLocal:true});
 assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY),null);assert.equal(storage.getItem(archiveKey),raw);
 assert.equal(evidence.exportEnglishCheckpoint(storage).native_integrity.retired_current[0].session_id,state.session_id);
});
test('divergent archived Whole-Paper current bytes are preserved but cannot execute',()=>{
 const state=releasedSession('divergent-paper').released,raw=JSON.stringify(state),archiveKey='kianos-english-exam-archive-v1:'+state.session_id;
 const divergent=clone(state);divergent.captures.s6.payload.first_attempts.q0='unique local translation';
 const local=JSON.stringify(divergent),storage=new MemoryStorage({[exam.ENGLISH_EXAM_SESSION_KEY]:local});
 evidence.restoreEnglishCheckpoint(storage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:raw}},{keepLocal:true});
 assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY),local);assert.equal(exam.inspectEnglishExamSession(storage).status,'invalid');
 assert.match(exam.inspectEnglishExamSession(storage).error,/RETIRED/);
 assert.throws(()=>exam.writeEnglishExamSession(storage,divergent),/CURRENT_SESSION_CHANGED/);
});
const report={basis:'selected native reconciliation on main; upstream L2 cases plus divergent-recovery regression',
  execution:'Node isolated in-memory synthetic fixtures; no real learner data, protected source consumption, browser or deployed claim',
  status:'PASS_BOUNDED_REPAIR_ONLY',native_closure_ready:false,tests:tests.length,checks:tests};
console.log(JSON.stringify(report,null,2));
