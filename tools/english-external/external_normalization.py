#!/usr/bin/env python3
"""Mechanical normalization for the private External Reading source lane.

This module is deliberately narrow:
- remove presentation artefacts;
- join PDF hard wraps;
- apply only source/hash-bound or unmistakable spacing cleanup;
- preserve uncertainty instead of guessing semantics.

It does not infer answers, rewrite source meaning, or turn TOEFL/IELTS tasks into
English-I Reading-A tasks.
"""
from __future__ import annotations

import hashlib
import re

SOURCE_PAGE_RE = re.compile(
    r'(?:<a id="src-page-\d+"></a>\s*|<!--\s*Source PDF page:\s*\d+\s*-->|\[Source PDF page\s+\d+\])',
    re.I,
)
PARAGRAPH_MARKER_RE = re.compile(r"\[\s*(?:Paragraph|P)\s*\d+\s*\]", re.I)
KNOWN_FOOTER_LINE_RE = re.compile(
    r"(?ix)"
    r"(?:英语试题\s*[.·]?\s*\d*\s*[.·]?\s*\([^\n]{0,30}页[^\n]*[)）])"
    r"|(?:^\s*[.·]?\s*\d+\s*[.·]?\s*\([^\n]{0,30}\)\s*$)"
    r"|(?:^\s*\d+\s*/\s*\d+\s*$)"
)

HIGH_CONFIDENCE_SPACING_REPAIRS = {
    "geo log ist": "geologist",
    "cont inents": "continents",
    "mot ivated": "motivated",
    "Afr ica": "Africa",
    "Wegene r": "Wegener",
    "mobi le": "mobile",
    "continenta l": "continental",
    "appare nt": "apparent",
    "Contine nts": "Continents",
    "pub lished": "published",
    "expedit ion": "expedition",
    "general ly": "generally",
    "reduct ions": "reductions",
    "high lighted": "highlighted",
    "informat ion": "information",
    "beg inning": "beginning",
    "pub lications": "publications",
    "menti oned": "mentioned",
    "high ly": "highly",
    "wide ly": "widely",
    "twent ieth": "twentieth",
}

# Historical External source review proved these exact lines to be extraction /
# page-presentation artefacts. They are removed only if the exact source segment
# hash still matches; otherwise the compiler leaves the bytes untouched.
EXTERNAL_PASSAGE_OMIT_LINES_BY_SHA256: dict[str, set[str]] = {
    "7780a708b1332b9d450d1a6a810f7bfed1fc343ffcf384c5de8d37e756cdbf2d": {
        "l--.1 µii.-~",
        "t;::;i\\=~= .. :.J",
        "TP065 lfflilP1",
        "ffiE~:imm: TP065 Reading Pl",
    },
    "c13894dfddea0eba78ec6c865f7a356211fe234e7ccfc6366e3b396a5217af6b": {
        "TP065 lfflilP2",
        "ffl*imm : TP065 Reading P2",
    },
    "7dbfe12b7e8710ffc026d4d6ba77aa5447945cf04f4ce10474304382c7f24927": {
        "TP065 lfflilP3",
        "ffiE~:~m: TP065 Reading P3",
    },
    "8ebdbdac15ed54aceb2abd191d9880be351e49009be710f3c7ecc1852a0000af": {
        "M4",
    },
}


def text_sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _normalize_bytes(value: str) -> str:
    return str(value or "").replace("\r\n", "\n").replace("\r", "\n").replace("\xa0", " ")


def strip_known_footer_lines(value: str) -> str:
    kept: list[str] = []
    for line in _normalize_bytes(value).splitlines():
        without = KNOWN_FOOTER_LINE_RE.sub("", line).rstrip()
        clean = without.strip()
        if not clean and line.strip():
            continue
        if "英语" in clean and "试题" in clean and ("页" in clean or "14" in clean or "13" in clean or "12" in clean):
            continue
        if re.fullmatch(r"[.·*+\-\s]*\d+[.·\s]*\([^)]{1,50}\)\s*", clean):
            continue
        if re.fullmatch(r"20\d{2}\s*[-–—]\s*\d+", clean):
            continue
        kept.append(without)
    return "\n".join(kept)


