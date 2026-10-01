const normalizeBase = (base = '/') => {
  const value = String(base || '/');
  return value.endsWith('/') ? value : value + '/';
};

export function lexicalWordRuntimeHref(base, ordinal, mode = 'study', revisit = null) {
  const n = Number(ordinal);
  if (!Number.isInteger(n) || n < 1) return normalizeBase(base) + 'vocabulary/';
  const url = new URL(normalizeBase(base) + 'vocabulary/word/', 'http://kianos.local');
  url.searchParams.set('o', String(n));
  if (mode && mode !== 'study') url.searchParams.set('mode', String(mode));
  if (revisit) {
    url.searchParams.set('revisit', revisit.ordinals.join(','));
    url.searchParams.set('day', revisit.day);
  }
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

// URL navigation snapshot, selected from today's routing projection on Home.
// It is not a second learner ledger; re-entry on Home recompiles the live set.
export function lexicalRevisitContext(locationLike, total, today) {
  const search = new URLSearchParams(String(locationLike?.search || ''));
  if (!search.has('revisit')) return null;
  const raw = search.get('revisit') || '';
  const day = search.get('day');
  const ordinals = raw.split(',').map(Number);
  if (day !== today || !/^[1-9]\d*(,[1-9]\d*)*$/.test(raw)
      || ordinals.length > total || new Set(ordinals).size !== ordinals.length
      || ordinals.some(n => !Number.isInteger(n) || n < 1 || n > total)) {
    return { invalid: true };
  }
  return { day, ordinals };
}

export function lexicalStudyNeighbors(ordinal, total, revisit = null) {
  if (revisit) {
    const index = revisit.ordinals?.indexOf(ordinal) ?? -1;
    if (revisit.invalid || index < 0) return { invalid: true };
    return { previous: revisit.ordinals[index - 1] || null,
      next: revisit.ordinals[index + 1] || null, position: index + 1,
      count: revisit.ordinals.length };
  }
  return { previous: ordinal > 1 ? ordinal - 1 : null,
    next: ordinal < total ? ordinal + 1 : null, position: ordinal, count: total };
}
