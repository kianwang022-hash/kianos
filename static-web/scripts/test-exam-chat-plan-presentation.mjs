import assert from 'node:assert/strict';
import { buildExamChatPlanBasis, readExamChatPlan, validateExamChatPlan } from '../src/lib/examChatPlan.mjs';

const base = {
  schema: 'kianos.exam.chat-plan.v1',
  study_day: '2026-09-22',
  generated_at: '2026-09-22T12:00:00.000Z',
  learner_evidence_basis: null,
  subjects: { xizong: null, english: null, politics: null },
  next_subject: null,
  attention: null
};

const valid = validateExamChatPlan({
  ...base,
  presentation: {
    today_tasks: [
      { id: 'xizong-b1', subject: 'xizong', label: '西综 · 当前 Block', note: '第一份真实学习速度样本', checked: true }
    ],
    week_reference: [
      { id: 'week-xz', subject: 'xizong', label: '真实速度采集中', detail: '再积累 2–3 天', value: '采样中', progress_ratio: null },
      { id: 'week-en', subject: 'english', label: '词汇连续 + 客观题', detail: '仅表示计划完成', value: '2 / 5', progress_ratio: .4 }
    ],
    schedule_blocks: [
      { id: 'study-xz', subject: 'xizong', start: '09:00', end: '11:30', label: '西综', detail: '主块' },
      { id: 'review', start: '22:00', label: 'Review', detail: '轻复盘' }
    ]
  }
});
assert.equal(valid.presentation.today_tasks[0].id, 'xizong-b1');
assert.equal(valid.presentation.today_tasks[0].checked, undefined, 'task check state must not enter the Chat Plan');
assert.equal(valid.presentation.week_reference[1].progress_ratio, .4);
assert.equal(valid.presentation.schedule_blocks[1].end, null);

assert.throws(() => validateExamChatPlan({
  ...base,
  presentation: { today_tasks: [{ id: 'bad id', label: 'x' }] }
}), /stable presentation id/);
assert.throws(() => validateExamChatPlan({
  ...base,
  presentation: { week_reference: [{ id: 'w', label: 'x', progress_ratio: 1.2 }] }
}), /progress_ratio/);
assert.throws(() => validateExamChatPlan({
  ...base,
  presentation: { schedule_blocks: [{ id: 's', start: '22:00', end: '21:00', label: 'x' }] }
}), /end must be after start/);
assert.throws(() => validateExamChatPlan({
  ...base,
  presentation: { today_tasks: [{ id: 'dup', label: 'A' }, { id: 'dup', label: 'B' }] }
}), /duplicate id/);

console.log('PASS exam Chat Plan presentation projection');


class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}
const storage = new MemoryStorage();
const before = buildExamChatPlanBasis(storage, '2026-09-22');
storage.setItem('kianos-exam-home-task-checks-v1:2026-09-22', JSON.stringify({ 'xizong-b1': true }));
const after = buildExamChatPlanBasis(storage, '2026-09-22');
assert.deepEqual(after, before, 'Home task checks are UI-only and must not alter Chat Plan evidence identity');
console.log('PASS Home task checks stay outside learner evidence basis');

const staleStorage = new MemoryStorage();
const staleBasis = buildExamChatPlanBasis(staleStorage, '2026-09-22');
staleStorage.setItem('kianos-exam-chat-plan-v1', JSON.stringify({
  ...base,
  learner_evidence_basis: staleBasis,
  presentation: {
    today_tasks: [{ id: 'keep-task', subject: 'xizong', label: '西综 · 当前 Block' }],
    week_reference: [{ id: 'keep-week', subject: 'xizong', label: '真实速度采集中' }],
    schedule_blocks: [{ id: 'keep-time', start: '20:00', end: '21:00', label: '西综' }]
  }
}));
staleStorage.setItem('kianos-politics-attempts-v1', JSON.stringify({ changed: true }));
const stale = readExamChatPlan(staleStorage, '2026-09-22');
assert.equal(stale.status, 'stale');
assert.equal(stale.plan, null, 'stale executable plan must remain disabled');
assert.equal(stale.presentation.today_tasks[0].id, 'keep-task',
  'same-day non-executable presentation should remain visible after learner evidence changes');
const wrongDay = readExamChatPlan(staleStorage, '2026-09-23');
assert.equal(wrongDay.presentation, null, 'yesterday presentation must not leak into a new study day');
console.log('PASS same-day stale plan keeps display projection but not execution');

for (const progress_ratio of [true,false,'',' ',[],{},'0.5']) {
  assert.throws(()=>validateExamChatPlan({...base,presentation:{week_reference:[{id:'bad-ratio',label:'unknown',progress_ratio}]}}),/progress_ratio/);
}
for (const progress_ratio of [0,1,0.5,null]) {
  assert.equal(validateExamChatPlan({...base,presentation:{week_reference:[{id:'ratio',label:'known',progress_ratio}]}}).presentation.week_reference[0].progress_ratio,progress_ratio);
}
console.log('PASS progress is numeric evidence or unknown, never coercion');
