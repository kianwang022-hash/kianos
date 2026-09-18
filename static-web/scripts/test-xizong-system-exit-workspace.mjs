import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { loadXizongSystem } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep } from '../src/lib/xizongQuestions.mjs';
import {
  ensureXizongQuestionSweepState,
  recordXizongQuestionAttempt,
  startNextXizongQuestionRound,
  deriveXizongQuestionIdsForCurrentRound
} from '../src/lib/xizongQuestionAttempts.mjs';

const PORT = 4338;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive:true });
const reportPath = path.join(auditDir, 'xizong-system-exit-workspace.json');
const recallShot = path.join(auditDir, 'xizong-system-exit-recall.png');
const recallRevealShot = path.join(auditDir, 'xizong-system-exit-recall-reveal.png');
const practiceFrontShot = path.join(auditDir, 'xizong-practice-workbench-front.png');
const practiceShot = path.join(auditDir, 'xizong-practice-workbench.png');
const report = {
  schema:'kianos.xizong.recall_practice_workspace.v2',
  representative:'A1/circulation',
  started_at:new Date().toISOString(),
  checks:[],
  type_samples:[]
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail='') => {
  if (!condition) throw new Error(`XIZONG_RECALL_PRACTICE_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({name,pass:true,detail});
};
async function waitForHttp(url, attempts=120) {
  for (let i=0;i<attempts;i+=1) {
    try { const response=await fetch(url); if (response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}
async function scanVisibleType(root, stage) {
  const result=await root.evaluate((node)=>{
    const selector='a,p,li,span,small,b,strong,em,label,button,summary,input';
    const rows=[...node.querySelectorAll(selector)].filter((el)=>{
      const text=((el instanceof HTMLInputElement ? (el.value||el.placeholder) : el.textContent)||'').trim();
      if(!text) return false;
      const style=getComputedStyle(el);
      return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)!==0&&el.getClientRects().length>0;
    }).map((el)=>({
      text:((el instanceof HTMLInputElement ? (el.value||el.placeholder) : el.textContent)||'').trim().replace(/\s+/g,' ').slice(0,80),
      size:Number.parseFloat(getComputedStyle(el).fontSize||'0')
    }));
    return {count:rows.length,min:rows.length?Math.min(...rows.map((r)=>r.size)):null,under15:rows.filter((r)=>r.size<14.99).slice(0,20)};
  });
  report.type_samples.push({stage,...result});
  check(result.under15.length===0,`${stage}_visible_type_floor_15`,JSON.stringify(result.under15));
  return result.min;
}
const answerLetters=(value)=>(String(value||'').toUpperCase().match(/[A-Z]/g)||[]).sort();
const makeIdFactory=()=>{let i=0;return(prefix)=>`${prefix}-practice-fixture-${++i}`;};

const system=loadXizongSystem('circulation');
const sweep=loadXizongSystemQuestionSweep(system);
check(system?.canonicalId==='A1','fixture_a1_system');
check(sweep?.questions?.length===376,'fixture_a1_question_truth',String(sweep?.questions?.length||0));
const blockIds=(system?.blocks||[]).map((block)=>String(block?.blockId||'')).filter(Boolean);
const holdoutYear=Number(sweep.years[0]);
const eligible=sweep.questions.filter((q)=>Number(q.year)!==holdoutYear);
const firstQuestion=eligible[0];
const wrongOption=firstQuestion.options.find((option)=>!answerLetters(firstQuestion.correctAnswer).includes(option.label));
check(Boolean(wrongOption),'fixture_wrong_option');
check(Array.isArray(firstQuestion.explanation?.reasoningChain)&&firstQuestion.explanation.reasoningChain.length>0,'fixture_reasoning_chain_projected',firstQuestion.questionId);

const reviewedTarget=eligible.find((q)=>q.relation?.knowledgePath && ['RESOLVED_KP','RESOLVED_BLOCK','BLOCK_ONLY'].includes(q.relation?.targetStatus));
const missingTarget=eligible.find((q)=>q.questionId!==reviewedTarget?.questionId && !q.relation);
check(Boolean(reviewedTarget),'fixture_reviewed_relation');
check(Boolean(missingTarget),'fixture_missing_relation');

const attemptContext={
  systemId:sweep.systemId,
  canonicalId:sweep.canonicalId,
  scopeHash:sweep.scopeHash,
  questionInventoryHash:sweep.questionInventoryHash,
  questions:sweep.questions,
  holdoutYears:[holdoutYear]
};
const makeId=makeIdFactory();
let secondPassState=ensureXizongQuestionSweepState({results:{}},attemptContext,{now:'2026-09-18T01:00:00.000Z',makeId});
for (const question of eligible) {
  const status=question.questionId===reviewedTarget.questionId?'wrong':question.questionId===missingTarget.questionId?'uncertain':'stable';
  secondPassState=recordXizongQuestionAttempt(secondPassState,{
    question,status,selected:answerLetters(question.correctAnswer),context:attemptContext,holdoutYears:[holdoutYear]
  },{now:`2026-09-18T01:${String(eligible.indexOf(question)%60).padStart(2,'0')}:00.000Z`,makeId});
}
secondPassState=startNextXizongQuestionRound(
  secondPassState,
  eligible.map((q)=>q.questionId),
  {now:'2026-09-18T03:00:00.000Z',makeId},
  {studyPhase:'SECOND_PASS',queueMode:'TARGETED'}
);
const targetedIds=deriveXizongQuestionIdsForCurrentRound(secondPassState,sweep.questions,[holdoutYear]);
check(targetedIds.length===2,'fixture_second_pass_two_targets',targetedIds.join(','));

const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port',String(PORT)],{
  cwd:process.cwd(),stdio:['ignore','pipe','pipe'],detached:process.platform!=='win32'
});
let browser;
try {
  await waitForHttp(`${BASE}/xizong/circulation/`);
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:982}});
  const page=await context.newPage();
  const recallKey='kianos:xizong:system-recall:circulation:v1';
  const holdoutKey='kianos:xizong:full-paper-holdout-years:v1';
  const sweepKey='kianos:xizong:system-question-sweep:circulation:v1';

  await page.goto(`${BASE}/xizong/circulation/`,{waitUntil:'networkidle'});
  await page.evaluate((ids)=>{
    for(const key of Object.keys(localStorage)) if(key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
    for(const id of ids) localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`,JSON.stringify({completed:true}));
  },blockIds);
  await page.reload({waitUntil:'networkidle'});

  const stage=page.locator('[data-xizong-later-stage="system-exit"]');
  await stage.evaluate((node)=>{node.open=true;});
  const recall=page.locator('[data-xizong-system-exit="circulation"]');
  await recall.waitFor({state:'visible'});
  check(await recall.locator('[data-recall-workspace]').isVisible(),'recall_workspace_visible');
  check(await recall.locator('[data-recall-scratch]').count()===0,'recall_scratch_absent');
  check(await recall.locator('[data-question-map]').count()===0,'questions_not_owned_by_system_recall');
  await scanVisibleType(recall,'recall_front');
  await recall.locator('[data-recall-workspace]').scrollIntoViewIfNeeded();
  await page.screenshot({path:recallShot,fullPage:false});

  await recall.locator('[data-reveal-recall]').click();
  check(await recall.locator('[data-recall-reveal]').isVisible(),'recall_reveal_visible');
  check(await recall.locator('.xseRecallPaper').count()===1,'recall_reveal_is_one_editorial_surface');
  await scanVisibleType(recall,'recall_reveal');
  await page.screenshot({path:recallRevealShot,fullPage:false});

  await recall.locator('[data-complete-recall]').click();
  check(await recall.locator('[data-practice-handoff]').isVisible(),'practice_handoff_visible');
  const handoffHref=await recall.locator('[data-practice-handoff] a').getAttribute('href');
  check(String(handoffHref||'').includes('/xizong/practice/circulation/'),'handoff_targets_dedicated_practice',String(handoffHref));
  const recallState=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),recallKey);
  check(Boolean(recallState?.completedAt),'recall_completion_persisted');

  await page.goto(`${BASE}/xizong/practice/circulation/`,{waitUntil:'networkidle'});
  const practice=page.locator('[data-xizong-practice="circulation"]');
  await practice.waitFor({state:'visible'});
  check(await practice.locator('[data-holdout-gate]').isVisible(),'practice_holdout_gate_visible_without_setting');
  check(await practice.locator('[data-question-map]').count()===1,'practice_owns_question_map');
  check(await practice.locator('[data-reasoning-chain]').count()===1,'practice_owns_reasoning_chain_projection');

  await practice.locator('.xzpMore').evaluate((node)=>{node.open=true;});
  await practice.locator('[data-holdout-control]').evaluate((node)=>{node.open=true;});
  await practice.locator('[data-holdout-input]').fill(String(holdoutYear));
  await practice.locator('[data-save-holdout]').click();
  check(!(await practice.locator('.xzpMore').evaluate((node)=>node.open)),'practice_settings_close_after_holdout_save');
  await practice.locator('[data-question-card]').waitFor({state:'visible'});
  check((await practice.locator('[data-question-stem]').textContent()||'').trim().length>10,'practice_question_stem_visible');
  check(await practice.locator('.xzpOption').count()>=4,'practice_options_visible');
  check(await practice.locator('.xzpMapItem').count()>10,'practice_map_populated');

  const geometry=await practice.evaluate((node)=>{
    const box=node.getBoundingClientRect();
    const map=node.querySelector('[data-question-map]');
    const q=node.querySelector('.xzpQuestionPane');
    const review=node.querySelector('.xzpReviewPane');
    return {
      top:box.top,bottom:box.bottom,height:box.height,viewport:window.innerHeight,
      mapOverflow:getComputedStyle(map).overflowY,
      qOverflow:getComputedStyle(q).overflowY,
      reviewOverflow:getComputedStyle(review).overflowY,
      fontFamily:getComputedStyle(node).fontFamily
    };
  });
  check(geometry.bottom<=geometry.viewport+2,'practice_primary_workbench_fits_one_viewport',JSON.stringify(geometry));
  check(['auto','scroll'].includes(geometry.mapOverflow),'practice_map_has_local_scroll',JSON.stringify(geometry));
  check(['auto','scroll'].includes(geometry.qOverflow),'practice_question_has_local_scroll',JSON.stringify(geometry));
  check(['auto','scroll'].includes(geometry.reviewOverflow),'practice_review_has_local_scroll',JSON.stringify(geometry));
  report.practice_geometry=geometry;
  await page.screenshot({path:practiceFrontShot,fullPage:false});

  check((await practice.locator('[data-fast-sweep]').getAttribute('aria-pressed'))==='false','fast_off_default');
  await practice.locator('[data-fast-sweep]').click();
  check((await practice.locator('[data-fast-sweep]').getAttribute('aria-pressed'))==='true','fast_toggle_on');
  await practice.locator('[data-fast-sweep]').click();
  await practice.locator('[data-question-mark]').click();
  check((await practice.locator('[data-question-mark]').getAttribute('aria-pressed'))==='true','mark_set');
  await practice.locator('[data-question-mark]').click();
  check((await practice.locator('[data-question-mark]').getAttribute('aria-pressed'))==='false','mark_clear');

  await practice.locator(`.xzpOption[data-option="${wrongOption.label}"]`).click();
  await practice.locator('[data-submit-answer]').click();
  check(await practice.locator('[data-practice-back]').isVisible(),'wrong_auto_flips_to_back');
  check(!(await practice.locator('[data-practice-front]').isVisible()),'front_hidden_on_wrong_back');
  check(await practice.locator('[data-answer-panel]').isVisible(),'adaptive_explanation_visible_after_wrong');

  await practice.locator('[data-cause="options"]').click();
  await practice.locator('[data-attempt-note]').fill('需要回看选项边界');
  await practice.locator('[data-attempt-note]').blur();
  let reviewMeta = await page.evaluate(({key,id})=>{
    const state=JSON.parse(localStorage.getItem(key)||'null');
    return state?.reviewMeta?.[id]||null;
  },{key:sweepKey,id:firstQuestion.questionId});
  check(reviewMeta?.cause==='options','quick_cause_persisted',String(reviewMeta?.cause||''));
  check(reviewMeta?.note==='需要回看选项边界','quick_note_persisted',String(reviewMeta?.note||''));

  await page.keyboard.press('Space');
  check(await practice.locator('[data-practice-front]').isVisible(),'space_returns_to_front');
  check(!(await practice.locator('[data-practice-back]').isVisible()),'back_hidden_after_space');
  await page.keyboard.press('Space');
  check(await practice.locator('[data-practice-back]').isVisible(),'space_reopens_back');
  check((await practice.locator('[data-reasoning-chain] li').count())===firstQuestion.explanation.reasoningChain.length,'repeat_flip_keeps_reasoning_chain_idempotent');
  check(await practice.locator('[data-exam-target-wrap]').isVisible(),'exam_target_visible');
  check(await practice.locator('[data-decision-axis-wrap]').isVisible(),'decision_axis_visible');
  check(await practice.locator('[data-reasoning-chain-wrap]').isVisible(),'reasoning_chain_visible');
  const renderedChain=await practice.locator('[data-reasoning-chain] li').allTextContents();
  check(renderedChain.length===firstQuestion.explanation.reasoningChain.length,'reasoning_chain_count_exact',String(renderedChain.length));
  check(renderedChain[0]===firstQuestion.explanation.reasoningChain[0],'reasoning_chain_text_exact',renderedChain[0]||'');

  const optionalChecks=[
    ['correctOptionReason','[data-correct-reason-wrap]'],
    ['commonFailureNode','[data-failure-node-wrap]'],
    ['transferRule','[data-transfer-rule-wrap]']
  ];
  for(const [key,selector] of optionalChecks) {
    const expected=Boolean(String(firstQuestion.explanation?.[key]||'').trim());
    check((await practice.locator(selector).isVisible())===expected,`adaptive_${key}_visibility`,String(expected));
  }
  const distractorsExpected=Array.isArray(firstQuestion.explanation?.valuableDistractors)&&firstQuestion.explanation.valuableDistractors.length>0;
  check((await practice.locator('[data-distractors-wrap]').isVisible())===distractorsExpected,'adaptive_distractor_visibility',String(distractorsExpected));
  await scanVisibleType(practice,'practice_wrong_review');
  await page.screenshot({path:practiceShot,fullPage:false});

  const stored=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  check(stored?.results?.[firstQuestion.questionId]?.status==='wrong','practice_attempt_persisted');
  check((stored?.attemptHistory||[]).some((event)=>event.question_id===firstQuestion.questionId),'practice_attempt_history_append');

  await page.evaluate(({sweepKey,holdoutKey,state,year})=>{
    localStorage.setItem(sweepKey,JSON.stringify(state));
    localStorage.setItem(holdoutKey,JSON.stringify([year]));
  },{sweepKey,holdoutKey,state:secondPassState,year:holdoutYear});
  await page.reload({waitUntil:'networkidle'});
  const practice2=page.locator('[data-xizong-practice="circulation"]');
  check((await practice2.locator('[data-study-phase]').textContent()||'').includes('二轮'),'second_pass_label_visible');
  check(await practice2.locator('.xzpMapItem').count()===2,'second_pass_targeted_scope_two_items');

  const currentMeta=(await practice2.locator('[data-question-meta]').textContent()||'').trim();
  const target=sweep.questions.find((q)=>currentMeta.includes(String(q.year))&&currentMeta.includes(`第 ${q.number} 题`));
  check(Boolean(target),'second_pass_current_question_resolves',currentMeta);
  const wrong=target.options.find((option)=>!answerLetters(target.correctAnswer).includes(option.label));
  check(Boolean(wrong),'second_pass_wrong_option');
  await practice2.locator(`.xzpOption[data-option="${wrong.label}"]`).click();
  await practice2.locator('[data-submit-answer]').click();
  if(target.relation?.knowledgePath) {
    check(await practice2.locator('[data-relation-wrap]').isVisible(),'reviewed_relation_region_visible');
    check(await practice2.locator('[data-relation-link]').isVisible(),'reviewed_relation_link_visible');
    check((await practice2.locator('[data-relation-link]').getAttribute('href')||'').includes(String(target.relation.knowledgePath).replace(/^\/+/,'')),'reviewed_relation_exact_target');
  } else {
    check(!(await practice2.locator('[data-relation-wrap]').isVisible()),'missing_relation_stays_silent');
    check(await practice2.locator('[data-relation-fallback]').count()===0,'missing_relation_has_no_engineering_fallback');
  }

  report.status='PASS';
  report.finished_at=new Date().toISOString();
  report.holdout_year=holdoutYear;
  report.first_question=firstQuestion.questionId;
  report.second_pass_targets=targetedIds;
  report.min_visible_type_px=Math.min(...report.type_samples.map((row)=>row.min).filter(Number.isFinite));
  fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`);
  console.log(`XIZONG_RECALL_PRACTICE_WORKSPACE PASS | checks=${report.checks.length} | minType=${report.min_visible_type_px}`);
  await context.close();
} catch(error) {
  report.status='FAIL';
  report.finished_at=new Date().toISOString();
  report.error=String(error?.stack||error);
  fs.writeFileSync(reportPath,`${JSON.stringify(report,null,2)}\n`);
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if(process.platform==='win32') server.kill();
    else process.kill(-server.pid,'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
