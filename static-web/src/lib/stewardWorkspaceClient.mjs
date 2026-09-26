import { readExamChatPlan } from './examChatPlan.mjs';
import {
  aggregateStudyTime,
  buildStudyTimerReadModel,
  readStudyTimerLedger,
  readStudyTimerState,
  studyDayAt,
  STUDY_TIMER_TIMEZONE
} from './studyTimer.mjs';
import {
  stewardRealityEventsForDay,
  stewardMealSelectionsForDay,
  stewardTrainingActualsForDay,
  upsertStewardMealSelection,
  upsertStewardTrainingActual
} from './stewardReality.mjs';

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
  const value = state?.plan?.presentation || state?.presentation || null;
  if (!value) return null;
  return {
    todayTasks: value.todayTasks || value.today_tasks || [],
    weekReference: value.weekReference || value.week_reference || [],
    scheduleBlocks: value.scheduleBlocks || value.schedule_blocks || [],
    nutrition: value.nutrition || null,
    training: value.training || null
  };
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


export function initStewardWorkspace(root) {
  if (!(root instanceof HTMLElement) || typeof window === 'undefined' || !window.localStorage) return;

  const storage = window.localStorage;
  const $ = (selector) => root.querySelector(selector);
  const queryAll = (selector) => [...root.querySelectorAll(selector)];

  let today = currentStudyDay();
  let weekCursor = today;
  let monthCursor = today.slice(0, 7);

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

  function renderCapacity(chatPlanState) {
    const section = $('[data-steward-capacity-section]');
    if (!section) return;
    const capacity = chatPlanState?.status === 'ready' ? chatPlanState.plan?.capacity : null;
    const events = stewardRealityEventsForDay(storage, today);
    const latest = Array.isArray(events) && events.length
      ? [...events].sort((a, b) => b.startedAt - a.startedAt)[0]
      : null;

    section.hidden = !(capacity || latest);
    if (section.hidden) return;

    const stateLabels = {
      ORDINARY: '正常',
      REDUCED: '降低',
      UNCERTAIN: '待确认',
      RECOVER_FIRST: '先恢复'
    };
    const stateNode = $('[data-steward-capacity-state]');
    if (stateNode) stateNode.textContent = capacity ? (stateLabels[capacity.state] || '') : '事实记录';

    const summary = $('[data-steward-capacity-summary]');
    if (summary) {
      summary.textContent = capacity?.summary
        || '最近有一次恢复记录；是否需要调整，由当前真实表现决定。';
    }

    const setRow = (name, value) => {
      const row = $(`[data-steward-capacity-${name}-row]`);
      const node = $(`[data-steward-capacity-${name}]`);
      if (row) row.hidden = !value;
      if (node) node.textContent = value || '';
    };
    setRow('basis', capacity?.basis || '');
    setRow('load', capacity?.load || '');
    setRow('action', capacity?.action || '');
    setRow('recheck', capacity?.recheck || '');

    const recovery = $('[data-steward-capacity-recovery]');
    if (!recovery) return;
    if (!latest) {
      recovery.hidden = true;
      recovery.textContent = '';
      return;
    }
    const methodLabels = { walk:'走动', eyes_closed:'闭眼', phone:'手机', food:'吃点东西', water:'补水' };
    const methods = [...(latest.methods || []).map(method => methodLabels[method] || method), latest.customMethod].filter(Boolean);
    const minutes = latest.endedAt == null
      ? null
      : Math.max(0, Math.round((latest.endedAt - latest.startedAt) / 60000));
    const reentry = latest.reentry?.status === 'RESTORED' ? '恢复明显'
      : latest.reentry?.status === 'PARTIAL' ? '部分恢复'
        : latest.reentry?.status === 'NOT_RESTORED' ? '仍未恢复' : '';
    recovery.hidden = false;
    recovery.textContent = [
      latest.endedAt == null ? '正在休息' : `最近恢复 ${minutes}m`,
      methods.join(' / '),
      reentry
    ].filter(Boolean).join(' · ');
  }

  function renderReality(timerModel) {
    const list = $('[data-steward-reality]');
    if (!list) return;
    list.innerHTML = '';
    const sessions = sessionsForDay(storage, today).map(session => ({
      at: session.endedAt,
      startedAt: session.startedAt,
      label: (SUBJECT_LABEL[session.subject] || session.subject) + ' · ' + (session.context?.detailLabel || '学习')
    }));
    const breaks = stewardRealityEventsForDay(storage, today);
    if (breaks == null) {
      list.appendChild(createText('p', 'stewardEmpty', '休息记录暂不可安全读取；原数据未改动。'));
    }
    const methodLabels = { walk:'走动', eyes_closed:'闭眼', phone:'手机', food:'吃点东西', water:'补水' };
    const breakRows = (breaks || []).map(event => {
      const minutes = event.endedAt == null ? null : Math.max(0, Math.round((event.endedAt - event.startedAt) / 60000));
      const methods = [...(event.methods || []).map(method => methodLabels[method] || method), event.customMethod].filter(Boolean);
      const reentry = event.reentry?.status === 'RESTORED' ? '恢复明显'
        : event.reentry?.status === 'PARTIAL' ? '部分恢复'
          : event.reentry?.status === 'NOT_RESTORED' ? '仍未恢复' : '';
      return {
        at: event.endedAt || event.startedAt,
        startedAt: event.startedAt,
        label: [
          event.endedAt == null ? '休息中' : '休息 ' + minutes + 'm',
          methods.join(' / '),
          reentry
        ].filter(Boolean).join(' · ')
      };
    });
    const rows = [...sessions, ...breakRows].sort((a, b) => b.at - a.at).slice(0, 4);
    if (!rows.length && breaks != null) {
      list.appendChild(createText('p', 'stewardEmpty', '今天还没有学习或休息记录。'));
      return;
    }
    for (const item of rows) {
      const row = document.createElement('div');
      row.className = 'stewardRealityRow';
      row.append(
        createText('time', '', formatClock(item.startedAt)),
        createText('span', '', item.label)
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

    const renderedPlanBlocks = [];
    for (const block of scheduleBlocks) {
      const start = clockMinute(block.start);
      const end = block.end ? clockMinute(block.end) : Math.min(END_MINUTE, (start ?? START_MINUTE) + 45);
      if (start == null || end == null) continue;
      const geometry = intervalGeometry(start, end);
      if (!geometry) continue;
      const node = document.createElement('article');
      const subject = subjectForSchedule(block);
      node.className = `stewardPlanBlock${geometry.height < 4 ? ' short' : ''}`;
      node.dataset.subject = subject;
      node.style.top = `${geometry.top}%`;
      node.style.height = `${geometry.height}%`;

      const head = document.createElement('header');
      head.append(
        createText('strong', '', block.label),
        createText('time', '', `${block.start}${block.end ? `–${block.end}` : ''}`)
      );
      node.appendChild(head);
      if (block.detail) {
        node.title = block.detail;
        node.appendChild(createText('span', 'stewardPlanDetail', block.detail));
      }
      rootNode.appendChild(node);
      renderedPlanBlocks.push({ node, start, end, subject });
    }

    const hasPlan = renderedPlanBlocks.length > 0;
    for (const session of sessionsForDay(storage, today)) {
      const geometry = sessionClockGeometry(session);
      if (!geometry) continue;
      const subject = SUBJECT_LABEL[session.subject] || session.subject;
      const detail = String(session.context?.detailLabel || '').trim();
      const started = localClock(session.startedAt).total;
      const ended = localClock(session.endedAt).total;
      const matchingPlan = renderedPlanBlocks
        .filter((row) => row.subject === session.subject && Math.min(row.end, ended) > Math.max(row.start, started))
        .sort((a, b) => (Math.min(b.end, ended) - Math.max(b.start, started)) - (Math.min(a.end, ended) - Math.max(a.start, started)))[0];

      const node = document.createElement('div');
      node.dataset.subject = session.subject;
      node.title = `${formatClock(session.startedAt)}–${formatClock(session.endedAt)} ${subject}${detail ? ` · ${detail}` : ''}`;

      if (matchingPlan) {
        const overlapStart = Math.max(matchingPlan.start, started);
        const overlapEnd = Math.min(matchingPlan.end, ended);
        const duration = Math.max(1, matchingPlan.end - matchingPlan.start);
        node.className = 'stewardActualBlock withPlan';
        node.style.left = `${Math.max(0, ((overlapStart - matchingPlan.start) / duration) * 100)}%`;
        node.style.width = `${Math.max(1.5, ((overlapEnd - overlapStart) / duration) * 100)}%`;
        matchingPlan.node.appendChild(node);
        continue;
      }

      node.className = `stewardActualBlock withoutPlan${geometry.height < 4 ? ' short' : ''}`;
      node.style.top = `${geometry.top}%`;
      node.style.height = `${geometry.height}%`;
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
      const leadPx = Math.round((90 / DISPLAY_MINUTES) * rootNode.scrollHeight);
      viewport.scrollTop = Math.max(0, nowLine.offsetTop - leadPx);
    });
  }


  function foodAmountLabel(food, amount) {
    const value = Number(amount);
    if (!Number.isFinite(value)) return '—';
    const shown = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
    return (shown + ' ' + (food?.unit || '')).trim();
  }

  function nutritionTotals(projection, items) {
    const foodMap = new Map((projection?.foods || []).map(food => [food.id, food]));
    const totals = { kcal: 0, protein: 0, carb: 0, fat: 0 };
    for (const item of items) {
      const food = foodMap.get(item.food_id);
      if (!food?.nutrition) return null;
      const scale = food.nutrition.basis === 'PER_UNIT'
        ? Number(item.amount)
        : (Number(item.amount) * Number(food.grams_per_unit || 0)) / 100;
      if (!Number.isFinite(scale)) return null;
      totals.kcal += food.nutrition.kcal * scale;
      totals.protein += food.nutrition.protein_g * scale;
      totals.carb += food.nutrition.carb_g * scale;
      totals.fat += food.nutrition.fat_g * scale;
    }
    return totals;
  }

  function renderNutrition(presentation, chatPlanState) {
    const unavailable = $('[data-steward-nutrition-unavailable]');
    const workspace = $('[data-steward-nutrition-workspace]');
    if (!unavailable || !workspace) return;
    const projection = chatPlanState?.status === 'ready' ? presentation?.nutrition : null;
    const available = Boolean(projection?.meals?.length && projection?.foods?.length);
    unavailable.hidden = available;
    workspace.hidden = !available;
    if (!available) return;

    const generatedAt = chatPlanState.plan?.generated_at || '';
    const foodMap = new Map(projection.foods.map(food => [food.id, food]));
    const actuals = stewardMealSelectionsForDay(storage, today) || [];
    const currentActual = [...actuals].reverse().find(event => event.planGeneratedAt === generatedAt) || null;
    const activeMealId = currentActual?.mealId || projection.active_meal_id || projection.meals[0].id;
    const selectedMeal = projection.meals.find(meal => meal.id === activeMealId) || projection.meals[0];
    const currentItems = currentActual?.mealId === selectedMeal.id
      ? currentActual.items.map(item => ({ food_id: item.foodId, amount: item.amount, role: '' }))
        .filter(item => foodMap.has(item.food_id))
      : selectedMeal.items.map(item => ({ ...item }));
    const uncertain = Boolean(currentActual?.mealId === selectedMeal.id && currentActual.uncertain);

    const target = $('[data-steward-nutrition-target]');
    if (target) target.textContent = projection.target_label || '';

    const persist = (meal, items, nextUncertain = uncertain) => {
      upsertStewardMealSelection(storage, {
        observedAt: Date.now(),
        mealId: meal.id,
        label: meal.label,
        ownerRef: projection.owner_ref,
        planGeneratedAt: generatedAt,
        uncertain: nextUncertain,
        items: items.map(item => {
          const food = foodMap.get(item.food_id);
          return {
            foodId: item.food_id,
            label: food?.label || item.food_id,
            amount: Number(item.amount) || 0,
            unit: food?.unit || 'g'
          };
        })
      });
      window.dispatchEvent(new Event('kianos:steward-reality-change'));
    };

    const mealList = $('[data-steward-meal-list]');
    mealList.innerHTML = '';
    for (const meal of projection.meals) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.stewardMealPreset = meal.id;
      if (meal.id === selectedMeal.id) button.classList.add('active');
      button.append(createText('strong', '', meal.label));
      if (meal.note) button.append(createText('span', '', meal.note));
      button.addEventListener('click', () => persist(meal, meal.items.map(item => ({ ...item })), false));
      mealList.appendChild(button);
    }

    const editor = $('[data-steward-meal-editor]');
    editor.classList.toggle('uncertain', uncertain);
    const title = $('[data-steward-meal-title]');
    if (title) title.textContent = selectedMeal.label;

    const rows = $('[data-steward-meal-rows]');
    rows.innerHTML = '';
    for (const item of currentItems) {
      const food = foodMap.get(item.food_id);
      if (!food) continue;
      const row = document.createElement('div');
      row.className = 'stewardMealRow';
      row.dataset.stewardMealItem = food.id;
      const copy = document.createElement('div');
      copy.append(createText('strong', '', food.label));
      const recommendation = '推荐 ' + foodAmountLabel(food, food.recommended_amount)
        + (food.note ? ' · ' + food.note : '');
      copy.append(createText('small', '', recommendation));
      const inputWrap = document.createElement('label');
      inputWrap.className = 'stewardGramInput';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = food.unit === 'g' ? '5' : '.5';
      input.value = String(Number(item.amount));
      input.dataset.stewardFoodInput = food.id;
      inputWrap.append(input, createText('span', '', food.unit));
      input.addEventListener('change', () => {
        const next = currentItems.map(current => current.food_id === food.id
          ? { ...current, amount: Math.max(0, Number(input.value) || 0) }
          : current);
        persist(selectedMeal, next, uncertain);
      });
      row.append(copy, inputWrap);
      rows.appendChild(row);
    }

    const totals = nutritionTotals(projection, currentItems);
    const macroValues = totals ? {
      kcal: Math.round(totals.kcal) + ' kcal',
      protein: totals.protein.toFixed(1) + ' g',
      carb: totals.carb.toFixed(1) + ' g',
      fat: totals.fat.toFixed(1) + ' g'
    } : { kcal: '—', protein: '—', carb: '—', fat: '—' };
    for (const [key, value] of Object.entries(macroValues)) {
      const node = $('[data-steward-macro="' + key + '"]');
      if (node) node.textContent = value;
    }

    const renderFoodActions = (selector, entries) => {
      const container = $(selector);
      if (!container) return;
      container.innerHTML = '';
      for (const entry of entries || []) {
        const food = foodMap.get(entry.food_id);
        if (!food) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'stewardFoodAction';
        const copy = document.createElement('span');
        copy.append(createText('strong', '', entry.role || food.label));
        copy.append(createText('small', '', food.label + ' · ' + foodAmountLabel(food, entry.amount)));
        button.append(copy, createText('b', '', '+'));
        button.addEventListener('click', () => {
          const next = currentItems.map(item => ({ ...item }));
          const existing = next.find(item => item.food_id === entry.food_id);
          if (existing) existing.amount += entry.amount;
          else next.push({ food_id: entry.food_id, amount: entry.amount, role: entry.role || '' });
          persist(selectedMeal, next, uncertain);
        });
        container.appendChild(button);
      }
    };
    renderFoodActions('[data-steward-topup-list]', projection.topup_pool);
    renderFoodActions('[data-steward-quick-add]', projection.quick_add);

    const halfButton = $('[data-steward-meal-half]');
    if (halfButton) halfButton.onclick = () => persist(
      selectedMeal,
      currentItems.map(item => ({ ...item, amount: Number(item.amount) / 2 })),
      uncertain
    );

    const uncertainButton = $('[data-steward-meal-uncertain]');
    if (uncertainButton) {
      uncertainButton.classList.toggle('active', uncertain);
      uncertainButton.onclick = () => persist(selectedMeal, currentItems, !uncertain);
    }

    const resetButton = $('[data-steward-meal-reset]');
    if (resetButton) resetButton.onclick = () => persist(
      selectedMeal,
      selectedMeal.items.map(item => ({ ...item })),
      false
    );
  }

  function renderTraining(presentation, chatPlanState) {
    const unavailable = $('[data-steward-training-unavailable]');
    const workspace = $('[data-steward-training-workspace]');
    if (!unavailable || !workspace) return;
    const projection = chatPlanState?.status === 'ready' ? presentation?.training : null;
    const available = Boolean(projection?.exercises?.length);
    unavailable.hidden = available;
    workspace.hidden = !available;
    if (!available) return;

    const generatedAt = chatPlanState.plan?.generated_at || '';
    const actuals = stewardTrainingActualsForDay(storage, today) || [];
    const currentActual = [...actuals].reverse().find(event =>
      event.planGeneratedAt === generatedAt && event.sessionId === projection.session_id
    ) || null;
    const actualMap = new Map((currentActual?.exercises || []).map(item => [item.exerciseId, item]));

    const title = $('[data-steward-training-title]');
    if (title) title.textContent = projection.title;
    const duration = $('[data-steward-training-duration]');
    if (duration) duration.textContent = projection.duration_label || '';

    const persist = (exercises, effect = currentActual?.effect || null, note = currentActual?.note || '') => {
      upsertStewardTrainingActual(storage, {
        observedAt: Date.now(),
        sessionId: projection.session_id,
        label: projection.title,
        ownerRef: projection.owner_ref,
        planGeneratedAt: generatedAt,
        effect,
        note,
        exercises
      });
      window.dispatchEvent(new Event('kianos:steward-reality-change'));
    };

    const list = $('[data-steward-exercise-list]');
    list.innerHTML = '';
    projection.exercises.forEach((base, index) => {
      const actual = actualMap.get(base.id);
      const variants = [base, ...(base.alternatives || [])];
      const selectedId = actual?.variantId || base.id;
      const selected = variants.find(item => item.id === selectedId) || base;

      const card = document.createElement('article');
      card.className = 'stewardExerciseCard' + (actual?.status === 'RECORDED' ? ' recorded' : '');
      card.dataset.stewardExercise = base.id;

      const head = document.createElement('div');
      head.className = 'stewardExerciseHead';
      const identity = document.createElement('div');
      identity.className = 'stewardExerciseIdentity';
      identity.append(createText('span', 'stewardExerciseRank', String(index + 1)));
      const identityCopy = document.createElement('div');
      identityCopy.append(createText('strong', '', selected.label));
      identityCopy.append(createText('small', '', selected.note || selected.prescription || ''));
      identity.appendChild(identityCopy);

      const actions = document.createElement('div');
      actions.className = 'stewardExerciseActions';
      const replace = document.createElement('button');
      replace.type = 'button';
      replace.dataset.action = 'replace';
      replace.textContent = '替换';
      replace.disabled = variants.length <= 1;
      replace.hidden = variants.length <= 1;
      const record = document.createElement('button');
      record.type = 'button';
      record.dataset.action = 'record';
      record.textContent = actual?.status === 'RECORDED' ? '已记录' : '记录';
      actions.append(replace, record);
      head.append(identity, actions);

      const prescription = document.createElement('div');
      prescription.className = 'stewardExercisePrescription';
      prescription.append(
        createText('span', '', '推荐'),
        createText('strong', '', selected.prescription || '按今日处方')
      );
      if (selected.rpe != null) prescription.append(createText('span', '', 'RPE ' + selected.rpe));

      const row = document.createElement('div');
      row.className = 'stewardSetRow';
      const fields = [
        ['load', actual?.loadValue ?? selected.load_value, selected.load_unit || ''],
        ['reps', actual?.repsValue ?? selected.reps_value, selected.reps_unit || 'reps'],
        ['rpe', actual?.rpe ?? selected.rpe, 'RPE']
      ];
      for (const [name, value, unit] of fields) {
        const wrap = document.createElement('label');
        wrap.className = 'stewardSetInput';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = name === 'rpe' ? '.5' : '1';
        input.value = value == null ? '' : String(value);
        input.dataset.stewardTrainingInput = name;
        wrap.append(input, createText('span', '', unit));
        row.appendChild(wrap);
      }

      const currentExerciseRows = () => [...(currentActual?.exercises || [])].map(item => ({ ...item }));
      const replaceExercise = (nextItem) => {
        const rows = currentExerciseRows().filter(item => item.exerciseId !== base.id);
        rows.push({
          exerciseId: base.id,
          variantId: nextItem.id === base.id ? '' : nextItem.id,
          label: nextItem.label,
          status: 'MODIFIED',
          loadValue: nextItem.load_value,
          loadUnit: nextItem.load_unit,
          repsValue: nextItem.reps_value,
          repsUnit: nextItem.reps_unit,
          rpe: nextItem.rpe
        });
        persist(rows);
      };

      replace.addEventListener('click', () => {
        const currentIndex = Math.max(0, variants.findIndex(item => item.id === selected.id));
        replaceExercise(variants[(currentIndex + 1) % variants.length]);
      });

      record.addEventListener('click', () => {
        const values = Object.fromEntries([...row.querySelectorAll('[data-steward-training-input]')]
          .map(input => [input.dataset.stewardTrainingInput, input.value === '' ? null : Number(input.value)]));
        const rows = currentExerciseRows().filter(item => item.exerciseId !== base.id);
        rows.push({
          exerciseId: base.id,
          variantId: selected.id === base.id ? '' : selected.id,
          label: selected.label,
          status: 'RECORDED',
          loadValue: values.load,
          loadUnit: selected.load_unit,
          repsValue: values.reps,
          repsUnit: selected.reps_unit,
          rpe: values.rpe
        });
        persist(rows);
      });

      card.append(head, prescription, row);
      list.appendChild(card);
    });

    queryAll('[data-steward-training-effect]').forEach(button => {
      const value = button.dataset.stewardTrainingEffect;
      button.classList.toggle('active', currentActual?.effect === value);
      button.onclick = () => persist(
        [...(currentActual?.exercises || [])],
        value,
        $('[data-steward-training-note]')?.value || currentActual?.note || ''
      );
    });
    const note = $('[data-steward-training-note]');
    if (note) {
      note.value = currentActual?.note || '';
      note.onchange = () => persist(
        [...(currentActual?.exercises || [])],
        currentActual?.effect || null,
        note.value
      );
    }
  }

  function renderToday() {
    const { chatPlanState, presentation, timerModel } = read();
    renderPlanState(chatPlanState);
    renderTasks(presentation);
    renderSubjectTotals(timerModel);
    renderCapacity(chatPlanState);
    renderReality(timerModel);
    renderNow(presentation, timerModel);
    renderTimeline(presentation);
    renderNutrition(presentation, chatPlanState);
    renderTraining(presentation, chatPlanState);
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
    queryAll('[data-steward-view-panel]').forEach((panel) => {
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
    queryAll('[data-steward-mode]').forEach((button) => {
      button.classList.toggle('active', button.dataset.stewardMode === mode);
    });
    queryAll('[data-steward-mode-panel]').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.stewardModePanel === mode);
    });
  }


  queryAll('[data-steward-view]').forEach((button) => {
    button.addEventListener('click', () => activateView(button.dataset.stewardView));
  });
  queryAll('[data-steward-mode]').forEach((button) => {
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
  window.addEventListener('kianos:steward-reality-change', refresh);
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

  activateView('today');
}
