// Real page + private command endpoint + checkpoint; synthetic learner and Chat decisions only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { publishPrivateControlCommand } from './privateControlStore.mjs';
import { readPrivateLearnerCheckpoint } from './privateLearnerStore.mjs';
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-tomorrow-'));
const port = 4495, base = `http://127.0.0.1:${port}`, day = '2026-09-24';
const timeOffset = Date.parse(day + 'T08:30:00+08:00') - Date.now();
const out = path.resolve('output/playwright/lexical-tomorrow'); fs.mkdirSync(out, { recursive: true });
const env = { ...process.env, KIANOS_PRIVATE_DIR: temp, KIANOS_CONTROL_DIR: temp + '/control',
  KIANOS_PACKET_RELAY_ENABLED: '0', KIANOS_CONTROL_ENABLED: '0', KIANOS_EXTERNAL_READING_DIR: temp + '/external',
  KIANOS_EXTERNAL_READING_SOURCE_ROOT: temp + '/missing', KIANOS_ENGLISH_GENERATED_DIR: temp + '/generated' };
let server, browser, serverLog = '';
const checks = [], errors = [];
const check = (condition, name) => { assert.ok(condition, name); checks.push(name); console.log('PASS', name); };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ledgerKey = 'kianos-lexical-evidence-ledger-v2', progressKey = 'kianos-lexical-challenge-progress-v1';
async function startServer() {
  server = spawn('npm', ['run','dev','--','--host','127.0.0.1','--port',String(port)], { env, detached: true, stdio: ['ignore','ignore','pipe'] });
  server.stderr.on('data', chunk => { serverLog += chunk; });
  for (let i = 0; i < 150; i++) { try { if ((await fetch(base)).ok) return; } catch {} await pause(200); }
  throw new Error(serverLog);
}
function stopServer() { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
async function context() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Shanghai' });
  ctx.setDefaultTimeout(20000);
  await ctx.addInitScript(offset => {
    const NativeDate = Date;
    window.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [NativeDate.now() + offset])); } static now() { return NativeDate.now() + offset; } };
  }, timeOffset);
  return ctx;
}
async function goto(page, route) { await page.goto(base + route, { waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active'); }
async function packet(page) {
  return page.evaluate(async day => {
    const { buildHomeDailyLearningPacket } = await import('/src/lib/dailyLearningPacketRuntime.mjs');
    return buildHomeDailyLearningPacket({ storage: localStorage, day, now: Date.now() });
  }, day);
}
async function planCommand(page, id, label, generatedAt) {
  const state = await packet(page);
  return { schema: 'kianos.control-command.v1', command_id: id, study_day: day, generated_at: generatedAt,
    operations: [{ kind: 'exam.chat_plan', payload: { schema: 'kianos.exam.chat-plan.v1', study_day: day,
      generated_at: generatedAt, learner_evidence_basis: state.packet.learner_evidence_basis,
      subjects: { xizong: null, english: null, politics: null }, next_subject: null,
      presentation: { today_tasks: [{ id: 'morning', label }], schedule_blocks: [{ id: 'block', start: '09:00', end: '10:00', label }] } } }] };
}
function publish(command) { return publishPrivateControlCommand(command, { privateDir: temp + '/control', generatedDir: temp + '/generated' }); }
async function applied(page, id) {
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('kianos-control-receipt-v1') || 'null')?.command_id === id, id, { timeout: 20000 });
}
try {
  await startServer(); browser = await chromium.launch({ headless: true });
  const ctx = await context(), page = await ctx.newPage(); page.on('pageerror', error => errors.push(error.message));
  await goto(page, '/'); await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  const initial = await packet(page);
  check(initial.packet.total_minutes === 0 && initial.coverage.english === 'unknown', 'first daily entry invents no learning');
  const first = await planCommand(page, 'tomorrow-morning-001', '上午先熟悉英语学习', day + 'T00:29:00Z');
  publish(first); await applied(page, first.command_id);
  check(await page.getByRole('checkbox', { name: '完成：上午先熟悉英语学习', exact: true }).isVisible(), 'morning plan arrives through normal endpoint');
  await goto(page, '/vocabulary/4/'); await page.locator('[data-vocab-reveal]').click();
  await page.locator('[data-vocab-route="fuzzy"]').click(); await page.waitForURL(/\/vocabulary\/5\/$/);
  await goto(page, '/vocabulary/');
  check((await page.locator('[data-lexical-repair-count]').first().innerText()).trim() === '0', 'Fuzzy creates no durable Repair');
  await goto(page, '/vocabulary/4/');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const word = page.locator('[data-local-port="vocabulary"]'), plus = page.locator('[data-vocab-repair]').first();
  const targetId = await plus.getAttribute('data-target-id');
  const target = { word_id: await word.getAttribute('data-vocab-object'), ordinal: 4, word: await word.getAttribute('data-vocab-word'),
    target_kind: await plus.getAttribute('data-target-kind'), target_id: targetId || null,
    target_locator: await plus.getAttribute('data-target-locator'), target_revision: targetId ? null : await word.getAttribute('data-vocab-source-hash') };
  await plus.click(); await goto(page, '/vocabulary/');
  const onlyLexical = await packet(page), lexical = onlyLexical.packet.subjects.english.evidence.lexical.chat_state.packet;
  check(onlyLexical.coverage.english === 'attached' && lexical.repair.active_target_count === 1 && lexical.routing.latest_counts.fuzzy === 1,
    'automatic Chat evidence includes exact Repair and whole-card routing without Reading attempts');
  let receiptAvailable = false;
  await ctx.route('**/__kianos-private/control/receipt', route => receiptAvailable ? route.continue() : route.fulfill({ status: 503, json: { status: 'unavailable' } }));
  const question = { challenge_id: 'tomorrow-lexical-question', ...target, question_type: 'spatial_choice', stem: '隔离练习：选择正确边界。',
    options: [{ key: 'left', text: '错误边界' }, { key: 'right', text: '正确边界' }], correct_key: 'right', repair: '只修这一处边界。',
    reconstruction: { stem: '换个语境再确认。', options: [{ key: 'left', text: '错误边界' }, { key: 'right', text: '正确边界' }], correct_key: 'right' } };
  const command = { schema: 'kianos.control-command.v1', command_id: 'tomorrow-challenge-002', study_day: day, generated_at: day + 'T00:29:10Z',
    operations: [{ kind: 'lexical.challenge', payload: { schema: 'kianos.lexical.challenge_packet.v1', study_day: day,
      generated_at: day + 'T00:29:10Z', challenges: [question] } }] };
  publish(command); await applied(page, command.command_id);
  await page.locator('[data-lexical-tab="repair"]').click(); await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  check((await page.locator('[data-challenge-stem]').innerText()).includes('隔离练习'), 'Chat Challenge arrives without paste');
  await page.locator('[data-challenge-choice="left"]').click();
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-continue]').waitFor({ state: 'visible' });
  check((await page.locator('[data-challenge-feedback]').innerText()).includes('只修这一处'), 'refresh after answer restores feedback and continuation');
  await page.locator('[data-challenge-continue]').click(); await page.locator('[data-challenge-choice="right"]').click();
  await page.locator('[data-challenge-continue]').click(); await page.locator('[data-challenge-complete-panel]').waitFor({ state: 'visible' });
  const beforeRetry = await page.evaluate(key => localStorage.getItem(key), ledgerKey);
  receiptAvailable = true;
  await page.waitForFunction(async id => (await (await fetch('/__kianos-private/control/current')).json()).receipt?.command_id === id, command.command_id, { timeout: 20000 });
  check(await page.evaluate(key => localStorage.getItem(key), ledgerKey) === beforeRetry, 'receipt retry does not repeat or erase answers');
  const events = JSON.parse(beforeRetry).events.filter(event => event.challenge_id === question.challenge_id);
  check(events.length === 2 && events[0].outcome === 'WRONG' && events[1].source === 'reconstruction' && events[1].delayed === false,
    'wrong and reconstruction preserved, no delayed mastery manufactured');
  const after = await packet(page);
  check(after.packet.subjects.english.evidence.lexical.chat_state.packet.challenge_session.next_index === 1, 'next automatic packet contains completed Challenge position');
  await page.locator('[data-challenge-clear]').click();
  const retryAfterEnd = await page.evaluate(async command => {
    const { applyPrivateControlCommand } = await import('/src/lib/privateControlRuntime.mjs');
    const { browserControlCommand } = await import('/src/lib/privateControlCommand.mjs');
    const current = (await (await fetch('/__kianos-private/control/current')).json()).command;
    return (await applyPrivateControlCommand(localStorage, current || browserControlCommand(command), { day: command.study_day })).status;
  }, command);
  check(retryAfterEnd === 'idempotent' && await page.locator('[data-challenge-complete-panel]').isHidden(), 'ending the completed session survives unchanged command retry');
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-import-panel]').waitFor({ state: 'visible' });
  check((await packet(page)).packet.subjects.english.evidence.lexical.chat_state.packet.challenge_session.dismissed === true,
    'ending the session survives refresh and is explicit in the next Chat packet');
  await goto(page, '/');
  const noon = await planCommand(page, 'tomorrow-noon-003', '午间调整：继续英语', day + 'T00:29:20Z');
  publish(noon); await applied(page, noon.command_id);
  check(await page.getByRole('checkbox', { name: '完成：午间调整：继续英语', exact: true }).isVisible(), 'noon correction replaces presentation on current evidence');
  const lateRejected = await page.evaluate(async first => {
    const { applyPrivateControlCommand } = await import('/src/lib/privateControlRuntime.mjs');
    const { browserControlCommand } = await import('/src/lib/privateControlCommand.mjs');
    try { await applyPrivateControlCommand(localStorage, browserControlCommand({ ...first, command_id: 'tomorrow-other-chat-late' }), { day: first.study_day }); return false; }
    catch (error) { return /OLDER_COMMAND/.test(error.message); }
  }, first);
  check(lateRejected, 'late cross-Chat instruction cannot roll back newer arrangement');
  await page.waitForFunction(async ({ key, commandId }) => {
    const r = await fetch('/__kianos-private/checkpoint'); if (!r.ok) return false;
    const checkpoint = (await r.json()).checkpoint;
    const receipt = JSON.parse(checkpoint?.payload?.shared?.control_receipt_raw || 'null');
    return checkpoint?.payload?.subjects?.lexical?.entries?.[key] === localStorage.getItem(key)
      && receipt?.command_id === commandId;
  }, { key: ledgerKey, commandId: noon.command_id }, { timeout: 20000 });
  const durable = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), [ledgerKey, progressKey, 'kianos-control-receipt-v1']);
  fs.writeFileSync(path.join(out, 'before-restart.json'), JSON.stringify(readPrivateLearnerCheckpoint(temp), null, 2));
  await ctx.close(); stopServer(); await pause(1000);
  fs.writeFileSync(path.join(out, 'after-stop.json'), JSON.stringify(readPrivateLearnerCheckpoint(temp), null, 2));
  await startServer();
  fs.writeFileSync(path.join(out, 'after-start.json'), JSON.stringify(readPrivateLearnerCheckpoint(temp), null, 2));
  const restoredCtx = await context(), restored = await restoredCtx.newPage();
  await goto(restored, '/');
  try { await restored.waitForFunction(key => localStorage.getItem(key) !== null, ledgerKey, { timeout: 20000 }); }
  catch (error) {
    const diagnostic = await restored.evaluate(async () => {
      const remote = await (await fetch('/__kianos-private/checkpoint')).json();
      const { restoreSharedControlFromPrivate } = await import('/src/lib/privateCheckpointRuntime.mjs');
      let restore; try { restore = await restoreSharedControlFromPrivate(localStorage); } catch (error) { restore = { error: error.message }; }
      return { remote, restore, keys: Object.keys(localStorage), writer: document.documentElement.dataset.learnerWriter };
    });
    fs.writeFileSync(path.join(out, 'restore-diagnostic.json'), JSON.stringify(diagnostic, null, 2));
    throw error;
  }
  // Successful recovery intentionally reloads the page once before learner runtime starts.
  await restored.waitForTimeout(600);
  await restored.locator('[data-exam-home][data-ready="true"]').waitFor();
  const recovered = await restored.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(durable));
  check([ledgerKey, progressKey].every(key => recovered[key] === durable[key]), 'server restart and empty browser restore exact lexical evidence and progress');
  const priorReceipt = JSON.parse(durable['kianos-control-receipt-v1']), recoveredReceipt = JSON.parse(recovered['kianos-control-receipt-v1']);
  check(['command_id','command_hash','command_generated_at','status'].every(key => recoveredReceipt[key] === priorReceipt[key]),
    'recovered current instruction has matching successful apply receipt');
  await goto(restored, '/vocabulary/'); await restored.locator('[data-lexical-tab="repair"]').click();
  await restored.locator('[data-challenge-import-panel]').waitFor({ state: 'visible' });
  check(await restored.locator('[data-challenge-complete-panel]').isHidden(), 'ended exercise is not resurrected after recovery');
  await restored.screenshot({ path: path.join(out, 'restored.png') }); await restoredCtx.close();

  for (const raw of ['{"schema":', JSON.stringify({ schema: 'unknown-version', events: [{ event_id: 'unique' }] })]) {
    for (const route of ['/vocabulary/', '/vocabulary/4/']) {
      const faultCtx = await context(); await faultCtx.route('**/__kianos-private/**', r => r.fulfill({ status: r.request().method() === 'GET' ? 404 : 503, json: { status: 'missing' } }));
      await faultCtx.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: ledgerKey, raw });
      const fault = await faultCtx.newPage(); await goto(fault, route); await fault.locator('[data-lexical-state-error]').waitFor({ state: 'visible' });
      check(await fault.evaluate(key => localStorage.getItem(key), ledgerKey) === raw, 'unreadable bytes survive ' + route + ' ' + raw.slice(0,20));
      check(await fault.locator('[data-vocab-repair]:enabled,[data-vocab-route]:enabled,[data-challenge-choice]:enabled').count() === 0, 'dependent writes blocked with recovery message');
      await fault.screenshot({ path: path.join(out, 'protected-' + checks.length + '.png') }); await faultCtx.close();
    }
  }
  check(errors.length === 0, 'normal journey has no browser exceptions: ' + errors.join(';'));
  const result = { status: 'PASS', day, checks, real_learner_state_used: false, real_chat_reasoning: 'not simulated', health_device_transport: 'outside this website proof' };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2));
} finally { await browser?.close(); stopServer(); fs.writeFileSync(path.join(out, 'server.log'), serverLog); fs.rmSync(temp, { recursive: true, force: true }); }
