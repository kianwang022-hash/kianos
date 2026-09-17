import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4332;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-visible-type-floor.json');
const report = {
  schema: 'kianos.xizong.visible_type_floor.v1',
  started_at: new Date().toISOString(),
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  stages: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/respiratory/r08/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_VISIBLE_TYPE_FLOOR_SERVER_NOT_READY');
}

async function scanVisibleLearnerText(root, stage) {
  const result = await root.evaluate((node) => {
    const selector = 'p,li,td,th,figcaption,span,small,b,strong,em,label,button,summary,code,kbd';
    const bodySelector = 'p,li,td,th,figcaption';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const text = (el.textContent || '').trim();
        if (!text || /^[‹›←→+\-×÷·•]+$/.test(text)) return false;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        return el.getClientRects().length > 0;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className : '',
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0'),
        body: el.matches(bodySelector)
      }));
    const hardFloorFailures = rows.filter((row) => row.size < 14.99);
    const bodyFloorFailures = rows.filter((row) => row.body && row.size < 15.99);
    return {
      count: rows.length,
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      hardFloorFailures: hardFloorFailures.slice(0, 20),
      bodyFloorFailures: bodyFloorFailures.slice(0, 20)
    };
  });
  report.stages.push({ stage, ...result });
  if (result.hardFloorFailures.length) {
    throw new Error(`XIZONG_VISIBLE_TYPE_FLOOR_FAIL:${stage}:UNDER_15:${JSON.stringify(result.hardFloorFailures)}`);
  }
  if (result.bodyFloorFailures.length) {
    throw new Error(`XIZONG_VISIBLE_TYPE_FLOOR_FAIL:${stage}:BODY_UNDER_16:${JSON.stringify(result.bodyFloorFailures)}`);
  }
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
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
  if (await page.locator('[data-xizong-visible-type-floor]').count() !== 1) throw new Error('XIZONG_VISIBLE_TYPE_FLOOR_MARKER_MISSING');

  await scanVisibleLearnerText(root, 'block_learn');

  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  await scanVisibleLearnerText(root, 'source_contact_kp_companion');

  await root.locator('[data-source-contact-done]').click();
  await root.locator('[data-study-stage="logic_group"]').waitFor({ state: 'visible' });
  await scanVisibleLearnerText(root, 'logic_group_with_aux');

  await root.locator('[data-enter-group]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  await scanVisibleLearnerText(root, 'kp_recall_front');

  await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]').click();
  await scanVisibleLearnerText(root, 'kp_recall_revealed');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_VISIBLE_TYPE_FLOOR_PASS');
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
