#!/usr/bin/env python3
"""Promote explicitly ACCEPTed parsed External Reading packages into Active Source.

This tool applies an already-completed semantic source-quality review. It does not
make the quality decision itself and never promotes HOLD/REJECT items.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

REVIEW_SCHEMA = "kian.external-source-quality-review-batch.v1"
REGISTRY_SCHEMA = "kian.external.incremental-registry.v1"
PARSED_META_SCHEMA = "kian.external-source-package-parsed.v1"

ALLOWED_ACCEPT = {
    "authenticity": {"A_AUTHORITY_OR_ORIGINAL", "B_RELIABLE_SECONDARY"},
    "completeness": {"COMPLETE", "COMPLETE_WITH_NONESSENTIAL_OMISSIONS"},
    "text_integrity": {"CLEAN", "MINOR_BOUNDED_NOISE"},
    "provenance": {"BOUND"},
    "visual_dependency": {"NONE", "PRESENT_AND_PRESERVED"},
    "duplicate_relation": {"UNIQUE"},
}


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except Exception as error:
        raise SystemExit(f"invalid JSON: {path}: {error}") from error
    if not isinstance(value, dict):
        raise SystemExit(f"JSON object required: {path}")
    return value


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_accept_quality(source_id: str, review: dict) -> None:
    quality = review.get("quality")
    if not isinstance(quality, dict):
        raise SystemExit(f"{source_id}: ACCEPT review quality object required")
    for key, allowed in ALLOWED_ACCEPT.items():
        value = str(quality.get(key) or "").strip()
        if value not in allowed:
            raise SystemExit(f"{source_id}: ACCEPT quality invalid for {key}: {value!r}")


def validate_optional_question_assets(package_dir: Path, source_id: str) -> tuple[Path | None, Path | None]:
    question_path = package_dir / "questions.json"
    answer_path = package_dir / "answers.json"

    if answer_path.exists() and not question_path.exists():
        raise SystemExit(f"{source_id}: answers.json requires questions.json")

    if question_path.exists():
        payload = load_json(question_path)
        if payload.get("schema") != "kian.external.incremental-questions.v1":
            raise SystemExit(f"{source_id}: questions schema invalid")
        rows = payload.get("questions")
        if not isinstance(rows, list) or not rows:
            raise SystemExit(f"{source_id}: questions list required")
        ordinals = set()
        for index, row in enumerate(rows, 1):
            if not isinstance(row, dict):
                raise SystemExit(f"{source_id}: question {index} must be object")
            ordinal = int(row.get("ordinal") or index)
            if ordinal < 1 or ordinal in ordinals:
                raise SystemExit(f"{source_id}: duplicate/invalid question ordinal {ordinal}")
            ordinals.add(ordinal)
    else:
        ordinals = set()

    if answer_path.exists():
        payload = load_json(answer_path)
        if payload.get("schema") != "kian.external.incremental-answers.v1":
            raise SystemExit(f"{source_id}: answers schema invalid")
        answers = payload.get("answers")
        if not isinstance(answers, dict):
            raise SystemExit(f"{source_id}: answers object required")
        for key in answers:
            ordinal = int(key)
            if ordinal not in ordinals:
                raise SystemExit(f"{source_id}: answer for unknown ordinal {ordinal}")

    return (question_path if question_path.exists() else None, answer_path if answer_path.exists() else None)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--parsed-root", type=Path, required=True)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--registry", type=Path, default=None)
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()

    parsed_root = args.parsed_root.expanduser().resolve()
    review_path = args.review.expanduser().resolve()
    source_root = args.source_root.expanduser().resolve()
    registry_path = (
        args.registry.expanduser().resolve()
        if args.registry
        else source_root / "INCREMENTAL" / "registry.json"
    )
    report_path = args.report.expanduser().resolve()

    if not parsed_root.is_dir():
        raise SystemExit(f"parsed root missing: {parsed_root}")
    if not review_path.is_file():
        raise SystemExit(f"review missing: {review_path}")
    source_root.mkdir(parents=True, exist_ok=True)
    incremental_root = source_root / "INCREMENTAL"
    packages_root = incremental_root / "packages"
    packages_root.mkdir(parents=True, exist_ok=True)
    registry_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    review_payload = load_json(review_path)
    if review_payload.get("schema") != REVIEW_SCHEMA:
        raise SystemExit("source-quality review schema invalid")
    decisions = review_payload.get("decisions")
    if not isinstance(decisions, list):
        raise SystemExit("source-quality review decisions list required")

    if registry_path.exists():
        registry = load_json(registry_path)
        if registry.get("schema") != REGISTRY_SCHEMA or not isinstance(registry.get("objects"), list):
            raise SystemExit("incremental registry invalid")
    else:
        registry = {"schema": REGISTRY_SCHEMA, "objects": []}

    registry_by_id = {
        str(row.get("object_id") or ""): row
        for row in registry["objects"]
        if isinstance(row, dict) and str(row.get("object_id") or "").strip()
    }

    report_items: list[dict] = []
    promoted = 0
    skipped = 0

    for decision in decisions:
        if not isinstance(decision, dict):
            raise SystemExit("review decision must be object")
        source_id = str(decision.get("source_id") or "").strip()
        verdict = str(decision.get("decision") or "").strip().upper()
        if not source_id or verdict not in {"ACCEPT", "HOLD", "REJECT"}:
            raise SystemExit(f"review decision invalid: {decision!r}")

        if verdict != "ACCEPT":
            report_items.append({"source_id": source_id, "decision": verdict, "status": "NOT_PROMOTED"})
            skipped += 1
            continue

        ensure_accept_quality(source_id, decision)

        package_dir = parsed_root / source_id
        meta_path = package_dir / "meta.json"
        article_path = package_dir / "normalized" / "article.md"
        raw_package_path = package_dir / "raw" / "source_package.md"

        if not meta_path.is_file() or not article_path.is_file() or not raw_package_path.is_file():
            raise SystemExit(f"{source_id}: parsed package incomplete")

        meta = load_json(meta_path)
        if meta.get("schema") != PARSED_META_SCHEMA:
            raise SystemExit(f"{source_id}: parsed meta schema invalid")
        if str(meta.get("source_id") or "") != source_id:
            raise SystemExit(f"{source_id}: parsed meta source_id mismatch")
        if str((meta.get("intake") or {}).get("status") or "") != "PARSED_NOT_ADMITTED":
            raise SystemExit(f"{source_id}: parsed package already has unexpected intake status")
        precheck = str((meta.get("intake") or {}).get("precheck") or "")
        if precheck == "HOLD_INCOMPLETE_OR_UNCERTAIN_SOURCE":
            raise SystemExit(f"{source_id}: cannot ACCEPT parser-HOLD bytes; repair/re-extract first")

        expected_article_sha = str((meta.get("normalized_article") or {}).get("sha256") or "")
        expected_raw_sha = str((meta.get("raw_package") or {}).get("sha256") or "")
        if sha256(article_path) != expected_article_sha or sha256(raw_package_path) != expected_raw_sha:
            raise SystemExit(f"{source_id}: parsed package hash mismatch")

        question_path, answer_path = validate_optional_question_assets(package_dir, source_id)

        target_dir = packages_root / source_id
        if target_dir.exists():
            target_meta = target_dir / "meta.json"
            if not target_meta.is_file():
                raise SystemExit(f"{source_id}: existing Active package collision")
            existing_meta = load_json(target_meta)
            existing_article_sha = str((existing_meta.get("normalized_article") or {}).get("sha256") or "")
            if existing_article_sha != expected_article_sha:
                raise SystemExit(f"{source_id}: existing Active package has different article bytes")
            copy_status = "ALREADY_ACTIVE_SAME_BYTES"
        else:
            shutil.copytree(package_dir, target_dir)
            copy_status = "COPIED_TO_ACTIVE_SOURCE"

        runtime = decision.get("runtime") if isinstance(decision.get("runtime"), dict) else {}
        relative_base = f"INCREMENTAL/packages/{source_id}"
        row = {
            "object_id": source_id,
            "source_family": str(runtime.get("source_family") or "FUTURE_INCREMENTAL"),
            "source_format": str(runtime.get("source_format") or "SOURCE_PACKAGE_MARKDOWN"),
            "practice_role": str(runtime.get("practice_role") or "READING_GROWTH"),
            "collection": str(runtime.get("collection") or meta.get("publication") or "External Reading"),
            "title": str(runtime.get("title") or meta.get("title") or source_id),
            "source_path": f"{relative_base}/normalized/article.md",
            "source_url": str(runtime.get("source_url") or meta.get("original_url") or ""),
            "completion_requirement": str(runtime.get("completion_requirement") or "READ_ONLY_OK"),
            "warnings": list(runtime.get("warnings") or []),
        }
        for optional in ("test", "passage_number"):
            if runtime.get(optional) is not None:
                row[optional] = runtime[optional]
        if question_path is not None:
            row["questions_path"] = f"{relative_base}/questions.json"
        if answer_path is not None:
            row["answers_path"] = f"{relative_base}/answers.json"

        existing_row = registry_by_id.get(source_id)
        if existing_row is not None and existing_row != row:
            raise SystemExit(f"{source_id}: registry collision with different metadata")
        if existing_row is None:
            registry["objects"].append(row)
            registry_by_id[source_id] = row

        report_items.append({
            "source_id": source_id,
            "decision": "ACCEPT",
            "status": copy_status,
            "registry_status": "PRESENT",
            "article_sha256": expected_article_sha,
            "raw_package_sha256": expected_raw_sha,
        })
        promoted += 1

    registry["objects"] = sorted(registry["objects"], key=lambda row: str(row.get("object_id") or ""))
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "kian.external-reviewed-source-promotion-report.v1",
        "review_path": str(review_path),
        "parsed_root": str(parsed_root),
        "source_root": str(source_root),
        "registry_path": str(registry_path),
        "promoted": promoted,
        "not_promoted": skipped,
        "items": report_items,
        "next_step": "RUN_INCREMENTAL_MANIFEST_BUILDER_THEN_REGISTER_PUBLIC_MANIFEST_SHA",
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
