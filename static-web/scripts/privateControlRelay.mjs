#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  readPrivateControlCommand,
  readPrivateControlReceipt,
  writePrivateControlCommand
} from './privateControlStore.mjs';
import {
  privateControlCommandSignature,
  validatePrivateControlCommand
} from '../src/lib/privateControlCommand.mjs';

const execFileAsync=promisify(execFile);
export const CONTROL_RELAY_COMMAND_PATH='runtime/kianos-control/current-command.json';
export const CONTROL_RELAY_RECEIPT_PATH='runtime/kianos-control/current-receipt.json';
export const DEFAULT_CONTROL_REF='runtime/kianos-control';

const readJson=(file)=>{
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}
  catch(error){if(error?.code==='ENOENT')return null;throw error;}
};
const writeJson=(file,value)=>{
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8');
};
const sameJson=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

async function git(cwd,args){
  const {stdout}=await execFileAsync('git',args,{cwd,maxBuffer:8*1024*1024});
  return String(stdout||'').trim();
}

async function ensureMirror({remote,mirrorDir,ref}){
  if(!remote)throw new Error('PRIVATE_CONTROL_RELAY_REMOTE_REQUIRED');
  if(!mirrorDir)throw new Error('PRIVATE_CONTROL_RELAY_DIR_REQUIRED');
  if(!fs.existsSync(path.join(mirrorDir,'.git'))){
    fs.mkdirSync(path.dirname(mirrorDir),{recursive:true});
    await execFileAsync('git',['clone','--branch',ref,'--single-branch',remote,mirrorDir],{maxBuffer:8*1024*1024});
  }
  const origin=await git(mirrorDir,['remote','get-url','origin']);
  if(origin!==remote)throw new Error('PRIVATE_CONTROL_RELAY_REMOTE_MISMATCH');
}

async function refreshMirror({mirrorDir,ref}){
  await git(mirrorDir,['fetch','origin',ref,'--prune']);
  const remoteSha=await git(mirrorDir,['rev-parse',`origin/${ref}`]);
  await git(mirrorDir,['checkout','-B',ref,`origin/${ref}`]);
  await git(mirrorDir,['reset','--hard',`origin/${ref}`]);
  return remoteSha;
}

function readRelayCommand(mirrorDir){
  const file=path.join(mirrorDir,CONTROL_RELAY_COMMAND_PATH);
  const raw=readJson(file);
  return raw==null?null:validatePrivateControlCommand(raw);
}

function receiptMatchesCommand(receipt,command){
  return Boolean(receipt&&command
    && receipt.command_id===command.command_id
    && receipt.command_signature===privateControlCommandSignature(command));
}

async function publishReceipt({mirrorDir,ref,command,receipt}){
  await refreshMirror({mirrorDir,ref});
  const current=readRelayCommand(mirrorDir);
  if(!current||current.command_id!==command.command_id
      ||privateControlCommandSignature(current)!==privateControlCommandSignature(command)){
    return {status:'superseded_before_receipt'};
  }
  const file=path.join(mirrorDir,CONTROL_RELAY_RECEIPT_PATH);
  const existing=readJson(file);
  if(sameJson(existing,receipt))return {status:'receipt_present'};

  writeJson(file,receipt);
  await git(mirrorDir,['add',CONTROL_RELAY_RECEIPT_PATH]);
  const changed=await git(mirrorDir,['status','--porcelain','--',CONTROL_RELAY_RECEIPT_PATH]);
  if(!changed)return {status:'receipt_present'};
  await git(mirrorDir,[
    '-c','user.name=KianOS Control Relay',
    '-c','user.email=kianos-control@local.invalid',
    'commit','-m',`control receipt ${receipt.command_id}`
  ]);
  try{
    await git(mirrorDir,['push','origin',`HEAD:${ref}`]);
  }catch(error){
    // One bounded reconcile retry. If Chat advanced the command, never overwrite it.
    await refreshMirror({mirrorDir,ref});
    const latest=readRelayCommand(mirrorDir);
    if(!latest||latest.command_id!==command.command_id
        ||privateControlCommandSignature(latest)!==privateControlCommandSignature(command)){
      return {status:'superseded_before_receipt'};
    }
    writeJson(path.join(mirrorDir,CONTROL_RELAY_RECEIPT_PATH),receipt);
    await git(mirrorDir,['add',CONTROL_RELAY_RECEIPT_PATH]);
    await git(mirrorDir,[
      '-c','user.name=KianOS Control Relay',
      '-c','user.email=kianos-control@local.invalid',
      'commit','-m',`control receipt ${receipt.command_id}`
    ]);
    await git(mirrorDir,['push','origin',`HEAD:${ref}`]);
  }
  return {status:'receipt_published'};
}

export async function syncPrivateControlRelayOnce({
  remote,
  mirrorDir,
  privateDir,
  ref=DEFAULT_CONTROL_REF
}={}){
  await ensureMirror({remote,mirrorDir,ref});
  await refreshMirror({mirrorDir,ref});
  const command=readRelayCommand(mirrorDir);
  if(!command)return {status:'no_command'};

  const localCommand=readPrivateControlCommand(privateDir);
  let commandStatus='present';
  if(!localCommand
      ||localCommand.command_id!==command.command_id
      ||privateControlCommandSignature(localCommand)!==privateControlCommandSignature(command)){
    writePrivateControlCommand(command,privateDir);
    commandStatus='delivered';
  }

  const receipt=readPrivateControlReceipt(privateDir);
  let receiptStatus='none';
  if(receiptMatchesCommand(receipt,command)){
    const published=await publishReceipt({mirrorDir,ref,command,receipt});
    receiptStatus=published.status;
  }
  return {
    status:'ready',
    command_id:command.command_id,
    command_status:commandStatus,
    receipt_status:receiptStatus
  };
}

async function main(){
  const remote=String(process.env.KIANOS_CONTROL_RELAY_REMOTE||'').trim();
  if(!remote)return;
  const privateDir=process.env.KIANOS_PRIVATE_DIR;
  const mirrorDir=process.env.KIANOS_CONTROL_RELAY_DIR
    ||path.join(os.homedir(),'Library','Application Support','KianOS','control-relay');
  const ref=process.env.KIANOS_CONTROL_RELAY_REF||DEFAULT_CONTROL_REF;
  const interval=Math.max(3000,Number(process.env.KIANOS_CONTROL_RELAY_INTERVAL_MS||5000));
  const once=process.env.KIANOS_CONTROL_RELAY_ONCE==='1';
  const run=async()=>{
    try{await syncPrivateControlRelayOnce({remote,mirrorDir,privateDir,ref});}
    catch(error){console.error('[KianOS control relay]',error?.message||error);}
  };
  await run();
  if(!once)setInterval(()=>void run(),interval);
}

const self=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(self))void main();
