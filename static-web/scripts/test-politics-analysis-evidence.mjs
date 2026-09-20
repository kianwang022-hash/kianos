import assert from 'node:assert/strict';

import {
  POLITICS_ANALYSIS_EVIDENCE_KEY,
  POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
  applyPoliticsAnalysisEvidence,
  emptyPoliticsAnalysisEvidenceStore,
  politicsAnalysisEvidenceSummary,
  readPoliticsAnalysisEvidenceStore,
  validatePoliticsAnalysisEvidence
} from '../src/lib/politicsAnalysisEvidence.mjs';
import {
  exportPoliticsCheckpoint,
  validatePoliticsPrivatePayload
} from '../src/lib/politicsChatReturn.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
}

const day = '2026-09-21';
const now = Date.parse('2026-09-21T03:00:00.000Z');

const legacyBind = {
  schema: POLITICS_ANALYSIS_EVIDENCE_SCHEMA,
  direction: 'CHAT_TO_LEARNER',
  evidence_id: 'analysis-legacy-bind-001',
  task_id: 'LEG26-X8-S01-Q34-2-B',
  task_revision: 'legacy26-x8-s01-q34-2-bind-v1',
  rubric_version: 'politics-analysis-rubric-v1',
  subject: 'marxism',
  subquestion_id: '34-2',
  task_mode: 'BIND',
  attempt_role: 'FIRST',
  fresh_material: false,
  freshness_class: 'LEGACY_GEOMETRY_ONLY',
  formulation_requirement: 'NONE',
  source_basis: {
    family: 'LEG26_XIAO8',
    identity: '2026 Xiao8 set1 Q34(2)',
    revision: null,
    authority_status: 'LEGACY_GEOMETRY'
  },
  study_day: day,
  observed_at: '2026-09-21T01:00:00.000Z',
  rubric: { I: 2, S: 1, B: 1, F: 'NA', D: 'NA' },
  critical_flags: ['MATERIAL_UNBOUND'],
  assessment_confidence: 'MEDIUM',
  delivery_timing: 'NA',
  elapsed_seconds: null,
  diagnosis_summary: '原理识别正确，但第二个答题动作与材料绑定不够。',
  repair_instruction: '只重做第二个 move 的材料绑定。'
};

const normalizedLegacy = validatePoliticsAnalysisEvidence(legacyBind, { now });
assert.equal(normalizedLegacy.task_mode, 'BIND');
assert.equal(normalizedLegacy.rubric.F, 'NA');
const acceptedLegacyTasks = [{
  task_id: legacyBind.task_id,
  task_revision: legacyBind.task_revision,
  subject: legacyBind.subject,
  subquestion_id: legacyBind.subquestion_id,
  task_mode: legacyBind.task_mode,
  rubric_version: legacyBind.rubric_version,
  freshness_class: legacyBind.freshness_class,
  formulation_requirement: legacyBind.formulation_requirement,
  source_basis: legacyBind.source_basis
}];


assert.throws(() => validatePoliticsAnalysisEvidence({
  ...legacyBind,
  evidence_id: 'bad-legacy-formulation',
  task_mode: 'FORMULATION',
  formulation_requirement: 'STABLE_SOURCE',
  rubric: { I: 2, S: 2, B: 2, F: 2, D: 'NA' }
}, { now }), /POLITICS_ANALYSIS_LEGACY_EXACT_FORMULATION_FORBIDDEN/);

assert.throws(() => applyPoliticsAnalysisEvidence(new MemoryStorage(), {
  ...legacyBind,
  evidence_id: 'analysis-unregistered-legacy',
  task_id: 'LEG26-X8-S99-Q99-1-I',
  task_revision: 'invented-v1'
}, { now, acceptedLegacyTasks }), /POLITICS_ANALYSIS_LEGACY_TASK_NOT_REGISTERED/);

assert.throws(() => validatePoliticsAnalysisEvidence({
  ...legacyBind,
  evidence_id: 'bad-unrequired-dim',
  rubric: { I: 2, S: 1, B: 1, F: 1, D: 'NA' }
}, { now }), /POLITICS_ANALYSIS_UNTESTED_RUBRIC_MUST_BE_NA:F/);

assert.throws(() => validatePoliticsAnalysisEvidence({
  ...legacyBind,
  evidence_id: 'bad-transfer',
  attempt_role: 'TRANSFER',
  fresh_material: false
}, { now }), /POLITICS_ANALYSIS_TRANSFER_REQUIRES_FRESH_MATERIAL/);

const currentYear = {
  ...legacyBind,
  evidence_id: 'analysis-2027-current-001',
  task_id: 'POL27-X8-SYNTHETIC-001',
  task_revision: 'pol27-x8-synthetic-001-formulation-v1',
  source_basis: {
    family: 'xiao8',
    identity: 'future/xiao8/rev1/question34',
    revision: 'xiao8-rev1',
    authority_status: 'BOUND'
  },
  task_mode: 'FORMULATION',
  attempt_role: 'TRANSFER',
  fresh_material: true,
  transfer_of: {
    task_id: legacyBind.task_id,
    task_revision: legacyBind.task_revision
  },
  freshness_class: 'CURRENT_YEAR_EXACT_REQUIRED',
  formulation_requirement: 'CURRENT_YEAR_EXACT',
  rubric: { I: 2, S: 2, B: 2, F: 2, D: 'NA' },
  critical_flags: []
};

