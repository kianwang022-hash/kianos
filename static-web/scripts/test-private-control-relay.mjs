import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {
  ENGLISH_GENERATED_DRILL_SCHEMA,
  validateEnglishGeneratedDrill,
  readEnglishGeneratedDrill
} from './privateEnglishGeneratedDrillStore.mjs';
import {
  readPrivateControlCurrent,
  readPrivateControlReceipt,
  publishPrivateControlCommand
} from './privateControlStore.mjs';
import {syncPrivateControlRelayOnce} from './privateControlRelaySync.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-control-unit-'));
const controlDir=path.join(temp,'control');
const generatedDir=path.join(temp,'generated');
const day='2026-09-20';

const drill=validateEnglishGeneratedDrill({
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:'external-chat-2026-09-20-control-001',
  study_day:day,
  generated_at:'2026-09-20T00:10:00+08:00',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'reading_transfer',note:'Private relay unit proof.'},
  passage:{title:'Relay drill',paragraphs:['A narrow claim should remain narrow.']},
  questions:[{
    question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',
    prompt:'Which is supported?',options:{A:'All cases.',B:'Some cases.'},answer:'B'
  }]
});

const sessionId='english-control-session-1';
const session={
  schema:'kianos.english.session-instruction.v1',
  session_id:sessionId,
  study_day:day,
  generated_at:'2026-09-20T00:11:00+08:00',
  current_step:0,
  steps:[{
    step_id:'reading',
    task:'external_reading',
    object_id:drill.object_id,
    source_hash:drill.content_hash,
    label:'Relay Reading',
    note:'Private relay proof.'
  }],
  return_policy:{on_finish:'english_home'}
};
const plan={
  schema:'kianos.exam.chat-plan.v1',
  study_day:day,
  generated_at:'2026-09-20T00:12:00+08:00',
  subjects:{
    xizong:null,
    english:{target_minutes:30,role:'稳推进',note:'Relay proof.',session_ref:sessionId},
    politics:null
  },
  next_subject:'english',
  attention:null
};
const command={
  schema:'kianos.control-command.v1',
  command_id:'control-20260920-unit-001',
  study_day:day,
  generated_at:'2026-09-20T00:12:00+08:00',
  expires_at:'2026-09-21T00:00:00+08:00',
  operations:[
    {kind:'english.generated_drill',payload:drill},
    {kind:'english.session',payload:session},
    {kind:'exam.chat_plan',payload:plan}
  ]
};

try{
  const first=publishPrivateControlCommand(command,{privateDir:controlDir,generatedDir});
  assert.equal(first.status,'published');
  assert.equal(readEnglishGeneratedDrill(drill.object_id,{privateDir:generatedDir}).content_hash,drill.content_hash);
  const browser=readPrivateControlCurrent(controlDir);
  assert.equal(browser.operations.length,2,'server-only generated drill must not be sent to browser');
  assert.deepEqual(browser.operations.map(op=>op.kind),['english.session','exam.chat_plan']);

  const replay=publishPrivateControlCommand(command,{privateDir:controlDir,generatedDir});
  assert.equal(replay.status,'idempotent');

  assert.throws(()=>publishPrivateControlCommand({
    ...command,
    operations:command.operations.map(op=>op.kind==='exam.chat_plan'
      ?{...op,payload:{...op.payload,attention:{text:'changed',action:''}}}
      :op)
  },{privateDir:controlDir,generatedDir}),/COMMAND_ID_CONFLICT/);

  assert.throws(()=>publishPrivateControlCommand({
    ...command,
    command_id:'control-20260920-bad-ref',
    operations:[
      {kind:'english.session',payload:session},
      {kind:'exam.chat_plan',payload:{
        ...plan,
        subjects:{...plan.subjects,english:{...plan.subjects.english,session_ref:'other-session'}}
      }}
    ]
  },{privateDir:controlDir,generatedDir}),/ENGLISH_SESSION_REF_MISMATCH/);

  // Real git transport proof against a local private-repo analogue.
  const remote=path.join(temp,'personal-remote.git');
  const work=path.join(temp,'personal-work');
  const mirror=path.join(temp,'personal-mirror');
  execFileSync('git',['init','--bare',remote]);
  fs.mkdirSync(work,{recursive:true});
  execFileSync('git',['init','-b','main'],{cwd:work});
  execFileSync('git',['config','user.name','KianOS Test'],{cwd:work});
  execFileSync('git',['config','user.email','test@kianos.local'],{cwd:work});
  fs.mkdirSync(path.join(work,'runtime','kianos-control'),{recursive:true});
  fs.writeFileSync(path.join(work,'runtime','kianos-control','current.json'),JSON.stringify(command,null,2));
  execFileSync('git',['add','.'],{cwd:work});
  execFileSync('git',['commit','-m','control command'],{cwd:work});
  execFileSync('git',['remote','add','origin',remote],{cwd:work});
  execFileSync('git',['push','-u','origin','main'],{cwd:work});

  const relayControl=path.join(temp,'relay-control');
  const relayGenerated=path.join(temp,'relay-generated');
  const result=await syncPrivateControlRelayOnce({
    env:{
      ...process.env,
      KIANOS_CONTROL_REPO_URL:remote,
      KIANOS_CONTROL_REPO_DIR:mirror,
      KIANOS_CONTROL_DIR:relayControl,
      KIANOS_ENGLISH_GENERATED_DIR:relayGenerated
    },
    home:temp
  });
  assert.equal(result.state,'ready',JSON.stringify(result));
  assert.equal(result.command_id,command.command_id);
  assert.equal(readPrivateControlCurrent(relayControl).command_id,command.command_id);
  assert.equal(readEnglishGeneratedDrill(drill.object_id,{privateDir:relayGenerated}).content_hash,drill.content_hash);
  assert.equal(readPrivateControlReceipt(relayControl),null);

  console.log('PASS private control relay: typed command, server materialization, browser projection, idempotency, git transport');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
