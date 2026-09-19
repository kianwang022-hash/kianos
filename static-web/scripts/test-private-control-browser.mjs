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
      subjects:{
        xizong:null,
        english:{target_minutes:30,role:'稳推进',note:'自动下发。',session_ref:sessionId},
        politics:null
      },
      next_subject:'english',
      attention:null
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
    KIANOS_CONTROL_SOURCE_FILE:commandFile,
    KIANOS_CONTROL_DIR:controlDir,
    KIANOS_ENGLISH_GENERATED_DIR:generatedDir,
    KIANOS_EXTERNAL_READING_SOURCE_ROOT:sourceRoot,
    KIANOS_EXTERNAL_READING_DIR:externalPrivate
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

let browser;
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const serverControl=await controlReady();
  assert.equal(serverControl.command.command_id,command.command_id);
  const context=await browser.newContext({viewport:{width:1512,height:982},locale:'zh-CN',timezoneId:'Asia/Shanghai'});
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
  assert.equal(state.session?.session_id,sessionId);
  assert.equal(state.receipt?.status,'APPLIED');
  assert.equal(state.receipt?.command_id,command.command_id);

  const receiptResponse=await fetch(base+'/__kianos-private/control/current',{cache:'no-store'});
  const receiptData=await receiptResponse.json();
  assert.equal(receiptData.receipt?.status,'APPLIED');
  assert.equal(receiptData.receipt?.command_id,command.command_id);

  await page.locator('[data-exam-next]').click();
  await page.waitForURL(url=>url.pathname==='/external-reading/'&&url.searchParams.get('id')===drill.object_id);
  assert.equal((await page.locator('[data-external-kind]').textContent())?.trim(),'CHAT · SYNTHETIC');

  console.log('PASS private Chat command -> local relay -> browser control -> Total Home -> exact English Workspace');
  await context.close();
}finally{
  try{await browser?.close();}catch{}
  try{
    if(process.platform==='win32')server.kill();
    else process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  fs.rmSync(temp,{recursive:true,force:true});
}
