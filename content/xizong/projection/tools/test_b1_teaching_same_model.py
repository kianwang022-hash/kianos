"""B1 candidate only: exact annotations and a lossless in-place reading selection.

Run: python3 -B content/xizong/projection/tools/test_b1_teaching_same_model.py
This is mechanical evidence, not medical/Human acceptance or learner evidence.
"""
from pathlib import Path
import hashlib
import json
import re
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[4]
TEACHING = ROOT / 'content/xizong/projection/a1-circulation/chat/b01-teaching.md'
CANONICAL = ROOT / 'content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md'
SHARED = ROOT / 'content/xizong/knowledge/learner/shared-fields.json'
CUES = ROOT / 'content/xizong/knowledge/learner/a1-circulation-learning-cues.json'
BASE_BLOB = '3cd348b092ae30010694d26018740e3f36f9bfaf'
ADDITION = re.compile(r'<!-- b1:view:add -->\n.*?<!-- /b1:view:add -->\n', re.S)
ANNOTATION = re.compile(r'<!-- b1:annotation (\{[^\n]+\}) -->\n\[([^\n]+)\]\(([^\n]+)\)')
DIAGRAM = re.compile(r'```text\n.*?\n```', re.S)
# Reviewed existing semantic nodes, in canonical ID order (not reading order).
LOCATIONS = [73,91,97,157,161,177,165,187,125,131,141,137,139,211,213,217,
             34,247,225,235,255,253,283,297,303,309,325,329,335,321,339,339]
# Exact original clauses stay visible, not merely somewhere in a collapsed body.
PROTECTED = [(36,43),(83,95),(103,103),(117,125),(129,131),(135,141),
             (161,165),(171,171),(179,187),(206,217),(225,225),(241,255),
             (279,283),(287,289),(293,309),(325,341),(353,353)]


def blob(text):
    raw = text.encode('utf-8')
    return hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def canonical_annotations(text):
    result = {}
    for m in re.finditer(r'^### KP(\d{2})｜([^\n]+)\n(.*?)(?=^### KP|\Z)', text, re.M | re.S):
        prompt = re.search(r'^> \*\*主提示\*\*：([^\n]+)', m[3], re.M)
        require(prompt is not None, 'canonical Prompt missing')
        result['circulation-b01-kp'+m[1]] = (m[2]+'〔'+prompt[1]+'〕', text[:m.start()].count('\n')+1)
    require(len(result) == 32, 'canonical B1 identity count changed: bounded re-review required')
    return result


