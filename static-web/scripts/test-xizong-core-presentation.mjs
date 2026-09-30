import assert from 'node:assert/strict';
import { marked } from 'marked';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { loadXizongBlock, listProjectableXizongSystems } from '../src/lib/xizong.mjs';
import { resolveXizongLearnerProjection } from '../src/lib/xizongLearnerProjection.mjs';

const marker = '<!-- kianos:kp id="next-kp" -->';
const raw = `医学正文\n\n    **Routing**：CORE｜CONNECTION｜MI-G\n\n    ---\n    ${marker}`;
const before = marked.parse(raw);
assert.ok(before.includes('&lt;!-- kianos:kp'), 'frozen before reproduces visible identity metadata');
const after = marked.parse(projectKpCore(raw));
assert.ok(!after.includes('kianos:kp'));
assert.ok(!after.includes('Routing'), 'reviewed standalone taxonomy is not learner content');
assert.ok(after.includes('医学正文'));
assert.ok(!after.includes('<code>---'), 'next-section separator cannot become learner code');
for (const fence of ['```', '~~~~']) {
  const code = `${fence}text\n${marker}\n    **Routing**：CORE｜CONNECTION\n${fence}`;
  assert.equal(projectKpCore(code), code, 'explicit authored code survives');
}
assert.ok(projectKpCore('正文内 '+marker).includes(marker), 'only standalone identity declarations removed');
assert.ok(projectKpCore('医学正文\n\n    **Routing**：CORE\n    列表正文').includes('    列表正文'), 'ordinary indentation retained');
for (const prose of ['    **Routing**：CORE｜晨僵阈值以相邻正文为准',
  '    **Routing**：UNKNOWN_CLASS', '**Routing**：CORE｜医学解释保留',
  '医学 Routing 边界：保留完整解释。', '    晨僵阈值与评分边界必须保留。']) {
  assert.equal(projectKpCore('正文\n\n'+prose), '正文\n\n'+prose, 'mixed/unknown/non-owner-format Routing and medical code survive');
}
for (const row of ['**Routing**：CORE｜CONNECTION', '**Routing**: MI-G / MI-D。',
  '**Routing**：SPECIAL + RECOGNITION.', '**Routing**：SOURCE_VISUAL_VERIFIED｜BOUNDARY']) {
  assert.ok(!projectKpCore('正文\n\n'+row).includes('Routing'), 'reviewed taxonomy grammar excluded');
}
assert.ok(projectKpCore('正文\n\n        **Routing**：CORE').includes('        **Routing**'), 'nested code indentation retained');
assert.equal(projectKpCore('    ---\n医学正文'), '---\n医学正文', 'unrelated divider retained');
assert.equal(projectKpCore(projectKpCore(raw)), projectKpCore(raw), 'presentation idempotent');

let checked = 0;
for (const slug of ['h15', 'h16', 'h17', 'h18', 'h19']) {
  const block = loadXizongBlock('hematology-immunity-infection', slug);
  const original = resolveXizongLearnerProjection(block).learnerObject;
  const presented = resolveXizongLearnerProjection(block, { enrichBlock: b => ({
    ...b, kpRecords: b.kpRecords.map(k => ({...k, detailHtml:marked.parse(projectKpCore(k.detailMarkdown))}))
  }) }).learnerObject;
  assert.deepEqual(presented.revisionWitness, original.revisionWitness, 'HTML cleanup never reopens semantic claims');
  assert.deepEqual(presented.kps.map(k => [k.identity, k.core.markdown, k.prompt]), original.kps.map(k => [k.identity, k.core.markdown, k.prompt]));
  for (const kp of presented.kps) {
    assert.ok(!kp.core.html.includes('&lt;!-- kianos:kp'), kp.identity.kpId + ': no identity metadata in rendered Core');
    assert.ok(!kp.core.html.includes('Routing'), kp.identity.kpId + ': pure taxonomy must not enter learner Core');
    checked++;
  }
}
console.log(JSON.stringify({pass:true,canonicalKps:checked,rawCorePromptIdentityAndWitnessUnchanged:true}));

let allKps = 0, taxonomyRows = 0, affectedBlocks = 0;
for (const system of listProjectableXizongSystems()) {
  for (const ref of system.blocks) {
    const block = loadXizongBlock(system.systemId, ref.slug);
    let changed = false;
    for (const kp of block.kpRecords) {
      const rows = kp.detailMarkdown.split('\n').filter(row => /^(?: {4})?\*\*Routing\*\*[：:]/.test(row));
      const html = marked.parse(projectKpCore(kp.detailMarkdown));
      if (rows.length) {
        assert.ok(!html.includes('<strong>Routing</strong>'), `${block.id}/${kp.id}: reviewed current taxonomy absent in actual renderer HTML`);
        taxonomyRows += rows.length; changed = true;
      }
      allKps++;
    }
    if (changed) affectedBlocks++;
  }
}
assert.equal(allKps, 2517, 'formal current numbered scope; overlay is separate');
assert.equal(taxonomyRows, 1133, 'all currently reviewed standalone metadata rows, not arbitrary Routing prose');
console.log(JSON.stringify({pass:true,allKps,taxonomyRows,affectedBlocks}));
