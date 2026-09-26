import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sourcePath = path.resolve(process.cwd(), 'scripts/test-objective-journey.mjs');
const instrumentedPath = path.resolve(process.cwd(), 'scripts/.test-objective-journey.instrumented.mjs');
const source = fs.readFileSync(sourcePath, 'utf8');
const target = "  check((await page.locator('[data-objective-score]').textContent())?.trim() === `${cleanItem.questions.length} / ${cleanItem.questions.length}`, 'cloze_clean_score');";
const replacement = [
  '  {',
  "    const actualScore = (await page.locator('[data-objective-score]').textContent())?.trim() || '';",
  '    const expectedScore = `${cleanItem.questions.length} / ${cleanItem.questions.length}`;',
  "    const diagnostic = await page.evaluate((key) => {",
  "      const attempt = JSON.parse(localStorage.getItem(key) || 'null');",
  "      const root = document.querySelector('[data-objective-root][data-objective-task=\"cloze\"]');",
  "      const rows = [...document.querySelectorAll('[data-objective-question]')].map((row) => ({",
  "        id: row.getAttribute('data-objective-question') || '',",
  "        formal: row.getAttribute('data-answer') || '',",
  "        selected: [...row.querySelectorAll('[data-cloze-option].selected')].map((button) => button.getAttribute('data-value') || '')",
  '      }));',
  "      return { attempt, answersReady: root?.getAttribute('data-objective-answers-ready') || '', rows };",
  '    }, `kianos-cloze-attempt-v1:${cleanId}`);',
  "    check(actualScore === expectedScore, 'cloze_clean_score', JSON.stringify({ actualScore, expectedScore, diagnostic }));",
  '  }'
].join('\n');

if (!source.includes(target)) {
  console.error('OBJECTIVE_ACCEPTANCE_INSTRUMENTATION_TARGET_MISSING');
  process.exit(1);
}

let instrumented = source.replace(target, replacement);
const serverTarget = "const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4490'], {\n  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe']\n});";
const serverReplacement = "const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4490'], {\n  cwd: process.cwd(),\n  stdio: ['ignore', 'pipe', 'pipe'],\n  detached: process.platform !== 'win32'\n});";
const cleanupTarget = "} finally {\n  server.kill('SIGTERM');\n}";
const cleanupReplacement = `} finally {
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    sleep(1000)
  ]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}`;
if (!instrumented.includes(serverTarget) || !instrumented.includes(cleanupTarget)) {
  console.error('OBJECTIVE_ACCEPTANCE_SERVER_CLEANUP_TARGET_MISSING');
  process.exit(1);
}
instrumented = instrumented.replace(serverTarget, serverReplacement).replace(cleanupTarget, cleanupReplacement);

const smokeNavigationTargets = [
  [
    "  await page.goto(`${BASE}/reading/${encodeURIComponent(readingIds[0])}/`);",
    [
      "  const readingAProbeUrl = `${BASE}/reading/${encodeURIComponent(readingIds[0])}/`;",
      "  const readingAProbeStartedAt = Date.now();",
      "  const readingAProbeResponse = await fetch(readingAProbeUrl, { signal: AbortSignal.timeout(10000) });",
      "  const readingAProbeHtml = await readingAProbeResponse.text();",
      "  fs.writeFileSync(path.join(auditDir, `reading-a-probe-${name}.html`), readingAProbeHtml);",
      "  check(readingAProbeResponse.ok, `${name}_reading_a_http_ok`, JSON.stringify({ status: readingAProbeResponse.status, durationMs: Date.now() - readingAProbeStartedAt, bytes: Buffer.byteLength(readingAProbeHtml) }));",
      "  check(readingAProbeHtml.includes('data-local-port=\"reading\"'), `${name}_reading_a_http_has_root`, JSON.stringify({ status: readingAProbeResponse.status, durationMs: Date.now() - readingAProbeStartedAt, bytes: Buffer.byteLength(readingAProbeHtml) }));",
      "  await page.goto(readingAProbeUrl, { waitUntil: 'domcontentloaded' });",
      "  await page.locator('[data-local-port=\"reading\"]').waitFor({ state: 'visible' });"
    ].join('\n')
  ],
  [
    "  await page.goto(`${BASE}/reading/${encodeURIComponent(readingIds[1])}/`);",
    "  await page.goto(`${BASE}/reading/${encodeURIComponent(readingIds[1])}/`, { waitUntil: 'domcontentloaded' });\n  await page.locator('[data-local-port=\"reading\"]').waitFor({ state: 'visible' });"
  ],
  [
    "  await page.goto(`${BASE}/reading-b/${encodeURIComponent(readingB.objectId)}/`);",
    "  await page.goto(`${BASE}/reading-b/${encodeURIComponent(readingB.objectId)}/`, { waitUntil: 'domcontentloaded' });\n  await page.locator('[data-objective-root]').waitFor({ state: 'visible' });"
  ]
];
for (const [navigationTarget, navigationReplacement] of smokeNavigationTargets) {
  if (!instrumented.includes(navigationTarget)) {
    console.error('OBJECTIVE_ACCEPTANCE_TASK_SMOKE_NAVIGATION_TARGET_MISSING');
    process.exit(1);
  }
  instrumented = instrumented.replace(navigationTarget, navigationReplacement);
}

const batch = String(process.env.OBJECTIVE_JOURNEY_BATCH || 'all').trim().toLowerCase();
const allJourneyTarget = [
  '  await chromiumJourney();',
  "  await readingAAndBSmoke(chromium, 'chromium-smoke');",
  "  await readingAAndBSmoke(webkit, 'webkit');"
].join('\n');
if (['shared', 'task-smoke'].includes(batch)) {
  if (!instrumented.includes(allJourneyTarget)) {
    console.error('OBJECTIVE_ACCEPTANCE_BATCH_TARGET_MISSING');
    process.exit(1);
  }
  const batchReplacement = batch === 'shared'
    ? '  await chromiumJourney();'
    : [
        "  await readingAAndBSmoke(chromium, 'chromium-smoke');",
        "  await readingAAndBSmoke(webkit, 'webkit');"
      ].join('\n');
  instrumented = instrumented.replace(allJourneyTarget, batchReplacement);
}

fs.writeFileSync(instrumentedPath, instrumented);

const child = spawn(process.execPath, [instrumentedPath], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

let finished = false;
const cleanup = () => {
  try { fs.unlinkSync(instrumentedPath); } catch {}
};
const timeout = setTimeout(() => {
  if (finished) return;
  console.error('OBJECTIVE_ACCEPTANCE_E2E_TIMEOUT: learner journey did not terminate after 120s; killing leaked browser/server process. Inspect objective-audit/journey.json for the first failed assertion.');
  child.kill('SIGKILL');
  cleanup();
  process.exitCode = 1;
}, 120_000);

timeout.unref?.();

child.on('error', (error) => {
  finished = true;
  clearTimeout(timeout);
  cleanup();
  console.error(error);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  finished = true;
  clearTimeout(timeout);
  cleanup();
  if (signal) {
    console.error(`OBJECTIVE_ACCEPTANCE_E2E_CHILD_SIGNAL:${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = Number(code || 0);
});
