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


def local_routes(value: str, source: Path) -> set[str]:
    """Resolve Markdown links against their actual source, without reading labels."""
    routes: set[str] = set()
    for target in re.findall(r"\]\(([^)]+)\)", value):
        target = target.split("#", 1)[0]
        if not target or ":" in target or target.startswith("/"):
            continue
        resolved = (source.parent / target).resolve()
        try:
            route = rel(resolved)
        except ValueError:
            check(False, "ROUTE_OUTSIDE_REPOSITORY", f"{rel(source)}:{target}")
            continue
        check(resolved.is_file(), "ROUTE_TARGET_MISSING", f"{rel(source)}:{target}")
        routes.add(route)
    return routes


def load_registry() -> dict:
    check(REGISTRY_PATH.is_file(), "OWNERSHIP_REGISTRY_MISSING", rel(REGISTRY_PATH))
    if not REGISTRY_PATH.is_file():
        return {}
    try:
        value = json.loads(text(REGISTRY_PATH))
    except Exception as exc:
        errors.append(f"OWNERSHIP_REGISTRY_INVALID:{exc}")
        return {}
    check(value.get("schema") == "kianos.authority_ownership.v2", "OWNERSHIP_SCHEMA_INVALID")
    return value


def iter_source_files(*suffixes: str):
    root = REPO / "static-web" / "src"
    if not root.is_dir():
        return []
    return [p for p in root.rglob("*") if p.is_file() and p.suffix in suffixes]


def audit_registered_owners(registry: dict) -> None:
    declared: list[tuple[str, str]] = []
    for group_name in ("durable_authorities", "product_owners", "scope_work_cursors", "shared_platform"):
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
        root_routes = local_routes(value, root_current)
        check(contract in root_routes, "CURRENT_MISSING_AUTHORITY_ROUTE", rel(root_current))
        check(owner_registry in root_routes, "CURRENT_MISSING_OWNER_REGISTRY_ROUTE", rel(root_current))

    scope_work_cursors = registry.get("scope_work_cursors", {})
    check(isinstance(scope_work_cursors, dict), "SCOPE_CURSOR_REGISTRY_INVALID")
    if not isinstance(scope_work_cursors, dict):
        return

    if root_current.is_file():
        routed_scopes = {
            route.split("/")[1]: route
            for route in root_routes
            if re.fullmatch(r"content/[^/]+/(?:CURRENT|CONTENT_MAINLINE)\.md", route)
        }
        for scope, route in routed_scopes.items():
            check(
                scope in scope_work_cursors,
                "ROOT_CURRENT_SCOPE_UNREGISTERED",
                f"{scope}:{route}",
            )
        for scope, cursor in scope_work_cursors.items():
            check(
                scope in routed_scopes,
                "REGISTERED_SCOPE_MISSING_ROOT_ROUTE",
                f"{scope}:{cursor}",
            )
            if scope in routed_scopes:
                route = routed_scopes[scope]
                if route != cursor:
                    # Xizong's program router explicitly names the registered
                    # work cursor as its Parent; no second registration is needed.
                    mainline = "content/xizong/CONTENT_MAINLINE.md"
                    related = scope == "xizong" and route == mainline and (REPO / mainline).is_file() and re.search(
                        rf"(?m)^Parent: `{re.escape(cursor)}`$", text(REPO / mainline)
                    )
                    check(bool(related), "ROOT_CURRENT_SCOPE_OWNER_MISMATCH", f"{scope}:{route}!={cursor}")

    # Shared-platform terms are allowed in a scope Current only as a route to the
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

    for scope, relative in scope_work_cursors.items():
        if not isinstance(relative, str):
            continue
        path = REPO / relative
        check(path.is_file(), "CURRENT_OWNER_MISSING", f"{scope}:{relative}")
        if not path.is_file():
            continue
        value = text(path)
        lowered = value.lower()
        touches_shared = any(term in lowered for term in shared_terms)
        if touches_shared:
            check(owner_registry in value, "SCOPE_SHARED_ROUTE_MISSING_OWNER_REGISTRY", relative)
            check(contract in value, "SCOPE_SHARED_ROUTE_MISSING_AUTHORITY_CONTRACT", relative)
        for pattern in forbidden_subject_claims:
            check(not pattern.search(value), "SUBJECT_CLAIMS_SHARED_PLATFORM_AUTHORITY", relative)



