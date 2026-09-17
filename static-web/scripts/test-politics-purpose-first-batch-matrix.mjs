import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const auditDir = new URL('../../politics-functional-audit/', import.meta.url);
const samples = [
  { subject: 'marxism', chapter: 'ch01', label: 'marxism' },
  { subject: 'history', chapter: 'ch01', label: 'history' },
  { subject: 'mao', chapter: 'ch01', label: 'mao' },
  { subject: 'xi', chapter: 'ch01', label: 'xi' },
  { subject: 'ethics_law', chapter: 'ch01', label: 'ethics-law' }
];
const checks = [];
let failure = null;
const check = (condition, name, detail = '') => {
  checks.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`POLITICS_BATCH_BROWSER_FAIL:${name}${detail ? `:${detail}` : ''}`);
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
  throw new Error('POLITICS_BATCH_PREVIEW_SERVER_NOT_READY');
}

async function visibleTextBelowFloor(page, floorPx = 16) {
  return page.locator('body').evaluate((root, floor) => {
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
      offenders.push({ tag: element.tagName, className: String(element.className || ''), size, text: text.slice(0, 90) });
    }
    return offenders.slice(0, 40);
  }, floorPx);
}

async function checkGroups(root, groups, prefix) {
  for (const group of groups || []) {
    const locator = root.locator(`[data-surface-group="${group.id}"]`);
    check((await locator.count()) === 1, `${prefix}_${group.id}_present`);
    check((await locator.getAttribute('data-surface-primitive')) === group.primitive, `${prefix}_${group.id}_primitive_exact`, String(group.primitive || ''));
  }
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await mkdir(auditDir, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  for (const sample of samples) {
    const compiled = loadPoliticsCompiledPresentation(sample.subject, sample.chapter);
    const projection = compiled instanceof Map
      ? [...compiled.values()].find((row) => row?.surfacePlan?.states?.ORIENT?.length > 0)
      : null;
    check(Boolean(projection), `${sample.label}_has_explicit_pass_unit`);

    await page.goto(`${BASE}/politics/${sample.subject}/${sample.chapter}/`, { waitUntil: 'networkidle' });
    const unit = page.locator(`[data-politics-unit][data-unit-id="${projection.unitId}"]`);
    check((await unit.count()) === 1, `${sample.label}_runtime_unit_present`, projection.unitId);
    if (!(await unit.isVisible())) {
      const anchor = await unit.getAttribute('id');
      await page.locator(`.politicsRail a[href="#${anchor}"]`).click();
      await unit.waitFor({ state: 'visible' });
    }

    const geometry = unit.locator(`[data-compiled-unit="${projection.unitId}"]`);
    await geometry.waitFor({ state: 'visible' });
    check((await geometry.getAttribute('data-explicit-surface-mapping')) === 'v1', `${sample.label}_orient_uses_explicit_surface_plan`);
    check((await unit.getAttribute('data-explicit-surface-runtime')) === 'v1', `${sample.label}_stage_runtime_uses_explicit_surface_plan`);

    await checkGroups(geometry, projection.surfacePlan.states.ORIENT, `${sample.label}_orient`);

    const source = unit.locator('.politicsSource');
    await checkGroups(source, projection.surfacePlan.states.EXTERNAL_LEARN || [], `${sample.label}_external`);

    const closure = unit.locator('.politicsClosure');
    await checkGroups(closure, projection.surfacePlan.states.CLOSE || [], `${sample.label}_close`);
    await checkGroups(closure, projection.surfacePlan.states.CONTINUE || [], `${sample.label}_continue`);

    const repairPanels = unit.locator('.politicsRepair');
    const repairCount = await repairPanels.count();
    if (repairCount > 0 && (projection.surfacePlan.states.REPAIR || []).length > 0) {
      check(
        (await unit.locator('.politicsRepair[data-explicit-repair-surface="v1"]').count()) === repairCount,
        `${sample.label}_every_repair_drawer_has_explicit_owner`,
        String(repairCount)
      );
      for (const group of projection.surfacePlan.states.REPAIR) {
        check(
          (await unit.locator(`.politicsRepair [data-surface-group="${group.id}"]`).count()) === repairCount,
          `${sample.label}_repair_${group.id}_consumed`,
          String(repairCount)
        );
      }
      check((await unit.locator('.politicsRepair .politicsPreciseRepair').count()) === 0, `${sample.label}_legacy_precise_repair_not_learner_visible`);
    }

    check((await unit.locator('[data-purpose-first-geometry],.purposeChain,.purposeTextMap').count()) === 0, `${sample.label}_legacy_geometry_absent`);
    check((await unit.locator('[data-hierarchy-tier="H2_FIRST_ROUND_CARRY"],[data-current-handoff],.politicsNextBridge').count()) === 0, `${sample.label}_legacy_stage_payload_absent`);

    const demoted = unit.locator('[data-hierarchy-demoted]');
    if (await demoted.count()) {
      const visibleDemoted = await demoted.evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display !== 'none' && !node.hidden && node.getClientRects().length > 0).map((node) => node.textContent?.trim().slice(0, 60)));
      check(visibleDemoted.length === 0, `${sample.label}_legacy_unselected_copy_stays_quiet`, JSON.stringify(visibleDemoted));
    }

    const tiny = await visibleTextBelowFloor(page, 16);
    check(tiny.length === 0, `${sample.label}_visible_text_floor_16px`, JSON.stringify(tiny));
    const bodySamples = unit.locator('[data-politics-explicit-surface-plan] p,[data-politics-explicit-surface-plan] li,[data-politics-explicit-surface-plan] .sequenceTransition span');
    if (await bodySamples.count()) {
      const sizes = await bodySamples.evaluateAll((nodes) => nodes.filter((node) => node.getClientRects().length > 0).map((node) => Number.parseFloat(getComputedStyle(node).fontSize)));
      check(sizes.every((size) => size >= 16), `${sample.label}_mapped_body_copy_at_least_16px`, JSON.stringify(sizes));
    }
    await page.screenshot({ path: new URL(`explicit-surface-${sample.label}.png`, auditDir).pathname, fullPage: false });
  }

  await context.close();
  console.log('POLITICS_EXPLICIT_SURFACE_BATCH_MATRIX_PASS');
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await mkdir(auditDir, { recursive: true });
  await writeFile(new URL('purpose-first-batch-matrix.json', auditDir), JSON.stringify({
    schema: 'kianos.politics.explicit_surface_batch_matrix.v4',
    samples,
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
