// Bounded Human Gate comparison; does not redefine the 23 formal checks.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeClient.mjs';
const phase=process.env.POLISH_PHASE||'after',base='http://127.0.0.1:4337';
const out=path.resolve('../output/playwright/issue139-frame-rollback');fs.mkdirSync(out,{recursive:true});
const report={phase,viewport:{width:1440,height:900},checks:[],metrics:{},scope:'frozen v2.1 P10/P11 composition; isolated formal data; prior 23 formal checks preserved',os:process.platform,frame:'THREE_SUBJECT_TEXT_FRAMES_V2_1.md §P10/§P11',nativeBrowserZoom:'NOT_RUN; 125% effective viewport is checked separately'};
const browser=await chromium.launch({headless:false});report.browser=browser.version();
const shot=(p,name)=>p.screenshot({path:path.join(out,`${phase}-${name}.png`)});
const pass=name=>{report.checks.push(name);console.log('PASS '+name);};
async function page(id){const c=await browser.newContext({viewport:report.viewport});const p=await c.newPage();p.on('dialog',d=>d.accept());const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/politics/practice/?question='+id);await p.locator('[data-filter-count]').waitFor();return {c,p,errors};}
async function start(p){await p.selectOption('[data-filter-count]','5');await p.check('[data-learned-scope]');await p.click('[data-start-session]');await p.locator('[data-question-card]').waitFor({state:'visible'});assert.equal(await p.locator('[data-chat-explanation]').textContent(),'');}
async function submit(p,letters){for(const l of letters)await p.locator(`[data-option="${l}"]`).click();await p.click('[data-submit]');await p.locator('[data-submitted-result]').waitFor({state:'visible'});}
async function review(p,id){const r=await(await p.request.get(base+'/politics/practice-review/'+id+'.json')).json();assert.equal(await p.locator('[data-takeaway]').textContent(),r.takeaway);assert.equal(await p.locator('[data-chat-explanation]').textContent(),r.chatExplanation);assert.deepEqual(await p.locator('[data-review-sources] details p').allTextContents(),r.source.filter(s=>s.text).map(s=>s.text));}
try{
  {
    const {c,p,errors}=await page('X1000-MARX-S-001');await shot(p,'setup');
    report.metrics.setup=await p.locator('[data-politics-practice]').evaluate(root=>{const box=s=>{const r=root.querySelector(s).getBoundingClientRect();return {y:r.y,height:r.height,bottom:r.bottom};};return {header:box('.politicsWorkbenchHeader'),setup:box('[data-practice-setup]'),start:box('[data-start-session]'),confirmation:box('[data-learned-scope]')};});
    await p.click('[data-start-session]');assert.equal(await p.locator('[data-question-card]').isVisible(),false);assert.match(await p.locator('[data-practice-error]').innerText(),/先在原讲义/);
    await start(p);
    const face=await p.locator('[data-question-card]').boundingBox();
    for(const selector of ['[data-interaction-normal]','[data-interaction-fast]','[data-favorite]','[data-uncertain]','[data-discussion]']){const b=await p.locator(selector).boundingBox();assert.ok(b.y+b.height<=face.y,'P10 controls belong above the clean face');}
    for(const selector of ['[data-favorite]','[data-uncertain]','[data-discussion]']){await p.click(selector);assert.equal(await p.locator(selector).getAttribute('aria-pressed'),'true');await p.click(selector);}
    report.renderEnvironment=await p.evaluate(()=>({dpr:devicePixelRatio,font:getComputedStyle(document.querySelector('[data-question-stem]')).font,fontSize:getComputedStyle(document.querySelector('[data-question-stem]')).fontSize,innerWidth,innerHeight}));
    await shot(p,'clean');await submit(p,'A');await review(p,'X1000-MARX-S-001');await shot(p,'correct');
    for(const [width,height,label] of [[1728,1117,'1728'],[1920,1080,'1920'],[1024,768,'1024'],[820,900,'820'],[1152,720,'125pct-effective']]){
      await p.setViewportSize({width,height});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const left=await p.locator('.politicsResultSummaryPane').boundingBox(),right=await p.locator('.politicsKnowledgeReview').boundingBox();
      if(width>=980)assert.ok(left.x+left.width<=right.x,'P11 simultaneous left/right panes');
      await shot(p,'result-'+label);
    }
    await p.setViewportSize(report.viewport);
    if(phase==='after'){const tops=await Promise.all(['.politicsResultHeadline','.politicsResultTakeaway','.politicsResultAnswers'].map(s=>p.locator(s).evaluate(n=>n.getBoundingClientRect().top)));assert.ok(tops[0]<tops[1]&&tops[1]<tops[2]);}
    await p.fill('[data-note]','Human Gate 排版复验：保留原题和备注。');await p.reload();await p.locator('[data-submitted-result]').waitFor({state:'visible'});assert.match(await p.inputValue('[data-note]'),/排版复验/);
    const state=await p.evaluate(k=>localStorage.getItem(k),K.attempts);await p.click('[data-return-unit]');await p.locator('[data-practice-exact-return]').waitFor({state:'visible'});await p.click('[data-practice-exact-return]');await p.locator('[data-submitted-result]').waitFor({state:'visible'});assert.equal(await p.evaluate(k=>localStorage.getItem(k),K.attempts),state);assert.match(await p.inputValue('[data-note]'),/排版复验/);
    await p.locator('[data-review-sources] summary').first().click();await shot(p,'source');
    await p.click('[data-next-question]');await p.locator('[data-question-card]').waitFor({state:'visible'});assert.equal(await p.locator('[data-chat-explanation]').textContent(),'');assert.deepEqual(errors,[]);pass('same single setup/mandatory confirmation → clean → full correct review → note/refresh/exact Return → Next');await c.close();
  }
  {
    const {c,p,errors}=await page('X1000-HISTORY-M-001');await start(p);await p.click('[data-interaction-fast]');await p.click('[data-option="A"]');await p.click('[data-option="C"]');assert.equal(await p.locator('[data-submitted-result]').isVisible(),false);await p.click('[data-submit]');await p.locator('[data-submitted-result]').waitFor({state:'visible'});await review(p,'X1000-HISTORY-M-001');assert.match(await p.locator('[data-result-delta]').innerText(),/漏选 B；多选 C/);await shot(p,'multiple-wrong');await p.setViewportSize({width:700,height:900});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await shot(p,'narrow-wrong');assert.deepEqual(errors,[]);pass('same Fast multiple explicit submit and visible missing/extra delta; narrow result');await c.close();
  }
  {
    const {c,p,errors}=await page('X1000-MARX-M-151');await start(p);await submit(p,'ABCD');await review(p,'X1000-MARX-M-151');assert.equal(await p.locator('.politicsKnowledgeReview > :last-child').getAttribute('class'),'politicsReviewActions');await shot(p,'long-explanation');await p.locator('[data-review-sources] summary').first().click();await p.locator('[data-review-sources]').scrollIntoViewIfNeeded();await shot(p,'long-source');const next=await p.locator('[data-next-question]').boundingBox();assert.ok(next.y>=60 && next.y+next.height<=900,'P11 final action row remains reachable during source review');const left=await p.locator('.politicsResultSummaryPane').boundingBox();assert.ok(left.y>=60 && left.y<900,'P11 evidence remains alongside long source');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);pass('same long explanation and expanded source retain exact complete text');await c.close();
  }
  {
    const {c,p}=await page('X1000-MAO-S-038');assert.equal(await p.locator('[data-start-session]').isDisabled(),true);assert.match(await p.locator('[data-practice-error]').innerText(),/暂不开放/);await shot(p,'protected');pass('unowned target remains blocked with no substitution');await c.close();
  }
  {
    const {c,p}=await page('X1000-MARX-S-001');await start(p);await p.click('[data-interaction-fast]');await p.click('[data-option="A"]');await p.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).index===1,K.session);
    await p.click('[data-uncertain]');const id=await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));return s.ids[s.index];},K.session);const r=await(await p.request.get(base+'/politics/practice-review/'+id+'.json')).json();await p.click(`[data-option="${r.answer}"]`);await p.locator('[data-submitted-result]').waitFor({state:'visible'});assert.match(await p.locator('[data-result-status]').innerText(),/不确定/);await shot(p,'uncertain');pass('relocated P10 Fast/signals preserve stable advance and Uncertain stay');await c.close();
  }
  {
    const {c,p}=await page('X1000-MARX-S-001');await start(p);await p.click('[data-interaction-fast]');await p.evaluate(k=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===k)throw new DOMException('isolated frame check','QuotaExceededError');return original.call(this,key,value);};},K.attempts);await p.click('[data-option="B"]');await p.locator('[data-retry-save]').waitFor({state:'visible'});for(const selector of ['[data-interaction-normal]','[data-interaction-fast]','[data-uncertain]'])assert.equal(await p.locator(selector).isDisabled(),true);assert.equal((await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),K.session)).index,0);await shot(p,'storage-failure');pass('relocated P10 toolbar respects pending storage lock; no advancement');await c.close();
  }
  report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;console.error(e);process.exitCode=1;}
finally{report.componentSha256=createHash('sha256').update(fs.readFileSync('src/components/PoliticsPracticeWorkbench.astro')).digest('hex');fs.writeFileSync(path.join(out,phase+'-checks.json'),JSON.stringify(report,null,2));await browser.close();}
