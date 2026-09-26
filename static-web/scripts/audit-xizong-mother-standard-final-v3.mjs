import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildXizongForecastCanonicalScope,
  listCurrentXizongSystemIdentities
} from '../src/lib/xizong.mjs';
import { buildXizongForecastQuestionScope } from '../src/lib/xizongQuestions.mjs';
import {
  auditXizongCompressionProposals,
  buildXizongForecastFalsifiability,
  buildXizongHighScoreRequirement,
  buildXizongScoreEvidence,
  buildXizongWorkloadForecast,
  reconcileXizongMaterialIncrement
} from '../src/lib/xizongForecastModel.mjs';
import {
  appendMemoryEvidence,
  createXizongMemoryState,
  releaseBlockMemory,
  xizongRetentionState
} from '../src/lib/xizongMemoryModel.mjs';
import {
  normalizeXizongInlinePracticeQuestions
} from '../src/lib/xizongSessionInstruction.mjs';
import { collectXizongRetainedEvidence } from '../src/lib/xizongRetainedPractice.mjs';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';

const root=path.resolve('..');
const readText=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=(p)=>JSON.parse(readText(p));
const DAY=86400000;
const T0=Date.parse('2026-09-21T08:00:00.000Z');

const results=[];
function pass(id,detail={}){ results.push({id,status:'PASS',...detail}); }
function check(id,fn){
  try{const detail=fn()||{};pass(id,detail);}
  catch(error){results.push({id,status:'FAIL',error:error?.stack||String(error)});}
}

// Fresh Chat / durable-owner attack.
check('fresh_chat_owner_recovery',()=>{
  const current=readText('content/xizong/CURRENT.md');
  const pkg=readText('content/xizong/MATURITY_PACKAGE.md');
  assert.match(current,/\| Subject maturity \/ 270-275 control \| MATURITY_PACKAGE\.md \|/);
  assert.match(pkg,/Protect floor: \*\*270\+\*\*/);
  assert.match(pkg,/Working target: \*\*275\+\*\*/);
  assert.match(pkg,/Stage B — First-pass Capability \| \*\*CURRENT \/ REAL-U REQUIRED\*\*/);
  assert.match(pkg,/KIAN_SPECIFIC_CALIBRATED = NO/);
  assert.match(pkg,/Forecast is not a strategy brain/);
  assert.match(pkg,/SYSTEM_LOGIC_ACCEPTED = YES/);
  return {current_router:true,old_chat_reasoning_required:false};
});

// Whole-subject scope: website projectability cannot define subject scope.
check('whole_subject_scope',()=>{
  const systems=listCurrentXizongSystemIdentities();
  assert.deepEqual(systems.map(r=>r.canonicalId),['A1','A2','A3','B','C','D','E','F']);
  const scope=buildXizongForecastCanonicalScope([]);
  assert.equal(scope.systems.length,8);
  assert.equal(scope.blocks,159);
  assert.equal(scope.canonical_kp,2517);
  assert.equal(scope.logic_groups,762);
  assert.equal(scope.website_projection_is_scope_authority,false);
  assert.ok(scope.block_weights.every(row=>row.scope_kind==='UNPROJECTED_AGGREGATE'));
  return {systems:8,blocks:159,kp:2517,logic_groups:762};
});

// Exact official scope includes independent humanities.
check('whole_subject_official_scope',()=>{
  const scope=buildXizongForecastQuestionScope(listCurrentXizongSystemIdentities());
  assert.equal(scope.scope_complete,true);
  assert.deepEqual(scope.unknown_systems,[]);
  assert.deepEqual(scope.unknown_domains,[]);
  assert.equal(scope.exact_union_questions,2928);
  assert.equal(scope.cross_system_duplicate_memberships,0);
  const h=scope.non_system_domains.find(row=>row.canonical_id==='HUMANITIES');
  assert.equal(h?.status,'EXACT');
  assert.equal(h?.question_count,80);
  return {exact_union_qids:2928,humanities_qids:80};
});

// 270/275 score/loss closure.
check('score_loss_geometry',()=>{
  const r=buildXizongHighScoreRequirement({targetScore:275});
  assert.equal(r.max_score,300);
  assert.equal(r.target_score,275);
  assert.equal(r.total_loss_budget,25);
  assert.equal(r.disciplines.reduce((s,row)=>s+row.points,0),300);
  assert.equal(r.disciplines.find(row=>row.id==='humanism')?.points,16);
  return {working_target:275,loss_budget:25,protect_floor:270};
});

