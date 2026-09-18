// Fresh learner-model assertions, not historical PASS replay. Synthetic data only.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K, politicsReviewPacket, readPoliticsSnapshot } from '../src/lib/politicsPracticeState.mjs';

const out = path.resolve(process.env.POLITICS_FRESH_EVIDENCE || '../qa/politics-final-fresh');
fs.mkdirSync(out, { recursive: true });
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const site = path.resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(site, '.' + name);
    if (!file.startsWith(site + path.sep) || !fs.statSync(file).isFile()) throw Error('not found');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];
async function check(name, fn) {
  try { const detail = await fn(); results.push({ name, status: 'PASS', detail }); }
  catch (e) { results.push({ name, status: 'FAIL', error: String(e.stack || e) }); }
  console.log(JSON.stringify(results.at(-1)));
}
const state = page => page.evaluate(keys => Object.fromEntries(Object.entries(keys).map(([name,key]) => [name, JSON.parse(localStorage.getItem(key) || 'null')])), K);
async function pageContext(init) {
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  if (init) await context.addInitScript(init);
  const page = await context.newPage(); page.setDefaultTimeout(10000);
  return { context, page };
}
async function start(page, q) {
  await page.goto(`${base}/politics/practice/?question=${encodeURIComponent(q.id)}`);
  await page.locator('[data-filter-count]').selectOption('5');
  await page.locator('[data-learned-scope]').check();
  await page.locator('[data-start-session]').click();
  await page.locator('[data-question-options] button').first().waitFor();
}
async function answer(page, q, outcome = 'WRONG') {
  if (outcome === 'UNCERTAIN') await page.locator('[data-uncertain]').click();
  const choice = outcome === 'WRONG' ? q.options.find(o => !q.answer.includes(o.label))?.label || q.answer[0] : q.answer;
  for (const label of choice) await page.locator(`[data-option="${label}"]`).click();
  await page.locator('[data-submit]').click();
}
const first = subject => catalog.questions.find(q => q.subject === subject && q.unitKey && q.type === 'single');

for (const subject of ['marxism','history','mao','xi','ethics_law']) {
  await check(`single-workbench-clean-WU-continue:${subject}`, async () => {
    const { context, page } = await pageContext(); const q = first(subject); const requests = [];
    page.on('request', r => { if (r.url().includes('/practice-review/')) requests.push(r.url()); });
    try {
      await start(page, q);
      assert.equal(requests.length, 0, 'answer payload fetched before submit');
      assert.equal(await page.locator('[data-result-answer]').textContent(), '');
      await answer(page, q, subject === 'xi' ? 'UNCERTAIN' : 'WRONG');
      await page.locator('[data-submitted-result]').waitFor({ state:'visible' });
      const before = await state(page); const snap = before.attempts.units[q.unitKey].attempts[q.id];
      assert.equal(snap.outcome, subject === 'xi' ? 'UNCERTAIN' : 'WRONG');
      assert.equal(before.session.ids[before.session.index], q.id);
      assert.equal(new URL(page.url()).pathname, '/politics/practice/');
      assert.equal((await page.locator('[data-takeaway]').textContent()).trim(), q.takeaway.trim());
      assert.equal((await page.locator('[data-chat-explanation]').textContent()).trim(), q.chatExplanation.trim());
      await page.locator('[data-note]').fill('SYNTHETIC fresh-audit note');
      await page.locator('[data-cause="options"]').click();
      await page.screenshot({ path:path.join(out, `${subject}-submitted.png`), fullPage:true });
      await page.locator('[data-next-question]').click();
      const after = await state(page);
      assert.deepEqual(after.attempts.units[q.unitKey].attempts[q.id], snap);
      assert.equal(after.meta.notes[q.id], 'SYNTHETIC fresh-audit note');
      assert.equal(after.meta.causes[q.id], 'options');
      assert.equal(after.session.index, Math.min(1, after.session.ids.length - 1));
      if (after.session.status === 'active') assert.equal(await page.locator('[data-result-answer]').textContent(), '');
      return { question:q.id, first:snap.outcome, answerRequests:requests.length };
    } finally { await context.close(); }
  });
}

