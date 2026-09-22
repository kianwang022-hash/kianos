// One browser page may mutate the existing native learner stores at a time.
// Web Locks provides cross-agent exclusion; localStorage flags are not locks.
// This is ephemeral ownership only: no learner copy, lease TTL or second ledger.
const browser = typeof window !== 'undefined' && typeof document !== 'undefined';
const singletonKey=Symbol.for('kianos.native.learner-writer');
const existing=browser?window[singletonKey]:null;
let ownsWrites = !browser;
let retired = false;
let releaseLock = null;
let stopRequests = null;
let channel = null;
let nativeStorage = null;
const blockedNodes = new Map();
const LOCK = 'kianos-native-learner-writer-v1';
const keyOwned = key => /^kianos[-:]/.test(String(key));
const WAITING_NOTICE_DELAY_MS = 600;
let writerState = 'idle';
let waitingNoticeTimer = null;

function ensureNotice() {
  let notice = document.querySelector('[data-learner-writer-notice]');
  if (!notice) {
    notice = document.createElement('p');
    notice.setAttribute('data-learner-writer-notice', '');
    notice.setAttribute('role', 'status');
    notice.hidden = true;
    document.body.prepend(notice);
  }
  return notice;
}

function clearWaitingNoticeTimer() {
  if (waitingNoticeTimer !== null) window.clearTimeout(waitingNoticeTimer);
  waitingNoticeTimer = null;
}

function showState(state) {
  writerState = state;
  document.documentElement.dataset.learnerWriter = state;
  clearWaitingNoticeTimer();
  let notice = document.querySelector('[data-learner-writer-notice]');

  if (state === 'waiting') {
    // Keep write protection immediate, but do not flash a transient banner on routine navigation.
    if (notice) notice.hidden = true;
    waitingNoticeTimer = window.setTimeout(() => {
      waitingNoticeTimer = null;
      if (writerState !== 'waiting') return;
      const delayedNotice = ensureNotice();
      delayedNotice.textContent = '正在接续最新学习记录…';
      delayedNotice.hidden = false;
    }, WAITING_NOTICE_DELAY_MS);
  } else if (state === 'active') {
    if (notice) notice.hidden = true;
  } else {
    notice = ensureNotice();
    notice.textContent = state === 'retired'
      ? '学习已切换到另一个页面。返回这里时会重新读取最新进度。'
      : state === 'unavailable'
        ? '当前浏览器无法安全保存学习记录。原记录没有改动；内容仍可阅读。'
        : '';
    notice.hidden = false;
  }
  if (state === 'active' || state === 'unavailable') {
    for (const [node, wasInert] of blockedNodes) if (node.isConnected) node.inert = wasInert;
    blockedNodes.clear();
  } else {
    for (const node of document.body.children) {
      if (!(node instanceof HTMLElement) || node === notice || node.tagName === 'SCRIPT') continue;
      if (!blockedNodes.has(node)) blockedNodes.set(node, node.inert);
      node.inert = true;
    }
  }
}

export function assertLearnerStorageWritable(storage) {
  if(existing)return existing.assertWritable(storage);
  if (browser && storage === nativeStorage && !ownsWrites) {
    throw new Error('KIANOS_LEARNER_WRITER_RELOAD_REQUIRED');
  }
}

function retire() {
  if (!ownsWrites || retired) return;
  // A message callback cannot interrupt the synchronous native transaction.
  // Revoke writes BEFORE releasing the kernel-backed lock. Late async callbacks
  // keep this retired realm and may not write even after another page takes over.
  ownsWrites = false;
  retired = true;
  showState('retired');
  window.dispatchEvent(new Event('kianos:learner-writer-retired'));
  releaseLock?.();
  releaseLock = null;
  channel?.close();
}

function guardNativeStorage(storage) {
  const prototype = Object.getPrototypeOf(storage);
  for (const method of ['setItem', 'removeItem', 'clear']) {
    const original = prototype[method];
    Object.defineProperty(prototype, method, {
      configurable: true, writable: true,
      value: function (...args) {
        if (this === storage && (method === 'clear' || keyOwned(args[0]))) {
          assertLearnerStorageWritable(storage);
        }
        return Reflect.apply(original, this, args);
      }
    });
  }
}

