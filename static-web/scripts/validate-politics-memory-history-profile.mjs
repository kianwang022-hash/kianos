import assert from 'node:assert/strict';
import {
  POLITICS_MEMORY_EVIDENCE_KEY,
  POLITICS_MEMORY_PROFILE_SCHEMA,
  buildPoliticsMemoryHistoryProfile,
  politicsMemoryDailyEvidence
} from '../src/lib/politicsMemoryRuntime.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries).map(([k,v])=>[String(k),String(v)]));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const day='2026-09-20';
const now=Date.parse('2026-09-20T04:00:00.000Z');

const candidates=Array.from({length:160},(_,i)=>({
  id:`polmem-${String(i).padStart(3,'0')}`,
  subject:i%5===0?'history':i%5===1?'marxism':i%5===2?'mao':i%5===3?'xi':'ethics-law',
  chapter_id:`c${String((i%10)+1).padStart(2,'0')}`,
  chapter_title:'fixture chapter',
  natural_unit_id:`nu-${i}`,
  family:i%2===0?'PRECISION':'BOUNDARY',
  prompt:`fixture prompt ${i}`,
  answer_items:[`answer ${i}a`,`answer ${i}b`],
  source_refs:[`SRC-${i}-B`,`SRC-${i}-A`],
  source_role:'CURRENT_LEARNING_CONTENT',
  admission:'CANDIDATE_ONLY'
}));
const memoryCatalog={
  schema:'kianos.politics.memory-candidate-catalog.v1',
  revision:'memory-current-rev',
  candidates
};

const snapshot=(candidate)=>({
  id:candidate.id,
  subject:candidate.subject,
  chapter_id:candidate.chapter_id,
  natural_unit_id:candidate.natural_unit_id,
  family:candidate.family,
  prompt:candidate.prompt,
  answer_items:[...candidate.answer_items],
  source_refs:[...candidate.source_refs],
  source_role:candidate.source_role
});

const events=[];
let serial=0;
for(let round=0;round<60;round+=1){
  for(let i=0;i<candidates.length;i+=1){
    serial+=1;
    const candidate=candidates[i];
    const latestClass=i<120
      ? (i%2===0?'FORGOT':'FUZZY')
      : 'STABLE';
    const response=round===59
      ? latestClass
      : ((round+i)%5===0?'FORGOT':(round+i)%3===0?'FUZZY':'STABLE');
    const observed=new Date(Date.parse('2026-07-01T00:00:00Z')+(round*160+i)*60000).toISOString();
    events.push({
      schema:'kianos.politics.memory-recall-event.v1',
      event_id:`event-${serial}`,
      plan_id:`plan-${round}`,
      study_day:observed.slice(0,10),
      candidate_id:candidate.id,
      // Old global revision must not invalidate unchanged exact candidate truth.
      catalog_revision:round<30?'memory-old-rev':'memory-current-rev',
      candidate_snapshot:snapshot(candidate),
      response,
      observed_at:observed
    });
  }
}

// Add one exact old-revision event yesterday so cross-day continuity is explicit.
events.push({
  schema:'kianos.politics.memory-recall-event.v1',
  event_id:'yesterday-forgot',
  plan_id:'plan-yesterday',
  study_day:'2026-09-19',
  candidate_id:'polmem-000',
  catalog_revision:'memory-old-rev',
  candidate_snapshot:snapshot(candidates[0]),
  response:'FORGOT',
  observed_at:'2026-09-19T10:00:00.000Z'
});

// Same id but changed source-grounded content must fail Current compatibility.
events.push({
  schema:'kianos.politics.memory-recall-event.v1',
  event_id:'changed-candidate',
  plan_id:'plan-old',
  study_day:'2026-09-18',
  candidate_id:'polmem-001',
  catalog_revision:'memory-old-rev',
  candidate_snapshot:{
    ...snapshot(candidates[1]),
    prompt:'old prompt that no longer matches Current'
  },
  response:'FORGOT',
  observed_at:'2026-09-18T10:00:00.000Z'
});

// Missing Current candidate stays historical only.
events.push({
  schema:'kianos.politics.memory-recall-event.v1',
  event_id:'missing-candidate',
  plan_id:'plan-old',
  study_day:'2026-09-18',
  candidate_id:'polmem-retired',
  catalog_revision:'memory-old-rev',
  candidate_snapshot:{
    id:'polmem-retired',
    subject:'history',
    chapter_id:'c99',
    natural_unit_id:'retired-nu',
    family:'PRECISION',
    prompt:'retired',
    answer_items:['retired answer'],
    source_refs:['SRC-RETIRED'],
    source_role:'CURRENT_LEARNING_CONTENT'
  },
  response:'FUZZY',
  observed_at:'2026-09-18T11:00:00.000Z'
});

const profile=buildPoliticsMemoryHistoryProfile(events,memoryCatalog,{
  now,
  unstableLimit:10,
  stableLimit:5,
  recentEventLimit:12
});

