// English-owned evidence semantics over existing private storage; not a persistence service.
import {assertEnglishExamTaskAccess,readEnglishExamSession} from './englishExamSession.mjs';
export const ENGLISH_MATERIAL_EXPOSURE_KEY='kianos-english-material-exposure-v1';
export const ENGLISH_EXPOSURE_SCHEMA='kianos.english.material-exposure.v1';
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function readEnglishJson(storage,key,fallback=null){
 const raw=storage.getItem(key);if(raw==null)return clone(fallback);
 let value;try{value=JSON.parse(raw);}catch{throw new Error('ENGLISH_PRIVATE_DATA_UNREADABLE:'+key);}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('ENGLISH_PRIVATE_DATA_SHAPE_INVALID:'+key);
 return value;
}

export function atomicEnglishWrites(storage,changes){
 const previous=new Map(changes.map(([key])=>[key,storage.getItem(key)]));
 try{for(const [key,value] of changes){if(value==null)storage.removeItem(key);else storage.setItem(key,typeof value==='string'?value:JSON.stringify(value));}}
 catch(error){let rollbackError=null;for(const [key,value] of previous){try{if(value==null)storage.removeItem(key);else storage.setItem(key,value);}catch(e){rollbackError=e;}}
  if(rollbackError)throw new Error('ENGLISH_STORAGE_ROLLBACK_FAILED_RESTORE_CHECKPOINT');throw error;}
}

export function readEnglishExposure(storage){
 const data=readEnglishJson(storage,ENGLISH_MATERIAL_EXPOSURE_KEY,{schema:ENGLISH_EXPOSURE_SCHEMA,materials:{}});
 if(data.schema!==ENGLISH_EXPOSURE_SCHEMA||!data.materials||Array.isArray(data.materials))throw new Error('ENGLISH_EXPOSURE_SCHEMA_MISMATCH');return data;
}

function exposureUpdate(storage,binding,event,now){
 const ledger=readEnglishExposure(storage);
 const material=ledger.materials[binding.object_id]||{object_id:binding.object_id,events:[]};
 const id=`${binding.attempt_id}:${event}`;
 if(!material.events.some(e=>e.event_id===id))material.events.push({event_id:id,attempt_id:binding.attempt_id,source_hash:binding.source_hash,context:binding.context,event,at:new Date(now).toISOString()});
 ledger.materials[binding.object_id]=material;return ledger;
}

export function taskMetadata(root,task,objectId){
 let data={};try{data=JSON.parse(root.querySelector('[data-english-task-snapshot]')?.textContent||'{}');}catch{throw new Error('ENGLISH_TASK_SNAPSHOT_INVALID');}
 return {task,object_id:objectId,source_hash:root.getAttribute('data-english-source-hash')||null,snapshot:data};
}

export function preserveEnglishFailure(root,error){
 if(typeof HTMLElement!=='undefined'&&root instanceof HTMLElement){
  root.dataset.englishReadonly='true';root.inert=true;
  let notice=root.previousElementSibling;
  if(!notice?.hasAttribute('data-english-recovery-error')){notice=document.createElement('p');notice.setAttribute('data-english-recovery-error','');notice.setAttribute('role','alert');root.before(notice);}
  notice.textContent='学习记录已保留，当前暂不写入。请先导出或恢复记录，再继续。 '+String(error?.message||error);
 }
 return error;
}

export function inspectEnglishAttempt(storage,key,meta,{sessionId='',now=Date.now(),root=null}={}){
 try{
  if(sessionId)assertEnglishExamTaskAccess(storage,{sessionId,task:meta.task,objectId:meta.object_id,sourceHash:meta.source_hash,now});
  else {const exam=readEnglishExamSession(storage);if(exam&&exam.status!=='RELEASED'&&exam.steps.some(s=>s.object_id===meta.object_id))throw new Error('ENGLISH_ACTIVE_EXAM_USE_SESSION_WORKSPACE');}
  const old=readEnglishJson(storage,key);
  if(old&&!old.binding)throw new Error('ENGLISH_LEGACY_SOURCE_UNVERIFIED_PRESERVE_RAW');
  if(old?.binding && (old.binding.object_id!==meta.object_id || old.binding.task!==meta.task || old.binding.source_hash!==meta.source_hash))throw new Error('ENGLISH_CURRENT_CHANGED_PRESERVE_PREVIOUS_ATTEMPT');
  return old;
 }catch(error){throw preserveEnglishFailure(root,error);}
}

