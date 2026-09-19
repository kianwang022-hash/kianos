import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4343;
const BASE = `http://127.0.0.1:${PORT}`;
const reportPath = path.resolve(process.cwd(), '.qa/xizong-chat-session-browser.json');
const report = {
  schema: 'kianos.xizong.chat_session_browser.v1',
  started_at: new Date().toISOString(),
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CHAT_SESSION_BROWSER_FAIL:${name}${detail ? ':' + detail : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const studyDay = () => new Intl.DateTimeFormat('en-CA', {
  timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit'
}).format(new Date());

async function waitForHttp(url, attempts = 120) {
  for (let i=0;i<attempts;i+=1) {
    try { const response=await fetch(url); if(response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error('HTTP_NOT_READY:' + url);
}

const server = spawn('npm', ['run','preview','--','--host','127.0.0.1','--port',String(PORT)], {
  cwd:process.cwd(), stdio:['ignore','pipe','pipe'], detached:process.platform!=='win32'
});
let browser;

try {
  await waitForHttp(`${BASE}/xizong/`);
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1512,height:982}});
  await page.goto(`${BASE}/xizong/`,{waitUntil:'networkidle'});

  const day=studyDay();
  const generatedAt=new Date().toISOString();
  const sessionId='browser-chat-session';
  const memoryKey='kianos-xizong-memory-v1';
  const sessionKey='kianos:xizong:session-instruction:v1';
  const runtimeKey='kianos:xizong:session-runtime:v1';
  const chatSetKey='kianos:xizong:chat-set:v1';
  const cardId='core:circulation-b01-kp01';

  await page.evaluate(({day,generatedAt,sessionId,memoryKey,sessionKey,runtimeKey,chatSetKey,cardId})=>{
    for(const key of Object.keys(localStorage)) {
      if(key.includes('xizong')) localStorage.removeItem(key);
    }
    localStorage.setItem(memoryKey,JSON.stringify({
      schema:'kianos.xizong.memory.v1',
      revision:1,
      releasedBlocks:{
        'circulation-b01':{
          blockId:'circulation-b01',systemId:'circulation',canonicalId:'A1',
          blockLabel:'B1',blockTitle:'循环 browser fixture',sourceHash:'session-source-v1',
          releasedAt:generatedAt,refreshedAt:generatedAt,
          coreCardIds:[cardId],precisionCardIds:[]
        }
      },
      cards:{
        [cardId]:{
          id:cardId,family:'CORE',systemId:'circulation',canonicalId:'A1',
          blockId:'circulation-b01',blockLabel:'B1',blockTitle:'循环 browser fixture',
          logicGroupId:'circulation-b01-lg01',groupLabel:'测试学习节',
          kpId:'circulation-b01-kp01',displayId:'KP01',title:'Chat Session Memory',
          promptCanonical:'先恢复这个测试 Core',coreHtml:'<p>Chat Session browser fixture Core.</p>',
          sourceLocator:'P1',sourceHash:'session-source-v1',releasedAt:generatedAt
        }
      },
      promptOverrides:{},marks:{},evidence:[],attention:{},repairTasks:[]
    }));
    localStorage.setItem(sessionKey,JSON.stringify({
      schema:'kianos.xizong.session-instruction.v1',
      session_id:sessionId,
      study_day:day,
      generated_at:generatedAt,
      current_step:0,
      steps:[
        {
          step_id:'m1',kind:'MEMORY_REVIEW',label:'先回收一个核心机制',
          reason:'验证一次延迟恢复',
          targets:[{card_id:cardId,source_hash:'session-source-v1'}]
        },
        {
          step_id:'q1',kind:'PRACTICE_SET',label:'再做一道迁移题',
          reason:'看能不能在题目里调用',
          question_ids:['xizong-official-2024-n001'],
          study_phase:'SECOND_PASS',speed:'normal',allow_holdout:false
        }
      ]
    }));
    localStorage.removeItem(runtimeKey);
    localStorage.removeItem(chatSetKey);
  },{day,generatedAt,sessionId,memoryKey,sessionKey,runtimeKey,chatSetKey,cardId});

  await page.reload({waitUntil:'networkidle'});
  check((await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 安排'),
    'home_chat_session_overrides_native_resume');
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('回收'),
    'home_names_current_chat_step');
  const memoryHref=await page.locator('[data-xizong-continue]').getAttribute('href');
  check(memoryHref?.includes('/xizong/memory/?session='),'home_points_to_exact_memory_session',memoryHref||'');

  const runtimeAfterHome=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),runtimeKey);
  check(runtimeAfterHome?.activated_steps?.includes('m1'),'home_activates_current_memory_step');
  const memoryBefore=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),memoryKey);
  check(!memoryBefore?.attention?.[cardId],
    'chat_memory_selection_does_not_create_weak_attention');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForLoadState('networkidle');
  check((await page.locator('[data-memory-view-title]').textContent()||'').includes('Chat 安排'),
    'memory_renders_chat_selected_view');
  check((await page.locator('[data-memory-queue-count]').textContent()||'').trim()==='1',
    'memory_chat_view_has_exact_selected_card_count');
  check((await page.locator('[data-memory-summary-today]').textContent()||'').trim()==='0',
    'chat_selection_does_not_pollute_today_before_evidence');
  check(await page.locator('[data-memory-review-request]').isHidden(),
    'manual_today_control_hidden_in_chat_view');

  await page.keyboard.press('Space');
  check(await page.locator('[data-memory-answer]').isVisible(),'chat_memory_uses_native_reveal');
  await page.locator('[data-memory-rating="fuzzy"]').click();
  const memoryAfter=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),memoryKey);
  check(memoryAfter?.evidence?.length===1,'chat_memory_creates_one_real_memory_event');
  check(memoryAfter?.evidence?.[0]?.rating==='fuzzy','chat_memory_preserves_real_fuzzy_result');
  check(memoryAfter?.attention?.[cardId]?.reviewRequested===true,
    'only_real_fuzzy_evidence_may_enter_existing_weak_attention');

  await page.goto(`${BASE}/xizong/`,{waitUntil:'networkidle'});
  check((await page.locator('[data-xizong-continue-title]').textContent()||'').includes('迁移题'),
    'home_advances_to_practice_after_memory_evidence');
  const practiceHref=await page.locator('[data-xizong-continue]').getAttribute('href');
  check(practiceHref?.includes('/xizong/practice/chat-set/'),'home_points_to_native_chat_set',practiceHref||'');

  const chatSet=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),chatSetKey);
  check(chatSet?.question_ids?.length===1 && chatSet.question_ids[0]==='xizong-official-2024-n001',
    'practice_step_projects_exact_native_chat_set');

  await page.locator('[data-xizong-continue]').click();
  await page.waitForLoadState('networkidle');
  const card=page.locator('[data-question-card]:visible');
  check(await card.count()===1,'native_practice_question_visible');
  const firstOption=card.locator('[data-question-options] button').first();
  check(await firstOption.count()===1,'native_practice_option_available');
  await firstOption.click();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(180);

  const sweepKey=`kianos:xizong:chat-set-question-sweep:chat-set:${sessionId}:q1:v1`;
  const sweep=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  check(Array.isArray(sweep?.attemptHistory) && sweep.attemptHistory.some((row)=>row.question_id==='xizong-official-2024-n001'),
    'native_practice_creates_real_attempt_evidence');

  await page.goto(`${BASE}/xizong/`,{waitUntil:'networkidle'});
  check(!(await page.locator('[data-xizong-continue-location]').textContent()||'').includes('Chat 安排'),
    'completed_chat_session_releases_home_back_to_native_resume');

  report.status='PASS';
  report.completed_at=new Date().toISOString();
  report.checks_count=report.checks.length;
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(`XIZONG_CHAT_SESSION_BROWSER PASS | checks=${report.checks.length}`);
} catch(error) {
  report.status='FAIL';
  report.completed_at=new Date().toISOString();
  report.error=String(error?.stack||error);
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if(process.platform==='win32') server.kill();
    else process.kill(-server.pid,'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
