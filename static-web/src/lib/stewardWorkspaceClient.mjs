import { readExamChatPlan } from './examChatPlan.mjs';
import {
  aggregateStudyTime,
  buildStudyTimerReadModel,
  readStudyTimerLedger,
  readStudyTimerState,
  studyDayAt,
  STUDY_TIMER_TIMEZONE
} from './studyTimer.mjs';
import { stewardRealityEventsForDay } from './stewardReality.mjs';

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
    renderCapacity(chatPlanState);
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
