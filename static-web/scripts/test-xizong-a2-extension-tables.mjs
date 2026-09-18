import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.extension_tables_browser.v2', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_EXTENSION_TABLE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(`${BASE}/xizong/respiratory/r01/`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('A2_EXTENSION_TABLE_SERVER_NOT_READY');
}

async function resetBlock(page, route) {
  await page.goto(`${BASE}/xizong/respiratory/${route}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-learner-object-payload]').count() === 1, `learner_object_present_${route}`);
  return root;
}

async function readLearnerObject(page) {
  const raw = await page.locator('[data-xizong-learner-object-payload]').textContent();
  return JSON.parse(raw || '{}');
}

async function completeNaturalSourceContact(root, page, suffix) {
  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, `natural_source_has_no_group_lecture_${suffix}`);
  await root.locator('[data-source-contact-done]').click();
  await page.waitForFunction(() => {
    const host = document.querySelector('[data-xizong-v6-block]');
    const ttsx = host?.querySelector('[data-study-stage="ttsx_checkpoint"]');
    const recall = host?.querySelector('[data-study-stage="kp_recall"]');
    return (ttsx instanceof HTMLElement && !ttsx.hidden) || (recall instanceof HTMLElement && !recall.hidden);
  });
  const ttsxStage = root.locator('[data-study-stage="ttsx_checkpoint"]');
  if (await ttsxStage.isVisible()) await root.locator('[data-ttsx-done]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
}

async function reachTargetGroup(root, page, targetKpId, { syntheticNavigation = false } = {}) {
  const targetCard = root.locator(`[data-kp-recall-card][data-kp-id="${targetKpId}"]`);
  check(await targetCard.count() === 1, `target_card_exists_${targetKpId}`);
  const learner = await readLearnerObject(page);
  const targetKp = (learner?.kps || []).find((kp) => kp?.identity?.kpId === targetKpId);
  const targetGroupId = targetKp?.identity?.logicGroupId || '';
  const targetGroupIndex = (learner?.logicGroups || []).findIndex((group) => group?.identity?.logicGroupId === targetGroupId);
  check(targetGroupIndex >= 0, `target_group_resolved_${targetKpId}`, targetGroupId);
  const targetGroupButton = root.locator(`[data-group-target="${targetGroupIndex}"]`);
  check(await targetGroupButton.count() === 1, `target_group_button_unique_${targetKpId}`, String(targetGroupIndex));

  await completeNaturalSourceContact(root, page, targetKpId);
  if (syntheticNavigation) await targetGroupButton.evaluate((el) => el.click());
  else await targetGroupButton.click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  const auxHost = root.locator('[data-xizong-aux-surface] [data-learner-object-slot="kp_recall_aux"][data-representation-stage="KP_RECALL_FRONT"]');
  await auxHost.waitFor({ state: 'attached' });
  return { targetCard, auxHost };
}

const representatives = [
  {
    route: 'r01',
    kpId: 'respiratory-r01-kp15',
    slot: 'respiratory-r01-lg04-ventilation-pattern-comparison',
    retiredImage: 'r01-p170-obstructive-restrictive.webp',
    expected: ['阻塞性通气障碍', '限制性通气障碍', 'FEV1/FVC']
  },
  {
    route: 'r10',
    kpId: 'respiratory-r10-kp03',
    slot: 'respiratory-r10-lg01-effusion-mechanism-comparison',
    retiredImage: 'r10-p67-transudate-exudate-mechanism.webp',
    expected: ['静水压', '胶体渗透压', '渗出性胸水']
  },
  {
    route: 'r10',
    kpId: 'respiratory-r10-kp04',
    slot: 'respiratory-r10-lg01-light-criteria',
    retiredImage: 'r10-p68-light-criteria.webp',
    expected: ['Light 标准', '>0.5', '>0.6']
  }
];

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

    for (const item of representatives) {
      const root = await resetBlock(page, item.route);
      const { auxHost } = await reachTargetGroup(root, page, item.kpId, { syntheticNavigation: viewport.label === 'narrow' });
      const auxSurface = root.locator('[data-xizong-aux-surface]');
      const slotCard = auxHost.locator(`[data-learner-asset="extension"][data-learner-asset-id="${item.slot}"]`);
      const folded = auxHost.locator(`details.xv6LearnerReference:has([data-learner-asset-id="${item.slot}"])`);

      check(await slotCard.count() === 1, `single_learner_object_instance_${viewport.label}_${item.slot}`, String(await slotCard.count()));
      check(await folded.count() === 1, `reference_wrapper_present_${viewport.label}_${item.slot}`);
      check(!(await folded.getAttribute('open')), `collapsed_by_default_${viewport.label}_${item.slot}`);
      check(await page.locator(`img[src*="${item.retiredImage}"]`).count() === 0,
        `retired_screenshot_not_served_${viewport.label}_${item.slot}`);

      const table = slotCard.locator('table.xv6LearnerTable');
      check(await table.count() === 1, `native_table_dom_present_${viewport.label}_${item.slot}`);
      const text = (await slotCard.textContent()) || '';
      for (const expected of item.expected) check(text.includes(expected), `expected_text_${viewport.label}_${item.slot}`, expected);

      if (viewport.label === 'desktop') {
        check(await auxSurface.isVisible(), `desktop_aux_surface_visible_${item.slot}`);
        check(!(await slotCard.isVisible()), `desktop_table_body_folded_${item.slot}`);
        await folded.locator('summary').click();
        check(await slotCard.isVisible(), `desktop_extension_visible_after_open_${item.slot}`);
        const layout = await page.evaluate((slot) => {
          const cardNode = document.querySelector(`[data-learner-asset="extension"][data-learner-asset-id="${slot}"]`);
          const wrap = cardNode?.querySelector('.xv6LearnerTableWrap');
          return {
            wrapperClientWidth: wrap?.clientWidth || 0,
            wrapperScrollWidth: wrap?.scrollWidth || 0
          };
        }, item.slot);
        check(layout.wrapperClientWidth > 0 && layout.wrapperScrollWidth >= layout.wrapperClientWidth,
          `desktop_table_container_valid_${item.slot}`, JSON.stringify(layout));
        await folded.locator('summary').click();
      } else {
        // Current Mac-first workspace intentionally suppresses the auxiliary rail below 1100px.
        // Narrow acceptance therefore checks semantic DOM/native-table parity plus no page overflow,
        // rather than inventing a new mobile Extension surface in this content migration.
        check(await auxSurface.isHidden(), `narrow_aux_policy_preserved_${item.slot}`);
        check(!(await slotCard.isVisible()), `narrow_hidden_aux_does_not_surface_answer_${item.slot}`);
        const layout = await page.evaluate(() => ({
          bodyScrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth
        }));
        check(layout.bodyScrollWidth <= layout.viewportWidth + 2,
          `narrow_no_page_horizontal_overflow_${item.slot}`, JSON.stringify(layout));
      }

      const recallAux = root.locator('[data-xizong-aux-surface] [data-learner-object-slot="kp_recall_aux"]');
      check((await recallAux.getAttribute('data-representation-stage')) === 'KP_RECALL_FRONT',
        `recall_front_stage_${viewport.label}_${item.slot}`);
      check(await folded.count() === 1,
        `reference_extension_retained_in_recall_context_${viewport.label}_${item.slot}`);
      check(!(await slotCard.isVisible()),
        `reference_extension_body_collapsed_on_recall_front_${viewport.label}_${item.slot}`);
    }

    await context.close();
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.semantic_surface = 'kianos.xizong.learner_object.v1';
  report.viewports = ['1440x1050', '390x844'];
  report.narrow_policy = 'CURRENT_AUX_RAIL_HIDDEN_BELOW_1100_NO_NEW_MOBILE_SURFACE';
  fs.writeFileSync(path.join(auditDir, 'extension-structured-tables.json'), JSON.stringify(report, null, 2));
  console.log('A2_EXTENSION_TABLE_BROWSER_PASS');
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'extension-structured-tables.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  server.stdout?.destroy(); server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
