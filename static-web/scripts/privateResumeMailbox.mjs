import { readEnglishSessionInstruction, englishSessionStepHref, englishStepIsComplete } from '../src/lib/englishSessionControl.mjs';
import { readPoliticsSnapshot } from '../src/lib/politicsPracticeState.mjs';
import { preparePrivateSubjectCheckpointRestore } from '../src/lib/privateSubjectCheckpoints.mjs';
import { validatePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';

export const SUBJECT_RESUME_MAILBOX_SCHEMA='kianos.subject-resume-mailbox.v1';

const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const parse=raw=>{try{return typeof raw==='string'?JSON.parse(raw):null;}catch{return null;}};
const clean=(v,n=500)=>String(v??'').trim().slice(0,n);
const safeHref=v=>{const s=clean(v,600);return s.startsWith('/')&&!s.startsWith('//')?s:null;};

class MemoryStorage{
  constructor(entries=[]){this.map=new Map(entries.map(([k,v])=>[String(k),String(v)]));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const objEntries=p=>record(p?.entries)?Object.entries(p.entries).filter(([,v])=>typeof v==='string'):[];
const listEntries=p=>Array.isArray(p?.entries)?p.entries.filter(x=>x&&typeof x.key==='string'&&typeof x.raw==='string').map(x=>[x.key,x.raw]):[];

function pick(v,keys){
  if(!record(v))return null;
  const out={};
  for(const k of keys)if(v[k]!==undefined&&v[k]!==null&&v[k]!=='')out[k]=clone(v[k]);
  return Object.keys(out).length?out:null;
}

function projectXizong(payload){
  const entries=new Map(listEntries(payload));
  const last=parse(entries.get('kianos-xizong-last-location-v1'));
  if(!record(last))return{status:'missing',continuation:null};
  const loc={...(pick(last,['systemId','systemCanonical','systemTitle','blockId','blockSlug','blockLabel','resumeKind','resumeTitle','resumeDetail','resumeStage','resumePosition','resumeAction','updatedAt','updated_at'])||{}),href:safeHref(last.href)};
  const id=clean(last.blockId,200);
  const state=parse(id?entries.get('kianos-xizong-astro-v2:xizong:'+id):null);
  return{status:'ready',continuation:{last_location:loc,block_state:pick(state,['stage','groupIndex','kpIndex','blockRecallDone','completed'])}};
}

const ENGLISH_LAST=['kianos-reading-last-location-v1','kianos-cloze-last-location-v1','kianos-reading-b-last-location-v1','kianos-english-external-reading-last-location-v1','kianos-translation-last-location-v1','kianos-writing-last-location-v1'];
const time=v=>{const s=v?.updatedAt||v?.updated_at||v?.observed_at||v?.saved_at||'';return Number.isNaN(Date.parse(s))?0:Date.parse(s);};

function projectEnglish(payload,day){
  const storage=new MemoryStorage(objEntries(payload));
  const state=readEnglishSessionInstruction(storage,day);
  if(state.status==='ready'&&state.instruction){
    const s=state.instruction;
    for(let i=s.current_step;i<s.steps.length;i++){
      const step=s.steps[i];
      if(englishStepIsComplete(storage,step))continue;
      return{status:'ready',continuation:{session_id:s.session_id,session_generated_at:s.generated_at,step_index:i,step_count:s.steps.length,step:{step_id:step.step_id,task:step.task,object_id:step.object_id,source_hash:step.source_hash||null,label:step.label||null,note:step.note||null,params:clone(step.params||{}),href:englishSessionStepHref(step,'/')}}};
    }
    return{status:'session_complete',continuation:{session_id:s.session_id,session_generated_at:s.generated_at}};
  }
  const recent=ENGLISH_LAST.map(key=>({key,value:parse(storage.getItem(key))})).filter(x=>record(x.value)).sort((a,b)=>time(b.value)-time(a.value))[0];
  if(!recent)return{status:state.status==='invalid'?'invalid':'missing',continuation:null};
  return{status:'recent_only',continuation:{source_key:recent.key,last_location:{...(pick(recent.value,['id','title','paperId','position','total','stage','state','updatedAt','updated_at'])||{}),href:safeHref(recent.value.href)}}};
}

function projectPolitics(payload){
  const snapshot=readPoliticsSnapshot(new MemoryStorage(objEntries(payload)));
  if(snapshot.errors.length)return{status:'invalid',continuation:null};
  const session=record(snapshot.session)?snapshot.session:null;
  const active=session&&['active','paused'].includes(String(session.status||''));
  const last=record(snapshot.last)?{...(pick(snapshot.last,['title','subject','chapter','unitKey','unitId','question_id','updatedAt','updated_at'])||{}),href:safeHref(snapshot.last.href)}:null;
  if(!active&&!last)return{status:'missing',continuation:null};
  return{status:'ready',continuation:{session:active?{id:clean(session.id,240),status:clean(session.status,40),index:Number.isInteger(Number(session.index))?Number(session.index):null,current_question_id:Array.isArray(session.ids)?clean(session.ids[Number(session.index||0)],240)||null:null}:null,last_location:last}};
}

export function buildSubjectResumeMailbox(input,{now=Date.now()}={}){
  const checkpoint=validatePrivateLearnerCheckpoint(input);
  const subjects=checkpoint.payload?.subjects||{};
  preparePrivateSubjectCheckpointRestore(new MemoryStorage(),subjects,{onlyIfEmpty:true});
  return{schema:SUBJECT_RESUME_MAILBOX_SCHEMA,generated_at:checkpoint.generated_at,study_day:checkpoint.study_day,source_checkpoint_id:checkpoint.checkpoint_id,source_generated_at:checkpoint.generated_at,subjects:{xizong:subjects.xizong?projectXizong(subjects.xizong):{status:'missing',continuation:null},english:subjects.english?projectEnglish(subjects.english,checkpoint.study_day):{status:'missing',continuation:null},politics:subjects.politics?projectPolitics(subjects.politics):{status:'missing',continuation:null}}};
}
