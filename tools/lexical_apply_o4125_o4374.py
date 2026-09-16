#!/usr/bin/env python3
"""Fail-closed package executor for Issue #215 / o4125-o4374.

Semantic authority:
  content/lexical/semantic-reconciliation/o4125-o4374.md

The package is executed continuously. The five 50-owner boundaries are
transport/rollback/receipt boundaries only; they are not semantic-review units.

`--preflight` is read-only. `--shard 1` implements the first mechanical
receipt boundary only; every stable-identity lookup is exact or unique-match
and fails closed on ambiguity.
"""
from __future__ import annotations

import argparse
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
SENSE_DIR = LEX / "canonical" / "senses" / "shards"
PREFLIGHT = LEX / "execution" / "preflight" / "o4125-o4374.current-identities.json"
RECEIPT_DIR = LEX / "execution" / "receipts"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")

PACKAGE_RANGE = (4125, 4374)
SOURCE_OWNERS = (
    4126,4133,4138,4139,4140,4141,4144,4148,4150,4154,4156,4160,4163,4164,4167,4168,4172,4173,
    4178,4184,4187,4188,4192,4193,4194,4199,4202,4203,4204,4208,4209,4213,4215,4218,4220,4226,
    4237,4238,4244,4249,4253,4255,4258,4259,4263,4264,4265,4266,4268,4281,4283,4285,4290,4291,
    4294,4296,4299,4301,4302,4303,4305,4312,4315,4320,4322,4328,4329,4340,4341,4343,4344,4347,
    4353,4354,4357,4359,4360,4365,4368,4372,4374,
)
REMOTE_WORD_DEPENDENCIES = (6139,)
RECEIPT_BOUNDARIES = (
    (4125, 4174, 18),
    (4175, 4224, 17),
    (4225, 4274, 14),
    (4275, 4324, 16),
    (4325, 4374, 16),
)
SHARD1 = tuple(o for o in SOURCE_OWNERS if 4125 <= o <= 4174)
AUTHORITY = "content/lexical/semantic-reconciliation/o4125-o4374.md"
ISSUE = 215


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def baseline_bytes(rel: str) -> bytes:
    if BASELINE == "unknown":
        raise RuntimeError("KIANOS_BASELINE_MAIN must be pinned")
    return subprocess.check_output(["git", "show", f"{BASELINE}:{rel}"])


def validate_static_contract() -> None:
    assert len(SOURCE_OWNERS) == 81
    assert len(set(SOURCE_OWNERS)) == 81
    assert min(SOURCE_OWNERS) >= PACKAGE_RANGE[0]
    assert max(SOURCE_OWNERS) <= PACKAGE_RANGE[1]
    assert sum(x[2] for x in RECEIPT_BOUNDARIES) == 81
    assert REMOTE_WORD_DEPENDENCIES == (6139,)
    assert len(SHARD1) == 18


def compact_sense(s: dict) -> dict:
    return {
        k: s.get(k)
        for k in (
            "sense_id", "stable_sense_id", "status", "merged_into_sense_id", "pos", "level",
            "definition_cn", "definition_en", "sense_label_en", "governing_pattern", "transitivity",
            "usage_note", "sort_order", "legacy_aliases", "lexical_identity_overlay",
        )
        if s.get(k) not in (None, [], "")
    } | ({"collocations": s.get("collocations", [])} if s.get("collocations") else {})


