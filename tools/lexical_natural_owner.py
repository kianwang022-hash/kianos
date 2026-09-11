#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
CANON = LEX / "canonical"
WORDS_OUT = LEX / "words" / "by-ordinal"
REL_OUT = LEX / "relations" / "by-id"
AUDIT_DIR = LEX / "audit"
AUDIT_PATH = AUDIT_DIR / "natural-owner-cutover.json"
WORD_MANIFEST = LEX / "words" / "manifest.json"
REL_MANIFEST = LEX / "relations" / "manifest.json"
LEX_MANIFEST = LEX / "manifest.json"

STORE_ID_FIELDS = {
    "senses": ("stable_sense_id",),
    "facts": ("fact_id",),
    "collocations": ("collocation_id",),
    "relations": ("relation_id",),
    "exam-mappings": ("exam_mapping_id", "mapping_id", "relation_id"),
    "packs": ("membership_id", "pack_membership_id", "pack_id"),
}


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def relpath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=False) + "\n", encoding="utf-8")


def iter_store(store: str) -> Iterable[tuple[Path, dict[str, Any]]]:
    root = CANON / store / "shards"
    if not root.exists():
        return
    for shard in sorted(root.glob("*.json")):
        rows = load_json(shard)
        if not isinstance(rows, list):
            raise ValueError(f"STORE_SHARD_NOT_ARRAY:{relpath(shard)}")
        for row in rows:
            if not isinstance(row, dict):
                raise ValueError(f"STORE_ROW_NOT_OBJECT:{relpath(shard)}")
            yield shard, row


def record_id(store: str, record: dict[str, Any]) -> str | None:
    for field in STORE_ID_FIELDS.get(store, ()):
        value = record.get(field)
        if isinstance(value, str) and value:
            return value
    return None


def relation_identity(payload: dict[str, Any], source_word_id: str, field: str, index: int) -> str:
    for key in ("relation_id", "fact_id"):
        value = payload.get(key)
        if isinstance(value, str) and value:
            return value
    basis = stable_json({"source_word_id": source_word_id, "field": field, "index": index, "payload": payload})
    return f"relation:embedded:{sha256_text(basis)[:24]}"


def relation_owner_path(relation_id: str) -> Path:
    digest = sha256_text(relation_id)
    return REL_OUT / digest[:2] / f"{digest}.json"


def collect_lookup_spelling() -> tuple[set[str], dict[str, list[dict[str, Any]]]]:
    ids: set[str] = set()
    by_word: dict[str, list[dict[str, Any]]] = defaultdict(list)
    root = CANON / "lookup" / "spelling"
    for path in sorted(root.glob("*.json")):
        obj = load_json(path)
        if not isinstance(obj, dict):
            continue
        for spelling, candidates in obj.items():
            if not isinstance(candidates, list):
                continue
            for candidate in candidates:
                if not isinstance(candidate, dict):
                    continue
                wid = candidate.get("word_id")
                if isinstance(wid, str):
                    ids.add(wid)
                    by_word[wid].append({"spelling": spelling, "source": relpath(path), **candidate})
    return ids, by_word