await check('corrupt-array-meta-fails-closed', async () => {
  const {context,page}=await pageContext(() => localStorage.setItem('kianos-politics-practice-meta-v1','[]'));
  try {
    await page.goto(base+'/politics/practice/');
    await page.waitForTimeout(250);
    assert.equal(await page.locator('[data-practice-error]').isVisible(), true, 'array metadata was accepted');
    assert.equal(await page.locator('[data-start-session]').isDisabled(), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('kianos-politics-practice-meta-v1')), '[]');
  } finally {await context.close();}
});

await check('failed-evidence-write-locks-attempt-and-idempotent-retry', async () => {
  const {context,page}=await pageContext(() => {
    const set=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value) {if(key==='kianos-politics-evidence-v1' && window.__denyEvidence) throw new DOMException('synthetic quota','QuotaExceededError'); return set.call(this,key,value);};
  });
  try {
    const q=first('history'); await start(page,q); await page.evaluate(() => window.__denyEvidence=true);
    await answer(page,q); await page.locator('[data-retry-save]').waitFor({state:'visible'});
    const pending=await state(page); assert.ok(pending.session.pending); assert.equal(pending.session.index,0);
    assert.equal(await page.locator('[data-practice-error]').isVisible(),true);
    const original=pending.attempts.units[q.unitKey].attempts[q.id];
    await page.evaluate(() => window.__denyEvidence=false); await page.locator('[data-retry-save]').click();
    await page.locator('[data-submitted-result]').waitFor({state:'visible'});
    const saved=await state(page); assert.equal(saved.events.length,1); assert.equal(saved.session.pending,null);
    assert.deepEqual(saved.attempts.units[q.unitKey].attempts[q.id],original);
    await page.reload(); await page.locator('[data-submitted-result]').waitFor({state:'visible'});
    assert.equal((await state(page)).events.length,1);
  } finally {await context.close();}
});

await check('exact-optional-source-return-survives-passive-navigation', async () => {
  const {context,page}=await pageContext();
  try {
    const q=first('history');await start(page,q);await answer(page,q);
    await page.locator('[data-return-unit]').waitFor({state:'visible'});
    const href=await page.locator('[data-return-unit]').getAttribute('href');
    await page.locator('[data-return-unit]').click();await page.waitForTimeout(600);
    const units=page.locator('[data-politics-unit]');
    if(await units.count()) await units.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const saved=await state(page);
    assert.equal(saved.last.question_id,q.id,'source return question identity lost');
    const target=new URL(saved.last.href,base), expected=new URL(href,base);
    assert.equal(target.searchParams.get('practiceSession'),expected.searchParams.get('practiceSession'),'source return session lost');
    assert.equal(target.searchParams.get('practiceQuestion'),q.id);
    const link=page.locator(`a[href*="session=${encodeURIComponent(saved.session.id)}"][href*="question=${encodeURIComponent(q.id)}"]`).first();
    await link.click();await page.locator('[data-submitted-result]').waitFor({state:'visible'});
    assert.equal((await state(page)).session.ids[saved.session.index],q.id);
  } finally {await context.close();}
});

await check('Review-batch-export-is-read-only-and-keeps-first-evidence', async () => {
  const q=first('history');
  const firstAttempt={question_id:q.id,outcome:'STABLE',selected:q.answer,correct_answer:q.answer,study_day:'2026-09-18',observed_at:'2026-09-18T01:00:00.000Z'};
  const snap={attempts:{units:{[q.unitKey]:{attempts:{[q.id]:firstAttempt}}}},meta:{latestOutcome:{[q.id]:'WRONG'},notes:{[q.id]:'SYNTHETIC'},causes:{[q.id]:'options'}},events:[{event_id:'synthetic-retry',question_id:q.id,unit_id:q.unitId,outcome:'WRONG',observed_at:'2026-09-18T02:00:00.000Z'}],last:null,errors:[]};
  const bytes=JSON.stringify(snap), packet=politicsReviewPacket(catalog,snap);
  const serialized=JSON.stringify(packet);
  assert.ok(serialized.includes(firstAttempt.observed_at),'first stable evidence absent from later-Wrong packet');
  politicsReviewPacket(catalog,snap);assert.equal(JSON.stringify(snap),bytes);
});

