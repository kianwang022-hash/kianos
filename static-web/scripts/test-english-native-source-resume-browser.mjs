import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {listSyntheticReadingSets,loadSyntheticReadingById} from '../src/lib/englishSyntheticBaseline.mjs';

// Existing compiled native entry and real synthetic Reading workspace, isolated browser storage.
const base='http://127.0.0.1:4347';
const task=loadSyntheticReadingById(listSyntheticReadingSets()[0].id);
const meta={task:'reading_a',object_id:task.objectId,source_hash:task.sourceHashes.renderedObject,semantic_source_hash:task.sourceHashes.semanticSource};
const key='kianos-reading-attempt-v1:'+meta.object_id,sessionKey='kianos-english-session-instruction-v1',archiveKey='kianos-english-attempt-archive-v1:m4-old-attempt';
const evidenceDir=path.resolve('../english-native-interface-audit');fs.mkdirSync(evidenceDir,{recursive:true});
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4347'],{stdio:'ignore',detached:process.platform!=='win32'});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser,context;
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/english/')).ok){ready=true;break;}}catch{}await pause(150);}
 assert.ok(ready,'native preview did not start');
 browser=await chromium.launch({headless:true});context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();
 let holdNext=false,releaseFetch=null;
 await page.route('**/__kianos-private/control/english-session-catalog',async route=>{
  if(holdNext){holdNext=false;await new Promise(resolve=>{releaseFetch=resolve;});}
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({rows:[meta]})});
 });
 await page.route('**/__kianos-private/external-reading/catalog',route=>route.fulfill({status:200,contentType:'application/json',body:'{"collections":[]}'}));
 await page.goto(base+'/english/',{waitUntil:'networkidle'});
 const first={answers:{},submitted:false,binding:{task:meta.task,object_id:meta.object_id,source_hash:'source-v1',semantic_source_hash:'legacy-source-hash',attempt_id:'m4-old-attempt',revision:4,prior_exposure:'unknown',assistance:'unassisted',source_snapshot:{paragraphs:task.paragraphs,questions:task.questions}}};
 await page.evaluate(({key,first,meta,sessionKey})=>{
  const now=Date.now();localStorage.setItem(key,JSON.stringify(first));
  localStorage.setItem(sessionKey,JSON.stringify({schema:'kianos.english.session-instruction.v1',session_id:'m4-source',study_day:new Date(now).toLocaleDateString('en-CA'),generated_at:new Date(now).toISOString(),current_step:0,steps:[{step_id:'s1',task:meta.task,object_id:meta.object_id,source_hash:'source-v1'}]}));
  window.dispatchEvent(new Event('focus'));
 },{key,first,meta,sessionKey});
 const recovery=page.locator('[data-english-source-continue]');await recovery.waitFor({state:'visible'});
 assert.equal(await page.locator('[data-english-resume-link]').isVisible(),false);
 // Reproduce a native current-attempt update during the catalogue await.
 holdNext=true;await recovery.click();for(let i=0;i<100&&!releaseFetch;i++)await pause(20);assert.ok(releaseFetch,'refresh await not reached');
 await page.evaluate(key=>{const current=JSON.parse(localStorage.getItem(key));current.binding.revision++;current.answers.q1='A';localStorage.setItem(key,JSON.stringify(current));},key);
 releaseFetch();releaseFetch=null;
 await page.waitForFunction(()=>document.querySelector('[data-english-resume-meta]')?.textContent.includes('CONTINUATION_STALE'));
 assert.equal(await page.evaluate(archiveKey=>localStorage.getItem(archiveKey),archiveKey),null);
 const preserved=await page.evaluate(key=>localStorage.getItem(key),key);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await recovery.waitFor({state:'visible'});
 await Promise.all([page.waitForURL('**/reading/'+meta.object_id+'/**'),recovery.click()]);
 await page.waitForFunction(key=>{const value=JSON.parse(localStorage.getItem(key)||'null');return value?.binding?.source_hash!=='source-v1'&&Boolean(value?.binding?.source_hash);},key);
 const observed=await page.evaluate(({key,archiveKey})=>({value:JSON.parse(localStorage.getItem(key)||'null'),archive:localStorage.getItem(archiveKey),readonly:document.querySelector('[data-reading-object]')?.dataset.englishReadonly}),{key,archiveKey});
 assert.equal(observed.archive,preserved);assert.equal(observed.value.binding.source_hash,meta.source_hash);assert.notEqual(observed.value.binding.attempt_id,'m4-old-attempt');assert.notEqual(observed.readonly,'true');assert.equal(observed.value.binding.prior_exposure,'exposed');
 await page.locator('[data-option]').first().click();
 await page.screenshot({path:path.join(evidenceDir,'source-v2-native-workspace.png'),fullPage:true});
 const report={status:'PASS',scope:'compiled native Source-version Resume -> archive -> current synthetic Reading workspace',checks:{stale_source_no_old_resume:true,catalog_await_concurrent_write_rejected:true,raw_old_output_preserved:true,current_source_workspace_writable:true,legacy_snapshot_alias_exposed:true},real_learner_data_used:false,protected_exam_consumption:false};
 fs.writeFileSync(path.join(evidenceDir,'source-resume.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{
 try{await context?.close();await browser?.close();}catch{}
 try{if(process.platform==='win32')server.kill();else process.kill(-server.pid,'SIGTERM');}catch{}
}
