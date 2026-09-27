import { readExamChatPlanForDisplay, examScheduleInterval } from './examChatPlan.mjs';
import { studyDayAt } from './studyTimer.mjs';
import {
  STEWARD_REALITY_KEY,
  beginStewardBreak,
  endLatestStewardBreak,
  latestOpenStewardBreak,
  readStewardReality,
  recordStewardBreakReentry,
  updateStewardBreak,
  recordStewardQuickReality,
  latestActiveStewardActivity,
  transitionStewardActivity,
  stewardActivityElapsedMs
} from './stewardReality.mjs';

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
  const restPanel = $('[data-study-timer-rest]');
  const restStatus = $('[data-study-timer-rest-status]');
  const restCustom = $('[data-study-timer-rest-custom]');
  const restNote = $('[data-study-timer-rest-note]');
  const restSaveStatus = $('[data-study-timer-rest-save-status]');
  const restSave = $('[data-study-timer-rest-save]');
  const restDismiss = $('[data-study-timer-rest-dismiss]');
  const reentryPanel = $('[data-study-timer-reentry]');
  const reentryNote = $('[data-study-timer-reentry-note]');
  const reentrySaveStatus = $('[data-study-timer-reentry-save-status]');
  const reentrySave = $('[data-study-timer-reentry-save]');
  const reentryDismiss = $('[data-study-timer-reentry-dismiss]');
  const subjectTotals = {
    xizong: $('[data-study-timer-total-xizong]'),
    politics: $('[data-study-timer-total-politics]'),
    english: $('[data-study-timer-total-english]')
  };

  let activePanel = 'details';
  root.dataset.panel = activePanel;
  let lastModel = null;
  let drag = null;
  let activeBreakId = null;
  let hydratedBreakId = null;
  let pendingReentryId = null;
  let hydratedReentryId = null;
  let restPanelDismissed = false;
  let reentryDismissed = false;

  const emitRealityChange = (detail = {}) => {
    window.dispatchEvent(new CustomEvent('kianos:steward-reality-change', { detail }));
  };

  const currentBreak = () => activeBreakId
    ? readStewardReality(storage).events.find(event => event.id === activeBreakId) || null
    : latestOpenStewardBreak(storage);

  const latestPendingReentry = (now = Date.now()) => [...readStewardReality(storage).events]
    .reverse()
    .find(event => event.kind === 'BREAK' && event.endedAt != null && !event.reentry && now >= event.endedAt && now - event.endedAt <= 4 * 60 * 60 * 1000) || null;

  const setRealityControlsDisabled = (disabled) => {
    $$('[data-study-timer-rest-minutes], [data-study-timer-rest-method], [data-study-timer-rest-custom], [data-study-timer-rest-note], [data-study-timer-rest-save], [data-study-timer-reentry-status], [data-study-timer-reentry-note], [data-study-timer-reentry-save]')
      .forEach(node => { node.disabled = Boolean(disabled); });
  };

  const realityWriteError = (message = '休息记录无法安全读取，原数据未改动。') => {
    setRealityControlsDisabled(true);
    if (restSaveStatus) restSaveStatus.textContent = message;
    if (reentrySaveStatus) reentrySaveStatus.textContent = message;
  };

  function hydrateRestPanel(event) {
    if (!event || !restPanel) return;
    activeBreakId = event.id;
    if (hydratedBreakId === event.id) return;
    hydratedBreakId = event.id;
    restCustom.value = event.customMethod || '';
    restNote.value = event.note || '';
    $$('[data-study-timer-rest-minutes]').forEach(button => {
      const minutes = button.dataset.studyTimerRestMinutes === '' ? null : Number(button.dataset.studyTimerRestMinutes);
      button.setAttribute('aria-pressed', String(minutes === event.plannedRestMinutes));
    });
    $$('[data-study-timer-rest-method]').forEach(button => {
      button.setAttribute('aria-pressed', String((event.methods || []).includes(button.dataset.studyTimerRestMethod)));
    });
    if (restSaveStatus) restSaveStatus.textContent = '';
  }

  function renderRecoveryPanels(now = Date.now()) {
    const reality = readStewardReality(storage);
    if (reality.unavailable) {
      activeBreakId = null;
      hydratedBreakId = null;
      pendingReentryId = null;
      setRealityControlsDisabled(true);
      const paused = lastModel?.active?.subject && !lastModel?.active?.running;
      if (restPanel) restPanel.hidden = !paused || restPanelDismissed;
      if (restStatus) restStatus.textContent = '学习已暂停；休息记录无法安全读取，原数据未改动。';
      if (restSaveStatus) restSaveStatus.textContent = '先保留原记录，仍可手动继续学习。';
      if (reentryPanel) reentryPanel.hidden = true;
      return;
    }
    setRealityControlsDisabled(false);
    const open = [...reality.events].reverse().find(event => event.kind === 'BREAK' && event.endedAt == null) || null;
    if (open) {
      activeBreakId = open.id;
      hydrateRestPanel(open);
      if (restPanel) restPanel.hidden = restPanelDismissed;
      if (restStatus) {
        if (open.plannedRestMinutes) {
          const readyAt = open.startedAt + open.plannedRestMinutes * 60_000;
          const remaining = Math.max(0, Math.ceil((readyAt - now) / 60_000));
          restStatus.textContent = now >= readyAt
            ? '已到你设的休息时长；学习仍保持暂停，只有你手动继续才会恢复。'
            : `计时已暂停 · 目标 ${open.plannedRestMinutes} 分钟 · 约剩 ${remaining} 分钟`;
        } else {
          restStatus.textContent = '计时已暂停。没有设置结束时间，也不会自动恢复学习。';
        }
      }
    } else {
      activeBreakId = null;
      hydratedBreakId = null;
      if (restPanel) restPanel.hidden = true;
    }

    const pending = pendingReentryId
      ? readStewardReality(storage).events.find(event => event.id === pendingReentryId && !event.reentry) || null
      : latestPendingReentry(now);
    pendingReentryId = pending?.id || null;
    if (reentryPanel) reentryPanel.hidden = !pending || reentryDismissed;
    if (pending && reentryPanel) {
      if(hydratedReentryId !== pending.id){hydratedReentryId=pending.id;reentryNote.value='';$$('[data-study-timer-reentry-status]').forEach(b=>b.setAttribute('aria-pressed','false'));}
      if (reentrySaveStatus) reentrySaveStatus.textContent = '';
    }
  }

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
    const detail = String(active.context?.detailLabel || '').trim();
    subject.textContent = activeSubject
      ? [SUBJECT_LABELS[activeSubject] || activeSubject, detail && detail !== activeSubject ? detail : null].filter(Boolean).join(' · ')
      : '未开始';
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


    const life = latestActiveStewardActivity(storage);
    if(life) {
      const conflict = Boolean(active.running);
      subject.textContent = conflict ? '当前活动需核对' : life.label;
      elapsed.textContent = life.status === 'PAUSED' ? '暂停中' : formatClock(stewardActivityElapsedMs(life));
      pause.textContent = life.status === 'RUNNING' ? '暂停' : '继续'; pause.disabled = conflict;
      root.dataset.running = String(life.status === 'RUNNING' && !conflict);
    }
    const projection=readExamChatPlanForDisplay(storage,studyDayAt(Date.now()));
    const next=(projection.plan?.presentation?.schedule_blocks||[]).find(b=>examScheduleInterval(b,projection.plan.study_day).start>Date.now());
    const nextNode=$('[data-study-timer-next]');
    if(nextNode){nextNode.hidden=!next;nextNode.textContent=next?`下一项 ${next.start} ${next.label}`:'';}
    root.hidden = false;
    renderRecoveryPanels();

  }

  function toggleExpanded(force, panel = activePanel) {
    activePanel = panel; root.dataset.panel = panel;
    $('[data-study-timer-record-panel]').hidden = panel !== 'record';
    const next = typeof force === 'boolean' ? force : root.dataset.expanded !== 'true';
    root.dataset.expanded = next ? 'true' : 'false';
    expanded.hidden = !next;
    expand.setAttribute('aria-expanded', next ? 'true' : 'false');
    expand.setAttribute('aria-label', next ? '收起今日计时' : '展开今日计时');
    window.requestAnimationFrame(clampCurrentPosition);
  }

  pause.addEventListener('click', () => {
    const active = lastModel?.active;
    const now = Date.now();
    const life=latestActiveStewardActivity(storage);
    if(life){
      try {
        if(life.status==='RUNNING') {
          transitionStewardActivity(storage,'PAUSED',now);
          const e=beginStewardBreak(storage,{startedAt:now,preBreakContext:{route:life.returnHref,detailKey:life.sessionId,detailLabel:life.label,activityKind:life.activityKind,activityId:life.id}});
          activeBreakId=e.id;hydratedBreakId=null;pendingReentryId=null;restPanelDismissed=false;hydrateRestPanel(e);toggleExpanded(true,'rest');
        } else {
          const e=endLatestStewardBreak(storage,now);pendingReentryId=e?.id||null;
          transitionStewardActivity(storage,'RUNNING',now);restPanelDismissed=true;reentryDismissed=false;toggleExpanded(true,e?'reentry':'details');
        }
        emitRealityChange();render();
      } catch { realityWriteError('没有保存成功，请保留当前记录后重试。'); }
      return;
    }
    if (active?.running) {
      const context = { subject: active.subject || '', ...(active.context || {}) };
      timer.pause(now);
      restPanelDismissed = false;
      reentryDismissed = false;
      toggleExpanded(true, 'rest');
      try {
        const event = beginStewardBreak(storage, { startedAt: now, preBreakContext: context });
        activeBreakId = event.id;
        hydratedBreakId = null;
        pendingReentryId = null;
        hydrateRestPanel(event);
        emitRealityChange({ kind: 'break-started', break_id: event.id });
      } catch {
        activeBreakId = null;
        hydratedBreakId = null;
        pendingReentryId = null;
        realityWriteError();
      }
    } else {
      let ended = null;
      try { ended = endLatestStewardBreak(storage, now); } catch {}
      if (ended) pendingReentryId = ended.id;
      restPanelDismissed = true;
      reentryDismissed = false;
      timer.resume(now);
      if (ended) {
        toggleExpanded(true, 'reentry');
        emitRealityChange({ kind: 'break-ended', break_id: ended.id });
      }
    }
    render();
  });


  expand.addEventListener('click', () => toggleExpanded(undefined,
    latestOpenStewardBreak(storage)?'rest':pendingReentryId?'reentry':'details'));
  $$('[data-study-timer-panel]').forEach(b=>b.onclick=()=>toggleExpanded(true,b.dataset.studyTimerPanel));
  $('[data-study-timer-record]').onclick=()=>toggleExpanded(true,'record');
  $('[data-study-timer-record-close]').onclick=()=>toggleExpanded(false);
  const nextElement=$('[data-study-timer-next]');if(nextElement)$('.studyTimerStatus').append(nextElement);
  const quickStatus=$('[data-study-timer-record-status]');
  const pendingQuick=new Map();
  const captureQuick=(value)=>{
    const active=timer.read().active;
    const nonStudy=latestActiveStewardActivity(storage);
    const actualContext=nonStudy?{activityKind:nonStudy.activityKind,activityId:nonStudy.id,route:nonStudy.returnHref,detailKey:nonStudy.sessionId,detailLabel:nonStudy.label}:active?.subject?{...active.context,subject:active.subject}:null;
    const key=JSON.stringify(value);
    if(!pendingQuick.has(key))pendingQuick.set(key,{...value,id:'quick-'+crypto.randomUUID(),observedAt:Date.now(),recordedAt:Date.now(),context:actualContext});
    try {
      const event=recordStewardQuickReality(storage,pendingQuick.get(key));
      pendingQuick.delete(key);
      quickStatus.textContent='已记录';emitRealityChange({kind:'quick',event_id:event.id});return true;
    } catch {quickStatus.textContent='未保存，请重试；备注仍保留。';return false;}
  };
  const lastClick=new WeakMap();
  $$('[data-reality-kind]').forEach(b=>b.onclick=()=>{
    if(Date.now()-(lastClick.get(b)||0)<350)return;
    const type=b.dataset.realityKind,raw=b.dataset.realityValue;
    if(captureQuick({type,value:['WATER','COFFEE'].includes(type)?Number(raw):raw,unit:type==='WATER'?'ml':type==='COFFEE'?'杯':''}))lastClick.set(b,Date.now());
  });
  $('[data-study-timer-record-save]').onclick=()=>{
    const note=$('[data-study-timer-record-note]');if(!note.value.trim()){quickStatus.textContent='还没有备注。';return;}
    if(captureQuick({type:'NOTE',note:note.value}))note.value='';
  };


  $$('[data-study-timer-switch]').forEach(button => {
    button.addEventListener('click', () => {
      const now = Date.now();
      let ended = null;
      try { ended = endLatestStewardBreak(storage, now); } catch {}
      if (ended) {
        pendingReentryId = ended.id;
        restPanelDismissed = true;
        reentryDismissed = false;
      }
      timer.switchSubject(button.dataset.studyTimerSwitch, now);
      if (ended) emitRealityChange({ kind: 'break-ended', break_id: ended.id });
      render();
    });
  });

  $$('[data-study-timer-rest-minutes]').forEach(button => {
    button.addEventListener('click', () => {
      const event = currentBreak();
      if (!event) return;
      const raw = button.dataset.studyTimerRestMinutes;
      const plannedRestMinutes = raw === '' ? null : Number(raw);
      try {
        updateStewardBreak(storage, event.id, { plannedRestMinutes });
        $$('[data-study-timer-rest-minutes]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
        emitRealityChange({ kind: 'break-detail', break_id: event.id });
        renderRecoveryPanels();
      } catch { realityWriteError(); }
    });
  });

  $$('[data-study-timer-rest-method]').forEach(button => {
    button.addEventListener('click', () => {
      const event = currentBreak();
      if (!event) return;
      const method = button.dataset.studyTimerRestMethod || '';
      const methods = new Set(event.methods || []);
      methods.has(method) ? methods.delete(method) : methods.add(method);
      try {
        updateStewardBreak(storage, event.id, { methods: [...methods] });
        button.setAttribute('aria-pressed', String(methods.has(method)));
        emitRealityChange({ kind: 'break-detail', break_id: event.id });
      } catch { realityWriteError(); }
    });
  });

  restSave?.addEventListener('click', () => {
    const event = currentBreak();
    if (!event) return;
    try {
      updateStewardBreak(storage, event.id, {
        customMethod: restCustom?.value || '',
        note: restNote?.value || ''
      });
      if (restSaveStatus) restSaveStatus.textContent = '已保存';
      emitRealityChange({ kind: 'break-detail', break_id: event.id });
    } catch { realityWriteError(); }
  });

  restDismiss?.addEventListener('click', () => {
    restPanelDismissed = true;
    if (restPanel) restPanel.hidden = true;
    toggleExpanded(false);
  });

  $$('[data-study-timer-reentry-status]').forEach(button => {
    button.addEventListener('click', () => {
      $$('[data-study-timer-reentry-status]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
      if (reentrySaveStatus) reentrySaveStatus.textContent = '';
    });
  });

  reentrySave?.addEventListener('click', () => {
    if (!pendingReentryId) return;
    const selected = $('[data-study-timer-reentry-status][aria-pressed="true"]');
    const status = selected?.dataset.studyTimerReentryStatus || '';
    if (!status) {
      if (reentrySaveStatus) reentrySaveStatus.textContent = '可选择一个状态，或直接跳过';
      return;
    }
    try {
      const event = recordStewardBreakReentry(storage, pendingReentryId, {
        status,
        note: reentryNote?.value || '',
        at: Date.now()
      });
      if (!event) return;
      if (reentrySaveStatus) reentrySaveStatus.textContent = '已保存';
      emitRealityChange({ kind: 'break-reentry', break_id: event.id, status });
      pendingReentryId = null;
      window.setTimeout(() => {
        if (reentryPanel) reentryPanel.hidden = true;
      }, 500);
    } catch { realityWriteError(); }
  });

  reentryDismiss?.addEventListener('click', () => {
    reentryDismissed = true;
    if (reentryPanel) reentryPanel.hidden = true;
    toggleExpanded(false);
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

  const onTimerChange = () => {
    const model = timer.read(Date.now());
    const open = latestOpenStewardBreak(storage);
    if (model?.active?.running && open) {
      let ended = null;
      try { ended = endLatestStewardBreak(storage, Date.now()); } catch {}
      if (ended) {
        pendingReentryId = ended.id;
        restPanelDismissed = true;
        reentryDismissed = false;
        emitRealityChange({ kind: 'break-ended', break_id: ended.id });
      }
    }
    render();
  };
  const onResize = () => window.requestAnimationFrame(clampCurrentPosition);
  const onStorage = event => {
    if (event.key === POSITION_KEY) {
      const saved = safeStoredPosition(storage);
      if (saved) placeAt(saved.x, saved.y, false);
      else resetPosition();
    }
    if (event.key === STEWARD_REALITY_KEY) renderRecoveryPanels();
  };
  window.addEventListener('kianos:study-timer-change', onTimerChange);
  window.addEventListener('resize', onResize);
  window.addEventListener('storage', onStorage);


  const RETURN_KEY='kianos-steward-return-view-v1';
  const todayLink=$('[data-study-timer-today]');
  const onSteward=/\/steward\/?$/.test(location.pathname);
  const nativeReturn=()=>{const route=timer.read().active?.context?.route;
    if(typeof route!=='string'||route.startsWith('manual:'))return null;
    try{const u=new URL(route.startsWith('/')?route:'/'+route,location.origin);return u.origin===location.origin&&/^\/(?:xizong|politics|english|writing|translation|reading|reading-b|cloze|vocabulary)\//.test(u.pathname)?u.pathname+u.search+u.hash:null;}catch{return null;}
  };
  const safeAnchor=()=>{try{const a=JSON.parse(sessionStorage.getItem(RETURN_KEY)||'null');const u=a&&new URL(a.href,location.origin);return u?.origin===location.origin&&Date.now()-a.at<12*3600000&&!/\/steward\/?$/.test(u.pathname)?a:null;}catch{return null;}};
  if(onSteward){
    const anchor=safeAnchor(),fallback=nativeReturn();todayLink.textContent=anchor||fallback?'返回':'学习入口';todayLink.href=anchor?.href||fallback||'/';
    todayLink.onclick=()=>{
      const a=safeAnchor();if(a){try{sessionStorage.setItem(RETURN_KEY,JSON.stringify({...a,restore:true}));}catch{}}
      const life=latestActiveStewardActivity(storage);
      if(life){try{transitionStewardActivity(storage,'ENDED');emitRealityChange();}catch{}}
    };
  } else {
    todayLink.onclick=()=>{
      const scrolls=[...document.querySelectorAll('[id],textarea[data-essay-draft],textarea[data-translation-draft],main.productCanvas,.portedReadingPassage,.portedReadingQuestions,.clozePassage,.clozeQuestions,.translationSource,.translationWork,.writingPrompt,.writingWork,.politicsUnitCognition,.politicsUnitCompanion,.portedStudyMain,.portedStudyOutline')].filter(n=>n.scrollTop||n.scrollLeft).map(n=>({id:n.id||null,selector:n.id?null:n.matches('[data-essay-draft]')?'[data-essay-draft]':n.matches('[data-translation-draft]')?'[data-translation-draft]':n.matches('main.productCanvas')?'main.productCanvas':'.'+[...n.classList].filter(c=>/^(ported|cloze|translation|writing|politics)/.test(c)).join('.'),top:n.scrollTop,left:n.scrollLeft}));
      try{sessionStorage.setItem(RETURN_KEY,JSON.stringify({href:location.pathname+location.search+location.hash,at:Date.now(),x:scrollX,y:scrollY,scrolls,restore:false}));}catch{}
    };
    const restoreReturn=()=>{const a=safeAnchor();if(!a?.restore||a.href!==location.pathname+location.search+location.hash)return;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{window.scrollTo(a.x,a.y);for(const s of a.scrolls||[]){const n=s.id?document.getElementById(s.id):s.selector?document.querySelector(s.selector):null;if(n){n.scrollTop=s.top;n.scrollLeft=s.left;}}try{sessionStorage.setItem(RETURN_KEY,JSON.stringify({...a,restore:false}));}catch{}}));
    };
    window.addEventListener('pageshow',restoreReturn);restoreReturn();
  }
  const onStewardAction=e=>{
    const action=e.detail?.action;
    if(action==='pause')pause.click();
    if(action==='record')toggleExpanded(true,'record');
    if(action==='details')toggleExpanded(true,'details');
    if(action==='return')todayLink.click();
  };
  window.addEventListener('kianos:steward-dock-action',onStewardAction);
  window.addEventListener('kianos:steward-reality-change',render);
  window.addEventListener('keydown',e=>{if(e.key==='Escape')toggleExpanded(false);});

  render();
  restorePosition();
  window.requestAnimationFrame(clampCurrentPosition);
  const tick = window.setInterval(render, 1000);

  return {
    render,
    resetPosition,
    destroy() {
      window.clearInterval(tick);
      window.removeEventListener('kianos:study-timer-change', onTimerChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('kianos:steward-dock-action',onStewardAction);
      window.removeEventListener('kianos:steward-reality-change',render);
    }
  };
}
