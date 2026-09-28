import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
import { loadXizongSemanticBlock } from '../src/lib/xizongSemanticAdapter.mjs';
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

// C remains semantically compatible but intentionally uncompiled until its own P work.
const semanticCH1 = loadXizongSemanticBlock('hematology-immunity-infection', 'hematology-h01').block;
const cLg = semanticCH1.logicGroups.find((row) => row.groupId === 'c-h01-lg06');
assert(cLg?.membershipMode === 'EXPLICIT_ORDINAL_LIST', `c-h01:membership-mode:${cLg?.membershipMode}`);
assert(JSON.stringify(cLg?.kpOrdinals) === JSON.stringify([1, 12, 13]), `c-h01:noncontiguous:${cLg?.kpOrdinals}`);
assert(semanticCH1.sourceContact.logicGroupIsAutomaticSourceChunk === false, 'c-h01:source-bounce-regression');
assert(loadCompiledXizongProjectionAsset('hematology-immunity-infection', 'hematology-h01') === null, 'c-h01:false-compiled-projection');

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
assert(blockUi.includes('XizongCognitiveProjectionStage'), 'renderer:compiled-cognitive-projection-not-mounted');
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
  'Runtime=V6 shared store only',
  'Composition=Production -> LearnerProjection -> V6',
  'U=NOT_TESTED_BY_THIS_SCRIPT'
].join(' | '));
