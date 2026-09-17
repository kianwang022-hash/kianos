import { safeProductHref } from './examDemand.mjs';
import { readPoliticsSnapshot, resolvePoliticsContinue } from './politicsPracticeState.mjs';

export function resolvePoliticsHomeResume(storage, fallback, base = '/', catalog = null) {
  const snapshot = readPoliticsSnapshot(storage);
  if (snapshot.errors.length) {
    return {
      ...fallback,
      subject: 'politics',
      meta: '记录未能完整读取，先核对存储。',
      attention: '记录待核对'
    };
  }
  if (!catalog || !Array.isArray(catalog.questions)) return fallback;

  const target = resolvePoliticsContinue(catalog, snapshot, base);
  if (!target) return fallback;
  const href = safeProductHref(target.href, base, ['politics']);
  if (!href) {
    return {
      ...fallback,
      subject: 'politics',
      attention: target.stale ? '记录待核对' : ''
    };
  }

  return {
    subject: 'politics',
    href,
    title: target.title || fallback.title,
    meta: target.detail || fallback.meta,
    attention: target.stale ? '记录待核对' : ''
  };
}
