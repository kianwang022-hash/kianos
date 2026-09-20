import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import {
  listSyntheticReadingSets,
  loadSyntheticReadingById,
  loadSyntheticReadingAnswersById,
  listSyntheticClozeSets,
  loadSyntheticClozeById,
  loadSyntheticClozeAnswersById,
  listSyntheticReadingBSets,
  loadSyntheticReadingBById,
  loadSyntheticReadingBAnswersById,
  listSyntheticTranslationSets,
  loadSyntheticTranslationById
} from '../src/lib/englishSyntheticBaseline.mjs';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';

const BASE='http://127.0.0.1:4321';
const auditDir=path.resolve(process.cwd(),'../english-synthetic-audit');
fs.mkdirSync(auditDir,{recursive:true});
const report={
  schema:'kianos.english.synthetic-baseline-browser.v1',
  started_at:new Date().toISOString(),
  checks:[]
};

function check(condition,name,detail=''){
  if(!condition) throw new Error('ENGLISH_SYNTHETIC_BROWSER_FAIL:'+name+(detail?':'+detail:''));
  report.checks.push({name,pass:true,detail});
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const firstAnswer=value=>Array.isArray(value)?String(value[0]??''):String(value??'');
const qid=(q,index)=>String(q?.id||q?.question_id||('q'+(index+1)));

async function waitForServer(){
  for(let i=0;i<80;i+=1){
    try{const response=await fetch(BASE);if(response.ok)return;}catch{}
    await sleep(250);
  }
  throw new Error('ENGLISH_SYNTHETIC_PREVIEW_NOT_READY');
}
async function stopServer(server){
  if(!server)return;
  if(server.exitCode===null){
    if(process.platform!=='win32'&&server.pid){try{process.kill(-server.pid,'SIGTERM');}catch{}}
    else{try{server.kill('SIGTERM');}catch{}}
    await Promise.race([new Promise(resolve=>server.once('exit',resolve)),sleep(1000)]);
  }
  if(server.exitCode===null){
    if(process.platform!=='win32'&&server.pid){try{process.kill(-server.pid,'SIGKILL');}catch{}}
    else{try{server.kill('SIGKILL');}catch{}}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
}

function catalogRow(task,objectId){
  const row=englishSessionCatalog().find(item=>item.task===task&&item.object_id===objectId);
  if(!row)throw new Error('SESSION_CATALOG_MISSING:'+task+':'+objectId);
  return row;
}

async function importPlan(page,steps){
  await page.goto(BASE+'/english/',{waitUntil:'domcontentloaded'});
  const control=page.locator('[data-english-session-control]');
  await control.waitFor({state:'visible'});
  if(!(await control.getAttribute('open'))) await control.locator('summary').click();
  await page.locator('[data-english-toggle-import]').click();
  const day=await page.evaluate(()=>new Date().toLocaleDateString('en-CA'));
  const payload={
    schema:'kianos.english.session-instruction.v1',
    session_id:'synthetic-baseline-browser-'+day,
    study_day:day,
    generated_at:new Date().toISOString(),
    current_step:0,
    steps:steps.map((step,index)=>({
      step_id:'s'+(index+1),
      task:step.task,
      object_id:step.object_id,
      source_hash:step.source_hash,
      label:step.label,
      note:'Synthetic baseline browser acceptance'
    })),
    return_policy:{on_finish:'english_home'}
  };
  await page.locator('[data-english-session-input]').fill(JSON.stringify(payload));
  await page.locator('[data-english-apply-session]').click();
  await page.waitForFunction(()=>/已载入/.test(document.querySelector('[data-english-session-status]')?.textContent||''));
  check(true,'typed_plan_imported');
}

async function expectResume(page,objectId){
  await page.goto(BASE+'/english/',{waitUntil:'domcontentloaded'});
  const resume=page.locator('[data-english-resume]');
  await resume.waitFor({state:'visible'});
  const href=await page.locator('[data-english-resume-link]').getAttribute('href');
  check(Boolean(href&&href.includes(encodeURIComponent(objectId))),'resume_points_to_'+objectId,href||'');
}

async function answerReading(page,row){
  const task=loadSyntheticReadingById(row.id);
  const answers=loadSyntheticReadingAnswersById(row.id);
  await page.goto(BASE+'/reading/'+encodeURIComponent(row.id)+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-local-port="reading"]').waitFor({state:'visible'});
  check(await page.locator('[data-reading-result]').isHidden(),'reading_answer_hidden_before_submit');
  for(let i=0;i<task.questions.length;i+=1){
    const id=qid(task.questions[i],i);
    const answer=firstAnswer(answers.answers[id]);
    await page.locator('[data-question]').nth(i).locator('[data-option="'+answer+'"]').click();
  }
  await page.locator('[data-reading-submit]').click();
  await page.locator('[data-reading-result]').waitFor({state:'visible'});
  check((await page.locator('[data-reading-score]').textContent())?.trim()==='5 / 5','reading_clean_pass');
  const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-reading-attempt-v1:'+id)||'null'),row.id);
  check(state?.submitted===true&&state?.binding?.source_hash===task.sourceHashes.renderedObject,'reading_evidence_bound');
}

async function answerCloze(page,row){
  const task=loadSyntheticClozeById(row.id);
  const answers=loadSyntheticClozeAnswersById(row.id);
  await page.goto(BASE+'/cloze/'+encodeURIComponent(row.id)+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-objective-root]').waitFor({state:'visible'});
  for(let i=0;i<task.questions.length;i+=1){
    const id=qid(task.questions[i],i);
    const answer=firstAnswer(answers.answers[id]);
    await page.locator('[data-objective-question]').nth(i).locator('[data-value="'+answer+'"]').click();
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
  check((await page.locator('[data-objective-score]').textContent())?.trim()==='20 / 20','cloze_clean_pass');
  const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-cloze-attempt-v1:'+id)||'null'),row.id);
  check(state?.submitted===true&&state?.binding?.source_hash===task.sourceHashes.renderedObject,'cloze_evidence_bound');
}

async function answerPartB(page,row){
  const task=loadSyntheticReadingBById(row.id);
  const answers=loadSyntheticReadingBAnswersById(row.id);
  await page.goto(BASE+'/reading-b/'+encodeURIComponent(row.id)+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-objective-root]').waitFor({state:'visible'});
  check((await page.locator('[data-objective-root]').getAttribute('data-reading-b-task-form'))==='ordering','part_b_ordering_geometry');
  for(let i=0;i<task.questions.length;i+=1){
    const id=qid(task.questions[i],i);
    await page.locator('[data-reading-b-select]').nth(i).selectOption(firstAnswer(answers.answers[id]));
  }
  await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
  check((await page.locator('[data-objective-score]').textContent())?.trim()==='5 / 5','part_b_clean_pass');
  const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-reading-b-attempt-v1:'+id)||'null'),row.id);
  check(state?.submitted===true&&state?.binding?.source_hash===task.sourceHashes.renderedObject,'part_b_evidence_bound');
}

async function completeTranslation(page,row){
  const task=loadSyntheticTranslationById(row.id);
  await page.goto(BASE+'/translation/'+encodeURIComponent(row.id)+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-translation-runtime]').waitFor({state:'visible'});
  check(await page.locator('[data-reference-panel]').isHidden(),'translation_reference_hidden_during_attempt');
  const boxes=page.locator('[data-attempt-id]');
  check(await boxes.count()===5,'translation_five_segments');
  for(let i=0;i<5;i+=1)await boxes.nth(i).fill('第'+(i+1)+'句的独立第一版译文。');
  await page.locator('[data-freeze-first]').click();
  await page.locator('[data-stage="decision"]').waitFor({state:'visible'});
  await page.locator('[data-pass-clean]').click();
  await page.locator('[data-stage="passed"]').waitFor({state:'visible'});
  const toggle=page.locator('[data-stage="passed"] [data-toggle-complete-reference]');
  await toggle.click();
  const panel=page.locator('[data-stage="passed"] [data-complete-reference]');
  await panel.waitFor({state:'visible'});
  check(await panel.locator('section').count()===5,'translation_reference_reveals_post_attempt');
  const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-translation-attempt-v2:'+id)||'null'),row.id);
  check(state?.stage==='passed'&&state?.binding?.source_hash===task.sourceHashes.renderedObject,'translation_evidence_bound');
}

async function completeWriting(page,row){
  await page.goto(BASE+'/writing/'+encodeURIComponent(row.id)+'/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-writing-runtime]').waitFor({state:'visible'});
  await page.locator('input[data-plan-mode][value="direct"]').check();
  await page.locator('[data-essay-draft]').fill('Dear Coordinator, I am writing to request a short extension because the university laboratory I need has been closed unexpectedly for two days. The original deadline is Monday, so I would be grateful if I could submit the report by Wednesday evening instead. I understand that changing the deadline may cause inconvenience, and I will make sure to complete the report as soon as the laboratory reopens. Thank you for considering my request.');
  await page.locator('[data-lock-first]').click();
  await page.locator('[data-runtime-stage="review"]').waitFor({state:'visible'});
  await page.getByRole('button',{name:'这篇可以了',exact:true}).click();
  await page.locator('[data-runtime-stage="passed"]').waitFor({state:'visible'});
  const state=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-writing-runtime-v1:'+id)||'null'),row.id);
  check(state?.state==='PASS_ACCEPTABLE'&&Boolean(state?.firstDraft),'writing_expanded_prompt_executable');
}

const reading=listSyntheticReadingSets()[0];
const cloze=listSyntheticClozeSets()[0];
const partB=listSyntheticReadingBSets().map(row=>({row,task:loadSyntheticReadingBById(row.id)})).find(item=>item.task.context.taskForm==='ordering')?.row;
const translation=listSyntheticTranslationSets()[0];
const writing=listWritingSyntheticTasks().find(row=>row.id==='writing-synthetic-small-v2')||listWritingSyntheticTasks()[2];
check(Boolean(reading&&cloze&&partB&&translation&&writing),'representative_assets_present');

const sequence=[
  {task:'reading_a',object_id:reading.id,source_hash:catalogRow('reading_a',reading.id).source_hash,label:'Synthetic Reading A'},
  {task:'cloze',object_id:cloze.id,source_hash:catalogRow('cloze',cloze.id).source_hash,label:'Synthetic Cloze'},
  {task:'reading_b',object_id:partB.id,source_hash:catalogRow('reading_b',partB.id).source_hash,label:'Synthetic Part B'},
  {task:'translation',object_id:translation.id,source_hash:catalogRow('translation',translation.id).source_hash,label:'Synthetic Translation'},
  {task:'writing',object_id:writing.id,source_hash:catalogRow('writing',writing.id).source_hash,label:'Synthetic Writing'}
];

const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4321'],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let serverLog='';
server.stdout.on('data',chunk=>{serverLog+=chunk.toString();});
server.stderr.on('data',chunk=>{serverLog+=chunk.toString();});

try{
  await waitForServer();
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();
    await importPlan(page,sequence);

    await expectResume(page,reading.id);
    await answerReading(page,reading);
    await expectResume(page,cloze.id);
    await answerCloze(page,cloze);
    await expectResume(page,partB.id);
    await answerPartB(page,partB);
    await expectResume(page,translation.id);
    await completeTranslation(page,translation);
    await expectResume(page,writing.id);
    await completeWriting(page,writing);

    await page.goto(BASE+'/english/',{waitUntil:'domcontentloaded'});
    check(await page.locator('[data-english-resume]').isHidden(),'session_complete_hides_resume');

    report.finished_at=new Date().toISOString();
    report.pass=true;
    fs.writeFileSync(path.join(auditDir,'english-synthetic-baseline-browser.json'),JSON.stringify(report,null,2));
    console.log('ENGLISH_SYNTHETIC_BASELINE_BROWSER_PASS '+report.checks.length+' checks');
    await context.close();
  } finally {
    await browser.close().catch(()=>{});
  }
} catch(error){
  report.finished_at=new Date().toISOString();
  report.pass=false;
  report.error=error instanceof Error ? error.stack||error.message : String(error);
  report.server_log=serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir,'english-synthetic-baseline-browser.json'),JSON.stringify(report,null,2));
  console.error(report.error);
  process.exitCode=1;
} finally {
  await stopServer(server);
}
