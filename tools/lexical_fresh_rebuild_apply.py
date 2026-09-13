#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS = ROOT / "content" / "lexical" / "words" / "by-ordinal"
RELATIONS = ROOT / "content" / "lexical" / "relations" / "by-id"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def relation_path(relation_id: str) -> Path | None:
    for path in RELATIONS.glob("*/*.json"):
        obj = load(path)
        if obj.get("relation_id") == relation_id:
            return path
    return None


def current_sense_map(owner: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(row.get("sense_id")): row
        for row in (owner.get("record") or {}).get("senses") or []
        if isinstance(row, dict) and row.get("sense_id")
    }


def reference_sense_map(owner: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(row.get("stable_sense_id")): row
        for row in owner.get("reference_senses") or []
        if isinstance(row, dict) and row.get("stable_sense_id")
    }


def identity_sense_map(owner: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        str(row.get("sense_id")): row
        for row in (owner.get("identity_refs") or {}).get("senses") or []
        if isinstance(row, dict) and row.get("sense_id")
    }


def learner_from_reference(row: dict[str, Any], overrides: dict[str, Any]) -> dict[str, Any]:
    sense = {
        "collocations": [],
        "confidence": "high",
        "definition_cn": row.get("definition_cn"),
        "definition_en": row.get("definition_en"),
        "governing_pattern": "",
        "level": "L2",
        "needs_human_review": 0,
        "pos": row.get("pos"),
        "sense_id": row.get("stable_sense_id"),
        "sense_label_en": row.get("definition_en"),
        "sort_order": 0,
        "transitivity": "nonverb" if row.get("pos") != "verb" else "",
    }
    sense.update(copy.deepcopy(overrides))
    return sense


def reference_from_active(sense: dict[str, Any], identity: dict[str, Any] | None, reason: str, batch_path: str) -> dict[str, Any]:
    return {
        "stable_sense_id": sense.get("sense_id"),
        "status": "deprecated",
        "merged_into_sense_id": None,
        "pos": sense.get("pos"),
        "definition_cn": sense.get("definition_cn"),
        "definition_en": sense.get("definition_en"),
        "updated_at": None,
        "source_row": identity.get("source_row") if identity else None,
        "source_path": identity.get("source_path") if identity else batch_path,
        "reference_only": True,
        "fresh_rebuild_demotion_reason": reason,
    }


def build_final_senses(owner: dict[str, Any], spec: dict[str, Any], batch_path: str) -> list[dict[str, Any]]:
    current = current_sense_map(owner)
    reference = reference_sense_map(owner)
    final: list[dict[str, Any]] = []
    seen: set[str] = set()

    for index, plan in enumerate(spec.get("sense_plan") or []):
        source = plan.get("source")
        sid = str(plan.get("sense_id") or "")
        overrides = copy.deepcopy(plan.get("overrides") or {})
        if not sid or sid in seen:
            raise ValueError(f"INVALID_OR_DUPLICATE_SENSE_ID:{spec['word_id']}:{sid}")
        seen.add(sid)

        if source == "current":
            if sid not in current:
                raise ValueError(f"CURRENT_SENSE_NOT_FOUND:{spec['word_id']}:{sid}")
            sense = copy.deepcopy(current[sid])
            sense.update(overrides)
        elif source == "reference":
            if sid not in reference:
                raise ValueError(f"REFERENCE_SENSE_NOT_FOUND:{spec['word_id']}:{sid}")
            sense = learner_from_reference(reference[sid], overrides)
        elif source == "new":
            payload = copy.deepcopy(plan.get("payload") or {})
            if payload.get("sense_id") != sid:
                raise ValueError(f"NEW_SENSE_ID_MISMATCH:{spec['word_id']}:{sid}")
            sense = payload
        else:
            raise ValueError(f"UNKNOWN_SENSE_SOURCE:{spec['word_id']}:{source}")

        sense["sort_order"] = index
        final.append(sense)
    return final


