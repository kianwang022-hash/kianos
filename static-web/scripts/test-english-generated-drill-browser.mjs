import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {ENGLISH_GENERATED_DRILL_SCHEMA,writeEnglishGeneratedDrill} from './privateEnglishGeneratedDrillStore.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const staticRoot=path.resolve(here,'..');
const repoRoot=path.resolve(staticRoot,'..');
const out=path.join(repoRoot,'english-generated-drill-audit');
fs.mkdirSync(out,{recursive:true});

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-generated-browser-'));
const generatedDir=path.join(temp,'generated');
const sourceRoot=path.join(temp,'missing-source');
const externalPrivate=path.join(temp,'external-private');
const drill={
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:'external-chat-2099-09-20-browser-001',
  study_day:'2099-09-20',
  generated_at:'2099-09-20T01:00:00Z',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'reading_scope_transfer',note:'Changed-context scope/modality browser proof.'},
  passage:{
    title:'Generated scope transfer',
    paragraphs:[
      'A pilot program may improve outcomes for some participants when support is available.',
      'The report did not claim that every participant would benefit or that the effect was guaranteed.'
    ]
  },
  questions:[{
    question_id:'gq1',
    origin:'CHAT_GENERATED',
    response_kind:'single_choice',
    prompt:'Which statement is best supported?',
    options:{
      A:'The program guarantees improvement for every participant.',
      B:'The program may help some participants under supported conditions.',
      C:'The report proves that support is unnecessary.',
      D:'No participant can benefit from the program.'
    },
    answer:'B',
    rationale:'B preserves both the limited scope and modality.'
  }]
};

const written=writeEnglishGeneratedDrill(drill,{privateDir:generatedDir});
const objectId=written.drill.object_id;
const port=4461;
const base='http://127.0.0.1:'+port;
const logPath=path.join(out,'generated-drill-browser.log');
const log=fs.openSync(logPath,'w');
const server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)],{
  cwd:staticRoot,
  env:{
    ...process.env,
    KIANOS_ENGLISH_GENERATED_DIR:generatedDir,
    KIANOS_EXTERNAL_READING_SOURCE_ROOT:sourceRoot,
    KIANOS_EXTERNAL_READING_DIR:externalPrivate
  },
  stdio:['ignore',log,log]
});

async function waitReady(){
  for(let i=0;i<120;i++){
    try{const r=await fetch(base+'/external-reading/');if(r.ok)return;}
    catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error('Generated drill dev server unavailable');
}

let browser;
try{
  await waitReady();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  const page=await context.newPage();
  const requests=[];
  page.on('request',request=>requests.push(request.url()));

  await page.goto(base+'/external-reading/?id='+encodeURIComponent(objectId),{waitUntil:'domcontentloaded'});
  await page.locator('[data-external-workspace]').waitFor({state:'visible'});
  assert.equal((await page.locator('[data-external-title]').textContent())?.trim(),'Generated scope transfer');
  assert.equal((await page.locator('[data-external-kind]').textContent())?.trim(),'CHAT · SYNTHETIC');
  assert.match((await page.locator('[data-external-question-mode] .externalReadingQuestionHeader span').textContent())||'',/CHAT-GENERATED DRILL/);
  assert.match((await page.locator('[data-external-question-mode] .externalReadingQuestionHeader strong').textContent())||'',/不冒充原题/);
  assert.equal(await page.locator('[data-external-mode]').isVisible(),false,'question-required generated drill must not offer read-only escape');
  assert.equal(await page.locator('[data-external-finish]').isVisible(),false,'question-required generated drill must not offer reading-only completion');
  assert.equal(await page.locator('[data-external-submit]').isVisible(),true);
  assert.equal(requests.some(url=>url.includes('/external-reading/answers?id='+objectId)),false,'generated answers must not load before Submit');

  const before=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:'+id)||'null'),objectId);
  assert.equal(before?.binding?.source_snapshot?.completion_requirement,'QUESTIONS_SUBMITTED');
  assert.equal(before?.binding?.source_snapshot?.question_origin,'CHAT_GENERATED');
  assert.equal(before?.submitted,false);

  await page.locator('[data-external-questions] [data-question="gq1"] [data-option="B"]').click();
  await page.locator('[data-external-submit]').click();
  await page.locator('[data-external-result]').waitFor({state:'visible'});
  assert(requests.some(url=>url.includes('/external-reading/answers?id='+objectId)));
  assert.match((await page.locator('[data-external-result-meta]').textContent())||'',/not true-paper calibration/);

  const after=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-english-external-reading-attempt-v1:'+id)||'null'),objectId);
  assert.equal(after?.submitted,true);
  assert.equal(after?.stage,'submitted');
  assert.equal(after?.results?.gq1,'correct');
  assert.equal(after?.formalAnswers?.gq1,'B');
  const debtKeys=await page.evaluate(()=>Object.keys(localStorage).filter(key=>/repair|transfer/i.test(key)&&/external|generated/i.test(key)));
  assert.deepEqual(debtKeys,[],'generated drill Submit must not auto-create repair/transfer debt');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-external-result]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-external-result]').isVisible(),true);
  await page.screenshot({path:path.join(out,'generated-drill.png'),fullPage:true});

  console.log(JSON.stringify({
    status:'PASS',
    generated_identity:'PASS',
    missing_external_source_independence:'PASS',
    pre_submit_answer_gate:'PASS',
    question_required_completion_surface:'PASS',
    factual_english_evidence:'PASS',
    no_auto_debt:'PASS',
    screenshot:path.join(out,'generated-drill.png')
  },null,2));
  await context.close();
}finally{
  if(browser)await browser.close();
  try{server.kill('SIGTERM');}catch{}
  fs.closeSync(log);
  fs.rmSync(temp,{recursive:true,force:true});
}