export function saveEnglishAttempt(storage,key,value,meta,{sessionId='',now=Date.now(),root=null,extraChanges=[],guards=[]}={}){
 try{
  for(const [guard,raw] of guards)if(storage.getItem(guard)!==raw)throw new Error('ENGLISH_RETURN_STALE_RELOAD_REQUIRED');
  if(root?.dataset?.englishReadonly==='true')throw new Error('ENGLISH_RECOVERY_REQUIRED');
  const previous=inspectEnglishAttempt(storage,key,meta,{sessionId,now,root});
  let binding=value.binding||previous?.binding;
  if(!binding){
   const ledger=readEnglishExposure(storage);
   const past=ledger.materials[meta.object_id]?.events||[];
   const instruction=readEnglishJson(storage,'kianos-english-session-instruction-v1');
   const step=instruction?.study_day===new Date(now).toLocaleDateString('en-CA')?instruction.steps?.find(s=>s.task===meta.task&&s.object_id===meta.object_id&&s.source_hash===meta.source_hash):null;
   const budget=Number(step?.params?.time_budget_seconds)||null;
   binding={started_at:new Date(now).toISOString(),time_budget_seconds:budget,task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash,attempt_id:globalThis.crypto?.randomUUID?.()||`${meta.object_id}:${now}:${Math.random()}`,context:sessionId?'exam':'study',session_id:sessionId||null,revision:0,prior_exposure:past.length?'exposed':(ledger.materials[meta.object_id]?.declaration?.state||'unknown'),assistance:'unassisted',source_snapshot:clone(meta.snapshot),legacy_unversioned:Boolean(previous)};
  }
  if(previous?.binding&&value.binding&&Number(previous.binding.revision)!==Number(value.binding.revision))throw new Error('ENGLISH_ATTEMPT_STALE_WRITE_RELOAD_REQUIRED');
  // Same-attempt first evidence is immutable even across tab-local stale state.
  for(const field of ['firstDraft','firstAttempts','firstSubmittedAt','submittedAt','firstEvidenceMeta']){
   if(previous?.[field] && (typeof previous[field]!=='object'||Object.keys(previous[field]).length)){
    if(JSON.stringify(previous[field])!==JSON.stringify(value[field]))throw new Error('ENGLISH_FIRST_EVIDENCE_IMMUTABLE:'+field);
   }
  }
  if(previous?.submitted===true && JSON.stringify(previous.answers)!==JSON.stringify(value.answers))throw new Error('ENGLISH_FIRST_ANSWERS_IMMUTABLE');
  if(previous?.binding?.assistance==='assisted')binding={...binding,assistance:'assisted'};
  const next=clone(value);next.binding={...binding,revision:Number(binding.revision||0)+1};next.saved_at=new Date(now).toISOString();
  if(!previous?.firstEvidenceMeta && ((!previous?.submitted&&next.submitted)||(!previous?.firstSubmittedAt&&next.firstSubmittedAt))){
    next.firstEvidenceMeta=Object.fromEntries(['attempt_id','source_hash','prior_exposure','assistance','legacy_unversioned','time_budget_seconds'].map(k=>[k,next.binding[k]]));
    const elapsed=Math.max(0,(now-Date.parse(next.binding.started_at||next.startedAt||next.createdAt||''))/1000);
    next.firstEvidenceMeta.elapsed_seconds=Number.isFinite(elapsed)?elapsed:null;
    next.firstEvidenceMeta.timing_status=next.binding.time_budget_seconds&&Number.isFinite(elapsed)?(elapsed>next.binding.time_budget_seconds?'budget_exceeded':'within_explicit_budget'):'uncalibrated';
    next.firstEvidenceMeta.independent_transfer_candidate=next.binding.prior_exposure==='unseen'&&next.binding.assistance==='unassisted'&&next.firstEvidenceMeta.timing_status!=='budget_exceeded';
    // This is evidence eligibility, never mastery or a compulsory new task.

  }
  const exposure=exposureUpdate(storage,next.binding,'opened',now);
  atomicEnglishWrites(storage,[[key,next],[ENGLISH_MATERIAL_EXPOSURE_KEY,exposure],...extraChanges]);
  Object.assign(value,next);return value;
 }catch(error){throw preserveEnglishFailure(root,error);}
}

export function archiveEnglishAttempt(storage,key,now=Date.now()){
 const old=readEnglishJson(storage,key);if(!old)return;
 const id=old.binding?.attempt_id||`${key}:${now}`;
 // Existing history summaries remain useful, but do not replace the raw first evidence.
 atomicEnglishWrites(storage,[['kianos-english-attempt-archive-v1:'+id,old],[key,null]]);
}

export function markEnglishAssistance(storage,task,objectId,now=Date.now()){
 task=({'Reading A':'reading_a',Cloze:'cloze',Translation:'translation',Writing:'writing'})[task]||task;
 const prefix={reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:',translation:'kianos-translation-attempt-v2:',writing:'kianos-writing-runtime-v1:'}[task];
 if(!prefix)return;const key=prefix+objectId;const state=readEnglishJson(storage,key);if(!state?.binding)return;
 // Fact about this attempt only. Lookup never changes Lexical Coverage/Repair/mastery.
 state.binding.assistance='assisted';
 atomicEnglishWrites(storage,[[key,state],[ENGLISH_MATERIAL_EXPOSURE_KEY,exposureUpdate(storage,state.binding,'assisted',now)]]);
}

const ENGLISH_KEYS=/^kianos-(?:reading-(?:attempt|session|continuous|last-location)|cloze-(?:attempt|last-location)|reading-b-(?:attempt|last-location)|translation-(?:attempt|transfer|last-location)|writing-(?:runtime|evidence|last-location)|english-(?:exam|session|objective|material|attempt))/;
export function exportEnglishCheckpoint(storage){
 const entries={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(ENGLISH_KEYS.test(key)){const raw=storage.getItem(key);JSON.parse(raw);entries[key]=raw;}}
 return {schema:'kianos.english.private-payload.v1',entries};
}
export function restoreEnglishCheckpoint(storage,payload){
 if(payload?.schema!=='kianos.english.private-payload.v1'||!payload.entries||Array.isArray(payload.entries))throw new Error('ENGLISH_CHECKPOINT_SCHEMA_INVALID');
 const changes=[];
 for(const [key,raw] of Object.entries(payload.entries)){
  if(!ENGLISH_KEYS.test(key)||typeof raw!=='string')throw new Error('ENGLISH_CHECKPOINT_KEY_INVALID');JSON.parse(raw);
  const existing=storage.getItem(key);if(existing!=null&&existing!==raw)throw new Error('ENGLISH_CHECKPOINT_CONFLICT_KEEP_LOCAL:'+key);
  changes.push([key,raw]);
 }
 atomicEnglishWrites(storage,changes);return changes.length;
}
