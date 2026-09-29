import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {
  ENGLISH_GENERATED_DRILL_SCHEMA,
  validateEnglishGeneratedDrill
} from './privateEnglishGeneratedDrillStore.mjs';
import { publishPrivateControlCommand } from './privateControlStore.mjs';
import { buildExamChatPlanBasis } from '../src/lib/examChatPlan.mjs';

class MemoryStorage{
  constructor(){this.map=new Map();}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(String(key),String(value));}
  removeItem(key){this.map.delete(String(key));}
}

const day='2026-09-20';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-control-browser-'));
const controlDir=path.join(temp,'control');
const generatedDir=path.join(temp,'generated');
const commandFile=path.join(temp,'current.json');
const sourceRoot=path.join(temp,'missing-external');
const externalPrivate=path.join(temp,'external-private');

const drill=validateEnglishGeneratedDrill({
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:'external-chat-2026-09-20-relay-browser-001',
  study_day:day,
  generated_at:'2026-09-20T00:10:00+08:00',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'reading_transfer',note:'Private relay browser proof.'},
  passage:{title:'Private relay drill',paragraphs:['Some findings support a limited conclusion, not a universal one.']},
  questions:[{
    question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',
    prompt:'Which claim is supported?',
    options:{A:'The conclusion is universal.',B:'The conclusion is limited.'},
    answer:'B'
  }]
});
const sessionId='english-relay-browser-session-1';
const command={
  schema:'kianos.control-command.v1',
  command_id:'control-20260920-browser-001',
  study_day:day,
  generated_at:'2026-09-20T00:12:00+08:00',
  expires_at:'2026-09-21T00:00:00+08:00',
  operations:[
    {kind:'english.generated_drill',payload:drill},
    {kind:'english.session',payload:{
      schema:'kianos.english.session-instruction.v1',
      session_id:sessionId,
      study_day:day,
      generated_at:'2026-09-20T00:11:00+08:00',
      current_step:0,
      steps:[{
        step_id:'reading',
        task:'external_reading',
        object_id:drill.object_id,
        source_hash:drill.content_hash,
        label:'Private relay Reading',
        note:'No JSON shuttle.'
      }],
      return_policy:{on_finish:'english_home'}
    }},
    {kind:'exam.chat_plan',payload:{
      schema:'kianos.exam.chat-plan.v1',
      study_day:day,
      generated_at:'2026-09-20T00:12:00+08:00',
      learner_evidence_basis:buildExamChatPlanBasis(new MemoryStorage(),day),
      subjects:{
        xizong:null,
        english:{target_minutes:30,role:'稳推进',note:'自动下发。',session_ref:sessionId},
        politics:null
      },
      next_subject:'english',
      attention:null,
      presentation:{
        today_tasks:[],
        week_reference:[],
        schedule_blocks:[],
        nutrition:{
          owner_ref:'personal/health/personal-day/NUTRITION.md',
          target_label:'今日营养安排',
          active_meal_id:'relay-lunch',
          foods:[{
            id:'relay-salmon',
            label:'三文鱼',
            unit:'g',
            recommended_amount:200,
            nutrition:{basis:'PER_100G',kcal:208,protein_g:20,carb_g:0,fat_g:13}
          }],
          meals:[{id:'relay-lunch',label:'三文鱼午餐',items:[{food_id:'relay-salmon',amount:200}]}],
          topup_pool:[],
          quick_add:[{food_id:'relay-salmon',amount:200}]
        },
        training:{
          owner_ref:'personal/health/personal-day/TRAINING.md',
          session_id:'relay-training',
          title:'今日训练',
          duration_label:'约 25 分钟',
          exercises:[{
            id:'relay-squat',
            label:'Smith squat',
            prescription:'2 × 6–8',
            load_value:70,
            load_unit:'kg',
            reps_value:8,
            reps_unit:'reps',
            rpe:6
          }]
        }
      }
    }}
  ]
};
fs.writeFileSync(commandFile,JSON.stringify(command,null,2));
const port=4481;
const base='http://127.0.0.1:'+port;
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port)],{
  cwd:process.cwd(),
  env:{
    ...process.env,
    KIANOS_PACKET_RELAY_ENABLED:'0',
    KIANOS_CONTROL_SOURCE_FILE:commandFile,
    KIANOS_CONTROL_DIR:controlDir,
    KIANOS_ENGLISH_GENERATED_DIR:generatedDir,
    KIANOS_EXTERNAL_READING_SOURCE_ROOT:sourceRoot,
    KIANOS_EXTERNAL_READING_DIR:externalPrivate,
    KIANOS_PRIVATE_DIR:path.join(temp,'learner-state')
  },
  stdio:['ignore','pipe','pipe'],
  detached:process.platform!=='win32'
});
let log='';
server.stdout?.on('data',c=>log+=String(c));
server.stderr?.on('data',c=>log+=String(c));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
  for(let i=0;i<120;i++){
    try{if((await fetch(base)).ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('CONTROL_BROWSER_SERVER_NOT_READY:'+log.slice(-1600));
}

async function controlReady(){
  let last=null;
  for(let i=0;i<40;i++){
    try{
      const response=await fetch(base+'/__kianos-private/control/current?t='+Date.now(),{cache:'no-store'});
      last={status:response.status,body:await response.json().catch(()=>null)};
      if(response.ok&&last.body?.command?.command_id===command.command_id)return last.body;
    }catch(error){last={error:String(error)};}
    await sleep(125);
  }
  throw new Error('CONTROL_BROWSER_LOCAL_INBOX_NOT_READY:'+JSON.stringify(last)+':'+log.slice(-1600));
}

let browser,focusProcess;
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const serverControl=await controlReady();
  assert.equal(serverControl.command.command_id,command.command_id);
  const context=await browser.newContext({viewport:{width:1512,height:982},locale:'zh-CN',timezoneId:'Asia/Shanghai'});
  await context.addInitScript(({offset})=>{
    const NativeDate=Date;
    class FixtureDate extends NativeDate{
      constructor(...args){super(...(args.length?args:[NativeDate.now()+offset]));}
      static now(){return NativeDate.now()+offset;}
    }
    window.Date=FixtureDate;
  },{offset:Date.parse('2026-09-20T03:00:00+08:00')-Date.now()});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();

  const expected='/external-reading/?id='+encodeURIComponent(drill.object_id);

  // First prove that the browser actually consumed and applied the local command.
  await page.waitForFunction(({commandId,sessionId})=>{
    try{
      const receipt=JSON.parse(localStorage.getItem('kianos-control-receipt-v1')||'null');
      const session=JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')||'null');
      const plan=JSON.parse(localStorage.getItem('kianos-exam-chat-plan-v1')||'null');
      if(receipt?.status==='REJECTED'||receipt?.status==='ERROR')return true;
      return receipt?.command_id===commandId
        && receipt?.status==='APPLIED'
        && session?.session_id===sessionId
        && plan?.subjects?.english?.session_ref===sessionId;
    }catch{return false;}
  },{commandId:command.command_id,sessionId},{timeout:10000});

  const appliedState=await page.evaluate(()=>({
    receipt:JSON.parse(localStorage.getItem('kianos-control-receipt-v1')||'null'),
    session:JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')||'null'),
    plan:JSON.parse(localStorage.getItem('kianos-exam-chat-plan-v1')||'null')
  }));
  if(appliedState.receipt?.status!=='APPLIED'){
    const serverNow=await (await fetch(base+'/__kianos-private/control/current?t='+Date.now(),{cache:'no-store'})).json();
    throw new Error('CONTROL_BROWSER_APPLY_FAILED:'+JSON.stringify({
      appliedState,serverNow,pageErrors,serverLog:log.slice(-2200)
    }));
  }

  // Prove the runtime catalog itself contains the generated object before
  // asking the Resume surface to project it.
  const externalCatalog=await (await fetch(base+'/__kianos-private/external-reading/catalog?t='+Date.now(),{cache:'no-store'})).json();
  const catalogRow=(externalCatalog.collections||[])
    .flatMap(group=>group.passages||[])
    .find(row=>row.object_id===drill.object_id);
  assert(catalogRow,'generated object must exist in the live External catalog');
  assert.equal(catalogRow.content_hash,drill.content_hash);
  const passageResponse=await fetch(base+'/__kianos-private/external-reading/passage?id='+encodeURIComponent(drill.object_id),{cache:'no-store'});
  const passageData=await passageResponse.json();
  assert.equal(passageResponse.status,200,'generated passage endpoint must remain readable after control apply');
  assert.equal(passageData.passage?.object_id,drill.object_id);
  assert.equal(passageData.passage?.question_origin,'CHAT_GENERATED');
  assert.equal(passageData.passage?.drill_origin,'CHAT_GENERATED_SYNTHETIC');

  // Then prove the subject Resume projected the same session.
  try{
    await page.waitForFunction(({sessionId,expected})=>{
      const link=document.querySelector('[data-english-resume-link]');
      return link?.getAttribute('data-session-ref')===sessionId
        && link?.getAttribute('href')===expected;
    },{sessionId,expected},{timeout:10000});
  }catch(error){
    const resumeDebug=await page.evaluate(()=>({
      count:document.querySelectorAll('[data-english-resume-surface]').length,
      hidden:document.querySelector('[data-english-resume]')?.hidden ?? null,
      href:document.querySelector('[data-english-resume-link]')?.getAttribute('href') ?? null,
      sessionRef:document.querySelector('[data-english-resume-link]')?.getAttribute('data-session-ref') ?? null,
      title:document.querySelector('[data-english-resume-title]')?.textContent ?? null,
      session:JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')||'null')
    }));
    throw new Error('CONTROL_ENGLISH_RESUME_NOT_PROJECTED:'+JSON.stringify({
      resumeDebug,
      catalogRow,
      pageErrors,
      serverLog:log.slice(-2200)
    }),{cause:error});
  }

  // Finally prove Total Home accepted that exact subject projection.
  await page.waitForFunction(expected=>{
    const link=document.querySelector('[data-exam-next]');
    return link?.getAttribute('href')===expected;
  },expected,{timeout:10000});

  assert.deepEqual(pageErrors,[],'control loop must not create page errors');
  assert.equal(await page.locator('[data-exam-next]').getAttribute('href'),expected);
  assert.match((await page.locator('[data-exam-next]').textContent())||'',/英语 · Private relay Reading/);

  const state=await page.evaluate(()=>({
    plan:JSON.parse(localStorage.getItem('kianos-exam-chat-plan-v1')||'null'),
    session:JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')||'null'),
    receipt:JSON.parse(localStorage.getItem('kianos-control-receipt-v1')||'null')
  }));
  assert.equal(state.plan?.subjects?.english?.session_ref,sessionId);
  assert.equal(state.plan?.presentation?.nutrition?.meals?.[0]?.items?.[0]?.amount,200);
  assert.equal(state.plan?.presentation?.training?.exercises?.[0]?.label,'Smith squat');
  assert.equal(state.session?.session_id,sessionId);
  assert.equal(state.receipt?.status,'APPLIED');
  assert.equal(state.receipt?.command_id,command.command_id);

  const receiptResponse=await fetch(base+'/__kianos-private/control/current',{cache:'no-store'});
  const receiptData=await receiptResponse.json();
  assert.equal(receiptData.receipt?.status,'APPLIED');
  assert.equal(receiptData.receipt?.command_id,command.command_id);

  await page.locator('[data-exam-next]').click();
  await page.waitForURL(url=>url.pathname==='/external-reading/'&&url.searchParams.get('id')===drill.object_id);
  await page.waitForFunction(() => document.querySelector('[data-external-kind]')?.textContent?.trim() === 'CHAT · SYNTHETIC', null, { timeout: 10000 });
  assert.equal((await page.locator('[data-external-kind]').textContent())?.trim(),'CHAT · SYNTHETIC');

  const nativeReady=async page=>{
    await page.bringToFront();
    try{await page.waitForFunction(()=>window.KianOSStudyTimer && document.documentElement.dataset.learnerWriter==='active');}
    catch(e){throw new Error('NATIVE_BOOT:'+JSON.stringify(await page.evaluate(()=>({url:location.href,focus:document.hasFocus(),dataset:{...document.documentElement.dataset},keys:Object.keys(localStorage),text:document.body.innerText.slice(0,2200)})))+'\n'+log.slice(-1500),{cause:e});}
  };
  const saveCheckpoint=page=>page.evaluate(async()=>{
    const m=await import('/src/lib/privateCheckpointRuntime.mjs');
    // The native change event may already have an autosave in flight. Reconcile
    // its completion rather than treating safe CAS rejection as product failure.
    for(let i=0;i<3;i++){
      try {
        const r=await m.saveSharedControlToPrivate(localStorage);
        if(r.status!=='saved')throw new Error('CONTROL_RECOVERY_CHECKPOINT:'+JSON.stringify(r));
        return;
      } catch(e) {
        if(!/PRIVATE_CHECKPOINT_(STALE_WRITE|CONFLICT)/.test(e.message)||i===2)throw e;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
    }
  });
  const learnerRecords=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage)
    .filter(k=>/attempt|material-exposure/.test(k)).map(k=>[k,localStorage.getItem(k)])));
  await nativeReady(page);
  const protectedRecords=await learnerRecords(page);
  assert.ok(Object.keys(protectedRecords).length,'native task creates attributable exposure/attempt state');
  await page.goto(base+'/english/',{waitUntil:'domcontentloaded'});await nativeReady(page);
  // The learner visit legitimately stales the earlier cross-subject plan basis.
  // Test cancellation against an admitted session-only command, as used by the
  // ordinary English producer, instead of demanding that stale plans reapply.
  const sessionOnly={...command,command_id:command.command_id+'-session-only',
    generated_at:'2026-09-20T02:59:00+08:00',operations:command.operations.filter(op=>op.kind==='english.session')};
  fs.writeFileSync(commandFile,JSON.stringify(sessionOnly));
  publishPrivateControlCommand(sessionOnly,{privateDir:controlDir,generatedDir});
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('kianos-control-receipt-v1')||'null')?.command_id===id,sessionOnly.command_id);
  await page.locator('[data-english-session-control] > summary').click();
  await page.locator('[data-english-clear-session]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kianos-english-session-instruction-v1')||'null')?.cleared_at);
  await saveCheckpoint(page);
  // Lose only the isolated server receipt. The unchanged command remains in
  // the native inbox, forcing an actual browser poll/retry after explicit clear.
  fs.rmSync(path.join(controlDir,'receipt.json'),{force:true});
  let retried=false;
  for(let i=0;i<60;i++){
    await sleep(100);
    try{const r=JSON.parse(fs.readFileSync(path.join(controlDir,'receipt.json'),'utf8'));if(r.command_id===sessionOnly.command_id&&r.status==='APPLIED'){retried=true;break;}}catch{}
  }
  assert.ok(retried,'native runtime must acknowledge the lost receipt after clear: '+JSON.stringify(await (await fetch(base+'/__kianos-private/control/current')).json()));
  assert.equal(await page.evaluate(async()=>{
    const m=await import('/src/lib/englishSessionControl.mjs');return m.readEnglishSessionInstruction(localStorage,'2026-09-20').status;
  }),'cleared');
  assert.equal(await page.locator('[data-english-resume]').isVisible(),false,'cleared command must not return as Resume');
  assert.deepEqual(await learnerRecords(page),protectedRecords,'clear/retry preserves actual attempt and exposure');
  await saveCheckpoint(page);await context.close();

  // Use an isolated real Chrome default context for focus ownership. Normal
  // Playwright contexts force focus emulation true on every tab, which cannot
  // demonstrate native foreground/background Web Lock handoff.
  await browser.close();
  const focusProfile=path.join(temp,'focus-profile');
  const chrome=process.env.KIANOS_TEST_CHROME || chromium.executablePath();
  focusProcess=spawn(chrome,[...(process.env.KIANOS_TEST_HEADED==='1'?[]:['--headless=new']),'--remote-debugging-port=0','--user-data-dir='+focusProfile,
    '--no-first-run','--no-default-browser-check','--disable-background-networking',
    '--disable-sync','--disable-extensions','--enable-automation','about:blank'],
    {stdio:'ignore',detached:process.platform!=='win32'});
  let focusPort=null;
  for(let i=0;i<100;i++){
    try{focusPort=Number(fs.readFileSync(path.join(focusProfile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(focusPort)break;}catch{}
    await sleep(100);
  }
  assert.ok(focusPort,'isolated native-focus browser starts');
  browser=await chromium.connectOverCDP('http://127.0.0.1:'+focusPort,{noDefaults:true});
  const recovered=browser.contexts()[0];
  await recovered.addInitScript(({offset})=>{
    const NativeDate=Date;
    class FixtureDate extends NativeDate{constructor(...a){super(...(a.length?a:[NativeDate.now()+offset]));}static now(){return NativeDate.now()+offset;}}
    window.Date=FixtureDate;
  },{offset:Date.parse('2026-09-20T03:05:00+08:00')-Date.now()});
  const restored=await recovered.newPage();await restored.goto(base+'/english/',{waitUntil:'domcontentloaded'});await nativeReady(restored);
  assert.equal(await restored.evaluate(async()=>{const m=await import('/src/lib/englishSessionControl.mjs');return m.readEnglishSessionInstruction(localStorage,'2026-09-20').status;}),'cleared');
  assert.deepEqual(await learnerRecords(restored),protectedRecords);
  // Handoff the real Web Lock. The retired tab may not write back old state.
  const newer=await recovered.newPage();await newer.goto(base+'/english/',{waitUntil:'domcontentloaded'});await newer.bringToFront();
  await sleep(1000);
  console.log('MULTIPAGE_FOCUS_WITNESS',JSON.stringify(await Promise.all([restored,newer].map(p=>p.evaluate(async()=>({focused:document.hasFocus(),visibility:document.visibilityState,writer:document.documentElement.dataset.learnerWriter,locks:await navigator.locks.query()}))))));
  await nativeReady(newer);
  await restored.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='retired');
  const refusal=await restored.evaluate(()=>{try{localStorage.setItem('kianos-english-session-instruction-v1','{}');return null;}catch(e){return e.message;}});
  assert.match(refusal,/KIANOS_LEARNER_WRITER_RELOAD_REQUIRED/);
  await restored.bringToFront();await nativeReady(restored);
  assert.equal(await restored.evaluate(async()=>{const m=await import('/src/lib/englishSessionControl.mjs');return m.readEnglishSessionInstruction(localStorage,'2026-09-20').status;}),'cleared');
  assert.deepEqual(await learnerRecords(restored),protectedRecords);
  await saveCheckpoint(restored);
  console.log('PASS native browser: delivery -> exact task -> clear -> lost receipt retry -> checkpoint -> fresh storage -> Web Lock handoff -> old-tab rejection; raw attempt/exposure preserved');
}finally{
  try{await browser?.close();}catch{}
  const stopOwned=async child=>{
    if(!child || child.exitCode!=null)return;
    const exited=new Promise(resolve=>child.once('exit',resolve));
    try{if(process.platform==='win32')child.kill('SIGTERM');else process.kill(-child.pid,'SIGTERM');}catch{}
    await Promise.race([exited,sleep(4000)]);
    if(child.exitCode==null){try{if(process.platform==='win32')child.kill('SIGKILL');else process.kill(-child.pid,'SIGKILL');}catch{}await Promise.race([exited,sleep(1000)]);}
  };
  await stopOwned(focusProcess);
  await stopOwned(server);
  fs.rmSync(temp,{recursive:true,force:true,maxRetries:4,retryDelay:100});
}
