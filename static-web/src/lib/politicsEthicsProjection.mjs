export function applyEthicsProjection(chapter, subject) {
  if (subject !== 'ethics_law' || !chapter) return chapter;

  return {
    ...chapter,
    units: (chapter.units || []).map((unit) => {
      const evaluationAnchor = String(unit?.raw?.evaluation_anchor || '').trim();
      if (!evaluationAnchor) return unit;
      return {
        ...unit,
        teaching: {
          ...(unit.teaching || {}),
          evaluationAnchor
        },
        ethicsProjection: {
          evaluationAnchor: true
        }
      };
    })
  };
}
