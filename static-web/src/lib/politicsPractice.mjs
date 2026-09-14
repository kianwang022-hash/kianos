import fs from 'node:fs';
import path from 'node:path';

import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from './politicsCurrent.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const ROOT = 'content/politics';
const PROVENANCE = `${ROOT}/source/xiao_2027_explanation_provenance.v1.json`;
const ASSETS = `${ROOT}/source/xiao_2027_question_assets.json`;
const REGIONS = `${ROOT}/source/politics_unified_regions.v1.jsonl`;
const QUESTION_MANIFEST = `${ROOT}/source/questions/manifest.json`;
const QUESTION_SHARDS = `${ROOT}/source/questions/shards`;
const PROJECTION_MANIFEST = `${ROOT}/projection/manifest.json`;
const PROJECTION_ROOT = `${ROOT}/projection`;
const REFINED = `${ROOT}/question-explanations/current.json`;
const QUESTION_WIDTH = 25;

const SOURCE_SUBJECTS = Object.freeze({
  marx: { canonical: 'MARX', current: 'marxism' },
  history: { canonical: 'HISTORY', current: 'history' },
  mao: { canonical: 'MAO', current: 'mao' },
  xi: { canonical: 'XI', current: 'xi' },
  ethics: { canonical: 'ETHICS', current: 'ethics_law' }
});