// Minimum Dose / False Secure.
check('false_secure_repeated_known',()=>{
  let state=createXizongMemoryState();
  const descriptor={
    blockId:'audit-b01',systemId:'audit',canonicalId:'AUDIT',blockLabel:'B01',blockTitle:'Audit',
    sourceHash:'source-v1',
    coreCards:[{
      id:'core:audit-kp01',blockId:'audit-b01',systemId:'audit',canonicalId:'AUDIT',
      blockLabel:'B01',blockTitle:'Audit',kpId:'audit-kp01',displayId:'KP01',title:'Audit',
      promptCanonical:'Recall',coreHtml:'<p>Audit</p>',sourceHash:'source-v1'
    }],
    precisionCards:[]
  };
  state=releaseBlockMemory(state,descriptor,T0);
  for(let i=0;i<6;i+=1){
    state=appendMemoryEvidence(state,{cardId:'core:audit-kp01',rating:'known',origin:'MOTHER_AUDIT'},T0+i*DAY+1000);
    const r=xizongRetentionState(state,'core:audit-kp01',T0+i*DAY+2000);
    assert.equal(r.stabilityStage,0);
  }
  return {quota_cannot_manufacture_secure:true};
});

// Stable work can become cheap: mastered card is not automatic debt.
check('false_unstable_stable_becomes_cheaper',()=>{
  let state=createXizongMemoryState();
  const descriptor={
    blockId:'audit-b02',systemId:'audit',canonicalId:'AUDIT',blockLabel:'B02',blockTitle:'Audit 2',
    sourceHash:'source-v1',
    coreCards:[{
      id:'core:audit-kp02',blockId:'audit-b02',systemId:'audit',canonicalId:'AUDIT',
      blockLabel:'B02',blockTitle:'Audit 2',kpId:'audit-kp02',displayId:'KP02',title:'Audit 2',
      promptCanonical:'Recall',coreHtml:'<p>Audit</p>',sourceHash:'source-v1'
    }],
    precisionCards:[]
  };
  state=releaseBlockMemory(state,descriptor,T0);
  state=appendMemoryEvidence(state,{cardId:'core:audit-kp02',rating:'mastered',origin:'MOTHER_AUDIT'},T0+1000);
  const r=xizongRetentionState(state,'core:audit-kp02',T0+2000);
  assert.equal(r.state,'STABLE_WAIT');
  const compression=auditXizongCompressionProposals([
    {id:'stable-repeat',kind:'STABLE_SECOND_PASS_REPETITION',target:'OPTIONAL_LOW_VALUE',minutes:60},
    {id:'protected-recall',kind:'OPTIONAL_LOW_VALUE',target:'FIRST_PASS_ACTIVE_RECALL',minutes:60}
  ]);
  assert.equal(compression.proposals.find(x=>x.id==='stable-repeat')?.decision,'ALLOW');
  assert.equal(compression.proposals.find(x=>x.id==='protected-recall')?.decision,'REJECT');
  return {stable_wait:true,stable_repetition_compressible:true,protected_learning_not_deleted:true};
});

// Source v2 transitive invalidation at Memory layer.
check('source_revision_invalidates_old_stability',()=>{
  let state=createXizongMemoryState();
  const desc=(hash)=>({
    blockId:'audit-b03',systemId:'audit',canonicalId:'AUDIT',blockLabel:'B03',blockTitle:'Audit 3',
    sourceHash:hash,
    coreCards:[{
      id:'core:audit-kp03',blockId:'audit-b03',systemId:'audit',canonicalId:'AUDIT',
      blockLabel:'B03',blockTitle:'Audit 3',kpId:'audit-kp03',displayId:'KP03',title:'Audit 3',
      promptCanonical:'Recall',coreHtml:'<p>'+hash+'</p>',sourceHash:hash
    }],
    precisionCards:[]
  });
  state=releaseBlockMemory(state,desc('source-v1'),T0);
  state=appendMemoryEvidence(state,{cardId:'core:audit-kp03',rating:'mastered',origin:'MOTHER_AUDIT'},T0+1000);
  assert.equal(xizongRetentionState(state,'core:audit-kp03',T0+2000).state,'STABLE_WAIT');
  state=releaseBlockMemory(state,desc('source-v2'),T0+DAY);
  assert.equal(xizongRetentionState(state,'core:audit-kp03',T0+DAY+1000).state,'DUE_CONTENT_CHANGED');
  return {historical_evidence_preserved_but_current_authorization_revoked:true};
});

