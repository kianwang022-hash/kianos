import { safeProductHref } from './examDemand.mjs';

const XIZONG_LAST_LOCATION_KEY = 'kianos-xizong-last-location-v1';

export function resolveXizongHomeResume(storage, fallback, base = '/') {
  let last = null;
  try { last = JSON.parse(storage.getItem(XIZONG_LAST_LOCATION_KEY) || 'null'); }
  catch { return fallback; }

  const href = safeProductHref(last?.href, base, ['xizong']);
  if (!href) return fallback;

  const title = last?.blockTitle
    ? [last.blockLabel, last.blockTitle].filter(Boolean).join(' · ')
    : [last?.systemCanonical, last?.systemTitle || last?.systemId].filter(Boolean).join(' · ');
  const systemLabel = last?.systemCanonical || last?.systemId || '西综';

  return {
    subject: 'xizong',
    href,
    title: title || fallback.title,
    meta: last?.blockTitle ? `${systemLabel} · 最近 Block` : `${systemLabel} · 最近 System`,
    attention: ''
  };
}
