import assert from 'node:assert/strict';
import { buildEnglishEvidencePacket,buildEnglishChatHandoffText,ENGLISH_SESSION_KEY,inspectEnglishSessionSourceContinuation,advanceEnglishSessionSourceRevision,writeEnglishSessionInstruction } from '../src/lib/englishSessionControl.mjs';
import { recordEnglishReadingLookup,saveEnglishAttempt } from '../src/lib/englishLearnerEvidence.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const day='2026-09-20';
// Synthetic Current owner identities: an empty catalogue cannot authorize Resume.
const catalog=[
  {task:'reading_a',object_id:'reading-done',source_hash:'hash-reading-done',semantic_source_hash:'synthetic-reading-v1'},
  {task:'translation',object_id:'translation-next',source_hash:'hash-translation-next',semantic_source_hash:'synthetic-translation-v1'}
];
const storage=new MemoryStorage({
  'kianos-english-session-instruction-v1':JSON.stringify({
    schema:'kianos.english.session-instruction.v1',
    session_id:'english-resume-proof',
    study_day:day,
    generated_at:'2026-09-20T00:00:00.000Z',
    current_step:0,
    steps:[
      {
        step_id:'r1',
        task:'reading_a',
        object_id:'reading-done',
        source_hash:'hash-reading-done',
        label:'Reading done',
        note:'first'
      },
      {
        step_id:'t1',
        task:'translation',
        object_id:'translation-next',
        source_hash:'hash-translation-next',
        label:'Translation next',
        note:'second'
      }
    ],
    return_policy:{on_finish:'english_home'}
  }),
  'kianos-reading-attempt-v1:reading-done':JSON.stringify({
    binding:{
      task:'reading_a',object_id:'reading-done',attempt_id:'synthetic-reading-attempt',revision:1,
      source_hash:'hash-reading-done',semantic_source_hash:'synthetic-reading-v1',
      prior_exposure:'unknown',assistance:'unknown',source_kind:'synthetic',
      source_snapshot:{paragraphs:['Synthetic Resume regression passage.'],questions:[{id:'q1'}]}
    },
    submitted:false,
    submittedAt:'',
    answers:{},
    results:{},
    uncertain:[],
    reviewResolved:false
  }),
  'kianos-reading-last-location-v1':JSON.stringify({
    id:'reading-done',
    title:'Reading done',
    href:'/reading/reading-done/',
    updatedAt:'2026-09-20T00:20:00.000Z'
  })
});

const lookupAt=Date.parse('2026-09-20T00:10:00.000Z');
const lookup=recordEnglishReadingLookup(storage,'reading-done',{
  token:'volatile',
  source_context:'Synthetic Resume regression passage with a volatile signal.',
  source_locator:'block:1',
  focused_question_id:'q1'
},lookupAt);
assert.equal(lookup.token,'volatile');
assert.equal(lookup.focused_question_id,'q1');
assert.equal(lookup.attempt_phase,'PRE_SUBMIT');
let lookupAttempt=JSON.parse(storage.getItem('kianos-reading-attempt-v1:reading-done'));
assert.equal(lookupAttempt.binding.assistance,'assisted');
assert.equal(lookupAttempt.lookupEvents.length,1);

// A later submit from a stale page-local object must not erase passive lookup facts.
const stalePageState={
  ...lookupAttempt,
  lookupEvents:[],
  submitted:true,
  submittedAt:'2026-09-20T00:20:00.000Z',
  answers:{q1:'A'},
  results:{q1:'correct'},
  reviewResolved:true
};
saveEnglishAttempt(storage,'kianos-reading-attempt-v1:reading-done',stalePageState,{
  task:'reading_a',
  object_id:'reading-done',
  source_hash:'hash-reading-done',
  semantic_source_hash:'synthetic-reading-v1',
  snapshot:lookupAttempt.binding.source_snapshot
},{now:Date.parse('2026-09-20T00:11:00.000Z')});
lookupAttempt=JSON.parse(storage.getItem('kianos-reading-attempt-v1:reading-done'));
assert.equal(lookupAttempt.lookupEvents.length,1,'stale Reading save erased passive lookup');
assert.equal(lookupAttempt.binding.assistance,'assisted','stale Reading save downgraded assistance');
assert.equal(lookupAttempt.firstEvidenceMeta.assistance,'assisted','pre-submit lookup did not qualify first evidence');

