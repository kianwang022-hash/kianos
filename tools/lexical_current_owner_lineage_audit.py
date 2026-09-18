#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
WORDS = LEX / "words" / "by-ordinal"
ACCEPTANCE = LEX / "ACCEPTANCE.md"
K_CONCLUSIONS = LEX / "acceptance" / "full-catalog-k-conclusions.json"
FRESH_BATCHES = LEX / "audit" / "fresh-rebuild" / "batches"
RECON = LEX / "semantic-reconciliation"

def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def existing_rel(path_value: Any) -> bool:
    return isinstance(path_value, str) and bool(path_value) and (ROOT / path_value).exists()

def parse_range(name: str):
    m = re.match(r"o(\d{4})-o(\d{4})\.md$", name)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2))

def collect_k_records(obj: Any, out: dict[int, list[dict[str, Any]]]) -> None:
    if isinstance(obj, list):
        for x in obj:
            collect_k_records(x, out)
        return
    if not isinstance(obj, dict):
        return
    ordinal = obj.get("ordinal")
    if isinstance(ordinal, int):
        out[ordinal].append(obj)
    for v in obj.values():
        if isinstance(v, (dict, list)):
            collect_k_records(v, out)

def terminal_strings(rows: list[dict[str, Any]]) -> list[str]:
    keys = (
        "quality", "conclusion", "classification", "status",
        "outcome", "final_outcome", "final_conclusion", "k_conclusion",
    )
    values = []
    for row in rows:
        for key in keys:
            value = row.get(key)
            if isinstance(value, str):
                values.append(value)
    return sorted(set(values))

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args()

    acceptance_text = ACCEPTANCE.read_text(encoding="utf-8")
    full_catalog_pass = "K  PASS — full catalog" in acceptance_text or "K — full-catalog PASS" in acceptance_text

    k_raw = load(K_CONCLUSIONS)
    k_records: dict[int, list[dict[str, Any]]] = defaultdict(list)
    collect_k_records(k_raw, k_records)

    recon_ranges = []
    for path in sorted(RECON.glob("o*.md")):
        parsed = parse_range(path.name)
        if parsed:
            text = path.read_text(encoding="utf-8")[:2500]
            recon_ranges.append({
                "start": parsed[0],
                "end": parsed[1],
                "path": path.relative_to(ROOT).as_posix(),
                "status_excerpt": next((line.strip() for line in text.splitlines() if line.startswith("Status:")), ""),
            })

    fresh_files = {p.relative_to(ROOT).as_posix() for p in FRESH_BATCHES.glob("*.json")}

    rows = []
    broken_authority = []
    missing_k = []
    broken_source = []
    category_counts = Counter()
    flag_counts = Counter()
    explicit_authority_counts = Counter()
    needs_delta_by_category = Counter()

    for path in sorted(WORDS.glob("o*.json")):
        owner = load(path)
        ordinal = int(owner.get("ordinal"))
        prov = owner.get("provenance") or {}
        record = owner.get("record") or {}

        fresh_authority = prov.get("fresh_rebuild_authority")
        corrective_authority = prov.get("corrective_authority")
        fresh_batch = prov.get("fresh_rebuild_batch")
        source_shard = prov.get("source_word_shard")

        fresh_pointer_ok = existing_rel(fresh_authority) if fresh_authority else None
        corrective_pointer_ok = existing_rel(corrective_authority) if corrective_authority else None
        source_pointer_ok = existing_rel(source_shard) if source_shard else False

        recon_hits = [r for r in recon_ranges if r["start"] <= ordinal <= r["end"]]
        k_hits = k_records.get(ordinal, [])
        k_terms = terminal_strings(k_hits)

        has_k_record = bool(k_hits)
        k_blocked = any("BLOCKED" in s.upper() for s in k_terms)
        k_safe = any(("SAFE_SIMPLE" in s.upper()) or ("DEPTH_READY" in s.upper()) for s in k_terms)
        k_accepted = full_catalog_pass and has_k_record and not k_blocked

        broken = []
        if fresh_authority and not fresh_pointer_ok:
            broken.append("fresh_rebuild_authority_missing")
        if corrective_authority and not corrective_pointer_ok:
            broken.append("corrective_authority_missing")
        if not source_pointer_ok:
            broken.append("source_word_shard_missing")
        if not has_k_record:
            broken.append("full_catalog_k_record_missing")

        if broken:
            category = "LINEAGE_INCOMPLETE"
        elif corrective_authority and corrective_pointer_ok:
            category = "CORRECTIVE_AFTER_FRESH"
        elif fresh_authority and fresh_pointer_ok:
            category = "FRESH_ACCEPTED"
        elif k_accepted and recon_hits:
            category = "K_ACCEPTED_RECONCILED"
        elif k_accepted:
            category = "K_ACCEPTED_LEGACY_PROVENANCE"
        else:
            category = "LINEAGE_INCOMPLETE"

        needs_delta = bool(record.get("needs_delta_review"))
        semantic_delta = int(prov.get("semantic_delta") or 0)

        flags = []
        if needs_delta:
            flags.append("needs_delta_review")
            flag_counts["needs_delta_review"] += 1
            needs_delta_by_category[category] += 1
        if semantic_delta > 0:
            flags.append("semantic_delta_positive")
            flag_counts["semantic_delta_positive"] += 1
        if fresh_batch:
            flags.append("fresh_rebuild_batch")
            flag_counts["fresh_rebuild_batch"] += 1
        if corrective_authority:
            flags.append("corrective_authority")
            flag_counts["corrective_authority"] += 1
        if recon_hits:
            flags.append("reconciliation_range")
            flag_counts["reconciliation_range"] += 1

        category_counts[category] += 1
        if fresh_authority:
            explicit_authority_counts["fresh_rebuild_authority_present"] += 1
        if corrective_authority:
            explicit_authority_counts["corrective_authority_present"] += 1

        if broken:
            broken_authority.append({
                "ordinal": ordinal,
                "word": owner.get("word"),
                "word_id": owner.get("word_id"),
                "broken": broken,
                "fresh_rebuild_batch": fresh_batch,
                "fresh_rebuild_authority": fresh_authority,
                "corrective_authority": corrective_authority,
                "source_word_shard": source_shard,
            })
        if not has_k_record:
            missing_k.append({"ordinal": ordinal, "word": owner.get("word"), "word_id": owner.get("word_id")})
        if not source_pointer_ok:
            broken_source.append({"ordinal": ordinal, "word": owner.get("word"), "source_word_shard": source_shard})

        rows.append({
            "ordinal": ordinal,
            "word": owner.get("word"),
            "word_id": owner.get("word_id"),
            "category": category,
            "needs_delta_review": needs_delta,
            "semantic_delta": semantic_delta,
            "fresh_rebuild_batch": fresh_batch,
            "fresh_rebuild_authority": fresh_authority,
            "fresh_pointer_ok": fresh_pointer_ok,
            "corrective_authority": corrective_authority,
            "corrective_pointer_ok": corrective_pointer_ok,
            "reconciliation_authorities": [r["path"] for r in recon_hits],
            "k_record_count": len(k_hits),
            "k_terminal_strings": k_terms,
            "k_accepted": k_accepted,
            "flags": flags,
        })

    report = {
        "schema": "kianos.lexical.current_owner_lineage_audit.v1",
        "principle": "Audit lineage only. Do not reinterpret accepted semantics from migration metadata.",
        "full_catalog_k_acceptance_claim_present": full_catalog_pass,
        "owner_count": len(rows),
        "k_record_ordinal_count": len(k_records),
        "reconciliation_range_count": len(recon_ranges),
        "fresh_batch_file_count": len(fresh_files),
        "category_counts": dict(sorted(category_counts.items())),
        "flag_counts": dict(sorted(flag_counts.items())),
        "explicit_authority_counts": dict(sorted(explicit_authority_counts.items())),
        "needs_delta_by_category": dict(sorted(needs_delta_by_category.items())),
        "broken_lineage_count": len(broken_authority),
        "missing_k_record_count": len(missing_k),
        "broken_source_pointer_count": len(broken_source),
        "reconciliation_ranges": recon_ranges,
        "broken_lineage": broken_authority,
        "owners": rows,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    summary = {
        k: report[k]
        for k in (
            "full_catalog_k_acceptance_claim_present",
            "owner_count",
            "k_record_ordinal_count",
            "reconciliation_range_count",
            "fresh_batch_file_count",
            "category_counts",
            "flag_counts",
            "explicit_authority_counts",
            "needs_delta_by_category",
            "broken_lineage_count",
            "missing_k_record_count",
            "broken_source_pointer_count",
        )
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
