// Shipped-browser journeys run only in the existing isolated GitHub CI preview.
// Every stored state below is synthetic. No Source link, real learner profile,
// user computer, locally started browser, or external origin is permitted.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
assert.equal(process.env.GITHUB_ACTIONS,'true','B browser may run only in GitHub CI');
assert.equal(process.env.CI,'true');assert.match(process.env.GITHUB_RUN_ID||'',/^\d+$/);
const base=new URL(process.env.KIANOS_PREPARED_MEMORY_TEST_BASE||'http://127.0.0.1:4338/');
assert.equal(base.origin,'http://127.0.0.1:4338','Reuse isolated built-site CI preview');
const out=path.resolve(process.env.KIANOS_B_PREPARED_MEMORY_TEST_OUTPUT||path.join(process.env.KIANOS_PREPARED_MEMORY_TEST_OUTPUT||'.qa/xizong-prepared-memory-browser','b'));
fs.mkdirSync(out,{recursive:true});
const oracle=JSON.parse(fs.readFileSync(new URL('./fixtures/b-reviewed-native-memory.json',import.meta.url),'utf8'));
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/b-pre-admission-baseline.json',import.meta.url),'utf8'));
const byBlock=new Map(baseline.b_blocks.map(b=>[b.blockId,oracle.accepted.filter(row=>row.anchor.block_id===b.blockId)]));
const slugFor=id=>baseline.b_blocks.find(b=>b.blockId===id).slug;
const system='digestive-metabolic-endocrine-tumor',memoryKey='kianos-xizong-memory-v1';
const studyKey=id=>`kianos-xizong-astro-v2:xizong:${id}`;
const blockUrl=id=>new URL(`/xizong/${system}/${slugFor(id)}/`,base).href;
const preparedUrl=id=>new URL(`/xizong/memory/?view=precision&block=${id}`,base).href;
const read=(page,key)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key);
const raw=(page,key)=>page.evaluate(key=>localStorage.getItem(key),key);
const clone=value=>structuredClone(value),normalized=value=>String(value||'').replace(/\s+/g,' ').trim();
const claims=state=>({sourceContactDone:state?.sourceContactDone===true,sourceContactEvidence:state?.sourceContactEvidence||[],learned:state?.learned||{},blockRecallDone:state?.blockRecallDone===true,completed:state?.completed===true,ttsxEvidence:state?.ttsxEvidence||{}}),emptyClaims=claims(null);
const checks=[],errors=[],objects=new Map(),cardsByBlock=new Map();
const report={status:'RUNNING',ci_commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),ci_event_sha:process.env.GITHUB_SHA,ci_run_id:process.env.GITHUB_RUN_ID,started_at:new Date().toISOString(),scope:'Actual served B native prepared Memory, isolated synthetic state. No medical-source acceptance, real Source contact, production deployment or real learner evidence.',checks,errors};
let browser,lastPage;
try {
 const {buildXizongPreparedMemoryAvailability:describe}=await import('../src/lib/xizongMemoryRelease.mjs');
 const {createXizongMemoryState,makePreparedMemoryAvailable,selectMemoryView}=await import('../src/lib/xizongMemoryModel.mjs');
 const {chromium}=await import('playwright');browser=await chromium.launch({headless:true});
 const newContext=async()=>{const context=await browser.newContext({viewport:{width:1440,height:960}});await context.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));return context};
 const newPage=async context=>{lastPage=await context.newPage();return lastPage};
 const ready=async page=>{await page.bringToFront();await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active',{}, {timeout:30000})};
 const blockReady=async(page,id)=>{await ready(page);await page.waitForFunction(key=>Boolean(JSON.parse(localStorage.getItem(key)||'null')?.contentRevision?.witness?.block),studyKey(id))};
 const openPrepared=async(page,id)=>{await page.locator('[data-open-prepared-memory]').click();await page.waitForURL(url=>url.pathname.endsWith('/xizong/memory/')&&url.searchParams.get('block')===id&&url.searchParams.get('view')==='precision');await ready(page);await page.waitForFunction(n=>document.querySelector('[data-memory-queue]')?.querySelectorAll('button').length===n,byBlock.get(id).length)};
 // Admission/index order is not display order: the existing native Memory
 // consumer sorts by canonical/Block/KP identity. Resolve the requested stable
 // cue through that consumer and verify the selected DOM identity explicitly.
 const choose=async(page,id,cueId)=>{const cards=cardsByBlock.get(id),n=cards.findIndex(card=>card.precisionCueId===cueId);assert.ok(n>=0);await page.locator('[data-memory-queue] button').nth(n).click();await page.waitForFunction(cueId=>document.querySelector('[data-memory-answer] [data-prepared-memory]')?.getAttribute('data-prepared-memory')===cueId,cueId);return cards[n]};
 const assertAnswer=async(page,row)=>{
  const answer=page.locator(`[data-memory-answer] [data-prepared-memory="${row.id}"]`),body=answer.locator(':scope > [data-memory-prepared-answer]');
  assert.equal(await answer.count(),1,`${row.id}: exact native answer identity must be selected`);assert.equal(await answer.isVisible(),true);assert.equal(await body.count(),1);
  assert.equal(await body.textContent(),row.item.answer,`${row.id}: full exact answer and original authored boundaries`);
  assert.equal(await body.locator('details').count(),0);
  const view=await answer.evaluate(root=>({hidden:[...root.querySelectorAll('p')].filter(p=>/^(?:适用范围：|来源差异：|处理边界：|助记（不能代替答案）：)/u.test(p.textContent||'')).filter(p=>!p.getClientRects().length).map(p=>p.textContent),visible:root.innerText,full:root.textContent,open:root.querySelectorAll('[data-memory-provenance][open]').length}));
  assert.deepEqual(view.hidden,[],`${row.id}: all scope, conditions and aid readable after Reveal`);assert.equal(view.open,0);
  for(const value of [row.item.answer_scope,row.item.scope_note,row.item.mnemonic,row.item.source_conflict?.conflict,row.item.source_conflict?.policy].filter(Boolean))assert.ok(normalized(view.visible).includes(normalized(value)),`${row.id}: complete visible qualification ${value}`);
  for(const ref of row.item.source_refs){assert.ok(normalized(view.full).includes(normalized(ref)));assert.ok(!view.visible.includes(ref),'audit URLs stay folded')}
  assert.match(await page.locator('[data-memory-precision-resolution]').textContent(),/已绑定精确答案/);
  if(['b-d15-lg06-dentate-line','b-m04-kp08-gluconeogenesis-energy','b-g03-kp05-rna-polymerases'].includes(row.id)){
   const before=await raw(page,memoryKey),details=answer.locator('[data-memory-provenance]');for(let n=0;n<await details.count();n++)await details.nth(n).locator(':scope > summary').click();
   for(const ref of row.item.source_refs)assert.ok((await answer.innerText()).includes(ref));
   for(let n=0;n<await details.count();n++)await details.nth(n).locator(':scope > summary').click();
   assert.equal(await raw(page,memoryKey),before,'provenance disclosure creates no state/evidence');
  }
 };
 const assertClean=async(page,id,row,queue=true)=>{
  const host=page.locator('[data-xizong-memory-workspace]');assert.equal(await page.locator('[data-memory-answer]').isVisible(),false);assert.equal(await page.locator('[data-memory-ratings]').isVisible(),false);
  assert.equal(normalized(await page.locator('[data-memory-card-title]').textContent()),normalized(row.item.cue));assert.equal(normalized(await page.locator('[data-memory-precision-text]').textContent()),normalized(row.item.cue));
  assert.equal(normalized(await page.locator('[data-memory-card-context]').textContent()),`B · ${id}`);
  if(queue)assert.deepEqual(await page.locator('[data-memory-queue] button > span').allTextContents(),cardsByBlock.get(id).map(card=>card.cue));
  const a11y=await host.ariaSnapshot(),attributes=await host.evaluate(root=>[...root.querySelectorAll('*')].filter(node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden'&&getComputedStyle(node).display!=='none').flatMap(node=>[node.getAttribute('title'),node.getAttribute('aria-label'),node.getAttribute('alt'),...['aria-labelledby','aria-describedby'].flatMap(attr=>(node.getAttribute(attr)||'').split(/\s+/).filter(Boolean).map(id=>document.getElementById(id)?.textContent||''))]).filter(Boolean).join('\n'));
  let exposed=normalized(`${await host.innerText()}\n${a11y}\n${attributes}`);for(const r of byBlock.get(id))exposed=exposed.split(normalized(r.item.cue)).join('');
  const forbidden=byBlock.get(id).flatMap(r=>[r.item.answer,r.item.mnemonic,r.item.scope_note,r.item.source,r.item.source_conflict?.conflict,...r.item.source_refs,...r.item.answer.split(/[。；\n]/).filter(x=>x.length>=10)]).concat(cardsByBlock.get(id).flatMap(c=>[c.title,c.groupLabel]));
  for(const value of forbidden.map(normalized).filter(x=>x.length>=6)){if(byBlock.get(id).some(r=>normalized(r.item.cue).includes(value)))continue;assert.ok(!exposed.includes(value),`${row.id}: clean Front/header/rail/ARIA leaked ${value}`)}
 };
 const screenshots=new Set(['b-d01-kp02-slow-wave-frequency','b-d06-lg05-endocrine-localization','b-d15-lg06-dentate-line','b-m04-kp08-gluconeogenesis-energy','b-g04-kp05-lac-states','b-d19-kp16-aosc','b-d19-lg06-cholangiocarcinoma']);
 for(const[id,rows]of byBlock){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);
  const object=JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());objects.set(id,object);assert.equal(object.identity.systemId,system);assert.equal(object.identity.canonicalId,'B');assert.equal(object.identity.blockId,id);
  const actual=[...object.kps,...object.logicGroups].flatMap(owner=>(owner.precision||[]).map(cue=>({owner,cue})));assert.deepEqual(actual.filter(x=>x.cue.raw?.prepared_memory_ref).map(x=>x.cue.id).sort(),rows.map(r=>r.id).sort());
  assert.deepEqual(claims(await read(page,studyKey(id))),emptyClaims);assert.equal(await read(page,memoryKey),null);
  if(!rows.length){assert.equal(await page.locator('[data-open-prepared-memory]').count(),0);checks.push(`${id}: native zero-admission Block has no prepared-memory entry`);await context.close();continue;}
  const descriptor=describe(object);cardsByBlock.set(id,selectMemoryView(makePreparedMemoryAvailable(createXizongMemoryState(),descriptor),'PRECISION').items);assert.deepEqual(descriptor.precisionCards.map(c=>c.id).sort(),rows.map(r=>'precision:'+r.id).sort());
  for(const row of rows){const match=actual.filter(x=>x.cue.id===row.id);assert.equal(match.length,1);assert.deepEqual(match[0].cue.anchor,row.anchor);assert.deepEqual(match[0].cue.raw.prepared_memory_ref.owner_kp_ids,row.owner_kp_ids);if(row.owner_kind==='LG')assert.deepEqual(match[0].owner.kpIds,row.owner_kp_ids);}
  const beforeStudy=await raw(page,studyKey(id));await openPrepared(page,id);const available=await read(page,memoryKey);
  assert.equal(await raw(page,studyKey(id)),beforeStudy);assert.equal(Object.keys(available.cards).length,rows.length);for(const key of ['releasedBlocks','attention','marks','promptOverrides'])assert.deepEqual(available[key],{});for(const key of ['evidence','repairTasks'])assert.deepEqual(available[key],[]);assert.equal(normalized(await page.locator('[data-memory-summary-core]').textContent()),'0');assert.equal(normalized(await page.locator('[data-memory-summary-today]').textContent()),'0');
  for(const row of rows){const card=await choose(page,id,row.id);await assertAnswer(page,row);assert.equal(normalized(await page.locator('[data-memory-card-title]').textContent()),normalized(card.title));}
  await page.locator('[data-memory-rating="known"]').dispatchEvent('click');assert.deepEqual((await read(page,memoryKey)).evidence,[],'Browse cannot rate');
  await page.locator('[data-precision-mode="RECALL"]').click();
  for(const row of rows){await choose(page,id,row.id);await assertClean(page,id,row);await page.locator('[data-memory-rating="known"]').dispatchEvent('click');assert.deepEqual((await read(page,memoryKey)).evidence,[],'unrevealed Recall cannot rate');if(screenshots.has(row.id))await page.screenshot({path:path.join(out,row.id+'-front.png'),fullPage:true});await page.locator('[data-memory-reveal]').click();await assertAnswer(page,row);if(screenshots.has(row.id))await page.screenshot({path:path.join(out,row.id+'-reveal.png'),fullPage:true});}
  await choose(page,id,rows[0].id);await page.locator('[data-memory-reveal]').click();await page.locator('[data-memory-rating="known"]').click();await page.locator('[data-memory-rating="known"]').dispatchEvent('click');const rated=await read(page,memoryKey);assert.equal(rated.evidence.length,1);assert.equal(rated.evidence[0].cardId,'precision:'+rows[0].id);assert.deepEqual(rated.releasedBlocks,{});
  await page.reload({waitUntil:'domcontentloaded'});await ready(page);assert.deepEqual(await read(page,memoryKey),rated);
  await page.goBack({waitUntil:'domcontentloaded'});await blockReady(page,id);assert.equal(page.url(),blockUrl(id));assert.deepEqual(claims(await read(page,studyKey(id))),emptyClaims);
  await page.goForward({waitUntil:'domcontentloaded'});await ready(page);assert.deepEqual(await read(page,memoryKey),rated);
  await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await openPrepared(page,id);assert.deepEqual(await read(page,memoryKey),rated,'repeat prepared entry preserves all history and ratings');assert.deepEqual(claims(await read(page,studyKey(id))),emptyClaims);
  checks.push(`${id}: actual served native ownership; complete Browse/Recall/Reveal; clean cue Front/header/rail/ARIA; one explicit rating; reload/Back/Forward/repeated entry; no Source/learning/completion/debt`);await context.close();
 }
 assert.equal([...cardsByBlock.values()].flat().length,42);assert.equal([...byBlock.values()].flat().filter(r=>r.owner_kind==='LG').length,6);
 // Both genuine KP and LG retain an authentic same-owner history even when
 // Core semanticRevision is unchanged and only the explicit answer changed.
 for(const[id,cueId]of[['D6','b-d06-lg05-endocrine-localization'],['G4','b-g04-kp05-lac-states']]){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);
  const object=JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent()),prior=makePreparedMemoryAvailable(createXizongMemoryState(),describe(object),'2026-09-01T00:00:00Z'),cardId='precision:'+cueId,old=prior.cards[cardId];
  Object.assign(old,{answerHtml:'<p>Declared synthetic prior exact answer, no medical authority.</p>',ownerContextHtml:'<p>Declared authentic old-owner context.</p>',contentHistory:[{answerHtml:'<p>Declared earlier.</p>'}]});
  prior.evidence=[{id:'declared-history',cardId,family:'PRECISION',rating:'fuzzy',origin:'DECLARED_BROWSER_FIXTURE',at:'2026-09-01T01:00:00Z'}];prior.marks={declared:{text:'Preserve note'}};prior.attention[cardId]={reviewRequested:true,reason:'DECLARED_BROWSER_FIXTURE'};
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:memoryKey,state:prior});await openPrepared(page,id);const current=await read(page,memoryKey),updated=current.cards[cardId];assert.equal(updated.contentHistory.length,2);assert.equal(updated.semanticRevision,old.semanticRevision);assert.equal(updated.revisionReview,'LOCAL_SEMANTIC_CHANGE');for(const key of ['answerHtml','ownerContextHtml','answerResolution','systemId','canonicalId','blockId','kpId','logicGroupId','cue'])assert.equal(updated.contentHistory.at(-1)[key],old[key]);for(const key of ['evidence','marks','attention','releasedBlocks'])assert.deepEqual(current[key],prior[key]);
  await choose(page,id,cueId);await assertAnswer(page,byBlock.get(id).find(r=>r.id===cueId));
  await page.locator('[data-memory-view="TODAY"]').click();await assertClean(page,id,byBlock.get(id).find(r=>r.id===cueId),false);await page.locator('[data-memory-view="PRECISION"]').click();await page.locator('[data-precision-mode="RECALL"]').click();await page.locator('[data-memory-weak-only]').check();await assertClean(page,id,byBlock.get(id).find(r=>r.id===cueId),false);
  await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await openPrepared(page,id);assert.deepEqual(await read(page,memoryKey),current);checks.push(`${id}: content-only native ${cueId} revision retains authentic context/ratings/notes/history; Today and weak Recall remain cue-only`);await context.close();
 }
 // Held historical context remains ordinary history, never current admission.
 for(const[id,heldId,kpId,groupId]of[['M1','declared-held-m1-lg04','', 'b-m01-lg04'],['M6','b-m06-kp11-phospholipase-cleavage','biochem-m6-kp11','b-m06-lg05'],['M9','b-m09-kp07-cps-comparison','biochem-m9-kp07','b-m09-lg02']]){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);const state=createXizongMemoryState(),cardId='precision:'+heldId;state.cards[cardId]={id:cardId,precisionCueId:heldId,family:'PRECISION',systemId:system,canonicalId:'B',blockId:id,blockLabel:id,kpId,logicGroupId:groupId,title:'Declared held historical title',cue:'Declared historical cue',answerHtml:'',ownerContextHtml:'<p>Declared unadmitted historical owner context.</p>',answerResolution:'OWNER_CONTEXT_ONLY',sourceHash:'declared-old',releasedAt:'2026-09-01T00:00:00Z',contentHistory:[]};state.evidence=[{id:'held-history',cardId,family:'PRECISION',rating:'unknown',at:'2026-09-01T01:00:00Z'}];
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:memoryKey,state});await openPrepared(page,id);const after=await read(page,memoryKey);assert.deepEqual(after.cards[cardId],state.cards[cardId]);assert.deepEqual(after.evidence,state.evidence);assert.equal(await page.locator('[data-memory-queue] button').count(),byBlock.get(id).length);
  await page.locator('[data-memory-view="PRECISION"]').click();assert.equal(await page.locator('[data-memory-queue] button').count(),byBlock.get(id).length+1);await page.goto(preparedUrl(id),{waitUntil:'domcontentloaded'});await ready(page);assert.equal(await page.locator('[data-memory-queue] button').count(),byBlock.get(id).length);checks.push(`${id}: held ownerContext fallback excluded from selected current view; actual historical card/evidence preserved`);await context.close();
 }
 for(const id of ['D6','M4','G4']){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);const beforeMemory=await raw(page,memoryKey),beforeStudy=await raw(page,studyKey(id));await page.evaluate(key=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===key)throw Error('Declared B Memory save failure');return original.call(this,name,value)}},memoryKey);await page.locator('[data-open-prepared-memory]').click();await page.waitForFunction(()=>document.querySelector('[data-prepared-memory-status]')?.textContent.includes('无法安全打开'));assert.equal(page.url(),blockUrl(id));assert.equal(await raw(page,memoryKey),beforeMemory);assert.equal(await raw(page,studyKey(id)),beforeStudy);await page.screenshot({path:path.join(out,id+'-save-failure.png'),fullPage:true});checks.push(`${id}: actual save failure prevents prepared navigation and creates no state/evidence`);await context.close();
 }
 {
  const id='D6',context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await openPrepared(page,id);await choose(page,id,'b-d06-lg05-endocrine-localization');await page.locator('[data-precision-mode="RECALL"]').click();await page.locator('[data-memory-reveal]').click();const before=await raw(page,memoryKey);await page.evaluate(key=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===key)throw Error('Declared rating-save failure');return original.call(this,name,value)}},memoryKey);await page.locator('[data-memory-rating="known"]').click();await page.waitForFunction(()=>document.querySelector('[data-xizong-memory-workspace]')?.dataset.memoryStateBlocked==='true');assert.equal(await raw(page,memoryKey),before);await page.reload({waitUntil:'domcontentloaded'});await ready(page);assert.equal(await raw(page,memoryKey),before);checks.push('Genuine B compound LG rating-save failure preserves prior bytes and no evidence survives reload');await context.close();
 }
 // Post-Chat proof uses only actual rendered controls for affirmative model,
 // Recall and Source confirmations. All contexts are disposable test users.
 // Storage edits below are explicitly negative corruption cases, never a way
 // to manufacture prerequisite completion or unlock a positive journey.
 const reviewKey=id=>`kianos-xizong-memory-review-v2:xizong:${id}`;
 const laneKey=`kianos:xizong:biochemistry-source-lane:${system}:v1`;
 const systemUrl=new URL(`/xizong/${system}/?view=biochemistry`,base).href;
 const visibleCard=page=>page.locator('[data-study-stage="kp_recall"] [data-kp-recall-card]:visible');
 const history=async(page,id)=>(await read(page,reviewKey(id)))?.evidenceHistory||[];
 const waitStage=async(page,id,stage)=>{
  await page.waitForFunction(({key,stage})=>JSON.parse(localStorage.getItem(key)||'null')?.stage===stage,{key:studyKey(id),stage});
  assert.equal(await page.locator(`[data-study-stage="${stage}"]`).isVisible(),true);
 };
 const noInventedClaims=async(page,id)=>{
  assert.deepEqual(claims(await read(page,studyKey(id))),emptyClaims,`${id}: navigation/Recall does not create Source, learned, TTSX or completion`);
  assert.equal(await read(page,laneKey),null,`${id}: no global Source receipt`);
  assert.equal(await read(page,memoryKey),null,`${id}: formal Recall does not create prepared Memory or Today debt`);
  const state=await read(page,studyKey(id));
  for(const key of ['mastery','firstReleaseReceipt'])assert.equal(state?.[key],undefined);
 };
 const assertNativeFront=async(page,id)=>{
  const card=visibleCard(page);assert.equal(await card.count(),1);
  const kpId=await card.getAttribute('data-kp-id'),kp=objects.get(id).kps.find(k=>k.identity.kpId===kpId);assert.ok(kp);
  assert.equal(normalized(await card.locator(':scope > header h3').textContent()),normalized(kp.identity.title),`${id}: preserve full native title`);
  if(kp.prompt.canonical)assert.equal(normalized(await card.locator(':scope > header p').textContent()),normalized(kp.prompt.canonical),`${id}: preserve full native Prompt`);
  assert.equal(normalized(await page.locator('[data-kp-recall-title]').textContent()),normalized(kp.identity.title));
  assert.equal(await card.locator('[data-kp-answer]').isVisible(),false);assert.equal(await card.locator('[data-kp-rating]').isVisible(),false);
  assert.equal(await page.locator('[data-xizong-aux-surface] [data-learner-asset="precision"]:visible,[data-xizong-aux-surface] [data-learner-asset="visual"]:visible,[data-prepared-memory]:visible').count(),0,'formal Recall Front exposes no Precision answer or answer-bearing visual in the rail');
  return kpId;
 };
 const confirmRequiredModels=async(page,id)=>{
  const required=objects.get(id).sourceContact.requiredModelReadiness;
  assert.equal(required.targetBlockId,id);assert.match(required.witness,/^[a-f0-9]{64}$/);
  const beforeEvidence=await raw(page,reviewKey(id));
  if(!required.requirements.length){assert.equal(await page.locator('[data-required-model-confirm]').count(),0);return;}
  assert.equal(await page.locator('[data-required-model-readiness]').isVisible(),true);
  const displayed=page.locator('[data-required-model-list] li');
  assert.equal(await displayed.count(),required.requirements.length);
  for(let index=0;index<required.requirements.length;index++){assert.equal(normalized(await displayed.nth(index).locator('strong').textContent()),normalized(required.requirements[index].label));assert.equal(normalized(await displayed.nth(index).locator('p').textContent()),normalized(required.requirements[index].modelPrompt),'every actual required model is shown, not merely its Block ID');}
  const priorKeys=required.requirements.filter(r=>r.blockId&&r.blockId!==id).map(r=>studyKey(r.blockId));
  for(const key of priorKeys)assert.equal(await read(page,key),null,'do not seed any prerequisite Block completion');
  await page.locator('[data-required-model-confirm]').click();
  await page.waitForFunction(({key,witness})=>JSON.parse(localStorage.getItem(key)||'null')?.requiredModelContinuation?.requirementsWitness===witness,{key:studyKey(id),witness:required.witness});
  const receipt=(await read(page,studyKey(id))).requiredModelContinuation;
  assert.deepEqual(Object.keys(receipt).sort(),['confirmation','confirmedAt','requirementsWitness','targetBlockId']);
  assert.equal(receipt.targetBlockId,id);assert.equal(receipt.confirmation,'USER_CURRENT_TARGET_MODELS_UNDERSTOOD');assert.ok(Number.isFinite(Date.parse(receipt.confirmedAt)));
  assert.equal(await page.locator('[data-required-model-readiness]').isVisible(),false);
  for(const key of priorKeys)assert.equal(await read(page,key),null,'current-target confirmation leaves prior model evidence untouched');
  assert.equal(await raw(page,reviewKey(id)),beforeEvidence,'readiness confirmation is not a Recall attempt');
  await noInventedClaims(page,id);
 };
 const enterPostChat=async(page,id)=>{
  await page.locator('[data-post-chat-recall]:visible').click();await waitStage(page,id,'kp_recall');
  assert.equal((await read(page,studyKey(id))).recallEntryMode,'POST_CHAT_RECALL');await assertNativeFront(page,id);
 };
 const failStorage=async(page,key)=>page.evaluate(key=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===key)throw Error('Declared isolated B write failure');return original.call(this,name,value)}},key);
 const rateCurrent=async(page,id)=>{
  const kpId=await assertNativeFront(page,id),before=await history(page,id),card=visibleCard(page);
  await card.locator('[data-kp-reveal]').click();assert.equal(await card.locator('[data-kp-answer]').isVisible(),true);
  const core=objects.get(id).kps.find(kp=>kp.identity.kpId===kpId).core.html;
  const expectedCore=await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').body.textContent,core);
  assert.equal(normalized(await card.locator('[data-kp-answer] .markdown').textContent()),normalized(expectedCore),'formal Reveal retains complete current native Core');
  await card.locator('[data-rating="known"]').click();
  const after=await history(page,id);assert.equal(after.length,before.length+1);assert.equal(after.at(-1).kp_id,kpId);assert.equal(after.at(-1).evidence_origin,'USER_RECALL_ATTEMPT');assert.equal(after.at(-1).core_revealed,true);
  assert.equal((await read(page,studyKey(id))).ratings[kpId],'known');return kpId;
 };
 for(const id of ['D1','D6','M4','G4']){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);
  const object=objects.get(id),firstGroup=object.logicGroups[0],sourceStage=id.startsWith('D')?'kp_learn':'source_contact';
  assert.equal(await page.locator('[data-xizong-v6-block]').getAttribute('data-post-chat-recall-available'),'true');
  const emptyHistory=await history(page,id);assert.deepEqual(emptyHistory,[]);
  if(object.sourceContact.requiredModelReadiness.requirements.length){
   const before=await raw(page,studyKey(id));await page.locator('[data-post-chat-recall]:visible').click();
   assert.equal(await raw(page,studyKey(id)),before,'missing actual required models deny entry without altering position');
   await page.screenshot({path:path.join(out,id+'-required-models.png'),fullPage:true});
   // Capture only this isolated test clipboard; exercise the real repair button
   // and existing packet builder without a system clipboard or external Chat.
   await page.evaluate(()=>{window.__bCopiedPacket=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__bCopiedPacket=text}}})});
   await page.locator('[data-required-model-repair]').click();await page.waitForFunction(()=>typeof window.__bCopiedPacket==='string');
   const repairPacket=await page.evaluate(()=>window.__bCopiedPacket);for(const requirement of object.sourceContact.requiredModelReadiness.requirements)assert.ok(repairPacket.includes(requirement.modelPrompt),'actual repair packet carries required models');
   assert.equal(await raw(page,studyKey(id)),before,'repair handoff is not a current-target understanding confirmation');assert.deepEqual(await history(page,id),[]);await noInventedClaims(page,id);
   await page.locator('[data-stage-next="logic_group"]').click();
   if(id.startsWith('D'))assert.equal(await raw(page,studyKey(id)),before,'D Source execution also requires actual model readiness');
   else {await waitStage(page,id,'source_contact');await noInventedClaims(page,id);const atSource=await raw(page,studyKey(id));await page.locator('[data-post-chat-recall]:visible').click();assert.equal(await raw(page,studyKey(id)),atSource,'M/G may encounter Source first, but missing model readiness still prevents Recall');}
  }
  await confirmRequiredModels(page,id);await enterPostChat(page,id);await noInventedClaims(page,id);
  const initial=await raw(page,reviewKey(id)),firstCard=visibleCard(page);
  await firstCard.locator('[data-rating="known"]').dispatchEvent('click');assert.equal(await raw(page,reviewKey(id)),initial,'rating before Reveal is rejected');
  const hidden=page.locator('[data-kp-recall-card][hidden]').first();await hidden.locator('[data-kp-reveal]').dispatchEvent('click');await hidden.locator('[data-rating="known"]').dispatchEvent('click');assert.equal(await hidden.locator('[data-kp-answer]').isVisible(),false);assert.equal(await raw(page,reviewKey(id)),initial,'hidden KP cannot Reveal or rate');
  await page.screenshot({path:path.join(out,id+'-post-chat-front.png'),fullPage:true});
  await firstCard.locator('[data-kp-reveal]').click();await page.screenshot({path:path.join(out,id+'-post-chat-reveal.png'),fullPage:true});
  const firstId=await firstCard.getAttribute('data-kp-id');
  await firstCard.locator('[data-rating="known"]').click();
  await page.locator(`[data-kp-id="${firstId}"] [data-rating="known"]`).dispatchEvent('click');assert.equal((await history(page,id)).length,1,'duplicate click yields one actual Recall event');
  await page.waitForFunction(({key,expected})=>JSON.parse(localStorage.getItem(key)||'null')?.resumeKpId===expected,{key:studyKey(id),expected:firstGroup.kpIds[1]});
  await assertNativeFront(page,id);await noInventedClaims(page,id);
  const middle=await read(page,studyKey(id)),savedHistory=await read(page,reviewKey(id));
  await page.reload({waitUntil:'domcontentloaded'});await blockReady(page,id);await waitStage(page,id,'kp_recall');
  assert.equal((await read(page,studyKey(id))).resumeKpId,middle.resumeKpId);assert.equal((await read(page,studyKey(id))).resumeGroupId,middle.resumeGroupId);assert.deepEqual(await read(page,reviewKey(id)),savedHistory);await assertNativeFront(page,id);
  // Complete only this first native group by real revealed ratings. Retrieval
  // may advance, while Source-gated group closure must remain unclaimed.
  for(const kpId of firstGroup.kpIds.slice(1)){
   assert.equal(await rateCurrent(page,id),kpId);
   await page.waitForFunction(({key,kpId})=>JSON.parse(localStorage.getItem(key)||'null')?.resumeKpId!==kpId,{key:studyKey(id),kpId});
  }
  assert.equal((await read(page,studyKey(id))).resumeGroupId,object.logicGroups[1].identity.logicGroupId);
  assert.equal(await page.locator('[data-group-target="0"]').evaluate(node=>node.classList.contains('done')),false,'recalled group is not falsely Source-closed');await noInventedClaims(page,id);
  await page.locator(`[data-group-target="${object.logicGroups.length-1}"]`).click();await waitStage(page,id,'kp_recall');
  assert.equal((await read(page,studyKey(id))).resumeGroupId,object.logicGroups.at(-1).identity.logicGroupId);await assertNativeFront(page,id);
  // The legacy outline is currently hidden in production. This is an explicit
  // adversarial controller event, not a claimed visible navigation affordance.
  assert.equal(await page.locator('[data-study-panel="outline"]').isVisible(),false);
  await page.locator('[data-outline-open="1"]').dispatchEvent('click');await waitStage(page,id,'kp_recall');
  assert.equal((await read(page,studyKey(id))).resumeGroupId,object.logicGroups[1].identity.logicGroupId);await assertNativeFront(page,id);
  const beforeReturn=await read(page,studyKey(id)),beforeReturnHistory=await raw(page,reviewKey(id));
  await visibleCard(page).locator('[data-kp-reveal]').click();await page.locator('[data-stage-target="source_contact"]:visible').click();await waitStage(page,id,sourceStage);
  let source=await read(page,studyKey(id));assert.equal(source.recallEntryMode,undefined);assert.equal(source.resumeKpId,beforeReturn.resumeKpId);assert.equal(source.resumeGroupId,beforeReturn.resumeGroupId);
  if(sourceStage==='kp_learn')assert.equal(normalized(await page.locator('[data-group-lecture-title]').textContent()),normalized(object.logicGroups[1].identity.label));
  else {const link=page.locator('[data-study-stage="source_contact"] a.portedPrimaryAction');assert.equal(await link.getAttribute('href'),new URL(systemUrl).pathname+'?view=biochemistry');assert.equal(normalized(await page.locator('[data-biochemistry-block-source-status]').textContent()),`当前 Block Source 已形成 0/${object.sourceContact.segments.length} 段 · 继续 27 生化主线`);}
  await page.screenshot({path:path.join(out,id+'-source-return.png'),fullPage:true});await noInventedClaims(page,id);
  await page.reload({waitUntil:'domcontentloaded'});await blockReady(page,id);await waitStage(page,id,sourceStage);assert.equal((await read(page,studyKey(id))).recallEntryMode,undefined);
  await page.locator('[data-group-target="0"]').click();await waitStage(page,id,sourceStage);assert.equal((await read(page,studyKey(id))).recallEntryMode,undefined,'ordinary Source navigation cannot inherit post-Chat bypass');
  await enterPostChat(page,id);await noInventedClaims(page,id);assert.equal(await raw(page,reviewKey(id)),beforeReturnHistory,'repeat entry creates no Recall evidence');
  // Real Back/Forward restores this exact middle-group intention cleanly.
  await page.locator('[data-group-target="1"]').click();const resume=await read(page,studyKey(id));
  await page.goto(systemUrl,{waitUntil:'domcontentloaded'});await ready(page);assert.equal(await read(page,laneKey),null);
  await page.goBack({waitUntil:'domcontentloaded'});await blockReady(page,id);await waitStage(page,id,'kp_recall');assert.equal((await read(page,studyKey(id))).resumeKpId,resume.resumeKpId);await assertNativeFront(page,id);
  await page.goForward({waitUntil:'domcontentloaded'});await ready(page);assert.equal(page.url(),systemUrl);
  checks.push(`${id}: actual required-model confirmation only; full native title/Prompt; clean post-Chat Front; revealed rating/duplicate/hidden-card guards; native end-of-group advance; middle resume/reload/Back/Forward; visible group rail and explicit legacy-outline adversary; precise ${sourceStage} return clears bypass; no fabricated evidence`);await context.close();
 }
 // Finishing every native KP is still only retrieval progress. Neither the
 // final group nor aggregate completion may manufacture Source coverage.
 for(const id of ['D1','M4','G4']){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await confirmRequiredModels(page,id);await enterPostChat(page,id);
  const expected=objects.get(id).logicGroups.flatMap(group=>group.kpIds);
  for(let index=0;index<expected.length;index++){
   assert.equal(await rateCurrent(page,id),expected[index]);
   if(index+1<expected.length)await page.waitForFunction(({key,kpId})=>JSON.parse(localStorage.getItem(key)||'null')?.resumeKpId===kpId,{key:studyKey(id),kpId:expected[index+1]});
  }
  await waitStage(page,id,'block_recall');assert.deepEqual((await history(page,id)).map(row=>row.kp_id),expected);
  await page.locator('[data-block-recall-reveal]').click();assert.equal(await page.locator('[data-block-recall-answer]').isVisible(),false,'all retrieval ratings alone cannot Reveal aggregate Source-gated closure');
  assert.equal(await page.locator('[data-block-recall-complete]').isDisabled(),true);assert.equal(await page.locator('[data-block-complete]').isDisabled(),true);
  await page.locator('[data-block-recall-complete]').dispatchEvent('click');await page.locator('[data-block-complete]').dispatchEvent('click');await noInventedClaims(page,id);
  assert.equal(await page.locator('[data-study-group-rail] .done').count(),0,'retrieved groups are not Source-closed');
  await page.screenshot({path:path.join(out,id+'-retrieval-without-completion.png'),fullPage:true});
  checks.push(`${id}: all native KP/LG retrieval order completed through real Reveal/rating; formal Source/Block/TTSX/completion remains unclaimed`);await context.close();
 }
 // No positive journey uses synthetic prerequisite completions. These two
 // mutations only demonstrate that a once-genuine current-target receipt fails
 // closed when its target or exact requirements witness is corrupted.
 for(const [label,mutate]of[['stale-witness',receipt=>receipt.requirementsWitness='0'.repeat(64)],['different-target',receipt=>receipt.targetBlockId='M3']]){
  const id='M4',context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await confirmRequiredModels(page,id);await enterPostChat(page,id);
  const state=await read(page,studyKey(id));mutate(state.requiredModelContinuation);
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:studyKey(id),state});await page.reload({waitUntil:'domcontentloaded'});await blockReady(page,id);
  await waitStage(page,id,'block_learn');assert.equal(await page.locator('[data-required-model-readiness]').isVisible(),true);
  await page.locator('[data-post-chat-recall]:visible').click();await waitStage(page,id,'block_learn');assert.deepEqual(await history(page,id),[]);await noInventedClaims(page,id);
  checks.push(`M4: negative ${label} corruption cannot reuse current-target model confirmation`);await context.close();
 }
 for(const id of ['D6','M4','G4'])for(const failAt of ['model-confirmation','entry','source-return','rating-evidence']){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);
  if(failAt!=='model-confirmation')await confirmRequiredModels(page,id);
  if(['source-return','rating-evidence'].includes(failAt))await enterPostChat(page,id);
  if(failAt==='rating-evidence')await visibleCard(page).locator('[data-kp-reveal]').click();
  const beforeState=await raw(page,studyKey(id)),beforeHistory=await raw(page,reviewKey(id));
  await failStorage(page,failAt==='rating-evidence'?reviewKey(id):studyKey(id));
  await page.locator(failAt==='model-confirmation'?'[data-required-model-confirm]':failAt==='entry'?'[data-post-chat-recall]:visible':failAt==='source-return'?'[data-stage-target="source_contact"]:visible':'[data-kp-recall-card]:visible [data-rating="known"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-xizong-v6-block]')?.dataset.xizongStateBlocked==='true');
  assert.equal(await raw(page,studyKey(id)),beforeState);assert.equal(await raw(page,reviewKey(id)),beforeHistory);await noInventedClaims(page,id);
  await page.screenshot({path:path.join(out,`${id}-${failAt}-failure.png`),fullPage:true});
  await page.reload({waitUntil:'domcontentloaded'});await blockReady(page,id);assert.equal(await raw(page,studyKey(id)),beforeState);assert.equal(await raw(page,reviewKey(id)),beforeHistory);
  checks.push(`${id}: ${failAt} save failure preserves exact prior state/history and cannot navigate or create evidence`);await context.close();
 }
 // D19 ordinary clinical sections remain accessible; the independent O9/Tumor
 // decision is held only at the two exact accepted tumor-bearing groups.
 {
  const id='D19',context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await confirmRequiredModels(page,id);await enterPostChat(page,id);
  const object=objects.get(id),gates=object.sourceContact.independentReadinessGates.filter(g=>g.status==='HOLD_EXTERNAL_EVIDENCE_BINDING_REQUIRED');assert.deepEqual(gates.flatMap(g=>g.logicGroupIds),['b-d19-lg04','b-d19-lg06']);
  for(const groupId of gates.flatMap(g=>g.logicGroupIds)){
   const index=object.logicGroups.findIndex(g=>g.identity.logicGroupId===groupId);await page.locator(`[data-group-target="${index}"]`).click();
   const hold=page.locator('[data-independent-readiness-hold]');assert.equal(await hold.isVisible(),true);assert.match(await hold.textContent(),/O9/);
   assert.notEqual((await read(page,studyKey(id))).stage,'kp_recall');
   const held=page.locator(`[data-kp-id="${object.logicGroups[index].kpIds[0]}"]`);await held.locator('[data-kp-reveal]').dispatchEvent('click');await held.locator('[data-rating="known"]').dispatchEvent('click');assert.deepEqual(await history(page,id),[]);
   await page.screenshot({path:path.join(out,groupId+'-tumor-held.png'),fullPage:true});
   await page.locator('[data-group-target="4"]').click();await waitStage(page,id,'kp_recall');await assertNativeFront(page,id);assert.equal(await hold.isVisible(),false);await noInventedClaims(page,id);
  }
  assert.equal(await read(page,studyKey('G5')),null);assert.equal(await read(page,studyKey('O9')),null);
  checks.push('D19: actual model confirmation leaves independent O9/Tumor Gate held only on LG04/LG06; non-tumor LG05 remains usable with no fake prior completion');await context.close();
 }
 // Historical Recall is preserved as history even when a current medical
 // claim is held. The declared old rating below cannot create Source, model
 // readiness, a fresh Recall attempt, group closure or completion.
 {
  const id='D19',context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await confirmRequiredModels(page,id);await enterPostChat(page,id);
  const object=objects.get(id),gate=object.sourceContact.independentReadinessGates.find(g=>g.status==='HOLD_SOURCE_CONFLICT');
  assert.ok(gate);assert.deepEqual(gate.logicGroupIds,['b-d19-lg07']);assert.deepEqual(gate.kpIds,['digestive-d19-kp18']);
  const heldId=gate.kpIds[0],groupIndex=object.logicGroups.findIndex(g=>g.identity.logicGroupId===gate.logicGroupIds[0]),kpIndex=object.kps.findIndex(kp=>kp.identity.kpId===heldId),kp=object.kps[kpIndex];
  const state=await read(page,studyKey(id)),evidence=await read(page,reviewKey(id));
  state.ratings[heldId]='known';Object.assign(state,{groupIndex,kpIndex,resumeGroupId:gate.logicGroupIds[0],resumeKpId:heldId});
  const old={at:'2026-09-01T00:00:00.000Z',type:'KP_RECALL',kp_id:heldId,rating:'known',evidence_origin:'DECLARED_HISTORICAL_MEDICAL_HOLD_FIXTURE',core_revealed:true,source_hash:object.sourceHash};
  evidence.evidenceHistory.push(old);evidence.lastRecallRatings[heldId]='known';
  await page.evaluate(({stateKey,state,evidenceKey,evidence})=>{localStorage.setItem(stateKey,JSON.stringify(state));localStorage.setItem(evidenceKey,JSON.stringify(evidence));},{stateKey:studyKey(id),state,evidenceKey:reviewKey(id),evidence});
  await page.reload({waitUntil:'domcontentloaded'});await blockReady(page,id);await waitStage(page,id,'logic_group');
  assert.equal((await read(page,studyKey(id))).ratings[heldId],'known','old rating is retained, never rewritten');assert.deepEqual(await read(page,reviewKey(id)),evidence);
  const held=page.locator(`[data-held-source-reference][data-held-group="${gate.logicGroupIds[0]}"]`),reference=held.locator('[data-held-current-reference]');
  assert.equal(await held.isVisible(),true);assert.equal(normalized(await held.locator('[role="alert"]').textContent()),normalized(gate.note));assert.match(await page.locator('[data-independent-readiness-hold]').textContent(),/HOLD|待核验|未裁定|冲突/);
  assert.equal(await held.locator('[data-held-reference-prompt]').isVisible(),true);assert.equal(normalized(await held.locator('[data-held-reference-prompt]').textContent()),normalized(kp.prompt.canonical),'held full native Prompt remains visible with the Current reference closed');
  assert.equal(await reference.count(),1);assert.equal(await reference.evaluate(node=>node.open),false);assert.ok((await reference.locator('summary').innerText()).includes(kp.identity.title));assert.match(await reference.locator('summary').innerText(),/仅供参考/);
  assert.deepEqual(await held.locator('ul a').evaluateAll(nodes=>nodes.map(node=>({url:node.getAttribute('href'),role:node.textContent}))),gate.sourceRefs.map(({url,role})=>({url,role})));
  const rail=page.locator(`[data-logic-group-detail="${gate.logicGroupIds[0]}"]`);await rail.waitFor({state:'visible'});
  assert.equal(await rail.locator('.xzLogicGroupGoal > b').textContent(),'Current 参考目标 · HOLD');assert.equal(await rail.locator('.xzLogicGroupClosure > b').textContent(),'Current 参考闭环 · HOLD，不认领完成');
  assert.equal(await rail.locator('.xzLogicGroupKp > em').textContent(),'历史回忆');assert.equal(await rail.locator('.xzLogicGroupKp.learned,.xzLogicGroupKp.recalled').count(),0,'historical held rating must not acquire current learned/recalled styling');
  assert.match(await page.locator('[data-logic-goal]').textContent(),/^Current 参考目标 · HOLD：/);assert.equal(await page.locator('[data-logic-closure-label]').textContent(),'Current 参考闭环 · HOLD，不认领完成');
  await page.screenshot({path:path.join(out,'D19-lg07-medical-hold-closed.png'),fullPage:true});
  const before=await raw(page,studyKey(id));await reference.locator('summary').click();
  assert.equal(normalized(await reference.locator('.markdown').textContent()),normalized(await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').body.textContent,kp.core.html)),'held reference preserves unchanged Current Core with an explicit warning');
  assert.equal(await raw(page,studyKey(id)),before,'opening reference does not grant evidence');
  const heldCard=page.locator(`[data-kp-recall-card][data-kp-id="${heldId}"]`);await heldCard.locator('[data-kp-reveal]').dispatchEvent('click');await heldCard.locator('[data-rating="known"]').dispatchEvent('click');await page.locator('[data-enter-group]').click();await waitStage(page,id,'logic_group');
  assert.equal(await heldCard.locator('[data-kp-answer]').isVisible(),false);assert.deepEqual(await read(page,reviewKey(id)),evidence);assert.equal(await page.locator(`[data-group-target="${groupIndex}"]`).evaluate(node=>node.classList.contains('done')),false);
  const {inspectXizongBlockCompletion}=await import('../src/lib/xizongMemoryAutoRelease.mjs');const completion=inspectXizongBlockCompletion(object,await read(page,studyKey(id)));assert.equal(completion.complete,false);assert.equal(completion.reason,'INDEPENDENT_READINESS_UNRESOLVED');assert.ok(completion.heldLogicGroupIds.includes(gate.logicGroupIds[0]));
  await page.screenshot({path:path.join(out,'D19-lg07-medical-hold-current-reference.png'),fullPage:true});await noInventedClaims(page,id);
  for(const index of [4,7]){await page.locator(`[data-group-target="${index}"]`).click();await waitStage(page,id,'kp_recall');await assertNativeFront(page,id);assert.equal(await held.isVisible(),false);assert.deepEqual(await read(page,reviewKey(id)),evidence);}
  await page.locator(`[data-group-target="${groupIndex}"]`).click();await waitStage(page,id,'logic_group');assert.equal(await held.isVisible(),true);assert.deepEqual(await read(page,reviewKey(id)),evidence);await noInventedClaims(page,id);
  checks.push('D19 LG07/KP18 medical conflict: explicit held Current-reference-only Core and real provenance; preserved declared past rating/history never becomes accepted current answer/closure; independent previous and next clinical nodes remain reachable; Tumor holds stay separate');await context.close();
 }
 // Current visual surfaces are inspected as support only. D13 has no mounted
 // current-27 crop; M4 explicitly retains its qualified 26-source diagrams.
 for(const id of ['D13','M4']){
  const context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);await confirmRequiredModels(page,id);await enterPostChat(page,id);
  const object=objects.get(id),visualGroups=object.logicGroups.filter(g=>g.visual.length);assert.equal(visualGroups.length,2);
  for(const group of visualGroups){
   const index=object.logicGroups.indexOf(group);await page.locator(`[data-group-target="${index}"]`).click();await waitStage(page,id,'kp_recall');await assertNativeFront(page,id);
   const before=await raw(page,studyKey(id));await visibleCard(page).locator('[data-kp-reveal]').click();
   for(const cue of group.visual){const visual=page.locator(`[data-xizong-aux-surface] [data-learner-asset-id="${cue.id}"]`);await visual.waitFor({state:'visible'});assert.ok((await visual.innerText()).includes(cue.sourceLocator));assert.ok((await visual.innerText()).includes(cue.task));if(id==='D13'){assert.match(cue.sourceLocator,/27外科/);assert.equal(await visual.locator('img').count(),0,'unmounted current-27 images cannot be fabricated');}else{assert.match(cue.sourceLocator,/26生化/);assert.ok(await visual.locator('img').count()>0,'qualified 26-source bundle remains available');}}
   assert.equal(await raw(page,studyKey(id)),before,'showing visual support is not original-image contact');await noInventedClaims(page,id);
   await page.screenshot({path:path.join(out,group.identity.logicGroupId+'-visual-qualification.png'),fullPage:true});
  }
  checks.push(`${id}: real visual qualification survives post-Chat Reveal; no fabricated crop or original-image/Source evidence`);await context.close();
 }
 // Separately labeled Source-control fixtures intentionally confirm hypothetical
 // contact via the production buttons. They are never used to unlock a model.
 {
  const id='D1',context=await newContext(),page=await newPage(context);await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);
  await page.locator('[data-stage-next="logic_group"]').click();await waitStage(page,id,'kp_learn');await noInventedClaims(page,id);
  await page.locator('[data-group-lecture-done]:visible').click();await waitStage(page,id,'kp_recall');const state=await read(page,studyKey(id)),group=objects.get(id).logicGroups[0];
  assert.deepEqual(Object.keys(state.learned),group.kpIds);assert.equal(state.sourceContactEvidence.length,1);assert.equal(state.sourceContactEvidence[0].segment_id,`source:${group.identity.logicGroupId}`);assert.notEqual(state.sourceContactDone,true);assert.equal(state.recallEntryMode,undefined);assert.equal(state.completed,false);assert.deepEqual(state.ttsxEvidence,{});
  await page.locator('[data-group-target="1"]').click();await waitStage(page,id,'kp_learn');assert.deepEqual(Object.keys((await read(page,studyKey(id))).learned),group.kpIds);
  checks.push('Declared synthetic Source-control fixture D1: one explicit real button covers exactly one whole LG; next group still requires its own Source; no TTSX or Block completion invented');await context.close();
 }
 {
  const context=await newContext(),page=await newPage(context);await page.goto(systemUrl,{waitUntil:'domcontentloaded'});await ready(page);
  const lane=JSON.parse(await page.locator('[data-biochemistry-lane-payload]').textContent());assert.equal(lane.units.length,22,'27-biochemistry means this exact 22-unit teacher-order lane');assert.equal(await read(page,laneKey),null);
  await page.screenshot({path:path.join(out,'global27-source-first.png'),fullPage:true});
  for(let index=0;index<lane.units.length;index++){
   const unit=lane.units[index];assert.equal(await page.locator(`[data-biochemistry-unit-panel="${unit.id}"]`).isVisible(),true);if(index+1<lane.units.length)assert.equal(await page.locator(`[data-biochemistry-unit-target="${lane.units[index+1].id}"]`).isDisabled(),true,'future Source remains locked');
   await page.locator('[data-biochemistry-unit-complete]').click();const ledger=await read(page,laneKey);assert.deepEqual(ledger.history.map(row=>row.source_unit_id),lane.units.slice(0,index+1).map(row=>row.id));assert.ok(ledger.history.every(row=>row.source_hash===lane.sourceHash));
   if(['BIO27-S01','BIO27-S03','BIO27-S20'].includes(unit.id)){
    const id=unit.id==='BIO27-S01'?'M2':unit.id==='BIO27-S03'?'M4':'G4';await page.goto(blockUrl(id),{waitUntil:'domcontentloaded'});await blockReady(page,id);const state=await read(page,studyKey(id)),object=objects.get(id),covered=object.sourceContact.segments.filter(s=>ledger.history.some(row=>row.source_unit_id===s.sourceUnitId)),ordinals=new Set(covered.flatMap(s=>s.kpOrdinals));
    assert.deepEqual(Object.keys(state.learned).sort(),object.kps.filter(kp=>ordinals.has(kp.identity.ordinal)).map(kp=>kp.identity.kpId).sort(),'only exact primary global units form native KPs');assert.equal(state.sourceContactDone===true,covered.some(s=>s.closesBlockSourceContact)&&covered.length===object.sourceContact.segments.length);
    assert.ok(state.sourceContactEvidence.every(row=>row.coverage_kind==='GLOBAL_BIOCHEMISTRY_SOURCE_UNIT'));assert.equal(state.completed,false);assert.equal(state.blockRecallDone,false);assert.equal(state.requiredModelContinuation,undefined,'Source receipt does not stand in for actual required-model understanding');assert.deepEqual(state.ratings,{});
    if(id==='M2'){assert.equal(Object.keys(state.learned).length,7);assert.notEqual(state.sourceContactDone,true,'M2 requires final S04 closure, not merely first primary contact');}
    await page.goto(systemUrl,{waitUntil:'domcontentloaded'});await ready(page);
   }
  }
  assert.equal(await page.locator('[data-biochemistry-unit-complete]').isDisabled(),true);assert.equal(normalized(await page.locator('[data-biochemistry-progress]').textContent()),'22 / 22');
  assert.equal(await read(page,memoryKey),null);await page.screenshot({path:path.join(out,'global27-declared-source-control-complete.png'),fullPage:true});
  checks.push('Declared synthetic global27 Source-control fixture: all 22 real confirmation buttons enforce teacher order; exact primary M/G projection, M2 non-contiguous final closure, current-target understanding remains separate; no prior Block completion injection');await context.close();
 }
 assert.deepEqual(errors,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.error=error.stack;try{if(lastPage&&!lastPage.isClosed())await lastPage.screenshot({path:path.join(out,'failure.png'),fullPage:true})}catch{};throw error;}
finally{report.finished_at=new Date().toISOString();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();console.log(JSON.stringify({status:report.status,checks:checks.length,output:out,errors},null,2));}
