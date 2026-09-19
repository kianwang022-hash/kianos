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
