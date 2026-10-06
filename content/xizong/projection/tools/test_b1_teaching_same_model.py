"""B1 compact reading integrity, not medical/Human adoption or learner evidence.

Run: python3 -B content/xizong/projection/tools/test_b1_teaching_same_model.py
Optionally set B1_RENDERED_HTML to a real Markdown renderer's full HTML output.
That test reads the actual closed-details HTML and verifies the same node tree.
Counts are diagnostics. Whole-route reading review is still required separately.
"""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import os
import re
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[4]
TEACHING = ROOT / 'content/xizong/projection/a1-circulation/chat/b01-teaching.md'
CANONICAL = ROOT / 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md'
SHARED = ROOT / 'content/xizong/knowledge/learner/shared-fields.json'
CUES = ROOT / 'content/xizong/knowledge/learner/a1-circulation-learning-cues.json'
BASE_BLOB = '3cd348b092ae30010694d26018740e3f36f9bfaf'
SOURCE = re.compile(r'<!-- b1:source (\d+):(\d+) -->\n(.*?)<!-- /b1:source -->', re.S)
NODE = re.compile(r'^( *)- \[([^\n]+)\]\(([^\n]+)\)：(.+) <!-- b1:node (\{[^}\n]+\}) -->$', re.M)
EXTERNAL = re.compile(r'\[([^\n\]]+)\]\(([^\n)]+)\)<!-- b1:external (\{[^}\n]+\}) -->')
LINK = re.compile(r'\[([^\n\]]+)\]\(([^\n)]+)\)')

# Existing mechanical route, not KP sort order or a requirement for all KPs inline.
SPINE = [
    '主路：①充盈／周期 → ②SV／CO → ③动脉储器／阻力 → ④微循环交换 → ⑤静脉回收与再次充盈。',
    '并行供养：③主动脉分出冠脉 → ⑥供养心肌 → 维持下一搏。',
]
# The permitted semantic home follows the existing B1 model. Any KP may instead
# have an explicit canonical external destination; coverage does not create nodes.
HOMES = {1:{1,2,3,9}, 2:set(range(4,9))|set(range(10,17)),
         3:set(range(17,23)), 4:{25,26}, 5:{23,24}, 6:set(range(27,33))}
HEADINGS = ['① 回心进入心室', '② 充盈与排空形成输出', '③ 血进入动脉',
            '④ 分配到微循环', '⑤ 静脉把血送回', '⑥ 同时，主动脉分出冠脉']