def build() -> tuple[dict[int, dict[str, Any]], dict[str, dict[str, Any]], dict[str, Any]]:
    blockers: list[str] = []
    warnings: list[str] = []
    source_words: dict[int, dict[str, Any]] = {}
    word_shards: dict[int, str] = {}
    words_by_id: dict[str, int] = {}

    for shard, row in iter_store("words"):
        ordinal = row.get("ordinal")
        record = row.get("record")
        if not isinstance(ordinal, int) or not isinstance(record, dict):
            blockers.append(f"INVALID_WORD_ROW:{relpath(shard)}")
            continue
        wid = record.get("word_id")
        if not isinstance(wid, str) or not wid:
            blockers.append(f"WORD_ID_MISSING:o{ordinal:04d}")
            continue
        if ordinal in source_words:
            blockers.append(f"DUPLICATE_ORDINAL:{ordinal}")
            continue
        if wid in words_by_id:
            blockers.append(f"DUPLICATE_WORD_ID:{wid}")
            continue
        source_words[ordinal] = record
        word_shards[ordinal] = relpath(shard)
        words_by_id[wid] = ordinal

    store_rows_by_ordinal: dict[str, dict[int, list[tuple[Path, dict[str, Any], str | None]]]] = {}
    store_by_id: dict[str, dict[str, dict[str, Any]]] = {}
    for store in ("senses", "facts", "collocations", "relations", "exam-mappings", "packs"):
        by_ord: dict[int, list[tuple[Path, dict[str, Any], str | None]]] = defaultdict(list)
        by_id: dict[str, dict[str, Any]] = {}
        for shard, row in iter_store(store):
            record = row.get("record")
            if not isinstance(record, dict):
                continue
            ordinal = row.get("anchor_ordinal")
            rid = record_id(store, record)
            if isinstance(ordinal, int):
                by_ord[ordinal].append((shard, row, rid))
                if ordinal not in source_words:
                    warnings.append(f"REFERENCE_WITHOUT_WORD:{store}:o{ordinal:04d}:{rid or 'NO_ID'}")
            if rid:
                if rid in by_id and stable_json(by_id[rid]) != stable_json(record):
                    blockers.append(f"DUPLICATE_ID_PAYLOAD_MISMATCH:{store}:{rid}")
                else:
                    by_id[rid] = record
        store_rows_by_ordinal[store] = by_ord
        store_by_id[store] = by_id

    lookup_word_ids, lookup_by_word = collect_lookup_spelling()
    for wid in words_by_id:
        if wid not in lookup_word_ids:
            blockers.append(f"LOOKUP_MISSING_WORD:{wid}")

    canonical_manifest_path = CANON / "manifest.json"
    expected_count = None
    if canonical_manifest_path.exists():
        manifest = load_json(canonical_manifest_path)
        expected_count = manifest.get("stable_identity", {}).get("word_count")
        if isinstance(expected_count, int) and expected_count != len(source_words):
            blockers.append(f"WORD_COUNT_MISMATCH:{len(source_words)}!={expected_count}")

    relation_owners: dict[str, dict[str, Any]] = {}
    for rid, record in store_by_id["relations"].items():
        relation_owners[rid] = {
            "schema": "kianos.lexical.relation_owner.v1",
            "relation_id": rid,
            "canonical_record": copy.deepcopy(record),
            "fact_record": None,
            "word_views": [],
            "provenance": {"materialized_from": "content/lexical/canonical/relations/", "semantic_delta": 0},
        }

    natural_words: dict[int, dict[str, Any]] = {}
    for ordinal in sorted(source_words):
        src = source_words[ordinal]
        wid = src["word_id"]
        transformed = copy.deepcopy(src)
        relation_refs: list[dict[str, Any]] = []

        for field in ("semantic_neighbors", "confusables"):
            original_views = src.get(field, []) or []
            if not isinstance(original_views, list):
                blockers.append(f"RELATION_FIELD_NOT_ARRAY:{wid}:{field}")
                original_views = []
            transformed[field] = []
            for index, payload in enumerate(original_views):
                if not isinstance(payload, dict):
                    blockers.append(f"RELATION_VIEW_NOT_OBJECT:{wid}:{field}:{index}")
                    continue
                rid = relation_identity(payload, wid, field, index)
                owner = relation_owners.setdefault(rid, {
                    "schema": "kianos.lexical.relation_owner.v1",
                    "relation_id": rid,
                    "canonical_record": None,
                    "fact_record": None,
                    "word_views": [],
                    "provenance": {"materialized_from": "embedded_current_word_view", "semantic_delta": 0},
                })
                if owner.get("fact_record") is None and rid in store_by_id["facts"]:
                    owner["fact_record"] = copy.deepcopy(store_by_id["facts"][rid])
                owner["word_views"].append({
                    "source_word_id": wid,
                    "source_ordinal": ordinal,
                    "field": field,
                    "index": index,
                    "payload": copy.deepcopy(payload),
                })
                relation_refs.append({
                    "relation_id": rid,
                    "owner_path": relpath(relation_owner_path(rid)),
                    "field": field,
                    "index": index,
                })

        active_sense_ids = {
            sense.get("sense_id") for sense in src.get("senses", [])
            if isinstance(sense, dict) and isinstance(sense.get("sense_id"), str)
        }
        for sid in active_sense_ids:
            if sid not in store_by_id["senses"]:
                blockers.append(f"ACTIVE_SENSE_ID_NOT_IN_REGISTRY:{wid}:{sid}")

        active_collocation_ids: set[str] = set()
        for sense in src.get("senses", []):
            if not isinstance(sense, dict):
                continue
            for colloc in sense.get("collocations", []) or []:
                if not isinstance(colloc, dict):
                    continue
                cid = colloc.get("collocation_id")
                if isinstance(cid, str):
                    active_collocation_ids.add(cid)
                    if cid not in store_by_id["collocations"]:
                        blockers.append(f"COLLOCATION_ID_NOT_IN_REGISTRY:{wid}:{cid}")

        # Only deep:* facts belong to the shared deep-fact registry. Word-owned usage:/construction:
        # identities are valid local objects and must not be forced into that registry.
        for module in ("constructions", "secondary_senses", "word_family"):
            values = src.get(module, []) or []
            if not isinstance(values, list):
                blockers.append(f"WORD_MODULE_NOT_ARRAY:{wid}:{module}")
                continue
            for obj in values:
                if not isinstance(obj, dict):
                    continue
                fid = obj.get("fact_id")
                if isinstance(fid, str) and fid.startswith("deep:") and fid not in store_by_id["facts"]:
                    blockers.append(f"DEEP_FACT_ID_NOT_IN_REGISTRY:{wid}:{module}:{fid}")

        reference_senses: list[dict[str, Any]] = []
        sense_identity_refs: list[dict[str, Any]] = []
        for shard, row, sid in store_rows_by_ordinal["senses"].get(ordinal, []):
            record = row["record"]
            if sid:
                sense_identity_refs.append({
                    "sense_id": sid,
                    "status": record.get("status"),
                    "merged_into_sense_id": record.get("merged_into_sense_id"),
                    "source_row": row.get("source_row"),
                    "source_path": relpath(shard),
                })
            if sid and sid not in active_sense_ids:
                reference_senses.append({
                    "stable_sense_id": sid,
                    "status": record.get("status"),
                    "merged_into_sense_id": record.get("merged_into_sense_id"),
                    "pos": record.get("pos"),
                    "definition_cn": record.get("definition_cn"),
                    "definition_en": record.get("definition_en"),
                    "semantic_key": record.get("semantic_key"),
                    "semantic_key_history": record.get("semantic_key_history", []),
                    "legacy_aliases": record.get("legacy_aliases", []),
                    "legacy_alias_history": record.get("legacy_alias_history", []),
                    "updated_at": record.get("updated_at"),
                    "source_row": row.get("source_row"),
                    "source_path": relpath(shard),
                    "reference_only": True,
                })

        registry_refs: dict[str, list[dict[str, Any]]] = {}
        for store in ("facts", "collocations", "exam-mappings", "packs"):
            refs: list[dict[str, Any]] = []
            for shard, row, rid in store_rows_by_ordinal[store].get(ordinal, []):
                refs.append({"id": rid, "source_row": row.get("source_row"), "source_path": relpath(shard)})
            registry_refs[store] = refs

        natural_words[ordinal] = {
            "schema": "kianos.lexical.word_owner.v1",
            "ordinal": ordinal,
            "word_id": wid,
            "word": src.get("word"),
            "record": transformed,
            "relation_refs": sorted(relation_refs, key=lambda x: (x["field"], x["index"], x["relation_id"])),
            "reference_senses": reference_senses,
            "identity_refs": {
                "senses": sense_identity_refs,
                "active_collocations": sorted(active_collocation_ids),
                **registry_refs,
            },
            "lookup_refs": lookup_by_word.get(wid, []),
            "provenance": {
                "source_word_shard": word_shards[ordinal],
                "source_content_hash": src.get("content_hash"),
                "semantic_delta": 0,
                "materializer": "tools/lexical_natural_owner.py",
            },
        }

    relation_views_index: dict[tuple[str, str, int, str], dict[str, Any]] = {}
    for rid, owner in relation_owners.items():
        for view in owner["word_views"]:
            key = (view["source_word_id"], view["field"], view["index"], rid)
            if key in relation_views_index and stable_json(relation_views_index[key]) != stable_json(view["payload"]):
                blockers.append(f"RELATION_VIEW_DUPLICATE_MISMATCH:{rid}:{view['source_word_id']}:{view['field']}:{view['index']}")
            relation_views_index[key] = view["payload"]

    reconstruct_failures = 0
    for ordinal, natural in natural_words.items():
        reconstructed = copy.deepcopy(natural["record"])
        for field in ("semantic_neighbors", "confusables"):
            refs = sorted((r for r in natural["relation_refs"] if r["field"] == field), key=lambda r: r["index"])
            reconstructed[field] = []
            for ref in refs:
                key = (natural["word_id"], field, ref["index"], ref["relation_id"])
                payload = relation_views_index.get(key)
                if payload is None:
                    blockers.append(f"RELATION_VIEW_MISSING_FOR_RECONSTRUCTION:{natural['word_id']}:{field}:{ref['index']}")
                    continue
                reconstructed[field].append(copy.deepcopy(payload))
        if stable_json(reconstructed) != stable_json(source_words[ordinal]):
            reconstruct_failures += 1
            blockers.append(f"WORD_RECONSTRUCTION_MISMATCH:o{ordinal:04d}:{natural['word_id']}")

    report = {
        "schema": "kianos.lexical.natural_owner_cutover_audit.v1",
        "status": "PASS" if not blockers else "BLOCKED",
        "semantic_delta": 0 if reconstruct_failures == 0 else None,
        "source": {
            "canonical_manifest": relpath(canonical_manifest_path),
            "canonical_manifest_sha256": sha256_file(canonical_manifest_path) if canonical_manifest_path.exists() else None,
            "word_count_expected": expected_count,
            "word_count_read": len(source_words),
        },
        "materialized": {
            "word_owner_count": len(natural_words),
            "relation_owner_count": len(relation_owners),
            "word_reconstruction_failures": reconstruct_failures,
            "lookup_word_ids": len(lookup_word_ids),
        },
        "invariants": {
            "unique_word_ids": len(words_by_id) == len(source_words),
            "unique_ordinals": len(source_words) == len(set(source_words)),
            "exact_word_reconstruction": reconstruct_failures == 0,
            "semantic_delta_zero": reconstruct_failures == 0,
            "lookup_closure": all(wid in lookup_word_ids for wid in words_by_id),
        },
        "blockers": sorted(set(blockers)),
        "warnings": sorted(set(warnings)),
    }
    return natural_words, relation_owners, report


