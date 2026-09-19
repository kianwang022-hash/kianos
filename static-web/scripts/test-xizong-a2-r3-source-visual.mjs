import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4327;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.r3_source_visual.v2', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_R3_SOURCE_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(`${BASE}/xizong/respiratory/r03/`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('A2_R3_SOURCE_VISUAL_SERVER_NOT_READY');
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
  await page.goto(`${BASE}/xizong/respiratory/r03/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-learner-object-payload]').count() === 1, 'unified_learner_object_payload_present');
  check(await root.locator('[data-xizong-group-visuals]').count() === 0, 'legacy_group_visual_dom_owner_retired');
  const visualRoot = root.locator('[data-learner-asset="visual"][data-learner-asset-id="a2-r03-lg01-visual"]');

  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  check(await visualRoot.isVisible(), 'reviewed_group_visual_available_during_kp_learn_source_contact');
  check(await visualRoot.locator('xpath=ancestor::*[@data-learner-object-slot="kp_learn_aux"]').count() === 1,
    'source_contact_group_visual_uses_kp_learn_aux_slot');
  check((await root.locator('[data-xizong-aux-surface] [data-learner-object-slot]').getAttribute('data-representation-stage')) === 'KP_LEARN',
    'source_contact_group_visual_uses_kp_learn_stage');
  check(await root.locator('[data-kp-answer]:visible').count() === 0,
    'source_contact_group_visual_does_not_expose_recall_answer_surface');
  await root.locator('[data-source-contact-done]').click();
  await page.waitForFunction(() => {
    const host = document.querySelector('[data-xizong-v6-block]');
    const ttsx = host?.querySelector('[data-study-stage="ttsx_checkpoint"]');
    const recall = host?.querySelector('[data-study-stage="kp_recall"]');
    return (ttsx instanceof HTMLElement && !ttsx.hidden) || (recall instanceof HTMLElement && !recall.hidden);
  });
  const ttsxStage = root.locator('[data-study-stage="ttsx_checkpoint"]');
  if (await ttsxStage.isVisible()) await root.locator('[data-ttsx-done]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });

  await visualRoot.waitFor({ state: 'visible' });
  check(await visualRoot.locator('xpath=ancestor::*[@data-learner-object-slot="kp_recall_aux"]').count() === 1,
    'group_visual_follows_current_kp_recall_aux_slot');
  check((await root.locator('[data-xizong-aux-surface] [data-learner-object-slot]').getAttribute('data-representation-stage')) === 'KP_RECALL_FRONT',
    'group_visual_uses_safe_recall_front_stage');
  const figures = visualRoot.locator('.xv6LearnerVisualGallery figure');
  check(await figures.count() === 3, 'three_reviewed_source_objects_rendered', String(await figures.count()));

  const pages = await figures.evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.sourcePage || 0)));
  check(JSON.stringify(pages) === JSON.stringify([55, 60, 63]), 'source_pages_are_exact_reviewed_set', JSON.stringify(pages));
  const objects = await figures.evaluateAll((nodes) => nodes.map((node) => node.dataset.sourceObject || ''));
  check(objects.length === 3 && objects.every(Boolean) && new Set(objects).size === 3,
    'three_distinct_reviewed_source_object_ids_preserved', JSON.stringify(objects));

  const visualText = await visualRoot.textContent() || '';
  check(visualText.includes('病理 Lecture PDF P54–64'), 'reviewed_source_coverage_visible');
  check(visualText.includes('分清‘管’与‘泡’各自坏在哪里'), 'existing_micro_task_preserved');

  const srcs = await visualRoot.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') || ''));
  check(srcs.length === 3 && srcs.every(Boolean), 'three_asset_urls_present', JSON.stringify(srcs));
  for (const src of srcs) {
    const response = await page.request.get(new URL(src, BASE).toString());
    check(response.ok(), 'source_asset_http_ok', `${response.status()}:${src}`);
  }

  await visualRoot.screenshot({ path: path.join(auditDir, 'r3-source-visual.png') });

  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, 'natural_source_group_does_not_reopen_lecture');
  check(await visualRoot.isVisible(), 'reviewed_source_visual_remains_as_safe_recall_support');
  check(await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]').isHidden(), 'recall_answer_still_hidden_before_reveal');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.semantic_surface = 'kianos.xizong.learner_object.v1';
  fs.writeFileSync(path.join(auditDir, 'r3-source-visual.json'), JSON.stringify(report, null, 2));
  console.log('A2_R3_SOURCE_VISUAL_PASS');
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'r3-source-visual.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  server.stdout?.destroy(); server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
