#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS = ROOT / "content" / "lexical" / "words" / "by-ordinal"
COLL_SHARDS = ROOT / "content" / "lexical" / "canonical" / "collocations" / "shards"

def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", type=Path, required=True)
    args = ap.parse_args()

    identities: dict[str, dict[str, Any]] = {}
    for path in sorted(COLL_SHARDS.glob("*.json")):
        for row in load(path):
            rec = row.get("record") or {}
            cid = rec.get("collocation_id")
            if cid:
                identities[str(cid)] = rec

    changed = []
    skipped = []

    for path in sorted(WORDS.glob("o*.json")):
        owner = load(path)
        record = owner.get("record") or {}
        senses = [s for s in (record.get("senses") or []) if isinstance(s, dict)]
        sense_by_id = {str(s.get("sense_id")): s for s in senses if s.get("sense_id")}
        current_collocation_ids = {
            str(c.get("collocation_id"))
            for s in senses
            for c in (s.get("collocations") or [])
            if isinstance(c, dict) and c.get("collocation_id")
        }

        constructions = record.get("constructions") or []
        keep = []
        owner_changes = []

        for index, con in enumerate(constructions):
            if not isinstance(con, dict):
                keep.append(con)
                continue

            pm = con.get("presentation_merge")
            survivor = str((pm or {}).get("surviving_object_id") or "")
            if not survivor.startswith("collocation:"):
                keep.append(con)
                continue
            if survivor in current_collocation_ids:
                keep.append(con)
                continue

            ident = identities.get(survivor)
            if not ident:
                keep.append(con)
                skipped.append({
                    "ordinal": owner.get("ordinal"),
                    "word": owner.get("word"),
                    "construction_id": con.get("construction_id") or con.get("fact_id"),
                    "survivor": survivor,
                    "reason": "SURVIVOR_IDENTITY_MISSING",
                })
                continue

            if str(ident.get("status") or "").lower() != "active":
                keep.append(con)
                skipped.append({
                    "ordinal": owner.get("ordinal"),
                    "word": owner.get("word"),
                    "construction_id": con.get("construction_id") or con.get("fact_id"),
                    "survivor": survivor,
                    "reason": f"SURVIVOR_NOT_ACTIVE:{ident.get('status')}",
                })
                continue

            target_sid = str(ident.get("sense_id") or "")
            target = sense_by_id.get(target_sid)
            if target is None:
                keep.append(con)
                skipped.append({
                    "ordinal": owner.get("ordinal"),
                    "word": owner.get("word"),
                    "construction_id": con.get("construction_id") or con.get("fact_id"),
                    "survivor": survivor,
                    "reason": f"TARGET_ACTIVE_SENSE_MISSING:{target_sid}",
                })
                continue

            phrase = str(con.get("pattern") or con.get("boundary") or con.get("label_en") or "").strip()
            meaning_cn = str(con.get("meaning_cn") or con.get("definition_cn") or "").strip()
            if not phrase or not meaning_cn:
                keep.append(con)
                skipped.append({
                    "ordinal": owner.get("ordinal"),
                    "word": owner.get("word"),
                    "construction_id": con.get("construction_id") or con.get("fact_id"),
                    "survivor": survivor,
                    "reason": "CONSTRUCTION_PAYLOAD_INSUFFICIENT",
                })
                continue

            collocation = {
                "collocation_id": survivor,
                "exam_value": "fixed_pattern",
                "legacy_source_object_ids": list(ident.get("legacy_source_object_ids") or []),
                "meaning_cn": meaning_cn,
                "phrase": phrase,
            }
            target.setdefault("collocations", []).append(collocation)
            current_collocation_ids.add(survivor)
            owner_changes.append({
                "construction_index": index,
                "construction_id": con.get("construction_id") or con.get("fact_id"),
                "surviving_object_id": survivor,
                "target_sense_id": target_sid,
                "materialized_collocation": collocation,
            })
            # Explicit MERGE_PRESENTATION contract: survivor now owns learner-facing display.
            # Do not retain the merged Construction in the final learner object.

        if owner_changes:
            record["constructions"] = [
                con for idx, con in enumerate(constructions)
                if not any(change["construction_index"] == idx for change in owner_changes)
            ]
            owner["record"] = record
            owner.setdefault("provenance", {})["semantic_delta"] = max(
                1, int((owner.get("provenance") or {}).get("semantic_delta") or 0)
            )
            dump(path, owner)
            changed.append({
                "ordinal": owner.get("ordinal"),
                "word": owner.get("word"),
                "word_id": owner.get("word_id"),
                "path": path.relative_to(ROOT).as_posix(),
                "changes": owner_changes,
            })

    report = {
        "schema": "kianos.lexical.active_merge_survivor_materialization.v1",
        "changed_word_count": len(changed),
        "materialized_survivor_count": sum(len(x["changes"]) for x in changed),
        "skipped_count": len(skipped),
        "changed": changed,
        "skipped": skipped,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    dump(args.report, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
