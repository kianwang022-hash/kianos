import assert from 'node:assert/strict';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import {
  STUDY_TIMER_LEDGER_KEY,
  STUDY_TIMER_SCHEMA,
  STUDY_TIMER_STATE_KEY
} from '../src/lib/studyTimer.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.get(k)??null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

const day='2026-09-20';
const now=Date.parse('2026-09-20T03:00:00+08:00');
const objectId='external-chat-2026-09-20-scope-001';
const sourceHash='generated-content-hash-1';

const storage=new MemoryStorage({
  [STUDY_TIMER_STATE_KEY]:JSON.stringify({
    schema:STUDY_TIMER_SCHEMA,
    running:false,
    manualPaused:true,
    subject:'english',
    context:{subject:'english',route:'external-reading/',detailKey:objectId,detailLabel:'Generated scope drill'},
    segmentStartedAt:null,
    lastSeenAt:now,
    revision:1,
    updatedAt:now
  }),
  [STUDY_TIMER_LEDGER_KEY]:JSON.stringify({
    schema:STUDY_TIMER_SCHEMA,
    sessions:[{
      id:'english-generated-1',
      subject:'english',
      context:{subject:'english',route:'external-reading/',detailKey:objectId,detailLabel:'Generated scope drill'},
      startedAt:now-12*60*1000,
      endedAt:now,
      source:'timer'
    }]
  }),
  ['kianos-english-external-reading-last-location-v1']:JSON.stringify({
    id:objectId,
    title:'Generated scope drill',
    href:'/external-reading/?id='+objectId,
    sourceHash,
    updatedAt:'2026-09-20T02:59:00+08:00'
  }),
  ['kianos-english-external-reading-attempt-v1:'+objectId]:JSON.stringify({
    binding:{
      task:'external_reading',
      object_id:objectId,
      source_hash:sourceHash,
      attempt_id:'attempt-generated-1',
      prior_exposure:'unknown',
      assistance:'unassisted',
      source_snapshot:{
        source_family:'CHAT_GENERATED',
        source_format:'CHAT_GENERATED',
        collection:'Chat Drills',
        title:'Generated scope drill',
        question_origin:'CHAT_GENERATED',
        drill_origin:'CHAT_GENERATED_SYNTHETIC',
        completion_requirement:'QUESTIONS_SUBMITTED',
        training_target:{
          kind:'reading_scope_transfer',
          note:'Changed-context test after scope/modality discussion.'
        }
      }
    },
    submitted:true,
    submittedAt:'2026-09-20T02:58:00+08:00',
    stage:'submitted',
    answers:{q1:'B'},
    uncertain:['q2'],
    results:{q1:'correct',q2:'wrong'}
  })
});

const result=buildHomeDailyLearningPacket({
  storage,
  day,
  now,
  plan:null,
  xizongPacketIndex:[],
  politicsCatalog:null,
  base:'/'
});

assert.equal(result.coverage.english,'attached');
assert.equal(result.packet.subjects.english.time.minutes,12);
const evidence=result.packet.subjects.english.evidence;
assert.equal(evidence.schema,'kianos.english.evidence.v1');
assert.equal(evidence.tasks.external_reading.last_object.id,objectId);
assert.equal(evidence.tasks.external_reading.attempt.submitted,true);
assert.equal(evidence.tasks.external_reading.attempt.problem_count,1,'one wrong+uncertain item counts as one problem, not two');
assert.equal(evidence.tasks.external_reading.attempt.uncertain_count,1);
assert.deepEqual(evidence.tasks.external_reading.attempt.generated_drill,{
  question_origin:'CHAT_GENERATED',
  drill_origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{
    kind:'reading_scope_transfer',
    note:'Changed-context test after scope/modality discussion.'
  }
});

console.log('PASS generated English drill facts survive into the Home Daily Learning Packet for Chat interpretation');
