import { chromium } from 'playwright';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';

const BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4403';
const checks = [];
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_CBA_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push(name);
};

const systems = [
  ['A1','circulation','b01'],
  ['A2','respiratory','r01'],
  ['A3','urinary','b01'],
  ['B','digestive-metabolic-endocrine-tumor','d01'],
  ['C','hematology-immunity-infection','h01'],
  ['D','neuro-sensory-motor-orthopedics','n01'],
  ['E','reproductive-breast','sr01'],
  ['F','remaining-clinical','f01']
].map(([canonical, systemId, slug]) => ({ canonical, systemId, slug }));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.setDefaultNavigationTimeout(15000);
async function waitWriter() {
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active'
    && document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell')
  );
  await page.waitForTimeout(100);
}

async function go(route) {
  const url = `${BASE}${route}`;
  let error = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await waitWriter();
      return;
    } catch (caught) {
      error = caught;
      if (!/ERR_ABORTED|interrupted by another navigation|frame was detached|navigation/i.test(String(caught?.message || caught))) throw caught;
      await page.waitForTimeout(100);
    }
  }
  throw error;
}

const stage = () => page.evaluate(() =>
  [...document.querySelectorAll('[data-study-stage]')].find((node) => !node.hidden)?.dataset.studyStage || ''
);
const state = () => page.evaluate(() => {
  const root = document.querySelector('[data-xizong-v6-block]');
  return JSON.parse(localStorage.getItem(`kianos-xizong-astro-v2:${root?.dataset.studyObject || ''}`) || '{}');
});
async function press(selector) {
  await page.locator(selector).evaluate((node) => node.click());
  await page.waitForTimeout(170);
}
async function rate(value = 'known') {
  const card = page.locator('[data-kp-recall-card]:visible').first();
  const reveal = card.locator('[data-kp-reveal]:visible');
  if (await reveal.count()) await reveal.evaluate((node) => node.click());
  await card.locator(`[data-rating="${value}"]:visible`).evaluate((node) => node.click());
  await page.waitForTimeout(180);
}
async function meta() {
  return page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    return {
      objectId: root?.dataset.studyObject || '',
      systemId: root?.dataset.studySystemId || '',
      sourceHash: root?.dataset.studySourceHash || '',
      sourceMode: root?.dataset.sourceContactMode || '',
      header: document.querySelector('.portedStudyHeader')?.getBoundingClientRect().height || 0,
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      text: document.body.innerText || ''
    };
  });
}async function httpOk(route, name) {
  const response = await fetch(`${BASE}${route}`);
  check(response.ok, name, String(response.status));
}

