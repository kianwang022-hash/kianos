import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4331;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-representative-workspace.json');
const report = {
  schema: 'kianos.xizong.representative_workspace.v2',
  started_at: new Date().toISOString(),
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  representatives: [],
  checks: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_REPRESENTATIVE_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const representatives = [
  { lane: 'A1', route: '/xizong/circulation/b02/', evidenceRole: 'CURRENT_PROJECTED_ROUTE' },
  { lane: 'A2', route: '/xizong/respiratory/r08/', evidenceRole: 'CURRENT_PROJECTED_ROUTE' },
  { lane: 'A3', route: '/xizong/urinary/b01/', evidenceRole: 'CURRENT_PROJECTED_ROUTE' },
  {
    lane: 'B', route: '/qa/xizong-workspace/b/', evidenceRole: 'QA_TOPOLOGY_COMPATIBILITY_ONLY',
    expectedEntryStage: 'logic_group',
    authorityRef: 'b-digestive-metabolic-endocrine-tumor-learning.json#surface_handoff_contract'
  },
  {
    lane: 'C', route: '/qa/xizong-workspace/c/', evidenceRole: 'QA_TOPOLOGY_COMPATIBILITY_ONLY',
    expectedEntryStage: 'source_contact',
    authorityRef: 'c-hematology-immunity-infection-learning.json#surface_handoff_contract'
  }
];

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/circulation/b02/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_REPRESENTATIVE_WORKSPACE_SERVER_NOT_READY');
}

