import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  buildXizongForecastCanonicalScope,
  listCurrentXizongSystemIdentities,
  listProjectableXizongSystems,
  loadXizongBlock
} from '../src/lib/xizong.mjs';
import {
  buildXizongForecastQuestionScope,
  loadXizongSystemQuestionSweep
} from '../src/lib/xizongQuestions.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { buildXizongForecastProgress } from '../src/lib/xizongStudyPacket.mjs';
import {
  XIZONG_MEMORY_STORAGE_KEY,
  createXizongMemoryState
} from '../src/lib/xizongMemoryModel.mjs';

class Storage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length(){ return this.map.size; }
  key(index){ return [...this.map.keys()][index] ?? null; }
  getItem(key){ return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key,value){ this.map.set(String(key),String(value)); }
  removeItem(key){ this.map.delete(String(key)); }
}

const currentSystems=listCurrentXizongSystemIdentities();
assert.equal(currentSystems.length,8,'whole-subject Current roster must contain all 8 System owners');
assert.deepEqual(currentSystems.map(row=>row.canonicalId),['A1','A2','A3','B','C','D','E','F']);

const questionScope=buildXizongForecastQuestionScope(currentSystems);
assert.equal(questionScope.schema,'kianos.xizong.forecast-question-scope.v1');
assert.equal(questionScope.systems.length,8);
assert.equal(questionScope.scope_complete,true);
assert.equal(questionScope.unknown_systems.length,0);
assert.equal(questionScope.unknown_domains.length,0);
assert.equal(questionScope.systems.find(row=>row.canonical_id==='F')?.question_count,70);
const humanitiesScope=questionScope.non_system_domains.find(row=>row.canonical_id==='HUMANITIES');
assert.equal(humanitiesScope?.status,'EXACT');
assert.equal(humanitiesScope?.question_count,80);
assert.equal(humanitiesScope?.domain_id,'clinical-humanities');
assert.equal(questionScope.cross_system_duplicate_memberships,0,
  'independent humanities qids must not overlap A1-F exact System membership');

const projectable=listProjectableXizongSystems();
assert.ok(projectable.length>=1);
const system=projectable[0];
assert.ok(system.blocks.length>=2);
const packetIndex=system.blocks.slice(0,2).map((blockRef)=>{
  const canonical=loadXizongBlock(system.systemId,blockRef.slug);
  const production=buildXizongProductionBlock(canonical);
  return {
    systemId:system.systemId,
    slug:blockRef.slug,
    routeKey:system.systemId+'/'+blockRef.slug,
    blockId:canonical.blockId,
    blockLabel:canonical.label,
    packetMeta:{
      objectId:canonical.objectId,
      systemId:system.systemId,
      canonicalId:system.canonicalId,
      blockId:canonical.blockId,
      blockLabel:canonical.label,
      blockTitle:canonical.title,
      sourcePath:canonical.sourcePath,
      sourceHash:canonical.sourceHash,
      sourceContactMode:String(production?.sourceContact?.mode||''),
      sourcePerGroup:production?.sourceContact?.logicGroupIsAutomaticSourceChunk===true,
      reserveItems:[]
    },
    kpRows:production.kpRecords.map((kp)=>({
      kpId:kp.kpId,
      displayId:kp.displayId,
      title:kp.title,
      groupId:kp.groupId,
      groupLabel:kp.groupLabel,
      sourceLocator:kp.sourceLocator||'',
      prompt:kp.prompt||''
    }))
  };
});

const canonicalScope=buildXizongForecastCanonicalScope(packetIndex);
assert.equal(canonicalScope.schema,'kianos.xizong.forecast-canonical-scope.v1');
assert.equal(canonicalScope.systems.length,8);
assert.equal(canonicalScope.blocks,159);
assert.equal(canonicalScope.canonical_kp,2517);
assert.equal(canonicalScope.logic_groups,762);
assert.equal(canonicalScope.website_projection_is_scope_authority,false);
assert.equal(
  canonicalScope.block_weights.reduce((sum,row)=>sum+Number(row.block_count||1),0),
  159
);
assert.ok(canonicalScope.block_weights.some(row=>row.scope_kind==='UNPROJECTED_AGGREGATE'),
  'narrow runtime packet must not delete unprojected canonical workload');

