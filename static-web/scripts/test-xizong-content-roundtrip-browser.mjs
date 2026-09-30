import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildDailyLearningPacket, attachDailySubjectPacket } from '../src/lib/dailyLearningPacket.mjs';
import { captureXizongPrivateCheckpoint, restoreXizongPrivateCheckpoint } from '../src/lib/xizongPrivateCheckpoint.mjs';

// Opt-in transient Content edit in a disposable detached worktree only. The
// Candidate must already be running with the native isolated private/relay env.
// Never start this against main/Stable or a real learner browser profile.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=process.env.KIANOS_XIZONG_TEST_BASE_URL;
assert.equal(process.env.KIANOS_CONTENT_TEST_ALLOW_MUTATION,'1','explicit isolated content-test permission required');
assert.ok(fs.lstatSync(path.join(root,'.git')).isFile(),'separate worktree required');
assert.equal(execFileSync('git',['-C',root,'rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8'}).trim(),'HEAD','detached worktree required');
const url=new URL(base);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='4322','native isolated Candidate 4322 only');
assert.notEqual(process.env.KIANOS_XIZONG_BUILD_CACHE,'1','mutable content test cannot reuse immutable-build caches');
const block=loadXizongBlock('circulation','b01');
const kpId='circulation-b01-kp24';
const kp=block.kpRecords.find(k=>k.kpId===kpId);
const file=path.join(root,block.sourcePath);
execFileSync('git',['-C',root,'diff','--exit-code','HEAD','--',block.sourcePath]);
const original=fs.readFileSync(file,'utf8');
assert.equal(original.split(kp.prompt).length,2,'one exact canonical Prompt target');
const replacement='工程验收样例｜Content 唯一来源｜非真实学习材料';
const personal='工程验收：个人主提示覆盖';
const changed=original.replace(kp.prompt,replacement);
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
  const packet=()=>page.evaluate(()=>{
    let value=null;
    document.querySelector('[data-xizong-v6-block]').dispatchEvent(new CustomEvent('kianos:xizong-request-study-packet',{detail:{accept:p=>value=p}}));
    if(!value)throw Error('native subject Packet was not returned');
    return value;
  });
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
  // The existing evidence guard treats any block Content hash change as a
  // new version: old state is archived, not reused as current mastery. This
  // is an observed product policy, not permission to silently relax it here.
  await page.waitForFunction(()=>document.querySelector('[data-xizong-v6-block]')?.getXizongStudyPosition()?.stage==='block_learn');
  const revision=await packet();
  const archived=await page.evaluate(({objectId})=>{
    const keys=Object.keys(localStorage).filter(k=>k.startsWith('kianos-xizong-stale-evidence-v1:'+objectId+':')).sort();
    const key=keys.at(-1);return key?{key,raw:localStorage.getItem(key),value:JSON.parse(localStorage.getItem(key))}:null;
  },{objectId:block.objectId});
  check(Boolean(archived),'prior Content evidence archived before restart');
  check(archived.value.study.kpIndex===23&&archived.value.study.ratings[kpId]==='known','archive preserves prior KP and rating');
  check(JSON.stringify(archived.value.extension.evidenceHistory)===JSON.stringify(before.block_evidence_history),'historical Recall retained verbatim in archive');
  check(revision.current.source_hash!==before.current.source_hash&&!revision.learning_state.block_complete,'new Content has new version without inherited completion');
  check(!revision.learning_state.recall_ratings[kpId],'archived Recall is not relabeled current evidence');
  report.policyObservation='ANY_BLOCK_CONTENT_HASH_CHANGE_ARCHIVES_ACTIVE_EVIDENCE_AND_RESTARTS_BLOCK';
  report.nonDisruptivePromptOnlyEdit='NOT_SATISFIED_BY_EXISTING_POLICY; semantic decision needed, not silently changed';
  await page.locator('[data-stage-next="logic_group"]').click();
  await frame().waitFor({state:'visible'});
  for(let i=0;i<23;i++)await page.locator('[data-xizong-v6-block] [data-companion-next="source_contact"]').click();
  check(await frame().getAttribute('data-kp-id')===kpId,'explicit reentry uses native KP24');
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
  check(restored.getItem(archived.key)===archived.raw,'private checkpoint preserves historical evidence archive');
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
