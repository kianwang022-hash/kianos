import assert from 'node:assert/strict';
import * as native from '../src/lib/xizongMemoryModel.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { verifyNativeMemoryEvidence } from './test-support/native-memory-evidence.mjs';

const learner = resolveXizongLearnerProjection(loadXizongBlock('respiratory', 'r01')).learnerObject;
verifyNativeMemoryEvidence(learner);
for (const [name, owner, expected] of [
  ['duplicate-collapse', { ...native, appendMemoryEvidence(state, event, at) {
    if (state.evidence.at(-1)?.rating === event.rating) return state;
    return native.appendMemoryEvidence(state, event, at);
  } }, 'MEMORY_REPEATED_EVIDENCE'],
  ['no-repair-closure', { ...native, completeRepairTask: state => state }, 'REPAIR_CLOSED'],
  ['repair-creates-mastery', { ...native, completeRepairTask(state, id, at) {
    const next = native.completeRepairTask(state, id, at);
    return native.appendMemoryEvidence(next, { cardId: next.repairTasks[0].cardId, rating: 'mastered' }, at);
  } }, 'REPAIR_MUST_NOT_CREATE_MASTERY']
]) {
  assert.throws(() => verifyNativeMemoryEvidence(learner, owner), error => error.message.includes(expected), name);
  console.log('DETECTED native-owner fault: ' + name + ' -> ' + expected);
}
console.log('NATIVE_MEMORY_EVIDENCE PASS: real owner healthy; three injected defects caught by the same oracle');
