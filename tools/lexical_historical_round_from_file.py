#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

import lexical_historical_round_bulk_triage as triage

CALIBRATION_SAMPLE_SIZE = 12
EXPANSION_OWNER_HINTS: dict[str, list[str]] = {}
EXPANSION_OWNER_TARGETS: list[str] = []
EXPANSION_DECLARED_COUNT: int | None = None


def parse_core_compatible(body: str) -> list[dict[str, Any]]:
    lines = triage.section_lines(body, "### Core Gate", ("All other ordinals", "### Expansion Gate"))
    numbered_owner = re.compile(r"^\s*(\d+)\.\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$")
    bulleted_owner = re.compile(r"^\s*-\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$")
    numbered_word = re.compile(r"^\s*(\d+)\.\s+`([^`]+)`\s+—\s+(.+)$")
    bulleted_word = re.compile(r"^\s*-\s+`([^`]+)`\s+—\s+(.+)$")
    rows: list[dict[str, Any]] = []
    unresolved: list[tuple[int, str, str]] = []

    for line in lines:
        stripped = line.strip()
        m = numbered_owner.match(stripped)
        if m:
            rows.append({"index": int(m.group(1)), "ordinal": int(m.group(2)), "word_id": m.group(3), "approved_revision": m.group(4).strip()})
            continue
        m = bulleted_owner.match(stripped)
        if m:
            rows.append({"index": len(rows) + 1, "ordinal": int(m.group(1)), "word_id": m.group(2), "approved_revision": m.group(3).strip()})
            continue
        m = numbered_word.match(stripped)
        if m:
            unresolved.append((int(m.group(1)), m.group(2).strip(), m.group(3).strip()))
            continue
        m = bulleted_word.match(stripped)
        if m:
            unresolved.append((len(rows) + len(unresolved) + 1, m.group(1).strip(), m.group(2).strip()))

    if unresolved:
        start, end = triage.parse_round_range(body)
        _by_ord, by_word, _by_id = triage.load_range_owners(start, end)
        for index, word, approved_revision in unresolved:
            owner = by_word.get(word.lower())
            if owner is None:
                raise RuntimeError(f"cannot resolve historical Core word within round: {word}")
            ordinal = owner.get("ordinal")
            word_id = owner.get("word_id") or (owner.get("record") or {}).get("word_id")
            if not ordinal or not word_id:
                raise RuntimeError(f"resolved owner missing identity for historical Core word: {word}")
            rows.append({"index": index, "ordinal": int(ordinal), "word_id": word_id, "approved_revision": approved_revision})

    return sorted(rows, key=lambda row: row["index"])


