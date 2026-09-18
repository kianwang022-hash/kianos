import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  listEnglishExamPapers,
  loadEnglishExamPaper
} from '../src/lib/englishExamPaper.mjs';
import {
  ENGLISH_EXAM_ANSWER_SCHEMA,
  ENGLISH_EXAM_EVIDENCE_SCHEMA,
  captureEnglishExamStep,
  englishExamTaskHref,
  releaseEnglishExamObjective,
  sealEnglishExamSession,
  startEnglishExamSession
} from '../src/lib/englishExamSession.mjs';
import { loadReadingAnswersById } from '../src/lib/englishReadingSourceTruth.mjs';
import {
  loadClozeAnswersById,
  loadReadingBAnswersById
} from '../src/lib/englishObjectiveSourceTruth.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const readWeb = (rel) => fs.readFileSync(path.join(webRoot, rel), 'utf8');
const readRepo = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

const manifest = JSON.parse(readRepo('content/english/manifest.json'));
assert.equal(manifest?.exam_format?.schema, 'kianos.english.exam_format.v1');
assert.equal(manifest.exam_format.duration_minutes, 180);
assert.equal(manifest.exam_format.total_points, 100);
assert.equal(manifest.exam_format.objective_points, 60);
assert.equal(manifest.exam_format.productive_points, 40);

const papers = listEnglishExamPapers();
assert.ok(papers.length >= 20, 'Expected a substantial complete-paper catalog');
assert.ok(papers.every((paper) => paper.durationMinutes === 180));
assert.ok(papers.every((paper) => paper.totalPoints === 100));
assert.ok(papers.every((paper) => paper.stepCount === 9));

const paper = loadEnglishExamPaper(papers[0].paperId);
assert.equal(paper.steps.length, 9);
assert.deepEqual(
  paper.steps.map((step) => step.task),
  ['cloze', 'reading_a', 'reading_a', 'reading_a', 'reading_a', 'reading_b', 'translation', 'writing', 'writing']
);
assert.equal(paper.steps.reduce((sum, step) => sum + step.max_points, 0), 100);

const start = Date.parse('2026-09-18T10:00:00.000Z');
let session = startEnglishExamSession(paper, {
  now: start,
  sessionId: 'english-exam-validation'
});
assert.equal(session.status, 'ACTIVE');
assert.equal(Date.parse(session.deadline_at) - Date.parse(session.started_at), 180 * 60 * 1000);

const answerSteps = {};
for (const [index, step] of paper.steps.entries()) {
  let payload = {};
  if (step.task === 'cloze') {
    const packet = loadClozeAnswersById(step.object_id);
    payload = { answers: packet.answers };
    answerSteps[step.step_id] = { task: step.task, object_id: step.object_id, answers: packet.answers };
  } else if (step.task === 'reading_a') {
    const packet = loadReadingAnswersById(step.object_id);
    payload = { answers: packet.answers };
    answerSteps[step.step_id] = { task: step.task, object_id: step.object_id, answers: packet.answers };
  } else if (step.task === 'reading_b') {
    const packet = loadReadingBAnswersById(step.object_id);
    payload = { answers: packet.answers };
    answerSteps[step.step_id] = { task: step.task, object_id: step.object_id, answers: packet.answers };
  } else if (step.task === 'translation') {
    payload = { answers: { demo: 'translation evidence' } };
  } else if (step.task === 'writing') {
    payload = { essay: 'writing evidence', plan: '', plan_mode: 'direct' };
  }

  session = captureEnglishExamStep(session, {
    stepId: step.step_id,
    task: step.task,
    objectId: step.object_id,
    payload,
    now: start + (index + 1) * 60_000
  });
}

assert.equal(session.current_step, paper.steps.length);
assert.equal(Object.keys(session.captures).length, 9);
assert.throws(() => releaseEnglishExamObjective(session, {
  schema: ENGLISH_EXAM_ANSWER_SCHEMA,
  paper_id: paper.paper_id,
  steps: answerSteps
}), /ENGLISH_EXAM_MUST_BE_SEALED/);

session = sealEnglishExamSession(session, start + 120 * 60_000);
assert.equal(session.status, 'SEALED');

