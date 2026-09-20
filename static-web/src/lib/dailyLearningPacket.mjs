import { STUDY_SUBJECTS, buildDailyStudyTimePacket } from './studyTimer.mjs';
import {
  CONTROL_LOCAL_RECEIPT_KEY,
  validateControlReceipt
} from './privateControlCommand.mjs';

const cloneJson = (value) => value == null ? null : JSON.parse(JSON.stringify(value));

function controlReceipt(storage) {
  try {
    const raw = storage?.getItem?.(CONTROL_LOCAL_RECEIPT_KEY);
    if (!raw) return null;
    return validateControlReceipt(JSON.parse(raw));
  } catch {
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
  const time = buildDailyStudyTimePacket(storage, { day, now, timeZone });
  if (plan?.day && plan.day !== time.study_day) throw new Error('Daily Learning Packet day mismatch.');

  const subjects = {};
  for (const subject of STUDY_SUBJECTS) {
    subjects[subject] = {
      time: cloneJson(time.subjects[subject]),
      plan: plan?.subjects?.[subject] ? cloneJson(plan.subjects[subject]) : null,
      evidence: subjectPacket(subjectPackets, subject)
    };
  }

  return {
    schema: 'kianos.daily-learning-packet.v1',
    study_day: time.study_day,
    timezone: time.timezone,
    generated_at: new Date(now).toISOString(),
    total_minutes: time.total_minutes,
    recent_time: {
      window_days: 7,
      days: cloneJson(time.recent_days || [])
    },
    timer: cloneJson(time.timer),
    control: cloneJson(controlReceipt(storage)),
    schedule: plan ? {
      schema: plan.schema || null,
      phase: cloneJson(plan.phase),
      gate: cloneJson(plan.gate),
      capacity: cloneJson(plan.capacity),
      next: cloneJson(plan.next),
      attention: cloneJson(plan.attention),
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
    '- Treat time, schedule, and each subject evidence payload as factual learner state. Do not invent mastery, debt, or missing events.',
    '- subjects.<subject>.evidence is owned by that subject contract and may be null. Preserve unknown fields rather than guessing their meaning.',
    '- This handoff is LEARN state, not project-control state. Do not open root engineering CURRENT.md by default merely because GitHub is available.',
    '- If semantic/source context is actually needed, read only the exact subject Learning/Content owner required for that learner question.',
    '- The schedule is a current plan/capacity snapshot, not proof that the learner completed the planned work.',
    '- control, when present, is transport receipt only. APPLIED means the Website accepted the command; it does not mean the learner completed or mastered the task.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Summarize only what the packet actually proves; stable work should not create review debt and missing evidence means unknown.',
    '- If the learner asks to start, continue, or arrange today, return one valid kianos.exam.chat-plan.v1 for this packet\'s study_day using EXAM_ORCHESTRATOR_CONTRACT as the planning policy owner.',
    '- The Chat Plan must remain importable without rewriting: preserve the same study_day, use only xizong/english/politics, and do not invent mastery, score evidence, or hidden learner events.',
    '- When file generation is available, attach the plan as kianos-chat-plan-<study_day>.json containing only the Chat Plan object. Otherwise provide that exact JSON object with the filename so it can be saved unchanged.',
    '- Tell the learner exactly where to import it: Home → 安排说明 → expand “Chat Plan / 阶段证据 / 本机备份” → “载入 Chat Plan / 本机学习上下文” → confirm.',
    '- If a subject-specific structured diagnosis/repair return is needed, use that subject\'s existing return contract separately. Do not invent a universal mutation schema.',
    '',
    'DAILY_PACKET_JSON',
    JSON.stringify(packet, null, 2)
  ].join('\n');
}

