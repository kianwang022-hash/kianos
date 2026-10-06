import fs from 'node:fs';
import vm from 'node:vm';
import * as model from '../src/lib/xizongMemoryModel.mjs';
import * as auto from '../src/lib/xizongMemoryAutoRelease.mjs';
import * as release from '../src/lib/xizongMemoryRelease.mjs';
const base=new URL('../',import.meta.url);
import assert from 'node:assert/strict';
const fixture=fs.readFileSync(new URL('scripts/validate-xizong-memory-auto-release.mjs',base),'utf8');
const learner=vm.runInNewContext(fixture.slice(fixture.indexOf('const learner ='),fixture.indexOf('assert(xizongStudyStorageKey'))+';({learner,validStudy})');
export async function probe(bridgePath,raw=null,personal={kp:{'respiratory-r01-kp01':{marks:[{surface:'CORE',text:'KP1 canonical Core',kind:'important',createdAt:'2026-09-30T00:00:00Z'}]}}},failWrite=false){
 const objectId='xizong:respiratory-r01';
 const storage=new Map([[auto.xizongStudyStorageKey(objectId),JSON.stringify(learner.validStudy)],['kianos-xizong-personal-v1:'+objectId,JSON.stringify(personal)]]);
 if(raw!==null) storage.set(model.XIZONG_MEMORY_STORAGE_KEY,raw);
 const callbacks={};let writes=0;const errors=[];
 const sandbox={...model,...auto,...release,learnerWriterReady:Promise.resolve(),document:{querySelector(s){return s.includes('v6-block')?{getAttribute:()=>objectId}:s.includes('learner-object')?{textContent:JSON.stringify(learner.learner)}:{getAttribute:k=>k==='data-object-id'?objectId:'fixture-source-v1'};}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>{if(failWrite)throw Error('QUOTA_FIXTURE');storage.set(k,v);writes++;}},window:{addEventListener:(name,cb)=>callbacks[name]=cb,dispatchEvent:()=>{}},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail;}},console:{error:e=>errors.push(String(e)),warn:e=>errors.push(String(e))}};
 const source=fs.readFileSync(bridgePath,'utf8').split('<script>')[1].split('</script>')[0].replace(/import\s[\s\S]*?from\s+['"][^'"]+['"];?/g,'');
 vm.runInNewContext(source,sandbox);await Promise.resolve();await Promise.resolve();
 return {storage,callbacks,sandbox,get writes(){return writes},errors,marks:raw===storage.get(model.XIZONG_MEMORY_STORAGE_KEY)?null:JSON.parse(storage.get(model.XIZONG_MEMORY_STORAGE_KEY)||'null')?.marks};
}
const bridge=new URL('src/components/XizongMemoryReleaseBridge.astro',base);
const first=await probe(bridge);
let state=JSON.parse(first.storage.get(model.XIZONG_MEMORY_STORAGE_KEY));
assert.equal(Object.keys(state.marks).length,1,'first completion imports personal mark');
const [id]=Object.keys(state.marks); assert.equal(state.marks[id].personalKind,'important');
const before=JSON.stringify(state), writes=first.writes;
first.callbacks['kianos:xizong-personal-marks'](new first.sandbox.CustomEvent('fixture',{detail:{object_id:'unrelated'}}));
assert.equal(first.writes,writes,'unrelated object cannot write');
first.callbacks['kianos:xizong-block-complete'](new first.sandbox.CustomEvent('fixture',{detail:{object_id:'xizong:respiratory-r01'}}));
assert.equal(first.storage.get(model.XIZONG_MEMORY_STORAGE_KEY),before,'completion idempotent');assert.equal(first.writes,writes);
state=model.addMarkedFragment(state,{id:'memory-only',cardId:'core:respiratory-r01-kp01',surface:'CORE',text:'Memory standalone'},'2026-09-30T00:00:00Z');
state.marks[id].reviewRequested=true;
state=model.appendMemoryEvidence(state,{cardId:'core:respiratory-r01-kp01',rating:'mastered',origin:'SYNTHETIC_BRIDGE_TEST'},'2026-09-30T01:00:00Z');
const evidence=JSON.stringify(state.evidence),attention=JSON.stringify(state.attention);
const same=await probe(bridge,JSON.stringify(state));assert.equal(same.writes,0,'private request preserved');
assert.equal(JSON.parse(same.storage.get(model.XIZONG_MEMORY_STORAGE_KEY)).marks[id].reviewRequested,true);
const removed=await probe(bridge,JSON.stringify(state),{kp:{}});
const after=JSON.parse(removed.storage.get(model.XIZONG_MEMORY_STORAGE_KEY));
assert.ok(!after.marks[id] && after.marks['memory-only'],'unmark only bridge-owned copy');
assert.equal(JSON.stringify(after.evidence),evidence);assert.equal(JSON.stringify(after.attention),attention);
for(const raw of ['{corrupt-private-state','null','[]','{"schema":"future.memory.v99"}','{"marks":[]}','{"evidence":{}}']){
 const broken=await probe(bridge,raw);assert.equal(broken.storage.get(model.XIZONG_MEMORY_STORAGE_KEY),raw);assert.equal(broken.writes,0);assert.ok(broken.errors.length);
}
const quota=await probe(bridge,null,undefined,true);
assert.equal(quota.storage.get(model.XIZONG_MEMORY_STORAGE_KEY),undefined);assert.ok(quota.errors.length);
const reloaded=await probe(bridge,first.storage.get(model.XIZONG_MEMORY_STORAGE_KEY));assert.equal(reloaded.writes,0);
console.log('Memory personal Bridge PASS: first release, idempotence, event scope, unmark ownership, history/attention preserved, corrupt states fail closed, quota failure (synthetic only)');
// Execute the other actual browser writer boundaries, not a duplicated writer.
const interaction=fs.readFileSync(new URL('src/components/XizongKpLearnInteraction.astro',base),'utf8');
const writeOwner=interaction.slice(interaction.indexOf('      const writeMemory ='),interaction.indexOf('      const stageName ='));
for(const raw of ['{broken','null','[]','{"cards":[]}']){
 let writes=0;
 const value=vm.runInNewContext(writeOwner+';writeMemory(createXizongMemoryState());',{
  ...model,localStorage:{getItem:()=>raw,setItem:()=>writes++},console:{error:()=>{}}
 });
 assert.equal(value,false);assert.equal(writes,0,'Prompt edit must not overwrite corruption');
}
const workspace=fs.readFileSync(new URL('src/components/XizongMemoryWorkspace.astro',base),'utf8');
const saveOwner=workspace.slice(workspace.indexOf('    const save = () => {'),workspace.indexOf('    const q = (selector)'));
vm.runInNewContext(`
 let state=createXizongMemoryState(),lastPersistedState=JSON.stringify(state),persisted=lastPersistedState;
 let failWrite=false; const root={dataset:{}};
 const suspend=()=>root.dataset.memoryStateBlocked='true';
 const localStorage={getItem:()=>persisted,setItem:(key,value)=>{if(failWrite)throw Error('quota');persisted=value;}};
 ${saveOwner}
 assert(save()===true); const before=persisted; state.evidence.push({id:'uncommitted'}); failWrite=true;
 assert(save()===false);assert.equal(JSON.stringify(state),before);assert.equal(persisted,before);
 assert(save()===false);
`,{...model,assert,console:{error:()=>{}}});
assert.ok(workspace.includes('const read = () => readXizongMemoryStorage(localStorage)'));
const repair=fs.readFileSync(new URL('src/components/XizongRepairInboxBridge.astro',base),'utf8');
assert.ok(repair.includes('try { memory = readXizongMemoryStorage(localStorage); }'));
console.log('Memory actual Prompt writer corruption gate + Workspace save rollback PASS');
const eventMark={surface:'CORE',text:'KP2 canonical Core',kind:'weak',createdAt:'2026-09-30T02:00:00Z'};
const personalKey='kianos-xizong-personal-v1:xizong:respiratory-r01';
const originalAttention=JSON.stringify(JSON.parse(first.storage.get(model.XIZONG_MEMORY_STORAGE_KEY)).attention);
first.storage.set(personalKey,JSON.stringify({kp:{'respiratory-r01-kp02':{marks:[eventMark]}}}));
first.callbacks['kianos:xizong-personal-marks'](new first.sandbox.CustomEvent('fixture',{detail:{object_id:'xizong:respiratory-r01'}}));
const eventState=JSON.parse(first.storage.get(model.XIZONG_MEMORY_STORAGE_KEY));
assert.equal(Object.keys(eventState.marks).length,1);assert.equal(Object.values(eventState.marks)[0].kpId,'respiratory-r01-kp02');
assert.equal(Object.values(eventState.marks)[0].reviewRequested,false,'weak mark does not manufacture review request');
assert.equal(JSON.stringify(eventState.attention),originalAttention,'post-release mark does not inflate due attention');
console.log('Memory post-release mark/unmark event + no automatic weakness PASS');

