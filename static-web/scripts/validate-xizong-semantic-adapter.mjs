import { loadXizongSemanticBlock, loadXizongSemanticSystem, XIZONG_SEMANTIC_ADAPTER_SCHEMA } from '../src/lib/xizongSemanticAdapter.mjs';

const fail = (message) => { throw new Error(`XIZONG_SEMANTIC_ADAPTER_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const systemIds = [
  'circulation',
  'respiratory',
  'urinary',
  'digestive-metabolic-endocrine-tumor',
  'hematology-immunity-infection'
];

const systems = new Map();
for (const systemId of systemIds) {
  const system = loadXizongSemanticSystem(systemId);
  systems.set(systemId, system);
  assert(system.schema === XIZONG_SEMANTIC_ADAPTER_SCHEMA, `${systemId}:schema`);
  assert(system.blocks.length === system.identity.blockCount, `${systemId}:block-count`);
  assert(system.blocks.reduce((sum, block) => sum + block.kpCount, 0) === system.identity.kpCount, `${systemId}:kp-count`);
  assert(system.blocks.reduce((sum, block) => sum + block.logicGroups.length, 0) === system.identity.logicGroupCount, `${systemId}:logic-group-count`);
  assert(system.ttsxPolicy.status === 'UNBOUND_FAIL_CLOSED', `${systemId}:ttsx-not-fail-closed`);
  assert(system.ttsxPolicy.questionIds.length === 0, `${systemId}:ttsx-guessed-question-ids`);

  for (const block of system.blocks) {
    const seen = new Set();
    for (const group of block.logicGroups) {
      assert(group.goal && group.closure, `${block.blockId}:${group.groupId}:goal-closure`);
      for (const ordinal of group.kpOrdinals) {
        assert(!seen.has(ordinal), `${block.blockId}:kp${ordinal}:duplicate-membership`);
        seen.add(ordinal);
      }
    }
    assert(seen.size === block.kpCount, `${block.blockId}:coverage-count:${seen.size}/${block.kpCount}`);
    for (let ordinal = 1; ordinal <= block.kpCount; ordinal += 1) {
      assert(seen.has(ordinal), `${block.blockId}:kp${ordinal}:missing-membership`);
    }
    assert(block.ttsx.questionIds.length === 0, `${block.blockId}:ttsx-guessed-question-ids`);
  }
}

// A1: sparse reviewed Visual Gates remain support inside the learning path.
const { block: a1b1 } = loadXizongSemanticBlock('circulation', 'circulation-b01');
const a1b1Visuals = new Set(a1b1.visualGates.map((row) => row.cueId));
for (const cueId of ['a1-b01-lg01-visual', 'a1-b01-lg04-visual', 'a1-b01-lg06-visual']) {
  assert(a1b1Visuals.has(cueId), `a1-b01:visual-missing:${cueId}`);
}
assert(a1b1.visualGates.some((row) => row.sourceAssets.length > 0), 'a1-b01:source-visual-assets-not-attached');

// B: accepted whole-LG Source contact is preserved as an execution segment,
// without changing Logic-Group identity or medical Core.
const b = systems.get('digestive-metabolic-endocrine-tumor');
assert(b.identity.blockCount === 38, `b:block-count:${b.identity.blockCount}`);
assert(b.identity.kpCount === 600, `b:kp-count:${b.identity.kpCount}`);
assert(b.identity.logicGroupCount === 170, `b:logic-group-count:${b.identity.logicGroupCount}`);
const { block: bd1 } = loadXizongSemanticBlock('digestive-metabolic-endocrine-tumor', 'D1');
assert(bd1.sourceContact.mode === 'WHOLE_LOGIC_GROUP', `b-d1:source-contact:${bd1.sourceContact.mode}`);
assert(bd1.sourceContact.logicGroupIsAutomaticSourceChunk === true, 'b-d1:whole-lg-not-source-chunk');
assert(bd1.sourceContact.segments.length === bd1.logicGroups.length, `b-d1:segments:${bd1.sourceContact.segments.length}/${bd1.logicGroups.length}`);
assert(bd1.logicGroups[0].membershipMode === 'LEARNING_RANGE', `b-d1:membership-mode:${bd1.logicGroups[0].membershipMode}`);
assert(JSON.stringify(bd1.logicGroups[0].kpOrdinals) === JSON.stringify([1, 2, 3]), `b-d1:first-membership:${bd1.logicGroups[0].kpOrdinals.join(',')}`);

// C: explicit and intentionally non-contiguous memberships are accepted as-is.
// Logic Groups remain retrieval/closure units, not mandatory Source-contact chunks.
const c = systems.get('hematology-immunity-infection');
assert(c.identity.blockCount === 27, `c:block-count:${c.identity.blockCount}`);
assert(c.identity.kpCount === 423, `c:kp-count:${c.identity.kpCount}`);
assert(c.identity.logicGroupCount === 133, `c:logic-group-count:${c.identity.logicGroupCount}`);
assert(c.ownerPaths.learningShards.length === 5, `c:learning-shards:${c.ownerPaths.learningShards.length}`);
const { block: ch1 } = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01');
const ch1Last = ch1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(ch1Last, 'c-h01:lg06-missing');
assert(ch1Last.membershipMode === 'EXPLICIT_ORDINAL_LIST', `c-h01:membership-mode:${ch1Last.membershipMode}`);
assert(JSON.stringify(ch1Last.kpOrdinals) === JSON.stringify([1, 12, 13]), `c-h01:noncontiguous-membership:${ch1Last.kpOrdinals.join(',')}`);
assert(ch1.sourceContact.mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT', `c-h01:source-contact:${ch1.sourceContact.mode}`);
assert(ch1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'c-h01:lg-promoted-to-source-chunk');
assert(ch1.sourceContact.logicGroupSourceReentryDefault === false, 'c-h01:source-reentry-default-not-false');
assert(ch1.sourceContact.segments.length === 0, `c-h01:invented-source-segments:${ch1.sourceContact.segments.length}`);
assert(ch1.retrievalPoints.slice(1).every((row) => row.sourceContactBefore === null && row.reopenSourceByDefault === false), 'c-h01:lg-retrieval-reopens-source');

// The adapter must not manufacture learner progress, official-question mapping,
// or a duplicate question-taking surface.
for (const system of systems.values()) {
  for (const block of system.blocks) {
    const serialized = JSON.stringify(block);
    assert(!serialized.includes('questionResults'), `${block.blockId}:learner-question-state-leak`);
    assert(!serialized.includes('completedAt'), `${block.blockId}:learner-completion-state-leak`);
    assert(!serialized.includes('mastered'), `${block.blockId}:learner-mastery-state-leak`);
  }
}

console.log(`Xizong semantic adapter PASS: ${[...systems.values()].reduce((sum, system) => sum + system.blocks.length, 0)} blocks across A1/A2/A3/B/C`);
