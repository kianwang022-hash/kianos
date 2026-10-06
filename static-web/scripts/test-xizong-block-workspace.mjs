import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4335;
const EXTERNAL_BASE = process.env.KIANOS_XIZONG_TEST_BASE_URL || '';
const BASE = EXTERNAL_BASE || `http://127.0.0.1:${PORT}`;
if (EXTERNAL_BASE) {
  const target = new URL(EXTERNAL_BASE);
  if (!['127.0.0.1', 'localhost'].includes(target.hostname) || target.port === '4321') {
    throw new Error('XIZONG_BLOCK_WORKSPACE_REQUIRES_ISOLATED_CANDIDATE_NOT_STABLE');
  }
}
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

const server = EXTERNAL_BASE ? null : spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
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
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(12000);

  const targetUrl = `${BASE}${ROUTE}`;
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active'
    && document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell')
  );
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      break;
    } catch (error) {
      if (attempt === 2 || !/ERR_ABORTED|interrupted by another navigation|frame was detached|navigation/i.test(String(error?.message || error))) throw error;
      await page.waitForTimeout(120);
    }
  }

  const root = page.locator('[data-xizong-v6-block]');
  await root.waitFor({ state: 'visible' });
  await page.waitForFunction(() =>
    document.hasFocus()
    && document.visibilityState === 'visible'
    && document.documentElement.dataset.learnerWriter === 'active'
    && document.querySelector('[data-xizong-v6-block]')?.classList.contains('xv6BlockWorkspaceShell')
  );
  // Candidate dev can HMR-reload the same URL on first compilation. Require the
  // active writer/shell to remain settled before geometry/state assertions.
  await page.waitForTimeout(220);

  const payload = JSON.parse((await page.locator('[data-xizong-learner-object-payload]').textContent()) || '{}');
  check(payload?.schema === 'kianos.xizong.learner_object.v1', 'learner_object_schema');
  check(Array.isArray(payload?.kps) && payload.kps.length >= 10, 'representative_has_real_kps', String(payload?.kps?.length || 0));
  check(Array.isArray(payload?.logicGroups) && payload.logicGroups.length >= 3, 'representative_has_logic_groups', String(payload?.logicGroups?.length || 0));
  check(await visibleStage(root) === 'block_learn', 'clean_state_starts_at_block_learn');

  const compactChrome = await page.evaluate(() => {
    const subjectBarNode = document.querySelector('.kianosSubjectBar');
    const headerNode = document.querySelector('[data-xizong-v6-block] .portedStudyHeader');
    const contextNode = headerNode?.querySelector('.portedStudyContextRow');
    const identityNode = headerNode?.querySelector('.portedStudyIdentity');
    const row = (node) => {
      if (!(node instanceof HTMLElement)) return null;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        height: rect.height,
        minHeight: style.minHeight,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        display: style.display,
        gridTemplateRows: style.gridTemplateRows
      };
    };
    return {
      subjectBarHeight: subjectBarNode?.getBoundingClientRect().height || 0,
      blockHeaderHeight: headerNode?.getBoundingClientRect().height || 0,
      header: row(headerNode),
      context: row(contextNode),
      identity: row(identityNode)
    };
  });
  check(compactChrome.subjectBarHeight > 0 && compactChrome.subjectBarHeight <= 48.5,
    'xizong_subject_strip_compact_height', JSON.stringify(compactChrome));
  check(compactChrome.blockHeaderHeight > 0 && compactChrome.blockHeaderHeight <= 86,
    'block_header_compact_height', JSON.stringify(compactChrome));
  await page.screenshot({ path: path.join(auditDir, 'xizong-block-compact-header.png'), fullPage: false });

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

  const previewButton = root.locator('[data-block-framework-preview-open]');
  await previewButton.waitFor({ state: 'visible' });
  const previewStateBefore = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const key = `kianos-xizong-astro-v2:${root?.getAttribute('data-study-object') || ''}`;
    return localStorage.getItem(key);
  });
  await previewButton.click();
  const previewDialog = root.locator('[data-block-framework-dialog]');
  await previewDialog.waitFor({ state: 'visible' });
  check((await previewDialog.innerText()).includes('只读回看'), 'block_framework_preview_is_explicitly_read_only');
  check((await previewDialog.innerText()).includes('这块现在抓什么'), 'block_framework_preview_contains_block_orientation');
  check(await visibleStage(root) === stage, 'block_framework_preview_does_not_change_visible_learning_stage', stage);
  const previewStateAfter = await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    const key = `kianos-xizong-astro-v2:${root?.getAttribute('data-study-object') || ''}`;
    return localStorage.getItem(key);
  });
  check(previewStateAfter === previewStateBefore, 'block_framework_preview_does_not_mutate_resume_or_evidence');
  await page.screenshot({ path: path.join(auditDir, 'xizong-block-framework-preview.png'), fullPage: false });
  await root.locator('[data-block-framework-preview-close]').click();
  await previewDialog.waitFor({ state: 'hidden' });

  const learnCard = root.locator('[data-study-stage]:visible .xv6KpLearnCompanion[data-kp-id]');
  await learnCard.waitFor({ state: 'visible' });
  check(await learnCard.locator('[data-learner-kp-core]').isVisible(), 'learn_core_visible_by_default');
  const activeKpHeader = root.locator('[data-study-active-kp]');
  await activeKpHeader.waitFor({ state: 'visible' });
  check(await learnCard.locator('.xv6KpLearnCompanionHeader').count() === 0, 'kp_identity_not_duplicated_inside_core_card');
  const learnCardId = await learnCard.getAttribute('data-kp-id');
  const locatorText = (await activeKpHeader.locator('.portedStudyActiveKpMeta').innerText()).replace(/\s+/g, ' ');
  check(locatorText.includes('讲义'), 'lecture_locator_in_center_header', locatorText);
  check(locatorText.includes('考纲'), 'outline_locator_in_center_header', locatorText);
  check(await learnCard.locator('.xzKpPacketButton').count() === 0, 'packet_transport_not_in_learning_header');
  check(await learnCard.locator('[data-kp-chat-handoff]').count() === 0, 'no_manual_chat_handoff_in_first_pass_mainline');
  check(await page.locator('[data-xizong-study-dock] [data-copy-study-packet]').count() === 1, 'typed_packet_return_owner_stays_available_backstage');
  const expectedKp = payload.kps.find((kp) => kp.identity.kpId === learnCardId);
  const activeHeaderText = (await activeKpHeader.innerText()).replace(/\s+/g, ' ');
  check(activeHeaderText.includes(expectedKp?.identity?.displayId || '') && activeHeaderText.includes(expectedKp?.identity?.title || ''), 'center_header_matches_current_kp_identity', activeHeaderText);
  if (expectedKp?.source?.locator) check(activeHeaderText.includes(`讲义 · ${expectedKp.source.locator}`), 'locator_matches_current_kp_owner', activeHeaderText);
  if (expectedKp?.outline?.locator) check(activeHeaderText.includes(`考纲 · ${expectedKp.outline.locator}`), 'outline_matches_current_kp_owner', activeHeaderText);
  const scrollState = async () => learnCard.evaluate((card) => {
    const core = card.querySelector('[data-learner-kp-core]');
    const main = card.closest('.portedStudyMain');
    const activeHeader = document.querySelector('[data-study-active-kp]');
    return {coreTop:core.scrollTop, coreHeight:core.clientHeight, contentHeight:core.scrollHeight, mainTop:main.scrollTop, headerY:activeHeader?.getBoundingClientRect().y || 0};
  });
  const scrollBefore = await scrollState();
  check(scrollBefore.contentHeight > scrollBefore.coreHeight + 20, 'long_core_is_bounded_not_whole_page_scroll');
  await learnCard.locator('[data-learner-kp-core]').hover();
  await page.mouse.wheel(0,400);
  await page.waitForTimeout(150);
  const scrollAfter = await scrollState();
  check(scrollAfter.coreTop > scrollBefore.coreTop && scrollAfter.mainTop === scrollBefore.mainTop && scrollAfter.headerY === scrollBefore.headerY, 'wheel_reads_core_without_losing_identity_or_locator');
  await learnCard.locator('[data-learner-kp-core]').evaluate((node) => { node.scrollTop = 0; });
  await page.setViewportSize({width:1180,height:820});
  // The shared shell animates its rail collapse on resize. Measure the settled view.
  await page.waitForTimeout(350);
  const ipad = await learnCard.evaluate((card) => {
    const core=card.querySelector('[data-learner-kp-core]');
    const done=document.querySelector('[data-source-contact-done]');
    const r=done.getBoundingClientRect();
    const at=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {coreHeight:core.clientHeight,buttonBottom:r.bottom,buttonHit:at===done||done.contains(at),overflow:document.documentElement.scrollWidth>innerWidth+2,buttonRect:r.toJSON(),hitElement:at?.outerHTML.slice(0,1200)||null,footerRect:done.closest('footer')?.getBoundingClientRect().toJSON()};
  });
  await page.screenshot({path:path.join(auditDir,'xizong-block-ipad-reading.png'),fullPage:false});
  check(ipad.coreHeight>=200, 'ipad_core_not_squeezed_by_persistent_chrome', JSON.stringify(ipad));
  check(ipad.buttonBottom<=820 && ipad.buttonHit && !ipad.overflow, 'ipad_source_confirmation_reachable_without_scroll_or_overlap', JSON.stringify(ipad));
  await page.setViewportSize({width:1512,height:982});
  await page.waitForTimeout(350);

  // The typed packet/Return owner remains available to the loop without a
  // learner-facing per-KP Chat ceremony.
  await page.evaluate(() => {
    window.__qaCopiedPacket='';
    navigator.clipboard.writeText=async (text) => {window.__qaCopiedPacket=text;};
  });
  await page.locator('[data-xizong-study-dock] [data-copy-study-packet]').evaluate((node) => node.click());
  await page.waitForFunction(() => Boolean(window.__qaCopiedPacket));
  const exported=await page.evaluate(()=>window.__qaCopiedPacket);
  check(exported.includes(learnCardId) && exported.includes('return'), 'backstage_packet_owner_carries_current_kp_and_return_contract');


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
  check(expandedGeometry.left >= 280 && expandedGeometry.left <= 305, 'logic_map_mac_width', JSON.stringify(expandedGeometry));

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
  const studyKey = `kianos-xizong-astro-v2:${objectId}`;
  const promptMarks = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(promptMarks.some((row) => row.kind === 'important' && row.surface === 'PROMPT'), 'prompt_mark_persisted');

  await selectTextAndMark(page, '[data-study-stage]:not([hidden]) [data-kp-learn-prompt-copy]', 'important');
  const promptMarksAfterToggle = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(!promptMarksAfterToggle.some((row) => row.kind === 'important' && row.surface === 'PROMPT'), 'important_mark_same_click_cancels');
  const promptHighlightCleared = await page.evaluate(() => !('highlights' in CSS) || !CSS.highlights.has('xizong-important'));
  check(promptHighlightCleared, 'important_highlight_removed_after_toggle');
  await selectTextAndMark(page, '[data-study-stage]:not([hidden]) [data-kp-learn-prompt-copy]', 'important');
  const promptMarksRestored = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(promptMarksRestored.some((row) => row.kind === 'important' && row.surface === 'PROMPT'), 'important_mark_can_be_added_again');

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.keyboard.press('Space');
  check(await learnCard.locator('[data-learner-kp-core]').isHidden(), 'space_hides_core');
  await page.keyboard.press('Space');
  check(await learnCard.locator('[data-learner-kp-core]').isVisible(), 'space_restores_core');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  const movedCard = root.locator('[data-study-stage]:visible .xv6KpLearnCompanion[data-kp-id]');
  const movedKpId = await movedCard.getAttribute('data-kp-id');
  check(Boolean(movedKpId && movedKpId !== originalKpId), 'arrow_right_switches_kp', `${originalKpId}->${movedKpId}`);
  const movedNativePosition = await page.evaluate(({ key, kpId }) => {
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    const payload = JSON.parse(document.querySelector('[data-xizong-learner-object-payload]')?.textContent || '{}');
    const index = (payload.kps || []).findIndex((kp) => kp?.identity?.kpId === kpId);
    return {
      index,
      storedIndex: state.kpIndex,
      mapCurrent: document.querySelector('[data-study-group-rail] .xzLogicGroupKp.current')?.textContent?.trim() || ''
    };
  }, { key: studyKey, kpId: movedKpId });
  check(movedNativePosition.index >= 0 && movedNativePosition.storedIndex === movedNativePosition.index,
    'kp_learn_switch_updates_native_kp_index', JSON.stringify(movedNativePosition));
  check(movedNativePosition.mapCurrent.includes(payload.kps[movedNativePosition.index]?.identity?.displayId || ''),
    'kp_learn_switch_updates_left_logic_map', JSON.stringify(movedNativePosition));
  await page.keyboard.press('Space');
  check(await movedCard.locator('[data-learner-kp-core]').isHidden(), 'space_hides_core_after_kp_switch');
  await page.keyboard.press('Space');
  check(await movedCard.locator('[data-learner-kp-core]').isVisible(), 'space_restores_core_after_kp_switch');
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

  await selectTextAndMark(page, '[data-kp-recall-card]:not([hidden]) [data-kp-learn-core] p', 'weak', { domClick: true });
  const weakMarksAfterToggle = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.values(value?.kp || {}).flatMap((row) => Array.isArray(row?.marks) ? row.marks : []);
  }, personalKey);
  check(!weakMarksAfterToggle.some((row) => row.kind === 'weak' && row.surface === 'CORE'), 'weak_mark_same_click_cancels');
  const weakHighlightCleared = await page.evaluate(() => !('highlights' in CSS) || !CSS.highlights.has('xizong-weak'));
  check(weakHighlightCleared, 'weak_highlight_removed_after_toggle');

  check(await recallCard.locator('[data-kp-rating]').isVisible(), 'rating_appears_after_reveal');
  const currentRecallKpId = await recallCard.getAttribute('data-kp-id');
  await recallCard.locator('[data-rating="known"]').click();
  await page.waitForTimeout(150);
  const ratedState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), studyKey);
  check(ratedState?.ratings?.[currentRecallKpId] === 'known', 'rating_persists_real_recall_evidence', currentRecallKpId || '');

  const minType = await scanTypeFloor(root, 'a2_r1');
  const blockTypography = await root.evaluate((node) => ({
    fontFamily: getComputedStyle(node).fontFamily,
    bodySize: getComputedStyle(node).fontSize
  }));
  report.block_typography = blockTypography;
  if (process.platform === 'darwin') {
    check(String(blockTypography.fontFamily || '').includes('PingFang SC'), 'mac_block_uses_pingfang_sc', blockTypography.fontFamily || '');
  }
  await page.screenshot({ path: path.join(auditDir, 'xizong-block-kp-learn.png'), fullPage: false });

  // Visual-only Human Gate capture. Current has no reviewed TTSX Binding owner,
  // so the DOM is populated only for visual inspection using the exact legacy
  // interaction grammar. Functional assertions above remain fail-closed.
  await page.evaluate(() => {
    const root = document.querySelector('[data-xizong-v6-block]');
    if (!root) return;
    root.querySelectorAll('[data-study-stage]').forEach((node) => { node.hidden = true; });
    const checkpoint = root.querySelector('[data-study-stage="ttsx_checkpoint"]');
    if (!(checkpoint instanceof HTMLElement)) return;
    checkpoint.hidden = false;

    const progress = checkpoint.querySelector('[data-ttsx-progress]');
    if (progress) progress.textContent = '9 道';
    const meta = checkpoint.querySelector('[data-ttsx-meta]');
    if (meta) meta.textContent = '9 道 · 每题都可以单独「+写一句」，也可以一题都不记。';
    const boundary = checkpoint.querySelector('[data-ttsx-boundary-label]');
    if (boundary) boundary.textContent = '四瓣膜病：时相 + 杂音形态';
    const pageLabel = checkpoint.querySelector('[data-ttsx-page-label]');
    if (pageLabel) pageLabel.textContent = '生理 P111–122 · 题目 P120–121 · 回 MarginNote 原位置核对。';
    const empty = checkpoint.querySelector('[data-ttsx-empty]');
    if (empty instanceof HTMLElement) empty.hidden = true;

    const rows = [
      ['2013N7A','心室肌收缩的后负荷是','生理 P120'],
      ['2014N6A','心率过快时，心输出量减少的主要原因是','生理 P120'],
      ['2015N6A','心室功能减退病人代偿期射血分数下降的原因是','生理 P120'],
      ['2017N5A','一个心动周期中，主动脉瓣开始关闭的瞬间是','生理 P120'],
      ['2021N5A','心室压力-容积环向右扩大时的判断','生理 P120'],
      ['2022N5A','心动周期过程中，主动脉瓣关闭的时间是','生理 P121'],
      ['2023N5A','在一个心动周期里，第一心音出现在','生理 P121'],
      ['2025N6','题干请回 MarginNote 查看','生理 P121'],
      ['2025N137','题干请回 MarginNote 查看','生理 P121']
    ];
    const list = checkpoint.querySelector('[data-ttsx-question-list]');
    if (!(list instanceof HTMLElement)) return;
    list.replaceChildren();
    rows.forEach(([id,title,page]) => {
      const row = document.createElement('section');
      row.className = 'xv6TtsxQuestionRow';
      const strong = document.createElement('strong');
      strong.className = 'xv6TtsxQuestionId';
      strong.textContent = id;
      const p = document.createElement('p');
      p.textContent = title;
      const span = document.createElement('span');
      span.className = 'xv6TtsxQuestionPage';
      span.textContent = page;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'xv6TtsxWrite';
      button.textContent = '+写一句';
      row.append(strong,p,span,button);
      list.append(row);
    });
  });
  check(await root.locator('[data-study-stage="ttsx_checkpoint"] .xv6TtsxQuestionRow').count() === 9, 'ttsx_visual_candidate_has_multi_question_list');
  check(await root.locator('[data-study-stage="ttsx_checkpoint"] .xv6TtsxWrite').count() === 9, 'ttsx_visual_candidate_has_per_question_note_actions');
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
  // KianOS Current/runtime performs periodic background polling, so networkidle is
  // no longer a valid page-readiness signal. The learner surface itself is the gate.
  await page.reload({ waitUntil: 'domcontentloaded' });
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
  if (server) {
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
}
