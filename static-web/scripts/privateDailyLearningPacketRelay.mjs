import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readPrivateLearnerCheckpoint, resolvePrivateLearnerDir } from './privateLearnerStore.mjs';

const execFileAsync=promisify(execFile);

const DEFAULT_REPO_URL='https://github.com/kianwang022-hash/kian-personal-os.git';
const DEFAULT_BRANCH='runtime/kianos-learning';
const DEFAULT_CURRENT_PATH='runtime/kianos-learning/current.json';
const DEFAULT_DAILY_PREFIX='runtime/kianos-learning/daily';

const clean=(value,max=4000)=>String(value??'').trim().slice(0,max);
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)
  &&!Number.isNaN(Date.parse(day+'T00:00:00Z'));

function validatePacket(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('KIANOS_PACKET_OBJECT_REQUIRED');
  if(value.schema!=='kianos.daily-learning-packet.v1')throw new Error('KIANOS_PACKET_SCHEMA_INVALID');
  if(!validDay(value.study_day))throw new Error('KIANOS_PACKET_DAY_INVALID');
  if(!value.generated_at||Number.isNaN(Date.parse(value.generated_at)))throw new Error('KIANOS_PACKET_GENERATED_AT_INVALID');
  if(!value.subjects||typeof value.subjects!=='object'||Array.isArray(value.subjects))throw new Error('KIANOS_PACKET_SUBJECTS_INVALID');
  for(const subject of ['xizong','english','politics']){
    if(!value.subjects[subject]||typeof value.subjects[subject]!=='object')throw new Error('KIANOS_PACKET_SUBJECT_MISSING:'+subject);
  }
  return JSON.parse(JSON.stringify(value));
}

function materialPacket(value){
  const packet=JSON.parse(JSON.stringify(validatePacket(value)));
  delete packet.generated_at;
  for(const subject of ['xizong','english','politics']){
    const evidence=packet.subjects?.[subject]?.evidence;
    if(evidence&&typeof evidence==='object'&&!Array.isArray(evidence)){
      delete evidence.generated_at;
      delete evidence.exported_at;
    }
  }
  return packet;
}

function materiallyEqual(a,b){
  return JSON.stringify(materialPacket(a))===JSON.stringify(materialPacket(b));
}

// A successful Git push proves transport only. Report evidence separately from
// the exact packet accepted by the relay, without re-projecting in the server.
function evidenceStatus(packet){
  return {
    learner_evidence_ready: Boolean(packet.learner_evidence_basis)
      && ['xizong','english','politics'].every(subject=>packet.coverage?.[subject]==='attached'),
    coverage: packet.coverage || null,
    generated_at: packet.generated_at
  };
}

function packetOrder(a,b){
  if(a.study_day!==b.study_day)return a.study_day.localeCompare(b.study_day);
  return Date.parse(a.generated_at)-Date.parse(b.generated_at);
}

export function resolvePrivatePacketRepoDir({env=process.env,home=os.homedir()}={}){
  const configured=clean(env.KIANOS_PACKET_REPO_DIR);
  if(configured)return path.resolve(configured);
  return process.platform==='darwin'
    ?path.join(home,'Library','Application Support','KianOS','packet-relay-repo')
    :path.join(home,'.kianos','packet-relay-repo');
}

export function privatePacketRelayConfig({env=process.env,home=os.homedir()}={}){
  return{
    enabled:String(env.KIANOS_PACKET_RELAY_ENABLED??'1')!=='0',
    repoUrl:clean(env.KIANOS_PACKET_REPO_URL)||DEFAULT_REPO_URL,
    repoDir:resolvePrivatePacketRepoDir({env,home}),
    branch:clean(env.KIANOS_PACKET_BRANCH,240)||DEFAULT_BRANCH,
    currentPath:clean(env.KIANOS_PACKET_CURRENT_PATH,800)||DEFAULT_CURRENT_PATH,
    dailyPrefix:clean(env.KIANOS_PACKET_DAILY_PREFIX,800)||DEFAULT_DAILY_PREFIX,
    privateDir:resolvePrivateLearnerDir({env,home})
  };
}

