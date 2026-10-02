import assert from 'node:assert/strict';
import * as memoryOwner from '../../src/lib/xizongMemoryModel.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject } from '../../src/lib/xizongMemoryRelease.mjs';

// Assertions call the real owner; no test-side rating, queue or repair algorithm.
// An optional owner enables narrowly scoped fault-injection of this oracle.
export function verifyNativeMemoryEvidence(learner, owner = memoryOwner) {
  const [weakKp, stableKp] = learner.kps.slice(0, 2).map(kp => kp.identity.kpId);
  const ratings = { [weakKp]: 'unknown', [stableKp]: 'mastered' };
  const beforeRatings = structuredClone(ratings);
  const release = buildXizongMemoryReleaseDescriptorFromLearnerObject(learner, { recallRatings: ratings });
  const now = Date.parse('2030-01-01T00:00:00Z');
  let state = owner.releaseBlockMemory(owner.createXizongMemoryState(), release, now);
  const card = release.coreCards.find(row => row.kpId === weakKp);
  assert.deepEqual(owner.todayMemoryQueue(state, { now }).map(row => row.id), [card.id], 'MEMORY_SELECTIVE_ADMISSION');
  state = owner.appendMemoryEvidence(state, { cardId: card.id, rating: 'unknown' }, now + 1000);
  state = owner.appendMemoryEvidence(state, { cardId: card.id, rating: 'unknown' }, now + 1000);
  assert.equal(state.evidence.length, 2, 'MEMORY_REPEATED_EVIDENCE');
  assert.notEqual(state.evidence[0].id, state.evidence[1].id, 'MEMORY_DISTINCT_ATTEMPT_IDS');
  const observations = structuredClone(state.evidence);
  state = owner.appendMemoryEvidence(state, { cardId: card.id, rating: 'mastered' }, now + 2000);
  assert.deepEqual(state.evidence.slice(0, 2), observations, 'MEMORY_HISTORY_PRESERVED');
  assert.deepEqual(owner.todayMemoryQueue(state, { now: now + 3000 }), [], 'MEMORY_STABLE_EXIT');
  assert.deepEqual(ratings, beforeRatings, 'SOURCE_RECALL_UNCHANGED');
  state = owner.setRepairTasks(state, [{ id: 'synthetic-repair', cardId: card.id, reason: 'synthetic mechanism gap', action: 'repair exact owner', origin: 'SYSTEM_WU_CHAT_RETURN' }]);
  assert.equal(owner.activeRepairTasks(state).length, 1, 'REPAIR_VISIBLE');
  const beforeRepair = structuredClone(state);
  state = owner.completeRepairTask(state, 'synthetic-repair', now + 4000);
  assert.equal(owner.activeRepairTasks(state).length, 0, 'REPAIR_CLOSED');
  assert.equal(state.repairTasks[0].status, 'DONE', 'REPAIR_HISTORY_PRESERVED');
  assert.deepEqual(state.evidence, beforeRepair.evidence, 'REPAIR_MUST_NOT_CREATE_MASTERY');
  assert.deepEqual(state.cards, beforeRepair.cards, 'REPAIR_MUST_NOT_REWRITE_CARDS');
  assert.deepEqual(ratings, beforeRatings, 'REPAIR_MUST_NOT_REWRITE_SOURCE_RECALL');
  return { weakKp, repeatedEvidence: 2, repairStatus: state.repairTasks[0].status };
}
