import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';
import { EXAM_PROFILE_KEY as P, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
const dir=path.resolve('../product-closure-evidence');fs.mkdirSync(dir,{recursive:true});
const report={testedCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:'Linux Chromium; Noto Sans CJK; isolated synthetic records; no actual Mac/U claim',checks:[],shots:[]};
const check=(name)=>{report.checks.push(name);console.log('PASS',name);};
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4416'],{stdio:'ignore',detached:true});const url='http://127.0.0.1:4416';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
const canonical=buildPoliticsPracticeCatalogCurrent('/'),qById=new Map(canonical.questions.map(q=>[q.id,q]));
const state=(page,key)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);
const allState=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
async function shot(page,name){await page.screenshot({path:path.join(dir,name+'.png')});report.shots.push({name,width:page.viewportSize().width,height:page.viewportSize().height});}
async function geometry(page,oneScreen=false){
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow');
 if(oneScreen) assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),true,'Home core needs a second viewport');
 const errors=await page.locator('[data-exam-home] button:not([hidden]),[data-exam-next]').evaluateAll(nodes=>nodes.filter(n=>n.offsetWidth&&n.offsetHeight&&!n.closest('dialog')).filter(n=>{const b=n.getBoundingClientRect();return b.x<0||b.right>innerWidth+1||b.y<0||b.bottom>innerHeight+1;}).map(n=>n.textContent));
 if(oneScreen)assert.deepEqual(errors,[],'Home action clipping');
}
try{
 for(let n=0;n<80;n++){try{if((await fetch(url)).ok)break;}catch{}await sleep(250);}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:780},timezoneId:'Asia/Shanghai'});const page=await context.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 // Date freezes fixture day only. Timers/elapsed durations still advance normally.
 await context.addInitScript(()=>{const NativeDate=Date,offset=NativeDate.parse('2026-09-16T10:00:00Z')-NativeDate.now();class FixtureDate extends NativeDate{constructor(...args){super(...(args.length?args:[NativeDate.now()+offset]));}static now(){return NativeDate.now()+offset;}}window.Date=FixtureDate;});
 await page.goto(url);await page.locator('[data-exam-home][data-ready=true]').waitFor();await sleep(300);
 assert.deepEqual(await allState(page),{});assert.ok((await page.locator('[data-exam-allocations]').innerText()).includes('待设置'));await shot(page,'home-cold-1440');await geometry(page,true);check('Cold Home is read-only, no fabricated capacity, scores or mastery');
 await page.click('[data-exam-settings]');await page.fill('[data-capacity-hours]','8');await page.check('[data-capacity-default]');await page.click('[data-exam-settings-form] button[type=submit]');
 assert.deepEqual(await page.locator('[data-allocation] b').allTextContents(),['4h30m','2h','1h30m']);assert.deepEqual(Object.keys(await allState(page)),[P]);await shot(page,'home-plan-1440');await geometry(page,true);
 await page.setViewportSize({width:1280,height:720});await shot(page,'home-plan-1280');await geometry(page,true);await page.setViewportSize({width:1440,height:780});check('Confirmed 8h replans three subjects and fits 1440/1280 without altering subject records');
 await page.click('[data-exam-record]');await page.fill('[data-studied=english]','120');await page.click('[data-exam-record-form] button[type=submit]');assert.equal(await page.locator('[data-allocation=english] b').innerText(),'休息');await page.reload();await page.locator('[data-exam-home][data-ready=true]').waitFor();assert.match(await page.locator('[data-exam-capacity]').innerText(),/已学 2h/);await shot(page,'home-actual-time');check('Optional confirmed actual time persists and reduces remaining allocation, not mastery');
 await page.click('[data-exam-settings]');await page.fill('[data-capacity-hours]','0');await page.uncheck('[data-capacity-default]');await page.click('[data-exam-settings-form] button[type=submit]');assert.ok((await page.locator('[data-allocation] b').allTextContents()).every(t=>t==='休息'));assert.equal((await state(page,P)).defaultDailyMinutes,480);await shot(page,'home-rest-day');check('Today-only rest does not erase normal capacity or manufacture tomorrow debt');
 await page.click('[data-exam-why]');await page.click('summary:has-text("阶段评估")');const beforeImport=JSON.stringify(await state(page,P));const imported={...emptyExamProfile(),defaultDailyMinutes:540};
 await page.setInputFiles('[data-exam-import]',{name:'private-confirmed.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});await page.locator('[data-exam-import-preview]').waitFor({state:'visible'});assert.equal(JSON.stringify(await state(page,P)),beforeImport);await page.click('[data-exam-import-confirm]');assert.equal((await state(page,P)).defaultDailyMinutes,540);check('Import previews private inputs and requires explicit confirmation; domain stores unchanged');
 const storageBefore=await state(page,P);await page.evaluate(key=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('fixture','QuotaExceededError');return old.call(this,k,v);};},P);
 await page.click('[data-exam-settings]');await page.fill('[data-capacity-hours]','7');await page.click('[data-exam-settings-form] button[type=submit]');await page.locator('[data-exam-settings-form] [data-form-error]:not([hidden])').waitFor();assert.deepEqual(await state(page,P),storageBefore);await page.reload();check('Saving failure leaves plan and previous private record unchanged');
 await page.goto(url+'/politics/review/');await page.locator('[data-politics-review][data-ready=true]').waitFor();await shot(page,'politics-review-empty');assert.equal(await page.locator('[data-review-action]').isVisible(),false);assert.equal((await allState(page))[K.attempts],undefined);check('Empty Review stays useful without creating tasks');
 await page.goto(url+'/politics/practice/?question=X1000-MARX-S-001');await page.selectOption('[data-filter-count]','5');await page.check('[data-learned-scope]');await page.click('[data-start-session]');
 const firstIds=[];
 for(let i=0;i<5;i++){
  const ss=await state(page,K.session), q=qById.get(ss.ids[ss.index]);firstIds.push(q.id);
  assert.equal(await page.locator('[data-submitted-result]').isVisible(),false);
  const answer=i===0?'ABCD'.split('').find(x=>!q.answer.includes(x)):q.answer;
  if(i===1){await page.click('[data-uncertain]');await page.click('[data-discussion]');}
  for(const a of answer)await page.click(`[data-option="${a}"]`);await page.click('[data-submit]');await page.locator('[data-submitted-result]').waitFor({state:'visible'});
  if(i===0){await page.fill('[data-note]','隔离验收样例：回原讲义厘清条件，不重学整章。');await page.locator('[data-note]').blur();await sleep(400);}
  await page.click('[data-next-question]');
 }
 await page.locator('[data-session-complete]').waitFor({state:'visible'});const firstStore=await state(page,K.attempts);
 await page.goto(url+'/politics/review/');await page.locator('[data-review-question]').first().waitFor();assert.equal(await page.locator('[data-review-question]').count(),2);await geometry(page);await shot(page,'politics-review-populated');
 await page.click('[data-review-filter="today"]');assert.equal(await page.locator('[data-review-question]').count(),2);await shot(page,'politics-review-today');await page.click('[data-review-filter="all"]');
 assert.deepEqual(await state(page,K.attempts),firstStore);check('Native wrong + meaningful uncertain appear once in Review; visit does not clear first evidence');
 await page.click('[data-review-start]');await page.locator('[data-practice-setup]').waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('[data-available-count]')?.textContent==='2');assert.equal(await page.locator('[data-available-count]').innerText(),'2');await page.check('[data-learned-scope]');await page.click('[data-start-session]');
 let ss=await state(page,K.session);assert.equal(ss.scope.mode,'review');assert.equal(ss.ids.length,2);assert.equal(ss.origin,'/politics/review/');await shot(page,'politics-review-attempt');
 for(let i=0;i<2;i++){
  ss=await state(page,K.session);const q=qById.get(ss.ids[ss.index]);for(const a of q.answer)await page.click(`[data-option="${a}"]`);await page.click('[data-submit]');await page.locator('[data-submitted-result]').waitFor({state:'visible'});
  if(i===0){
   await page.click('[data-return-unit]');await page.locator('[data-practice-exact-return]').waitFor({state:'visible'});const sourceUrl=page.url();await shot(page,'politics-exact-return');await page.goto(url+'/politics/review/');await page.locator('[data-review-resume-link]').waitFor({state:'visible'});assert.equal(new URL(await page.locator('[data-review-resume-link]').getAttribute('href'),url).href,sourceUrl);await page.click('[data-review-resume-link]');await page.click('[data-practice-exact-return]');await page.locator('[data-submitted-result]').waitFor({state:'visible'});await page.reload();await page.locator('[data-submitted-result]').waitFor({state:'visible'});assert.equal((await state(page,K.session)).id,ss.id);
  }
  await page.click('[data-next-question]');
 }
 await page.locator('[data-session-complete]').waitFor({state:'visible'});await page.click('[data-complete-return]');await page.locator('[data-politics-review][data-ready=true]').waitFor();assert.equal(await page.locator('[data-review-action]').isVisible(),false);assert.equal(await page.locator('[data-review-question]').count(),1);assert.match(await page.locator('[data-review-groups]').innerText(),/留给讨论/);assert.deepEqual(await state(page,K.attempts),firstStore);await shot(page,'politics-review-after-correction');check('Review uses native attempts/Return, stable correction clears current problem only, independent discussion and immutable first attempts survive');
 const readonly=await allState(page);await page.goto(url);await page.locator('[data-exam-home][data-ready=true]').waitFor();assert.deepEqual(await allState(page),readonly);check('Global Home remains a read-only consumer after real browser journey');
 await page.click('[data-exam-settings]');const other=await context.newPage();await other.goto(url);await other.evaluate(({key})=>{const v=JSON.parse(localStorage.getItem(key));v.defaultDailyMinutes=420;localStorage.setItem(key,JSON.stringify(v));},{key:P});await page.fill('[data-capacity-hours]','6');await page.click('[data-exam-settings-form] button[type=submit]');await page.locator('[data-exam-settings-form] [data-form-error]:not([hidden])').waitFor();assert.equal((await state(page,P)).defaultDailyMinutes,420);await other.close();await page.reload();check('Stale cross-tab edit cannot overwrite a newer private plan');
 await page.setViewportSize({width:390,height:844});await geometry(page);await shot(page,'home-narrow');await page.goto(url+'/politics/review/');await geometry(page);await shot(page,'politics-review-narrow');
 await page.evaluate(key=>localStorage.setItem(key,'{'),K.attempts);await page.reload();await page.locator('[data-review-error]').waitFor({state:'visible'});assert.equal(await page.locator('[data-review-action]').isVisible(),false);assert.equal(await page.locator('[data-review-empty]').isVisible(),false);check('Corrupt review evidence fails closed, not a fake no-problems state');
 assert.deepEqual(pageErrors,[]);check('No browser exceptions');
 report.status='PASS';
}catch(e){if(browser){for(const [i,p] of browser.contexts().flatMap(c=>c.pages()).entries())try{await p.screenshot({path:path.join(dir,`failure-${i}.png`)});}catch{}}report.status='FAIL';report.error=String(e.stack||e);throw e;}
finally{fs.writeFileSync(path.join(dir,'browser.json'),JSON.stringify(report,null,2));if(browser)await browser.close();try{process.kill(-server.pid,'SIGTERM');}catch{server.kill();}}
