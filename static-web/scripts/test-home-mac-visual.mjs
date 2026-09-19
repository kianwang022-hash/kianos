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
  attention: null
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
    [EXAM_CHAT_PLAN_KEY]: chatPlan,
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
