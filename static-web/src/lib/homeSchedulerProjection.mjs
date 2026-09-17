import { HOME_SUBJECT_IDS } from './homeSubjectIdentity.mjs';

const finiteOrNull = (value) => Number.isFinite(value) ? Math.max(0, value) : null;
const cloneContinue = (value) => value?.href ? {
  subject: value.subject || null,
  href: value.href,
  title: value.title || ''
} : null;

export function buildHomeSchedulerProjection(examPlanReadModel) {
  if (!examPlanReadModel || examPlanReadModel.schema !== 'kianos.exam-plan.read-model.v1') {
    return null;
  }

  const subjects = HOME_SUBJECT_IDS.map((subject) => {
    const row = examPlanReadModel.subjects?.[subject] || {};
    return {
      subject,
      role: row.role || '',
      status: row.status || '',
      targetMinutes: finiteOrNull(row.targetMinutes),
      actualMinutes: finiteOrNull(row.actualMinutes) ?? 0,
      remainingMinutes: finiteOrNull(row.remainingMinutes),
      reviewMinutes: finiteOrNull(row.reviewMinutes) ?? 0,
      requiredMinutes: finiteOrNull(row.requiredMinutes),
      confidence: row.confidence || 'unknown',
      continue: cloneContinue(row.continue)
    };
  });

  return {
    schema: 'kianos.home.scheduler-projection.v1',
    day: examPlanReadModel.day || null,
    readable: examPlanReadModel.readable !== false,
    phase: examPlanReadModel.phase ? { ...examPlanReadModel.phase } : null,
    gate: examPlanReadModel.gate ? { ...examPlanReadModel.gate } : null,
    capacity: examPlanReadModel.capacity ? { ...examPlanReadModel.capacity } : null,
    subjects,
    next: cloneContinue(examPlanReadModel.next),
    attention: examPlanReadModel.attention ? { ...examPlanReadModel.attention } : null,
    usesTimer: examPlanReadModel.time?.usesTimer === true
  };
}
