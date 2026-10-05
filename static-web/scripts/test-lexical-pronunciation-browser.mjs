import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { pronunciationFrontText } from '../src/lib/lexicalPronunciation.mjs';
import { LEXICAL_LEDGER_STORAGE_KEY } from '../src/lib/lexicalEvidence.mjs';

// Own a fresh Candidate/private runtime by default. An external static runtime
// must be explicitly isolated by its caller; this test must never target Stable.
const external = process.env.LEXICAL_IPA_TEST_BASE;
if (external && process.env.KIANOS_ISOLATED_TEST_RUNTIME !== '1') throw new Error('IPA_TEST_REQUIRES_ISOLATED_RUNTIME');
const port = Number(process.env.LEXICAL_IPA_TEST_PORT || 4322);
const base = external || `http://127.0.0.1:${port}`;
if (new URL(base).port === '4321') throw new Error('IPA_TEST_MUST_NOT_TARGET_STABLE');
const out = process.env.LEXICAL_IPA_TEST_OUT || fs.mkdtempSync(path.join(os.tmpdir(), 'kianos-ipa-proof-'));
fs.mkdirSync(out, { recursive: true });
const checks = [];
const check = (ok, name) => { checks.push({ name, ok: Boolean(ok) }); assert.ok(ok, name); console.log('PASS '+name); };
let server, browser, page, serverLog = '';
const allFinal = fs.readdirSync('../content/lexical/learner/final/shards').filter(name => name.endsWith('.json')).flatMap(name => JSON.parse(fs.readFileSync('../content/lexical/learner/final/shards/'+name, 'utf8')));
const final = ordinal => allFinal.find(word => word.ordinal === ordinal);
try {
  if (!external) {
    server = spawn(process.execPath, ['scripts/kianos-candidate-runtime.mjs'], { cwd: process.cwd(), env: { ...process.env, KIANOS_CANDIDATE_PORT: String(port), KIANOS_CANDIDATE_OPEN: '0' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    server.stdout.on('data', chunk => { serverLog += chunk; });
    server.stderr.on('data', chunk => { serverLog += chunk; });
    for (let i = 0; !serverLog.includes('[KianOS Candidate] READY'); i++) {
      if (i > 200 || server.exitCode !== null) throw new Error('candidate startup: '+serverLog);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => { const style = document.createElement('style'); style.textContent = 'astro-dev-toolbar{display:none!important}'; document.head.append(style); });
    // Call-count/locale correctness only: this is not source-audio or timing proof.
    window.__ipaSpeech = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { value: { cancel() {}, getVoices() { return []; }, speak(utterance) { window.__ipaSpeech.push({ text: utterance.text, lang: utterance.lang }); }, addEventListener() {}, removeEventListener() {} } });
    if (!localStorage.getItem('__ipa-fixture')) { localStorage.setItem('kianos-vocabulary-last-ordinal', '7000'); localStorage.setItem('__ipa-fixture', '1'); }
  });
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const count = () => page.evaluate(() => window.__ipaSpeech.length);
  const open = async (ordinal, mode = 'study') => {
    await page.goto(`${base}/vocabulary/word/?o=${ordinal}&mode=${mode}`);
    await page.locator(`[data-vocab-ordinal="${ordinal}"][data-vocab-initialized="true"][data-vocab-evidence-initialized="true"]`).waitFor();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator('[data-local-port="vocabulary"]').getAttribute('data-vocab-source-hash'), final(ordinal).source_fingerprint, 'served source fingerprint');
  };
  const shot = name => page.screenshot({ path: path.join(out, name+'.png') });
  const visibleIpa = () => page.locator('[data-vocab-front] [data-vocab-ipa-locale="en-US"]:visible').textContent();
  const scope = id => page.locator(`[data-vocab-sense-ipa="${id}"]`);
  await open(23);
  check(await visibleIpa() === pronunciationFrontText(final(23).pronunciation_support, 'en-US') && (await visibleIpa()).includes('/'), 'academic_front_uses_real_final_us_ipa');
  check(await count() === 1, 'front_auto_speech_once');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('kianos:vocabulary-root-ready')));
  check(await count() === 1, 'repeated_root_ready_does_not_repeat_auto_speech');
  check(await page.locator('[data-vocab-details]').isHidden(), 'meaning_and_scope_hidden_before_reveal');
  check(!(await page.locator('[data-vocab-front]').innerText()).includes(final(23).senses[0].definition_cn), 'front_does_not_leak_definition');
  await shot('academic-front');
  await page.locator('[data-vocab-front] [data-vocab-default-speak]').click();
  check(await count() === 2 && await page.locator('[data-vocab-details]').isHidden(), 'left_us_label_replays_without_reveal');
  await page.locator('[data-vocab-front] .lexicalPronunciationToggle [data-vocab-speak="en-GB"]').click();
  check(await page.locator('[data-vocab-front] [data-vocab-default-speak]').textContent() === '英音', 'uk_toggle_changes_label');
  check(await page.locator('[data-vocab-front] [data-vocab-ipa-locale="en-GB"]:visible').textContent() === pronunciationFrontText(final(23).pronunciation_support, 'en-GB'), 'uk_toggle_uses_only_supported_uk_ipa');
  await page.locator('[data-vocab-front] [data-vocab-default-speak]').click();
  await page.keyboard.press('s');
  check(await count() === 5 && await page.evaluate(() => window.__ipaSpeech.slice(-3).every(call => call.lang === 'en-GB')), 'uk_switch_left_replay_and_s_use_selected_locale_once');
  await page.locator('[data-vocab-reveal]').click();
  check(await count() === 5, 'reveal_does_not_duplicate_auto_speech');
  check(await page.locator('[data-vocab-details] [data-vocab-default-speak]').textContent() === '英音', 'revealed_header_keeps_selected_locale');
  await page.evaluate(() => { localStorage.setItem('kianos-lexical-settings-v1', JSON.stringify({ schema: 'kianos.lexical.settings.v1', daily_new_limit: 50, default_pronunciation: 'en-US' })); window.dispatchEvent(new Event('kianos:lexical-settings-changed')); });
  check(await count() === 5, 'settings_update_does_not_add_speech');

  await open(26); await page.locator('[data-vocab-reveal]').click();
  check(await page.locator('[data-vocab-details] [data-vocab-ipa-locale="en-US"]:visible').first().textContent() === pronunciationFrontText(final(26).pronunciation_support, 'en-US'), 'accent_coverage_header_uses_final_ipa');
  await shot('accent-depth');
  await open(177);
  await page.locator('[data-vocab-front] .lexicalPronunciationToggle [data-vocab-speak="en-GB"]').click();
  check(await page.locator('[data-vocab-front] [data-vocab-ipa-locale="en-GB"]:visible').textContent() === '音标暂缺', 'ambulance_unknown_is_not_borrowed_as_uk');
  check(await page.locator('[data-vocab-front] [data-vocab-ipa-locale="unknown"]').isVisible(), 'unmarked_reading_is_explicitly_separate');
  check(await page.locator('.lexicalFormSection').count() === 0, 'ordinary_ipa_adds_no_form_reference');
  await shot('ambulance-uk-fallback');
  const lookupCursor = await page.evaluate(() => localStorage.getItem('kianos-vocabulary-last-ordinal'));
  await open(19, 'lookup');
  check((await scope('sense:abstract:b7b8b05117f3527c').innerText()).includes('/ˈæb.strækt/'), 'abstract_old_adjective_reading_survives');
  check(await count() === 0, 'lookup_has_no_front_auto_speech');
  await open(3993, 'lookup');
  check(await scope('sense:record:06ebc585fa725045').count() === 0, 'record_adjective_does_not_get_noun_or_verb_ipa');
  check((await scope('sense:record:858ba19a9e4053b0').innerText()).includes('/ˈrɛkɚd/') && !(await scope('sense:record:858ba19a9e4053b0').innerText()).includes('/rɪˈkɔrd/'), 'record_noun_does_not_get_verb_ipa');
  check((await scope('sense:record:d6d74ba3bd5b5865').innerText()).includes('/rɪˈkɔrd/'), 'record_verb_has_its_bound_ipa');
  await shot('record-scopes');
  await open(340, 'lookup');
  check((await scope('sense:august:abd4aaa95974529f').innerText()).includes('August') && (await scope('sense:august:a4a009c595995813').innerText()).includes('august'), 'august_capitalized_month_and_lowercase_adjective_remain_distinct');
  await open(4209, 'lookup');
  check(await scope('sense:row:2250c8db5d4355be').count() === 0 && await scope('sense:row:17262aa0f0b9a602').count() === 0, 'row_argument_senses_do_not_get_line_reading');
  check((await scope('sense:row:95b218aabf4c5b9f').innerText()).includes('地区未注明'), 'row_rowing_reading_keeps_unknown_region');
  await open(4960, 'lookup');
  const the = await scope('sense:the:67b3b450482950aa').innerText();
  check(['weak form before consonants', 'strong form', 'weak form before vowels'].every(condition => the.includes(condition)), 'the_strong_and_both_weak_conditions_survive');
  await shot('the-conditions');
  await open(5809, 'lookup');
  check((await scope('sense:faultless:36666882978b5d47').innerText()).includes('未确认标准或首选读法'), 'faultless_derived_unknown_not_presented_as_preferred');
  await shot('faultless-derived');
  await open(807, 'lookup');
  check((await scope('sense:cigaret:7e838fad9a045355').innerText()).includes('cigarette 的同词拼写变体读音'), 'cigaret_donor_binding_visible_after_reveal');
  check(await page.evaluate(() => localStorage.getItem('kianos-vocabulary-last-ordinal')) === lookupCursor, 'lookup_does_not_move_coverage_cursor');
  await open(5569);
  check(await visibleIpa() === '音标暂缺' && await page.locator('[data-vocab-front] [data-vocab-ipa-locale="unknown"]').count() === 0, 'blank_word_falls_back_without_invented_ipa');
  const blankWords = allFinal.filter(word => !word.pronunciation_support).map(word => word.word_id);
  check(blankWords.length === 21, 'all_21_current_blank_words_remain_uninvented');
  check(await page.evaluate(key => !JSON.parse(localStorage.getItem(key) || '{}').events?.length, LEXICAL_LEDGER_STORAGE_KEY), 'pronunciation_and_lookup_create_no_repair_evidence');
  check(await page.evaluate(() => !JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1') || '{}').history?.length), 'pronunciation_and_lookup_create_no_ratings');
  await page.locator('[data-vocab-reveal]').click();
  await page.locator('[data-vocab-route="known"]').click();
  await page.locator('[data-vocab-ordinal="5570"][data-vocab-initialized="true"][data-vocab-evidence-initialized="true"]').waitFor();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  check(await count() === 2, 'rating_swap_auto_speaks_next_front_once');
  check(await visibleIpa() === pronunciationFrontText(final(5570).pronunciation_support, 'en-US'), 'rating_swap_renders_next_final_ipa');
  check(errors.length === 0, 'no_browser_errors');
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ base, checks, blankWords, mockedSpeech: 'call count and locale only; no source-audio or performance claim', serverLog }, null, 2));
  console.log(`IPA_BROWSER_PASS ${checks.length} ${out}`);
} catch (error) {
  if (page) {
    await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
    const state = await page.evaluate(() => ({ text: document.body.innerText, writer: document.documentElement.dataset, roots: [...document.querySelectorAll('[data-local-port="vocabulary"]')].map(root => root.dataset) })).catch(() => null);
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ error: error.message, state, serverLog }, null, 2));
  }
  throw error;
} finally {
  if (browser) await browser.close();
  if (server && server.exitCode === null) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
}