# Snapshot only the bounded compact relation/condition clauses under review.
# This is regression evidence, not a new medical owner or immutable format.
# An intentional medical meaning change requires source-owner review, not updating
# this oracle just to make a failing candidate pass.
RELATIONS = {'circulation-b01-kp09': '主动舒张／弹性回缩＋顺应性＋房室压差支持充盈 → EDV；主动舒张≠被动顺应性，房颤丢房缩，快室率再丢舒张时间。',
 'circulation-b01-kp01': '等容收缩 → 快速射血 → 减慢射血 → 等容舒张 → 快速充盈 → 减慢充盈 → 心房收缩，接回下一搏。',
 'circulation-b01-kp02': '压差定开闭，两瓣均闭时容积不变；S1／S2定位关闭，S3／S4定位充盈。减慢射血后段可有惯性前流，不能把瞬时压差写成绝对流向。',
 'circulation-b01-kp04': 'EDV − ESV＝SV；三种影响要分开：',
 'circulation-b01-kp05': '一定范围内初长度增加 → 本搏输出增加；EDP近似EDV时保留顺应性条件。',
 'circulation-b01-kp06': '骤增先使当搏SV↓、ESV↑；后续回心未明显减少时，次搏EDV可↑并发生代偿。',
 'circulation-b01-kp07': '相近负荷下收缩性增强可使ESV↓；实际力同时受前负荷、后负荷、收缩性影响。',
 'circulation-b01-kp08': 'CO＝HR×SV；过快HR缩短充盈，SV可降到使CO反降。CI按体表面积比较，不是做功。',
 'circulation-b01-kp14': '同一搏投到P–V轴：右EDV、左ESV、宽SV；前负荷改充盈端，后负荷与收缩性改排空，顺应性改舒张关系，均按单变量条件核验。',
 'circulation-b01-kp22': '收缩期大动脉扩张储能，舒张期回弹继续推动血流；CO与TPR共同影响MAP。MAP≈CO×TPR须右房压可忽略；五因素方向先固定其余条件。',
 'circulation-b01-kp18': '局部Q≈ΔP/R；理想层流下R∝ηL/r⁴，口径是强旋钮，不能当真实全身的精确圆管算法。',
 'circulation-b01-kp19': '在相应单因素条件下，收缩使阻力↑、局部流量↓，并联动毛细血管压与交换；全身血压与局部血流不是同一量。',
 'circulation-b01-kp25': '微动脉分流 → 真毛细血管交换 → 微静脉回收；营养／直捷／动静脉短路功能不同，由三闸门调节，不能用总流量代替有效交换。',
 'circulation-b01-kp26': '交换床连组织液与淋巴回收；静水压↑、血浆胶体渗透压↓、通透性↑或淋巴受阻均可进入水肿。经典四力有适用范围，组织水多不等于有效循环量多。',
 'circulation-b01-kp24': '外周静脉与右房的压差驱动回流 → '
                         '右心接受与再充盈；送血看容量／张力／分布／泵，接受看排空／松弛／顺应性／外压。自主吸气不等于正压通气，节律肌泵不等于持续压迫。',
 'circulation-b01-kp23': '回心量与右心泵出共同决定CVP；右心泵出增强可使CVP↓而回流↑。CVP不是血容量计；大静脉塌陷等限制使回流不随右房压降低而无限增加。',
 'circulation-b01-kp27': '左室收缩压迫壁内血管，左冠更依赖舒张期；有效灌注压近似主动脉舒张压−左室舒张末压。右冠并非只在收缩期灌注，时相受压力等条件影响。',
 'circulation-b01-kp28': '供氧看灌注压／时间／阻力及携氧；HR过快既缩短舒张供血时间又可增耗氧，供需两端一起判。',
 'circulation-b01-kp29': '心肌工作↑ → 耗氧↑ → 局部代谢舒张可盖过交感直接缩血管；局部受体作用与完整器官净效应分开。'}


def require(ok, message):
    if not ok:
        raise AssertionError(message)


def blob(text):
    raw = text.encode('utf-8')
    return hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()


def canonical_annotations(text):
    result = {}
    for m in re.finditer(r'^### KP(\d{2})｜([^\n]+)\n(.*?)(?=^### KP|\Z)', text, re.M | re.S):
        prompt = re.search(r'^> \*\*主提示\*\*：([^\n]+)', m[3], re.M)
        require(prompt is not None, 'canonical Prompt missing')
        result['circulation-b01-kp'+m[1]] = (m[2]+'〔'+prompt[1]+'〕', text[:m.start()].count('\n')+1)
    require(bool(result), 'canonical identities unavailable')
    return result


def default_markdown(text):
    """Preserve document order AND all visible additions; closed bodies are omitted."""
    visible, closed = [], []
    for line in text.splitlines(keepends=True):
        if re.match(r'^<details(?:\s[^>]*)?>', line):
            closed.append('open' not in line.split('>')[0].split())
            continue
        if line.strip() == '</details>':
            require(bool(closed), 'unbalanced close')
            closed.pop()
            continue
        if line.startswith('<summary>'):
            if not any(closed[:-1]):
                visible.append(re.sub(r'</?summary>', '', line))
        elif not any(closed):
            visible.append(line)
    require(not closed, 'unbalanced fold')
    return ''.join(visible)


def plain(markdown):
    s = re.sub(r'<!--.*?-->', '', markdown, flags=re.S)
    s = LINK.sub(lambda m:m[1], s)
    s = re.sub(r'^#+ ', '', s, flags=re.M).replace('**', '')
    return '\n'.join(line.rstrip() for line in s.splitlines() if line.strip())+'\n'


