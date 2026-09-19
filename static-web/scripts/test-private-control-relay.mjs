import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {
  CONTROL_RELAY_COMMAND_PATH,
  CONTROL_RELAY_RECEIPT_PATH,
  DEFAULT_CONTROL_REF,
  syncPrivateControlRelayOnce
} from './privateControlRelay.mjs';
import {
  readPrivateControlCommand,
  writePrivateControlReceipt
} from './privateControlStore.mjs';
import {buildPrivateControlReceipt} from '../src/lib/privateControlCommand.mjs';

const execFileAsync=promisify(execFile);
async function git(cwd,args){await execFileAsync('git',args,{cwd,maxBuffer:8*1024*1024});}
const root=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-relay-test-'));
const remote=path.join(root,'remote.git');
const seed=path.join(root,'seed');
const mirror=path.join(root,'mirror');
const privateDir=path.join(root,'private');
const day='2026-09-20';

const command={
  schema:'kianos.private-control-command.v1',
  command_id:'relay-cmd-1',
  issued_at:'2026-09-20T01:00:00.000Z',
  study_day:day,
  target:'exam.chat_plan',
  payload:{
    schema:'kianos.exam.chat-plan.v1',
    study_day:day,
    generated_at:'2026-09-20T01:00:00.000Z',
    subjects:{xizong:null,english:null,politics:null},
    next_subject:'xizong',
    attention:null
  }
};

try{
  await execFileAsync('git',['init','--bare',remote]);
  fs.mkdirSync(seed,{recursive:true});
  await git(seed,['init']);
  await git(seed,['checkout','-b',DEFAULT_CONTROL_REF]);
  await git(seed,['config','user.name','Relay Test']);
  await git(seed,['config','user.email','relay@test.invalid']);
  const commandFile=path.join(seed,CONTROL_RELAY_COMMAND_PATH);
  fs.mkdirSync(path.dirname(commandFile),{recursive:true});
  fs.writeFileSync(commandFile,JSON.stringify(command,null,2)+'\n');
  await git(seed,['add','.']);
  await git(seed,['commit','-m','seed command']);
  await git(seed,['remote','add','origin',remote]);
  await git(seed,['push','-u','origin',DEFAULT_CONTROL_REF]);

  const first=await syncPrivateControlRelayOnce({
    remote,mirrorDir:mirror,privateDir,ref:DEFAULT_CONTROL_REF
  });
  assert.equal(first.command_status,'delivered');
  assert.equal(readPrivateControlCommand(privateDir).command_id,'relay-cmd-1');

  const receipt=buildPrivateControlReceipt(command,{
    status:'APPLIED',
    appliedAt:Date.parse('2026-09-20T01:00:02.000Z')
  });
  writePrivateControlReceipt(receipt,privateDir);
  const second=await syncPrivateControlRelayOnce({
    remote,mirrorDir:mirror,privateDir,ref:DEFAULT_CONTROL_REF
  });
  assert.equal(second.receipt_status,'receipt_published');

  const inspect=path.join(root,'inspect');
  await execFileAsync('git',['clone','--branch',DEFAULT_CONTROL_REF,remote,inspect]);
  const published=JSON.parse(fs.readFileSync(path.join(inspect,CONTROL_RELAY_RECEIPT_PATH),'utf8'));
  assert.equal(published.command_id,'relay-cmd-1');
  assert.equal(published.status,'APPLIED');

  const newer={
    ...command,
    command_id:'relay-cmd-2',
    issued_at:'2026-09-20T01:01:00.000Z',
    payload:{...command.payload,generated_at:'2026-09-20T01:01:00.000Z'}
  };
  await git(seed,['fetch','origin',DEFAULT_CONTROL_REF]);
  await git(seed,['reset','--hard',`origin/${DEFAULT_CONTROL_REF}`]);
  fs.writeFileSync(commandFile,JSON.stringify(newer,null,2)+'\n');
  await git(seed,['add',CONTROL_RELAY_COMMAND_PATH]);
  await git(seed,['commit','-m','new command']);
  await git(seed,['push','origin',`HEAD:${DEFAULT_CONTROL_REF}`]);

  const third=await syncPrivateControlRelayOnce({
    remote,mirrorDir:mirror,privateDir,ref:DEFAULT_CONTROL_REF
  });
  assert.equal(third.command_status,'delivered');
  assert.equal(readPrivateControlCommand(privateDir).command_id,'relay-cmd-2');

  // Invalid remote command must fail closed and preserve the last valid local command.
  await git(seed,['fetch','origin',DEFAULT_CONTROL_REF]);
  await git(seed,['reset','--hard',`origin/${DEFAULT_CONTROL_REF}`]);
  fs.writeFileSync(commandFile,JSON.stringify({...newer,target:'not.allowed'},null,2)+'\n');
  await git(seed,['add',CONTROL_RELAY_COMMAND_PATH]);
  await git(seed,['commit','-m','invalid command']);
  await git(seed,['push','origin',`HEAD:${DEFAULT_CONTROL_REF}`]);

  await assert.rejects(
    ()=>syncPrivateControlRelayOnce({remote,mirrorDir:mirror,privateDir,ref:DEFAULT_CONTROL_REF}),
    /TARGET_INVALID/
  );
  assert.equal(readPrivateControlCommand(privateDir).command_id,'relay-cmd-2');

  console.log('PASS private control Git relay: private branch command delivery + receipt publish + invalid fail-closed');
}finally{
  fs.rmSync(root,{recursive:true,force:true});
}
