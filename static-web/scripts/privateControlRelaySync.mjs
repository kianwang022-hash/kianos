import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {
  publishPrivateControlCommand,
  resolvePrivateControlDir,
  writePrivateControlStatus
} from './privateControlStore.mjs';
import { resolveEnglishGeneratedDir } from './privateEnglishGeneratedDrillStore.mjs';

const execFileAsync=promisify(execFile);
const DEFAULT_REPO_URL='https://github.com/kianwang022-hash/kian-personal-os.git';
const DEFAULT_COMMAND_PATH='runtime/kianos-control/current.json';

const clean=(v,max=4000)=>String(v??'').trim().slice(0,max);

export function resolvePrivateControlRepoDir({env=process.env,home=os.homedir()}={}){
  const configured=clean(env.KIANOS_CONTROL_REPO_DIR);
  if(configured)return path.resolve(configured);
  if(process.platform==='darwin')return path.join(home,'Library','Application Support','KianOS','control-repo');
  return path.join(home,'.kianos','control-repo');
}

export function privateControlRelayConfig({env=process.env,home=os.homedir()}={}){
  return{
    enabled:String(env.KIANOS_CONTROL_ENABLED??'1')!=='0',
    sourceFile:clean(env.KIANOS_CONTROL_SOURCE_FILE)||null,
    repoUrl:clean(env.KIANOS_CONTROL_REPO_URL)||DEFAULT_REPO_URL,
    repoDir:resolvePrivateControlRepoDir({env,home}),
    commandPath:clean(env.KIANOS_CONTROL_COMMAND_PATH)||DEFAULT_COMMAND_PATH,
    privateDir:resolvePrivateControlDir({env,home}),
    generatedDir:resolveEnglishGeneratedDir({env,home})
  };
}

async function run(file,args,{cwd,env=process.env}={}){
  const result=await execFileAsync(file,args,{
    cwd,
    env:{...env,GIT_TERMINAL_PROMPT:'0'},
    maxBuffer:16*1024*1024
  });
  return String(result.stdout||'').trim();
}

async function ensureRepo(config,{gitBin='git'}={}){
  const {repoDir,repoUrl}=config;
  if(fs.existsSync(path.join(repoDir,'.git')))return;
  fs.mkdirSync(path.dirname(repoDir),{recursive:true,mode:0o700});
  try{fs.chmodSync(path.dirname(repoDir),0o700);}catch{}
  if(fs.existsSync(repoDir)&&fs.readdirSync(repoDir).length){
    throw new Error('KIANOS_CONTROL_REPO_DIR_NOT_EMPTY:'+repoDir);
  }
  await run(gitBin,[
    'clone','--filter=blob:none','--no-checkout','--depth','1',
    '--branch','main','--single-branch',repoUrl,repoDir
  ]);
  await run(gitBin,['sparse-checkout','init','--cone'],{cwd:repoDir});
  await run(gitBin,['sparse-checkout','set','runtime/kianos-control'],{cwd:repoDir});
  await run(gitBin,['checkout','-B','main','origin/main'],{cwd:repoDir});
  try{fs.chmodSync(repoDir,0o700);}catch{}
}

async function syncRepo(config,{gitBin='git'}={}){
  await ensureRepo(config,{gitBin});
  const local=await run(gitBin,['rev-parse','HEAD'],{cwd:config.repoDir});
  const remoteRaw=await run(gitBin,['ls-remote','origin','refs/heads/main'],{cwd:config.repoDir});
  const remote=remoteRaw.split(/\s+/)[0]||'';
  if(!remote)throw new Error('KIANOS_CONTROL_REMOTE_MAIN_MISSING');
  if(local!==remote){
    await run(gitBin,['fetch','origin','main','--depth','1','--prune'],{cwd:config.repoDir});
    await run(gitBin,['checkout','-B','main','origin/main'],{cwd:config.repoDir});
    await run(gitBin,['reset','--hard','origin/main'],{cwd:config.repoDir});
  }
  return path.join(config.repoDir,config.commandPath);
}

export async function syncPrivateControlRelayOnce({
  env=process.env,
  home=os.homedir(),
  gitBin='git'
}={}){
  const config=privateControlRelayConfig({env,home});
  if(!config.enabled){
    return writePrivateControlStatus({state:'disabled'},config.privateDir);
  }
  try{
    const file=config.sourceFile||await syncRepo(config,{gitBin});
    if(!fs.existsSync(file)){
      return writePrivateControlStatus({
        state:'ready',
        source:'private_repo',
        command_status:'missing'
      },config.privateDir);
    }
    const raw=fs.readFileSync(file,'utf8');
    const input=JSON.parse(raw);
    const result=publishPrivateControlCommand(input,{
      privateDir:config.privateDir,
      generatedDir:config.generatedDir
    });
    return writePrivateControlStatus({
      state:'ready',
      source:config.sourceFile?'fixture':'private_repo',
      command_status:result.status,
      command_id:result.command.command_id,
      command_hash:result.command_hash,
      study_day:result.command.study_day
    },config.privateDir);
  }catch(error){
    return writePrivateControlStatus({
      state:'degraded',
      source:config.sourceFile?'fixture':'private_repo',
      error:error instanceof Error?error.message:String(error)
    },config.privateDir);
  }
}
