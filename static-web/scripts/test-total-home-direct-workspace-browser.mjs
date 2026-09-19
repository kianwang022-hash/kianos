import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';
import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';

const PORT=4351;
const BASE='http://127.0.0.1:'+PORT;
const out=path.resolve(process.cwd(),'.qa/total-home-direct');
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const day=()=>new Intl.DateTimeFormat('en-CA',{
  timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'
}).format(new Date());
async function waitHttp(url){
  for(let i=0;i<120;i+=1){
    try{const r=await fetch(url);if(r.ok)return;}catch{}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:'+url);
}
const report={schema:'kianos.total-home-direct-workspace-browser.v1',started_at:new Date().toISOString(),checks:[]};
function check(ok,name,detail=''){
  if(!ok)throw new Error('TOTAL_HOME_DIRECT_FAIL:'+name+(detail?':'+detail:''));
  report.checks.push({name,pass:true,detail});
}
function chatPlan(studyDay,subject,sessionRef,title){
  const subjects={xizong:null,english:null,politics:null};
  subjects[subject]={target_minutes:60,role:'当前主任务',note:title,session_ref:sessionRef};
  return {
    schema:'kianos.exam.chat-plan.v1',
    study_day:studyDay,
    generated_at:new Date().toISOString(),
    subjects,
    next_subject:subject,
    attention:null
  };
}
async function context(){
  return browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
}
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;
try{
  await waitHttp(BASE+'/');
  browser=await chromium.launch({headless:true});
  const studyDay=day();

  // Xizong: Total Home must go straight to exact Chat-selected Memory workspace.
  {
    const ctx=await context();
    const page=await ctx.newPage();
    const sessionId='total-home-xizong-session';
    const cardId='core:circulation-b01-kp01';
    await page.addInitScript(({studyDay,sessionId,cardId})=>{
      localStorage.setItem('kianos-xizong-memory-v1',JSON.stringify({
        schema:'kianos.xizong.memory.v1',revision:1,
        releasedBlocks:{'circulation-b01':{
          blockId:'circulation-b01',systemId:'circulation',canonicalId:'A1',
          blockLabel:'B1',blockTitle:'循环 direct-home fixture',sourceHash:'direct-source-v1',
          releasedAt:new Date().toISOString(),refreshedAt:new Date().toISOString(),
          coreCardIds:[cardId],precisionCardIds:[]
        }},
        cards:{[cardId]:{
          id:cardId,family:'CORE',systemId:'circulation',canonicalId:'A1',
          blockId:'circulation-b01',blockLabel:'B1',blockTitle:'循环 direct-home fixture',
          logicGroupId:'circulation-b01-lg01',groupLabel:'测试学习节',
          kpId:'circulation-b01-kp01',displayId:'KP01',title:'Direct Home Memory',
          promptCanonical:'直接从总 Home 回收这个机制',coreHtml:'<p>Direct Home fixture Core.</p>',
          sourceLocator:'P1',sourceHash:'direct-source-v1',releasedAt:new Date().toISOString()
        }},
        promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]
      }));
      const generatedAt=new Date().toISOString();
      localStorage.setItem('kianos:xizong:session-instruction:v1',JSON.stringify({
        schema:'kianos.xizong.session-instruction.v1',
        session_id:sessionId,study_day:studyDay,generated_at:generatedAt,current_step:0,
        steps:[{
          step_id:'m1',kind:'MEMORY_REVIEW',label:'回收循环核心机制',
          reason:'Total Home 直达验收',
          targets:[{card_id:cardId,block_id:'circulation-b01',source_hash:'direct-source-v1'}]
        }]
      }));
      localStorage.setItem('kianos:xizong:session-runtime:v1',JSON.stringify({
        schema:'kianos.xizong.session-runtime.v1',session_id:sessionId,study_day:studyDay,
        instruction_generated_at:generatedAt,current_step:0,activated_at:null,status:'ACTIVE'
      }));
      localStorage.setItem('kianos-exam-chat-plan-v1',JSON.stringify({
        schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:generatedAt,
        subjects:{
          xizong:{target_minutes:60,role:'主推进',note:'回收循环核心机制',session_ref:sessionId},
          english:null,politics:null
        },
        next_subject:'xizong',attention:null
      }));
    },{studyDay,sessionId,cardId});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(Boolean(href?.includes('/xizong/memory/?session=')),'xizong_total_home_points_exact_workspace',href||'');
    check(!/^\/xizong\/?$/.test(href||''),'xizong_does_not_stop_at_subject_home',href||'');
    const leftXizong=page.locator('[data-xizong-continue]');
    check(!(await leftXizong.getAttribute('href')||'').includes('/xizong/memory/'),
      'xizong_left_continue_not_repurposed_by_chat');
    check(!(await leftXizong.getAttribute('data-session-ref')),
      'xizong_left_continue_has_no_chat_session_ref');
    await page.screenshot({path:path.join(out,'01-xizong-direct.png'),fullPage:true});
    await page.locator('[data-exam-next]').click();
    await page.waitForURL(/\/xizong\/memory\//);
    check(await page.locator('[data-memory-view-title]').count()>0,'xizong_click_arrives_memory_workspace');
    await ctx.close();
  }

  // Xizong typed Return: Total Home must route straight back to the exact Block.
  {
    const ctx=await context();
    const page=await ctx.newPage();
    const returnId='total-home-xizong-return';
    await page.addInitScript(({studyDay,returnId})=>{
      const receivedAt=new Date().toISOString();
      localStorage.setItem('kianos:xizong:pending-chat-return:v1',JSON.stringify({
        schema:'kianos.xizong.pending-chat-return.v1',
        pending_by_object:{
          'xizong:circulation-b01':{
            handoff_id:'handoff-fixture',
            return_id:returnId,
            object_id:'xizong:circulation-b01',
            system_id:'circulation',
            block_id:'circulation-b01',
            source_hash:'fixture-source',
            evidence_version:'ev-fixture',
            return_href:'/xizong/circulation/b01/',
            study_day:studyDay,
            received_at:receivedAt,
            return_packet:{
              schema:'kianos.xizong.chat_return.v1',
              return_id:returnId,
              handoff_id:'handoff-fixture',
              decision:'NO_ACTION',
              repairs:[]
            }
          }
        },
        last_receipt:null
      }));
      localStorage.setItem('kianos-exam-chat-plan-v1',JSON.stringify({
        schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:receivedAt,
        subjects:{
          xizong:{target_minutes:30,role:'返回当前 Block',note:'typed Return',session_ref:returnId},
          english:null,politics:null
        },
        next_subject:'xizong',attention:null
      }));
    },{studyDay,returnId});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(href==='/xizong/circulation/b01/'||href?.endsWith('/xizong/circulation/b01/'),
      'xizong_return_total_home_points_exact_block',href||'');
    check(!/^\/xizong\/?$/.test(href||''),'xizong_return_does_not_stop_at_subject_home',href||'');
    await ctx.close();
  }

  // English: Total Home must go straight to the exact Chat-selected task.
  {
    const catalog=englishSessionCatalog();
    const row=catalog.find(x=>x.task==='reading_a') || catalog[0];
    check(Boolean(row?.object_id&&row?.source_hash),'english_catalog_fixture_available');
    const ctx=await context();
    const page=await ctx.newPage();
    const sessionId='total-home-english-session';
    await page.addInitScript(({studyDay,sessionId,row})=>{
      const generatedAt=new Date().toISOString();
      localStorage.setItem('kianos-english-session-instruction-v1',JSON.stringify({
        schema:'kianos.english.session-instruction.v1',session_id:sessionId,
        study_day:studyDay,generated_at:generatedAt,current_step:0,
        steps:[{step_id:'e1',task:row.task,object_id:row.object_id,source_hash:row.source_hash,label:'English exact task',note:'Total Home 直达验收',params:{}}],
        return_policy:{on_finish:'english_home'}
      }));
      localStorage.setItem('kianos-exam-chat-plan-v1',JSON.stringify({
        schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:generatedAt,
        subjects:{xizong:null,english:{target_minutes:60,role:'保连续',note:'English exact task',session_ref:sessionId},politics:null},
        next_subject:'english',attention:null
      }));
    },{studyDay,sessionId,row});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    await page.waitForTimeout(150);
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(Boolean(href && !/^\/english\/?$/.test(href)),'english_total_home_points_exact_task',href||'');
    await page.screenshot({path:path.join(out,'02-english-direct.png'),fullPage:true});
    await page.locator('[data-exam-next]').click();
    check(!/\/english\/?$/.test(new URL(page.url()).pathname),'english_click_bypasses_subject_home',page.url());
    await ctx.close();
  }

  // Politics: Total Home must go straight to Chat-selected Memory, not Politics Home.
  {
    const catalog=buildPoliticsMemoryCandidateCatalogCurrent();
    const candidate=catalog.candidates[0];
    check(Boolean(candidate?.id),'politics_memory_candidate_available');
    const ctx=await context();
    const page=await ctx.newPage();
    const planId='total-home-politics-memory';
    await page.addInitScript(({studyDay,planId,catalogRevision,candidateId})=>{
      const generatedAt=new Date().toISOString();
      localStorage.setItem('kianos-politics-memory-plan-v1',JSON.stringify({
        schema:'kianos.politics.memory-plan.v1',plan_id:planId,study_day:studyDay,
        generated_at:generatedAt,catalog_revision:catalogRevision,phase:'FIRST_ROUND',
        supersedes_plan_id:null,items:[{candidate_id:candidateId,reason:'Total Home 直达验收'}]
      }));
      // Deliberately preserve an old native Resume. Chat-selected Memory must still win.
      localStorage.setItem('kianos-politics-last-location-v1',JSON.stringify({
        href:'/politics/legacy-stale-location/',
        subject:'legacy',
        chapter:'legacy',
        title:'旧政治位置'
      }));
      localStorage.setItem('kianos-exam-chat-plan-v1',JSON.stringify({
        schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:generatedAt,
        subjects:{xizong:null,english:null,politics:{target_minutes:45,role:'推进',note:'今日记忆',session_ref:planId}},
        next_subject:'politics',attention:null
      }));
    },{studyDay,planId,catalogRevision:catalog.revision,candidateId:candidate.id});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(href==='/politics/memory/'||href?.endsWith('/politics/memory/'),'politics_total_home_points_memory',href||'');
    check(!/^\/politics\/?$/.test(href||''),'politics_does_not_stop_at_subject_home',href||'');
    const leftPolitics=page.locator('[data-politics-continue]');
    check(!(await leftPolitics.getAttribute('href')||'').includes('/politics/memory/'),
      'politics_left_continue_not_repurposed_by_chat');
    check(!(await leftPolitics.getAttribute('data-session-ref')),
      'politics_left_continue_has_no_chat_session_ref');
    await page.screenshot({path:path.join(out,'03-politics-direct.png'),fullPage:true});
    await page.locator('[data-exam-next]').click();
    await page.waitForURL(/\/politics\/memory\//);
    check(await page.locator('[data-memory-card]').count()>0,'politics_click_arrives_memory_workspace');
    await ctx.close();
  }

  // Visual contract: preserve the existing Total Home. The left three-subject
  // execution/navigation surface stays visible; the right rail owns one normal Next Action.
  {
    const ctx=await context();
    const page=await ctx.newPage();
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    check(await page.locator('.homeL3Subjects').count()===1,'current_three_subject_home_preserved');
    check(await page.locator('[data-home-subject="xizong"]').count()===1,'current_xizong_home_surface_preserved');
    check(await page.locator('[data-home-subject="english"]').count()===1,'current_english_home_surface_preserved');
    check(await page.locator('[data-home-subject="politics"]').count()===1,'current_politics_home_surface_preserved');
    check(await page.locator('.homeFallbackNav').count()===0,'no_replacement_fallback_home_ui');
    check(await page.locator('[data-exam-next]').count()===1,'single_right_rail_next_action');
    check(await page.locator('[data-home-subject-route-bridge]').count()===0,'no_parallel_headless_route_owner');
    check(await page.locator('[data-english-resume-link]').count()===1,'one_english_route_owner');
    check(await page.locator('[data-xizong-home-tools]').count()===1,'one_xizong_route_owner');
    check(await page.locator('[data-politics-home-tools]').count()===1,'one_politics_route_owner');
    await ctx.close();
  }

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
}catch(error){
  report.status='FAIL';
  report.completed_at=new Date().toISOString();
  report.error=String(error?.stack||error);
  throw error;
}finally{
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  try{await browser?.close();}catch{}
  try{process.kill(-server.pid,'SIGTERM');}catch{try{server.kill('SIGTERM');}catch{}}
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length}));
