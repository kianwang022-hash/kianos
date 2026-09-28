#!/usr/bin/env python3
"""Compile the private External Reading Content lane.

Source bytes remain private. This compiler produces a private runtime bundle and,
optionally, a metadata-only inventory safe for the public KianOS repository.

Causal boundary:
private source Markdown -> mechanical normalization -> private runtime bundle
public inventory         -> identity/hash/status only, never passage/question text
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from external_normalization import (
    clean_external_question_source,
    normalize_external_passage,
    normalize_external_questions,
)

SCHEMA = "kianos.english.external-private-bundle.v2"
INVENTORY_SCHEMA = "kianos.english.external-inventory.v1"
INCREMENTAL_MANIFEST_SCHEMA = "kian.external.incremental-manifest.v1"
INCREMENTAL_QUESTIONS_SCHEMA = "kian.external.incremental-questions.v1"
INCREMENTAL_ANSWERS_SCHEMA = "kian.external.incremental-answers.v1"
EXPECTED_TOEFL = {
    56: [14, 13, 14], 57: [14, 14, 14], 58: [14, 14, 14],
    59: [14, 14, 14], 60: [14, 14, 14], 61: [14, 14, 14],
    62: [14, 14, 14], 63: [14, 14, 14], 64: [10, 10, 10],
    65: [10, 10, 10],
}

KNOWN_COLLECTION_DEBT = {
    "Cambridge IELTS 18": ["OCR_SOURCE_MARKED"],
    "Cambridge IELTS 19": ["OCR_SOURCE_MARKED"],
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_ref(root: Path, path: Path) -> str:
    return f"source://EnglishOS/External_Reading_Corpus/{path.relative_to(root).as_posix()}"


def clean_source_markup(value: str) -> str:
    return clean_external_question_source(value)


def source_pages(value: str) -> list[int]:
    return [int(item) for item in re.findall(r"<!-- Source PDF page: (\d+) -->", value)]


def split_article_and_questions(raw: str, first_ordinal: int, source_family: str) -> tuple[str, str, list[str]]:
    warnings: list[str] = []
    pattern = (
        rf"(?m)^\s*{first_ordinal}\.\s+"
        if source_family == "TOEFL_TPO"
        else rf"(?mi)^\s*Questions?\s+{first_ordinal}(?:\s*[–—-]|\b)"
    )
    match = re.search(pattern, raw)
    # TPO57 keeps global 1–42 source numbering.
    if not match and source_family == "TOEFL_TPO":
        match = re.search(r"(?m)^\s*\d{1,2}\.\s+", raw)
    if not match:
        warnings.append("QUESTION_BOUNDARY_SOURCE_TEXT_UNCERTAIN")
        return raw.strip(), "[SOURCE_TEXT_UNCERTAIN] Question boundary not mechanically located.", warnings
    return raw[:match.start()].strip(), raw[match.start():].strip(), warnings


def parse_toefl_answers(raw: str, expected: int) -> dict[str, str]:
    result: dict[str, str] = {}
    for ordinal, answer in re.findall(r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*$", raw, re.M):
        number = int(ordinal)
        value = answer.strip()
        if 1 <= number <= expected and value and not value.startswith("---"):
            result[str(number)] = value
    return result


def parse_ielts_answers(raw: str, start: int, end: int) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in raw.splitlines():
        match = re.match(r"^\s*(\d{1,2})(?:\.|\s)\s+(.+?)\s*$", line)
        if not match:
            continue
        number = int(match.group(1))
        answer = match.group(2).strip()
        if start <= number <= end and answer and not re.match(r"^\d+[–—-]\d+$", answer):
            result[str(number)] = answer
    return result


def question_records(prefix: str, start: int, end: int, raw: str, source_family: str) -> list[dict]:
    records = normalize_external_questions(raw, list(range(start, end + 1)), source_family)
    for row in records:
        row["question_id"] = f'{prefix}-q{row["ordinal"]}'
    return records


def collection_warnings(collection: str) -> list[str]:
    return list(KNOWN_COLLECTION_DEBT.get(collection, []))


def compile_toefl(root: Path) -> list[dict]:
    output: list[dict] = []
    for number, counts in EXPECTED_TOEFL.items():
        path = root / "TOEFL" / f"TPO{number}.md"
        if not path.is_file():
            raise SystemExit(f"TPO{number}: source missing: {path}")
        text = path.read_text(encoding="utf-8")
        sections = re.split(r"(?m)^# Passage (\d+) — (.+)$", text)
        if len(sections) != 10:
            raise SystemExit(f"TPO{number}: expected 3 passage sections")
        for index in range(1, len(sections), 3):
            passage_number = int(sections[index])
            title = sections[index + 1].strip()
            body = sections[index + 2]
            content, marker, key = body.partition("## Answer Key")
            if not marker:
                raise SystemExit(f"TPO{number} passage {passage_number}: answer key missing")
            expected = counts[passage_number - 1]
            answers = parse_toefl_answers(key, expected)
            if len(answers) != expected:
                raise SystemExit(f"TPO{number} passage {passage_number}: {len(answers)}/{expected} key items")
            content = content.replace("## Passage and Questions", "", 1).strip()
            passage_text, question_text, warnings = split_article_and_questions(content, 1, "TOEFL_TPO")
            passage_id = f"tpo{number}-p{passage_number}"
            normalized = normalize_external_passage(passage_text, title=title, source_family="TOEFL_TPO")
            questions = question_records(passage_id, 1, expected, question_text, "TOEFL_TPO")
            collection = f"TPO{number}"
            output.append({
                "passage_id": passage_id,
                "source_family": "TOEFL_TPO",
                "source_format": "TOEFL_LEGACY",
                "practice_role": "READING_GROWTH",
                "collection": collection,
                "test": None,
                "passage_number": passage_number,
                "title": title,
                "passage_text": normalized["text"],
                "passage_paragraphs": normalized["paragraphs"],
                "question_source_text": clean_external_question_source(question_text),
                "questions": questions,
                "answer_key": {f"{passage_id}-q{ordinal}": value for ordinal, value in answers.items()},
                "answer_key_source_text": clean_source_markup(key),
                "answer_key_status": "SOURCE_BACKED",
                "source_refs": [{
                    "path": source_ref(root, path),
                    "sha256": sha256(path),
                    "pdf_pages": source_pages(content),
                }],
                "normalization": {
                    "mode": "MECHANICAL_ONLY",
                    "source_text_sha256": normalized["source_text_sha256"],
                    "spacing_repairs": normalized["spacing_repairs"],
                },
                "warnings": list(dict.fromkeys(
                    warnings + normalized["warnings"] + collection_warnings(collection)
                )),
            })
    return output


def compile_ielts(root: Path) -> list[dict]:
    output: list[dict] = []
    ranges = [(1, 13), (14, 26), (27, 40)]
    for book in (17, 18, 19):
        path = root / "IELTS" / f"Cambridge_IELTS_{book}_Academic_Reading.md"
        if not path.is_file():
            raise SystemExit(f"IELTS {book}: source missing: {path}")
        text = path.read_text(encoding="utf-8")
        tests = re.split(r"(?m)^# Test (\d+)\s*$", text)
        if len(tests) != 9:
            raise SystemExit(f"IELTS {book}: expected 4 test sections")
        for offset in range(1, len(tests), 2):
            test = int(tests[offset])
            raw_test = tests[offset + 1]
            key_marker = re.search(rf"(?m)^## Test {test} — Reading Answer Key\s*$", raw_test)
            if not key_marker:
                raise SystemExit(f"IELTS {book} test {test}: key section missing")
            passage_part = raw_test[:key_marker.start()]
            key_text = raw_test[key_marker.end():].strip()
            passage_sections = re.split(r"(?m)^## Reading Passage ([123])\s*$", passage_part)
            if len(passage_sections) != 7:
                raise SystemExit(f"IELTS {book} test {test}: expected 3 passages")
            for passage_number in (1, 2, 3):
                idx = passage_number * 2 - 1
                raw = passage_sections[idx + 1]
                start, end = ranges[passage_number - 1]
                passage_text, question_text, warnings = split_article_and_questions(raw, start, "IELTS_ACADEMIC")
                passage_id = f"ielts{book}-t{test}-p{passage_number}"
                answers = parse_ielts_answers(key_text, start, end)
                answer_status = "SOURCE_BACKED" if len(answers) == end - start + 1 else "SOURCE_TEXT_UNCERTAIN"
                normalized = normalize_external_passage(passage_text, title="", source_family="IELTS_ACADEMIC")
                collection = f"Cambridge IELTS {book}"
                output.append({
                    "passage_id": passage_id,
                    "source_family": "IELTS_ACADEMIC",
                    "source_format": "IELTS_ACADEMIC",
                    "practice_role": "READING_GROWTH",
                    "collection": collection,
                    "test": test,
                    "passage_number": passage_number,
                    "title": f"Reading Passage {passage_number}",
                    "passage_text": normalized["text"],
                    "passage_paragraphs": normalized["paragraphs"],
                    "question_source_text": clean_external_question_source(question_text),
                    "questions": question_records(passage_id, start, end, question_text, "IELTS_ACADEMIC"),
                    "answer_key": {f"{passage_id}-q{ordinal}": value for ordinal, value in answers.items()},
                    "answer_key_source_text": clean_source_markup(key_text),
                    "answer_key_status": answer_status,
                    "source_refs": [{
                        "path": source_ref(root, path),
                        "sha256": sha256(path),
                        "pdf_pages": source_pages(raw),
                    }],
                    "normalization": {
                        "mode": "MECHANICAL_ONLY",
                        "source_text_sha256": normalized["source_text_sha256"],
                        "spacing_repairs": normalized["spacing_repairs"],
                    },
                    "warnings": list(dict.fromkeys(
                        warnings
                        + normalized["warnings"]
                        + collection_warnings(collection)
                    )),
                })
    return output


def _safe_registered_path(root: Path, relative: str) -> Path:
    raw = str(relative or "").strip()
    if not raw or Path(raw).is_absolute():
        raise SystemExit(f"incremental source path invalid: {relative!r}")
    resolved = (root / raw).resolve()
    if resolved != root and root not in resolved.parents:
        raise SystemExit(f"incremental source escapes root: {relative!r}")
    if not resolved.is_file():
        raise SystemExit(f"incremental source missing: {raw}")
    return resolved


def _load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except Exception as error:
        raise SystemExit(f"invalid JSON: {path}: {error}") from error
    if not isinstance(value, dict):
        raise SystemExit(f"JSON object required: {path}")
    return value


def _assert_registered_sha(path: Path, expected: str, label: str) -> str:
    actual = sha256(path)
    expected_value = str(expected or "").strip().lower()
    if not expected_value or actual != expected_value:
        raise SystemExit(f"{label} SHA mismatch: expected {expected_value or 'missing'}, got {actual}")
    return actual


FIGURE_BLOCK_RE = re.compile(
    r"(?ms)^\[FIGURE\]\s*\n"
    r"(?P<body>(?:(?:caption|source_position|source_url|figure_note):[^\n]*(?:\n|$))+)"
)


def _compile_incremental_body(raw_text: str, *, title: str, source_family: str, object_id: str) -> dict:
    blocks: list[dict] = []
    paragraphs: list[str] = []
    figures: list[dict] = []
    warnings: list[str] = []
    spacing_repairs: list[str] = []

    def add_text_chunk(value: str) -> None:
        if not value.strip():
            return
        normalized = normalize_external_passage(value, title=title, source_family=source_family)
        spacing_repairs.extend(normalized["spacing_repairs"])
        warnings.extend(normalized["warnings"])
        for paragraph in normalized["paragraphs"]:
            paragraphs.append(paragraph)
            blocks.append({"type": "paragraph", "text": paragraph})

    figure_matches = list(FIGURE_BLOCK_RE.finditer(raw_text))
    unmatched_probe = FIGURE_BLOCK_RE.sub("", raw_text)
    if "[FIGURE]" in unmatched_probe:
        raise SystemExit(f"{object_id}: malformed [FIGURE] block")

    cursor = 0
    for ordinal, match in enumerate(figure_matches, 1):
        add_text_chunk(raw_text[cursor:match.start()])
        fields: dict[str, str] = {}
        for line in match.group("body").splitlines():
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()
        source_url = fields.get("source_url", "")
        caption = fields.get("caption", "")
        figure_note = fields.get("figure_note", "")
        source_position = fields.get("source_position", "")
        if not caption:
            warnings.append("SOURCE_FIGURE_CAPTION_MISSING")
        if source_url and not source_url.startswith("https://"):
            warnings.append("SOURCE_FIGURE_URL_NOT_HTTPS")
        figure = {
            "figure_id": f"{object_id}-fig{ordinal}",
            "ordinal": ordinal,
            "caption": caption,
            "source_url": source_url,
            "source_position": source_position,
            "figure_note": figure_note,
            "origin": "SOURCE_NATIVE",
        }
        figures.append(figure)
        blocks.append({"type": "figure", "figure": figure})
        cursor = match.end()

    add_text_chunk(raw_text[cursor:])
    learner_text = "\n\n".join(paragraphs).strip()
    return {
        "text": learner_text,
        "paragraphs": paragraphs,
        "blocks": blocks,
        "figures": figures,
        "spacing_repairs": list(dict.fromkeys(spacing_repairs)),
        "warnings": list(dict.fromkeys(warnings)),
        "source_text_sha256": hashlib.sha256(raw_text.encode("utf-8")).hexdigest(),
    }


def _compile_incremental_questions(object_id: str, root: Path, row: dict) -> tuple[list[dict], dict[str, str], str, str, list[dict]]:
    question_path_value = str(row.get("questions_path") or "").strip()
    answer_path_value = str(row.get("answers_path") or "").strip()
    refs: list[dict] = []

    if not question_path_value:
        if answer_path_value:
            raise SystemExit(f"{object_id}: answers_path requires questions_path")
        return [], {}, "", "NO_QUESTIONS", refs

    question_path = _safe_registered_path(root, question_path_value)
    question_sha = _assert_registered_sha(question_path, row.get("questions_sha256"), f"{object_id} questions")
    question_payload = _load_json(question_path)
    if question_payload.get("schema") != INCREMENTAL_QUESTIONS_SCHEMA:
        raise SystemExit(f"{object_id}: incremental question schema invalid")
    raw_questions = question_payload.get("questions")
    if not isinstance(raw_questions, list) or not raw_questions:
        raise SystemExit(f"{object_id}: incremental questions must be a non-empty list")

    seen: set[int] = set()
    questions: list[dict] = []
    for index, raw in enumerate(raw_questions, 1):
        if not isinstance(raw, dict):
            raise SystemExit(f"{object_id}: question {index} must be an object")
        ordinal = int(raw.get("ordinal") or index)
        if ordinal < 1 or ordinal in seen:
            raise SystemExit(f"{object_id}: duplicate/invalid question ordinal {ordinal}")
        seen.add(ordinal)
        options = raw.get("options") or {}
        if not isinstance(options, dict):
            raise SystemExit(f"{object_id}: question {ordinal} options must be an object")
        clean_options = {str(k): str(v) for k, v in options.items() if str(k).strip()}
        response_kind = str(raw.get("response_kind") or ("single_choice" if len(clean_options) >= 2 else "source_bound_response"))
        questions.append({
            "question_id": f"{object_id}-q{ordinal}",
            "ordinal": ordinal,
            "source_ordinal": int(raw.get("source_ordinal") or ordinal),
            "prompt": str(raw.get("prompt") or f"Question {ordinal}"),
            "options": clean_options,
            "source_text": str(raw.get("source_text") or raw.get("prompt") or f"Question {ordinal}"),
            "response_kind": response_kind,
            "response_limit": int(raw.get("response_limit") or 6000),
            "source_refs": [],
            "warnings": list(dict.fromkeys(str(x) for x in (raw.get("warnings") or []) if str(x).strip())),
        })
    questions.sort(key=lambda item: item["ordinal"])
    refs.append({"path": source_ref(root, question_path), "sha256": question_sha, "role": "questions"})

    answers: dict[str, str] = {}
    answer_status = "SOURCE_NATIVE_NO_KEY"
    if answer_path_value:
        answer_path = _safe_registered_path(root, answer_path_value)
        answer_sha = _assert_registered_sha(answer_path, row.get("answers_sha256"), f"{object_id} answers")
        answer_payload = _load_json(answer_path)
        if answer_payload.get("schema") != INCREMENTAL_ANSWERS_SCHEMA:
            raise SystemExit(f"{object_id}: incremental answer schema invalid")
        raw_answers = answer_payload.get("answers")
        if not isinstance(raw_answers, dict):
            raise SystemExit(f"{object_id}: incremental answers object required")
        valid_ordinals = {q["ordinal"] for q in questions}
        for key, value in raw_answers.items():
            ordinal = int(key)
            if ordinal not in valid_ordinals:
                raise SystemExit(f"{object_id}: answer for unknown ordinal {ordinal}")
            answers[f"{object_id}-q{ordinal}"] = value
        answer_status = "SOURCE_BACKED"
        refs.append({"path": source_ref(root, answer_path), "sha256": answer_sha, "role": "answers"})

    return questions, answers, str(question_payload.get("source_text") or ""), answer_status, refs


def compile_incremental(root: Path, manifest_path: Path | None) -> list[dict]:
    if manifest_path is None:
        return []
    manifest = _load_json(manifest_path)
    if manifest.get("schema") != INCREMENTAL_MANIFEST_SCHEMA:
        raise SystemExit("incremental manifest schema invalid")
    raw_objects = manifest.get("objects")
    if not isinstance(raw_objects, list):
        raise SystemExit("incremental manifest objects list required")

    output: list[dict] = []
    seen_ids: set[str] = set()
    for index, row in enumerate(raw_objects, 1):
        if not isinstance(row, dict):
            raise SystemExit(f"incremental object {index} must be an object")
        object_id = str(row.get("object_id") or "").strip()
        if not object_id or object_id in seen_ids:
            raise SystemExit(f"incremental object id invalid/duplicate: {object_id!r}")
        if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{2,127}", object_id):
            raise SystemExit(f"incremental object id unsafe: {object_id}")
        seen_ids.add(object_id)

        source_path = _safe_registered_path(root, row.get("source_path"))
        source_sha = _assert_registered_sha(source_path, row.get("source_sha256"), f"{object_id} source")
        source_family = str(row.get("source_family") or "FUTURE_INCREMENTAL").strip()
        source_format = str(row.get("source_format") or "SOURCE_PACKAGE_MARKDOWN").strip()
        collection = str(row.get("collection") or "External Reading").strip()
        title = str(row.get("title") or object_id).strip()
        raw_text = source_path.read_text(encoding="utf-8")
        normalized = _compile_incremental_body(raw_text, title=title, source_family=source_family, object_id=object_id)
        questions, answers, question_source, answer_status, auxiliary_refs = _compile_incremental_questions(object_id, root, row)
        warnings = list(dict.fromkeys(
            list(normalized["warnings"])
            + [str(x) for x in (row.get("warnings") or []) if str(x).strip()]
        ))

        output.append({
            "passage_id": object_id,
            "source_family": source_family,
            "source_format": source_format,
            "practice_role": str(row.get("practice_role") or "READING_GROWTH"),
            "collection": collection,
            "test": row.get("test"),
            "passage_number": row.get("passage_number"),
            "title": title,
            "passage_text": normalized["text"],
            "passage_paragraphs": normalized["paragraphs"],
            "passage_blocks": normalized["blocks"],
            "source_figures": normalized["figures"],
            "question_source_text": question_source,
            "questions": questions,
            "answer_key": answers,
            "answer_key_source_text": "",
            "answer_key_status": answer_status,
            "source_refs": [{
                "path": source_ref(root, source_path),
                "sha256": source_sha,
                "pdf_pages": source_pages(raw_text),
                "role": "passage",
            }, *auxiliary_refs],
            "normalization": {
                "mode": "MECHANICAL_ONLY",
                "source_text_sha256": normalized["source_text_sha256"],
                "spacing_repairs": normalized["spacing_repairs"],
            },
            "warnings": warnings,
            "question_origin": "SOURCE_NATIVE" if questions else "NONE",
            "completion_requirement": str(row.get("completion_requirement") or "READ_ONLY_OK"),
            "source_url": row.get("source_url"),
        })
    return output


def public_inventory(passages: list[dict], counts: dict, bundle_sha: str) -> dict:
    return {
        "schema": INVENTORY_SCHEMA,
        "generated_from_private_bundle_sha256": bundle_sha,
        "counts": counts,
        "objects": [{
            "object_id": p["passage_id"],
            "source_family": p["source_family"],
            "source_format": p["source_format"],
            "collection": p["collection"],
            "test": p["test"],
            "passage_number": p["passage_number"],
            "question_count": len(p["questions"]),
            "answer_key_status": p["answer_key_status"],
            "source_hash": p["source_refs"][0]["sha256"],
            "source_pages": p["source_refs"][0]["pdf_pages"],
            "warnings": p["warnings"],
            "runtime_content_location": "PRIVATE_BUNDLE",
        } for p in passages],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True, help="private runtime bundle")
    parser.add_argument("--inventory-output", type=Path, default=None, help="optional metadata-only public inventory")
    parser.add_argument("--incremental-manifest", type=Path, default=None, help="optional registered incremental-source manifest")
    args = parser.parse_args()

    root = args.source_root.expanduser().resolve()
    manifest = root / "source_manifest.json"
    if not manifest.is_file():
        raise SystemExit(f"source manifest missing: {manifest}")

    incremental_manifest = args.incremental_manifest.expanduser().resolve() if args.incremental_manifest else None
    if incremental_manifest is not None and not incremental_manifest.is_file():
        raise SystemExit(f"incremental manifest missing: {incremental_manifest}")
    legacy_toefl = compile_toefl(root)
    legacy_ielts = compile_ielts(root)
    incremental = compile_incremental(root, incremental_manifest)
    passages = legacy_toefl + legacy_ielts + incremental
    counts = {
        "toefl": {
            "collections": len({p["collection"] for p in legacy_toefl}),
            "passages": len(legacy_toefl),
            "questions": sum(len(p["questions"]) for p in legacy_toefl),
            "answer_slots": sum(len(p["answer_key"]) for p in legacy_toefl),
        },
        "ielts": {
            "books": len({p["collection"] for p in legacy_ielts}),
            "tests": len({(p["collection"], p["test"]) for p in legacy_ielts}),
            "passages": len(legacy_ielts),
            "questions": sum(len(p["questions"]) for p in legacy_ielts),
            "mechanically_parsed_answer_slots": sum(len(p["answer_key"]) for p in legacy_ielts),
            "source_key_question_slots": sum(len(p["questions"]) for p in legacy_ielts),
        },
        "incremental": {
            "objects": len(incremental),
            "questions": sum(len(p["questions"]) for p in incremental),
            "questionless_objects": sum(not p["questions"] for p in incremental),
        },
    }
    if counts["toefl"] != {"collections": 10, "passages": 30, "questions": 395, "answer_slots": 395}:
        raise SystemExit(f'TOEFL gate failed: {counts["toefl"]}')
    if {key: counts["ielts"][key] for key in ("books", "tests", "passages", "questions")} != {
        "books": 3, "tests": 12, "passages": 36, "questions": 480
    }:
        raise SystemExit(f'IELTS gate failed: {counts["ielts"]}')

    payload = {
        "schema": SCHEMA,
        "purpose": "READING_GROWTH",
        "cognition_boundary": {
            "english1_reading_a_strategy": "NOT_INHERITED",
            "source_native_questions": "PRESERVED_WHEN_MECHANICALLY_AVAILABLE",
            "unsupported_question_forms": "SOURCE_BOUND_FALLBACK_OR_READING_ONLY",
        },
        "source_binding": {
            "root": "source://EnglishOS/External_Reading_Corpus",
            "manifest_path": "source://EnglishOS/External_Reading_Corpus/source_manifest.json",
            "manifest_sha256": sha256(manifest),
            "incremental_manifest_path": source_ref(root, incremental_manifest) if incremental_manifest else None,
            "incremental_manifest_sha256": sha256(incremental_manifest) if incremental_manifest else None,
            "file_count": sum(item.is_file() for item in root.rglob("*")),
        },
        "source_quality": {
            "proven_clean_claim": False,
            "active_source_claim": "REPAIRED_CANDIDATE_2026_09_20_PASS15",
            "known_historical_ocr_debt_retained": False,
            "remaining_source_bound_debt_explicit": True,
            "policy": "ACTIVE_SOURCE_HASH_MATCH_REQUIRED; MECHANICAL_OR_SOURCE_BOUND_CLEANUP_ONLY",
        },
        "counts": counts,
        "passages": passages,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    bundle_sha = sha256(args.output)

    if args.inventory_output:
        args.inventory_output.parent.mkdir(parents=True, exist_ok=True)
        args.inventory_output.write_text(
            json.dumps(public_inventory(passages, counts, bundle_sha), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    print(json.dumps({
        "output": str(args.output),
        "sha256": bundle_sha,
        "inventory_output": str(args.inventory_output) if args.inventory_output else None,
        "counts": counts,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
