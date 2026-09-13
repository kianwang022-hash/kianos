#!/usr/bin/env python3
from __future__ import annotations

import json
import re

import lexical_compile_consolidated_repair_inventory_entry as prior

compiler = prior.compiler
ROOT = compiler.ROOT
RESOLUTION_PATH = ROOT / "content" / "lexical" / "audit" / "knowledge-reacceptance" / "closure-a-r18-owner-resolutions.json"
RESOLUTIONS = json.loads(RESOLUTION_PATH.read_text(encoding="utf-8"))
RESOLUTION_BY_TARGET = {row["target"]: row for row in RESOLUTIONS.get("resolutions") or []}

_previous_finalize = compiler.InventoryBuilder.finalize
_PLACEHOLDER_RX = re.compile(
    r"historical approved revision|exact wording\s+(?:in|remains|is)\b|exact semantic wording remains",
    re.I,
)
_core_source_cache: dict[int, dict[str, dict]] = {}


def _resolve_owner_ids(owner_ids: list[str]) -> tuple[list[dict], list[str]]:
    resolved = []
    missing = []
    for owner_id in owner_ids:
        owner = prior.resolve_owner(owner_id)
        if owner:
            resolved.append(owner)
        else:
            missing.append(owner_id)
    return resolved, missing


def _exact_core_source_map(comment_id: int) -> dict[str, dict]:
    cached = _core_source_cache.get(comment_id)
    if cached is not None:
        return cached

    last_error = None
    body = None
    source_repo = None
    for repo in ("kianwang022-hash/kianos-legacy", "kianwang022-hash/kianos"):
        try:
            fetched = compiler.triage.fetch_comment(repo, comment_id)
            body = fetched.get("body")
            if body:
                source_repo = repo
                break
        except Exception as exc:  # fail closed below
            last_error = repr(exc)

    if not body:
        _core_source_cache[comment_id] = {"__error__": {"error": last_error or "SOURCE_COMMENT_UNAVAILABLE"}}
        return _core_source_cache[comment_id]

    rows = compiler.base.parse_core_compatible(body)
    if not rows:
        rows = compiler.owner_surfaces.parse_core_compatible(body)

    by_key: dict[str, dict] = {}
    for row in rows:
        exact = row.get("approved_revision") or row.get("approved_target")
        if not isinstance(exact, str) or not exact.strip() or _PLACEHOLDER_RX.search(exact):
            continue
        ordinal = row.get("ordinal")
        word_id = row.get("word_id")
        materialized = {
            "approved_revision": exact.strip(),
            "ordinal": ordinal,
            "word_id": word_id,
            "source_repo": source_repo,
            "source_comment_id": comment_id,
            "source_index": row.get("index"),
        }
        if isinstance(ordinal, int):
            by_key[f"ordinal:{ordinal}"] = materialized
        if isinstance(word_id, str) and word_id:
            by_key[f"word_id:{word_id}"] = materialized

    if not by_key:
        by_key["__error__"] = {"error": "NO_EXECUTABLE_CORE_REVISIONS_PARSED", "source_repo": source_repo}
    _core_source_cache[comment_id] = by_key
    return by_key


def _materialize_core_placeholders(result: dict) -> dict:
    materialized = []
    unresolved = []

    for word in result.get("word_repairs") or []:
        ordinal = word.get("ordinal")
        word_id = word.get("word_id")
        for requirement in word.get("requirements") or []:
            if requirement.get("kind") != "CORE":
                continue
            target = requirement.get("target")
            if not isinstance(target, str) or not _PLACEHOLDER_RX.search(target):
                continue

            provenance = requirement.get("provenance") or {}
            comment_id = provenance.get("historical_comment_id")
            if not isinstance(comment_id, int):
                unresolved.append({
                    "ordinal": ordinal,
                    "word_id": word_id,
                    "reason": "MISSING_HISTORICAL_COMMENT_ID",
                    "provenance": provenance,
                })
                continue

            source_map = _exact_core_source_map(comment_id)
            exact = None
            if isinstance(ordinal, int):
                exact = source_map.get(f"ordinal:{ordinal}")
            if exact is None and isinstance(word_id, str):
                exact = source_map.get(f"word_id:{word_id}")

            if not exact:
                unresolved.append({
                    "ordinal": ordinal,
                    "word_id": word_id,
                    "historical_comment_id": comment_id,
                    "reason": "EXACT_CORE_TARGET_NOT_MATERIALIZED",
                    "source_error": source_map.get("__error__"),
                    "provenance": provenance,
                })
                continue

            historical_locator = target
            requirement["historical_target_locator"] = historical_locator
            requirement["target"] = exact["approved_revision"]
            requirement["target_materialization"] = {
                "mode": "EXACT_HISTORICAL_SOURCE_READBACK",
                "source_repo": exact["source_repo"],
                "source_comment_id": exact["source_comment_id"],
                "source_index": exact.get("source_index"),
                "semantic_mutation": 0,
            }
            materialized.append({
                "ordinal": ordinal,
                "word_id": word_id,
                "source_repo": exact["source_repo"],
                "source_comment_id": exact["source_comment_id"],
                "source_index": exact.get("source_index"),
            })

    result["closure_a_core_target_materialization"] = {
        "materialized_count": len(materialized),
        "unresolved_count": len(unresolved),
        "source_comment_count": len(_core_source_cache),
        "semantic_mutation": 0,
        "learner_state_mutation": 0,
        "method": "Exact Core wording is reread from the provenance-linked historical source comment and matched by Current ordinal/word_id. No model-generated replacement is permitted here.",
        "unresolved": unresolved,
    }
    result.setdefault("summary", {})["core_placeholder_materialized"] = len(materialized)
    result["summary"]["core_placeholder_unresolved"] = len(unresolved)
    return result