def strip_source_presentation(value: str, *, preserve_paragraph_markers: bool = False) -> str:
    text = SOURCE_PAGE_RE.sub("", _normalize_bytes(value))
    if preserve_paragraph_markers:
        text = PARAGRAPH_MARKER_RE.sub("\n<<KIANOS_PARAGRAPH>>\n", text)
    else:
        text = PARAGRAPH_MARKER_RE.sub("", text)
    text = re.sub(r"(?m)^\s*---\s*$", "", text)
    return strip_known_footer_lines(text)


def repair_high_confidence_spacing(value: str) -> tuple[str, list[str]]:
    text = value
    applied: list[str] = []
    for source, target in HIGH_CONFIDENCE_SPACING_REPAIRS.items():
        if source in text:
            text = text.replace(source, target)
            applied.append(f"{source}->{target}")
    return text, applied


def omit_source_bound_external_presentation_lines(value: str, source_sha256: str) -> tuple[str, list[str]]:
    omitted = EXTERNAL_PASSAGE_OMIT_LINES_BY_SHA256.get(source_sha256, set())
    if not omitted:
        return value, []
    kept: list[str] = []
    applied: list[str] = []
    for line in value.splitlines():
        clean = line.strip()
        if clean in omitted:
            applied.append(f"omit:{clean}")
            continue
        kept.append(line)
    return "\n".join(kept), applied


def logical_paragraphs(value: str, *, explicit_markers: bool = False) -> list[str]:
    text = _normalize_bytes(value)
    chunks = text.split("<<KIANOS_PARAGRAPH>>") if explicit_markers else [text]
    output: list[str] = []
    for chunk in chunks:
        lines = chunk.splitlines()
        current: list[str] = []
        pending_blank = False
        for raw_line in lines:
            stripped = raw_line.strip()
            if not stripped:
                pending_blank = bool(current)
                continue
            indent = len(raw_line) - len(raw_line.lstrip(" "))
            if current and pending_blank:
                previous = current[-1]
                visible_break = (
                    (len(previous) >= 160 and re.search(r"[.!?\u201d\u2019]['\"]?$", previous))
                    or (indent >= 4 and re.search(r"[.!?\u201d\u2019]['\"]?$", previous))
                )
                if visible_break:
                    output.append(re.sub(r"\s+", " ", " ".join(current)).strip())
                    current = []
            current.append(stripped)
            pending_blank = False
        if current:
            output.append(re.sub(r"\s+", " ", " ".join(current)).strip())
    return [item for item in output if item]


def normalize_external_passage(raw: str, *, title: str = "", source_family: str = "") -> dict:
    source = _normalize_bytes(raw)
    text = strip_source_presentation(source, preserve_paragraph_markers=True)
    text, omitted = omit_source_bound_external_presentation_lines(text, text_sha256(source))
    text, repairs = repair_high_confidence_spacing(text)
    repairs = omitted + repairs
    lines: list[str] = []
    for line in text.splitlines():
        clean = line.strip()
        if not clean:
            lines.append("")
            continue
        if re.fullmatch(r"(?i)(?:READING|READING PASSAGE\s+[1-3]|Test\s+\d+)", clean):
            continue
        if re.fullmatch(r"(?i)\[SOURCE_TEXT_UNCERTAIN\]", clean):
            continue
        if re.match(r"(?i)^You should spend about .*Questions?\s+\d+", clean):
            continue
        if re.match(r"(?i)^Passage\s+\d+\s+below\.?$", clean):
            continue
        normalized_line = re.sub(r"\s+", " ", clean).casefold()
        normalized_title = re.sub(r"\s+", " ", title).casefold()
        if normalized_title and normalized_title in normalized_line and len(normalized_line) <= len(normalized_title) + 32:
            continue
        lines.append(line)
    paragraphs = logical_paragraphs("\n".join(lines), explicit_markers=True)
    if title and paragraphs and re.sub(r"\s+", " ", paragraphs[0]).casefold() == re.sub(r"\s+", " ", title).casefold():
        paragraphs = paragraphs[1:]
    learner_text = "\n\n".join(paragraphs).strip()
    warnings: list[str] = []
    if SOURCE_PAGE_RE.search(learner_text) or PARAGRAPH_MARKER_RE.search(learner_text):
        warnings.append("SOURCE_PRESENTATION_MARKER_UNCERTAIN")
    if not learner_text:
        warnings.append("SOURCE_TEXT_UNCERTAIN")
    return {
        "text": learner_text,
        "paragraphs": paragraphs,
        "spacing_repairs": repairs,
        "warnings": warnings,
        "source_text_sha256": text_sha256(source),
        "source_family": source_family,
    }


