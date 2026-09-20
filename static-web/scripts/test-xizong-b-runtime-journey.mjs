import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { loadXizongSystem, loadXizongBlock } from '../src/lib/xizong.mjs';

const SYSTEM_ID = 'digestive-metabolic-endocrine-tumor';
const PORT = 4334;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-b-runtime-journey.json');
const report = {
  schema: 'kianos.xizong.b.runtime_journey.v1',
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  started_at: new Date().toISOString(),
  checks: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_B_RUNTIME_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const answerLetters = (value) => (String(value || '').toUpperCase().match(/[A-Z]/g) || []).sort();

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_B_RUNTIME_SERVER_NOT_READY');
}

async function clearXizong(page) {
  await page.goto(`${BASE}/xizong/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
}

async function visibleStage(root) {
  return root.locator('[data-study-stage]:visible').first().getAttribute('data-study-stage');
}

async function settleTtsx(root, page) {
  if (await visibleStage(root) !== 'ttsx_checkpoint') return;
  await root.locator('[data-ttsx-done]').click();
  await page.waitForTimeout(100);
}

async function firstBlockJourney(page) {
  const route = `${BASE}/xizong/${SYSTEM_ID}/d01/`;
  const studyKey = 'kianos-xizong-astro-v2:xizong:D1';
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });

  const learner = JSON.parse((await page.locator('[data-xizong-learner-object-payload]').textContent()) || 'null');
  check(learner?.schema === 'kianos.xizong.learner_object.v1', 'd1_learner_object_present');
  check(learner?.identity?.blockId === 'D1', 'd1_stable_block_identity', learner?.identity?.blockId || '');
  check(Array.isArray(learner?.kps) && learner.kps.length === 6, 'd1_stable_kp_count', String(learner?.kps?.length || 0));
  check(Array.isArray(learner?.logicGroups) && learner.logicGroups.length === 3, 'd1_logic_group_count', String(learner?.logicGroups?.length || 0));
  check(learner.kps.every((kp) => /^digestive-d1-kp\d{2}$/.test(String(kp?.identity?.kpId || ''))),
    'd1_uses_stable_kianos_kp_markers');

  check(await visibleStage(root) === 'block_learn', 'd1_starts_at_block_orientation');
  await root.locator('[data-stage-next="logic_group"]').click();
  await page.waitForTimeout(80);
  check(await visibleStage(root) === 'kp_learn', 'b_whole_lg_enters_single_source_handoff');

  const before = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(Object.keys(before?.learned || {}).length === 0, 'source_handoff_does_not_prelearn_kps');

  const firstGroupIds = learner.logicGroups[0].kpIds;
  await root.locator('[data-group-lecture-done]').click();
  await page.waitForTimeout(100);
  await settleTtsx(root, page);
  check(await visibleStage(root) === 'kp_recall', 'whole_lg_source_contact_releases_recall');

  const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  const learnedIds = Object.entries(after?.learned || {}).filter(([, value]) => value === true).map(([id]) => id);
  check(firstGroupIds.every((id) => learnedIds.includes(id)), 'first_lg_contact_marks_exact_group_kps');
  check(learnedIds.length === firstGroupIds.length && learnedIds.length < learner.kps.length,
    'whole_lg_contact_does_not_mark_entire_block', `${learnedIds.length}/${learner.kps.length}`);
  check(Array.isArray(after?.sourceContactEvidence) && after.sourceContactEvidence.length === 1,
    'source_contact_evidence_single_segment', String(after?.sourceContactEvidence?.length || 0));
  check(after.sourceContactEvidence[0]?.segment_id === `source:${learner.logicGroups[0].identity.logicGroupId}`,
    'source_contact_segment_bound_to_accepted_lg', String(after.sourceContactEvidence[0]?.segment_id || ''));
  check(after.sourceContactEvidence[0]?.source_contact_mode === 'WHOLE_LOGIC_GROUP',
    'source_contact_mode_preserved', String(after.sourceContactEvidence[0]?.source_contact_mode || ''));

  const activeCard = root.locator('[data-kp-recall-card]:not([hidden])');
  const activeKp = await activeCard.getAttribute('data-kp-id');
  check(firstGroupIds.includes(activeKp), 'recall_stays_inside_contacted_lg', activeKp || '');
  check(await activeCard.locator('[data-kp-answer]:visible').count() === 0, 'recall_front_keeps_answer_hidden');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await root.waitFor({ state: 'visible' });
  check(await visibleStage(root) === 'kp_recall', 'refresh_restores_b_recall_stage');
  const restored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), studyKey);
  check(restored?.sourceContactEvidence?.[0]?.segment_id === after.sourceContactEvidence[0].segment_id,
    'refresh_preserves_source_contact_identity');
}

async function systemRecallToPracticeJourney(page) {
  const system = loadXizongSystem(SYSTEM_ID);
  check(system.canonicalId === 'B', 'b_system_is_projectable');
  check(system.blocks.length === 38, 'b_system_block_count', String(system.blocks.length));

  const completed = {};
  for (const ref of system.blocks) {
    const block = loadXizongBlock(SYSTEM_ID, ref.slug);
    const kpIds = block.kpRecords.map((kp) => kp.kpId);
    completed[block.blockId] = {
      schema: 'kianos.xizong.block-state.v2',
      stage: 'block_recall',
      groupIndex: Math.max(0, block.logicGroups.length - 1),
      kpIndex: Math.max(0, block.kpRecords.length - 1),
      sourceContactDone: true,
      learned: Object.fromEntries(kpIds.map((id) => [id, true])),
      ratings: Object.fromEntries(kpIds.map((id) => [id, 'known'])),
      ttsxEvidence: {},
      ttsxAnnotations: {},
      pendingTtsx: null,
      blockRecallDone: true,
      blockRecallCompletedAt: '2026-09-21T00:00:00.000Z',
      completed: true,
      completedAt: '2026-09-21T00:00:00.000Z'
    };
  }

  await page.goto(`${BASE}/xizong/${SYSTEM_ID}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((rows) => {
    for (const [blockId, state] of Object.entries(rows)) {
      localStorage.setItem(`kianos-xizong-astro-v2:xizong:${blockId}`, JSON.stringify(state));
    }
  }, completed);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const recallEntry = page.locator('[data-xizong-system-recall-entry]');
  check(await recallEntry.isVisible(), 'all_38_completed_blocks_release_system_recall');

  await page.goto(`${BASE}/xizong/${SYSTEM_ID}/recall/`, { waitUntil: 'domcontentloaded' });
  const recall = page.locator(`[data-xizong-system-exit="${SYSTEM_ID}"]`);
  await recall.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-system-recall-lock]').isHidden(), 'b_system_recall_unlocked');
  check(await recall.locator('[data-practice-handoff]').isHidden(), 'practice_hidden_before_system_recall');
  await recall.locator('[data-reveal-recall]').click();
  await recall.locator('[data-complete-recall]').click();
  await page.waitForTimeout(100);
  check(await recall.locator('[data-practice-handoff]').isVisible(), 'system_recall_releases_practice_handoff');

  const recallState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'),
    `kianos:xizong:system-recall:${SYSTEM_ID}:v1`);
  check(Boolean(recallState?.completedAt), 'b_system_recall_persists');

  const practiceHref = await recall.locator('[data-practice-handoff] a').getAttribute('href');
  check(String(practiceHref || '').includes(`/xizong/practice/${SYSTEM_ID}/`), 'handoff_targets_b_practice', practiceHref || '');

  await page.goto(`${BASE}/xizong/practice/${SYSTEM_ID}/`, { waitUntil: 'domcontentloaded' });
  const practice = page.locator(`[data-xizong-practice="${SYSTEM_ID}"]`);
  await practice.waitFor({ state: 'visible' });
  const payload = JSON.parse((await practice.locator('[data-sweep-payload]').textContent()) || 'null');
  check(Array.isArray(payload?.questions) && payload.questions.length === 1071,
    'b_practice_uses_exact_1071_scope', String(payload?.questions?.length || 0));
  check(payload?.system?.canonicalId === 'B' || payload?.canonicalId === 'B' || payload?.canonical_id === 'B',
    'b_practice_payload_keeps_system_identity');
  check(await page.locator('[data-xizong-system-evidence-guard]').count() === 1,
    'b_practice_mounts_system_evidence_guard');

  const reviewedTarget = payload.questions.find((q) =>
    q?.relation?.primaryKpId && q?.relation?.blockId && q?.relation?.knowledgePath
  );
  check(Boolean(reviewedTarget), 'b_reviewed_relation_question_exists');

  const stableTarget = payload.questions.find((q) =>
    q?.questionId !== reviewedTarget?.questionId && Number(q?.year) === Number(reviewedTarget?.year)
  );
  check(Boolean(stableTarget), 'b_stable_control_question_exists');

  const holdoutYear = payload.years.find((year) =>
    Number(year) !== Number(reviewedTarget?.year) && Number(year) !== Number(stableTarget?.year)
  );
  check(Boolean(holdoutYear), 'b_non_target_holdout_year_exists');

  await practice.locator('.xzpMore').evaluate((node) => { node.open = true; });
  await practice.locator('[data-holdout-control]').evaluate((node) => { node.open = true; });
  await practice.locator('[data-holdout-input]').fill(String(holdoutYear));
  await practice.locator('[data-save-holdout]').click();
  await practice.locator('[data-question-card]').waitFor({ state: 'visible' });

  const selectQuestion = async (question) => {
    const mapTarget = practice.locator(`.xzpMapItem[title="${question.year} · 第 ${question.number} 题"]`);
    await mapTarget.click();
    await page.waitForTimeout(80);
    check((await practice.locator('[data-question-meta]').textContent() || '').includes(`第 ${question.number} 题`),
      'b_target_selected', question.questionId);
  };

  const answerCorrect = async (question, { uncertain = false } = {}) => {
    if (uncertain) {
      const button = practice.locator('[data-question-uncertain]');
      if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click();
    }
    for (const letter of answerLetters(question.correctAnswer)) {
      await practice.locator(`[data-question-options] [data-option="${letter}"]`).click();
    }
    await practice.locator('[data-submit-answer]').click();
    await page.waitForTimeout(150);
  };

  // Stable control: a correct confident answer must remain Stable and must not
  // become eligible for W/U Repair even if a bogus Chat packet tries to coerce it.
  await selectQuestion(stableTarget);
  await answerCorrect(stableTarget);
  const sweepKey = `kianos:xizong:system-question-sweep:${SYSTEM_ID}:v1`;
  const stableState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(stableState?.results?.[stableTarget.questionId]?.status === 'stable',
    'b_correct_confident_attempt_stays_stable');
  const stableEvent = [...(stableState?.attemptHistory || [])].reverse().find((event) =>
    event?.type === 'QUESTION_ATTEMPT' && event?.question_id === stableTarget.questionId
  );
  check(Boolean(stableEvent?.attempt_id), 'b_stable_attempt_has_exact_identity');

  const repair = page.locator(`[data-xizong-repair-return="${SYSTEM_ID}"]`);
  await repair.locator(':scope > summary').click();

  const stableCoercion = {
    schema:'kianos.xizong.system_wu_return.v1',
    return_id:'b-e-stable-coercion',
    system_id:SYSTEM_ID,
    decision:'REPAIR',
    plan:[{
      question_id:stableTarget.questionId,
      status:'wrong',
      attempt_id:String(stableEvent.attempt_id || ''),
      submitted_at:String(stableEvent.submitted_at || ''),
      round_id:String(stableEvent.round_id || ''),
      reason:'attempt to coerce stable evidence into Repair',
      action:'should be rejected',
      priority:'high'
    }]
  };
  await repair.locator('[data-plan-text]').fill(JSON.stringify(stableCoercion));
  await repair.locator('[data-apply-plan]').click();
  await page.waitForTimeout(80);
  check((await repair.locator('[data-plan-status]').textContent() || '').includes('没有应用'),
    'b_stable_attempt_cannot_be_forced_into_repair');
  const memoryAfterStableCoercion = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('kianos-xizong-memory-v1') || 'null')
  );
  check(!(memoryAfterStableCoercion?.repairTasks || []).some((task) =>
    (task?.sourceQuestionIds || []).includes(stableTarget.questionId)
  ), 'b_stable_coercion_creates_no_repair_task');

  // Real W/U observation on a question with a reviewed exact relation.
  await selectQuestion(reviewedTarget);
  const uncertainButton = practice.locator('[data-question-uncertain]');
  if ((await uncertainButton.getAttribute('aria-pressed')) !== 'true') await uncertainButton.click();
  await answerCorrect(reviewedTarget);
  check((await practice.locator('[data-answer-result]').textContent() || '').includes('不确定'),
    'b_correct_but_unsure_stays_uncertain');
  let wuState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(wuState?.results?.[reviewedTarget.questionId]?.status === 'uncertain',
    'b_uncertain_result_persists');
  const wuEvent = [...(wuState?.attemptHistory || [])].reverse().find((event) =>
    event?.type === 'QUESTION_ATTEMPT' && event?.question_id === reviewedTarget.questionId
  );
  check(Boolean(wuEvent?.attempt_id), 'b_wu_attempt_has_exact_identity');
  check(wuEvent?.status === 'uncertain' && wuEvent?.evidence_origin === 'USER_QUESTION_ATTEMPT',
    'b_wu_attempt_append_preserved');
  check(await practice.locator('[data-relation-wrap]').isVisible(),
    'b_reviewed_relation_released_after_attempt');
  check((await practice.locator('[data-relation-link]').getAttribute('href') || '')
    .includes(String(reviewedTarget.relation.knowledgePath).replace(/^\/+/,'')),
    'b_reviewed_relation_targets_exact_knowledge_path');

  const goodPacket = {
    schema:'kianos.xizong.system_wu_return.v1',
    return_id:'b-e-reviewed-wu',
    system_id:SYSTEM_ID,
    decision:'REPAIR',
    plan:[{
      question_id:reviewedTarget.questionId,
      status:'uncertain',
      attempt_id:String(wuEvent.attempt_id || ''),
      submitted_at:String(wuEvent.submitted_at || ''),
      round_id:String(wuEvent.round_id || ''),
      reason:'B Evidence acceptance',
      action:'repair reviewed owning KP only',
      priority:'high'
    }]
  };

  // The same W/U observation with a stale attempt binding must fail closed.
  const stalePacket = JSON.parse(JSON.stringify(goodPacket));
  stalePacket.return_id = 'b-e-stale-wu';
  stalePacket.plan[0].attempt_id = `${goodPacket.plan[0].attempt_id}-stale`;
  await repair.locator('[data-plan-text]').fill(JSON.stringify(stalePacket));
  await repair.locator('[data-apply-plan]').click();
  await page.waitForTimeout(80);
  check((await repair.locator('[data-plan-status]').textContent() || '').includes('没有应用'),
    'b_stale_attempt_binding_fails_closed');
  const memoryAfterStale = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('kianos-xizong-memory-v1') || 'null')
  );
  check(!(memoryAfterStale?.repairTasks || []).some((task) =>
    (task?.sourceQuestionIds || []).includes(reviewedTarget.questionId)
  ), 'b_stale_binding_creates_no_repair_task');

  // Correct typed Return uses no model-supplied Block/KP mapping; KianOS resolves
  // only the Current reviewed relation.
  await repair.locator('[data-plan-text]').fill(JSON.stringify(goodPacket));
  await repair.locator('[data-apply-plan]').click();
  await page.waitForTimeout(100);
  const routeLink = repair.locator('[data-plan-list] a').first();
  await routeLink.waitFor({ state: 'visible' });

  const memoryAfterPlan = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('kianos-xizong-memory-v1') || 'null')
  );
  const visibleRepair = (memoryAfterPlan?.repairTasks || []).find((task) =>
    task?.kpId === reviewedTarget.relation.primaryKpId
      && task?.blockId === reviewedTarget.relation.blockId
      && (task?.sourceQuestionIds || []).includes(reviewedTarget.questionId)
  );
  check(Boolean(visibleRepair), 'b_reviewed_wu_enters_visible_memory_repair');
  check(String(visibleRepair?.returnHref || '').includes(`/xizong/practice/${SYSTEM_ID}/`),
    'b_visible_repair_keeps_question_return');
  check(!(memoryAfterPlan?.repairTasks || []).some((task) =>
    (task?.sourceQuestionIds || []).includes(stableTarget.questionId)
  ), 'b_stable_control_remains_outside_repair');

  const [repairPage] = await Promise.all([
    page.context().waitForEvent('page'),
    routeLink.click()
  ]);
  await repairPage.waitForLoadState('domcontentloaded');
  await repairPage.waitForTimeout(500);
  const repairEvidence = await repairPage.evaluate(({ blockId, kpId }) => {
    const ext = JSON.parse(localStorage.getItem(`kianos-xizong-memory-review-v2:xizong:${blockId}`) || 'null');
    return {
      inPlan: Array.isArray(ext?.reviewPlan) && ext.reviewPlan.some((row) =>
        String(row?.kpId || row?.kp_id || row || '') === kpId
      ),
      imported: Array.isArray(ext?.evidenceHistory) && ext.evidenceHistory.some((row) =>
        row?.type === 'SYSTEM_WU_PLAN_IMPORTED' && row?.evidence_role === 'REPAIR_ONLY'
      )
    };
  }, { blockId: reviewedTarget.relation.blockId, kpId: reviewedTarget.relation.primaryKpId });
  check(repairEvidence.inPlan && repairEvidence.imported,
    'b_reviewed_wu_routes_to_owner_as_repair_only');
  await repairPage.close();

  check(!page.isClosed(), 'b_original_practice_tab_preserved_for_return');
  wuState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), sweepKey);
  check(wuState?.results?.[reviewedTarget.questionId]?.status === 'uncertain',
    'b_repair_does_not_rewrite_original_question_attempt');

  // Version mismatch must archive/clear stale System evidence rather than silently
  // authorize Current decisions.
  const marker = page.locator('[data-xizong-system-evidence-guard]');
  const currentVersion = await marker.getAttribute('data-evidence-version');
  check(Boolean(currentVersion), 'b_system_evidence_version_present');
  await page.evaluate(({ systemId }) => {
    localStorage.setItem(`kianos:xizong:system-evidence-meta:${systemId}:v1`,
      JSON.stringify({ version:'INTENTIONALLY_STALE_VERSION', observed_at:new Date().toISOString() }));
  }, { systemId:SYSTEM_ID });
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForTimeout(500);
  const staleResult = await page.evaluate(({ systemId, currentVersion, sweepKey }) => {
    const meta = JSON.parse(localStorage.getItem(`kianos:xizong:system-evidence-meta:${systemId}:v1`) || 'null');
    const staleKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`kianos-xizong-stale-system-evidence:${systemId}:`)
    );
    return {
      metaVersion:meta?.version || '',
      staleKeys,
      sweepStillPresent:localStorage.getItem(sweepKey) !== null,
      repairStillPresent:localStorage.getItem(`kianos:xizong:system-repair-return:${systemId}:v1`) !== null
    };
  }, { systemId:SYSTEM_ID, currentVersion, sweepKey });
  check(staleResult.metaVersion === currentVersion,
    'b_version_mismatch_rebinds_current_evidence_version');
  check(staleResult.staleKeys.length >= 1,
    'b_version_mismatch_archives_stale_system_evidence');
  check(staleResult.sweepStillPresent === false && staleResult.repairStillPresent === false,
    'b_version_mismatch_clears_stale_sweep_and_repair_state');
}

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await clearXizong(page);
  await firstBlockJourney(page);
  await systemRecallToPracticeJourney(page);

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.boundary = 'Engineering P/R/E proof only. Seeded completion states prove gating/identity compatibility, not Kian learner U; question attempts are synthetic browser actions against Current Question Truth.';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`XIZONG_B_RUNTIME_EVIDENCE_JOURNEY_PASS | checks=${report.checks.length}`);
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  } else {
    try { server.kill('SIGTERM'); } catch {}
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}
