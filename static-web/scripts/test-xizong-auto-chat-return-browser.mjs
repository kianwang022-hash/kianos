import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { writePrivateControlCommand } from './privateControlStore.mjs';

const PORT=4346;
const BASE='http://127.0.0.1:'+PORT;
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-xz-return-browser-'));
const reportPath=path.resolve(process.cwd(),'.qa/xizong-auto-chat-return-browser.json');
const report={schema:'kianos.xizong.auto_chat_return_browser.v1',started_at:new Date().toISOString(),checks:[]};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const check=(ok,name,detail='')=>{
  if(!ok) throw new Error('XIZONG_AUTO_RETURN_BROWSER_FAIL:'+name+(detail?':'+detail:''));
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

  // Discover a real Current Block and seed minimal real learner state.
  await page.goto(BASE+'/xizong/circulation/',{waitUntil:'domcontentloaded'});
  const blockHref=await page.locator('a').evaluateAll(nodes=>
    nodes.map(a=>a.getAttribute('href')).find(h=>/^\/xizong\/circulation\/[^/]+\/$/.test(h||'')&&!String(h).includes('/recall/'))||''
  );
  check(Boolean(blockHref),'discover_real_current_block',blockHref);

  await page.goto(BASE+blockHref,{waitUntil:'domcontentloaded'});
  const blockRoot=page.locator('[data-xizong-v6-block]');
  await blockRoot.waitFor({state:'attached'});
  const identity=await blockRoot.evaluate(el=>({
    objectId:el.getAttribute('data-study-object')||'',
    sourceHash:el.getAttribute('data-study-source-hash')||'',
    blockId:el.getAttribute('data-study-block-id')||''
  }));
  const kpIds=await page.locator('[data-kp-id]').evaluateAll(nodes=>
    [...new Set(nodes.map(n=>n.getAttribute('data-kp-id')).filter(Boolean))]
  );
  check(Boolean(identity.objectId&&identity.sourceHash&&identity.blockId&&kpIds.length),'real_block_identity_and_kps_available');

  await page.evaluate(({identity,kpIds})=>{
    const first=kpIds[0];
    localStorage.setItem('kianos-xizong-astro-v2:'+identity.objectId,JSON.stringify({
      schema:'kianos.xizong.block-state.v2',
      stage:'kp_recall',
      groupIndex:0,
      kpIndex:0,
      learned:{[first]:true},
      ratings:{[first]:'fuzzy'},
      ttsxEvidence:{},
      ttsxAnnotations:{},
      pendingTtsx:null,
      sourceContactDone:true,
      sourceContactEvidence:[],
      blockRecallDone:false,
      blockRecallCompletedAt:null,
      completed:false,
      completedAt:null
    }));
  },{identity,kpIds});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-study-dock]').waitFor({state:'attached'});

  // Export from the real total Home. The current Xizong Block must already carry its Return contract.
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-exam-home]').waitFor({state:'attached'});
  await page.locator('[data-exam-copy-daily]').click();
  await page.waitForTimeout(300);
  const handoffText=await page.evaluate(()=>navigator.clipboard.readText());
  const daily=packetFromHandoff(handoffText);
  const current=daily?.subjects?.xizong?.evidence?.current_block;
  const contract=current?.chat_return_contract;
  check(current?.schema==='kianos.xizong.study_packet.v3','home_daily_packet_contains_current_xizong_block');
  check(contract?.schema==='kianos.xizong.chat_return.v1','home_daily_packet_auto_attaches_typed_return_contract');
  check(contract?.origin?.object_id===identity.objectId,'return_contract_binds_exact_current_block');
  const firstKp=current?.kp_evidence?.[0]?.kp_id || '';
  check(Boolean(firstKp&&contract.allowed_kp_ids?.includes(firstKp)),'return_contract_exposes_only_allowed_real_kp');

  const returnPayload={
    schema:'kianos.xizong.chat_return.v1',
    return_id:'browser-auto-return-1',
    handoff_id:contract.handoff_id,
    origin:contract.origin,
    resume:contract.resume,
    decision:'REPAIR',
    repairs:[{
      kp_id:firstKp,
      reason:'浏览器闭环验收：只修当前真实 KP',
      action:'只修这个 KP，然后继续原主线',
      priority:'high',
      source_question_ids:[]
    }],
    note:'automatic typed return proof'
  };
  const command={
    schema:'kianos.private-control-command.v1',
    command_id:'browser-xizong-return-command-1',
    issued_at:new Date().toISOString(),
    study_day:daily.study_day,
    target:'xizong.chat_return',
    payload:returnPayload
  };

  // Simulate the private relay. Browser ingress itself remains read-only for commands.
  writePrivateControlCommand(command,privateDir);

  await page.waitForFunction(
    ()=>document.querySelector('[data-xizong-continue-location]')?.textContent?.includes('Chat 更新'),
    null,{timeout:12000}
  );
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('核对当前 Block'),
    'total_home_routes_pending_return_to_exact_block');

  const memoryBefore=await page.evaluate(()=>localStorage.getItem('kianos-xizong-memory-v1'));
  check(memoryBefore===null || (JSON.parse(memoryBefore)?.repairTasks||[]).length===0,
    'transport_delivery_alone_does_not_create_repair');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForFunction((expected)=>window.location.pathname===expected,blockHref,{timeout:15000});
  await page.locator('[data-xizong-study-dock]').waitFor({state:'attached'});

  await page.waitForFunction(({objectId})=>{
    const pending=JSON.parse(localStorage.getItem('kianos:xizong:pending-chat-return:v1')||'null');
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return !pending?.pending_by_object?.[objectId]
      && (memory?.repairTasks||[]).some(task=>task.origin==='BLOCK_CHAT_RETURN'&&task.status==='ACTIVE');
  },{objectId:identity.objectId},{timeout:12000});

  const semanticReceipt=await page.evaluate(()=>
    JSON.parse(localStorage.getItem('kianos:xizong:pending-chat-return:v1')||'null')?.last_receipt||null
  );
  check(semanticReceipt?.status==='APPLIED','exact_block_validates_and_applies_return');
  check(semanticReceipt?.object_id===identity.objectId,'semantic_receipt_preserves_exact_object');
  check(semanticReceipt?.repair_kp_ids?.includes(firstKp),'semantic_receipt_preserves_exact_repair_kp');

  const memoryAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null'));
  const repair=memoryAfter.repairTasks.find(task=>task.origin==='BLOCK_CHAT_RETURN'&&task.kpId===firstKp);
  check(Boolean(repair),'typed_return_lands_in_canonical_memory_repair');
  check(repair.reason.includes('浏览器闭环验收'),'repair_preserves_chat_reason');

  // The existing Memory · Repair remains the learner-facing executor.
  await page.goto(BASE+'/xizong/memory/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-memory-workspace]').waitFor({state:'attached'});
  await page.locator('[data-memory-view="REPAIR"]').click();
  await page.waitForFunction(()=>Number(document.querySelector('[data-memory-queue-count]')?.textContent||0)>=1);
  check((await page.locator('[data-memory-view-title]').textContent()||'').includes('Repair'),
    'canonical_existing_memory_repair_surface_is_used');
  check((await page.locator('[data-repair-reason]').textContent()||'').includes('浏览器闭环验收'),
    'existing_repair_surface_renders_chat_reason');

  await page.locator('[data-repair-complete]').click();
  const completed=await page.evaluate((id)=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.repairTasks||[]).find(task=>task?.id===id)||null;
  },repair.id);
  check(completed?.status==='DONE'&&Boolean(completed?.completedAt),'native_memory_repair_completes');
  const evidenceCount=await page.evaluate(()=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.evidence||[]).length;
  });
  check(evidenceCount===0,'repair_completion_does_not_fabricate_mastery_recall_evidence');

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log('XIZONG_AUTO_CHAT_RETURN_BROWSER PASS | checks='+report.checks.length);
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
