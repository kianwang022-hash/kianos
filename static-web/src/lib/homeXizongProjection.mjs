// Derived Home transport only. Canonical Xizong truth remains with content/xizong
// and the existing Xizong runtime owners. This projection exists so a Home UI
// render never has to reconstruct all Xizong blocks before first paint.
import {
  buildXizongForecastCanonicalScope,
  listCurrentXizongSystemIdentities,
  listProjectableXizongSystems,
  loadXizongBlock
} from './xizong.mjs';
import { buildXizongForecastQuestionScope } from './xizongQuestions.mjs';
import { buildXizongProductionBlock } from './xizongProductionProjection.mjs';

export const HOME_XIZONG_PROJECTION_SCHEMA = 'kianos.home.xizong_projection.v1';

export function buildHomeXizongProjection() {
  const systems = listProjectableXizongSystems();
  const xizongForecastQuestionScope = buildXizongForecastQuestionScope(
    listCurrentXizongSystemIdentities()
  );
  const xizongPacketIndex = systems.flatMap((system) => system.blocks.map((blockRef) => {
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
  const xizongForecastCanonicalScope = buildXizongForecastCanonicalScope(xizongPacketIndex);
  return {
    schema: HOME_XIZONG_PROJECTION_SCHEMA,
    xizongPacketIndex,
    xizongForecastQuestionScope,
    xizongForecastCanonicalScope
  };
}
