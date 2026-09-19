// Independent synthetic-only counterexamples. No learner or held-out data is used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as exam from '../src/lib/englishExamSession.mjs';
import * as session from '../src/lib/englishSessionControl.mjs';
import { lexicalEventFromObjectiveThread } from '../src/lib/lexicalEnglishEvidence.mjs';
import { emptyLexicalLedger, deriveRepairStates } from '../src/lib/lexicalEvidence.mjs';
import * as tr from '../src/lib/translationRuntimeModel.mjs';
import * as wr from '../src/lib/writingRuntimeModel.mjs';
import { passWritingManualReview } from '../src/lib/englishProductiveConvergenceModel.mjs';
import { saveSharedControlToPrivate } from '../src/lib/privateCheckpointRuntime.mjs';

const now = Date.parse('2026-09-19T00:00:00Z');
const iso = n => new Date(now + n).toISOString();
const mem = () => {
  const data = new Map();
  return {getItem:k=>data.get(k)??null, setItem:(k,v)=>data.set(k,String(v)), removeItem:k=>data.delete(k), key:i=>[...data.keys()][i]??null, get length(){return data.size}};
};
const paper = {schema:'kianos.english.exam-paper.v1',paper_id:'synthetic-audit',year:2026,duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,default_task_order:['cloze','reading_a','reading_b','translation','writing'],steps:[
  {step_id:'cl',task:'cloze',object_id:'s-cl',max_points:10},
  ...[1,2,3,4].map(i=>({step_id:`ra${i}`,task:'reading_a',object_id:`s-ra${i}`,max_points:10})),
  {step_id:'rb',task:'reading_b',object_id:'s-rb',max_points:10},
  {step_id:'tr',task:'translation',object_id:'s-tr',max_points:10},
  {step_id:'ws',task:'writing',object_id:'s-ws',writing_kind:'small',max_points:10},
  {step_id:'wb',task:'writing',object_id:'s-wb',writing_kind:'big',max_points:20}
]};
const freshExam = () => exam.startEnglishExamSession(paper,{now,sessionId:'synthetic-session'});
const instruction = () => ({schema:session.ENGLISH_SESSION_SCHEMA,session_id:'instruction-1',study_day:'2026-09-19',generated_at:iso(0),current_step:0,steps:[{step_id:'a',task:'reading_a',object_id:'s-ra1'},{step_id:'b',task:'cloze',object_id:'s-cl'}]});
const catalog = {reading_a:['s-ra1'],cloze:['s-cl'],reading_b:['s-rb'],translation:['s-tr'],writing:['s-ws','s-wb'],full_paper:['synthetic-audit']};
const results=[];
const test=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}};