def clean_external_question_source(raw: str) -> str:
    text = strip_source_presentation(raw)
    text, _ = repair_high_confidence_spacing(text)
    kept: list[str] = []
    for line in text.splitlines():
        clean = line.strip()
        if re.fullmatch(r"(?i)(?:READING|Test\s+\d+|Questions?\s+\d+\s*[–—-]\s*\d+)", clean):
            kept.append(clean if clean.lower().startswith("questions") else "")
            continue
        kept.append(line.rstrip())
    return re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip()


def _parse_question_block(block: str) -> tuple[str, dict[str, str], str, bool]:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    prompt_lines: list[str] = []
    options: dict[str, list[str]] = {}
    active_option = ""
    used_lines: list[str] = []
    boundary_uncertain = False
    option_re = re.compile(r"^(?:0\s*)?[\[(]?\s*([A-D])\s*[\]).]\s*(.*)$", re.I)
    for line in lines:
        match = option_re.match(line)
        if match:
            active_option = match.group(1).upper()
            if active_option in options:
                boundary_uncertain = True
                break
            options.setdefault(active_option, []).append(match.group(2).strip())
            used_lines.append(line)
        elif active_option:
            if active_option == "D" and all(label in options for label in ("A", "B", "C", "D")):
                boundary_uncertain = True
                break
            options[active_option].append(line)
            used_lines.append(line)
        else:
            prompt_lines.append(line)
            used_lines.append(line)
    prompt = re.sub(r"\s+", " ", " ".join(prompt_lines)).strip()
    clean_options = {key: re.sub(r"\s+", " ", " ".join(value)).strip() for key, value in options.items()}
    return prompt, clean_options, "\n".join(used_lines).strip(), boundary_uncertain


def normalize_external_questions(raw: str, ordinals: list[int], source_family: str) -> list[dict]:
    text = clean_external_question_source(raw)
    line_matches = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.)]\s+", text))
    blocks: dict[int, str] = {}
    for index, match in enumerate(line_matches):
        source_ordinal = int(match.group(1))
        end = line_matches[index + 1].start() if index + 1 < len(line_matches) else len(text)
        blocks[source_ordinal] = text[match.end():end].strip()

    records: list[dict] = []
    ordered_source = sorted(blocks)
    offset = ordered_source[0] - ordinals[0] if ordered_source and source_family == "TOEFL_TPO" else 0
    for ordinal in ordinals:
        source_ordinal = ordinal + offset
        block = blocks.get(source_ordinal, "")
        if not block and source_family == "IELTS_ACADEMIC":
            line = next((
                item for item in text.splitlines()
                if re.search(rf"(?<!\w){ordinal}(?!\w)", item)
                and not re.search(r"(?i)Questions?|boxes|answer sheet|Choose\s+", item)
            ), "")
            block = line.strip()
        prompt, options, safe_source, boundary_uncertain = _parse_question_block(block)
        warnings = [] if block else ["SOURCE_TEXT_UNCERTAIN", "QUESTION_BOUNDARY_SOURCE_TEXT_UNCERTAIN"]
        if boundary_uncertain:
            warnings.extend(["SOURCE_TEXT_UNCERTAIN", "QUESTION_BOUNDARY_SOURCE_TEXT_UNCERTAIN"])
        response_kind = "single_choice" if len(options) >= 2 else "source_bound_response"
        records.append({
            "question_id": "",
            "ordinal": ordinal,
            "source_ordinal": source_ordinal,
            "prompt": prompt or f"Question {ordinal}",
            "options": options,
            "source_text": safe_source or f"Question {ordinal} source boundary was not mechanically located.",
            "response_kind": response_kind,
            "response_limit": 6000,
            "source_refs": [],
            "warnings": list(dict.fromkeys(warnings)),
        })
    return records
