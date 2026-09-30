import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import * as L from '../src/lib/englishLearnerEvidence.mjs';
import * as S from '../src/lib/englishSessionControl.mjs';
import {studyDayAt} from '../src/lib/studyTimer.mjs';
import {buildTranslationHandoff,parseTranslationReturn,applyTranslationReturn,blankTransferLedger} from '../src/lib/translationRuntimeModel.mjs';
const component=name=>fs.readFileSync(new URL(`../src/components/${name}.astro`,import.meta.url),'utf8');
class Storage {
 constructor(rows={}){this.map=new Map(Object.entries(rows));this.writes=0;this.failKey=null;}
 get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;}
 setItem(k,v){if(this.failKey===k){this.failKey=null;throw new Error('synthetic quota failure');}this.writes++;this.map.set(k,String(v));}
 removeItem(k){this.writes++;this.map.delete(k);}
}
const transferKey='kianos-english-objective-transfer-claims-v1';
const attemptKey='kianos-cloze-attempt-v1:fixture';
const reviewKey='kianos-english-objective-review-return-v1:cloze:fixture';
const submitted={submitted:true,submittedAt:'2026-09-30T10:01:00Z',answers:{q1:'A'},results:{q1:'wrong'},uncertain:[],binding:{task:'cloze',object_id:'fixture',source_hash:'v1',attempt_id:'a1',revision:1,source_snapshot:{questions:[{id:'q1'}]}}};
// Execute the actual Return handler and its parsing helpers, with only DOM and
// the unrelated lexical owner boundary replaced by explicit inert fixtures.
function returnHarness(storage,payload,prepare=async()=>({guards:[],changes:[],events:[]})){
 const source=component('ObjectiveTransferClaims');
 const constants=source.slice(source.indexOf('  const STORE_KEY ='),source.indexOf("  document.querySelectorAll('[data-objective-transfer-runtime]')"));
 const handler=source.slice(source.indexOf('    let applying='),source.indexOf('    const node = ensurePanel();',source.indexOf('      render();',source.indexOf('    let applying='))));
 const input={value:JSON.stringify(payload)},status={textContent:''},box={hidden:false};
 const panel={querySelector:s=>({'[data-transfer-input]':input,'[data-transfer-status]':status,'[data-transfer-import]':box}[s]??null)};
 const root={querySelectorAll:()=>[{getAttribute:()=> 'q1'}],dispatchEvent:()=>{}};
 const context={localStorage:storage,readEnglishJson:L.readEnglishJson,readEnglishObjectiveTransferClaims:L.readEnglishObjectiveTransferClaims,atomicEnglishWrites:L.atomicEnglishWrites,prepareEnglishLexicalReturn:prepare,task:'cloze',objectId:'fixture',readingMode:false,attemptKey,reviewKey,readAttempt:()=>JSON.parse(storage.getItem(attemptKey)),readHandoff:()=>null,problemCount:()=>1,ensurePanel:()=>panel,root,render:()=>{},HTMLElement:class {},CustomEvent:class {},window:{dispatchEvent:()=>{}}};
 vm.runInNewContext(constants+handler+'globalThis.run=applyReturn;',context);
 return {run:context.run,status};
}
const payload={schema:'kianos.english.objective_review_return.v1',task:'cloze',objectId:'fixture',attemptSubmittedAt:submitted.submittedAt,sourceHash:'v1',threads:[],newClaims:[],claimUpdates:[]};
test('actual Objective Return refuses corrupt stores/reviews without writing any key',async()=>{
 for(const raw of ['{broken','null','[]','{"version":1,"claims":"broken"}',...[null,'broken',[null]].map(history=>JSON.stringify({version:1,claims:[{claimId:'c',task:'cloze',status:'TRANSFER_PENDING',history}]}))]){
  const storage=new Storage({[attemptKey]:JSON.stringify(submitted),[transferKey]:raw});const before=[...storage.map];
  const h=returnHarness(storage,payload);await h.run();assert.match(h.status.textContent,/无法读取/);assert.deepEqual([...storage.map],before);assert.equal(storage.writes,0);
  assert.equal(L.exportEnglishCheckpoint(storage).native_integrity.status,'corrupt-retained');
 }
 for(const raw of ['{broken','{}',JSON.stringify({schema:'wrong',task:'cloze',objectId:'fixture',threads:[]}),JSON.stringify({schema:payload.schema,task:'cloze',objectId:'fixture',threads:['broken']})]){const storage=new Storage({[attemptKey]:JSON.stringify(submitted),[reviewKey]:raw});const before=[...storage.map];await returnHarness(storage,payload).run();assert.deepEqual([...storage.map],before);assert.equal(storage.writes,0);}
});
test('actual Objective Return is atomic, replay-safe, and retains unrelated fields',async()=>{
 const created=new Storage({[attemptKey]:JSON.stringify(submitted)});const withClaim={...payload,threads:[{threadId:'t',scope:'local',itemIds:['q1'],route:'cloze',summary:'synthetic diagnosis',repairCompleted:true,repairEvidence:'synthetic repair'}],newClaims:[{claimId:'c1',sourceThreadId:'t',statement:'Synthetic transfer only'}]};await returnHarness(created,withClaim).run();assert.equal(L.readEnglishObjectiveTransferClaims(created).claims[0].claimId,'c1');
 const raw=JSON.stringify({version:1,claims:[],futurePrivateField:{keep:true}});
 const storage=new Storage({[attemptKey]:JSON.stringify(submitted),[transferKey]:raw});
 const h=returnHarness(storage,payload);await h.run();assert.equal(JSON.parse(storage.getItem(transferKey)).futurePrivateField.keep,true);
 const writes=storage.writes;const replay=returnHarness(storage,payload);await replay.run();assert.equal(storage.writes,writes);assert.match(replay.status.textContent,/没有重复写入/);
 const failing=new Storage({[attemptKey]:JSON.stringify(submitted),[transferKey]:raw});failing.failKey=reviewKey;
 await returnHarness(failing,payload).run();assert.equal(failing.getItem(transferKey),raw);assert.equal(failing.getItem(reviewKey),null);assert.equal(failing.getItem(attemptKey),JSON.stringify(submitted));
 const changed=new Storage({[attemptKey]:JSON.stringify(submitted),[transferKey]:raw});
 await returnHarness(changed,payload,async()=>{changed.setItem(attemptKey,JSON.stringify({...submitted,submittedAt:'changed'}));return {guards:[],changes:[],events:[]};}).run();
 assert.equal(changed.getItem(transferKey),raw);assert.equal(changed.getItem(reviewKey),null);
 for(const bad of [{...payload,sourceHash:'v2'},{...payload,attemptSubmittedAt:'other'},{...payload,objectId:'other'},{...payload,threads:[{threadId:'t',route:'cloze',scope:'local',itemIds:['foreign']}]}]){
  const storage=new Storage({[attemptKey]:JSON.stringify(submitted)});await returnHarness(storage,bad).run();assert.equal(storage.writes,0);
 }
});
test('actual External hydration preserves frozen evidence and repeated reload leaves attempt bytes unchanged',()=>{
 const source=component('ExternalReadingWorkspace');
 const save=source.slice(source.indexOf('    const save='),source.indexOf('    const familyLabel='));
 const start=source.indexOf('      state={',source.indexOf('const saved=inspectEnglishAttempt'));
 const hydration=source.slice(start,source.indexOf('      if(library instanceof',start));
 const snapshot={questions:[],paragraphs:[]};const meta={task:'external_reading',object_id:'fixture',source_hash:'v1',snapshot};
 const saved={...submitted,binding:{...submitted.binding,task:'external_reading',source_snapshot:snapshot},firstEvidenceMeta:{attempt_id:'a1',source_hash:'v1',assistance:'unassisted'},mode:'READ_ONLY',stage:'completed',extra:{preserved:true}};
 const key='kianos-english-external-reading-attempt-v1:fixture';const storage=new Storage({[key]:JSON.stringify(saved)});
 const context={saved,active:{object_id:'fixture',title:'Synthetic',content_hash:'v1',questions:[]},meta,storageKey:key,lastKey:'last-fixture',base:'/',localStorage:storage,saveEnglishAttempt:L.saveEnglishAttempt,root:null,preserveEnglishFailure:(_r,e)=>{throw e;}};
 vm.runInNewContext(save+hydration+'globalThis.hydrated=state;',context);assert.deepEqual(JSON.parse(JSON.stringify(context.hydrated.firstEvidenceMeta)),saved.firstEvidenceMeta);assert.equal(storage.getItem(key),JSON.stringify(saved));
 context.saved=JSON.parse(storage.getItem(key));vm.runInNewContext(hydration,context);assert.equal(storage.getItem(key),JSON.stringify(saved));
 // Normal later native writes still use the frozen first evidence and version guard.
 L.saveEnglishAttempt(storage,key,JSON.parse(JSON.stringify(context.hydrated)),meta);assert.deepEqual(JSON.parse(storage.getItem(key)).firstEvidenceMeta,saved.firstEvidenceMeta);
 const fresh=new Storage();const freshContext={...context,saved:{},localStorage:fresh};vm.runInNewContext(save+hydration,freshContext);assert.equal(JSON.parse(fresh.getItem(key)).binding.task,'external_reading');
});
test('Reference uses canonical Handoff identity and never reveals an unopened Reference by default',()=>{
 const state={firstSubmittedAt:'2026-09-30T10:00:00Z',firstAttempts:{s1:'first'},binding:{source_hash:'v1',source_snapshot:{prompts:[{id:'s1'}]}},firstEvidenceMeta:{assistance:'unassisted'},referenceRevealed:false};
 const args={state,objectId:'fixture',paperId:'p1',title:'Synthetic',metadata:{snapshot:{}},sourceSegmentsText:()=> 'source',firstAttemptsText:()=> 'first',pendingText:()=> 'none',referenceText:()=> 'reference'};
 const hidden=buildTranslationHandoff(args);assert.match(hidden,/intentionally not revealed/);assert(!hidden.includes('\nreference\n'));
 const storage=new Storage({'translation-key':JSON.stringify(state)});const source=component('TranslationReferenceLoader');
 const block=source.slice(source.indexOf('    const buildHandoffWithReference ='),source.indexOf('    const copyText ='));
 const context={...args,attemptStorageKey:'translation-key',localStorage:storage,readEnglishJson:L.readEnglishJson,buildTranslationHandoff};vm.runInNewContext(block+'globalThis.packet=buildHandoffWithReference();',context);
 assert.equal(context.packet,buildTranslationHandoff({...args,referenceTextOverride:'reference'}));
 assert.match(context.packet,/attemptSubmittedAt: 2026-09-30T10:00:00Z/);assert.match(context.packet,/sourceHash: v1/);
 const sample=JSON.parse(context.packet.slice(context.packet.lastIndexOf('KIANOS_TRANSLATION_RETURN_V1\n')+'KIANOS_TRANSLATION_RETURN_V1\n'.length));assert.equal(sample.attemptSubmittedAt,state.firstSubmittedAt);assert.equal(sample.sourceHash,'v1');
 const pass={...sample,decision:'PASS',primary_failure:null,transfer_target:{admit:false},transfer_updates:[]};const parsed=parseTranslationReturn('KIANOS_TRANSLATION_RETURN_V1\n'+JSON.stringify(pass),'fixture');
 const applied=applyTranslationReturn({...state,stage:'diagnosis',history:[],affectedSegments:[]},parsed,[],blankTransferLedger(),{task:'fixture'});assert.equal(applied.state.stage,'passed');
 assert.throws(()=>applyTranslationReturn(state,{...parsed,sourceHash:'v2'},[],blankTransferLedger(),{task:'fixture'}),/SOURCE|REVISION/);
});
test('post-submit assistance is visible separately and cannot contaminate frozen first-performance counts',()=>{
 const first={prior_exposure:'unseen',assistance:'unassisted',independent_transfer_candidate:true,timing_status:'within_budget',elapsed_seconds:60,time_budget_seconds:90};
 const storage=new Storage({[attemptKey]:JSON.stringify({...submitted,firstEvidenceMeta:first,binding:{...submitted.binding,prior_exposure:'unseen',assistance:'unassisted'}})});
 const before=S.buildEnglishEvidencePacket(storage,{day:'2026-09-30'});const value=JSON.parse(storage.getItem(attemptKey));value.binding.assistance='assisted';storage.setItem(attemptKey,JSON.stringify(value));
 const after=S.buildEnglishEvidencePacket(storage,{day:'2026-09-30'});
 assert.deepEqual(after.performance_profile,before.performance_profile);assert.equal(after.inventory[0].assistance,'unassisted');assert.equal(after.inventory[0].current_assistance,'assisted');
 delete value.firstEvidenceMeta;storage.setItem(attemptKey,JSON.stringify(value));assert.equal(S.englishAttemptInventory(storage)[0].assistance,'assisted','legacy first performance is not fabricated');
});
test('binding uses the shared Shanghai study day, including UTC date boundary and cleared instructions',()=>{
 const now=Date.parse('2026-09-30T23:30:00Z');const meta={task:'cloze',object_id:'new',source_hash:'v1',snapshot:{questions:[{id:'q1'}]}};
 const instruction={study_day:'2026-10-01',steps:[{...meta,params:{time_budget_seconds:120,assistance_context:{state:'assisted',reason:'targeted teaching'}}}]};
 const storage=new Storage({'kianos-english-session-instruction-v1':JSON.stringify(instruction)});const key='kianos-cloze-attempt-v1:new';const value={answers:{},results:{},submitted:false};
 L.saveEnglishAttempt(storage,key,value,meta,{now});assert.equal(value.binding.time_budget_seconds,120);assert.equal(value.binding.assistance,'assisted');
 for(const change of [{study_day:'2026-09-30'},{cleared_at:'2026-09-30T23:00:00Z'}]){const storage=new Storage({'kianos-english-session-instruction-v1':JSON.stringify({...instruction,...change})});const v={answers:{},results:{},submitted:false};L.saveEnglishAttempt(storage,key,v,meta,{now});assert.equal(v.binding.time_budget_seconds,null);}
});
for(const [name,idKey] of [['ReadingAnswerGate','readingKey'],['ObjectiveAnswerGate','objectId']])test(`${name}: actual access guard allows scored review while retaining protected/readonly cases`,()=>{
 const source=component(name);const begin=source.indexOf('      const activeExam=readEnglishExamSession');const end=source.indexOf('      if (ready)',begin);const guard=source.slice(begin,end);
 for(const status of ['ACTIVE','SEALED','RELEASED','SCORED'])for(const readonly of [false,true]){
  const ctx={root:{dataset:{englishReadonly:readonly?'true':'false'}},[idKey]:'fixture',localStorage:{},readEnglishExamSession:()=>({status,steps:[{object_id:'fixture'}]})};vm.runInNewContext('globalThis.allowed=(()=>{'+guard+'return true;})();',ctx);assert.equal(ctx.allowed,!readonly&&['RELEASED','SCORED'].includes(status));
 }
});

