import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongSemanticBlock } from '../src/lib/xizongSemanticAdapter.mjs';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import {
  buildXizongProductionBlock,
  loadCompiledXizongProjectionAsset
} from '../src/lib/xizongProductionProjection.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const fail = (message) => { throw new Error(`XIZONG_PRODUCTION_PROJECTION_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const canonicalA1B1 = loadXizongBlock('circulation', 'b01');
const a1b1 = buildXizongProductionBlock(canonicalA1B1);
assert(a1b1.semanticAdapterSchema === 'kianos.xizong.semantic_adapter.v1', 'a1-b01:semantic-adapter-not-consumed');
assert(a1b1.sourceContact.logicGroupIsAutomaticSourceChunk === false, `a1-b01:legacy-lg-source-contact:${a1b1.sourceContact.mode}`);
assert(a1b1.logicGroups.length > 0, 'a1-b01:no-semantic-logic-groups');
assert(a1b1.logicGroups.flatMap((group) => group.kpIds).length === a1b1.kpRecords.length, 'a1-b01:semantic-kp-coverage');
assert(a1b1.cognitiveProjection.compiled === true, 'a1-b01:compiled-projection-not-consumed');
assert(a1b1.cognitiveProjection.stageObjects.some((row) => row.role === 'CHAIN'), 'a1-b01:rich-chain-not-renderable');
assert(a1b1.cognitiveProjection.stageObjects.some((row) => row.geometry === 'FORMULA_STRIP'), 'a1-b01:formula-strip-not-renderable');
assert(a1b1.cognitiveProjection.stageObjects.every((row) => row.html || row.items.length), 'a1-b01:empty-stage-object');
const projectedA1B1Kps = canonicalA1B1.kpRecords.map((kp) => ({
  kpId: kp.kpId,
  markdown: projectKpCore(kp.detailMarkdown || '', { sourcePath: canonicalA1B1.sourcePath })
}));
assert(projectedA1B1Kps.every((row) => !row.markdown.includes('Block1_正常机械循环_v6_assets/')), 'a1-b01:missing-inline-media-still-rendered');
const projectedKp03 = projectedA1B1Kps.find((row) => row.kpId === 'circulation-b01-kp03')?.markdown || '';
assert(projectedKp03.includes('原讲义图') && projectedKp03.includes('原讲义表'), 'a1-b01-kp03:source-visual-guidance-lost');

const canonicalA1B2 = loadXizongBlock('circulation', 'b02');
const a1b2 = buildXizongProductionBlock(canonicalA1B2);
assert(a1b2.cognitiveProjection.compiled === true, 'a1-b02:compiled-projection-not-consumed');
assert(a1b2.cognitiveProjection.referenceObjects.some((row) => row.referenceOnly), 'a1-b02:canonical-guide-not-demoted-to-reference');
assert(a1b2.cognitiveProjection.locationObjects.some((row) => row.role === 'MAP'), 'a1-b02:logic-map-not-spatialized');
const semanticA1B2 = loadXizongSemanticBlock('circulation', 'circulation-b02').block;
assert(JSON.stringify(a1b2.logicGroups.map((row) => row.groupId)) === JSON.stringify(semanticA1B2.logicGroups.map((row) => row.groupId)), 'a1-b02:legacy-logic-topology-leaked');

const canonicalA2R1 = loadXizongBlock('respiratory', 'r01');
const a2r1 = buildXizongProductionBlock(canonicalA2R1);
assert(a2r1.cognitiveProjection.compiled === true, 'a2-r01:projection-not-consumed');
assert(a2r1.attention.supportOnDemand.some((row) => row.kind === 'VISUAL_GATE'), 'a2-r01:semantic-visual-support-missing');

// B stays whole-LG Source contact. Step 4 may consume its compiled asset later without
// changing that topology or pretending B already has a production route acceptance.
const semanticBD1 = loadXizongSemanticBlock('digestive-metabolic-endocrine-tumor', 'D1').block;
assert(semanticBD1.sourceContact.mode === 'WHOLE_LOGIC_GROUP', `b-d01:source-contact:${semanticBD1.sourceContact.mode}`);
assert(semanticBD1.sourceContact.logicGroupIsAutomaticSourceChunk === true, 'b-d01:whole-lg-contact-lost');
assert(semanticBD1.sourceContact.segments.length === semanticBD1.logicGroups.length, 'b-d01:whole-lg-segment-count');
const bAsset = loadCompiledXizongProjectionAsset('digestive-metabolic-endocrine-tumor', 'D1');
assert(Boolean(bAsset?.asset), 'b-d01:compiled-projection-asset-missing');
assert(!JSON.stringify(bAsset.asset.views?.BLOCK_ORIENT || {}).includes('CANONICAL_GUIDE'), 'b-d01:second-lecture-regression');

