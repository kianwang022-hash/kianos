import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4337;
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTE = '/xizong/respiratory/r08/';
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-block-presentation-workspace.json');
const frontShot = path.join(auditDir, 'xizong-block-presentation-front.png');
const recallShot = path.join(auditDir, 'xizong-block-presentation-recall.png');
const report = {
  schema: 'kianos.xizong.block_presentation_workspace.v1',
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  route: ROUTE,
  started_at: new Date().toISOString(),
  checks: [],
  console_errors: [],
  page_errors: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_BLOCK_PRESENTATION_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(`${BASE}${ROUTE}`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_BLOCK_PRESENTATION_SERVER_NOT_READY');
}

async function scanVisibleType(root, stage) {
  const result = await root.evaluate((node) => {
    const all = 'p,li,td,th,figcaption,span,small,b,strong,em,label,button,summary,code,kbd';
    const body = 'p,li,td,th,figcaption';
    const rows = [...node.querySelectorAll(all)]
      .filter((el) => {
        const text = (el.textContent || '').trim();
        if (!text || /^[‹›←→+\-×÷·•]+$/.test(text)) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0'),
        body: el.matches(body)
      }));
    return {
      count: rows.length,
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      minBody: rows.some((row) => row.body) ? Math.min(...rows.filter((row) => row.body).map((row) => row.size)) : null,
      under15: rows.filter((row) => row.size < 14.99).slice(0, 12),
      bodyUnder16: rows.filter((row) => row.body && row.size < 15.99).slice(0, 12)
    };
  });
  check(result.under15.length === 0, `${stage}_visible_type_floor_15`, JSON.stringify(result.under15));
  check(result.bodyUnder16.length === 0, `${stage}_body_copy_floor_16`, JSON.stringify(result.bodyUnder16));
  report.checks.push({ name: `${stage}_type_summary`, pass: true, detail: JSON.stringify({ count: result.count, min: result.min, minBody: result.minBody }) });
}

async function geometry(root) {
  return root.evaluate((node) => {
    const layout = node.querySelector('[data-study-layout]');
    const left = node.querySelector('.portedStudyOutline');
    const main = node.querySelector('.portedStudyMain');
    const right = node.querySelector('.portedStudyChain');
    const rect = (el) => el?.getBoundingClientRect() || { width: 0, height: 0 };
    return {
      root: rect(node).width,
      left: rect(left).width,
      main: rect(main).width,
      right: rect(right).width,
      grid: layout ? getComputedStyle(layout).gridTemplateColumns : '',
      inlineStyle: layout?.getAttribute('style') || '',
      auxWeight: node.dataset.auxWeight || '',
      layoutAuxWeight: layout?.dataset.auxWeight || '',
      outlineCollapsed: Boolean(layout?.classList.contains('outline-collapsed')),
      chainCollapsed: Boolean(layout?.classList.contains('chain-collapsed'))
    };
  });
}

async function setAuxWeight(page, root, weight) {
  await root.evaluate((node, nextWeight) => {
    node.dispatchEvent(new CustomEvent('kianos:xizong-aux-change', { detail: { weight: nextWeight, slot: 'presentation_acceptance' } }));
  }, weight);
  await page.waitForFunction((nextWeight) => {
    const node = document.querySelector('[data-xizong-v6-block]');
    const layout = node?.querySelector('[data-study-layout]');
    return node?.dataset.auxWeight === nextWeight && layout?.dataset.auxWeight === nextWeight;
  }, weight);
  await sleep(220);
  return geometry(root);
}

async function waitStage(page, stage) {
  await page.locator(`[data-study-stage="${stage}"]`).waitFor({ state: 'visible' });
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});

