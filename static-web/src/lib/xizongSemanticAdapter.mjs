import fs from 'node:fs';
import path from 'node:path';
import { normalizeAcceptedLearningOwner, normalizeAcceptedLogicGroups, expandAcceptedOrdinalRange as expandRange } from './xizongAcceptedLearningOwner.mjs';

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
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function normalizeRouteRow(value) {
  if (typeof value === 'string' && value.trim()) return { id: value.trim() };
  if (value && typeof value === 'object' && !Array.isArray(value) && value.id) {
    return { ...value, id: String(value.id) };
  }
  return null;
}

function flattenGroupedRoute(rows) {
  const route = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!Array.isArray(row?.blocks)) continue;
    for (const block of row.blocks) {
      const normalized = normalizeRouteRow(block);
      if (normalized) route.push(normalized);
    }
  }
  return route;
}

function systemBlockRoute(raw) {
  const direct = (Array.isArray(raw?.block_route) ? raw.block_route : [])
    .filter((row) => row && !Array.isArray(row?.blocks))
    .map(normalizeRouteRow)
    .filter(Boolean);
  const grouped = flattenGroupedRoute(raw?.block_route);
  const familyFallback = flattenGroupedRoute(raw?.block_families);
  const route = direct.length ? direct : (grouped.length ? grouped : familyFallback);
  const ids = route.map((row) => row.id);
  if (new Set(ids).size !== ids.length) fail('SYSTEM_BLOCK_ROUTE_DUPLICATE', ids.join(','));
  return route;
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

function walkJsonFiles(relativeDir) {
  if (!exists(relativeDir)) return [];
  const out = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(absolute(dir), { withFileTypes: true })) {
      const child = `${dir}/${entry.name}`;
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && /\.json$/i.test(entry.name)) out.push(child);
    }
  };
  visit(relativeDir);
  return out.sort((a, b) => a.localeCompare(b));
}

function hydrateShardedLearningOwner(basePath, owner) {
  if (owner?.blocks && Object.keys(owner.blocks).length) return { owner, shardPaths: [] };

  const shardRoot = basePath.replace(/\.json$/i, '');
  const shardPaths = walkJsonFiles(shardRoot);
  if (!shardPaths.length) return { owner, shardPaths: [] };

  const blocks = {};
  const acceptedShards = [];
  for (const shardPath of shardPaths) {
    const shard = readJson(shardPath);
    if (shard?.system_id !== owner.system_id || shard?.canonical_id !== owner.canonical_id || !shard?.blocks) continue;
    if (!isChatApproved(shard?.authority)) fail('LEARNING_SHARD_AUTHORITY_INVALID', shardPath);
    for (const [blockId, block] of Object.entries(shard.blocks)) {
      if (blocks[blockId]) fail('LEARNING_SHARD_BLOCK_DUPLICATE', blockId);
      blocks[blockId] = block;
    }
    acceptedShards.push(shardPath);
  }

  if (!Object.keys(blocks).length) return { owner, shardPaths: [] };
  return { owner: { ...owner, blocks }, shardPaths: acceptedShards };
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

  const hydrated = hydrateShardedLearningOwner(sourcePath, base);
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
  const logicGroups = normalizeAcceptedLogicGroups({ system: record.raw, blockId, blockSupport, kpCount });
  const sourceContact = normalizeSourceContact(learningOwner.raw, blockSupport, blockId, logicGroups);
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
  const sharedOrientation = sharedOrientationForBlock(blockId);

  return {
    blockId,
    label: String(routeRow?.label || blockSupport?.label || blockSupport?.title || blockId),
    title: String(routeRow?.title || blockSupport?.title || blockId),
    kpCount,
    logicGroups,
    sourceContact,
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

export function loadXizongSemanticSystem(systemId) {
  if (BUILD_CACHE_ENABLED && semanticSystemCache.has(systemId)) return semanticSystemCache.get(systemId);
  const record = findSystemRecord(systemId);
  const learningOwner = loadLearningOwner(record);
  const cueOwner = loadLearningCues(record);
  const sourceVisualOwner = loadSourceVisuals(record);
  const blocks = record.route.map((routeRow) => buildSemanticBlock(record, learningOwner, routeRow, cueOwner, sourceVisualOwner));

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
