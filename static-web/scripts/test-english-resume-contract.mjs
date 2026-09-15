import assert from 'node:assert/strict';
import { readSiteResumes } from '../src/lib/siteResume.mjs';

export function testEnglishResumeContract() {
  const checks = [];
  const map = new Map();
  const storage = { getItem: key => map.get(key) ?? null };
  const set = (key, value) => map.set(key, JSON.stringify(value));
  const read = (base = '/') => readSiteResumes(storage, 'https://study.invalid', base);
  const pass = name => checks.push(name);
  set('kianos-writing-last-location-v1', {id:'synthetic',title:'Writing review',href:'/writing/synthetic/',updatedAt:'2026-09-15T11:00:00Z'});
  set('kianos-writing-runtime-v1:synthetic', {state:'REVIEW_PENDING',firstDraft:'Already written.'});
  set('kianos-translation-last-location-v1', {id:'synthetic',title:'Active reconstruction',href:'/translation/synthetic/?repair=1#source-q1',updatedAt:'2026-09-15T10:00:00Z'});
  set('kianos-translation-attempt-v2:synthetic', {stage:'reconstruct',firstAttempts:{q1:'第一版译文'}});
  assert.equal(read().english?.title, 'Active reconstruction');
  pass('Current active reconstruction outranks a more recent lower-priority review');
  set('kianos-writing-runtime-v1:synthetic', {state:'ATTEMPT',draftEssay:'An unfinished clean essay.'});
  set('kianos-writing-last-location-v1', {id:'synthetic',title:'Clean attempt',href:'/writing/synthetic/',updatedAt:'2026-09-15T09:00:00Z'});
  assert.equal(read().english?.title, 'Clean attempt');
  pass('Unfinished clean attempt outranks newer repair');
  map.clear();
  for (const stage of ['passed','repaired','transfer_pending','repair-complete','transfer-pending','unknown']) {
    set('kianos-translation-last-location-v1', {id:'synthetic',title:stage,href:'/translation/synthetic/'});
    set('kianos-translation-attempt-v2:synthetic', {stage,firstAttempts:{q1:'已完成译文'}});
    assert.equal(read().english, undefined, stage);
  }
  pass('Actual Translation terminal/pending/unknown states stay out of Resume');
  map.clear();
  set('kianos-objective-last-action-v1', {id:'sample',title:'Pointer only',href:'/cloze/sample/'});
  assert.equal(read().english, undefined);
  set('kianos-cloze-attempt-v1:sample', {submitted:false,answers:{},uncertain:['q1']});
  assert.equal(read().english?.title, 'Pointer only');
  set('kianos-cloze-attempt-v1:sample', {submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]});
  assert.equal(read().english, undefined);
  set('kianos-cloze-attempt-v1:sample', {submitted:true,answers:{q1:'A'},results:{q1:'wrong'},uncertain:[]});
  assert.equal(read().english?.title, 'Pointer only');
  pass('Objective pointer alone and clean completed work cannot summon Resume; real problems can');
  map.clear();
  set('kianos-reading-last-location-v1', {id:'sample',title:'Reading',href:'/reading/sample/',observed_at:'2026-09-15T10:00:00Z'});
  set('kianos-reading-attempt-v1:sample', {submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:[]});
  assert.equal(read().english, undefined);
  set('kianos-reading-attempt-v1:sample', {submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:['q1'],reviewUnlocked:false});
  assert.equal(read().english, undefined);
  set('kianos-reading-attempt-v1:sample', {submitted:true,answers:{q1:'A'},results:{q1:'correct'},uncertain:['q1'],reviewUnlocked:true});
  assert.equal(read().english?.title, 'Reading');
  pass('Reading clean completion leaves Resume; continuous sealed review remains sealed');
  map.clear();
  const record={state:'ATTEMPT',draftEssay:'Actual unfinished essay.'};
  set('kianos-writing-runtime-v1:sample',record);
  for (const href of ['/writing/other/','https://other.invalid/writing/sample/','http://[','https://user:pass@study.invalid/writing/sample/']) {
    set('kianos-writing-last-location-v1',{id:'sample',title:'Invalid',href});
    assert.equal(read().english,undefined,href);
  }
  set('kianos-writing-last-location-v1',{id:'sample',title:'Prefixed',href:'/study/writing/sample/?from=guide#draft'});
  assert.equal(read('/study/').english?.href,'/study/writing/sample/?from=guide#draft');
  const before=JSON.stringify([...map]);read('/study/');assert.equal(JSON.stringify([...map]),before);
  pass('English identity/destination validation, BASE_URL, exact query/hash and read-only storage');
  set('kianos-politics-last-location-v1',{unit_id:'p',title:'Politics',href:'/study/politics/marxism/ch00/#source-p'});
  set('kianos-xizong-last-location-v1',{meaningfulAction:true,blockTitle:'Block',href:'/study/xizong/circulation/b02/'});
  assert.equal(read('/study/').politics?.title,'Politics');assert.equal(read('/study/').xizong?.title,'Block');
  pass('Existing Politics and Xizong resume outputs are retained');
  return checks;
}
if (process.argv[1]?.endsWith('test-english-resume-contract.mjs')) {
  console.log(JSON.stringify({checks:testEnglishResumeContract(),learnerU:'NOT_TESTED'},null,2));
}
