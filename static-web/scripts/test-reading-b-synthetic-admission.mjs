import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {listReadingBSets,loadReadingBById,loadReadingBAnswersById,projectSyntheticReadingB} from '../src/lib/englishObjectiveSourceTruth.mjs';
import {listReadingBSets as originalList,loadReadingBById as originalLoad} from '../src/lib/englishObjective.mjs';
import {projectObjectiveSourceTruth} from '../src/lib/englishSourceTruth.mjs';
import {englishSessionCatalog} from '../src/lib/englishSessionCatalog.mjs';
import {writeEnglishSessionInstruction,readEnglishSessionInstruction,buildEnglishEvidencePacket} from '../src/lib/englishSessionControl.mjs';

const base = process.env.KIANOS_TEST_BASE || 'http://127.0.0.1:4322';
assert.notEqual(new URL(base).port,'4321','Synthetic writes must never use production Stable');
const out = path.resolve(process.env.KIANOS_TEST_OUTPUT || '/tmp/1111-native-proof');fs.mkdirSync(out,{recursive:true});
const root = path.resolve(process.cwd(),'..');
const bank = JSON.parse(fs.readFileSync(path.join(root,'content/english/modules/objective/synthetic-baseline.v1.json')));
const key = JSON.parse(fs.readFileSync(path.join(root,bank.evidence_rules.answer_key_location)));
const paths={bank:'content/english/modules/objective/synthetic-baseline.v1.json',key:bank.evidence_rules.answer_key_location};
let checks=0;const check=(name,fn)=>{fn();checks++;};
const all=listReadingBSets(), synthetic=all.filter(x=>x.sourceKind==='synthetic');
check('all registered Part-B forms admitted',()=>assert.deepEqual(synthetic.map(x=>x.id),bank.part_b.map(x=>x.id)));
for (const row of originalList()) check(`official unchanged ${row.id}`,()=>assert.deepEqual(loadReadingBById(row.id),projectObjectiveSourceTruth(originalLoad(row.id))));
for (const row of synthetic) {
 const item=loadReadingBById(row.id), answers=loadReadingBAnswersById(row.id);
 check('native identity/key separation '+row.id,()=>{
  assert.equal(item.objectId,row.id);assert.equal(item.sourceKind,'synthetic');assert.equal(item.questions.length,5);assert.equal(item.candidates.length,7);
  assert.equal(item.questionOrigin,'CHAT_GENERATED');assert.equal(item.context.calibration_status,'NOT_SCORE_EQUIVALENT');
  assert.deepEqual(Object.keys(answers.answers),item.questions.map(q=>q.id));
  const walk=value=>{if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){assert.ok(!['answer','answers','correct_answer','rationale','target_mechanisms'].includes(k),k);walk(v);}};walk(item);
 });
}
const source=bank.part_b[0], sourceKey=key.answers[source.id], clone=x=>JSON.parse(JSON.stringify(x));
for(const [name,mutate] of [
 ['unknown form',x=>x.form='GENERIC_MC'],['missing directions',x=>x.directions=''],
 ['missing gap',x=>x.body=x.body.filter(t=>t!=='[3]')],['missing candidate',x=>delete x.candidates.G],
 ['false role',x=>x.role='OFFICIAL'],['empty candidate',x=>x.candidates.A='']
])check('reject '+name,()=>{const bad=clone(source);mutate(bad);assert.throws(()=>projectSyntheticReadingB(bad,sourceKey,paths),/SYNTHETIC_READING_B_/);});
check('reject key mismatch',()=>assert.throws(()=>projectSyntheticReadingB(source,{...sourceKey,'3':'Z'},paths),/ANSWER_MAP/));
const ordered=clone(bank.part_b.find(x=>x.form==='PARAGRAPH_ORDERING'));
check('fixed source position cannot become movable',()=>{ordered.skeleton[1]='B';assert.throws(()=>projectSyntheticReadingB(ordered,key.answers[ordered.id],paths),/ORDERING_SKELETON/);});
check('content/key version vs exposure identity',()=>{
 const a=projectSyntheticReadingB(source,sourceKey,paths),changed=clone(source);changed.body[0]+=' Additional source context.';
 assert.notEqual(projectSyntheticReadingB(changed,sourceKey,paths).sourceHashes.renderedObject,a.sourceHashes.renderedObject);
 const swapped={...sourceKey,'1':sourceKey['2'],'2':sourceKey['1']};const b=projectSyntheticReadingB(source,swapped,paths);
 assert.notEqual(a.sourceHashes.renderedObject,b.sourceHashes.renderedObject);assert.equal(a.sourceHashes.semanticSource,b.sourceHashes.semanticSource);
});
class Storage { constructor(){this.map=new Map();}get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}}
const catalog=englishSessionCatalog(), storage=new Storage(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
const id=source.id,current=catalog.find(x=>x.object_id===id),time=new Date().toISOString();
const instruction={schema:'kianos.english.session-instruction.v1',session_id:'qa-1111-native-baseline',study_day:day,generated_at:time,current_step:0,steps:[{step_id:'pb1',task:'reading_b',object_id:id,source_hash:current.source_hash}],return_policy:{on_finish:'english_home'}};
check('native session admits registered object',()=>{writeEnglishSessionInstruction(storage,instruction,day,{catalog});assert.equal(readEnglishSessionInstruction(storage,day,{catalog}).instruction.steps[0].object_id,id);});
check('native session rejects stale source',()=>assert.throws(()=>writeEnglishSessionInstruction(new Storage(),{...instruction,steps:[{...instruction.steps[0],source_hash:'stale'}]},day,{catalog}),/SOURCE/));
if (process.argv.includes('--unit-only')) { console.log(JSON.stringify({pass:true,checks,scope:'native synthetic admission + immutable official projections + source/session negative tests'})); process.exit(0); }
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME ? {executablePath:process.env.KIANOS_TEST_CHROME} : {})});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const answerRequests=[];page.on('request',req=>{if(req.url().includes('/reading-b-answer/'))answerRequests.push(req.url());});
const report={base,kind:'isolated real browser + production native adapters; not learner U',rows:[]};
try {
 for (const row of synthetic) {
  const item=loadReadingBById(row.id),key=loadReadingBAnswersById(row.id).answers;
  const response=await page.goto(`${base}/reading-b/${row.id}/`,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
  await page.bringToFront();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  await page.waitForFunction(id=>Boolean(localStorage.getItem('kianos-reading-b-attempt-v1:'+id)),row.id);
  assert.equal(await page.locator('[data-reading-b-select]').count(),5);
  assert.equal(await page.locator('[data-objective-candidate]').count(),7);
  assert.equal(await page.locator('[data-objective-root]').getAttribute('data-reading-b-task-form'),item.context.taskForm);
  assert.equal(answerRequests.filter(url=>url.includes(row.id)).length,0,'No key fetch before whole Submit');
  assert.equal(await page.locator('[data-objective-formal]:visible').count(),0);
  assert.equal(await page.locator('[data-objective-question][data-answer]').count(),0);
  if(item.context.taskForm==='ordering') {
   assert.equal(await page.locator('[data-reading-b-fixed]').count(),2);
   for(const fixed of item.context.fixedGivens)assert.equal(await page.locator('[data-reading-b-select]').first().locator(`option[value="${fixed}"]`).isDisabled(),true);
  }
  const firstKey=key[item.questions[0].id];await page.locator('[data-reading-b-select]').first().selectOption(firstKey);
  assert.equal(await page.locator('[data-reading-b-select]').nth(1).locator(`option[value="${firstKey}"]`).isDisabled(),true,'single-use lock');
  await page.locator('[data-reading-b-uncertain]').first().click();
  const previous=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-reading-b-attempt-v1:'+id)),row.id);
  assert.equal(previous.binding.source_kind,'synthetic');assert.equal(previous.binding.question_origin,'CHAT_GENERATED');assert.equal(previous.binding.evidence_role,item.context.evidence_role);
  assert.equal(previous.binding.calibration_status,'NOT_SCORE_EQUIVALENT');assert.equal(previous.submitted,false);
  await page.reload({waitUntil:'domcontentloaded'});await page.bringToFront();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  const restored=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-reading-b-attempt-v1:'+id)),row.id);
  assert.equal(restored.binding.attempt_id,previous.binding.attempt_id);assert.deepEqual(restored.answers,previous.answers);
  assert.equal(await page.locator('[data-reading-b-select]').first().inputValue(),firstKey);
  for(let i=1;i<5;i++)await page.locator('[data-reading-b-select]').nth(i).selectOption(key[item.questions[i].id]);
  await page.locator('[data-objective-submit]').click();await page.locator('[data-objective-result-summary]').waitFor({state:'visible'});
  assert.equal((await page.locator('[data-objective-score]').textContent()).trim(),'5 / 5');
  assert.ok(answerRequests.filter(url=>url.includes(row.id)).length >= 1,'Answer gate fetch happens only after Submit');
  const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('kianos-reading-b-attempt-v1:'+id)),row.id);
  assert.equal(saved.submitted,true);assert.equal(saved.firstEvidenceMeta.independent_transfer_candidate,false);
  assert.equal(saved.firstEvidenceMeta.calibration_status,'NOT_SCORE_EQUIVALENT');
  assert.equal(saved.binding.attempt_id,previous.binding.attempt_id);
  await page.locator('[data-objective-copy-chat]').click();
  const handoff=await page.evaluate(()=>navigator.clipboard.readText());
  assert.ok(handoff.includes(row.id),'native handoff keeps exact object');
  assert.ok(handoff.includes('Task form: '+item.context.taskForm),'native handoff keeps discourse form');
  for(const c of item.candidates)assert.ok(handoff.includes(c.text),'native handoff keeps full candidate text');
  fs.writeFileSync(path.join(out,`${row.id}-handoff.txt`),handoff);
  if(row.id.endsWith('cal-01'))await page.screenshot({path:path.join(out,`${row.id}.png`),fullPage:false});
  checks+=17;report.rows.push({id:row.id,form:item.context.taskForm,passed:true,attempt_id:saved.binding.attempt_id,source_hash:saved.binding.source_hash});
 }
 await page.goto(`${base}/reading-b/`,{waitUntil:'domcontentloaded'});
 await page.bringToFront();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
 assert.ok((await page.locator('.objectiveHomeHero aside').innerText()).includes('22 套真题 + 8 套合成练习'));
 await page.locator('[data-objective-search]').fill('合成');
 await page.waitForFunction(()=>document.querySelectorAll('[data-objective-results] a').length===8);
 for (const node of await page.locator('[data-objective-results] a').all()) assert.ok((await node.innerText()).includes('不作真题估分'));
 await page.screenshot({path:path.join(out,'native-synthetic-catalog.png'),fullPage:false});
 const entries=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
 const captured=new Storage();for(const [k,v]of Object.entries(entries))captured.setItem(k,v);
 const packet=buildEnglishEvidencePacket(captured,{day,now:Date.now(),catalog});
 fs.writeFileSync(path.join(out,'isolated-native-packet.json'),JSON.stringify(packet,null,2));
 assert.equal(packet.inventory.filter(row=>synthetic.some(s=>s.id===row.object_id)).length,8);
 assert.equal(packet.inventory.find(row=>row.object_id===id).task,'reading_b');
 assert.deepEqual(errors,[]);report.checks=checks;report.pass=true;
 console.log(JSON.stringify({pass:true,checks,forms:[...new Set(report.rows.map(x=>x.form))],objects:report.rows.length,official_objects_unchanged:originalList().length,output:out}));
} catch(e){report.pass=false;report.error=e.stack;await page.screenshot({path:path.join(out,'failure.png')});throw e;}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser.close();}
