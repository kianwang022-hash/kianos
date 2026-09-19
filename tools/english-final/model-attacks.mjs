// Independent learner-invariant attacks. All content and learner events here are synthetic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as session from '../../static-web/src/lib/englishSessionControl.mjs';
import * as exam from '../../static-web/src/lib/englishExamSession.mjs';
import * as lexical from '../../static-web/src/lib/lexicalEvidence.mjs';
import {lexicalEventFromObjectiveThread} from '../../static-web/src/lib/lexicalEnglishEvidence.mjs';
import * as writing from '../../static-web/src/lib/writingRuntimeModel.mjs';
import * as translation from '../../static-web/src/lib/translationRuntimeModel.mjs';
export class MemoryStorage {
  data=new Map(); failKey=null;
  get length(){return this.data.size;}
  key(i){return [...this.data.keys()][i]??null;}
  getItem(k){return this.data.get(k)??null;}
  setItem(k,v){if(this.failKey===k) throw new Error('synthetic storage fault');this.data.set(k,String(v));}
  removeItem(k){this.data.delete(k);}
}
const t=Date.parse('2026-09-19T09:00:00Z');
const iso=(offset=0)=>new Date(t+offset).toISOString();
export function syntheticPaper(){
  const tasks=['cloze','reading_a','reading_a','reading_a','reading_a','reading_b','translation','writing','writing'];
  return {schema:'kianos.english.exam-paper.v1',paper_id:'synthetic-paper',year:0,duration_minutes:180,total_points:100,objective_max_points:60,productive_max_points:40,
    default_task_order:['cloze','reading_a','reading_b','translation','writing'],
    steps:tasks.map((task,i)=>({step_id:`${task}:s${i}`,task,object_id:`synthetic-${i}`,max_points:i===8?20:10,...(task==='writing'?{writing_kind:i===7?'small':'big'}:{}), question_ids: task==='cloze'?Array.from({length:20},(_,j)=>`q${j}`):task==='writing'?[]:Array.from({length:5},(_,j)=>`q${j}`), source_hash:`synthetic-revision-${i}`}))};
}
export const checks=[];
function check(id,fn){try{fn();checks.push({id,status:'PASS'});}catch(e){checks.push({id,status:'FAIL',error:e.message});}}
const instruction=(id='s1',generated=iso())=>({schema:session.ENGLISH_SESSION_SCHEMA,session_id:id,study_day:'2026-09-19',generated_at:generated,steps:[{step_id:'r',task:'reading_a',object_id:'synthetic-reading',source_hash:'r1'}]});
const catalog=[{task:'reading_a',object_id:'synthetic-reading',source_hash:'r1'}];
check('session.invented-id-rejected-without-write',()=>{const s=new MemoryStorage();const v=instruction();v.steps[0].object_id='invented-id';assert.throws(()=>session.writeEnglishSessionInstruction(s,v,'2026-09-19',{catalog,now:t}));assert.equal(s.length,0);});
check('session.duplicate-step-id-rejected',()=>{const v=instruction();v.steps.push({...v.steps[0]});assert.throws(()=>session.validateEnglishSessionInstruction(v,'2026-09-19'));});
check('session.same-id-conflicting-replay-rejected',()=>{const s=new MemoryStorage();session.writeEnglishSessionInstruction(s,instruction(),'2026-09-19',{catalog,now:t});const before=s.getItem(session.ENGLISH_SESSION_KEY);const v=instruction();v.steps[0].note='different instruction';assert.throws(()=>session.writeEnglishSessionInstruction(s,v,'2026-09-19',{catalog,now:t}));assert.equal(s.getItem(session.ENGLISH_SESSION_KEY),before);});
check('session.older-same-day-does-not-overwrite',()=>{const s=new MemoryStorage();session.writeEnglishSessionInstruction(s,instruction('new',iso(1000)),'2026-09-19',{catalog,now:t+1000});const before=s.getItem(session.ENGLISH_SESSION_KEY);assert.throws(()=>session.writeEnglishSessionInstruction(s,instruction('old'),'2026-09-19',{catalog,now:t+1000}));assert.equal(s.getItem(session.ENGLISH_SESSION_KEY),before);});
check('exam.exact-180-minutes-structure',()=>{const p=syntheticPaper();const s=exam.startEnglishExamSession(p,{now:t});assert.equal(s.steps.length,9);assert.equal(exam.englishExamRemainingMs(s,t),180*60000);p.duration_minutes=181;assert.throws(()=>exam.startEnglishExamSession(p,{now:t}));});
check('exam.capture-after-deadline-rejected',()=>{const s=exam.startEnglishExamSession(syntheticPaper(),{now:t});const step=s.steps[0];assert.throws(()=>exam.captureEnglishExamStep(s,{stepId:step.step_id,task:step.task,objectId:step.object_id,payload:{answers:{q0:'A'}},now:t+180*60000+1}));});
check('exam.malformed-clock-rejected',()=>{const s=exam.startEnglishExamSession(syntheticPaper(),{now:t});s.deadline_at='invalid';assert.throws(()=>exam.validateEnglishExamSession(s));});
check('exam.old-tab-cannot-reopen-sealed-session',()=>{const storage=new MemoryStorage();const s=exam.startEnglishExamSession(syntheticPaper(),{now:t});exam.writeEnglishExamSession(storage,s);exam.writeEnglishExamSession(storage,exam.sealEnglishExamSession(s,t+1000));const before=storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY);assert.throws(()=>exam.writeEnglishExamSession(storage,s));assert.equal(storage.getItem(exam.ENGLISH_EXAM_SESSION_KEY),before);});
check('exam.release-replay-does-not-recalculate',()=>{const s=exam.sealEnglishExamSession(exam.startEnglishExamSession(syntheticPaper(),{now:t}),t+1000);const packet={schema:exam.ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:s.paper_id,steps:Object.fromEntries(s.steps.filter(x=>['cloze','reading_a','reading_b'].includes(x.task)).map(x=>[x.step_id,{source_hash:x.source_hash,answers:Object.fromEntries(x.question_ids.map(id=>[id,'A']))}]))};const a=exam.releaseEnglishExamObjective(s,packet,t+2000);const b=exam.releaseEnglishExamObjective(a,packet,t+3000);assert.deepEqual(b,a);assert.equal(a.release.productive.status,'CHAT_REVIEW_REQUIRED');assert.equal(a.release.objective.max_points,60);});
check('exam.seal-captures-unfinished-autosaved-work',()=>{const storage=new MemoryStorage();const s=exam.startEnglishExamSession(syntheticPaper(),{now:t});const step=s.steps[0];storage.setItem(`kianos-english-exam-task-v1:${s.session_id}:${step.task}:${step.object_id}`,JSON.stringify({answers:{q0:'B'},updatedAt:iso(900)}));const sealed=exam.sealEnglishExamSession(s,t+1000,{storage});assert.equal(sealed.captures[step.step_id]?.payload?.answers?.q0,'B');});
const event=(id,demand,outcome,offset)=>({event_id:id,word_id:'synthetic-word',ordinal:1,target_kind:'construction',target_id:'synthetic-construction',source:'writing',attribution:'lexical',observed_at:iso(offset),demand,outcome,context_id:id,delayed:true,assistance:'unassisted',context_novelty:'fresh'});
check('lexical.production-not-closed-by-recognition',()=>{let l=lexical.emptyLexicalLedger();for(const e of [event('prod','production','WRONG',0),event('rec-fail','recognition','WRONG',1000),event('rec-pass','recognition','CORRECT',2000)])l=lexical.appendEvidenceEvent(l,e).ledger;assert.equal(Object.values(lexical.deriveRepairStates(l))[0].state,'ACTIVE');});
const thread={threadId:'t1',route:'lexical',lexicalEvidence:{word_id:'synthetic-word',ordinal:1,target_kind:'sense',target_id:'synthetic-sense',outcome:'WRONG',demand:'recognition'}};
check('lexical.distinct-attempts-have-distinct-event-identity',()=>{const a=lexicalEventFromObjectiveThread({task:'reading_a',objectId:'synthetic-reading',attemptSubmittedAt:iso(),thread});const b=lexicalEventFromObjectiveThread({task:'reading_a',objectId:'synthetic-reading',attemptSubmittedAt:iso(1000),thread});assert.notEqual(a.event.event_id,b.event.event_id);});
const task={id:'synthetic-writing',kind:'small',sourceKind:'synthetic',learnerTask:{directions:'Write a short invitation.'}};
const initial=()=>writing.lockFirstAttempt(writing.createInitialWritingRecord(task,[],iso()),{planMode:'direct',firstDraft:'Please join our event on Friday.'},iso(1000));
check('writing.direct-does-not-fabricate-plan',()=>{const r=initial();assert.equal(r.firstPlan,'');assert.equal(writing.buildWritingReviewPacket(task,r).firstMeaningfulPlanning.text,null);});
check('writing.stale-review-cannot-mutate-new-attempt',()=>{const r=initial();const value={schema:writing.WRITING_REVIEW_RETURN_SCHEMA,taskId:task.id,reviewOf:'FIRST_DRAFT',verdict:'PASS_ACCEPTABLE',reason:'Synthetic old review',attemptSubmittedAt:iso(-1000)};const review=writing.validateWritingReviewReturn(value,task.id);assert.throws(()=>writing.applyWritingReviewReturn(r,review,iso(2000)));});
check('translation.freeze-cannot-overwrite-first-attempt',()=>{const prompts=[{id:'s1'}];let r=translation.blankTranslationState(prompts);r.drafts.s1='第一次';r=translation.freezeWholeAttempt(r,prompts,iso()).state;r.drafts.s1='后来';let second;try{second=translation.freezeWholeAttempt(r,prompts,iso(1000));}catch{}assert.ok(!second?.ok||second.state.firstAttempts.s1==='第一次');});
check('translation.schema-mismatch-preserves-raw-evidence',()=>{const prompts=[{id:'s1'}];const r={version:999,stage:'decision',firstAttempts:{s1:'必须保留'},firstSubmittedAt:iso()};assert.throws(()=>translation.normalizeTranslationState(prompts,r));});
const output={synthetic_only:true,source_baseline:'c8ae5404fcaf57f3bf5f8c583b1a0249e0907f9b',checks};
console.log(JSON.stringify(output,null,2));
if(process.env.ENGLISH_AUDIT_OUTPUT)fs.writeFileSync(process.env.ENGLISH_AUDIT_OUTPUT,JSON.stringify(output,null,2)+'\n');
if(checks.some(x=>x.status==='FAIL')&&process.env.ENGLISH_AUDIT_BASELINE!=='1') process.exitCode=1;