def build_preflight() -> dict:
    validate_static_contract()
    registry_by_word: dict[str, list[dict]] = defaultdict(list)
    for path in sorted(SENSE_DIR.glob("*.json")):
        for row in load(path):
            rec = row.get("record", {})
            word = rec.get("headword")
            if word:
                registry_by_word[word].append(compact_sense(rec))
    owners = {}
    for ordinal in SOURCE_OWNERS + REMOTE_WORD_DEPENDENCIES:
        obj = load(OWNER_DIR / f"o{ordinal:04d}.json")
        rec = obj.get("record", obj)
        word = obj.get("word") or rec.get("word")
        owners[f"o{ordinal:04d}"] = {
            "word": word,
            "word_id": obj.get("word_id") or rec.get("word_id"),
            "core_concept": rec.get("core_concept"),
            "active_senses": [compact_sense(x) for x in rec.get("senses", [])],
            "reference_senses": [compact_sense(x) for x in obj.get("reference_senses", rec.get("reference_senses", []))],
            "registry_senses_for_headword": sorted(registry_by_word.get(word, []), key=lambda x: (str(x.get("status")), str(x.get("stable_sense_id")))),
            "constructions": rec.get("constructions", []),
            "word_family": rec.get("word_family", []),
            "relation_refs": obj.get("relation_refs", rec.get("relation_refs", [])),
            "confusables": rec.get("confusables", []),
            "semantic_neighbors": rec.get("semantic_neighbors", []),
            "secondary_senses": rec.get("secondary_senses", []),
            "exam_paraphrases": rec.get("exam_paraphrases", []),
        }
    return {
        "schema": "kianos.lexical.execution_identity_preflight.v1",
        "status": "READ_ONLY_CURRENT_EVIDENCE",
        "issue": ISSUE,
        "authority": AUTHORITY,
        "package_range": list(PACKAGE_RANGE),
        "source_owners": list(SOURCE_OWNERS),
        "remote_word_dependencies": list(REMOTE_WORD_DEPENDENCIES),
        "receipt_boundaries": [list(x) for x in RECEIPT_BOUNDARIES],
        "owners": owners,
    }


def write_preflight() -> None:
    report = build_preflight()
    PREFLIGHT.parent.mkdir(parents=True, exist_ok=True)
    PREFLIGHT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PREFLIGHT_PASS owners={len(report['owners'])} source_union={len(SOURCE_OWNERS)} remote={REMOTE_WORD_DEPENDENCIES}")


sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base  # noqa: E402
from lexical_natural_owner import build, dump_json  # noqa: E402


def hay(rec: dict) -> str:
    return " ".join(
        [str(rec.get("definition_en", "")), str(rec.get("definition_cn", ""))]
        + [str(x) for x in rec.get("legacy_aliases", [])]
    ).lower()


def exact_sid(store, word: str, *, pos: str | None = None, alias: str | None = None,
              all_terms: tuple[str, ...] = (), any_terms: tuple[str, ...] = ()) -> str:
    candidates = []
    for sid, rec in store.senses.items():
        if rec.get("headword") != word:
            continue
        if pos and rec.get("pos") != pos:
            continue
        if alias and alias not in rec.get("legacy_aliases", []):
            continue
        text = hay(rec)
        if all_terms and not all(t.lower() in text for t in all_terms):
            continue
        if any_terms and not any(t.lower() in text for t in any_terms):
            continue
        candidates.append(sid)
    if len(candidates) != 1:
        raise RuntimeError(
            f"IDENTITY_LOOKUP_NOT_UNIQUE word={word} pos={pos} alias={alias} "
            f"all={all_terms} any={any_terms} candidates={candidates}"
        )
    return candidates[0]


def put(store, ordinal: int, sid: str, *, level: str, pattern: str | None = None, branch: int | None = None):
    return store.put_existing(ordinal, sid, level=level, pattern=pattern, branch=branch)


def overlay(store, ordinal: int, sid: str, *, identity_type: str, paired_form: str, note: str, case_sensitive: bool = False):
    store.add_overlay(ordinal, sid, {
        "case_sensitive": case_sensitive,
        "identity_type": identity_type,
        "surface_lemma": store.record(ordinal)["word"],
        "paired_form": paired_form,
        "note": note,
    })


def core(store, ordinal: int, cn: str, en: str) -> None:
    store.core(ordinal, cn=cn, en=en)


def rebuild_core_from_levels(store, ordinal: int, *, levels=("L1",), cn: str, en: str) -> None:
    rec = store.record(ordinal)
    selected = [x for x in rec.get("senses", []) if x.get("level") in levels]
    if not selected:
        raise RuntimeError(f"CORE_REBUILD_NO_SELECTED_SENSES o{ordinal:04d}")
    grouped: dict[str, list[dict]] = defaultdict(list)
    for s in selected:
        grouped[str(s.get("pos", "other"))].append(s)
    clusters = []
    for pos, senses in grouped.items():
        clusters.append({
            "label_cn": "；".join(dict.fromkeys(x.get("definition_cn", "") for x in senses if x.get("definition_cn"))),
            "label_en": "; ".join(dict.fromkeys(x.get("definition_en", "") for x in senses if x.get("definition_en"))),
            "pos": pos,
            "sense_ids": [x["sense_id"] for x in senses],
        })
    rec.setdefault("core_concept", {})["core_clusters"] = clusters
    rec["core_concept"]["core_meaning_cn"] = cn
    rec["core_concept"]["mental_model_cn"] = cn
    rec["core_concept"]["core_meaning_en"] = en
    store.mark(ordinal)


