import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const PORT = 4337;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = path.resolve(process.cwd(), '../politics-functional-audit');
const checks = [];
let failure = null;

function check(condition, name, detail = '') {
  const pass = Boolean(condition);
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` · ${detail}` : ''}`);
  if (!pass) throw new Error(`POLITICS_EXPLICIT_SURFACE_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
}

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_EXPLICIT_SURFACE_PREVIEW_NOT_READY');
}

async function goto(page, pathname) {
  const response = await page.goto(`${BASE}${pathname}`, { waitUntil: 'networkidle' });
  check(Boolean(response?.ok()), `page_ok:${pathname}`, String(response?.status() || 'no-response'));
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
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

  // Marx C00 is the original failure case. It must consume an upstream plan,
  // not reconstruct topology from rendered nodes/edges.
  await goto(page, '/politics/marxism/ch00/');
  const origin = page.locator('[data-surface-group="s01-origin-conditions"]');
  const development = page.locator('[data-surface-group="s01-development-sequence"]');
  await origin.waitFor({ state: 'visible' });
  check((await origin.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 'marx_origin_conditions_parallel');
  check((await origin.locator('.sequenceTransition').count()) === 0, 'marx_parallel_group_has_no_arrows');
  check((await development.getAttribute('data-surface-primitive')) === 'DIRECTED_SEQUENCE', 'marx_development_is_directed_sequence');
  check((await development.locator('.sequenceTransition').count()) === 2, 'marx_development_has_exact_two_transitions');
  check((await page.locator('.goldenGraph').count()) === 0, 'marx_legacy_topology_graph_absent');
  check((await page.locator('[data-workspace-unit][data-explicit-surface-mapping="v1"]').count()) === 2, 'marx_c00_two_units_explicitly_mapped');
  await page.screenshot({ path: path.join(auditDir, 'explicit-surface-marx-c00.png'), fullPage: false });

  // History: real causal direction remains directed.
  await goto(page, '/politics/history/ch01/');
  const historyDirected = page.locator('[data-surface-group="h-c01-s01-cause-to-turn"]');
  check((await historyDirected.getAttribute('data-surface-primitive')) === 'DIRECTED_SEQUENCE', 'history_real_cause_to_turn_remains_directed');
  check((await page.locator('[data-compiled-unit][data-explicit-surface-mapping="v1"]').count()) === 4, 'history_ch01_all_pass_units_use_explicit_plan');
  await page.screenshot({ path: path.join(auditDir, 'explicit-surface-history-c01.png'), fullPage: false });

  // Mao: two combinations stay peers, not a fabricated sequence.
  await goto(page, '/politics/mao/ch00/');
  const maoPair = page.locator('[data-surface-group="mao-c00-two-combinations"]');
  check((await maoPair.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 'mao_two_combinations_parallel');
  check((await maoPair.locator('.sequenceTransition').count()) === 0, 'mao_two_combinations_have_no_invented_arrows');
  check((await page.locator('[data-compiled-unit][data-explicit-surface-mapping="v1"]').count()) === 1, 'mao_c00_uses_explicit_plan');
  await page.screenshot({ path: path.join(auditDir, 'explicit-surface-mao-c00.png'), fullPage: false });

  // Ethics/Law: the three core-value levels remain the three Current-owned groups.
  await goto(page, '/politics/ethics_law/ch04/');
  const ethicsLevels = page.locator('[data-surface-group="ethics-c04-s01-three-levels"]');
  check((await ethicsLevels.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 'ethics_three_core_value_levels_parallel');
  check((await ethicsLevels.locator('.explicitParallel > article').count()) === 3, 'ethics_exact_three_owned_groups_visible');
  check((await page.locator('[data-compiled-unit][data-explicit-surface-mapping="v1"]').count()) === 3, 'ethics_c04_all_pass_units_use_explicit_plan');
  await page.screenshot({ path: path.join(auditDir, 'explicit-surface-ethics-c04.png'), fullPage: false });

  // Xi: feature sets and true stage sequence are separately owned in the same chapter.
  await goto(page, '/politics/xi/ch02/');
  const xiFeatures = page.locator('[data-surface-group="xi-c02-k05-features"]');
  const xiStrategy = page.locator('[data-surface-group="xi-c02-s01-strategy"]');
  check((await xiFeatures.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 'xi_modernization_features_are_parallel');
  check((await xiFeatures.locator('.sequenceTransition').count()) === 0, 'xi_features_have_no_invented_direction');
  check((await xiStrategy.getAttribute('data-surface-primitive')) === 'DIRECTED_SEQUENCE', 'xi_real_strategy_stages_are_directed');
  check((await xiStrategy.locator('.sequenceTransition').count()) === 1, 'xi_strategy_has_exact_one_transition');
  check((await page.locator('[data-compiled-unit][data-explicit-surface-mapping="v1"]').count()) === 7, 'xi_c02_all_pass_units_use_explicit_plan');
  await page.screenshot({ path: path.join(auditDir, 'explicit-surface-xi-c02.png'), fullPage: false });

  await context.close();
  console.log('POLITICS_EXPLICIT_SURFACE_BROWSER_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(path.join(auditDir, 'explicit-surface-browser.json'), JSON.stringify({
    schema: 'kianos.politics.explicit_surface_browser_acceptance.v1',
    checks,
    failure,
    status: failure ? 'FAIL' : 'PASS'
  }, null, 2));
  if (browser) {
    try { await browser.close(); } catch {}
  }
  try {
    if (process.platform !== 'win32' && server.pid) process.kill(-server.pid, 'SIGTERM');
    else server.kill('SIGTERM');
  } catch {
    try { server.kill('SIGKILL'); } catch {}
  }
}
