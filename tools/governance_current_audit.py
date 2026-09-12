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

CURRENT_PATHS = [
    "CURRENT.md",
    "content/english/CURRENT.md",
    "content/english/modules/objective/CURRENT.md",
    "content/english/modules/translation/CURRENT.md",
    "content/english/modules/writing/CURRENT.md",
    "content/xizong/CURRENT.md",
    "content/xizong/knowledge/systems/a1-circulation/CURRENT.md",
    "content/xizong/knowledge/systems/a2-respiratory/CURRENT.md",
    "content/lexical/CURRENT.md",
    "content/politics/CURRENT.md",
    "content/politics/learning/marxism/CURRENT.md",
    "content/politics/learning/history/CURRENT.md",
]

ACCEPTANCE_PATHS = [
    "GOVERNANCE_ACCEPTANCE.md",
    "content/english/modules/objective/ACCEPTANCE.md",
    "content/english/modules/translation/ACCEPTANCE.md",
    "content/english/modules/writing/ACCEPTANCE.md",
    "content/xizong/ACCEPTANCE.md",
    "content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md",
    "content/xizong/knowledge/systems/a2-respiratory/ACCEPTANCE.md",
    "content/lexical/ACCEPTANCE.md",
    "content/politics/ACCEPTANCE.md",
    "content/politics/learning/marxism/ACCEPTANCE.md",
    "content/politics/learning/history/ACCEPTANCE.md",
]

RETIRED_JSON_PATHS = [
    "content/english/continuation.json",
    "content/xizong/knowledge/learner/continuation.json",
    "content/xizong/knowledge/learner/acceptance-status.json",
    "content/lexical/continuation.json",
    "content/politics/continuation.json",
]

MANIFEST_PATHS = [
    "content/english/manifest.json",
    "content/xizong/knowledge/manifest.json",
    "content/lexical/manifest.json",
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
    checks += 1
    if "current" not in lowered or "work cursor" not in lowered:
        fail("CURRENT_ROLE_MISSING", relative)

    checks += 1
    if "next" not in lowered:
        fail("CURRENT_NEXT_ACTION_MISSING", relative)

    checks += 1
    if not any(token in lowered for token in ("learner truth", "private learner", "learner progress")):
        fail("CURRENT_LEARNER_BOUNDARY_MISSING", relative)

    for token in FORBIDDEN_CURRENT_TOKENS:
        checks += 1
        if token in text:
            fail("CURRENT_NARRATIVE_STATUS_LOG_TOKEN", f"{relative}:{token}")

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

    for path in MANIFEST_PATHS:
        audit_manifest(path)

    result = {
        "schema": "kianos.governance.current-audit.v1",
        "pass": not errors,
        "checks": checks,
        "current_files": len(CURRENT_PATHS),
        "acceptance_files": len(ACCEPTANCE_PATHS),
        "retired_paths": len(RETIRED_JSON_PATHS),
        "manifests": len(MANIFEST_PATHS),
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
