import assert from 'node:assert/strict';
import {applyPrivateControlCommand,initPrivateControlRuntime} from '../src/lib/privateControlRuntime.mjs';
import {browserControlCommand,CONTROL_COMMAND_SCHEMA,CONTROL_LOCAL_RECEIPT_KEY} from '../src/lib/privateControlCommand.mjs';
import {buildExamChatPlanBasis,EXAM_CHAT_PLAN_KEY,readExamChatPlanForDisplay,readExamChatPlan} from '../src/lib/examChatPlan.mjs';
import {resumeStudyTimer,pauseStudyTimer} from '../src/lib/studyTimer.mjs';
class Storage {
 constructor(){this.map=new Map();}
 get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);}
}
const day='2026-09-30',t0=Date.parse(day+'T08:33:00+08:00');
const original={now:Date.now,fetch:globalThis.fetch,window:globalThis.window,document:globalThis.document};
const tick=()=>new Promise(r=>setImmediate(r));
let now=t0,failReceipt=false,serverReceipt=null,currentCommand=null;
Date.now=()=>now;
const eventTarget=new EventTarget();
globalThis.window={location:{hostname:'127.0.0.1'},setInterval:()=>1,clearInterval:()=>{},addEventListener:eventTarget.addEventListener.bind(eventTarget),removeEventListener:eventTarget.removeEventListener.bind(eventTarget),dispatchEvent:eventTarget.dispatchEvent.bind(eventTarget)};
globalThis.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
globalThis.fetch=async(url,options={})=>{
 if(String(url).includes('/receipt')){
  if(failReceipt)throw Error('synthetic transport unavailable');
  serverReceipt=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({status:'saved',receipt:serverReceipt})};
 }
 if(String(url).includes('/current'))return {ok:true,status:200,json:async()=>({status:'ready',command:currentCommand,receipt:serverReceipt})};
 return {ok:false,status:404,json:async()=>({})};
};
function command(storage,{expires=false,id='batch-ack-recovery-0001'}={}){
 const generated=new Date(now-1000).toISOString();
 return browserControlCommand({schema:CONTROL_COMMAND_SCHEMA,command_id:id,study_day:day,generated_at:generated,expires_at:expires?new Date(now+1000).toISOString():null,operations:[{kind:'exam.chat_plan',payload:{schema:'kianos.exam.chat-plan.v1',study_day:day,generated_at:generated,learner_evidence_basis:buildExamChatPlanBasis(storage,day),capacity:{state:'UNCERTAIN',summary:'Synthetic whole-day plan',basis:'synthetic missing capacity evidence',recheck:'Only if material reality changes'},subjects:{xizong:{target_minutes:null,role:'主线'},english:null,politics:null},next_subject:'xizong',attention:null,presentation:{today_tasks:[],week_reference:[],schedule_blocks:[{id:'am',subject:'xizong',start:'08:45',end:'10:00',label:'西综'},{id:'pm',subject:'english',start:'14:00',end:'15:00',label:'英语'},{id:'evening',subject:null,start:'20:00',end:'22:00',label:'晚间自由'}]}}}]},{commandHash:'a'.repeat(64)});
}
const results=[];
async function check(name,fn){
 now=t0;failReceipt=false;serverReceipt=null;currentCommand=null;
 try{await fn();results.push({name,pass:true});}
 catch(error){results.push({name,pass:false,error:String(error.message)});}
}
async function poll(){const rt=initPrivateControlRuntime(globalThis.__storage);for(let i=0;i<20;i++)await tick();rt.stop();}
try{
 await check('lost receipt then expiry reconciles historical apply without executing again',async()=>{
  const s=new Storage();globalThis.__storage=s;currentCommand=command(s,{expires:true});failReceipt=true;
  const first=await applyPrivateControlCommand(s,currentCommand);assert.equal(first.status,'applied');assert.equal(first.receipt_saved,false);
  const before=[...s.map];now+=5000;failReceipt=false;await poll();
  assert.equal(serverReceipt?.status,'APPLIED');assert.equal(serverReceipt.command_id,currentCommand.command_id);assert.equal(serverReceipt.command_hash,currentCommand.command_hash);assert.deepEqual([...s.map],before);
 });
 await check('ordinary native pause cannot downgrade an already-applied server receipt',async()=>{
  const s=new Storage();globalThis.__storage=s;resumeStudyTimer(s,{subject:'xizong',route:'/xizong/',detailKey:'circulation',detailLabel:'循环系统'},now);
  currentCommand=command(s);await applyPrivateControlCommand(s,currentCommand);assert.equal(serverReceipt.status,'APPLIED');const plan=s.getItem(EXAM_CHAT_PLAN_KEY);
  now+=60000;pauseStudyTimer(s,now);assert.equal(readExamChatPlan(s,day).status,'stale');assert.equal(readExamChatPlanForDisplay(s,day).status,'reference');await poll();
  assert.equal(serverReceipt.status,'APPLIED');assert.equal(s.getItem(EXAM_CHAT_PLAN_KEY),plan);assert.equal(readExamChatPlan(s,day).status,'stale');
 });
 await check('lost receipt plus pause plus expiry reconciles without refreshing stale basis',async()=>{
  const s=new Storage();globalThis.__storage=s;resumeStudyTimer(s,{subject:'xizong',route:'/xizong/',detailKey:'circulation',detailLabel:'循环系统'},now);
  currentCommand=command(s,{expires:true});failReceipt=true;await applyPrivateControlCommand(s,currentCommand);now+=60000;pauseStudyTimer(s,now);
  const before=[...s.map];failReceipt=false;await poll();assert.equal(serverReceipt.status,'APPLIED');assert.deepEqual([...s.map],before);assert.equal(readExamChatPlan(s,day).status,'stale');
 });
 await check('A then B then changed A is rejected after later identity replaced current',async()=>{
  const s=new Storage();globalThis.__storage=s;
  const a=command(s,{id:'identity-A-0001'});await applyPrivateControlCommand(s,a);now+=10000;
  const b=command(s,{id:'identity-B-0001'});b.command_hash='b'.repeat(64);await applyPrivateControlCommand(s,b);now+=10000;
  const changedA=command(s,{id:'identity-A-0001'});changedA.command_hash='c'.repeat(64);
  const before=[...s.map];await assert.rejects(()=>applyPrivateControlCommand(s,changedA),/COMMAND_ID_CONFLICT/);assert.deepEqual([...s.map],before);
  const restarted=new Storage();for(const [key,value] of s.map)restarted.setItem(key,value);
  await assert.rejects(()=>applyPrivateControlCommand(restarted,changedA),/COMMAND_ID_CONFLICT/);
 });
 await check('lost receipt can reconcile after day changes without reapplying prior day',async()=>{
  const s=new Storage();globalThis.__storage=s;currentCommand=command(s);failReceipt=true;await applyPrivateControlCommand(s,currentCommand);
  const before=[...s.map];now+=86400000;failReceipt=false;await poll();assert.equal(serverReceipt.status,'APPLIED');assert.deepEqual([...s.map],before);
  assert.equal(readExamChatPlan(s,'2026-10-01').plan,null);
 });
 await check('expired unexecuted command still fails closed',async()=>{
  const s=new Storage();globalThis.__storage=s;currentCommand=command(s,{expires:true});now+=5000;await poll();assert.equal(serverReceipt?.status,'REJECTED');assert.equal(s.getItem(EXAM_CHAT_PLAN_KEY),null);assert.equal(s.getItem(CONTROL_LOCAL_RECEIPT_KEY),null);
 });
 await check('receipt alone cannot resurrect or acknowledge missing native effect',async()=>{
  const s=new Storage();globalThis.__storage=s;currentCommand=command(s,{expires:true});await applyPrivateControlCommand(s,currentCommand);s.removeItem(EXAM_CHAT_PLAN_KEY);now+=5000;serverReceipt=null;await poll();assert.equal(serverReceipt?.status,'REJECTED');assert.equal(s.getItem(EXAM_CHAT_PLAN_KEY),null);
 });
}finally{Date.now=original.now;globalThis.fetch=original.fetch;globalThis.window=original.window;globalThis.document=original.document;delete globalThis.__storage;}
console.log(JSON.stringify({synthetic:true,results},null,2));
if(results.some(x=>!x.pass))process.exitCode=1;
