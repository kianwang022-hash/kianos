import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const ENGLISH_GENERATED_DRILL_SCHEMA='kianos.english.generated-drill.v1';
export const ENGLISH_GENERATED_ORIGINS=Object.freeze([
  'CHAT_GENERATED_SYNTHETIC',
  'CHAT_GENERATED_ON_EXTERNAL_SOURCE'
]);
export const ENGLISH_GENERATED_EVIDENCE_ROLES=Object.freeze([
  'CALIBRATION',
  'TEACHING_REPAIR',
  'TRANSFER',
  'STRESS_EDGE'
]);

const clean=(value,max=2000)=>String(value??'').trim().slice(0,max);
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day+'T00:00:00Z'));
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');

export function resolveEnglishGeneratedDir({env=process.env,home=os.homedir()}={}){
  const configured=clean(env.KIANOS_ENGLISH_GENERATED_DIR,4000);
  if(configured)return path.resolve(configured);
  if(process.platform==='darwin')return path.join(home,'Library','Application Support','KianOS','english-generated');
  return path.join(home,'.kianos','english-generated');
}

function canonicalPayload(value){
  return {
    schema:value.schema,
    object_id:value.object_id,
    study_day:value.study_day,
    generated_at:value.generated_at,
    origin:value.origin,
    completion_requirement:value.completion_requirement,
    training_target:value.training_target,
    evidence_role:value.evidence_role,
    transfer_independence:value.transfer_independence||null,
    calibration_status:value.calibration_status,
    retire_dedupe_rule:value.retire_dedupe_rule,
    source_ref:value.source_ref||null,
    passage:value.passage||null,
    questions:value.questions
  };
}

export function generatedDrillContentHash(value){
  return sha256(JSON.stringify(canonicalPayload(value)));
}

function normalizeQuestion(raw,index,objectId){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('ENGLISH_GENERATED_QUESTION_INVALID:'+index);
  const questionId=clean(raw.question_id||raw.questionId,180);
  if(!questionId||!/^[A-Za-z0-9._:-]+$/.test(questionId))throw new Error('ENGLISH_GENERATED_QUESTION_ID_INVALID:'+index);
  const prompt=clean(raw.prompt,4000);
  if(!prompt)throw new Error('ENGLISH_GENERATED_QUESTION_PROMPT_REQUIRED:'+questionId);
  if(raw.origin!=='CHAT_GENERATED')throw new Error('ENGLISH_GENERATED_QUESTION_ORIGIN_INVALID:'+questionId);
  const kind=clean(raw.response_kind||raw.responseKind,40);
  if(kind!=='single_choice')throw new Error('ENGLISH_GENERATED_QUESTION_KIND_UNSUPPORTED:'+questionId);
  const entries=Object.entries(raw.options||{}).map(([k,v])=>[clean(k,16),clean(v,1500)]).filter(([k,v])=>k&&v);
  if(entries.length<2||entries.length>6)throw new Error('ENGLISH_GENERATED_QUESTION_OPTIONS_INVALID:'+questionId);
  if(new Set(entries.map(([k])=>k)).size!==entries.length)throw new Error('ENGLISH_GENERATED_QUESTION_OPTION_DUPLICATE:'+questionId);
  const answer=clean(raw.answer,16);
  if(!entries.some(([k])=>k===answer))throw new Error('ENGLISH_GENERATED_QUESTION_ANSWER_INVALID:'+questionId);
  return {
    question_id:questionId,
    ordinal:Number.isInteger(Number(raw.ordinal))&&Number(raw.ordinal)>0?Number(raw.ordinal):index+1,
    origin:'CHAT_GENERATED',
    response_kind:'single_choice',
    prompt,
    options:Object.fromEntries(entries),
    answer,
    rationale:clean(raw.rationale,4000)||null
  };
}

