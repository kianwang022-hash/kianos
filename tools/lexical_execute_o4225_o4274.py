#!/usr/bin/env python3
"""Mechanical execution for Issue #215 boundary o4225-o4274.

Authority is frozen in content/lexical/semantic-reconciliation/o4125-o4374.md.
No semantic review occurs here. Stable identities are reused exactly; the only
genuine NEW semantic branch in this boundary is sand = smooth with abrasive,
which Current preflight proves has no stable carrier.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
RECEIPT_DIR = LEX / "execution" / "receipts"
LOOKUP_SA = LEX / "canonical" / "lookup" / "spelling" / "sa.json"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")
AUTHORITY = "content/lexical/semantic-reconciliation/o4125-o4374.md"
SOURCE = (4226,4237,4238,4244,4249,4253,4255,4258,4259,4263,4264,4265,4266,4268)

sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build, dump_json


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def baseline_bytes(rel: str) -> bytes:
    if BASELINE == "unknown":
        raise RuntimeError("KIANOS_BASELINE_MAIN must be pinned")
    return subprocess.check_output(["git", "show", f"{BASELINE}:{rel}"])


def put(s, o, sid, *, level, branch=None, pattern=None, cn=None, en=None):
    if sid not in s.senses:
        raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
    return s.put_existing(o, sid, level=level, branch=branch, pattern=pattern, cn=cn, en=en)


def core(s, o, cn, en):
    s.core(o, cn=cn, en=en)


def set_form_identity(s, o, type_, boundaries):
    rec=s.record(o)
    rec["form_identity"]={
        "authority":AUTHORITY,
        "type":type_,
        "boundaries":boundaries,
    }
    s.mark(o)


def rebuild_core_exact(s, o, ids, cn, en):
    rec=s.record(o)
    active={x.get("sense_id"):x for x in rec.get("senses",[])}
    missing=[sid for sid in ids if sid not in active]
    if missing:
        raise RuntimeError(f"CORE_PIN_MISSING o{o:04d} {missing}")
    grouped=defaultdict(list)
    for sid in ids:
        x=active[sid]
        grouped[str(x.get("pos","other"))].append(x)
    rec.setdefault("core_concept",{})["core_clusters"]=[
        {
            "label_cn":"；".join(dict.fromkeys(x.get("definition_cn","") for x in xs if x.get("definition_cn"))),
            "label_en":"; ".join(dict.fromkeys(x.get("definition_en","") for x in xs if x.get("definition_en"))),
            "pos":pos,
            "sense_ids":[x["sense_id"] for x in xs],
        }
        for pos,xs in grouped.items()
    ]
    rec["core_concept"]["core_meaning_cn"]=cn
    rec["core_concept"]["mental_model_cn"]=cn
    rec["core_concept"]["core_meaning_en"]=en
    s.mark(o)


def drop_collocation(s, o, phrase):
    rec=s.record(o)
    hits=[]
    for sense in rec.get("senses",[]):
        for item in list(sense.get("collocations",[])):
            if item.get("phrase")==phrase:
                hits.append((sense,item))
    if len(hits)!=1:
        raise RuntimeError(f"COLLOCATION_MATCH_NOT_UNIQUE o{o:04d} {phrase} hits={len(hits)}")
    sense,item=hits[0]
    sense["collocations"].remove(item)
    cid=item.get("collocation_id")
    if cid in s.colls:
        s.colls[cid]["status"]="deprecated"
        s.changed_collocation_ids.add(cid)
    s.mark(o)


def ensure_absent(s, word, terms):
    hits=[]
    for sid,rec in s.senses.items():
        if rec.get("headword")!=word:
            continue
        text=(str(rec.get("definition_en",""))+" "+str(rec.get("definition_cn",""))).lower()
        if any(t.lower() in text for t in terms):
            hits.append(sid)
    if hits:
        raise RuntimeError(f"EXPECTED_GENUINE_NEW_BUT_STABLE_EXISTS {word} {hits}")


def add_lookup_alias(path: Path, source: str, alias: str):
    data=json.loads(path.read_text(encoding="utf-8"))
    if source not in data or len(data[source])!=1:
        raise RuntimeError(f"LOOKUP_SOURCE_NOT_UNIQUE {source}")
    if alias in data:
        if data[alias]!=data[source]:
            raise RuntimeError(f"LOOKUP_ALIAS_CONFLICT {alias}")
        return
    data[alias]=copy.deepcopy(data[source])
    path.write_text(json.dumps({k:data[k] for k in sorted(data)},ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")


def add_anchored_construction(s,o,pattern,meaning,sid,level="L2"):
    rec=s.record(o)
    arr=rec.setdefault("constructions",[])
    hits=[x for x in arr if x.get("pattern")==pattern]
    if not hits:
        s.add_construction(o,pattern,meaning,level=level)
        hits=[x for x in rec.get("constructions",[]) if x.get("pattern")==pattern]
    if len(hits)!=1:
        raise RuntimeError(f"CONSTRUCTION_NOT_UNIQUE o{o:04d} {pattern}")
    hits[0]["source_sense_id"]=sid
    hits[0]["meaning_cn"]=meaning
    s.mark(o)


def apply(s):
    # o4226 sack: keep Core on ordinary bag / dismiss / loot; rare wine/jacket low.
    rebuild_core_exact(
        s,4226,
        ["sense:sack:f1dba5b8a0a05f05","sense:sack:bf8e81bf1fb1583b","sense:sack:5268761fd8195342"],
        "大袋；解雇；洗劫、劫掠",
        "a large bag; to dismiss someone from a job; to loot or plunder a place",
    )

    # o4237 sake: same-owner pronunciation boundary, no semantic split.
    set_form_identity(s,4237,"same_owner_form_pronunciation_boundary",[
        {"condition":"sake in for the sake of / purpose-benefit uses","pronunciation":"/seɪk/","note":"reason, purpose or benefit"},
        {"condition":"Japanese rice alcohol sake","pronunciation":"/ˈsɑːki/","note":"Japanese alcoholic beverage made from fermented rice"},
    ])

    # o4238 salad: broaden the same stable ordinary noun.
    put(s,4238,"sense:salad:a8910a002c4d55fa",level="L1",branch=0,
        cn="色拉；由多种食材混合而成的凉菜",
        en="a cold or mixed dish of ingredients, often vegetables or fruit but also sometimes cooked ingredients, pasta, or other foods")
    core(s,4238,"色拉；由多种食材混合成的凉菜","a cold or mixed dish made from ingredients such as vegetables, fruit, pasta, or other foods")

    # o4244 salute: verb takes direct object; `a salute to` is nominal.
    bad="salute to + sb/sth"
    drop_collocation(s,4244,bad)
    verb=put(s,4244,"sense:salute:c20960235d355543",level="L2",pattern="vt. + object")
    verb["transitivity"]="vt"
    s.add_colloc(4244,"sense:salute:c20960235d355543","salute + sb/sth","向某人/某物致敬","fixed_pattern")
    s.add_colloc(4244,"sense:salute:b706b44d1d3b5c87","a salute to + sb/sth","对某人/某事物的致敬","fixed_pattern")

    # o4249 sand: smoothing-with-abrasive is distinct and absent -> genuine NEW.
    ensure_absent(s,"sand",("sandpaper","abrasive","smooth or clean"))
    sanding=s.new(4249,"smooth_with_abrasive","verb","用砂纸或磨料打磨、磨光","to smooth or clean a surface with sandpaper or another abrasive",level="L1",pattern="vt. + object")
    s.add_colloc(4249,sanding,"sand the wood/surface","用砂纸打磨木材/表面","usage_example")
    rebuild_core_exact(s,4249,["sense:sand:817ec23ea1fe5976",sanding],"沙、沙子；用砂纸或磨料打磨","sand; to smooth a surface with sandpaper or another abrasive")

    # o4253 satellite: broaden same metaphorical branch to dependent entity/state.
    sat=put(s,4253,"sense:satellite:a178c6c137e751c2",level="L2",
        cn="附庸、从属者或从属实体（包括国家/组织）",
        en="a person, organization, state, or other entity dependent on or controlled by another")
    for item in sat.get("collocations",[]):
        if item.get("phrase")=="satellite state":
            item["meaning_cn"]="卫星国；附庸国"
    rebuild_core_exact(s,4253,["sense:satellite:98ceb84de5c35d8f","sense:satellite:74d730b50013529e","sense:satellite:a178c6c137e751c2"],"人造/天然卫星；也可指受另一方控制或依附的实体","artificial or natural satellite; also a dependent person, state, organization, or entity")

    # o4255 satisfaction: exact stable contentment + fulfillment; legal branch low.
    put(s,4255,"sense:satisfaction:f2ae07f0f03e59d4",level="L1",branch=0)
    put(s,4255,"sense:satisfaction:0270e79c7bfd5d82",level="L2",branch=1)
    put(s,4255,"sense:satisfaction:cf602e6ae6d55211",level="L3",branch=2)
    core(s,4255,"满足、满意；满足需要/愿望的实现；法律清偿义低层","contentment or fulfillment of a desire/need; legal satisfaction of an obligation is lower")

    # o4258 saturate: restore the ordinary stable verb, extensions stay under concept.
    put(s,4258,"sense:saturate:e2fc1532e5585dfc",level="L1",branch=0)
    core(s,4258,"使完全浸透、充满或达到饱和；可延伸到市场/科学语境","to make completely wet/full or unable to absorb more; the concept extends to scientific and market saturation")

    # o4259 Saturday: invariant definition.
    put(s,4259,"sense:saturday:093a834ba2c35a1f",level="L1",branch=0,
        cn="星期六",
        en="the day after Friday and before Sunday")
    core(s,4259,"星期六","the day after Friday and before Sunday")

    # o4263 savage: keep ordinary adj/verbs; person noun becomes dated/offensive reference-only.
    sid="sense:savage:910033c1b7ea5c9d"
    if sid not in s.senses:
        raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
    s.senses[sid]["definition_cn"]="（过时且冒犯）被称作“野蛮/未开化”的人"
    s.senses[sid]["definition_en"]="dated and offensive: a person described as primitive or uncivilized"
    s.remove_sense(4263,sid)
    rebuild_core_exact(s,4263,["sense:savage:df41c9e2a5f951e9","sense:savage:82d53d8bcd4b573e","sense:savage:993bfde9af0958f7"],"凶猛、残酷、野性的；猛烈攻击或严厉抨击","extremely violent/cruel/wild; to attack violently or criticize very severely")

    # o4264 save: restore central stable branches; keep sports/preposition lower.
    put(s,4264,"sense:save:2c47128a77b65fb7",level="L1",branch=0)
    put(s,4264,"sense:save:e939ac81a52d53b0",level="L1",branch=1,
        cn="保存；留存；存储以备后用",
        en="to keep or store something for future or special use, including saving a file or document")
    put(s,4264,"sense:save:7909005b256c545e",level="L1",branch=2)
    put(s,4264,"sense:save:c59344e664655138",level="L2",branch=3)
    put(s,4264,"sense:save:4585e8a9464c5f32",level="L2",branch=4)
    put(s,4264,"sense:save:dc163a0600195d0f",level="L3",branch=5)
    core(s,4264,"挽救；保存/存储；节省","to rescue; keep/store for later (including files); spend less or save resources")

    # o4265 saving: noun main, adjective/preposition lower; savings is plural Form alias.
    put(s,4265,"sense:saving:ceeb4ce27fac5bf5",level="L1",branch=0)
    put(s,4265,"sense:saving:54a8daa150dd5841",level="L2",branch=1)
    put(s,4265,"sense:saving:ffcd9645bd1c51a9",level="L3",branch=2)
    set_form_identity(s,4265,"same_owner_number_form_boundary",[
        {"condition":"singular saving","surface":"saving","note":"an amount/economy saved; adjective/preposition uses remain separate senses"},
        {"condition":"common plural money noun","surface":"savings","note":"accumulated money that has been saved; resolves to the same Word owner"},
    ])
    add_lookup_alias(LOOKUP_SA,"saving","savings")
    core(s,4265,"储蓄、存下的钱；复数 savings 常指积蓄","money saved or a saving; plural savings commonly means accumulated saved money")

    # o4266 saw: keep lexical saw semantics; past of see is Form truth only.
    rebuild_core_exact(s,4266,["sense:saw:3e8b1d1fb2f65a6b","sense:saw:98a78fee4f00545e","sense:saw:b2a3e8af803c5418"],"锯子；锯开；来回拉锯","a saw/cutting tool; to cut with a saw; saw back and forth")
    set_form_identity(s,4266,"inflectional_form_boundary",[
        {"condition":"simple past of see","base_word":"see","base_ordinal":4320,"surface":"saw","note":"saw is the simple-past form of see; do not create a saw semantic sense for this inflection"},
    ])

    # o4268 scale: constructions belong to existing size/extent branch.
    scale_sid="sense:scale:31e2fda13c29589e"
    add_anchored_construction(s,4268,"scale up","increase size, capacity, or operation",scale_sid)
    add_anchored_construction(s,4268,"scale down","reduce size, capacity, or operation",scale_sid)

    if set(s.changed_word_ordinals)!=set(SOURCE):
        raise RuntimeError(f"SHARD3_CHANGED_OWNER_MISMATCH expected={SOURCE} actual={sorted(s.changed_word_ordinals)}")


def main():
    if len(SOURCE)!=14:
        raise RuntimeError("SHARD3_SOURCE_COUNT_DRIFT")
    s=base.Store()
    apply(s)
    s.finalize()
    natural,_relations,report=build()
    if report.get("status")!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in SOURCE:
        dump_json(OWNER_DIR/f"o{o:04d}.json",natural[o])

    no_change=[o for o in range(4225,4275) if o not in SOURCE]
    bad=[]
    for o in no_change:
        rel=f"content/lexical/words/by-ordinal/o{o:04d}.json"
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()):
            bad.append(o)
    if bad:
        raise RuntimeError(f"NO_CHANGE_BYTE_GUARD_FAILED {bad}")
    if sorted(s.changed_word_ordinals)!=list(SOURCE):
        raise RuntimeError(f"SHARD3_FINAL_CHANGED_OWNER_MISMATCH {sorted(s.changed_word_ordinals)}")
    lookup=json.loads(LOOKUP_SA.read_text(encoding="utf-8"))
    if lookup.get("savings")!=lookup.get("saving"):
        raise RuntimeError("SAVINGS_LOOKUP_READBACK_FAILED")
    saw=load_json(OWNER_DIR/"o4266.json")
    if saw.get("record",{}).get("form_identity",{}).get("type")!="inflectional_form_boundary":
        raise RuntimeError("SAW_FORM_IDENTITY_READBACK_FAILED")

    receipt={
        "schema":"kianos.lexical.forward_shard_receipt.v2",
        "status":"LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION",
        "authority":AUTHORITY,
        "package":[4125,4374],
        "shard":[4225,4274],
        "reviewed_owner_count":50,
        "semantic_mutation_source_count":14,
        "semantic_source_ordinals":list(SOURCE),
        "changed_word_ordinals":sorted(s.changed_word_ordinals),
        "in_range_changed_word_ordinals":sorted(s.changed_word_ordinals),
        "out_of_range_dependency_ordinals":[],
        "no_change_word_ordinals":no_change,
        "new_semantic_branch_ids":sorted(set(s.new_stable_sense_ids)),
        "new_semantic_branch_count":len(set(s.new_stable_sense_ids)),
        "reactivated_stable_ids":sorted(set(s.changed_sense_ids)-set(s.new_stable_sense_ids)),
        "demoted_stable_ids":sorted(sid for sid in s.changed_sense_ids if s.senses.get(sid,{}).get("status")=="deprecated"),
        "changed_relation_owner_paths":[],
        "lookup_aliases":{"savings":"word:saving"},
        "form_identity_local":{"sake":"PASS","saving/savings":"PASS","saw_as_past_of_see":"PASS_LOCAL_PENDING_RECIPROCAL_SEE_CLOSURE"},
        "readback":{
            "all_50_owner_views":"PASS",
            "all_14_authorized_semantic_sources":"PASS",
            "no_change_36_byte_guard":"PASS",
            "no_remote_dependency_writes":"PASS",
            "savings_same_owner_lookup":"PASS",
            "saw_form_identity":"PASS_LOCAL_PENDING_RECIPROCAL_SEE_CLOSURE",
            "stable_registry_closure":"PASS",
            "natural_owner_registry_audit":"PASS",
        },
    }
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    out=RECEIPT_DIR/"o4225-o4274.json"
    out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"SHARD3_PASS changed={len(SOURCE)} no_change={len(no_change)} receipt={out.relative_to(ROOT)}")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


if __name__=="__main__":
    main()
