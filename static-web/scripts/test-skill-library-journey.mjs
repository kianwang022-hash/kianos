#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const PORT = 4431;
const BASE = 'http://127.0.0.1:' + PORT;
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-skill-library-'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server;

async function startServer() {
  server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: webRoot,
    env: { ...process.env, KIANOS_PRIVATE_DIR: privateDir },
    stdio: ['ignore','pipe','pipe'],
    detached: process.platform !== 'win32'
  });
  let output = '';
  server.stdout.on('data', (c) => { output += c; });
  server.stderr.on('data', (c) => { output += c; });
  for (let i=0;i<80;i+=1) {
    try {
      const r = await fetch(BASE + '/skills/');
      const body = r.ok ? await r.text() : '';
      if (r.ok && body.includes('Skill Library') && server.exitCode == null) return;
    } catch {}
    if (server.exitCode != null) throw new Error('SKILL_SERVER_EXITED:' + output.slice(-1200));
    await sleep(100);
  }
  throw new Error('SKILL_SERVER_NOT_READY:' + output.slice(-1200));
}

async function stopServer() {
  if (!server) return;
  try {
    if (process.platform === 'win32') server.kill('SIGTERM');
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
  await Promise.race([new Promise((r)=>server.once('exit',r)), sleep(1500)]);
}

const pass = (name) => console.log('PASS', name);

await startServer();
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(BASE + '/skills/', { waitUntil: 'domcontentloaded' });
  await page.locator('h1').filter({ hasText: 'Skills' }).waitFor({ state: 'visible', timeout: 5000 });
  await page.getByText('高精力自我调节').first().waitFor({ state: 'visible', timeout: 5000 });
  pass('Skill Library renders first promoted Skill');

  await page.getByRole('link', { name: '查看学习地图' }).click();
  await page.getByText('Capability Map').waitFor({ state: 'visible', timeout: 5000 });
  await page.getByText('U1 · 状态诊断').first().waitFor({ state: 'visible', timeout: 5000 });
  pass('Skill map is manifest-driven');

  await page.getByRole('link', { name: /总 Guide/ }).click();
  await page.getByText('高精力不是一个单变量').waitFor({ state: 'visible', timeout: 5000 });
  const key = 'kianos:skills:progress:v1';
  await page.waitForFunction((k) => localStorage.getItem(k) !== null, key, { timeout: 3000 });
  let progress = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), key));
  assert.equal(progress.skills['high-energy'].last_asset, 'guide');
  assert.equal(progress.skills['high-energy'].visited.includes('guide'), true);
  pass('Opening learner asset records lightweight Resume only');

  await page.getByRole('button', { name: '标记已读' }).click();
  progress = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), key));
  assert.equal(progress.skills['high-energy'].completed.includes('guide'), true);
  assert.equal(await page.getByText('已标记读完 · 不代表掌握').count() > 0, true);
  pass('Read completion is explicit and does not claim mastery');

  await page.goto(BASE + '/skills/high-energy/', { waitUntil: 'domcontentloaded' });
  const continueHref = await page.locator('[data-skill-continue]').getAttribute('href');
  assert.equal(continueHref.endsWith('/skills/high-energy/guide/'), true);
  assert.equal(await page.locator('[data-skill-asset-row="guide"][data-completed="true"]').count(), 1);
  pass('Skill Home restores last asset and completion marker');

  await page.goto(BASE + '/skills/high-energy/u1-verify/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.getByText('Protected Verify').count() > 0, true);
  assert.equal(await page.locator('[data-skill-complete]').count(), 0);
  progress = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), key));
  assert.equal(progress.skills['high-energy'].last_asset, 'u1-verify');
  assert.equal(progress.skills['high-energy'].completed.includes('u1-verify'), false);
  pass('Verify stays separate and cannot be mistaken for reading completion');

  await page.goto(BASE + '/skills/', { waitUntil: 'domcontentloaded' });
  const libraryContinue = await page.locator('[data-skill-continue="high-energy"]').getAttribute('href');
  assert.equal(libraryContinue.endsWith('/skills/high-energy/u1-verify/'), true);
  pass('Library Continue resumes exact last Skill asset');

  console.log('SKILL_LIBRARY_JOURNEY PASS');
} finally {
  await browser.close();
  await stopServer();
}