def update_lifecycle(owner: dict[str, Any], final_senses: list[dict[str, Any]], spec: dict[str, Any], batch_path: str) -> None:
    active_ids = {str(row["sense_id"]) for row in final_senses}
    old_current = current_sense_map(owner)
    old_reference = reference_sense_map(owner)
    identity = owner.setdefault("identity_refs", {})
    identity_rows = identity.setdefault("senses", [])
    identity_by_id = {str(row.get("sense_id")): row for row in identity_rows if isinstance(row, dict) and row.get("sense_id")}

    for sid in active_ids:
        row = identity_by_id.get(sid)
        if row is None:
            row = {
                "sense_id": sid,
                "status": "active",
                "merged_into_sense_id": None,
                "source_row": None,
                "source_path": batch_path,
                "fresh_rebuild_created": True,
            }
            identity_rows.append(row)
            identity_by_id[sid] = row
        row["status"] = "active"
        row["merged_into_sense_id"] = None

    demotion_reasons = spec.get("demotion_reasons") or {}
    new_reference: dict[str, dict[str, Any]] = {
        sid: copy.deepcopy(row) for sid, row in old_reference.items() if sid not in active_ids
    }

    for sid, sense in old_current.items():
        if sid in active_ids:
            continue
        row = identity_by_id.get(sid)
        if row is not None:
            row["status"] = "deprecated"
            row["merged_into_sense_id"] = None
        reason = demotion_reasons.get(sid) or "Not selected for the fresh learner-facing object."
        new_reference[sid] = reference_from_active(sense, row, reason, batch_path)

    for sid, row in identity_by_id.items():
        if sid not in active_ids and sid in new_reference:
            row["status"] = "deprecated"
            row["merged_into_sense_id"] = None
            new_reference[sid]["status"] = "deprecated"
            new_reference[sid]["reference_only"] = True

    owner["reference_senses"] = sorted(new_reference.values(), key=lambda r: str(r.get("stable_sense_id") or ""))
    identity["active_collocations"] = sorted({
        str(c.get("collocation_id"))
        for sense in final_senses
        for c in (sense.get("collocations") or [])
        if isinstance(c, dict) and c.get("collocation_id")
    })


def validate_owner(owner: dict[str, Any], spec: dict[str, Any]) -> dict[str, Any]:
    record = owner.get("record") or {}
    senses = record.get("senses") or []
    active_ids = {str(s.get("sense_id")) for s in senses if isinstance(s, dict) and s.get("sense_id")}
    identity = identity_sense_map(owner)
    refs = reference_sense_map(owner)
    errors: list[str] = []

    if owner.get("word_id") != spec.get("word_id") or owner.get("ordinal") != spec.get("ordinal"):
        errors.append("OWNER_IDENTITY_MISMATCH")
    if len(active_ids) != len(senses):
        errors.append("ACTIVE_SENSE_DUPLICATE_OR_MISSING_ID")
    for sid in active_ids:
        if identity.get(sid, {}).get("status") != "active":
            errors.append(f"ACTIVE_IDENTITY_NOT_ACTIVE:{sid}")
        if sid in refs:
            errors.append(f"ACTIVE_SENSE_STILL_REFERENCE_ONLY:{sid}")
    cluster_ids = {
        str(sid)
        for cluster in (record.get("core_concept") or {}).get("core_clusters") or []
        for sid in (cluster.get("sense_ids") or [])
    }
    missing_cluster = sorted(cluster_ids - active_ids)
    if missing_cluster:
        errors.append("CORE_CLUSTER_POINTS_TO_NONACTIVE:" + ",".join(missing_cluster))
    construction_ids = [str(row.get("construction_id")) for row in record.get("constructions") or [] if isinstance(row, dict)]
    if len(construction_ids) != len(set(construction_ids)):
        errors.append("DUPLICATE_CONSTRUCTION_ID")
    if int((owner.get("provenance") or {}).get("semantic_delta") or 0) < 1:
        errors.append("SEMANTIC_DELTA_NOT_RECORDED")
    if errors:
        raise ValueError(f"FRESH_REBUILD_OWNER_INVALID:{spec['word_id']}:{'|'.join(errors)}")
    return {
        "ordinal": owner.get("ordinal"),
        "word_id": owner.get("word_id"),
        "active_sense_ids": sorted(active_ids),
        "reference_sense_count": len(refs),
        "construction_count": len(record.get("constructions") or []),
        "sentinels_resolved": spec.get("sentinels") or [],
        "disposition": "FRESH_UPGRADED",
    }


