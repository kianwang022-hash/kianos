// Independent model-based checks. Synthetic learner state only; no U claim.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { publicPracticeCatalog, practiceReviewPayload } from '../src/lib/politicsPracticeView.mjs';
import { PRACTICE_KEYS as K, readPoliticsSnapshot, selectPoliticsReview, politicsReviewPacket, politicsSessionMatchesCatalog, resolvePoliticsContinue } from '../src/lib/politicsPracticeState.mjs';
import { recordPoliticsFirstAttempt } from '../src/lib/politicsUnitReturn.mjs';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';
import { resolvePoliticsSurfaceMapping } from '../src/lib/politicsSurfaceMapping.mjs';

const root = path.resolve(process.env.KIANOS_REPO_ROOT || '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const json = p => JSON.parse(read(p));
const results = [];
const check = (name, run) => {try {results.push({name,status:'PASS',detail:run()});} catch(e) {results.push({name,status:'FAIL',error:String(e.stack || e)});} console.log(JSON.stringify(results.at(-1)));};
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const client = publicPracticeCatalog(catalog);
const question = id => catalog.questions.find(q => q.id === id);
const q = catalog.questions.find(q => q.subject === 'history' && q.unitKey && q.type === 'single');
const unit = catalog.units.find(u => u.key === q.unitKey);
const firstInput = {question_id:q.id,outcome:'STABLE',selected:q.answer,correct_answer:q.answer,uncertain:false,study_day:'2026-09-18',observed_at:'2026-09-18T01:00:00.000Z',source_context:{source_href:'/politics/history/ch01/#unit-1',unit_id:'synthetic-original-unit',source_owner_ids:['synthetic-source'],content_revision:'original'}};
const first = recordPoliticsFirstAttempt({units:{}},unit.returnConfig,firstInput);
const fixture = () => ({attempts:structuredClone(first.store),meta:{latestOutcome:{[q.id]:'WRONG'},notes:{[q.id]:'SYNTHETIC'},causes:{[q.id]:'options'}},session:null,last:null,errors:[],events:[{event_id:'SYNTHETIC-repeat',question_id:q.id,unit_id:'synthetic-original-unit',outcome:'WRONG',selected:'A',study_day:'2026-09-18',observed_at:'2026-09-18T02:00:00.000Z',source_context:{source_href:'/politics/history/ch01/#unit-1',unit_id:'synthetic-original-unit',source_owner_ids:['synthetic-source'],content_revision:'original'}}]});

check('catalog-source-accounting-and-sole-ready-owner',()=>{
  assert.equal(catalog.questions.length,1148);assert.equal(client.questions.length,1127);assert.equal(client.unavailable.length,21);
  const all = catalog.units.flatMap(u=>u.questionIds);
  assert.equal(new Set(all).size,all.length);
  for(const item of client.questions) assert.equal(all.filter(id=>id===item.id).length,1);
  return {sourceQuestions:1148,ready:1127,withheld:client.unavailable.map(q=>q.id),referenceParentRecoveries:catalog.questions.filter(q=>q.scopeStatus==='REFERENCE_ONLY_PARENT_RECOVERY').length};
});

check('whole-item-readiness-includes-decisive-distractors',()=>{
  const expected={
    'X1000-MARX-S-029':'POL27-CF-MARX-C02-S01',
    'X1000-MARX-M-026':'POL27-CF-MARX-C03-S02',
    'X1000-MARX-M-045':'POL27-CF-MARX-C03-S02',
    'X1000-MARX-M-047':'POL27-CF-MARX-C02-S02',
    'X1000-MARX-M-048':'POL27-CF-MARX-C02-S01',
    'X1000-MARX-M-049':'POL27-CF-MARX-C02-S02'};
  const cp=json('content/politics/learning/marxism/ch02.first-ready.json').embedded_checkpoints[0];
  assert.equal(cp.first_ready_question_ids.length,5);assert.equal(cp.deferred_questions.length,10);
  for(const [id,target] of Object.entries(expected)) {assert.equal(question(id).unitId,target);assert.ok(!cp.first_ready_question_ids.includes(id));const row=cp.deferred_questions.find(r=>r.question_id===id);assert.equal(row.first_ready_natural_unit_id,target);assert.ok(row.source_refs.length);assert.ok(row.readiness_reason);}
  assert.equal(new Set([...cp.first_ready_question_ids,...cp.deferred_questions.map(r=>r.question_id)]).size,cp.owner_question_ids.length);
  return {early:cp.first_ready_question_ids,reviewedDeferrals:expected};
});

check('no-question-truth-or-source-invention',()=>{
  const source=json('content/politics/manifest.json').source_inventory;
  for(const key of ['questions','regions','source_nodes']) {const p=source[key];assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,p.path))).digest('hex'),p.sha256);}
  for(const row of client.questions) for(const field of ['answer','refined','chatExplanation','takeaway','source','chengfengLocator','semanticUnitIds']) assert.ok(!(field in row),`${row.id}:${field}`);
  for(const row of catalog.questions.filter(q=>q.unitKey)) {const p=practiceReviewPayload(catalog,row.id);assert.equal(p.answer,row.answer);assert.equal(p.takeaway,row.refined.takeaway);assert.equal(p.chatExplanation,row.refined.chatExplanation);assert.equal(p.id,row.id);}
  assert.throws(()=>practiceReviewPayload(catalog,client.unavailable[0].id));
  return {protectedPayloads:client.questions.length,sourceHashes:'unchanged'};
});

