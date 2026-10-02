// Native Chrome focus + production page/modules; synthetic endpoint responses only.
// Uses an already-running isolated candidate, never Stable or a real profile.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { renderStudyhub } from '../src/lib/studyhubContent.mjs';
import { EXAM_PROFILE_KEY, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
const { chromium }=await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.KIANOS_PRESENTATION_TEST_BASE || 'http://127.0.0.1:4358';
assert.match(base,/^http:\/\/127\.0\.0\.1:(?!4321$)\d+$/);
const out=path.resolve(process.env.KIANOS_PRESENTATION_TEST_OUT || '../output/playwright/runtime-proof');fs.mkdirSync(out,{recursive:true});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-presentation-native-'));
const chrome=process.env.KIANOS_TEST_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const report={base,scope:'isolated candidate; production learner modules; synthetic endpoints; native focus without emulation',checks:[],errors:[]};
const check=(ok,name,detail=null)=>{report.checks.push({name,pass:!!ok,detail});assert.ok(ok,name+': '+JSON.stringify(detail));console.log('PASS '+name);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,name,timeout=20000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await fn())return;await sleep(80);}throw Error('TIMEOUT '+name);}
const child=spawn(chrome,['--headless=new','--remote-debugging-port=0','--user-data-dir='+temp,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--enable-automation','--window-size=1440,1000','about:blank'],{stdio:['ignore','ignore','pipe']});
let browser,chromeLog='',checkpoint=null,mode='missing',gateRelease,gateEntered=false,currentSha='a'.repeat(40),documentSha=currentSha;
child.stderr.on('data',s=>chromeLog=(chromeLog+s).slice(-12000));
const calls=[];const writer=p=>p.evaluate(()=>document.documentElement.dataset.learnerWriter);
const keys=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
const focusWitness=pages=>Promise.all(pages.map(p=>p.evaluate(async()=>({focus:document.hasFocus(),visibility:document.visibilityState,writer:document.documentElement.dataset.learnerWriter,locks:await navigator.locks.query()}))));
try{
  let port;await until(()=>{try{port=Number(fs.readFileSync(path.join(temp,'DevToolsActivePort'),'utf8').split('\n')[0]);return !!port;}catch{return false;}},'native browser');
  browser=await chromium.connectOverCDP('http://127.0.0.1:'+port,{noDefaults:true});
  const context=browser.contexts()[0];
  context.on('page',p=>p.on('pageerror',e=>report.errors.push(e.message)));
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==base)return route.continue();
    if(url.pathname==='/favicon.ico')return route.fulfill({status:204});
    if(url.pathname==='/__kianos-current.json'){
      calls.push({kind:'current',page:req.frame().page().url()});return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'synced',sha:currentSha})});
    }
    if(url.pathname.startsWith('/__kianos-private/')){
      calls.push({kind:url.pathname,method:req.method(),page:req.frame().page().url()});
      if(url.pathname==='/__kianos-private/checkpoint'){
        if(req.method()==='PUT'){if(mode==='conflict')return route.fulfill({status:409,contentType:'application/json',body:'{"error":"synthetic conflict"}'});checkpoint=req.postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'saved',checkpoint_id:checkpoint.checkpoint_id})});}
        if(mode==='gate'){gateEntered=true;await new Promise(r=>gateRelease=r);}
        try{
          if(mode==='fail')return await route.fulfill({status:503,contentType:'application/json',body:'{"error":"synthetic outage"}'});
          if(checkpoint&&mode!=='missing')return await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'ready',checkpoint})});
          return await route.fulfill({status:404,contentType:'application/json',body:'{"status":"missing"}'});
        }catch{return;}
      }
      // No real control or private data is read or executed by this proof.
      return route.fulfill({status:404,contentType:'application/json',body:'{"status":"missing"}'});
    }
    if(req.isNavigationRequest()){
      const response=await route.fetch();let html=await response.text();
      html=html.replace(/data-kianos-release-sha(?:="[^"]*")?/,`data-kianos-release-sha="${documentSha}"`);
      if(url.searchParams.has('legacy-fixture'))html=html.replace(/ data-kianos-runtime="[^"]*"/g,'').replace(/ data-kianos-learner-region(?:="[^"]*")?/g,'');
      return route.fulfill({response,body:html});
    }
    return route.continue();
  });
  const learner=await context.newPage();mode='gate';
  await learner.goto(base+'/xizong/circulation/b02/',{waitUntil:'domcontentloaded'});await learner.bringToFront();
  await until(()=>gateEntered,'delayed checkpoint read');
  check(await learner.locator('[data-kianos-release-sha]').getAttribute('data-kianos-release-sha')===documentSha,'Current fixture has exact source identity');
  const pending=await learner.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,canvas:document.querySelector('main').inert,dock:document.querySelector('[data-study-timer-dock]').parentElement.inert,rail:!!document.querySelector('.kianosGlobalRail').closest('[inert]'),blocked:(()=>{try{localStorage.setItem('kianos-stage2-sentinel','early');return false;}catch{return true;}})()}));
  check(pending.writer==='waiting'&&pending.canvas&&pending.dock&&!pending.rail&&pending.blocked,'delayed recovery protects main and dock while navigation remains usable',pending);
  const railBefore=await learner.locator('[data-kianos-rail-toggle]').getAttribute('aria-expanded');await learner.locator('[data-kianos-rail-toggle]').click();
  check(await learner.locator('[data-kianos-rail-toggle]').getAttribute('aria-expanded')!==railBefore,'navigation toggle does not wait for recovery');
  currentSha='b'.repeat(40);documentSha=currentSha;
  check(!calls.some(x=>x.kind==='current'||x.method==='PUT'||x.kind.includes('/control/')),'Current update, autosave and control do not run during delayed recovery',calls);
  const before=await keys(learner);
  const reader=await context.newPage();await reader.goto(base+'/studyhub/assets/ENERGY_RESOURCES_SYSTEM_FOUNDATION_GUIDE/');await reader.bringToFront();
  const witness=await focusWitness([learner,reader]);check(!witness[0].focus&&witness[1].focus,'native learner loses focus to reader',witness);
  mode='missing';gateRelease();
  await until(async()=>!(await learner.evaluate(()=>navigator.locks.query())).held.some(x=>x.name==='kianos-native-learner-writer-v1'),'background recovery releases lease without activation');
  check(await writer(learner)==='waiting'&&!(await writer(reader)),'background recovery does not activate learner; reader never owns writer');
  const after=await keys(reader);const native=values=>Object.fromEntries(Object.entries(values).filter(([k])=>!k.startsWith('kianos-studyhub-reader-v1:')&&k!=='kianos-global-rail-expanded-v1'));
  check(JSON.stringify(native(after))===JSON.stringify(native(before)),'late background recovery does not mutate native stores');
  check(!calls.some(x=>x.page.includes('/studyhub/')&&x.kind.startsWith('/__kianos-private')),'presentation page never consumes checkpoint or control');
  await learner.bringToFront();await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  await until(()=>calls.some(x=>x.method==='PUT'),'legacy learner autosave still starts');
  check(await learner.locator('main[data-kianos-learner-region]').evaluate(n=>!n.inert),'legacy learner controls become available after recovery');
  await learner.evaluate(()=>localStorage.setItem('kianos-stage2-sentinel','first-owner'));
  await learner.locator('[data-xizong-mark-menu]').waitFor({state:'attached'});
  const next=await context.newPage();await next.goto(base+'/skills/');await next.bringToFront();await next.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='retired');
  check(await learner.locator('[data-xizong-mark-menu]').evaluate(n=>n.inert),'body-level native mark menu is protected on retirement');
  check((await focusWitness([learner,next]))[0].focus===false,'native cross-tab handoff retires old page',await focusWitness([learner,next]));
  await next.evaluate(()=>localStorage.setItem('kianos-stage2-sentinel','new-owner'));
  const stale=await learner.evaluate(async()=>{await new Promise(r=>setTimeout(r,100));try{localStorage.setItem('kianos-stage2-sentinel','stale');return '';}catch(e){return e.message;}});
  check(stale==='KIANOS_LEARNER_WRITER_RELOAD_REQUIRED'&&await next.evaluate(()=>localStorage.getItem('kianos-stage2-sentinel'))==='new-owner','delayed old callback cannot overwrite new owner');
  currentSha='c'.repeat(40);documentSha=currentSha;await sleep(3300);
  const reloaded=learner.waitForEvent('domcontentloaded');await learner.bringToFront();await reloaded;await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  check(await learner.evaluate(()=>localStorage.getItem('kianos-stage2-sentinel'))==='new-owner','Current change plus foreground return preserves latest native state');
  check(await learner.locator('[data-kianos-release-sha]').getAttribute('data-kianos-release-sha')===currentSha,'foreground return loads current document identity');
  // Native conflict: a changed remote checkpoint must not win over changed local truth.
  await until(()=>checkpoint?.payload?.shared,'captured synthetic native checkpoint');
  const remote=structuredClone(checkpoint);remote.checkpoint_id='synthetic-stage2-conflict';remote.generated_at=new Date(Date.now()+1000).toISOString();
  remote.payload.shared.exam_profile={...(remote.payload.shared.exam_profile||emptyExamProfile()),defaultDailyMinutes:333};
  mode='conflict';checkpoint=remote;
  await learner.evaluate(({key,profile})=>localStorage.setItem(key,JSON.stringify(profile)),{key:EXAM_PROFILE_KEY,profile:{...emptyExamProfile(),defaultDailyMinutes:444}});
  await learner.reload();await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  await learner.locator('[data-learner-writer-notice]').filter({hasText:'尚未确认存档'}).waitFor();
  check(await learner.evaluate(key=>JSON.parse(localStorage.getItem(key)).defaultDailyMinutes,EXAM_PROFILE_KEY)===444,'conflicting checkpoint preserves native local profile with visible warning');
  let navigations=0;const onNavigation=frame=>{if(frame===learner.mainFrame())navigations++;};learner.on('framenavigated',onNavigation);
  currentSha='d'.repeat(40);documentSha=currentSha;await sleep(3300);
  check(navigations===0,'Current update never reloads active foreground conflict page');learner.off('framenavigated',onNavigation);
  // Explicit recovery failure never resolves learner readiness or starts consumers.
  const protectedBefore=native(await keys(learner));mode='fail';const callStart=calls.length;
  await learner.goto(base+'/xizong/circulation/b02/?checkpoint-durable-restore=synthetic-missing');await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='unavailable');
  const failed=await learner.evaluate(()=>({writer:document.documentElement.dataset.learnerWriter,blocked:(()=>{try{localStorage.setItem('kianos-stage2-sentinel','bad');return false;}catch{return true;}})()}));
  check(failed.blocked&&JSON.stringify(native(await keys(learner)))===JSON.stringify(protectedBefore),'failed recovery preserves native bytes and denies writes',failed);
  check(!calls.slice(callStart).some(x=>x.kind==='current'||x.method==='PUT'||x.kind.includes('/control/')),'failed recovery starts no Current refresh, checkpoint save or control');
  const unavailableToggle=await learner.locator('[data-kianos-rail-toggle]').getAttribute('aria-expanded');await learner.locator('[data-kianos-rail-toggle]').click();
  check(await learner.locator('[data-kianos-rail-toggle]').getAttribute('aria-expanded')!==unavailableToggle,'failed recovery still permits navigation');
  // Untagged legacy shells preserve the previous whole-page inert fallback.
  mode='gate';gateEntered=false;await learner.goto(base+'/skills/?legacy-fixture=1');await until(()=>gateEntered,'legacy delayed read');
  check(await learner.locator('.kianosShellFrame').evaluate(n=>n.inert),'unmarked legacy shell retains whole-page protection');
  mode='missing';gateRelease();await learner.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  check(await learner.locator('.kianosShellFrame').evaluate(n=>!n.inert),'legacy fallback releases only after readiness');
  check(report.errors.length===0,'no uncaught runtime errors',report.errors);
  // No request interception on this page: exercise Chrome's actual BFCache.
  await context.unroute('**/*');
  for(const openPage of context.pages())await openPage.close();
  const historyPage=await context.newPage();
  await historyPage.addInitScript(()=>{window.__historyEvents=[];addEventListener('pageshow',event=>window.__historyEvents.push(event.persisted));});
  const A='/studyhub/assets/ENERGY_RESOURCES_SYSTEM_FOUNDATION_GUIDE/',B='/studyhub/assets/W5_DIRECTION_PRODUCTION_CAPITAL_STATE_CAPACITY_PILOT/',C='/studyhub/assets/W5_DIRECTION_POPULATION_MOMENTUM_FAMILY_LABOUR_ADAPTATION/';
  const ready=()=>historyPage.waitForFunction(()=>Array.isArray(history.state?.shTrail)&&document.querySelector('[data-sh-reader]'));
  const visit=async target=>{await historyPage.goto(base+target);await ready();};
  const clickTo=async target=>{await historyPage.locator('a[data-sh-link][href="'+target+'"]').last().click();await historyPage.waitForURL(base+target,{waitUntil:'commit'});if(target!=='/studyhub/')await ready();await sleep(100);};
  const back=async target=>{await historyPage.goBack({waitUntil:'commit'});await historyPage.waitForURL(base+target,{waitUntil:'commit'});await ready();await sleep(80);};
  const forward=async target=>{await historyPage.goForward({waitUntil:'commit'});await historyPage.waitForURL(base+target,{waitUntil:'commit'});await ready();await sleep(80);};
  const returnState=()=>historyPage.evaluate(()=>({path:location.pathname,trail:history.state?.shTrail||[],hidden:document.querySelector('[data-sh-return]').hidden,title:document.querySelector('[data-sh-return]').title,persisted:window.__historyEvents.at(-1)}));
  const matches=async target=>{const state=await returnState();return state.trail.at(-1)?.url===target&&state.title===state.trail.at(-1)?.title&&!state.hidden;};
  await visit(A);await clickTo(B);await clickTo(C);await back(B);
  check((await returnState()).persisted===true,'actual native Back restores B from BFCache');
  check(await matches(A),'cached B return label and target both refer to A');
  await forward(C);check(await matches(B),'native Forward restores C with its own B return target',await returnState());
  await back(B);await back(A);check((await returnState()).hidden,'multiple native Back operations clear the original article return path');
  await forward(B);await forward(C);await back(B);await historyPage.locator('[data-sh-return]').click();await historyPage.waitForURL(base+A,{waitUntil:'commit'});
  check((await returnState()).hidden,'custom return after native Back reaches A without a self return');
  await clickTo(B);await clickTo('/studyhub/');await clickTo(A);
  check(await matches(B),'repeated A through world navigation keeps the intervening B return target');
  await historyPage.locator('[data-sh-return]').click();await historyPage.waitForURL(base+B,{waitUntil:'commit'});check(await matches(A),'return from repeated A reaches B with its original A predecessor');
  await visit(C);check((await returnState()).hidden,'direct entry does not inherit a stale return trail');
  await historyPage.reload();check((await returnState()).hidden,'direct-entry reload preserves an empty return trail');
  const security=await context.newPage();
  const attacks=['<details><img src=x onerror="window.__studyhubXss=1"','<details><summary onclick="window.__studyhubXss=1">Unsafe</summary></details>','<svg onload="window.__studyhubXss=1"></svg>','<iframe srcdoc="<script>parent.__studyhubXss=1</script>"></iframe>'];
  for(const markdown of attacks){
    const rendered=renderStudyhub({file:'assets/synthetic.md',markdown},{docs:new Map(),revision:'synthetic-test-only'});
    await security.setContent('<article>'+rendered.html+'</article>');await sleep(50);
    check(await security.evaluate(()=>!window.__studyhubXss&&!document.querySelector('img,svg,iframe,script,[onclick],[onerror]')),'browser treats malicious complete/incomplete raw HTML as text');
  }
  report.ok=true;
}catch(error){report.error=error.stack;throw error;}
finally{
  if(gateRelease)gateRelease();try{await browser?.close();}catch{}child.kill('SIGTERM');
  await sleep(300);fs.rmSync(temp,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  report.chromeLog=chromeLog;report.calls=calls;fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({ok:report.ok||false,checks:report.checks.length,out}));
}
