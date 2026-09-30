import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadXizongBlock, loadXizongSystem } from '../src/lib/xizong.mjs';
import { compileXizongExplicitAttentionCues } from '../src/lib/xizongProductionProjection.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';
import { reviewedRetentionConnectionsForBlock } from '../src/lib/xizongPathways.mjs';
import { resolveXizongLearnerAssetRepresentation } from '../src/lib/xizongRepresentationGate.mjs';

const fixture = (markdown) => compileXizongExplicitAttentionCues({ systemId:'circulation', blockId: 'fixture', sourcePath: 'fixture', kpRecords: [{kpId:'fixture-kp01', ordinal:1, detailMarkdown:markdown}] });
const labels = ['边界', '边界 1', '边界 2', '易错点', '易错边界', '使用边界', '核心边界', 'CVP 边界'];
for (const label of labels) {
  for (const prefix of ['', '- ', '> ', '> - ', '1. ']) {
    const rows = fixture(`${prefix}**${label}**：显式内容。`);
    assert.equal(rows.length, 1, `${prefix}${label}`);
    assert.equal(rows[0].cue, '显式内容。');
    assert.equal(rows[0].displayPolicy.timing, 'LEARN_ONLY');
  }
}
assert.equal(fixture('### 3｜重要边界\n\n- 条件甲；\n- 条件乙。\n\n### 下一节\n普通正文。').length, 2);
assert.equal(fixture('普通边界讨论：不能按关键词提升。\n> **主提示**：讨论边界。\n## KP01｜边界\n| 边界 | 普通表格 |\n```text\n**边界**：代码示例。\n```').length, 0);
assert.equal(fixture('（易混：已有显式提醒。）\n//串联：已有正式去向。').length, 2);

const system = loadXizongSystem('circulation');
const shared = JSON.parse(fs.readFileSync('../content/xizong/knowledge/learner/shared-fields.json', 'utf8'));
const inventory = [];
for (const summary of system.blocks) {
  const canonical = loadXizongBlock(system.systemId, summary.blockId);
  const resolved = resolveXizongLearnerProjection(canonical);
  const { learnerObject: learner, block } = resolved;
  let connections = 0;
  for (const original of canonical.kpRecords) {
    const kp = learner.kps.find(row => row.identity.kpId === original.kpId);
    assert.equal(kp.prompt.canonical, original.prompt, 'current reasoning stays in canonical Prompt');
    assert.equal(kp.core.markdown, original.detailMarkdown, 'promotion must never remove Core');
    assert.equal(kp.source.locator, original.sourceLocator);
    assert.equal(kp.outline.locator, original.outlineLocator);
    const owned = shared.kp_fields[`${canonical.blockId}-kp${String(original.ordinal).padStart(3, '0')}`]?.retention_metadata?.connections || [];
    assert.deepEqual(kp.connection.outgoing.map(r=>r.id), owned.map(r=>r.connection_id));
    for (const row of kp.connection.outgoing) {
      assert.equal(row.attentionRole, 'FUTURE_CONNECTION');
      assert.ok(row.other.href && row.other.label);
      assert.equal(resolveXizongLearnerAssetRepresentation(row,{stage:'KP_LEARN'}).visible,true);
      assert.equal(resolveXizongLearnerAssetRepresentation(row,{stage:'KP_RECALL_FRONT'}).visible,false, 'seed may reveal current mechanism');
      assert.equal(resolveXizongLearnerAssetRepresentation(row,{stage:'KP_RECALL_REVEALED'}).visible,true);
    }
    connections += owned.length;
  }
  assert.equal(block.sourceHash, canonical.sourceHash, 'support repair must preserve source/evidence identity');
  inventory.push({block: canonical.blockId, kp: learner.kps.length, prompt: learner.kps.filter(k=>k.prompt.canonical).length, attention:block.semanticAttentionCues.length, connections, precision:resolved.learningCues.precision.length, visual:resolved.learningCues.visuals.length, extension:resolved.extensionAssets.length});
}
assert.equal(inventory.reduce((n,b)=>n+b.kp,0),312);
assert.equal(inventory.reduce((n,b)=>n+b.connections,0),12);
const b1 = loadXizongBlock('circulation', 'circulation-b01');
const kp24 = resolveXizongLearnerProjection(b1).learnerObject.kps.find(k=>k.identity.displayId==='KP24');
assert.match(kp24.prompt.canonical,/核心压力梯度.*抽吸端 6 个因素.*送血端 7 个因素/);
assert.ok(kp24.attention.some(r=>r.semanticRole==='BOUNDARY' && r.cue.includes('持续紧张性收缩')));
for (const mutation of [
  value => { value.authority = 'UNREVIEWED'; },
  value => { value.source_bindings[b1.blockId] = 'stale-owner'; }
]) {
  const invalid = structuredClone(shared); mutation(invalid);
  assert.deepEqual(reviewedRetentionConnectionsForBlock(system,b1,invalid),[]);
}
const invalid = structuredClone(shared);
invalid.kp_fields['circulation-b01-kp009'].retention_metadata.connections[0].downstream_owner_id='missing';
assert.throws(()=>reviewedRetentionConnectionsForBlock(system,b1,invalid),/CONNECTION_UNRESOLVED/);
fs.mkdirSync('.qa',{recursive:true});
fs.writeFileSync('.qa/xizong-a1-content-inventory.json',JSON.stringify({ok:true,inventory},null,2)+'\n');
console.log(JSON.stringify({ok:true,inventory},null,2));
