import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { writePrivateControlCommand } from './privateControlStore.mjs';

const PORT=4347;
const BASE='http://127.0.0.1:'+PORT;
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-xz-wu-browser-'));
const reportPath=path.resolve(process.cwd(),'.qa/xizong-system-wu-auto-browser.json');
const report={schema:'kianos.xizong.system_wu_auto_browser.v1',started_at:new Date().toISOString(),checks:[]};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const check=(ok,name,detail='')=>{
  if(!ok) throw new Error('XIZONG_SYSTEM_WU_BROWSER_FAIL:'+name+(detail?':'+detail:''));
  report.checks.push({name,pass:true,detail});
};
async function waitHttp(url,attempts=120){
  for(let i=0;i<attempts;i+=1){
    try{const r=await fetch(url);if(r.ok||r.status===404)return;}catch{}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:'+url);
}
function packetFromHandoff(text){
  const marker='DAILY_PACKET_JSON\n';
  const i=String(text||'').indexOf(marker);
  if(i<0) throw new Error('DAILY_PACKET_JSON_MISSING');
  return JSON.parse(String(text).slice(i+marker.length));
}

const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),
  stdio:['ignore','pipe','pipe'],
  detached:process.platform!=='win32',
  env:{...process.env,KIANOS_PRIVATE_DIR:privateDir}
});
let browser;

