#!/usr/bin/env python3
from __future__ import annotations

import json
import re

import lexical_compile_consolidated_repair_inventory as compiler

OVERRIDE_PATH = compiler.ROOT / "content" / "lexical" / "audit" / "knowledge-reacceptance" / "post-r31-ownership-overrides.json"
OWNERSHIP_OVERRIDES = json.loads(OVERRIDE_PATH.read_text(encoding="utf-8"))
OVERRIDE_BY_TARGET = {row["target"]: row for row in OWNERSHIP_OVERRIDES.get("overrides") or []}


def legacy_source_comment_meta(checkpoint):
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


def local_authority_path(checkpoint):
    ap = compiler.authority_path(checkpoint)
    if ap:
        return ap
    historical = checkpoint.get("historical_authority") or {}
    normalized = historical.get("normalized_execution_comment") or {}
    lock_path = normalized.get("lock_path")
    if isinstance(lock_path, str) and lock_path:
        return lock_path
    return None


def parse_round_source_from_local_authority(checkpoint):
    historical = checkpoint.get("historical_authority") or {}
    normalized = historical.get("normalized_execution_comment") or {}

    if isinstance(normalized.get("comment_id"), int):
        body = compiler.triage.fetch_comment(
            normalized.get("repo") or "kianwang022-hash/kianos",
            normalized["comment_id"],
        )["body"]
    else:
        ap = local_authority_path(checkpoint)
        if not ap:
            raise RuntimeError(f"{checkpoint.get('audit_id')}: missing durable local authority path")
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


def resolve_owner(owner_id: str):
    wid, ordinal, word = compiler.owner_identity(owner_id, None)
    if not wid or ordinal is None:
        return None
    return {"word_id": wid, "ordinal": ordinal, "word": word}


_original_finalize = compiler.InventoryBuilder.finalize


def finalize_with_audited_ownership(self):
    remaining = []
    resolved_rows = []

    for row in self.unresolved:
        target = row.get("target")
        override = OVERRIDE_BY_TARGET.get(target)
        if not override:
            remaining.append(row)
            continue

        owners = []
        missing_owner_ids = []
        for owner_id in override.get("owner_word_ids") or []:
            resolved = resolve_owner(owner_id)
            if resolved:
                owners.append(resolved)
            else:
                missing_owner_ids.append(owner_id)

        if missing_owner_ids or not owners:
            remaining.append({
                **row,
                "override_attempted": True,
                "override_missing_current_owner_ids": missing_owner_ids or override.get("owner_word_ids") or [],
            })
            continue

        provenance = row.get("provenance") or {}
        owner_type = override.get("owner_type")
        classification = row.get("classification") or row.get("kind") or "POST_R31_OWNERSHIP_AUDIT"

        if owner_type == "WORD":
            if len(owners) != 1:
                remaining.append({**row, "override_attempted": True, "override_error": "WORD override must resolve exactly one owner"})
                continue
            owner = owners[0]
            self.add_word_requirement(
                owner["word_id"],
                ordinal=owner["ordinal"],
                word=owner["word"],
                kind="SURFACE",
                target=target,
                classification=classification,
                provenance=provenance,
            )
        elif owner_type == "WORD_IDENTITY_FORM":
            unresolved_form_key = "UNRESOLVED::" + compiler.norm(target)
            self.forms.pop(unresolved_form_key, None)
            self.add_form(
                target,
                [owner["word_id"] for owner in owners],
                provenance,
                "WORD_IDENTITY_FORM_GAP",
            )
        elif owner_type == "WORD_INTERNAL_POLYSEMY":
            if len(owners) != 1:
                remaining.append({**row, "override_attempted": True, "override_error": "WORD_INTERNAL_POLYSEMY override must resolve exactly one owner"})
                continue
            owner = owners[0]
            self.add_word_requirement(
                owner["word_id"],
                ordinal=owner["ordinal"],
                word=owner["word"],
                kind="WORD_INTERNAL_POLYSEMY",
                target=target,
                classification="SAME_WORD_POLYSEMY_GAP",
                provenance=provenance,
            )
        else:
            remaining.append({**row, "override_attempted": True, "override_error": f"unsupported override owner_type {owner_type}"})
            continue

        resolved_rows.append({
            "target": target,
            "owner_type": owner_type,
            "owner_word_ids": [owner["word_id"] for owner in owners],
            "reason": override.get("reason"),
            "provenance": provenance,
        })

    self.unresolved = remaining
    result = _original_finalize(self)
    result["post_r31_ownership_audit"] = {
        "authority": OVERRIDE_PATH.relative_to(compiler.ROOT).as_posix(),
        "override_count": len(OVERRIDE_BY_TARGET),
        "resolved_count": len(resolved_rows),
        "remaining_unresolved_count": len(remaining),
        "semantic_mutation": 0,
        "learner_state_mutation": 0,
        "resolved": resolved_rows,
    }
    return result


compiler.source_comment_meta = legacy_source_comment_meta
compiler.parse_round_source = parse_round_source_from_local_authority
compiler.InventoryBuilder.finalize = finalize_with_audited_ownership


if __name__ == "__main__":
    raise SystemExit(compiler.main())
