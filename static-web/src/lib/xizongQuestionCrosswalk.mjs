import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { listProjectableXizongSystems, loadXizongBlock } from './xizong.mjs';
import { createXizongReviewedRelationFreshnessResolver } from './xizongReviewedRelationFreshness.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const RELATION_ROOT = 'content/xizong/question-relations';
const QUESTION_ROOT = 'content/xizong/questions';
const resolveRelationFreshness = createXizongReviewedRelationFreshnessResolver({ repoRoot });

let reviewedIndexCache = null;
let systemRegistryCache = null;
const blockTargetCache = new Map();
const questionShardCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex');
}

function pad3(value) {
  return String(value).padStart(3, '0');
}

function routeForQuestionId(questionId) {
  const match = String(questionId).match(/^xizong-official-(\d{4})-n(\d{3})$/);
  if (!match) throw new Error(`CURRENT_XIZONG_CROSSWALK_QUESTION_ID_INVALID:${questionId}`);
  const year = match[1];
  const number = Number(match[2]);
  const start = Math.floor((number - 1) / 25) * 25 + 1;
  const end = start + 24;
  return { year, number, shard: `shards/${year}/q${pad3(start)}-${pad3(end)}.json` };
}

function normalizeReviewedRow(row) {
  if (!row || row.review_status !== 'REVIEWED') return null;
  const questionId = String(row.question_id || '');
  routeForQuestionId(questionId);
  const freshness = resolveRelationFreshness(row);
  return {
    questionId,
    sourceSystemId: String(row.system_id || ''),
    blockId: String(row.block_id || ''),
    logicGroupId: String(row.logic_group_id || ''),
    primaryKpId: String(row.primary_kp_id || ''),
    supportingKpIds: [...new Set((Array.isArray(row.supporting_kp_ids) ? row.supporting_kp_ids : []).map(String).filter(Boolean))],
    reviewedBridgeTargetRefs: Array.isArray(row.reviewed_bridge_target_refs) ? row.reviewed_bridge_target_refs : [],
    knowledgeOwnerPath: freshness.knowledge_path,
    knowledgeBlobSha: freshness.knowledge_blob_sha || '',
    knowledgeRevalidatedBlobSha: freshness.knowledge_revalidated_blob_sha || '',
    effectiveReviewWitness: freshness.effective_review_witness || '',
    currentKnowledgeBlobSha: freshness.current_blob_sha || '',
    reviewFreshnessStatus: freshness.status,
    reviewStatus: 'REVIEWED'
  };
}

function loadReviewedIndex() {
  if (reviewedIndexCache) return reviewedIndexCache;

  const manifest = readJson(`${RELATION_ROOT}/manifest.json`);
  const storage = manifest?.canonical_storage;
  if (storage?.record_shape !== 'reviewed_question_to_knowledge_relation_array') {
    throw new Error('CURRENT_XIZONG_CROSSWALK_MANIFEST_SHAPE_INVALID');
  }
  if (!Array.isArray(storage?.shards)) throw new Error('CURRENT_XIZONG_CROSSWALK_MANIFEST_SHARDS_MISSING');

  const relations = [];
  const byQuestionId = new Map();
  const freshnessCounts = { CURRENT: 0, STALE_REVIEW_WITNESS: 0, OWNER_MISSING: 0, WITNESS_MISSING: 0 };
  for (const shardMeta of storage.shards) {
    const relativePath = `${RELATION_ROOT}/${String(shardMeta?.path || '')}`;
    if (!shardMeta?.path || !fs.existsSync(absolute(relativePath))) {
      throw new Error(`CURRENT_XIZONG_CROSSWALK_SHARD_MISSING:${shardMeta?.path || 'unknown'}`);
    }
    const buffer = fs.readFileSync(absolute(relativePath));
    if (shardMeta?.blob_sha && gitBlobSha(buffer) !== String(shardMeta.blob_sha)) {
      throw new Error(`CURRENT_XIZONG_CROSSWALK_SHARD_BLOB_MISMATCH:${shardMeta.path}`);
    }
    const rows = JSON.parse(buffer.toString('utf8'));
    if (!Array.isArray(rows) || rows.length !== Number(shardMeta?.record_count || 0)) {
      throw new Error(`CURRENT_XIZONG_CROSSWALK_SHARD_COUNT_MISMATCH:${shardMeta.path}`);
    }
    for (const raw of rows) {
      const relation = normalizeReviewedRow(raw);
      if (!relation) throw new Error(`CURRENT_XIZONG_CROSSWALK_UNREVIEWED_ROW:${raw?.question_id || shardMeta.path}`);
      if (byQuestionId.has(relation.questionId)) {
        throw new Error(`CURRENT_XIZONG_CROSSWALK_DUPLICATE_QUESTION:${relation.questionId}`);
      }
      relations.push(relation);
      byQuestionId.set(relation.questionId, relation);
      freshnessCounts[relation.reviewFreshnessStatus] = (freshnessCounts[relation.reviewFreshnessStatus] || 0) + 1;
    }
  }

  if (relations.length !== Number(storage.reviewed_relation_count || 0)) {
    throw new Error(`CURRENT_XIZONG_CROSSWALK_MANIFEST_COUNT_MISMATCH:${relations.length}/${storage.reviewed_relation_count}`);
  }

  reviewedIndexCache = {
    reviewedRelationCount: relations.length,
    currentReviewedRelationCount: freshnessCounts.CURRENT || 0,
    nonCurrentReviewedRelationCount: relations.length - (freshnessCounts.CURRENT || 0),
    freshnessCounts,
    relations,
    byQuestionId
  };
  return reviewedIndexCache;
}

