import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as wu from '../src/lib/xizongSystemWuReturn.mjs';
import * as mem from '../src/lib/xizongMemoryModel.mjs';
import { readXizongSystemRepairReturnView } from '../src/lib/xizongSystemRepairReturnView.mjs';
const source=fs.readFileSync(new URL('../src/components/XizongSystemRepairReturn.astro',import.meta.url),'utf8');
const script=source.split('<script>')[1].split('</script>')[0].replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/g,'');
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.handlers={};this.attrs={};this.nodes={};}
 querySelector(selector){return this.nodes[selector]||null;}
 getAttribute(name){return this.attrs[name]||null;}
 append(...nodes){this.children.push(...nodes);}
 appendChild(node){this.children.push(node);}
 replaceChildren(...nodes){this.children=[...nodes];}
 addEventListener(type,fn){this.handlers[type]=fn;}
}
class Storage {
 constructor(){this.data=new Map();this.writes=[];}
 getItem(k){return this.data.get(k)??null;}
 setItem(k,v){this.data.set(k,String(v));this.writes.push(k);}
 removeItem(k){this.data.delete(k);this.writes.push(k);}
 snapshot(){return JSON.stringify([...this.data].sort());}
}
const systemId='synthetic-system';
const questionId='xizong-official-1900-n001'; // synthetic identity only, no question content is read
const now=Date.parse('2026-10-01T00:00:00Z');
const questions=[{questionId,year:1900,number:1,relation:{blockId:'synthetic-block',primaryKpId:'synthetic-kp'}}];
const routes={'synthetic-block':{label:'Synthetic Block',href:'/synthetic/block/'}};
const packet={schema:wu.XIZONG_SYSTEM_WU_RETURN_SCHEMA,return_id:'synthetic-return-1',system_id:systemId,decision:'REPAIR',plan:[{question_id:questionId,status:'wrong',attempt_id:'synthetic-attempt',submitted_at:new Date(now).toISOString(),round_id:'synthetic-round',action:'Synthetic repair only'}]};
function seed(){const storage=new Storage();storage.setItem(`kianos:xizong:system-question-sweep:${systemId}:v1`,JSON.stringify({results:{[questionId]:{status:'wrong',attemptId:'synthetic-attempt',updatedAt:new Date(now).toISOString(),roundId:'synthetic-round'}}}));return storage;}
async function boot(storage){
 const root=new Element();root.attrs={'data-xizong-repair-return':systemId,'data-practice-href':'/synthetic/practice/'};
 for(const s of ['[data-plan-status]','[data-plan-list]','[data-block-routes]','[data-copy-chat]','[data-apply-plan]','[data-plan-text]','[data-return-sweep]'])root.nodes[s]=new Element();
 root.nodes['[data-block-routes]'].textContent=JSON.stringify(routes);
 const payload=new Element();payload.textContent=JSON.stringify({systemId,questions});
 const document={querySelector:s=>s==='[data-xizong-repair-return]'?root:s==='[data-sweep-payload]'?payload:null,createElement:tag=>new Element(tag)};
 const timers=[],events=[];const window={setTimeout:fn=>timers.push(fn),addEventListener:(type,fn)=>events.push({type,fn}),dispatchEvent:()=>{}};
 const SyntheticEvent=class {constructor(type,options){this.type=type;this.detail=options?.detail;}};
 const FixedDate=class extends Date {constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 const sandbox={...wu,readXizongSystemRepairReturnView,document,HTMLElement:Element,localStorage:storage,window,studyDayAt:()=> '2026-10-01',learnerWriterReady:Promise.resolve(),CustomEvent:SyntheticEvent,Date:FixedDate};
 vm.runInNewContext(script,sandbox);await Promise.resolve();while(timers.length)timers.shift()();
 function view(){const texts=[],links=[];function walk(n){if(n.textContent)texts.push(n.textContent);if(n.tag==='a')links.push(n.href);n.children.forEach(walk);}walk(root.nodes['[data-plan-list]']);return {status:root.nodes['[data-plan-status]'].textContent,texts,links};}
 return {root,view,events,emit(detail){for(const e of events)e.fn(new SyntheticEvent(e.type,{detail}));while(timers.length)timers.shift()();}};
}
const resultKey=`kianos:xizong:system-repair-return:${systemId}:v1`;
const checks=[];
function check(name,fn){fn();checks.push(name);}
async function readOnlyBoot(storage){const before=storage.snapshot(),writes=storage.writes.length;const page=await boot(storage);assert.equal(storage.snapshot(),before);assert.equal(storage.writes.length,writes);return page;}
function assertUnknown(page){assert.equal(page.view().links.length,0);assert(page.view().texts.some(text=>text.includes('无法确认对应 Repair')));assert(!page.view().texts.includes('当前未生成 Repair。'));}
const storage=seed();wu.stageXizongSystemWuReturn(storage,packet,{now,studyDay:'2026-10-01'});
const initial=await boot(storage);
check('pending fresh apply creates one link',()=>assert.deepEqual(initial.view().links,['/synthetic/block/']));
check('pending is consumed',()=>assert.equal(wu.readXizongSystemWuPendingState(storage).pending_by_system[systemId],undefined));
const memory=mem.readXizongMemoryStorage(storage),activeSnapshot=storage.snapshot();
const reload=await readOnlyBoot(storage);
check('saved active return reload preserves link without writes',()=>{assert.deepEqual(reload.view().links,initial.view().links);assert.equal(memory.repairTasks[0].status,'ACTIVE');assert(!reload.view().texts.includes('当前未生成 Repair。'));});
reload.emit({fresh:true,target:'xizong.system_wu_return',status:'APPLIED'});
check('private-control consumed without pending does not replay or erase display',()=>{assert.deepEqual(reload.view().links,initial.view().links);assert.equal(storage.snapshot(),activeSnapshot);});
const manualStorage=seed(),manual=await boot(manualStorage);manual.root.nodes['[data-plan-text]'].value=JSON.stringify(packet);manual.root.nodes['[data-apply-plan]'].handlers.click();
check('manual fallback fresh apply creates link',()=>assert.equal(manual.view().links.length,1));
const manualReload=await readOnlyBoot(manualStorage);
check('manual fallback reload preserves link',()=>assert.deepEqual(manualReload.view().links,manual.view().links));
const completed=mem.completeRepairTask(memory,memory.repairTasks[0].id,new Date(now+1000).toISOString());storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(completed));
const completedView=await readOnlyBoot(storage);
check('completed task is displayed complete and never reopened',()=>{assert.equal(completedView.view().links.length,0);assert(completedView.view().texts.some(text=>text.includes('Repair 已完成')));assert.equal(mem.readXizongMemoryStorage(storage).repairTasks[0].status,'DONE');});
const replacement={...memory.repairTasks[0],createdAt:new Date(now+2000).toISOString(),status:'ACTIVE'};
storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(mem.setRepairTasks(memory,[replacement])));
const replaced=await readOnlyBoot(storage);
check('same id and question but newer creation occurrence stays unconfirmed',()=>assertUnknown(replaced));
const differentQuestion={...memory.repairTasks[0],sourceQuestionIds:['xizong-official-1900-n002']};
storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(mem.setRepairTasks(memory,[differentQuestion])));
const wrongMembership=await readOnlyBoot(storage);
check('same receipt occurrence without source question membership stays unconfirmed',()=>assertUnknown(wrongMembership));
for(const [name,value] of [['removed task',JSON.stringify(mem.setRepairTasks(memory,[]))],['corrupt memory','{'],['wrong memory schema',JSON.stringify({...memory,schema:'other'})],['invalid task array',JSON.stringify({...memory,repairTasks:{}})]]){
 storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,value);const page=await readOnlyBoot(storage);check(name+' preserves diagnosis without a false not-created claim',()=>assertUnknown(page));
}
storage.removeItem(mem.XIZONG_MEMORY_STORAGE_KEY);const missingMemory=await readOnlyBoot(storage);check('missing memory stays unconfirmed',()=>assertUnknown(missingMemory));
storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(memory));
const saved=JSON.parse(storage.getItem(resultKey));
for(const [name,record] of [['missing receipt',{...saved,receipt:null}],['foreign receipt',{...saved,receipt:{...saved.receipt,return_id:'other'}}],['missing created_at',{...saved,receipt:{...saved.receipt,repair_tasks:saved.receipt.repair_tasks.map(task=>({...task,created_at:''}))}}]]){
 storage.setItem(resultKey,JSON.stringify(record));const page=await readOnlyBoot(storage);check(name+' cannot promote a current task to this saved return',()=>assertUnknown(page));
}
storage.setItem(resultKey,JSON.stringify(saved));
const alteredMemory={...memory,repairTasks:memory.repairTasks.map(task=>({...task,diagnosticAxis:'OTHER'}))};storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify(alteredMemory));const wrongAxis=await readOnlyBoot(storage);check('different diagnostic axis stays unconfirmed',()=>assertUnknown(wrongAxis));
for (const [name,tasks] of [['missing native link',[{...memory.repairTasks[0],blockHref:''}]],['ambiguous duplicated task',[memory.repairTasks[0],memory.repairTasks[0]]],['invalid null task',[null]]]) {
 storage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,JSON.stringify({...memory,repairTasks:tasks}));const page=await readOnlyBoot(storage);check(name+' stays unconfirmed',()=>assertUnknown(page));
}
check('unavailable storage is reported unreadable',()=>assert.equal(readXizongSystemRepairReturnView({getItem(){throw new Error('denied');}},systemId).kind,'unreadable'));
storage.setItem(resultKey,'{');const corruptSaved=await readOnlyBoot(storage);check('corrupt saved return is explicit and does not mutate',()=>{assert(corruptSaved.view().status.includes('无法安全读取'));assert.equal(corruptSaved.view().links.length,0);});
storage.setItem(resultKey,JSON.stringify({...saved,return_id:'wrong-id'}));const badIdentity=await readOnlyBoot(storage);check('saved return identity mismatch is explicit',()=>assert(badIdentity.view().status.includes('无法安全读取')));
const unmappedStorage=seed();wu.applyXizongSystemWuReturn(unmappedStorage,packet,{questions:[{...questions[0],relation:null}],routes,now});const unmappedPage=await readOnlyBoot(unmappedStorage);check('unmapped remains explicitly unmapped',()=>{assert(unmappedPage.view().texts.some(text=>text.includes('没有审核过的精确')));assert.equal(unmappedPage.view().links.length,0);});
unmappedStorage.setItem(mem.XIZONG_MEMORY_STORAGE_KEY,'{');const unmappedCorrupt=await readOnlyBoot(unmappedStorage);check('proven unmapped remains readable when independent memory is corrupt',()=>assert(unmappedCorrupt.view().texts.some(text=>text.includes('没有审核过的精确'))));
const noActionStorage=seed();wu.applyXizongSystemWuReturn(noActionStorage,{...packet,return_id:'none',decision:'NO_ACTION',plan:[]},{questions,routes,now});const noAction=await readOnlyBoot(noActionStorage);check('saved NO_ACTION is retained honestly',()=>assert(noAction.view().status.includes('无需建立 Repair')));
const freshStorage=seed();const fresh=await readOnlyBoot(freshStorage);check('no saved return remains a nonmutating first visit',()=>assert.equal(fresh.view().links.length,0));
// Advancing actual evidence is irrelevant to read-only history hydration.
manualStorage.setItem(`kianos:xizong:system-question-sweep:${systemId}:v1`,JSON.stringify({results:{[questionId]:{status:'stable'}}}));const advanced=await readOnlyBoot(manualStorage);check('advanced attempt evidence does not trigger stale replay or reopen debt',()=>assert.equal(advanced.view().links.length,1));
console.log(JSON.stringify({suite:'saved System W/U Return read-only resume',passed:checks.length,checks,limits:'Synthetic actual component script + native modules, not browser geometry or real learner evidence'},null,2));