// Review-time lookup is preserved without retroactively contaminating a clean first attempt.
const postStorage=new MemoryStorage({
  'kianos-reading-attempt-v1:post-review':JSON.stringify({
    binding:{
      task:'reading_a',object_id:'post-review',attempt_id:'post-review-attempt',revision:1,
      source_hash:'post-source',semantic_source_hash:'post-semantic',
      prior_exposure:'unseen',assistance:'unassisted',source_kind:'official',
      source_snapshot:{paragraphs:['Post-submit review passage.'],questions:[{id:'q1'}]}
    },
    submitted:true,
    submittedAt:'2026-09-20T00:05:00.000Z',
    answers:{q1:'A'},
    results:{q1:'correct'},
    uncertain:[],
    firstEvidenceMeta:{attempt_id:'post-review-attempt',source_hash:'post-source',prior_exposure:'unseen',assistance:'unassisted',independent_transfer_candidate:true}
  })
});
const postLookup=recordEnglishReadingLookup(postStorage,'post-review',{token:'afterward',focused_question_id:'q1'},Date.parse('2026-09-20T00:06:00.000Z'));
assert.equal(postLookup.attempt_phase,'POST_SUBMIT_REVIEW');
const postAttempt=JSON.parse(postStorage.getItem('kianos-reading-attempt-v1:post-review'));
assert.equal(postAttempt.binding.assistance,'unassisted');
assert.equal(postAttempt.firstEvidenceMeta.assistance,'unassisted');
assert.equal(postStorage.getItem('kianos-english-material-exposure-v1'),null);

storage.setItem('kianos-reading-watch-signals-v1',JSON.stringify({
  version:1,
  signals:[
    {
      signalId:'reading-done:q1',
      passageId:'reading-done',
      questionId:'q1',
      family:'JUDGE',
      subtypeCodes:['TOO_STRONG'],
      questionTask:'detail adjudication',
      quickCause:'选项没辨清',
      status:'WATCH',
      attemptId:lookupAttempt.binding.attempt_id,
      sourceHash:lookupAttempt.binding.source_hash,
      sourceSubmittedAt:'2026-09-20T00:20:00.000Z',
      reviewedAt:'2026-09-20T00:25:00.000Z'
    },
    {
      signalId:'stale:q1',
      passageId:'reading-done',
      questionId:'q1',
      family:'LOCATE',
      subtypeCodes:[],
      questionTask:'stale fixture',
      quickCause:'没定位准',
      status:'WATCH',
      attemptId:'different-attempt',
      sourceHash:'different-source',
      sourceSubmittedAt:'2026-09-19T00:20:00.000Z',
      reviewedAt:'2026-09-19T00:25:00.000Z'
    }
  ]
}));

const packet=buildEnglishEvidencePacket(storage,{
  day,
  now:Date.parse('2026-09-20T00:30:00.000Z'),
  catalog
});

const unverified=buildEnglishEvidencePacket(storage,{day,catalog:[]});
assert.equal(unverified.resume.status,'source_unverified');
assert.equal(unverified.resume.executable,false);
assert.equal(unverified.resume.href,null);

