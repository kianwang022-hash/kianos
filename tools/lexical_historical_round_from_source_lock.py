#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

import lexical_historical_round_bulk_triage as triage

CALIBRATION_SAMPLE_SIZE = 12
ORIGINAL_FETCH_COMMENT = triage.fetch_comment
ORIGINAL_EXPANSION_OWNER_CANDIDATES = triage.expansion_owner_candidates

GROUPED_EXPANSION_LINES: list[str] = []
GROUPED_EXPANSION_ROWS: list[dict[str, Any]] = []


def lock_value(text: str, label: str, *, required: bool = True) -> str | None:
    m = re.search(rf"^-\s*{re.escape(label)}:\s*`([^`]+)`\s*$", text, flags=re.M)
    if m:
        return m.group(1).strip()
    if required:
        raise RuntimeError(f"missing authority lock field: {label}")
    return None


def parse_source_lock(text: str) -> dict[str, Any]:
    mode = lock_value(text, "Source mode")
    if mode != "github-comment-lock":
        raise RuntimeError(f"unsupported Source mode: {mode}")
    return {
        "repo": lock_value(text, "Source repo"),
        "comment_id": int(lock_value(text, "Source comment id")),
        "created_at": lock_value(text, "Source created_at"),
        "updated_at": lock_value(text, "Source updated_at"),
        "expected_core": int(lock_value(text, "Expected Core revisions")),
        "expected_direct_pass": int(lock_value(text, "Expected Core direct pass")),
        "expected_grouped_expansion_lines": int(lock_value(text, "Expected grouped Expansion lines")),
        "expected_contrast": int(lock_value(text, "Expected Contrast targets")),
    }


def parse_core_compatible(body: str) -> list[dict[str, Any]]:
    lines = triage.section_lines(body, "### Core Gate", ("### Direct pass", "### Expansion Gate"))
    patterns = [
        re.compile(r"^\s*(\d+)\.\s+(\d+)\s+`(word:[^`]+)`\s+—\s+(.+)$"),
        re.compile(r"^\s*(\d+)\.\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$"),
    ]
    rows: list[dict[str, Any]] = []
    for line in lines:
        stripped = line.strip()
        if not re.match(r"^\d+\.\s+", stripped):
            continue
        match = next((rx.match(stripped) for rx in patterns if rx.match(stripped)), None)
        if not match:
            raise RuntimeError(f"unparsed Core line: {stripped}")
        rows.append({
            "index": int(match.group(1)),
            "ordinal": int(match.group(2)),
            "word_id": match.group(3),
            "approved_revision": match.group(4).strip(),
        })
    return rows


def _bullet_blocks(lines: list[str]) -> list[str]:
    blocks: list[str] = []
    current: list[str] = []
    for raw in lines:
        stripped = raw.strip()
        if stripped.startswith("- "):
            if current:
                blocks.append(" ".join(current).strip())
            current = [stripped[2:].strip()]
        elif current and stripped:
            current.append(stripped)
    if current:
        blocks.append(" ".join(current).strip())
    return blocks


def parse_grouped_expansion(body: str) -> list[dict[str, Any]]:
    global GROUPED_EXPANSION_LINES, GROUPED_EXPANSION_ROWS
    lines = triage.section_lines(body, "### Expansion Gate", ("### Contrast Gate",))
    blocks = _bullet_blocks(lines)
    if not blocks:
        raise RuntimeError("R18-style grouped Expansion section has no bullet lines")
    GROUPED_EXPANSION_LINES = blocks
    rows: list[dict[str, Any]] = []
    for grouped_line_index, block in enumerate(blocks, 1):
        chunks = [chunk.strip().rstrip(".") for chunk in block.split(";") if chunk.strip()]
        for chunk in chunks:
            rows.append({
                "index": len(rows) + 1,
                "grouped_line_index": grouped_line_index,
                "approved_target": chunk,
                "kind": "expansion",
            })
    GROUPED_EXPANSION_ROWS = rows
    return rows


