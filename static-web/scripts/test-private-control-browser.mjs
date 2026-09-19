import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { studyDayAt } from '../src/lib/studyTimer.mjs';
import { writePrivateControlCommand } from './privateControlStore.mjs';

const PORT=4344;
const BASE=`http://127.0.0.1:${PORT}`;
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-control-browser-'));
const reportPath=path.resolve(process.cwd(),'.qa/private-control-browser.json');
const report={schema:'kianos.private_control_browser.v1',started_at:new Date().toISOString(),checks:[]};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const check=(ok,name,detail='')=>{
  if(!ok) throw new Error(`PRIVATE_CONTROL_BROWSER_FAIL:${name}${detail?':'+detail:''}`);
  report.checks.push({name,pass:true,detail});
};

async function waitHttp(url,attempts=150){
  for(let i=0;i<attempts;i+=1){
    try{const r=await fetch(url);if(r.ok||r.status===404)return;}catch{}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:'+url);
}
async function waitReceipt(commandId,attempts=80){
  for(let i=0;i<attempts;i+=1){
    const r=await fetch(BASE+'/__kianos-private/control?t='+Date.now(),{cache:'no-store'});
    const b=await r.json().catch(()=>({}));
    if(b?.receipt?.command_id===commandId)return b.receipt;
    await sleep(150);
  }
  return null;
}

const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),
  stdio:['ignore','pipe','pipe'],
  detached:process.platform!=='win32',
  env:{...process.env,KIANOS_PRIVATE_DIR:privateDir}
});
let browser;

