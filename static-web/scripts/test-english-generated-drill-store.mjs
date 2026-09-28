import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { englishStepIsComplete, writeEnglishSessionInstruction, ENGLISH_SESSION_SCHEMA } from '../src/lib/englishSessionControl.mjs';
import {
  ENGLISH_GENERATED_DRILL_SCHEMA,
  writeEnglishGeneratedDrill,
  readEnglishGeneratedDrill,
  listEnglishGeneratedDrills,
  generatedDrillCatalogRows,
  materializeEnglishGeneratedDrill,
  englishGeneratedDrillAnswers
} from '../scripts/privateEnglishGeneratedDrillStore.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'english-generated-drill-'));
const day='2026-09-20';
const base={
  schema:ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id:'external-chat-2026-09-20-scope-001',
  study_day:day,
  generated_at:'2026-09-20T02:00:00+08:00',
  origin:'CHAT_GENERATED_SYNTHETIC',
  completion_requirement:'QUESTIONS_SUBMITTED',
  training_target:{kind:'reading_scope_transfer',note:'Synthetic changed-context check for scope/modality boundary.'},
  passage:{title:'Synthetic scope drill',paragraphs:['Some approaches may help a limited group under specific conditions.','Later reports described wider interest, but did not establish universal benefit.']},
  questions:[
    {question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',prompt:'Which claim is best supported?',options:{A:'The approach benefits everyone.',B:'The approach may help some people under limited conditions.',C:'The approach never helps anyone.',D:'Researchers proved universal benefit.'},answer:'B',rationale:'B preserves the source scope and modality.'}
  ]
};

try{
  const first=writeEnglishGeneratedDrill(base,{privateDir:temp});
  assert.equal(first.status,'written');
  assert.equal(fs.statSync(first.path).mode&0o777,0o600);
  const same=writeEnglishGeneratedDrill(base,{privateDir:temp});
  assert.equal(same.status,'idempotent');
  const read=readEnglishGeneratedDrill(base.object_id,{privateDir:temp});
  assert.equal(read.origin,'CHAT_GENERATED_SYNTHETIC');
  assert.equal(read.questions[0].origin,'CHAT_GENERATED');

  const catalog=generatedDrillCatalogRows({privateDir:temp,studyDay:day});
  assert.equal(catalog.length,1);
  assert.equal(catalog[0].task,'external_reading');
  assert.equal(catalog[0].source_hash,read.content_hash);

  const view=materializeEnglishGeneratedDrill(read);
  assert.equal(view.question_origin,'CHAT_GENERATED');
  assert.equal(view.completion_requirement,'QUESTIONS_SUBMITTED');
  assert.equal(view.source_family,'CHAT_GENERATED');
  assert.equal(view.questions[0].answer,undefined,'answers must not leak into passage view');
  const answers=englishGeneratedDrillAnswers(read);
  assert.equal(answers.answers.q1,'B');
  assert.equal(answers.question_origin,'CHAT_GENERATED');

  assert.throws(()=>writeEnglishGeneratedDrill({...base,training_target:{...base.training_target,note:'different meaning'}},{privateDir:temp}),/ID_CONFLICT/);
  const preserved=readEnglishGeneratedDrill(base.object_id,{privateDir:temp});
  assert.equal(preserved.content_hash,read.content_hash,'conflict must preserve original object');

  assert.throws(()=>writeEnglishGeneratedDrill({...base,object_id:'external-chat-2026-09-20-bad-answer',questions:[{...base.questions[0],answer:'Z'}]},{privateDir:temp}),/ANSWER_INVALID/);

  const sourced={
    ...base,
    object_id:'external-chat-2026-09-20-source-001',
    origin:'CHAT_GENERATED_ON_EXTERNAL_SOURCE',
    passage:undefined,
    source_ref:{object_id:'tpo56-p1',content_hash:'source-r1'},
    questions:[{...base.questions[0],question_id:'sq1'}]
  };
  const sourceWrite=writeEnglishGeneratedDrill(sourced,{privateDir:temp});
  assert.equal(sourceWrite.status,'written');
  const sourcedValue=readEnglishGeneratedDrill(sourced.object_id,{privateDir:temp});
  assert.throws(()=>materializeEnglishGeneratedDrill(sourcedValue,{loadExternalSource:()=>({object_id:'tpo56-p1',content_hash:'source-r2',passage_paragraphs:['x']})}),/SOURCE_REVISION_MISMATCH/);
  const sourcedView=materializeEnglishGeneratedDrill(sourcedValue,{loadExternalSource:()=>({object_id:'tpo56-p1',content_hash:'source-r1',source_family:'TOEFL_TPO',source_format:'TOEFL_LEGACY',collection:'TPO56',title:'Source passage',passage_paragraphs:['Original source paragraph.']})});
  assert.equal(sourcedView.source_family,'TOEFL_TPO');
  assert.equal(sourcedView.question_origin,'CHAT_GENERATED');
  assert.equal(sourcedView.source_object_id,'tpo56-p1');

  assert.equal(listEnglishGeneratedDrills({privateDir:temp,studyDay:'2026-09-21'}).length,0);

  class Storage {
    constructor(entries={}){this.data=new Map(Object.entries(entries));}
    get length(){return this.data.size;}
    key(i){return [...this.data.keys()][i]??null;}
    getItem(k){return this.data.get(k)??null;}
    setItem(k,v){this.data.set(k,String(v));}
    removeItem(k){this.data.delete(k);}
  }
  const extKey='kianos-english-external-reading-attempt-v1:'+read.object_id;
  const generatedAttempt={
    binding:{source_hash:read.content_hash,source_snapshot:{completion_requirement:'QUESTIONS_SUBMITTED'}},
    submitted:false,
    stage:'completed',
    results:{}
  };
  const step={task:'external_reading',object_id:read.object_id,source_hash:read.content_hash};
  const generatedStorage=new Storage({[extKey]:JSON.stringify(generatedAttempt)});
  assert.equal(englishStepIsComplete(generatedStorage,step),false,'read-only completion must not satisfy question-required generated drill');
  generatedAttempt.submitted=true;
  generatedAttempt.stage='submitted';
  generatedStorage.setItem(extKey,JSON.stringify(generatedAttempt));
  assert.equal(englishStepIsComplete(generatedStorage,step),true,'submitted generated drill should complete Session step');

  const normalId='tpo56-p1';
  const normalHash='normal-r1';
  const normalStorage=new Storage({['kianos-english-external-reading-attempt-v1:'+normalId]:JSON.stringify({
    binding:{source_hash:normalHash,source_snapshot:{}},
    submitted:false,
    stage:'completed'
  })});
  assert.equal(englishStepIsComplete(normalStorage,{task:'external_reading',object_id:normalId,source_hash:normalHash}),true,'ordinary External must preserve reading-only completion');

  const staleGeneratedCatalog=[{task:'external_reading',object_id:read.object_id,source_hash:read.content_hash,study_day:'2026-09-19'}];
  assert.throws(()=>writeEnglishSessionInstruction(new Storage(),{
    schema:ENGLISH_SESSION_SCHEMA,
    session_id:'english-2026-09-20-stale-generated',
    study_day:'2026-09-20',
    generated_at:'2026-09-20T02:30:00+08:00',
    current_step:0,
    steps:[{step_id:'g1',task:'external_reading',object_id:read.object_id,source_hash:read.content_hash}]
  },'2026-09-20',{catalog:staleGeneratedCatalog,now:Date.parse('2026-09-19T18:30:00Z')}),/OBJECT_STALE_DAY/);

  console.log('PASS English generated drill store: private identity, no answer leak, idempotency, conflict/stale-source guards'); // branch proof trigger
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
