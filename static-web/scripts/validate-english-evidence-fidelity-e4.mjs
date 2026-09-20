import assert from 'node:assert/strict';
import {
  saveEnglishAttempt,
  archiveEnglishAttempt
} from '../src/lib/englishLearnerEvidence.mjs';
import {
  ENGLISH_SESSION_KEY,
  validateEnglishSessionInstruction,
  writeEnglishSessionInstruction,
  buildEnglishEvidencePacket,
  buildEnglishLongHorizonRecurrenceDigest
} from '../src/lib/englishSessionControl.mjs';
import {
  ENGLISH_EXAM_SESSION_SCHEMA,
  ENGLISH_EXAM_ANSWER_SCHEMA,
  englishExamPayload,
  summarizeEnglishExamSession,
  releaseEnglishExamObjective,
  startEnglishExamSession,
  buildEnglishExamEvidencePacket
} from '../src/lib/englishExamSession.mjs';
import {
  listEnglishExamPapers,
  loadEnglishExamPaper
} from '../src/lib/englishExamPaper.mjs';

class MemoryStorage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(String(k),String(v));}
  removeItem(k){this.map.delete(String(k));}
}

const now=Date.parse('2026-09-21T12:00:00.000Z');
const day='2026-09-21';

// 1) Chat-context assistance must survive into immutable first evidence.
const storage=new MemoryStorage();
const instruction=validateEnglishSessionInstruction({
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-assistance',
  study_day:day,
  generated_at:'2026-09-21T11:59:00.000Z',
  current_step:0,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'same-source-a',
    source_hash:'exact-revision-a',
    label:'E4 assisted fixture',
    params:{
      time_budget_seconds:1200,
      assistance_context:{
        state:'assisted',
        basis:'chat_context',
        observed_at:'2026-09-21T11:58:00.000Z',
        note:'Chat already explained the exact target mechanism before assignment.'
      }
    }
  }],
  return_policy:{on_finish:'english_home'}
},day);
storage.setItem(ENGLISH_SESSION_KEY,JSON.stringify(instruction));

const metaA={
  task:'reading_a',
  object_id:'same-source-a',
  source_hash:'exact-revision-a',
  semantic_source_hash:'shared-semantic-source',
  snapshot:{evidence:{source_kind:'synthetic',evidence_role:'TRANSFER',semantic_source_hash:'shared-semantic-source'}}
};
const valueA={submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]};
saveEnglishAttempt(storage,'kianos-reading-attempt-v1:same-source-a',valueA,metaA,{now});
assert.equal(valueA.binding.assistance,'assisted');
assert.equal(valueA.binding.assistance_context?.basis,'chat_context');
assert.equal(valueA.firstEvidenceMeta?.assistance,'assisted');
assert.equal(valueA.firstEvidenceMeta?.independent_transfer_candidate,false);
assert.equal(valueA.firstEvidenceMeta?.source_kind,'synthetic');
assert.equal(valueA.firstEvidenceMeta?.evidence_role,'TRANSFER');

// Invalid "unassisted declaration" must not let Chat manufacture cleanliness.
assert.throws(()=>validateEnglishSessionInstruction({
  schema:'kianos.english.session-instruction.v1',
  session_id:'bad-clean',
  study_day:day,
  generated_at:'2026-09-21T12:00:00.000Z',
  current_step:0,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'x',
    source_hash:'h',
    params:{assistance_context:{state:'unassisted',basis:'chat_context',observed_at:'2026-09-21T12:00:00.000Z',note:'force clean'}}
  }]
},day),/ENGLISH_ASSISTANCE_DECLARATION_INVALID/);

// 2) Exact same rendered source under another object id must be exposed.
storage.removeItem(ENGLISH_SESSION_KEY);
const metaB={
  task:'reading_a',
  object_id:'same-source-b',
  source_hash:'exact-revision-b',
  semantic_source_hash:'shared-semantic-source',
  snapshot:{evidence:{source_kind:'synthetic',evidence_role:'CALIBRATION',semantic_source_hash:'shared-semantic-source'}}
};
const valueB={submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]};
saveEnglishAttempt(storage,'kianos-reading-attempt-v1:same-source-b',valueB,metaB,{now:now+60000});
assert.equal(valueB.binding.prior_exposure,'exposed','same learner-semantic source with a new exact revision/id was washed back to unseen/unknown');
assert.equal(valueB.firstEvidenceMeta?.independent_transfer_candidate,false);

