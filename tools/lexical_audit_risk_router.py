#!/usr/bin/env python3
"""Generate a deterministic, non-semantic Lexical audit risk manifest.

This tool only computes a machine minimum audit floor from Current Natural
Owners, their declared dependencies, and bounded production operation labels.
It never edits lexical content and never emits an audit verdict.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
ROUTER_VERSION = "v1"

FLAGS = (
    "PRODUCTION_UPGRADE",
    "MULTI_ACTIVE_SENSE",
    "MULTI_POS",
    "HAS_CONSTRUCTION",
    "HAS_CONFUSABLE_OR_CONTRAST",
    "HAS_WORD_FAMILY_OR_RELATION",
    "HAS_RELATION_REF",
    "HAS_REFERENCE_OR_DEPRECATED_IDENTITY",
    "CORE_NONEMPTY_ACTIVE_EMPTY",
    "CORE_ACTIVE_MISMATCH_SENTINEL",
    "ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL",
    "FORM_CASE_SENTINEL",
    "FORM_SPELLING_SENTINEL",
    "FORM_PRONUNCIATION_SENTINEL",
    "PRODUCTION_PATTERN_SENTINEL",
    "OWNERSHIP_OR_IDENTITY_SENTINEL",
)
FLAG_SET = set(FLAGS)

FAMILIES = {
    "PRODUCTION_UPGRADE": "production_delta",
    "MULTI_ACTIVE_SENSE": "polysemy",
    "MULTI_POS": "polysemy",
    "HAS_CONSTRUCTION": "construction",
    "HAS_CONFUSABLE_OR_CONTRAST": "relation",
    "HAS_WORD_FAMILY_OR_RELATION": "relation",
    "HAS_RELATION_REF": "relation",
    "HAS_REFERENCE_OR_DEPRECATED_IDENTITY": "identity",
    "CORE_NONEMPTY_ACTIVE_EMPTY": "core_active_integrity",
    "CORE_ACTIVE_MISMATCH_SENTINEL": "core_active_integrity",
    "ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL": "core_active_integrity",
    "FORM_CASE_SENTINEL": "form_identity",
    "FORM_SPELLING_SENTINEL": "form_identity",
    "FORM_PRONUNCIATION_SENTINEL": "form_identity",
    "PRODUCTION_PATTERN_SENTINEL": "production_pattern",
    "OWNERSHIP_OR_IDENTITY_SENTINEL": "ownership_identity",
}

COMPLEX_FLAGS = FLAG_SET
FORM_FLAGS = {
    "FORM_CASE_SENTINEL",
    "FORM_SPELLING_SENTINEL",
    "FORM_PRONUNCIATION_SENTINEL",
}
RELATION_FLAGS = {
    "HAS_CONFUSABLE_OR_CONTRAST",
    "HAS_WORD_FAMILY_OR_RELATION",
    "HAS_RELATION_REF",
    "CORE_NONEMPTY_ACTIVE_EMPTY",
    "CORE_ACTIVE_MISMATCH_SENTINEL",
    "ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL",
}

DECISION_RE = re.compile(
    r"^- o(?P<ordinal>\d{4}) \*\*(?P<word>[^*]+)\*\* — `(?P<operation>NO_CHANGE|UPGRADE)` — `(?P<quality>[^`]+)`\."
)

CONTRACT_PATHS = {
    "content_contract_blob_sha": ROOT / "content/lexical/CONTENT_ASSET_CONTRACT.md",
    "audit_contract_blob_sha": ROOT / "content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md",
    "router_spec_blob_sha": ROOT / "content/lexical/SEMANTIC_AUDIT_RISK_ROUTER_SPEC.md",
}


class RouterError(ValueError):
    pass


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    try:
        return sha256_bytes(path.read_bytes())
    except OSError as exc:
        raise RouterError(f"DEPENDENCY_READ_FAILED:{path.relative_to(ROOT)}:{exc}") from exc


def relpath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RouterError(f"JSON_READ_FAILED:{relpath(path)}:{exc}") from exc


def git_head() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise RouterError(f"SOURCE_HEAD_UNAVAILABLE:{exc}") from exc
    head = result.stdout.strip()
    if not re.fullmatch(r"[0-9a-f]{40}", head):
        raise RouterError(f"SOURCE_HEAD_INVALID:{head}")
    return head


def nonempty(value: Any) -> bool:
    return value not in (None, "", [], {}, "no_valid_content")


def recursive_items(value: Any) -> Iterable[tuple[str, Any]]:
    if isinstance(value, dict):
        for key, child in value.items():
            yield key, child
            yield from recursive_items(child)
    elif isinstance(value, list):
        for child in value:
            yield from recursive_items(child)


def explicit_form_markers(record: dict[str, Any]) -> tuple[bool, bool, bool]:
    case = False
    spelling = False
    pronunciation = False
    spelling_keys = {
        "form_variants",
        "spelling",
        "spelling_variant",
        "spelling_variants",
        "regional_spelling",
        "surface_form",
        "surface_forms",
    }
    for key, value in recursive_items(record):
        lower = key.lower()
        if lower in {"case_sensitive_identity", "case_sensitive"} and value is True:
            case = True
        if lower in {"lexical_identity_id", "identity_type"} and nonempty(value):
            case = case or (lower == "identity_type" and any(token in str(value).lower() for token in ("proper", "capital", "acronym")))
        if lower in spelling_keys and nonempty(value):
            spelling = True
        if lower in {"pronunciation", "pronunciation_note", "pronunciations", "stress_pattern"} and nonempty(value):
            pronunciation = True
    return case, spelling, pronunciation


def parse_handoff(path: Path, start: int, end: int) -> dict[int, dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    decisions: dict[int, dict[str, Any]] = {}
    current: dict[str, Any] | None = None
    for line in text.splitlines():
        if line.startswith("## Independent audit handoff"):
            break
        match = DECISION_RE.match(line)
        if match:
            ordinal = int(match.group("ordinal"))
            if ordinal in decisions:
                raise RouterError(f"HANDOFF_DUPLICATE_ORDINAL:o{ordinal:04d}")
            current = {
                "ordinal": ordinal,
                "word": match.group("word").strip(),
                "operation": match.group("operation"),
                "quality": match.group("quality"),
                "body": [],
            }
            decisions[ordinal] = current
            continue
        if current is not None:
            current["body"].append(line)
    expected = set(range(start, end + 1))
    actual = set(decisions)
    if actual != expected:
        missing = sorted(expected - actual)
        extra = sorted(actual - expected)
        raise RouterError(f"HANDOFF_SCOPE_MISMATCH:missing={missing}:extra={extra}")
    return decisions


def validate_owner(owner: Any, ordinal: int, path: Path) -> dict[str, Any]:
    if not isinstance(owner, dict) or owner.get("schema") != "kianos.lexical.word_owner.v1":
        raise RouterError(f"OWNER_SCHEMA_INVALID:o{ordinal:04d}:{relpath(path)}")
    if owner.get("ordinal") != ordinal:
        raise RouterError(f"OWNER_ORDINAL_INVALID:o{ordinal:04d}:{owner.get('ordinal')}")
    if not isinstance(owner.get("word_id"), str) or not owner["word_id"]:
        raise RouterError(f"OWNER_WORD_ID_INVALID:o{ordinal:04d}")
    if not isinstance(owner.get("word"), str) or not owner["word"]:
        raise RouterError(f"OWNER_WORD_INVALID:o{ordinal:04d}")
    record = owner.get("record")
    if not isinstance(record, dict) or not isinstance(record.get("content_hash"), str):
        raise RouterError(f"OWNER_RECORD_INVALID:o{ordinal:04d}")
    if not isinstance(record.get("senses", []), list):
        raise RouterError(f"OWNER_SENSES_INVALID:o{ordinal:04d}")
    return owner


def dependency_paths(owner: dict[str, Any]) -> list[str]:
    paths: set[str] = set()
    for item in owner.get("relation_refs", []) or []:
        if isinstance(item, dict) and isinstance(item.get("owner_path"), str):
            paths.add(item["owner_path"])
    for key in ("reference_senses", "identity_refs", "lookup_refs"):
        value = owner.get(key)
        for nested_key, nested_value in recursive_items(value):
            if nested_key in {"source_path", "source"} and isinstance(nested_value, str):
                if nested_value.startswith("content/"):
                    paths.add(nested_value)
    provenance = owner.get("provenance", {})
    if isinstance(provenance, dict) and isinstance(provenance.get("source_word_shard"), str):
        paths.add(provenance["source_word_shard"])
    return sorted(paths)


def dependency_data(owner: dict[str, Any]) -> tuple[list[dict[str, str]], str]:
    rows: list[dict[str, str]] = []
    for relative in dependency_paths(owner):
        path = ROOT / relative
        if not path.is_file():
            raise RouterError(f"DEPENDENCY_PATH_INVALID:{relative}")
        rows.append({"path": relative, "sha256": sha256_file(path)})
    return rows, sha256_bytes(stable_json(rows).encode("utf-8"))


def route_flags(owner: dict[str, Any], decision: dict[str, Any]) -> list[str]:
    record = owner["record"]
    senses = record.get("senses", [])
    active_ids = [s.get("sense_id") for s in senses if isinstance(s, dict) and isinstance(s.get("sense_id"), str)]
    positions = {s.get("pos") for s in senses if isinstance(s, dict) and nonempty(s.get("pos"))}
    core = record.get("core_concept", {})
    clusters = core.get("core_clusters", []) if isinstance(core, dict) else []
    core_ids = [
        sense_id
        for cluster in clusters
        if isinstance(cluster, dict)
        for sense_id in (cluster.get("sense_ids", []) or [])
        if isinstance(sense_id, str)
    ]
    core_nonempty = bool(clusters) or any(isinstance(core, dict) and nonempty(core.get(key)) for key in ("core_meaning_cn", "core_meaning_en", "mental_model_cn", "mental_model_en"))
    refs = owner.get("reference_senses", []) or []
    identity_senses = (owner.get("identity_refs", {}) or {}).get("senses", []) if isinstance(owner.get("identity_refs", {}), dict) else []
    deprecated_identity = any(isinstance(item, dict) and (item.get("status") != "active" or item.get("merged_into_sense_id")) for item in identity_senses)
    body = "\n".join(decision.get("body", []))
    flags: set[str] = set()

    if decision["operation"] == "UPGRADE":
        flags.add("PRODUCTION_UPGRADE")
    if len(active_ids) > 1:
        flags.add("MULTI_ACTIVE_SENSE")
    if len(positions) > 1:
        flags.add("MULTI_POS")
    if nonempty(record.get("constructions")):
        flags.add("HAS_CONSTRUCTION")
    if nonempty(record.get("confusables")) or nonempty(record.get("semantic_neighbors")):
        flags.add("HAS_CONFUSABLE_OR_CONTRAST")
    if nonempty(record.get("word_family")) or nonempty(record.get("semantic_neighbors")) or nonempty(record.get("confusables")):
        flags.add("HAS_WORD_FAMILY_OR_RELATION")
    if nonempty(owner.get("relation_refs")):
        flags.add("HAS_RELATION_REF")
    if refs or deprecated_identity:
        flags.add("HAS_REFERENCE_OR_DEPRECATED_IDENTITY")
    if not active_ids and core_nonempty:
        flags.add("CORE_NONEMPTY_ACTIVE_EMPTY")
    # The machine can prove an orphan/duplicate Core reference, but cannot
    # prove that every active sense belongs in Core without semantic judgment.
    if core_ids and (not set(core_ids).issubset(set(active_ids)) or len(core_ids) != len(set(core_ids))):
        flags.add("CORE_ACTIVE_MISMATCH_SENTINEL")
    if not active_ids and refs:
        flags.add("ORDINARY_BRANCH_REFERENCE_ONLY_SENTINEL")

    case, spelling, pronunciation = explicit_form_markers(record)
    handoff_case = bool(re.search(r"capitalization|case-sensitive|capitalized proper|capitalized named|proper-name|case boundary", body, re.I))
    handoff_spelling = bool(re.search(r"spelling(?:[- ]variant)?|colour|color|cozy|cosy|cigaret", body, re.I))
    handoff_pronunciation = bool(re.search(r"pronunciation|heteronym|stress boundary|stress information", body, re.I))
    if case or handoff_case:
        flags.add("FORM_CASE_SENTINEL")
    if spelling or handoff_spelling:
        flags.add("FORM_SPELLING_SENTINEL")
    if pronunciation or handoff_pronunciation:
        flags.add("FORM_PRONUNCIATION_SENTINEL")

    pattern_in_owner = bool(re.search(r"\+\s*(?:sth|object|something)\b", json.dumps(record, ensure_ascii=False)))
    handoff_pattern = bool(re.search(r"production (?:pattern|string)|production-safe|production:\s*|\+\s*sth", body, re.I))
    if pattern_in_owner or handoff_pattern:
        flags.add("PRODUCTION_PATTERN_SENTINEL")

    handoff_identity = bool(re.search(r"identity|ownership|stable sense|stable branch|re-anchor|reanchor|word-family|reciprocal|anchor", body, re.I))
    if handoff_identity or deprecated_identity or case or spelling or pronunciation or nonempty(owner.get("relation_refs")):
        flags.add("OWNERSHIP_OR_IDENTITY_SENTINEL")

    return [flag for flag in FLAGS if flag in flags]


def mandatory_strata(operation: str, flags: list[str], machine_depth: str) -> list[str]:
    result: list[str] = []
    if operation == "UPGRADE":
        result.append("PRODUCTION_UPGRADE")
    if any(flag in FORM_FLAGS for flag in flags):
        result.append("FORM_IDENTITY")
    if any(flag in RELATION_FLAGS for flag in flags):
        result.append("RELATION_ANCHOR_CORE_SENSE")
    if operation == "NO_CHANGE" and machine_depth == "AUDIT_COMPLEX":
        result.append("COMPLEX_NO_CHANGE")
    if operation == "NO_CHANGE" and machine_depth == "AUDIT_SIMPLE_CANDIDATE":
        result.append("SIMPLE_NO_CHANGE_CANDIDATE")
    return result


def sample_ordinals(simple_rows: list[dict[str, Any]]) -> list[int]:
    ordinals = [row["ordinal"] for row in simple_rows]
    count = len(ordinals)
    if count == 0:
        return []
    target = min(count, max(10, math.ceil(count * 0.10)), 40)
    if target == count:
        return ordinals
    if target == 1:
        return [ordinals[0]]
    indices = [int((index * (count - 1) / (target - 1)) + 0.5) for index in range(target)]
    selected = []
    for index in indices:
        if not selected or index > selected[-1]:
            selected.append(index)
    while len(selected) < target:
        for index in range(count):
            if index not in selected:
                selected.append(index)
                if len(selected) == target:
                    break
    selected.sort()
    return [ordinals[index] for index in selected]


def validate_manifest(manifest: dict[str, Any], start: int, end: int) -> None:
    rows = manifest.get("rows")
    if not isinstance(rows, list):
        raise RouterError("MANIFEST_ROWS_INVALID")
    expected = list(range(start, end + 1))
    actual = [row.get("ordinal") for row in rows if isinstance(row, dict)]
    if actual != expected or len(actual) != len(set(actual)):
        raise RouterError("MANIFEST_ORDINAL_COVERAGE_INVALID")
    for row in rows:
        if set(row.get("risk_flags", [])) - FLAG_SET:
            raise RouterError(f"MANIFEST_UNKNOWN_FLAG:o{row.get('ordinal')}")
        if row.get("machine_min_depth") not in {"AUDIT_SIMPLE_CANDIDATE", "AUDIT_COMPLEX"}:
            raise RouterError(f"MANIFEST_DEPTH_INVALID:o{row.get('ordinal')}")
        if row.get("machine_min_depth") == "AUDIT_COMPLEX" and not row.get("risk_flags"):
            raise RouterError(f"MANIFEST_COMPLEX_WITHOUT_FLAG:o{row.get('ordinal')}")
        expected_families = sorted({FAMILIES[flag] for flag in row.get("risk_flags", [])})
        if row.get("risk_families") != expected_families:
            raise RouterError(f"MANIFEST_FAMILY_DERIVATION_INVALID:o{row.get('ordinal')}")


def generate(args: argparse.Namespace) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    start, end = args.start, args.end
    if start < 1 or end < start:
        raise RouterError("SCOPE_INVALID")
    handoff_path = (ROOT / args.semantic_handoff).resolve()
    if not handoff_path.is_file() or ROOT not in handoff_path.parents:
        raise RouterError("HANDOFF_PATH_INVALID")
    decisions = parse_handoff(handoff_path, start, end)
    source_head = git_head()
    contract_shas = {key: sha256_file(path) for key, path in CONTRACT_PATHS.items()}
    handoff_sha = sha256_file(handoff_path)
    rows: list[dict[str, Any]] = []
    for ordinal in range(start, end + 1):
        owner_path = ROOT / "content/lexical/words/by-ordinal" / f"o{ordinal:04d}.json"
        owner = validate_owner(load_json(owner_path), ordinal, owner_path)
        decision = decisions[ordinal]
        if decision["word"] != owner["word"]:
            raise RouterError(f"HANDOFF_OWNER_WORD_MISMATCH:o{ordinal:04d}:{decision['word']}!={owner['word']}")
        flags = route_flags(owner, decision)
        families = sorted({FAMILIES[flag] for flag in flags})
        depth = "AUDIT_COMPLEX" if flags else "AUDIT_SIMPLE_CANDIDATE"
        dependency_hash_list, dependency_fingerprint = dependency_data(owner)
        rows.append({
            "ordinal": ordinal,
            "word_id": owner["word_id"],
            "word": owner["word"],
            "production_operation": decision["operation"],
            "production_quality": decision["quality"],
            "risk_flags": flags,
            "risk_families": families,
            "machine_min_depth": depth,
            "mandatory_strata": mandatory_strata(decision["operation"], flags, depth),
            "owner_hash": sha256_file(owner_path),
            "dependency_hashes": dependency_hash_list,
            "dependency_fingerprint": dependency_fingerprint,
            "source_head": source_head,
            "router_version": ROUTER_VERSION,
            "router_spec_blob_sha": contract_shas["router_spec_blob_sha"],
        })
    flag_counts = dict(sorted(Counter(flag for row in rows for flag in row["risk_flags"]).items()))
    family_counts = dict(sorted(Counter(family for row in rows for family in row["risk_families"]).items()))
    mandatory_rows = [row for row in rows if any(stratum != "SIMPLE_NO_CHANGE_CANDIDATE" for stratum in row["mandatory_strata"])]
    simple_rows = [row for row in rows if row["machine_min_depth"] == "AUDIT_SIMPLE_CANDIDATE"]
    selected = sample_ordinals(simple_rows)
    package = {
        "schema": "kianos.lexical.audit_risk_manifest.v1",
        "router_version": ROUTER_VERSION,
        "scope_start": start,
        "scope_end": end,
        "owner_count": len(rows),
        "unique_mandatory_owner_count": len({row["ordinal"] for row in mandatory_rows}),
        "flag_counts": flag_counts,
        "risk_family_counts": family_counts,
        "production_operation_counts": dict(sorted(Counter(row["production_operation"] for row in rows).items())),
        "source_head": source_head,
        "content_contract_blob_sha": contract_shas["content_contract_blob_sha"],
        "audit_contract_blob_sha": contract_shas["audit_contract_blob_sha"],
        "router_spec_blob_sha": contract_shas["router_spec_blob_sha"],
        "semantic_handoff": args.semantic_handoff,
        "semantic_handoff_blob_sha": handoff_sha,
        "rows": rows,
    }
    validate_manifest(package, start, end)
    blind = {
        "schema": "kianos.lexical.audit_risk_blind_projection.v1",
        "router_version": ROUTER_VERSION,
        "scope_start": start,
        "scope_end": end,
        "owner_count": len(rows),
        "unique_mandatory_owner_count": package["unique_mandatory_owner_count"],
        "source_head": source_head,
        "content_contract_blob_sha": package["content_contract_blob_sha"],
        "audit_contract_blob_sha": package["audit_contract_blob_sha"],
        "router_spec_blob_sha": package["router_spec_blob_sha"],
        "rows": [
            {key: row[key] for key in ("ordinal", "word_id", "word", "risk_flags", "risk_families", "machine_min_depth", "mandatory_strata", "owner_hash", "dependency_fingerprint", "source_head", "router_version", "router_spec_blob_sha")}
            for row in rows
        ],
    }
    sample = {
        "schema": "kianos.lexical.audit_risk_simple_sample.v1",
        "router_version": ROUTER_VERSION,
        "scope_start": start,
        "scope_end": end,
        "source_head": source_head,
        "simple_owner_count": len(simple_rows),
        "sample_target": min(len(simple_rows), max(10, math.ceil(len(simple_rows) * 0.10)), 40) if simple_rows else 0,
        "selected_ordinals": selected,
        "selection_rule": "sorted AUDIT_SIMPLE_CANDIDATE ordinal stratum; approximately even spacing; first and last included when non-empty",
        "contract_shas": contract_shas,
    }
    return package, blind, sample


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", type=int, required=True)
    parser.add_argument("--end", type=int, required=True)
    parser.add_argument("--semantic-handoff", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--blind-output")
    parser.add_argument("--sample-output")
    args = parser.parse_args()
    try:
        package, blind, sample = generate(args)
        output = ROOT / args.output
        blind_output = ROOT / args.blind_output if args.blind_output else None
        sample_output = ROOT / args.sample_output if args.sample_output else None
        for path in (output, blind_output, sample_output):
            if path is not None and ROOT not in path.resolve().parents:
                raise RouterError("OUTPUT_PATH_INVALID")
        write_json(output, package)
        if blind_output:
            write_json(blind_output, blind)
        if sample_output:
            write_json(sample_output, sample)
        print(json.dumps({
            "status": "PASS",
            "manifest": args.output,
            "blind_projection": args.blind_output,
            "simple_sample": args.sample_output,
            "owner_count": package["owner_count"],
            "unique_mandatory_owner_count": package["unique_mandatory_owner_count"],
            "machine_complex": sum(row["machine_min_depth"] == "AUDIT_COMPLEX" for row in package["rows"]),
            "machine_simple_candidates": sum(row["machine_min_depth"] == "AUDIT_SIMPLE_CANDIDATE" for row in package["rows"]),
            "simple_sample_count": len(sample["selected_ordinals"]),
            "source_head": package["source_head"],
        }, ensure_ascii=False, indent=2))
        return 0
    except RouterError as exc:
        print(json.dumps({"status": "FAIL", "error": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