function systemRegistry() {
  if (systemRegistryCache) return systemRegistryCache;
  const systems = listProjectableXizongSystems();
  const aliases = new Map();
  for (const system of systems) {
    const names = new Set([
      system.systemId,
      system.raw?.system_id,
      system.raw?.identity?.system_id,
      ...(Array.isArray(system.raw?.identity?.legacy_system_id_variants) ? system.raw.identity.legacy_system_id_variants : [])
    ].map(String).filter(Boolean));
    for (const name of names) aliases.set(name, system);
  }
  systemRegistryCache = { systems, aliases };
  return systemRegistryCache;
}

function canonicalKpAliasMap(block) {
  const aliases = new Map(block.kpRecords.map((kp) => [kp.kpId, kp]));
  const source = readText(block.sourcePath);
  const pattern = /<!--\s*kianos:kp\b[^>]*\bid=(?:"([^"]+)"|'([^']+)')[^>]*-->/g;
  for (const match of source.matchAll(pattern)) {
    const canonicalId = String(match[1] || match[2] || '');
    const ordinalMatch = canonicalId.match(/-kp(\d+)$/i);
    if (!canonicalId || !ordinalMatch) continue;
    const ordinal = Number(ordinalMatch[1]);
    const runtimeKp = block.kpRecords.find((kp) => Number(kp.ordinal) === ordinal);
    if (runtimeKp) aliases.set(canonicalId, runtimeKp);
  }
  return aliases;
}

function normalizeRelationBlockId(system, blockId) {
  const raw = String(blockId || '').trim();
  if (!raw || system?.canonicalId !== 'B') return raw;
  const metabolic = raw.match(/^(?:dme-)?([dmg])0*(\d{1,2})$/i);
  if (metabolic) return `${metabolic[1].toUpperCase()}${Number(metabolic[2])}`;
  const digestive = raw.match(/^digestive-d0*(\d{1,2})$/i);
  if (digestive) return `D${Number(digestive[1])}`;
  return raw;
}

function targetBlock(sourceSystemId, blockId) {
  const registry = systemRegistry();
  const system = registry.aliases.get(String(sourceSystemId || '')) || null;
  if (!system || !blockId) return null;
  const resolvedBlockId = normalizeRelationBlockId(system, blockId);
  const blockMeta = system.blocks.find((block) => block.blockId === resolvedBlockId);
  if (!blockMeta) return null;

  const cacheKey = `${system.systemId}:${blockMeta.blockId}`;
  if (blockTargetCache.has(cacheKey)) return blockTargetCache.get(cacheKey);

  const block = loadXizongBlock(system.systemId, blockMeta.blockId);
  const kpAliases = canonicalKpAliasMap(block);
  const groupById = new Map(block.logicGroups.map((group) => [group.groupId, group]));
  const target = { system, blockMeta, block, kpAliases, groupById };
  blockTargetCache.set(cacheKey, target);
  return target;
}

