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

  const getReq=Readable.from([]);
  getReq.url='/__kianos-private/checkpoint';
  getReq.method='GET';
  getReq.socket={remoteAddress:'127.0.0.1'};
  let getBody='';
  const getRes={
    statusCode:0,
    setHeader(){},
    end(value=''){getBody=String(value);}
  };
  await middleware(getReq,getRes,()=>assert.fail('private checkpoint GET must not fall through'));
  assert.equal(getRes.statusCode,200);
  const diagnostic=JSON.parse(getBody);
  assert.equal(diagnostic.status,'ready');
  assert.equal(diagnostic.packet_sync?.state,'error','relay failure must be observable without failing learner save');
  assert.match(diagnostic.packet_sync?.error||'',/synthetic packet relay failure/);
  assert.equal(diagnostic.packet_sync?.busy,false);
  assert.equal(diagnostic.packet_sync?.queued,false);

  console.log('PASS packet bridge: local checkpoint save survives Git relay failure and relay error remains observable');
}finally{
  fs.rmSync(dir,{recursive:true,force:true});
}