const currentBlock=packetIndex[0];
const staleBlock=packetIndex[1];
const currentState={
  schema:'kianos.xizong.block-state.v2',
  stage:'block_recall',
  sourceHash:currentBlock.packetMeta.sourceHash,
  learned:Object.fromEntries(currentBlock.kpRows.map(row=>[row.kpId,true])),
  ratings:Object.fromEntries(currentBlock.kpRows.map(row=>[row.kpId,'mastered'])),
  sourceContactDone:true,
  sourceContactEvidence:[{
    segment_id:'block-cumulative:'+currentBlock.packetMeta.objectId,
    coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
    kp_ids:currentBlock.kpRows.map(row=>row.kpId),
    completed_at:'2026-09-18T01:00:00Z',
    source_hash:currentBlock.packetMeta.sourceHash
  }],
  blockRecallDone:true,
  blockRecallCompletedAt:'2026-09-18T01:10:00Z',
  completed:true,
  completedAt:'2026-09-18T01:10:00Z'
};
const staleState={
  schema:'kianos.xizong.block-state.v2',
  stage:'block_recall',
  sourceHash:'historical-stale-source-hash',
  learned:Object.fromEntries(staleBlock.kpRows.map(row=>[row.kpId,true])),
  ratings:Object.fromEntries(staleBlock.kpRows.map(row=>[row.kpId,'mastered'])),
  sourceContactDone:true,
  sourceContactEvidence:[{
    segment_id:'block-cumulative:'+staleBlock.packetMeta.objectId,
    coverage_kind:'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
    kp_ids:staleBlock.kpRows.map(row=>row.kpId),
    completed_at:'2026-09-17T01:00:00Z',
    source_hash:'historical-stale-source-hash'
  }],
  blockRecallDone:true,
  completed:true,
  completedAt:'2026-09-17T01:10:00Z'
};

const sweep=loadXizongSystemQuestionSweep(currentSystems.find(row=>row.systemId===system.systemId));
assert.ok(sweep?.questions?.length>0);
const official=sweep.questions[0];
const officialEvent={
  type:'QUESTION_ATTEMPT',
  question_id:official.questionId,
  question_semantic_revision:official.semanticRevision,
  question_source:'OFFICIAL_EXAM',
  scoring_role:'OFFICIAL_EVIDENCE',
  attempt_index:1,
  system_id:system.systemId,
  canonical_id:system.canonicalId,
  study_phase:'FIRST_PASS',
  context:'SYSTEM_SWEEP',
  round_id:'forecast-real-u-round-1',
  status:'wrong',
  selected:['A'],
  correct_answer:official.correctAnswer,
  year:official.year,
  number:official.number,
  scope_hash:sweep.scopeHash,
  question_inventory_hash:sweep.questionInventoryHash,
  submitted_at:'2026-09-19T01:00:00Z'
};
const freshProbe=(id,submittedAt,status)=>({
  type:'QUESTION_ATTEMPT',
  question_id:id,
  question_source:'AI_TRANSFER_PROBE',
  scoring_role:'TRANSFER_ONLY',
  attempt_index:1,
  probe_kind:'CONDITION_CHANGE',
  evidence_intent:'FRESH_TRANSFER_CHECK',
  semantic_family_id:'sf:forecast-real-u:one-family',
  derived_from_ids:[official.questionId],
  changed_dimensions:['决定性条件'],
  fresh_transfer_eligible:true,
  freshness_class:'CHANGED_CONTEXT',
  target_kp_ids:[currentBlock.kpRows[0].kpId],
  canonical_source_hash:currentBlock.packetMeta.sourceHash,
  status,
  submitted_at:submittedAt
});

const memory=createXizongMemoryState();
memory.repairTasks=[{
  id:'repair:forecast-real-u:1',
  systemId:system.systemId,
  blockId:currentBlock.blockId,
  sourceQuestionIds:[official.questionId],
  createdAt:'2026-09-19T01:05:00Z',
  completedAt:'2026-09-19T01:20:00Z',
  status:'DONE'
}];