session = releaseEnglishExamObjective(session, {
  schema: ENGLISH_EXAM_ANSWER_SCHEMA,
  paper_id: paper.paper_id,
  steps: answerSteps
}, start + 121 * 60_000);

assert.equal(session.status, 'RELEASED');
assert.equal(session.release.objective.points, 60);
assert.equal(session.release.objective.max_points, 60);
assert.equal(session.release.productive.status, 'CHAT_REVIEW_REQUIRED');
assert.equal(session.release.productive.max_points, 40);

const evidence = {
  schema: ENGLISH_EXAM_EVIDENCE_SCHEMA,
  release: session.release,
  captures: session.captures
};
assert.equal(JSON.stringify(evidence).includes('"priority"'), false);
assert.equal(JSON.stringify(evidence).includes('"recommendation"'), false);
assert.equal(JSON.stringify(evidence).includes('"next_action"'), false);

const first = paper.steps[0];
const href = englishExamTaskHref(first, {
  base: '/',
  sessionId: session.session_id,
  stepIndex: 0
});
assert.ok(href.includes('exam_session='));
assert.ok(href.includes('exam_step='));
assert.ok(href.includes(encodeURIComponent(first.object_id)));

const sourceChecks = {
  reading: readWeb('src/components/ReadingWorkspace.astro'),
  cloze: readWeb('src/components/ClozeWorkspace.astro'),
  readingB: readWeb('src/components/ReadingBWorkspace.astro'),
  translation: readWeb('src/components/TranslationWorkspace.astro'),
  writing: readWeb('src/components/WritingWorkspace.astro'),
  readingGate: readWeb('src/components/ReadingAnswerGate.astro'),
  objectiveGate: readWeb('src/components/ObjectiveAnswerGate.astro'),
  translationReference: readWeb('src/components/TranslationReferenceLoader.astro'),
  bridge: readWeb('src/components/EnglishExamTaskBridge.astro'),
  home: readWeb('src/pages/english.astro'),
  examHome: readWeb('src/pages/english-exam/[id].astro'),
  examWriting: readWeb('src/pages/english-exam-writing/[id].astro'),
  sessionControl: readWeb('src/lib/englishSessionControl.mjs')
};

for (const [label, source] of Object.entries({
  reading: sourceChecks.reading,
  cloze: sourceChecks.cloze,
  readingB: sourceChecks.readingB,
  translation: sourceChecks.translation,
  writing: sourceChecks.writing
})) {
  assert.match(source, /kianos-english-exam-task-v1:/, label + ' must isolate Mock storage');
}

assert.match(sourceChecks.readingGate, /examMode/);
assert.match(sourceChecks.readingGate, /if (!examMode && savedAttempt.submitted)/);
assert.match(sourceChecks.objectiveGate, /examMode/);
assert.match(sourceChecks.objectiveGate, /if (!examMode && saved.submitted)/);
assert.match(sourceChecks.translationReference, /if (examMode) return;/);
assert.match(sourceChecks.bridge, /stopImmediatePropagation/);
assert.match(sourceChecks.bridge, /captureEnglishExamStep/);
assert.match(sourceChecks.bridge, /sealEnglishExamSession/);
assert.match(sourceChecks.home, /04 · FULL PAPER/);
assert.match(sourceChecks.home, /english-exam//);
assert.match(sourceChecks.examHome, /统一出 Objective 分/);
assert.match(sourceChecks.examWriting, /FULL PAPER · PROTECTED/);
assert.match(sourceChecks.sessionControl, /'full_paper'/);
assert.match(sourceChecks.sessionControl, /exam_session:/);

console.log(JSON.stringify({
  status: 'PASS',
  complete_papers: papers.length,
  sample_paper: paper.paper_id,
  steps: paper.steps.length,
  duration_minutes: paper.duration_minutes,
  objective_release: session.release.objective.points,
  objective_max: session.release.objective.max_points,
  productive_review: session.release.productive.status,
  isolated_mock_storage: true,
  answers_sealed_until_release: true,
  website_scores_productive: false,
  website_strategy_owner: false
}, null, 2));
