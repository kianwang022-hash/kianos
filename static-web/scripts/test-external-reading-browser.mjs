import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { writeExternalReadingSyntheticSource } from './externalReadingSyntheticFixture.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const staticRoot=path.resolve(here,'..');
const repoRoot=path.resolve(staticRoot,'..');
const out=path.join(repoRoot,'english-family-audit');
fs.mkdirSync(out,{recursive:true});

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-external-browser-'));
const sourceRoot=writeExternalReadingSyntheticSource(path.join(temp,'source'));
const privateDir=path.join(temp,'private');
const port=4457;
const base=`http://127.0.0.1:${port}`;
const log=fs.openSync(path.join(out,'external-reading-browser.log'),'w');
const server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--config','scripts/astro.external-reading-synthetic.config.mjs','--host','127.0.0.1','--port',String(port)],{
  cwd:staticRoot,
  env:{...process.env,KIANOS_EXTERNAL_READING_SOURCE_ROOT:sourceRoot,KIANOS_EXTERNAL_READING_DIR:privateDir},
  stdio:['ignore',log,log]
});

async function waitReady(){
  for(let i=0;i<120;i++){
    try{const r=await fetch(base+'/external-reading/');if(r.ok)return;}
    catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error('External Reading dev server unavailable');
}

let browser;
try{
  await waitReady();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
  const page=await context.newPage();
  const requests=[];
  page.on('request',request=>requests.push(request.url()));

  await page.goto(base+'/external-reading/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-status]').filter({hasText:'External Content ready'}).waitFor();
  const counts=String(await page.locator('[data-external-counts]').textContent()).replace(/\s+/g,' ').trim();
  const catalogProjection=await page.evaluate(async()=>{
    const response=await fetch('/__kianos-private/external-reading/catalog',{cache:'no-store'});
    if(!response.ok)throw new Error('CATALOG_PROJECTION_ENDPOINT:'+response.status);
    const catalog=await response.json();
    const visible=(catalog.collections||[]).filter(group=>{
      const policy=catalog.visibility_policy?.[group.source_family];
      const allowed=Array.isArray(policy?.default_visible_collections)?policy.default_visible_collections:null;
      return !allowed||allowed.includes(group.collection);
    });
    const count=family=>visible.filter(group=>group.source_family===family).reduce((sum,group)=>sum+(group.passages||[]).length,0);
    return {
      counts:`TOEFL Current ${count('TOEFL_CURRENT')} | IELTS ${count('IELTS_ACADEMIC')} | CET-6 ${count('CET6')} | Legacy TPO ${count('TOEFL_TPO')}`,
      families:[...new Set(visible.map(group=>group.source_family).filter(Boolean))].length
    };
  });
  assert.equal(counts,catalogProjection.counts,'browser counts must project the current catalog visibility owner');
  assert.equal(await page.locator('[data-external-family]').count(),catalogProjection.families,'family tabs must match current visible source families');

  // A missing object must not masquerade as a broken private corpus or leak backend codes.
  await page.goto(base+'/external-reading/?id=definitely-missing',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-status]').filter({hasText:'没有找到这篇 External 材料'}).waitFor();
  const missingBody=String(await page.locator('body').innerText()).replace(/\s+/g,' ').trim();
  assert.doesNotMatch(missingBody,/EXTERNAL_READING_[A-Z0-9_]+/);
  assert.equal(await page.locator('.externalReadingUnavailable').count(),0,'healthy catalog must remain available after one missing object');
  assert((await page.locator('.externalReadingPassageRows a').count())>0,'healthy catalog remains rendered');
  assert.equal(await page.locator('[data-external-workspace]').isVisible(),false,'missing object does not expose a fake workspace');

  // A genuinely unavailable catalog gets a learner-facing source message, never an internal code.
  const unavailableContext=await browser.newContext({viewport:{width:1512,height:982}});
  const unavailablePage=await unavailableContext.newPage();
  let unavailableCatalogIntercepted=false;
  await unavailablePage.route('**/__kianos-private/external-reading/catalog*',route=>{
    unavailableCatalogIntercepted=true;
    return route.fulfill({
      status:503,
      contentType:'application/json',
      body:JSON.stringify({status:'error',error:'EXTERNAL_PRIVATE_BUNDLE_STALE_SOURCE'})
    });
  });
  await unavailablePage.goto(base+'/external-reading/',{waitUntil:'domcontentloaded'});
  await unavailablePage.locator('[data-external-status]').filter({hasText:'External 材料当前不可读取'}).waitFor();
  assert.equal(unavailableCatalogIntercepted,true,'catalog failure fixture must intercept the real endpoint');
  const unavailableBody=String(await unavailablePage.locator('body').innerText()).replace(/\s+/g,' ').trim();
  assert.doesNotMatch(unavailableBody,/(?:EXTERNAL|KIANOS)_[A-Z0-9_]+/);
  assert.match(await unavailablePage.locator('.externalReadingUnavailable').innerText(),/External 材料当前不可读取/);
  await unavailableContext.close();

  await page.goto(base+'/external-reading/?id=tpo56-p1',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-workspace]').waitFor({state:'visible'});
  await page.locator('[data-external-title]').filter({hasText:'Synthetic TPO 56 P1'}).waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-questions] [data-question]').count(),14);
  assert.equal(requests.some(url=>url.includes('/external-reading/answers')),false,'formal answers must not be requested before Submit');
  assert.equal(await page.locator('[data-external-result]').isVisible(),false);
  assert.equal(await page.locator('[data-external-chat-review]:visible').count(),0,'deep-review handoff must stay hidden before Submit');

  const exposure=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-material-exposure-v1')||'null'));
  assert(exposure?.materials?.['tpo56-p1']?.events?.some(event=>event.event==='opened'));
  const attemptBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:tpo56-p1')||'null'));
  assert.equal(attemptBefore?.binding?.prior_exposure,'unknown');
  assert.equal(attemptBefore?.binding?.task,'external_reading');

  await page.locator('[data-external-questions] [data-question]').first().locator('[data-option="A"]').click();

  // Answer/revision failure keeps the learner's work and stays human-facing.
  const answerFailurePattern='**/__kianos-private/external-reading/answers?id=tpo56-p1';
  await page.route(answerFailurePattern,route=>route.fulfill({
    status:409,
    contentType:'application/json',
    body:JSON.stringify({status:'error',error:'EXTERNAL_READING_ANSWER_REVISION_MISMATCH'})
  }));
  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-status]').filter({hasText:'这篇材料已更新，本次作答已保留'}).waitFor();
  const submitFailureBody=String(await page.locator('body').innerText()).replace(/\s+/g,' ').trim();
  assert.doesNotMatch(submitFailureBody,/EXTERNAL_READING_[A-Z0-9_]+/);
  assert.equal(await page.locator('[data-external-result]').isVisible(),false);
  const failedSubmitAttempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:tpo56-p1')||'null'));
  assert.equal(failedSubmitAttempt?.submitted,false);
  assert.equal(failedSubmitAttempt?.answers?.['tpo56-p1-q1'],'A');
  await page.unroute(answerFailurePattern);

  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-result]').waitFor();
  assert(requests.some(url=>url.includes('/external-reading/answers?id=tpo56-p1')));
  const formal=await page.locator('[data-external-questions] [data-question]').first().locator('.portedReadingAnswerStrip').textContent();
  assert.match(formal,/正式答案\s*A/);
  assert.equal(await page.locator('[data-external-chat-review]:visible').count(),1,'problem-bearing External result must expose one whole-object Chat escalation');
  await page.locator('[data-external-chat-review]').click();
  await page.locator('[data-external-chat-review-status]').filter({hasText:'已复制整篇 External 复盘包'}).waitFor();
  const reviewPacket=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(reviewPacket,/External Reading deep review packet v1/);
  assert.match(reviewPacket,/Source family: TOEFL_TPO/);
  assert.match(reviewPacket,/PASSAGE/);
  assert.match(reviewPacket,/ALL-QUESTION OUTCOME MAP/);
  assert.match(reviewPacket,/PROBLEM QUESTION CONTEXT/);
  assert.match(reviewPacket,/Do not relabel it as Reading A/);
  assert.match(reviewPacket,/not reading-speed\/WPM evidence/);
  await page.screenshot({path:path.join(out,'external-reading-review.png'),fullPage:true});

  const debtKeys=await page.evaluate(()=>Object.keys(localStorage).filter(key=>/transfer|repair/i.test(key)&&/external/i.test(key)));
  assert.deepEqual(debtKeys,[],'External submit must not manufacture repair/transfer debt');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-external-result]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-result]').isVisible(),true);
  const afterReload=await page.locator('[data-external-questions] [data-question]').first().locator('.portedReadingAnswerStrip').textContent();
  assert.match(afterReload,/正式答案\s*A/);

  await page.goto(base+'/external-reading/?id=tpo57-p1',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-mode]').click();
  assert.equal(await page.locator('[data-external-reading-only]').isVisible(),true);
  assert.equal(await page.locator('[data-external-question-mode]').isVisible(),false);
  await page.locator('[data-external-finish]').click();
  assert.equal(await page.locator('[data-external-chat-review]:visible').count(),0,'Reading-only completion must not manufacture whole-object review');
  const readOnlyAttempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:tpo57-p1')||'null'));
  assert.equal(readOnlyAttempt?.stage,'completed');
  assert.equal(readOnlyAttempt?.submitted,false);

  await page.goto(base+'/external-reading/?id=future-synthetic-longform',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-workspace]').waitFor({state:'visible'});
  await page.locator('[data-external-title]').filter({hasText:'Synthetic Open Long-form'}).waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-reading-only]').isVisible(),true);
  assert.equal(await page.locator('[data-external-question-mode]').isVisible(),false);
  assert.equal(await page.locator('[data-external-submit]').isVisible(),false);
  assert.equal(await page.locator('[data-external-mode]').isVisible(),false);
  assert.equal(await page.locator('.externalSourceFigure').count(),1);
  assert.match(await page.locator('.externalSourceFigure figcaption').textContent(),/Synthetic source-native chart/);
  assert.equal(await page.locator('.externalSourceFigure img').getAttribute('src'),'https://example.invalid/synthetic-source-figure.png');
  const renderedPassage=await page.locator('[data-external-paragraphs]').textContent();
  assert.doesNotMatch(renderedPassage,/\[FIGURE\]|source_position:|source_url:/);
  await page.locator('[data-external-finish]').click();
  const incrementalReadOnly=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:future-synthetic-longform')||'null'));
  assert.equal(incrementalReadOnly?.stage,'completed');
  assert.equal(incrementalReadOnly?.submitted,false);

  const keyedAnswerUrl='/external-reading/answers?id=toefl-current-synthetic-keyed';
  const beforeKeyed=requests.filter(url=>url.includes(keyedAnswerUrl)).length;
  await page.goto(base+'/external-reading/?id=toefl-current-synthetic-keyed',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-workspace]').waitFor({state:'visible'});
  await page.locator('[data-external-kind]').filter({hasText:'TOEFL · CURRENT'}).waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-questions] [data-question]').count(),1);
  assert.equal(requests.filter(url=>url.includes(keyedAnswerUrl)).length,beforeKeyed,'incremental source-backed answers must stay gated before Submit');
  const keyedRow=page.locator('[data-external-questions] [data-question]').first();
  assert.equal(await keyedRow.locator('[data-option][aria-pressed]').count(),3,'incremental multi-choice renders toggle controls');
  await keyedRow.locator('[data-option="A"]').click();
  await keyedRow.locator('[data-option="C"]').click();
  assert.equal(await keyedRow.locator('[data-option="A"]').getAttribute('aria-pressed'),'true');
  assert.equal(await keyedRow.locator('[data-option="C"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-result]').waitFor({state:'visible'});
  assert.equal(requests.filter(url=>url.includes(keyedAnswerUrl)).length,beforeKeyed+1);
  const keyedFormal=await page.locator('[data-external-questions] [data-question]').first().locator('.portedReadingAnswerStrip').textContent();
  assert.match(keyedFormal,/正式答案\s*A, C/);
  assert.match(keyedFormal,/结果\s*✓/);
  assert.equal(await page.locator('[data-external-chat-review]:visible').count(),0,'all-correct stable External result must exit without deep-review escalation');

  await page.screenshot({path:path.join(out,'external-reading-synthetic.png'),fullPage:true});
  console.log(JSON.stringify({
    status:'PASS',
    catalog:'69 objects',
    pre_submit_answer_gate:'PASS',
    missing_object_learner_projection:'PASS',
    unavailable_catalog_learner_projection:'PASS',
    answer_failure_preserves_attempt:'PASS',
    no_external_backend_code_leak:'PASS',
    full_question_set_visible:'PASS',
    shared_exposure:'PASS',
    refresh_recovery:'PASS',
    reading_only_without_fake_questions:'PASS',
    incremental_family_tabs:'PASS',
    incremental_questionless_auto_read_only:'PASS',
    source_native_figure_render:'PASS',
    incremental_source_backed_answer_gate:'PASS',
    no_auto_debt:'PASS',
    whole_object_chat_escalation:'PASS',
    stable_and_reading_only_no_review_debt:'PASS',
    review_screenshot:path.join(out,'external-reading-review.png'),
    screenshot:path.join(out,'external-reading-synthetic.png')
  },null,2));
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
  fs.closeSync(log);
  fs.rmSync(temp,{recursive:true,force:true});
}
