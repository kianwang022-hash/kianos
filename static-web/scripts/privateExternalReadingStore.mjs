import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const EXTERNAL_PRIVATE_BUNDLE_SCHEMA='kianos.english.external-private-bundle.v2';

const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(here,'../..');
const compilerPath=path.join(repoRoot,'tools','english-external','compile_external_reading.py');
const publicManifestPath=path.join(repoRoot,'content','english','external','manifest.json');

const EXPECTED_FILES=Object.freeze([
  'source_manifest.json',
  ...Array.from({length:10},(_,i)=>`TOEFL/TPO${i+56}.md`),
  ...[17,18,19].map(n=>`IELTS/Cambridge_IELTS_${n}_Academic_Reading.md`)
]);

const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');

export function resolveExternalReadingSourceRoot({env=process.env,home=os.homedir()}={}){
  const configured=String(env.KIANOS_EXTERNAL_READING_SOURCE_ROOT||'').trim();
  if(configured)return path.resolve(configured);
  return path.join(home,'Documents','Study','英语资料库','EnglishOS','External_Reading_Corpus');
}

export function resolveExternalReadingPrivateDir({env=process.env,platform=process.platform,home=os.homedir()}={}){
  const configured=String(env.KIANOS_EXTERNAL_READING_DIR||'').trim();
  if(configured)return path.resolve(configured);
  if(platform==='darwin')return path.join(home,'Library','Application Support','KianOS','external-reading');
  return path.join(home,'.kianos','external-reading');
}

export function externalReadingBundlePath(privateDir=resolveExternalReadingPrivateDir()){
  return path.join(privateDir,'bundle.v2.json');
}

function readPublicManifest(){
  try{return JSON.parse(fs.readFileSync(publicManifestPath,'utf8'));}
  catch{return{};}
}

function expectedSourceHashes(){
  const hashes=readPublicManifest()?.source_runtime?.expected_active_source_sha256;
  return hashes&&typeof hashes==='object'&&!Array.isArray(hashes)?hashes:{};
}

function incrementalSourceConfig(){
  const value=readPublicManifest()?.source_runtime?.incremental_source;
  if(!value||typeof value!=='object'||Array.isArray(value))return{manifest_path:'INCREMENTAL/manifest.json',expected_manifest_sha256:''};
  return{
    manifest_path:String(value.manifest_path||'INCREMENTAL/manifest.json').trim(),
    expected_manifest_sha256:String(value.expected_manifest_sha256||'').trim()
  };
}

const safeSourcePath=(sourceRoot,relative)=>{
  const raw=String(relative||'').trim();
  if(!raw||path.isAbsolute(raw))throw new Error('EXTERNAL_INCREMENTAL_SOURCE_PATH_INVALID:'+raw);
  const resolved=path.resolve(sourceRoot,raw);
  const prefix=sourceRoot.endsWith(path.sep)?sourceRoot:sourceRoot+path.sep;
  if(resolved!==sourceRoot&&!resolved.startsWith(prefix))throw new Error('EXTERNAL_INCREMENTAL_SOURCE_PATH_ESCAPE:'+raw);
  return resolved;
};