const bD1 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'd01'));
assert(bD1.kpRecords.every((kp) => kp.sourceLocatorAuthority === 'UNRESOLVED'), 'b-d01:must-not-invent-kp-source-page');
assert(bD1.kpRecords.every((kp) => kp.outlineLocatorAuthority === 'CANONICAL_OUTLINE_LEDGER' && kp.outlineLocator.includes('U018')), 'b-d01:outline-ledger-not-consumed');

const bD2 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'd02'));
assert(bD2.kpRecords.slice(0, 4).every((kp) => kp.outlineLocator.includes('U019')), 'b-d02:u019-outline-reconciliation-lost');
assert(bD2.kpRecords.slice(4).every((kp) => kp.outlineLocator.includes('U020')), 'b-d02:u020-outline-reconciliation-lost');

const bD5 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'd05'));
assert(bD5.kpRecords[0].sourceLocatorAuthority === 'CANONICAL_LECTURE_LEDGER' && bD5.kpRecords[0].sourceLocator.includes('PHY P245'), 'b-d05-kp01:lecture-ledger-source-not-consumed');
assert(bD5.kpRecords[14].sourceLocatorAuthority === 'CURRENT_SOURCE_MAP', 'b-d05-kp15:current-surgery-source-map-must-outrank-lecture-ledger');
assert(bD5.kpRecords.every((kp) => kp.outlineLocatorAuthority === 'CANONICAL_OUTLINE_LEDGER'), 'b-d05:outline-ledger-not-consumed');

const bD17 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'd17'));
assert(bD17.kpRecords[5].outlineLocator.includes('病理 U007') && bD17.kpRecords[5].outlineLocator.includes('外科 U018'), 'b-d17-kp06:multi-outline-binding-lost');

const bM2 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'm02'));
assert(bM2.kpRecords.length === 15 && bM2.kpRecords.every((kp) => kp.sourceLocator && kp.sourceLocatorAuthority === 'CURRENT_SOURCE_MAP'), 'b-m02:source-map-kp-locators-not-materialized');
assert(bM2.kpRecords[0].sourceLocator.includes('27生化跟课版合集【不带导图】.pdf') && bM2.kpRecords[0].sourceLocator.includes('P003–P008') && !/BIO27-S\d+/.test(bM2.kpRecords[0].sourceLocator), 'b-m02-kp01:learner-source-locator-wrong');

const bG1 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'g01'));
assert(bG1.kpRecords[0].sourceLocatorAuthority === 'CANONICAL_BLOCK' && bG1.kpRecords[0].sourceLocator.includes('P112'), 'b-g01-kp01:canonical-locator-must-outrank-derived-source-map');

const bG5 = buildXizongProductionBlock(loadXizongBlock('digestive-metabolic-endocrine-tumor', 'g05'));
assert(bG5.kpRecords[0].sourceLocatorAuthority === 'CURRENT_SOURCE_MAP' && bG5.kpRecords[0].sourceLocator.includes('27生化跟课版合集【不带导图】.pdf') && /PDF P\d+/.test(bG5.kpRecords[0].sourceLocator) && !/BIO27-S\d+/.test(bG5.kpRecords[0].sourceLocator), 'b-g05-kp01:learner-source-map-fallback-wrong');

// C/D/E/F have no physical rich Projection assets yet. They must still enter the
// same production/runtime path through the minimal Current-derived baseline.
const semanticCH1 = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01').block;
const cLg = semanticCH1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(cLg?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `c-h01:membership-mode:${cLg?.membershipMode}`);
assert(JSON.stringify(cLg?.kpOrdinals) === JSON.stringify([1, 12, 13]), `c-h01:noncontiguous:${cLg?.kpOrdinals}`);
assert(semanticCH1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'c-h01:source-bounce-regression');

