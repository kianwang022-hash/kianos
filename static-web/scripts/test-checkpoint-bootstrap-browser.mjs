import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
import {isolatedCandidateEnv,assertCandidatePortAvailable} from './kianos-candidate-runtime.mjs';
import {terminateProcessTree} from './currentRelease.mjs';
import {loadXizongBlock} from '../src/lib/xizong.mjs';
import {resolveXizongLearnerProjection} from '../src/lib/xizongLearnerProjection.mjs';
import {reconcileXizongRevision} from '../src/lib/xizongContentRevision.mjs';
import {saveSharedControlToPrivate} from '../src/lib/privateCheckpointRuntime.mjs';
import {EXAM_PROFILE_KEY,emptyExamProfile} from '../src/lib/examOrchestrator.mjs';
import {STUDY_TIMER_STATE_KEY,STUDY_TIMER_LEDGER_KEY,STUDY_TIMER_SCHEMA,emptyStudyTimerState} from '../src/lib/studyTimer.mjs';
class Storage {
 constructor(entries={}){this.map=new Map(Object.entries(entries));}
 get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);}
}
const key='kianos-xizong-astro-v2:xizong:circulation-b02';
const learner=resolveXizongLearnerProjection(loadXizongBlock('circulation','b02')).learnerObject;
const initial={...reconcileXizongRevision({stage:'source_contact',kpIndex:4,groupIndex:1,learned:{},ratings:{},completed:false},learner.revisionWitness),resumeKpId:'circulation-b02-kp05',resumeGroupId:'circulation-b02-lg02'};
const entries={[EXAM_PROFILE_KEY]:JSON.stringify(emptyExamProfile()),[STUDY_TIMER_STATE_KEY]:JSON.stringify(emptyStudyTimerState()),[STUDY_TIMER_LEDGER_KEY]:JSON.stringify({schema:STUDY_TIMER_SCHEMA,sessions:[]}),[key]:JSON.stringify(initial),'kianos-vocabulary-last-ordinal':'81'};
let seed;
assert.equal((await saveSharedControlToPrivate(new Storage(entries),{readCheckpoint:async()=>({status:'missing'}),writeCheckpoint:async c=>{seed=c;}})).status,'saved');
const out=process.env.KIANOS_BOOTSTRAP_TEST_OUT||fs.mkdtempSync(path.join(os.tmpdir(),'kianos-bootstrap-proof-'));
fs.mkdirSync(out,{recursive:true,mode:0o700});
const runtime=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-bootstrap-runtime-'));
const old=process.env.KIANOS_BOOTSTRAP_BASELINE_ROOT;
const staticRoot=old||process.env.KIANOS_BOOTSTRAP_STATIC_ROOT;
const pwVersion=createRequire(import.meta.url)('playwright/package.json').version;
const [pwMajor,pwMinor]=pwVersion.split('.').map(Number);
assert.ok(pwMajor>1||(pwMajor===1&&pwMinor>=60),'native-focus test requires Playwright >=1.60; observed '+pwVersion);
const port=Number(process.env.KIANOS_BOOTSTRAP_TEST_PORT||4334);
assert.ok(port!==4321&&port>1024,'isolated test port required');
const base='http://127.0.0.1:'+port;
const env=isolatedCandidateEnv(runtime,process.env,'bootstrap-proof');
if(staticRoot){env.KIANOS_RELEASE_PROBE_ONLY='1';env.KIANOS_CURRENT_STATUS_PATH=path.join(staticRoot,'dist/__kianos-current.json');}
await assertCandidatePortAvailable({host:'127.0.0.1',port});
const args=staticRoot?[path.join(staticRoot,'scripts/kianos-static-server.mjs'),'--host','127.0.0.1','--port',String(port),'--root',path.join(staticRoot,'dist')]:['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)];
const server=spawn(process.execPath,args,{cwd:staticRoot||process.cwd(),env,detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
let logs='',browser,focusProcess;server.on('error',error=>{logs+=String(error);});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
const report={baseline:Boolean(old),scope:'synthetic browser state and controlled checkpoint transport; no live records',checks:[]};
const sourcePaths=['src/lib/browserLearnerWriter.mjs','src/lib/privateCheckpointRuntime.mjs','src/layouts/BaseFrame.astro','src/pages/vocabulary/word/index.astro','src/styles/shared-shell.css'];
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
report.sourceHashes=Object.fromEntries(sourcePaths.map(p=>[p,hash(p)]));
const check=(ok,name,detail=null)=>{report.checks.push({name,ok:Boolean(ok),detail});console.log((ok?'PASS ':'FAIL ')+name);if(!ok)throw Error(name);};
try {
 for(let i=0;i<150;i++){if(server.exitCode!==null)throw Error(logs);try{const r=await fetch(base+'/robots.txt');if(r.status)break;}catch{}if(i===149)throw Error('isolated server not ready');await new Promise(r=>setTimeout(r,100));}
 const chrome=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||chromium.executablePath();
 const profile=path.join(runtime,'native-focus-profile');
 let chromeError='';
 focusProcess=spawn(chrome,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--enable-automation','about:blank'],{stdio:['ignore','ignore','pipe'],detached:process.platform!=='win32'});
 focusProcess.stderr.on('data',b=>chromeError=(chromeError+b).slice(-6000));focusProcess.on('error',e=>chromeError+=String(e));
 let debugPort=null;
 for(let i=0;i<100;i++){
  try{debugPort=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(debugPort)break;}catch{}
  if(focusProcess.exitCode!==null)break;await new Promise(r=>setTimeout(r,100));
 }
 assert.ok(debugPort,'owned native browser ready: '+chromeError);
 // Reuse the native-focus strategy from test-private-control-browser.mjs.
 // Ordinary Playwright contexts emulate every tab as focused, even headed.
 browser=await chromium.connectOverCDP('http://127.0.0.1:'+debugPort,{noDefaults:true});
 report.browser={version:browser.version(),noDefaults:true};
 const context=browser.contexts()[0];
 await context.addInitScript(k=>{
  window.__bootstrapProof={ready:null,writes:[],errors:[]};
  const original=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){const out=Reflect.apply(original,this,[key,value]);if(/^kianos[-:]/.test(key))window.__bootstrapProof.writes.push(key);return out;};
  window.addEventListener('kianos:learner-writer-ready',()=>{window.__bootstrapProof.ready=JSON.parse(localStorage.getItem(k)||'null');});
  window.addEventListener('kianos:private-checkpoint-error',e=>window.__bootstrapProof.errors.push(e.detail));
 },key);
 context.setDefaultTimeout(15000);
 const page=await context.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 let current=structuredClone(seed),releaseRead,readSeen;
 const readGate=new Promise(r=>releaseRead=r),seen=new Promise(r=>readSeen=r);
 let held=false;const puts=[];
 await context.route('**/__kianos-private/checkpoint',async route=>{
  if(route.request().method()==='GET'){
   if(!held){held=true;readSeen();await readGate;}
   return route.fulfill({json:{status:'ready',checkpoint:current}});
  }
  if(route.request().method()==='PUT'){
   const c=route.request().postDataJSON();
   if(route.request().headers()['if-match']!==JSON.stringify(current.checkpoint_id))return route.fulfill({status:409,json:{error:'synthetic compare-and-swap conflict'}});
   current=c;puts.push(c);return route.fulfill({json:{status:'saved',checkpoint_id:c.checkpoint_id}});
  }
  return route.abort();
 });
 await page.goto(base+'/xizong/circulation/b02/',{waitUntil:'domcontentloaded'});
 await Promise.race([seen,new Promise((_,reject)=>setTimeout(()=>reject(Error('checkpoint read not requested')),15000))]);
 const early=await page.evaluate(()=>{let denied=false;try{localStorage.setItem('kianos-test-bootstrap-probe','1');}catch{denied=true;}return {denied,ready:window.__bootstrapProof.ready,writes:window.__bootstrapProof.writes,writer:document.documentElement.dataset.learnerWriter};});
 report.early=early;console.log('EARLY '+JSON.stringify(early));
 if(old)check(!early.denied&&early.ready===null,'baseline reproduces native writes before checkpoint restoration',early);
 else check(early.denied&&early.ready===null&&early.writes.length===0,'no learner writes or ready notification before recovery',early);
 releaseRead();
 if(old){report.baselineObserved=true;}
 else {
  await page.waitForFunction(()=>window.__bootstrapProof.ready!==null);
  const ready=await page.evaluate(()=>window.__bootstrapProof.ready);
  check(ready.stage==='source_contact'&&ready.kpIndex===4&&ready.resumeKpId==='circulation-b02-kp05','ready consumers receive recovered B2 KP5 without fabricated learning',ready);
 }
 if(!old){
  for(let i=0;!puts.length;i++){if(i>100)throw Error('autosave not observed');await new Promise(r=>setTimeout(r,100));}
  check(!puts.at(-1).payload.shared.capture_warnings.length,'first autosave retains valid checkpoint lineage');
  check(await page.evaluate(()=>localStorage.getItem('kianos-vocabulary-last-ordinal'))==='81','unrelated lexical cursor preserved');
  await page.reload();await page.waitForFunction(()=>window.__bootstrapProof.ready!==null);
  check((await page.evaluate(()=>window.__bootstrapProof.ready)).resumeKpId==='circulation-b02-kp05','reload resumes same saved KP');
  await page.screenshot({path:path.join(out,'bootstrap-recovered.png')});
  const page2=await context.newPage();await page2.goto(base+'/vocabulary/',{waitUntil:'domcontentloaded'});await page2.bringToFront();
  await page2.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active').catch(async error=>{report.focus={first:await page.evaluate(()=>({focus:document.hasFocus(),state:document.documentElement.dataset.learnerWriter})),second:await page2.evaluate(()=>({focus:document.hasFocus(),state:document.documentElement.dataset.learnerWriter}))};throw error;});
  check(await page.evaluate(()=>{try{localStorage.setItem('kianos-test-retired-proof','1');return false;}catch{return true;}}),'retired page cannot write after actual Web Lock handoff');
  await page2.close();
  report.pageErrors=pageErrors;check(pageErrors.length===0,'no bootstrap runtime errors',pageErrors);
 }
 await page.close();
 if(!old){
  for(const scenario of ['conflict','unavailable']){
   const c=await browser.newContext({viewport:{width:1440,height:900}});c.setDefaultTimeout(15000);
   const local={...entries,[key]:JSON.stringify({...initial,kpIndex:1,resumeKpId:'circulation-b02-kp02'})};
   await c.addInitScript(e=>{for(const [k,v]of Object.entries(e))localStorage.setItem(k,v);window.__checkpointErrors=[];window.addEventListener('kianos:private-checkpoint-error',e=>window.__checkpointErrors.push(e.detail));},local);
   await c.route('**/__kianos-private/checkpoint',async route=>route.fulfill(scenario==='unavailable'?{status:503,json:{error:'synthetic unavailable'}}:route.request().method()==='GET'?{json:{status:'ready',checkpoint:seed}}:{json:{status:'saved',checkpoint_id:route.request().postDataJSON().checkpoint_id}}));
   const p=await c.newPage();await p.goto(base+'/xizong/circulation/b02/',{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>document.querySelector('[data-learner-writer-notice]')?.textContent.includes('尚未确认存档'));
   const result=await p.evaluate(k=>({state:JSON.parse(localStorage.getItem(k)),notice:document.querySelector('[data-learner-writer-notice]').textContent,events:window.__checkpointErrors,cursor:localStorage.getItem('kianos-vocabulary-last-ordinal')}),key);
   check(result.state.kpIndex===1&&result.cursor==='81'&&Object.keys(result.state.learned||{}).length===0,scenario+' preserves local progress and sibling cursor');
   check(result.events.length>0&&result.notice.includes('尚未确认存档'),scenario+' is visible from bootstrap, not only later autosave');
   if(scenario==='conflict')check(result.events[0].warnings.some(w=>w==='checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'),'conflict warning identifies responsible group');
   const geometry=await p.locator('[data-source-contact-done]').evaluate(e=>({bottom:e.getBoundingClientRect().bottom,viewport:innerHeight}));
   check(geometry.bottom<=geometry.viewport,scenario+' notice preserves visible source action row',geometry);
   await p.screenshot({path:path.join(out,scenario+'-notice.png')});await c.close();
  }
 }
 check(sourcePaths.every(p=>hash(p)===report.sourceHashes[p]),'source bytes unchanged throughout proof');
 report.ok=true;
}catch(error){report.error=String(error);console.error(error);process.exitCode=1;}
finally {
 await browser?.close();
 if(focusProcess?.exitCode===null)await terminateProcessTree(focusProcess.pid,{graceMs:1000});
 if(server.exitCode===null)await terminateProcessTree(server.pid,{graceMs:1000});
 report.serverLog=logs;fs.writeFileSync(path.join(out,'bootstrap-browser.json'),JSON.stringify(report,null,2),{mode:0o600});
 console.log('PROOF '+out);
}