function sourceSnapshot(sourceRoot,{allowUnregisteredIncremental=false}={}){
  const missing=[];
  const mismatches=[];
  const expected=expectedSourceHashes();
  let latest=0;
  const files=[];
  for(const relative of EXPECTED_FILES){
    const file=path.join(sourceRoot,relative);
    try{
      const stat=fs.statSync(file);
      if(!stat.isFile())throw new Error('not-file');
      latest=Math.max(latest,stat.mtimeMs);
      const actualSha=sha256(fs.readFileSync(file));
      files.push({relative,mtime_ms:stat.mtimeMs,size:stat.size,sha256:actualSha});
      const expectedSha=String(expected[relative]||'').trim();
      if(expectedSha&&expectedSha!==actualSha){
        mismatches.push({relative,expected_sha256:expectedSha,actual_sha256:actualSha});
      }
    }catch{missing.push(relative);}
  }

  let incrementalManifest=null;
  try{
    const config=incrementalSourceConfig();
    const shouldLoad=Boolean(config.expected_manifest_sha256)||Boolean(allowUnregisteredIncremental);
    if(shouldLoad){
      const relative=config.manifest_path||'INCREMENTAL/manifest.json';
      const file=safeSourcePath(sourceRoot,relative);
      if(!fs.existsSync(file)||!fs.statSync(file).isFile()){
        if(config.expected_manifest_sha256)missing.push(relative);
      }else{
        const stat=fs.statSync(file);
        const actualSha=sha256(fs.readFileSync(file));
        latest=Math.max(latest,stat.mtimeMs);
        files.push({relative,mtime_ms:stat.mtimeMs,size:stat.size,sha256:actualSha});
        if(config.expected_manifest_sha256&&config.expected_manifest_sha256!==actualSha){
          mismatches.push({relative,expected_sha256:config.expected_manifest_sha256,actual_sha256:actualSha});
        }else{
          const payload=JSON.parse(fs.readFileSync(file,'utf8'));
          if(payload?.schema!=='kian.external.incremental-manifest.v1'||!Array.isArray(payload?.objects)){
            throw new Error('EXTERNAL_INCREMENTAL_MANIFEST_INVALID');
          }
          const seen=new Set();
          for(const row of payload.objects){
            if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('EXTERNAL_INCREMENTAL_OBJECT_INVALID');
            for(const [pathKey,shaKey] of [['source_path','source_sha256'],['questions_path','questions_sha256'],['answers_path','answers_sha256']]){
              const registered=String(row[pathKey]||'').trim();
              if(!registered)continue;
              if(seen.has(registered))continue;
              seen.add(registered);
              const registeredFile=safeSourcePath(sourceRoot,registered);
              if(!fs.existsSync(registeredFile)||!fs.statSync(registeredFile).isFile()){
                missing.push(registered);
                continue;
              }
              const registeredStat=fs.statSync(registeredFile);
              const registeredSha=sha256(fs.readFileSync(registeredFile));
              latest=Math.max(latest,registeredStat.mtimeMs);
              files.push({relative:registered,mtime_ms:registeredStat.mtimeMs,size:registeredStat.size,sha256:registeredSha});
              const expectedRegisteredSha=String(row[shaKey]||'').trim();
              if(!expectedRegisteredSha||expectedRegisteredSha!==registeredSha){
                mismatches.push({relative:registered,expected_sha256:expectedRegisteredSha||'missing',actual_sha256:registeredSha});
              }
            }
          }
          incrementalManifest=file;
        }
      }
    }
  }catch(error){
    return{missing,mismatches,latest,files,incremental_manifest:null,error:error instanceof Error?error.message:String(error)};
  }
  return{missing,mismatches,latest,files,incremental_manifest:incrementalManifest,error:null};
}

export function validateExternalReadingPrivateBundle(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('EXTERNAL_PRIVATE_BUNDLE_OBJECT_REQUIRED');
  if(value.schema!==EXTERNAL_PRIVATE_BUNDLE_SCHEMA)throw new Error('EXTERNAL_PRIVATE_BUNDLE_SCHEMA_INVALID');
  const counts=value.counts||{};
  if(counts?.toefl?.collections!==10||counts?.toefl?.passages!==30||counts?.toefl?.questions!==395||counts?.toefl?.answer_slots!==395){
    throw new Error('EXTERNAL_PRIVATE_BUNDLE_TOEFL_COUNTS_INVALID');
  }
  if(counts?.ielts?.books!==3||counts?.ielts?.tests!==12||counts?.ielts?.passages!==36||counts?.ielts?.questions!==480){
    throw new Error('EXTERNAL_PRIVATE_BUNDLE_IELTS_COUNTS_INVALID');
  }
  const incrementalObjects=Number(counts?.incremental?.objects||0);
  if(!Number.isInteger(incrementalObjects)||incrementalObjects<0)throw new Error('EXTERNAL_PRIVATE_BUNDLE_INCREMENTAL_COUNTS_INVALID');
  if(!Array.isArray(value.passages)||value.passages.length!==66+incrementalObjects)throw new Error('EXTERNAL_PRIVATE_BUNDLE_PASSAGES_INVALID');
  const ids=value.passages.map(p=>String(p?.passage_id||''));
  if(ids.some(id=>!id)||new Set(ids).size!==ids.length)throw new Error('EXTERNAL_PRIVATE_BUNDLE_IDS_INVALID');
  return value;
}