def parse_bulleted_contrast(body: str) -> list[dict[str, Any]]:
    lines = triage.section_lines(
        body,
        "### Contrast Gate",
        ("### Existing verified relations", "### Existing", "Canonical apply", "Canonical Apply"),
    )
    blocks = _bullet_blocks(lines)
    if not blocks:
        raise RuntimeError("R18-style Contrast section has no bullet targets")
    return [
        {"index": i, "approved_target": block.strip().rstrip("."), "kind": "contrast"}
        for i, block in enumerate(blocks, 1)
    ]


def parse_targets_compatible(body: str, heading_prefix: str, end_prefixes: tuple[str, ...], kind: str) -> list[dict[str, Any]]:
    if kind == "expansion":
        return parse_grouped_expansion(body)
    if kind == "contrast":
        return parse_bulleted_contrast(body)
    return triage.parse_simple_numbered_targets(body, heading_prefix, end_prefixes, kind)


def contrast_terms_compatible(text: str) -> list[str]:
    codes = [triage.normalize(c) for c in re.findall(r"`([^`]+)`", text) if triage.normalize(c)]
    if len(codes) >= 2:
        return list(dict.fromkeys(codes))
    expr = re.sub(r"^\s*\d+\.\s*", "", text).strip()
    expr_no_note = expr.split("—", 1)[0].strip()
    raw = codes[0] if codes else triage.normalize(expr_no_note)

    stress = re.match(
        r"^([a-z][a-z'-]*)\s+(?:noun|verb|adjective|adj|adverb|adv)(?:\s+vs\s+(?:noun|verb|adjective|adj|adverb|adv))?\s+(?:stress|pronunciation)",
        raw,
        flags=re.I,
    )
    if stress:
        return [triage.normalize(stress.group(1))]

    if "/" in raw:
        parts = [triage.normalize(p.split("(", 1)[0].strip()) for p in raw.split("/")]
        parts = [p for p in parts if p]
        if len(parts) >= 2:
            return list(dict.fromkeys(parts))
    if " vs " in raw.lower():
        parts = [triage.normalize(p) for p in re.split(r"\s+vs\s+", raw, flags=re.I) if p.strip()]
        if len(parts) >= 2:
            return list(dict.fromkeys(parts))
    return [raw] if raw else []


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
        raise SystemExit("usage: lexical_historical_round_from_source_lock.py AUTHORITY_LOCK [bulk-triage args...]")

    lock_path = Path(sys.argv[1])
    lock_text = lock_path.read_text(encoding="utf-8")
    lock = parse_source_lock(lock_text)
    forwarded_args = [sys.argv[0], *sys.argv[2:]]
    output_path = option_path(forwarded_args, "--output")
    summary_path = option_path(forwarded_args, "--summary")

    def locked_fetch_comment(repo: str, comment_id: int):
        if repo != lock["repo"] or int(comment_id) != int(lock["comment_id"]):
            raise RuntimeError(f"source lock mismatch: {repo}#{comment_id}")
        comment = ORIGINAL_FETCH_COMMENT(repo, comment_id)
        if comment.get("created_at") != lock["created_at"]:
            raise RuntimeError(f"source created_at mismatch: {comment.get('created_at')} != {lock['created_at']}")
        if comment.get("updated_at") != lock["updated_at"]:
            raise RuntimeError(f"source updated_at mismatch: {comment.get('updated_at')} != {lock['updated_at']}")
        return comment

    triage.fetch_comment = locked_fetch_comment
    triage.parse_core = parse_core_compatible
    triage.parse_simple_numbered_targets = parse_targets_compatible
    triage.contrast_terms = contrast_terms_compatible
    sys.argv = forwarded_args
    rc = triage.main()
    if rc != 0 or output_path is None or not output_path.is_file():
        return rc

    report = json.loads(output_path.read_text(encoding="utf-8"))
    if report["counts"]["core"] != lock["expected_core"]:
        raise RuntimeError(f"Core lock count mismatch: {report['counts']['core']} != {lock['expected_core']}")
    if report["counts"]["contrast"] != lock["expected_contrast"]:
        raise RuntimeError(f"Contrast lock count mismatch: {report['counts']['contrast']} != {lock['expected_contrast']}")
    if len(GROUPED_EXPANSION_LINES) != lock["expected_grouped_expansion_lines"]:
        raise RuntimeError(
            f"grouped Expansion line mismatch: {len(GROUPED_EXPANSION_LINES)} != {lock['expected_grouped_expansion_lines']}"
        )

    start = int(report["range"]["start_ordinal"])
    end = int(report["range"]["end_ordinal"])
    by_ord, _by_word, _by_id = triage.load_range_owners(start, end)
    core_ordinals = {int(row["ordinal"]) for row in report["core"]}
    direct_pass_candidates = [ordinal for ordinal in range(start, end + 1) if ordinal not in core_ordinals]
    if len(direct_pass_candidates) != lock["expected_direct_pass"]:
        raise RuntimeError(
            f"Core direct-pass lock mismatch: {len(direct_pass_candidates)} != {lock['expected_direct_pass']}"
        )
    sample_ordinals = evenly_spaced(direct_pass_candidates, CALIBRATION_SAMPLE_SIZE)

    report["authority_lock"] = {
        "path": lock_path.as_posix(),
        "source_mode": "github-comment-lock",
        "source_repo": lock["repo"],
        "source_comment_id": lock["comment_id"],
        "source_created_at": lock["created_at"],
        "source_updated_at": lock["updated_at"],
    }
    report["grouped_expansion_authority"] = {
        "historical_grouped_line_count": len(GROUPED_EXPANSION_LINES),
        "compiled_surface_group_count": len(GROUPED_EXPANSION_ROWS),
        "grouped_lines": GROUPED_EXPANSION_LINES,
        "compiled_groups": [
            {
                "index": row["index"],
                "grouped_line_index": row["grouped_line_index"],
                "approved_target": row["approved_target"],
            }
            for row in GROUPED_EXPANSION_ROWS
        ],
        "interpretation": (
            "Historical bullet lines are transport formatting, not acceptance units. "
            "Each semicolon-delimited learner surface/family is triaged separately; family shorthand stays group-level authority and is not expanded by mechanical inference."
        ),
    }
    report["direct_pass_calibration_candidates"] = [triage.compact_owner(by_ord[o]) for o in sample_ordinals]
    report["direct_pass_calibration_sample_size"] = len(sample_ordinals)
    report["direct_pass_calibration_rule"] = (
        "Evenly spaced sample from historical Core-direct-pass ordinals. Mechanical inclusion is not semantic acceptance; Chat applies latest-target judgment."
    )
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if summary_path and summary_path.is_file():
        with summary_path.open("a", encoding="utf-8") as f:
            f.write("\n## Source lock\n\n")
            f.write(f"- Locked comment: `{lock['repo']}#{lock['comment_id']}`\n")
            f.write(f"- Locked updated_at: `{lock['updated_at']}`\n")
            f.write("\n## Grouped Expansion authority\n\n")
            f.write(f"- Historical grouped lines: **{len(GROUPED_EXPANSION_LINES)}**\n")
            f.write(f"- Compiled surface/family groups: **{len(GROUPED_EXPANSION_ROWS)}**\n")
            f.write("\n## Direct-pass latest-target calibration candidates\n\n")
            for owner in report["direct_pass_calibration_candidates"]:
                f.write(
                    f"- `{owner.get('ordinal')}` `{owner.get('word')}` — active senses: "
                    f"{owner.get('health', {}).get('active_sense_count')} · flags: {owner.get('health', {}).get('health_flags')}\n"
                )
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
