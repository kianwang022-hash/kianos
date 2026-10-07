import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { preparedMemoryPresentationHtml } from '../src/lib/xizongMemoryPresentation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.env.KIANOS_REPO_ROOT = root;
const { loadXizongBlock, loadXizongSystem } = await import('../src/lib/xizong.mjs');
const { buildXizongProductionBlock } = await import('../src/lib/xizongProductionProjection.mjs');
const { loadXizongLearningCues, learningCuesForBlock } = await import('../src/lib/xizongLearningCues.mjs');
const { buildXizongLearnerObject } = await import('../src/lib/xizongLearnerObject.mjs');
const { buildXizongRevisionWitness } = await import('../src/lib/xizongRevisionWitness.mjs');
const { buildXizongPreparedMemoryAvailability, supportsXizongPreparedMemoryBlock } = await import('../src/lib/xizongMemoryRelease.mjs');
const { createXizongMemoryState, makePreparedMemoryAvailable, appendMemoryEvidence } = await import('../src/lib/xizongMemoryModel.mjs');
const rows = [];
for (const [systemId, prefix, count] of [['circulation', 'b', 12], ['respiratory', 'r', 12], ['urinary', 'b', 14]]) {
  const cues = loadXizongLearningCues(loadXizongSystem(systemId));
  for (let n = 1; n <= count; n++) {
    const block = buildXizongProductionBlock(loadXizongBlock(systemId, `${prefix}${String(n).padStart(2, '0')}`));
    if (!supportsXizongPreparedMemoryBlock(block.blockId)) continue;
    const object = buildXizongLearnerObject({ block, learningCues: learningCuesForBlock(cues, block) });
    object.revisionWitness = buildXizongRevisionWitness(object);
    const descriptor = buildXizongPreparedMemoryAvailability(object);
    const before = JSON.stringify(descriptor);
    let state = makePreparedMemoryAvailable(createXizongMemoryState(), descriptor, '2026-10-01');
    state = appendMemoryEvidence(state, { cardId: descriptor.precisionCards[0].id, rating: 'known' }, '2026-10-01');
    const stored = JSON.stringify(state);
    for (const card of descriptor.precisionCards) {
      const presented = preparedMemoryPresentationHtml(card.answerHtml);
      assert.equal(preparedMemoryPresentationHtml(presented), presented, `${card.id}: repeat display is idempotent`);
      rows.push({ id: card.id, raw: card.answerHtml, presented });
    }
    assert.equal(JSON.stringify(descriptor), before, `${block.blockId}: descriptor/ref/raw answer identity unchanged`);
    assert.equal(JSON.stringify(state), stored, `${block.blockId}: display does not mutate evidence/history`);
    assert.deepEqual(makePreparedMemoryAvailable(state, descriptor, '2026-10-02'), state, `${block.blockId}: view formatting creates no revision or refresh`);
  }
}
assert.equal(rows.length, 230);
// B extends the same consumer: compare complete native answers, not rewritten
// fixtures. Display adaptation must not change a descriptor or stored evidence.
const bCues = loadXizongLearningCues(loadXizongSystem('digestive-metabolic-endocrine-tumor'));
const bSystem = loadXizongSystem('digestive-metabolic-endocrine-tumor');
for (const entry of bSystem.blocks) {
  const block = buildXizongProductionBlock(loadXizongBlock(bSystem.systemId, entry.blockId));
  const object = buildXizongLearnerObject({ block, learningCues: learningCuesForBlock(bCues, block) });
  object.revisionWitness = buildXizongRevisionWitness(object);
  if (!supportsXizongPreparedMemoryBlock(block.blockId)) continue;
  const descriptor = buildXizongPreparedMemoryAvailability(object);
  const original = JSON.stringify(descriptor);
  const state = makePreparedMemoryAvailable(createXizongMemoryState(), descriptor, '2026-10-01');
  const saved = JSON.stringify(state);
  for (const card of descriptor.precisionCards) {
    const presented = preparedMemoryPresentationHtml(card.answerHtml);
    assert.equal(preparedMemoryPresentationHtml(presented), presented);
    rows.push({ id: card.id, raw: card.answerHtml, presented });
  }
  assert.equal(JSON.stringify(descriptor), original);
  assert.equal(JSON.stringify(state), saved);
  assert.deepEqual(makePreparedMemoryAvailable(state, descriptor, '2026-10-02'), state);
}
assert.equal(rows.length, 272, 'all 230 prior A and 42 reviewed B cards');
const oracle = JSON.parse(fs.readFileSync(new URL('./fixtures/a3-reviewed-memory-browser.json', import.meta.url), 'utf8'));
const fixture = { rows, reviewed: oracle.rows };
const out = process.env.KIANOS_QA_DIR || path.join(root, 'static-web/.qa');
fs.mkdirSync(out, { recursive: true });
const fixturePath = path.join(out, 'memory-presentation-fixture.json');
fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + '\n');

