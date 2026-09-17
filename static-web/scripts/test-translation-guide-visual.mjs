import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4323';
const webRoot = process.cwd();
const auditDir = path.resolve(webRoot, '../english-family-audit');
fs.mkdirSync(auditDir, { recursive: true });

const report = {
  schema: 'kianos.english.translation_guide_visual.v1',
  startedAt: new Date().toISOString(),
  checks: []
};

function check(condition, name, detail = '') {
  if (!condition) throw new Error(`TRANSLATION_GUIDE_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/translation-learn/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('TRANSLATION_GUIDE_PREVIEW_NOT_READY');
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
  const routeSource = fs.readFileSync(path.join(webRoot, 'src/pages/translation-learn.astro'), 'utf8');
  const baseSource = fs.readFileSync(path.join(webRoot, 'src/layouts/Base.astro'), 'utf8');
  check(
    routeSource.includes("import '../styles/english-translation-guide.css';"),
    'translation_guide_route_imports_visual_owner'
  );
  check(!/<style(?:\s|>)/i.test(routeSource), 'translation_guide_has_no_inline_style_layer');
  check(!baseSource.includes('english-translation-guide.css'), 'translation_guide_visual_owner_not_global_base_layer');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4323'], {
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
  await page.goto(`${BASE}/translation-learn/`, { waitUntil: 'networkidle' });

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
    const styleShape = (node) => {
      const style = css(node);
      return {
        radius: style?.borderRadius || '',
        shadow: style?.boxShadow || '',
        background: style?.backgroundColor || ''
      };
    };

    const shell = document.querySelector('.translationLearnShell');
    const nav = document.querySelector('.translationLearnNav');
    const main = document.querySelector('.translationLearnMain');
    const intro = document.querySelector('.translationLearnIntro');
    const firstContent = document.querySelector('.translationLearnContent');
    const firstReference = document.querySelector('.translationReferenceSection');
    const exit = document.querySelector('.translationExit');
    const pathStrip = document.querySelector('.translationPathStrip');
    const shellRect = shell?.getBoundingClientRect();
    const navRect = nav?.getBoundingClientRect();
    const mainRect = main?.getBoundingClientRect();
    const navFonts = fontSizes('.translationLearnNav>span,.translationLearnNav>strong,.translationLearnNav>p,.translationLearnNav nav a,.translationLearnNav .runtimeLink');
    const bodyFonts = fontSizes('.translationLearnMain .markdownBody p,.translationLearnMain .markdownBody li,.translationExit p');
    const pathFonts = fontSizes('.translationPathStrip span,.translationPathStrip em');
    const details = [...document.querySelectorAll('.translationReferenceSection')];
    return {
      shellWidth: shellRect?.width || 0,
      navWidth: navRect?.width || 0,
      mainWidth: mainRect?.width || 0,
      minNavFont: navFonts.length ? Math.min(...navFonts) : 0,
      minBodyFont: bodyFonts.length ? Math.min(...bodyFonts) : 0,
      minPathFont: pathFonts.length ? Math.min(...pathFonts) : 0,
      navFontCount: navFonts.length,
      bodyFontCount: bodyFonts.length,
      pathText: (pathStrip?.textContent || '').replace(/\s+/g, ' ').trim(),
      referenceCount: details.length,
      closedReferenceCount: details.filter((node) => !node.hasAttribute('open')).length,
      runtimeHref: document.querySelector('.runtimeLink')?.getAttribute('href') || '',
      shapes: {
        nav: styleShape(nav),
        intro: styleShape(intro),
        content: styleShape(firstContent),
        reference: styleShape(firstReference),
        exit: styleShape(exit)
      },
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    };
  });

  check(result.shellWidth > 1000, 'translation_guide_uses_mac_width', String(result.shellWidth));
  check(result.mainWidth > result.navWidth * 2.5, 'translation_guide_article_dominates_navigation', `${result.mainWidth}/${result.navWidth}`);
  check(result.navFontCount > 0, 'translation_guide_navigation_text_detected');
  check(result.bodyFontCount > 0, 'translation_guide_body_text_detected');
  check(result.minNavFont >= 15.9, 'translation_guide_navigation_font_floor_16', String(result.minNavFont));
  check(result.minBodyFont >= 17, 'translation_guide_body_font_floor_17', String(result.minBodyFont));
  check(result.minPathFont >= 15.9, 'translation_guide_path_font_floor_16', String(result.minPathFont));
  check(/REPRESENT/.test(result.pathText) && /RECONSTRUCT/.test(result.pathText) && /DELIVER/.test(result.pathText), 'translation_guide_keeps_native_three_step_path', result.pathText);
  check(result.referenceCount === 2 && result.closedReferenceCount === 2, 'translation_guide_reference_reservoirs_default_collapsed', `${result.closedReferenceCount}/${result.referenceCount}`);
  check(/translation\/?$/.test(result.runtimeHref), 'translation_guide_runtime_entry_preserved', result.runtimeHref);

  for (const [name, style] of Object.entries(result.shapes)) {
    check(style.radius === '0px', `translation_guide_${name}_not_rounded_card`, style.radius);
    check(style.shadow === 'none', `translation_guide_${name}_not_shadow_card`, style.shadow);
  }
  check(result.scrollWidth <= result.clientWidth + 2, 'translation_guide_no_horizontal_overflow', `${result.scrollWidth}/${result.clientWidth}`);

  await page.screenshot({ path: path.join(auditDir, 'translation-guide-1440x900.png'), fullPage: false });
  await context.close();

  report.finishedAt = new Date().toISOString();
  report.pass = true;
  report.geometry = result;
  fs.writeFileSync(path.join(auditDir, 'translation-guide-visual.json'), JSON.stringify(report, null, 2));
  console.log(`TRANSLATION_GUIDE_VISUAL_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'translation-guide-visual.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopServer(server);
}
