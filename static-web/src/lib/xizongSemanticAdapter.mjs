import { readXizongCompileFile, readXizongCompileJson, memoXizongCompile } from './xizongCompileContext.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { loadXizongSystem, loadXizongBlock, resolveXizongKnowledgeView } from './xizong.mjs';
import path from 'node:path';
import { normalizeAcceptedLearningOwner, normalizeAcceptedLogicGroups, expandAcceptedOrdinalRange as expandRange, normalizeAcceptedBlockRoute as systemBlockRoute, hydrateAcceptedLearningOwner } from './xizongAcceptedLearningOwner.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const SYSTEMS_ROOT = 'content/xizong/knowledge/systems';
const LEARNER_ROOT = 'content/xizong/knowledge/learner';
const SHARED_FIELDS = `${LEARNER_ROOT}/shared-fields.json`;
const EXTENSION_SUFFIX = '-extensions.json';

export const XIZONG_SEMANTIC_ADAPTER_SCHEMA = 'kianos.xizong.semantic_adapter.v1';

const BUILD_CACHE_ENABLED = process.env.KIANOS_XIZONG_BUILD_CACHE === '1';
const semanticSystemCache = new Map();

function absolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

function readText(relativePath) {
  return readXizongCompileFile(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return readXizongCompileJson(absolute(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(absolute(relativePath));
}

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_SEMANTIC_${code}${detail ? `:${detail}` : ''}`);
}

function isChatApproved(value) {
  return String(value || '').startsWith('CHAT_APPROVED');
}

function systemIdentity(raw) {
  return {
    systemId: String(raw?.system_id || raw?.identity?.system_id || ''),
    canonicalId: String(raw?.canonical_id || raw?.identity?.canonical_id || ''),
    title: String(raw?.title || raw?.identity?.title || '')
  };
}

function systemDirectories() {
  if (!exists(SYSTEMS_ROOT)) fail('SYSTEMS_ROOT_MISSING');
  return fs.readdirSync(absolute(SYSTEMS_ROOT), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function findSystemRecord(systemId) {
  for (const dirName of systemDirectories()) {
    const sourcePath = `${SYSTEMS_ROOT}/${dirName}/system.json`;
    if (!exists(sourcePath)) continue;
    const raw = readJson(sourcePath);
    const identity = systemIdentity(raw);
    if (identity.systemId !== systemId) continue;
    if (!identity.canonicalId || !identity.title) fail('SYSTEM_IDENTITY_INVALID', systemId);
    if (!isChatApproved(raw?.semantic_authority)) fail('SYSTEM_AUTHORITY_INVALID', systemId);
    const route = systemBlockRoute(raw);
    if (!route.length) fail('SYSTEM_BLOCK_ROUTE_MISSING', systemId);
    return { dirName, sourcePath, raw, identity, route };
  }
  fail('SYSTEM_NOT_FOUND', systemId);
}

function loadLearningOwner(record) {
  const baseName = `${record.identity.canonicalId.toLowerCase()}-${record.identity.systemId}-learning.json`;
  const sourcePath = `${LEARNER_ROOT}/${baseName}`;
  if (!exists(sourcePath)) fail('LEARNING_OWNER_MISSING', record.identity.systemId);

  const base = readJson(sourcePath);
  if (base?.status !== 'CURRENT') fail('LEARNING_OWNER_STATUS_INVALID', record.identity.systemId);
  if (!isChatApproved(base?.authority)) fail('LEARNING_OWNER_AUTHORITY_INVALID', record.identity.systemId);
  if (base?.system_id !== record.identity.systemId || base?.canonical_id !== record.identity.canonicalId) {
    fail('LEARNING_OWNER_IDENTITY_MISMATCH', record.identity.systemId);
  }

  const hydrated = hydrateAcceptedLearningOwner({ repoRoot, learningPath: sourcePath, learning: base });
  const routeIds = record.route.map((row) => row.id);
  let contentSourcePath = null;
  let contentOwner = null;
  if (!(hydrated.owner?.blocks && Object.keys(hydrated.owner.blocks).length)) {
    const candidate = sourcePath.replace(/-learning\.json$/i, '-content.json');
    if (exists(candidate)) {
      contentOwner = readJson(candidate);
      if (contentOwner?.status !== 'ACCEPTED'
        || contentOwner?.system_id !== record.identity.systemId
        || contentOwner?.canonical_id !== record.identity.canonicalId) {
        fail('CONTENT_OWNER_INVALID', record.identity.systemId);
      }
      contentSourcePath = candidate;
    }
  }
  const normalized = normalizeAcceptedLearningOwner({
    learning: hydrated.owner,
    routeIds,
    content: contentOwner
  });
  const blocks = normalized.owner?.blocks || {};
  const blockIds = Object.keys(blocks);
  if (routeIds.length !== blockIds.length || routeIds.some((id) => !blocks[id])) {
    fail('LEARNING_OWNER_BLOCK_MISMATCH', `${record.identity.systemId}:${routeIds.length}/${blockIds.length}`);
  }

  return {
    sourcePath,
    contentSourcePath,
    shardPaths: hydrated.shardPaths,
    schemaFamily: normalized.schemaFamily,
    blockKeyMap: normalized.blockKeyMap,
    raw: normalized.owner
  };
}

function flattenText(value) {
  if (Array.isArray(value)) return value.map(String).join(' ');
  return String(value || '');
}

function postChatRetrievalPolicy(learning) {
  const row = learning?.surface_handoff_contract?.post_chat_retrieval || learning?.post_chat_retrieval || null;
  if (row) {
    const entryMode = String(row?.entry_mode || '');
    if (entryMode !== 'POST_CHAT_RECALL') fail('POST_CHAT_RETRIEVAL_INVALID', String(learning?.system_id || ''));
    return {
      postChatRecall: true,
      titleOnlyKps: true,
      sourceReturnClearsPostChatMode: /returning to original Source leaves this navigation mode/i.test(String(row?.rule || '')),
      compatibility: null
    };
  }
  // Transitional compatibility for already-accepted A1/A2/A3 post-Chat retrieval.
  // This is compiler metadata only: it must not mutate Content/Learning owners or learner revision witnesses.
  if (['A1', 'A2', 'A3'].includes(String(learning?.canonical_id || ''))) {
    return { postChatRecall: true, titleOnlyKps: true, sourceReturnClearsPostChatMode: false, compatibility: 'LEGACY_ACCEPTED_A_POST_CHAT' };
  }
  return { postChatRecall: false, titleOnlyKps: false, sourceReturnClearsPostChatMode: false, compatibility: null };
}

function sourceContactMode(learning) {
  const handoff = learning?.surface_handoff_contract || {};
  if (typeof handoff.source_contact_unit === 'string' && handoff.source_contact_unit.trim()) {
    return handoff.source_contact_unit.trim();
  }

  const explicit = [
    learning?.surface_ownership?.hard_rule,
    handoff.normal_switching_rule,
    ...(Array.isArray(handoff.primary_sequence) ? handoff.primary_sequence : [])
  ].map(flattenText).join(' ');

  if (/whole[- ](?:Logic[- ]Group|LG)|whole[- ]LG/i.test(explicit)) return 'WHOLE_LOGIC_GROUP';
  return 'NATURAL_SOURCE_UNIT';
}

function normalizeSourceContact(learning, blockSupport, blockId, logicGroups) {
  const handoff = learning?.surface_handoff_contract || {};
  const scoped = blockSupport?.source_contact || {};
  const nativeB = learning?.system_id === 'digestive-metabolic-endocrine-tumor' && learning?.canonical_id === 'B';
  if (nativeB) {
    if (/^D(?:[1-9]|1[0-9]|2[0-3])$/.test(blockId)) {
      if ((scoped.mode && scoped.mode !== 'WHOLE_LOGIC_GROUP') || sourceContactMode(learning) !== 'WHOLE_LOGIC_GROUP') {
        fail('B_SOURCE_GEOMETRY_INVALID', blockId);
      }
    } else if (/^(?:M(?:[1-9]|10)|G[1-5])$/.test(blockId)) {
      if (scoped.mode !== 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT'
        || scoped.source_map_owner !== `${LEARNER_ROOT}/biochemistry-27-source-map.json`) fail('B_SOURCE_GEOMETRY_INVALID', blockId);
    } else fail('B_BLOCK_IDENTITY_INVALID', blockId);
  }

  if (['WHOLE_BLOCK_SOURCE', 'NATURAL_SOURCE_UNITS', 'INTEGRATION_PRIMARY'].includes(scoped.mode)) {
    const mode = scoped.mode;
    const segmentUnits = mode === 'NATURAL_SOURCE_UNITS'
      ? (scoped.source_units || [])
      : (mode === 'INTEGRATION_PRIMARY' ? (scoped.targeted_source_units || []) : []);
    const segments = segmentUnits.map((unit) => ({
      segmentId: `source:${String(unit.sourceUnitId || '')}`,
      kind: mode === 'INTEGRATION_PRIMARY' ? 'INTEGRATION_TARGETED_SOURCE_RETURN' : 'NATURAL_SOURCE_UNIT',
      sourceUnitId: String(unit.sourceUnitId || ''),
      label: String(unit.label || ''),
      logicGroupIds: Array.isArray(unit.logicGroupIds) ? [...unit.logicGroupIds] : [],
      kpOrdinals: Array.isArray(unit.kpOrdinals) ? [...unit.kpOrdinals] : [],
      contributesToLogicGroupIds: Array.isArray(unit.contributesToLogicGroupIds) ? [...unit.contributesToLogicGroupIds] : [],
      reactivateLogicGroupIds: Array.isArray(unit.reactivateLogicGroupIds) ? [...unit.reactivateLogicGroupIds] : [],
      reactivationNote: String(unit.reactivationNote || ''),
      postUnitClosureLogicGroupIds: Array.isArray(unit.postUnitClosureLogicGroupIds) ? [...unit.postUnitClosureLogicGroupIds] : [],
      sourceDebt: Array.isArray(unit.sourceDebt) ? [...unit.sourceDebt] : [],
      sourceVerified: Array.isArray(unit.sourceVerified) ? [...unit.sourceVerified] : [],
      verifiedSource: Array.isArray(unit.verifiedSource) ? [...unit.verifiedSource] : [],
      visualDebt: Array.isArray(unit.visualDebt) ? [...unit.visualDebt] : [],
      visualState: String(unit.visualState || ''),
      visualSourceRequired: Array.isArray(unit.visualSourceRequired) ? [...unit.visualSourceRequired] : []
    }));
    const releaseLogicGroupIds = Array.isArray(scoped.release_lg_refs) ? [...scoped.release_lg_refs] : [];
    const integrationReleaseLogicGroupIds = Array.isArray(scoped.integration_release_lg_refs)
      ? [...scoped.integration_release_lg_refs]
      : [];
    const targetedSourceGuidance = Array.isArray(scoped.targeted_source_guidance)
      ? [...scoped.targeted_source_guidance]
      : [];

    return {
      mode,
      externalPrimarySurface: 'ORIGINAL_LECTURE_MARGINNOTE',
      segments,
      segmentResolution: mode === 'NATURAL_SOURCE_UNITS'
        ? 'EXPLICIT_FROM_ACCEPTED_CONTENT_REALIZATION'
        : (mode === 'WHOLE_BLOCK_SOURCE'
          ? 'EXPLICIT_WHOLE_BLOCK_SOURCE'
          : (segments.length
            ? 'INTEGRATION_PRIMARY_WITH_EXPLICIT_TARGETED_SOURCE_RETURNS'
            : 'INTEGRATION_PRIMARY_NO_NEW_CONTINUOUS_SOURCE')),
      logicGroupIsAutomaticSourceChunk: false,
      logicGroupSourceReentryDefault: false,
      requiresPrimarySourceContact: mode !== 'INTEGRATION_PRIMARY',
      integrationPrimary: mode === 'INTEGRATION_PRIMARY',
      integrationTargetedSourceReturns: mode === 'INTEGRATION_PRIMARY' && segments.length > 0,
      releaseLogicGroupIds,
      integrationReleaseLogicGroupIds,
      returnPattern: mode === 'NATURAL_SOURCE_UNITS'
        ? 'SOURCE_UNIT_THEN_RELEVANT_LG_RETRIEVAL'
        : (mode === 'WHOLE_BLOCK_SOURCE'
          ? 'ONE_CONTINUOUS_SOURCE_THEN_ALL_BLOCK_LG_RETRIEVAL'
          : 'KIANOS_INTEGRATION_RETRIEVAL_WITH_TARGETED_SOURCE_RETURN'),
      normalFirstPass: Array.isArray(learning?.first_pass_chain) ? [...learning.first_pass_chain] : [],
      extraSourceReturnAllowedFor: targetedSourceGuidance,
      targetedSourceGuidance,
      externalRecall: Array.isArray(scoped.external_recall) ? [...scoped.external_recall] : [],
      blockSourceDebt: Array.isArray(scoped.block_source_debt) ? [...scoped.block_source_debt] : [],
      blockSourceConflict: Array.isArray(scoped.block_source_conflict) ? [...scoped.block_source_conflict] : [],
      blockVerifiedSource: Array.isArray(scoped.block_verified_source) ? [...scoped.block_verified_source] : [],
      blockVisualDebt: Array.isArray(scoped.block_visual_debt) ? [...scoped.block_visual_debt] : [],
      lectureAttachedQuestionsOwner: 'ORIGINAL_LECTURE_MARGINNOTE',
      contentPattern: String(scoped.content_pattern || ''),
      ownerBlockKey: String(scoped.owner_block_key || ''),
      hardReadiness: Array.isArray(scoped.hard_readiness) ? [...scoped.hard_readiness] : [],
      requiredPriorOwners: Array.isArray(scoped.required_prior_owners) ? [...scoped.required_prior_owners] : [],
      boundary: String(scoped.boundary || ''),
      rule: String(scoped.rule || '')
    };
  }

  if (scoped.mode === 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT') {
    const sourceMapPath = String(scoped.source_map_owner || '').trim();
    if (!sourceMapPath || !exists(sourceMapPath)) fail('BIOCHEMISTRY_SOURCE_MAP_MISSING', blockId);
    const sourceMap = readJson(sourceMapPath);
    if (sourceMap?.status !== 'CURRENT_27_SOURCE_ROUTING_REACCEPTED') {
      fail('BIOCHEMISTRY_SOURCE_MAP_INVALID', `${blockId}:${sourceMap?.status || 'unknown'}`);
    }
    const sourceLaneHash = String(sourceMap?.source?.sha256 || '').trim();
    if (!sourceLaneHash) fail('BIOCHEMISTRY_SOURCE_HASH_MISSING', blockId);
    if (nativeB) {
      if (!/^[a-f0-9]{64}$/.test(sourceLaneHash)) fail('BIOCHEMISTRY_SOURCE_HASH_INVALID', blockId);
      const units = sourceMap.source_units;
      if (!Array.isArray(units) || !units.length || new Set(units.map(unit => unit.id)).size !== units.length) {
        fail('BIOCHEMISTRY_SOURCE_UNITS_INVALID', blockId);
      }
      const groupById = new Map(logicGroups.map(group => [group.groupId, group]));
      const formed = new Set();
      const closingUnits = [];
      const primaryUnits = [];
      for (const unit of units) {
        if (!/^BIO27-S\d{2}$/.test(unit?.id || '') || !Array.isArray(unit?.canonical_content)) fail('BIOCHEMISTRY_SOURCE_UNIT_INVALID', blockId);
        for (const row of unit.canonical_content.filter(row => row?.block === blockId)) {
          const group = groupById.get(row?.logic_group);
          const range = row?.kp_range;
          if (!group || !Array.isArray(range) || range.length !== 2
            || !range.every(Number.isInteger) || range[0] > range[1]) fail('BIOCHEMISTRY_SOURCE_BINDING_INVALID', `${blockId}:${unit.id}`);
          const ordinals = expandRange(range, `${blockId}:${unit.id}`);
          if (!ordinals.every(ordinal => group.kpOrdinals.includes(ordinal))) fail('BIOCHEMISTRY_SOURCE_BINDING_INVALID', `${blockId}:${unit.id}:${group.groupId}`);
          const primary = ['PRIMARY_FORMATION', 'PRIMARY_COMPLETION'].includes(row.role);
          if (!primary && !['SUPPORT', 'SUPPORT_AND_PRIME', 'SUPPORT_APPLICATION', 'SUPPORT_JIT', 'SUPPORT_RECAP'].includes(row.role)) {
            fail('BIOCHEMISTRY_SOURCE_ROLE_INVALID', `${blockId}:${unit.id}`);
          }
          if (row.closes_block_source_contact === true && !primary) fail('BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID', `${blockId}:${unit.id}`);
          if (primary) {
            primaryUnits.push(unit.id);
            ordinals.forEach(ordinal => formed.add(ordinal));
            if (row.closes_block_source_contact === true) closingUnits.push(unit.id);
          }
        }
      }
      const expected = logicGroups.flatMap(group => group.kpOrdinals);
      if (formed.size !== expected.length || expected.some(ordinal => !formed.has(ordinal))) fail('BIOCHEMISTRY_SOURCE_COVERAGE_INCOMPLETE', blockId);
      const checkpoint = sourceMap.block_source_closure_checkpoints?.[blockId];
      if (closingUnits.length !== 1 || checkpoint?.after_unit !== closingUnits[0]
        || checkpoint.after_unit !== primaryUnits.at(-1)) fail('BIOCHEMISTRY_SOURCE_CHECKPOINT_INVALID', blockId);
    }

    const segments = [];
    for (const unit of sourceMap.source_units || []) {
      const rows = (unit?.canonical_content || []).filter((row) =>
        String(row?.block || '') === blockId && String(row?.role || '').startsWith('PRIMARY')
      );
      if (!rows.length) continue;
      const kpOrdinals = [...new Set(rows.flatMap((row) => {
        const range = Array.isArray(row?.kp_range) ? row.kp_range : [];
        if (range.length !== 2) fail('BIOCHEMISTRY_KP_RANGE_INVALID', `${blockId}:${unit?.id || ''}`);
        return expandRange(range, `${blockId}:${unit?.id || ''}`);
      }))].sort((a, b) => a - b);
      const logicGroupIds = [...new Set(rows.map((row) => String(row?.logic_group || '')).filter(Boolean))];
      segments.push({
        segmentId: `bio27:${String(unit?.id || '')}`,
        kind: 'GLOBAL_BIOCHEMISTRY_SOURCE_UNIT',
        sourceUnitId: String(unit?.id || ''),
        label: String(unit?.label || ''),
        pdf: Array.isArray(unit?.pdf) ? unit.pdf.map(Number) : [],
        logicGroupIds,
        kpOrdinals,
        closesBlockSourceContact: rows.some((row) => row?.closes_block_source_contact === true)
      });
    }
    if (!segments.length) fail('BIOCHEMISTRY_SOURCE_SEGMENTS_MISSING', blockId);
    const checkpoint = sourceMap?.block_source_closure_checkpoints?.[blockId];
    if (!checkpoint?.after_unit) fail('BIOCHEMISTRY_SOURCE_CHECKPOINT_MISSING', blockId);

    return {
      mode: scoped.mode,
      externalPrimarySurface: 'ORIGINAL_LECTURE_MARGINNOTE',
      segments,
      segmentResolution: 'EXPLICIT_FROM_GLOBAL_BIOCHEMISTRY_SOURCE_MAP',
      logicGroupIsAutomaticSourceChunk: false,
      logicGroupSourceReentryDefault: false,
      returnPattern: 'GLOBAL_BIOCHEMISTRY_SOURCE_LANE_THEN_LOCAL_RECALL',
      normalFirstPass: ['FOLLOW_CURRENT_27_SOURCE_ORDER_END_TO_END'],
      extraSourceReturnAllowedFor: [],
      lectureAttachedQuestionsOwner: 'ORIGINAL_LECTURE_MARGINNOTE',
      sourceMapOwner: sourceMapPath,
      sourceLaneHash,
      sourceName: String(sourceMap?.source?.visible_name || ''),
      closureUnit: String(checkpoint.after_unit)
    };
  }

  const mode = sourceContactMode(learning);
  const segments = mode === 'WHOLE_LOGIC_GROUP'
    ? logicGroups.map((group) => ({
      segmentId: `source:${group.groupId}`,
      kind: 'LOGIC_GROUP_SOURCE_CONTACT',
      logicGroupIds: [group.groupId],
      kpOrdinals: [...group.kpOrdinals]
    }))
    : [];

  const explicitReentry = typeof handoff.lg_source_reentry_default === 'boolean'
    ? handoff.lg_source_reentry_default
    : null;

  return {
    mode,
    externalPrimarySurface: 'ORIGINAL_LECTURE_MARGINNOTE',
    segments,
    segmentResolution: segments.length ? 'EXPLICIT_FROM_ACCEPTED_LEARNING_OWNER' : 'RESOLVE_AT_ACCEPTED_NATURAL_SOURCE_BOUNDARY',
    logicGroupIsAutomaticSourceChunk: mode === 'WHOLE_LOGIC_GROUP',
    logicGroupSourceReentryDefault: explicitReentry ?? (mode === 'WHOLE_LOGIC_GROUP' ? true : null),
    returnPattern: mode === 'WHOLE_LOGIC_GROUP'
      ? 'RETURN_AFTER_EACH_ACCEPTED_WHOLE_LOGIC_GROUP_SOURCE_CONTACT'
      : (mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT'
        ? 'ONE_NORMAL_RETURN_AFTER_CONTINUOUS_BLOCK_OR_CANONICAL_SOURCE_CONTACT'
        : 'RETURN_AT_ACCEPTED_NATURAL_SOURCE_BOUNDARY'),
    normalFirstPass: Array.isArray(handoff.normal_first_pass)
      ? [...handoff.normal_first_pass]
      : (Array.isArray(handoff.primary_sequence) ? [...handoff.primary_sequence] : []),
    extraSourceReturnAllowedFor: Array.isArray(handoff.extra_source_return_allowed_for)
      ? [...handoff.extra_source_return_allowed_for]
      : [],
    lectureAttachedQuestionsOwner: 'ORIGINAL_LECTURE_MARGINNOTE'
  };
}

function normalizeRetrieval(logicGroups, sourceContact) {
  const segmentByGroup = new Map();
  if (sourceContact.mode === 'NATURAL_SOURCE_UNITS' || (sourceContact.mode === 'INTEGRATION_PRIMARY' && sourceContact.integrationTargetedSourceReturns)) {
    for (const segment of sourceContact.segments || []) {
      for (const groupId of segment.logicGroupIds || []) {
        if (segmentByGroup.has(groupId)) fail('SOURCE_GROUP_MULTI_SEGMENT', `${groupId}:${segmentByGroup.get(groupId)}:${segment.segmentId}`);
        segmentByGroup.set(groupId, segment.segmentId);
      }
      for (const groupId of segment.postUnitClosureLogicGroupIds || []) {
        if (!segmentByGroup.has(groupId)) segmentByGroup.set(groupId, segment.segmentId);
      }
    }
  }
  return logicGroups.map((group, index) => ({
    retrievalPointId: `retrieval:${group.groupId}`,
    logicGroupId: group.groupId,
    order: index + 1,
    sourceContactBefore: sourceContact.mode === 'WHOLE_LOGIC_GROUP'
      ? `source:${group.groupId}`
      : (sourceContact.mode === 'NATURAL_SOURCE_UNITS'
        ? (segmentByGroup.get(group.groupId) || null)
        : (sourceContact.mode === 'INTEGRATION_PRIMARY'
          ? (segmentByGroup.get(group.groupId) || null)
          : (index === 0 ? 'ACCEPTED_CONTINUOUS_SOURCE_CONTACT' : null))),
    reopenSourceByDefault: sourceContact.mode === 'WHOLE_LOGIC_GROUP'
      ? true
      : Boolean(sourceContact.logicGroupSourceReentryDefault),
    closure: group.closure
  }));
}

function optionalCurrentJson(sourcePath, record) {
  if (!exists(sourcePath)) return null;
  const raw = readJson(sourcePath);
  if (raw?.status !== 'CURRENT' || !isChatApproved(raw?.authority)) fail('OPTIONAL_OWNER_INVALID', sourcePath);
  if (record && (raw?.system_id !== record.identity.systemId || raw?.canonical_id !== record.identity.canonicalId)) {
    fail('OPTIONAL_OWNER_IDENTITY_MISMATCH', sourcePath);
  }
  return { sourcePath, raw };
}

function loadLearningCues(record) {
  const sourcePath = `${LEARNER_ROOT}/${record.identity.canonicalId.toLowerCase()}-${record.identity.systemId}-learning-cues.json`;
  return optionalCurrentJson(sourcePath, record);
}

function loadSourceVisuals(record) {
  const sourcePath = `${LEARNER_ROOT}/${record.identity.canonicalId.toLowerCase()}-${record.identity.systemId}-source-visuals.json`;
  return optionalCurrentJson(sourcePath, record);
}

function sourceVisualBundleMap(sourceVisualOwner) {
  return new Map((sourceVisualOwner?.raw?.bundles || []).map((bundle) => [bundle?.cue_id, bundle]));
}

function normalizeCueAnchor(anchor = {}) {
  return {
    blockId: String(anchor?.block_id || ''),
    logicGroupId: String(anchor?.logic_group_id || ''),
    kpId: String(anchor?.kp_id || '')
  };
}

function normalizeBlockCues(blockId, logicGroups, cueOwner, sourceVisualOwner) {
  const groupIds = new Set(logicGroups.map((group) => group.groupId));
  const bundleByCue = sourceVisualBundleMap(sourceVisualOwner);
  const precision = [];
  const visuals = [];

  for (const row of cueOwner?.raw?.precision_index || []) {
    if (row?.anchor?.block_id !== blockId) continue;
    const anchor = normalizeCueAnchor(row.anchor);
    if (anchor.logicGroupId && !groupIds.has(anchor.logicGroupId)) fail('CUE_LOGIC_GROUP_UNKNOWN', `${blockId}:${row?.id}`);
    precision.push({
      cueId: String(row?.id || ''),
      kind: 'PRECISION',
      anchor,
      sourceLocator: String(row?.source_locator || ''),
      task: String(row?.task || row?.micro_task || ''),
      raw: row
    });
  }

  for (const row of cueOwner?.raw?.visual_bindings || []) {
    if (row?.anchor?.block_id !== blockId) continue;
    const anchor = normalizeCueAnchor(row.anchor);
    if (anchor.logicGroupId && !groupIds.has(anchor.logicGroupId)) fail('CUE_LOGIC_GROUP_UNKNOWN', `${blockId}:${row?.id}`);
    const bundle = bundleByCue.get(row?.id) || null;
    visuals.push({
      cueId: String(row?.id || ''),
      kind: 'VISUAL_GATE',
      anchor,
      sourceLocator: String(row?.source_locator || ''),
      task: String(row?.task || ''),
      sourceAssets: (bundle?.assets || []).map((asset) => ({
        sourceObjectId: String(asset?.source_object_id || ''),
        sourcePage: Number(asset?.source_page || 0) || null,
        usageRole: String(asset?.usage_role || ''),
        usageLabel: String(asset?.usage_label || ''),
        alt: String(asset?.alt || ''),
        assetPath: String(asset?.asset_path || '')
      }))
    });
  }
  return { precision, visuals };
}

function extensionManifestPaths() {
  if (!exists(LEARNER_ROOT)) return [];
  return fs.readdirSync(absolute(LEARNER_ROOT))
    .filter((name) => name.endsWith(EXTENSION_SUFFIX))
    .map((name) => `${LEARNER_ROOT}/${name}`)
    .sort((a, b) => a.localeCompare(b));
}

function extensionRefsForBlock(blockId) {
  const refs = [];
  for (const manifestPath of extensionManifestPaths()) {
    const manifest = readJson(manifestPath);
    if (manifest?.status !== 'CURRENT' || !isChatApproved(manifest?.authority) || !Array.isArray(manifest?.assets)) continue;
    for (const asset of manifest.assets) {
      if (asset?.owner?.block_id !== blockId) continue;
      refs.push({
        manifestPath,
        slotId: String(asset?.slot_id || ''),
        revision: Number(asset?.revision || 0),
        assetType: String(asset?.asset_type || ''),
        title: String(asset?.title || ''),
        task: String(asset?.task || ''),
        cueId: String(asset?.cue_id || ''),
        owner: { ...asset.owner },
        displayPolicy: asset?.display_policy ? { ...asset.display_policy } : null,
        provenanceKind: String(asset?.provenance?.kind || ''),
        sourceLocator: String(asset?.provenance?.source_locator || '')
      });
    }
  }
  return refs;
}

function sharedOrientationForBlock(blockId) {
  if (!exists(SHARED_FIELDS)) return null;
  const raw = readJson(SHARED_FIELDS);
  if (!isChatApproved(raw?.authority)) fail('SHARED_FIELDS_AUTHORITY_INVALID');
  const orientation = raw?.block_fields?.[blockId]?.initial_orientation;
  if (!orientation || orientation?.status !== 'APPROVED') return null;
  return {
    minimalModel: String(orientation?.minimal_model || ''),
    reviewBasis: String(orientation?.review_basis || '')
  };
}

function normalizeAttention(blockSupport, cues, extensions, sharedOrientation) {
  return {
    currentProblem: String(blockSupport?.first_pass_focus || ''),
    stopLine: String(blockSupport?.stop_line || ''),
    recallSpine: String(blockSupport?.recall_spine || ''),
    minimalModel: String(sharedOrientation?.minimalModel || ''),
    carryNow: [
      ...(blockSupport?.first_pass_focus ? [{ kind: 'CURRENT_PROBLEM', text: String(blockSupport.first_pass_focus) }] : []),
      ...(sharedOrientation?.minimalModel ? [{ kind: 'MINIMAL_MODEL', text: String(sharedOrientation.minimalModel) }] : [])
    ],
    supportOnDemand: [
      ...cues.precision.map((cue) => ({ kind: 'PRECISION', ref: cue.cueId })),
      ...cues.visuals.map((cue) => ({ kind: 'VISUAL_GATE', ref: cue.cueId })),
      ...extensions.map((asset) => ({ kind: 'EXTENSION', ref: asset.slotId, timing: asset?.displayPolicy?.timing || '' }))
    ],
    canDefer: [],
    laterConnections: []
  };
}

function failClosedTtsx() {
  return {
    status: 'UNBOUND_FAIL_CLOSED',
    releasePolicy: 'BOUNDARY_WHEN_REVIEWED_BINDING_WHICH',
    surfaceOwner: 'ORIGINAL_LECTURE_MARGINNOTE',
    kianosRole: 'BOUNDARY_RELEASE_COMPLETION_AND_OPTIONAL_NOTE_ONLY',
    bindingOwner: null,
    checkpoints: [],
    questionIds: []
  };
}

function kpCountForBlock(routeRow, blockSupport, logicGroupsSource) {
  const candidates = [routeRow?.kp, routeRow?.kp_count, blockSupport?.kp_count];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isInteger(n) && n > 0) return n;
  }

  let maxOrdinal = 0;
  for (const group of Object.values(logicGroupsSource || {})) {
    if (Array.isArray(group?.kp_members)) {
      maxOrdinal = Math.max(maxOrdinal, ...group.kp_members.map(Number).filter(Number.isFinite));
    } else if (Array.isArray(group?.kp)) {
      maxOrdinal = Math.max(maxOrdinal, Number(group.kp[1]) || 0);
    }
  }
  if (maxOrdinal > 0) return maxOrdinal;
  fail('BLOCK_KP_COUNT_MISSING', routeRow?.id || 'unknown');
}

function buildSemanticBlock(record, learningOwner, routeRow, cueOwner, sourceVisualOwner) {
  const blockId = routeRow.id;
  const blockSupport = learningOwner.raw.blocks?.[blockId];
  if (!blockSupport) fail('BLOCK_LEARNING_SUPPORT_MISSING', blockId);
  const kpCount = kpCountForBlock(routeRow, blockSupport, blockSupport.logic_groups);
  const canonical = blockSupport.knowledge_owner ? loadXizongBlock(record.identity.systemId, blockId) : null;
  const logicGroups = canonical ? canonical.logicGroups.map(({ start, end, kpIds, ...group }) => group)
    : normalizeAcceptedLogicGroups({ system: record.raw, blockId, blockSupport, kpCount });
  const sourceContact = normalizeSourceContact(learningOwner.raw, blockSupport, blockId, logicGroups);
  const learnerCapabilities = postChatRetrievalPolicy(learningOwner.raw);
  if (learningOwner.schemaFamily === 'TOP_LEVEL_LOGIC_GROUPS_WITH_CONTENT_REALIZATION') {
    const acceptedToStable = new Map(Object.entries(learningOwner.blockKeyMap || {}).map(([stableId, acceptedKey]) => [String(acceptedKey), String(stableId)]));
    sourceContact.hardReadinessBlockIds = (sourceContact.hardReadiness || []).map((ref) => acceptedToStable.get(String(ref)) || String(ref));
    sourceContact.requiredPriorBlockIds = (sourceContact.requiredPriorOwners || []).map((ref) => acceptedToStable.get(String(ref)) || String(ref));
  } else {
    sourceContact.hardReadinessBlockIds = [];
    sourceContact.requiredPriorBlockIds = [];
  }
  const retrievalPoints = normalizeRetrieval(logicGroups, sourceContact);
  const cues = normalizeBlockCues(blockId, logicGroups, cueOwner, sourceVisualOwner);
  const extensionRefs = extensionRefsForBlock(blockId);
  const sharedOrientation = canonical ? (canonical.knowledge.orientation_view
    ? { minimalModel: resolveXizongKnowledgeView(canonical, canonical.knowledge.orientation_view), reviewBasis: canonical.sourcePath } : null)
    : sharedOrientationForBlock(blockId);

  return {
    blockId,
    label: String(routeRow?.label || blockSupport?.label || blockSupport?.title || blockId),
    title: String(routeRow?.title || blockSupport?.title || blockId),
    kpCount,
    logicGroups,
    sourceContact,
    learnerCapabilities,
    retrievalPoints,
    ttsx: failClosedTtsx(),
    attention: normalizeAttention(blockSupport, cues, extensionRefs, sharedOrientation),
    visualGates: cues.visuals,
    precisionCues: cues.precision,
    extensionRefs,
    learning: {
      firstPassFocus: String(blockSupport?.first_pass_focus || ''),
      stopLine: String(blockSupport?.stop_line || ''),
      recallSpine: String(blockSupport?.recall_spine || '')
    }
  };
}

function attachBRequiredModelReadiness(record, learningOwner, blocks) {
  if (record.identity.systemId !== 'digestive-metabolic-endocrine-tumor' || record.identity.canonicalId !== 'B') return;
  const learning = learningOwner.raw;
  const policy = learning.readiness_execution_policy;
  if (policy?.status !== 'CURRENT' || policy.authority !== 'USER_CONFIRMED_TARGET_MODEL_READINESS_2026_10_06' || policy.continuation !== 'EXPLICIT_USER_CURRENT_TARGET_ONLY'
    || policy.required_model_owner !== 'blocks[block_id].readiness.requires') fail('B_READINESS_POLICY_INVALID');
  // Resolve native files through the existing loader. The conservative byte
  // witnesses invalidate navigation permission; they never certify Knowledge.
  const canonical = loadXizongSystem(record.identity.systemId);
  const native = new Map(canonical.blocks.map(block => [block.blockId, block]));
  const digest = value => crypto.createHash('sha256').update(value).digest('hex');
  const bytes = new Map(canonical.blocks.map(block => [block.blockId, digest(readText(block.sourcePath))]));
  for (const block of blocks) {
    const support = learning.blocks[block.blockId];
    const readiness = support.readiness;
    if (!Array.isArray(readiness?.requires) || readiness.requires.some(ref => typeof ref !== 'string' || !ref.trim())
      || new Set(readiness.requires).size !== readiness.requires.length) fail('B_READINESS_REQUIRES_INVALID', block.blockId);
    if (JSON.stringify(learning.system_route?.readiness?.[block.blockId]?.requires) !== JSON.stringify(readiness.requires)) {
      fail('B_READINESS_OWNER_DRIFT', block.blockId);
    }
    const gates = Array.isArray(readiness.independent_gates) ? readiness.independent_gates : [];
    const groupIds = new Set(block.logicGroups.map(group => group.groupId));
    const gateRefs = new Set();
    const independentGates = gates.map(gate => {
      const refs = readiness[gate?.source_field];
      const scope = gate?.logic_group_ids;
      const ref = `${gate?.source_field}:${gate?.source_text}`;
      if (gate?.gate !== 'Tumor Gate' || !['requires', 'reactivates'].includes(gate.source_field)
        || !Array.isArray(refs) || !refs.includes(gate.source_text) || gateRefs.has(ref)
        || gate.criteria_owner !== 'system_route.tumor_gate'
        || gate.external_owner !== learning.cross_system_handoff?.formal_target_owners?.tumor_general
        || !Array.isArray(scope) || !scope.length || new Set(scope).size !== scope.length
        || scope.some(id => !groupIds.has(id))) fail('B_INDEPENDENT_GATE_BINDING_INVALID', block.blockId);
      gateRefs.add(ref);
      return {
        label: gate.gate, sourceField: gate.source_field, sourceText: gate.source_text,
        logicGroupIds: [...scope], criteriaOwner: `${learningOwner.sourcePath}#/system_route/tumor_gate`,
        criteria: { ...learning.system_route.tumor_gate }, externalOwner: gate.external_owner,
        // No accepted executable O9 model-availability binding exists. A user
        // model confirmation cannot manufacture it or close this compound gate.
        status: 'HOLD_EXTERNAL_EVIDENCE_BINDING_REQUIRED'
      };
    });
    for (const field of ['requires', 'reactivates']) {
      for (const ref of readiness[field] || []) {
        if ((ref === 'Tumor Gate' || String(ref).startsWith('Tumor Gate ')) && !gateRefs.has(`${field}:${ref}`)) {
          fail('B_INDEPENDENT_GATE_UNBOUND', `${block.blockId}:${ref}`);
        }
      }
    }
    for (const group of block.logicGroups) {
      const conflict = support.logic_groups?.[group.groupId]?.source_conflict;
      if (conflict === undefined) continue;
      const nativeBlock = loadXizongBlock(record.identity.systemId, block.blockId);
      const members = group.kpOrdinals.map(ordinal => nativeBlock.kpRecords.find(kp => kp.ordinal === ordinal)?.kpId);
      if (conflict?.status !== 'HOLD' || !conflict.note || !Array.isArray(conflict.source_refs) || !conflict.source_refs.length
        || members.some(id => !id) || JSON.stringify(conflict.kp_ids) !== JSON.stringify(members)) {
        fail('B_SOURCE_CONFLICT_BINDING_INVALID', `${block.blockId}:${group.groupId}`);
      }
      independentGates.push({ label: 'Source conflict', logicGroupIds: [group.groupId], kpIds: [...members],
        status: 'HOLD_SOURCE_CONFLICT', note: conflict.note, sourceRefs: conflict.source_refs,
        criteriaOwner: `${learningOwner.sourcePath}#/blocks/${block.blockId}/logic_groups/${group.groupId}/source_conflict` });
    }
    const requirements = readiness.requires.filter(ref => !gateRefs.has(`requires:${ref}`)).map(ref => {
      const model = native.get(ref);
      if (model) {
        const modelSupport = learning.blocks[ref];
        return { sourceText: ref, ownerPath: model.sourcePath, blockId: ref, label: `${ref} · ${model.title}`,
          modelPrompt: String(modelSupport.first_pass_focus || ''),
          modelScope: String(modelSupport.stop_line || ''),
          sourceWitness: bytes.get(ref), learningWitness: digest(JSON.stringify(modelSupport)),
          href: `/xizong/${record.identity.systemId}/${model.slug}/` };
      }
      if (/^[DMG]\d+$/i.test(ref)) fail('B_READINESS_MODEL_REF_INVALID', `${block.blockId}:${ref}`);
      const routes = (learning.cross_system_handoff?.explicit_routes || []).filter(route => route.from === block.blockId);
      return { sourceText: ref, ownerPath: learningOwner.sourcePath, blockId: null, label: ref, modelPrompt: ref,
        // Preserve only the accepted System-level routing precision. These are
        // model descriptions, not new finer owner/state/evidence identities.
        externalOwners: routes.map(route => ({ ownerPath: route.target_owner, granularity: route.granularity, concept: route.concept,
          sourceWitness: exists(`${route.target_owner}system.json`) ? digest(readText(`${route.target_owner}system.json`)) : null })) };
    });
    const witness = digest(JSON.stringify({ policy, target: block.blockId, targetSource: bytes.get(block.blockId),
      readiness, targetModel: [support.first_pass_focus, support.stop_line, support.recall_spine], requirements,
      handoff: learning.cross_system_handoff, tumor: learning.system_route.tumor_gate }));
    block.sourceContact.requiredModelReadiness = {
      ownerPath: learningOwner.sourcePath, targetBlockId: block.blockId, requirements,
      witness, confirmation: 'EXPLICIT_USER_CURRENT_TARGET_ONLY',
      sourceEncounterBeforeReadiness: block.sourceContact.mode === 'CONSUME_GLOBAL_BIOCHEMISTRY_SOURCE_MAP_CURRENT'
    };
    block.sourceContact.independentReadinessGates = independentGates;
  }
}

