// Real native adapters; only clock, network and exclusive storage are test doubles.
// No production browser, relay, user data or ChatGPT surface is accessed.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {applyPrivateControlCommand} from '../src/lib/privateControlRuntime.mjs';
import {browserControlCommand,validateControlCommand} from '../src/lib/privateControlCommand.mjs';
import {ENGLISH_SESSION_KEY,clearEnglishSessionInstruction,readEnglishSessionInstruction,writeEnglishSessionInstruction} from '../src/lib/englishSessionControl.mjs';
import {saveSharedControlToPrivate,restoreSharedControlFromPrivate} from '../src/lib/privateCheckpointRuntime.mjs';
import {saveEnglishAttempt} from '../src/lib/englishLearnerEvidence.mjs';
import {studyDayAt} from '../src/lib/studyTimer.mjs';
class Storage {
 constructor(){this.map=new Map();}
 get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;} setItem(k,v){this.map.set(k,String(v));} removeItem(k){this.map.delete(k);}
}
const original={fetch:globalThis.fetch,window:globalThis.window,document:globalThis.document,now:Date.now};
let clock=Date.parse('2026-09-29T10:00:00Z'),advanceCatalog=0,loseReceipt=false;
const catalog=[{task:'reading_b',object_id:'qa-control-composition',source_hash:'fixture-source'}];
const json=data=>({ok:true,status:200,json:async()=>data});
globalThis.window={dispatchEvent(){}};
globalThis.document={querySelector(){return null;}};
Date.now=()=>clock;
globalThis.fetch=async(url,options={})=>{
 if(url.includes('/english-session-catalog')){clock+=advanceCatalog;advanceCatalog=0;return json({rows:catalog});}
 if(url.endsWith('/receipt')){if(loseReceipt)throw new Error('fixture lost response');return json({status:'saved',receipt:JSON.parse(options.body)});}
 return json({collections:[],rows:[]});
};
const instruction=(id='qa-session-a',time=clock)=>({schema:'kianos.english.session-instruction.v1',session_id:id,study_day:studyDayAt(time),generated_at:new Date(time).toISOString(),current_step:0,steps:[{step_id:'one',task:'reading_b',object_id:catalog[0].object_id,source_hash:catalog[0].source_hash}],return_policy:{on_finish:'english_home'}});
const command=(id='qa-command-a',session=instruction())=>{
 const source=validateControlCommand({schema:'kianos.control-command.v1',command_id:id,study_day:session.study_day,generated_at:session.generated_at,operations:[{kind:'english.session',payload:session}]});
 return browserControlCommand(source,{commandHash:createHash('sha256').update(JSON.stringify(source)).digest('hex')});
};
const attemptKey='kianos-reading-b-attempt-v1:qa-control-composition';
function addAttempt(storage){
 saveEnglishAttempt(storage,attemptKey,{submitted:false,answers:{},results:{}},{task:'reading_b',object_id:catalog[0].object_id,source_hash:catalog[0].source_hash,semantic_source_hash:'fixture-semantic',snapshot:{question_origin:'CHAT_GENERATED',evidence:{source_kind:'synthetic',calibration_status:'NOT_SCORE_EQUIVALENT'}}},{now:clock});
 return storage.getItem(attemptKey);
}
const reports=[];
async function test(name,run){clock=Date.parse('2026-09-29T10:00:00Z');advanceCatalog=0;loseReceipt=false;try{await run();reports.push({name,pass:true});}catch(e){reports.push({name,pass:false,error:e.message});}}
try{
 await test('lost receipt + explicit clear + retry preserves clear and unfinished work',async()=>{
  const storage=new Storage(),cmd=command();loseReceipt=true;
  const first=await applyPrivateControlCommand(storage,cmd);assert.equal(first.status,'applied');assert.equal(first.receipt_saved,false);
  const attempt=addAttempt(storage);clock+=1000;clearEnglishSessionInstruction(storage,{now:clock});
  loseReceipt=false;await applyPrivateControlCommand(storage,cmd);
  assert.equal(readEnglishSessionInstruction(storage,cmd.study_day).instruction,null,'cleared session must not be reinstalled');
  assert.equal(storage.getItem(attemptKey),attempt,'clear must retain raw unfinished attempt');
 });
 await test('clear + checkpoint save + empty-browser restore preserves clear',async()=>{
  const storage=new Storage(),cmd=command();await applyPrivateControlCommand(storage,cmd);const attempt=addAttempt(storage);
  let checkpoint=null;
  const readCheckpoint=async()=>({status:checkpoint?'ready':'missing',checkpoint});
  const writeCheckpoint=async(value)=>{checkpoint=value;return {status:'saved'};};
  assert.equal((await saveSharedControlToPrivate(storage,{now:clock,readCheckpoint,writeCheckpoint})).status,'saved');
  clock+=1000;clearEnglishSessionInstruction(storage,{now:clock});
  assert.equal((await saveSharedControlToPrivate(storage,{now:clock,readCheckpoint,writeCheckpoint})).status,'saved');
  const restored=new Storage();await restoreSharedControlFromPrivate(restored,{now:clock,readCheckpoint});
  assert.equal(readEnglishSessionInstruction(restored,cmd.study_day).instruction,null,'checkpoint must not repair an intentional clear into existence');
  assert.equal(restored.getItem(attemptKey),attempt);
 });
 await test('clear rejects delayed pre-clear decision but accepts genuinely newer instruction',async()=>{
  const storage=new Storage(),cmd=command();await applyPrivateControlCommand(storage,cmd);
  clock+=1000;const delayed=instruction('qa-delayed',clock);clock+=1000;clearEnglishSessionInstruction(storage,{now:clock});
  assert.throws(()=>writeEnglishSessionInstruction(storage,delayed,cmd.study_day,{catalog,now:clock}),/OLDER|CLEARED/);
  clock+=1000;writeEnglishSessionInstruction(storage,instruction('qa-new'),cmd.study_day,{catalog,now:clock});
  assert.equal(readEnglishSessionInstruction(storage,cmd.study_day).instruction.session_id,'qa-new');
 });
 await test('catalog wait + midnight + no expiry rejects with zero native writes',async()=>{
  clock=Date.parse('2026-09-29T15:59:59Z');const storage=new Storage(),cmd=command();advanceCatalog=2000;
  await assert.rejects(applyPrivateControlCommand(storage,cmd),/STALE/);
  assert.equal(storage.length,0,'yesterday command must be rejected before staging');
 });
}finally{Date.now=original.now;for(const k of ['fetch','window','document']){if(original[k]===undefined)delete globalThis[k];else globalThis[k]=original[k];}}
console.log(JSON.stringify({proof:'real native modules with memory/network/clock doubles; not browser or ordinary-Chat acceptance',reports},null,2));
if(reports.some(x=>!x.pass))process.exitCode=1;
