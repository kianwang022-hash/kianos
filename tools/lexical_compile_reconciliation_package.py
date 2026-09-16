#!/usr/bin/env python3
"""Compile one bounded Lexical Sol-reconciliation package from accepted handoffs.

This is an accounting/transport compiler, not a semantic judge. It extracts the
already-frozen Production UPGRADE owners and Independent Audit terminal deltas,
then computes the exact semantic source-owner union, internal 50-owner receipt
counts, and out-of-package dependency candidates. Sol still resolves explicit
IDENTITY_RISK cases and decides which remote dependencies are actual writes.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERDICTS = {
    "FLIP_TO_UPGRADE",
    "FLIP_TO_NO_CHANGE",
    "REFINE_UPGRADE",
    "IDENTITY_RISK",
}


def read(path: str) -> str:
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f"MISSING_SOURCE {path}")
    return p.read_text(encoding="utf-8")


def production_upgrades(text: str, start: int, end: int) -> set[int]:
    # Production handoffs encode each UPGRADE as a detailed owner bullet:
    #   - o4880 **taboo**
    # Compact NO_CHANGE ordinal lists therefore do not match this pattern.
    out: set[int] = set()
    for m in re.finditer(r"(?m)^-\s+o(\d{4})\s+\*\*", text):
        o = int(m.group(1))
        if start <= o <= end:
            out.add(o)
    return out


def audit_verdicts(text: str, start: int, end: int) -> dict[int, str]:
    out: dict[int, str] = {}

    # Older packs: - `o4986 think` — `IDENTITY_RISK` — ...
    inline = re.compile(
        r"(?m)^-\s+`?o(\d{4})\b[^\n]*?`"
        r"(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)`"
    )
    for m in inline.finditer(text):
        o = int(m.group(1))
        if start <= o <= end:
            out[o] = m.group(2)

    # Newer packs: ### o5226 — upward ... audit verdict: FLIP_TO_UPGRADE
    heading = re.compile(
        r"(?ms)^###\s+o(\d{4})\b.*?(?=^###\s+o\d{4}\b|^##\s+|\Z)"
    )
    for hm in heading.finditer(text):
        o = int(hm.group(1))
        if not (start <= o <= end):
            continue
        vm = re.search(
            r"audit verdict:\s*(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)",
            hm.group(0),
        )
        if vm:
            out[o] = vm.group(1)
    return out


def remote_candidates(text: str, start: int, end: int) -> set[int]:
    out: set[int] = set()
    for line in text.splitlines():
        if "out-of-scope dependent owners:" not in line:
            continue
        for m in re.finditer(r"@o(\d{4})", line):
            o = int(m.group(1))
            if not (start <= o <= end):
                out.add(o)
    return out


def receipt_counts(start: int, end: int, source_set: set[int]) -> list[dict[str, int]]:
    out: list[dict[str, int]] = []
    lo = start
    while lo <= end:
        hi = min(lo + 49, end)
        out.append(
            {
                "start": lo,
                "end": hi,
                "source_count": sum(lo <= x <= hi for x in source_set),
            }
        )
        lo = hi + 1
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, required=True)
    ap.add_argument("--end", type=int, required=True)
    ap.add_argument("--production", action="append", required=True)
    ap.add_argument("--audit", action="append", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    if args.end < args.start:
        raise SystemExit("INVALID_RANGE")
    if args.end - args.start + 1 != 500:
        raise SystemExit("PACKAGE_SIZE_MUST_BE_500")

    production: set[int] = set()
    production_by_file: dict[str, list[int]] = {}
    for path in args.production:
        vals = production_upgrades(read(path), args.start, args.end)
        production_by_file[path] = sorted(vals)
        production |= vals

    verdict_by_owner: dict[int, str] = {}
    verdict_sources: dict[int, list[str]] = {}
    remote: set[int] = set()
    for path in args.audit:
        text = read(path)
        remote |= remote_candidates(text, args.start, args.end)
        for o, verdict in audit_verdicts(text, args.start, args.end).items():
            prior = verdict_by_owner.get(o)
            if prior and prior != verdict:
                raise SystemExit(
                    f"CONFLICTING_AUDIT_VERDICT o{o:04d} {prior} {verdict}"
                )
            verdict_by_owner[o] = verdict
            verdict_sources.setdefault(o, []).append(path)

    source = set(production)
    flipped_no_change: set[int] = set()
    for o, verdict in verdict_by_owner.items():
        if verdict == "FLIP_TO_NO_CHANGE":
            source.discard(o)
            flipped_no_change.add(o)
        else:
            source.add(o)

    audit_additions = {
        o
        for o, verdict in verdict_by_owner.items()
        if verdict in {"FLIP_TO_UPGRADE", "IDENTITY_RISK"} and o not in production
    }
    refinements = {
        o for o, verdict in verdict_by_owner.items() if verdict == "REFINE_UPGRADE"
    }
    identity_risks = {
        o for o, verdict in verdict_by_owner.items() if verdict == "IDENTITY_RISK"
    }

    payload = {
        "schema": "kianos.lexical.reconciliation_compile.v1",
        "package": {
            "start": args.start,
            "end": args.end,
            "owner_count": args.end - args.start + 1,
        },
        "production_sources": args.production,
        "production_upgrade_count": len(production),
        "production_upgrade_owners": sorted(production),
        "production_upgrades_by_file": production_by_file,
        "audit_sources": args.audit,
        "audit_verdict_counts": dict(
            sorted(Counter(verdict_by_owner.values()).items())
        ),
        "audit_verdicts": {
            f"o{o:04d}": verdict_by_owner[o] for o in sorted(verdict_by_owner)
        },
        "audit_verdict_sources": {
            f"o{o:04d}": verdict_sources[o] for o in sorted(verdict_sources)
        },
        "audit_flip_to_no_change": sorted(flipped_no_change),
        "audit_additions_beyond_production": sorted(audit_additions),
        "audit_refinements": sorted(refinements),
        "identity_risks": sorted(identity_risks),
        "semantic_source_owner_count": len(source),
        "semantic_source_owners": sorted(source),
        "receipt_counts": receipt_counts(args.start, args.end, source),
        "remote_dependency_candidates": sorted(remote),
        "status": "COMPILED_FOR_SOL_RECONCILIATION",
    }

    out = ROOT / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("RECONCILIATION_COMPILE_PASS")
    print("package", args.start, args.end)
    print("production_upgrades", len(production))
    print(
        "audit_verdicts",
        dict(sorted(Counter(verdict_by_owner.values()).items())),
    )
    print("semantic_source_union", len(source))
    print(
        "identity_risks",
        ",".join(f"o{x:04d}" for x in sorted(identity_risks)) or "NONE",
    )
    print(
        "remote_candidates",
        ",".join(f"o{x:04d}" for x in sorted(remote)) or "NONE",
    )
    print("receipt_counts", [x["source_count"] for x in payload["receipt_counts"]])


if __name__ == "__main__":
    main()
