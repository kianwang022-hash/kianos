import fs from 'node:fs';
import path from 'node:path';

import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from './politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const PROVENANCE = 'content/politics/source/xiao_2027_explanation_provenance.v1.json';
const ASSETS = 'content/politics/source/xiao_2027_question_assets.json';
const REFINED = 'content/politics/question-explanations/current.json';

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(absolute(relativePath), 'utf8')); }
function list(value) { return Array.isArray(value) ? value : (value == null ? [] : [value]); }
function clean(value) { return String(value || '').trim(); }

function sourceQuestionId(question = {}) {
  return clean(question.sourceId || question.source_id || question.id);
}

function questionType(question = {}) {
  const sourceId = sourceQuestionId(question).toLowerCase();
  if (sourceId.includes('_multiple_') || /-M-\d+$/i.test(clean(question.id))) return 'multiple';
  return 'single';
}

function buildProvenanceIndex() {
  if (!exists(PROVENANCE)) return new Map();
  const payload = readJson(PROVENANCE);
  return new Map(list(payload.records).map((row) => [clean(row.question_id), row]).filter(([id]) => id));
}

function buildAssetIndex() {
  if (!exists(ASSETS)) return new Map();
  const payload = readJson(ASSETS);
  return new Map(Object.entries(payload.assets || {}));
}

function buildRefinedIndex() {
  if (!exists(REFINED)) return { status: 'UNAVAILABLE', contentVersion: '', rows: new Map() };
  const payload = readJson(REFINED);
  const records = list(payload.records);
  const rows = new Map();
  for (const row of records) {
    const id = clean(row.question_id || row.runtime_question_id);
    if (!id) continue;
    rows.set(id, row);
  }
  return {
    status: clean(payload.status || 'CURRENT'),
    contentVersion: clean(payload.content_version),
    rows
  };
}

function sourceRows(unit = {}) {
  return list(unit.sourceNodes).map((row) => ({
    id: clean(row.id),
    title: clean(row.title),
    text: clean(row.text)
  })).filter((row) => row.id || row.title || row.text);
}

function returnConfig(subject, chapter, unit, questionIds) {
  const unitId = clean(unit.unitId || list(unit.representedNaturalUnitIds)[0]);
  return {
    schema: 'kianos.politics.unit_return_projection.v1',
    unit_key: `${subject}/${chapter}/${unitId}`,
    subject,
    chapter,
    natural_unit_id: unitId,
    runtime_unit_id: unitId,
    expected_question_ids: questionIds,
    expected_question_count: questionIds.length,
    learner_state: 'PENDING_ATTEMPT_EVIDENCE',
    mastery_claim: 'NONE',
    evidence_precision: 'NATURAL_UNIT_SAFE_FALLBACK',
    evidence_basis: 'CURRENT_NATURAL_UNIT_OWNERSHIP+FORMAL_FIRST_READY'
  };
}

