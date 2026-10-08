import { beforePromptCalibration, assertReviewedA1Preentry, assertReviewedA2Preentry } from './xizong-calibration-test-support.mjs';
// Fixed, independently reviewed raw Current spans and rows; never regenerate
// the B oracle from compileXizongBlockPreentry or its heading helpers.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.KIANOS_REPO_ROOT || path.resolve(scriptDir, '../..');
const qa = process.env.KIANOS_QA_DIR || path.join(root, 'static-web/.qa');
const fixtureDir = path.join(qa, 'b-preentry-fixtures');
fs.mkdirSync(fixtureDir, { recursive: true });
process.env.KIANOS_REPO_ROOT = root;
process.env.KIANOS_XIZONG_BUILD_CACHE = '0';
const moduleFor = name => import(pathToFileURL(path.join(root, `static-web/src/lib/${name}.mjs`)));
const native = await moduleFor('xizong');
const production = await moduleFor('xizongProductionProjection');
const learner = await moduleFor('xizongLearnerObject');
const oraclePath = path.join(scriptDir, 'fixtures/b-independent-raw-preentry.json');
const oracle = JSON.parse(fs.readFileSync(oraclePath, 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(scriptDir, 'fixtures/b-preentry-nonb-baseline.json'), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const clean = value => String(value).replace(/\*\*|__|`+/g, '').replace(/\s+/g, ' ').trim();
const checks = [], failures = [];
const check = (name, fn) => {
  try { fn(); checks.push(name); } catch (error) { failures.push({ name, error: error.stack }); }
};
const systemId = 'digestive-metabolic-endocrine-tumor';
const totals = { framework: 0, parents: 0, miG: 0, miD: 0 };

// The native renderer independently confirms which literal owners are outside
// code fences. This is lexical proof, not browser or canonical-layout proof.
function rendererHeadings(source) {
  let offset = 0;
  const headings = [];
  for (const token of marked.lexer(source, { gfm: true })) {
    const start = source.indexOf(token.raw, offset);
    assert.ok(start >= offset, `renderer token does not map to raw source: ${token.type}`);
    if (token.type === 'heading') headings.push({
      anchor: token.text,
      level: token.depth,
      line: source.slice(0, start).split('\n').length
    });
    offset = start + token.raw.length;
  }
  return headings;
}

for (const raw of oracle.blocks) {
  const source = fs.readFileSync(path.join(root, raw.source_path), 'utf8');
  const block = native.loadXizongBlock(systemId, raw.slug);
  const got = production.compileXizongBlockPreentry(block);
  check(`${raw.block_id}: canonical identity and full Framework span survive packaging changes`, () => {
    assert.equal(sha(beforePromptCalibration(source)), raw.raw_sha256);
    assert.equal(block.blockId, raw.block_id);
    assert.equal(block.sourcePath, raw.source_path);
    assert.equal(got.framework.present, true);
    assert.equal(got.framework.ownerPath, raw.source_path);
    assert.equal(got.framework.anchor, raw.framework.anchor);
    const stableFramework = raw.framework.markdown.split('<!-- kianos:kp')[0].trim();
    assert.ok(got.framework.markdown.startsWith(stableFramework), raw.block_id);
    assert.ok(got.framework.items.length > 0);
  });
  check(`${raw.block_id}: every ordered literal MI row and exact owner anchor`, () => {
    assert.equal(got.memoryRouting.present, true);
    assert.equal(got.memoryRouting.ownerPath, raw.source_path);
    assert.equal(got.memoryRouting.anchor, raw.parent_anchor);
    assert.equal(raw.parentless_exception, raw.block_id === 'D8');
    for (const [kind, key] of [['MI-G', 'miG'], ['MI-D', 'miD']]) {
      const section = raw.sections.find(value => value.kind === kind);
      assert.equal(got.memoryRouting[`${key}Anchor`], section.anchor);
      assert.deepEqual(got.memoryRouting[key], section.items.map(item => clean(item.text)));
      for (const item of section.items) assert.ok(source.includes(item.text), item.text);
    }
  });
  check(`${raw.block_id}: actual marked lexer resolves reviewed raw heading lines`, () => {
    const headings = rendererHeadings(source);
    const expected = [{ anchor: raw.framework.anchor, line: raw.framework.start_line },
      ...raw.sections.map(section => ({ anchor: section.anchor, line: section.start_line })),
      ...(raw.parent_anchor ? [{ anchor: raw.parent_anchor, line: raw.parent_start_line }] : [])];
    for (const heading of expected) assert.equal(headings.filter(row => row.anchor === heading.anchor).length, 1, JSON.stringify(heading));
  });
  check(`${raw.block_id}: native LearnerObject exposes attention only`, () => {
    const built = production.buildXizongProductionBlock(block);
    assert.deepEqual(built.blockPreentry, got);
    const object = learner.buildXizongLearnerObject({ block: built });
    for (const [key, role, source] of [['miG', 'CURRENT_TAKEAWAY', 'BLOCK_PREENTRY_MI_G'], ['miD', 'DEFERRED_MEMORY', 'BLOCK_PREENTRY_MI_D']]) {
      const rows = object.slots.blockAttention.filter(row => row.raw.source === source);
      assert.deepEqual(rows.map(row => row.cue), [...new Set(got.memoryRouting[key])]);
      for (const row of rows) {
        assert.equal(row.kind, 'ATTENTION');
        assert.equal(row.attentionRole, role);
        assert.deepEqual(row.displayPolicy, { timing: 'BLOCK_ORIENT' });
        for (const field of ['answerHtml', 'prepared_memory_ref', 'sourceContact', 'learned', 'completed', 'mastery']) assert.equal(row[field], undefined);
      }
    }
  });
  totals.framework += Number(got.framework.present);
  totals.parents += Number(Boolean(got.memoryRouting.anchor));
  totals.miG += got.memoryRouting.miG.length;
  totals.miD += got.memoryRouting.miD.length;
}
check('Accounting is 38 Frameworks, 37 parents, 378/273 rows', () => {
  assert.deepEqual(totals, { framework: 38, parents: 37, miG: 378, miD: 273 });
});
check('Non-B baseline covers all 121 native Blocks across the other seven Systems', () => {
  const current = native.listProjectableXizongSystems().filter(system => system.canonicalId !== 'B')
    .flatMap(system => system.blocks.map(block => `${system.systemId}:${block.blockId}`)).sort();
  const frozen = baseline.blocks.map(block => `${block.system_id}:${block.block_id}`).sort();
  assert.equal(frozen.length, 121);
  assert.deepEqual(current, frozen);
});
for (const prior of baseline.blocks) check(`${prior.block_id}: non-B protected content and reviewed pre-entry`, () => {
  const block = native.loadXizongBlock(prior.system_id, prior.block_id);
  if(prior.block_id==='circulation-b01' && prior.system_id==='circulation') {
    // B1 relocated its packaging into the canonical owner. Keep its independent
    // Core semantic golden and frozen MI-G/MI-D route below; never
    // re-sign the frozen raw snapshot or relax any unreviewed Block.
    assert.ok(block.knowledge);
    assert.equal(sha(JSON.stringify(block.kpRecords.map(k=>Object.fromEntries(
      ['kpId','title','prompt','detailMarkdown','sourceLocator','outlineLocator'].map(key=>[key,k[key]]))))),
      '9fdfd125578bfc36cefa61af658bbd7567dbe27103a46bd355b13d5ba4e1dca6');
    const current=production.compileXizongBlockPreentry(block);
    assert.equal(current.framework.present,false); // Canonical model has its own bound view.
    // Extracted from main962d889 after its raw and whole pre-entry hashes
    // matched the unchanged frozen fixture. Never re-sign that fixture.
    assert.equal(sha(JSON.stringify(current.memoryRouting)),'ad48b07424d2b320d85be403662aa18e36a1fa3380ab2910e056dfcafff49081');
    return;
  } else if (prior.system_id === 'circulation') {
    assert.equal(assertReviewedA1Preentry(block, production.compileXizongBlockPreentry(block),
      fs.readFileSync(path.join(root, block.sourcePath), 'utf8')), true);
  } else if (!['circulation','respiratory','urinary'].includes(prior.system_id)) {
    assert.equal(sha(fs.readFileSync(path.join(root, block.sourcePath))), prior.raw_sha256);
    assert.equal(sha(JSON.stringify(production.compileXizongBlockPreentry(block))), prior.preentry_sha256);
  } else {
    if (assertReviewedA2Preentry(block, production.compileXizongBlockPreentry(block),
      fs.readFileSync(path.join(root, block.sourcePath), 'utf8'))) return;
    assert.equal(sha(beforePromptCalibration(fs.readFileSync(path.join(root, block.sourcePath), 'utf8'))), prior.raw_sha256);
    const current = production.compileXizongBlockPreentry(block);
    current.framework.markdown = beforePromptCalibration(current.framework.markdown + '\n\n').trim();
    assert.equal(sha(JSON.stringify(current)), prior.preentry_sha256);
  }
});

let fixtureNumber = 0;
function fixture(markdown, blockId = 'D1', identity = {}) {
  const file = path.join(fixtureDir, `${String(++fixtureNumber).padStart(3, '0')}.md`);
  fs.writeFileSync(file, markdown);
  return production.compileXizongBlockPreentry({ systemId, systemCanonicalId: 'B', blockId, ...identity, sourcePath: path.relative(root, file) });
}
const values = { g: ['G <120 mmol/L', 'G ≤120 mmol/L'], d: ['D 30–40 mL/h', 'D 2/3 vs 1/3'] };
const normal = '## 4｜Memory Routing\n\n### MI-G｜当前\n- G <120 mmol/L\n- G ≤120 mmol/L\n\n### MI-D｜以后\n- D 30–40 mL/h\n- D 2/3 vs 1/3\n\n## end\n- OUTSIDE\n';
const expect = (got, g = values.g, d = values.d) => {
  assert.deepEqual(got.memoryRouting.miG, g);
  assert.deepEqual(got.memoryRouting.miD, d);
};
const noMemory = got => { expect(got, [], []); assert.equal(got.memoryRouting.present, false); assert.equal(got.memoryRouting.anchor, null); };
check('B numeric fullwidth/ASCII pipes and multi-level numbers preserve exact anchors', () => {
  expect(fixture(normal));
  const text = normal.replace('4｜Memory Routing', '12.2 | Memory Routing').replace('### MI-G', '### 12.2.1|MI-G').replace('### MI-D', '### 12.2.2｜MI-D');
  const got = fixture(text); expect(got); assert.equal(got.memoryRouting.anchor, '12.2 | Memory Routing');
});
for (const blockId of ['D1', 'D9', 'D10', 'D11', 'M1', 'M10']) check(`${blockId}: level-2 genuine parent supported`, () => expect(fixture(normal, blockId)));
for (const blockId of ['D12', 'D23', 'G1', 'G5']) check(`${blockId}: level-1 genuine parent supported`, () => expect(fixture(normal.replace(/^#/gm, ''), blockId)));
check('B wrong-depth parent cannot become authoritative', () => {
  noMemory(fixture(normal.replace(/^#/gm, ''), 'D1'));
  noMemory(fixture(normal, 'D12'));
});
check('B absent parent cannot authorize global MI', () => {
  for (const id of ['D1', 'D9', 'D12', 'M1', 'G5']) noMemory(fixture('## 3｜MI-G\n- G\n## 4｜MI-D\n- D\n', id));
});
check('D8 exact bounded parentless form is retained with null parent', () => {
  const got = fixture('## 3｜MI-G｜当前\n- G <120 mmol/L\n- G ≤120 mmol/L\n## 4｜MI-D｜以后\n- D 30–40 mL/h\n- D 2/3 vs 1/3\n', 'D8');
  expect(got); assert.equal(got.memoryRouting.anchor, null);
});
check('D8 generic inline, wrong-number or wrong-level headings reject', () => {
  for (const text of ['## MI-G\n- G\n## MI-D\n- D\n', '## 1｜MI-G\n- G\n## 2｜MI-D\n- D\n', '### 3｜MI-G\n- G\n### 4｜MI-D\n- D\n']) noMemory(fixture(text, 'D8'));
});
check('D8 duplicate parents never license parentless fallback', () => noMemory(fixture('## Memory Routing\n## Memory Routing\n## 3｜MI-G\n- BAD\n## 4｜MI-D\n- BAD\n', 'D8')));
check('D8 duplicate MI-G fails only that support and nested bodies stay excluded', () => {
  const got = fixture('## 3｜MI-G\n- G\n## 3｜MI-G\n- DUP\n## 4｜MI-D\n- D\n### Nested\n- BAD\n', 'D8');
  expect(got, [], ['D']); assert.equal(got.memoryRouting.miGAnchor, null);
});
check('Both Framework grammar forms are accepted; Reconstruction is excluded', () => {
  for (const title of ['总 Framework', '总 Framework|model', 'Framework', 'Framework｜model']) {
    const got = fixture(`## 2｜${title}\n- MODEL\n## 5｜Framework Reconstruction\n- NOT-OWNER\n`);
    assert.equal(got.framework.anchor, `2｜${title}`); assert.deepEqual(got.framework.items, ['MODEL']);
  }
  assert.equal(fixture('## 5｜Framework Reconstruction\n- BAD\n').framework.present, false);
});
check('Framework ambiguity is counted across both forms before selecting', () => {
  for (const second of ['Framework', '总 Framework']) assert.equal(fixture(`## 总 Framework\n- FIRST\n## ${second}\n- SECOND\n`).framework.present, false);
});
check('Inline MI before/after owner and nested same-name sections cannot shadow or merge', () => {
  const text = '## //MI-D\n- BEFORE\n' + normal.replace('### MI-D', '#### MI-D\n- NESTED\n### MI-D').replace('## end', '#### MI-D\n- NESTED-AFTER\n## end') + '## //MI-D\n- AFTER\n';
  expect(fixture(text));
});
check('Any nested heading ends own-body MI collection', () => expect(fixture(normal.replace('### MI-D', '#### unrelated\n- NESTED\n### MI-D'))));
check('Duplicate direct child rejects only that kind', () => {
  const got = fixture(normal.replace('## end', '### MI-D\n- DUPLICATE\n## end'));
  expect(got, values.g, []); assert.equal(got.memoryRouting.miDAnchor, null);
});
check('Duplicate parents fail closed without global fallback', () => noMemory(fixture(normal + normal)));
check('Parent boundary, absent sibling and diagnostic prefix cannot supply MI-D', () => {
  for (const suffix of ['', '### MI-Diagnostic\n- BAD\n', '## next\n### MI-D\n- BAD\n']) expect(fixture('## Memory Routing\n### MI-G\n- G\n' + suffix), ['G'], []);
});
for (const blockId of ['D0', 'D24', 'D01', 'd1', 'M0', 'M11', 'G0', 'G6']) check(`${blockId}: non-native B identity fails closed`, () => noMemory(fixture(normal, blockId)));
check('Mixed System/canonical identity fails closed', () => {
  noMemory(fixture(normal, 'D1', { systemId: 'respiratory' }));
  noMemory(fixture(normal, 'D1', { systemCanonicalId: 'A3' }));
});
check('Missing B source preserves the explicit all-absent result', () => {
  const got = production.compileXizongBlockPreentry({ systemId, systemCanonicalId: 'B', blockId: 'D1', sourcePath: path.relative(root, path.join(fixtureDir, 'MISSING.md')) });
  noMemory(got); assert.equal(got.framework.present, false); assert.equal(got.framework.anchor, null);
});

