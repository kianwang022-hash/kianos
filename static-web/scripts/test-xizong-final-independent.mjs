// Fresh contract-derived acceptance probes. Synthetic state only; never learner U.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { loadXizongSemanticBlock } from '../src/lib/xizongSemanticAdapter.mjs';
import { loadXizongBlock, listProjectableXizongSystems } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock, loadCompiledXizongProjectionAsset } from '../src/lib/xizongProductionProjection.mjs';
import { resolveXizongLearnerAssetRepresentation } from '../src/lib/xizongRepresentationGate.mjs';
import { loadXizongWholePaper } from '../src/lib/xizongQuestions.mjs';
import { scoreXizongPaperResults } from '../src/lib/xizongPaperScoring.mjs';
import { saveSharedControlToPrivate } from '../src/lib/privateCheckpointRuntime.mjs';
const root=path.resolve('..');
const out=path.resolve('.qa/xizong-final-independent');fs.mkdirSync(out,{recursive:true});
const results=[];
async function test(name,fn){try{const detail=await fn();results.push({name,status:'PASS',detail});}catch(e){results.push({name,status:'FAIL',error:e.stack||String(e)});} console.log(JSON.stringify(results.at(-1)));}
const storage=(initial={})=>{const m=new Map(Object.entries(initial));return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size;}};};
await test('C topology and Source authority',()=>{
 const {block}=loadXizongSemanticBlock('hematology-immunity-infection','hematology-h01');
 assert.deepEqual(block.logicGroups.at(-1).kpOrdinals,[1,12,13]);assert.equal(block.sourceContact.mode,'BLOCK_OR_CANONICAL_SOURCE_UNIT');assert.equal(block.sourceContact.logicGroupSourceReentryDefault,false);assert.ok(block.retrievalPoints.slice(1).every(x=>!x.reopenSourceByDefault));
 return {members:block.logicGroups.map(x=>x.kpOrdinals),source:block.sourceContact.mode};
});
await test('A1 A2 A3 and B keep different Source execution',()=>{
 return [['circulation','circulation-b01','NATURAL_SOURCE_UNIT'],['respiratory','respiratory-r01','NATURAL_SOURCE_UNIT'],['urinary','urinary-b01','NATURAL_SOURCE_UNIT'],['digestive-metabolic-endocrine-tumor','digestive-d01','WHOLE_LOGIC_GROUP']].map(([s,b,expected])=>{const v=loadXizongSemanticBlock(s,b).block;assert.equal(v.sourceContact.mode,expected);return [s,v.sourceContact.mode];});
});
await test('Incomplete Systems not promoted into production routes',()=>{
 const ids=listProjectableXizongSystems().map(x=>x.systemId);assert.deepEqual(ids.sort(),['circulation','respiratory','urinary']);assert.throws(()=>loadXizongBlock('hematology-immunity-infection','hematology-h01'));return ids;
});
await test('Approved non-answer Context remains, explicit answer payload does not',()=>{
 assert.equal(resolveXizongLearnerAssetRepresentation({id:'safe',kind:'VISUAL',task:'Locate the source figure'},{stage:'KP_RECALL_FRONT'}).visible,true);
 assert.equal(resolveXizongLearnerAssetRepresentation({id:'answer',kind:'PRECISION',answerBearing:true,answerHtml:'answer'},{stage:'KP_RECALL_FRONT'}).visible,false);
});
await test('POST_REVEAL restriction survives auxiliary composition',()=>{
 assert.equal(resolveXizongLearnerAssetRepresentation({id:'restricted',kind:'EXTENSION',displayPolicy:{timing:'POST_REVEAL'}},{stage:'KP_RECALL_FRONT'}).visible,false);
});
await test('Production rejects stale STRICT_BLOB derived source',()=>{
 const canonical=loadXizongBlock('circulation','b01');const found=loadCompiledXizongProjectionAsset('circulation','circulation-b01');const full=path.join(root,found.assetPath);const original=fs.readFileSync(full,'utf8');
 try{const asset=JSON.parse(original);const source=asset.sources.find(x=>x.kind==='MEDICAL_CORE');assert.ok(source);source.blob_sha='0'.repeat(40);fs.writeFileSync(full,JSON.stringify(asset));assert.throws(()=>buildXizongProductionBlock(canonical));}finally{fs.writeFileSync(full,original);}
});
await test('Historical paper exact score and X partial-zero',()=>{
 return [2005,2007,2016,2017,2026].map(year=>{const p=loadXizongWholePaper(year);const f=p.paperFormat;const correct=Object.fromEntries(p.questions.map(q=>[q.questionId,{selected:q.correctAnswer}]));const sum=scoreXizongPaperResults(f,p.questions,correct);assert.equal(sum.earnedScore,f.max_score);assert.equal(sum.questionCount,f.question_count);const x=p.questions.find(q=>q.questionType==='X'&&String(q.correctAnswer).replace(/[^A-Z]/g,'').length>1);assert.ok(x);assert.equal(scoreXizongPaperResults(f,[x],{[x.questionId]:{selected:[String(x.correctAnswer).match(/[A-Z]/)[0]]}}).earnedScore,0);return {year,count:sum.questionCount,max:sum.maxScore};});
});
await test('Shared checkpoint captures actual Xizong evidence',async()=>{
 const s=storage({'kianos-xizong-astro-v2:xizong:circulation-b01':JSON.stringify({ratings:{'circulation-b01-kp01':'fuzzy'}})});let saved;await saveSharedControlToPrivate(s,{readCheckpoint:async()=>({status:'missing'}),writeCheckpoint:async c=>{saved=c;}});assert.ok(saved.payload.subjects.xizong,'Current shared autosave never captured subject state');
});
await test('Shared checkpoint cannot overwrite unknown existing subjects on read failure',async()=>{
 let writes=0;await saveSharedControlToPrivate(storage(),{readCheckpoint:async()=>({status:'error',error:'temporary read failure'}),writeCheckpoint:async()=>{writes++;}}).catch(()=>{});assert.equal(writes,0,'Failed read must not authorize replacement with empty subjects');
});
const {chromium}=await import('playwright');
const port=Number(process.env.XIZONG_AUDIT_PORT||4317);const base=`http://127.0.0.1:${port}`;
const log=fs.openSync(path.join(out,'server.log'),'w');
const server=spawn(process.execPath,['node_modules/astro/astro.js','dev','--host','127.0.0.1','--port',String(port)],{cwd:process.cwd(),env:{...process.env,KIANOS_PRIVATE_DIR:path.join(out,'private'),KIANOS_REPO_ROOT:root},stdio:['ignore',log,log]});
let browser;
const studyKey='kianos-xizong-astro-v2:xizong:circulation-b01';const evKey='kianos-xizong-memory-review-v2:xizong:circulation-b01';
async function context(){const c=await browser.newContext({viewport:{width:1512,height:982}});const page=await c.newPage();page.setDefaultTimeout(8000);return {c,page};}
async function visit(page,url){await page.goto(base+url,{waitUntil:'networkidle',timeout:30000});await page.waitForTimeout(150);}
async function beginRecall(page,system='circulation',slug='b01'){await visit(page,`/xizong/${system}/${slug}/`);await page.locator('[data-stage-next="logic_group"]').click();await page.locator('[data-source-contact-done]').click();await page.waitForTimeout(150);await page.locator('body').click({position:{x:1,y:1}});}
async function state(page,key){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);}
try{
 for(let i=0;i<100;i++){try{const r=await fetch(base+'/xizong/');if(r.status===200)break;}catch{}await delay(300);}
 browser=await chromium.launch({headless:true});
 await test('Segment confirmation covers all KP without per-KP clicks',async()=>{const {c,page}=await context();try{await beginRecall(page);const s=await state(page,studyKey);assert.equal(Object.keys(s.learned).length,32);assert.equal(s.stage,'kp_recall');assert.equal(Object.keys(s.ratings).length,0);return {learned:32,confirmations:1};}finally{await c.close();}});
 await test('Hidden KP rating keyboard cannot fabricate Recall',async()=>{const {c,page}=await context();try{await beginRecall(page);await page.keyboard.press('1');await page.waitForTimeout(200);const s=await state(page,studyKey);assert.equal(Object.keys(s.ratings).length,0);assert.equal((await state(page,evKey)).evidenceHistory.length,0);}finally{await c.close();}});
 await test('Recall evidence retains oldest beyond 400 observations',async()=>{const {c,page}=await context();try{await beginRecall(page);await page.evaluate(key=>{const v=JSON.parse(localStorage.getItem(key));v.evidenceHistory=Array.from({length:400},(_,i)=>({type:'KP_RECALL',kp_id:'circulation-b01-kp01',rating:'fuzzy',at:new Date(1700000000000+i*1000).toISOString(),sentinel:i}));localStorage.setItem(key,JSON.stringify(v));},evKey);await page.keyboard.press('Space');await page.keyboard.press('3');await page.waitForTimeout(200);const v=(await state(page,evKey)).evidenceHistory;assert.equal(v.length,401);assert.equal(v[0].sentinel,0);}finally{await c.close();}});
 await test('Failed archive never deletes original evidence',async()=>{const {c,page}=await context();try{await page.addInitScript(({studyKey,evKey})=>{if(!sessionStorage.getItem('audit-seeded')){localStorage.setItem(studyKey,JSON.stringify({stage:'block_learn',learned:{'circulation-b01-kp01':true},ratings:{'circulation-b01-kp01':'fuzzy'}}));localStorage.setItem(evKey,JSON.stringify({evidenceHistory:[{type:'KP_RECALL',kp_id:'circulation-b01-kp01',rating:'fuzzy',sentinel:'must-survive'}]}));localStorage.setItem('kianos-xizong-evidence-meta-v1:xizong:circulation-b01',JSON.stringify({version:'older'}));sessionStorage.setItem('audit-seeded','yes');}const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('kianos-xizong-stale-evidence-v1:'))throw new DOMException('test archive quota','QuotaExceededError');return original.call(this,k,v);};},{studyKey,evKey});await visit(page,'/xizong/circulation/b01/');assert.equal((await state(page,studyKey))?.ratings?.['circulation-b01-kp01'],'fuzzy');assert.ok((await state(page,evKey))?.evidenceHistory?.some(x=>x.sentinel==='must-survive'));}finally{await c.close();}});
 await test('Block mature loop weak ratings complete without false mastery',async()=>{const {c,page}=await context();try{await beginRecall(page);for(let i=0;i<32;i++){await page.keyboard.press('Space');await page.keyboard.press(i%2?'2':'1');await page.waitForTimeout(155);}assert.equal((await state(page,studyKey)).stage,'block_recall');assert.equal((await state(page,studyKey)).completed,false);await page.locator('[data-block-recall-reveal]').click();await page.locator('[data-block-recall-complete]').click();await page.locator('[data-block-complete]').click();assert.equal((await state(page,studyKey)).completed,true);assert.equal((await state(page,evKey)).evidenceHistory.filter(x=>x.type==='KP_RECALL').length,32);await page.reload({waitUntil:'networkidle'});assert.equal((await state(page,studyKey)).completed,true);return {kpAttempts:32,noMasteryPromotion:true};}finally{await c.close();}});
 await test('Paper draft, refresh, hidden gate, idempotent Seal and same-workbench Review',async()=>{const {c,page}=await context();try{await page.addInitScript(()=>localStorage.setItem('kianos:xizong:full-paper-holdout-years:v1','[2025,2026]'));await visit(page,'/xizong/practice/paper/2026/');await page.locator('[data-option]').first().click();await page.locator('[data-submit-answer]').click();await page.waitForTimeout(250);const key=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.includes('paper')&&k.includes('sweep')));assert.ok(key);let s=await state(page,key);assert.equal((s.attemptHistory||[]).length,0);assert.equal(Object.keys(s.results||{}).length,0);assert.equal(Object.keys(s.paperDraftAnswers||{}).length,1);await page.keyboard.press('Space');assert.equal(await page.locator('[data-practice-back]').isVisible(),false);assert.equal(await page.locator('[data-question-options] .correct,[data-question-options] .wrong').count(),0);await page.reload({waitUntil:'networkidle'});s=await state(page,key);assert.equal(Object.keys(s.paperDraftAnswers).length,1);await page.locator('[data-paper-seal]').click();s=await state(page,key);assert.ok(s.paperSeal?.sealedAt);assert.equal(s.attemptHistory.length,1);await page.evaluate(()=>document.querySelector('[data-paper-seal]').click());assert.equal((await state(page,key)).attemptHistory.length,1);await page.locator('[data-paper-review-start]').click();assert.equal(new URL(page.url()).pathname,'/xizong/practice/paper/2026/');await page.screenshot({path:path.join(out,'paper-review.png')});return {attempts:1,max:s.paperSeal.summary.maxScore};}finally{await c.close();}});
 await test('Current Mac-wide heterogeneous visible geometry and environment evidence',async()=>{const {c,page}=await context();try{const samples=['/xizong/','/xizong/circulation/','/xizong/respiratory/','/xizong/urinary/','/xizong/circulation/b07/','/xizong/circulation/b10/','/xizong/circulation/b11/','/xizong/respiratory/r01/','/xizong/urinary/b05/'];const rows=[];for(let i=0;i<samples.length;i++){await visit(page,samples[i]);const shape=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,platform:navigator.platform,fontCheck:document.fonts.check('18px "PingFang SC"')}));assert.ok(shape.scroll<=shape.width+1);await page.screenshot({path:path.join(out,`surface-${i}.png`),fullPage:false});rows.push({url:samples[i],...shape});}await beginRecall(page);await page.screenshot({path:path.join(out,'kp-front.png')});await page.keyboard.press('Space');await page.screenshot({path:path.join(out,'kp-reveal.png')});const cdp=await c.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const doc=await cdp.send('DOM.getDocument');const q=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'[data-kp-recall-card]:not([hidden]) h3'});const fonts=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:q.nodeId});return {os:process.platform,samples:rows,actualFonts:fonts};}finally{await c.close();}});
}finally{await browser?.close();server.kill();fs.closeSync(log);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({schema:'xizong.fresh-independent-evidence.v1',generatedAt:new Date().toISOString(),head:process.env.GITHUB_SHA||'local',platform:process.platform,learnerU:false,results},null,2));}
process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
