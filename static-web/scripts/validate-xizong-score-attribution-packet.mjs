import assert from 'node:assert/strict';
import { buildXizongStudyPacketFromStorage } from '../src/lib/xizongStudyPacket.mjs';

class MemoryStorage {
  constructor(entries = {}) {
    this.map = new Map(Object.entries(entries).map(([key, value]) => [key, String(value)]));
  }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const reviewedKp = {
  review_status: 'REVIEWED',
  source_system_id: 'circulation',
  system_id: 'circulation',
  block_id: 'circulation-b01',
  target_status: 'RESOLVED_KP',
  logic_group_id: 'circulation-b01-lg01',
  primary_canonical_kp_id: 'A1-B01-KP01',
  primary_runtime_kp_id: 'circulation-b01-kp01',
  supporting_canonical_kp_ids: ['A1-B01-KP02'],
  supporting_runtime_kp_ids: ['circulation-b01-kp02']
};

const reviewedBlock = {
  review_status: 'REVIEWED',
  source_system_id: 'circulation',
  system_id: 'circulation',
  block_id: 'circulation-b02',
  target_status: 'BLOCK_ONLY',
  logic_group_id: '',
  primary_canonical_kp_id: '',
  primary_runtime_kp_id: '',
  supporting_canonical_kp_ids: [],
  supporting_runtime_kp_ids: []
};

const storage = new MemoryStorage({
  'kianos:xizong:system-question-sweep:circulation:v1': JSON.stringify({
    attemptHistory: [
      {
        type: 'QUESTION_ATTEMPT',
        attempt_id: 'a1',
        attempt_index: 1,
        question_id: 'xizong-official-2025-n005',
        question_source: 'OFFICIAL_EXAM',
        question_semantic_revision: 'fixture-v1',
        scoring_role: 'OFFICIAL_EVIDENCE',
        status: 'wrong',
        points_possible: 1.5,
        reviewed_relation: reviewedKp,
        year: 2025,
        number: 5,
        study_phase: 'FIRST_PASS',
        context: 'SYSTEM_SWEEP',
        result_visibility: 'immediate',
        submitted_at: '2026-09-20T01:00:00.000Z'
      },
      {
        type: 'QUESTION_ATTEMPT',
        attempt_id: 'a2',
        attempt_index: 2,
        question_id: 'xizong-official-2025-n005',
        question_source: 'OFFICIAL_EXAM',
        question_semantic_revision: 'fixture-v1',
        scoring_role: 'OFFICIAL_EVIDENCE',
        status: 'stable',
        points_possible: 1.5,
        reviewed_relation: reviewedKp,
        year: 2025,
        number: 5,
        study_phase: 'SECOND_PASS',
        context: 'TARGETED_PRACTICE',
        result_visibility: 'immediate',
        submitted_at: '2026-09-20T02:00:00.000Z'
      },
      {
        type: 'QUESTION_ATTEMPT',
        attempt_id: 'b1',
        attempt_index: 1,
        question_id: 'xizong-official-2025-n041',
        question_source: 'OFFICIAL_EXAM',
        question_semantic_revision: 'fixture-v1',
        scoring_role: 'OFFICIAL_EVIDENCE',
        status: 'wrong',
        points_possible: 2,
        reviewed_relation: reviewedKp,
        year: 2025,
        number: 41,
        study_phase: 'FIRST_PASS',
        context: 'SYSTEM_SWEEP',
        result_visibility: 'immediate',
        submitted_at: '2026-09-20T01:10:00.000Z'
      },
      {
        type: 'QUESTION_ATTEMPT',
        attempt_id: 'c1',
        attempt_index: 1,
        question_id: 'xizong-official-2025-n050',
        question_source: 'OFFICIAL_EXAM',
        question_semantic_revision: 'fixture-v1',
        scoring_role: 'OFFICIAL_EVIDENCE',
        status: 'uncertain',
        points_possible: 2,
        reviewed_relation: reviewedBlock,
        year: 2025,
        number: 50,
        study_phase: 'FIRST_PASS',
        context: 'SYSTEM_SWEEP',
        result_visibility: 'immediate',
        submitted_at: '2026-09-20T01:20:00.000Z'
      }
    ]
  }),
  'kianos:xizong:chat-set-question-sweep:chat-set-probe:v1': JSON.stringify({
    attemptHistory: [{
      type: 'QUESTION_ATTEMPT',
      attempt_id: 'ai1',
      attempt_index: 1,
      question_id: 'xizong-ai-probe:circulation-b01-kp01-001',
      question_source: 'AI_TRANSFER_PROBE',
      scoring_role: 'TRANSFER_ONLY',
      probe_kind: 'CONDITION_CHANGE',
      target_kp_ids: ['circulation-b01-kp01'],
      canonical_source_hash: 'owner-hash',
      status: 'wrong',
      study_phase: 'SECOND_PASS',
      context: 'TARGETED_PRACTICE',
      result_visibility: 'immediate',
      submitted_at: '2026-09-20T02:10:00.000Z'
    }]
  }),
  'kianos:xizong:paper-question-sweep:paper-unsealed:v1': JSON.stringify({
    attemptHistory: [{
      type: 'QUESTION_ATTEMPT',
      attempt_id: 'hidden1',
      attempt_index: 1,
      question_id: 'xizong-official-2024-n010',
      question_source: 'OFFICIAL_EXAM',
      question_semantic_revision: 'fixture-v1',
      scoring_role: 'OFFICIAL_EVIDENCE',
      status: 'wrong',
      points_possible: 1.5,
      reviewed_relation: reviewedKp,
      year: 2024,
      number: 10,
      study_phase: 'LATE_REVIEW',
      context: 'PAPER',
      result_visibility: 'hidden',
      submitted_at: '2026-09-20T02:20:00.000Z'
    }]
  }),
  'kianos:xizong:paper-question-sweep:paper-sealed:v1': JSON.stringify({
    paperSeal: { sealedAt: '2026-09-20T03:00:00.000Z' },
    attemptHistory: [{
      type: 'QUESTION_ATTEMPT',
      attempt_id: 'hidden2',
      attempt_index: 1,
      question_id: 'xizong-official-2024-n011',
      question_source: 'OFFICIAL_EXAM',
      question_semantic_revision: 'fixture-v1',
      scoring_role: 'OFFICIAL_EVIDENCE',
      status: 'wrong',
      points_possible: 1.5,
      reviewed_relation: null,
      year: 2024,
      number: 11,
      study_phase: 'LATE_REVIEW',
      context: 'PAPER',
      result_visibility: 'hidden',
      submitted_at: '2026-09-20T03:00:00.000Z'
    }]
  })
});

const studyState = {
  stage: 'kp_recall',
  groupIndex: 0,
  kpIndex: 0,
  sourceContactEvidence: [],
  sourceContactDone: true,
  learned: { 'circulation-b01-kp01': true },
  ratings: { 'circulation-b01-kp01': 'known' },
  ttsxEvidence: {},
  ttsxAnnotations: {},
  pendingTtsx: null,
  blockRecallDone: false,
  completed: false
};

const packet = buildXizongStudyPacketFromStorage({
  storage,
  questionSemanticRevisions:Object.fromEntries(['2025-n005','2025-n041','2025-n050','2024-n010','2024-n011'].map(id=>['xizong-official-'+id,'fixture-v1'])),
  packetMeta: {
    objectId: 'xizong:circulation-b01',
    systemId: 'circulation',
    canonicalId: 'A1',
    blockId: 'circulation-b01',
    blockLabel: 'B01',
    blockTitle: '正常机械循环',
    sourcePath: 'fixture',
    sourceHash: 'owner-hash',
    sourceContactMode: 'WHOLE_BLOCK',
    sourcePerGroup: false,
    reserveItems: []
  },
  kpRows: [{
    kpId: 'circulation-b01-kp01',
    displayId: 'KP01',
    title: '循环主链',
    groupId: 'circulation-b01-lg01',
    groupLabel: '主链',
    sourceLocator: 'P1',
    prompt: '循环主链'
  }],
  studyState,
  currentStage: 'kp_recall',
  currentIndex: 0,
  now: Date.parse('2026-09-20T04:00:00.000Z')
});

assert.equal(packet.schema, 'kianos.xizong.study_packet.v3');
const score = packet.practice.score_attribution;
assert.equal(score.schema, 'kianos.xizong.score-attribution.v1');
assert.equal(score.totals.official_question_identities, 4, 'hidden-unsealed or AI leaked into official identity count');
assert.equal(score.totals.stable_points, 1.5, 'latest reused stable official evidence missing');
assert.equal(score.totals.wrong_points, 3.5, 'wrong point total');
assert.equal(score.totals.uncertain_points, 2, 'uncertain point total');
assert.equal(score.totals.unmapped_points, 1.5, 'sealed unmapped paper evidence must remain explicit');
assert.equal(score.totals.reuse_wrong_points, 0, 'old wrong superseded by stable reuse must not remain current wrong');
assert.equal(score.top_targets.length, 2, 'only reviewed KP/Block targets belong in bounded target list');
assert.equal(score.top_targets.some((row) => row.owner_kind === 'UNKNOWN'), false, 'unknown mapping leaked into actionable targets');

const kp = score.top_targets.find((row) => row.owner_id === 'circulation-b01-kp01');
assert.ok(kp, 'KP target missing');
assert.equal(kp.wrong_points, 2, 'KP wrong points');
assert.equal(kp.stable_points, 1.5, 'KP stable points');
assert.deepEqual(kp.question_ids.sort(), ['xizong-official-2025-n005','xizong-official-2025-n041'].sort());

const block = score.top_targets.find((row) => row.owner_id === 'circulation-b02');
assert.ok(block, 'Block target missing');
assert.equal(block.uncertain_points, 2, 'Block uncertain points');

assert.equal(Object.prototype.hasOwnProperty.call(score, 'rows'), false, 'packet copied full attribution rows');
assert.ok(score.top_targets.length <= 12, 'packet top-target cap');
assert.ok(score.top_targets.every((row) => row.question_ids.length <= 5), 'packet question-id cap');
assert.equal(packet.practice.ai_transfer_probes.length, 1, 'AI transfer evidence should still return separately');
assert.equal(packet.practice.ai_transfer_probes[0].scoring_role, 'TRANSFER_ONLY');
assert.ok(packet.evidence_semantics.score_attribution.includes('observed evidence'), 'score evidence semantics missing');
assert.ok(packet.request_to_chat.some((row) => row.includes('不得把它解释成某个 KP 固定值多少分')), 'chat prediction boundary missing');

console.log(JSON.stringify({
  ok: true,
  schema: 'xizong-score-attribution-packet.v1',
  totals: score.totals,
  top_targets: score.top_targets,
  hidden_unsealed_excluded: true,
  ai_probe_separate: true,
  unmapped_fail_closed: true,
  bounded_packet: true
}, null, 2));
console.log('PASS Xizong score-attribution packet: bounded official evidence summary, no hidden/AI leakage, no invented KP value');
