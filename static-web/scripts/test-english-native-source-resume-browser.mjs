import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {englishSessionCatalog} from '../src/lib/englishSessionCatalog.mjs';
import {listWritingSyntheticTasks} from '../src/lib/englishWritingSynthetic.mjs';

// Real native components and browser modules, disposable storage, synthetic material.
const task = listWritingSyntheticTasks()[0];
const catalog = englishSessionCatalog();
const meta = catalog.find(row => row.task === 'writing' && row.object_id === task.id);
assert.ok(meta && task.sourceKind === 'synthetic');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'english-native-resume-'));
const port = Number(process.env.KIANOS_NATIVE_TEST_PORT || 4477);
const base = 'http://127.0.0.1:' + port;
const output = path.resolve(process.env.KIANOS_NATIVE_TEST_OUTPUT || 'output/playwright/english-native');
fs.mkdirSync(output, {recursive:true});
const env = {
  ...process.env,
  KIANOS_PRIVATE_DIR:path.join(temp,'private'),
  KIANOS_CONTROL_DIR:path.join(temp,'control'),
  KIANOS_EXTERNAL_READING_DIR:path.join(temp,'external'),
  KIANOS_EXTERNAL_READING_SOURCE_ROOT:path.join(temp,'missing-sources'),
  KIANOS_ENGLISH_GENERATED_DIR:path.join(temp,'generated'),
  KIANOS_PACKET_REPO_DIR:path.join(temp,'packet-repo'),
  KIANOS_CONTROL_REPO_DIR:path.join(temp,'control-repo'),
  KIANOS_PACKET_RELAY_ENABLED:'0',
  KIANOS_CONTROL_ENABLED:'0'
};
const server = spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port)],{env,stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
let serverLog='', browser, context, activePage, completed=false;
const errors=[];
server.stdout.on('data',chunk => {serverLog += chunk;});
server.stderr.on('data',chunk => {serverLog += chunk;});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  let ready=false;
  for(let i=0;i<120;i++){
    if(server.exitCode!==null)throw new Error('NATIVE_TEST_SERVER_EXITED:'+serverLog);
    try {if((await fetch(base+'/english/')).ok){ready=true;break;}} catch {}
    await pause(250);
  }
  assert.ok(ready,'native dev server failed: '+serverLog);
  browser=await chromium.launch({headless:true,...(process.env.KIANOS_BROWSER_CHANNEL?{channel:process.env.KIANOS_BROWSER_CHANNEL}:{})});
  context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=activePage=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>errors.push(String(error.message)));
  await page.goto(base+'/english/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(document.querySelector('[data-english-session-status]')?.textContent));
  await page.evaluate(meta=>{
    const now=Date.now();
    localStorage.setItem('kianos-english-session-instruction-v1',JSON.stringify({
      schema:'kianos.english.session-instruction.v1',session_id:'synthetic-native-resume',study_day:new Date(now).toLocaleDateString('en-CA'),generated_at:new Date(now).toISOString(),current_step:0,
      steps:[{step_id:'writing',...meta,label:'Synthetic native Writing proof'}]
    }));
    window.dispatchEvent(new Event('focus'));
  },meta);
  const resume=page.locator('[data-english-resume-link]');
  await resume.waitFor({state:'visible'});
  assert.equal(await resume.getAttribute('href'),'/writing/'+encodeURIComponent(task.id)+'/');
  await resume.click();
  await page.locator('[data-writing-runtime][data-english-initialized="true"]').waitFor({state:'visible'});
  await page.locator('[data-essay-draft]').fill('This is a synthetic engineering draft. It is not learner evidence.');
  const key='kianos-writing-runtime-v1:'+task.id;
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)||'null')?.draftEssay?.includes('synthetic engineering'),key);
  const currentRaw=await page.evaluate(key=>localStorage.getItem(key),key);
  assert.equal(JSON.parse(currentRaw).binding.source_hash,meta.source_hash);
  // Simulate a prior synthetic revision; keep the current production catalog and
  // native page untouched so the click must actually enter the verified version.
  const raw=await page.evaluate(({key,currentRaw})=>{
    const prior=JSON.parse(currentRaw);prior.binding.source_hash='synthetic-old:'+prior.binding.source_hash;
    const session=JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1'));
    session.steps[0].source_hash=prior.binding.source_hash;
    localStorage.setItem('kianos-english-session-instruction-v1',JSON.stringify(session));
    localStorage.setItem(key,JSON.stringify(prior));
    return localStorage.getItem(key);
  },{key,currentRaw});
  await page.goto(base+'/english/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-source-continuation="available"]').waitFor({state:'visible'});
  assert.equal(await page.evaluate(id=>JSON.parse(document.querySelector('[data-english-resume-catalog]')?.textContent||'[]').find(row=>row.object_id===id)?.source_hash,task.id),meta.source_hash);
  assert.match(await page.locator('[data-english-resume-meta]').innerText(),/保留旧作答/);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),raw);
  await page.screenshot({path:path.join(output,'source-stale-preserves-draft.png'),fullPage:false});
  await page.locator('[data-source-continuation="available"]').click();
  await page.locator('[data-writing-runtime][data-english-initialized="true"]').waitFor({state:'visible'});
  assert.equal(new URL(page.url()).pathname,'/writing/'+encodeURIComponent(task.id)+'/');
  assert.equal(await page.locator('[data-essay-draft]').inputValue(),'');
  await page.locator('[data-essay-draft]').fill('This is a new synthetic draft on the verified current source.');
  await page.waitForFunction(({key,hash})=>JSON.parse(localStorage.getItem(key)||'null')?.binding?.source_hash===hash,{key,hash:meta.source_hash});
  const fresh=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.notEqual(fresh.binding.attempt_id,JSON.parse(raw).binding.attempt_id);
  assert.notEqual(fresh.binding.prior_exposure,'unseen');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')).steps[0].source_hash),meta.source_hash);
  await page.screenshot({path:path.join(output,'source-new-version-native-workspace.png'),fullPage:false});
  const recovery=await page.evaluate(async ({key,raw})=>{
    const native=await import('/src/lib/englishLearnerEvidence.mjs');
    const value=JSON.parse(raw),archiveKey='kianos-english-attempt-archive-v1:'+value.binding.attempt_id;
    // Retire only this disposable fresh test record before checking that an old
    // checkpoint cannot revive the archived old source.
    localStorage.removeItem(key);
    native.restoreEnglishCheckpoint(localStorage,{schema:'kianos.english.private-payload.v1',entries:{[key]:raw}},{keepLocal:true});
    const retiredNotResurrected=localStorage.getItem(key)===null;
    const archivedRaw=localStorage.getItem(archiveKey);
    const fork=structuredClone(value);fork.draftEssay='unique local fork';fork.binding.revision=Math.max(0,fork.binding.revision-1);
    const forkRaw=JSON.stringify(fork);localStorage.setItem(key,forkRaw);
    native.restoreEnglishCheckpoint(localStorage,{schema:'kianos.english.private-payload.v1',entries:{[archiveKey]:archivedRaw}},{keepLocal:true});
    return {retiredNotResurrected,archivePreserved:archivedRaw===raw,divergentDraftPreserved:localStorage.getItem(key)===forkRaw};
  },{key,raw});
  assert.deepEqual(recovery,{retiredNotResurrected:true,archivePreserved:true,divergentDraftPreserved:true});
  assert.deepEqual(errors,[]);
  const report={status:'PASS',scope:'Astro dev native English Resume -> synthetic Writing -> old Source prompt -> one-click verified current native workspace; real browser storage + native archive/restore imports',checks:{existing_resume_opens_native_workspace:true,synthetic_draft_saved:true,source_update_prompt_visible:true,one_click_opens_verified_current_source:true,new_attempt_identity:true,no_invented_unseen:true,old_output_preserved:true,...recovery},real_learner_data_used:false,protected_exam_consumption:false,new_source_continuation_ui_tested:true};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  completed=true;
  console.log(JSON.stringify(report,null,2));
} catch(error) {
  const diagnostic={error:String(error),pageErrors:errors,serverLog:serverLog.slice(-5000)};
  if(activePage)diagnostic.browser=await activePage.evaluate(()=>({url:location.href,storage:Object.fromEntries(Object.keys(localStorage).map(key=>[key,localStorage.getItem(key)])),writing:document.querySelector('[data-writing-runtime]')?.dataset,notice:document.querySelector('[data-english-recovery-error]')?.textContent})).catch(()=>null);
  fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify(diagnostic,null,2));
  throw error;
} finally {
  await context?.close().catch(()=>{});await browser?.close().catch(()=>{});
  if(completed&&process.env.KIANOS_NATIVE_KEEP_SERVER==='1'){
    fs.writeFileSync(path.join(output,'server.json'),JSON.stringify({pid:server.pid,port,base,temp,privateDir:env.KIANOS_PRIVATE_DIR,controlDir:env.KIANOS_CONTROL_DIR,generatedDir:env.KIANOS_ENGLISH_GENERATED_DIR},null,2));
    server.stdout.destroy();server.stderr.destroy();server.unref();
  }else{
    try {if(process.platform==='win32')server.kill();else process.kill(-server.pid,'SIGTERM');} catch {}
    await Promise.race([new Promise(resolve=>server.once('exit',resolve)),pause(1500)]);
    fs.rmSync(temp,{recursive:true,force:true});
  }
}
