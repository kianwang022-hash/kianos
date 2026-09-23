import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateLexicalChallengePacket } from '../src/lib/lexicalChallenge.mjs';
import {
  CONTROL_BROWSER_SCHEMA,
  browserControlCommand,
  validateControlCommand,
  validateControlReceipt
} from '../src/lib/privateControlCommand.mjs';
import {
  resolveEnglishGeneratedDir,
  writeEnglishGeneratedDrill
} from './privateEnglishGeneratedDrillStore.mjs';

const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function resolvePrivateControlDir({env=process.env,home=os.homedir()}={}){
  const configured=String(env.KIANOS_CONTROL_DIR||'').trim();
  if(configured)return path.resolve(configured);
  if(process.platform==='darwin')return path.join(home,'Library','Application Support','KianOS','control');
  return path.join(home,'.kianos','control');
}

const pathsFor=dir=>({
  source:path.join(dir,'source.json'),
  current:path.join(dir,'current.json'),
  receipt:path.join(dir,'receipt.json'),
  status:path.join(dir,'status.json')
});

function atomicWrite(file,value){
  fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
  try{fs.chmodSync(path.dirname(file),0o700);}catch{}
  const temp=file+'.tmp-'+process.pid+'-'+Date.now();
  fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600});
  fs.renameSync(temp,file);
  try{fs.chmodSync(file,0o600);}catch{}
}

function readJson(file){
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}
  catch(error){if(error?.code==='ENOENT')return null;throw error;}
}

export function readPrivateControlCurrent(privateDir=resolvePrivateControlDir()){
  const value=readJson(pathsFor(privateDir).current);
  if(!value)return null;
  if(value.schema!==CONTROL_BROWSER_SCHEMA)throw new Error('KIANOS_CONTROL_LOCAL_SCHEMA_INVALID');
  return value;
}

export function readPrivateControlReceipt(privateDir=resolvePrivateControlDir()){
  const value=readJson(pathsFor(privateDir).receipt);
  return value?validateControlReceipt(value):null;
}

export function writePrivateControlReceipt(value,privateDir=resolvePrivateControlDir()){
  const receipt=validateControlReceipt(value);
  atomicWrite(pathsFor(privateDir).receipt,receipt);
  return receipt;
}

export function readPrivateControlStatus(privateDir=resolvePrivateControlDir()){
  return readJson(pathsFor(privateDir).status)||{state:'missing',updated_at:null};
}

export function writePrivateControlStatus(state,privateDir=resolvePrivateControlDir()){
  const value={...state,updated_at:new Date().toISOString()};
  atomicWrite(pathsFor(privateDir).status,value);
  return value;
}

export function publishPrivateControlCommand(input,{
  privateDir=resolvePrivateControlDir(),
  generatedDir=resolveEnglishGeneratedDir()
}={}){
  const command=validateControlCommand(input);
  for(const operation of command.operations){
    if(operation.kind==='lexical.challenge')validateLexicalChallengePacket(operation.payload,{day:command.study_day});
  }
  const commandHash=hash(command);
  const p=pathsFor(privateDir);
  const existingSource=readJson(p.source);
  if(existingSource){
    const existing=validateControlCommand(existingSource);
    if(existing.command_id===command.command_id){
      const existingHash=hash(existing);
      if(existingHash!==commandHash)throw new Error('KIANOS_CONTROL_COMMAND_ID_CONFLICT:'+command.command_id);
      for(const operation of command.operations){
        if(operation.kind==='english.generated_drill'){
          writeEnglishGeneratedDrill(operation.payload,{privateDir:generatedDir});
        }
      }
      let browser=readPrivateControlCurrent(privateDir);
      if(!browser||browser.command_id!==command.command_id||browser.command_hash!==commandHash){
        browser=browserControlCommand(command,{commandHash});
        atomicWrite(p.current,browser);
      }
      return{status:'idempotent',command,command_hash:commandHash,browser};
    }
    if(Date.parse(command.generated_at)<=Date.parse(existing.generated_at)){
      throw new Error('KIANOS_CONTROL_OLDER_COMMAND:'+command.command_id);
    }
  }

  // Server-owned operations must succeed before the browser command is published.
  for(const operation of command.operations){
    if(operation.kind==='english.generated_drill'){
      writeEnglishGeneratedDrill(operation.payload,{privateDir:generatedDir});
    }
  }

  const browser=browserControlCommand(command,{commandHash});
  atomicWrite(p.source,command);
  atomicWrite(p.current,browser);

  const receipt=readPrivateControlReceipt(privateDir);
  if(receipt&&receipt.command_id!==command.command_id){
    try{fs.unlinkSync(p.receipt);}catch{}
  }

  writePrivateControlStatus({
    state:'ready',
    command_id:command.command_id,
    command_hash:commandHash,
    study_day:command.study_day
  },privateDir);

  return{status:'published',command,command_hash:commandHash,browser};
}
