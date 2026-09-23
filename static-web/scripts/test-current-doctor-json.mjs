// Pre-use machine-readable Current health contract.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-doctor-json-'));
try{
  const run=spawnSync(process.execPath,['scripts/kianos-current-doctor.mjs','--json'],{
    cwd:process.cwd(),
    env:{
      ...process.env,
      HOME:temp,
      KIANOS_CURRENT_DIR:path.join(temp,'missing-current'),
      KIANOS_PRIVATE_DIR:path.join(temp,'missing-private'),
      KIANOS_PORT:'4599'
    },
    encoding:'utf8'
  });

  assert.equal(run.status,1,'non-macOS/missing runtime fixture must report not-ready');
  const out=String(run.stdout||'').trim();
  assert.ok(out.startsWith('{')&&out.endsWith('}'),'doctor --json must emit one JSON object on stdout');
  const report=JSON.parse(out);
  assert.equal(report.schema,'kianos.current-doctor.v1');
  assert.equal(report.ready,false);
  assert.ok(Array.isArray(report.rows)&&report.rows.length>0);
  assert.ok(report.rows.some(row=>row.label==='macOS runtime'&&row.level===(process.platform==='darwin'?'PASS':'FAIL')));
  assert.equal(report.transport_ready,false);
  assert.equal(report.learner_evidence_ready,false);
  assert.ok(report.rows.some(row=>row.label==='Current mirror'&&row.level==='FAIL'));
  assert.ok(report.rows.some(row=>row.label==='Learner site'&&row.level==='FAIL'));
  assert.match(report.base_url,/127\.0\.0\.1:4599/);
  assert.equal(typeof report.generated_at,'string');
  assert.equal(typeof report.started_at,'string');
  console.log('PASS Current doctor JSON: machine-readable degraded report');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}

// A relay success cannot hide missing evidence or a previous study day.
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let relay;
const server=http.createServer((req,res)=>{
  let body={};
  if(req.url.startsWith('/__kianos-current.json'))body={state:'synced'};
  else if(req.url==='/__kianos-private/checkpoint')body={status:'ready'};
  else if(req.url==='/__kianos-private/checkpoint/status')body={status:'ready',relay};
  else if(req.url==='/__kianos-private/control/status')body={status:'ready',relay:{state:'ready'}};
  else if(req.url==='/__kianos-private/external-reading/status')body={status:'ready'};
  res.setHeader('content-type','application/json');res.end(JSON.stringify(body));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
  for(const [basis,day,expected] of [[false,today,false],[true,'2000-01-01',false],[true,today,true]]){
    relay={state:'ready',status:'idempotent',study_day:day,learner_evidence_ready:basis,coverage:{xizong:basis?'attached':'unavailable',english:'attached',politics:'attached'}};
    const report=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,['scripts/kianos-current-doctor.mjs','--json'],{env:{...process.env,KIANOS_CURRENT_DIR:path.join(temp,'missing'),KIANOS_PRIVATE_DIR:path.join(temp,'private'),KIANOS_PORT:String(server.address().port)}});
      let out='';child.stdout.on('data',x=>out+=x);child.on('error',reject);child.on('exit',()=>{try{resolve(JSON.parse(out));}catch(e){reject(e);}});
    });
    assert.equal(report.learner_evidence_ready,expected);
    assert.equal(report.rows.find(row=>row.label==='Daily Learning Packet relay').level,'PASS');
    assert.equal(report.rows.find(row=>row.label==='Learner evidence for current-day planning').level,expected?'PASS':'WARN');
  }
  console.log('PASS Current doctor distinguishes transport, partial evidence and stale day');
} finally { await new Promise(resolve=>server.close(resolve)); }