export function ensureExternalReadingPrivateBundle({
  sourceRoot=resolveExternalReadingSourceRoot(),
  privateDir=resolveExternalReadingPrivateDir(),
  force=false,
  enforceSourceHashGate=true,
  allowUnregisteredIncremental=false
}={}){
  const snapshot=sourceSnapshot(sourceRoot,{allowUnregisteredIncremental});
  if(snapshot.error){
    return{status:'invalid_source',source_root:sourceRoot,error:snapshot.error,bundle:null};
  }
  if(snapshot.missing.length){
    return{status:'missing_source',source_root:sourceRoot,missing:snapshot.missing,bundle:null};
  }
  if(enforceSourceHashGate&&snapshot.mismatches.length){
    return{status:'stale_source',source_root:sourceRoot,mismatches:snapshot.mismatches,bundle:null};
  }
  const bundleFile=externalReadingBundlePath(privateDir);
  let mustCompile=Boolean(force);
  try{
    const stat=fs.statSync(bundleFile);
    if(!stat.isFile()||stat.mtimeMs<snapshot.latest)mustCompile=true;
  }catch{mustCompile=true;}

  if(mustCompile){
    fs.mkdirSync(privateDir,{recursive:true,mode:0o700});
    try{fs.chmodSync(privateDir,0o700);}catch{}
    const temp=bundleFile+'.tmp-'+process.pid+'-'+Date.now();
    const compilerArgs=[
      compilerPath,
      '--source-root',sourceRoot,
      '--output',temp
    ];
    if(snapshot.incremental_manifest)compilerArgs.push('--incremental-manifest',snapshot.incremental_manifest);
    const run=spawnSync('python3',compilerArgs,{encoding:'utf8',maxBuffer:32*1024*1024});
    if(run.status!==0){
      try{fs.unlinkSync(temp);}catch{}
      return{
        status:'compile_error',
        source_root:sourceRoot,
        error:String(run.stderr||run.stdout||'External compiler failed').trim(),
        bundle:null
      };
    }
    try{
      const parsed=validateExternalReadingPrivateBundle(JSON.parse(fs.readFileSync(temp,'utf8')));
      fs.renameSync(temp,bundleFile);
      try{fs.chmodSync(bundleFile,0o600);}catch{}
      return{status:'ready',source_root:sourceRoot,bundle:parsed,bundle_path:bundleFile,compiled:true,source_hash_gate:'matched'};
    }catch(error){
      try{fs.unlinkSync(temp);}catch{}
      return{status:'invalid',source_root:sourceRoot,error:error instanceof Error?error.message:String(error),bundle:null};
    }
  }

  try{
    const parsed=validateExternalReadingPrivateBundle(JSON.parse(fs.readFileSync(bundleFile,'utf8')));
    return{status:'ready',source_root:sourceRoot,bundle:parsed,bundle_path:bundleFile,compiled:false,source_hash_gate:'matched'};
  }catch(error){
    return{status:'invalid',source_root:sourceRoot,error:error instanceof Error?error.message:String(error),bundle:null};
  }
}

function passageRevision(passage){
  return sha256(JSON.stringify({
    passage_id:passage.passage_id,
    source_family:passage.source_family,
    source_format:passage.source_format,
    source_refs:passage.source_refs,
    source_url:passage.source_url||null,
    question_origin:passage.question_origin||null,
    completion_requirement:passage.completion_requirement||'READ_ONLY_OK',
    passage_text:passage.passage_text,
    passage_blocks:passage.passage_blocks||null,
    source_figures:passage.source_figures||[],
    questions:passage.questions,
    answer_key:passage.answer_key,
    warnings:passage.warnings
  }));
}

