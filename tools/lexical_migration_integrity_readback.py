#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS_DIR = ROOT / "content" / "lexical" / "words" / "by-ordinal"


def normalize(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).lower()
    s = (
        s.replace("’", "'")
        .replace("‘", "'")
        .replace("“", '"')
        .replace("”", '"')
        .replace("…", "...")
    )
    s = re.sub(r"\b(sb|somebody|someone)\b", "sb", s)
    s = re.sub(r"\b(sth|something)\b", "sth", s)
    s = re.sub(r"\bone['’]?s\b", "one's", s)
    s = re.sub(r"[^a-z0-9+'/-]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def add_surface(
    out: list[dict[str, Any]],
    kind: str,
    text: Any,
    *,
    object_id: str | None = None,
    learner_visible: bool = True,
    exam_value: str | None = None,
    source_sense_id: str | None = None,
    source_sense_status: str | None = None,
) -> None:
    if not isinstance(text, str) or not text.strip():
        return
    out.append(
        {
            "kind": kind,
            "text": text,
            "normalized": normalize(text),
            "object_id": object_id,
            "learner_visible": learner_visible,
            "exam_value": exam_value,
            "source_sense_id": source_sense_id,
            "source_sense_status": source_sense_status,
        }
    )


def owner_surfaces(
    owner: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, str], list[str], list[dict[str, Any]]]:
    rec = owner.get("record") or {}
    identity = owner.get("identity_refs") or {}
    sense_status: dict[str, str] = {}
    for row in identity.get("senses") or []:
        sid = row.get("sense_id")
        status = row.get("status")
        if sid:
            sense_status[sid] = status or "unknown"

    surfaces: list[dict[str, Any]] = []
    core = rec.get("core_concept") or {}
    add_surface(surfaces, "core_meaning_cn", core.get("core_meaning_cn"))
    add_surface(surfaces, "core_meaning_en", core.get("core_meaning_en"))
    add_surface(surfaces, "mental_model_cn", core.get("mental_model_cn"))
    add_surface(surfaces, "mental_model_en", core.get("mental_model_en"))

    stale_core_refs: list[str] = []
    for idx, cluster in enumerate(core.get("core_clusters") or []):
        add_surface(
            surfaces,
            "core_cluster_label_cn",
            cluster.get("label_cn"),
            object_id=f"core_cluster:{idx}",
        )
        add_surface(
            surfaces,
            "core_cluster_label_en",
            cluster.get("label_en"),
            object_id=f"core_cluster:{idx}",
        )
        for sid in cluster.get("sense_ids") or []:
            if sense_status.get(sid) != "active":
                stale_core_refs.append(sid)

    for sense in rec.get("senses") or []:
        sid = sense.get("sense_id")
        for field in ("definition_cn", "definition_en", "sense_label_en", "governing_pattern"):
            kind = "active_sense_" + field if field != "governing_pattern" else field
            add_surface(surfaces, kind, sense.get(field), object_id=sid)
        for coll in sense.get("collocations") or []:
            cid = coll.get("collocation_id")
            ev = coll.get("exam_value")
            add_surface(
                surfaces,
                "collocation_phrase",
                coll.get("phrase"),
                object_id=cid,
                exam_value=ev,
                source_sense_id=sid,
                source_sense_status=sense_status.get(sid),
            )
            add_surface(
                surfaces,
                "collocation_meaning_cn",
                coll.get("meaning_cn"),
                object_id=cid,
                exam_value=ev,
                source_sense_id=sid,
                source_sense_status=sense_status.get(sid),
            )

    dangling_construction_anchors: list[dict[str, Any]] = []
    for cons in rec.get("constructions") or []:
        cid = cons.get("construction_id") or cons.get("fact_id")
        ssid = cons.get("source_sense_id")
        sstatus = sense_status.get(ssid) if ssid else None
        if ssid and sstatus != "active":
            dangling_construction_anchors.append(
                {
                    "construction_id": cid,
                    "source_sense_id": ssid,
                    "source_sense_status": sstatus or "missing",
                }
            )
        for field in ("pattern", "boundary", "meaning_cn", "definition_cn", "definition_en"):
            add_surface(
                surfaces,
                f"construction_{field}",
                cons.get(field),
                object_id=cid,
                source_sense_id=ssid,
                source_sense_status=sstatus,
            )

    for sec in rec.get("secondary_senses") or []:
        sid = sec.get("stable_sense_id") or sec.get("sense_id") or sec.get("fact_id")
        for field in ("definition_cn", "definition_en", "boundary", "meaning_cn"):
            add_surface(
                surfaces,
                f"secondary_{field}",
                sec.get(field),
                object_id=sid,
            )

    for field in ("semantic_neighbors", "confusables", "word_family"):
        for obj in rec.get(field) or []:
            oid = obj.get("fact_id") or obj.get("relation_id")
            for key in (
                "boundary",
                "meaning_cn",
                "definition_cn",
                "definition_en",
                "pattern",
                "target_word",
                "label_en",
            ):
                add_surface(
                    surfaces,
                    f"{field}_{key}",
                    obj.get(key),
                    object_id=oid,
                )

    for ref in owner.get("reference_senses") or []:
        sid = ref.get("stable_sense_id")
        for field in ("definition_cn", "definition_en"):
            add_surface(
                surfaces,
                f"reference_{field}",
                ref.get(field),
                object_id=sid,
                learner_visible=False,
                source_sense_id=sid,
                source_sense_status=ref.get("status"),
            )

    return (
        surfaces,
        sense_status,
        sorted(set(stale_core_refs)),
        dangling_construction_anchors,
    )


