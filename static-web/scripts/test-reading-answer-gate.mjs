import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {loadReadingById, loadReadingAnswersById} from '../src/lib/englishReadingSourceTruth.mjs';
import {terminateProcessTree} from './currentRelease.mjs';

// This already-exposed passage reproduces a real missing-key failure. All
// attempt data below is synthetic and stays in a disposable private runtime.
const id = 'english1-2001-reading-a-text3';
const key = `kianos-reading-attempt-v1:${id}`;
const reading = loadReadingById(id);
const payload = loadReadingAnswersById(id);
assert.equal(reading.sourceHashes.renderedObject, 'eed1f6503db6ac47056bef40f8cec04e8a868ff073e5825c46bc2eaa6d8326b7',
  'answer-only repair must preserve the source identity of existing attempts');
assert.deepEqual(Object.values(payload.answers), ['B','D','C','A']);
assert(reading.questions.every(question => !Object.hasOwn(question, 'answer')));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-reading-answer-gate-'));
const port = Number(process.env.KIANOS_READING_GATE_TEST_PORT || 4494);
assert(![4321,4322].includes(port));
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)], {
  cwd:process.cwd(), detached:true, stdio:['ignore','pipe','pipe'],
  env:{...process.env,KIANOS_ASTRO_RUNTIME_ROOT:temp,KIANOS_CONTROL_ENABLED:'0',KIANOS_PACKET_RELAY_ENABLED:'0'}
});
let logs = '';
server.stdout.on('data', chunk => logs += chunk);
server.stderr.on('data', chunk => logs += chunk);
let browser;
try {
  for (let i=0;;i++) {
    try { if ((await fetch(`${base}/reading/${id}/`)).ok) break; } catch {}
    if (server.exitCode !== null || i>100) throw new Error(logs.slice(-2000));
    await new Promise(resolve => setTimeout(resolve,250));
  }
  browser = await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let answerRequests = 0;
  page.on('request', request => {if(request.url().includes('/reading-answer/'))answerRequests++;});
  await page.goto(`${base}/reading/${id}/`);
  const root = page.locator('[data-local-port="reading"]');
  const rows = root.locator('[data-question]');
  await rows.first().waitFor();
  await page.waitForFunction(k => Boolean(JSON.parse(localStorage.getItem(k)||'null')?.binding),key);
  assert.equal(answerRequests,0,'first load must not request protected answers');
  const getAttempt = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)),key);
  const choices = ['A','C','B','D'];
  for (let i=0;i<choices.length;i++)await rows.nth(i).locator(`[data-option="${choices[i]}"]`).click();
  await rows.nth(2).locator('.portedUncertain').click();
  const paragraph = root.locator('[data-reading-passage] p').first();
  await paragraph.evaluate(element => {
    const range=document.createRange();range.setStart(element.firstChild,0);range.setEnd(element.firstChild,20);
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    element.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
  });
  await page.locator('[data-selection-chat]').click();
  const before = await getAttempt();
  assert(before.discussionSpans.length>0,'preservation fixture includes a native highlight');
  await page.reload();
  await page.waitForFunction(k=>Boolean(JSON.parse(localStorage.getItem(k)||'null')?.answers),key);
  assert.equal(answerRequests,0,'restored unsubmitted attempt must not request answers');
  const assertPreserved = async () => {
    const state=await getAttempt();
    for(const field of ['answers','uncertain','trajectory','startedAt','discussionSpans'])assert.deepEqual(state[field],before[field],field);
    assert.equal(state.binding.attempt_id,before.binding.attempt_id);
    assert.equal(state.binding.source_hash,before.binding.source_hash);
    assert.equal(state.submitted,false);
    assert.deepEqual(state.results,{});
    assert.deepEqual(state.history,[]);
    assert.equal(state.firstEvidenceMeta,undefined);
    assert(await rows.evaluateAll(elements=>elements.every(row=>!JSON.parse(row.getAttribute('data-answer')||'""'))),
      'failed key validation must not partially apply answers');
  };
  const routePattern='**/reading-answer/**';
  await page.route(routePattern,route=>route.fulfill({json:{...payload,answers:{...payload.answers,[reading.questions[3].id]:''}}}));
  await root.locator('[data-reading-submit]').click();
  await root.locator('[data-reading-submit-error]:not([hidden])').waitFor();
  assert.match(await root.locator('[data-reading-submit-error]').innerText(),/标准答案尚未补齐/);
  await assertPreserved();
  await page.unroute(routePattern);
  await page.route(routePattern,route=>route.abort('failed'));
  await root.locator('[data-reading-submit]').click();
  await page.waitForFunction(()=>document.querySelector('[data-reading-submit-error]').textContent.includes('暂时无法加载'));
  await assertPreserved();
  await page.unroute(routePattern);
  await page.route(routePattern,route=>route.fulfill({json:{...payload,objectId:'different-passage'}}));
  await root.locator('[data-reading-submit]').click();
  await page.waitForFunction(()=>document.querySelector('[data-reading-submit-error]').textContent.includes('数据异常'));
  await assertPreserved();
  await page.unroute(routePattern);
  await root.locator('[data-reading-submit]').click();
  await root.locator('[data-reading-result]:not([hidden])').waitFor();
  const submitted=await getAttempt();
  assert.equal(submitted.submitted,true);
  assert.deepEqual(submitted.answers,before.answers,'submit uses existing choices without correction');
  assert.deepEqual(submitted.discussionSpans,before.discussionSpans);
  assert.deepEqual(submitted.uncertain,before.uncertain);
  assert.equal(submitted.binding.attempt_id,before.binding.attempt_id);
  assert.equal(submitted.history.length,1,'only one submission is recorded');
  assert(await root.locator('[data-reading-submit-error]').isHidden());
  await page.reload();
  await root.locator('[data-reading-result]:not([hidden])').waitFor();
  const restored=await getAttempt();
  for(const field of ['answers','submittedAt','history','results','firstEvidenceMeta','discussionSpans'])assert.deepEqual(restored[field],submitted[field],field);
  assert.equal(restored.binding.attempt_id,before.binding.attempt_id);
  assert.deepEqual(errors,[]);
  console.log('PASS protected key: no pre-submit disclosure; missing/network/mismatch preserve choices, uncertainty, trajectory and highlights; retry submits once; reload preserves first evidence');
} finally {
  await browser?.close();
  if(server.pid)await terminateProcessTree(server.pid,{graceMs:1000});
  fs.rmSync(temp,{recursive:true,force:true});
}
