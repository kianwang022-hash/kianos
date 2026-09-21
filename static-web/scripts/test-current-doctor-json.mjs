// Pre-use machine-readable Current health contract.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
  assert.ok(report.rows.some(row=>row.label==='macOS runtime'&&row.level==='FAIL'));
  assert.ok(report.rows.some(row=>row.label==='Current mirror'&&row.level==='FAIL'));
  assert.ok(report.rows.some(row=>row.label==='Learner site'&&row.level==='FAIL'));
  assert.match(report.base_url,/127\.0\.0\.1:4599/);
  assert.equal(typeof report.generated_at,'string');
  assert.equal(typeof report.started_at,'string');
  console.log('PASS Current doctor JSON: machine-readable degraded report');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
