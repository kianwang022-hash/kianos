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
    const tops = [pos, meaning, usage].filter((node) => node instanceof HTMLElement).map((node) => rect(node).top);
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
      row:{
        radius:rowStyle?.borderRadius || '',
        shadow:rowStyle?.boxShadow || '',
        bottom:rowStyle?.borderBottomWidth || ''
      },
      alignmentSpread:tops.length >= 2 ? Math.max(...tops)-Math.min(...tops) : null,
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

  const serif = /Georgia|Times|serif/i;
  assert(result.wordText === expectedWord, 'word_identity', `${ordinal}:${result.wordText}`);
  assert(serif.test(result.wordFont), 'word_serif', result.wordFont);
  assert(!result.definitionFont || serif.test(result.definitionFont), 'definition_serif', result.definitionFont);
  assert(!result.usageFont || serif.test(result.usageFont), 'usage_serif', result.usageFont);
  assert(result.senseCount >= 1, 'sense_rows_present', String(ordinal));
  assert(result.row.radius === '0px', 'sense_not_card_radius', result.row.radius);
  assert(result.row.shadow === 'none', 'sense_not_card_shadow', result.row.shadow);
  assert(parseFloat(result.row.bottom || '0') >= 1, 'sense_rule_boundary', result.row.bottom);
  assert(result.alignmentSpread === null || result.alignmentSpread <= 8, 'sense_first_line_alignment', String(result.alignmentSpread));
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
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 }, deviceScaleFactor: 1 });
  const reports = [];

  reports.push(await audit(page, { ordinal: 1, expectedWord: 'a', expectExpansion: true, sparse: false }));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-a.png'), fullPage: false });

  reports.push(await audit(page, { ordinal: 2, expectedWord: 'abandon', expectExpansion: false, sparse: true }));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-abandon.png'), fullPage: false });

  reports.push(await audit(page, { ordinal: 13, expectedWord: 'abroad', expectExpansion: true, sparse: true }));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-abroad.png'), fullPage: false });

  fs.writeFileSync(path.join(outputRoot, 'report.json'), `${JSON.stringify({ status:'PASS', reports }, null, 2)}\n`);
  console.log(`Lexical visual convergence PASS → ${outputRoot}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
