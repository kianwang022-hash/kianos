// Run only against an already-started isolated Candidate. Never use Stable or
// a persistent browser profile. Medical assets are Current; all evidence is fake.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject as describe } from '../src/lib/xizongMemoryRelease.mjs';
import { createXizongMemoryState, releaseBlockMemory, releasedMemoryCards } from '../src/lib/xizongMemoryModel.mjs';
const base = new URL(process.env.KIANOS_PREPARED_MEMORY_TEST_BASE || 'http://127.0.0.1:4322/');
assert.equal(base.hostname,'127.0.0.1'); assert.notEqual(base.port,'4321');
const { chromium } = await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
const object = resolveXizongLearnerProjection(loadXizongBlock('circulation','b01'),{
  enrichBlock:b=>({...b,kpRecords:b.kpRecords.map(k=>({...k,detailHtml:marked.parse(projectKpCore(k.detailMarkdown))}))})
}).learnerObject;
const descriptor=describe(object);
const fixture=releaseBlockMemory(createXizongMemoryState(),descriptor,'2026-10-01T00:00:00Z');
const cards=releasedMemoryCards(fixture,'PRECISION');
assert.equal(cards.length,13);
const key='kianos-xizong-memory-v1';
const checks=[], errors=[];
const browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
try {
  const context=await browser.newContext({viewport:{width:1440,height:960}});
  await context.route('**/*', route => {
    const url=new URL(route.request().url());
    return url.origin===base.origin ? route.continue() : route.abort();
  });
  await context.addInitScript(({key,fixture,origin})=>{
    if(location.origin===origin && !sessionStorage.getItem('xizong-prepared-memory-fixture-installed')){
      localStorage.setItem(key,JSON.stringify(fixture));
      sessionStorage.setItem('xizong-prepared-memory-fixture-installed','1');
    }
  },{key,fixture,origin:base.origin});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('/xizong/memory/',base).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.bringToFront();
  console.log('Candidate loaded',await page.evaluate(()=>({focus:document.hasFocus(),writer:document.documentElement.dataset.learnerWriter})));
  await page.waitForFunction(()=>document.querySelector('[data-memory-summary-precision]')?.textContent==='13',{},{timeout:30000});
  await page.locator('[data-memory-view="PRECISION"]').click();
  assert.equal(await page.locator('[data-memory-queue] button').count(),13);
  const answer=page.locator('[data-memory-answer]');
  for(const [i,card] of cards.entries()){
    await page.locator('[data-memory-queue] button').nth(i).click();
    assert.equal((await page.locator('[data-memory-precision-text]').textContent()).trim(),card.cue);
    assert.equal(await answer.isVisible(),true);
    assert.equal(await answer.locator(`[data-prepared-memory="${card.precisionCueId}"]`).count(),1);
    assert.match(await page.locator('[data-memory-precision-resolution]').textContent(),/已绑定精确答案/);
  }
  checks.push('all 13 actual native answers render in existing Precision Browse');
  const idx=cards.findIndex(c=>c.id==='precision:b01-m02-cycle-pressure-extrema');
  await page.locator('[data-memory-queue] button').nth(idx).click();
  assert.match(await answer.textContent(),/快射-双双高潮/);
  checks.push('the original mnemonic reaches the actual answer panel');
  await page.locator('[data-precision-mode="RECALL"]').click();
  assert.equal(await answer.isVisible(),false);
  assert.equal(await page.locator('[data-memory-ratings]').isVisible(),false);
  checks.push('Recall hides answer and mnemonic together before Reveal');
  await page.locator('[data-memory-reveal]').click();
  assert.equal(await answer.isVisible(),true);assert.match(await answer.textContent(),/快射-双双高潮/);
  assert.equal(await page.locator('[data-memory-ratings]').isVisible(),true);
  checks.push('Reveal restores the exact answer and memory aid');
  const out=path.resolve(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT || '/tmp/kianos-xizong-1113-browser-proof');
  fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'prepared-memory-reveal.png'),fullPage:true});
  await page.locator('[data-memory-rating="known"]').click();
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(saved.evidence.length,1);assert.equal(saved.evidence[0].cardId,cards[idx].id);
  assert.equal(Object.keys(saved.cards).length,45);
  checks.push('one synthetic rating uses the existing identity, not a duplicate card');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.bringToFront();
  await page.waitForFunction(()=>document.querySelector('[data-memory-summary-precision]')?.textContent==='13');
  const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.deepEqual(after.evidence,saved.evidence);assert.equal(Object.keys(after.cards).length,45);
  checks.push('reload retains the synthetic result without replay');
  assert.deepEqual(errors,[]);
  const result={status:'PASS',base:base.href,scope:'native B1 prepared answers in isolated Candidate browser; not real learner or deployed Stable proof',checks};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
