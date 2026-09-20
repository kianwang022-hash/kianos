import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const options=Array.from({length:4},(_,i)=>String.fromCharCode(65+i)+'. option '+(i+1)).join('\n');
const qblock=(start,end)=>Array.from({length:end-start+1},(_,i)=>{
  const n=start+i;
  return `${n}. Synthetic source-native question ${n}?\n${options}`;
}).join('\n');
const tpoKey=count=>Array.from({length:count},(_,i)=>`| ${i+1} | A |`).join('\n');
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');

export function writeExternalReadingSyntheticSource(sourceRoot){
  fs.mkdirSync(path.join(sourceRoot,'TOEFL'),{recursive:true});
  fs.mkdirSync(path.join(sourceRoot,'IELTS'),{recursive:true});
  fs.writeFileSync(path.join(sourceRoot,'source_manifest.json'),JSON.stringify({schema:'synthetic-external-source-test'}));

  const tpoCounts={
    56:[14,13,14],57:[14,14,14],58:[14,14,14],59:[14,14,14],60:[14,14,14],
    61:[14,14,14],62:[14,14,14],63:[14,14,14],64:[10,10,10],65:[10,10,10]
  };
  for(const [number,counts] of Object.entries(tpoCounts)){
    const sections=counts.map((count,index)=>[
      `# Passage ${index+1} — Synthetic TPO ${number} P${index+1}`,
      '## Passage and Questions',
      `[Paragraph 1] Synthetic academic passage ${number}-${index+1}. Transferable reading skill is shared, but source-native task identity is preserved.`,
      qblock(1,count),
      '## Answer Key',
      '| Question | Answer |',
      '| --- | --- |',
      tpoKey(count)
    ].join('\n')).join('\n\n');
    fs.writeFileSync(path.join(sourceRoot,'TOEFL',`TPO${number}.md`),sections);
  }

  for(const book of [17,18,19]){
    const tests=[];
    for(let test=1;test<=4;test++){
      const passages=[[1,13],[14,26],[27,40]].map(([start,end],index)=>[
        `## Reading Passage ${index+1}`,
        `[Paragraph 1] Synthetic IELTS ${book} test ${test} passage ${index+1}. Engineering fixture only.`,
        `Questions ${start}–${end}`,
        qblock(start,end)
      ].join('\n')).join('\n\n');
      const key=Array.from({length:40},(_,i)=>`${i+1} A`).join('\n');
      tests.push([
        `# Test ${test}`,
        passages,
        `## Test ${test} — Reading Answer Key`,
        key
      ].join('\n\n'));
    }
    fs.writeFileSync(path.join(sourceRoot,'IELTS',`Cambridge_IELTS_${book}_Academic_Reading.md`),tests.join('\n\n'));
  }
  const incrementalDir=path.join(sourceRoot,'INCREMENTAL');
  fs.mkdirSync(incrementalDir,{recursive:true});

  const writeText=(relative,value)=>{
    const file=path.join(sourceRoot,relative);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,value,'utf8');
    return{relative,sha256:sha256(Buffer.from(value,'utf8'))};
  };

  const longform=writeText(
    'INCREMENTAL/longform/article.md',
    '# Synthetic Open Long-form\n\nThis is a questionless authentic-style reading-growth fixture. It proves that External Reading can preserve pure reading without manufacturing questions.\n\nA second paragraph verifies stable paragraph handling.'
  );

  const noKeyArticle=writeText(
    'INCREMENTAL/current-toefl-no-key/article.md',
    '# Synthetic Current TOEFL Source\n\nA current-format source-native fixture can retain questions even when no formal answer key is available.'
  );
  const noKeyQuestionsPayload={
    schema:'kian.external.incremental-questions.v1',
    questions:[{
      ordinal:1,
      prompt:'What is the main purpose of the synthetic source?',
      options:{A:'To test explicit incremental questions',B:'To remove source identity'},
      response_kind:'single_choice',
      source_text:'1. What is the main purpose of the synthetic source?'
    }]
  };
  const noKeyQuestions=writeText(
    'INCREMENTAL/current-toefl-no-key/questions.json',
    JSON.stringify(noKeyQuestionsPayload,null,2)+'\n'
  );

  const keyedArticle=writeText(
    'INCREMENTAL/current-toefl-keyed/article.md',
    '# Synthetic Keyed Current TOEFL Source\n\nThis fixture proves that an explicitly registered source-native answer key remains gated until Submit.'
  );
  const keyedQuestionsPayload={
    schema:'kian.external.incremental-questions.v1',
    questions:[{
      ordinal:1,
      prompt:'Which statement describes this fixture?',
      options:{A:'It has a source-backed key',B:'It is questionless'},
      response_kind:'single_choice',
      source_text:'1. Which statement describes this fixture?'
    }]
  };
  const keyedQuestions=writeText(
    'INCREMENTAL/current-toefl-keyed/questions.json',
    JSON.stringify(keyedQuestionsPayload,null,2)+'\n'
  );
  const keyedAnswersPayload={
    schema:'kian.external.incremental-answers.v1',
    answers:{'1':'A'}
  };
  const keyedAnswers=writeText(
    'INCREMENTAL/current-toefl-keyed/answers.json',
    JSON.stringify(keyedAnswersPayload,null,2)+'\n'
  );

  const incrementalManifest={
    schema:'kian.external.incremental-manifest.v1',
    objects:[
      {
        object_id:'future-synthetic-longform',
        source_family:'FUTURE_INCREMENTAL',
        source_format:'SOURCE_PACKAGE_MARKDOWN',
        practice_role:'READING_GROWTH',
        collection:'Synthetic Long-form',
        title:'Synthetic Open Long-form',
        source_path:longform.relative,
        source_sha256:longform.sha256,
        source_url:'https://example.invalid/synthetic-longform'
      },
      {
        object_id:'toefl-current-synthetic-no-key',
        source_family:'TOEFL_CURRENT',
        source_format:'SOURCE_NATIVE_JSON',
        practice_role:'READING_GROWTH',
        collection:'Synthetic Current TOEFL',
        title:'Synthetic Current TOEFL · No Key',
        source_path:noKeyArticle.relative,
        source_sha256:noKeyArticle.sha256,
        questions_path:noKeyQuestions.relative,
        questions_sha256:noKeyQuestions.sha256,
        source_url:'https://example.invalid/current-toefl-no-key'
      },
      {
        object_id:'toefl-current-synthetic-keyed',
        source_family:'TOEFL_CURRENT',
        source_format:'SOURCE_NATIVE_JSON',
        practice_role:'READING_GROWTH',
        collection:'Synthetic Current TOEFL',
        title:'Synthetic Current TOEFL · Keyed',
        source_path:keyedArticle.relative,
        source_sha256:keyedArticle.sha256,
        questions_path:keyedQuestions.relative,
        questions_sha256:keyedQuestions.sha256,
        answers_path:keyedAnswers.relative,
        answers_sha256:keyedAnswers.sha256,
        source_url:'https://example.invalid/current-toefl-keyed'
      }
    ]
  };
  fs.writeFileSync(path.join(incrementalDir,'manifest.json'),JSON.stringify(incrementalManifest,null,2)+'\n','utf8');

  return sourceRoot;
}
