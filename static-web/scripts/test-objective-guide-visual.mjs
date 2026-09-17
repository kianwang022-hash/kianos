import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4322';
const webRoot = process.cwd();
const auditDir = path.resolve(webRoot, '../english-family-audit');
fs.mkdirSync(auditDir, { recursive: true });

const report = {
  schema: 'kianos.english.objective_guide_visual.v1',
  startedAt: new Date().toISOString(),
  checks: []
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`OBJECTIVE_GUIDE_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/objective-learn/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('OBJECTIVE_GUIDE_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
}

function assertSingleVisualOwner() {
  const routePath = path.join(webRoot, 'src/pages/objective-learn.astro');
  const basePath = path.join(webRoot, 'src/layouts/Base.astro');
  const routeSource = fs.readFileSync(routePath, 'utf8');
  const baseSource = fs.readFileSync(basePath, 'utf8');

  check(
    routeSource.includes("import '../styles/english-objective-guide.css';"),
    'objective_guide_route_imports_visual_owner'
  );
  check(!/<style(?:\s|>)/i.test(routeSource), 'objective_guide_has_no_inline_style_layer');
  check(!baseSource.includes('english-objective-guide.css'), 'objective_guide_visual_owner_not_global_base_layer');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4322'], {
  cwd: webRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

let browser;
try {
  assertSingleVisualOwner();
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/objective-learn/`, { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const css = (node) => node instanceof HTMLElement ? getComputedStyle(node) : null;
    const visible = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = css(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const fontSizes = (selector) => [...document.querySelectorAll(selector)]
      .filter(visible)
      .map((node) => Number.parseFloat(css(node).fontSize))
      .filter(Number.isFinite);
    const shell = document.querySelector('.objectiveLearnShell');
    const nav = document.querySelector('.objectiveLearnNav');
    const main = document.querySelector('.objectiveLearnMain');
    const content = document.querySelector('.objectiveLearnContent');
    const fastTrack = document.querySelector('.objectiveFastTrack');
    const shellRect = shell?.getBoundingClientRect();
    const navRect = nav?.getBoundingClientRect();
    const mainRect = main?.getBoundingClientRect();
    const cardStyle = (node) => {
      const style = css(node);
      return {
        radius: style?.borderRadius || '',
        shadow: style?.boxShadow || '',
        background: style?.backgroundColor || ''
      };
    };
    const navFonts = fontSizes('.objectiveLearnNav>a strong,.objectiveLearnNav>a span,.objectiveLearnNav summary,.objectiveLearnNav details>a,.objectiveLearnPractice>span,.objectiveLearnPractice a');
    const bodyFonts = fontSizes('.objectiveLearnContent p,.objectiveLearnContent li,.objectiveFastTrack p');
    return {
      shellWidth: shellRect?.width || 0,
      navWidth: navRect?.width || 0,
      mainWidth: mainRect?.width || 0,
      navFonts,
      bodyFonts,
      minNavFont: navFonts.length ? Math.min(...navFonts) : 0,
      minBodyFont: bodyFonts.length ? Math.min(...bodyFonts) : 0,
      navStyle: cardStyle(nav),
      contentStyle: cardStyle(content),
      fastTrackStyle: cardStyle(fastTrack),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });

  check(result.shellWidth > 1000, 'objective_guide_uses_mac_width', String(result.shellWidth));
  check(result.mainWidth > result.navWidth * 2.5, 'objective_guide_article_dominates_navigation', `${result.mainWidth}/${result.navWidth}`);
  check(result.navFonts.length > 0, 'objective_guide_navigation_text_detected');
  check(result.bodyFonts.length > 0, 'objective_guide_body_text_detected');
  check(result.minNavFont >= 15.9, 'objective_guide_navigation_font_floor_16', String(result.minNavFont));
  check(result.minBodyFont >= 17, 'objective_guide_body_font_floor_17', String(result.minBodyFont));
  for (const [name, style] of [
    ['navigation', result.navStyle],
    ['content', result.contentStyle],
    ['fast_track', result.fastTrackStyle]
  ]) {
    check(style.radius === '0px', `objective_guide_${name}_not_rounded_card`, style.radius);
    check(style.shadow === 'none', `objective_guide_${name}_not_shadow_card`, style.shadow);
  }
  check(result.scrollWidth <= result.clientWidth + 2, 'objective_guide_no_horizontal_overflow', `${result.scrollWidth}/${result.clientWidth}`);

  await page.screenshot({ path: path.join(auditDir, 'objective-guide-1440x900.png'), fullPage: false });
  await context.close();

  report.finishedAt = new Date().toISOString();
  report.pass = true;
  report.geometry = result;
  fs.writeFileSync(path.join(auditDir, 'objective-guide-visual.json'), JSON.stringify(report, null, 2));
  console.log(`OBJECTIVE_GUIDE_VISUAL_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'objective-guide-visual.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopServer(server);
}