// Independent HTML tree and closed-details reader, using only Python stdlib.
// This is native HTML proof, not a browser/pixel or learner-effectiveness claim.
const report = execFileSync('python3', ['-c', String.raw`
import json, sys, re
from html.parser import HTMLParser
class Node:
    def __init__(self, tag='', attrs=()): self.tag=tag; self.attrs=dict(attrs); self.children=[]
    def text(self): return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
    def all(self, tag=None, attr=None):
        return [x for x in self.children if isinstance(x,Node) for x in ([x] if (tag is None or x.tag==tag) and (attr is None or attr in x.attrs) else [])+x.all(tag,attr)]
    def visible(self):
        if 'hidden' in self.attrs: return ''
        if self.tag=='details' and 'open' not in self.attrs: return ''.join(x.visible() for x in self.children if isinstance(x,Node) and x.tag=='summary')
        return ''.join(x if isinstance(x,str) else x.visible() for x in self.children)
class Tree(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True); self.root=Node(); self.stack=[self.root]; self.feed(html); assert len(self.stack)==1
    def handle_starttag(self, tag, attrs):
        node=Node(tag,attrs); self.stack[-1].children.append(node)
        if tag not in ('br','hr','img','input','meta','link','wbr'): self.stack.append(node)
    def handle_endtag(self, tag): assert self.stack[-1].tag==tag, (tag,self.stack[-1].tag); self.stack.pop()
    def handle_data(self, data): self.stack[-1].children.append(data)
data=json.load(open(sys.argv[1])); reviewed={x['id']:x for x in data['reviewed']}; trees={}
for row in data['rows']:
    before=Tree(row['raw']).root; after=Tree(row['presented']).root; name=row['id']; trees[name]=after
    main=after.all(attr='data-memory-prepared-answer'); assert len(main)==1, name
    raw=before.all('p')[0].text()
    tables=main[0].all('table')
    if tables:
        reviewed_tables={
            'precision:B10-M23':(['类别','恢复要点'],4),
            'precision:B10-M32':(['模式','起搏','感知','典型适合'],4),
            'precision:B11-M02':(['分期','状态'],4),
            'precision:b-d15-lg06-dentate-line':(['轴','齿状线以上','齿状线以下'],9),
            'precision:xpg_b85cb6960f8b0b25':(['药组','主要限制与阈值'],4),
            'precision:xpg_03f70b43216a1f2e':(['CVP','BP','按本节 Study 推断','处理方向'],4),
        }
        assert name in reviewed_tables, (name,'no unreviewed table inference')
        assert len(tables)==1 and len(tables[0].all('thead'))==1 and len(tables[0].all('tbody'))==1
        rawlines=raw.splitlines()
        first=next(i for i,x in enumerate(rawlines) if '|' in x)
        prefix=''
        if rawlines[first].lstrip().startswith('|'):
            tablelines=[x for x in rawlines[first:] if x.strip().startswith('|')]
        else:
            at=rawlines[first].index('|'); prefix=rawlines[first][:at]
            tablelines=[rawlines[first][at:]]+[x for x in rawlines[first+1:] if x.strip().startswith('|')]
        cells=lambda line:[x.strip() for x in line.strip()[1:-1].split('|')]
        expected_header=cells(tablelines[0]); expected_rows=[cells(x) for x in tablelines[2:]]
        assert expected_header==reviewed_tables[name][0]
        assert len(expected_rows)==reviewed_tables[name][1] and all(len(x)==len(expected_header) for x in expected_rows)
        assert [x.text() for x in tables[0].all('th')]==expected_header
        assert all(x.attrs.get('scope')=='col' for x in tables[0].all('th'))
        actual=[[x.text() for x in tr.all('td')] for tr in tables[0].all('tbody')[0].all('tr')]
        assert actual==expected_rows, (name,'every cell, column, condition and order retained')
        prose=([prefix] if prefix else [])+[x for j,x in enumerate(rawlines) if x and j<first and x!=prefix]
        prose += [x for x in rawlines[first+len(tablelines):] if x and not x.strip().startswith('|')]
        assert [p.text() for p in main[0].all('p')]==prose, (name,'outside-table prose exact and ordered')
        if name=='precision:b-d15-lg06-dentate-line':
            assert '必须回原图' in main[0].visible()
            assert [x[0] for x in actual]==['外科分界','胚层','表面','动脉','静脉','淋巴','神经','癌','痔']
            assert '直肠下/骶正中' in actual[3][1] and '髂内' in actual[5][1]
        elif name=='precision:B10-M23':
            assert [x[0] for x in actual]==['阵发性','持续性','长期持续/持久性','永久性']
            assert '四类不必逐级必然演变' in main[0].visible()
        elif name=='precision:B10-M32':
            assert [x[0] for x in actual]==['VVI','AAI','VDD','DDD']
            for qualifier in ['I为抑制','不能机械选AAI','模式切换需设备评估']:
                assert qualifier in main[0].visible()
        elif name=='precision:B11-M02':
            assert [x[0] for x in actual]==['A','B','C','D']
        elif name=='precision:xpg_b85cb6960f8b0b25':
            assert [x[0] for x in actual]==['ACEI/ARB/ARNI一般安全','MRA','SGLT2i','sGC刺激剂维立西呱']
            assert '风险核对，不替代具体制剂说明书' in main[0].visible()
        elif name=='precision:xpg_03f70b43216a1f2e':
            assert [x[0] for x in actual]==['低','低','高','高']
            assert '补液试验' in main[0].visible() and '不能盲目补液' in main[0].visible()
        assert all(x.visible()==x.text() for x in tables[0].all('th')+tables[0].all('td'))
    else:
        assert before.text()==after.text(), (name,'all raw text and order must be exact, including audit records')
        assert main[0].text()==raw, (name,'raw answer fidelity')
        assert main[0].visible()==raw, (name,'conditions and risks visible after Reveal')
    assert not main[0].all('details'), (name,'answer must not fold')
    for p in before.all('p')[1:]:
        label=p.all('strong')
        if label and label[0].text() not in ('来源（保留记录，非本次原文核验）：','来源引用：'):
            assert p.text() in after.visible(), (name,'qualification/aid hidden',p.text())
    for details in after.all('details'):
        assert 'data-memory-provenance' in details.attrs
        assert details.children[0].tag=='summary'
        assert details.children[0].text() in ('来源（保留记录，非本次原文核验）：','来源引用：')
    if name.removeprefix('precision:') in reviewed:
        expected=reviewed[name.removeprefix('precision:')]
        assert main[0].text()==expected['answer'], (name,'independent raw answer')
        assert expected['mnemonic'] in after.visible(), (name,'aid visible next to answer')
        for ref in expected['source_refs']: assert ref in after.text()
b3=trees['precision:a3-b03-lg05-precision']; groups=b3.all(attr='data-memory-answer-group')
assert [g.all('strong')[0].text() for g in groups]==['PCT：','TAL：','DCT：','集合管主细胞：']
assert [len(g.all('li')) for g in groups]==[2,1,1,3]
assert len(b3.all('li'))==7
for text in ['课程保留低K接口','高K风险','不是直接阻断升粗水回收','Liddle的醛固酮已低','患者选择不在本章Source范围']:
    assert text in b3.visible(), text
assert 'https://' not in b3.visible()
b5=trees['precision:a3-b05-lg06-precision']; main=b5.all(attr='data-memory-prepared-answer')[0]
assert len(main.all('p'))==6, 'six authored diagnostic steps, not one wall of text'
for text in ['生命支持优先于计算','1.5×HCO₃⁻+8±2','0.6–0.75','约55','急性HCO₃⁻约升1–2','慢性约升3–4','慢性约降4–5','明显低白蛋白先校正','delta是HAGMA条件下','不能脱离病程','不扩水NaKCa阈值']:
    assert text in b5.visible(), text
print(json.dumps({'status':'PASS','native_cards':len(data['rows']),'b3_groups':[2,1,1,3],'b5_authored_steps':6,'table_cards':6,'proof':'Parsed native HTML; exact non-table text/order and authored table cells/order; raw answer and descriptor unchanged; independent A3 oracle and all visible conditions/aids retained. No browser or learner claim.'},ensure_ascii=False))
`, fixturePath], { encoding: 'utf8' });

