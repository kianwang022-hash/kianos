import { readPoliticsSnapshot, selectPoliticsReview } from './politicsPracticeState.mjs';
import { deriveXizongQuestionIdsForCurrentRound } from './xizongQuestionAttempts.mjs';
import { robustMinutes } from './examOrchestrator.mjs';

export function safeProductHref(href, base = '/', families = ['xizong', 'english', 'reading', 'cloze', 'reading-b', 'translation', 'writing', 'politics', 'vocabulary']) {
  if (typeof href !== 'string' || !href.startsWith(base) || href.startsWith('//')) return null;
  try {
    const u = new URL(href, 'https://kianos.invalid');
    if (u.origin !== 'https://kianos.invalid' || !families.some(f => u.pathname.startsWith(`${base}${f}/`))) return null;
    return u.pathname + u.search + u.hash;
  } catch { return null; }
}
// Subject selectors, not the planner, decide eligibility. All reads are private.
export function readExamDemand(storage, catalog, nativeContinue = {}) {
  const errors = [];
  const read = (key, fallback) => { try { const raw = storage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch { errors.push(key); return fallback; } };
  const p = readPoliticsSnapshot(storage);
  const review = selectPoliticsReview(catalog.politics, p, { filter: 'problems' });
  errors.push(...p.errors);
  // Native task durations estimate task cost, not mastery or total study time.
  const samples = Object.values(p.session?.results || {}).map(r => Number(r?.elapsedMs) / 60000).filter(n => n >= 0.1 && n <= 60);
  const estimate = robustMinutes(samples, 3);
  let xCount = 0;
  const held = read('kianos:xizong:full-paper-holdout-years:v1', []);
  for (const system of catalog.xizong || []) {
    const state = read(`kianos:xizong:system-question-sweep:${system.id}:v1`, null);
    if (!state || state.round?.studyPhase !== 'SECOND_PASS' || state.round?.queueMode === 'FULL_RESWEEP') continue;
    const history = (Array.isArray(state.attemptHistory) ? state.attemptHistory : []).filter(e => e.system_id === system.id && e.scope_hash === system.scopeHash && e.question_inventory_hash === system.inventoryHash);
    const ids = deriveXizongQuestionIdsForCurrentRound({ ...state, attemptHistory: history }, system.questions, Array.isArray(held) ? held : []);
    xCount += ids.filter(id => !state.results?.[id]).length;
  }
  const result = {
    xizong: { reviewMinutes: xCount * 3, estimateNote: xCount ? '仅计当前已进入二轮的待做题；单题先用粗略时长，不把整个系统重算一遍。' : null },
    english: { reviewMinutes: 0, estimateNote: '英语任务由本身的 Continue 选择；没有完整任务证据时不推算英语总分。' },
    politics: { reviewMinutes: p.errors.length ? 0 : review.problemIds.length * estimate.minutes,
      estimateNote: review.problemIds.length ? (estimate.confidence === 'observed' ? '回访时长参考本机实际题目用时的中位数，仍是粗估，不是学习债。' : '回访先按每题约 3 分钟粗估；真实题目用时足够后自动替代种子值。') : null }
  };
  for (const [subject, target] of Object.entries(nativeContinue)) {
    const href = safeProductHref(target?.href, catalog.base);
    if (href && result[subject]) result[subject].continue = { href, title: String(target.title || subject), subject };
  }
  return { demands: result, errors };
}
