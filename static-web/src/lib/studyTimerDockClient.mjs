const POSITION_KEY = 'kianos-study-timer-dock-position-v1';
const SUBJECT_LABELS = { xizong: '西综', politics: '政治', english: 'English' };
const EDGE = 10;

const two = value => String(Math.max(0, Math.floor(value))).padStart(2, '0');

function formatClock(ms = 0) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${two(hours)}:${two(minutes)}:${two(seconds % 60)}`;
}

function formatTotal(ms = 0) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return `${hours}h${rest ? `${rest}m` : ''}`;
}

function safeStoredPosition(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(POSITION_KEY) || 'null');
    if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) return parsed;
  } catch {}
  return null;
}

function savePosition(storage, x, y) {
  try { storage.setItem(POSITION_KEY, JSON.stringify({ x: Math.round(x), y: Math.round(y) })); } catch {}
}

export function initStudyTimerDock(root, timer = window.KianOSStudyTimer) {
  if (!(root instanceof HTMLElement) || !timer || typeof timer.read !== 'function') return null;
  const storage = window.localStorage;
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const subject = $('[data-study-timer-subject]');
  const elapsed = $('[data-study-timer-elapsed]');
  const pause = $('[data-study-timer-pause]');
  const expand = $('[data-study-timer-expand]');
  const expanded = $('[data-study-timer-expanded]');
  const total = $('[data-study-timer-total]');
  const pending = $('[data-study-timer-pending]');
  const pendingTitle = $('[data-study-timer-pending-title]');
  const handle = $('[data-study-timer-drag-handle]');
  const reset = $('[data-study-timer-reset-position]');
  const subjectTotals = {
    xizong: $('[data-study-timer-total-xizong]'),
    politics: $('[data-study-timer-total-politics]'),
    english: $('[data-study-timer-total-english]')
  };

  let lastModel = null;
  let drag = null;

  function clampXY(x, y) {
    const rect = root.getBoundingClientRect();
    return {
      x: Math.max(EDGE, Math.min(x, Math.max(EDGE, window.innerWidth - rect.width - EDGE))),
      y: Math.max(EDGE, Math.min(y, Math.max(EDGE, window.innerHeight - rect.height - EDGE)))
    };
  }

  function placeAt(x, y, persist = false) {
    const next = clampXY(x, y);
    root.style.left = `${next.x}px`;
    root.style.top = `${next.y}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    if (persist) savePosition(storage, next.x, next.y);
    return next;
  }

  function clampCurrentPosition() {
    if (!root.style.left || !root.style.top) return;
    const rect = root.getBoundingClientRect();
    placeAt(rect.left, rect.top, true);
  }

  function restorePosition() {
    const saved = safeStoredPosition(storage);
    if (saved) placeAt(saved.x, saved.y, false);
  }

  function resetPosition() {
    try { storage.removeItem(POSITION_KEY); } catch {}
    for (const property of ['left', 'top', 'right', 'bottom']) root.style.removeProperty(property);
  }

  function render() {
    const model = timer.read(Date.now());
    lastModel = model;
    const active = model.active || {};
    const running = Boolean(active.running);
    const activeSubject = active.subject || null;
    const pendingItems = (model.reviewCandidates || []).filter(item => item?.status === 'pending');

    root.dataset.running = running ? 'true' : 'false';
    root.dataset.hasPending = pendingItems.length ? 'true' : 'false';
    subject.textContent = activeSubject ? SUBJECT_LABELS[activeSubject] || activeSubject : '未开始';
    elapsed.textContent = running ? formatClock(active.elapsedMs) : '暂停中';
    pause.textContent = running ? '暂停' : activeSubject ? '继续' : '开始';
    pause.disabled = !running && !activeSubject;

    total.textContent = formatTotal(model.today?.totalMs || 0);
    for (const key of Object.keys(subjectTotals)) {
      subjectTotals[key].textContent = formatTotal(model.today?.bySubject?.[key]?.ms || 0);
    }
    pending.hidden = pendingItems.length === 0;
    if (pendingItems.length) pendingTitle.textContent = `${pendingItems.length} 段学习时间待确认`;

    $$('[data-study-timer-switch]').forEach(button => {
      const isActive = button.dataset.studyTimerSwitch === activeSubject;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    root.hidden = false;
  }

  function toggleExpanded(force) {
    const next = typeof force === 'boolean' ? force : root.dataset.expanded !== 'true';
    root.dataset.expanded = next ? 'true' : 'false';
    expanded.hidden = !next;
    expand.setAttribute('aria-expanded', next ? 'true' : 'false');
    expand.setAttribute('aria-label', next ? '收起今日计时' : '展开今日计时');
    window.requestAnimationFrame(clampCurrentPosition);
  }

  pause.addEventListener('click', () => {
    const active = lastModel?.active;
    if (active?.running) timer.pause();
    else timer.resume();
    render();
  });

  expand.addEventListener('click', () => toggleExpanded());

  $$('[data-study-timer-switch]').forEach(button => {
    button.addEventListener('click', () => {
      timer.switchSubject(button.dataset.studyTimerSwitch);
      render();
    });
  });

  reset.addEventListener('click', () => {
    resetPosition();
    window.requestAnimationFrame(clampCurrentPosition);
  });

  handle.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    drag = { pointerId: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    root.dataset.dragging = 'true';
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    placeAt(event.clientX - drag.dx, event.clientY - drag.dy, false);
  });

  const endDrag = event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = root.getBoundingClientRect();
    placeAt(rect.left, rect.top, true);
    handle.releasePointerCapture?.(event.pointerId);
    drag = null;
    root.dataset.dragging = 'false';
  };
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  const onTimerChange = () => render();
  const onResize = () => window.requestAnimationFrame(clampCurrentPosition);
  const onStorage = event => {
    if (event.key === POSITION_KEY) {
      const saved = safeStoredPosition(storage);
      if (saved) placeAt(saved.x, saved.y, false);
      else resetPosition();
    }
  };
  window.addEventListener('kianos:study-timer-change', onTimerChange);
  window.addEventListener('resize', onResize);
  window.addEventListener('storage', onStorage);

  restorePosition();
  render();
  const tick = window.setInterval(render, 1000);

  return {
    render,
    resetPosition,
    destroy() {
      window.clearInterval(tick);
      window.removeEventListener('kianos:study-timer-change', onTimerChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', onStorage);
    }
  };
}
