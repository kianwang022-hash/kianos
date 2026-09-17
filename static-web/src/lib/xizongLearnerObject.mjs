export const XIZONG_LEARNER_OBJECT_SCHEMA = 'kianos.xizong.learner_object.v1';

function fail(code, detail = '') {
  throw new Error(`CURRENT_XIZONG_LEARNER_OBJECT_${code}${detail ? `:${detail}` : ''}`);
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value || '');
}

function byAnchor(rows, field, value) {
  if (!value) return [];
  return array(rows).filter((row) => row?.anchor?.[field] === value);
}

function extensionsByOwner(rows, field, value) {
  if (!value) return [];
  return array(rows).filter((row) => row?.owner?.[field] === value);
}

function normalizeCue(row, kind) {
  return {
    id: text(row?.id || row?.cueId),
    kind,
    anchor: row?.anchor ? { ...row.anchor } : {},
    cue: text(row?.cue || row?.task || row?.micro_task),
    task: text(row?.task || row?.micro_task),
    sourceLocator: text(row?.source_locator || row?.sourceLocator),
    sourceVisualBundle: row?.source_visual_bundle || null,
    answerHtml: text(row?.answerHtml || row?.answer_html || row?.raw?.answerHtml || row?.raw?.answer_html),
    raw: row
  };
}

function normalizeExtension(row) {
  return {
    id: text(row?.slot_id || row?.slotId),
    revision: Number(row?.revision || 0) || null,
    kind: 'EXTENSION',
    assetType: text(row?.asset_type || row?.assetType),
    title: text(row?.title),
    task: text(row?.task),
    caption: text(row?.caption),
    owner: row?.owner ? { ...row.owner } : {},
    cueId: text(row?.cue_id || row?.cueId),
    displayPolicy: row?.display_policy ? { ...row.display_policy } : (row?.displayPolicy ? { ...row.displayPolicy } : null),
    provenance: row?.provenance ? { ...row.provenance } : null,
    payload: row?.payload || null,
    src: row?.src || '',
    raw: row
  };
}

function normalizeConnection(row, direction) {
  const endpoint = direction === 'incoming' ? row?.target : row?.source;
  const other = direction === 'incoming' ? row?.source : row?.target;
  return {
    id: text(row?.id),
    kind: 'CONNECTION',
    direction,
    reserveLearning: row?.reserveLearning === true || row?.reserve_learning === true,
    cue: text(endpoint?.cue),
    endpoint: endpoint ? { ...endpoint } : {},
    other: other ? { ...other } : {},
    raw: row
  };
}

function connectionRowsForOwner(pathways, owner, value) {
  const outgoing = array(pathways?.outgoing)
    .filter((row) => row?.source?.[owner] === value)
    .map((row) => normalizeConnection(row, 'outgoing'));
  const incoming = array(pathways?.incoming)
    .filter((row) => row?.target?.[owner] === value)
    .map((row) => normalizeConnection(row, 'incoming'));
  return { incoming, outgoing };
}

function uniqueIds(rows, label) {
  const ids = rows.map((row) => row?.id).filter(Boolean);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail('DUPLICATE_ASSET_ID', `${label}:${id}`);
    seen.add(id);
  }
}

function learnSteps(object) {
  const phases = [
    ['core', Boolean(object.core?.markdown || object.core?.html), ['core']],
    ['detail', false, []],
    ['precision', object.precision.length > 0, object.precision.map((row) => `precision:${row.id}`)],
    ['extension', object.extension.length > 0, object.extension.map((row) => `extension:${row.id}`)],
    ['connection', object.connection.incoming.length + object.connection.outgoing.length > 0, [
      ...object.connection.incoming.map((row) => `connection:${row.id}`),
      ...object.connection.outgoing.map((row) => `connection:${row.id}`)
    ]],
    ['visual', object.visual.length > 0, object.visual.map((row) => `visual:${row.id}`)]
  ];
  return phases.map(([phase, available, refs]) => ({ phase, available: Boolean(available), refs }));
}

function recallProjection(object) {
  const postRevealRefs = [];
  if (object.core?.markdown || object.core?.html) postRevealRefs.push('core');
  if (object.precision.length) postRevealRefs.push('precision');
  if (object.visual.length) postRevealRefs.push('visual');
  if (object.extension.length) postRevealRefs.push('extension');
  if (object.connection.incoming.length || object.connection.outgoing.length) postRevealRefs.push('connection');
  return {
    front: {
      identity: {
        kpId: object.identity.kpId,
        displayId: object.identity.displayId,
        logicGroupId: object.identity.logicGroupId,
        groupLabel: object.identity.groupLabel
      },
      prompt: object.prompt
    },
    postRevealRefs
  };
}

