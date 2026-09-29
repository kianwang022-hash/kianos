import assert from 'node:assert/strict';
import { initPrivateCheckpointAutosave } from '../src/lib/privateCheckpointRuntime.mjs';

class MemoryStorage {
  constructor(){this.map=new Map();}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const originalFetch=globalThis.fetch;
const originalAdd=globalThis.addEventListener;
const originalRemove=globalThis.removeEventListener;
const originalDocument=Object.getOwnPropertyDescriptor(globalThis,'document');

const listeners=new Map();
globalThis.addEventListener=(type,handler)=>{
  if(!listeners.has(type))listeners.set(type,new Set());
  listeners.get(type).add(handler);
};
globalThis.removeEventListener=(type,handler)=>listeners.get(type)?.delete(handler);

const documentListeners=new Map();
Object.defineProperty(globalThis,'document',{
  configurable:true,
  writable:true,
  value:{
    visibilityState:'visible',
    addEventListener(type,handler){
      if(!documentListeners.has(type))documentListeners.set(type,new Set());
      documentListeners.get(type).add(handler);
    },
    removeEventListener(type,handler){documentListeners.get(type)?.delete(handler);}
  }
});

let puts=0;
const packetSyncHeaders=[];
globalThis.fetch=async(_url,init={})=>{
  const method=String(init.method||'GET').toUpperCase();
  if(method==='GET')return new Response(JSON.stringify({status:'missing',checkpoint:null}),{status:404});
  if(method==='PUT'){
    puts+=1;
    packetSyncHeaders.push(init.headers?.['x-kianos-packet-sync']||null);
    const body=JSON.parse(init.body||'{}');
    return new Response(JSON.stringify({status:'saved',checkpoint_id:body.checkpoint_id}),{status:200});
  }
  throw new Error('unexpected method '+method);
};

try{
  const autosave=initPrivateCheckpointAutosave(new MemoryStorage(),{
    intervalMs:60*60*1000,
    debounceMs:60*60*1000,
    now:()=>Date.parse('2026-09-20T01:00:00.000Z')
  });

  assert.equal(listeners.get('blur')?.size,1,'autosave must listen for window blur');
  for(const handler of [...(listeners.get('blur')||[])])handler();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(puts,1,'leaving KianOS must flush one private checkpoint');
  assert.equal(packetSyncHeaders.at(-1),'routine','blur durability flush must not force an immediate Git Packet push');

  assert.equal(listeners.get('kianos:english-exam-updated')?.size,1,'critical English result event must have an immediate Packet flush listener');
  for(const handler of [...(listeners.get('kianos:english-exam-updated')||[])])handler();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(puts,2,'critical result event must flush a fresh checkpoint');
  assert.equal(packetSyncHeaders.at(-1),'immediate','critical result event must request immediate Packet refresh');

  assert.equal(listeners.get('kianos:private-control-consumed')?.size,1,'applied control receipt must have an immediate Packet flush listener');

  autosave.stop();
  assert.equal(listeners.get('blur')?.size||0,0,'stop must remove blur listener');
  assert.equal(listeners.get('kianos:english-exam-updated')?.size||0,0,'stop must remove immediate result listener');
  assert.equal(listeners.get('kianos:private-control-consumed')?.size||0,0,'stop must remove immediate control listener');
  console.log('PASS private checkpoint cadence: blur is local/routine; critical result/control events request immediate Packet refresh');
}finally{
  globalThis.fetch=originalFetch;
  if(originalAdd===undefined)delete globalThis.addEventListener; else globalThis.addEventListener=originalAdd;
  if(originalRemove===undefined)delete globalThis.removeEventListener; else globalThis.removeEventListener=originalRemove;
  if(originalDocument)Object.defineProperty(globalThis,'document',originalDocument); else delete globalThis.document;
}
