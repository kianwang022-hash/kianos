import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ENGLISH_GENERATED_DRILL_SCHEMA,writeEnglishGeneratedDrill} from './privateEnglishGeneratedDrillStore.mjs';
import {englishExternalCombinedCatalog,englishExternalCombinedPassage,englishExternalCombinedAnswers} from './privateEnglishExternalStore.mjs';

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'english-external-combined-'));
try{
  const drill={
    schema:ENGLISH_GENERATED_DRILL_SCHEMA,
    object_id:'external-chat-2026-09-20-combined-001',
    study_day:'2026-09-20',
    generated_at:'2026-09-20T02:20:00+08:00',
    origin:'CHAT_GENERATED_SYNTHETIC',
    completion_requirement:'QUESTIONS_SUBMITTED',
    training_target:{kind:'reading_transfer',note:'Synthetic proof only.'},
    passage:{title:'Synthetic combined proof',paragraphs:['Only some cases support the narrower claim.']},
    questions:[{question_id:'q1',origin:'CHAT_GENERATED',response_kind:'single_choice',prompt:'Which statement is supported?',options:{A:'All cases support it.',B:'Some cases support it.'},answer:'B'}]
  };
  writeEnglishGeneratedDrill(drill,{privateDir:temp});

  const missingSource={status:'missing_source',source_root:'/missing',missing:['x'],bundle:null};
  const catalog=englishExternalCombinedCatalog({sourceState:missingSource,generatedDir:temp,studyDay:'2026-09-20'});
  assert.equal(catalog.status,'ready','synthetic Chat drill should remain usable when optional source bundle is missing');
  assert.equal(catalog.source_status,'missing_source');
  assert.equal(catalog.counts.generated.objects,1);
  const generatedRows=catalog.collections.find(x=>x.source_family==='CHAT_GENERATED')?.passages||[];
  assert.equal(generatedRows.length,1);
  assert.equal(generatedRows[0].study_day,'2026-09-20');

  const passage=englishExternalCombinedPassage(drill.object_id,{sourceState:missingSource,generatedDir:temp});
  assert.equal(passage.drill_origin,'CHAT_GENERATED_SYNTHETIC');
  assert.equal(passage.completion_requirement,'QUESTIONS_SUBMITTED');
  assert.equal(passage.questions[0].origin,'CHAT_GENERATED');
  assert.equal(passage.questions[0].answer,undefined);

  const answers=englishExternalCombinedAnswers(drill.object_id,{sourceState:missingSource,generatedDir:temp});
  assert.equal(answers.answers.q1,'B');

  assert.throws(()=>englishExternalCombinedPassage('tpo56-p1',{sourceState:missingSource,generatedDir:temp}),/EXTERNAL_PRIVATE_BUNDLE_NOT_READY/);

  console.log('PASS combined External facade: generated drills survive missing optional source bundle and preserve provenance');
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
