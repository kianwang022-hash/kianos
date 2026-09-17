import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { listReadingSets } from '../src/lib/englishReading.mjs';
import { listClozeSets, listReadingBSets, loadReadingBById } from '../src/lib/englishObjective.mjs';
import { listTranslationSets } from '../src/lib/englishTranslation.mjs';
import { listWritingRuntimeTasks } from '../src/lib/englishWritingRuntimeSourceTruth.mjs';
import { listLexicalWordSummaries } from '../src/lib/lexical.mjs';

const BASE = 'http://127.0.0.1:4321';
const auditDir = path.resolve(process.cwd(), '../english-family-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.english.family_coherence.v1', startedAt: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`ENGLISH_FAMILY_COHERENCE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const response = await fetch(BASE); if (response.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('ENGLISH_FAMILY_PREVIEW_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
    else { try { server.kill('SIGTERM'); } catch {} }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
}

const lexicalWords = new Set(listLexicalWordSummaries().map((row) => String(row.word || '').toLowerCase()).filter(Boolean));

async function selectKnownWord(page, selector) {
  const locator = page.locator(selector);
  const texts = await locator.allTextContents();
  let found = null;
  for (const minimumLength of [3, 2]) {
    for (let index = 0; index < texts.length && !found; index += 1) {
      const tokens = String(texts[index] || '').match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || [];
      const word = tokens.find((token) => token.length >= minimumLength && lexicalWords.has(token.toLowerCase()));
      if (word) found = { index, word };
    }
    if (found) break;
  }
  if (!found) throw new Error(`NO_CURRENT_LEXICAL_TOKEN:${selector}`);

  const selected = await page.evaluate(({ selector: targetSelector, index, word: targetWord }) => {
    const root = document.querySelectorAll(targetSelector)[index];
    if (!(root instanceof HTMLElement)) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const target = targetWord.toLowerCase();
    const isLetter = (char) => Boolean(char && /[A-Za-z]/.test(char));
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.nodeValue || '';
      const lower = value.toLowerCase();
      let cursor = lower.indexOf(target);
      while (cursor >= 0) {
        const before = cursor > 0 ? value[cursor - 1] : '';
        const afterIndex = cursor + targetWord.length;
        const after = afterIndex < value.length ? value[afterIndex] : '';
        if (!isLetter(before) && !isLetter(after)) {
          const range = document.createRange();
          range.setStart(node, cursor);
          range.setEnd(node, cursor + targetWord.length);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          (node.parentElement || root).dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 120, clientY: 160 }));
          return true;
        }
        cursor = lower.indexOf(target, cursor + 1);
      }
    }
    return false;
  }, { selector, index: found.index, word: found.word });

  check(selected, `selection_created_${selector.replace(/[^a-z]+/gi, '_')}`, found.word);
  await page.locator('[data-english-selection-menu]').waitFor({ state: 'visible' });
  check(await page.locator('[data-selection-lexical]').isVisible(), `lexical_action_visible_${selector.replace(/[^a-z]+/gi, '_')}`, found.word);
  return found.word;
}

async function assertExactLexicalResult(page, word, name) {
  const rows = page.locator('[data-lexical-search-results] .lexicalWordRow');
  check(await rows.count() > 0, `${name}_lookup_resolves_current_catalog`, word);
  const firstWord = String(await rows.first().locator('strong').textContent() || '').trim();
  check(firstWord.toLowerCase() === word.toLowerCase(), `${name}_exact_owner_ranks_first`, `${word} -> ${firstWord}`);
}

async function assertHome(page) {
  await page.goto(`${BASE}/english/`, { waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 1440, height: 900 });
  const layout = await page.locator('.englishCapabilityLayout').boundingBox();
  const map = await page.locator('.englishCapabilityMap').boundingBox();
  const rail = await page.locator('.englishContextRail').boundingBox();
  check(Boolean(layout && map && rail), 'english_home_primary_geometry_exists');
  check(layout.width > 1100, 'english_home_uses_mac_width', String(layout.width));
  check(layout.y < 300, 'english_home_workbench_enters_first_viewport', String(layout.y));
  check(map.width > rail.width * 2, 'english_home_tasks_dominate_guides_rail', `${map.width}/${rail.width}`);
  check(await page.locator('.englishGuideLinks a').count() === 3, 'english_home_keeps_three_optional_guides');
  await page.screenshot({ path: path.join(auditDir, 'english-home-1440x900.png'), fullPage: false });
}

async function assertGuides(page) {
  for (const [route, marker] of [
    ['objective-learn/', 'Global Map'],
    ['translation-learn/', 'Representation'],
    ['writing-learn/', 'Task / Genre']
  ]) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' });
    const canvas = page.locator('main.productCanvas');
    const body = await canvas.innerText();
    check(body.includes(marker), `guide_density_marker_${route.replace(/\W/g, '_')}`);
    check((await canvas.boundingBox())?.width > 900, `guide_uses_mac_width_${route.replace(/\W/g, '_')}`);
  }
  await page.goto(`${BASE}/objective-learn/`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(auditDir, 'objective-guide-1440x900.png'), fullPage: false });
}

async function assertVocabularyFamily(page) {
  await page.goto(`${BASE}/vocabulary/`, { waitUntil: 'domcontentloaded' });
  check(await page.locator('[data-lexical-home]').isVisible(), 'vocabulary_home_visible');
  const home = page.locator('[data-lexical-home]');
  const homeBox = await home.boundingBox();
  check(Boolean(homeBox && homeBox.width > 1000), 'vocabulary_home_uses_mac_width', String(homeBox?.width || 0));
  check(await page.locator('[data-lexical-tab="study"]').isVisible(), 'vocabulary_study_mode_visible');
  check(await page.locator('[data-lexical-tab="search"]').isVisible(), 'vocabulary_search_mode_visible');
  check(await page.locator('[data-lexical-tab="review"]').isVisible(), 'vocabulary_repair_mode_visible');
  check(await page.locator('[data-lexical-tab="challenge"]').isVisible(), 'vocabulary_challenge_mode_visible');
  await page.screenshot({ path: path.join(auditDir, 'vocabulary-home-1440x900.png'), fullPage: false });

  const representative = listLexicalWordSummaries().find((row) =>
    Number(row.senseCount || 0) >= 2 &&
    (Number(row.promptCount || 0) + Number(row.relationCount || 0)) >= 1
  ) || listLexicalWordSummaries()[0];
  check(Boolean(representative?.ordinal), 'vocabulary_word_fixture_available');

  await page.goto(`${BASE}/vocabulary/${representative.ordinal}/`, { waitUntil: 'domcontentloaded' });
  const runtime = page.locator('[data-local-port="vocabulary"]');
  check(await runtime.isVisible(), 'vocabulary_word_runtime_visible', String(representative?.word || ''));
  check(await page.locator('[data-vocab-front]').isVisible(), 'vocabulary_recall_front_visible');
  await page.screenshot({ path: path.join(auditDir, 'vocabulary-word-front-1440x900.png'), fullPage: false });

  await page.locator('[data-vocab-reveal]').click();
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  check(await page.locator('[data-vocab-repair]').count() > 0, 'vocabulary_depth_exposes_exact_repair_targets');
  await page.screenshot({ path: path.join(auditDir, 'vocabulary-word-depth-1440x900.png'), fullPage: false });
}

async function assertFullLexicalRoundTrip(page) {
  const readingId = listReadingSets()[0]?.id;
  check(Boolean(readingId), 'reading_fixture_available');
  const original = `/reading/${encodeURIComponent(readingId)}/`;
  await page.goto(`${BASE}${original}`, { waitUntil: 'domcontentloaded' });
  const word = await selectKnownWord(page, '[data-reading-passage] p');
  await page.screenshot({ path: path.join(auditDir, 'reading-lexical-selection-1440x900.png'), fullPage: false });
  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL('**/vocabulary/?from=english&lookup=*');
  const input = page.locator('[data-lexical-search]');
  await input.waitFor({ state: 'visible' });
  check((await input.inputValue()).toLowerCase() === word.toLowerCase(), 'lexical_lookup_prefills_exact_selected_word', word);
  check(await page.locator('[data-english-lexical-return]').isVisible(), 'lexical_lookup_exposes_exact_return');
  await assertExactLexicalResult(page, word, 'reading');
  await page.screenshot({ path: path.join(auditDir, 'lexical-return-1440x900.png'), fullPage: false });
  await page.locator('.lexicalWordRow').first().click();
  await page.waitForURL('**/vocabulary/*/');
  check(await page.locator('[data-english-lexical-return]').isVisible(), 'lexical_depth_keeps_return_context');
  await page.locator('[data-english-return-action]').click();
  await page.waitForURL(`**${original}`);
  check(new URL(page.url()).pathname.endsWith(original), 'lexical_returns_to_exact_reading_object', page.url());
  check(await page.locator('[data-english-lexical-return]').isHidden(), 'return_context_clears_after_restoration');
}

async function assertReadingBVisual(page) {
  const summaries = listReadingBSets();
  const projected = summaries.map((row) => {
    try { return loadReadingBById(row.id); } catch { return null; }
  }).filter(Boolean);
  const matching = projected.find((item) => String(item?.context?.taskForm || '') !== 'ordering') || projected[0] || null;
  const ordering = projected.find((item) => String(item?.context?.taskForm || '') === 'ordering') || null;

  check(Boolean(matching?.objectId), 'reading_b_matching_fixture_available');
  await page.goto(`${BASE}/reading-b/${encodeURIComponent(matching.objectId)}/`, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(auditDir, 'reading-b-1440x900.png'), fullPage: false });

  if (ordering?.objectId) {
    await page.goto(`${BASE}/reading-b/${encodeURIComponent(ordering.objectId)}/`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(auditDir, 'reading-b-ordering-1440x900.png'), fullPage: false });
  }
}

async function assertWritingVisual(page) {
  const tasks = listWritingRuntimeTasks().filter((item) => String(item?.sourceKind || '') === 'synthetic');
  const small = tasks.find((item) => String(item?.kind || '') === 'small') || null;
  const big = tasks.find((item) => String(item?.kind || '') === 'big') || null;
  check(Boolean(small?.id), 'writing_small_fixture_available');
  check(Boolean(big?.id), 'writing_big_fixture_available');

  for (const [task, name] of [[small, 'writing-small'], [big, 'writing-big']]) {
    if (!task?.id) continue;
    await page.goto(`${BASE}/writing/${encodeURIComponent(task.id)}/`, { waitUntil: 'domcontentloaded' });
    check(await page.locator('[data-writing-runtime]').isVisible(), `${name}_runtime_visible`);

    const prompt = page.locator('.writingPrompt');
    const work = page.locator('.writingWork');
    const promptBox = await prompt.boundingBox();
    const workBox = await work.boundingBox();
    check(Boolean(promptBox && workBox), `${name}_geometry_exists`);
    check(workBox.width > promptBox.width, `${name}_essay_dominates_prompt`, `${promptBox.width}/${workBox.width}`);
    if (task.kind === 'small') {
      check(workBox.width > promptBox.width * 1.9, 'writing_small_authoring_ratio', `${promptBox.width}/${workBox.width}`);
    } else {
      check(workBox.width > promptBox.width * 1.45, 'writing_big_authoring_ratio', `${promptBox.width}/${workBox.width}`);
    }

    const promptText = String(await prompt.innerText() || '');
    check(promptText.includes(String(task?.learnerTask?.directions || '').trim()), `${name}_shows_source_prompt_directly`);
    check(await prompt.locator('dl').count() === 0, `${name}_does_not_project_role_audience_form`);
    check(await page.locator('input[data-plan-mode][value="direct"]').isChecked(), `${name}_direct_mode_is_default`);
    check(await page.locator('[data-plan-field]').isHidden(), `${name}_optional_plan_hidden_by_default`);

    await page.screenshot({ path: path.join(auditDir, `${name}-1440x900.png`), fullPage: false });
  }
}

async function assertLexicalRoundTrip(page, route, selector, name) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  const word = await selectKnownWord(page, selector);
  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL('**/vocabulary/?from=english&lookup=*');
  check((await page.locator('[data-lexical-search]').inputValue()).toLowerCase() === word.toLowerCase(), `${name}_lookup_prefills_word`);
  await assertExactLexicalResult(page, word, name);
  const meta = String(await page.locator('[data-english-return-meta]').textContent() || '');
  check(meta.includes(word), `${name}_return_bar_names_lookup`, meta);
  await page.locator('[data-english-return-action]').click();
  await page.waitForURL(`**${route}`);
  check(new URL(page.url()).pathname.endsWith(route), `${name}_returns_exact_task`, page.url());
}

async function assertSourceLookup(page, route, selector, name) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  if (name === 'cloze') {
    await page.screenshot({ path: path.join(auditDir, 'cloze-1440x900.png'), fullPage: false });
  }
  if (name === 'translation') {
    await page.screenshot({ path: path.join(auditDir, 'translation-1440x900.png'), fullPage: false });
  }
  const word = await selectKnownWord(page, selector);
  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL('**/vocabulary/?from=english&lookup=*');
  check((await page.locator('[data-lexical-search]').inputValue()).toLowerCase() === word.toLowerCase(), `${name}_lookup_prefills_word`);
  const meta = await page.locator('[data-english-return-meta]').textContent();
  check(String(meta || '').includes(word), `${name}_return_bar_names_lookup`);
  await assertExactLexicalResult(page, word, name);
  await page.locator('[data-english-return-action]').click();
  await page.waitForURL(`**${route}`);
  check(new URL(page.url()).pathname.endsWith(route), `${name}_returns_exact_task`);
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4321'], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    await assertHome(page);
    await assertGuides(page);
    await assertVocabularyFamily(page);
    await assertFullLexicalRoundTrip(page);

    const clozeId = listClozeSets()[0]?.id;
    check(Boolean(clozeId), 'cloze_fixture_available');
    await assertSourceLookup(page, `/cloze/${encodeURIComponent(clozeId)}/`, '[data-objective-material] [data-objective-material-block]', 'cloze');

    await assertReadingBVisual(page);

    const partBSummaries = listReadingBSets();
    const partBProjected = partBSummaries.map((row) => {
      try { return loadReadingBById(row.id); } catch { return null; }
    }).filter(Boolean);
    const partBLookup = partBProjected.find((item) => String(item?.context?.taskForm || '') !== 'ordering') || partBProjected[0] || null;
    check(Boolean(partBLookup?.objectId), 'part_b_lexical_fixture_available');
    await assertLexicalRoundTrip(
      page,
      `/reading-b/${encodeURIComponent(partBLookup.objectId)}/`,
      '[data-objective-material] [data-objective-material-block], [data-objective-candidate] span',
      'part_b'
    );

    const translationId = listTranslationSets()[0]?.id;
    check(Boolean(translationId), 'translation_fixture_available');
    await assertSourceLookup(page, `/translation/${encodeURIComponent(translationId)}/`, '[data-translation-source-text] p', 'translation');

    await assertWritingVisual(page);

    const writingLexical = listWritingRuntimeTasks().find((item) => String(item?.sourceKind || '') === 'synthetic') || null;
    check(Boolean(writingLexical?.id), 'writing_lexical_fixture_available');
    await assertLexicalRoundTrip(
      page,
      `/writing/${encodeURIComponent(writingLexical.id)}/`,
      '.writingPromptBody p, .writingPromptBody blockquote, .writingPromptFacts li',
      'writing_prompt'
    );

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }
  report.finishedAt = new Date().toISOString();
  report.pass = true;
  fs.writeFileSync(path.join(auditDir, 'english-family-coherence.json'), JSON.stringify(report, null, 2));
  console.log(`ENGLISH_FAMILY_COHERENCE_PASS ${report.checks.length} checks`);
} catch (error) {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  report.error = error instanceof Error ? error.stack || error.message : String(error);
  report.serverLog = serverLog.slice(-12000);
  fs.writeFileSync(path.join(auditDir, 'english-family-coherence.json'), JSON.stringify(report, null, 2));
  console.error(report.error);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
