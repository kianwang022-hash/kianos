// Shared learner-facing navigation hierarchy only.
// Canonical domain ownership remains with its existing lane owners.

export function globalNavigation(base = '/') {
  return [
    { key: 'home', label: 'Home', href: base, icon: 'M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9' },
    { key: 'xizong', label: '西综', href: `${base}xizong/`, icon: 'M12 3v18M3 12h18M6 6l12 12M6 18 18 6' },
    { key: 'politics', label: '政治', href: `${base}politics/`, icon: 'M4 20h16M6 17V8m6 9V8m6 9V8M3 6l9-3 9 3H3Z' },
    { key: 'english', label: 'English', href: `${base}english/`, icon: 'M4 5h7a4 4 0 0 1 4 4v11a4 4 0 0 0-4-3H4V5Zm11 4a4 4 0 0 1 4-4h2v12h-2a4 4 0 0 0-4 3' },
    { key: 'skills', label: 'Skills', href: `${base}skills/`, icon: 'M7 4h10v4H7V4Zm-2 7h14v9H5v-9Zm4 3h6' }
  ];
}

export const ENGLISH_FAMILY_PREFIXES = [
  'english', 'reading', 'reading-answer', 'reading-review', 'reading-b', 'reading-b-answer',
  'cloze', 'cloze-answer', 'objective-learn', 'translation', 'translation-learn',
  'translation-reference', 'writing', 'writing-learn', 'vocabulary', 'external-reading',
  'english-exam', 'english-exam-writing'
];

export const ENGLISH_RUNTIME_PREFIXES = ENGLISH_FAMILY_PREFIXES.filter(
  (segment) => !['vocabulary', 'english-exam', 'english-exam-writing'].includes(segment)
);

export function englishNavigation(base = '/') {
  return [
    { key: 'overview', label: 'Overview', href: `${base}english/`, match: ['english'] },
    {
      key: 'objective',
      label: 'Objective',
      href: `${base}reading/`,
      match: [
        'reading', 'reading-answer', 'reading-review',
        'cloze', 'cloze-answer',
        'reading-b', 'reading-b-answer',
        'objective-learn'
      ]
    },
    { key: 'translation', label: 'Translation', href: `${base}translation/`, match: ['translation', 'translation-reference', 'translation-learn'] },
    { key: 'writing', label: 'Writing', href: `${base}writing/`, match: ['writing', 'writing-learn'] },
    { key: 'vocabulary', label: 'Vocabulary', href: `${base}vocabulary/`, match: ['vocabulary'] }
  ];
}

export function politicsNavigation(base = '/') {
  return [
    { key: 'overview', label: '总览', href: `${base}politics/`, matchPath: /^politics\/?$/ },
    { key: 'learn', label: '学习', href: `${base}politics/learn/`, matchPath: /^politics\/(?:learn(?:\/|$)|(?!practice(?:\/|$)|review(?:\/|$)|practice-review(?:\/|$)).+)/ },
    { key: 'practice', label: '肖1000', href: `${base}politics/practice/`, matchPath: /^politics\/practice(?:\/|$)/ },
    { key: 'review', label: '复习', href: `${base}politics/review/`, matchPath: /^politics\/(?:review|practice-review)(?:\/|$)/ }
  ];
}

export function xizongNavigation(base = '/') {
  return [
    { key: 'overview', label: '总览', href: `${base}xizong/`, matchPath: /^xizong\/?$/ },
    { key: 'learn', label: '学习', href: `${base}xizong/`, matchPath: /^xizong\/(?!practice(?:\/|$)|memory(?:\/|$)).+/ },
    { key: 'practice', label: '训练', href: `${base}xizong/practice/`, matchPath: /^xizong\/practice(?:\/|$)/ },
    { key: 'memory', label: '记忆', href: `${base}xizong/memory/`, matchPath: /^xizong\/memory(?:\/|$)/ }
  ];
}

export function localRoute(pathname, base = '/') {
  return pathname.slice(base.length).replace(/^\/+|\/+$/g, '');
}

export function topSegment(localPath = '') {
  return localPath.split('/').filter(Boolean)[0] || '';
}

export function isEnglishFamily(localPath = '') {
  return ENGLISH_FAMILY_PREFIXES.includes(topSegment(localPath));
}

export function isEnglishRuntime(localPath = '') {
  return ENGLISH_RUNTIME_PREFIXES.includes(topSegment(localPath));
}

export function isEnglishImmersiveTaskRuntime(localPath = '') {
  const parts = localPath.split('/').filter(Boolean);
  const segment = parts[0] || '';
  if (parts.length < 2) return false;
  return [
    'reading',
    'reading-answer',
    'reading-review',
    'cloze',
    'cloze-answer',
    'reading-b',
    'reading-b-answer',
    'translation',
    'translation-reference',
    'writing',
    'english-exam-writing'
  ].includes(segment);
}

export function isPoliticsFamily(localPath = '') {
  return topSegment(localPath) === 'politics';
}

export function isXizongFamily(localPath = '') {
  return topSegment(localPath) === 'xizong';
}

export function resolveGlobalActive(localPath = '', active = 'home') {
  const segment = topSegment(localPath);
  if (ENGLISH_FAMILY_PREFIXES.includes(segment)) return 'english';
  if (segment === 'xizong') return 'xizong';
  if (segment === 'politics') return 'politics';
  if (segment === 'skills') return 'skills';
  return active;
}

export function resolveEnglishActive(localPath = '') {
  const segment = topSegment(localPath);
  return englishNavigation('/').find((entry) => entry.match.includes(segment))?.key || 'overview';
}

function resolvePathNavigationActive(localPath, entries) {
  return entries.find((entry) => entry.matchPath?.test(localPath))?.key || entries[0]?.key || 'overview';
}

export function subjectShell(localPath = '', base = '/') {
  // Vocabulary is an English child workspace, but once entered it owns one local top bar.
  // Keep English active in L1 and return through the explicit ← English control instead
  // of stacking the parent English L2 above Vocabulary's own navigation.
  if (['vocabulary', 'external-reading'].includes(topSegment(localPath))) return null;

  if (isEnglishFamily(localPath)) {
    if (isEnglishImmersiveTaskRuntime(localPath)) return null;
    const items = englishNavigation(base);
    return {
      key: 'english',
      label: 'English',
      items,
      active: resolveEnglishActive(localPath)
    };
  }

  if (isPoliticsFamily(localPath)) {
    const items = politicsNavigation(base);
    return {
      key: 'politics',
      label: '政治',
      items,
      active: resolvePathNavigationActive(localPath, items)
    };
  }

  if (isXizongFamily(localPath)) {
    const items = xizongNavigation(base);
    return {
      key: 'xizong',
      label: '西综',
      items,
      active: resolvePathNavigationActive(localPath, items)
    };
  }

  return null;
}
