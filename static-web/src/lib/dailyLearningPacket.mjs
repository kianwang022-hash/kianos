import {
  STUDY_SUBJECTS, STUDY_TIMER_TIMEZONE, studyDayAt, buildDailyStudyTimePacket
} from './studyTimer.mjs';
import { buildExamChatPlanBasis, assertExamChatPlanTimeReadable } from './examChatPlan.mjs';
import {
  CONTROL_LOCAL_RECEIPT_KEY,
  validateControlReceipt
} from './privateControlCommand.mjs';
import { buildStewardRealityDailySummary } from './stewardReality.mjs';

const cloneJson = (value) => value == null ? null : JSON.parse(JSON.stringify(value));

function controlReceipt(storage, warnings) {
  try {
    const raw = storage?.getItem?.(CONTROL_LOCAL_RECEIPT_KEY);
    if (raw == null) return null;
    return validateControlReceipt(JSON.parse(raw));
  } catch {
    warnings.push('DAILY_PACKET_CONTROL_RECEIPT_INVALID');
    return null;
  }
}

function subjectPacket(subjectPackets, subject) {
  const value = subjectPackets?.[subject];
  return value == null ? null : cloneJson(value);
}

export function buildDailyLearningPacket({
  storage,
  day,
  now = Date.now(),
  timeZone,
  plan = null,
  subjectPackets = {}
} = {}) {
  if (!storage?.getItem) throw new Error('Daily Learning Packet requires readable storage.');
  const warnings = [];
  let time;
  try {
    assertExamChatPlanTimeReadable(storage);
    time = buildDailyStudyTimePacket(storage, { day, now, timeZone });
  } catch (error) {
    const reason = String(error?.message || error);
    warnings.push(reason);
    time = {
      study_day: day || studyDayAt(now, timeZone || STUDY_TIMER_TIMEZONE),
      timezone: timeZone || STUDY_TIMER_TIMEZONE,
      subjects: {}, total_minutes: null,
      timer: { running: null, active_subject: null, review_candidates: [], error: reason }
    };
  }
  let learnerEvidenceBasis = null;
  try { learnerEvidenceBasis = buildExamChatPlanBasis(storage, time.study_day); }
  catch (error) { warnings.push(String(error?.message || error)); }
  // An unreadable basis must not be executable, but healthy subject evidence
  // remains exportable. Do not fabricate an empty/valid basis to keep it green.
  const usablePlan = learnerEvidenceBasis ? plan : null;
  if (plan?.day && plan.day !== time.study_day) throw new Error('Daily Learning Packet day mismatch.');

  const receipt = controlReceipt(storage, warnings);
  const subjects = {};
  for (const subject of STUDY_SUBJECTS) {
    subjects[subject] = {
      time: cloneJson(time.subjects[subject]),
      plan: usablePlan?.subjects?.[subject] ? cloneJson(usablePlan.subjects[subject]) : null,
      evidence: subjectPacket(subjectPackets, subject)
    };
  }

  return {
    schema: 'kianos.daily-learning-packet.v1',
    study_day: time.study_day,
    timezone: time.timezone,
    generated_at: new Date(now).toISOString(),
    learner_evidence_basis: learnerEvidenceBasis,
    ...(warnings.length ? { warnings: [...new Set(warnings)] } : {}),
    total_minutes: time.total_minutes,
    timer: cloneJson(time.timer),
    control: cloneJson(receipt),
    steward: buildStewardRealityDailySummary(storage, { day: time.study_day, timeZone: time.timezone, now }),
    schedule: usablePlan ? {
      schema: plan.schema || null,
      control: cloneJson(plan.control),
      phase: cloneJson(plan.phase),
      gate: cloneJson(plan.gate),
      capacity: cloneJson(plan.capacity),
      next: cloneJson(plan.next),
      attention: cloneJson(plan.attention),
      presentation: cloneJson(plan.presentation),
      time: cloneJson(plan.time)
    } : null,
    subjects
  };
}