def check_destination(url, line=None):
    parsed = urlsplit(url)
    require(not parsed.scheme and parsed.query == 'plain=1', 'use current-owner line links')
    path = (TEACHING.parent / unquote(parsed.path)).resolve()
    require(path in [CANONICAL, SHARED, CUES], 'new duplicate/external owner')
    anchor = re.fullmatch(r'L(\d+)', parsed.fragment)
    require(path.is_file() and anchor is not None, 'missing external destination')
    require(0 < int(anchor[1]) <= len(path.read_text().splitlines()), 'broken destination')
    if line is not None:
        require(path == CANONICAL and int(anchor[1]) == line, 'canonical locator drift')


def inspect(text):
    expected = canonical_annotations(CANONICAL.read_text())
    chunks = sorted((int(m[1]), int(m[2]), m[3]) for m in SOURCE.finditer(text))
    require(bool(chunks), 'archival explanation missing')
    next_line = 2
    for start, end, content in chunks:
        require(start == next_line and len(content.splitlines()) == end-start+1, 'archive overlap/gap')
        next_line = end+1
    original = text.splitlines(keepends=True)[0]+''.join(c for _,_,c in chunks)
    require(blob(original) == BASE_BLOB, 'inherited full explanation/source changed')
    require('"status":"CANDIDATE_DERIVATION"' in original and '"medical_authority":false' in original,
            'candidate boundary changed')
    visible = default_markdown(text)
    require('<!-- b1:source ' not in visible, 'article explanation reintroduced as default')
    require(visible.count('<!-- b1:route:start -->') == visible.count('<!-- b1:route:end -->') == 1,
            'continuous route boundary missing')
    route = visible.split('<!-- b1:route:start -->')[1].split('<!-- b1:route:end -->')[0]
    for edge in SPINE:
        require(edge in route, 'main relation or coronary branch changed')
    heads = re.findall(r'^## ([^\n]+)', route, re.M)
    require(len(heads) == len(HEADINGS) and all(h.startswith(want) for h,want in zip(heads,HEADINGS)),
            'mechanical route reordered/disconnected')
    require(route.index(SPINE[0]) < route.index('## ①'), 'model established only after KP entries')
    require('机械变量路线' in visible and '左右室分别应用泵模型，稳态输出接近' in visible,
            'mechanical abstraction boundary missing')

    bindings = {}
    parent = None
    for m in NODE.finditer(visible):
        meta = json.loads(m[5]); kp = meta['kp_id']
        require(kp in expected, 'unknown canonical identity')
        require(m[2] == expected[kp][0], 'altered/truncated canonical title or Prompt')
        require(meta['canonical_line'] == expected[kp][1], 'stale locator metadata')
        check_destination(m[3], expected[kp][1])
        require(kp not in bindings, 'duplicate identity')
        headings = re.findall(r'^## ([①②③④⑤⑥])', visible[:m.start()], re.M)
        require(headings, 'Prompt detached from a model segment')
        home = '①②③④⑤⑥'.index(headings[-1])+1
        require(int(kp[-2:]) in HOMES[home], 'Prompt orphaned from semantic model home')
        require(kp in RELATIONS and m[4] == RELATIONS[kp], 'compact medical relation/condition changed')
        if m[1]:
            require(m[1] == '  ' and kp[-2:] in {'05','06','07'} and parent == 'circulation-b01-kp04',
                    'nested Prompt detached from its SV node')
        else:
            require(kp[-2:] not in {'05','06','07'}, 'SV factor flattened/detached from SV')
            parent = kp
        bindings[kp] = 'model'
    require(len(bindings) == visible.count('<!-- b1:node '), 'Prompt is a separate paragraph/annotation')
    require({'circulation-b01-kp'+str(k).zfill(2) for k in (4,5,6,7,23,24)} <= set(bindings),
            'natural SV factors/CVP/return nodes lost their Prompt ownership')
    require(len(NODE.findall(route)) == len(re.findall(r'^ *- ',route,re.M)),
            'unbound model bullet or explanatory article in default route')
    for m in EXTERNAL.finditer(visible):
        meta = json.loads(m[3]); kp = meta['kp_id']
        require(kp in expected and kp not in bindings, 'unknown/duplicate external identity')
        require(meta['canonical_line'] == expected[kp][1], 'external locator metadata drift')
        check_destination(m[2], expected[kp][1])
        bindings[kp] = 'external'
    require(set(bindings) == set(expected), 'required identity lacks model or explicit external destination')
    require(len(EXTERNAL.findall(visible)) == visible.count('<!-- b1:external '), 'orphan external marker')
    for m in LINK.finditer(visible):
        check_destination(m[2])
    # Reintroducing full old paragraphs is not acceptable compression even if its
    # source wrapper is still closed. Counts alone do not detect this regression.
    for paragraph in re.split(r'\n\s*\n', original):
        if len(paragraph) > 45 and not paragraph.startswith(('<!--','```')):
            require(paragraph not in visible, 'original article paragraph reintroduced in default')
    require(not re.search(r'\b(?:KP|LG)\d+', plain(visible)), 'default ID skeleton exposed')
    cues = json.loads(CUES.read_text()); shared = json.loads(SHARED.read_text())
    admitted = {item['id'] for item in cues['precision_index']}
    all_memory = {item['memory_id'] for key,field in shared['kp_fields'].items()
                  if key.startswith('circulation-b01-')
                  for item in field.get('retention_metadata',{}).get('memory_items',[])}
    retained = {'b01-m03-cycle-flow-volume-extrema','b01-m07-filling-75-25',
                'b01-m11-pathology-arteriole-map','b01-m13-bp-peaks'}
    require(len(admitted) == 13 and all_memory-admitted == retained, 'prepared/retained state changed')
    cvp = shared['kp_fields']['circulation-b01-kp023']['retention_metadata']['memory_items'][0]
    require(cvp['source_conflict']['status'] == 'FAIL_CLOSED', 'CVP Source conflict silently resolved')
    for token in ['现有 Precision 索引','已有准备答案／记忆辅助','4项仍留原语境、未独立准入',
                  '流量／容积极值','正常静息充盈比例及条件','病理细动脉对应','昼夜高峰',
                  '生理4–12 cmH₂O与内科4–12 mmHg各自原语境','全部十项原图要求',
                  '当前选择性图像定位','即时机制与延后精度类别','原资料、Primary和短接口范围',
                  '心肌／心包限制充盈接口','六条反事实链','进入B2前十二问','B1→B2交接']:
        require(token in plain(visible), 'required external material missing: '+token)
    return {'model_owned_prompts':sum(v=='model' for v in bindings.values()),
            'external_kps':sum(v=='external' for v in bindings.values()),
            'archival_original_blob':blob(original), 'default_characters':len(plain(visible)),
            'default_text_blocks':len(plain(visible).splitlines()),
            'medical_or_human_acceptance':False}


