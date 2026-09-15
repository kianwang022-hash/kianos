#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
WORDS = LEX / "words" / "by-ordinal"
SENSE_SHARD = LEX / "canonical" / "senses" / "shards" / "o0001-0032.json"
COLL_SHARD = LEX / "canonical" / "collocations" / "shards" / "o0001-0032.json"
SCHEMA = LEX / "schema.json"
AUTHORITY = LEX / "semantic-reconciliation" / "o0001-o0024.md"
STAMP = "2026-09-16T00:00:00Z"
TARGETS = [4, 5, 7, 15, 16, 19, 22]
RECON_SIG = "semantic-reconciliation:o0001-o0024"


def stable(v: Any) -> str:
    return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha(v: Any) -> str:
    return hashlib.sha256(stable(v).encode("utf-8")).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_pretty(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def dump_compact(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def owner(o: int) -> dict[str, Any]:
    return load(WORDS / f"o{o:04d}.json")


def sense(rec: dict[str, Any], sid: str) -> dict[str, Any]:
    found = next((x for x in rec.get("senses", []) if x.get("sense_id") == sid), None)
    if found is None:
        raise RuntimeError(f"ACTIVE_SENSE_MISSING:{sid}")
    return found


def colloc(rec: dict[str, Any], cid: str) -> tuple[dict[str, Any], dict[str, Any]]:
    for s in rec.get("senses", []):
        for c in s.get("collocations", []) or []:
            if c.get("collocation_id") == cid:
                return s, c
    raise RuntimeError(f"ACTIVE_COLLOCATION_MISSING:{cid}")


def registry_row(rows: list[dict[str, Any]], field: str, rid: str) -> dict[str, Any]:
    matches = [r for r in rows if r.get("record", {}).get(field) == rid]
    if len(matches) != 1:
        raise RuntimeError(f"REGISTRY_ROW_COUNT:{field}:{rid}:{len(matches)}")
    return matches[0]


def mark(owner_obj: dict[str, Any]) -> None:
    sig = owner_obj["record"].setdefault("review_signature", [])
    if RECON_SIG not in sig:
        sig.append(RECON_SIG)
    owner_obj.setdefault("provenance", {})["semantic_delta"] = 1
    owner_obj["provenance"]["corrective_authority"] = "content/lexical/semantic-reconciliation/o0001-o0024.md"
    rec = owner_obj["record"]
    rec["content_hash"] = sha({k: v for k, v in rec.items() if k != "content_hash"})


def form_identity(word: str, variants: list[dict[str, Any]], boundary: str) -> dict[str, Any]:
    return {
        "form_type": "same_spelling_pos_conditioned_pronunciation",
        "spelling": word,
        "identity_rule": "same_word_owner_no_semantic_split",
        "boundary": boundary,
        "variants": variants,
        "authority": "content/lexical/semantic-reconciliation/o0001-o0024.md",
    }


def refresh_abnormal_refs(o: dict[str, Any], sense_rows: list[dict[str, Any]]) -> None:
    active_ids = {s.get("sense_id") for s in o["record"].get("senses", [])}
    rows = [r for r in sense_rows if r.get("anchor_ordinal") == 7]
    o["identity_refs"]["senses"] = [
        {
            "sense_id": r["record"].get("stable_sense_id"),
            "status": r["record"].get("status"),
            "merged_into_sense_id": r["record"].get("merged_into_sense_id"),
            "source_row": r.get("source_row"),
            "source_path": "content/lexical/canonical/senses/shards/o0001-0032.json",
        }
        for r in rows
        if r["record"].get("stable_sense_id")
    ]
    refs = []
    for r in rows:
        reg = r["record"]
        sid = reg.get("stable_sense_id")
        if not sid or sid in active_ids:
            continue
        refs.append({
            "stable_sense_id": sid,
            "status": reg.get("status"),
            "merged_into_sense_id": reg.get("merged_into_sense_id"),
            "pos": reg.get("pos"),
            "definition_cn": reg.get("definition_cn"),
            "definition_en": reg.get("definition_en"),
            "semantic_key": reg.get("semantic_key"),
            "semantic_key_history": reg.get("semantic_key_history", []),
            "legacy_aliases": reg.get("legacy_aliases", []),
            "legacy_alias_history": reg.get("legacy_alias_history", []),
            "updated_at": reg.get("updated_at"),
            "source_row": r.get("source_row"),
            "source_path": "content/lexical/canonical/senses/shards/o0001-0032.json",
            "reference_only": True,
        })
    o["reference_senses"] = refs


def apply() -> dict[str, Any]:
    if not AUTHORITY.exists():
        raise RuntimeError("AUTHORITY_MISSING")

    owners = {x: owner(x) for x in TARGETS}
    sense_rows = load(SENSE_SHARD)
    coll_rows = load(COLL_SHARD)
    schema = load(SCHEMA)

    # o0004 abide: repair the misleading positive free-use example.
    o = owners[4]
    s, c = colloc(o["record"], "collocation:f8dc1f70801b1a152ec0")
    if s.get("sense_id") != "sense:abide:a76278b84da9503c" or c.get("phrase") != "abide the delay":
        raise RuntimeError("ABIDE_PRECONDITION_DRIFT")
    c["phrase"] = "can't abide the delay"
    c["meaning_cn"] = "无法忍受这次延误"
    reg = registry_row(coll_rows, "collocation_id", c["collocation_id"])["record"]
    reg["sense_id"] = s["sense_id"]
    reg["status"] = "active"
    reg["current_value_hash"] = sha(c)
    mark(o)

    # o0005 ability: normalize malformed production strings, preserve IDs.
    o = owners[5]
    expected = {
        "collocation:aa43b28901fdc72137a9": ("the ability to do + sth", "the ability to do sth", "做某事的能力"),
        "collocation:eaea95b553bc6946fa16": ("have the ability to + do", "have the ability to do sth", "有能力做某事"),
    }
    for cid, (old, new, meaning) in expected.items():
        s, c = colloc(o["record"], cid)
        if c.get("phrase") != old:
            raise RuntimeError(f"ABILITY_PRECONDITION_DRIFT:{cid}:{c.get('phrase')}")
        c["phrase"] = new
        c["meaning_cn"] = meaning
        reg = registry_row(coll_rows, "collocation_id", cid)["record"]
        reg["sense_id"] = s["sense_id"]
        reg["status"] = "active"
        reg["current_value_hash"] = sha(c)
    mark(o)

    # o0007 abnormal: merge the over-generalized high-degree sense into ordinary abnormal.
    o = owners[7]
    rec = o["record"]
    survivor = "sense:abnormal:98807d28524a5607"
    merged = "sense:abnormal:3271d9f4317951c3"
    target = sense(rec, survivor)
    old = sense(rec, merged)
    if old.get("definition_en") != "much greater than the normal":
        raise RuntimeError("ABNORMAL_PRECONDITION_DRIFT")
    moved = next((x for x in old.get("collocations", []) if x.get("collocation_id") == "collocation:89e5dccb37047c0f1aff"), None)
    if moved is None:
        raise RuntimeError("ABNORMAL_PROFIT_COLLOCATION_MISSING")
    moved["meaning_cn"] = "异常/超额利润（经济学语境）"
    target.setdefault("collocations", []).append(moved)
    target["usage_note"] = "Abnormal means deviating from what is normal. In economics, abnormal profit is a bounded domain phrase for profit above the normal level; it does not make abnormal a free synonym for 'much greater'."
    rec["senses"] = [x for x in rec.get("senses", []) if x.get("sense_id") != merged]
    for cluster in rec.get("core_concept", {}).get("core_clusters", []) or []:
        cluster["sense_ids"] = [survivor if sid == merged else sid for sid in cluster.get("sense_ids", [])]
        cluster["sense_ids"] = list(dict.fromkeys(cluster["sense_ids"]))
    sreg = registry_row(sense_rows, "stable_sense_id", merged)["record"]
    sreg["status"] = "merged"
    sreg["merged_into_sense_id"] = survivor
    sreg["updated_at"] = STAMP
    survivor_reg = registry_row(sense_rows, "stable_sense_id", survivor)["record"]
    survivor_reg["status"] = "active"
    survivor_reg["merged_into_sense_id"] = None
    survivor_reg["updated_at"] = STAMP
    creg = registry_row(coll_rows, "collocation_id", moved["collocation_id"])["record"]
    creg["sense_id"] = survivor
    creg["status"] = "active"
    creg["current_value_hash"] = sha(moved)
    refresh_abnormal_refs(o, sense_rows)
    mark(o)

    # o0015 absence: move in the absence of to the lack/nonexistence branch.
    o = owners[15]
    rec = o["record"]
    source_sid = "sense:absence:3e4a58fe8eed57ba"
    target_sid = "sense:absence:0da5aabdb1705dae"
    source = sense(rec, source_sid)
    target = sense(rec, target_sid)
    cid = "collocation:76bb173bc3539e2c8fd7"
    moved = next((x for x in source.get("collocations", []) if x.get("collocation_id") == cid), None)
    if moved is None:
        raise RuntimeError("ABSENCE_PRECONDITION_DRIFT")
    source["collocations"] = [x for x in source.get("collocations", []) if x.get("collocation_id") != cid]
    if not any(x.get("collocation_id") == cid for x in target.get("collocations", [])):
        target.setdefault("collocations", []).append(moved)
    creg = registry_row(coll_rows, "collocation_id", cid)["record"]
    creg["sense_id"] = target_sid
    creg["status"] = "active"
    creg["current_value_hash"] = sha(moved)
    mark(o)

    # o0016 absent: same spelling, POS-conditioned stress/pronunciation.
    o = owners[16]
    if "form_identity" in o["record"]:
        raise RuntimeError("ABSENT_FORM_ALREADY_PRESENT")
    o["record"]["form_identity"] = form_identity(
        "absent",
        [
            {"variant_id": "form:absent:adjective", "pos": ["adjective"], "ipa": "/ˈæb.sənt/", "stress": "initial", "learner_key": "ABS-ent"},
            {"variant_id": "form:absent:verb", "pos": ["verb"], "ipa": "/əbˈsent/", "stress": "final", "learner_key": "ab-SENT", "register": "formal"},
        ],
        "The ordinary adjective and formal verb are the same Word identity but differ materially in stress/pronunciation.",
    )
    mark(o)

    # o0019 abstract: adjective/noun versus verb stress.
    o = owners[19]
    if "form_identity" in o["record"]:
        raise RuntimeError("ABSTRACT_FORM_ALREADY_PRESENT")
    o["record"]["form_identity"] = form_identity(
        "abstract",
        [
            {"variant_id": "form:abstract:adjective-noun", "pos": ["adjective", "noun"], "ipa": "/ˈæb.strækt/", "stress": "initial", "learner_key": "AB-stract"},
            {"variant_id": "form:abstract:verb", "pos": ["verb"], "ipa": "/əbˈstrækt/", "stress": "final", "learner_key": "ab-STRACT"},
        ],
        "Adjective/noun and verb remain one Word identity; POS selects the stress pattern.",
    )
    mark(o)

    # o0022 abuse: noun /s/ versus verb /z/.
    o = owners[22]
    if "form_identity" in o["record"]:
        raise RuntimeError("ABUSE_FORM_ALREADY_PRESENT")
    o["record"]["form_identity"] = form_identity(
        "abuse",
        [
            {"variant_id": "form:abuse:noun", "pos": ["noun"], "ipa": "/əˈbjuːs/", "stress": "second_syllable", "learner_key": "noun: /s/"},
            {"variant_id": "form:abuse:verb", "pos": ["verb"], "ipa": "/əˈbjuːz/", "stress": "second_syllable", "learner_key": "verb: /z/"},
        ],
        "Noun and verb are one Word identity; POS selects the final /s/ versus /z/ pronunciation.",
    )
    mark(o)

    # Owner-contract clarification for same-Word form identity.
    owns = schema.get("owners", {}).get("word", {}).setdefault("owns", [])
    if "same_word_form_identity" not in owns:
        owns.append("same_word_form_identity")
    schema["form_identity_policy"] = {
        "same_word_pos_conditioned_pronunciation": "word_owner.record.form_identity",
        "cross_word_spelling_or_lexeme_variant": "relation_owner",
        "pronunciation_only_creates_new_word_or_sense_identity": False,
    }

    # Exact closure checks before writing.
    if len(owners) != 7 or sorted(owners) != TARGETS:
        raise RuntimeError("TARGET_SET_DRIFT")
    for o in (16, 19, 22):
        variants = owners[o]["record"].get("form_identity", {}).get("variants", [])
        if len(variants) != 2 or any(not x.get("pos") for x in variants):
            raise RuntimeError(f"FORM_IDENTITY_NOT_STRUCTURED:o{o:04d}")
    if any(s.get("sense_id") == merged for s in owners[7]["record"].get("senses", [])):
        raise RuntimeError("ABNORMAL_MERGED_SENSE_STILL_ACTIVE")

    for o, obj in owners.items():
        dump_pretty(WORDS / f"o{o:04d}.json", obj)
    dump_compact(SENSE_SHARD, sense_rows)
    dump_compact(COLL_SHARD, coll_rows)
    dump_pretty(SCHEMA, schema)

    return {
        "status": "APPLIED",
        "word_writes": TARGETS,
        "sense_registry_updates": [merged, survivor],
        "collocation_registry_updates": [
            "collocation:f8dc1f70801b1a152ec0",
            "collocation:aa43b28901fdc72137a9",
            "collocation:eaea95b553bc6946fa16",
            "collocation:89e5dccb37047c0f1aff",
            "collocation:76bb173bc3539e2c8fd7",
        ],
        "new_word_ids": 0,
        "new_sense_ids": 0,
        "form_identity_words": [16, 19, 22],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not args.apply:
        print(json.dumps({"status": "READY", "targets": TARGETS, "authority": str(AUTHORITY.relative_to(ROOT))}, indent=2))
        return 0
    report = apply()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
