import { assertReviewedA1Preentry } from './xizong-calibration-test-support.mjs';
// Independent input: reviewed raw Current line/text, never generated compiler totals.
// Portable regression; optional KIANOS_REPO_ROOT and KIANOS_QA_DIR.
// Synthetic fixture and result writes are restricted to the QA output directory.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const scriptDir=path.dirname(fileURLToPath(import.meta.url));
const root=process.env.KIANOS_REPO_ROOT||path.resolve(scriptDir,'../..');
const here=process.env.KIANOS_QA_DIR||path.join(root,'static-web/.qa');fs.mkdirSync(here,{recursive:true});
const independentStable=x=>Array.isArray(x)?x.map(independentStable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,independentStable(x[k])])):x;
const independentDigest=x=>createHash('sha256').update(JSON.stringify(independentStable(x))).digest('hex');

process.env.KIANOS_REPO_ROOT=root;process.env.KIANOS_XIZONG_BUILD_CACHE='0';
const mod=n=>import(pathToFileURL(`${root}/static-web/src/lib/${n}.mjs`));
const native=await mod('xizong'), production=await mod('xizongProductionProjection'), learner=await mod('xizongLearnerObject');
const oracle=JSON.parse(fs.readFileSync(path.join(scriptDir,'fixtures/a3-independent-review.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const clean=x=>String(x).replace(/\*\*|__|`+/g,'').replace(/\s+/g,' ').trim();
const legacy=[];
for(const [sys,prefix,count] of [['circulation','b',12],['respiratory','r',12]])for(let n=1;n<=count;n++){
 const b=native.loadXizongBlock(sys,`${prefix}${String(n).padStart(2,'0')}`);
 legacy.push({blockId:b.blockId,systemId:sys,sourcePath:b.sourcePath,raw_sha256:sha(fs.readFileSync(`${root}/${b.sourcePath}`)),preentry:production.compileXizongBlockPreentry(b)});
}
const checks=[],failures=[];
const check=(name,fn)=>{try{fn();checks.push(name)}catch(e){failures.push({name,error:e.stack})}};
const baseline=oracle.baseline_preentry;
const stripNaturalPromptCalibration=source=>source.replace(/^#{1,6}[^\n]*同一模型上的自然节点〔完整 Prompt〕[^\n]*\n[\s\S]*?^---\s*\n(?=\s*^#{1,6}\s)/m,'');
const normalizedLegacyDir=path.join(here,'legacy-preentry-normalized');fs.mkdirSync(normalizedLegacyDir,{recursive:true});
for(const prior of baseline.legacy)check(`legacy ${prior.blockId} exact topics/order/anchors/Framework`,()=>{const actual=legacy.find(b=>b.blockId===prior.blockId);if(prior.blockId==='circulation-b01'){
 // B1's old all-KP Framework packaging moved to canonical model/Core views.
 // Keep the original frozen oracle; compare preserved Core and memory routes.
 const b=native.loadXizongBlock('circulation',prior.blockId);assert.ok(b.knowledge);
 assert.equal(sha(JSON.stringify(b.kpRecords.map(k=>Object.fromEntries(['kpId','title','prompt','detailMarkdown','sourceLocator','outlineLocator'].map(key=>[key,k[key]]))))),'9fdfd125578bfc36cefa61af658bbd7567dbe27103a46bd355b13d5ba4e1dca6');
 assert.equal(actual.preentry.framework.present,false);
 // main962d889's complete historical preentry first matched the unchanged
 // prior.preentry_sha256; this is its independently extracted memory route.
 assert.equal(independentDigest(actual.preentry.memoryRouting),'fe25a4e9802418fa035a26dfaafc7960405f025420294380cbc6c8fb210b25bb');
}else if(actual.systemId==='circulation'){const b=native.loadXizongBlock(actual.systemId,prior.blockId);assert.equal(assertReviewedA1Preentry(b,actual.preentry,fs.readFileSync(`${root}/${actual.sourcePath}`,'utf8')),true);
}else{const b=native.loadXizongBlock(actual.systemId,prior.blockId),source=fs.readFileSync(`${root}/${actual.sourcePath}`,'utf8'),normalized=stripNaturalPromptCalibration(source);assert.equal(sha(normalized),prior.raw_sha256);const file=path.join(normalizedLegacyDir,actual.systemId+'-'+prior.blockId+'.md');fs.writeFileSync(file,normalized);const normalizedPreentry=production.compileXizongBlockPreentry({...b,sourcePath:path.relative(root,file)});for(const key of ['framework','memoryRouting'])if(normalizedPreentry[key])normalizedPreentry[key].ownerPath=actual.sourcePath;assert.equal(independentDigest(normalizedPreentry),prior.preentry_sha256)}});
let g=0,d=0,framework=0;
for(const raw of oracle.raw_preentry.blocks){
 const b=native.loadXizongBlock('urinary',raw.block_id), got=production.compileXizongBlockPreentry(b);
 check(`${raw.block_id}: exact raw parent and child ownership`,()=>{
  assert.equal(got.memoryRouting.present,true);assert.equal(got.memoryRouting.ownerPath,raw.source_path);assert.equal(got.memoryRouting.anchor,raw.parent_anchor);
  for(const [kind,key] of [['MI-G','miG'],['MI-D','miD']]){const s=raw.sections.find(s=>s.kind===kind);assert.equal(got.memoryRouting[key+'Anchor'],s.anchor);assert.deepEqual(got.memoryRouting[key],s.items.map(x=>clean(x.text)));}
 });
 check(`${raw.block_id}: actual LearnerObject attention only`,()=>{
  const object=learner.buildXizongLearnerObject({block:{...b,blockPreentry:got}});
  const rows=object.slots.blockAttention;
  for(const [key,role,source] of [['miG','CURRENT_TAKEAWAY','BLOCK_PREENTRY_MI_G'],['miD','DEFERRED_MEMORY','BLOCK_PREENTRY_MI_D']]){
   const actual=rows.filter(x=>x.raw.source===source);assert.deepEqual(actual.map(x=>x.cue),[...new Set(got.memoryRouting[key])]);
   for(const x of actual){assert.equal(x.kind,'ATTENTION');assert.equal(x.attentionRole,role);assert.deepEqual(x.displayPolicy,{timing:'BLOCK_ORIENT'});assert.equal(x.answerHtml,undefined);assert.equal(x.prepared_memory_ref,undefined);}
  }
 });
 check(`${raw.block_id}: literal Framework recovery scope`,()=>{const n=Number(raw.block_id.slice(-2));assert.equal(got.framework.present,n<=8||n>=12);if(got.framework.present){assert.match(got.framework.anchor,/总 Framework/);assert.ok(got.framework.items.length);assert.ok(got.framework.markdown);}});
 g+=got.memoryRouting.miG.length;d+=got.memoryRouting.miD.length;framework+=Number(got.framework.present);
}
check('A3 raw totals 199/141 and only 11 Framework recoveries',()=>{assert.equal(g,199);assert.equal(d,141);assert.equal(framework,11)});
const dir=path.join(here,'preentry-fixtures');fs.mkdirSync(dir,{recursive:true});
let fixtureNumber=0;
function fixture(markdown,system='urinary'){
 const file=path.join(dir,`${String(++fixtureNumber).padStart(2,'0')}.md`);fs.writeFileSync(file,markdown);
 return production.compileXizongBlockPreentry({systemId:system,systemCanonicalId:system==='urinary'?'A3':system==='circulation'?'A1':system==='respiratory'?'A2':'OTHER',blockId:`${system}-b01`,sourcePath:path.relative(root,file)});
}
const normal='# 9｜Memory Routing\n\n## 9.1 MI-G｜当前\n- G <120 mmol/L\n- G ≤120 mmol/L\n\n## 9.2 MI-D｜以后\n- D 30–40 mL/h\n- D 2/3 vs 1/3\n\n# next\n- OUTSIDE\n';
const expectedG=['G <120 mmol/L','G ≤120 mmol/L'],expectedD=['D 30–40 mL/h','D 2/3 vs 1/3'];
const expect=(value,gg=expectedG,dd=expectedD)=>{assert.deepEqual(value.memoryRouting.miG,gg);assert.deepEqual(value.memoryRouting.miD,dd)};
check('numbered fullwidth pipe preserves operators and units',()=>expect(fixture(normal)));
check('numbered ASCII pipe and multi-level section number',()=>{const x=fixture(normal.replace('9｜Memory Routing','12.2|Memory Routing'));expect(x);assert.equal(x.memoryRouting.anchor,'12.2|Memory Routing')});
check('inline MI-D before/after parent never merges or shadows top-level owner',()=>expect(fixture('## //MI-D｜inline before\n- SECRET-BEFORE\n\n'+normal+'## //MI-D｜inline after\n- SECRET-AFTER\n')));
check('several inline MI-G/MI-D and nested same-name sections never merge',()=>expect(fixture('## //MI-D\n- BEFORE\n\n'+normal.replace('## 9.2 MI-D','### MI-D\n- NESTED\n\n## 9.2 MI-D').replace('# next','### MI-D\n- NESTED-D\n\n# next')+'## //MI-D\n- AFTER\n')));
check('fake parent and children in fenced code do not create ambiguity',()=>expect(fixture('```md\n# Memory Routing\n## MI-G\n- FAKE\n## MI-D\n- FAKE\n```\n'+normal+'~~~markdown\n# Memory Routing\n## MI-D\n- FAKE\n~~~\n')));
check('nested same-name parent is outside the unique canonical structural form',()=>{const x=fixture('# outer\n## Memory Routing\n### MI-G\n- bad\n### MI-D\n- bad\n');expect(x,[],[]);assert.equal(x.memoryRouting.present,false)});
check('direct child duplicate fails only that support',()=>{const x=fixture(normal.replace('# next','## MI-D\n- DUPLICATE\n\n# next'));expect(x,expectedG,[]);assert.equal(x.memoryRouting.miDAnchor,null);assert.equal(x.memoryRouting.present,true)});
check('duplicate parents fail closed without global fallback',()=>{const x=fixture(normal+normal);expect(x,[],[]);assert.equal(x.memoryRouting.present,false);assert.equal(x.memoryRouting.anchor,null)});
check('missing A3 parent never falls back to global MI headings',()=>{const x=fixture('## MI-G\n- G\n## MI-D\n- D\n');expect(x,[],[]);assert.equal(x.memoryRouting.present,false)});
check('only MI-G support remains available',()=>{const x=fixture('# Memory Routing\n## MI-G\n- G\n');expect(x,['G'],[]);assert.equal(x.memoryRouting.miDAnchor,null)});
check('blank sibling has no invented topic; diagnostic prefix is not MI-D',()=>{const x=fixture('# Memory Routing\n## MI-G\n- G\n## MI-D\n\n## MI-Diagnostic\n- NOT-MI-D\n');expect(x,['G'],[])});
check('unrelated MI-Diagnostic heading cannot supply absent MI-D',()=>{const x=fixture('# Memory Routing\n## MI-G\n- G\n## MI-Diagnostic\n- NOT-MI-D\n');expect(x,['G'],[]);assert.equal(x.memoryRouting.miDAnchor,null)});
check('parent boundary excludes later MI-D',()=>{const x=fixture('# Memory Routing\n## MI-G\n- G\n# next\n## MI-D\n- NOT-OWNED\n');expect(x,['G'],[])});
check('missing file maintains all-absent output',()=>{const x=production.compileXizongBlockPreentry({systemId:'urinary',systemCanonicalId:'A3',sourcePath:path.relative(root,path.join(dir,'DOES-NOT-EXIST.md'))});assert.equal(x.framework.present,false);assert.equal(x.memoryRouting.present,false);assert.equal(x.memoryRouting.anchor,null);expect(x,[],[])});
for(const sys of ['circulation','respiratory']){
 check(`${sys} unique parentless legacy fallback preserved`,()=>{const x=fixture('## MI-G\n- G\n## MI-D\n- D\n',sys);expect(x,['G'],['D']);assert.equal(x.memoryRouting.anchor,null)});
 check(`${sys} ambiguous parent does not grant global fallback`,()=>{const x=fixture('## Memory Routing\n### MI-G\n- G\n### MI-D\n- D\n## Memory Routing\n',sys);expect(x,[],[]);assert.equal(x.memoryRouting.present,false)});
 check(`${sys} explicit parent scopes direct children`,()=>{const x=fixture('## MI-D\n- INLINE\n## Memory Routing\n### MI-G\n- G\n### MI-D\n- D\n## end\n### MI-D\n- AFTER\n',sys);expect(x,['G'],['D'])});
}
check('unrelated Systems retain prior global ambiguous-child behavior',()=>{const x=fixture('## MI-D\n- INLINE\n## Memory Routing\n### MI-G\n- G\n### MI-D\n- D\n## end\n','other');expect(x,['G'],[]);assert.equal(x.memoryRouting.anchor,'Memory Routing')});
check('unrelated Systems retain old numbered-pipe normalization',()=>{const x=fixture('# 9｜Memory Routing\n## 9.1 MI-G｜G\n- G\n## 9.2 MI-D｜D\n- D\n','other');expect(x,['G'],['D']);assert.equal(x.memoryRouting.anchor,null)});
const result={root,module_sha256:sha(fs.readFileSync(`${root}/static-web/src/lib/xizongProductionProjection.mjs`)),oracle_sha256:sha(fs.readFileSync(path.join(scriptDir,'fixtures/a3-independent-review.json'))),claims:'Raw Current ordered-content and actual LearnerObject preentry proof; no browser/native-card/learner claims',checks,failures,passed:checks.length,failed:failures.length};
fs.writeFileSync(`${here}/xizong-a3-preentry.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:checks.length,failed:failures.length,failures},null,2));if(failures.length)process.exitCode=1;