def relocate_phone_ring(store, ordinal: int, target_sid: str) -> None:
    rec = store.record(ordinal)
    found = []
    for sense in rec.get("senses", []):
        for item in list(sense.get("collocations", [])):
            p = str(item.get("phrase", "")).lower()
            if "give" in p and "ring" in p:
                found.append((sense, item))
    if len(found) > 1:
        raise RuntimeError(f"RING_COLLOCATION_AMBIGUOUS {[(x[1].get('phrase')) for x in found]}")
    if found:
        sense, item = found[0]
        phrase = item.get("phrase")
        meaning = item.get("meaning_cn") or "给某人打电话"
        sense.get("collocations", []).remove(item)
        old = store.colls.get(item.get("collocation_id"))
        if old:
            old["status"] = "deprecated"
            store.changed_collocation_ids.add(item["collocation_id"])
        store.mark(ordinal)
        store.add_colloc(ordinal, target_sid, phrase, meaning, item.get("exam_value", "fixed_pattern"))
    else:
        store.add_colloc(ordinal, target_sid, "give sb a ring", "给某人打电话", "fixed_pattern")


def apply_shard1(store) -> None:
    # o4126 restless — exact stable branches, no NEW identity.
    put(store, 4126, "sense:restless:c0ef118825f458a1", level="L1", branch=0)
    put(store, 4126, "sense:restless:d126604b7b145a82", level="L1", branch=1)
    put(store, 4126, "sense:restless:10b13ebca2615dfc", level="L2", branch=2)
    core(store, 4126, "坐立不安或焦虑不安，无法安静放松", "unable to stay still or relax; worried and uneasy")

    # o4133 resume — same Word, pronunciation/Form boundary only.
    for sid in ("sense:resume:07630ca29c245831", "sense:resume:bc8fa268927c5b54"):
        overlay(store, 4133, sid, identity_type="pronunciation_boundary", paired_form="résumé / resume",
                note="verb resume /rɪˈzuːm/ = begin again; noun résumé/resume /ˈrɛzəmeɪ/ = CV/job summary")

    # o4138 retort.
    put(store, 4138, "sense:retort:0b4aef19795c529a", level="L1", branch=0)
    put(store, 4138, "sense:retort:70d02be4654754db", level="L1", branch=1)
    put(store, 4138, "sense:retort:e67549187fb25537", level="L3", branch=2)
    core(store, 4138, "尖锐回嘴、反驳；另有低频化学蒸馏器义", "a sharp reply or to reply sharply; with a lower chemistry-vessel sense")

    # o4139 retreat.
    put(store, 4139, "sense:retreat:258ff606f7bc5026", level="L1", branch=0)
    put(store, 4139, "sense:retreat:2ad456b1b8685957", level="L1", branch=1)
    put(store, 4139, "sense:retreat:e37d438146db5842", level="L2", branch=2)
    core(store, 4139, "撤退、退却；也可指远离日常生活的安静去处", "withdrawal or moving back; also a quiet/private place away from ordinary life")

    # o4140 retrieve — stable ordinary get-back branch.
    retrieve_sid = exact_sid(store, "retrieve", pos="verb", alias="retrieve:l1:1")
    put(store, 4140, retrieve_sid, level="L1", branch=0)
    core(store, 4140, "取回、找回；包括检索数据或信息", "get something back, including retrieving data or information")

    # o4141 retrospect — Audit-only restoration of ordinary noun.
    retrospect_sid = exact_sid(store, "retrospect", pos="noun", alias="retrospect:l1:1")
    put(store, 4141, retrospect_sid, level="L1", branch=0)
    store.add_construction(4141, "in retrospect", "回想起来；事后看来")
    core(store, 4141, "回顾、追溯过去；常见于 in retrospect", "a review or view of the past, especially in retrospect")

    # o4144 revelation — capitalization boundary, reuse existing biblical branch.
    revelation_book = exact_sid(store, "revelation", pos="noun", any_terms=("book of revelation", "biblical book", "last book"))
    put(store, 4144, revelation_book, level="L2")
    overlay(store, 4144, revelation_book, identity_type="capitalization_boundary", paired_form="Revelation",
            note="lowercase revelation = disclosure/divine communication; capitalized Revelation = the biblical Book of Revelation",
            case_sensitive=True)

    # o4148 review — exact stable verb + critical-evaluation noun.
    put(store, 4148, "sense:review:365d75f0a0ba5060", level="L1", branch=0)
    put(store, 4148, "sense:review:60f9ab7863fd5f18", level="L1", branch=1)
    core(store, 4148, "复习、审查；评论或评审", "to examine/study again; a critical evaluation or review")

    # o4150 revive — restore intransitive recover/regain-consciousness branch behind revive from.
    revive_intrans = exact_sid(store, "revive", pos="verb", any_terms=("regain consciousness", "recover", "come back to life"))
    put(store, 4150, revive_intrans, level="L1", pattern="vi. + from")
    store.add_construction(4150, "revive from sth", "从昏迷、虚弱或低迷状态中恢复")

    # o4154 revolve — Production construction + Audit transitive physical-turn branch.
    revolve_trans = exact_sid(store, "revolve", pos="verb", any_terms=("cause to turn", "turn something", "rotate something"))
    put(store, 4154, revolve_trans, level="L2", pattern="vt. + object")
    store.add_construction(4154, "revolve around sth", "以某事为中心；围绕某事展开")
    store.add_construction(4154, "revolve sth", "使某物旋转，例如 revolve a wheel")

    # o4156 rhetoric — active modern disapproving sense must be represented in Core.
    rebuild_core_from_levels(store, 4156, levels=("L1", "L2"),
                             cn="修辞、言辞；也常指华丽但空洞或不真诚的言辞",
                             en="rhetorical language; also language regarded as empty, exaggerated, or insincere")

    # o4160 rice — food grain main, plant secondary; rare verb remains low/reference.
    rice_food = exact_sid(store, "rice", pos="noun", alias="rice:l1:1")
    put(store, 4160, rice_food, level="L1", branch=0)
    try:
        rice_plant = exact_sid(store, "rice", pos="noun", alias="rice:l2:2")
        put(store, 4160, rice_plant, level="L2", branch=1)
    except RuntimeError:
        rice_plant = exact_sid(store, "rice", pos="noun", any_terms=("rice plant", "plant that produces rice"))
        put(store, 4160, rice_plant, level="L2", branch=1)
    core(store, 4160, "稻米、大米；植物义为次级", "rice as the food grain, with the rice plant as a secondary branch")

    # o4163 riddle — restore ordinary puzzle/question branch.
    riddle_puzzle = exact_sid(store, "riddle", pos="noun", alias="riddle:l1:1")
    put(store, 4163, riddle_puzzle, level="L1", branch=0)
    core(store, 4163, "谜语、谜题；另有次级动词义", "a puzzle or question whose answer requires ingenuity; secondary verb uses remain separate")

    # o4164 ride — preserve existing control branch, unmerge/reactivate journey noun + vehicle/passenger verb.
    ride_journey = exact_sid(store, "ride", pos="noun", any_terms=("journey", "trip"))
    ride_vehicle = exact_sid(store, "ride", pos="verb", any_terms=("vehicle", "be carried", "travel in"))
    put(store, 4164, ride_journey, level="L1")
    put(store, 4164, ride_vehicle, level="L1")
    core(store, 4164, "骑乘、乘车；也指一次乘坐或旅程", "to ride an animal/bicycle or travel as a passenger; also a journey/ride")

    # o4167 rifle — firearm noun + rifle through sth.
    rifle_noun = exact_sid(store, "rifle", pos="noun", any_terms=("firearm", "gun"))
    rifle_search = exact_sid(store, "rifle", pos="verb", any_terms=("rummage", "search through", "search quickly"))
    put(store, 4167, rifle_noun, level="L1", branch=0)
    put(store, 4167, rifle_search, level="L2", branch=1)
    store.add_construction(4167, "rifle through sth", "快速翻找、搜寻某物")
    core(store, 4167, "步枪；rifle through 表示快速翻找", "a rifle/firearm; rifle through means rummage or search quickly")

    # o4168 right — Core must cover central active L1 branches without dictionary-dumping lower senses.
    rebuild_core_from_levels(store, 4168, levels=("L1",),
                             cn="正确的、合适的、右侧的；权利；向右/正好等核心用法",
                             en="central uses include correct/appropriate, right-side, rights/entitlement, and core directional/adverbial uses")

    # o4172 ring — restore/re-anchor familiar telephone-call noun.
    ring_phone = exact_sid(store, "ring", pos="noun", any_terms=("telephone call", "phone call", "call by telephone"))
    put(store, 4172, ring_phone, level="L1")
    relocate_phone_ring(store, 4172, ring_phone)

    # o4173 riot — crowd disturbance noun + participate-in-riot verb.
    riot_noun = exact_sid(store, "riot", pos="noun", any_terms=("public disturbance", "violent disturbance", "crowd"))
    riot_verb = exact_sid(store, "riot", pos="verb", any_terms=("take part in a riot", "participate in a riot"))
    put(store, 4173, riot_noun, level="L1", branch=0)
    put(store, 4173, riot_verb, level="L2", branch=1)
    core(store, 4173, "骚乱、暴乱；参与骚乱", "a violent public disturbance; to take part in a riot")

    if set(store.changed_word_ordinals) != set(SHARD1):
        raise RuntimeError(f"SHARD1_CHANGED_OWNER_MISMATCH expected={SHARD1} actual={sorted(store.changed_word_ordinals)}")