def apply_owner(spec: dict[str, Any], batch_id: str, batch_path: str) -> dict[str, Any]:
    ordinal = int(spec["ordinal"])
    path = WORDS / f"o{ordinal:04d}.json"
    owner = load(path)
    if owner.get("word_id") != spec.get("word_id"):
        raise ValueError(f"WORD_ID_MISMATCH:o{ordinal:04d}:{owner.get('word_id')}!={spec.get('word_id')}")

    record = owner.get("record") or {}
    final_senses = build_final_senses(owner, spec, batch_path)
    update_lifecycle(owner, final_senses, spec, batch_path)
    record["senses"] = final_senses
    record["core_concept"] = copy.deepcopy(spec["core_concept"])
    if "constructions" in spec:
        record["constructions"] = copy.deepcopy(spec.get("constructions") or [])
    if "secondary_senses" in spec:
        record["secondary_senses"] = copy.deepcopy(spec.get("secondary_senses") or [])
    if "confusables" in spec:
        record["confusables"] = copy.deepcopy(spec.get("confusables") or [])
    record["needs_delta_review"] = False
    owner["record"] = record

    provenance = owner.setdefault("provenance", {})
    provenance["semantic_delta"] = max(1, int(provenance.get("semantic_delta") or 0))
    provenance["fresh_rebuild_batch"] = batch_id
    provenance["fresh_rebuild_authority"] = batch_path

    dump(path, owner)
    result = validate_owner(owner, spec)
    result["path"] = path.relative_to(ROOT).as_posix()
    return result


def validate_relations(batch: dict[str, Any]) -> list[dict[str, Any]]:
    out = []
    for spec in batch.get("relations") or []:
        rid = spec.get("relation_id")
        path = relation_path(rid)
        if path is None:
            raise ValueError(f"RELATION_OWNER_NOT_FOUND:{rid}")
        owner = load(path)
        if spec.get("disposition") != "FRESH_PASS_NO_CHANGE":
            raise ValueError(f"UNSUPPORTED_RELATION_DISPOSITION:{rid}:{spec.get('disposition')}")
        out.append({
            "relation_id": rid,
            "path": path.relative_to(ROOT).as_posix(),
            "disposition": "FRESH_PASS_NO_CHANGE",
            "reason": spec.get("reason"),
        })
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch")
    parser.add_argument("--report", required=True)
    args = parser.parse_args()

    batch_path = Path(args.batch)
    batch = load(batch_path)
    if batch.get("status") != "CHAT_REVIEWED_FRESH_REBUILD_INPUT":
        raise SystemExit("BATCH_NOT_CHAT_REVIEWED_FRESH_REBUILD_INPUT")
    if batch.get("legacy_semantic_authority") is not False:
        raise SystemExit("LEGACY_AUTHORITY_MUST_BE_FALSE")

    rel_batch_path = batch_path.relative_to(ROOT).as_posix()
    results = [apply_owner(spec, batch["batch_id"], rel_batch_path) for spec in batch.get("owners") or []]
    relations = validate_relations(batch)
    report = {
        "schema": "kianos.lexical.fresh_rebuild_apply_report.v1",
        "batch_id": batch.get("batch_id"),
        "status": "PASS",
        "legacy_semantic_authority": False,
        "owner_count": len(results),
        "relation_count": len(relations),
        "learner_state_mutation": 0,
        "owners": results,
        "relations": relations,
    }
    dump(Path(args.report), report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