const entries={};
entries['kianos-xizong-astro-v2:'+currentBlock.packetMeta.objectId]=JSON.stringify(currentState);
entries['kianos-xizong-astro-v2:'+staleBlock.packetMeta.objectId]=JSON.stringify(staleState);
entries[XIZONG_MEMORY_STORAGE_KEY]=JSON.stringify(memory);
entries['kianos:xizong:system-question-sweep:'+system.systemId+':v1']=JSON.stringify({
  attemptHistory:[
    officialEvent,
    freshProbe('xizong-ai-probe:forecast-real-u-0001','2026-09-19T01:30:00Z','uncertain'),
    freshProbe('xizong-ai-probe:forecast-real-u-0002','2026-09-19T01:40:00Z','stable')
  ]
});
entries['kianos:xizong:system-recall:'+system.systemId+':v1']=JSON.stringify({
  history:[
    {completed_at:'2026-09-18T23:00:00Z',after_round_id:''},
    {completed_at:'2026-09-19T01:50:00Z',after_round_id:'forecast-real-u-round-1'}
  ]
});
entries['kianos:xizong:paper-question-sweep:paper-2026:v1']=JSON.stringify({
  paperSeal:{
    sealedAt:'2026-09-20T02:00:00Z',
    reviewUnlockedAt:null,
    evidenceContext:{
      internalHoldoutProtectedBeforeSeal:true,
      externalExposureStatus:'UNKNOWN',
      scopeHash:'fixture-format-hash',
      questionInventoryHash:'fixture-paper-inventory-hash',
      examFormatSourceHash:'fixture-format-hash',
      examFormat:{
        year:2026,era_id:'2017-2026',question_count:165,max_score:300,
        scoring_segments:[{start:1,end:40,points:1.5},{start:41,end:165,points:2}]
      }
    },
    summary:{
      answeredCount:165,correctCount:150,wrongCount:15,unansweredCount:0,
      questionCount:165,earnedScore:275,maxScore:300
    }
  },
  attemptHistory:[]
});

const storage=new Storage(entries);
const progress=buildXizongForecastProgress(storage,packetIndex,{
  questionScope,
  canonicalScope,
  day:'2026-09-21',
  now:Date.parse('2026-09-21T08:00:00Z')
});