for (const legacy of ['<p>ordinary Core</p>', '<section data-prepared-memory="future"><ul><li>already authored</li></ul></section>']) {
  assert.equal(preparedMemoryPresentationHtml(legacy), legacy);
}
const escaped = '<section data-prepared-memory="fixture"><p>A：①&lt;script&gt; &amp; dose &lt;40\nB：②&gt;2\n适用范围：never hide</p><p><strong>来源差异：</strong>visible condition</p><p><strong>处理边界：</strong>visible risk</p></section>';
const presented = preparedMemoryPresentationHtml(escaped);
assert.ok(!presented.includes('<script>')); assert.ok(!presented.includes('<details'));
assert.ok(presented.includes('dose &lt;40')); assert.ok(presented.includes('visible condition'));
const workspace = fs.readFileSync(path.join(root, 'static-web/src/components/XizongMemoryWorkspace.astro'), 'utf8');
assert.match(workspace, /if \(item\.family === 'CORE'\) return item\.coreHtml/);
assert.match(workspace, /if \(item\.answerHtml\) return preparedMemoryPresentationHtml\(item\.answerHtml\)/);
assert.match(workspace, /if \(answer\) answer\.hidden = !revealed/);
assert.match(workspace, /const precisionRecall = \(item\) => item\.family === 'PRECISION'/);
assert.doesNotMatch(workspace, /nativePrecisionRecall|A2\/A3\/B Recall uses/);
console.log(report.trim());


