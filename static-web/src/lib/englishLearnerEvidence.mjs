import { commitLearnerStorageChanges } from './browserLearnerWriter.mjs';
// English-owned evidence semantics over existing private storage; not a persistence service.
import {assertEnglishExamTaskAccess,inspectEnglishExamSession,validateEnglishExamSession,englishExamScoreIsSuccessor} from './englishExamSession.mjs';
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
 commitLearnerStorageChanges(storage,changes.map(([key,value])=>[key,
  value==null?null:typeof value==='string'?value:JSON.stringify(value)]));
}

export function readEnglishExposure(storage){
 const data=readEnglishJson(storage,ENGLISH_MATERIAL_EXPOSURE_KEY,{schema:ENGLISH_EXPOSURE_SCHEMA,materials:{}});
 if(data.schema!==ENGLISH_EXPOSURE_SCHEMA||!record(data.materials))throw new Error('ENGLISH_EXPOSURE_SCHEMA_MISMATCH');
 for(const material of Object.values(data.materials)){
  if(!record(material)||!Array.isArray(material.events)||material.events.some(event=>!record(event))
    ||(material.declaration!=null&&(!record(material.declaration)||!['unseen','exposed','unknown'].includes(material.declaration.state))))throw new Error('ENGLISH_EXPOSURE_DATA_UNREADABLE');
 }
 return data;
}

