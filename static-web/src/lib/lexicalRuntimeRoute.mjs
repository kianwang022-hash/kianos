const normalizeBase = (base = '/') => {
  const value = String(base || '/');
  return value.endsWith('/') ? value : value + '/';
};

export function lexicalWordRuntimeHref(base, ordinal, mode = 'study') {
  const n = Number(ordinal);
  if (!Number.isInteger(n) || n < 1) return normalizeBase(base) + 'vocabulary/';
  const url = new URL(normalizeBase(base) + 'vocabulary/word/', 'http://kianos.local');
  url.searchParams.set('o', String(n));
  if (mode && mode !== 'study') url.searchParams.set('mode', String(mode));
  return url.pathname + url.search;
}

export function lexicalWordOrdinal(locationLike = globalThis.location) {
  const search = new URLSearchParams(String(locationLike?.search || ''));
  const queryOrdinal = Number(search.get('o') || 0);
  if (Number.isInteger(queryOrdinal) && queryOrdinal > 0) return queryOrdinal;
  const match = String(locationLike?.pathname || '').match(/\/vocabulary\/(\d+)\/?$/i);
  const pathOrdinal = Number(match?.[1] || 0);
  return Number.isInteger(pathOrdinal) && pathOrdinal > 0 ? pathOrdinal : 0;
}

export function lexicalLegacyDisplayHref(base, ordinal, mode = 'study') {
  const n = Number(ordinal);
  const root = normalizeBase(base);
  if (!Number.isInteger(n) || n < 1) return root + 'vocabulary/';
  const suffix = mode && mode !== 'study' ? '?mode=' + encodeURIComponent(String(mode)) : '';
  return root + 'vocabulary/' + n + '/' + suffix;
}
