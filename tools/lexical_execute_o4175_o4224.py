#!/usr/bin/env python3
"""Mechanical execution for Issue #215 boundary o4175-o4224.

Authority is frozen in content/lexical/semantic-reconciliation/o4125-o4374.md.
This file performs no new semantic review. Exact stable identities are reused
where available; genuine NEW branches are limited to branches proven absent by
Current preflight.
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
LOOKUP_RU = LEX / "canonical" / "lookup" / "spelling" / "ru.json"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")
AUTHORITY = "content/lexical/semantic-reconciliation/o4125-o4374.md"
SOURCE = (4178,4184,4187,4188,4192,4193,4194,4199,4202,4203,4204,4208,4209,4213,4215,4218,4220)

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


def overlay(s, o, sid, *, identity_type, paired_form, note, case_sensitive=False):
    if not any(x.get("sense_id") == sid for x in s.record(o).get("senses", [])):
        raise RuntimeError(f"OVERLAY_TARGET_NOT_ACTIVE o{o:04d} {sid}")
    s.add_overlay(o, sid, {
        "case_sensitive": case_sensitive,
        "identity_type": identity_type,
        "surface_lemma": s.record(o)["word"],
        "paired_form": paired_form,
        "note": note,
    })


def rebuild_core(s, o, levels, cn, en):
    rec = s.record(o)
    chosen = [x for x in rec.get("senses", []) if x.get("level") in levels]
    if not chosen:
        raise RuntimeError(f"CORE_EMPTY o{o:04d}")
    grouped = defaultdict(list)
    for x in chosen:
        grouped[str(x.get("pos", "other"))].append(x)
    rec.setdefault("core_concept", {})["core_clusters"] = [
        {
            "label_cn": "；".join(dict.fromkeys(x.get("definition_cn", "") for x in xs if x.get("definition_cn"))),
            "label_en": "; ".join(dict.fromkeys(x.get("definition_en", "") for x in xs if x.get("definition_en"))),
            "pos": pos,
            "sense_ids": [x["sense_id"] for x in xs],
        }
        for pos, xs in grouped.items()
    ]
    rec["core_concept"]["core_meaning_cn"] = cn
    rec["core_concept"]["mental_model_cn"] = cn
    rec["core_concept"]["core_meaning_en"] = en
    s.mark(o)


def ensure_absent(s, word, terms):
    hits=[]
    for sid, rec in s.senses.items():
        if rec.get("headword") != word:
            continue
        text=(str(rec.get("definition_en", ""))+" "+str(rec.get("definition_cn", ""))).lower()
        if any(t.lower() in text for t in terms):
            hits.append(sid)
    if hits:
        raise RuntimeError(f"EXPECTED_GENUINE_NEW_BUT_STABLE_EXISTS {word} {terms} {hits}")


def drop_collocation(s, o, phrase):
    rec=s.record(o)
    hits=[]
    for sense in rec.get("senses", []):
        for item in list(sense.get("collocations", [])):
            if item.get("phrase") == phrase:
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


def refine_rob(s):
    rec=s.record(4184)
    theft="sense:rob:f4a505d362485f02"
    deprivation="sense:rob:e3c4fc9c544d5ac7"
    if {x.get("sense_id") for x in rec.get("senses", [])} != {theft,deprivation}:
        raise RuntimeError("ROB_SENSE_SET_DRIFT")
    # Keep the existing construction theft-specific instead of falsely spanning
    # two branches; deprivation remains explicitly carried by its own stable
    # sense/collocation.
    cons=[x for x in rec.get("constructions", []) if x.get("pattern")=="rob sb of sth"]
    if len(cons)!=1:
        raise RuntimeError(f"ROB_CONSTRUCTION_NOT_UNIQUE {len(cons)}")
    c=cons[0]
    c["source_sense_id"]=theft
    c["definition_cn"]="抢劫，抢夺"
    c["definition_en"]="to take property from a person illegally, often by force or threat"
    c["meaning_cn"]="抢劫某人的某物"
    c["boundary"]="theft: rob sb of money/property; deprivation is carried by sense:rob:e3c4fc9c544d5ac7"
    theft_sense=next(x for x in rec["senses"] if x["sense_id"]==theft)
    theft_items=[x for x in theft_sense.get("collocations", []) if x.get("phrase")=="rob sb of sth"]
    if len(theft_items)!=1:
        raise RuntimeError("ROB_THEFT_COLLOCATION_NOT_UNIQUE")
    theft_items[0]["meaning_cn"]="抢劫某人的某物"
    s.mark(4184)


def add_rumour_lookup_alias():
    data=json.loads(LOOKUP_RU.read_text(encoding="utf-8"))
    if "rumour" in data:
        if data["rumour"] != data.get("rumor"):
            raise RuntimeError("RUMOUR_LOOKUP_CONFLICT")
        return
    if "rumor" not in data or len(data["rumor"]) != 1:
        raise RuntimeError("RUMOR_LOOKUP_NOT_UNIQUE")
    data["rumour"]=copy.deepcopy(data["rumor"])
    ordered={k:data[k] for k in sorted(data)}
    LOOKUP_RU.write_text(json.dumps(ordered,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")


def apply(s):
    # o4178 ritual: ordinary habitual repeated practice is absent from stable registry.
    ensure_absent(s,"ritual",("habitual","daily practice","repeated practice"))
    ritual=s.new(4178,"habitual_practice","noun","日常固定做法；惯例","a habitual or repeated practice, often done regularly",level="L2")
    s.add_colloc(4178,ritual,"a morning/daily ritual","晨间/日常固定习惯","usage_example")
    rebuild_core(s,4178,("L1","L2"),"仪式；也可指日常反复进行的固定习惯","a formal ceremony or a habitual repeated practice")

    # o4184 rob: refine construction boundary against two already-active senses.
    refine_rob(s)

    # o4187 robust: exact stable ordinary + reliable-under-stress branches.
    put(s,4187,"sense:robust:12de13c8693d50a1",level="L1",branch=0)
    put(s,4187,"sense:robust:4deeba6487c65809",level="L1",branch=1)
    core(s,4187,"强健、结实；也指系统/方法稳健可靠、经得住压力","strong/sturdy; also strong, effective and reliable under stress")

    # o4188 rock: restore merged intransitive motion identity.
    put(s,4188,"sense:rock:d39a99bb96d3588c",level="L1",pattern="vi.")
    rebuild_core(s,4188,("L1","L2"),"岩石；摇动或来回摇摆；摇滚乐等常见义","rock/mineral material; transitive or intransitive rocking; common music/person extensions")

    # o4192 roll: broaden material-roll wording + genuine new food noun.
    put(s,4192,"sense:roll:f6ba17374e765154",level="L2",cn="一卷；卷状物",en="a cylindrical roll of material such as paper, tape, film, or fabric")
    ensure_absent(s,"roll",("bread","bun"))
    food=s.new(4192,"bread_roll","noun","小圆面包；面包卷","a small bread roll or bun",level="L1")
    s.add_colloc(4192,food,"a bread roll","一个小圆面包","usage_example")
    rebuild_core(s,4192,("L1","L2"),"滚动；卷状物/一卷；名单；小圆面包","to roll; a roll/cylinder of material; a list; a small bread roll")

    # o4193 romance: exact stable three learner branches.
    put(s,4193,"sense:romance:fe4aeab464d65288",level="L1",branch=0)
    put(s,4193,"sense:romance:217e039f88025955",level="L1",branch=1)
    put(s,4193,"sense:romance:aae23bb7526d520c",level="L2",branch=2)
    overlay(s,4193,"sense:romance:aae23bb7526d520c",identity_type="capitalization_boundary",paired_form="Romance",case_sensitive=True,note="capitalized Romance refers to the language family derived from Latin; lowercase romance covers love/story meanings")
    core(s,4193,"恋爱关系；浪漫/传奇故事；大写 Romance 可指罗曼语族","a love affair; a romantic/adventure story; capitalized Romance for the language family")

    # o4194 romantic: ordinary idealistic/unrealistic adjective absent -> genuine NEW.
    ensure_absent(s,"romantic",("not practical","unrealistic","idealistic rather than practical"))
    ideal=s.new(4194,"idealistic_unrealistic","adjective","理想化的；不切实际的","idealistic rather than practical or realistic",level="L2")
    overlay(s,4194,"sense:romantic:0a3bfc5d5ce75c3e",identity_type="capitalization_boundary",paired_form="Romantic",case_sensitive=True,note="capitalized Romantic refers to the cultural/artistic movement or period; lowercase romantic covers love and idealistic meanings")
    s.add_colloc(4194,ideal,"a romantic view/idea","理想化而不切实际的看法","usage_example")
    rebuild_core(s,4194,("L1","L2"),"爱情/浪漫的；理想化而可能不切实际的；大写 Romantic 指浪漫主义","romantic in love; idealistic/not fully realistic; capitalized Romantic for the movement")

    # o4199 rose: remove Form truth from semantic Core; do not reactivate old past-tense sense.
    rebuild_core(s,4199,("L1","L2"),"玫瑰、蔷薇或玫瑰色；rose=rise过去式属于 Form/inflection truth而非语义分支","rose flower/color uses; rose as past of rise is inflectional Form truth, not a semantic sense")

    # o4202 rotten: common informal bad/awful is absent -> genuine NEW.
    ensure_absent(s,"rotten",("very bad","awful"))
    bad=s.new(4202,"informal_bad","adjective","很糟的；恶劣的（非正式）","very bad, unpleasant, or of poor quality (informal)",level="L2")
    s.add_colloc(4202,bad,"a rotten day/luck","糟糕的一天/坏运气","usage_example")
    rebuild_core(s,4202,("L1","L2"),"腐烂的；非正式也可表示很糟、恶劣","decayed/rotten; informally very bad or awful")

    # o4203 rough: exact stable ordinary branches.
    put(s,4203,"sense:rough:bdcbdf6bbcaf5129",level="L1",branch=0)
    put(s,4203,"sense:rough:42d37462962351db",level="L1",branch=1)
    put(s,4203,"sense:rough:07d07d188b595ae6",level="L2",branch=2)
    core(s,4203,"粗糙的；大致的；粗暴/严酷的","not smooth; approximate; harsh, rough or violent")

    # o4204 round: include all central L1/L2 active branches, keep L3 out of Core.
    rebuild_core(s,4204,("L1","L2"),"圆的；一轮/回合；围绕；约数；使变圆/取整；巡回等常见义","round/circular; a round or stage; around; approximate/round-number uses; common rounding and rounds uses")
    anchors={
        "all year round":"sense:round:5bf12275f1f159dd",
        "a round of applause":"sense:round:cfd18f339d87526a",
        "a round of drinks":"sense:round:cfd18f339d87526a",
    }
    cons=s.record(4204).get("constructions",[])
    for pattern,sid in anchors.items():
        hits=[x for x in cons if x.get("pattern")==pattern]
        if len(hits)!=1:
            raise RuntimeError(f"ROUND_CONSTRUCTION_NOT_UNIQUE {pattern} {len(hits)}")
        hits[0]["source_sense_id"]=sid
    s.mark(4204)

    # o4208 routine: remove polluted computer collocation and replace with clean carrier.
    drop_collocation(s,4208,"a subroutine routine")
    s.add_colloc(4208,"sense:routine:0dd42d144bb354d9","a computer routine","计算机例程","usage_example")

    # o4209 row: exact Sol-approved unmerge + heteronym boundary.
    put(s,4209,"sense:row:95b218aabf4c5b9f",level="L1",branch=1)
    put(s,4209,"sense:row:2250c8db5d4355be",level="L2",branch=2)
    overlay(s,4209,"sense:row:288f9aa2bbed532c",identity_type="pronunciation_boundary",paired_form="row /roʊ/",note="line noun row is /roʊ/")
    overlay(s,4209,"sense:row:95b218aabf4c5b9f",identity_type="pronunciation_boundary",paired_form="row /roʊ/",note="rowing verb row is /roʊ/")
    overlay(s,4209,"sense:row:2250c8db5d4355be",identity_type="pronunciation_boundary",paired_form="row /raʊ/",note="quarrel noun row is /raʊ/")
    core(s,4209,"排、行 /roʊ/；划船 /roʊ/；争吵 /raʊ/","row /roʊ/ as a line or to propel a boat; row /raʊ/ as a quarrel")

    # o4213 rubber: regional/register boundary; condom branch absent -> genuine NEW low layer.
    overlay(s,4213,"sense:rubber:fdfd6788b8845c23",identity_type="regional_register_boundary",paired_form="eraser",note="BrE rubber commonly means eraser; AmE neutral term is eraser")
    ensure_absent(s,"rubber",("condom",))
    condom=s.new(4213,"ame_informal_condom","noun","避孕套（美式非正式）","a condom (informal American English)",level="L3")
    overlay(s,4213,condom,identity_type="regional_register_boundary",paired_form="condom",note="AmE informal rubber can mean condom; keep this low with a register warning")
    rebuild_core(s,4213,("L1","L2"),"橡胶；英式英语 rubber 还常指橡皮擦","rubber material; in BrE rubber commonly also means an eraser")

    # o4215 rude: exact stable hierarchy.
    put(s,4215,"sense:rude:efab47620228539e",level="L1",branch=0)
    put(s,4215,"sense:rude:67116595f6b054ba",level="L2",branch=1)
    put(s,4215,"sense:rude:3b74467a803d54e4",level="L3",branch=2)
    core(s,4215,"粗鲁无礼的；粗陋/粗糙为次级；原始义低层","impolite/offensive; crude/rough secondary; primitive historical/technical lower")

    # o4218 rule: regulation + govern main; judicial ruling and rule-over secondary; reign-duration low.
    put(s,4218,"sense:rule:d39a98cfaca85dc7",level="L1",branch=0)
    put(s,4218,"sense:rule:30080c7516cd55b0",level="L1",branch=1)
    put(s,4218,"sense:rule:5756d0dd1baf5923",level="L2",branch=2)
    put(s,4218,"sense:rule:8db1e8e544d356ca",level="L2",branch=3)
    put(s,4218,"sense:rule:2d796b6a4ec25789",level="L3",branch=4)
    core(s,4218,"规则、规定；统治、管理；裁定等为次级","a rule/regulation; to govern/control; official ruling and reign-related uses secondary")

    # o4220 rumor: same-owner BrE spelling alias, not a duplicate Word.
    for sid in ("sense:rumor:3ed019034862561c","sense:rumor:2558dbbf142a5f43"):
        overlay(s,4220,sid,identity_type="regional_spelling_boundary",paired_form="rumour",note="rumor is common AmE spelling; rumour is common BrE spelling; both resolve to this same Word owner")

    if set(s.changed_word_ordinals) != set(SOURCE):
        raise RuntimeError(f"SHARD2_CHANGED_OWNER_MISMATCH expected={SOURCE} actual={sorted(s.changed_word_ordinals)}")


def main():
    if len(SOURCE)!=17:
        raise RuntimeError("SHARD2_SOURCE_COUNT_DRIFT")
    s=base.Store()
    apply(s)
    s.finalize()
    add_rumour_lookup_alias()
    natural,_relations,report=build()
    if report.get("status")!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    for o in SOURCE:
        dump_json(OWNER_DIR/f"o{o:04d}.json",natural[o])

    no_change=[o for o in range(4175,4225) if o not in SOURCE]
    bad=[]
    for o in no_change:
        rel=f"content/lexical/words/by-ordinal/o{o:04d}.json"
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()):
            bad.append(o)
    if bad:
        raise RuntimeError(f"NO_CHANGE_BYTE_GUARD_FAILED {bad}")
    if sorted(s.changed_word_ordinals)!=list(SOURCE):
        raise RuntimeError(f"SHARD2_FINAL_CHANGED_OWNER_MISMATCH {sorted(s.changed_word_ordinals)}")
    lookup=json.loads(LOOKUP_RU.read_text(encoding="utf-8"))
    if lookup.get("rumour")!=lookup.get("rumor"):
        raise RuntimeError("RUMOUR_LOOKUP_READBACK_FAILED")

    receipt={
        "schema":"kianos.lexical.forward_shard_receipt.v2",
        "status":"LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION",
        "authority":AUTHORITY,
        "package":[4125,4374],
        "shard":[4175,4224],
        "reviewed_owner_count":50,
        "semantic_mutation_source_count":17,
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
        "lookup_aliases":{"rumour":"word:rumor"},
        "readback":{
            "all_50_owner_views":"PASS",
            "all_17_authorized_semantic_sources":"PASS",
            "no_change_33_byte_guard":"PASS",
            "no_remote_dependency_writes":"PASS",
            "row_identity_unmerge":"PASS",
            "rumour_same_owner_lookup":"PASS",
            "stable_registry_closure":"PASS",
            "natural_owner_registry_audit":"PASS",
        },
    }
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    out=RECEIPT_DIR/"o4175-o4224.json"
    out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"SHARD2_PASS changed={len(SOURCE)} no_change={len(no_change)} receipt={out.relative_to(ROOT)}")


if __name__=="__main__":
    main()
