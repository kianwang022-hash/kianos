#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
WORDS = LEX / "words" / "by-ordinal"
OUT = LEX / "learner" / "final"
DECISIONS = LEX / "final-learner-object-decisions.json"
SHARD_SIZE = 64

def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def dump(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def stable(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

def sha256(value: Any) -> str:
    return hashlib.sha256(stable(value).encode("utf-8")).hexdigest()

def clone(value: Any) -> Any:
    return json.loads(json.dumps(value, ensure_ascii=False))

def uniq_lines(values: list[Any]) -> list[dict[str, str]]:
    seen = set()
    rows = []
    for raw in values:
        text = str(raw or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        lang = "cn" if any("\u3400" <= ch <= "\u9fff" for ch in text) else "en"
        rows.append({"text": text, "lang": lang})
    return rows

def hydrate_relations(owner: dict[str, Any], record: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    out = clone(record)
    paths = set()
    by_field: dict[str, list[tuple[int, dict[str, Any]]]] = {}
    for ref in owner.get("relation_refs") or []:
        field = str(ref.get("field") or "")
        index = ref.get("index")
        relation_id = str(ref.get("relation_id") or "")
        owner_path = str(ref.get("owner_path") or "")
        if not field or not isinstance(index, int) or not relation_id or not owner_path:
            raise RuntimeError(f"FINAL_LEARNER_RELATION_REF_INVALID:{owner.get('word_id')}")
        relation = load(ROOT / owner_path)
        if relation.get("relation_id") != relation_id:
            raise RuntimeError(f"FINAL_LEARNER_RELATION_ID_MISMATCH:{relation_id}")
        view = next((
            v for v in relation.get("word_views") or []
            if v.get("source_word_id") == owner.get("word_id")
            and v.get("field") == field
            and int(v.get("index", -1)) == index
        ), None)
        if not isinstance((view or {}).get("payload"), dict):
            raise RuntimeError(f"FINAL_LEARNER_RELATION_VIEW_MISSING:{relation_id}:{owner.get('word_id')}")
        paths.add(owner_path)
        by_field.setdefault(field, []).append((index, clone(view["payload"])))
    for field, rows in by_field.items():
        rows.sort(key=lambda x: x[0])
        out[field] = [payload for _, payload in rows]
    return out, sorted(paths)

def repair(kind: str, locator: str, target_id: str | None = None, label: str = "") -> dict[str, Any]:
    return {
        "target_kind": kind,
        "target_id": target_id or None,
        "target_locator": locator,
        "target_label": label,
    }

def compile_relation(word: str, relation: dict[str, Any], locator: str) -> dict[str, Any]:
    target = str(relation.get("target_expression") or relation.get("target_word") or relation.get("module") or "relation")
    evidence_objects = relation.get("source_evidence_objects") or []
    lines = uniq_lines([
        relation.get("meaning_cn"),
        relation.get("definition_cn"),
        relation.get("boundary"),
        *(relation.get("boundaries") or []),
        relation.get("learning_note"),
        relation.get("relation_note"),
        relation.get("shared_definition"),
        relation.get("shared_core"),
        relation.get("shared_meaning"),
        *(obj.get("learner_note") for obj in evidence_objects if isinstance(obj, dict)),
        relation.get("definition_en"),
    ])
    differences = []
    for obj in evidence_objects:
        diff = obj.get("difference") if isinstance(obj, dict) else None
        if isinstance(diff, dict):
            for key, value in diff.items():
                if value not in (None, ""):
                    differences.append({"key": str(key), "value": str(value)})
    target_id = str(relation.get("fact_id") or relation.get("relation_id") or "") or None
    return {
        "title": f"{word} ↔ {target}",
        "target_word": target,
        "lines": lines,
        "differences": differences,
        "repair": repair("relation", locator, target_id, f"{word} ↔ {target}"),
    }

def compile_form(form: Any) -> dict[str, Any] | None:
    if not isinstance(form, dict):
        return None
    variants = []
    for variant in form.get("variants") or []:
        if not isinstance(variant, dict):
            continue
        variants.append({
            "pos": list(variant.get("pos") or []),
            "reading": str(variant.get("learner_key") or variant.get("canonical_form") or variant.get("variant_id") or ""),
            "ipa": str(variant.get("ipa") or ""),
        })
    boundaries = []
    for boundary in form.get("boundaries") or []:
        if not isinstance(boundary, dict):
            continue
        boundaries.append({
            "surface": str(boundary.get("surface") or ""),
            "condition": str(boundary.get("condition") or ""),
            "note": str(boundary.get("note") or ""),
        })
    if not variants and not boundaries and not form.get("boundary"):
        return None
    boundary_text = "" if variants else str(form.get("boundary") or "")
    return {
        "boundary": boundary_text,
        "boundaries": boundaries,
        "variants": variants,
        "repair": repair("form_identity", "record.form_identity", None, boundary_text),
    }

def compile_word(owner: dict[str, Any], decisions: dict[str, Any]) -> dict[str, Any]:
    record, relation_paths = hydrate_relations(owner, owner["record"])
    word_id = str(owner["word_id"])
    word = str(record.get("word") or owner.get("word") or "")
    word_decision = (decisions.get("words") or {}).get(word_id) or {}
    usage_note_decisions = word_decision.get("sense_usage_notes") or {}

    core = record.get("core_concept") or {}
    summary_cn = str(core.get("core_meaning_cn") or core.get("mental_model_cn") or "").strip()
    mental_cn = str(core.get("mental_model_cn") or "").strip()
    decision_cn = mental_cn if mental_cn and mental_cn != summary_cn else ""

    senses = []
    materialized_collocation_ids = set()
    for i, sense in enumerate(record.get("senses") or []):
        if not isinstance(sense, dict):
            continue
        sense_id = str(sense.get("sense_id") or "")
        usage = []
        for j, item in enumerate(sense.get("collocations") or []):
            if not isinstance(item, dict):
                continue
            collocation_id = str(item.get("collocation_id") or "")
            if collocation_id:
                materialized_collocation_ids.add(collocation_id)
            usage.append({
                "id": collocation_id or None,
                "source_locator": f"record.senses[{i}].collocations[{j}]",
                "phrase": str(item.get("phrase") or ""),
                "meaning_cn": str(item.get("meaning_cn") or ""),
                "kind": "fixed_pattern" if item.get("exam_value") == "fixed_pattern" else "usage_example",
                "repair": repair(
                    "collocation",
                    f"record.senses[{i}].collocations[{j}]",
                    collocation_id or None,
                    str(item.get("phrase") or word),
                ) if item.get("exam_value") == "fixed_pattern" else None,
            })
        overlay = sense.get("lexical_identity_overlay") if isinstance(sense.get("lexical_identity_overlay"), dict) else None
        overlay_text = ""
        if overlay:
            overlay_text = str(
                overlay.get("note") or overlay.get("label_cn") or overlay.get("label_en")
                or overlay.get("boundary") or overlay.get("identity_type") or overlay.get("canonical_form") or ""
            )
        overlay_object = None
        if overlay_text:
            overlay_object = {
                "text": overlay_text,
                "repair": repair(
                    "form_identity",
                    f"record.senses[{i}].lexical_identity_overlay",
                    None,
                    overlay_text,
                ),
            }
        senses.append({
            "id": sense_id or None,
            "source_locator": f"record.senses[{i}]",
            "pos": str(sense.get("pos") or ""),
            "governing_pattern": str(sense.get("governing_pattern") or ""),
            "definition_cn": str(sense.get("definition_cn") or ""),
            "definition_en": str(sense.get("definition_en") or ""),
            "note": "" if (usage_note_decisions.get(sense_id) or {}).get("disposition") == "EXPLORE_ONLY" else str(sense.get("usage_note") or ""),
            "identity_overlay": overlay_object,
            "usage": usage,
            "repair": repair("sense", f"record.senses[{i}]", sense_id or None, str(sense.get("definition_cn") or sense.get("definition_en") or word)),
        })

    secondary = []
    for i, branch in enumerate(record.get("secondary_senses") or []):
        if not isinstance(branch, dict):
            continue
        branch_id = str(branch.get("fact_id") or branch.get("source_sense_id") or "")
        secondary.append({
            "id": branch_id or None,
            "source_locator": f"record.secondary_senses[{i}]",
            "pos": str(branch.get("pos") or ""),
            "definition_cn": str(branch.get("definition_cn") or branch.get("meaning_cn") or ""),
            "definition_en": str(branch.get("definition_en") or branch.get("label_en") or ""),
            "pattern": str(branch.get("pattern") or branch.get("boundary") or ""),
            "repair": repair("secondary_sense", f"record.secondary_senses[{i}]", branch_id or None, str(branch.get("definition_cn") or branch.get("meaning_cn") or branch.get("definition_en") or branch.get("label_en") or word)),
        })

    constructions = []
    for i, item in enumerate(record.get("constructions") or []):
        if not isinstance(item, dict):
            continue
        survivor = str(((item.get("presentation_merge") or {}).get("surviving_object_id")) or "")
        if survivor and survivor in materialized_collocation_ids:
            continue
        item_id = str(item.get("fact_id") or item.get("construction_id") or "")
        title = str(item.get("pattern") or item.get("label_en") or item.get("boundary") or "")
        lines = uniq_lines([
            item.get("meaning_cn"),
            item.get("definition_cn"),
            item.get("boundary"),
            item.get("learning_note"),
            item.get("definition_en"),
        ])
        lines = [line for line in lines if line["text"] != title]
        constructions.append({
            "id": item_id or None,
            "source_locator": f"record.constructions[{i}]",
            "pattern": title,
            "lines": lines,
            "repair": repair("construction", f"record.constructions[{i}]", item_id or None, title or word),
        })

    confusables = [
        compile_relation(word, relation, f"record.confusables[{i}]")
        for i, relation in enumerate(record.get("confusables") or [])
        if isinstance(relation, dict)
    ]
    relations = [
        compile_relation(word, relation, f"record.semantic_neighbors[{i}]")
        for i, relation in enumerate(record.get("semantic_neighbors") or [])
        if isinstance(relation, dict)
    ]

    family = []
    for i, item in enumerate(record.get("word_family") or []):
        if not isinstance(item, dict):
            continue
        family.append({
            "target_word": str(item.get("target_word") or ""),
            "lines": uniq_lines([
                item.get("meaning_cn"),
                item.get("definition_cn"),
                item.get("boundary"),
                item.get("learning_note"),
                item.get("shared_definition"),
                item.get("definition_en"),
            ]),
            "source_locator": f"record.word_family[{i}]",
        })

    def pos_label(value: Any) -> str:
        pos = str(value or "").lower()
        if pos.startswith("verb") or pos == "v": return "V"
        if pos.startswith("adj") or pos == "a": return "A"
        if pos.startswith("noun") or pos == "n": return "N"
        if pos.startswith("adv"): return "ADV"
        if pos.startswith("prep"): return "PREP"
        if pos.startswith("interj"): return "INTJ"
        if pos.startswith("numeral"): return "NUM"
        return str(value or "S").upper()

    primary_counts: dict[str, int] = {}
    secondary_counts: dict[str, int] = {}
    for sense in senses:
        code = pos_label(sense.get("pos"))
        primary_counts[code] = primary_counts.get(code, 0) + 1
    for sense in secondary:
        code = pos_label(sense.get("pos"))
        secondary_counts[code] = secondary_counts.get(code, 0) + 1
    pos_order = ["V", "A", "N", "ADV", "PREP", "INTJ", "NUM"]
    all_codes = sorted(
        set(primary_counts) | set(secondary_counts),
        key=lambda code: (pos_order.index(code) if code in pos_order else 99, code),
    )
    recall_parts = []
    for code in all_codes:
        primary = primary_counts.get(code, 0)
        secondary_count = secondary_counts.get(code, 0)
        if primary and secondary_count:
            recall_parts.append(f"({primary}+{secondary_count}){code}")
        elif secondary_count:
            recall_parts.append(f"{secondary_count}{code}+")
        else:
            recall_parts.append(f"{primary}{code}")
    recall_density = "rich" if (
        len(senses) + len(secondary) > 1
        or bool(constructions)
        or any(bool(sense.get("usage")) for sense in senses)
    ) else "light"

    source_fingerprint = sha256({"record": record, "relation_paths": relation_paths})
    sense_lineage = []
    for ref in ((owner.get("identity_refs") or {}).get("senses") or []):
        if not isinstance(ref, dict) or not ref.get("sense_id"):
            continue
        status = str(ref.get("status") or "unknown").lower()
        if status == "active":
            continue
        sense_lineage.append({
            "word_id": word_id,
            "target_kind": "sense",
            "from_target_id": str(ref.get("sense_id")),
            "status": status,
            "to_target_id": str(ref.get("merged_into_sense_id")) if ref.get("merged_into_sense_id") else None,
        })

    return {
        "schema": "kianos.lexical.final_learner_object.v1",
        "word_id": word_id,
        "ordinal": int(owner["ordinal"]),
        "word": word,
        "source_owner_path": f"content/lexical/words/by-ordinal/o{int(owner['ordinal']):04d}.json",
        "source_fingerprint": source_fingerprint,
        "sense_lineage": sense_lineage,
        "recall_map": {
            "parts": recall_parts,
            "density": recall_density,
        },
        "word_feel": {
            "summary_cn": summary_cn,
            "decision_cn": decision_cn,
            "repair": repair("core", "record.core_concept", None, summary_cn or word),
        },
        "senses": senses,
        "secondary_senses": secondary,
        "constructions": constructions,
        "reference": {
            "confusables": confusables,
            "relations": relations,
            "form": compile_form(record.get("form_identity")),
            "family": family,
        },
    }

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output-root", type=Path, default=OUT)
    args = ap.parse_args()

    output_root = args.output_root
    decisions = load(DECISIONS) if DECISIONS.exists() else {"words": {}}
    shards_dir = output_root / "shards"
    if shards_dir.exists():
        shutil.rmtree(shards_dir)
    shards_dir.mkdir(parents=True, exist_ok=True)

    objects = []
    for path in sorted(WORDS.glob("o*.json")):
        owner = load(path)
        objects.append(compile_word(owner, decisions))

    if len(objects) != 7946:
        raise RuntimeError(f"FINAL_LEARNER_OBJECT_COUNT:{len(objects)}")

    shard_rows = []
    for start in range(0, len(objects), SHARD_SIZE):
        chunk = objects[start:start + SHARD_SIZE]
        first = chunk[0]["ordinal"]
        last = chunk[-1]["ordinal"]
        name = f"o{first:04d}-{last:04d}.json"
        shard_path = shards_dir / name
        dump(shard_path, chunk)
        shard_rows.append({
            "start": first,
            "end": last,
            "path": shard_path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(shard_path.read_bytes()).hexdigest(),
        })

    manifest = {
        "schema": "kianos.lexical.final_learner_manifest.v1",
        "status": "CURRENT_DERIVED_LEARNER_OBJECT",
        "semantic_authority": False,
        "source_authority": "content/lexical/manifest.json",
        "contract": "content/lexical/FINAL_LEARNER_OBJECT_CONTRACT.md",
        "builder": "tools/lexical_build_final_learner_objects.py",
        "decisions": "content/lexical/final-learner-object-decisions.json",
        "object_count": len(objects),
        "shard_size": SHARD_SIZE,
        "shards": shard_rows,
    }
    dump(output_root / "manifest.json", manifest)
    print(json.dumps({
        "object_count": len(objects),
        "shard_count": len(shard_rows),
        "first": objects[0]["word"],
        "last": objects[-1]["word"],
    }, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
