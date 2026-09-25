import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

import { EXAM_PROFILE_KEY, emptyExamProfile } from '../src/lib/examOrchestrator.mjs';
import { EXAM_CHAT_PLAN_KEY, EXAM_CHAT_PLAN_SCHEMA } from '../src/lib/examChatPlan.mjs';
import { STUDY_TIMER_LEDGER_KEY, STUDY_TIMER_SCHEMA, STUDY_TIMER_STATE_KEY } from '../src/lib/studyTimer.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { politicsProductCatalog } from '../src/lib/productCatalog.mjs';
import { PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';

const PORT = 4346;
const BASE = `http://127.0.0.1:${PORT}`;
const DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const NOW = Date.now();
const VIEWPORT = { width: 1512, height: 982 };
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });

const block = loadXizongBlock('circulation', 'b02');
const production = buildXizongProductionBlock(block);
const kp = production.kpRecords[1] || production.kpRecords[0];
if (!kp) throw new Error('HOME_MAC_VISUAL_XIZONG_KP_MISSING');

const politicsCatalog = politicsProductCatalog('/');
const politicsQuestion = politicsCatalog.questions?.find((row) => row?.unitHref) || politicsCatalog.questions?.[0];

const profile = {
  ...emptyExamProfile(),
  capacityByDay: { [DAY]: 570 },
  defaultDailyMinutes: 570
};
const chatPlan = {
  schema: EXAM_CHAT_PLAN_SCHEMA,
  study_day: DAY,
  generated_at: new Date(NOW - 10 * 60 * 1000).toISOString(),
  subjects: {
    xizong: { target_minutes: 360, role: '主推进', note: '继续当前学习。', session_ref: null },
    english: { target_minutes: 120, role: '保连续', note: '完成一个完整英语任务。', session_ref: null },
    politics: { target_minutes: 90, role: '保连续', note: '保持一轮推进。', session_ref: null }
  },
  next_subject: 'xizong',
  attention: null,
  capacity: {
    state: 'REDUCED',
    summary: '上午高负荷后可用认知容量下降，保留高价值主线但降低无效硬顶。',
    basis: '当前主观状态 + 已记录学习表现 + 可用 Health 上下文',
    load: '高认知西综主块后出现明显恢复需求',
    action: '把最值钱的西综主线留在强窗口；恢复后再判断是否继续高负荷，英语连续性放到较低负荷窗口。',
    recheck: '下一学习块的持续注意、处理速度和错误类型'
  },
  presentation: {
    today_tasks: [],
    week_reference: [],
    schedule_blocks: [
      { id: 'xz-am', subject: 'xizong', start: '08:30', end: '11:30', label: '西综高认知主块', detail: '强窗口' },
      { id: 'en-mid', subject: 'english', start: '12:10', end: '13:20', label: 'English 连续性', detail: '中低负荷窗口' },
      { id: 'xz-pm', subject: 'xizong', start: '14:00', end: '17:00', label: '西综主推进', detail: '强窗口' },
      { id: 'pol-low', subject: 'politics', start: '19:00', end: '20:00', label: '政治连续性', detail: '较低负荷窗口' }
    ]
  }
};
const timerLedger = {
  schema: STUDY_TIMER_SCHEMA,
  sessions: [
    { id: 'xz', subject: 'xizong', context: { subject: 'xizong', route: 'xizong/circulation/b02/', detailKey: 'circulation/b02', detailLabel: '循环 B02' }, startedAt: NOW - 100 * 60 * 1000, endedAt: NOW - 60 * 60 * 1000, source: 'timer' },
    { id: 'en', subject: 'english', context: { subject: 'english', route: 'reading/', detailKey: 'reading-a', detailLabel: 'Reading A' }, startedAt: NOW - 60 * 60 * 1000, endedAt: NOW - 30 * 60 * 1000, source: 'timer' },
    { id: 'pol', subject: 'politics', context: { subject: 'politics', route: 'politics/practice/', detailKey: 'xiao1000', detailLabel: '肖1000' }, startedAt: NOW - 30 * 60 * 1000, endedAt: NOW, source: 'timer' }
  ]
};
const timerState = {
  schema: STUDY_TIMER_SCHEMA,
  running: false,
  manualPaused: true,
  subject: 'xizong',
  context: { subject: 'xizong', route: 'xizong/circulation/b02/', detailKey: 'circulation/b02', detailLabel: '循环 B02' },
  segmentStartedAt: null,
  lastSeenAt: NOW,
  revision: 1,
  updatedAt: NOW
};
const xizongLast = {
  systemId: block.systemId,
  systemTitle: block.systemTitle,
  systemCanonical: block.systemCanonicalId,
  blockSlug: block.slug,
  blockLabel: block.label,
  blockTitle: block.title,
  href: `/xizong/${block.systemId}/${block.slug}/`,
  observed_at: new Date(NOW).toISOString()
};
const xizongState = {
  schema: 'kianos.xizong.block-state.v2',
  stage: 'kp_recall',
  groupIndex: Math.max(0, production.logicGroups.findIndex((row) => row.groupId === kp.groupId)),
  kpIndex: Math.max(0, production.kpRecords.findIndex((row) => row.kpId === kp.kpId)),
  learned: { [kp.kpId]: true },
  ratings: { [kp.kpId]: 'fuzzy' },
  ttsxEvidence: {},
  ttsxAnnotations: {},
  pendingTtsx: null,
  sourceContactDone: true,
  sourceContactEvidence: [],
  blockRecallDone: false,
  completed: false
};

