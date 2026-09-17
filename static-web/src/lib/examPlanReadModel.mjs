const finiteOrNull = (value) => Number.isFinite(value) ? value : null;
const cloneContinue = (value) => value?.href ? {
  subject: value.subject || null,
  href: value.href,
  title: value.title || ''
} : null;

// Read-only learner scheduler projection. This does not make scheduling decisions;
// buildExamPlan remains the policy owner. Home may consume this without knowing
// Orchestrator-private row geometry or subject Runtime internals.
export function buildExamPlanReadModel(plan, { timeOverlay = null, readable = true } = {}) {
  if (!plan || !Array.isArray(plan.rows)) throw new Error('Exam plan is required.');

  const subjects = {};
  for (const row of plan.rows) {
    const actualMinutes = Number.isFinite(row.doneMinutes) ? Math.max(0, row.doneMinutes) : 0;
    const remainingMinutes = finiteOrNull(row.minutes);
    subjects[row.subject] = {
      subject: row.subject,
      role: row.role || '',
      status: row.status || '',
      actualMinutes,
      remainingMinutes,
      targetMinutes: remainingMinutes === null ? null : actualMinutes + Math.max(0, remainingMinutes),
      reviewMinutes: Number.isFinite(row.reviewMinutes) ? Math.max(0, row.reviewMinutes) : 0,
      requiredMinutes: finiteOrNull(row.required),
      scoreGap: finiteOrNull(row.gap),
      confidence: row.confidence || 'unknown',
      continue: cloneContinue(row.continue)
    };
  }

  return {
    schema: 'kianos.exam-plan.read-model.v1',
    day: plan.day,
    readable: Boolean(readable),
    phase: plan.phase ? {
      id: plan.phase.id || null,
      label: plan.phase.label || '',
      outsideCycle: Boolean(plan.phase.outsideCycle)
    } : null,
    gate: plan.gate ? {
      date: plan.gate.date,
      label: plan.gate.label || '',
      daysRemaining: finiteOrNull(plan.gate.daysRemaining)
    } : null,
    capacity: {
      dayMinutes: finiteOrNull(plan.dayCapacity),
      actualMinutes: Number.isFinite(plan.doneTotal) ? Math.max(0, plan.doneTotal) : 0,
      remainingMinutes: finiteOrNull(plan.capacity),
      unallocatedMinutes: finiteOrNull(plan.unallocated)
    },
    subjects,
    next: cloneContinue(plan.continue),
    attention: plan.attention ? {
      type: plan.attention.type || 'unknown',
      text: plan.attention.text || '',
      action: plan.attention.action || ''
    } : null,
    time: timeOverlay ? {
      usesTimer: Boolean(timeOverlay.usesTimer),
      sourceBySubject: { ...(timeOverlay.sourceBySubject || {}) },
      timerMinutesBySubject: { ...(timeOverlay.timerBySubject || {}) },
      manualMinutesBySubject: { ...(timeOverlay.manualBySubject || {}) }
    } : null
  };
}