def run_shard1() -> None:
    validate_static_contract()
    store = base.Store()
    apply_shard1(store)
    store.finalize()
    natural, _relations, report = build()
    if report.get("status") != "PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:" + json.dumps(report, ensure_ascii=False))
    for ordinal in SHARD1:
        dump_json(OWNER_DIR / f"o{ordinal:04d}.json", natural[ordinal])

    no_change = [o for o in range(4125, 4175) if o not in SHARD1]
    no_change_bad = []
    for ordinal in no_change:
        rel = f"content/lexical/words/by-ordinal/o{ordinal:04d}.json"
        if sha_bytes(baseline_bytes(rel)) != sha_bytes((ROOT / rel).read_bytes()):
            no_change_bad.append(ordinal)
    if no_change_bad:
        raise RuntimeError(f"NO_CHANGE_BYTE_GUARD_FAILED {no_change_bad}")

    changed = sorted(store.changed_word_ordinals)
    if changed != list(SHARD1):
        raise RuntimeError(f"SHARD1_FINAL_CHANGED_OWNER_MISMATCH {changed}")

    receipt = {
        "schema": "kianos.lexical.forward_shard_receipt.v2",
        "status": "LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION",
        "authority": AUTHORITY,
        "package": list(PACKAGE_RANGE),
        "shard": [4125, 4174],
        "reviewed_owner_count": 50,
        "semantic_mutation_source_count": len(SHARD1),
        "semantic_source_ordinals": list(SHARD1),
        "changed_word_ordinals": changed,
        "in_range_changed_word_ordinals": changed,
        "out_of_range_dependency_ordinals": [],
        "no_change_word_ordinals": no_change,
        "new_semantic_branch_ids": sorted(set(store.new_stable_sense_ids)),
        "new_semantic_branch_count": len(set(store.new_stable_sense_ids)),
        "reactivated_stable_ids": sorted(set(store.changed_sense_ids) - set(store.new_stable_sense_ids)),
        "demoted_stable_ids": sorted(sid for sid in store.changed_sense_ids if store.senses.get(sid, {}).get("status") == "deprecated"),
        "changed_relation_owner_paths": [],
        "readback": {
            "all_50_owner_views": "PASS",
            "all_18_authorized_semantic_sources": "PASS",
            "no_change_32_byte_guard": "PASS",
            "no_remote_dependency_writes": "PASS",
            "stable_registry_closure": "PASS",
            "natural_owner_registry_audit": "PASS",
        },
    }
    RECEIPT_DIR.mkdir(parents=True, exist_ok=True)
    out = RECEIPT_DIR / "o4125-o4174.json"
    out.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"SHARD1_PASS changed={len(changed)} no_change={len(no_change)} receipt={out.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument("--shard", type=int, choices=(1,))
    args = parser.parse_args()
    if args.preflight:
        write_preflight()
        return
    if args.shard == 1:
        run_shard1()
        return
    validate_static_contract()
    raise SystemExit("choose --preflight or --shard 1")


if __name__ == "__main__":
    main()
