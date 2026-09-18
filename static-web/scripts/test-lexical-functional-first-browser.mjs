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
  if (!ok) throw new Error(`LEXICAL_FFV_BROWSER_FAIL:${name}:${detail}`);
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
    try {
      const response = await fetch(`${BASE}/vocabulary/`);
      if (response.ok) return;
    } catch {}
    await sleep(125);
  }
  throw new Error(`LEXICAL_FFV_PREVIEW_NOT_READY:${serverLog.slice(-2000)}`);
}

const storage = async (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}, key);
const ledger = (page) => storage(page, 'kianos-lexical-evidence-ledger-v2');
const legacyState = (page, objectId) => storage(page, `kianos-vocabulary-astro-v2:${objectId}`);
const repairCount = async (page, objectId) => Object.keys((await legacyState(page, objectId))?.repairTargets || {}).length;
const goto = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(80);
};
const challengePacket = (target, id, extra = {}) => ({
  schema: 'kianos.lexical.challenge_packet.v1',
  study_day: '2099-01-01',
  generated_at: '2099-01-01T08:00:00Z',
  challenges: [{
    challenge_id: id,
    word_id: target.word_id,
    ordinal: target.ordinal,
    word: target.word,
    target_kind: target.target_kind,
    target_id: target.target_id,
    target_locator: target.target_locator,
    target_revision: target.target_revision,
    source_evidence: 'browser accepted-fixture probe',
    question_type: 'spatial_choice',
    stem: 'Choose the correct test option.',
    options: [{ key: 'left', text: 'wrong option' }, { key: 'right', text: 'correct option' }],
    correct_key: 'right',
    ...extra
  }]
});
async function openChallenge(page, packet) {
  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-chat-load-button]').click();
  await page.locator('[data-challenge-chat-paste-input]').fill(JSON.stringify(packet));
  await page.locator('[data-challenge-chat-paste-start]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
}
async function clearChallengePacket(page) {
  const button = page.locator('[data-challenge-clear]');
  if (await button.isVisible()) await button.click();
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => checks.push({ name: 'pageerror', ok: false, detail: error.message }));

  // Start on an already accepted Current fixture. No learner state from this run is persisted outside browser storage.
  await goto(page, '/vocabulary/4/');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-local-port="vocabulary"]');
  const objectId = await root.getAttribute('data-vocab-object');
  const word = await root.getAttribute('data-vocab-word');
  const ordinal = Number(await root.getAttribute('data-vocab-ordinal'));
  const sourceHash = await root.getAttribute('data-vocab-source-hash');
  check(Boolean(objectId && word && ordinal === 4 && sourceHash), 'accepted_fixture_identity', `${objectId}|${word}|${ordinal}`);

  // Recall front is learner-visible before Reveal while answer-bearing Depth remains hidden.
  check(!(await page.locator('[data-vocab-details]').isVisible()), 'depth_answer_hidden_before_reveal');
  const frontText = await page.locator('[data-vocab-front]').innerText();
  const hiddenCore = String(await page.locator('[data-vocab-details] .lexicalSenseMeaning > p').first().textContent() || '').trim();
  check(Boolean(hiddenCore) && !frontText.includes(hiddenCore), 'recall_front_does_not_leak_core_answer', hiddenCore);
  check(await page.locator('[data-vocab-route="known"]').count() === 1 && await page.locator('[data-vocab-route="mastered"]').count() === 1, 'fast_pass_controls_present');

  // Known is a low-friction Fast Pass: record the whole-card observation, create no Repair, and continue Coverage.
  const fastContext = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const fastPage = await fastContext.newPage();
  await goto(fastPage, '/vocabulary/4/');
  await fastPage.evaluate(() => localStorage.clear());
  await fastPage.reload({ waitUntil: 'domcontentloaded' });
  await fastPage.locator('[data-vocab-route="known"]').click();
  await fastPage.waitForURL(/\/vocabulary\/5\/?$/);
  const fastRouting = await fastPage.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1') || 'null'));
  check(fastRouting?.history?.at(-1)?.route === 'KNOWN', 'known_fast_pass_event_recorded');
  check(await repairCount(fastPage, objectId) === 0, 'known_fast_pass_zero_repair_debt');
  await fastContext.close();

  // Fuzzy/Unknown belong to the revealed four-direction judgment, not the Recall front.
  await page.keyboard.press('Space');
  check(await page.locator('[data-vocab-details]').isVisible(), 'space_reveals_depth');
  await page.locator('[data-vocab-route="fuzzy"]').click();
  await page.waitForURL(/\/vocabulary\/5\/?$/);
  const fuzzyRouting = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1') || 'null'));
  check(fuzzyRouting?.history?.at(-1)?.route === 'FUZZY', 'fuzzy_event_recorded');
  check(await repairCount(page, objectId) === 0, 'fuzzy_zero_repair_debt');
  let l = await ledger(page);
  check(!l?.events?.some((event) => event.target_kind === 'card'), 'card_routing_stays_out_of_repair_ledger');
  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.waitForTimeout(40);
  check((String(await page.locator('[data-lexical-review-list]').textContent() || '')).includes('当前没有需要处理的 Repair 对象'), 'home_no_repair_after_fuzzy');

  // Local + admits exactly one target.
  await goto(page, '/vocabulary/4/');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const plus = page.locator('[data-vocab-repair]').first();
  const target = {
    word_id: objectId, ordinal, word,
    target_kind: await plus.getAttribute('data-target-kind'),
    target_id: (await plus.getAttribute('data-target-id')) || null,
    target_locator: (await plus.getAttribute('data-target-locator')) || null,
    target_revision: (await plus.getAttribute('data-target-id')) ? null : sourceHash
  };
  await plus.click();
  await page.waitForTimeout(40);
  check(await repairCount(page, objectId) === 1, 'local_plus_one_exact_target', JSON.stringify(target));
  l = await ledger(page);
  check(l?.events?.filter((event) => event.source === 'depth_plus' && event.outcome === 'ADDED').length === 1, 'local_plus_one_admission_event');
  await goto(page, '/vocabulary/');
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.waitForTimeout(40);
  const repairText = String(await page.locator('[data-lexical-review-list]').textContent() || '');
  check(repairText.includes(word) && repairText.includes('1 个 Repair 对象'), 'home_projects_exact_repair', repairText);

  // A correct Challenge without quality evidence must NOT auto-retire.
  await openChallenge(page, challengePacket(target, 'browser-single-correct'));
  await page.locator('[data-challenge-choice="right"]').click();
  const weakCorrectFeedback = await page.locator('[data-challenge-feedback]').innerText();
  check(weakCorrectFeedback.includes('不足以单独结束这个 Repair'), 'single_correct_does_not_retire', weakCorrectFeedback);
  check(await repairCount(page, objectId) === 1, 'single_correct_target_still_active');
  await page.locator('[data-challenge-continue]').click();
  await page.locator('[data-challenge-complete-panel]').waitFor({ state: 'visible' });
  await clearChallengePacket(page);

  // Explicitly qualifying delayed/unseen/unassisted target-matched evidence may make it dormant.
  await page.locator('[data-challenge-chat-load-button]').click();
  await page.locator('[data-challenge-chat-paste-input]').fill(JSON.stringify(challengePacket(target, 'browser-delayed-success', {
    evidence_quality: { assistance: 'unassisted', context_novelty: 'unseen', delayed: true }
  })));
  await page.locator('[data-challenge-chat-paste-start]').click();
  await page.locator('[data-challenge-choice="right"]').click();
  const strongFeedback = await page.locator('[data-challenge-feedback]').innerText();
  check(strongFeedback.includes('暂时退出 Repair'), 'qualified_success_dormant', strongFeedback);
  check(await repairCount(page, objectId) === 0, 'qualified_success_cache_reconciled');
  await page.locator('[data-challenge-continue]').click();
  await page.locator('[data-challenge-complete-panel]').waitFor({ state: 'visible' });
  await clearChallengePacket(page);

  // Re-admit. A wrong main item followed by same-session reconstruction correct remains active.
  await goto(page, '/vocabulary/4/');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  await page.locator('[data-vocab-repair]').first().click();
  await page.waitForTimeout(30);
  check(await repairCount(page, objectId) === 1, 'readd_after_dormancy');
  const reconstruction = {
    stem: 'Reconstruct immediately after feedback.',
    options: [{ key: 'left', text: 'wrong reconstruction' }, { key: 'right', text: 'correct reconstruction' }],
    correct_key: 'right'
  };
  await openChallenge(page, challengePacket(target, 'browser-reconstruction', { repair: 'smallest repair', reconstruction }));
  await page.locator('[data-challenge-choice="left"]').click();
  check((await page.locator('[data-challenge-feedback]').innerText()).includes('smallest repair'), 'wrong_shows_small_repair');
  await page.locator('[data-challenge-continue]').click();
  check((await page.locator('[data-challenge-progress]').innerText()).includes('Reconstruct'), 'enters_reconstruction');
  await page.locator('[data-challenge-choice="right"]').click();
  check((await page.locator('[data-challenge-feedback]').innerText()).includes('不足以单独结束这个 Repair'), 'reconstruction_correct_not_transfer');
  await page.locator('[data-challenge-continue]').click();
  await page.locator('[data-challenge-complete-panel]').waitFor({ state: 'visible' });
  check(await repairCount(page, objectId) === 1, 'reconstruction_target_remains_active');

  // Manual clear = agency/DORMANT, and resume stays Coverage-oriented without a due wall.
  await goto(page, '/vocabulary/4/');
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const activePlus = page.locator('[data-vocab-repair]').first();
  check((await activePlus.getAttribute('aria-pressed')) === 'true', 'active_target_restored_on_word_page');
  await activePlus.click();
  await page.waitForTimeout(30);
  check(await repairCount(page, objectId) === 0, 'manual_clear_removes_active_projection');
  l = await ledger(page);
  check(l?.events?.some((event) => event.source === 'manual_clear' && event.outcome === 'CLEAR'), 'manual_clear_event_recorded');
  await goto(page, '/vocabulary/');
  const continueHref = await page.locator('[data-lexical-learn-nav]').getAttribute('href');
  check(String(continueHref).endsWith('/vocabulary/4/'), 'coverage_resume_keeps_last_cursor', continueHref);
  const bodyText = await page.locator('body').innerText();
  check(!/overdue|next-day repair|明天继续|必须先清/i.test(bodyText), 'no_overdue_wall_language');
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.waitForTimeout(40);
  check((String(await page.locator('[data-lexical-review-list]').textContent() || '')).includes('当前没有需要处理的 Repair 对象'), 'manual_clear_home_dormant');

  await page.screenshot({ path: path.join(AUDIT, 'final-home.png'), fullPage: true });
  const finalLedger = await ledger(page);
  const summary = {
    status: 'PASS', fixture: { ordinal, objectId, word, sourceHash }, checks,
    evidence_events: finalLedger?.events?.length || 0,
    conflicts: finalLedger?.conflicts?.length || 0,
    content_acceptance_delta: 0,
    persistent_real_learner_state_mutation: 0,
    claim: 'isolated browser Functional First journey on accepted o0004 fixture, including non-leaking Recall and low-friction Fast Pass'
  };
  fs.writeFileSync(path.join(AUDIT, 'journey.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  await context.close();
} catch (error) {
  fs.writeFileSync(path.join(AUDIT, 'journey-failure.json'), JSON.stringify({ status: 'FAIL', error: String(error?.stack || error), checks, serverLog }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(800)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
