const EXTERNAL_SCHEMA='kianos.english.external_reading_object.v2';
export const EXTERNAL_READING_SCHEMA=EXTERNAL_SCHEMA;
export const EXTERNAL_READING_INDEX_KEY='kianos-external-reading-index-v1';
export const EXTERNAL_READING_OBJECT_PREFIX='kianos-external-reading-object-v1:';
export const EXTERNAL_READING_ATTEMPT_PREFIX='kianos-external-reading-attempt-v1:';
export const EXTERNAL_READING_LAST_LOCATION_KEY='kianos-external-reading-last-location-v1';

const SOURCE_KINDS=new Set(['TPO_READING','IELTS_READING','PERIODICAL_READING','OTHER_READING']);
const SOURCE_FORMATS=new Set(['TOEFL_LEGACY','IELTS_ACADEMIC','ARTICLE','OTHER']);
const ROLES=new Set(['READING_GROWTH','TOEFL_PREP_BRIDGE','ORDINARY_PRACTICE']);
const INTERACTIONS=new Set(['SINGLE_CHOICE','MULTI_CHOICE','TEXT','UNSUPPORTED_SOURCE_NATIVE']);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clean=(v,max=2000)=>String(v??'').trim().slice(0,max);

function stableJson(value){
  if(value===null||typeof value!=='object')return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(stableJson).join(',')+']';
  return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableJson(value[k])).join(',')+'}';
}
function inferredFormat(kind){
  if(kind==='TPO_READING')return 'TOEFL_LEGACY';
  if(kind==='IELTS_READING')return 'IELTS_ACADEMIC';
  if(kind==='PERIODICAL_READING')return 'ARTICLE';
  return 'OTHER';
}
function readJson(storage,key,fallback=null){
  const raw=storage?.getItem?.(key);
  if(raw==null)return clone(fallback);
  try{return JSON.parse(raw);}catch{throw new Error('EXTERNAL_READING_PRIVATE_DATA_UNREADABLE:'+key);}
}
function normalizeParagraphs(value){
  const rows=Array.isArray(value)?value:[];
  const out=rows.map((row,index)=>{
    if(typeof row==='string')return{id:'p'+(index+1),text:clean(row,30000)};
    return{id:clean(row?.id||row?.paragraph_id||('p'+(index+1)),160),text:clean(row?.text,30000)};
  }).filter(row=>row.id&&row.text);
  if(!out.length)throw new Error('EXTERNAL_READING_PARAGRAPHS_REQUIRED');
  if(new Set(out.map(r=>r.id)).size!==out.length)throw new Error('EXTERNAL_READING_PARAGRAPH_ID_DUPLICATE');
  return out;
}
function normalizeAnswer(value){
  if(value==null)return null;
  if(Array.isArray(value))return value.map(v=>clean(v,500)).filter(Boolean);
  return clean(value,500);
}
function normalizeQuestion(row,index){
  const id=clean(row?.id||row?.question_id||('q'+(index+1)),180);
  const prompt=clean(row?.prompt||row?.question,6000);
  if(!id||!prompt)throw new Error('EXTERNAL_READING_QUESTION_INVALID:'+(index+1));
  const options=row?.options&&typeof row.options==='object'&&!Array.isArray(row.options)
    ? Object.fromEntries(Object.entries(row.options).map(([k,v])=>[clean(k,40),clean(v,4000)]).filter(([k,v])=>k&&v))
    : {};
  const answer=normalizeAnswer(row?.answer);
  let interaction=clean(row?.interaction,80).toUpperCase();
  if(!interaction){
    if(Object.keys(options).length)interaction=Array.isArray(answer)&&answer.length>1?'MULTI_CHOICE':'SINGLE_CHOICE';
    else interaction=answer!=null?'TEXT':'UNSUPPORTED_SOURCE_NATIVE';
  }
  if(!INTERACTIONS.has(interaction))throw new Error('EXTERNAL_READING_INTERACTION_UNSUPPORTED:'+interaction);
  if(['SINGLE_CHOICE','MULTI_CHOICE'].includes(interaction)&&Object.keys(options).length<2){
    throw new Error('EXTERNAL_READING_OPTIONS_REQUIRED:'+id);
  }
  return{
    id,
    ordinal:Number.isFinite(Number(row?.ordinal))?Number(row.ordinal):index+1,
    prompt,
    interaction,
    options,
    answer,
    source_question_type:clean(row?.source_question_type||row?.type,160)||null,
    note:clean(row?.note,1000)||null
  };
}
export function normalizeExternalReadingObject(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('EXTERNAL_READING_OBJECT_REQUIRED');
  const objectId=clean(value.object_id||value.objectId,240);
  if(!objectId||!/^[A-Za-z0-9._:-]+$/.test(objectId))throw new Error('EXTERNAL_READING_OBJECT_ID_INVALID');
  const source=value.source&&typeof value.source==='object'&&!Array.isArray(value.source)?value.source:{};
  const kind=clean(source.kind,80).toUpperCase();
  if(!SOURCE_KINDS.has(kind))throw new Error('EXTERNAL_READING_SOURCE_KIND_INVALID:'+kind);
  const sourceId=clean(source.source_id||source.sourceId,300);
  if(!sourceId)throw new Error('EXTERNAL_READING_SOURCE_ID_REQUIRED');
  const format=clean(source.format||inferredFormat(kind),80).toUpperCase();
  if(!SOURCE_FORMATS.has(format))throw new Error('EXTERNAL_READING_SOURCE_FORMAT_INVALID:'+format);
  const role=clean(value.role||'READING_GROWTH',80).toUpperCase();
  if(!ROLES.has(role))throw new Error('EXTERNAL_READING_ROLE_INVALID:'+role);
  const paragraphs=normalizeParagraphs(value.content?.paragraphs??value.paragraphs);
  const questions=(Array.isArray(value.questions)?value.questions:[]).map(normalizeQuestion);
  if(new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('EXTERNAL_READING_QUESTION_ID_DUPLICATE');
  return{
    schema:EXTERNAL_SCHEMA,
    object_id:objectId,
    source:{
      kind,
      source_id:sourceId,
      format,
      title:clean(source.title,500)||null,
      publication:clean(source.publication,300)||null,
      published_at:clean(source.published_at||source.publishedAt,80)||null,
      locator:clean(source.locator,1200)||null
    },
    role,
    content:{
      title:clean(value.content?.title||value.title||source.title,500)||null,
      paragraphs
    },
    questions,
    study_note:clean(value.study_note||value.studyNote,1200)||null
  };
}
export async function externalReadingSourceHash(value){
  const normalized=normalizeExternalReadingObject(value);
  const bytes=new TextEncoder().encode(stableJson(normalized));
  if(!globalThis.crypto?.subtle)throw new Error('EXTERNAL_READING_CRYPTO_UNAVAILABLE');
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
}
export function externalReadingObjectKey(objectId){return EXTERNAL_READING_OBJECT_PREFIX+String(objectId||'');}
export function externalReadingAttemptKey(objectId){return EXTERNAL_READING_ATTEMPT_PREFIX+String(objectId||'');}

export function listExternalReadingImports(storage){
  const index=readJson(storage,EXTERNAL_READING_INDEX_KEY,{schema:'kianos.english.external-reading-index.v1',items:[]});
  if(index?.schema!=='kianos.english.external-reading-index.v1'||!Array.isArray(index.items))throw new Error('EXTERNAL_READING_INDEX_INVALID');
  return index.items.map(clone);
}
export function readExternalReadingImport(storage,objectId){
  const record=readJson(storage,externalReadingObjectKey(objectId));
  if(!record)return null;
  if(record.schema!=='kianos.english.external-reading-import.v1'||!record.object||!record.source_hash)throw new Error('EXTERNAL_READING_IMPORT_RECORD_INVALID');
  return clone(record);
}
export async function importExternalReadingObject(storage,input,{now=Date.now()}={}){
  if(!storage?.getItem||!storage?.setItem)throw new Error('EXTERNAL_READING_STORAGE_UNAVAILABLE');
  const value=typeof input==='string'?JSON.parse(input):input;
  const object=normalizeExternalReadingObject(value);
  const sourceHash=await externalReadingSourceHash(object);
  const key=externalReadingObjectKey(object.object_id);
  const existing=readExternalReadingImport(storage,object.object_id);
  if(existing&&existing.source_hash!==sourceHash)throw new Error('EXTERNAL_READING_ID_ALREADY_BOUND_IMPORT_NEW_ID:'+object.object_id);
  const importedAt=existing?.imported_at||new Date(now).toISOString();
  const record={schema:'kianos.english.external-reading-import.v1',object,source_hash:sourceHash,imported_at:importedAt};
  const index=readJson(storage,EXTERNAL_READING_INDEX_KEY,{schema:'kianos.english.external-reading-index.v1',items:[]});
  if(index?.schema!=='kianos.english.external-reading-index.v1'||!Array.isArray(index.items))throw new Error('EXTERNAL_READING_INDEX_INVALID');
  const item={
    object_id:object.object_id,
    source_hash:sourceHash,
    title:object.content.title||object.source.title||object.source.source_id,
    source:object.source,
    role:object.role,
    question_count:object.questions.length,
    imported_at:importedAt
  };
  const nextItems=index.items.filter(row=>row?.object_id!==object.object_id);
  nextItems.push(item);
  nextItems.sort((a,b)=>String(a.imported_at).localeCompare(String(b.imported_at)));
  const previousKey=storage.getItem(key), previousIndex=storage.getItem(EXTERNAL_READING_INDEX_KEY);
  try{
    storage.setItem(key,JSON.stringify(record));
    storage.setItem(EXTERNAL_READING_INDEX_KEY,JSON.stringify({schema:'kianos.english.external-reading-index.v1',items:nextItems}));
  }catch(error){
    try{if(previousKey==null)storage.removeItem(key);else storage.setItem(key,previousKey);}catch{}
    try{if(previousIndex==null)storage.removeItem(EXTERNAL_READING_INDEX_KEY);else storage.setItem(EXTERNAL_READING_INDEX_KEY,previousIndex);}catch{}
    throw error;
  }
  return clone(record);
}
export function externalReadingSessionCatalog(storage){
  return listExternalReadingImports(storage).map(row=>({
    task:'external_reading',
    object_id:row.object_id,
    source_hash:row.source_hash,
    label:row.title,
    source_kind:row.source?.kind||null
  }));
}
export function externalReadingSnapshot(record){
  const object=record?.object;
  if(!object)return null;
  return{
    paragraphs:clone(object.content?.paragraphs||[]),
    questions:(object.questions||[]).map(({id,ordinal,prompt,interaction,options,source_question_type})=>({id,ordinal,prompt,interaction,options,source_question_type})),
    source:{kind:object.source?.kind,source_id:object.source?.source_id,format:object.source?.format,title:object.source?.title},
    role:object.role
  };
}
