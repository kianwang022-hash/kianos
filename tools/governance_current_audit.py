#!/usr/bin/env python3
"""Minimal KianOS governance anti-entropy audit.

This guard defends only structural failure classes already observed during the
federated Current redesign. It is intentionally not a governance framework and
must not interpret domain semantics or learner state.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

def discover_current_paths() -> list[str]:
    paths = ["CURRENT.md", "static-web/CURRENT.md"]
    content_root = REPO / "content"
    if content_root.is_dir():
        paths.extend(
            sorted(
                p.relative_to(REPO).as_posix()
                for p in content_root.rglob("CURRENT.md")
                if p.is_file()
            )
        )
    return list(dict.fromkeys(paths))


CURRENT_PATHS = discover_current_paths()

PARENT_ROUTER_PATHS = {
    "content/english/CURRENT.md",
    "content/xizong/CURRENT.md",
    "content/politics/CURRENT.md",
    "content/skills/CURRENT.md",
}

ROUTER_ONLY_CURRENT_PATHS = {
    "CURRENT.md",
    "static-web/CURRENT.md",
    "content/skills/CURRENT.md",
}

def discover_acceptance_paths() -> list[str]:
    paths = ["GOVERNANCE_ACCEPTANCE.md"]
    content_root = REPO / "content"
    if content_root.is_dir():
        paths.extend(
            sorted(
                p.relative_to(REPO).as_posix()
                for p in content_root.rglob("ACCEPTANCE.md")
                if p.is_file()
            )
        )
    return list(dict.fromkeys(paths))


ACCEPTANCE_PATHS = discover_acceptance_paths()

# Retired parallel state owners are removed completely.
# Their absence is the protected boundary: recreating one would reintroduce
# a competing status / continuation owner and must fail closed.
RETIRED_JSON_PATHS = []

ABSENT_RETIRED_PATHS = [
    "RECOVERY_COGNITIVE_CAPACITY_MODEL.md",
    "RECOVERY_COGNITIVE_CAPACITY_ACCEPTANCE.md",
    "content/english/continuation.json",
    "content/lexical/continuation.json",
    "content/politics/continuation.json",
    "content/xizong/knowledge/learner/continuation.json",
    "content/xizong/knowledge/learner/acceptance-status.json",
]
MANIFEST_PATHS = [
    "content/english/manifest.json",
    "content/xizong/knowledge/manifest.json",
    "content/lexical/manifest.json",
    "content/skills/manifest.json",
    "content/politics/manifest.json",
]

MAX_CURRENT_BYTES = 18_000
MAX_CURRENT_LINES = 180

# These are signatures of the exact narrative/status-log failure class that the
# redesign is retiring. Do not broaden this list into generic prose policing.
FORBIDDEN_CURRENT_TOKENS = [
    "completed_shared_work",
    "acceptance_history",
    "working_preferences",
    "after_validation",
    "secondary_semantic_repair_queue",
]

errors: list[str] = []
checks = 0


def fail(code: str, detail: str = "") -> None:
    errors.append(f"{code}{':' + detail if detail else ''}")


def require_file(relative: str) -> Path | None:
    global checks
    checks += 1
    path = REPO / relative
    if not path.is_file():
        fail("MISSING_REQUIRED_OWNER", relative)
        return None
    return path


def read_text(relative: str) -> str:
    return (REPO / relative).read_text(encoding="utf-8")


def read_json(relative: str):
    try:
        return json.loads(read_text(relative))
    except Exception as exc:  # fail closed; exact parse failure matters
        fail("INVALID_JSON", f"{relative}:{exc}")
        return None


HISTORICAL_KEY_PREFIXES = ("historical_", "previous_")
HISTORICAL_SUBTREE_KEYS = {"history", "provenance", "audit_history", "receipts"}
CLOSED_CONFLICT_STATUS = re.compile(r"PENDING|REQUIRED_BEFORE_CLOSEOUT|REVALIDATION_PENDING|BLOCKED_UNTIL", re.I)


def _nonempty_live_value(value) -> bool:
    if value is None or value is False:
        return False
    if isinstance(value, str):
        return value.strip().upper() not in {"", "NONE", "N/A", "NA", "CLOSED", "COMPLETE"}
    if isinstance(value, (list, dict, tuple, set)):
        return bool(value)
    return bool(value)


def closure_consistency_conflicts(value: dict) -> list[str]:
    """Syntax-level helper for exact lifecycle validators.

    This does not decide whether an object *should* be CLOSED. It finds any
    non-historical subtree that already declares CLOSED and rejects structurally
    live instructions underneath that subtree.
    """
    if not isinstance(value, dict):
        return []

    conflicts: set[str] = set()

    def ignored(key: str) -> bool:
        lowered = key.lower()
        return lowered in HISTORICAL_SUBTREE_KEYS or lowered.startswith(HISTORICAL_KEY_PREFIXES)

    def scan_live(node, path: tuple[str, ...]) -> None:
        if isinstance(node, dict):
            for key, child in node.items():
                key_s = str(key)
                if ignored(key_s):
                    continue
                lowered = key_s.lower()
                child_path = path + (key_s,)
                label = ".".join(child_path)
                if lowered == "status" and isinstance(child, str) and CLOSED_CONFLICT_STATUS.search(child):
                    conflicts.add(f"LIVE_STATUS:{label}={child}")
                elif lowered == "next_action" and _nonempty_live_value(child):
                    conflicts.add(f"LIVE_NEXT_ACTION:{label}")
                elif lowered in {"blocker", "blockers", "required_before_closeout"} and _nonempty_live_value(child):
                    conflicts.add(f"LIVE_BLOCKER:{label}")
                elif lowered == "acceptance_status" and isinstance(child, str) and CLOSED_CONFLICT_STATUS.search(child):
                    conflicts.add(f"LIVE_ACCEPTANCE:{label}={child}")
                elif lowered.startswith("active_") and child is True:
                    conflicts.add(f"LIVE_ACTIVE_FLAG:{label}")
                scan_live(child, child_path)
        elif isinstance(node, list):
            for index, child in enumerate(node):
                scan_live(child, path + (str(index),))

    def find_closed(node, path: tuple[str, ...] = ()) -> None:
        if isinstance(node, dict):
            status = node.get("status")
            if isinstance(status, str) and "CLOSED" in status.upper():
                scan_live(node, path)
            for key, child in node.items():
                key_s = str(key)
                if ignored(key_s):
                    continue
                find_closed(child, path + (key_s,))
        elif isinstance(node, list):
            for index, child in enumerate(node):
                find_closed(child, path + (str(index),))

    find_closed(value)
    return sorted(conflicts)

def reviewed_derivation_revision_conflict(current_revision, reviewed_against, claims_current: bool) -> bool:
    """Generic identity/revision witness rule; domain validator owns semantics."""
    return bool(claims_current and current_revision and reviewed_against and current_revision != reviewed_against)

def audit_current(relative: str) -> None:
    global checks
    path = require_file(relative)
    if not path:
        return
    raw = path.read_bytes()
    text = raw.decode("utf-8")
    lines = text.splitlines()

    checks += 1
    if len(raw) > MAX_CURRENT_BYTES:
        fail("CURRENT_TOO_LARGE", f"{relative}:{len(raw)}>{MAX_CURRENT_BYTES}")

    checks += 1
    if len(lines) > MAX_CURRENT_LINES:
        fail("CURRENT_TOO_MANY_LINES", f"{relative}:{len(lines)}>{MAX_CURRENT_LINES}")

    lowered = text.lower()
    normalized = lowered.replace("-", " ")
    checks += 1
    role_ok = "current" in lowered and (
        "work cursor" in lowered
        or (relative in ROUTER_ONLY_CURRENT_PATHS and ("routing entry" in lowered or "router" in lowered))
    )
    if not role_ok:
        fail("CURRENT_ROLE_MISSING", relative)

    checks += 1
    next_ok = "next" in normalized or "reopen" in normalized or "stop" in normalized
    if not next_ok:
        fail("CURRENT_NEXT_ACTION_MISSING", relative)

    checks += 1
    if not any(token in normalized for token in ("learner truth", "private learner", "learner progress", "learner state")):
        fail("CURRENT_LEARNER_BOUNDARY_MISSING", relative)

    for token in FORBIDDEN_CURRENT_TOKENS:
        checks += 1
        if token in text:
            fail("CURRENT_NARRATIVE_STATUS_LOG_TOKEN", f"{relative}:{token}")

    # Parent routers may discuss why child serialization is forbidden, but they
    # may not own a status field that selects one global "Active child".
    if relative in PARENT_ROUTER_PATHS:
        checks += 1
        if re.search(r"(?im)^\s*\*\*Active\s+child(?:\s+scope)?\s*:\*\*", text):
            fail("PARENT_ROUTER_SERIALIZES_CHILD", relative)

    # A retired continuation may be mentioned as a non-read boundary, but it may
    # not re-enter a numbered Required-reads list.
    required_match = re.search(
        r"(?ims)^##\s+Required reads\s*$([\s\S]*?)(?=^---\s*$|^##\s+|\Z)",
        text,
    )
    if required_match:
        for line in required_match.group(1).splitlines():
            checks += 1
            if re.match(r"^\s*\d+\.\s+", line) and "continuation." in line.lower():
                fail("CURRENT_REQUIRES_CONTINUATION", f"{relative}:{line.strip()}")


def audit_retired_json(relative: str) -> None:
    global checks
    path = require_file(relative)
    if not path:
        return
    data = read_json(relative)
    if not isinstance(data, dict):
        return

    checks += 1
    if data.get("status") != "RETIRED":
        fail("RETIRED_PATH_REACTIVATED", f"{relative}:status={data.get('status')}")

    checks += 1
    if data.get("authority") != "NONE":
        fail("RETIRED_PATH_HAS_AUTHORITY", f"{relative}:authority={data.get('authority')}")

    checks += 1
    if data.get("normal_read") is not False:
        fail("RETIRED_PATH_NORMAL_READ", relative)


def audit_absent_retired_path(relative: str) -> None:
    global checks
    checks += 1
    if (REPO / relative).exists():
        fail("RETIRED_PATH_REINTRODUCED", relative)


def walk_values(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield str(key)
            yield from walk_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_values(child)
    elif isinstance(value, str):
        yield value


def audit_manifest(relative: str) -> None:
    global checks
    path = require_file(relative)
    if not path:
        return
    data = read_json(relative)
    if data is None:
        return

    tokens = [token.lower() for token in walk_values(data)]
    checks += 1
    if any("continuation.json" in token for token in tokens):
        fail("MANIFEST_POINTS_TO_CONTINUATION", relative)

    checks += 1
    if any("acceptance-status.json" in token for token in tokens):
        fail("MANIFEST_POINTS_TO_RETIRED_ACCEPTANCE", relative)


def main() -> int:
    for path in CURRENT_PATHS:
        audit_current(path)

    for path in ACCEPTANCE_PATHS:
        require_file(path)

    for path in RETIRED_JSON_PATHS:
        audit_retired_json(path)

    for path in ABSENT_RETIRED_PATHS:
        audit_absent_retired_path(path)

    for path in MANIFEST_PATHS:
        audit_manifest(path)

    result = {
        "schema": "kianos.governance.current-audit.v1",
        "pass": not errors,
        "checks": checks,
        "current_files": len(CURRENT_PATHS),
        "acceptance_files": len(ACCEPTANCE_PATHS),
        "retired_paths": len(RETIRED_JSON_PATHS),
        "absent_retired_paths": len(ABSENT_RETIRED_PATHS),
        "manifests": len(MANIFEST_PATHS),
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
