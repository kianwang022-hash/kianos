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
  check(desktopMetrics.width <= 360, 'desktop_compact_footprint_bounded', JSON.stringify(desktopMetrics));
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

  const pauseControl = dock.locator('[data-study-timer-pause]');
  await page.waitForFunction(() => document.querySelector('[data-study-timer-pause]')?.textContent?.trim() === '暂停');
  await pauseControl.click();
  await dock.locator('[data-study-timer-rest]').waitFor({ state: 'visible' });
  const pausedState = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-study-timer-state-v2') || 'null'));
  check(pausedState?.running === false && pausedState?.manualPaused === true, 'recovery_pause_happens_before_optional_capture');

  await dock.locator('[data-study-timer-rest-minutes="10"]').click();
  await dock.locator('[data-study-timer-rest-method="walk"]').click();
  await dock.locator('[data-study-timer-rest-method="eyes_closed"]').click();
  await dock.locator('[data-study-timer-rest-custom]').fill('阳台吹风');
  await dock.locator('[data-study-timer-rest-note]').fill('有点困，先离开屏幕');
  await dock.locator('[data-study-timer-rest-save]').click();

  const openReality = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-steward-reality-v1') || 'null'));
  const openBreak = openReality?.events?.[0];
  check(Boolean(openBreak) && openBreak.endedAt == null, 'recovery_break_open_after_pause');
  check(openBreak?.plannedRestMinutes === 10, 'recovery_break_duration_persisted', String(openBreak?.plannedRestMinutes));
  check((openBreak?.methods || []).includes('walk') && (openBreak?.methods || []).includes('eyes_closed'), 'recovery_break_methods_persisted');
  check(openBreak?.note === '有点困，先离开屏幕', 'recovery_break_note_persisted');

  await pauseControl.click();
  const resumedState = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-study-timer-state-v2') || 'null'));
  check(resumedState?.running === true && resumedState?.manualPaused === false, 'recovery_resume_is_explicit');
  await dock.locator('[data-study-timer-reentry]').waitFor({ state: 'visible' });
  await dock.locator('[data-study-timer-reentry-status="PARTIAL"]').click();
  await dock.locator('[data-study-timer-reentry-note]').fill('清醒一些，但还没完全恢复');
  await dock.locator('[data-study-timer-reentry-save]').click();

  const finalReality = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-steward-reality-v1') || 'null'));
  const finalBreak = finalReality?.events?.[0];
  check(Number.isFinite(finalBreak?.endedAt) && finalBreak.endedAt >= finalBreak.startedAt, 'recovery_break_closes_on_manual_resume');
  check(finalBreak?.reentry?.status === 'PARTIAL', 'recovery_reentry_report_persisted', String(finalBreak?.reentry?.status || ''));
  check(!/readiness|recovery_score|debt_score/i.test(JSON.stringify(finalReality)), 'recovery_reality_has_no_readiness_score');

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
  check(mobileMetrics.width <= 350, 'mobile_compact_footprint_bounded', JSON.stringify(mobileMetrics));
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
