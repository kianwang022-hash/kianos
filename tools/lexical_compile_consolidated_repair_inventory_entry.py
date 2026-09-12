#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_compile_consolidated_repair_inventory as compiler


def legacy_source_comment_meta(checkpoint):
    """Return only the legacy locator; never reinterpret Current-repo metadata."""
    containers = [
        checkpoint.get("historical_authority") or {},
        checkpoint.get("semantic_authority") or {},
        checkpoint.get("authority") or {},
    ]
    for c in containers:
        for key in ("legacy_issue_comment_id", "legacy_comment_id", "source_comment_id"):
            value = c.get(key)
            if isinstance(value, int):
                return "kianwang022-hash/kianos-legacy", value
        historical = c.get("historical_comment")
        if isinstance(historical, str):
            m = re.search(r"comment\s+(\d+)", historical)
            if m:
                return "kianwang022-hash/kianos-legacy", int(m.group(1))

    historical = checkpoint.get("historical_authority") or {}
    value = historical.get("comment_id")
    if isinstance(value, int):
        return "kianwang022-hash/kianos-legacy", value
    return None


def parse_round_source_from_local_authority(checkpoint):
    """
    Compile from durable authority already checked into Current.

    R14-R26 frozen authorities carry exact historical semantic wording.
    R27-R31 compact execution authorities carry deterministic owner/surface
    structure and the legacy source locator. Their Core parser emits a source
    locator placeholder when exact wording remains in the private legacy
    comment; repair must resolve that locator before mutation rather than
    inventing wording.
    """
    ap = compiler.authority_path(checkpoint)
    if not ap:
        raise RuntimeError("round checkpoint missing durable local authority path")
    body = (compiler.ROOT / ap).read_text(encoding="utf-8")

    compiler.base.EXPANSION_OWNER_HINTS = {}
    compiler.base.EXPANSION_OWNER_TARGETS = []
    compiler.base.EXPANSION_DECLARED_COUNT = None

    core_rows = compiler.owner_surfaces.parse_core_compatible(body)
    expansion_rows = compiler.owner_surfaces.parse_simple_targets_compatible(
        body,
        "### Expansion Gate",
        ("### Contrast Gate", "### Existing", "### Mechanical", "### Apply", "Canonical Apply:"),
        "expansion",
    )
    contrast_rows = compiler.owner_surfaces.parse_simple_targets_compatible(
        body,
        "### Contrast Gate",
        ("### Existing", "### Mechanical", "### Apply", "Canonical Apply:", "Reuse rather than duplicate"),
        "contrast",
    )
    meta = legacy_source_comment_meta(checkpoint)
    comment_id = meta[1] if meta else None
    return body, comment_id, core_rows, expansion_rows, contrast_rows


compiler.source_comment_meta = legacy_source_comment_meta
compiler.parse_round_source = parse_round_source_from_local_authority


if __name__ == "__main__":
    raise SystemExit(compiler.main())
