import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4335;
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTE = '/xizong/respiratory/r01/';
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });
const reportPath = path.join(auditDir, 'xizong-block-workspace.json');

const report = {
  schema: 'kianos.xizong.block_workspace.v1',
  started_at: new Date().toISOString(),
  evidence_class: 'EXECUTED_BROWSER_ENGINEERING_EVIDENCE_NOT_REAL_LEARNER_U',
  representative: 'A2/R1',
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`XIZONG_BLOCK_WORKSPACE_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(`${BASE}${ROUTE}`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error('XIZONG_BLOCK_WORKSPACE_SERVER_NOT_READY');
}

async function visibleStage(root) {
  return root.evaluate((node) => {
    const active = [...node.querySelectorAll('[data-study-stage]')].find((stage) => !stage.hasAttribute('hidden'));
    return active?.getAttribute('data-study-stage') || '';
  });
}

async function scanTypeFloor(root, label) {
  const result = await root.evaluate((node) => {
    const selector = 'p,li,span,small,b,strong,em,label,button,summary,code,h1,h2,h3,h4';
    const rows = [...node.querySelectorAll(selector)]
      .filter((el) => {
        const value = (el.textContent || '').trim();
        if (!value) return false;
        const style = getComputedStyle(el);
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && el.getClientRects().length > 0;
      })
      .map((el) => ({
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 110),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0')
      }));
    return {
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      failures: rows.filter((row) => row.size < 14.99).slice(0, 30)
    };
  });
  check(result.failures.length === 0, `${label}_visible_type_floor_15`, JSON.stringify(result));
  return result.min;
}

async function selectTextAndMark(page, selector, kind, { domClick = false } = {}) {
  const selected = await page.evaluate((targetSelector) => {
    const container = document.querySelector(targetSelector);
    if (!(container instanceof HTMLElement)) return false;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = null;
    while (walker.nextNode()) {
      const candidate = walker.currentNode;
      const value = String(candidate.textContent || '').trim();
      if (value.length >= 2) {
        node = candidate;
        break;
      }
    }
    if (!node) return false;
    const raw = String(node.textContent || '');
    const start = raw.search(/\S/);
    const end = Math.min(raw.length, Math.max(start + 2, start + 6));
    const range = document.createRange();
    range.setStart(node, Math.max(0, start));
    range.setEnd(node, Math.max(start + 1, end));
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    return true;
  }, selector);
  check(selected, `selection_${kind}_created`, selector);
  const menuButton = page.locator(`[data-xizong-mark-kind="${kind}"]`);
  await menuButton.waitFor({ state: 'visible' });
  if (domClick) await menuButton.evaluate((button) => button.click());
  else await menuButton.click();
}

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 }, acceptDownloads: true });
  const page = await context.newPage();

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) if (key.includes('xizong')) localStorage.removeItem(key);
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell'));

  const payload = JSON.parse((await page.locator('[data-xizong-learner-object-payload]').textContent()) || '{}');
  check(payload?.schema === 'kianos.xizong.learner_object.v1', 'learner_object_schema');
  check(Array.isArray(payload?.kps) && payload.kps.length >= 10, 'representative_has_real_kps', String(payload?.kps?.length || 0));
  check(Array.isArray(payload?.logicGroups) && payload.logicGroups.length >= 3, 'representative_has_logic_groups', String(payload?.logicGroups?.length || 0));
  check(await visibleStage(root) === 'block_learn', 'clean_state_starts_at_block_learn');

  const toggle = root.locator('[data-logic-map-toggle]');
  check(await toggle.count() === 1, 'logic_map_toggle_present');

  await root.locator('[data-stage-next="logic_group"]').click();
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-xizong-v6-block]');
    const active = [...(node?.querySelectorAll('[data-study-stage]') || [])].find((stage) => !stage.hasAttribute('hidden'));
    return ['kp_learn', 'source_contact'].includes(active?.getAttribute('data-study-stage') || '');
  });

  let stage = await visibleStage(root);
  check(['kp_learn', 'source_contact'].includes(stage), 'first_learning_enters_kp_companion', stage);
  check(await root.locator('[data-study-stage="ttsx_checkpoint"]').count() === 1, 'ttsx_checkpoint_surface_present');

  const learnCard = root.locator('[data-study-stage]:visible .xv6KpLearnCompanion[data-kp-id]');
  await learnCard.waitFor({ state: 'visible' });
  check(await learnCard.locator('[data-learner-kp-core]').isVisible(), 'learn_core_visible_by_default');
  check(await learnCard.locator('.xzKpLearnHeaderRight').count() === 1, 'learn_header_right_compact_owner');
  const locatorText = (await learnCard.locator('.xzKpLearnLocatorMini').innerText()).replace(/\s+/g, ' ');
  check(locatorText.includes('Lecture'), 'lecture_locator_in_top_right', locatorText);
  check(locatorText.includes('Outline'), 'outline_locator_in_top_right', locatorText);
  check(await learnCard.locator('.xzKpPacketButton').count() === 1, 'study_packet_entry_present');

  const logicDetail = root.locator('.xzLogicGroupDetail');
  await logicDetail.waitFor({ state: 'visible' });
  check(await logicDetail.locator('.xzLogicGroupGoal').count() === 1, 'logic_map_shows_group_goal');
  check(await logicDetail.locator('.xzLogicGroupClosure').count() === 1, 'logic_map_shows_group_closure');
  check(await logicDetail.locator('.xzLogicGroupKp > span').count() >= 1, 'logic_map_uses_real_kp_titles');

  const expandedGeometry = await root.evaluate((node) => {
    const layout = node.querySelector('[data-study-layout]');
    const left = node.querySelector('.portedStudyOutline')?.getBoundingClientRect();
    const main = node.querySelector('.portedStudyMain')?.getBoundingClientRect();
    const aux = node.querySelector('.portedStudyChain')?.getBoundingClientRect();
    return {
      collapsed: layout?.classList.contains('outline-collapsed') || false,
      left: left?.width || 0,
      main: main?.width || 0,
      aux: aux?.width || 0
    };
  });
  check(!expandedGeometry.collapsed, 'logic_map_expanded_by_default', JSON.stringify(expandedGeometry));
  check(expandedGeometry.left >= 215 && expandedGeometry.left <= 240, 'logic_map_mac_width', JSON.stringify(expandedGeometry));

  await toggle.click();
  await page.waitForFunction(() => document.querySelector('[data-study-layout]')?.classList.contains('outline-collapsed'));
  const collapsedGeometry = await root.evaluate((node) => {
    const left = node.querySelector('.portedStudyOutline')?.getBoundingClientRect();
    const main = node.querySelector('.portedStudyMain')?.getBoundingClientRect();
    return { left: left?.width || 0, main: main?.width || 0 };
  });
  check(collapsedGeometry.left < 4, 'logic_map_collapse_returns_left_width', JSON.stringify(collapsedGeometry));
  check(collapsedGeometry.main > expandedGeometry.main + 150, 'logic_map_collapse_gives_width_to_kp', JSON.stringify({ expandedGeometry, collapsedGeometry }));

  await toggle.click();
  await page.waitForFunction(() => !document.querySelector('[data-study-layout]')?.classList.contains('outline-collapsed'));

  const originalKpId = await learnCard.getAttribute('data-kp-id');
  const promptEdit = learnCard.locator('[data-kp-prompt-edit]');
  await promptEdit.click();
  const promptInput = learnCard.locator('[data-kp-prompt-input]');
  await promptInput.fill('QA override：请先自己恢复这一 KP 的核心关系。');
  await learnCard.locator('[data-kp-prompt-save]').click();
  check((await learnCard.locator('[data-kp-learn-prompt-copy]').innerText()).includes('QA override'), 'prompt_override_visible_in_learn');

  await selectTextAndMark(page, '[data-study-stage]:not([hidden]) [data-kp-learn-prompt-copy]', 'important');
  const objectId = await root.getAttribute('data-study-object');
  const personalKey = `kianos-xizong-personal-v1:${objectId}`;
  const promptMarks = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(promptMarks.some((row) => row.kind === 'important' && row.surface === 'PROMPT'), 'prompt_mark_persisted');

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.keyboard.press('Space');
  check(await learnCard.locator('[data-learner-kp-core]').isHidden(), 'space_hides_core');
  await page.keyboard.press('Space');
  check(await learnCard.locator('[data-learner-kp-core]').isVisible(), 'space_restores_core');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  const movedKpId = await root.locator('[data-study-stage]:visible .xv6KpLearnCompanion[data-kp-id]').getAttribute('data-kp-id');
  check(Boolean(movedKpId && movedKpId !== originalKpId), 'arrow_right_switches_kp', `${originalKpId}->${movedKpId}`);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(80);
  const returnedKpId = await root.locator('[data-study-stage]:visible .xv6KpLearnCompanion[data-kp-id]').getAttribute('data-kp-id');
  check(returnedKpId === originalKpId, 'arrow_left_returns_kp', returnedKpId || '');

  const maxPresses = payload.kps.length + 3;
  let presses = 0;
  while (['kp_learn', 'source_contact'].includes(await visibleStage(root)) && presses < maxPresses) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    presses += 1;
  }
  stage = await visibleStage(root);
  check(stage === 'kp_recall', 'enter_learning_advances_to_recall_after_real_kps', `stage=${stage};presses=${presses}`);
  check(await root.locator('[data-study-stage="ttsx_checkpoint"]').isHidden(), 'unbound_ttsx_fails_closed_without_fake_release');

  const studyKey = `kianos-xizong-astro-v2:${objectId}`;
  const studyState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), studyKey);
  check(Object.values(studyState?.learned || {}).filter(Boolean).length >= 1, 'enter_records_learned_state');
  check(Object.keys(studyState?.ttsxEvidence || {}).length === 0, 'unbound_ttsx_creates_no_fake_evidence');

  const recallCard = root.locator('[data-kp-recall-card]:not([hidden])');
  await recallCard.waitFor({ state: 'visible' });
  check(await recallCard.evaluate((node) => node.classList.contains('xzKpUnifiedCard')), 'recall_uses_same_kp_card_grammar');
  const recallTitle = (await recallCard.locator(':scope > header > h3').innerText()).trim();
  check(recallTitle.includes('KP') && recallTitle.length > 5, 'recall_keeps_real_kp_title', recallTitle);
  check((await recallCard.locator('[data-kp-learn-prompt-copy]').innerText()).includes('QA override'), 'recall_reuses_same_prompt_override');

  const recallFrontState = await recallCard.evaluate((node) => {
    const answer = node.querySelector('[data-kp-answer]');
    const reveal = node.querySelector('[data-kp-reveal]');
    const rating = node.querySelector('[data-kp-rating]');
    return {
      answerHiddenAttribute: answer?.hasAttribute('hidden') ?? null,
      answerDisplay: answer ? getComputedStyle(answer).display : null,
      revealHiddenAttribute: reveal?.hasAttribute('hidden') ?? null,
      revealDisplay: reveal ? getComputedStyle(reveal).display : null,
      ratingHiddenAttribute: rating?.hasAttribute('hidden') ?? null,
      ratingDisplay: rating ? getComputedStyle(rating).display : null,
      cardClass: node.className,
      activeElement: document.activeElement?.outerHTML?.slice(0, 180) || ''
    };
  });
  check(
    recallFrontState.answerHiddenAttribute === true && recallFrontState.answerDisplay === 'none',
    'recall_front_hides_core_only',
    JSON.stringify(recallFrontState)
  );
  check(await logicDetail.locator('.xzLogicGroupGoal').count() === 1, 'recall_keeps_logic_map_goal');
  check(await logicDetail.locator('.xzLogicGroupKp > span').count() >= 1, 'recall_keeps_logic_map_kp_titles');

  const aux = root.locator('[data-xizong-aux-surface]');
  await aux.waitFor({ state: 'visible' });
  const auxBefore = await aux.locator('[data-learner-asset]:visible').count();
  check(auxBefore > 0, 'recall_front_keeps_current_context', String(auxBefore));
  check((await root.getAttribute('data-aux-weight')) !== 'none', 'recall_front_context_has_width', await root.getAttribute('data-aux-weight') || '');
  const highlightVisibleOnRecall = await page.evaluate(() => !('highlights' in CSS) || CSS.highlights.has('xizong-important'));
  check(highlightVisibleOnRecall, 'prompt_mark_reapplied_on_recall');

  await page.screenshot({ path: path.join(auditDir, 'xizong-block-recall-front.png'), fullPage: false });

  await recallCard.locator('[data-kp-reveal]').click();
  await page.waitForTimeout(80);
  check(await recallCard.locator('[data-kp-answer]').isVisible(), 'reveal_opens_same_core');
  const auxAfter = await aux.locator('[data-learner-asset]:visible').count();
  check(auxAfter > 0, 'reveal_keeps_context_visible', String(auxAfter));

  await selectTextAndMark(page, '[data-kp-recall-card]:not([hidden]) [data-kp-learn-core] p', 'weak', { domClick: true });
  const allMarks = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(allMarks.some((row) => row.kind === 'weak' && row.surface === 'CORE'), 'core_mark_uses_same_private_state');

  check(await recallCard.locator('[data-kp-rating]').isVisible(), 'rating_appears_after_reveal');
  const currentRecallKpId = await recallCard.getAttribute('data-kp-id');
  await recallCard.locator('[data-rating="known"]').click();
  await page.waitForTimeout(150);
  const ratedState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), studyKey);
  check(ratedState?.ratings?.[currentRecallKpId] === 'known', 'rating_persists_real_recall_evidence', currentRecallKpId || '');

  const minType = await scanTypeFloor(root, 'a2_r1');
  await page.screenshot({ path: path.join(auditDir, 'xizong-block-kp-learn.png'), fullPage: false });

  // Visual-only Human Gate capture. This does not create or pretend a reviewed
  // Binding exists; functional assertions above remain fail-closed.
  await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    if (!root) return;
    root.querySelectorAll('[data-study-stage]').forEach((node) => { node.hidden = true; });
    const checkpoint = root.querySelector('[data-study-stage="ttsx_checkpoint"]');
    if (checkpoint instanceof HTMLElement) checkpoint.hidden = false;
  });
  await page.screenshot({ path: path.join(auditDir, 'xizong-block-ttsx-checkpoint-visual-only.png'), fullPage: false });

  // Corrupt/private state must never be able to manufacture a TTSX release when
  // the Current semantic Projection has no reviewed Boundary/Binding.
  await page.evaluate((key) => {
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({
      ...existing,
      stage: 'ttsx_checkpoint',
      pendingTtsx: {
        key: 'fake-unreviewed-binding',
        label: 'fake',
        checkpointIds: ['fake-unreviewed-binding']
      }
    }));
  }, studyKey);
  await page.reload({ waitUntil: 'networkidle' });
  const failClosedRoot = page.locator('[data-xizong-v6-block]');
  await failClosedRoot.waitFor({ state: 'visible' });
  check((await visibleStage(failClosedRoot)) !== 'ttsx_checkpoint', 'corrupt_unreviewed_ttsx_state_cannot_release_checkpoint');
  const failClosedState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), studyKey);
  check(!failClosedState?.pendingTtsx, 'corrupt_unreviewed_ttsx_pending_state_is_discarded');

  report.finished_at = new Date().toISOString();
  report.status = 'PASS';
  report.route = ROUTE;
  report.kp_count = payload.kps.length;
  report.logic_group_count = payload.logicGroups.length;
  report.min_visible_type_px = minType;
  report.learned_enter_presses = presses;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('XIZONG_BLOCK_WORKSPACE_PASS');
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
