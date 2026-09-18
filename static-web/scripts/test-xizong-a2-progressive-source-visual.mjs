import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4328;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-a2-progressive-source-visual.json');
const report = { schema: 'kianos.xizong.a2.progressive_source_visual.v3', started_at: new Date().toISOString(), checks: [] };
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`A2_PROGRESSIVE_SOURCE_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`${BASE}/xizong/respiratory/r08/`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('A2_PROGRESSIVE_SOURCE_VISUAL_SERVER_NOT_READY');
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
  await page.goto(`${BASE}/xizong/respiratory/r08/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));
  const visualRoot = root.locator('[data-learner-asset="visual"][data-learner-asset-id="a2-r08-lg01-visual"]');
  const learnerPayload = page.locator('[data-xizong-learner-object-payload]');
  check(await learnerPayload.count() === 1, 'unified_learner_object_payload_present');
  const learner = JSON.parse((await learnerPayload.textContent()) || '{}');
  const firstSourceLocator = String(learner?.kps?.[0]?.source?.locator || '');
  check(Boolean(firstSourceLocator), 'learner_object_preserves_source_locator');
  check(await root.locator('[data-xizong-group-visuals]').count() === 0, 'legacy_group_visual_dom_owner_retired');

  const geometry = await root.evaluate((node) => {
    const left = node.querySelector('.portedStudyOutline');
    const main = node.querySelector('.portedStudyMain');
    const right = node.querySelector('.portedStudyChain');
    const framework = node.querySelector('[data-xizong-cognitive-projection]');
    const scroller = document.scrollingElement;
    const rect = node.getBoundingClientRect();
    return {
      shell: node.classList.contains('xv6BlockWorkspaceShell'),
      leftWidth: left?.getBoundingClientRect().width || 0,
      mainWidth: main?.getBoundingClientRect().width || 0,
      rightWidth: right?.getBoundingClientRect().width || 0,
      rootBottom: rect.bottom,
      viewportHeight: window.innerHeight,
      pageScrollHeight: scroller?.scrollHeight || 0,
      pageClientHeight: scroller?.clientHeight || 0,
      frameworkCount: framework ? 1 : 0,
      frameworkOpen: framework?.hasAttribute('open') || false,
      crosswalkBridgeHidden: Boolean(document.querySelector('[data-xizong-legacy-crosswalk-bridge]')?.hidden),
      legacyMemoryUiCount: document.querySelectorAll('.xv6MemoryReview').length,
      recallEvidenceBridgeHidden: Boolean(document.querySelector('[data-xizong-recall-evidence-bridge]')?.hidden)
    };
  });
  check(geometry.shell, 'one_screen_workspace_shell_mounted');
  check(geometry.leftWidth >= 270 && geometry.leftWidth <= 310, 'logic_map_stays_narrow', String(geometry.leftWidth));
  check(geometry.mainWidth > geometry.leftWidth * 2.5, 'central_learning_surface_is_dominant', JSON.stringify(geometry));
  check(geometry.rootBottom <= geometry.viewportHeight + 2, 'block_workspace_fits_viewport', `${geometry.rootBottom}/${geometry.viewportHeight}`);
  check(geometry.pageScrollHeight <= geometry.pageClientHeight + 4, 'block_route_does_not_become_endless_page', `${geometry.pageScrollHeight}/${geometry.pageClientHeight}`);
  check(geometry.frameworkCount === 1 && geometry.frameworkOpen === false, 'block_framework_is_compact_entry_by_default');
  check(geometry.crosswalkBridgeHidden, 'crosswalk_exits_visible_first_pass_workspace');
  check(geometry.legacyMemoryUiCount === 0 && geometry.recallEvidenceBridgeHidden, 'legacy_after_learn_ui_is_replaced_by_evidence_only_bridge');

  // Current Learning: the Source-contact state is no longer a blank handoff page.
  // It carries the learner-object KP Learn companion while Lecture stays continuous on iPad/MarginNote.
  await root.locator('[data-stage-next="logic_group"]').click();
  await root.locator('[data-study-stage="source_contact"]').waitFor({ state: 'visible' });
  const companion = root.locator('[data-learner-kp-companion="source_contact"]');
  await companion.waitFor({ state: 'visible' });
  check(await companion.locator('[data-learner-kp-core]').count() === 1, 'source_contact_hosts_full_kp_learn_core');
  const companionLocatorText = (await companion.locator('.xv6KpLearnLocators').textContent()) || '';
  check(companionLocatorText.includes(firstSourceLocator), 'kp_learn_companion_preserves_source_locator', companionLocatorText);
  check(await root.locator('[data-study-stage="source_contact"] .xv6LectureFirst').isHidden(), 'blank_source_handoff_body_is_retired');
  check(await visualRoot.count() === 0, 'logic_group_visual_not_shown_during_continuous_source_contact');

  await root.locator('[data-source-contact-done]').click();
  await page.waitForFunction(() => {
    const host = document.querySelector('[data-xizong-v6-block]');
    const ttsx = host?.querySelector('[data-study-stage="ttsx_checkpoint"]');
    const recall = host?.querySelector('[data-study-stage="kp_recall"]');
    return (ttsx instanceof HTMLElement && !ttsx.hidden) || (recall instanceof HTMLElement && !recall.hidden);
  });
  const ttsxStage = root.locator('[data-study-stage="ttsx_checkpoint"]');
  if (await ttsxStage.isVisible()) {
    await root.locator('[data-ttsx-done]').click();
  }
  await root.locator('[data-study-stage="kp_recall"]').waitFor({ state: 'visible' });
  await visualRoot.waitFor({ state: 'visible' });
  check(await visualRoot.locator('xpath=ancestor::*[@data-learner-object-slot="kp_recall_aux"]').count() === 1,
    'reviewed_source_visual_follows_current_kp_recall_aux_slot');
  check(await visualRoot.locator('xpath=ancestor::*[@data-xizong-aux-surface]').count() === 1,
    'reviewed_source_visual_renders_in_dynamic_auxiliary_region');
  check(await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]').isHidden(),
    'recall_core_remains_hidden_while_safe_support_is_visible');
  check((await root.locator('[data-xizong-aux-surface] [data-learner-object-slot]').getAttribute('data-representation-stage')) === 'KP_RECALL_FRONT',
    'source_visual_uses_safe_kp_recall_front_stage');
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.getAttribute('data-aux-weight') === 'rich');
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-xizong-v6-block]');
    const main = node?.querySelector('.portedStudyMain')?.getBoundingClientRect().width || 0;
    const right = node?.querySelector('.portedStudyChain')?.getBoundingClientRect().width || 0;
    const ratio = right / Math.max(1, main + right);
    return ratio >= 0.35 && ratio <= 0.50;
  });

  const expandedGeometry = await root.evaluate((node) => {
    const main = node.querySelector('.portedStudyMain')?.getBoundingClientRect().width || 0;
    const right = node.querySelector('.portedStudyChain')?.getBoundingClientRect().width || 0;
    return { main, right, ratio: right / Math.max(1, main + right), auxWeight: node.getAttribute('data-aux-weight') || '' };
  });
  check(expandedGeometry.auxWeight === 'rich', 'rich_semantic_asset_controls_auxiliary_width');
  check(expandedGeometry.ratio >= 0.35 && expandedGeometry.ratio <= 0.50, 'visual_auxiliary_expands_to_content_driven_share', JSON.stringify(expandedGeometry));
  const auxOverflow = await page.locator('[data-xizong-aux-surface] .xv6LearnerAuxBody').evaluate((node) => getComputedStyle(node).overflowY);
  check(['auto', 'scroll'].includes(auxOverflow), 'visual_auxiliary_has_local_scroll_path', auxOverflow);

  const figures = visualRoot.locator('.xv6LearnerVisualGallery figure');
  check(await figures.count() === 1, 'new_partial_content_bundle_renders_without_runtime_change', String(await figures.count()));
  const caption = await figures.locator('figcaption').textContent() || '';
  check(caption.includes('P22'), 'reviewed_source_page_is_exact', caption);
  const visualText = await visualRoot.textContent() || '';
  check(visualText.includes('内科 Lecture PDF P22'), 'existing_cue_locator_preserved');
  check(visualText.includes('容量、比值和 DLCO 三条轴'), 'existing_cue_micro_task_preserved');

  const image = visualRoot.locator('img');
  check(await image.count() === 1, 'one_reviewed_asset_rendered');
  const alt = await image.getAttribute('alt') || '';
  check(alt.includes('P22'), 'source_visual_alt_preserves_reviewed_page', alt);
  const src = await image.getAttribute('src') || '';
  check(Boolean(src), 'asset_url_present');
  const response = await page.request.get(new URL(src, BASE).toString());
  check(response.ok(), 'asset_http_ok', `${response.status()}:${src}`);

  // KP Recall is Core-protected: reviewed safe support may stay visible, while the Core answer remains hidden until Reveal.
  check(await root.locator('[data-study-stage="kp_learn"]').count() === 0, 'natural_source_group_does_not_reopen_group_source_stage');
  check(await visualRoot.isVisible(), 'reviewed_source_visual_may_remain_as_safe_recall_support');
  check(await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]').isHidden(), 'recall_answer_remains_hidden_before_reveal');

  await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-reveal]').click();
  await page.waitForFunction(() => document.querySelector('[data-xizong-aux-surface] [data-learner-object-slot]')?.getAttribute('data-representation-stage') === 'KP_RECALL_REVEAL');
  check(await visualRoot.isVisible(), 'reviewed_source_visual_remains_available_after_reveal');
  const answerOverflow = await root.locator('[data-kp-recall-card]:not([hidden]) [data-kp-answer]').evaluate((node) => getComputedStyle(node).overflowY);
  check(['auto', 'scroll'].includes(answerOverflow), 'kp_core_has_local_scroll_path_after_reveal', answerOverflow);
  const recallGeometry = await root.evaluate((node) => ({
    bottom: node.getBoundingClientRect().bottom,
    viewport: window.innerHeight,
    pageScrollHeight: document.scrollingElement?.scrollHeight || 0,
    pageClientHeight: document.scrollingElement?.clientHeight || 0
  }));
  check(recallGeometry.bottom <= recallGeometry.viewport + 2, 'recall_workspace_stays_inside_viewport', JSON.stringify(recallGeometry));
  check(recallGeometry.pageScrollHeight <= recallGeometry.pageClientHeight + 4, 'revealed_core_does_not_restore_outer_page_scroll', JSON.stringify(recallGeometry));

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.evidence_class = 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U';
  report.semantic_surface = 'kianos.xizong.learner_object.v1';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('A2_PROGRESSIVE_SOURCE_VISUAL_PASS');
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