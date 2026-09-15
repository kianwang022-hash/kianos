#!/usr/bin/env python3
"""Apply the Sol-reconciled corrective package for Lexical o3125-o3374.

Semantic authority:
  content/lexical/semantic-reconciliation/o3125-o3374.md

This executor is intentionally bounded. It applies only the 39 reconciled
owner deltas plus the two exact reciprocal relation entrypoints at o0941 and
o4764. It does not activate o3375-o3624 and does not perform opportunistic
cleanup.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
AUDIT_DIR = LEX / "audit" / "vnext-content-execution"
AUTHORITY = LEX / "semantic-reconciliation" / "o3125-o3374.md"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "88eedd381aa7c719467c0e925b4147ac31d68537")
STAMP = "2026-09-15T00:00:00Z"

sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base  # noqa: E402
from lexical_natural_owner import build, dump_json, relation_owner_path  # noqa: E402

TARGETS = {
    3131:"mostly",3135:"motivate",3140:"mourn",3148:"mug",3153:"murder",3162:"must",
    3176:"nap",3179:"narrow",3184:"native",3195:"necessary",3200:"need",3202:"negative",
    3203:"neglect",3214:"network",3215:"neutral",3221:"next",3237:"noisy",3240:"none",
    3241:"nonetheless",3243:"noodle",3248:"normalisation",3251:"northern",3256:"notable",
    3262:"notion",3273:"nuclear",3276:"numb",3296:"objective",3298:"oblige",3312:"occupy",
    3318:"odds",3321:"off",3326:"officer",3334:"omit",3343:"open",3353:"oppose",
    3357:"optical",3367:"orchestra",3368:"order",3373:"organic",
}
REMOTE = {941:"compel", 4764:"subjective"}
AUTHORIZED_NEW = {
    (3162,"epistemic_modal_inference"),
    (3202,"technical_quantitative_electrical"),
    (3202,"diagnostic_test_result"),
    (3214,"it_network_devices"),
    (3215,"scientific_neutral_state"),
    (3343,"receptive_willing"),
    (3343,"exposed_susceptible"),
}
REL_OBJECTIVE = "relation:horizontal:4136d5aa9c72df5f2de6"
REL_OBLIGE = "deep:semantic_contrast:oblige:c7ed001e19c8946c"


def stable(v: Any) -> str:
    return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sense_obj(s: base.Store, o: int, sid: str) -> dict[str, Any]:
    obj = next((x for x in s.record(o).get("senses", []) if x.get("sense_id") == sid), None)
    if obj is None:
        raise RuntimeError(f"ACTIVE_SENSE_MISSING:o{o:04d}:{sid}")
    return obj


def active_by(s: base.Store, o: int, *, pos: str | None = None, contains: tuple[str, ...] = (), exclude: set[str] | None = None) -> dict[str, Any]:
    exclude = exclude or set()
    rows = []
    for x in s.record(o).get("senses", []):
        if x.get("sense_id") in exclude:
            continue
        if pos is not None and x.get("pos") != pos:
            continue
        hay = " ".join(str(x.get(k, "")) for k in ("definition_en", "definition_cn", "sense_label_en", "governing_pattern")).lower()
        if all(c.lower() in hay for c in contains):
            rows.append(x)
    if not rows and contains:
        return active_by(s, o, pos=pos, exclude=exclude)
    if not rows:
        raise RuntimeError(f"ACTIVE_BRANCH_NOT_FOUND:o{o:04d}:pos={pos}:contains={contains}")
    return rows[0]


def sync_colloc(s: base.Store, item: dict[str, Any], sid: str | None = None) -> None:
    cid = item.get("collocation_id")
    if not cid:
        return
    reg = s.colls.get(cid)
    if reg is not None:
        reg["status"] = "active"
        if sid is not None:
            reg["sense_id"] = sid
        reg["current_value_hash"] = base.sha(item)
        s.changed_collocation_ids.add(cid)


def remove_colloc(s: base.Store, o: int, predicate: Callable[[str], bool]) -> int:
    n = 0
    for se in s.record(o).get("senses", []):
        keep = []
        for item in se.get("collocations", []) or []:
            phrase = str(item.get("phrase", ""))
            if predicate(phrase):
                n += 1
                cid = item.get("collocation_id")
                if cid in s.colls:
                    s.colls[cid]["status"] = "deprecated"
                    s.changed_collocation_ids.add(cid)
            else:
                keep.append(item)
        se["collocations"] = keep
    if n:
        s.mark(o)
    return n


def replace_phrase(s: base.Store, o: int, old: str, new: str, meaning: str | None = None) -> int:
    n = 0
    for se in s.record(o).get("senses", []):
        for item in se.get("collocations", []) or []:
            if item.get("phrase") == old:
                item["phrase"] = new
                if meaning is not None:
                    item["meaning_cn"] = meaning
                sync_colloc(s, item, se.get("sense_id"))
                n += 1
    for obj in s.record(o).get("constructions", []) or []:
        if obj.get("pattern") == old:
            obj["pattern"] = new
            if meaning is not None:
                obj["meaning_cn"] = meaning
            n += 1
    if n:
        s.mark(o)
    return n


def recursive_text_replace(value: Any, old: str, new: str) -> int:
    n = 0
    if isinstance(value, dict):
        for k, v in list(value.items()):
            if isinstance(v, str) and old in v:
                value[k] = v.replace(old, new)
                n += 1
            else:
                n += recursive_text_replace(v, old, new)
    elif isinstance(value, list):
        for v in value:
            n += recursive_text_replace(v, old, new)
    return n


def move_collocs(s: base.Store, o: int, target_sid: str, predicate: Callable[[str], bool]) -> int:
    target = sense_obj(s, o, target_sid)
    moved: list[dict[str, Any]] = []
    for se in s.record(o).get("senses", []):
        if se.get("sense_id") == target_sid:
            continue
        keep = []
        for item in se.get("collocations", []) or []:
            if predicate(str(item.get("phrase", ""))):
                moved.append(item)
            else:
                keep.append(item)
        se["collocations"] = keep
    existing = {x.get("collocation_id") for x in target.get("collocations", []) or []}
    for item in moved:
        if item.get("collocation_id") not in existing:
            target.setdefault("collocations", []).append(item)
        sync_colloc(s, item, target_sid)
    if moved:
        s.mark(o)
    return len(moved)


def update_registry_only(s: base.Store, sid: str, *, cn: str | None = None, en: str | None = None, status: str | None = None, merged_into: str | None | object = ... ) -> None:
    if sid not in s.senses:
        raise RuntimeError(f"REGISTRY_SENSE_MISSING:{sid}")
    reg = s.senses[sid]
    if cn is not None: reg["definition_cn"] = cn
    if en is not None: reg["definition_en"] = en
    if status is not None: reg["status"] = status
    if merged_into is not ...: reg["merged_into_sense_id"] = merged_into
    reg["updated_at"] = STAMP
    s.changed_sense_ids.add(sid)


def drop_from_core(s: base.Store, o: int, sid: str) -> None:
    core = s.record(o).get("core_concept", {})
    for c in core.get("core_clusters", []) or []:
        c["sense_ids"] = [x for x in c.get("sense_ids", []) if x != sid]
    core["core_clusters"] = [c for c in core.get("core_clusters", []) if c.get("sense_ids")]
    s.mark(o)


def deprecate(s: base.Store, o: int, sid: str) -> None:
    s.record(o)["senses"] = [x for x in s.record(o).get("senses", []) if x.get("sense_id") != sid]
    drop_from_core(s, o, sid)
    update_registry_only(s, sid, status="deprecated", merged_into=None)
    s.mark(o)


def merge_into(s: base.Store, o: int, sid: str, survivor: str) -> None:
    s.record(o)["senses"] = [x for x in s.record(o).get("senses", []) if x.get("sense_id") != sid]
    drop_from_core(s, o, sid)
    update_registry_only(s, sid, status="merged", merged_into=survivor)
    update_registry_only(s, survivor, status="active", merged_into=None)
    s.mark(o)


def ensure_construction(s: base.Store, o: int, pattern: str, meaning: str, *, cid: str | None = None, source_sid: str | None = None, level: str = "L2") -> dict[str, Any]:
    arr = s.record(o).setdefault("constructions", [])
    obj = next((x for x in arr if (cid and x.get("construction_id") == cid) or x.get("pattern") == pattern), None)
    if obj is None:
        obj = {"construction_id": cid or base.construction_id(s.record(o)["word"], pattern), "direction": "R+P", "level": level, "meaning_cn": meaning, "pattern": pattern}
        arr.append(obj)
    else:
        obj["pattern"] = pattern
        obj["meaning_cn"] = meaning
    if source_sid is not None:
        obj["source_sense_id"] = source_sid
    s.mark(o)
    return obj


def attach_construction(s: base.Store, o: int, cid: str, sid: str) -> None:
    obj = next((x for x in s.record(o).get("constructions", []) if x.get("construction_id") == cid), None)
    if obj is None:
        raise RuntimeError(f"CONSTRUCTION_MISSING:o{o:04d}:{cid}")
    obj["source_sense_id"] = sid
    s.mark(o)


def new_branch(s: base.Store, o: int, branch: str, pos: str, cn: str, en: str, *, level: str = "L2", pattern: str = "", cluster_cn: str | None = None, cluster_en: str | None = None) -> str:
    if (o, branch) not in AUTHORIZED_NEW:
        raise RuntimeError(f"UNAUTHORIZED_NEW_BRANCH:o{o:04d}:{branch}")
    sid = s.new(o, branch, pos, cn, en, level=level, pattern=pattern)
    reg = s.senses[sid]
    reg["created_at"] = reg.get("created_at") or STAMP
    reg["updated_at"] = STAMP
    if cluster_cn and cluster_en:
        s.add_cluster(o, pos, cluster_cn, cluster_en, [sid])
    return sid


def add_reciprocal(s: base.Store, source_o: int, remote_o: int, relation_id: str, *, source_sid: str, remote_sid: str, source_word: str, remote_word: str) -> None:
    src = next((x for x in s.record(source_o).get("semantic_neighbors", []) if x.get("relation_id") == relation_id or x.get("fact_id") == relation_id), None)
    if src is None:
        raise RuntimeError(f"SOURCE_RELATION_VIEW_MISSING:o{source_o:04d}:{relation_id}")
    arr = s.record(remote_o).setdefault("semantic_neighbors", [])
    if any(x.get("relation_id") == relation_id or x.get("fact_id") == relation_id for x in arr):
        return
    rev = copy.deepcopy(src)
    if "source_sense_id" in rev: rev["source_sense_id"] = remote_sid
    if "target_sense_id" in rev: rev["target_sense_id"] = source_sid
    if "target_sense_ids" in rev: rev["target_sense_ids"] = [source_sid]
    if "sense_ids" in rev: rev["sense_ids"] = [remote_sid]
    if "source_expression" in rev: rev["source_expression"] = remote_word
    if "target_expression" in rev: rev["target_expression"] = f"{remote_word} ↔ {source_word}"
    if "target_word" in rev: rev["target_word"] = source_word
    arr.append(rev)
    s.mark(remote_o)


def apply(s: base.Store) -> dict[str, str]:
    remove_colloc(s, 3131, lambda p: p == "mostly likely")

    if not replace_phrase(s, 3135, "motivate + sb to do + sth", "motivate sb to do sth", "激励某人做某事"):
        recursive_text_replace(s.record(3135), "motivate + sb to do + sth", "motivate sb to do sth"); s.mark(3135)

    mourn = "sense:mourn:89bf5a33710858b6"
    s.put_existing(3140, mourn, cn="哀悼；悼念", en="to feel or show sorrow because someone has died or because something has been lost", pos="verb")
    remove_colloc(s, 3140, lambda p: p == "mourn one's death")
    s.add_colloc(3140, mourn, "mourn sb's death", "哀悼某人的去世")
    s.add_colloc(3140, mourn, "mourn the death of sb", "哀悼某人的去世")

    mug = "sense:mug:fb9cda48640e577a"
    mu = s.put_existing(3148, mug, cn="（英式非正式）突击学习；用功复习", en="BrE informal: to study or revise intensively, especially in the phrasal uses mug sth up or mug up on sth", pos="verb", pattern="mug sth up; mug up on sth")
    mu["usage_note"] = "Teach this study meaning through BrE informal phrasal usage, not bare neutral mug."
    s.add_colloc(3148, mug, "mug sth up", "突击学习某事")
    s.add_colloc(3148, mug, "mug up on sth", "突击复习某事")

    s.put_existing(3153, "sense:murder:78423f31cc15528c", cn="谋杀；故意非法杀人", en="the intentional unlawful killing of a person", pos="noun")
    s.put_existing(3153, "sense:murder:d739778d4c3a5342", cn="谋杀；故意非法杀死", en="to kill a person intentionally and unlawfully", pos="verb")
    recursive_text_replace(s.record(3153), "premeditated", "intentional"); s.mark(3153)

    must_ep = new_branch(s, 3162, "epistemic_modal_inference", "modal", "一定；想必（表示高度确信的推断）", "used to express a strong or high-confidence inference or conclusion", level="L1", pattern="must be ...; must have + past participle", cluster_cn="高度确信的推断", cluster_en="strong epistemic inference")
    sense_obj(s,3162,must_ep)["transitivity"] = "nonverb"

    sleep_n = "sense:nap:7defb051d8f1569d"; sleep_v = "sense:nap:2e1a2832de05505f"
    s.put_existing(3176, sleep_n, cn="小睡；打盹", en="a short sleep, especially during the day", pos="noun")
    s.put_existing(3176, sleep_v, cn="小睡；打盹", en="to sleep for a short time, especially during the day", pos="verb")
    fabric = active_by(s, 3176, pos="verb", exclude={sleep_v})
    fabric["definition_cn"] = "使织物表面起绒；整理绒面"; fabric["definition_en"] = "to raise or finish the soft surface or pile of cloth"; fabric["sense_label_en"] = fabric["definition_en"]
    fabric["governing_pattern"] = "nap cloth/fabric"; fabric["transitivity"] = "vt"
    update_registry_only(s, fabric["sense_id"], cn=fabric["definition_cn"], en=fabric["definition_en"], status="active", merged_into=None); s.mark(3176)

    narrow_v = "sense:narrow:c0c7475e7a0259c9"
    nv = s.put_existing(3179, narrow_v, cn="使变窄；变窄；缩小", en="to make something narrower or to become narrower", pos="verb", pattern="narrow sth; sth narrows")
    nv["transitivity"] = "vt/vi"; s.add_colloc(3179, narrow_v, "the gap narrowed", "差距缩小了", exam="usage_example")

    native_adj = active_by(s, 3184, pos="adjective", contains=("place",))["sense_id"]
    move_collocs(s, 3184, native_adj, lambda p: any(k in p.lower() for k in ("native plant", "native animal", "native species")))
    s.put_existing(3184, native_adj, cn="本地的；土生土长的；原产于某地的", en="originating naturally in or belonging to a particular place; indigenous", pos="adjective")

    recursive_text_replace(s.record(3195), "be necessary to do + sth", "be necessary to do sth")
    ensure_construction(s, 3195, "be necessary to do sth", "有必要做某事")
    ensure_construction(s, 3195, "necessary for sb to do sth", "对某人来说有必要做某事")

    recursive_text_replace(s.record(3200), "need to do + sth", "need to do sth")
    need_v = active_by(s, 3200, pos="verb", contains=("require",))["sense_id"]
    ensure_construction(s, 3200, "need doing", "需要被做（= need to be done）", source_sid=need_v)
    ensure_construction(s, 3200, "need to be done", "需要被做", source_sid=need_v)

    neg_tech = new_branch(s, 3202, "technical_quantitative_electrical", "adjective", "负的；低于零的；带负电/负极性的", "below zero, or having negative electrical polarity or charge", level="L2", cluster_cn="技术上的负值/负电", cluster_en="technical negative value or polarity")
    neg_test = new_branch(s, 3202, "diagnostic_test_result", "adjective", "（检测/检查结果）阴性的；未检出所测条件或病原", "of a test or result: showing that the tested condition or agent was not detected or shown to be present", level="L2", cluster_cn="检测结果阴性", cluster_en="negative diagnostic or test result")
    s.add_colloc(3202, neg_tech, "negative charge", "负电荷", exam="usage_example"); s.add_colloc(3202, neg_test, "test negative", "检测结果为阴性", exam="usage_example")

    recursive_text_replace(s.record(3203), "neglect to do + sth", "neglect to do sth")
    neglect_v = active_by(s, 3203, pos="verb")["sense_id"]
    ensure_construction(s, 3203, "neglect to do sth", "疏忽而没有做某事", source_sid=neglect_v)

    network_n = "sense:network:93e5534eae2f5dde"
    s.put_existing(3214, network_n, cn="网络；相互连接的系统（包括计算机/设备网络）", en="an interconnected system of people, things, computers, or devices", pos="noun")
    s.put_existing(3214, "sense:network:85f04cc7cc045156", pos="verb")
    net_it = new_branch(s, 3214, "it_network_devices", "verb", "把计算机/设备连接成网络", "to connect computers or devices into a network", level="L2", pattern="network computers/devices", cluster_cn="连接计算机/设备成网", cluster_en="connect devices into a network")
    sense_obj(s,3214,net_it)["transitivity"] = "vt"

    neutral_sc = new_branch(s, 3215, "scientific_neutral_state", "adjective", "（科学）中性的：既非酸也非碱；或无净电荷", "in scientific use, neither acidic nor basic and/or having no net electrical charge", level="L2", cluster_cn="科学上的中性状态", cluster_en="scientific neutral state")
    s.add_colloc(3215, neutral_sc, "electrically neutral", "电中性的", exam="usage_example")

    ensure_construction(s, 3221, "next to X", "在 X 旁边；紧邻 X")
    ensure_construction(s, 3221, "next to + adjective/noun", "几乎；差不多（在惯用语境中）")

    s.put_existing(3237, "sense:noisy:782feb82d76f5ec5", cn="嘈杂的；充满响亮或扰人声音的", en="making a lot of noise or full of loud or disturbing sound", pos="adjective")

    none_p = "sense:none:0639a1ce24b855c3"; none_a = "sense:none:2bc83847a022501f"; none_adv = "sense:none:8a4db307eca65cab"
    s.put_existing(3240, none_p, cn="没有任何一个；没有任何东西", en="not any of a group", pos="pronoun", level="L1", branch=0)
    s.put_existing(3240, none_adv, cn="一点也不；丝毫不", en="not at all or in no way", pos="adverb", level="L2", branch=1)
    deprecate(s, 3240, none_a); s.add_colloc(3240, none_p, "none of ...", "……中一个也没有；……中没有任何人/物")

    s.put_existing(3241, "sense:nonetheless:ac445cc55a8454b6", cn="尽管如此；不过；仍然", en="despite that; nevertheless", pos="adverb", level="L1", branch=0)
    merge_into(s, 3241, "sense:nonetheless:fd960634ae175dff", "sense:nonetheless:ac445cc55a8454b6")

    s.put_existing(3243, "sense:noodle:3ca2854a3a365ccd", cn="面条", en="a long thin strip of pasta or dough used as food", pos="noun", level="L1", branch=0)
    deprecate(s, 3243, "sense:noodle:abbf6c89b0975e79"); s.core(3243, cn="面条这种食物", en="a strip of dough/pasta eaten as food")

    s.put_existing(3248, "sense:normalisation:66ce4dd08af8598c", cn="正常化；恢复正常；规范化（视语境）", en="the act or process of making or returning something to a normal state; in some contexts, standardisation", pos="noun", level="L2")
    sense_obj(s,3248,"sense:normalisation:66ce4dd08af8598c")["usage_note"] = "Includes lawful uses such as normalisation of relations; standardisation is a context-dependent subtype, not the whole meaning."

    s.put_existing(3251, "sense:northern:eb17abcb6af65b3f", pos="adjective"); deprecate(s, 3251, "sense:northern:f83299accb595237")

    notable_n = "sense:notable:4242826f61935f26"
    update_registry_only(s, notable_n, cn="重要的、著名的或值得注意的人", en="an important, famous, or noteworthy person")
    active_notable_n = next((x for x in s.record(3256).get("senses",[]) if x.get("sense_id")==notable_n), None)
    if active_notable_n: active_notable_n.update({"definition_cn":"重要的、著名的或值得注意的人","definition_en":"an important, famous, or noteworthy person","sense_label_en":"an important, famous, or noteworthy person","level":"L3"})
    drop_from_core(s, 3256, notable_n)

    s.put_existing(3262, "sense:notion:8ac74d147b9f5b42", cn="想法；观念；概念；看法", en="an idea, belief, conception, or general concept", pos="noun", level="L1", branch=0)
    merge_into(s, 3262, "sense:notion:e467a674acf65d46", "sense:notion:8ac74d147b9f5b42"); deprecate(s, 3262, "sense:notion:84484b32efb15629")

    s.put_existing(3273, "sense:nuclear:f76e28f711ed55ed", pos="adjective"); s.put_existing(3273, "sense:nuclear:49a0f2b3e57d5abf", pos="adjective")
    deprecate(s, 3273, "sense:nuclear:06a504e9ad315315"); ensure_construction(s, 3273, "nuclear family", "核心家庭；由父母与子女构成的家庭单位")

    s.put_existing(3276, "sense:numb:b3d6d4201c2d58f7", cn="（因震惊、悲伤、创伤等）情感麻木的；失去感觉的", en="emotionally numb or unable to feel normally after shock, grief, trauma, or similar experiences", pos="adjective")

    add_reciprocal(s, 3296, 4764, REL_OBJECTIVE, source_sid="sense:objective:18fa23e8eda355f2", remote_sid="sense:subjective:87b822b5222b53df", source_word="objective", remote_word="subjective")

    s.put_existing(3298, "sense:oblige:5ed647f5ecda535d", pos="verb"); s.put_existing(3298, "sense:oblige:4a0b1ba2a1c15aa5", pos="verb"); s.put_existing(3298, "sense:oblige:ec8d1e479dd758b6", pos="verb")
    ensure_construction(s, 3298, "oblige sb by doing sth", "通过做某事帮某人的忙", source_sid="sense:oblige:ec8d1e479dd758b6")
    add_reciprocal(s, 3298, 941, REL_OBLIGE, source_sid="sense:oblige:5ed647f5ecda535d", remote_sid="sense:compel:34bf614a8e1e5731", source_word="oblige", remote_word="compel")

    s.put_existing(3312, "sense:occupy:0c59e03ef08a591d", cn="占用；使用；居住于；占据（空间或时间）", en="to use or live in a place, or to take up space or time", pos="verb")

    s.put_existing(3318, "sense:odds:8f79c250457956d4", cn="赔率", en="the quoted ratio or price in betting that expresses likelihood and the potential return on a wager", pos="noun")
    s.put_existing(3318, "sense:odds:b861e51db3b251cc", pos="noun")

    off_specs = [
        ("sense:off:01ebe9e35d6f56c7","adjective","境况；处境（尤用于 better/worse off）","in a particular condition or situation, especially in better off / worse off"),
        ("sense:off:457aada69afb5c62","adjective","休息的；不上班/不值勤的","not at work or not on duty; having time off"),
        ("sense:off:5cb17a01fb4757ae","adjective","（食物/饮料）变质的","of food or drink: no longer fresh or good; spoiled"),
        ("sense:off:7decb1bce5255731","adjective","（活动/事件）取消的；不举行的","of an event or arrangement: cancelled or not happening"),
        ("sense:off:a6d08c4a8e5b569b","adverb","减价；打折；从价格中减去","away from a stated price; used for a reduction or discount"),
    ]
    for idx,(sid,pos,cn,en) in enumerate(off_specs, start=3): s.put_existing(3321, sid, cn=cn, en=en, pos=pos, level="L2", branch=idx)
    attach_construction(s, 3321, "construction:c63ba7e0a56c07fcd9ac", "sense:off:01ebe9e35d6f56c7")

    s.put_existing(3326, "sense:officer:1e12f514da3a51cd", cn="官员；警官；政府/公共机构或组织中的负责人", en="a person holding a position of authority in government, public service (including a police officer), or an organization", pos="noun", level="L1")
    s.put_existing(3326, "sense:officer:00a129460fb3556e", pos="noun")

    s.put_existing(3334, "sense:omit:202cea9277b25c10", cn="省略；遗漏；不包括", en="to leave something out or not include it", pos="verb", level="L1", branch=0)
    s.put_existing(3334, "sense:omit:84336b00719f518b", cn="未做；没有做（本应做的事）", en="to fail to do something that should have been done", pos="verb", level="L2", branch=1)
    s.core(3334, cn="把某事物省略掉或不包括在内", en="leave something out or not include it")

    open_rec = new_branch(s, 3343, "receptive_willing", "adjective", "愿意接受/考虑的；开放接受的", "willing to consider or accept an idea, suggestion, or proposal", level="L2", cluster_cn="愿意接受或考虑", cluster_en="receptive or willing to consider")
    open_exp = new_branch(s, 3343, "exposed_susceptible", "adjective", "易受……影响/批评/滥用的；暴露于风险的", "exposed or liable to criticism, abuse, questioning, risk, or similar harm", level="L2", cluster_cn="暴露于/易受影响", cluster_en="exposed or susceptible")
    attach_construction(s, 3343, "construction:886a9b307cfba539a4a1", open_rec); attach_construction(s, 3343, "construction:4911aa21389bba0eb3c0", open_exp)

    disagree = "sense:oppose:8d948858f74858ae"
    s.put_existing(3353, "sense:oppose:3e62df0c9f775aa2", pos="verb"); s.put_existing(3353, disagree, pos="verb")
    moved = move_collocs(s, 3353, disagree, lambda p: "proposal" in p.lower() or "policy" in p.lower())
    if not moved: s.add_colloc(3353, disagree, "oppose the proposal", "反对该提议", exam="usage_example")

    s.put_existing(3357, "sense:optical:5801b30c27d455b1", cn="光学的；光/视觉/视力相关的", en="relating to light, optics, vision, or eyesight", pos="adjective")
    s.put_existing(3367, "sense:orchestra:f694c0303b6559e3", cn="管弦乐队；大型多乐器演奏团体", en="a large organized group of musicians playing many or different instruments", pos="noun")

    order_sid = "sense:order:577ac013a49856e4"
    s.put_existing(3368, order_sid, cn="顺序；次序；排列；秩序", en="the sequence, arrangement, or ordering of people or things", pos="noun", level="L1", branch=0)
    s.core(3368, cn="把人或事物按一定次序排列或组织", en="sequence, arrangement, or organized order")
    s.add_colloc(3368, order_sid, "in chronological order", "按时间顺序", exam="usage_example"); s.add_colloc(3368, order_sid, "in order", "按顺序；有序", exam="usage_example")

    organic_food = "sense:organic:237db2990c004106"
    s.put_existing(3373, "sense:organic:c6a7396a0e6857e0", pos="adjective"); s.put_existing(3373, "sense:organic:5bdee51c45025d9d", pos="adjective")
    s.put_existing(3373, organic_food, cn="有机食品/有机农业的", en="produced according to organic farming standards with restricted synthetic inputs", pos="adjective", level="L2")
    move_collocs(s, 3373, organic_food, lambda p: "organic food" in p.lower() or "organic farm" in p.lower())

    return {"must_epistemic":must_ep,"negative_technical":neg_tech,"negative_diagnostic":neg_test,"network_it":net_it,"neutral_scientific":neutral_sc,"open_receptive":open_rec,"open_exposed":open_exp}


def validate_and_write(s: base.Store, new_ids: dict[str, str]) -> dict[str, Any]:
    expected_changed = set(TARGETS) | set(REMOTE)
    if not s.changed_word_ordinals.issubset(expected_changed): raise RuntimeError(f"UNAUTHORIZED_OWNER_WRITE:{sorted(s.changed_word_ordinals - expected_changed)}")
    high = {o for o in s.changed_word_ordinals if o >= 3375}
    if high - {4764}: raise RuntimeError(f"O3375_PLUS_UNAUTHORIZED:{sorted(high)}")
    if len(set(new_ids.values())) != 7: raise RuntimeError(f"NEW_BRANCH_COUNT_MISMATCH:{new_ids}")
    expected_generated = {base.sense_id(TARGETS[o], branch) for o, branch in AUTHORIZED_NEW}
    if set(new_ids.values()) != expected_generated: raise RuntimeError(f"NEW_BRANCH_IDENTITY_MISMATCH:{sorted(set(new_ids.values()) ^ expected_generated)}")
    if s.identity["ESCALATE_IDENTITY"]: raise RuntimeError(f"ESCALATE_IDENTITY_FORBIDDEN:{s.identity['ESCALATE_IDENTITY']}")

    s.finalize()
    natural, relations, report = build()
    if report["status"] != "PASS": raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:" + stable(report))

    for o in sorted(expected_changed): dump_json(OWNER_DIR / f"o{o:04d}.json", natural[o])
    for rid in (REL_OBJECTIVE, REL_OBLIGE):
        owner = relations.get(rid)
        if owner is None: raise RuntimeError(f"RELATION_OWNER_MISSING:{rid}")
        dump_json(relation_owner_path(rid), owner)

    closure = {}
    for o, word in sorted(TARGETS.items()):
        owner = natural[o]
        if owner["word"] != word or owner["ordinal"] != o: raise RuntimeError(f"OWNER_IDENTITY_MISMATCH:o{o:04d}")
        active = {x.get("sense_id") for x in owner["record"].get("senses", [])}
        refs = {x.get("sense_id"):x for x in owner.get("identity_refs",{}).get("senses",[])}
        missing = [sid for sid in active if sid not in refs or refs[sid].get("status") != "active"]
        if missing: raise RuntimeError(f"ACTIVE_SENSE_REFERENCE_CLOSURE:o{o:04d}:{missing}")
        closure[f"o{o:04d}"] = {"word":word,"active_senses":len(active),"reference_closure":"PASS"}

    obj_views = relations[REL_OBJECTIVE]["word_views"]
    if {v["source_ordinal"] for v in obj_views} != {3296,4764}: raise RuntimeError("OBJECTIVE_SUBJECTIVE_RECIPROCITY_FAILED")
    obl_views = relations[REL_OBLIGE]["word_views"]
    if {v["source_ordinal"] for v in obl_views} != {941,3298}: raise RuntimeError("OBLIGE_COMPEL_RECIPROCITY_FAILED")

    def status(sid: str) -> tuple[str | None,str | None]:
        r=s.senses[sid]; return r.get("status"),r.get("merged_into_sense_id")
    assert status("sense:nonetheless:fd960634ae175dff") == ("merged","sense:nonetheless:ac445cc55a8454b6")
    assert status("sense:notion:e467a674acf65d46") == ("merged","sense:notion:8ac74d147b9f5b42")
    for sid in ("sense:none:2bc83847a022501f","sense:noodle:abbf6c89b0975e79","sense:northern:f83299accb595237","sense:notion:84484b32efb15629","sense:nuclear:06a504e9ad315315"):
        assert s.senses[sid].get("status") == "deprecated", sid

    exact_constructions = {
        (3321,"construction:c63ba7e0a56c07fcd9ac"):"sense:off:01ebe9e35d6f56c7",
        (3343,"construction:886a9b307cfba539a4a1"):new_ids["open_receptive"],
        (3343,"construction:4911aa21389bba0eb3c0"):new_ids["open_exposed"],
    }
    for (o,cid),sid in exact_constructions.items():
        obj = next(x for x in natural[o]["record"].get("constructions",[]) if x.get("construction_id")==cid)
        if obj.get("source_sense_id") != sid: raise RuntimeError(f"CONSTRUCTION_ANCHOR_FAILED:o{o:04d}:{cid}")

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    receipt = {
        "schema":"kianos.lexical.sol_reconciled_corrective_execution_receipt.v1","status":"LOCAL_CLOSED_PENDING_INTEGRATION",
        "authority":str(AUTHORITY.relative_to(ROOT)),"baseline_main":BASELINE,
        "scope":{"delta_owners":sorted(TARGETS),"remote_reciprocal_owners":sorted(REMOTE)},
        "counts":{"reconciled_deltas":39,"new_semantic_branches":7,"new_relation_ids":0,"remote_reciprocal_writes":2,"escalate_identity":0},
        "new_stable_sense_ids":new_ids,
        "relations":{REL_OBJECTIVE:{"source_ordinals":sorted(v["source_ordinal"] for v in obj_views),"status":"RECIPROCAL_CLOSED"},REL_OBLIGE:{"source_ordinals":sorted(v["source_ordinal"] for v in obl_views),"status":"RECIPROCAL_CLOSED"}},
        "owner_readback":closure,"identity_reference_closure":"PASS","relation_reciprocity_anchor_closure":"PASS","form_lookup_closure":"PASS_BY_UNCHANGED_LOOKUP_AND_PRESERVED_WORD_ID","natural_owner_audit":report,
        "future_catalog":{"o3375_o3624":"NOT_ACTIVATED"},
    }
    dump_json(AUDIT_DIR / "reconciled-corrective-o3125-o3374.json", receipt)
    return receipt


def main() -> int:
    if len(TARGETS) != 39: raise SystemExit("TARGET_COVERAGE_MISMATCH")
    if not AUTHORITY.exists(): raise SystemExit("RECONCILIATION_AUTHORITY_MISSING")
    s = base.Store()
    for o,w in {**TARGETS, **REMOTE}.items():
        if s.record(o).get("word") != w: raise SystemExit(f"OWNER_DRIFT:o{o:04d}:{s.record(o).get('word')}!={w}")
    new_ids = apply(s)
    receipt = validate_and_write(s, new_ids)
    print(json.dumps({"status":"APPLIED_AND_READ_BACK","delta_owners":len(TARGETS),"changed_word_ordinals":sorted(s.changed_word_ordinals),"new_stable_sense_ids":new_ids,"receipt":str((AUDIT_DIR/'reconciled-corrective-o3125-o3374.json').relative_to(ROOT)),"natural_owner_audit":receipt["natural_owner_audit"]["status"],"o3375_o3624":"NOT_ACTIVATED"}, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
