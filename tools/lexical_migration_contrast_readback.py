#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS_DIR = ROOT / "content" / "lexical" / "words" / "by-ordinal"
RELATIONS_DIR = ROOT / "content" / "lexical" / "relations" / "by-id"


def norm(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).lower().replace("’", "'").replace("‘", "'")
    text = re.sub(r"[^a-z0-9+'/-]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_words() -> tuple[dict[str, dict[str, Any]], dict[str, str], dict[str, str]]:
    owners: dict[str, dict[str, Any]] = {}
    by_word: dict[str, str] = {}
    sense_status: dict[str, str] = {}
    for path in sorted(WORDS_DIR.glob("o*.json")):
        owner = load_json(path)
        wid = owner.get("word_id") or (owner.get("record") or {}).get("word_id")
        ordinal = owner.get("ordinal")
        word = owner.get("word") or (owner.get("record") or {}).get("word")
        if not isinstance(wid, str) or not isinstance(ordinal, int) or not isinstance(word, str):
            raise RuntimeError(f"invalid word owner identity: {path}")
        owner["_path"] = str(path.relative_to(ROOT))
        owners[wid] = owner
        by_word[norm(word)] = wid
        for row in (owner.get("identity_refs") or {}).get("senses") or []:
            sid = row.get("sense_id")
            if sid:
                sense_status[sid] = row.get("status") or "unknown"
    if not owners:
        raise RuntimeError("no word owners found")
    return owners, by_word, sense_status


def owner_health(owner: dict[str, Any]) -> dict[str, Any]:
    rec = owner.get("record") or {}
    identity = owner.get("identity_refs") or {}
    statuses = {r.get("sense_id"): r.get("status") for r in identity.get("senses") or [] if r.get("sense_id")}
    stale: list[str] = []
    for cluster in ((rec.get("core_concept") or {}).get("core_clusters") or []):
        for sid in cluster.get("sense_ids") or []:
            if statuses.get(sid) != "active":
                stale.append(sid)
    active = len(rec.get("senses") or [])
    flags: list[str] = []
    if active == 0:
        flags.append("NO_ACTIVE_SENSE")
    if stale:
        flags.append(f"STALE_CORE:{len(set(stale))}")
    return {
        "path": owner.get("_path"),
        "active_sense_count": active,
        "stale_core_sense_refs": sorted(set(stale)),
        "health_flags": flags,
    }


def load_relation_views() -> dict[str, list[dict[str, Any]]]:
    views: dict[str, list[dict[str, Any]]] = {}
    for path in sorted(RELATIONS_DIR.rglob("*.json")):
        rel = load_json(path)
        rid = rel.get("relation_id")
        fact = rel.get("fact_record") or {}
        for view in rel.get("word_views") or []:
            source_wid = view.get("source_word_id")
            payload = view.get("payload") or {}
            if not isinstance(source_wid, str):
                continue
            rows = views.setdefault(source_wid, [])
            rows.append(
                {
                    "relation_id": rid,
                    "relation_path": str(path.relative_to(ROOT)),
                    "source_word_id": source_wid,
                    "source_ordinal": view.get("source_ordinal"),
                    "field": view.get("field"),
                    "target_word": payload.get("target_word") or fact.get("target_word"),
                    "boundary": payload.get("boundary") or fact.get("boundary"),
                    "direction": payload.get("direction") or fact.get("direction"),
                    "source_sense_id": payload.get("source_sense_id") or fact.get("source_sense_id"),
                    "target_sense_id": payload.get("target_sense_id") or fact.get("target_sense_id"),
                    "publication_status": payload.get("publication_status") or fact.get("publication_status"),
                    "verification_status": payload.get("verification_status") or fact.get("verification_status"),
                    "dimensions": payload.get("dimensions") or fact.get("dimensions") or {},
                    "shared_definition": payload.get("shared_definition") or fact.get("content", {}).get("shared_definition"),
                }
            )
    return views


def compact_view(row: dict[str, Any], sense_status: dict[str, str]) -> dict[str, Any]:
    ssid = row.get("source_sense_id")
    tsid = row.get("target_sense_id")
    return {
        "relation_id": row.get("relation_id"),
        "relation_path": row.get("relation_path"),
        "target_word": row.get("target_word"),
        "boundary": row.get("boundary"),
        "direction": row.get("direction"),
        "source_sense_id": ssid,
        "source_sense_status": sense_status.get(ssid) if ssid else None,
        "target_sense_id": tsid,
        "target_sense_status": sense_status.get(tsid) if tsid else None,
        "publication_status": row.get("publication_status"),
        "verification_status": row.get("verification_status"),
        "dimensions": row.get("dimensions") or {},
        "shared_definition": row.get("shared_definition"),
    }


def relation_anchor_flags(views: list[dict[str, Any]]) -> list[str]:
    flags: list[str] = []
    for row in views:
        if row.get("source_sense_id") and row.get("source_sense_status") != "active":
            flags.append("DEAD_SOURCE_ANCHOR")
        if row.get("target_sense_id") and row.get("target_sense_status") != "active":
            flags.append("DEAD_TARGET_ANCHOR")
    return sorted(set(flags))


def priority(label: str, owner_flags: list[str], relation_flags: list[str]) -> str:
    if owner_flags:
        return "P0_OWNER_HEALTH"
    if relation_flags:
        return "P1_DEAD_RELATION_ANCHOR"
    if label in {"NO_SOURCE_VIEW", "REVERSE_ONLY", "PARTIAL_SOURCE_VIEW"}:
        return "P1_RELATION_GAP"
    if label == "SELF_CONTRAST_OWNER_REVIEW":
        return "P2_SELF_CONTRAST_REVIEW"
    return "P3_SOURCE_VIEW_PRESENT_CANDIDATE"


def render_summary(report: dict[str, Any]) -> str:
    counts: dict[str, int] = {}
    priorities: dict[str, int] = {}
    for row in report["targets"]:
        counts[row["mechanical_label"]] = counts.get(row["mechanical_label"], 0) + 1
        priorities[row["review_priority"]] = priorities.get(row["review_priority"], 0) + 1
    lines = [
        f"# Lexical Contrast Migration Readback — {report['audit_id']}",
        "",
        f"- Contrast targets: **{report['target_count']}**",
        f"- Source owners: **{report['source_owner_count']}**",
        "- Semantic mutation: **0** · Learner-state mutation: **0** · Mechanical semantic judgment: **0**",
        "- Green rows are only source-view presence candidates; Chat still owns semantic acceptance.",
        "",
        "## Mechanical labels",
        "",
    ]
    for k, v in sorted(counts.items()):
        lines.append(f"- `{k}`: **{v}**")
    lines += ["", "## Review priorities", ""]
    for k, v in sorted(priorities.items()):
        lines.append(f"- `{k}`: **{v}**")
    lines += [
        "",
        "## Contrast queue",
        "",
        "| Priority | ID | Source | Approved contrast | Readback | Direct | Reverse | Flags |",
        "|---|---|---|---|---|---:|---:|---|",
    ]
    order = {
        "P0_OWNER_HEALTH": 0,
        "P1_DEAD_RELATION_ANCHOR": 1,
        "P1_RELATION_GAP": 2,
        "P2_SELF_CONTRAST_REVIEW": 3,
        "P3_SOURCE_VIEW_PRESENT_CANDIDATE": 4,
    }
    for row in sorted(report["targets"], key=lambda r: (order.get(r["review_priority"], 9), r["target_id"])):
        flags = ", ".join(row["health_flags"] + row["relation_anchor_flags"]) or "—"
        lines.append(
            f"| `{row['review_priority']}` | `{row['target_id']}` | "
            f"{row['ordinal']} `{row['source_word_id']}` | {row['approved_target'].replace('|', '\\|')} | "
            f"`{row['mechanical_label']}` | {len(row['direct_views'])} | {len(row['reverse_views'])} | {flags} |"
        )
    lines += [
        "",
        "## Candidate boundaries",
        "",
    ]
    for row in report["targets"]:
        if not row["direct_views"]:
            continue
        lines.append(f"### {row['target_id']} — {row['approved_target']}")
        for v in row["direct_views"]:
            lines.append(
                f"- `{v.get('relation_id')}` → `{v.get('target_word')}` · "
                f"boundary: {v.get('boundary') or '—'} · anchors: "
                f"{v.get('source_sense_status') or 'n/a'}/{v.get('target_sense_status') or 'n/a'}"
            )
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description="Bulk readback of Chat-approved lexical contrast targets against Current Relation Owners.")
    ap.add_argument("authority_json", type=Path)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--summary", type=Path, required=True)
    args = ap.parse_args()

    authority = load_json(args.authority_json)
    targets = authority.get("targets") or []
    expected = authority.get("expected_target_count")
    if expected is not None and expected != len(targets):
        raise RuntimeError(f"target count mismatch: expected {expected}, got {len(targets)}")

    owners, by_word, sense_status = load_words()
    views_by_source = load_relation_views()
    output_rows: list[dict[str, Any]] = []
    source_owners: set[str] = set()

    for target in targets:
        tid = target.get("target_id")
        source_wid = target.get("source_word_id")
        approved = target.get("approved_target")
        mode = target.get("mode") or "relation"
        expected_words = [norm(x) for x in (target.get("target_words") or []) if norm(x)]
        if not isinstance(tid, str) or not isinstance(source_wid, str) or not isinstance(approved, str):
            raise RuntimeError(f"invalid target row: {target}")
        owner = owners.get(source_wid)
        if owner is None:
            raise RuntimeError(f"missing source owner {source_wid}")
        source_owners.add(source_wid)
        health = owner_health(owner)
        source_word = norm(owner.get("word") or (owner.get("record") or {}).get("word"))

        direct_all = views_by_source.get(source_wid, [])
        direct = [v for v in direct_all if norm(v.get("target_word")) in expected_words] if expected_words else []
        found_direct = {norm(v.get("target_word")) for v in direct}

        reverse: list[dict[str, Any]] = []
        for tw in expected_words:
            twid = by_word.get(tw)
            if not twid:
                continue
            for view in views_by_source.get(twid, []):
                if norm(view.get("target_word")) == source_word:
                    reverse.append(view)

        compact_direct = [compact_view(v, sense_status) for v in direct]
        compact_reverse = [compact_view(v, sense_status) for v in reverse]
        relation_flags = relation_anchor_flags(compact_direct)

        if mode == "self":
            label = "SELF_CONTRAST_OWNER_REVIEW"
        elif expected_words and len(found_direct) == len(set(expected_words)):
            label = "SOURCE_VIEW_PRESENT_CANDIDATE"
        elif found_direct:
            label = "PARTIAL_SOURCE_VIEW"
        elif compact_reverse:
            label = "REVERSE_ONLY"
        else:
            label = "NO_SOURCE_VIEW"

        row = {
            "target_id": tid,
            "source_word_id": source_wid,
            "ordinal": owner.get("ordinal"),
            "approved_target": approved,
            "mode": mode,
            "target_words": target.get("target_words") or [],
            "mechanical_label": label,
            "review_priority": priority(label, health["health_flags"], relation_flags),
            "health_flags": health["health_flags"],
            "relation_anchor_flags": relation_flags,
            "owner_health": health,
            "direct_views": compact_direct,
            "reverse_views": compact_reverse,
            "notes": target.get("notes"),
        }
        output_rows.append(row)

    report = {
        "schema": "kianos.lexical.migration_integrity.contrast_readback.v1",
        "audit_id": authority.get("audit_id"),
        "semantic_authority": authority.get("semantic_authority"),
        "target_count": len(output_rows),
        "source_owner_count": len(source_owners),
        "semantic_mutation_performed": False,
        "learner_state_mutation_performed": False,
        "mechanical_semantic_judgment_performed": False,
        "targets": output_rows,
        "interpretation_rule": "Mechanical labels only retrieve source-facing/reverse relation evidence and anchor health. Chat owns semantic acceptance and repair decisions.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.summary.write_text(render_summary(report), encoding="utf-8")
    print(f"CONTRAST_READBACK_PASS targets={len(output_rows)} source_owners={len(source_owners)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