try {
  console.log('CBA_STEP 8-system shared product');
  await go('/xizong/circulation/b01/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  const objectIds = new Set();

  for (const row of systems) {
    await httpOk(`/xizong/${row.systemId}/`, `${row.canonical}_system_200`);
    await httpOk(`/xizong/${row.systemId}/recall/`, `${row.canonical}_recall_200`);
    await httpOk(`/xizong/practice/${row.systemId}/`, `${row.canonical}_practice_200`);
    await go(`/xizong/${row.systemId}/${row.slug}/`);
    const current = await meta();
    const expected = buildXizongProductionBlock(loadXizongBlock(row.systemId, row.slug)).sourceContact.mode;
    check(current.systemId === row.systemId, `${row.canonical}_identity`);
    check(current.sourceMode === expected, `${row.canonical}_source_mode`, `${current.sourceMode}/${expected}`);
    check(Boolean(current.sourceHash), `${row.canonical}_source_hash`);
    check(current.header > 0 && current.header <= 86, `${row.canonical}_compact_header`, String(current.header));
    check(!current.overflow, `${row.canonical}_no_overflow`);    check(Boolean(current.objectId) && !objectIds.has(current.objectId), `${row.canonical}_unique_state_owner`, current.objectId);
    objectIds.add(current.objectId);
    const leak = /CURRENT_XIZONG|XIZONG_[A-Z_]+_(?:FAIL|INVALID|MISSING)|private:\/\/|sha256:|工程状态|开发状态/.test(current.text);
    check(!leak, `${row.canonical}_no_engineering_leak`);
    const chat = await page.locator('button,a,span').evaluateAll((nodes) =>
      nodes.some((node) => node.getClientRects().length && (node.textContent || '').trim() === 'Chat'));
    check(!chat, `${row.canonical}_no_chat`);
  }
  check(objectIds.size === 8, 'all_eight_systems_unique');

  console.log('CBA_STEP E↔F realistic resume isolation');
  await go('/xizong/reproductive-breast/e12/');
  await press('[data-stage-next="logic_group"]:visible');
  await press('[data-source-contact-done]:visible');
  let eState = await state();
  check(await stage() === 'kp_recall' && Number(eState.groupIndex) === 2, 'e12_resume_entry');
  await rate('known');
  await rate('fuzzy');
  eState = await state();
  const eMeta = await meta();
  const eKey = `kianos-xizong-astro-v2:${eMeta.objectId}`;
  const eSnapshot = await page.evaluate((key) => localStorage.getItem(key), eKey);
  const eResume = { group: eState.groupIndex, kp: eState.kpIndex, ratings: Object.keys(eState.ratings || {}).length };
  check(eResume.ratings === 2, 'e12_two_ratings_before_switch');  await go('/xizong/remaining-clinical/f01/');
  await press('[data-stage-next="logic_group"]:visible');
  await press('[data-source-contact-done]:visible');
  await rate('unknown');
  const fState = await state();
  const fMeta = await meta();
  const fKey = `kianos-xizong-astro-v2:${fMeta.objectId}`;
  check(Object.keys(fState.ratings || {}).length === 1, 'f1_weak_state_written');
  check(await page.evaluate((key) => localStorage.getItem(key), eKey) === eSnapshot, 'f_does_not_mutate_e');

  await go('/xizong/reproductive-breast/e12/');
  eState = await state();
  check(await stage() === 'kp_recall', 'e12_resume_stage');
  check(Number(eState.groupIndex) === Number(eResume.group), 'e12_resume_group');
  check(Number(eState.kpIndex) === Number(eResume.kp), 'e12_resume_kp');
  check(Object.keys(eState.ratings || {}).length === 2, 'e12_resume_ratings');
  check(Boolean(await page.evaluate((key) => localStorage.getItem(key), fKey)), 'f_state_survives_e_resume');

  console.log('CBA_STEP D prerequisite legality');
  await go('/xizong/neuro-sensory-motor-orthopedics/n11/');
  await page.evaluate(() => {
    for (const id of ['neuro-n01','neuro-n05','neuro-n08','neuro-n11']) {
      localStorage.removeItem(`kianos-xizong-astro-v2:xizong:${id}`);
    }
  });  await go('/xizong/neuro-sensory-motor-orthopedics/n11/');
  await press('[data-stage-next="logic_group"]:visible');
  check(await stage() === 'block_learn', 'd_n11_blocked_without_prereqs');
  check((await page.locator('[data-study-local-status]').textContent()).includes('N1 / N5 / N8'), 'd_n11_prereq_copy');
  await page.evaluate(() => {
    for (const id of ['neuro-n01','neuro-n05','neuro-n08']) {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${id}`, JSON.stringify({ completed: true, sourceRevisionPending: false }));
    }
  });
  await press('[data-stage-next="logic_group"]:visible');
  const dState = await state();
  check(await stage() === 'kp_recall', 'd_n11_released');
  check(Object.values(dState.learned || {}).filter(Boolean).length === 12, 'd_n11_12_ready');

  console.log('CBA_STEP F8 legacy visual false-complete rollback');
  await go('/xizong/remaining-clinical/f08/');
  const f8 = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const learner = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    const kpIds = (learner.kps || []).map((kp) => kp.identity.kpId);
    const hash = root?.dataset.studySourceHash || '';
    const evidence = (learner.sourceContact?.segments || []).map((segment) => ({
      segment_id: segment.segmentId,
      coverage_kind: 'NATURAL_SOURCE_UNIT',      kp_ids: (segment.kpOrdinals || []).map((ordinal) => kpIds[Number(ordinal)-1]).filter(Boolean),
      source_hash: hash,
      completed_at: new Date().toISOString()
    }));
    return { objectId: root?.dataset.studyObject || '', kpIds, hash, evidence };
  });
  check(f8.kpIds.length === 17 && f8.evidence.length === 2, 'f8_fixture');
  await page.evaluate((fixture) => {
    localStorage.setItem(`kianos-xizong-astro-v2:${fixture.objectId}`, JSON.stringify({
      schema: 'kianos.xizong.block-state.v2',
      stage: 'block_recall', groupIndex: 4, kpIndex: 16, sourceSegmentIndex: 1,
      learned: Object.fromEntries(fixture.kpIds.map((id) => [id,true])),
      ratings: Object.fromEntries(fixture.kpIds.map((id) => [id,'known'])),
      sourceContactDone: true, sourceContactEvidence: fixture.evidence, sourceHash: fixture.hash,
      blockRecallDone: true, completed: true
    }));
  }, f8);
  await go('/xizong/remaining-clinical/f08/');
  let f8State = await state();
  check(f8State.blockRecallDone === false && f8State.completed === false, 'f8_false_completion_revoked');
  check(await stage() === 'source_contact', 'f8_back_to_visual_source_review');
  check(Number(f8State.sourceSegmentIndex) === 0, 'f8_visual_review_starts_su1');
  check(Object.keys(f8State.ratings || {}).length === 17, 'f8_recall_kept');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F8-SU1'), 'f8_su1_reopened');
  await press('[data-source-contact-done]:visible');
  f8State = await state();
  check(await stage() === 'source_contact' && Number(f8State.sourceSegmentIndex) === 1, 'f8_visual_review_advances_su2');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('F8-SU2'), 'f8_su2_reopened');
  await press('[data-source-contact-done]:visible');
  f8State = await state();
  check(await stage() === 'block_recall', 'f8_block_recall_released_after_visual_review');
  check(f8State.blockRecallDone === false && f8State.completed === false, 'f8_completion_still_requires_block_recall');
  check(Object.keys(f8State.ratings || {}).length === 17, 'f8_recall_still_preserved_after_visual_review');
  check(await page.locator('[data-block-complete]').isDisabled(), 'f8_complete_disabled_until_block_recall');
  console.log('CBA_STEP C Source-revision rollback');
  await go('/xizong/hematology-immunity-infection/h01/');
  const c = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const learner = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    return {
      objectId: root?.dataset.studyObject || '',
      hash: root?.dataset.studySourceHash || '',
      kpIds: (learner.kps || []).map((kp) => kp.identity.kpId)
    };
  });
  check(c.kpIds.length === 13 && Boolean(c.hash), 'c_revision_fixture');  await page.evaluate((fixture) => {
    const oldHash = 'older-source-revision';
    localStorage.setItem(`kianos-xizong-astro-v2:${fixture.objectId}`, JSON.stringify({
      schema: 'kianos.xizong.block-state.v2',
      stage: 'block_recall',
      groupIndex: 0,
      kpIndex: 0,
      learned: Object.fromEntries(fixture.kpIds.map((id) => [id, true])),
      ratings: Object.fromEntries(fixture.kpIds.map((id) => [id, 'known'])),
      sourceContactDone: true,
      sourceContactEvidence: [{
        segment_id: 'legacy',
        coverage_kind: 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
        kp_ids: fixture.kpIds,
        source_hash: oldHash
      }],
      sourceHash: oldHash,
      blockRecallDone: true,
      completed: true
    }));
  }, c);  await go('/xizong/hematology-immunity-infection/h01/');
  const cState = await state();
  check(cState.sourceRevisionPending === true, 'c_revision_pending');
  check(cState.sourceHash === c.hash, 'c_current_hash_rebound');
  check(cState.sourceContactDone === false, 'c_source_reconfirm_required');
  check((cState.sourceContactEvidence || []).length === 0, 'c_old_source_evidence_cleared');
  check(cState.blockRecallDone === false && cState.completed === false, 'c_old_completion_revoked');
  check(await page.locator('[data-xizong-v6-block]').getAttribute('data-xizong-source-revision') === 'SOURCE_REVISION_REVALIDATION', 'c_revision_marker');
  check(await page.locator('[data-block-complete]').isDisabled(), 'c_complete_disabled');

  const keys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith('kianos-xizong-astro-v2:'))
  );
  check(keys.includes(eKey) && keys.includes(fKey), 'mixed_e_f_states_survive');
  check(new Set(keys).size === keys.length, 'study_keys_unique');

  console.log(`XIZONG_WHOLE_SUBJECT_CBA_PASS | checks=${checks.length} | systems=8`);
} finally {
  await browser.close();
}
