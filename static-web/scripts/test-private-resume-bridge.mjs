import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { privateLearnerBridge } from './privateLearnerBridge.mjs';
import { readPrivateLearnerCheckpoint } from './privateLearnerStore.mjs';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-resume-bridge-'));
let middleware=null;
let syncCalls=0;

const plugin=privateLearnerBridge({
  privateDir:dir,
  resumeSync:async()=>{
    syncCalls+=1;
    throw new Error('synthetic resume transport failure');
  }
});

plugin.configureServer({
  middlewares:{use(fn){middleware=fn;}}
});
assert.equal(typeof middleware,'function');

const checkpoint={
  schema:'kianos.private-checkpoint.v1',
  checkpoint_id:'bridge-proof-1',
  study_day:'2026-09-20',
  generated_at:'2026-09-20T01:00:00.000Z',
  payload:{shared:{},subjects:{}}
};

const req=Readable.from([Buffer.from(JSON.stringify(checkpoint))]);
req.url='/__kianos-private/checkpoint';
req.method='PUT';
req.socket={remoteAddress:'127.0.0.1'};

const headers={};
let body='';
const res={
  statusCode:0,
  setHeader(k,v){headers[String(k).toLowerCase()]=v;},
  end(value=''){body=String(value);}
};

try{
  await middleware(req,res,()=>assert.fail('private checkpoint route must not fall through'));
  assert.equal(res.statusCode,200,'Resume relay failure must not fail learner checkpoint PUT');
  assert.equal(JSON.parse(body).status,'saved');
  assert.equal(readPrivateLearnerCheckpoint(dir).checkpoint_id,'bridge-proof-1');
  await new Promise(resolve=>setTimeout(resolve,20));
  assert.ok(syncCalls>=2,'server start + successful PUT must each schedule Resume sync');
  console.log('PASS private Resume bridge: checkpoint save survives relay failure and schedules background sync');
}finally{
  fs.rmSync(dir,{recursive:true,force:true});
}
