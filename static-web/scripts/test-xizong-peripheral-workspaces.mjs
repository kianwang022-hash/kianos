import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4335;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-peripheral-workspaces.json');
const report = {
  schema: 'kianos.xizong.peripheral_workspaces.v1',
  started_at: new Date().toISOString(),
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  stages: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_PERIPHERAL_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_PERIPHERAL_WORKSPACE_SERVER_NOT_READY');
}

async function scanVisible(root, stage) {
  const result = await root.evaluate((node) => {
    const selector = 'a,p,li,td,th,figcaption,span,small,b,strong,em,label,button,summary,code,kbd,dt,dd,blockquote,input,textarea,select';
    const bodySelector = 'p,li,td,th,figcaption,dt,dd,blockquote';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent || '').trim();
        if (!value || /^[‹›←→+\-×÷·•]+$/.test(value)) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className : '',
        text: (((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ? (el.value || el.placeholder) : el.textContent) || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0'),
        body: el.matches(bodySelector)
      }));
    return {
      count: rows.length,
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      under15: rows.filter((row) => row.size < 14.99).slice(0, 30),
      bodyUnder16: rows.filter((row) => row.body && row.size < 15.99).slice(0, 30)
    };
  });
  report.stages.push({ stage, ...result });
  check(result.under15.length === 0, `${stage}_hard_15px_floor`, JSON.stringify(result.under15));
  check(result.bodyUnder16.length === 0, `${stage}_body_16px_floor`, JSON.stringify(result.bodyUnder16));
}

async function checkComputedFloor(page, selectors, stage) {
  const rows = await page.evaluate((items) => items.map((selector) => {
    const el = document.querySelector(selector);
    return { selector, exists: Boolean(el), size: el ? Number.parseFloat(getComputedStyle(el).fontSize || '0') : null };
  }), selectors);
  report.stages.push({ stage, computed: rows });
  for (const row of rows) {
    check(row.exists, `${stage}_selector_exists`, row.selector);
    check(Number(row.size) >= 14.99, `${stage}_computed_15px_floor`, JSON.stringify(row));
  }
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  // Home: Continue + explicit standalone Memory route + system overview.
  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  const homeTools = page.locator('[data-xizong-home-tools]');
  await homeTools.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-memory-entry]').count() === 1, 'home_memory_entry_present');
  check((await page.locator('[data-xizong-memory-entry]').getAttribute('href') || '').includes('/xizong/memory/'), 'home_memory_entry_routes_to_memory');
  await scanVisible(page.locator('.xzOverviewHeader'), 'home_header');
  await scanVisible(homeTools, 'home_tools');
  await scanVisible(page.locator('.xzOverviewLayout'), 'home_overview');

  // Memory: visible empty state + representative hidden-state controls must all respect the floor.
  await page.goto(`${BASE}/xizong/memory/`, { waitUntil: 'domcontentloaded' });
  const memory = page.locator('[data-xizong-memory-workspace]');
  await memory.waitFor({ state: 'visible' });
  await scanVisible(memory, 'memory_visible');
  await checkComputedFloor(page, [
    '.xzMemoryIdentity span',
    '.xzMemorySummary span',
    '.xzMemoryCardHeader span',
    '.xzMemoryRatings button',
    '.xzMemoryContext span',
    '.xzMemoryRepairCard small',
    '.xzMemoryPromptEditor textarea'
  ], 'memory_representative_states');

  // System Exit + Question: open the later-stage workspace, finish Recall/holdout gate, then enter a real official question.
  await page.goto(`${BASE}/xizong/circulation/`, { waitUntil: 'domcontentloaded' });
  const later = page.locator('[data-xizong-later-stage="system-exit"]');
  check(await later.count() === 1, 'system_exit_available_for_a1');
  await later.evaluate((node) => { node.open = true; });
  const exit = page.locator('[data-xizong-system-exit]');
  await exit.waitFor({ state: 'visible' });
  await scanVisible(exit, 'system_exit_entry');

  await exit.locator('[data-start-recall]').click();
  const dialog = exit.locator('[data-recall-dialog]');
  await dialog.waitFor({ state: 'visible' });
  await scanVisible(dialog, 'system_recall_front');
  await exit.locator('[data-reveal-recall]').click();
  await scanVisible(dialog, 'system_recall_reveal');
  await exit.locator('[data-complete-recall]').click();

  const holdout = exit.locator('[data-holdout-input]');
  await holdout.fill('2026');
  await exit.locator('[data-save-holdout]').click();
  await page.waitForFunction(() => !document.querySelector('[data-xizong-system-exit] [data-start-sweep]')?.disabled);
  await exit.locator('[data-start-sweep]').click();
  const workspace = exit.locator('[data-question-workspace]');
  await workspace.waitFor({ state: 'visible' });
  await scanVisible(workspace, 'official_question_workspace');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_PERIPHERAL_WORKSPACES_PASS');
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
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
