import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ensureExternalReadingPrivateBundle,
  externalReadingAnswers,
  externalReadingCatalog,
  externalReadingPassage
} from './privateExternalReadingStore.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const repoRoot=path.resolve(here,'../..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-external-reading-'));
const sourceRoot=path.join(temp,'source');
const privateDir=path.join(temp,'private');
fs.mkdirSync(path.join(sourceRoot,'TOEFL'),{recursive:true});
fs.mkdirSync(path.join(sourceRoot,'IELTS'),{recursive:true});
fs.writeFileSync(path.join(sourceRoot,'source_manifest.json'),JSON.stringify({schema:'synthetic-external-source-test'}));

const options=Array.from({length:4},(_,i)=>String.fromCharCode(65+i)+'. option '+(i+1)).join('\n');
const qblock=(start,end)=>Array.from({length:end-start+1},(_,i)=>{
  const n=start+i;
  return `${n}. Synthetic source-native question ${n}?\n${options}`;
}).join('\n');
const tpoKey=count=>Array.from({length:count},(_,i)=>`| ${i+1} | A |`).join('\n');

const tpoCounts={
  56:[14,13,14],57:[14,14,14],58:[14,14,14],59:[14,14,14],60:[14,14,14],
  61:[14,14,14],62:[14,14,14],63:[14,14,14],64:[10,10,10],65:[10,10,10]
};
for(const [number,counts] of Object.entries(tpoCounts)){
  const sections=counts.map((count,index)=>[
    `# Passage ${index+1} — Synthetic TPO ${number} P${index+1}`,
    '## Passage and Questions',
    `[Paragraph 1] Synthetic academic passage ${number}-${index+1}. It exists only for engineering validation.`,
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
    const passages=[
      [1,13],[14,26],[27,40]
    ].map(([start,end],index)=>[
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

try{
  const state=ensureExternalReadingPrivateBundle({sourceRoot,privateDir,force:true,enforceSourceHashGate:false});
  assert.equal(state.status,'ready',state.error||state.status);
  assert.equal(state.bundle.passages.length,66);
  assert.deepEqual(state.bundle.counts.toefl,{collections:10,passages:30,questions:395,answer_slots:395});
  assert.equal(state.bundle.counts.ielts.books,3);
  assert.equal(state.bundle.counts.ielts.tests,12);
  assert.equal(state.bundle.counts.ielts.passages,36);
  assert.equal(state.bundle.counts.ielts.questions,480);
  assert.equal(state.bundle.cognition_boundary.english1_reading_a_strategy,'NOT_INHERITED');
  assert.equal(state.bundle.source_quality.proven_clean_claim,false);

  const catalog=externalReadingCatalog(state);
  assert.equal(catalog.status,'ready');
  const rows=catalog.collections.flatMap(group=>group.passages);
  assert.equal(rows.length,66);
  assert(rows.some(row=>row.object_id==='tpo56-p1'));
  assert(rows.some(row=>row.object_id==='ielts17-t1-p1'));
  assert(rows.every(row=>row.content_hash&&row.source_hash));

  const passage=externalReadingPassage('tpo56-p1',state);
  assert.equal(passage.questions.length,14);
  assert.equal('answer_key' in passage,false,'attempt view must not expose formal answer key');
  assert.equal(passage.source_family,'TOEFL_TPO');
  assert.equal(passage.source_format,'TOEFL_LEGACY');

  const answers=externalReadingAnswers('tpo56-p1',state);
  assert.equal(answers.answers['tpo56-p1-q1'],'A');
  assert.equal(answers.content_hash,passage.content_hash);

  const publicManifest=JSON.parse(fs.readFileSync(path.join(repoRoot,'content','english','external','manifest.json'),'utf8'));
  assert.equal(publicManifest.status,'CURRENT_PRIVATE_SOURCE_LANE');
  assert.equal(publicManifest.inventory.object_count,66);
  assert.equal(publicManifest.public_private_split.private_learner_owns.includes('exposure history'),true);
  for(const object of publicManifest.inventory.objects){
    assert.equal('passage_text' in object,false);
    assert.equal('questions' in object,false);
    assert.equal('answer_key' in object,false);
    assert.equal('exposure_state' in object,false);
  }

  const missing=ensureExternalReadingPrivateBundle({sourceRoot:path.join(temp,'does-not-exist'),privateDir:path.join(temp,'missing')});
  assert.equal(missing.status,'missing_source');
  assert(missing.missing.length>0);

  const stale=ensureExternalReadingPrivateBundle({sourceRoot,privateDir:path.join(temp,'stale-gate')});
  assert.equal(stale.status,'stale_source');
  assert.equal(stale.bundle,null);
  assert.equal(stale.mismatches.length,14);
  assert(stale.mismatches.every(row=>row.relative&&row.expected_sha256&&row.actual_sha256));

  console.log(JSON.stringify({
    status:'PASS',
    passages:rows.length,
    tpo_questions:state.bundle.counts.toefl.questions,
    ielts_questions:state.bundle.counts.ielts.questions,
    public_source_bytes:0,
    answer_gate:'PASS',
    cognition_boundary:'PASS',
    missing_source_fail_closed:'PASS',
    stale_source_hash_gate:'PASS'
  },null,2));
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
