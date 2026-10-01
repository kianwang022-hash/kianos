import { marked } from 'marked';
import { listProjectableXizongSystems, loadXizongBlock } from '../../../../lib/xizong.mjs';
import { projectKpCore } from '../../../../lib/xizongProjection.mjs';
import { resolveXizongLearnerProjection } from '../../../../lib/xizongLearnerProjection.mjs';
import { buildXizongMemoryReleaseDescriptorFromLearnerObject } from '../../../../lib/xizongMemoryRelease.mjs';

// Derived per-Block transport, not another content owner. Reuse the same Current
// resolver and Core projection as the Block route, including strict asset guards.
export function getStaticPaths() {
  return listProjectableXizongSystems().flatMap((system) => system.blocks.map((block) => ({
    params: { blockId: block.blockId },
    props: { systemId: system.systemId, blockSlug: block.slug }
  })));
}

export function GET({ props }) {
  const block = loadXizongBlock(props.systemId, props.blockSlug);
  const { learnerObject } = resolveXizongLearnerProjection(block, {
    enrichBlock: (productionBlock) => ({
      ...productionBlock,
      kpRecords: productionBlock.kpRecords.map((kp) => ({
        ...kp, detailHtml: marked.parse(projectKpCore(kp.detailMarkdown), { gfm: true })
      }))
    })
  });
  return new Response(JSON.stringify(buildXizongMemoryReleaseDescriptorFromLearnerObject(learnerObject)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
