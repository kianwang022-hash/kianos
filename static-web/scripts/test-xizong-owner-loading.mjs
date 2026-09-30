import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const self=fileURLToPath(import.meta.url);
const root=path.resolve(path.dirname(self),'../..');

// Execute the real loaders in an isolated child module graph. Only this child's
// filesystem reads see synthetic owner changes; no Content/learner writes occur.
async function nativeProbe(kind) {
  const read=fs.readFileSync.bind(fs), exists=fs.existsSync.bind(fs), list=fs.readdirSync.bind(fs);
  const system='content/xizong/knowledge/systems/a1-circulation/system.json';
  const manifest='content/xizong/knowledge/learner/c-hematology-immunity-infection-learning.json';
  const shardDir=path.join(root,'content/xizong/knowledge/learner/c-hematology-immunity-infection-learning');
  let unlistedReads=0;
  fs.readFileSync=(file,...args)=>{
    const f=String(file);
    if(f===path.join(shardDir,'zz-unlisted.json')){
      unlistedReads++;
      return JSON.stringify({system_id:'hematology-immunity-infection',canonical_id:'C',authority:'CHAT_APPROVED_TEST',blocks:{'unlisted-block':{}}});
    }
    let result=read(file,...args);
    if(kind==='grouped-route'&&f===path.join(root,system)){
      const j=JSON.parse(result);j.block_route=[{id:'test-group',blocks:j.block_route}];result=JSON.stringify(j);
    }
    if(kind==='undeclared-shard'&&f===path.join(root,manifest)){
      const j=JSON.parse(result);j.storage.shards=j.storage.shards.slice(0,-1);result=JSON.stringify(j);
    }
    return result;
  };
  if(kind==='unlisted-sibling') {
    fs.existsSync=file=>String(file)===path.join(shardDir,'zz-unlisted.json')||exists(file);
    fs.readdirSync=(dir,...args)=>{
      const rows=list(dir,...args);
      if(String(dir)===shardDir) rows.push(args[0]?.withFileTypes
        ? {name:'zz-unlisted.json',isFile:()=>true,isDirectory:()=>false}: 'zz-unlisted.json');
      return rows;
    };
  }
  const {loadXizongSystem}=await import('../src/lib/xizong.mjs');
  const {loadXizongSemanticSystem}=await import('../src/lib/xizongSemanticAdapter.mjs');
  const id=kind==='grouped-route'?'circulation':'hematology-immunity-infection';
  const outcomes={};
  for(const [name,load] of [['canonical',loadXizongSystem],['semantic',loadXizongSemanticSystem]]) {
    try {const s=load(id);outcomes[name]={ok:true,ids:s.blocks.map(b=>b.blockId)};}
    catch(e){outcomes[name]={ok:false,error:String(e.message)};}
  }
  console.log(JSON.stringify({kind,...outcomes,unlistedReads}));
}

function probe(kind) {
  return JSON.parse(execFileSync(process.execPath,[self,'--native-probe',kind],{
    cwd:path.join(root,'static-web'),encoding:'utf8',timeout:20000,
    env:{...process.env,KIANOS_REPO_ROOT:root,KIANOS_XIZONG_BUILD_CACHE:'0'}
  }));
}

