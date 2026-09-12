#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path


def fetch_comment(repo: str, comment_id: int) -> dict:
    url = f"https://api.github.com/repos/{repo}/issues/comments/{comment_id}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "kianos-lexical-historical-authority-lock",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("usage: lexical_historical_round_from_lock.py LOCK_JSON [bulk-triage args...]")

    lock_path = Path(sys.argv[1])
    lock = json.loads(lock_path.read_text(encoding="utf-8"))
    if lock.get("schema") != "kianos.lexical.historical_authority_lock.v1":
        raise RuntimeError(f"unsupported authority lock schema: {lock.get('schema')}")

    repo = str(lock["legacy_repo"])
    comment_id = int(lock["comment_id"])
    expected_updated_at = str(lock["expected_updated_at"])
    comment = fetch_comment(repo, comment_id)

    if int(comment.get("id") or 0) != comment_id:
        raise RuntimeError("historical comment id mismatch")
    if comment.get("updated_at") != expected_updated_at:
        raise RuntimeError(
            f"historical authority changed: expected updated_at={expected_updated_at}, got {comment.get('updated_at')}"
        )
    body = comment.get("body")
    if not isinstance(body, str) or not body.strip():
        raise RuntimeError("historical authority body missing")

    expected_range = lock.get("range")
    if expected_range and len(expected_range) == 2:
        marker = f"{expected_range[0]}–{expected_range[1]}"
        ascii_marker = f"{expected_range[0]}-{expected_range[1]}"
        if marker not in body and ascii_marker not in body:
            raise RuntimeError(f"historical authority range marker missing: {expected_range}")

    # Normalize heading-only transport variants before handing the unchanged
    # semantic payload to the generic parser. This does not alter target text.
    body = body.replace("Representative high-value surfaces:", "Representative surfaces include:")

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix="-authority.md", delete=False) as f:
        f.write(body)
        authority_path = f.name

    try:
        script = Path(__file__).with_name("lexical_historical_round_owner_surfaces.py")
        cmd = [sys.executable, str(script), authority_path, *sys.argv[2:]]
        return subprocess.call(cmd)
    finally:
        try:
            os.unlink(authority_path)
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
