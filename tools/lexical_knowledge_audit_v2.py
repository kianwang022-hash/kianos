#!/usr/bin/env python3
"""Current-only lexical Knowledge inventory and triage.

This tool scans Current Natural Owners only. It performs structural checks and
semantic-complexity routing. It NEVER grants semantic PASS automatically and
never reads history, legacy, old Issues, compiler packets, or migration approvals.
"""

from __future__ import annotations

import argparse
import collections
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS = ROOT / "content" / "lexical" / "words" / "by-ordinal"
RELATIONS = ROOT / "content" / "lexical" / "relations" / "by-id"


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", text(value).casefold()).strip()


def compact_semantic_view(owner: dict[str, Any]) -> dict[str, Any]:
    """Return Current semantic fields needed for Chat review; exclude history/provenance."""
    record = owner.get("record") or {}
    senses = []
    for sense in record.get("senses") or []:
        if not isinstance(sense, dict):
            continue
        senses.append({
            "sense_id": sense.get("sense_id"),
            "pos": sense.get("pos"),
            "level": sense.get("level"),
            "definition_cn": sense.get("definition_cn"),
            "definition_en": sense.get("definition_en"),
            "sense_label_en": sense.get("sense_label_en"),
            "governing_pattern": sense.get("governing_pattern"),
            "transitivity": sense.get("transitivity"),
            "sort_order": sense.get("sort_order"),
            "collocations": [
                {
                    "collocation_id": c.get("collocation_id"),
                    "phrase": c.get("phrase"),
                    "meaning_cn": c.get("meaning_cn"),
                    "exam_value": c.get("exam_value"),
                }
                for c in (sense.get("collocations") or []) if isinstance(c, dict)
            ],
        })
    return {
        "ordinal": owner.get("ordinal"),
        "word_id": owner.get("word_id"),
        "word": owner.get("word") or record.get("word"),
        "core_concept": record.get("core_concept") or {},
        "senses": senses,
        "secondary_senses": record.get("secondary_senses") or [],
        "constructions": record.get("constructions") or [],
        "confusables": record.get("confusables") or [],
        "semantic_neighbors": record.get("semantic_neighbors") or [],
        "relation_refs": owner.get("relation_refs") or [],
        "word_family": record.get("word_family") or [],
        "exam_paraphrases": record.get("exam_paraphrases") or [],
    }


def duplicate_groups(values: list[tuple[str, str]]) -> list[dict[str, Any]]:
    by_value: dict[str, list[str]] = collections.defaultdict(list)
    for object_id, value in values:
        key = norm(value)
        if key:
            by_value[key].append(object_id)
    return [
        {"normalized": key, "object_ids": ids}
        for key, ids in by_value.items() if len(ids) > 1
    ]


