import { stageLexicalChallengePacket, lexicalChallengePacketMatches } from './lexicalChallenge.mjs';
import { assertLearnerStorageWritable, commitLearnerStorageChanges } from './browserLearnerWriter.mjs';
import {
  CONTROL_LOCAL_RECEIPT_KEY,
  CONTROL_RECEIPT_SCHEMA,
  validateControlReceipt,
  validateBrowserControlCommand
} from './privateControlCommand.mjs';
import {
  ENGLISH_SESSION_KEY,
  writeEnglishSessionInstruction
} from './englishSessionControl.mjs';
import {
  inspectEnglishExamSession,
  englishExamProductiveScoreMatches,
  applyEnglishExamProductiveScoreReturn,
  writeEnglishExamSession
} from './englishExamSession.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  buildExamChatPlanBasis,
  validateExamChatPlanAgainstStorage,
  writeExamChatPlan
} from './examChatPlan.mjs';
import { installAndActivateXizongSessionInstruction } from './xizongSessionInstruction.mjs';
import { stageXizongChatReturn } from './xizongPendingChatReturn.mjs';
import { stageXizongSystemWuReturn } from './xizongSystemWuReturn.mjs';
import { stagePoliticsMemoryPlan } from './politicsMemoryRuntime.mjs';

const ENDPOINT='/__kianos-private/control';

// Stage only writes made by this command. Reading a catalog must never turn
// unrelated learner keys into transaction writes or copy the whole ledger.
class ShadowStorage{
  constructor(storage){
    this.storage=storage;
    this.map=new Map();
    this.before=new Map();
    this.keyCache=null;
  }
  keys(){
    if(this.keyCache)return this.keyCache;
    const keys=new Set();
    for(let i=0;i<Number(this.storage.length||0);i+=1){
      const key=this.storage.key(i);
      if(key!=null)keys.add(key);
    }
    for(const [key,value] of this.map){
      if(value==null)keys.delete(key);
      else keys.add(key);
    }
    this.keyCache=[...keys];
    return this.keyCache;
  }
  get length(){return this.keys().length;}
  key(i){return this.keys()[i]??null;}
  getItem(key){
    if(this.map.has(key))return this.map.get(key);
    if(!this.before.has(key))this.before.set(key,this.storage.getItem(key));
    return this.before.get(key);
  }
  setItem(key,value){this.getItem(key);this.map.set(key,String(value));this.keyCache=null;}
  removeItem(key){this.getItem(key);this.map.set(key,null);this.keyCache=null;}
  changedKeys(){
    return [...this.map.keys()].filter(key=>this.before.get(key)!==this.map.get(key));
  }
  assertCurrent(){
    for(const [key,raw] of this.before){
      if(this.storage.getItem(key)!==raw)throw new Error('KIANOS_CONTROL_STALE_STORAGE');
    }
  }
}

const localDay=()=>new Date().toLocaleDateString('en-CA');
const readJson=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};

async function loadEnglishCatalog(){
  let staticRows=[];
  try{
    const node=document.querySelector('[data-english-resume-catalog]');
    const parsed=JSON.parse(node?.textContent||'[]');
    staticRows=Array.isArray(parsed)?parsed:[];
  }catch{}
  if(!staticRows.length){
    try{
      const response=await fetch(ENDPOINT+'/english-session-catalog',{cache:'no-store'});
      if(response.ok){
        const data=await response.json();
        staticRows=Array.isArray(data?.rows)?data.rows:[];
      }
    }catch{}
  }
  let externalRows=[];
  try{
    const response=await fetch('/__kianos-private/external-reading/catalog',{cache:'no-store'});
    if(response.ok){
      const data=await response.json();
      externalRows=(data.collections||[]).flatMap(group=>group.passages||[]).map(row=>({
        task:'external_reading',
        object_id:row.object_id,
        source_hash:row.content_hash,
        label:row.title||row.object_id,
        study_day:row.study_day||null,
        origin:row.origin||null
      }));
    }
  }catch{}
  // English Resume may already project external rows into the DOM catalog.
  // Replace that cached projection with this live owner read; duplicate or
  // conflicting source identities must still fail native validation.
  const rows=[...staticRows.filter(row=>row.task!=='external_reading'),...externalRows];
  if(!rows.length)throw new Error('KIANOS_CONTROL_ENGLISH_CATALOG_UNAVAILABLE');
  return rows;
}

