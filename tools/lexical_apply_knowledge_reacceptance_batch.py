#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS = ROOT / "content" / "lexical" / "words" / "by-ordinal"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def apply_owner(spec: dict[str, Any]) -> dict[str, Any]:
    ordinal = int(spec["ordinal"])
    path = WORDS / f"o{ordinal:04d}.json"
    owner = load(path)
    if owner.get("word_id") != spec.get("word_id"):
        raise ValueError(f"WORD_ID_MISMATCH:o{ordinal:04d}:{owner.get('word_id')}!={spec.get('word_id')}")

    record = owner.get("record") or {}
    lifecycle: dict[str, dict[str, Any]] = spec.get("lifecycle") or {}
    active_senses = spec.get("active_senses") or []
    active_ids = {str(s["sense_id"]) for s in active_senses}

    # Fail closed: every payload ID must be explicitly Active in the batch lifecycle.
    for sid in active_ids:
        state = lifecycle.get(sid)
        if not state or state.get("status") != "active":
            raise ValueError(f"ACTIVE_PAYLOAD_WITHOUT_ACTIVE_LIFECYCLE:{spec['word_id']}:{sid}")

    # Current learner-facing semantic projection.
    record["senses"] = active_senses
    owner["record"] = record

    # Natural Owner owns word-local reference senses after cutover. Active senses
    # leave the reference-only surface; non-Active identities stay traceable.
    reference_rows = []
    seen_reference_ids: set[str] = set()
    for row in owner.get("reference_senses") or []:
        if not isinstance(row, dict):
            continue
        sid = str(row.get("stable_sense_id") or "")
        if not sid:
            continue
        if sid in active_ids:
            continue
        state = lifecycle.get(sid)
        if state:
            row = dict(row)
            row["status"] = state.get("status")
            row["merged_into_sense_id"] = state.get("merged_into_sense_id")
        row["reference_only"] = True
        reference_rows.append(row)
        seen_reference_ids.add(sid)
    owner["reference_senses"] = reference_rows

    # Identity refs are retained as the Natural Owner's lifecycle/readback index.
    identity = owner.setdefault("identity_refs", {})
    sense_rows = identity.get("senses") or []
    seen_identity_ids: set[str] = set()
    for row in sense_rows:
        if not isinstance(row, dict):
            continue
        sid = str(row.get("sense_id") or "")
        if not sid:
            continue
        seen_identity_ids.add(sid)
        state = lifecycle.get(sid)
        if state:
            row["status"] = state.get("status")
            row["merged_into_sense_id"] = state.get("merged_into_sense_id")

    missing_lifecycle = sorted(set(lifecycle) - seen_identity_ids)
    if missing_lifecycle:
        raise ValueError(f"LIFECYCLE_ID_NOT_IN_IDENTITY:{spec['word_id']}:{','.join(missing_lifecycle)}")

    active_collocations = sorted({
        str(c["collocation_id"])
        for sense in active_senses
        for c in (sense.get("collocations") or [])
        if isinstance(c, dict) and c.get("collocation_id")
    })
    identity["active_collocations"] = active_collocations

    provenance = owner.setdefault("provenance", {})
    provenance["semantic_delta"] = max(1, int(provenance.get("semantic_delta") or 0))

    dump(path, owner)
    return {
        "ordinal": ordinal,
        "word_id": owner.get("word_id"),
        "active_senses": sorted(active_ids),
        "active_collocations": active_collocations,
        "reference_senses": sorted(seen_reference_ids),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch")
    parser.add_argument("--report")
    args = parser.parse_args()

    batch = load(Path(args.batch))
    if batch.get("status") != "CHAT_REVIEWED_REPAIR_INPUT":
        raise SystemExit("BATCH_NOT_CHAT_REVIEWED_REPAIR_INPUT")

    results = [apply_owner(spec) for spec in batch.get("owners") or []]
    report = {
        "schema": "kianos.lexical.knowledge_reacceptance.apply_report.v1",
        "batch_id": batch.get("batch_id"),
        "owner_count": len(results),
        "results": results,
    }
    if args.report:
        dump(Path(args.report), report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
