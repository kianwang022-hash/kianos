// Fresh full journeys on production components with synthetic materials only.
import {chromium} from '../../static-web/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';
const base=process.env.ENGLISH_AUDIT_BASE||'http://127.0.0.1:4321',out=process.env.ENGLISH_AUDIT_DIR||'/mnt/data/english-audit';fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[];const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function context(){const c=await browser.newContext({viewport:{width:1512,height:982}});const p=await c.newPage();p.setDefaultTimeout(10000);p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));return[c,p];}
async function check(id,fn){try{await fn();checks.push({id,status:'PASS'});}catch(e){checks.push({id,status:'FAIL',error:e.stack});}fs.writeFileSync(out+'/deep-browser-attacks.json',JSON.stringify({synthetic_only:true,platform:process.platform,checks,errors},null,2));}
await check('exam.all-nine-sections-real-browser-production-capture-and-release',async()=>{
const[c,p]=await context();await p.goto(base+'/english-exam/audit-synthetic-paper/',{waitUntil:'networkidle'});await p.locator('[data-exam-start]').click();await p.waitForURL('**/cloze/audit-synthetic-cloze/**');
const session=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));
for(let step=0;step<9;step++){
 const s=session.steps[step];await p.waitForSelector('[data-exam-complete]');
 if(s.task==='cloze')for(let i=0;i<20;i++)await p.locator('[data-objective-question]').nth(i).locator('[data-value="A"]').click();
 if(s.task==='reading_a')for(let i=0;i<5;i++)await p.locator('[data-question]').nth(i).locator('[data-option="A"]').click();
 if(s.task==='reading_b')for(let i=0;i<5;i++)await p.locator('[data-reading-b-select]').nth(i).selectOption('BCEFG'[i]);
 if(s.task==='translation')for(let i=0;i<5;i++)await p.locator('[data-attempt-id]').nth(i).fill('使用者谨慎使用工具时，工作坊可能帮助一部分学习者。'+i);
 if(s.task==='writing')await p.locator('[data-essay-draft]').fill('Dear friends, please join our workshop on Friday. We will compare useful tools and discuss how thoughtful use creates value. Please reply before Thursday. Best wishes. '+s.writing_kind);
 assert.equal(await p.locator('[data-reading-result]:visible,[data-objective-formal]:visible').count(),0);
 await p.locator('[data-exam-complete]').click();
 if(step<8)await p.waitForURL(url=>url.searchParams.get('exam_step')===session.steps[step+1].step_id);else await p.waitForURL('**/english-exam/audit-synthetic-paper/');
 await p.waitForLoadState('networkidle');
}
let finished=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(Object.keys(finished.captures).length,9);assert.equal(finished.deadline_at,session.deadline_at);assert.equal(finished.status,'ACTIVE');
await p.locator('[data-exam-seal]').click();await p.locator('[data-exam-release]').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')).status==='RELEASED');
finished=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(finished.release.objective.points,60);assert.equal(finished.release.productive.status,'CHAT_REVIEW_REQUIRED');assert.equal(finished.release.productive.score,undefined);
assert.equal(Object.values(finished.captures).filter(c=>c.task==='writing').length,2);assert.ok(Object.values(finished.captures).filter(c=>c.task==='writing').every(c=>JSON.stringify(c.payload).includes('Dear friends')));assert.ok(JSON.stringify(finished.captures['translation:audit-synthetic-translation']).includes('工作坊'));
const storage=await p.evaluate(()=>({...localStorage}));assert.equal(Object.keys(storage).filter(k=>/^kianos-(reading-attempt|cloze-attempt|reading-b-attempt|translation-attempt|writing-runtime)/.test(k)).length,0);
assert.equal(Object.keys(JSON.parse(storage['kianos-english-material-exposure-v1']).materials).length,9);
await p.screenshot({path:out+'/exam-nine-sections.png'});await p.goto(base+'/reading/audit-synthetic-reading-0/',{waitUntil:'networkidle'});const ordinary=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-reading-attempt-v1:audit-synthetic-reading-0')));assert.equal(ordinary.binding.prior_exposure,'exposed');assert.deepEqual(ordinary.answers,{});await c.close();
});
await check('exam.preexisting-study-answers-isolated-with-shared-exposure',async()=>{
 const[c,p]=await context();await p.goto(base+'/cloze/audit-synthetic-cloze/',{waitUntil:'networkidle'});await p.locator('[data-objective-question]').nth(0).locator('[data-value="B"]').click();const before=await p.evaluate(()=>localStorage.getItem('kianos-cloze-attempt-v1:audit-synthetic-cloze'));
 await p.goto(base+'/english-exam/audit-synthetic-paper/',{waitUntil:'networkidle'});await p.locator('[data-exam-start]').click();await p.waitForURL('**/cloze/audit-synthetic-cloze/**');await p.waitForLoadState('networkidle');
 const state=await p.evaluate(()=>{const exam=JSON.parse(localStorage.getItem('kianos-english-exam-session-v1'));return {draft:JSON.parse(localStorage.getItem('kianos-english-exam-task-v1:'+exam.session_id+':cloze:audit-synthetic-cloze')),ordinary:localStorage.getItem('kianos-cloze-attempt-v1:audit-synthetic-cloze')};});assert.equal(state.ordinary,before);assert.deepEqual(state.draft.answers,{});assert.equal(state.draft.binding.prior_exposure,'exposed');await c.close();
});
await check('exam.deadline-auto-seals-without-three-hours-of-learner-use',async()=>{
const[c,p]=await context();await p.clock.install({time:new Date('2026-09-19T09:00:00Z')});await p.goto(base+'/english-exam/audit-synthetic-paper/',{waitUntil:'networkidle'});await p.locator('[data-exam-start]').click();await p.waitForURL('**/cloze/audit-synthetic-cloze/**');await p.locator('[data-objective-question]').nth(0).locator('[data-value="B"]').click();await p.clock.fastForward(180*60000+1000);await p.waitForURL('**/english-exam/audit-synthetic-paper/');
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(s.status,'SEALED');assert.equal(s.captures['cloze:audit-synthetic-cloze'].payload.answers.q0,'B');assert.equal(await p.locator('[data-exam-home-clock]').textContent(),'00:00');await c.close();
});
await check('translation.full-first-attempt-pass-reference-and-refresh',async()=>{
const[c,p]=await context();await p.goto(base+'/translation/audit-synthetic-translation/',{waitUntil:'networkidle'});assert.equal(await p.locator('[data-reference-panel]:visible').count(),0);
await p.locator('[data-attempt-id]').first().fill('首句');await p.locator('[data-freeze-first]').click();let s=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-translation-attempt-v2:audit-synthetic-translation')));assert.ok(!s.firstSubmittedAt);
for(let i=0;i<5;i++)await p.locator('[data-attempt-id]').nth(i).fill('工具可能在某些条件下帮助一部分学习者。'+i);await p.locator('[data-freeze-first]').click();await p.waitForSelector('[data-pass-clean]');s=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-translation-attempt-v2:audit-synthetic-translation')));assert.equal(Object.keys(s.firstAttempts).length,5);await p.locator('[data-pass-clean]').click();await p.reload({waitUntil:'networkidle'});const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-translation-attempt-v2:audit-synthetic-translation')));assert.deepEqual(after.firstAttempts,s.firstAttempts);assert.equal(after.stage,'passed');await c.close();
});
await check('writing.planned-mode-is-real-not-forced-direct-typing-safe',async()=>{
const[c,p]=await context();await p.goto(base+'/writing/audit-synthetic-writing-big/',{waitUntil:'networkidle'});assert.equal(await p.locator('[data-writing-source-visual]').isVisible(),true);await p.waitForFunction(()=>document.querySelector('[data-writing-source-visual]').naturalWidth>0);await p.screenshot({path:out+'/writing-synthetic-visual.png'});await p.locator('[data-plan-mode][value="planned"]').check();await p.locator('[data-plan-draft]').fill('Claim: use tools thoughtfully. Explain mechanism and limits.');await p.locator('[data-essay-draft]').fill('Thoughtful use makes tools useful. Practice exposes mistaken decisions, while feedback helps us improve. Merely collecting tools does not produce the same benefit.');await p.locator('[data-essay-draft]').press('End');await p.keyboard.type(' 1234 are typed, not navigation.');assert.ok((await p.locator('[data-essay-draft]').inputValue()).includes('1234'));await p.locator('[data-lock-first]').click();const s=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-writing-runtime-v1:audit-synthetic-writing-big')));assert.ok(s.firstPlan.includes('Claim'));assert.ok(s.firstDraft.includes('1234'));await c.close();
});
await browser.close();
await check('exam.browser-process-restart-preserves-draft-and-deadline',async()=>{
const profile=out+'/synthetic-restart-profile';fs.rmSync(profile,{recursive:true,force:true});
let c=await chromium.launchPersistentContext(profile,{headless:true,args:['--no-sandbox']});let p=await c.newPage();p.on('dialog',d=>d.accept());await p.goto(base+'/english-exam/audit-synthetic-paper/',{waitUntil:'networkidle'});await p.locator('[data-exam-start]').click();await p.waitForURL('**/cloze/audit-synthetic-cloze/**');await p.locator('[data-objective-question]').nth(0).locator('[data-value="B"]').click();const url=p.url(),before=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));await c.close();
c=await chromium.launchPersistentContext(profile,{headless:true,args:['--no-sandbox']});p=await c.newPage();await p.goto(url,{waitUntil:'networkidle'});const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('kianos-english-exam-session-v1')));assert.equal(after.deadline_at,before.deadline_at);const draft=await p.evaluate(id=>JSON.parse(localStorage.getItem('kianos-english-exam-task-v1:'+id+':cloze:audit-synthetic-cloze')),before.session_id);assert.equal(draft.answers.q0,'B');await c.close();fs.rmSync(profile,{recursive:true,force:true});
});
console.log(JSON.stringify({checks,errors},null,2));if(checks.some(x=>x.status==='FAIL')||errors.length)process.exitCode=1;
