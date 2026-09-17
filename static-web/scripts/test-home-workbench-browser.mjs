import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4342;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'home-workbench-browser.json');
const screenshotPath = path.join(auditDir, 'home-workbench-wide.png');
const report = {
  schema: 'kianos.home.browser_acceptance.v1',
  viewport: { width: 1512, height: 982 },
  started_at: new Date().toISOString(),
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`HOME_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForHttp(url, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

async function stopServer(server) {
  if (!server || server.killed) return;
  try {
    if (process.platform !== 'win32' && server.pid) process.kill(-server.pid, 'SIGTERM');
    else server.kill('SIGTERM');
  } catch {}
  await sleep(350);
  try {
    if (!server.killed) server.kill('SIGKILL');
  } catch {}
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForHttp(`${BASE}/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: report.viewport });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('kianos-global-rail-expanded-v1', '1');
    localStorage.setItem('kianos-exam-orchestrator-v1', JSON.stringify({
      schema: 'kianos.exam.orchestrator.v1',
      defaultDailyMinutes: 630,
      capacityByDay: {},
      maintenanceByDay: {},
      floorMinutes: null,
      observations: [],
      reports: [],
      gateReports: [],
      reminders: {}
    }));

    const now = Date.now();
    const schema = 'kianos.study-timer.v2';
    const xizong = {
      subject: 'xizong',
      route: 'xizong/circulation/',
      detailKey: 'circulation',
      detailLabel: 'A1 · 循环系统'
    };
    localStorage.setItem('kianos-study-timer-state-v2', JSON.stringify({
      schema,
      running: true,
      manualPaused: false,
      subject: 'xizong',
      context: xizong,
      segmentStartedAt: now - 18 * 60_000,
      lastSeenAt: now,
      revision: 3,
      updatedAt: now
    }));
    localStorage.setItem('kianos-study-timer-ledger-v2', JSON.stringify({
      schema,
      sessions: [
        {
          id: 'home-browser-xizong',
          subject: 'xizong',
          context: xizong,
          startedAt: now - 170 * 60_000,
          endedAt: now - 80 * 60_000,
          source: 'timer'
        },
        {
          id: 'home-browser-english',
          subject: 'english',
          context: { subject: 'english', route: 'reading/', detailKey: 'reading', detailLabel: 'Reading A' },
          startedAt: now - 75 * 60_000,
          endedAt: now - 35 * 60_000,
          source: 'timer'
        }
      ]
    }));
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const home = page.locator('[data-home-workbench]');
  await home.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-home-workbench]')?.dataset.schedulerReady === 'true');

  check(await page.locator('[data-home-subject]').count() === 3, 'exact_three_subject_rows');
  for (const subject of ['xizong', 'politics', 'english']) {
    check(await page.locator(`[data-home-subject="${subject}"]`).count() === 1, `subject_${subject}_present`);
  }

  const rail = page.locator('[data-kianos-global-rail]');
  await rail.waitFor({ state: 'visible' });
  check(await page.locator('body[data-kianos-rail="expanded"]').count() === 1, 'global_rail_expanded');

  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) return null;
      const value = node.getBoundingClientRect();
      return { x: value.x, y: value.y, width: value.width, height: value.height, right: value.right, bottom: value.bottom };
    };
    const rows = [...document.querySelectorAll('[data-home-subject]')].map((node) => {
      const value = node.getBoundingClientRect();
      return { subject: node.getAttribute('data-home-subject'), x: value.x, width: value.width, right: value.right, height: value.height };
    });
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
      rail: rect('[data-kianos-global-rail]'),
      canvas: rect('.surfaceBody-home .productCanvas'),
      home: rect('[data-home-workbench]'),
      timer: rect('[data-study-timer-dock]'),
      next: rect('.homeNextStrip'),
      rows
    };
  });
  report.geometry = geometry;

  check(geometry.document.scrollWidth <= geometry.document.clientWidth + 2, 'no_horizontal_document_overflow', JSON.stringify(geometry.document));
  check(Boolean(geometry.home) && geometry.home.width > 900, 'home_uses_landscape_width', JSON.stringify(geometry.home));
  check(geometry.rows.length === 3 && geometry.rows.every((row) => row.width > 900), 'subject_rows_use_workbench_width', JSON.stringify(geometry.rows));
  check(Boolean(geometry.next) && geometry.next.width > 900, 'next_strip_uses_workbench_width', JSON.stringify(geometry.next));
  check(Boolean(geometry.timer)
    && geometry.timer.x >= 0
    && geometry.timer.y >= 0
    && geometry.timer.right <= geometry.viewport.width + 1
    && geometry.timer.bottom <= geometry.viewport.height + 1,
  'timer_inside_viewport', JSON.stringify(geometry.timer));

  const typeAudit = await home.evaluate((node) => {
    const selector = 'a,p,span,small,b,strong,i,button,dt,dd,h1,h2,time';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const text = (el.textContent || '').trim();
        if (!text) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return {
      count: rows.length,
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      under15: rows.filter((row) => row.size < 14.99).slice(0, 30)
    };
  });
  report.type = typeAudit;
  check(typeAudit.count > 0, 'visible_home_text_present');
  check(typeAudit.under15.length === 0, 'home_visible_type_floor_15', JSON.stringify(typeAudit.under15));

  check(await page.locator('[data-home-next-link]').isVisible(), 'next_action_visible');
  check(await page.locator('[data-study-timer-dock]').isVisible(), 'shared_timer_visible');

  await page.screenshot({ path: screenshotPath, fullPage: false });
  report.completed_at = new Date().toISOString();
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`PASS Home browser acceptance · screenshot=${screenshotPath}`);
} catch (error) {
  report.completed_at = new Date().toISOString();
  report.error = error?.stack || error?.message || String(error);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopServer(server);
}