let browser;
let page;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  page = await context.newPage();
  page.on('pageerror', (error) => report.page_errors.push(String(error?.stack || error)));
  page.on('console', (message) => { if (message.type() === 'error') report.console_errors.push(message.text()); });

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
  check(await root.evaluate((node) => node.classList.contains('xzBlockWorkspace')), 'current_block_presentation_namespace_active');
  check(await page.locator('[data-xizong-visible-type-floor]').count() === 1, 'type_floor_evidence_marker_preserved');
  check((await root.locator('[data-study-layout]').getAttribute('style') || '').includes('grid-template-columns') === false, 'layout_has_no_inline_grid_owner');

  await scanVisibleType(root, 'block_learn');
  await page.screenshot({ path: frontShot, fullPage: false });

  const none = await setAuxWeight(page, root, 'none');
  check(none.left >= 150 && none.left <= 215, 'none_aux_left_rail_narrow', JSON.stringify(none));
  check(none.right >= 180 && none.right <= 235, 'none_aux_compact_right_rail', JSON.stringify(none));
  check(none.main > none.left * 2.3, 'none_aux_central_workspace_dominant', JSON.stringify(none));

  const light = await setAuxWeight(page, root, 'light');
  check(light.right >= 255 && light.right <= 315, 'light_aux_expands_right_rail', JSON.stringify(light));
  check(light.right > none.right + 35, 'light_aux_is_wider_than_none', JSON.stringify({ none: none.right, light: light.right }));

  const rich = await setAuxWeight(page, root, 'rich');
  check(rich.right >= 380, 'rich_aux_receives_visual_table_width', JSON.stringify(rich));
  check(rich.right > light.right + 60, 'rich_aux_is_wider_than_light', JSON.stringify({ light: light.right, rich: rich.right }));
  check(!rich.inlineStyle.includes('grid-template-columns'), 'rich_aux_still_css_owned', rich.inlineStyle);

  await root.locator('[data-toggle-outline]').click();
  await page.waitForFunction(() => document.querySelector('[data-study-layout]')?.classList.contains('outline-collapsed'));
  await sleep(220);
  const leftCollapsed = await geometry(root);
  check(leftCollapsed.left <= 2, 'outline_collapse_releases_left_column', JSON.stringify(leftCollapsed));
  await root.locator('[data-toggle-outline]').click();
  await page.waitForFunction(() => !document.querySelector('[data-study-layout]')?.classList.contains('outline-collapsed'));
  await sleep(220);

  await root.locator('[data-toggle-chain]').click();
  await page.waitForFunction(() => document.querySelector('[data-study-layout]')?.classList.contains('chain-collapsed'));
  await sleep(220);
  const rightCollapsed = await geometry(root);
  check(rightCollapsed.right <= 2, 'aux_collapse_releases_right_column', JSON.stringify(rightCollapsed));
  await root.locator('[data-toggle-chain]').click();
  await page.waitForFunction(() => !document.querySelector('[data-study-layout]')?.classList.contains('chain-collapsed'));
  await sleep(220);
  await setAuxWeight(page, root, 'none');

  await root.locator('[data-stage-next="logic_group"]').click();
  await waitStage(page, 'source_contact');
  check(await root.locator('[data-learner-kp-companion="source_contact"]').count() === 1, 'source_contact_companion_preserved');
  await scanVisibleType(root, 'source_contact');

  await root.locator('[data-source-contact-done]').click();
  await waitStage(page, 'logic_group');
  await scanVisibleType(root, 'logic_group');
  await root.locator('[data-enter-group]').click();
  const kpLearn = root.locator('[data-study-stage="kp_learn"]');
  if (await kpLearn.isVisible().catch(() => false)) {
    await root.locator('[data-group-lecture-done]').click();
  }
  await waitStage(page, 'kp_recall');
  const activeCard = root.locator('[data-kp-recall-card]:not([hidden])');
  await activeCard.waitFor({ state: 'visible' });
  check(!(await activeCard.locator('[data-kp-answer]').isVisible()), 'recall_front_answer_hidden');
  await scanVisibleType(root, 'kp_recall_front');
  await activeCard.locator('[data-kp-reveal]').click();
  check(await activeCard.locator('[data-kp-answer]').isVisible(), 'recall_reveal_restores_core');
  await scanVisibleType(root, 'kp_recall_revealed');
  await page.screenshot({ path: recallShot, fullPage: false });

  const learnerPayload = JSON.parse((await page.locator('[data-xizong-learner-object-payload]').textContent()) || '{}');
  const objectId = await root.getAttribute('data-study-object');
  const kpIds = (learnerPayload.kps || []).map((kp) => kp?.identity?.kpId).filter(Boolean);
  const groupCount = (learnerPayload.logicGroups || []).length;
  check(Boolean(objectId) && kpIds.length > 0, 'legal_block_close_fixture_has_current_ids', `${objectId}:${kpIds.length}`);
  await page.evaluate(({ key, kpIds: ids, groupCount: groups }) => {
    const learned = Object.fromEntries(ids.map((id) => [id, true]));
    const ratings = Object.fromEntries(ids.map((id) => [id, 'known']));
    localStorage.setItem(key, JSON.stringify({
      stage: 'block_recall',
      groupIndex: Math.max(0, groups - 1),
      kpIndex: 0,
      learned,
      ratings,
      sourceContactDone: true,
      blockRecallDone: false,
      completed: false
    }));
  }, { key: `kianos-xizong-astro-v2:${objectId}`, kpIds, groupCount });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const closeRoot = page.locator('[data-xizong-v6-block]');
  await closeRoot.waitFor({ state: 'visible' });
  await waitStage(page, 'block_recall');
  await scanVisibleType(closeRoot, 'block_recall');
  await closeRoot.locator('[data-block-recall-complete]').click();
  await waitStage(page, 'block_complete');
  await scanVisibleType(closeRoot, 'block_complete');
  check(!(await closeRoot.locator('[data-block-complete]').isDisabled()), 'block_complete_action_available_after_legal_recall_state');
  await closeRoot.locator('[data-block-complete]').click();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), `kianos-xizong-astro-v2:${objectId}`);
  check(stored.completed === true, 'block_complete_runtime_write_preserved');

  check(report.page_errors.length === 0, 'no_page_errors', JSON.stringify(report.page_errors));
  check(report.console_errors.length === 0, 'no_console_errors', JSON.stringify(report.console_errors));
  report.status = 'PASS';
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_BLOCK_PRESENTATION_WORKSPACE_PASS');
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.finished_at = new Date().toISOString();
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  if (page) await page.screenshot({ path: path.join(auditDir, 'xizong-block-presentation-failure.png'), fullPage: false }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
