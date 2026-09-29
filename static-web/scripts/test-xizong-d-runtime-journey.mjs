import { chromium } from 'playwright';

const BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4335';
const SYSTEM = '/xizong/neuro-sensory-motor-orthopedics';
const checks = [];
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_D_RUNTIME_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push(name);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(12000);

async function waitWriter() {
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active'
    && document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell')
  );
  await page.waitForTimeout(180);
}
async function reset(slug) {
  await page.goto(`${BASE}${SYSTEM}/${slug}/`, { waitUntil: 'domcontentloaded' });
  await waitWriter();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitWriter();
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
  await page.waitForTimeout(170);
}
const enter = () => click('[data-stage-next="logic_group"]:visible');
async function rateCurrent() {
  const card = page.locator('[data-kp-recall-card]:visible').first();
  const reveal = card.locator('[data-kp-reveal]:visible');
  if (await reveal.count()) await reveal.evaluate((node) => node.click());
  await card.locator('[data-rating="known"]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(170);
}
try {
  await reset('n01');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'WHOLE_BLOCK_SOURCE', 'n1_mode');
  await enter();
  check(await stage() === 'source_contact', 'n1_source');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall', 'n1_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 14, 'n1_14_formed');
  check((state.sourceContactEvidence || []).length === 1, 'n1_one_source_evidence');

  await reset('n04');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'NATURAL_SOURCE_UNITS', 'n4_mode');
  await enter();
  check(await stage() === 'source_contact', 'n4_source1');
  check((await page.locator('[data-source-unit-counter]').textContent()).includes('1/2'), 'n4_1of2');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('N4-SU1'), 'n4_su1');
  check((await page.locator('[data-study-active-kp] .xv6KpLearnNav em').textContent()) === '1/10', 'n4_su1_companion_scope');
  check((await page.locator('[data-source-contact-done]').textContent()).includes('Source unit'), 'n4_source_unit_action_copy');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall', 'n4_su1_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 10, 'n4_su1_10');
  check((state.sourceContactEvidence || []).length === 1, 'n4_su1_evidence');
  check(state.sourceContactDone === false, 'n4_not_done_after_su1');

  for (let groupIndex = 0; groupIndex < 3; groupIndex += 1) {
    while (true) {
      state = await study();
      const currentStage = await stage();
      if (currentStage !== 'kp_recall' || Number(state.groupIndex) !== groupIndex) break;
      await rateCurrent();
    }
    state = await study();
    const currentStage = await stage();
    if (groupIndex < 2) {
      check(currentStage === 'kp_recall' && Number(state.groupIndex) === groupIndex + 1, `n4_no_source_bounce_lg${groupIndex + 1}`);
    } else {
      check(currentStage === 'source_contact', 'n4_true_boundary_after_lg3', `${currentStage}/${state.groupIndex}`);
      check((await page.locator('[data-source-unit-counter]').textContent()).includes('2/2'), 'n4_2of2');
      check((await page.locator('[data-natural-source-status]').textContent()).includes('N4-SU2'), 'n4_su2');
      check((await page.locator('[data-study-active-kp] .xv6KpLearnNav em').textContent()) === '1/6', 'n4_su2_companion_scope');
    }
  }
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall', 'n4_su2_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 16, 'n4_16_formed');
  check((state.sourceContactEvidence || []).length === 2, 'n4_two_evidence');
  check(state.sourceContactDone === true, 'n4_source_complete');

  await reset('n11');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'INTEGRATION_PRIMARY', 'n11_mode');
  check(await page.locator('[data-study-stage="source_contact"]').count() === 0, 'n11_no_source_surface');
  await enter();
  check(await stage() === 'block_learn', 'n11_hard_readiness_blocks');
  check((await page.locator('[data-study-local-status]').textContent()).includes('N1 / N5 / N8'), 'n11_readiness_copy');
  await page.evaluate(() => {
    for (const id of ['neuro-n01', 'neuro-n05', 'neuro-n08']) {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`, JSON.stringify({ completed: true, sourceRevisionPending: false }));
    }
  });
  await enter();
  state = await study();
  check(await stage() === 'kp_recall', 'n11_direct_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 12, 'n11_12_ready');
  check((state.sourceContactEvidence || []).some((row) => row.coverage_kind === 'INTEGRATION_PRIMARY_NO_NEW_CONTINUOUS_SOURCE'), 'n11_integration_evidence');
  await reset('o03');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-source-contact-mode') === 'NATURAL_SOURCE_UNITS', 'o3_mode');
  await enter();
  check(await stage() === 'block_learn', 'o3_hard_readiness_blocks');
  check((await page.locator('[data-study-local-status]').textContent()).includes('N11'), 'o3_readiness_copy');
  await page.evaluate(() => localStorage.setItem(
    'kianos-xizong-astro-v2:xizong:neuro-n11',
    JSON.stringify({ completed: true, sourceRevisionPending: false })
  ));
  await enter();
  check(await stage() === 'source_contact', 'o3_source1');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('O3-SU1'), 'o3_su1');
  await click('[data-source-contact-done]:visible');
  state = await study();
  check(await stage() === 'kp_recall', 'o3_su1_recall');
  check(Object.values(state.learned || {}).filter(Boolean).length === 9, 'o3_su1_9');
  check(state.sourceContactDone === false, 'o3_not_done_after_su1');
  while (true) {
    state = await study();
    if (await stage() !== 'kp_recall' || Number(state.groupIndex) !== 0) break;
    await rateCurrent();
  }
  state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 1, 'o3_enters_visual_lg02');
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 0, 'o3_answer_visual_hidden_on_recall_front');
  const o3VisualCard = page.locator('[data-kp-recall-card]:visible').first();
  await o3VisualCard.locator('[data-kp-reveal]:visible').evaluate((node) => node.click());
  await page.waitForTimeout(140);
  check(await page.locator('[data-learner-asset="visual"]:visible').count() === 1, 'o3_visual_released_after_reveal');
  check(await page.locator('[data-learner-asset="visual"]:visible').getAttribute('data-learner-asset-id') === 'd-o03-lg02-visual', 'o3_visual_identity');
  const chrome = await page.evaluate(() => ({
    header: document.querySelector('.portedStudyHeader')?.getBoundingClientRect().height || 0,
    overflow: document.documentElement.scrollWidth > innerWidth + 2,
    writer: document.documentElement.dataset.learnerWriter,
    chat: [...document.querySelectorAll('button,a,span')].some((node) =>
      node.offsetWidth && node.offsetHeight && (node.textContent || '').trim() === 'Chat'
    )
  }));
  check(chrome.writer === 'active', 'writer_active');
  check(chrome.header > 0 && chrome.header <= 86, 'compact_header', String(chrome.header));
  check(!chrome.overflow, 'no_horizontal_overflow');
  check(!chrome.chat, 'no_chat');

  console.log(`XIZONG_D_RUNTIME_JOURNEY_PASS | checks=${checks.length}`);
} finally {
  await browser.close();
}
