import { STUDY_SUBJECTS, buildDailyStudyTimePacket } from './studyTimer.mjs';

const cloneJson = (value) => value == null ? null : JSON.parse(JSON.stringify(value));

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
    timer: cloneJson(time.timer),
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
    '- If GitHub access is available, route through kianwang022-hash/kianos@main CURRENT.md and then the exact subject CURRENT/contract needed. Do not use chat memory to override checked canonical state.',
    '- The schedule is a current plan/capacity snapshot, not proof that the learner completed the planned work.',
    '',
    'WHAT CHAT SHOULD DO',
    '- Summarize what actually happened, identify only meaningful unfinished/problem work, and propose the smallest useful next action.',
    '- Stable work should not create review debt. Missing evidence means unknown.',
    '- If a subject-specific structured return is needed, use that subject\'s existing return contract. Do not invent a universal mutation schema.',
    '',
    'DAILY_PACKET_JSON',
    JSON.stringify(packet, null, 2)
  ].join('\n');
}

