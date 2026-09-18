import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { politicsProductCatalog } from '../src/lib/productCatalog.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';
import { PRACTICE_KEYS as K } from '../src/lib/politicsPracticeState.mjs';

const PORT = 4341;
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORT = { width: 1512, height: 982 };
const reviewCatalog = politicsProductCatalog('/');
const reviewQuestions = [];
const reviewUnits = new Set();
for (const q of reviewCatalog.questions || []) {
  if (!q.unitKey || reviewUnits.has(q.unitKey)) continue;
  reviewQuestions.push(q);
  reviewUnits.add(q.unitKey);
  if (reviewQuestions.length === 3) break;
}
if (reviewQuestions.length < 3) throw new Error('POLITICS_REVIEW_VISUAL_FIXTURE_NEEDS_3_UNITS');
const practiceCatalog = buildPoliticsPracticeCatalogCurrent('/');
const practiceQuestion = practiceCatalog.questions.find((q) => q.id === 'X1000-MARX-S-001') || practiceCatalog.questions.find((q) => q.unitKey);
if (!practiceQuestion) throw new Error('POLITICS_PRACTICE_VISUAL_FIXTURE_MISSING');
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });

const report = {
  schema: 'kianos.politics.mac_visual.v2',
  evidence_class: 'MACOS_CHROMIUM_VISUAL_EVIDENCE_NOT_REAL_LEARNER_U',
  viewport: VIEWPORT,
  routes: {},
  checks: []
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`POLITICS_LEARN_MAC_VISUAL_FAIL:${name}${detail ? `:${detail}` : ''}`);
  report.checks.push({ name, pass: true, detail });
};