export function attachDailySubjectPacket(packet, subject, subjectPacketValue) {
  if (!packet || packet.schema !== 'kianos.daily-learning-packet.v1') throw new Error('Invalid Daily Learning Packet.');
  if (!STUDY_SUBJECTS.includes(subject)) throw new Error(`Unsupported subject: ${subject}`);
  return {
    ...packet,
    subjects: {
      ...packet.subjects,
      [subject]: {
        ...packet.subjects[subject],
        evidence: cloneJson(subjectPacketValue)
      }
    }
  };
}

export function serializeDailyLearningPacketForChat(packet) {
  if (!packet || packet.schema !== 'kianos.daily-learning-packet.v1') {
    throw new Error('Invalid Daily Learning Packet.');
  }

  return [
    'KIANOS_DAILY_LEARNING_HANDOFF_V1',
    'This packet was exported by the KianOS learner website for Chat.',
    '',
    'HOW TO READ IT',
    '- Preserve observed time and subject evidence as facts; schedule is a decision, and derived Forecast fields are conditional estimates. Do not invent mastery, debt, or missing events.',
    '- Keep each estimate bound to its source, task, observation period and covered scope. UNKNOWN or UNPRICED is not zero; empirical quantiles and sample counts are not calibrated future probabilities.',
    '- subjects.<subject>.evidence is owned by that subject contract and may be null. Preserve unknown fields rather than guessing their meaning.',
    '- This handoff is LEARN state, not project-control state. Do not open root engineering CURRENT.md by default merely because GitHub is available.',
    '- If semantic/source context is actually needed, read only the exact subject Learning/Content owner required for that learner question.',
    '- The schedule is a current plan/capacity snapshot, not proof that the learner completed the planned work.',
    '- schedule.presentation is the adopted frontstage projection of that same plan. If Nutrition/Training is present, preserve it as adopted guidance/readback; missing fields stay unknown/absent and must not be invented. Presentation still does not prove meals were eaten or training was completed.',
    '- control, when present, is transport receipt only. APPLIED means the Website accepted the command; it does not mean the learner completed or mastered the task.',
    '- steward.breaks contains intentionally recorded pause/rest/re-entry reality only. Re-entry is a learner report, not a readiness score and not permission to invent a recovery judgment or automatically change the plan.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Summarize only what the packet actually proves; stable work should not create review debt and missing evidence means unknown. When an estimate changes the plan, explain its evidence, assumptions, range, missing scope and what would change the decision; see EXAM_ORCHESTRATOR_CONTRACT section 0.',
    '- Follow the actual request: subject-local start/continue stays with that subject role and healthy native Continue/Resume; it does not by itself request a cross-subject plan.',
    '- For a day-arrangement decision, resolve the current Personal Steward/CONTROL owners; EXAM_ORCHESTRATOR_CONTRACT and the native validators own the supported kianos.exam.chat-plan.v1 shape. A retained schedule with control.planStatus=reference is adopted intention, not a fresh capacity or execution claim.',
    '- Preserve the same study_day and supported subject identities; copy a non-null learner_evidence_basis into the Chat Plan unchanged. Null plus warnings means evidence was unreadable: do not manufacture a replacement basis or force an executable plan. Healthy subject evidence remains usable for bounded learning.',
    '- If the learner_evidence_basis is stale, read the fresh Daily Learning Packet through its canonical admitted route and reconcile. Do not force-import an old plan or routinely ask Kian to copy data that the native route can read.',
    '- Use the existing authorized private control relay and matching command ID/hash receipt when available. Submission is pending until the named application/effect is verified; do not turn normal use into a file-import ritual.',
    '- Only when supported delivery is unavailable or the learner explicitly requests manual import, provide kianos-chat-plan-<study_day>.json containing only the unchanged Chat Plan as a degraded fallback. Its native import entry is Home → 安排说明 → Chat Plan / 阶段证据 / 本机备份 → 载入 Chat Plan / 本机学习上下文 → confirm. Never claim that generating or importing a file alone proves Website application.',
    '- If a subject-specific structured diagnosis/repair return is needed, use that subject\'s existing return contract separately. Do not invent a universal mutation schema.',
    '',
    'DAILY_PACKET_JSON',
    JSON.stringify(packet, null, 2)
  ].join('\n');
}
