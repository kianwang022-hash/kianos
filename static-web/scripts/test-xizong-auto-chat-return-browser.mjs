import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT=4346;
const BASE='http://127.0.0.1:'+PORT;
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
function packetFromClipboard(text){
  const marker='DAILY_PACKET_JSON\n';
  const idx=String(text||'').indexOf(marker);
  if(idx<0) throw new Error('DAILY_PACKET_MARKER_MISSING');
  return JSON.parse(String(text).slice(idx+marker.length));
}

const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;

try{
  await waitHttp(BASE+'/xizong/');
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:1512,height:982},
    permissions:['clipboard-read','clipboard-write']
  });
  const page=await context.newPage();
  page.setDefaultNavigationTimeout(15000);

  // Discover and open one real Current Block.
  await page.goto(BASE+'/xizong/circulation/',{waitUntil:'domcontentloaded'});
  const hrefs=await page.locator('a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')).filter(Boolean));
  const blockHref=hrefs.find(h=>/^\/xizong\/circulation\/[^/]+\/$/.test(h)&&!h.includes('/recall/')) || '';
  check(Boolean(blockHref),'discover_real_current_block',blockHref);
  await page.goto(BASE+blockHref,{waitUntil:'domcontentloaded'});
  const root=page.locator('[data-xizong-v6-block]');
  await root.waitFor({state:'attached'});
  const identity=await root.evaluate(el=>({
    objectId:el.getAttribute('data-study-object')||'',
    systemId:el.getAttribute('data-study-system-id')||'',
    blockId:el.getAttribute('data-study-block-id')||'',
    blockSlug:el.getAttribute('data-study-block-slug')||'',
    sourceHash:el.getAttribute('data-study-source-hash')||''
  }));
  const kpIds=await page.locator('[data-kp-id]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('data-kp-id')).filter(Boolean))]);
  check(Boolean(identity.objectId&&identity.blockId&&identity.sourceHash&&kpIds.length),'read_real_block_identity');

  // Seed a bounded real learner state so Home can build the current Study Packet.
  await page.evaluate(({identity,kpIds})=>{
    const learned=Object.fromEntries(kpIds.map(id=>[id,true]));
    const ratings={[kpIds[0]]:'fuzzy'};
    localStorage.setItem('kianos-xizong-astro-v2:'+identity.objectId,JSON.stringify({
      schema:'kianos.xizong.block-state.v2',
      stage:'kp_recall',
      groupIndex:0,
      kpIndex:0,
      learned,
      ratings,
      ttsxEvidence:{},
      ttsxAnnotations:{},
      pendingTtsx:null,
      sourceContactDone:true,
      sourceContactEvidence:[{
        segment_id:'browser-source',
        source_contact_mode:'NATURAL_SOURCE_UNIT',
        coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
        kp_ids:kpIds,
        completed_at:new Date(Date.now()-5000).toISOString(),
        source_hash:identity.sourceHash
      }],
      blockRecallDone:false,
      blockRecallCompletedAt:null,
      completed:false,
      completedAt:null
    }));
  },{identity,kpIds});
  // Revisit so last-location and all current bridges observe the seeded state.
  await page.reload({waitUntil:'domcontentloaded'});
  await root.waitFor({state:'attached'});

  // Total Home exports one Daily Learning Packet. Current Block must receive a stable Return contract.
  await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  const importDetails=page.locator('[data-exam-import-details]');
  await importDetails.evaluate((el)=>{ el.open=true; });
  const copy=page.locator('[data-exam-copy-daily]');
  await copy.waitFor({state:'visible'});
  await copy.click();
  await page.waitForFunction(()=>document.querySelector('[data-exam-daily-status]')?.textContent?.includes('已复制'));
  const clip=await page.evaluate(()=>navigator.clipboard.readText());
  const daily=packetFromClipboard(clip);
  const currentBlock=daily?.subjects?.xizong?.evidence?.current_block;
  const contract=currentBlock?.chat_return_contract;
  check(currentBlock?.schema==='kianos.xizong.study_packet.v3','daily_packet_contains_current_xizong_block');
  check(contract?.schema==='kianos.xizong.chat_return_contract.v1','daily_packet_auto_attaches_typed_return_contract');
  check(contract?.origin?.object_id===identity.objectId,'handoff_binds_exact_current_object');
  check(contract?.origin?.source_hash===identity.sourceHash,'handoff_binds_exact_source_revision');
  check(contract?.allowed_kp_ids?.includes(kpIds[0]),'handoff_allows_real_current_kp');
  const storedHandoff=await page.evaluate((id)=>JSON.parse(localStorage.getItem('kianos-xizong-chat-handoff-v1:'+id)||'null'),contract.handoff_id);
  check(storedHandoff?.handoff_id===contract.handoff_id,'daily_export_persists_matching_local_handoff');

  // Simulate Chat returning one bounded Repair through the Xizong-owned ingress.
  const returned={
    schema:'kianos.xizong.chat_return.v1',
    return_id:'browser-auto-return-1',
    handoff_id:contract.handoff_id,
    origin:contract.origin,
    resume:contract.resume,
    decision:'REPAIR',
    repairs:[{
      kp_id:kpIds[0],
      reason:'浏览器验收：只修这个真实 KP',
      action:'恢复局部机制后回原主线',
      priority:'high',
      source_question_ids:[]
    }]
  };
  await page.evaluate(async (returned)=>{
    const mod=await import('/src/lib/xizongPendingChatReturn.mjs');
    window.setTimeout(()=>mod.stageXizongChatReturn(localStorage,returned,{now:Date.now()}),0);
  },returned);

  await page.waitForFunction(()=>document.querySelector('[data-xizong-continue-location]')?.textContent?.includes('Chat 更新'),null,{timeout:15000});
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('核对当前 Block'),
    'home_routes_pending_return_to_exact_block');
  const returnLink=await page.locator('[data-xizong-continue]').getAttribute('href');
  check(returnLink===contract.return_href,'home_uses_handoff_return_href',returnLink||'');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForFunction(({objectId})=>{
    const state=JSON.parse(localStorage.getItem('kianos:xizong:pending-chat-return:v1')||'null');
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return !state?.pending_by_object?.[objectId]
      && memory?.repairTasks?.some(t=>t?.origin==='BLOCK_CHAT_RETURN'&&t?.status==='ACTIVE');
  },{objectId:identity.objectId},{timeout:15000});

  const localResult=await page.evaluate(({objectId,handoffId})=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    const pending=JSON.parse(localStorage.getItem('kianos:xizong:pending-chat-return:v1')||'null');
    const returnReceipt=JSON.parse(localStorage.getItem('kianos-xizong-chat-return-v1:'+handoffId)||'null');
    const ext=JSON.parse(localStorage.getItem('kianos-xizong-memory-review-v2:'+objectId)||'null');
    return {
      task:(memory?.repairTasks||[]).find(t=>t?.origin==='BLOCK_CHAT_RETURN')||null,
      pendingReceipt:pending?.last_receipt||null,
      returnReceipt,
      evidence:(ext?.evidenceHistory||[]).filter(x=>x?.type==='BLOCK_CHAT_RETURN_IMPORTED')
    };
  },{objectId:identity.objectId,handoffId:contract.handoff_id});

  check(localResult.task?.kpId===kpIds[0],'typed_return_creates_visible_current_memory_repair');
  check(Boolean(localResult.task?.createdAt),'visible_repair_has_exact_revision_time');
  check(localResult.pendingReceipt?.status==='APPLIED','pending_return_records_applied_subject_receipt');
  check(localResult.pendingReceipt?.repair_tasks?.[0]?.task_id===localResult.task.id,'receipt_exposes_exact_created_repair');
  check(localResult.returnReceipt?.return_id==='browser-auto-return-1','native_typed_return_receipt_persisted');
  check(localResult.evidence.length===1,'block_evidence_preserves_block_chat_return_origin');

  // Existing Memory · Repair is the learner-facing executor.
  await page.goto(BASE+'/xizong/memory/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-memory-view="REPAIR"]').click();
  await page.waitForFunction((id)=>document.querySelector('[data-memory-queue]')?.textContent?.includes(id.split(':').at(-1)) || document.querySelector('[data-memory-queue-count]')?.textContent==='1',localResult.task.id);
  check((await page.locator('[data-memory-queue-count]').textContent()||'').trim()==='1','memory_repair_shows_auto_return_task');
  await page.locator('[data-repair-complete]').click();

  const completed=await page.evaluate((id)=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.repairTasks||[]).find(t=>t?.id===id)||null;
  },localResult.task.id);
  check(completed?.status==='DONE'&&Boolean(completed?.completedAt),'native_memory_repair_completes');
  const memoryEvidenceCount=await page.evaluate(()=>{
    const memory=JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')||'null');
    return (memory?.evidence||[]).length;
  });
  check(memoryEvidenceCount===0,'repair_completion_does_not_fabricate_mastery_recall_evidence');

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
}
