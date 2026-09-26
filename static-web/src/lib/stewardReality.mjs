import { STUDY_TIMER_TIMEZONE, studyDayAt, buildStudyTimerReadModel } from './studyTimer.mjs';

export const STEWARD_REALITY_SCHEMA = 'kianos.steward-reality.v3';
export const STEWARD_REALITY_LEGACY_SCHEMA = 'kianos.steward-reality.v1';
export const STEWARD_REALITY_KEY = 'kianos-steward-reality-v1';
export const STEWARD_BREAK_DURATIONS = Object.freeze([5, 10, 15]);
export const STEWARD_REENTRY_STATES = Object.freeze(['RESTORED', 'PARTIAL', 'NOT_RESTORED']);
export const STEWARD_BREAK_METHODS = Object.freeze(['walk', 'eyes_closed', 'phone', 'food', 'water']);
const clean = (v, max=500) => typeof v === 'string' ? v.trim().slice(0,max) : '';
const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const copy = v => JSON.parse(JSON.stringify(v));
const finiteTime = v => v == null || v === '' || !Number.isFinite(Number(v)) || Number(v)<0 ? null : Math.round(Number(v));
const unique = v => [...new Set((Array.isArray(v)?v:[]).map(x=>clean(x,120)).filter(Boolean))];
const amount = (v,max=100000) => {
  if (v == null || v === '') return null;
  const n=Number(v); if(!Number.isFinite(n)||n<0||n>max) throw Error('STEWARD_AMOUNT_INVALID'); return n;
};
const dayOf = at => studyDayAt(at, STUDY_TIMER_TIMEZONE);
const slotKey = (day,id) => JSON.stringify([day,id]);
const assertDay = day => { if(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')) throw Error('STEWARD_DAY_INVALID'); return day; };
const identity = v => { const s=clean(v,180); if(!s) throw Error('STEWARD_ID_REQUIRED'); return s; };
const revision = (row,expected) => {
  if(expected !== undefined && expected !== (row?.revision||0)) throw Error('STEWARD_REVISION_CONFLICT');
};
const newId = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()+'-'+Math.random().toString(36).slice(2)}`;
function cleanContext(v) {
  if(!record(v)) return null;
  const c={subject:clean(v.subject,40),route:clean(v.route,240),detailKey:clean(v.detailKey,160),detailLabel:clean(v.detailLabel,160)};
  if(['STUDY','TRAINING','LIFE'].includes(v.activityKind))c.activityKind=v.activityKind;
  if(v.activityId)c.activityId=clean(v.activityId,180);
  return Object.values(c).some(Boolean)?c:null;
}
function cleanBreak(v) {
  if(!record(v)) throw Error('STEWARD_BREAK_INVALID');
  const startedAt=finiteTime(v.startedAt),endedAt=finiteTime(v.endedAt);
  if(startedAt==null || (endedAt!=null && endedAt<startedAt)) throw Error('STEWARD_BREAK_TIME_INVALID');
  const r=v.reentry;
  if(r && (!STEWARD_REENTRY_STATES.includes(r.status)||finiteTime(r.at)==null)) throw Error('STEWARD_REENTRY_INVALID');
  return {id:identity(v.id||`break-${startedAt}`),kind:'BREAK',startedAt,endedAt,
    plannedRestMinutes:STEWARD_BREAK_DURATIONS.includes(v.plannedRestMinutes)?v.plannedRestMinutes:null,
    methods:unique(v.methods).filter(x=>STEWARD_BREAK_METHODS.includes(x)),customMethod:clean(v.customMethod,120),note:clean(v.note),
    preBreakContext:cleanContext(v.preBreakContext),reentry:r?{status:r.status,at:finiteTime(r.at),note:clean(r.note)}:null};
}
function cleanFood(v) {
  if(!record(v)) throw Error('STEWARD_FOOD_INVALID');
  let nutrition=null;
  if(v.nutrition!=null) {
    const n=v.nutrition;
    if(!record(n)||!['PER_100G','PER_UNIT'].includes(n.basis)) throw Error('STEWARD_FOOD_BASIS_INVALID');
    nutrition={basis:n.basis};
    for(const k of ['kcal','protein_g','carb_g','fat_g']) nutrition[k]=amount(n[k]);
  }
  return {foodId:identity(v.foodId),label:identity(v.label),amount:amount(v.amount,10000),unit:identity(v.unit),
    nutrition,gramsPerUnit:amount(v.gramsPerUnit,10000),sourceRevision:clean(v.sourceRevision,180)};
}
function cleanMeal(v) {
  if(!record(v)||!Array.isArray(v.items)||v.items.length>40) throw Error('STEWARD_MEAL_INVALID');
  const observedAt=finiteTime(v.observedAt); if(observedAt==null) throw Error('STEWARD_MEAL_TIME_INVALID');
  const mealId=identity(v.mealId),day=v.studyDay?assertDay(v.studyDay):dayOf(observedAt);
  const status=v.status||'SELECTED';
  if(!['SELECTED','CONFIRMED','SKIPPED'].includes(status)) throw Error('STEWARD_MEAL_STATUS_INVALID');
  return {id:identity(v.id||`meal-${day}-${mealId}`),kind:'MEAL',studyDay:day,observedAt,
    recordedAt:finiteTime(v.recordedAt)??observedAt,mealId,label:identity(v.label),status,ownerRef:clean(v.ownerRef,260),
    planGeneratedAt:clean(v.planGeneratedAt,80),revision:Math.max(0,Number(v.revision)||0),
    uncertain:!!v.uncertain,items:v.items.map(cleanFood),note:clean(v.note),supersedes:clean(v.supersedes,180)||null};
}
const TRAINING_EFFECTS=new Set(['BETTER','SAME','TIRED','LIGHT','APPROPRIATE','HEAVY','SLOW_RECOVERY']);
const TRAINING_STATES=new Set(['RECORDED','COMPLETED','MODIFIED','SKIPPED']);
function cleanExercise(v,draft=false) {
  if(!record(v)) throw Error('STEWARD_EXERCISE_INVALID');
  if(!draft&&!TRAINING_STATES.has(v.status)) throw Error('STEWARD_TRAINING_STATUS_INVALID');
  const setsValue=amount(v.setsValue,100);
  if(setsValue!=null&&!Number.isInteger(setsValue)) throw Error('STEWARD_SETS_INVALID');
  return {exerciseId:identity(v.exerciseId),label:identity(v.label),variantId:clean(v.variantId,120),
    ...(draft?{}:{status:v.status}),loadValue:amount(v.loadValue),loadUnit:clean(v.loadUnit,24),
    setsValue,repsValue:amount(v.repsValue,10000),repsUnit:clean(v.repsUnit,24),rpe:amount(v.rpe,10),note:clean(v.note)};
}
function cleanTraining(v,draft=false) {
  if(!record(v)||!Array.isArray(v.exercises)||v.exercises.length>24) throw Error('STEWARD_TRAINING_INVALID');
  const observedAt=finiteTime(v.observedAt); if(observedAt==null) throw Error('STEWARD_TRAINING_TIME_INVALID');
  const sessionId=identity(v.sessionId),day=v.studyDay?assertDay(v.studyDay):dayOf(observedAt);
  const exercises=v.exercises.map(x=>cleanExercise(x,draft));
  if(new Set(exercises.map(x=>x.exerciseId)).size!==exercises.length) throw Error('STEWARD_EXERCISE_ID_CONFLICT');
  if(v.effect!=null&&!TRAINING_EFFECTS.has(v.effect)) throw Error('STEWARD_EFFECT_INVALID');
  return {id:identity(v.id||`training-${day}-${sessionId}`),kind:'TRAINING',studyDay:day,sessionId,label:identity(v.label),
    observedAt,recordedAt:finiteTime(v.recordedAt)??observedAt,ownerRef:clean(v.ownerRef,260),
    planGeneratedAt:clean(v.planGeneratedAt,80),revision:Math.max(0,Number(v.revision)||0),exercises,
    note:clean(v.note),effect:v.effect||null,workoutRefs:unique(v.workoutRefs),supersedes:clean(v.supersedes,180)||null};
}
function cleanQuick(v) {
  if(!record(v)||!['ENERGY','FOCUS','WATER','COFFEE','NOTE','WEIGHT'].includes(v.type)) throw Error('STEWARD_QUICK_INVALID');
  const observedAt=finiteTime(v.observedAt); if(observedAt==null) throw Error('STEWARD_QUICK_TIME_INVALID');
  const value=['WATER','COFFEE','WEIGHT'].includes(v.type)?amount(v.value):clean(v.value,100);
  const note=clean(v.note);
  if(v.type==='NOTE'&&!note) throw Error('STEWARD_EMPTY_NOTE');
  return {id:identity(v.id),kind:'QUICK',type:v.type,value,unit:clean(v.unit,24),note,observedAt,
    recordedAt:finiteTime(v.recordedAt)??observedAt,context:cleanContext(v.context),revision:Math.max(1,Number(v.revision)||1),
    deletedAt:finiteTime(v.deletedAt),planGeneratedAt:clean(v.planGeneratedAt,80),source:'REPORTED'};
}
function cleanActivity(v) {
  if(!record(v)||!['TRAINING','LIFE'].includes(v.activityKind)||!['RUNNING','PAUSED','ENDED'].includes(v.status)) throw Error('STEWARD_ACTIVITY_INVALID');
  const startedAt=finiteTime(v.startedAt); if(startedAt==null||!Array.isArray(v.segments)) throw Error('STEWARD_ACTIVITY_TIME_INVALID');
  const segments=v.segments.map(x=>{const a=finiteTime(x.startedAt),b=finiteTime(x.endedAt);if(a==null||(b!=null&&b<a))throw Error('STEWARD_ACTIVITY_SEGMENT_INVALID');return {startedAt:a,endedAt:b};});
  if(segments.filter(x=>x.endedAt==null).length>(v.status==='RUNNING'?1:0)) throw Error('STEWARD_ACTIVITY_SEGMENT_INVALID');
  for(let i=1;i<segments.length;i++)if(segments[i-1].endedAt==null||segments[i].startedAt<segments[i-1].endedAt)throw Error('STEWARD_ACTIVITY_OVERLAP');
  return {id:identity(v.id),kind:'ACTIVITY',activityKind:v.activityKind,status:v.status,label:identity(v.label),
    startedAt,endedAt:finiteTime(v.endedAt),sessionId:clean(v.sessionId,120),segments,
    returnHref:/^\/(?!\/)/.test(v.returnHref||'')?v.returnHref:'/steward/'};
}
function cleanEvent(v) {
  if(!record(v)) throw Error('STEWARD_EVENT_INVALID');
  switch(v.kind||'BREAK') {
    case 'BREAK':return cleanBreak(v);case 'MEAL':return cleanMeal(v);case 'TRAINING':return cleanTraining(v);
    case 'QUICK':return cleanQuick(v);case 'ACTIVITY':return cleanActivity(v);default:throw Error('STEWARD_EVENT_KIND_INVALID');
  }
}
const emptyReality=()=>({schema:STEWARD_REALITY_SCHEMA,revision:3,generation:0,events:[],mealDrafts:[],trainingDrafts:[]});
export function validateStewardReality(v) {
  if(!record(v)||![STEWARD_REALITY_SCHEMA,STEWARD_REALITY_LEGACY_SCHEMA,'kianos.steward-reality.v2'].includes(v.schema)||!Array.isArray(v.events)) throw Error('STEWARD_REALITY_SCHEMA_INVALID');
  const events=v.events.map(cleanEvent);
  if(new Set(events.map(x=>x.id)).size!==events.length) throw Error('STEWARD_EVENT_ID_CONFLICT');
  const mealDrafts=(v.mealDrafts||[]).map(cleanMeal),trainingDrafts=(v.trainingDrafts||[]).map(x=>cleanTraining(x,true));
  for(const [rows,key] of [[mealDrafts,'mealId'],[trainingDrafts,'sessionId']]) {
    if(new Set(rows.map(x=>slotKey(x.studyDay,x[key]))).size!==rows.length)throw Error('STEWARD_DRAFT_ID_CONFLICT');
  }
  return {schema:STEWARD_REALITY_SCHEMA,revision:3,generation:Math.max(0,Number(v.generation)||0),events,mealDrafts,trainingDrafts};
}
export function normalizeStewardReality(v) {return v==null?emptyReality():validateStewardReality(v);}
export function readStewardReality(storage) {
  try {
    if(!storage?.getItem) throw Error('STORAGE');
    const raw=storage.getItem(STEWARD_REALITY_KEY);return raw==null?emptyReality():validateStewardReality(JSON.parse(raw));
  } catch {return {...emptyReality(),unavailable:'STEWARD_REALITY_INVALID'};}
}
function writableReality(storage) {const s=readStewardReality(storage);if(s.unavailable)throw Error(s.unavailable);return s;}
function writeStewardReality(storage,value) {
  if(!storage?.setItem||!storage?.getItem)throw Error('STEWARD_STORAGE_UNAVAILABLE');
  const existing=writableReality(storage);
  if(existing.generation!==value.generation)throw Error('STEWARD_REVISION_CONFLICT');
  const normalized=validateStewardReality({...value,generation:existing.generation+1}),bytes=JSON.stringify(normalized);
  storage.setItem(STEWARD_REALITY_KEY,bytes);
  if(storage.getItem(STEWARD_REALITY_KEY)!==bytes)throw Error('STEWARD_SAVE_READBACK_FAILED');
  return normalized;
}

export function latestOpenStewardBreak(storage) {
  const state = readStewardReality(storage);
  return [...state.events].reverse().find(event => event.kind === 'BREAK' && event.endedAt == null) || null;
}

export function beginStewardBreak(storage, {
  startedAt = Date.now(),
  preBreakContext = null
} = {}) {
  const state = writableReality(storage);
  const existing = [...state.events].reverse().find(event => event.kind === 'BREAK' && event.endedAt == null);
  if (existing) return existing;
  const stamp = finiteTime(startedAt) ?? Date.now();
  const event = cleanBreak({
    id: `break-${stamp}-${state.events.length + 1}`,
    startedAt: stamp,
    preBreakContext
  });
  writeStewardReality(storage, { ...state, events: [...state.events, event] });
  return event;
}

export function updateStewardBreak(storage, breakId, patch = {}) {
  const state = writableReality(storage);
  let updated = null;
  const events = state.events.map(event => {
    if (event.kind !== 'BREAK' || event.id !== breakId) return event;
    updated = cleanBreak({
      ...event,
      plannedRestMinutes: patch.plannedRestMinutes === undefined ? event.plannedRestMinutes : patch.plannedRestMinutes,
      methods: patch.methods === undefined ? event.methods : patch.methods,
      customMethod: patch.customMethod === undefined ? event.customMethod : patch.customMethod,
      note: patch.note === undefined ? event.note : patch.note
    });
    return updated;
  });
  if (!updated) return null;
  writeStewardReality(storage, { ...state, events });
  return updated;
}

export function endLatestStewardBreak(storage, endedAt = Date.now()) {
  const state = writableReality(storage);
  const index = state.events.findLastIndex(event => event.kind === 'BREAK' && event.endedAt == null);
  if (index < 0) return null;
  const stamp = finiteTime(endedAt) ?? Date.now();
  const events = [...state.events];
  events[index] = cleanBreak({ ...events[index], endedAt: Math.max(stamp, events[index].startedAt) });
  writeStewardReality(storage, { ...state, events });
  return events[index];
}

export function recordStewardBreakReentry(storage, breakId, {
  status,
  note = '',
  at = Date.now()
} = {}) {
  if (!STEWARD_REENTRY_STATES.includes(status)) throw new Error('STEWARD_REENTRY_STATUS_INVALID');
  const state = writableReality(storage);
  let updated = null;
  const events = state.events.map(event => {
    if (event.id !== breakId || event.endedAt == null) return event;
    updated = cleanBreak({
      ...event,
      reentry: { status, note, at: finiteTime(at) ?? Date.now() }
    });
    return updated;
  });
  if (!updated) return null;
  writeStewardReality(storage, { ...state, events });
  return updated;
}



const eventTime = e => e.startedAt ?? e.observedAt;
function eventsForDay(storage,day,kind,timeZone=STUDY_TIMER_TIMEZONE) {
  const s=readStewardReality(storage);if(s.unavailable)return null;
  return s.events.filter(e=>e.kind===kind&&!e.deletedAt&&(e.studyDay||studyDayAt(eventTime(e),timeZone))===day).sort((a,b)=>eventTime(a)-eventTime(b));
}
const latestEvents = rows => {const superseded=new Set(rows.map(x=>x.supersedes).filter(Boolean));return rows.filter(x=>!superseded.has(x.id));};
export const stewardRealityEventsForDay=(s,d,z)=>eventsForDay(s,d,'BREAK',z);
export const stewardQuickRecordsForDay=(s,d,z)=>eventsForDay(s,d,'QUICK',z);
export const stewardMealHistoryForDay=(s,d,z)=>eventsForDay(s,d,'MEAL',z);
export const stewardMealActualsForDay=(s,d,z)=>{const r=eventsForDay(s,d,'MEAL',z);return r==null?null:latestEvents(r.filter(x=>x.status!=='SELECTED'));};
export const stewardTrainingActualsForDay=(s,d,z)=>{const r=eventsForDay(s,d,'TRAINING',z);return r==null?null:latestEvents(r);};
export function readStewardMealDraft(storage,{studyDay,mealId}={}) {
  const s=writableReality(storage);return s.mealDrafts.find(x=>x.studyDay===studyDay&&x.mealId===mealId)
    || [...s.events].reverse().find(x=>x.kind==='MEAL'&&x.status==='SELECTED'&&x.studyDay===studyDay&&x.mealId===mealId)||null;
}
export function stewardMealSelectionsForDay(storage,day,timeZone=STUDY_TIMER_TIMEZONE) {
  const s=readStewardReality(storage);if(s.unavailable)return null;
  const map=new Map(eventsForDay(storage,day,'MEAL',timeZone).filter(x=>x.status==='SELECTED').map(x=>[x.mealId,x]));
  for(const d of s.mealDrafts.filter(x=>x.studyDay===day))map.set(d.mealId,d);return [...map.values()];
}
export function saveStewardMealDraft(storage,value,{expectedRevision}={}) {
  const s=writableReality(storage),next=cleanMeal({...value,status:'SELECTED'});
  const old=readStewardMealDraft(storage,next);revision(old,expectedRevision);
  next.revision=(old?.revision||0)+1;
  writeStewardReality(storage,{...s,mealDrafts:[...s.mealDrafts.filter(x=>slotKey(x.studyDay,x.mealId)!==slotKey(next.studyDay,next.mealId)),next]});
  return next;
}
export const upsertStewardMealSelection=saveStewardMealDraft;
export function confirmStewardMealDraft(storage,{studyDay,mealId,expectedRevision,confirmedAt=Date.now()}={}) {
  const s=writableReality(storage),d=readStewardMealDraft(storage,{studyDay,mealId});if(!d||!d.items.length)throw Error('STEWARD_MEAL_DRAFT_REQUIRED');
  revision(d,expectedRevision);
  const id=`confirmed-${d.id}-${d.revision}`,existing=s.events.find(x=>x.id===id);if(existing)return existing;
  const old=stewardMealActualsForDay(storage,studyDay).find(x=>x.mealId===mealId);
  const next=cleanMeal({...copy(d),id,status:'CONFIRMED',recordedAt:confirmedAt,observedAt:confirmedAt,supersedes:old?.id});
  writeStewardReality(storage,{...s,events:[...s.events,next]});return next;
}
export function skipStewardMeal(storage,value={}) {
  const s=writableReality(storage),at=value.observedAt??Date.now(),day=value.studyDay||dayOf(at);
  const old=stewardMealActualsForDay(storage,day).find(x=>x.mealId===value.mealId);
  if(old?.status==='SKIPPED')return old;
  const next=cleanMeal({...value,id:newId('skipped'),observedAt:at,studyDay:day,status:'SKIPPED',items:[],supersedes:old?.id});
  writeStewardReality(storage,{...s,events:[...s.events,next]});return next;
}
export function readStewardTrainingDraft(storage,{studyDay,sessionId}={}) {
  return writableReality(storage).trainingDrafts.find(x=>x.studyDay===studyDay&&x.sessionId===sessionId)||null;
}
export function saveStewardTrainingDraft(storage,value,{expectedRevision}={}) {
  const s=writableReality(storage),next=cleanTraining(value,true),old=readStewardTrainingDraft(storage,next);revision(old,expectedRevision);
  next.revision=(old?.revision||0)+1;
  writeStewardReality(storage,{...s,trainingDrafts:[...s.trainingDrafts.filter(x=>slotKey(x.studyDay,x.sessionId)!==slotKey(next.studyDay,next.sessionId)),next]});return next;
}
export function upsertStewardTrainingActual(storage,value,{expectedRevision}={}) {
  const s=writableReality(storage),next=cleanTraining(value),old=stewardTrainingActualsForDay(storage,next.studyDay).find(x=>x.sessionId===next.sessionId);revision(old,expectedRevision);
  for(const ref of next.workoutRefs) {
    if(s.events.some(e=>e.kind==='TRAINING'&&e.sessionId!==next.sessionId&&e.workoutRefs?.includes(ref)))throw Error('STEWARD_WORKOUT_ID_CONFLICT');
  }
  next.revision=(old?.revision||0)+1;next.id=`training-${next.studyDay}-${next.sessionId}-${next.revision}`;next.supersedes=old?.id||null;
  writeStewardReality(storage,{...s,events:[...s.events,next]});return next;
}
export function recordStewardQuickReality(storage,value={}) {
  const s=writableReality(storage),at=value.observedAt??Date.now();
  const next=cleanQuick({...value,id:value.id||newId('quick'),observedAt:at,recordedAt:value.recordedAt??Date.now()});
  const old=s.events.find(x=>x.id===next.id);
  if(old){if(JSON.stringify(old)===JSON.stringify(next))return old;throw Error('STEWARD_EVENT_ID_CONFLICT');}
  writeStewardReality(storage,{...s,events:[...s.events,next]});return next;
}
export function correctStewardQuickReality(storage,id,patch,{expectedRevision}={}) {
  const s=writableReality(storage),old=s.events.find(x=>x.id===id&&x.kind==='QUICK');if(!old)throw Error('STEWARD_EVENT_NOT_FOUND');revision(old,expectedRevision);
  const next=cleanQuick({...old,...patch,id,kind:'QUICK',type:old.type,recordedAt:old.recordedAt,revision:old.revision+1});
  writeStewardReality(storage,{...s,events:s.events.map(x=>x.id===id?next:x)});return next;
}
export function latestActiveStewardActivity(storage) {return [...readStewardReality(storage).events].reverse().find(x=>x.kind==='ACTIVITY'&&x.status!=='ENDED')||null;}
export function stewardActivityElapsedMs(e,now=Date.now()) {return (e?.segments||[]).reduce((n,x)=>n+Math.max(0,Math.min(x.endedAt??now,now)-x.startedAt),0);}
export function beginStewardActivity(storage,{activityKind,label,sessionId='',startedAt=Date.now(),returnHref='/steward/'}={}) {
  const s=writableReality(storage),old=latestActiveStewardActivity(storage);
  if(old){if(old.sessionId===sessionId&&old.activityKind===activityKind)return old;throw Error('STEWARD_ACTIVITY_ALREADY_ACTIVE');}
  const next=cleanActivity({id:newId('activity'),activityKind,label,sessionId,startedAt,returnHref,status:'RUNNING',segments:[{startedAt,endedAt:null}]});
  writeStewardReality(storage,{...s,events:[...s.events,next]});return next;
}
export function transitionStewardActivity(storage,status,now=Date.now()) {
  if(!['RUNNING','PAUSED','ENDED'].includes(status))throw Error('STEWARD_ACTIVITY_STATUS_INVALID');
  const s=writableReality(storage),old=latestActiveStewardActivity(storage);if(!old)return null;if(old.status===status)return old;
  if(now<old.startedAt)throw Error('STEWARD_ACTIVITY_TIME_INVALID');
  const segments=old.segments.map(x=>x.endedAt==null?{...x,endedAt:now}:x);
  if(status==='RUNNING')segments.push({startedAt:now,endedAt:null});
  const next=cleanActivity({...old,status,endedAt:status==='ENDED'?now:null,segments});
  writeStewardReality(storage,{...s,events:s.events.map(x=>x.id===old.id?next:x)});return next;
}
export function readStewardCurrentActivity(storage,{now=Date.now()}={}) {
  const state=readStewardReality(storage),activity=latestActiveStewardActivity(storage),study=buildStudyTimerReadModel(storage,now).active||{};
  if(state.unavailable)return study.subject?{kind:'STUDY',status:study.running?'active':'paused',label:study.context?.detailLabel||study.subject,subject:study.subject,context:study.context,elapsedMs:study.elapsedMs||0,realityUnavailable:true}:{kind:'UNKNOWN',status:'unavailable'};
  if(activity&&study.running)return {kind:'CONFLICT',status:'conflict'};
  if(activity)return {kind:activity.activityKind,status:activity.status==='RUNNING'?'active':'paused',label:activity.label,elapsedMs:stewardActivityElapsedMs(activity,now),event:activity};
  if(study.subject)return {kind:'STUDY',status:study.running?'active':'paused',label:study.context?.detailLabel||study.subject,subject:study.subject,context:study.context,elapsedMs:study.elapsedMs||0};
  return {kind:'UNKNOWN',status:'idle'};
}
export function buildStewardRealityDailySummary(storage,{day,timeZone=STUDY_TIMER_TIMEZONE,now=Date.now()}={}) {
  const s=readStewardReality(storage);
  if(s.unavailable)return {schema:'kianos.steward-reality-summary.v1',study_day:day,breaks:null,meals:null,training:null,quick:null,activities:null,meal_drafts:null,training_drafts:null,error:'STEWARD_REALITY_UNAVAILABLE'};
  const iso=v=>v==null?null:new Date(v).toISOString();
  const before=rows=>rows.filter(x=>eventTime(x)<=now);
  const meals=before(stewardMealActualsForDay(storage,day,timeZone));
  const selections=stewardMealSelectionsForDay(storage,day,timeZone).filter(x=>x.observedAt<=now);
  const mealRow=e=>({id:e.id,meal_id:e.mealId,label:e.label,status:e.status,observed_at:iso(e.observedAt),owner_ref:e.ownerRef||null,plan_generated_at:e.planGeneratedAt||null,uncertain:e.uncertain,items:e.items.map(x=>({food_id:x.foodId,label:x.label,amount:x.amount,unit:x.unit,source_revision:x.sourceRevision||null})),note:e.note||null});
  return {schema:'kianos.steward-reality-summary.v1',study_day:day,
    breaks:before(stewardRealityEventsForDay(storage,day,timeZone)).map(e=>({id:e.id,started_at:iso(e.startedAt),ended_at:iso(e.endedAt),observed_minutes:e.endedAt==null?null:Number(((e.endedAt-e.startedAt)/60000).toFixed(1)),planned_rest_minutes:e.plannedRestMinutes,methods:e.methods,custom_method:e.customMethod||null,note:e.note||null,pre_break_context:e.preBreakContext,reentry:e.reentry?{status:e.reentry.status,note:e.reentry.note||null,observed_at:iso(e.reentry.at)}:null})),
    meals:[...meals,...selections.filter(d=>!meals.some(e=>e.mealId===d.mealId))].map(mealRow),meal_drafts:selections.map(mealRow),
    training:before(stewardTrainingActualsForDay(storage,day,timeZone)).map(e=>({id:e.id,session_id:e.sessionId,label:e.label,observed_at:iso(e.observedAt),owner_ref:e.ownerRef||null,plan_generated_at:e.planGeneratedAt||null,effect:e.effect,note:e.note||null,workout_refs:e.workoutRefs,exercises:e.exercises.map(x=>({exercise_id:x.exerciseId,variant_id:x.variantId||null,label:x.label,status:x.status,load_value:x.loadValue,load_unit:x.loadUnit||null,sets_value:x.setsValue,reps_value:x.repsValue,reps_unit:x.repsUnit||null,rpe:x.rpe}))})),
    training_drafts:s.trainingDrafts.filter(e=>e.studyDay===day&&e.observedAt<=now).map(e=>({session_id:e.sessionId,plan_generated_at:e.planGeneratedAt,status:'DRAFT',exercises:e.exercises.map(x=>({exercise_id:x.exerciseId,variant_id:x.variantId||null}))})),
    quick:before(stewardQuickRecordsForDay(storage,day,timeZone)).map(e=>({id:e.id,type:e.type,value:e.value,unit:e.unit,note:e.note||null,observed_at:iso(e.observedAt),recorded_at:iso(e.recordedAt),context:e.context,source:e.source})),
    activities:before(eventsForDay(storage,day,'ACTIVITY',timeZone)).map(e=>({id:e.id,kind:e.activityKind,label:e.label,status:e.status,started_at:iso(e.startedAt),ended_at:iso(e.endedAt),observed_minutes:Math.round(stewardActivityElapsedMs(e,now)/6000)/10}))};
}
