import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import { parseFragment } from 'parse5';
import { classifyStaticBuild, requiresStaticRuntimeReload } from './currentStaticImpact.mjs';
import { clientBuildContextHash, planClientArtifactBuild, clientProofDigest, CLIENT_PROOF_FILE } from './currentClientArtifacts.mjs';
import { loadStudyhub, assembleStudyhub, renderStudyhub, resolveSourceLink, STUDYHUB_SOURCE, STUDYHUB_CACHE } from '../src/lib/studyhubContent.mjs';
const checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
function visibleText(html, adapted=false){
  const walk=node=>{
    if(adapted&&(node.tagName==='button'||node.attrs?.some(a=>a.name==='data-sh-ui')))return '';
    return node.nodeName==='#text'?node.value:(node.childNodes||[]).map(walk).join(' ');
  };
  return walk(parseFragment(html)).replace(/\s+/g,' ').trim();
}
const fixture={
  'WORLD_MAP.md':'# Synthetic test map\n\n## 13 zones\n\n| 1. Example | scope | [Read](assets/article.md) |\n\n## Research\n\n[Not adopted](assets/research.md)\n',
  'assets/article.md':'# Synthetic article\n\nLogic: [Existing background](logic.md#existing)\n\nA new example. [Further research](research.md).\n',
  'assets/logic.md':'# Synthetic background\n\n<a id="existing"></a>\n\n<details>\n<summary>Source details</summary>\n\nAn original example paragraph.\n\n</details>\n',
  'assets/research.md':'# Outside adoption\n'
};
const synthetic=()=>assembleStudyhub(file=>fixture[file],'synthetic-test-only');
const library=synthetic();
check('synthetic adapter admits map links and declared Logic only',()=>{assert.equal(library.docs.size,3);assert.equal(library.zones.length,1);assert.ok(!library.docs.has('assets/research.md'));});
check('text, details and explicit anchors retain their original meaning',()=>{
  for(const doc of library.docs.values())assert.equal(visibleText(renderStudyhub(doc,library).html,true),visibleText(marked.parse(doc.markdown)));
  assert.match(renderStudyhub(library.docs.get('assets/logic.md'),library).html,/<a id="existing"><\/a>/);
});
check('unadopted references stay external; missing adopted sources fail',()=>{
  assert.match(renderStudyhub(library.docs.get('assets/article.md'),library).html,/blob\/synthetic-test-only\/assets\/research.md/);
  const saved=fixture['assets/logic.md'];delete fixture['assets/logic.md'];assert.throws(synthetic,/STUDYHUB_ADOPTED_SOURCE_MISSING/);fixture['assets/logic.md']=saved;
});
check('URLs cannot escape the source root or execute script',()=>{assert.equal(resolveSourceLink('assets/a.md','../../private.md'),null);assert.equal(resolveSourceLink('assets/a.md','javascript:alert(1)'),null);});
const malicious=[
  '<details><img src=x onerror="window.__studyhubXss=1"',
  '<details><summary onclick="window.__studyhubXss=1">Unsafe</summary></details>',
  '<svg><a xlink:href="javascript:window.__studyhubXss=1">Unsafe</a></svg>',
  '<details><a id="ok" onclick="window.__studyhubXss=1">Unsafe</a>',
  '<script>window.__studyhubXss=1</script>',
  '<details><iframe srcdoc="<script>parent.__studyhubXss=1</script>"></iframe>',
  '[unsafe](javascript:window.__studyhubXss=1)'
];
check('complete and incomplete raw HTML stays inert inside the real article envelope',()=>{
  for(const markdown of malicious){
    const html=renderStudyhub({file:'assets/test.md',markdown},library).html;
    const dom=parseFragment('<article>'+html+'</article>');
    const walk=n=>{assert.ok(!['script','img','svg','iframe','math'].includes(n.tagName));for(const a of n.attrs||[])assert.ok(!/^on|srcdoc/i.test(a.name)&&!/^javascript:/i.test(a.value));(n.childNodes||[]).forEach(walk);};walk(dom);
  }
});
check('public mode never probes even an explicitly supplied private source',()=>{
  const originals={existsSync:fs.existsSync,realpathSync:fs.realpathSync,readFileSync:fs.readFileSync};
  try{for(const key of Object.keys(originals))fs[key]=()=>{throw Error('private filesystem accessed');};const result=loadStudyhub('/private-must-not-be-read',{mode:'public'});assert.equal(result.available,false);assert.equal(result.docs.size,0);}
  finally{Object.assign(fs,originals);}
});
check('build context distinguishes public/private mode and exact source location',()=>{
  const env={NODE_ENV:'production',KIANOS_STUDYHUB_MODE:'public'},root='/synthetic/repo';
  const publicHash=clientBuildContextHash(env,root),privateHash=clientBuildContextHash({...env,KIANOS_STUDYHUB_MODE:'private'},root);
  assert.notEqual(publicHash,privateHash);
  assert.notEqual(clientBuildContextHash({...env,KIANOS_STUDYHUB_MODE:'private',STUDYHUB_SOURCE_DIR:'/source/a'},root),clientBuildContextHash({...env,KIANOS_STUDYHUB_MODE:'private',STUDYHUB_SOURCE_DIR:'/source/b'},root));
});
check('changing the source pin owner requires a complete static build and runtime reload',()=>{const file='static-web/src/lib/studyhubContent.mjs';assert.equal(classifyStaticBuild([file]).required,true);assert.equal(requiresStaticRuntimeReload([file]),true);});
check('the real client artifact planner rejects a public receipt in private mode',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'studyhub-build-context-'));
  const web=path.join(temp,'static-web');fs.mkdirSync(path.join(web,'dist'),{recursive:true});
  const previous=process.env.KIANOS_STUDYHUB_MODE;
  try{
    const proof={contextHash:clientBuildContextHash({...process.env,KIANOS_STUDYHUB_MODE:'public'},temp)};
    fs.writeFileSync(path.join(web,CLIENT_PROOF_FILE),JSON.stringify(proof));
    fs.writeFileSync(path.join(web,'dist/__kianos-current.json'),JSON.stringify({client_proof_sha256:clientProofDigest(web)}));
    process.env.KIANOS_STUDYHUB_MODE='private';
    assert.equal(planClientArtifactBuild({baseWebRoot:web,webRoot:web,targetSha:'a'.repeat(40)}).reason,'build-context-changed');
  }finally{if(previous===undefined)delete process.env.KIANOS_STUDYHUB_MODE;else process.env.KIANOS_STUDYHUB_MODE=previous;fs.rmSync(temp,{recursive:true,force:true});}
});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'studyhub-source-gate-'));
const git=(root,args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
try{
  fs.writeFileSync(path.join(temp,'WORLD_MAP.md'),fixture['WORLD_MAP.md']);
  fs.writeFileSync(path.join(temp,'source.json'),JSON.stringify({schema:'forged-export',revision:STUDYHUB_SOURCE.revision,files:{}}));
  check('a non-Git export cannot self-assert the real revision',()=>assert.throws(()=>loadStudyhub(temp,{mode:'private'}),/STUDYHUB_VERIFIED_GIT_SOURCE_REQUIRED/));
  git(temp,['init','-q']);git(temp,['add','WORLD_MAP.md']);git(temp,['-c','user.name=Synthetic Test','-c','user.email=fixture@example.invalid','commit','-qm','Synthetic test only']);
  check('wrong actual Git HEAD plus forged untracked manifest is rejected',()=>assert.throws(()=>loadStudyhub(temp,{mode:'private'}),/STUDYHUB_SOURCE_REVISION_MISMATCH/));
  check('private mode missing source and unknown modes fail closed',()=>{assert.throws(()=>loadStudyhub(path.join(temp,'missing'),{mode:'private'}),/STUDYHUB_SOURCE_MISSING/);assert.throws(()=>loadStudyhub(temp,{mode:'fixture'}),/STUDYHUB_MODE_INVALID/);});
}finally{fs.rmSync(temp,{recursive:true,force:true});}
let privateDocuments=null;
if(process.env.KIANOS_STUDYHUB_MODE==='private'){
  const sourceRoot=process.env.STUDYHUB_SOURCE_DIR||STUDYHUB_CACHE;
  const real=loadStudyhub();privateDocuments=real.docs.size;
  check('authorized private source: every rendered text/anchor equals pinned source bytes',()=>{
    for(const doc of real.docs.values()){
      const rendered=renderStudyhub(doc,real);
      assert.equal(visibleText(rendered.html,true),visibleText(marked.parse(doc.markdown)),doc.file);
      for(const match of doc.markdown.matchAll(/<a id="([^"]+)"/g))assert.ok(rendered.html.includes(`id="${match[1]}"`));
    }
  });
  const copy=fs.mkdtempSync(path.join(os.tmpdir(),'studyhub-pin-negative-'));
  try{
    git(copy,['clone','--local','--no-checkout',sourceRoot,'.']);git(copy,['checkout','-q',STUDYHUB_SOURCE.revision]);
    const file=path.join(copy,'WORLD_MAP.md');fs.appendFileSync(file,'\nSynthetic replacement');
    check('dirty files at the real pin fail',()=>assert.throws(()=>loadStudyhub(copy,{mode:'private'}),/STUDYHUB_SOURCE_DIRTY/));
    git(copy,['update-index','--assume-unchanged','WORLD_MAP.md']);
    check('replacement hidden from Git status still fails the pinned blob check',()=>assert.throws(()=>loadStudyhub(copy,{mode:'private'}),/STUDYHUB_SOURCE_BYTES_CHANGED/));
  }finally{fs.rmSync(copy,{recursive:true,force:true});}
}
console.log(JSON.stringify({pass:true,scope:privateDocuments?'private pinned source + public synthetic adapter':'public synthetic adapter only',privateDocuments,checks}));
