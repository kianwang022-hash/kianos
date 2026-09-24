import { readExamChatPlan } from './examChatPlan.mjs';
import {
  aggregateStudyTime,
  buildStudyTimerReadModel,
  readStudyTimerLedger,
  readStudyTimerState,
  studyDayAt,
  STUDY_TIMER_TIMEZONE
} from './studyTimer.mjs';

const SUBJECT_LABEL = Object.freeze({
  xizong: '西综',
  english: 'English',
  politics: '政治'
});

const START_MINUTE = 6 * 60;
const END_MINUTE = 22 * 60 + 30;
const DISPLAY_MINUTES = END_MINUTE - START_MINUTE;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function currentStudyDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: STUDY_TIMER_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) throw new Error('STEWARD_DAY_UNAVAILABLE');
  return `${year}-${month}-${day}`;
}

function localClock(timestamp) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: STUDY_TIMER_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(timestamp));
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return { hour, minute, total: hour * 60 + minute };
}

function clockMinute(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function formatClock(timestamp) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STUDY_TIMER_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date(timestamp));
}

function formatMinutes(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function formatElapsed(ms) {
  const seconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, '0')).join(':');
}

function dateAdd(day, offset) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function mondayOf(day) {
  const date = new Date(`${day}T12:00:00Z`);
  const offset = (date.getUTCDay() + 6) % 7;
  return dateAdd(day, -offset);
}

function monthMove(month, offset) {
  const [year, value] = month.split('-').map(Number);
  return new Date(Date.UTC(year, value - 1 + offset, 1)).toISOString().slice(0, 7);
}

function percentForMinute(minute) {
  return ((clamp(minute, START_MINUTE, END_MINUTE) - START_MINUTE) / DISPLAY_MINUTES) * 100;
}

function intervalGeometry(start, end) {
  let from = start;
  let to = end;
  if (to < from) to += 1440;
  if (to <= START_MINUTE || from >= END_MINUTE) return null;
  from = clamp(from, START_MINUTE, END_MINUTE);
  to = clamp(to, START_MINUTE, END_MINUTE);
  if (to <= from) return null;
  return {
    top: percentForMinute(from),
    height: Math.max(.55, ((to - from) / DISPLAY_MINUTES) * 100)
  };
}

function subjectForSchedule(block) {
  if (['xizong', 'english', 'politics'].includes(block?.subject)) return block.subject;
  return 'life';
}

function currentSessions(storage, now = Date.now()) {
  const sessions = readStudyTimerLedger(storage).sessions
    .filter((session) => !session.excluded)
    .map((session) => ({ ...session }));
  const state = readStudyTimerState(storage);
  if (state.running && state.subject && state.segmentStartedAt != null && now > state.segmentStartedAt) {
    sessions.push({
      id: 'active',
      subject: state.subject,
      context: state.context,
      startedAt: state.segmentStartedAt,
      endedAt: now,
      source: 'active',
      excluded: false,
      edited: false
    });
  }
  return sessions;
}

function sessionsForDay(storage, day, now = Date.now()) {
  return currentSessions(storage, now).filter((session) => studyDayAt(session.startedAt, STUDY_TIMER_TIMEZONE) === day);
}

function sessionClockGeometry(session) {
  const start = localClock(session.startedAt).total;
  let end = localClock(session.endedAt).total;
  if (end < start) end += 1440;
  return intervalGeometry(start, end);
}

function createText(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  return node;
}

function planPresentation(state) {
  return state?.plan?.presentation || state?.presentation || null;
}

function planStatusText(state) {
  if (state?.status === 'ready') return '今日安排';
  if (state?.status === 'stale') return '安排待更新';
  if (state?.status === 'invalid') return '安排暂不可用';
  if (state?.status === 'unavailable') return '安排暂不可读取';
  return '暂无今日安排';
}

function subjectMinutes(timerModel, subject) {
  return Math.max(0, Math.round((timerModel?.today?.bySubject?.[subject]?.ms || 0) / 60000));
}


