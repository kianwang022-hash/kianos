const finiteOrNull = (value) => Number.isFinite(value) ? value : null;
const clonePresentation = (value) => value ? {
  todayTasks: (value.today_tasks || []).map((row) => ({ ...row })),
  weekReference: (value.week_reference || []).map((row) => ({ ...row })),
  scheduleBlocks: (value.schedule_blocks || []).map((row) => ({ ...row }))
} : null;
const cloneContinue = (value, fallbackSubject = null) => value?.href ? {
  subject: value.subject || fallbackSubject || null,
  href: value.href,
  title: value.title || '',
  sessionRef: value.sessionRef || value.session_ref || null
} : null;

const exactContinueForInstruction = (value, instruction, fallbackSubject = null) => {
  const next = cloneContinue(value, fallbackSubject);
  if (!next) return null;
  const expectedRef = instruction?.session_ref || null;
  if (!expectedRef) return next;
  return next.sessionRef === expectedRef ? next : null;
};

const neutralAttention = (status, error = '') => {
  if (status === 'ready') return null;
  if (status === 'stale') return {
    type: 'chat_plan',
    text: '安排依据已变化，请让 Chat 更新安排。',
    action: '查看依据'
  };
  if (status === 'invalid') return {
    type: 'chat_plan',
    text: 'Chat 安排未通过校验；网页不会猜测或自动生成替代计划。',
    action: '查看依据'
  };
  if (status === 'unavailable') return {
    type: 'chat_plan',
    text: '本机计划存储暂不可用；三科入口仍可自由进入，网页不会自动排优先级。',
    action: '查看依据'
  };
  return {
    type: 'chat_plan',
    text: '尚未导入 Chat 今日安排；网页只记录事实，不自动替你分配三科。',
    action: '查看依据'
  };
};

export function buildChatControlledExamReadModel({
  day,
  phase = null,
  gate = null,
  chatPlanState = { status: 'missing', plan: null },
  dayCapacity = null,
  actualBySubject = {},
  nativeContinue = {},
  timeOverlay = null,
  readable = true
} = {}) {
  const plan = chatPlanState?.status === 'ready' ? chatPlanState.plan : null;
  const subjectIds = ['xizong', 'english', 'politics'];
  const plannedTargetMinutes = plan
    ? subjectIds.reduce((sum, subject) => {
        const value = plan?.subjects?.[subject]?.target_minutes;
        return Number.isFinite(value) ? sum + Math.max(0, Math.round(value)) : sum;
      }, 0)
    : null;
  const actualMinutesBySubject = Object.fromEntries(subjectIds.map((subject) => [
    subject,
    Number.isFinite(actualBySubject?.[subject])
      ? Math.max(0, Math.round(actualBySubject[subject]))
      : 0
  ]));
  const actualTotal = Object.values(actualMinutesBySubject).reduce((sum, value) => sum + value, 0);
  const capacityRemaining = Number.isFinite(dayCapacity)
    ? Math.max(0, Math.round(dayCapacity) - actualTotal)
    : null;
  // target_minutes is a whole-study-day total, not an additional duration.
  // Already-spent time cannot fund another subject. Null targets stay unknown;
  // this is only a feasibility check on known commitments, never an allocation.
  const plannedRemainingMinutes = plan
    ? subjectIds.reduce((sum, subject) => {
        const target = plan?.subjects?.[subject]?.target_minutes;
        return Number.isFinite(target)
          ? sum + Math.max(0, Math.round(target) - actualMinutesBySubject[subject])
          : sum;
      }, 0)
    : null;
  const capacityConflict = Boolean(
    plan
    && Number.isFinite(capacityRemaining)
    && plannedRemainingMinutes > capacityRemaining
  );
  const subjects = {};

  for (const subject of subjectIds) {
    const actualMinutes = actualMinutesBySubject[subject];
    const instruction = plan?.subjects?.[subject] || null;
    const targetMinutes = Number.isFinite(instruction?.target_minutes)
      ? Math.max(0, Math.round(instruction.target_minutes))
      : null;
    const remainingMinutes = targetMinutes === null
      ? null
      : Math.max(0, targetMinutes - actualMinutes);

    subjects[subject] = {
      subject,
      role: instruction?.role || (plan ? '按 Chat 安排' : '未安排'),
      status: '',
      actualMinutes,
      targetMinutes,
      remainingMinutes,
      reviewMinutes: 0,
      requiredMinutes: null,
      scoreGap: null,
      confidence: capacityConflict ? 'capacity-conflict' : (plan ? 'chat-plan' : 'unknown'),
      continue: capacityConflict
        ? cloneContinue(nativeContinue?.[subject], subject)
        : exactContinueForInstruction(nativeContinue?.[subject], instruction, subject),
      sessionRef: instruction?.session_ref || null,
      note: instruction?.note || ''
    };
  }

  const nextInstruction = plan?.next_subject ? plan?.subjects?.[plan.next_subject] || null : null;
  const next = !capacityConflict && plan?.next_subject
    ? exactContinueForInstruction(nativeContinue?.[plan.next_subject], nextInstruction, plan.next_subject)
    : null;
  const attention = capacityConflict
    ? {
        type: 'chat_plan_capacity',
        text: `Chat 剩余安排 ${plannedRemainingMinutes} 分钟，超过今日可用剩余 ${capacityRemaining} 分钟；网页不会自动执行，返回 Chat 重排。`,
        action: '返回 Chat 重排'
      }
    : plan?.attention?.text
      ? {
          type: 'chat_plan',
          text: plan.attention.text,
          action: plan.attention.action || '查看依据'
        }
      : neutralAttention(chatPlanState?.status || 'missing', chatPlanState?.error || '');

  return {
    schema: 'kianos.exam-plan.read-model.v1',
    control: {
      strategyOwner: 'CHAT',
      planStatus: capacityConflict ? 'capacity_conflict' : (chatPlanState?.status || 'missing'),
      planSchema: plan?.schema || null,
      generatedAt: plan?.generated_at || null,
      capacityConflict
    },
    day,
    readable: Boolean(readable),
    phase: phase ? { ...phase } : null,
    gate: gate ? { ...gate } : null,
    capacity: {
      dayMinutes: finiteOrNull(dayCapacity),
      actualMinutes: actualTotal,
      remainingMinutes: capacityRemaining,
      unallocatedMinutes: null,
      plannedTargetMinutes,
      overplannedMinutes: capacityConflict
        ? Math.max(0, plannedRemainingMinutes - capacityRemaining)
        : 0
    },
    subjects,
    next,
    attention,
    presentation: clonePresentation(plan?.presentation || chatPlanState?.presentation),
    time: timeOverlay ? {
      usesTimer: Boolean(timeOverlay.usesTimer),
      sourceBySubject: { ...(timeOverlay.sourceBySubject || {}) },
      timerMinutesBySubject: { ...(timeOverlay.timerBySubject || {}) },
      manualMinutesBySubject: { ...(timeOverlay.manualBySubject || {}) }
    } : null
  };
}
