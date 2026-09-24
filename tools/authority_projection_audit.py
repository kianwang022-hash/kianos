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

        freshness = spec.get("freshness")
        check(isinstance(freshness, dict), "DERIVED_FRESHNESS_PROOF_MISSING", name)
        if not isinstance(freshness, dict):
            continue
        mode = freshness.get("mode")
        validator_s = freshness.get("validator")
        workflow_s = freshness.get("workflow")
        check(mode == "VALIDATED_AGAINST_CURRENT_SOURCE", "DERIVED_FRESHNESS_MODE_INVALID", f"{name}:{mode}")
        check(isinstance(validator_s, str), "DERIVED_FRESHNESS_VALIDATOR_INVALID", name)
        check(isinstance(workflow_s, str), "DERIVED_FRESHNESS_WORKFLOW_INVALID", name)
        if not isinstance(validator_s, str) or not isinstance(workflow_s, str):
            continue
        validator = REPO / validator_s
        workflow = REPO / workflow_s
        check(validator.is_file(), "DERIVED_FRESHNESS_VALIDATOR_MISSING", validator_s)
        check(workflow.is_file(), "DERIVED_FRESHNESS_WORKFLOW_MISSING", workflow_s)
        if validator.is_file():
            validator_text = validator.read_text(encoding="utf-8")
            check(path_s in validator_text or Path(path_s).name in validator_text, "DERIVED_VALIDATOR_MISSES_PROJECTION", name)
            check(source_s in validator_text or Path(source_s).name in validator_text, "DERIVED_VALIDATOR_MISSES_SOURCE", name)
        if workflow.is_file():
            workflow_text = workflow.read_text(encoding="utf-8")
            check(source_s in workflow_text, "DERIVED_WORKFLOW_MISSES_SOURCE_TRIGGER", name)
            check(path_s in workflow_text, "DERIVED_WORKFLOW_MISSES_PROJECTION_TRIGGER", name)
            check(validator_s in workflow_text or Path(validator_s).name in workflow_text, "DERIVED_WORKFLOW_MISSES_VALIDATOR", name)
            check("pull_request:" in workflow_text, "DERIVED_WORKFLOW_MISSES_PR_GATE", name)
            check("push:" in workflow_text and "main" in workflow_text, "DERIVED_WORKFLOW_MISSES_MAIN_GATE", name)


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
    """Shared Home packet aggregation may consume subject adapters, never mutate subject-private state."""
    packet_path = REPO / "static-web/src/lib/dailyLearningPacketRuntime.mjs"
    check(packet_path.is_file(), "HOME_DAILY_PACKET_AGGREGATOR_MISSING")
    if not packet_path.is_file():
        return
    value = packet_path.read_text(encoding="utf-8")

    required_adapter_calls = (
        "buildEnglishEvidencePacket",
        "politicsDailyEvidencePacket",
        "buildXizongStudyPacketFromStorage",
        "attachDailySubjectPacket",
    )
    for token in required_adapter_calls:
        check(token in value, "HOME_PACKET_SUBJECT_ADAPTER_MISSING", token)

    forbidden_mutations = (
        ".setItem(",
        ".removeItem(",
        ".clear(",
    )
    for token in forbidden_mutations:
        check(token not in value, "HOME_PACKET_MUTATES_SUBJECT_PRIVATE_STATE", token)

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