await test('whole-paper uses one absolute 180-minute deadline and nine natural parts',()=>{const s=freshExam();assert.equal(s.steps.length,9);assert.equal(exam.englishExamRemainingMs(s,now+10_000),10_790_000);assert.equal(s.total_points,100);});
await test('invalid task-order permutation is rejected',()=>assert.throws(()=>exam.startEnglishExamSession(paper,{now,taskOrder:['writing','writing']})));
await test('invalid deadline cannot silently become an endless exam',()=>{const s=freshExam();s.deadline_at='invalid';assert.throws(()=>exam.validateEnglishExamSession(s));});
await test('post-deadline captures are rejected',()=>assert.throws(()=>exam.captureEnglishExamStep(freshExam(),{stepId:'cl',task:'cloze',objectId:'s-cl',payload:{answers:{q1:'A'}},now:now+180*60_000+1})));
await test('stale active tab cannot resurrect a sealed exam',()=>{const store=mem();const s=freshExam();exam.writeEnglishExamSession(store,s);exam.writeEnglishExamSession(store,exam.sealEnglishExamSession(s,now+1000));assert.throws(()=>exam.writeEnglishExamSession(store,s));});
await test('Seal includes unfinished saved answers, translation and essay without ordinary-state contamination',()=>{const store=mem();const s=freshExam();const prefix=`kianos-english-exam-task-v1:${s.session_id}:`;
store.setItem(prefix+'cloze:s-cl',JSON.stringify({answers:{q1:'B'},uncertain:['q1']}));
store.setItem(prefix+'translation:s-tr',JSON.stringify({drafts:{t1:'保留的译文'}}));
store.setItem(prefix+'writing:s-wb',JSON.stringify({planMode:'direct',draftEssay:'The independently written draft.'}));
store.setItem('kianos-reading-attempt-v1:s-ra1',JSON.stringify({answers:{q1:'D'}}));
assert.equal(typeof exam.sealEnglishExamFromStorage,'function');const sealed=exam.sealEnglishExamFromStorage(store,s,now+60000);
assert.equal(sealed.captures.cl.payload.answers.q1,'B');assert.equal(sealed.captures.tr.payload.answers.t1,'保留的译文');assert.equal(sealed.captures.wb.payload.essay,'The independently written draft.');assert.equal(sealed.captures.ra1,undefined);assert.equal(JSON.parse(store.getItem('kianos-reading-attempt-v1:s-ra1')).answers.q1,'D');});
await test('objective release is sixty points, productive output has no invented score, replay is immutable',()=>{let s=freshExam();for(const row of paper.steps.filter(x=>['cloze','reading_a','reading_b'].includes(x.task))){s=exam.captureEnglishExamStep(s,{stepId:row.step_id,task:row.task,objectId:row.object_id,payload:{answers:{q:'A'}},now:now+100});}s=exam.sealEnglishExamSession(s,now+500);const packet={schema:exam.ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:paper.paper_id,steps:Object.fromEntries(paper.steps.filter(x=>['cloze','reading_a','reading_b'].includes(x.task)).map(x=>[x.step_id,{answers:{q:'A'}}]))};const released=exam.releaseEnglishExamObjective(s,packet,now+600);assert.equal(released.release.objective.points,60);assert.equal(released.release.productive.points,undefined);assert.deepEqual(exam.releaseEnglishExamObjective(released,packet,now+700),released);});
await test('stale-day and malformed Session Instruction fail before writes',()=>{const store=mem();store.setItem(session.ENGLISH_SESSION_KEY,'unchanged');assert.throws(()=>session.writeEnglishSessionInstruction(store,instruction(),'2026-09-20',catalog));assert.equal(store.getItem(session.ENGLISH_SESSION_KEY),'unchanged');});
await test('invented Current object id is rejected atomically',()=>{const store=mem();const i=instruction();i.steps[1].object_id='invented';assert.throws(()=>session.writeEnglishSessionInstruction(store,i,'2026-09-19',catalog));assert.equal(store.getItem(session.ENGLISH_SESSION_KEY),null);});
await test('duplicate Session step identity is rejected',()=>{const i=instruction();i.steps[1].step_id='a';assert.throws(()=>session.validateEnglishSessionInstruction(i,'2026-09-19'));});
await test('same instruction replay cannot rewind its existing cursor',()=>{const store=mem();let i=instruction();session.writeEnglishSessionInstruction(store,i,'2026-09-19',catalog);i.current_step=1;store.setItem(session.ENGLISH_SESSION_KEY,JSON.stringify(session.validateEnglishSessionInstruction(i)));const r=session.writeEnglishSessionInstruction(store,instruction(),'2026-09-19',catalog);assert.equal(r.current_step,1);});
await test('older same-day Chat instruction cannot replace a newer one',()=>{const store=mem();const newer=instruction();newer.session_id='new';newer.generated_at=iso(10000);session.writeEnglishSessionInstruction(store,newer,'2026-09-19',catalog);assert.throws(()=>session.writeEnglishSessionInstruction(store,instruction(),'2026-09-19',catalog));assert.equal(JSON.parse(store.getItem(session.ENGLISH_SESSION_KEY)).session_id,'new');});
const lexicalThread={threadId:'t1',route:'lexical',lexicalEvidence:{word_id:'synthetic-word',ordinal:1,target_kind:'sense',target_id:'sense-1',outcome:'WRONG',demand:'production'}};
await test('Lexical occurrences on two attempts have different identities but one replay is identical',()=>{const args={task:'writing',objectId:'s-ws',thread:lexicalThread};const a=lexicalEventFromObjectiveThread({...args,attemptSubmittedAt:iso(1)});const b=lexicalEventFromObjectiveThread({...args,attemptSubmittedAt:iso(2)});assert.equal(a.status,'READY');assert.notEqual(a.event.event_id,b.event.event_id);assert.deepEqual(a,lexicalEventFromObjectiveThread({...args,attemptSubmittedAt:iso(1)}));});
await test('recognition success cannot erase an unresolved production failure',()=>{const base={word_id:'synthetic-word',ordinal:1,target_kind:'sense',target_id:'sense-1',source:'writing',attribution:'lexical'};const ledger=emptyLexicalLedger();ledger.events=[{...base,event_id:'p',demand:'production',outcome:'WRONG',observed_at:iso(1)},{...base,event_id:'r',demand:'recognition',outcome:'WRONG',observed_at:iso(2)},{...base,event_id:'s',demand:'recognition',outcome:'CORRECT',delayed:true,assistance:'unassisted',context_novelty:'fresh',observed_at:iso(3)}];const state=Object.values(deriveRepairStates(ledger))[0];assert.equal(state.state,'ACTIVE');});
await test('Translation same task revision preserves frozen first attempt',()=>{const prompts=[{id:'t1'}];let s=tr.blankTranslationState(prompts);s.drafts.t1='独立译文';s=tr.freezeWholeAttempt(s,prompts,iso(1)).state;s.drafts.t1='改后译文';const restored=tr.normalizeTranslationState(prompts,s);assert.equal(restored.firstAttempts.t1,'独立译文');});
await test('Translation changed segment identity does not delete first evidence',()=>{const prompts=[{id:'t1'}];let s=tr.blankTranslationState(prompts);s.drafts.t1='独立译文';s=tr.freezeWholeAttempt(s,prompts,iso(1)).state;let result;try{result=tr.normalizeTranslationState([...prompts,{id:'t2'}],s);}catch(e){assert.match(e.message,/IDENTITY|SOURCE|MISMATCH/);return;}assert.ok(result.firstAttempts.t1==='独立译文'||(result.history||[]).some(x=>x.firstAttempts?.t1==='独立译文'));});
await test('Writing Direct and low-friction manual PASS preserve first draft and make no transfer debt',()=>{const task={id:'s-ws',kind:'small',sourceKind:'synthetic'};let s=wr.createInitialWritingRecord(task,[],iso(0));s=wr.lockFirstAttempt(s,{planMode:'direct',firstDraft:'Dear Sam, Please join the reading group on Friday at two in the library. We will discuss short stories. Regards, Pat'},iso(100));assert.equal(s.firstPlan,'');const first=s.firstDraft;s=passWritingManualReview(s,'',iso(200));assert.equal(s.firstDraft,first);assert.equal(s.state,'PASS_ACCEPTABLE');assert.equal(s.repairReturn,null);});
// Known shared-owner limitation: inspect rather than pretending it is English persistence.
let checkpoint;
const store=mem();store.setItem('kianos-writing-runtime-v1:s-ws',JSON.stringify({firstDraft:'private draft'}));
await saveSharedControlToPrivate(store,{now,readCheckpoint:async()=>({status:'missing'}),writeCheckpoint:async value=>{checkpoint=value;}});
const observations=[{name:'Shared checkpoint current English subject coverage',status:JSON.stringify(checkpoint.payload.subjects).includes('private draft')?'PRESENT':'BLOCKED',detail:'Shared runtime saves shared profile/plan/timer only; it does not collect current English first drafts.'}];
const report={baseline:'0536e1563b2ad9c52551fefb7369995170a4e103',generated_at:new Date().toISOString(),synthetic_only:true,results,observations,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length};
console.log(JSON.stringify(report,null,2));
if(process.env.AUDIT_OUTPUT) fs.writeFileSync(process.env.AUDIT_OUTPUT,JSON.stringify(report,null,2)+'\n');
if(report.fail)process.exitCode=1;
