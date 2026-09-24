import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';

const subject = String(process.env.POLITICS_SUBJECT || '').trim();
const allowed = ['marxism','history','mao','xi','ethics_law'];
if (!allowed.includes(subject)) throw new Error(`POLITICS_SUBJECT_WORKBENCH_INVALID_SUBJECT:${subject}`);
const port = 4351 + allowed.indexOf(subject);
const BASE = `http://127.0.0.1:${port}`;
const out = path.resolve(process.cwd(), `../politics-${subject}-workbench-audit`);
fs.mkdirSync(out, { recursive: true });
const report = { schema: 'kianos.politics.subject_workbench_journey.v1', subject, checks: [] };
const check = (ok, name, detail = '') => {
  if (!ok) throw new Error(`POLITICS_SUBJECT_WORKBENCH_FAIL:${subject}:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const q = catalog.questions.find((row) => row.subject === subject && row.unitKey);
if (!q) throw new Error(`POLITICS_SUBJECT_WORKBENCH_NO_QUESTION:${subject}`);

async function waitForServer() {
  for (let i=0;i<100;i+=1) {
    try { if ((await fetch(`${BASE}/politics/`)).ok) return; } catch {}
    await sleep(150);
  }
  throw new Error('server not ready');
}

const server = spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ viewport:{ width:1512, height:982 } });
  const page = await context.newPage();

  const unitUrl = new URL(q.unitHref, BASE);
  await page.goto(unitUrl.href,{waitUntil:'domcontentloaded'});
  check(await page.locator('[data-politics-question]').count() === 0,'learning_surface_has_no_inline_attempt');
  const entry = page.locator(`[data-practice-unit-entry="${q.unitKey}"]`);
  await entry.waitFor({state:'visible'});
  check(String(await entry.getAttribute('href')).includes('/politics/practice/?unit='),'exact_unit_entry_present');

  await page.goto(`${BASE}/politics/practice/?unit=${encodeURIComponent(q.unitKey)}&question=${encodeURIComponent(q.id)}`,{waitUntil:'domcontentloaded'});
  await page.check('[data-learned-scope]');
  await page.click('[data-start-session]');
  await page.locator('[data-question-card]').waitFor({state:'visible'});
  await page.click('[data-uncertain]');
  for (const label of String(q.answer)) await page.click(`[data-option="${label}"]`);
  await page.click('[data-submit]');
  await page.locator('[data-submitted-result]').waitFor({state:'visible'});

  const state = await page.evaluate((K) => ({
    attempts: JSON.parse(localStorage.getItem(K.attempts)||'{"units":{}}'),
    evidence: JSON.parse(localStorage.getItem(K.evidence)||'[]')
  }), K);
  const attempt = state.attempts?.units?.[q.unitKey]?.attempts?.[q.id];
  check(attempt?.outcome === 'UNCERTAIN','formal_workbench_writes_first_attempt',JSON.stringify(attempt));
  check(state.evidence.some((e)=>e.question_id===q.id && e.outcome==='UNCERTAIN'),'formal_workbench_writes_problem_evidence');
  check((await page.locator('[data-takeaway]').innerText()).trim().length>0,'backside_takeaway_present');
  check((await page.locator('[data-chat-explanation]').innerText()).trim().length>0,'backside_refined_explanation_present');

  await page.goto(`${BASE}/politics/review/`,{waitUntil:'domcontentloaded'});
  await page.locator('[data-politics-review][data-ready="true"]').waitFor({state:'visible'});
  check(await page.locator(`[data-review-question="${q.id}"]`).count()===1,'review_reads_same_evidence');

  report.status='PASS';report.question_id=q.id;report.unit_key=q.unitKey;
  fs.writeFileSync(path.join(out,'journey.json'),JSON.stringify(report,null,2));
  console.log(`POLITICS_SUBJECT_WORKBENCH_PASS ${subject}`);
  await context.close();
} catch (e) {
  report.status='FAIL';report.error=String(e?.stack||e);
  fs.writeFileSync(path.join(out,'journey.json'),JSON.stringify(report,null,2));
  console.error(e);process.exitCode=1;
} finally {
  await browser?.close().catch(()=>{});
  if(process.platform!=='win32'&&server.pid){try{process.kill(-server.pid,'SIGTERM')}catch{}}
  else {try{server.kill('SIGTERM')}catch{}}
  server.stdout?.destroy();server.stderr?.destroy();
}
