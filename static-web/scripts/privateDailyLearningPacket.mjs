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
import { listProjectableXizongSystems, listXizongForecastScope, loadXizongBlock } from '../src/lib/xizong.mjs';
import { buildXizongProductionBlock } from '../src/lib/xizongProductionProjection.mjs';
import { politicsProductCatalog } from '../src/lib/productCatalog.mjs';

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


function readJson(storage,key,fallback=null){
  try{
    const raw=storage.getItem(key);
    return raw==null?fallback:(JSON.parse(raw)??fallback);
  }catch{
    return fallback;
  }
}

function buildXizongForecastProgress(storage){
  const scope=listXizongForecastScope();
  const completedBlockIds=[];
  const startedIncomplete=[];
  const systemRows=[];

  for(const system of scope.systems){
    let observedBlocks=0;
    let completedBlocks=0;
    let startedBlocks=0;
    let observedLearnedKp=0;

    for(const block of system.blocks){
      const state=readJson(
        storage,
        'kianos-xizong-astro-v2:xizong:'+block.blockId,
        null
      );
      if(!state||typeof state!=='object'||Array.isArray(state))continue;

      observedBlocks+=1;
      const learnedKp=Object.values(state.learned||{}).filter(Boolean).length;
      observedLearnedKp+=learnedKp;

      if(state.completed===true){
        completedBlocks+=1;
        completedBlockIds.push(block.blockId);
        continue;
      }

      startedBlocks+=1;
      startedIncomplete.push({
        system_id:system.systemId,
        canonical_id:system.canonicalId,
        block_id:block.blockId,
        kp_count:block.kpCount,
        learned_kp_count:learnedKp,
        current_stage:String(state.stage||''),
        group_index:Number.isInteger(Number(state.groupIndex))?Number(state.groupIndex):null,
        kp_index:Number.isInteger(Number(state.kpIndex))?Number(state.kpIndex):null,
        block_recall_done:state.blockRecallDone===true
      });
    }

    systemRows.push({
      system_id:system.systemId,
      canonical_id:system.canonicalId,
      title:system.title,
      projection_accepted:system.projectionAccepted,
      canonical_blocks:system.blockCount,
      canonical_kp:system.canonicalKpCount,
      runtime_observed_blocks:observedBlocks,
      runtime_completed_blocks:completedBlocks,
      runtime_started_incomplete_blocks:startedBlocks,
      runtime_observed_learned_kp:observedLearnedKp
    });
  }

  const observedBlockCount=systemRows.reduce(
    (sum,row)=>sum+row.runtime_observed_blocks,
    0
  );

  return{
    schema:'kianos.xizong.forecast-progress.v1',
    canonical_scope:{
      systems:scope.systemCount,
      blocks:scope.blockCount,
      canonical_kp:scope.canonicalKpCount,
      block_weights:scope.systems.flatMap((system)=>
        system.blocks.map((block)=>({
          system_id:system.systemId,
          canonical_id:system.canonicalId,
          block_id:block.blockId,
          kp_count:block.kpCount,
          projection_accepted:system.projectionAccepted
        }))
      )
    },
    runtime_evidence:{
      observed_blocks:observedBlockCount,
      completed_blocks:completedBlockIds.length,
      started_incomplete_blocks:startedIncomplete.length,
      no_runtime_evidence_blocks:Math.max(0,scope.blockCount-observedBlockCount),
      completed_block_ids:completedBlockIds.sort(),
      started_incomplete:startedIncomplete
    },
    systems:systemRows,
    evidence_boundary:
      'NO_RUNTIME_EVIDENCE means only that KianOS has no durable Block runtime evidence; it does not prove the learner has not studied that Block elsewhere.'
  };
}

function politicsCatalog() {
  if (!cachedPoliticsCatalog) cachedPoliticsCatalog = politicsProductCatalog('/');
  return cachedPoliticsCatalog;
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
    base
  });

  if(result.packet?.subjects?.xizong){
    result.packet.subjects.xizong.forecast_progress=buildXizongForecastProgress(storage);
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
