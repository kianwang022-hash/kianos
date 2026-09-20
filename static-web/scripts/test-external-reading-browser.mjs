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
  const page=await context.newPage();
  const requests=[];
  page.on('request',request=>requests.push(request.url()));

  await page.goto(base+'/external-reading/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-status]').filter({hasText:'External Content ready'}).waitFor();
  const counts=await page.locator('[data-external-counts]').textContent();
  assert.match(counts,/TPO 10\/10/);
  assert.match(counts,/30 passages/);
  assert.match(counts,/395 questions/);
  assert.match(counts,/IELTS 3\/3/);
  assert.match(counts,/36 passages/);
  assert.match(counts,/480 questions/);
  assert.match(counts,/NEW 3 source\(s\) · 2 questions/);
  assert.equal(await page.locator('[data-external-family]').count(),4);

  await page.goto(base+'/external-reading/?id=tpo56-p1',{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-workspace]').waitFor({state:'visible'});
  await page.locator('[data-external-title]').filter({hasText:'Synthetic TPO 56 P1'}).waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-questions] [data-question]').count(),14);
  assert.equal(requests.some(url=>url.includes('/external-reading/answers')),false,'formal answers must not be requested before Submit');
  assert.equal(await page.locator('[data-external-result]').isVisible(),false);

  const exposure=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-material-exposure-v1')||'null'));
  assert(exposure?.materials?.['tpo56-p1']?.events?.some(event=>event.event==='opened'));
  const attemptBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:tpo56-p1')||'null'));
  assert.equal(attemptBefore?.binding?.prior_exposure,'unknown');
  assert.equal(attemptBefore?.binding?.task,'external_reading');

  await page.locator('[data-external-questions] [data-question]').first().locator('[data-option="A"]').click();
  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-result]').waitFor();
  assert(requests.some(url=>url.includes('/external-reading/answers?id=tpo56-p1')));
  const formal=await page.locator('[data-external-questions] [data-question]').first().locator('.portedReadingAnswerStrip').textContent();
  assert.match(formal,/正式答案\s*A/);

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
  await page.locator('[data-external-questions] [data-question]').first().locator('[data-option="A"]').click();
  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-result]').waitFor({state:'visible'});
  assert.equal(requests.filter(url=>url.includes(keyedAnswerUrl)).length,beforeKeyed+1);
  const keyedFormal=await page.locator('[data-external-questions] [data-question]').first().locator('.portedReadingAnswerStrip').textContent();
  assert.match(keyedFormal,/正式答案\s*A/);

  await page.screenshot({path:path.join(out,'external-reading-synthetic.png'),fullPage:true});
  console.log(JSON.stringify({
    status:'PASS',
    catalog:'69 objects',
    pre_submit_answer_gate:'PASS',
    full_question_set_visible:'PASS',
    shared_exposure:'PASS',
    refresh_recovery:'PASS',
    reading_only_without_fake_questions:'PASS',
    incremental_family_tabs:'PASS',
    incremental_questionless_auto_read_only:'PASS',
    incremental_source_backed_answer_gate:'PASS',
    no_auto_debt:'PASS',
    screenshot:path.join(out,'external-reading-synthetic.png')
  },null,2));
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
  fs.closeSync(log);
  fs.rmSync(temp,{recursive:true,force:true});
}
