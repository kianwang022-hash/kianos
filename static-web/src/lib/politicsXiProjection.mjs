function renderSafeHierarchy(value) {
  if (!Array.isArray(value)) return value;

  const rows = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const label = String(item.role || item.label || item.title || `层级 ${index + 1}`).trim();
      const meaning = String(item.meaning || item.value || item.description || '').trim();
      if (!label || !meaning) return null;
      return [label, meaning];
    })
    .filter(Boolean);

  return rows.length ? Object.fromEntries(rows) : null;
}

export function applyXiProjection(chapter, subject) {
  if (subject !== 'xi' || !chapter) return chapter;

  return {
    ...chapter,
    units: (chapter.units || []).map((unit) => {
      const rawHierarchy = unit?.teaching?.hierarchy;
      if (!Array.isArray(rawHierarchy)) return unit;

      const hierarchy = renderSafeHierarchy(rawHierarchy);
      return {
        ...unit,
        teaching: {
          ...(unit.teaching || {}),
          hierarchy
        },
        xiProjection: {
          normalizedHierarchyRows: hierarchy ? Object.keys(hierarchy).length : 0
        }
      };
    })
  };
}
