import { chromium } from 'playwright';
import { listProjectableXizongSystems, loadXizongBlock } from '../src/lib/xizong.mjs';

const BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || 'http://127.0.0.1:4403';
const MEMORY_KEY = 'kianos-xizong-memory-v1';
const checks = [];
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_WHOLE_SUBJECT_FAIL:${name}${detail ? ':' + detail : ''}`);
  checks.push(name);
};

const systems = listProjectableXizongSystems().map((system) => ({
  systemId: system.systemId,
  canonicalId: system.canonicalId,
  blocks: (system.blocks || []).map((block) => ({
    blockId: block.blockId,
    slug: block.slug
  }))
}));
check(systems.length === 8, 'eight_systems', String(systems.length));
check(systems.reduce((sum, system) => sum + system.blocks.length, 0) === 159, 'all_159_blocks');
const completedStatesBySystem = Object.fromEntries(systems.map((system) => [
  system.systemId,
  Object.fromEntries(system.blocks.map((ref) => {
    const block = loadXizongBlock(system.systemId, ref.slug);
    return [block.blockId, {
      completed: true,
      blockRecallDone: true,
      learned: Object.fromEntries(block.kpRecords.map((kp) => [kp.kpId, true])),
      ratings: Object.fromEntries(block.kpRecords.map((kp) => [kp.kpId, 'known']))
    }];
  }))
]));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.setDefaultNavigationTimeout(15000);

const waitWriter = async () => page.waitForFunction(() =>
  document.hasFocus()
  && document.visibilityState === 'visible'
  && document.documentElement.dataset.learnerWriter === 'active'
);
async function gotoStable(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      return;
    } catch (error) {
      if (attempt === 2 || !/ERR_ABORTED|interrupted by another navigation|frame was detached|navigation/i.test(String(error?.message || error))) throw error;
      await page.waitForTimeout(120);
    }
  }
}
async function clearXizongStorage() {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
}
async function visitBlock(systemId, slug) {
  await gotoStable(`${BASE}/xizong/${systemId}/${slug}/`);
  await waitWriter();
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
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
async function rateCurrent(value = 'known') {
  const card = page.locator('[data-kp-recall-card]:visible').first();
  const reveal = card.locator('[data-kp-reveal]:visible');
  if (await reveal.count()) await reveal.evaluate((node) => node.click());
  await card.locator(`[data-rating="${value}"]:visible`).evaluate((node) => node.click());
  await page.waitForTimeout(180);
}
async function groupKpIds(index) {
  return page.evaluate((groupIndex) => {
    const payload = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    return payload.logicGroups?.[groupIndex]?.kpIds || [];
  }, index);
}
async function rateGroupFully(groupIndex, label, rating = 'known') {
  const ids = await groupKpIds(groupIndex);
  check(ids.length > 0, `${label}_has_kps`);
  for (let step = 0; step < 100; step += 1) {
    const state = await study();
    if (ids.every((id) => Boolean(state.ratings?.[id]))) return;
    check(await stage() === 'kp_recall' && Number(state.groupIndex) === groupIndex, `${label}_stays_in_group`, `${await stage()}/${state.groupIndex}`);
    const before = JSON.stringify(state.ratings || {});
    await rateCurrent(rating);
    const after = await study();
    check(JSON.stringify(after.ratings || {}) !== before, `${label}_rating_progress_${step}`);
  }
  throw new Error(`XIZONG_WHOLE_SUBJECT_FAIL:${label}:loop-limit`);
}

async function scenarioSharedShellAndIsolation() {
  console.log('WHOLE_STEP shared-shell+isolation');
  await gotoStable(`${BASE}/xizong/`);
  await clearXizongStorage();
  const studyKeys = [];
  for (const system of systems) {
    const first = system.blocks[0];
    await visitBlock(system.systemId, first.slug);
    const chrome = await page.evaluate(() => ({
      objectId: document.querySelector('[data-xizong-v6-block]')?.getAttribute('data-study-object') || '',
      header: document.querySelector('.portedStudyHeader')?.getBoundingClientRect().height || 0,
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      chat: [...document.querySelectorAll('button,a,span')].some((node) =>
        node.offsetWidth && node.offsetHeight && (node.textContent || '').trim() === 'Chat')
    }));
    check(Boolean(chrome.objectId), `${system.canonicalId}_study_object`);
    check(chrome.header > 0 && chrome.header <= 86, `${system.canonicalId}_compact_header`, String(chrome.header));
    check(!chrome.overflow, `${system.canonicalId}_no_overflow`);
    check(!chrome.chat, `${system.canonicalId}_no_chat`);
    const state = await study();
    check(Boolean(state.stage), `${system.canonicalId}_runtime_state_initialized`);
    studyKeys.push(`kianos-xizong-astro-v2:${chrome.objectId}`);
  }
  const storageResult = await page.evaluate((keys) => ({
    present: keys.filter((key) => localStorage.getItem(key) !== null),
    all: Object.keys(localStorage).filter((key) => key.startsWith('kianos-xizong-astro-v2:'))
  }), studyKeys);
  check(storageResult.present.length === 8, 'eight_first_block_states_coexist', String(storageResult.present.length));
  check(new Set(studyKeys).size === 8, 'first_block_state_keys_unique');
}

async function scenarioResume() {
  console.log('WHOLE_STEP resume');
  await visitBlock('reproductive-breast', 'e12');
  await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    localStorage.removeItem(`kianos-xizong-astro-v2:${root.dataset.studyObject}`);
  });
  await gotoStable(`${BASE}/xizong/reproductive-breast/e12/`);
  await waitWriter();
  await click('[data-stage-next="logic_group"]:visible');
  check((await page.locator('[data-natural-source-status]').textContent()).includes('E12-SU1'), 'resume_e12_su1');
  await click('[data-source-contact-done]:visible');
  let state = await study();
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'resume_e12_enters_lg03');
  await rateCurrent('fuzzy');
  state = await study();
  const before = { groupIndex: state.groupIndex, kpIndex: state.kpIndex, ratings: { ...(state.ratings || {}) } };
  const visibleBefore = await page.locator('[data-kp-recall-card]:visible').getAttribute('data-kp-id');
  await gotoStable(`${BASE}/xizong/reproductive-breast/e12/`);
  await waitWriter();
  state = await study();
  const visibleAfter = await page.locator('[data-kp-recall-card]:visible').getAttribute('data-kp-id');
  check(Number(state.groupIndex) === Number(before.groupIndex), 'resume_same_group');
  check(Number(state.kpIndex) === Number(before.kpIndex), 'resume_same_kp_index');
  check(visibleAfter === visibleBefore, 'resume_same_visible_kp', `${visibleBefore}/${visibleAfter}`);
  check(Object.keys(state.ratings || {}).length === Object.keys(before.ratings).length, 'resume_rating_preserved');
}

async function scenarioLegacyStateMigration() {
  console.log('WHOLE_STEP legacy-state-migration');
  await visitBlock('remaining-clinical', 'f09');
  const f9 = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const learner = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    return {
      objectId: root?.dataset.studyObject || '',
      sourceHash: root?.dataset.studySourceHash || document.querySelector('[data-xizong-memory-release-bridge]')?.getAttribute('data-source-hash') || '',
      kpIds: (learner.kps || []).map((kp) => kp.identity.kpId),
      directIds: learner.logicGroups?.[0]?.kpIds || []
    };
  });
  check(f9.kpIds.length === 13 && f9.directIds.length === 5, 'f9_legacy_fixture_identity');
  await page.evaluate((fixture) => {
    const learned = Object.fromEntries(fixture.kpIds.map((id) => [id, true]));
    const ratings = Object.fromEntries(fixture.kpIds.map((id) => [id, 'known']));
    localStorage.setItem(`kianos-xizong-astro-v2:${fixture.objectId}`, JSON.stringify({
      stage: 'block_complete', groupIndex: 3, kpIndex: fixture.kpIds.length - 1,
      learned, ratings, blockRecallDone: true, completed: true, sourceContactDone: true,
      sourceHash: fixture.sourceHash,
      sourceContactEvidence: [{
        segment_id: `integration-primary:${fixture.objectId}`,
        coverage_kind: 'INTEGRATION_PRIMARY_NO_NEW_CONTINUOUS_SOURCE',
        kp_ids: [...fixture.kpIds], source_hash: fixture.sourceHash, completed_at: new Date().toISOString()
      }]
    }));
  }, f9);
  await gotoStable(`${BASE}/xizong/remaining-clinical/f09/`);
  await waitWriter();
  let state = await study();
  check(Object.values(state.learned || {}).filter(Boolean).length === 5, 'f9_legacy_13of13_retracted_to_direct5');
  check(Object.keys(state.ratings || {}).length === 5, 'f9_legacy_extra_ratings_retracted');
  check(state.completed !== true && state.blockRecallDone !== true, 'f9_legacy_false_completion_cleared');
  check((state.sourceContactEvidence || []).some((row) => row.coverage_kind === 'INTEGRATION_PRIMARY_DIRECT_RELEASE'), 'f9_direct_release_rebuilt');

  await visitBlock('reproductive-breast', 'e10');
  const e10 = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const learner = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    const hash = root?.dataset.studySourceHash || document.querySelector('[data-xizong-memory-release-bridge]')?.getAttribute('data-source-hash') || '';
    return {
      objectId: root?.dataset.studyObject || '', sourceHash: hash,
      kpIds: (learner.kps || []).map((kp) => kp.identity.kpId),
      segments: learner.sourceContact?.segments || []
    };
  });
  await page.evaluate((fixture) => {
    const learned = Object.fromEntries(fixture.kpIds.map((id) => [id, true]));
    const ratings = Object.fromEntries(fixture.kpIds.map((id) => [id, 'known']));
    const evidence = fixture.segments.map((segment) => ({
      segment_id: segment.segmentId,
      coverage_kind: 'NATURAL_SOURCE_UNIT',
      kp_ids: segment.kpIds || segment.kpOrdinals || [],
      source_hash: fixture.sourceHash,
      completed_at: new Date().toISOString()
    }));
    localStorage.setItem(`kianos-xizong-astro-v2:${fixture.objectId}`, JSON.stringify({
      stage: 'block_recall', groupIndex: 2, kpIndex: fixture.kpIds.length - 1,
      learned, ratings, blockRecallDone: true, completed: true, sourceContactDone: true,
      sourceHash: fixture.sourceHash, sourceContactEvidence: evidence
    }));
  }, e10);
  await gotoStable(`${BASE}/xizong/reproductive-breast/e10/`);
  await waitWriter();
  state = await study();
  check(state.completed !== true && state.blockRecallDone !== true, 'e10_legacy_false_visual_completion_cleared');
  check(await stage() === 'kp_recall' && Number(state.groupIndex) === 2, 'e10_legacy_returns_visual_gap_lg03');
  check((await page.locator('[data-study-local-status]').textContent()).includes('原图门禁未闭合'), 'e10_legacy_visual_gap_visible');
}
async function scenarioSystemRecallPractice() {
  console.log('WHOLE_STEP system-recall+practice');
  const ctx = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(12000);
  const goto = async (url) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try { await p.goto(url, { waitUntil: 'domcontentloaded' }); return; }
      catch (error) {
        if (attempt === 2 || !/ERR_ABORTED|interrupted by another navigation|frame was detached|navigation/i.test(String(error?.message || error))) throw error;
        await p.waitForTimeout(120);
      }
    }
  };
  await goto(`${BASE}/xizong/circulation/`);
  await p.evaluate(() => { for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key); });
  await goto(`${BASE}/xizong/circulation/recall/`);
  check(await p.locator('[data-xizong-system-recall-lock]').isVisible(), 'system_recall_locked_before_completion');
  await goto(`${BASE}/xizong/practice/circulation/`);
  check(await p.locator('[data-question-card]').isHidden(), 'practice_locked_before_system_recall');
  await goto(`${BASE}/xizong/`);
  await p.evaluate((allStates) => {
    for (const rows of Object.values(allStates)) {
      for (const [blockId, state] of Object.entries(rows)) {
        localStorage.setItem(`kianos-xizong-astro-v2:xizong:${blockId}`, JSON.stringify(state));
      }
    }
  }, completedStatesBySystem);

  for (const system of systems) {
    console.log(`WHOLE_SYSTEM ${system.canonicalId}`);
    await goto(`${BASE}/xizong/${system.systemId}/`);
    const entry = p.locator('[data-xizong-system-recall-entry]');
    await entry.waitFor({ state: 'visible' });
    await goto(`${BASE}/xizong/${system.systemId}/recall/`);
    const recall = p.locator(`[data-xizong-system-exit="${system.systemId}"]`);
    await recall.waitFor({ state: 'visible' });
    check(await recall.locator('[data-recall-workspace]').isVisible(), `${system.canonicalId}_system_recall_workspace`);
    await recall.locator('[data-reveal-recall]').click();
    check(await recall.locator('[data-recall-reveal]').isVisible(), `${system.canonicalId}_recall_reveal`);
    await recall.locator('[data-complete-recall]').click();
    check(await recall.locator('[data-practice-handoff]').isVisible(), `${system.canonicalId}_practice_handoff`);
    await goto(`${BASE}/xizong/practice/${system.systemId}/`);
    const practice = p.locator(`[data-xizong-practice="${system.systemId}"]`);
    await practice.waitFor({ state: 'visible' });
    check(await practice.locator('[data-question-card]').isVisible(), `${system.canonicalId}_practice_question_visible`);
    check(await practice.locator('[data-question-map]').count() === 1, `${system.canonicalId}_practice_map_owned`);
  }
  const recallKeys = await p.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('kianos:xizong:system-recall:')));
  check(recallKeys.length === 8, 'eight_system_recall_states_isolated', String(recallKeys.length));
  await ctx.close();
}

async function scenarioMemoryRepairReturn() {
  console.log('WHOLE_STEP memory+repair+return');
  const ctx = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(12000);
  await p.goto(`${BASE}/xizong/remaining-clinical/f03/`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  await p.evaluate(() => { for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key); });
  await p.goto(`${BASE}/xizong/remaining-clinical/f03/`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  const fixture = await p.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const learner = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    const bridge = document.querySelector('[data-xizong-memory-release-bridge]');
    return {
      objectId: root?.dataset.studyObject || '',
      blockId: learner.identity?.blockId || '',
      sourceHash: bridge?.getAttribute('data-source-hash') || '',
      kpIds: (learner.kps || []).map((kp) => kp.identity.kpId),
      first: learner.kps?.[0] || null
    };
  });
  check(fixture.blockId === 'F3' && fixture.kpIds.length > 0, 'memory_f3_fixture');
  await p.evaluate(({ fixture, memoryKey }) => {
    const ratings = Object.fromEntries(fixture.kpIds.map((id, index) => [id, index === 0 ? 'unknown' : 'known']));
    const learned = Object.fromEntries(fixture.kpIds.map((id) => [id, true]));
    localStorage.setItem(`kianos-xizong-astro-v2:${fixture.objectId}`, JSON.stringify({
      stage: 'block_complete', groupIndex: 0, kpIndex: 0, learned, ratings,
      blockRecallDone: true, completed: false, sourceContactDone: true, sourceHash: fixture.sourceHash,
      sourceContactEvidence: [{
        segment_id: `block-cumulative:${fixture.objectId}`,
        coverage_kind: 'EXPLICIT_BLOCK_CUMULATIVE_CONFIRMATION',
        kp_ids: [...fixture.kpIds], source_hash: fixture.sourceHash, completed_at: new Date().toISOString()
      }]
    }));
    localStorage.removeItem(memoryKey);
  }, { fixture, memoryKey: MEMORY_KEY });
  await p.goto(`${BASE}/xizong/remaining-clinical/f03/`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');
  const complete = p.locator('[data-block-complete]');
  await complete.waitFor({ state: 'visible' });
  check(!(await complete.isDisabled()), 'memory_f3_complete_gate_ready');
  await complete.click();
  await p.waitForFunction((key) => Boolean(localStorage.getItem(key)), MEMORY_KEY);
  let memory = await p.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(Boolean(memory?.releasedBlocks?.[fixture.blockId]), 'memory_f3_released');
  check(memory?.attention?.[`core:${fixture.kpIds[0]}`]?.reviewRequested === true, 'memory_weak_recall_enters_today');

  await p.goto(`${BASE}/xizong/memory/`, { waitUntil: 'domcontentloaded' });
  check(Number((await p.locator('[data-memory-summary-today]').textContent())?.trim()) >= 1, 'memory_today_visible');
  await p.locator('[data-memory-view="CORE"]').click();
  await p.keyboard.press('Space');
  await p.locator('[data-memory-rating="mastered"]').click();
  await p.waitForFunction((key) => {
    const state = JSON.parse(localStorage.getItem(key) || 'null');
    return state?.attention && Object.values(state.attention).every((row) => row?.reviewRequested !== true);
  }, MEMORY_KEY);
  check((await p.locator('[data-memory-summary-today]').textContent())?.trim() === '0', 'memory_mastered_clears_today');

  memory = await p.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  memory.repairTasks = [{
    id: 'repair:whole-subject-f3',
    cardId: `core:${fixture.kpIds[0]}`,
    kpId: fixture.kpIds[0],
    title: fixture.first?.identity?.title || 'F3 repair',
    reason: '整科真实使用 audit：弱点回到原 Block / Practice',
    action: '回原 Block 重新跑当前 KP，再回 F Practice。',
    priority: 'high',
    origin: 'WHOLE_SUBJECT_AUDIT',
    blockHref: '/xizong/remaining-clinical/f03/',
    returnHref: '/xizong/practice/remaining-clinical/',
    status: 'ACTIVE'
  }];
  await p.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: MEMORY_KEY, value: memory });
  await p.goto(`${BASE}/xizong/memory/`, { waitUntil: 'domcontentloaded' });
  await p.locator('[data-memory-view="REPAIR"]').click();
  check((await p.locator('[data-repair-block-link]').getAttribute('href'))?.includes('/xizong/remaining-clinical/f03/'), 'repair_exact_block_return');
  check((await p.locator('[data-repair-return-link]').getAttribute('href'))?.includes('/xizong/practice/remaining-clinical/'), 'repair_exact_practice_return');
  await p.locator('[data-repair-complete]').click();
  memory = await p.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), MEMORY_KEY);
  check(memory.repairTasks?.[0]?.status === 'DONE', 'repair_completion_persisted');
  await ctx.close();
}

try {
  await scenarioSharedShellAndIsolation();
  await scenarioResume();
  await scenarioLegacyStateMigration();
  await scenarioSystemRecallPractice();
  await scenarioMemoryRepairReturn();
  console.log(`XIZONG_WHOLE_SUBJECT_REALISTIC_PASS | checks=${checks.length} | systems=8 | blocks=159`);
} finally {
  await browser.close();
}
