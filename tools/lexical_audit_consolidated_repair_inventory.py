#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BATCH_DIR = ROOT / "content" / "lexical" / "audit" / "knowledge-reacceptance" / "batches"

PLACEHOLDER_PATTERNS = (
    re.compile(r"historical approved revision", re.I),
    re.compile(r"exact wording\s+(?:in|remains|is)\b", re.I),
    re.compile(r"exact semantic wording remains", re.I),
)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def round_checkpoint(round_number: int) -> Path:
    matches = sorted(BATCH_DIR.glob(f"r{round_number}-*-core-expansion-contrast.json"))
    if len(matches) != 1:
        raise RuntimeError(f"expected exactly one R{round_number} checkpoint, found {len(matches)}")
    return matches[0]


def nested_counts(cp: dict[str, Any]) -> dict[str, Any]:
    for container_name in ("historical_authority", "semantic_authority", "authority"):
        container = cp.get(container_name)
        if isinstance(container, dict) and isinstance(container.get("counts"), dict):
            return container["counts"]
    return {}


def first_int(mapping: dict[str, Any], keys: tuple[str, ...]) -> int | None:
    for key in keys:
        value = mapping.get(key)
        if isinstance(value, int):
            return value
    return None


def expected_core(cp: dict[str, Any]) -> int:
    counts = nested_counts(cp)
    value = first_int(counts, ("core", "core_revisions"))
    if value is not None:
        return value
    core = cp.get("core") or {}
    correct = first_int(core, ("current_correct",)) or 0
    defective = first_int(core, ("defective", "defective_or_upgrade_required")) or 0
    value = correct + defective
    if value <= 0:
        raise RuntimeError(f"cannot determine Core expected count for {cp.get('audit_id')}")
    return value


def expected_expansion(cp: dict[str, Any]) -> int:
    expansion = cp.get("expansion") or {}
    correct = first_int(expansion, ("current_correct",)) or 0
    partial = first_int(
        expansion,
        (
            "partial",
            "partial_or_presentation_gap",
            "partial_or_presentation_or_wrong_anchor",
            "presentation_only_gap",
        ),
    ) or 0
    missing = first_int(expansion, ("authority_missing_from_current", "full_gap", "missing")) or 0
    total = correct + partial + missing
    if total > 0:
        return total

    counts = nested_counts(cp)
    value = first_int(counts, ("mandatory_surface_groups", "expansion"))
    if value is not None:
        return value
    raise RuntimeError(f"cannot determine Expansion expected count for {cp.get('audit_id')}")


def expected_contrast(cp: dict[str, Any]) -> int:
    contrast = cp.get("contrast") or {}
    overall = contrast.get("overall")
    if isinstance(overall, dict):
        values = [overall.get(k) for k in ("current_correct", "complete", "partial", "missing")]
        total = sum(v for v in values if isinstance(v, int))
        # Avoid double-counting aliases such as complete + current_correct if both exist.
        if isinstance(overall.get("current_correct"), int) and isinstance(overall.get("complete"), int):
            total -= min(overall["current_correct"], overall["complete"])
        if total > 0:
            return total

    counts = nested_counts(cp)
    value = first_int(counts, ("contrast", "contrast_targets"))
    if value is not None:
        return value

    # Older checkpoints expose explicit ownership index sets without overall.
    indices: set[int] = set()
    def add_from(value: Any) -> None:
        if isinstance(value, list):
            indices.update(int(x) for x in value if isinstance(x, int))
        elif isinstance(value, dict):
            for child in value.values():
                add_from(child)
    add_from(contrast)
    if indices:
        return max(indices)
    raise RuntimeError(f"cannot determine Contrast expected count for {cp.get('audit_id')}")


