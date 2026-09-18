import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';

const PORT = 4421;
const BASE = `http://127.0.0.1:${PORT}`;
const DAY = '2026-09-16';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const questions = catalog.questions.filter((q) => q.unitKey).slice(0, 3);
assert.equal(questions.length, 3, 'fixture requires three Current Politics questions');

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(`${BASE}/politics/`)).ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_HOME_ATTENTION_PREVIEW_NOT_READY');
}
function attemptsFixture(rows) {
  const units = {};
  for (const [q, outcome] of rows) {
    units[q.unitKey] ||= { attempts: {} };
    units[q.unitKey].attempts[q.id] = { question_id:q.id, outcome, study_day:DAY, selected:outcome==='WRONG'?'A':q.answer };
  }
  return { units };
}
function evidenceFixture(rows) {
  return rows.map(([q,outcome],index)=>({subject:q.subject,chapter:q.chapter,unit_id:q.unitId,question_id:q.id,source:'xiao1000',outcome,study_day:DAY,observed_at:`2026-09-16T10:0${index}:00.000Z`}));
}

const server = spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(PORT)],{cwd:process.cwd(),stdio:'ignore',detached:process.platform!=='win32'});
let browser;
try {
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Shanghai'});
  await context.addInitScript(() => {
    const NativeDate=Date;
    const offset=NativeDate.parse('2026-09-16T10:00:00+08:00')-NativeDate.now();
    class FixtureDate extends NativeDate { constructor(...args){super(...(args.length?args:[NativeDate.now()+offset]));} static now(){return NativeDate.now()+offset;} }
    window.Date=FixtureDate;
  });
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',(e)=>pageErrors.push(e.message));

  await page.goto(`${BASE}/politics/`,{waitUntil:'networkidle'});
  const tools=page.locator('[data-politics-home-tools]');
  await tools.waitFor({state:'visible'});
  assert.equal(await page.locator('[data-politics-copy-handoff]').count(),0);
  assert.equal(await page.locator('[data-politics-handoff]').count(),0);
  assert.equal(await page.locator('[data-politics-continue]').isVisible(),true);
  assert.match(await page.locator('[data-politics-today-quiet]').innerText(),/还没有做题记录/);
  console.log('PASS cold Home keeps Continue primary and has no Chat-export ritual');

  const [wrongQ,uncertainQ,stableDiscussionQ]=questions;
  const attemptRows=[[wrongQ,'WRONG'],[uncertainQ,'UNCERTAIN'],[stableDiscussionQ,'STABLE']];
  await page.evaluate(({K,attempts,evidence,wrongId,uncertainId,discussionId})=>{
    localStorage.setItem(K.attempts,JSON.stringify(attempts));
    localStorage.setItem(K.meta,JSON.stringify({latestOutcome:{[wrongId]:'WRONG',[uncertainId]:'UNCERTAIN',[discussionId]:'STABLE'},discussion:{[discussionId]:true}}));
    localStorage.setItem(K.evidence,JSON.stringify(evidence));
  },{K,attempts:attemptsFixture(attemptRows),evidence:evidenceFixture(attemptRows),wrongId:wrongQ.id,uncertainId:uncertainQ.id,discussionId:stableDiscussionQ.id});
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-politics-today-wrong]').innerText(),'1');
  assert.equal(await page.locator('[data-politics-today-uncertain]').innerText(),'1');
  assert.match(await page.locator('[data-politics-review-entry]').innerText(),/3 题/);
  assert.match(await page.locator('[data-politics-today-quiet]').innerText(),/2 题值得回看/);
  assert.match(await page.locator('[data-politics-today-quiet]').innerText(),/复习.*一次性导出学习包/);
  assert.equal(await page.locator('[data-politics-copy-handoff]').count(),0);
  console.log('PASS Home summarizes W/U but leaves packet export to Review');

  await page.evaluate(({K,wrongId,uncertainId,discussionId})=>{
    const meta=JSON.parse(localStorage.getItem(K.meta));
    meta.latestOutcome[wrongId]='STABLE';meta.latestOutcome[uncertainId]='STABLE';meta.discussion[discussionId]=true;
    localStorage.setItem(K.meta,JSON.stringify(meta));
  },{K,wrongId:wrongQ.id,uncertainId:uncertainQ.id,discussionId:stableDiscussionQ.id});
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-politics-today-wrong]').innerText(),'0');
  assert.equal(await page.locator('[data-politics-today-uncertain]').innerText(),'0');
  assert.match(await page.locator('[data-politics-review-entry]').innerText(),/1 题/);
  assert.match(await page.locator('[data-politics-today-quiet]').innerText(),/没有待处理/);
  console.log('PASS stable correction clears W/U attention without erasing discussion Review');

  const corruptContext=await browser.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Shanghai',storageState:{cookies:[],origins:[{origin:BASE,localStorage:[{name:K.attempts,value:'{'}]}]}});
  const corruptPage=await corruptContext.newPage();const corruptErrors=[];corruptPage.on('pageerror',(e)=>corruptErrors.push(e.message));
  await corruptPage.goto(`${BASE}/politics/`,{waitUntil:'networkidle'});
  assert.match(await corruptPage.locator('[data-politics-today-quiet]').innerText(),/未能完整读取/);
  assert.match(await corruptPage.locator('[data-politics-continue-meta]').innerText(),/未能完整读取/);
  assert.equal(await corruptPage.locator('[data-politics-copy-handoff]').count(),0);
  assert.deepEqual(corruptErrors,[]);
  await corruptContext.close();
  console.log('PASS corrupt storage fails closed without manufacturing Chat handoff');

  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(pageErrors,[]);
  console.log('POLITICS_HOME_ATTENTION_PASS');
  await context.close();
} finally {
  if(browser) await browser.close();
  try { if(process.platform!=='win32'&&server.pid) process.kill(-server.pid,'SIGTERM'); else server.kill('SIGTERM'); }
  catch { try{server.kill('SIGKILL')}catch{} }
}
