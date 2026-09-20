import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  appendMemoryEvidence,
  createXizongMemoryState,
  releaseBlockMemory,
  xizongRetentionState
} from '../src/lib/xizongMemoryModel.mjs';
import {
  normalizeXizongInlinePracticeQuestions,
  validateXizongInlinePracticeQuestionBindings
} from '../src/lib/xizongSessionInstruction.mjs';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';
import {
  applyXizongForecastScenario,
  buildXizongForecastFalsifiability,
  buildXizongForecastLoop,
  buildXizongScoreEvidence,
  buildXizongWorkloadForecast
} from '../src/lib/xizongForecastModel.mjs';

const DAY = 86400000;
const T0 = Date.parse('2026-09-21T08:00:00.000Z');

function baseProgress() {
  const blocks = [
    ['A1','a1-b01',12,5,60],
    ['A1','a1-b02',18,6,90],
    ['A1','a1-b03',20,7,110],
    ['A2','a2-b01',14,4,80],
    ['A2','a2-b02',24,8,130],
    ['A2','a2-b03',30,10,null]
  ];
  const completed = blocks.slice(0,5).map(([canonical,block,kp,lg,minutes], index) => ({
    canonical_id: canonical,
    block_id: block,
    kp_count: kp,
    logic_group_count: lg,
    timer_minutes_to_completion: minutes,
    completed_at: new Date(T0 + index * DAY).toISOString()
  }));
  return {
    schema:'kianos.xizong.forecast-progress.v1',
    canonical_scope:{
      systems:2,
      blocks:blocks.length,
      canonical_kp:blocks.reduce((s,row)=>s+row[2],0),
      logic_groups:blocks.reduce((s,row)=>s+row[3],0),
      block_weights:blocks.map(([canonical,block,kp,lg])=>({
        canonical_id:canonical,block_id:block,kp_count:kp,logic_group_count:lg
      }))
    },
    runtime_evidence:{
      observed_blocks:6,
      completed_blocks:5,
      started_incomplete_blocks:1,
      completed_block_ids:completed.map(row=>row.block_id),
      completed_blocks_detail:completed,
      started_incomplete:[{canonical_id:'A2',block_id:'a2-b03',kp_count:30,logic_group_count:10}],
      recall:{rated:70,unknown:4,fuzzy:8,known:30,mastered:28}
    },
    question_workload:{
      status:'EXACT_COMPLETE',
      exact_union_eligible_questions:500,
      known_remaining_questions:100,
      known_remaining_is_lower_bound:false,
      cross_system_duplicate_memberships:0,
      unknown_systems:[]
    },
    practice_evidence:{
      first_pass:{
        attempted_questions:400,
        current_scope_eligible_attempted_questions:400,
        wrong_or_uncertain_rate:0.20,
        by_day:[
          {day:'2026-09-16',attempted:40,practice_timer_minutes:48,observed_minutes_per_attempt:1.2},
          {day:'2026-09-17',attempted:50,practice_timer_minutes:70,observed_minutes_per_attempt:1.4},
          {day:'2026-09-18',attempted:40,practice_timer_minutes:64,observed_minutes_per_attempt:1.6},
          {day:'2026-09-19',attempted:50,practice_timer_minutes:90,observed_minutes_per_attempt:1.8},
          {day:'2026-09-20',attempted:40,practice_timer_minutes:80,observed_minutes_per_attempt:2.0}
        ]
      },
      latest:{unresolved_wrong_uncertain_questions:20},
      fresh_transfer:{
        observed_probes:12,stable:8,uncertain:3,wrong:1,
        by_probe_kind:{FRESH_VARIANT:12},
        by_probe_kind_status:{FRESH_VARIANT:{observed:12,stable:8,uncertain:3,wrong:1}}
      }
    },
    repair_evidence:{
      total_repair_clusters:50,
      active_repair_clusters:5,
      active_question_backed_clusters:5,
      completed_repair_clusters:45,
      completed_question_backed_clusters:45,
      question_backed_clusters:50,
      unique_source_question_ids:100,
      observed_question_to_cluster_ratio:2,
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
      {canonical_id:'A1',pre_question_recall_observed:true,post_first_pass_recall_observed:true,events:[
        {timer_minutes_since_previous_recall:20},{timer_minutes_since_previous_recall:22}
      ]},
      {canonical_id:'A2',pre_question_recall_observed:true,post_first_pass_recall_observed:false,events:[
        {timer_minutes_since_previous_recall:25},{timer_minutes_since_previous_recall:28},{timer_minutes_since_previous_recall:30}
      ]}
    ],
    formal_score_evidence:{
      sealed_papers:[
        {year:2024,earned_score:290,max_score:300,internal_holdout_protected_before_seal:true,discipline_breakdown:{disciplines:{}}},
        {year:2025,earned_score:290,max_score:300,internal_holdout_protected_before_seal:true,discipline_breakdown:{disciplines:{}}},
        {year:2026,earned_score:290,max_score:300,internal_holdout_protected_before_seal:true,discipline_breakdown:{disciplines:{}}}
      ]
    }
  };
}

