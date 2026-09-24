import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4338;
const BASE = `http://127.0.0.1:${PORT}`;
const BLOCK_ROUTE = '/xizong/respiratory/r01/';
const MEMORY_ROUTE = '/xizong/memory/';
const MEMORY_KEY = 'kianos-xizong-memory-v1';
const reportPath = path.resolve(process.cwd(), '.qa/xizong-memory-auto-release-browser.json');
const report = {
  schema: 'kianos.xizong.memory_auto_release_browser.v1',
  route: BLOCK_ROUTE,
  started_at: new Date().toISOString(),
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_MEMORY_AUTO_RELEASE_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let browser;

try {
  await waitForHttp(`${BASE}${BLOCK_ROUTE}`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  await page.goto(`${BASE}${BLOCK_ROUTE}`, { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });

  const root = page.locator('[data-xizong-v6-block]');
  check(await root.count() === 1, 'block_runtime_mounted');
  check(await page.locator('[data-xizong-memory-release-bridge]').count() === 1, 'release_bridge_mounted');
  check(await page.locator('[data-xizong-learner-object-payload]').count() === 1, 'unified_learner_object_available');

  const fixture = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const payload = document.querySelector('[data-xizong-learner-object-payload]');
    const bridge = document.querySelector('[data-xizong-memory-release-bridge]');
    const learner = JSON.parse(payload?.textContent || 'null');
    const objectId = root?.getAttribute('data-study-object') || '';
    const sourceHash = bridge?.getAttribute('data-source-hash') || '';
    const kpIds = (learner?.kps || []).map((kp) => kp?.identity?.kpId).filter(Boolean);
    const precisionCount = (learner?.kps || []).reduce((sum, kp) => sum + (kp?.precision?.length || 0), 0)
      + (learner?.logicGroups || []).reduce((sum, group) => sum + (group?.precision?.length || 0), 0);
    return {
      learner,
      objectId,
      sourceHash,
      kpIds,
      blockId: learner?.identity?.blockId || '',
      precisionCount
    };
  });
  check(fixture.learner?.schema === 'kianos.xizong.learner_object.v1', 'learner_object_schema');
  check(fixture.kpIds.length > 1, 'representative_block_has_multiple_kps', String(fixture.kpIds.length));
  check(Boolean(fixture.objectId) && Boolean(fixture.blockId), 'release_identity_present');
  check(Boolean(fixture.sourceHash), 'release_source_hash_present');
  check(fixture.precisionCount > 0, 'representative_block_has_precision', String(fixture.precisionCount));

  const ratings = Object.fromEntries(fixture.kpIds.map((kpId, index) => [kpId, index === 0 ? 'unknown' : 'known']));
  const learned = Object.fromEntries(fixture.kpIds.map((kpId) => [kpId, true]));
  const studyKey = `kianos-xizong-astro-v2:${fixture.objectId}`;
  await page.evaluate(({ studyKey, state, memoryKey }) => {
    localStorage.setItem(studyKey, JSON.stringify(state));
    localStorage.removeItem(memoryKey);
  }, {
    studyKey,
    memoryKey: MEMORY_KEY,
    state: {
      stage: 'block_complete',
      groupIndex: 0,
      kpIndex: 0,
      learned,
      ratings,
      blockRecallDone: true,
      completed: false,
      sourceContactDone: true,
      sourceHash: fixture.sourceHash
    }
  });
  await page.reload({ waitUntil: 'networkidle' });

  const completeButton = root.locator('[data-block-complete]');
  await completeButton.waitFor({ state: 'visible' });
  check(!(await completeButton.isDisabled()), 'block_complete_gate_satisfied');
  check(await page.evaluate((key) => localStorage.getItem(key) === null, MEMORY_KEY), 'no_release_before_completion_confirmation');

  await completeButton.click();
  await page.waitForFunction((key) => Boolean(localStorage.getItem(key)), MEMORY_KEY);
  let memory = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(Boolean(memory?.releasedBlocks?.[fixture.blockId]), 'block_complete_released_library');
  const cards = Object.values(memory?.cards || {});
  const coreCards = cards.filter((card) => card?.family === 'CORE');
  const precisionCards = cards.filter((card) => card?.family === 'PRECISION');
  check(coreCards.length === fixture.kpIds.length, 'all_unique_core_released', `${coreCards.length}/${fixture.kpIds.length}`);
  check(precisionCards.length === fixture.precisionCount, 'all_current_owner_precision_released', `${precisionCards.length}/${fixture.precisionCount}`);
  check(memory?.attention?.[`core:${fixture.kpIds[0]}`]?.reviewRequested === true, 'first_pass_unknown_requests_core_review');
  check(precisionCards.every((card) => !memory?.attention?.[card.id]?.reviewRequested), 'precision_not_manufactured_as_today_debt');

  const releasedAt = memory.releasedBlocks[fixture.blockId].releasedAt;
  const refreshedAt = memory.releasedBlocks[fixture.blockId].refreshedAt;
  const cardIds = Object.keys(memory.cards).sort();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  memory = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(memory.releasedBlocks[fixture.blockId].releasedAt === releasedAt, 'reload_does_not_rerelease_block');
  check(memory.releasedBlocks[fixture.blockId].refreshedAt === refreshedAt, 'reload_does_not_refresh_release_event');
  check(JSON.stringify(Object.keys(memory.cards).sort()) === JSON.stringify(cardIds), 'reload_does_not_duplicate_cards');

  await page.goto(`${BASE}${MEMORY_ROUTE}`, { waitUntil: 'networkidle' });
  check((await page.locator('[data-memory-summary-core]').textContent())?.trim() === String(fixture.kpIds.length), 'memory_workspace_receives_core_release');
  check((await page.locator('[data-memory-summary-precision]').textContent())?.trim() === String(fixture.precisionCount), 'memory_workspace_receives_precision_release');
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '1', 'today_contains_only_real_first_pass_weak_signal');

  // Stabilize the initially weak Core inside Memory. Returning to the completed Block
  // must not replay its stale first-pass unknown rating into Today.
  await page.keyboard.press('Space');
  await page.locator('[data-memory-rating="mastered"]').click();
  await page.waitForFunction((key) => {
    const state = JSON.parse(localStorage.getItem(key) || 'null');
    return state?.attention && Object.values(state.attention).every((row) => row?.reviewRequested !== true);
  }, MEMORY_KEY);
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '0', 'mastered_memory_clears_today_signal');

  await page.goto(`${BASE}${BLOCK_ROUTE}`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  memory = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(memory?.attention?.[`core:${fixture.kpIds[0]}`]?.reviewRequested === false, 'completed_block_reload_does_not_resurrect_stale_weak_signal');
  check(memory.releasedBlocks[fixture.blockId].refreshedAt === refreshedAt, 'completed_block_reload_remains_idempotent');

  await page.goto(`${BASE}${MEMORY_ROUTE}`, { waitUntil: 'networkidle' });
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '0', 'today_remains_clear_after_block_reopen');

  // Canonical revision refresh: keep stable card identities and historical Memory
  // evidence, but replace stale card payloads even if the new Block revision has
  // already invalidated first-pass completion.
  await page.goto(`${BASE}${BLOCK_ROUTE}`, { waitUntil: 'networkidle' });
  const preRevision = await page.evaluate(({ memoryKey, studyKey, blockId }) => {
    const memory = JSON.parse(localStorage.getItem(memoryKey) || 'null');
    const study = JSON.parse(localStorage.getItem(studyKey) || 'null');
    const currentHash = memory?.releasedBlocks?.[blockId]?.sourceHash || '';
    const evidenceCount = Array.isArray(memory?.evidence) ? memory.evidence.length : 0;
    if (!memory || !study || !currentHash) return { currentHash, evidenceCount };
    memory.releasedBlocks[blockId].sourceHash = 'stale-fixture-source';
    for (const card of Object.values(memory.cards || {})) {
      if (card?.blockId === blockId) card.sourceHash = 'stale-fixture-source';
    }
    study.completed = false;
    study.blockRecallDone = false;
    localStorage.setItem(memoryKey, JSON.stringify(memory));
    localStorage.setItem(studyKey, JSON.stringify(study));
    return { currentHash, evidenceCount };
  }, { memoryKey: MEMORY_KEY, studyKey, blockId: fixture.blockId });
  check(Boolean(preRevision.currentHash), 'revision_fixture_has_current_source_hash');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(({ memoryKey, blockId, currentHash }) => {
    const state = JSON.parse(localStorage.getItem(memoryKey) || 'null');
    return state?.releasedBlocks?.[blockId]?.sourceHash === currentHash;
  }, { memoryKey: MEMORY_KEY, blockId: fixture.blockId, currentHash: preRevision.currentHash });

  memory = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(memory.releasedBlocks[fixture.blockId].sourceHash === preRevision.currentHash, 'content_revision_refreshes_release_hash');
  check(memory.evidence.length === preRevision.evidenceCount, 'content_revision_preserves_memory_evidence');
  check(Object.values(memory.cards).filter((card) => card?.blockId === fixture.blockId).every((card) => card.sourceHash === preRevision.currentHash), 'content_revision_refreshes_card_payload_version');
  check(Boolean(memory.cards[`core:${fixture.kpIds[0]}`]?.contentChangedAt), 'content_revision_marks_changed_core');
  check(memory?.attention?.[`core:${fixture.kpIds[0]}`]?.reviewRequested !== true, 'content_revision_does_not_replay_first_pass_weak_signal');

  await page.goto(`${BASE}${MEMORY_ROUTE}`, { waitUntil: 'networkidle' });
  check((await page.locator('[data-memory-summary-today]').textContent())?.trim() === '1', 'content_revision_surfaces_changed_evidence_for_review');

  report.completed_at = new Date().toISOString();
  report.status = 'PASS';
  report.block_id = fixture.blockId;
  report.object_id = fixture.objectId;
  report.core_count = fixture.kpIds.length;
  report.precision_count = fixture.precisionCount;
  report.release_event = 'BLOCK_COMPLETE';
  report.replay_policy = 'ONE_TIME_PER_BLOCK_ID';
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`XIZONG_MEMORY_AUTO_RELEASE_BROWSER PASS | checks=${report.checks.length}`);
  await context.close();
} catch (error) {
  report.completed_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
