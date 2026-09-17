import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PORT = 4327;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-functional-audit/', import.meta.url);
const checks = [];
let failure = null;
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_C01_SURFACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  console.log(`PASS ${name}${detail ? ` · ${detail}` : ''}`);
};

async function waitForServer() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${BASE}/politics/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('POLITICS_C01_PREVIEW_SERVER_NOT_READY');
}

async function visibleTextBelowFloor(locator, floorPx = 15) {
  return locator.evaluate((root, floor) => {
    const offenders = [];
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = String(walker.currentNode.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || !/[A-Za-z0-9\u3400-\u9FFF]/.test(text)) continue;
      const element = walker.currentNode.parentElement;
      if (!element) continue;
      const closedDetails = element.closest('details:not([open])');
      if (closedDetails && !element.closest('summary')) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      if (!element.getClientRects().length) continue;
      const size = Number.parseFloat(style.fontSize);
      if (!Number.isFinite(size) || size >= floor) continue;
      const key = `${element.tagName}.${element.className || ''}:${size}:${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      offenders.push({ tag: element.tagName, className: String(element.className || ''), size, text: text.slice(0, 100) });
    }
    return offenders.slice(0, 40);
  }, floorPx);
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
  await mkdir(auditDir, { recursive: true });

  await page.goto(`${BASE}/politics/marxism/ch01/#unit-1`, { waitUntil: 'networkidle' });
  const s01 = page.locator('[data-politics-unit][data-unit-id="POL27-CF-MARX-C01-S01"]');
  await s01.waitFor({ state: 'visible' });
  const s01Compiled = s01.locator('[data-compiled-unit="POL27-CF-MARX-C01-S01"]');
  await s01Compiled.waitFor({ state: 'visible' });
  check((await s01Compiled.getAttribute('data-explicit-surface-mapping')) === 'v1', 's01_uses_explicit_surface_mapping');

  const s01Axes = s01Compiled.locator('[data-surface-group="marx-c01-s01-axes"]');
  await s01Axes.waitFor({ state: 'visible' });
  check((await s01Axes.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 's01_axes_are_parallel');
  check((await s01Axes.locator('.explicitParallel > article').count()) === 2, 's01_keeps_two_owned_axis_groups');
  check((await s01Axes.locator('.sequenceTransition').count()) === 0, 's01_parallel_axes_have_no_invented_arrows');
  check((await s01Axes.locator('[data-surface-field="problem"]').count()) === 2, 's01_two_problem_lines_visible');
  check((await s01Axes.locator('[data-surface-field="relation"]').count()) === 2, 's01_two_relation_lines_visible');
  const s01AxesText = (await s01Axes.innerText()).replace(/\s+/g, ' ');
  check(s01AxesText.includes('哲学基本问题的两条轴'), 's01_keeps_first_axis');
  check(s01AxesText.includes('辩证法与形而上学'), 's01_keeps_second_axis');
  check(s01AxesText.includes('两条轴回答不同问题'), 's01_axis_relation_text_visible');

  const s01Boundary = s01Compiled.locator('[data-surface-group="marx-c01-s01-boundary"]');
  await s01Boundary.waitFor({ state: 'visible' });
  check((await s01Boundary.getAttribute('data-surface-primitive')) === 'STATEMENT', 's01_boundary_is_statement');
  const s01BoundaryText = (await s01Boundary.innerText()).replace(/\s+/g, ' ');
  check(s01BoundaryText.includes('三组判断不要串轴'), 's01_boundary_visible');
  check((await s01Compiled.locator('[data-purpose-first-geometry], .purposeChain, .purposeTextMap').count()) === 0, 's01_legacy_geometry_absent');
  const s01Tiny = await visibleTextBelowFloor(s01Compiled, 15);
  check(s01Tiny.length === 0, 's01_learner_text_floor_15px', JSON.stringify(s01Tiny));
  await page.screenshot({ path: new URL('marx-c01-s01-explicit-surface.png', auditDir).pathname, fullPage: true });

  await page.goto(`${BASE}/politics/marxism/ch01/#unit-2`, { waitUntil: 'networkidle' });
  const s02 = page.locator('[data-politics-unit][data-unit-id="POL27-CF-MARX-C01-S02"]');
  await s02.waitFor({ state: 'visible' });
  const s02Compiled = s02.locator('[data-compiled-unit="POL27-CF-MARX-C01-S02"]');
  await s02Compiled.waitFor({ state: 'visible' });
  check((await s02Compiled.getAttribute('data-explicit-surface-mapping')) === 'v1', 's02_uses_explicit_surface_mapping');

  const s02Chain = s02Compiled.locator('[data-surface-group="marx-c01-s02-world-chain"]');
  await s02Chain.waitFor({ state: 'visible' });
  check((await s02Chain.getAttribute('data-surface-primitive')) === 'DIRECTED_SEQUENCE', 's02_world_model_is_directed_sequence');
  check((await s02Chain.locator('.sequenceItem').count()) === 9, 's02_keeps_nine_current_beats', String(await s02Chain.locator('.sequenceItem').count()));
  check((await s02Chain.locator('.sequenceTransition').count()) === 8, 's02_has_exact_eight_owned_transitions');
  check((await s02Chain.locator('[data-surface-field="problem"]').count()) === 9, 's02_nine_problem_lines_visible');
  check((await s02Chain.locator('[data-surface-field="relation"]').count()) === 9, 's02_nine_relation_lines_visible');
  const s02Text = (await s02Chain.innerText()).replace(/\s+/g, ' ');
  check(s02Text.includes('物质范畴'), 's02_keeps_material_category');
  check(s02Text.includes('人工智能边界'), 's02_keeps_ai_boundary_beat');
  check(s02Text.includes('世界的物质统一性'), 's02_keeps_material_unity');
  check(s02Text.includes('物质决定意识'), 's02_node_relation_text_visible');

  const s02Boundaries = s02Compiled.locator('[data-surface-group="marx-c01-s02-boundaries"]');
  await s02Boundaries.waitFor({ state: 'visible' });
  check((await s02Boundaries.getAttribute('data-surface-primitive')) === 'PARALLEL_SET', 's02_boundaries_are_parallel');
  check((await s02Boundaries.locator('.explicitParallel > article').count()) === 4, 's02_keeps_four_current_boundaries');
  check((await s02Boundaries.locator('.sequenceTransition').count()) === 0, 's02_boundaries_have_no_invented_direction');
  check((await s02Compiled.locator('[data-purpose-first-geometry], .purposeChain, .purposeTextMap').count()) === 0, 's02_legacy_geometry_absent');
  const s02Tiny = await visibleTextBelowFloor(s02Compiled, 15);
  check(s02Tiny.length === 0, 's02_learner_text_floor_15px', JSON.stringify(s02Tiny));
  await page.screenshot({ path: new URL('marx-c01-s02-explicit-surface.png', auditDir).pathname, fullPage: true });

  await context.close();
  console.log('POLITICS_MARX_C01_EXPLICIT_SURFACE_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('marx-c01-purpose-first.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.marx_c01_explicit_surface.v3',
    checks,
    failure,
    status: failure ? 'FAIL' : 'PASS'
  }, null, 2));
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