function currentOwnerFallback(row) {
  const relativePath = String(row?.knowledgeOwnerPath || '');
  if (!relativePath || !relativePath.startsWith('content/xizong/knowledge/')) return null;
  if (!fs.existsSync(absolute(relativePath))) return null;
  const source = readText(relativePath);
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const header = frontmatter?.[1] || '';
  const title = String(header.match(/^title:\s*(.+)$/m)?.[1] || '').trim();
  const declaredBlockId = String(header.match(/^block_id:\s*(.+)$/m)?.[1] || row.blockId || '').trim();
  const currentSystemId = relativePath.includes('/systems/c-hematology-immunity-infection/')
    ? 'hematology-immunity-infection'
    : relativePath.includes('/systems/d-neuro-sensory-motor-orthopedics/')
      ? 'neuro-sensory-motor-orthopedics'
      : relativePath.includes('/systems/e-reproductive-breast/')
        ? 'reproductive-breast'
        : relativePath.includes('/systems/f-remaining-clinical/')
          ? 'remaining-clinical'
          : relativePath.includes('/overlays/o9-tumor-general/')
            ? 'global-oncology-overlay'
            : String(row.sourceSystemId || '');
  return {
    ...row,
    systemId: currentSystemId,
    blockSlug: '',
    blockLabel: declaredBlockId || row.blockId,
    blockTitle: title,
    targetStatus: 'BLOCK_ONLY',
    primaryRuntimeKpId: '',
    primaryKpDisplayId: '',
    primaryKpTitle: '',
    supportingRuntimeKpIds: [],
    resolvedLogicGroupId: '',
    logicGroupLabel: '',
    knowledgePath: '',
    currentOwnerOnly: true,
    projectionAvailable: false
  };
}

function projectRelation(row) {
  if (!row) return null;
  const target = targetBlock(row.sourceSystemId, row.blockId);
  if (!target) {
    return currentOwnerFallback(row) || {
      ...row,
      systemId: '',
      blockSlug: '',
      blockLabel: row.blockId,
      blockTitle: '',
      targetStatus: 'UNRESOLVED_BLOCK',
      primaryRuntimeKpId: '',
      primaryKpDisplayId: '',
      primaryKpTitle: '',
      supportingRuntimeKpIds: [],
      resolvedLogicGroupId: '',
      logicGroupLabel: '',
      knowledgePath: ''
    };
  }

  const primaryKp = row.primaryKpId ? target.kpAliases.get(row.primaryKpId) || null : null;
  const supportingKps = row.supportingKpIds
    .map((kpId) => target.kpAliases.get(kpId) || null)
    .filter(Boolean);
  const explicitGroup = row.logicGroupId ? target.groupById.get(row.logicGroupId) || null : null;
  const derivedGroup = primaryKp
    ? target.block.logicGroups.find((group) => group.groupId === primaryKp.groupId) || null
    : null;
  const resolvedGroup = explicitGroup || derivedGroup;
  const targetStatus = row.primaryKpId
    ? (primaryKp ? 'RESOLVED_KP' : 'BLOCK_ONLY')
    : 'RESOLVED_BLOCK';
  const anchor = primaryKp && row.primaryKpId
    ? `crosswalk-${encodeURIComponent(row.primaryKpId)}`
    : 'xizong-crosswalk-block';

  return {
    ...row,
    systemId: target.system.systemId,
    blockSlug: target.blockMeta.slug,
    blockLabel: target.blockMeta.label,
    blockTitle: target.blockMeta.title,
    targetStatus,
    primaryRuntimeKpId: primaryKp?.kpId || '',
    primaryKpDisplayId: primaryKp?.displayId || '',
    primaryKpTitle: primaryKp?.title || '',
    supportingRuntimeKpIds: [...new Set(supportingKps.map((kp) => kp.kpId))],
    resolvedLogicGroupId: resolvedGroup?.groupId || '',
    logicGroupLabel: resolvedGroup?.label || '',
    knowledgePath: `xizong/${target.system.systemId}/${target.blockMeta.slug}/#${anchor}`
  };
}

function questionSummary(questionId) {
  const route = routeForQuestionId(questionId);
  const key = `${QUESTION_ROOT}/${route.shard}`;
  if (!questionShardCache.has(key)) questionShardCache.set(key, readJson(key));
  const truth = questionShardCache.get(key)?.[questionId];
  if (!truth || truth.question_id !== questionId) {
    throw new Error(`CURRENT_XIZONG_CROSSWALK_QUESTION_TRUTH_MISSING:${questionId}`);
  }
  return {
    year: Number(truth?.source_identity?.official_exam_year || route.year),
    number: Number(truth?.source_identity?.official_exam_number || route.number),
    questionType: String(truth?.question_type || ''),
    stem: String(truth?.content?.stem || '')
  };
}

export function inspectXizongQuestionRelationFreshness(questionId) {
  const row = loadReviewedIndex().byQuestionId.get(String(questionId || '')) || null;
  if (!row) {
    return {
      questionId: String(questionId || ''),
      reviewStatus: 'MISSING',
      freshnessStatus: 'NO_REVIEWED_RELATION',
      current: false
    };
  }
  return {
    questionId: row.questionId,
    reviewStatus: row.reviewStatus,
    freshnessStatus: row.reviewFreshnessStatus,
    current: row.reviewFreshnessStatus === 'CURRENT',
    knowledgeOwnerPath: row.knowledgeOwnerPath,
    currentKnowledgeBlobSha: row.currentKnowledgeBlobSha,
    effectiveReviewWitness: row.effectiveReviewWitness
  };
}

