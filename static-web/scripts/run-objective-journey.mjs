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
const batch = String(process.env.OBJECTIVE_JOURNEY_BATCH || 'all').trim().toLowerCase();
if (batch === 'shared') {
  const allJourneyTarget = [
    '  await chromiumJourney();',
    "  await readingAAndBSmoke(chromium, 'chromium-smoke');",
    "  await readingAAndBSmoke(webkit, 'webkit');"
  ].join('\n');
  if (!instrumented.includes(allJourneyTarget)) {
    console.error('OBJECTIVE_ACCEPTANCE_SHARED_BATCH_TARGET_MISSING');
    process.exit(1);
  }
  instrumented = instrumented.replace(allJourneyTarget, '  await chromiumJourney();');
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