def inspect(text):
    original = ADDITION.sub('', text)
    require(blob(original) == BASE_BLOB, 'original prose/model/provenance changed')
    require(text.count('<!-- b1:view:add -->') == len(ADDITION.findall(text)), 'uncontrolled addition marker')
    expected = canonical_annotations(CANONICAL.read_text())
    visible_original, visible_added, bindings = [], [], []
    position, original_lines, depth, folds = 0, 0, 0, 0
    shared = json.loads(SHARED.read_text())
    for insertion in ADDITION.finditer(text):
        source = text[position:insertion.start()]
        if depth == 0:
            visible_original.append(source)
        original_lines += source.count('\n')
        chunk = insertion[0]
        opening, closing = chunk.count('<details>'), chunk.count('</details>')
        require(not (opening and closing), 'fold wrapper must not replace original content')
        if opening:
            require(depth == 0 and opening == 1, 'nested/uncontrolled selection')
            depth, folds = 1, folds+1
        elif closing:
            require(depth == 1 and closing == 1, 'unbalanced selection')
            depth = 0
        elif depth == 0:
            visible_added.append(chunk)
        for binding in ANNOTATION.finditer(chunk):
            meta = json.loads(binding[1])
            kp = meta['kp_id']
            require(depth == 0, 'annotation hidden in compressed view')
            require(kp in expected, 'unknown canonical identity')
            require(binding[2] == expected[kp][0], 'title/full Prompt drift')
            require(meta['canonical_line'] == expected[kp][1], 'canonical locator drift')
            require(original_lines == meta['after_original_line'] == LOCATIONS[int(kp[-2:])-1], 'annotation relocated')
            require(binding[3].endswith(CANONICAL.name+'?plain=1#L'+str(expected[kp][1])), 'annotation destination drift')
            if 'retention_selector' in meta:
                node = shared
                for segment in meta['retention_selector'].strip('/').split('/'):
                    require(segment in node, 'nonexistent retention selector')
                    node = node[segment]
            bindings.append(kp)
        position = insertion.end()
    tail = text[position:]
    if depth == 0:
        visible_original.append(tail)
    require(depth == 0 and folds == 15, 'selection must retain its 15 original in-place folds')
    require(len(bindings) == len(set(bindings)) == 32, '32 exact bindings required once each')
    require(bindings == sorted(bindings, key=lambda k: LOCATIONS[int(k[-2:])-1]), 'KP ordering replaced original reading order')
    visible = ''.join(visible_original)
    require(DIAGRAM.findall(text) == DIAGRAM.findall(original) == DIAGRAM.findall(visible), 'model diagram added, changed or hidden')
    require(len(DIAGRAM.findall(visible)) == 10, 'all ten original diagrams required')
    source_lines = original.splitlines()
    for start,end in PROTECTED:
        for number in range(start,end+1):
            if source_lines[number-1].strip():
                require(source_lines[number-1] in visible, f'protected original line {number} hidden')
    default = visible + ''.join(visible_added)
    default = re.sub(r'<!--.*?-->', '', default, flags=re.S)
    # Link destinations/metadata can carry identities; the visible labels cannot.
    default = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', default)
    require(not re.search(r'\b(?:KP|LG)\d+', default), 'default ID skeleton exposed')
    require(len(visible) < len(original)*0.85, 'selection does not actually compress the original')
    additions = '\n'.join(ADDITION.findall(text))
    for label,destination in re.findall(r'\[([^\]]+)\]\(([^)]+)\)', additions):
        parsed = urlsplit(destination)
        require(not parsed.scheme and parsed.query == 'plain=1', 'use local current-owner line links')
        path = (TEACHING.parent / unquote(parsed.path)).resolve()
        require(path in [CANONICAL, SHARED, CUES], 'new duplicate/external knowledge owner')
        match = re.fullmatch(r'L(\d+)', parsed.fragment)
        require(path.is_file() and match and 0 < int(match[1]) <= len(path.read_text().splitlines()), 'broken destination')
    cues = json.loads(CUES.read_text())
    require(len(cues['precision_index']) == 13, 'prepared index changed: re-review destinations')
    for token in ['现有 Precision 索引','已有 retention 元数据','正常静息充盈比例及条件',
                  '检查指标与 E/A 的解释条件','全部十项原图要求','当前选择性图像定位',
                  '原资料与短接口范围','六条反事实链','进入 B2 前十二问','即时机制及边界','延后精度类别']:
        require(token in default, 'model-external destination hidden/missing: '+token)
    require('"status":"CANDIDATE_DERIVATION"' in original and '"medical_authority":false' in original, 'candidate boundary changed')
    return {'annotations':32,'original_blob':blob(original),'unchanged_visible_diagrams':10,
            'folds':folds,'visible_original_bytes':len(visible.encode()),'original_bytes':len(original.encode()),
            'medical_or_human_acceptance':False}


class B1SameModelTest(unittest.TestCase):
    def test_current_candidate(self):
        print(json.dumps(inspect(TEACHING.read_text()), ensure_ascii=False, sort_keys=True))

    def test_adversarial_mutations_fail_closed(self):
        text = TEACHING.read_text()
        first = ANNOTATION.search(text)
        first_unit = next(m[0] for m in ADDITION.finditer(text) if first[0] in m[0])
        changed = {
            'truncated_prompt': text.replace('名称→结构→功能｜最重要', '名称→结构→功能', 1),
            'relocated_annotation': text.replace(first_unit, '', 1)+first_unit,
            'changed_model': text.replace('静脉把血送回来 → 心室得到充盈', '静脉把血送回来 ← 心室得到充盈', 1),
            'changed_prose': text.replace('相反，EF保留并不能排除', '相反，EF保留可以排除', 1),
            'duplicate_annotation': text+first_unit,
            'stale_locator': text.replace('"canonical_line":383','"canonical_line":382',1),
            'exposed_skeleton': text+'<!-- b1:view:add -->\n## KP17\n<!-- /b1:view:add -->\n',
            'missing_destination': text.replace('全部十项原图要求', '来源另查', 1),
        }
        # Keep original bytes intact but extend an existing fold over protected CI text.
        closer = '<!-- b1:view:add -->\n\n</details>\n\n<!-- /b1:view:add -->\n'
        source = '输出建立在充盈与排空条件上；'
        start = text.index(source)
        end = text.index(closer, start)
        after_ci = text.index('\n', text.index('CI用体表面积标准化CO', end))+1
        changed['hidden_condition'] = text[:end]+text[end+len(closer):after_ci]+closer+text[after_ci:]
        for name, mutation in changed.items():
            with self.subTest(name=name), self.assertRaises(AssertionError):
                inspect(mutation)


if __name__ == '__main__':
    unittest.main()
