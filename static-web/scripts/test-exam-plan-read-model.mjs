import assert from 'node:assert/strict';
import { buildChatControlledExamReadModel, buildExamPlanReadModel } from '../src/lib/examPlanReadModel.mjs';

const plan = {
  day: '2026-09-17',
  phase: { id: 'A', label: 'First-Round Closure' },
  gate: { date: '2026-09-27', label: 'First-Round Gate', daysRemaining: 10 },
  dayCapacity: 600,
  doneTotal: 180,
  capacity: 420,
  unallocated: 0,
  rows: [
    { subject: 'xizong', role: '主推进', status: '按阶段起步', doneMinutes: 120, minutes: 260, reviewMinutes: 30, required: null, gap: null, confidence: 'unknown', continue: { subject: 'xizong', href: '/kianos/xizong/a1/', title: 'A1' } },
    { subject: 'english', role: '保连续', status: '按阶段起步', doneMinutes: 60, minutes: 100, reviewMinutes: 0, required: null, gap: null, confidence: 'unknown', continue: { subject: 'english', href: '/kianos/reading/', title: 'Reading A' } },
    { subject: 'politics', role: '稳推进', status: '需要加速', doneMinutes: 0, minutes: 60, reviewMinutes: 20, required: 90, gap: null, confidence: 'medium', continue: { subject: 'politics', href: '/kianos/politics/', title: '政治' } }
  ],
  continue: { subject: 'politics', href: '/kianos/politics/', title: '政治' },
  attention: { type: 'pace', text: '政治需要加速', action: '查看原因' }
};

const overlay = {
  usesTimer: true,
  sourceBySubject: { xizong: 'timer', english: 'timer', politics: 'none' },
  timerBySubject: { xizong: 120, english: 60, politics: 0 },
  manualBySubject: { xizong: 0, english: 0, politics: 0 }
};

const model = buildExamPlanReadModel(plan, { timeOverlay: overlay, readable: true });
assert.equal(model.schema, 'kianos.exam-plan.read-model.v1');
assert.equal(model.capacity.dayMinutes, 600);
assert.equal(model.capacity.actualMinutes, 180);
assert.equal(model.capacity.remainingMinutes, 420);
assert.equal(model.subjects.xizong.actualMinutes, 120);
assert.equal(model.subjects.xizong.remainingMinutes, 260);
assert.equal(model.subjects.xizong.targetMinutes, 380);
assert.equal(model.subjects.politics.requiredMinutes, 90);
assert.equal(model.subjects.politics.status, '需要加速');
assert.equal(model.next.subject, 'politics');
assert.equal(model.attention.type, 'pace');
assert.equal(model.time.usesTimer, true);
assert.equal(model.time.sourceBySubject.english, 'timer');
assert.deepEqual(Object.keys(model.subjects).sort(), ['english', 'politics', 'xizong']);

const chatModel = buildChatControlledExamReadModel({
  day: '2026-09-17',
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 360, role: '主推进', note: '', session_ref: null },
        english: null,
        politics: null
      },
      next_subject: 'xizong',
      attention: null
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(chatModel.next.subject, 'xizong',
  'Chat-selected next subject identity must survive even when native Continue omits subject');
assert.equal(chatModel.subjects.xizong.continue.subject, 'xizong',
  'subject Continue projection must preserve its owner identity');

console.log('PASS exam plan read model');


const overCapacity = buildChatControlledExamReadModel({
  day: '2026-09-17',
  dayCapacity: 300,
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: 'xz-session' },
        english: { target_minutes: 90, role: '保连续', note: '', session_ref: null },
        politics: { target_minutes: 30, role: '稳推进', note: '', session_ref: null }
      },
      next_subject: 'xizong',
      attention: null
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1', sessionRef: 'xz-session' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(overCapacity.control.planStatus,'capacity_conflict');
assert.equal(overCapacity.control.capacityConflict,true);
assert.equal(overCapacity.capacity.plannedTargetMinutes,360);
assert.equal(overCapacity.capacity.overplannedMinutes,60);
assert.equal(overCapacity.next,null,
  'Home must not auto-execute a Chat Plan whose known target minutes exceed usable day capacity');
