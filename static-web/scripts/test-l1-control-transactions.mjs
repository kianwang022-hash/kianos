// Shared orchestration regression. Native learning adapters are explicit doubles;
// this does not substitute for the production browser/endpoint acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {commitLearnerStorageChanges} from '../src/lib/browserLearnerWriter.mjs';

const source=fs.readFileSync(new URL('../src/lib/privateControlRuntime.mjs',import.meta.url),'utf8');
const receiptKey='kianos-control-receipt-v1';
const sessionKey='kianos-english-session-instruction-v1';
class Storage{
  constructor(rows={}){this.map=new Map(Object.entries(rows));this.failKey=null;this.reads=0;}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){this.reads++;return this.map.get(key)??null;}
  setItem(key,value){if(key===this.failKey)throw new Error('QuotaExceededError');this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}
const command={schema:'kianos.control-browser-command.v1',command_id:'control-transaction-fixture-1',command_hash:'1'.repeat(64),study_day:'2026-09-21',generated_at:'2026-09-21T10:00:00Z',expires_at:null,operations:[{kind:'english.session',payload:{schema:'kianos.english.session-instruction.v1',session_id:'synthetic-session-1',study_day:'2026-09-21'}}]};
const options={day:'2026-09-21',now:Date.parse('2026-09-21T10:01:00Z')};
const clone=value=>JSON.parse(JSON.stringify(value));
const receiptResponse=body=>({ok:true,json:async()=>({status:'saved',receipt:JSON.parse(body)})});
const shanghaiDay=(timestamp)=>new Intl.DateTimeFormat('en-CA',{
  timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'
}).format(new Date(timestamp));
async function runtime({fetchImpl,writeSession,validatePlan,writePlan,planEffectMatches,validateCommand,studyDayAt}={}){
  let calls=0;
  let planWrites=0;
  const noop=()=>{};
  const sandbox={console,Date,fetch:fetchImpl||(async(url,opts)=>url.endsWith('/receipt')?receiptResponse(opts.body):{ok:true,json:async()=>({collections:[]})}),window:{dispatchEvent:noop,location:{hostname:'127.0.0.1'},setInterval,clearInterval,addEventListener:noop,removeEventListener:noop},document:{querySelector:()=>({textContent:'[{"object_id":"synthetic-object"}]'}),addEventListener:noop,visibilityState:'visible'},CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts?.detail;}}};
  const context=vm.createContext(sandbox);
  const modules={
    './lexicalChallenge.mjs':{stageLexicalChallengePacket:()=>({changes:[]}),lexicalChallengePacketMatches:()=>true},
    './browserLearnerWriter.mjs':{assertLearnerStorageWritable:()=>{},commitLearnerStorageChanges},
    './privateControlCommand.mjs':{CONTROL_LOCAL_RECEIPT_KEY:receiptKey,CONTROL_RECEIPT_SCHEMA:'kianos.control-receipt.v1',validateBrowserControlCommand:validateCommand||((value,expectedDay=null)=>{if(expectedDay&&value?.study_day!==expectedDay)throw new Error('KIANOS_CONTROL_STALE_DAY:'+String(value?.study_day||''));return clone(value);}),validateControlReceipt:value=>{if(value?.schema!=='kianos.control-receipt.v1')throw new Error('INVALID_RECEIPT');return clone(value);}},
    './englishSessionControl.mjs':{ENGLISH_SESSION_KEY:sessionKey,writeEnglishSessionInstruction:(storage,value)=>{calls++;if(writeSession)writeSession(storage,value);else storage.setItem(sessionKey,JSON.stringify(value));},englishSessionInstructionEffectMatches:()=>true},
    './englishExamSession.mjs':{englishExamProductiveScoreMatches:()=>false,inspectEnglishExamSession:noop,applyEnglishExamProductiveScoreReturn:noop,writeEnglishExamSession:noop},
    './examChatPlan.mjs':{EXAM_CHAT_PLAN_KEY:'kianos-exam-chat-plan-v1',validateExamChatPlanAgainstStorage:validatePlan||noop,writeExamChatPlan:(storage,value)=>{planWrites++;if(writePlan)writePlan(storage,value);else storage.setItem('kianos-exam-chat-plan-v1',JSON.stringify(value));return value;},buildExamChatPlanBasis:()=>({}),examChatPlanEffectMatches:planEffectMatches||(()=>true)},
    './studyTimer.mjs':{studyDayAt:studyDayAt||shanghaiDay},
    './xizongSessionInstruction.mjs':{installAndActivateXizongSessionInstruction:noop,xizongSessionInstructionEffectMatches:()=>true},
    './xizongPendingChatReturn.mjs':{stageXizongChatReturn:noop,xizongChatReturnEffectMatches:()=>true},
    './xizongSystemWuReturn.mjs':{stageXizongSystemWuReturn:noop,xizongSystemWuReturnEffectMatches:()=>true},
    './politicsMemoryRuntime.mjs':{stagePoliticsMemoryPlan:noop,politicsMemoryPlanEffectMatches:()=>true}
  };
  const module=new vm.SourceTextModule(source,{context});
  await module.link(spec=>{const exports=modules[spec];assert.ok(exports,`Unexpected dependency: ${spec}`);return new vm.SyntheticModule(Object.keys(exports),function(){for(const[key,value]of Object.entries(exports))this.setExport(key,value);},{context});});
  await module.evaluate();
  return{apply:module.namespace.applyPrivateControlCommand,init:module.namespace.initPrivateControlRuntime,calls:()=>calls,planWrites:()=>planWrites};
}
let count=0;
{
  const storage=new Storage();
  const day='2026-09-25';
  const dayMismatchNow=Date.parse('2026-09-24T16:30:00Z');
  const rt=await runtime();
  const result=await rt.apply(storage,{
    ...command,
    command_id:'control-canonical-day-fixture-1',
    command_hash:'a'.repeat(64),
    study_day:day,
    operations:[{kind:'english.session',payload:{schema:'kianos.english.session-instruction.v1',session_id:'canonical-day-session-1',study_day:day}}]
  },{now:dayMismatchNow});
  assert.equal(result.status,'applied');
  count++;
}
{
  const storage=new Storage({'kianos-politics-evidence-v1':'{"attempts":1}'});
  const rt=await runtime({fetchImpl:async(url,opts)=>{
    if(url.endsWith('/receipt'))return receiptResponse(opts.body);
    storage.setItem('kianos-politics-evidence-v1','{"attempts":2}');
    storage.setItem('kianos-xizong-memory-v1','{"recall":"new"}');
    return{ok:true,json:async()=>({collections:[]})};
  }});
  const result=await rt.apply(storage,command,options);
  assert.equal(result.status,'applied');
  assert.equal(result.receipt_saved,true);
  assert.equal(storage.getItem('kianos-politics-evidence-v1'),'{"attempts":2}');
  assert.equal(storage.getItem('kianos-xizong-memory-v1'),'{"recall":"new"}');
  assert.deepEqual([...result.changed_keys].sort(),[receiptKey,sessionKey].sort());count++;
}
for(const failure of ['network','http500','wrong-echo']){
  const storage=new Storage();let available=false,puts=0;
  const rt=await runtime({fetchImpl:async(url,opts)=>{
    if(!url.endsWith('/receipt'))return{ok:true,json:async()=>({collections:[]})};
    puts++;
    if(available)return receiptResponse(opts.body);
    if(failure==='network')throw new Error('offline');
    if(failure==='http500')return{ok:false,status:500};
    const response=JSON.parse(opts.body);response.command_id='another-command';
    return{ok:true,json:async()=>({status:'saved',receipt:response})};
  }});
  const first=await rt.apply(storage,command,options);
  assert.equal(first.status,'applied');assert.equal(first.receipt_saved,false);
  available=true;
  const next=await rt.apply(storage,command,options);
  assert.equal(next.status,'idempotent');assert.equal(next.receipt_saved,true);
  assert.equal(puts,2);assert.equal(rt.calls(),1);count++;
}
{
  const storage=new Storage({[sessionKey]:'{"old":"preserved"}'});storage.failKey=receiptKey;
  let puts=0;
  const rt=await runtime({fetchImpl:async(url,opts)=>{if(url.endsWith('/receipt')){puts++;return receiptResponse(opts.body);}return{ok:true,json:async()=>({collections:[]})};}});
  await assert.rejects(rt.apply(storage,command,options),/QuotaExceededError/);
  assert.equal(storage.getItem(sessionKey),'{"old":"preserved"}');
  assert.equal(storage.getItem(receiptKey),null);assert.equal(puts,0);count++;
}
{
  const storage=new Storage();
  const rt=await runtime({writeSession:shadow=>{shadow.setItem(sessionKey,'{"new":true}');throw new Error('NATIVE_REJECTED');}});
  await assert.rejects(rt.apply(storage,command,options),/NATIVE_REJECTED/);
  assert.equal(storage.length,0);count++;
}
{
  const storage=new Storage();const rt=await runtime();
  await rt.apply(storage,command,options);
  await assert.rejects(rt.apply(storage,{...command,command_hash:'2'.repeat(64)},options),/COMMAND_ID_CONFLICT/);
  assert.equal(rt.calls(),1);count++;
}
{
  const storage=new Storage({[sessionKey]:'{"prior":true}'});
  const rt=await runtime({writeSession:shadow=>{shadow.setItem(sessionKey,'{"staged":true}');storage.setItem(sessionKey,'{"concurrent":true}');}});
  await assert.rejects(rt.apply(storage,command,options),/STALE_STORAGE/);
  assert.equal(storage.getItem(sessionKey),'{"concurrent":true}');assert.equal(storage.getItem(receiptKey),null);count++;
}
{
  const storage=new Storage({'kianos-politics-evidence-v1':'{"attempts":1}'});
  const rt=await runtime({fetchImpl:async(url,opts)=>{if(url.endsWith('/receipt'))return receiptResponse(opts.body);storage.setItem('kianos-politics-evidence-v1','{"attempts":2}');return{ok:true,json:async()=>({collections:[]})};},validatePlan:shadow=>{assert.equal(shadow.getItem('kianos-politics-evidence-v1'),'{"attempts":2}');throw new Error('CHAT_PLAN_EVIDENCE_BASIS_STALE');}});
  const value={...clone(command),operations:[...clone(command.operations),{kind:'exam.chat_plan',payload:{schema:'kianos.exam.chat-plan.v1'}}]};
  await assert.rejects(rt.apply(storage,value,options),/EVIDENCE_BASIS_STALE/);
  assert.equal(storage.getItem(sessionKey),null);count++;
}
{
  const planCommand={
    schema:'kianos.control-browser-command.v1',
    command_id:'control-plan-effect-fixture-1',
    command_hash:'3'.repeat(64),
    study_day:'2026-09-21',
    generated_at:'2026-09-21T10:00:00Z',
    expires_at:null,
    operations:[{kind:'exam.chat_plan',payload:{schema:'kianos.exam.chat-plan.v1',study_day:'2026-09-21',generated_at:'2026-09-21T09:59:00Z',subjects:{}}}]
  };
  const receipt={
    schema:'kianos.control-receipt.v1',
    command_id:planCommand.command_id,
    command_hash:planCommand.command_hash,
    command_generated_at:planCommand.generated_at,
    status:'APPLIED',
    observed_at:'2026-09-21T10:00:30Z',
    error:null
  };
  const storage=new Storage({
    [receiptKey]:JSON.stringify(receipt),
    'kianos-exam-chat-plan-v1':JSON.stringify({
      schema:'kianos.exam.chat-plan.v1',
      study_day:'2026-09-21',
      generated_at:'2099-01-01T00:00:00Z',
      subjects:{}
    })
  });
  const rt=await runtime({
    planEffectMatches:()=>false,
    writePlan:(shadow,value)=>shadow.setItem('kianos-exam-chat-plan-v1',JSON.stringify(value))
  });
  const result=await rt.apply(storage,planCommand,options);
  assert.equal(result.status,'applied');
  assert.equal(rt.planWrites(),1);
  const restoredPlan=JSON.parse(storage.getItem('kianos-exam-chat-plan-v1'));
  assert.equal(restoredPlan.generated_at,'2026-09-21T09:59:00Z');
  count++;
}
{
  // Bounded transaction must not eagerly read unrelated raw localStorage values.
  const storage=new Storage(Object.fromEntries(Array.from({length:2000},(_,i)=>['unrelated-'+i,'"kept"'])));
  const rt=await runtime();await rt.apply(storage,command,options);
  assert.ok(storage.reads<20,`Unrelated raw reads: ${storage.reads}`);count++;
}
{
  const day=shanghaiDay(Date.now());
  const pollCommand={
    schema:'kianos.control-browser-command.v1',
    command_id:'control-stale-rejected-recovery-1',
    command_hash:'b'.repeat(64),
    study_day:day,
    generated_at:new Date(Date.now()-120000).toISOString(),
    expires_at:null,
    operations:[{kind:'english.session',payload:{schema:'kianos.english.session-instruction.v1',session_id:'stale-rejected-recovery-session-1',study_day:day}}]
  };
  let receiptPuts=0;
  const rt=await runtime({fetchImpl:async(url,opts)=>{
    if(url.includes('/current?'))return{
      ok:true,
      json:async()=>({
        status:'ready',
        command:clone(pollCommand),
        receipt:{schema:'kianos.control-receipt.v1',command_id:pollCommand.command_id,command_hash:pollCommand.command_hash,status:'REJECTED',observed_at:new Date().toISOString(),error:'KIANOS_CONTROL_STALE_DAY:'+day}
      })
    };
    if(url.endsWith('/receipt')){receiptPuts++;return receiptResponse(opts.body);}
    return{ok:true,json:async()=>({collections:[]})};
  }});
  const controller=rt.init(new Storage(),{pollMs:3000});
  await new Promise(resolve=>setTimeout(resolve,20));
  assert.ok(receiptPuts>=1,'stale rejected server receipt must not permanently suppress local apply');
  const afterFirst=receiptPuts;
  await controller.poll();
  assert.equal(receiptPuts,afterFirst,'rejected retry policy must remain locally bounded');
  controller.stop();
  count++;
}
console.log(JSON.stringify({status:'PASS',checks:count,proof:'shared orchestration with native adapter and network doubles; production browser proof remains separate'}));