// 2a) A stale explicit "unseen" declaration is revision-bound and must not leak into a materially new semantic revision.
const revisionStorage=new MemoryStorage();
const revisionKey='kianos-reading-attempt-v1:revision-same-object';
writeEnglishSessionInstruction(revisionStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-revision-a-unseen',
  study_day:day,
  generated_at:'2026-09-21T11:52:00.000Z',
  current_step:0,
  steps:[{
    step_id:'old-revision',
    task:'reading_a',
    object_id:'revision-same-object',
    source_hash:'revision-exact-a',
    params:{material_exposure:{
      state:'unseen',
      basis:'learner_statement',
      observed_at:'2026-09-21T11:51:00.000Z',
      note:'Learner has not seen revision A.'
    }}
  }]
},day,{catalog:[{
  task:'reading_a',
  object_id:'revision-same-object',
  source_hash:'revision-exact-a',
  semantic_source_hash:'revision-semantic-a'
}],now:Date.parse('2026-09-21T11:53:00.000Z')});
const oldRevision={submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]};
saveEnglishAttempt(revisionStorage,revisionKey,oldRevision,{
  task:'reading_a',
  object_id:'revision-same-object',
  source_hash:'revision-exact-a',
  semantic_source_hash:'revision-semantic-a',
  snapshot:{evidence:{source_kind:'official',evidence_role:null,semantic_source_hash:'revision-semantic-a'}}
},{now:now+70000});
assert.equal(oldRevision.binding.prior_exposure,'unseen','current revision lost its explicit unseen declaration');
assert.equal(oldRevision.firstEvidenceMeta?.independent_transfer_candidate,true,'clean current-revision declaration should remain eligible');
archiveEnglishAttempt(revisionStorage,revisionKey,now+80000);
revisionStorage.removeItem(ENGLISH_SESSION_KEY);
const newRevision={submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]};
saveEnglishAttempt(revisionStorage,revisionKey,newRevision,{
  task:'reading_a',
  object_id:'revision-same-object',
  source_hash:'revision-exact-b',
  semantic_source_hash:'revision-semantic-b',
  snapshot:{evidence:{source_kind:'official',evidence_role:null,semantic_source_hash:'revision-semantic-b'}}
},{now:now+90000});
assert.equal(newRevision.binding.prior_exposure,'unknown','stale revision-A unseen declaration leaked into materially new revision B');
assert.equal(newRevision.firstEvidenceMeta?.independent_transfer_candidate,false,'stale unseen declaration manufactured clean independent-transfer evidence');

// 2b) An explicit exposed learner declaration must keep exact-source identity even before opening.
const declaredStorage=new MemoryStorage();
const declaredCatalog=[{
  task:'reading_a',
  object_id:'declared-alias-a',
  source_hash:'declared-exact-a',
  semantic_source_hash:'declared-semantic',
  label:'Declared alias A'
}];
writeEnglishSessionInstruction(declaredStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-exposed-declaration',
  study_day:day,
  generated_at:'2026-09-21T11:50:00.000Z',
  current_step:0,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'declared-alias-a',
    source_hash:'declared-exact-a',
    params:{
      material_exposure:{
        state:'exposed',
        basis:'learner_statement',
        observed_at:'2026-09-21T11:49:00.000Z',
        note:'Learner states this exact material was seen before.'
      }
    }
  }]
},day,{catalog:declaredCatalog,now:Date.parse('2026-09-21T11:51:00.000Z')});
declaredStorage.removeItem(ENGLISH_SESSION_KEY);
const declaredAliasValue={submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]};
saveEnglishAttempt(declaredStorage,'kianos-reading-attempt-v1:declared-alias-b',declaredAliasValue,{
  task:'reading_a',
  object_id:'declared-alias-b',
  source_hash:'declared-exact-b',
  semantic_source_hash:'declared-semantic',
  snapshot:{evidence:{source_kind:'official',evidence_role:null,semantic_source_hash:'declared-semantic'}}
},{now:now+90000});
assert.equal(declaredAliasValue.binding.prior_exposure,'exposed','exposed declaration lost exact-source identity before open');
assert.equal(declaredAliasValue.firstEvidenceMeta?.independent_transfer_candidate,false);

