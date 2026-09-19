import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { localPacketSyncDecision, publishDailyLearningPacket } from './privateDailyLearningPacketRelay.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-packet-relay-'));
const remote=path.join(temp,'personal-remote.git');
const repoDir=path.join(temp,'relay-repo');
const branch='runtime/kianos-learning';
const currentPath='runtime/kianos-learning/current.json';
const dailyPrefix='runtime/kianos-learning/daily';

const packet=(day,generated,total,x=0,e=0,p=0)=>({
  schema:'kianos.daily-learning-packet.v1',
  study_day:day,
  timezone:'Asia/Shanghai',
  generated_at:generated,
  total_minutes:total,
  timer:{running:false,active_subject:null,review_candidates:[]},
  control:null,
  schedule:null,
  subjects:{
    xizong:{time:{minutes:x,details:[]},plan:null,evidence:null},
    english:{time:{minutes:e,details:[]},plan:null,evidence:null},
    politics:{time:{minutes:p,details:[]},plan:null,evidence:null}
  }
});

try{
  execFileSync('git',['init','--bare',remote]);
  const env={
    ...process.env,
    KIANOS_PACKET_REPO_URL:remote,
    KIANOS_PACKET_REPO_DIR:repoDir,
    KIANOS_PACKET_BRANCH:branch,
    KIANOS_PACKET_CURRENT_PATH:currentPath,
    KIANOS_PACKET_DAILY_PREFIX:dailyPrefix
  };

  const d1a=packet('2026-09-20','2026-09-20T01:00:00.000Z',30,30,0,0);

  const firstDecision=localPacketSyncDecision(d1a,{prior:null,timeOnlySyncMs:5*60*1000});
  assert.equal(firstDecision.defer,false);
  const localPrior={
    study_day:d1a.study_day,
    semantic:firstDecision.semantic,
    last_remote_attempt_at:Date.parse(d1a.generated_at)
  };
  const localTimeOnly=packet('2026-09-20','2026-09-20T01:01:00.000Z',31,31,0,0);
  const localDeferred=localPacketSyncDecision(localTimeOnly,{prior:localPrior,timeOnlySyncMs:5*60*1000});
  assert.equal(localDeferred.defer,true,'time-only heartbeat must defer before remote fetch');

  const localSemantic=packet('2026-09-20','2026-09-20T01:01:00.000Z',31,31,0,0);
  localSemantic.subjects.english.evidence={
    schema:'synthetic.english.evidence.v1',
    resume:{status:'ready',task:'reading_a',object_id:'r-1'}
  };
  assert.equal(
    localPacketSyncDecision(localSemantic,{prior:localPrior,timeOnlySyncMs:5*60*1000}).defer,
    false,
    'semantic change must bypass pre-fetch throttle'
  );
  assert.equal(
    localPacketSyncDecision(packet('2026-09-21','2026-09-21T00:00:30.000Z',1,1,0,0),{
      prior:localPrior,
      timeOnlySyncMs:5*60*1000
    }).defer,
    false,
    'study-day rollover must bypass pre-fetch throttle'
  );
  const first=await publishDailyLearningPacket(d1a,{env,home:temp});
  assert.equal(first.status,'published');

  const ref='refs/heads/'+branch;
  const sha1=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  const parents1=execFileSync('git',['--git-dir',remote,'rev-list','--parents','-n','1',sha1],{encoding:'utf8'}).trim().split(/\s+/);
  assert.equal(parents1.length,1,'runtime ref must be a root snapshot');
  assert.equal(Number(execFileSync('git',['--git-dir',remote,'rev-list','--count',ref],{encoding:'utf8'}).trim()),1);

  const replay=await publishDailyLearningPacket({
    ...d1a,
    generated_at:'2026-09-20T01:05:00.000Z'
  },{env,home:temp});
  assert.equal(replay.status,'idempotent','timestamp-only refresh must not publish');
  assert.equal(execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim(),sha1);

  const timeOnlySoon=packet('2026-09-20','2026-09-20T01:02:00.000Z',31,31,0,0);
  const deferred=await publishDailyLearningPacket(timeOnlySoon,{env,home:temp});
  assert.equal(deferred.status,'deferred_time_only','minute-only change inside throttle window must not push');
  assert.equal(execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim(),sha1);

  const timeOnlyDue=packet('2026-09-20','2026-09-20T01:06:00.000Z',36,36,0,0);
  const timePublished=await publishDailyLearningPacket(timeOnlyDue,{env,home:temp});
  assert.equal(timePublished.status,'published','time-only change after throttle window must publish');
  const shaTime=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  assert.notEqual(shaTime,sha1);

  const semanticSoon=packet('2026-09-20','2026-09-20T01:07:00.000Z',37,37,0,0);
  semanticSoon.subjects.xizong.evidence={
    schema:'synthetic.xizong.evidence.v1',
    resume:{status:'ready',block_id:'B05',stage:'kp_recall'}
  };
  const semanticPublished=await publishDailyLearningPacket(semanticSoon,{env,home:temp});
  assert.equal(semanticPublished.status,'published','semantic Resume/evidence change must bypass time throttle');
  const shaSemantic=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  assert.notEqual(shaSemantic,shaTime);

  const d1b=packet('2026-09-20','2026-09-20T02:00:00.000Z',75,35,40,0);
  const changed=await publishDailyLearningPacket(d1b,{env,home:temp});
  assert.equal(changed.status,'published');
  assert.equal(changed.sealed_day,null);
  const sha2=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  assert.notEqual(sha2,sha1);
  assert.equal(Number(execFileSync('git',['--git-dir',remote,'rev-list','--count',ref],{encoding:'utf8'}).trim()),1);
  assert.throws(()=>execFileSync('git',['--git-dir',remote,'show',ref+':'+dailyPrefix+'/2026-09-20.json'],{stdio:'pipe'}));

  const d2=packet('2026-09-21','2026-09-21T01:00:00.000Z',20,0,20,0);
  const rolled=await publishDailyLearningPacket(d2,{env,home:temp});
  assert.equal(rolled.status,'published');
  assert.equal(rolled.sealed_day,'2026-09-20');

  const finalD1=JSON.parse(execFileSync('git',['--git-dir',remote,'show',ref+':'+dailyPrefix+'/2026-09-20.json'],{encoding:'utf8'}));
  assert.equal(finalD1.total_minutes,75);
  assert.equal(finalD1.subjects.english.time.minutes,40);

  const currentD2=JSON.parse(execFileSync('git',['--git-dir',remote,'show',ref+':'+currentPath],{encoding:'utf8'}));
  assert.equal(currentD2.study_day,'2026-09-21');
  assert.equal(currentD2.total_minutes,20);
  assert.equal(Number(execFileSync('git',['--git-dir',remote,'rev-list','--count',ref],{encoding:'utf8'}).trim()),1,
    'daily archive files must not require accumulating reachable commit history');

  const d2b=packet('2026-09-21','2026-09-21T02:00:00.000Z',55,20,35,0);
  await publishDailyLearningPacket(d2b,{env,home:temp});
  const finalD1After=JSON.parse(execFileSync('git',['--git-dir',remote,'show',ref+':'+dailyPrefix+'/2026-09-20.json'],{encoding:'utf8'}));
  assert.deepEqual(finalD1After,finalD1,'sealed prior-day packet must not change during later current updates');

  await assert.rejects(
    ()=>publishDailyLearningPacket(packet('2026-09-20','2026-09-20T23:00:00.000Z',999,999,0,0),{env,home:temp}),
    /OLDER_THAN_REMOTE_CURRENT/
  );

  console.log('PASS Daily Learning Packet relay: one current, one sealed file/day, root-only runtime ref, no stale rollback');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
