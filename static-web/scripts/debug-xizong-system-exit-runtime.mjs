import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4339;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const outPath = path.join(auditDir, 'xizong-system-exit-runtime-debug.json');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try { const response = await fetch(url); if (response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

const report = { started_at: new Date().toISOString(), page_errors: [], console_errors: [] };
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForHttp(`${BASE}/xizong/circulation/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.page_errors.push(String(error?.stack || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });

  const url = `${BASE}/xizong/circulation/`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);

  const stage = page.locator('[data-xizong-later-stage="system-exit"]');
  await stage.evaluate((node) => { node.open = true; });
  const exit = page.locator('[data-xizong-system-exit="circulation"]');
  const button = exit.locator('[data-start-recall]');
  const dialog = exit.locator('[data-recall-dialog]');

  report.before_click = await page.evaluate(() => {
    const dialogNode = document.querySelector('[data-recall-dialog]');
    const buttonNode = document.querySelector('[data-start-recall]');
    return {
      ready_state: document.readyState,
      sweep_storage_present: Boolean(localStorage.getItem('kianos:xizong:system-question-sweep:circulation:v1')),
      script_sources: [...document.scripts].map((node) => ({ src: node.src, type: node.type || '', payload: node.hasAttribute('data-sweep-payload') })),
      button_present: Boolean(buttonNode),
      button_disabled: Boolean(buttonNode?.disabled),
      dialog_present: Boolean(dialogNode),
      dialog_open: Boolean(dialogNode?.open),
      show_modal_type: typeof dialogNode?.showModal,
      recall_front_present: Boolean(document.querySelector('[data-recall-front]')),
      recall_reveal_present: Boolean(document.querySelector('[data-recall-reveal]'))
    };
  });

  await dialog.evaluate((node) => {
    const original = node.showModal?.bind(node);
    node.showModal = function debugShowModal() {
      node.dataset.debugShowModalCalls = String(Number(node.dataset.debugShowModalCalls || 0) + 1);
      return original?.();
    };
  });

  await button.click();
  await page.waitForTimeout(250);
  report.after_click = await page.evaluate(() => {
    const dialogNode = document.querySelector('[data-recall-dialog]');
    const front = document.querySelector('[data-recall-front]');
    const reveal = document.querySelector('[data-recall-reveal]');
    return {
      dialog_open: Boolean(dialogNode?.open),
      dialog_visible: Boolean(dialogNode && getComputedStyle(dialogNode).display !== 'none' && dialogNode.getClientRects().length),
      show_modal_calls: Number(dialogNode?.dataset.debugShowModalCalls || 0),
      front_hidden: Boolean(front?.hidden),
      reveal_hidden: Boolean(reveal?.hidden)
    };
  });
  report.finished_at = new Date().toISOString();
} catch (error) {
  report.error = String(error?.stack || error);
} finally {
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  if (browser) await browser.close().catch(() => {});
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} }
  }
}

console.log(JSON.stringify(report, null, 2));