const realFramework = '## 2｜总 Framework\n- REAL\n';
const fakeFramework = '## 2｜总 Framework\n- FAKE\n';
const fenceCases = [
  { name: 'two-backtick sequence is not an opener', prefix: '``md\n' },
  { name: 'three-space opener and longer closer', prefix: `   \`\`\`md\n${fakeFramework}  \`\`\`\`\`\n` },
  { name: 'four-space opener remains indented code', prefix: '    ```md\n' },
  { name: 'tab opener reaches four columns', prefix: '\t```md\n' },
  { name: 'spaces then tab opener reaches four columns', prefix: '  \t```md\n' },
  { name: 'backtick info containing backtick is not opener', prefix: '```in`valid\n' },
  { name: 'tilde info can contain backticks', prefix: `~~~in\`valid\n${fakeFramework}~~~~\n` },
  { name: 'info-string fence line cannot close', prefix: `\`\`\`\n\`\`\`text\n${fakeFramework}\`\`\`\n` },
  { name: 'opposite-character delimiter cannot close', prefix: `\`\`\`\n~~~\n${fakeFramework}\`\`\`\n` },
  { name: 'short closer cannot close', prefix: `\`\`\`\`\n\`\`\`\n${fakeFramework}\`\`\`\`\n` },
  { name: 'four-space closer cannot close', prefix: `\`\`\`\n    \`\`\`\n${fakeFramework}\`\`\`\n` },
  { name: 'tab-indented closer cannot close', prefix: `\`\`\`\n\t\`\`\`\n${fakeFramework}\`\`\`\n` },
  { name: 'trailing spaces can close', prefix: `\`\`\`\n${fakeFramework}\`\`\`   \n` }
];
for (const { name, prefix } of fenceCases) check(`CommonMark and actual renderer: ${name}`, () => {
  const source = prefix + realFramework + normal;
  const headingRows = rendererHeadings(source);
  assert.equal(headingRows.filter(row => row.anchor === '2｜总 Framework').length, 1);
  const got = fixture(source); assert.deepEqual(got.framework.items, ['REAL']); expect(got);
});
check('Unclosed fence hides all later candidate headings', () => {
  const source = '```md\n' + realFramework + normal;
  assert.equal(rendererHeadings(source).length, 0);
  const got = fixture(source); assert.equal(got.framework.present, false); noMemory(got);
});
check('CRLF uses same opener and closer semantics', () => {
  const got = fixture(('```md\n' + fakeFramework + '```text\n```\n' + realFramework + normal).replace(/\n/g, '\r\n'));
  assert.deepEqual(got.framework.items, ['REAL']); expect(got);
});
// These required CommonMark edge cases expose existing renderer deviations.
// Record rather than encode marked 17's defects as authoritative expectations;
// the same test can run under the repository's declared marked ^15 range.
const rendererDeviations = [];
for (const { name, source } of [
  { name: 'closer permits trailing tab', source: '```\n' + fakeFramework + '```\t\n' + realFramework + normal },
  { name: 'mixed-character fence cannot close', source: '```\n```~~~\n' + fakeFramework + '```\n' + realFramework + normal }
]) check(`CommonMark bounded correction: ${name}`, () => {
  const got = fixture(source); assert.deepEqual(got.framework.items, ['REAL']); expect(got);
  const headings = rendererHeadings(source);
  const frameworkCount = headings.filter(row => row.anchor === '2｜总 Framework').length;
  const parentCount = headings.filter(row => row.anchor === '4｜Memory Routing').length;
  if (frameworkCount !== 1 || parentCount !== 1) rendererDeviations.push({ name, frameworkCount, parentCount });
});
check('Raw G5 fence shapes survive packaging changes and reviewed owners still resolve', () => {
  const raw = oracle.blocks.find(row => row.block_id === 'G5');
  const source = fs.readFileSync(path.join(root, raw.source_path), 'utf8');
  const lines = source.split('\n');
  assert.ok(lines.some(line => /^ {4}```/.test(line)));
  assert.ok(lines.some(line => /^```/.test(line)));
  const got = production.compileXizongBlockPreentry(native.loadXizongBlock(systemId, raw.slug));
  assert.equal(got.memoryRouting.miGAnchor, raw.sections.find(row => row.kind === 'MI-G').anchor);
  assert.equal(got.memoryRouting.miDAnchor, raw.sections.find(row => row.kind === 'MI-D').anchor);
});
const require = createRequire(import.meta.url);
const rendererVersion = require('marked/package.json').version;
const report = {
  scope: 'Raw Current full ordered text/owner, actual native LearnerObject attention, non-B stability and adversarial pre-entry proof only; no card admission, Source, browser, canonical-layout or learner-state claims.',
  root, module_sha256: sha(fs.readFileSync(path.join(root, 'static-web/src/lib/xizongProductionProjection.mjs'))),
  oracle_sha256: sha(fs.readFileSync(oraclePath)), rendererVersion, rendererDeviations,
  totals, passed: checks.length, failed: failures.length, checks, failures
};
fs.writeFileSync(path.join(qa, 'xizong-b-preentry.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: checks.length, failed: failures.length, totals, rendererVersion, rendererDeviations, failures }, null, 2));
if (failures.length) process.exitCode = 1;