test('Objective exit cannot complete an unfinished productive repair or a partial native task',()=>{
 const storage=new Storage({
  [attemptKey]:JSON.stringify({...submitted,answers:{q1:'A'},results:{q1:'correct'},binding:{...submitted.binding,source_snapshot:{questions:[{id:'q1'},{id:'q2'}]}}}),
  'kianos-translation-attempt-v2:fixture':JSON.stringify({binding:{source_hash:'v1'},stage:'reconstruct',chatReturn:{decision:'PASS'}}),
  'kianos-writing-runtime-v1:fixture':JSON.stringify({binding:{source_hash:'v1'},state:'REPAIR_NEEDED',chatReturn:{decision:'PASS'}})
 });
 for(const task of ['cloze','translation','writing'])assert.equal(S.englishStepIsComplete(storage,{task,object_id:'fixture',source_hash:'v1'}),false);
});

test('saved nested review corruption rejects the whole Return and retains all raw bytes',async()=>{
 const thread={threadId:'t',scope:'local',route:'cloze',itemIds:['q1'],summary:'saved diagnostic',repairCompleted:false,repairEvidence:'',lexicalEvidence:null};
 for(const bad of [{itemIds:'UNREADABLE_PRIVATE_ITEM_IDS'},{itemIds:null},{itemIds:[{}]},{repairCompleted:'false'},{repairCompleted:null}]){
  const storage=new Storage({[attemptKey]:JSON.stringify(submitted),[reviewKey]:JSON.stringify({...payload,threads:[{...thread,...bad}],unknownPrivateRoot:{keep:true}}),[transferKey]:JSON.stringify({version:1,claims:[]})});const before=[...storage.map];
  const h=returnHarness(storage,payload);await h.run();assert.match(h.status.textContent,/无法读取/);assert.equal(storage.writes,0);assert.deepEqual([...storage.map],before);
 }
 const storage=new Storage({[attemptKey]:JSON.stringify(submitted),[reviewKey]:JSON.stringify({...payload,threads:[thread],unknownPrivateRoot:{keep:true}})});
 await returnHarness(storage,payload).run();assert.equal(JSON.parse(storage.getItem(reviewKey)).unknownPrivateRoot.keep,true);assert.equal(storage.writes,2);
});

