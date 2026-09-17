import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4341;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const auditDir = new URL('../../study-timer-ui-audit/', import.meta.url);
const checks = [];
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`STUDY_TIMER_DOCK_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/politics/history/ch01/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('STUDY_TIMER_DOCK_BROWSER_SERVER_NOT_READY');
}

async function verifyPassiveStatusClickThrough(page, prefix) {
  const dock = page.locator('[data-study-timer-dock]');
  const status = dock.locator('.studyTimerStatus');
  const box = await status.boundingBox();
  check(Boolean(box), `${prefix}_status_has_geometry`);
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.evaluate(({ x, y }) => {
    window.__studyTimerProbeClicks = 0;
    document.querySelector('[data-study-timer-probe]')?.remove();
    const probe = document.createElement('button');
    probe.type = 'button';
    probe.setAttribute('data-study-timer-probe', '');
    Object.assign(probe.style, {
      position: 'fixed',
      left: `${x - 18}px`,
      top: `${y - 18}px`,
      width: '36px',
      height: '36px',
      zIndex: '159',
      opacity: '0.01',
      pointerEvents: 'auto'
    });
    probe.addEventListener('click', () => { window.__studyTimerProbeClicks += 1; });
    document.body.append(probe);
  }, point);

  await page.mouse.click(point.x, point.y);
  const clicks = await page.evaluate(() => window.__studyTimerProbeClicks || 0);
  check(clicks === 1, `${prefix}_passive_status_does_not_block_underlying_click`, String(clicks));
  await page.evaluate(() => document.querySelector('[data-study-timer-probe]')?.remove());
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
let failure = null;
try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  const desktop = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await desktop.newPage();
  await page.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'networkidle' });
  const dock = page.locator('[data-study-timer-dock]');
  await dock.waitFor({ state: 'visible' });
  const desktopMetrics = await dock.evaluate(node => ({
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    rootPointerEvents: getComputedStyle(node).pointerEvents,
    statusPointerEvents: getComputedStyle(node.querySelector('.studyTimerStatus')).pointerEvents,
    gripPointerEvents: getComputedStyle(node.querySelector('[data-study-timer-drag-handle]')).pointerEvents
  }));
  check(desktopMetrics.width <= 290, 'desktop_compact_footprint_bounded', JSON.stringify(desktopMetrics));
  check(desktopMetrics.rootPointerEvents === 'none', 'desktop_compact_root_passive', JSON.stringify(desktopMetrics));
  check(desktopMetrics.statusPointerEvents === 'none', 'desktop_status_passive', JSON.stringify(desktopMetrics));
  check(desktopMetrics.gripPointerEvents === 'auto', 'desktop_drag_grip_interactive', JSON.stringify(desktopMetrics));
  await verifyPassiveStatusClickThrough(page, 'desktop');

  const expand = dock.locator('[data-study-timer-expand]');
  await expand.click();
  check((await dock.getAttribute('data-expanded')) === 'true', 'desktop_expand_control_still_interactive');
  const expandedPointerEvents = await dock.evaluate(node => getComputedStyle(node).pointerEvents);
  check(expandedPointerEvents === 'auto', 'expanded_panel_is_intentional_overlay', expandedPointerEvents);
  await expand.click();

  const grip = dock.locator('[data-study-timer-drag-handle]');
  const gripBox = await grip.boundingBox();
  check(Boolean(gripBox), 'desktop_drag_grip_has_geometry');
  await page.mouse.move(gripBox.x + gripBox.width / 2, gripBox.y + gripBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(gripBox.x - 36, gripBox.y - 28, { steps: 3 });
  await page.mouse.up();
  const dragged = await dock.evaluate(node => ({ left: node.style.left, top: node.style.top }));
  check(Boolean(dragged.left && dragged.top), 'desktop_drag_still_works', JSON.stringify(dragged));

  await page.screenshot({ path: new URL('study-timer-desktop.png', auditDir).pathname, fullPage: false });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${BASE}/politics/history/ch01/`, { waitUntil: 'networkidle' });
  const mobileDock = mobilePage.locator('[data-study-timer-dock]');
  await mobileDock.waitFor({ state: 'visible' });
  const mobileMetrics = await mobileDock.evaluate(node => ({
    width: node.getBoundingClientRect().width,
    rightGap: window.innerWidth - node.getBoundingClientRect().right,
    documentOverflow: document.documentElement.scrollWidth - window.innerWidth
  }));
  check(mobileMetrics.width <= 283, 'mobile_compact_footprint_bounded', JSON.stringify(mobileMetrics));
  check(mobileMetrics.documentOverflow <= 1, 'mobile_timer_does_not_create_document_overflow', JSON.stringify(mobileMetrics));
  await verifyPassiveStatusClickThrough(mobilePage, 'mobile');
  await mobilePage.screenshot({ path: new URL('study-timer-mobile.png', auditDir).pathname, fullPage: false });
  await mobile.close();

  console.log('PASS shared study timer dock browser acceptance');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('result.json', auditDir), JSON.stringify({ checks, failure, status: failure ? 'FAIL' : 'PASS' }, null, 2));
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise(resolve => server.once('exit', resolve)), sleep(1000)]);
}