// 2c) Once the system knows an exact source was exposed, a later "unseen" declaration must fail closed.
const declarationOnlyStorage=new MemoryStorage();
writeEnglishSessionInstruction(declarationOnlyStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-exposed-a',
  study_day:day,
  generated_at:'2026-09-21T11:40:00.000Z',
  current_step:0,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'declared-source-a',
    source_hash:'declared-source-exact-a',
    params:{material_exposure:{
      state:'exposed',
      basis:'learner_statement',
      observed_at:'2026-09-21T11:39:00.000Z',
      note:'Already seen.'
    }}
  }]
},day,{catalog:[{task:'reading_a',object_id:'declared-source-a',source_hash:'declared-source-exact-a',semantic_source_hash:'declared-source-semantic'}],now:Date.parse('2026-09-21T11:41:00.000Z')});
declarationOnlyStorage.removeItem(ENGLISH_SESSION_KEY);
assert.throws(()=>writeEnglishSessionInstruction(declarationOnlyStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-unseen-alias',
  study_day:day,
  generated_at:'2026-09-21T11:45:00.000Z',
  current_step:0,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'declared-source-b',
    source_hash:'declared-source-exact-b',
    params:{material_exposure:{
      state:'unseen',
      basis:'learner_statement',
      observed_at:'2026-09-21T11:44:00.000Z',
      note:'Conflicting later declaration.'
    }}
  }]
},day,{catalog:[{task:'reading_a',object_id:'declared-source-b',source_hash:'declared-source-exact-b',semantic_source_hash:'declared-source-semantic'}],now:Date.parse('2026-09-21T11:46:00.000Z')}),/ENGLISH_MATERIAL_ALREADY_EXPOSED/);

// 2d) A whole-paper exposed declaration must preserve child semantic identity across later child aliases.
const wholePaperDeclarationStorage=new MemoryStorage();
writeEnglishSessionInstruction(wholePaperDeclarationStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-whole-paper-exposed',
  study_day:day,
  generated_at:'2026-09-21T11:30:00.000Z',
  current_step:0,
  steps:[{
    step_id:'paper',
    task:'full_paper',
    object_id:'paper-a',
    source_hash:'paper-exact-a',
    params:{material_exposure:{
      state:'exposed',
      basis:'learner_statement',
      observed_at:'2026-09-21T11:29:00.000Z',
      note:'Learner states this whole paper was seen before.'
    }}
  }]
},day,{catalog:[{
  task:'full_paper',
  object_id:'paper-a',
  source_hash:'paper-exact-a',
  materials:[{
    object_id:'paper-child-a',
    source_hash:'child-exact-a',
    semantic_source_hash:'child-semantic'
  }]
}],now:Date.parse('2026-09-21T11:31:00.000Z')});
wholePaperDeclarationStorage.removeItem(ENGLISH_SESSION_KEY);
assert.throws(()=>writeEnglishSessionInstruction(wholePaperDeclarationStorage,{
  schema:'kianos.english.session-instruction.v1',
  session_id:'e4-whole-paper-child-alias',
  study_day:day,
  generated_at:'2026-09-21T11:35:00.000Z',
  current_step:0,
  steps:[{
    step_id:'child',
    task:'reading_a',
    object_id:'paper-child-b',
    source_hash:'child-exact-b',
    params:{material_exposure:{
      state:'unseen',
      basis:'learner_statement',
      observed_at:'2026-09-21T11:34:00.000Z',
      note:'Conflicting alias declaration.'
    }}
  }]
},day,{catalog:[{
  task:'reading_a',
  object_id:'paper-child-b',
  source_hash:'child-exact-b',
  semantic_source_hash:'child-semantic'
}],now:Date.parse('2026-09-21T11:36:00.000Z')}),/ENGLISH_MATERIAL_ALREADY_EXPOSED/);


