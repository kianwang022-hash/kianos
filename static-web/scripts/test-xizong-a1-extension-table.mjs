import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4330;
const BASE = `http://127.0.0.1:${PORT}`;
const reportPath = path.resolve(process.cwd(), '.qa/xizong-a1-extension-table.json');
const report = { schema: 'kianos.xizong.a1.extension_table_browser.v1', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A1_EXTENSION_TABLE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(`${BASE}/xizong/circulation/b03/`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('A1_EXTENSION_TABLE_SERVER_NOT_READY');
}

async function resetBlock(page) {
  await page.goto(`${BASE}/xizong/circulation/b03/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-learner-object-payload]').count() === 1, 'learner_object_present');
  return root;
}

async function reachLg01(root, { syntheticNavigation = false } = {}) {
  const targetCard = root.locator('[data-kp-recall-card][data-kp-id="circulation-b03-kp01"]');
  check(await targetCard.count() === 1, 'target_kp01_exists');
  const groupLabel = ((await targetCard.locator('header > span').first().textContent()) || '').trim();
  check(Boolean(groupLabel), 'lg01_label_present');
  const groupButton = root.locator('[data-group-target]').filter({ hasText: groupLabel });
  check(await groupButton.count() === 1, 'lg01_button_unique', groupLabel);

  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  await root.locator('[data-source-contact-done]').click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
  if (syntheticNavigation) await groupButton.evaluate((el) => el.click());
  else await groupButton.click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
  const auxHost = root.locator('[data-xizong-aux-surface] [data-learner-object-slot="logic_group_prelearn"]');
  await auxHost.waitFor({ state: 'attached' });
  return auxHost;
}

const slot = 'circulation-b03-lg01-response-cell-classification';
const retiredImage = 'b03-p138-response-cell-classification.webp';
const expected = ['快反应', '慢反应', '快钠通道 INa', 'ICa-L', '稳定静息，无自动去极化', '自动去极化'];

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { label: 'desktop', width: 1440, height: 1050 },
    { label: 'narrow', width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const root = await resetBlock(page);
    const auxHost = await reachLg01(root, { syntheticNavigation: viewport.label === 'narrow' });
    const auxSurface = root.locator('[data-xizong-aux-surface]');
    const slotCard = auxHost.locator(`[data-learner-asset="extension"][data-learner-asset-id="${slot}"]`);
    const folded = auxHost.locator(`details.xv6LearnerReference:has([data-learner-asset-id="${slot}"])`);

    check(await slotCard.count() === 1, `single_instance_${viewport.label}`, String(await slotCard.count()));
    check(await folded.count() === 1, `reference_wrapper_${viewport.label}`);
    check(!(await folded.getAttribute('open')), `collapsed_by_default_${viewport.label}`);
    check(await page.locator(`img[src*="${retiredImage}"]`).count() === 0, `retired_screenshot_absent_${viewport.label}`);
    const table = slotCard.locator('table.xv6LearnerTable');
    check(await table.count() === 1, `native_table_dom_${viewport.label}`);
    const text = (await slotCard.textContent()) || '';
    for (const value of expected) check(text.includes(value), `expected_text_${viewport.label}`, value);

    if (viewport.label === 'desktop') {
      check(await auxSurface.isVisible(), 'desktop_aux_visible');
      check(!(await slotCard.isVisible()), 'desktop_table_folded');
      await folded.locator('summary').click();
      check(await slotCard.isVisible(), 'desktop_table_visible_after_open');
      const layout = await page.evaluate((assetId) => {
        const card = document.querySelector(`[data-learner-asset="extension"][data-learner-asset-id="${assetId}"]`);
        const wrap = card?.querySelector('.xv6LearnerTableWrap');
        return { clientWidth: wrap?.clientWidth || 0, scrollWidth: wrap?.scrollWidth || 0 };
      }, slot);
      check(layout.clientWidth > 0 && layout.scrollWidth >= layout.clientWidth, 'desktop_table_container_valid', JSON.stringify(layout));
      await folded.locator('summary').click();
    } else {
      check(await auxSurface.isHidden(), 'narrow_aux_policy_preserved');
      check(!(await slotCard.isVisible()), 'narrow_hidden_aux_does_not_surface_answer');
      const layout = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      check(layout.body <= layout.viewport + 2, 'narrow_no_page_horizontal_overflow', JSON.stringify(layout));
    }

    await root.locator('[data-enter-group]').click();
    await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
    const recallAux = root.locator('[data-xizong-aux-surface] [data-learner-object-slot]');
    check((await recallAux.getAttribute('data-representation-stage')) === 'KP_RECALL_FRONT', `recall_front_stage_${viewport.label}`);
    check(await root.locator(`[data-learner-asset="extension"][data-learner-asset-id="${slot}"]`).count() === 0,
      `extension_absent_from_clean_recall_${viewport.label}`);

    await context.close();
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.semantic_surface = 'kianos.xizong.learner_object.v1';
  report.viewports = ['1440x1050', '390x844'];
  report.narrow_policy = 'CURRENT_AUX_RAIL_HIDDEN_BELOW_1100_NO_NEW_MOBILE_SURFACE';
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log('A1_EXTENSION_TABLE_BROWSER_PASS');
} catch (error) {
  report.finished_at = new Date().toISOString();
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
