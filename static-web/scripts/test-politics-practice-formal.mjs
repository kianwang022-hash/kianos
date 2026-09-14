import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent, decodePoliticsExplanationBytes } from '../src/lib/politicsPractice.mjs';
import { publicPracticeCatalog, practiceReady, practiceReviewPayload } from '../src/lib/politicsPracticeView.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeClient.mjs';

const base = process.env.PRACTICE_FORMAL_URL || 'http://127.0.0.1:4337';
const out = path.resolve('../output/playwright/issue139'); fs.mkdirSync(out, { recursive: true });
const catalog = buildPoliticsPracticeCatalogCurrent('/'), ready = catalog.questions.filter(practiceReady);
const qById = new Map(catalog.questions.map(q => [q.id,q]));
const report = { scope: '#139 formal Current data / isolated browser state / SELF',
  commit: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), catalogRevision: catalog.revision,
  viewport: {width:1440,height:900}, total:catalog.questions.length, admitted:ready.length,
  protected:catalog.questions.filter(q=>!practiceReady(q)).map(q=>q.id), learnerU:'NOT_TESTED', checks:[], requestsFailed:[] };
const pass=(name)=>{report.checks.push({name,status:'PASS'});console.log(`PASS ${name}`);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const read=(p,key)=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);
const current=async p=>qById.get((await read(p,K.session)).ids[(await read(p,K.session)).index]);
const result=p=>p.locator('[data-submitted-result]').waitFor({state:'visible'});
const shot=(p,name)=>p.screenshot({path:path.join(out,`${name}.png`)});
const browser=await chromium.launch({headless:!process.env.PRACTICE_QA_HEADED});
async function pageFor(url='/politics/practice/') {
  const context=await browser.newContext({viewport:report.viewport}); const p=await context.newPage();
  const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
  p.on('requestfailed',r=>report.requestsFailed.push({url:r.url(),error:r.failure()?.errorText}));
  await p.goto(base+url); await p.locator('[data-start-session]').waitFor();
  return {p,context,errors};
}
async function start(p){await p.selectOption('[data-filter-count]','5');await p.check('[data-learned-scope]');await p.click('[data-start-session]');await p.locator('[data-question-card]').waitFor({state:'visible'});}
async function clean(p){
  assert.equal(await p.locator('[data-submitted-result]').isVisible(),false);
  for(const s of ['[data-result-answer]','[data-takeaway]','[data-chat-explanation]','[data-review-sources]'])assert.equal(await p.locator(s).textContent(),'');
  const html=await p.locator('[data-politics-practice]').innerHTML();
  assert.ok(!/"(?:answer|chatExplanation|takeaway|xiao_reference|originalExplanation)":/.test(html));
  assert.ok(!(await p.locator('body').ariaSnapshot()).includes('正确答案：'));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
}
async function answer(p,letters){for(const l of letters)await p.click(`[data-option="${l}"]`);await p.click('[data-submit]');await result(p);}
async function verifyResult(p,q){
  assert.equal(await p.locator('[data-takeaway]').textContent(),q.refined.takeaway);
  assert.equal(await p.locator('[data-chat-explanation]').textContent(),q.refined.chatExplanation);
  assert.equal(await p.locator('[data-result-answer]').textContent(),q.answer);
  const unit=catalog.units.find(u=>u.key===q.unitKey);
  assert.deepEqual(await p.locator('[data-review-sources] details summary').allTextContents(),unit.source.map(s=>s.title||'对应原讲义'));
  assert.deepEqual(await p.locator('[data-review-sources] details p').allTextContents(),unit.source.filter(s=>s.text).map(s=>s.text));
  const review=await (await p.request.get(base+catalog.reviewBase+q.id+'.json')).json();
  assert.deepEqual(review,practiceReviewPayload(catalog,q.id));
}
async function failStorage(p,key,final=false){await p.evaluate(({key,final})=>{window.__fail={key,final};const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){const f=window.__fail;if(f&&k===f.key&&(!f.final||(JSON.parse(v).pending===null&&Object.keys(JSON.parse(v).results||{}).length)))throw new DOMException('isolated formal test','QuotaExceededError');return original.call(this,k,v);};},{key,final});}
try {
  const bytes=fs.readFileSync('../content/politics/derived/xiao1000-learner-explanations/asset.v1.json.gz');
  const manifest=JSON.parse(fs.readFileSync('../content/politics/derived/xiao1000-learner-explanations/manifest.json'));
  const decoded=decodePoliticsExplanationBytes(manifest,bytes);
  assert.equal(createHash('sha256').update(decoded).digest('hex'),manifest.derived_payload_sha256);
  for(const key of ['compressed_asset_sha256','derived_payload_sha256'])assert.throws(()=>decodePoliticsExplanationBytes({...manifest,[key]:'0'.repeat(64)},bytes),/SHA_MISMATCH/);
  const pub=publicPracticeCatalog(catalog);assert.equal(pub.questions.length+pub.unavailable.length,1148);
  for(const q of catalog.questions.filter(q=>!practiceReady(q))){assert.throws(()=>practiceReviewPayload(catalog,q.id),/BINDING/);assert.ok(!pub.questions.some(r=>r.id===q.id));assert.equal((await fetch(base+catalog.reviewBase+q.id+'.json')).status,404);}
  for(const q of ready){const r=JSON.parse(fs.readFileSync(`dist/politics/practice-review/${q.id}.json`));assert.deepEqual(r,practiceReviewPayload(catalog,q.id));assert.ok(!Object.hasOwn(r,'xiao_reference'));}
  pass('1148 exact content bindings; every admitted production review resource; canonical-unowned IDs protected; both byte hashes fail closed');
  {
    const {p,context,errors}=await pageFor('/politics/practice/?question=X1000-MARX-S-001');await start(p);await clean(p);await shot(p,'clean-single');
    const q=await current(p);await answer(p,q.answer);await verifyResult(p,q);await shot(p,'correct');
    const first=await read(p,K.attempts),session=await read(p,K.session);
    await p.fill('[data-note]','正式数据隔离验收备注：刷新和来源往返应保留。');await p.reload();await result(p);assert.deepEqual(await read(p,K.attempts),first);
    await p.click('[data-return-unit]');await p.locator('[data-practice-exact-return]').waitFor({state:'visible'});await shot(p,'source-return');
    await p.click('[data-practice-exact-return]');await result(p);assert.equal((await read(p,K.session)).id,session.id);assert.match(await p.inputValue('[data-note]'),/刷新和来源/);
    await p.click('[data-next-question]');await clean(p);const wrong=await current(p);await answer(p,'ABCD'.split('').find(l=>!wrong.answer.includes(l))||wrong.answer.slice(0,-1));await verifyResult(p,wrong);
    assert.match(await p.locator('[data-result-status]').textContent(),/答错/);await p.fill('[data-note]','失败时保留本题文字');await sleep(450);
    await failStorage(p,K.meta);await p.fill('[data-note]','尚未保存的正式题目备注');await sleep(450);await p.click('[data-next-question]');assert.equal((await current(p)).id,wrong.id);assert.match(await p.locator('[data-note-status]').innerText(),/保存失败/);
    await p.click('[data-return-unit]');assert.equal(new URL(p.url()).pathname,'/politics/practice/');await shot(p,'note-failure');
    await p.evaluate(()=>{window.__fail=null;});await p.locator('[data-note]').blur();await p.click('[data-next-question]');await clean(p);
    assert.deepEqual(errors,[]);pass('P-J1/3/4/7: formal Normal/correct/Wrong/full explanations, immutable refresh, note failure guards and source exact Return');await context.close();
  }
  {
    const {p,context,errors}=await pageFor('/politics/practice/?question=X1000-HISTORY-M-001');await start(p);await clean(p);await p.click('[data-interaction-fast]');
    await p.click('[data-option="A"]');await p.click('[data-option="C"]');await p.click('[data-option="C"]');await p.click('[data-option="C"]');assert.equal(await p.locator('[data-submitted-result]').isVisible(),false);
    await p.locator('[data-option="C"]').press('Enter');await result(p);assert.match(await p.locator('[data-result-delta]').textContent(),/漏选 B；多选 C/);await verifyResult(p,await current(p));await shot(p,'multiple-wrong');
    assert.deepEqual(errors,[]);pass('P-J2: formal multiple toggles, Fast still explicit submit, missing/extra delta');await context.close();
  }
  {
    const {p,context}=await pageFor('/politics/practice/?question=X1000-MARX-S-001');await start(p);await p.click('[data-interaction-fast]');let q=await current(p);
    await p.click(`[data-option="${q.answer}"]`);await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).index===1,K.session);await clean(p);
    q=await current(p);await p.click(`[data-option="${'ABCD'.split('').find(l=>!q.answer.includes(l))}"]`);await result(p);await sleep(700);assert.equal((await read(p,K.session)).index,1);
    await p.click('[data-next-question]');q=await current(p);await p.click('[data-uncertain]');await p.click(`[data-option="${q.answer}"]`);await result(p);await sleep(700);assert.equal((await read(p,K.session)).index,2);assert.match(await p.locator('[data-result-status]').textContent(),/不确定/);await shot(p,'uncertain');
    pass('P-J5: formal Fast stable advances only after save; Wrong and meaningful Uncertain stay');await context.close();
  }
  {
    const {p,context}=await pageFor();const q=ready[0];
    const first={schema:'kianos.politics.attempt_snapshot.v1',units:{[q.unitKey]:{unit_key:q.unitKey,natural_unit_id:q.unitId,attempts:{[q.id]:{question_id:q.id,selected:'B',correct_answer:q.answer,outcome:'WRONG',observed_at:'isolated-test-prior'}}}}};
    await p.evaluate(({K,q,first})=>{localStorage.setItem(K.attempts,JSON.stringify(first));localStorage.setItem(K.meta,JSON.stringify({schema:'kianos.politics.practice_meta.v1',favorites:{[q.id]:true},discussion:{[q.id]:false},latestOutcome:{[q.id]:'WRONG'},notes:{},causes:{}}));},{K,q,first});
    await p.reload();await p.click('[data-mode-value="wrong"]');assert.equal(await p.locator('[data-available-count]').innerText(),'1');await start(p);await p.click('[data-uncertain]');await p.click('[data-discussion]');await answer(p,q.answer);
    assert.equal((await read(p,K.session)).results[q.id].outcome,'UNCERTAIN');assert.deepEqual(await read(p,K.attempts),first);await p.click('[data-result-discussion-toggle]');await p.click('[data-next-question]');await p.reload();await p.locator('[data-session-complete]').waitFor({state:'visible'});
    await p.click('[data-start-another]');await p.click('[data-mode-value="favorite"]');assert.equal(await p.locator('[data-available-count]').innerText(),'1');await start(p);assert.equal(await p.locator('[data-discussion]').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('[data-uncertain]').getAttribute('aria-pressed'),'false');
    pass('P-J6/7: real-ID wrong/favorite re-entry; independent signals; completed refresh; correction preserves first attempt');await context.close();
  }
  {
    const q=qById.get('X1000-MARX-M-001'),unit=catalog.units.find(u=>u.key===q.unitKey);const {p,context}=await pageFor();await p.goto(base+unit.href);
    await p.locator('[data-workspace-unit-tab="1"]').click();
    await p.locator('[data-workspace-unit]:not([hidden]) [data-workspace-action="start-learn"]').click();
    await p.locator(`[data-practice-unit-entry="${unit.key}"]`).click();await start(p);const firstQuestion=await current(p);await answer(p,firstQuestion.answer);
    const session=await read(p,K.session);
    // Deliberately leave chapter memory on another unit before following Return.
    await p.evaluate(()=>localStorage.setItem('kianos-politics-workspace-v1:marxism:ch00',JSON.stringify({activeUnit:0,states:{}})));
    await p.click('[data-return-unit]');await p.reload();await p.locator('[data-practice-exact-return]').waitFor({state:'visible'});assert.equal(await p.locator('#source-'+firstQuestion.unitId).isVisible(),true);await shot(p,'source-second-unit-return');await p.click('[data-practice-exact-return]');await result(p);assert.equal((await read(p,K.session)).id,session.id);assert.equal((await current(p)).id,firstQuestion.id);
    await p.goto(base+unit.href.replace('#','?practiceSession=stale&practiceQuestion='+q.id+'#'));assert.equal(await p.locator('[data-practice-exact-return]').isVisible(),false);assert.match(await p.locator('[data-practice-return-error]').textContent(),/过期/);
    pass('P-J8: real NU entry → submitted/source/refresh → exact original session/question; stale source return rejected');await context.close();
  }
  for(const key of [K.attempts,K.meta,K.evidence,K.session]){
    const {p,context}=await pageFor('/politics/practice/?question=X1000-MARX-S-001');await start(p);await p.click('[data-option="B"]');await failStorage(p,key,key===K.session);await p.click('[data-submit]');await p.locator('[data-retry-save]').waitFor({state:'visible'});await clean(p);assert.equal((await read(p,K.session)).index,0);
    await p.reload();await p.click('[data-retry-save]');await result(p);assert.equal((await read(p,K.evidence)).length,1);const first=await read(p,K.attempts);await p.reload();await result(p);assert.deepEqual(await read(p,K.attempts),first);
    pass(`formal storage transaction failure/reload/idempotent retry: ${key}`);await context.close();
  }
  for(const variant of ['missing','stale','unbound','incomplete']){
    const {p,context}=await pageFor('/politics/practice/?question=X1000-MARX-S-001');await start(p);await p.route('**/practice-review/*.json',route=>{if(variant==='missing')return route.fulfill({status:404,body:'unavailable'});const r=practiceReviewPayload(catalog,ready[0].id);if(variant==='stale')r.revision='stale';if(variant==='unbound')r.unitKey='wrong';if(variant==='incomplete')r.chatExplanation='';return route.fulfill({contentType:'application/json',body:JSON.stringify(r)});});
    await p.click('[data-option="A"]');await p.click('[data-submit]');await p.locator('[data-practice-error]').waitFor({state:'visible'});await clean(p);assert.equal(await read(p,K.attempts),null);assert.equal((await read(p,K.session)).pending,null);pass(`formal review ${variant} rejects submission without advancing`);await context.close();
  }
  {
    const q=catalog.questions.find(q=>!practiceReady(q));const {p,context}=await pageFor('/politics/practice/?question='+q.id);assert.match(await p.locator('[data-practice-error]').textContent(),/暂不开放/);assert.equal(await p.locator('[data-start-session]').isDisabled(),true);assert.equal(await read(p,K.session),null);await shot(p,'protected-unbound');pass('unowned formal deep link protects content and never substitutes another question');await context.close();
  }
  const longestFace=ready.toSorted((a,b)=>(b.stem.length+b.options.reduce((n,o)=>n+o.text.length,0))-(a.stem.length+a.options.reduce((n,o)=>n+o.text.length,0)))[0];
  const longestExplanation=ready.toSorted((a,b)=>b.refined.chatExplanation.length-a.refined.chatExplanation.length)[0];
  const samples=[longestFace,longestExplanation,...catalog.subjects.map(s=>ready.find(q=>q.subject===s.id&&q.type==='multiple'))];
  for(const q of samples){const {p,context,errors}=await pageFor('/politics/practice/?question='+q.id);await start(p);await clean(p);await shot(p,`clean-${q.id}`);await answer(p,q.answer);await verifyResult(p,q);await shot(p,`result-${q.id}`);const s=p.locator('[data-review-sources] details').first();if(await s.count()){await s.locator('summary').click();await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await shot(p,`source-${q.id}`);}
    await p.setViewportSize({width:700,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);pass(`formal Mac content/source coverage and narrow overflow: ${q.id}`);await context.close();}
  {
    const {p,context}=await pageFor('/politics/practice/?question=X1000-MARX-S-001');await start(p);await answer(p,'A');
    await p.fill('[data-note]','提前结束也保留');await p.click('[data-exit-session]');const first=await read(p,K.attempts),evidence=await read(p,K.evidence);
    await failStorage(p,K.session);await p.click('[data-finish-paused]');assert.equal((await read(p,K.session)).status,'paused');assert.deepEqual(await read(p,K.attempts),first);
    await p.evaluate(()=>{window.__fail=null;});await p.click('[data-finish-paused]');await p.reload();await p.locator('[data-session-complete]').waitFor({state:'visible'});
    assert.match(await p.locator('[data-complete-title]').innerText(),/已答 1 题 · 4 题未作答/);assert.deepEqual(await read(p,K.attempts),first);assert.deepEqual(await read(p,K.evidence),evidence);assert.equal((await read(p,K.meta)).notes['X1000-MARX-S-001'],'提前结束也保留');await shot(p,'ended-early');
    await p.goto(base+'/politics/practice/?question=X1000-HISTORY-M-001');await p.click('[data-start-another]');await start(p);await clean(p);assert.equal((await current(p)).id,'X1000-HISTORY-M-001');
    await p.click('[data-exit-session]');await p.click('[data-finish-paused]');assert.match(await p.locator('[data-complete-title]').innerText(),/已答 0 题 · 5 题未作答/);assert.equal(await p.locator('[data-complete-score]').innerText(),'本组尚未作答');assert.deepEqual(await read(p,K.attempts),first);
    pass('explicit early end preserves attempts/notes/evidence, records unanswered honestly, survives failure/refresh and allows a new exact scope');await context.close();
  }
  report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;console.error(e);process.exitCode=1;}
finally{report.implementationSha256=Object.fromEntries(['politicsPractice.mjs','politicsPracticeClient.mjs','politicsPracticeView.mjs','politicsPracticeBridge.mjs'].map(f=>[f,createHash('sha256').update(fs.readFileSync('src/lib/'+f)).digest('hex')]));fs.writeFileSync(path.join(out,'formal-journeys.json'),JSON.stringify(report,null,2));await browser.close();}
