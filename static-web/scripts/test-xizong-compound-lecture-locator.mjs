import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMetadataDeclaration, readCompoundLectureLocator, stripRevisionKpMetadata } from '../src/lib/xizongKpMetadata.mjs';
import { buildXizongLearnerObject } from '../src/lib/xizongLearnerObject.mjs';
import { buildXizongRevisionWitness } from '../src/lib/xizongRevisionWitness.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const b2Path = 'content/xizong/knowledge/systems/a1-circulation/blocks/Block2_循环调节与容量控制_学习阅读版_v4_最终执行版.md';
const rawB2 = fs.readFileSync(path.join(repo, b2Path), 'utf8');
const rawB4 = fs.readFileSync(path.join(repo, 'content/xizong/knowledge/systems/a1-circulation/blocks/Block4_正常止血与病理循环整合_学习阅读版_v1_Batch2冻结版.md'), 'utf8');
const rawB5 = fs.readFileSync(path.join(repo, 'content/xizong/knowledge/systems/a1-circulation/blocks/Block5_高血压与动脉粥样硬化_学习阅读版_v2_最终执行版.md'), 'utf8');
const rawB12 = fs.readFileSync(path.join(repo, 'content/xizong/knowledge/systems/a1-circulation/blocks/Block12_休克与心脏骤停_学习阅读版_v2_最终执行版.md'), 'utf8');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'xizong-locator-alias-'));
const previousRoot = process.env.KIANOS_REPO_ROOT;
const previousCache = process.env.KIANOS_XIZONG_BUILD_CACHE;
process.env.KIANOS_REPO_ROOT = fixtureRoot;
process.env.KIANOS_XIZONG_BUILD_CACHE = '0';
// Synthetic owners isolate the production loader. They are temporary test data,
// not an accepted Source/Learning owner or learner-state evidence.
function write(relative, value) {
  const file = path.join(fixtureRoot, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
}
function setup(markdown) {
  const count = [...markdown.matchAll(/^\s{0,4}#{2,4}\s+KP\d+[｜|]/gm)].length;
  write('content/xizong/knowledge/manifest.json', { status: 'CURRENT', owner_resolution: { system_level: { parallel_owner_forbidden: true } } });
  write('content/xizong/projection/manifest.json', { status: 'CURRENT_TEST_FIXTURE', systems: { 'locator-fixture': { canonical_id: 'A1', system_projection: 'fixture', block_count: 1, blocks: ['fixture-b2'] } } });
  write('content/xizong/knowledge/systems/locator-fixture/system.json', { system_id: 'locator-fixture', canonical_id: 'A1', title: 'Locator fixture', semantic_authority: 'CHAT_APPROVED_TEST_FIXTURE', identity: { block_count: 1, canonical_kp_count: count }, block_route: [{ id: 'fixture-b2', kp: count }] });
  write('content/xizong/knowledge/learner/a1-locator-fixture-learning.json', { status: 'CURRENT', authority: 'CHAT_APPROVED_TEST_FIXTURE', system_id: 'locator-fixture', canonical_id: 'A1', blocks: { 'fixture-b2': { kp_count: count, learner_order: ['fixture-lg'], logic_groups: { 'fixture-lg': { kp: [1, count], goal: 'Fixture goal', closure: 'Fixture closure' } } } } });
  write('content/xizong/knowledge/systems/locator-fixture/blocks/Block2_fixture.md', markdown);
}
function rawBodies(markdown) {
  const headings = [...markdown.matchAll(/^\s{0,4}(#{1,4})\s+(.+)$/gm)];
  return headings.flatMap((h, i) => {
    if (!/^KP\d+[｜|]/.test(h[2])) return [];
    const end = headings.slice(i + 1).find(next => next[1].length <= h[1].length)?.index ?? markdown.length;
    return [markdown.slice(h.index + h[0].length, end).trim()];
  });
}
function existingMetadata(body) {
  const declarations = ['主提示', '讲义定位 →', '讲义定位', 'Outline →', 'Outline'].map(label => readMetadataDeclaration(body, label));
  return { prompt: declarations[0].value, sourceLocator: declarations[1].value || declarations[2].value, outlineLocator: declarations[3].value || declarations[4].value, diagnostics: declarations.flatMap(row => row.diagnostic ? [row.diagnostic] : []) };
}
const existingCore = body => String(body).replace(/^\s{0,4}>\s*\*\*(?:讲义定位[^*]*|Outline[^*]*|主提示[^*]*)\*\*[：:]?.*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

try {
  const { loadXizongBlock } = await import('../src/lib/xizong.mjs');
  function load(markdown) { setup(markdown); return loadXizongBlock('locator-fixture', 'b02'); }
  const prompt = '召回轴1｜边界2｜//串联：正式owner';
  const cases = [
    ['review-page-role', '> **讲义回看 →** P153–161、P280–284；并调用 Block 1 的 P/Q/R/V。', ''],
    ['review-block-role', '> **讲义回看 →** B1、B2。', ''],
    ['review-p0-role', '> **讲义回看 →** P0 U017、U015。', ''],
    ['jump-page-role', '> **讲义跳转 →** P91–93；**讲义回看 →** P99。', ''],
    ['canonical-after-review', '> **讲义回看 →** B1 MAP、B2调节；**讲义定位 →** 内科P309–315、病理P39–41。', '内科P309–315、病理P39–41。'],
    ['canonical-after-jump', '> **讲义跳转 →** P92；**讲义定位 →** P103。', 'P103。'],
    ['ascii-semicolon', '> **讲义回看 →** B10稳定性门; **讲义定位 →** 内科 P398。', '内科 P398。'],
    ['pipe-boundary', '> **讲义回看 →** B1 | **讲义定位：P1**', 'P1'],
    ['fullwidth-pipe-boundary', '> **讲义跳转 →** B1｜**讲义定位：** P1', 'P1'],
    ['outside-colon', '> **讲义回看 →** B1；**讲义定位**：P1', 'P1'],
    ['whole-field', '> **讲义回看 →** B1；**讲义定位：P1**', 'P1'],
    ['duplicates', '> **讲义回看 →** B1；**讲义定位 →** P1\n> **讲义跳转 →** B2；**讲义定位：P1**', 'P1'],
    ['compound-conflict', '> **讲义回看 →** B1；**讲义定位 →** P1\n> **讲义跳转 →** B2；**讲义定位：P2**', '', true],
    ['same-row-conflict', '> **讲义回看 →** B1；**讲义定位 →** P1；**讲义定位：P2**', '', true],
    ['canonical-wins', '> **讲义定位 →** P0\n> **讲义回看 →** B1；**讲义定位 →** P1', 'P0'],
    ['canonical-conflict', '> **讲义定位：P0**\n> **讲义定位：P9**\n> **讲义回看 →** B1；**讲义定位 →** P1', ''],
    ['canonical-effective-conflict', '> **讲义定位**：P0\n> **讲义定位：P9**\n> **讲义回看 →** B1；**讲义定位 →** P1', 'P0'],
    ['legacy-canonical-text', '> **讲义定位 →** P332–333；**讲义回看 →** B1。', 'P332–333；**讲义回看 →** B1。'],
    ['primary-unchanged', `> **主提示**：${prompt}；**讲义定位 →** P1`, 'P1'],
    ['outline-unchanged', '> **Outline →** U1；**讲义定位 →** P1', 'P1'],
    ['non-metadata', '> 正文引用；**讲义定位：P1**', ''],
    ['malformed-leading-field', '> **讲义回看：B1；**讲义定位：P1**', ''],
    ['empty-leading-field', '> **讲义回看 →** ；**讲义定位：P1**', ''],
    ['no-blockquote', '**讲义回看 →** B1；**讲义定位：P1**', ''],
    ['nested-code', '     > **讲义回看 →** B1；**讲义定位：P1**', ''],
    ['inline-code', '> **主提示**：保留`x；**讲义定位：代码示例**`｜最后1', ''],
    ['escaped-separator', '> **主提示**：保留\\；**讲义定位：示例**', ''],
    ['internal-bold', '> **主提示**：轴1；**讲义定位术语**｜最后1', ''],
    ['fenced-code', '```md\n> **讲义回看 →** B1；**讲义定位：P1**\n```', ''],
    ['quoted-fence', '> ~~~md\n> **讲义回看 →** B1；**讲义定位：P1**\n> ~~~', ''],
    ['unquoted-fence-quoted-literal-close', '```md\n> ```\n> **讲义回看 →** B1；**讲义定位 →** P1\n```', ''],
    ['quoted-fence-unquoted-literal-close', '> ```md\n```\n> **讲义回看 →** B1；**讲义定位 →** P1\n> ```', ''],
    ['unquoted-fence-compatible-close', '```md\n> ```\n```\n> **讲义回看 →** B1；**讲义定位 →** P1', 'P1'],
    ['quoted-fence-compatible-close', '> ```md\n```\n> ```\n> **讲义回看 →** B1；**讲义定位 →** P1', 'P1'],
    ['fence-info-is-not-close', '```md\n```still code\n> **讲义回看 →** B1；**讲义定位：P1**\n```', ''],
    ['missing', '正文保留', '']
  ];
  for (const [name, metadata, expected, conflict] of cases) {
    const markdown = `# Fixture\n\n## 这个 Block 到底解决什么\n\nFixture orientation\n\n## KP01｜Fixture KP\n\n${metadata}\n\n医学正文阈值42\n`;
    const kp = load(markdown).kpRecords[0];
    const body = rawBodies(markdown)[0], prior = existingMetadata(body);
    assert.equal(kp.sourceLocator, expected, name + ': source');
    assert.equal(kp.prompt, prior.prompt, name + ': exact existing Primary');
    assert.equal(kp.outlineLocator, prior.outlineLocator, name + ': exact existing Outline');
    assert.equal(kp.detailMarkdown, existingCore(body), name + ': exact existing Core');
    assert.deepEqual((kp.contentDiagnostics || []).slice(0, prior.diagnostics.length), prior.diagnostics, name + ': existing diagnostics');
    if (conflict) assert.deepEqual(kp.contentDiagnostics?.at(-1), { code: 'MULTIPLE_AUTHORED_METADATA_VALUES', label: '讲义定位', values: ['P1', 'P2'], effectiveValue: '', resolution: 'CONTENT_REVIEW_REQUIRED' }, name + ': compound canonical conflict has no winner');
    if (name.startsWith('canonical-')) assert.deepEqual(kp.contentDiagnostics || [], prior.diagnostics, name + ': canonical diagnostics alone');
  }
  const actual = [];
  for (const [name, raw, ordinal, expected] of [
    ['B2', rawB2, 1, ''], ['B4', rawB4, 4, 'P103。'],
    ['B5', rawB5, 1, '内科P309–315、病理P39–41。'], ['B12', rawB12, 15, '内科 P398。']
  ]) {
    const block = load(raw), bodies = rawBodies(raw);
    assert.equal(block.kpRecords[ordinal - 1].sourceLocator, expected, name + ': exact authored canonical locator');
    if (name === 'B2') assert.equal(block.kpRecords[7].sourceLocator, '', 'KP08 remains missing; no page guesses');
    if (name === 'B4') assert.equal(block.kpRecords[2].sourceLocator, '', 'jump/review roles are not upgraded to Source');
    const baseline = { ...block, kpRecords: block.kpRecords.map((kp, i) => {
      const prior = existingMetadata(bodies[i]);
      assert.equal(kp.prompt, prior.prompt, name + ': exact Primary');
      assert.equal(kp.outlineLocator, prior.outlineLocator, name + ': exact Outline');
      assert.equal(kp.detailMarkdown, existingCore(bodies[i]), name + ': exact Core');
      return { ...kp, sourceLocator: prior.sourceLocator };
    }) };
    const before = buildXizongLearnerObject({ block: baseline });
    const after = buildXizongLearnerObject({ block });
    assert.equal(after.kps[ordinal - 1].source.locator, expected, name + ': learner source consumer');
    assert.deepEqual(buildXizongRevisionWitness(after), buildXizongRevisionWitness(before), name + ': actual pure witness equality');
    assert.deepEqual(after.kps.map(k => [k.identity, k.core, k.prompt]), before.kps.map(k => [k.identity, k.core, k.prompt]), name + ': exact learner Core/Primary/identity');
    actual.push({ block: name, kps: block.kpRecords.length, witnessEqual: true });
  }
  const review = '> **讲义回看 →** P1\n医学正文42';
  assert.equal(stripRevisionKpMetadata(review), review, 'revision stripping does not adopt locator aliases');
  assert.equal(stripRevisionKpMetadata('> **讲义定位 →** P1\n医学正文42'), '医学正文42', 'canonical stripping stays unchanged');
  assert.equal(readCompoundLectureLocator('> **讲义回看 →** B1；**讲义定位 →** P1').value, 'P1');
  console.log(JSON.stringify({ pass: true, nativeLoaderFixtures: cases.length, actualRawOwners: actual, locatorAliasesNotPromoted: true, existingPrimaryOutlineCoreDiagnosticsPreserved: true }));
} finally {
  if (previousRoot === undefined) delete process.env.KIANOS_REPO_ROOT; else process.env.KIANOS_REPO_ROOT = previousRoot;
  if (previousCache === undefined) delete process.env.KIANOS_XIZONG_BUILD_CACHE; else process.env.KIANOS_XIZONG_BUILD_CACHE = previousCache;
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
