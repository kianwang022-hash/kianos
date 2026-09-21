// Exact-state visual evidence only. Isolated synthetic learner data; never U.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {loadXizongBlock} from '../src/lib/xizong.mjs';
import {resolveXizongLearnerProjection} from '../src/lib/xizongLearnerProjection.mjs';
import {writePrivateLearnerCheckpoint as diskWrite,readPrivateLearnerCheckpoint as diskRead} from './privateLearnerStore.mjs';

const out=path.resolve(process.env.XIZONG_AUDIT_OUT||'.qa/xizong-final-independent');
fs.mkdirSync(out,{recursive:true});
// Every run and browser context owns disposable native checkpoint files.
const privateRoot=fs.mkdtempSync(path.join(out,'private-run-'));
const privateEnv={KIANOS_PRIVATE_DIR:path.join(privateRoot,'server'),KIANOS_CONTROL_DIR:path.join(privateRoot,'control'),
 KIANOS_EXTERNAL_READING_DIR:path.join(privateRoot,'external'),KIANOS_ENGLISH_GENERATED_DIR:path.join(privateRoot,'generated'),
 KIANOS_CONTROL_ENABLED:'0',KIANOS_PACKET_RELAY_ENABLED:'0'};
async function isolateCheckpoint(context){
 const dir=fs.mkdtempSync(path.join(privateRoot,'context-'));
 await context.route('**/__kianos-private/checkpoint',async route=>{
  const request=route.request();
  const reply=(status,body)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  try{
   if(request.method()==='GET'){
    const checkpoint=diskRead(dir);
    return reply(checkpoint?200:404,{status:checkpoint?'ready':'missing',checkpoint});
   }
   const header=request.headers()['if-match'];
   if(request.method()!=='PUT'||header===undefined)return reply(428,{status:'error',error:'PRIVATE_CHECKPOINT_PRECONDITION_REQUIRED'});
   const checkpoint=diskWrite(request.postDataJSON(),dir,{expectedCheckpointId:JSON.parse(header)});
   return reply(200,{status:'saved',schema:checkpoint.schema,checkpoint_id:checkpoint.checkpoint_id,study_day:checkpoint.study_day,generated_at:checkpoint.generated_at});
  }catch(error){return reply(409,{status:'error',error:String(error.message||error)});}
 });
}
const port=4318,base=`http://127.0.0.1:${port}`;
const log=fs.openSync(path.join(out,'visual-states-server.log'),'w');
const server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)],{env:{...process.env,...privateEnv,KIANOS_REPO_ROOT:path.resolve('..')},stdio:['ignore',log,log]});
let browser;
const results=[];
async function probe(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:String(error.stack||error)});}}
async function visit(page,url){
 // Current/control polling is continuous and is not a page-readiness signal.
 const response=await page.goto(base+url,{waitUntil:'domcontentloaded'});
 assert.equal(response.status(),200);
 await page.locator(url.startsWith('/xizong/practice/')?'[data-xizong-practice]':'[data-xizong-v6-block]').waitFor({state:'attached'});
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'astro-dev-toolbar{display:none!important;pointer-events:none!important}'});
}
try{
 for(let i=0;i<90;i++){try{if((await fetch(base+'/xizong/')).ok)break;}catch{}await delay(600);}
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 await probe('Block Recall Front, Reveal and distinct Complete on one surface',async()=>{
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  await isolateCheckpoint(context);
  try{
   const {block}=resolveXizongLearnerProjection(loadXizongBlock('circulation','b01'));
   const key=`kianos-xizong-astro-v2:${block.objectId}`;
   const state={stage:'block_recall',groupIndex:block.logicGroups.length-1,kpIndex:block.kpRecords.length-1,sourceContactDone:true,learned:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,true])),ratings:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,'fuzzy'])),blockRecallDone:false,completed:false};
   // Synthetic completion must include the same revision-bound Source contact as the real button.
   state.sourceHash=block.sourceHash;
   state.sourceContactEvidence=[{segment_id:`block-cumulative:${block.objectId}`,source_contact_mode:block.sourceContact.mode,
    coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',kp_ids:block.kpRecords.map(k=>k.kpId),
    completed_at:'2026-09-19T01:00:00Z',source_hash:block.sourceHash}];
   await context.addInitScript(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key,state});
   const page=await context.newPage();page.setDefaultTimeout(8000);
   await visit(page,'/xizong/circulation/b01/');
   assert.equal(await page.locator('[data-study-stage="block_recall"]').isVisible(),true);
   assert.equal(await page.locator('[data-block-recall-answer]').isVisible(),false);
   await page.screenshot({path:path.join(out,'block-recall-front.png')});
   await page.locator('[data-block-recall-reveal]').click();
   assert.equal(await page.locator('[data-block-recall-answer]').isVisible(),true);
   await page.screenshot({path:path.join(out,'block-recall-reveal.png')});
   await page.locator('[data-block-recall-complete]').click();
   const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   assert.equal(before.blockRecallDone,true);assert.equal(before.completed,false);
   await page.locator('[data-block-complete]').click();
   assert.equal((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)).completed,true);
   await page.screenshot({path:path.join(out,'block-complete.png')});
  }finally{await context.close();}
 });
 await probe('Whole paper pre-Seal, unified score and same-workbench Review',async()=>{
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  await isolateCheckpoint(context);
  try{
   const page=await context.newPage();page.setDefaultTimeout(8000);
   await visit(page,'/xizong/practice/paper/2026/');
   await page.locator('[data-option]').first().click();await page.locator('[data-submit-answer]').click();
   assert.equal(await page.locator('[data-practice-back]').isVisible(),false);
   assert.equal(await page.locator('[data-question-options] .correct,[data-question-options] .wrong').count(),0);
   await page.screenshot({path:path.join(out,'paper-pre-seal.png')});
   await page.locator('[data-paper-seal]').click();
   await page.waitForTimeout(600); // exceed the stale draft navigation delay
   assert.equal(await page.locator('[data-paper-review-start]').isVisible(),true);
   await page.screenshot({path:path.join(out,'paper-score.png')});
   await page.locator('[data-paper-review-start]').click();
   assert.equal(new URL(page.url()).pathname,'/xizong/practice/paper/2026/');
   await page.screenshot({path:path.join(out,'paper-post-seal-review.png')});
  }finally{await context.close();}
 });
}finally{
 await browser?.close();server.kill();fs.closeSync(log);
 fs.writeFileSync(path.join(out,'visual-states.json'),JSON.stringify({head:process.env.XIZONG_AUDIT_HEAD||'local',platform:process.platform,learnerU:false,synthetic:true,results},null,2));
}
console.log(JSON.stringify(results));
process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