try{
  await waitHttp(BASE+'/xizong/');
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1512,height:982}});
  const day=studyDayAt(Date.now());
  const generatedAt=new Date().toISOString();
  const sessionId='relay-xz-session-1';
  const commandId='relay-command-xz-1';
  const cardId='core:circulation-b01-kp01';
  const memoryKey='kianos-xizong-memory-v1';

  await page.goto(BASE+'/xizong/',{waitUntil:'networkidle'});
  await page.evaluate(({memoryKey,cardId,generatedAt})=>{
    for(const key of Object.keys(localStorage)){
      if(key.includes('xizong')||key.includes('private-control'))localStorage.removeItem(key);
    }
    localStorage.setItem(memoryKey,JSON.stringify({
      schema:'kianos.xizong.memory.v1',
      revision:1,
      releasedBlocks:{
        'circulation-b01':{
          blockId:'circulation-b01',systemId:'circulation',canonicalId:'A1',
          blockLabel:'B1',blockTitle:'relay fixture',sourceHash:'relay-source-v1',
          releasedAt:generatedAt,refreshedAt:generatedAt,
          coreCardIds:[cardId],precisionCardIds:[]
        }
      },
      cards:{
        [cardId]:{
          id:cardId,family:'CORE',systemId:'circulation',canonicalId:'A1',
          blockId:'circulation-b01',blockLabel:'B1',blockTitle:'relay fixture',
          logicGroupId:'circulation-b01-lg01',groupLabel:'测试学习节',
          kpId:'circulation-b01-kp01',displayId:'KP01',title:'Relay Memory',
          promptCanonical:'先恢复这个测试 Core',coreHtml:'<p>Relay fixture Core.</p>',
          sourceLocator:'P1',sourceHash:'relay-source-v1',releasedAt:generatedAt
        }
      },
      promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]
    }));
  },{memoryKey,cardId,generatedAt});
  await page.reload({waitUntil:'networkidle'});

  const command={
    schema:'kianos.private-control-command.v1',
    command_id:commandId,
    issued_at:generatedAt,
    study_day:day,
    target:'xizong.session',
    payload:{
      schema:'kianos.xizong.session-instruction.v1',
      session_id:sessionId,
      study_day:day,
      generated_at:generatedAt,
      steps:[
        {
          step_id:'m1',kind:'MEMORY_REVIEW',label:'Chat 下发的 Memory',
          reason:'验证本机 relay → Memory',
          targets:[{card_id:cardId,block_id:'circulation-b01',source_hash:'relay-source-v1'}]
        },
        {
          step_id:'q1',kind:'PRACTICE_SET',label:'Chat 下发的迁移题',
          reason:'验证 Memory 后进入真实题目',
          question_ids:['xizong-official-2024-n001'],
          study_phase:'SECOND_PASS',speed:'normal',allow_holdout:false
        }
      ]
    }
  };

  // Simulate the background relay writing the already-validated private command.
  // Browser/network ingress remains read-only for commands.
  writePrivateControlCommand(command,privateDir);
  const forbiddenPut=await fetch(BASE+'/__kianos-private/control',{
    method:'PUT',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(command)
  });
  check(forbiddenPut.status===405,'browser_cannot_inject_control_command',String(forbiddenPut.status));
  const served=await fetch(BASE+'/__kianos-private/control?t='+Date.now(),{cache:'no-store'});
  const servedBody=await served.json().catch(()=>({}));
  check(served.ok && servedBody?.command?.command_id===commandId,
    'loopback_bridge_serves_background_relay_command',String(served.status));

  await page.waitForFunction(
    ({sessionId})=>JSON.parse(localStorage.getItem('kianos:xizong:session-instruction:v1')||'null')?.session_id===sessionId,
    {sessionId},
    {timeout:10000}
  );

  const receipt=await waitReceipt(commandId);
  check(receipt?.status==='APPLIED','browser_dispatch_writes_applied_receipt',receipt?.status||'missing');
  check(receipt?.target==='xizong.session','receipt_preserves_target');

  await page.waitForFunction(
    ()=>document.querySelector('[data-xizong-continue-location]')?.textContent?.includes('Chat 安排'),
    null,{timeout:10000}
  );
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('Memory'),
    'home_reflects_remote_chat_command');

  let extraNavigations=0;
  const onNav=()=>{extraNavigations+=1;};
  page.on('framenavigated',onNav);
  await sleep(3200);
  page.off('framenavigated',onNav);
  check(extraNavigations===0,'replayed_command_does_not_reload_home_again',String(extraNavigations));

  await page.locator('[data-xizong-continue]').click();
  await page.waitForLoadState('networkidle');
  check((await page.locator('[data-memory-view-title]').textContent()||'').includes('Chat 安排'),
    'relay_session_enters_exact_memory_view');
  check((await page.locator('[data-memory-summary-today]').textContent()||'').trim()==='0',
    'chat_selection_is_not_today_debt_before_evidence');
  await page.keyboard.press('Space');
  await page.locator('[data-memory-rating="fuzzy"]').click();

  const memoryAfter=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),memoryKey);
  check(memoryAfter?.evidence?.length===1,'memory_action_creates_real_evidence');
  check(memoryAfter?.attention?.[cardId]?.reviewRequested===true,
    'fuzzy_result_enters_native_evidence_attention_not_transport_attention');

  await page.goto(BASE+'/xizong/',{waitUntil:'networkidle'});
  await page.waitForFunction(
    ()=>document.querySelector('[data-xizong-continue-title]')?.textContent?.includes('迁移题'),
    null,{timeout:10000}
  );
  check(true,'home_advances_to_native_practice_step');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForLoadState('networkidle');
  const question=page.locator('[data-question-card]:visible');
  check(await question.count()===1,'native_chat_set_question_visible');
  const option=question.locator('[data-question-options] button').first();
  await option.click();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(220);

  const sweepKey=`kianos:xizong:chat-set-question-sweep:chat-set:${sessionId}:q1:v1`;
  const sweep=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  check(Array.isArray(sweep?.attemptHistory)&&sweep.attemptHistory.some(x=>x.question_id==='xizong-official-2024-n001'),
    'native_practice_creates_real_attempt_evidence');

  await page.goto(BASE+'/xizong/',{waitUntil:'networkidle'});
  check(!(await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 安排'),
    'completed_session_releases_home_to_native_resume');

  const finalReceipt=await waitReceipt(commandId);
  check(finalReceipt?.status==='APPLIED','transport_receipt_remains_transport_only');

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(`PRIVATE_CONTROL_BROWSER PASS | checks=${report.checks.length}`);
}catch(error){
  report.status='FAIL';
  report.completed_at=new Date().toISOString();
  report.error=String(error?.stack||error);
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  throw error;
}finally{
  try{await browser?.close();}catch{}
  try{
    if(process.platform==='win32')server.kill();
    else process.kill(-server.pid,'SIGTERM');
  }catch{try{server.kill('SIGTERM');}catch{}}
  fs.rmSync(privateDir,{recursive:true,force:true});
}