// 3) Reuse existing durable ledgers for bounded long-horizon recurrence.
storage.setItem('kianos-english-objective-transfer-claims-v1',JSON.stringify({
  version:1,
  claims:[
    {claimId:'o-pending',task:'reading_a',statement:'Difficult inference still needs later transfer',status:'TRANSFER_PENDING',sourceObjectId:'r1',createdAt:'2026-09-01T00:00:00Z',updatedAt:'2026-09-18T00:00:00Z',history:[{decision:'REOPENED'}]},
    {claimId:'o-closed',task:'cloze',statement:'Candidate competition repaired',status:'CLOSED',sourceObjectId:'c1',createdAt:'2026-08-20T00:00:00Z',updatedAt:'2026-09-10T00:00:00Z',history:[{decision:'CLOSED'}]}
  ]
}));
storage.setItem('kianos-translation-transfer-v1',JSON.stringify({
  version:1,
  targets:[
    {id:'t-pending',label:'Preserve concessive relation',layer:'Relation / Information Preservation',skill:'concession',underlyingDemand:'Do not reverse concession',status:'pending',sourceTask:'tr1',lastSourceTask:'tr2',createdAt:'2026-09-05T00:00:00Z',evidence:[{relation:'contradict'}]},
    {id:'t-closed',label:'Reference attachment',underlyingDemand:'Resolve referent',status:'closed',sourceTask:'tr0',lastSourceTask:'tr3',createdAt:'2026-08-01T00:00:00Z',closedAt:'2026-09-15T00:00:00Z',evidence:[{relation:'support'}]}
  ]
}));
storage.setItem('kianos-writing-evidence-v1',JSON.stringify({
  version:1,
  schema:'kianos.english.writing-evidence.v1',
  targets:[
    {targetId:'w-pending',label:'Develop mechanism',underlyingDemand:'Add causal or operational link',status:'pending',originTaskId:'w1',admittedAt:'2026-09-02T00:00:00Z',events:[{verdict:'SUPPORT'}],updatedAt:'2026-09-19T00:00:00Z'},
    {targetId:'w-closed',label:'Register control',underlyingDemand:'Match audience',status:'closed',originTaskId:'w0',admittedAt:'2026-08-02T00:00:00Z',events:[{verdict:'CLOSE'}],closedAt:'2026-09-14T00:00:00Z',updatedAt:'2026-09-14T00:00:00Z'}
  ]
}));

const digest=buildEnglishLongHorizonRecurrenceDigest(storage,{recentExactTruncated:true,limitPerFamily:1});
assert.equal(digest.schema,'kianos.english.long-horizon-recurrence.v1');
assert.match(digest.semantics,/NOT_MASTERY/);
assert.equal(digest.recent_exact_window_truncated,true);
assert.equal(digest.objective.total,2);
assert.equal(digest.objective.pending,1);
assert.equal(digest.objective.included,1);
assert.equal(digest.objective.truncated,true);
assert.equal(digest.objective.targets[0].target_id,'o-pending');
assert.equal(digest.translation.targets[0].target_id,'t-pending');
assert.equal(digest.writing.targets[0].target_id,'w-pending');
assert.equal(digest.requires_deeper_review_if_decision_depends_on_missing_history,true);
assert.ok(digest.guardrails.includes('RECENT_EXACT_ABSENCE_IS_NOT_LONG_HORIZON_ABSENCE'));

const brokenLedgerStorage=new MemoryStorage({
  'kianos-english-objective-transfer-claims-v1':'{not-json'
});
const brokenDigest=buildEnglishLongHorizonRecurrenceDigest(brokenLedgerStorage,{recentExactTruncated:false});
assert.equal(brokenDigest.objective.status,'unreadable');
assert.equal(brokenDigest.requires_deeper_review_if_decision_depends_on_missing_history,true);

const packet=buildEnglishEvidencePacket(storage,{day,now:now+120000,catalog:[]});
assert.equal(packet.long_horizon_recurrence.schema,'kianos.english.long-horizon-recurrence.v1');
assert.equal(packet.long_horizon_recurrence.objective.pending,1);
assert.equal(packet.long_horizon_recurrence.translation.pending,1);
assert.equal(packet.long_horizon_recurrence.writing.pending,1);

// 4) Whole-paper section evidence context must survive sealing/release summaries.
const local={
  binding:{
    source_hash:'paper-step-hash',
    semantic_source_hash:'paper-semantic-hash',
    attempt_id:'paper-attempt-1',
    prior_exposure:'exposed',
    assistance:'assisted',
    source_kind:'official',
    evidence_role:null
  },
  firstEvidenceMeta:{
    source_hash:'paper-step-hash',
    semantic_source_hash:'paper-semantic-hash',
    attempt_id:'paper-attempt-1',
    prior_exposure:'exposed',
    assistance:'assisted',
    source_kind:'official',
    evidence_role:null,
    timing_status:'within_explicit_budget',
    independent_transfer_candidate:false
  },
  answers:{q1:'A'},
  uncertain:[],
  trajectory:{}
};
const payload=englishExamPayload('reading_a',local);
assert.equal(payload.prior_exposure,'exposed');
assert.equal(payload.assistance,'assisted');
assert.equal(payload.source_kind,'official');
assert.equal(payload.semantic_source_hash,'paper-semantic-hash');
assert.equal(payload.independent_transfer_candidate,false);

