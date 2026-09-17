import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-functional-audit/', import.meta.url);
const samples = [
  { subject: 'marxism', chapter: 'ch01', label: 'marxism' },
  { subject: 'history', chapter: 'ch01', label: 'history' },
  { subject: 'mao', chapter: 'ch01', label: 'mao' },
  { subject: 'xi', chapter: 'ch01', label: 'xi' },
  { subject: 'ethics_law', chapter: 'ch01', label: 'ethics-law' }
];
const checks = [];
let failure = null;
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_BATCH_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
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
  throw new Error('POLITICS_BATCH_PREVIEW_SERVER_NOT_READY');
}

async function visibleTextBelowFloor(page, floorPx = 15) {
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
      offenders.push({ tag: element.tagName, className: String(element.className || ''), size, text: text.slice(0, 90) });
    }
    return offenders.slice(0, 40);
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

  for (const sample of samples) {
    await page.goto(`${BASE}/politics/${sample.subject}/${sample.chapter}/`, { waitUntil: 'networkidle' });
    const target = await page.evaluate(() => {
      const units = [...document.querySelectorAll('[data-politics-unit]')];
      const index = units.findIndex((unit) => unit.querySelector('[data-purpose-first-geometry]'));
      if (index < 0) return null;
      return { index, unitId: units[index].getAttribute('data-unit-id') || '' };
    });
    check(Boolean(target), `${sample.label}_has_pass_unit`);
    await page.evaluate((hash) => { location.hash = hash; }, `unit-${target.index + 1}`);
    const unit = page.locator(`[data-politics-unit][data-unit-id="${target.unitId}"]`);
    await unit.waitFor({ state: 'visible' });
    const geometry = unit.locator('[data-purpose-first-geometry]');
    await geometry.waitFor({ state: 'visible' });
    const rendered = await geometry.getAttribute('data-representation');
    const gated = await geometry.getAttribute('data-gate-representation');
    check(['STRUCTURED_TEXT', 'COMPARE'].includes(rendered || ''), `${sample.label}_safe_render_kind`, `${gated}->${rendered}`);
    check((await geometry.locator('svg,canvas').count()) === 0, `${sample.label}_no_auto_diagram`);
    const text = (await geometry.innerText()).replace(/\s+/g, ' ').trim();
    check(text.length >= 8, `${sample.label}_learner_content_visible`, text.slice(0, 80));
    const tiny = await visibleTextBelowFloor(page, 15);
    check(tiny.length === 0, `${sample.label}_visible_text_floor_15px`, JSON.stringify(tiny));
    await page.screenshot({ path: new URL(`purpose-first-${sample.label}.png`, auditDir).pathname, fullPage: false });
  }

  await context.close();
  console.log('POLITICS_PURPOSE_FIRST_BATCH_MATRIX_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('purpose-first-batch-matrix.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.purpose_first_batch_matrix.v1',
    samples,
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
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
