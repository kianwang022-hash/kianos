// Synthetic private evidence only. Exercise the existing shared disk owner and actual sync script.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import * as E from '../../static-web/src/lib/englishLearnerEvidence.mjs';
import * as S from '../../static-web/src/lib/englishSessionControl.mjs';
import {buildPrivateLearnerCheckpoint} from '../../static-web/src/lib/privateLearnerCheckpoint.mjs';
import {captureSharedControlCheckpoint} from '../../static-web/src/lib/sharedControlCheckpoint.mjs';
import {writePrivateLearnerCheckpoint,readPrivateLearnerCheckpoint} from '../../static-web/scripts/privateLearnerStore.mjs';
import {listWritingExamRuntimeTasks,loadWritingExamRuntimeTask} from '../../static-web/src/lib/englishWritingRuntimeSourceTruth.mjs';
import {listEnglishExamPapers,loadEnglishExamPaper} from '../../static-web/src/lib/englishExamPaper.mjs';
class Storage{data=new Map();get length(){return this.data.size;}key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const out=process.env.ENGLISH_AUDIT_DIR||'/mnt/data/english-audit';fs.mkdirSync(out,{recursive:true});
const checks=[];const check=(id,fn)=>{try{fn();checks.push({id,status:'PASS'});}catch(e){checks.push({id,status:'FAIL',error:e.stack});}};
const now=Date.parse('2026-09-19T09:00:00Z'),day='2026-09-19';
const meta={task:'reading_a',object_id:'synthetic-delivery',source_hash:'synthetic-r1',snapshot:{text:'Synthetic source only.'}},key='kianos-reading-attempt-v1:synthetic-delivery';
check('evidence.first-answer-value-is-immutable-not-only-timestamp',()=>{const s=new Storage(),v={answers:{q1:'B'}};E.saveEnglishAttempt(s,key,v,meta,{now});v.submitted=true;v.submittedAt=new Date(now+1000).toISOString();E.saveEnglishAttempt(s,key,v,meta,{now:now+1000});const raw=s.getItem(key);assert.throws(()=>E.saveEnglishAttempt(s,key,{...v,answers:{q1:'A'}},meta,{now:now+2000}));assert.equal(s.getItem(key),raw);});
check('recovery.legacy-source-unknown-preserves-raw-without-rebinding',()=>{const s=new Storage();const raw=JSON.stringify({answers:{q1:'B'},submitted:true,submittedAt:new Date(now).toISOString()});s.setItem(key,raw);assert.throws(()=>E.saveEnglishAttempt(s,key,{answers:{q1:'B'}},meta,{now}));assert.equal(s.getItem(key),raw);});
check('delivery.explicit-budget-overrun-is-not-stable-transfer',()=>{const s=new Storage();const instruction={schema:S.ENGLISH_SESSION_SCHEMA,session_id:'synthetic-budget',study_day:day,generated_at:new Date(now).toISOString(),steps:[{step_id:'r',...meta,params:{time_budget_seconds:1,material_exposure:{state:'unseen',basis:'learner_statement',observed_at:new Date(now).toISOString(),note:'Synthetic testimony, not learner data.'}}}]};S.writeEnglishSessionInstruction(s,instruction,day,{catalog:[meta],now});const v={answers:{q1:'A'}};E.saveEnglishAttempt(s,key,v,meta,{now});v.submitted=true;v.submittedAt=new Date(now+2000).toISOString();E.saveEnglishAttempt(s,key,v,meta,{now:now+2000});assert.equal(v.firstEvidenceMeta.timing_status,'budget_exceeded');assert.equal(v.firstEvidenceMeta.independent_transfer_candidate,false);});
check('delivery.no-time-budget-does-not-invent-an-obligation',()=>{const s=new Storage(),v={answers:{q1:'A'}};E.saveEnglishAttempt(s,key,v,meta,{now});v.submitted=true;v.submittedAt=new Date(now+3600000).toISOString();E.saveEnglishAttempt(s,key,v,meta,{now:now+3600000});assert.equal(v.firstEvidenceMeta.timing_status,'uncalibrated');assert.equal(v.firstEvidenceMeta.prior_exposure,'unknown');assert.equal(s.getItem('kianos-english-objective-transfer-v1'),null);});
check('recovery.existing-private-store-roundtrip-outside-destructive-current-sync',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'english-private-proof-'));
 try{
  const mirror=path.join(temp,'mirror'),upstream=path.join(temp,'upstream'),origin=path.join(temp,'origin.git'),privateDir=path.join(temp,'private');
  const git=(cwd,...args)=>execFileSync('git',args,{cwd,stdio:'pipe',env:{...process.env,GIT_AUTHOR_NAME:'Synthetic Audit',GIT_AUTHOR_EMAIL:'synthetic@example.invalid',GIT_COMMITTER_NAME:'Synthetic Audit',GIT_COMMITTER_EMAIL:'synthetic@example.invalid'}}).toString().trim();
  fs.mkdirSync(upstream);git(upstream,'init','-b','main');
  fs.mkdirSync(path.join(upstream,'static-web/scripts'),{recursive:true});
  fs.copyFileSync(new URL('../../static-web/scripts/kianos-current-sync.mjs',import.meta.url),path.join(upstream,'static-web/scripts/kianos-current-sync.mjs'));
  fs.writeFileSync(path.join(upstream,'synthetic-content.txt'),'revision one');git(upstream,'add','.');git(upstream,'commit','-m','Synthetic initial');git(temp,'clone','--bare',upstream,origin);git(temp,'clone',origin,mirror);
  fs.writeFileSync(path.join(mirror,'.git/kianos-current-mirror'),'synthetic test mirror');
  const store=new Storage(),v={answers:{q1:'B'}};E.saveEnglishAttempt(store,key,v,meta,{now});
  const cp=buildPrivateLearnerCheckpoint({studyDay:day,now,shared:captureSharedControlCheckpoint(store,{studyDay:day,now}),subjects:{english:E.exportEnglishCheckpoint(store)}});
  writePrivateLearnerCheckpoint(cp,privateDir);const raw=fs.readFileSync(path.join(privateDir,'latest.json'),'utf8');assert.equal(fs.statSync(path.join(privateDir,'latest.json')).mode&0o777,0o600);
  fs.writeFileSync(path.join(upstream,'synthetic-content.txt'),'revision two');git(upstream,'add','.');git(upstream,'commit','-m','Synthetic Current update');git(upstream,'push',origin,'main');
  execFileSync(process.execPath,[path.join(mirror,'static-web/scripts/kianos-current-sync.mjs')],{env:{...process.env,KIANOS_PRIVATE_DIR:privateDir,KIANOS_SYNC_ONCE:'1',KIANOS_SKIP_ASTRO:'1'},stdio:'pipe',timeout:30000});
  assert.equal(fs.readFileSync(path.join(mirror,'synthetic-content.txt'),'utf8'),'revision two');assert.equal(fs.readFileSync(path.join(privateDir,'latest.json'),'utf8'),raw);
  const resetBrowser=new Storage();const loaded=readPrivateLearnerCheckpoint(privateDir);E.restoreEnglishCheckpoint(resetBrowser,loaded.payload.subjects.english);assert.equal(resetBrowser.getItem(key),store.getItem(key));
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
let inventory;
check('source.real-executable-writing-and-paper-inventory-not-metadata-only',()=>{
 const writing=listWritingExamRuntimeTasks(),papers=listEnglishExamPapers();
 for(const task of writing){assert.equal(loadWritingExamRuntimeTask(task.id).sourceHash,task.sourceHash);if(task.kind==='big'){assert.ok(task.learnerTask.images.length);assert.equal(task.learnerTask.visual_scenario,'');}}
 for(const p of papers){const full=loadEnglishExamPaper(p.paperId);assert.equal(full.steps.length,9);assert.equal(full.duration_minutes,180);assert.equal(full.steps.filter(s=>s.task==='reading_a').length,4);assert.equal(full.steps.filter(s=>s.task==='writing').length,2);assert.equal(new Set(full.steps.map(s=>s.object_id)).size,9);}
 inventory={writing_count:writing.length,small:writing.filter(x=>x.kind==='small').length,big:writing.filter(x=>x.kind==='big').length,paper_count:papers.length,executable_paper_ids:papers.map(p=>p.paperId),source_blocked:[]};
 for(const year of [2011,2026]){const id=`english1-${year}-writing-b-main`;assert.throws(()=>loadWritingExamRuntimeTask(id));inventory.source_blocked.push(id);}
});
const result={synthetic_learner_evidence_only:true,checks,inventory,limits:['Disk transport + explicit English payload dispatch tested; shared autosave/restore integration remains BLOCKED.','No protected true-exam attempt was made. Only canonical identity, hashes and structural completeness were inspected.']};fs.writeFileSync(out+'/delivery-recovery-attacks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