export function xizongQuestionRelationFreshnessSummary() {
  const index = loadReviewedIndex();
  return {
    reviewedRelationCount: index.reviewedRelationCount,
    currentReviewedRelationCount: index.currentReviewedRelationCount,
    nonCurrentReviewedRelationCount: index.nonCurrentReviewedRelationCount,
    freshnessCounts: { ...index.freshnessCounts },
    sampleNonCurrentRelations: index.relations
      .filter((row) => row.reviewFreshnessStatus !== 'CURRENT')
      .slice(0, 20)
      .map((row) => ({ questionId: row.questionId, freshnessStatus: row.reviewFreshnessStatus }))
  };
}

export function loadReviewedXizongQuestionRelation(questionId) {
  const row = loadReviewedIndex().byQuestionId.get(String(questionId || '')) || null;
  if (!row || row.reviewFreshnessStatus !== 'CURRENT') return null;
  return projectRelation(row);
}

export function loadXizongQuestionCrosswalkForBlock(block) {
  const registry = systemRegistry();
  const currentSystem = registry.aliases.get(String(block?.systemId || '')) || null;
  const currentAliases = new Set();
  if (currentSystem) {
    for (const [alias, system] of registry.aliases.entries()) {
      if (system.systemId === currentSystem.systemId) currentAliases.add(alias);
    }
  } else if (block?.systemId) {
    currentAliases.add(String(block.systemId));
  }

  const index = loadReviewedIndex();
  const matchingRelations = index.relations.filter((row) => (
    row.blockId === block.blockId && currentAliases.has(row.sourceSystemId)
  ));
  const rawRelations = matchingRelations.filter((row) => row.reviewFreshnessStatus === 'CURRENT');
  const staleReviewedQuestionCount = matchingRelations.length - rawRelations.length;
  const questions = rawRelations
    .map(projectRelation)
    .filter(Boolean)
    .map((relation) => ({ ...relation, ...questionSummary(relation.questionId) }))
    .sort((a, b) => a.year - b.year || a.number - b.number);

  const kpRows = block.kpRecords.map((kp) => {
    const related = questions.filter((question) => (
      question.primaryRuntimeKpId === kp.kpId || question.supportingRuntimeKpIds.includes(kp.kpId)
    ));
    if (!related.length) return null;
    const canonicalKpIds = [...new Set(related.flatMap((question) => {
      const ids = [];
      if (question.primaryRuntimeKpId === kp.kpId && question.primaryKpId) ids.push(question.primaryKpId);
      question.supportingKpIds.forEach((canonicalId) => {
        const resolved = targetBlock(question.sourceSystemId, question.blockId)?.kpAliases.get(canonicalId) || null;
        if (resolved?.kpId === kp.kpId) ids.push(canonicalId);
      });
      return ids;
    }))];
    return {
      runtimeKpId: kp.kpId,
      displayId: kp.displayId,
      title: kp.title,
      groupId: kp.groupId,
      canonicalKpIds,
      questions: related.map((question) => ({
        ...question,
        roles: [
          ...(question.primaryRuntimeKpId === kp.kpId ? ['PRIMARY'] : []),
          ...(question.supportingKpIds.some((canonicalId) => targetBlock(question.sourceSystemId, question.blockId)?.kpAliases.get(canonicalId)?.kpId === kp.kpId) ? ['SUPPORTING'] : [])
        ]
      }))
    };
  }).filter(Boolean);

  const logicGroups = block.logicGroups.map((group) => ({
    groupId: group.groupId,
    label: group.label,
    kpRows: kpRows.filter((row) => row.groupId === group.groupId)
  })).filter((group) => group.kpRows.length > 0);

  const linkedQuestionIds = new Set(kpRows.flatMap((row) => row.questions.map((question) => question.questionId)));
  const blockOnlyQuestions = questions.filter((question) => !linkedQuestionIds.has(question.questionId));

  return {
    blockId: block.blockId,
    reviewedRelationCount: index.reviewedRelationCount,
    currentReviewedRelationCount: index.currentReviewedRelationCount,
    nonCurrentReviewedRelationCount: index.nonCurrentReviewedRelationCount,
    reviewedQuestionCount: questions.length,
    staleReviewedQuestionCount,
    logicGroups,
    blockOnlyQuestions
  };
}