def materialize() -> int:
    natural_words, relation_owners, report = build()
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    dump_json(AUDIT_PATH, report)
    if report["status"] != "PASS":
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 2

    if WORDS_OUT.exists():
        shutil.rmtree(WORDS_OUT)
    if REL_OUT.exists():
        shutil.rmtree(REL_OUT)
    WORDS_OUT.mkdir(parents=True, exist_ok=True)
    REL_OUT.mkdir(parents=True, exist_ok=True)

    for ordinal, owner in natural_words.items():
        dump_json(WORDS_OUT / f"o{ordinal:04d}.json", owner)
    for rid, owner in relation_owners.items():
        dump_json(relation_owner_path(rid), owner)

    dump_json(WORD_MANIFEST, {
        "schema": "kianos.lexical.word_owner_manifest.v1",
        "status": "MATERIALIZED_NOT_CURRENT",
        "semantic_authority": False,
        "word_count": len(natural_words),
        "path_rule": "content/lexical/words/by-ordinal/o{ordinal:04d}.json",
        "audit": relpath(AUDIT_PATH),
        "semantic_delta": 0,
        "source": "content/lexical/canonical/words/",
    })
    dump_json(REL_MANIFEST, {
        "schema": "kianos.lexical.relation_owner_manifest.v1",
        "status": "MATERIALIZED_NOT_CURRENT",
        "semantic_authority": False,
        "relation_count": len(relation_owners),
        "path_rule": "content/lexical/relations/by-id/{sha256(relation_id)[0:2]}/{sha256(relation_id)}.json",
        "audit": relpath(AUDIT_PATH),
        "semantic_delta": 0,
        "source": ["content/lexical/canonical/relations/", "cross-word views extracted losslessly from Current Word bundles"],
    })
    dump_json(LEX_MANIFEST, {
        "schema": "kianos.lexical.current_manifest.v1",
        "status": "CUTOVER_CANDIDATE_NOT_CURRENT",
        "semantic_authority": False,
        "owner_contract": "content/lexical/schema.json",
        "word_manifest": relpath(WORD_MANIFEST),
        "relation_manifest": relpath(REL_MANIFEST),
        "lookup": "content/lexical/canonical/lookup/",
        "reference_stores": {
            "senses": "content/lexical/canonical/senses/",
            "facts": "content/lexical/canonical/facts/",
            "collocations": "content/lexical/canonical/collocations/",
            "exam_mappings": "content/lexical/canonical/exam-mappings/",
            "packs": "content/lexical/canonical/packs/",
        },
        "audit": relpath(AUDIT_PATH),
        "semantic_delta": 0,
    })
    dump_json(AUDIT_PATH, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def audit() -> int:
    _, _, report = build()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "PASS" else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="LexicalOS Natural Owner materializer/auditor")
    parser.add_argument("command", choices=("audit", "materialize"))
    args = parser.parse_args()
    return audit() if args.command == "audit" else materialize()


if __name__ == "__main__":
    raise SystemExit(main())
