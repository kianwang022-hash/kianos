import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));

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
const snapshot=text(snapshotPath);
const surgerySlot=text('content/xizong/knowledge/learner/xizong-2027-surgery-rebase-slot.json');
const surgeryMap=text('content/xizong/knowledge/learner/surgery-27-source-map.json');

assert.equal(slot.schema,'kianos.xizong.biochemistry_source_revision.v2');
assert.equal(slot.status,'CLOSED_CURRENT_AFTER_ARCHITECTURE_CORRECTED_REACCEPTANCE');
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
assert.equal(learning.construction_status,'PHASE6_INDEPENDENT_L_ACCEPTED','candidate builder must not overwrite accepted B Learning owner');
const builderText=text('static-web/scripts/build-xizong-b-learning-candidate.mjs');
assert.match(builderText,/B_L_CANONICAL_CURRENT_OVERWRITE_FORBIDDEN/,'candidate builder must fail closed on accepted Current');
assert.match(builderText,/\.qa\/xizong-b-learning-candidate\.json/,'candidate builder default output must be non-canonical');

assert.equal(learning.biochemistry_first_pass_lane?.status,'CURRENT_27_REACCEPTED');
assert.equal(learning.biochemistry_first_pass_lane?.source_map_status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
assert.match(String(learning.biochemistry_first_pass_lane?.source_mapping_ownership||''),/SINGLE_OWNER_SOURCE_MAP/);

const g5=learning.blocks.G5;
const g5Order=g5.learner_order.flatMap((lg)=>{
  const [a,z]=g5.logic_groups[lg].kp;
  return Array.from({length:z-a+1},(_,i)=>a+i);
});
assert.deepEqual(g5Order,[1,2,3,4,5,12,13,6,7,8,9,10,11],'G5 learner order must remain independent of stable KP/file order');

assert.match(maturity,/G3 — 2027 Biochemistry delta/);
assert.match(maturity,/CLOSED \/ CURRENT · S\/K\/L\/Content\/P REACCEPTED/);
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
  hierarchy:'System→Block→Logic Group→KP',
  duplicate_learning_source_registry:false,
  g5_stable_order:'KP01→KP13',
  g5_learner_order:'KP01–05→KP12–13→KP06–11',
  maturity_state:'CLOSED_CURRENT_REACCEPTED',
  result:'PASS'
},null,2));
console.log('PASS Xizong 27 Biochemistry source lifecycle');