const derivedCases = [
  ['C', 'hematology-immunity-infection', 'h01', 'hematology-h01'],
  ['D', 'neuro-sensory-motor-orthopedics', 'n01', 'neuro-n01'],
  ['E', 'reproductive-breast', 'sr01', 'SR1'],
  ['F', 'remaining-clinical', 'f01', 'F1']
].map(([canonicalId, systemId, slug, blockId]) => {
  const production = buildXizongProductionBlock(loadXizongBlock(systemId, slug));
  assert(production.blockId === blockId, `${canonicalId}:block-id:${production.blockId}`);
  assert(production.cognitiveProjection.available === true, `${canonicalId}:baseline-not-available`);
  assert(production.cognitiveProjection.compiled === false && production.cognitiveProjection.derived === true, `${canonicalId}:materialization-boundary-lost`);
  assert(production.cognitiveProjection.status === 'DERIVED_BASELINE_CURRENT', `${canonicalId}:baseline-status:${production.cognitiveProjection.status}`);
  assert(production.cognitiveProjection.stageObjects.length === 1, `${canonicalId}:baseline-problem-count:${production.cognitiveProjection.stageObjects.length}`);
  assert(production.cognitiveProjection.stageObjects[0]?.role === 'PROBLEM', `${canonicalId}:baseline-role`);
  assert(production.cognitiveProjection.locationObjects.length === 0 && production.cognitiveProjection.referenceObjects.length === 0, `${canonicalId}:baseline-invented-extra-objects`);
  assert(loadCompiledXizongProjectionAsset(systemId, blockId) === null, `${canonicalId}:false-materialized-asset`);
  return production;
});

const page = read('static-web/src/pages/xizong/[system]/[block].astro');
const blockUi = read('static-web/src/components/XizongBlockV6.astro');
const stageUi = read('static-web/src/components/XizongCognitiveProjectionStage.astro');
const productionLib = read('static-web/src/lib/xizongProductionProjection.mjs');
const learnerProjectionLib = read('static-web/src/lib/xizongLearnerProjection.mjs');
assert(page.includes('resolveXizongLearnerProjection'), 'page:bypasses-unified-learner-projection');
assert(!page.includes('buildXizongProductionBlock'), 'page:reintroduced-direct-production-assembly');
assert(learnerProjectionLib.includes('buildXizongProductionBlock'), 'learner-projection:bypasses-production-presenter');
assert(page.includes('<XizongBlockV6 block={projection} />'), 'page:not-using-existing-v6-family');
assert(blockUi.includes('data-source-contact-mode'), 'renderer:source-contact-mode-not-declared');
assert(blockUi.includes("data-study-stage=\"source_contact\""), 'renderer:no-natural-source-contact-stage');
assert(blockUi.includes("if (sourcePerGroup) setStage('kp_learn')"), 'renderer:whole-lg-source-path-lost');
assert(blockUi.includes("else if (state.sourceContactDone) setStage('kp_recall')"), 'renderer:natural-source-return-not-direct-to-retrieval');
assert(blockUi.includes('data-xizong-attention'), 'renderer:right-rail-not-attention-projection');
assert(blockUi.includes('XizongCognitiveProjectionStage'), 'renderer:cognitive-projection-stage-not-mounted');
assert(blockUi.includes('!block?.cognitiveProjection?.available'), 'renderer:whole-block-fallback-not-gated-by-framework-availability');
assert(stageUi.includes('projection?.available === true'), 'projection-stage:derived-baseline-not-admitted');
assert(stageUi.includes('data-projection-role') && stageUi.includes('data-projection-geometry'), 'projection-stage:semantic-shape-missing');
assert(!stageUi.includes('>CHAIN<') && !stageUi.includes('>MAP<') && !stageUi.includes('>EXACT<'), 'projection-stage:engineering-label-leak');
assert(productionLib.includes("pointer.includes('/logic_index/')"), 'presenter:legacy-logic-index-not-reconciled');
assert(!fs.existsSync(path.join(repoRoot, 'static-web/src/components/XizongBlockV7.astro')), 'renderer:parallel-v7-created');
assert((blockUi.match(/kianos-xizong-astro-v2/g) || []).length >= 1, 'renderer:existing-state-store-missing');
assert(!blockUi.includes('kianos-xizong-astro-v3'), 'renderer:second-state-store-created');

console.log([
  'Xizong production semantic Projection PASS',
  `A1-B1 objects=${a1b1.cognitiveProjection.stageObjects.length}`,
  `A1-B2 refs=${a1b2.cognitiveProjection.referenceObjects.length}`,
  `A2-R1 support=${a2r1.attention.supportOnDemand.length}`,
  `B-D1 source=${semanticBD1.sourceContact.mode}`,
  `C-H1 explicit=${cLg.kpOrdinals.join(',')}`,
  `DerivedBaseline=${derivedCases.map((row) => row.systemCanonicalId).join('/')}`,
  'Runtime=V6 shared store only',
  'Composition=Production -> LearnerProjection -> V6',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
