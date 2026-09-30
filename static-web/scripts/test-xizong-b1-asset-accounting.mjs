import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Bounded historical/current asset accounting. This is not a content owner,
// a medical quality verdict, a migration engine, or live learner evidence.
const root = process.env.KIANOS_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.env.KIANOS_REPO_ROOT = root;
const git = (...args) => execFileSync('git', ['-C', root, ...args], {encoding:'utf8',maxBuffer:16*1024*1024}).trimEnd();
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const json = p => JSON.parse(read(p));
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const base = 'a9a80b41308ae93c163a927cd9fc667ba946e79c';
const owner = 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md';
const learnerRoot = 'content/xizong/knowledge/learner/';
const source = 'content/xizong/source-snapshots/27/生理学讲义_AI阅读版_27精编_UnifiedSource_v1.md';
let checks=0;
const check=(condition,label)=>{assert.ok(condition,label);checks++;};

// Independent fixture oracle over the exact historical Markdown, never used by
// Runtime. Every KP is bounded at the next same/higher-level heading.
function kpSections(text) {
  const headings=[...text.matchAll(/^(#{1,6})\s+(.+)$/gm)];
  const found=new Map();
  for(let i=0;i<headings.length;i++) {
    const h=headings[i], match=h[2].match(/^KP(\d+)[｜|]\s*(.+)$/);
    if(!match)continue;
    const id=Number(match[1]);
    if(found.has(id))throw new Error('DUPLICATE_RAW_KP:'+id);
    const next=headings.slice(i+1).find(n=>n[1].length<=h[1].length);
    const textBody=text.slice(h.index+h[0].length,next?.index??text.length);
    const prompt=textBody.match(/^>\s*\*\*主提示\*\*：(.+)$/m)?.[1]??null;
    found.set(id,{id,title:match[2],prompt,body:textBody});
  }
  return found;
}
function withoutTransportLines(body) {
  return body.split('\n').filter(line=>!/^>\s*\*\*(?:主提示|讲义定位|Outline|原讲义)/.test(line)
    && !/^!\[/.test(line) && line.trim() && line.trim()!=='---').join('\n');
}
function section(text,title) {
  const headings=[...text.matchAll(/^(#{1,6})\s+(.+)$/gm)];
  const i=headings.findIndex(h=>h[2]===title); if(i<0)return null;
  const h=headings[i],next=headings.slice(i+1).find(n=>n[1].length<=h[1].length);
  return text.slice(h.index+h[0].length,next?.index??text.length).trim();
}
function imageReferences(text) {
  return [...text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map(m=>({alt:m[1],relative:m[2]}));
}
function historyClassification(referencedBefore,trackedBefore,existsNow) {
  if(existsNow)return 'CURRENT_BYTES_PRESENT';
  if(trackedBefore)return 'TRACKED_BASELINE_BYTES_NOT_CURRENT';
  return referencedBefore?'REFERENCED_BUT_NOT_TRACKED_AT_BASELINE':'NO_BASELINE_EVIDENCE';
}

const head=git('rev-parse','HEAD'), before=git('status','--porcelain');
const old=git('show',`${base}:${owner}`), current=read(owner);
const oldKp=kpSections(old), currentKp=kpSections(current);
const {inspectXizongContent}=await import(pathToFileURL(path.join(root,'static-web/scripts/inspect-xizong-content.mjs')));
const r=await inspectXizongContent({systemId:'circulation',blockRef:'b01'});
check(currentKp.size===r.summary.kpCount,'raw/native KP count');
const kps=[];
for(const [id,row] of currentKp) {
  const prior=oldKp.get(id), native=r.learnerObject.kps.find(k=>k.identity.kpId===`circulation-b01-kp${String(id).padStart(2,'0')}`);
  check(Boolean(native),'native identity for KP'+id);
  check(native.prompt.canonical===row.prompt,'raw owner/default Prompt KP'+id);
  kps.push({kpId:native.identity.kpId,title:row.title,
    baselinePrompt:prior?.prompt??null,currentPrompt:row.prompt,
    promptComparison:!prior?'NEW_SINCE_BASELINE':row.prompt===prior.prompt?'UNCHANGED':'EDITED_SINCE_BASELINE',
    coreComparison:!prior?'NEW_SINCE_BASELINE':withoutTransportLines(row.body)===withoutTransportLines(prior.body)?'TEXT_UNCHANGED_EXCLUDING_LOCATORS_AND_IMAGE_REFERENCES':'TEXT_EDITED_REVIEW_DIFF',
    coreSha256:sha256(native.core.markdown),
    support:{attention:native.attention.map(x=>x.id),precision:native.precision.map(x=>x.id),
      medicalvisual:native.visual.map(x=>x.id),outgoing:native.connection.outgoing.map(x=>x.id)}});
}
const tracked=new Set(git('-c','core.quotepath=false','ls-tree','-r','--name-only',base).split('\n'));
const oldImages=imageReferences(old).map(ref=>{
  const p=path.posix.join(path.posix.dirname(owner),ref.relative);
  return {...ref,path:p,trackedAtMigration:tracked.has(p),currentExists:fs.existsSync(path.join(root,p)),
    state:historyClassification(true,tracked.has(p),fs.existsSync(path.join(root,p)))};
});
const cues=json(learnerRoot+'a1-circulation-learning-cues.json');
const bundleOwner=json(learnerRoot+'a1-circulation-source-visuals.json');
const bindings=cues.visual_bindings.filter(x=>x.anchor.block_id==='circulation-b01');
const medicalvisual=bindings.map(binding=>{
  const bundle=bundleOwner.bundles.find(x=>x.cue_id===binding.id);
  const assets=(bundle?.assets||[]).map(asset=>{
    const p='static-web/src/assets/xizong/source-visuals/'+asset.asset_path;
    const exists=fs.existsSync(path.join(root,p));
    const matches=exists&&sha256(fs.readFileSync(path.join(root,p)))===asset.derived_asset_sha256;
    check(matches,'declared crop bytes/hash '+p);
    return {path:p,exists,hashMatches:matches};
  });
  return {id:binding.id,anchor:binding.anchor,task:binding.task,sourceLocator:binding.source_locator,
    state:assets.length?'MATERIALIZED_SOURCE_CROP_HASH_VERIFIED':'LOCATOR_AND_TASK_ONLY_ALLOWED_BY_CURRENT_POLICY',assets};
});
const shared=json(learnerRoot+'shared-fields.json');
const b1Fields=Object.entries(shared.kp_fields).filter(([k])=>k.startsWith('circulation-b01-kp'));
const memory=b1Fields.flatMap(([kpId,v])=>(v.retention_metadata?.memory_items||[]).map(x=>({kpId,...x})));
const precision=cues.precision_index.filter(x=>x.anchor.block_id==='circulation-b01');
const selected=new Set(precision.map(x=>x.id));
const connection=b1Fields.flatMap(([kpId,v])=>(v.retention_metadata?.connections||[]).map(x=>({kpId,...x})));
check(connection.length===r.summary.outgoingKpCount,'retained B1 outgoing relation count');
const ownFramework=t=>section(t,'总 Framework')?.split(/^## /m)[0].trim();
const blockAssets=['先建立脑内机械模型','总 Framework','B1 → B2 学习交接','Memory Routing','原图门禁'].map(title=>({
  title,present:section(current,title)!==null,unchangedFromMigration:title==='总 Framework'?ownFramework(current)===ownFramework(old):section(current,title)===section(old,title)
}));
check(blockAssets.every(x=>x.present),'Block-owned framework/handoff/Memory/MedicalVisual intent preserved');
check(Boolean(r.learnerObject.blockPreentry.framework)&&Boolean(r.learnerObject.blockPreentry.memoryRouting),'native Block preentry retains framework and Memory routing');
const kp24=currentKp.get(24);
check([...kp24.body.matchAll(/^\s+\d+\. /gm)].length===13,'KP24 all 13 numbered factors remain');
check(kp24.body.includes('持续紧张性收缩'),'KP24 muscle-pump boundary remains');
const sourceText=read(source);
const p128=section(sourceText,'讲义顺序第 128 页｜循环系统 / 第四章 血液循环 / 串·静脉回心血量的影响因素');
check(Boolean(p128),'exact Source P128 section present');
const sourceInterfaces=['右心衰','冠心病早期','心包积液','心肌纤维化或肥厚','输液过多过快可诱发心衰','硝酸酯类药扩静脉'];
for(const term of sourceInterfaces)check(p128.includes(term),'Source term retained: '+term);

// Adversarial controls: an absent binary reference never proves deletion;
// a changed but retained Prompt is not mislabeled missing; duplicate/empty text
// cannot quietly become an authoritative inventory.
check(historyClassification(true,false,false)==='REFERENCED_BUT_NOT_TRACKED_AT_BASELINE','missing reference is not deletion proof');
check(historyClassification(true,true,false)==='TRACKED_BASELINE_BYTES_NOT_CURRENT','true baseline byte loss classified separately');
check(historyClassification(true,true,true)==='CURRENT_BYTES_PRESENT','present asset retained');
assert.throws(()=>kpSections('### KP01｜a\n> **主提示**：a\n### KP01｜b\n> **主提示**：b'),/DUPLICATE_RAW_KP/);checks++;
check(kpSections('no KP').size===0,'missing sections are not fabricated');
check(kpSections('### KP01｜a\n> **主提示**：a｜b\n# Appendix\nnot Core').get(1).body.indexOf('not Core')<0,'Block Appendix not attributed to last KP');
check(kpSections('### KP01｜a\n> **主提示**：a｜b\n').get(1).prompt==='a｜b','pipe text preserved verbatim');
check(git('rev-parse','HEAD')===head&&git('status','--porcelain')===before,'no repository or learner-state writes');
const report={authority:'BOUNDED_READ_ONLY_ASSET_ACCOUNTING_NOT_MEDICAL_OR_BROWSER_ACCEPTANCE',basis:{head,baseline:base,owner,source,sourceSha256:sha256(sourceText)},
  summary:{kpBaseline:oldKp.size,kpCurrent:currentKp.size,missingKp:[...oldKp.keys()].filter(id=>!currentKp.has(id)),
    unchangedPrompts:kps.filter(x=>x.promptComparison==='UNCHANGED').length,editedPrompts:kps.filter(x=>x.promptComparison==='EDITED_SINCE_BASELINE').map(x=>x.kpId),
    coreTextEdited:kps.filter(x=>x.coreComparison==='TEXT_EDITED_REVIEW_DIFF').map(x=>x.kpId),
    oldImageReferences:oldImages.length,oldImageBytesTrackedAtMigration:oldImages.filter(x=>x.trackedAtMigration).length,
    medicalVisualBindings:medicalvisual.length,materializedBundles:medicalvisual.filter(x=>x.assets.length).length,
    retainedMemoryItems:memory.length,selectedPrecision:precision.length,retainedConnections:connection.length,checks},
  blockAssets,kps,oldImages,medicalvisual,
  precision:{selectionPolicy:cues.rules.precision_selection,absencePolicy:cues.rules.precision_absence,
    retainedButNotSelected:memory.filter(x=>!selected.has(x.memory_id)).map(x=>({id:x.memory_id,kpId:x.kpId,cue:x.cue}))},
  sourceInterfaces:sourceInterfaces.map(term=>({term,sourcePage:128,state:'PRESENT_IN_CURRENT_SOURCE; ADOPTION_IS_SEPARATE'})),
  caveats:['Earliest repository import is not proof of pre-Git original production.',
    'A recently proposed terse Prompt is not evidence of an old adopted-and-deleted original.',
    'No historical PNG bytes were observed here; external original existence remains UNKNOWN.',
    'Selective Precision and legal locator-only MedicalVisual are not automatically content loss.',
    'No UI, browser state, source medical completeness or learner mastery was tested.']};
console.log(process.argv.includes('--json')?JSON.stringify(report,null,2):JSON.stringify(report.summary,null,2));