def audit_product_owners(registry: dict) -> None:
    """Protect the migrated Product/Steward semantic owners and their routing."""
    products = registry.get("product_owners", {})
    expected = {
        "product_surface_contract": "static-web/PRODUCT_SURFACE_CONTRACT.md",
        "steward_product_contract": "static-web/STEWARD_PRODUCT_CONTRACT.md",
    }
    for key, owner in expected.items():
        check(products.get(key) == owner, "PRODUCT_OWNER_REGISTRY_DRIFT", f"{key}={products.get(key)}")
        check((REPO / owner).is_file(), "PRODUCT_OWNER_MISSING", owner)

    website_current = REPO / "static-web" / "CURRENT.md"
    root_current = REPO / "CURRENT.md"
    check(website_current.is_file(), "WEBSITE_CURRENT_MISSING")
    if website_current.is_file():
        value = text(website_current)
        for owner in expected.values():
            check(
                Path(owner).name in value and (REPO / owner).is_file(),
                "WEBSITE_CURRENT_MISSING_PRODUCT_ROUTE", owner,
            )

    if root_current.is_file():
        value = text(root_current)
        steward_rows = [line for line in value.splitlines() if line.startswith("|") and "Steward" in line.split("|", 2)[1]]
        check(
            len(steward_rows) == 1
            and "static-web/CURRENT.md" in local_routes(steward_rows[0], root_current)
            and (REPO / "static-web/CURRENT.md").is_file(),
            "ROOT_CURRENT_MISSING_STEWARD_ROUTE",
        )


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
    """Home composes subject-owned surfaces; it must not become a private subject-state reader."""
    index_path = REPO / "static-web/src/pages/index.astro"
    check(index_path.is_file(), "HOME_ENTRY_MISSING")
    if not index_path.is_file():
        return
    value = text(index_path)

    required_surfaces = (
        "XizongHomeTools",
        "PoliticsHomeTools",
        "EnglishResume",
        "ExamOrchestratorHome",
    )
    for token in required_surfaces:
        check(token in value, "HOME_REQUIRED_COMPOSITE_SURFACE_MISSING", token)

    forbidden_private = (
        "localStorage",
        "readPoliticsSnapshot",
        "readEnglishSessionInstruction",
        "buildEnglishEvidencePacket",
        "buildXizongStudyPacketFromStorage",
        "resolvePoliticsMemoryResume",
        "privateCheckpointRuntime",
    )
    for token in forbidden_private:
        check(token not in value, "HOME_READS_SUBJECT_PRIVATE_RUNTIME", token)

    check("<ExamOrchestratorHome" in value, "HOME_CHAT_PLAN_PROJECTION_MISSING", rel(index_path))

def audit_external_reading_boundary(registry: dict) -> None:
    owner_s = registry.get("conditional_boundaries", {}).get("external_reading_owner")
    check(isinstance(owner_s, str), "EXTERNAL_READING_OWNER_UNREGISTERED")
    if not isinstance(owner_s, str):
        return
    owner = REPO / owner_s
    check(owner.is_file(), "EXTERNAL_READING_OWNER_MISSING", owner_s)

    workspace_s = "static-web/src/components/ExternalReadingWorkspace.astro"
    workspace = REPO / workspace_s
    check(workspace.is_file(), "EXTERNAL_READING_WORKSPACE_MISSING", workspace_s)
    if not workspace.is_file():
        return

    value = text(workspace)
    # External Reading may own its own local state. It may not reach into
    # Reading A's private session / attempt stores merely to reuse a UI.
    for token in (
        "kianos-reading-continuous-session-v1",
        "kianos-reading-attempt-v1:",
        "kianos-reading-last-location-v1",
    ):
        check(token not in value, "EXTERNAL_READING_READS_FOREIGN_RUNTIME_KEY", f"{workspace_s}:{token}")
    check(
        "kianos-english-external-reading-attempt-v1:" in value,
        "EXTERNAL_READING_OWN_STATE_IDENTITY_MISSING",
        workspace_s,
    )



def audit_browser_test_port_isolation() -> None:
    """Browser acceptance tests must never default to the live KianOS port."""
    scripts_root = REPO / "static-web" / "scripts"
    allow_marker = "KIANOS_TEST_ALLOW_PRODUCTION_PORT_4321"
    patterns = (
        re.compile(r"(?:127\\.0\\.0\\.1|localhost):4321"),
        re.compile(r"['\"]--port['\"]\\s*,\\s*['\"]4321['\"]"),
        re.compile(r"\\bPORT\\s*=\\s*4321\\b"),
    )
    offenders: list[str] = []
    if scripts_root.is_dir():
        for path in sorted(scripts_root.glob("test-*.mjs")):
            value = text(path)
            if allow_marker in value:
                continue
            if any(pattern.search(value) for pattern in patterns):
                offenders.append(rel(path))
    check(
        not offenders,
        "BROWSER_TEST_USES_PRODUCTION_PORT_4321",
        ",".join(offenders),
    )

    astro_config = REPO / "static-web" / "astro.config.mjs"
    check(astro_config.is_file(), "ASTRO_CONFIG_MISSING")
    if astro_config.is_file():
        astro_value = text(astro_config)
        for token in (
            "KIANOS_ASTRO_ALLOW_LIVE_PRIVATE",
            "KIANOS_ASTRO_RUNTIME_ROOT",
            "KIANOS_PRIVATE_DIR",
            "KIANOS_CONTROL_DIR",
            "KIANOS_CONTROL_REPO_DIR",
            "KIANOS_PACKET_REPO_DIR",
            "KIANOS_EXTERNAL_READING_DIR",
            "KIANOS_ENGLISH_GENERATED_DIR",
            "KIANOS_CONTROL_ENABLED",
            "KIANOS_PACKET_RELAY_ENABLED",
        ):
            check(token in astro_value, "ASTRO_PRIVATE_RUNTIME_ISOLATION_MISSING", token)


def main() -> int:
    registry = load_registry()
    if registry:
        audit_registered_owners(registry)
        audit_current_routing(registry)
        audit_product_owners(registry)
        audit_shared_shell(registry)
        audit_current_sync(registry)
        audit_home_boundary(registry)
        audit_external_reading_boundary(registry)
        audit_browser_test_port_isolation()

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