try{
  await waitHttp(BASE+'/');
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:BASE});
  const page=await context.newPage();
  page.setDefaultNavigationTimeout(15000);

  const practicePath='/xizong/practice/circulation/';
  await page.goto(BASE+practicePath,{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-practice]').waitFor({state:'attached'});
  const payload=JSON.parse(await page.locator('[data-sweep-payload]').textContent());
  const question=(payload?.questions||[]).find(q=>
    q?.questionId
    && q?.relation?.blockId
    && q?.relation?.primaryKpId
  );
  check(Boolean(question),'discover_real_reviewed_system_question');
  const questionId=question.questionId;
  const systemId=payload.systemId || 'circulation';
  const attemptId='browser-wu-attempt-1';
  const roundId='browser-wu-round-1';
  const submittedAt=new Date().toISOString();
  const sweepKey='kianos:xizong:system-question-sweep:'+systemId+':v1';

  // Seed one exact current W/U attempt using the real System question identity.
  await page.evaluate(({sweepKey,questionId,attemptId,roundId,submittedAt})=>{
    localStorage.setItem(sweepKey,JSON.stringify({
      results:{
        [questionId]:{
          status:'wrong',
          selected:['A'],
          attemptId,
          roundId,
          studyPhase:'FIRST_PASS',
          updatedAt:submittedAt
        }
      },
      marks:{},
      round:{
        id:roundId,
        studyPhase:'FIRST_PASS',
        queueMode:'TARGETED',
        ordinal:1,
        startedAt:submittedAt,
        evidenceOrigin:'RUNTIME_CREATED'
      },
      attemptHistory:[{
        type:'QUESTION_ATTEMPT',
        evidence_origin:'USER_QUESTION_ATTEMPT',
        attempt_id:attemptId,
        attempt_index:1,
        question_id:questionId,
        system_id:'circulation',
        canonical_id:'A1',
        study_phase:'FIRST_PASS',
        context:'SYSTEM_SWEEP',
        round_id:roundId,
        round_ordinal:1,
        status:'wrong',
        selected:['A'],
        result_visibility:'immediate',
        submitted_at:submittedAt
      }],
      attemptHistoryBootstrappedAt:submittedAt
    }));
  },{sweepKey,questionId,attemptId,roundId,submittedAt});

  // Total Home must surface the unresolved W/U with exact attempt binding.
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-exam-home]').waitFor({state:'attached'});
  await page.locator('[data-exam-copy-daily]').click();
  await page.waitForTimeout(300);
  const handoffText=await page.evaluate(()=>navigator.clipboard.readText());
  const daily=packetFromHandoff(handoffText);
  const systemWu=(daily?.subjects?.xizong?.evidence?.current?.current_system_wu||[])
    .find(row=>row.system_id===systemId);
  check(Boolean(systemWu),'daily_packet_surfaces_current_system_wu');
  const item=(systemWu?.items||[]).find(row=>row.question_id===questionId);
  check(Boolean(item),'daily_packet_contains_exact_wu_question');
  check(item.attempt_id===attemptId && item.round_id===roundId && item.status==='wrong',
    'daily_packet_binds_exact_wu_attempt');
  check(systemWu?.return_contract?.schema==='kianos.xizong.system_wu_return.v1',
    'daily_packet_exposes_subject_native_wu_return_contract');

  const returnPayload={
    schema:'kianos.xizong.system_wu_return.v1',
    return_id:'browser-system-wu-return-1',
    system_id:systemId,
    decision:'REPAIR',
    plan:[{
      question_id:questionId,
      status:item.status,
      attempt_id:item.attempt_id,
      submitted_at:item.submitted_at,
      round_id:item.round_id,
      reason:'浏览器闭环验收：当前 W/U 需要最小修补',
      action:'只修 reviewed relation 对应的机制，再回题目',
      priority:'high'
    }]
  };
  const command={
    schema:'kianos.private-control-command.v1',
    command_id:'browser-system-wu-command-1',
    issued_at:new Date().toISOString(),
    study_day:daily.study_day,
    target:'xizong.system_wu_return',
    payload:returnPayload
  };

  const memoryBefore=await page.evaluate(()=>localStorage.getItem('kianos-xizong-memory-v1'));
  writePrivateControlCommand(command,privateDir);

  await page.waitForFunction(
    ()=>document.querySelector('[data-xizong-continue-title]')?.textContent?.includes('核对当前 W/U'),
    null,{timeout:12000}
  );
  check((await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 更新'),
    'home_surfaces_pending_system_wu_return');
  check(memoryBefore===await page.evaluate(()=>localStorage.getItem('kianos-xizong-memory-v1')),
    'transport_staging_does_not_create_repair');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForURL(new RegExp('/xizong/practice/'+systemId+'/$'),{timeout:15000});
  await page.locator('[data-xizong-repair-return]').waitFor({state:'attached'});

  await page.waitForFunction(({systemId,questionId})=>{
    const pending=JSON.parse(localStorage.getItem('kianos:xizong:pending-system-wu-return:v1')||'null');
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return !pending?.pending_by_system?.[systemId]
      && (memory?.repairTasks||[]).some(task=>
        task?.origin==='SYSTEM_WU_CHAT_RETURN'
        && (task?.sourceQuestionIds||[]).includes(questionId)
      );
  },{systemId,questionId},{timeout:12000});

  const pendingState=await page.evaluate(()=>
    JSON.parse(localStorage.getItem('kianos:xizong:pending-system-wu-return:v1')||'null')
  );
  check(pendingState?.last_receipt?.status==='APPLIED','system_practice_validates_and_applies_wu_return');
  check(pendingState?.last_receipt?.system_id===systemId,'wu_receipt_preserves_system_identity');
  check((pendingState?.last_receipt?.unmapped_question_ids||[]).length===0,
    'reviewed_relation_routes_without_unmapped_fallback');

  const memoryAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null'));
  const repair=(memoryAfter?.repairTasks||[]).find(task=>
    task?.origin==='SYSTEM_WU_CHAT_RETURN'
    && (task?.sourceQuestionIds||[]).includes(questionId)
  );
  check(Boolean(repair),'wu_return_lands_in_canonical_memory_repair');
  check(repair.blockId===question.relation.blockId && repair.kpId===question.relation.primaryKpId,
    'website_not_chat_owns_question_to_kp_mapping');
  check(repair.reason.includes('浏览器闭环验收'),'wu_repair_preserves_chat_diagnosis');

  // Existing Memory · Repair is still the executor.
  await page.goto(BASE+'/xizong/memory/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-memory-workspace]').waitFor({state:'attached'});
  await page.locator('[data-memory-view="REPAIR"]').click();
  await page.waitForFunction(
    ({questionId})=>{
      const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
      return (memory?.repairTasks||[]).some(task=>
        task?.status!=='DONE' && (task?.sourceQuestionIds||[]).includes(questionId)
      );
    },
    {questionId}
  );
  check((await page.locator('[data-repair-reason]').textContent()||'').includes('浏览器闭环验收'),
    'existing_memory_repair_renders_wu_diagnosis');

  await page.locator('[data-repair-complete]').click();
  const completed=await page.evaluate((id)=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.repairTasks||[]).find(task=>task.id===id)||null;
  },repair.id);
  check(completed?.status==='DONE'&&Boolean(completed?.completedAt),'native_wu_repair_completes');
  const recallEvidenceCount=await page.evaluate(()=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.evidence||[]).length;
  });
  check(recallEvidenceCount===0,'wu_repair_completion_does_not_fabricate_mastery_recall');

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log('XIZONG_SYSTEM_WU_AUTO_BROWSER PASS | checks='+report.checks.length);
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