async function waitFor(route) {
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await fetch(`${BASE}${route}`);
      if (response.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error(`POLITICS_LEARN_MAC_SERVER_NOT_READY:${route}`);
}

async function visibleTypeFloor(page, rootSelector, label) {
  const result = await page.locator(rootSelector).evaluate((root) => {
    const selector = 'p,li,span,small,b,strong,label,button,summary,a,h1,h2,h3,h4';
    const rows = [...root.querySelectorAll(selector)]
      .filter((el) => {
        const text = (el.textContent || '').trim();
        const style = getComputedStyle(el);
        return text
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && el.getClientRects().length > 0;
      })
      .map((el) => ({
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        size: Number.parseFloat(getComputedStyle(el).fontSize || '0'),
        family: getComputedStyle(el).fontFamily
      }));
    return {
      min: rows.length ? Math.min(...rows.map((row) => row.size)) : null,
      failures: rows.filter((row) => row.size < 14.99).slice(0, 30),
      families: [...new Set(rows.map((row) => row.family))].slice(0, 12)
    };
  });
  check(result.failures.length === 0, `${label}_visible_type_floor_15`, JSON.stringify(result));
  check(result.families.some((family) => family.includes('PingFang SC')), `${label}_pingfang_declared`, JSON.stringify(result.families));
  return result;
}

async function activePoliticsNav(page) {
  return page.locator('[data-kianos-subject-bar="politics"] .kianosSubjectNav a.active').innerText();
}

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  await waitFor('/politics/');
  await waitFor('/politics/learn/');
  await waitFor('/politics/marxism/ch02/');
  await waitFor('/politics/review/');
  await waitFor('/politics/practice/');

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'zh-CN' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  const homeResponse = await page.goto(`${BASE}/politics/`, { waitUntil: 'domcontentloaded' });
  check(homeResponse?.ok(), 'home_http_ok', String(homeResponse?.status()));
  await page.evaluate(() => document.fonts.ready);
  check(await activePoliticsNav(page) === '总览', 'home_l2_active');
  await page.locator('[data-politics-home-v3]').waitFor({ state: 'visible' });
  check(await page.locator('.politicsHomeSubjects').count() === 0, 'home_does_not_duplicate_learn_navigation');
  check(await page.locator('.politicsChapterRows').count() === 0, 'home_has_no_chapter_directory');
  check(await page.locator('.politicsTodayCard').count() === 1, 'home_has_today_card');
  check(await page.locator('.politicsRecentCard').count() === 1, 'home_has_recent_card');
  const homeContinue = page.locator('[data-politics-continue]');
  check((await homeContinue.getAttribute('href') || '').includes('/politics/learn/'), 'home_clean_continue_routes_to_learn_index');
  check(await page.locator('[data-politics-handoff]').isHidden(), 'home_clean_handoff_quiet');
  const homeMetrics = await page.evaluate(() => {
    const root = document.querySelector('[data-politics-home-v3]');
    const tools = document.querySelector('[data-politics-home-tools]');
    const continueCard = document.querySelector('.politicsContinueCard');
    const todayCard = document.querySelector('.politicsTodayCard');
    const recentCard = document.querySelector('.politicsRecentCard');
    if (!root || !tools || !continueCard || !todayCard || !recentCard) return null;
    const rect = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    return {
      root: rect(root),
      tools: rect(tools),
      continueCard: rect(continueCard),
      todayCard: rect(todayCard),
      recentCard: rect(recentCard),
      toolColumns: getComputedStyle(tools).gridTemplateColumns
    };
  });
  check(Boolean(homeMetrics), 'home_geometry_present');
  check(homeMetrics.root.width >= 1100, 'home_uses_mac_width', JSON.stringify(homeMetrics));
  check(homeMetrics.toolColumns.split(' ').length >= 2, 'home_balanced_two_column_top', JSON.stringify(homeMetrics));
  check(homeMetrics.continueCard.width > homeMetrics.todayCard.width * 1.5, 'home_continue_is_primary', JSON.stringify(homeMetrics));
  check(homeMetrics.recentCard.width >= homeMetrics.root.width * 0.9, 'home_recent_uses_full_row', JSON.stringify(homeMetrics));
  const homeType = await visibleTypeFloor(page, '[data-politics-home-v3]', 'home');
  report.routes.home = { route: '/politics/', metrics: homeMetrics, type: homeType };
  await page.screenshot({ path: path.join(auditDir, 'politics-home-mac.png') });

  const learnResponse = await page.goto(`${BASE}/politics/learn/`, { waitUntil: 'domcontentloaded' });
  check(learnResponse?.ok(), 'learn_index_http_ok', String(learnResponse?.status()));
  await page.evaluate(() => document.fonts.ready);
  check(await activePoliticsNav(page) === '学习', 'learn_index_l2_active');
  check(await page.locator('[data-politics-learn-subject]').count() === 5, 'learn_index_five_subjects');
  const learnMetrics = await page.evaluate(() => {
    const canvas = document.querySelector('.productCanvas');
    const index = document.querySelector('.politicsLearnIndex');
    const grid = document.querySelector('.politicsLearnIndexGrid');
    const subjects = document.querySelector('.politicsLearnSubjects');
    const panel = document.querySelector('.politicsLearnPanel:not([hidden])');
    if (!canvas || !index || !grid || !subjects || !panel) return null;
    const rect = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, width: r.width, right: r.right };
    };
    return {
      canvas: rect(canvas),
      index: rect(index),
      grid: rect(grid),
      subjects: rect(subjects),
      panel: rect(panel),
      gridColumns: getComputedStyle(grid).gridTemplateColumns
    };
  });
  check(Boolean(learnMetrics), 'learn_index_geometry_present');
  check(learnMetrics.gridColumns.split(' ').length >= 2, 'learn_index_two_column_geometry', JSON.stringify(learnMetrics));
  const learnType = await visibleTypeFloor(page, '.politicsLearnIndex', 'learn_index');
  report.routes.learn_index = { route: '/politics/learn/', metrics: learnMetrics, type: learnType };
  await page.screenshot({ path: path.join(auditDir, 'politics-learn-index-mac.png') });
  fs.writeFileSync(path.join(auditDir, 'politics-learn-mac-visual.json'), JSON.stringify(report, null, 2));

  const reviewResponse = await page.goto(`${BASE}/politics/review/`, { waitUntil: 'domcontentloaded' });
  check(reviewResponse?.ok(), 'review_http_ok', String(reviewResponse?.status()));

  const reviewFixture = (() => {
    const outcomes = ['WRONG', 'UNCERTAIN', 'STABLE'];
    const units = {};
    const latestOutcome = {};
    const discussion = {};
    const notes = {};
    const causes = {};
    const evidence = [];
    reviewQuestions.forEach((q, index) => {
      const outcome = outcomes[index];
      units[q.unitKey] ||= { attempts: {} };
      units[q.unitKey].attempts[q.id] = {
        question_id: q.id,
        outcome,
        study_day: '2026-09-19',
        selected: outcome === 'WRONG' ? 'A' : q.answer
      };
      latestOutcome[q.id] = outcome;
      if (index === 2) discussion[q.id] = true;
      if (index === 0) notes[q.id] = '这里需要重新确认概念边界。';
      if (index === 1) causes[q.id] = '两个选项之间犹豫';
      evidence.push({
        subject: q.subject,
        chapter: q.chapter,
        unit_id: q.unitId,
        question_id: q.id,
        source: 'xiao1000',
        outcome,
        study_day: '2026-09-19',
        observed_at: `2026-09-19T10:0${index}:00.000Z`
      });
    });
    return { attempts: { units }, meta: { latestOutcome, discussion, notes, causes }, evidence };
  })();

  await page.evaluate(({ K, fixture }) => {
    localStorage.setItem(K.attempts, JSON.stringify(fixture.attempts));
    localStorage.setItem(K.meta, JSON.stringify(fixture.meta));
    localStorage.setItem(K.evidence, JSON.stringify(fixture.evidence));
  }, { K, fixture: reviewFixture });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-politics-review][data-ready="true"]').waitFor({ state: 'visible' });
  check(await activePoliticsNav(page) === '复习', 'review_l2_active');
  check(await page.locator('.reviewNavigation').count() === 0, 'review_has_no_duplicate_navigation');
  check(await page.locator('[data-review-action]').isVisible(), 'review_main_action_visible');
  check(await page.locator('.reviewGroup').count() >= 2, 'review_multiple_unit_groups_visible');
  check(await page.locator('.reviewQuestionRow').count() >= 3, 'review_question_rows_visible');
  const reviewMetrics = await page.evaluate(() => {
    const root = document.querySelector('[data-politics-review]');
    const strip = document.querySelector('.reviewActionStrip');
    const action = document.querySelector('[data-review-action]');
    const group = document.querySelector('.reviewGroup');
    if (!root || !strip || !action || !group) return null;
    const rect = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    };
    return { root: rect(root), strip: rect(strip), action: rect(action), firstGroup: rect(group) };
  });
  check(Boolean(reviewMetrics), 'review_geometry_present');
  check(reviewMetrics.root.width >= 1100, 'review_uses_mac_width', JSON.stringify(reviewMetrics));
  const reviewType = await visibleTypeFloor(page, '[data-politics-review]', 'review');
  report.routes.review = { route: '/politics/review/', metrics: reviewMetrics, type: reviewType };
  await page.screenshot({ path: path.join(auditDir, 'politics-review-mac.png') });

  const practiceResponse = await page.goto(`${BASE}/politics/practice/?question=${encodeURIComponent(practiceQuestion.id)}`, { waitUntil: 'domcontentloaded' });
  check(practiceResponse?.ok(), 'practice_http_ok', String(practiceResponse?.status()));
  await page.evaluate(() => document.fonts.ready);
  check(await activePoliticsNav(page) === '肖1000', 'practice_l2_active');
  await page.locator('[data-politics-practice]').waitFor({ state: 'visible' });
  await page.check('[data-learned-scope]');
  await page.click('[data-start-session]');
  await page.locator('[data-question-card]').waitFor({ state: 'visible' });
  check(await page.locator('[data-submitted-result]').isHidden(), 'practice_clean_result_hidden');
  check((await page.locator('[data-question-stem]').innerText()).trim().length > 0, 'practice_clean_stem_visible');
  check(await page.locator('[data-question-options] button').count() >= 2, 'practice_clean_options_visible');
  const practiceCleanType = await visibleTypeFloor(page, '[data-politics-practice]', 'practice_clean');
  const practiceCleanMetrics = await page.evaluate(() => {
    const root = document.querySelector('[data-politics-practice]');
    const card = document.querySelector('[data-question-card]');
    const options = document.querySelector('[data-question-options]');
    if (!root || !card || !options) return null;
    const rr = root.getBoundingClientRect(), cr = card.getBoundingClientRect();
    return {
      rootWidth: rr.width,
      cardWidth: cr.width,
      optionColumns: getComputedStyle(options).gridTemplateColumns
    };
  });
  check(Boolean(practiceCleanMetrics), 'practice_clean_geometry_present');
  check(practiceCleanMetrics.rootWidth >= 1100, 'practice_clean_uses_mac_width', JSON.stringify(practiceCleanMetrics));
  report.routes.practice_clean = { route: '/politics/practice/', metrics: practiceCleanMetrics, type: practiceCleanType };
  await page.screenshot({ path: path.join(auditDir, 'politics-practice-clean-mac.png') });

  for (const label of String(practiceQuestion.answer)) {
    await page.click(`[data-option="${label}"]`);
  }
  await page.click('[data-submit]');
  await page.locator('[data-submitted-result]').waitFor({ state: 'visible' });
  check(await page.locator('[data-question-card]').isHidden(), 'practice_result_clean_question_hidden');
  check((await page.locator('[data-takeaway]').innerText()).trim().length > 0, 'practice_result_takeaway_visible');
  check((await page.locator('[data-chat-explanation]').innerText()).trim().length > 0, 'practice_result_explanation_visible');
  const practiceResultMetrics = await page.evaluate(() => {
    const result = document.querySelector('[data-submitted-result]');
    const layout = document.querySelector('.politicsResultLayout');
    const summary = document.querySelector('.politicsResultSummaryPane');
    const knowledge = document.querySelector('.politicsKnowledgeReview');
    if (!result || !layout || !summary || !knowledge) return null;
    const r = result.getBoundingClientRect(), s = summary.getBoundingClientRect(), k = knowledge.getBoundingClientRect();
    return {
      resultWidth: r.width,
      resultColumns: getComputedStyle(layout).gridTemplateColumns,
      summaryWidth: s.width,
      knowledgeWidth: k.width
    };
  });
  check(Boolean(practiceResultMetrics), 'practice_result_geometry_present');
  check(practiceResultMetrics.resultColumns.split(' ').length >= 2, 'practice_result_two_column_geometry', JSON.stringify(practiceResultMetrics));
  check(practiceResultMetrics.knowledgeWidth > practiceResultMetrics.summaryWidth, 'practice_result_knowledge_remains_primary', JSON.stringify(practiceResultMetrics));
  const practiceResultType = await visibleTypeFloor(page, '[data-submitted-result]', 'practice_result');
  report.routes.practice_result = { route: '/politics/practice/', metrics: practiceResultMetrics, type: practiceResultType };
  await page.locator('[data-submitted-result]').evaluate((node) => window.scrollTo({ top: Math.max(0, node.getBoundingClientRect().top + window.scrollY - 118), behavior: 'auto' }));
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(auditDir, 'politics-practice-result-mac.png') });

  const chapterResponse = await page.goto(`${BASE}/politics/marxism/ch02/`, { waitUntil: 'domcontentloaded' });
  check(chapterResponse?.ok(), 'chapter_http_ok', String(chapterResponse?.status()));
  await page.evaluate(() => document.fonts.ready);
  check(await activePoliticsNav(page) === '学习', 'chapter_l2_active');
  await page.locator('[data-politics-runtime]').waitFor({ state: 'visible' });
  const firstUnit = page.locator('[data-politics-unit]').first();
  const firstUnitLink = page.locator('.politicsRail nav a[href="#unit-1"]');
  await firstUnitLink.waitFor({ state: 'visible' });
  await firstUnitLink.click();
  await firstUnit.waitFor({ state: 'visible' });
  const geometry = await page.evaluate(() => {
    const study = document.querySelector('.politicsStudy');
    const unit = document.querySelector('[data-politics-unit]');
    const rail = document.querySelector('.politicsRail');
    const companion = document.querySelector('.politicsUnitCompanion');
    if (!study || !unit || !rail || !companion) return null;
    const sr = study.getBoundingClientRect();
    const rr = rail.getBoundingClientRect();
    const ur = unit.getBoundingClientRect();
    const cr = companion.getBoundingClientRect();
    return {
      studyColumns: getComputedStyle(study).gridTemplateColumns,
      unitColumns: getComputedStyle(unit).gridTemplateColumns,
      studyWidth: sr.width,
      railWidth: rr.width,
      unitWidth: ur.width,
      companionWidth: cr.width
    };
  });
  check(Boolean(geometry), 'chapter_geometry_present');
  check(geometry.studyColumns.split(' ').length >= 2, 'chapter_left_rail_plus_main', JSON.stringify(geometry));
  check(geometry.unitColumns.split(' ').length >= 2, 'chapter_main_plus_companion', JSON.stringify(geometry));
  check(geometry.companionWidth >= 280, 'chapter_companion_has_real_width', JSON.stringify(geometry));

  const chapterType = await visibleTypeFloor(page, '[data-politics-runtime]', 'chapter_workspace');
  report.routes.chapter = { route: '/politics/marxism/ch02/', geometry, type: chapterType };

  await firstUnit.evaluate((node) => window.scrollTo({ top: Math.max(0, node.getBoundingClientRect().top + window.scrollY - 128), behavior: 'auto' }));
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(auditDir, 'politics-chapter-workspace-mac.png') });

  fs.writeFileSync(path.join(auditDir, 'politics-learn-mac-visual.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (browser) await browser.close();
  if (server.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch {
      try { server.kill('SIGTERM'); } catch {}
    }
  }
}
