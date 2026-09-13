function asTextList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

export function applyMaoProjection(chapter, subject) {
  if (subject !== 'mao' || !chapter) return chapter;

  return {
    ...chapter,
    units: (chapter.units || []).map((unit) => {
      const answers = asTextList(unit?.raw?.answers);
      const currentAnswer = String(unit?.teaching?.answer || '').trim();
      if (currentAnswer || !answers.length) return unit;

      return {
        ...unit,
        teaching: {
          ...(unit.teaching || {}),
          // Current Mao C04-S01 intentionally owns several parallel theory responses.
          // Preserve them at Projection instead of rewriting accepted Content/Logic
          // merely to fit the generic singular-answer adapter.
          answer: answers.join('；')
        },
        maoProjection: {
          preservedPluralAnswers: answers.length
        }
      };
    })
  };
}
