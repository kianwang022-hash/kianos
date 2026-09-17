import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4330;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-functional-audit/', import.meta.url);
const checks = [];
let failure = null;

const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_HOME_READABILITY_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

async function waitForServer() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_HOME_PREVIEW_SERVER_NOT_READY');
}

async function visibleTextBelowFloor(page, floorPx = 16) {
  return page.locator('body').evaluate((root, floor) => {
    const offenders = [];
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = String(walker.currentNode.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || !/[A-Za-z0-9\u3400-\u9FFF]/.test(text)) continue;
      const element = walker.currentNode.parentElement;
      if (!element) continue;
      const closedDetails = element.closest('details:not([open])');
      if (closedDetails && !element.closest('summary')) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      if (!element.getClientRects().length) continue;
      const size = Number.parseFloat(style.fontSize);
      if (!Number.isFinite(size) || size >= floor) continue;
      const key = `${element.tagName}.${element.className || ''}:${size}:${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      offenders.push({ tag: element.tagName, className: String(element.className || ''), size, text: text.slice(0, 100) });
    }
    return offenders.slice(0, 50);
  }, floorPx);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/politics/`, { waitUntil: 'networkidle' });

  const tiny = await visibleTextBelowFloor(page, 16);
  check(tiny.length === 0, 'home_visible_text_floor_16px', JSON.stringify(tiny));

  const bodySelectors = [
    '[data-politics-continue-meta]',
    '[data-politics-handoff-summary]',
    '.politicsSubjectIdentity p',
    '.politicsOverviewFoot'
  ];
  for (const selector of bodySelectors) {
    const nodes = page.locator(selector);
    if (!(await nodes.count())) continue;
    const sizes = await nodes.evaluateAll(items => items.filter(node => node.getClientRects().length > 0).map(node => Number.parseFloat(getComputedStyle(node).fontSize)));
    check(sizes.every(size => size >= 17), `home_body_copy_17px_${selector}`, JSON.stringify(sizes));
  }

  const continueLink = page.locator('[data-politics-continue]');
  check(await continueLink.isVisible(), 'home_continue_visible');
  check(Boolean(await continueLink.getAttribute('href')), 'home_continue_has_target');
  check(await page.locator('[data-politics-review-entry]').isVisible(), 'home_review_entry_visible');

  await page.screenshot({ path: new URL('politics-home-readable.png', auditDir).pathname, fullPage: false });
  await context.close();
  console.log('POLITICS_HOME_READABILITY_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('politics-home-readability.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.home_readability.v1',
    checks,
    failure,
    status: failure ? 'FAIL' : 'PASS'
  }, null, 2));
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise(resolve => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
