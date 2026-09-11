import fs from 'node:fs';
import path from 'node:path';

import {
  listPoliticsSubjectsCurrent,
  listPoliticsChapterPathsCurrent,
  loadPoliticsChapterCurrent as loadPoliticsChapterScoped,
  politicsCurrentHealth as politicsScopedHealth,
  politicsRuntimeDiagnostics as politicsScopedDiagnostics
} from './politicsRuntimeScoped.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function firstReadyPath(sourcePath) {
  return String(sourcePath || '').replace(/\.json$/i, '.first-ready.json');
}

function readProjection(sourcePath) {
  const relativePath = firstReadyPath(sourcePath);
  if (!relativePath || !fs.existsSync(absolute(relativePath))) return { relativePath: '', projection: null };
  return { relativePath, projection: JSON.parse(fs.readFileSync(absolute(relativePath), 'utf8')) };
}

function asList(value) {
  return Array.isArray(value) ? value : (value == null ? [] : [value]);
}

function idsForUnit(unit) {
  return new Set([String(unit?.unitId || ''), ...asList(unit?.representedNaturalUnitIds).map(String)].filter(Boolean));
}

function unitMatches(unit, naturalUnitId) {
  return idsForUnit(unit).has(String(naturalUnitId || ''));
}

function questionIndex(chapter) {
  const index = new Map();
  for (const unit of chapter?.units || []) {
    for (const question of unit?.questions || []) {
      if (question?.id && !index.has(String(question.id))) index.set(String(question.id), question);
    }
  }
  return index;
}

function projectionPolicy(projection) {
  const checkpoints = asList(projection?.embedded_checkpoints);
  const reservedFirstReady = new Set();
  const deferredTargets = new Map();

  for (const checkpoint of checkpoints) {
    for (const questionId of asList(checkpoint?.first_ready_question_ids).map(String)) reservedFirstReady.add(questionId);
    for (const row of asList(checkpoint?.deferred_questions)) {
      const questionId = String(row?.question_id || '');
      const target = String(row?.first_ready_natural_unit_id || '');
      if (questionId && target) deferredTargets.set(questionId, target);
    }
  }

  return { checkpoints, reservedFirstReady, deferredTargets };
}

function filterRegularQuestions(unit, questions, policy, allQuestions) {
  const retained = (questions || []).filter((question) => {
    const id = String(question?.id || '');
    if (!id) return false;
    if (policy.reservedFirstReady.has(id)) return false;
    const deferredTarget = policy.deferredTargets.get(id);
    if (deferredTarget && !unitMatches(unit, deferredTarget)) return false;
    return true;
  });

  const seen = new Set(retained.map((question) => String(question.id)));
  for (const [questionId, target] of policy.deferredTargets.entries()) {
    if (!unitMatches(unit, target) || seen.has(questionId)) continue;
    const question = allQuestions.get(questionId);
    if (!question) continue;
    retained.push(question);
    seen.add(questionId);
  }
  return retained;
}

function selectBeats(beats, labels) {
  const wanted = new Set(asList(labels).map(String).filter(Boolean));
  if (!wanted.size) return [];
  return asList(beats).filter((beat) => wanted.has(String(beat?.label || beat?.title || '')));
}

function checkpointTeaching(hostTeaching, checkpoint) {
  return {
    bridge: String(checkpoint?.bridge || ''),
    question: String(checkpoint?.core_problem || ''),
    answer: '',
    relation: '',
    application: '',
    next: String(checkpoint?.after_checkpoint_bridge || ''),
    closure: String(checkpoint?.closure_cue || ''),
    boundaries: asList(checkpoint?.boundaries).map(String).filter(Boolean),
    beats: selectBeats(hostTeaching?.beats, checkpoint?.checkpoint_teaching_beat_labels),
    conditions: [],
    failureCauses: [],
    gains: [],
    process: [],
    turningPoint: '',
    program: '',
    hierarchy: null
  };
}

function continuationTeaching(hostTeaching, checkpoint) {
  return {
    ...(hostTeaching || {}),
    bridge: String(checkpoint?.after_checkpoint_bridge || hostTeaching?.bridge || ''),
    question: String(checkpoint?.continue_problem || hostTeaching?.question || ''),
    beats: selectBeats(hostTeaching?.beats, checkpoint?.continue_teaching_beat_labels)
  };
}

