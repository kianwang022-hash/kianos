// Exact built pages + complete native modules, disposable browser contexts only.
// Never run against the installed learner origin or use private learner data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {listEnglishExamPapers,loadEnglishExamPaper} from '../src/lib/englishExamPaper.mjs';
import * as E from '../src/lib/englishExamSession.mjs';
const webRoot=process.cwd(), repoRoot=path.resolve(webRoot,'..');
const reportDir=path.join(repoRoot,'english-exam-audit');fs.mkdirSync(reportDir,{recursive:true});
const base='http://127.0.0.1:4387';
const paper=loadEnglishExamPaper(listEnglishExamPapers()[0].paperId);
const home=`${base}/english-exam/${encodeURIComponent(paper.paper_id)}/`;
const now=Date.parse('2026-09-22T01:00:00Z'),day='2026-09-22';
const results=[],diagnostics=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4387'],{cwd:webRoot,stdio:'ignore',detached:process.platform!=='win32'});
let browser;
// Playwright's default focus emulation makes every page appear focused.
// Use headed Chromium with real native focus (Xvfb on CI), not a patched DOM
// hasFocus/visibilityState or a test-only production lock bypass.
async function nativeFocusPage(context){
 const page=await context.newPage();
 const session=await context.newCDPSession(page);
 await session.send('Emulation.setFocusEmulationEnabled',{enabled:false});
 return page;
}
async function ready(page){
 try{await page.waitForFunction(()=>document.hasFocus()&&document.documentElement.dataset.learnerWriter==='active');}
 catch(error){
  diagnostics.push(await page.evaluate(async()=>({url:location.href,focused:document.hasFocus(),visibility:document.visibilityState,writer:document.documentElement.dataset.learnerWriter,locks:await navigator.locks.query()})).catch(()=>({unreadable:true})));
  throw error;
 }
}
async function opened(context,url=home){const p=await nativeFocusPage(context);await p.bringToFront();await p.goto(url);await ready(p);return p;}
async function makeContext(){
 const context=await browser.newContext({timezoneId:'Asia/Shanghai',viewport:{width:1440,height:900}});
 // Native modules are served from the SAME checked-out source as the built
 // application. These routes expose only public repository modules, not state.
 await context.route('**/__freeze_native__/**',async route=>{
  const rel=new URL(route.request().url()).pathname.split('/__freeze_native__/')[1];
  const file=path.resolve(repoRoot,rel);
  if(!file.startsWith(repoRoot+path.sep)||!/^static-web\/src\/lib\/[^/]+\.mjs$|^EXAM_ORCHESTRATOR_CURRENT\.json$/.test(rel))return route.abort();
  await route.fulfill({status:200,contentType:file.endsWith('.json')?'application/json':'text/javascript',body:fs.readFileSync(file)});
 });
 await context.route('**/__kianos-private/control/receipt',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'saved',receipt:JSON.parse(route.request().postData())})}));
 await context.addInitScript(()=>{
  const Native=Date, offset=Number(sessionStorage.getItem('synthetic-freeze-time-offset')||0);
  class Clock extends Native{constructor(...args){super(...(args.length?args:[Native.now()+offset]));}static now(){return Native.now()+offset;}}
  window.Date=Clock;
 });
 return context;
}
function released(){
 let s=E.startEnglishExamSession(paper,{now,sessionId:'synthetic-freeze-browser'});
 for(const [i,step] of s.steps.entries())s=E.captureEnglishExamStep(s,{stepId:step.step_id,task:step.task,objectId:step.object_id,now:now+i+1,
  payload:{source_hash:step.source_hash,...(step.task==='writing'?{essay:'Synthetic original essay'}:
   {answers:Object.fromEntries(step.question_ids.map(q=>[q,step.task==='translation'?'Synthetic translation':'A']))})}});
 return E.releaseEnglishExamObjective(E.sealEnglishExamSession(s,now+60000),{schema:E.ENGLISH_EXAM_ANSWER_SCHEMA,paper_id:paper.paper_id,
  steps:Object.fromEntries(paper.steps.filter(s=>['cloze','reading_a','reading_b'].includes(s.task)).map(s=>[s.step_id,
   {task:s.task,object_id:s.object_id,source_hash:s.source_hash,answers:Object.fromEntries(s.question_ids.map(q=>[q,'A']))}]))},now+61000);
}
function scoreCommand(state){
 const payload=E.englishExamProductiveScoreReturnContract(state);delete payload.boundary;
 for(const [id,row] of Object.entries(payload.channels))Object.assign(row,{score_range:id==='writing_big'?{low:15,high:18}:{low:7,high:9},confidence:'MEDIUM',review_mode:'ANCHORED_SINGLE',requires_independent_rescore:false});
 return {schema:'kianos.control-browser-command.v1',command_id:'synthetic-browser-score',command_hash:'synthetic-browser-hash',study_day:day,generated_at:new Date(now+90000).toISOString(),expires_at:null,operations:[{kind:'english.exam_score_return',payload}]};
}
async function scenario(name,fn){
 try{await fn();results.push({name,status:'PASS'});}
 catch(e){results.push({name,status:'FAIL',error:String(e.stack||e)});process.exitCode=1;}
 finally{fs.writeFileSync(path.join(reportDir,'freeze-browser.json'),JSON.stringify({focus_mode:'HEADED_NATIVE_FOCUS_NO_EMULATION',results,diagnostics},null,2));}
}
try{
 for(let n=0;;n++){try{if((await fetch(base)).ok)break;}catch{}if(n>100)throw new Error('ISOLATED_PREVIEW_UNAVAILABLE');await sleep(200);}
 if(process.platform==='linux'&&!process.env.DISPLAY)throw new Error('NATIVE_FOCUS_REQUIRES_DISPLAY');
 browser=await chromium.launch({headless:false});
 await scenario('manual and timed malformed seal preserve captured answers and expose recoverable failure',async()=>{
  const context=await makeContext();const page=await opened(context);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.locator('[data-exam-start]').click();await page.waitForURL('**/cloze/**?exam_session=*');await ready(page);
   const taskUrl=page.url();await page.locator('[data-cloze-option]').first().click();
   await page.locator('[data-exam-complete]').click();await page.waitForURL('**/reading/**?exam_session=*');
   await page.goto(home);await ready(page);await page.locator('[data-exam-seal]').waitFor({state:'visible'});
   const raw=await page.evaluate(()=>{
    const key='kianos-english-exam-session-v1',session=JSON.parse(localStorage.getItem(key));
    const s=session.steps[0],taskKey=`kianos-english-exam-task-v1:${session.session_id}:${s.task}:${s.object_id}`;
    const value=JSON.parse(localStorage.getItem(taskKey));delete value.answers;localStorage.setItem(taskKey,JSON.stringify(value));
    return {key,taskKey,sessionRaw:localStorage.getItem(key),taskRaw:localStorage.getItem(taskKey)};
   });
   page.once('dialog',d=>d.accept());await page.locator('[data-exam-seal]').click();
   await page.locator('[data-english-exam-home][data-seal-error="true"]').waitFor();
   assert.match(await page.locator('[data-exam-home-status]').innerText(),/交卷未成功/);
   assert.equal(await page.locator('[data-exam-release]').isHidden(),true);
   assert.equal(await page.evaluate(r=>localStorage.getItem(r.key)===r.sessionRaw&&localStorage.getItem(r.taskKey)===r.taskRaw,raw),true);
   // A real fresh document, not just a function call after the error.
   await page.reload();await ready(page);page.once('dialog',d=>d.accept());await page.locator('[data-exam-seal]').click();
   await page.locator('[data-english-exam-home][data-seal-error="true"]').waitFor();
   await page.evaluate(()=>sessionStorage.setItem('synthetic-freeze-time-offset',String(181*60000)));
   await page.reload();await ready(page);
   await page.locator('[data-english-exam-home][data-seal-error="true"]').waitFor();
   await page.evaluate(()=>{window.__statusMutations=0;new MutationObserver(()=>window.__statusMutations++).observe(document.querySelector('[data-exam-home-status]'),{childList:true,subtree:true,characterData:true});});
   await sleep(2200);assert.equal(await page.evaluate(()=>window.__statusMutations),0,'timed rejection retried silently');
   assert.equal(await page.evaluate(r=>localStorage.getItem(r.key)===r.sessionRaw&&localStorage.getItem(r.taskKey)===r.taskRaw,raw),true);
   await page.screenshot({path:path.join(reportDir,'freeze-seal-preserved.png')});
   await page.goto(taskUrl);await ready(page);
   await page.locator('[data-english-exam-task-bridge][data-seal-error="true"]').waitFor();
   assert.match(await page.locator('[data-exam-step-progress]').innerText(),/交卷未成功/);
   assert.equal(await page.evaluate(r=>localStorage.getItem(r.key)===r.sessionRaw&&localStorage.getItem(r.taskKey)===r.taskRaw,raw),true);
   // Workspace source/deadline protection may report its own exact readonly error;
   // the new sealing entry must never leak an unhandled autosave error.
   assert.equal(errors.some(x=>/CAPTURE_OUTPUT|AUTOSAVE|LATE_TASK_WRITE/.test(x)),false,JSON.stringify(errors));
  }finally{await context.close();}
 });
 await scenario('actual browser restoration and duplicate score display remain aligned',async()=>{
  const context=await makeContext();const page=await opened(context);
  try{
   const state=released(),command=scoreCommand(state);
   await page.evaluate(({state})=>localStorage.setItem('kianos-english-exam-session-v1',JSON.stringify(state)),{state});
   const checkpoint=await page.evaluate(async({command,day,now})=>{
    const R=await import('/__freeze_native__/static-web/src/lib/privateControlRuntime.mjs');
    const P=await import('/__freeze_native__/static-web/src/lib/privateCheckpointRuntime.mjs');
    const K=await import('/__freeze_native__/static-web/src/lib/privateLearnerCheckpoint.mjs');
    const S=await import('/__freeze_native__/static-web/src/lib/sharedControlCheckpoint.mjs');
    const L=await import('/__freeze_native__/static-web/src/lib/englishLearnerEvidence.mjs');
    await R.applyPrivateControlCommand(localStorage,command,{day,now:now+120000});
    return K.buildPrivateLearnerCheckpoint({studyDay:day,now:now+130000,shared:S.captureSharedControlCheckpoint(localStorage,{studyDay:day,now:now+130000}),subjects:{english:L.exportEnglishCheckpoint(localStorage)}});
   },{command,day,now});
   // Disposable reset models a partially recovered second browser, never real storage.
   await page.evaluate(({state})=>{localStorage.clear();localStorage.setItem('kianos-english-exam-session-v1',JSON.stringify(state));},{state});
   const replay=await page.evaluate(async({checkpoint,command,day,now})=>{
    const P=await import('/__freeze_native__/static-web/src/lib/privateCheckpointRuntime.mjs');
    const R=await import('/__freeze_native__/static-web/src/lib/privateControlRuntime.mjs');
    const restored=await P.restoreSharedControlFromPrivate(localStorage,{now:now+140000,readCheckpoint:async()=>({status:'ready',checkpoint})});
    const result=await R.applyPrivateControlCommand(localStorage,command,{day,now:now+150000});
    return {warnings:restored.warnings,status:result.status,exam:JSON.parse(localStorage.getItem('kianos-english-exam-session-v1'))};
   },{checkpoint,command,day,now});
   assert.deepEqual(replay.warnings,[]);assert.equal(replay.status,'idempotent');assert.equal(replay.exam.status,'SCORED');
   await page.reload();await ready(page);await page.locator('[data-exam-reviewed]').waitFor({state:'visible'});
   assert.match(await page.locator('[data-exam-score-range]').innerText(),/89.*96/);
  }finally{await context.close();}
 });
 await scenario('two real pages exclude a late restore and reload current work on return',async()=>{
  const context=await makeContext();const a=await opened(context);let b;
  try{
   await a.evaluate(async()=>{
    const P=await import('/__freeze_native__/static-web/src/lib/privateCheckpointRuntime.mjs');
    window.__lateRestore=P.restoreSharedControlFromPrivate(localStorage,{readCheckpoint:()=>new Promise(resolve=>window.__restoreResponse=resolve)}).then(r=>({status:r.status}),e=>({error:e.message}));
   });
   b=await opened(context);await a.waitForFunction(()=>!document.hasFocus()&&document.documentElement.dataset.learnerWriter==='retired');
   assert.equal(await b.evaluate(()=>document.hasFocus()),true);
   const state=released();await b.evaluate(state=>localStorage.setItem('kianos-english-exam-session-v1',JSON.stringify(state)),state);
   const before=await b.evaluate(()=>localStorage.getItem('kianos-english-exam-session-v1'));
   const result=await a.evaluate(async()=>{window.__restoreResponse({status:'missing'});return await window.__lateRestore;});
   assert.match(result.error,/WRITER_RELOAD_REQUIRED/);
   const blocked=await a.evaluate(()=>{try{localStorage.setItem('kianos-english-exam-session-v1','stale');return false;}catch{return true;}});
   assert.equal(blocked,true);assert.equal(await b.evaluate(()=>localStorage.getItem('kianos-english-exam-session-v1')),before);
   // External-app blur alone does NOT revoke ownership or stop timer evidence.
   await b.evaluate(()=>window.dispatchEvent(new Event('blur')));await ready(b);
   await a.bringToFront();await a.waitForLoadState('domcontentloaded');await ready(a);
   assert.equal(await a.evaluate(()=>localStorage.getItem('kianos-english-exam-session-v1')),before);
   await a.screenshot({path:path.join(reportDir,'freeze-writer-handoff.png')});
  }finally{await context.close();}
 });
 await scenario('failed transaction rolls back before another page can acquire writes',async()=>{
  const context=await makeContext();const a=await opened(context);
  try{
   await a.evaluate(()=>localStorage.setItem('kianos-test-transaction','before'));
   await a.evaluate(async()=>{window.__commit=(await import('/__freeze_native__/static-web/src/lib/browserLearnerWriter.mjs')).commitLearnerStorageChanges;});
   const entered=a.waitForEvent('console',{predicate:message=>message.text()==='__freeze-transaction-open'});
   const failed=a.evaluate(()=>{
    const commitLearnerStorageChanges=window.__commit;
    const proto=Storage.prototype,original=proto.setItem;
    proto.setItem=function(key,value){
     if(key==='kianos-test-failure'){
      console.log('__freeze-transaction-open');
      const until=performance.now()+400;while(performance.now()<until){};
      throw new Error('SYNTHETIC_WRITE_FAILURE');
     }
     return original.call(this,key,value);
    };
    try{commitLearnerStorageChanges(localStorage,[['kianos-test-transaction','our-write'],['kianos-test-failure','fail']]);return 'unexpected';}
    catch(error){return error.message;}finally{proto.setItem=original;}
   });
   await entered;const b=await opened(context);assert.match(await failed,/SYNTHETIC_WRITE_FAILURE/);
   assert.equal(await b.evaluate(()=>localStorage.getItem('kianos-test-transaction')),'before');
   await b.evaluate(()=>localStorage.setItem('kianos-test-transaction','new-writer'));
   assert.equal(await a.evaluate(()=>localStorage.getItem('kianos-test-transaction')),'new-writer');
   await b.close();await a.bringToFront();await ready(a);
   assert.equal(await a.evaluate(()=>localStorage.getItem('kianos-test-transaction')),'new-writer');
  }finally{await context.close();}
 });
 console.log((process.exitCode?'FAIL':'PASS')+' freeze browser: '+results.length+' isolated page journeys');
}catch(error){console.error(error);process.exitCode=1;}
finally{
 await browser?.close();
 try{if(server.pid)process.kill(-server.pid,'SIGTERM');}catch{}
 fs.writeFileSync(path.join(reportDir,'freeze-browser.json'),JSON.stringify({status:process.exitCode?'FAIL':'PASS',focus_mode:'HEADED_NATIVE_FOCUS_NO_EMULATION',results,diagnostics},null,2));
}