async function resetRoute(page, item) {
  await page.goto(`${BASE}${item.route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
  return root;
}

async function activeStage(root) {
  return root.evaluate((node) => {
    const active = [...node.querySelectorAll('[data-study-stage]')].find((stage) => !stage.hasAttribute('hidden'));
    return active?.getAttribute('data-study-stage') || '';
  });
}

async function waitForStageChange(page, root, previous) {
  await page.waitForFunction((oldStage) => {
    const node = document.querySelector('[data-xizong-v6-block]');
    const active = [...(node?.querySelectorAll('[data-study-stage]') || [])].find((stage) => !stage.hasAttribute('hidden'));
    return Boolean(active?.getAttribute('data-study-stage') && active.getAttribute('data-study-stage') !== oldStage);
  }, previous);
  return activeStage(root);
}

async function advanceToRecall(page, root, item) {
  const { lane } = item;
  let stage = await activeStage(root);
  check(stage === 'block_learn', `${lane}_starts_at_block_learn`, stage);

  const settleTtsx = async () => {
    if (stage !== 'ttsx_checkpoint') return;
    await root.locator('[data-study-stage="ttsx_checkpoint"]').waitFor({ state: 'visible' });
    await root.locator('[data-ttsx-done]').click();
    stage = await waitForStageChange(page, root, 'ttsx_checkpoint');
  };

  await root.locator('[data-stage-next="logic_group"]').click();
  stage = await waitForStageChange(page, root, 'block_learn');
  check(['source_contact', 'logic_group', 'kp_learn'].includes(stage), `${lane}_current_topology_is_supported`, stage);
  if (item.expectedEntryStage) check(stage === item.expectedEntryStage, `${lane}_accepted_topology_entry_stage`, stage);

  if (stage === 'source_contact') {
    const companion = root.locator('[data-learner-kp-companion="source_contact"]');
    await companion.waitFor({ state: 'visible' });
    check(await companion.locator('[data-learner-kp-core]').count() === 1, `${lane}_source_contact_is_kp_learn_companion`);
    await root.locator('[data-source-contact-done]').click();
    stage = await waitForStageChange(page, root, 'source_contact');
    await settleTtsx();
  }

  if (stage === 'logic_group') {
    await root.locator('[data-enter-group]').click();
    stage = await waitForStageChange(page, root, 'logic_group');
  }

  if (stage === 'kp_learn') {
    const companion = root.locator('[data-learner-kp-companion="kp_learn"]');
    await companion.waitFor({ state: 'visible' });
    check(await companion.locator('[data-learner-kp-core]').count() === 1, `${lane}_group_kp_learn_is_companion`);
    await root.locator('[data-group-lecture-done]').click();
    stage = await waitForStageChange(page, root, 'kp_learn');
    await settleTtsx();
  }

  check(stage === 'kp_recall', `${lane}_reaches_recall_through_current_flow`, stage);
}
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  for (const item of representatives) {
    const root = await resetRoute(page, item);
    const payloadNode = page.locator('[data-xizong-learner-object-payload]');
    check(await payloadNode.count() === 1, `${item.lane}_learner_object_payload_unique`, item.route);
    const learner = JSON.parse((await payloadNode.textContent()) || '{}');
    check(learner?.schema === 'kianos.xizong.learner_object.v1', `${item.lane}_learner_object_schema`, learner?.schema || '');
    check(Array.isArray(learner?.kps) && learner.kps.length > 0, `${item.lane}_learner_object_has_kps`, String(learner?.kps?.length || 0));
    check(Array.isArray(learner?.logicGroups) && learner.logicGroups.length > 0, `${item.lane}_learner_object_has_logic_groups`, String(learner?.logicGroups?.length || 0));

    check((await root.getAttribute('data-representation-gate')) === 'kianos.xizong.representation.v1', `${item.lane}_representation_gate_active`);
    check(await root.locator('[data-xizong-aux-surface]').count() === 1, `${item.lane}_dynamic_aux_surface_unique`);
    check(await root.locator('[data-xizong-group-visuals]').count() === 0, `${item.lane}_legacy_visual_owner_absent`);
    check(await root.locator('[data-kp-precision]').count() === 0, `${item.lane}_legacy_precision_owner_absent`);

    if (item.evidenceRole === 'CURRENT_PROJECTED_ROUTE') {
      const framework = root.locator('[data-xizong-cognitive-projection]');
      check(await framework.count() === 1, `${item.lane}_human_framework_unique`);
      check(!(await framework.first().evaluate((node) => node.hasAttribute('open'))), `${item.lane}_framework_compact_by_default`);
      check(await page.locator('[data-xizong-legacy-crosswalk-bridge]').evaluate((node) => node.hasAttribute('hidden')), `${item.lane}_crosswalk_query_only`);
      check(await page.locator('.xv6MemoryReview').count() === 0, `${item.lane}_legacy_after_learn_absent`);
      check(await page.locator('[data-xizong-memory-release-bridge]').evaluate((node) => node.hasAttribute('hidden')), `${item.lane}_standalone_memory_release_bridge_hidden`);
    } else {
      const fixture = page.locator('[data-xizong-qa-topology-fixture]');
      check(await fixture.count() === 1, `${item.lane}_qa_fixture_explicitly_marked`);
      check((await fixture.getAttribute('data-lane')) === item.lane, `${item.lane}_qa_fixture_lane_bound`);
      check((await fixture.getAttribute('data-authority-ref') || '').includes(item.authorityRef), `${item.lane}_qa_fixture_learning_authority_bound`);
      check(item.route.startsWith('/qa/'), `${item.lane}_qa_fixture_not_published_as_learner_route`, item.route);
      check(await page.locator('[data-xizong-legacy-crosswalk-bridge]').count() === 0, `${item.lane}_qa_fixture_does_not_fake_crosswalk_owner`);
      check(await page.locator('[data-xizong-memory-release-bridge]').count() === 0, `${item.lane}_qa_fixture_does_not_fake_memory_release`);
    }

    const geometry = await root.evaluate((node) => {
      const left = node.querySelector('.portedStudyOutline')?.getBoundingClientRect().width || 0;
      const main = node.querySelector('.portedStudyMain')?.getBoundingClientRect().width || 0;
      const rect = node.getBoundingClientRect();
      return {
        left,
        main,
        bottom: rect.bottom,
        viewport: window.innerHeight,
        pageScrollHeight: document.scrollingElement?.scrollHeight || 0,
        pageClientHeight: document.scrollingElement?.clientHeight || 0
      };
    });
    check(geometry.left >= 270 && geometry.left <= 310, `${item.lane}_logic_map_stays_narrow`, JSON.stringify(geometry));
    check(geometry.main > geometry.left * 2.5, `${item.lane}_central_workspace_dominant`, JSON.stringify(geometry));
    check(geometry.bottom <= geometry.viewport + 2, `${item.lane}_workspace_fits_viewport`, JSON.stringify(geometry));
    check(geometry.pageScrollHeight <= geometry.pageClientHeight + 4, `${item.lane}_no_outer_endless_scroll`, JSON.stringify(geometry));

    await advanceToRecall(page, root, item);
    await root.locator('[data-kp-recall-card]:not([hidden])').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.getAttribute('data-aux-weight') === 'none');
    check(await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]:visible').count() === 0, `${item.lane}_recall_front_answer_hidden`);
    check(await root.locator('[data-xizong-aux-surface] [data-learner-asset]:visible').count() === 0, `${item.lane}_recall_front_aux_has_no_answer_payload`);
    check((await root.locator('[data-xizong-aux-surface] [data-learner-object-slot]').getAttribute('data-learner-object-slot')) !== 'kp_recall_post_reveal', `${item.lane}_post_reveal_slot_absent_before_reveal`);

    const activeCard = root.locator('[data-kp-recall-card]:not([hidden])');
    await activeCard.locator('[data-kp-reveal]').click();
    check(await activeCard.locator('[data-kp-answer]').isVisible(), `${item.lane}_reveal_restores_answer_only_after_action`);

    report.representatives.push({
      lane: item.lane,
      route: item.route,
      evidence_role: item.evidenceRole,
      kp_count: learner.kps.length,
      logic_group_count: learner.logicGroups.length,
      status: 'PASS'
    });
  }

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.acceptance_note = 'B/C rows are QA topology compatibility evidence only; they do not claim Projection acceptance or learner readiness.';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_REPRESENTATIVE_WORKSPACE_PASS');
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