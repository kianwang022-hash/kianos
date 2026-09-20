// Build-time allowlists: Home/Review never receive unseen answers or source prose.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPoliticsPracticeCatalogCurrent } from './politicsPractice.mjs';
import { publicPracticeCatalog } from './politicsPracticeView.mjs';
import { listProjectableXizongSystems } from './xizong.mjs';
import { loadXizongSystemQuestionSweep } from './xizongQuestions.mjs';
import { listReadingSets, loadReadingById } from './englishReadingSourceTruth.mjs';
import { listClozeSets, listReadingBSets, loadClozeById, loadReadingBById } from './englishObjectiveSourceTruth.mjs';
import { listTranslationSets, loadTranslationById } from './englishTranslationSourceTruth.mjs';
import { listWritingExamRuntimeTasks } from './englishWritingRuntimeSourceTruth.mjs';
import { listEnglishExamPapers, loadEnglishExamPaper } from './englishExamPaper.mjs';

const cache = new Map();
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../..');
const externalManifestPath = path.join(repoRoot, 'content/english/external/manifest.json');

function compactEnglishExamObject(task, row, extra = {}) {
  return {
    task,
    object_id: String(row?.id || ''),
    year: Number(row?.year || 0) || null,
    paper_id: String(row?.paperId || '') || null,
    ...extra
  };
}

function englishExternalForecastCatalog() {
  try {
    const manifest = JSON.parse(fs.readFileSync(externalManifestPath, 'utf8'));
    const inventory = manifest?.inventory || {};
    const objects = Array.isArray(inventory.objects) ? inventory.objects : [];
    return {
      registered_object_count: Number(inventory.object_count || objects.length || 0),
      tpo: inventory.tpo ? {
        collections: Number(inventory.tpo.collections || 0),
        passages: Number(inventory.tpo.passages || 0),
        questions: Number(inventory.tpo.questions || 0)
      } : null,
      ielts: inventory.ielts ? {
        books: Number(inventory.ielts.books || 0),
        tests: Number(inventory.ielts.tests || 0),
        passages: Number(inventory.ielts.passages || 0),
        questions: Number(inventory.ielts.questions || 0)
      } : null,
      objects: objects.map((row) => ({
        task: 'external_reading',
        object_id: String(row?.object_id || ''),
        source_family: String(row?.source_family || ''),
        source_format: String(row?.source_format || ''),
        collection: String(row?.collection || ''),
        question_count: Number(row?.question_count || 0),
        source_quality: String(row?.source_quality || '')
      })).filter((row) => row.object_id),
      evidence_boundary:
        'Registered External Reading pool only. Registration does not prove private source bytes are active on this device, nor that the object should be consumed for English-I.'
    };
  } catch {
    return {
      registered_object_count: 0,
      tpo: null,
      ielts: null,
      objects: [],
      evidence_boundary:
        'External Reading registry unavailable at build time. Do not infer zero available learner material.'
    };
  }
}

export function englishProductCatalog() {
  const writing = listWritingExamRuntimeTasks();
  const examObjects = [
    ...listReadingSets().map((row) => {
      const item = loadReadingById(row.id);
      return compactEnglishExamObject('reading_a', row, {
        question_count: Array.isArray(item?.questions) ? item.questions.length : 0
      });
    }),
    ...listClozeSets().map((row) => {
      const item = loadClozeById(row.id);
      return compactEnglishExamObject('cloze', row, {
        question_count: Array.isArray(item?.questions) ? item.questions.length : 0
      });
    }),
    ...listReadingBSets().map((row) => {
      const item = loadReadingBById(row.id);
      return compactEnglishExamObject('reading_b', row, {
        question_count: Array.isArray(item?.questions) ? item.questions.length : 0,
        task_form: String(item?.context?.taskForm || item?.context?.questionGroupType || '') || null
      });
    }),
    ...listTranslationSets().map((row) => {
      const item = loadTranslationById(row.id);
      return compactEnglishExamObject('translation', row, {
        prompt_count: Array.isArray(item?.prompts) ? item.prompts.length : 0
      });
    }),
    ...writing.map((row) => compactEnglishExamObject('writing', row, {
      writing_kind: String(row?.kind || '') || null
    }))
  ].filter((row) => row.object_id);

  const wholePapers = listEnglishExamPapers().map((summary) => {
    const paper = loadEnglishExamPaper(summary.paperId);
    return {
      paper_id: String(summary.paperId),
      year: Number(summary.year || 0) || null,
      duration_minutes: Number(summary.durationMinutes || 0),
      total_points: Number(summary.totalPoints || 0),
      object_ids: [...new Set((paper.steps || []).map((step) => String(step?.object_id || '')).filter(Boolean))]
    };
  });

  return {
    schema: 'kianos.english.forecast-catalog.v1',
    exam_objects: examObjects,
    whole_papers: wholePapers,
    external_reading: englishExternalForecastCatalog(),
    evidence_boundary:
      'Build-time object identity only: no answers, source prose, learner exposure claim, mastery claim, or task priority.'
  };
}

export function politicsProductCatalog(base = '/') {
  if (cache.has(base)) return cache.get(base);
  const p = publicPracticeCatalog(buildPoliticsPracticeCatalogCurrent(base));
  const result = { revision: p.revision, subjects: p.subjects, chapters: p.chapters,
    units: p.units.map(({ key, id, title, subject, chapter, href, questionIds, returnConfig }) =>
      ({ key, id, title, subject, chapter, href, questionIds, returnConfig })),
    questions: p.questions.map(({ id, sourceId, number, subject, subjectLabel, chapter,
      chapterTitle, unitKey, unitId, unitTitle, unitHref, type, taskRevision }) =>
      ({ id, sourceId, number, subject, subjectLabel, chapter, chapterTitle, unitKey, unitId, unitTitle, unitHref, type, taskRevision })) };
  cache.set(base, result); return result;
}

export function examProductCatalog(base = '/') {
  return {
    base,
    english: englishProductCatalog(),
    politics: politicsProductCatalog(base),
    xizong: listProjectableXizongSystems().map(system => {
      const sweep = loadXizongSystemQuestionSweep(system);
      return { id: system.systemId, title: system.title, href: `${base}xizong/${system.systemId}/`,
        scopeHash: sweep?.scopeHash || null, inventoryHash: sweep?.questionInventoryHash || null,
        questions: (sweep?.questions || []).map(({ questionId, year }) => ({ questionId, year })) };
    })
  };
}
