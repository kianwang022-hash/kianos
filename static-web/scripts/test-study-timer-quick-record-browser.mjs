import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import net from 'node:net';
const webRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port=4350;
const base=`http://127.0.0.1:${port}`;
const output=path.join(webRoot,'.qa','study-timer-quick-record');
fs.mkdirSync(output,{recursive:true});
await new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',reject);probe.listen(port,'127.0.0.1',()=>probe.close(resolve));});
const server=spawn(process.execPath,['scripts/kianos-candidate-runtime.mjs'],{cwd:webRoot,env:{...process.env,KIANOS_CANDIDATE_PORT:String(port)},stdio:'ignore'});
let ready=false;
for(let i=0;i<100;i++){try{const r=await fetch(base+'/');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}
if(!ready){server.kill('SIGTERM');throw Error('ISOLATED_CANDIDATE_NOT_READY');}
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-record-synthetic-'));
const chrome=spawn(process.env.KIANOS_TEST_CHROME || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':chromium.executablePath()),['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--enable-automation','about:blank'],{stdio:'ignore'});
const portFile=path.join(profile,'DevToolsActivePort');
for(let i=0;i<100&&!fs.existsSync(portFile);i++)await new Promise(r=>setTimeout(r,100));
const browser=await chromium.connectOverCDP('http://127.0.0.1:'+fs.readFileSync(portFile,'utf8').split('\n')[0],{noDefaults:true});
const context=browser.contexts()[0];
const page=await context.newPage();
const report={mode:'candidate',console:[],requests:[]};
let firstCheckpoint=true,releaseCheckpoint;
const checkpointGate=new Promise(resolve=>{releaseCheckpoint=resolve;});
await context.route('**/__kianos-private/checkpoint',async route=>{
 if(firstCheckpoint&&route.request().method()==='GET'){firstCheckpoint=false;await checkpointGate;}
 await route.continue();
});
page.on('pageerror',e=>report.console.push(String(e)));
page.on('request',r=>{if(r.url().includes('__kianos'))report.requests.push({method:r.method(),url:r.url()});});
const state=()=>page.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,focus:document.hasFocus(),inert:[...document.querySelectorAll('[inert]')].map(e=>e.tagName),dock:{...document.querySelector('[data-study-timer-dock]').dataset},status:document.querySelector('[data-study-timer-record-status]').textContent,choices:[...document.querySelectorAll('[data-reality-kind]')].map(e=>({label:e.textContent,type:e.dataset.realityKind,pressed:e.getAttribute('aria-pressed')})),quick:JSON.parse(localStorage.getItem('kianos-steward-reality-v1')||'{"events":[]}').events.filter(e=>e.kind==='QUICK')}));
try {
 await page.goto(base+'/xizong/circulation/b04/');
 await page.bringToFront();
 await page.waitForFunction(()=>{const n=document.querySelector('[data-learner-writer-notice]');return document.documentElement.dataset.learnerWriter==='waiting'&&n&&!n.hidden;});
 report.recoveryWaiting=await page.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,notice:document.querySelector('[data-learner-writer-notice]').textContent,noticeHidden:document.querySelector('[data-learner-writer-notice]').hidden,inert:document.querySelectorAll('[inert]').length}));
 releaseCheckpoint();
 await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
 report.initial=await state();
 assert.ok(report.initial.choices.filter(c=>['ENERGY','FOCUS'].includes(c.type)).every(c=>c.pressed==='false'));
 assert.ok(await page.locator('[data-reality-kind]').evaluateAll(buttons=>buttons.every(b=>Boolean(b.closest('.studyTimerQuickGroup')?.querySelector('span')?.textContent.trim()))), 'Every quick button must have its component-owned group label before capture.');
 await page.locator('[data-study-timer-record]').click();
 await page.locator('[data-study-timer-record-panel]').waitFor({state:'visible'});
 report.open=await state();
 await page.getByRole('button',{name:'正常',exact:true}).click();
 report.first=await state();
 await page.waitForTimeout(400);
 await page.getByRole('button',{name:'正常',exact:true}).click();
 report.second=await state();
 await page.getByRole('button',{name:'高',exact:true}).click();
 report.focusSaved=await state();
 const n=report.initial.quick.length;
 assert.equal(report.first.quick.length,n+1);assert.equal(report.second.quick.length,n+2);assert.equal(report.focusSaved.quick.length,n+3);
 assert.equal(report.first.quick.at(-1).value,'正常');assert.equal(report.second.quick.at(-1).value,'正常');assert.notEqual(report.first.quick.at(-1).id,report.second.quick.at(-1).id);
 assert.equal(report.focusSaved.quick.at(-1).type,'FOCUS');assert.equal(report.focusSaved.quick.at(-1).value,'高');
 assert.equal(report.focusSaved.dock.running,'true');
 await page.locator('[data-study-timer-record-note]').fill('SYNTHETIC isolated record probe');
 await page.locator('[data-study-timer-record-save]').click();
 report.saved=await state();
 if(report.mode==='candidate'){
   if(report.first.status===report.second.status)throw Error('repeat feedback unchanged');
   if(!['正常','高'].every(label=>report.saved.choices.some(c=>c.label===label&&c.pressed==='true')))throw Error('selection feedback missing');
   if(report.saved.dock.running!=='true')throw Error('record interrupted timer');
 }
 await page.screenshot({path:path.join(output,'success.png')});
 if(report.mode==='candidate'){
   // Fault injection only in this disposable profile. The original guarded method
   // is retained and restored; production writer/transaction code is unchanged.
   await page.evaluate(()=>{const p=Object.getPrototypeOf(localStorage);window.__originalSyntheticSetItem=p.setItem;window.__failedSyntheticEvents=[];p.setItem=function(key,value){if(key==='kianos-steward-reality-v1'){window.__failedSyntheticEvents.push(JSON.parse(value).events.at(-1));throw Error('SYNTHETIC_STORAGE_FAILURE');}return window.__originalSyntheticSetItem.call(this,key,value)};});
   await page.getByRole('button',{name:'累',exact:true}).click();report.failedEnergy=await state();
   await page.locator('[data-study-timer-record-note]').fill('SYNTHETIC retained failed note');await page.locator('[data-study-timer-record-save]').click();
   report.failedNote={...await state(),note:await page.locator('[data-study-timer-record-note]').inputValue(),attempt:await page.evaluate(()=>window.__failedSyntheticEvents.at(-1))};
   await page.screenshot({path:path.join(output,'failure.png')});
   await page.evaluate(()=>{Object.getPrototypeOf(localStorage).setItem=window.__originalSyntheticSetItem;delete window.__originalSyntheticSetItem;});
   await page.locator('[data-study-timer-record-save]').click();report.retry=await state();
   assert.equal(report.retry.quick.at(-1).id,report.failedNote.attempt.id, 'Retry must preserve the failed event identity.');
   if(report.failedEnergy.quick.length!==report.saved.quick.length||report.failedNote.quick.length!==report.saved.quick.length||!report.failedNote.status.startsWith('未保存')||!report.failedNote.note.includes('retained'))throw Error('false success/lost note on failure');
   if(report.failedEnergy.choices.find(c=>c.label==='累').pressed!=='false')throw Error('false selected feedback');
 }
 const water=page.locator('[data-reality-kind="WATER"][data-reality-value="250"]');
 await water.dblclick();report.waterDouble=await state();
 assert.equal(report.waterDouble.quick.length,report.retry.quick.length+1,'Rapid double-click must produce one water event.');
 await page.waitForTimeout(400);await water.click();report.waterSeparate=await state();
 assert.equal(report.waterSeparate.quick.length,report.retry.quick.length+2,'Separate water capture must accumulate.');
 assert.equal(report.waterSeparate.quick.at(-1).value,250);
 await page.locator('[data-reality-kind="COFFEE"][data-reality-value="0.5"]').dblclick();report.additive=await state();
 assert.equal(report.additive.quick.length,report.retry.quick.length+3);assert.equal(report.additive.quick.at(-1).value,0.5);
 assert.ok(report.additive.choices.filter(c=>['WATER','COFFEE'].includes(c.type)).every(c=>c.pressed===null),'Additive water/coffee must not become selected states.');
 assert.deepEqual(report.console,[], 'Quick capture and failure/retry must not emit browser errors.');
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
 report.reload=await state();
 assert.ok(report.reload.choices.filter(c=>['ENERGY','FOCUS'].includes(c.type)).every(c=>c.pressed==='false'),'Reload must not infer current energy/focus from prior records.');
 const other=await context.newPage();await page.bringToFront();
 await other.goto(base+'/xizong/circulation/b04/');
 await other.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='waiting');
 report.waiting=await other.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,focus:document.hasFocus(),inert:document.querySelectorAll('[inert]').length,notice:document.querySelector('[data-learner-writer-notice]')?.textContent,noticeHidden:document.querySelector('[data-learner-writer-notice]')?.hidden}));
 await other.bringToFront();
 await other.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
 await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='retired');
 report.retired=await state();
 report.newActive=await other.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,focus:document.hasFocus(),inert:document.querySelectorAll('[inert]').length}));
 report.retiredGuard=await page.evaluate(()=>{try{localStorage.setItem('kianos-synthetic-guard-probe','bad');return 'NOT_BLOCKED'}catch(e){return e.message}});
 await page.bringToFront();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
 report.returned=await state();
 assert.deepEqual(report.reload.quick,report.additive.quick);assert.deepEqual(report.returned.quick,report.additive.quick);
 assert.equal(report.recoveryWaiting.noticeHidden,false);assert.equal(report.recoveryWaiting.notice,'正在接续最新学习记录…');assert.ok(report.recoveryWaiting.inert>=2);
 assert.ok(report.console.every(message=>message.includes('KIANOS_LEARNER_WRITER_RELOAD_REQUIRED')), 'Any late handoff callback must remain write-denied; unexpected errors fail.');
 const finalSaved=report.additive;
 if(report.saved.quick.length!==report.initial.quick.length+4||[report.reload,report.returned].some(s=>s.quick.length!==finalSaved.quick.length))throw Error('synthetic save/readback mismatch');
 if(report.retiredGuard!=='KIANOS_LEARNER_WRITER_RELOAD_REQUIRED')throw Error('guard changed');
 if(report.waiting.writer!=='waiting'||report.waiting.focus||report.waiting.inert<2||report.newActive.inert!==0)throw Error('focus/inert protection mismatch');
}catch(e){report.error=String(e);process.exitCode=1;}
finally{fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({mode:report.mode,error:report.error,initial:report.initial?.quick.length,saved:report.saved?.quick.length,reload:report.reload?.quick.length,first:report.first?.status,second:report.second?.status,waiting:report.waiting,retired:report.retired?.writer,guard:report.retiredGuard,returned:report.returned?.writer,console:report.console},null,2));await browser.close();chrome.kill();server.kill('SIGTERM');}
