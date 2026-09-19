import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { studyDayAt } from '../src/lib/studyTimer.mjs';

const PORT=4345;
const BASE='http://127.0.0.1:'+PORT;
const reportPath=path.resolve(process.cwd(),'.qa/xizong-native-session-actions-browser.json');
const report={schema:'kianos.xizong.native_session_actions_browser.v1',started_at:new Date().toISOString(),checks:[]};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const check=(ok,name,detail='')=>{
  if(!ok) throw new Error('XIZONG_NATIVE_SESSION_BROWSER_FAIL:'+name+(detail?':'+detail:''));
  report.checks.push({name,pass:true,detail});
};
async function waitHttp(url,attempts=120){
  for(let i=0;i<attempts;i+=1){
    try{const r=await fetch(url);if(r.ok||r.status===404)return;}catch{}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:'+url);
}

const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;

try{
  await waitHttp(BASE+'/xizong/');
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1512,height:982}});
  page.setDefaultNavigationTimeout(15000);
  const day=studyDayAt(Date.now());
  const sessionKey='kianos:xizong:session-instruction:v1';
  const runtimeKey='kianos:xizong:session-runtime:v1';
  const memoryKey='kianos-xizong-memory-v1';

  // Repair through the existing Memory · Repair surface.
  await page.goto(BASE+'/xizong/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-home-tools]').waitFor({state:'attached'});
  const repairCreatedAt=new Date().toISOString();
  await page.evaluate(({day,sessionKey,runtimeKey,memoryKey,repairCreatedAt})=>{
    for(const key of Object.keys(localStorage)){
      if(key.includes('xizong')) localStorage.removeItem(key);
    }
    localStorage.setItem(memoryKey,JSON.stringify({
      schema:'kianos.xizong.memory.v1',revision:1,releasedBlocks:{},cards:{},
      promptOverrides:{},marks:{},evidence:[],attention:{},
      repairTasks:[{
        id:'repair:browser-demo',kpId:'circulation-b01-kp01',blockId:'circulation-b01',
        systemId:'circulation',title:'Browser Repair',reason:'真实 Repair 浏览器验收',
        action:'只修这个断点',priority:'high',origin:'SYSTEM_WU_CHAT_RETURN',
        sourceQuestionIds:['xizong-official-2024-n001'],
        blockHref:'/xizong/circulation/b01/',returnHref:'/xizong/practice/circulation/',
        createdAt:repairCreatedAt,status:'ACTIVE'
      }]
    }));
    const generatedAt=new Date().toISOString();
    localStorage.setItem(sessionKey,JSON.stringify({
      schema:'kianos.xizong.session-instruction.v1',
      session_id:'browser-repair-session',study_day:day,generated_at:generatedAt,
      steps:[{
        step_id:'r1',kind:'REPAIR_TASK',task_id:'repair:browser-demo',
        created_at:repairCreatedAt,block_id:'circulation-b01',kp_id:'circulation-b01-kp01',
        label:'Chat 安排 · 修补当前断点'
      }]
    }));
    localStorage.setItem(runtimeKey,JSON.stringify({
      schema:'kianos.xizong.session-runtime.v1',
      session_id:'browser-repair-session',study_day:day,
      instruction_generated_at:generatedAt,current_step:0,
      activated_at:null,handoff_completed_at:null,status:'ACTIVE'
    }));
  },{day,sessionKey,runtimeKey,memoryKey,repairCreatedAt});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('[data-xizong-continue-location]')?.textContent?.includes('Chat 安排'));
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('修补'),'home_routes_existing_repair');
  await page.locator('[data-xizong-continue]').click();
  await page.waitForURL(/\/xizong\/memory\//);
  await page.locator('[data-memory-view-title]').waitFor({state:'visible'});
  check((await page.locator('[data-memory-view-title]').textContent()||'').includes('Chat 安排 · Repair'),'repair_uses_existing_memory_surface');
  check((await page.locator('[data-memory-queue-count]').textContent()||'').trim()==='1','repair_session_filters_exact_task');
  await page.locator('[data-repair-complete]').click();
  const repairDone=await page.evaluate((key)=>{
    const m=JSON.parse(localStorage.getItem(key)||'null');
    return m?.repairTasks?.find(x=>x.id==='repair:browser-demo');
  },memoryKey);
  check(repairDone?.status==='DONE' && Boolean(repairDone?.completedAt),'native_repair_completion_recorded');
  await page.goto(BASE+'/xizong/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-home-tools]').waitFor({state:'attached'});
  check(!(await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 安排'),'repair_session_releases_home');

  // System Recall through the existing released System Recall surface.
  await page.goto(BASE+'/xizong/circulation/recall/',{waitUntil:'domcontentloaded'});
  const completion=JSON.parse(await page.locator('[data-xizong-completion-input]').textContent());
  check(Array.isArray(completion?.requirements)&&completion.requirements.length>0,'system_recall_exposes_real_completion_requirements');
  await page.evaluate(({requirements,day,sessionKey,runtimeKey})=>{
    for(const row of requirements){
      const blockId=row?.identity?.blockId;
      const kpIds=(row?.kps||[]).map(k=>k?.identity?.kpId).filter(Boolean);
      localStorage.setItem('kianos-xizong-astro-v2:xizong:'+blockId,JSON.stringify({
        schema:'kianos.xizong.block-state.v2',
        stage:'block_complete',groupIndex:0,kpIndex:0,
        learned:Object.fromEntries(kpIds.map(id=>[id,true])),
        ratings:Object.fromEntries(kpIds.map(id=>[id,'known'])),
        ttsxEvidence:{},ttsxAnnotations:{},pendingTtsx:null,
        blockRecallDone:true,blockRecallCompletedAt:new Date(Date.now()-5000).toISOString(),
        completed:true,completedAt:new Date(Date.now()-4000).toISOString()
      }));
    }
    localStorage.setItem('kianos:xizong:system-recall:circulation:v1',JSON.stringify({
      completedAt:new Date(Date.now()-86400000).toISOString(),
      afterRoundId:null,
      history:[{event_id:'old-recall',completed_at:new Date(Date.now()-86400000).toISOString(),after_round_id:null}]
    }));
    const generatedAt=new Date().toISOString();
    localStorage.setItem(sessionKey,JSON.stringify({
      schema:'kianos.xizong.session-instruction.v1',
      session_id:'browser-system-recall',study_day:day,generated_at:generatedAt,
      steps:[{step_id:'sr1',kind:'SYSTEM_RECALL',system_id:'circulation',label:'Chat 安排 · 循环系统回忆'}]
    }));
    localStorage.setItem(runtimeKey,JSON.stringify({
      schema:'kianos.xizong.session-runtime.v1',
      session_id:'browser-system-recall',study_day:day,
      instruction_generated_at:generatedAt,current_step:0,
      activated_at:null,handoff_completed_at:null,status:'ACTIVE'
    }));
  },{requirements:completion.requirements,day,sessionKey,runtimeKey});

  await page.goto(BASE+'/xizong/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('[data-xizong-continue-title]')?.textContent?.includes('循环系统回忆'));
  await page.locator('[data-xizong-continue]').click();
  await page.waitForURL(/\/xizong\/circulation\/recall\//);
  await page.locator('[data-recall-workspace]').waitFor({state:'visible'});
  check(await page.locator('[data-xizong-system-recall-lock]').isHidden(),'system_recall_respects_real_release_gate');
  check(await page.locator('[data-recall-front]').isVisible(),'chat_session_reopens_existing_system_recall');
  await page.locator('[data-reveal-recall]').click();
  await page.locator('[data-recall-reveal]').waitFor({state:'visible'});
  await page.locator('[data-complete-recall]').click();
  const recallState=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos:xizong:system-recall:circulation:v1')||'null'));
  check((recallState?.history||[]).length>=2,'native_system_recall_appends_fresh_history');
  check((recallState?.history||[]).some(x=>x.event_id!=='old-recall'),'fresh_system_recall_event_exists');
  await page.goto(BASE+'/xizong/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-xizong-home-tools]').waitFor({state:'attached'});
  check(!(await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 安排'),'system_recall_session_releases_home');

  // Exact Block return: arrival completes transport only, not learner evidence.
  await page.goto(BASE+'/xizong/circulation/',{waitUntil:'domcontentloaded'});
  const hrefs=await page.locator('a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')).filter(Boolean));
  const blockHref=hrefs.find(h=>/^\/xizong\/circulation\/[^/]+\/$/.test(h)&&!h.includes('/recall/')) || '';
  check(Boolean(blockHref),'discover_real_block_route',blockHref);
  await page.goto(BASE+blockHref,{waitUntil:'domcontentloaded'});
  const blockIdentity=await page.locator('[data-xizong-v6-block]').evaluate(el=>({
    systemId:el.getAttribute('data-study-system-id')||'',
    blockId:el.getAttribute('data-study-block-id')||'',
    blockSlug:el.getAttribute('data-study-block-slug')||'',
    sourceHash:el.getAttribute('data-study-source-hash')||''
  }));
  check(Boolean(blockIdentity.systemId&&blockIdentity.blockId&&blockIdentity.blockSlug&&blockIdentity.sourceHash),'block_exposes_exact_transport_identity');
  const evidenceBefore=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null')?.evidence?.length||0,memoryKey);
  await page.evaluate(({day,sessionKey,runtimeKey,blockIdentity})=>{
    const generatedAt=new Date().toISOString();
    localStorage.setItem(sessionKey,JSON.stringify({
      schema:'kianos.xizong.session-instruction.v1',
      session_id:'browser-block-return',study_day:day,generated_at:generatedAt,
      steps:[{
        step_id:'b1',kind:'BLOCK_RETURN',
        system_id:blockIdentity.systemId,block_id:blockIdentity.blockId,
        block_slug:blockIdentity.blockSlug,source_hash:blockIdentity.sourceHash,
        label:'Chat 安排 · 回当前 Block'
      }]
    }));
    localStorage.setItem(runtimeKey,JSON.stringify({
      schema:'kianos.xizong.session-runtime.v1',
      session_id:'browser-block-return',study_day:day,
      instruction_generated_at:generatedAt,current_step:0,
      activated_at:null,handoff_completed_at:null,status:'ACTIVE'
    }));
  },{day,sessionKey,runtimeKey,blockIdentity});
  await page.goto(BASE+'/xizong/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('[data-xizong-continue-title]')?.textContent?.includes('回当前 Block'));
  await page.locator('[data-xizong-continue]').click();
  await page.waitForFunction((expected)=>window.location.pathname===expected,blockHref,{timeout:15000});
  await page.locator('[data-xizong-v6-block]').waitFor({state:'attached'});
  const terminalRuntime=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),runtimeKey);
  check(terminalRuntime?.status==='COMPLETE' && Boolean(terminalRuntime?.handoff_completed_at),'block_arrival_completes_transport_only');
  const evidenceAfter=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null')?.evidence?.length||0,memoryKey);
  check(evidenceAfter===evidenceBefore,'block_transport_does_not_create_memory_evidence');

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log('XIZONG_NATIVE_SESSION_ACTIONS_BROWSER PASS | checks='+report.checks.length);
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
