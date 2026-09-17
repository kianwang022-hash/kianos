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
  schema: 'kianos.xizong.system_workspace.v3',
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
  { lane: 'A1', route: '/xizong/circulation/', expectsGuide: true },
  { lane: 'A2', route: '/xizong/respiratory/', expectsGuide: true },
  { lane: 'A3', route: '/xizong/urinary/', expectsGuide: true }
];

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
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
    const selector = 'p,li,span,small,b,strong,em,label,button,summary,code,h1,h2,h3';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = (el.textContent || '').trim();
        if (!value) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && el.getClientRects().length > 0;
      })
      .map((el) => ({
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

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  for (const item of systems) {
    await page.goto(`${BASE}${item.route}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.clear();
      [...Object.keys(localStorage)]
        .filter((key) => key.startsWith('kianos:xizong:system-view:'))
        .forEach((key) => localStorage.removeItem(key));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    const root = page.locator('[data-xizong-system]');
    await root.waitFor({ state: 'visible' });

    check(await root.evaluate((node) => node.classList.contains('xzSystemWorkspace')), `${item.lane}_current_system_namespace`);
    check(
      await root.evaluate((node) => ![...node.querySelectorAll('*')].some((el) => [...el.classList].some((name) => name.startsWith('xv6System')))),
      `${item.lane}_legacy_system_namespace_absent`
    );
    check((await root.getAttribute('data-representation-gate')) === 'kianos.xizong.representation.v1', `${item.lane}_representation_gate_active`);

    const routeLinks = root.locator('[data-system-block]');
    check(await routeLinks.count() >= 8, `${item.lane}_block_route_present`, String(await routeLinks.count()));
    check(await root.locator('.xzSystemRouteRail small').count() === 0, `${item.lane}_route_counts_demoted`);
    check(await root.locator('[data-selected-title]').count() === 0, `${item.lane}_selected_block_duplicate_removed`);
    check(await root.locator('.xzSystemKeys,.xzSystemGuide').count() === 0, `${item.lane}_permanent_help_removed`);

    const contextPanel = root.locator('[data-system-context]');
    check(await contextPanel.count() === 1, `${item.lane}_conditional_context_owner_present`);
    check(await contextPanel.isHidden(), `${item.lane}_context_hidden_by_default`);

    if (item.expectsGuide) {
      const guide = root.locator('[data-system-view="guide"]');
      check(await guide.count() === 1, `${item.lane}_beginner_guide_adopted`);
      check(await guide.isVisible(), `${item.lane}_guide_is_default_first_entry`);
      check(await guide.locator('[data-guide-role]').count() >= 5, `${item.lane}_guide_has_structured_sections`);
      check(await guide.getByText('Current System / Block owner', { exact: false }).count() === 0, `${item.lane}_guide_has_no_engineering_owner_copy`);
    }

    const topGeometry = await root.evaluate((node) => {
      const top = node.querySelector('.xzSystemTopbar')?.getBoundingClientRect();
      const body = node.querySelector('.xzSystemBody')?.getBoundingClientRect();
      const route = node.querySelector('.xzSystemRouteRail')?.getBoundingClientRect();
      const stage = node.querySelector('.xzSystemStage')?.getBoundingClientRect();
      const context = node.querySelector('.xzSystemContext')?.getBoundingClientRect();
      return {
        topHeight: top?.height || 0,
        bodyWidth: body?.width || 0,
        routeWidth: route?.width || 0,
        stageWidth: stage?.width || 0,
        contextWidth: context?.width || 0,
        contextHidden: node.querySelector('.xzSystemContext')?.hasAttribute('hidden') || false
      };
    });
    check(topGeometry.topHeight > 60 && topGeometry.topHeight < 140, `${item.lane}_compact_system_identity`, JSON.stringify(topGeometry));
    check(topGeometry.bodyWidth > 1000, `${item.lane}_uses_mac_width`, JSON.stringify(topGeometry));
    check(topGeometry.routeWidth >= 220 && topGeometry.routeWidth <= 250, `${item.lane}_route_readable_width`, JSON.stringify(topGeometry));
    check(topGeometry.stageWidth > topGeometry.routeWidth * 3, `${item.lane}_cognitive_stage_dominant`, JSON.stringify(topGeometry));
    check(topGeometry.contextHidden, `${item.lane}_no_permanent_right_rail`, JSON.stringify(topGeometry));

    const frameworkButton = root.locator('[data-system-view-button="framework"]');
    check(await frameworkButton.count() === 1, `${item.lane}_framework_view_available`);
    await frameworkButton.click();
    const framework = root.locator('[data-system-view="framework"]');
    check(await framework.isVisible(), `${item.lane}_framework_switch_works`);
    check(await root.locator('[data-representation-kind="SIMPLE_CHAIN"]').count() >= 1, `${item.lane}_explicit_system_spine_is_chain`);
    check(await root.locator('.xzSystemSpine li').count() >= 5, `${item.lane}_system_spine_visible`);
    check(await root.locator('.xzSystemFailureStrip [data-failure-id]').count() > 0, `${item.lane}_failure_map_present`);

    const axisCount = await root.locator('.xzSystemAxis').count();
    check(axisCount >= 5, `${item.lane}_judgment_axes_present`, String(axisCount));

    const failureButtons = root.locator('[data-failure-id]');
    await failureButtons.first().click();
    check(await contextPanel.isVisible(), `${item.lane}_failure_opens_context`);
    const failureTitle = (await root.locator('[data-failure-run-title]').textContent())?.trim() || '';
    const failureChain = (await root.locator('[data-failure-run-chain]').textContent())?.trim() || '';
    check(Boolean(failureTitle && failureTitle !== '—'), `${item.lane}_failure_context_title`, failureTitle);
    check(Boolean(failureChain), `${item.lane}_failure_context_chain`, failureChain);

    const openGeometry = await root.evaluate((node) => {
      const route = node.querySelector('.xzSystemRouteRail')?.getBoundingClientRect();
      const stage = node.querySelector('.xzSystemStage')?.getBoundingClientRect();
      const context = node.querySelector('.xzSystemContext')?.getBoundingClientRect();
      return {
        routeWidth: route?.width || 0,
        stageWidth: stage?.width || 0,
        contextWidth: context?.width || 0
      };
    });
    check(openGeometry.contextWidth >= 270 && openGeometry.contextWidth <= 300, `${item.lane}_conditional_context_readable_width`, JSON.stringify(openGeometry));
    check(openGeometry.stageWidth > 500, `${item.lane}_stage_remains_useful_with_context`, JSON.stringify(openGeometry));

    await root.locator('[data-close-system-context]').click();
    check(await contextPanel.isHidden(), `${item.lane}_context_closes_and_returns_width`);

    check(await page.locator('[data-xizong-later-stage="system-exit"]').isHidden(), `${item.lane}_system_exit_hidden_before_eligibility`);

    const minType = await scanTypeFloor(root, item.lane);
    const screenshot = path.join(auditDir, `xizong-system-${item.lane.toLowerCase()}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    report.systems.push({
      lane: item.lane,
      route: item.route,
      min_visible_type_px: minType,
      geometry: { default: topGeometry, context: openGeometry },
      status: 'PASS'
    });
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