function splitHostAtCheckpoint(unit, checkpoint, allQuestions, policy) {
  const sourceNodes = asList(unit?.sourceNodes);
  const stopAt = String(checkpoint?.after_source_owner_id || '');
  const stopIndex = sourceNodes.findIndex((node) => String(node?.id || '') === stopAt);
  if (stopIndex < 0) {
    throw new Error(`POLITICS_FIRST_READY_SOURCE_BOUNDARY_MISSING:${unit?.unitId || 'unknown'}:${stopAt}`);
  }

  const ownerIds = new Set(asList(checkpoint?.owner_question_ids).map(String).filter(Boolean));
  const firstReadyIds = asList(checkpoint?.first_ready_question_ids).map(String).filter(Boolean);
  const deferredIds = asList(checkpoint?.deferred_questions).map((row) => String(row?.question_id || '')).filter(Boolean);
  const partition = new Set([...firstReadyIds, ...deferredIds]);
  if (ownerIds.size && (ownerIds.size !== partition.size || [...ownerIds].some((id) => !partition.has(id)))) {
    throw new Error(`POLITICS_FIRST_READY_OWNER_PARTITION_INVALID:${checkpoint?.embedded_natural_unit_id || stopAt}`);
  }

  const checkpointQuestions = firstReadyIds.map((questionId) => {
    const question = allQuestions.get(questionId);
    if (!question) throw new Error(`POLITICS_FIRST_READY_QUESTION_MISSING:${questionId}`);
    return question;
  });

  const leadSourceNodes = sourceNodes.slice(0, stopIndex + 1);
  const tailSourceNodes = sourceNodes.slice(stopIndex + 1);
  const checkpointUnit = {
    ...unit,
    unitId: String(checkpoint?.embedded_natural_unit_id || stopAt),
    representedNaturalUnitIds: [String(checkpoint?.embedded_natural_unit_id || stopAt)],
    regionId: String(checkpoint?.runtime_natural_unit_id || ''),
    regionIds: [String(checkpoint?.runtime_natural_unit_id || '')].filter(Boolean),
    title: String(checkpoint?.learner_title || checkpoint?.natural_unit_title || unit?.title || ''),
    teaching: checkpointTeaching(unit?.teaching, checkpoint),
    sourceNodes: leadSourceNodes,
    sourceRefCount: leadSourceNodes.length,
    sourceOwnerCount: leadSourceNodes.length,
    unresolvedSourceRefs: [],
    questions: checkpointQuestions,
    questionRefCount: checkpointQuestions.length,
    linkedQuestionRefCount: ownerIds.size || checkpointQuestions.length,
    unresolvedQuestionIds: [],
    projectionRole: 'EMBEDDED_NATURAL_UNIT_CHECKPOINT',
    checkpoint: {
      naturalUnitId: String(checkpoint?.embedded_natural_unit_id || stopAt),
      runtimeNaturalUnitId: String(checkpoint?.runtime_natural_unit_id || ''),
      afterSourceOwnerId: stopAt,
      firstReadyCount: checkpointQuestions.length,
      ownerQuestionCount: ownerIds.size,
      deferredQuestionCount: deferredIds.length
    }
  };

  const regularQuestions = filterRegularQuestions(unit, unit?.questions || [], policy, allQuestions);
  const continuationUnit = {
    ...unit,
    representedNaturalUnitIds: [String(unit?.unitId || '')].filter(Boolean),
    title: String(checkpoint?.continue_title || unit?.title || ''),
    teaching: continuationTeaching(unit?.teaching, checkpoint),
    sourceNodes: tailSourceNodes,
    sourceRefCount: tailSourceNodes.length,
    sourceOwnerCount: tailSourceNodes.length,
    questions: regularQuestions,
    questionRefCount: regularQuestions.length,
    unresolvedQuestionIds: [],
    projectionRole: 'HOST_CONTINUATION_AFTER_EMBEDDED_CHECKPOINT'
  };

  return tailSourceNodes.length || regularQuestions.length
    ? [checkpointUnit, continuationUnit]
    : [checkpointUnit];
}

function applyFirstReadyProjection(chapter, projection) {
  if (!projection) return chapter;
  if (projection?.status !== 'CURRENT_PILOT' && projection?.status !== 'CURRENT') {
    throw new Error(`POLITICS_FIRST_READY_PROJECTION_INVALID:${projection?.status || 'unknown'}`);
  }

  const policy = projectionPolicy(projection);
  const allQuestions = questionIndex(chapter);
  const checkpointsByHost = new Map();
  for (const checkpoint of policy.checkpoints) {
    const hostId = String(checkpoint?.host_natural_unit_id || '');
    if (!hostId) continue;
    if (!checkpointsByHost.has(hostId)) checkpointsByHost.set(hostId, []);
    checkpointsByHost.get(hostId).push(checkpoint);
  }

  const projectedUnits = [];
  for (const unit of chapter?.units || []) {
    const checkpoints = checkpointsByHost.get(String(unit?.unitId || '')) || [];
    if (checkpoints.length > 1) {
      throw new Error(`POLITICS_FIRST_READY_MULTIPLE_CHECKPOINTS_UNSUPPORTED:${unit?.unitId || 'unknown'}`);
    }
    if (checkpoints.length === 1) {
      projectedUnits.push(...splitHostAtCheckpoint(unit, checkpoints[0], allQuestions, policy));
      continue;
    }

    const questions = filterRegularQuestions(unit, unit?.questions || [], policy, allQuestions);
    projectedUnits.push({
      ...unit,
      questions,
      questionRefCount: questions.length,
      unresolvedQuestionIds: []
    });
  }

  return {
    ...chapter,
    units: projectedUnits,
    firstReadyProjection: projection,
    projectionMode: 'FORMAL_FIRST_READY_WITH_EMBEDDED_CHECKPOINTS'
  };
}

export { listPoliticsSubjectsCurrent, listPoliticsChapterPathsCurrent };

export function loadPoliticsChapterCurrent(subject, chapter) {
  const scoped = loadPoliticsChapterScoped(subject, chapter);
  const { relativePath, projection } = readProjection(scoped.sourcePath);
  const projected = applyFirstReadyProjection(scoped, projection);
  return {
    ...projected,
    firstReadyProjectionPath: relativePath
  };
}

export function politicsCurrentHealth() {
  return {
    ...politicsScopedHealth(),
    firstReadyProjectionMode: 'OPTIONAL_CHAPTER_SIDECAR'
  };
}

export function politicsRuntimeDiagnostics() {
  return {
    ...politicsScopedDiagnostics(),
    firstReadyProjectionMode: 'OPTIONAL_CHAPTER_SIDECAR'
  };
}
