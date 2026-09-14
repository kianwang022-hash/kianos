#!/usr/bin/env python3
"""Validate Xizong Projection v1 freeze/accounting metadata on top of the asset validator.

This companion gate does not re-audit medical semantics or renderer behavior. It checks
repository-wide System eligibility accounting, per-eligible-Block disposition/stale
accounting, and source/Current commit provenance.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[4]
PROJ = ROOT / "content/xizong/projection"
MANIFEST = PROJ / "manifest.json"
KNOWLEDGE_MANIFEST = ROOT / "content/xizong/knowledge/manifest.json"
ALLOWED_DISPOSITIONS = {"PASS", "REFERENCE_ONLY", "BLOCKED"}
ALLOWED_STALE = {"FRESH", "STALE", "BLOCKED"}
ALLOWED_LEVELS = {"RICH_CURRENT", "BASELINE_CURRENT"}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm_root(value: str) -> str:
    value = value.strip("/")
    if value.startswith("systems/"):
        value = "content/xizong/knowledge/" + value
    return value + "/"


def expected_owner_roots() -> set[str]:
    km = load_json(KNOWLEDGE_MANIFEST)
    result = set()
    domains = km.get("macro_domain_taxonomy", {}).get("domains", {})
    if not isinstance(domains, dict):
        raise ValueError("knowledge manifest macro_domain_taxonomy.domains missing")
    for domain in domains.values():
        if not isinstance(domain, dict):
            continue
        owners = domain.get("system_owners", [])
        if not isinstance(owners, list):
            raise ValueError("knowledge manifest system_owners must be list")
        for owner in owners:
            if not isinstance(owner, str) or not owner:
                raise ValueError("knowledge manifest has invalid system owner")
            result.add(norm_root(owner))
    return result


def commit_exists(sha: str) -> bool:
    if not isinstance(sha, str) or not re.fullmatch(r"[0-9a-f]{40}", sha):
        return False
    return subprocess.run(
        ["git", "cat-file", "-e", f"{sha}^{{commit}}"],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0


def is_ancestor(older: str, newer: str) -> bool:
    return subprocess.run(
        ["git", "merge-base", "--is-ancestor", older, newer],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    ).returncode == 0


def validate_manifest(manifest: dict) -> list[str]:
    errors: list[str] = []

    def fail(code: str, message: str):
        errors.append(f"{code}: {message}")

    required = {
        "schema", "schema_version", "status", "runtime_authority",
        "source_baseline_commit", "source_current_head", "compiled_commit",
        "current_reconciliation_head", "systems", "coverage",
        "eligibility_accounting", "validation"
    }
    missing = sorted(required - set(manifest))
    if missing:
        fail("SCHEMA", f"manifest missing {missing}")

    if manifest.get("schema") != "kianos.xizong.cognitive_projection.manifest.v1":
        fail("SCHEMA", "unexpected manifest schema")
    if manifest.get("runtime_authority") is not False:
        fail("BOUNDARY", "Projection manifest must remain non-runtime authority")
    if manifest.get("status") not in {
        "V1_FREEZE_CANDIDATE_RECONCILED",
        "V1_ASSET_CONTRACT_FROZEN_VALIDATED",
    }:
        fail("SCHEMA", f"unsupported freeze status {manifest.get('status')!r}")

    for field in ("source_baseline_commit", "source_current_head", "compiled_commit", "current_reconciliation_head"):
        sha = manifest.get(field)
        if not commit_exists(sha):
            fail("PROVENANCE", f"{field} is not an available commit: {sha!r}")

    source_current = manifest.get("source_current_head")
    compiled = manifest.get("compiled_commit")
    reconciled = manifest.get("current_reconciliation_head")
    if all(commit_exists(x) for x in (source_current, compiled, reconciled)):
        if not is_ancestor(source_current, compiled):
            fail("PROVENANCE", "source_current_head must be ancestor of compiled_commit")
        if not is_ancestor(compiled, reconciled):
            fail("PROVENANCE", "compiled_commit must be ancestor of current_reconciliation_head")
        if not is_ancestor(reconciled, "HEAD"):
            fail("PROVENANCE", "current_reconciliation_head must be ancestor of validation HEAD")

    systems = manifest.get("systems", {})
    if not isinstance(systems, dict) or not systems:
        fail("SCHEMA", "systems must be a non-empty mapping")
        systems = {}

    eligibility = manifest.get("eligibility_accounting", {})
    compiled_entries = eligibility.get("compiled", []) if isinstance(eligibility, dict) else []
    deferred_entries = eligibility.get("not_eligible", []) if isinstance(eligibility, dict) else []
    if not isinstance(compiled_entries, list) or not isinstance(deferred_entries, list):
        fail("ELIGIBILITY", "eligibility compiled/not_eligible must be lists")
        compiled_entries, deferred_entries = [], []

    accounted_roots: list[str] = []
    compiled_by_sid: dict[str, dict] = {}
    canonical_ids: list[str] = []

    for item in compiled_entries:
        if not isinstance(item, dict):
            fail("ELIGIBILITY", "compiled entry must be object")
            continue
        sid = item.get("system_id")
        if item.get("status") != "ELIGIBLE_COMPILED":
            fail("ELIGIBILITY", f"{sid}: compiled status must be ELIGIBLE_COMPILED")
        if not isinstance(sid, str) or sid in compiled_by_sid:
            fail("ELIGIBILITY", f"invalid/duplicate compiled system_id {sid!r}")
            continue
        compiled_by_sid[sid] = item
        canonical_ids.append(item.get("canonical_id"))
        root = item.get("owner_root")
        if not isinstance(root, str):
            fail("ELIGIBILITY", f"{sid}: owner_root missing")
        else:
            root = norm_root(root)
            accounted_roots.append(root)
            if not (ROOT / root).is_dir():
                fail("ELIGIBILITY", f"{sid}: owner_root missing on disk: {root}")

    for item in deferred_entries:
        if not isinstance(item, dict):
            fail("ELIGIBILITY", "not_eligible entry must be object")
            continue
        cid = item.get("canonical_id")
        canonical_ids.append(cid)
        if item.get("status") != "NOT_ELIGIBLE":
            fail("ELIGIBILITY", f"{cid}: deferred status must be NOT_ELIGIBLE")
        if not isinstance(item.get("reason"), str) or not item["reason"].strip():
            fail("ELIGIBILITY", f"{cid}: nonempty reason required")
        root = item.get("owner_root")
        if not isinstance(root, str):
            fail("ELIGIBILITY", f"{cid}: owner_root missing")
        else:
            root = norm_root(root)
            accounted_roots.append(root)
            if not (ROOT / root).is_dir():
                fail("ELIGIBILITY", f"{cid}: owner_root missing on disk: {root}")

    try:
        expected_roots = expected_owner_roots()
    except Exception as exc:
        fail("ELIGIBILITY", str(exc))
        expected_roots = set()

    if set(accounted_roots) != expected_roots:
        fail(
            "ELIGIBILITY",
            f"System owner accounting mismatch; missing={sorted(expected_roots-set(accounted_roots))}, "
            f"extra={sorted(set(accounted_roots)-expected_roots)}"
        )
    if len(accounted_roots) != len(set(accounted_roots)):
        fail("ELIGIBILITY", "a System owner_root is accounted more than once")
    if len(canonical_ids) != len(set(canonical_ids)):
        fail("ELIGIBILITY", "duplicate canonical_id across eligibility accounting")
    if set(compiled_by_sid) != set(systems):
        fail("ELIGIBILITY", "compiled eligibility systems must exactly equal manifest systems")

    disposition_counts = Counter({"PASS": 0, "REFERENCE_ONLY": 0, "BLOCKED": 0})
    stale_counts = Counter({"FRESH": 0, "STALE": 0, "BLOCKED": 0})
    rich_ids: list[str] = []
    baseline_count = 0

    for sid, spec in systems.items():
        if not isinstance(spec, dict):
            fail("SCHEMA", f"{sid}: system spec must be object")
            continue
        elig = compiled_by_sid.get(sid)
        if elig:
            if elig.get("canonical_id") != spec.get("canonical_id"):
                fail("ELIGIBILITY", f"{sid}: canonical_id mismatch")
            if elig.get("block_count") != spec.get("block_count"):
                fail("ELIGIBILITY", f"{sid}: block_count mismatch")

        owner_root = spec.get("owner_root")
        source = spec.get("system_source")
        if not isinstance(owner_root, str) or not isinstance(source, str):
            fail("OWNER", f"{sid}: owner_root/system_source required")
        else:
            root = norm_root(owner_root)
            expected_source = str(PurePosixPath(root) / "system.json")
            if source != expected_source:
                fail("OWNER", f"{sid}: system_source {source!r} != {expected_source!r}")
            if elig and norm_root(elig.get("owner_root", "")) != root:
                fail("ELIGIBILITY", f"{sid}: compiled owner_root mismatch")

        if spec.get("system_disposition") not in ALLOWED_DISPOSITIONS:
            fail("ACCOUNTING", f"{sid}: invalid system_disposition")
        if spec.get("stale_status") not in ALLOWED_STALE:
            fail("ACCOUNTING", f"{sid}: invalid system stale_status")
        if spec.get("system_disposition") == "PASS" and spec.get("stale_status") != "FRESH":
            fail("ACCOUNTING", f"{sid}: PASS system must be FRESH")

        blocks = spec.get("blocks", [])
        accounting = spec.get("block_accounting", [])
        if not isinstance(blocks, list) or not isinstance(accounting, list):
            fail("ACCOUNTING", f"{sid}: blocks/block_accounting must be lists")
            continue
        if len(accounting) != len(blocks) or spec.get("block_count") != len(blocks):
            fail("ACCOUNTING", f"{sid}: block accounting/count mismatch")

        by_asset = {}
        for item in accounting:
            if not isinstance(item, dict):
                fail("ACCOUNTING", f"{sid}: block accounting entry must be object")
                continue
            asset = item.get("asset")
            if not isinstance(asset, str) or asset in by_asset:
                fail("ACCOUNTING", f"{sid}: invalid/duplicate accounted asset {asset!r}")
                continue
            by_asset[asset] = item

        if set(by_asset) != set(blocks):
            fail("ACCOUNTING", f"{sid}: accounted assets must exactly equal blocks list")

        for asset_rel in blocks:
            item = by_asset.get(asset_rel)
            if item is None:
                continue
            asset_path = PROJ / asset_rel
            if not asset_path.is_file():
                fail("ACCOUNTING", f"{sid}: missing asset {asset_rel}")
                continue
            try:
                asset = load_json(asset_path)
            except Exception as exc:
                fail("ACCOUNTING", f"{sid}: cannot read {asset_rel}: {exc}")
                continue
            bid = asset.get("block_id")
            level = asset.get("projection_level")
            if item.get("block_id") != bid:
                fail("ACCOUNTING", f"{sid}/{asset_rel}: block_id accounting mismatch")
            if item.get("projection_level") != level or level not in ALLOWED_LEVELS:
                fail("ACCOUNTING", f"{sid}/{bid}: projection_level mismatch/unsupported")

            disposition = item.get("disposition")
            stale = item.get("stale_status")
            if disposition not in ALLOWED_DISPOSITIONS:
                fail("ACCOUNTING", f"{sid}/{bid}: invalid disposition {disposition!r}")
            else:
                disposition_counts[disposition] += 1
            if stale not in ALLOWED_STALE:
                fail("ACCOUNTING", f"{sid}/{bid}: invalid stale_status {stale!r}")
            else:
                stale_counts[stale] += 1
            if disposition == "PASS" and stale != "FRESH":
                fail("ACCOUNTING", f"{sid}/{bid}: PASS requires FRESH")
            if level == "RICH_CURRENT":
                rich_ids.append(bid)
            elif level == "BASELINE_CURRENT":
                baseline_count += 1

    coverage = manifest.get("coverage", {})
    expected_disp = {k: disposition_counts[k] for k in ("PASS","REFERENCE_ONLY","BLOCKED")}
    expected_stale = {k: stale_counts[k] for k in ("FRESH","STALE","BLOCKED")}
    if coverage.get("eligible_block_accounting") != expected_disp:
        fail("ACCOUNTING", f"eligible_block_accounting mismatch; actual={expected_disp}")
    if coverage.get("stale_accounting") != expected_stale:
        fail("ACCOUNTING", f"stale_accounting mismatch; actual={expected_stale}")
    if coverage.get("baseline_projection_blocks") != baseline_count:
        fail("ACCOUNTING", f"baseline_projection_blocks mismatch; actual={baseline_count}")
    declared_rich = coverage.get("rich_calibration_blocks", [])
    if not isinstance(declared_rich, list) or Counter(declared_rich) != Counter(rich_ids):
        fail("ACCOUNTING", f"rich_calibration_blocks mismatch; actual={sorted(rich_ids)}")

    return errors


def run_self_tests(manifest: dict) -> list[str]:
    failures: list[str] = []

    def must_fail(name: str, mutated: dict, prefix: str):
        issues = validate_manifest(mutated)
        if not any(x.startswith(prefix + ":") for x in issues):
            failures.append(f"{name}: expected {prefix} rejection, got {issues}")

    m = copy.deepcopy(manifest)
    first_sid = next(iter(m["systems"]))
    m["systems"][first_sid]["block_accounting"] = m["systems"][first_sid]["block_accounting"][:-1]
    must_fail("missing_block_accounting", m, "ACCOUNTING")

    m = copy.deepcopy(manifest)
    m["eligibility_accounting"]["not_eligible"][0]["owner_root"] = m["eligibility_accounting"]["compiled"][0]["owner_root"]
    must_fail("duplicate_owner_accounting", m, "ELIGIBILITY")

    m = copy.deepcopy(manifest)
    m["current_reconciliation_head"] = "0" * 40
    must_fail("bad_reconciliation_commit", m, "PROVENANCE")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", type=Path)
    args = parser.parse_args()

    manifest = load_json(MANIFEST)
    issues = validate_manifest(manifest)
    self_test_failures = run_self_tests(manifest) if args.self_test else []

    status = "PASS" if not issues and not self_test_failures else "FAIL"
    report = {
        "status": status,
        "scope": "PROJECTION_FREEZE_ACCOUNTING_AND_PROVENANCE_ONLY",
        "issues": issues,
        "self_test_failures": self_test_failures,
        "compiled_systems": len(manifest.get("systems", {})),
        "eligible_blocks": manifest.get("coverage", {}).get("blocks"),
        "accounted_system_owner_roots": len(expected_owner_roots()),
        "not_claimed": [
            "medical_semantic_acceptance",
            "browser_answer_leak_safety",
            "Mac_visual_acceptance",
            "runtime_adoption",
            "learner_progress",
        ],
    }
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for issue in issues:
        print("FAIL", issue)
    for failure in self_test_failures:
        print("SELF_TEST_FAIL", failure)
    print(f"XIZONG_PROJECTION_ACCEPTANCE: {status}")
    print(f"eligibility_owner_accounting: {'PASS' if not any(x.startswith('ELIGIBILITY:') for x in issues) else 'FAIL'}")
    print(f"block_disposition_and_stale_accounting: {'PASS' if not any(x.startswith('ACCOUNTING:') for x in issues) else 'FAIL'}")
    print(f"commit_provenance: {'PASS' if not any(x.startswith('PROVENANCE:') for x in issues) else 'FAIL'}")
    if args.self_test:
        print(f"acceptance_self_tests: {'PASS' if not self_test_failures else 'FAIL'}")
    print("boundary: accounting/provenance only; stronger asset validator remains authoritative for bindings/visibility")
    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
