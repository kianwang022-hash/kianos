// English-owned evidence semantics over existing private storage; not a persistence service.
import {assertEnglishExamTaskAccess,inspectEnglishExamSession} from './englishExamSession.mjs';
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

function semanticSourcePreviouslyExposed(ledger,semanticSourceHash,exactSourceHash){
 if(!semanticSourceHash&&!exactSourceHash)return false;
 return Object.values(ledger?.materials||{}).some((material)=>{
  const eventMatch=Array.isArray(material?.events)&&material.events.some((event)=>
    (semanticSourceHash&&event?.semantic_source_hash===semanticSourceHash)
    || (exactSourceHash&&event?.source_hash===exactSourceHash)
  );
  const declarationMatch=material?.declaration?.state==='exposed'&&(
    (semanticSourceHash&&material?.declaration?.semantic_source_hash===semanticSourceHash)
    || (exactSourceHash&&material?.declaration?.source_hash===exactSourceHash)
  );
  return eventMatch||declarationMatch;
 });
}

function declarationStateForCurrentSource(ledger,objectId,semanticSourceHash,exactSourceHash){
 const declaration=ledger?.materials?.[objectId]?.declaration;
 if(!declaration)return 'unknown';
 const identityMatch=
  (semanticSourceHash&&declaration.semantic_source_hash===semanticSourceHash)
  || (exactSourceHash&&declaration.source_hash===exactSourceHash);
 return identityMatch?declaration.state:'unknown';
}

function exposureUpdate(storage,binding,event,now){
 const ledger=readEnglishExposure(storage);
 const material=ledger.materials[binding.object_id]||{object_id:binding.object_id,events:[]};
 const id=`${binding.attempt_id}:${event}`;
 if(!material.events.some(e=>e.event_id===id))material.events.push({event_id:id,attempt_id:binding.attempt_id,source_hash:binding.source_hash,semantic_source_hash:binding.semantic_source_hash||binding.source_hash,context:binding.context,event,at:new Date(now).toISOString()});
 ledger.materials[binding.object_id]=material;return ledger;
}

