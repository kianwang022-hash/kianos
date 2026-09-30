import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { compatibleRevisionWitnesses } from '../src/lib/xizongContentRevision.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildDailyLearningPacket, attachDailySubjectPacket } from '../src/lib/dailyLearningPacket.mjs';
import { captureXizongPrivateCheckpoint, restoreXizongPrivateCheckpoint } from '../src/lib/xizongPrivateCheckpoint.mjs';

// Opt-in transient Content edit in a disposable detached worktree only. The
// Candidate must already be running with the native isolated private/relay env.
// Never start this against main/Stable or a real learner browser profile.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=process.env.KIANOS_XIZONG_TEST_BASE_URL;
assert.equal(process.env.KIANOS_CONTENT_TEST_ALLOW_MUTATION,'1','explicit isolated content-test permission required');
assert.ok(fs.existsSync(path.join(root,'.git')),'separate detached checkout required');
assert.equal(execFileSync('git',['-C',root,'rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8'}).trim(),'HEAD','detached worktree required');
const url=new URL(base);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='4322','native isolated Candidate 4322 only');
assert.notEqual(process.env.KIANOS_XIZONG_BUILD_CACHE,'1','mutable content test cannot reuse immutable-build caches');
const block=loadXizongBlock('circulation','b01');
const nativeNodeWitness=resolveXizongLearnerProjection(block).learnerObject.revisionWitness;
const kpId='circulation-b01-kp24';
const kp=block.kpRecords.find(k=>k.kpId===kpId);
const file=path.join(root,block.sourcePath);
execFileSync('git',['-C',root,'diff','--exit-code','HEAD','--',block.sourcePath]);
const original=fs.readFileSync(file,'utf8');
assert.equal(original.split(kp.prompt).length,2,'one exact canonical Prompt target');
const replacement='工程验收样例｜Content 唯一来源｜非真实学习材料';
const personal='工程验收：个人主提示覆盖';
let changed=original.replace(kp.prompt,replacement);
const studyKey='kianos-xizong-astro-v2:'+block.objectId;
const historyKey='kianos-xizong-memory-review-v2:'+block.objectId;
const report={evidence:'ISOLATED_SYNTHETIC_CONTENT_AND_BROWSER_NOT_LEARNER_U',checks:[],errors:[]};
const check=(ok,name)=>{assert.ok(ok,name);report.checks.push(name);};
class Storage {
  constructor(entries={}){this.map=new Map(Object.entries(entries));}
  get length(){return this.map.size;}
  key(i){return [...this.map.keys()][i]??null;}
  getItem(k){return this.map.get(k)??null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}
fs.mkdirSync('.qa',{recursive:true});
let browser,edited=false;
try {
  browser=await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',e=>report.errors.push(String(e)));
  const route=base+'/xizong/circulation/b01/';
  const ready=()=>page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active'&&Boolean(document.querySelector('[data-xizong-v6-block]')?.getXizongStudyPosition));
  const frame=()=>page.locator('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]');
  const prompt=()=>frame().locator('.xv6KpLearnPrompt p');
  const packet=async()=>{
    await page.waitForFunction(()=>{let value=null;document.querySelector('[data-xizong-v6-block]')?.dispatchEvent(new CustomEvent('kianos:xizong-request-study-packet',{detail:{accept:p=>value=p}}));return Boolean(value);});
    return page.evaluate(()=>{
    let value=null;
    document.querySelector('[data-xizong-v6-block]').dispatchEvent(new CustomEvent('kianos:xizong-request-study-packet',{detail:{accept:p=>value=p}}));
    if(!value)throw Error('native subject Packet was not returned');
    return value;
    });
  };
  await page.goto(route,{waitUntil:'domcontentloaded'});await ready();
  await page.locator('[data-stage-next="logic_group"]').click();
  await frame().waitFor({state:'visible'});
  for(let i=0;i<23;i++) await page.locator('[data-xizong-v6-block] [data-companion-next="source_contact"]').click();
  check(await frame().getAttribute('data-kp-id')===kpId,'exact KP24 visible');
  check(await prompt().innerText()===kp.prompt,'raw canonical equals initial displayed Prompt');
  await frame().locator('[data-kp-prompt-edit]').click();
  await frame().locator('[data-kp-prompt-input]').fill(personal);
  await frame().locator('[data-kp-prompt-save]').click();
  check(await prompt().innerText()===personal,'personal override entered through existing UI');
  // Explicit synthetic prior evidence; not an answer to a real learner task.
  const priorEvent={type:'KP_RECALL',kp_id:kpId,rating:'known',source_hash:block.sourceHash,evidence_origin:'ENGINEERING_ACCEPTANCE_FIXTURE',recorded_at:'2026-09-30T00:00:00Z'};
  await page.evaluate(({studyKey,historyKey,kpId,sourceHash,priorEvent})=>{
    const s=JSON.parse(localStorage.getItem(studyKey));s.learned[kpId]=true;s.ratings[kpId]='known';s.sourceHash=sourceHash;
    localStorage.setItem(studyKey,JSON.stringify(s));
    localStorage.setItem(historyKey,JSON.stringify({evidenceHistory:[priorEvent]}));
  },{studyKey,historyKey,kpId,sourceHash:block.sourceHash,priorEvent});
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  const before=await packet();
  check(before.learning_state.resume.kp_id===kpId,'native Packet exact Resume');
  const evidence=before.kp_evidence.find(k=>k.kp_id===kpId);
  check(evidence.prompt===kp.prompt&&evidence.prompt_override===personal,'Packet distinguishes canonical and personal Prompt');

  fs.writeFileSync(file,changed);edited=true;
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  const payload=JSON.parse(await page.locator('[data-xizong-learner-object-payload]').textContent());
  check(payload.kps.find(k=>k.identity.kpId===kpId).prompt.canonical===replacement,'Content edit reaches native Website payload');
  check(compatibleRevisionWitnesses(payload.revisionWitness,nativeNodeWitness),'rendered Block witness equals current Node System/Home witness');
  const revision=await packet();
  const activeAfter=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(revision.learning_state.resume.kp_id===kpId,'Prompt revision preserves native KP24 Resume');
  check(activeAfter.ratings[kpId]==='known'&&activeAfter.learned[kpId]===true,'Prompt revision preserves active evidence');
  check(JSON.stringify(revision.block_evidence_history)===JSON.stringify(before.block_evidence_history),'history stays active and verbatim');
  check(revision.current.source_hash!==before.current.source_hash&&!revision.current.source_revision_blocked,'Prompt changes artifact version without invalidating current claim');
  const archives=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('kianos-xizong-stale-evidence-v1:')));
  check(archives.length===0,'nonsemantic edit creates no retirement archive');
  report.policyObservation='EVIDENCE_PRESERVING_SELECTIVE_REVALIDATION';
  check(await prompt().innerText()===personal,'Content update preserves personal override');
  const after=await packet();
  const item=after.kp_evidence.find(k=>k.kp_id===kpId);
  check(item.prompt===replacement&&item.prompt_override===personal,'new canonical and retained override reach subject Packet');
  await frame().locator('[data-kp-prompt-edit]').click();
  await frame().locator('[data-kp-prompt-reset]').click();
  check(await prompt().innerText()===replacement,'restore default resolves the NEW canonical Prompt');
  const reset=await packet();
  check(reset.kp_evidence.find(k=>k.kp_id===kpId).prompt_override==='','reset clears override in native Packet');
  const entries=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  const storage=new Storage(entries);
  const daily=attachDailySubjectPacket(buildDailyLearningPacket({storage,day:'2026-09-30',now:Date.parse('2026-09-30T12:00:00Z')}),'xizong',reset);
  check(daily.subjects.xizong.evidence.learning_state.resume.kp_id===kpId,'Daily Packet retains the same exact KP');
  check(daily.subjects.xizong.evidence.current.source_hash===reset.current.source_hash&&!daily.subjects.xizong.evidence.learning_state.block_complete,'Daily Packet retains current version without false completion');
  const checkpoint=captureXizongPrivateCheckpoint(storage);
  const restored=new Storage();restoreXizongPrivateCheckpoint(restored,checkpoint);
  check(restored.getItem(studyKey)===storage.getItem(studyKey),'private checkpoint roundtrip preserves native study state');
  check(restored.getItem(historyKey)===storage.getItem(historyKey),'private checkpoint preserves active history');
  await page.screenshot({path:'.qa/xizong-revision-prompt.png',fullPage:false});
  // A second, explicit synthetic fixture checks a local Core change. It is
  // not medical authoring and is restored with the original bytes in finally.
  const firstKp=block.kpRecords[0];
  await page.evaluate(({studyKey,ids})=>{
    const s=JSON.parse(localStorage.getItem(studyKey));
    s.learned=Object.fromEntries(ids.map(id=>[id,true]));
    s.ratings=Object.fromEntries(ids.map(id=>[id,'known']));
    s.sourceContactDone=true;s.completed=true;s.blockRecallDone=true;
    s.completedAt='2026-09-25T00:00:00Z';s.blockRecallCompletedAt=s.completedAt;
    localStorage.setItem(studyKey,JSON.stringify(s));
    for(const kind of ['system-recall','system-repair-return','system-evidence']) localStorage.setItem(`kianos:xizong:${kind}:circulation:v1`,JSON.stringify({completedAt:s.completedAt,history:[{origin:'SYNTHETIC_ONLY',value:kind}]}));
    localStorage.setItem('kianos:xizong:system-question-sweep:circulation:v1',JSON.stringify({results:{synthetic:{status:'wrong'}},attemptHistory:[{question_id:'synthetic',current_revision_valid:true,origin:'SYNTHETIC_ONLY'}]}));
  },{studyKey,ids:block.kpRecords.map(k=>k.kpId)});
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  const completedBefore=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  const memoryBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')));
  check(Boolean(memoryBefore?.cards?.['core:'+firstKp.kpId]),'existing bridge releases synthetic completed Block once');
  await page.goto(base+'/xizong/circulation/recall/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  const systemBefore=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^kianos:xizong:(system-recall|system-repair-return|system-evidence|system-question-sweep):circulation:v1$/.test(key))));
  const coreText=firstKp.detailMarkdown;
  assert.ok(changed.includes(coreText),'exact Core fixture target');
  changed=changed.replace(coreText,coreText+'\n\n工程验收 synthetic-only：本段答案发生局部变化。');
  fs.writeFileSync(file,changed);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  const systemAfter=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^kianos:xizong:(system-recall|system-repair-return|system-evidence|system-question-sweep):circulation:v1$/.test(key))));
  check(JSON.stringify(systemAfter)===JSON.stringify(systemBefore),'System visit preserves Recall/Repair/ledger/attempts after local Content change');
  await page.goto(base+'/xizong/practice/circulation/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.learnerWriter==='active');
  const practiceAfter=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^kianos:xizong:(system-recall|system-repair-return|system-evidence|system-question-sweep):circulation:v1$/.test(key))));
  check(JSON.stringify(practiceAfter)===JSON.stringify(systemBefore),'Practice entry does not invalidate unrelated official attempts or repair');
  await page.goto(route,{waitUntil:'domcontentloaded'});await ready();
  const medicalPacket=await packet();
  check(medicalPacket.learning_state.resume.kp_id===kpId,'local semantic revision preserves ongoing Resume');
  check(medicalPacket.current.revision_review.impacted_kp_ids.length===1&&medicalPacket.current.revision_review.impacted_kp_ids[0]===firstKp.kpId,'real browser marks only the changed KP');
  const medicalState=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(JSON.stringify(medicalState.ratings)===JSON.stringify(completedBefore.ratings)&&medicalState.completed===true,'local semantic revision keeps raw ratings and completion history');
  const memoryAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('kianos-xizong-memory-v1')));
  check(Boolean(memoryAfter.cards['core:'+firstKp.kpId].contentChangedAt)&&!memoryAfter.cards['core:'+kpId].contentChangedAt,'real Memory bridge limits content-changed debt to changed KP');
  check(JSON.stringify(memoryAfter.evidence)===JSON.stringify(memoryBefore.evidence),'Memory refresh does not manufacture retrieval evidence');
  await page.screenshot({path:'.qa/xizong-revision-local-semantic.png',fullPage:false});
  await page.locator('[data-group-target="0"]').click();
  const recallCard=page.locator('[data-kp-recall-card="0"]');
  await recallCard.waitFor({state:'visible'});
  await recallCard.locator('[data-kp-reveal]').click();
  await recallCard.locator('[data-rating="known"]').click();
  await page.waitForFunction(({key,id})=>!JSON.parse(localStorage.getItem(key)).contentRevision.pendingKp[id],{key:studyKey,id:firstKp.kpId});
  const revalidated=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(revalidated.contentRevision.priorRatings.at(-1).kpId===firstKp.kpId&&revalidated.contentRevision.priorRatings.at(-1).rating==='known','native Reveal/rating preserves prior evidence and clears exactly the changed KP');
  // Native UI action for a changed LG closure, using a synthetic prior witness.
  await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).groupIndex===1,studyKey);
  const groupId=payload.logicGroups[0].identity.logicGroupId;
  await page.evaluate(({key,groupId})=>{const s=JSON.parse(localStorage.getItem(key));s.contentRevision.witness.groups[groupId]='synthetic-prior-closure';s.stage='block_recall';s.groupIndex=0;s.kpIndex=0;localStorage.setItem(key,JSON.stringify(s));},{key:studyKey,groupId});
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  const closureResume=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(closureResume.stage==='block_recall','changed LG resumes the existing Recall surface');
  await page.locator('[data-block-recall-reveal]').click();
  check(await page.locator('[data-revision-group]:visible').count()===1,'existing Block Recall reveals only changed LG closure');
  await page.locator('[data-block-recall-complete]').click();
  const groupReviewed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(!groupReviewed.contentRevision.pendingGroup[groupId]&&groupReviewed.blockRecallCompletedAt===completedBefore.blockRecallCompletedAt,'LG revalidation preserves historical Block Recall time');
  // A reordered prior snapshot must restore the identity, not its old index.
  await page.evaluate(({key,kpId})=>{const s=JSON.parse(localStorage.getItem(key));const w=s.contentRevision.witness;w.kpOrder=[kpId,...w.kpOrder.filter(id=>id!==kpId)];s.resumeKpId=kpId;s.kpIndex=0;s.stage='source_contact';localStorage.setItem(key,JSON.stringify(s));},{key:studyKey,kpId});
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  check((await packet()).learning_state.resume.kp_id===kpId&&await frame().getAttribute('data-kp-id')===kpId,'browser topology migration restores stable KP24 identity');
  const beforeLegacy=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));delete s.contentRevision;delete s.resumeKpId;delete s.resumeGroupId;localStorage.setItem(key,JSON.stringify(s));},studyKey);
  await page.reload({waitUntil:'domcontentloaded'});await ready();
  const legacyPacket=await packet();const legacyAfter=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),studyKey);
  check(legacyPacket.current.revision_review.current_claim==='UNKNOWN'&&legacyPacket.learning_state.resume.kp_id===kpId,'legacy without semantic baseline keeps Resume and exposes UNKNOWN');
  check(legacyAfter.stage===beforeLegacy.stage&&JSON.stringify(legacyAfter.ratings)===JSON.stringify(beforeLegacy.ratings)&&legacyAfter.completedAt===beforeLegacy.completedAt,'legacy browser migration does not reopen whole Block or erase completion history');
  report.medicalFixtureChangedKp=firstKp.kpId;
  report.transientContentPath=block.sourcePath;
  assert.deepEqual(report.errors,[]);
  check(true,'browser pageerror zero');
  report.status='PASS';
} catch(error) {
  report.status='FAIL';report.error=String(error.stack||error);throw error;
} finally {
  try { await browser?.close(); } finally {
  if(edited){
    assert.equal(fs.readFileSync(file,'utf8'),changed,'unexpected concurrent content edit: do not overwrite');
    fs.writeFileSync(file,original);
  }
  }
  fs.mkdirSync('.qa',{recursive:true});
  report.contentRestored=fs.readFileSync(file,'utf8')===original;
  fs.writeFileSync('.qa/xizong-content-roundtrip-browser.json',JSON.stringify(report,null,2)+'\n');
}
console.log(`PASS Content→Website→subject/Daily Packet→private checkpoint: ${report.checks.length} checks; original Content restored.`);
