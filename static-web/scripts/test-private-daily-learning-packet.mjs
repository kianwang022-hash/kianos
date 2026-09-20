import assert from 'node:assert/strict';
import {
  EXAM_PROFILE_KEY,
  emptyExamProfile
} from '../src/lib/examOrchestrator.mjs';
import {
  EXAM_CHAT_PLAN_KEY,
  EXAM_CHAT_PLAN_SCHEMA
} from '../src/lib/examChatPlan.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';
import {
  captureSharedControlCheckpoint
} from '../src/lib/sharedControlCheckpoint.mjs';
import {
  capturePrivateSubjectCheckpoints
} from '../src/lib/privateSubjectCheckpoints.mjs';
import {
  buildPrivateLearnerCheckpoint
} from '../src/lib/privateLearnerCheckpoint.mjs';
import {
  listProjectableXizongSystems,
  loadXizongBlock
} from '../src/lib/xizong.mjs';
import {
  politicsProductCatalog
} from '../src/lib/productCatalog.mjs';
import {
  buildPoliticsMemoryCandidateCatalogCurrent
} from '../src/lib/politicsMemoryCandidates.mjs';
import {
  POLITICS_MEMORY_EVIDENCE_KEY
} from '../src/lib/politicsMemoryRuntime.mjs';
import {
  XIZONG_MEMORY_SCHEMA,
  XIZONG_MEMORY_STORAGE_KEY
} from '../src/lib/xizongMemoryModel.mjs';
import {
  buildDailyLearningPacketFromPrivateCheckpoint
} from './privateDailyLearningPacket.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const day='2026-09-20';
const now=Date.parse('2026-09-20T02:00:00+08:00');
const systems=listProjectableXizongSystems();
assert.ok(systems.length>0,'Current Xizong must have a projectable system');
const system=systems[0];
const blockRef=system.blocks[0];
const block=loadXizongBlock(system.systemId,blockRef.slug);
assert.ok(block.kpRecords.length>0);

const politics=politicsProductCatalog('/');
const politicsMemory=buildPoliticsMemoryCandidateCatalogCurrent();
assert.ok(politicsMemory.candidates.length>0,'Current Politics Memory catalog must have candidates');
const memoryCandidate=politicsMemory.candidates[0];
const memorySnapshot={
  id:memoryCandidate.id,
  subject:memoryCandidate.subject,
  chapter_id:memoryCandidate.chapter_id,
  natural_unit_id:memoryCandidate.natural_unit_id||null,
  family:memoryCandidate.family,
  prompt:memoryCandidate.prompt,
  answer_items:[...(memoryCandidate.answer_items||[])],
  source_refs:[...(memoryCandidate.source_refs||[])],
  source_role:memoryCandidate.source_role
};
const pSubject=politics.subjects[0];
const pChapter=politics.chapters.find(row=>row.subject===pSubject.id)||politics.chapters[0];
assert.ok(pChapter);

const profile=emptyExamProfile();
profile.defaultDailyMinutes=600;

const chatPlan={
  schema:EXAM_CHAT_PLAN_SCHEMA,
  study_day:day,
  generated_at:'2026-09-19T17:00:00.000Z',
  subjects:{
    xizong:{target_minutes:360,role:'主推',note:'continue'},
    english:{target_minutes:120,role:'保连续',note:'continue'},
    politics:{target_minutes:90,role:'推进',note:'continue'}
  },
  next_subject:'xizong',
  attention:null
};

const timerState={
  schema:STUDY_TIMER_SCHEMA,
  running:false,
  manualPaused:true,
  subject:null,
  context:null,
  segmentStartedAt:null,
  lastSeenAt:now,
  revision:1,
  updatedAt:now
};