export function taskMetadata(root,task,objectId){
 let data={};try{data=JSON.parse(root.querySelector('[data-english-task-snapshot]')?.textContent||'{}');}catch{throw new Error('ENGLISH_TASK_SNAPSHOT_INVALID');}
 return {task,object_id:objectId,source_hash:root.getAttribute('data-english-source-hash')||null,semantic_source_hash:data?.evidence?.semantic_source_hash||root.getAttribute('data-english-source-hash')||null,snapshot:data};
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
  else {
    const examState=inspectEnglishExamSession(storage);
    if(['invalid','unavailable'].includes(examState.status))throw new Error('ENGLISH_EXAM_STATE_INVALID_RECOVERY_REQUIRED');
    const exam=examState.session;
    if(exam&&!['RELEASED','SCORED'].includes(exam.status)&&exam.steps.some(s=>s.object_id===meta.object_id))throw new Error('ENGLISH_ACTIVE_EXAM_USE_SESSION_WORKSPACE');
  }
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
   const evidenceMeta=meta.snapshot?.evidence&&typeof meta.snapshot.evidence==='object'?meta.snapshot.evidence:{};
   const assistanceContext=step?.params?.assistance_context&&typeof step.params.assistance_context==='object'?clone(step.params.assistance_context):null;
   const semanticSourceHash=String(meta.semantic_source_hash||evidenceMeta.semantic_source_hash||meta.source_hash||'')||null;
   const semanticSourceSeen=semanticSourcePreviouslyExposed(ledger,semanticSourceHash,meta.source_hash);
   binding={started_at:new Date(now).toISOString(),time_budget_seconds:budget,task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash,semantic_source_hash:semanticSourceHash,attempt_id:globalThis.crypto?.randomUUID?.()||`${meta.object_id}:${now}:${Math.random()}`,context:sessionId?'exam':'study',session_id:sessionId||null,revision:0,prior_exposure:semanticSourceSeen?'exposed':declarationStateForCurrentSource(ledger,meta.object_id,semanticSourceHash,meta.source_hash),assistance:assistanceContext?.state||'unassisted',assistance_context:assistanceContext,source_kind:String(evidenceMeta.source_kind||'unknown'),evidence_role:evidenceMeta.evidence_role==null?null:String(evidenceMeta.evidence_role),question_origin:String(meta.snapshot?.question_origin||'SOURCE_NATIVE'),generated_transfer_independence:clone(evidenceMeta.transfer_independence||null),calibration_status:evidenceMeta.calibration_status==null?null:String(evidenceMeta.calibration_status),source_snapshot:clone(meta.snapshot),legacy_unversioned:Boolean(previous)};
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
    next.firstEvidenceMeta=Object.fromEntries(['attempt_id','source_hash','semantic_source_hash','prior_exposure','assistance','source_kind','evidence_role','legacy_unversioned','time_budget_seconds'].map(k=>[k,next.binding[k]]));
    next.firstEvidenceMeta.assistance_context=next.binding.assistance_context?clone(next.binding.assistance_context):null;
    const elapsed=Math.max(0,(now-Date.parse(next.binding.started_at||next.startedAt||next.createdAt||''))/1000);
    next.firstEvidenceMeta.elapsed_seconds=Number.isFinite(elapsed)?elapsed:null;
    next.firstEvidenceMeta.timing_status=next.binding.time_budget_seconds&&Number.isFinite(elapsed)?(elapsed>next.binding.time_budget_seconds?'budget_exceeded':'within_explicit_budget'):'uncalibrated';
    const generatedTransferEligible=next.binding.question_origin!=='CHAT_GENERATED'
      || (next.binding.evidence_role==='TRANSFER'
        && next.binding.generated_transfer_independence?.status==='PASS'
        && next.binding.generated_transfer_independence?.basis==='CHAT_SELF_ATTACK');
    next.firstEvidenceMeta.generated_transfer_independence=next.binding.generated_transfer_independence?clone(next.binding.generated_transfer_independence):null;
    next.firstEvidenceMeta.calibration_status=next.binding.calibration_status||null;
    next.firstEvidenceMeta.independent_transfer_candidate=next.binding.prior_exposure==='unseen'
      && next.binding.assistance==='unassisted'
      && next.firstEvidenceMeta.timing_status!=='budget_exceeded'
      && generatedTransferEligible;
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
 task=({'Reading A':'reading_a',Cloze:'cloze','External Reading':'external_reading',Translation:'translation',Writing:'writing'})[task]||task;
 const prefix={reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',reading_b:'kianos-reading-b-attempt-v1:',external_reading:'kianos-english-external-reading-attempt-v1:',translation:'kianos-translation-attempt-v2:',writing:'kianos-writing-runtime-v1:'}[task];
 if(!prefix)return;const key=prefix+objectId;const state=readEnglishJson(storage,key);if(!state?.binding)return;
 // Fact about this attempt only. Lookup never changes Lexical Coverage/Repair/mastery.
 state.binding.assistance='assisted';
 atomicEnglishWrites(storage,[[key,state],[ENGLISH_MATERIAL_EXPOSURE_KEY,exposureUpdate(storage,state.binding,'assisted',now)]]);
}

const ENGLISH_KEYS=/^kianos-(?:reading-(?:attempt|session|continuous|last-location)|cloze-(?:attempt|last-location)|reading-b-(?:attempt|last-location)|translation-(?:attempt|transfer|last-location)|writing-(?:runtime|evidence|last-location)|english-(?:exam|session|objective|material|attempt|external-reading))/;
export function englishCheckpointKeyAllowed(key){return ENGLISH_KEYS.test(String(key||''));}
export function exportEnglishCheckpoint(storage){
 const entries={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(englishCheckpointKeyAllowed(key)){const raw=storage.getItem(key);JSON.parse(raw);entries[key]=raw;}}
 return {schema:'kianos.english.private-payload.v1',entries};
}
export function restoreEnglishCheckpoint(storage,payload){
 if(payload?.schema!=='kianos.english.private-payload.v1'||!payload.entries||Array.isArray(payload.entries))throw new Error('ENGLISH_CHECKPOINT_SCHEMA_INVALID');
 const changes=[];
 for(const [key,raw] of Object.entries(payload.entries)){
  if(!englishCheckpointKeyAllowed(key)||typeof raw!=='string')throw new Error('ENGLISH_CHECKPOINT_KEY_INVALID');JSON.parse(raw);
  const existing=storage.getItem(key);if(existing!=null&&existing!==raw)throw new Error('ENGLISH_CHECKPOINT_CONFLICT_KEEP_LOCAL:'+key);
  changes.push([key,raw]);
 }
 atomicEnglishWrites(storage,changes);return changes.length;
}
