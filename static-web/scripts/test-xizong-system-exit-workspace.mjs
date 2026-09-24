import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { loadXizongSystem, loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongSystemQuestionSweep, loadXizongWholePaper, xizongQuestionSemanticRevisions } from '../src/lib/xizongQuestions.mjs';
import {
  ensureXizongQuestionSweepState,
  recordXizongQuestionAttempt,
  startNextXizongQuestionRound,
  deriveXizongQuestionIdsForCurrentRound
} from '../src/lib/xizongQuestionAttempts.mjs';
import {
  collectXizongRetainedEvidence
} from '../src/lib/xizongRetainedPractice.mjs';
import { scoreXizongPaperResults } from '../src/lib/xizongPaperScoring.mjs';

const PORT = 4338;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive:true });
const reportPath = path.join(auditDir, 'xizong-system-exit-workspace.json');
const recallShot = path.join(auditDir, 'xizong-system-exit-recall.png');
const recallRevealShot = path.join(auditDir, 'xizong-system-exit-recall-reveal.png');
const practiceFrontShot = path.join(auditDir, 'xizong-practice-workbench-front.png');
const practiceShot = path.join(auditDir, 'xizong-practice-workbench.png');
const retainedEntryShot = path.join(auditDir, 'xizong-practice-retained-entry.png');
const retainedWorkbenchShot = path.join(auditDir, 'xizong-practice-retained-workbench.png');
const paperFrontShot = path.join(auditDir, 'xizong-practice-paper-front.png');
const paperResultShot = path.join(auditDir, 'xizong-practice-paper-result.png');
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

const respiratorySystem=loadXizongSystem('respiratory');
const respiratorySweep=loadXizongSystemQuestionSweep(respiratorySystem);
check(Boolean(respiratorySweep?.questions?.length),'fixture_respiratory_question_truth',String(respiratorySweep?.questions?.length||0));
const respiratoryQuestion=respiratorySweep.questions.find((q)=>Number(q.year)!==holdoutYear);
check(Boolean(respiratoryQuestion),'fixture_respiratory_non_holdout_question');
const respiratoryContext={
  systemId:respiratorySweep.systemId,
  canonicalId:respiratorySweep.canonicalId,
  scopeHash:respiratorySweep.scopeHash,
  questionInventoryHash:respiratorySweep.questionInventoryHash,
  questions:respiratorySweep.questions,
  holdoutYears:[holdoutYear]
};
const respiratoryMakeId=makeIdFactory();
let respiratoryState=ensureXizongQuestionSweepState({results:{}},respiratoryContext,{now:'2026-09-18T05:00:00.000Z',makeId:respiratoryMakeId});
respiratoryState=recordXizongQuestionAttempt(respiratoryState,{
  question:respiratoryQuestion,
  status:'uncertain',
  selected:answerLetters(respiratoryQuestion.correctAnswer),
  context:respiratoryContext,
  holdoutYears:[holdoutYear]
},{now:'2026-09-18T05:10:00.000Z',makeId:respiratoryMakeId});
const markedFixture=eligible.find((q)=>![reviewedTarget.questionId,missingTarget.questionId].includes(q.questionId));
check(Boolean(markedFixture),'fixture_global_mark_question');

