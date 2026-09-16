// Build-time allowlists: Home/Review never receive unseen answers or source prose.
import { buildPoliticsPracticeCatalogCurrent } from './politicsPractice.mjs';
import { publicPracticeCatalog } from './politicsPracticeView.mjs';
import { listProjectableXizongSystems } from './xizong.mjs';
import { loadXizongSystemQuestionSweep } from './xizongQuestions.mjs';
const cache = new Map();
export function politicsProductCatalog(base = '/') {
  if (cache.has(base)) return cache.get(base);
  const p = publicPracticeCatalog(buildPoliticsPracticeCatalogCurrent(base));
  const result = { revision: p.revision, subjects: p.subjects, chapters: p.chapters,
    units: p.units.map(({ key, id, title, subject, chapter, href, questionIds, returnConfig }) =>
      ({ key, id, title, subject, chapter, href, questionIds, returnConfig })),
    questions: p.questions.map(({ id, sourceId, number, subject, subjectLabel, chapter,
      chapterTitle, unitKey, unitId, unitTitle, unitHref, type }) =>
      ({ id, sourceId, number, subject, subjectLabel, chapter, chapterTitle, unitKey, unitId, unitTitle, unitHref, type })) };
  cache.set(base, result); return result;
}
export function examProductCatalog(base = '/') {
  return { base, politics: politicsProductCatalog(base),
    xizong: listProjectableXizongSystems().map(system => {
      const sweep = loadXizongSystemQuestionSweep(system);
      return { id: system.systemId, title: system.title, href: `${base}xizong/${system.systemId}/`,
        scopeHash: sweep?.scopeHash || null, inventoryHash: sweep?.questionInventoryHash || null,
        questions: (sweep?.questions || []).map(({ questionId, year }) => ({ questionId, year })) };
    }) };
}
