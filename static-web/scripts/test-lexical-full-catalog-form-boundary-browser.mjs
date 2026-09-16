import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const TARGET = `${BASE}/vocabulary/7880/`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (ok, name, detail = '') => { if (!ok) throw new Error(`FULL_CATALOG_FORM_BROWSER_FAIL:${name}:${detail}`); };

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let log = '';
server.stdout?.on('data', (chunk) => { log += String(chunk); });
server.stderr?.on('data', (chunk) => { log += String(chunk); });

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try { const response = await fetch(TARGET); if (response.ok) return; } catch {}
    await sleep(120);
  }
  throw new Error(`PREVIEW_NOT_READY:${log.slice(-2000)}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(TARGET, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-local-port="vocabulary"]');
  check((await root.getAttribute('data-vocab-object')) === 'word:rationalization', 'word_identity');
  await page.locator('[data-vocab-reveal]').click();
  const formSection = page.locator('.lexicalFormSection');
  check(await formSection.isVisible(), 'form_section_visible');
  const text = await formSection.innerText();
  check(text.includes('rationalization'), 'ame_surface_visible', text);
  check(text.includes('rationalisation'), 'bre_surface_visible', text);
  check(text.includes('Common American spelling'), 'ame_note_visible', text);
  check(text.includes('Common British spelling'), 'bre_note_visible', text);
  const repair = formSection.locator('[data-vocab-repair][data-target-kind="form_identity"]');
  check(await repair.count() === 1, 'form_target_present');
  check((await repair.getAttribute('data-target-locator')) === 'record.form_identity', 'form_target_locator');
  console.log(JSON.stringify({ schema: 'kianos.lexical.full_catalog_form_boundary_browser.v1', status: 'PASS', ordinal: 7880, word_id: 'word:rationalization' }, null, 2));
} finally {
  if (browser) await browser.close();
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(800)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}