// One exposure recipe, reused by server hashing and legacy snapshot comparison.
// Array order, punctuation, numbers and actual source constraints remain meaningful.
const EXPOSURE_METADATA = new Set([
 'id','objectId','object_id','paperId','paper_id','passage_id','question_id','figure_id',
 'ordinal','year','code','section','navigation','position','total','title',
 'sourcePaths','sourcePath','sourceHashes','sourceHash','sourceTruth','sourceTruthStatus',
 'sourceKind','source_kind','evidence','evidenceRole','evidence_role',
 'target_mechanisms','targetMechanisms','planningPrompt','draftPrompt','asset_path'
]);
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function exposureClone(value){
 if(value==null)return null;
 if(typeof value==='string')return value.normalize('NFC').replace(/\s+/gu,' ').trim();
 if(Array.isArray(value))return value.map(exposureClone);
 if(!record(value))return value;
 const out={};
 for(const key of Object.keys(value).sort()){
  if(!EXPOSURE_METADATA.has(key))out[key]=exposureClone(value[key]);
 }
 return Object.keys(out).length?out:null;
}
export function englishExposurePayload(object={}){
 const payload=exposureClone({
  material:object.paragraphs??object.material??null,
  questions:object.questions??object.prompts??null,
  candidates:object.candidates??null,
  context:object.context??null,
  learnerTask:object.learnerTask??(record(object.task)?object.task:null)
 });
 return payload&&Object.values(payload).some(value=>value!==null)?payload:null;
}
const ATTEMPT_PREFIXES=Object.freeze({
 reading_a:'kianos-reading-attempt-v1:',cloze:'kianos-cloze-attempt-v1:',
 reading_b:'kianos-reading-b-attempt-v1:',external_reading:'kianos-english-external-reading-attempt-v1:',
 translation:'kianos-translation-attempt-v2:',writing:'kianos-writing-runtime-v1:'
});
const archivePrefix='kianos-english-attempt-archive-v1:';
const examArchivePrefix='kianos-english-exam-archive-v1:';
const sourceMatch=(row,meta)=>Boolean(
 (meta.semantic_source_hash&&row?.semantic_source_hash===meta.semantic_source_hash)
 ||(meta.source_hash&&row?.source_hash===meta.source_hash)
);
export function inspectEnglishExposureHistory(storage,meta,{ledger=readEnglishExposure(storage),excludeAttemptId=null}={}){
 const events=Object.values(ledger.materials).flatMap(material=>[
  ...(Array.isArray(material?.events)?material.events:[]),
  ...(material?.declaration?.state==='exposed'?[material.declaration]:[])
 ]).filter(event=>!excludeAttemptId||event?.attempt_id!==excludeAttemptId);
 if(events.some(event=>sourceMatch(event,meta)))return {exposed:true,unresolved:false};
 const currentPayload=englishExposurePayload(meta.snapshot||{});
 const rows=[];let unresolved=false;
 const comparablePayload=(payload)=>Boolean(payload&&currentPayload
  &&Object.keys(payload).filter(key=>payload[key]!==null).join('|')===Object.keys(currentPayload).filter(key=>currentPayload[key]!==null).join('|'));
 // Only native first-output owners and their existing archives; never all localStorage.
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);
  if(typeof key!=='string')continue;
  if(!Object.values(ATTEMPT_PREFIXES).some(prefix=>key.startsWith(prefix))&&!key.startsWith(archivePrefix)&&!key.startsWith('kianos-english-exam-task-v1:'))continue;
  let value;try{value=JSON.parse(storage.getItem(key));}catch{unresolved=true;continue;}
  if(!record(value?.binding)){unresolved=true;continue;}
  if(excludeAttemptId&&value.binding.attempt_id===excludeAttemptId)continue;
  if(sourceMatch(value.binding,meta))return {exposed:true,unresolved:false};
  const payload=englishExposurePayload(value.binding.source_snapshot||{});
  rows.push({binding:value.binding,payload});
  if(!String(value.binding.semantic_source_hash||'').startsWith('e2:')&&!comparablePayload(payload))unresolved=true;
  if(currentPayload&&payload&&JSON.stringify(payload)===JSON.stringify(currentPayload))return {exposed:true,unresolved:false};
 }
 for(const event of events){
  // Version is carried by the existing identity string, not a migration registry.
  if(String(event?.semantic_source_hash||'').startsWith('e2:'))continue;
  const comparable=rows.some(row=>comparablePayload(row.payload)&&(
   (event?.attempt_id&&row.binding.attempt_id===event.attempt_id)
   ||sourceMatch(row.binding,event)
  ));
  if(!comparable)unresolved=true;
 }
 return {exposed:false,unresolved};
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
  if(value.binding&&(value.binding.object_id!==meta.object_id||value.binding.task!==meta.task||value.binding.source_hash!==meta.source_hash))throw new Error('ENGLISH_RETURN_SOURCE_REVISION_MISMATCH');
  let binding=value.binding||previous?.binding;
  if(binding?.attempt_id&&storage.getItem(archivePrefix+binding.attempt_id)!=null)throw new Error('ENGLISH_ATTEMPT_RETIRED');
  if(!binding){
   const ledger=readEnglishExposure(storage);
   const instruction=readEnglishJson(storage,'kianos-english-session-instruction-v1');
   const step=instruction?.study_day===new Date(now).toLocaleDateString('en-CA')?instruction.steps?.find(s=>s.task===meta.task&&s.object_id===meta.object_id&&s.source_hash===meta.source_hash):null;
   const budget=Number(step?.params?.time_budget_seconds)||null;
   const evidenceMeta=meta.snapshot?.evidence&&typeof meta.snapshot.evidence==='object'?meta.snapshot.evidence:{};
   const assistanceContext=step?.params?.assistance_context&&typeof step.params.assistance_context==='object'?clone(step.params.assistance_context):null;
   const semanticSourceHash=String(meta.semantic_source_hash||evidenceMeta.semantic_source_hash||meta.source_hash||'')||null;
   const sourceHistory=inspectEnglishExposureHistory(storage,{...meta,semantic_source_hash:semanticSourceHash},{ledger});
   binding={started_at:new Date(now).toISOString(),time_budget_seconds:budget,task:meta.task,object_id:meta.object_id,source_hash:meta.source_hash,semantic_source_hash:semanticSourceHash,attempt_id:globalThis.crypto?.randomUUID?.()||`${meta.object_id}:${now}:${Math.random()}`,context:sessionId?'exam':'study',session_id:sessionId||null,revision:0,prior_exposure:sourceHistory.exposed?'exposed':sourceHistory.unresolved?'unknown':declarationStateForCurrentSource(ledger,meta.object_id,semanticSourceHash,meta.source_hash),assistance:assistanceContext?.state||'unassisted',assistance_context:assistanceContext,source_kind:String(evidenceMeta.source_kind||'unknown'),evidence_role:evidenceMeta.evidence_role==null?null:String(evidenceMeta.evidence_role),question_origin:String(meta.snapshot?.question_origin||'SOURCE_NATIVE'),generated_transfer_independence:clone(evidenceMeta.transfer_independence||null),calibration_status:evidenceMeta.calibration_status==null?null:String(evidenceMeta.calibration_status),source_snapshot:clone(meta.snapshot),legacy_unversioned:Boolean(previous)};
  }
  if(previous?.binding&&value.binding&&['attempt_id','semantic_source_hash','source_snapshot'].some(field=>JSON.stringify(previous.binding[field])!==JSON.stringify(value.binding[field])))throw new Error('ENGLISH_ATTEMPT_BINDING_IMMUTABLE');
  if(previous?.binding&&value.binding&&Number(previous.binding.revision)!==Number(value.binding.revision))throw new Error('ENGLISH_ATTEMPT_STALE_WRITE_RELOAD_REQUIRED');
  // Same-attempt first evidence is immutable even across tab-local stale state.
  for(const field of ['firstDraft','firstAttempts','firstSubmittedAt','submittedAt','firstEvidenceMeta']){
   if(previous?.[field] && (typeof previous[field]!=='object'||Object.keys(previous[field]).length)){
    if(JSON.stringify(previous[field])!==JSON.stringify(value[field]))throw new Error('ENGLISH_FIRST_EVIDENCE_IMMUTABLE:'+field);
   }
  }
  if(previous?.submitted===true && JSON.stringify(previous.answers)!==JSON.stringify(value.answers))throw new Error('ENGLISH_FIRST_ANSWERS_IMMUTABLE');
  if(previous?.binding?.assistance==='assisted')binding={...binding,assistance:'assisted'};
  if(previous?.binding&&!previous.firstEvidenceMeta&&((!previous.submitted&&value.submitted)||(!previous.firstSubmittedAt&&value.firstSubmittedAt))){
   const history=inspectEnglishExposureHistory(storage,meta,{excludeAttemptId:binding.attempt_id});
   if(history.exposed)binding={...binding,prior_exposure:'exposed'};
   else if(history.unresolved&&binding.prior_exposure==='unseen')binding={...binding,prior_exposure:'unknown'};
  }
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

