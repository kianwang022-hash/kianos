#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

import lexical_historical_round_bulk_triage as triage


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
    sys.argv = [sys.argv[0], *sys.argv[2:]]
    return triage.main()


if __name__ == "__main__":
    raise SystemExit(main())