export function externalReadingCatalog(state=ensureExternalReadingPrivateBundle()){
  if(state.status!=='ready')return{status:state.status,error:state.error||null,missing:state.missing||[],mismatches:state.mismatches||[],source_root:state.source_root,collections:[],counts:null};
  const passages=state.bundle.passages;
  const collections=[];
  const preferred=['TOEFL_TPO','IELTS_ACADEMIC','TOEFL_CURRENT','FUTURE_INCREMENTAL'];
  const discovered=[...new Set(passages.map(p=>String(p.source_family||'FUTURE_INCREMENTAL')))];
  const families=[...preferred.filter(f=>discovered.includes(f)),...discovered.filter(f=>!preferred.includes(f))];
  for(const family of families){
    const familyPassages=passages.filter(p=>p.source_family===family);
    const names=[...new Set(familyPassages.map(p=>p.collection))];
    for(const name of names){
      const rows=familyPassages.filter(p=>p.collection===name).map(p=>({
        object_id:p.passage_id,
        passage_id:p.passage_id,
        source_family:p.source_family,
        source_format:p.source_format,
        collection:p.collection,
        test:p.test,
        passage_number:p.passage_number,
        title:p.title,
        question_count:Array.isArray(p.questions)?p.questions.length:0,
        answer_key_status:p.answer_key_status,
        warnings:p.warnings||[],
        source_hash:p.source_refs?.[0]?.sha256||null,
        content_hash:passageRevision(p)
      }));
      collections.push({source_family:family,collection:name,passages:rows});
    }
  }
  return{
    status:'ready',
    counts:state.bundle.counts,
    source_quality:state.bundle.source_quality,
    cognition_boundary:state.bundle.cognition_boundary,
    source_hash_gate:state.source_hash_gate||'matched',
    collections
  };
}

export function externalReadingPassage(objectId,state=ensureExternalReadingPrivateBundle()){
  if(state.status!=='ready')throw new Error('EXTERNAL_PRIVATE_BUNDLE_NOT_READY:'+state.status);
  const passage=state.bundle.passages.find(p=>p.passage_id===objectId);
  if(!passage)throw new Error('EXTERNAL_READING_OBJECT_NOT_FOUND:'+objectId);
  return{
    schema:'kianos.english.external-passage-view.v1',
    object_id:passage.passage_id,
    source_family:passage.source_family,
    source_format:passage.source_format,
    collection:passage.collection,
    test:passage.test,
    passage_number:passage.passage_number,
    title:passage.title,
    source_url:passage.source_url||null,
    question_origin:passage.question_origin||((passage.questions||[]).length?'SOURCE_NATIVE':'NONE'),
    completion_requirement:passage.completion_requirement||'READ_ONLY_OK',
    passage_text:passage.passage_text,
    passage_paragraphs:passage.passage_paragraphs,
    passage_blocks:Array.isArray(passage.passage_blocks)?passage.passage_blocks:null,
    source_figures:Array.isArray(passage.source_figures)?passage.source_figures:[],
    questions:(passage.questions||[]).map(q=>({
      question_id:q.question_id,
      ordinal:q.ordinal,
      source_ordinal:q.source_ordinal,
      prompt:q.prompt,
      options:q.options,
      source_text:q.source_text,
      response_kind:q.response_kind,
      response_limit:q.response_limit,
      warnings:q.warnings||[]
    })),
    answer_key_status:passage.answer_key_status,
    warnings:passage.warnings||[],
    source_hash:passage.source_refs?.[0]?.sha256||null,
    content_hash:passageRevision(passage)
  };
}

export function externalReadingAnswers(objectId,state=ensureExternalReadingPrivateBundle()){
  if(state.status!=='ready')throw new Error('EXTERNAL_PRIVATE_BUNDLE_NOT_READY:'+state.status);
  const passage=state.bundle.passages.find(p=>p.passage_id===objectId);
  if(!passage)throw new Error('EXTERNAL_READING_OBJECT_NOT_FOUND:'+objectId);
  return{
    schema:'kianos.english.external-answer-view.v1',
    object_id:passage.passage_id,
    content_hash:passageRevision(passage),
    answer_key_status:passage.answer_key_status,
    answers:passage.answer_key,
    answer_key_source_text:passage.answer_key_status==='SOURCE_BACKED'?'':passage.answer_key_source_text
  };
}
