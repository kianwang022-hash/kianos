import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.argv[2];
if (!root) throw new Error('Pass a source snapshot directory');
const results=[];
const D='2026-09-21', NOW=Date.parse(D+'T04:00:00Z');
const K={
 plan:'kianos-exam-chat-plan-v1', profile:'kianos-exam-orchestrator-v1',
 ledger:'kianos-study-timer-ledger-v2', state:'kianos-study-timer-state-v2',
 lexical:'kianos-lexical-evidence-ledger-v2', intake:'kianos-lexical-intake-v1',
 routing:'kianos-lexical-card-routing-v1', receipt:'kianos-control-receipt-v1'
};
class Storage {
 constructor(rows={}) {this.map=new Map(Object.entries(rows));this.reads=0;this.keyReads=0;}
 get length(){return this.map.size;} key(i){this.keyReads++;return [...this.map.keys()][i]??null;}
 getItem(k){this.reads++;return this.map.get(k)??null;}
 setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);}
}
const value=(s,k,f)=>{try{return JSON.parse(s.getItem(k)||'null')??f;}catch{return f;}};
const emptyState=()=>({schema:'kianos.study-timer.v2',running:false,manualPaused:false,subject:null,context:null,segmentStartedAt:null,lastSeenAt:null,revision:0,updatedAt:null});
const timer={
 STUDY_TIMER_STATE_KEY:K.state,STUDY_TIMER_LEDGER_KEY:K.ledger,STUDY_TIMER_SCHEMA:'kianos.study-timer.v2',
 STUDY_SUBJECTS:['xizong','politics','english'],STUDY_TIMER_TIMEZONE:'Asia/Shanghai',
 studyDayAt:(n,tz='Asia/Shanghai')=>new Intl.DateTimeFormat('en-CA',{timeZone:tz}).format(n),
 readStudyTimerState:s=>value(s,K.state,emptyState()),
 readStudyTimerLedger:s=>{
   const x=value(s,K.ledger,null);
   return x?.schema==='kianos.study-timer.v2'&&Array.isArray(x.sessions)
    ? {...x,sessions:x.sessions.filter(r=>r&&['xizong','english','politics'].includes(r.subject)&&Number.isFinite(r.startedAt)&&Number.isFinite(r.endedAt)&&r.endedAt>r.startedAt)}
    : {schema:'kianos.study-timer.v2',sessions:[]};
 },
 buildDailyStudyTimePacket:(s,{day=D,timeZone='Asia/Shanghai'}={})=>({
   schema:'kianos.study-time-packet.v1',study_day:day,timezone:timeZone,total_minutes:0,
   subjects:Object.fromEntries(['english','xizong','politics'].map(k=>[k,{minutes:0,details:[]}])),
   timer:{running:false,active_subject:null,review_candidates:[]}
 })
};
const profile={
 EXAM_PROFILE_KEY:K.profile,GATES:[],dayDistance:()=>0,resolveExamPhase:()=>null,
 emptyExamProfile:()=>({schema:'kianos.exam.orchestrator.v1',defaultDailyMinutes:null,capacityByDay:{},maintenanceByDay:{},observations:[],reports:[],gateReports:[],reminders:{}}),
 validateExamProfile:v=>{if(!v||v.schema!=='kianos.exam.orchestrator.v1'||(v.defaultDailyMinutes!=null&&(!Number.isFinite(v.defaultDailyMinutes)||v.defaultDailyMinutes<0)))throw Error('PROFILE_INVALID');return v;}
};
const receipt={
 CONTROL_LOCAL_RECEIPT_KEY:K.receipt,
 validateControlReceipt:v=>{
   if(!v||v.schema!=='kianos.control-receipt.v1'||!v.command_id||!['APPLIED','IDEMPOTENT','ERROR','REJECTED'].includes(v.status)||!Number.isFinite(Date.parse(v.observed_at)))throw Error('RECEIPT_INVALID');
   return {...v};
 }
};
let failSubjectApply=false;
const sameCheckpointRaw=(a,b)=>{
 if(a===b)return true;
 const normalize=v=>Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])])):v;
 try{return JSON.stringify(normalize(JSON.parse(a)))===JSON.stringify(normalize(JSON.parse(b)));}catch{return false;}
};
const subjectCheckpointEntries=v=>Array.isArray(v?.entries)?v.entries.map(({key,raw})=>[key,raw]):Object.entries(v?.entries||{});
const adapters={
 sameCheckpointRaw,subjectCheckpointEntries,
 subjectCheckpointConflicts:(s,v)=>subjectCheckpointEntries(v).some(([k,raw])=>s.getItem(k)!=null&&!sameCheckpointRaw(s.getItem(k),raw)),
 restorePrivateSubjectCheckpoints:(s,sub)=>{
   const restored={};
   for(const [subject,payload] of Object.entries(sub)){
     if(payload?.broken){restored[subject]={status:'blocked',reason:'BAD_SUBJECT',restored:0};continue;}
     let count=0;
     for(const [k,v] of subjectCheckpointEntries(payload))if(s.getItem(k)==null){s.setItem(k,v);count++;}
     restored[subject]={status:count?'restored':'present',restored:count};
   }
   return restored;
 },
 preparePrivateSubjectCheckpointRestore:()=>({changes:[['healthy-native','{}','xizong']],results:{}}),
 applyPrivateSubjectCheckpointRestore:()=>{if(failSubjectApply)throw Error('SUBJECT_APPLY_FAILED');return {};},
 capturePrivateSubjectCheckpoints:()=>({})
};
const stubs={
 'examOrchestrator.mjs':profile,'studyTimer.mjs':timer,'privateControlCommand.mjs':receipt,
 'englishSessionCatalog.mjs':{englishSessionCatalog:()=>[]},
 'lexicalEvidence.mjs':{LEXICAL_LEDGER_STORAGE_KEY:K.lexical,assertLexicalLedgerReadable:v=>{if(v?.schema!=='native')throw Error('LEXICAL_FIXTURE_UNREADABLE');return v;}},
 'lexicalSettings.mjs':{LEXICAL_INTAKE_STORAGE_KEY:K.intake,LEXICAL_ROUTING_STORAGE_KEY:K.routing},
 'englishLearnerEvidence.mjs':{englishCheckpointKeyAllowed:k=>/^kianos-(?:reading-(?:attempt|session|continuous|last-location)|cloze-(?:attempt|last-location)|reading-b-(?:attempt|last-location)|translation-(?:attempt|transfer|last-location)|writing-(?:runtime|evidence|last-location)|english-(?:exam|session|objective|material|attempt|external-reading))/.test(k)},
 'politicsChatReturn.mjs':{politicsCheckpointKeyAllowed:k=>k.startsWith('kianos-politics-')},
 'xizongPrivateCheckpoint.mjs':{isXizongDurableStorageKey:k=>k.startsWith('kianos-xizong-')},
 'privateSubjectCheckpoints.mjs':adapters,
 'privateLearnerCheckpoint.mjs':{
   PRIVATE_CHECKPOINT_SCHEMA:'kianos.private-checkpoint.v1',
   buildPrivateLearnerCheckpoint:o=>({schema:'kianos.private-checkpoint.v1',checkpoint_id:'checkpoint-built-probe',payload:{shared:o.shared,subjects:o.subjects}}),
   readPrivateLearnerCheckpoint:async()=>({status:'missing'}),
   writePrivateLearnerCheckpoint:async()=>({status:'saved'})
 },
 'privateLearnerStore.mjs':{validatePrivateLearnerCheckpoint:v=>v},
 'examStudyTime.mjs':{buildExamStudyTimeOverlay:(s,p)=>({profile:p,effectiveBySubject:{}})},
 'examPlanReadModel.mjs':{buildChatControlledExamReadModel:o=>({day:o.day,subjects:{},capacity:{dayMinutes:o.dayCapacity}})},
 'xizong.mjs':{
   listProjectableXizongSystems:()=>[],loadXizongBlock:()=>{},
   listCurrentXizongSystemIdentities:()=>['native-identity'],
   buildXizongForecastCanonicalScope:rows=>({native:'canonical',count:rows.length})
 },
 'xizongQuestions.mjs':{buildXizongForecastQuestionScope:ids=>({native:'question',ids})},
 'xizongProductionProjection.mjs':{buildXizongProductionBlock:()=>{}},
 'productCatalog.mjs':{politicsProductCatalog:()=>({})},
 'politicsMemoryCandidates.mjs':{buildPoliticsMemoryCandidateCatalogCurrent:()=>({})}
};
const cache=new Map(),context=vm.createContext({console,Date,JSON,Map,Set,Intl,Number,Object,Array,Error,Boolean,String,Math,RegExp,setTimeout,clearTimeout,setInterval,clearInterval});
async function load(file){
 file=path.resolve(file);
 if(cache.has(file))return cache.get(file);
 const mod=new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context,identifier:file});
 cache.set(file,mod);
 await mod.link(async(spec,parent)=>{
   const name=path.basename(spec);
   if(name==='dailyLearningPacketRuntime.mjs') {
     const b=await load(path.join(root,'static-web/src/lib/dailyLearningPacket.mjs'));
     if(b.status!=='evaluated')await b.evaluate();
     const fn=o=>{
       const p=b.namespace.buildDailyLearningPacket(o);
       // Echo only to test shared input forwarding, NOT native Xizong semantics.
       p.native_input_probe={question:o.xizongForecastQuestionScope??null,canonical:o.xizongForecastCanonicalScope??null,lexical:o.storage.getItem(K.lexical)};
       return {packet:p,coverage:{english:'attached',xizong:'unknown',politics:'unknown'},warnings:[]};
     };
     const m=new vm.SyntheticModule(['buildHomeDailyLearningPacket'],function(){this.setExport('buildHomeDailyLearningPacket',fn);},{context});return m;
   }
   if(stubs[name]){
     const e=stubs[name];return new vm.SyntheticModule(Object.keys(e),function(){for(const[k,v]of Object.entries(e))this.setExport(k,v);},{context});
   }
   return load(path.resolve(path.dirname(parent.identifier),spec));
 });
 return mod;
}
async function ns(file){const m=await load(path.join(root,'static-web',file));if(m.status!=='evaluated')await m.evaluate();return m.namespace;}
const basis=await ns('src/lib/examChatPlan.mjs'), daily=await ns('src/lib/dailyLearningPacket.mjs');
const shared=await ns('src/lib/sharedControlCheckpoint.mjs'), outer=await ns('src/lib/privateCheckpointRuntime.mjs');
const privatePacket=await ns('scripts/privateDailyLearningPacket.mjs');
const plan=s=>({schema:'kianos.exam.chat-plan.v1',study_day:D,generated_at:D+'T01:00:00Z',subjects:{english:{target_minutes:30}},next_subject:'english',learner_evidence_basis:basis.buildExamChatPlanBasis(s,D)});
const install=s=>s.setItem(K.plan,JSON.stringify(plan(s)));
const applied={schema:'kianos.control-receipt.v1',command_id:'command-native-001',command_hash:'abc123',status:'APPLIED',observed_at:D+'T02:00:00Z',error:null};
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
for(const key of [K.lexical,K.intake,K.routing])await test('material native key invalidates plan: '+key,()=>{
 const s=new Storage();install(s);s.setItem(key,JSON.stringify({schema:'native',revision:1}));
 assert.equal(basis.readExamChatPlan(s,D).status,'stale');
});
for(const key of ['kianos-lexical-settings-v1','kianos-vocabulary-cursor-v1','kianos-reading-last-location-v1','kianos-global-rail-expanded-v1'])
 await test('control/navigation does not stale: '+key,()=>{const s=new Storage();install(s);s.setItem(key,'{"value":1}');assert.equal(basis.readExamChatPlan(s,D).status,'ready');});
