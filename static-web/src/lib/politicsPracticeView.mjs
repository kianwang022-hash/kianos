// Explicit consumer allowlists keep answers, source prose and legacy provenance
// out of the clean attempt DOM. The static review resource is requested on submit.
export const practiceReady = (question) => Boolean(question.unitKey) && question.scopeStatus !== 'QUESTION_SCOPE_UNRESOLVED';

export function publicPracticeCatalog(catalog) {
  return {
    schema: catalog.schema,
    revision: catalog.revision,
    reviewBase: catalog.reviewBase || '/politics/practice-review/',
    unavailable: catalog.questions.filter((q) => !practiceReady(q)).map(({ id, sourceId, subject }) => ({ id, sourceId, subject, reason: 'CURRENT_UNIT_BINDING_MISSING' })),
    subjects: catalog.subjects.map(({ id, label }) => ({ id, label })),
    chapters: catalog.chapters.map(({ key, subject, code, title, questionIds }) => ({ key, subject, code, title, questionIds })),
    units: catalog.units.map(({ key, id, title, subject, chapter, href, questionIds, returnConfig }) => ({ key, id, title, subject, chapter, href, questionIds, returnConfig })),
    questions: catalog.questions.filter(practiceReady).map(({ id, sourceId, number, subject, subjectLabel, chapter, chapterTitle, unitKey, unitId, unitTitle, unitHref, type, stem, options }) => ({ id, sourceId, number, subject, subjectLabel, chapter, chapterTitle, unitKey, unitId, unitTitle, unitHref, type, stem, options }))
  };
}

export function practiceReviewPayload(catalog, id) {
  const question = catalog.questions.find((row) => row.id === id);
  const unit = catalog.units.find((row) => row.key === question?.unitKey);
  if (!question || !practiceReady(question) || !unit || !question.refined?.takeaway || !question.refined?.chatExplanation) throw new Error(`PRACTICE_REVIEW_BINDING:${id}`);
  return {
    schema: 'kianos.politics.practice_review.v1', revision: catalog.revision,
    id: question.id, sourceId: question.sourceId, unitKey: unit.key,
    answer: question.answer,
    takeaway: question.refined.takeaway,
    chatExplanation: question.refined.chatExplanation,
    chengfengLocator: question.chengfengLocator || null,
    source: (unit.source || []).map(({ id, title, text }) => ({ id, title, text }))
  };
}
