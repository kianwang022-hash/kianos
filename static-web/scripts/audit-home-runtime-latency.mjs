import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';

const PORT=4367;
const BASE='http://127.0.0.1:'+PORT;
const OUT=path.resolve(process.cwd(),'.qa/home-runtime-latency');
fs.mkdirSync(OUT,{recursive:true});

const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
async function waitHttp(url){
  for(let i=0;i<120;i+=1){
    try{const response=await fetch(url);if(response.ok)return;}catch{}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:'+url);
}
function studyDay(){
  return new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Shanghai',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).format(new Date());
}
function median(rows){
  const sorted=[...rows].sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const mid=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[mid]:Number(((sorted[mid-1]+sorted[mid])/2).toFixed(1));
}
function summarize(rows){
  return {
    samples:rows.length,
    min_ms:Number(Math.min(...rows).toFixed(1)),
    median_ms:Number(median(rows).toFixed(1)),
    max_ms:Number(Math.max(...rows).toFixed(1))
  };
}
async function waitHome(page,expectNext=false){
  await page.locator('[data-exam-home]').waitFor({state:'attached'});
  if(expectNext){
    await page.waitForFunction(()=>{
      const node=document.querySelector('[data-exam-next]');
      return Boolean(node && node.getAttribute('href'));
    });
  }
}
async function homeReadyMetric(page,url,expectNext=false){
  const started=Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await waitHome(page,expectNext);
  return Date.now()-started;
}

const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),
  stdio:['ignore','pipe','pipe'],
  detached:process.platform!=='win32'
});

let browser;
try{
  await waitHttp(BASE+'/');
  browser=await chromium.launch({headless:true});

  const cold=[];
  for(let i=0;i<5;i+=1){
    const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
    const page=await ctx.newPage();
    cold.push(await homeReadyMetric(page,BASE+'/',false));
    await ctx.close();
  }

  const catalog=englishSessionCatalog();
  const row=catalog.find((item)=>item.task==='reading_a')||catalog[0];
  if(!row?.object_id||!row?.source_hash)throw new Error('ENGLISH_SESSION_CATALOG_EMPTY');

  const planned=[];
  const outbound=[];
  const back=[];
  for(let i=0;i<5;i+=1){
    const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
    const page=await ctx.newPage();
    const day=studyDay();
    const sessionId='perf-english-'+i;

    await page.addInitScript(({day,sessionId,row})=>{
      const generatedAt=new Date().toISOString();
      localStorage.setItem('kianos-english-session-instruction-v1',JSON.stringify({
        schema:'kianos.english.session-instruction.v1',
        session_id:sessionId,
        study_day:day,
        generated_at:generatedAt,
        current_step:0,
        steps:[{
          step_id:'e1',
          task:row.task,
          object_id:row.object_id,
          source_hash:row.source_hash,
          label:'perf exact task',
          note:'diagnostic only',
          params:{}
        }],
        return_policy:{on_finish:'english_home'}
      }));
      localStorage.setItem('kianos-exam-chat-plan-v1',JSON.stringify({
        schema:'kianos.exam.chat-plan.v1',
        study_day:day,
        generated_at:generatedAt,
        subjects:{
          xizong:null,
          english:{
            target_minutes:60,
            role:'当前主任务',
            note:'perf exact task',
            session_ref:sessionId
          },
          politics:null
        },
        next_subject:'english',
        attention:null
      }));
    },{day,sessionId,row});

    planned.push(await homeReadyMetric(page,BASE+'/',true));

    const href=await page.locator('[data-exam-next]').getAttribute('href');
    if(!href||!href.includes(row.object_id))throw new Error('HOME_DID_NOT_RESOLVE_EXACT_ENGLISH_WORKSPACE:'+String(href));

    const outStarted=Date.now();
    await page.locator('[data-exam-next]').click();
    await page.waitForFunction((objectId)=>window.location.pathname.includes(objectId),row.object_id);
    outbound.push(Date.now()-outStarted);

    const backStarted=Date.now();
    await page.goBack({waitUntil:'domcontentloaded'});
    await waitHome(page,true);
    back.push(Date.now()-backStarted);

    await ctx.close();
  }

  const report={
    schema:'kianos.home-runtime-latency-audit.v1',
    environment:'GitHub Actions Ubuntu headless Chromium; diagnostic, not Mac absolute latency',
    cold_home_ready:summarize(cold),
    planned_home_ready:summarize(planned),
    home_to_exact_english:summarize(outbound),
    exact_english_back_to_home:summarize(back),
    raw:{cold,planned,outbound,back},
    interpretation:[
      'Use this to detect gross current-main browser/runtime friction only.',
      'Do not treat CI milliseconds as Kian Mac wall-clock truth.',
      'Do not redesign architecture unless a material hot path is reproduced and localized.'
    ]
  };
  fs.writeFileSync(path.join(OUT,'home-runtime-latency.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{
  if(browser)await browser.close();
  if(server?.pid){
    try{process.kill(-server.pid,'SIGTERM');}
    catch{try{server.kill('SIGTERM');}catch{}}
  }
}