// Synthetic quality + semantic freshness identity.
check('near_derivative_freshness',()=>{
  const raw=(id)=>({
    question_id:id,source_kind:'AI_TRANSFER_PROBE',probe_kind:'CONDITION_CHANGE',
    evidence_intent:'FRESH_TRANSFER_CHECK',
    semantic_family_id:'sf:audit:one-family',
    derived_from_ids:['xizong-official-2026-n001'],
    changed_dimensions:['decisive-condition'],
    question_type:'A',stem:'Changed-context audit?',
    options:[{label:'A',text:'A'},{label:'B',text:'B'},{label:'C',text:'C'},{label:'D',text:'D'}],
    correct_answer:'C',target_kp_ids:['audit-kp'],
    canonical_source_hash:'source-v1',
    explanation:{
      exam_target:'transfer',decision_axis:'decisive condition',
      reasoning_chain:['identify condition','rerun mechanism'],
      correct_option_reason:'C',valuable_distractors:[{option:'B',reason:'old condition'}],
      common_failure_node:'memorizes wording',transfer_rule:'recompute'
    }
  });
  const q1=normalizeXizongInlinePracticeQuestions([raw('xizong-ai-probe:audit-probe-0001')],'AUDIT')[0];
  const q2=normalizeXizongInlinePracticeQuestions([raw('xizong-ai-probe:audit-probe-0002')],'AUDIT')[0];
  assert.equal(q1.freshTransferEligible,true);
  assert.equal(q1.semanticFamilyId,q2.semanticFamilyId);
  const attempts=[q1,q2].map((q,i)=>({
    type:'QUESTION_ATTEMPT',question_id:q.questionId,question_source:'AI_TRANSFER_PROBE',
    scoring_role:'TRANSFER_ONLY',probe_kind:q.probeKind,evidence_intent:q.evidenceIntent,
    semantic_family_id:q.semanticFamilyId,derived_from_ids:q.derivedFromIds,
    changed_dimensions:q.changedDimensions,fresh_transfer_eligible:q.freshTransferEligible,
    freshness_class:q.freshnessClass,target_kp_ids:q.targetKpIds,
    canonical_source_hash:q.canonicalSourceHash,status:'stable',
    submitted_at:new Date(T0+i*1000).toISOString()
  }));
  const retained=collectXizongRetainedEvidence([
    ['kianos:xizong:chat-set-question-sweep:audit:v1',JSON.stringify({attemptHistory:attempts})]
  ]);
  assert.equal(retained.transferProbeEvents.length,2);
  assert.equal(retained.freshTransferEvents.length,1);
  return {training_events:2,fresh_semantic_families:1};
});

// Second-line capacity veto.
check('capacity_fail_closed',()=>{
  const model=buildChatControlledExamReadModel({
    day:'2026-09-21',dayCapacity:300,
    chatPlanState:{status:'ready',plan:{
      schema:'kianos.exam.chat-plan.v1',study_day:'2026-09-21',generated_at:'2026-09-21T01:00:00Z',
      subjects:{
        xizong:{target_minutes:240,role:'main',note:'',session_ref:'xz'},
        english:{target_minutes:90,role:'keep',note:'',session_ref:null},
        politics:{target_minutes:30,role:'keep',note:'',session_ref:null}
      },next_subject:'xizong',attention:null
    }},
    nativeContinue:{
      xizong:{href:'/xizong/a1/',title:'A1',sessionRef:'xz'},
      english:{href:'/english/',title:'English'},
      politics:{href:'/politics/',title:'Politics'}
    }
  });
  assert.equal(model.control.planStatus,'capacity_conflict');
  assert.equal(model.next,null);
  assert.equal(model.capacity.overplannedMinutes,60);
  return {website_reschedules:false,returns_to_chat:true};
});

