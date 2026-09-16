import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

// Exact-head screenshots and isolated journeys on already exposed/synthetic tasks.
// This is engineering evidence, not Kian's private learner history or Mac acceptance.
const out=path.resolve('../visual-evidence/stage1');
const root=path.resolve('dist');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 try {
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const cases=[['home','/'],['english-home','/english/'],['reading-index','/reading/'],['cloze-index','/cloze/'],['part-b-index','/reading-b/'],['translation-index','/translation/'],['writing-index','/writing/'],['reading','/reading/english1-2000-reading-a-text1/'],['cloze','/cloze/english1-2000-cloze-main/'],['part-b','/reading-b/english1-2005-reading-b-main/'],['translation','/translation/english1-2000-translation-main/'],['writing-small','/writing/writing-synthetic-small-v1/'],['writing-big','/writing/writing-synthetic-big-v1/'],['objective-guide','/objective-learn/'],['translation-guide','/translation-learn/'],['writing-guide','/writing-learn/'],['lexical-home','/vocabulary/'],['lexical-front','/vocabulary/40/'],['lexical-depth','/vocabulary/40/','reveal'],['lexical-simple','/vocabulary/710/','reveal'],['lexical-search','/vocabulary/','search'],['lexical-challenge','/vocabulary/','challenge'],['reading-review','/reading/english1-2000-reading-a-text1/','reading-review'],['cloze-review','/cloze/english1-2000-cloze-main/','cloze-review'],['writing-direct','/writing/writing-synthetic-small-v1/','writing-direct'],['writing-review','/writing/writing-synthetic-small-v1/','writing-review'],['translation-authored','/translation/english1-2000-translation-main/','translation-authored'],['lexical-repair','/vocabulary/40/','repair'],['lexical-home-repair','/vocabulary/40/','home-repair'],['english-home-narrow','/english/',null,390],['reading-narrow','/reading/english1-2000-reading-a-text1/',null,390],['cloze-narrow','/cloze/english1-2000-cloze-main/',null,390],['writing-narrow','/writing/writing-synthetic-small-v1/',null,390],['translation-narrow','/translation/english1-2000-translation-main/',null,390],['lexical-depth-narrow','/vocabulary/40/','reveal',390],['lexical-home-narrow','/vocabulary/',null,390]];
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:'Linux Chromium / Noto Sans CJK; not Mac or learner U',pages:[],failures:[],journeys:[]};
const ledgerKey='kianos-lexical-evidence-ledger-v2';
const store=page=>page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).map(([k,v])=>{try{return [k,JSON.parse(v)];}catch{return[k,v];}})));
async function lexicalRepair(page,goHome=false){
 assert.equal(await page.locator('[data-vocab-details]').isVisible(),false,'clean Front permission');
 await page.locator('[data-vocab-reveal]').click();
 const target=page.locator('[data-vocab-repair][data-target-kind="sense"]').first();
 const identity=await target.getAttribute('data-target-id');
 await target.click();assert.equal(await target.getAttribute('aria-pressed'),'true');
 const before=(await store(page))[ledgerKey];assert.ok(before,'shared evidence ledger exists');
 await page.reload({waitUntil:'networkidle'});
 if(await page.locator('[data-vocab-reveal]').isVisible())await page.locator('[data-vocab-reveal]').click();
 assert.equal(await page.locator(`[data-vocab-repair][data-target-id="${identity}"]`).getAttribute('aria-pressed'),'true','exact local target survives refresh');
 const after=(await store(page))[ledgerKey];assert.deepEqual(after,before,'refresh creates no duplicate evidence');
 report.journeys.push({name:'Lexical exact Repair and idempotent refresh',identity,status:'PASS'});
 if(goHome){await page.goto(base+'/vocabulary/',{waitUntil:'networkidle'});await page.locator('[data-lexical-tab="review"]').click();}
}
async function interact(page,act){
 if(act==='reveal')await page.locator('[data-vocab-reveal]').click();
 if(act==='search'){await page.locator('[data-lexical-tab="search"]').click();await page.locator('[data-lexical-search]').fill('account');}
 if(act==='challenge')await page.locator('[data-lexical-tab="challenge"]').click();
 if(act==='repair'||act==='home-repair')await lexicalRepair(page,act==='home-repair');
 if(act==='reading-review'){
  const rows=page.locator('[data-question]');const n=await rows.count();
  assert.equal(await rows.evaluateAll(es=>es.filter(e=>!e.hidden&&e.getClientRects().length).length),n,'whole question set visible before submit');
  assert.equal(await page.locator('.portedReadingAnswerStrip:visible').count(),0,'no answer strip before submit');
  for(let i=0;i<n;i++)await rows.nth(i).locator('[data-option="A"]').click();
  await rows.first().locator('.portedUncertain').click();
  await page.locator('[data-reading-submit]').click();await page.locator('[data-reading-result]').waitFor({state:'visible'});
  const before=await store(page);const key=Object.keys(before).find(k=>k.startsWith('kianos-reading-attempt-v1:'));
  assert.ok(key);assert.equal(before[key].submitted,true);assert.equal(before[key].history.length,1);
  await page.reload({waitUntil:'networkidle'});const after=await store(page);assert.deepEqual(after[key].history,before[key].history,'first attempt remains intact');
  await page.evaluate(()=>{scrollTo(0,0);document.querySelector('.portedReadingQuestions').scrollTop=0;});
  report.journeys.push({name:'Reading whole-set attempt → review → refresh',questions:n,status:'PASS'});
 }
 if(act==='cloze-review'){
  const rows=page.locator('[data-objective-question]');const n=await rows.count();
  assert.equal(await rows.evaluateAll(es=>es.filter(e=>!e.hidden&&e.getClientRects().length).length),n,'whole cloze set visible');
  assert.equal(await page.locator('[data-objective-formal]:visible').count(),0);
  for(let i=0;i<n;i++)await rows.nth(i).locator('[data-value="A"]').click();
  await page.locator('[data-cloze-uncertain]').click();await page.locator('[data-objective-submit]').click();
  await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
  const before=await store(page);const key=Object.keys(before).find(k=>k.startsWith('kianos-cloze-attempt-v1:'));assert.ok(key);assert.equal(before[key].submitted,true);
  await page.reload({waitUntil:'networkidle'});const after=await store(page);assert.deepEqual(after[key].results,before[key].results);assert.deepEqual(after[key].trajectory,before[key].trajectory);
  await page.evaluate(()=>{scrollTo(0,0);document.querySelector('.clozeQuestions').scrollTop=0;});
  report.journeys.push({name:'Cloze whole-set attempt → gated review → refresh',questions:n,status:'PASS'});
 }
 if(act==='writing-direct'||act==='writing-review'){
  await page.locator('[data-plan-mode][value="direct"]').check();
  assert.equal(await page.locator('[data-plan-field]').isVisible(),false,'Direct does not manufacture a plan');
  await page.locator('[data-essay-draft]').fill('Dear students,\n\nOur practical note-taking workshop will now take place in Library Seminar Room 3 at 10 a.m. on Saturday. The original room is unavailable because of maintenance. Please bring your notebook and a pen, or a tablet. Reply to the organizer by Friday evening if you cannot attend. Thank you for your understanding.\n\nBest regards,\nThe Student Organizer');
  if(act==='writing-review'){
   await page.locator('[data-lock-first]').click();await page.locator('[data-frozen-evidence]').waitFor({state:'visible'});
   const first=await page.locator('[data-first-draft]').innerText();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-first-draft]').innerText(),first);
   report.journeys.push({name:'Direct Writing → preserved first draft → refresh',status:'PASS'});
  }
 }
 if(act==='translation-authored'){
  const fields=page.locator('[data-attempt-id]');const n=await fields.count();
  for(let i=0;i<n;i++)await fields.nth(i).fill(`浏览器隔离测试译文 ${i+1}：用于验证完整首稿在界面调整后保持可编辑和可恢复，不构成真实学习证据。`);
  await page.reload({waitUntil:'networkidle'});assert.match(await fields.first().inputValue(),/浏览器隔离测试译文/);
  report.journeys.push({name:'Translation full-set authored draft survives refresh',segments:n,status:'PASS'});
 }
}
try{
 for(const [name,route,act,width=1536] of cases){
  const ctx=await browser.newContext({viewport:{width,height:width===390?844:864},locale:'zh-CN'});const page=await ctx.newPage();page.setDefaultTimeout(9000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.accept());
  try{
   const response=await page.goto(base+route,{waitUntil:'networkidle'});if(!response?.ok())throw new Error(`HTTP ${response?.status()}`);
   await page.evaluate(()=>document.fonts.ready);if(act)await interact(page,act);
   await page.waitForTimeout(100);await page.screenshot({path:path.join(out,name+'.png')});
   const metrics=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,title:document.title,targets:[...document.querySelectorAll('[data-vocab-repair]')].map(e=>[e.getAttribute('data-target-kind'),e.getAttribute('data-target-id'),e.getAttribute('data-target-locator')]),readingColumns:getComputedStyle(document.querySelector('.portedReadingColumns')||document.body).gridTemplateColumns,geometry:[...document.querySelectorAll('.clozeLayout,.clozePassage,.clozeDecision,.clozeQuestions,.portedReadingColumns,.portedReadingPassage,.portedReadingQuestions,.translationColumns,.writingRuntimeColumns,.lexicalSenseRow')].slice(0,14).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{class:e.className,width:r.width,height:r.height,overflowY:s.overflowY,font:s.fontSize,columns:s.gridTemplateColumns};})}));
   report.pages.push({name,route,errors,...metrics});if(errors.length)report.failures.push({name,errors});if(metrics.scrollW>width+1)report.failures.push({name,error:'Horizontal overflow',width:metrics.scrollW});
   if(width===1536&&name==='reading'){
    const box=metrics.geometry.find(x=>x.class==='portedReadingColumns');const widths=box.columns.split(' ').map(parseFloat);assert.ok(Math.abs(widths[0]/(widths[0]+widths[1])-.56)<.01,'56/44 geometry');
   }
  }catch(e){report.failures.push({name,error:e.message});await page.screenshot({path:path.join(out,name+'-failure.png')}).catch(()=>{});}finally{await ctx.close();}
 }
}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({screens:report.pages.length,journeys:report.journeys,failures:report.failures},null,2));
if(report.failures.length)process.exitCode=1;