export function buildPoliticsPracticeCatalogCurrent(base = '/') {
  const provenance = buildProvenanceIndex();
  const assets = buildAssetIndex();
  const refined = buildRefinedIndex();
  const subjectRows = listPoliticsSubjectsCurrent();
  const subjects = [];
  const chapters = [];
  const units = [];
  const questions = [];
  const seen = new Set();

  for (const subjectRow of subjectRows) {
    subjects.push({
      id: subjectRow.subject,
      label: subjectRow.label,
      shape: subjectRow.shape,
      description: subjectRow.description
    });

    for (const chapterMeta of subjectRow.chapters || []) {
      const chapter = loadPoliticsChapterCurrent(subjectRow.subject, chapterMeta.code);
      const chapterKey = `${subjectRow.subject}/${chapterMeta.code}`;
      const chapterQuestions = [];

      for (let unitIndex = 0; unitIndex < (chapter.units || []).length; unitIndex += 1) {
        const unit = chapter.units[unitIndex];
        const unitId = clean(unit.unitId || list(unit.representedNaturalUnitIds)[0]);
        if (!unitId) continue;
        const unitKey = `${chapterKey}/${unitId}`;
        const questionIds = list(unit.questions).map((question) => clean(question.id)).filter(Boolean);
        const source = sourceRows(unit);
        const boundaries = list(unit.teaching?.boundaries).map(clean).filter(Boolean);
        const unitHref = `${base}politics/${subjectRow.subject}/${chapterMeta.code}/#unit-${unitIndex + 1}`;

        units.push({
          key: unitKey,
          id: unitId,
          title: clean(unit.title || unitId),
          subject: subjectRow.subject,
          subjectLabel: subjectRow.label,
          chapter: chapterMeta.code,
          chapterTitle: chapter.title,
          href: unitHref,
          questionIds,
          source,
          boundaries,
          returnConfig: returnConfig(subjectRow.subject, chapterMeta.code, unit, questionIds)
        });

        for (const question of unit.questions || []) {
          const questionId = clean(question.id);
          if (!questionId || seen.has(questionId)) continue;
          seen.add(questionId);
          chapterQuestions.push(questionId);
          const sourceId = sourceQuestionId(question);
          const provenanceRow = provenance.get(sourceId) || provenance.get(questionId) || null;
          const asset = assets.get(sourceId) || assets.get(questionId) || null;
          const refinedRow = refined.rows.get(questionId) || refined.rows.get(sourceId) || null;
          const options = list(question.options).map((option) => ({
            label: clean(option.label),
            text: clean(option.text)
          })).filter((option) => option.label && option.text);

          questions.push({
            id: questionId,
            sourceId,
            subject: subjectRow.subject,
            subjectLabel: subjectRow.label,
            chapter: chapterMeta.code,
            chapterTitle: chapter.title,
            unitKey,
            unitId,
            unitTitle: clean(unit.title || unitId),
            unitHref,
            type: questionType(question),
            stem: clean(question.stem),
            options,
            answer: clean(question.answer),
            originalExplanation: clean(question.explanation),
            xiaoReference: {
              label: clean(provenanceRow?.learner_label || '原解析'),
              status: clean(provenanceRow?.status || ''),
              text: clean(question.explanation)
            },
            refined: refinedRow ? {
              takeaway: clean(refinedRow.takeaway),
              chatExplanation: clean(refinedRow.chat_explanation),
              contentVersion: refined.contentVersion
            } : null,
            originalFace: asset ? {
              assetId: clean(asset.asset_id || sourceId),
              relativePath: clean(asset.relative_path),
              sha256: clean(asset.sha256),
              width: Number(asset.width || 0),
              height: Number(asset.height || 0),
              materialized: false
            } : null
          });
        }
      }

      chapters.push({
        key: chapterKey,
        subject: subjectRow.subject,
        code: chapterMeta.code,
        title: chapter.title,
        questionIds: chapterQuestions
      });
    }
  }

  const unitByKey = new Map(units.map((unit) => [unit.key, unit]));
  const validQuestionIds = new Set(questions.map((question) => question.id));
  for (const unit of units) {
    unit.questionIds = unit.questionIds.filter((id) => validQuestionIds.has(id));
    unit.returnConfig.expected_question_ids = unit.returnConfig.expected_question_ids.filter((id) => validQuestionIds.has(id));
    unit.returnConfig.expected_question_count = unit.returnConfig.expected_question_ids.length;
  }
  for (const chapter of chapters) chapter.questionIds = chapter.questionIds.filter((id) => validQuestionIds.has(id));

  const unresolvedUnitQuestions = questions.filter((question) => !unitByKey.has(question.unitKey)).map((question) => question.id);
  if (unresolvedUnitQuestions.length) {
    throw new Error(`POLITICS_PRACTICE_UNIT_BINDING_MISSING:${unresolvedUnitQuestions.slice(0, 5).join(',')}`);
  }

  return {
    schema: 'kianos.politics.practice_catalog.v1',
    generatedFrom: 'CURRENT_QUESTION_TRUTH+CURRENT_NATURAL_UNIT_OWNERSHIP',
    refinedExplanationStatus: refined.status,
    refinedExplanationContentVersion: refined.contentVersion,
    questionCount: questions.length,
    subjects,
    chapters,
    units,
    questions,
    boundaries: {
      answerGatedInLearnerUI: true,
      firstAttemptUsesCurrentSnapshot: true,
      dueSchedulerExcluded: true,
      ocrExplanationDoesNotSubstituteRefinedExplanation: true,
      originalQuestionFaceMetadataOnlyUntilBytesAreMaterialized: true
    }
  };
}