assert.equal(overCapacity.attention.type,'chat_plan_capacity');
assert.match(overCapacity.attention.text,/超过今日可用/);
assert.equal(overCapacity.subjects.xizong.continue.href,'/kianos/xizong/a1/',
  'manual subject entry remains available; Website refuses only the unsafe automatic plan');
assert.equal(overCapacity.subjects.xizong.confidence,'capacity-conflict');

const exactCapacity = buildChatControlledExamReadModel({
  day: '2026-09-17',
  dayCapacity: 360,
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: 'xz-session' },
        english: { target_minutes: 90, role: '保连续', note: '', session_ref: null },
        politics: { target_minutes: 30, role: '稳推进', note: '', session_ref: null }
      },
      next_subject: 'xizong',
      attention: null
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1', sessionRef: 'xz-session' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(exactCapacity.control.planStatus,'ready');
assert.equal(exactCapacity.control.capacityConflict,false);
assert.equal(exactCapacity.next.subject,'xizong');

// Fresh top-layer audit: a legal whole-day target must not reuse elapsed time.
const subjectIds = ['xizong', 'english', 'politics'];
const replan = (targets, actual, capacity, state = 'ready') => buildChatControlledExamReadModel({
  day: '2026-09-21',
  dayCapacity: capacity,
  actualBySubject: Object.fromEntries(subjectIds.map((subject, index) => [subject, actual[index]])),
  nativeContinue: Object.fromEntries(subjectIds.map((subject) => [subject, { href: `/${subject}/`, title: subject }])),
  chatPlanState: {
    status: state,
    plan: state === 'ready' ? {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-21',
      generated_at: '2026-09-21T04:00:00.000Z',
      subjects: Object.fromEntries(subjectIds.map((subject, index) => [subject, { target_minutes: targets[index] }])),
      next_subject: 'english'
    } : null
  }
});
for (const [name, targets, actual, capacity, over] of [
  ['overspent subject', [100, 120, 80], [180, 0, 0], 300, 80],
  ['unbudgeted switch', [null, 120, 80], [180, 0, 0], 300, 80],
  ['capacity loss', [240, 120, 60], [240, 30, 0], 330, 90]
]) {
  const result = replan(targets, actual, capacity);
  assert.equal(result.control.planStatus, 'capacity_conflict', name);
  assert.equal(result.capacity.overplannedMinutes, over, name);
  assert.equal(result.next, null, name);
  assert.equal(result.subjects.xizong.continue.href, '/xizong/', 'manual entry survives');
}
const midday = replan([240, 60, 0], [180, 0, 0], 300);
assert.equal(midday.control.planStatus, 'ready');
assert.equal(midday.subjects.xizong.remainingMinutes, 60, '180 done + 60 further = 240 whole-day target');
assert.equal(midday.subjects.english.remainingMinutes, 60);
const unknownTargets = replan([null, null, null], [180, 0, 0], 300);
assert.equal(unknownTargets.subjects.xizong.remainingMinutes, null, 'unknown is not zero');
assert.equal(unknownTargets.control.planStatus, 'ready', 'unknown targets do not invent a conflict');
assert.equal(replan([240, 120, 60], [180, 0, 0], null).control.planStatus, 'ready', 'unknown capacity is not zero');
assert.equal(replan([60, 0, 0], [180, 0, 0], 120).capacity.overplannedMinutes, 0, 'completed overrun is not future debt');
for (const state of ['missing', 'stale', 'invalid', 'unavailable']) {
  const result = replan([100, 100, 100], [0, 0, 0], 300, state);
  assert.equal(result.control.planStatus, state);
  assert.equal(result.next, null, 'no automatic fallback for rejected evidence/plan');
}
console.log('PASS exam plan remaining-capacity regression');