check('all-current-mapped-states-resolve-with-heterogeneous-primitives',()=>{
  const manifest=json('content/politics/projection/manifest.json');let count=0,reference=0,groups=0;const shapes={};
  for(const [subject,entry] of Object.entries(manifest.subjects)) for(const name of entry.files) {
    const code=path.basename(name).replace('.projection.json','');const spec=json('content/politics/projection/'+name);
    const map=loadPoliticsCompiledPresentation(subject==='ethics-law'?'ethics_law':subject,code);
    for(const row of spec.units) {if(row.projection_disposition==='REFERENCE_ONLY'){reference++;assert.ok(!map.has(row.unit_id));}}
    for(const [id,p] of map) {count++;assert.ok(p.surfacePlan);assert.ok(p.surfacePlan.states.ORIENT?.length);for(const [state,list] of Object.entries(p.surfacePlan.states)) for(const g of list){groups++;shapes[g.primitive]=(shapes[g.primitive]||0)+1;assert.ok(g.items.length,`${id}:${state}:${g.id}`);for(const t of g.transitions||[]) {assert.ok(g.items.some(i=>i.id===t.from));assert.ok(g.items.some(i=>i.id===t.to));if(t.relation_mode==='ORDER_ONLY')assert.equal(t.relation,null);else assert.ok(t.relation?.trim());}}}
  }
  assert.equal(count,151);assert.equal(reference,9);
  for(const primitive of ['PARALLEL_SET','RELATION_SET','DIRECTED_SEQUENCE','COMPARE','TIMELINE','HIERARCHY','STATEMENT'])assert.ok(shapes[primitive]);
  return {mappedUnits:count,referenceOwners:reference,groups,shapes,embeddedK03:'operational source checkpoint; no independent teaching mapping or invented graph'};
});

check('mapping-missing-relation-is-not-permission-to-invent',()=>{
  const u={natural_unit_id:'synthetic',items:['A','B']};
  const g={id:'synthetic-g',zone:'PRIMARY',primitive:'DIRECTED_SEQUENCE',source:{scope:'unit',field:'items'},select_indices:[0,1],item_ids:['a','b'],transitions:[{from:'a',to:'b'}]};
  const run = group=>resolvePoliticsSurfaceMapping({ORIENT:[group]}, {}, u).states.ORIENT[0];
  const resolved=run(g);assert.equal(resolved.transitions[0].relation_mode,'ORDER_ONLY');assert.equal(resolved.transitions[0].relation,null);
  assert.throws(()=>run({...g,transitions:[{from:'a',to:'b',relation:'  '}]}));
  assert.throws(()=>run({...g,transitions:[{from:'missing',to:'b'}]}));
  assert.throws(()=>run({...g,source:{scope:'unit',field:'not_present'}}));
  assert.throws(()=>run({...g,source:{scope:'unit',field:'__proto__.x'}}));
  const own=run({...g,transitions:[{from:'a',to:'b',relation:'SYNTHETIC owned relation'}]});assert.equal(own.transitions[0].relation,'SYNTHETIC owned relation');
  return {missingText:'ORDER_ONLY/null',invalidTextAndRefs:'rejected'};
});

