import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4337;
const EXTERNAL_BASE = process.env.KIANOS_XIZONG_POSITION_TEST_BASE_URL || '';
const BASE = EXTERNAL_BASE || `http://127.0.0.1:${PORT}`;
if (EXTERNAL_BASE) {
  const target = new URL(EXTERNAL_BASE);
  if (!['127.0.0.1', 'localhost'].includes(target.hostname) || target.port === '4321') {
    throw new Error('XIZONG_POSITION_TEST_REQUIRES_ISOLATED_CANDIDATE_NOT_STABLE');
  }
}
const ROUTE = '/xizong/circulation/b01/';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(BASE + ROUTE)).ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_POSITION_TEST_SERVER_NOT_READY');
}
const server = EXTERNAL_BASE ? null : spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  detached: process.platform !== 'win32',
  stdio: ['ignore', 'pipe', 'pipe']
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.KIANOS_TEST_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');

  const root = page.locator('[data-xizong-v6-block]');
  const payload = JSON.parse((await page.locator('[data-xizong-learner-object-payload]').textContent()) || '{}');
  assert.equal(payload.kps.length, 32, 'B1 fixture must retain the real 32-KP geometry');
  await root.locator('[data-stage-next="logic_group"]').click();
  await page.waitForFunction(() => document.querySelector('[data-study-stage="source_contact"]')?.hidden === false);
  for (let i = 0; i < 14; i += 1) {
    const next = root.locator('[data-companion-next="source_contact"]');
    assert.equal(await next.isDisabled(), false, 'KP companion must advance through KP15');
    await next.click();
  }
  await page.waitForFunction(() =>
    document.querySelector('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]')
      ?.getAttribute('data-kp-id') === 'circulation-b01-kp15'
  );
  await page.waitForFunction(() => {
    const rail = document.querySelector('[data-study-group-rail]');
    const current = rail?.querySelector('.xzLogicGroupKp.current');
    if (!(rail instanceof HTMLElement) || !(current instanceof HTMLElement)) return false;
    const railRect = rail.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    return current.textContent?.includes('KP15')
      && currentRect.top >= railRect.top - 1
      && currentRect.bottom <= railRect.bottom + 1;
  });

  const before = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const objectId = root?.getAttribute('data-study-object') || '';
    const state = JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:' + objectId) || '{}');
    const kpRail = document.querySelector('[data-study-kp-rail]');
    const groupRail = document.querySelector('[data-study-group-rail]');
    const current = groupRail?.querySelector('.xzLogicGroupKp.current');
    const railRect = groupRail?.getBoundingClientRect();
    const currentRect = current?.getBoundingClientRect();
    return {
      state,
      kpRailHidden: kpRail?.hidden,
      groupRailHidden: groupRail?.hidden,
      activeGroupIndex: groupRail?.querySelector('[data-group-target].active')?.getAttribute('data-group-target'),
      currentText: current?.textContent?.trim(),
      currentVisible: Boolean(railRect && currentRect && currentRect.top >= railRect.top - 1 && currentRect.bottom <= railRect.bottom + 1)
    };
  });
  assert.equal(before.state.kpIndex, 14, 'companion focus must persist into native kpIndex');
  assert.ok(before.state.groupIndex > 0, 'KP15 must move the native Logic Group cursor');
  assert.equal(Object.values(before.state.learned || {}).filter(Boolean).length, 0, 'navigation alone must not create learned evidence');
  assert.equal(before.kpRailHidden, true, 'existing Logic Group map remains the visible left rail');
  assert.equal(before.groupRailHidden, false);
  assert.equal(before.activeGroupIndex, String(before.state.groupIndex));
  assert.match(before.currentText || '', /KP15/);
  assert.equal(before.currentVisible, true, 'left Logic Group map must scroll the current KP15 row into view');
  await page.locator('[data-study-timer-today]').click();
  await page.waitForURL(/\/steward\/?$/);
  await page.locator('[data-study-timer-today]').click();
  await page.waitForURL(/\/xizong\/circulation\/b01\/?$/);
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  await page.waitForFunction(() =>
    document.querySelector('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]')
      ?.getAttribute('data-kp-id') === 'circulation-b01-kp15'
  );
  await page.waitForFunction(() => {
    const rail = document.querySelector('[data-study-group-rail]');
    const current = rail?.querySelector('.xzLogicGroupKp.current');
    if (!(rail instanceof HTMLElement) || !(current instanceof HTMLElement)) return false;
    const railRect = rail.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    return current.textContent?.includes('KP15')
      && currentRect.top >= railRect.top - 1
      && currentRect.bottom <= railRect.bottom + 1;
  });

  const returned = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const objectId = root?.getAttribute('data-study-object') || '';
    const state = JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:' + objectId) || '{}');
    const groupRail = document.querySelector('[data-study-group-rail]');
    const current = groupRail?.querySelector('.xzLogicGroupKp.current');
    const railRect = groupRail?.getBoundingClientRect();
    const currentRect = current?.getBoundingClientRect();
    return {
      state,
      currentText: current?.textContent?.trim(),
      currentVisible: Boolean(railRect && currentRect && currentRect.top >= railRect.top - 1 && currentRect.bottom <= railRect.bottom + 1)
    };
  });
  assert.equal(returned.state.kpIndex, 14, 'Today return must restore KP15, not KP1');
  assert.match(returned.currentText || '', /KP15/);
  assert.equal(returned.currentVisible, true);
  assert.equal(Object.values(returned.state.learned || {}).filter(Boolean).length, 0);

  await root.locator('[data-companion-next="source_contact"]').click();
  await page.waitForFunction(() =>
    document.querySelector('[data-study-stage="source_contact"]:not([hidden]) [data-learner-kp-companion="source_contact"]')
      ?.getAttribute('data-kp-id') === 'circulation-b01-kp16'
  );
  const nextState = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const objectId = root?.getAttribute('data-study-object') || '';
    const state = JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:' + objectId) || '{}');
    return {
      kpIndex: state.kpIndex,
      currentText: document.querySelector('[data-study-group-rail] .xzLogicGroupKp.current')?.textContent?.trim()
    };
  });
  assert.equal(nextState.kpIndex, 15);
  assert.match(nextState.currentText || '', /KP16/, 'left Logic Group map must follow the next KP immediately');
  console.log('PASS Xizong position continuity: KP focus persists, Today return resumes exact KP, left rail follows without creating learning evidence');
} finally {
  await browser?.close();
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  }
}