const storage = new MemoryStorage();
const first = applyPoliticsAnalysisEvidence(storage, legacyBind, { now, acceptedLegacyTasks });
assert.equal(first.status, 'applied');
assert.equal(readPoliticsAnalysisEvidenceStore(storage).records.length, 1);

const replay = applyPoliticsAnalysisEvidence(storage, legacyBind, { now: now + 1000, acceptedLegacyTasks });
assert.equal(replay.status, 'idempotent');
assert.equal(readPoliticsAnalysisEvidenceStore(storage).records.length, 1);

assert.throws(() => applyPoliticsAnalysisEvidence(storage, {
  ...legacyBind,
  diagnosis_summary: '冲突版本'
}, { now: now + 2000, acceptedLegacyTasks }), /POLITICS_ANALYSIS_EVIDENCE_ID_CONFLICT/);

assert.throws(() => applyPoliticsAnalysisEvidence(storage, {
  ...legacyBind,
  evidence_id: 'analysis-legacy-bind-002'
}, { now: now + 3000, acceptedLegacyTasks }), /POLITICS_ANALYSIS_FIRST_ALREADY_RECORDED/);

assert.throws(() => applyPoliticsAnalysisEvidence(storage, currentYear, { now }), /POLITICS_ANALYSIS_CURRENT_YEAR_SOURCE_NOT_CURRENT_BOUND/);

const repairWithoutFirstStorage = new MemoryStorage();
assert.throws(() => applyPoliticsAnalysisEvidence(repairWithoutFirstStorage, {
  ...legacyBind,
  evidence_id: 'analysis-repair-without-first',
  attempt_role: 'REPAIR'
}, { now, acceptedLegacyTasks }), /POLITICS_ANALYSIS_REPAIR_WITHOUT_FIRST/);

const missingTransferBasisStorage = new MemoryStorage();
assert.throws(() => applyPoliticsAnalysisEvidence(missingTransferBasisStorage, currentYear, {
  now,
  boundCurrentYearSources: [{
    family: 'xiao8',
    revision: 'xiao8-rev1',
    current_year_authority: true
  }]
}), /POLITICS_ANALYSIS_TRANSFER_BASIS_NOT_OBSERVED/);

const currentYearStorage = new MemoryStorage();
applyPoliticsAnalysisEvidence(currentYearStorage, legacyBind, { now, acceptedLegacyTasks });
const admittedCurrentYear = applyPoliticsAnalysisEvidence(currentYearStorage, currentYear, {
  now,
  boundCurrentYearSources: [{
    family: 'xiao8',
    revision: 'xiao8-rev1',
    current_year_authority: true
  }]
});
assert.equal(admittedCurrentYear.status, 'applied');
assert.equal(admittedCurrentYear.value.freshness_class, 'CURRENT_YEAR_EXACT_REQUIRED');
assert.deepEqual(admittedCurrentYear.value.transfer_of, {
  task_id: legacyBind.task_id,
  task_revision: legacyBind.task_revision
});

const checkpoint = exportPoliticsCheckpoint(storage);
assert.equal(checkpoint.schema, 'kianos.politics.private-payload.v1');
assert.ok(checkpoint.entries[POLITICS_ANALYSIS_EVIDENCE_KEY]);
assert.ok(validatePoliticsPrivatePayload(checkpoint).some(([key]) => key === POLITICS_ANALYSIS_EVIDENCE_KEY));

const summary = politicsAnalysisEvidenceSummary(readPoliticsAnalysisEvidenceStore(storage), { day });
assert.equal(summary.schema, 'kianos.politics.analysis-summary.v1');
assert.equal(summary.total_records, 1);
assert.equal(summary.today_by_mode.BIND, 1);
assert.equal(summary.recent_records[0].task_id, legacyBind.task_id);
assert.equal(summary.recent_records[0].transfer_of, null);
assert.match(summary.evidence_boundary, /no aggregate mastery score/i);

const emptySummary = politicsAnalysisEvidenceSummary(emptyPoliticsAnalysisEvidenceStore(), { day });
assert.equal(emptySummary.total_records, 0);

const minimalCatalog = {
  schema: 'kianos.politics.practice_catalog.v1',
  revision: 'analysis-only-daily-packet-test',
  questions: [],
  units: [],
  chapters: [],
  subjects: []
};
const daily = buildHomeDailyLearningPacket({
  storage,
  day,
  now,
  plan: null,
  politicsCatalog: minimalCatalog,
  politicsMemoryCatalog: null,
  base: '/'
});
assert.equal(daily.coverage.politics, 'attached');
assert.equal(daily.packet.subjects.politics.evidence.analysis.total_records, 1);
assert.equal(daily.packet.subjects.politics.evidence.analysis.recent_records[0].task_id, legacyBind.task_id);
assert.ok(daily.warnings.some(item => item.startsWith('politics-memory:')) || daily.warnings.length === 0);

console.log('PASS politics analysis evidence: legacy geometry safe, current-year exact gated, replay/conflict safe, checkpoint durable, Daily Packet visible.');
