import { createHash } from 'node:crypto';
import { stripRevisionKpMetadata } from './xizongKpMetadata.mjs';
import { revisionStable } from './xizongContentRevision.mjs';
const hash = value => createHash('sha256').update(JSON.stringify(revisionStable(value))).digest('hex');
// Derived witnesses only. No copied medical text in System/Packet guards.
// Exclude only explicit presentation/provenance fields; all support meaning and
// unknown support fields remain significant (conservative, no model equivalence).
function support(value) {
  if (Array.isArray(value)) return value.map(support);
  if (!value || typeof value !== 'object') return value;
  if (value.relocationProvenance) {
    // Normalize only the precisely migrated cue's owner/reference packaging.
    // Reference digests are derived from CURRENT Core and exact item, never frozen.
    const { relocationProvenance, ...current } = value;
    if (!relocationProvenance.owner || !relocationProvenance.reference) throw new Error('CURRENT_XIZONG_RELOCATION_PROVENANCE_INVALID');
    return support({ ...current, prepared_memory_owner: relocationProvenance.owner,
      prepared_memory_ref: relocationProvenance.reference });
  }
  if (Array.isArray(value.assets) && 'sourceSha256' in value) {
    // Bind both the reviewed crop and the actual derived asset. A changed
    // derived image cannot be assumed to be only re-encoding. Ignore Vite's
    // URL, presentation dimensions, page locator and whole-PDF hash. Node and rendered consumers share this
    // exact identity; changed pixels/meaning still invalidate their owner.
    return { completenessPolicy:value.completenessPolicy, assets:value.assets.map(asset => ({
      sourceObjectId:asset.sourceObjectId, usageRole:asset.usageRole, usageLabel:asset.usageLabel, alt:asset.alt,
      sourceCropHash:asset.sourceCropSha256 || null, derivedAssetHash:asset.derivedAssetSha256 || asset.src
    })) };
  }
  return Object.fromEntries(Object.entries(value).filter(([k]) => !['sourceHash','source_hash','ownerHash','owner_hash','sourceLocator','source_locator','outlineLocator','ownerPath','sourcePath','lecturePageLabel','questionPageLabel','pageLabel','sourcePageLabel'].includes(k)).map(([k,v]) => [k,support(v)]));
}
function contactShape(contact, kps) {
  if (!contact) return contact;
  const shape = support(contact);
  // These Source fields are locators/navigation, not learned medical answers.
  delete shape.sourceName; delete shape.sourceMapOwner;
  shape.segments = (shape.segments || []).map(segment => {
    const row = { ...segment };
    delete row.label; delete row.pdf;
    if (row.kpOrdinals) { row.kpIds = row.kpOrdinals.map(n => kps[Number(n) - 1]?.identity.kpId || `UNRESOLVED:${n}`).sort(); delete row.kpOrdinals; }
    for (const key of ['logicGroupIds','contributesToLogicGroupIds','reactivateLogicGroupIds','postUnitClosureLogicGroupIds']) if (Array.isArray(row[key])) row[key] = [...row[key]].sort();
    return row;
  }).sort((a,b) => String(a.segmentId).localeCompare(String(b.segmentId)));
  return shape;
}
// The continuous model owns relationships as well as its KP positions. Only
// known locator/presentation packaging is neutral; ordinary text, conditions,
// arrows, formulas and stable KP identities remain significant.
function modelMeaning(markdown) {
  return String(markdown || '').replace(/\r\n/g, '\n')
    .replace(/<!-- b1:(node|external) (\{[^\n]+?\}) -->/g, (_, kind, json) => {
      const { canonical_line, ...identity } = JSON.parse(json);
      return `<!-- b1:${kind} ${JSON.stringify(identity)} -->`;
    })
    .replace(/<!-- b1:source \d+:\d+ -->/g, '<!-- b1:source -->')
    .replace(/<!-- (?:kianos:model-view [a-z-]+|\/kianos:model-view) -->\n?/g, '')
    .replace(/\]\((?:#[^\s)]+|[^\s)]+\.md\?plain=1#L\d+)\)/g, '](KNOWLEDGE_REF)')
    .replace(/<\/?details>|<\/?summary>/g, '');
}
export function buildXizongRevisionWitness(learner) {
  const kps = learner.kps || [], groups = learner.logicGroups || [];
  return { schema: 'kianos.xizong.content-revision-witness.v1', sourceHash: learner.sourceHash,
    kpOrder: kps.map(k => k.identity.kpId), groupOrder: groups.map(g => g.identity.logicGroupId),
    kps: Object.fromEntries(kps.map(k => [k.identity.kpId, hash({ core: stripRevisionKpMetadata(k.core?.markdown), precision: support(k.precision), visual: support(k.visual), extension: support(k.extension), connection: support(k.connection), attention: support(k.attention) })])),
    // A KP change alone does not prove a different LG closure task.
    groups: Object.fromEntries(groups.map(g => [g.identity.logicGroupId, hash({ goal:g.goal, closure:g.closure, precision:support(g.precision), visual:support(g.visual), extension:support(g.extension), connection:support(g.connection), visualRequired:g.visualRequired, visualSourceState:g.visualSourceState })])),
    segmentOrder: (learner.sourceContact?.segments || []).map(row => String(row.segmentId || row.segment_id || row.sourceUnitId || '')),
    members: Object.fromEntries(groups.map(g => [g.identity.logicGroupId, [...g.kpIds]])),
    block: hash({ recallSpine:learner.framework?.recallSpine, stopLine:learner.framework?.stopLine, extension:support(learner.blockExtension), connections:support(learner.slots?.blockConnections),
      ...(learner.model ? { model:modelMeaning(learner.model.markdown) } : {}) }),
    contact: hash(contactShape(learner.sourceContact, kps)) };
}

export function buildXizongSystemRecallWitness(system) {
  const recall = system.systemRecall || {};
  return { schema:'kianos.xizong.system-recall-witness.v1', sourceHash:system.sourceHash,
    model:hash({ mentalModel:system.mentalModel, coreVariables:system.coreVariables, coreRelations:system.coreRelations, failureModes:system.failureModes, judgmentAxes:system.judgmentAxes, reverseCase:recall.reverse_case_algorithm || recall.algorithm, freeReconstruction:recall.free_reconstruction, passCriterion:recall.pass_criterion }) };
}
