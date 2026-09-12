#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

import lexical_historical_round_bulk_triage as triage

CALIBRATION_SAMPLE_SIZE = 12


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


def contrast_terms_compatible(text: str) -> list[str]:
    codes = [triage.normalize(c) for c in re.findall(r"`([^`]+)`", text) if triage.normalize(c)]
    if len(codes) >= 2:
        return list(dict.fromkeys(codes))
    if not codes:
        return []
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
    triage.contrast_terms = contrast_terms_compatible
    sys.argv = forwarded_args
    rc = triage.main()
    if rc != 0 or output_path is None or not output_path.is_file():
        return rc

    report = json.loads(output_path.read_text(encoding="utf-8"))
    start = int(report["range"]["start_ordinal"])
    end = int(report["range"]["end_ordinal"])
    core_ordinals = {int(row["ordinal"]) for row in report["core"]}
    candidates = [ordinal for ordinal in range(start, end + 1) if ordinal not in core_ordinals]
    sample_ordinals = evenly_spaced(candidates, CALIBRATION_SAMPLE_SIZE)
    by_ord, _by_word, _by_id = triage.load_range_owners(start, end)
    report["direct_pass_calibration_candidates"] = [triage.compact_owner(by_ord[o]) for o in sample_ordinals]
    report["direct_pass_calibration_sample_size"] = len(sample_ordinals)
    report["direct_pass_calibration_rule"] = "Evenly spaced sample from historical Core-direct-pass ordinals. Mechanical inclusion is not semantic acceptance; Chat applies latest-target judgment."
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if summary_path and summary_path.is_file():
        with summary_path.open("a", encoding="utf-8") as f:
            f.write("\n## Direct-pass latest-target calibration candidates\n\n")
            for o in report["direct_pass_calibration_candidates"]:
                f.write(f"- `{o.get('ordinal')}` `{o.get('word')}` — active senses: {o.get('health', {}).get('active_sense_count')} · flags: {o.get('health', {}).get('health_flags')}\n")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
