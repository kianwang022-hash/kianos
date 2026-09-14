import assert from 'node:assert/strict';import fs from 'node:fs';import { chromium,webkit } from 'playwright';
import { loadXizongSystem } from '../src/lib/xizong.mjs';
import { listWritingSyntheticTasks } from '../src/lib/englishWritingSynthetic.mjs';
const base=process.env.SITE_FRAME_URL||'http://127.0.0.1:4348',fixture=process.env.SITE_FRAME_FIXTURE_URL||'http://127.0.0.1:4349';
const out='../output/playwright/issue148';const report={checks:[],errors:[],scope:'isolated synthetic local state with formal A1 data; SELF; no learner U'};
const browser=await chromium.launch({headless:!process.env.HEADED});const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
const read=k=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),k);
const pass=name=>{report.checks.push(name);console.log('PASS',name)};
const saveFailure=prefix=>page.evaluate(prefix=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith(prefix))throw new DOMException('isolated failure','QuotaExceededError');return window.__set.call(this,k,v)}},prefix);
const restore=()=>page.evaluate(()=>Storage.prototype.setItem=window.__set);
try{
 const wid=listWritingSyntheticTasks()[0].id;
 await page.goto(`${fixture}/writing/${wid}/`);await page.waitForTimeout(200);
 await page.check('[data-plan-mode][value=direct]');await page.fill('[data-essay-draft]','An isolated draft should stay in the textarea if saving is unavailable.');
 await saveFailure('kianos-writing-runtime-v1:');await page.click('[data-lock-first]');
 assert.equal(await page.locator('[data-runtime-stage=attempt]').isVisible(),true);assert.equal((await read(`kianos-writing-runtime-v1:${wid}`)).firstDraft,'');
 assert.match(await page.locator('[data-writing-save-feedback]').textContent(),/未能保存/);await restore();await page.click('[data-lock-first]');
 await page.locator('[data-runtime-stage=review]').waitFor({state:'visible'});const first=(await read(`kianos-writing-runtime-v1:${wid}`)).firstDraft;
 await page.fill('[data-authoring-revision]','A separate revised essay. It never replaces the original first draft.');await page.click('[data-save-authoring-revision]');
 await page.reload();assert.match(await page.locator('[data-authoring-revision]').inputValue(),/separate revised/);assert.equal((await read(`kianos-writing-runtime-v1:${wid}`)).firstDraft,first);
 pass('Writing storage failure blocks first lock; learner revision persists separately without Chat verdict');
 await page.goto(`${fixture}/translation/fixture-translation/`);await page.waitForTimeout(150);
 for(let i=0;i<5;i++)await page.locator('[data-attempt-id]').nth(i).fill('隔离译文 '+i);
 await saveFailure('kianos-translation-attempt-v2:');await page.click('[data-freeze-first]');assert.equal(await page.locator('[data-stage=attempt]').isVisible(),true);assert.equal((await read('kianos-translation-attempt-v2:fixture-translation')).stage,'attempt');await restore();
 pass('Translation mid-session save failure cannot advance or overwrite first evidence');
 await page.goto(`${base}/xizong/circulation/`);await page.waitForTimeout(250);
 const system=loadXizongSystem('circulation');
 await page.evaluate(blocks=>{for(const b of blocks)localStorage.setItem(`kianos-xizong-astro-v2:xizong:${b.blockId}`,JSON.stringify({completed:true}));},system.blocks);
 await page.locator('[data-xizong-later-stage] > summary').click();
 await page.locator('[data-start-recall]').click();await page.locator('[data-recall-dialog]').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-recall-reveal]').isVisible(),false);assert.equal(await page.locator('[data-recall-scratch]').isVisible(),true);
 await page.locator('[data-reveal-recall]').click();await page.locator('[data-complete-recall]').click();
 const data=await page.locator('[data-sweep-payload]').evaluate(e=>JSON.parse(e.textContent));
 await page.fill('[data-holdout-input]',String(data.years[0]));await page.click('[data-save-holdout]');await page.click('[data-start-sweep]');
 const key='kianos:xizong:system-question-sweep:circulation:v1';
 const qmap=new Map(data.questions.map(q=>[q.questionId,q]));const current=async()=>qmap.get((await read(key)).activeQuestionId);
 let q=await current();const wrong=q.options.find(o=>!q.correctAnswer.includes(o.label)).label;
 await page.locator(`[data-question-options] [data-option=${wrong}]`).click();await page.click('[data-submit-answer]');await page.locator('[data-answer-panel]').waitFor({state:'visible'});
 assert.equal((await read(key)).attemptHistory.length,1);assert.equal((await read(key)).results[q.questionId].status,'wrong');
 await page.click('[data-sweep-mark]');assert.equal((await read(key)).results[q.questionId].status,'wrong');assert.equal((await read(key)).attemptHistory.length,1);
 const exact=page.url();await page.reload();await page.locator('[data-question-workspace]').waitFor({state:'visible'});assert.equal(page.url(),exact);assert.equal((await current()).questionId,q.questionId);
 pass('A1 System Recall / holdout / first question evidence / Mark separate from WU / exact refresh');
 await page.selectOption('[data-sweep-visibility]','hidden');await page.check('[data-sweep-fast]');
 const active=data.questions.filter(q=>q.year!==data.years[0]);
 const openQuestion=async q=>{await page.locator('[data-sweep-map] button').nth(active.indexOf(q)).click();};
 const single=active.find(row=>row.questionType!=='X'&&row.questionId!==q.questionId);await openQuestion(single);
 const historyBefore=(await read(key)).attemptHistory.length;
 await page.locator('[data-question-options] [data-option]').first().click();
 assert.equal((await read(key)).attemptHistory.length,historyBefore+1);assert.notEqual((await current()).questionId,single.questionId);
 assert.equal(await page.locator('[data-answer-panel]').isVisible(),false);assert.equal(await page.locator('.xseSweepStats').isVisible(),false);assert.equal(await page.locator('[data-xizong-repair-return]').isVisible(),false);
 const multi=active.find(row=>row.questionType==='X');assert.ok(multi);await openQuestion(multi);
 const beforeMulti=(await read(key)).attemptHistory.length;
 await page.locator('[data-question-options] [data-option]').nth(0).click();await page.locator('[data-question-options] [data-option]').nth(1).click();
 assert.equal((await read(key)).attemptHistory.length,beforeMulti);await page.keyboard.press('Enter');assert.equal((await read(key)).attemptHistory.length,beforeMulti+1);
 assert.equal(await page.locator('[data-answer-panel]').isVisible(),false);
 await page.screenshot({path:`${out}/xizong-hidden-fast.png`});pass('Hidden Fast single advances uniformly; multiple requires Enter; map/stats/repair cannot leak correctness');
 const unanswered=active.find(row=>![q.questionId,single.questionId,multi.questionId].includes(row.questionId));await openQuestion(unanswered);
 const failedHistory=(await read(key)).attemptHistory.length;await saveFailure(key);
 await page.locator('[data-question-options] [data-option]').first().click();if(unanswered.questionType==='X')await page.click('[data-submit-answer]');
 assert.equal((await read(key)).attemptHistory.length,failedHistory);assert.equal((await current()).questionId,unanswered.questionId);assert.equal(await page.locator('[data-sweep-save-error]').isVisible(),true);await restore();
 pass('Xizong failed answer persistence keeps question and first history unchanged');
 assert.deepEqual(report.errors,[]);pass('No uncaught browser errors in state stress');
}catch(error){report.failure=error.stack;throw error;}finally{fs.writeFileSync(`${out}/state-browser.json`,JSON.stringify(report,null,2)+'\n');await browser.close();}
if(process.env.RUN_WEBKIT){
const safari=await webkit.launch({timeout:15000});const sc=await safari.newContext({viewport:{width:1440,height:900}});const sp=await sc.newPage();
try{await sp.goto(`${fixture}/cloze/fixture-cloze/`);await sp.locator('[data-cloze-option]').first().click();await sp.reload();assert.equal(await sp.locator('.clozeQuestion:visible').count(),20);assert.equal(await sp.locator('.clozeOptions button.selected').count(),1);await sp.screenshot({path:`${out}/webkit-cloze.png`});pass('WebKit full Cloze sheet / selection persistence');}finally{await safari.close();fs.writeFileSync(`${out}/state-browser.json`,JSON.stringify(report,null,2)+'\n');}

}