check('History-C02-teaching-order-is-not-start-time-causality',()=>{
  const h=json('content/politics/learning/history/ch02.json');
  assert.ok(!h.units[0].next.includes('农民革命失败后'));
  assert.ok(!h.units[1].next.includes('技术路线不够后'));
  assert.ok(h.chapter_compression.historical_direction.includes('讲解'));
  const source=read('content/politics/source/source_node_registry.v2.jsonl');
  for(const ref of ['POL27-CF-HISTORY-C02-K01-N05','POL27-CF-HISTORY-C02-K03-N01-I01'])assert.ok(source.includes(ref));
  return {sourceAnchors:['POL27-CF-HISTORY-C02-K01-N05','POL27-CF-HISTORY-C02-K03-N01-I01'],repair:'narrow transition wording; not a new History framework'};
});

check('first-attempt-is-immutable-even-after-owner-rebinding',()=>{
  const before=JSON.stringify(first.store);const other={...unit.returnConfig,unit_key:'synthetic-new-owner'};
  const later=recordPoliticsFirstAttempt(first.store,other,{...firstInput,outcome:'WRONG',observed_at:'2026-09-19T00:00:00.000Z'});
  assert.equal(later.recorded,false);assert.equal(later.reason,'FIRST_ATTEMPT_ALREADY_RECORDED');assert.equal(JSON.stringify(first.store),before);assert.equal(JSON.stringify(later.store),before);
  const c={...catalog,questions:[{...q,unitKey:'synthetic-new-owner',unitId:'synthetic-new-unit'}]};
  const review=selectPoliticsReview(c,fixture());assert.equal(review.items.length,1);assert.equal(review.items[0].firstAttemptOwnerKey,q.unitKey);assert.equal(review.items[0].events[0].unit_id,'synthetic-original-unit');
});

check('packet-preserves-first-stable-plus-later-Wrong-and-original-source',()=>{
  const snap=fixture(), bytes=JSON.stringify(snap);const p=politicsReviewPacket(catalog,snap);
  assert.deepEqual(p.first_attempts[0].attempt,first.attempt);assert.equal(p.first_attempts[0].attempt.outcome,'STABLE');assert.deepEqual(p.events,snap.events);
  snap.last={href:'/politics/xi/ch17/#unit-1'};const p2=politicsReviewPacket(catalog,snap);assert.deepEqual(p.events,p2.events);
  assert.equal(p2.review_context[0].source_href_role,'CURRENT_NAVIGATION_NOT_HISTORICAL_PROVENANCE');assert.equal(p2.review_context[0].original_source_context.content_revision,'original');
  const saved=JSON.stringify(snap);for(let i=0;i<5;i++)politicsReviewPacket(catalog,snap);assert.equal(JSON.stringify(snap),saved);
  assert.equal(p.review_policy.no_follow_up_is_valid,true);assert.equal(p.review_policy.group_by_underlying_failure,true);
  assert.notEqual(bytes,saved);
});

check('legacy-source-context-is-unknown-not-reconstructed-as-current',()=>{
  const snap=fixture();delete snap.attempts.units[q.unitKey].attempts[q.id].source_context;snap.events=[];
  const p=politicsReviewPacket(catalog,snap);assert.equal(p.first_attempts[0].source_context_status,'LEGACY_SOURCE_CONTEXT_UNAVAILABLE');assert.equal(p.events[0].source_href,undefined);assert.equal(p.review_context[0].original_source_context,null);
});

