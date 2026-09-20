#!/usr/bin/env python3
"""Batch-parse External Reading archival Source Packages into pre-admission packages.

This tool performs transport/format prechecks and duplicate detection only.
It never performs source-quality admission, learning-value judgment, or runtime activation.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPORT_SCHEMA = "kian.external-source-batch-intake-report.v1"


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except Exception as error:
        raise SystemExit(f"invalid JSON: {path}: {error}") from error
    if not isinstance(value, dict):
        raise SystemExit(f"JSON object required: {path}")
    return value


def known_records(meta_root: Path | None) -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    by_raw: dict[str, str] = {}
    by_url: dict[str, str] = {}
    by_source_id: dict[str, str] = {}
    if meta_root is None or not meta_root.exists():
        return by_raw, by_url, by_source_id
    for path in meta_root.rglob("meta.json"):
        if not path.is_file():
            continue
        try:
            meta = load_json(path)
        except SystemExit:
            continue
        source_id = str(meta.get("source_id") or "").strip()
        raw_sha = str((meta.get("raw_package") or {}).get("sha256") or "").strip()
        url = str(meta.get("original_url") or "").strip()
        if raw_sha and source_id:
            by_raw.setdefault(raw_sha, source_id)
        if url and url.upper() != "UNKNOWN" and source_id:
            by_url.setdefault(url, source_id)
        if source_id:
            by_source_id.setdefault(source_id, str(path.parent))
    return by_raw, by_url, by_source_id


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inbox", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--known-meta-root", type=Path, default=None)
    args = parser.parse_args()

    inbox = args.inbox.expanduser().resolve()
    output_root = args.output_root.expanduser().resolve()
    report_path = args.report.expanduser().resolve()
    known_meta_root = args.known_meta_root.expanduser().resolve() if args.known_meta_root else None

    if not inbox.is_dir():
        raise SystemExit(f"inbox missing: {inbox}")
    output_root.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    parser_path = Path(__file__).with_name("parse_source_package.py")
    packages = sorted(path for path in inbox.rglob("*.md") if path.is_file())

    known_raw, known_url, known_ids = known_records(known_meta_root)
    seen_raw = dict(known_raw)
    seen_url = dict(known_url)
    seen_ids = dict(known_ids)

    items: list[dict] = []
    counts = {
        "total": len(packages),
        "ready_for_quality_review": 0,
        "ready_with_visual_check": 0,
        "hold": 0,
        "duplicate_exact": 0,
        "duplicate_url_variant": 0,
        "rejected_format": 0,
        "source_id_collision": 0,
    }

    for index, package in enumerate(packages, 1):
        temp_dir = output_root / f".batch-tmp-{index:04d}"
        shutil.rmtree(temp_dir, ignore_errors=True)

        run = subprocess.run(
            [
                sys.executable,
                str(parser_path),
                "--package",
                str(package),
                "--source-id",
                "auto",
                "--output-dir",
                str(temp_dir),
            ],
            text=True,
            capture_output=True,
        )
        if run.returncode != 0:
            counts["rejected_format"] += 1
            items.append({
                "input_path": str(package),
                "status": "REJECT_FORMAT",
                "error": (run.stderr or run.stdout or "Source Package parse failed").strip(),
            })
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        meta = load_json(temp_dir / "meta.json")
        source_id = str(meta.get("source_id") or "").strip()
        raw_sha = str((meta.get("raw_package") or {}).get("sha256") or "").strip()
        article_sha = str((meta.get("normalized_article") or {}).get("sha256") or "").strip()
        original_url = str(meta.get("original_url") or "").strip()
        precheck = str((meta.get("intake") or {}).get("precheck") or "").strip()

        if raw_sha in seen_raw:
            counts["duplicate_exact"] += 1
            items.append({
                "input_path": str(package),
                "source_id": source_id,
                "status": "DUPLICATE_EXACT_PACKAGE",
                "duplicate_of": seen_raw[raw_sha],
                "raw_package_sha256": raw_sha,
                "normalized_article_sha256": article_sha,
            })
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        if source_id in seen_ids:
            counts["source_id_collision"] += 1
            items.append({
                "input_path": str(package),
                "source_id": source_id,
                "status": "SOURCE_ID_COLLISION",
                "existing_location": seen_ids[source_id],
                "raw_package_sha256": raw_sha,
                "normalized_article_sha256": article_sha,
            })
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        final_dir = output_root / source_id
        if final_dir.exists():
            counts["source_id_collision"] += 1
            items.append({
                "input_path": str(package),
                "source_id": source_id,
                "status": "SOURCE_ID_COLLISION",
                "existing_location": str(final_dir),
                "raw_package_sha256": raw_sha,
                "normalized_article_sha256": article_sha,
            })
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        url_variant_of = None
        if original_url and original_url.upper() != "UNKNOWN" and original_url in seen_url:
            url_variant_of = seen_url[original_url]

        temp_dir.rename(final_dir)
        seen_raw[raw_sha] = source_id
        seen_ids[source_id] = str(final_dir)
        if original_url and original_url.upper() != "UNKNOWN":
            seen_url.setdefault(original_url, source_id)

        if url_variant_of:
            status = "DUPLICATE_URL_VARIANT_REVIEW"
            counts["duplicate_url_variant"] += 1
        elif precheck == "READY_FOR_SOURCE_QUALITY_REVIEW":
            status = precheck
            counts["ready_for_quality_review"] += 1
        elif precheck == "READY_FOR_SOURCE_QUALITY_REVIEW_WITH_VISUAL_CHECK":
            status = precheck
            counts["ready_with_visual_check"] += 1
        else:
            status = "HOLD_INCOMPLETE_OR_UNCERTAIN_SOURCE"
            counts["hold"] += 1

        items.append({
            "input_path": str(package),
            "source_id": source_id,
            "status": status,
            "precheck": precheck,
            "output_dir": str(final_dir),
            "title": meta.get("title"),
            "publication": meta.get("publication"),
            "original_url": original_url,
            "exposure": (meta.get("learner_exposure") or {}).get("status"),
            "raw_package_sha256": raw_sha,
            "normalized_article_sha256": article_sha,
            "duplicate_url_variant_of": url_variant_of,
        })

    payload = {
        "schema": REPORT_SCHEMA,
        "inbox": str(inbox),
        "output_root": str(output_root),
        "known_meta_root": str(known_meta_root) if known_meta_root else None,
        "counts": counts,
        "items": items,
        "admission_boundary": "NO_ITEM_IS_AUTO_ADMITTED_TO_INCREMENTAL_REGISTRY",
    }
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
