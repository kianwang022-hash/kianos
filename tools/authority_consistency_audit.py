#!/usr/bin/env python3
"""Structural anti-drift guard for KianOS authority inheritance.

This checker intentionally validates ownership topology and implementation
boundaries only. It must not interpret domain learning semantics or learner
state.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
REGISTRY_PATH = REPO / "AUTHORITY_OWNERSHIP.json"

errors: list[str] = []
checks = 0


def check(condition: bool, code: str, detail: str = "") -> None:
    global checks
    checks += 1
    if not condition:
        errors.append(f"{code}{':' + detail if detail else ''}")


def rel(path: Path) -> str:
    return path.relative_to(REPO).as_posix()


def text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_registry() -> dict:
    check(REGISTRY_PATH.is_file(), "OWNERSHIP_REGISTRY_MISSING", rel(REGISTRY_PATH))
    if not REGISTRY_PATH.is_file():
        return {}
    try:
        value = json.loads(text(REGISTRY_PATH))
    except Exception as exc:
        errors.append(f"OWNERSHIP_REGISTRY_INVALID:{exc}")
        return {}
    check(value.get("schema") == "kianos.authority_ownership.v1", "OWNERSHIP_SCHEMA_INVALID")
    return value


def iter_source_files(*suffixes: str):
    root = REPO / "static-web" / "src"
    if not root.is_dir():
        return []
    return [p for p in root.rglob("*") if p.is_file() and p.suffix in suffixes]


def audit_registered_owners(registry: dict) -> None:
    declared: list[tuple[str, str]] = []
    for group_name in ("durable_authorities", "lane_work_cursors", "shared_platform"):
        group = registry.get(group_name, {})
        check(isinstance(group, dict), "OWNERSHIP_GROUP_INVALID", group_name)
        if not isinstance(group, dict):
            continue
        for key, owner in group.items():
            if not isinstance(owner, str):
                continue
            declared.append((f"{group_name}.{key}", owner))
            check((REPO / owner).is_file(), "REGISTERED_OWNER_MISSING", f"{group_name}.{key}={owner}")

    by_path: dict[str, list[str]] = {}
    for key, owner in declared:
        by_path.setdefault(owner, []).append(key)
    for owner, keys in by_path.items():
        check(len(keys) == 1, "REGISTERED_OWNER_DUPLICATED", f"{owner}<-{','.join(keys)}")


def audit_current_routing(registry: dict) -> None:
    contract = "AUTHORITY_INHERITANCE_CONTRACT.md"
    owner_registry = "AUTHORITY_OWNERSHIP.json"
    root_current = REPO / "CURRENT.md"

    check(root_current.is_file(), "CURRENT_OWNER_MISSING", rel(root_current))
    if root_current.is_file():
        value = text(root_current)
        check(contract in value, "CURRENT_MISSING_AUTHORITY_ROUTE", rel(root_current))
        check(owner_registry in value, "CURRENT_MISSING_OWNER_REGISTRY_ROUTE", rel(root_current))

    lane_work_cursors = registry.get("lane_work_cursors", {})
    check(isinstance(lane_work_cursors, dict), "LANE_CURSOR_REGISTRY_INVALID")
    if not isinstance(lane_work_cursors, dict):
        return

    if root_current.is_file():
        root_value = text(root_current)
        routed_lanes = {
            lane: route
            for route, lane in re.findall(
                r"\((content/([^/]+)/(?:CURRENT\.md|CONTENT_MAINLINE\.md))\)",
                root_value,
            )
        }
        for lane, route in routed_lanes.items():
            check(
                lane in lane_work_cursors,
                "ROOT_CURRENT_LANE_UNREGISTERED",
                f"{lane}:{route}",
            )
        for lane, cursor in lane_work_cursors.items():
            check(
                lane in routed_lanes,
                "REGISTERED_LANE_MISSING_ROOT_ROUTE",
                f"{lane}:{cursor}",
            )

    # Shared-platform terms are allowed in a lane Current only as a route to the
    # registered upstream owner/current writer. A subject Current must never turn
    # a temporary Chat assignment into durable ownership.
    shared_terms = (
        "shared platform",
        "shared base shell",
        "shared shell",
        "global `k` rail",
        "global navigation",
        "global-navigation",
        "current delivery",
    )
    forbidden_subject_claims = (
        re.compile(r"(?is)shared\s+(?:base\s+)?shell.{0,120}\bowned\s+by\b.{0,120}\b(?:english|xizong|politics|lexical|chat)\b"),
        re.compile(r"(?is)global\s+`?k`?\s+rail.{0,120}\bowned\s+by\b.{0,120}\b(?:english|xizong|politics|lexical|chat)\b"),
    )

    for lane, relative in lane_work_cursors.items():
        if not isinstance(relative, str):
            continue
        path = REPO / relative
        check(path.is_file(), "CURRENT_OWNER_MISSING", f"{lane}:{relative}")
        if not path.is_file():
            continue
        value = text(path)
        lowered = value.lower()
        touches_shared = any(term in lowered for term in shared_terms)
        if touches_shared:
            check(owner_registry in value, "LANE_SHARED_ROUTE_MISSING_OWNER_REGISTRY", relative)
            check(contract in value, "LANE_SHARED_ROUTE_MISSING_AUTHORITY_CONTRACT", relative)
        for pattern in forbidden_subject_claims:
            check(not pattern.search(value), "SUBJECT_CLAIMS_SHARED_PLATFORM_AUTHORITY", relative)


def audit_shared_shell(registry: dict) -> None:
    shared = registry.get("shared_platform", {})
    shell_owner = str(shared.get("shell_markup_owner", ""))
    nav_owner = str(shared.get("navigation_owner", ""))
    style_owner = str(shared.get("shell_style_owner", ""))

    shell_marker_files: list[str] = []
    for path in iter_source_files(".astro"):
        value = text(path)
        if "data-kianos-global-rail" in value or 'aria-label="KianOS 全局导航"' in value:
            shell_marker_files.append(rel(path))
    check(shell_marker_files == [shell_owner], "GLOBAL_RAIL_MULTIPLE_MARKUP_OWNERS", ",".join(shell_marker_files))

    nav_declaration_files: list[str] = []
    declaration = re.compile(r"\bexport\s+function\s+globalNavigation\s*\(")
    for path in iter_source_files(".mjs", ".js"):
        if declaration.search(text(path)):
            nav_declaration_files.append(rel(path))
    check(nav_declaration_files == [nav_owner], "GLOBAL_NAV_MULTIPLE_DECLARATION_OWNERS", ",".join(nav_declaration_files))

    style_path = REPO / style_owner
    check(style_path.is_file(), "SHARED_SHELL_STYLE_OWNER_MISSING", style_owner)
    if style_path.is_file():
        check(".kianosGlobalRail" in text(style_path), "SHARED_SHELL_STYLE_OWNER_EMPTY", style_owner)


def audit_current_sync(registry: dict) -> None:
    shared = registry.get("shared_platform", {})
    runtime_owner = str(shared.get("current_sync_mutation_owner", ""))
    bootstrap_installer = str(shared.get("current_sync_bootstrap_installer", ""))
    private_control_sync_owner = str(shared.get("private_control_sync_mutation_owner", ""))
    allowed = {runtime_owner, bootstrap_installer, private_control_sync_owner}
    scripts_root = REPO / "static-web" / "scripts"
    mutators: list[str] = []
    mutation_signatures = (
        "refs/heads/main",
        "checkout', '-B', 'main",
        'checkout", "-B", "main',
        "reset', '--hard', 'origin/main",
        'reset", "--hard", "origin/main',
        "checkout -B main origin/main",
        "reset --hard origin/main",
    )
    if scripts_root.is_dir():
        for path in scripts_root.rglob("*"):
            if not path.is_file() or path.suffix not in {".mjs", ".js", ".sh", ".py"}:
                continue
            value = text(path)
            if any(signature in value for signature in mutation_signatures):
                mutators.append(rel(path))

    check(runtime_owner in mutators, "CURRENT_SYNC_RUNTIME_OWNER_NOT_DETECTED", runtime_owner)
    check(bootstrap_installer in mutators, "CURRENT_SYNC_BOOTSTRAP_NOT_DETECTED", bootstrap_installer)
    if private_control_sync_owner:
        check(private_control_sync_owner in mutators, "PRIVATE_CONTROL_SYNC_OWNER_NOT_DETECTED", private_control_sync_owner)
    for path in mutators:
        check(path in allowed, "CURRENT_SYNC_UNREGISTERED_MUTATION_PATH", path)


def audit_home_boundary(registry: dict) -> None:
    contract = registry.get("conditional_boundaries", {}).get("home_projection_contract")
    if not isinstance(contract, str) or not (REPO / contract).is_file():
        return

    index_path = REPO / "static-web/src/pages/index.astro"
    check(index_path.is_file(), "HOME_ENTRY_MISSING")
    if not index_path.is_file():
        return
    value = text(index_path)
    forbidden_native = (
        "XizongHomeTools",
        "PoliticsHomeTools",
        "EnglishResume",
    )
    for token in forbidden_native:
        check(token not in value, "HOME_NATIVE_PRESENTATION_LEAK", token)

    check(
        "homeSubjectProjection" in value or "HomeSubjectProjection" in value,
        "HOME_STABLE_READ_MODEL_MISSING",
        rel(index_path),
    )


def audit_external_reading_boundary(registry: dict) -> None:
    brief = registry.get("conditional_boundaries", {}).get("external_reading_product_brief")
    if not isinstance(brief, str) or not (REPO / brief).is_file():
        return

    adapter = REPO / "static-web/src/components/SharedReadingWorkspace.astro"
    if not adapter.is_file():
        return
    value = text(adapter)
    check(
        "kianos-reading-continuous-session-v1" not in value,
        "ADAPTER_READS_FOREIGN_RUNTIME_KEY",
        rel(adapter),
    )
    check(
        "localStorage" not in value,
        "ADAPTER_MUTATES_FOREIGN_RUNTIME_STORE",
        rel(adapter),
    )
    check(
        "querySelector" not in value,
        "ADAPTER_PATCHES_OWNER_DOM_AFTER_RENDER",
        rel(adapter),
    )


def main() -> int:
    registry = load_registry()
    if registry:
        audit_registered_owners(registry)
        audit_current_routing(registry)
        audit_shared_shell(registry)
        audit_current_sync(registry)
        audit_home_boundary(registry)
        audit_external_reading_boundary(registry)

    result = {
        "schema": "kianos.authority-consistency-audit.v1",
        "pass": not errors,
        "checks": checks,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