export function loadXizongSemanticSystem(systemId) {
  if (BUILD_CACHE_ENABLED && semanticSystemCache.has(systemId)) return semanticSystemCache.get(systemId);
  const record = findSystemRecord(systemId);
  const learningOwner = loadLearningOwner(record);
  const cueOwner = loadLearningCues(record);
  const sourceVisualOwner = loadSourceVisuals(record);
  const blocks = record.route.map((routeRow) => buildSemanticBlock(record, learningOwner, routeRow, cueOwner, sourceVisualOwner));
  attachBRequiredModelReadiness(record, learningOwner, blocks);
  for (const block of blocks) block.learnerCapabilities = {
    ...block.learnerCapabilities,
    modelReadinessRequired: Boolean(block.sourceContact?.requiredModelReadiness),
    independentReadinessGates: Array.isArray(block.sourceContact?.independentReadinessGates) && block.sourceContact.independentReadinessGates.length > 0
  };

  const kpCount = blocks.reduce((sum, block) => sum + block.kpCount, 0);
  const logicGroupCount = blocks.reduce((sum, block) => sum + block.logicGroups.length, 0);
  const expectedBlocks = Number(learningOwner.raw?.identity?.stable_block_count || blocks.length);
  const expectedKp = Number(learningOwner.raw?.identity?.stable_kp_count || kpCount);
  const expectedGroups = Number(learningOwner.raw?.identity?.logic_group_count || logicGroupCount);
  if (expectedBlocks !== blocks.length) fail('SYSTEM_BLOCK_COUNT_MISMATCH', `${systemId}:${blocks.length}/${expectedBlocks}`);
  if (expectedKp !== kpCount) fail('SYSTEM_KP_COUNT_MISMATCH', `${systemId}:${kpCount}/${expectedKp}`);
  if (expectedGroups !== logicGroupCount) fail('SYSTEM_LOGIC_GROUP_COUNT_MISMATCH', `${systemId}:${logicGroupCount}/${expectedGroups}`);

  const result = {
    schema: XIZONG_SEMANTIC_ADAPTER_SCHEMA,
    systemId: record.identity.systemId,
    canonicalId: record.identity.canonicalId,
    title: record.identity.title,
    identity: {
      blockCount: blocks.length,
      kpCount,
      logicGroupCount
    },
    ownerPaths: {
      knowledge: record.sourcePath,
      learning: learningOwner.sourcePath,
      content: learningOwner.contentSourcePath,
      learningShards: [...learningOwner.shardPaths],
      cues: cueOwner?.sourcePath || null,
      sourceVisuals: sourceVisualOwner?.sourcePath || null
    },
    sourceContactPolicy: {
      mode: learningOwner.schemaFamily === 'TOP_LEVEL_LOGIC_GROUPS_WITH_CONTENT_REALIZATION'
        ? (new Set(blocks.map((block) => block.sourceContact.mode)).size === 1
          ? blocks[0]?.sourceContact?.mode
          : 'MIXED_BY_BLOCK')
        : sourceContactMode(learningOwner.raw),
      surfaceOwner: 'ORIGINAL_LECTURE_MARGINNOTE'
    },
    ttsxPolicy: failClosedTtsx(),
    blocks
  };
  if (BUILD_CACHE_ENABLED) semanticSystemCache.set(systemId, result);
  return result;
}

export function loadXizongSemanticBlock(systemId, blockId) {
  const system = loadXizongSemanticSystem(systemId);
  const block = system.blocks.find((row) => row.blockId === blockId);
  if (!block) fail('BLOCK_NOT_FOUND', `${systemId}:${blockId}`);
  return { system, block };
}