def parse_owner_group_expansion(body: str) -> list[dict[str, Any]] | None:
    global EXPANSION_OWNER_TARGETS, EXPANSION_DECLARED_COUNT, EXPANSION_OWNER_HINTS
    m_targets = re.search(r"### Expansion Gate[^\n]*\nTargets:\s*`([^`]+)`\.", body, flags=re.S)
    m_surfaces = re.search(r"Mandatory high-value surfaces include:\s*(.+?)\n\nEquivalent existing objects", body, flags=re.S)
    if not m_targets or not m_surfaces:
        return None

    EXPANSION_OWNER_TARGETS = [w.strip().lower() for w in m_targets.group(1).split(",") if w.strip()]
    m_declared = re.search(r"Expansion Gate[^\n]*(?:declared\s+)?(\d+)", body, flags=re.I)
    EXPANSION_DECLARED_COUNT = int(m_declared.group(1)) if m_declared else None
    target_set = set(EXPANSION_OWNER_TARGETS)
    chunks = [c.strip().rstrip(".") for c in m_surfaces.group(1).split(";") if c.strip()]
    EXPANSION_OWNER_HINTS = {}
    rows: list[dict[str, Any]] = []

    for i, chunk in enumerate(chunks, 1):
        norm = triage.normalize(chunk.replace("`", ""))
        tokens = re.findall(r"[a-z][a-z'-]*", norm)
        candidates: list[tuple[int, str]] = []
        for pos, token in enumerate(tokens):
            token_forms = triage.possible_forms(token)
            if token == "prediction":
                token_forms.append("predict")
            for form in token_forms:
                if form in target_set:
                    candidates.append((pos, form))
        hints: list[str] = []
        if candidates:
            first_pos = min(pos for pos, _ in candidates)
            first = [word for pos, word in candidates if pos == first_pos]
            hints = list(dict.fromkeys(first))

        # Explicit slash-led owner families intentionally span multiple owner targets.
        lead = norm.split()[0] if norm.split() else ""
        slash_parts = [p for p in lead.split("/") if p]
        slash_hits = [p for p in slash_parts if p in target_set]
        if len(slash_hits) >= 2:
            hints = slash_hits
        if norm.startswith("preparation/prepare"):
            hints = ["preparation", "prepare"]
        elif norm.startswith("presume/pretend/pretext"):
            hints = ["presume", "pretend", "pretext"]
        elif norm.startswith("permission/permit"):
            hints = ["permission", "permit"]

        if not hints:
            raise RuntimeError(f"cannot map mandatory Expansion surface to owner target: {chunk}")
        EXPANSION_OWNER_HINTS[chunk] = hints
        rows.append({"index": i, "approved_target": chunk, "kind": "expansion"})
    return rows


def parse_simple_targets_compatible(body: str, heading_prefix: str, end_prefixes: tuple[str, ...], kind: str) -> list[dict[str, Any]]:
    if kind == "expansion":
        grouped = parse_owner_group_expansion(body)
        if grouped is not None:
            return grouped
    return ORIGINAL_PARSE_SIMPLE(body, heading_prefix, end_prefixes, kind)


