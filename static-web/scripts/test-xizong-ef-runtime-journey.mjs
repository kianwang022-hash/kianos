import { chromium } from 'playwright';

const BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4335';
const SCOPE = process.env.KIANOS_XIZONG_EF_SCOPE || 'both';
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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await waitWriter();
      break;
    } catch (error) {
      if (attempt === 2 || !/navigation|Execution context was destroyed/i.test(String(error?.message || error))) throw error;
      await page.waitForTimeout(160);
    }
  }
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); })
  ]);
  await waitWriter();
  await page.waitForFunction(() => {
    const marker = document.querySelector('[data-xizong-block-evidence-guard]');
    if (!(marker instanceof HTMLElement)) return false;
    const objectId = marker.dataset.objectId || '';
    const version = marker.dataset.evidenceVersion || '';
    if (!objectId || !version) return false;
    try {
      const meta = JSON.parse(localStorage.getItem(`kianos-xizong-evidence-meta-v1:${objectId}`) || 'null');
      return meta?.version === version;
    } catch { return false; }
  });
  await page.waitForTimeout(220);
  check(true, `reset_storage_${system}_${slug}`);
}

const stage = () => page.evaluate(() =>
  [...document.querySelectorAll('[data-study-stage]')].find((node) => !node.hidden)?.dataset.studyStage || ''
);
const study = () => page.evaluate(() => {
  const root = document.querySelector('[data-xizong-v6-block]');
  return JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${root.dataset.studyObject}`) || '{}');
});
async function click(selector) {
  const result = await page.evaluate((rawSelector) => {
    const selector = rawSelector.replace(/:visible/g, '');
    const node = [...document.querySelectorAll(selector)]
      .find((candidate) => candidate instanceof HTMLElement && !candidate.hidden && candidate.getClientRects().length > 0);
    if (!(node instanceof HTMLElement)) return { ok: false, selector };
    node.click();
    return { ok: true, selector };
  }, selector);
  check(result.ok === true, `click_${result.selector.replace(/[^a-zA-Z0-9_-]+/g, '_')}`);
  await page.waitForTimeout(160);
}
const enter = () => click('[data-stage-next="logic_group"]');
async function rateCurrent() {
  const result = await page.evaluate(() => {
    const card = [...document.querySelectorAll('[data-kp-recall-card]')]
      .find((node) => node instanceof HTMLElement && !node.hidden && node.getClientRects().length > 0);
    if (!(card instanceof HTMLElement)) return { ok: false, reason: 'NO_VISIBLE_RECALL_CARD' };
    const reveal = card.querySelector('[data-kp-reveal]');
    if (reveal instanceof HTMLButtonElement && !reveal.hidden) reveal.click();
    const rating = card.querySelector('[data-rating="known"]');
    if (!(rating instanceof HTMLButtonElement)) return { ok: false, reason: 'NO_KNOWN_RATING', kpId: card.dataset.kpId || '' };
    rating.click();
    return { ok: true, kpId: card.dataset.kpId || '' };
  });
  check(result.ok === true, `rate_current_${result.kpId || 'unknown'}`, result.reason || '');
  await page.waitForTimeout(140);
}

async function groupKpIds(groupIndex) {
  return page.evaluate((index) => {
    const payload = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    return payload.logicGroups?.[index]?.kpIds || [];
  }, groupIndex);
}

async function rateGroupFully(groupIndex, label, maxSteps = 80) {
  const ids = await groupKpIds(groupIndex);
  check(ids.length > 0, `${label}_kp_ids`);
  for (let step = 0; step < maxSteps; step += 1) {
    const before = await study();
    const pending = ids.filter((id) => !before.ratings?.[id]);
    if (!pending.length) return;
    const currentStage = await stage();
    if (currentStage !== 'kp_recall' || Number(before.groupIndex) !== groupIndex) {
      throw new Error(`XIZONG_EF_RUNTIME_FAIL:${label}:left-before-rated:${currentStage}/${before.groupIndex}`);
    }
    const beforeRatings = JSON.stringify(before.ratings || {});
    await rateCurrent();
    const after = await study();
    if (JSON.stringify(after.ratings || {}) === beforeRatings) {
      throw new Error(`XIZONG_EF_RUNTIME_FAIL:${label}:recall-stalled-step-${step}`);
    }
  }
  throw new Error(`XIZONG_EF_RUNTIME_FAIL:${label}:recall-loop-limit`);
}

async function rateGroupUntilExit(groupIndex, label, maxSteps = 80) {
  await rateGroupFully(groupIndex, label, maxSteps);
  for (let step = 0; step < 12; step += 1) {
    const current = await study();
    if (await stage() !== 'kp_recall' || Number(current.groupIndex) !== groupIndex) return;
    await page.waitForTimeout(80);
  }
  throw new Error(`XIZONG_EF_RUNTIME_FAIL:${label}:expected-exit-after-full-recall`);
}

async function eWholeAndSr1() {
  console.log('EF_STEP E whole+SR1');
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
  console.log('EF_STEP E12+E10');
  await reset('reproductive-breast', 'e12');
  console.log('EF_STEP E12 reset');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('E12-SU1'), 'e12_su1');
  await click('[data-source-contact-done]:visible');
  console.log('EF_STEP E12 SU1 done');
  let state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e12_lg03_first');
  check(Object.values(state.learned || {}).filter(Boolean).length === 10, 'e12_su1_10');
  for (const groupIndex of [2, 3]) {
    await rateGroupUntilExit(groupIndex, `e12_group_${groupIndex}`);
    state = await study();
    if (groupIndex === 2) check(await stage() === 'kp_recall' && Number(state.groupIndex) === 3, 'e12_no_bounce_lg03');
    else {
      check(await stage() === 'source_contact', 'e12_true_boundary_after_lg04');
      check((await page.locator('[data-natural-source-status]').textContent()).includes('E12-SU2'), 'e12_su2');
    }
  }
  await click('[data-source-contact-done]:visible');
  console.log('EF_STEP E12 SU2 done');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 0, 'e12_returns_lg01');
  check(Object.values(state.learned || {}).filter(Boolean).length === 19, 'e12_all19');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'e12_visual_hidden_front');
  const card = page.locator('[data-kp-recall-card]:visible').first();
  await card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(140);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'e12_visual_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible').getAttribute('data-learner-asset-id') === 'e-e12-lg01-visual', 'e12_visual_identity');

  console.log('EF_STEP E12 done');
  await reset('reproductive-breast', 'e10');
  console.log('EF_STEP E10 reset');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('E10-SU1'), 'e10_su1');
  await click('[data-source-contact-done]:visible');
  console.log('EF_STEP E10 SU1 done');
  await rateGroupUntilExit(0, 'e10_group_0');
  check(await stage() === 'source_contact', 'e10_boundary_su2');
  await click('[data-source-contact-done]:visible');
  console.log('EF_STEP E10 SU2 done');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'e10_lg02');
  await rateGroupUntilExit(1, 'e10_group_1');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e10_lg03');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'e10_visual_hidden_front');
  const e10Card = page.locator('[data-kp-recall-card]:visible').first();
  await e10Card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'e10_visual_support_after_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible img').count() === 0, 'e10_no_fake_visual_placeholder');
  await rateGroupFully(2, 'e10_visual_gap');
  await page.waitForTimeout(180);
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e10_visual_gap_blocks_block_recall');
  check((await page.locator('[data-study-local-status]').textContent()).includes('原图门禁未闭合'), 'e10_visual_gap_status');
  check(await page.locator('[data-study-stage="block_recall"]:visible').count() === 0, 'e10_block_recall_not_released');
}

async function fWholeAndNatural() {
  console.log('EF_STEP F whole+natural');
  await reset('remaining-clinical', 'f03');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'WHOLE_BLOCK_SOURCE', 'f3_mode');
  await enter();
  check(await stage() === 'source_contact', 'f3_source');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall', 'f3_recall');
  check(state.sourceContactDone === true, 'f3_source_done');
  check(Object.values(state.learned || {}).filter(Boolean).length > 0, 'f3_formed');
  check((state.sourceContactEvidence || []).some((row) => row.coverage_kind === 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION'), 'f3_whole_block_source_evidence');

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
  await rateGroupUntilExit(0, 'group_0');
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
  await rateGroupUntilExit(1, 'group_1');
  check(await stage() === 'source_contact', 'f1_true_boundary_after_lg02');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F1-SU2'), 'f1_su2');
}

async function fVisualExternalReview() {
  console.log('EF_STEP F external visual review');
  await reset('remaining-clinical', 'f07');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'WHOLE_BLOCK_SOURCE', 'f7_mode');
  await enter();
  check(await page.locator('[data-learner-asset="visual"]:visible').count() >= 1, 'f7_visual_task_visible_in_source');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check((state.sourceContactEvidence || []).some((row) => (row.visual_reviewed_lg_ids || []).includes('F7-LG01')), 'f7_visual_review_evidence');
  await rateGroupUntilExit(0, 'f7_group_0');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f7_visual_gate_released_after_source_review');

  await reset('remaining-clinical', 'f08');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'NATURAL_SOURCE_UNITS', 'f8_mode');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F8-SU1'), 'f8_su1');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() >= 1, 'f8_visual_task_visible_in_source');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check((state.sourceContactEvidence || []).some((row) => (row.visual_reviewed_lg_ids || []).includes('F8-LG01')), 'f8_su1_visual_review_evidence');
  await rateGroupUntilExit(0, 'f8_group_0');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f8_visual_gate_released_after_source_review');
}

async function f4AndF9() {
  console.log('EF_STEP F4+F9');
  await reset('remaining-clinical', 'f04');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F4-SU1'), 'f4_su1');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  await rateGroupUntilExit(0, 'group_0');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f4_lg02');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'f4_visual_hidden_front');
  const card = page.locator('[data-kp-recall-card]:visible').first();
  await card.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(120);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'f4_visual_support_after_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible img').count() === 0, 'f4_no_fake_image');
  check((await page.locator('[data-learner-asset="visual"]:visible').textContent()).includes('PDF P247–P249'), 'f4_locator_preserved');

  console.log('EF_STEP F8 visual-gap closure');
  await reset('remaining-clinical', 'f08');
  await enter();
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F8-SU1'), 'f8_su1');
  await click('[data-source-contact-done]:visible');
  for (const groupIndex of [0, 1, 2]) await rateGroupUntilExit(groupIndex, `f8_su1_group_${groupIndex}`);
  check(await stage() === 'source_contact', 'f8_su2_boundary');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F8-SU2'), 'f8_su2');
  await click('[data-source-contact-done]:visible');
  for (const groupIndex of [3, 4]) await rateGroupUntilExit(groupIndex, `f8_su2_group_${groupIndex}`);
  state = await study();
  check(await stage() === 'block_recall', 'f8_block_recall_released_after_real_visual_review');
  check(Object.values(state.ratings || {}).filter(Boolean).length === 17, 'f8_all17_recalled');
  const f8Reviewed = new Set((state.sourceContactEvidence || []).flatMap((row) => row.visual_reviewed_lg_ids || []));
  for (const groupId of ['F8-LG01', 'F8-LG04', 'F8-LG05']) {
    check(f8Reviewed.has(groupId), `f8_visual_review_evidence_${groupId}`);
  }
  check(await page.locator('[data-study-stage="block_recall"]:visible').count() === 1, 'f8_block_recall_visible');

  await reset('remaining-clinical', 'f09');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'INTEGRATION_PRIMARY', 'f9_mode');
  check(await page.locator('[data-study-stage="source_contact"]').count() === 1, 'f9_targeted_source_surface_exists');
  await enter();
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 0, 'f9_lg01_direct_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 5, 'f9_only_lg01_direct_ready');
  check(state.sourceContactDone === false, 'f9_not_source_complete_after_direct_release');
  check((state.sourceContactEvidence || []).some((row) => row.coverage_kind === 'INTEGRATION_PRIMARY_DIRECT_RELEASE'), 'f9_direct_integration_evidence');
  await rateGroupUntilExit(0, 'group_0');
  check(await stage() === 'source_contact', 'f9_su1_required_after_lg01');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F9-SU1'), 'f9_su1_identity');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('complete laparoscopy complication list'), 'f9_su1_source_debt_visible');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'f9_lg02_after_su1');
  check(Object.values(state.learned || {}).filter(Boolean).length === 6, 'f9_su1_releases_only_lg02');
  await rateGroupUntilExit(1, 'group_1');
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
  if (SCOPE === 'both' || SCOPE === 'E') {
    await eWholeAndSr1();
    await e12AndE10();
  }
  if (SCOPE === 'both' || SCOPE === 'F') {
    await fWholeAndNatural();
    await fVisualExternalReview();
    await f4AndF9();
  }
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
