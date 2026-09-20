import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeExternalReadingSyntheticSource } from './externalReadingSyntheticFixture.mjs';
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
writeExternalReadingSyntheticSource(sourceRoot);
const incrementalManifestPath=path.join(sourceRoot,'INCREMENTAL','manifest.json');
const incrementalRegistryPath=path.join(sourceRoot,'INCREMENTAL','registry.json');
fs.rmSync(incrementalManifestPath,{force:true});
const builder=spawnSync('python3',[
  path.join(repoRoot,'tools','english-external','build_incremental_manifest.py'),
  '--source-root',sourceRoot,
  '--registry',incrementalRegistryPath,
  '--output',incrementalManifestPath
],{encoding:'utf8'});
assert.equal(builder.status,0,builder.stderr||builder.stdout||'incremental manifest builder failed');
const builtManifest=JSON.parse(fs.readFileSync(incrementalManifestPath,'utf8'));
assert.equal(builtManifest.schema,'kian.external.incremental-manifest.v1');
assert.equal(builtManifest.object_count,3);
assert.equal(builtManifest.objects.length,3);
assert(builtManifest.objects.every(row=>row.source_sha256));
assert(builtManifest.objects.find(row=>row.object_id==='toefl-current-synthetic-keyed')?.answers_sha256);


const completePackage=[
  '~~~yaml',
  'title: Synthetic Source Article',
  'publication: Synthetic Journal',
  'author: Test Author',
  'publication_date: 2026-09-20',
  'original_url: https://example.invalid/source-article',
  'extraction_date: 2026-09-20',
  'language: en',
  'exposure: UNSEEN',
  'source_type: periodical',
  '~~~',
  '',
  '# Synthetic Source Article',
  '',
  'First source paragraph stays unchanged.',
  '',
  '## Source section',
  '',
  'Second source paragraph also stays unchanged.',
  '',
  '~~~yaml',
  'extraction_check:',
  '  body_complete: YES',
  '  missing_sections:',
  '  paywall_truncation: NO',
  '  image_dependent_content: NO',
  '  extraction_notes:',
  '~~~',
  ''
].join('\\n').replaceAll('~~~','\`\`\`');
const completePackagePath=path.join(temp,'complete-source-package.md');
fs.writeFileSync(completePackagePath,completePackage,'utf8');
const completeOut=path.join(temp,'parsed-complete');
const parseComplete=spawnSync('python3',[
  path.join(repoRoot,'tools','english-external','parse_source_package.py'),
  '--package',completePackagePath,
  '--source-id','synthetic-source-article',
  '--output-dir',completeOut
],{encoding:'utf8'});
assert.equal(parseComplete.status,0,parseComplete.stderr||parseComplete.stdout||'source package parser failed');
assert.equal(fs.readFileSync(path.join(completeOut,'raw','source_package.md'),'utf8'),completePackage);
const parsedArticle=fs.readFileSync(path.join(completeOut,'normalized','article.md'),'utf8');
assert.match(parsedArticle,/First source paragraph stays unchanged\\./);
assert.match(parsedArticle,/Second source paragraph also stays unchanged\\./);
assert.doesNotMatch(parsedArticle,/extraction_check:/);
assert.doesNotMatch(parsedArticle,/publication:/);
const parsedMeta=JSON.parse(fs.readFileSync(path.join(completeOut,'meta.json'),'utf8'));
assert.equal(parsedMeta.schema,'kian.external-source-package-parsed.v1');
assert.equal(parsedMeta.learner_exposure.status,'UNSEEN');
assert.equal(parsedMeta.intake.status,'PARSED_NOT_ADMITTED');
assert.equal(parsedMeta.intake.precheck,'READY_FOR_SOURCE_QUALITY_REVIEW');
assert.equal(parsedMeta.parser_policy.prose_rewritten,false);

const incompletePackage=completePackage
  .replace('body_complete: YES','body_complete: UNCERTAIN')
  .replace('paywall_truncation: NO','paywall_truncation: YES')
  .replace('First source paragraph stays unchanged.','Only a visibly truncated source fragment is present.');
