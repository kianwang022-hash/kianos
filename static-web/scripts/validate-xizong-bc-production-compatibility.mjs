import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listProjectableXizongSystems } from '../src/lib/xizong.mjs';
import { loadXizongSemanticBlock } from '../src/lib/xizongSemanticAdapter.mjs';
import {
  buildXizongProductionBlock,
  loadCompiledXizongProjectionAsset
} from '../src/lib/xizongProductionProjection.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const fail = (message) => { throw new Error(`XIZONG_BC_COMPATIBILITY_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const pad2 = (value) => String(value).padStart(2, '0');

function compatibilityCanonicalBlock(systemId, semanticBlock) {
  // This is deliberately not a learner/product route. It supplies only the stable
  // canonical shape required to execute the shared production presenter while
  // B/C retain their own scoped P/product-route acceptance gates.
  return {
    systemId,
    blockId: semanticBlock.blockId,
    objectId: `xizong-compat:${systemId}:${semanticBlock.blockId}`,
    label: semanticBlock.label,
    title: semanticBlock.title,
    systemTitle: systemId,
    sourcePath: 'COMPATIBILITY_ACCEPTANCE_ONLY_NO_PRODUCT_ROUTE',
    centerQuestion: semanticBlock.attention.currentProblem || semanticBlock.learning.firstPassFocus || semanticBlock.title,
    kpRecords: Array.from({ length: semanticBlock.kpCount }, (_, index) => {
      const ordinal = index + 1;
      return {
        ordinal,
        kpId: `${semanticBlock.blockId}-kp${pad2(ordinal)}`,
        displayId: `KP${pad2(ordinal)}`,
        title: '',
        prompt: '',
        sourceLocator: '',
        detailHtml: ''
      };
    })
  };
}

const manifest = readJson('content/xizong/projection/manifest.json');
const projectableIds = new Set(listProjectableXizongSystems().map((system) => system.systemId));
const blockUi = read('static-web/src/components/XizongBlockV6.astro');

// B compatibility after fresh P acceptance: preserve accepted whole-LG Source contact
// through the shared semantic presenter and require the real B product route to be
// projectable. R/E/U remain separate gates and are not promoted here.
const { block: semanticBD1 } = loadXizongSemanticBlock('digestive-metabolic-endocrine-tumor', 'D1');
const bProduction = buildXizongProductionBlock(
  compatibilityCanonicalBlock('digestive-metabolic-endocrine-tumor', semanticBD1)
);
assert(semanticBD1.sourceContact.mode === 'WHOLE_LOGIC_GROUP', `B:D1:semantic-source:${semanticBD1.sourceContact.mode}`);
assert(bProduction.sourceContact.mode === 'WHOLE_LOGIC_GROUP', `B:D1:production-source:${bProduction.sourceContact.mode}`);
assert(bProduction.sourceContact.logicGroupIsAutomaticSourceChunk === true, 'B:D1:whole-lg-flag-lost');
assert(bProduction.sourceContact.segments.length === bProduction.logicGroups.length, `B:D1:source-segments:${bProduction.sourceContact.segments.length}/${bProduction.logicGroups.length}`);
assert(bProduction.sourceContact.segments.every((segment, index) => segment.logicGroupIds?.[0] === bProduction.logicGroups[index]?.groupId), 'B:D1:source-segment-lg-drift');
assert(bProduction.retrievalPoints.every((point, index) => point.sourceContactBefore === `source:${bProduction.logicGroups[index].groupId}` && point.reopenSourceByDefault === true), 'B:D1:whole-lg-return-policy-lost');
assert(bProduction.cognitiveProjection.compiled === true, 'B:D1:compiled-projection-not-consumed');
assert(Boolean(loadCompiledXizongProjectionAsset('digestive-metabolic-endocrine-tumor', 'D1')?.asset), 'B:D1:compiled-asset-missing');
assert(JSON.stringify(bProduction.logicGroups[0].kpOrdinals) === JSON.stringify(semanticBD1.logicGroups[0].kpOrdinals), 'B:D1:membership-normalized');
assert(bProduction.cognitiveProjection.locationObjects.some((row) => row.role === 'MAP'), 'B:D1:semantic-lg-map-not-renderable');
assert(manifest.validation?.eligibility_accounting?.compiled?.some((row) => row.canonical_id === 'B' && row.status === 'ELIGIBLE_COMPILED_P_ACCEPTED'), 'B:manifest-p-acceptance-boundary-lost');
assert(projectableIds.has('digestive-metabolic-endocrine-tumor'), 'B:p-accepted-product-route-not-projectable');

