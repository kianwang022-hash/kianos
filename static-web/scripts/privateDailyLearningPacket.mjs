import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';
import { validatePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';
import { restoreSharedControlCheckpoint } from '../src/lib/sharedControlCheckpoint.mjs';
import { restorePrivateSubjectCheckpoints, subjectCheckpointEntries, sameCheckpointRaw } from '../src/lib/privateSubjectCheckpoints.mjs';
import { buildHomeDailyLearningPacket } from '../src/lib/dailyLearningPacketRuntime.mjs';
import { buildExamStudyTimeOverlay } from '../src/lib/examStudyTime.mjs';
import { readExamChatPlan } from '../src/lib/examChatPlan.mjs';
import {
  EXAM_PROFILE_KEY,
  GATES,
  dayDistance,
  emptyExamProfile,
  resolveExamPhase,
  validateExamProfile
} from '../src/lib/examOrchestrator.mjs';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';
import {
  listProjectableXizongSystems, loadXizongBlock,
  buildXizongForecastCanonicalScope, listCurrentXizongSystemIdentities
} from '../src/lib/xizong.mjs';
import { buildXizongForecastQuestionScope } from '../src/lib/xizongQuestions.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { politicsProductCatalog } from '../src/lib/productCatalog.mjs';
import { buildPoliticsMemoryCandidateCatalogCurrent } from '../src/lib/politicsMemoryCandidates.mjs';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

let cachedXizongPacketIndex = null;
let cachedXizongPacketInputs = null;
let cachedPoliticsCatalog = null;
let cachedPoliticsMemoryCatalog = null;

function xizongPacketIndex() {
  if (cachedXizongPacketIndex) return cachedXizongPacketIndex;
  const systems = listProjectableXizongSystems();
  cachedXizongPacketIndex = systems.flatMap((system) => system.blocks.map((blockRef) => {
    const canonical = loadXizongBlock(system.systemId, blockRef.slug);
    const production = buildXizongProductionBlock(canonical);
    return {
      systemId: system.systemId,
      slug: blockRef.slug,
      routeKey: `${system.systemId}/${blockRef.slug}`,
      blockId: canonical.blockId,
      blockLabel: canonical.label,
      packetMeta: {
        objectId: canonical.objectId,
        systemId: system.systemId,
        canonicalId: system.canonicalId,
        blockId: canonical.blockId,
        blockLabel: canonical.label,
        blockTitle: canonical.title,
        sourcePath: canonical.sourcePath,
        sourceHash: canonical.sourceHash,
        sourceContactMode: String(production?.sourceContact?.mode || ''),
        sourcePerGroup: production?.sourceContact?.logicGroupIsAutomaticSourceChunk === true,
        reserveItems: []
      },
      kpRows: production.kpRecords.map((kp) => ({
        kpId: kp.kpId,
        displayId: kp.displayId,
        title: kp.title,
        groupId: kp.groupId,
        groupLabel: kp.groupLabel,
        sourceLocator: kp.sourceLocator || '',
        prompt: kp.prompt || ''
      }))
    };
  }));
  return cachedXizongPacketIndex;
}

// Assemble native producer inputs once. This uses exactly the native scope
// builders used by Home; it does not copy their learning or Forecast semantics.
function xizongPacketInputs() {
  if (!cachedXizongPacketInputs) {
    const index = xizongPacketIndex();
    cachedXizongPacketInputs = {
      xizongPacketIndex: index,
      xizongForecastQuestionScope: buildXizongForecastQuestionScope(listCurrentXizongSystemIdentities()),
      xizongForecastCanonicalScope: buildXizongForecastCanonicalScope(index)
    };
  }
  return cachedXizongPacketInputs;
}

function politicsCatalog() {
  if (!cachedPoliticsCatalog) cachedPoliticsCatalog = politicsProductCatalog('/');
  return cachedPoliticsCatalog;
}

function politicsMemoryCatalog() {
  if (!cachedPoliticsMemoryCatalog) {
    cachedPoliticsMemoryCatalog = buildPoliticsMemoryCandidateCatalogCurrent();
  }
  return cachedPoliticsMemoryCatalog;
}

function readProfile(storage, day) {
  try {
    const raw = storage.getItem(EXAM_PROFILE_KEY);
    return raw == null ? emptyExamProfile() : validateExamProfile(JSON.parse(raw), day);
  } catch {
    return emptyExamProfile();
  }
}

function dayCapacity(profile, day) {
  if (Object.hasOwn(profile?.capacityByDay || {}, day)) return profile.capacityByDay[day];
  return profile?.defaultDailyMinutes ?? null;
}

function buildPlanReadModel(storage, day, now) {
  const profile = readProfile(storage, day);
  const timeOverlay = buildExamStudyTimeOverlay(storage, profile, day, now);
  const chatPlanState = readExamChatPlan(storage, day);
  const phase = resolveExamPhase(day);
  const nextGate = GATES.find((gate) => gate.date >= day) || null;
  const gate = nextGate ? {
    ...nextGate,
    daysRemaining: dayDistance(day, nextGate.date)
  } : null;

  return buildChatControlledExamReadModel({
    day,
    phase,
    gate,
    chatPlanState,
    dayCapacity: dayCapacity(timeOverlay.profile, day),
    actualBySubject: timeOverlay.effectiveBySubject,
    nativeContinue: {},
    timeOverlay,
    readable: true
  });
}

export function buildDailyLearningPacketFromPrivateCheckpoint(input, {
  now = null,
  base = '/',
  englishCatalog = englishSessionCatalog()
} = {}) {
  const checkpoint = validatePrivateLearnerCheckpoint(input);
  const timestamp = now == null ? Date.parse(checkpoint.generated_at) : Number(now);
  if (!Number.isFinite(timestamp)) throw new Error('DAILY_PACKET_PRIVATE_NOW_INVALID');

  const storage = new MemoryStorage();
  const restoreWarnings = [...(checkpoint.payload.shared.capture_warnings || [])];
  // This store is disposable and initially empty. Restore native owners first:
  // a transport receipt must not make a failed reconstruction look applied.
  const restored = restorePrivateSubjectCheckpoints(storage, checkpoint.payload.subjects || {}, { onlyIfEmpty: true });
  const nativeComplete = !Object.values(restored).some(row => row.status === 'blocked' || row.blocked?.length)
    && Object.values(checkpoint.payload.subjects || {}).flatMap(subjectCheckpointEntries)
      .every(([key, raw]) => storage.getItem(key) != null && sameCheckpointRaw(storage.getItem(key), raw));
  try {
    const sharedRestore = restoreSharedControlCheckpoint(storage, checkpoint.payload.shared, {
      expectedDay: checkpoint.study_day, restoreReceipt: nativeComplete && !restoreWarnings.length
    });
    restoreWarnings.push(...(sharedRestore.warnings || []));
  } catch (error) { restoreWarnings.push('checkpoint:shared:' + String(error.message || error)); }
  if (!nativeComplete && checkpoint.payload.shared.control_receipt_raw != null) {
    restoreWarnings.push('checkpoint:shared:RECEIPT_WITHHELD_NATIVE_CONFLICT');
  }
  const failedSubjects = restoreWarnings.filter(value => value.startsWith('checkpoint:'))
    .flatMap(value => value.split(':')[1].split('+')).map(subject => subject === 'lexical' ? 'english' : subject);
  for (const [subject, row] of Object.entries(restored)) {
    if (row.status === 'blocked') {
      failedSubjects.push(subject === 'lexical' ? 'english' : subject);
      restoreWarnings.push('checkpoint:' + subject + ':' + (row.reason || 'native recovery ambiguous'));
    }
  }

  const plan = buildPlanReadModel(storage, checkpoint.study_day, timestamp);
  const result = buildHomeDailyLearningPacket({
    storage,
    day: checkpoint.study_day,
    now: timestamp,
    plan,
    ...xizongPacketInputs(),
    englishCatalog,
    politicsCatalog: politicsCatalog(),
    politicsMemoryCatalog: politicsMemoryCatalog(),
    base
  });

  if (result.packet?.schema !== 'kianos.daily-learning-packet.v1') {
    throw new Error('DAILY_PACKET_PRIVATE_PROJECTION_INVALID');
  }
  if (result.packet.study_day !== checkpoint.study_day) {
    throw new Error('DAILY_PACKET_PRIVATE_DAY_MISMATCH');
  }

  const packet = {
    ...result.packet,
    coverage: result.coverage,
    warnings: [...new Set([...(result.packet.warnings || []), ...restoreWarnings, ...result.warnings])]
  };
  if (restoreWarnings.includes('SHARED_CHECKPOINT_STEWARD_REALITY_INVALID')) {
    packet.steward = {
      schema: 'kianos.steward-reality-summary.v1',
      study_day: checkpoint.study_day,
      breaks: null,
      meals: null,
      training: null,
      error: 'SHARED_CHECKPOINT_STEWARD_REALITY_INVALID'
    };
  }
  if (failedSubjects.includes('shared')) {
    packet.total_minutes = null;
    packet.timer = { running: null, active_subject: null, error: 'SHARED_CHECKPOINT_UNAVAILABLE' };
    for (const row of Object.values(packet.subjects)) row.time = null;
  }
  for (const subject of failedSubjects) {
    if (packet.subjects[subject]) packet.subjects[subject].evidence = null;
    packet.coverage[subject] = 'unavailable';
  }
  if (restoreWarnings.some(warning => warning.startsWith('checkpoint:'))) {
    // A failed subject reconstruction is UNKNOWN, not an empty evidence basis.
    packet.learner_evidence_basis = null;
    packet.schedule = null;
    for (const row of Object.values(packet.subjects)) row.plan = null;
  }
  return {
    packet,
    coverage: result.coverage,
    warnings: [...restoreWarnings, ...result.warnings],
    source_checkpoint_id: checkpoint.checkpoint_id,
    source_generated_at: checkpoint.generated_at
  };
}
