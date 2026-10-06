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
const oracle = JSON.parse(fs.readFileSync(new URL('./fixtures/a3-reviewed-memory-browser.json', import.meta.url), 'utf8'));
const fixture = { rows, reviewed: oracle.rows };
const out = process.env.KIANOS_QA_DIR || path.join(root, 'static-web/.qa');
fs.mkdirSync(out, { recursive: true });
const fixturePath = path.join(out, 'memory-presentation-fixture.json');
fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + '\n');

// Independent HTML tree and closed-details reader, using only Python stdlib.
// This is native HTML proof, not a browser/pixel or learner-effectiveness claim.
const report = execFileSync('python3', ['-c', String.raw`
import json, sys
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
    assert before.text()==after.text(), (name,'all raw text and order must be exact, including audit records')
    main=after.all(attr='data-memory-prepared-answer'); assert len(main)==1, name
    raw=before.all('p')[0].text(); assert main[0].text()==raw, (name,'raw answer fidelity')
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
print(json.dumps({'status':'PASS','native_cards':len(data['rows']),'b3_groups':[2,1,1,3],'b5_authored_steps':6,'proof':'Parsed native HTML; exact full text/order, raw answer, independent A3 oracle, visible conditions/aids and provenance-only disclosure. No browser or learner claim.'},ensure_ascii=False))
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
console.log(report.trim());
