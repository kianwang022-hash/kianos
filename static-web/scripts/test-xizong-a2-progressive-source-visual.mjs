import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-a2-progressive-source-visual.json');
const report = { schema: 'kianos.xizong.a2.progressive_source_visual.v1', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_PROGRESSIVE_SOURCE_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/respiratory/r08/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('A2_PROGRESSIVE_SOURCE_VISUAL_SERVER_NOT_READY');
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
  await page.goto(`${BASE}/xizong/respiratory/r08/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  const visualRoot = root.locator('[data-xizong-group-visuals]');

  // Current A2 Source truth is one continuous original-Lecture contact before
  // Logic Group retrieval. A Logic-Group visual keeps its accepted moment at
  // the group entrance, so it must not surface before Source contact is done.
  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  check(await visualRoot.isHidden(), 'logic_group_visual_not_shown_during_continuous_source_contact');

  await root.locator('[data-source-contact-done]').click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
  await visualRoot.waitFor({ state: 'visible' });
  const figures = visualRoot.locator('.xv6SourceVisualFigure');
  check(await figures.count() === 1, 'new_partial_content_bundle_renders_without_runtime_change', String(await figures.count()));

  const pages = await figures.evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.sourcePage || 0)));
  check(JSON.stringify(pages) === JSON.stringify([22]), 'reviewed_source_page_is_exact', JSON.stringify(pages));

  const visualText = await visualRoot.textContent() || '';
  check(visualText.includes('内科 Lecture PDF P22'), 'existing_cue_locator_preserved');
  check(visualText.includes('容量、比值和 DLCO 三条轴'), 'existing_cue_micro_task_preserved');

  const image = visualRoot.locator('img');
  check(await image.count() === 1, 'one_reviewed_asset_rendered');
  const src = await image.getAttribute('src') || '';
  check(Boolean(src), 'asset_url_present');
  const response = await page.request.get(new URL(src, BASE).toString());
  check(response.ok(), 'asset_http_ok', `${response.status()}:${src}`);

  // Entering the group now goes directly to neutral Recall: no Lecture reopen.
  await root.locator('[data-enter-group]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, 'natural_source_group_does_not_reopen_lecture');
  check(await visualRoot.isHidden(), 'source_visual_hidden_during_recall_front');
  check(await root.locator('[data-study-stage="kp_recall"] .xv6SourceVisualFigure').count() === 0, 'recall_front_contains_no_source_visual');
  check(await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]').isHidden(), 'recall_answer_remains_hidden_before_reveal');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('A2_PROGRESSIVE_SOURCE_VISUAL_PASS');
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
