// Bounded Steward composition proof. All browser and server state is disposable.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-steward-browser-'));
const port=4358, base=`http://127.0.0.1:${port}`;
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port)],{cwd:process.cwd(),detached:true,stdio:['ignore','ignore','pipe'],env:{...process.env,KIANOS_PRIVATE_DIR:temp,KIANOS_CONTROL_DIR:path.join(temp,'control'),KIANOS_PACKET_RELAY_ENABLED:'0',KIANOS_CONTROL_ENABLED:'0'}});
let browser,errors='';server.stderr.on('data',x=>errors+=x);
try {
  let ready=false;
  for(let n=0;n<120;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  assert.ok(ready,errors);
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
  const ctx=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai'});
  let receiptUp=false;
  await ctx.route('**/__kianos-private/**',async route=>{
    const req=route.request();
    if(req.url().endsWith('/receipt')&&receiptUp)return route.fulfill({status:200,json:{status:'saved',receipt:req.postDataJSON()}});
    return route.fulfill({status:req.method()==='GET'?404:503,json:{status:'missing'}});
  });
  const page=await ctx.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  const first=await page.evaluate(async()=>{
    const {buildDailyLearningPacket}=await import('/src/lib/dailyLearningPacket.mjs');
    const {applyPrivateControlCommand}=await import('/src/lib/privateControlRuntime.mjs');
    const {browserControlCommand}=await import('/src/lib/privateControlCommand.mjs');
    const packet=buildDailyLearningPacket({storage:localStorage});
    const plan={schema:'kianos.exam.chat-plan.v1',study_day:packet.study_day,generated_at:packet.generated_at,learner_evidence_basis:packet.learner_evidence_basis,subjects:{xizong:null,english:null,politics:null},next_subject:null,
      presentation:{today_tasks:['constructor','toString','__proto__'].map(id=>({id,label:id})),week_reference:[{id:'week',label:'采样中',progress_ratio:null}],schedule_blocks:[{id:'solo',start:'09:00',end:'10:00',label:'上午安排'}]}};
    const command=browserControlCommand({schema:'kianos.control-command.v1',command_id:'steward-first-001',study_day:packet.study_day,generated_at:packet.generated_at,operations:[{kind:'exam.chat_plan',payload:plan}]},{commandHash:'a'.repeat(64)});
    const result=await applyPrivateControlCommand(localStorage,command,{day:packet.study_day});
    return {command,result};
  });
  assert.equal(first.result.status,'applied');assert.equal(first.result.receipt_saved,false);
  for(const id of ['constructor','toString','__proto__'])assert.equal(await page.getByRole('checkbox',{name:`完成：${id}`,exact:true}).isChecked(),false);
  const proto=page.getByRole('checkbox',{name:'完成：__proto__',exact:true});await proto.check();
  assert.equal(await page.evaluate(day=>Object.hasOwn(JSON.parse(localStorage.getItem(`kianos-exam-home-task-checks-v1:${day}`)),'__proto__'),first.command.study_day),true);
  receiptUp=true;
  const retry=await page.evaluate(async command=>{
    const before=localStorage.getItem('kianos-exam-chat-plan-v1');
    const {applyPrivateControlCommand}=await import('/src/lib/privateControlRuntime.mjs');
    const result=await applyPrivateControlCommand(localStorage,command,{day:command.study_day});
    return {result,unchanged:before===localStorage.getItem('kianos-exam-chat-plan-v1')};
  },first.command);
  assert.equal(retry.result.status,'idempotent');assert.equal(retry.result.receipt_saved,true);assert.equal(retry.unchanged,true);
  const revised=await page.evaluate(async previous=>{
    const {buildDailyLearningPacket}=await import('/src/lib/dailyLearningPacket.mjs');
    const {applyPrivateControlCommand}=await import('/src/lib/privateControlRuntime.mjs');
    const p=buildDailyLearningPacket({storage:localStorage});
    const c=structuredClone(previous);c.command_id='steward-correction-002';c.command_hash='b'.repeat(64);c.generated_at=new Date(Date.parse(previous.generated_at)+1).toISOString();
    const plan=c.operations[0].payload;plan.generated_at=c.generated_at;plan.learner_evidence_basis=p.learner_evidence_basis;plan.presentation.schedule_blocks=[{id:'solo',start:'14:00',end:'15:00',label:'更正后的安排'}];
    await applyPrivateControlCommand(localStorage,c,{day:p.study_day});
    let rejected=false;try{await applyPrivateControlCommand(localStorage,{...previous,command_id:'late-other-chat-001'},{day:p.study_day});}catch(e){rejected=/OLDER_COMMAND/.test(e.message);}
    return {command:c,rejected};
  },first.command);
  assert.equal(revised.rejected,true);
  await page.reload();await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  assert.equal(await page.getByRole('checkbox',{name:'完成：__proto__',exact:true}).isChecked(),true);
  const recovered=await page.evaluate(()=>({plan:JSON.parse(localStorage.getItem('kianos-exam-chat-plan-v1')),receipt:JSON.parse(localStorage.getItem('kianos-control-receipt-v1'))}));
  assert.equal(recovered.plan.presentation.schedule_blocks[0].label,'更正后的安排');
  assert.equal(recovered.receipt.command_id,revised.command.command_id);
  await page.getByRole('checkbox',{name:'完成：__proto__',exact:true}).uncheck();
  const out=path.resolve('output/playwright');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'steward-bounded-home.png'),fullPage:true});
  console.log('PASS Steward browser: first Packet-plan apply; reserved IDs unchecked/check/uncheck; lost receipt retry without replay; noon replacement; late other-Chat command rejected; reload preserves correction and receipt. Synthetic decisions, not live Chat/Health/Calendar proof.');
} finally {
  await browser?.close();try{process.kill(-server.pid,'SIGTERM');}catch{}
  fs.rmSync(temp,{recursive:true,force:true});
}