export async function assertXizongOwnerLoading() {
  const {normalizeAcceptedBlockRoute,hydrateAcceptedLearningOwner}=await import('../src/lib/xizongAcceptedLearningOwner.mjs');
  let checks=0;
  const check=(ok,label)=>{assert.ok(ok,label);checks++;};
  const rejects=(fn,pattern)=>{assert.throws(fn,pattern);checks++;};
  const a={id:'a-b01',title:'one'},b={id:'a-b02',label:'B2'};
  check(JSON.stringify(normalizeAcceptedBlockRoute({block_route:[a,b]}))===JSON.stringify([a,b]),'direct route fields preserved');
  check(JSON.stringify(normalizeAcceptedBlockRoute({block_route:[{blocks:[a,b]}]}))===JSON.stringify([a,b]),'grouped route flattens once');
  check(JSON.stringify(normalizeAcceptedBlockRoute({block_families:[{blocks:[a,b]}]}))===JSON.stringify([a,b]),'family object members preserve identity/metadata');
  check(normalizeAcceptedBlockRoute({block_families:[{blocks:['a-b01','a-b02']}]}).map(x=>x.id).join(',')==='a-b01,a-b02','family string members');
  check(normalizeAcceptedBlockRoute({block_route:[a,b],block_families:[{blocks:[b,a]}]}).map(x=>x.id).join(',')==='a-b01,a-b02','explicit learner route overrides conceptual family order');
  check(normalizeAcceptedBlockRoute({}).length===0,'missing route not invented');
  rejects(()=>normalizeAcceptedBlockRoute({block_route:'invalid',block_families:[{blocks:[a]}]}),/ROUTE_CONTAINER_INVALID/);
  rejects(()=>normalizeAcceptedBlockRoute({block_families:{blocks:[a]}}),/ROUTE_CONTAINER_INVALID/);
  rejects(()=>normalizeAcceptedBlockRoute({block_route:[a,a]}),/ROUTE_DUPLICATE/);
  rejects(()=>normalizeAcceptedBlockRoute({block_families:[{blocks:[a]},{blocks:[a]}]}),/ROUTE_DUPLICATE/);
  rejects(()=>normalizeAcceptedBlockRoute({block_route:[a,{blocks:[b]}]}),/ROUTE_MIXED_SHAPES/);
  rejects(()=>normalizeAcceptedBlockRoute({block_route:[a,null]}),/ROUTE_ROW_INVALID/);
  rejects(()=>normalizeAcceptedBlockRoute({block_route:[{blocks:[]}]}),/ROUTE_GROUP_EMPTY/);
  rejects(()=>normalizeAcceptedBlockRoute({block_families:[{blocks:['']}]}),/ROUTE_ROW_INVALID/);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-owner-loading-test-'));
  try {
    const file='owners/test-learning.json',rootOwner={system_id:'test',canonical_id:'T',status:'CURRENT',authority:'CHAT_APPROVED_TEST',blocks:{}};
    const shardDir=path.join(tmp,'owners/test-learning');fs.mkdirSync(path.join(shardDir,'nested'),{recursive:true});
    const shard={system_id:'test',canonical_id:'T',authority:'CHAT_APPROVED_TEST',blocks:{T1:{kp_count:2}}};
    fs.writeFileSync(path.join(shardDir,'nested/one.json'),JSON.stringify(shard));
    fs.writeFileSync(path.join(shardDir,'unlisted.json'),'not valid JSON; not an owner');
    const owner={...rootOwner,storage:{mode:'SHARDED_BLOCK_LEARNING_OWNER',shards:['test-learning/nested/one.json']}};
    const hydrate=learning=>hydrateAcceptedLearningOwner({repoRoot:tmp,learningPath:file,learning});
    const h=hydrate(owner);
    const expectedHash=crypto.createHash('sha256').update([JSON.stringify(owner),JSON.stringify(shard)].join('\n')).digest('hex');
    check(h.sourceHash===expectedHash,'retains existing Learning fingerprint algorithm');
    rejects(()=>hydrate({...owner,status:'RETIRED'}),/OWNER_INVALID/);
    rejects(()=>hydrate({...owner,authority:'UNREVIEWED'}),/OWNER_INVALID/);
    check(h.owner.blocks.T1.kp_count===2&&h.shardPaths.length===1,'listed nested shard is read');
    check(h.shardPaths[0]==='owners/test-learning/nested/one.json','exact provenance path retained');
    check(!Object.keys(rootOwner.blocks).length&&!Object.keys(owner.blocks).length,'input owner never mutated');
    check(hydrate(rootOwner).shardPaths.length===0,'directory without declaration cannot create owner');
    check(hydrate({...rootOwner,blocks:{T2:{}}}).owner.blocks.T2!==undefined,'inline owner preserved');
    check(hydrate({...owner,blocks:{T2:{}}}).owner.blocks.T2!==undefined,'inline and declared disjoint shards composed');
    rejects(()=>hydrate({...owner,blocks:{T1:{}}}),/SHARD_BLOCK_DUPLICATE/);
    const withShards=shards=>({...owner,storage:{...owner.storage,shards}});
    rejects(()=>hydrate(withShards([])),/SHARDS_MISSING/);
    rejects(()=>hydrate(withShards(['test-learning/missing.json'])),/SHARD_MISSING/);
    rejects(()=>hydrate(withShards(['test-learning/nested/one.json','test-learning/nested/one.json'])),/SHARD_PATH_DUPLICATE/);
    rejects(()=>hydrate(withShards(['../outside.json'])),/SHARD_PATH_INVALID/);
    rejects(()=>hydrate(withShards(['/tmp/outside.json'])),/SHARD_PATH_INVALID/);
    rejects(()=>hydrate(withShards(['test-learning/../one.json'])),/SHARD_PATH_INVALID/);
    rejects(()=>hydrate({...owner,storage:{...owner.storage,mode:'UNKNOWN'}}),/STORAGE_MODE_INVALID/);
    for(const [delta,pattern] of [[{system_id:'other'},/SHARD_IDENTITY/],[{canonical_id:'OTHER'},/SHARD_IDENTITY/],[{authority:'UNREVIEWED'},/SHARD_AUTHORITY/],[{blocks:[]},/SHARD_BLOCKS_INVALID/]]) {
      fs.writeFileSync(path.join(shardDir,'nested/one.json'),JSON.stringify({...shard,...delta}));
      rejects(()=>hydrate(owner),pattern);
    }
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
  const grouped=probe('grouped-route');
  check(grouped.canonical.ok&&grouped.semantic.ok,'real dual loaders consume grouped route');
  check(JSON.stringify(grouped.canonical.ids)===JSON.stringify(grouped.semantic.ids)&&grouped.canonical.ids.length===12,'dual loaders same full route');
  const undeclared=probe('undeclared-shard');
  check(!undeclared.canonical.ok&&!undeclared.semantic.ok,'both reject incomplete declared shard coverage; cannot rediscover removed membership');
  const sibling=probe('unlisted-sibling');
  check(sibling.canonical.ok&&sibling.semantic.ok&&sibling.unlistedReads===0,'neither reads undeclared sibling JSON');
  check(sibling.canonical.ids.length===27&&JSON.stringify(sibling.canonical.ids)===JSON.stringify(sibling.semantic.ids),'full C route retained');
  console.log(`Xizong owner-loading PASS: ${checks} checks; exact manifest shards and one structural route; native dual-loader probes.`);
  return {checks,grouped,undeclared,sibling};
}

if(process.argv[2]==='--native-probe') await nativeProbe(process.argv[3]);
else if(process.argv[2]==='--baseline-probes') {
  for(const kind of ['grouped-route','undeclared-shard','unlisted-sibling'])console.log(JSON.stringify(probe(kind)));
} else if(process.argv[1]&&fs.realpathSync(process.argv[1])===fs.realpathSync(self)) await assertXizongOwnerLoading();
