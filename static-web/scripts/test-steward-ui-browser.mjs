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
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date(now));
      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;
      const studyDay = `${year}-${month}-${day}`;
      const atShanghai = (hour, minute) => Date.parse(
        `${studyDay}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`
      );
      const todayXizongStart = atShanghai(9, 0);
      const todayXizongEnd = atShanghai(10, 0);
      const todayEnglishStart = atShanghai(10, 15);
      const todayEnglishEnd = atShanghai(10, 45);
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
            id: 'steward-test-prev-xz',
            subject: 'xizong',
            context: { subject: 'xizong', route: 'test', detailKey: 'cardio', detailLabel: '循环系统' },
            startedAt: todayXizongStart - 24 * 60 * 60 * 1000,
            endedAt: todayXizongEnd - 24 * 60 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-prev2-pol',
            subject: 'politics',
            context: { subject: 'politics', route: 'test', detailKey: 'mainline', detailLabel: '一轮主线' },
            startedAt: todayEnglishStart - 48 * 60 * 60 * 1000,
            endedAt: todayEnglishEnd - 48 * 60 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-xz',
            subject: 'xizong',
            context: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
            startedAt: todayXizongStart,
            endedAt: todayXizongEnd,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-en',
            subject: 'english',
            context: { subject: 'english', route: 'test', detailKey: 'reading', detailLabel: 'Reading A' },
            startedAt: todayEnglishStart,
            endedAt: todayEnglishEnd,
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
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
    await page.goto(`${BASE}/steward/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-steward-workspace]').waitFor({ state: 'visible' });

    check(await page.locator('[data-kianos-global-rail]').isVisible(), 'l1_missing');
    check((await page.locator('.kianosRailItem.active').textContent())?.trim() === 'Steward', 'l1_active');
    check(await page.locator('[data-kianos-subject-bar]').count() === 0, 'invented_l2');

    const dock = page.locator('[data-study-timer-dock]');
    await dock.waitFor({ state: 'visible' });
    const dockSubject = String(await dock.locator('[data-study-timer-subject]').textContent() || '').trim();
    check(dockSubject.includes('西综') && dockSubject.includes('呼吸系统'), 'dock_native_detail', dockSubject);
    const todayHref = await dock.locator('[data-study-timer-today]').getAttribute('href');
    check(Boolean(todayHref && todayHref.endsWith('/steward/')), 'dock_today_route', String(todayHref));
    for (const selector of ['[data-study-timer-subject]', '[data-study-timer-pause]', '[data-study-timer-today]']) {
      const size = Number.parseFloat(await dock.locator(selector).evaluate((node) => getComputedStyle(node).fontSize));
      check(size >= 15, 'dock_text_below_floor', `${selector}:${size}`);
    }

    check(await page.locator('[data-steward-view="today"]').getAttribute('class') === 'active', 'today_default');
    check(await page.locator('[data-steward-mode="schedule"]').getAttribute('class') === 'active', 'schedule_default');
    check(await page.locator('.stewardActualBlock').count() >= 1, 'today_actual_blocks');
    check(await page.locator('.stewardActualBlock strong').first().isVisible(), 'today_actual_label');
    check(await page.locator('[data-steward-task-section]').isHidden(), 'empty_task_region_hidden');

    const visibleToday = await page.locator('[data-steward-view-panel].active').getAttribute('data-steward-view-panel');
    check(visibleToday === 'today', 'today_only_view', String(visibleToday));

    await page.locator('[data-steward-mode="nutrition"]').click();
    check(await page.locator('[data-steward-nutrition-unavailable]').isVisible(), 'nutrition_unavailable_state');
    check(await page.locator('[data-steward-meal-preset]').count() === 0, 'nutrition_no_copied_presets');
    check(!/Z01|Z02|Z03|黑麦酸奶碗|三文鱼组合|甜虾组合/.test(await page.locator('body').innerText()), 'nutrition_personal_semantics_leak');

    await page.locator('[data-steward-mode="training"]').click();
    check(await page.locator('[data-steward-training-unavailable]').isVisible(), 'training_unavailable_state');
    check(await page.locator('[data-steward-exercise]').count() === 0, 'training_no_copied_exercises');
    check(!/KN01|PR01|PU03|CD01|CD02|MV02|MV03|Smith squat|Smith bench press|Incline treadmill walk/.test(await page.locator('body').innerText()), 'training_personal_semantics_leak');

    await page.locator('[data-steward-mode="schedule"]').click();
    check(await page.locator('[data-steward-mode-panel="schedule"]').getAttribute('class') === 'stewardModePanel active', 'schedule_return_after_local_modes');

    await page.locator('[data-steward-view="week"]').click();
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '这一周', 'week_header');
    check(await page.locator('.stewardWeekDayHead').count() === 7, 'week_x7_heads', pageErrors.join(' | '));
    check(await page.locator('.stewardWeekAxis span').count() >= 8, 'week_time_axis');
    check(await page.locator('.stewardWeekActual').count() >= 3, 'week_actual_trace');
    check(await page.locator('.stewardWeekDayHead span').filter({ hasText: /h|m/ }).count() >= 2, 'week_daily_totals');
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
    check(!/coverage|validator|confidence|UNKNOWN|证据覆盖|候选规律|\bowner\b|provisional|schema|payload|hash|旧 PR|cable setting|\breset\b/i.test(bodyText), 'backend_copy_leak');

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
