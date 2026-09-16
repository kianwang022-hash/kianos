#!/usr/bin/env python3
"""Fail-closed package executor for Issue #215 / o4125-o4374.

Semantic authority:
  content/lexical/semantic-reconciliation/o4125-o4374.md

The package is executed continuously. The five 50-owner boundaries are
transport/rollback/receipt boundaries only; they are not semantic-review units.

`--preflight` is read-only: it serializes Current Natural Owner + Sense-registry
identity evidence for the frozen write set so exact stable IDs can be pinned before
semantic mutation. Normal execution remains fail-closed until compiled deltas are
finalized below.
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
SENSE_DIR = LEX / "canonical" / "senses" / "shards"
PREFLIGHT = LEX / "execution" / "preflight" / "o4125-o4374.current-identities.json"

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
AUTHORITY = "content/lexical/semantic-reconciliation/o4125-o4374.md"
ISSUE = 215


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_static_contract() -> None:
    assert len(SOURCE_OWNERS) == 81
    assert len(set(SOURCE_OWNERS)) == 81
    assert min(SOURCE_OWNERS) >= PACKAGE_RANGE[0]
    assert max(SOURCE_OWNERS) <= PACKAGE_RANGE[1]
    assert sum(x[2] for x in RECEIPT_BOUNDARIES) == 81
    assert REMOTE_WORD_DEPENDENCIES == (6139,)


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
            "registry_senses_for_headword": sorted(
                registry_by_word.get(word, []), key=lambda x: (str(x.get("status")), str(x.get("stable_sense_id")))
            ),
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
    print(PREFLIGHT.relative_to(ROOT))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    args = parser.parse_args()
    if args.preflight:
        write_preflight()
        return
    validate_static_contract()
    raise SystemExit(
        "EXECUTOR_NOT_FINALIZED: exact per-owner stable identity mappings must be compiled "
        "from the canonical reconciliation + preflight evidence before semantic writes"
    )


if __name__ == "__main__":
    main()