def finalize_with_closure_a_owner_resolution(self):
    remaining = []
    resolved_rows = []
    family_units = []
    composite_units = []

    for row in self.unresolved:
        target = row.get("target")
        resolution = RESOLUTION_BY_TARGET.get(target)
        if not resolution:
            remaining.append(row)
            continue

        owners, missing = _resolve_owner_ids(resolution.get("owner_word_ids") or [])
        if missing or not owners:
            remaining.append({
                **row,
                "closure_a_resolution_attempted": True,
                "closure_a_missing_current_owner_ids": missing or resolution.get("owner_word_ids") or [],
            })
            continue

        rtype = resolution.get("resolution_type")
        provenance = row.get("provenance") or {}
        classification = row.get("classification") or row.get("kind") or "CLOSURE_A_OWNER_RECONCILIATION"

        if rtype == "WORD":
            if len(owners) != 1:
                remaining.append({**row, "closure_a_resolution_attempted": True, "closure_a_error": "WORD requires exactly one Current owner"})
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

        elif rtype == "WORD_FAMILY":
            family_units.append({
                "owner_type": "WORD_FAMILY_RECONCILIATION",
                "owner_word_ids": [o["word_id"] for o in owners],
                "target": target,
                "current_disposition": "NEEDS_LIVE_CURRENT_RECONCILIATION",
                "reason": resolution.get("reason"),
                "provenance": provenance,
            })

        elif rtype == "WORD_IDENTITY_FORM":
            unresolved_form_key = "UNRESOLVED::" + compiler.norm(target)
            self.forms.pop(unresolved_form_key, None)
            self.add_form(
                target,
                [o["word_id"] for o in owners],
                provenance,
                "WORD_IDENTITY_FORM_GAP",
            )

        elif rtype == "COMPOSITE_WORD_RELATION":
            word_owner = owners[0]
            word_target = resolution.get("word_target")
            relation_terms = resolution.get("relation_terms") or []
            relation_target = resolution.get("relation_target")
            if not word_target or len(relation_terms) < 2 or not relation_target:
                remaining.append({**row, "closure_a_resolution_attempted": True, "closure_a_error": "COMPOSITE requires word_target + relation_terms + relation_target"})
                continue
            self.add_word_requirement(
                word_owner["word_id"],
                ordinal=word_owner["ordinal"],
                word=word_owner["word"],
                kind="SURFACE",
                target=word_target,
                classification="LATEST_TARGET_SPLIT_FROM_GROUPED_R18_SURFACE",
                provenance=provenance,
                historical_target=target,
            )
            self.add_relation(
                relation_target,
                relation_terms,
                provenance,
                "LATEST_TARGET_SPLIT_FROM_GROUPED_R18_SURFACE",
            )
            composite_units.append({
                "historical_target": target,
                "word_owner_id": word_owner["word_id"],
                "word_target": word_target,
                "relation_terms": relation_terms,
                "relation_target": relation_target,
                "reason": resolution.get("reason"),
                "provenance": provenance,
            })

        else:
            remaining.append({**row, "closure_a_resolution_attempted": True, "closure_a_error": f"unsupported resolution_type {rtype}"})
            continue

        resolved_rows.append({
            "target": target,
            "resolution_type": rtype,
            "owner_word_ids": [o["word_id"] for o in owners],
            "reason": resolution.get("reason"),
            "provenance": provenance,
        })

    self.unresolved = remaining
    result = _previous_finalize(self)
    result["closure_a_r18_owner_resolution"] = {
        "authority": RESOLUTION_PATH.relative_to(ROOT).as_posix(),
        "declared_resolution_count": len(RESOLUTION_BY_TARGET),
        "resolved_count": len(resolved_rows),
        "remaining_unresolved_count": len(result.get("unresolved_ownership") or []),
        "semantic_mutation": 0,
        "learner_state_mutation": 0,
        "resolved": resolved_rows,
    }
    result["multi_owner_family_reconciliation_units"] = family_units
    result["composite_owner_reconciliation_units"] = composite_units
    result.setdefault("summary", {})["multi_owner_family_reconciliation_units"] = len(family_units)
    result["summary"]["composite_owner_reconciliation_units"] = len(composite_units)
    return _materialize_core_placeholders(result)


compiler.InventoryBuilder.finalize = finalize_with_closure_a_owner_resolution


if __name__ == "__main__":
    raise SystemExit(compiler.main())
