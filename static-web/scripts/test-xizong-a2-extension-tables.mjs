import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.extension_tables_browser.v1', started_at: new Date().toISOString(), checks: [] };
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
  return root;
}

async function completeNaturalSourceContact(root, suffix) {
  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, `natural_source_has_no_group_lecture_${suffix}`);
  await root.locator('[data-source-contact-done]').click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
}

async function reachTargetKp(root, targetId) {
  const targetCard = root.locator(`[data-kp-recall-card][data-kp-id="${targetId}"]`);
  check(await targetCard.count() === 1, `target_card_exists_${targetId}`);
  const targetIndex = Number(await targetCard.getAttribute('data-kp-recall-card'));
  const targetGroupLabel = ((await targetCard.locator('header > span').first().textContent()) || '').trim();
  check(Boolean(targetGroupLabel), `target_group_label_present_${targetId}`);
  const targetGroupButton = root.locator('[data-group-target]').filter({ hasText: targetGroupLabel });
  check(await targetGroupButton.count() === 1, `target_group_button_unique_${targetId}`, targetGroupLabel);

  await completeNaturalSourceContact(root, targetId);
  await targetGroupButton.click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
  await root.locator('[data-enter-group]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  await root.locator(`[data-kp-target="${targetIndex}"]`).evaluate((el) => el.click());
  check(await targetCard.isVisible(), `target_card_visible_${targetId}`);
  return targetCard;
}

const representatives = [
  {
    route: 'r01',
    kpId: 'respiratory-r01-kp15',
    slot: 'respiratory-r01-lg04-ventilation-pattern-comparison',
    expected: ['阻塞性通气障碍', '限制性通气障碍', 'FEV1/FVC']
  },
  {
    route: 'r10',
    kpId: 'respiratory-r10-kp03',
    slot: 'respiratory-r10-lg01-effusion-mechanism-comparison',
    expected: ['静水压', '胶体渗透压', '渗出性胸水']
  },
  {
    route: 'r10',
    kpId: 'respiratory-r10-kp04',
    slot: 'respiratory-r10-lg01-light-criteria',
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
      const card = await reachTargetKp(root, item.kpId);
      const answer = card.locator('[data-kp-answer]');
      const slotCard = root.locator(`[data-xizong-extension-slot="${item.slot}"]`);
      const folded = root.locator(`[data-xizong-extension-fold="${item.slot}"]`);

      check(await slotCard.count() === 1, `single_dom_instance_${viewport.label}_${item.slot}`, String(await slotCard.count()));
      check(await answer.isHidden(), `answer_hidden_before_reveal_${viewport.label}_${item.kpId}`);
      check(!(await slotCard.isVisible()), `extension_hidden_on_recall_front_${viewport.label}_${item.slot}`);
      check(await root.locator('[data-study-stage="group_close"] [data-xizong-extension-slot]').count() === 0,
        `kp_owned_asset_not_duplicated_on_group_close_${viewport.label}_${item.slot}`);

      await card.locator('[data-kp-reveal]').click();
      check(await answer.isVisible(), `answer_visible_after_reveal_${viewport.label}_${item.kpId}`);
      check(await folded.count() === 1, `collapsed_wrapper_present_${viewport.label}_${item.slot}`);
      check(!(await folded.getAttribute('open')), `collapsed_by_default_${viewport.label}_${item.slot}`);
      check(!(await slotCard.isVisible()), `table_body_stays_folded_after_reveal_${viewport.label}_${item.slot}`);

      await folded.locator('summary').click();
      check(await slotCard.isVisible(), `extension_visible_after_open_${viewport.label}_${item.slot}`);
      const table = slotCard.locator('table.xizongExtensionTable');
      check(await table.count() === 1, `native_table_present_${viewport.label}_${item.slot}`);
      const text = (await slotCard.textContent()) || '';
      for (const expected of item.expected) check(text.includes(expected), `expected_text_${viewport.label}_${item.slot}`, expected);

      if (viewport.label === 'narrow') {
        const layout = await page.evaluate((slot) => {
          const cardNode = document.querySelector(`[data-xizong-extension-slot="${slot}"]`);
          const wrap = cardNode?.querySelector('.xizongExtensionTableWrap');
          return {
            bodyScrollWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            wrapperClientWidth: wrap?.clientWidth || 0,
            wrapperScrollWidth: wrap?.scrollWidth || 0
          };
        }, item.slot);
        check(layout.bodyScrollWidth <= layout.viewportWidth + 2, `no_page_horizontal_overflow_${item.slot}`, JSON.stringify(layout));
        check(layout.wrapperClientWidth > 0 && layout.wrapperScrollWidth >= layout.wrapperClientWidth,
          `table_overflow_contained_${item.slot}`, JSON.stringify(layout));
      }
    }

    await context.close();
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.viewports = ['1440x1050', '390x844'];
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
