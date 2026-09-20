import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';
import { buildPoliticsMemoryHistoryProfile } from '../src/lib/politicsMemoryRuntime.mjs';

const OUT = path.resolve(process.cwd(), '../politics-memory-scale-audit');
fs.mkdirSync(OUT, { recursive: true });

const enc = new TextEncoder();
const bytes = (value) => enc.encode(typeof value === 'string' ? value : JSON.stringify(value)).length;
const percentile = (rows, p) => {
  if (!rows.length) return 0;
  const sorted = [...rows].sort((a,b)=>a-b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
};
const candidateSnapshot = (candidate) => ({
  id: candidate.id,
  subject: candidate.subject,
  chapter_id: candidate.chapter_id,
  natural_unit_id: candidate.natural_unit_id || null,
  family: candidate.family,
  prompt: candidate.prompt,
  answer_items: candidate.answer_items || [],
  source_refs: candidate.source_refs || [],
  source_role: candidate.source_role
});
const eventFor = (catalog, candidate, index, studyDay, response='FUZZY') => ({
  schema: 'kianos.politics.memory-recall-event.v1',
  event_id: `scale-plan-${studyDay}:${candidate.id}:${index}`,
  plan_id: `scale-plan-${studyDay}`,
  study_day: studyDay,
  candidate_id: candidate.id,
  catalog_revision: catalog.revision,
  candidate_snapshot: candidateSnapshot(candidate),
  response,
  observed_at: `${studyDay}T12:00:00.000Z`
});

const catalog = buildPoliticsMemoryCandidateCatalogCurrent();
if (!catalog?.revision || !Array.isArray(catalog.candidates) || !catalog.candidates.length) {
  throw new Error('POLITICS_MEMORY_SCALE_CATALOG_EMPTY');
}

const sampleEvents = catalog.candidates.map((candidate,index)=>
  eventFor(catalog,candidate,index,'2026-09-20',index%3===0?'FORGOT':index%3===1?'FUZZY':'STABLE')
);
const eventSizes = sampleEvents.map(bytes);
const snapshotSizes = catalog.candidates.map((candidate)=>bytes(candidateSnapshot(candidate)));

function dayString(offset) {
  return new Date(Date.parse('2026-09-21T00:00:00Z') + offset * 86400000).toISOString().slice(0,10);
}

function scenario(perDay, days=91) {
  const events=[];
  let serial=0;
  for(let day=0;day<days;day+=1){
    const studyDay=dayString(day);
    for(let j=0;j<perDay;j+=1){
      const candidate=catalog.candidates[serial % catalog.candidates.length];
      const response=(serial+day)%7===0?'FORGOT':(serial+day)%3===0?'FUZZY':'STABLE';
      events.push(eventFor(catalog,candidate,serial,studyDay,response));
      serial+=1;
    }
  }
  const json=JSON.stringify(events);
  const runs=[];
  let result=null;
  for(let i=0;i<6;i+=1){
    const t0=performance.now();
    result=buildPoliticsMemoryHistoryProfile(events,catalog,{
      now:Date.parse('2026-12-20T12:00:00Z'),
      currentDay:'2026-12-20'
    });
    const ms=performance.now()-t0;
    if(i>0) runs.push(ms);
  }
  runs.sort((a,b)=>a-b);
  const medianMs=runs[Math.floor(runs.length/2)] || 0;
  return {
    events:events.length,
    raw_evidence_json_bytes:bytes(json),
    raw_evidence_mib:Number((bytes(json)/(1024*1024)).toFixed(3)),
    per_event_average_bytes:Number((bytes(json)/Math.max(1,events.length)).toFixed(1)),
    profile_json_bytes:bytes(result),
    profile_kib:Number((bytes(result)/1024).toFixed(1)),
    profile_build_median_ms:Number(medianMs.toFixed(2)),
    profile_summary:result.summary,
    unstable_total:result.unstable_total,
    unstable_included:result.unstable_included,
    unstable_overflow:result.unstable_overflow
  };
}

const scenarios={};
for(const perDay of [10,20,40,60,100]) scenarios[`${perDay}_per_day`]=scenario(perDay);

const report={
  schema:'politics-memory-storage-scale-audit.v1',
  note:'Diagnostic only. Browser storage quotas vary by browser/origin/device; this report measures KianOS byte growth and computation, not a universal quota.',
  head_context:'current branch candidate',
  catalog:{
    revision:catalog.revision,
    candidate_count:catalog.candidates.length,
    candidate_snapshot_bytes:{
      min:Math.min(...snapshotSizes),
      median:percentile(snapshotSizes,.5),
      p95:percentile(snapshotSizes,.95),
      max:Math.max(...snapshotSizes),
      average:Number((snapshotSizes.reduce((a,b)=>a+b,0)/snapshotSizes.length).toFixed(1))
    },
    recall_event_bytes:{
      min:Math.min(...eventSizes),
      median:percentile(eventSizes,.5),
      p95:percentile(eventSizes,.95),
      max:Math.max(...eventSizes),
      average:Number((eventSizes.reduce((a,b)=>a+b,0)/eventSizes.length).toFixed(1))
    }
  },
  exam_horizon_days:91,
  scenarios,
  interpretation_guardrails:[
    'DO_NOT_ASSUME_A_UNIVERSAL_LOCALSTORAGE_QUOTA',
    'DO_NOT_CHANGE_STORAGE_ARCHITECTURE_UNLESS_MEASURED_GROWTH_IS_MATERIAL',
    'RAW_RECALL_HISTORY_IS_LEARNER_TRUTH_AND_MUST_NOT_BE_SILENTLY_DROPPED',
    'ANY_COMPACTION_MUST_PRESERVE_EXACT_EVENT_PROVENANCE_OR_PROVIDE_A_SEPARATE_VERIFIABLE_ARCHIVE'
  ]
};

fs.writeFileSync(path.join(OUT,'politics-memory-storage-scale.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
