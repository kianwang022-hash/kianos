#!/usr/bin/env python3
"""Scan a compiled Lexical execution sheet for every explicit remote @oNNNN reference.

This closes a blind spot in older reconciliation accounting, which only consumed
Audit's dedicated `out-of-scope dependent owners` field.  Accepted owner directives
may also name remote Word anchors inline (for example `boot@o0542`).  The scanner
is read-only and does not decide whether a reference requires a Word write; it
makes the complete candidate set visible before execution authority is compiled.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEADING = re.compile(r"^## o(\d{4}) — (.+)$")
REMOTE = re.compile(r"@o(\d{4})\b")


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", required=True)
    ap.add_argument("--start", type=int, required=True)
    ap.add_argument("--end", type=int, required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    text = (ROOT / args.sheet).read_text(encoding="utf-8")
    refs: dict[int, list[dict[str, object]]] = defaultdict(list)
    current_ordinal: int | None = None
    current_word: str | None = None

    for raw in text.splitlines():
        hm = HEADING.match(raw)
        if hm:
            current_ordinal = int(hm.group(1))
            current_word = hm.group(2).strip()
            continue
        if current_ordinal is None:
            continue
        if not raw.startswith(("PRODUCTION: ", "AUDIT: ", "RECONCILIATION: ")):
            continue
        channel, body = raw.split(": ", 1)
        for rm in REMOTE.finditer(body):
            target = int(rm.group(1))
            if args.start <= target <= args.end:
                continue
            item = {
                "source_ordinal": current_ordinal,
                "source_word": current_word,
                "channel": channel,
                "context": clean(body[max(0, rm.start()-140):rm.end()+180]),
            }
            if item not in refs[target]:
                refs[target].append(item)

    payload = {
        "schema": "kianos.lexical.remote_reference_scan.v1",
        "package": [args.start, args.end],
        "remote_reference_count": len(refs),
        "remote_ordinals": sorted(refs),
        "references": {f"o{o:04d}": refs[o] for o in sorted(refs)},
        "status": "READ_ONLY_REMOTE_CANDIDATES",
    }
    out = ROOT / args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("REMOTE_REFERENCE_SCAN_PASS", sorted(refs))


if __name__ == "__main__":
    main()