function commitShadow(real,shadow,keys){
  shadow.assertCurrent();
  commitLearnerStorageChanges(real, keys.map(key=>[key,shadow.getItem(key)]), shadow.before);
}

async function saveReceipt(receipt){
  try{
    const response=await fetch(ENDPOINT+'/receipt',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(receipt),
      cache:'no-store'
    });
    if(!response.ok)return false;
    const body=await response.json();
    const saved=validateControlReceipt(body?.receipt);
    return body?.status==='saved'
      && ['schema','command_id','command_hash','command_generated_at','status','observed_at','error']
        .every(key=>saved[key]===receipt[key]);
  }catch{return false;}
}

function appliedReceipt(storage,command){
  const raw=storage.getItem(CONTROL_LOCAL_RECEIPT_KEY);
  if(raw==null)return null;
  let receipt;
  try{receipt=validateControlReceipt(JSON.parse(raw));}
  catch{throw new Error('KIANOS_CONTROL_LOCAL_RECEIPT_INVALID');}
  if(receipt.command_id!==command.command_id){
    if(Date.parse(command.generated_at)<=Date.parse(receipt.command_generated_at || receipt.observed_at)){
      throw new Error('KIANOS_CONTROL_OLDER_COMMAND');
    }
    return null;
  }
  if(receipt.command_hash!==command.command_hash){
    throw new Error('KIANOS_CONTROL_COMMAND_ID_CONFLICT');
  }
  return ['APPLIED','IDEMPOTENT'].includes(receipt.status)?receipt:null;
}

function receiptNativeEffectPresent(storage,command){
  const lexical=command.operations.find(op=>op.kind==='lexical.challenge');
  if(lexical && !lexicalChallengePacketMatches(storage,lexical.payload))return false;
  const score=command.operations.find(op=>op.kind==='english.exam_score_return');
  if(!score)return true;
  const native=inspectEnglishExamSession(storage);
  return native.status==='ready' && englishExamProductiveScoreMatches(native.session,score.payload);
}

