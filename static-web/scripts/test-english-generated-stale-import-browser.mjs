import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {ENGLISH_GENERATED_DRILL_SCHEMA,writeEnglishGeneratedDrill} from './privateEnglishGeneratedDrillStore.mjs';

const DAY='2026-09-20';
const OLD='2026-09-19';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'english-stale-import-'));
const generatedDir=path.join(temp,'generated');
const sourceRoot=path.join(temp,'missing-source');
const externalPrivate=path.join(temp,'external-private');

const stale={
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:'external-chat-2026-09-19-stale-001',
  study_day:OLD,
  generated_at:'2026-09-19T02:00:00+08:00',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'stale_guard',note:'Must not enter next-day Session.'},
  passage:{title:'Stale drill',paragraphs:['Yesterday only.']},
  questions:[{
    question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',
    prompt:'Pick B.',options:{A:'A',B:'B'},answer:'B'
  }]
};
const written=writeEnglishGeneratedDrill(stale,{privateDir:generatedDir});

const PORT=4474;
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
let log='';
server.stdout?.on('data',c=>log+=String(c));
server.stderr?.on('data',c=>log+=String(c));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function ready(){
  for(let i=0;i<120;i++){
    try{if((await fetch(BASE+'/english/')).ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('STALE_IMPORT_SERVER_NOT_READY:'+log.slice(-1500));
}

let browser;
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({timezoneId:'Asia/Shanghai',locale:'zh-CN'});
  const page=await context.newPage();
  await page.goto(BASE+'/english/',{waitUntil:'domcontentloaded'});

  const instruction={
    schema:'kianos.english.session-instruction.v1',
    session_id:'stale-generated-import',
    study_day:DAY,
    generated_at:'2026-09-20T02:30:00+08:00',
    current_step:0,
    steps:[{
      step_id:'old',
      task:'external_reading',
      object_id:stale.object_id,
      source_hash:written.drill.content_hash,
      label:'Yesterday drill'
    }],
    return_policy:{on_finish:'english_home'}
  };

  const control=page.locator('[data-english-session-control]');
  await control.locator('summary').click();
  await page.locator('[data-english-toggle-import]').click();
  await page.locator('[data-english-session-input]').fill(JSON.stringify(instruction));
  await page.locator('[data-english-apply-session]').click();

  const status=page.locator('[data-english-session-status]');
  await page.waitForFunction(() =>
    document.querySelector('[data-english-session-status]')?.textContent?.includes('OBJECT_STALE_DAY'),
    null,
    { timeout: 5000 }
  );
  assert.match((await status.textContent())||'',/OBJECT_STALE_DAY/);
  const stored=await page.evaluate(()=>localStorage.getItem('kianos-english-session-instruction-v1'));
  assert.equal(stored,null,'stale generated drill must not install a Session');

  console.log('PASS generated External study_day survives real catalog mapping and stale import fails closed');
  await context.close();
}finally{
  try{await browser?.close();}catch{}
  try{
    if(process.platform==='win32')server.kill();
    else process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  fs.rmSync(temp,{recursive:true,force:true});
}
