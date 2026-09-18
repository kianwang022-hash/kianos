#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEXICAL = ROOT / "content" / "lexical"
WORDS = LEXICAL / "words" / "by-ordinal"
RELATIONS = LEXICAL / "relations" / "by-id"
WORD_MANIFEST = LEXICAL / "words" / "manifest.json"
REL_MANIFEST = LEXICAL / "relations" / "manifest.json"
LEX_MANIFEST = LEXICAL / "manifest.json"
WEB_RUNTIME = ROOT / "static-web" / "src" / "components" / "VocabularyWordRuntime.astro"
WEB_ADAPTER = ROOT / "static-web" / "src" / "lib" / "lexical.mjs"

RETIRED_MARKERS = (
    "RETIRED",
    "SUPERSEDED",
    "DEPRECATED",
    "INACTIVE",
)
NON_LEARNER_PUBLICATION = {
    "reference_only",
    "rejected",
    "blocked",
    "retired",
    "superseded",
    "deprecated",
}
NON_LEARNER_VERIFICATION = {
    "rejected",
    "blocked",
    "retired",
    "superseded",
    "invalid",
}
LEARNER_ARRAYS = (
    "secondary_senses",
    "constructions",
    "word_family",
)
FORBIDDEN_WEB_SEMANTIC_FIELDS = (
    "learning_value_score",
    "publication_status",
    "verification_status",
    "presentation_merge",
)
FORBIDDEN_WEB_SEMANTIC_NAMES = (
    "importantRelationRows",
    "learningValue",
)


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    text = str(value or "").lower()
    text = text.replace("’", "'").replace("‘", "'")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def relation_is_retired(owner: dict[str, Any]) -> bool:
    fields = [
        (owner.get("provenance") or {}).get("status"),
        (owner.get("canonical_record") or {}).get("status") if isinstance(owner.get("canonical_record"), dict) else None,
        (owner.get("fact_record") or {}).get("status") if isinstance(owner.get("fact_record"), dict) else None,
    ]
    joined = " ".join(str(x or "").upper() for x in fields)
    return any(marker in joined for marker in RETIRED_MARKERS)


def explicit_word_local_relation(owner: dict[str, Any]) -> list[dict[str, Any]]:
    hits: list[dict[str, Any]] = []
    provenance = owner.get("provenance") or {}
    superseded_by = str(provenance.get("superseded_by") or "")
    if superseded_by.startswith("word:"):
        hits.append({"reason": "provenance.superseded_by_word", "value": superseded_by})

    for view in owner.get("word_views") or []:
        if not isinstance(view, dict):
            continue
        source_word_id = str(view.get("source_word_id") or "")
        payload = view.get("payload") or {}
        if not isinstance(payload, dict):
            continue
        relation_type = str(payload.get("relation_type") or "").lower()
        semantic_owner = str(payload.get("semantic_owner") or "")
        relation_scope = str(payload.get("relation_scope") or "").lower()
        target_word = payload.get("target_word")

        if "same_word" in relation_type:
            hits.append({
                "reason": "same_word_relation_type",
                "source_word_id": source_word_id,
                "relation_type": relation_type,
            })
        if semantic_owner and semantic_owner == source_word_id:
            hits.append({
                "reason": "payload_semantic_owner_is_word",
                "source_word_id": source_word_id,
                "semantic_owner": semantic_owner,
            })
        if relation_scope == "compatibility" and target_word in (None, ""):
            hits.append({
                "reason": "compatibility_pointer_without_cross_word_target",
                "source_word_id": source_word_id,
            })
    return hits


def nonlearner_reasons(obj: dict[str, Any]) -> list[str]:
    reasons: list[str] = []
    publication = str(obj.get("publication_status") or "").lower()
    verification = str(obj.get("verification_status") or "").lower()
    presentation = obj.get("presentation_merge")
    if publication in NON_LEARNER_PUBLICATION:
        reasons.append(f"publication_status:{publication}")
    if verification in NON_LEARNER_VERIFICATION:
        reasons.append(f"verification_status:{verification}")
    if isinstance(presentation, dict) and presentation.get("surviving_object_id"):
        reasons.append(f"presentation_merge:{presentation.get('surviving_object_id')}")
    return reasons