await check('five-subject-learning-surfaces-and-optional-checkpoint',async()=>{
  const {context,page}=await pageContext();const observations=[];
  try {
    for(const [subject,chapter] of [['marxism','ch00'],['marxism','ch02'],['history','ch02'],['mao','ch01'],['xi','ch01'],['ethics_law','ch06']]){
      await page.goto(`${base}/politics/${subject}/${chapter}/`);await page.waitForTimeout(250);
      assert.equal(await page.locator('[data-politics-question],[data-politics-submit]').count(),0,'second attempt surface');
      const practiceLinks=await page.locator('a[href*="/politics/practice/"]').count();assert.ok(practiceLinks>0);
      const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);assert.equal(horizontal,false);
      await page.screenshot({path:path.join(out,`${subject}-${chapter}.png`),fullPage:true});
      observations.push({subject,chapter,practiceLinks});
    }
    await page.goto(`${base}/politics/marxism/ch00/`);await page.waitForTimeout(250);
    const optional=await page.getByText('20 秒闭卷收口（可选）',{exact:false}).count();
    const optionalSpelling=await page.getByText('20秒闭卷收口（可选）',{exact:false}).count();
    assert.ok(optional+optionalSpelling>0,'explicit optional closure missing');
    return observations;
  } finally {await context.close();}
});

await check('real-browser-restart-preserves-private-draft-and-first',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'politics-fresh-private-'));
  let context;let before;
  try {
    context=await chromium.launchPersistentContext(dir,{headless:true,viewport:{width:1512,height:982}});
    let page=await context.newPage();const q=first('mao');await start(page,q);await answer(page,q);
    await page.locator('[data-submitted-result]').waitFor({state:'visible'});before=await state(page);
    await context.close();context=null;
    context=await chromium.launchPersistentContext(dir,{headless:true,viewport:{width:1512,height:982}});
    page=await context.newPage();await page.goto(`${base}/politics/practice/?session=${encodeURIComponent(before.session.id)}&question=${encodeURIComponent(q.id)}`);
    await page.locator('[data-submitted-result]').waitFor({state:'visible'});
    const after=await state(page);assert.deepEqual(after.attempts,before.attempts);assert.deepEqual(after.events,before.events);assert.equal(after.session.id,before.session.id);
  } finally {if(context)await context.close();fs.rmSync(dir,{recursive:true,force:true});}
});

await check('Review-and-Home-no-auto-Chat-no-stable-debt',async()=>{
  const {context,page}=await pageContext();
  try {
    const q=first('history');await start(page,q);await answer(page,q,'STABLE');await page.locator('[data-submitted-result]').waitFor({state:'visible'});
    const before=await state(page);assert.equal(before.events?.length||0,0);
    await page.goto(base+'/politics/review/');await page.locator('[data-review-empty]').waitFor({state:'visible'});
    assert.equal(await page.locator('[data-review-question]').count(),0);
    await page.screenshot({path:path.join(out,'review-stable.png'),fullPage:true});
    await page.goto(base+'/politics/');await page.waitForTimeout(250);
    assert.equal(await page.locator('[data-review-copy]').count(),0);
    await page.screenshot({path:path.join(out,'home.png'),fullPage:true});
    const after=await state(page);assert.deepEqual(after.attempts,before.attempts);assert.deepEqual(after.events,before.events);
  } finally {await context.close();}
});
await browser.close();await new Promise(resolve=>server.close(resolve));
const report={schema:'kianos.politics.fresh-browser-audit.v1',platform:process.platform,node:process.version,synthetic:true,learner_U:'UNTESTED',results,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length};
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,failed:report.failed,platform:report.platform}));
if(report.failed && process.env.POLITICS_FRESH_ALLOW_FAILURES!=='1')process.exitCode=1;
