#!/usr/bin/env python3
"""Read-only LexicalOS Current asset integrity audit.

This audit does not mutate semantics and does not decide learner truth. It separates:
1) exact internal lifecycle / identity inconsistencies;
2) high-signal heuristic Knowledge-quality risk pools that require Chat review.

Run from repository root:
    python tools/lexical_asset_integrity_audit.py \
      --output /tmp/lexical-asset-integrity.json \
      --summary /tmp/lexical-asset-integrity.md
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
    "something", "someone", "somebody", "something", "one", "ones", "especially",
    "used", "use", "thing", "things", "person", "people", "particular", "way",
}


def norm_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value.strip().lower())


def cn_compact(value: Any) -> str:
    return re.sub(r"[^\u4e00-\u9fffA-Za-z0-9]+", "", norm_text(value))


def en_tokens(value: Any) -> set[str]:
    text = norm_text(value)
    toks = re.findall(r"[a-z][a-z'-]+", text)
    return {t for t in toks if t not in EN_STOP and len(t) > 2}


def deprecated_core_overlap(reference: dict[str, Any], core_text_cn: str, core_text_en: str) -> dict[str, Any] | None:
    """Heuristic only: deprecated reference meaning still appears in Current core wording."""
    dcn = cn_compact(reference.get("definition_cn"))
    cen = en_tokens(reference.get("definition_en"))
    ccn = cn_compact(core_text_cn)
    cenen = en_tokens(core_text_en)

    cn_hit = bool(dcn and len(dcn) >= 2 and (dcn in ccn or (len(dcn) >= 4 and dcn[:2] in ccn)))
    en_overlap = len(cen & cenen)
    en_ratio = en_overlap / max(1, len(cen))
    en_hit = len(cen) >= 2 and en_overlap >= 2 and en_ratio >= 0.5
    if not (cn_hit or en_hit):
        return None
    return {
        "definition_cn": reference.get("definition_cn"),
        "definition_en": reference.get("definition_en"),
        "cn_hit": cn_hit,
        "en_overlap": en_overlap,
        "en_ratio": round(en_ratio, 3),
    }


def collect_source_sense_refs(record: dict[str, Any]) -> list[tuple[str, str | None, str | None]]:
    out: list[tuple[str, str | None, str | None]] = []
    for field in ("constructions", "secondary_senses", "word_family", "confusables"):
        items = record.get(field) or []
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            sid = item.get("source_sense_id")
            if sid:
                label = item.get("pattern") or item.get("boundary") or item.get("label_en") or item.get("fact_id")
                out.append((field, sid, label))
    return out


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
    deprecated_refs = [x for x in reference_senses if x.get("status") == "deprecated"]

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
    heuristics: list[dict[str, Any]] = []

    expected_name = f"o{int(ordinal):04d}.json" if isinstance(ordinal, int) else None
    if expected_name and path.name != expected_name:
        exact.append({"code": "ORDINAL_PATH_MISMATCH", "expected": expected_name, "actual": path.name})
    if word_id and not word_id.startswith("word:"):
        exact.append({"code": "WORD_ID_SHAPE_INVALID", "word_id": word_id})

    for sid in sorted(active_ids):
        if sid in identity_status and identity_status[sid] != "active":
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
            exact.append({
                "code": "CURRENT_LEARNING_OBJECT_REFERENCES_DEPRECATED_SENSE",
                "field": field,
                "sense_id": sid,
                "label": label,
            })
        elif status is None and sid not in active_ids:
            exact.append({
                "code": "CURRENT_LEARNING_OBJECT_REFERENCES_UNKNOWN_SENSE",
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
    for ref in deprecated_refs:
        overlap = deprecated_core_overlap(ref, core_cn, core_en)
        if overlap:
            heuristics.append({
                "code": "DEPRECATED_REFERENCE_OVERLAPS_CURRENT_CORE",
                "sense_id": ref.get("stable_sense_id"),
                **overlap,
            })

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

    risk_score = 0
    for item in exact:
        risk_score += 6 if item["code"] == "CURRENT_LEARNING_OBJECT_REFERENCES_DEPRECATED_SENSE" else 4
    for item in heuristics:
        risk_score += {
            "DEPRECATED_REFERENCE_OVERLAPS_CURRENT_CORE": 4,
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
        "deprecated_reference_count": len(deprecated_refs),
        "semantic_delta": (data.get("provenance") or {}).get("semantic_delta"),
        "exact_findings": exact,
        "heuristic_findings": heuristics,
        "risk_score": risk_score,
    }


def render_summary(report: dict[str, Any]) -> str:
    s = report["summary"]
    lines = [
        "# Lexical Current Asset Integrity Audit",
        "",
        "> Read-only diagnostics. Exact findings are structural/lifecycle inconsistencies. Heuristic findings are review pools, not automatic semantic failures.",
        "",
        f"- Current owners scanned: **{s['owners_scanned']}**",
        f"- Owners with exact findings: **{s['owners_with_exact_findings']}**",
        f"- Exact finding count: **{s['exact_finding_count']}**",
        f"- Owners with heuristic findings: **{s['owners_with_heuristic_findings']}**",
        f"- `needs_delta_review=true`: **{s['needs_delta_review_true']}**",
        f"- Rich words (>=4 active senses): **{s['rich_word_count']}**",
        f"- Rich words with weak CN mental model: **{s['rich_weak_mental_model_cn']}**",
        f"- Rich words with weak EN mental model: **{s['rich_weak_mental_model_en']}**",
        f"- Rich words with no explicit construction/fixed-pattern layer: **{s['rich_without_structure_layer']}**",
        "",
        "## Exact defect classes",
        "",
    ]
    for code, count in s["exact_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")
    if not s["exact_by_code"]:
        lines.append("- none")

    lines += ["", "## Heuristic review pools", ""]
    for code, count in s["heuristic_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")

    lines += ["", "## Highest-risk owners", ""]
    for item in report["highest_risk"][:40]:
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
        "- Exact lifecycle/identity findings are repair candidates after Chat review.",
        "- Heuristic pools exist to estimate scale and prioritize semantic sampling; they must not be bulk-mutated mechanically.",
        "- Historical approval/readback reconciliation is a separate question from Current asset quality.",
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
    heuristic_counter: collections.Counter[str] = collections.Counter()
    card_versions: collections.Counter[str] = collections.Counter()
    semantic_delta: collections.Counter[str] = collections.Counter()

    for owner in owners:
        card_versions[str(owner.get("card_version"))] += 1
        semantic_delta[str(owner.get("semantic_delta"))] += 1
        exact_counter.update(x["code"] for x in owner["exact_findings"])
        heuristic_counter.update(x["code"] for x in owner["heuristic_findings"])

    rich = [o for o in owners if o["sense_count"] >= 4]
    summary = {
        "owners_scanned": len(owners),
        "owners_with_exact_findings": sum(bool(o["exact_findings"]) for o in owners),
        "exact_finding_count": sum(len(o["exact_findings"]) for o in owners),
        "owners_with_heuristic_findings": sum(bool(o["heuristic_findings"]) for o in owners),
        "exact_by_code": dict(sorted(exact_counter.items())),
        "heuristic_by_code": dict(sorted(heuristic_counter.items())),
        "needs_delta_review_true": heuristic_counter.get("NEEDS_DELTA_REVIEW_TRUE", 0),
        "rich_word_count": len(rich),
        "rich_weak_mental_model_cn": sum(any(x["code"] == "WEAK_MENTAL_MODEL_CN" for x in o["heuristic_findings"]) for o in rich),
        "rich_weak_mental_model_en": sum(any(x["code"] == "WEAK_MENTAL_MODEL_EN" for x in o["heuristic_findings"]) for o in rich),
        "rich_without_structure_layer": sum(any(x["code"] == "RICH_WORD_WITHOUT_EXPLICIT_STRUCTURE_LAYER" for x in o["heuristic_findings"]) for o in rich),
        "card_versions": dict(sorted(card_versions.items())),
        "semantic_delta_distribution": dict(sorted(semantic_delta.items())),
    }

    report = {
        "schema": "kianos.lexical.asset_integrity_audit.v1",
        "authority": "READ_ONLY_DIAGNOSTIC_NOT_SEMANTIC_AUTHORITY",
        "summary": summary,
        "highest_risk": sorted(
            [o for o in owners if o["risk_score"] > 0],
            key=lambda x: (-x["risk_score"], x.get("ordinal") or 0),
        )[:250],
        "exact_findings": [
            {
                "ordinal": o["ordinal"],
                "word_id": o["word_id"],
                "word": o["word"],
                "findings": o["exact_findings"],
            }
            for o in owners if o["exact_findings"]
        ],
    }

    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(args.summary).write_text(render_summary(report), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