async function run(bin,args,{cwd,env=process.env,allowFailure=false}={}){
  try{
    const result=await execFileAsync(bin,args,{
      cwd,
      env:{...env,GIT_TERMINAL_PROMPT:'0'},
      maxBuffer:16*1024*1024
    });
    return String(result.stdout||'').trim();
  }catch(error){
    if(allowFailure)return null;
    throw error;
  }
}

async function ensureRepo(config,{gitBin='git'}={}){
  const exists=fs.existsSync(path.join(config.repoDir,'.git'));
  if(!exists){
    fs.mkdirSync(config.repoDir,{recursive:true,mode:0o700});
    await run(gitBin,['init'],{cwd:config.repoDir});
    await run(gitBin,['remote','add','origin',config.repoUrl],{cwd:config.repoDir});
    try{fs.chmodSync(config.repoDir,0o700);}catch{}
  }
  await run(gitBin,['config','gc.auto','500'],{cwd:config.repoDir,allowFailure:true});
}

async function fetchRuntimeRef(config,{gitBin='git'}={}){
  await ensureRepo(config,{gitBin});
  const ref='refs/remotes/origin/kianos-learning-runtime';
  const fetched=await run(gitBin,[
    'fetch','--depth','1','origin',
    '+refs/heads/'+config.branch+':'+ref
  ],{cwd:config.repoDir,allowFailure:true});
  if(fetched===null)return null;
  const sha=await run(gitBin,['rev-parse',ref],{cwd:config.repoDir});
  return{ref,sha};
}

async function showFile(config,remote,file,{gitBin='git'}={}){
  if(!remote?.ref)return null;
  return await run(gitBin,['show',remote.ref+':'+file],{
    cwd:config.repoDir,
    allowFailure:true
  });
}

function parsePacket(raw,label){
  if(raw==null)return null;
  try{return validatePacket(JSON.parse(raw));}
  catch(error){throw new Error(label+':'+(error instanceof Error?error.message:String(error)));}
}

async function publishRootTree(config,{remote,newPacket,sealRaw=null,sealDay=null,gitBin='git'}={}){
  const temp=fs.mkdtempSync(path.join(config.repoDir,'.packet-publish-'));
  const index=path.join(temp,'index');
  const env={
    ...process.env,
    GIT_INDEX_FILE:index,
    GIT_AUTHOR_NAME:'KianOS Packet Relay',
    GIT_AUTHOR_EMAIL:'kianos-packet@local.invalid',
    GIT_COMMITTER_NAME:'KianOS Packet Relay',
    GIT_COMMITTER_EMAIL:'kianos-packet@local.invalid'
  };
  try{
    if(remote?.ref)await run(gitBin,['read-tree',remote.ref],{cwd:config.repoDir,env});
    else await run(gitBin,['read-tree','--empty'],{cwd:config.repoDir,env});

    const writeBlob=async(file,bytes)=>{
      const local=path.join(temp,path.basename(file)+'-'+Date.now());
      fs.writeFileSync(local,bytes,{encoding:'utf8',mode:0o600});
      const blob=await run(gitBin,['hash-object','-w',local],{cwd:config.repoDir,env});
      await run(gitBin,['update-index','--add','--cacheinfo','100644',blob,file],{cwd:config.repoDir,env});
    };

    if(sealRaw&&sealDay){
      await writeBlob(config.dailyPrefix+'/'+sealDay+'.json',sealRaw.endsWith('\n')?sealRaw:sealRaw+'\n');
    }
    const packetBytes=JSON.stringify(newPacket,null,2)+'\n';
    await writeBlob(config.currentPath,packetBytes);

    const tree=await run(gitBin,['write-tree'],{cwd:config.repoDir,env});
    const commit=await run(gitBin,['commit-tree',tree,'-m','Current KianOS Daily Learning Packet'],{cwd:config.repoDir,env});
    const remoteHead='refs/heads/'+config.branch;
    const expected=remote?.sha||'';
    await run(gitBin,[
      'push',
      '--force-with-lease='+remoteHead+':'+expected,
      'origin',
      commit+':'+remoteHead
    ],{cwd:config.repoDir,env});
    await run(gitBin,['gc','--auto','--quiet'],{
      cwd:config.repoDir,
      env,
      allowFailure:true
    });
    return commit;
  }finally{
    fs.rmSync(temp,{recursive:true,force:true});
  }
}