assert.equal(progress.schema,'kianos.xizong.forecast-progress.v1');
assert.equal(progress.canonical_scope.systems,8);
assert.equal(progress.canonical_scope.blocks,159);
assert.equal(progress.canonical_scope.canonical_kp,2517);
assert.equal(progress.canonical_scope.logic_groups,762);
assert.equal(progress.canonical_scope.website_projection_is_scope_authority,false);
assert.equal(progress.canonical_scope.scope_authority,'DERIVED_FROM_CURRENT_KNOWLEDGE_AND_LEARNING_OWNERS');
assert.equal(progress.runtime_evidence.completed_blocks,1);
assert.equal(progress.runtime_evidence.source_revision_blocked_count,1);
assert.equal(progress.runtime_evidence.completed_blocks_detail.length,1);
assert.equal(progress.runtime_evidence.completed_blocks_detail[0].block_id,currentBlock.blockId);
assert.equal(progress.runtime_evidence.recall.rated,currentBlock.kpRows.length);
assert.equal(progress.question_workload.status,'EXACT_COMPLETE');
assert.equal(progress.question_workload.unknown_systems.length,0);
assert.equal(progress.question_workload.unknown_domains.length,0);
const humanitiesWorkload=progress.question_workload.non_system_domains.find(row=>row.canonical_id==='HUMANITIES');
assert.equal(humanitiesWorkload?.owner_kind,'NON_SYSTEM_EXAM_DOMAIN');
assert.equal(humanitiesWorkload?.exact_questions,80);
assert.equal(humanitiesWorkload?.attempted_questions,0);
assert.equal(humanitiesWorkload?.remaining_questions,80);
assert.equal(progress.practice_evidence.first_pass.current_scope_unique_attempted_questions,1);
assert.equal(progress.practice_evidence.first_pass.current_scope_wrong,1);
assert.equal(progress.practice_evidence.fresh_transfer.observed_probes,1);
assert.equal(progress.practice_evidence.fresh_transfer.stable,1);
assert.equal(progress.repair_evidence.total_repair_clusters,1);
assert.equal(progress.repair_evidence.completed_repair_clusters,1);
assert.equal(progress.repair_evidence.unique_source_question_ids,1);
assert.equal(progress.memory_evidence.schema,'kianos.xizong.memory-forecast-evidence.v1');
assert.equal(progress.memory_evidence.precision.cards,0);
assert.equal(progress.system_recall_evidence.find(row=>row.system_id===system.systemId)?.source_revision_blocked,true);
assert.equal(progress.formal_score_evidence.latest.year,2026);
assert.equal(progress.formal_score_evidence.latest.earned_score,275);
assert.equal(progress.formal_score_evidence.latest.internal_holdout_protected_before_seal,true);
assert.equal(progress.formal_score_evidence.latest.external_exposure_status,'UNKNOWN');
assert.equal(progress.formal_score_evidence.latest.exam_format_source_hash,'fixture-format-hash');
assert.equal(progress.formal_score_evidence.latest.question_inventory_hash,'fixture-paper-inventory-hash');
assert.equal(progress.formal_score_evidence.latest.exam_format.question_count,165);
assert.equal(progress.workload_forecast.schema,'kianos.xizong.workload-forecast.v1');
assert.equal(
  progress.workload_forecast.components.questions.known_remaining_questions,
  progress.question_workload.known_remaining_questions
);
assert.equal(progress.workload_forecast.components.questions.band_minutes,null,
  'without real question timing, humanities + A1-F question workload must remain unpriced rather than guessed');
assert.ok(progress.workload_forecast.components.knowledge.remaining.blocks>=158);
assert.ok(progress.workload_forecast.components.knowledge.risks.includes('UNPROJECTED_CANONICAL_SCOPE_RETAINED'));
assert.match(progress.evidence_boundary,/stale\/unbound Source identity cannot reduce remaining workload/i);

const index=fs.readFileSync('src/pages/index.astro','utf8');
const home=fs.readFileSync('src/components/ExamOrchestratorHome.astro','utf8');
const client=fs.readFileSync('src/lib/examOrchestratorClient.mjs','utf8');
const daily=fs.readFileSync('src/lib/dailyLearningPacketRuntime.mjs','utf8');
assert.ok(index.includes('buildXizongForecastQuestionScope(listCurrentXizongSystemIdentities())'));
assert.ok(index.includes('buildXizongForecastCanonicalScope(xizongPacketIndex)'));
assert.ok(index.includes('routeKey:'));
assert.ok(home.includes('data-exam-xizong-forecast-question-scope'));
assert.ok(home.includes('data-exam-xizong-forecast-canonical-scope'));
assert.ok(client.includes('xizongForecastQuestionScope'));
assert.ok(client.includes('xizongForecastCanonicalScope'));
assert.ok(daily.includes('questionScope: xizongForecastQuestionScope'));
assert.ok(daily.includes('canonicalScope: xizongForecastCanonicalScope'));

console.log(JSON.stringify({
  schema:'kianos.xizong.forecast-real-u-adapter-proof.v1',
  current_system_roster:currentSystems.length,
  exact_question_scope:questionScope.scope_complete?'CLOSED':'OPEN',
  factual_block_throughput:'WIRED',
  official_wu:'WIRED',
  repair:'WIRED',
  memory:'WIRED',
  system_recall:'WIRED_WITH_SOURCE_REVISION_GUARD',
  formal_score:'WIRED',
  semantic_family_fresh_transfer:'WIRED',
  stale_source_calibration:'REJECTED',
  strategy_owner_change:false
},null,2));
console.log('PASS Xizong Forecast Real-U adapter: Current facts -> Forecast inputs, no scheduler');