def load_owners() -> dict[str, dict[str, Any]]:
    owners: dict[str, dict[str, Any]] = {}
    paths = sorted(WORDS_DIR.glob("o*.json"))
    if not paths:
        raise RuntimeError(f"no owners found in {WORDS_DIR}")
    for path in paths:
        obj = load_json(path)
        wid = obj.get("word_id") or (obj.get("record") or {}).get("word_id")
        ordinal = obj.get("ordinal")
        if not wid or not isinstance(ordinal, int):
            raise RuntimeError(f"invalid owner identity in {path}")
        if wid in owners:
            raise RuntimeError(f"duplicate word_id {wid}")
        obj["_path"] = str(path.relative_to(ROOT))
        owners[wid] = obj
    return owners


def match_probe(
    probe: dict[str, Any], surfaces: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    terms = [normalize(t) for t in probe.get("all_terms") or [] if normalize(t)]
    if not terms:
        return []
    matches: list[dict[str, Any]] = []
    for surface in surfaces:
        norm = surface["normalized"]
        if norm and all(term in norm for term in terms):
            row = {k: v for k, v in surface.items() if k != "normalized"}
            row["match_mode"] = "normalized_substring"
            matches.append(row)
    return matches


def mechanical_label(probe_rows: list[dict[str, Any]]) -> str:
    flat = [m for p in probe_rows for m in p["matches"]]
    if not flat:
        return "NO_LITERAL_OR_NORMALIZED_MATCH"

    matched_probe_count = sum(bool(p["matches"]) for p in probe_rows)
    if matched_probe_count < len(probe_rows):
        return "PARTIAL_FAMILY_MATCH"

    visible = [r for r in flat if r.get("learner_visible")]
    if not visible:
        return "MATCH_REFERENCE_ONLY"

    non_usage = [
        r
        for r in visible
        if r.get("kind") != "collocation_phrase"
        or r.get("exam_value") != "usage_example"
    ]
    if non_usage:
        return "MATCH_PRESENT"
    return "MATCH_ONLY_AS_USAGE_EXAMPLE"


def health_flags(health: dict[str, Any]) -> list[str]:
    flags: list[str] = []
    if health["active_sense_count"] == 0:
        flags.append("NO_ACTIVE_SENSE")
    if health["stale_core_sense_refs"]:
        flags.append(f"STALE_CORE:{len(health['stale_core_sense_refs'])}")
    if health["dangling_construction_anchors"]:
        flags.append(
            f"DEAD_CONSTRUCTION_ANCHOR:{len(health['dangling_construction_anchors'])}"
        )
    return flags


def review_priority(label: str, flags: list[str]) -> str:
    if flags:
        return "P0_OWNER_HEALTH"
    if label in {"NO_LITERAL_OR_NORMALIZED_MATCH", "MATCH_REFERENCE_ONLY"}:
        return "P1_MISSING_OR_HIDDEN"
    if label == "PARTIAL_FAMILY_MATCH":
        return "P1_PARTIAL_FAMILY"
    if label == "MATCH_ONLY_AS_USAGE_EXAMPLE":
        return "P2_PROMOTION_CANDIDATE"
    return "P3_PRESENT_CANDIDATE"


def compact_candidates(probe_rows: list[dict[str, Any]], limit: int = 3) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str]] = set()
    rows: list[dict[str, Any]] = []
    for probe in probe_rows:
        for match in probe["matches"]:
            key = (
                match.get("kind") or "",
                match.get("object_id") or "",
                match.get("text") or "",
            )
            if key in seen:
                continue
            seen.add(key)
            rows.append(
                {
                    "kind": match.get("kind"),
                    "object_id": match.get("object_id"),
                    "text": match.get("text"),
                    "exam_value": match.get("exam_value"),
                    "source_sense_id": match.get("source_sense_id"),
                    "source_sense_status": match.get("source_sense_status"),
                }
            )
            if len(rows) >= limit:
                return rows
    return rows