assert.equal(packet.schema,'kianos.english.evidence.v1');
assert.equal(packet.resume.status,'ready');
assert.equal(packet.resume.task,'translation');
assert.equal(packet.resume.object_id,'translation-next');
assert.equal(packet.resume.step_index,1);
assert.equal(packet.resume.step_count,2);
assert.equal(packet.resume.href,'/translation/translation-next/');
assert.equal(packet.forecast_progress.schema,'kianos.english.forecast-progress.v1');
assert.equal(packet.forecast_progress.forecast_role,'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY');
assert.equal(packet.forecast_progress.gate_workload_authority,false);
assert.equal(packet.forecast_progress.scope,'CURRENT_EXPLICIT_SESSION_ONLY');
assert.equal(packet.forecast_progress.status,'active');
assert.equal(packet.forecast_progress.total_steps,2);
assert.equal(packet.forecast_progress.completed_steps,1);
assert.equal(packet.forecast_progress.remaining_steps,1);
assert.deepEqual(packet.forecast_progress.remaining_by_task,{translation:1});
assert.equal(packet.forecast_progress.remaining[0].object_id,'translation-next');
assert.match(packet.forecast_progress.evidence_boundary,/exam\.subject-demand\.v1/);
assert.ok(Array.isArray(packet.inventory)&&packet.inventory.some(row=>row.object_id==='reading-done'));
assert.equal(packet.reading_attribution.schema,'kianos.english.reading-attribution.v1');
assert.match(packet.reading_attribution.semantics,/NOT_DIAGNOSIS/);
assert.equal(packet.reading_attribution.lookup_events.length,1);
assert.equal(packet.reading_attribution.lookup_events[0].token,'volatile');
assert.equal(packet.reading_attribution.lookup_events[0].focused_question_id,'q1');
assert.equal(packet.reading_attribution.lookup_events[0].focused_question_semantics,'CONTEXT_ONLY_NOT_CAUSALITY');
assert.equal(packet.reading_attribution.lookup_events[0].attempt_phase,'PRE_SUBMIT');
assert.equal(packet.reading_attribution.reviewed_signals.length,1);
assert.equal(packet.reading_attribution.reviewed_signals[0].family,'JUDGE');
assert.deepEqual(packet.reading_attribution.reviewed_signals[0].subtype_codes,['TOO_STRONG']);
assert.equal(packet.reading_attribution.dropped_unbound_review_signals,1);
assert.ok(packet.reading_attribution.guardrails.includes('ATTRIBUTION_SLICE_CANNOT_CREATE_REVIEW_DEBT_OR_CONTRACT_PRACTICE'));
const chatHandoff=buildEnglishChatHandoffText(storage,{day,now:Date.parse('2026-09-20T00:30:00.000Z'),catalog});
assert.match(chatHandoff,/lookup proves assistance happened, not that the failure was lexical/i);
assert.match(chatHandoff,/first a binary confirmation/i);
assert.match(chatHandoff,/cannot by itself create review debt/i);

// Explicit same-object Source continuation uses the native archive and keeps the
// existing Chat order. The old declaration must not manufacture a fresh unseen.
const sourceStorage=new MemoryStorage(Object.fromEntries(storage.map));
// Keep the pre-existing Source-continuation fixture independent from the Reading
// attribution scenario above; that legacy regression intentionally starts with no exposure ledger.
sourceStorage.removeItem('kianos-english-material-exposure-v1');
const instruction=JSON.parse(sourceStorage.getItem(ENGLISH_SESSION_KEY));
instruction.steps[1].source_hash='old-translation-source';
instruction.steps[1].params={material_exposure:{state:'unseen',basis:'learner_statement',note:'Synthetic learner declaration for old source only',observed_at:'2026-09-20T00:00:00.000Z'}};
instruction.steps.push({...instruction.steps[1],step_id:'t2'});
sourceStorage.setItem(ENGLISH_SESSION_KEY,JSON.stringify(instruction));
const oldInstructionRaw=sourceStorage.getItem(ENGLISH_SESSION_KEY);
const attemptKey='kianos-translation-attempt-v2:translation-next';
const oldAttempt=JSON.stringify({stage:'draft',draft:'Synthetic old answer',binding:{task:'translation',object_id:'translation-next',source_hash:'old-translation-source',attempt_id:'source-revision-proof',revision:1}});
sourceStorage.setItem(attemptKey,oldAttempt);
const preview=inspectEnglishSessionSourceContinuation(sourceStorage,day,{catalog});
assert.equal(preview.status,'available');
const args={catalog,expectedInstructionRaw:preview.expectedInstructionRaw,expectedRaw:preview.expectedRaw,expectedSourceHash:preview.step.source_hash};
const before=Object.fromEntries(sourceStorage.map);
for(const badCatalog of [[],catalog.filter(row=>row.task!=='translation'),catalog.map(row=>row.task==='translation'?{...row,object_id:'replacement-object'}:row),catalog.map(row=>row.task==='translation'?{...row,source_hash:null}:row),[...catalog,catalog[1]]]){
  assert.equal(inspectEnglishSessionSourceContinuation(sourceStorage,day,{catalog:badCatalog}).status,'blocked');
  assert.throws(()=>advanceEnglishSessionSourceRevision(sourceStorage,day,{...args,catalog:badCatalog}));
  assert.deepEqual(Object.fromEntries(sourceStorage.map),before);
}
assert.throws(()=>advanceEnglishSessionSourceRevision(sourceStorage,day,{...args,expectedRaw:'stale'}),/CONTINUATION_STALE/);
const normalSet=sourceStorage.setItem.bind(sourceStorage);let rejectOnce=true;
sourceStorage.setItem=(key,value)=>{if(key===ENGLISH_SESSION_KEY&&rejectOnce){rejectOnce=false;throw new Error('synthetic quota failure');}normalSet(key,value);};
assert.throws(()=>advanceEnglishSessionSourceRevision(sourceStorage,day,args),/synthetic quota failure/);
assert.deepEqual(Object.fromEntries(sourceStorage.map),before,'archive and instruction roll back together');
sourceStorage.setItem=normalSet;
advanceEnglishSessionSourceRevision(sourceStorage,day,args);
assert.equal(sourceStorage.getItem(attemptKey),null);
assert.equal(sourceStorage.getItem('kianos-english-attempt-archive-v1:source-revision-proof'),oldAttempt);
assert.equal(sourceStorage.getItem('kianos-english-material-exposure-v1'),null);
const advanced=JSON.parse(sourceStorage.getItem(ENGLISH_SESSION_KEY));
assert.equal(advanced.session_id,instruction.session_id);
assert.equal(advanced.steps[0].source_hash,instruction.steps[0].source_hash);
assert.ok(advanced.steps.slice(1).every(step=>step.source_hash===catalog[1].source_hash&&!step.params.material_exposure));
assert.equal(buildEnglishEvidencePacket(sourceStorage,{day,catalog}).resume.status,'ready');
assert.throws(()=>writeEnglishSessionInstruction(sourceStorage,oldInstructionRaw,day,{catalog}),/SOURCE_REVISION_MISMATCH/);
assert.throws(()=>advanceEnglishSessionSourceRevision(sourceStorage,day,args));
assert.equal(sourceStorage.getItem('kianos-english-attempt-archive-v1:source-revision-proof'),oldAttempt);