function baseProgress(){
  const blocks=[
    ['A1','a1-b01',12,5,60],['A1','a1-b02',18,6,90],['A1','a1-b03',20,7,110],
    ['A2','a2-b01',14,4,80],['A2','a2-b02',24,8,130],['A2','a2-b03',30,10,null]
  ];
  const completed=blocks.slice(0,5).map(([canonical,block,kp,lg,minutes])=>({
    canonical_id:canonical,block_id:block,kp_count:kp,logic_group_count:lg,
    timer_minutes_to_completion:minutes,completed_at:'2026-09-20T00:00:00Z'
  }));
  return {
    schema:'kianos.xizong.forecast-progress.v1',
    canonical_scope:{
      systems:2,blocks:blocks.length,
      canonical_kp:blocks.reduce((s,r)=>s+r[2],0),
      logic_groups:blocks.reduce((s,r)=>s+r[3],0),
      block_weights:blocks.map(([canonical,block,kp,lg])=>({
        canonical_id:canonical,block_id:block,block_count:1,kp_count:kp,logic_group_count:lg
      }))
    },
    runtime_evidence:{
      observed_blocks:6,completed_blocks:5,started_incomplete_blocks:1,
      completed_block_ids:completed.map(r=>r.block_id),completed_blocks_detail:completed,
      started_incomplete:[{canonical_id:'A2',block_id:'a2-b03',kp_count:30,logic_group_count:10}],
      recall:{rated:70,unknown:4,fuzzy:8,known:30,mastered:28}
    },
    question_workload:{
      status:'EXACT_COMPLETE',exact_union_eligible_questions:500,
      known_remaining_questions:100,known_remaining_is_lower_bound:false,
      cross_system_duplicate_memberships:0,unknown_systems:[],unknown_domains:[],
      systems:[],non_system_domains:[]
    },
    practice_evidence:{
      first_pass:{
        attempted_questions:400,current_scope_eligible_attempted_questions:400,
        wrong_or_uncertain_rate:0.20,
        by_day:[
          {day:'2026-09-16',attempted:40,practice_timer_minutes:48,observed_minutes_per_attempt:1.2},
          {day:'2026-09-17',attempted:50,practice_timer_minutes:70,observed_minutes_per_attempt:1.4},
          {day:'2026-09-18',attempted:40,practice_timer_minutes:64,observed_minutes_per_attempt:1.6},
          {day:'2026-09-19',attempted:50,practice_timer_minutes:90,observed_minutes_per_attempt:1.8},
          {day:'2026-09-20',attempted:40,practice_timer_minutes:80,observed_minutes_per_attempt:2.0}
        ],by_system:[],by_domain:[]
      },
      latest:{unresolved_wrong_uncertain_questions:20},
      fresh_transfer:{observed_probes:0,stable:0,uncertain:0,wrong:0,by_probe_kind:{},by_probe_kind_status:{}}
    },
    repair_evidence:{
      total_repair_clusters:50,active_repair_clusters:5,active_question_backed_clusters:5,
      completed_repair_clusters:45,completed_question_backed_clusters:45,
      question_backed_clusters:50,unique_source_question_ids:100,observed_question_to_cluster_ratio:2,
      calibration_samples:[
        {timer_minutes_in_repair_window:10,exclusive_repair_timer_minutes:10},
        {timer_minutes_in_repair_window:12,exclusive_repair_timer_minutes:12},
        {timer_minutes_in_repair_window:15,exclusive_repair_timer_minutes:15},
        {timer_minutes_in_repair_window:18,exclusive_repair_timer_minutes:18},
        {timer_minutes_in_repair_window:20,exclusive_repair_timer_minutes:20}
      ]
    },
    memory_evidence:{
      precision:{cards:30,weak:4,due_weak:2,due_delayed:3,stable_waiting:18},
      core:{cards:50,weak:5,due_weak:2,due_delayed:4,stable_waiting:30}
    },
    system_recall_evidence:[
      {canonical_id:'A1',pre_question_recall_observed:true,post_first_pass_recall_observed:true,events:[{timer_minutes_since_previous_recall:20},{timer_minutes_since_previous_recall:22}]},
      {canonical_id:'A2',pre_question_recall_observed:true,post_first_pass_recall_observed:false,events:[{timer_minutes_since_previous_recall:25},{timer_minutes_since_previous_recall:28},{timer_minutes_since_previous_recall:30}]}
    ],
    formal_score_evidence:{
      sealed_papers:[
        {year:2024,earned_score:270,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2024',exam_format:{year:2024,question_count:165,max_score:300}},
        {year:2025,earned_score:278,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2025',exam_format:{year:2025,question_count:165,max_score:300}},
        {year:2026,earned_score:282,max_score:300,internal_holdout_protected_before_seal:true,exam_format_source_hash:'historical-format-v1',question_inventory_hash:'paper-2026',exam_format:{year:2026,question_count:165,max_score:300}}
      ]
    }
  };
}

// Forecast falsifiability + capacity stress.
check('forecast_falsifiability_and_lifecycle',()=>{
  const progress=baseProgress();
  const surface=buildXizongForecastFalsifiability(progress,{
    startDay:'2026-09-21',deadlineDay:'2026-10-20',dailyMinutes:300,
    wrongUncertainRateGrid:[0.15,0.30,0.45],dailyMinutesGrid:[180,300,420]
  });
  assert.equal(surface.wrong_uncertain_capacity_grid.length,9);
  assert.ok(surface.next_high_value_evidence);
  for(const cap of [180,300,420]){
    const rows=surface.wrong_uncertain_capacity_grid.filter(r=>r.daily_minutes===cap)
      .sort((a,b)=>a.wrong_uncertain_rate-b.wrong_uncertain_rate);
    const priced=rows.filter(r=>r.required_average_minutes_per_day?.p50!=null);
    for(let i=1;i<priced.length;i+=1){
      assert.ok(priced[i].required_average_minutes_per_day.p50>=priced[i-1].required_average_minutes_per_day.p50);
    }
  }
  return {grid:9,flip_surface:surface.p50_flip_surface,next_evidence:surface.next_high_value_evidence.id};
});

// Missing timer must remain unpriced.
check('forecast_missing_data_fail_closed',()=>{
  const p=baseProgress();
  p.runtime_evidence.completed_blocks_detail=p.runtime_evidence.completed_blocks_detail.map(r=>({...r,timer_minutes_to_completion:0}));
  p.practice_evidence.first_pass.by_day=p.practice_evidence.first_pass.by_day.map(r=>({...r,practice_timer_minutes:0,observed_minutes_per_attempt:null}));
  p.repair_evidence.calibration_samples=[];
  p.system_recall_evidence=p.system_recall_evidence.map(r=>({...r,events:[]}));
  const f=buildXizongWorkloadForecast(p);
  assert.equal(f.first_round.full_band_minutes,null);
  return {fake_precision:false};
});

// High score cannot manufacture X8; Current format unknown cannot manufacture current calibration.
check('score_evidence_fail_closed',()=>{
  const p=baseProgress();
  const historical=buildXizongScoreEvidence(p,{targetScore:275,contaminationStatus:'LEAST_CONTAMINATED'});
  assert.ok(historical.formal_score.historical_calibration_band);
  assert.equal(historical.formal_score.calibration_band,null);
  assert.equal(historical.formal_score.score_extrapolation_ready,false);
  assert.equal(historical.formal_score.current_format_compatibility,'UNKNOWN_CURRENT_YEAR_FORMAT');
  assert.equal(historical.capabilities.case_stability.dedicated_case_evidence,false);
  assert.equal(historical.subject_maturity_claim,'OUT_OF_SCOPE');
  const matched=buildXizongScoreEvidence(p,{
    targetScore:275,contaminationStatus:'LEAST_CONTAMINATED',
    currentExamFormatSourceHash:'historical-format-v1'
  });
  assert.ok(matched.formal_score.calibration_band);
  assert.equal(matched.formal_score.score_extrapolation_ready,false, 'historical empirical bands are not prospective score validation');
  return {historical_observation_preserved:true,current_format_required:true,whole_paper_cannot_fake_x8:true};
});

// Future-source slots + fallbacks.
check('future_source_readiness',()=>{
  const bio=readJson('content/xizong/knowledge/learner/xizong-2027-biochemistry-delta-slot.json');
  const h=readJson('content/xizong/humanities/current.json');
  const format=readJson('content/xizong/questions/exam-format.json');
  const format27=readJson('content/xizong/questions/exam-format-2027-slot.json');
  const late=readJson('content/xizong/knowledge/learner/xizong-26-late-stage-material-baseline.json');
  assert.match(String(bio.status||''),/^CLOSED_CURRENT/,'Biochemistry lifecycle must be closed/current without pinning a historical closeout enum');
  assert.equal(bio.current_state.source_present,true);
  assert.equal(bio.current_state.dependency_freshness?.schema,'kianos.xizong.dependency_freshness.v1');
  assert.equal(bio.current_state.downstream_revalidation?.status,'CURRENT_FULL_TRANSITIVE_REVALIDATED');
  assert.equal(bio.current_state.current_year_delta_known,true);
  assert.deepEqual(bio.current_state.deep_review?.remaining,[]);
  assert.equal(bio.current_state.source_map?.status,'CURRENT_27_SOURCE_ROUTING_REACCEPTED');
  assert.equal(format27.status,'BLOCKED_UNTIL_AUTHORITATIVE_2027_SOURCE');
  assert.equal(format27.current_state.authoritative_2027_source_present,false);
  assert.equal(format27.current_state.exact_question_count,null);
  assert.equal(format27.current_state.exact_scoring_segments,null);
  assert.match(String(h.status),/2027_SCOPE_DELTA_BLOCKED/);
  assert.equal(late.readiness?.current_27_delta,'BLOCKED_UNTIL_27_SOURCE');
  for(const id of ['26-CASE-CRAM','26-FOUR-MOCKS','26-FINAL-5H']){
    const row=(late.baseline_families||[]).find(x=>x.family_id===id);
    assert.ok(row);
    assert.ok(String(row.current_year_delta_slot||'').length>0);
  }
  const eraMax=Math.max(...(format.eras||[]).map(row=>Number(row.end_year||row.endYear||0)));
  assert.ok(eraMax<=2026,'Current exam-format owner must not fabricate 2027 geometry');
  return {
    biochemistry:'CURRENT_27_REACCEPTED',
    humanities:'BLOCKED_FUTURE_SOURCE',
    exam_geometry:'BLOCKED_FUTURE_SOURCE',
    exam_geometry_slot:'READY',
    late_stage:'DELTA_SLOTS_READY'
  };
});

// Future material net-new accounting.
check('future_source_net_new_accounting',()=>{
  const r=reconcileXizongMaterialIncrement([
    {id:'future-case',gross_minutes:900,replaces_minutes:300,overlap_minutes:150,admitted:true}
  ]);
  assert.equal(r.status,'PRICED');
  assert.equal(r.net_minutes,450);
  return {gross:900,replacement:300,overlap:150,net_new:450};
});

// Mother-standard coverage in one practical package, not a second strategy brain.
check('maturity_package_coverage',()=>{
  const pkg=readText('content/xizong/MATURITY_PACKAGE.md');
  const markers=[
    'Full material inventory by capability role',
    'Source fidelity + evidence identity + transitive invalidation',
    'Minimum evidence floor is not a task quota',
    'Elastic / ROI control',
    'Causal Repair decision model',
    'Future Source lifecycle + fallback',
    'Learner attention + Day-1 execution proof',
    'Full-lifecycle simulation + adversarial report',
    'False Secure / False Unstable control',
    'Second-line subject-native safety guard',
    'Fresh Chat attack','No-Website attack','Authentic modality boundary',
    'Real Learner U split','Final practical Maturity Package checklist'
  ];
  for(const marker of markers) assert.ok(pkg.includes(marker),'missing:'+marker);
  return {single_package:true,markers:markers.length};
});


check('companion_proof_inventory',()=>{
  const required=[
    'static-web/scripts/test-xizong-forecast-real-u-adapter.mjs',
    'static-web/scripts/validate-xizong-paper-practice.mjs',
    'static-web/scripts/test-xizong-source-revision-transitive.mjs',
    'static-web/scripts/validate-xizong-targeted-practice.mjs',
    'static-web/scripts/test-exam-plan-read-model.mjs',
    'static-web/scripts/test-xizong-chat-return.mjs',
    'static-web/scripts/test-private-learner-checkpoint.mjs',
    'static-web/scripts/test-private-daily-learning-packet.mjs',
    'static-web/scripts/validate-xizong-biochemistry-source-lifecycle.mjs',
    'static-web/scripts/validate-xizong-2027-exam-format-slot.mjs'
  ];
  for(const file of required){
    assert.ok(fs.existsSync(path.join(root,file)),'missing companion proof:'+file);
  }
  const pkg=readText('content/xizong/MATURITY_PACKAGE.md');
  for(const marker of [
    'Method map by phase',
    'Evidence truth',
    'Open-case / model-scoring validity boundary',
    'Dynamic-control policy',
    'Causal Repair decision model',
    'Learner attention + Day-1 execution proof',
    'Full-lifecycle simulation + adversarial report',
    'Second-line subject-native safety guard',
    'Fresh Chat attack',
    'No-Website attack',
    'Authentic modality boundary',
    'Real Learner U split'
  ]) assert.ok(pkg.includes(marker),'missing package proof marker:'+marker);
  return {companion_proofs:required.length};
});

const failed=results.filter(r=>r.status==='FAIL');
const byId=new Map(results.map(row=>[row.id,row]));
const CLOSED='CLOSED';
const BLOCKED_FUTURE_SOURCE='BLOCKED_FUTURE_SOURCE';
const REAL_U_REQUIRED='REAL_U_REQUIRED';
const DEFECT='DEFECT';

function depOk(ids){
  return ids.every(id=>byId.get(id)?.status==='PASS');
}
function row(id,title,deps,status=CLOSED,note=''){
  return {
    id,
    title,
    status: depOk(deps) ? status : DEFECT,
    proof: deps,
    note
  };
}

const requirements=[
  row(1,'分数闭环',['score_loss_geometry']),
  row(2,'能力闭环',['whole_subject_scope','maturity_package_coverage']),
  row(3,'材料闭环',['whole_subject_scope','whole_subject_official_scope','maturity_package_coverage','companion_proof_inventory']),
  row(4,'Source Fidelity 闭环',['source_revision_invalidates_old_stability','future_source_readiness','companion_proof_inventory']),
  row(5,'方法闭环',['maturity_package_coverage','false_unstable_stable_becomes_cheaper','companion_proof_inventory']),
  row(6,'证据闭环',['near_derivative_freshness','score_evidence_fail_closed','companion_proof_inventory']),
  row(7,'主观评分有效性',['maturity_package_coverage','score_evidence_fail_closed','companion_proof_inventory']),
  row(8,'Forecast 闭环',['forecast_falsifiability_and_lifecycle','forecast_missing_data_fail_closed','whole_subject_scope','whole_subject_official_scope','companion_proof_inventory']),
  row(9,'Forecast 必须可证伪',['forecast_falsifiability_and_lifecycle']),
  row(10,'Dynamic Control 闭环',['false_secure_repeated_known','false_unstable_stable_becomes_cheaper','maturity_package_coverage']),
  row(11,'Minimum Dose 不是任务配额',['false_secure_repeated_known']),
  row(12,'Elastic / ROI 闭环',['false_unstable_stable_becomes_cheaper','future_source_net_new_accounting','maturity_package_coverage']),
  row(13,'Repair 因果闭环',['maturity_package_coverage','companion_proof_inventory']),
  row(14,'未来材料全生命周期闭环',['future_source_readiness','future_source_net_new_accounting','source_revision_invalidates_old_stability']),
  row(15,'Prior-year 材料现在就吸收',['future_source_readiness','future_source_net_new_accounting']),
  row(16,'Chat ↔ Website 执行闭环',['capacity_fail_closed','companion_proof_inventory']),
  row(17,'Learner Attention Cost',['capacity_fail_closed','maturity_package_coverage','companion_proof_inventory']),
  row(18,'Day-1 实际学习闭环',['companion_proof_inventory','capacity_fail_closed']),
  row(19,'全生命周期模拟',['forecast_falsifiability_and_lifecycle','forecast_missing_data_fail_closed','source_revision_invalidates_old_stability','false_secure_repeated_known','false_unstable_stable_becomes_cheaper','companion_proof_inventory']),
  row(20,'Adversarial Stress Test',['forecast_falsifiability_and_lifecycle','near_derivative_freshness','companion_proof_inventory']),
  row(21,'False Secure 和 False Unstable',['false_secure_repeated_known','false_unstable_stable_becomes_cheaper']),
  row(22,'Second-line Safety Guard',['capacity_fail_closed','source_revision_invalidates_old_stability','near_derivative_freshness','companion_proof_inventory']),
  row(23,'Fresh Chat Attack',['fresh_chat_owner_recovery']),
  row(24,'No-Website Attack',['score_loss_geometry','forecast_falsifiability_and_lifecycle','maturity_package_coverage']),
  row(25,'Evidence Revision / Identity',['source_revision_invalidates_old_stability','near_derivative_freshness','score_evidence_fail_closed']),
  row(26,'Future Source Transitive Invalidation',['source_revision_invalidates_old_stability','future_source_readiness','score_evidence_fail_closed']),
  row(27,'Authentic Modality',['maturity_package_coverage'],REAL_U_REQUIRED,'System rule closed; real paper/answer-sheet/fatigue calibration requires Kian use.'),
  row(28,'Real Learner U',['maturity_package_coverage','forecast_missing_data_fail_closed'],REAL_U_REQUIRED,'SYSTEM_LOGIC and KIAN_SPECIFIC calibration remain separate.'),
  row(29,'Subject-native，不许强行统一',['whole_subject_scope','maturity_package_coverage'])
];

assert.equal(requirements.length,29,'must classify exactly 29 mother-standard requirements');

const pkg=readText('content/xizong/MATURITY_PACKAGE.md');
const delivery={
  A:{status:/Capability formation matrix/.test(pkg)&&/Method map by phase/.test(pkg)&&/Evidence truth/.test(pkg)?CLOSED:DEFECT},
  B:{status:/Full material inventory by capability role/.test(pkg)?CLOSED:DEFECT},
  C:{status:/Dynamic-control policy/.test(pkg)?CLOSED:DEFECT},
  D:{status:/Forecast integration/.test(pkg)?CLOSED:DEFECT},
  E:{status:/Full-lifecycle simulation \+ adversarial report/.test(pkg)?CLOSED:DEFECT},
  F:{status:/Execution proof boundary/.test(pkg)?CLOSED:DEFECT},
  G:{status:/Future Source lifecycle \+ fallback/.test(pkg)?CLOSED:DEFECT},
  H:{status:/Real Learner U split/.test(pkg)?CLOSED:DEFECT},
  I:{status:/Remaining Unknowns/i.test(pkg)&&/Future Source or Real Learner U/i.test(pkg)?CLOSED:DEFECT}
};

const future_sources=[
  {id:'2027_HUMANITIES',status:BLOCKED_FUTURE_SOURCE,owner:'content/xizong/humanities/current.json'},
  {id:'2027_EXAM_FORMAT',status:BLOCKED_FUTURE_SOURCE,owner:'content/xizong/questions/exam-format-2027-slot.json'},
  {id:'2027_LATE_STAGE',status:BLOCKED_FUTURE_SOURCE,owner:'content/xizong/knowledge/learner/xizong-26-late-stage-material-baseline.json'}
];
for(const item of future_sources){
  assert.ok(fs.existsSync(path.join(root,item.owner)),'missing future-source owner:'+item.owner);
}

assert.match(pkg,/For the 275 working path and 270 protected floor, which score-relevant capability is currently binding/i);
assert.match(pkg,/current binding uncertainty is \*\*Real Learner U\*\*/i);
assert.match(pkg,/real Stage-B study/i);
assert.match(pkg,/SYSTEM_LOGIC_ACCEPTED = YES/);
assert.match(pkg,/KIAN_SPECIFIC_CALIBRATED = NO/);

const requirementDefects=requirements.filter(row=>row.status===DEFECT);
const deliveryDefects=Object.values(delivery).filter(row=>row.status===DEFECT);
const counts=requirements.reduce((acc,row)=>{
  acc[row.status]=(acc[row.status]||0)+1;
  return acc;
},{});

console.log(JSON.stringify({
  schema:'kianos.xizong.mother-standard-final-audit.v4',
  raw_checks:results,
  requirements,
  delivery,
  future_sources,
  summary:{
    raw_pass:results.length-failed.length,
    raw_fail:failed.length,
    requirement_counts:counts,
    delivery_defects:deliveryDefects.length,
    system_logic_accepted:failed.length===0&&requirementDefects.length===0&&deliveryDefects.length===0,
    kian_specific_calibrated:false,
    current_binding_uncertainty:'REAL_LEARNER_U',
    next_control_policy:'REAL_STAGE_B_STUDY_NOT_MORE_ARCHITECTURE'
  }
},null,2));

if(failed.length||requirementDefects.length||deliveryDefects.length){
  console.error('FAIL Xizong mother-standard final audit v4');
  process.exitCode=1;
}else{
  console.log('PASS Xizong mother-standard final audit v4: all 29 requirements classified with no DEFECT');
}
