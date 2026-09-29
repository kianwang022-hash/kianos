import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { privateLearnerBridge } from './privateLearnerBridge.mjs';
import { readPrivateLearnerCheckpoint } from './privateLearnerStore.mjs';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-packet-bridge-'));
let middleware=null;
let syncCalls=0;
let lastSyncPrivateDir=null;

const plugin=privateLearnerBridge({
  privateDir:dir,
  packetSync:async(options={})=>{
    syncCalls+=1;
    lastSyncPrivateDir=options.privateDir||null;
    throw new Error('synthetic packet relay failure');
  }
});

plugin.configureServer({
  middlewares:{use(fn){middleware=fn;}}
});
assert.equal(typeof middleware,'function');

const checkpoint={
  schema:'kianos.private-checkpoint.v1',
  checkpoint_id:'packet-bridge-proof-1',
  study_day:'2026-09-20',
  generated_at:'2026-09-20T01:00:00.000Z',
  payload:{
    shared:{
      schema:'kianos.shared-control-checkpoint.v1',
      study_day:'2026-09-20',
      captured_at:'2026-09-20T01:00:00.000Z',
      exam_profile:null,
      chat_plan:null,
      study_timer_state:{
        schema:'kianos.study-timer.v2',
        running:false,manualPaused:false,subject:null,context:null,
        segmentStartedAt:null,lastSeenAt:null,revision:0,updatedAt:null
      },
      study_timer_ledger:{schema:'kianos.study-timer.v2',sessions:[]}
    },
    subjects:{}
  }
};

const req=Readable.from([Buffer.from(JSON.stringify(checkpoint))]);
req.url='/__kianos-private/checkpoint';
req.method='PUT';
req.headers={'if-match':'null'};
req.socket={remoteAddress:'127.0.0.1'};

let body='';
const res={
  statusCode:0,
  setHeader(){},
  end(value=''){body=String(value);}
};

try{
  await middleware(req,res,()=>assert.fail('private checkpoint route must not fall through'));
  assert.equal(res.statusCode,200,'Git packet relay failure must not fail learner checkpoint save');
  assert.equal(JSON.parse(body).status,'saved');
  assert.equal(readPrivateLearnerCheckpoint(dir).checkpoint_id,'packet-bridge-proof-1');
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.ok(syncCalls>=2,'server start + successful checkpoint PUT should each schedule packet sync');
  assert.equal(lastSyncPrivateDir,dir,'packet sync must read the exact checkpoint directory owned by the bridge');

  const statusReq=Readable.from([]);
  statusReq.url='/__kianos-private/checkpoint/status';
  statusReq.method='GET';
  statusReq.socket={remoteAddress:'127.0.0.1'};
  let statusBody='';
  const statusRes={statusCode:0,setHeader(){},end(value=''){statusBody=String(value);}};
  await middleware(statusReq,statusRes,()=>assert.fail('packet relay status route must not fall through'));
  assert.equal(statusRes.statusCode,200);
  const status=JSON.parse(statusBody);
  assert.equal(status.status,'ready');
  assert.equal(status.relay.state,'degraded','relay failure must be visible to pre-use health checks');
  assert.match(status.relay.error,/synthetic packet relay failure/);

  console.log('PASS packet bridge: local checkpoint survives Git relay failure and relay health is visible');
}finally{
  fs.rmSync(dir,{recursive:true,force:true});
}

const cadenceDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-packet-cadence-'));
let cadenceMiddleware=null;
let cadenceCalls=0;
let secondResolve=null;
let failNext=false;

const readyResult=(status='published')=>({
  state:'ready',
  status,
  study_day:'2026-09-20',
  learner_evidence_ready:true,
  coverage:{xizong:'attached',english:'attached',politics:'attached'},
  generated_at:'2026-09-20T01:00:00.000Z'
});

