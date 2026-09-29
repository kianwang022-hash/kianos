import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4333;
const EXTERNAL_BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || '';
const BASE = EXTERNAL_BASE || `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checks = [];
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_C_RUNTIME_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push({ name, pass: true, detail });
};
async function waitForHttp(url) {
  for (let i = 0; i < 100; i += 1) {
    try { const response = await fetch(url); if (response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error('C_RUNTIME_SERVER_NOT_READY');
}
const server = EXTERNAL_BASE ? null : spawn(
  'npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)],
  { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' }
);
let browser;
const stage = (page) => page.evaluate(() =>
  [...document.querySelectorAll('[data-study-stage]')].find((node) => !node.hidden)?.dataset.studyStage || ''
);
async function waitWriter(page) {
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active',
    null, { timeout: 10000 }
  );
}
async function gotoStable(page, url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (error) {
      if (attempt === 2 || !/ERR_ABORTED|interrupted by another navigation|frame was detached|navigation/i.test(String(error?.message || error))) throw error;
      await page.waitForTimeout(120);
    }
  }
}
async function reset(page, route) {
  const url = `${BASE}/xizong/hematology-immunity-infection/${route}/`;
  let cleared = false;
  for (let attempt = 0; attempt < 3 && !cleared; attempt += 1) {
    await gotoStable(page, url);
    await waitWriter(page);
    try {
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      cleared = true;
    } catch (error) {
      if (!/Execution context was destroyed|navigation/i.test(String(error?.message || error))) throw error;
    }
  }
  check(cleared, `reset_storage_${route}`);
  await gotoStable(page, url);
  await waitWriter(page);
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
  await page.waitForTimeout(180);
}
async function enterSource(page) {
  await page.locator('[data-stage-next="logic_group"]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(80);
  check(await stage(page) === 'source_contact', 'enters_block_source_contact');
}
async function h1ExplicitOrder(page) {
  await reset(page, 'h01');
  await enterSource(page);
  check(await page.locator('[data-source-contact-done]:visible').count() === 1, 'h1_one_source_confirmation');
  check(await page.locator('[data-group-lecture-done]:visible').count() === 0, 'h1_no_lg_source_confirmation');
  await page.locator('[data-source-contact-done]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);

  const expected = [
    'hematology-h01-kp02','hematology-h01-kp03',
    'hematology-h01-kp04','hematology-h01-kp05','hematology-h01-kp06',
    'hematology-h01-kp07','hematology-h01-kp08','hematology-h01-kp09',
    'hematology-h01-kp10','hematology-h01-kp11',
    'hematology-h01-kp01','hematology-h01-kp12','hematology-h01-kp13'
  ];
  const actual = [];
  while (await stage(page) === 'kp_recall' && actual.length < expected.length + 2) {
    const card = page.locator('[data-kp-recall-card]:visible').first();
    actual.push(await card.getAttribute('data-kp-id'));
    const reveal = card.locator('[data-kp-reveal]:visible');
    if (await reveal.count()) await reveal.evaluate((node) => node.click());
    await card.locator('[data-rating="known"]').evaluate((node) => node.click());
    await page.waitForTimeout(160);
    check(await page.locator('[data-study-stage="source_contact"]:visible').count() === 0, 'h1_no_source_reopen_between_lgs');
  }
  check(JSON.stringify(actual) === JSON.stringify(expected), 'h1_explicit_noncontiguous_recall_order', actual.join(','));
  check(await stage(page) === 'block_recall', 'h1_reaches_block_recall');
  check(await page.locator('[data-block-recall-answer]').evaluate((node) => node.hidden), 'h1_block_recall_front_protected');
}

async function h11VisualTiming(page) {
  await reset(page, 'h11');
  await enterSource(page);
  const visual = page.locator('[data-learner-asset="visual"][data-learner-asset-id="c-h11-lg01-visual"]');
  check(await visual.isVisible(), 'h11_visual_visible_during_learn');
  await page.locator('[data-source-contact-done]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await stage(page) === 'kp_recall', 'h11_enters_recall');
  check(await page.locator('[data-kp-recall-card]:visible [data-kp-answer]').evaluate((node) => node.hidden), 'h11_recall_front_core_hidden');
  check(!(await visual.isVisible()), 'h11_answer_bearing_visual_hidden_on_front');
  await page.locator('[data-kp-recall-card]:visible [data-kp-reveal]').evaluate((node) => node.click());
  await page.waitForTimeout(80);
  check(await visual.isVisible(), 'h11_visual_returns_after_reveal');
}

async function h24SourceContinuity(page) {
  await reset(page, 'h24');
  await enterSource(page);
  check(await page.locator('[data-source-contact-done]:visible').count() === 1, 'h24_one_fail_closed_source_confirmation');
  check(await page.locator('[data-group-lecture-done]:visible').count() === 0, 'h24_no_inferred_lg_source_segments');
  await page.locator('[data-source-contact-done]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  const state = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    return JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:' + root.getAttribute('data-study-object')) || '{}');
  });
  check(Object.values(state.learned || {}).filter(Boolean).length === 17, 'h24_whole_block_source_coverage');
  check((state.sourceContactEvidence || []).length === 1, 'h24_single_source_evidence');
  check((state.sourceContactEvidence?.[0]?.kp_ids || []).length === 17, 'h24_source_evidence_covers_exact_block');
}

try {
  await waitForHttp(`${BASE}/xizong/hematology-immunity-infection/h01/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await h1ExplicitOrder(page);
  await h11VisualTiming(page);
  await h24SourceContinuity(page);
  console.log(`XIZONG_C_RUNTIME_JOURNEY_PASS | checks=${checks.length}`);
} finally {
  try { await browser?.close(); } catch {}
  if (server) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} }
  }
}
