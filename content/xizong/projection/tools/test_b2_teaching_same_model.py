"""B2 compact reader integrity; not Source-image contact or Human/medical acceptance.

Run with python3 -B. B2_RENDERED_HTML may name a complete actual marked HTML
render, including <body>; the optional test compares its closed-details reader,
order and list hierarchy with the complete default Markdown view. Counts are
reported, not an inline quota. Whole-route independent reading remains required.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import hashlib
import json
import os
import re
import unittest

ROOT = Path(__file__).resolve().parents[4]
TEACHING = ROOT / 'content/xizong/projection/a1-circulation/chat/b02-teaching.md'
CANONICAL = ROOT / 'content/xizong/knowledge/systems/a1-circulation/blocks/Block2_循环调节与容量控制_学习阅读版_v4_最终执行版.md'
LEARNING = ROOT / 'content/xizong/knowledge/learner/a1-circulation-learning.json'
SYSTEM = ROOT / 'content/xizong/knowledge/systems/a1-circulation/system.json'
SHARED = ROOT / 'content/xizong/knowledge/learner/shared-fields.json'
CUES = ROOT / 'content/xizong/knowledge/learner/a1-circulation-learning-cues.json'
BASE_BLOB = 'e2d78d4dfc7f88880a04fc11fb51a88c9f2a4d14'
CANONICAL_BASE_BLOB = '2fe128fcc32374b83a7d584b2eab9a8c8ce0db04'
OLD_EXIT = '窦弓反射为什么快速、双向，却不能长期调压？'
CURRENT_EXIT = '窦弓反射怎样快速、双向缓冲，并与肾—体液长期调压分工？'
SOURCE = re.compile(r'<!-- b2:source (\d+):(\d+) -->\n(.*?)<!-- /b2:source -->', re.S)
NODE = re.compile(r'^( *)- \[([^\n]+)\]\(([^\n]+)\)：(.+) <!-- b2:node (\{[^\n]+\}) -->$', re.M)
EXTERNAL = re.compile(r'\[([^\n\]]+)\]\(([^\n)]+)\)<!-- b2:external (\{[^\n]+\}) -->')
LINK = re.compile(r'\[([^\n\]]+)\]\(([^\n)]+)\)')
HEADINGS = ['① 全身反馈', '② 灌注分配', '③ 容量与时间']
# Semantic homes of the existing B2 three-flow model, not numerical KP order.
# Explicit external destinations remain legal and are included in total coverage.
HOMES = {1: {2, 3, 4, 5, 6, 7}, 2: {14, 15, 16}, 3: {1, 8, 9, 10, 11, 12, 13, 17, 18, 19}}
PARENTS = {7: 5, 14: 16, 9: 8, 10: 9}
SPINE = [
    '全身反馈：压力／气体化学／中央充盈变化 → 相应感知与整合 → 自主神经 → 心脏、微动脉、静脉和肾素入口。',
    '灌注分配：全身命令 ＋ 局部需求与内皮状态 → 实际器官血流；保住血压不等于每处灌注和氧供已恢复。',
    '容量与时间：体液信号 ↔ 肾排出与摄入 → 水盐、ECF与血容量 → 再查灌注和刺激；刺激持续时检验代偿代价。三路同时作用，不是必须逐级启动。',
]
# Snapshot relation clauses of this bounded candidate, not an independent medical
# owner. Do not update the oracle merely to admit a changed meaning: review at the
# current medical owner first. Topology is not inferred from annotation counts.
RELATIONS = {'circulation-b02-kp02': '动脉壁牵张↑ → 传入↑ → 交感↓／迷走↑ → 压力回落；低压反向。重调定改变工作点与敏感性，不等于长期作用为零。', 'circulation-b02-kp03': '低氧／高CO₂／高H⁺先促呼吸，危急低灌注时参与升压与保心脑；脑缺血或颅压↑经脑灌注受威胁进入。约80 mmHg仅是课程情境锚点。', 'circulation-b02-kp04': '中央充盈牵张↑ → 容量卸载；心室扩张／缺血的交感传入则增强交感。两种输入分开，持续缺血可沿耗氧形成反噬。', 'circulation-b02-kp05': '交感分别改HR／收缩性、微动脉阻力、静脉容量和肾素；迷走主要改室上心率／传导。夹静脉利用现有血量，夹微动脉保压不等于局部流量↑。', 'circulation-b02-kp07': '髓质放大应急信号；NA直接β₁作用与升压后的反射性HR↓可并存。Adr方向合看部位、剂量、反射完整性；受体强弱符号不是普适定律。', 'circulation-b02-kp16': '全身保压与重分配 ＋ 局部代谢 → 实际器官血流；活动肌可局部舒张占优。微动脉偏总闸，前括约肌偏局部；真毛细血管无平滑肌。', 'circulation-b02-kp14': '内皮促缩ET与促舒NO／PGI₂／EDHF共同修正局部阻力；NO走sGC–cGMP–PKG，EDHF走超极化。PG家族方向不同，“最强”保留课程条件。', 'circulation-b02-kp08': '肾灌注压↓、致密斑NaCl↓、肾交感β₁↑三入口促肾素；血管紧张素原—肾素→AngⅠ—ACE→AngⅡ；低盐摄入不等于血钠必低，NO—肾素净效应按通路与实验条件。', 'circulation-b02-kp09': 'AngⅡ连起动静脉收缩、交感强化、口渴、醛固酮与ADH，并负反馈肾素；肾内方向依浓度／作用位置，不能推出GFR必升。Ⅱ／Ⅲ的“最强”按原课程比较轴恢复。', 'circulation-b02-kp10': '核受体 → ENaC／泵等表达与转运↑ → 保Na、排K；水潴留依整体水盐处理，不是直接打开水通道。', 'circulation-b02-kp11': '以晶体渗透压为主，并读容量／压力 → V₂–cAMP–PKA–AQP2 → 水通透性↑，重吸收仍需渗透梯度；高浓度V₁另管血管，单一AVP≠垂体后叶素制剂。', 'circulation-b02-kp12': '心房／心室壁负荷↑ → 利钠肽 → 滤过、小管与抑制保钠保水系统共同卸载；BNP是报警／反向代偿，不能当作心衰病因或成功证明。', 'circulation-b02-kp13': '持续压力↑ → 排Na水↑ → ECF／血容量↓ → 回心与CO趋↓ → 压力回落；受肾功能、摄入、激素、血管阻力限制。与窦弓相互联系，ECF不是唯一开关。', 'circulation-b02-kp17': '站立先重分布，失血真丢总量；等渗负荷先增容量，清水先降渗透压，失水相对多才可能渗透压↑。按首变量选支路，短暂站立不强行接数天容量恢复。', 'circulation-b02-kp18': '交感／RAAS／ADH短期救灌注；持续时耗氧、后负荷、潴留／淤血与重构可加重原病，反过来再触发代偿。ANP／BNP仍是反向自救；药物只挂机制断点。', 'circulation-b02-kp19': '首变量 → 直接刺激／感受器 → 泵、阻力、静脉、肾 → 合看局部与水盐反馈 → 刺激解除则回落，持续则检验代价；合上解释仍沿这三路重建。'}


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def blob(text):
    raw = text.encode('utf-8')
    return hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()


def annotations(text):
    result = {}
    for m in re.finditer(r'^## KP(\d{2})｜([^\n]+)\n(.*?)(?=^## KP|\Z)', text, re.M | re.S):
        prompt = re.search(r'^> \*\*主提示\*\*：([^\n]+)', m[3], re.M)
        require(prompt is not None, 'canonical Prompt missing')
        result['circulation-b02-kp' + m[1]] = (m[2] + '〔' + prompt[1] + '〕', text[:m.start()].count('\n') + 1)
    require(bool(result), 'canonical identities missing')
    return result


def default_markdown(text):
    """Keep all default-visible additions in document order, never sorted by KP."""
    visible, closed = [], []
    for line in text.splitlines(keepends=True):
        if re.match(r'^<details(?:\s[^>]*)?>', line):
            closed.append('open' not in line.split('>')[0].split())
        elif line.strip() == '</details>':
            require(bool(closed), 'unbalanced close')
            closed.pop()
        elif line.startswith('<summary>'):
            if not any(closed[:-1]):
                visible.append(re.sub(r'</?summary>', '', line))
        elif not any(closed):
            visible.append(line)
    require(not closed, 'unbalanced fold')
    return ''.join(visible)


def plain(markdown):
    text = re.sub(r'<!--.*?-->', '', markdown, flags=re.S)
    text = LINK.sub(lambda m: m[1], text)
    text = re.sub(r'^#+ ', '', text, flags=re.M).replace('**', '')
    return '\n'.join(line.rstrip() for line in text.splitlines() if line.strip()) + '\n'


def destination(url, line=None):
    parsed = urlsplit(url)
    require(not parsed.scheme and parsed.query == 'plain=1', 'use current-owner links')
    path = (TEACHING.parent / unquote(parsed.path)).resolve()
    require(path in [CANONICAL, SHARED, CUES], 'unknown or duplicate destination owner')
    anchor = re.fullmatch(r'L(\d+)', parsed.fragment)
    require(path.is_file() and anchor is not None, 'missing destination')
    require(0 < int(anchor[1]) <= len(path.read_text().splitlines()), 'broken line destination')
    if line is not None:
        require(path == CANONICAL and int(anchor[1]) == line, 'canonical locator drift')


def inspect(text):
    canonical = CANONICAL.read_text()
    expected = annotations(canonical)
    require(OLD_EXIT not in canonical and canonical.count(CURRENT_EXIT) == 1, 'stale exit premise')
    require(blob(canonical.replace(CURRENT_EXIT, OLD_EXIT)) == CANONICAL_BASE_BLOB,
            'unreviewed canonical change beyond exit alignment')
    chunks = sorted((int(m[1]), int(m[2]), m[3]) for m in SOURCE.finditer(text))
    require(bool(chunks), 'original explanation missing')
    next_line = 1
    for start, end, content in chunks:
        require(start == next_line and len(content.splitlines()) == end-start+1, 'archive gap or overlap')
        next_line = end+1
    original = ''.join(content for _, _, content in chunks)
    require(blob(original) == BASE_BLOB, 'inherited full explanation or historical evidence changed')
    meta = json.loads(re.search(r'^<!-- kianos:reviewed-reading-view (\{.*\}) -->', text)[1])
    require(meta['status'] == 'CANDIDATE_DERIVATION' and meta['medical_authority'] is False, 'candidate boundary')
    require(meta['canonical_blob'] == blob(canonical), 'stale current canonical binding')
    for path, key, value in [(LEARNING, 'learning_value_sha256', json.loads(LEARNING.read_text())['blocks']['circulation-b02']),
                             (SYSTEM, 'system_value_sha256', json.loads(SYSTEM.read_text())['logic_index']['circulation-b02'])]:
        digest = hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
        require(digest == meta[key], 'relevant owner selector changed: ' + str(path))
    visible = default_markdown(text)
    require('<!-- b2:source ' not in visible, 'article explanation returned to default')
    require(visible.count('<!-- b2:route:start -->') == visible.count('<!-- b2:route:end -->') == 1, 'route boundary')
    route = visible.split('<!-- b2:route:start -->')[1].split('<!-- b2:route:end -->')[0]
    heads = re.findall(r'^## ([^\n]+)', route, re.M)
    require(len(heads) == len(HEADINGS) and all(h.startswith(w) for h, w in zip(heads, HEADINGS)), 'three-flow model changed')
    for statement in SPINE:
        require(statement in route and route.index(statement) < route.index('## ①'), 'model no longer precedes annotation')
    bindings, stack = {}, {}
    for m in NODE.finditer(visible):
        data = json.loads(m[5]); kp = data['kp_id']; number = int(kp[-2:]); depth = len(m[1]) // 2
        require(kp in expected and kp not in bindings, 'unknown or duplicate identity')
        require(m[2] == expected[kp][0], 'canonical title/full Prompt truncated or altered')
        require(data['canonical_line'] == expected[kp][1], 'stale locator metadata')
        destination(m[3], expected[kp][1])
        headings = re.findall(r'^## ([①②③])', visible[:m.start()], re.M)
        require(bool(headings), 'Prompt outside the model')
        home = '①②③'.index(headings[-1])+1
        require(number in HOMES[home], 'Prompt orphaned from natural semantic location')
        require(kp in RELATIONS and m[4] == RELATIONS[kp], 'relation or qualifier changed')
        require(len(m[1]) % 2 == 0, 'invalid list depth')
        if number in PARENTS:
            require(depth > 0 and stack.get(depth-1) == PARENTS[number], 'semantic parent detached or flattened')
        else:
            require(depth == 0, 'invented semantic parent')
        stack[depth] = number
        for old_depth in list(stack):
            if old_depth > depth:
                del stack[old_depth]
        bindings[kp] = 'model'
    require(len(bindings) == visible.count('<!-- b2:node '), 'standalone Prompt decoration')
    require(len(NODE.findall(route)) == len(re.findall(r'^ *- ', route, re.M)), 'unbound model list or article')
    for m in EXTERNAL.finditer(visible):
        data = json.loads(m[3]); kp = data['kp_id']
        require(kp in expected and kp not in bindings, 'unknown or duplicate side destination')
        require(data['canonical_line'] == expected[kp][1], 'side destination metadata drift')
        destination(m[2], expected[kp][1]); bindings[kp] = 'external'
    require(set(bindings) == set(expected), 'knowledge lost without model or explicit destination')
    require(len(EXTERNAL.findall(visible)) == visible.count('<!-- b2:external '), 'orphan side marker')
    for m in LINK.finditer(visible):
        destination(m[2])
    for paragraph in re.split(r'\n\s*\n', original):
        if len(paragraph) > 45 and not paragraph.startswith(('<!--', '```')):
            require(paragraph not in visible, 'original article copied into default')
    default = plain(visible)
    require(not re.search(r'\b(?:KP|LG)\d+', default), 'KP/LG-number skeleton exposed')
    for token in ['人体运动充血的必需或唯一机制', '物种与实验条件', '不同轴',
                  '完整名单、来源和药物断点回原知识', '十二个闭卷出口',
                  '17项记忆准备', '8项留Core／Source或后置处置', '6条既有连接',
                  '本候选接入12项准备答案与已有记忆辅助', '仍保留5项',
                  '神经分布待补人体／物种限定', '肾素细胞别名、缓激肽受体配对、ADM名称辨别',
                  'P153–168、P280–284及U013', 'P154反射曲线、P280肾执行',
                  '9门禁、3扩展', '不冒充已渲染或本轮已看', '当前推理依赖图形时就看原图',
                  '窦按摩→B10', '原醛vsLiddle', 'DI／SIADH', '既有B12连接',
                  '历史核对记录保留原日期与原说法']:
        require(token in default, 'required non-model destination or qualification lost: '+token)
    # Verify this page's current inventory against the existing owners. This is
    # candidate disposition accounting, never a quota for this or other Blocks.
    shared = json.loads(SHARED.read_text())
    cues = json.loads(CUES.read_text())
    retained = {item['memory_id'] for kp, field in shared['kp_fields'].items()
                if kp.startswith('circulation-b02-')
                for item in field.get('retention_metadata', {}).get('memory_items', [])}
    admitted = {item['id'] for item in cues['precision_index']
                if item.get('anchor', {}).get('block_id') == 'circulation-b02'}
    held = {'b02-m04-vascular-innervation-distribution', 'b02-m08-renin-cell-aliases',
            'b02-m15-bradykinin-b1-b2', 'b02-m16-adm-not-ca', 'b02-m17-study-vasoactive-extremes'}
    require(admitted <= retained and retained-admitted == held, 'prepared/retained disposition drift')
    require(str(len(retained))+'项记忆准备' in default and
            '本候选接入'+str(len(admitted))+'项准备答案' in default, 'memory inventory text stale')
    return {'model_prompts': sum(v == 'model' for v in bindings.values()),
            'external_kps': sum(v == 'external' for v in bindings.values()),
            'original_blob': blob(original), 'canonical_blob': blob(canonical),
            'default_characters': len(default), 'default_text_blocks': len(default.splitlines()),
            'source_image_or_human_acceptance': False}


class RenderedReader(HTMLParser):
    """Actual HTML closed-details reading with list hierarchy; no pixel claim."""
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


class B2SameModelTest(unittest.TestCase):
    def test_current_candidate(self):
        print(json.dumps(inspect(TEACHING.read_text()), ensure_ascii=False, sort_keys=True))

    def test_default_order_and_hierarchy(self):
        text = plain(default_markdown(TEACHING.read_text()))
        for first, second in zip(HEADINGS, HEADINGS[1:]):
            self.assertLess(text.index(first), text.index(second))
        self.assertIn('  - 儿茶酚胺：', text)
        self.assertIn('  - 内皮素 vs', text)
        self.assertIn('    - 醛固酮：', text)
        self.assertIn('\n- ADH / VP / AVP：', text)
        self.assertNotIn('  - ADH / VP / AVP：', text)
        self.assertLess(text.index('② 灌注分配'), text.index('肾素释放与 RAAS 主链'))
        self.assertLess(text.index('循环调节总算法'), text.index('精确项、原图与临床接口'))

    @unittest.skipUnless(os.environ.get('B2_RENDERED_HTML'), 'actual marked HTML not supplied')
    def test_actual_marked_html_reader(self):
        reader=RenderedReader(); reader.feed(Path(os.environ['B2_RENDERED_HTML']).read_text())
        self.assertEqual(reader.text(), plain(default_markdown(TEACHING.read_text())))

    def test_adversarial_mutations(self):
        text=TEACHING.read_text(); first=NODE.search(text); ext=EXTERNAL.search(text)
        child=next(m for m in NODE.finditer(text) if '"circulation-b02-kp10"' in m[5])
        paragraph='压力感受器实际读取的是血管壁机械牵张。失血要先改变回心、泵出和动脉压力，才能改变这个输入。这一步让你不再把“疾病名字→某反射”死记成固定配对。'
        mutations={
            'truncated_prompt': text.replace('感受器/刺激｜传入｜双向链｜夹闭｜6特点｜重调定｜长短期分工', '感受器/刺激｜传入', 1),
            'orphan_prompt': text[:first.start()]+first[0].replace('- [','[',1)+text[first.end():],
            'missing_external': text.replace(ext[0], '', 1),
            'wrong_external': text.replace('plain=1#L345', 'plain=1#L346', 1),
            'wrong_model_home': text[:first.start()]+text[first.end():]+'\n'+first[0],
            'flattened_renal_execution': text[:child.start()]+child[0].lstrip()+text[child.end():],
            'new_edge': text.replace('ECF与血容量 → 再查灌注', 'ECF与血容量 → GFR必升 → 再查灌注', 1),
            'no_renin_absolute': text.replace('NO—肾素净效应按通路与实验条件', 'NO必抑制肾素', 1),
            'human_species_lost': text.replace('交感胆碱能舒血管保留课程／物种与实验条件', '交感胆碱能舒血管', 1),
            'adh_preparation_lost': text.replace('单一AVP≠垂体后叶素制剂', '单一AVP＝垂体后叶素制剂', 1),
            'ecf_unconditional': text.replace('ECF不是唯一开关', 'ECF是唯一开关', 1),
            'article_default': text.replace('<details>', '<details open>', 1),
            'article_outside_folds': text.replace('<!-- b2:route:start -->', paragraph+'\n\n<!-- b2:route:start -->', 1),
            'archive_lost': text.replace(paragraph, '', 1),
            'stale_canonical_binding': text.replace('"canonical_blob":"'+blob(CANONICAL.read_text())+'"', '"canonical_blob":"stale"', 1),
            'memory_inventory_stale': text.replace('本候选接入12项准备答案', '本候选接入17项准备答案', 1),
            'source_contact_fabricated': text.replace('不冒充已渲染或本轮已看', '本轮全部已看', 1),
        }
        for name, mutation in mutations.items():
            with self.subTest(name=name), self.assertRaises(AssertionError):
                inspect(mutation)


if __name__ == '__main__':
    unittest.main()
