import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = path.join(webRoot, '.qa', 'xizong-a3-spine-human-gate');
const port = Number(process.env.KIANOS_XIZONG_SPINE_PORT || 4339);
const origin = `http://127.0.0.1:${port}`;
const astroBin = path.join(webRoot, 'node_modules', '.bin', 'astro');
fs.mkdirSync(outRoot, { recursive: true });

const server = spawn(astroBin, ['preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: webRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let log = '';
server.stdout.on('data', (chunk) => { log += chunk.toString(); });
server.stderr.on('data', (chunk) => { log += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/xizong/urinary/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Astro preview did not start\n' + log);
}

function check(condition, code, detail = '') {
  if (!condition) throw new Error(`XIZONG_SPINE_HUMAN_GATE_FAIL:${code}${detail ? ':' + detail : ''}`);
}

async function inspect(page, system, expectedLayout) {
  await page.goto(`${origin}/xizong/${system}/`, { waitUntil: 'networkidle' });
  const framework = page.locator('[data-system-view-button="framework"]');
  if (await framework.count()) await framework.click();
  const spine = page.locator('[data-system-spine]');
  await spine.waitFor({ state: 'visible' });
  const result = await spine.evaluate((node) => {
    const items = [...node.querySelectorAll('[data-spine-node]')];
    const rects = items.map((item) => {
      const r = item.getBoundingClientRect();
      const text = item.querySelector('span');
      return {
        width: r.width,
        height: r.height,
        text: text?.textContent?.trim() || '',
        textWidth: text?.getBoundingClientRect().width || 0
      };
    });
    return {
      layout: node.getAttribute('data-spine-layout'),
      averageChars: Number(node.getAttribute('data-spine-average-chars') || 0),
      maxChars: Number(node.getAttribute('data-spine-max-chars') || 0),
      items: rects,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth
    };
  });
  check(result.layout === expectedLayout, 'layout', `${system}:${result.layout}/${expectedLayout}`);
  check(result.pageScrollWidth <= result.pageClientWidth + 2, 'horizontal_overflow', `${system}:${result.pageScrollWidth}/${result.pageClientWidth}`);
  if (expectedLayout === 'vertical') {
    check(result.items.every((row) => row.width >= 700), 'vertical_reading_width', JSON.stringify(result.items.map((row) => row.width)));
    check(result.items.every((row) => row.height <= 92), 'vertical_node_height', JSON.stringify(result.items.map((row) => row.height)));
  } else {
    check(result.items.length >= 6, 'horizontal_fixture', system);
    check(result.items.every((row) => row.width >= 105), 'horizontal_node_width', JSON.stringify(result.items.map((row) => row.width)));
  }
  await page.screenshot({
    path: path.join(outRoot, `${system}-framework-1512x982.png`),
    fullPage: false
  });
  return result;
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 }, deviceScaleFactor: 1 });
  const respiratory = await inspect(page, 'respiratory', 'horizontal');
  const urinary = await inspect(page, 'urinary', 'vertical');
  fs.writeFileSync(path.join(outRoot, 'report.json'), JSON.stringify({
    status: 'PASS',
    viewport: '1512x982',
    respiratory,
    urinary
  }, null, 2) + '\n');
  console.log('XIZONG_A3_SPINE_HUMAN_GATE_PASS');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
