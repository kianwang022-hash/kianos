import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(webRoot, '../lexical-visual-review');
const port = Number(process.env.KIANOS_UI_REVIEW_PORT || 4331);
const origin = `http://127.0.0.1:${port}`;
const astroBin = path.join(webRoot, 'node_modules', '.bin', 'astro');

fs.mkdirSync(outputRoot, { recursive: true });
const server = spawn(astroBin, ['preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: webRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/vocabulary/2/`, { redirect: 'manual' });
      if (response.ok) return;
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Astro preview did not start: ${lastError?.message || ''}\n${serverLog}`);
}

function assert(condition, label, detail = '') {
  if (!condition) throw new Error(`LEXICAL_VISUAL_FAIL:${label}${detail ? `:${detail}` : ''}`);
}

async function reveal(page, ordinal) {
  await page.goto(`${origin}/vocabulary/${ordinal}/`, { waitUntil: 'networkidle' });
  const revealButton = page.locator('[data-vocab-reveal]');
  if (await revealButton.isVisible()) await revealButton.click();
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
}

async function audit(page, { ordinal, expectedWord, expectExpansion, sparse }) {
  await reveal(page, ordinal);
  const result = await page.evaluate(({ expectedWord, expectExpansion, sparse }) => {
    const css = (node) => node instanceof HTMLElement ? getComputedStyle(node) : null;
    const rect = (node) => node instanceof HTMLElement ? node.getBoundingClientRect() : null;
    const word = document.querySelector('.lexicalWordIdentity h2');
    const englishDefinition = document.querySelector('.lexicalSenseMeaning>strong');
    const englishUsage = document.querySelector('.lexicalSenseUsage li>b');
    const sheet = document.querySelector('.portedVocabStudySheet');
    const rows = [...document.querySelectorAll('.lexicalSenseRow')].filter((node) => node instanceof HTMLElement);
    const firstUsableRow = rows.find((row) => row.querySelector('.lexicalSenseUsage li>b')) || rows[0];
    const pos = firstUsableRow?.querySelector('header>span');
    const meaning = firstUsableRow?.querySelector('.lexicalSenseMeaning>p');
    const usage = firstUsableRow?.querySelector('.lexicalSenseUsage li>b');
    const expansion = document.querySelector('.lexicalExpansionSection');
    const contentNodes = [...document.querySelectorAll(
      '.lexicalCoreHeadline>p,.lexicalCoreHeadline>b,.lexicalCoreHeadline>small,.lexicalSenseMeaning>p,.lexicalSenseMeaning>strong,.lexicalSenseNote,.lexicalSenseUsage li>b,.lexicalSenseUsage li>span,.lexicalExpansionSection>header>span,.portedVocabEvidenceList>article>b,.portedVocabEvidenceList>article>p,.portedVocabEvidenceList>article>small,.lexicalFormBoundary,.lexicalFormVariants b,.lexicalFormVariants span,.lexicalFamilyRows b'
    )].filter((node) => node instanceof HTMLElement && css(node).display !== 'none');
    const posRect = rect(pos);
    const meaningRect = rect(meaning);
    const usageRect = rect(usage);
    const tops = [posRect?.top, meaningRect?.top, usageRect?.top].filter((value) => Number.isFinite(value));
    const rowStyle = css(firstUsableRow);
    const expansionStyle = css(expansion);
    const sheetRect = rect(sheet);
    const wordStyle = css(word);
    const definitionStyle = css(englishDefinition);
    const usageStyle = css(englishUsage);
    return {
      expectedWord,
      expectExpansion,
      sparse,
      wordText:(word?.textContent || '').trim(),
      wordFont:wordStyle?.fontFamily || '',
      definitionFont:definitionStyle?.fontFamily || '',
      usageFont:usageStyle?.fontFamily || '',
      senseCount:rows.length,
      firstUsableIsLast:firstUsableRow === rows.at(-1),
      row:{
        radius:rowStyle?.borderRadius || '',
        shadow:rowStyle?.boxShadow || '',
        bottom:rowStyle?.borderBottomWidth || ''
      },
      alignmentSpread:tops.length >= 2 ? Math.max(...tops)-Math.min(...tops) : null,
      columnGaps:{
        posMeaning:posRect && meaningRect ? meaningRect.left-posRect.right : null,
        meaningUsage:meaningRect && usageRect ? usageRect.left-meaningRect.right : null
      },
      expansionPresent:expansion instanceof HTMLElement,
      expansion:{
        radius:expansionStyle?.borderRadius || '',
        shadow:expansionStyle?.boxShadow || ''
      },
      minContentFont:contentNodes.length ? Math.min(...contentNodes.map((node) => parseFloat(css(node).fontSize))) : null,
      sheetHeight:sheetRect?.height || null,
      viewport:{width:window.innerWidth,height:window.innerHeight},
      bodyScrollWidth:document.documentElement.scrollWidth,
      bodyClientWidth:document.documentElement.clientWidth
    };
  }, { expectedWord, expectExpansion, sparse });

  // Always leave a real screenshot behind, even when a geometry assertion fails.
  await page.screenshot({ path: path.join(outputRoot, `lexical-${expectedWord}.png`), fullPage: false });

  const serif = /Georgia|Times|serif/i;
  assert(result.wordText === expectedWord, 'word_identity', `${ordinal}:${result.wordText}`);
  assert(serif.test(result.wordFont), 'word_serif', result.wordFont);
  assert(!result.definitionFont || serif.test(result.definitionFont), 'definition_serif', result.definitionFont);
  assert(!result.usageFont || serif.test(result.usageFont), 'usage_serif', result.usageFont);
  assert(result.senseCount >= 1, 'sense_rows_present', String(ordinal));
  assert(result.row.radius === '0px', 'sense_not_card_radius', result.row.radius);
  assert(result.row.shadow === 'none', 'sense_not_card_shadow', result.row.shadow);
  if (result.senseCount > 1 && !result.firstUsableIsLast) {
    assert(parseFloat(result.row.bottom || '0') >= 1, 'sense_rule_boundary', result.row.bottom);
  }
  assert(result.alignmentSpread === null || result.alignmentSpread <= 8, 'sense_first_line_alignment', String(result.alignmentSpread));
  assert(result.columnGaps.posMeaning === null || result.columnGaps.posMeaning >= 12, 'pos_meaning_no_collision', String(result.columnGaps.posMeaning));
  assert(result.columnGaps.meaningUsage === null || result.columnGaps.meaningUsage >= 12, 'meaning_usage_no_collision', String(result.columnGaps.meaningUsage));
  assert(result.minContentFont === null || result.minContentFont >= 15, 'learner_content_font_floor', String(result.minContentFont));
  assert(result.expansionPresent === expectExpansion, 'earned_expansion', `${ordinal}:${result.expansionPresent}`);
  if (result.expansionPresent) {
    assert(result.expansion.radius === '0px', 'expansion_not_card_radius', result.expansion.radius);
    assert(result.expansion.shadow === 'none', 'expansion_not_card_shadow', result.expansion.shadow);
  }
  if (sparse) assert((result.sheetHeight || 9999) < 650, 'sparse_sheet_natural_height', String(result.sheetHeight));
  assert(result.bodyScrollWidth <= result.bodyClientWidth + 2, 'no_horizontal_overflow', `${result.bodyScrollWidth}/${result.bodyClientWidth}`);
  return result;
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const reports = [];

  // Architecture-v2 Human Gate evidence.
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-home-1440x900.png'), fullPage: false });

  await page.goto(`${origin}/vocabulary/3/`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-front]').isVisible(), 'v2_safe_fast_pass_front_visible');
  assert(await page.locator('[data-vocab-details]').isHidden(), 'v2_safe_fast_pass_depth_protected');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="known"]').isVisible(), 'v2_safe_fast_pass_known_visible');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="mastered"]').isVisible(), 'v2_safe_fast_pass_mastered_visible');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="unknown"]').isHidden(), 'v2_safe_fast_pass_unknown_hidden_before_reveal');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="fuzzy"]').isHidden(), 'v2_safe_fast_pass_fuzzy_hidden_before_reveal');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-safe-fast-pass-1440x900.png'), fullPage: false });

  await page.goto(`${origin}/vocabulary/5477/`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-front][data-recall-density="rich"]').isVisible(), 'v2_rich_recall_front_visible');
  assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === 'write', 'v2_rich_fixture_is_write');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-recall-1440x900.png'), fullPage: false });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="unknown"]').isVisible(), 'v2_depth_dock_exposes_unknown');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="fuzzy"]').isVisible(), 'v2_depth_dock_exposes_fuzzy');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-depth-1440x900.png'), fullPage: false });

  await page.evaluate(() => {
    localStorage.setItem('kianos-vocabulary-last-ordinal', '77');
    localStorage.removeItem('kianos-vocabulary-astro-v2:word:answer');
  });
  await page.goto(`${origin}/vocabulary/209/?mode=lookup`, { waitUntil: 'networkidle' });
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-vocab-front]').isHidden(), 'v2_lookup_skips_recall');
  assert(await page.locator('[data-card-routing-controls]').count() === 0, 'v2_lookup_has_no_whole_card_routing');
  const lookupState = await page.evaluate(() => ({
    cursor: localStorage.getItem('kianos-vocabulary-last-ordinal'),
    wordState: localStorage.getItem('kianos-vocabulary-astro-v2:word:answer')
  }));
  assert(lookupState.cursor === '77', 'v2_lookup_does_not_advance_coverage', String(lookupState.cursor));
  assert(lookupState.wordState === null, 'v2_lookup_does_not_create_word_state');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-lookup-1440x900.png'), fullPage: false });

  // Legacy keyboard contract + v2 exact Repair contract.
  const routingKey = 'kianos-lexical-card-routing-v1';
  const routeCases = [
    ['ArrowLeft', 'UNKNOWN'],
    ['ArrowUp', 'FUZZY'],
    ['ArrowRight', 'KNOWN'],
    ['ArrowDown', 'MASTERED']
  ];
  for (const [key, expected] of routeCases) {
    await page.goto(`${origin}/vocabulary/5477/`, { waitUntil: 'networkidle' });
    await page.evaluate((routingKey) => localStorage.removeItem(routingKey), routingKey);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
    await page.keyboard.press(key);
    await page.waitForURL('**/vocabulary/5478/');
    const route = await page.evaluate((routingKey) => {
      const value = JSON.parse(localStorage.getItem(routingKey) || 'null');
      return value?.history?.at(-1)?.route || '';
    }, routingKey);
    assert(route === expected, `v2_keyboard_${expected.toLowerCase()}`, route);
  }

  await page.goto(`${origin}/vocabulary/5477/`, { waitUntil: 'networkidle' });
  await page.evaluate((routingKey) => localStorage.removeItem(routingKey), routingKey);
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/vocabulary/5478/');
  await page.keyboard.press('Backspace');
  await page.waitForURL('**/vocabulary/5477/');
  const undoHistoryLength = await page.evaluate((routingKey) => {
    const value = JSON.parse(localStorage.getItem(routingKey) || 'null');
    return value?.history?.length || 0;
  }, routingKey);
  assert(undoHistoryLength === 0, 'v2_backspace_undo', String(undoHistoryLength));

  await page.goto(`${origin}/vocabulary/5477/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  await page.keyboard.press('j');
  const selectedBeforeRepair = await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').count();
  assert(selectedBeforeRepair === 1, 'v2_j_selects_exact_object', String(selectedBeforeRepair));
  await page.keyboard.press('+');
  const selectedRepairPressed = await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').getAttribute('aria-pressed');
  assert(selectedRepairPressed === 'true', 'v2_plus_toggles_exact_repair', String(selectedRepairPressed));
  await page.keyboard.press('k');
  assert(await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').count() === 1, 'v2_k_moves_exact_object');

    reports.push(await audit(page, { ordinal: 1, expectedWord: 'a', expectExpansion: true, sparse: false }));
  reports.push(await audit(page, { ordinal: 2, expectedWord: 'abandon', expectExpansion: false, sparse: true }));
  reports.push(await audit(page, { ordinal: 13, expectedWord: 'abroad', expectExpansion: true, sparse: true }));

  fs.writeFileSync(path.join(outputRoot, 'report.json'), `${JSON.stringify({ status:'PASS', reports }, null, 2)}\n`);
  console.log(`Lexical visual convergence PASS → ${outputRoot}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
