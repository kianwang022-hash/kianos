#!/usr/bin/env python3
"""Reusable mechanical primitives for Current-first Lexical package execution.

Semantic decisions must already be frozen by a package reconciliation.  This
module only materializes exact Word/Sense/Form/Relation/lookup operations and
fails closed on ambiguous identity or attachment.
"""
from __future__ import annotations

import copy
import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
LOOKUP = LEX / "canonical" / "lookup" / "spelling"
FACT_SHARDS = LEX / "canonical" / "facts" / "shards"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, value: Any, *, compact: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if compact:
        text = json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n"
    else:
        text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    path.write_text(text, encoding="utf-8")


def stable(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha(value: Any) -> str:
    return hashlib.sha256(stable(value).encode("utf-8")).hexdigest()


def set_form_identity(store, ordinal: int, authority: str, type_: str, boundaries: list[dict[str, Any]]) -> None:
    rec = store.record(ordinal)
    rec["form_identity"] = {"authority": authority, "type": type_, "boundaries": boundaries}
    store.mark(ordinal)


def add_lookup_alias(store, ordinal: int, alias: str) -> Path:
    """Attach an exact spelling alias to the same stable Word owner.

    Lookup shards are partitioned by the first two lower-cased Unicode
    codepoints.  Most aliases reuse an existing ASCII shard; an accepted alias
    can legitimately introduce a previously unseen prefix (for example
    ``fête`` -> ``fê.json``).  In that case create the new shard from the exact
    canonical locator instead of failing merely because no earlier word used
    that prefix.  Ownership/collision checks remain fail-closed.
    """
    rec = store.record(ordinal)
    word = rec["word"]
    wid = rec["word_id"]
    if not alias or alias == word:
        raise RuntimeError(f"LOOKUP_ALIAS_INVALID o{ordinal:04d} {alias!r}")
    canonical_path = LOOKUP / f"{word[:2].lower()}.json"
    alias_path = LOOKUP / f"{alias[:2].lower()}.json"
    if not canonical_path.exists():
        raise RuntimeError(f"CANONICAL_LOOKUP_SHARD_MISSING o{ordinal:04d} {word}")
    canonical = load(canonical_path)
    alias_data = canonical if alias_path == canonical_path else (load(alias_path) if alias_path.exists() else {})
    candidates = [copy.deepcopy(x) for x in canonical.get(word, []) if x.get("word_id") == wid and x.get("ordinal") == ordinal]
    if len(candidates) != 1:
        raise RuntimeError(f"CANONICAL_LOOKUP_NOT_UNIQUE o{ordinal:04d} {word} hits={len(candidates)}")
    existing = alias_data.get(alias, [])
    if existing:
        same = [x for x in existing if x.get("word_id") == wid and x.get("ordinal") == ordinal]
        foreign = [x for x in existing if x.get("word_id") != wid or x.get("ordinal") != ordinal]
        if foreign or len(same) != 1:
            raise RuntimeError(f"LOOKUP_ALIAS_CONFLICT o{ordinal:04d} {alias}")
    else:
        alias_data[alias] = candidates
        ordered = {k: alias_data[k] for k in sorted(alias_data)}
        dump(alias_path, ordered, compact=True)
    store.mark(ordinal)
    return alias_path


def set_sense_usage(store, ordinal: int, sid: str, *, note: str | None = None, register: str | None = None,
                    level: str | None = None, writing_safe: bool | None = None) -> dict[str, Any]:
    sense = next((x for x in store.record(ordinal).get("senses", []) if x.get("sense_id") == sid), None)
    if sense is None:
        raise RuntimeError(f"USAGE_TARGET_NOT_ACTIVE o{ordinal:04d} {sid}")
    if note is not None:
        sense["usage_note"] = note
    if register is not None:
        sense["register"] = register
    if level is not None:
        sense["level"] = level
    if writing_safe is not None:
        sense["writing_safe"] = writing_safe
    store.mark(ordinal)
    return sense


def upsert_construction(store, ordinal: int, pattern: str, meaning_cn: str, *, source_sid: str | None = None,
                        level: str = "L2", definition_en: str | None = None, note: str | None = None) -> dict[str, Any]:
    rec = store.record(ordinal)
    constructions = rec.setdefault("constructions", [])
    normalized = pattern.strip().lower()
    hits = [x for x in constructions if str(x.get("pattern", "")).strip().lower() == normalized]
    if len(hits) > 1:
        raise RuntimeError(f"CONSTRUCTION_NOT_UNIQUE o{ordinal:04d} {pattern}")
    if hits:
        row = hits[0]
    else:
        row = {"construction_id": f"construction:{ordinal}:{sha({'pattern': normalized})[:16]}", "pattern": pattern}
        constructions.append(row)
    row["meaning_cn"] = meaning_cn
    row["level"] = level
    if definition_en is not None:
        row["definition_en"] = definition_en
    if note is not None:
        row["note"] = note
    if source_sid is not None:
        row["source_sense_id"] = source_sid
    store.mark(ordinal)
    return row


def ensure_reciprocal_existing_relation(store, a: int, b: int, *, rid: str) -> None:
    """Materialize an already-known relation on both Word owners."""
    a_rec = store.record(a)
    b_rec = store.record(b)
    ref = {"relation_id": rid}
    for rec in (a_rec, b_rec):
        refs = rec.setdefault("relation_refs", [])
        if not any(x.get("relation_id") == rid for x in refs if isinstance(x, dict)):
            refs.append(copy.deepcopy(ref))
    store.mark(a)
    store.mark(b)


def attach_new_reciprocal_relation(store, a: int, b: int, *, relation_type: str, field: str,
                                   a_sid: str | None, b_sid: str | None, boundary: str,
                                   priority: str = "A", regional_a: str | None = None,
                                   regional_b: str | None = None) -> str:
    """Create one stable relation fact and attach it reciprocally."""
    aw = store.record(a)["word"]
    bw = store.record(b)["word"]
    body = {
        "type": relation_type,
        "a": {"word_id": store.record(a)["word_id"], "word": aw, "ordinal": a},
        "b": {"word_id": store.record(b)["word_id"], "word": bw, "ordinal": b},
        "boundary": boundary,
        "priority": priority,
    }
    if a_sid:
        body["a"]["sense_id"] = a_sid
    if b_sid:
        body["b"]["sense_id"] = b_sid
    if regional_a:
        body["a"]["regional"] = regional_a
    if regional_b:
        body["b"]["regional"] = regional_b
    rid = hashlib.sha256(stable(body).encode("utf-8")).hexdigest()
    relation = {"relation_id": rid, **body}
    path = LEX / "relations" / "by-id" / rid[:2] / f"{rid}.json"
    dump(path, relation)
    store.extra_changed_paths.add(path)
    for o, other, sid in ((a, b, a_sid), (b, a, b_sid)):
        rec = store.record(o)
        refs = rec.setdefault("relation_refs", [])
        if not any(x.get("relation_id") == rid for x in refs if isinstance(x, dict)):
            refs.append({"relation_id": rid})
        semantic = rec.setdefault(field, [])
        target_word = store.record(other)["word"]
        exists = [x for x in semantic if isinstance(x, dict) and x.get("target_word") == target_word]
        if not exists:
            item = {"target_word": target_word, "relation_id": rid, "relation_type": relation_type, "boundary": boundary}
            if sid:
                item["source_sense_id"] = sid
            semantic.append(item)
        elif len(exists) > 1:
            raise RuntimeError(f"RELATION_INLINE_AMBIGUOUS o{o:04d}->{target_word}")
    store.mark(a)
    store.mark(b)
    return rid