const incompletePackagePath=path.join(temp,'incomplete-source-package.md');
fs.writeFileSync(incompletePackagePath,incompletePackage,'utf8');
const incompleteOut=path.join(temp,'parsed-incomplete');
const parseIncomplete=spawnSync('python3',[
  path.join(repoRoot,'tools','english-external','parse_source_package.py'),
  '--package',incompletePackagePath,
  '--source-id','synthetic-source-incomplete',
  '--output-dir',incompleteOut
],{encoding:'utf8'});
assert.equal(parseIncomplete.status,0,parseIncomplete.stderr||parseIncomplete.stdout||'incomplete package parser failed');
const incompleteMeta=JSON.parse(fs.readFileSync(path.join(incompleteOut,'meta.json'),'utf8'));
assert.equal(incompleteMeta.intake.status,'PARSED_NOT_ADMITTED');
assert.equal(incompleteMeta.intake.precheck,'HOLD_INCOMPLETE_OR_UNCERTAIN_SOURCE');

const missingSectionPackage=completePackage.replace('  missing_sections:','  missing_sections: appendix table');
const missingSectionPackagePath=path.join(temp,'missing-section-source-package.md');
fs.writeFileSync(missingSectionPackagePath,missingSectionPackage,'utf8');
const missingSectionOut=path.join(temp,'parsed-missing-section');
const parseMissingSection=spawnSync('python3',[
  path.join(repoRoot,'tools','english-external','parse_source_package.py'),
  '--package',missingSectionPackagePath,
  '--source-id','synthetic-source-missing-section',
  '--output-dir',missingSectionOut
],{encoding:'utf8'});
assert.equal(parseMissingSection.status,0,parseMissingSection.stderr||parseMissingSection.stdout||'missing-section package parser failed');
const missingSectionMeta=JSON.parse(fs.readFileSync(path.join(missingSectionOut,'meta.json'),'utf8'));
assert.equal(missingSectionMeta.intake.precheck,'HOLD_INCOMPLETE_OR_UNCERTAIN_SOURCE');

const commentaryPackagePath=path.join(temp,'commentary-source-package.md');
fs.writeFileSync(commentaryPackagePath,'Here is the archived article:\n'+completePackage,'utf8');
const commentaryOut=path.join(temp,'parsed-commentary');
const parseCommentary=spawnSync('python3',[
  path.join(repoRoot,'tools','english-external','parse_source_package.py'),
  '--package',commentaryPackagePath,
  '--source-id','synthetic-source-commentary',
  '--output-dir',commentaryOut
],{encoding:'utf8'});
assert.notEqual(parseCommentary.status,0);
assert.match(String(parseCommentary.stderr||parseCommentary.stdout||''),/unexpected content before metadata block/);

