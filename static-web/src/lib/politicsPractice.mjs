import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

import { listPoliticsSubjectsCurrent, loadPoliticsChapterCurrent } from './politicsCurrent.mjs';
import { classifyPoliticsSourceNodeFidelity, loadPoliticsSourceFidelityOverrides } from './politicsSourceFidelity.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const ROOT = 'content/politics';
const ASSETS = `${ROOT}/source/xiao_2027_question_assets.json`;
const REGIONS = `${ROOT}/source/politics_unified_regions.v1.jsonl`;
const QUESTION_MANIFEST = `${ROOT}/source/questions/manifest.json`;
const QUESTION_SHARDS = `${ROOT}/source/questions/shards`;
const PROJECTION_MANIFEST = `${ROOT}/projection/manifest.json`;
const PROJECTION_ROOT = `${ROOT}/projection`;
const SOURCE_NODE_SHARDS = `${ROOT}/source/nodes/shards`;
const LEARNER_EXPLANATION_MANIFEST = `${ROOT}/derived/xiao1000-learner-explanations/manifest.json`;
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
function readBuffer(relativePath) { return fs.readFileSync(absolute(relativePath)); }
function list(value) { return Array.isArray(value) ? value : (value == null ? [] : [value]); }
function clean(value) { return String(value || '').trim(); }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function parseJsonl(relativePath) {
  if (!exists(relativePath)) return [];
  return readText(relativePath).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(JSON.parse);
}

