#!/usr/bin/env python3
"""
KianOS semantic base guard.

Purpose:
- main SHA movement alone must not invalidate a branch;
- only relevant changes inside the branch's inferred Impact Cone should require reconciliation;
- stacked PRs delegate main reconciliation to their upstream base branch.

The canonical rule lives in PROJECT_MANAGEMENT_CONTRACT.md.
This script is execution machinery, not an authority owner.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "AUTHORITY_OWNERSHIP.json"
MARKER_RE = re.compile(r"<!--\s*kianos-semantic-base:([0-9a-f]{40})\s*-->", re.I)
MARKER_TEMPLATE = "<!-- kianos-semantic-base:{sha} -->"

ROOT_AUTHORITY_EXCLUDE = {"root_work_cursor"}
SCOPES = ("english", "xizong", "politics", "lexical")
VISUAL_AUTHORITY_SUFFIXES = (
    "_PRODUCT_BRIEF.MD",
    "_DESIGN.MD",
    "_VISUAL_LANGUAGE.MD",
    "_UI_REVIEW_PROTOCOL.MD",
    "_REPRESENTATION_GATE.MD",
)


def run(*args: str, check: bool = True) -> str:
    result = subprocess.run(
        args,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if check and result.returncode != 0:
        raise RuntimeError(
            f"command failed ({result.returncode}): {' '.join(args)}\n{result.stderr.strip()}"
        )
    return result.stdout.strip()


def load_registry() -> dict:
    with REGISTRY_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def api(method: str, path: str, token: str, payload: dict | None = None):
    repo = os.environ["GITHUB_REPOSITORY"]
    url = f"https://api.github.com/repos/{repo}{path}"
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "kianos-semantic-base-guard",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else None
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API {method} {path} failed: {exc.code} {body}") from exc


def list_open_prs(token: str) -> list[dict]:
    prs: list[dict] = []
    page = 1
    while True:
        batch = api("GET", f"/pulls?state=open&per_page=100&page={page}", token) or []
        prs.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return prs


def get_pr(token: str, number: int) -> dict:
    return api("GET", f"/pulls/{number}", token)


def set_commit_status(token: str, sha: str, state: str, description: str) -> None:
    target_url = (
        f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/"
        f"{os.environ['GITHUB_REPOSITORY']}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"
    )
    api(
        "POST",
        f"/statuses/{sha}",
        token,
        {
            "state": state,
            "context": "KianOS Semantic Base",
            "description": description[:140],
            "target_url": target_url,
        },
    )


def read_marker(body: str | None) -> str | None:
    match = MARKER_RE.search(body or "")
    return match.group(1).lower() if match else None


def write_marker(token: str, pr: dict, sha: str) -> None:
    body = pr.get("body") or ""
    marker = MARKER_TEMPLATE.format(sha=sha)
    if MARKER_RE.search(body):
        new_body = MARKER_RE.sub(marker, body)
    else:
        suffix = "\n\n" if body and not body.endswith("\n") else "\n"
        new_body = f"{body}{suffix}{marker}"
    if new_body != body:
        api("PATCH", f"/pulls/{pr['number']}", token, {"body": new_body})


def fetch_refs(pr_number: int) -> str:
    run("git", "fetch", "--no-tags", "origin", "main")
    ref = f"refs/remotes/kianos/pr-{pr_number}"
    if subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", ref],
        cwd=ROOT,
    ).returncode != 0:
        run("git", "fetch", "--no-tags", "origin", f"pull/{pr_number}/head:{ref}")
    return ref


def prefetch_open_pr_refs() -> None:
    run("git", "fetch", "--no-tags", "origin", "main")
    run(
        "git",
        "fetch",
        "--no-tags",
        "origin",
        "+refs/pull/*/head:refs/remotes/kianos/pr/*",
        check=False,
    )


def diff_names(a: str, b: str) -> set[str]:
    text = run("git", "diff", "--name-only", f"{a}..{b}", check=False)
    return {line.strip() for line in text.splitlines() if line.strip()}


def merge_base(a: str, b: str) -> str:
    return run("git", "merge-base", a, b)


def commit_exists(sha: str) -> bool:
    return subprocess.run(
        ["git", "cat-file", "-e", f"{sha}^{{commit}}"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0


def infer_scopes(paths: Iterable[str]) -> set[str]:
    scopes: set[str] = set()
    for path in paths:
        low = path.lower()
        for scope in SCOPES:
            if low.startswith(f"content/{scope}/"):
                scopes.add(scope)
        if low.startswith("static-web/"):
            if "english" in low or "reading" in low or "translation" in low or "writing" in low or "external" in low:
                scopes.add("english")
            if "xizong" in low:
                scopes.add("xizong")
            if "politic" in low:
                scopes.add("politics")
            if "lexical" in low or "vocab" in low:
                scopes.add("lexical")
    return scopes


def infer_capabilities(paths: Iterable[str]) -> set[str]:
    caps: set[str] = set()
    for path in paths:
        low = path.lower()
        if low.startswith("static-web/src/") or low.startswith("static-web/home"):
            caps.add("learner_surface")
        if (
            low.startswith("static-web/src/styles/")
            or "/layouts/" in low
            or "/pages/" in low
            or "/components/" in low
        ):
            caps.add("visual_surface")
        if "home" in low or low == "static-web/src/pages/index.astro":
            caps.add("home")
        if "studytimer" in low or "study-timer" in low:
            caps.add("study_timer")
        if "exam_orchestrator" in low or "examorchestrator" in low:
            caps.add("orchestrator")
        if "current-sync" in low or "current-delivery" in low or "install-current" in low:
            caps.add("current_sync")
        if "external" in low and ("english" in low or low.startswith("static-web/")):
            caps.add("external_reading")
        if "steward" in low:
            caps.add("steward")
    return caps


def authority_paths(registry: dict) -> set[str]:
    durable = registry.get("durable_authorities", {})
    return {
        path
        for key, path in durable.items()
        if key not in ROOT_AUTHORITY_EXCLUDE and isinstance(path, str)
    }


def shared_owner_groups(registry: dict) -> dict[str, set[str]]:
    shared = registry.get("shared_platform", {})
    groups: dict[str, set[str]] = {
        "shared_shell": {
            shared.get("shell_markup_owner", ""),
            shared.get("navigation_owner", ""),
            shared.get("shell_style_owner", ""),
        },
        "visual_design": {
            shared.get("kian_ui_preferences_owner", ""),
            shared.get("ui_style_brief_owner", ""),
            shared.get("presentation_contract_owner", ""),
            shared.get("shared_visual_foundation_owner", ""),
        },
        "orchestrator": {
            shared.get("exam_orchestrator_runtime_owner", ""),
            registry.get("durable_authorities", {}).get("exam_orchestrator_policy", ""),
            registry.get("derived_projections", {}).get("exam_orchestrator_current", {}).get("path", ""),
        },
        "current_sync": {
            shared.get("current_sync_mutation_owner", ""),
            shared.get("current_sync_bootstrap_installer", ""),
            shared.get("current_delivery_workflow", ""),
        },
        "study_timer": set(
            registry.get("conditional_capabilities", {})
            .get("study_timer", {})
            .get("owners", {})
            .values()
        ),
        "home_boundary": {
            registry.get("product_owners", {}).get("product_surface_contract", "")
        },
        "steward_boundary": {
            registry.get("product_owners", {}).get("product_surface_contract", ""),
            registry.get("product_owners", {}).get("steward_product_contract", ""),
        },
        "external_boundary": {
            registry.get("conditional_boundaries", {}).get("external_reading_owner", "")
        },
    }
    return {name: {p for p in paths if p} for name, paths in groups.items()}


def classify(
    main_changes: set[str],
    pr_changes: set[str],
    registry: dict,
) -> tuple[bool, list[str], list[str]]:
    reasons: list[str] = []
    relevant_paths: set[str] = set()

    overlap = main_changes & pr_changes
    if overlap:
        reasons.append("WRITE_SET_OVERLAP")
        relevant_paths.update(overlap)

    root_hits = main_changes & authority_paths(registry)
    if root_hits:
        reasons.append("ROOT_AUTHORITY_CHANGED")
        relevant_paths.update(root_hits)

    caps = infer_capabilities(pr_changes)
    scopes = infer_scopes(pr_changes)
    for scope in scopes:
        lane_cursor = registry.get("scope_work_cursors", {}).get(scope)
        if lane_cursor and lane_cursor in main_changes:
            reasons.append(f"{scope.upper()}_CURRENT_CHANGED")
            relevant_paths.add(lane_cursor)
        prefix = f"content/{scope}/"
        lane_contract_hits = {
            p
            for p in main_changes
            if p.startswith(prefix)
            and (
                "CONTRACT" in Path(p).name.upper()
                or Path(p).name.upper() in {"ACCEPTANCE.MD", "CURRENT.MD"}
            )
        }
        if lane_contract_hits:
            reasons.append(f"{scope.upper()}_AUTHORITY_CHANGED")
            relevant_paths.update(lane_contract_hits)

        if "visual_surface" in caps:
            product_owner = registry.get("product_owners", {}).get(f"{scope}_product_brief")
            scope_token = scope.upper()
            visual_authority_hits = {
                p
                for p in main_changes
                if (
                    p == product_owner
                    or (
                        p.startswith("static-web/")
                        and scope_token in Path(p).name.upper()
                        and any(Path(p).name.upper().endswith(suffix) for suffix in VISUAL_AUTHORITY_SUFFIXES)
                    )
                )
            }
            if visual_authority_hits:
                reasons.append(f"{scope.upper()}_VISUAL_AUTHORITY_CHANGED")
                relevant_paths.update(visual_authority_hits)

    groups = shared_owner_groups(registry)

    def hit(group: str, condition: bool):
        if not condition:
            return
        found = main_changes & groups.get(group, set())
        if found:
            reasons.append(f"{group.upper()}_CHANGED")
            relevant_paths.update(found)

    hit("shared_shell", "learner_surface" in caps)
    hit("visual_design", "visual_surface" in caps)
    hit("orchestrator", bool(caps & {"home", "study_timer", "orchestrator"}))
    hit("current_sync", "current_sync" in caps)
    hit("study_timer", bool(caps & {"home", "study_timer"}))
    hit("home_boundary", "home" in caps)
    hit("steward_boundary", "steward" in caps)
    hit("external_boundary", "external_reading" in caps)

    reasons = list(dict.fromkeys(reasons))
    return bool(reasons), reasons, sorted(relevant_paths)


def scan_pr(pr: dict, token: str, registry: dict) -> dict:
    number = int(pr["number"])
    head_sha = pr["head"]["sha"]
    base_ref = pr["base"]["ref"]

    if base_ref != "main":
        set_commit_status(
            token,
            head_sha,
            "success",
            f"STACKED: {base_ref} owns reconciliation with main",
        )
        return {
            "pr": number,
            "status": "STACKED",
            "base": base_ref,
            "head": head_sha,
        }

    pr_ref = fetch_refs(number)
    current_main = run("git", "rev-parse", "origin/main")
    marker = read_marker(pr.get("body"))

    if marker and not commit_exists(marker):
        run("git", "fetch", "--no-tags", "origin", marker, check=False)

    baseline = marker if marker and commit_exists(marker) else merge_base("origin/main", pr_ref)
    main_changes = diff_names(baseline, "origin/main")
    pr_changes = diff_names(merge_base("origin/main", pr_ref), pr_ref)

    needs, reasons, paths = classify(main_changes, pr_changes, registry)
    if needs:
        description = f"RECONCILE: {', '.join(reasons[:2])}"
        set_commit_status(token, head_sha, "pending", description)
        return {
            "pr": number,
            "status": "RECONCILE_REQUIRED",
            "baseline": baseline,
            "main": current_main,
            "reasons": reasons,
            "paths": paths[:20],
        }

    write_marker(token, pr, current_main)
    set_commit_status(
        token,
        head_sha,
        "success",
        "SAFE_TO_CONTINUE: main changes outside semantic impact cone",
    )
    return {
        "pr": number,
        "status": "SAFE_TO_CONTINUE",
        "baseline": baseline,
        "main": current_main,
        "main_changes": len(main_changes),
        "pr_changes": len(pr_changes),
    }


def accept_pr(pr_number: int, token: str) -> dict:
    pr = get_pr(token, pr_number)
    if pr["base"]["ref"] != "main":
        raise RuntimeError("Only PRs based directly on main use a semantic-main marker.")
    run("git", "fetch", "--no-tags", "origin", "main")
    current_main = run("git", "rev-parse", "origin/main")
    write_marker(token, pr, current_main)
    set_commit_status(
        token,
        pr["head"]["sha"],
        "success",
        "RECONCILED: semantic base acknowledged at current main",
    )
    return {"pr": pr_number, "status": "RECONCILED", "main": current_main}


def self_test(registry: dict) -> None:
    cases = [
        (
            {"static-web/src/styles/xizong-system-workspace.css"},
            {"static-web/src/lib/studyTimer.mjs"},
            False,
            "unrelated scope CSS must not invalidate Timer",
        ),
        (
            {"AUTHORITY_INHERITANCE_CONTRACT.md"},
            {"static-web/src/lib/studyTimer.mjs"},
            True,
            "root authority must invalidate Timer",
        ),
        (
            {"static-web/src/layouts/BaseFrame.astro"},
            {"static-web/src/pages/english/index.astro"},
            True,
            "shared shell must invalidate learner surface",
        ),
        (
            {"static-web/UI_STYLE_BRIEF.md"},
            {"static-web/src/styles/steward-workspace.css"},
            True,
            "shared visual rule owner must invalidate visual surface work",
        ),
        (
            {"static-web/PRESENTATION_CONTRACT.md"},
            {"static-web/src/pages/english/index.astro"},
            True,
            "presentation contract must invalidate visual surface work",
        ),
        (
            {"static-web/UI_STYLE_BRIEF.md"},
            {"content/politics/projection/sample.json"},
            False,
            "shared visual rule changes must not invalidate non-visual semantic work",
        ),
        (
            {"static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md"},
            {"static-web/src/styles/xizong-block-workspace.css"},
            True,
            "same-scope accepted design must invalidate visual implementation work",
        ),
        (
            {"static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md"},
            {"content/xizong/projection/sample.json"},
            False,
            "visual design changes must not invalidate non-visual same-scope content work",
        ),
        (
            {"static-web/ENGLISH_PRODUCT_BRIEF.md"},
            {"static-web/src/pages/english/index.astro"},
            True,
            "subject product owner must invalidate subject visual work",
        ),
        (
            {"content/politics/CURRENT.md"},
            {"content/politics/projection/sample.json"},
            True,
            "scope Current must invalidate same-scope work",
        ),
        (
            {"static-web/src/lib/studyTimer.mjs"},
            {"static-web/src/pages/index.astro"},
            True,
            "Timer owner must invalidate Home",
        ),
        (
            {"static-web/STEWARD_PRODUCT_CONTRACT.md"},
            {"static-web/src/pages/steward/index.astro"},
            True,
            "Steward product owner must invalidate Steward work",
        ),
        (
            {"static-web/STEWARD_PRODUCT_CONTRACT.md"},
            {"content/politics/projection/sample.json"},
            False,
            "Steward product owner must not invalidate unrelated Politics work",
        ),
        (
            {"static-web/PRODUCT_SURFACE_CONTRACT.md"},
            {"static-web/src/pages/index.astro"},
            True,
            "Product surface owner must invalidate Home work",
        ),
        (
            {"content/english/external/CURRENT.md"},
            {"static-web/src/components/ExternalReadingWorkspace.astro"},
            True,
            "External Reading owner must invalidate External Reading work",
        ),
    ]
    for main_changes, pr_changes, expected, label in cases:
        actual, reasons, _ = classify(main_changes, pr_changes, registry)
        if actual != expected:
            raise AssertionError(f"{label}: expected={expected} actual={actual} reasons={reasons}")
    print("semantic base guard self-test: PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pr", type=int)
    parser.add_argument("--scan-open-prs", action="store_true")
    parser.add_argument("--accept-pr", type=int)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    registry = load_registry()
    if args.self_test:
        self_test(registry)
        return 0

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is required.")

    if args.accept_pr:
        print(json.dumps(accept_pr(args.accept_pr, token), ensure_ascii=False))
        return 0

    if args.pr:
        result = scan_pr(get_pr(token, args.pr), token, registry)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    if args.scan_open_prs:
        prefetch_open_pr_refs()
        results = []
        for pr in list_open_prs(token):
            try:
                results.append(scan_pr(pr, token, registry))
            except Exception as exc:
                results.append(
                    {"pr": pr.get("number"), "status": "ERROR", "error": str(exc)}
                )
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return 1 if any(row["status"] == "ERROR" for row in results) else 0

    parser.error("choose --pr N, --scan-open-prs, --accept-pr N, or --self-test")
    return 2


if __name__ == "__main__":
    sys.exit(main())
