import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve('..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));
const gitBlobSha=(p)=>{
  const b=fs.readFileSync(path.join(root,p));
  return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
};
const rowByQuestion=(p,qid)=>{
  const rows=read(p);
  if(!Array.isArray(rows)) throw new Error('QX_SHARD_NOT_ARRAY:'+p);
  const row=rows.find((x)=>x?.question_id===qid);
  if(!row) throw new Error('QX_ROW_MISSING:'+qid);
  return row;
};

const blocks=[
  ...Array.from({length:10},(_,i)=>'M'+(i+1)),
  ...Array.from({length:5},(_,i)=>'G'+(i+1))
];
const slotPath='content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json';
const sourceMapPath='content/xizong/knowledge/learner/biochemistry-27-source-map.json';
const learningPath='content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json';
const systemPath='content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json';
const manifestPath='content/xizong/source-snapshots/27/manifest.json';
const snapshotPath='content/xizong/source-snapshots/27/生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md';

const slot=read(slotPath);
const sourceMap=read(sourceMapPath);
const learning=read(learningPath);
const system=read(systemPath);
const questionScope=read('content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json');
const manifest=read(manifestPath);
const maturity=text('content/xizong/MATURITY_PACKAGE.md');
const biochemistryContract=text('content/xizong/knowledge/learner/BIOCHEMISTRY_CONTRACT.md');
const xizongCurrent=text('content/xizong/CURRENT.md');
const contentMainline=text('content/xizong/CONTENT_MAINLINE.md');
const bCurrent=text('content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/CURRENT.md');
const bAcceptance=text('content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md');
const snapshot=text(snapshotPath);
const surgerySlot=text('content/xizong/knowledge/learner/xizong-2027-surgery-rebase-slot.json');
const surgeryMap=text('content/xizong/knowledge/learner/surgery-27-source-map.json');

assert.equal(slot.schema,'kianos.xizong.biochemistry_source_revision.v2');
assert.equal(slot.status,'CLOSED_CURRENT_AFTER_TRANSITIVE_SOURCE_REVISION_REVALIDATION');
assert.deepEqual(slot.current_owner_boundary.canonical_blocks,blocks);
assert.equal(slot.current_state.source_present,true);
assert.equal(slot.current_state.current_year_delta_known,true);
assert.match(String(slot.current_state.action_now),/REBASE_CLOSED|REACCEPTED/);
assert.deepEqual(slot.current_state.deep_review?.remaining,[]);
assert.equal(slot.current_state.deep_review?.stable_kp_total,191);
assert.equal(slot.current_state.source_map?.status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
assert.ok(!Object.keys(slot.current_state.deep_review||{}).some((k)=>k.startsWith('batch_')),
  'Current deep_review must not retain superseded batch/layer work receipts');

const route=(system.block_route||[]).filter((row)=>blocks.includes(String(row?.id||'')));
assert.deepEqual(route.map((row)=>String(row.id)),blocks);
assert.equal(route.reduce((n,row)=>n+Number(row.kp||0),0),191);

assert.equal(sourceMap.schema,'kianos.xizong.biochemistry-source-map.v2');
assert.equal(sourceMap.status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
assert.equal(sourceMap.source?.visible_name,'27生化跟课版合集【不带导图】.pdf');
assert.equal(sourceMap.source?.sha256,'17d991896f0edea0b2e1274fdee76862998a1f3bd0c4bad03155bf9e4b27ce1c');
assert.equal(sourceMap.source?.pages,170);
assert.equal(sourceMap.source_map_status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
assert.equal(sourceMap.mapping_completion?.source_units,22);
assert.equal(sourceMap.mapping_completion?.canonical_blocks,15);
assert.equal(sourceMap.mapping_completion?.remaining_parallel_layer_refs,0);
assert.equal(sourceMap.architecture_rule?.canonical_hierarchy,'System → Block → Logic Group → KP');
assert.equal(sourceMap.architecture_rule?.mapping_target,'DIRECT_TO_EXISTING_BLOCK_LOGIC_GROUP_KP_OR_EXPLICIT_SUPPORT_CONNECTION');
assert.ok(!('direct_block_logic_group_kp' in sourceMap),'duplicate derived direct-block mapping view must not be Current');
assert.ok(!('route_conflicts_to_resolve_during_deep_review' in sourceMap),'unresolved route-conflict queue must not remain Current');
assert.ok(!('next_review_batches' in sourceMap),'completed review queue must not remain Current');

const bioManifest=(manifest.assets||[]).find((row)=>row.subject==='Biochemistry');
assert.ok(bioManifest,'27 Biochemistry manifest asset missing');
assert.equal(bioManifest.source_name,sourceMap.source.visible_name);
assert.equal(bioManifest.source_sha256,sourceMap.source.sha256);
assert.equal(bioManifest.pdf_pages,170);
assert.equal(bioManifest.role,'CURRENT_27_PRIMARY_CONTINUOUS_SOURCE_SNAPSHOT');
assert.match(snapshot,new RegExp(sourceMap.source.sha256));

const units=sourceMap.source_units||[];
assert.equal(units.length,22);
assert.deepEqual(
  units.map((u)=>u.id),
  Array.from({length:22},(_,i)=>'BIO27-S'+String(i+1).padStart(2,'0'))
);

const seenPages=new Set();
for(const u of units){
  assert.ok(Array.isArray(u.pdf)&&u.pdf.length===2,u.id+' invalid pdf range');
  const [a,z]=u.pdf;
  assert.ok(Number.isInteger(a)&&Number.isInteger(z)&&a<=z,u.id+' invalid pdf range values');
  for(let p=a;p<=z;p++){
    assert.ok(!seenPages.has(p),u.id+' overlaps PDF P'+p);
    seenPages.add(p);
  }
}
assert.deepEqual(
  [...seenPages].sort((a,b)=>a-b),
  Array.from({length:168},(_,i)=>i+3),
  '27 Source units must cover PDF P003-P170 exactly once'
);

const mappedLgs=new Map(blocks.map((b)=>[b,new Set()]));
const primaryKps=new Map(blocks.map((b)=>[b,new Set()]));
const closureUnits=new Map(blocks.map((b)=>[b,new Set()]));

for(const u of units){
  assert.ok(!('primary' in u)&&!('support' in u),u.id+' must not keep duplicate primary/support routing views');
  assert.ok(Array.isArray(u.canonical_content)&&u.canonical_content.length>0,u.id+' has no canonical routing');
  for(const row of u.canonical_content){
    const b=String(row.block||'');
    assert.ok(blocks.includes(b),u.id+' illegal block '+b);
    assert.ok(!('layer' in row),u.id+'/'+b+' legacy layer field');
    assert.equal(row.mapping_semantics,'DIRECT_TO_EXISTING_LOGIC_GROUP_KP');
    const lg=String(row.logic_group||'');
    const blockLearning=learning.blocks?.[b];
    assert.ok(blockLearning,b+' missing Learning owner');
    assert.ok(blockLearning.logic_groups?.[lg],u.id+'/'+b+' unknown Logic Group '+lg);

    const kr=row.kp_range;
    assert.ok(Array.isArray(kr)&&kr.length===2&&kr.every(Number.isInteger),u.id+'/'+b+'/'+lg+' invalid kp_range');
    const [a,z]=kr;
    assert.ok(a<=z,u.id+'/'+b+'/'+lg+' reversed kp_range');
    const [la,lz]=blockLearning.logic_groups[lg].kp;
    assert.ok(a>=la&&z<=lz,u.id+'/'+b+'/'+lg+' kp_range escapes Learning-owned LG membership');

    mappedLgs.get(b).add(lg);
    if(String(row.role||'').startsWith('PRIMARY')){
      for(let k=a;k<=z;k++) primaryKps.get(b).add(k);
    }
    if(row.closes_block_source_contact) closureUnits.get(b).add(u.id);
  }
}

for(const routeRow of route){
  const b=String(routeRow.id);
  const blockLearning=learning.blocks[b];
  const expectedLgIds=Object.keys(blockLearning.logic_groups||{});
  assert.deepEqual(
    [...mappedLgs.get(b)].sort(),
    [...expectedLgIds].sort(),
    b+' Source→LG coverage mismatch'
  );

  const seen=new Set();
  for(const lg of expectedLgIds){
    const [a,z]=blockLearning.logic_groups[lg].kp;
    for(let k=a;k<=z;k++){
      assert.ok(!seen.has(k),b+' KP'+k+' belongs to multiple Logic Groups');
      seen.add(k);
    }
  }
  const expectedKps=Array.from({length:Number(routeRow.kp)},(_,i)=>i+1);
  assert.deepEqual([...seen].sort((a,b)=>a-b),expectedKps,b+' Learning LG membership must cover every stable KP exactly once');
  assert.deepEqual([...primaryKps.get(b)].sort((a,b)=>a-b),expectedKps,b+' current 27 Source must have primary formation/completion coverage for every stable KP');

  const cp=sourceMap.block_source_closure_checkpoints?.[b];
  assert.ok(cp,b+' missing Source closure checkpoint');
  assert.deepEqual([...closureUnits.get(b)],[cp.after_unit],b+' Source close flag/checkpoint mismatch');

  const sc=blockLearning.source_contact||{};
  assert.equal(sc.mode,'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT');
  assert.equal(sc.source_map_owner,sourceMapPath);
  for(const stale of ['logic_group_formation','block_source_formation_checkpoint','block_source_closure']){
    assert.ok(!(stale in sc),b+' duplicates exact Source routing in Learning via '+stale);
  }

  const owner=sourceMap.authority_boundary?.canonical_hierarchy_owners?.[b];
  assert.ok(owner&&exists(owner),b+' canonical owner missing');
  const body=text(owner);
  const marker=[...body.matchAll(/<!--\s*kianos:kp id="[^"]*kp(\d+)"\s*-->/g)].map((m)=>Number(m[1]));
  assert.deepEqual(marker,expectedKps,b+' stable canonical KP/file order drift');
  assert.match(body,/27生化跟课版合集【不带导图】\.pdf|生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1\.md/,b+' lacks current 27 Source binding');
  assert.doesNotMatch(body,/primary_(?:source|study)\s*:\s*[^\n]*26生化/i,b+' still has a 26 Primary Study binding');
  assert.doesNotMatch(body,/canonical layers/i,b+' retains obsolete canonical-layer wording');
}

assert.equal(system.mental_model?.biochemistry_two_mother_maps?.status,'CURRENT_FRAMEWORK_ROLE');
assert.equal(system.source_state?.official_question_membership,'CURRENT_SEPARATE_OWNER_ACCEPTED');
assert.equal(system.source_state?.official_question_owner,'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json');
assert.equal(questionScope.status,'CURRENT');
assert.equal(learning.question_stage?.exact_membership_gate,'CURRENT_B_QUESTION_SCOPE_ACCEPTED');
assert.equal(learning.question_stage?.question_scope_owner,'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json');

assert.equal(learning.status,'CURRENT','accepted B Learning owner must remain CURRENT');
assert.equal(learning.construction_status,'PHASE6_INDEPENDENT_L_ACCEPTED','accepted B Learning construction status drift');
assert.ok(!exists('static-web/scripts/build-xizong-b-learning-candidate.mjs'),'retired B Learning candidate builder must stay absent from Current');

const d8Path='content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/d-d1-d23/D8_糖尿病_学习阅读版_v1_最终执行版.md';
const m3Path=sourceMap.authority_boundary.canonical_hierarchy_owners.M3;
const g4Path=sourceMap.authority_boundary.canonical_hierarchy_owners.G4;
const g5Path=sourceMap.authority_boundary.canonical_hierarchy_owners.G5;
const d8Body=text(d8Path);
const m3Body=text(m3Path);
const g4Body=text(g4Path);
const g5Body=text(g5Path);
assert.match(d8Body,/西格列他钠/,'D8 lost current-27 PPAR Source Precision');
assert.match(d8Body,/多格列艾汀/,'D8 lost current-27 GKA Source Precision');
assert.match(m3Body,/NADPH不是 OXPHOS 供能载体[^\n]*只能生物转化/,'M3 lost the current NADPH boundary');
assert.match(g4Body,/VHL[^\n]*HIF|HIF[^\n]*VHL/,'G4 lost HIF–VHL current-27 update');
assert.match(g4Body,/EPO[^\n]*enhancer|增强子[^\n]*EPO|EPO[^\n]*增强子/i,'G4 lost HIF→EPO enhancer bridge');
assert.match(g5Body,/translesion polymerase group|低保真 \/ translesion polymerase group/i,'G5 lost the current translesion-polymerase boundary');
assert.match(g5Body,/SOURCE_BOUND/,'G5 exact low-fidelity polymerase glyph must remain source-bound');

const biochemistryRevisionOwnerPaths=new Set([
  ...Object.values(sourceMap.authority_boundary?.canonical_hierarchy_owners||{}),
  d8Path
]);
const relationManifest=read('content/xizong/question-relations/manifest.json');
const affectedRevisionQids=[];
const explanationCache=new Map();
for(const shard of relationManifest?.canonical_storage?.shards||[]){
  const relationPath='content/xizong/question-relations/'+String(shard.path||'');
  const explanationPath=relationPath.replace('content/xizong/question-relations/','content/xizong/explanations/');
  const relationRows=read(relationPath);
  if(!Array.isArray(relationRows)) throw new Error('BIOCHEM_RELATION_SHARD_NOT_ARRAY:'+relationPath);
  for(const row of relationRows){
    const ownerPath=String(row?.provenance?.knowledge_path||'');
    if(!biochemistryRevisionOwnerPaths.has(ownerPath)) continue;
    const qid=String(row?.question_id||'');
    assert.equal(row.review_status,'REVIEWED',qid+' relation lost REVIEWED status');
    assert.equal(row.provenance?.knowledge_revalidated_blob_sha,gitBlobSha(ownerPath),qid+' stale Current Knowledge review witness');
    assert.equal(row.provenance?.knowledge_revalidated_source_sha256,sourceMap.source.sha256,qid+' missing 27 Source revision witness');
    assert.equal(row.review?.source_revision_revalidated,'BIOCHEMISTRY_27_CURRENT',qid+' missing full 27 relation revalidation receipt');
    let explanationRows=explanationCache.get(explanationPath);
    if(!explanationRows){
      explanationRows=read(explanationPath);
      explanationCache.set(explanationPath,explanationRows);
    }
    if(!Array.isArray(explanationRows)) throw new Error('BIOCHEM_EXPLANATION_SHARD_NOT_ARRAY:'+explanationPath);
    const explanation=explanationRows.find((x)=>x?.question_id===qid);
    assert.ok(explanation,qid+' explanation missing');
    assert.equal(explanation.explanation_status,'APPROVED',qid+' explanation is not APPROVED');
    assert.equal(explanation.review?.source_revision_revalidated,'BIOCHEMISTRY_27_CURRENT',qid+' explanation missing full 27 revalidation receipt');
    assert.equal(explanation.review?.source_revision_sha256,sourceMap.source.sha256,qid+' explanation Source revision witness drift');
    affectedRevisionQids.push(qid);
  }
}
assert.equal(new Set(affectedRevisionQids).size,affectedRevisionQids.length,'duplicate affected Biochemistry relation qid');
assert.equal(affectedRevisionQids.length,slot.current_state.transitive_revalidation_audit_2026_09_26?.relation_freshness?.total_affected_relations,'full transitive relation count drift');
assert.equal(slot.current_state.transitive_revalidation_audit_2026_09_26?.status,'PASS_CLOSED');
assert.equal(slot.current_state.transitive_revalidation_audit_2026_09_26?.relation_freshness?.stale_after_revalidation,0);
assert.equal(slot.current_state.transitive_revalidation_audit_2026_09_26?.relation_freshness?.remaps_required,0);
assert.equal(slot.current_state.transitive_revalidation_audit_2026_09_26?.explanations?.current_27_revalidated_after,affectedRevisionQids.length);

const m3Blob=gitBlobSha(m3Path);
const g5Blob=gitBlobSha(g5Path);
for(const [p,qid,blob] of [
  ['content/xizong/question-relations/shards/2015/q026-050.json','xizong-official-2015-n029',m3Blob],
  ['content/xizong/question-relations/shards/2023/q126-150.json','xizong-official-2023-n142',m3Blob],
  ['content/xizong/question-relations/shards/2023/q001-025.json','xizong-official-2023-n025',g5Blob]
]){
  const row=rowByQuestion(p,qid);
  assert.equal(row.review_status,'REVIEWED',qid+' relation is no longer REVIEWED');
  assert.equal(row.provenance?.knowledge_revalidated_blob_sha,blob,qid+' Current knowledge revalidation drift');
  assert.equal(row.review?.source_revision_revalidated,'BIOCHEMISTRY_27_CURRENT',qid+' missing 27 relation revalidation receipt');
}
for(const [p,qid] of [
  ['content/xizong/explanations/shards/2015/q026-050.json','xizong-official-2015-n029'],
  ['content/xizong/explanations/shards/2023/q126-150.json','xizong-official-2023-n142'],
  ['content/xizong/explanations/shards/2023/q001-025.json','xizong-official-2023-n025'],
  ['content/xizong/explanations/shards/2025/q101-125.json','xizong-official-2025-n123']
]){
  const row=rowByQuestion(p,qid);
  assert.equal(row.explanation_status,'APPROVED',qid+' explanation is not approved');
  assert.equal(row.review?.source_revision_revalidated,'BIOCHEMISTRY_27_CURRENT',qid+' missing 27 explanation revalidation receipt');
}
const m3Exact=rowByQuestion('content/xizong/explanations/shards/2025/q101-125.json','xizong-official-2025-n123');
assert.equal(m3Exact.mapping_decision,'NO_SAFE_MATCH','2025N123 must remain fail-closed at the exact NADPH/Hb boundary');
assert.match(String(m3Exact.source_boundary_note||''),/NADPH.*GSH|GSH.*NADPH/,'2025N123 lost the Current M3 source boundary');
const g5Dsb=rowByQuestion('content/xizong/explanations/shards/2023/q001-025.json','xizong-official-2023-n025');
assert.match(g5Dsb.reasoning_chain.join(' '),/同源重组/,'2023N25 lost HR boundary');
assert.match(g5Dsb.reasoning_chain.join(' '),/非同源末端连接/,'2023N25 lost NHEJ boundary');

assert.equal(slot.current_state.downstream_revalidation?.status,'CURRENT_FULL_TRANSITIVE_REVALIDATED');
assert.equal(slot.current_state.downstream_revalidation?.evidence?.regression,'static-web/scripts/test-xizong-source-revision-transitive.mjs');

assert.equal(learning.biochemistry_first_pass_lane?.status,'CURRENT_27_REACCEPTED');
assert.equal(learning.biochemistry_first_pass_lane?.source_map_status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
assert.match(String(learning.biochemistry_first_pass_lane?.source_mapping_ownership||''),/SINGLE_OWNER_SOURCE_MAP/);

const g5=learning.blocks.G5;
const g5Order=g5.learner_order.flatMap((lg)=>{
  const [a,z]=g5.logic_groups[lg].kp;
  return Array.from({length:z-a+1},(_,i)=>a+i);
});
assert.deepEqual(g5Order,[1,2,3,4,5,12,13,6,7,8,9,10,11],'G5 learner order must remain independent of stable KP/file order');

assert.match(biochemistryContract,/System\s*\n?→ Block\s*\n?→ Logic Group\s*\n?→ KP/,'Biochemistry contract canonical hierarchy drift');
assert.match(biochemistryContract,/may not create another canonical level/i,'Biochemistry contract must forbid a second canonical hierarchy');

assert.match(xizongCurrent,/27 Biochemistry lifecycle owner:/);
assert.match(xizongCurrent,/xizong-2027-biochemistry-delta-slot\.json/);
assert.match(contentMainline,/content\/xizong\/knowledge\/learner\/xizong-2027-biochemistry-delta-slot\.json/);
assert.doesNotMatch(contentMainline,/# 0｜27 Biochemistry architecture-corrected rebase|Lifecycle is owned only by the exact task owner below/,'Mainline must not restore retired Biochemistry campaign prose');
assert.match(bCurrent,/exact lifecycle owner/i,'B Current must route source-revision work to the exact lifecycle owner');
assert.doesNotMatch(
  bCurrent,
  /(?:CLOSED \/ CURRENT|CURRENT_27_REACCEPTED|BLOCKED_UNTIL_27_SOURCE|CONTENT_REVALIDATION_PENDING|CONTENT_REACCEPTANCE_PENDING)/,
  'B Current must not mirror Biochemistry lifecycle state'
);
assert.match(bAcceptance,/xizong-2027-biochemistry-delta-slot\.json/,'B Acceptance must reference the Biochemistry lifecycle owner');
assert.match(bAcceptance,/xizong-2027-surgery-rebase-slot\.json/,'B Acceptance must reference the Surgery lifecycle owner');
assert.doesNotMatch(bAcceptance,/Status:\s*\*\*CLOSED \/ CURRENT|CURRENT_27_REACCEPTED/,'B Acceptance must not mirror lifecycle enum');

const lifecycleConsumers=[xizongCurrent,contentMainline,bCurrent,bAcceptance,maturity].join('\n');
assert.doesNotMatch(lifecycleConsumers,/BLOCKED_UNTIL_27_SOURCE|CONTENT_REVALIDATION_PENDING|CONTENT_REACCEPTANCE_PENDING/,'Current Biochemistry lifecycle consumer regressed to a pre-27 state');

assert.match(maturity,/G3 — 2027 Biochemistry delta/);
assert.match(maturity,/xizong-2027-biochemistry-delta-slot\.json/);
assert.match(maturity,/Biochemistry is not a current Stage-A hard-coverage gap/);
assert.doesNotMatch(maturity,/Current status:\s*\*\*CLOSED \/ CURRENT|S\/K\/L\/Content\/P REACCEPTED/,'Maturity must not mirror Biochemistry lifecycle/readiness enum');
assert.doesNotMatch(maturity,/2027 Biochemistry delta\s+—\s+BLOCKED/i);
assert.doesNotMatch(surgerySlot,/"active_biochemistry_rebase"\s*:\s*true/);
assert.doesNotMatch(surgeryMap,/"active_biochemistry_rebase"/);

console.log(JSON.stringify({
  schema:'kianos.xizong.biochemistry-source-lifecycle-proof.v2',
  source:'27生化跟课版合集【不带导图】.pdf',
  source_pages:'P003-P170 exact once',
  source_units:22,
  canonical_blocks:15,
  stable_kp:191,
  primary_kp_coverage:'191/191',
  downstream_relation_freshness:affectedRevisionQids.length+'/0 stale',
  downstream_explanations_revalidated:affectedRevisionQids.length,
  hierarchy:'System→Block→Logic Group→KP',
  duplicate_learning_source_registry:false,
  g5_stable_order:'KP01→KP13',
  g5_learner_order:'KP01–05→KP12–13→KP06–11',
  maturity_state:'CLOSED_CURRENT_REACCEPTED',
  result:'PASS'
},null,2));
console.log('PASS Xizong 27 Biochemistry source lifecycle');