function slug(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function sourceNodeShardPath(ownerId) {
  const id = String(ownerId || '');
  const match = id.match(/^POL27-([A-Z0-9]+)-([A-Z0-9_]+)(?:-|$)/i);
  if (!match) return '';
  const source = slug(`POL27-${match[1]}`);
  const subject = slug(match[2]);
  const chapter = id.match(/-C(\d{2})(?:-|$)/i)?.[1] || null;
  const page = id.match(/-P(\d{3})(?:-|$)/i)?.[1] || null;
  const partition = chapter ? `c${chapter}` : page ? `p${page}` : 'root';
  return `${SOURCE_NODE_SHARDS}/${source}/${subject}/${partition}.json`;
}

const sourceNodeShardCache = new Map();
let sourceFidelityOverridesCache;
function sourceFidelityOverrides() {
  if (!sourceFidelityOverridesCache) sourceFidelityOverridesCache = loadPoliticsSourceFidelityOverrides();
  return sourceFidelityOverridesCache;
}
function sourceNodeRows(ownerId) {
  const relativePath = sourceNodeShardPath(ownerId);
  if (!relativePath || !exists(relativePath)) return [];
  if (!sourceNodeShardCache.has(relativePath)) sourceNodeShardCache.set(relativePath, readJson(relativePath));
  const shard = sourceNodeShardCache.get(relativePath);
  return Object.entries(shard || {})
    .filter(([id]) => id === ownerId || id.startsWith(`${ownerId}-`))
    .map(([id, row]) => ({ id, row }));
}

function normalizedMatchText(value) {
  return clean(value).replace(/[\s·•，。、“”‘’：:；;（）()【】\[\]<>《》—–\-_/\\]/g, '');
}

function locatorStep(id, row) {
  const title = clean(row?.title || row?.original_text_span);
  if (/-K\d+$/i.test(id)) {
    const number = title.match(/考点\s*(\d+)/)?.[1] || id.match(/-K(\d+)$/i)?.[1];
    return number ? `考点${Number(number)}` : '';
  }
  if (/-N\d+$/i.test(id)) {
    const number = title.match(/^\s*(\d+)\s*[.．、]/)?.[1] || id.match(/-N(\d+)$/i)?.[1];
    return number ? String(Number(number)) : '';
  }
  if (/-I\d+$/i.test(id)) {
    const number = title.match(/^[（(]\s*(\d+)\s*[）)]/)?.[1] || id.match(/-I(\d+)$/i)?.[1];
    return number ? `（${Number(number)}）` : '';
  }
  return '';
}

function exactChengfengLocator(rawQuestion, unit) {
  if (!unit || !Array.isArray(unit.source) || clean(rawQuestion?.answer).length !== 1) return null;
  const answerLabel = clean(rawQuestion.answer).toUpperCase();
  if (!/^[A-D]$/.test(answerLabel)) return null;
  const answerText = clean(rawQuestion?.options?.[answerLabel]);
  const needle = normalizedMatchText(answerText);
  if (needle.length < 6) return null;

  const candidates = [];
  for (const source of unit.source) {
    const ownerId = clean(source?.id);
    if (!ownerId || !ownerId.startsWith('POL27-CF-')) continue;
    for (const entry of sourceNodeRows(ownerId)) {
      const fidelity = classifyPoliticsSourceNodeFidelity(entry.id, entry.row, sourceFidelityOverrides());
      if (!fidelity.admitted) continue;
      const rowText = normalizedMatchText(entry.row?.original_text_span || entry.row?.title);
      if (!rowText || !rowText.includes(needle)) continue;
      const depth = Array.isArray(entry.row?.hierarchy_path) ? entry.row.hierarchy_path.length : entry.id.split('-').length;
      candidates.push({ ...entry, ownerId, depth, fidelity });
    }
  }
  if (!candidates.length) return null;

  const deepest = Math.max(...candidates.map((row) => row.depth));
  const leaves = candidates.filter((row) => row.depth === deepest);
  if (leaves.length !== 1) return null;
  const match = leaves[0];

  const shardPath = sourceNodeShardPath(match.ownerId);
  const shard = shardPath && exists(shardPath) ? readJson(shardPath) : {};
  const hierarchy = Array.isArray(match.row?.hierarchy_path) ? match.row.hierarchy_path : [];
  const hierarchyRows = hierarchy.map((id) => ({ id, row: shard?.[id] || (id === match.id ? match.row : null) }));
  if (hierarchyRows.some(({ id, row }) => row
    && !classifyPoliticsSourceNodeFidelity(id, row, sourceFidelityOverrides()).admitted)) {
    return null;
  }
  const steps = hierarchyRows
    .map(({ id, row }) => locatorStep(id, row))
    .filter(Boolean);
  const page = Number(match.row?.book_page_start || match.row?.book_page_end || 0);
  if (!steps.length || !page) return null;

  const [examPoint, ...rest] = steps;
  const display = `乘风要点 P${page}${examPoint ? `【${examPoint}】` : ''}${rest.map((step) => `→${step}`).join('')}`;
  return {
    status: 'EXACT_SOURCE_NODE',
    source: '乘风',
    bookPage: page,
    steps,
    display,
    sourceNodeId: match.id,
    matchBasis: 'CORRECT_OPTION_EXACT_SOURCE_NODE_MATCH'
  };
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

function questionNumber(sourceId) {
  return Number(clean(sourceId).match(/_(\d{3})$/)?.[1] || 0);
}

function buildAssetIndex() {
  if (!exists(ASSETS)) return new Map();
  const payload = readJson(ASSETS);
  return new Map(Object.entries(payload.assets || {}));
}

export function decodePoliticsExplanationBytes(manifest, compressed) {
  if (!/^[a-f0-9]{64}$/.test(manifest.compressed_asset_sha256 || '') || sha256(compressed) !== manifest.compressed_asset_sha256) {
    throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_COMPRESSED_SHA_MISMATCH');
  }
  let decoded;
  try { decoded = gunzipSync(compressed); }
  catch { throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_GZIP_INVALID'); }
  // Stage 0 defines this as the exact decompressed UTF-8 byte stream, including LF.
  if (!/^[a-f0-9]{64}$/.test(manifest.derived_payload_sha256 || '') || sha256(decoded) !== manifest.derived_payload_sha256) {
    throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_PAYLOAD_SHA_MISMATCH');
  }
  return decoded;
}

function buildLearnerExplanationIndex() {
  if (!exists(LEARNER_EXPLANATION_MANIFEST)) {
    throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_MANIFEST_MISSING:${LEARNER_EXPLANATION_MANIFEST}`);
  }

  const manifest = readJson(LEARNER_EXPLANATION_MANIFEST);
  if (clean(manifest.schema) !== 'kianos.politics.xiao1000_learner_explanation_manifest.v1') {
    throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_SCHEMA:${clean(manifest.schema) || 'missing'}`);
  }
  if (clean(manifest.status) !== 'CURRENT_DERIVED_LEARNER_FACING_ASSET') {
    throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_STATUS:${clean(manifest.status) || 'missing'}`);
  }
  if (clean(manifest.binding?.field) !== 'question_id' || clean(manifest.binding?.rule) !== 'EXACT_STABLE_QUESTION_ID_ONLY') {
    throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_BINDING_CONTRACT');
  }

  const dataFile = clean(manifest.data_file);
  if (!dataFile || !exists(dataFile)) {
    throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_ASSET_MISSING:${dataFile || 'missing'}`);
  }

  const decoded = decodePoliticsExplanationBytes(manifest, readBuffer(dataFile));
  let payload;
  try {
    payload = JSON.parse(decoded.toString('utf8'));
  } catch {
    throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_JSON_INVALID');
  }

  const records = Array.isArray(payload) ? payload : list(payload?.records);
  const expectedCount = Number(manifest.record_count || 0);
  if (!expectedCount || records.length !== expectedCount) {
    throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_COUNT:${records.length}:${expectedCount}`);
  }

  const rows = new Map();
  for (const row of records) {
    const fields = ['question_id', 'legacy_question_id', 'subject', 'takeaway', 'chat_explanation'];
    if (!row || Object.keys(row).length !== fields.length || fields.some((field) => typeof row[field] !== 'string')) {
      throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_FIELDS');
    }
    const id = clean(row?.question_id);
    if (!id) throw new Error('POLITICS_PRACTICE_LEARNER_EXPLANATION_ID_MISSING');
    if (rows.has(id)) throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_ID_DUPLICATE:${id}`);
    const takeaway = row.takeaway;
    const chatExplanation = row.chat_explanation;
    if (!takeaway.trim() || !chatExplanation.trim()) {
      throw new Error(`POLITICS_PRACTICE_LEARNER_EXPLANATION_INCOMPLETE:${id}`);
    }
    rows.set(id, { takeaway, chatExplanation });
  }

  return {
    status: clean(manifest.status),
    contentVersion: clean(manifest.content_version),
    rowCount: rows.size,
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
  for (const row of parseJsonl(REGIONS)) {
    const unitId = clean(row?.natural_unit_id);
    if (!unitId || clean(row?.status) !== 'canonical') continue;
    for (const questionId of list(row?.xiao_question_refs).map(clean).filter(Boolean)) {
      if (!byQuestion.has(questionId)) byQuestion.set(questionId, []);
      byQuestion.get(questionId).push(row);
    }
  }
  return { byQuestion };
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
  const assets = buildAssetIndex();
  const refined = buildLearnerExplanationIndex();
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
    const asset = assets.get(sourceId) || assets.get(questionId) || null;
    const refinedRow = refined.rows.get(sourceId) || null;
    if (!refinedRow) throw new Error(`POLITICS_PRACTICE_REFINED_BINDING_MISSING:${sourceId}`);

    const subjectMeta = subjectById.get(truthRow.currentSubject) || { label: truthRow.currentSubject };
    const chapterKey = owner ? `${owner.subject}/${owner.chapter}` : '';
    const chapter = owner ? chapterByKey.get(chapterKey) : null;

    questions.push({
      id: questionId,
      sourceId,
      number: questionNumber(sourceId),
      subject: truthRow.currentSubject,
      subjectLabel: clean(subjectMeta.label || truthRow.currentSubject),
      chapter: owner?.chapter || '',
      chapterTitle: owner?.chapterTitle || chapter?.title || '',
      unitKey: owner?.key || '',
      unitId: owner?.id || '',
      unitTitle: owner?.title || '',
      unitHref: owner?.href || '',
      scopeStatus,
      semanticUnitIds: uniq(list(regions.byQuestion.get(questionId)).map(row => clean(row?.natural_unit_id))),
      referenceOwnerIds,
      type: questionType(raw),
      stem: clean(raw.stem),
      options: optionRows(raw.options),
      answer: clean(raw.answer),
      refined: {
        takeaway: refinedRow.takeaway,
        chatExplanation: refinedRow.chatExplanation,
        contentVersion: refined.contentVersion
      },
      chengfengLocator: exactChengfengLocator(raw, owner),
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

  if (questions.length !== refined.rowCount) {
    throw new Error(`POLITICS_PRACTICE_REFINED_COVERAGE:${questions.length}:${refined.rowCount}`);
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

  for (const question of questions) {
    // Task-changing truth invalidates this task, not every Politics session.
    // Explanatory copy, unrelated Units and geometry do not change this identity.
    question.taskRevision = sha256(JSON.stringify({ id: question.id,
      sourceId: question.sourceId, unitKey: question.unitKey, type: question.type,
      stem: question.stem, options: question.options, answer: question.answer }));
  }

  return {
    schema: 'kianos.politics.practice_catalog.v1',
    revision: sha256(JSON.stringify({ questions, units })),
    reviewBase: `${base}politics/practice-review/`,
    generatedFrom: 'CURRENT_QUESTION_TRUTH+CURRENT_FIRST_READY+REFERENCE_ONLY_PARENT_BINDING+CURRENT_DERIVED_LEARNER_EXPLANATIONS',
    refinedExplanationStatus: refined.status,
    refinedExplanationContentVersion: refined.contentVersion,
    refinedExplanationCount: refined.rowCount,
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
      refinedExplanationExactStableIdOnly: true,
      learnerFacingOriginalExplanationExcluded: true,
      referenceOnlyDoesNotBecomeIndependentTeachingUnit: true,
      originalQuestionFaceMetadataOnlyUntilBytesAreMaterialized: true,
      sourceTextRequiresFidelityAdmission: true,
      blockedSourceTextCannotEnterReviewContext: true
    }
  };
}
