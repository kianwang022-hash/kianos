import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { publishDailyLearningPacket } from './privateDailyLearningPacketRelay.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-packet-relay-'));
const remote=path.join(temp,'personal-remote.git');
const repoDir=path.join(temp,'relay-repo');
const branch='runtime/kianos-learning';
const currentPath='runtime/kianos-learning/current.json';
const dailyPrefix='runtime/kianos-learning/daily';

const basis=(day,tag='a')=>({
  schema:'kianos.exam.chat-plan-basis.v1',
  study_day:day,
  shared_context_fingerprint:'fnv1a64:1111111111111111:'+tag.length,
  subjects:{
    xizong:'fnv1a64:2222222222222222:'+tag.length,
    english:'fnv1a64:3333333333333333:'+tag.length,
    politics:'fnv1a64:4444444444444444:'+tag.length
  },
  evidence_fingerprint:'fnv1a64:5555555555555555:'+tag.length
});
const packet=(day,generated,total,x=0,e=0,p=0,basisTag='a')=>({
  schema:'kianos.daily-learning-packet.v1',
  study_day:day,
  timezone:'Asia/Shanghai',
  generated_at:generated,
  learner_evidence_basis:basis(day,basisTag),
  coverage:{xizong:'attached',english:'attached',politics:'attached'},
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
  const first=await publishDailyLearningPacket(d1a,{env,home:temp});
  assert.equal(first.status,'published');
  assert.equal(first.learner_evidence_ready,true);

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
  assert.equal(replay.learner_evidence_ready,true);
  assert.equal(replay.generated_at,d1a.generated_at,'idempotent readback uses remote packet timestamp');
  assert.equal(execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim(),sha1);

  const reprojected={
    ...d1a,
    total_minutes:31,
    subjects:{
      ...d1a.subjects,
      xizong:{...d1a.subjects.xizong,time:{minutes:31,details:[]}}
    }
  };
  await assert.rejects(
    ()=>publishDailyLearningPacket(reprojected,{env,home:temp}),
    /SAME_IDENTITY_CONFLICT/,
    'ordinary same-identity material conflicts must remain fail-closed'
  );
  const reprojection=await publishDailyLearningPacket(reprojected,{
    env,
    home:temp,
    trustedCheckpointReprojection:true
  });
  assert.equal(reprojection.status,'published','trusted private-checkpoint reprojection must refresh Current');

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
  assert.equal(currentD2.learner_evidence_basis.schema,'kianos.exam.chat-plan-basis.v1');
  assert.equal(currentD2.learner_evidence_basis.study_day,'2026-09-21');
  assert.equal(currentD2.learner_evidence_basis.subjects.xizong,'fnv1a64:2222222222222222:1');
  assert.equal(Number(execFileSync('git',['--git-dir',remote,'rev-list','--count',ref],{encoding:'utf8'}).trim()),1,
    'daily archive files must not require accumulating reachable commit history');

  const basisOnlyChange=packet('2026-09-21','2026-09-21T01:30:00.000Z',20,0,20,0,'bb');
  const basisPublished=await publishDailyLearningPacket(basisOnlyChange,{env,home:temp});
  assert.equal(basisPublished.status,'published','learner_evidence_basis change must publish even if time totals are unchanged');
  const basisCurrent=JSON.parse(execFileSync('git',['--git-dir',remote,'show',ref+':'+currentPath],{encoding:'utf8'}));
  assert.equal(basisCurrent.learner_evidence_basis.subjects.english,'fnv1a64:3333333333333333:2');

  const d2b=packet('2026-09-21','2026-09-21T02:00:00.000Z',55,20,35,0,'cc');
  await publishDailyLearningPacket(d2b,{env,home:temp});
  const finalD1After=JSON.parse(execFileSync('git',['--git-dir',remote,'show',ref+':'+dailyPrefix+'/2026-09-20.json'],{encoding:'utf8'}));
  assert.deepEqual(finalD1After,finalD1,'sealed prior-day packet must not change during later current updates');

  await assert.rejects(
    ()=>publishDailyLearningPacket(packet('2026-09-20','2026-09-20T23:00:00.000Z',999,999,0,0),{env,home:temp}),
    /OLDER_THAN_REMOTE_CURRENT/
  );

  const nativeUnknown={...d2b,generated_at:'2026-09-21T02:30:00.000Z',coverage:{xizong:'unknown',english:'attached',politics:'attached'}};
  const unknownPublish=await publishDailyLearningPacket(nativeUnknown,{env,home:temp});
  assert.equal(unknownPublish.learner_evidence_ready,true,'honest native unknown with a valid basis supports provisional planning');
  assert.equal(unknownPublish.coverage.xizong,'unknown','readiness must never manufacture observations');

  const degraded={...d2b,generated_at:'2026-09-21T03:00:00.000Z',learner_evidence_basis:null,coverage:{xizong:'unavailable',english:'attached',politics:'attached'}};
  const degradedPublish=await publishDailyLearningPacket(degraded,{env,home:temp});
  assert.equal(degradedPublish.state,'ready','transport succeeds even when evidence is partial');
  assert.equal(degradedPublish.learner_evidence_ready,false);
  const degradedRetry=await publishDailyLearningPacket(degraded,{env,home:temp});
  assert.equal(degradedRetry.learner_evidence_ready,false,'idempotent transport must not erase evidence failure');

  console.log('PASS Daily Learning Packet relay: current learner_evidence_basis preserved, basis changes publish, one current, one sealed file/day, root-only runtime ref, no stale rollback');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
