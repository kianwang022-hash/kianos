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
    args = parser.parse_args()

    root = args.source_root.expanduser().resolve()
    manifest = root / "source_manifest.json"
    if not manifest.is_file():
        raise SystemExit(f"source manifest missing: {manifest}")

    passages = compile_toefl(root) + compile_ielts(root)
    counts = {
        "toefl": {
            "collections": len({p["collection"] for p in passages if p["source_family"] == "TOEFL_TPO"}),
            "passages": sum(p["source_family"] == "TOEFL_TPO" for p in passages),
            "questions": sum(len(p["questions"]) for p in passages if p["source_family"] == "TOEFL_TPO"),
            "answer_slots": sum(len(p["answer_key"]) for p in passages if p["source_family"] == "TOEFL_TPO"),
        },
        "ielts": {
            "books": len({p["collection"] for p in passages if p["source_family"] == "IELTS_ACADEMIC"}),
            "tests": len({(p["collection"], p["test"]) for p in passages if p["source_family"] == "IELTS_ACADEMIC"}),
            "passages": sum(p["source_family"] == "IELTS_ACADEMIC" for p in passages),
            "questions": sum(len(p["questions"]) for p in passages if p["source_family"] == "IELTS_ACADEMIC"),
            "mechanically_parsed_answer_slots": sum(len(p["answer_key"]) for p in passages if p["source_family"] == "IELTS_ACADEMIC"),
            "source_key_question_slots": sum(len(p["questions"]) for p in passages if p["source_family"] == "IELTS_ACADEMIC"),
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
