#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

import lexical_fresh_rebuild_apply as base

ROOT = base.ROOT
WORDS = base.WORDS
BATCHES = ROOT / "content" / "lexical" / "audit" / "fresh-rebuild" / "batches"


def owner_path(ordinal: int) -> Path:
    return WORDS / f"o{ordinal:04d}.json"


def load_batch_spec(path: Path) -> dict[str, Any]:
    batch = base.load(path)
    part_names = batch.get("parts") or []
    if not part_names:
        return batch

    owners: list[dict[str, Any]] = []
    relations: list[dict[str, Any]] = []
    for name in part_names:
        part_path = path.parent / str(name)
        part = base.load(part_path)
        if part.get("batch_id") != batch.get("batch_id"):
            raise ValueError(f"BATCH_PART_ID_MISMATCH:{part_path.name}")
        owners.extend(part.get("owners") or [])
        relations.extend(part.get("relations") or [])

    batch["owners"] = owners
    if relations:
        batch["relations"] = relations
    return batch


def planned_sense_ids(spec: dict[str, Any]) -> list[str]:
    return [
        str(row.get("sense_id"))
        for row in (spec.get("sense_plan") or [])
        if isinstance(row, dict) and row.get("sense_id")
    ]


def validate_batch_identity(batch: dict[str, Any]) -> None:
    owners = batch.get("owners") or []
    ordinals = [int(row["ordinal"]) for row in owners]
    word_ids = [str(row["word_id"]) for row in owners]
    if len(ordinals) != len(set(ordinals)):
        raise ValueError("DUPLICATE_ORDINAL_WITHIN_BATCH")
    if len(word_ids) != len(set(word_ids)):
        raise ValueError("DUPLICATE_WORD_ID_WITHIN_BATCH")

    coverage = batch.get("coverage") or {}
    if coverage:
        if int(coverage.get("owner_count", len(owners))) != len(owners):
            raise ValueError("COVERAGE_OWNER_COUNT_MISMATCH")
        if coverage.get("contiguous"):
            expected = list(range(int(coverage["ordinal_start"]), int(coverage["ordinal_end"]) + 1))
            if ordinals != expected:
                raise ValueError(f"CONTIGUOUS_COVERAGE_MISMATCH:{ordinals}!={expected}")

    batch_id = str(batch.get("batch_id") or "")
    for receipt_path in BATCHES.glob("*-receipt.json"):
        receipt = base.load(receipt_path)
        if receipt.get("batch_id") == batch_id:
            continue
        prior = {
            int(row["ordinal"])
            for row in (receipt.get("owners") or [])
            if isinstance(row, dict) and row.get("ordinal") is not None
        }
        overlap = sorted(set(ordinals) & prior)
        if overlap:
            raise ValueError(
                f"ACCEPTANCE_GENERATION_ORDINAL_OVERLAP:{receipt_path.name}:"
                + ",".join(f"o{x:04d}" for x in overlap)
            )


def validate_current_owner(
    owner: dict[str, Any],
    spec: dict[str, Any],
    disposition: str,
) -> dict[str, Any]:
    record = owner.get("record") or {}
    senses = record.get("senses") or []
    active_ids = [
        str(row.get("sense_id"))
        for row in senses
        if isinstance(row, dict) and row.get("sense_id")
    ]
    identity = base.identity_sense_map(owner)
    refs = base.reference_sense_map(owner)
    errors: list[str] = []

    if owner.get("word_id") != spec.get("word_id") or owner.get("ordinal") != spec.get("ordinal"):
        errors.append("OWNER_IDENTITY_MISMATCH")
    if not active_ids:
        errors.append("ACTIVE_ZERO")
    if len(active_ids) != len(senses) or len(active_ids) != len(set(active_ids)):
        errors.append("ACTIVE_SENSE_DUPLICATE_OR_MISSING_ID")

    for sid in active_ids:
        if identity.get(sid, {}).get("status") != "active":
            errors.append(f"ACTIVE_IDENTITY_NOT_ACTIVE:{sid}")
        if sid in refs:
            errors.append(f"ACTIVE_SENSE_STILL_REFERENCE_ONLY:{sid}")

    cluster_ids = {
        str(sid)
        for cluster in (record.get("core_concept") or {}).get("core_clusters") or []
        for sid in (cluster.get("sense_ids") or [])
    }
    missing_cluster = sorted(cluster_ids - set(active_ids))
    if missing_cluster:
        errors.append("CORE_CLUSTER_POINTS_TO_NONACTIVE:" + ",".join(missing_cluster))

    construction_ids = [
        str(row.get("construction_id"))
        for row in (record.get("constructions") or [])
        if isinstance(row, dict) and row.get("construction_id")
    ]
    if len(construction_ids) != len(set(construction_ids)):
        errors.append("DUPLICATE_CONSTRUCTION_ID")

    if disposition == "FRESH_PASS_NO_CHANGE" and record.get("needs_delta_review") is True:
        errors.append("FRESH_PASS_NEEDS_DELTA_REVIEW")

    if errors:
        raise ValueError(
            f"FRESH_REBUILD_OWNER_INVALID:{spec.get('word_id')}:" + "|".join(errors)
        )

    return {
        "ordinal": owner.get("ordinal"),
        "word_id": owner.get("word_id"),
        "active_sense_ids": active_ids,
        "reference_sense_count": len(refs),
        "construction_count": len(record.get("constructions") or []),
        "sentinels_resolved": spec.get("sentinels") or [],
        "disposition": disposition,
        "complexity": spec.get("complexity"),
        "reason": spec.get("reason"),
        "material_changes": spec.get("material_changes") or [],
        "path": owner_path(int(spec["ordinal"])).relative_to(ROOT).as_posix(),
    }