check('stable-correct-does-not-create-review-or-Memory',()=>{
  const snap=fixture();snap.meta.latestOutcome[q.id]='STABLE';snap.events=[];
  assert.equal(selectPoliticsReview(catalog,snap).items.length,0);assert.equal(politicsReviewPacket(catalog,snap).events.length,0);
  snap.meta.discussion={[q.id]:true};assert.equal(selectPoliticsReview(catalog,snap).items.length,1);assert.equal(selectPoliticsReview(catalog,snap).problemIds.length,0);
  const mem=json('content/politics/learning/marxism/ch02.memory.json');assert.equal(mem.preferred_memory_reference.binding_status,'PENDING_SOURCE_BINDING');assert.equal(mem.admission_gate.default,'NOT_ADMITTED');
  const candidates=Object.values(mem.units).flatMap(u=>u.candidates);assert.equal(candidates.length,4);assert.ok(candidates.every(c=>c.admission==='CANDIDATE_ONLY' && c.source_refs.length));
  const code=read('static-web/src/lib/politicsPracticeClient.mjs')+read('static-web/src/lib/politicsReviewClient.mjs');assert.ok(!/D1\/D3\/D7\/D14/.test(code));assert.ok(!/setItem\([^\n]*memory/i.test(code));
  return {memoryCandidates:4,admittedByRuntime:0,handbook:'UPSTREAM SOURCE NOT YET AVAILABLE'};
});

check('corrupt-storage-fails-closed-and-preserves-original-bytes',()=>{
  for(const [key,value] of [[K.meta,[]],[K.meta,{notes:[]}],[K.meta,{latestOutcome:{q:'MASTERED'}}],[K.attempts,{units:{bad:{attempts:[]}}}],[K.evidence,[null]]]) {
    const raw=JSON.stringify(value);const storage={getItem:k=>k===key?raw:null};const snap=readPoliticsSnapshot(storage);assert.ok(snap.errors.includes(key));assert.throws(()=>politicsReviewPacket(catalog,snap));assert.equal(storage.getItem(key),raw);
  }
  assert.equal(readPoliticsSnapshot({getItem:()=>null}).errors.length,0);
});

check('unrelated-content-update-does-not-destroy-active-session',()=>{
  const s={runtimeVersion:2,id:'synthetic-session',status:'active',ids:[q.id],index:0,revision:'older-catalog',taskRevisions:{[q.id]:q.taskRevision}};
  assert.equal(politicsSessionMatchesCatalog(s,client),true);
  assert.equal(resolvePoliticsContinue(client,{session:s,last:null},'/').stale,undefined);
  const changed={...client,questions:client.questions.map(row=>row.id===q.id?{...row,taskRevision:'question-truth-changed'}:row)};assert.equal(politicsSessionMatchesCatalog(s,changed),false);
  assert.equal(resolvePoliticsContinue(changed,{session:s,last:null},'/').stale,true);
  const legacy={...s};delete legacy.taskRevisions;assert.equal(politicsSessionMatchesCatalog(legacy,client),false);legacy.revision=client.revision;assert.equal(politicsSessionMatchesCatalog(legacy,client),true);
  assert.equal(politicsSessionMatchesCatalog({...s,ids:[q.id,q.id]},client),false);
});

check('exact-Return-rejects-neighbor-unit-or-foreign-host',()=>{
  const session={runtimeVersion:2,id:'synthetic',status:'active',ids:[q.id],index:0,revision:client.revision,taskRevisions:{[q.id]:q.taskRevision}};
  const u=new URL(q.unitHref,'https://kianos.invalid');u.searchParams.set('practiceSession',session.id);u.searchParams.set('practiceQuestion',q.id);
  let last={href:u.pathname+u.search+u.hash};assert.equal(resolvePoliticsContinue(client,{session,last}).href,last.href);
  last={href:u.pathname+u.search+'#not-the-original-unit'};assert.ok(resolvePoliticsContinue(client,{session,last}).href.startsWith('/politics/practice/'));
  last={href:'https://example.invalid'+u.pathname+u.search+u.hash};assert.ok(resolvePoliticsContinue(client,{session,last}).href.startsWith('/politics/practice/'));
});

const report={schema:'kianos.politics.fresh-audit.v1',synthetic:true,learner_U:'UNTESTED',results,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length};
const out=process.env.POLITICS_FRESH_EVIDENCE;if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'semantic-runtime-results.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