{
const wrap = value => `<section data-prepared-memory="synthetic"><p>${value}</p><p><strong>适用范围：</strong>keep</p></section>`;
const unsupportedTables = [
  '| A | B |\n| - | - |\n| x | y |',
  '| A | B |\n| --- | --- |\n| x |',
  '| A | B |\n| --- | --- |\n| x | y | z |',
  '| A | B |\n| --- | --- |',
  '| A | B |\n| --- | --- |\n| x\\|x | y |',
  '| A | B |\n| --- | --- |\n| `x|x` | y |',
  '| A | B |\n| --- | --- |\n| --- | --- |',
  '| A |  |\n| --- | --- |\n| x | y |',
  'A | B\n--- | ---\nx | y',
  '```text\n| A | B |\n| --- | --- |\n| x | y |\n```',
  '~~~\n| A | B |\n| --- | --- |\n| x | y |\n~~~',
];
for (const raw of unsupportedTables) {
  const rendered = preparedMemoryPresentationHtml(wrap(raw));
  assert(!rendered.includes('<table>'), raw);
  assert.equal(rendered.replace(/<[^>]+>/g, ''), wrap(raw).replace(/<[^>]+>/g, ''));
}
const prefixed = preparedMemoryPresentationHtml(wrap('风险核对：| class | threshold |\n| --- | --- |\n| A | &lt;5 |\n| B | ≥5 |\nqualification stays'));
assert(prefixed.includes('<p>风险核对：</p>'));
assert(prefixed.includes('<table>'));
assert(prefixed.includes('<th scope="col">class</th>'));
assert(prefixed.includes('<td>&lt;5</td>'));
assert.equal(preparedMemoryPresentationHtml(prefixed), prefixed);
const malformedPrefixed = preparedMemoryPresentationHtml(wrap('风险核对 | A | B |\n| --- | --- |\n| x | y |'));
assert(!malformedPrefixed.includes('<table>'));

const escaped = preparedMemoryPresentationHtml(wrap('| value | limit |\r\n| :--- | ---: |\r\n| &lt;script&gt; | &lt;120 &amp; ≥2 |\r\nqualification stays'));
assert(escaped.includes('<th scope="col">value</th>'));
assert(escaped.includes('<td>&lt;script&gt;</td>'));
assert(escaped.includes('<td>&lt;120 &amp; ≥2</td>'));
assert(!escaped.includes('<script>'));
assert(escaped.includes('<p>qualification stays</p>'));
assert.equal(preparedMemoryPresentationHtml(escaped), escaped);
console.log('PASS authored-table bounds: rectangular cells only; malformed/ambiguous/code syntax stays text; escaped content and qualifications preserved');

}