def md_escape(value: Any) -> str:
    return str(value if value is not None else "").replace("|", "\\|").replace("\n", " ")


def candidate_cell(candidates: list[dict[str, Any]]) -> str:
    if not candidates:
        return "—"
    parts = []
    for c in candidates:
        oid = c.get("object_id") or "no-id"
        text = c.get("text") or ""
        kind = c.get("kind") or "surface"
        suffix = f" [{c['exam_value']}]" if c.get("exam_value") else ""
        parts.append(f"`{kind}:{oid}` {text}{suffix}")
    return "<br>".join(md_escape(p) for p in parts)


def render_summary(report: dict[str, Any]) -> str:
    targets = report["targets"]
    word_health = report["word_health"]
    health_warning_count = sum(bool(h["health_flags"]) for h in word_health)
    priority_counts: dict[str, int] = {}
    for row in targets:
        priority_counts[row["review_priority"]] = (
            priority_counts.get(row["review_priority"], 0) + 1
        )

    lines = [
        f"# Lexical Migration Integrity — {report.get('audit_id') or 'readback'}",
        "",
        f"- Targets: **{report['target_count']}** across **{report['word_count']}** words",
        f"- Owner health warnings: **{health_warning_count}**",
        "- Semantic mutation: **0** · Learner-state mutation: **0** · Mechanical semantic judgment: **0**",
        "- These labels are retrieval/readback evidence only; **Chat still owns semantic acceptance and repair decisions**.",
        "",
        "## Mechanical labels",
        "",
    ]
    for key, count in sorted(report["mechanical_label_counts"].items()):
        lines.append(f"- `{key}`: **{count}**")
    lines.extend(["", "## Review priorities", ""])
    for key, count in sorted(priority_counts.items()):
        lines.append(f"- `{key}`: **{count}**")

    warnings = [h for h in word_health if h["health_flags"]]
    if warnings:
        lines.extend(
            [
                "",
                "## Owner-health warnings",
                "",
                "| Ordinal | Word | Flags |",
                "|---:|---|---|",
            ]
        )
        for h in warnings:
            lines.append(
                f"| {h['ordinal']} | `{md_escape(h['word_id'])}` | "
                f"{md_escape(', '.join(h['health_flags']))} |"
            )

    lines.extend(
        [
            "",
            "## Target queue",
            "",
            "| Priority | ID | Owner | Approved target | Mechanical readback | Probes | Candidate surfaces | Health |",
            "|---|---|---|---|---|---:|---|---|",
        ]
    )
    priority_order = {
        "P0_OWNER_HEALTH": 0,
        "P1_MISSING_OR_HIDDEN": 1,
        "P1_PARTIAL_FAMILY": 2,
        "P2_PROMOTION_CANDIDATE": 3,
        "P3_PRESENT_CANDIDATE": 4,
    }
    for row in sorted(
        targets,
        key=lambda r: (
            priority_order.get(r["review_priority"], 9),
            r["ordinal"],
            r["target_id"],
        ),
    ):
        probe_count = len(row["probe_results"])
        matched = sum(bool(p["matches"]) for p in row["probe_results"])
        lines.append(
            "| "
            + " | ".join(
                [
                    f"`{md_escape(row['review_priority'])}`",
                    f"`{md_escape(row['target_id'])}`",
                    f"{row['ordinal']} `{md_escape(row['word_id'])}`",
                    md_escape(row["approved_target"]),
                    f"`{md_escape(row['mechanical_label'])}`",
                    f"{matched}/{probe_count}",
                    candidate_cell(row["candidate_surfaces"]),
                    md_escape(", ".join(row["health_flags"]) or "—"),
                ]
            )
            + " |"
        )

    lines.extend(
        [
            "",
            "### Interpretation",
            "",
            "Start with P0/P1. P2 usually means the approved material exists only as a weak usage-example surface and is a PROMOTE/RECLASSIFY candidate. P3 means a structurally visible candidate exists; it is **not** automatic semantic acceptance.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Read-only Natural Owner migration-integrity readback."
    )
    ap.add_argument("authority_json", type=Path)
    ap.add_argument("--output", type=Path)
    ap.add_argument("--summary", type=Path)
    args = ap.parse_args()

    authority = load_json(args.authority_json)
    targets = authority.get("targets") or []
    expected_targets = authority.get("expected_target_count")
    expected_words = authority.get("expected_word_count")

    if expected_targets is not None and len(targets) != expected_targets:
        raise RuntimeError(
            f"target count mismatch: {len(targets)} != {expected_targets}"
        )

    distinct_words = sorted({t["word_id"] for t in targets})
    if expected_words is not None and len(distinct_words) != expected_words:
        raise RuntimeError(
            f"word count mismatch: {len(distinct_words)} != {expected_words}"
        )

    owners = load_owners()
    missing_words = [wid for wid in distinct_words if wid not in owners]
    if missing_words:
        raise RuntimeError(f"missing owner(s): {missing_words}")

    start = (authority.get("range") or {}).get("start_ordinal")
    end = (authority.get("range") or {}).get("end_ordinal")
    outside = []
    for wid in distinct_words:
        ordinal = owners[wid]["ordinal"]
        if (start is not None and ordinal < start) or (
            end is not None and ordinal > end
        ):
            outside.append((wid, ordinal))
    if outside:
        raise RuntimeError(f"target owner outside declared range: {outside}")

    word_health: dict[str, dict[str, Any]] = {}
    all_results: list[dict[str, Any]] = []
    counts: dict[str, int] = {}

    for target in targets:
        wid = target["word_id"]
        owner = owners[wid]
        surfaces, _statuses, stale_core, dangling = owner_surfaces(owner)
        active_senses = (owner.get("record") or {}).get("senses") or []

        if wid not in word_health:
            health = {
                "word_id": wid,
                "ordinal": owner["ordinal"],
                "path": owner["_path"],
                "active_sense_count": len(active_senses),
                "relation_ref_count": len(owner.get("relation_refs") or []),
                "stale_core_sense_refs": stale_core,
                "dangling_construction_anchors": dangling,
            }
            health["health_flags"] = health_flags(health)
            word_health[wid] = health

        probe_rows = []
        for probe in target.get("probes") or []:
            matches = match_probe(probe, surfaces)
            probe_rows.append(
                {
                    "label": probe.get("label"),
                    "all_terms": probe.get("all_terms") or [],
                    "matches": matches,
                }
            )

        label = mechanical_label(probe_rows)
        counts[label] = counts.get(label, 0) + 1
        flags = list(word_health[wid]["health_flags"])
        all_results.append(
            {
                "target_id": target["target_id"],
                "word_id": wid,
                "ordinal": owner["ordinal"],
                "approved_target": target["approved_target"],
                "mechanical_label": label,
                "review_priority": review_priority(label, flags),
                "health_flags": flags,
                "candidate_surfaces": compact_candidates(probe_rows),
                "probe_results": probe_rows,
                "owner_health": word_health[wid],
            }
        )

    report = {
        "schema": "kianos.lexical.migration_integrity.readback_report.v1",
        "audit_id": authority.get("audit_id"),
        "authority_source": authority.get("semantic_authority"),
        "semantic_mutation_performed": False,
        "learner_state_mutation_performed": False,
        "mechanical_semantic_judgment_performed": False,
        "target_count": len(all_results),
        "word_count": len(word_health),
        "mechanical_label_counts": dict(sorted(counts.items())),
        "word_health": [word_health[wid] for wid in distinct_words],
        "targets": all_results,
        "interpretation_rule": (
            "Mechanical labels describe literal/normalized Current surface evidence only. "
            "They are not semantic acceptance or repair instructions. Chat must compare each "
            "result with historical approved authority before classifying or applying."
        ),
    }

    text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    elif not args.summary:
        sys.stdout.write(text)

    summary = render_summary(report)
    if args.summary:
        args.summary.parent.mkdir(parents=True, exist_ok=True)
        args.summary.write_text(summary + "\n", encoding="utf-8")

    print(
        f"READBACK_PASS targets={len(all_results)} words={len(word_health)} "
        + " ".join(f"{k}={v}" for k, v in sorted(counts.items())),
        file=sys.stderr,
    )
    bad_health = [h for h in word_health.values() if h["health_flags"]]
    print(f"OWNER_HEALTH_WARNINGS={len(bad_health)}", file=sys.stderr)
    for h in bad_health:
        print(
            f"WARN {h['ordinal']} {h['word_id']} "
            f"{','.join(h['health_flags'])}",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