export async function applyPrivateControlCommand(storage,input,{day=localDay(),now=Date.now()}={}){
  const command=validateBrowserControlCommand(input,day);
  if(Date.parse(command.generated_at)>Number(now)+60_000)throw new Error('KIANOS_CONTROL_FUTURE_COMMAND');

  const localReceipt=appliedReceipt(storage,command);
  if(localReceipt && receiptNativeEffectPresent(storage,command)){
    const receiptSaved=await saveReceipt(localReceipt);
    return{status:'idempotent',command,receipt_saved:receiptSaved};
  }

  const lexicalOp=command.operations.find(op=>op.kind==='lexical.challenge')||null;
  const englishOp=command.operations.find(op=>op.kind==='english.session')||null;
  const englishScoreOp=command.operations.find(op=>op.kind==='english.exam_score_return')||null;
  const xizongSessionOp=command.operations.find(op=>op.kind==='xizong.session')||null;
  const xizongReturnOp=command.operations.find(op=>op.kind==='xizong.chat_return')||null;
  const xizongSystemReturnOp=command.operations.find(op=>op.kind==='xizong.system_wu_return')||null;
  const politicsMemoryOp=command.operations.find(op=>op.kind==='politics.memory_plan')||null;
  const planOp=command.operations.find(op=>op.kind==='exam.chat_plan')||null;

  // Finish asynchronous input reads before staging. Re-check expiry and a
  // competing completion afterwards, then perform the transaction synchronously.
  const englishCatalog=englishOp?await loadEnglishCatalog():null;
  validateBrowserControlCommand(command,day);
  const completedWhileLoading=appliedReceipt(storage,command);
  if(completedWhileLoading && receiptNativeEffectPresent(storage,command)){
    const receiptSaved=await saveReceipt(completedWhileLoading);
    return{status:'idempotent',command,receipt_saved:receiptSaved};
  }
  const shadow=new ShadowStorage(storage);
  assertLearnerStorageWritable(storage);
  if(planOp)validateExamChatPlanAgainstStorage(shadow,planOp.payload,day);

  if(lexicalOp){
    const staged=stageLexicalChallengePacket(shadow,lexicalOp.payload,{day});
    for(const [key,raw] of staged.changes)shadow.setItem(key,raw);
  }
  if(englishOp){
    writeEnglishSessionInstruction(shadow,englishOp.payload,day,{catalog:englishCatalog,now});
  }
  if(xizongSessionOp){
    const holdoutYears=readJson(shadow,'kianos:xizong:full-paper-holdout-years:v1')||[];
    installAndActivateXizongSessionInstruction(shadow,xizongSessionOp.payload,{
      expectedDay:day,now,holdoutYears:Array.isArray(holdoutYears)?holdoutYears:[]
    });
  }
  if(xizongReturnOp){
    stageXizongChatReturn(shadow,xizongReturnOp.payload,{now,replace:true,studyDay:day});
  }
  if(xizongSystemReturnOp){
    stageXizongSystemWuReturn(shadow,xizongSystemReturnOp.payload,{now,replace:true,studyDay:day});
  }
  if(politicsMemoryOp){
    stagePoliticsMemoryPlan(shadow,politicsMemoryOp.payload,{expectedDay:day,now});
  }
  if(englishScoreOp){
    const exam=inspectEnglishExamSession(shadow);
    if(exam.status!=='ready')throw new Error('KIANOS_CONTROL_ENGLISH_EXAM_STATE_REQUIRED:'+exam.status);
    // The native owner alone admits a score for the exact sealed first outputs.
    // Keep its write in this command's transaction; never persist a second score ledger.
    if(shadow.getItem(CONTROL_LOCAL_RECEIPT_KEY)!=null
      || !englishExamProductiveScoreMatches(exam.session,englishScoreOp.payload)) {
      writeEnglishExamSession(shadow,applyEnglishExamProductiveScoreReturn(exam.session,englishScoreOp.payload,now));
    }
  }
  if(planOp){
    const prior=readJson(shadow,EXAM_CHAT_PLAN_KEY);
    if(prior?.generated_at
      && Date.parse(prior.generated_at)>Date.parse(planOp.payload?.generated_at||0)){
      throw new Error('KIANOS_CONTROL_OLDER_EXAM_PLAN');
    }
    // Validate the original basis before staging; then bind the installed plan
    // to this command's own native writes. Later evidence still makes it stale.
    writeExamChatPlan(shadow,{
      ...planOp.payload,
      learner_evidence_basis:buildExamChatPlanBasis(shadow,day)
    },day);
  }

  const receipt={
    schema:CONTROL_RECEIPT_SCHEMA,
    command_id:command.command_id,
    command_hash:command.command_hash,
    command_generated_at:command.generated_at,
    status:'APPLIED',
    observed_at:new Date(now).toISOString(),
    error:null
  };
  // The durable local apply receipt is part of the same write-set as the
  // native operations. A failed receipt write rolls back those operations.
  shadow.setItem(CONTROL_LOCAL_RECEIPT_KEY,JSON.stringify(receipt));
  const keys=shadow.changedKeys();
  commitShadow(storage,shadow,keys);
  const receiptSaved=await saveReceipt(receipt);

  if(lexicalOp)window.dispatchEvent(new CustomEvent('kianos:lexical-challenge-updated'));
  if(englishOp||englishScoreOp)window.dispatchEvent(new CustomEvent('kianos:english-session-updated',{
    detail:{schema:(englishOp||englishScoreOp).payload?.schema||null,session_id:(englishOp||englishScoreOp).payload?.session_id||null}
  }));
  if(englishScoreOp)window.dispatchEvent(new CustomEvent('kianos:english-exam-updated',{
    detail:{paper_id:englishScoreOp.payload.paper_id,session_id:englishScoreOp.payload.session_id}
  }));
  for(const op of [xizongSessionOp,xizongReturnOp,xizongSystemReturnOp,englishScoreOp].filter(Boolean)){
    window.dispatchEvent(new CustomEvent('kianos:private-control-consumed',{
      detail:{fresh:true,status:'APPLIED',target:op.kind,command_id:command.command_id}
    }));
  }
  if(politicsMemoryOp)window.dispatchEvent(new CustomEvent('kianos:politics-memory-plan-updated',{
    detail:{plan_id:politicsMemoryOp.payload?.plan_id||null}
  }));
  if(planOp)window.dispatchEvent(new CustomEvent('kianos:control-command-applied',{
    detail:{command_id:command.command_id,kind:'exam.chat_plan',operations:command.operations.map(op=>op.kind)}
  }));
  return{status:'applied',command,changed_keys:keys,receipt_saved:receiptSaved};
}

