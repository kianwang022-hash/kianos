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
  report.boundary = 'Engineering Runtime proof only. Seeded completion states prove gating/identity compatibility, not Kian learner U.';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`XIZONG_B_RUNTIME_JOURNEY_PASS | checks=${report.checks.length}`);
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