const cadencePlugin=privateLearnerBridge({
  privateDir:cadenceDir,
  packetRefreshIntervalMs:80,
  packetRefreshDebounceMs:5,
  packetSync:async(options={})=>{
    cadenceCalls+=1;
    assert.equal(options.privateDir,cadenceDir);
    if(cadenceCalls===2){
      return await new Promise(resolve=>{secondResolve=()=>resolve(readyResult('published'));});
    }
    if(failNext){
      failNext=false;
      throw new Error('synthetic refresh failure');
    }
    return readyResult(cadenceCalls===1?'published':'idempotent');
  }
});
cadencePlugin.configureServer({middlewares:{use(fn){cadenceMiddleware=fn;}}});
assert.equal(typeof cadenceMiddleware,'function');

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const waitFor=async(predicate,{timeout=600,step=5,label='condition'}={})=>{
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){
    if(await predicate())return;
    await sleep(step);
  }
  assert.fail('timeout waiting for '+label);
};
const cadenceStatus=async()=>{
  const request=Readable.from([]);
  request.url='/__kianos-private/checkpoint/status';
  request.method='GET';
  request.headers={};
  request.socket={remoteAddress:'127.0.0.1'};
  let raw='';
  const response={statusCode:0,setHeader(){},end(value=''){raw=String(value);}};
  await cadenceMiddleware(request,response,()=>assert.fail('status route must not fall through'));
  assert.equal(response.statusCode,200);
  return JSON.parse(raw).relay;
};
const cadencePut=async(value,{expected=null,mode='routine'}={})=>{
  const request=Readable.from([Buffer.from(JSON.stringify(value))]);
  request.url='/__kianos-private/checkpoint';
  request.method='PUT';
  request.headers={
    'if-match':JSON.stringify(expected),
    'x-kianos-packet-sync':mode
  };
  request.socket={remoteAddress:'127.0.0.1'};
  let raw='';
  const response={statusCode:0,setHeader(){},end(value=''){raw=String(value);}};
  await cadenceMiddleware(request,response,()=>assert.fail('checkpoint route must not fall through'));
  assert.equal(response.statusCode,200,raw);
  return JSON.parse(raw);
};

try{
  await waitFor(()=>cadenceCalls===1,{label:'initial packet sync'});
  await waitFor(async()=>!(await cadenceStatus()).refreshing,{label:'initial packet completion'});
  let relay=await cadenceStatus();
  assert.equal(relay.state,'ready');
  assert.equal(relay.refreshing,false);
  assert.ok(relay.last_success_at);

  const c1={...checkpoint,checkpoint_id:'packet-cadence-1',generated_at:'2026-09-20T01:01:00.000Z'};
  await cadencePut(c1,{expected:null,mode:'routine'});
  await sleep(20);
  assert.equal(cadenceCalls,1,'routine checkpoint must not immediately start another Git packet refresh');
  relay=await cadenceStatus();
  assert.equal(relay.state,'ready','last-good packet stays usable while routine refresh is scheduled');
  assert.equal(relay.refreshing,false);
  assert.ok(relay.refresh_scheduled_at,'routine refresh must be scheduled, not started immediately');

  const c2={...checkpoint,checkpoint_id:'packet-cadence-2',generated_at:'2026-09-20T01:02:00.000Z'};
  await cadencePut(c2,{expected:'packet-cadence-1',mode:'routine'});
  await waitFor(()=>cadenceCalls===2,{label:'coalesced scheduled packet refresh'});
  relay=await cadenceStatus();
  assert.equal(relay.state,'ready','last-good packet must remain ready during refresh');
  assert.equal(relay.refreshing,true,'in-flight refresh must be visible without downgrading readiness');
  assert.equal(typeof secondResolve,'function');
  secondResolve();
  await waitFor(async()=>!(await cadenceStatus()).refreshing,{label:'second refresh completion'});
  assert.equal(cadenceCalls,2,'multiple routine checkpoint writes coalesce into one scheduled refresh');

  const c3={...checkpoint,checkpoint_id:'packet-cadence-3',generated_at:'2026-09-20T01:03:00.000Z'};
  await cadencePut(c3,{expected:'packet-cadence-2',mode:'immediate'});
  await waitFor(()=>cadenceCalls===3,{label:'immediate packet refresh'});
  relay=await cadenceStatus();
  assert.equal(relay.state,'ready');

  failNext=true;
  const c4={...checkpoint,checkpoint_id:'packet-cadence-4',generated_at:'2026-09-20T01:04:00.000Z'};
  await cadencePut(c4,{expected:'packet-cadence-3',mode:'immediate'});
  await waitFor(async()=>Boolean((await cadenceStatus()).refresh_error),{label:'last-good refresh failure'});
  relay=await cadenceStatus();
  assert.equal(relay.state,'ready','refresh failure must not discard last-good packet');
  assert.equal(relay.refreshing,false);
  assert.match(relay.refresh_error,/synthetic refresh failure/);
  assert.equal(relay.error,null);

  console.log('PASS packet bridge cadence: 5-minute-style routine throttle, coalescing, immediate flush, ready+refreshing and last-good failure safety');
}finally{
  fs.rmSync(cadenceDir,{recursive:true,force:true});
}

