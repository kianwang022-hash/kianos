import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readPrivateLearnerCheckpoint, resolvePrivateLearnerDir } from './privateLearnerStore.mjs';
import { buildSubjectResumeMailbox } from './privateResumeMailbox.mjs';

const execFileAsync=promisify(execFile);
const DEFAULT_REPO_URL='https://github.com/kianwang022-hash/kian-personal-os.git';
const DEFAULT_BRANCH='runtime/kianos-learner-resume';
const DEFAULT_PATH='runtime/kianos-resume/current.json';

const clean=(v,n=1000)=>String(v??'').trim().slice(0,n);

export function resolvePrivateResumeRepoDir({env=process.env,home=os.homedir()}={}){
  const configured=clean(env.KIANOS_RESUME_REPO_DIR,4000);
  if(configured)return path.resolve(configured);
  return process.platform==='darwin'
    ?path.join(home,'Library','Application Support','KianOS','resume-relay-repo')
    :path.join(home,'.kianos','resume-relay-repo');
}

export function privateResumeRelayConfig({env=process.env,home=os.homedir()}={}){
  return{
    enabled:String(env.KIANOS_RESUME_RELAY_ENABLED??'1')!=='0',
    repoUrl:clean(env.KIANOS_RESUME_REPO_URL,4000)||DEFAULT_REPO_URL,
    repoDir:resolvePrivateResumeRepoDir({env,home}),
    branch:clean(env.KIANOS_RESUME_BRANCH,240)||DEFAULT_BRANCH,
    mailboxPath:clean(env.KIANOS_RESUME_PATH,800)||DEFAULT_PATH,
    privateDir:resolvePrivateLearnerDir({env,home})
  };
}

async function run(bin,args,{cwd,env=process.env,allowFailure=false}={}){
  try{
    const r=await execFileAsync(bin,args,{cwd,env:{...env,GIT_TERMINAL_PROMPT:'0'},maxBuffer:8*1024*1024});
    return String(r.stdout||'').trim();
  }catch(error){
    if(allowFailure)return null;
    throw error;
  }
}

async function ensureRepo(config,{gitBin='git'}={}){
  if(fs.existsSync(path.join(config.repoDir,'.git')))return;
  fs.mkdirSync(config.repoDir,{recursive:true,mode:0o700});
  await run(gitBin,['init'],{cwd:config.repoDir});
  await run(gitBin,['remote','add','origin',config.repoUrl],{cwd:config.repoDir});
  try{fs.chmodSync(config.repoDir,0o700);}catch{}
}

async function readRemoteMailbox(config,{gitBin='git'}={}){
  await ensureRepo(config,{gitBin});
  const ref='refs/remotes/origin/kianos-learner-resume-runtime';
  const fetched=await run(gitBin,['fetch','--depth','1','origin','refs/heads/'+config.branch+':'+ref],{cwd:config.repoDir,allowFailure:true});
  if(fetched===null)return null;
  return await run(gitBin,['show',ref+':'+config.mailboxPath],{cwd:config.repoDir,allowFailure:true});
}

async function publishRootSnapshot(config,bytes,{gitBin='git'}={}){
  await ensureRepo(config,{gitBin});
  const dir=fs.mkdtempSync(path.join(config.repoDir,'.resume-publish-'));
  const source=path.join(dir,'current.json');
  const index=path.join(dir,'index');
  fs.writeFileSync(source,bytes,{encoding:'utf8',mode:0o600});
  const env={
    ...process.env,
    GIT_INDEX_FILE:index,
    GIT_AUTHOR_NAME:'KianOS Resume Relay',
    GIT_AUTHOR_EMAIL:'kianos-resume@local.invalid',
    GIT_COMMITTER_NAME:'KianOS Resume Relay',
    GIT_COMMITTER_EMAIL:'kianos-resume@local.invalid'
  };
  try{
    const blob=await run(gitBin,['hash-object','-w',source],{cwd:config.repoDir,env});
    await run(gitBin,['read-tree','--empty'],{cwd:config.repoDir,env});
    await run(gitBin,['update-index','--add','--cacheinfo','100644',blob,config.mailboxPath],{cwd:config.repoDir,env});
    const tree=await run(gitBin,['write-tree'],{cwd:config.repoDir,env});
    const commit=await run(gitBin,['commit-tree',tree,'-m','Current KianOS learner Resume mailbox'],{cwd:config.repoDir,env});
    await run(gitBin,['push','--force','origin',commit+':refs/heads/'+config.branch],{cwd:config.repoDir,env});
    return commit;
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
}

export async function syncPrivateResumeRelayOnce({env=process.env,home=os.homedir(),gitBin='git',now=Date.now()}={}){
  const config=privateResumeRelayConfig({env,home});
  if(!config.enabled)return{state:'disabled'};
  const checkpoint=readPrivateLearnerCheckpoint(config.privateDir);
  if(!checkpoint)return{state:'missing',reason:'private-checkpoint-missing'};
  const mailbox=buildSubjectResumeMailbox(checkpoint,{now});
  const bytes=JSON.stringify(mailbox,null,2)+'\n';
  const prior=await readRemoteMailbox(config,{gitBin});
  if(prior!=null&&prior.trim()===bytes.trim()){
    return{state:'ready',status:'idempotent',study_day:mailbox.study_day,source_checkpoint_id:mailbox.source_checkpoint_id};
  }
  const commit=await publishRootSnapshot(config,bytes,{gitBin});
  return{state:'ready',status:'published',branch:config.branch,path:config.mailboxPath,commit,study_day:mailbox.study_day,source_checkpoint_id:mailbox.source_checkpoint_id};
}