try{
  const state=ensureExternalReadingPrivateBundle({
    sourceRoot,
    privateDir,
    force:true,
    enforceSourceHashGate:false,
    allowUnregisteredIncremental:true
  });
  assert.equal(state.status,'ready',state.error||state.status);
  assert.equal(state.bundle.passages.length,69);
  assert.deepEqual(state.bundle.counts.toefl,{collections:10,passages:30,questions:395,answer_slots:395});
  assert.equal(state.bundle.counts.ielts.books,3);
  assert.equal(state.bundle.counts.ielts.tests,12);
  assert.equal(state.bundle.counts.ielts.passages,36);
  assert.equal(state.bundle.counts.ielts.questions,480);
  assert.deepEqual(state.bundle.counts.incremental,{objects:3,questions:2,questionless_objects:1});
  assert.equal(state.bundle.cognition_boundary.english1_reading_a_strategy,'NOT_INHERITED');
  assert.equal(state.bundle.source_quality.proven_clean_claim,false);

  const catalog=externalReadingCatalog(state);
  assert.equal(catalog.status,'ready');
  const rows=catalog.collections.flatMap(group=>group.passages);
  assert.equal(rows.length,69);
  assert(rows.some(row=>row.object_id==='tpo56-p1'));
  assert(rows.some(row=>row.object_id==='ielts17-t1-p1'));
  assert(rows.some(row=>row.object_id==='future-synthetic-longform'));
  assert(rows.some(row=>row.object_id==='toefl-current-synthetic-no-key'));
  assert(rows.some(row=>row.object_id==='toefl-current-synthetic-keyed'));
  assert(rows.every(row=>row.content_hash&&row.source_hash));

  const passage=externalReadingPassage('tpo56-p1',state);
  assert.equal(passage.questions.length,14);
  assert.equal('answer_key' in passage,false,'attempt view must not expose formal answer key');
  assert.equal(passage.source_family,'TOEFL_TPO');
  assert.equal(passage.source_format,'TOEFL_LEGACY');

  const answers=externalReadingAnswers('tpo56-p1',state);
  assert.equal(answers.answers['tpo56-p1-q1'],'A');
  assert.equal(answers.content_hash,passage.content_hash);

  const incrementalReading=externalReadingPassage('future-synthetic-longform',state);
  assert.equal(incrementalReading.questions.length,0);
  assert.equal(incrementalReading.answer_key_status,'NO_QUESTIONS');
  assert.equal(incrementalReading.completion_requirement,'READ_ONLY_OK');
  assert.equal(incrementalReading.source_family,'FUTURE_INCREMENTAL');

  const noKey=externalReadingPassage('toefl-current-synthetic-no-key',state);
  assert.equal(noKey.questions.length,1);
  assert.equal(noKey.answer_key_status,'SOURCE_NATIVE_NO_KEY');
  assert.deepEqual(externalReadingAnswers('toefl-current-synthetic-no-key',state).answers,{});

  const keyed=externalReadingPassage('toefl-current-synthetic-keyed',state);
  assert.equal(keyed.questions.length,1);
  assert.equal(keyed.answer_key_status,'SOURCE_BACKED');
  assert.equal(externalReadingAnswers('toefl-current-synthetic-keyed',state).answers['toefl-current-synthetic-keyed-q1'],'A');

  const legacyOnly=ensureExternalReadingPrivateBundle({
    sourceRoot,
    privateDir:path.join(temp,'legacy-only'),
    force:true,
    enforceSourceHashGate:false,
    allowUnregisteredIncremental:false
  });
  assert.equal(legacyOnly.status,'ready',legacyOnly.error||legacyOnly.status);
  assert.equal(legacyOnly.bundle.passages.length,66);
  assert.deepEqual(legacyOnly.bundle.counts.incremental,{objects:0,questions:0,questionless_objects:0});

  const tamperedArticle=path.join(sourceRoot,'INCREMENTAL','longform','article.md');
  fs.appendFileSync(tamperedArticle,'\n\nTampered after manifest registration.\n','utf8');
  const tampered=ensureExternalReadingPrivateBundle({
    sourceRoot,
    privateDir:path.join(temp,'tampered-incremental'),
    force:true,
    enforceSourceHashGate:false,
    allowUnregisteredIncremental:true
  });
  assert.equal(tampered.status,'compile_error');
  assert.match(String(tampered.error||''),/SHA mismatch/);

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
    incremental_objects:state.bundle.counts.incremental.objects,
    incremental_questionless:'PASS',
    incremental_no_key:'PASS',
    incremental_source_backed:'PASS',
    unregistered_incremental_ignored:'PASS',
    incremental_manifest_builder:'PASS',
    source_package_parser:'PASS',
    incomplete_source_hold:'PASS',
    declared_missing_section_hold:'PASS',
    source_package_extra_commentary_rejected:'PASS',
    incremental_object_hash_fail_closed:'PASS',
    public_source_bytes:0,
    answer_gate:'PASS',
    cognition_boundary:'PASS',
    missing_source_fail_closed:'PASS',
    stale_source_hash_gate:'PASS'
  },null,2));
}finally{
  fs.rmSync(temp,{recursive:true,force:true});
}