class RenderedReader(HTMLParser):
    """Read actual HTML in document order, including summaries and list nesting."""
    def __init__(self):
        super().__init__(); self.details=[]; self.summary=0; self.ignore=0
        self.in_body=False; self.lists=0; self.buf=[]
    def visible(self):
        return self.in_body and not self.ignore and (not self.details or all(self.details)
                or (self.summary and all(self.details[:-1])))
    def newline(self):
        if self.visible() and self.buf and not self.buf[-1].endswith('\n'): self.buf.append('\n')
    def handle_starttag(self, tag, attrs):
        if tag == 'body': self.in_body=True
        if tag in {'script','style','head'}: self.ignore+=1
        if tag == 'details': self.details.append('open' in dict(attrs))
        if tag == 'summary': self.summary+=1
        if tag in {'ul','ol'}: self.lists+=1
        if tag in {'p','li','h1','h2','h3','summary','pre','br'}: self.newline()
        if tag == 'li' and self.visible(): self.buf.append('  '*(self.lists-1)+'- ')
    def handle_endtag(self, tag):
        if tag in {'p','li','h1','h2','h3','summary','pre'}: self.newline()
        if tag == 'body': self.in_body=False
        if tag in {'script','style','head'}: self.ignore-=1
        if tag == 'details': self.details.pop()
        if tag == 'summary': self.summary-=1
        if tag in {'ul','ol'}: self.lists-=1
    def handle_data(self, value):
        if self.visible() and value.strip(): self.buf.append(re.sub(r'\s+',' ',value))
    def text(self):
        return '\n'.join(line.rstrip() for line in ''.join(self.buf).splitlines() if line.strip())+'\n'