const timerLedger={
  schema:STUDY_TIMER_SCHEMA,
  sessions:[
    {
      id:'cross-midnight-xizong',
      subject:'xizong',
      context:{subject:'xizong',route:'xizong/test',detailKey:'block',detailLabel:'block'},
      startedAt:Date.parse('2026-09-19T23:30:00+08:00'),
      endedAt:Date.parse('2026-09-20T00:30:00+08:00'),
      source:'timer',
      excluded:false,
      edited:false
    },
    {
      id:'english-40',
      subject:'english',
      context:{subject:'english',route:'reading/test',detailKey:'reading',detailLabel:'reading'},
      startedAt:Date.parse('2026-09-20T00:40:00+08:00'),
      endedAt:Date.parse('2026-09-20T01:20:00+08:00'),
      source:'timer',
      excluded:false,
      edited:false
    }
  ]
};

const englishSession={
  schema:'kianos.english.session-instruction.v1',
  session_id:'english-day-resume',
  study_day:day,
  generated_at:'2026-09-19T17:10:00.000Z',
  current_step:0,
  steps:[{
    step_id:'step-1',
    task:'reading_a',
    object_id:'reading-current-001',
    source_hash:'source-hash-001',
    label:'Reading current',
    note:'resume proof'
  }],
  return_policy:{on_finish:'english_home'}
};

const storage=new MemoryStorage({
  [EXAM_PROFILE_KEY]:JSON.stringify(profile),
  [EXAM_CHAT_PLAN_KEY]:JSON.stringify(chatPlan),
  [STUDY_TIMER_STATE_KEY]:JSON.stringify(timerState),
  [STUDY_TIMER_LEDGER_KEY]:JSON.stringify(timerLedger),

  'kianos-xizong-last-location-v1':JSON.stringify({
    href:'/xizong/'+system.systemId+'/'+blockRef.slug+'/',
    systemId:system.systemId,
    systemCanonical:system.canonicalId,
    systemTitle:system.title,
    blockId:block.blockId,
    blockSlug:blockRef.slug,
    blockLabel:block.label
  }),
  ['kianos-xizong-astro-v2:xizong:'+block.blockId]:JSON.stringify({
    stage:'kp_recall',
    groupIndex:0,
    kpIndex:0,
    learned:{[block.kpRecords[0].kpId]:true},
    ratings:{},
    blockRecallDone:true,
    blockRecallCompletedAt:'2026-09-20T00:15:00+08:00',
    completed:true,
    completedAt:'2026-09-20T00:20:00+08:00'
  }),
  'kianos:xizong:system-question-sweep:forecast-fixture:v1':JSON.stringify({
    attemptHistory:[
      {
        type:'QUESTION_ATTEMPT',
        question_id:'xizong-official-2025-n001',
        question_source:'OFFICIAL_EXAM',
        study_phase:'FIRST_PASS',
        attempt_index:1,
        status:'stable',
        submitted_at:'2026-09-19T23:50:00+08:00'
      },
      {
        type:'QUESTION_ATTEMPT',
        question_id:'xizong-official-2025-n002',
        question_source:'OFFICIAL_EXAM',
        study_phase:'FIRST_PASS',
        attempt_index:1,
        status:'wrong',
        submitted_at:'2026-09-20T00:05:00+08:00'
      }
    ]
  }),

  [XIZONG_MEMORY_STORAGE_KEY]:JSON.stringify({
    schema:XIZONG_MEMORY_SCHEMA,
    repairTasks:[
      {
        id:'repair:forecast:active',
        status:'ACTIVE',
        sourceQuestionIds:['xizong-official-2025-n002','xizong-official-2025-n003']
      },
      {
        id:'repair:forecast:done',
        status:'DONE',
        completedAt:'2026-09-20T00:30:00+08:00',
        sourceQuestionIds:['xizong-official-2025-n004']
      }
    ]
  }),

  'kianos-english-session-instruction-v1':JSON.stringify(englishSession),
  'kianos-reading-last-location-v1':JSON.stringify({
    id:'reading-current-001',
    title:'Reading current',
    href:'/reading/reading-current-001/',
    updatedAt:'2026-09-19T17:15:00.000Z'
  }),

  'kianos-politics-last-location-v1':JSON.stringify({
    href:'/politics/'+pChapter.subject+'/'+pChapter.code+'/',
    subject:pChapter.subject,
    chapter:pChapter.code,
    title:pChapter.title
  }),
  'kianos-politics-attempts-v1':JSON.stringify({units:{}}),
  'kianos-politics-practice-meta-v1':JSON.stringify({}),
  'kianos-politics-evidence-v1':JSON.stringify([]),
  [POLITICS_MEMORY_EVIDENCE_KEY]:JSON.stringify([{
    schema:'kianos.politics.memory-recall-event.v1',
    event_id:'private-relay-memory-yesterday',
    plan_id:'private-relay-memory-plan',
    study_day:'2026-09-19',
    candidate_id:memoryCandidate.id,
    catalog_revision:politicsMemory.revision,
    candidate_snapshot:memorySnapshot,
    response:'FORGOT',
    observed_at:'2026-09-19T12:00:00.000Z'
  }])
});

