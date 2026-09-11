#!/usr/bin/env python3
"""Read-only LexicalOS Current asset integrity audit.

This audit does not mutate semantics and does not decide learner truth. It separates:
1) exact owner/identity integrity failures;
2) provenance/lifecycle signals that may be intentional;
3) high-signal heuristic Knowledge-quality review pools.

Important: `source_sense_id` on a construction/secondary fact can legitimately point to a
retired sense as provenance. That is *not* an exact defect by itself.
"""

from __future__ import annotations

import argparse
import collections
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OWNERS = ROOT / "content" / "lexical" / "words" / "by-ordinal"

EN_STOP = {
    "a", "an", "the", "to", "of", "or", "and", "in", "on", "for", "with", "by",
    "as", "at", "from", "into", "is", "are", "be", "being", "been", "that", "this",
    "something", "someone", "somebody", "one", "ones", "especially", "used", "use",
    "thing", "things", "person", "people", "particular", "way", "someone's", "someone’s",
}


def norm_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value.strip().lower())


def cn_compact(value: Any) -> str:
    return re.sub(r"[^\u4e00-\u9fffA-Za-z0-9]+", "", norm_text(value))


def cn_segments(value: Any) -> list[str]:
    if not isinstance(value, str):
        return []
    parts = re.split(r"[；;，,、。/（）()：:]+", value)
    out: list[str] = []
    for part in parts:
        token = re.sub(r"[^\u4e00-\u9fff]+", "", part)
        token = token.strip()
        if len(token) >= 2:
            out.append(token)
    return out


def en_tokens(value: Any) -> set[str]:
    text = norm_text(value)
    toks = re.findall(r"[a-z][a-z'-]+", text)
    return {t for t in toks if t not in EN_STOP and len(t) > 2}


def collect_source_sense_refs(record: dict[str, Any]) -> list[tuple[str, str, str | None]]:
    out: list[tuple[str, str, str | None]] = []
    for field in ("constructions", "secondary_senses", "word_family", "confusables"):
        items = record.get(field) or []
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            sid = item.get("source_sense_id")
            if isinstance(sid, str) and sid:
                label = item.get("pattern") or item.get("boundary") or item.get("label_en") or item.get("fact_id")
                out.append((field, sid, label))
    return out


def deprecated_core_gap_candidate(
    reference: dict[str, Any],
    core_text_cn: str,
    core_text_en: str,
    active_text_cn: str,
    active_text_en: str,
) -> dict[str, Any] | None:
    """High-signal heuristic: retired, unmerged meaning still named by Current Core but absent from Active wording."""
    if reference.get("status") != "deprecated":
        return None
    if reference.get("merged_into_sense_id"):
        return None

    core_cn = cn_compact(core_text_cn)
    active_cn = cn_compact(active_text_cn)
    named_segments = []
    for segment in cn_segments(reference.get("definition_cn")):
        if segment in core_cn and segment not in active_cn:
            named_segments.append(segment)

    ref_en = en_tokens(reference.get("definition_en"))
    core_en = en_tokens(core_text_en)
    active_en = en_tokens(active_text_en)
    en_overlap = ref_en & core_en
    en_missing = en_overlap - active_en
    en_ratio = len(en_overlap) / max(1, len(ref_en))
    en_hit = len(ref_en) >= 2 and len(en_overlap) >= 2 and en_ratio >= 0.6 and len(en_missing) >= 1

    if not named_segments and not en_hit:
        return None
    return {
        "sense_id": reference.get("stable_sense_id"),
        "definition_cn": reference.get("definition_cn"),
        "definition_en": reference.get("definition_en"),
        "named_core_segments_cn": named_segments,
        "english_core_overlap": sorted(en_overlap),
        "english_terms_missing_from_active": sorted(en_missing),
        "english_overlap_ratio": round(en_ratio, 3),
    }


