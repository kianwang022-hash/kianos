import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
// Run against an already-running isolated Candidate, never Stable or a real profile.
// From static-web: node scripts/test-politics-prepared-memory-browser.mjs
const root=path.resolve(process.env.KIANOS_REPO_ROOT || '..');
const {chromium}=await import(process.env.KIANOS_PLAYWRIGHT_MODULE || 'playwright');
const endpoint=new URL(process.env.KIANOS_POLITICS_BROWSER_BASE || 'http://127.0.0.1:4322');
assert.ok(endpoint.protocol==='http:' && ['127.0.0.1','localhost'].includes(endpoint.hostname) && endpoint.port && endpoint.port!=='4321','isolated Candidate endpoint required');
const BASE=endpoint.origin;
const auditDir=fs.mkdtempSync(path.join(os.tmpdir(),'politics-prepared-memory-browser-'));
const report={scope:'isolated native C01 Memory page; not learner evidence or production control/relay',checks:[],errors:[]};
const check=(ok,name)=>{assert.ok(ok,name);report.checks.push(name)};
const response=await fetch(BASE+'/politics/memory/');check(response.ok,'native-memory-SSR-available');
const html=await response.text(),match=html.match(/<script\b[^>]*data-memory-catalog[^>]*>([\s\S]*?)<\/script>/);
check(Boolean(match),'native-SSR-catalog-resolved');const catalog=JSON.parse(match[1]);
assert.deepEqual(catalog,JSON.parse(JSON.stringify(buildPoliticsMemoryCandidateCatalogCurrent())));report.checks.push('served-catalog-matches-independent-Current-producer');
const chapter=JSON.parse(fs.readFileSync(root+'/content/politics/learning/marxism/ch01.json','utf8'));
const targets=chapter.content_support.active_precision.map(x=>catalog.candidates.find(c=>c.id===x.id));
check(targets.every(Boolean),'all-C01-reviewed-targets-present');
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.KIANOS_BROWSER_CHANNEL?{channel:process.env.KIANOS_BROWSER_CHANNEL}:{})});
 const context=await browser.newContext({viewport:{width:1512,height:982},timezoneId:'Asia/Shanghai',permissions:['clipboard-read','clipboard-write']});
 check((await context.storageState()).origins.length===0,'fresh-isolated-browser-context');
 await context.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===BASE?route.continue():route.abort()});
 let page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
 const start=performance.now();await page.goto(BASE+'/politics/memory/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.locator('[data-memory-empty]').waitFor({state:'visible',timeout:60000});report.memoryReadyMs=Math.round(performance.now()-start);
 const day=await page.evaluate(()=>new Date().toLocaleDateString('en-CA'));
 const plan={schema:'kianos.politics.memory-plan.v1',plan_id:'isolated-c01-browser-closeout',study_day:day,generated_at:new Date().toISOString(),catalog_revision:catalog.revision,items:targets.map(x=>({candidate_id:x.id,reason:'Isolated synthetic handoff; no real learner evidence'}))};
 const applyStart=performance.now();
 const applied=await page.evaluate(async({catalog,plan,day})=>{const m=await import('/src/lib/politicsMemoryRuntime.mjs');const result=m.applyPoliticsMemoryPlan(localStorage,catalog,plan,{expectedDay:day,now:Date.now()});window.dispatchEvent(new CustomEvent('kianos:politics-memory-plan-updated'));return result.status},{catalog,plan,day});
 check(applied==='applied','native-apply-without-fabricated-Wrong');
 await page.locator('[data-memory-prompt]').waitFor({state:'visible'});report.planToRecallMs=Math.round(performance.now()-applyStart);
 const readEvents=()=>page.evaluate(async()=>{const m=await import('/src/lib/politicsMemoryRuntime.mjs');const v=JSON.parse(localStorage.getItem(m.POLITICS_MEMORY_EVIDENCE_KEY)||'null');return Array.isArray(v)?v:(v?.events||[])});
 for(let i=0;i<targets.length;i++){
  const t=targets[i];
  check(await page.locator('[data-memory-prompt]').innerText()===t.prompt,`prompt-${i+1}-exact`);
  check(!await page.locator('[data-memory-answer]').isVisible()&&!await page.locator('[data-memory-controls]').isVisible(),`before-reveal-${i+1}-protected`);
  if(i===0){await page.keyboard.press('1');check((await readEvents()).length===0,'rating-before-reveal-does-not-record')}
  await page.locator('[data-memory-reveal]').click();
  assert.deepEqual(await page.locator('[data-memory-answer-items] li').allTextContents(),t.answer_items);report.checks.push(`answer-${i+1}-exact`);
  check(await page.locator('[data-memory-checking]').textContent()===t.checking_criteria.join('；'),`checking-${i+1}-exact`);
  check(await page.locator('[data-memory-cue]').textContent()===t.memory_cue,`cue-${i+1}-exact`);
  const rating=['FORGOT','FUZZY','STABLE'][i%3];await page.locator(`[data-memory-response="${rating}"]`).click();
  await page.waitForFunction(n=>{const v=JSON.parse(localStorage.getItem('kianos-politics-memory-evidence-v1')||'null');return (Array.isArray(v)?v:v?.events||[]).length===n},i+1);
  if(i===6){await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-memory-prompt]').waitFor({state:'visible'});check(await page.locator('[data-memory-prompt]').innerText()===targets[i+1].prompt,'mid-group-reload-resumes-exact-next-target')}
 }
 await page.locator('[data-memory-complete]').waitFor({state:'visible'});
 const events=await readEvents();check(events.length===targets.length,'all-C01-events-recorded-only-in-fixture');
 for(const e of events){const t=targets.find(x=>x.id===e.candidate_id);check(Boolean(t)&&e.candidate_snapshot.prompt===t.prompt&&e.candidate_snapshot.admission_basis.reviewed_target_revision===t.admission_basis.reviewed_target_revision,'event-keeps-exact-reviewed-snapshot:'+e.candidate_id)}
 await page.screenshot({path:path.join(auditDir,'complete.png'),fullPage:true});
 await page.close();page=await context.newPage();
 await page.goto(BASE+'/politics/memory/',{waitUntil:'domcontentloaded'});await page.locator('[data-memory-complete]').waitFor({state:'visible'});report.checks.push('new-page-reopen-keeps-completion');
 const saved=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
 // Feed browser-created fixture state into the same pure native Packet builder
 // as Home. No clipboard, production relay or real learner store is used.
 const fixtureData=new Map(Object.entries(saved));
 const fixtureStorage={getItem:k=>fixtureData.get(k)??null,setItem:(k,v)=>fixtureData.set(k,v),removeItem:k=>fixtureData.delete(k)};
 const packetArgs={storage:fixtureStorage,day,politicsCatalog:buildPoliticsPracticeCatalogCurrent('/'),politicsMemoryCatalog:catalog};
 const outbound=buildHomeDailyLearningPacket(packetArgs);
 check(outbound.packet.schema==='kianos.daily-learning-packet.v1','native-return-packet-schema');
 check(outbound.coverage.politics==='attached' && outbound.warnings.length===0,'native-return-packet-complete-for-tested-scope');
 const memory=outbound.packet.subjects.politics.evidence.memory;
 check(memory.summary.recall_count===targets.length && memory.history_profile.summary.current_compatible_events===targets.length,'browser-evidence-preserved-in-native-packet');
 const nextDay=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 const later=buildHomeDailyLearningPacket({...packetArgs,day:nextDay,now:Date.now()+86400000}).packet.subjects.politics.evidence.memory;
 check(later.summary.recall_count===0 && later.current_plan===null,'day-rollover-does-not-invent-today-work');
 check(later.history_profile.summary.current_compatible_events===targets.length,'day-rollover-preserves-compatible-history');
 report.packet={today:memory.summary,nextDayRecall:later.summary.recall_count,retainedHistory:later.history_profile.summary.current_compatible_events};
 report.catalogRevision=catalog.revision;report.catalogTargets=catalog.candidates.length;report.C01Targets=targets.length;
 report.responses=Object.fromEntries(['FORGOT','FUZZY','STABLE'].map(k=>[k,events.filter(e=>e.response===k).length]));
 report.learnerWrites=0;report.productionControlWrites=0;
 check(report.errors.length===0,'no-native-page-errors');
 report.status='PASS';
} catch(error){report.status='FAIL';report.error=String(error?.stack||error);process.exitCode=1}
finally{if(browser)await browser.close();fs.writeFileSync(path.join(auditDir,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,checks:report.checks.length,auditDir},null,2))}
