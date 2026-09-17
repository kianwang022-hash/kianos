import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4336;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-home-workspace.json');
const report = { schema: 'kianos.xizong.home_workspace.v1', started_at: new Date().toISOString(), checks: [] };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_HOME_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_HOME_SERVER_NOT_READY');
}

async function scanTypeFloor(root) {
  return root.evaluate((node) => {
    const rows = [...node.querySelectorAll('p,span,small,strong,b,a,button,li')]
      .filter((el) => {
        const style = getComputedStyle(el);
        return (el.textContent || '').trim() && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({ text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), size: Number.parseFloat(getComputedStyle(el).fontSize || '0') }));
    return { min: rows.length ? Math.min(...rows.map((row) => row.size)) : null, failures: rows.filter((row) => row.size < 14.99).slice(0, 20) };
  });
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

  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-home-workspace]');
  await root.waitFor({ state: 'visible' });
  check(await root.evaluate((node) => node.classList.contains('xzHome')), 'current_home_namespace');
  check(await root.evaluate((node) => ![...node.querySelectorAll('*')].some((el) => [...el.classList].some((name) => ['xzOverviewHeader','xzOverviewLayout','xzSystemWorkbench','xzOpenDomain','xzSystemRows','xzSystemRow','xzOverviewCompanion','xizongHomeTools','xizongContinue'].includes(name)))), 'retired_home_namespace_absent');

  const memory = root.locator('[data-xizong-memory-entry]');
  check(await memory.count() === 1, 'standalone_memory_entry_present');
  check((await memory.getAttribute('href') || '').includes('/xizong/memory/'), 'standalone_memory_entry_target');
  check(await root.locator('.xzHomeSystemRow').count() > 0, 'system_rows_present');

  const type = await scanTypeFloor(root);
  check(type.failures.length === 0, 'visible_type_floor_15', JSON.stringify(type));

  const geometry = await root.evaluate((node) => {
    const workspace = node.querySelector('.xzHomeWorkspace')?.getBoundingClientRect();
    const systems = node.querySelector('.xzHomeSystems')?.getBoundingClientRect();
    const companion = node.querySelector('.xzHomeCompanion')?.getBoundingClientRect();
    const action = node.querySelector('.xzHomeActionBar')?.getBoundingClientRect();
    return { workspace: workspace?.width || 0, systems: systems?.width || 0, companion: companion?.width || 0, action: action?.width || 0 };
  });
  check(geometry.workspace > 900, 'home_uses_mac_width', JSON.stringify(geometry));
  check(geometry.systems > geometry.companion * 2, 'system_workbench_is_dominant', JSON.stringify(geometry));
  check(geometry.companion >= 290, 'companion_is_readable', JSON.stringify(geometry));

  await page.evaluate(() => localStorage.setItem('kianos-xizong-last-location-v1', JSON.stringify({ href:'/xizong/circulation/b01/', systemCanonical:'A1', systemId:'circulation', blockLabel:'B1', blockTitle:'循环总论' })));
  await page.reload({ waitUntil: 'domcontentloaded' });
  check((await page.locator('[data-xizong-continue-title]').textContent() || '').includes('循环总论'), 'continue_restores_last_location');
  check((await page.locator('[data-xizong-continue]').getAttribute('href') || '').includes('/xizong/circulation/b01/'), 'continue_restores_last_href');

  const screenshot = path.join(auditDir, 'xizong-home.png');
  await page.screenshot({ path: screenshot, fullPage: false });
  report.status = 'PASS';
  report.min_visible_type_px = type.min;
  report.geometry = geometry;
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_HOME_WORKSPACE_PASS');
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  report.finished_at = new Date().toISOString();
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
