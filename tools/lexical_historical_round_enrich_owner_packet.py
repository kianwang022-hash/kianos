#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import lexical_historical_round_bulk_triage as triage


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    report = json.loads(Path(args.input).read_text(encoding="utf-8"))
    range_obj = report.get("range") or {}
    start = int(range_obj["start_ordinal"])
    end = int(range_obj["end_ordinal"])
    by_ord, _by_word, _by_id = triage.load_range_owners(start, end)

    for row in report.get("expansion") or []:
        enriched = []
        for candidate in row.get("owner_candidates") or []:
            owner = by_ord.get(candidate.get("ordinal"))
            enriched.append({**candidate, "owner_projection": triage.compact_owner(owner)})
        row["owner_candidates"] = enriched

    report["expansion_owner_projection_enriched"] = True
    report["enrichment_rule"] = (
        "Expansion candidates carry the same compact Current owner projection as Core so Chat can distinguish "
        "semantic-family presence from construction/presentation absence. Enrichment is evidence readback only; "
        "semantic and learner-state mutation remain zero."
    )

    Path(args.output).write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
