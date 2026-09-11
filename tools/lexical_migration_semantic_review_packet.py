#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS_DIR = (ROOT / "content" / "lexical" / "words" / "by-ordinal").resolve()
REVIEW_PREFIXES = ("P0_", "P1_")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def is_review_priority(priority: Any) -> bool:
    return isinstance(priority, str) and priority.startswith(REVIEW_PREFIXES)


def compact_target(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "target_id": row.get("target_id"),
        "approved_target": row.get("approved_target"),
        "mechanical_label": row.get("mechanical_label"),
        "review_priority": row.get("review_priority"),
        "health_flags": row.get("health_flags") or [],
        "candidate_surfaces": row.get("candidate_surfaces") or [],
        "probe_results": row.get("probe_results") or [],
    }


def resolve_owner_path(row: dict[str, Any]) -> Path:
    health = row.get("owner_health") or {}
    rel = health.get("path")
    if not isinstance(rel, str) or not rel:
        raise RuntimeError(f"target {row.get('target_id')} lacks owner_health.path")
    path = (ROOT / rel).resolve()
    if path.parent != WORDS_DIR:
        raise RuntimeError(f"owner path outside canonical by-ordinal directory: {rel}")
    if not path.is_file():
        raise RuntimeError(f"owner file missing: {rel}")
    return path


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Build one bulk semantic-review packet for P0/P1 migration anomalies."
    )
    ap.add_argument("readback_json", type=Path)
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args()

    readback = load_json(args.readback_json)
    target_rows = [
        row for row in (readback.get("targets") or []) if is_review_priority(row.get("review_priority"))
    ]

    grouped: dict[str, dict[str, Any]] = {}
    priority_counts: dict[str, int] = {}
    for row in target_rows:
        wid = row.get("word_id")
        ordinal = row.get("ordinal")
        if not isinstance(wid, str) or not isinstance(ordinal, int):
            raise RuntimeError(f"invalid target owner identity: {row.get('target_id')}")
        priority = row.get("review_priority")
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

        if wid not in grouped:
            path = resolve_owner_path(row)
            owner = load_json(path)
            owner_wid = owner.get("word_id") or (owner.get("record") or {}).get("word_id")
            if owner_wid != wid or owner.get("ordinal") != ordinal:
                raise RuntimeError(
                    f"owner identity mismatch for {wid}: file has {owner_wid}/{owner.get('ordinal')}"
                )
            grouped[wid] = {
                "word_id": wid,
                "ordinal": ordinal,
                "path": str(path.relative_to(ROOT)),
                "targets": [],
                "owner": owner,
            }
        grouped[wid]["targets"].append(compact_target(row))

    packets = sorted(grouped.values(), key=lambda p: (p["ordinal"], p["word_id"]))
    report = {
        "schema": "kianos.lexical.migration_integrity.semantic_review_packet.v1",
        "audit_id": readback.get("audit_id"),
        "source_readback_schema": readback.get("schema"),
        "semantic_mutation_performed": False,
        "learner_state_mutation_performed": False,
        "mechanical_semantic_judgment_performed": False,
        "review_priority_prefixes": list(REVIEW_PREFIXES),
        "review_target_count": len(target_rows),
        "review_owner_count": len(packets),
        "review_priority_counts": dict(sorted(priority_counts.items())),
        "packets": packets,
        "interpretation_rule": (
            "This packet is read-only evidence for Chat semantic review. It bundles canonical "
            "Natural Owners for P0/P1 anomalies so review can be performed in one bulk pass; "
            "it does not approve, classify, or mutate semantic content."
        ),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"REVIEW_PACKET_PASS targets={len(target_rows)} owners={len(packets)}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
