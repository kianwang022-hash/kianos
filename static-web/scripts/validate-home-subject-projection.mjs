import assert from 'node:assert/strict';
import { HOME_SUBJECT_IDS, buildHomeSubjectProjections } from '../src/lib/homeSubjectProjection.mjs';
import { buildHomeSchedulerProjection } from '../src/lib/homeSchedulerProjection.mjs';
import { englishNavigation } from '../src/lib/sharedNavigation.mjs';

const base = '/kianos/';
const subjects = buildHomeSubjectProjections(base);
const expectedIds = ['xizong', 'politics', 'english'];

assert.deepEqual(HOME_SUBJECT_IDS, expectedIds,
  'Shared shell drifted from the accepted Home + three-subject product tree.');
assert.deepEqual(
  subjects.map((subject) => subject.id),
  expectedIds,
  'Home must expose exactly Xizong / Politics / English in shared navigation order.'
);

assert.equal(new Set(subjects.map((subject) => subject.id)).size, 3, 'Home subject ids must be unique.');

for (const subject of subjects) {
  assert.ok(subject.ordinal, `${subject.id} must expose an ordinal.`);
  assert.ok(subject.label, `${subject.id} must expose a label.`);
  assert.ok(subject.href?.startsWith(base), `${subject.id} must expose an in-product entry href.`);
  assert.ok(subject.resume?.adapter, `${subject.id} must expose a subject resume adapter.`);
}

assert.equal(subjects.some((subject) => ['lexical', 'vocabulary'].includes(subject.id)), false,
  'Lexical/Vocabulary must never become a top-level Home subject.');

const english = subjects.find((subject) => subject.id === 'english');
assert.ok(english, 'English projection is required.');
assert.deepEqual(
  english.quickLinks,
  englishNavigation(base)
    .filter((item) => item.key !== 'overview')
    .map(({ key, label, href }) => ({ key, label, href })),
  'Home must inherit English child navigation instead of maintaining a second manual list.'
);
assert.ok(english.quickLinks.some((item) => item.key === 'vocabulary'),
  'Vocabulary must remain discoverable as an English child destination.');

const nonEnglishWithQuickLinks = subjects.filter((subject) => subject.id !== 'english' && subject.quickLinks.length > 0);
assert.equal(nonEnglishWithQuickLinks.length, 0,
  'Home must not invent subject-local quick navigation for Xizong or Politics.');

const scheduler = buildHomeSchedulerProjection({
  schema: 'kianos.exam-plan.read-model.v1',
  day: '2026-09-17',
  readable: true,
  phase: { id: 'A', label: 'First-Round Closure', outsideCycle: false },
  gate: { date: '2026-09-27', label: 'First-Round Gate', daysRemaining: 10 },
  capacity: { dayMinutes: 600, actualMinutes: 180, remainingMinutes: 420, unallocatedMinutes: 0 },
  subjects: {
    xizong: { role: '主推进', status: '按阶段起步', targetMinutes: 360, actualMinutes: 120, remainingMinutes: 240, reviewMinutes: 30, confidence: 'unknown' },
    politics: { role: '稳推进', status: '需要加速', targetMinutes: 90, actualMinutes: 0, remainingMinutes: 90, reviewMinutes: 20, requiredMinutes: 90, confidence: 'medium' },
    english: { role: '保连续', status: '按阶段起步', targetMinutes: 150, actualMinutes: 60, remainingMinutes: 90, reviewMinutes: 0, confidence: 'unknown' }
  },
  next: { subject: 'xizong', href: '/kianos/xizong/a1/', title: 'A1' },
  attention: { type: 'pace', text: '政治需要加速', action: '查看原因' },
  time: { usesTimer: true }
});
assert.ok(scheduler, 'Home must accept the stable Exam Plan read model.');
assert.deepEqual(scheduler.subjects.map((row) => row.subject), expectedIds,
  'Scheduler projection must use the same three-subject learner order.');
assert.equal(scheduler.subjects[0].actualMinutes, 120);
assert.equal(scheduler.subjects[1].requiredMinutes, 90);
assert.equal(scheduler.usesTimer, true);
assert.equal(scheduler.next.subject, 'xizong');
assert.equal(buildHomeSchedulerProjection({ schema: 'unknown' }), null,
  'Home must refuse unknown scheduler schemas instead of guessing their meaning.');

console.log(`PASS home subject + scheduler projection: ${subjects.map((subject) => subject.id).join(' / ')}`);