def relation_payload_nonlearner_reasons(owner: dict[str, Any], source_word_id: str, field: str, index: int) -> list[str]:
    rows = owner.get("word_views") or []
    for view in rows:
        if (
            isinstance(view, dict)
            and view.get("source_word_id") == source_word_id
            and view.get("field") == field
            and int(view.get("index", -1)) == index
        ):
            payload = view.get("payload") or {}
            return nonlearner_reasons(payload) if isinstance(payload, dict) else ["payload_not_object"]
    return ["relation_view_missing"]


def main() -> int:
    ap = argparse.ArgumentParser(description="Audit Lexical Current owners for direct-render readiness.")
    ap.add_argument("--output", type=Path)
    args = ap.parse_args()

    word_manifest = load(WORD_MANIFEST)
    relation_manifest = load(REL_MANIFEST)
    lexical_manifest = load(LEX_MANIFEST)

    relation_files = sorted(RELATIONS.glob("*/*.json"))
    relation_by_path: dict[str, dict[str, Any]] = {}
    relation_by_id: dict[str, tuple[str, dict[str, Any]]] = {}
    retired_relations: list[dict[str, Any]] = []
    word_local_relations: list[dict[str, Any]] = []
    single_source_relation_candidates: list[dict[str, Any]] = []
    relation_shape_by_id: dict[str, dict[str, Any]] = {}

    for path in relation_files:
        owner = load(path)
        rel = path.relative_to(ROOT).as_posix()
        relation_by_path[rel] = owner
        rid = str(owner.get("relation_id") or "")
        if rid:
            relation_by_id[rid] = (rel, owner)

        retired = relation_is_retired(owner)
        local_hits = explicit_word_local_relation(owner)
        source_words = sorted({
            str(v.get("source_word_id"))
            for v in owner.get("word_views") or []
            if isinstance(v, dict) and v.get("source_word_id")
        })
        target_words = sorted({
            str((v.get("payload") or {}).get("target_word"))
            for v in owner.get("word_views") or []
            if isinstance(v, dict) and isinstance(v.get("payload"), dict) and (v.get("payload") or {}).get("target_word")
        })
        relation_types = sorted({
            str((v.get("payload") or {}).get("relation_type"))
            for v in owner.get("word_views") or []
            if isinstance(v, dict) and isinstance(v.get("payload"), dict) and (v.get("payload") or {}).get("relation_type")
        })
        external_targets = sorted({
            str(target)
            for v in owner.get("word_views") or []
            if isinstance(v, dict) and isinstance(v.get("payload"), dict)
            for obj in ((v.get("payload") or {}).get("source_evidence_objects") or [])
            if isinstance(obj, dict)
            for target in (obj.get("relation_targets") or [])
            if target
        })
        relation_shape_by_id[rid] = {
            "relation_types": relation_types,
            "source_word_ids": source_words,
            "target_words": target_words,
            "external_targets": external_targets,
        }

        if retired:
            retired_relations.append({
                "relation_id": rid,
                "path": rel,
                "provenance": owner.get("provenance"),
                "source_word_ids": source_words,
                "target_words": target_words,
            })
        if local_hits:
            word_local_relations.append({
                "relation_id": rid,
                "path": rel,
                "hits": local_hits,
                "source_word_ids": source_words,
                "target_words": target_words,
            })
        if len(source_words) == 1 and not target_words:
            single_source_relation_candidates.append({
                "relation_id": rid,
                "path": rel,
                "source_word_id": source_words[0],
                "relation_types": relation_types,
                "external_targets": external_targets,
                "retired": retired,
                "explicit_word_local": bool(local_hits),
            })

    word_files = sorted(WORDS.glob("o*.json"))
    stale_relation_refs: list[dict[str, Any]] = []
    invalid_relation_refs: list[dict[str, Any]] = []
    learner_array_status_leaks: list[dict[str, Any]] = []
    active_secondary_duplicates: list[dict[str, Any]] = []
    exact_surface_duplicate_candidates: list[dict[str, Any]] = []
    words_requiring_web_judgment: set[str] = set()
    referenced_relation_ids: set[str] = set()
    relation_ref_count = 0

    for path in word_files:
        owner = load(path)
        ordinal = owner.get("ordinal")
        wid = str(owner.get("word_id") or "")
        record = owner.get("record") or {}
        active_sense_ids = {
            str(s.get("sense_id"))
            for s in record.get("senses") or []
            if isinstance(s, dict) and s.get("sense_id")
        }

        for field in LEARNER_ARRAYS:
            for index, obj in enumerate(record.get(field) or []):
                if not isinstance(obj, dict):
                    learner_array_status_leaks.append({
                        "ordinal": ordinal,
                        "word_id": wid,
                        "field": field,
                        "index": index,
                        "reasons": ["object_not_dict"],
                    })
                    words_requiring_web_judgment.add(wid)
                    continue
                reasons = nonlearner_reasons(obj)
                if reasons:
                    learner_array_status_leaks.append({
                        "ordinal": ordinal,
                        "word_id": wid,
                        "field": field,
                        "index": index,
                        "object_id": obj.get("fact_id") or obj.get("construction_id"),
                        "reasons": reasons,
                    })
                    words_requiring_web_judgment.add(wid)

        for index, sec in enumerate(record.get("secondary_senses") or []):
            if not isinstance(sec, dict):
                continue
            source_sid = sec.get("source_sense_id")
            if source_sid and str(source_sid) in active_sense_ids:
                active_secondary_duplicates.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "index": index,
                    "object_id": sec.get("fact_id") or sec.get("sense_id"),
                    "source_sense_id": source_sid,
                })
                words_requiring_web_judgment.add(wid)

        collocation_surfaces: set[str] = set()
        for sense in record.get("senses") or []:
            if not isinstance(sense, dict):
                continue
            for coll in sense.get("collocations") or []:
                if isinstance(coll, dict) and coll.get("phrase"):
                    collocation_surfaces.add(norm(coll.get("phrase")))
        for index, cons in enumerate(record.get("constructions") or []):
            if not isinstance(cons, dict):
                continue
            surface = norm(cons.get("pattern") or cons.get("boundary") or cons.get("label_en"))
            if surface and surface in collocation_surfaces:
                exact_surface_duplicate_candidates.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "construction_index": index,
                    "construction_id": cons.get("construction_id") or cons.get("fact_id"),
                    "surface": surface,
                })

        for ref_index, ref in enumerate(owner.get("relation_refs") or []):
            if not isinstance(ref, dict):
                invalid_relation_refs.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "ref_index": ref_index,
                    "reason": "ref_not_object",
                })
                words_requiring_web_judgment.add(wid)
                continue
            rid = str(ref.get("relation_id") or "")
            if rid:
                referenced_relation_ids.add(rid)
                relation_ref_count += 1
            owner_path = str(ref.get("owner_path") or "")
            field = str(ref.get("field") or "")
            index = ref.get("index")
            rel_owner = relation_by_path.get(owner_path)
            if rel_owner is None:
                invalid_relation_refs.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "ref_index": ref_index,
                    "relation_id": rid,
                    "owner_path": owner_path,
                    "reason": "owner_path_missing",
                })
                words_requiring_web_judgment.add(wid)
                continue
            if str(rel_owner.get("relation_id") or "") != rid:
                invalid_relation_refs.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "ref_index": ref_index,
                    "relation_id": rid,
                    "owner_path": owner_path,
                    "reason": "relation_id_mismatch",
                })
                words_requiring_web_judgment.add(wid)
                continue
            local_hits = explicit_word_local_relation(rel_owner)
            retired = relation_is_retired(rel_owner)
            payload_reasons = relation_payload_nonlearner_reasons(
                rel_owner,
                wid,
                field,
                int(index) if isinstance(index, int) else -1,
            )
            if retired or local_hits or payload_reasons:
                stale_relation_refs.append({
                    "ordinal": ordinal,
                    "word_id": wid,
                    "relation_id": rid,
                    "owner_path": owner_path,
                    "field": field,
                    "index": index,
                    "retired_relation": retired,
                    "word_local_hits": local_hits,
                    "payload_nonlearner_reasons": payload_reasons,
                })
                words_requiring_web_judgment.add(wid)

    runtime_text = WEB_RUNTIME.read_text(encoding="utf-8")
    adapter_text = WEB_ADAPTER.read_text(encoding="utf-8")
    frontend_semantic_judgment_hits: list[dict[str, Any]] = []
    for token in FORBIDDEN_WEB_SEMANTIC_FIELDS + FORBIDDEN_WEB_SEMANTIC_NAMES:
        for source, text in (("VocabularyWordRuntime.astro", runtime_text), ("lexical.mjs", adapter_text)):
            if token in text:
                frontend_semantic_judgment_hits.append({"source": source, "token": token})

    orphan_relation_owners = [
        {
            "relation_id": rid,
            "path": rel,
            **relation_shape_by_id.get(rid, {}),
            "retired": relation_is_retired(owner),
        }
        for rid, (rel, owner) in sorted(relation_by_id.items())
        if rid not in referenced_relation_ids
    ]

    relation_type_counts = Counter(
        relation_type
        for shape in relation_shape_by_id.values()
        for relation_type in shape.get("relation_types", [])
    )
    single_source_relation_type_counts = Counter(
        relation_type
        for row in single_source_relation_candidates
        for relation_type in row.get("relation_types", [])
    )

    relation_count_actual = len(relation_files)
    word_count_actual = len(word_files)
    current_relation_manifest_count = int(relation_manifest.get("relation_count") or -1)
    current_word_manifest_count = int(word_manifest.get("word_count") or -1)
    historical_cutover_relation_count = (lexical_manifest.get("cutover") or {}).get("relation_owner_count")

    blockers = {
        "invalid_relation_refs": len(invalid_relation_refs),
        "stale_or_nonlearner_relation_refs": len(stale_relation_refs),
        "retired_current_relation_owners": len(retired_relations),
        "explicit_word_local_relation_owners": len(word_local_relations),
        "learner_array_status_leaks": len(learner_array_status_leaks),
        "active_secondary_duplicates": len(active_secondary_duplicates),
        "frontend_semantic_judgment_hits": len(frontend_semantic_judgment_hits),
        "word_manifest_count_mismatch": int(current_word_manifest_count != word_count_actual),
        "relation_manifest_count_mismatch": int(current_relation_manifest_count != relation_count_actual),
    }

    report = {
        "schema": "kianos.lexical.direct_render_owner_audit.v1",
        "status": "PASS" if not any(blockers.values()) else "BLOCKED",
        "principle": "Current GitHub knowledge assets own semantic inclusion; website hydrates and renders without semantic judgment.",
        "scope": {
            "word_owner_count": word_count_actual,
            "relation_owner_file_count": relation_count_actual,
            "word_manifest_count": current_word_manifest_count,
            "relation_manifest_count": current_relation_manifest_count,
            "historical_cutover_relation_count": historical_cutover_relation_count,
        },
        "blocker_counts": blockers,
        "review_candidate_counts": {
            "single_source_relation_candidates": len(single_source_relation_candidates),
            "orphan_relation_owners": len(orphan_relation_owners),
            "exact_construction_collocation_surface_duplicates": len(exact_surface_duplicate_candidates),
            "words_requiring_web_judgment_if_unfixed": len(words_requiring_web_judgment),
        },
        "relation_reference_closure": {
            "word_relation_ref_count": relation_ref_count,
            "referenced_relation_owner_count": len(referenced_relation_ids),
            "orphan_relation_owner_count": len(orphan_relation_owners),
            "relation_type_counts": dict(sorted(relation_type_counts.items())),
            "single_source_relation_type_counts": dict(sorted(single_source_relation_type_counts.items())),
        },
        "findings": {
            "invalid_relation_refs": invalid_relation_refs,
            "stale_or_nonlearner_relation_refs": stale_relation_refs,
            "retired_current_relation_owners": retired_relations,
            "explicit_word_local_relation_owners": word_local_relations,
            "learner_array_status_leaks": learner_array_status_leaks,
            "active_secondary_duplicates": active_secondary_duplicates,
            "frontend_semantic_judgment_hits": frontend_semantic_judgment_hits,
            "single_source_relation_candidates": single_source_relation_candidates,
            "orphan_relation_owners": orphan_relation_owners,
            "exact_construction_collocation_surface_duplicates": exact_surface_duplicate_candidates,
        },
    }

    text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    print(text, end="")
    return 0 if report["status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
