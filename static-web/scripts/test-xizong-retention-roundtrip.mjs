import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadXizongSystem,loadXizongBlock} from '../src/lib/xizong.mjs';
import {loadReviewedRetentionConnections,pathwaysForBlock,retentionConnectionsForSystem} from '../src/lib/xizongPathways.mjs';
import {resolveXizongLearnerProjection} from '../src/lib/xizongLearnerProjection.mjs';
import {resolveXizongLearnerAssetRepresentation} from '../src/lib/xizongRepresentationGate.mjs';

// Independent source-side expectations from the reported Lecture P128 seam.
// These are not discovered from the generated payload, so an omitted hook fails.
const reported = [
  ['b01-c07-venous-hf-to-b11','circulation-b11',['肝颈静脉','输液','端坐']],
  ['b01-c08-ischemic-relaxation-to-b11','circulation-b11',['缺血','Ca','主动舒张']],
  ['b01-c09-myocardial-pericardial-filling-to-b8','circulation-b08',['顺应性','心包','肥厚']],
  ['b01-c10-volume-posture-to-b12','circulation-b12',['失血','体位','灌注']],
  ['b01-c11-venous-nitrate-to-b6','circulation-b06',['硝酸酯','KP32','前负荷']]
];
const shared=JSON.parse(fs.readFileSync('../content/xizong/knowledge/learner/shared-fields.json','utf8'));
const all=loadReviewedRetentionConnections();
assert.equal(all.length,17,'12 existing + 5 grouped P128 notices');
assert.equal(new Set(all.map(row=>row.id)).size,all.length);
for(const [id,target,tokens] of reported){
  const row=all.find(row=>row.id===id);
  assert.ok(row,id+' missing');
  assert.equal(row.source.kp_id,'circulation-b01-kp24');
  assert.equal(row.target.block_id,target);
  for(const token of tokens)assert.ok((row.source.cue+row.seed).includes(token),id+': '+token);
}
const report={evidence:'NATIVE_OWNER_COMPOSITION_NOT_LEARNER_U',relations:[],blocks:[],negative:[]};
for(const relation of all){
  assert.ok(relation.source.href && !relation.source.href.includes('undefined'));
  assert.ok(relation.target.href && !relation.target.href.includes('undefined'));
  const source=resolveXizongLearnerProjection(loadXizongBlock(relation.source.system_id,relation.source.block_id)).learnerObject;
  const outgoing=source.kps.find(k=>k.identity.kpId===relation.source.kp_id).connection.outgoing;
  assert.ok(outgoing.some(r=>r.id===relation.id),relation.id+': source');
  if(relation.target.block_id){
    const target=resolveXizongLearnerProjection(loadXizongBlock(relation.target.system_id,relation.target.block_id)).learnerObject;
    const incoming=target.slots.blockConnections.filter(r=>r.id===relation.id);
    assert.equal(incoming.length,1,relation.id+': target entry');
    assert.equal(incoming[0].direction,'incoming');
    assert.equal(incoming[0].attentionRole,'ON_DEMAND_SUPPORT');
    assert.equal(incoming[0].other.href,relation.source.href);
    assert.ok(!incoming[0].endpoint.kp_id,'Block target must not become a guessed KP');
    assert.ok(target.kps.every(k=>!k.connection.incoming.some(r=>r.id===relation.id)));
    for(const stage of ['BLOCK_ORIENT','KP_LEARN','KP_RECALL_REVEAL'])
      assert.equal(resolveXizongLearnerAssetRepresentation(incoming[0],{stage}).visible,true,relation.id+': '+stage);
    for(const stage of ['KP_RECALL_FRONT','BLOCK_RECALL_FRONT','SYSTEM_RECALL_FRONT'])
      assert.equal(resolveXizongLearnerAssetRepresentation(incoming[0],{stage}).visible,false,relation.id+': '+stage);
  }else{
    assert.equal(retentionConnectionsForSystem(all,relation.target.system_id).filter(r=>r.id===relation.id).length,1);
    const system=loadXizongSystem(relation.target.system_id);
    for(const b of system.blocks)assert.equal(pathwaysForBlock({connections:all},b.blockId).incoming.some(r=>r.id===relation.id),false);
  }
  report.relations.push({id:relation.id,source:relation.source.kp_id,target:relation.target.block_id||relation.target.system_id,roundtrip:true});
}
for(const summary of loadXizongSystem('circulation').blocks){
  const canonical=loadXizongBlock('circulation',summary.blockId);
  const resolved=resolveXizongLearnerProjection(canonical);
  for(const [i,kp] of resolved.learnerObject.kps.entries()){
    assert.equal(kp.prompt.canonical,canonical.kpRecords[i].prompt);
    assert.equal(kp.core.markdown,canonical.kpRecords[i].detailMarkdown);
  }
  assert.equal(resolved.block.sourceHash,canonical.sourceHash);
  const expected=all.filter(r=>r.target.block_id===summary.blockId).map(r=>r.id).sort();
  assert.deepEqual(resolved.learnerObject.slots.blockConnections.filter(r=>r.raw?.reviewedRetention).map(r=>r.id).sort(),expected);
  report.blocks.push({block:summary.blockId,kps:canonical.kpRecords.length,incoming:expected.length});
}
assert.equal(report.blocks.reduce((n,b)=>n+b.kps,0),312);
for(const [name,mutate,rejected] of [
  ['unreviewed',x=>x.authority='UNREVIEWED',false],
  ['stale-B1',x=>x.source_bindings['circulation-b01']='stale-owner',false],
  ['orphan',x=>x.kp_fields['circulation-b01-kp999']=x.kp_fields['circulation-b01-kp009'],true],
  ['duplicate',x=>x.kp_fields['circulation-b01-kp008']={retention_metadata:{connections:x.kp_fields['circulation-b01-kp009'].retention_metadata.connections}},true],
  ['ambiguous-target',x=>x.kp_fields['circulation-b01-kp009'].retention_metadata.connections[0].downstream_system_id='urinary',true],
  ['unknown-target',x=>x.kp_fields['circulation-b01-kp009'].retention_metadata.connections[0].downstream_owner_id='missing',true],
  ['alias-conflict',x=>x.kp_fields['circulation-b01-kp09']={retention_metadata:{connections:[]}},true]
]){
  const x=structuredClone(shared);mutate(x);
  if(rejected)assert.throws(()=>loadReviewedRetentionConnections(x));
  else{
    const rows=loadReviewedRetentionConnections(x);
    if(name==='unreviewed')assert.equal(rows.length,0);
    else assert.ok(rows.every(r=>r.source.block_id!=='circulation-b01'));
  }
  report.negative.push({name,pass:true});
}
fs.mkdirSync('.qa',{recursive:true});
fs.writeFileSync('.qa/xizong-retention-roundtrip.json',JSON.stringify({...report,status:'PASS'},null,2)+'\n');
console.log('PASS native retention roundtrip: 17 relations; 12 A1 Blocks/312 KP; 7 negative controls');