class B1SameModelTest(unittest.TestCase):
    def test_current_candidate(self):
        print(json.dumps(inspect(TEACHING.read_text()), ensure_ascii=False, sort_keys=True))

    def test_actual_reader_order_includes_all_additions(self):
        visible = default_markdown(TEACHING.read_text())
        s = plain(visible)
        for first, second in zip(HEADINGS, HEADINGS[1:]):
            self.assertLess(s.index(first),s.index(second))
        self.assertIn('  - 前负荷 → Frank–Starling〔',s)
        self.assertIn('  - 后负荷：',s)
        self.assertIn('  - 收缩性 vs',s)
        self.assertNotIn('若EDV由120增到160',s)
        self.assertIn('最后改变一个输入',s)
        self.assertGreater(s.index('精确记忆与原图'),s.index('⑥ 同时'))

    @unittest.skipUnless(os.environ.get('B1_RENDERED_HTML'),'real renderer HTML not supplied')
    def test_actual_rendered_html_matches_reader(self):
        reader=RenderedReader(); reader.feed(Path(os.environ['B1_RENDERED_HTML']).read_text())
        self.assertEqual(reader.text(),plain(default_markdown(TEACHING.read_text())))

    def test_adversarial_mutations_fail_closed(self):
        text=TEACHING.read_text(); first=NODE.search(text)
        preload=next(m for m in NODE.finditer(text) if '"circulation-b01-kp05"' in m[5])
        ext=EXTERNAL.search(text)
        old_paragraph='等容收缩时，肌肉已在产生张力和压力，只是出口尚未打开，血液还没有被明显排出。'
        mutations={
            'canonical_prompt_altered':text.replace('别称3｜本质｜前负荷→SV（范围）','别称3｜本质',1),
            'prompt_orphaned_as_paragraph':text[:first.start()]+first[0].replace('- [','[',1)+text[first.end():],
            'factor_detached_from_sv':text[:preload.start()]+preload[0][2:]+text[preload.end():],
            'factor_moved_to_coronary':text[:preload.start()]+text[preload.end():]+preload[0],
            'external_destination_missing':text.replace(ext[0],'',1),
            'invented_medical_arrow':text.replace('CO＝HR×SV；过快HR','CO＝HR×SV → CVP必升；过快HR',1),
            'reversed_coronary_branch':text.replace(SPINE[1],SPINE[1].replace('→','←',1),1),
            'article_open_by_default':text.replace('<details>','<details open>',1),
            'article_copied_before_route':text.replace('<!-- b1:route:start -->', '## 压差开门\n\n'+next(p for p in re.split(r'\n\s*\n', text) if p.startswith('等容收缩时，'))+'\n\n<!-- b1:route:start -->',1),
            'original_explanation_modified':text.replace(old_paragraph,old_paragraph.replace('压力','不产生压力',1),1),
            'false_memory_admission':text.replace('4项仍留原语境、未独立准入','4项已经全部准入',1),
            'default_id_skeleton':text+'\n## KP17\n',
        }
        for name,mutation in mutations.items():
            with self.subTest(name=name),self.assertRaises(AssertionError):inspect(mutation)


if __name__ == '__main__':
    unittest.main()
