import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  classifyPoliticsSourceNodeFidelity,
  loadPoliticsSourceFidelityOverrides
} from '../src/lib/politicsSourceFidelity.mjs';
import { loadPoliticsChapterCurrent } from '../src/lib/politicsCurrent.mjs';
import { buildPoliticsPracticeCatalogCurrent } from '../src/lib/politicsPractice.mjs';

const repoRoot = process.env.KIANOS_REPO_ROOT
  ? path.resolve(process.env.KIANOS_REPO_ROOT)
  : path.resolve(process.cwd(), '..');

const shardPath = path.join(
  repoRoot,
  'content/politics/source/nodes/shards/pol27-cf/marx/c00.json'
);
const shard = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
const overrides = loadPoliticsSourceFidelityOverrides();

const knownBadId = 'POL27-CF-MARX-C00-K04-N02-I01';
const knownBad = shard[knownBadId];
assert.ok(knownBad, 'known actor-level OCR defect must remain present in raw Source evidence');
assert.equal(knownBad.verification_status, 'source_bound_cross_engine_ocr',
  'regression must prove the Source override repairs a misclassification rather than relying on raw status');
assert.match(String(knownBad.original_text_span || ''), /我们觉坚定信仰信念/,
  'known bad OCR fixture changed unexpectedly');

const overridden = classifyPoliticsSourceNodeFidelity(knownBadId, knownBad, overrides);
assert.equal(overridden.status, 'BLOCKED_FIDELITY');
assert.equal(overridden.admitted, false);
assert.equal(overridden.effectiveStatus, 'source_bound_ocr_needs_review');
assert.equal(overridden.reason, 'KNOWN_ACTOR_LEVEL_OCR_CORRUPTION');

const rawNeedsReviewId = 'POL27-CF-MARX-C00-K06';
const rawNeedsReview = shard[rawNeedsReviewId];
assert.ok(rawNeedsReview);
assert.equal(rawNeedsReview.verification_status, 'source_bound_ocr_needs_review');
const rawBlocked = classifyPoliticsSourceNodeFidelity(rawNeedsReviewId, rawNeedsReview, overrides);
assert.equal(rawBlocked.status, 'BLOCKED_FIDELITY');
assert.equal(rawBlocked.admitted, false);
assert.equal(rawBlocked.reason, 'RAW_VERIFICATION_STATUS_NOT_LEARNER_ADMISSIBLE');

const safeId = 'POL27-CF-MARX-C00-K04-N02';
const safe = shard[safeId];
assert.ok(safe);
assert.equal(safe.verification_status, 'source_bound_cross_engine_ocr');
const admitted = classifyPoliticsSourceNodeFidelity(safeId, safe, overrides);
assert.equal(admitted.status, 'ADMITTED');
assert.equal(admitted.admitted, true);

const chapter = loadPoliticsChapterCurrent('marxism', 'ch00');
const allSourceNodes = (chapter.units || []).flatMap((unit) => unit.sourceNodes || []);
const allSourceText = allSourceNodes.map((row) => String(row.text || '')).join('\n');
assert.equal(allSourceText.includes('我们觉坚定信仰信念'), false,
  'known bad OCR must not enter learner-facing Runtime source text');

const blocked = (chapter.units || []).flatMap((unit) => unit.fidelityBlockedSourceRefs || []);
assert.ok(blocked.some((row) => (row.blocked_node_ids || []).includes(knownBadId)),
  'Runtime must expose bounded fidelity-block diagnostics for the known bad node');
assert.ok(blocked.some((row) => (row.blocked_node_ids || []).includes(rawNeedsReviewId)),
  'raw needs-review nodes must be visible as fidelity-block diagnostics');

const k04Source = allSourceNodes.find((row) => row.id === 'POL27-CF-MARX-C00-K04');
assert.ok(k04Source, 'safe K04 siblings should keep the owner usable');
assert.equal(k04Source.fidelityStatus, 'PARTIAL_SAFE');
assert.ok(k04Source.blockedNodeIds.includes(knownBadId));
assert.equal(String(k04Source.text || '').includes('我们觉坚定信仰信念'), false);

const catalog = buildPoliticsPracticeCatalogCurrent('/');
const practiceSourceText = (catalog.units || [])
  .flatMap((unit) => unit.source || [])
  .map((row) => String(row.text || ''))
  .join('\n');
assert.equal(practiceSourceText.includes('我们觉坚定信仰信念'), false,
  'blocked OCR must not enter Practice/Review source payloads');

assert.equal(
  (catalog.questions || []).some((question) => question.chengfengLocator?.sourceNodeId === knownBadId),
  false,
  'blocked source node must not become an exact Chengfeng locator'
);
assert.equal(catalog.boundaries?.sourceTextRequiresFidelityAdmission, true);
assert.equal(catalog.boundaries?.blockedSourceTextCannotEnterReviewContext, true);

const shardAudit = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'content/politics/source/source-shard-audit.json'),
  'utf8'
));
assert.equal(shardAudit.status, 'PASS');
assert.equal(shardAudit.nodes?.parity, true,
  'fidelity admission overlay must not break raw monolith↔shard parity');

console.log('PASS Politics source fidelity: text-present needs-review and known misclassified OCR fail closed before Runtime, Practice, locator, and Review admission while raw shard parity remains intact.');
