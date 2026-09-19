import {chromium} from '../../static-web/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.ENGLISH_AUDIT_BASE||'http://127.0.0.1:4321';
const out=process.env.ENGLISH_AUDIT_DIR||'/mnt/data/english-audit';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1512,height:982}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.setDefaultTimeout(8000);page.on('dialog',d=>d.accept());
const results=[];
async function check(id,fn){try{await fn();results.push({id,status:'PASS'});}catch(e){results.push({id,status:'FAIL',error:e.message});}fs.writeFileSync(out+'/browser-attacks.json',JSON.stringify({synthetic_only:true,platform:process.platform,viewport:'1512x982',results,errors},null,2));}
async function go(path){await page.goto(base+path,{waitUntil:'networkidle'});}
await check('reading.full-question-sheet-before-submit',async()=>{
 await go('/reading/audit-synthetic-reading-0/');
 const rows=page.locator('[data-question]');assert.equal(await rows.count(),5);
 assert.deepEqual(await rows.evaluateAll(rs=>rs.map(r=>!r.hidden&&getComputedStyle(r).display!=='none')),[true,true,true,true,true]);
 assert.equal(await page.locator('[data-reading-result]').isVisible(),false);
 assert.ok((await rows.evaluateAll(rs=>rs.map(r=>r.getAttribute('data-answer')))).every(v=>v==='""'));
 await page.screenshot({path:out+'/reading-clean.png'});
});
await check('reading.stable-exit-no-review-debt',async()=>{
 for(let i=0;i<5;i++)await page.locator('[data-question]').nth(i).locator('[data-option="A"]').click();
 await page.locator('[data-reading-submit]').click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kianos-reading-attempt-v1:audit-synthetic-reading-0')||'{}').submitted===true);
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-reading-attempt-v1:audit-synthetic-reading-0')));assert.equal(Object.values(state.results).filter(v=>v==='correct').length,5);
 assert.equal(await page.locator('[data-reading-repair]:visible').count(),0);
 assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('transfer-store')).length),0);
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-reading-score]').textContent(),'5 / 5');
});
await check('cloze.twenty-rows-not-wizard-and-pre-submit-private',async()=>{
 await go('/cloze/audit-synthetic-cloze/');assert.equal(await page.locator('[data-objective-question]').count(),20);
 assert.ok((await page.locator('[data-objective-question]').evaluateAll(rs=>rs.map(r=>!r.hidden&&getComputedStyle(r).display!=='none'))).every(Boolean));
 await page.locator('[data-objective-question]').nth(7).locator('[data-value="B"]').click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-cloze-attempt-v1:audit-synthetic-cloze')));assert.equal(state.answers.q7,'B');assert.notEqual(state.submitted,true);
 assert.equal(await page.locator('[data-objective-formal]:visible').count(),0);await page.screenshot({path:out+'/cloze-clean.png'});
});
for(const form of ['gap_matching','heading_matching','ordering','comment_matching'])await check('partb.complete-map-'+form,async()=>{
 await go('/reading-b/audit-synthetic-partb-'+form+'/');assert.equal(await page.locator('[data-objective-question]').count(),5);
 assert.equal(await page.locator('[data-objective-candidate]').count(),7);
 assert.equal(await page.locator('[data-objective-formal]:visible').count(),0);
 if(form==='ordering')assert.equal(await page.locator('[data-reading-b-fixed]').count(),2);
 assert.equal(await page.locator('[data-objective-root]').getAttribute('data-reading-b-task-form'),form);
 await page.screenshot({path:out+'/partb-'+form+'.png'});
});
await check('translation.whole-source-and-five-fields',async()=>{
 await go('/translation/audit-synthetic-translation/');
 assert.equal(await page.locator('[data-attempt-id]').count(),5);
 await page.screenshot({path:out+'/translation-clean.png'});
});
await check('writing.direct-first-draft-preserved-after-refresh',async()=>{
 await go('/writing/audit-synthetic-writing-small/');assert.equal(await page.locator('[data-plan-mode][value="direct"]').isChecked(),true);
 await page.locator('[data-essay-draft]').fill('Dear friends, please join our workshop on Friday at two. We will compare useful tools and share our experiences. Please reply by Thursday. Best wishes.');
 await page.locator('[data-lock-first]').click();
 await page.waitForFunction(()=>!!JSON.parse(localStorage.getItem('kianos-writing-runtime-v1:audit-synthetic-writing-small')||'{}').firstDraft);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-writing-runtime-v1:audit-synthetic-writing-small')));
 assert.equal(before.firstPlan,'');await page.reload({waitUntil:'networkidle'});
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-writing-runtime-v1:audit-synthetic-writing-small')));assert.equal(after.firstDraft,before.firstDraft);
 await page.screenshot({path:out+'/writing-first-draft.png'});
});
await check('exam.start-isolated-and-navigation-keeps-clock',async()=>{
 await go('/english-exam/audit-synthetic-paper/');await page.locator('[data-exam-start]').click();await page.waitForURL('**/cloze/audit-synthetic-cloze/**');
 const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(session.steps.length,9);assert.equal(Date.parse(session.deadline_at)-Date.parse(session.started_at),180*60000);
 const initial=await page.evaluate(id=>JSON.parse(localStorage.getItem(`kianos-english-exam-task-v1:${id}:cloze:audit-synthetic-cloze`)||'{}'),session.session_id);assert.notEqual(initial.answers?.q7,'B');
 await page.locator('[data-objective-question]').nth(0).locator('[data-value="A"]').click();
 await page.locator('[data-exam-complete]').click();await page.waitForURL('**/reading/audit-synthetic-reading-0/**');
 assert.equal(await page.locator('[data-reading-result]').isVisible(),false);
 await page.reload({waitUntil:'networkidle'});
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(after.deadline_at,session.deadline_at);
 assert.equal(after.captures['cloze:audit-synthetic-cloze'].payload.answers.q0,'A');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-cloze-attempt-v1:audit-synthetic-cloze')).answers.q7),'B');
});
await check('exam.early-seal-retains-unfinished-work-and-release-60',async()=>{
 await page.locator('[data-question]').nth(0).locator('[data-option="A"]').click();await page.locator('[data-exam-return]').click();await page.locator('[data-exam-seal]').click();
 await page.locator('[data-exam-release]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')||'{}').status==='RELEASED');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));
 assert.equal(state.captures['reading_a:audit-synthetic-reading-0'].payload.answers.q0,'A');assert.equal(state.release.objective.max_points,60);assert.equal(state.release.productive.status,'CHAT_REVIEW_REQUIRED');
 await page.screenshot({path:out+'/exam-release.png'});
});
await context.storageState({path:out+'/synthetic-storage.json'});
await browser.close();
console.log(JSON.stringify({results,errors},null,2));
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