// D1 exercises the actual Xizong checkpoint adapter. Unused subject exports
// are doubled, so this is not English/Lexical/Politics recovery acceptance.
{
  const sharedSource=fs.readFileSync(new URL('../src/lib/privateSubjectCheckpoints.mjs',import.meta.url),'utf8');
  const xizongSource=fs.readFileSync(new URL('../src/lib/xizongPrivateCheckpoint.mjs',import.meta.url),'utf8');
  const context=vm.createContext({console});
  const native=new vm.SourceTextModule(xizongSource,{context});
  await native.link(()=>{throw new Error('Unexpected Xizong dependency');});
  await native.evaluate();
  const emptyPayload=()=>({entries:{}});
  const doubles={
    './lexicalEvidence.mjs':{LEXICAL_LEDGER_STORAGE_KEY:'kianos-lexical-evidence-ledger-v2',assertLexicalLedgerReadable:value=>value},
    './englishLearnerEvidence.mjs':{englishCheckpointKeyAllowed:()=>false,exportEnglishCheckpoint:emptyPayload,inspectEnglishCheckpoint:()=>({status:'absent'}),restoreEnglishCheckpoint:()=>{}},
    './politicsChatReturn.mjs':{exportPoliticsCheckpoint:emptyPayload,politicsCheckpointKeyAllowed:()=>false,validatePoliticsPrivatePayload:()=>[]}
  };
  const shared=new vm.SourceTextModule(sharedSource,{context});
  await shared.link(spec=>{
    if(spec==='./xizongPrivateCheckpoint.mjs')return native;
    const values=doubles[spec];assert.ok(values);
    return new vm.SyntheticModule(Object.keys(values),function(){for(const[key,value]of Object.entries(values))this.setExport(key,value);},{context});
  });
  await shared.evaluate();
  const full=new Storage({
    'kianos-xizong-last-location-v1':'{"block":"old"}',
    'kianos-xizong-memory-v1':'{"retained":true}',
    'kianos-xizong-astro-v2:xizong:fixture':'{"recall":"preserved"}'
  });
  const backup=shared.namespace.capturePrivateSubjectCheckpoints(full);
  const partial=new Storage({'kianos-xizong-last-location-v1':'{"block":"newer"}'});
  shared.namespace.restorePrivateSubjectCheckpoints(partial,backup);
  const saved=shared.namespace.capturePrivateSubjectCheckpoints(partial,backup);
  assert.equal(saved.xizong.entries.length,3);
  assert.equal(partial.getItem('kianos-xizong-last-location-v1'),'{"block":"newer"}');
  const again=shared.namespace.restorePrivateSubjectCheckpoints(partial,backup);
  assert.equal(again.xizong.restored,0);
  console.log(JSON.stringify({status:'PASS',checks:1,proof:'D1 complete 3 -> partial 1 -> fill missing -> save 3; newer local preserved; repeat restore no-op'}));
}

