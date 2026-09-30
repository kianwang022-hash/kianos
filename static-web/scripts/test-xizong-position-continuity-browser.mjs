import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isolatedCandidateEnv } from './kianos-candidate-runtime.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';

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
const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-position-test-'));
const server = EXTERNAL_BASE ? null : spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  env: isolatedCandidateEnv(isolatedRoot),
  detached: process.platform !== 'win32',
  stdio: ['ignore', 'pipe', 'pipe']
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    headless: true,
    ...(process.env.KIANOS_TEST_CHROME ? { executablePath: process.env.KIANOS_TEST_CHROME } : {})
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
  // A second Source policy proves the shared consumer does not infer position
  // from a localized/removed UI counter. This is synthetic isolated state only.
  await page.goto(BASE + '/xizong/digestive-metabolic-endocrine-tumor/d01/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  await root.locator('[data-group-target="1"]').click();
  await page.waitForFunction(() => document.querySelector('[data-study-stage="kp_learn"]:not([hidden]) [data-learner-kp-companion="kp_learn"]')?.getAttribute('data-kp-id') === 'digestive-d1-kp04');
  const beforeCounterChange = await page.evaluate(() => {
    const root=document.querySelector('[data-xizong-v6-block]');
    return localStorage.getItem('kianos-xizong-astro-v2:' + root.getAttribute('data-study-object'));
  });
  await page.evaluate(() => { document.querySelector('[data-logic-counter]').textContent='第 1 组 / 显示文本不是状态'; });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await root.locator('[data-study-stage="kp_learn"]:not([hidden]) [data-learner-kp-companion="kp_learn"]').getAttribute('data-kp-id'), 'digestive-d1-kp04', 'localized counter must not reset a group-owned companion');
  await page.evaluate(() => document.querySelector('[data-logic-counter]').remove());
  await root.locator('[data-companion-next="kp_learn"]').click();
  await page.waitForFunction(() => document.querySelector('[data-study-stage="kp_learn"]:not([hidden]) [data-learner-kp-companion="kp_learn"]')?.getAttribute('data-kp-id') === 'digestive-d1-kp05');
  const afterCounterChange = await page.evaluate(() => {
    const root=document.querySelector('[data-xizong-v6-block]');
    return JSON.parse(localStorage.getItem('kianos-xizong-astro-v2:' + root.getAttribute('data-study-object')));
  });
  assert.equal(afterCounterChange.kpIndex,4);
  assert.equal(afterCounterChange.groupIndex,1);
  const nativePosition = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const position = root.getXizongStudyPosition();
    return { ...position, frozen: Object.isFrozen(position) };
  });
  assert.equal(nativePosition.kpId, 'digestive-d1-kp05');
  assert.equal(nativePosition.logicGroupId, 'b-d01-lg02');
  assert.equal(nativePosition.frozen, true, 'consumer gets a read-only native position');

  assert.deepEqual(afterCounterChange.learned, JSON.parse(beforeCounterChange).learned, 'text/nav mutation cannot create learner evidence');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  await page.waitForFunction(() => document.querySelector('[data-study-stage="kp_learn"]:not([hidden]) [data-learner-kp-companion="kp_learn"]')?.getAttribute('data-kp-id') === 'digestive-d1-kp05');
  for (const [systemId, blockId] of [
    ['remaining-clinical', 'F1'],
    ['remaining-clinical', 'F9'],
    ['digestive-metabolic-endocrine-tumor', 'M1']
  ]) {
    const block = loadXizongBlock(systemId, blockId);
    await page.goto(`${BASE}/xizong/${systemId}/${block.slug}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
    await root.locator('[data-stage-next="logic_group"]').click();
    const getView = () => page.evaluate(() => {
      const root = document.querySelector('[data-xizong-v6-block]');
      const position = root.getXizongStudyPosition();
      const stage = root.querySelector(`[data-study-stage="${position.stage}"]:not([hidden])`);
      const kp = stage?.querySelector('[data-learner-kp-companion][data-kp-id], [data-kp-recall-card]:not([hidden])');
      return { position, shown: kp?.getAttribute('data-kp-id') };
    });
    let view = await getView();
    assert.equal(view.shown, view.position.kpId, `${blockId}: native/visible Source policy position`);
    const step = root.locator(`[data-study-stage="${view.position.stage}"]:not([hidden]) [data-companion-next]`);
    if (await step.count() && !await step.isDisabled()) await step.click();
    view = await getView();
    const preserved = view.position;
    await page.evaluate(() => { const counter=document.querySelector('[data-logic-counter]'); if(counter)counter.textContent='999 / localized display only'; });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    view = await getView();
    assert.deepEqual(view.position, preserved, `${blockId}: display cannot mutate native position`);
    assert.equal(view.shown, preserved.kpId, `${blockId}: display cannot redirect companion`);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
    view = await getView();
    assert.equal(view.shown, preserved.kpId, `${blockId}: heterogeneous Resume preserved`);
  }
  console.log('PASS Xizong position continuity: KP focus persists, Today return resumes exact KP, left rail follows; D1 counter attack and F1/F9/M1 heterogeneous Source/Resume preserve native position');
} finally {
  await browser?.close();
  fs.rmSync(isolatedRoot, { recursive: true, force: true });
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  }
}