export const learnerWriterReady = existing?.ready || (!browser ? Promise.resolve() : new Promise((resolve) => {
  const begin = () => {
    showState('waiting');
    try {
      nativeStorage = window.localStorage;
      guardNativeStorage(nativeStorage);
      if (!navigator.locks?.request || typeof BroadcastChannel !== 'function') {
        showState('unavailable');
        return; // Reading stays possible; never use an unsafe lock fallback.
      }
      const id = crypto.randomUUID();
      channel = new BroadcastChannel(LOCK);
      channel.onmessage = ({data}) => {
        // Merely opening a background source page must not steal a focused
        // learner's writer. Only the actually focused KianOS page asks to enter.
        if (data?.kind === 'request' && data.id !== id && !document.hasFocus()) retire();
      };
      let requested=false;
      const acquireWhenFocused=()=>{
        if(requested || retired || !document.hasFocus())return;
        requested=true;
        const requestHandoff=()=>{
          if(document.hasFocus())channel?.postMessage({kind:'request',id});
        };
        const timer=window.setInterval(requestHandoff,250);
        stopRequests=()=>window.clearInterval(timer);
        void navigator.locks.request(LOCK,{mode:'exclusive'},async()=>{
          stopRequests();
          if(!document.hasFocus()){requested=false;return;}
          ownsWrites=true;
          showState('active');
          window.dispatchEvent(new Event('kianos:learner-writer-ready'));
          resolve();
          await new Promise(done=>{releaseLock=done;});
        }).catch(()=>{stopRequests();ownsWrites=false;showState('unavailable');});
        requestHandoff();
      };
      window.addEventListener('focus',event=>{
        if(retired){event.stopImmediatePropagation();window.location.reload();}
        else acquireWhenFocused();
      },true);
      acquireWhenFocused();
      window.addEventListener('pageshow', event => {
        if (event.persisted) window.location.reload(); // Never revive stale closures from bfcache.
      });
      window.addEventListener('pagehide', () => {
        stopRequests?.();
        retire();
        channel?.close();
      });
    } catch {
      ownsWrites = false;
      showState('unavailable');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, {once:true});
  else begin();
}));
if(browser&&!existing)window[singletonKey]={ready:learnerWriterReady,assertWritable:assertLearnerStorageWritable};

// The browser caller owns the page lease; Node callers supply exclusive storage.
// Roll back only bytes written by THIS transaction. An unexpected competing
// value is retained and reported, never deleted to recreate an old snapshot.
export function commitLearnerStorageChanges(storage, changes, expected = null) {
  assertLearnerStorageWritable(storage);
  const next = new Map(changes.map(([key, raw]) => [key, raw == null ? null : String(raw)]));
  const before = new Map([...next.keys()].map(key => [key, storage.getItem(key)]));
  if (expected) for (const [key, raw] of expected) {
    if (storage.getItem(key) !== raw) throw new Error('KIANOS_LEARNER_STORAGE_STALE');
  }
  const touched = [];
  try {
    for (const [key, raw] of next) {
      if (raw === before.get(key)) continue;
      if (storage.getItem(key) !== before.get(key)) throw new Error('KIANOS_LEARNER_STORAGE_STALE');
      touched.push([key, raw]);
      if (raw == null) storage.removeItem(key); else storage.setItem(key, raw);
      if (storage.getItem(key) !== raw) throw new Error('KIANOS_LEARNER_STORAGE_WRITE_UNVERIFIED');
    }
  } catch (error) {
    let failed = false;
    for (const [key, ownRaw] of touched.reverse()) {
      try {
        const current = storage.getItem(key), prior = before.get(key);
        if (current === prior) continue;
        if (current !== ownRaw) { failed = true; continue; }
        if (prior == null) storage.removeItem(key); else storage.setItem(key, prior);
        if (storage.getItem(key) !== prior) failed = true;
      } catch { failed = true; }
    }
    if (failed) throw new Error('KIANOS_LEARNER_STORAGE_ROLLBACK_CONFLICT_PRESERVED');
    throw error;
  }
}
