import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4342;
const BASE = `http://127.0.0.1:${PORT}`;
const auditDir = path.resolve(process.cwd(), '../steward-ui-audit');
fs.mkdirSync(auditDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const check = (condition, code, detail = '') => {
  if (!condition) throw new Error(`STEWARD_UI_FAIL:${code}${detail ? ':' + detail : ''}`);
};

async function waitForServer() {
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(`${BASE}/steward/`);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error('STEWARD_UI_DEV_SERVER_NOT_READY');
}

async function stopServer(server) {
  if (!server) return;
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch {}
    } else {
      try { server.kill('SIGTERM'); } catch {}
    }
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), sleep(1000)]);
  }
  if (server.exitCode === null) {
    if (process.platform !== 'win32' && server.pid) {
      try { process.kill(-server.pid, 'SIGKILL'); } catch {}
    } else {
      try { server.kill('SIGKILL'); } catch {}
    }
  }
}

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: process.cwd(),
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32'
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1512, height: 820 } });
    await context.addInitScript(() => {
      const now = Date.now();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date(now));
      const year = parts.find((part) => part.type === 'year')?.value;
      const month = parts.find((part) => part.type === 'month')?.value;
      const day = parts.find((part) => part.type === 'day')?.value;
      const studyDay = `${year}-${month}-${day}`;
      const atShanghai = (hour, minute) => Date.parse(
        `${studyDay}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`
      );
      const todayXizongStart = atShanghai(9, 0);
      const todayXizongEnd = atShanghai(10, 0);
      const todayEnglishStart = atShanghai(10, 15);
      const todayEnglishEnd = atShanghai(10, 45);
      const state = {
        schema: 'kianos.study-timer.v2',
        running: false,
        manualPaused: false,
        subject: 'xizong',
        context: { subject: 'xizong', route: 'test', detailKey: 'test', detailLabel: '呼吸系统' },
        segmentStartedAt: null,
        lastSeenAt: now,
        revision: 1,
        updatedAt: now
      };
      const ledger = {
        schema: 'kianos.study-timer.v2',
        sessions: [
          {
            id: 'steward-test-prev-xz',
            subject: 'xizong',
            context: { subject: 'xizong', route: 'test', detailKey: 'cardio', detailLabel: '循环系统' },
            startedAt: todayXizongStart - 24 * 60 * 60 * 1000,
            endedAt: todayXizongEnd - 24 * 60 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-prev2-pol',
            subject: 'politics',
            context: { subject: 'politics', route: 'test', detailKey: 'mainline', detailLabel: '一轮主线' },
            startedAt: todayEnglishStart - 48 * 60 * 60 * 1000,
            endedAt: todayEnglishEnd - 48 * 60 * 60 * 1000,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-xz',
            subject: 'xizong',
            context: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
            startedAt: todayXizongStart,
            endedAt: todayXizongEnd,
            source: 'timer',
            excluded: false,
            edited: false
          },
          {
            id: 'steward-test-en',
            subject: 'english',
            context: { subject: 'english', route: 'test', detailKey: 'reading', detailLabel: 'Reading A' },
            startedAt: todayEnglishStart,
            endedAt: todayEnglishEnd,
            source: 'timer',
            excluded: false,
            edited: false
          }
        ]
      };
      localStorage.setItem('kianos-study-timer-state-v2', JSON.stringify(state));
      localStorage.setItem('kianos-study-timer-ledger-v2', JSON.stringify(ledger));
      localStorage.setItem('kianos-steward-reality-v1', JSON.stringify({
        schema: 'kianos.steward-reality.v1',
        revision: 1,
        events: [{
          id: 'steward-test-break',
          kind: 'BREAK',
          startedAt: atShanghai(11, 0),
          endedAt: atShanghai(11, 10),
          plannedRestMinutes: 10,
          methods: ['walk', 'water'],
          customMethod: '',
          note: '午前短休息',
          preBreakContext: { subject: 'xizong', route: 'test', detailKey: 'respiratory', detailLabel: '呼吸系统' },
          reentry: { status: 'PARTIAL', note: '清醒一些', at: atShanghai(11, 11) }
        }]
      }));
    });

    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(String(error?.stack || error?.message || error)));
    await page.goto(`${BASE}/steward/`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-steward-workspace]').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.documentElement.dataset.learnerWriter === 'active');

    const capacityDay = await page.evaluate(() => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date());
      return `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}-${parts.find((part) => part.type === 'day')?.value}`;
    });
    await page.evaluate(async (studyDay) => {
      const mod = await import('/src/lib/examChatPlan.mjs');
      const basis = mod.buildExamChatPlanBasis(localStorage, studyDay);
      mod.writeExamChatPlan(localStorage, {
        schema: 'kianos.exam.chat-plan.v1',
        study_day: studyDay,
        generated_at: new Date().toISOString(),
        learner_evidence_basis: basis,
        subjects: {
          xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: null },
          english: null,
          politics: null
        },
        next_subject: 'xizong',
        attention: null,
        capacity: {
          state: 'REDUCED',
          summary: '上午高负荷后可用认知容量下降，但仍可继续推进。',
          basis: '主观状态 + 学习表现 + 当前可用 Health 上下文',
          load: '西综高负荷主块后出现恢复需求',
          action: '先做一次足量低输入恢复，再回到当前主线',
          recheck: '看下一学习块是否恢复持续注意和处理速度'
        },
        presentation: {
          today_tasks: [],
          week_reference: [],
          schedule_blocks: [
            { id: 'steward-xz-am', subject: 'xizong', start: '08:30', end: '11:30', label: '西综高认知主块', detail: '强窗口' },
            { id: 'steward-en-mid', subject: 'english', start: '12:10', end: '13:20', label: 'English 连续性', detail: '中低负荷窗口' }
          ],
          nutrition: {
            owner_ref: 'kianwang022-hash/kian-personal-os/health/personal-day/NUTRITION.md',
            target_label: '目标 2200–2450 kcal · P 150–175g',
            active_meal_id: 'z02',
            foods: [
              { id: 'yogurt', label: '高蛋白 Greek yogurt', unit: '盒', grams_per_unit: 300, recommended_amount: 1, note: '300g/盒', nutrition: { basis: 'PER_100G', kcal: 56.9, protein_g: 10, carb_g: 4, fat_g: 0 } },
              { id: 'rye', label: '黑麦片', unit: 'g', recommended_amount: 50, nutrition: { basis: 'PER_100G', kcal: 344.9, protein_g: 13, carb_g: 63.2, fat_g: 1.6 } },
              { id: 'blueberry', label: '蓝莓', unit: 'g', recommended_amount: 120, nutrition: { basis: 'PER_100G', kcal: 57, protein_g: .7, carb_g: 14.5, fat_g: .3 } },
              { id: 'nuts', label: '混合坚果', unit: '小包', grams_per_unit: 12, recommended_amount: 1, note: '12g/小包', nutrition: { basis: 'PER_100G', kcal: 600, protein_g: 18, carb_g: 20, fat_g: 52 } },
              { id: 'salmon', label: '三文鱼', unit: 'g', recommended_amount: 200, nutrition: { basis: 'PER_100G', kcal: 208, protein_g: 20, carb_g: 0, fat_g: 13 } },
              { id: 'shrimp', label: '北极甜虾', unit: 'g', recommended_amount: 170, nutrition: { basis: 'PER_100G', kcal: 74, protein_g: 17.1, carb_g: 1, fat_g: 0 } }
            ],
            meals: [
              { id: 'b01', label: 'B01 · 熟悉早餐', note: '酸奶 + 黑麦 + 蓝莓 + 少量坚果', items: [{ food_id: 'yogurt', amount: 1 }, { food_id: 'rye', amount: 50 }, { food_id: 'blueberry', amount: 120 }, { food_id: 'nuts', amount: 1 }] },
              { id: 'z02', label: 'Z02 · 三文鱼午餐', note: '饱腹 / 训练支持', items: [{ food_id: 'salmon', amount: 200 }, { food_id: 'rye', amount: 50 }, { food_id: 'yogurt', amount: 1 }] },
              { id: 'z03', label: 'Z03 · 甜虾午餐', note: '更轻的午餐候选', items: [{ food_id: 'shrimp', amount: 170 }, { food_id: 'rye', amount: 50 }, { food_id: 'yogurt', amount: 1 }] }
            ],
            topup_pool: [
              { food_id: 'yogurt', amount: 1, role: '补蛋白' },
              { food_id: 'rye', amount: 30, role: '补碳水' },
              { food_id: 'nuts', amount: 1, role: '补脂肪' }
            ],
            quick_add: [
              { food_id: 'yogurt', amount: 1 },
              { food_id: 'rye', amount: 50 },
              { food_id: 'blueberry', amount: 120 },
              { food_id: 'nuts', amount: 1 },
              { food_id: 'salmon', amount: 200 },
              { food_id: 'shrimp', amount: 170 }
            ]
          },
          training: {
            owner_ref: 'kianwang022-hash/kian-personal-os/health/personal-day/TRAINING.md',
            session_id: 'strength-reentry-a',
            title: '全身力量',
            duration_label: '3 个动作 · 约 25–30 分钟',
            exercises: [
              { id: 'KN01', label: 'Smith squat', note: '下肢主力 · 2 × 6–8 · RPE 6–7', prescription: '70 kg × 8', load_value: 70, load_unit: 'kg', reps_value: 8, reps_unit: 'reps', rpe: 6, alternatives: [{ id: 'KN02', label: 'Goblet squat', note: '低疲劳替换', prescription: '12 reps · RPE 6', reps_value: 12, reps_unit: 'reps', rpe: 6 }] },
              { id: 'PR01', label: 'Smith flat bench press', note: '水平推 · 2 × 6–8 · RPE 6–7', prescription: '60 kg × 8', load_value: 60, load_unit: 'kg', reps_value: 8, reps_unit: 'reps', rpe: 6, alternatives: [{ id: 'PR02', label: 'DB flat bench press', note: '哑铃替换', prescription: '10 reps · RPE 6', reps_value: 10, reps_unit: 'reps', rpe: 6 }] },
              { id: 'PU03', label: 'One-arm cable row', note: '水平拉 · 2 × 10–14 / side', prescription: '5 档 × 12', load_value: 5, load_unit: '档', reps_value: 12, reps_unit: 'reps', rpe: 7, alternatives: [{ id: 'PU05', label: 'One-arm DB row', note: '低设置摩擦替换', prescription: '12 reps / side', reps_value: 12, reps_unit: 'reps', rpe: 7 }] }
            ]
          }
        }
      }, studyDay);
      window.dispatchEvent(new Event('kianos:control-command-applied'));
    }, capacityDay);

    const stewardImplementationSource = [
      fs.readFileSync(path.resolve(process.cwd(), 'src/pages/steward/index.astro'), 'utf8'),
      fs.readFileSync(path.resolve(process.cwd(), 'src/lib/stewardWorkspaceClient.mjs'), 'utf8')
    ].join('\n');
    check(!/Z02|KN01|PR01|PU03|Smith squat|三文鱼午餐/.test(stewardImplementationSource), 'personal_semantics_must_arrive_via_plan_projection');

    check(await page.locator('[data-kianos-global-rail]').isVisible(), 'l1_missing');
    check((await page.locator('.kianosRailItem.active').textContent())?.trim() === 'Steward', 'l1_active');
    check(await page.locator('[data-kianos-subject-bar]').count() === 0, 'invented_l2');

    const dock = page.locator('[data-study-timer-dock]');
    await dock.waitFor({ state: 'visible' });
    const dockSubject = String(await dock.locator('[data-study-timer-subject]').textContent() || '').trim();
    check(dockSubject.includes('西综') && dockSubject.includes('呼吸系统'), 'dock_native_detail', dockSubject);
    const todayHref = await dock.locator('[data-study-timer-today]').getAttribute('href');
    check(Boolean(todayHref && todayHref.endsWith('/steward/')), 'dock_today_route', String(todayHref));
    for (const selector of ['[data-study-timer-subject]', '[data-study-timer-pause]', '[data-study-timer-today]']) {
      const size = Number.parseFloat(await dock.locator(selector).evaluate((node) => getComputedStyle(node).fontSize));
      check(size >= 15, 'dock_text_below_floor', `${selector}:${size}`);
    }

    check(await page.locator('[data-steward-view="today"]').getAttribute('class') === 'active', 'today_default');
    check(await page.locator('[data-steward-mode="schedule"]').getAttribute('class') === 'active', 'schedule_default');
    check(await page.locator('.stewardActualBlock').count() >= 1, 'today_actual_blocks');
    check(await page.locator('.stewardActualBlock.withPlan').count() >= 1, 'today_actual_plan_trace');
    const actualTraceWidth = await page.locator('.stewardActualBlock.withPlan').first().evaluate((node) => node.getBoundingClientRect().width);
    check(actualTraceWidth <= 12, 'today_actual_trace_is_quiet', String(actualTraceWidth));
    check(await page.locator('.stewardPlanBlock').count() >= 2, 'today_plan_blocks_from_canonical_chat_plan');
    const planText = (await page.locator('[data-steward-timeline]').innerText()).replace(/\s+/g, ' ');
    check(planText.includes('西综高认知主块') && planText.includes('English 连续性'), 'today_plan_labels_visible', planText);
    check(!planText.includes('今天还没有安排'), 'today_plan_must_not_fall_back_to_empty', planText);
    const realityText = await page.locator('[data-steward-reality]').innerText();
    check(realityText.includes('休息 10m'), 'today_break_reality_visible', realityText);
    check(realityText.includes('部分恢复'), 'today_reentry_reality_visible', realityText);
    check(!/readiness|恢复分|债务分|recovery score/i.test(realityText), 'today_recovery_has_no_invented_score', realityText);

    const capacitySection = page.locator('[data-steward-capacity-section]');
    check(await capacitySection.isVisible(), 'today_capacity_loop_visible');
    check((await page.locator('[data-steward-capacity-state]').textContent())?.trim() === '降低', 'today_capacity_state');
    check((await page.locator('[data-steward-capacity-summary]').textContent())?.includes('认知容量下降'), 'today_capacity_summary');
    check((await page.locator('[data-steward-capacity-load]').textContent())?.includes('西综高负荷'), 'today_capacity_load');
    check((await page.locator('[data-steward-capacity-action]').textContent())?.includes('低输入恢复'), 'today_capacity_action');
    check((await page.locator('[data-steward-capacity-recheck]').textContent())?.includes('下一学习块'), 'today_capacity_recheck');
    check((await page.locator('[data-steward-capacity-recovery]').textContent())?.includes('部分恢复'), 'today_capacity_recovery_result');
    check(!/readiness|恢复分|债务分|recovery score/i.test(await capacitySection.innerText()), 'today_capacity_has_no_invented_score');

    check(await page.locator('[data-steward-task-section]').isHidden(), 'empty_task_region_hidden');

    const visibleToday = await page.locator('[data-steward-view-panel].active').getAttribute('data-steward-view-panel');
    check(visibleToday === 'today', 'today_only_view', String(visibleToday));

    await page.locator('[data-steward-mode="nutrition"]').click();
    check(await page.locator('[data-steward-nutrition-unavailable]').isHidden(), 'nutrition_projection_available');
    check(await page.locator('[data-steward-nutrition-workspace]').isVisible(), 'nutrition_workspace_visible');
    check(await page.locator('[data-steward-meal-preset]').count() === 3, 'nutrition_plan_meals_visible');
    check((await page.locator('[data-steward-meal-title]').textContent())?.includes('三文鱼午餐'), 'nutrition_active_meal');
    check(await page.locator('[data-steward-food-input="salmon"]').inputValue() === '200', 'nutrition_salmon_default_200');
    const yogurtText = await page.locator('[data-steward-meal-item="yogurt"]').innerText();
    check(yogurtText.includes('推荐 1 盒') && yogurtText.includes('300g/盒'), 'nutrition_packaged_food_by_serving', yogurtText);
    check(await page.locator('[data-steward-macro]').count() === 4, 'nutrition_four_big_numbers');
    for (const key of ['kcal', 'protein', 'carb', 'fat']) {
      check((await page.locator('[data-steward-macro="' + key + '"]').textContent())?.trim() !== '—', 'nutrition_macro_available', key);
    }
    check(await page.locator('[data-steward-topup-list] .stewardFoodAction').count() === 3, 'nutrition_gap_fill_kept');
    check(await page.locator('[data-steward-quick-add] .stewardFoodAction').count() === 6, 'nutrition_quick_add_right');
    const nutritionGeometry = await page.evaluate(() => ({
      editor: document.querySelector('[data-steward-meal-editor]')?.getBoundingClientRect().x || 0,
      quick: document.querySelector('[data-steward-quick-add]')?.getBoundingClientRect().x || 0
    }));
    check(nutritionGeometry.quick > nutritionGeometry.editor, 'nutrition_quick_add_right_geometry', JSON.stringify(nutritionGeometry));
    await page.locator('[data-steward-meal-half]').click();
    check(await page.locator('[data-steward-food-input="salmon"]').inputValue() === '100', 'nutrition_half_action');
    await page.locator('[data-steward-meal-uncertain]').click();
    check((await page.locator('[data-steward-meal-uncertain]').getAttribute('class') || '').includes('active'), 'nutrition_uncertain_action');
    check((await page.locator('[data-steward-meal-editor]').getAttribute('class') || '').includes('uncertain'), 'nutrition_uncertain_visual');
    await page.locator('[data-steward-meal-reset]').click();
    check(await page.locator('[data-steward-food-input="salmon"]').inputValue() === '200', 'nutrition_reset_action');
    const mealReality = await page.evaluate(async (studyDay) => {
      const mod = await import('/src/lib/stewardReality.mjs');
      return mod.buildStewardRealityDailySummary(localStorage, { day: studyDay }).meals;
    }, capacityDay);
    check(mealReality?.[0]?.status === 'SELECTED', 'nutrition_selection_not_consumption');
    check(mealReality?.[0]?.items?.find(item => item.food_id === 'salmon')?.amount === 200, 'nutrition_selection_readback');
    await page.screenshot({ path: path.join(auditDir, 'nutrition-1512x820.png'), fullPage: false });

    await page.locator('[data-steward-mode="training"]').click();
    check(await page.locator('[data-steward-training-unavailable]').isHidden(), 'training_projection_available');
    check(await page.locator('[data-steward-training-workspace]').isVisible(), 'training_workspace_visible');
    check(await page.locator('[data-steward-exercise]').count() === 3, 'training_recommended_cards');
    const trainingText = await page.locator('[data-steward-exercise-list]').innerText();
    check(trainingText.includes('Smith squat') && trainingText.includes('Smith flat bench press') && trainingText.includes('One-arm cable row'), 'training_plan_labels', trainingText);
    check(await page.locator('[data-steward-exercise] [data-action="replace"]').count() === 3, 'training_replace_actions');
    check(await page.locator('[data-steward-exercise] [data-action="record"]').count() === 3, 'training_record_actions');
    await page.screenshot({ path: path.join(auditDir, 'training-1512x820.png'), fullPage: false });
    const firstExercise = page.locator('[data-steward-exercise="KN01"]');
    await firstExercise.locator('[data-action="replace"]').click();
    check((await page.locator('[data-steward-exercise="KN01"]').innerText()).includes('Goblet squat'), 'training_authorized_replace');
    await page.locator('[data-steward-exercise="KN01"] [data-action="record"]').click();
    check((await page.locator('[data-steward-exercise="KN01"]').getAttribute('class') || '').includes('recorded'), 'training_record_visual');
    await page.locator('[data-steward-training-effect="SAME"]').click();
    const trainingReality = await page.evaluate(async (studyDay) => {
      const mod = await import('/src/lib/stewardReality.mjs');
      return mod.buildStewardRealityDailySummary(localStorage, { day: studyDay }).training;
    }, capacityDay);
    check(trainingReality?.[0]?.effect === 'SAME', 'training_effect_readback');
    check(trainingReality?.[0]?.exercises?.[0]?.exercise_id === 'KN01', 'training_record_base_identity');
    check(trainingReality?.[0]?.exercises?.[0]?.variant_id === 'KN02', 'training_record_authorized_variant');

    await page.locator('[data-steward-mode="schedule"]').click();
    check(await page.locator('[data-steward-mode-panel="schedule"]').getAttribute('class') === 'stewardModePanel active', 'schedule_return_after_local_modes');

    await page.locator('[data-steward-view="week"]').click();
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '这一周', 'week_header');
    check(await page.locator('.stewardWeekDayHead').count() === 7, 'week_x7_heads', pageErrors.join(' | '));
    check(await page.locator('.stewardWeekAxis span').count() >= 8, 'week_time_axis');
    check(await page.locator('.stewardWeekActual').count() >= 3, 'week_actual_trace');
    check(await page.locator('.stewardWeekDayHead span').filter({ hasText: /h|m/ }).count() >= 2, 'week_daily_totals');
    check(await page.locator('[data-steward-view-panel].active').count() === 1, 'week_view_exclusive');
    await page.screenshot({ path: path.join(auditDir, 'week-1512x820.png'), fullPage: false });

    await page.locator('[data-steward-view="today"]').click();
    check(await page.locator('[data-steward-mode="schedule"]').getAttribute('class') === 'active', 'today_resets_schedule');
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '今天怎么过', 'today_header');
    await page.screenshot({ path: path.join(auditDir, 'today-1512x820.png'), fullPage: false });

    await page.locator('[data-steward-view="month"]').click();
    check((await page.locator('[data-steward-header-title]').textContent())?.trim() === '这个月', 'month_header');
    check(await page.locator('.stewardMonthHead').count() === 7, 'month_seven_columns');
    check(await page.locator('.stewardMonthCell.today').count() === 1, 'month_today');
    check(await page.locator('.stewardMonthCell.selected').count() === 1, 'month_selected_today');
    check(await page.locator('.stewardMonthMarks i').count() >= 1, 'month_actual_marks');
    check(await page.locator('[data-steward-view-panel].active').count() === 1, 'month_view_exclusive');
    await page.screenshot({ path: path.join(auditDir, 'month-1512x820.png'), fullPage: false });

    const bodyText = await page.locator('body').innerText();
    check(!/coverage|validator|confidence|UNKNOWN|证据覆盖|候选规律|\bowner\b|provisional|schema|payload|hash|旧 PR|cable setting|\breset\b/i.test(bodyText), 'backend_copy_leak');

    const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(bodyOverflow <= 1, 'page_horizontal_overflow', String(bodyOverflow));

    const readableSelectors = [
      '.stewardViewTabs button',
      '.stewardModeTabs button',
      '.stewardMonthCell b',
      '.stewardMonthDetail'
    ];
    for (const selector of readableSelectors) {
      const size = Number.parseFloat(await page.locator(selector).first().evaluate((node) => getComputedStyle(node).fontSize));
      check(size >= 15, 'visible_text_below_floor', `${selector}:${size}`);
    }

    await context.close();
  } finally {
    await browser.close().catch(() => {});
  }

  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify({
    status: 'PASS',
    viewport: '1512x820',
    l1: 'Steward',
    l2: null,
    views: ['today', 'week', 'month'],
    week_model: 'shared-time-axis-x7',
    month_model: 'calendar-grid',
    full_site_build_dependency: false
  }, null, 2));
  console.log('STEWARD_UI_BROWSER_PASS');
} catch (error) {
  fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify({
    status: 'FAIL',
    error: error instanceof Error ? error.stack || error.message : String(error),
    serverLog: serverLog.slice(-12000)
  }, null, 2));
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