def audit_owner(path: Path) -> dict[str, Any]:
    owner = json.loads(path.read_text(encoding="utf-8"))
    record = owner.get("record") or {}
    core = record.get("core_concept") or {}
    senses = [x for x in (record.get("senses") or []) if isinstance(x, dict)]
    secondary = [x for x in (record.get("secondary_senses") or []) if isinstance(x, dict)]
    constructions = [x for x in (record.get("constructions") or []) if isinstance(x, dict)]
    confusables = [x for x in (record.get("confusables") or []) if isinstance(x, dict)]
    neighbors = [x for x in (record.get("semantic_neighbors") or []) if isinstance(x, dict)]
    relation_refs = [x for x in (owner.get("relation_refs") or []) if isinstance(x, (dict, str))]

    ordinal = owner.get("ordinal")
    word_id = owner.get("word_id")
    word = owner.get("word") or record.get("word")

    structural: list[dict[str, Any]] = []
    signals: list[str] = []

    if not isinstance(ordinal, int):
        structural.append({"code": "MISSING_OR_INVALID_ORDINAL"})
    elif path.name != f"o{ordinal:04d}.json":
        structural.append({"code": "ORDINAL_PATH_MISMATCH", "path": path.name})
    if not text(word_id):
        structural.append({"code": "MISSING_WORD_ID"})
    if not text(word):
        structural.append({"code": "MISSING_WORD"})
    if record.get("word_id") != word_id:
        structural.append({"code": "OWNER_RECORD_WORD_ID_MISMATCH"})
    if record.get("word") and owner.get("word") and record.get("word") != owner.get("word"):
        structural.append({"code": "OWNER_RECORD_WORD_MISMATCH"})

    core_cn = norm(core.get("core_meaning_cn"))
    core_en = norm(core.get("core_meaning_en"))
    mental_cn = norm(core.get("mental_model_cn"))
    mental_en = norm(core.get("mental_model_en"))
    if not core_cn and not core_en:
        structural.append({"code": "EMPTY_CORE"})

    if not senses:
        structural.append({"code": "ZERO_ACTIVE_SENSES"})

    sense_ids: list[str] = []
    pos_counts: collections.Counter[str] = collections.Counter()
    collocation_ids: list[str] = []
    collocation_phrases: list[tuple[str, str]] = []
    fixed_count = 0
    l3_count = 0

    for i, sense in enumerate(senses):
        sid = text(sense.get("sense_id"))
        if not sid:
            structural.append({"code": "ACTIVE_SENSE_MISSING_ID", "index": i})
            sid = f"index:{i}"
        sense_ids.append(sid)
        pos = norm(sense.get("pos")) or "missing"
        pos_counts[pos] += 1
        if pos == "missing":
            structural.append({"code": "ACTIVE_SENSE_MISSING_POS", "sense_id": sid})
        if not norm(sense.get("definition_cn")) and not norm(sense.get("definition_en")):
            structural.append({"code": "ACTIVE_SENSE_EMPTY_DEFINITION", "sense_id": sid})
        if norm(sense.get("level")) == "l3":
            l3_count += 1
        for j, coll in enumerate(sense.get("collocations") or []):
            if not isinstance(coll, dict):
                continue
            cid = text(coll.get("collocation_id")) or f"{sid}:collocation:{j}"
            if coll.get("collocation_id"):
                collocation_ids.append(str(coll["collocation_id"]))
            phrase = text(coll.get("phrase"))
            if not phrase:
                structural.append({"code": "COLLOCATION_MISSING_PHRASE", "sense_id": sid, "index": j})
            else:
                collocation_phrases.append((cid, phrase))
            if coll.get("exam_value") == "fixed_pattern":
                fixed_count += 1

    duplicate_sids = [sid for sid, count in collections.Counter(sense_ids).items() if count > 1]
    if duplicate_sids:
        structural.append({"code": "DUPLICATE_ACTIVE_SENSE_ID", "sense_ids": duplicate_sids})
    duplicate_cids = [cid for cid, count in collections.Counter(collocation_ids).items() if count > 1]
    if duplicate_cids:
        structural.append({"code": "DUPLICATE_COLLOCATION_ID", "collocation_ids": duplicate_cids})

    active_ids = set(sense_ids)
    cluster_missing: list[str] = []
    for cluster in core.get("core_clusters") or []:
        if not isinstance(cluster, dict):
            continue
        for sid in cluster.get("sense_ids") or []:
            if str(sid) not in active_ids:
                cluster_missing.append(str(sid))
    if cluster_missing:
        structural.append({"code": "CORE_CLUSTER_REFERENCES_NONACTIVE_SENSE", "sense_ids": sorted(set(cluster_missing))})

    cn_dupes = duplicate_groups([(text(s.get("sense_id")) or str(i), text(s.get("definition_cn"))) for i, s in enumerate(senses)])
    en_dupes = duplicate_groups([(text(s.get("sense_id")) or str(i), text(s.get("definition_en"))) for i, s in enumerate(senses)])
    phrase_dupes = duplicate_groups(collocation_phrases)
    if cn_dupes:
        signals.append("DUPLICATE_ACTIVE_DEFINITION_CN")
    if en_dupes:
        signals.append("DUPLICATE_ACTIVE_DEFINITION_EN")
    if phrase_dupes:
        signals.append("DUPLICATE_COLLOCATION_PHRASE")

    sense_count = len(senses)
    if sense_count >= 4:
        signals.append("RICH_ACTIVE_POLYSEMY")
    if len(pos_counts) >= 2:
        signals.append("MULTI_POS")
    if secondary:
        signals.append("SECONDARY_SENSE_LAYER")
    if constructions:
        signals.append("CONSTRUCTION_LAYER")
    if fixed_count:
        signals.append("FIXED_PATTERN_LAYER")
    if confusables or neighbors or relation_refs:
        signals.append("RELATION_OR_CONTRAST_LAYER")
    if l3_count:
        signals.append("L3_ACTIVE_MEANING_PRESENT")
    if record.get("needs_delta_review") is True:
        signals.append("NEEDS_DELTA_REVIEW_TRUE")
    if not mental_cn and not mental_en:
        signals.append("WORD_FEEL_EMPTY")
    elif (mental_cn and mental_cn == core_cn) or (mental_en and mental_en == core_en):
        signals.append("WORD_FEEL_REPEATS_CORE")
    if sense_count >= 2 and not (core.get("core_clusters") or []):
        signals.append("MULTISENSE_WITHOUT_CORE_CLUSTERS")

    deep_signal_set = {
        "RICH_ACTIVE_POLYSEMY",
        "MULTI_POS",
        "SECONDARY_SENSE_LAYER",
        "CONSTRUCTION_LAYER",
        "RELATION_OR_CONTRAST_LAYER",
        "DUPLICATE_ACTIVE_DEFINITION_CN",
        "DUPLICATE_ACTIVE_DEFINITION_EN",
        "L3_ACTIVE_MEANING_PRESENT",
    }
    if structural:
        queue = "STRUCTURAL_BLOCKER"
    elif any(sig in deep_signal_set for sig in signals):
        queue = "DEEP_REVIEW"
    else:
        queue = "STANDARD_REVIEW"

    return {
        "ordinal": ordinal,
        "word_id": word_id,
        "word": word,
        "card_version": record.get("card_version"),
        "sense_count": sense_count,
        "secondary_sense_count": len(secondary),
        "construction_count": len(constructions),
        "fixed_pattern_count": fixed_count,
        "relation_ref_count": len(relation_refs),
        "pos_counts": dict(pos_counts),
        "structural_findings": structural,
        "review_signals": sorted(set(signals)),
        "queue": queue,
        "duplicate_definition_cn": cn_dupes,
        "duplicate_definition_en": en_dupes,
        "duplicate_collocation_phrase": phrase_dupes,
    }