def expansion_owner_candidates_compatible(target: str, by_word: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    hints = EXPANSION_OWNER_HINTS.get(target)
    if hints:
        out = [by_word[h] for h in hints if h in by_word]
        if out:
            return out
    return ORIGINAL_EXPANSION_OWNER_CANDIDATES(target, by_word)


def contrast_terms_compatible(text: str) -> list[str]:
    codes = [triage.normalize(c) for c in re.findall(r"`([^`]+)`", text) if triage.normalize(c)]
    if len(codes) >= 2:
        return list(dict.fromkeys(codes))
    if not codes:
        # Historical rounds may use plain `a / b` wording without code spans.
        plain = re.sub(r"^\s*\d+\.\s*", "", text)
        expr = plain.split("—", 1)[0].strip()
        if "/" in expr:
            parts = [triage.normalize(p.split("(", 1)[0].strip()) for p in expr.split("/")]
            parts = [p for p in parts if p]
            if len(parts) >= 2:
                return list(dict.fromkeys(parts))
        return [triage.normalize(expr)] if expr else []
    expr = codes[0]
    if "/" in expr:
        parts = [triage.normalize(p) for p in expr.split("/") if triage.normalize(p)]
        if len(parts) >= 2:
            return list(dict.fromkeys(parts))
    if " vs " in expr.lower():
        return [triage.normalize(p) for p in re.split(r"\s+vs\s+", expr, flags=re.I) if p.strip()]
    return [expr]


def evenly_spaced(values: list[int], size: int) -> list[int]:
    if len(values) <= size:
        return values
    if size <= 1:
        return [values[len(values) // 2]]
    positions = [round(i * (len(values) - 1) / (size - 1)) for i in range(size)]
    return [values[p] for p in dict.fromkeys(positions)]


def option_path(args: list[str], name: str) -> Path | None:
    try:
        i = args.index(name)
    except ValueError:
        return None
    if i + 1 >= len(args):
        return None
    return Path(args[i + 1])


ORIGINAL_PARSE_SIMPLE = triage.parse_simple_numbered_targets
ORIGINAL_EXPANSION_OWNER_CANDIDATES = triage.expansion_owner_candidates


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("usage: lexical_historical_round_from_file.py AUTHORITY_FILE [bulk-triage args...]")
    authority_path = Path(sys.argv[1])
    body = authority_path.read_text(encoding="utf-8")
    forwarded_args = [sys.argv[0], *sys.argv[2:]]
    output_path = option_path(forwarded_args, "--output")
    summary_path = option_path(forwarded_args, "--summary")

    def frozen_fetch_comment(repo: str, comment_id: int):
        return {
            "body": body,
            "html_url": f"frozen-authority:{authority_path.as_posix()}",
            "source_repo": repo,
            "source_comment_id": comment_id,
        }

    triage.fetch_comment = frozen_fetch_comment
    triage.parse_core = parse_core_compatible
    triage.parse_simple_numbered_targets = parse_simple_targets_compatible
    triage.expansion_owner_candidates = expansion_owner_candidates_compatible
    triage.contrast_terms = contrast_terms_compatible
    sys.argv = forwarded_args
    rc = triage.main()
    if rc != 0 or output_path is None or not output_path.is_file():
        return rc

    report = json.loads(output_path.read_text(encoding="utf-8"))
    start = int(report["range"]["start_ordinal"])
    end = int(report["range"]["end_ordinal"])
    by_ord, by_word, _by_id = triage.load_range_owners(start, end)

    if EXPANSION_OWNER_TARGETS:
        report["expansion_owner_group_authority"] = {
            "declared_count": EXPANSION_DECLARED_COUNT,
            "enumerated_count": len(EXPANSION_OWNER_TARGETS),
            "metadata_count_mismatch": bool(EXPANSION_DECLARED_COUNT is not None and EXPANSION_DECLARED_COUNT != len(EXPANSION_OWNER_TARGETS)),
            "mandatory_surface_group_count": len(EXPANSION_OWNER_HINTS),
            "owner_targets": [
                triage.compact_owner(by_word[w]) if w in by_word else {"word": w, "owner_missing_in_round": True}
                for w in EXPANSION_OWNER_TARGETS
            ],
            "mandatory_surface_owner_hints": EXPANSION_OWNER_HINTS,
            "interpretation": "Owner enumeration is coverage metadata. Exact Expansion acceptance is driven by the named mandatory surface groups plus fresh Chat learner-value judgment; owner existence alone is not a PASS."
        }

    core_ordinals = {int(row["ordinal"]) for row in report["core"]}
    candidates = [ordinal for ordinal in range(start, end + 1) if ordinal not in core_ordinals]
    sample_ordinals = evenly_spaced(candidates, CALIBRATION_SAMPLE_SIZE)
    report["direct_pass_calibration_candidates"] = [triage.compact_owner(by_ord[o]) for o in sample_ordinals]
    report["direct_pass_calibration_sample_size"] = len(sample_ordinals)
    report["direct_pass_calibration_rule"] = "Evenly spaced sample from historical Core-direct-pass ordinals. Mechanical inclusion is not semantic acceptance; Chat applies latest-target judgment."
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if summary_path and summary_path.is_file():
        with summary_path.open("a", encoding="utf-8") as f:
            if EXPANSION_OWNER_TARGETS:
                f.write("\n## Expansion owner-group authority\n\n")
                f.write(f"- Declared owner target count: **{EXPANSION_DECLARED_COUNT}**\n")
                f.write(f"- Enumerated unique owner target count: **{len(EXPANSION_OWNER_TARGETS)}**\n")
                f.write(f"- Named mandatory surface groups: **{len(EXPANSION_OWNER_HINTS)}**\n")
            f.write("\n## Direct-pass latest-target calibration candidates\n\n")
            for o in report["direct_pass_calibration_candidates"]:
                f.write(f"- `{o.get('ordinal')}` `{o.get('word')}` — active senses: {o.get('health', {}).get('active_sense_count')} · flags: {o.get('health', {}).get('health_flags')}\n")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