def placeholder_rows(inventory: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for word in inventory.get("word_repairs") or []:
        for requirement in word.get("requirements") or []:
            target = requirement.get("target")
            if not isinstance(target, str) or not target.strip():
                rows.append({
                    "word_id": word.get("word_id"),
                    "ordinal": word.get("ordinal"),
                    "kind": requirement.get("kind"),
                    "target": target,
                    "reason": "EMPTY_TARGET",
                    "provenance": requirement.get("provenance"),
                })
                continue
            if any(rx.search(target) for rx in PLACEHOLDER_PATTERNS):
                rows.append({
                    "word_id": word.get("word_id"),
                    "ordinal": word.get("ordinal"),
                    "kind": requirement.get("kind"),
                    "target": target,
                    "reason": "SOURCE_LOCATOR_NOT_EXECUTABLE_TARGET",
                    "provenance": requirement.get("provenance"),
                })
    return rows


def checkpoint_mismatches(inventory: dict[str, Any]) -> list[dict[str, Any]]:
    provenance_by_round: dict[int, list[dict[str, Any]]] = {}
    for row in inventory.get("checkpoint_provenance") or []:
        rn = row.get("round")
        if isinstance(rn, int):
            provenance_by_round.setdefault(rn, []).append(row)

    mismatches: list[dict[str, Any]] = []
    for rn in range(14, 32):
        cp_path = round_checkpoint(rn)
        cp = load_json(cp_path)
        expected = {
            "core": expected_core(cp),
            "expansion": expected_expansion(cp),
            "contrast": expected_contrast(cp),
        }
        provenance_rows = provenance_by_round.get(rn) or []
        if len(provenance_rows) != 1:
            mismatches.append({
                "round": rn,
                "checkpoint": cp_path.relative_to(ROOT).as_posix(),
                "expected": expected,
                "observed": None,
                "reason": f"CHECKPOINT_PROVENANCE_CARDINALITY_{len(provenance_rows)}",
            })
            continue
        observed = provenance_rows[0].get("parsed_counts") or {}
        observed_normalized = {key: int(observed.get(key) or 0) for key in ("core", "expansion", "contrast")}
        if observed_normalized != expected:
            mismatches.append({
                "round": rn,
                "checkpoint": cp_path.relative_to(ROOT).as_posix(),
                "expected": expected,
                "observed": observed_normalized,
                "reason": "ROUND_PARSE_COUNT_MISMATCH",
            })
    return mismatches


def write_summary(path: Path, inventory: dict[str, Any]) -> None:
    audit = inventory["post_r31_inventory_audit"]
    summary = inventory.get("summary") or {}
    lines = [
        "# LexicalOS consolidated repair inventory — post-R31 audit",
        "",
        f"- Audit status: **{audit['status']}**",
        f"- Compiler status before audit gate: `{audit['compiler_status_before_gate']}`",
        f"- Round parse mismatches: **{audit['round_parse_mismatch_count']}**",
        f"- Placeholder / non-executable targets: **{audit['placeholder_target_count']}**",
        f"- Unresolved ownership units: **{audit['unresolved_ownership_count']}**",
        f"- P0 Word owners: **{summary.get('p0_word_owners', 0)}**",
        f"- Word-owner repair units (provisional until gate PASS): **{summary.get('word_owner_repair_units', 0)}**",
        f"- Relation repair units (provisional until gate PASS): **{summary.get('relation_repair_units', 0)}**",
        f"- Word/Identity/Form units (provisional until gate PASS): **{summary.get('word_identity_form_repair_units', 0)}**",
        "",
    ]
    if audit["round_parse_mismatches"]:
        lines.extend(["## Round count mismatches", ""])
        for row in audit["round_parse_mismatches"]:
            lines.append(
                f"- R{row['round']}: expected `{row['expected']}`, observed `{row['observed']}` — {row['reason']}"
            )
        lines.append("")
    if audit["placeholder_targets"]:
        by_checkpoint = Counter()
        for row in audit["placeholder_targets"]:
            prov = row.get("provenance") or {}
            by_checkpoint[prov.get("checkpoint") or "UNKNOWN"] += 1
        lines.extend(["## Exact-target materialization debt", ""])
        for checkpoint, count in sorted(by_checkpoint.items()):
            lines.append(f"- `{checkpoint}`: **{count}** placeholder target(s)")
        lines.append("")
    lines.append(
        "Gate rule: inventory may enter bounded repair only when round counts close exactly, ownership unresolved = 0, and every retained repair requirement contains an executable latest approved target rather than a historical locator."
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("inventory")
    parser.add_argument("--summary", required=True)
    args = parser.parse_args()

    path = Path(args.inventory)
    inventory = load_json(path)
    before = inventory.get("status")
    mismatches = checkpoint_mismatches(inventory)
    placeholders = placeholder_rows(inventory)
    unresolved = inventory.get("unresolved_ownership") or []

    blocked = bool(mismatches or placeholders or unresolved)
    gate_status = "BLOCKED_POST_R31_INVENTORY_AUDIT" if blocked else "PASS_POST_R31_INVENTORY_AUDIT"
    inventory["post_r31_inventory_audit"] = {
        "status": gate_status,
        "compiler_status_before_gate": before,
        "round_parse_mismatch_count": len(mismatches),
        "round_parse_mismatches": mismatches,
        "placeholder_target_count": len(placeholders),
        "placeholder_targets": placeholders,
        "unresolved_ownership_count": len(unresolved),
        "semantic_mutation": 0,
        "learner_state_mutation": 0,
        "pass_condition": "round counts exact AND unresolved ownership = 0 AND placeholder target count = 0",
    }
    inventory["status"] = gate_status
    path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_summary(Path(args.summary), inventory)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
