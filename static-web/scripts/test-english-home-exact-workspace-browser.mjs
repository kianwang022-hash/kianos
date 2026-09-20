import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {
  ENGLISH_GENERATED_DRILL_SCHEMA,
  writeEnglishGeneratedDrill
} from './privateEnglishGeneratedDrillStore.mjs';
import {ENGLISH_SESSION_KEY, ENGLISH_SESSION_SCHEMA} from '../src/lib/englishSessionControl.mjs';
import {EXAM_CHAT_PLAN_KEY, EXAM_CHAT_PLAN_SCHEMA} from '../src/lib/examChatPlan.mjs';
import {EXAM_PROFILE_KEY, emptyExamProfile} from '../src/lib/examOrchestrator.mjs';

const shanghaiDay=()=>{
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:'Asia/Shanghai',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).formatToParts(new Date());
  const map=Object.fromEntries(parts.filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};
const DAY=shanghaiDay();
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'english-home-integration-'));
const generatedDir=path.join(temp,'generated');
const sourceRoot=path.join(temp,'missing-source');
const externalPrivate=path.join(temp,'external-private');
const drill={
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:`external-chat-${DAY}-home-001`,
  study_day:DAY,
  generated_at:DAY+'T02:00:00+08:00',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'reading_transfer',note:'Home exact-workspace integration proof.'},
  passage:{title:'Home integration drill',paragraphs:['A limited claim should remain limited even when its wording sounds broad.']},
  questions:[{
    question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',
    prompt:'Which statement preserves the limitation?',
    options:{A:'Every case is proven.',B:'Only the supported cases are claimed.'},
    answer:'B'
  }]
};
const written=writeEnglishGeneratedDrill(drill,{privateDir:generatedDir});
const contentHash=written.drill.content_hash;
const sessionId='english-home-session-1';
const englishSession={
  schema:ENGLISH_SESSION_SCHEMA,
  session_id:sessionId,
  study_day:DAY,
  generated_at:DAY+'T02:05:00+08:00',
  current_step:0,
  steps:[{
    step_id:'generated-reading',
    task:'external_reading',
    object_id:drill.object_id,
    source_hash:contentHash,
    label:'Reading transfer drill',
    note:'Chat selected this exact task.',
    params:{}
  }],
  return_policy:{on_finish:'english_home'}
};
const profile={...emptyExamProfile(),capacityByDay:{[DAY]:480},defaultDailyMinutes:480};
const plan=(sessionRef)=>({
  schema:EXAM_CHAT_PLAN_SCHEMA,
  study_day:DAY,
  generated_at:DAY+'T02:06:00+08:00',
  subjects:{
    xizong:null,
    english:{target_minutes:60,role:'稳推进',note:'做这一组 Reading。',session_ref:sessionRef},
    politics:null
  },
  next_subject:'english',
  attention:null
});

const PORT=4472;
const BASE='http://127.0.0.1:'+PORT;
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),
  env:{
    ...process.env,
    KIANOS_ENGLISH_GENERATED_DIR:generatedDir,
    KIANOS_EXTERNAL_READING_SOURCE_ROOT:sourceRoot,
    KIANOS_EXTERNAL_READING_DIR:externalPrivate
  },
  stdio:['ignore','pipe','pipe'],
  detached:process.platform!=='win32'
});
let serverLog='';
server.stdout?.on('data',c=>serverLog+=String(c));
server.stderr?.on('data',c=>serverLog+=String(c));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitReady(){
  for(let i=0;i<120;i++){
    try{if((await fetch(BASE)).ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('HOME_INTEGRATION_SERVER_NOT_READY:'+serverLog.slice(-1600));
}

let browser;
try{
  await waitReady();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:982},locale:'zh-CN',timezoneId:'Asia/Shanghai'});
  const page=await context.newPage();
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.evaluate(({profile,englishSession,plan,keys})=>{
    localStorage.setItem(keys.profile,JSON.stringify(profile));
    localStorage.setItem(keys.english,JSON.stringify(englishSession));
    localStorage.setItem(keys.plan,JSON.stringify(plan));
  },{
    profile,englishSession,plan:plan(sessionId),
    keys:{profile:EXAM_PROFILE_KEY,english:ENGLISH_SESSION_KEY,plan:EXAM_CHAT_PLAN_KEY}
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();

  const expected='/external-reading/?id='+encodeURIComponent(drill.object_id);
  await page.waitForFunction((expected)=>{
    const link=document.querySelector('[data-exam-next]');
    return link?.getAttribute('href')===expected;
  },expected,{timeout:5000});

  const next=page.locator('[data-exam-next]');
  assert.equal(await next.getAttribute('href'),expected);
  assert.match((await next.textContent())||'',/英语 · Reading transfer drill/);
  assert.equal(await page.locator('[data-english-resume-link]').getAttribute('data-session-ref'),sessionId);
  assert.equal(await page.locator('[data-english-resume-link]').getAttribute('href'),expected);

  // Now force a global/session mismatch. The old English exact task must not remain global Next.
  await page.evaluate(({key,value})=>{
    localStorage.setItem(key,JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('storage',{key}));
  },{key:EXAM_CHAT_PLAN_KEY,value:plan('english-different-session')});

  await page.waitForFunction(()=>{
    const link=document.querySelector('[data-exam-next]');
    return link?.getAttribute('aria-disabled')==='true' && !link?.hasAttribute('href');
  },null,{timeout:5000});
  assert.equal(await next.getAttribute('href'),null);
  assert.equal(await next.getAttribute('aria-disabled'),'true');
  assert.match((await next.textContent())||'',/等待今日安排/);

  console.log(JSON.stringify({
    status:'PASS',
    exact_session_to_workspace:'PASS',
    generated_external_workspace:expected,
    mismatched_session_fail_closed:'PASS'
  },null,2));

  await context.close();
}finally{
  try{await browser?.close();}catch{}
  try{
    if(process.platform==='win32')server.kill();
    else process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  fs.rmSync(temp,{recursive:true,force:true});
}
