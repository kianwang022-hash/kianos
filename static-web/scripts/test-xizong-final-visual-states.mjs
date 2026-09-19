// Exact-state visual evidence only. Isolated synthetic learner data; never U.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {chromium} from 'playwright';
import {loadXizongBlock} from '../src/lib/xizong.mjs';

const out=path.resolve('.qa/xizong-final-independent');
fs.mkdirSync(out,{recursive:true});
const port=4318,base=`http://127.0.0.1:${port}`;
const log=fs.openSync(path.join(out,'visual-states-server.log'),'w');
const server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)],{env:{...process.env,KIANOS_REPO_ROOT:path.resolve('..'),KIANOS_PRIVATE_DIR:path.join(out,'private-visual-synthetic')},stdio:['ignore',log,log]});
let browser;
const results=[];
async function probe(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:String(error.stack||error)});}}
async function visit(page,url){await page.goto(base+url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
try{
 for(let i=0;i<90;i++){try{if((await fetch(base+'/xizong/')).ok)break;}catch{}await delay(600);}
 browser=await chromium.launch();
 await probe('Block Recall Front, Reveal and distinct Complete on one surface',async()=>{
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  try{
   const block=loadXizongBlock('circulation','b01');
   const key=`kianos-xizong-astro-v2:${block.objectId}`;
   const state={stage:'block_recall',groupIndex:block.logicGroups.length-1,kpIndex:block.kpRecords.length-1,sourceContactDone:true,learned:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,true])),ratings:Object.fromEntries(block.kpRecords.map(k=>[k.kpId,'fuzzy'])),blockRecallDone:false,completed:false};
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
