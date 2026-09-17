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
  if (!condition) throw new Error(`POLITICS_C01_PURPOSE_FAIL:${name}${detail ? `:${detail}` : ''}`);
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

  await page.goto(`${BASE}/politics/marxism/ch01/#unit-1`, { waitUntil: 'networkidle' });
  const s01 = page.locator('[data-politics-unit][data-unit-id="POL27-CF-MARX-C01-S01"]');
  await s01.waitFor({ state: 'visible' });
  const s01Geometry = s01.locator('[data-purpose-first-geometry]');
  await s01Geometry.waitFor({ state: 'visible' });
  check((await s01Geometry.getAttribute('data-representation')) === 'COMPARE', 's01_uses_safe_compare');
  check(await s01Geometry.locator('[data-purpose-compare]').isVisible(), 's01_compare_is_visible');
  const s01Text = (await s01Geometry.innerText()).replace(/\s+/g, ' ');
  check(s01Text.includes('哲学基本问题的两条轴'), 's01_keeps_first_axis');
  check(s01Text.includes('辩证法与形而上学'), 's01_keeps_second_axis');
  check((await s01Geometry.locator('i').count()) === 0, 's01_compare_does_not_invent_arrows');
  const s01Handoff = s01.locator('[data-current-handoff]');
  await s01Handoff.waitFor({ state: 'visible' });
  const s01HandoffText = (await s01Handoff.innerText()).replace(/\s+/g, ' ');
  check(s01HandoffText.includes('第一节 哲学及其基本问题'), 's01_current_locator_visible');
  check(s01HandoffText.includes('思维和存在是什么关系'), 's01_current_look_for_visible');
  const s01Tiny = await visibleTextBelowFloor(page.locator('body'), 15);
  check(s01Tiny.length === 0, 's01_page_visible_text_floor_15px', JSON.stringify(s01Tiny));
  await page.screenshot({ path: new URL('marx-c01-s01-purpose-first.png', auditDir).pathname, fullPage: true });

  await page.goto(`${BASE}/politics/marxism/ch01/#unit-2`, { waitUntil: 'networkidle' });
  const s02 = page.locator('[data-politics-unit][data-unit-id="POL27-CF-MARX-C01-S02"]');
  await s02.waitFor({ state: 'visible' });
  const s02Geometry = s02.locator('[data-purpose-first-geometry]');
  await s02Geometry.waitFor({ state: 'visible' });
  check((await s02Geometry.getAttribute('data-representation')) === 'STRUCTURED_TEXT', 's02_defaults_to_structured_text');
  check(await s02Geometry.locator('[data-purpose-structured-text]').isVisible(), 's02_structured_text_visible');
  const s02Rows = s02Geometry.locator('[data-purpose-row]');
  check((await s02Rows.count()) === 9, 's02_keeps_nine_current_beats', String(await s02Rows.count()));
  const s02Text = (await s02Geometry.innerText()).replace(/\s+/g, ' ');
  check(s02Text.includes('物质范畴'), 's02_keeps_material_category');
  check(s02Text.includes('人工智能边界'), 's02_keeps_ai_boundary_beat');
  check(s02Text.includes('世界的物质统一性'), 's02_keeps_material_unity');
  check((await s02Geometry.locator('i').count()) === 0, 's02_long_chain_does_not_auto_draw_arrows');
  const closure = (await s02.locator('.politicsClosure > div > p').innerText()).replace(/\s+/g, ' ');
  check(closure.includes('不要背一串定义'), 's02_current_closure_reaches_runtime');
  const s02Tiny = await visibleTextBelowFloor(page.locator('body'), 15);
  check(s02Tiny.length === 0, 's02_page_visible_text_floor_15px', JSON.stringify(s02Tiny));
  await page.screenshot({ path: new URL('marx-c01-s02-purpose-first.png', auditDir).pathname, fullPage: true });

  await context.close();
  console.log('POLITICS_MARX_C01_PURPOSE_FIRST_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('marx-c01-purpose-first.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.marx_c01_purpose_first.v1',
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
