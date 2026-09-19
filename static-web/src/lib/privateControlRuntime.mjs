import {
  CONTROL_LOCAL_RECEIPT_KEY,
  CONTROL_RECEIPT_SCHEMA,
  validateBrowserControlCommand
} from './privateControlCommand.mjs';
import {
  ENGLISH_SESSION_KEY,
  writeEnglishSessionInstruction
} from './englishSessionControl.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  writeExamChatPlan
} from './examChatPlan.mjs';
import { installAndActivateXizongSessionInstruction } from './xizongSessionInstruction.mjs';
import { stageXizongChatReturn } from './xizongPendingChatReturn.mjs';
import { stageXizongSystemWuReturn } from './xizongSystemWuReturn.mjs';
import { stagePoliticsMemoryPlan } from './politicsMemoryRuntime.mjs';

const ENDPOINT='/__kianos-private/control';

class ShadowStorage{
  constructor(storage){
    this.map=new Map();
    for(let i=0;i<Number(storage?.length||0);i+=1){
      const key=storage.key(i);
      if(key!=null)this.map.set(key,storage.getItem(key));
    }
  }
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(key,String(value));}
  removeItem(key){this.map.delete(key);}
}

const localDay=()=>new Date().toLocaleDateString('en-CA');
const readJson=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null');}catch{return null;}};

async function loadEnglishCatalog(){
  const response=await fetch('/__kianos-private/external-reading/catalog',{cache:'no-store'});
  if(!response.ok)throw new Error('KIANOS_CONTROL_ENGLISH_CATALOG_UNAVAILABLE:'+response.status);
  const data=await response.json();
  return(data.collections||[]).flatMap(group=>group.passages||[]).map(row=>({
    task:'external_reading',
    object_id:row.object_id,
    source_hash:row.content_hash,
    label:row.title||row.object_id,
    study_day:row.study_day||null,
    origin:row.origin||null
  }));
}

function changesBetween(real,shadow){
  const keys=new Set();
  for(let i=0;i<Number(real.length||0);i+=1){const k=real.key(i);if(k!=null)keys.add(k);}
  for(let i=0;i<Number(shadow.length||0);i+=1){const k=shadow.key(i);if(k!=null)keys.add(k);}
  return[...keys].filter(key=>real.getItem(key)!==shadow.getItem(key));
}

function commitShadow(real,shadow,keys){
  const before=new Map(keys.map(key=>[key,real.getItem(key)]));
  try{
    for(const key of keys){
      const value=shadow.getItem(key);
      if(value==null)real.removeItem(key);
      else real.setItem(key,value);
    }
  }catch(error){
    for(const [key,value] of before){
      try{value==null?real.removeItem(key):real.setItem(key,value);}catch{}
    }
    throw error;
  }
}

async function saveReceipt(receipt){
  try{
    await fetch(ENDPOINT+'/receipt',{
      method:'PUT',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(receipt),
      cache:'no-store'
    });
  }catch{}
}

export async function applyPrivateControlCommand(storage,input,{day=localDay(),now=Date.now()}={}){
  const command=validateBrowserControlCommand(input,day);
  if(Date.parse(command.generated_at)>Number(now)+60_000)throw new Error('KIANOS_CONTROL_FUTURE_COMMAND');

  const localReceipt=readJson(storage,CONTROL_LOCAL_RECEIPT_KEY);
  if(localReceipt?.command_id===command.command_id
    && (!command.command_hash||localReceipt.command_hash===command.command_hash)
    && ['APPLIED','IDEMPOTENT'].includes(localReceipt.status)){
    return{status:'idempotent',command};
  }

  const shadow=new ShadowStorage(storage);
  const englishOp=command.operations.find(op=>op.kind==='english.session')||null;
  const xizongSessionOp=command.operations.find(op=>op.kind==='xizong.session')||null;
  const xizongReturnOp=command.operations.find(op=>op.kind==='xizong.chat_return')||null;
  const xizongSystemReturnOp=command.operations.find(op=>op.kind==='xizong.system_wu_return')||null;
  const politicsMemoryOp=command.operations.find(op=>op.kind==='politics.memory_plan')||null;
  const planOp=command.operations.find(op=>op.kind==='exam.chat_plan')||null;

  if(englishOp){
    const catalog=await loadEnglishCatalog();
    writeEnglishSessionInstruction(shadow,englishOp.payload,day,{catalog,now});
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
  if(planOp){
    const prior=readJson(shadow,EXAM_CHAT_PLAN_KEY);
    if(prior?.generated_at
      && Date.parse(prior.generated_at)>Date.parse(planOp.payload?.generated_at||0)){
      throw new Error('KIANOS_CONTROL_OLDER_EXAM_PLAN');
    }
    writeExamChatPlan(shadow,planOp.payload,day);
  }

  const keys=changesBetween(storage,shadow);
  commitShadow(storage,shadow,keys);

  const receipt={
    schema:CONTROL_RECEIPT_SCHEMA,
    command_id:command.command_id,
    command_hash:command.command_hash,
    status:'APPLIED',
    observed_at:new Date(now).toISOString(),
    error:null
  };
  try{storage.setItem(CONTROL_LOCAL_RECEIPT_KEY,JSON.stringify(receipt));}catch{}
  await saveReceipt(receipt);

  if(englishOp)window.dispatchEvent(new CustomEvent('kianos:english-session-updated',{
    detail:{schema:englishOp.payload?.schema||null,session_id:englishOp.payload?.session_id||null}
  }));
  for(const op of [xizongSessionOp,xizongReturnOp,xizongSystemReturnOp].filter(Boolean)){
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
  return{status:'applied',command,changed_keys:keys};
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
        && ['APPLIED','IDEMPOTENT'].includes(String(localReceipt.status||'').toUpperCase()))return;
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
        try{storage.setItem(CONTROL_LOCAL_RECEIPT_KEY,JSON.stringify(receipt));}catch{}
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