function absolute(relativePath) { return path.join(repoRoot, relativePath); }
function exists(relativePath) { return fs.existsSync(absolute(relativePath)); }
function readText(relativePath) { return fs.readFileSync(absolute(relativePath), 'utf8'); }
function readJson(relativePath) { return JSON.parse(readText(relativePath)); }
function list(value) { return Array.isArray(value) ? value : (value == null ? [] : [value]); }
function clean(value) { return String(value || '').trim(); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function parseJsonl(relativePath) {
  if (!exists(relativePath)) return [];
  return readText(relativePath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}

function sourceQuestionId(question = {}) {
  return clean(question.sourceId || question.source_id || question.question_id || question.id);
}

function canonicalQuestionId(sourceId) {
  const match = clean(sourceId).match(/^xiao_2027_(marx|history|mao|xi|ethics)_(single|multiple)_(\d{3})$/i);
  if (!match) return '';
  const subject = SOURCE_SUBJECTS[match[1].toLowerCase()];
  if (!subject) return '';
  return `X1000-${subject.canonical}-${match[2].toLowerCase() === 'single' ? 'S' : 'M'}-${match[3]}`;
}

function questionType(question = {}) {
  const declared = clean(question.question_type || question.type).toLowerCase();
  if (declared === 'single' || declared === 'multiple') return declared;
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
  const rows = new Map();
  for (const row of list(payload.records)) {
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

function questionTruthRows() {
  const manifest = readJson(QUESTION_MANIFEST);
  const rows = new Map();
  for (const [sourceSubject, counts] of Object.entries(manifest.subject_counts || {})) {
    const subjectMeta = SOURCE_SUBJECTS[sourceSubject];
    if (!subjectMeta) continue;
    for (const kind of ['single', 'multiple']) {
      const count = Number(counts?.[kind] || 0);
      for (let start = 1; start <= count; start += QUESTION_WIDTH) {
        const end = start + QUESTION_WIDTH - 1;
        const shardPath = `${QUESTION_SHARDS}/${sourceSubject}/${kind}/q${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}.json`;
        if (!exists(shardPath)) throw new Error(`POLITICS_PRACTICE_QUESTION_SHARD_MISSING:${shardPath}`);
        const shard = readJson(shardPath);
        for (const [sourceId, row] of Object.entries(shard || {})) {
          if (clean(row?.question_type).toLowerCase() !== kind) continue;
          if (clean(row?.training_status) !== 'training_ready') continue;
          const canonicalId = canonicalQuestionId(sourceId);
          if (!canonicalId) throw new Error(`POLITICS_PRACTICE_CANONICAL_ID_INVALID:${sourceId}`);
          if (rows.has(canonicalId)) throw new Error(`POLITICS_PRACTICE_CANONICAL_ID_DUPLICATE:${canonicalId}`);
          rows.set(canonicalId, {
            canonicalId,
            sourceId,
            sourceSubject,
            currentSubject: subjectMeta.current,
            row
          });
        }
      }
    }
  }
  return rows;
}

function referenceOnlyUnits() {
  const manifest = readJson(PROJECTION_MANIFEST);
  const result = new Map();
  for (const [projectionSubject, subject] of Object.entries(manifest.subjects || {})) {
    const currentSubject = projectionSubject === 'ethics-law' ? 'ethics_law' : projectionSubject;
    for (const relativeFile of list(subject?.files)) {
      const projection = readJson(`${PROJECTION_ROOT}/${relativeFile}`);
      const chapter = path.basename(relativeFile).replace(/\.projection\.json$/i, '').toLowerCase();
      for (const unit of list(projection?.units)) {
        if (clean(unit?.projection_disposition) !== 'REFERENCE_ONLY') continue;
        const unitId = clean(unit?.unit_id);
        if (!unitId) continue;
        result.set(unitId, {
          unitId,
          parentProjectionUnitId: clean(unit?.parent_projection_unit_id),
          note: clean(unit?.note),
          subject: currentSubject,
          chapter,
          projectionFile: `${PROJECTION_ROOT}/${relativeFile}`
        });
      }
    }
  }
  return result;
}

function regionOwnership() {
  const byQuestion = new Map();
  const byUnit = new Map();
  for (const row of parseJsonl(REGIONS)) {
    const unitId = clean(row?.natural_unit_id);
    if (!unitId || clean(row?.status) !== 'canonical') continue;
    byUnit.set(unitId, row);
    for (const questionId of list(row?.xiao_question_refs).map(clean).filter(Boolean)) {
      if (!byQuestion.has(questionId)) byQuestion.set(questionId, []);
      byQuestion.get(questionId).push(row);
    }
  }
  return { byQuestion, byUnit };
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
    expected_question_ids: [...questionIds],
    expected_question_count: questionIds.length,
    learner_state: 'PENDING_ATTEMPT_EVIDENCE',
    mastery_claim: 'NONE',
    evidence_precision: 'NATURAL_UNIT_SAFE_FALLBACK',
    evidence_basis: 'CURRENT_NATURAL_UNIT_OWNERSHIP+FORMAL_FIRST_READY'
  };
}

function optionRows(rawOptions) {
  if (!rawOptions || typeof rawOptions !== 'object' || Array.isArray(rawOptions)) return [];
  return ['A', 'B', 'C', 'D'].map((label) => ({ label, text: clean(rawOptions[label]) })).filter((row) => row.text);
}

export function buildPoliticsPracticeCatalogCurrent(base = '/') {
  const provenance = buildProvenanceIndex();
  const assets = buildAssetIndex();
  const refined = buildRefinedIndex();
  const truth = questionTruthRows();
  const referenceOnly = referenceOnlyUnits();
  const regions = regionOwnership();
  const subjectRows = listPoliticsSubjectsCurrent();
  const subjects = [];
  const chapters = [];
  const units = [];
  const activeQuestionOwner = new Map();
  const activeQuestionOwnerDuplicates = new Map();
  const activeUnitByNaturalId = new Map();

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
      chapters.push({
        key: chapterKey,
        subject: subjectRow.subject,
        code: chapterMeta.code,
        title: chapter.title,
        questionIds: []
      });

      for (let unitIndex = 0; unitIndex < (chapter.units || []).length; unitIndex += 1) {
        const unit = chapter.units[unitIndex];
        const unitId = clean(unit.unitId || list(unit.representedNaturalUnitIds)[0]);
        if (!unitId) continue;
        const unitKey = `${chapterKey}/${unitId}`;
        const questionIds = list(unit.questions).map((question) => clean(question.id)).filter(Boolean);
        const representedNaturalUnitIds = uniq([unitId, ...list(unit.representedNaturalUnitIds).map(clean)]);
        const source = sourceRows(unit);
        const boundaries = list(unit.teaching?.boundaries).map(clean).filter(Boolean);
        const unitHref = `${base}politics/${subjectRow.subject}/${chapterMeta.code}/#unit-${unitIndex + 1}`;
        const record = {
          key: unitKey,
          id: unitId,
          representedNaturalUnitIds,
          title: clean(unit.title || unitId),
          subject: subjectRow.subject,
          subjectLabel: subjectRow.label,
          chapter: chapterMeta.code,
          chapterTitle: chapter.title,
          href: unitHref,
          questionIds: [...questionIds],
          source,
          boundaries,
          returnConfig: returnConfig(subjectRow.subject, chapterMeta.code, unit, questionIds)
        };
        units.push(record);
        for (const representedId of representedNaturalUnitIds) activeUnitByNaturalId.set(representedId, record);
        for (const questionId of questionIds) {
          const previous = activeQuestionOwner.get(questionId);
          if (previous && previous.key !== record.key) {
            if (!activeQuestionOwnerDuplicates.has(questionId)) activeQuestionOwnerDuplicates.set(questionId, [previous.key]);
            activeQuestionOwnerDuplicates.get(questionId).push(record.key);
          }
          // Current chapter loaders already apply formal first-ready rules where they exist.
          // A later remaining occurrence is the effective last-necessary active owner.
          activeQuestionOwner.set(questionId, record);
        }
      }
    }
  }

  const subjectById = new Map(subjects.map((row) => [row.id, row]));
  const chapterByKey = new Map(chapters.map((row) => [row.key, row]));
  const questions = [];
  const unresolvedOwners = [];
  const recoveredReferenceOnlyQuestionIds = [];

  for (const [questionId, truthRow] of truth.entries()) {
    let owner = activeQuestionOwner.get(questionId) || null;
    let scopeStatus = 'ACTIVE_UNIT';
    let referenceOwnerIds = [];

    if (!owner) {
      const candidateRows = list(regions.byQuestion.get(questionId));
      referenceOwnerIds = uniq(candidateRows.map((row) => clean(row?.natural_unit_id)).filter((id) => referenceOnly.has(id)));
      const parentKeys = uniq(referenceOwnerIds.map((id) => {
        const parentId = referenceOnly.get(id)?.parentProjectionUnitId || '';
        return activeUnitByNaturalId.get(parentId)?.key || '';
      }));

      if (referenceOwnerIds.length && parentKeys.length === 1) {
        owner = units.find((unit) => unit.key === parentKeys[0]) || null;
        scopeStatus = 'REFERENCE_ONLY_EMBEDDED_IN_PARENT';
      } else {
        unresolvedOwners.push({
          questionId,
          candidateNaturalUnitIds: candidateRows.map((row) => clean(row?.natural_unit_id)).filter(Boolean),
          referenceOwnerIds,
          parentKeys
        });
        scopeStatus = 'QUESTION_SCOPE_UNRESOLVED';
      }
    }

    if (owner && scopeStatus === 'REFERENCE_ONLY_EMBEDDED_IN_PARENT') {
      recoveredReferenceOnlyQuestionIds.push(questionId);
      if (!owner.questionIds.includes(questionId)) owner.questionIds.push(questionId);
      if (!owner.returnConfig.expected_question_ids.includes(questionId)) {
        owner.returnConfig.expected_question_ids.push(questionId);
        owner.returnConfig.expected_question_count = owner.returnConfig.expected_question_ids.length;
      }
    }

    const sourceId = truthRow.sourceId;
    const raw = truthRow.row || {};
    const provenanceRow = provenance.get(sourceId) || provenance.get(questionId) || null;
    const asset = assets.get(sourceId) || assets.get(questionId) || null;
    const refinedRow = refined.rows.get(questionId) || refined.rows.get(sourceId) || null;
    const subjectMeta = subjectById.get(truthRow.currentSubject) || { label: truthRow.currentSubject };
    const chapterKey = owner ? `${owner.subject}/${owner.chapter}` : '';
    const chapter = owner ? chapterByKey.get(chapterKey) : null;

    questions.push({
      id: questionId,
      sourceId,
      subject: truthRow.currentSubject,
      subjectLabel: clean(subjectMeta.label || truthRow.currentSubject),
      chapter: owner?.chapter || '',
      chapterTitle: owner?.chapterTitle || chapter?.title || '',
      unitKey: owner?.key || '',
      unitId: owner?.id || '',
      unitTitle: owner?.title || '',
      unitHref: owner?.href || '',
      scopeStatus,
      referenceOwnerIds,
      type: questionType(raw),
      stem: clean(raw.stem),
      options: optionRows(raw.options),
      answer: clean(raw.answer),
      originalExplanation: clean(raw.explanation),
      xiaoReference: {
        label: clean(provenanceRow?.learner_label || '原解析'),
        status: clean(provenanceRow?.status || ''),
        text: clean(raw.explanation)
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

  const validQuestionIds = new Set(questions.map((question) => question.id));
  for (const unit of units) {
    unit.questionIds = uniq(unit.questionIds.filter((id) => validQuestionIds.has(id)));
    unit.returnConfig.expected_question_ids = uniq(unit.returnConfig.expected_question_ids.filter((id) => validQuestionIds.has(id)));
    unit.returnConfig.expected_question_count = unit.returnConfig.expected_question_ids.length;
  }
  for (const chapter of chapters) {
    chapter.questionIds = questions.filter((question) => question.subject === chapter.subject && question.chapter === chapter.code).map((question) => question.id);
  }

  return {
    schema: 'kianos.politics.practice_catalog.v1',
    generatedFrom: 'CURRENT_QUESTION_TRUTH+CURRENT_FIRST_READY+REFERENCE_ONLY_PARENT_BINDING',
    refinedExplanationStatus: refined.status,
    refinedExplanationContentVersion: refined.contentVersion,
    questionCount: questions.length,
    subjects,
    chapters,
    units,
    questions,
    diagnostics: {
      activeQuestionOwnerCount: activeQuestionOwner.size,
      activeQuestionOwnerDuplicateCount: activeQuestionOwnerDuplicates.size,
      activeQuestionOwnerDuplicates: Object.fromEntries(activeQuestionOwnerDuplicates),
      referenceOnlyNaturalUnitCount: referenceOnly.size,
      recoveredReferenceOnlyQuestionCount: recoveredReferenceOnlyQuestionIds.length,
      recoveredReferenceOnlyQuestionIds,
      unresolvedPracticeOwnerCount: unresolvedOwners.length,
      unresolvedPracticeOwners: unresolvedOwners
    },
    boundaries: {
      answerGatedInLearnerUI: true,
      firstAttemptUsesCurrentSnapshot: true,
      dueSchedulerExcluded: true,
      ocrExplanationDoesNotSubstituteRefinedExplanation: true,
      referenceOnlyDoesNotBecomeIndependentTeachingUnit: true,
      originalQuestionFaceMetadataOnlyUntilBytesAreMaterialized: true
    }
  };
}
