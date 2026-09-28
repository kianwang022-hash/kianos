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
    'A pilot may improve outcomes for some participants when support is available.',
    'The report does not promise that every participant will benefit.'
  ]},
  questions: [1, 2].map(n => ({question_id:`gq${n}`, ordinal:n, origin:'CHAT_GENERATED',
    response_kind:'single_choice', prompt:`Which statement preserves limitation ${n}?`,
    options:{A:'Every participant benefits.', B:'Some participants may benefit.'}, answer:'B'}))
}, {privateDir:path.join(temp, 'generated')}).drill;
const id = drill.object_id;
const key = `kianos-reading-attempt-v1:${id}`;
const port = Number(process.env.KIANOS_READING_TEST_PORT || 4487);
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
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1512,height:982}});
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
  assert.deepEqual((await attempt()).results, {});
  assert.deepEqual((await attempt()).answers, {gq1:'B'});
  await page.unroute('**/english-generated/answers?*');
  console.log('PASS generated Reading A lifecycle, protected-answer races, metadata and Session/Resume');
  await context.close();

  // Official material uses the same controller with its existing controls/answers.
  const officialContext = await browser.newContext();
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
