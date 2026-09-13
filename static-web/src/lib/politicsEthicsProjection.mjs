export function applyEthicsProjection(chapter, subject) {
  if (subject !== 'ethics_law' || !chapter) return chapter;

  return {
    ...chapter,
    units: (chapter.units || []).map((unit) => {
      const evaluationAnchor = String(unit?.raw?.evaluation_anchor || '').trim();
      if (!evaluationAnchor) return unit;

      const currentBeats = Array.isArray(unit?.teaching?.beats) ? unit.teaching.beats : [];
      const hasEvaluationBeat = currentBeats.some((beat) => String(beat?.label || beat?.title || '') === '评价尺度');

      return {
        ...unit,
        teaching: {
          ...(unit.teaching || {}),
          evaluationAnchor,
          beats: hasEvaluationBeat
            ? currentBeats
            : [...currentBeats, { label: '评价尺度', problem: evaluationAnchor }]
        },
        ethicsProjection: {
          evaluationAnchor: true
        }
      };
    })
  };
}
