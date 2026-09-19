// No true-exam content. These tests assert the learner contract against actual modules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as E from '../../static-web/src/lib/englishLearnerEvidence.mjs';
import * as S from '../../static-web/src/lib/englishSessionControl.mjs';
import * as X from '../../static-web/src/lib/englishExamSession.mjs';
import * as T from '../../static-web/src/lib/translationRuntimeModel.mjs';
import * as W from '../../static-web/src/lib/writingRuntimeModel.mjs';
import {prepareEnglishLexicalReturn} from '../../static-web/src/lib/englishLexicalReturn.mjs';
import {validateCurrentLexicalTarget} from '../../static-web/src/lib/lexicalEnglishEvidence.mjs';
import {saveSharedControlToPrivate,restoreSharedControlFromPrivate} from '../../static-web/src/lib/privateCheckpointRuntime.mjs';
import {captureSharedControlCheckpoint} from '../../static-web/src/lib/sharedControlCheckpoint.mjs';
import {buildPrivateLearnerCheckpoint} from '../../static-web/src/lib/privateLearnerCheckpoint.mjs';
class Storage {data=new Map();failOnce=null; get length(){return this.data.size;} key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(k)??null;}setItem(k,v){if(this.failOnce===k){this.failOnce=null;throw new Error('injected failure');}this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const out=process.env.ENGLISH_AUDIT_DIR||'/mnt/data/english-audit';fs.mkdirSync(out,{recursive:true});
const checks=[];const knownBlockers=[];
const check=async(id,fn)=>{try{await fn();checks.push({id,status:'PASS'});}catch(e){checks.push({id,status:'FAIL',error:e.stack});}};
const now=Date.parse('2026-09-19T09:00:00Z');const at=o=>new Date(now+o).toISOString();
const meta={task:'reading_a',object_id:'synthetic-material',source_hash:'r1',snapshot:{paragraphs:[{text:'Synthetic source version one.'}]}};
const key='kianos-reading-attempt-v1:synthetic-material';
const instruction={schema:S.ENGLISH_SESSION_SCHEMA,session_id:'synthetic-s1',study_day:'2026-09-19',generated_at:at(0),steps:[{step_id:'r',task:'reading_a',object_id:meta.object_id,source_hash:'r1',params:{material_exposure:{state:'unseen',basis:'learner_statement',observed_at:at(-1000),note:'SYNTHETIC TEST testimony, not Kian evidence.'}}}]};
const catalog=[{...meta}];
await check('fresh.unknown-is-not-unseen',()=>{const s=new Storage(),v={answers:{}};E.saveEnglishAttempt(s,key,v,meta,{now});assert.equal(v.binding.prior_exposure,'unknown');assert.equal(v.binding.context,'study');});
await check('fresh.explicit-testimony-not-content-default',()=>{const s=new Storage();S.writeEnglishSessionInstruction(s,instruction,'2026-09-19',{catalog,now});const v={answers:{}};E.saveEnglishAttempt(s,key,v,meta,{now:now+1000});assert.equal(v.binding.prior_exposure,'unseen');assert.equal(v.binding.legacy_unversioned,false);});
await check('fresh.exposure-cannot-be-declared-unseen-again',()=>{const s=new Storage();E.saveEnglishAttempt(s,key,{answers:{}},meta,{now});assert.throws(()=>S.writeEnglishSessionInstruction(s,instruction,'2026-09-19',{catalog,now}));assert.equal(s.getItem(S.ENGLISH_SESSION_KEY),null);});
await check('fresh.partial-instruction-exposure-write-rollback',()=>{const s=new Storage();s.failOnce=E.ENGLISH_MATERIAL_EXPOSURE_KEY;assert.throws(()=>S.writeEnglishSessionInstruction(s,instruction,'2026-09-19',{catalog,now}));assert.equal(s.length,0);});
await check('evidence.current-edit-does-not-reinterpret-old-attempt',()=>{const s=new Storage(),v={answers:{q1:'B'}};E.saveEnglishAttempt(s,key,v,meta,{now});const raw=s.getItem(key);assert.throws(()=>E.saveEnglishAttempt(s,key,v,{...meta,source_hash:'r2'},{now}));assert.equal(s.getItem(key),raw);assert.equal(JSON.parse(raw).binding.source_snapshot.paragraphs[0].text,'Synthetic source version one.');});
await check('evidence.corrupt-state-not-silently-reset',()=>{const s=new Storage();s.setItem(key,'{broken');assert.throws(()=>E.saveEnglishAttempt(s,key,{answers:{}},meta,{now}));assert.equal(s.getItem(key),'{broken');});
await check('evidence.first-answer-cannot-be-replaced-after-freeze',()=>{const s=new Storage(),v={answers:{q1:'B'}};E.saveEnglishAttempt(s,key,v,meta,{now});v.submitted=true;v.submittedAt=at(1000);E.saveEnglishAttempt(s,key,v,meta,{now:now+1000});const before=s.getItem(key);assert.throws(()=>E.saveEnglishAttempt(s,key,{...v,submittedAt:at(2000)},meta,{now:now+2000}));assert.equal(s.getItem(key),before);});
await check('evidence.retry-preserves-raw-first-snapshot',()=>{const s=new Storage(),v={answers:{q1:'B'},submitted:true,submittedAt:at(0)};E.saveEnglishAttempt(s,key,v,meta,{now});const id=v.binding.attempt_id;E.archiveEnglishAttempt(s,key,now+1000);assert.equal(s.getItem(key),null);assert.equal(JSON.parse(s.getItem('kianos-english-attempt-archive-v1:'+id)).answers.q1,'B');const next={answers:{}};E.saveEnglishAttempt(s,key,next,meta,{now:now+2000});assert.equal(next.binding.prior_exposure,'exposed');assert.notEqual(next.binding.attempt_id,id);});
await check('evidence.stale-tab-cannot-overwrite-newer-answer',()=>{const s=new Storage(),v={answers:{q1:'A'}};E.saveEnglishAttempt(s,key,v,meta,{now});const stale=structuredClone(v);v.answers.q1='B';E.saveEnglishAttempt(s,key,v,meta,{now:now+1000});assert.throws(()=>E.saveEnglishAttempt(s,key,stale,meta,{now:now+2000}));assert.equal(JSON.parse(s.getItem(key)).answers.q1,'B');});
await check('evidence.atomic-state-exposure-ledger-rollback',()=>{const s=new Storage();s.failOnce=E.ENGLISH_MATERIAL_EXPOSURE_KEY;assert.throws(()=>E.saveEnglishAttempt(s,key,{answers:{q1:'A'}},meta,{now}));assert.equal(s.length,0);});
await check('evidence.pre-submit-assistance-survives-stale-in-memory-binding',()=>{const s=new Storage(),v={answers:{q1:'A'}};E.saveEnglishAttempt(s,key,v,meta,{now});E.markEnglishAssistance(s,'Reading A',meta.object_id,now+100);v.submitted=true;v.submittedAt=at(200);E.saveEnglishAttempt(s,key,v,meta,{now:now+200});assert.equal(v.firstEvidenceMeta.assistance,'assisted');});
await check('evidence.post-submit-lookup-does-not-rewrite-clean-first',()=>{const s=new Storage(),v={answers:{q1:'A'}};S.writeEnglishSessionInstruction(s,instruction,'2026-09-19',{catalog,now});E.saveEnglishAttempt(s,key,v,meta,{now});v.submitted=true;v.submittedAt=at(100);E.saveEnglishAttempt(s,key,v,meta,{now:now+100});E.markEnglishAssistance(s,'Reading A',meta.object_id,now+200);const r=JSON.parse(s.getItem(key));assert.equal(r.binding.assistance,'assisted');assert.equal(r.firstEvidenceMeta.assistance,'unassisted');});
await check('recovery.english-adapter-roundtrip-no-foreign-keys',()=>{const s=new Storage();E.saveEnglishAttempt(s,key,{answers:{q1:'B'}},meta,{now});s.setItem('foreign','private other subject');const p=E.exportEnglishCheckpoint(s);assert.ok(!('foreign' in p.entries));const dest=new Storage();E.restoreEnglishCheckpoint(dest,p);assert.equal(dest.getItem(key),s.getItem(key));assert.equal(dest.getItem(E.ENGLISH_MATERIAL_EXPOSURE_KEY),s.getItem(E.ENGLISH_MATERIAL_EXPOSURE_KEY));const raw=[...dest.data];E.restoreEnglishCheckpoint(dest,p);assert.deepEqual([...dest.data],raw);});
await check('recovery.invalid-return-cannot-partially-restore',()=>{const s=new Storage();assert.throws(()=>E.restoreEnglishCheckpoint(s,{schema:'kianos.english.private-payload.v1',entries:{[key]:'{}',foreign:'{}'}}));assert.equal(s.length,0);});
await check('recovery.conflict-preserves-existing-evidence',()=>{const s=new Storage();s.setItem(key,'{"prior":true}');assert.throws(()=>E.restoreEnglishCheckpoint(s,{schema:'kianos.english.private-payload.v1',entries:{[key]:'{}'}}));assert.equal(s.getItem(key),'{"prior":true}');});
const descriptor={word_id:'synthetic-word',ordinal:1,source_hash:'word-r1',targets:[{target_kind:'sense',target_id:'exact-sense',target_label:'Synthetic target'}]};
const thread={threadId:'t1',route:'lexical',lexicalEvidence:{word_id:'synthetic-word',ordinal:1,target_kind:'sense',target_id:'exact-sense',demand:'production',outcome:'WRONG'}};
const resolve=async event=>validateCurrentLexicalTarget(event,descriptor);
const context={task:'writing',objectId:'synthetic-writing',attemptSubmittedAt:at(0),attemptBinding:{prior_exposure:'unknown',assistance:'unassisted'},threads:[thread],resolve};
await check('lexical.prepare-no-side-effects-until-whole-packet-valid',async()=>{const s=new Storage();const result=await prepareEnglishLexicalReturn(s,context);assert.equal(s.length,0);E.atomicEnglishWrites(s,result.changes);assert.ok(s.length>0);const p=JSON.parse(s.getItem('kianos-vocabulary-astro-v2:synthetic-word'));assert.equal(p.lastSeenAt,'');assert.equal(p.revealed,false);});
await check('lexical.invalid-target-rejects-entire-mixed-return',async()=>{const s=new Storage(),bad=structuredClone(thread);bad.threadId='t2';bad.lexicalEvidence.target_id='invented';await assert.rejects(()=>prepareEnglishLexicalReturn(s,{...context,threads:[thread,bad]}));assert.equal(s.length,0);});
await check('lexical.replay-idempotent-and-no-new-coverage',async()=>{const s=new Storage();E.atomicEnglishWrites(s,(await prepareEnglishLexicalReturn(s,context)).changes);const before=[...s.data];E.atomicEnglishWrites(s,(await prepareEnglishLexicalReturn(s,context)).changes);assert.deepEqual([...s.data],before);});
await check('lexical.demand-required-no-default-to-recognition',async()=>{const s=new Storage(),bad=structuredClone(thread);delete bad.lexicalEvidence.demand;await assert.rejects(()=>prepareEnglishLexicalReturn(s,{...context,threads:[bad]}));assert.equal(s.length,0);});
await check('lexical.freshness-cannot-be-invented-by-return',async()=>{const s=new Storage(),bad=structuredClone(thread);bad.lexicalEvidence.context_novelty='fresh';await assert.rejects(()=>prepareEnglishLexicalReturn(s,{...context,threads:[bad]}));});
await check('lexical.exact-kind-ordinal-and-revision',()=>{for(const change of [{ordinal:2},{target_kind:'construction'},{target_id:'another-sense'},{source_hash:'word-r0'}])assert.throws(()=>validateCurrentLexicalTarget({...thread.lexicalEvidence,...change},descriptor));});
await check('translation.typed-return-stale-rejected-and-pass-replay-stable',()=>{const prompts=[{id:'q1'}];let s=T.blankTranslationState(prompts);s.drafts.q1='第一版';s=T.freezeWholeAttempt(s,prompts,at(0)).state;s.binding={source_hash:'tr1'};s.stage='diagnosis';const v={schema:T.TRANSLATION_RETURN_SCHEMA,task:'synthetic-translation',attemptSubmittedAt:at(0),sourceHash:'tr1',decision:'PASS'};assert.throws(()=>T.applyTranslationReturn(s,{...v,attemptSubmittedAt:at(-1)},prompts,null,{task:v.task}));const first=T.applyTranslationReturn(s,v,prompts,null,{task:v.task,now:at(1)});assert.deepEqual(T.applyTranslationReturn(first.state,v,prompts,first.ledger,{task:v.task,now:at(2)}),first);assert.equal(first.state.firstAttempts.q1,'第一版');});
await check('writing.typed-review-and-regeneration-bind-to-same-first-evidence',()=>{const task={id:'synthetic-writing',kind:'small',sourceKind:'synthetic',sourceHash:'w1',learnerTask:{directions:'Write an invitation.'}};let r=W.createInitialWritingRecord(task,[],at(0));r.binding={source_hash:'w1'};r=W.lockFirstAttempt(r,{planMode:'direct',firstDraft:'Please join us on Friday.'},at(1));const value={schema:W.WRITING_REVIEW_RETURN_SCHEMA,taskId:task.id,attemptSubmittedAt:r.firstSubmittedAt,sourceHash:'w1',reviewOf:'FIRST_DRAFT',verdict:'REPAIR_NEEDED',firstFailureLayer:W.WRITING_FAILURE_LAYERS[0],repairScope:'missing invitation detail',smallestRepair:'Give a location.',reason:'Synthetic missing requirement.'};r=W.applyWritingReviewReturn(r,value,at(2));r=W.lockWritingRegeneration(r,'Please join us at the library.',at(3));const packet=W.buildWritingRepairCheckPacket(task,r);assert.equal(packet.attemptSubmittedAt,r.firstSubmittedAt);const ret={schema:W.WRITING_REPAIR_RETURN_SCHEMA,taskId:task.id,attemptSubmittedAt:r.firstSubmittedAt,regenerationSubmittedAt:r.regenerationSubmittedAt,sourceHash:'w1',repairOf:'REGENERATION',verdict:'REPAIR_COMPLETE',reason:'Requirement now supplied',memoryAdmission:{admit:false}};assert.throws(()=>W.applyWritingRepairReturn(r,{...ret,regenerationSubmittedAt:at(-1)}));const result=W.applyWritingRepairReturn(r,ret,at(4));assert.equal(result.firstDraft,'Please join us on Friday.');assert.equal(result.state,'REPAIR_COMPLETE');assert.deepEqual(W.applyWritingRepairReturn(result,ret,at(5)),result);});
// Shared private-checkpoint durability is exercised here because English must not
// paper over a platform defect with a subject-local persistence service.
await check('recovery.shared-unavailable-read-cannot-write',async()=>{
  let writes=0;
  await assert.rejects(
    ()=>saveSharedControlToPrivate(new Storage(),{
      now,
      readCheckpoint:async()=>({status:'unavailable',error:'synthetic read outage'}),
      writeCheckpoint:async()=>{writes++;}
    }),
    /PRIVATE_CHECKPOINT_READ_UNSAFE/
  );
  assert.equal(writes,0);
});
await check('recovery.shared-restores-english-and-lexical-subjects',async()=>{
  const lexicalKey='kianos-lexical-ledger-v1';
  const cp=buildPrivateLearnerCheckpoint({
    studyDay:'2026-09-19',
    now,
    shared:captureSharedControlCheckpoint(new Storage(),{studyDay:'2026-09-19',now}),
    subjects:{
      english:{schema:'kianos.english.private-payload.v1',entries:{[key]:'{\"english\":true}'}},
      lexical:{schema:'kianos.lexical.private-payload.v1',entries:{[lexicalKey]:'{\"lexical\":true}'}}
    }
  });
  const storage=new Storage();
  const restored=await restoreSharedControlFromPrivate(storage,{now,readCheckpoint:async()=>({status:'ready',checkpoint:cp})});
  assert.equal(restored.status,'restored');
  assert.equal(restored.restored_subject_entries,2);
  assert.equal(storage.getItem(key),'{\"english\":true}');
  assert.equal(storage.getItem(lexicalKey),'{\"lexical\":true}');
});
await check('recovery.shared-subject-conflict-is-atomic',async()=>{
  const lexicalKey='kianos-lexical-ledger-v1';
  const source=new Storage();
  source.setItem('kianos-exam-profile-v1','{\"remote\":true}');
  const cp=buildPrivateLearnerCheckpoint({
    studyDay:'2026-09-19',
    now,
    shared:captureSharedControlCheckpoint(source,{studyDay:'2026-09-19',now}),
    subjects:{
      english:{schema:'kianos.english.private-payload.v1',entries:{[key]:'{\"remote\":true}'}},
      lexical:{schema:'kianos.lexical.private-payload.v1',entries:{[lexicalKey]:'{\"remote\":true}'}}
    }
  });
  const storage=new Storage();
  storage.setItem(key,'{\"local\":true}');
  const before=[...storage.data];
  await assert.rejects(
    ()=>restoreSharedControlFromPrivate(storage,{now,readCheckpoint:async()=>({status:'ready',checkpoint:cp})}),
    /CONFLICT_KEEP_LOCAL/
  );
  assert.deepEqual([...storage.data],before);
  assert.equal(storage.getItem(lexicalKey),null);
});
const result={synthetic_only:true,checks,known_shared_blockers:knownBlockers};fs.writeFileSync(out+'/adversarial-attacks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