def render_summary(report: dict[str, Any]) -> str:
    s = report["summary"]
    lines = [
        "# Lexical Knowledge Audit v2 — Current-only inventory",
        "",
        "**This report is triage evidence, not semantic acceptance.**",
        "",
        f"- Current Word Owners scanned: **{s['owners_scanned']}**",
        f"- ordinal span: **{s['ordinal_min']}–{s['ordinal_max']}**",
        f"- relation owner files observed: **{s['relation_owner_files']}**",
        f"- structural-blocker owners: **{s['queue_counts'].get('STRUCTURAL_BLOCKER', 0)}**",
        f"- deep-review owners: **{s['queue_counts'].get('DEEP_REVIEW', 0)}**",
        f"- standard-review owners: **{s['queue_counts'].get('STANDARD_REVIEW', 0)}**",
        "",
        "## Structural finding classes",
    ]
    if s["structural_by_code"]:
        for code, count in s["structural_by_code"].items():
            lines.append(f"- `{code}`: **{count}**")
    else:
        lines.append("- none")
    lines += ["", "## Review signals"]
    for code, count in s["signals_by_code"].items():
        lines.append(f"- `{code}`: **{count}**")
    lines += [
        "",
        "## Interpretation",
        "",
        "- `STRUCTURAL_BLOCKER` means Current is internally unusable before semantic acceptance.",
        "- `DEEP_REVIEW` means the word deserves slower semantic review; it is not automatically wrong.",
        "- `STANDARD_REVIEW` still requires human/Chat semantic judgment; it is only a fast-path candidate.",
        "- No historical sentinel, compiler packet, Issue, old branch, or legacy asset participates in this result.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--batch-output")
    parser.add_argument("--batch-start", type=int, default=1)
    parser.add_argument("--batch-end", type=int, default=200)
    parser.add_argument("--emit-batch-jsonl", action="store_true")
    args = parser.parse_args()

    paths = sorted(WORDS.glob("o*.json"))
    if not paths:
        raise SystemExit(f"no Current Word Owners found under {WORDS}")

    owners_raw = [json.loads(path.read_text(encoding="utf-8")) for path in paths]
    audited = [audit_owner(path) for path in paths]

    ordinals = [x.get("ordinal") for x in audited if isinstance(x.get("ordinal"), int)]
    ordinal_counts = collections.Counter(ordinals)
    structural_counter: collections.Counter[str] = collections.Counter()
    signal_counter: collections.Counter[str] = collections.Counter()
    queue_counter: collections.Counter[str] = collections.Counter()
    version_counter: collections.Counter[str] = collections.Counter()
    words = []
    word_ids = []

    for row in audited:
        structural_counter.update(x["code"] for x in row["structural_findings"])
        signal_counter.update(row["review_signals"])
        queue_counter[row["queue"]] += 1
        version_counter[str(row.get("card_version"))] += 1
        if row.get("word"):
            words.append(str(row["word"]).casefold())
        if row.get("word_id"):
            word_ids.append(str(row["word_id"]))

    corpus_findings: list[dict[str, Any]] = []
    missing_ordinals = sorted(set(range(1, 7947)) - set(ordinals))
    duplicate_ordinals = sorted(o for o, count in ordinal_counts.items() if count > 1)
    duplicate_words = sorted(w for w, count in collections.Counter(words).items() if count > 1)
    duplicate_word_ids = sorted(w for w, count in collections.Counter(word_ids).items() if count > 1)
    if len(audited) != 7946:
        corpus_findings.append({"code": "WORD_OWNER_COUNT_NOT_7946", "actual": len(audited)})
    if missing_ordinals:
        corpus_findings.append({"code": "MISSING_ORDINALS", "count": len(missing_ordinals), "sample": missing_ordinals[:50]})
    if duplicate_ordinals:
        corpus_findings.append({"code": "DUPLICATE_ORDINALS", "values": duplicate_ordinals[:50]})
    if duplicate_words:
        corpus_findings.append({"code": "DUPLICATE_WORD_SPELLINGS", "count": len(duplicate_words), "sample": duplicate_words[:50]})
    if duplicate_word_ids:
        corpus_findings.append({"code": "DUPLICATE_WORD_IDS", "count": len(duplicate_word_ids), "sample": duplicate_word_ids[:50]})

    relation_files = list(RELATIONS.glob("**/*.json")) if RELATIONS.exists() else []

    report = {
        "schema": "kianos.lexical.knowledge_audit_v2.inventory.v1",
        "authority": "CURRENT_NATURAL_OWNERS_ONLY",
        "semantic_acceptance": "NOT_GRANTED_BY_THIS_SCANNER",
        "summary": {
            "owners_scanned": len(audited),
            "ordinal_min": min(ordinals) if ordinals else None,
            "ordinal_max": max(ordinals) if ordinals else None,
            "relation_owner_files": len(relation_files),
            "queue_counts": dict(sorted(queue_counter.items())),
            "structural_by_code": dict(sorted(structural_counter.items())),
            "signals_by_code": dict(sorted(signal_counter.items())),
            "card_versions": dict(sorted(version_counter.items())),
            "corpus_findings": corpus_findings,
        },
        "owners": audited,
    }

    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(args.summary).write_text(render_summary(report) + "\n", encoding="utf-8")

    by_ordinal = {
        int(owner["ordinal"]): compact_semantic_view(owner)
        for owner in owners_raw if isinstance(owner.get("ordinal"), int)
    }
    batch = [by_ordinal[o] for o in range(args.batch_start, args.batch_end + 1) if o in by_ordinal]
    if args.batch_output:
        Path(args.batch_output).write_text(json.dumps({
            "schema": "kianos.lexical.knowledge_audit_v2.batch_input.v1",
            "authority": "CURRENT_NATURAL_OWNERS_ONLY",
            "start": args.batch_start,
            "end": args.batch_end,
            "count": len(batch),
            "owners": batch,
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    if args.emit_batch_jsonl:
        print("===KNOWLEDGE_V2_BATCH_JSONL_BEGIN===")
        for owner in batch:
            print(json.dumps(owner, ensure_ascii=False, separators=(",", ":")))
        print("===KNOWLEDGE_V2_BATCH_JSONL_END===")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
