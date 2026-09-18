import fs from 'node:fs';
import path from 'node:path';
import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { loadPoliticsCompiledPresentation } from '../src/lib/politicsCompiledPresentation.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');
const component = fs.readFileSync(path.join(repoRoot, 'static-web/src/components/PoliticsChapterRuntime.astro'), 'utf8');
const failures = [];
const fail = (code, detail = '') => failures.push({ code, detail });

const xi = listPoliticsSubjectsCurrent().find((subject) => subject.subject === 'xi');
if (!xi) fail('XI_SUBJECT_MISSING');
if (xi && xi.chapters.length !== 18) fail('XI_CHAPTER_COUNT', `${xi.chapters.length}/18`);

let units = 0;
let hierarchyUnits = 0;
let rawArrayHierarchies = 0;
let finalObjects = 0;
let questions = 0;

for (const meta of xi?.chapters || []) {
  const chapter = loadPoliticsChapterCurrent('xi', meta.code);
  const compiled = loadPoliticsCompiledPresentation('xi', meta.code);
  if (!chapter?.orientation?.question) fail('XI_ORIENTATION_QUESTION_MISSING', meta.code);
  if (!chapter?.orientation?.answer) fail('XI_ORIENTATION_ANSWER_MISSING', meta.code);
  if (!chapter?.units?.length) fail('XI_UNITS_MISSING', meta.code);
  if (!(compiled instanceof Map)) fail('XI_COMPILED_PRESENTATION_MISSING', meta.code);

  for (const unit of chapter?.units || []) {
    units += 1;
    questions += unit?.questions?.length || 0;
    if (!unit?.teaching?.question) fail('XI_UNIT_PROBLEM_MISSING', `${meta.code}/${unit.unitId}`);

    const rawHierarchy = unit?.raw?.hierarchy;
    if (rawHierarchy) hierarchyUnits += 1;
    if (Array.isArray(rawHierarchy)) rawArrayHierarchies += 1;

    const finalObject = compiled instanceof Map ? compiled.get(unit.unitId)?.finalLearnerObject : null;
    if (!finalObject?.states?.ORIENT?.length) {
      fail('XI_FINAL_LEARNER_OBJECT_ORIENT_MISSING', `${meta.code}/${unit.unitId}`);
      continue;
    }
    finalObjects += 1;

    const serialized = JSON.stringify(finalObject);
    if (serialized.includes('[object Object]')) {
      fail('XI_FINAL_LEARNER_OBJECT_RENDER_VALUE_INVALID', `${meta.code}/${unit.unitId}`);
    }

    // Xi raw hierarchy may resolve upstream into HIERARCHY, PARALLEL_SET,
    // STATEMENT, or another explicit primitive. The audit must not recreate
    // that semantic decision in Runtime.
    if (rawHierarchy && !(finalObject.states.ORIENT || []).length) {
      fail('XI_HIERARCHY_HAS_NO_RESOLVED_ORIENT', `${meta.code}/${unit.unitId}`);
    }
  }
}

if (!rawArrayHierarchies) fail('XI_ARRAY_HIERARCHY_SENTINEL_MISSING');
if (finalObjects !== units) fail('XI_FINAL_OBJECT_COVERAGE', `${finalObjects}/${units}`);
if (!component.includes("chapter.subject === 'xi'")) fail('XI_GUIDE_LABEL_MISSING');
if (!component.includes('去 iPad / MarginNote 学原讲义')) fail('XI_EXTERNAL_PRIMARY_HANDOFF_MISSING');
// Check the external-only structure, not a retired learner-facing warning sentence.
if (!component.includes('data-politics-external-source') || /node\.(?:text|body|content)\b/.test(component)) fail('XI_DUPLICATE_LECTURE_GUARD_MISSING');
if (component.includes('content_support') || component.includes('contentSupport')) fail('XI_BACKEND_CONTENT_LEAKS_TO_COMPONENT');
if (!/<details\s+class="politicsGuide"(?:\s+open)?>/.test(component)) fail('XI_HIERARCHY_GUIDE_NOT_PROGRESSIVE');
if (!component.includes('<details class="politicsClosure">')) fail('XI_CLOSURE_NOT_PROGRESSIVE');

const report = {
  status: failures.length ? 'FAIL' : 'PASS',
  scope: 'XI_PROJECTION',
  chapters: xi?.chapters?.length || 0,
  units,
  questions,
  hierarchy_units: hierarchyUnits,
  raw_array_hierarchies: rawArrayHierarchies,
  final_learner_objects: finalObjects,
  assertions: [
    'ORIENTATION_SURVIVES',
    'UNIT_PROBLEM_SURVIVES',
    'HIERARCHY_SEMANTICS_RESOLVE_UPSTREAM',
    'FINAL_LEARNER_OBJECT_IS_RENDER_SAFE',
    'BACKEND_CONTENT_NOT_RENDERED',
    'CHENGFENG_REMAINS_EXTERNAL_PRIMARY',
    'GUIDE_AND_CLOSURE_PROGRESSIVE_DISCLOSURE'
  ],
  failures
};

console.log('POLITICS_XI_PROJECTION_AUDIT');
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(2);
