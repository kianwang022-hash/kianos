import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(webRoot, '../ui-current-review');
const port = Number(process.env.KIANOS_UI_REVIEW_PORT || 4329);
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
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Astro preview did not start: ${lastError?.message || ''}\n${serverLog}`);
}

function assert(condition, label, detail = '') {
  if (!condition) throw new Error(`UI_REVIEW_FAIL:${label}${detail ? `:${detail}` : ''}`);
}

async function reveal(page, ordinal) {
  await page.goto(`${origin}/vocabulary/${ordinal}/`, { waitUntil: 'networkidle' });
  const revealButton = page.locator('[data-vocab-reveal]');
  if (await revealButton.isVisible()) await revealButton.click();
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
}

async function lexicalAudit(page, { ordinal, expectedWord, expectExpansion, sparse }) {
  await reveal(page, ordinal);

  const result = await page.evaluate(({ expectedWord, expectExpansion, sparse }) => {
    const style = (selector) => {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) return null;
      const cs = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        fontFamily: cs.fontFamily,
        fontSize: parseFloat(cs.fontSize),
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        borderTopWidth: cs.borderTopWidth,
        borderBottomWidth: cs.borderBottomWidth,
        display: cs.display,
        backgroundColor: cs.backgroundColor,
        top: rect.top,
        height: rect.height,
        width: rect.width,
        text: (node.textContent || '').trim()
      };
    };

    const word = style('.lexicalWordIdentity h2');
    const sheet = style('.portedVocabStudySheet');
    const rows = [...document.querySelectorAll('.lexicalSenseRow')].filter((node) => node instanceof HTMLElement);
    const firstUsableRow = rows.find((row) => row.querySelector('.lexicalSenseUsage li>b')) || rows[0];
    const pos = firstUsableRow?.querySelector('header>span');
    const meaning = firstUsableRow?.querySelector('.lexicalSenseMeaning>p');
    const usage = firstUsableRow?.querySelector('.lexicalSenseUsage li>b');
    const rowStyle = firstUsableRow instanceof HTMLElement ? getComputedStyle(firstUsableRow) : null;
    const expansion = document.querySelector('.lexicalExpansionSection');
    const expansionStyle = expansion instanceof HTMLElement ? getComputedStyle(expansion) : null;
    const visibleLearner = [...document.querySelectorAll(
      '.lexicalWordIdentity>span,.lexicalCoreHeadline>p,.lexicalCoreHeadline>b,.lexicalCoreHeadline>small,.lexicalSenseRow>header>span,.lexicalSenseRow>header>small,.lexicalSenseMeaning>p,.lexicalSenseMeaning>strong,.lexicalSenseNote,.lexicalSenseUsage li>b,.lexicalSenseUsage li>span,.lexicalExpansionSection>header>span,.lexicalExpansionSection>header>small,.portedVocabEvidenceList>article>b,.portedVocabEvidenceList>article>p,.portedVocabEvidenceList>article>small'
    )].filter((node) => node instanceof HTMLElement && getComputedStyle(node).display !== 'none');

    const tops = [pos, meaning, usage]
      .filter((node) => node instanceof HTMLElement)
      .map((node) => node.getBoundingClientRect().top);

    return {
      expectedWord,
      expectExpansion,
      sparse,
      word,
      sheet,
      senseCount: rows.length,
      row: rowStyle ? {
        borderRadius: rowStyle.borderRadius,
        boxShadow: rowStyle.boxShadow,
        borderBottomWidth: rowStyle.borderBottomWidth
      } : null,
      alignmentSpread: tops.length >= 2 ? Math.max(...tops) - Math.min(...tops) : null,
      expansionPresent: expansion instanceof HTMLElement,
      expansion: expansionStyle ? {
        borderRadius: expansionStyle.borderRadius,
        boxShadow: expansionStyle.boxShadow
      } : null,
      minimumVisibleFont: visibleLearner.length
        ? Math.min(...visibleLearner.map((node) => parseFloat(getComputedStyle(node).fontSize)))
        : null
    };
  }, { expectedWord, expectExpansion, sparse });

  assert(result.word?.text === expectedWord, 'word_identity', `${ordinal}:${result.word?.text}`);
  assert(/Iowan|Palatino|Book Antiqua|Georgia|Times|serif/i.test(result.word?.fontFamily || ''), 'lexical_serif_role', result.word?.fontFamily || 'missing');
  assert(result.senseCount >= 1, 'sense_rows_present', String(ordinal));
  assert(result.row?.borderRadius === '0px', 'sense_not_card_radius', result.row?.borderRadius || 'missing');
  assert(result.row?.boxShadow === 'none', 'sense_not_card_shadow', result.row?.boxShadow || 'missing');
  assert(parseFloat(result.row?.borderBottomWidth || '0') >= 1, 'sense_rule_boundary', result.row?.borderBottomWidth || 'missing');
  assert(result.alignmentSpread === null || result.alignmentSpread <= 7, 'sense_first_line_alignment', String(result.alignmentSpread));
  assert(result.minimumVisibleFont === null || result.minimumVisibleFont >= 15, 'visible_learner_type_floor', String(result.minimumVisibleFont));
  assert(result.expansionPresent === expectExpansion, 'earned_expansion', `${ordinal}:${result.expansionPresent}`);
  if (result.expansionPresent) {
    assert(result.expansion?.borderRadius === '0px', 'expansion_not_card_radius', result.expansion?.borderRadius || 'missing');
    assert(result.expansion?.boxShadow === 'none', 'expansion_not_card_shadow', result.expansion?.boxShadow || 'missing');
  }
  if (sparse) {
    assert((result.sheet?.height || 9999) < 650, 'sparse_sheet_content_height', String(result.sheet?.height));
  }

  return result;
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1536, height: 900 }, deviceScaleFactor: 1 });

  const reports = [];
  reports.push(await lexicalAudit(page, { ordinal: 2, expectedWord: 'abandon', expectExpansion: false, sparse: true }));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-abandon-current.png'), fullPage: false });

  reports.push(await lexicalAudit(page, { ordinal: 13, expectedWord: 'abroad', expectExpansion: true, sparse: true }));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-abroad-current.png'), fullPage: false });

  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputRoot, 'lexical-home-current.png'), fullPage: false });

  fs.writeFileSync(path.join(outputRoot, 'report.json'), `${JSON.stringify({
    status: 'PASS',
    viewport: { width: 1536, height: 900 },
    reports
  }, null, 2)}\n`);

  console.log(`Current UI review PASS → ${outputRoot}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