def audit_owner(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    record = data.get("record") or {}
    word = data.get("word") or record.get("word") or ""
    word_id = data.get("word_id") or record.get("word_id") or ""
    ordinal = data.get("ordinal")

    senses = [x for x in (record.get("senses") or []) if isinstance(x, dict)]
    active_ids = {x.get("sense_id") for x in senses if x.get("sense_id")}
    identity_senses = [x for x in ((data.get("identity_refs") or {}).get("senses") or []) if isinstance(x, dict)]
    identity_status = {x.get("sense_id"): x.get("status") for x in identity_senses if x.get("sense_id")}
    reference_senses = [x for x in (data.get("reference_senses") or []) if isinstance(x, dict)]

    collocations: list[dict[str, Any]] = []
    for sense in senses:
        collocations.extend(x for x in (sense.get("collocations") or []) if isinstance(x, dict))
    fixed_pattern_count = sum(1 for x in collocations if x.get("exam_value") == "fixed_pattern")
    usage_example_count = sum(1 for x in collocations if x.get("exam_value") == "usage_example")
    multiword_usage_count = sum(
        1 for x in collocations
        if x.get("exam_value") == "usage_example" and len(norm_text(x.get("phrase")).split()) >= 2
    )

    constructions = [x for x in (record.get("constructions") or []) if isinstance(x, dict)]
    secondary = [x for x in (record.get("secondary_senses") or []) if isinstance(x, dict)]

    exact: list[dict[str, Any]] = []
    signals: list[dict[str, Any]] = []
    heuristics: list[dict[str, Any]] = []

    expected_name = f"o{int(ordinal):04d}.json" if isinstance(ordinal, int) else None
    if expected_name and path.name != expected_name:
        exact.append({"code": "ORDINAL_PATH_MISMATCH", "expected": expected_name, "actual": path.name})
    if word_id and not word_id.startswith("word:"):
        exact.append({"code": "WORD_ID_SHAPE_INVALID", "word_id": word_id})
    if record.get("word_id") != word_id:
        exact.append({"code": "OWNER_RECORD_WORD_ID_MISMATCH", "owner": word_id, "record": record.get("word_id")})

    for sid in sorted(active_ids):
        if sid not in identity_status:
            exact.append({"code": "ACTIVE_SENSE_MISSING_IDENTITY", "sense_id": sid})
        elif identity_status[sid] != "active":
            exact.append({"code": "ACTIVE_SENSE_IDENTITY_NOT_ACTIVE", "sense_id": sid, "identity_status": identity_status[sid]})

    core = record.get("core_concept") or {}
    clusters = [x for x in (core.get("core_clusters") or []) if isinstance(x, dict)]
    for cluster in clusters:
        for sid in cluster.get("sense_ids") or []:
            if sid not in active_ids:
                exact.append({
                    "code": "CORE_CLUSTER_REFERENCES_NONACTIVE_SENSE",
                    "sense_id": sid,
                    "cluster_cn": cluster.get("label_cn"),
                    "cluster_en": cluster.get("label_en"),
                    "identity_status": identity_status.get(sid),
                })

    for field, sid, label in collect_source_sense_refs(record):
        status = identity_status.get(sid)
        if status == "deprecated":
            signals.append({
                "code": "LEARNING_OBJECT_PROVENANCE_USES_DEPRECATED_SOURCE",
                "field": field,
                "sense_id": sid,
                "label": label,
            })
        elif status is None and sid not in active_ids:
            exact.append({
                "code": "LEARNING_OBJECT_REFERENCES_UNKNOWN_SOURCE_SENSE",
                "field": field,
                "sense_id": sid,
                "label": label,
            })

    active_collocation_ids = set((data.get("identity_refs") or {}).get("active_collocations") or [])
    for col in collocations:
        cid = col.get("collocation_id")
        if cid and active_collocation_ids and cid not in active_collocation_ids:
            exact.append({"code": "CURRENT_COLLOCATION_NOT_IN_ACTIVE_IDENTITY", "collocation_id": cid, "phrase": col.get("phrase")})

    core_cn = " | ".join(
        str(x) for x in [core.get("core_meaning_cn"), core.get("mental_model_cn")]
        + [c.get("label_cn") for c in clusters]
        if x
    )
    core_en = " | ".join(
        str(x) for x in [core.get("core_meaning_en"), core.get("mental_model_en")]
        + [c.get("label_en") for c in clusters]
        if x
    )
    active_cn = " | ".join(str(s.get("definition_cn") or "") for s in senses)
    active_en = " | ".join(str(s.get("definition_en") or "") for s in senses)
    for ref in reference_senses:
        candidate = deprecated_core_gap_candidate(ref, core_cn, core_en, active_cn, active_en)
        if candidate:
            heuristics.append({"code": "UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE", **candidate})

    mm_cn = norm_text(core.get("mental_model_cn"))
    cm_cn = norm_text(core.get("core_meaning_cn"))
    mm_en = norm_text(core.get("mental_model_en"))
    cm_en = norm_text(core.get("core_meaning_en"))
    weak_mm_cn = (not mm_cn) or (mm_cn == cm_cn)
    weak_mm_en = (not mm_en) or (mm_en == cm_en)
    sense_count = len(senses)
    rich = sense_count >= 4

    if weak_mm_cn:
        heuristics.append({"code": "WEAK_MENTAL_MODEL_CN", "rich_word": rich, "mental_model_cn": core.get("mental_model_cn")})
    if weak_mm_en:
        heuristics.append({"code": "WEAK_MENTAL_MODEL_EN", "rich_word": rich, "mental_model_en": core.get("mental_model_en")})
    if rich and not constructions and fixed_pattern_count == 0:
        heuristics.append({
            "code": "RICH_WORD_WITHOUT_EXPLICIT_STRUCTURE_LAYER",
            "sense_count": sense_count,
            "usage_example_count": usage_example_count,
        })
    if rich and multiword_usage_count >= 3 and not constructions and fixed_pattern_count == 0:
        heuristics.append({
            "code": "RICH_WORD_MULTIWORD_USAGE_ONLY",
            "sense_count": sense_count,
            "multiword_usage_count": multiword_usage_count,
        })
    if record.get("needs_delta_review") is True:
        heuristics.append({"code": "NEEDS_DELTA_REVIEW_TRUE"})

    risk_score = 8 * len(exact)
    for item in heuristics:
        risk_score += {
            "UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE": 5,
            "WEAK_MENTAL_MODEL_CN": 1,
            "WEAK_MENTAL_MODEL_EN": 1,
            "RICH_WORD_WITHOUT_EXPLICIT_STRUCTURE_LAYER": 2,
            "RICH_WORD_MULTIWORD_USAGE_ONLY": 2,
            "NEEDS_DELTA_REVIEW_TRUE": 1,
        }.get(item["code"], 1)

    return {
        "ordinal": ordinal,
        "word_id": word_id,
        "word": word,
        "card_version": record.get("card_version"),
        "sense_count": sense_count,
        "construction_count": len(constructions),
        "secondary_sense_count": len(secondary),
        "fixed_pattern_count": fixed_pattern_count,
        "usage_example_count": usage_example_count,
        "reference_sense_count": len(reference_senses),
        "semantic_delta": (data.get("provenance") or {}).get("semantic_delta"),
        "exact_findings": exact,
        "provenance_signals": signals,
        "heuristic_findings": heuristics,
        "risk_score": risk_score,
    }


def render_summary(report: dict[str, Any]) -> str:
    s = report["summary"]
    lines = [
        "# Lexical Current Asset Integrity Audit",
        "",
        "> Read-only diagnostics. Exact findings are owner/identity inconsistencies. Provenance signals can be intentional. Heuristic findings are review pools, not automatic semantic failures.",
        "",
        f"- Current owners scanned: **{s['owners_scanned']}**",
        f"- Owners with exact findings: **{s['owners_with_exact_findings']}**",
        f"- Exact finding count: **{s['exact_finding_count']}**",
        f"- Deprecated-source provenance signals: **{s['deprecated_source_provenance_signal_count']}** across **{s['owners_with_deprecated_source_provenance']}** owners",
        f"- `needs_delta_review=true`: **{s['needs_delta_review_true']}**",
        f"- High-signal unmerged deprecated/Core candidates: **{s['unmerged_deprecated_meaning_named_in_core']}**",
        f"- Rich words (>=4 active senses): **{s['rich_word_count']}**",
        f"- Rich words with weak CN mental model: **{s['rich_weak_mental_model_cn']}**",
        f"- Rich words with weak EN mental model: **{s['rich_weak_mental_model_en']}**",
        f"- Rich words with no explicit construction/fixed-pattern layer: **{s['rich_without_structure_layer']}**",
        "",
        "## Exact integrity classes",
        "",
    ]
    for code, count in s["exact_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")
    if not s["exact_by_code"]:
        lines.append("- none")

    lines += ["", "## Heuristic Knowledge-review pools", ""]
    for code, count in s["heuristic_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")

    lines += ["", "## By card version", ""]
    for version, row in s["by_card_version"].items():
        lines.append(
            f"- `{version}`: owners {row['owners']}; needs_delta {row['needs_delta_review_true']}; "
            f"weak_cn {row['weak_mental_model_cn']}; weak_en {row['weak_mental_model_en']}; "
            f"core-gap candidates {row['unmerged_deprecated_meaning_named_in_core']}; rich/no-structure {row['rich_without_structure_layer']}"
        )

    lines += ["", "## Highest-risk owners", ""]
    for item in report["highest_risk"][:50]:
        exact_codes = ", ".join(sorted({x["code"] for x in item["exact_findings"]})) or "-"
        heuristic_codes = ", ".join(sorted({x["code"] for x in item["heuristic_findings"]})) or "-"
        lines.append(
            f"- `{item['ordinal']}` **{item['word']}** — score {item['risk_score']} — exact: {exact_codes}; heuristic: {heuristic_codes}"
        )

    lines += [
        "",
        "## Interpretation boundary",
        "",
        "- Do **not** equate this report with Knowledge acceptance.",
        "- A retired source sense can legitimately remain as provenance for a current construction/secondary branch.",
        "- Heuristic pools estimate scale and prioritize Chat semantic sampling; they must not be bulk-mutated mechanically.",
        "- Historical approval/readback reconciliation remains separate from Current asset quality.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", required=True)
    ap.add_argument("--summary", required=True)
    args = ap.parse_args()

    paths = sorted(OWNERS.glob("o*.json"))
    if not paths:
        raise SystemExit(f"no Natural Owners found under {OWNERS}")

    owners = [audit_owner(p) for p in paths]
    exact_counter: collections.Counter[str] = collections.Counter()
    signal_counter: collections.Counter[str] = collections.Counter()
    heuristic_counter: collections.Counter[str] = collections.Counter()
    card_versions: collections.Counter[str] = collections.Counter()
    semantic_delta: collections.Counter[str] = collections.Counter()
    by_version: dict[str, dict[str, int]] = collections.defaultdict(lambda: collections.defaultdict(int))

    for owner in owners:
        version = str(owner.get("card_version"))
        card_versions[version] += 1
        semantic_delta[str(owner.get("semantic_delta"))] += 1
        exact_counter.update(x["code"] for x in owner["exact_findings"])
        signal_counter.update(x["code"] for x in owner["provenance_signals"])
        heuristic_counter.update(x["code"] for x in owner["heuristic_findings"])
        row = by_version[version]
        row["owners"] += 1
        codes = {x["code"] for x in owner["heuristic_findings"]}
        if "NEEDS_DELTA_REVIEW_TRUE" in codes:
            row["needs_delta_review_true"] += 1
        if "WEAK_MENTAL_MODEL_CN" in codes:
            row["weak_mental_model_cn"] += 1
        if "WEAK_MENTAL_MODEL_EN" in codes:
            row["weak_mental_model_en"] += 1
        if "UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE" in codes:
            row["unmerged_deprecated_meaning_named_in_core"] += 1
        if "RICH_WORD_WITHOUT_EXPLICIT_STRUCTURE_LAYER" in codes:
            row["rich_without_structure_layer"] += 1

    rich = [o for o in owners if o["sense_count"] >= 4]
    summary = {
        "owners_scanned": len(owners),
        "owners_with_exact_findings": sum(bool(o["exact_findings"]) for o in owners),
        "exact_finding_count": sum(len(o["exact_findings"]) for o in owners),
        "exact_by_code": dict(sorted(exact_counter.items())),
        "deprecated_source_provenance_signal_count": signal_counter.get("LEARNING_OBJECT_PROVENANCE_USES_DEPRECATED_SOURCE", 0),
        "owners_with_deprecated_source_provenance": sum(bool(o["provenance_signals"]) for o in owners),
        "heuristic_by_code": dict(sorted(heuristic_counter.items())),
        "needs_delta_review_true": heuristic_counter.get("NEEDS_DELTA_REVIEW_TRUE", 0),
        "unmerged_deprecated_meaning_named_in_core": heuristic_counter.get("UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE", 0),
        "rich_word_count": len(rich),
        "rich_weak_mental_model_cn": sum(any(x["code"] == "WEAK_MENTAL_MODEL_CN" for x in o["heuristic_findings"]) for o in rich),
        "rich_weak_mental_model_en": sum(any(x["code"] == "WEAK_MENTAL_MODEL_EN" for x in o["heuristic_findings"]) for o in rich),
        "rich_without_structure_layer": sum(any(x["code"] == "RICH_WORD_WITHOUT_EXPLICIT_STRUCTURE_LAYER" for x in o["heuristic_findings"]) for o in rich),
        "card_versions": dict(sorted(card_versions.items())),
        "by_card_version": {k: dict(v) for k, v in sorted(by_version.items())},
        "semantic_delta_distribution": dict(sorted(semantic_delta.items())),
    }

    report = {
        "schema": "kianos.lexical.asset_integrity_audit.v2",
        "authority": "READ_ONLY_DIAGNOSTIC_NOT_SEMANTIC_AUTHORITY",
        "summary": summary,
        "highest_risk": sorted(
            [o for o in owners if o["risk_score"] > 0],
            key=lambda x: (-x["risk_score"], x.get("ordinal") or 0),
        )[:300],
        "exact_findings": [
            {"ordinal": o["ordinal"], "word_id": o["word_id"], "word": o["word"], "findings": o["exact_findings"]}
            for o in owners if o["exact_findings"]
        ],
        "core_gap_candidates": [
            {
                "ordinal": o["ordinal"],
                "word_id": o["word_id"],
                "word": o["word"],
                "findings": [x for x in o["heuristic_findings"] if x["code"] == "UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE"],
            }
            for o in owners
            if any(x["code"] == "UNMERGED_DEPRECATED_MEANING_NAMED_IN_CORE" for x in o["heuristic_findings"])
        ],
    }

    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(args.summary).write_text(render_summary(report), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