export function initPrivateControlRuntime(storage=window.localStorage,{
  pollMs=3000
}={}){
  if(!['127.0.0.1','localhost'].includes(window.location.hostname))return null;
  let busy=false;
  let stopped=false;

  const poll=async()=>{
    if(busy||stopped)return;
    busy=true;
    try{
      const response=await fetch(ENDPOINT+'/current?t='+Date.now(),{cache:'no-store'});
      if(response.status===404)return;
      if(!response.ok)throw new Error('KIANOS_CONTROL_FETCH_'+response.status);
      const data=await response.json();
      if(data?.status!=='ready'||!data.command)return;
      const localReceipt=readJson(storage,CONTROL_LOCAL_RECEIPT_KEY);
      const sameServerReceipt=data.receipt?.command_id===data.command.command_id
        && (!data.command.command_hash||data.receipt.command_hash===data.command.command_hash);
      if(sameServerReceipt&&String(data.receipt.status||'').toUpperCase()==='REJECTED')return;
      if(sameServerReceipt&&String(data.receipt.status||'').toUpperCase()==='APPLIED'
        && localReceipt?.command_id===data.command.command_id
        && (!data.command.command_hash||localReceipt.command_hash===data.command.command_hash)
        && ['APPLIED','IDEMPOTENT'].includes(String(localReceipt.status||'').toUpperCase())
        && receiptNativeEffectPresent(storage,data.command))return;
      try{
        await applyPrivateControlCommand(storage,data.command);
      }catch(error){
        const commandId=data.command?.command_id||'unknown';
        const receipt={
          schema:CONTROL_RECEIPT_SCHEMA,
          command_id:commandId,
          command_hash:data.command?.command_hash||null,
          status:/INVALID|STALE|EXPIRED|MISMATCH|NOT_CURRENT|OLDER/.test(String(error?.message||''))
            ?'REJECTED':'ERROR',
          observed_at:new Date().toISOString(),
          error:error instanceof Error?error.message:String(error)
        };
        // Failure is transport status, not a replacement for durable apply proof.
        await saveReceipt(receipt);
      }
    }catch{}
    finally{busy=false;}
  };

  void poll();
  const timer=window.setInterval(()=>void poll(),Math.max(1500,Number(pollMs)||3000));
  const onFocus=()=>void poll();
  window.addEventListener('focus',onFocus);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void poll();});
  return{
    poll,
    stop(){stopped=true;window.clearInterval(timer);window.removeEventListener('focus',onFocus);}
  };
}
