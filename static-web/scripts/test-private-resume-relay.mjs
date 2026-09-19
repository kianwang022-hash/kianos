import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PRIVATE_CHECKPOINT_SCHEMA, writePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';
import { syncPrivateResumeRelayOnce } from './privateResumeRelaySync.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-resume-relay-'));
const privateDir=path.join(temp,'private');
const relayRepo=path.join(temp,'relay-repo');
const remote=path.join(temp,'personal-remote.git');
const branch='runtime/kianos-learner-resume';
const mailboxPath='runtime/kianos-resume/current.json';
const day='2026-09-20';
const j=JSON.stringify;

function checkpoint(stage='kp_recall',generatedAt='2026-09-20T01:00:00.000Z'){
  return{
    schema:PRIVATE_CHECKPOINT_SCHEMA,
    checkpoint_id:'checkpoint-'+generatedAt,
    study_day:day,
    generated_at:generatedAt,
    payload:{shared:{},subjects:{
      xizong:{
        schema:'kianos.xizong.private-checkpoint.v1',
        captured_at:generatedAt,
        entries:[
          {key:'kianos-xizong-last-location-v1',raw:j({
            systemId:'a3-urinary',systemCanonical:'A3',systemTitle:'泌尿系统',
            blockId:'B05',blockSlug:'b05',blockLabel:'B05',
            href:'/xizong/a3-urinary/b05/',resumeKind:'block',
            resumeTitle:'B05 · 肾小球疾病',resumeStage:'主动回忆',resumePosition:'第 2 个知识点'
          })},
          {key:'kianos-xizong-astro-v2:xizong:B05',raw:j({
            stage,groupIndex:1,kpIndex:1,blockRecallDone:false,completed:false,
            ratings:{kp1:'known',kp2:'fuzzy'},learned:{kp1:true,kp2:true}
          })}
        ]
      },
      english:{
        schema:'kianos.english.private-payload.v1',
        entries:{
          'kianos-english-session-instruction-v1':j({
            schema:'kianos.english.session-instruction.v1',
            session_id:'english-20260920-smoke',study_day:day,
            generated_at:'2026-09-20T00:30:00.000Z',current_step:0,
            steps:[
              {step_id:'r1',task:'reading_a',object_id:'tpo56-p1',source_hash:'hash-reading',label:'TPO56 P1',note:'first'},
              {step_id:'t1',task:'translation',object_id:'translation-001',source_hash:'hash-translation',label:'Translation 001',note:'second'}
            ],
            return_policy:{on_finish:'english_home'}
          }),
          'kianos-reading-attempt-v1:tpo56-p1':j({
            binding:{source_hash:'hash-reading'},submitted:true,results:{},uncertain:[],reviewResolved:true,
            hidden_problem_payload:'must-not-leak'
          }),
          'kianos-reading-last-location-v1':j({
            id:'tpo56-p1',title:'TPO56 P1',href:'/reading/tpo56-p1/',updatedAt:'2026-09-20T00:40:00.000Z'
          })
        }
      },
      politics:{
        schema:'kianos.politics.private-payload.v1',
        entries:{
          'kianos-politics-practice-session-v1':j({
            runtimeVersion:2,id:'politics-session-1',ids:['p-q1','p-q2'],index:1,status:'paused',
            taskRevisions:{'p-q1':'r1','p-q2':'r2'}
          }),
          'kianos-politics-last-location-v1':j({
            title:'马原 · 唯物论',subject:'marxism',chapter:'c01',
            href:'/politics/marxism/c01/#orientation',updated_at:'2026-09-20T00:50:00.000Z'
          }),
          'kianos-politics-attempts-v1':j({units:{u1:{attempts:{a1:{question_id:'p-q1',outcome:'WRONG',selected:'A',study_day:day}}}}}),
          'kianos-politics-practice-meta-v1':j({latestOutcome:{'p-q1':'WRONG'}}),
          'kianos-politics-evidence-v1':j([])
        }
      }
    }}
  };
}

try{
  execFileSync('git',['init','--bare',remote]);
  writePrivateLearnerCheckpoint(checkpoint(),privateDir);
  const env={...process.env,KIANOS_PRIVATE_DIR:privateDir,KIANOS_RESUME_REPO_URL:remote,KIANOS_RESUME_REPO_DIR:relayRepo,KIANOS_RESUME_BRANCH:branch,KIANOS_RESUME_PATH:mailboxPath};

  const first=await syncPrivateResumeRelayOnce({env,home:temp,now:Date.parse('2026-09-20T01:00:01Z')});
  assert.equal(first.status,'published');

  const ref='refs/heads/'+branch;
  const sha1=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  const parents1=execFileSync('git',['--git-dir',remote,'rev-list','--parents','-n','1',sha1],{encoding:'utf8'}).trim().split(/\s+/);
  assert.equal(parents1.length,1);

  const raw1=execFileSync('git',['--git-dir',remote,'show',ref+':'+mailboxPath],{encoding:'utf8'});
  const m1=JSON.parse(raw1);
  assert.equal(m1.subjects.xizong.continuation.last_location.blockId,'B05');
  assert.equal(m1.subjects.xizong.continuation.block_state.stage,'kp_recall');
  assert.equal(m1.subjects.english.continuation.step.task,'translation');
  assert.equal(m1.subjects.english.continuation.step.object_id,'translation-001');
  assert.equal(m1.subjects.politics.continuation.session.current_question_id,'p-q2');
  assert.ok(!raw1.includes('ratings'));
  assert.ok(!raw1.includes('hidden_problem_payload'));
  assert.ok(!raw1.includes('WRONG'));

  const replay=await syncPrivateResumeRelayOnce({env,home:temp,now:Date.parse('2026-09-20T01:02:00Z')});
  assert.equal(replay.status,'idempotent');
  assert.equal(execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim(),sha1);

  writePrivateLearnerCheckpoint(checkpoint('block_recall','2026-09-20T01:05:00.000Z'),privateDir);
  const second=await syncPrivateResumeRelayOnce({env,home:temp,now:Date.parse('2026-09-20T01:05:01Z')});
  assert.equal(second.status,'published');
  const sha2=execFileSync('git',['--git-dir',remote,'rev-parse',ref],{encoding:'utf8'}).trim();
  assert.notEqual(sha2,sha1);
  const parents2=execFileSync('git',['--git-dir',remote,'rev-list','--parents','-n','1',sha2],{encoding:'utf8'}).trim().split(/\s+/);
  assert.equal(parents2.length,1);
  assert.equal(Number(execFileSync('git',['--git-dir',remote,'rev-list','--count',ref],{encoding:'utf8'}).trim()),1);
  const raw2=execFileSync('git',['--git-dir',remote,'show',ref+':'+mailboxPath],{encoding:'utf8'});
  assert.equal(JSON.parse(raw2).subjects.xizong.continuation.block_state.stage,'block_recall');

  console.log('PASS private resume relay: bounded continuation, no learner-evidence leakage, idempotent root-only mailbox replacement');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