const shared=captureSharedControlCheckpoint(storage,{studyDay:day,now});
const subjects=capturePrivateSubjectCheckpoints(storage,{}, {now});
const checkpoint=buildPrivateLearnerCheckpoint({
  studyDay:day,
  now,
  shared,
  subjects,
  checkpointId:'daily-packet-proof'
});

const result=buildDailyLearningPacketFromPrivateCheckpoint(checkpoint,{now});
const packet=result.packet;

assert.equal(packet.schema,'kianos.daily-learning-packet.v1');
assert.equal(packet.study_day,day);
assert.equal(packet.timezone,'Asia/Shanghai');

assert.equal(packet.subjects.xizong.time.minutes,30,
  'cross-midnight Xizong session must contribute only the 00:00–00:30 slice to 9/20');
assert.equal(packet.recent_time.window_days,7);
assert.equal(packet.recent_time.days.length,7);
assert.equal(packet.recent_time.days.find((row)=>row.day==='2026-09-19')?.subjects?.xizong,30);
assert.equal(packet.recent_time.days.find((row)=>row.day==='2026-09-20')?.subjects?.xizong,30);
assert.equal(packet.recent_time.days.find((row)=>row.day==='2026-09-20')?.subjects?.english,40);
assert.equal(packet.subjects.english.time.minutes,40);
assert.equal(packet.subjects.politics.time.minutes,0);
assert.equal(packet.total_minutes,70);

