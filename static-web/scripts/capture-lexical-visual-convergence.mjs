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

async function audit(page, { ordinal, expectedWord, sparse }) {
  await reveal(page, ordinal);
  const result = await page.evaluate(({ expectedWord, sparse }) => {
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
    const englishMeaning = firstUsableRow?.querySelector('.lexicalSenseMeaning>strong');
    const usage = firstUsableRow?.querySelector('.lexicalSenseUsage li>b');
    const body = document.querySelector('[data-vocab-body]');
    const reference = document.querySelector('.portedVocabEvidenceColumn');
    const patternSection = document.querySelector('.lexicalWordPatterns');
    const contentNodes = [...document.querySelectorAll(
      '.lexicalCoreHeadline>p,.lexicalCoreHeadline>b,.lexicalCoreHeadline>small,.lexicalSenseMeaning>p,.lexicalSenseMeaning>strong,.lexicalSenseNote,.lexicalSenseUsage li>b,.lexicalSenseUsage li>span,.lexicalExpansionSection>header>span,.portedVocabEvidenceList>article>b,.portedVocabEvidenceList>article>p,.portedVocabEvidenceList>article>small,.lexicalFormBoundary,.lexicalFormVariants b,.lexicalFormVariants span,.lexicalFamilyRows b'
    )].filter((node) => node instanceof HTMLElement && css(node).display !== 'none');
    const posRect = rect(pos);
    const meaningRect = rect(meaning);
    const englishMeaningRect = rect(englishMeaning);
    const usageRect = rect(usage);
    const tops = [posRect?.top, meaningRect?.top, usageRect?.top].filter((value) => Number.isFinite(value));
    const rowStyle = css(firstUsableRow);
    const referenceStyle = css(reference);
    const sheetRect = rect(sheet);
    const wordStyle = css(word);
    const definitionStyle = css(englishDefinition);
    const usageStyle = css(englishUsage);
    return {
      expectedWord,
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
      chineseBeforeEnglish:Boolean(meaningRect && englishMeaningRect && meaningRect.top < englishMeaningRect.top),
      columnGaps:{
        posMeaning:posRect && meaningRect ? meaningRect.left-posRect.right : null,
        meaningUsage:meaningRect && usageRect ? usageRect.left-meaningRect.right : null
      },
      hasReferenceFlag:body instanceof HTMLElement && body.dataset.hasReference === 'true',
      referencePresent:reference instanceof HTMLElement,
      reference:{
        radius:referenceStyle?.borderRadius || '',
        shadow:referenceStyle?.boxShadow || ''
      },
      patternPresent:patternSection instanceof HTMLElement,
      minContentFont:contentNodes.length ? Math.min(...contentNodes.map((node) => parseFloat(css(node).fontSize))) : null,
      sheetHeight:sheetRect?.height || null,
      viewport:{width:window.innerWidth,height:window.innerHeight},
      bodyScrollWidth:document.documentElement.scrollWidth,
      bodyClientWidth:document.documentElement.clientWidth
    };
  }, { expectedWord, sparse });

  // Always leave a real screenshot behind, even when a geometry assertion fails.
  await page.screenshot({ path: path.join(outputRoot, `lexical-${expectedWord}.png`), fullPage: false });

  const serif = /Georgia|Times|serif/i;
  assert(result.wordText === expectedWord, 'word_identity', `${ordinal}:${result.wordText}`);
  assert(serif.test(result.wordFont), 'word_serif', result.wordFont);
  assert(!result.definitionFont || serif.test(result.definitionFont), 'definition_serif', result.definitionFont);
  assert(!result.usageFont || serif.test(result.usageFont), 'usage_serif', result.usageFont);
  assert(result.senseCount >= 1, 'sense_rows_present', String(ordinal));
  assert(parseFloat(result.row.radius || '0') <= 8, 'sense_semantic_radius_bounded', result.row.radius);
  assert(result.row.shadow === 'none', 'sense_not_generic_card_shadow', result.row.shadow);
  if (result.senseCount > 1 && !result.firstUsableIsLast) {
    assert(parseFloat(result.row.bottom || '0') >= 1, 'sense_rule_boundary', result.row.bottom);
  }
  assert(result.alignmentSpread === null || result.alignmentSpread <= 12, 'sense_first_line_alignment', String(result.alignmentSpread));
  assert(result.chineseBeforeEnglish, 'sense_chinese_before_english', String(ordinal));
  assert(result.columnGaps.posMeaning === null || result.columnGaps.posMeaning >= 12, 'pos_meaning_no_collision', String(result.columnGaps.posMeaning));
  assert(result.columnGaps.meaningUsage === null || result.columnGaps.meaningUsage >= 12, 'meaning_usage_no_collision', String(result.columnGaps.meaningUsage));
  assert(result.minContentFont === null || result.minContentFont >= 15, 'learner_content_font_floor', String(result.minContentFont));
  assert(result.referencePresent === result.hasReferenceFlag, 'earned_reference_rail', `${ordinal}:${result.referencePresent}/${result.hasReferenceFlag}`);
  if (result.referencePresent) {
    assert(parseFloat(result.reference.radius || '0') <= 1, 'reference_rail_is_not_card', result.reference.radius);
    assert(result.reference.shadow === 'none', 'reference_rail_not_shadowed', result.reference.shadow);
  }
  if (sparse) assert(result.senseCount >= 1, 'sparse_surface_still_has_semantic_content', String(result.senseCount));
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
  assert(await page.locator('[data-kianos-global-rail]').isVisible(), 'v2_home_keeps_global_rail');
  assert(await page.locator('[data-kianos-subject-bar="english"]').count() === 0, 'v2_vocabulary_suppresses_parent_english_l2');
  assert(await page.locator('.lexicalLocalNav').count() === 1, 'v2_vocabulary_has_one_local_top_nav');
  assert(await page.locator('.lexicalBackEnglish').isVisible(), 'v2_home_has_parent_english_return');
  assert((await page.locator('.lexicalBackEnglish').getAttribute('href') || '').endsWith('/english/'), 'v2_home_parent_return_targets_english');
  assert(await page.locator('[data-lexical-panel="overview"]').isVisible(), 'v2_home_defaults_to_overview');
  const localJobs = [
    ...(await page.locator('[data-lexical-tab]').allTextContents()).map((row) => row.trim()),
    (await page.locator('[data-lexical-learn-nav]').innerText()).trim()
  ];
  assert(localJobs.sort().join('|') === ['Overview','Learn','Repair','Research'].sort().join('|'), 'v2_home_four_local_jobs', localJobs.join('|'));
  assert(await page.locator('[data-lexical-daily-limit]').inputValue() === '50', 'v2_home_daily_new_limit_default_50');
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '0', 'v2_home_same_day_revisit_starts_empty');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-home-1440x900.png'), fullPage: false });

  // Same-day revisit is ephemeral card routing support, not Repair debt.
  await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    const row = rows[0];
    if (!row) throw new Error('NO_LEXICAL_CATALOG_ROW');
    const now = new Date().toISOString();
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify({
      schema:'kianos.lexical.card_routing.v1',
      history:[{ event_id:'visual-same-day-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'UNKNOWN', observed_at:now }],
      latest_by_word:{ [row.objectId]:{ event_id:'visual-same-day-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'UNKNOWN', observed_at:now } }
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '1', 'v2_home_same_day_unknown_surfaces');
  const directLearnHref = await page.locator('[data-lexical-learn-nav]').getAttribute('href');
  const overviewContinueHref = await page.locator('[data-lexical-overview-continue]').getAttribute('href');
  assert(Boolean(directLearnHref) && directLearnHref === overviewContinueHref, 'v2_learn_nav_is_direct_coverage_action', String(directLearnHref));
  assert(await page.locator('[data-lexical-panel="learn"]').count() === 0, 'v2_learn_has_no_duplicate_home_panel');
  const sameDayHref = await page.locator('[data-lexical-same-day-start]').getAttribute('href');
  assert(Boolean(sameDayHref) && sameDayHref !== '#', 'v2_same_day_metric_jumps_directly_to_revisit', String(sameDayHref));

  await page.evaluate(() => {
    const routing = JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1') || '{}');
    const wordId = Object.keys(routing.latest_by_word || {})[0];
    const prior = routing.latest_by_word?.[wordId];
    const now = new Date().toISOString();
    const event = { ...prior, event_id:'visual-same-day-2', route:'KNOWN', observed_at:now };
    routing.history = [...(routing.history || []), event];
    routing.latest_by_word[wordId] = event;
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify(routing));
  });
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '0', 'v2_home_same_day_known_clears');
  assert(await page.locator('[data-lexical-same-day-start]').getAttribute('aria-disabled') === 'true', 'v2_home_same_day_action_disables_when_empty');
  await page.evaluate(() => localStorage.clear());

  // Repair is a direct Chat-compiled Test session, not a list-management page.
  await page.goto(`${origin}/vocabulary/4/`, { waitUntil: 'networkidle' });
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const repairRoot = page.locator('[data-local-port="vocabulary"]');
  const repairPlus = page.locator('[data-vocab-repair]').first();
  const repairTargetId = (await repairPlus.getAttribute('data-target-id')) || null;
  const repairTarget = {
    word_id: await repairRoot.getAttribute('data-vocab-object'),
    ordinal: Number(await repairRoot.getAttribute('data-vocab-ordinal')),
    word: await repairRoot.getAttribute('data-vocab-word'),
    target_kind: await repairPlus.getAttribute('data-target-kind'),
    target_id: repairTargetId,
    target_locator: (await repairPlus.getAttribute('data-target-locator')) || null,
    target_revision: repairTargetId ? null : await repairRoot.getAttribute('data-vocab-source-hash')
  };
  await repairPlus.click();
  await page.evaluate((target) => {
    localStorage.setItem('kianos-lexical-challenge-packet-v1', JSON.stringify({
      schema:'kianos.lexical.challenge_packet.v1',
      study_day:'2099-09-18',
      generated_at:'2099-09-18T08:00:00Z',
      challenges:[{
        challenge_id:'visual-repair-session-1',
        ...target,
        source_evidence:'Depth 中手动 +',
        demand:'discrimination',
        question_type:'spatial_choice',
        stem:'哪个选项最符合当前要修的这个词义边界？',
        options:[
          { key:'up', text:'上方干扰项' },
          { key:'left', text:'左侧干扰项' },
          { key:'right', text:'右侧干扰项' },
          { key:'down', text:'正确选项' }
        ],
        correct_key:'down',
        repair:'只修当前局部边界，不重新学习整张词卡。',
        reconstruction:{
          stem:'换一个语境，再判断一次同一个局部边界。',
          options:[
            { key:'left', text:'干扰项' },
            { key:'right', text:'正确项' }
          ],
          correct_key:'right'
        }
      }]
    }));
  }, repairTarget);
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-challenge-import-panel]').isHidden(), 'v2_repair_synced_test_skips_import_surface');
  assert((await page.locator('[data-challenge-word]').innerText()).trim() === repairTarget.word, 'v2_repair_current_word_matches_target');
  assert(await page.locator('[data-challenge-choice]:visible').count() === 4, 'v2_repair_spatial_four_choice_surface');
  const repairCurrentBox = await page.locator('.lexicalRepairCurrent').boundingBox();
  const repairQuestionBox = await page.locator('.lexicalRepairQuestion').boundingBox();
  assert(Boolean(repairCurrentBox && repairQuestionBox), 'v2_repair_mac_wide_geometry_exists');
  assert(repairQuestionBox.width > repairCurrentBox.width * 2.5, 'v2_repair_question_dominates_current_meta', `${repairQuestionBox?.width}/${repairCurrentBox?.width}`);
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-active-1440x900.png'), fullPage: false });

  // Wrong answer expands only the minimum Repair, then Reconstruction keeps the same four-direction language.
  await page.locator('[data-challenge-choice="up"]').click();
  assert((await page.locator('[data-challenge-feedback]').innerText()).includes('只修当前局部边界'), 'v2_repair_wrong_shows_minimum_repair');
  assert((await page.locator('[data-challenge-continue]').innerText()).includes('Reconstruct'), 'v2_repair_wrong_offers_reconstruction');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-wrong-1440x900.png'), fullPage: false });
  await page.locator('[data-challenge-continue]').click();
  assert((await page.locator('[data-challenge-progress]').innerText()).includes('Reconstruct'), 'v2_repair_enters_reconstruction');
  assert(await page.locator('[data-challenge-choice]:visible').count() === 2, 'v2_repair_reconstruction_uses_compact_spatial_choice');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-reconstruction-1440x900.png'), fullPage: false });

  await page.evaluate(() => localStorage.clear());
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.locator('[data-lexical-tab="repair"]').click();
  assert(await page.locator('[data-challenge-import-panel]').isVisible(), 'v2_repair_empty_uses_waiting_surface');
  assert((await page.locator('[data-challenge-waiting-title]').innerText()).includes('没有需要处理的 Repair'), 'v2_repair_empty_state_is_calm');
  assert(await page.locator('[data-challenge-empty-learn]').isVisible(), 'v2_repair_empty_returns_to_learn');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-empty-1440x900.png'), fullPage: false });
  await page.locator('[data-lexical-tab="overview"]').click();

  // Research modes must browse real Final Learner Object facets, not decorative categories.
  await page.locator('[data-lexical-open-research="familiar"]').click();
  assert(await page.locator('[data-lexical-panel="research"]').isVisible(), 'v2_research_quick_entry_opens_panel');
  assert(await page.locator('[data-lexical-search-box]').isHidden(), 'v2_research_browse_hides_search_box');
  assert(await page.locator('[data-lexical-search-results] .lexicalWordRow').count() > 0, 'v2_research_familiar_has_real_rows');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-research-familiar-1440x900.png'), fullPage: false });
  for (const mode of ['relations', 'constructions', 'family', 'form']) {
    await page.locator(`[data-lexical-research-mode="${mode}"]`).click();
    assert(await page.locator('[data-lexical-search-results] .lexicalWordRow').count() > 0, `v2_research_${mode}_has_real_rows`);
  }
  await page.locator('[data-lexical-research-mode="search"]').click();
  assert(await page.locator('[data-lexical-search-box]').isVisible(), 'v2_research_search_restores_input');
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });

  // My / Settings is a real utility layer, not decorative chrome.
  await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    const row = rows[0];
    if (!row) throw new Error('NO_LEXICAL_CATALOG_ROW');
    const now = new Date().toISOString();
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify({
      schema:'kianos.lexical.card_routing.v1',
      history:[{ event_id:'visual-mastered-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'MASTERED', observed_at:now }],
      latest_by_word:{ [row.objectId]:{ event_id:'visual-mastered-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'MASTERED', observed_at:now } }
    }));
  });
  await page.locator('[data-lexical-settings-open]').click();
  assert(await page.locator('[data-lexical-settings-dialog]').isVisible(), 'v2_settings_dialog_opens');
  assert((await page.locator('[data-lexical-mastered-count]').innerText()).trim() === '1', 'v2_settings_mastered_count_reads_latest_routing');
  assert(await page.locator('[data-lexical-mastered-list] .lexicalWordRow').count() === 1, 'v2_settings_mastered_list_renders_current_mastered');

  await page.locator('[data-lexical-pronunciation="en-GB"]').click();
  assert(await page.locator('[data-lexical-pronunciation="en-GB"]').getAttribute('aria-pressed') === 'true', 'v2_settings_default_pronunciation_changes');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-settings-1440x900.png'), fullPage: false });
  await page.locator('.lexicalSettingsClose').click();

  await page.locator('[data-lexical-daily-limit]').selectOption('30');
  const savedSettings = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-settings-v1') || '{}'));
  assert(savedSettings.daily_new_limit === 30, 'v2_settings_daily_limit_updates');
  assert(savedSettings.default_pronunciation === 'en-GB', 'v2_settings_daily_limit_preserves_pronunciation');

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-lexical-settings-open]').click();
  await page.locator('[data-lexical-export-state]').click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().startsWith('kianos-lexical-backup-'), 'v2_settings_backup_downloads_json', download.suggestedFilename());

  await page.evaluate(() => {
    localStorage.setItem('kianos-lexical-settings-v1', JSON.stringify({
      schema:'kianos.lexical.settings.v1',
      daily_new_limit:20,
      default_pronunciation:'en-US'
    }));
  });
  await page.locator('[data-lexical-import-file]').setInputFiles({
    name:'lexical-restore-test.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify({
      schema:'kianos.lexical.local_backup.v1',
      exported_at:new Date().toISOString(),
      data:{
        'kianos-lexical-settings-v1':JSON.stringify({
          schema:'kianos.lexical.settings.v1',
          daily_new_limit:30,
          default_pronunciation:'en-GB'
        })
      }
    }))
  });
  await page.waitForFunction(() => document.querySelector('[data-lexical-backup-status]')?.textContent?.includes('已恢复'));
  const restoredSettings = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-settings-v1') || '{}'));
  assert(restoredSettings.daily_new_limit === 30, 'v2_settings_backup_restores_daily_limit');
  assert(restoredSettings.default_pronunciation === 'en-GB', 'v2_settings_backup_restores_pronunciation');
  assert((await page.locator('[data-lexical-backup-status]').innerText()).includes('已恢复'), 'v2_settings_backup_reports_restore');
  await page.locator('.lexicalSettingsClose').click();

  await page.goto(`${origin}/vocabulary/1/`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-default-speak]').first().getAttribute('data-vocab-speak') === 'en-GB', 'v2_word_study_uses_default_pronunciation');
  assert((await page.locator('[data-vocab-default-speak]').first().innerText()).includes('英音'), 'v2_word_study_default_pronunciation_label');
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());

  // English → Vocabulary → exact English return is one shared bridge, not a second dictionary.
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  const lexicalWords = await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    return rows.map((row) => String(row.word || '').toLowerCase()).filter(Boolean);
  });
  await page.goto(`${origin}/reading/`, { waitUntil: 'networkidle' });
  const firstReadingHref = await page.locator('[data-reading-continue]').getAttribute('href');
  assert(Boolean(firstReadingHref), 'v2_english_handoff_has_reading_fixture');
  await page.goto(new URL(firstReadingHref, origin).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: Math.min(360, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }));
  const readingReturnHref = await page.evaluate(() => location.pathname + location.search + location.hash);
  const expectedReturnY = await page.evaluate(() => window.scrollY);
  const paragraphTexts = await page.locator('[data-reading-passage] p').allTextContents();
  let selectionFixture = null;
  const knownLexicalWords = new Set(lexicalWords);
  for (const minimumLength of [3, 2]) {
    for (let index = 0; index < paragraphTexts.length && !selectionFixture; index += 1) {
      const tokens = String(paragraphTexts[index] || '').match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || [];
      const word = tokens.find((token) => token.length >= minimumLength && knownLexicalWords.has(token.toLowerCase()));
      if (word) selectionFixture = { index, word };
    }
    if (selectionFixture) break;
  }
  assert(Boolean(selectionFixture), 'v2_english_handoff_has_current_lexical_token');
  const selected = await page.evaluate(({ index, word }) => {
    const root = document.querySelectorAll('[data-reading-passage] p')[index];
    if (!(root instanceof HTMLElement)) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const target = word.toLowerCase();
    const isLetter = (char) => Boolean(char && /[A-Za-z]/.test(char));
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.nodeValue || '';
      const lower = value.toLowerCase();
      let cursor = lower.indexOf(target);
      while (cursor >= 0) {
        const before = cursor > 0 ? value[cursor - 1] : '';
        const afterIndex = cursor + word.length;
        const after = afterIndex < value.length ? value[afterIndex] : '';
        if (!isLetter(before) && !isLetter(after)) {
          const range = document.createRange();
          range.setStart(node, cursor);
          range.setEnd(node, cursor + word.length);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          (node.parentElement || root).dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 120, clientY: 160 }));
          return true;
        }
        cursor = lower.indexOf(target, cursor + 1);
      }
    }
    return false;
  }, selectionFixture);
  const selectedWord = selectionFixture.word;
  assert(selected, 'v2_english_handoff_selects_current_lexical_word', selectedWord);
  await page.locator('[data-english-selection-menu]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-selection-lexical]').isVisible(), 'v2_english_selection_exposes_lexical_action');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-selection-1440x900.png'), fullPage: false });

  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL(/\/vocabulary\/\d+\/?\?mode=lookup$/);
  await page.locator('[data-local-port="vocabulary"][data-vocab-mode="lookup"]').waitFor({ state: 'visible' });
  assert((await page.locator('.lexicalWordIdentity h2').innerText()).trim().toLowerCase() === selectedWord.toLowerCase(), 'v2_english_handoff_opens_exact_owner', selectedWord);
  assert(await page.locator('[data-english-lexical-return]').isVisible(), 'v2_english_handoff_keeps_return_context');
  assert((await page.locator('[data-english-return-meta]').innerText()).includes('不推进 Coverage'), 'v2_english_handoff_lookup_is_nonprogressing');
  const routingAfterLookup = await page.evaluate(() => localStorage.getItem('kianos-lexical-card-routing-v1'));
  assert(routingAfterLookup === null, 'v2_english_lookup_does_not_create_card_routing');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-handoff-lookup-1440x900.png'), fullPage: false });

  await page.locator('[data-english-return-action]').click();
  await page.waitForURL((url) => url.pathname + url.search + url.hash === readingReturnHref);
  await page.waitForTimeout(120);
  const returnedY = await page.evaluate(() => window.scrollY);
  assert(Math.abs(returnedY - expectedReturnY) < 120, 'v2_english_handoff_restores_window_position', `${expectedReturnY}->${returnedY}`);
  const returnContext = await page.evaluate(() => sessionStorage.getItem('kianos-english-lexical-return-v1'));
  assert(returnContext === null, 'v2_english_handoff_clears_return_context_after_restore');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-handoff-return-1440x900.png'), fullPage: false });

  // Daily new-word ceiling is a real capacity guard, not decorative Home state.
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('kianos-lexical-settings-v1', JSON.stringify({ schema:'kianos.lexical.settings.v1', daily_new_limit:1 }));
  });
  await page.goto(`${origin}/vocabulary/3/`, { waitUntil: 'networkidle' });
  await page.locator('[data-vocab-action-dock] [data-vocab-route="known"]').click();
  await page.waitForURL('**/vocabulary/?limit=reached');
  assert((await page.locator('[data-lexical-today-new]').first().innerText()).trim() === '1', 'v2_daily_limit_records_first_new_word');
  assert((await page.locator('[data-lexical-new-remaining]').innerText()).trim() === '0', 'v2_daily_limit_remaining_zero');
  assert(await page.locator('[data-lexical-overview-continue]').getAttribute('aria-disabled') === 'true', 'v2_daily_limit_blocks_next_new_word');
  assert(await page.locator('[data-lexical-learn-nav]').getAttribute('aria-disabled') === 'true', 'v2_daily_limit_blocks_direct_learn_nav');
  await page.evaluate(() => localStorage.clear());

  await page.goto(`${origin}/vocabulary/3/`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-kianos-global-rail]').isHidden(), 'v2_word_study_hides_global_rail');
  assert(await page.locator('[data-study-timer-dock]').isHidden(), 'v2_word_study_hides_shared_timer');
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

  // Rule → Content → Visual Human-Gate fixtures.
  const depthFixtures = [
    {
      ordinal: 4248,
      word: 'sanction',
      expectPatterns: true,
      expectReference: false,
      expectText: [
        '同一个“官方权力”词可以走两个相反方向：批准，或处罚/制裁',
        '先看权力是在“放行”还是“惩罚”',
        '正式批准；授权',
        '官方制裁；处罚',
        'impose sanctions on/against sb/sth',
        'sanction sb for (doing) sth'
      ],
      expectAbsent: [
        'an institutional-authority word with two opposing branches',
        'ask what authority is doing'
      ]
    },
    {
      ordinal: 19,
      word: 'abstract',
      expectPatterns: true,
      expectReference: true,
      expectText: [
        '把具体细节拿开，只保留概念或关键信息；名词还表示论文/文章的摘要',
        'adj = 从具体实例抽离；noun = 把论文压成摘要；verb = 从材料中抽取/抽象出。',
        'AB-stract',
        '/ˈæb.strækt/',
        'ab-STRACT',
        '/əbˈstrækt/',
        'abstractly',
        'abstract (adjective) → abstractly (adverb): 表示以抽象、概念化方式，而不是针对具体实例',
        'in an abstract or conceptual way rather than through a concrete instance'
      ],
      expectAbsent: [
        'Adjective/noun and verb remain one Word identity; POS selects the stress pattern.',
        'As adjective/noun, stress is normally on the first syllable: AB-stract.',
        'As a verb, stress normally shifts to the second syllable: ab-STRACT.',
        'initial',
        'final'
      ]
    },
    {
      ordinal: 5477,
      word: 'write',
      expectPatterns: false,
      expectReference: true,
      expectText: [
        'write ↔ right',
        'write 是动词“写”；right 可表正确、权利或右侧'
      ]
    }
  ];
  for (const fixture of depthFixtures) {
    await page.evaluate((word) => localStorage.removeItem(`kianos-vocabulary-astro-v2:word:${word}`), fixture.word);
    await page.goto(`${origin}/vocabulary/${fixture.ordinal}/`, { waitUntil: 'networkidle' });
    await page.locator('[data-vocab-front]').waitFor({ state: 'visible' });
    assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === fixture.word, `v2_depth_fixture_${fixture.word}`);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
    assert(await page.locator('.lexicalCoreHeadline').isVisible(), `v2_word_feel_header_${fixture.word}`);
    assert(await page.locator('.lexicalCoreRow').count() === 0, `v2_no_duplicate_core_card_${fixture.word}`);
    const patternVisible = await page.locator('.lexicalWordPatterns').isVisible().catch(() => false);
    assert(patternVisible === fixture.expectPatterns, `v2_word_owned_patterns_${fixture.word}`, String(patternVisible));
    const constructionInReference = await page.locator('.portedVocabEvidenceColumn .lexicalConstructionSection').count();
    assert(constructionInReference === 0, `v2_no_construction_in_reference_${fixture.word}`, String(constructionInReference));
    const referenceVisible = await page.locator('.portedVocabEvidenceColumn').isVisible().catch(() => false);
    assert(referenceVisible === fixture.expectReference, `v2_reference_presence_${fixture.word}`, String(referenceVisible));
    const familyDebug = fixture.word === 'abstract'
      ? await page.locator('.lexicalFamilySection').evaluateAll((nodes) => nodes.map((node) => ({
          text: node.innerText,
          html: node.innerHTML
        })))
      : [];
    if (fixture.word === 'abstract') {
      console.log('LEXICAL_ABSTRACT_FAMILY_DEBUG', JSON.stringify(familyDebug));
    }
    await page.screenshot({ path: path.join(outputRoot, `lexical-v2-depth-${fixture.word}-1440x900.png`), fullPage: false });
    const renderedText = await page.locator('[data-vocab-details]').innerText();
    for (const expectedText of fixture.expectText || []) {
      assert(
        renderedText.includes(expectedText),
        `v2_direct_render_${fixture.word}_${expectedText}`,
        fixture.word === 'abstract' ? JSON.stringify(familyDebug) : ''
      );
    }
    for (const forbiddenText of fixture.expectAbsent || []) {
      assert(
        !renderedText.includes(forbiddenText),
        `v2_no_repeated_info_${fixture.word}_${forbiddenText}`,
        renderedText
      );
    }
    assert(await page.locator('.lexicalCoreBranches').count() === 0, `v2_no_core_cluster_cards_${fixture.word}`);
    if (fixture.word === 'abstract') {
      const formRows = await page.locator('.lexicalFormVariants article').evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
        })
      );
      assert(formRows.length >= 2, 'v2_abstract_form_rows_present', JSON.stringify(formRows));
      assert(formRows[1].top >= formRows[0].bottom - 1, 'v2_abstract_form_rows_do_not_overlap', JSON.stringify(formRows));
      assert(Math.abs(formRows[1].left - formRows[0].left) <= 1, 'v2_abstract_form_rows_align_left', JSON.stringify(formRows));
      const leftTop = await page.locator('.lexicalSenseRow').first().boundingBox();
      const rightTop = await page.locator('.portedVocabEvidenceColumn .lexicalExpansionSection').first().boundingBox();
      assert(
        Boolean(leftTop && rightTop && Math.abs(leftTop.y - rightTop.y) <= 2),
        'v2_abstract_reference_top_aligns_with_first_sense',
        JSON.stringify({leftTop,rightTop})
      );
    }
    const fixtureDock = await page.locator('[data-vocab-action-dock]').boundingBox();
    assert(Boolean(fixtureDock && fixtureDock.y + fixtureDock.height <= 900), `v2_depth_dock_in_view_${fixture.word}`, JSON.stringify(fixtureDock));
  }

  // Final Learner Object pressure-test fixtures across distinct content shapes.
  const finalObjectFixtures = [
    {
      ordinal: 177,
      word: 'ambulance',
      assertPage: async () => {
        assert(await page.locator('.lexicalCoreHeadline').count() === 0, 'final_ambulance_no_duplicate_word_feel');
        assert(await page.locator('.lexicalSenseRow').count() === 1, 'final_ambulance_one_sense');
        assert(await page.locator('.portedVocabEvidenceColumn').count() === 0, 'final_ambulance_no_empty_reference');
      }
    },
    {
      ordinal: 29,
      word: 'access',
      assertPage: async () => {
        assert(await page.locator('.lexicalSenseRow:not(.lexicalSecondarySenseRow)').count() === 6, 'final_access_six_active_senses');
        assert(await page.locator('.lexicalSecondarySenseRow').count() === 0, 'final_access_no_duplicate_secondary');
        assert(await page.locator('.lexicalFamilySection').isVisible(), 'final_access_family_reference');
      }
    },
    {
      ordinal: 4209,
      word: 'row',
      assertPage: async () => {
        assert(await page.locator('.lexicalSenseRow').count() === 3, 'final_row_three_senses');
        assert(await page.locator('.portedVocabIdentityOverlay').count() === 0, 'final_row_no_repeated_pronunciation_overlays');
        const text = await page.locator('[data-vocab-details]').innerText();
        assert(text.includes('/roʊ/') && text.includes('/raʊ/'), 'final_row_word_feel_keeps_pronunciation_boundary');
      }
    },
    {
      ordinal: 4680,
      word: 'stationary',
      assertPage: async () => {
        const text = await page.locator('[data-vocab-details]').innerText();
        assert(text.includes('stationary ↔ stationery'), 'final_stationary_confusable_title');
        assert(text.includes('stationary 表静止；stationery 指文具'), 'final_stationary_confusable_boundary');
      }
    },
    {
      ordinal: 761,
      word: 'charge',
      assertPage: async () => {
        assert(await page.locator('.lexicalSenseRow').count() === 7, 'final_charge_seven_senses');
        const text = await page.locator('[data-vocab-details]').innerText();
        assert(text.includes('be in charge of sth') && text.includes('take charge of sth'), 'final_charge_keeps_extra_constructions');
      }
    }
  ];

  for (const fixture of finalObjectFixtures) {
    await page.evaluate((word) => localStorage.removeItem(`kianos-vocabulary-astro-v2:word:${word}`), fixture.word);
    await page.goto(`${origin}/vocabulary/${fixture.ordinal}/`, { waitUntil: 'networkidle' });
    await page.locator('[data-vocab-front]').waitFor({ state: 'visible' });
    assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === fixture.word, `final_fixture_${fixture.word}`);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
    await fixture.assertPage();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 2, `final_fixture_no_horizontal_overflow_${fixture.word}`, String(overflow));
    await page.screenshot({ path: path.join(outputRoot, `lexical-final-audit-${fixture.word}-1440x900.png`), fullPage: false });
  }

  // Tighter Mac landscape evidence: same learning geometry, reduced secondary density.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => localStorage.removeItem('kianos-vocabulary-astro-v2:word:write'));
  await page.goto(`${origin}/vocabulary/5477/`, { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-front]').isVisible(), 'v2_mac_compact_recall_visible');
  const compactRecallOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(compactRecallOverflow <= 2, 'v2_mac_compact_recall_no_horizontal_overflow', String(compactRecallOverflow));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-recall-1280x800.png'), fullPage: false });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  const compactDepthOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(compactDepthOverflow <= 2, 'v2_mac_compact_depth_no_horizontal_overflow', String(compactDepthOverflow));
  const dockBox = await page.locator('[data-vocab-action-dock]').boundingBox();
  assert(Boolean(dockBox && dockBox.y + dockBox.height <= 800), 'v2_mac_compact_dock_stays_in_view', JSON.stringify(dockBox));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-depth-1280x800.png'), fullPage: false });
  await page.setViewportSize({ width: 1440, height: 900 });

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

  reports.push(await audit(page, { ordinal: 1, expectedWord: 'a', sparse: false }));
  reports.push(await audit(page, { ordinal: 2, expectedWord: 'abandon', sparse: true }));
  reports.push(await audit(page, { ordinal: 13, expectedWord: 'abroad', sparse: true }));

  fs.writeFileSync(path.join(outputRoot, 'report.json'), `${JSON.stringify({ status:'PASS', reports }, null, 2)}\n`);
  console.log(`Lexical visual convergence PASS → ${outputRoot}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
