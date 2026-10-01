import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { CONTROL_LOCAL_RECEIPT_KEY, CONTROL_RECEIPT_SCHEMA } from '../src/lib/privateControlCommand.mjs';
import { isolatedCandidateEnv } from './kianos-candidate-runtime.mjs';
import { writePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';
import { saveSharedControlToPrivate } from '../src/lib/privateCheckpointRuntime.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { reconcileXizongRevision } from '../src/lib/xizongContentRevision.mjs';
import { EXAM_PROFILE_KEY, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
import { STUDY_TIMER_STATE_KEY, STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_SCHEMA, emptyStudyTimerState } from '../src/lib/studyTimer.mjs';
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifact = path.resolve(process.argv[2] || path.join(webRoot, '.current-build-next'));
const port = Number(process.env.KIANOS_BOOTSTRAP_TEST_PORT || 4368);
assert.ok(Number.isInteger(port) && port !== 4321 && port > 1024);
assert.ok(fs.existsSync(path.join(artifact, 'xizong/circulation/b02/index.html')));
const out = process.env.KIANOS_BOOTSTRAP_TEST_OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-bootstrap-proof-'));
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-bootstrap-runtime-'));
const env = isolatedCandidateEnv(temp, process.env, 'bootstrap-verification');
const base = `http://127.0.0.1:${port}`;
const key = 'kianos-xizong-astro-v2:xizong:circulation-b02';
const cursorKey = 'kianos-vocabulary-last-ordinal';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class Storage { constructor(entries) { this.map = new Map(Object.entries(entries)); } get length() { return this.map.size; } key(i) { return [...this.map.keys()][i] ?? null; } getItem(k) { return this.map.get(k) ?? null; } setItem(k,v) { this.map.set(k,String(v)); } removeItem(k) { this.map.delete(k); } }
// Canonical identity only; every learner field below is synthetic.
const learner = resolveXizongLearnerProjection(loadXizongBlock('circulation', 'b02')).learnerObject;
const state = { ...reconcileXizongRevision({}, learner.revisionWitness), sourceHash: learner.sourceHash,
  stage: 'source_contact', kpIndex: 4, groupIndex: 1, sourceSegmentIndex: 0,
  resumeKpId: learner.kps[4].identity.kpId, resumeGroupId: learner.kps[4].identity.logicGroupId,
  learned: {}, ratings: {}, sourceContactDone: false, completed: false, blockRecallDone: false };
const source = new Storage({ [key]: JSON.stringify(state), [cursorKey]: '81',
  [CONTROL_LOCAL_RECEIPT_KEY]: JSON.stringify({schema:CONTROL_RECEIPT_SCHEMA,command_id:'synthetic-bootstrap-browser',command_hash:'a'.repeat(64),status:'APPLIED',observed_at:new Date().toISOString()}),
  [EXAM_PROFILE_KEY]: JSON.stringify(emptyExamProfile()), [STUDY_TIMER_STATE_KEY]: JSON.stringify(emptyStudyTimerState()),
  [STUDY_TIMER_LEDGER_KEY]: JSON.stringify({schema: STUDY_TIMER_SCHEMA, sessions: []}) });
let seed;
assert.equal((await saveSharedControlToPrivate(source, {readCheckpoint: async()=>({status:'missing'}), writeCheckpoint: async value=>{seed=value;}})).status, 'saved');
writePrivateLearnerCheckpoint(seed, env.KIANOS_PRIVATE_DIR);
const report = {scope: 'compiled artifact, isolated backend, native browser focus, synthetic records only', artifact, checks: [], focus: [], errors: []};
const check = (ok, name, detail = null) => { report.checks.push({name, pass:Boolean(ok), detail}); assert.ok(ok, name + ': ' + JSON.stringify(detail)); console.log('PASS ' + name); };
const server = spawn(process.execPath, [path.join(webRoot,'scripts/kianos-static-server.mjs'),'--port',String(port),'--root',artifact,'--release-probe-only'], {cwd:webRoot, env, stdio:['ignore','pipe','pipe'], detached:true});
let serverLog='', chromeLog='', chromeProcess, browser;
server.stdout.on('data',chunk=>{serverLog+=chunk;}); server.stderr.on('data',chunk=>{serverLog+=chunk;});
const disk = () => JSON.parse(fs.readFileSync(path.join(env.KIANOS_PRIVATE_DIR,'latest.json'),'utf8'));
const b2 = value => JSON.parse(value.payload.subjects.xizong.entries.find(row=>row.key===key).raw);
async function until(fn, label, timeout=20000) { const end=Date.now()+timeout; while(Date.now()<end){if(await fn())return;await sleep(80);}throw new Error('TIMEOUT:'+label); }
async function ready(page){await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active',null,{timeout:20000});}
async function focusWitness(pages){return await Promise.all(pages.map(page=>page.evaluate(async()=>({url:location.pathname,focus:document.hasFocus(),visibility:document.visibilityState,writer:document.documentElement.dataset.learnerWriter,locks:await navigator.locks.query()}))));}
async function stop(child){ if(!child || child.exitCode!==null)return; const exited=new Promise(resolve=>child.once('exit',resolve));try{process.kill(-child.pid,'SIGTERM');}catch{}await Promise.race([exited,sleep(3000)]);if(child.exitCode===null){try{process.kill(-child.pid,'SIGKILL');}catch{}await Promise.race([exited,sleep(1000)]);} }
try {
  await until(async()=>{try{return (await fetch(base+'/')).ok;}catch{return false;}},'isolated server');
  const chrome = process.env.KIANOS_TEST_CHROME || chromium.executablePath();
  assert.ok(fs.existsSync(chrome), 'Set KIANOS_TEST_CHROME to an installed vendor browser');
  const profile = path.join(temp,'browser-profile');
  chromeProcess=spawn(chrome,[...(process.env.KIANOS_TEST_HEADED==='1'?[]:['--headless=new']),'--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--enable-automation','--window-size=1440,900','about:blank'],{stdio:['ignore','ignore','pipe'],detached:true});
  chromeProcess.stderr.on('data',chunk=>{chromeLog=(chromeLog+chunk).slice(-12000);});
  let debugPort;
  await until(()=>{try{debugPort=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);return !!debugPort;}catch{return false;}},'vendor browser');
  // Reuse the native-focus method already owned by test-private-control-browser.
  // noDefaults prevents focus emulation; never replace document.hasFocus/locks.
  browser=await chromium.connectOverCDP('http://127.0.0.1:'+debugPort,{noDefaults:true});
  const context=browser.contexts()[0];
  context.on('page',page=>page.on('pageerror',error=>report.errors.push(error.message)));
  let firstGet=true, getStarted=false, releaseGet;
  const responseGate=new Promise(resolve=>{releaseGet=resolve;});
  await context.route('**/__kianos-private/checkpoint',async route=>{
    if(firstGet && route.request().method()==='GET'){firstGet=false;getStarted=true;await responseGate;}
    await route.continue();
  });
  const page=await context.newPage();
  await page.goto(base+'/xizong/circulation/b02/',{waitUntil:'domcontentloaded'}); await page.bringToFront();
  await until(()=>getStarted,'bootstrap read starts');
  const waiting=await page.evaluate(key=>({writer:document.documentElement.dataset.learnerWriter,raw:localStorage.getItem(key),blocked:(()=>{try{localStorage.setItem(key,'{}');return false;}catch{return true;}})()}),key);
  check(waiting.writer==='waiting' && waiting.raw===null && waiting.blocked,'no_native_write_before_checkpoint_read_finishes',waiting);
  releaseGet(); await ready(page);
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'null')?.kpIndex===4,key);
  check(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).stage==='source_contact',key),'compiled_startup_restores_exact_saved_position');
  await until(()=>b2(disk()).kpIndex===4 && disk().checkpoint_id!==seed.checkpoint_id,'first autosave');
  check(disk().payload.shared.capture_warnings.length===0,'restored_lineage_saves_without_false_conflict');
  const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  await page.locator('[data-companion-next="source_contact"]').click();
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).kpIndex===5,key);
  check(await page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)).learned).length===0,key),'navigation_preserves_unlearned_evidence');
  const session=await browser.newBrowserCDPSession();
  const target=await session.send('Target.createTarget',{url:'about:blank',background:true});
  await until(()=>context.pages().length>=3,'background target');
  let newer;
  for(const candidate of context.pages()){
    const cdp=await context.newCDPSession(candidate);
    const info=await cdp.send('Target.getTargetInfo'); await cdp.detach();
    if(info.targetInfo.targetId===target.targetId)newer=candidate;
  }
  assert.ok(newer,'created background target belongs to isolated context');
  await newer.goto(base+'/vocabulary/',{waitUntil:'domcontentloaded'});
  await sleep(700);
  const background=await focusWitness([page,newer]); report.focus.push({phase:'background',pages:background});
  check(background[0].focus && !background[1].focus && background[0].writer==='active' && background[1].writer==='waiting','background_page_does_not_steal_writer',background);
  await newer.bringToFront(); await ready(newer);
  await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='retired');
  const handoff=await focusWitness([page,newer]); report.focus.push({phase:'handoff',pages:handoff});
  check(!handoff[0].focus && handoff[1].focus && handoff[0].writer==='retired','real_foreground_handoff_retires_old_writer',handoff);
  const rejection=await page.evaluate(key=>{try{localStorage.setItem(key,'{}');return null;}catch(error){return error.message;}},key);
  check(/KIANOS_LEARNER_WRITER_RELOAD_REQUIRED/.test(rejection),'retired_tab_cannot_overwrite_current_state',rejection);
  check(await newer.evaluate(key=>localStorage.getItem(key)==='81',cursorKey),'cross_subject_navigation_preserves_coverage_cursor');
  const navigation=page.waitForEvent('domcontentloaded');
  await page.bringToFront(); await navigation; await ready(page);
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'null')?.kpIndex===5,key);
  check(await page.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)).learned).length===0,key),'retired_page_reload_restores_latest_position_without_fake_learning');
  await page.screenshot({path:path.join(out,'native-foreground-restored.png')});
  let failPuts=true;
  await context.unroute('**/__kianos-private/checkpoint');
  await context.route('**/__kianos-private/checkpoint',async route=>{
    if(failPuts && route.request().method()==='PUT')await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'synthetic-save-unavailable'})});
    else await route.continue();
  });
  await page.evaluate(()=>window.dispatchEvent(new Event('kianos:subject-continue-updated')));
  await page.locator('[data-learner-writer-notice]').filter({hasText:'尚未确认存档'}).waitFor();
  check(true,'compiled_save_failure_is_visible');
  await page.screenshot({path:path.join(out,'compiled-save-failure.png')});
  failPuts=false;
  await page.evaluate(()=>window.dispatchEvent(new Event('kianos:subject-continue-updated')));
  await page.waitForFunction(()=>document.querySelector('[data-learner-writer-notice]')?.hidden===true);
  await until(()=>b2(disk()).kpIndex===5,'position saved after failure');
  check(disk().payload.shared.capture_warnings.length===0,'save_recovery_clears_notice_and_keeps_position');
  await context.unroute('**/__kianos-private/checkpoint');
  await context.route('**/__kianos-private/checkpoint',async route=>{
    if(route.request().method()==='GET')await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'synthetic-read-unavailable'})});
    else await route.continue();
  });
  await page.reload({waitUntil:'domcontentloaded'}); await ready(page);
  check(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).kpIndex===5,key),'temporary_backup_outage_does_not_reset_valid_local_progress');

  // Reuse #1120's unique proof: retained conflicts and unavailable backup reads
  // are visible immediately at bootstrap, and the shared notice does not hide
  // the existing source action row at the supported Mac viewport.
  for (const scenario of ['conflict','unavailable']) {
    const isolated = await browser.newContext({viewport:{width:1440,height:900}});
    isolated.setDefaultTimeout(15000);
    const localState = {...state,kpIndex:1,groupIndex:0,resumeKpId:learner.kps[1].identity.kpId,resumeGroupId:learner.kps[1].identity.logicGroupId};
    const localEntries = {...Object.fromEntries([...source.map].filter(([storageKey])=>![
      'kianos-private-checkpoint-base-v1','kianos-private-checkpoint-lineage-v2'
    ].includes(storageKey))),[key]:JSON.stringify(localState)};
    await isolated.addInitScript(entries=>{
      for(const [k,v] of Object.entries(entries))localStorage.setItem(k,v);
      window.__checkpointErrors=[];
      window.addEventListener('kianos:private-checkpoint-error',event=>window.__checkpointErrors.push(event.detail));
    },localEntries);
    let isolatedCheckpoint=structuredClone(seed);
    await isolated.route('**/__kianos-private/checkpoint',async route=>{
      if(route.request().method()==='GET'){
        if(scenario==='unavailable') return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'synthetic unavailable'})});
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'ready',checkpoint:isolatedCheckpoint})});
      }
      if(route.request().method()==='PUT') {
        isolatedCheckpoint=route.request().postDataJSON();
        return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({status:'saved',checkpoint_id:isolatedCheckpoint.checkpoint_id})});
      }
      return route.continue();
    });
    const probe=await isolated.newPage(); await probe.goto(base+'/xizong/circulation/b02/',{waitUntil:'domcontentloaded'}); await probe.bringToFront(); await ready(probe);
    await probe.locator('[data-learner-writer-notice]').filter({hasText:'尚未确认存档'}).waitFor();
    const visible=await probe.evaluate(key=>({state:JSON.parse(localStorage.getItem(key)),cursor:localStorage.getItem('kianos-vocabulary-last-ordinal'),events:window.__checkpointErrors}),key);
    check(visible.state.kpIndex===1 && visible.cursor==='81',scenario+'_bootstrap_preserves_local_progress_and_sibling_cursor',visible);
    check(visible.events.length>0,scenario+'_bootstrap_warning_is_visible_before_later_user_action',visible.events);
    if(scenario==='conflict')check(visible.events.some(event=>event?.warnings?.includes('checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT')),'conflict_warning_identifies_responsible_group',visible.events);
    const geometry=await probe.locator('[data-source-contact-done]').evaluate(node=>({bottom:node.getBoundingClientRect().bottom,viewport:innerHeight}));
    check(geometry.bottom<=geometry.viewport,scenario+'_notice_keeps_source_action_in_viewport',geometry);
    await isolated.close();
  }
  await page.bringToFront();
  await context.unroute('**/__kianos-private/checkpoint');
  await page.evaluate(()=>window.dispatchEvent(new Event('kianos:subject-continue-updated')));
  await sleep(400);
  check(report.errors.length===0,'no_uncaught_browser_errors',report.errors);
  const external=disk(); const expectedExternalId=external.checkpoint_id;
  external.generated_at=new Date(Math.max(Date.now(),Date.parse(external.generated_at)+1)).toISOString();
  external.checkpoint_id='synthetic-explicit-'+crypto.randomUUID();
  external.payload.shared.capture_warnings=['checkpoint:shared:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT','checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'];
  external.payload.shared.exam_profile.defaultDailyMinutes=300;
  external.payload.subjects.xizong.entries.find(row=>row.key===key).raw=JSON.stringify(state);
  writePrivateLearnerCheckpoint(external,env.KIANOS_PRIVATE_DIR,{expectedCheckpointId:expectedExternalId});
  await context.addInitScript(({key})=>{
    window.addEventListener('kianos:learner-writer-ready',()=>{window.__readyPosition=JSON.parse(localStorage.getItem(key)||'null')?.kpIndex;},{once:true});
  },{key});
  await page.goto(base+'/xizong/circulation/b02/?checkpoint-durable-restore='+external.checkpoint_id,{waitUntil:'domcontentloaded'});
  await ready(page);
  const explicit=await page.evaluate(()=>({readyPosition:window.__readyPosition,status:document.documentElement.dataset.checkpointDurableRestore}));
  check(explicit.readyPosition===4 && explicit.status==='saved','explicit_recovery_finishes_before_consumer_ready',explicit);
  check(!new URL(page.url()).searchParams.has('checkpoint-durable-restore'),'successful_explicit_request_is_consumed_once');
  await page.locator('[data-companion-next="source_contact"]').click();
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).kpIndex===5,key);
  const externalAgain=disk(); const expectedAgain=externalAgain.checkpoint_id;
  externalAgain.checkpoint_id='synthetic-rebase-'+crypto.randomUUID();
  externalAgain.generated_at=new Date(Math.max(Date.now(),Date.parse(externalAgain.generated_at)+1)).toISOString();
  externalAgain.payload.shared.capture_warnings=['checkpoint:shared:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT','checkpoint:xizong:PRIVATE_CHECKPOINT_LOCAL_BASE_CONFLICT'];
  externalAgain.payload.shared.exam_profile.defaultDailyMinutes=400;
  externalAgain.payload.subjects.xizong.entries.find(row=>row.key===key).raw=JSON.stringify(state);
  writePrivateLearnerCheckpoint(externalAgain,env.KIANOS_PRIVATE_DIR,{expectedCheckpointId:expectedAgain});
  await page.goto(base+'/xizong/circulation/b02/?checkpoint-lineage-rebase='+externalAgain.checkpoint_id,{waitUntil:'domcontentloaded'});
  await ready(page);
  const rebased=await page.evaluate(()=>({readyPosition:window.__readyPosition,status:document.documentElement.dataset.checkpointLineageRebase}));
  check(rebased.readyPosition===5 && rebased.status==='saved' && b2(disk()).kpIndex===5,'explicit_local_wins_preserves_position_and_saves_before_ready',rebased);
  const protectedRaw=await page.evaluate(key=>localStorage.getItem(key),key);
  await page.goto(base+'/xizong/circulation/b02/?checkpoint-durable-restore=stale-request',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='unavailable');
  const denied=await page.evaluate(key=>({raw:localStorage.getItem(key),readyPosition:window.__readyPosition??null,status:document.documentElement.dataset.checkpointDurableRestore}),key);
  check(denied.readyPosition===null && denied.raw===protectedRaw && denied.status==='error','stale_recovery_request_rejects_before_any_consumer_write',denied.status);
  check(report.errors.length===0,'all_recovery_cases_have_no_uncaught_browser_errors',report.errors);
  report.ok=true;
} catch(error){report.error=error.stack;throw error;}
finally {
  try{await browser?.close();}catch{}
  await stop(chromeProcess); await stop(server);
  report.serverLog=serverLog;report.chromeLog=chromeLog;
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
  fs.rmSync(temp,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  console.log(JSON.stringify({ok:report.ok||false,checks:report.checks.length,out}));
}