const report = {
  schema: 'kianos.home.mac_visual.v1',
  evidence_class: 'MACOS_CHROMIUM_VISUAL_EVIDENCE_NOT_REAL_LEARNER_U',
  viewport: VIEWPORT,
  checks: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`HOME_MAC_VISUAL_FAIL:${name}${detail ? ':' + detail : ''}`);
  report.checks.push({ name, pass: true, detail });
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(BASE)).ok) break; } catch {}
    if (i === 119) throw new Error('HOME_MAC_VISUAL_SERVER_NOT_READY');
    await sleep(250);
  }

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, locale: 'zh-CN', timezoneId: 'Asia/Shanghai' });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  await page.evaluate((seed) => {
    for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, JSON.stringify(value));
  }, {
    [EXAM_PROFILE_KEY]: profile,
    [STUDY_TIMER_STATE_KEY]: timerState,
    [STUDY_TIMER_LEDGER_KEY]: timerLedger,
    'kianos-xizong-last-location-v1': xizongLast,
    [`kianos-xizong-astro-v2:${block.objectId}`]: xizongState,
    ...(politicsQuestion ? {
      [PRACTICE_KEYS.last]: {
        href: politicsQuestion.unitHref,
        subject: politicsQuestion.subject,
        chapter: politicsQuestion.chapter,
        title: politicsQuestion.unitTitle || politicsQuestion.chapterTitle || '上次学习位置'
      }
    } : {})
  });
  await page.evaluate(async ({ key, plan, day }) => {
    const mod = await import('/src/lib/examChatPlan.mjs');
    plan.learner_evidence_basis = mod.buildExamChatPlanBasis(localStorage, day);
    localStorage.setItem(key, JSON.stringify(plan));
  }, { key: EXAM_CHAT_PLAN_KEY, plan: chatPlan, day: DAY });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-exam-home][data-ready="true"]').waitFor();
  await page.evaluate(() => document.fonts.ready);

  const typography = await page.locator('.productCanvas.surface-home').evaluate((root) => {
    const rows = [...root.querySelectorAll('h1,h2,h3,p,span,small,strong,b,a,button')]
      .filter((node) => {
        const style = getComputedStyle(node);
        return (node.textContent || '').trim()
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && node.getClientRects().length > 0;
      })
      .map((node) => ({
        text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        size: parseFloat(getComputedStyle(node).fontSize || '0'),
        weight: getComputedStyle(node).fontWeight,
        family: getComputedStyle(node).fontFamily,
        tracking: getComputedStyle(node).letterSpacing
      }));
    return {
      min: Math.min(...rows.map((row) => row.size)),
      families: [...new Set(rows.map((row) => row.family))],
      under16: rows.filter((row) => row.size < 15.99).slice(0, 20),
      chineseNegativeTracking: rows.filter((row) => /[\u3400-\u9fff]/.test(row.text) && String(row.tracking).startsWith('-')).slice(0, 20)
    };
  });
  check(typography.families.some((family) => family.includes('PingFang SC')), 'home_pingfang_declared', JSON.stringify(typography.families));
  check(await page.evaluate(() => document.fonts.check('600 18px "PingFang SC"')), 'home_pingfang_renderable');
  check(typography.under16.length === 0, 'home_visible_type_floor_16', JSON.stringify(typography.under16));
  check(typography.chineseNegativeTracking.length === 0, 'home_no_negative_chinese_tracking', JSON.stringify(typography.chineseNegativeTracking));

  const visibleText = await page.locator('main, [data-exam-home]').allInnerTexts();
  const combined = visibleText.join('\n');
  for (const forbidden of ['CONTINUE', 'SYSTEM GUIDE', 'BLOCK FRAMEWORK', 'KP RECALL', 'Chat 安排下一步', 'evidence', 'undefined']) {
    check(!combined.includes(forbidden), 'home_no_engineering_copy_' + forbidden.replace(/\W+/g, '_'));
  }
  check((await page.locator('[data-exam-next]').innerText()).startsWith('西综 · '), 'home_next_action_has_subject_label');

  const workStrategy = page.locator('[data-exam-work-strategy]');
  check(await workStrategy.isVisible(), 'home_capacity_work_strategy_visible');
  const workText = (await workStrategy.innerText()).replace(/\s+/g, ' ');
  check(workText.includes('容量降低'), 'home_capacity_state_plain_language', workText);
  check(workText.includes('西综主线'), 'home_capacity_changes_real_work', workText);
  check(!/HRV|RHR|readiness|recovery score|恢复分|债务分/i.test(workText), 'home_no_raw_health_or_score_leak', workText);
  const strategyGeometry = await workStrategy.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      width: box.width,
      height: box.height,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      borderLeftWidth: style.borderLeftWidth
    };
  });
  check(strategyGeometry.height < 150, 'home_work_strategy_compact', JSON.stringify(strategyGeometry));
  check(strategyGeometry.boxShadow === 'none', 'home_work_strategy_no_dashboard_shadow', JSON.stringify(strategyGeometry));
  check(parseFloat(strategyGeometry.borderLeftWidth) <= 2.5, 'home_work_strategy_thin_semantic_rule', JSON.stringify(strategyGeometry));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 1, 'home_no_horizontal_overflow', String(overflow));

  const scheduleText = (await page.locator('[data-exam-schedule-items]').innerText()).replace(/\s+/g, ' ');
  check(scheduleText.includes('西综高认知主块') && scheduleText.includes('强窗口'), 'home_capacity_places_high_load_in_strong_window', scheduleText);
  check(scheduleText.includes('English 连续性') && scheduleText.includes('中低负荷窗口'), 'home_capacity_moves_continuity_to_lower_load_window', scheduleText);
  check(scheduleText.includes('政治连续性') && scheduleText.includes('较低负荷窗口'), 'home_low_load_continuity_visible', scheduleText);

  check(await page.locator('.politicsTodayCard').isHidden(), 'home_no_nested_politics_today_dashboard');
  check(await page.locator('.politicsRecentCard').isHidden(), 'home_no_nested_politics_recent_dashboard');

  await page.screenshot({ path: path.join(auditDir, 'home-mac.png'), fullPage: false });
  fs.writeFileSync(path.join(auditDir, 'home-mac-visual.json'), JSON.stringify({ ...report, typography }, null, 2));
  console.log('PASS Home Mac visual: PingFang + readable typography + learner-facing first screen');
  await context.close();
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
