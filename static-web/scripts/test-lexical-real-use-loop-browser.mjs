import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE='http://127.0.0.1:4321';
const OUT=path.resolve(process.cwd(),'../lexical-real-use-loop-audit');
fs.mkdirSync(OUT,{recursive:true});
const checks=[];
const check=(ok,name,detail='')=>{checks.push({name,ok:Boolean(ok),detail:String(detail||'')});if(!ok)throw new Error(`LEXICAL_REAL_USE_LOOP_FAIL:${name}:${detail}`)};
const sleep=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4321'],{cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'});
let serverLog='';
server.stdout?.on('data',(c)=>{serverLog+=String(c)});
server.stderr?.on('data',(c)=>{serverLog+=String(c)});
async function waitForServer(){for(let i=0;i<100;i+=1){try{const r=await fetch(`${BASE}/vocabulary/`);if(r.ok)return}catch{}await sleep(120)}throw new Error('preview not ready '+serverLog.slice(-1200))}
const goto=async(page,route)=>{await page.goto(`${BASE}${route}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(100)};
const visibleText=async(page)=>String(await page.locator('body').innerText()||'');
const forbidden=/Copy Return Packet|Final Learner Object|event identity|lexical evidence|手动载入\s*\/\s*调试|Paste Challenge Packet|sha256:|Canonical projection|Search all Current Words|Current 词库|导出学习数据 JSON/i;
const assertNoEngineering=async(page,name)=>{
  const text=await visibleText(page);
  check(!forbidden.test(text),name,text.match(forbidden)?.[0]||'');
};

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();

  await goto(page,'/vocabulary/');
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(100);
  check(await page.locator('.kianosCurrentDock').isHidden(),'vocabulary_hides_engineering_current_dock');
  await assertNoEngineering(page,'overview_has_no_engineering_copy');

  await page.locator('[data-lexical-settings-open]').click();
  await assertNoEngineering(page,'settings_has_no_engineering_copy');
  await page.locator('.lexicalSettingsClose').click();

  await page.locator('[data-lexical-tab="research"]').click();
  await assertNoEngineering(page,'research_has_no_engineering_copy');
  await page.locator('[data-lexical-tab="overview"]').click();

  // Fuzzy is today-only whole-card routing support, not Repair debt.
  await goto(page,'/vocabulary/4/');
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-route="fuzzy"]').click();
  await page.waitForURL(/\/vocabulary\/5\/?$/);
  await goto(page,'/vocabulary/');
  check((await page.locator('[data-lexical-same-day-count]').innerText()).trim()==='1','fuzzy_enters_same_day_revisit');
  check((await page.locator('[data-lexical-repair-count]').first().innerText()).trim()==='0','fuzzy_creates_no_repair');

  // Exact local + creates one Repair target and makes the Chat state handoff available.
  await goto(page,'/vocabulary/4/');
  if(!(await page.locator('[data-vocab-details]').isVisible()))await page.locator('[data-vocab-reveal]').click();
  const root=page.locator('[data-local-port="vocabulary"]');
  const plus=page.locator('[data-vocab-repair]').first();
  const targetId=await plus.getAttribute('data-target-id');
  const target={
    word_id:await root.getAttribute('data-vocab-object'),
    ordinal:Number(await root.getAttribute('data-vocab-ordinal')),
    word:await root.getAttribute('data-vocab-word'),
    target_kind:await plus.getAttribute('data-target-kind'),
    target_id:targetId||null,
    target_locator:(await plus.getAttribute('data-target-locator'))||null,
    target_revision:targetId?null:await root.getAttribute('data-vocab-source-hash')
  };
  await plus.click();
  await goto(page,'/vocabulary/');
  check((await page.locator('[data-lexical-repair-count]').first().innerText()).trim()==='1','local_plus_projects_one_repair');
  check(await page.locator('[data-lexical-handoff]').isVisible(),'chat_state_handoff_visible_after_learning');
  check((await page.locator('[data-lexical-copy-return]').innerText()).includes('学习状态'),'chat_handoff_is_user_facing');
  await page.locator('[data-lexical-copy-return]').click();
  const copiedState=JSON.parse(await page.evaluate(()=>navigator.clipboard.readText()));
  check(copiedState?.schema==='kianos.lexical.chat_state.v1','copied_state_uses_chat_schema',copiedState?.schema||'');
  check(copiedState?.coverage?.cursor?.ordinal===4,'copied_state_keeps_coverage_cursor',JSON.stringify(copiedState?.coverage?.cursor||null));
  check(copiedState?.routing?.same_day_revisit?.length===1,'copied_state_keeps_same_day_revisit');
  check(copiedState?.repair?.active_target_count===1,'copied_state_keeps_exact_repair');
  check(typeof copiedState?.chat_instruction==='string'&&copiedState.chat_instruction.includes('Coverage as traversal'),'copied_state_carries_interpretation_contract');
  await assertNoEngineering(page,'home_handoff_has_no_engineering_copy');

  // Repair waiting uses learner-facing Chat transport; debug transport stays hidden.
  await page.locator('[data-lexical-tab="repair"]').click();
  check(await page.locator('[data-challenge-chat-load-button]').isVisible(),'repair_exposes_load_chat_practice');
  check(await page.locator('[data-challenge-manual-tools]').isHidden(),'debug_transport_hidden_in_normal_use');
  await assertNoEngineering(page,'repair_waiting_has_no_engineering_copy');
  await page.screenshot({path:path.join(OUT,'vocabulary-repair-chat-load-1440x900.png'),fullPage:false});

  const challenge={
    schema:'kianos.lexical.challenge_packet.v1',
    study_day:'2099-09-18',
    generated_at:'2099-09-18T08:00:00Z',
    challenges:[{
      challenge_id:'real-use-loop-1',
      ...target,
      source_evidence:'学习中标记 +',
      demand:'discrimination',
      question_type:'spatial_choice',
      stem:'哪个选项最符合当前要修的这个词义边界？',
      options:[{key:'left',text:'左侧干扰项'},{key:'right',text:'正确选项'}],
      correct_key:'right',
      repair:'只修当前局部边界，不重新学习整张词卡。',
      reconstruction:{
        stem:'换一个语境，再判断一次同一个局部边界。',
        options:[{key:'left',text:'干扰项'},{key:'right',text:'正确项'}],
        correct_key:'right'
      }
    }]
  };
  await page.locator('[data-challenge-chat-load-button]').click();
  await page.locator('[data-challenge-chat-paste-input]').fill(JSON.stringify(challenge));
  await page.locator('[data-challenge-chat-paste-start]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({state:'visible'});
  check((await page.locator('[data-challenge-word]').innerText()).trim()===target.word,'chat_practice_targets_exact_word');
  await page.locator('[data-challenge-choice="left"]').click();
  check((await page.locator('[data-challenge-feedback]').innerText()).includes('只修当前局部边界'),'wrong_shows_minimum_repair');
  await page.locator('[data-challenge-continue]').click();
  check((await page.locator('[data-challenge-progress]').innerText()).includes('Reconstruct'),'wrong_enters_reconstruction');
  await page.locator('[data-challenge-choice="right"]').click();
  await page.locator('[data-challenge-continue]').click();
  await page.locator('[data-challenge-complete-panel]').waitFor({state:'visible'});
  await assertNoEngineering(page,'repair_active_has_no_engineering_copy');

  const ledger=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-lexical-evidence-ledger-v2')||'null'));
  check(ledger?.events?.some((e)=>e.challenge_id==='real-use-loop-1'&&e.outcome==='WRONG'),'challenge_wrong_written_to_evidence');
  check(ledger?.events?.some((e)=>e.challenge_id==='real-use-loop-1'&&e.source==='reconstruction'&&e.outcome==='CORRECT'),'reconstruction_written_to_evidence');

  await page.screenshot({path:path.join(OUT,'vocabulary-real-use-loop-final.png'),fullPage:false});
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({status:'PASS',checks},null,2));
  console.log(JSON.stringify({status:'PASS',checks:checks.length}));
  await context.close();
}catch(error){
  fs.writeFileSync(path.join(OUT,'failure.json'),JSON.stringify({status:'FAIL',error:String(error?.stack||error),checks,serverLog},null,2));
  throw error;
}finally{
  if(browser)await browser.close();
  if(process.platform!=='win32'&&server.pid){try{process.kill(-server.pid,'SIGTERM')}catch{}}
  else{try{server.kill('SIGTERM')}catch{}}
  await Promise.race([new Promise((resolve)=>server.once('exit',resolve)),sleep(800)]);
  if(server.exitCode===null){
    if(process.platform!=='win32'&&server.pid){try{process.kill(-server.pid,'SIGKILL')}catch{}}
    else{try{server.kill('SIGKILL')}catch{}}
  }
}
