#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
import subprocess
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

def dump(path: Path, value: Any) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == payload:
        return False
    # Never truncate a valid projection/cache if the process is interrupted.
    fd, temporary = tempfile.mkstemp(dir=path.parent, prefix=".lexical-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            stream.write(payload)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return True

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
        relation_path = ROOT / owner_path
        relation = load(relation_path) if relation_path.exists() else None
        if relation is not None and relation.get("relation_id") != relation_id:
            raise RuntimeError(f"FINAL_LEARNER_RELATION_ID_MISMATCH:{relation_id}")
        view = next((
            v for v in ((relation or {}).get("word_views") or [])
            if v.get("source_word_id") == owner.get("word_id")
            and v.get("field") == field
            and int(v.get("index", -1)) == index
        ), None)
        payload = (view or {}).get("payload")
        if not isinstance(payload, dict):
            inline_rows = record.get(field) or []
            inline_payload = inline_rows[index] if 0 <= index < len(inline_rows) else None
            inline_relation_id = (
                str((inline_payload or {}).get("relation_id") or (inline_payload or {}).get("fact_id") or "")
                if isinstance(inline_payload, dict) else ""
            )
            if not isinstance(inline_payload, dict) or (inline_relation_id and inline_relation_id != relation_id):
                raise RuntimeError(f"FINAL_LEARNER_RELATION_VIEW_MISSING:{relation_id}:{owner.get('word_id')}")
            payload = inline_payload
        if relation_path.exists():
            paths.add(owner_path)
        by_field.setdefault(field, []).append((index, clone(payload)))
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
    secondary_decisions = word_decision.get("secondary_senses") or {}
    overlay_decisions = word_decision.get("sense_identity_overlays") or {}
    family_decisions = word_decision.get("word_family") or {}
    word_feel_decision = word_decision.get("word_feel") or {}

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
        overlay_disposition = (overlay_decisions.get(sense_id) or {}).get("disposition")
        if overlay_disposition not in (None, "DEFAULT_DEPTH", "EXPLORE_ONLY"):
            raise RuntimeError(f"FINAL_LEARNER_OVERLAY_DISPOSITION_INVALID:{word_id}:{sense_id}:{overlay_disposition}")
        if overlay_text and overlay_disposition != "EXPLORE_ONLY":
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
        secondary_disposition = (secondary_decisions.get(branch_id) or {}).get("disposition")
        if secondary_disposition not in (None, "DEFAULT_DEPTH", "EXPLORE_ONLY"):
            raise RuntimeError(f"FINAL_LEARNER_SECONDARY_DISPOSITION_INVALID:{word_id}:{branch_id}:{secondary_disposition}")
        if secondary_disposition == "EXPLORE_ONLY":
            continue
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
        family_id = str(item.get("fact_id") or item.get("target_word") or "")
        family_disposition = (family_decisions.get(family_id) or {}).get("disposition")
        if family_disposition not in (None, "DEFAULT_DEPTH", "EXPLORE_ONLY"):
            raise RuntimeError(f"FINAL_LEARNER_FAMILY_DISPOSITION_INVALID:{word_id}:{family_id}:{family_disposition}")
        if family_disposition == "EXPLORE_ONLY":
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
        "word_feel": None if word_feel_decision.get("disposition") == "EXPLORE_ONLY" else {
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

def clean_input_signature() -> str | None:
    """Cheap Git tree proof; never trust it over dirty/untracked source input."""
    inputs = ["content/lexical/words", "content/lexical/relations",
              "content/lexical/final-learner-object-decisions.json",
              "tools/lexical_build_final_learner_objects.py"]
    try:
        if subprocess.run(["git", "diff", "--quiet", "HEAD", "--", *inputs], cwd=ROOT,
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
            return None
        if subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", "--", *inputs], cwd=ROOT):
            return None
        trees = subprocess.check_output(["git", "ls-tree", "HEAD", "--", *inputs], cwd=ROOT)
        return hashlib.sha256(trees).hexdigest() if trees else None
    except (OSError, subprocess.CalledProcessError):
        return None


def build(output_root: Path, cache_root: Path, expected_count: int = 7946) -> dict[str, Any]:
    input_signature = clean_input_signature()
    proof_path = cache_root / "quick-proof.json"
    try:
        proof = load(proof_path)
        if (input_signature and proof["inputs"] == input_signature
                and proof["output_root"] == str(output_root.resolve())
                and proof["result"]["object_count"] == expected_count
                and proof["files"]
                and all(hashlib.sha256((output_root / name).read_bytes()).hexdigest() == digest
                        for name, digest in proof["files"].items())):
            return {**proof["result"], "compiled_words": 0, "reused_words": expected_count,
                    "changed_shards": 0, "removed_shards": 0, "manifest_changed": False,
                    "input_tree_reused": True}
    except (OSError, ValueError, KeyError, TypeError):
        pass
    decisions = load(DECISIONS) if DECISIONS.exists() else {"words": {}}
    shards_dir = output_root / "shards"
    compiler_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    paths = sorted(WORDS.glob("o*.json"))
    if len(paths) != expected_count:
        raise RuntimeError(f"FINAL_LEARNER_OBJECT_COUNT:{len(paths)}")
    dependency_hashes = {}
    caches = {}
    pending_caches = {}
    objects = []
    compiled = 0
    standard_dependencies = True
    for offset, path in enumerate(paths):
        owner = load(path)
        if owner.get("ordinal") != offset + 1:
            raise RuntimeError(f"FINAL_LEARNER_ORDINAL_MISMATCH:{path.name}")
        dependencies = {}
        for ref in owner.get("relation_refs") or []:
            relative = str(ref.get("owner_path") or "")
            standard_dependencies &= relative.startswith("content/lexical/relations/by-id/")
            source = (ROOT / relative).resolve()
            if not source.is_relative_to(ROOT.resolve()):
                raise RuntimeError(f"FINAL_LEARNER_RELATION_PATH_INVALID:{relative}")
            if relative not in dependency_hashes:
                dependency_hashes[relative] = hashlib.sha256(source.read_bytes()).hexdigest() if source.is_file() else None
            dependencies[relative] = dependency_hashes[relative]
        signature = sha256({"compiler": compiler_hash, "owner": owner,
                            "relations": dependencies,
                            "decision": (decisions.get("words") or {}).get(owner["word_id"])})
        name = f"{offset // SHARD_SIZE:04d}.json"
        if name not in caches:
            try:
                caches[name] = load(cache_root / name)
                if not isinstance(caches[name], dict):
                    caches[name] = {}
            except (OSError, ValueError):
                caches[name] = {}
        prior = caches[name].get(owner["word_id"], {})
        if (isinstance(prior, dict) and prior.get("input_hash") == signature
                and isinstance(prior.get("object"), dict)
                and prior.get("output_hash") == sha256(prior["object"])):
            obj = prior["object"]
        else:
            obj = compile_word(owner, decisions)
            compiled += 1
        objects.append(obj)
        pending_caches.setdefault(name, {})[owner["word_id"]] = {
            "input_hash": signature, "output_hash": sha256(obj), "object": obj}

    # Resolve every affected owner successfully before touching any published
    # shard. A bad relation cannot delete the previous valid projection.

    shard_rows = []
    expected_shards = set()
    changed_shards = 0
    for start in range(0, len(objects), SHARD_SIZE):
        chunk = objects[start:start + SHARD_SIZE]
        first = chunk[0]["ordinal"]
        last = chunk[-1]["ordinal"]
        name = f"o{first:04d}-{last:04d}.json"
        expected_shards.add(name)
        shard_path = shards_dir / name
        if dump(shard_path, chunk):
            changed_shards += 1
        shard_rows.append({
            "start": first,
            "end": last,
            "path": shard_path.relative_to(ROOT).as_posix(),
            "sha256": hashlib.sha256(shard_path.read_bytes()).hexdigest(),
        })

    removed_shards = 0
    for stale in shards_dir.glob("*.json"):
        if stale.name not in expected_shards:
            stale.unlink()
            removed_shards += 1

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
    manifest_changed = dump(output_root / "manifest.json", manifest)
    for name, rows in pending_caches.items():
        dump(cache_root / name, rows)
    result = {
        "object_count": len(objects),
        "shard_count": len(shard_rows),
        "changed_shards": changed_shards,
        "removed_shards": removed_shards,
        "manifest_changed": manifest_changed,
        "compiled_words": compiled,
        "reused_words": len(objects) - compiled,
        "first": objects[0]["word"],
        "last": objects[-1]["word"],
    }
    if input_signature and standard_dependencies:
        dump(proof_path, {
            "inputs": input_signature, "output_root": str(output_root.resolve()), "result": result,
            "files": {p.relative_to(output_root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                      for p in [output_root / "manifest.json", *[shards_dir / n for n in sorted(expected_shards)]]}
        })
    return result

def validate_changed(base: str) -> dict[str, Any]:
    changed = set(subprocess.check_output(
        ["git", "diff", "--name-only", base, "HEAD"], cwd=ROOT, text=True).splitlines())
    full = bool(changed & {"tools/lexical_build_final_learner_objects.py",
                          "content/lexical/final-learner-object-decisions.json"})
    decisions = load(DECISIONS) if DECISIONS.exists() else {"words": {}}
    count = 0
    # Relations can be shared by several Word owners: validate reverse
    # dependants too, including when a relation is removed.
    for path in sorted(WORDS.glob("o*.json")):
        owner = load(path)
        inputs = {path.relative_to(ROOT).as_posix()}
        inputs.update(ref.get("owner_path") for ref in owner.get("relation_refs") or [])
        if full or inputs & changed:
            compile_word(owner, decisions)
            count += 1
    return {"status": "PASS", "validated_words": count, "changed_paths": len(changed), "writes": 0}

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output-root", type=Path, default=OUT)
    ap.add_argument("--cache-root", type=Path, default=ROOT / "static-web/.cache/lexical-projection")
    ap.add_argument("--validate-changed-from", help="Read-only content validation against an exact Git base")
    args = ap.parse_args()
    result = validate_changed(args.validate_changed_from) if args.validate_changed_from else build(args.output_root, args.cache_root)
    print(json.dumps(result, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