const MEAL_PRESETS = Object.freeze({
  z01: {
    title: 'Z01 · 黑麦酸奶碗',
    role: '早餐 / 轻午餐 · 熟悉、低摩擦',
    reference: '310–440 kcal',
    protein: '35–42 g',
    carb: '40–65 g',
    fat: '低（坚果前）',
    note: '组合参考来自当前已接受食谱；具体营养值以当天实际产品和克数为准。',
    items: [
      { label: '高蛋白酸奶', amount: 300, unit: 'g', range: '当前熟悉基准 300 g' },
      { label: '黑麦片', amount: 50, unit: 'g', range: '常用范围 40–60 g' },
      { label: '水果', amount: 0, unit: 'g', range: '可选：蓝莓 / 香蕉' },
      { label: '坚果', amount: 0, unit: 'g', range: '可选：需要更多饱腹 / 能量时加入' }
    ]
  },
  z02: {
    title: 'Z02 · 三文鱼组合',
    role: '零烹饪午餐 · 饱腹 / 训练支持',
    reference: '520–650+ kcal',
    protein: '50–60 g',
    carb: '35–45 g',
    fat: '主要来自三文鱼',
    note: '三文鱼具体 SKU 仍可能改变总能量和脂肪；不把参考范围当成精确摄入。',
    items: [
      { label: '三文鱼', amount: 150, unit: 'g', range: '基准约 150 g' },
      { label: '黑麦片', amount: 50, unit: 'g', range: '基准约 50 g' },
      { label: '高蛋白酸奶', amount: 175, unit: 'g', range: '常用约 150–200 g' }
    ]
  },
  z03: {
    title: 'Z03 · 甜虾组合',
    role: '轻量高蛋白午餐 · 低脂低摩擦',
    reference: '约 400–430 kcal',
    protein: '约 50+ g',
    carb: '以黑麦 / 酸奶为主',
    fat: '很低（额外脂肪前）',
    note: '甜虾营养仍是暂定参考；拿到当天产品标签后，以标签值覆盖参考值。',
    items: [
      { label: '甜虾', amount: 85, unit: 'g', range: '常用 85–170 g' },
      { label: '黑麦片', amount: 50, unit: 'g', range: '基准约 50 g' },
      { label: '高蛋白酸奶', amount: 300, unit: 'g', range: '常用 200–300 g' },
      { label: '蔬菜 / 毛豆', amount: 0, unit: 'g', range: '按当天饱腹和蔬菜需要添加' }
    ]
  }
});

const SINGLE_FOODS = Object.freeze({
  yogurt: { title: '高蛋白酸奶', role: '蛋白 / 乳制品', amount: 300, range: '按当前产品标签计算' },
  rye: { title: '黑麦片', role: '碳水 / 纤维', amount: 50, range: '常用 40–60 g' },
  salmon: { title: '三文鱼', role: '蛋白 / 脂肪', amount: 150, range: '具体 SKU / 部位会影响能量和脂肪' },
  shrimp: { title: '甜虾', role: '低脂蛋白', amount: 85, range: '暂定常用范围 85–170 g' }
});

const EXERCISE_REFERENCE = Object.freeze({
  KN01: { title: 'Smith squat', mode: 'strength', hint: '当前负重由实际 RPE 决定，不沿用旧负重。', dose: '6–10 reps · RPE 6–8' },
  PR01: { title: 'Smith bench press', mode: 'strength', hint: '稳定主推；负重以当前动作质量和 RPE 为准。', dose: '6–12 reps · RPE 6–8' },
  PU03: { title: 'One-arm cable row', mode: 'strength', hint: '器械档位 + 次数 + RPE 才是可比较记录。', dose: '10–14 / side' },
  CD02: { title: 'Incline treadmill walk', mode: 'cardio', hint: '当前高适配有氧候选；记录实际时长和 RPE。', dose: '15–35 min · RPE 4–6' },
  CD01: { title: 'Easy walk', mode: 'cardio', hint: '恢复 / 过渡候选；保持低负荷。', dose: '10–30 min' },
  MV03: { title: '90/90 slow breathing', mode: 'recovery', hint: '低输入恢复动作；只有实际有帮助时才使用。', dose: '3–6 slow breaths' },
  MV02: { title: 'Open-book rotation', mode: 'recovery', hint: '轻量胸椎活动；记录实际完成即可。', dose: '4–8 / side' }
});

