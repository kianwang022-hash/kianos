#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Any

import lexical_historical_round_bulk_triage as triage


def parse_core_compatible(body: str) -> list[dict[str, Any]]:
    lines = triage.section_lines(body, "### Core Gate", ("All other ordinals", "### Expansion Gate"))
    numbered = re.compile(r"^\s*(\d+)\.\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$")
    bulleted = re.compile(r"^\s*-\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$")
    rows: list[dict[str, Any]] = []
    for line in lines:
        stripped = line.strip()
        m = numbered.match(stripped)
        if m:
            rows.append({
                "index": int(m.group(1)),
                "ordinal": int(m.group(2)),
                "word_id": m.group(3),
                "approved_revision": m.group(4).strip(),
            })
            continue
        m = bulleted.match(stripped)
        if m:
            rows.append({
                "index": len(rows) + 1,
                "ordinal": int(m.group(1)),
                "word_id": m.group(2),
                "approved_revision": m.group(3).strip(),
            })
    return rows


def contrast_terms_compatible(text: str) -> list[str]:
    codes = [triage.normalize(c) for c in re.findall(r"`([^`]+)`", text) if triage.normalize(c)]
    if len(codes) >= 2:
        return list(dict.fromkeys(codes))
    if not codes:
        return []
    expr = codes[0]
    if "/" in expr:
        parts = [triage.normalize(p) for p in expr.split("/") if triage.normalize(p)]
        if len(parts) >= 2:
            return list(dict.fromkeys(parts))
    if " vs " in expr.lower():
        return [triage.normalize(p) for p in re.split(r"\s+vs\s+", expr, flags=re.I) if p.strip()]
    return [expr]


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("usage: lexical_historical_round_from_file.py AUTHORITY_FILE [bulk-triage args...]")
    authority_path = Path(sys.argv[1])
    body = authority_path.read_text(encoding="utf-8")

    def frozen_fetch_comment(repo: str, comment_id: int):
        return {
            "body": body,
            "html_url": f"frozen-authority:{authority_path.as_posix()}",
            "source_repo": repo,
            "source_comment_id": comment_id,
        }

    triage.fetch_comment = frozen_fetch_comment
    triage.parse_core = parse_core_compatible
    triage.contrast_terms = contrast_terms_compatible
    sys.argv = [sys.argv[0], *sys.argv[2:]]
    return triage.main()


if __name__ == "__main__":
    raise SystemExit(main())
