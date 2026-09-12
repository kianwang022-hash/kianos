#!/usr/bin/env python3
from __future__ import annotations

import re
import sys

import lexical_historical_round_bulk_triage as triage


def normalize_core_bullets(body: str) -> str:
    lines = body.splitlines()
    in_core = False
    n = 0
    out: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("### Core Gate"):
            in_core = True
            out.append(line)
            continue
        if in_core and (stripped.startswith("All other ordinals") or stripped.startswith("### Expansion Gate")):
            in_core = False
        if in_core:
            m = re.match(r"^\s*-\s+(`\d+\s+word:[^`]+`\s+—\s+.+)$", line)
            if m:
                n += 1
                out.append(f"{n}. {m.group(1)}")
                continue
        out.append(line)
    return "\n".join(out)


def main() -> int:
    original_fetch = triage.fetch_comment

    def compat_fetch(repo: str, comment_id: int):
        obj = original_fetch(repo, comment_id)
        obj["body"] = normalize_core_bullets(obj.get("body") or "")
        return obj

    triage.fetch_comment = compat_fetch
    return triage.main()


if __name__ == "__main__":
    raise SystemExit(main())