export function archiveEnglishAttempt(storage,key,now=Date.now(),extraChanges=[]){
 const old=readEnglishJson(storage,key);if(!old)return;
 const id=old.binding?.attempt_id||`${key}:${now}`;
 // Existing raw archive is also the native proof that this current attempt was retired.
 const archiveKey=archivePrefix+id,existing=storage.getItem(archiveKey);
 if(existing!=null&&existing!==JSON.stringify(old))throw new Error('ENGLISH_ATTEMPT_ARCHIVE_CONFLICT');
 atomicEnglishWrites(storage,[[archiveKey,old],[key,null],...extraChanges]);
}

// Explicit user continuation after a Source change; no new attempt or plan is invented.
export function advanceEnglishSourceRevision(storage,step,{catalog,expectedRaw,now=Date.now(),extraChanges=[]}={}){
 const prefix=ATTEMPT_PREFIXES[step?.task];
 const owners=Array.isArray(catalog)?catalog.filter(row=>row.task===step?.task&&row.object_id===step?.object_id):[];
 if(!prefix||owners.length!==1||!step.source_hash||owners[0].source_hash!==step.source_hash)throw new Error('ENGLISH_CURRENT_SOURCE_UNVERIFIED');
 const key=prefix+step.object_id;
 if(expectedRaw===undefined||storage.getItem(key)!==expectedRaw)throw new Error('ENGLISH_SOURCE_CONTINUATION_STALE');
 const examState=inspectEnglishExamSession(storage);
 if(['invalid','unavailable'].includes(examState.status))throw new Error('ENGLISH_EXAM_STATE_INVALID_RECOVERY_REQUIRED');
 if(examState.session&&!['RELEASED','SCORED'].includes(examState.session.status)&&examState.session.steps.some(row=>row.object_id===step.object_id))throw new Error('ENGLISH_ACTIVE_EXAM_USE_SESSION_WORKSPACE');
 if(expectedRaw==null){atomicEnglishWrites(storage,extraChanges);return {archived:false,current_key:key};}
 const prior=readEnglishJson(storage,key),binding=prior?.binding;
 if(!binding||binding.task!==step.task||binding.object_id!==step.object_id||!binding.source_hash||!binding.attempt_id)throw new Error('ENGLISH_LEGACY_SOURCE_UNVERIFIED_PRESERVE_RAW');
 if(binding.source_hash===step.source_hash){atomicEnglishWrites(storage,extraChanges);return {archived:false,current_key:key};}
 archiveEnglishAttempt(storage,key,now,extraChanges);
 return {archived:true,current_key:key,archive_key:archivePrefix+binding.attempt_id};
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
// Pre-binding records are transportable historical evidence, never verified Source facts.
function legacyEnglishCheckpointValue(key,value){
 if(!record(value)||Object.hasOwn(value,'binding'))return false;
 if(key.startsWith(ATTEMPT_PREFIXES.reading_a))return value.version===3&&record(value.answers)&&record(value.results)&&Array.isArray(value.history)&&typeof value.submitted==='boolean';
 if(key.startsWith(ATTEMPT_PREFIXES.cloze))return value.schema==='kianos.english.cloze_attempt.v1'&&value.objectId===key.slice(ATTEMPT_PREFIXES.cloze.length)&&record(value.answers)&&record(value.results)&&typeof value.submitted==='boolean';
 if(key.startsWith(ATTEMPT_PREFIXES.translation))return value.version===2&&typeof value.stage==='string'&&record(value.drafts)&&record(value.firstAttempts)&&Array.isArray(value.history)&&Array.isArray(value.reconstructions);
 if(key.startsWith(ATTEMPT_PREFIXES.writing))return value.version===1&&value.schema==='kianos.english.writing.runtime.v1'&&value.taskId===key.slice(ATTEMPT_PREFIXES.writing.length)&&typeof value.state==='string'&&typeof value.draftEssay==='string'&&Array.isArray(value.history)&&Array.isArray(value.repairHistory);
 return false;
}
// Submitted objective work is complete only against its retained exact question set.
// An absent/partial result map is unknown, never zero errors. This is workflow
// integrity, not grading or mastery; native workspaces still own the results.
export function inspectEnglishObjectiveResults(value) {
 const unknown={valid:false,problem_count:null};
 if(!record(value)||!record(value.answers)||!record(value.results))return unknown;
 const questions=value.binding?.source_snapshot?.questions;
 if(!Array.isArray(questions)||!questions.length)return unknown;
 const ids=questions.map(row=>typeof row?.id==='string'?row.id:'');
 if(ids.some(id=>!id)||new Set(ids).size!==ids.length)return unknown;
 const expected=new Set(ids),results=Object.keys(value.results);
 if(results.length!==ids.length||results.some(id=>!expected.has(id))
   ||ids.some(id=>!['correct','wrong','unanswered'].includes(value.results[id])))return unknown;
 if(Object.keys(value.answers).some(id=>!expected.has(id)||typeof value.answers[id]!=='string')
   ||ids.some(id=>value.results[id]!=='unanswered'&&!String(value.answers[id]||'').trim()))return unknown;
 if(value.uncertain!=null&&(!Array.isArray(value.uncertain)
   ||value.uncertain.some(id=>!expected.has(String(id)))))return unknown;
 const uncertain=new Set((value.uncertain||[]).map(String));
 return {valid:true,problem_count:ids.filter(id=>value.results[id]!=='correct'||uncertain.has(id)).length};
}

function nativeCheckpointValue(key,raw){
 const value=JSON.parse(raw);
 if(key===ENGLISH_MATERIAL_EXPOSURE_KEY)readEnglishExposure({getItem:()=>raw});
 const rowsKey=key==='kianos-english-objective-transfer-claims-v1'?'claims':['kianos-translation-transfer-v1','kianos-writing-evidence-v1'].includes(key)?'targets':null;
 if(rowsKey&&(!record(value)||!Array.isArray(value[rowsKey])))throw new Error('ENGLISH_NATIVE_LEDGER_UNREADABLE');
 if(key==='kianos-english-exam-session-v1'||key.startsWith('kianos-english-exam-archive-v1:'))return validateEnglishExamSession(value);
 if(Object.values(ATTEMPT_PREFIXES).some(prefix=>key.startsWith(prefix))||key.startsWith(archivePrefix)){
  if(!legacyEnglishCheckpointValue(key,value)&&(!record(value)||!record(value.binding)||!value.binding.attempt_id||!value.binding.source_hash))throw new Error('ENGLISH_ATTEMPT_IDENTITY_UNVERIFIED');
  if(value?.submitted===true&&['reading_a','cloze','reading_b'].includes(value.binding?.task)
    &&!inspectEnglishObjectiveResults(value).valid)throw new Error('ENGLISH_OBJECTIVE_RESULTS_UNREADABLE');
 }
 return value;
}
function checkpointEntries(payload){
 if(payload?.schema!=='kianos.english.private-payload.v1'||!record(payload.entries))throw new Error('ENGLISH_CHECKPOINT_SCHEMA_INVALID');
 for(const [key,raw] of Object.entries(payload.entries)){
  if(!englishCheckpointKeyAllowed(key)||typeof raw!=='string')throw new Error('ENGLISH_CHECKPOINT_KEY_INVALID');
 }
 return payload.entries;
}
export function inspectEnglishCheckpoint(payload){
 const entries=checkpointEntries(payload),corruptKeys=[],unverifiedKeys=[],retired=[];
 for(const [key,raw] of Object.entries(entries)){
  let value;try{value=nativeCheckpointValue(key,raw);}catch{corruptKeys.push(key);continue;}
  if(legacyEnglishCheckpointValue(key,value))unverifiedKeys.push(key);
  if(key.startsWith(examArchivePrefix)&&key===examArchivePrefix+value.session_id)retired.push({
   current_key:'kianos-english-exam-session-v1',session_id:value.session_id,source_hash:value.source_hash,
   archived_revision:value.revision,archive_key:key
  });
  if(key.startsWith(archivePrefix)){
   const b=value.binding,prefix=ATTEMPT_PREFIXES[b.task];
   if(prefix&&key===archivePrefix+b.attempt_id)retired.push({
    current_key:prefix+b.object_id,attempt_id:b.attempt_id,source_hash:b.source_hash,
    archived_revision:Number.isInteger(b.revision)?b.revision:null,archive_key:key
   });
  }
 }
 return {
  status:corruptKeys.length?'corrupt-retained':unverifiedKeys.length?'legacy-unverified':Object.keys(entries).length?'valid':'absent',
  corrupt_keys:corruptKeys,unverified_keys:unverifiedKeys,retired_current:retired,absence_is_deletion:false
 };
}
export function exportEnglishCheckpoint(storage){
 const entries={};
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);if(englishCheckpointKeyAllowed(key))entries[key]=storage.getItem(key);
 }
 const payload={schema:'kianos.english.private-payload.v1',entries};
 // Raw corruption is exportable evidence, never a successfully parsed learner fact.
 return {...payload,native_integrity:inspectEnglishCheckpoint(payload)};
}
function retiredCurrent(key,raw,entries,retired){
 let value;try{value=JSON.parse(raw);}catch{return false;}
 const binding=value?.binding;
 return retired.some(row=>{
  if(row.session_id){
   if(row.current_key!==key||row.session_id!==value?.session_id||row.source_hash!==value?.source_hash)return false;
   // Divergent Whole-Paper output remains recoverable, never silently deleted.
   return JSON.stringify(JSON.parse(entries[row.archive_key]))===JSON.stringify(value);
  }
  if(!binding)return false;
  if(row.current_key!==key||row.attempt_id!==binding.attempt_id||row.source_hash!==binding.source_hash)return false;
  const archived=JSON.parse(entries[row.archive_key]);
  if(JSON.stringify(archived)===JSON.stringify(value))return true;
  if(!Number.isInteger(binding.revision)||row.archived_revision===null||binding.revision>=row.archived_revision)return false;
  // Revision numbers are not ancestry proof: a lower-numbered draft can be a
  // divergent local fork. Retire only when all learner content is preserved.
  const content=entry=>{const copy=clone(entry);delete copy.saved_at;delete copy.binding.revision;return copy;};
  return JSON.stringify(content(archived))===JSON.stringify(content(value));
 });
}
export function restoreEnglishCheckpoint(storage,payload,{keepLocal=false}={}){
 const incoming=checkpointEntries(payload),local=exportEnglishCheckpoint(storage).entries;
 // Conflicting archives cannot be used to authorize deletion.
 const conflictingArchives=new Set();
 for(const [key,raw] of Object.entries(incoming)){
  if((key.startsWith(archivePrefix)||key.startsWith(examArchivePrefix))&&local[key]!=null&&local[key]!==raw){
   if(!keepLocal)throw new Error('ENGLISH_CHECKPOINT_CONFLICT_KEEP_LOCAL:'+key);
   conflictingArchives.add(key);
  }
 }
 const combined={...incoming,...local};
 const retired=inspectEnglishCheckpoint({schema:payload.schema,entries:combined}).retired_current.filter(row=>!conflictingArchives.has(row.archive_key));
 const changes=[];
 for(const [key,raw] of Object.entries(incoming)){
  if(retiredCurrent(key,raw,combined,retired))continue;
  const existing=storage.getItem(key);
  if(existing!=null&&existing!==raw){
   const safeScore=key==='kianos-english-exam-session-v1'
     && englishExamScoreIsSuccessor(JSON.parse(existing),JSON.parse(raw));
   if(!safeScore){
    if(keepLocal)continue;
    throw new Error('ENGLISH_CHECKPOINT_CONFLICT_KEEP_LOCAL:'+key);
   }
  }
  changes.push([key,raw]);
 }
 for(const [key,raw] of Object.entries(local)){
  if(retiredCurrent(key,raw,combined,retired))changes.push([key,null]);
 }
 atomicEnglishWrites(storage,changes);return changes.length;
}
