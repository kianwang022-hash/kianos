import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4347;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
const reportPath = path.join(auditDir, 'xizong-learner-chrome.json');
fs.mkdirSync(auditDir, { recursive: true });

const report = {
  schema: 'kianos.xizong.learner_chrome_audit.v1',
  started_at: new Date().toISOString(),
  routes: []
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForHttp(url, attempts = 120) {
  for (let i = 0; i < attempts; i += 1) {
    try { const r = await fetch(url); if (r.ok) return; } catch {}
    await sleep(200);
  }
  throw new Error(`HTTP_NOT_READY:${url}`);
}
const forbidden = [
  ['current', /\bCurrent\b/i],
  ['canonical', /\bcanonical\b/i],
  ['owner', /\bowner\b/i],
  ['schema', /\bschema\b/i],
  ['sha256', /sha256:/i],
  ['private-uri', /private:\/\//i],
  ['retained', /\bRETAINED\b/],
  ['internal-repair-origin', /SYSTEM_WU_CHAT_RETURN/],
  ['exam-format-owner', /exam-format owner/i],
  ['runtime', /\bruntime\b/i],
  ['projection', /\bprojection\b/i],
  ['repository', /\brepository\b|\brepo\b/i],
  ['development-copy', /工程状态|开发状态|产品本身独立|桥接最后再接/],
  ['internal-error-code', /CURRENT_XIZONG|XIZONG_[A-Z_]+_(?:FAIL|INVALID|MISSING)/]
];

const routes = [
  ['home', '/xizong/'],
  ['system', '/xizong/circulation/'],
  ['block', '/xizong/circulation/b01/'],
  ['system-recall', '/xizong/circulation/recall/'],
  ['memory', '/xizong/memory/'],
  ['practice-home', '/xizong/practice/'],
  ['practice-system', '/xizong/practice/circulation/'],
  ['whole-paper', '/xizong/practice/paper/2026/']
];

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore','pipe','pipe'],
  detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForHttp(`${BASE}/xizong/`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();

  for (const [name, route] of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    const visibleText = await page.locator('body').innerText();
    const leaks = forbidden.filter(([, pattern]) => pattern.test(visibleText)).map(([label]) => label);
    const currentDockVisible = await page.locator('.kianosCurrentDock').evaluateAll((nodes) =>
      nodes.some((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
      })
    );
    if (leaks.length) throw new Error(`XIZONG_LEARNER_CHROME_LEAK:${name}:${leaks.join(',')}`);
    if (currentDockVisible) throw new Error(`XIZONG_LEARNER_CHROME_CURRENT_DOCK_VISIBLE:${name}`);
    report.routes.push({ name, route, visible_chars: visibleText.length, leaks: [], current_dock_visible: false });
  }

  report.status = 'PASS';
  report.finished_at = new Date().toISOString();
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`XIZONG_LEARNER_CHROME_PASS | routes=${report.routes.length}`);
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.finished_at = new Date().toISOString();
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  throw error;
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