export function initStewardWorkspace(root) {
  if (!(root instanceof HTMLElement) || typeof window === 'undefined' || !window.localStorage) return;

  const storage = window.localStorage;
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];

  let today = currentStudyDay();
  let weekCursor = today;
  let monthCursor = today.slice(0, 7);


  function updateMealGramTotal() {
    const values = $$('[data-steward-meal-grams]').map((input) => Number(input.value || 0)).filter(Number.isFinite);
    const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
    const node = $('[data-steward-meal-grams-total]');
    if (node) node.textContent = total > 0 ? `${Math.round(total)} g` : '—';
  }

  function renderMealRows(items) {
    const rootNode = $('[data-steward-meal-rows]');
    if (!rootNode) return;
    rootNode.innerHTML = '';
    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'stewardMealRow';
      const copy = document.createElement('div');
      copy.append(
        createText('strong', '', item.label),
        createText('small', '', item.range || '')
      );
      const inputWrap = document.createElement('label');
      inputWrap.className = 'stewardGramInput';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '1';
      input.value = String(item.amount ?? 0);
      input.dataset.stewardMealGrams = '';
      input.setAttribute('aria-label', `${item.label} 克数`);
      input.addEventListener('input', updateMealGramTotal);
      inputWrap.append(input, createText('span', '', item.unit || 'g'));
      row.append(copy, inputWrap);
      rootNode.appendChild(row);
    }
    updateMealGramTotal();
  }

  function renderMealPreset(id) {
    const preset = MEAL_PRESETS[id] || MEAL_PRESETS.z01;
    $('[data-steward-meal-title]').textContent = preset.title;
    $('[data-steward-meal-role]').textContent = preset.role;
    $('[data-steward-meal-reference]').textContent = preset.reference;
    $('[data-steward-meal-protein]').textContent = preset.protein;
    $('[data-steward-meal-carb]').textContent = preset.carb;
    $('[data-steward-meal-fat]').textContent = preset.fat;
    $('[data-steward-meal-note]').textContent = preset.note;
    $$('[data-steward-meal-preset]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardMealPreset === id);
    });
    renderMealRows(preset.items);
  }

  function renderSingleFood(id) {
    const food = SINGLE_FOODS[id] || SINGLE_FOODS.yogurt;
    $('[data-steward-meal-title]').textContent = food.title;
    $('[data-steward-meal-role]').textContent = food.role;
    $('[data-steward-meal-reference]').textContent = '等待当前产品值';
    $('[data-steward-meal-protein]').textContent = '—';
    $('[data-steward-meal-carb]').textContent = '—';
    $('[data-steward-meal-fat]').textContent = '—';
    $('[data-steward-meal-note]').textContent = '单品营养应使用当前产品标签；这里不从旧值猜精确数字。';
    $$('[data-steward-single-food]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardSingleFood === id);
    });
    renderMealRows([{ label: food.title, amount: food.amount, unit: 'g', range: food.range }]);
  }

  function activateFoodMode(mode) {
    $$('[data-steward-food-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardFoodMode === mode);
    });
    $$('[data-steward-food-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.stewardFoodPanel !== mode;
    });
    if (mode === 'combo') renderMealPreset('z01');
    else renderSingleFood('yogurt');
  }

  function updateTrainingCounts() {
    const inputs = $$('[data-steward-training-input]');
    const activeRows = new Set();
    for (const input of inputs) {
      if (String(input.value || '').trim()) {
        const row = input.closest('[data-steward-set-row]');
        if (row) activeRows.add(row);
      }
    }
    const node = $('[data-steward-training-set-count]');
    if (node) node.textContent = String(activeRows.size);
    const status = $('[data-steward-training-status]');
    if (status) status.textContent = activeRows.size ? '记录中' : '未开始';
  }

  function trainingInput(label, unit, { min = 0, max = 999, step = 1, placeholder = '' } = {}) {
    const wrap = document.createElement('label');
    wrap.className = 'stewardSetInput';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.placeholder = placeholder;
    input.dataset.stewardTrainingInput = '';
    input.setAttribute('aria-label', label);
    input.addEventListener('input', updateTrainingCounts);
    wrap.append(input, createText('span', '', unit));
    return wrap;
  }

  function renderTrainingExercise(id) {
    const ref = EXERCISE_REFERENCE[id] || EXERCISE_REFERENCE.KN01;
    $('[data-steward-training-title]').textContent = ref.title;
    $('[data-steward-training-hint]').textContent = ref.hint;
    $$('[data-steward-exercise]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardExercise === id);
    });

    const rows = $('[data-steward-set-rows]');
    if (!rows) return;
    rows.innerHTML = '';

    if (ref.mode === 'strength') {
      for (let index = 1; index <= 3; index += 1) {
        const row = document.createElement('div');
        row.className = 'stewardSetRow';
        row.dataset.stewardSetRow = '';
        row.append(
          createText('b', '', `${index}`),
          trainingInput('负重', 'kg', { step: .5, placeholder: '—' }),
          trainingInput('次数', 'reps', { max: 100, placeholder: '—' }),
          trainingInput('RPE', '', { min: 1, max: 10, step: .5, placeholder: '—' })
        );
        rows.appendChild(row);
      }
    } else if (ref.mode === 'cardio') {
      const row = document.createElement('div');
      row.className = 'stewardSetRow compact';
      row.dataset.stewardSetRow = '';
      row.append(
        createText('b', '', '实际'),
        trainingInput('时长', 'min', { max: 240, placeholder: '—' }),
        trainingInput('RPE', '', { min: 1, max: 10, step: .5, placeholder: '—' })
      );
      rows.appendChild(row);
    } else {
      const row = document.createElement('div');
      row.className = 'stewardSetRow compact';
      row.dataset.stewardSetRow = '';
      row.append(
        createText('b', '', '实际'),
        trainingInput('次数或呼吸', 'reps', { max: 100, placeholder: '—' }),
        trainingInput('时长', 'min', { max: 120, placeholder: '—' })
      );
      rows.appendChild(row);
    }
    updateTrainingCounts();
  }

  function activateTrainingMode(mode) {
    $$('[data-steward-training-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardTrainingMode === mode);
    });
    $$('[data-steward-training-library]').forEach((panel) => {
      panel.hidden = panel.dataset.stewardTrainingLibrary !== mode;
    });
    const first = {
      strength: 'KN01',
      cardio: 'CD02',
      recovery: 'MV03'
    }[mode] || 'KN01';
    renderTrainingExercise(first);
  }

  const read = () => {
    today = currentStudyDay();
    const chatPlanState = readExamChatPlan(storage, today);
    const timerModel = buildStudyTimerReadModel(storage, Date.now(), STUDY_TIMER_TIMEZONE);
    return {
      chatPlanState,
      presentation: planPresentation(chatPlanState),
      timerModel
    };
  };

  function renderPlanState(state) {
    const node = $('[data-steward-plan-state]');
    if (!node) return;
    node.dataset.state = state.status || 'missing';
    node.textContent = planStatusText(state);
  }

  function renderTasks(presentation) {
    const rootNode = $('[data-steward-tasks]');
    if (!rootNode) return;
    rootNode.innerHTML = '';
    const tasks = presentation?.todayTasks || [];
    const section = $('[data-steward-task-section]');
    if (section) section.hidden = tasks.length === 0;
    if (!tasks.length) return;
    for (const task of tasks) {
      const row = createText('div', 'stewardTaskRow', task.label);
      rootNode.appendChild(row);
    }
  }

  function renderSubjectTotals(timerModel) {
    for (const subject of ['xizong', 'english', 'politics']) {
      const node = $(`[data-steward-total="${subject}"]`);
      if (node) node.textContent = formatMinutes(subjectMinutes(timerModel, subject));
    }
  }

  function renderReality(timerModel) {
    const list = $('[data-steward-reality]');
    if (!list) return;
    list.innerHTML = '';
    const sessions = sessionsForDay(storage, today)
      .sort((a, b) => b.endedAt - a.endedAt)
      .slice(0, 4);
    if (!sessions.length) {
      list.appendChild(createText('p', 'stewardEmpty', '今天还没有学习记录。'));
      return;
    }
    for (const session of sessions) {
      const row = document.createElement('div');
      row.className = 'stewardRealityRow';
      row.append(
        createText('time', '', formatClock(session.startedAt)),
        createText('span', '', `${SUBJECT_LABEL[session.subject] || session.subject} · ${session.context?.detailLabel || '学习'}`)
      );
      list.appendChild(row);
    }
  }

  function renderNow(presentation, timerModel) {
    const active = timerModel?.active || {};
    const subjectNode = $('[data-steward-now-subject]');
    const elapsedNode = $('[data-steward-now-elapsed]');
    const planNode = $('[data-steward-now-plan]');
    const nextNode = $('[data-steward-next]');

    if (subjectNode) {
      subjectNode.textContent = active.subject
        ? `${SUBJECT_LABEL[active.subject] || active.subject} · ${active.context?.detailLabel || '学习'}`
        : '当前未计时';
    }
    if (elapsedNode) elapsedNode.textContent = active.running ? formatElapsed(active.elapsedMs) : '—';

    const blocks = presentation?.scheduleBlocks || [];
    const nowClock = localClock(Date.now()).total;
    const current = blocks.find((block) => {
      const start = clockMinute(block.start);
      const end = block.end ? clockMinute(block.end) : null;
      return start != null && start <= nowClock && (end == null || nowClock < end);
    });
    const next = blocks.find((block) => {
      const start = clockMinute(block.start);
      return start != null && start > nowClock;
    });

    if (planNode) planNode.textContent = current ? `${current.start}–${current.end || ''} ${current.label}` : '—';
    if (nextNode) nextNode.textContent = next ? `${next.start} ${next.label}` : '—';
  }

  function renderTimeline(presentation) {
    const rootNode = $('[data-steward-timeline]');
    if (!rootNode) return;
    rootNode.innerHTML = '';

    for (let hour = 6; hour <= 22; hour += 2) {
      const label = createText('span', 'stewardHour', `${String(hour).padStart(2, '0')}:00`);
      label.style.top = `${percentForMinute(hour * 60)}%`;
      rootNode.appendChild(label);
    }

    const scheduleBlocks = presentation?.scheduleBlocks || [];
    if (!scheduleBlocks.length) {
      const empty = createText('p', 'stewardTimelineEmpty', '今天还没有安排；真实学习时间仍会显示在时间轴上。');
      rootNode.appendChild(empty);
    }

    for (const block of scheduleBlocks) {
      const start = clockMinute(block.start);
      const end = block.end ? clockMinute(block.end) : Math.min(END_MINUTE, (start ?? START_MINUTE) + 45);
      if (start == null || end == null) continue;
      const geometry = intervalGeometry(start, end);
      if (!geometry) continue;
      const node = document.createElement('article');
      node.className = `stewardPlanBlock${geometry.height < 4 ? ' short' : ''}`;
      node.dataset.subject = subjectForSchedule(block);
      node.style.top = `${geometry.top}%`;
      node.style.height = `${geometry.height}%`;
      node.append(
        createText('strong', '', block.label),
        createText('span', '', `${block.start}${block.end ? `–${block.end}` : ''}${block.detail ? ` · ${block.detail}` : ''}`)
      );
      rootNode.appendChild(node);
    }

    const hasPlan = scheduleBlocks.length > 0;
    for (const session of sessionsForDay(storage, today)) {
      const geometry = sessionClockGeometry(session);
      if (!geometry) continue;
      const node = document.createElement('div');
      node.className = `stewardActualBlock${hasPlan ? ' withPlan' : ' withoutPlan'}${geometry.height < 4 ? ' short' : ''}`;
      node.dataset.subject = session.subject;
      node.style.top = `${geometry.top}%`;
      node.style.height = `${geometry.height}%`;
      const subject = SUBJECT_LABEL[session.subject] || session.subject;
      const detail = String(session.context?.detailLabel || '').trim();
      node.title = `${formatClock(session.startedAt)}–${formatClock(session.endedAt)} ${subject}${detail ? ` · ${detail}` : ''}`;
      node.append(
        createText('strong', '', detail && detail !== session.subject ? `${subject} · ${detail}` : subject),
        createText('span', '', `实际 ${formatClock(session.startedAt)}–${formatClock(session.endedAt)}`)
      );
      rootNode.appendChild(node);
    }

    if (studyDayAt(Date.now(), STUDY_TIMER_TIMEZONE) === today) {
      const nowMinute = localClock(Date.now()).total;
      if (nowMinute >= START_MINUTE && nowMinute <= END_MINUTE) {
        const line = document.createElement('div');
        line.className = 'stewardNowLine';
        line.style.top = `${percentForMinute(nowMinute)}%`;
        line.appendChild(createText('span', '', `现在 ${formatClock(Date.now())}`));
        rootNode.appendChild(line);
      }
    }

    requestAnimationFrame(() => {
      const viewport = $('[data-steward-timeline-viewport]');
      const nowLine = rootNode.querySelector('.stewardNowLine');
      if (!(viewport instanceof HTMLElement) || !(nowLine instanceof HTMLElement)) return;
      viewport.scrollTop = Math.max(0, nowLine.offsetTop - Math.round(viewport.clientHeight * .55));
    });
  }

  function renderToday() {
    const { chatPlanState, presentation, timerModel } = read();
    renderPlanState(chatPlanState);
    renderTasks(presentation);
    renderSubjectTotals(timerModel);
    renderReality(timerModel);
    renderNow(presentation, timerModel);
    renderTimeline(presentation);
  }

  function renderWeek() {
    const grid = $('[data-steward-week-grid]');
    const label = $('[data-steward-week-label]');
    if (!grid || !label) return;
    grid.innerHTML = '';

    const monday = mondayOf(weekCursor);
    const end = dateAdd(monday, 6);
    label.textContent = `${monday.slice(5).replace('-', ' / ')} — ${end.slice(5).replace('-', ' / ')}`;

    const corner = document.createElement('div');
    corner.className = 'stewardWeekCorner';
    grid.appendChild(corner);

    const dayLabels = '一二三四五六日';
    for (let index = 0; index < 7; index += 1) {
      const day = dateAdd(monday, index);
      const head = document.createElement('div');
      head.className = `stewardWeekDayHead${day === today ? ' today' : ''}`;
      const daily = aggregateStudyTime(storage, { day, now: Date.now(), timeZone: STUDY_TIMER_TIMEZONE });
      const dailyMinutes = Math.round((daily.totalMs || 0) / 60000);
      head.title = day;
      head.append(
        createText('b', '', `${dayLabels[index]} ${Number(day.slice(8))}`),
        createText('span', '', dailyMinutes > 0 ? formatMinutes(dailyMinutes) : '')
      );
      grid.appendChild(head);
    }

    const axis = document.createElement('div');
    axis.className = 'stewardWeekAxis';
    for (let hour = 6; hour <= 22; hour += 2) {
      const tick = createText('span', '', `${String(hour).padStart(2, '0')}:00`);
      tick.style.top = `${percentForMinute(hour * 60)}%`;
      axis.appendChild(tick);
    }
    grid.appendChild(axis);

    const currentPlanState = readExamChatPlan(storage, today);
    const presentation = planPresentation(currentPlanState);

    for (let index = 0; index < 7; index += 1) {
      const day = dateAdd(monday, index);
      const column = document.createElement('div');
      column.className = `stewardWeekDay${day === today ? ' today' : ''}`;
      const dayPlanBlocks = day === today ? (presentation?.scheduleBlocks || []) : [];
      const hasPlanDay = dayPlanBlocks.length > 0;

      if (day === today) {
        for (const block of presentation?.scheduleBlocks || []) {
          const start = clockMinute(block.start);
          const endMinute = block.end ? clockMinute(block.end) : Math.min(END_MINUTE, (start ?? START_MINUTE) + 45);
          if (start == null || endMinute == null) continue;
          const geometry = intervalGeometry(start, endMinute);
          if (!geometry) continue;
          const node = document.createElement('div');
          node.className = `stewardWeekPlan${geometry.height < 4 ? ' short' : ''}`;
          node.dataset.subject = subjectForSchedule(block);
          node.style.top = `${geometry.top}%`;
          node.style.height = `${geometry.height}%`;
          node.append(
            createText('b', '', block.label),
            createText('small', '', `${block.start}${block.end ? `–${block.end}` : ''}`)
          );
          column.appendChild(node);
        }
      }

      for (const session of sessionsForDay(storage, day)) {
        const geometry = sessionClockGeometry(session);
        if (!geometry) continue;
        const node = document.createElement('div');
        node.className = `stewardWeekActual ${hasPlanDay ? 'withPlan' : 'withoutPlan'}${geometry.height < 4 ? ' short' : ''}`;
        node.dataset.subject = session.subject;
        node.style.top = `${geometry.top}%`;
        node.style.height = `${geometry.height}%`;
        node.title = `${SUBJECT_LABEL[session.subject] || session.subject} · ${formatClock(session.startedAt)}–${formatClock(session.endedAt)}`;
        node.append(
          createText('b', '', SUBJECT_LABEL[session.subject] || session.subject),
          createText('small', '', `${formatClock(session.startedAt)}–${formatClock(session.endedAt)}`)
        );
        column.appendChild(node);
      }

      if (day === today) {
        const nowMinute = localClock(Date.now()).total;
        if (nowMinute >= START_MINUTE && nowMinute <= END_MINUTE) {
          const line = document.createElement('div');
          line.className = 'stewardWeekNowLine';
          line.style.top = `${percentForMinute(nowMinute)}%`;
          column.appendChild(line);
        }
      }

      grid.appendChild(column);
    }
  }

  function renderMonthDetail(day) {
    const node = $('[data-steward-month-detail]');
    if (!node) return;
    const total = aggregateStudyTime(storage, { day, now: Date.now(), timeZone: STUDY_TIMER_TIMEZONE });
    const parts = ['xizong', 'english', 'politics']
      .map((subject) => {
        const minutes = Math.round((total.bySubject?.[subject]?.ms || 0) / 60000);
        return minutes > 0 ? `${SUBJECT_LABEL[subject]} ${formatMinutes(minutes)}` : null;
      })
      .filter(Boolean);
    const planState = day === today ? readExamChatPlan(storage, today) : null;
    const blocks = planPresentation(planState)?.scheduleBlocks || [];

    node.innerHTML = '';
    node.appendChild(createText('strong', '', day));
    const summary = [
      parts.length ? parts.join(' · ') : '暂无学习记录',
      blocks.length ? `${blocks.length} 项今日安排` : null
    ].filter(Boolean).join('　');
    node.appendChild(document.createTextNode(`　${summary}`));
  }

  function renderMonth() {
    const grid = $('[data-steward-month-grid]');
    const label = $('[data-steward-month-label]');
    if (!grid || !label) return;
    grid.innerHTML = '';

    const [year, month] = monthCursor.split('-').map(Number);
    label.textContent = `${year} 年 ${month} 月`;

    for (const value of '一二三四五六日') {
      grid.appendChild(createText('div', 'stewardMonthHead', value));
    }

    const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cellCount = Math.ceil((offset + count) / 7) * 7;

    for (let index = 0; index < cellCount; index += 1) {
      const number = index - offset + 1;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'stewardMonthCell';

      if (number < 1 || number > count) {
        cell.classList.add('outside');
        cell.disabled = true;
        grid.appendChild(cell);
        continue;
      }

      const day = `${monthCursor}-${String(number).padStart(2, '0')}`;
      if (day === today) cell.classList.add('today');
      cell.appendChild(createText('b', '', String(number)));

      const aggregate = aggregateStudyTime(storage, { day, now: Date.now(), timeZone: STUDY_TIMER_TIMEZONE });
      const activeSubjects = ['xizong', 'english', 'politics'].filter(
        (subject) => (aggregate.bySubject?.[subject]?.ms || 0) > 0
      );

      const planState = day === today ? readExamChatPlan(storage, today) : null;
      const blocks = planPresentation(planState)?.scheduleBlocks || [];
      if (blocks.length) cell.appendChild(createText('small', '', `${blocks.length} 项安排`));

      if (activeSubjects.length) {
        const marks = document.createElement('span');
        marks.className = 'stewardMonthMarks';
        for (const subject of activeSubjects) {
          const mark = document.createElement('i');
          mark.className = subject;
          marks.appendChild(mark);
        }
        cell.appendChild(marks);
      }

      if (day === today) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        $('.stewardMonthCell.selected').forEach((item) => item.classList.remove('selected'));
        cell.classList.add('selected');
        renderMonthDetail(day);
      });
      grid.appendChild(cell);
    }

    renderMonthDetail(today.startsWith(monthCursor) ? today : `${monthCursor}-01`);
  }

  function activateView(view) {
    const headerCopy = {
      today: ['今天怎么过', '时间安排、实际执行、饮食、训练和恢复。'],
      week: ['这一周', '把七天放在同一根时间轴上看。'],
      month: ['这个月', '用月历看方向、安排和真实发生过的学习。']
    }[view] || ['Steward', ''];
    const title = $('[data-steward-header-title]');
    const description = $('[data-steward-header-description]');
    if (title) title.textContent = headerCopy[0];
    if (description) description.textContent = headerCopy[1];

    root.querySelectorAll('[data-steward-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardView === view);
    });
    $$('[data-steward-view-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.stewardViewPanel === view);
    });

    if (view === 'today') {
      activateMode('schedule');
      renderToday();
    } else if (view === 'week') {
      renderWeek();
    } else if (view === 'month') {
      renderMonth();
    }
  }

  function activateMode(mode) {
    $$('[data-steward-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardMode === mode);
    });
    $$('[data-steward-mode-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.stewardModePanel === mode);
    });
  }


  $$('[data-steward-food-mode]').forEach((button) => {
    button.addEventListener('click', () => activateFoodMode(button.dataset.stewardFoodMode));
  });
  $$('[data-steward-meal-preset]').forEach((button) => {
    button.addEventListener('click', () => renderMealPreset(button.dataset.stewardMealPreset));
  });
  $$('[data-steward-single-food]').forEach((button) => {
    button.addEventListener('click', () => renderSingleFood(button.dataset.stewardSingleFood));
  });

  $$('[data-steward-training-mode]').forEach((button) => {
    button.addEventListener('click', () => activateTrainingMode(button.dataset.stewardTrainingMode));
  });
  $$('[data-steward-exercise]').forEach((button) => {
    button.addEventListener('click', () => renderTrainingExercise(button.dataset.stewardExercise));
  });
  $$('.stewardTrainingEffect button').forEach((button) => {
    button.addEventListener('click', () => {
      const wasActive = button.classList.contains('active');
      $$('.stewardTrainingEffect button').forEach((item) => item.classList.remove('active'));
      if (!wasActive) button.classList.add('active');
    });
  });

  $$('[data-steward-view]').forEach((button) => {
    button.addEventListener('click', () => activateView(button.dataset.stewardView));
  });
  $$('[data-steward-mode]').forEach((button) => {
    button.addEventListener('click', () => activateMode(button.dataset.stewardMode));
  });

  $('[data-steward-week-prev]')?.addEventListener('click', () => {
    weekCursor = dateAdd(weekCursor, -7);
    renderWeek();
  });
  $('[data-steward-week-next]')?.addEventListener('click', () => {
    weekCursor = dateAdd(weekCursor, 7);
    renderWeek();
  });
  $('[data-steward-week-now]')?.addEventListener('click', () => {
    weekCursor = today;
    renderWeek();
  });

  $('[data-steward-month-prev]')?.addEventListener('click', () => {
    monthCursor = monthMove(monthCursor, -1);
    renderMonth();
  });
  $('[data-steward-month-next]')?.addEventListener('click', () => {
    monthCursor = monthMove(monthCursor, 1);
    renderMonth();
  });
  $('[data-steward-month-now]')?.addEventListener('click', () => {
    monthCursor = today.slice(0, 7);
    renderMonth();
  });

  const refresh = () => {
    if ($('[data-steward-view].active')?.dataset.stewardView === 'today') renderToday();
    else if ($('[data-steward-view].active')?.dataset.stewardView === 'week') renderWeek();
    else renderMonth();
  };

  window.addEventListener('kianos:study-timer-change', refresh);
  window.addEventListener('kianos:control-command-applied', refresh);
  window.addEventListener('kianos:private-control-consumed', refresh);
  window.addEventListener('storage', (event) => {
    if (event.key == null || String(event.key).startsWith('kianos')) refresh();
  });
  window.addEventListener('focus', refresh);

  const interval = window.setInterval(() => {
    if (document.visibilityState === 'visible') refresh();
  }, 30_000);

  window.addEventListener('pagehide', () => window.clearInterval(interval), { once: true });

  activateFoodMode('combo');
  activateTrainingMode('strength');
  activateView('today');
}