export function validateEnglishGeneratedDrill(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('ENGLISH_GENERATED_DRILL_OBJECT_REQUIRED');
  if(value.schema!==ENGLISH_GENERATED_DRILL_SCHEMA)throw new Error('ENGLISH_GENERATED_DRILL_SCHEMA_INVALID');
  const objectId=clean(value.object_id||value.objectId,180);
  if(!/^external-chat-\d{4}-\d{2}-\d{2}-[A-Za-z0-9._-]+$/.test(objectId))throw new Error('ENGLISH_GENERATED_DRILL_ID_INVALID');
  const studyDay=clean(value.study_day||value.studyDay,20);
  if(!validDay(studyDay)||!objectId.startsWith('external-chat-'+studyDay+'-'))throw new Error('ENGLISH_GENERATED_DRILL_DAY_INVALID');
  const generatedAt=clean(value.generated_at||value.generatedAt,80);
  if(!generatedAt||Number.isNaN(Date.parse(generatedAt)))throw new Error('ENGLISH_GENERATED_DRILL_TIME_INVALID');
  const origin=clean(value.origin,80);
  if(!ENGLISH_GENERATED_ORIGINS.includes(origin))throw new Error('ENGLISH_GENERATED_DRILL_ORIGIN_INVALID');
  const target=value.training_target;
  if(!target||typeof target!=='object'||Array.isArray(target))throw new Error('ENGLISH_GENERATED_DRILL_TARGET_REQUIRED');
  const trainingTarget={
    kind:clean(target.kind,120),
    note:clean(target.note,1200)
  };
  if(!trainingTarget.kind||!trainingTarget.note)throw new Error('ENGLISH_GENERATED_DRILL_TARGET_INVALID');

  const evidenceRole=clean(value.evidence_role||value.evidenceRole,40)||'TEACHING_REPAIR';
  if(!ENGLISH_GENERATED_EVIDENCE_ROLES.includes(evidenceRole))throw new Error('ENGLISH_GENERATED_DRILL_EVIDENCE_ROLE_INVALID');
  let transferIndependence=null;
  if(evidenceRole==='TRANSFER'){
    const raw=value.transfer_independence||value.transferIndependence;
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('ENGLISH_GENERATED_DRILL_TRANSFER_INDEPENDENCE_REQUIRED');
    const status=clean(raw.status,20).toUpperCase();
    const basis=clean(raw.basis,80).toUpperCase();
    const note=clean(raw.note,1200);
    const parents=(Array.isArray(raw.parent_semantic_source_hashes)?raw.parent_semantic_source_hashes:[])
      .map(v=>clean(v,128)).filter(Boolean);
    const changed=(Array.isArray(raw.changed_context_dimensions)?raw.changed_context_dimensions:[])
      .map(v=>clean(v,120)).filter(Boolean);
    if(status!=='PASS'||basis!=='CHAT_SELF_ATTACK'||!note||!parents.length||!changed.length){
      throw new Error('ENGLISH_GENERATED_DRILL_TRANSFER_INDEPENDENCE_INVALID');
    }
    transferIndependence={
      status:'PASS',
      basis:'CHAT_SELF_ATTACK',
      note,
      parent_semantic_source_hashes:[...new Set(parents)],
      changed_context_dimensions:[...new Set(changed)]
    };
  }else if(value.transfer_independence!=null||value.transferIndependence!=null){
    throw new Error('ENGLISH_GENERATED_DRILL_TRANSFER_INDEPENDENCE_ROLE_MISMATCH');
  }
  const calibrationStatus=clean(value.calibration_status||value.calibrationStatus,80)||'NOT_SCORE_EQUIVALENT';
  if(calibrationStatus!=='NOT_SCORE_EQUIVALENT')throw new Error('ENGLISH_GENERATED_DRILL_CALIBRATION_STATUS_INVALID');
  const retireDedupeRule=clean(value.retire_dedupe_rule||value.retireDedupeRule,160)
    ||'EPHEMERAL_UNLESS_REUSE_PROVEN; SEMANTIC_IDENTITY_DOES_NOT_RESET';

  let sourceRef=null;
  let passage=null;
  if(origin==='CHAT_GENERATED_SYNTHETIC'){
    const raw=value.passage;
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('ENGLISH_GENERATED_DRILL_PASSAGE_REQUIRED');
    const paragraphs=(Array.isArray(raw.paragraphs)?raw.paragraphs:[]).map(v=>clean(v,8000)).filter(Boolean);
    if(!paragraphs.length||paragraphs.length>30)throw new Error('ENGLISH_GENERATED_DRILL_PARAGRAPHS_INVALID');
    passage={title:clean(raw.title,300)||'Chat-generated drill',paragraphs};
    if(value.source_ref!=null)throw new Error('ENGLISH_GENERATED_DRILL_SYNTHETIC_SOURCE_REF_FORBIDDEN');
  }else{
    const raw=value.source_ref;
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_REF_REQUIRED');
    sourceRef={
      object_id:clean(raw.object_id||raw.objectId,240),
      content_hash:clean(raw.content_hash||raw.contentHash,128)
    };
    if(!sourceRef.object_id||!sourceRef.content_hash)throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_REF_INVALID');
    if(value.passage!=null)throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_PASSAGE_DUPLICATION_FORBIDDEN');
  }

  const questions=(Array.isArray(value.questions)?value.questions:[]).map((q,i)=>normalizeQuestion(q,i,objectId));
  if(!questions.length||questions.length>20)throw new Error('ENGLISH_GENERATED_DRILL_QUESTION_COUNT_INVALID');
  if(new Set(questions.map(q=>q.question_id)).size!==questions.length)throw new Error('ENGLISH_GENERATED_DRILL_QUESTION_ID_DUPLICATE');

  const completionRequirement=clean(value.completion_requirement||value.completionRequirement,40)||'QUESTIONS_SUBMITTED';
  if(!['READ_ONLY_OK','QUESTIONS_SUBMITTED'].includes(completionRequirement))throw new Error('ENGLISH_GENERATED_DRILL_COMPLETION_INVALID');

  const result={
    schema:ENGLISH_GENERATED_DRILL_SCHEMA,
    object_id:objectId,
    study_day:studyDay,
    generated_at:new Date(generatedAt).toISOString(),
    origin,
    completion_requirement:completionRequirement,
    training_target:trainingTarget,
    evidence_role:evidenceRole,
    transfer_independence:transferIndependence,
    calibration_status:calibrationStatus,
    retire_dedupe_rule:retireDedupeRule,
    source_ref:sourceRef,
    passage,
    questions
  };
  return {...result,content_hash:generatedDrillContentHash(result)};
}