export async function publishDailyLearningPacket(input,{
  env=process.env,
  home=os.homedir(),
  gitBin='git',
  trustedCheckpointReprojection=false
}={}){
  const packet=validatePacket(input);
  const config=privatePacketRelayConfig({env,home});
  if(!config.enabled)return{state:'disabled'};

  const remote=await fetchRuntimeRef(config,{gitBin});
  const currentRaw=await showFile(config,remote,config.currentPath,{gitBin});
  const current=parsePacket(currentRaw,'KIANOS_PACKET_REMOTE_CURRENT_INVALID');

  if(current){
    const order=packetOrder(packet,current);
    if(order<0)throw new Error('KIANOS_PACKET_OLDER_THAN_REMOTE_CURRENT');
    if(order===0&&!materiallyEqual(packet,current)&&!trustedCheckpointReprojection){
      throw new Error('KIANOS_PACKET_SAME_IDENTITY_CONFLICT');
    }
    if(packet.study_day===current.study_day&&materiallyEqual(packet,current)){
      return{state:'ready',status:'idempotent',study_day:current.study_day,...evidenceStatus(current)};
    }
  }

  let sealRaw=null;
  let sealDay=null;
  if(current&&packet.study_day>current.study_day){
    sealDay=current.study_day;
    const dailyPath=config.dailyPrefix+'/'+sealDay+'.json';
    const existingDailyRaw=await showFile(config,remote,dailyPath,{gitBin});
    if(existingDailyRaw!=null){
      const existingDaily=parsePacket(existingDailyRaw,'KIANOS_PACKET_REMOTE_DAILY_INVALID');
      if(!materiallyEqual(existingDaily,current)){
        throw new Error('KIANOS_PACKET_DAILY_SEAL_CONFLICT:'+sealDay);
      }
    }else{
      sealRaw=currentRaw;
    }
  }

  const commit=await publishRootTree(config,{
    remote,
    newPacket:packet,
    sealRaw,
    sealDay,
    gitBin
  });

  return{
    state:'ready',
    status:'published',
    branch:config.branch,
    current_path:config.currentPath,
    sealed_day:sealDay,
    commit,
    study_day:packet.study_day,
    ...evidenceStatus(packet)
  };
}

export async function syncPrivateDailyLearningPacketOnce({
  env=process.env,
  home=os.homedir(),
  gitBin='git',
  privateDir=null
}={}){
  const config=privatePacketRelayConfig({env,home});
  if(privateDir)config.privateDir=path.resolve(privateDir);
  if(!config.enabled)return{state:'disabled'};
  const checkpoint=readPrivateLearnerCheckpoint(config.privateDir);
  if(!checkpoint)return{state:'missing',reason:'private-checkpoint-missing'};
  const { buildDailyLearningPacketFromPrivateCheckpoint } = await import('./privateDailyLearningPacket.mjs');
  const projection=buildDailyLearningPacketFromPrivateCheckpoint(checkpoint);
  return publishDailyLearningPacket(projection.packet,{
    env,
    home,
    gitBin,
    // The private checkpoint is the trusted durable source for this projection.
    // A newer runtime may deterministically materialize additional packet fields
    // from the same checkpoint identity; ordinary callers remain fail-closed.
    trustedCheckpointReprojection:true
  });
}
