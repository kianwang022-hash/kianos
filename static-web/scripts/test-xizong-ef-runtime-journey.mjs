import { chromium } from 'playwright';

const BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4335';
const checks = [];
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_EF_RUNTIME_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push(name);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(12000);

async function waitWriter() {
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active'
    && document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell')
  );
}

async function reset(system, slug) {
  const url = `${BASE}/xizong/${system}/${slug}/`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitWriter();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitWriter();
  await page.waitForTimeout(120);
}

const stage = () => page.evaluate(() =>
  [...document.querySelectorAll('[data-study-stage]')].find((node) => !node.hidden)?.dataset.studyStage || ''
);
const study = () => page.evaluate(() => {
  const root = document.querySelector('[data-xizong-v6-block]');
  return JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${root.dataset.studyObject}`) || '{}');
});
async function click(selector) {
  await page.locator(selector).evaluate((node) => node.click());
  await page.waitForTimeout(160);
}
const enter = () => click('[data-stage-next="logic_group"]:visible');
async function rateCurrent() {
  const card = page.locator('[data-kp-recall-card]:visible').first();
  const reveal = card.locator('[data-kp-reveal]:visible');
  if (await reveal.count()) await reveal.evaluate((node) => node.click());
  await card.locator('[data-rating="known"]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(160);
}

async function eWholeAndSr1() {
  await reset('reproductive-breast', 'sr02');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'WHOLE_BLOCK_SOURCE', 'e_sr2_mode');
  await enter();
  check(await stage() === 'source_contact', 'e_sr2_source');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall', 'e_sr2_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length > 0, 'e_sr2_formed');
  check(state.sourceContactDone === true, 'e_sr2_source_done');

  await reset('reproductive-breast', 'sr01');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'NATURAL_SOURCE_UNITS', 'e_sr1_mode');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('SR1-SU1'), 'e_sr1_su1');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'source_contact', 'e_sr1_su1_no_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 0, 'e_sr1_su1_no_kp_release');
  check((state.sourceContactEvidence || []).length === 1, 'e_sr1_su1_evidence');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('SR1-SU2'), 'e_sr1_advances_su2');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall', 'e_sr1_su2_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 10, 'e_sr1_all10');
  check(state.sourceContactDone === true, 'e_sr1_source_complete');
}

async function e12AndE10() {
  await reset('reproductive-breast', 'e12');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('E12-SU1'), 'e12_su1');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e12_lg03_first');
  check(Object.values(state.learned || {}).filter(Boolean).length === 10, 'e12_su1_10');
  for (const groupIndex of [2, 3]) {
    while (true) {
      state = await study();
      if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== groupIndex) break;
      await rateCurrent();
    }
    state = await study();
    if (groupIndex === 2) check(await stage() === 'kp_recall' && Number(state.groupIndex) === 3, 'e12_no_bounce_lg03');
    else {
      check(await stage() === 'source_contact', 'e12_true_boundary_after_lg04');
      check((await page.locator('[data-natural-source-status]').textContent()).includes('E12-SU2'), 'e12_su2');
    }
  }
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 0, 'e12_returns_lg01');
  check(Object.values(state.learned || {}).filter(Boolean).length === 19, 'e12_all19');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'e12_visual_hidden_front');
  const card = page.locator('[data-kp-recall-card]:visible').first();
  await card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(140);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'e12_visual_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible').getAttribute('data-learner-asset-id') === 'e-e12-lg01-visual', 'e12_visual_identity');

  await reset('reproductive-breast', 'e10');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('E10-SU1'), 'e10_su1');
  await click('[data-source-contact-done]:visible');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 0) break;
    await rateCurrent();
  }
  check(await stage() === 'source_contact', 'e10_boundary_su2');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'e10_lg02');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 1) break;
    await rateCurrent();
  }
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e10_lg03');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'e10_visual_hidden_front');
  const e10Card = page.locator('[data-kp-recall-card]:visible').first();
  await e10Card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'e10_visual_support_after_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible img').count() === 0, 'e10_no_fake_visual_placeholder');
  await e10Card.locator('[data-rating="known"]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(160);
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 2) break;
    const active = page.locator('[data-kp-recall-card]:visible').first();
    if (await active.getAttribute('data-rating-committed') === 'true') break;
    await rateCurrent();
  }
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e10_visual_gap_blocks_block_recall');
  check((await page.locator('[data-study-local-status]').textContent()).includes('原图门禁未闭合'), 'e10_visual_gap_status');
  check(await page.locator('[data-study-stage="block_recall"]:visible').count() === 0, 'e10_block_recall_not_released');
}

async function fWholeAndNatural() {
  await reset('remaining-clinical', 'f03');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'WHOLE_BLOCK_SOURCE', 'f3_mode');
  await enter();
  check(await stage() === 'source_contact', 'f3_source');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall', 'f3_recall');
  check(state.sourceContactDone === true, 'f3_source_done');
  check(Object.values(state.learned || {}).filter(Boolean).length > 0, 'f3_formed');

  await reset('remaining-clinical', 'f01');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'NATURAL_SOURCE_UNITS', 'f1_mode');
  await enter();
  check((await page.locator('[data-source-unit-counter]').textContent()).includes('1/3'), 'f1_1of3');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F1-SU1'), 'f1_su1');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 0, 'f1_lg01');
  check(Object.values(state.learned || {}).filter(Boolean).length === 6, 'f1_su1_6');
  check(state.sourceContactDone === false, 'f1_not_done');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 0) break;
    await rateCurrent();
  }
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f1_no_bounce_lg02');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'f1_visual_hidden_front');
  const card = page.locator('[data-kp-recall-card]:visible').first();
  await card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'f1_visual_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible').getAttribute('data-learner-asset-id') === 'f-f1-lg02-visual', 'f1_visual_identity');
  check(await page.locator('[data-learner-asset="visual"]:visible img').count() === 1, 'f1_real_visual_asset');
  await card.locator('[data-rating="known"]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(200);
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 1) break;
    await rateCurrent();
  }
  check(await stage() === 'source_contact', 'f1_true_boundary_after_lg02');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F1-SU2'), 'f1_su2');
}

async function f4AndF9() {
  await reset('remaining-clinical', 'f04');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F4-SU1'), 'f4_su1');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 0) break;
    await rateCurrent();
  }
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f4_lg02');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'f4_visual_hidden_front');
  const card = page.locator('[data-kp-recall-card]:visible').first();
  await card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'f4_visual_support_after_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible img').count() === 0, 'f4_no_fake_image');
  check((await page.locator('[data-learner-asset="visual"]:visible').textContent()).includes('PDF P247–P249'), 'f4_locator_preserved');

  await reset('remaining-clinical', 'f09');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'INTEGRATION_PRIMARY', 'f9_mode');
  check(await page.locator('[data-study-stage="source_contact"]').count() === 1, 'f9_targeted_source_surface_exists');
  await enter();
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 0, 'f9_lg01_direct_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 5, 'f9_only_lg01_direct_ready');
  check(state.sourceContactDone === false, 'f9_not_source_complete_after_direct_release');
  check((state.sourceContactEvidence || []).some((row) => row.coverage_kind === 'INTEGRATION_PRIMARY_DIRECT_RELEASE'), 'f9_direct_integration_evidence');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 0) break;
    await rateCurrent();
  }
  check(await stage() === 'source_contact', 'f9_su1_required_after_lg01');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F9-SU1'), 'f9_su1_identity');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('complete laparoscopy complication list'), 'f9_su1_source_debt_visible');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f9_lg02_after_su1');
  check(Object.values(state.learned || {}).filter(Boolean).length === 6, 'f9_su1_releases_only_lg02');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 1) break;
    await rateCurrent();
  }
  check(await stage() === 'source_contact', 'f9_su2_required_after_lg02');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F9-SU2'), 'f9_su2_identity');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'f9_lg03_after_su2');
  check(Object.values(state.learned || {}).filter(Boolean).length === 13, 'f9_all13_only_after_targeted_returns');
  check(state.sourceContactDone === true, 'f9_source_complete_after_targeted_returns');
  check((state.sourceContactEvidence || []).filter((row) => row.coverage_kind === 'INTEGRATION_TARGETED_SOURCE_RETURN').length === 2, 'f9_two_targeted_source_evidence');
}

try {
  await eWholeAndSr1();
  await e12AndE10();
  await fWholeAndNatural();
  await f4AndF9();
  const chrome = await page.evaluate(() => ({
    writer: document.documentElement.dataset.learnerWriter,
    header: document.querySelector('.portedStudyHeader')?.getBoundingClientRect().height || 0,
    overflow: document.documentElement.scrollWidth > innerWidth + 2,
    chat: [...document.querySelectorAll('button,a,span')].some((node) =>
      node.offsetWidth && node.offsetHeight && (node.textContent || '').trim() === 'Chat'
    )
  }));
  check(chrome.writer === 'active', 'writer_active');
  check(chrome.header > 0 && chrome.header <= 86, 'compact_header');
  check(!chrome.overflow, 'no_overflow');
  check(!chrome.chat, 'no_chat');
  console.log(`XIZONG_EF_RUNTIME_JOURNEY_PASS | checks=${checks.length}`);
} finally {
  await browser.close();
}
