import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4334;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-system-workspace.json');
const report = {
  schema: 'kianos.xizong.system_workspace.v1',
  started_at: new Date().toISOString(),
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  systems: [],
  checks: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_SYSTEM_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

const systems = [
  { lane: 'A1', route: '/xizong/circulation/' },
  { lane: 'A2', route: '/xizong/respiratory/' },
  { lane: 'A3', route: '/xizong/urinary/' }
];

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}${systems[0].route}`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_SYSTEM_WORKSPACE_SERVER_NOT_READY');
}

async function scanTypeFloor(root, lane) {
  const result = await root.evaluate((node) => {
    const selector = 'p,li,td,th,figcaption,span,small,b,strong,em,label,button,summary,code';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = (el.textContent || '').trim();
        if (!value) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return {
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      failures: rows.filter((row) => row.size < 14.99).slice(0, 20)
    };
  });
  check(result.failures.length === 0, `${lane}_visible_type_floor_15`, JSON.stringify(result));
  return result.min;
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

  for (const item of systems) {
    await page.goto(`${BASE}${item.route}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });

    const root = page.locator('[data-xizong-system]');
    await root.waitFor({ state: 'visible' });
    check((await root.getAttribute('data-representation-gate')) === 'kianos.xizong.representation.v1', `${item.lane}_representation_gate_active`);
    check((await root.getAttribute('data-system-framework-plan')) === 'purpose-first', `${item.lane}_purpose_first_system_plan`);
    check(await root.locator('[data-representation-kind="SIMPLE_CHAIN"]').count() >= 1, `${item.lane}_explicit_system_spine_is_simple_chain`);
    check(await root.locator('[data-representation-kind="STRUCTURED_TEXT"]').count() >= 2, `${item.lane}_safe_structured_text_present`);
    check(await root.locator('[data-system-section="recall"]:visible').count() === 0, `${item.lane}_system_recall_not_in_first_pass_workspace`);

    const geometry = await root.evaluate((node) => {
      const left = node.querySelector('.xv6SystemRail')?.getBoundingClientRect();
      const main = node.querySelector('.xv6SystemMain')?.getBoundingClientRect();
      const right = node.querySelector('.xv6SystemContext')?.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      return {
        left: left?.width || 0,
        main: main?.width || 0,
        right: right?.width || 0,
        top: rect.top,
        bottom: rect.bottom,
        viewport: window.innerHeight
      };
    });
    check(geometry.left >= 200 && geometry.left <= 230, `${item.lane}_system_route_readable_width`, JSON.stringify(geometry));
    check(geometry.right >= 285 && geometry.right <= 315, `${item.lane}_system_context_readable_width`, JSON.stringify(geometry));
    check(geometry.main > geometry.left * 2.2, `${item.lane}_system_framework_dominant`, JSON.stringify(geometry));
    check(geometry.bottom <= geometry.viewport + 2, `${item.lane}_normal_system_workspace_fits_viewport`, JSON.stringify(geometry));

    const minType = await scanTypeFloor(root, item.lane);

    const blockLinks = root.locator('[data-system-block]');
    check(await blockLinks.count() >= 2, `${item.lane}_block_route_has_multiple_entries`);
    const secondTitle = (await blockLinks.nth(1).locator('span').textContent())?.trim() || '';
    await blockLinks.nth(1).hover();
    await page.waitForTimeout(40);
    check((await root.locator('[data-selected-title]').textContent())?.trim() === secondTitle, `${item.lane}_block_route_updates_selected_context`);

    const failureButtons = root.locator('[data-failure-id]');
    check(await failureButtons.count() > 0, `${item.lane}_failure_explorer_available`);
    await failureButtons.first().click();
    const failureTitle = (await root.locator('[data-failure-run-title]').textContent())?.trim() || '';
    const failureChain = (await root.locator('[data-failure-run-chain]').textContent())?.trim() || '';
    check(failureTitle && failureTitle !== '选择一个 Failure', `${item.lane}_failure_focus_updates_title`, failureTitle);
    check(failureChain && !failureChain.startsWith('只看它'), `${item.lane}_failure_focus_uses_current_chain_or_fail_closed_text`, failureChain);

    const dependency = root.locator('.xv6Dependency');
    if (await dependency.count()) {
      await dependency.locator('summary').click();
      check(await dependency.locator('li').count() > 0, `${item.lane}_dependency_stays_structured_text`);
      check(await dependency.locator('svg,canvas').count() === 0, `${item.lane}_dependency_does_not_generate_graph`);
    }

    const screenshot = path.join(auditDir, `xizong-system-${item.lane.toLowerCase()}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    report.systems.push({ lane: item.lane, route: item.route, min_visible_type_px: minType, geometry, status: 'PASS' });
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_SYSTEM_WORKSPACE_PASS');
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
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