// Fresh Chat attack: only Current + Maturity Package are read.
const repoRoot = path.resolve(process.cwd(), '..');
const current = fs.readFileSync(path.join(repoRoot,'content/xizong/CURRENT.md'),'utf8');
const maturity = fs.readFileSync(path.join(repoRoot,'content/xizong/MATURITY_PACKAGE.md'),'utf8');
assert.match(current,/subject maturity \/ 270–275 control → \`MATURITY_PACKAGE\.md\`/);
assert.match(maturity,/Protect floor: \*\*270\+\*\*/);
assert.match(maturity,/Working target: \*\*275\+\*\*/);
assert.match(maturity,/Stage B — First-pass Capability \| \*\*CURRENT \/ REAL-U REQUIRED\*\*/);
assert.match(maturity,/Forecast is not a strategy brain/);
assert.match(maturity,/KIAN_SPECIFIC_CALIBRATED = NO/);
assert.doesNotMatch(maturity,/PR #631|PR #639/);

// False Secure + transitive revision: stable old evidence cannot survive Source v2.
let memory = createXizongMemoryState();
const descriptor = (sourceHash) => ({
  blockId:'audit-b01',
  systemId:'audit',
  canonicalId:'AUDIT',
  blockLabel:'B01',
  blockTitle:'Audit',
  sourceHash,
  coreCards:[{
    id:'core:audit-b01-kp01',
    blockId:'audit-b01',
    systemId:'audit',
    canonicalId:'AUDIT',
    blockLabel:'B01',
    blockTitle:'Audit',
    kpId:'audit-b01-kp01',
    displayId:'KP01',
    title:'Audit KP',
    promptCanonical:'Recall Audit KP',
    coreHtml:'<p>v</p>',
    sourceHash
  }],
  precisionCards:[]
});
memory = releaseBlockMemory(memory, descriptor('source-v1'), T0);
memory = appendMemoryEvidence(memory,{cardId:'core:audit-b01-kp01',rating:'mastered',origin:'AUDIT'},T0 + 60_000);
const stableBefore = xizongRetentionState(memory,'core:audit-b01-kp01',T0 + 120_000);
assert.equal(stableBefore.state,'STABLE_WAIT');
memory = releaseBlockMemory(memory, descriptor('source-v2'), T0 + DAY);
const invalidated = xizongRetentionState(memory,'core:audit-b01-kp01',T0 + DAY + 60_000);
assert.equal(invalidated.state,'DUE_CONTENT_CHANGED');
assert.equal(invalidated.dueReason,'CONTENT_CHANGED_AFTER_LAST_EVIDENCE');

// Old synthetic probe cannot cross the same semantic revision.
const probe = normalizeXizongInlinePracticeQuestions([{
  question_id:'xizong-ai-probe:audit-b01-kp01-001',
  source_kind:'AI_TRANSFER_PROBE',
  probe_kind:'CONDITION_CHANGE',
  question_type:'A',
  stem:'改变决定性条件后，哪项成立？',
  options:[
    {label:'A',text:'A'},{label:'B',text:'B'},
    {label:'C',text:'C'},{label:'D',text:'D'}
  ],
  correct_answer:'C',
  target_kp_ids:['audit-b01-kp01'],
  canonical_source_hash:'source-v1',
  explanation:{
    exam_target:'changed-context transfer',
    decision_axis:'decisive condition',
    reasoning_chain:['identify changed condition','rerun mechanism'],
    correct_option_reason:'C follows the changed condition',
    valuable_distractors:[{option:'B',reason:'keeps the old condition fixed'}],
    common_failure_node:'memorizes old wording',
    transfer_rule:'recompute from the current Source'
  }
}],'MOTHER_STANDARD_AUDIT');
assert.throws(
  ()=>validateXizongInlinePracticeQuestionBindings(memory,probe,'MOTHER_STANDARD_AUDIT'),
  /INLINE_QUESTION_SOURCE_REVISION_MISMATCH/
);

// False Secure: repeated "known" cannot manufacture durable stability.
let known = createXizongMemoryState();
known = releaseBlockMemory(known,descriptor('source-v1'),T0);
for(let day=0;day<6;day+=1){
  known = appendMemoryEvidence(known,{
    cardId:'core:audit-b01-kp01',rating:'known',origin:'AUDIT'
  },T0 + day*DAY + 60_000);
  const state=xizongRetentionState(known,'core:audit-b01-kp01',T0 + day*DAY + 120_000);
  assert.equal(state.stabilityStage,0);
  assert.ok(['KNOWN_WAIT','DUE_DELAYED_STABILITY'].includes(state.state));
}

// Second-line capacity veto: Website cannot silently execute impossible Chat Plan.
const overCapacity=buildChatControlledExamReadModel({
  day:'2026-09-21',
  dayCapacity:300,
  chatPlanState:{
    status:'ready',
    plan:{
      schema:'kianos.exam.chat-plan.v1',
      study_day:'2026-09-21',
      generated_at:'2026-09-21T01:00:00.000Z',
      subjects:{
        xizong:{target_minutes:240,role:'main',note:'',session_ref:'xz-audit'},
        english:{target_minutes:90,role:'keep',note:'',session_ref:null},
        politics:{target_minutes:30,role:'keep',note:'',session_ref:null}
      },
      next_subject:'xizong',
      attention:null
    }
  },
  nativeContinue:{
    xizong:{href:'/kianos/xizong/a1/',title:'A1',sessionRef:'xz-audit'},
    english:{href:'/kianos/english/',title:'English'},
    politics:{href:'/kianos/politics/',title:'Politics'}
  }
});
assert.equal(overCapacity.control.planStatus,'capacity_conflict');
assert.equal(overCapacity.next,null);
assert.equal(overCapacity.capacity.overplannedMinutes,60);

// Forecast falsifiability: more W/U cannot reduce workload; more capacity cannot worsen fit.
const progress=baseProgress();
const surface=buildXizongForecastFalsifiability(progress,{
  startDay:'2026-09-21',
  deadlineDay:'2026-10-20',
  dailyMinutes:300,
  scope:'first_round',
  wrongUncertainRateGrid:[0.15,0.30,0.45],
  dailyMinutesGrid:[180,300,420]
});
assert.equal(surface.wrong_uncertain_capacity_grid.length,9);
assert.ok(surface.next_high_value_evidence);
for(const capacity of [180,300,420]){
  const rows=surface.wrong_uncertain_capacity_grid
    .filter(row=>row.daily_minutes===capacity)
    .sort((a,b)=>a.wrong_uncertain_rate-b.wrong_uncertain_rate);
  const priced=rows.filter(row=>row.required_average_minutes_per_day?.p50!=null);
  for(let i=1;i<priced.length;i+=1){
    assert.ok(priced[i].required_average_minutes_per_day.p50 >= priced[i-1].required_average_minutes_per_day.p50);
  }
}
const at030=surface.wrong_uncertain_capacity_grid
  .filter(row=>row.wrong_uncertain_rate===0.30)
  .sort((a,b)=>a.daily_minutes-b.daily_minutes);
const fitRank=(v)=>v===true?2:v===false?1:0;
for(let i=1;i<at030.length;i+=1){
  assert.ok(fitRank(at030[i].p50_fit) >= fitRank(at030[i-1].p50_fit));
}

// Bad-week / 30%-capacity disturbance pushes completion later, not into fake debt.
const forecast=buildXizongWorkloadForecast(progress);
const baseline=applyXizongForecastScenario(forecast,{dailyMinutes:300,startDay:'2026-09-21'});
const badWeek=applyXizongForecastScenario(forecast,{
  dailyMinutes:300,
  startDay:'2026-09-21',
  capacityMinutesByDay:{
    '2026-09-21':90,
    '2026-09-22':90,
    '2026-09-23':90
  }
});
assert.ok(badWeek.first_round.band_dates.p50.days >= baseline.first_round.band_dates.p50.days);

// Missing timer evidence must widen to UNKNOWN/unpriced rather than inherit fake precision.
const noTimer=baseProgress();
noTimer.runtime_evidence.completed_blocks_detail=noTimer.runtime_evidence.completed_blocks_detail.map(row=>({
  ...row,timer_minutes_to_completion:0
}));
noTimer.practice_evidence.first_pass.by_day=noTimer.practice_evidence.first_pass.by_day.map(row=>({
  ...row,practice_timer_minutes:0,observed_minutes_per_attempt:null
}));
noTimer.repair_evidence.calibration_samples=[];
noTimer.system_recall_evidence=noTimer.system_recall_evidence.map(row=>({...row,events:[]}));
const noTimerForecast=buildXizongWorkloadForecast(noTimer);
assert.equal(noTimerForecast.first_round.full_band_minutes,null);

// High paper scores cannot manufacture X8 case closure.
const highScoreNoCase=buildXizongScoreEvidence(progress,{
  targetScore:275,
  contaminationStatus:'LEAST_CONTAMINATED'
});
assert.equal(highScoreNoCase.capabilities.case_stability.dedicated_case_evidence,false);
assert.equal(highScoreNoCase.subject_maturity_claim,'OUT_OF_SCOPE');
assert.ok(highScoreNoCase.formal_score.calibration_band);

// Contamination preserves observation but blocks strong extrapolation.
const contaminated=buildXizongScoreEvidence(progress,{
  targetScore:275,
  contaminationStatus:'KNOWN_PRIOR_EXPOSURE'
});
assert.ok(contaminated.formal_score.empirical_band);
assert.equal(contaminated.formal_score.calibration_band,null);
assert.equal(contaminated.formal_score.score_extrapolation_ready,false);

// Forecast itself cannot advance subject stage.
const loop=buildXizongForecastLoop(progress,{
  targetScore:275,
  contaminationStatus:'LEAST_CONTAMINATED',
  dailyMinutes:300,
  startDay:'2026-09-21'
});
assert.equal(loop.subject_stage_decision,'OUT_OF_SCOPE');

console.log(JSON.stringify({
  schema:'kianos.xizong.mother-standard-final-audit.v1',
  fresh_chat_recovery:'PASS',
  no_website_pure_logic:'PASS',
  source_v2_invalidates_old_stability:'PASS',
  stale_synthetic_revision_rejected:'PASS',
  repeated_known_cannot_fake_stability:'PASS',
  over_capacity_plan_veto:'PASS',
  forecast_falsifiability:'PASS',
  bad_week_capacity_degrades_safely:'PASS',
  missing_timer_fails_closed:'PASS',
  high_score_cannot_fake_case_transfer:'PASS',
  contaminated_score_cannot_fake_calibration:'PASS',
  forecast_cannot_advance_subject_stage:'PASS'
},null,2));
console.log('PASS Xizong Mother-Standard lifecycle/fresh-chat/no-website audit');