assert.equal(packet.subjects.xizong.evidence.schema,'kianos.xizong.study_packet.v3');
assert.equal(packet.subjects.xizong.evidence.current.block_id,block.blockId);
assert.equal(packet.subjects.xizong.evidence.learning_state.current_stage,'kp_recall');
const xzForecast=packet.subjects.xizong.evidence.forecast_progress;
assert.equal(xzForecast.schema,'kianos.xizong.forecast-progress.v1');
assert.equal(xzForecast.forecast_role,'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(xzForecast.gate_workload_authority,false);
assert.equal(xzForecast.canonical_scope.systems,systems.length);
assert.equal(
  xzForecast.canonical_scope.blocks,
  systems.reduce((sum,row)=>sum+row.blocks.length,0)
);
assert.equal(
  xzForecast.canonical_scope.canonical_kp,
  systems.reduce((sum,row)=>sum+row.blocks.reduce((s,b)=>s+Number(b.kpCount||0),0),0)
);
assert.equal(xzForecast.canonical_scope.block_weights.length,xzForecast.canonical_scope.blocks);
assert.ok(xzForecast.canonical_scope.logic_groups>0);
assert.ok(xzForecast.runtime_evidence.observed_blocks>=1);
assert.ok(xzForecast.runtime_evidence.completed_blocks>=1);
assert.equal(
  xzForecast.runtime_evidence.completed_blocks_detail.find((row)=>row.block_id===block.blockId)?.study_day,
  '2026-09-20'
);
assert.equal(xzForecast.practice_evidence.first_pass.attempted_questions,2);
assert.equal(xzForecast.practice_evidence.first_pass.stable,1);
assert.equal(xzForecast.practice_evidence.first_pass.wrong,1);
assert.equal(xzForecast.practice_evidence.first_pass.wrong_or_uncertain,1);
assert.equal(xzForecast.practice_evidence.first_pass.wrong_or_uncertain_rate,0.5);
assert.equal(xzForecast.repair_evidence.schema,'kianos.xizong.repair-forecast-evidence.v1');
assert.equal(xzForecast.repair_evidence.total_repair_clusters,2);
assert.equal(xzForecast.repair_evidence.active_repair_clusters,1);
assert.equal(xzForecast.repair_evidence.completed_repair_clusters,1);
assert.equal(xzForecast.repair_evidence.question_backed_clusters,2);
assert.equal(xzForecast.repair_evidence.unique_source_question_ids,3);
assert.equal(xzForecast.repair_evidence.observed_question_to_cluster_ratio,1.5);
assert.match(xzForecast.evidence_boundary,/does not prove unstudied/i);
assert.match(xzForecast.evidence_boundary,/exam\.subject-demand\.v1/);

assert.equal(packet.subjects.english.evidence.schema,'kianos.english.evidence.v1');
assert.equal(packet.subjects.english.evidence.resume.status,'ready');
assert.equal(packet.subjects.english.evidence.resume.object_id,'reading-current-001');
assert.equal(packet.subjects.english.evidence.resume.task,'reading_a');
const enForecast=packet.subjects.english.evidence.forecast_progress;
assert.equal(enForecast.schema,'kianos.english.forecast-progress.v1');
assert.equal(enForecast.forecast_role,'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(enForecast.gate_workload_authority,false);
assert.equal(enForecast.scope,'CURRENT_EXPLICIT_SESSION_ONLY');
assert.equal(enForecast.status,'active');
assert.equal(enForecast.remaining_steps,1);
assert.equal(enForecast.remaining_by_task.reading_a,1);
assert.match(enForecast.evidence_boundary,/exam\.subject-demand\.v1/);

assert.equal(packet.subjects.politics.evidence.schema,'kianos.politics.study_packet.v1');
assert.equal(packet.subjects.politics.evidence.resume.title,pChapter.title);
const polForecast=packet.subjects.politics.evidence.forecast_progress;
assert.equal(polForecast.schema,'kianos.politics.forecast-progress.v1');
assert.equal(polForecast.forecast_role,'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(polForecast.gate_workload_authority,false);
assert.equal(polForecast.scope,'FIRST_ROUND_CURRENT_CATALOG_PROGRESS_ONLY');
assert.equal(polForecast.catalog_units,politics.units.length);
assert.match(polForecast.evidence_boundary,/exam\.subject-demand\.v1/);
const polMemoryProfile=packet.subjects.politics.evidence.memory?.history_profile;
assert.equal(polMemoryProfile?.schema,'kianos.politics.memory-history-profile.v1',
  'private relay must preserve landed cross-day Politics Memory profile');
assert.equal(polMemoryProfile.unstable_recent.some(row=>row.candidate_id===memoryCandidate.id),true,
  'yesterday FORGOT must survive into private Daily Packet');

assert.equal(packet.schedule.phase.id,'A');
assert.equal(packet.subjects.xizong.plan.role,'主推');
assert.equal(result.source_checkpoint_id,'daily-packet-proof');


const isolatedCheckpoint=structuredClone(checkpoint);
isolatedCheckpoint.payload.subjects.lexical={schema:'broken.lexical',entries:{bad:'{'}};
isolatedCheckpoint.payload.subjects.politics={
  schema:'kianos.politics.private-payload.v1',
  entries:{'not-a-politics-key':JSON.stringify({bad:true})}
};
const isolated=buildDailyLearningPacketFromPrivateCheckpoint(isolatedCheckpoint,{now});
assert.equal(isolated.packet.subjects.xizong.evidence.schema,'kianos.xizong.study_packet.v3');
assert.equal(isolated.packet.subjects.english.evidence.schema,'kianos.english.evidence.v1');
assert.equal(isolated.packet.subjects.politics.evidence,null,
  'bad Politics checkpoint must degrade Politics to unknown without blocking other subjects');
assert.ok(isolated.warnings.some(row=>row.startsWith('checkpoint:politics:')));
assert.ok(!isolated.warnings.some(row=>row.startsWith('checkpoint:lexical:')),
  'Lexical is outside the exam packet and must not participate in reconstruction');

console.log('PASS private checkpoint -> one Daily Learning Packet: day-isolated time + subject-contained Resume/evidence');
