import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
import {isolatedCandidateEnv,assertCandidatePortAvailable} from './kianos-candidate-runtime.mjs';
const day='2026-09-30',base='http://127.0.0.1:4322',tmp=fs.mkdtempSync(path.join(os.tmpdir(),'batch-home-reference-'));
const checks=[],errors=[];let browser,server,log='';
const check=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail});
try{
 await assertCandidatePortAvailable({host:'127.0.0.1',port:4322});
 server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port','4322'],{cwd:process.cwd(),env:isolatedCandidateEnv(tmp),detached:true,stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',x=>log+=x);server.stderr.on('data',x=>log+=x);
 for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}if(i===99)throw Error('candidate not ready');await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.KIANOS_TEST_CHROME||chromium.executablePath()});
 const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai',locale:'zh-CN'});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date(day+'T08:33:00+08:00'));
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.ready==='true');
 await page.evaluate(async(day)=>{
  const p=await import('/src/lib/examChatPlan.mjs');const t=await import('/src/lib/studyTimer.mjs');
  t.resumeStudyTimer(localStorage,{subject:'xizong',route:'/xizong/',detailKey:'circulation',detailLabel:'循环系统'},Date.now());
  p.writeExamChatPlan(localStorage,{schema:p.EXAM_CHAT_PLAN_SCHEMA,study_day:day,generated_at:new Date(Date.now()-1000).toISOString(),learner_evidence_basis:p.buildExamChatPlanBasis(localStorage,day),subjects:{xizong:{target_minutes:null,role:'主线'},english:null,politics:null},next_subject:'xizong',attention:null,capacity:{state:'UNCERTAIN',summary:'合成：按全天计划，有变化再调整'},presentation:{today_tasks:[{id:'a',subject:'xizong',label:'西综真实主线'},{id:'b',subject:'english',label:'英语完整任务'}],week_reference:[{id:'w',subject:null,label:'本周参考'}],schedule_blocks:[{id:'am',start:'08:45',end:'10:00',subject:'xizong',label:'上午主块'},{id:'noon',start:'12:00',end:'13:30',subject:null,label:'午饭与休息'},{id:'pm',start:'14:00',end:'15:00',subject:'english',label:'英语'},{id:'eve',start:'20:00',end:'22:00',subject:null,label:'晚间自由'}]}},day);
  window.dispatchEvent(new Event('kianos:control-command-applied'));
 },day);await page.waitForTimeout(250);
 check('fresh tasks visible',await page.locator('[data-exam-tasks] .examTaskRow').count()===2);
 await page.clock.setFixedTime(new Date(day+'T08:34:00+08:00'));
 await page.evaluate(async()=>{const t=await import('/src/lib/studyTimer.mjs');t.pauseStudyTimer(localStorage,Date.now());window.dispatchEvent(new Event('kianos:study-timer-change'));});await page.waitForTimeout(250);
 const state=await page.evaluate(async(day)=>{const p=await import('/src/lib/examChatPlan.mjs');return{strict:p.readExamChatPlan(localStorage,day).status,display:p.readExamChatPlanForDisplay(localStorage,day).status,model:document.querySelector('[data-exam-home]').__kianosExamPlanReadModel};},day);
 check('pause keeps strict execution stale',state.strict==='stale',state.strict);
 check('same-day adopted reference exists',state.display==='reference',state.display);
 check('Home retains today tasks after pause',await page.locator('[data-exam-tasks] .examTaskRow').count()===2);
 check('Home retains week reference after pause',await page.locator('[data-exam-week-rows]').innerText().then(t=>t.includes('本周参考')));
 check('Home keeps all scheduled windows',await page.locator('.homeL3ScheduleBlock').count()===4);
 const visibleAttention=await page.locator('[data-exam-attention]').isVisible()?await page.locator('[data-exam-attention-text]').innerText():'';
 check('ordinary pause does not demand replan',!/请让\s*Chat\s*更新|返回\s*Chat\s*重排/.test(visibleAttention),visibleAttention);
 check('reference never revives fresh capacity',state.model?.capacity?.judgment==null);
 await page.screenshot({path:path.join(tmp,'home-reference.png'),fullPage:false});
 await page.goto(base+'/steward/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.KianOSStudyTimer);await page.waitForTimeout(250);
 check('Steward retains evening',await page.locator('[data-steward-timeline]').innerText().then(t=>t.includes('晚间自由')));
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('[data-exam-home]')?.dataset.ready==='true');
 await page.evaluate(()=>{localStorage.setItem('kianos-exam-chat-plan-v1','{broken');window.dispatchEvent(new Event('kianos:control-command-applied'));});await page.waitForTimeout(250);
 check('corrupt plan has no reference fallback',await page.locator('[data-exam-tasks] .examTaskRow').count()===0&&await page.locator('.homeL3ScheduleBlock').count()===0);
 check('no browser exceptions',errors.length===0,errors);
}catch(e){checks.push({name:'runner',pass:false,detail:String(e.stack||e)});}
finally{await browser?.close();if(server)try{process.kill(-server.pid,'SIGTERM');}catch{}await new Promise(r=>setTimeout(r,200));fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify({synthetic:true,platform:process.platform,checks,errors},null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