function drillPath(privateDir,objectId){
  return path.join(privateDir,objectId+'.json');
}

export function writeEnglishGeneratedDrill(input,{privateDir=resolveEnglishGeneratedDir()}={}){
  const drill=validateEnglishGeneratedDrill(input);
  fs.mkdirSync(privateDir,{recursive:true,mode:0o700});
  try{fs.chmodSync(privateDir,0o700);}catch{}
  const file=drillPath(privateDir,drill.object_id);
  if(fs.existsSync(file)){
    const existing=validateEnglishGeneratedDrill(JSON.parse(fs.readFileSync(file,'utf8')));
    if(existing.content_hash===drill.content_hash)return{status:'idempotent',drill,path:file};
    throw new Error('ENGLISH_GENERATED_DRILL_ID_CONFLICT:'+drill.object_id);
  }
  const temp=file+'.tmp-'+process.pid+'-'+Date.now();
  fs.writeFileSync(temp,JSON.stringify(drill,null,2)+'\n',{mode:0o600});
  fs.renameSync(temp,file);
  try{fs.chmodSync(file,0o600);}catch{}
  return{status:'written',drill,path:file};
}

export function readEnglishGeneratedDrill(objectId,{privateDir=resolveEnglishGeneratedDir()}={}){
  const id=clean(objectId,180);
  if(!/^external-chat-\d{4}-\d{2}-\d{2}-[A-Za-z0-9._-]+$/.test(id))throw new Error('ENGLISH_GENERATED_DRILL_ID_INVALID');
  const file=drillPath(privateDir,id);
  if(!fs.existsSync(file))throw new Error('ENGLISH_GENERATED_DRILL_NOT_FOUND:'+id);
  return validateEnglishGeneratedDrill(JSON.parse(fs.readFileSync(file,'utf8')));
}

