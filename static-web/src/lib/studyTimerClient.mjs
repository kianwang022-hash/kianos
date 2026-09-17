import {
  adjustActiveStudyTimer,
  buildDailyStudyTimePacket,
  buildStudyTimerReadModel,
  editStudySession,
  pauseStudyTimer,
  readStudyTimerState,
  resolveStudyTimerContext,
  resumeStudyTimer,
  setStudyTimerContext,
  touchStudyTimer
} from './studyTimer.mjs';

const CHANGE_EVENT = 'kianos:study-timer-change';
const STORAGE_KEYS = new Set(['kianos-study-timer-state-v2', 'kianos-study-timer-ledger-v2']);

function emit(detail = {}) {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }));
}

function currentContext(base) {
  return resolveStudyTimerContext(window.location.pathname, base);
}

export function initStudyTimerRuntime({ base = import.meta.env.BASE_URL } = {}) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const storage = window.localStorage;

  const applyRouteContext = (source = 'route') => {
    const context = currentContext(base);
    if (!context) return readStudyTimerState(storage);
    const state = setStudyTimerContext(storage, context, Date.now(), { source });
    emit({ reason: source, state });
    return state;
  };

  // A subject page becomes the active study context only when this tab is actually focused.
  // Home / Current / debug surfaces never become a fourth study subject and do not clear
  // the last active subject, so leaving the browser for MarginNote continues that subject.
  if (document.hasFocus()) applyRouteContext('initial-focus');

  const onFocus = () => applyRouteContext('focus');
  window.addEventListener('focus', onFocus);
  window.addEventListener('pageshow', () => {
    if (document.hasFocus()) applyRouteContext('pageshow');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.hasFocus()) applyRouteContext('visible-focus');
    // Intentionally no auto-pause when hidden: MarginNote / iPad study remains part of
    // the current subject until Kian manually pauses or switches subject.
  });

  const heartbeat = window.setInterval(() => {
    const state = touchStudyTimer(storage, Date.now());
    emit({ reason: 'heartbeat', state });
  }, 60_000);

  window.addEventListener('storage', (event) => {
    if (event.key && STORAGE_KEYS.has(event.key)) emit({ reason: 'storage' });
  });

  const api = {
    read: (now = Date.now()) => buildStudyTimerReadModel(storage, now),
    packet: (options = {}) => buildDailyStudyTimePacket(storage, options),
    pause: (now = Date.now()) => {
      const state = pauseStudyTimer(storage, now);
      emit({ reason: 'manual-pause', state });
      return state;
    },
    resume: (now = Date.now()) => {
      const state = resumeStudyTimer(storage, currentContext(base), now);
      emit({ reason: 'manual-resume', state });
      return state;
    },
    switchSubject: (subject, now = Date.now()) => {
      const routeContext = currentContext(base);
      const context = routeContext?.subject === subject
        ? routeContext
        : { subject, route: `manual:${subject}`, detailKey: 'manual', detailLabel: 'Manual subject switch' };
      const state = readStudyTimerState(storage);
      const next = state.running
        ? setStudyTimerContext(storage, context, now, { source: 'manual-subject-switch' })
        : resumeStudyTimer(storage, context, now);
      emit({ reason: 'manual-subject-switch', state: next });
      return next;
    },
    adjustActive: (patch, now = Date.now()) => {
      const state = adjustActiveStudyTimer(storage, patch, now);
      emit({ reason: 'active-correction', state });
      return state;
    },
    editSession: (sessionId, patch) => {
      const session = editStudySession(storage, sessionId, patch);
      emit({ reason: 'session-correction', session });
      return session;
    },
    refreshContext: () => applyRouteContext('manual-refresh-context'),
    destroy: () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('focus', onFocus);
    }
  };

  window.KianOSStudyTimer = api;
  return api;
}