function assertAnchorIntegrity(block, learningCues, extensionAssets) {
  const kpIds = new Set(array(block?.kpRecords).map((kp) => kp.kpId));
  const groupIds = new Set(array(block?.logicGroups).map((group) => group.groupId));
  const cueRows = [...array(learningCues?.precision), ...array(learningCues?.visuals)];
  for (const row of cueRows) {
    if (row?.anchor?.block_id && row.anchor.block_id !== block.blockId) fail('CUE_BLOCK_MISMATCH', text(row?.id));
    if (row?.anchor?.kp_id && !kpIds.has(row.anchor.kp_id)) fail('CUE_KP_UNKNOWN', `${text(row?.id)}:${row.anchor.kp_id}`);
    if (row?.anchor?.logic_group_id && !groupIds.has(row.anchor.logic_group_id)) fail('CUE_GROUP_UNKNOWN', `${text(row?.id)}:${row.anchor.logic_group_id}`);
  }
  for (const row of array(extensionAssets)) {
    if (row?.owner?.block_id !== block.blockId) fail('EXTENSION_BLOCK_MISMATCH', text(row?.slot_id));
    if (row?.owner?.kp_id && !kpIds.has(row.owner.kp_id)) fail('EXTENSION_KP_UNKNOWN', `${text(row?.slot_id)}:${row.owner.kp_id}`);
    if (row?.owner?.logic_group_id && !groupIds.has(row.owner.logic_group_id)) fail('EXTENSION_GROUP_UNKNOWN', `${text(row?.slot_id)}:${row.owner.logic_group_id}`);
  }
}

function buildKpObject(block, kp, learningCues, extensionAssets, pathways) {
  const precision = byAnchor(learningCues?.precision, 'kp_id', kp.kpId).map((row) => normalizeCue(row, 'PRECISION'));
  const visual = byAnchor(learningCues?.visuals, 'kp_id', kp.kpId).map((row) => normalizeCue(row, 'VISUAL'));
  const extension = extensionsByOwner(extensionAssets, 'kp_id', kp.kpId).map(normalizeExtension);
  const connection = connectionRowsForOwner(pathways, 'kp_id', kp.kpId);
  uniqueIds(precision, `${kp.kpId}:precision`);
  uniqueIds(visual, `${kp.kpId}:visual`);
  uniqueIds(extension, `${kp.kpId}:extension`);

  const object = {
    schema: XIZONG_LEARNER_OBJECT_SCHEMA,
    objectType: 'KP',
    identity: {
      systemId: text(block?.systemId),
      canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
      blockId: text(block?.blockId),
      blockLabel: text(block?.label),
      logicGroupId: text(kp?.groupId),
      groupLabel: text(kp?.groupLabel),
      kpId: text(kp?.kpId),
      displayId: text(kp?.displayId),
      title: text(kp?.title)
    },
    prompt: {
      canonical: text(kp?.prompt)
    },
    core: {
      markdown: text(kp?.detailMarkdown),
      html: text(kp?.detailHtml),
      answerBearing: true
    },
    source: {
      locator: text(kp?.sourceLocator)
    },
    outline: {
      locator: text(kp?.outlineLocator)
    },
    precision,
    visual,
    extension,
    connection
  };
  object.learnSteps = learnSteps(object);
  object.recall = recallProjection(object);
  return object;
}

function buildGroupObject(block, group, kpObjects, learningCues, extensionAssets, pathways) {
  const precision = byAnchor(learningCues?.precision, 'logic_group_id', group.groupId).map((row) => normalizeCue(row, 'PRECISION'));
  const visual = byAnchor(learningCues?.visuals, 'logic_group_id', group.groupId).map((row) => normalizeCue(row, 'VISUAL'));
  const extension = extensionsByOwner(extensionAssets, 'logic_group_id', group.groupId).map(normalizeExtension);
  const connection = connectionRowsForOwner(pathways, 'logic_group_id', group.groupId);
  const kpIds = array(group?.kpIds);
  const groupKps = kpIds.map((kpId) => kpObjects.find((kp) => kp.identity.kpId === kpId));
  if (groupKps.some((kp) => !kp)) fail('GROUP_KP_UNRESOLVED', group.groupId);
  return {
    schema: XIZONG_LEARNER_OBJECT_SCHEMA,
    objectType: 'LOGIC_GROUP',
    identity: {
      systemId: text(block?.systemId),
      blockId: text(block?.blockId),
      logicGroupId: text(group?.groupId),
      label: text(group?.label),
      order: Number(group?.order || 0) || null
    },
    goal: text(group?.goal),
    closure: text(group?.closure),
    kpIds,
    precision,
    visual,
    extension,
    connection,
    slots: {
      prelearn: {
        visual,
        connection: connection.incoming,
        extension: extension.filter((row) => row?.displayPolicy?.timing !== 'POST_REVEAL')
      },
      postlearn: {
        precision,
        connection: connection.outgoing,
        extension: extension.filter((row) => row?.displayPolicy?.timing === 'POST_REVEAL')
      }
    }
  };
}

