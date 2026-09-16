import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT ? path.resolve(process.env.KIANOS_REPO_ROOT) : path.resolve(process.cwd(), '..');
const component = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsChapterRuntime.astro'), 'utf8');
const failures = [];
const fail = (code, detail = '') => failures.push({ code, detail });

const ethics = listPoliticsSubjectsCurrent().find((subject) => subject.subject === 'ethics_law');
if (!ethics) fail('ETHICS_SUBJECT_MISSING');
if (ethics && ethics.chapters.length !== 7) fail('ETHICS_CHAPTER_COUNT', `${ethics.chapters.length}/7`);

let units = 0;
let questions = 0;
let rawEvaluationAnchors = 0;
let projectedEvaluationAnchors = 0;
for (const meta of ethics?.chapters || []) {
  const chapter = loadPoliticsChapterCurrent('ethics_law', meta.code);
  if (!chapter?.orientation?.question) fail('ETHICS_ORIENTATION_QUESTION_MISSING', meta.code);
  if (!chapter?.orientation?.answer) fail('ETHICS_ORIENTATION_ANSWER_MISSING', meta.code);
  if (!chapter?.units?.length) fail('ETHICS_UNITS_MISSING', meta.code);
  for (const unit of chapter?.units || []) {
    units += 1;
    questions += unit?.questions?.length || 0;
    if (!unit?.teaching?.question) fail('ETHICS_UNIT_PROBLEM_MISSING', `${meta.code}/${unit.unitId}`);
    if (!unit?.teaching?.answer) fail('ETHICS_UNIT_ANSWER_MISSING', `${meta.code}/${unit.unitId}`);
    if (!Array.isArray(unit?.teaching?.boundaries) || !unit.teaching.boundaries.length) fail('ETHICS_BOUNDARY_MISSING', `${meta.code}/${unit.unitId}`);
    if (unit?.raw?.evaluation_anchor) {
      rawEvaluationAnchors += 1;
      if (String(unit?.teaching?.evaluationAnchor || '').trim()) projectedEvaluationAnchors += 1;
      else fail('ETHICS_EVALUATION_ANCHOR_DROPPED', `${meta.code}/${unit.unitId}`);
    }
  }
}

if (!rawEvaluationAnchors) fail('ETHICS_EVALUATION_ANCHOR_SENTINEL_MISSING');
if (projectedEvaluationAnchors !== rawEvaluationAnchors) fail('ETHICS_EVALUATION_ANCHOR_PARITY', `${projectedEvaluationAnchors}/${rawEvaluationAnchors}`);
if (component.includes('content_support') || component.includes('contentSupport')) fail('ETHICS_BACKEND_CONTENT_LEAKS_TO_COMPONENT');
if (!component.includes("chapter.subject === 'ethics_law'")) fail('ETHICS_GUIDE_LABEL_MISSING');
if (!component.includes('去 iPad / MarginNote 学原讲义')) fail('ETHICS_EXTERNAL_PRIMARY_HANDOFF_MISSING');
// Check the external-only structure, not a retired learner-facing warning sentence.
if (!component.includes('data-politics-external-source') || /node\.(?:text|body|content)\b/.test(component)) fail('ETHICS_DUPLICATE_LECTURE_GUARD_MISSING');
if (!/<details\s+class="politicsGuide"(?:\s+open)?>/.test(component)) fail('ETHICS_GUIDE_NOT_PROGRESSIVE');
if (!component.includes('<details class="politicsClosure">')) fail('ETHICS_CLOSURE_NOT_PROGRESSIVE');

const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'ETHICS_PROJECTION', chapters: ethics?.chapters?.length || 0, units, questions,
  raw_evaluation_anchors: rawEvaluationAnchors,
  projected_evaluation_anchors: projectedEvaluationAnchors,
  assertions: [
    'ORIENTATION_SURVIVES', 'UNIT_PROBLEM_ANSWER_SURVIVES', 'BOUNDARY_SURVIVES',
    'EVALUATION_ANCHOR_SURVIVES', 'BACKEND_CONTENT_NOT_RENDERED',
    'CHENGFENG_REMAINS_EXTERNAL_PRIMARY', 'GUIDE_AND_CLOSURE_PROGRESSIVE_DISCLOSURE'
  ],
  failures
};
console.log('POLITICS_ETHICS_PROJECTION_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(2);