const paper2026=loadXizongWholePaper(2026);
check(paper2026.questionCount===165,'fixture_2026_paper_count',String(paper2026.questionCount));
const paperFirst=paper2026.questions[0];
const paperSecond=paper2026.questions[1];
const paperFirstWrong=paperFirst.options.find((option)=>!answerLetters(paperFirst.correctAnswer).includes(option.label));
check(Boolean(paperFirstWrong),'fixture_paper_wrong_option');

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
  await page.evaluate(()=>{
    for(const key of Object.keys(localStorage)) if(key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({waitUntil:'networkidle'});

  const entry=page.locator('[data-xizong-system-recall-entry]');
  check(await entry.isHidden(),'system_recall_entry_hidden_before_system_complete');

  const lastLocationKey='kianos-xizong-last-location-v1';
  const beforePrematureRoute=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  await page.goto(`${BASE}/xizong/circulation/recall/`,{waitUntil:'networkidle'});
  const lock=page.locator('[data-xizong-system-recall-lock]');
  await lock.waitFor({state:'visible'});
  check(await page.locator('[data-xizong-system-exit="circulation"]').isHidden(),'direct_recall_route_fails_closed_before_system_complete');
  const afterPrematureRecall=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  check(afterPrematureRecall?.href===beforePrematureRoute?.href,'locked_recall_does_not_hijack_resume');

  await page.goto(`${BASE}/xizong/practice/circulation/`,{waitUntil:'networkidle'});
  const prematurePractice=page.locator('[data-xizong-practice="circulation"]');
  await prematurePractice.locator('[data-chat-set-gate]').waitFor({state:'visible'});
  check((await prematurePractice.locator('[data-chat-set-error-title]').textContent()||'').includes('System Recall'),'direct_system_practice_fails_closed_before_recall');
  check(await prematurePractice.locator('[data-question-card]').isHidden(),'premature_system_practice_releases_no_question');
  check((await prematurePractice.locator('[data-chat-set-gate] a').getAttribute('href')||'').includes('/xizong/circulation/recall/'),'premature_system_practice_returns_to_recall');
  const afterPrematurePractice=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  check(afterPrematurePractice?.href===beforePrematureRoute?.href,'locked_practice_does_not_hijack_resume');

  await page.goto(`${BASE}/xizong/circulation/`,{waitUntil:'networkidle'});
  const completedBlockStates=Object.fromEntries(system.blocks.map((ref)=>{
    const block=loadXizongBlock('circulation',ref.slug);
    return [block.blockId,{
      completed:true,
      blockRecallDone:true,
      learned:Object.fromEntries(block.kpRecords.map((kp)=>[kp.kpId,true])),
      ratings:Object.fromEntries(block.kpRecords.map((kp)=>[kp.kpId,'known']))
    }];
  }));
  await page.evaluate((rows)=>{
    for(const [id,state] of Object.entries(rows)) localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`,JSON.stringify(state));
  },completedBlockStates);
  await page.reload({waitUntil:'networkidle'});
  await entry.waitFor({state:'visible'});
  const recallHref=await entry.locator('a').getAttribute('href');
  check(String(recallHref||'').includes('/xizong/circulation/recall/'),'system_recall_entry_targets_dedicated_route',String(recallHref));
  await entry.locator('a').click();
  await page.waitForURL(/\/xizong\/circulation\/recall\//);
  const releasedRecallLocation=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  check(releasedRecallLocation?.resumeKind==='SYSTEM_RECALL','released_system_recall_becomes_resume');

  check(await page.locator('[data-xizong-system-recall-page]').isVisible(),'dedicated_recall_page_visible');
  check(await page.locator('[data-xizong-later-stage="system-exit"]').count()===0,'recall_not_embedded_in_system_details');
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
  const releasedPracticeLocation=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  check(releasedPracticeLocation?.resumeKind==='PRACTICE_SYSTEM','released_system_practice_becomes_resume');
  check(await practice.locator('[data-holdout-gate]').isHidden(),'practice_holdout_is_optional_without_setting');
  check(await practice.locator('[data-question-card]').isVisible(),'practice_available_without_holdout_setting');
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
  const currentMeta=(await practice.locator('[data-question-meta]').textContent()||'').trim();
  const currentQuestion=sweep.questions.find((q)=>currentMeta.includes(String(q.year))&&currentMeta.includes(`第 ${q.number} 题`));
  check(Boolean(currentQuestion),'practice_current_question_resolves',currentMeta);
  const currentWrongOption=currentQuestion.options.find((option)=>!answerLetters(currentQuestion.correctAnswer).includes(option.label));
  check(Boolean(currentWrongOption),'practice_current_wrong_option');

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

  await practice.locator(`.xzpOption[data-option="${currentWrongOption.label}"]`).click();
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
  },{key:sweepKey,id:currentQuestion.questionId});
  check(reviewMeta?.cause==='options','quick_cause_persisted',String(reviewMeta?.cause||''));
  check(reviewMeta?.note==='需要回看选项边界','quick_note_persisted',String(reviewMeta?.note||''));

  await page.keyboard.press('Space');
  check(await practice.locator('[data-practice-front]').isVisible(),'space_returns_to_front');
  check(!(await practice.locator('[data-practice-back]').isVisible()),'back_hidden_after_space');
  await page.keyboard.press('Space');
  check(await practice.locator('[data-practice-back]').isVisible(),'space_reopens_back');
  check((await practice.locator('[data-reasoning-chain] li').count())===currentQuestion.explanation.reasoningChain.length,'repeat_flip_keeps_reasoning_chain_idempotent');
  check(await practice.locator('[data-exam-target-wrap]').isVisible(),'exam_target_visible');
  check(await practice.locator('[data-decision-axis-wrap]').isVisible(),'decision_axis_visible');
  check(await practice.locator('[data-reasoning-chain-wrap]').isVisible(),'reasoning_chain_visible');
  const renderedChain=await practice.locator('[data-reasoning-chain] li').allTextContents();
  check(renderedChain.length===currentQuestion.explanation.reasoningChain.length,'reasoning_chain_count_exact',String(renderedChain.length));
  check(renderedChain[0]===currentQuestion.explanation.reasoningChain[0],'reasoning_chain_text_exact',renderedChain[0]||'');

  const optionalChecks=[
    ['correctOptionReason','[data-correct-reason-wrap]'],
    ['commonFailureNode','[data-failure-node-wrap]'],
    ['transferRule','[data-transfer-rule-wrap]']
  ];
  for(const [key,selector] of optionalChecks) {
    const expected=Boolean(String(currentQuestion.explanation?.[key]||'').trim());
    check((await practice.locator(selector).isVisible())===expected,`adaptive_${key}_visibility`,String(expected));
  }
  const distractorsExpected=Array.isArray(currentQuestion.explanation?.valuableDistractors)&&currentQuestion.explanation.valuableDistractors.length>0;
  check((await practice.locator('[data-distractors-wrap]').isVisible())===distractorsExpected,'adaptive_distractor_visibility',String(distractorsExpected));
  await scanVisibleType(practice,'practice_wrong_review');
  await page.screenshot({path:practiceShot,fullPage:false});

  const stored=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  check(stored?.results?.[currentQuestion.questionId]?.status==='wrong','practice_attempt_persisted');
  check((stored?.attemptHistory||[]).some((event)=>event.question_id===currentQuestion.questionId),'practice_attempt_history_append');

  await page.keyboard.press('Enter');
  await practice.locator('[data-question-card]').waitFor({state:'visible'});
  const uncertainMeta=(await practice.locator('[data-question-meta]').textContent()||'').trim();
  const uncertainQuestion=sweep.questions.find((q)=>uncertainMeta.includes(String(q.year))&&uncertainMeta.includes(`第 ${q.number} 题`));
  check(Boolean(uncertainQuestion),'uncertain_fixture_question_resolves',uncertainMeta);
  await page.keyboard.press('u');
  check((await practice.locator('[data-question-uncertain]').getAttribute('aria-pressed'))==='true','uncertain_toggle_on');
  for(const label of answerLetters(uncertainQuestion.correctAnswer)) {
    await practice.locator(`.xzpOption[data-option="${label}"]`).click();
  }
  await practice.locator('[data-submit-answer]').click();
  await practice.locator('[data-practice-back]').waitFor({state:'visible'});
  check((await practice.locator('[data-answer-result]').textContent()||'').includes('不确定'),'correct_unsure_opens_uncertain_review');
  const uncertainStored=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  check(uncertainStored?.results?.[uncertainQuestion.questionId]?.status==='uncertain','correct_unsure_persists_uncertain');
  check((uncertainStored?.attemptHistory||[]).some((event)=>event.question_id===uncertainQuestion.questionId&&event.status==='uncertain'),'uncertain_attempt_history_append');

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

  const currentCirculationState=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),sweepKey);
  const retainedMarkOverrides={ [markedFixture.questionId]:true };
  const expectedRetained=collectXizongRetainedEvidence([
    [sweepKey,currentCirculationState],
    ['kianos:xizong:system-question-sweep:respiratory:v1',respiratoryState]
  ],{holdoutYears:[holdoutYear],markOverrides:retainedMarkOverrides,
    questionSemanticRevisions:xizongQuestionSemanticRevisions([...sweep.questions,...respiratorySweep.questions])});
  check(expectedRetained.wrongUncertainIds.length>=2,'fixture_retained_wu_cross_scope',String(expectedRetained.wrongUncertainIds.length));
  check(expectedRetained.markedIds.includes(markedFixture.questionId),'fixture_retained_marked_scope',markedFixture.questionId);

  await page.evaluate(({respiratoryState,holdoutYear,markedId})=>{
    localStorage.setItem('kianos:xizong:system-question-sweep:respiratory:v1',JSON.stringify(respiratoryState));
    localStorage.setItem('kianos:xizong:full-paper-holdout-years:v1',JSON.stringify([holdoutYear]));
    const prefs=JSON.parse(localStorage.getItem('kianos:xizong:question-preferences:v1')||'{}');
    localStorage.setItem('kianos:xizong:question-preferences:v1',JSON.stringify({
      ...prefs,
      questionMarks:{...(prefs.questionMarks||{}),[markedId]:true}
    }));
  },{respiratoryState,holdoutYear,markedId:markedFixture.questionId});

  await page.goto(`${BASE}/xizong/practice/`,{waitUntil:'networkidle'});
  const retainedEntry=page.locator('[data-retained-entry]');
  await retainedEntry.waitFor({state:'visible'});
  check(Number(await retainedEntry.locator('[data-retained-count="WU"]').textContent())===expectedRetained.wrongUncertainIds.length,'retained_landing_wu_count');
  check(Number(await retainedEntry.locator('[data-retained-count="MARKED"]').textContent())===expectedRetained.markedIds.length,'retained_landing_marked_count');
  await page.screenshot({path:retainedEntryShot,fullPage:false});

  await retainedEntry.locator('[data-retained-mode="WU"]').click();
  await page.waitForURL(/\/xizong\/practice\/retained\//);
  const retainedPractice=page.locator('[data-xizong-practice="retained"]');
  await retainedPractice.locator('[data-question-card]').waitFor({state:'visible'});
  check((await retainedPractice.locator('[data-practice-scope-title]').textContent()||'').includes('错题 / 不确定'),'retained_wu_title');
  check(await retainedPractice.locator('.xzpMapItem').count()===expectedRetained.wrongUncertainIds.length,'retained_wu_map_exact_count');
  const firstRetainedId=expectedRetained.wrongUncertainIds[0];
  const firstRetainedMatch=firstRetainedId.match(/official-(\d{4})-n(\d{3})/);
  const retainedMeta=(await retainedPractice.locator('[data-question-meta]').textContent()||'').trim();
  check(Boolean(firstRetainedMatch)&&retainedMeta.includes(firstRetainedMatch[1])&&retainedMeta.includes(`第 ${Number(firstRetainedMatch[2])} 题`),'retained_wu_preserves_recency_order',retainedMeta);
  await scanVisibleType(retainedPractice,'practice_retained_wu');
  await page.screenshot({path:retainedWorkbenchShot,fullPage:false});

  const currentRetainedMeta=retainedMeta;
  const currentRetainedQuestion=sweep.questions.find((q)=>currentRetainedMeta.includes(String(q.year))&&currentRetainedMeta.includes(`第 ${q.number} 题`))
    || respiratorySweep.questions.find((q)=>currentRetainedMeta.includes(String(q.year))&&currentRetainedMeta.includes(`第 ${q.number} 题`));
  check(Boolean(currentRetainedQuestion),'retained_current_question_resolves_for_mark_toggle',currentRetainedMeta);
  await retainedPractice.locator('[data-question-mark]').click();
  let globalPreferences=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos:xizong:question-preferences:v1')||'{}'));
  check(globalPreferences?.questionMarks?.[currentRetainedQuestion.questionId]===true,'retained_mark_toggle_sets_global_override');
  await retainedPractice.locator('[data-question-mark]').click();
  globalPreferences=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos:xizong:question-preferences:v1')||'{}'));
  check(globalPreferences?.questionMarks?.[currentRetainedQuestion.questionId]===false,'retained_unmark_toggle_sets_global_override_false');

  await page.goto(`${BASE}/xizong/practice/`,{waitUntil:'networkidle'});
  const retainedEntry2=page.locator('[data-retained-entry]');
  check(Number(await retainedEntry2.locator('[data-retained-count="MARKED"]').textContent())===expectedRetained.markedIds.length,'retained_marked_count_stable_after_other_unmark');
  await retainedEntry2.locator('[data-retained-mode="MARKED"]').click();
  await page.waitForURL(/\/xizong\/practice\/retained\//);
  const markedPractice=page.locator('[data-xizong-practice="retained"]');
  await markedPractice.locator('[data-question-card]').waitFor({state:'visible'});
  check((await markedPractice.locator('[data-practice-scope-title]').textContent()||'').includes('已标记'),'retained_marked_title');
  check(await markedPractice.locator('.xzpMapItem').count()===expectedRetained.markedIds.length,'retained_marked_map_exact_count');

  report.retained={
    wu_count:expectedRetained.wrongUncertainIds.length,
    marked_count:expectedRetained.markedIds.length,
    cross_system_question:respiratoryQuestion.questionId
  };

  const paperKey='kianos:xizong:paper-question-sweep:paper-2026:v1';
  await page.evaluate(({paperKey,holdoutKey,otherYear})=>{
    localStorage.removeItem(paperKey);
    localStorage.setItem(holdoutKey,JSON.stringify([otherYear,2026]));
  },{paperKey,holdoutKey,otherYear:holdoutYear});
  await page.goto(`${BASE}/xizong/practice/paper/2026/`,{waitUntil:'networkidle'});
  const paperPractice=page.locator('[data-xizong-practice="paper-2026"]');
  const paperResumeLocation=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),lastLocationKey);
  check(paperResumeLocation?.resumeKind==='PAPER','whole_paper_becomes_resume');
  await paperPractice.locator('[data-question-card]').waitFor({state:'visible'});
  check((await paperPractice.locator('[data-practice-scope-title]').textContent()||'').includes('2026'),'paper_2026_title');
  check((await paperPractice.locator('.xzpResultMode').textContent()||'').includes('隐藏'),'paper_result_hidden_label');
  check(await paperPractice.locator('.xzpMapItem').count()===165,'paper_2026_map_count');
  check(await paperPractice.locator('[data-paper-seal]').isVisible(),'paper_seal_control_visible');
  await scanVisibleType(paperPractice,'practice_paper_front');
  await page.screenshot({path:paperFrontShot,fullPage:false});

  await paperPractice.locator(`.xzpOption[data-option="${paperFirstWrong.label}"]`).click();
  await paperPractice.locator('[data-submit-answer]').click();
  await page.waitForTimeout(260);

  await paperPractice.locator('.xzpMapItem').first().click();
  await paperPractice.locator('[data-question-card]').waitFor({state:'visible'});
  check(await paperPractice.locator('.xzpOption.correct').count()===0,'paper_hidden_no_correct_option_leak');
  check(await paperPractice.locator('.xzpOption.wrong').count()===0,'paper_hidden_no_wrong_option_leak');
  check(await paperPractice.locator('[data-practice-back]').isHidden(),'paper_hidden_back_locked');
  check(await paperPractice.locator('[data-review-toggle]').isHidden(),'paper_hidden_review_toggle_locked');
  let paperBeforeSeal=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),paperKey);
  check(Array.isArray(paperBeforeSeal?.paperDraftAnswers?.[paperFirst.questionId]?.selected),'paper_hidden_draft_persisted');
  check(!paperBeforeSeal?.results?.[paperFirst.questionId],'paper_unsealed_has_no_formal_attempt_result');
  check(!(paperBeforeSeal?.attemptHistory||[]).some((event)=>event.question_id===paperFirst.questionId),'paper_unsealed_has_no_attempt_event');
  check(!paperBeforeSeal?.paperSeal?.sealedAt,'paper_not_sealed_before_submit');
  check(await paperPractice.locator('.xzpOption:disabled').count()===0,'paper_draft_answer_remains_editable');
  check((await paperPractice.locator('[data-submit-answer]').textContent()||'').includes('更新答案'),'paper_draft_update_action_visible');

  for(const label of answerLetters(paperFirst.correctAnswer)) {
    await paperPractice.locator(`.xzpOption[data-option="${label}"]`).click();
  }
  await paperPractice.locator('[data-submit-answer]').click();
  await page.waitForTimeout(240);
  paperBeforeSeal=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),paperKey);
  check(JSON.stringify(paperBeforeSeal?.paperDraftAnswers?.[paperFirst.questionId]?.selected||[])===JSON.stringify(answerLetters(paperFirst.correctAnswer)),'paper_draft_can_be_changed_before_seal');

  await paperPractice.locator('.xzpMapItem').first().click();
  await paperPractice.locator(`.xzpOption[data-option="${paperFirstWrong.label}"]`).click();
  await paperPractice.locator('[data-submit-answer]').click();
  await page.waitForTimeout(240);
  paperBeforeSeal=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),paperKey);
  check((paperBeforeSeal?.paperDraftAnswers?.[paperFirst.questionId]?.selected||[]).includes(paperFirstWrong.label),'paper_draft_final_wrong_selection_restored');

  await paperPractice.locator('.xzpMapItem').nth(1).click();
  await paperPractice.locator('[data-question-uncertain]').click();
  check((await paperPractice.locator('[data-question-uncertain]').getAttribute('aria-pressed'))==='true','paper_uncertain_toggle_on');
  for(const label of answerLetters(paperSecond.correctAnswer)) {
    await paperPractice.locator(`.xzpOption[data-option="${label}"]`).click();
  }
  await paperPractice.locator('[data-submit-answer]').click();
  await page.waitForTimeout(260);

  const preSealState=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),paperKey);
  check(preSealState?.paperDraftAnswers?.[paperSecond.questionId]?.uncertain===true,'paper_uncertain_draft_persisted');
  const expectedPaperSummary=scoreXizongPaperResults(paper2026.paperFormat,paper2026.questions,preSealState?.paperDraftAnswers||{});
  check(expectedPaperSummary.correctCount===1&&expectedPaperSummary.wrongCount===1,'paper_fixture_score_shape',JSON.stringify(expectedPaperSummary));

  await paperPractice.locator('[data-paper-seal]').click();
  await paperPractice.locator('[data-paper-result]').waitFor({state:'visible'});
  check(Number(await paperPractice.locator('[data-paper-earned]').textContent())===expectedPaperSummary.earnedScore,'paper_score_released_after_seal');
  check(Number(await paperPractice.locator('[data-paper-max]').textContent())===300,'paper_score_max_300');
  check(Number(await paperPractice.locator('[data-paper-correct]').textContent())===1,'paper_correct_count_released');
  check(Number(await paperPractice.locator('[data-paper-wrong]').textContent())===1,'paper_wrong_count_released');
  check(Number(await paperPractice.locator('[data-paper-unanswered]').textContent())===163,'paper_unanswered_count_released');
  check((await paperPractice.locator('.xzpResultMode').textContent()||'').includes('已出分'),'paper_result_mode_changes_after_seal');
  await scanVisibleType(paperPractice,'practice_paper_result');
  await page.screenshot({path:paperResultShot,fullPage:false});

  const paperAfterSeal=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'null'),paperKey);
  check(Boolean(paperAfterSeal?.paperSeal?.sealedAt),'paper_seal_persisted');
  check(paperAfterSeal?.results?.[paperFirst.questionId]?.status==='wrong','paper_seal_materializes_wrong_attempt');
  check(paperAfterSeal?.results?.[paperSecond.questionId]?.status==='uncertain','paper_seal_materializes_correct_uncertain_attempt');
  check((paperAfterSeal?.attemptHistory||[]).filter((event)=>event.result_visibility==='hidden').length===2,'paper_seal_materializes_hidden_attempt_events');
  const holdoutAfterPaperSeal=await page.evaluate((key)=>JSON.parse(localStorage.getItem(key)||'[]'),holdoutKey);
  check(!holdoutAfterPaperSeal.map(Number).includes(2026),'paper_seal_releases_consumed_year_from_holdout');
  check(holdoutAfterPaperSeal.map(Number).includes(holdoutYear),'paper_seal_preserves_other_holdout_years');
  await paperPractice.locator('[data-paper-review-start]').click();
  await paperPractice.locator('[data-question-card]').waitFor({state:'visible'});
  check(await paperPractice.locator('.xzpOption.correct').count()>=1,'paper_review_releases_correct_option');
  check(await paperPractice.locator('.xzpOption.wrong').count()>=1,'paper_review_releases_wrong_option');
  check(await paperPractice.locator('[data-review-toggle]').isVisible(),'paper_review_toggle_released');
  await paperPractice.locator('[data-review-toggle]').click();
  await paperPractice.locator('[data-practice-back]').waitFor({state:'visible'});
  check((await paperPractice.locator('[data-correct-answer]').textContent()||'').trim().length>0,'paper_review_releases_correct_answer');

  report.paper={
    year:2026,
    question_count:paper2026.questionCount,
    answered_before_seal:expectedPaperSummary.answeredCount,
    earned_score:expectedPaperSummary.earnedScore,
    max_score:expectedPaperSummary.maxScore
  };

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