export function buildXizongLearnerObject({
  block,
  learningCues = null,
  extensionAssets = [],
  pathways = null
} = {}) {
  if (!block?.blockId) fail('BLOCK_REQUIRED');
  assertAnchorIntegrity(block, learningCues, extensionAssets);

  const canonicalKps = array(block.kpRecords);
  const kpIds = canonicalKps.map((kp) => text(kp?.kpId));
  if (kpIds.some((id) => !id)) fail('KP_ID_MISSING', block.blockId);
  if (new Set(kpIds).size !== kpIds.length) fail('KP_ID_DUPLICATE', block.blockId);

  const kpObjects = canonicalKps.map((kp) => buildKpObject(block, kp, learningCues, extensionAssets, pathways));
  const groups = array(block.logicGroups).map((group) => buildGroupObject(block, group, kpObjects, learningCues, extensionAssets, pathways));
  const groupedIds = groups.flatMap((group) => group.kpIds);
  if (groupedIds.length !== kpIds.length || new Set(groupedIds).size !== kpIds.length || kpIds.some((id) => !groupedIds.includes(id))) {
    fail('KP_GROUP_COVERAGE_MISMATCH', block.blockId);
  }

  const blockExtensions = array(extensionAssets)
    .filter((row) => row?.owner?.block_id === block.blockId && !row?.owner?.logic_group_id && !row?.owner?.kp_id)
    .map(normalizeExtension);

  return {
    schema: XIZONG_LEARNER_OBJECT_SCHEMA,
    objectType: 'BLOCK',
    identity: {
      systemId: text(block?.systemId),
      canonicalId: text(block?.systemCanonicalId || block?.canonicalId),
      blockId: text(block?.blockId),
      blockLabel: text(block?.label),
      title: text(block?.title)
    },
    framework: {
      centerQuestion: text(block?.centerQuestion),
      firstPassFocus: text(block?.firstPassFocus || block?.attention?.currentProblem),
      stopLine: text(block?.stopLine || block?.attention?.stopLine),
      recallSpine: text(block?.recallSpine || block?.attention?.recallSpine),
      cognitiveProjection: block?.cognitiveProjection || null
    },
    sourceContact: block?.sourceContact || null,
    blockExtension: blockExtensions,
    logicGroups: groups,
    kps: kpObjects,
    slots: {
      blockOrientation: blockExtensions,
      logicGroupPrelearn: Object.fromEntries(groups.map((group) => [group.identity.logicGroupId, group.slots.prelearn])),
      logicGroupPostlearn: Object.fromEntries(groups.map((group) => [group.identity.logicGroupId, group.slots.postlearn])),
      kpLearnAux: Object.fromEntries(kpObjects.map((kp) => [kp.identity.kpId, {
        visual: kp.visual,
        precision: kp.precision,
        extension: kp.extension,
        connection: [...kp.connection.incoming, ...kp.connection.outgoing]
      }])),
      kpRecallPostReveal: Object.fromEntries(kpObjects.map((kp) => [kp.identity.kpId, {
        core: kp.core,
        visual: kp.visual,
        precision: kp.precision,
        extension: kp.extension,
        connection: [...kp.connection.incoming, ...kp.connection.outgoing]
      }]))
    }
  };
}

export function validateXizongLearnerObject(object) {
  if (object?.schema !== XIZONG_LEARNER_OBJECT_SCHEMA || object?.objectType !== 'BLOCK') fail('SCHEMA_INVALID');
  const kpIds = array(object.kps).map((kp) => kp?.identity?.kpId);
  if (!kpIds.length || new Set(kpIds).size !== kpIds.length) fail('KP_SET_INVALID', object?.identity?.blockId);
  for (const kp of object.kps) {
    const front = kp?.recall?.front || {};
    const forbiddenFrontKeys = ['core', 'precision', 'visual', 'extension', 'connection', 'title'];
    if (forbiddenFrontKeys.some((key) => Object.prototype.hasOwnProperty.call(front, key))) {
      fail('RECALL_FRONT_LEAK', `${kp.identity.kpId}:${forbiddenFrontKeys.find((key) => Object.prototype.hasOwnProperty.call(front, key))}`);
    }
    if (front?.identity?.title) fail('RECALL_FRONT_TITLE_LEAK', kp.identity.kpId);
    const expected = [];
    if (kp.core?.markdown || kp.core?.html) expected.push('core');
    if (kp.precision?.length) expected.push('precision');
    if (kp.visual?.length) expected.push('visual');
    if (kp.extension?.length) expected.push('extension');
    if (kp.connection?.incoming?.length || kp.connection?.outgoing?.length) expected.push('connection');
    if (expected.join('|') !== array(kp?.recall?.postRevealRefs).join('|')) fail('POST_REVEAL_REF_MISMATCH', kp.identity.kpId);
  }
  return {
    ok: true,
    blockId: object.identity.blockId,
    kpCount: object.kps.length,
    logicGroupCount: object.logicGroups.length,
    kpVisualCount: object.kps.reduce((sum, kp) => sum + kp.visual.length, 0),
    kpPrecisionCount: object.kps.reduce((sum, kp) => sum + kp.precision.length, 0),
    extensionCount: object.blockExtension.length + object.logicGroups.reduce((sum, group) => sum + group.extension.length, 0) + object.kps.reduce((sum, kp) => sum + kp.extension.length, 0)
  };
}
