#!/usr/bin/env python3
"""Read-only KianOS repository health aggregator.

It owns no semantic truth. It composes existing anti-drift audits and adds
branch-lifecycle / retired-ledger integrity checks for one compact readback.
"""

from __future__ import annotations

import argparse
import collections
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
AUDITS = {
    "authority": "tools/authority_consistency_audit.py",
    "projection": "tools/authority_projection_audit.py",
    "current": "tools/governance_current_audit.py",
}


def run(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=REPO, text=True, capture_output=True)


def git(*args: str) -> str:
    result = run(["git", *args])
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "git command failed")
    return result.stdout.strip()


def parse_retired_lines(raw: str) -> list[str]:
    refs: list[str] = []
    for line in raw.splitlines():
        token = line.split("#", 1)[0].strip()
        if token:
            refs.append(token)
    return refs


def workflow_safety_errors(raw: str) -> list[str]:
    required = {
        "OPEN_PR_FAIL_CLOSED_GUARD_MISSING": "branch_has_open_pr",
        "OPEN_PR_QUERY_MISSING": "--state open",
        "SQUASH_MAIN_PR_CACHE_MISSING": "merged_main_prs=",
        "SQUASH_MAIN_BASE_GUARD_MISSING": '.baseRefName == "main"',
        "SQUASH_MAIN_HEAD_NAME_GUARD_MISSING": ".headRefName == $branch",
        "SQUASH_MAIN_CODEX_EXCLUSION_MISSING": "^codex/issue[0-9]+-",
        "CODEX_EXACT_HEAD_FIELD_MISSING": "headRefOid",
        "CODEX_BRANCH_HEAD_BINDING_MISSING": 'branch_head="$(git rev-parse "origin/$branch")"',
        "CODEX_EXACT_HEAD_COMPARE_MISSING": "select(.headRefOid == $head)",
    }
    return [code for code, token in required.items() if token not in raw]


def run_audit(relative: str) -> dict:
    result = run([sys.executable, str(REPO / relative)])
    try:
        payload = json.loads(result.stdout)
    except Exception:
        return {
            "pass": False,
            "errors": [f"AUDIT_OUTPUT_INVALID:{relative}:{result.stderr.strip()}"],
        }
    payload["exit_code"] = result.returncode
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="refresh origin/* before branch/ledger checks; no remote writes",
    )
    args = parser.parse_args()

    errors: list[str] = []
    if args.fetch:
        fetched = run([
            "git", "fetch", "--prune", "origin",
            "+refs/heads/*:refs/remotes/origin/*",
        ])
        if fetched.returncode != 0:
            errors.append("REMOTE_FETCH_FAILED")

    audits = {name: run_audit(path) for name, path in AUDITS.items()}

    ledger_path = REPO / ".github/retired-branches.txt"
    if ledger_path.is_file():
        retired = parse_retired_lines(ledger_path.read_text(encoding="utf-8"))
    else:
        retired = []
        errors.append("RETIRED_LEDGER_MISSING")

    counts = collections.Counter(retired)
    duplicate_refs = sorted(ref for ref, count in counts.items() if count > 1)
    if duplicate_refs:
        errors.append("RETIRED_LEDGER_DUPLICATES")

    try:
        remote_refs = {
            ref.removeprefix("origin/")
            for ref in git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/").splitlines()
            if ref and ref != "origin/HEAD"
        }
    except Exception:
        remote_refs = set()
        errors.append("REMOTE_REFS_UNAVAILABLE")

    live_retired = sorted(set(retired) & remote_refs)
    if live_retired:
        errors.append("LIVE_RETIRED_REFS")

    workflow = REPO / ".github/workflows/branch-hygiene.yml"
    if workflow.is_file():
        safety_errors = workflow_safety_errors(workflow.read_text(encoding="utf-8"))
        errors.extend(safety_errors)
    else:
        safety_errors = ["BRANCH_HYGIENE_WORKFLOW_MISSING"]
        errors.extend(safety_errors)

    try:
        head = git("rev-parse", "HEAD")
        branch = git("branch", "--show-current")
        dirty = len(git("status", "--porcelain=v1").splitlines())
        origin_main = git("rev-parse", "origin/main")
        ahead_s, behind_s = git(
            "rev-list", "--left-right", "--count", "HEAD...origin/main"
        ).split()
        ahead_origin_main = int(ahead_s)
        behind_origin_main = int(behind_s)
    except Exception:
        head = branch = origin_main = ""
        dirty = -1
        ahead_origin_main = behind_origin_main = -1
        errors.append("GIT_SNAPSHOT_UNAVAILABLE")

    audit_errors = [
        f"{name}:{err}"
        for name, payload in audits.items()
        for err in payload.get("errors", [])
    ]
    passed = not errors and not audit_errors and all(
        payload.get("pass") is True for payload in audits.values()
    )

    result = {
        "schema": "kianos.repo-doctor.v1",
        "pass": passed,
        "git": {
            "head": head,
            "origin_main": origin_main,
            "branch": branch,
            "dirty_paths": dirty,
            "ahead_origin_main": ahead_origin_main,
            "behind_origin_main": behind_origin_main,
        },
        "audits": {
            name: {
                "pass": payload.get("pass") is True,
                "checks": payload.get("checks"),
                "errors": payload.get("errors", []),
            }
            for name, payload in audits.items()
        },
        "branches": {
            "remote_count": len(remote_refs),
            "retired_refs": len(retired),
            "retired_unique": len(counts),
            "duplicate_refs": duplicate_refs,
            "live_retired": live_retired,
            "workflow_safety_errors": safety_errors,
        },
        "errors": errors + audit_errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
