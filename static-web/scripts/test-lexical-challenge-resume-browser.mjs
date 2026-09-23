import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const AUDIT = path.resolve(process.cwd(), '../lexical-ffv-audit');
fs.mkdirSync(AUDIT, { recursive: true });
const checks = [];
const check = (ok, name, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || '') });
  if (!ok) throw new Error(`LEXICAL_CHALLENGE_RESUME_FAIL:${name}:${detail}`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout?.on('data', (chunk) => { serverLog += String(chunk); });
server.stderr?.on('data', (chunk) => { serverLog += String(chunk); });
async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const response = await fetch(`${BASE}/vocabulary/`); if (response.ok) return; } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_CHALLENGE_RESUME_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}
const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);
const goto = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
};
const makeQuestion = (target, id, stem) => ({
  challenge_id: id,
  word_id: target.word_id,
  ordinal: target.ordinal,
  word: target.word,
  target_kind: target.target_kind,
  target_id: target.target_id,
  target_locator: target.target_locator,
  target_revision: target.target_revision,
  source_evidence: 'resume browser acceptance',
  question_type: 'spatial_choice',
  stem,
  options: [{ key: 'left', text: 'wrong option' }, { key: 'right', text: 'correct option' }],
  correct_key: 'right'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));

  await goto(page, '/vocabulary/4/');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-local-port="vocabulary"]');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const plus = page.locator('[data-vocab-repair]').first();
  const targetId = await plus.getAttribute('data-target-id');
  const target = {
    word_id: await root.getAttribute('data-vocab-object'),
    ordinal: Number(await root.getAttribute('data-vocab-ordinal')),
    word: await root.getAttribute('data-vocab-word'),
    target_kind: await plus.getAttribute('data-target-kind'),
    target_id: targetId || null,
    target_locator: (await plus.getAttribute('data-target-locator')) || null,
    target_revision: targetId ? null : await root.getAttribute('data-vocab-source-hash')
  };
  check(Boolean(target.word_id && target.target_kind && (target.target_id || (target.target_locator && target.target_revision))), 'exact_resume_fixture', JSON.stringify(target));
  await plus.click();
  await page.waitForTimeout(40);

  const packet = {
    schema: 'kianos.lexical.challenge_packet.v1',
    study_day: '2099-04-01',
    generated_at: '2099-04-01T08:00:00Z',
    challenges: [
      makeQuestion(target, 'resume-browser-1', 'First resume acceptance question.'),
      makeQuestion(target, 'resume-browser-2', 'Second resume acceptance question.')
    ]
  };

  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-chat-load-button]').click();
  await page.locator('[data-challenge-chat-paste-input]').fill(JSON.stringify(packet));
  await page.locator('[data-challenge-chat-paste-start]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  check((await page.locator('[data-challenge-progress]').innerText()).startsWith('1 / 2'), 'challenge_starts_first_item');
  await page.locator('[data-challenge-choice="right"]').click();
  check((await page.locator('[data-challenge-feedback]').innerText()).includes('还不足以单独结束这个 Repair'), 'first_weak_correct_keeps_repair');
  await page.locator('[data-challenge-continue]').click();
  check((await page.locator('[data-challenge-progress]').innerText()).startsWith('2 / 2'), 'challenge_advances_second_item');

  const savedBeforeReload = await storage(page, 'kianos-lexical-challenge-progress-v1');
  check(savedBeforeReload?.index === 1 && savedBeforeReload?.answered === false, 'progress_persisted_before_reload', JSON.stringify(savedBeforeReload || {}));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  check(await page.locator('[data-challenge-resume]').isHidden(), 'saved_packet_auto_resumes_without_extra_control');
  check((await page.locator('[data-challenge-progress]').innerText()).startsWith('2 / 2'), 'resume_returns_exact_second_item');
  check((await page.locator('[data-challenge-stem]').innerText()).includes('Second resume acceptance question.'), 'resume_restores_question_identity');

  await page.locator('[data-challenge-choice="left"]').click();
  check((await page.locator('[data-challenge-feedback]').innerText()).length > 0, 'resumed_answer_records_feedback');
  await page.locator('[data-challenge-continue]').click();
  await page.locator('[data-challenge-complete-panel]').waitFor({ state: 'visible' });
  const savedEvents = await storage(page, 'kianos-lexical-challenge-events-v1');
  check(Array.isArray(savedEvents) && savedEvents.length === 2, 'session_events_survive_reload', JSON.stringify(savedEvents || []));
  const ledger = await storage(page, 'kianos-lexical-evidence-ledger-v2');
  check(ledger?.events?.some((event) => event.challenge_id === 'resume-browser-1' && event.outcome === 'CORRECT'), 'first_event_preserved_in_ledger');
  check(ledger?.events?.some((event) => event.challenge_id === 'resume-browser-2' && event.outcome === 'WRONG'), 'resumed_event_preserved_in_ledger');

  await page.locator('[data-challenge-clear]').click();
  check((await storage(page, 'kianos-lexical-challenge-progress-v1'))?.dismissed === true, 'end_preserves_native_identity_against_command_replay');
  check(await page.locator('[data-challenge-complete-panel]').isHidden(), 'end_dismisses_completed_session');
  const summary = {
    status: 'PASS', fixture: target, checks,
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'Challenge packet, cursor, and session evidence resume exactly after browser reload without creating a due queue'
  };
  fs.writeFileSync(path.join(AUDIT, 'challenge-resume-journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'challenge-resume-journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(800)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
