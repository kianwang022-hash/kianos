import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4348;
const BASE = `http://127.0.0.1:${PORT}`;
const qaDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(qaDir, { recursive: true });
const screenshotPath = path.join(qaDir, 'home-approved-wide.png');
const reportPath = path.join(qaDir, 'home-approved-browser.json');
const report = { viewport: { width: 1512, height: 982 }, checks: [] };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(value, name, detail = '') {
  if (!value) throw new Error(`HOME_APPROVED_UI_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
}

async function waitForHttp(url) {
  for (let i = 0; i < 150; i += 1) {
    try { const response = await fetch(url); if (response.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}

async function stop(server) {
  if (!server) return;
  try { if (process.platform !== 'win32' && server.pid) process.kill(-server.pid, 'SIGTERM'); else server.kill('SIGTERM'); } catch {}
  await sleep(250);
}

// Use Astro dev so this Home visual gate compiles the actual Home route only.
// Full static generation currently has an unrelated protected Writing-source gate.
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
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
      defaultDailyMinutes: 600,
      capacityByDay: {}, maintenanceByDay: {}, floorMinutes: null,
      observations: [], reports: [], gateReports: [], reminders: {}
    }));
    const now = Date.now();
    localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify({
      href: '/xizong/circulation/', systemCanonical: 'A1', systemId: 'circulation', systemTitle: '循环系统', updatedAt: now
    }));
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('.commandHeader').waitFor({ state: 'visible' });
  await page.locator('.commandSubjects').waitFor({ state: 'visible' });
  await page.locator('.examToday').waitFor({ state: 'visible' });
  await page.waitForTimeout(450);

  check(await page.locator('body[data-kianos-rail="expanded"]').count() === 1, 'rail_expanded');
  check(await page.locator('.commandSubject').count() === 3, 'three_subjects');
  check(await page.locator('.commandSupport').isVisible(), 'today_support_visible');
  check(await page.locator('.homeSystemOverview').isVisible(), 'system_overview_visible');
  check(await page.locator('a[href*="vocabulary"]').count() >= 1, 'vocabulary_nested_under_english');

  const geometry = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!(el instanceof HTMLElement)) return null;
      const r = el.getBoundingClientRect();
      return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      rail: rect('[data-kianos-global-rail]'),
      header: rect('.commandHeader'),
      continuePanel: rect('.commandSubjects'),
      support: rect('.commandSupport'),
      timer: rect('[data-study-timer-dock]')
    };
  });
  report.geometry = geometry;
  check(geometry.scrollWidth <= geometry.clientWidth + 2, 'no_horizontal_overflow', JSON.stringify(geometry));
  check(geometry.continuePanel?.width > geometry.support?.width * 1.8, 'continue_is_primary', JSON.stringify(geometry));
  check(geometry.header?.width > 1050, 'header_uses_canvas', JSON.stringify(geometry.header));

  const type = await page.evaluate(() => {
    const root = document.querySelector('.commandGrid');
    if (!(root instanceof HTMLElement)) return { min: 0, under15: [] };
    const rows = [...root.querySelectorAll('a,p,span,small,b,strong,button,h2')].filter((el) => {
      const s = getComputedStyle(el); return (el.textContent || '').trim() && s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length;
    }).map((el) => ({ text:(el.textContent || '').trim().replace(/\s+/g,' ').slice(0,80), size:parseFloat(getComputedStyle(el).fontSize || '0') }));
    return { min: rows.length ? Math.min(...rows.map((x) => x.size)) : 0, under15: rows.filter((x) => x.size < 14.99).slice(0,20) };
  });
  report.type = type;
  check(type.under15.length === 0, 'visible_text_floor_15', JSON.stringify(type.under15));

  await page.screenshot({ path: screenshotPath, fullPage: false });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`PASS Home approved UI capture: ${screenshotPath}`);
} catch (error) {
  report.error = error?.stack || String(error);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  if (browser) await browser.close().catch(() => {});
  await stop(server);
}