def apply_or_accept_owner(
    spec: dict[str, Any],
    batch_id: str,
    batch_path: str,
) -> dict[str, Any]:
    disposition = spec.get("disposition")
    if disposition == "FRESH_UPGRADED":
        row = base.apply_owner(spec, batch_id, batch_path)
        row["complexity"] = spec.get("complexity")
        row["reason"] = spec.get("reason")
        row["material_changes"] = spec.get("material_changes") or []
        return row
    if disposition == "FRESH_PASS_NO_CHANGE":
        path = owner_path(int(spec["ordinal"]))
        return validate_current_owner(base.load(path), spec, disposition)
    raise ValueError(f"UNSUPPORTED_WORD_DISPOSITION:{spec.get('word_id')}:{disposition}")


def verify_accepted_owner(
    spec: dict[str, Any],
    batch_id: str,
) -> dict[str, Any]:
    path = owner_path(int(spec["ordinal"]))
    owner = base.load(path)
    disposition = spec.get("disposition")

    if disposition == "FRESH_PASS_NO_CHANGE":
        return validate_current_owner(owner, spec, disposition)

    if disposition != "FRESH_UPGRADED":
        raise ValueError(f"UNSUPPORTED_WORD_DISPOSITION:{spec.get('word_id')}:{disposition}")

    row = base.validate_owner(owner, spec)
    record = owner.get("record") or {}
    errors: list[str] = []

    expected_ids = planned_sense_ids(spec)
    actual_ids = [
        str(s.get("sense_id"))
        for s in (record.get("senses") or [])
        if isinstance(s, dict) and s.get("sense_id")
    ]
    if actual_ids != expected_ids:
        errors.append(f"ACCEPTED_SENSE_PLAN_DRIFT:{actual_ids}!={expected_ids}")

    if record.get("core_concept") != spec.get("core_concept"):
        errors.append("ACCEPTED_CORE_CONCEPT_DRIFT")

    if "constructions" in spec and record.get("constructions") != (spec.get("constructions") or []):
        errors.append("ACCEPTED_CONSTRUCTIONS_DRIFT")

    provenance = owner.get("provenance") or {}
    if provenance.get("fresh_rebuild_batch") != batch_id:
        errors.append(
            f"ACCEPTED_BATCH_PROVENANCE_DRIFT:{provenance.get('fresh_rebuild_batch')}!={batch_id}"
        )
    if record.get("needs_delta_review") is not False:
        errors.append("ACCEPTED_NEEDS_DELTA_REVIEW_NOT_CLOSED")

    if errors:
        raise ValueError(
            f"FRESH_REBUILD_ACCEPTED_DRIFT:{spec.get('word_id')}:" + "|".join(errors)
        )

    row["path"] = path.relative_to(ROOT).as_posix()
    row["complexity"] = spec.get("complexity")
    row["reason"] = spec.get("reason")
    row["material_changes"] = spec.get("material_changes") or []
    return row


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch")
    parser.add_argument("--report", required=True)
    parser.add_argument("--verify-accepted", action="store_true")
    args = parser.parse_args()

    batch_path = Path(args.batch)
    batch = load_batch_spec(batch_path)
    if batch.get("status") != "CHAT_REVIEWED_FRESH_REBUILD_INPUT":
        raise SystemExit("BATCH_NOT_CHAT_REVIEWED_FRESH_REBUILD_INPUT")
    if batch.get("legacy_semantic_authority") is not False:
        raise SystemExit("LEGACY_AUTHORITY_MUST_BE_FALSE")

    validate_batch_identity(batch)
    rel_batch_path = batch_path.relative_to(ROOT).as_posix()
    batch_id = str(batch["batch_id"])

    if args.verify_accepted:
        owners = [verify_accepted_owner(spec, batch_id) for spec in (batch.get("owners") or [])]
    else:
        owners = [
            apply_or_accept_owner(spec, batch_id, rel_batch_path)
            for spec in (batch.get("owners") or [])
        ]

    relations = base.validate_relations(batch)
    counts = Counter(str(row.get("disposition")) for row in owners)
    complexity = Counter(str(row.get("complexity") or "unspecified") for row in owners)

    report = {
        "schema": "kianos.lexical.fresh_rebuild_batch_report.v2",
        "batch_id": batch_id,
        "mode": "VERIFY_ACCEPTED" if args.verify_accepted else "APPLY_CANDIDATE",
        "status": "PASS",
        "legacy_semantic_authority": False,
        "owner_count": len(owners),
        "upgraded_count": counts.get("FRESH_UPGRADED", 0),
        "pass_count": counts.get("FRESH_PASS_NO_CHANGE", 0),
        "reference_only_count": counts.get("REFERENCE_ONLY_ACCEPTED", 0),
        "blocked_count": counts.get("BLOCKED", 0),
        "relation_count": len(relations),
        "learner_state_mutation": 0,
        "complexity_split": dict(sorted(complexity.items())),
        "owners": owners,
        "relations": relations,
    }
    base.dump(Path(args.report), report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