await test('one key enumeration; unrelated raw values not read',()=>{
 const s=new Storage(Object.fromEntries(Array.from({length:2000},(_,i)=>['unrelated-'+i,'{bad'])));
 basis.buildExamChatPlanBasis(s,D);assert.equal(s.keyReads,2000);assert(s.reads<15);
});
for(const[key,raw]of [
 ['kianos-reading-attempt-v1:001','{bad'],[K.lexical,'{bad'],[K.profile,'{bad'],[K.profile,'{"schema":"future"}'],
 [K.ledger,'{bad'],[K.ledger,'{"schema":"future","sessions":[]}'],
 [K.ledger,'{"schema":"kianos.study-timer.v2","sessions":[{}]}'],[K.state,'{bad'],
 [K.state,'{"schema":"kianos.study-timer.v2","running":true,"subject":"english"}']
])await test('corruption cannot earn planning basis: '+key+' '+raw,()=>{const s=new Storage({[key]:raw});assert.throws(()=>basis.buildExamChatPlanBasis(s,D));});
await test('storage read failure returns unavailable instead of throwing',()=>{const s=new Storage();s.getItem=()=>{throw Error('DENIED');};assert.equal(basis.readExamChatPlan(s,D).status,'unavailable');});
await test('old study day cannot execute',()=>{const s=new Storage();install(s);assert.equal(basis.readExamChatPlan(s,'2026-09-22').status,'stale');});
await test('capacity change invalidates',()=>{const s=new Storage();install(s);s.setItem(K.profile,JSON.stringify({...profile.emptyExamProfile(),defaultDailyMinutes:60}));assert.equal(basis.readExamChatPlan(s,D).status,'stale');});
await test('timer settled evidence invalidates',()=>{
 const s=new Storage();install(s);s.setItem(K.ledger,JSON.stringify({schema:'kianos.study-timer.v2',sessions:[{subject:'english',startedAt:1,endedAt:10}]}));
 assert.equal(basis.readExamChatPlan(s,D).status,'stale');
});
await test('corrupt subject does not kill healthy packet export',()=>{
 const s=new Storage({'kianos-reading-attempt-v1:001':'{bad'});
 const p=daily.buildDailyLearningPacket({storage:s,day:D,now:NOW,subjectPackets:{politics:{native:'healthy'}},plan:{day:D,subjects:{},next:'not-trusted'}});
 assert.equal(p.learner_evidence_basis,null);assert.equal(p.schedule,null);assert.equal(p.subjects.politics.evidence.native,'healthy');assert(p.warnings.length);
});
await test('corrupt timer is unknown, never measured zero',()=>{
 const s=new Storage({[K.ledger]:'{bad'});
 const p=daily.buildDailyLearningPacket({storage:s,day:D,now:NOW,subjectPackets:{politics:{native:'healthy'}}});
 assert.equal(p.total_minutes,null);assert.equal(p.subjects.english.time,null);assert.equal(p.learner_evidence_basis,null);assert.equal(p.subjects.politics.evidence.native,'healthy');
});
await test('valid receipt survives whole checkpoint -> packet',async()=>{
 const s=new Storage({[K.receipt]:JSON.stringify(applied)});
 const c=shared.captureSharedControlCheckpoint(s,{studyDay:D,now:NOW});const t=new Storage();
 await outer.restoreSharedControlFromPrivate(t,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:{schema:'kianos.private-checkpoint.v1',checkpoint_id:'receipt-full',study_day:D,payload:{shared:c,subjects:{}}}})});
 const p=daily.buildDailyLearningPacket({storage:t,day:D,now:NOW});
 assert.equal(p.control.command_id,applied.command_id);assert.equal(p.control.status,'APPLIED');assert.equal(p.subjects.english.evidence,null);
});
await test('old checkpoint does not delete current receipt',()=>{
 const c=shared.captureSharedControlCheckpoint(new Storage(),{studyDay:D,now:NOW});delete c.control_receipt_raw;
 const s=new Storage({[K.receipt]:JSON.stringify(applied)});
 shared.restoreSharedControlCheckpoint(s,c,{expectedDay:D});assert.equal(JSON.parse(s.getItem(K.receipt)).command_id,applied.command_id);
});
await test('corrupt receipt preserved raw; healthy shared restore proceeds',()=>{
 const s=new Storage({[K.receipt]:'{bad'});
 const c=shared.captureSharedControlCheckpoint(s,{studyDay:D,now:NOW});
 assert.equal(c.control_receipt_raw,'{bad');
 const t=new Storage();const r=shared.restoreSharedControlCheckpoint(t,c,{expectedDay:D});
 assert.equal(t.getItem(K.receipt),null);assert(t.getItem(K.ledger));assert(r.warnings.length);
});
await test('current local receipt never overwritten by old checkpoint',async()=>{
 const s=new Storage({[K.receipt]:JSON.stringify({...applied,command_id:'newer-local-001'})});
 const c=shared.captureSharedControlCheckpoint(new Storage({[K.receipt]:JSON.stringify(applied)}),{studyDay:D,now:NOW});
 await outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:{schema:'kianos.private-checkpoint.v1',study_day:D,payload:{shared:c,subjects:{}}}})});
 assert.equal(JSON.parse(s.getItem(K.receipt)).command_id,'newer-local-001');assert(s.getItem(K.ledger));
});
await test('receipt rolls back when subsequent subject apply fails',async()=>{
 const c=shared.captureSharedControlCheckpoint(new Storage({[K.receipt]:JSON.stringify(applied)}),{studyDay:D,now:NOW});
 const s=new Storage();failSubjectApply=true;
 try{await assert.rejects(()=>outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:{schema:'kianos.private-checkpoint.v1',study_day:D,payload:{shared:c,subjects:{}}}})}));}
 finally{failSubjectApply=false;}
 assert.equal(s.getItem(K.receipt),null);assert.equal(s.getItem(K.ledger),null);
});
function checkpoint(sub={},s=new Storage()){
 return {schema:'kianos.private-checkpoint.v1',study_day:D,generated_at:new Date(NOW).toISOString(),checkpoint_id:'checkpoint-probe',
 payload:{shared:shared.captureSharedControlCheckpoint(s,{studyDay:D,now:NOW}),subjects:sub}};
}
await test('private projection uses native Xizong question and canonical scope builders',()=>{
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint()).packet;
 assert.equal(p.native_input_probe.question.native,'question');assert.equal(p.native_input_probe.canonical.native,'canonical');
});
await test('private projection forwards lexical bytes through existing adapter',()=>{
 const raw=JSON.stringify({schema:'native',events:[{id:'e1'}]});
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint({lexical:{entries:{[K.lexical]:raw}}})).packet;
 assert.equal(p.native_input_probe.lexical,raw);
});
await test('private projection exposes apply receipt to remote packet consumer',()=>{
 const s=new Storage({[K.receipt]:JSON.stringify(applied)});
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint({},s)).packet;
 assert.equal(p.control.command_id,applied.command_id);
});
await test('failed reconstruction cannot manufacture empty valid planning basis',()=>{
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint({english:{broken:true}})).packet;
 assert.equal(p.learner_evidence_basis,null);assert.equal(p.schedule,null);assert(p.warnings.some(x=>x.startsWith('checkpoint:english:')));
});
await test('private projection with broken native evidence withholds a success receipt',()=>{
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint({english:{broken:true}},new Storage({[K.receipt]:JSON.stringify(applied)}))).packet;
 assert.equal(p.control,null);assert.equal(p.learner_evidence_basis,null);
 assert(p.warnings.some(x=>x.includes('RECEIPT_WITHHELD_NATIVE_CONFLICT')));
});
await test('old-day checkpoint cannot be relabeled today by regeneration',()=>{
 const p=privatePacket.buildDailyLearningPacketFromPrivateCheckpoint(checkpoint(),{now:NOW+86400000}).packet;
 assert.equal(p.study_day,D);
});

