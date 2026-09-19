#!/usr/bin/env python3
"""Validate derived projections and conditionally activated shared capabilities.

This is deliberately structural: it verifies owner/source bindings and activation
completeness without interpreting subject learning semantics.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
REGISTRY = REPO / "AUTHORITY_OWNERSHIP.json"

errors: list[str] = []
checks = 0


def check(condition: bool, code: str, detail: str = "") -> None:
    global checks
    checks += 1
    if not condition:
        errors.append(f"{code}{':' + detail if detail else ''}")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"JSON_INVALID:{path.relative_to(REPO).as_posix()}:{exc}")
        return None


def audit_derived(registry: dict) -> None:
    projections = registry.get("derived_projections", {})
    check(isinstance(projections, dict), "DERIVED_PROJECTIONS_INVALID")
    if not isinstance(projections, dict):
        return

    for name, spec in projections.items():
        check(isinstance(spec, dict), "DERIVED_PROJECTION_SPEC_INVALID", name)
        if not isinstance(spec, dict):
            continue
        path_s = spec.get("path")
        source_s = spec.get("source")
        authority = spec.get("authority")
        check(isinstance(path_s, str), "DERIVED_PATH_INVALID", name)
        check(isinstance(source_s, str), "DERIVED_SOURCE_INVALID", name)
        check(isinstance(authority, str), "DERIVED_AUTHORITY_INVALID", name)
        if not all(isinstance(v, str) for v in (path_s, source_s, authority)):
            continue
        path = REPO / path_s
        source = REPO / source_s
        check(path.is_file(), "DERIVED_PROJECTION_MISSING", path_s)
        check(source.is_file(), "DERIVED_SOURCE_MISSING", source_s)
        if not path.is_file():
            continue
        value = read_json(path)
        if not isinstance(value, dict):
            continue
        check(value.get("source") == source_s, "DERIVED_SOURCE_BINDING_DRIFT", name)
        check(value.get("authority") == authority, "DERIVED_AUTHORITY_BINDING_DRIFT", name)


def audit_conditional_capabilities(registry: dict) -> None:
    capabilities = registry.get("conditional_capabilities", {})
    check(isinstance(capabilities, dict), "CONDITIONAL_CAPABILITIES_INVALID")
    if not isinstance(capabilities, dict):
        return

    active_owner_paths: list[str] = []
    for name, spec in capabilities.items():
        check(isinstance(spec, dict), "CONDITIONAL_CAPABILITY_SPEC_INVALID", name)
        if not isinstance(spec, dict):
            continue
        trigger_s = spec.get("trigger")
        owners = spec.get("owners")
        check(isinstance(trigger_s, str), "CONDITIONAL_TRIGGER_INVALID", name)
        check(isinstance(owners, dict), "CONDITIONAL_OWNERS_INVALID", name)
        if not isinstance(trigger_s, str) or not isinstance(owners, dict):
            continue

        trigger = REPO / trigger_s
        if not trigger.is_file():
            # Inactive capability: predeclared topology is not Current implementation truth yet.
            continue

        for role, owner_s in owners.items():
            check(isinstance(owner_s, str), "CONDITIONAL_OWNER_PATH_INVALID", f"{name}.{role}")
            if not isinstance(owner_s, str):
                continue
            active_owner_paths.append(owner_s)
            check((REPO / owner_s).is_file(), "CONDITIONAL_OWNER_MISSING", f"{name}.{role}={owner_s}")

        if name == "study_timer":
            shell_owner_s = registry.get("shared_platform", {}).get("shell_markup_owner")
            check(isinstance(shell_owner_s, str), "STUDY_TIMER_SHELL_OWNER_UNREGISTERED")
            if isinstance(shell_owner_s, str):
                shell_owner = REPO / shell_owner_s
                check(shell_owner.is_file(), "STUDY_TIMER_BASE_MISSING", shell_owner_s)
                if shell_owner.is_file():
                    text = shell_owner.read_text(encoding="utf-8")
                    check(text.count("<StudyTimerDock") == 1, "STUDY_TIMER_DOCK_NOT_SINGLE_GLOBAL_CONSUMER")
                    check("StudyTimerDock.astro" in text, "STUDY_TIMER_DOCK_IMPORT_MISSING")

    check(len(active_owner_paths) == len(set(active_owner_paths)), "CONDITIONAL_ACTIVE_OWNER_DUPLICATED")


def audit_orchestrator_runtime_binding(registry: dict) -> None:
    runtime_s = registry.get("shared_platform", {}).get("exam_orchestrator_runtime_owner")
    check(isinstance(runtime_s, str), "ORCHESTRATOR_RUNTIME_OWNER_UNREGISTERED")
    if not isinstance(runtime_s, str):
        return
    runtime = REPO / runtime_s
    check(runtime.is_file(), "ORCHESTRATOR_RUNTIME_OWNER_MISSING", runtime_s)
    if not runtime.is_file():
        return
    value = runtime.read_text(encoding="utf-8")
    check("EXAM_ORCHESTRATOR_CURRENT.json" in value, "ORCHESTRATOR_RUNTIME_PROJECTION_BINDING_MISSING")
    check("EXAM_ORCHESTRATOR_CONTRACT.md" in value, "ORCHESTRATOR_RUNTIME_CONTRACT_BINDING_MISSING")
    check("DERIVED_PROJECTION" in value, "ORCHESTRATOR_RUNTIME_DERIVED_GUARD_MISSING")


def audit_home_consumer_boundary(registry: dict) -> None:
    """Home may compose subject adapters; it may not become a subject Runtime reader.

    This activates only when the narrower Home projection contract exists. The
    checks intentionally target ownership leaks, not adapter naming, so subject
    lanes remain free to choose their narrow implementation surface.
    """
    contract_s = registry.get("conditional_boundaries", {}).get("home_projection_contract")
    if not isinstance(contract_s, str) or not (REPO / contract_s).is_file():
        return

    forbidden_by_file = {
        "static-web/src/lib/homeResumeClient.mjs": (
            "kianos-xizong-last-location-v1",
            "politicsPracticeState.mjs",
            "readPoliticsSnapshot",
            "resolvePoliticsContinue",
        ),
        "static-web/src/lib/homeSubjectProjection.mjs": (
            "from './xizong.mjs'",
            'from "./xizong.mjs"',
            "from './politicsCurrent.mjs'",
            'from "./politicsCurrent.mjs"',
            "listProjectableXizongSystems",
            "listPoliticsSubjectsCurrent",
        ),
        "static-web/src/pages/index.astro": (
            "politicsProductCatalog",
            "data-home-politics-catalog",
        ),
    }

    for relative, forbidden in forbidden_by_file.items():
        path = REPO / relative
        if not path.is_file():
            continue
        value = path.read_text(encoding="utf-8")
        for token in forbidden:
            check(token not in value, "HOME_READS_SUBJECT_PRIVATE_OWNER", f"{relative}:{token}")


def main() -> int:
    check(REGISTRY.is_file(), "OWNERSHIP_REGISTRY_MISSING")
    registry = read_json(REGISTRY) if REGISTRY.is_file() else None
    if isinstance(registry, dict):
        audit_derived(registry)
        audit_conditional_capabilities(registry)
        audit_orchestrator_runtime_binding(registry)
        audit_home_consumer_boundary(registry)

    result = {
        "schema": "kianos.authority-projection-audit.v1",
        "pass": not errors,
        "checks": checks,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
