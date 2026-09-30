import assert from 'node:assert/strict';
import { marked } from 'marked';
import { projectKpCore } from '../src/lib/xizongProjection.mjs';
import { loadXizongBlock } from '../src/lib/xizong.mjs';
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
  '    **Routing**：UNKNOWN_CLASS', '**Routing**：CORE｜CONNECTION',
  '医学 Routing 边界：保留完整解释。', '    晨僵阈值与评分边界必须保留。']) {
  assert.equal(projectKpCore('正文\n\n'+prose), '正文\n\n'+prose, 'mixed/unknown/non-owner-format Routing and medical code survive');
}
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
