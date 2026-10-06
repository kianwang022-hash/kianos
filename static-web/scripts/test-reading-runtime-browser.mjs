import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {ENGLISH_GENERATED_DRILL_SCHEMA, ENGLISH_GENERATED_TASKS, writeEnglishGeneratedDrill} from './privateEnglishGeneratedDrillStore.mjs';
import {listReadingSets, loadReadingById} from '../src/lib/englishReadingSourceTruth.mjs';
import {listClozeSets} from '../src/lib/englishObjective.mjs';
import {buildDailyLearningPacketFromPrivateCheckpoint} from './privateDailyLearningPacket.mjs';
import {buildEnglishEvidencePacket, ENGLISH_SESSION_KEY} from '../src/lib/englishSessionControl.mjs';

// Guard the ownership boundary as well as exercising the real Astro consumers.
const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
for (const name of ['ReadingWorkspace', 'GeneratedReadingAWorkspace']) {
  const source = read(`../src/components/${name}.astro`);
  assert.match(source, /initReadingRuntime/);
  assert.doesNotMatch(source, /saveEnglishAttempt|inspectEnglishAttempt|state\.submitted|state\.results/);
}
const generatedCloze = read('../src/components/GeneratedClozeWorkspace.astro');
assert.match(generatedCloze, /initClozeRuntime/);
assert.doesNotMatch(generatedCloze, /saveEnglishAttempt|inspectEnglishAttempt|state\.submitted|state\.results/);
assert.deepEqual(ENGLISH_GENERATED_TASKS, ['external_reading', 'reading_a', 'cloze']);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-reading-runtime-'));
const day = '2026-09-28';
const drill = writeEnglishGeneratedDrill({
  schema: ENGLISH_GENERATED_DRILL_SCHEMA,
  object_id: `external-chat-${day}-reading-runtime-proof`, study_day: day,
  generated_at: `${day}T00:00:00Z`, origin: 'CHAT_GENERATED_SYNTHETIC', task: 'reading_a',
  evidence_role: 'TRANSFER', transfer_independence: {status:'PASS', basis:'CHAT_SELF_ATTACK'},
  calibration_status: 'NOT_SCORE_EQUIVALENT', completion_requirement: 'QUESTIONS_SUBMITTED',
  training_target: {kind:'reading_scope_transfer', note:'Bounded shared Reading runtime proof.'},
  passage: {title:'Shared runtime proof', paragraphs:[
    'A pilot may improve outcomes for some participants when support is available. A pilot is bounded.',
    'The report does not promise that every participant will benefit.'
  ]},
  questions: [1, 2].map(n => ({question_id:`gq${n}`, ordinal:n, origin:'CHAT_GENERATED',
    response_kind:'single_choice', prompt:`Which statement preserves limitation ${n}?`,
    options:{A:'Every participant benefits.', B:'Some participants may benefit.'}, answer:'B'}))
}, {privateDir:path.join(temp, 'generated')}).drill;
const id = drill.object_id;
const key = `kianos-reading-attempt-v1:${id}`;
const port = Number(process.env.KIANOS_READING_TEST_PORT || 4487);
assert.notEqual(port,4321,'isolated QA must never use Stable');
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)], {
  cwd:process.cwd(), detached:true, stdio:['ignore','pipe','pipe'],
  env:{...process.env, KIANOS_ASTRO_RUNTIME_ROOT:temp, KIANOS_ENGLISH_GENERATED_DIR:path.join(temp,'generated')}
});
let log = '';
server.stdout.on('data', c => log += c);
server.stderr.on('data', c => log += c);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
class Storage {
  constructor(entries) { this.entries = entries; }
  get length() { return Object.keys(this.entries).length; }
  key(index) { return Object.keys(this.entries)[index] ?? null; }
  getItem(key) { return this.entries[key] ?? null; }
}
let browser;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/reading-generated/`)).ok) break; } catch {}
    if (server.exitCode !== null || i >= 120) throw new Error(`Reading server unavailable: ${log.slice(-2000)}`);
    await delay(250);
  }
  browser = await chromium.launch({headless:true,...(process.env.KIANOS_TEST_CHROME?{executablePath:process.env.KIANOS_TEST_CHROME}:{})});
  const context = await browser.newContext({viewport:{width:1512,height:982},permissions:['clipboard-read','clipboard-write']});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const attempt = (storageKey = key) => page.evaluate(k => JSON.parse(localStorage.getItem(k)), storageKey);
  const snapshot = () => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const catalog = [{task:'reading_a', object_id:id, source_hash:drill.content_hash}];
  const packet = async () => buildEnglishEvidencePacket(new Storage(await snapshot()), {day, catalog});
  let answerRequests = 0;
  page.on('request', request => { if (request.url().includes('/english-generated/answers?')) answerRequests++; });
  const url = `${base}/reading-generated/?id=${id}`;
  await page.addInitScript(()=>{
    window.readingEvents=[];
    window.addEventListener('kianos:english-reading-evidence',event=>window.readingEvents.push(event.detail.kind));
  });
  await page.goto(url);
  await page.locator('[data-generated-reading-a]:not([hidden])').waitFor();
  const continuousSentinel = {version:1, active:true, items:[{id:'official-sentinel'}], reviewIds:[]};
  await page.evaluate(({sessionKey, id, hash, day, continuousSentinel}) => {
    localStorage.setItem('kianos-reading-continuous-session-v1', JSON.stringify(continuousSentinel));
    localStorage.setItem(sessionKey, JSON.stringify({schema:'kianos.english.session-instruction.v1',
      session_id:'reading-runtime-session', study_day:day, generated_at:`${day}T00:00:00Z`, current_step:0,
      steps:[{step_id:'generated', task:'reading_a', object_id:id, source_hash:hash, label:'Shared Reading proof'}],
      return_policy:{on_finish:'english_home'}}));
  }, {sessionKey:ENGLISH_SESSION_KEY, id, hash:drill.content_hash, day, continuousSentinel});
  assert.equal((await packet()).resume.href, `/reading-generated/?id=${id}`);
  const rows = page.locator('[data-generated-reading-questions] > [data-question]');
  assert.deepEqual(await rows.evaluateAll(nodes => nodes.map(n => n.dataset.question)), ['gq1','gq2']);
  assert.deepEqual(await page.locator('[data-generated-reading-paragraphs] p').allTextContents(), drill.passage.paragraphs);
  for (const row of await rows.all()) assert(await row.isVisible());
  assert.equal(answerRequests, 0);
  assert.equal(await page.locator('[data-generated-reading-questions] [data-answer]').count(), 0);
  // Real selection menu: explicit saved intent, no clipboard requirement.
  const selectPassage = async (start=0,end=7) => {
    await page.evaluate(({start,end})=>{
      const paragraph=document.querySelector('[data-generated-reading-paragraphs] p');
      const walker=document.createTreeWalker(paragraph,NodeFilter.SHOW_TEXT);
      const text=walker.nextNode(),range=document.createRange();range.setStart(text,start);range.setEnd(text,end);
      const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
      paragraph.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
    },{start,end});
    await page.locator('[data-english-selection-menu]:visible').waitFor();
  };
  await selectPassage(0,7);
  await page.locator('[data-selection-chat]').click();
  await page.locator('[data-selection-chat]').click();
  assert.equal((await attempt()).discussionSpans.length,1,'duplicate explicit add is idempotent');
  assert.equal((await attempt()).discussionSpans[0].text,'A pilot');
  assert.equal(await page.evaluate(()=>CSS.highlights.get('kianos-reading-discussion')?.size),1);
  assert.equal(answerRequests,0);
  assert.deepEqual((await packet()).inventory[0].question_outcomes,[]);
  assert.equal((await packet()).inventory[0].discussion_spans[0].text,'A pilot');
  await page.locator('[data-reading-discussion-panel] summary').click();
  assert.equal(await page.locator('[data-reading-discussion-span]').textContent(),'A pilot移除');
  await page.locator('[data-reading-discussion-remove]').click();
  const repeatedStart=drill.passage.paragraphs[0].indexOf('A pilot',1);
  await selectPassage(repeatedStart,repeatedStart+7);
  await page.locator('[data-selection-chat]').click();
  assert.equal((await attempt()).discussionSpans[0].start,repeatedStart,'repeat text anchors exact second occurrence');
  assert.equal(await page.evaluate(()=>[...CSS.highlights.get('kianos-reading-discussion')][0].startOffset),repeatedStart);
  await page.locator('[data-reading-discussion-remove]').click();
  await selectPassage(0,7);
  await page.locator('[data-selection-chat]').click();
  if(process.env.KIANOS_READING_PROOF_SCREENSHOT) {
    await page.locator('[data-reading-discussion-panel] summary').click();
    await page.screenshot({path:process.env.KIANOS_READING_PROOF_SCREENSHOT});
  }
  // Single-token lookup uses real Vocabulary navigation and native return control.
  await selectPassage(2,7);
  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL('**/vocabulary/**');
  await page.locator('[data-english-return-action]').click();
  await page.waitForURL(url);
  await page.locator('[data-generated-reading-a]:not([hidden])').waitFor();
  await page.waitForFunction(()=>CSS.highlights.get('kianos-reading-discussion')?.size===1);
  assert.equal((await attempt()).discussionSpans[0].text,'A pilot');
  assert.equal((await attempt()).lookupEvents[0].token,'pilot');
  await page.reload();
  await page.locator('[data-generated-reading-a]:not([hidden])').waitFor();
  await page.waitForFunction(()=>CSS.highlights.get('kianos-reading-discussion')?.size===1);
  // DOM re-render preserves product-owned highlight, native selection is gone.
  await page.evaluate(()=>{
    getSelection().removeAllRanges();
    const p=document.querySelector('[data-generated-reading-paragraphs] p');p.replaceChildren(document.createTextNode(p.textContent));
  });
  await page.waitForFunction(()=>{const ranges=[...CSS.highlights.get('kianos-reading-discussion')||[]];return ranges.length===1&&ranges[0].toString()==='A pilot';});

  const discussionBefore=await page.evaluate(k=>localStorage.getItem(k),key);
  await page.evaluate(()=>document.querySelector('[data-local-port="reading"]').setAttribute('data-english-source-hash','mismatched-source'));
  await page.waitForFunction(()=>!CSS.highlights.has('kianos-reading-discussion'));
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),discussionBefore,'source mismatch keeps native historical evidence');
  await page.evaluate(hash=>document.querySelector('[data-local-port="reading"]').setAttribute('data-english-source-hash',hash),drill.content_hash);
  await page.waitForFunction(()=>CSS.highlights.get('kianos-reading-discussion')?.size===1);

  await rows.nth(0).locator('[data-option="A"]').click();
  await rows.nth(0).locator('[data-option="B"]').click();
  await rows.nth(0).locator('.portedUncertain').click();
  await rows.nth(1).locator('[data-option="A"]').click();
  const before = await attempt();
  assert.deepEqual(before.answers, {gq1:'B', gq2:'A'});
  assert.deepEqual(before.uncertain, ['gq1']);
  assert.deepEqual(before.trajectory.gq1.map(step => step.answer), ['A','B']);
  await page.reload();
  await page.locator('[data-generated-reading-a]:not([hidden])').waitFor();
  assert.equal(answerRequests, 0, 'unfinished recovery must not load answers');
  assert.deepEqual((await attempt()).answers, before.answers);
  for (const row of await rows.all()) assert(await row.isVisible());

  // Hold the protected response to exercise duplicate submit / edit / reset races.
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/english-generated/answers?*', async route => { await gate; await route.continue(); });
  await page.locator('[data-reading-submit]').click();
  await page.waitForFunction(() => document.querySelector('[data-reading-reset]').disabled);
  await page.locator('[data-reading-submit]').dispatchEvent('click');
  await page.locator('[data-reading-reset]').dispatchEvent('click');
  await rows.nth(1).locator('[data-option="B"]').dispatchEvent('click');
  assert.equal((await attempt()).submitted, false);
  assert.deepEqual((await attempt()).answers, before.answers);
  assert.equal(await page.locator('[data-reading-answer-strip]:visible').count(), 0);
  release();
  await page.locator('[data-reading-result]:not([hidden])').waitFor();
  assert.equal(answerRequests, 1);
  assert.equal(await page.locator('[data-reading-score]').textContent(), '1 / 2');
  assert.deepEqual(await rows.locator('[data-reading-formal-answer]').allTextContents(), ['B','B']);
  const submitted = await attempt();
  assert.deepEqual(submitted.results, {gq1:'correct', gq2:'wrong'});
  assert.equal(submitted.history.length, 1);
  const native=(await packet()).inventory.find(row=>row.object_id===id);
  assert.equal(native.question_outcomes[0].final_answer,'B');
  assert.deepEqual(native.question_outcomes[0].trajectory.map(step=>step.answer),['A','B']);
  assert.equal(native.question_outcomes[1].result,'wrong');
  assert.equal(native.discussion_spans[0].text,'A pilot');
  assert.equal(await page.evaluate(()=>window.readingEvents.filter(kind=>kind==='submit').length),1,'successful submit only emits once');
  // Real private API contains the same native learner bytes (isolated scratch root).
  await page.waitForFunction(async ({key})=>{
    const response=await fetch('/__kianos-private/checkpoint');
    const data=await response.json();
    const raw=data.checkpoint?.payload?.subjects?.english?.entries?.[key];
    if(!raw)return false;
    const attempt=JSON.parse(raw);
    return attempt.submitted===true&&attempt.answers?.gq1==='B'&&attempt.discussionSpans?.[0]?.text==='A pilot';
  },{key});
  const durable=await page.evaluate(async()=> (await (await fetch('/__kianos-private/checkpoint')).json()).checkpoint);
  const relayOutput=buildDailyLearningPacketFromPrivateCheckpoint(durable,{englishCatalog:catalog});
  // A fresh reader consumes the existing normal transport projection, no manual handoff.
  const freshReader=JSON.parse(JSON.stringify(relayOutput.packet)).subjects.english.evidence.inventory.find(row=>row.object_id===id);
  assert.deepEqual(freshReader.question_outcomes,native.question_outcomes);
  assert.deepEqual(freshReader.discussion_spans,native.discussion_spans);
  assert.equal(freshReader.source_hash,drill.content_hash);

  assert.equal(submitted.binding.attempt_id, before.binding.attempt_id);
  assert.equal(submitted.binding.source_hash, drill.content_hash);
  assert.equal(submitted.binding.semantic_source_hash, drill.content_hash);
  assert.equal(submitted.binding.source_kind, 'generated');
  assert.equal(submitted.binding.evidence_role, drill.evidence_role);
  assert.deepEqual(submitted.binding.generated_transfer_independence, drill.transfer_independence);
  assert.equal(submitted.binding.calibration_status, drill.calibration_status);
  assert.equal(submitted.binding.question_origin, 'CHAT_GENERATED');
  assert.equal(submitted.binding.source_snapshot.completion_requirement, drill.completion_requirement);
  assert.deepEqual(submitted.binding.source_snapshot.training_target, drill.training_target);
  assert.equal((await packet()).forecast_progress.completed_steps, 1);
  assert.deepEqual(JSON.parse((await snapshot())['kianos-reading-continuous-session-v1']), continuousSentinel);
  await page.reload();
  await page.locator('[data-generated-reading-a]:not([hidden])').waitFor();
  assert.equal(answerRequests, 2, 'submitted recovery reloads protected answers');
  const restored = await attempt();
  for (const field of ['answers','uncertain','trajectory','submitted','submittedAt','results','history','firstEvidenceMeta']) {
    assert.deepEqual(restored[field], submitted[field], `exact restoration: ${field}`);
  }
  assert.equal(restored.binding.attempt_id, submitted.binding.attempt_id);
  assert.equal(await page.locator('[data-reading-score]').textContent(), '1 / 2');
  for (const row of await rows.all()) assert(await row.isVisible());
  await page.unroute('**/english-generated/answers?*');

  // A mismatched protected revision cannot overwrite or grade the attempt.
  await page.locator('[data-reading-reset]').click();
  assert.notEqual((await attempt()).binding.attempt_id, submitted.binding.attempt_id);
  assert.equal((await attempt()).firstEvidenceMeta, undefined);
  assert.deepEqual(await rows.locator('[data-reading-formal-answer]').allTextContents(), ['—','—']);
  await rows.nth(0).locator('[data-option="B"]').click();
  await page.route('**/english-generated/answers?*', route => route.fulfill({json:{answers:{content_hash:'wrong-revision',generated_task:'reading_a',answers:{gq1:'B',gq2:'B'}}}}));
  await page.locator('[data-reading-submit]').click();
  await page.locator('[data-english-recovery-error]').waitFor();
  const recoveryText = await page.locator('[data-english-recovery-error]').innerText();
  assert.match(recoveryText, /学习记录已保留/);
  assert.doesNotMatch(recoveryText, /(?:ENGLISH|KIANOS)_[A-Z0-9_]+/);
  assert.equal((await attempt()).submitted, false);
  assert.equal(await page.evaluate(()=>window.readingEvents.filter(kind=>kind==='submit').length),0,'failed protected submit emits no success event');
  assert.deepEqual((await attempt()).results, {});
  assert.deepEqual((await attempt()).answers, {gq1:'B'});
  await page.unroute('**/english-generated/answers?*');
  console.log('PASS generated Reading A lifecycle, protected-answer races, metadata and Session/Resume');
  await context.close();
  // Each stage gets a fresh disposable private fixture; prior synthetic continuous
  // sessions must not be recovered into the independent official regression.
  fs.rmSync(path.join(temp,'learner-state'),{recursive:true,force:true});

  // Official material uses the same controller with its existing controls/answers.
  const officialContext = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const officialPage = await officialContext.newPage();
  officialPage.on('pageerror', error => errors.push(error.message));
  const official = loadReadingById(listReadingSets()[0].id);
  const officialKey = `kianos-reading-attempt-v1:${official.objectId}`;
  await officialPage.goto(`${base}/reading/${official.objectId}/`);
  const officialRows = officialPage.locator('[data-local-port="reading"] [data-question]');
  await officialRows.first().waitFor();
  assert.equal(await officialRows.count(), official.questions.length);
  for (const row of await officialRows.all()) assert(await row.isVisible());
  await officialRows.nth(0).locator('[data-option]').first().click();
  await officialRows.nth(0).locator('.portedUncertain').click();
  await officialRows.nth(1).locator('[data-option]').first().click();
  await officialPage.locator('[data-reading-continuous]').click();
  await officialPage.locator('[data-reading-submit]').click();
  await officialPage.locator('[data-reading-result]:not([hidden])').waitFor();
  assert.equal(await officialPage.locator('[data-reading-score]').textContent(), '已收卷');
  const officialState = await officialPage.evaluate(k => JSON.parse(localStorage.getItem(k)), officialKey);
  assert.equal(officialState.binding.source_kind, 'official');
  assert.equal(officialState.submitted, true);
  assert.equal(Object.keys(officialState.answers).length, 2);
  await officialPage.reload();
  await officialPage.locator('[data-reading-result]:not([hidden])').waitFor();
  assert.equal(await officialPage.locator('[data-reading-score]').textContent(), '已收卷');
  await officialPage.locator('[data-reading-session-review]').click();
  await officialPage.waitForURL('**?reviewSession=1');
  await officialPage.waitForFunction(() => document.querySelector('[data-reading-score]')?.textContent !== '已收卷');
  const localRepair = officialPage.locator('[data-reading-repair]:visible').first();
  await localRepair.waitFor();
  assert.equal(await localRepair.evaluate(node => node.open), false, 'quick-cause/local coach must be collapsed by default');
  assert.equal(await officialPage.locator('[data-reading-passage-copy-chat]:visible').count(), 1, 'whole-passage Chat escalation stays directly reachable');
  assert.equal(await officialPage.locator('.objectiveTransferPanel:visible').count(), 0, 'machine-readable Chat return must stay off ordinary problem review');
  assert.equal(await localRepair.locator('[data-cause]:visible').count(), 0, 'quick-cause choices must not sit on the default review path');
  await localRepair.locator('summary').click();
  assert((await localRepair.locator('[data-cause]:visible').count()) >= 4, 'optional local inspection remains available when explicitly opened');
  const officialRestored = await officialPage.evaluate(k => JSON.parse(localStorage.getItem(k)), officialKey);
  for (const field of ['answers','results','uncertain','trajectory','submittedAt']) assert.deepEqual(officialRestored[field], officialState[field]);
  assert.equal(officialRestored.binding.attempt_id, officialState.binding.attempt_id);
  for (const row of await officialRows.all()) assert(await row.isVisible());

  await officialPage.locator('[data-reading-passage-copy-chat]').click();
  const manual=await officialPage.evaluate(()=>navigator.clipboard.readText());
  const manualOutcomes=JSON.parse(manual.split('BOUNDED LEARNER OUTCOMES\n')[1].split('\n\nSAVED DISCUSSION CONTEXT')[0]);
  const nativeOfficial=buildEnglishEvidencePacket(new Storage(await officialPage.evaluate(()=>Object.fromEntries(Object.entries(localStorage)))),{
    day,catalog:[{task:'reading_a',object_id:official.objectId,source_hash:officialState.binding.source_hash}]
  }).inventory.find(row=>row.object_id===official.objectId);
  assert.deepEqual(manualOutcomes,nativeOfficial.question_outcomes,'real manual clipboard/native packet agreement');

  // Cloze is regression only: native answer / uncertain / submit / reload.
  const clozeId = listClozeSets()[0].id;
  await officialPage.goto(`${base}/cloze/${clozeId}/`);
  await officialPage.locator('[data-cloze-option]').first().click();
  await officialPage.locator('[data-cloze-uncertain]').click();
  await officialPage.locator('[data-objective-submit]').click();
  await officialPage.locator('[data-objective-result-summary]:not([hidden])').waitFor();
  assert.equal(await officialPage.locator('.objectiveHandoff:visible').count(), 1, 'Cloze keeps one optional whole-context Chat escalation');
  assert.equal(await officialPage.locator('.objectiveTransferPanel:visible').count(), 0, 'Cloze machine-readable return stays hidden before explicit escalation');
  const clozeKey = `kianos-cloze-attempt-v1:${clozeId}`;
  const cloze = await officialPage.evaluate(k => JSON.parse(localStorage.getItem(k)), clozeKey);
  await officialPage.reload();
  await officialPage.locator('[data-objective-result-summary]:not([hidden])').waitFor();
  const clozeRestored = await officialPage.evaluate(k => JSON.parse(localStorage.getItem(k)), clozeKey);
  for (const field of ['answers','results','uncertain','submittedAt']) assert.deepEqual(clozeRestored[field], cloze[field]);
  assert.equal(clozeRestored.binding.attempt_id, cloze.binding.attempt_id);
  assert.deepEqual(errors, []);
  await officialContext.close();
  console.log('PASS shared Reading A: generated whole-set / protected submit / reload / races / metadata / Session-Resume; official continuous review; Cloze regression');
} finally {
  await browser?.close();
  if (server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit');
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    await exited;
  }
  fs.rmSync(temp, {recursive:true, force:true});
}