export function listEnglishGeneratedDrills({privateDir=resolveEnglishGeneratedDir(),studyDay=null}={}){
  if(!fs.existsSync(privateDir))return[];
  const rows=[];
  for(const name of fs.readdirSync(privateDir)){
    if(!name.endsWith('.json'))continue;
    try{
      const drill=validateEnglishGeneratedDrill(JSON.parse(fs.readFileSync(path.join(privateDir,name),'utf8')));
      if(studyDay&&drill.study_day!==studyDay)continue;
      rows.push(drill);
    }catch{}
  }
  return rows.sort((a,b)=>Date.parse(b.generated_at)-Date.parse(a.generated_at));
}

export function generatedDrillCatalogRows(options={}){
  return listEnglishGeneratedDrills(options).map(drill=>({
    task:'external_reading',
    object_id:drill.object_id,
    source_hash:drill.content_hash,
    content_hash:drill.content_hash,
    label:'Chat Drill · '+drill.training_target.kind,
    origin:drill.origin,
    evidence_role:drill.evidence_role,
    transfer_independence:drill.transfer_independence,
    calibration_status:drill.calibration_status,
    study_day:drill.study_day
  }));
}

export function materializeEnglishGeneratedDrill(drill,{loadExternalSource}={}){
  const value=validateEnglishGeneratedDrill(drill);
  let title;
  let paragraphs;
  let sourceFamily;
  let sourceFormat;
  let collection;
  let sourceObjectId=null;

  if(value.origin==='CHAT_GENERATED_SYNTHETIC'){
    title=value.passage.title;
    paragraphs=value.passage.paragraphs;
    sourceFamily='CHAT_GENERATED';
    sourceFormat='CHAT_GENERATED';
    collection='Chat Drills';
  }else{
    if(typeof loadExternalSource!=='function')throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_LOADER_REQUIRED');
    const source=loadExternalSource(value.source_ref.object_id);
    if(!source||source.content_hash!==value.source_ref.content_hash)throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_REVISION_MISMATCH');
    title=source.title||source.object_id;
    paragraphs=Array.isArray(source.passage_paragraphs)?source.passage_paragraphs.map(row=>typeof row==='string'?row:row?.text||'').filter(Boolean):[];
    if(!paragraphs.length)throw new Error('ENGLISH_GENERATED_DRILL_SOURCE_TEXT_MISSING');
    sourceFamily=source.source_family||'OTHER_READING';
    sourceFormat=source.source_format||'OTHER';
    collection=source.collection||'External';
    sourceObjectId=source.object_id;
  }

  return{
    schema:'kianos.english.external-passage-view.v1',
    object_id:value.object_id,
    source_family:sourceFamily,
    source_format:sourceFormat,
    collection,
    test:null,
    passage_number:1,
    title,
    passage_text:paragraphs.join('\n\n'),
    passage_paragraphs:paragraphs,
    questions:value.questions.map(({answer,rationale,...q})=>q),
    answer_key_status:'CHAT_GENERATED',
    question_origin:'CHAT_GENERATED',
    drill_origin:value.origin,
    completion_requirement:value.completion_requirement,
    source_object_id:sourceObjectId,
    training_target:value.training_target,
    evidence_role:value.evidence_role,
    transfer_independence:value.transfer_independence,
    calibration_status:value.calibration_status,
    retire_dedupe_rule:value.retire_dedupe_rule,
    warnings:[],
    source_hash:value.source_ref?.content_hash||null,
    content_hash:value.content_hash
  };
}

export function englishGeneratedDrillAnswers(drill){
  const value=validateEnglishGeneratedDrill(drill);
  return{
    schema:'kianos.english.external-answer-view.v1',
    object_id:value.object_id,
    content_hash:value.content_hash,
    answer_key_status:'CHAT_GENERATED',
    question_origin:'CHAT_GENERATED',
    answers:Object.fromEntries(value.questions.map(q=>[q.question_id,q.answer])),
    rationales:Object.fromEntries(value.questions.filter(q=>q.rationale).map(q=>[q.question_id,q.rationale]))
  };
}
