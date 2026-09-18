import assert from 'node:assert/strict';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';

const K03 = 'POL27-CF-MARX-C02-K03';
const S01 = 'POL27-CF-MARX-C02-S01';
const S02 = 'POL27-CF-MARX-C02-S02';

// Independently reviewed against Current Source, including decisive distractors.
const FIRST_READY = ['X1000-MARX-S-028','X1000-MARX-S-039','X1000-MARX-M-027','X1000-MARX-M-028','X1000-MARX-M-030'].sort();
const DEFER_TO_S01 = ['X1000-MARX-S-029','X1000-MARX-M-048'].sort();
const DEFER_TO_S02 = ['X1000-MARX-M-035','X1000-MARX-M-046','X1000-MARX-M-047','X1000-MARX-M-049'].sort();
const DEFER_TO_C03 = ['X1000-MARX-M-029','X1000-MARX-M-074','X1000-MARX-M-026','X1000-MARX-M-045'].sort();
const OWNER_15 = [...FIRST_READY, ...DEFER_TO_S01, ...DEFER_TO_S02, ...DEFER_TO_C03].sort();

function questionIds(unit) {
  return (unit?.questions || []).map((question) => String(question.id)).sort();
}

const chapter = loadPoliticsChapterCurrent('marxism', 'ch02');
assert.equal(chapter.projectionMode, 'FORMAL_FIRST_READY_WITH_EMBEDDED_CHECKPOINTS');
assert.match(chapter.firstReadyProjection.current_readiness_rule, /whole-item readiness/);

const checkpointIndex = chapter.units.findIndex((unit) => unit.unitId === K03 && unit.projectionRole === 'EMBEDDED_NATURAL_UNIT_CHECKPOINT');
assert.ok(checkpointIndex >= 0, 'K03 must be a learner-facing embedded checkpoint');
const checkpoint = chapter.units[checkpointIndex];

assert.equal(checkpoint.sourceNodes.at(-1)?.id, K03, 'K03 checkpoint must stop exactly after the K03 Chengfeng source owner');
assert.ok(checkpoint.sourceNodes.some((node) => node.id === 'POL27-CF-MARX-C02-K01'), 'K01 prerequisite source must remain continuous before K03');
assert.ok(checkpoint.sourceNodes.some((node) => node.id === 'POL27-CF-MARX-C02-K02'), 'K02 prerequisite source must remain continuous before K03');
assert.ok(String(checkpoint.teaching?.closure || '').trim().length > 0, 'K03 must have an optional short closure cue');
assert.deepEqual(questionIds(checkpoint), FIRST_READY, 'K03 must expose exactly the formal 5 first-ready questions');
assert.equal(checkpoint.checkpoint?.ownerQuestionCount, 15);
assert.equal(checkpoint.checkpoint?.firstReadyCount, 5);
assert.equal(checkpoint.checkpoint?.deferredQuestionCount, 10);

const projectionCheckpoint = chapter.firstReadyProjection.embedded_checkpoints[0];
const projectedOwnerIds = [
  ...(projectionCheckpoint.first_ready_question_ids || []),
  ...(projectionCheckpoint.deferred_questions || []).map((row) => row.question_id)
].sort();
assert.deepEqual(projectedOwnerIds, OWNER_15, 'the 15-question owner must partition losslessly into 5 first-ready + 10 deferred');

const hostContinuation = chapter.units.find((unit) => unit.unitId === S01 && unit.projectionRole === 'HOST_CONTINUATION_AFTER_EMBEDDED_CHECKPOINT');
assert.ok(hostContinuation, 'S01 must continue after the K03 checkpoint rather than ending at K03');
assert.ok(hostContinuation.sourceNodes.length > 0, 'later Chengfeng content must remain available after K03');
assert.ok(!hostContinuation.sourceNodes.some((node) => node.id === K03), 'K03 source must not be repeated after its checkpoint');

const nonCheckpointQuestionIds = chapter.units
  .filter((unit) => unit !== checkpoint)
  .flatMap((unit) => questionIds(unit));
for (const questionId of FIRST_READY) {
  assert.ok(!nonCheckpointQuestionIds.includes(questionId), `first-ready question duplicated after K03: ${questionId}`);
}
for (const questionId of DEFER_TO_C03) {
  assert.ok(!nonCheckpointQuestionIds.includes(questionId), `later-chapter question leaked into C02: ${questionId}`);
}

for (const id of DEFER_TO_S01) assert.ok(questionIds(hostContinuation).includes(id));
const later = loadPoliticsChapterCurrent('marxism', 'ch03').units.find(u => u.unitId === 'POL27-CF-MARX-C03-S02');
for (const id of DEFER_TO_C03) assert.ok(questionIds(later).includes(id), `explicit later target missing ${id}`);

const s02 = chapter.units.find((unit) => unit.unitId === S02);
assert.ok(s02, 'C02 S02 must remain after the embedded K03 checkpoint');
for (const questionId of DEFER_TO_S02) {
  assert.ok(questionIds(s02).includes(questionId), `S02-deferred question missing at its first-ready unit: ${questionId}`);
}

assert.ok(checkpointIndex < chapter.units.indexOf(hostContinuation), 'learner order must be K03 checkpoint then S01 continuation');
assert.ok(chapter.units.indexOf(hostContinuation) < chapter.units.indexOf(s02), 'S01 continuation must finish before S02');

console.log(JSON.stringify({
  status: 'PASS',
  gate: 'K03_LEARNING_PROJECTION',
  source_stop: checkpoint.sourceNodes.at(-1)?.id,
  first_ready_count: questionIds(checkpoint).length,
  deferred_to_s02: DEFER_TO_S02,
  deferred_to_later_chapter: DEFER_TO_C03,
  learner_order: chapter.units.map((unit) => ({ unit_id: unit.unitId, role: unit.projectionRole || 'NORMAL' }))
}, null, 2));