// Continuation additions. Receipt recovery now exercises the full native-aware
// coordinator; shared-only recovery intentionally does not admit apply proof.
await test('receipt recovery preserves exact original bytes',async()=>{
 const raw=JSON.stringify(applied,null,2)+'\n';
 const c=shared.captureSharedControlCheckpoint(new Storage({[K.receipt]:raw}),{studyDay:D,now:NOW});
 const s=new Storage();await outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:{schema:'kianos.private-checkpoint.v1',checkpoint_id:'receipt-bytes',study_day:D,payload:{shared:c,subjects:{}}}})});
 assert.equal(c.control_receipt_raw,raw);assert.equal(s.getItem(K.receipt),raw);
});
await test('outer restore carries corrupt receipt warning without blocking shared state',async()=>{
 const c=checkpoint({},new Storage({[K.receipt]:'{bad'}));const s=new Storage();
 const result=await outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:c})});
 assert.equal(result.status,'restored');assert(result.warnings.includes('SHARED_CHECKPOINT_RECEIPT_INVALID'));
 assert.equal(s.getItem(K.receipt),null);assert(s.getItem(K.ledger));
});
await test('shared writes while awaiting restore are preserved while missing history recovers',async()=>{
 const ledger=JSON.stringify({schema:'kianos.study-timer.v2',sessions:[{subject:'english',startedAt:1,endedAt:10}]});
 const c=checkpoint({},new Storage({[K.ledger]:ledger}));const s=new Storage();const live=JSON.stringify({...profile.emptyExamProfile(),defaultDailyMinutes:97});
 await outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>{
  s.setItem(K.profile,live);return {status:'ready',checkpoint:c};
 }});
 assert.equal(s.getItem(K.profile),live);assert.equal(s.getItem(K.ledger),ledger);
});
await test('save captures receipt and shared context after asynchronous read',async()=>{
 const s=new Storage();const raw=JSON.stringify(applied,null,2);let saved=null;
 await outer.saveSharedControlToPrivate(s,{now:NOW,readCheckpoint:async()=>{
  s.setItem(K.receipt,raw);s.setItem(K.profile,JSON.stringify({...profile.emptyExamProfile(),defaultDailyMinutes:97}));
  return {status:'missing'};
 },writeCheckpoint:async value=>{saved=value;}});
 assert.equal(saved.payload.shared.control_receipt_raw,raw);assert.equal(saved.payload.shared.exam_profile.defaultDailyMinutes,97);
});
await test('denied local read is not authorization to restore empty state',async()=>{
 const c=checkpoint();const s=new Storage();let writes=0;s.getItem=()=>{throw Error('DENIED');};s.setItem=()=>{writes++;};
 await assert.rejects(()=>outer.restoreSharedControlFromPrivate(s,{now:NOW,readCheckpoint:async()=>({status:'ready',checkpoint:c})}));
 assert.equal(writes,0);
});
await test('missing storage enumeration cannot mint an empty valid basis',()=>{
 const s=new Storage();s.key=undefined;assert.throws(()=>basis.buildExamChatPlanBasis(s,D));
});
await test('inconsistent storage enumeration cannot mint a valid basis',()=>{
 const s=new Storage({[K.lexical]:'{}'});s.key=()=>null;assert.throws(()=>basis.buildExamChatPlanBasis(s,D));
});
await test('corrupt timer cannot be normalized into a saved zero-time checkpoint',()=>{
 const s=new Storage({[K.ledger]:'{bad'});
 assert.throws(()=>shared.captureSharedControlCheckpoint(s,{studyDay:D,now:NOW}));
});

const summary={boundary:'Complete shared modules; native subject, time/profile and transport dependencies explicitly doubled. Not full native/browser/Mac/remote acceptance.',
 source_root:root,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results};
console.log(JSON.stringify(summary,null,2));
process.exitCode=summary.failed?1:0;