// The actual mark handler must protect corrupt nested personal records as well.
const personalOwner=interaction.slice(interaction.indexOf('      const parse ='),interaction.indexOf('      const readMemory ='));
const ensureOwner=interaction.slice(interaction.indexOf('      const ensurePersonalKp ='),interaction.indexOf('      const currentMarks ='));
const toggleOwner=interaction.slice(interaction.indexOf('      const toggleMark ='),interaction.indexOf('      markMenu.querySelectorAll',interaction.indexOf('      const toggleMark =')));
for(const before of ['{broken','null','[]','{"kp":[]}','{"kp":{"fixture-kp":{"marks":{"raw":"retain"}}}}','{"kp":{"fixture-kp":null}}','{}','{"kp":{"fixture-kp":{}}}']) {
 let raw=before,writes=0,events=0;
 vm.runInNewContext(personalOwner+ensureOwner+toggleOwner+";toggleMark('important');",{
  ...model,objectId:'fixture',personalKey:'fixture',studyKey:'study',localStorage:{getItem:()=>raw,setItem:(key,value)=>{raw=value;writes++;}},
  selectionPending:{kpId:'fixture-kp',surface:'CORE',text:'synthetic mark'},markMatches:()=>false,
  window:{dispatchEvent:()=>events++,getSelection:()=>null},CustomEvent:class{},hideMarkMenu:()=>{},refreshUnifiedSurface:()=>{}
 });
 const valid=['{}','{"kp":{"fixture-kp":{}}}'].includes(before);
 assert.equal(writes,valid?1:0);assert.equal(events,valid?1:0);
 if(!valid)assert.equal(raw,before,'nested corruption must retain exact raw bytes');
}
console.log('Actual personal mark handler PASS: six corrupt structures preserved, two legal missing structures initialized');
