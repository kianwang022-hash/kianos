#!/usr/bin/env python3
"""Mechanically split a GPT archival Source Package into private intake artifacts.

This tool does not summarize, translate, repair source prose, rate difficulty, or admit
content to the runtime registry. It preserves the original package and extracts only
control metadata + learner-facing article body according to the frozen archival prompt.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

SCHEMA = "kian.external-source-package-parsed.v1"
SOURCE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{2,127}$")
YAML_FENCE_RE = re.compile(r"(?ms)^\s*```ya?ml\s*\n(.*?)\n```\s*$")

REQUIRED_META = (
    "title",
    "publication",
    "author",
    "publication_date",
    "original_url",
    "extraction_date",
    "language",
    "exposure",
    "source_type",
)
REQUIRED_CHECK = (
    "body_complete",
    "missing_sections",
    "paywall_truncation",
    "image_dependent_content",
    "extraction_notes",
)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_path(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def unquote(value: str) -> str:
    text = str(value or "").strip()
    if len(text) >= 2 and text[0] == text[-1] and text[0] in {"'", '"'}:
        return text[1:-1]
    return text


def parse_flat_mapping(raw: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1].isspace():
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        if key:
            result[key] = unquote(value)
    return result


def derive_source_id(metadata: dict[str, str]) -> str:
    original_url = str(metadata.get("original_url") or "").strip()
    title = str(metadata.get("title") or "").strip()
    publication = str(metadata.get("publication") or "").strip()
    publication_date = str(metadata.get("publication_date") or "").strip()
    identity = original_url if original_url.upper() != "UNKNOWN" else f"{publication}|{publication_date}|{title}"
    slug_base = f"{publication}-{title}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug_base).strip("-")[:72] or "source"
    suffix = hashlib.sha256(identity.encode("utf-8")).hexdigest()[:10]
    return f"src-{slug}-{suffix}"


def parse_extraction_check(raw: str) -> dict[str, str]:
    lines = raw.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.strip() == "extraction_check:":
            start = index + 1
            break
    if start is None:
        raise SystemExit("extraction_check YAML block missing extraction_check: root")

    result: dict[str, str] = {}
    for line in lines[start:]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        if indent == 0:
            break
        clean = line.strip()
        if ":" not in clean:
            continue
        key, value = clean.split(":", 1)
        result[key.strip()] = unquote(value)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--source-id", default="auto", help="stable source id or 'auto'")
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    package_path = args.package.expanduser().resolve()
    output_dir = args.output_dir.expanduser().resolve()
    requested_source_id = str(args.source_id or "auto").strip()

    if not package_path.is_file():
        raise SystemExit(f"source package missing: {package_path}")
    if requested_source_id != "auto" and not SOURCE_ID_RE.fullmatch(requested_source_id):
        raise SystemExit(f"source_id invalid: {requested_source_id!r}")

    raw_bytes = package_path.read_bytes()
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as error:
        raise SystemExit("source package must be UTF-8 text") from error
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    blocks = list(YAML_FENCE_RE.finditer(text))
    metadata_block = next(
        (item for item in blocks if re.search(r"(?m)^\s*title\s*:", item.group(1)) and re.search(r"(?m)^\s*publication\s*:", item.group(1))),
        None,
    )
    extraction_block = next(
        (item for item in reversed(blocks) if re.search(r"(?m)^\s*extraction_check\s*:", item.group(1))),
        None,
    )
    if metadata_block is None:
        raise SystemExit("metadata YAML block not found")
    if extraction_block is None:
        raise SystemExit("extraction_check YAML block not found")
    if metadata_block.start() >= extraction_block.start():
        raise SystemExit("metadata block must appear before extraction_check")
    if text[:metadata_block.start()].strip():
        raise SystemExit("unexpected content before metadata block")
    if text[extraction_block.end():].strip():
        raise SystemExit("unexpected content after extraction_check block")

    metadata = parse_flat_mapping(metadata_block.group(1))
    missing_meta = [key for key in REQUIRED_META if key not in metadata]
    if missing_meta:
        raise SystemExit("metadata fields missing: " + ", ".join(missing_meta))
    empty_meta = [key for key in REQUIRED_META if not str(metadata.get(key) or "").strip()]
    if empty_meta:
        raise SystemExit("metadata fields must use UNKNOWN instead of blank: " + ", ".join(empty_meta))

    source_id = derive_source_id(metadata) if requested_source_id == "auto" else requested_source_id
    if not SOURCE_ID_RE.fullmatch(source_id):
        raise SystemExit(f"derived source_id invalid: {source_id!r}")

    exposure = metadata["exposure"].strip().upper()
    if exposure not in {"UNSEEN", "EXPOSED"}:
        raise SystemExit("exposure must be UNSEEN or EXPOSED")
    language = metadata["language"].strip().lower()
    if language != "en":
        raise SystemExit("language must be en")

    check = parse_extraction_check(extraction_block.group(1))
    missing_check = [key for key in REQUIRED_CHECK if key not in check]
    if missing_check:
        raise SystemExit("extraction_check fields missing: " + ", ".join(missing_check))

    body = text[metadata_block.end():extraction_block.start()]
    body = body.strip("\n")
    if not body.strip():
        raise SystemExit("article body is empty")

    body_complete = check["body_complete"].strip().upper()
    paywall = check["paywall_truncation"].strip().upper()
    image_dependent = check["image_dependent_content"].strip().upper()
    missing_sections_value = check["missing_sections"].strip()
    if body_complete not in {"YES", "NO", "UNCERTAIN"}:
        raise SystemExit("body_complete must be YES / NO / UNCERTAIN")
    if paywall not in {"YES", "NO", "UNCERTAIN"}:
        raise SystemExit("paywall_truncation must be YES / NO / UNCERTAIN")
    if image_dependent not in {"YES", "NO"}:
        raise SystemExit("image_dependent_content must be YES / NO")

    missing_sections_present = missing_sections_value.upper() not in {"", "NONE", "NO", "N/A"}
    if body_complete != "YES" or paywall != "NO" or missing_sections_present:
        precheck = "HOLD_INCOMPLETE_OR_UNCERTAIN_SOURCE"
    elif image_dependent == "YES":
        precheck = "READY_FOR_SOURCE_QUALITY_REVIEW_WITH_VISUAL_CHECK"
    else:
        precheck = "READY_FOR_SOURCE_QUALITY_REVIEW"

    raw_dir = output_dir / "raw"
    normalized_dir = output_dir / "normalized"
    raw_dir.mkdir(parents=True, exist_ok=True)
    normalized_dir.mkdir(parents=True, exist_ok=True)

    raw_target = raw_dir / "source_package.md"
    article_target = normalized_dir / "article.md"
    meta_target = output_dir / "meta.json"

    raw_target.write_bytes(raw_bytes)
    article_target.write_text(body + "\n", encoding="utf-8")

    payload = {
        "schema": SCHEMA,
        "source_id": source_id,
        "title": metadata["title"],
        "publication": metadata["publication"],
        "author": metadata["author"],
        "publication_date": metadata["publication_date"],
        "original_url": metadata["original_url"],
        "extraction_date": metadata["extraction_date"],
        "language": "en",
        "source_type": metadata["source_type"],
        "learner_exposure": {
            "status": exposure,
            "first_exposed_at": None,
        },
        "raw_package": {
            "path": "raw/source_package.md",
            "sha256": sha256_path(raw_target),
        },
        "normalized_article": {
            "path": "normalized/article.md",
            "sha256": sha256_path(article_target),
            "transformation": "CONTROL_BLOCK_SPLIT_ONLY",
        },
        "extraction_check": {
            key: check[key] for key in REQUIRED_CHECK
        },
        "intake": {
            "status": "PARSED_NOT_ADMITTED",
            "precheck": precheck,
        },
        "parser_policy": {
            "summary_added": False,
            "translation_added": False,
            "prose_rewritten": False,
            "source_corrections_applied": False,
        },
    }
    meta_target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "output_dir": str(output_dir),
        "source_id": source_id,
        "raw_package_sha256": payload["raw_package"]["sha256"],
        "normalized_article_sha256": payload["normalized_article"]["sha256"],
        "precheck": precheck,
        "exposure": exposure,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
