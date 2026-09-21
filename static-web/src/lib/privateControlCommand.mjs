export const CONTROL_COMMAND_SCHEMA='kianos.control-command.v1';
export const CONTROL_BROWSER_SCHEMA='kianos.control-browser-command.v1';
export const CONTROL_RECEIPT_SCHEMA='kianos.control-receipt.v1';
export const CONTROL_LOCAL_RECEIPT_KEY='kianos-control-receipt-v1';

export const CONTROL_OPERATION_KINDS=Object.freeze([
  'english.generated_drill',
  'english.session',
  'english.exam_score_return',
  'xizong.session',
  'xizong.chat_return',
  'xizong.system_wu_return',
  'politics.memory_plan',
  'exam.chat_plan'
]);

const clean=(value,max=1000)=>String(value??'').trim().slice(0,max);
const validDay=day=>typeof day==='string'
  && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && !Number.isNaN(Date.parse(day+'T00:00:00Z'));

function fail(code,detail=''){
  throw new Error('KIANOS_CONTROL_'+code+(detail?':'+detail:''));
}

function normalizeOperation(raw,index,{browserOnly=false}={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('OP_INVALID',String(index));
  const kind=clean(raw.kind,80);
  if(!CONTROL_OPERATION_KINDS.includes(kind))fail('OP_KIND_INVALID',kind||String(index));
  if(browserOnly&&kind==='english.generated_drill')fail('BROWSER_SERVER_OP_FORBIDDEN',kind);
  const payload=raw.payload;
  if(!payload||typeof payload!=='object'||Array.isArray(payload))fail('OP_PAYLOAD_INVALID',kind);
  return{kind,payload:JSON.parse(JSON.stringify(payload))};
}

export function validateControlCommand(value){
  if(!value||typeof value!=='object'||Array.isArray(value))fail('OBJECT_REQUIRED');
  if(value.schema!==CONTROL_COMMAND_SCHEMA)fail('SCHEMA_INVALID');
  const commandId=clean(value.command_id||value.commandId,180);
  if(!/^[A-Za-z0-9._:-]{8,180}$/.test(commandId))fail('ID_INVALID');
  const studyDay=clean(value.study_day||value.studyDay,20);
  if(!validDay(studyDay))fail('DAY_INVALID');
  const generatedAt=clean(value.generated_at||value.generatedAt,80);
  if(!generatedAt||Number.isNaN(Date.parse(generatedAt)))fail('GENERATED_AT_INVALID');
  const expiresAt=value.expires_at||value.expiresAt?clean(value.expires_at||value.expiresAt,80):null;
  if(expiresAt&&Number.isNaN(Date.parse(expiresAt)))fail('EXPIRES_AT_INVALID');
  if(expiresAt&&Date.parse(expiresAt)<=Date.parse(generatedAt))fail('EXPIRES_BEFORE_GENERATED');

  const operations=Array.isArray(value.operations)
    ? value.operations.map((op,i)=>normalizeOperation(op,i))
    : [];
  if(!operations.length||operations.length>20)fail('OP_COUNT_INVALID',String(operations.length));

  const singletonKinds=['english.session','english.exam_score_return','xizong.session','xizong.chat_return','xizong.system_wu_return','politics.memory_plan','exam.chat_plan'];
  for(const kind of singletonKinds){
    if(operations.filter(op=>op.kind===kind).length>1)fail('OP_DUPLICATE',kind);
  }

  const englishSession=operations.find(op=>op.kind==='english.session')?.payload||null;
  const xizongSession=operations.find(op=>op.kind==='xizong.session')?.payload||null;
  const xizongChatReturn=operations.find(op=>op.kind==='xizong.chat_return')?.payload||null;
  const xizongSystemWuReturn=operations.find(op=>op.kind==='xizong.system_wu_return')?.payload||null;
  const politicsMemoryPlan=operations.find(op=>op.kind==='politics.memory_plan')?.payload||null;
  const examPlan=operations.find(op=>op.kind==='exam.chat_plan')?.payload||null;
  const generatedDrills=operations.filter(op=>op.kind==='english.generated_drill').map(op=>op.payload);
  if(englishSession?.study_day&&englishSession.study_day!==studyDay)fail('SESSION_DAY_MISMATCH');
  if(xizongSession?.study_day&&xizongSession.study_day!==studyDay)fail('XIZONG_SESSION_DAY_MISMATCH');
  if(xizongChatReturn?.study_day&&xizongChatReturn.study_day!==studyDay)fail('XIZONG_RETURN_DAY_MISMATCH');
  if(xizongSystemWuReturn?.study_day&&xizongSystemWuReturn.study_day!==studyDay)fail('XIZONG_SYSTEM_RETURN_DAY_MISMATCH');
  if(politicsMemoryPlan?.study_day&&politicsMemoryPlan.study_day!==studyDay)fail('POLITICS_MEMORY_DAY_MISMATCH');
  if(examPlan?.study_day&&examPlan.study_day!==studyDay)fail('PLAN_DAY_MISMATCH');
  if(generatedDrills.some(drill=>drill?.study_day!==studyDay))fail('GENERATED_DRILL_DAY_MISMATCH');
  if(!operations.some(op=>op.kind!=='english.generated_drill'))fail('NO_BROWSER_OPERATION');
  if(englishSession&&examPlan?.subjects?.english?.session_ref){
    if(String(examPlan.subjects.english.session_ref)!==String(englishSession.session_id||'')){
      fail('ENGLISH_SESSION_REF_MISMATCH');
    }
  }
  if(xizongSession&&examPlan?.subjects?.xizong?.session_ref){
    if(String(examPlan.subjects.xizong.session_ref)!==String(xizongSession.session_id||'')){
      fail('XIZONG_SESSION_REF_MISMATCH');
    }
  }
  if(!xizongSession&&xizongChatReturn&&examPlan?.subjects?.xizong?.session_ref){
    if(String(examPlan.subjects.xizong.session_ref)!==String(xizongChatReturn.return_id||'')){
      fail('XIZONG_RETURN_REF_MISMATCH');
    }
  }
  if(!xizongSession&&!xizongChatReturn&&xizongSystemWuReturn&&examPlan?.subjects?.xizong?.session_ref){
    if(String(examPlan.subjects.xizong.session_ref)!==String(xizongSystemWuReturn.return_id||'')){
      fail('XIZONG_SYSTEM_RETURN_REF_MISMATCH');
    }
  }
  if(politicsMemoryPlan&&examPlan?.subjects?.politics?.session_ref){
    if(String(examPlan.subjects.politics.session_ref)!==String(politicsMemoryPlan.plan_id||'')){
      fail('POLITICS_SESSION_REF_MISMATCH');
    }
  }

  return{
    schema:CONTROL_COMMAND_SCHEMA,
    command_id:commandId,
    study_day:studyDay,
    generated_at:new Date(generatedAt).toISOString(),
    expires_at:expiresAt?new Date(expiresAt).toISOString():null,
    operations
  };
}

export function browserControlCommand(command,{commandHash}={}){
  const value=validateControlCommand(command);
  return{
    schema:CONTROL_BROWSER_SCHEMA,
    command_id:value.command_id,
    command_hash:clean(commandHash,128)||null,
    study_day:value.study_day,
    generated_at:value.generated_at,
    expires_at:value.expires_at,
    operations:value.operations
      .filter(op=>op.kind!=='english.generated_drill')
      .map(op=>JSON.parse(JSON.stringify(op)))
  };
}

export function validateBrowserControlCommand(value,expectedDay=null){
  if(!value||typeof value!=='object'||Array.isArray(value))fail('BROWSER_OBJECT_REQUIRED');
  if(value.schema!==CONTROL_BROWSER_SCHEMA)fail('BROWSER_SCHEMA_INVALID');
  const commandId=clean(value.command_id,180);
  if(!/^[A-Za-z0-9._:-]{8,180}$/.test(commandId))fail('ID_INVALID');
  const studyDay=clean(value.study_day,20);
  if(!validDay(studyDay))fail('DAY_INVALID');
  if(expectedDay&&studyDay!==expectedDay)fail('STALE_DAY',studyDay);
  const generatedAt=clean(value.generated_at,80);
  if(!generatedAt||Number.isNaN(Date.parse(generatedAt)))fail('GENERATED_AT_INVALID');
  const expiresAt=value.expires_at?clean(value.expires_at,80):null;
  if(expiresAt&&Number.isNaN(Date.parse(expiresAt)))fail('EXPIRES_AT_INVALID');
  if(expiresAt&&Date.now()>Date.parse(expiresAt))fail('EXPIRED',commandId);
  const operations=Array.isArray(value.operations)
    ? value.operations.map((op,i)=>normalizeOperation(op,i,{browserOnly:true}))
    : [];
  if(!operations.length||operations.length>10)fail('BROWSER_OP_COUNT_INVALID',String(operations.length));
  const singletonKinds=['english.session','english.exam_score_return','xizong.session','xizong.chat_return','xizong.system_wu_return','politics.memory_plan','exam.chat_plan'];
  for(const kind of singletonKinds){
    if(operations.filter(op=>op.kind===kind).length>1)fail('OP_DUPLICATE',kind);
  }
  const englishSession=operations.find(op=>op.kind==='english.session')?.payload||null;
  const xizongSession=operations.find(op=>op.kind==='xizong.session')?.payload||null;
  const xizongChatReturn=operations.find(op=>op.kind==='xizong.chat_return')?.payload||null;
  const xizongSystemWuReturn=operations.find(op=>op.kind==='xizong.system_wu_return')?.payload||null;
  const politicsMemoryPlan=operations.find(op=>op.kind==='politics.memory_plan')?.payload||null;
  const examPlan=operations.find(op=>op.kind==='exam.chat_plan')?.payload||null;
  if(englishSession?.study_day&&englishSession.study_day!==studyDay)fail('SESSION_DAY_MISMATCH');
  if(xizongSession?.study_day&&xizongSession.study_day!==studyDay)fail('XIZONG_SESSION_DAY_MISMATCH');
  if(xizongChatReturn?.study_day&&xizongChatReturn.study_day!==studyDay)fail('XIZONG_RETURN_DAY_MISMATCH');
  if(xizongSystemWuReturn?.study_day&&xizongSystemWuReturn.study_day!==studyDay)fail('XIZONG_SYSTEM_RETURN_DAY_MISMATCH');
  if(politicsMemoryPlan?.study_day&&politicsMemoryPlan.study_day!==studyDay)fail('POLITICS_MEMORY_DAY_MISMATCH');
  if(examPlan?.study_day&&examPlan.study_day!==studyDay)fail('PLAN_DAY_MISMATCH');
  if(englishSession&&examPlan?.subjects?.english?.session_ref
    && String(examPlan.subjects.english.session_ref)!==String(englishSession.session_id||'')){
    fail('ENGLISH_SESSION_REF_MISMATCH');
  }
  if(xizongSession&&examPlan?.subjects?.xizong?.session_ref
    && String(examPlan.subjects.xizong.session_ref)!==String(xizongSession.session_id||'')){
    fail('XIZONG_SESSION_REF_MISMATCH');
  }
  if(!xizongSession&&xizongChatReturn&&examPlan?.subjects?.xizong?.session_ref
    && String(examPlan.subjects.xizong.session_ref)!==String(xizongChatReturn.return_id||'')){
    fail('XIZONG_RETURN_REF_MISMATCH');
  }
  if(!xizongSession&&!xizongChatReturn&&xizongSystemWuReturn&&examPlan?.subjects?.xizong?.session_ref
    && String(examPlan.subjects.xizong.session_ref)!==String(xizongSystemWuReturn.return_id||'')){
    fail('XIZONG_SYSTEM_RETURN_REF_MISMATCH');
  }
  if(politicsMemoryPlan&&examPlan?.subjects?.politics?.session_ref
    && String(examPlan.subjects.politics.session_ref)!==String(politicsMemoryPlan.plan_id||'')){
    fail('POLITICS_SESSION_REF_MISMATCH');
  }
  return{
    schema:CONTROL_BROWSER_SCHEMA,
    command_id:commandId,
    command_hash:clean(value.command_hash,128)||null,
    study_day:studyDay,
    generated_at:new Date(generatedAt).toISOString(),
    expires_at:expiresAt?new Date(expiresAt).toISOString():null,
    operations
  };
}

export function validateControlReceipt(value){
  if(!value||typeof value!=='object'||Array.isArray(value))fail('RECEIPT_OBJECT_REQUIRED');
  if(value.schema!==CONTROL_RECEIPT_SCHEMA)fail('RECEIPT_SCHEMA_INVALID');
  const commandId=clean(value.command_id,180);
  if(!commandId)fail('RECEIPT_ID_REQUIRED');
  const status=clean(value.status,40).toUpperCase();
  if(!['APPLIED','IDEMPOTENT','REJECTED','ERROR'].includes(status))fail('RECEIPT_STATUS_INVALID',status);
  const observedAt=clean(value.observed_at,80);
  if(!observedAt||Number.isNaN(Date.parse(observedAt)))fail('RECEIPT_TIME_INVALID');
  const commandGeneratedAt=value.command_generated_at;
  if(commandGeneratedAt!=null&&Number.isNaN(Date.parse(commandGeneratedAt)))fail('RECEIPT_COMMAND_TIME_INVALID');
  return{
    schema:CONTROL_RECEIPT_SCHEMA,
    command_id:commandId,
    command_hash:clean(value.command_hash,128)||null,
    status,
    ...(commandGeneratedAt!=null?{command_generated_at:new Date(commandGeneratedAt).toISOString()}:{}),
    observed_at:new Date(observedAt).toISOString(),
    error:clean(value.error,1200)||null
  };
}
