import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';

const PORT=4353;
const BASE='http://127.0.0.1:'+PORT;
const out=path.resolve(process.cwd(),'.qa/total-home-live-control');
fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ready(){
  for(let i=0;i<120;i++){
    try{if((await fetch(BASE+'/')).ok)return;}catch{}
    await sleep(200);
  }
  throw new Error('SERVER_NOT_READY');
}
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;
const report={schema:'kianos.total-home-live-control.v1',checks:[]};
const check=(ok,name,detail='')=>{
  if(!ok)throw new Error('LIVE_CONTROL_FAIL:'+name+(detail?':'+detail:''));
  report.checks.push({name,pass:true,detail});
};
const studyDay='2026-09-20';
const now=Date.parse('2026-09-20T05:20:00+08:00');
try{
  await ready();
  browser=await chromium.launch({headless:true});

  // Xizong: Home is already open when the shared control command arrives.
  {
    const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
    const page=await ctx.newPage();
    const cardId='core:circulation-b01-kp01';
    await page.addInitScript(({cardId})=>{
      localStorage.setItem('kianos-xizong-memory-v1',JSON.stringify({
        schema:'kianos.xizong.memory.v1',revision:1,
        releasedBlocks:{'circulation-b01':{
          blockId:'circulation-b01',systemId:'circulation',canonicalId:'A1',
          blockLabel:'B1',blockTitle:'fixture',sourceHash:'live-source-v1',
          releasedAt:new Date().toISOString(),refreshedAt:new Date().toISOString(),
          coreCardIds:[cardId],precisionCardIds:[]
        }},
        cards:{[cardId]:{
          id:cardId,family:'CORE',systemId:'circulation',canonicalId:'A1',
          blockId:'circulation-b01',blockLabel:'B1',blockTitle:'fixture',
          logicGroupId:'circulation-b01-lg01',groupLabel:'fixture',
          kpId:'circulation-b01-kp01',displayId:'KP01',title:'fixture',
          promptCanonical:'fixture',coreHtml:'<p>fixture</p>',
          sourceLocator:'P1',sourceHash:'live-source-v1',releasedAt:new Date().toISOString()
        }},
        promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]
      }));
    },{cardId});
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    check((await page.locator('[data-exam-next]').getAttribute('aria-disabled'))==='true','xizong_home_starts_without_fake_next');

    const generatedAt='2026-09-19T21:18:00.000Z';
    const sessionId='live-xizong-session';
    const command={
      schema:'kianos.control-browser-command.v1',
      command_id:'live-xizong-command-001',command_hash:'live-xizong',
      study_day:studyDay,generated_at:generatedAt,expires_at:null,
      operations:[
        {kind:'xizong.session',payload:{
          schema:'kianos.xizong.session-instruction.v1',session_id:sessionId,
          study_day:studyDay,generated_at:generatedAt,current_step:0,
          steps:[{step_id:'m1',kind:'MEMORY_REVIEW',label:'实时回收循环机制',reason:'live control proof',
            targets:[{card_id:cardId,block_id:'circulation-b01',source_hash:'live-source-v1'}]}]
        }},
        {kind:'exam.chat_plan',payload:{
          schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:generatedAt,
          subjects:{xizong:{target_minutes:60,role:'主推进',note:'实时回收循环机制',session_ref:sessionId},english:null,politics:null},
          next_subject:'xizong',attention:null
        }}
      ]
    };
    await page.evaluate(async ({command,studyDay,now})=>{
      const mod=await import('/src/lib/privateControlRuntime.mjs');
      await mod.applyPrivateControlCommand(localStorage,command,{day:studyDay,now});
    },{command,studyDay,now});
    await page.waitForLoadState('domcontentloaded').catch(()=>{});
    await page.waitForFunction(()=>document.querySelector('[data-exam-next]')?.getAttribute('href')?.includes('/xizong/memory/?session='));
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(href?.includes('/xizong/memory/?session=live-xizong-session'),'xizong_live_command_updates_home_directly',href||'');
    await page.screenshot({path:path.join(out,'01-live-xizong.png'),fullPage:true});
    await ctx.close();
  }

  // Politics: same-window Memory plan arrival updates the current Next Action in-place.
  {
    const catalog=buildPoliticsMemoryCandidateCatalogCurrent();
    const candidate=catalog.candidates[0];
    check(Boolean(candidate?.id),'politics_candidate_exists');
    const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
    const page=await ctx.newPage();
    await page.goto(BASE+'/',{waitUntil:'networkidle'});
    check((await page.locator('[data-exam-next]').getAttribute('aria-disabled'))==='true','politics_home_starts_without_fake_next');

    const generatedAt='2026-09-19T21:19:00.000Z';
    const planId='live-politics-memory-plan';
    const command={
      schema:'kianos.control-browser-command.v1',
      command_id:'live-politics-command-001',command_hash:'live-politics',
      study_day:studyDay,generated_at:generatedAt,expires_at:null,
      operations:[
        {kind:'politics.memory_plan',payload:{
          schema:'kianos.politics.memory-plan.v1',plan_id:planId,
          study_day:studyDay,generated_at:generatedAt,catalog_revision:catalog.revision,
          phase:'FIRST_ROUND',supersedes_plan_id:null,
          items:[{candidate_id:candidate.id,reason:'live control proof'}]
        }},
        {kind:'exam.chat_plan',payload:{
          schema:'kianos.exam.chat-plan.v1',study_day:studyDay,generated_at:generatedAt,
          subjects:{xizong:null,english:null,politics:{target_minutes:45,role:'推进',note:'今日记忆',session_ref:planId}},
          next_subject:'politics',attention:null
        }}
      ]
    };
    await page.evaluate(async ({command,studyDay,now})=>{
      const mod=await import('/src/lib/privateControlRuntime.mjs');
      await mod.applyPrivateControlCommand(localStorage,command,{day:studyDay,now});
    },{command,studyDay,now});
    await page.waitForFunction(()=>document.querySelector('[data-exam-next]')?.getAttribute('href')==='/politics/memory/');
    const href=await page.locator('[data-exam-next]').getAttribute('href');
    check(href==='/politics/memory/','politics_live_command_updates_home_directly',href||'');
    await page.screenshot({path:path.join(out,'02-live-politics.png'),fullPage:true});
    await ctx.close();
  }

  report.status='PASS';
}catch(error){
  report.status='FAIL';
  report.error=String(error?.stack||error);
  throw error;
}finally{
  report.completed_at=new Date().toISOString();
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  try{await browser?.close();}catch{}
  try{process.kill(-server.pid,'SIGTERM');}catch{try{server.kill('SIGTERM');}catch{}}
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length}));