const started=Date.parse('2026-09-21T01:00:00.000Z');
const session={
  schema:ENGLISH_EXAM_SESSION_SCHEMA,
  session_id:'e4-paper',
  paper_id:'paper-e4',
  source_hash:'paper-hash',
  year:2026,
  status:'SEALED',
  revision:1,
  started_at:new Date(started).toISOString(),
  deadline_at:new Date(started+180*60_000).toISOString(),
  sealed_at:new Date(started+170*60_000).toISOString(),
  released_at:null,
  duration_minutes:180,
  total_points:10,
  objective_max_points:10,
  productive_max_points:0,
  task_order:['reading_a'],
  current_step:1,
  steps:[{
    step_id:'s1',
    task:'reading_a',
    object_id:'paper-reading',
    label:'Reading A',
    source_hash:'paper-step-hash',
    max_points:10,
    question_ids:['q1']
  }],
  captures:{
    s1:{step_id:'s1',task:'reading_a',object_id:'paper-reading',completed_at:new Date(started+1000).toISOString(),payload}
  },
  release:null,
  updated_at:new Date(started+170*60_000).toISOString()
};

const summary=summarizeEnglishExamSession(session);
assert.equal(summary.step_evidence.length,1);
assert.equal(summary.step_evidence[0].evidence.prior_exposure,'exposed');
assert.equal(summary.step_evidence[0].evidence.assistance,'assisted');
assert.equal(summary.step_evidence[0].evidence.semantic_source_hash,'paper-semantic-hash');

const released=releaseEnglishExamObjective({
  ...session,
  paper_assistance_context:{
    state:'assisted',
    basis:'chat_context',
    observed_at:'2026-09-21T00:59:00.000Z',
    note:'Content-specific Chat help before this formal paper.'
  }
},{
  schema:ENGLISH_EXAM_ANSWER_SCHEMA,
  paper_id:'paper-e4',
  steps:{
    s1:{task:'reading_a',object_id:'paper-reading',source_hash:'paper-step-hash',answers:{q1:'A'}}
  }
},started+181*60_000);
assert.equal(released.release.objective.points,10);
assert.equal(released.release.paper_assistance_context?.state,'assisted');
assert.equal(released.release.objective.steps[0].evidence.prior_exposure,'exposed');
assert.equal(released.release.objective.steps[0].evidence.assistance,'assisted');
assert.equal(released.release.objective.steps[0].evidence.semantic_source_hash,'paper-semantic-hash');
assert.equal(released.release.objective.steps[0].evidence.independent_transfer_candidate,false);

// 5) Full-paper parent Chat assistance must remain visible without flattening constituent section facts.
const paperMeta=listEnglishExamPapers()[0];
assert.ok(paperMeta?.paperId,'current whole-paper fixture missing');
const paper=loadEnglishExamPaper(paperMeta.paperId);
const assistedPaper=startEnglishExamSession(paper,{
  now:Date.parse('2026-09-21T02:00:00.000Z'),
  assistanceContext:{
    state:'assisted',
    basis:'chat_context',
    observed_at:'2026-09-21T01:59:00.000Z',
    note:'Chat materially discussed content in this paper before formal execution.'
  },
  sessionId:'e4-assisted-paper'
});
assert.equal(assistedPaper.paper_assistance_context?.state,'assisted');
const assistedSummary=summarizeEnglishExamSession(assistedPaper);
assert.equal(assistedSummary.paper_assistance_context?.state,'assisted');
const assistedPacket=buildEnglishExamEvidencePacket(assistedPaper);
assert.equal(assistedPacket.paper_assistance_context?.state,'assisted');
assert.ok(Array.isArray(assistedPacket.steps)&&assistedPacket.steps.length===9);

console.log(JSON.stringify({
  schema:'kianos.english.evidence-fidelity-e4-validation.v1',
  status:'PASS',
  checks:{
    chat_context_assistance_downgrades_first_evidence:true,
    chat_cannot_declare_unassisted:true,
    semantic_source_cross_object_exposure:true,
    semantic_revision_does_not_inherit_object_id_exposure:true,
    stale_unseen_declaration_is_revision_bound:true,
    exposed_declaration_cross_object_exposure:true,
    known_exposure_rejects_later_unseen_alias:true,
    whole_paper_exposure_preserves_child_semantic_identity:true,
    bounded_long_horizon_recurrence_digest:true,
    recent_absence_not_long_horizon_absence:true,
    broken_recurrence_ledger_requires_deeper_review:true,
    whole_paper_constituent_exposure_preserved:true,
    whole_paper_constituent_assistance_preserved:true,
    whole_paper_release_keeps_contamination_context:true,
    whole_paper_parent_assistance_context_preserved:true,
    whole_paper_release_root_assistance_context_preserved:true,
    whole_paper_semantic_source_identity_preserved:true
  }
},null,2));
