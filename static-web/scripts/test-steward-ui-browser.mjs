import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../steward-ui-audit');
fs.mkdirSync(auditDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`STEWARD_UI_FAIL:${code}${detail ? ':' + detail : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/steward/`);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('STEWARD_UI_DEV_SERVER_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1512, height: 820 } });
    await context.addInitScript(() => {
      const now = Date.now();
      const state = {
        schema: 'kianos.study-timer.v2',
        running: false,
        manualPaused: false,
        subject: 'xizong',
        context: { subject: 'xizong', route: 'test', detailKey: 'test', detailLabel: '呼吸系统' },
        segmentStartedAt: null,
        lastSeenAt: now,
        revision: 1,
        updatedAt: now
      };
      const ledger = {
        schema: 'kianos.study-timer.v2',
        sessions: [
          {
            id: 'steward-test-xz',
            subject: 'xizong',
            context: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
            startedAt: now - 110 * 60 * 1000,
            endedAt: now - 50 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-en',
            subject: 'english',
            context: { subject: 'english', route: 'test', detailKey: 'reading', detailLabel: 'Reading A' },
            startedAt: now - 45 * 60 * 1000,
            endedAt: now - 15 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          }
        ]
      };
      localStorage.setItem('kianos-study-timer-state-v2', JSON.stringify(state));
      localStorage.setItem('kianos-study-timer-ledger-v2', JSON.stringify(ledger));
    });

    const page = await context.newPage();
    await page.goto(`${BASE}/steward/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-steward-workspace]').waitFor({ state: 'visible' });

    check(await page.locator('[data-kianos-global-rail]').isVisible(), 'l1_missing');
    check((await page.locator('.kianosRailItem.active').textContent())?.trim() === 'Steward', 'l1_active');
    check(await page.locator('[data-kianos-subject-bar]').count() === 0, 'invented_l2');

    check(await page.locator('[data-steward-view="today"]').getAttribute('class') === 'active', 'today_default');
    check(await page.locator('[data-steward-mode="schedule"]').getAttribute('class') === 'active', 'schedule_default');

    const visibleToday = await page.locator('[data-steward-view-panel].active').getAttribute('data-steward-view-panel');
    check(visibleToday === 'today', 'today_only_view', String(visibleToday));

    await page.locator('[data-steward-mode="nutrition"]').click();
    check(await page.locator('[data-steward-mode-panel="nutrition"]').getAttribute('class') === 'stewardModePanel active', 'nutrition_switch');

    await page.locator('[data-steward-view="week"]').click();
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '这一周', 'week_header');
    check(await page.locator('.stewardWeekDayHead').count() === 7, 'week_x7_heads');
    check(await page.locator('.stewardWeekAxis span').count() >= 8, 'week_time_axis');
    check(await page.locator('.stewardWeekActual').count() >= 1, 'week_actual_trace');
    check(await page.locator('[data-steward-view-panel].active').count() === 1, 'week_view_exclusive');
    await page.screenshot({ path: path.join(auditDir, 'week-1512x820.png'), fullPage: false });

    await page.locator('[data-steward-view="today"]').click();
    check(await page.locator('[data-steward-mode="schedule"]').getAttribute('class') === 'active', 'today_resets_schedule');
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '今天怎么过', 'today_header');
    await page.screenshot({ path: path.join(auditDir, 'today-1512x820.png'), fullPage: false });

    await page.locator('[data-steward-view="month"]').click();
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '这个月', 'month_header');
    check(await page.locator('.stewardMonthHead').count() === 7, 'month_seven_columns');
    check(await page.locator('.stewardMonthCell.today').count() === 1, 'month_today');
    check(await page.locator('.stewardMonthCell.selected').count() === 1, 'month_selected_today');
    check(await page.locator('.stewardMonthMarks i').count() >= 1, 'month_actual_marks');
    check(await page.locator('[data-steward-view-panel].active').count() === 1, 'month_view_exclusive');
    await page.screenshot({ path: path.join(auditDir, 'month-1512x820.png'), fullPage: false });

    const bodyText = await page.locator('body').innerText();
    check(!/coverage|validator|confidence|UNKNOWN|证据覆盖|候选规律/i.test(bodyText), 'backend_copy_leak');

    const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(bodyOverflow <= 1, 'page_horizontal_overflow', String(bodyOverflow));

    const readableSelectors = [
      '.stewardViewTabs button',
      '.stewardModeTabs button',
      '.stewardMonthCell b',
      '.stewardMonthDetail'
    ];
    for (const selector of readableSelectors) {
      const size = Number.parseFloat(await page.locator(selector).first().evaluate((node) => getComputedStyle(node).fontSize));
      check(size >= 15, 'visible_text_below_floor', `${selector}:${size}`);
    }

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify({
    status: 'PASS',
    viewport: '1512x820',
    l1: 'Steward',
    l2: null,
    views: ['today', 'week', 'month'],
    week_model: 'shared-time-axis-x7',
    month_model: 'calendar-grid',
    full_site_build_dependency: false
  }, null, 2));
  console.log('STEWARD_UI_BROWSER_PASS');
} catch (error) {
  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify({
    status: 'FAIL',
    error: error instanceof Error ? error.stack || error.message : String(error),
    serverLog: serverLog.slice(-12000)
  }, null, 2));
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
