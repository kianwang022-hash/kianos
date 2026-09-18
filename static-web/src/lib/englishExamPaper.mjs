import fs from 'node:fs';
import path from 'node:path';
import { listReadingSets } from './englishReadingSourceTruth.mjs';
import { listClozeSets, listReadingBSets } from './englishObjectiveSourceTruth.mjs';
import { listTranslationSets } from './englishTranslationSourceTruth.mjs';
import { listWritingTasks } from './englishWriting.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const MANIFEST = 'content/english/manifest.json';
let cache = null;

const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
);

function examFormat() {
  const manifest = readJson(MANIFEST);
  const format = manifest?.exam_format;
  if (format?.schema !== 'kianos.english.exam_format.v1') {
    throw new Error('ENGLISH_EXAM_FORMAT_NOT_READY');
  }
  if (Number(format.duration_minutes) !== 180 || Number(format.total_points) !== 100) {
    throw new Error('ENGLISH_EXAM_FORMAT_INVALID');
  }
  return format;
}

function byPaper(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const paperId = String(row?.paperId || '');
    if (!paperId) continue;
    if (!map.has(paperId)) map.set(paperId, []);
    map.get(paperId).push(row);
  }
  return map;
}

function ordered(rows) {
  return [...rows].sort((a, b) => {
    const pos = Number(a?.position || 0) - Number(b?.position || 0);
    if (pos) return pos;
    return String(a?.id || '').localeCompare(String(b?.id || ''));
  });
}

function writingByKind(rows, kind) {
  return rows.filter((row) => row?.kind === kind && row?.sourceReady !== false);
}

function buildStep(task, row, index, maxPoints, extra = {}) {
  if (!row?.id) throw new Error(`ENGLISH_EXAM_STEP_ID_MISSING:${task}:${index}`);
  return {
    step_id: `${task}:${row.id}`,
    task,
    object_id: String(row.id),
    label: String(row.title || row.id),
    section: String(row.section || ''),
    max_points: Number(maxPoints),
    ...extra
  };
}

function buildPapers() {
  const format = examFormat();
  const cloze = byPaper(listClozeSets());
  const readingA = byPaper(listReadingSets());
  const readingB = byPaper(listReadingBSets());
  const translation = byPaper(listTranslationSets());
  const writing = byPaper(listWritingTasks());

  const candidates = [...new Set([
    ...cloze.keys(),
    ...readingA.keys(),
    ...readingB.keys(),
    ...translation.keys(),
    ...writing.keys()
  ])];

  const papers = [];
  for (const paperId of candidates) {
    const c = ordered(cloze.get(paperId) || []);
    const ra = ordered(readingA.get(paperId) || []);
    const rb = ordered(readingB.get(paperId) || []);
    const tr = ordered(translation.get(paperId) || []);
    const wr = ordered(writing.get(paperId) || []);
    const small = writingByKind(wr, 'small');
    const big = writingByKind(wr, 'big');

    if (c.length !== Number(format.sections.cloze.set_count)) continue;
    if (ra.length !== Number(format.sections.reading_a.set_count)) continue;
    if (rb.length !== Number(format.sections.reading_b.set_count)) continue;
    if (tr.length !== Number(format.sections.translation.set_count)) continue;
    if (wr.length !== Number(format.sections.writing.set_count) || small.length !== 1 || big.length !== 1) continue;

    const year = Number(c[0]?.year || ra[0]?.year || rb[0]?.year || tr[0]?.year || small[0]?.year || 0);
    if (!Number.isInteger(year) || year < 2000) continue;

    const steps = [
      buildStep('cloze', c[0], 0, format.sections.cloze.points),
      ...ra.map((row, index) => buildStep(
        'reading_a',
        row,
        index,
        format.sections.reading_a.points_per_set,
        { passage_index: index + 1 }
      )),
      buildStep('reading_b', rb[0], 0, format.sections.reading_b.points),
      buildStep('translation', tr[0], 0, format.sections.translation.points),
      buildStep('writing', small[0], 0, format.sections.writing.section_points.writing_part_a, { writing_kind: 'small' }),
      buildStep('writing', big[0], 1, format.sections.writing.section_points.writing_part_b, { writing_kind: 'big' })
    ];

    const maxPoints = steps.reduce((sum, step) => sum + Number(step.max_points || 0), 0);
    if (maxPoints !== Number(format.total_points)) {
      throw new Error(`ENGLISH_EXAM_POINTS_MISMATCH:${paperId}:${maxPoints}`);
    }

    papers.push({
      schema: 'kianos.english.exam-paper.v1',
      paper_id: paperId,
      year,
      duration_minutes: Number(format.duration_minutes),
      total_points: Number(format.total_points),
      objective_max_points: Number(format.objective_points),
      productive_max_points: Number(format.productive_points),
      default_task_order: [...format.official_task_order],
      steps
    });
  }

  return papers.sort((a, b) => b.year - a.year || a.paper_id.localeCompare(b.paper_id));
}

export function listEnglishExamPapers() {
  if (!cache) cache = buildPapers();
  return cache.map((paper) => ({
    paperId: paper.paper_id,
    year: paper.year,
    durationMinutes: paper.duration_minutes,
    totalPoints: paper.total_points,
    stepCount: paper.steps.length
  }));
}

export function loadEnglishExamPaper(paperId) {
  if (!cache) cache = buildPapers();
  const paper = cache.find((row) => row.paper_id === paperId);
  if (!paper) throw new Error(`ENGLISH_EXAM_PAPER_NOT_READY:${paperId}`);
  return JSON.parse(JSON.stringify(paper));
}

export function reorderEnglishExamSteps(paper, taskOrder = null) {
  const defaultOrder = [...(paper?.default_task_order || [])];
  if (!Array.isArray(taskOrder) || !taskOrder.length) return [...paper.steps];

  const normalized = taskOrder.map(String);
  if (normalized.length !== defaultOrder.length
    || new Set(normalized).size !== normalized.length
    || normalized.some((task) => !defaultOrder.includes(task))) {
    throw new Error('ENGLISH_EXAM_TASK_ORDER_INVALID');
  }

  const grouped = new Map();
  for (const step of paper.steps) {
    if (!grouped.has(step.task)) grouped.set(step.task, []);
    grouped.get(step.task).push(step);
  }
  return normalized.flatMap((task) => grouped.get(task) || []);
}