// A later object's revision stays pending rather than forcing a Chat round-trip
// or silently updating its Source before the learner reaches it.
const laterCatalog=[...catalog,{task:'writing',object_id:'writing-later',source_hash:'current-writing-source'}];
advanced.steps.push({step_id:'w1',task:'writing',object_id:'writing-later',source_hash:'old-writing-source'});
sourceStorage.setItem(ENGLISH_SESSION_KEY,JSON.stringify(advanced));
const currentPacket=buildEnglishEvidencePacket(sourceStorage,{day,catalog:laterCatalog});
assert.equal(currentPacket.resume.status,'ready');
assert.equal(currentPacket.resume.object_id,'translation-next');
assert.equal(currentPacket.resume.pending_source_changes.object_id,'writing-later');
assert.equal(currentPacket.forecast_progress.status,'stale_source');
assert.equal(currentPacket.forecast_progress.remaining_steps,null);
assert.deepEqual(currentPacket.forecast_progress.remaining,[]);
assert.equal(JSON.parse(sourceStorage.getItem(ENGLISH_SESSION_KEY)).steps.at(-1).source_hash,'old-writing-source');
sourceStorage.setItem(attemptKey,JSON.stringify({stage:'passed',binding:{task:'translation',object_id:'translation-next',source_hash:catalog[1].source_hash,attempt_id:'new-translation-attempt'}}));
const later=inspectEnglishSessionSourceContinuation(sourceStorage,day,{catalog:laterCatalog});
assert.equal(later.status,'available');
assert.equal(later.step.object_id,'writing-later');
advanceEnglishSessionSourceRevision(sourceStorage,day,{catalog:laterCatalog,expectedRaw:later.expectedRaw,expectedInstructionRaw:later.expectedInstructionRaw,expectedSourceHash:later.step.source_hash});
assert.equal(buildEnglishEvidencePacket(sourceStorage,{day,catalog:laterCatalog}).resume.object_id,'writing-later');

console.log('PASS English Resume completion and atomic same-object Source continuation; unknown/replacement Source and stale replay rejected, old history preserved');
