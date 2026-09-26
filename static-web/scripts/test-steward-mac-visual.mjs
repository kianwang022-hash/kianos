import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4351;
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORT = { width: 1512, height: 982 };
const auditDir = path.resolve(process.cwd(), '.qa');
fs.mkdirSync(auditDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = {
  schema: 'kianos.steward.mac_visual.v1',
  evidence_class: 'MACOS_CHROMIUM_VISUAL_EVIDENCE_NOT_REAL_HUMAN_GATE',
  viewport: VIEWPORT,
  checks: []
};
const check = (condition, name, detail = '') => {
  if (!condition) throw new Error(`STEWARD_MAC_VISUAL_FAIL:${name}${detail ? ':' + detail : ''}`);
  report.checks.push({ name, pass: true, detail });
};

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});

let browser;
try {
  for (let i = 0; i < 120; i += 1) {
    try { if ((await fetch(`${BASE}/steward/`)).ok) break; } catch {}
    if (i === 119) throw new Error('STEWARD_MAC_VISUAL_SERVER_NOT_READY');
    await sleep(250);
  }

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai'
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/steward/`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-steward-workspace]').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');

  await page.evaluate(async () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;
    const studyDay = `${year}-${month}-${day}`;
    const at = (hour, minute) => Date.parse(
      `${studyDay}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`
    );
    const timerSchema = 'kianos.study-timer.v2';
    localStorage.setItem('kianos-study-timer-state-v2', JSON.stringify({
      schema: timerSchema,
      running: false,
      manualPaused: false,
      subject: 'xizong',
      context: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
      segmentStartedAt: null,
      lastSeenAt: Date.now(),
      revision: 1,
      updatedAt: Date.now()
    }));
    localStorage.setItem('kianos-study-timer-ledger-v2', JSON.stringify({
      schema: timerSchema,
      sessions: [
        {
          id: 'mac-xz',
          subject: 'xizong',
          context: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
          startedAt: at(8, 35),
          endedAt: at(10, 15),
          source: 'timer',
          excluded: false,
          edited: false
        },
        {
          id: 'mac-en',
          subject: 'english',
          context: { subject: 'english', route: 'test', detailKey: 'reading', detailLabel: 'Reading A' },
          startedAt: at(10, 30),
          endedAt: at(11, 5),
          source: 'timer',
          excluded: false,
          edited: false
        }
      ]
    }));
    localStorage.setItem('kianos-steward-reality-v1', JSON.stringify({
      schema: 'kianos.steward-reality.v1',
      revision: 1,
      events: [{
        id: 'mac-break',
        kind: 'BREAK',
        startedAt: at(10, 15),
        endedAt: at(10, 28),
        plannedRestMinutes: 15,
        methods: ['walk', 'water'],
        customMethod: '',
        note: '上午高负荷后短休息',
        preBreakContext: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
        reentry: { status: 'PARTIAL', note: '清醒一些，但还没完全恢复', at: at(10, 29) }
      }]
    }));

    const mod = await import('/src/lib/examChatPlan.mjs');
    const basis = mod.buildExamChatPlanBasis(localStorage, studyDay);
    mod.writeExamChatPlan(localStorage, {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: studyDay,
      generated_at: new Date().toISOString(),
      learner_evidence_basis: basis,
      subjects: {
        xizong: { target_minutes: 300, role: '主推进', note: '把高认知主线留给强窗口。', session_ref: null },
        english: { target_minutes: 100, role: '保连续', note: '安排到较低负荷窗口。', session_ref: null },
        politics: { target_minutes: 60, role: '低负荷推进', note: '', session_ref: null }
      },
      next_subject: 'xizong',
      attention: null,
      capacity: {
        state: 'REDUCED',
        summary: '上午高负荷后容量下降，但主线仍值得保护。',
        basis: '主观状态 + 学习表现 + 当前可用 Health 上下文',
        load: '西综高认知主块后出现明显恢复需求',
        action: '先恢复，再把高认知西综留给强窗口；英语和政治承接较低负荷时段。',
        recheck: '下一学习块的持续注意、处理速度和错误类型'
      },
      presentation: {
        today_tasks: [],
        week_reference: [],
        schedule_blocks: [
          { id: 'xz-am', subject: 'xizong', start: '08:30', end: '11:30', label: '西综高认知主块', detail: '强窗口' },
          { id: 'en-mid', subject: 'english', start: '12:10', end: '13:20', label: 'English', detail: '连续性 / 中负荷' },
          { id: 'xz-pm', subject: 'xizong', start: '14:00', end: '17:00', label: '西综主推进', detail: '强窗口' }
        ]
      }
    }, studyDay);
    window.dispatchEvent(new Event('kianos:control-command-applied'));
  });

  await page.locator('[data-steward-workspace]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);

  check(await page.evaluate(() => document.fonts.check('600 18px "PingFang SC"')), 'steward_pingfang_renderable');

  const typography = await page.locator('[data-steward-workspace]').evaluate((root) => {
    const rows = [...root.querySelectorAll('h1,h2,h3,p,span,strong,b,time,dt,dd,button')]
      .filter((node) => {
        const style = getComputedStyle(node);
        return (node.textContent || '').trim()
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && node.getClientRects().length > 0;
      })
      .map((node) => ({
        text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        size: parseFloat(getComputedStyle(node).fontSize || '0'),
        family: getComputedStyle(node).fontFamily,
        tracking: getComputedStyle(node).letterSpacing
      }));
    return {
      min: Math.min(...rows.map((row) => row.size)),
      families: [...new Set(rows.map((row) => row.family))],
      under15: rows.filter((row) => row.size < 14.99).slice(0, 20),
      chineseNegativeTracking: rows.filter((row) => /[\u3400-\u9fff]/.test(row.text) && String(row.tracking).startsWith('-')).slice(0, 20)
    };
  });
  check(typography.families.some((family) => family.includes('PingFang SC')), 'steward_pingfang_declared', JSON.stringify(typography.families));
  check(typography.under15.length === 0, 'steward_visible_type_floor_15', JSON.stringify(typography.under15));
  check(typography.chineseNegativeTracking.length === 0, 'steward_no_negative_chinese_tracking', JSON.stringify(typography.chineseNegativeTracking));

  await page.screenshot({ path: path.join(auditDir, 'steward-mac.png'), fullPage: false });

  const geometry = await page.evaluate(() => {
    const frame = document.querySelector('.stewardTodayFrame')?.getBoundingClientRect();
    const main = document.querySelector('.stewardTodayMain')?.getBoundingClientRect();
    const rail = document.querySelector('.stewardNowRail')?.getBoundingClientRect();
    const strategy = document.querySelector('[data-steward-capacity-section]')?.getBoundingClientRect();
    return {
      frameWidth: frame?.width || 0,
      mainWidth: main?.width || 0,
      railWidth: rail?.width || 0,
      strategyHeight: strategy?.height || 0,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  check(geometry.mainWidth >= 620, 'steward_main_work_width_preserved', JSON.stringify(geometry));
  check(geometry.railWidth <= 280, 'steward_strategy_rail_bounded', JSON.stringify(geometry));
  check(geometry.strategyHeight > 0 && geometry.strategyHeight < 330, 'steward_strategy_context_compact', JSON.stringify(geometry));
  check(geometry.overflow <= 1, 'steward_no_horizontal_overflow', JSON.stringify(geometry));

  const strategy = (await page.locator('[data-steward-capacity-section]').innerText()).replace(/\s+/g, ' ');
  check(strategy.includes('执行策略'), 'steward_work_first_heading', strategy);
  check(strategy.includes('西综高认知'), 'steward_load_visible', strategy);
  check(strategy.includes('部分恢复'), 'steward_reentry_visible', strategy);
  check(!/HRV|RHR|readiness|recovery score|恢复分|债务分|schema|payload|owner/i.test(strategy), 'steward_no_backend_or_raw_health_leak', strategy);

  const fullText = (await page.locator('[data-steward-workspace]').innerText()).replace(/\s+/g, ' ');
  for (const forbidden of ['Recovery Score', 'Readiness', '证据覆盖', 'canonical owner', 'payload', 'schema']) {
    check(!fullText.includes(forbidden), 'steward_no_frontstage_' + forbidden.replace(/\W+/g, '_'));
  }

  fs.writeFileSync(path.join(auditDir, 'steward-mac-visual.json'), JSON.stringify({ ...report, typography, geometry }, null, 2));
  console.log('PASS Steward Mac visual: work-first capacity loop + PingFang + bounded rail');
  await context.close();
} finally {
  try { await browser?.close(); } catch {}
  try {
    if (process.platform === 'win32') server.kill();
    else process.kill(-server.pid, 'SIGTERM');
  } catch { try { server.kill('SIGTERM'); } catch {} }
}