// C compatibility: explicit/non-contiguous LG membership must survive the same
// production presenter. Missing compiled Projection is a legal Current state and
// must remain an empty Projection layer rather than being fabricated from A/B.
const { block: semanticCH1 } = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01');
const cProduction = buildXizongProductionBlock(
  compatibilityCanonicalBlock('hematology-immunity-infection', semanticCH1)
);
const semanticCLg = semanticCH1.logicGroups.find((group) => group.groupId === 'c-h01-lg06');
const productionCLg = cProduction.logicGroups.find((group) => group.groupId === 'c-h01-lg06');
assert(semanticCLg?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `C:H1:semantic-membership:${semanticCLg?.membershipMode}`);
assert(JSON.stringify(semanticCLg?.kpOrdinals) === JSON.stringify([1, 12, 13]), `C:H1:semantic-noncontiguous:${semanticCLg?.kpOrdinals}`);
assert(productionCLg?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `C:H1:production-membership:${productionCLg?.membershipMode}`);
assert(JSON.stringify(productionCLg?.kpOrdinals) === JSON.stringify([1, 12, 13]), `C:H1:production-noncontiguous:${productionCLg?.kpOrdinals}`);
assert(JSON.stringify(productionCLg?.kpIds) === JSON.stringify(['hematology-h01-kp01', 'hematology-h01-kp12', 'hematology-h01-kp13']), `C:H1:production-kp-members:${productionCLg?.kpIds}`);
assert(cProduction.sourceContact.mode === 'BLOCK_OR_CANONICAL_SOURCE_UNIT', `C:H1:source:${cProduction.sourceContact.mode}`);
assert(cProduction.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'C:H1:lg-promoted-to-source-chunk');
assert(cProduction.sourceContact.logicGroupSourceReentryDefault === false, 'C:H1:source-reentry-default-changed');
assert(cProduction.sourceContact.segments.length === 0, `C:H1:invented-source-segments:${cProduction.sourceContact.segments.length}`);
assert(cProduction.retrievalPoints.slice(1).every((point) => point.sourceContactBefore === null && point.reopenSourceByDefault === false), 'C:H1:later-lg-reopens-source');
assert(cProduction.cognitiveProjection.compiled === false, 'C:H1:false-compiled-projection');
assert(cProduction.cognitiveProjection.status === 'ELIGIBLE_OR_CURRENT_BUT_UNCOMPILED', `C:H1:uncompiled-status:${cProduction.cognitiveProjection.status}`);
assert(cProduction.cognitiveProjection.stageObjects.length === 0 && cProduction.cognitiveProjection.locationObjects.length === 0 && cProduction.cognitiveProjection.referenceObjects.length === 0, 'C:H1:fabricated-projection-objects');
assert(loadCompiledXizongProjectionAsset('hematology-immunity-infection', 'hematology-h01') === null, 'C:H1:false-projection-asset');
assert(manifest.validation?.eligibility_accounting?.eligible_not_compiled?.some((row) => row.canonical_id === 'C' && row.status === 'ELIGIBLE_NOT_COMPILED'), 'C:manifest-uncompiled-boundary-lost');
assert(!projectableIds.has('hematology-immunity-infection'), 'C:compatibility-illegally-promoted-product-route');

// Shared V6 shell must branch only on Current Source-contact semantics. This is
// the runtime compatibility seam: B enters one Source handoff per accepted LG;
// C enters one continuous Source contact and then returns directly to LG recall.
assert(blockUi.includes("const sourcePerGroup = sourceContact.logicGroupIsAutomaticSourceChunk === true;"), 'V6:source-contact-semantic-switch-missing');
assert(blockUi.includes("if (sourcePerGroup) setStage('kp_learn');"), 'V6:B:whole-lg-source-entry-missing');
assert(blockUi.includes("else if (state.sourceContactDone) setStage('kp_recall');"), 'V6:C:direct-retrieval-return-missing');
assert(blockUi.includes("if (!biochemistrySource?.laneSourceHash && !sourcePerGroup && requested === 'logic_group' && button.hasAttribute('data-stage-next') && !state.sourceContactDone) setStage('source_contact');"), 'V6:C:single-continuous-source-gate-missing');
assert(blockUi.includes("if (biochemistrySource?.laneSourceHash) setStage(currentGroupSourceCovered() ? 'kp_recall' : 'source_contact');"), 'V6:BIO:scoped-global-source-reuse-missing');
assert(blockUi.includes("if (sourcePerGroup && stage === 'source_contact') stage = 'kp_learn';"), 'V6:B:block-source-stage-redirects-to-whole-lg-contact');
assert(blockUi.includes("const storageKey = `kianos-xizong-astro-v2:${objectId}`;"), 'V6:shared-v2-store-missing');
assert(!blockUi.includes('kianos-xizong-astro-v3'), 'V6:parallel-store-created');

console.log([
  'Xizong B+C production compatibility PASS',
  `B-D1 groups=${bProduction.logicGroups.length}`,
  `B-source=${bProduction.sourceContact.mode}`,
  `B-projection=${bProduction.cognitiveProjection.compiled ? 'compiled' : 'missing'}`,
  `C-H1 explicit=${productionCLg.kpOrdinals.join(',')}`,
  `C-source=${cProduction.sourceContact.mode}`,
  `C-projection=${cProduction.cognitiveProjection.compiled ? 'compiled' : 'legally-uncompiled'}`,
  'ProductRoute=B_P_ACCEPTED/C_NOT_PROMOTED',
  'Runtime=shared_V6_v2_store',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