assert.equal(profile.schema,POLITICS_MEMORY_PROFILE_SCHEMA);
assert.match(profile.semantics,/CHAT_OWNS_SCHEDULING/);
assert.match(profile.semantics,/NO_FIXED_CADENCE/);
assert.equal(profile.summary.catalog_candidate_count,160);
assert.equal(profile.summary.current_candidates_with_evidence,160);
assert.ok(profile.summary.current_compatible_events>9500,'large history unexpectedly lost');
assert.equal(profile.summary.stale_or_changed_events,2,'changed/missing evidence must fail Current compatibility');
assert.equal(profile.stale_or_changed.candidate_changed_count,1);
assert.equal(profile.stale_or_changed.candidate_missing_count,1);
assert.equal(profile.unstable_recent.length,5,'recent unstable sample cap failed');
assert.equal(profile.unstable_oldest.length,5,'oldest unstable sample cap failed');
assert.ok(profile.unstable_overflow>0,'unstable overflow not surfaced');
assert.ok(profile.unstable_total>10,'unstable total missing');
assert.equal(profile.oldest_stable_sample.length,5,'stable sample cap failed');
assert.ok(profile.oldest_stable_overflow>0,'stable overflow not surfaced');
assert.equal(profile.recent_events.length,12,'recent event cap failed');

const zero=profile.unstable_recent.find(row=>row.candidate_id==='polmem-000');
assert.ok(zero,'yesterday forgotten candidate disappeared across day boundary');
assert.equal(zero.latest_response,'FORGOT');
assert.equal(zero.latest_observed_at,'2026-09-19T10:00:00.000Z');
assert.equal(zero.latest_study_day,'2026-09-19');
assert.equal(zero.study_days_since_latest,1,'cross-day age must follow study-day boundary, not elapsed 24h');

const serialized=JSON.stringify(profile);
for(const forbidden of ['next_review','due_at','priority_score','mastery_score']){
  assert.equal(serialized.includes(forbidden),false,`profile invented scheduler/mastery field:${forbidden}`);
}
assert.ok(serialized.includes('PROFILE_DOES_NOT_CREATE_A_REVIEW_SCHEDULE'));
assert.ok(serialized.includes('STALE_OR_CHANGED_EVIDENCE_NEVER_AUTO_SELECTS_A_CURRENT_MEMORY_TASK'));

const storage=new MemoryStorage({
  [POLITICS_MEMORY_EVIDENCE_KEY]:JSON.stringify(events)
});
const daily=politicsMemoryDailyEvidence(storage,{day,now,catalog:memoryCatalog});
assert.equal(daily.study_day,day);
assert.equal(daily.summary.recall_count,0,'today should have no fabricated recall events');
assert.equal(daily.history_profile.schema,POLITICS_MEMORY_PROFILE_SCHEMA);
assert.equal(daily.history_profile.summary.current_candidates_with_evidence,160);
assert.equal(daily.history_profile.unstable_recent.some(row=>row.candidate_id==='polmem-000'),true,
  'cross-day forgotten candidate missing from Daily Memory profile');

const politicsCatalog={
  revision:'politics-practice-fixture',
  questions:[],
  chapters:[],
  units:[]
};
const home=buildHomeDailyLearningPacket({
  storage,
  day,
  now,
  plan:null,
  xizongPacketIndex:[],
  politicsCatalog,
  politicsMemoryCatalog:memoryCatalog,
  base:'/'
});
assert.equal(home.coverage.politics,'attached',
  'Politics packet must attach when cross-day Memory profile is the only learner evidence');
const politics=home.packet.subjects.politics.evidence;
assert.equal(politics.schema,'kianos.politics.study_packet.v1');
assert.equal(politics.today.attempted_count,0);
assert.equal(politics.memory.summary.recall_count,0);
assert.equal(politics.memory.history_profile.schema,POLITICS_MEMORY_PROFILE_SCHEMA);
assert.equal(politics.memory.history_profile.summary.current_candidates_with_evidence,160);

const packetBytes=Buffer.byteLength(JSON.stringify(home.packet),'utf8');
assert.ok(packetBytes<180000,`Daily Packet grew unexpectedly large:${packetBytes}`);

console.log(JSON.stringify({
  ok:true,
  schema:profile.schema,
  raw_events:events.length,
  current_compatible_events:profile.summary.current_compatible_events,
  stale_or_changed_events:profile.summary.stale_or_changed_events,
  current_candidates_with_evidence:profile.summary.current_candidates_with_evidence,
  unstable_recent_in_packet:profile.unstable_recent.length,
  unstable_oldest_in_packet:profile.unstable_oldest.length,
  unstable_total:profile.unstable_total,
  unstable_overflow:profile.unstable_overflow,
  stable_sample_in_packet:profile.oldest_stable_sample.length,
  stable_overflow:profile.oldest_stable_overflow,
  recent_events:profile.recent_events.length,
  daily_packet_bytes:packetBytes,
  today_recall_count:daily.summary.recall_count,
  cross_day_memory_visible:true,
  fixed_scheduler:false
},null,2));
console.log('PASS Politics Architecture+ Memory profile: cross-day, Current-bound, bounded, no fixed cadence');
