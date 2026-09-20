import { validatePrivateLearnerCheckpoint } from './privateLearnerStore.mjs';
import { restoreSharedControlCheckpoint } from '../src/lib/sharedControlCheckpoint.mjs';
import { restorePrivateSubjectCheckpoints } from '../src/lib/privateSubjectCheckpoints.mjs';
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
import { listProjectableXizongSystems, loadXizongBlock } from '../src/lib/xizong.mjs';
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

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch {
    return fallback;
  }
}

function buildXizongForecastProgress(storage) {
  const rows = xizongPacketIndex();
  const systems = new Map();
  const completedBlockIds = [];
  const startedIncomplete = [];
  let observedBlocks = 0;

  for (const row of rows) {
    const systemId = String(row.systemId || '');
    if (!systems.has(systemId)) {
      systems.set(systemId, {
        system_id: systemId,
        canonical_id: String(row.packetMeta?.canonicalId || ''),
        canonical_blocks: 0,
        canonical_kp: 0,
        runtime_observed_blocks: 0,
        runtime_completed_blocks: 0,
        runtime_started_incomplete_blocks: 0,
        runtime_observed_learned_kp: 0
      });
    }
    const system = systems.get(systemId);
    system.canonical_blocks += 1;
    system.canonical_kp += row.kpRows.length;

    const objectId = String(row.packetMeta?.objectId || `xizong:${row.blockId}`);
    const state = readJson(storage, `kianos-xizong-astro-v2:${objectId}`, null);
    if (!state || typeof state !== 'object' || Array.isArray(state)) continue;

    observedBlocks += 1;
    system.runtime_observed_blocks += 1;
    const learnedKp = Object.values(state.learned || {}).filter(Boolean).length;
    system.runtime_observed_learned_kp += learnedKp;

    if (state.completed === true) {
      completedBlockIds.push(row.blockId);
      system.runtime_completed_blocks += 1;
      continue;
    }
    system.runtime_started_incomplete_blocks += 1;
    startedIncomplete.push({
      system_id: systemId,
      canonical_id: String(row.packetMeta?.canonicalId || ''),
      block_id: row.blockId,
      kp_count: row.kpRows.length,
      learned_kp_count: learnedKp,
      current_stage: String(state.stage || ''),
      group_index: Number.isInteger(Number(state.groupIndex)) ? Number(state.groupIndex) : null,
      kp_index: Number.isInteger(Number(state.kpIndex)) ? Number(state.kpIndex) : null,
      block_recall_done: state.blockRecallDone === true
    });
  }

  const systemRows = [...systems.values()].sort((a,b) =>
    String(a.canonical_id).localeCompare(String(b.canonical_id), undefined, { numeric: true })
  );
  const canonicalBlocks = rows.length;
  const canonicalKp = rows.reduce((sum,row)=>sum+row.kpRows.length,0);

  return {
    schema: 'kianos.xizong.forecast-progress.v1',
    forecast_role: 'FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY',
    gate_workload_authority: false,
    canonical_scope: {
      systems: systemRows.length,
      blocks: canonicalBlocks,
      canonical_kp: canonicalKp,
      block_weights: rows.map((row) => ({
        system_id: String(row.systemId || ''),
        canonical_id: String(row.packetMeta?.canonicalId || ''),
        block_id: row.blockId,
        kp_count: row.kpRows.length
      }))
    },
    runtime_evidence: {
      observed_blocks: observedBlocks,
      completed_blocks: completedBlockIds.length,
      started_incomplete_blocks: startedIncomplete.length,
      no_runtime_evidence_blocks: Math.max(0, canonicalBlocks - observedBlocks),
      completed_block_ids: completedBlockIds.sort(),
      started_incomplete: startedIncomplete
    },
    systems: systemRows,
    evidence_boundary:
      'Factual KianOS runtime progress only. NO_RUNTIME_EVIDENCE does not prove unstudied; learned_kp is not mastery; Gate workload still requires subject-owned reconciliation into exam.subject-demand.v1.'
  };
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
  base = '/'
} = {}) {
  const checkpoint = validatePrivateLearnerCheckpoint(input);
  const timestamp = now == null ? Date.parse(checkpoint.generated_at) : Number(now);
  if (!Number.isFinite(timestamp)) throw new Error('DAILY_PACKET_PRIVATE_NOW_INVALID');

  const storage = new MemoryStorage();
  restoreSharedControlCheckpoint(storage, checkpoint.payload.shared, {
    expectedDay: checkpoint.study_day
  });
  const restoreWarnings = [];
  for (const subject of ['xizong', 'english', 'politics']) {
    const payload = checkpoint.payload.subjects?.[subject];
    if (payload == null) continue;
    try {
      restorePrivateSubjectCheckpoints(storage, { [subject]: payload }, {
        onlyIfEmpty: true
      });
    } catch (error) {
      restoreWarnings.push(
        'checkpoint:' + subject + ':' + String(error?.message || error)
      );
    }
  }

  const plan = buildPlanReadModel(storage, checkpoint.study_day, timestamp);
  const result = buildHomeDailyLearningPacket({
    storage,
    day: checkpoint.study_day,
    now: timestamp,
    plan,
    xizongPacketIndex: xizongPacketIndex(),
    politicsCatalog: politicsCatalog(),
    politicsMemoryCatalog: politicsMemoryCatalog(),
    base
  });

  if (result.packet?.subjects?.xizong?.evidence) {
    result.packet.subjects.xizong.evidence.forecast_progress =
      buildXizongForecastProgress(storage);
  }

  if (result.packet?.schema !== 'kianos.daily-learning-packet.v1') {
    throw new Error('DAILY_PACKET_PRIVATE_PROJECTION_INVALID');
  }
  if (result.packet.study_day !== checkpoint.study_day) {
    throw new Error('DAILY_PACKET_PRIVATE_DAY_MISMATCH');
  }

  return {
    packet: result.packet,
    coverage: result.coverage,
    warnings: [...restoreWarnings, ...result.warnings],
    source_checkpoint_id: checkpoint.checkpoint_id,
    source_generated_at: checkpoint.generated_at
  };
}
