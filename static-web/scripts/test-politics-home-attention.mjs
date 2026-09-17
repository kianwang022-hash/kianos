import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';

const PORT = 4421;
const BASE = `http://127.0.0.1:${PORT}`;
const DAY = '2026-09-16';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const catalog = buildPoliticsPracticeCatalogCurrent('/');
const questions = catalog.questions.filter((q) => q.unitKey).slice(0, 3);
assert.equal(questions.length, 3, 'fixture requires three Current Politics questions');

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_HOME_ATTENTION_PREVIEW_NOT_READY');
}

function attemptsFixture(rows) {
  const units = {};
  for (const [q, outcome] of rows) {
    units[q.unitKey] ||= { attempts: {} };
    units[q.unitKey].attempts[q.id] = {
      question_id: q.id,
      outcome,
      study_day: DAY,
      selected: outcome === 'WRONG' ? 'A' : q.answer
    };
  }
  return { units };
}

function evidenceFixture(rows) {
  return rows.map(([q, outcome], index) => ({
    subject: q.subject,
    chapter: q.chapter,
    unit_id: q.unitId,
    question_id: q.id,
    source: 'xiao1000',
    outcome,
    study_day: DAY,
    observed_at: `2026-09-16T10:0${index}:00.000Z`
  }));
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: 'ignore',
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Shanghai' });
  await context.addInitScript(() => {
    const NativeDate = Date;
    const offset = NativeDate.parse('2026-09-16T10:00:00+08:00') - NativeDate.now();
    class FixtureDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [NativeDate.now() + offset])); }
      static now() { return NativeDate.now() + offset; }
    }
    window.Date = FixtureDate;
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${BASE}/politics/`, { waitUntil: 'networkidle' });
  const tools = page.locator('[data-politics-home-tools]');
  const handoff = page.locator('[data-politics-handoff]');
  const copy = page.locator('[data-politics-copy-handoff]');
  await tools.waitFor({ state: 'visible' });
  assert.equal(await tools.getAttribute('data-has-handoff'), 'false');
  assert.equal(await handoff.isVisible(), false);
  assert.equal(await copy.isVisible(), false);
  assert.equal(await page.locator('[data-politics-continue]').isVisible(), true);
  assert.ok(parseFloat(await page.locator('[data-politics-continue-meta]').evaluate((node) => getComputedStyle(node).fontSize)) >= 16);
  console.log('PASS cold Home keeps Continue primary and hides empty Handoff');

  const [wrongQ, uncertainQ, stableDiscussionQ] = questions;
  const attemptRows = [[wrongQ, 'WRONG'], [uncertainQ, 'UNCERTAIN'], [stableDiscussionQ, 'STABLE']];
  await page.evaluate(({ K, attempts, evidence, wrongId, uncertainId, discussionId }) => {
    localStorage.setItem(K.attempts, JSON.stringify(attempts));
    localStorage.setItem(K.meta, JSON.stringify({
      latestOutcome: { [wrongId]: 'WRONG', [uncertainId]: 'UNCERTAIN', [discussionId]: 'STABLE' },
      discussion: { [discussionId]: true }
    }));
    localStorage.setItem(K.evidence, JSON.stringify(evidence));
  }, {
    K,
    attempts: attemptsFixture(attemptRows),
    evidence: evidenceFixture(attemptRows),
    wrongId: wrongQ.id,
    uncertainId: uncertainQ.id,
    discussionId: stableDiscussionQ.id
  });
  await page.reload({ waitUntil: 'networkidle' });
  await handoff.waitFor({ state: 'visible' });
  assert.equal(await tools.getAttribute('data-has-handoff'), 'true');
  const summary = await page.locator('[data-politics-handoff-summary]').innerText();
  assert.match(summary, /2 条需要处理/);
  assert.match(summary, /1 Wrong/);
  assert.match(summary, /1 Uncertain/);
  assert.doesNotMatch(summary, /3 条需要处理/);
  assert.match(await page.locator('[data-politics-review-entry]').innerText(), /3 题/);
  assert.equal(await copy.isVisible(), true);
  assert.ok(parseFloat(await page.locator('[data-politics-handoff-summary]').evaluate((node) => getComputedStyle(node).fontSize)) >= 16);
  console.log('PASS Home separates actionable W/U handoff from stable discussion');

  await copy.click();
  await page.waitForFunction(() => document.querySelector('[data-politics-copy-handoff]')?.textContent === 'Copied');
  const copied = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  const copiedIds = new Set(copied.review_context.map((item) => item.question_id));
  assert.deepEqual([...copiedIds].sort(), [wrongQ.id, uncertainQ.id].sort());
  assert.ok(copied.events.every((event) => copiedIds.has(event.question_id)));
  assert.equal(copiedIds.has(stableDiscussionQ.id), false);
  console.log('PASS copied Handoff contains only exact actionable questions');

  await page.evaluate(({ K, wrongId, uncertainId, discussionId }) => {
    const meta = JSON.parse(localStorage.getItem(K.meta));
    meta.latestOutcome[wrongId] = 'STABLE';
    meta.latestOutcome[uncertainId] = 'STABLE';
    meta.discussion[discussionId] = true;
    localStorage.setItem(K.meta, JSON.stringify(meta));
  }, { K, wrongId: wrongQ.id, uncertainId: uncertainQ.id, discussionId: stableDiscussionQ.id });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await tools.getAttribute('data-has-handoff'), 'false');
  assert.equal(await handoff.isVisible(), false);
  assert.equal(await copy.isVisible(), false);
  assert.match(await page.locator('.politicsOverviewActions a[href$="politics/review/"]').innerText(), /回访/);
  console.log('PASS stable correction clears Home Handoff without erasing Review access');

  const corruptContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    timezoneId: 'Asia/Shanghai',
    storageState: {
      cookies: [],
      origins: [{ origin: BASE, localStorage: [{ name: K.attempts, value: '{' }] }]
    }
  });
  const corruptPage = await corruptContext.newPage();
  const corruptPageErrors = [];
  corruptPage.on('pageerror', (error) => corruptPageErrors.push(error.message));
  await corruptPage.goto(`${BASE}/politics/`, { waitUntil: 'networkidle' });
  const corruptTools = corruptPage.locator('[data-politics-home-tools]');
  const corruptHandoff = corruptPage.locator('[data-politics-handoff]');
  const corruptCopy = corruptPage.locator('[data-politics-copy-handoff]');
  await corruptHandoff.waitFor({ state: 'visible' });
  assert.equal(await corruptTools.getAttribute('data-has-handoff'), 'error');
  assert.match(await corruptPage.locator('[data-politics-handoff-summary]').innerText(), /未能完整读取/);
  assert.equal(await corruptCopy.isVisible(), false);
  assert.match(await corruptPage.locator('[data-politics-continue-meta]').innerText(), /未能完整读取/);
  assert.deepEqual(corruptPageErrors, []);
  await corruptContext.close();
  console.log('PASS corrupt storage fails closed instead of presenting fake zero attention');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    'Politics Home must fit the narrow viewport without document-level horizontal overflow'
  );
  assert.deepEqual(pageErrors, []);
  console.log('POLITICS_HOME_ATTENTION_PASS');
  await context.close();
} finally {
  if (browser) await browser.close();
  try {
    if (process.platform !== 'win32' && server.pid) process.kill(-server.pid, 'SIGTERM');
    else server.kill('SIGTERM');
  } catch {
    try { server.kill('SIGKILL'); } catch {}
  }
}
