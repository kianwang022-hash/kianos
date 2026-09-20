#!/usr/bin/env python3
"""Build an exact-hash External Reading incremental manifest from an explicit private registry.

No directory auto-discovery. The registry decides admission; this tool only validates
registered files and freezes their hashes for the runtime compiler.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

REGISTRY_SCHEMA = "kian.external.incremental-registry.v1"
MANIFEST_SCHEMA = "kian.external.incremental-manifest.v1"
QUESTIONS_SCHEMA = "kian.external.incremental-questions.v1"
ANSWERS_SCHEMA = "kian.external.incremental-answers.v1"
OBJECT_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{2,127}$")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except Exception as error:
        raise SystemExit(f"invalid JSON: {path}: {error}") from error
    if not isinstance(value, dict):
        raise SystemExit(f"JSON object required: {path}")
    return value


def safe_file(root: Path, relative: str, *, label: str) -> Path:
    raw = str(relative or "").strip()
    if not raw or Path(raw).is_absolute():
        raise SystemExit(f"{label} path invalid: {relative!r}")
    resolved = (root / raw).resolve()
    if resolved != root and root not in resolved.parents:
        raise SystemExit(f"{label} path escapes source root: {relative!r}")
    if not resolved.is_file():
        raise SystemExit(f"{label} file missing: {raw}")
    return resolved


def validate_questions(path: Path, object_id: str) -> set[int]:
    payload = load_json(path)
    if payload.get("schema") != QUESTIONS_SCHEMA:
        raise SystemExit(f"{object_id}: incremental question schema invalid")
    rows = payload.get("questions")
    if not isinstance(rows, list) or not rows:
        raise SystemExit(f"{object_id}: incremental questions must be a non-empty list")
    ordinals: set[int] = set()
    for index, row in enumerate(rows, 1):
        if not isinstance(row, dict):
            raise SystemExit(f"{object_id}: question {index} must be an object")
        ordinal = int(row.get("ordinal") or index)
        if ordinal < 1 or ordinal in ordinals:
            raise SystemExit(f"{object_id}: duplicate/invalid question ordinal {ordinal}")
        ordinals.add(ordinal)
        options = row.get("options") or {}
        if not isinstance(options, dict):
            raise SystemExit(f"{object_id}: question {ordinal} options must be an object")
    return ordinals


def validate_answers(path: Path, object_id: str, valid_ordinals: set[int]) -> None:
    payload = load_json(path)
    if payload.get("schema") != ANSWERS_SCHEMA:
        raise SystemExit(f"{object_id}: incremental answer schema invalid")
    answers = payload.get("answers")
    if not isinstance(answers, dict):
        raise SystemExit(f"{object_id}: incremental answers object required")
    for key in answers:
        try:
            ordinal = int(key)
        except Exception as error:
            raise SystemExit(f"{object_id}: answer ordinal invalid: {key!r}") from error
        if ordinal not in valid_ordinals:
            raise SystemExit(f"{object_id}: answer for unknown ordinal {ordinal}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--registry", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    root = args.source_root.expanduser().resolve()
    registry_path = args.registry.expanduser().resolve()
    output_path = args.output.expanduser().resolve()

    if not root.is_dir():
        raise SystemExit(f"source root missing: {root}")
    if not registry_path.is_file():
        raise SystemExit(f"registry missing: {registry_path}")
    if registry_path != root and root not in registry_path.parents:
        raise SystemExit("registry must be inside source root")
    if output_path != root and root not in output_path.parents:
        raise SystemExit("output must be inside source root")

    registry = load_json(registry_path)
    if registry.get("schema") != REGISTRY_SCHEMA:
        raise SystemExit("incremental registry schema invalid")
    rows = registry.get("objects")
    if not isinstance(rows, list):
        raise SystemExit("incremental registry objects list required")

    output_rows: list[dict] = []
    seen_ids: set[str] = set()
    seen_files: set[str] = set()

    passthrough = (
        "source_family",
        "source_format",
        "practice_role",
        "collection",
        "title",
        "source_url",
        "test",
        "passage_number",
        "completion_requirement",
        "warnings",
    )

    for index, row in enumerate(rows, 1):
        if not isinstance(row, dict):
            raise SystemExit(f"incremental registry object {index} must be an object")
        object_id = str(row.get("object_id") or "").strip()
        if not OBJECT_ID_RE.fullmatch(object_id) or object_id in seen_ids:
            raise SystemExit(f"incremental object id invalid/duplicate: {object_id!r}")
        seen_ids.add(object_id)

        source_relative = str(row.get("source_path") or "").strip()
        source_path = safe_file(root, source_relative, label=f"{object_id} source")
        if source_relative in seen_files:
            raise SystemExit(f"{object_id}: source file already registered by another object: {source_relative}")
        seen_files.add(source_relative)

        built = {"object_id": object_id}
        for key in passthrough:
            if key in row and row[key] is not None:
                built[key] = row[key]
        built.setdefault("source_family", "FUTURE_INCREMENTAL")
        built.setdefault("source_format", "SOURCE_PACKAGE_MARKDOWN")
        built.setdefault("practice_role", "READING_GROWTH")
        built.setdefault("collection", "External Reading")
        built.setdefault("title", object_id)
        built.setdefault("completion_requirement", "READ_ONLY_OK")
        built.setdefault("warnings", [])
        built["source_path"] = source_relative
        built["source_sha256"] = sha256(source_path)

        questions_relative = str(row.get("questions_path") or "").strip()
        answers_relative = str(row.get("answers_path") or "").strip()
        if answers_relative and not questions_relative:
            raise SystemExit(f"{object_id}: answers_path requires questions_path")

        if questions_relative:
            question_path = safe_file(root, questions_relative, label=f"{object_id} questions")
            if questions_relative in seen_files:
                raise SystemExit(f"{object_id}: questions file already registered: {questions_relative}")
            seen_files.add(questions_relative)
            ordinals = validate_questions(question_path, object_id)
            built["questions_path"] = questions_relative
            built["questions_sha256"] = sha256(question_path)
        else:
            ordinals = set()

        if answers_relative:
            answer_path = safe_file(root, answers_relative, label=f"{object_id} answers")
            if answers_relative in seen_files:
                raise SystemExit(f"{object_id}: answers file already registered: {answers_relative}")
            seen_files.add(answers_relative)
            validate_answers(answer_path, object_id, ordinals)
            built["answers_path"] = answers_relative
            built["answers_sha256"] = sha256(answer_path)

        output_rows.append(built)

    payload = {
        "schema": MANIFEST_SCHEMA,
        "registry_path": registry_path.relative_to(root).as_posix(),
        "registry_sha256": sha256(registry_path),
        "object_count": len(output_rows),
        "objects": output_rows,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "output": str(output_path),
        "sha256": sha256(output_path),
        "object_count": len(output_rows),
        "questionless_objects": sum("questions_path" not in row for row in output_rows),
        "keyed_objects": sum("answers_path" in row for row in output_rows),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