// Full actual Resume script, fixed clock and DOM/network shims. Native
// instruction, selection, Source continuation and attempt owners remain real.
function resumeHarness(storage,catalog,now){
 class Element {
  constructor(){this.hidden=false;this.attributes={};this.listeners={};}
  getAttribute(k){return this.attributes[k]??null;}setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,fn){this.listeners[k]=fn;}
 }
 class Anchor extends Element {}
 const nodes={'[data-english-resume]':new Element(),'[data-english-resume-title]':new Element(),'[data-english-resume-meta]':new Element(),'[data-english-resume-link]':new Anchor()};
 const root=new Element();root.querySelector=k=>nodes[k];root.attributes['data-base']='/';
 const catalogNode={textContent:JSON.stringify(catalog)},events=[],assignments=[];
 class Clock extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const context={...S,studyDayAt,Date:Clock,localStorage:storage,HTMLElement:Element,HTMLAnchorElement:Anchor,
  document:{querySelector:k=>k==='[data-english-resume-surface]'?root:catalogNode},
  fetch:async()=>({ok:false}),CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}},Event:class {},
  window:{addEventListener:()=>{},dispatchEvent:e=>events.push(e),location:{assign:u=>assignments.push(u)}}};
 let script=component('EnglishResume').split('<script>')[1].split('</script>')[0];
 script=script.slice(script.indexOf('  const root ='),script.lastIndexOf('  });'));
 script=script.replace('    void render();','    globalThis.renderResume=render;');
 vm.runInNewContext(script,context);return {nodes,events,assignments,render:context.renderResume};
}
test('instruction -> actual Resume -> attempt agrees across UTC/Shanghai/LA study-day boundaries',async()=>{
 const priorTZ=process.env.TZ;
 try{
  for(const tz of ['UTC','Asia/Shanghai','America/Los_Angeles'])for(const instant of ['2026-09-30T23:30:00Z','2026-10-01T15:59:59Z','2026-10-01T16:00:00Z']){
   process.env.TZ=tz;const now=Date.parse(instant),day=studyDayAt(now);
   const meta={task:'cloze',object_id:'boundary',source_hash:'v1',snapshot:{questions:[{id:'q1'}]}};
   const instruction={schema:S.ENGLISH_SESSION_SCHEMA,session_id:'boundary-session',study_day:day,generated_at:new Date(now-60000).toISOString(),steps:[{...meta,params:{time_budget_seconds:120,assistance_context:{state:'assisted',basis:'chat_context',note:'targeted teaching',observed_at:instant}}}]};
   const storage=new Storage();S.writeEnglishSessionInstruction(storage,instruction,day,{catalog:[meta],now});
   const h=resumeHarness(storage,[meta],now);await h.render();assert.equal(h.nodes['[data-english-resume]'].hidden,false,`${tz} ${instant}`);assert.equal(h.events.at(-1).detail.href,'/cloze/boundary/');
   const state={answers:{},results:{},submitted:false};L.saveEnglishAttempt(storage,'kianos-cloze-attempt-v1:boundary',state,meta,{now});assert.equal(state.binding.time_budget_seconds,120);assert.equal(state.binding.assistance,'assisted');
   const newer={...meta,source_hash:'v2'};const changed=resumeHarness(storage,[newer],now);await changed.render();assert.equal(changed.nodes['[data-english-resume-link]'].getAttribute('data-source-continuation'),'available');
   await changed.nodes['[data-english-resume-link]'].listeners.click({preventDefault(){}});
   assert.equal(changed.assignments[0],'/cloze/boundary/');assert.equal(JSON.parse(storage.getItem(S.ENGLISH_SESSION_KEY)).steps[0].source_hash,'v2');
   const next={answers:{},results:{},submitted:false};L.saveEnglishAttempt(storage,'kianos-cloze-attempt-v1:boundary',next,newer,{now});assert.equal(next.binding.time_budget_seconds,120);assert.equal(next.binding.assistance,'assisted');
  }
 }finally{if(priorTZ===undefined)delete process.env.TZ;else process.env.TZ=priorTZ;}
});
