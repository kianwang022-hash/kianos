import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');

const fail = (message) => { throw new Error(`A2_K_STRUCTURE_FAIL:${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const system = loadXizongSystem('respiratory');
const systemPath = 'content/xizong/knowledge/systems/a2-respiratory/system.json';
const systemRaw = JSON.parse(read(systemPath));

assert(system.canonicalId === 'A2', `identity:${system.canonicalId}`);
assert(system.status === 'CURRENT', `status:${system.status}`);
assert(system.blocks.length === 12, `block-count:${system.blocks.length}`);
assert(system.learningSupport, 'learning-support-owner-missing');

const unresolvedPattern = /\bSOURCE[ _]?GAP\b|待补(?:充|齐|完)?|内容待定|未决(?:内容|知识|来源)|待核对|待确认|未核对|待裁决/i;

const formalSourceGaps = systemRaw?.source_refs?.formal_source_gaps ?? [];
assert(Array.isArray(formalSourceGaps), 'system-formal-source-gaps-not-array');
assert(formalSourceGaps.length === 0, `system-formal-source-gaps:${formalSourceGaps.join(',')}`);

const logicLabels = Object.values(systemRaw?.logic_index ?? {})
  .flat()
  .map((group) => String(group?.label ?? ''));
const unresolvedSystemLabels = logicLabels.filter((label) => unresolvedPattern.test(label));
assert(unresolvedSystemLabels.length === 0, `system-unresolved-logic-label:${unresolvedSystemLabels.join('|')}`);

let totalKp = 0;
let totalLogicGroups = 0;
const report = [];

for (const meta of system.blocks) {
  const block = loadXizongBlock('respiratory', meta.slug);
  const raw = read(block.sourcePath);

  assert(block.centerQuestion.trim(), `${block.blockId}:center-question-missing`);
  assert(block.blockLearnMarkdown.trim(), `${block.blockId}:opening-framework-missing`);
  assert(block.kpRecords.length === meta.kpCount, `${block.blockId}:kp-count:${block.kpRecords.length}/${meta.kpCount}`);
  assert(block.logicGroups.length > 0, `${block.blockId}:logic-groups-missing`);

  const ordinalSet = new Set(block.kpRecords.map((kp) => kp.ordinal));
  assert(ordinalSet.size === meta.kpCount, `${block.blockId}:stable-kp-identity-duplicate-or-count`);
  for (let ordinal = 1; ordinal <= meta.kpCount; ordinal += 1) {
    assert(ordinalSet.has(ordinal), `${block.blockId}:stable-kp-identity-missing-${ordinal}`);
  }

  for (const kp of block.kpRecords) {
    assert(kp.title.trim(), `${kp.kpId}:title-missing`);
    assert(kp.detailMarkdown.trim(), `${kp.kpId}:teaching-body-missing`);
  }

  const flattened = block.logicGroups.flatMap((group) => group.kpIds);
  assert(flattened.length === block.kpRecords.length, `${block.blockId}:logic-flatten-length`);
  assert(flattened.every((kpId, index) => kpId === block.kpRecords[index].kpId), `${block.blockId}:logic-does-not-follow-canonical-document-order`);

  const unresolvedMarkers = [
    /\bTODO\b/i,
    /\bSOURCE[ _]?GAP\b/i,
    /待补(?:充|齐|完)?/,
    /内容待定/,
    /未决(?:内容|知识|来源)/,
    /待核对/,
    /待确认/,
    /未核对/,
    /待裁决/
  ].filter((pattern) => pattern.test(raw));
  assert(unresolvedMarkers.length === 0, `${block.blockId}:unresolved-stable-content-marker:${unresolvedMarkers.map(String).join('|')}`);

  totalKp += block.kpRecords.length;
  totalLogicGroups += block.logicGroups.length;
  report.push({
    block_id: block.blockId,
    title: block.title,
    kp_count: block.kpRecords.length,
    logic_group_count: block.logicGroups.length,
    center_question: block.centerQuestion,
    first_kp: block.kpRecords[0]?.displayId || '',
    last_kp: block.kpRecords.at(-1)?.displayId || ''
  });
}

assert(totalKp === 236, `total-kp:${totalKp}`);
assert(totalLogicGroups === 62, `logic-group-total:${totalLogicGroups}`);

console.log(JSON.stringify({
  schema: 'kianos.xizong.a2_k_structure_report.v1',
  result: 'K_STRUCTURE_EVIDENCE_PASS',
  semantic_gate: 'UNTESTED',
  warning: 'This script proves structural/content-presence invariants only. It cannot decide whether the respiratory mechanisms, boundaries, examples and execution rules are semantically correct or complete enough for first learning.',
  system: {
    canonical_id: system.canonicalId,
    system_id: system.systemId,
    block_count: system.blocks.length,
    kp_count: totalKp,
    logic_group_count: totalLogicGroups,
    formal_source_gap_count: formalSourceGaps.length
  },
  blocks: report
}, null, 2));
