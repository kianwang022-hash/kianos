#!/usr/bin/env python3
"""Read-only LexicalOS Knowledge re-acceptance audit.

This scanner deliberately separates:
- P0: high-confidence Current asset integrity blockers;
- P1: authority-fidelity regressions / high-signal candidates;
- P2: learner-value optimization candidates.

It never mutates lexical semantics and it never turns heuristics into repairs.
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
DEFAULT_SENTINELS = ROOT / "content" / "lexical" / "audit" / "knowledge-reacceptance" / "sentinels.json"


def norm(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value.strip().casefold())


def cn_segments(value: Any) -> list[str]:
    if not isinstance(value, str):
        return []
    parts = re.split(r"[；;，,、。/（）()：:]+", value)
    out: list[str] = []
    for part in parts:
        token = re.sub(r"[^\u4e00-\u9fff]+", "", part).strip()
        if len(token) >= 2:
            out.append(token)
    return out


def en_tokens(value: Any) -> set[str]:
    stop = {
        "the", "and", "for", "with", "from", "into", "that", "this", "something", "someone",
        "person", "thing", "used", "use", "especially", "particular", "being", "been", "are", "was",
    }
    return {
        token for token in re.findall(r"[a-z][a-z'-]+", norm(value))
        if len(token) > 2 and token not in stop
    }


def active_blob(sense: dict[str, Any]) -> str:
    pieces = [sense.get("definition_cn"), sense.get("definition_en"), sense.get("sense_label_en")]
    return " | ".join(str(x) for x in pieces if x)


def rule_matches(sense: dict[str, Any], rule: dict[str, Any]) -> bool:
    if rule.get("pos") and norm(sense.get("pos")) != norm(rule.get("pos")):
        return False
    blob_cn = norm(sense.get("definition_cn"))
    blob_en = norm(" | ".join(str(x) for x in [sense.get("definition_en"), sense.get("sense_label_en")] if x))
    if rule.get("contains_cn") and norm(rule["contains_cn"]) not in blob_cn:
        return False
    if rule.get("contains_en") and norm(rule["contains_en"]) not in blob_en:
        return False
    return True


def deprecated_core_gap(reference: dict[str, Any], core: dict[str, Any], senses: list[dict[str, Any]]) -> dict[str, Any] | None:
    """High-signal P1 candidate, not an automatic semantic defect."""
    if reference.get("status") != "deprecated" or reference.get("merged_into_sense_id"):
        return None

    core_cn = " | ".join(
        str(x) for x in [core.get("core_meaning_cn"), core.get("mental_model_cn")]
        + [c.get("label_cn") for c in (core.get("core_clusters") or []) if isinstance(c, dict)]
        if x
    )
    core_en = " | ".join(
        str(x) for x in [core.get("core_meaning_en"), core.get("mental_model_en")]
        + [c.get("label_en") for c in (core.get("core_clusters") or []) if isinstance(c, dict)]
        if x
    )
    active_cn = " | ".join(str(s.get("definition_cn") or "") for s in senses)
    active_en = " | ".join(str(s.get("definition_en") or "") for s in senses)

    cn_hits = [seg for seg in cn_segments(reference.get("definition_cn")) if seg in core_cn and seg not in active_cn]
    ref_en = en_tokens(reference.get("definition_en"))
    core_overlap = ref_en & en_tokens(core_en)
    active_overlap = ref_en & en_tokens(active_en)
    en_hit = len(ref_en) >= 2 and len(core_overlap) >= 2 and len(core_overlap) > len(active_overlap)
    if not cn_hits and not en_hit:
        return None
    return {
        "sense_id": reference.get("stable_sense_id"),
        "definition_cn": reference.get("definition_cn"),
        "definition_en": reference.get("definition_en"),
        "core_cn_hits": cn_hits,
        "core_en_hits": sorted(core_overlap),
        "active_en_hits": sorted(active_overlap),
    }


def audit_owner(path: Path) -> dict[str, Any]:
    owner = json.loads(path.read_text(encoding="utf-8"))
    record = owner.get("record") or {}
    senses = [x for x in (record.get("senses") or []) if isinstance(x, dict)]
    active_ids = {str(x.get("sense_id")) for x in senses if x.get("sense_id")}
    identity_rows = [x for x in ((owner.get("identity_refs") or {}).get("senses") or []) if isinstance(x, dict)]
    identity_status = {str(x.get("sense_id")): x.get("status") for x in identity_rows if x.get("sense_id")}
    refs = [x for x in (owner.get("reference_senses") or []) if isinstance(x, dict)]
    core = record.get("core_concept") or {}
    clusters = [x for x in (core.get("core_clusters") or []) if isinstance(x, dict)]

    p0: list[dict[str, Any]] = []
    p1: list[dict[str, Any]] = []
    p2: list[dict[str, Any]] = []
    signals: list[dict[str, Any]] = []

    ordinal = owner.get("ordinal")
    word_id = owner.get("word_id")
    word = owner.get("word") or record.get("word")

    if record.get("word_id") != word_id:
        p0.append({"code": "OWNER_RECORD_WORD_ID_MISMATCH"})
    if isinstance(ordinal, int) and path.name != f"o{ordinal:04d}.json":
        p0.append({"code": "ORDINAL_PATH_MISMATCH", "path": path.name})

    meaningful_core = bool(norm(core.get("core_meaning_cn")) or norm(core.get("core_meaning_en")))
    if meaningful_core and not senses:
        p0.append({"code": "NONEMPTY_CORE_ZERO_ACTIVE_SENSES"})

    for sid in sorted(active_ids):
        status = identity_status.get(sid)
        if status is None:
            p0.append({"code": "ACTIVE_SENSE_MISSING_IDENTITY", "sense_id": sid})
        elif status != "active":
            p0.append({"code": "ACTIVE_SENSE_IDENTITY_NOT_ACTIVE", "sense_id": sid, "status": status})

    for cluster in clusters:
        for sid in cluster.get("sense_ids") or []:
            if sid not in active_ids:
                p0.append({
                    "code": "CORE_CLUSTER_REFERENCES_NONACTIVE_SENSE",
                    "sense_id": sid,
                    "cluster_cn": cluster.get("label_cn"),
                    "identity_status": identity_status.get(str(sid)),
                })

    for ref in refs:
        candidate = deprecated_core_gap(ref, core, senses)
        if candidate:
            p1.append({"code": "DEPRECATED_MEANING_STILL_NAMED_IN_CORE", **candidate})

    sense_count = len(senses)
    collocations = [
        c for sense in senses for c in (sense.get("collocations") or []) if isinstance(c, dict)
    ]
    fixed_count = sum(c.get("exam_value") == "fixed_pattern" for c in collocations)
    constructions = [x for x in (record.get("constructions") or []) if isinstance(x, dict)]
    rich = sense_count >= 4

    mental_cn = norm(core.get("mental_model_cn"))
    core_cn = norm(core.get("core_meaning_cn"))
    mental_en = norm(core.get("mental_model_en"))
    core_en = norm(core.get("core_meaning_en"))
    if rich and ((not mental_cn) or mental_cn == core_cn):
        p2.append({"code": "RICH_WORD_WEAK_WORD_FEEL_CN"})
    if rich and ((not mental_en) or mental_en == core_en):
        p2.append({"code": "RICH_WORD_WEAK_WORD_FEEL_EN"})
    if rich and not constructions and fixed_count == 0:
        p2.append({"code": "RICH_WORD_NO_EXPLICIT_STRUCTURE_LAYER"})
    if record.get("needs_delta_review") is True:
        signals.append({"code": "NEEDS_DELTA_REVIEW_TRUE"})

    return {
        "ordinal": ordinal,
        "word_id": word_id,
        "word": word,
        "card_version": record.get("card_version"),
        "sense_count": sense_count,
        "reference_sense_count": len(refs),
        "p0": p0,
        "p1_candidates": p1,
        "p2_candidates": p2,
        "signals": signals,
    }


def audit_sentinels(owner_by_ordinal: dict[int, dict[str, Any]], sentinel_path: Path) -> list[dict[str, Any]]:
    spec = json.loads(sentinel_path.read_text(encoding="utf-8"))
    results: list[dict[str, Any]] = []
    for sentinel in spec.get("sentinels") or []:
        ordinal = int(sentinel["ordinal"])
        owner = owner_by_ordinal.get(ordinal)
        failures: list[dict[str, Any]] = []
        if not owner:
            failures.append({"code": "SENTINEL_OWNER_MISSING"})
        else:
            record = owner.get("record") or {}
            senses = [x for x in (record.get("senses") or []) if isinstance(x, dict)]
            if owner.get("word_id") != sentinel.get("word_id"):
                failures.append({"code": "SENTINEL_WORD_ID_MISMATCH", "actual": owner.get("word_id")})
            for rule in sentinel.get("must_have_active") or []:
                if not any(rule_matches(sense, rule) for sense in senses):
                    failures.append({"code": "SENTINEL_REQUIRED_ACTIVE_MISSING", "rule": rule})
            for rule in sentinel.get("must_not_have_active") or []:
                matches = [s.get("sense_id") for s in senses if rule_matches(s, rule)]
                if matches:
                    failures.append({"code": "SENTINEL_FORBIDDEN_ACTIVE_PRESENT", "rule": rule, "sense_ids": matches})
        results.append({
            "ordinal": ordinal,
            "word_id": sentinel.get("word_id"),
            "reason": sentinel.get("reason"),
            "status": "PASS" if not failures else "FAIL",
            "failures": failures,
        })
    return results


def render_md(report: dict[str, Any]) -> str:
    s = report["summary"]
    lines = [
        "# Lexical Knowledge Re-acceptance Audit",
        "",
        f"**Knowledge gate: {s['knowledge_gate']}**",
        "",
        f"- owners scanned: **{s['owners_scanned']}**",
        f"- owners with P0 blockers: **{s['owners_with_p0']}**",
        f"- P0 finding count: **{s['p0_count']}**",
        f"- owners with P1 candidates: **{s['owners_with_p1_candidates']}**",
        f"- P1 candidate count: **{s['p1_candidate_count']}**",
        f"- sentinel failures: **{s['sentinel_failures']} / {s['sentinel_count']}**",
        f"- rich-word P2 candidates: **{s['p2_candidate_count']}**",
        f"- needs_delta_review=true: **{s['needs_delta_review_true']}**",
        "",
        "## P0 classes",
    ]
    for code, count in s["p0_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")
    if not s["p0_by_code"]:
        lines.append("- none")

    lines += ["", "## Regression sentinels"]
    for item in report["sentinels"]:
        lines.append(f"- `{item['ordinal']}` {item['word_id']}: **{item['status']}** — {item['reason']}")
        for failure in item["failures"]:
            lines.append(f"  - `{failure['code']}` {json.dumps(failure, ensure_ascii=False)}")

    lines += ["", "## By card version"]
    for version, row in s["by_card_version"].items():
        lines.append(
            f"- `{version}`: owners {row.get('owners', 0)}; P0 owners {row.get('p0_owners', 0)}; "
            f"P1 candidate owners {row.get('p1_owners', 0)}; P2 candidate owners {row.get('p2_owners', 0)}"
        )

    lines += [
        "",
        "## Interpretation",
        "",
        "- P0 is a hard Knowledge blocker.",
        "- Sentinel FAIL is a hard authority-fidelity blocker.",
        "- P1 heuristic candidates require Chat semantic review; do not bulk mutate them.",
        "- P2 is optimization work and must not be confused with factual correctness.",
        "- A green CI run means the audit executed successfully, not that K passed.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sentinels", default=str(DEFAULT_SENTINELS))
    parser.add_argument("--output", required=True)
    parser.add_argument("--summary", required=True)
    args = parser.parse_args()

    paths = sorted(OWNERS.glob("o*.json"))
    if not paths:
        raise SystemExit(f"no owners under {OWNERS}")

    raw_owners = [json.loads(path.read_text(encoding="utf-8")) for path in paths]
    owner_by_ordinal = {int(o["ordinal"]): o for o in raw_owners if isinstance(o.get("ordinal"), int)}
    audited = [audit_owner(path) for path in paths]
    sentinels = audit_sentinels(owner_by_ordinal, Path(args.sentinels))

    p0_counter: collections.Counter[str] = collections.Counter()
    p1_counter: collections.Counter[str] = collections.Counter()
    p2_counter: collections.Counter[str] = collections.Counter()
    by_version: dict[str, collections.Counter[str]] = collections.defaultdict(collections.Counter)

    for owner in audited:
        p0_counter.update(x["code"] for x in owner["p0"])
        p1_counter.update(x["code"] for x in owner["p1_candidates"])
        p2_counter.update(x["code"] for x in owner["p2_candidates"])
        row = by_version[str(owner.get("card_version"))]
        row["owners"] += 1
        row["p0_owners"] += bool(owner["p0"])
        row["p1_owners"] += bool(owner["p1_candidates"])
        row["p2_owners"] += bool(owner["p2_candidates"])

    sentinel_failures = sum(item["status"] == "FAIL" for item in sentinels)
    p0_count = sum(len(owner["p0"]) for owner in audited)
    knowledge_gate = "BLOCKED" if p0_count or sentinel_failures else "P0_P1_FIDELITY_CLEAR_OPTIMIZATION_PENDING"
    summary = {
        "knowledge_gate": knowledge_gate,
        "owners_scanned": len(audited),
        "owners_with_p0": sum(bool(owner["p0"]) for owner in audited),
        "p0_count": p0_count,
        "p0_by_code": dict(sorted(p0_counter.items())),
        "owners_with_p1_candidates": sum(bool(owner["p1_candidates"]) for owner in audited),
        "p1_candidate_count": sum(len(owner["p1_candidates"]) for owner in audited),
        "p1_by_code": dict(sorted(p1_counter.items())),
        "p2_candidate_count": sum(len(owner["p2_candidates"]) for owner in audited),
        "p2_by_code": dict(sorted(p2_counter.items())),
        "needs_delta_review_true": sum(any(x["code"] == "NEEDS_DELTA_REVIEW_TRUE" for x in owner["signals"]) for owner in audited),
        "sentinel_count": len(sentinels),
        "sentinel_failures": sentinel_failures,
        "by_card_version": {key: dict(value) for key, value in sorted(by_version.items())},
    }

    report = {
        "schema": "kianos.lexical.knowledge_reacceptance.audit.v1",
        "authority": "READ_ONLY_DIAGNOSTIC_NOT_SEMANTIC_AUTHORITY",
        "summary": summary,
        "sentinels": sentinels,
        "p0_owners": [owner for owner in audited if owner["p0"]],
        "p1_candidates": [owner for owner in audited if owner["p1_candidates"]],
        "p2_candidates_top": [owner for owner in audited if owner["p2_candidates"]][:500],
    }
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(args.summary).write_text(render_md(report) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
