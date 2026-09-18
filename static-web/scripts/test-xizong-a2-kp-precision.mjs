import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../xizong-a2-functional-audit');
fs.mkdirSync(auditDir, { recursive: true });
const report = { schema: 'kianos.xizong.a2.kp_precision_post_reveal.v3', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_KP_PRECISION_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cuesPath = path.resolve(process.cwd(), '../content/xizong/knowledge/learner/a2-respiratory-learning-cues.json');
const cues = JSON.parse(fs.readFileSync(cuesPath, 'utf8'));
const kpPrecisionSource = (cues.precision_index || []).filter((row) => row?.anchor?.kp_id);
const groupPrecisionSource = (cues.precision_index || []).filter((row) => row?.anchor?.logic_group_id);
const kpVisualSource = (cues.visual_bindings || []).filter((row) => row?.anchor?.kp_id);
const groupVisualSource = (cues.visual_bindings || []).filter((row) => row?.anchor?.logic_group_id);
check(kpPrecisionSource.length === 17, 'current_kp_precision_count', String(kpPrecisionSource.length));
check(groupPrecisionSource.length === 15, 'current_group_precision_count', String(groupPrecisionSource.length));
check(groupVisualSource.length === 17, 'current_group_visual_count', String(groupVisualSource.length));
check(kpVisualSource.length === 0, 'current_kp_visual_count_zero', String(kpVisualSource.length));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try { const r = await fetch(`${BASE}/xizong/respiratory/r01/`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('A2_KP_PRECISION_SERVER_NOT_READY');
}

async function resetBlock(page, route) {
  await page.goto(`${BASE}/xizong/respiratory/${route}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  check(await page.locator('[data-xizong-learner-object-payload]').count() === 1, `learner_object_payload_${route}`);
  return root;
}

async function readLearnerObject(page) {
  const raw = await page.locator('[data-xizong-learner-object-payload]').textContent();
  return JSON.parse(raw || '{}');
}

async function completeNaturalSourceContact(root, page, suffix) {
  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, `natural_source_has_no_group_lecture_${suffix}`);
  await root.locator('[data-source-contact-done]').click();
  await page.waitForFunction(() => {
    const host = document.querySelector('[data-xizong-v6-block]');
    const ttsx = host?.querySelector('[data-study-stage="ttsx_checkpoint"]');
    const recall = host?.querySelector('[data-study-stage="kp_recall"]');
    return (ttsx instanceof HTMLElement && !ttsx.hidden) || (recall instanceof HTMLElement && !recall.hidden);
  });
  const ttsxStage = root.locator('[data-study-stage="ttsx_checkpoint"]');
  if (await ttsxStage.isVisible()) await root.locator('[data-ttsx-done]').click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
}

async function reachTargetKp(root, page, targetId) {
  const targetCard = root.locator(`[data-kp-recall-card][data-kp-id="${targetId}"]`);
  check(await targetCard.count() === 1, `target_card_exists_${targetId}`);
  const learner = await readLearnerObject(page);
  const targetKp = (learner?.kps || []).find((kp) => kp?.identity?.kpId === targetId);
  const targetGroupId = targetKp?.identity?.logicGroupId || '';
  const targetGroupIndex = (learner?.logicGroups || []).findIndex((group) => group?.identity?.logicGroupId === targetGroupId);
  check(targetGroupIndex >= 0, `target_group_resolved_${targetId}`, targetGroupId);
  const targetGroup = learner?.logicGroups?.[targetGroupIndex];
  const targetPosition = (targetGroup?.kpIds || []).indexOf(targetId);
  check(targetPosition >= 0, `target_position_resolved_${targetId}`, String(targetPosition));

  await completeNaturalSourceContact(root, page, targetId);
  check(await root.locator('[data-study-stage="source_contact"]').isHidden(), `target_recall_does_not_reopen_source_${targetId}`);
  await root.locator(`[data-group-target="${targetGroupIndex}"]`).click();
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  for (let step = 0; step < targetPosition; step += 1) {
    await root.locator('[data-recall-next]').click();
  }
  check(await targetCard.isVisible(), `target_card_visible_${targetId}`);
  return targetCard;
}

const representatives = [
  {
    route: 'r01', kpId: 'respiratory-r01-kp01', cueId: 'a2-r01-kp01-precision',
    cue: '肺容积 / 肺容量的常用数值与组合公式最终需要精确恢复。'
  },
  {
    route: 'r10', kpId: 'respiratory-r10-kp04', cueId: 'a2-r10-kp04-precision',
    cue: '胸水化验比值、梯度与 Light 判定边界最终需要精确恢复。'
  },
  {
    route: 'r12', kpId: 'respiratory-r12-kp13', cueId: 'a2-r12-kp13-precision',
    cue: '潮气量、平台压、允许性高碳酸血症与 pH 范围最终需要精确恢复。'
  }
];

const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage();

  let learnerPrecision = 0;
  for (let n = 1; n <= 12; n += 1) {
    const route = `r${String(n).padStart(2, '0')}`;
    const root = await resetBlock(page, route);
    check(await root.locator('[data-kp-precision]').count() === 0, `legacy_kp_precision_owner_retired_${route}`);
    const learner = await readLearnerObject(page);
    const slots = Object.values(learner?.slots?.kpRecallPostReveal || {});
    learnerPrecision += slots.reduce((sum, slot) => sum + (Array.isArray(slot?.precision) ? slot.precision.length : 0), 0);
    check(await root.locator('[data-xizong-aux-surface] [data-representation-stage="KP_RECALL_REVEAL"]').count() === 0,
      `recall_reveal_stage_not_preinstantiated_${route}`);
  }
  check(learnerPrecision === 17, 'all_current_kp_precision_rows_present_in_learner_object', String(learnerPrecision));

  for (const item of representatives) {
    const root = await resetBlock(page, item.route);
    const card = await reachTargetKp(root, page, item.kpId);
    const answer = card.locator('[data-kp-answer]');
    const auxHost = root.locator('[data-xizong-aux-surface] [data-learner-object-slot]');

    check(await answer.isHidden(), `answer_hidden_before_reveal_${item.kpId}`);
    check((await auxHost.getAttribute('data-learner-object-slot')) === 'kp_recall_aux',
      `precision_recall_context_slot_bound_${item.kpId}`);
    check((await auxHost.getAttribute('data-representation-stage')) === 'KP_RECALL_FRONT',
      `precision_recall_front_stage_${item.kpId}`);
    const frontCue = auxHost.locator(`[data-learner-asset="precision"][data-learner-asset-id="${item.cueId}"]`);
    check(await frontCue.count() === 1, `precision_context_cue_bound_before_reveal_${item.kpId}`);
    check((await frontCue.getAttribute('data-precision-resolution')) === 'CUE_ONLY',
      `precision_context_remains_cue_only_${item.kpId}`);
    check((await frontCue.textContent() || '').includes(item.cue), `precision_context_text_unchanged_${item.kpId}`);
    check(await frontCue.isVisible(), `precision_context_visible_before_reveal_${item.kpId}`);
    check(await frontCue.locator('.xv6LearnerPrecisionExact').count() === 0,
      `precision_context_has_no_exact_answer_before_reveal_${item.kpId}`);

    await card.locator('[data-kp-reveal]').click();
    await root.locator('[data-xizong-aux-surface] [data-learner-object-slot="kp_recall_aux"][data-representation-stage="KP_RECALL_REVEAL"]').waitFor({ state: 'visible' });
    const stack = root.locator('[data-xizong-aux-surface] [data-learner-object-slot="kp_recall_aux"]');
    const cue = stack.locator(`[data-learner-asset="precision"][data-learner-asset-id="${item.cueId}"]`);
    check(await answer.isVisible(), `answer_visible_after_reveal_${item.kpId}`);
    check(await stack.count() === 1, `precision_recall_aux_remains_bound_after_reveal_${item.kpId}`);
    check((await stack.getAttribute('data-representation-stage')) === 'KP_RECALL_REVEAL',
      `precision_recall_reveal_stage_${item.kpId}`);
    check(await cue.count() === 1, `precision_cue_id_bound_${item.kpId}`);
    check((await cue.textContent() || '').includes(item.cue), `precision_text_unchanged_${item.kpId}`);
    check(await cue.isVisible(), `precision_cue_visible_after_reveal_${item.kpId}`);

    const visibleCard = root.locator('[data-kp-recall-card]:not([hidden])');
    const beforeId = await visibleCard.getAttribute('data-kp-id');
    await root.locator('[data-recall-next]').click();
    let afterId = await visibleCard.getAttribute('data-kp-id');
    if (afterId === beforeId) {
      await root.locator('[data-recall-prev]').click();
      afterId = await visibleCard.getAttribute('data-kp-id');
    }
    check(afterId && afterId !== beforeId, `moved_to_another_kp_${item.kpId}`, `${beforeId}->${afterId}`);
    check(await root.locator(`[data-learner-asset="precision"][data-learner-asset-id="${item.cueId}"]`).count() === 0,
      `previous_precision_removed_after_kp_move_${item.kpId}`);
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.semantic_surface = 'kianos.xizong.learner_object.v1';
  fs.writeFileSync(path.join(auditDir, 'kp-precision-post-reveal.json'), JSON.stringify(report, null, 2));
  console.log('A2_KP_PRECISION_POST_REVEAL_PASS');
  await context.close();
} catch (error) {
  report.finished_at = new Date().toISOString();
  report.status = 'FAIL';
  report.error = String(error?.stack || error);
  fs.writeFileSync(path.join(auditDir, 'kp-precision-post-reveal.json'), JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  else { try { server.kill('SIGTERM'); } catch {} }
  server.stdout?.destroy(); server.stderr?.destroy();
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) { try { process.kill(-server.pid, 'SIGKILL'); } catch {} }
    else { try { server.kill('SIGKILL'); } catch {} }
  }
}