// Public basis output must retain the old fingerprint identities after changing
// the arithmetic implementation. Evidence selection is doubled; this does not
// exercise subject learning decisions.
{
  const planSource=fs.readFileSync(new URL('../src/lib/examChatPlan.mjs',import.meta.url),'utf8');
  const key='kianos-reading-attempt-v1:fixture';
  const context=vm.createContext({console});
  const dependencies={
    './examOrchestrator.mjs':{EXAM_PROFILE_KEY:'fixture-profile',validateExamProfile:value=>value},
    './studyTimer.mjs':{readStudyTimerLedger:()=>({sessions:[]}),STUDY_TIMER_LEDGER_KEY:'fixture-timer-ledger',STUDY_TIMER_STATE_KEY:'fixture-timer-state',STUDY_TIMER_SCHEMA:'kianos.study-timer.v2'},
    './lexicalEvidence.mjs':{LEXICAL_LEDGER_STORAGE_KEY:'fixture-lexical-ledger',assertLexicalLedgerReadable:value=>value},
    './lexicalSettings.mjs':{LEXICAL_INTAKE_STORAGE_KEY:'fixture-lexical-intake',LEXICAL_ROUTING_STORAGE_KEY:'fixture-lexical-routing'},
    './englishLearnerEvidence.mjs':{englishCheckpointKeyAllowed:k=>k===key},
    './politicsChatReturn.mjs':{politicsCheckpointKeyAllowed:()=>false},
    './xizongPrivateCheckpoint.mjs':{isXizongDurableStorageKey:()=>false}
  };
  const module=new vm.SourceTextModule(planSource,{context});
  await module.link(spec=>{const out=dependencies[spec];assert.ok(out);return new vm.SyntheticModule(Object.keys(out),function(){for(const[k,v]of Object.entries(out))this.setExport(k,v);},{context});});
  await module.evaluate();
  const reference=value=>{
    const text=String(value);let hash=0xcbf29ce484222325n;
    for(let i=0;i<text.length;i++){hash^=BigInt(text.charCodeAt(i));hash=BigInt.asUintN(64,hash*0x100000001b3n);}
    return `fnv1a64:${hash.toString(16).padStart(16,'0')}:${text.length}`;
  };
  const fixtures=['','汉字\u0000\u0001',String.fromCharCode(0xffff,0xd800,0xdc00),'x'.repeat(1024*1024)];
  let seed=123456789;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  for(let i=0;i<1000;i++){let word='';for(let j=0,n=random()%256;j<n;j++)word+=String.fromCharCode(random()%65536);fixtures.push(word);}
  const shared=reference(JSON.stringify({exam_profile:null,study_timer_ledger:{sessions:[]}}));
  for(const value of fixtures){
    const raw=JSON.stringify({synthetic:value});const storage=new Storage({[key]:raw});
    const actual=module.namespace.buildExamChatPlanBasis(storage,options.day);
    const subjects={xizong:reference(''),english:reference(`${key}\u0000${raw}`),politics:reference('')};
    assert.deepEqual({...actual.subjects},subjects);
    assert.equal(actual.shared_context_fingerprint,shared);
    assert.equal(actual.evidence_fingerprint,reference(JSON.stringify({study_day:options.day,shared_context_fingerprint:shared,subjects})));
  }
  console.log(JSON.stringify({status:'PASS',fingerprint_vectors:fixtures.length,proof:'public basis fingerprints unchanged, including UTF-16 and 1 MiB payload'}));
}
