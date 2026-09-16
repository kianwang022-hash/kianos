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


def set_transitivity(store, ordinal: int, sid: str, *, transitivity: str, pattern: str | None = None) -> None:
    sense = next((x for x in store.record(ordinal).get("senses", []) if x.get("sense_id") == sid), None)
    if sense is None:
        raise RuntimeError(f"TRANSITIVITY_TARGET_NOT_ACTIVE o{ordinal:04d} {sid}")
    sense["transitivity"] = transitivity
    if pattern is not None:
        sense["governing_pattern"] = pattern
    store.mark(ordinal)


def upsert_construction(store, ordinal: int, pattern: str, meaning_cn: str, *, source_sid: str | None = None,
                        level: str = "L2", definition_en: str | None = None, note: str | None = None) -> dict[str, Any]:
    arr = store.record(ordinal).setdefault("constructions", [])
    hits = [x for x in arr if x.get("pattern") == pattern]
    if len(hits) > 1:
        raise RuntimeError(f"CONSTRUCTION_DUPLICATE o{ordinal:04d} {pattern}")
    if hits:
        item = hits[0]
        item["meaning_cn"] = meaning_cn
        item["level"] = level
    else:
        store.add_construction(ordinal, pattern, meaning_cn, level=level)
        item = next(x for x in arr if x.get("pattern") == pattern)
    if source_sid is not None:
        if not any(x.get("sense_id") == source_sid for x in store.record(ordinal).get("senses", [])):
            raise RuntimeError(f"CONSTRUCTION_SOURCE_NOT_ACTIVE o{ordinal:04d} {pattern} {source_sid}")
        item["source_sense_id"] = source_sid
    if definition_en is not None:
        item["definition_en"] = definition_en
    if note is not None:
        item["usage_note"] = note
    store.mark(ordinal)
    return item


def drop_construction(store, ordinal: int, pattern: str) -> None:
    arr = store.record(ordinal).setdefault("constructions", [])
    hits = [x for x in arr if x.get("pattern") == pattern]
    if not hits:
        return
    if len(hits) != 1:
        raise RuntimeError(f"CONSTRUCTION_DROP_NOT_UNIQUE o{ordinal:04d} {pattern}")
    arr.remove(hits[0])
    store.mark(ordinal)


def drop_collocation(store, ordinal: int, phrase: str) -> None:
    hits = []
    for sense in store.record(ordinal).get("senses", []):
        for item in list(sense.get("collocations", [])):
            if item.get("phrase") == phrase:
                hits.append((sense, item))
    if not hits:
        return
    if len(hits) != 1:
        raise RuntimeError(f"COLLOCATION_DROP_NOT_UNIQUE o{ordinal:04d} {phrase} hits={len(hits)}")
    sense, item = hits[0]
    sense["collocations"].remove(item)
    cid = item.get("collocation_id")
    if cid in store.colls:
        store.colls[cid]["status"] = "deprecated"
        store.changed_collocation_ids.add(cid)
    store.mark(ordinal)


def replace_collocation(store, ordinal: int, old_phrase: str, new_phrase: str, *, sid: str, meaning_cn: str,
                        exam: str = "fixed_pattern") -> None:
    drop_collocation(store, ordinal, old_phrase)
    store.add_colloc(ordinal, sid, new_phrase, meaning_cn, exam)


def update_collocation_meaning(store, ordinal: int, phrase: str, meaning_cn: str) -> None:
    hits=[]
    for sense in store.record(ordinal).get("senses", []):
        for item in sense.get("collocations", []):
            if item.get("phrase") == phrase:
                hits.append(item)
    if len(hits) != 1:
        raise RuntimeError(f"COLLOCATION_MEANING_NOT_UNIQUE o{ordinal:04d} {phrase} hits={len(hits)}")
    hits[0]["meaning_cn"] = meaning_cn
    store.mark(ordinal)


def rebuild_core_from_active(store, ordinal: int, *, include_levels: tuple[str, ...] = ("L1", "L2"),
                             cn: str | None = None, en: str | None = None) -> None:
    rec = store.record(ordinal)
    chosen = [x for x in rec.get("senses", []) if x.get("level") in include_levels]
    if not chosen:
        raise RuntimeError(f"CORE_REBUILD_EMPTY o{ordinal:04d}")
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in sorted(chosen, key=lambda x: x.get("sort_order", 999)):
        grouped[str(item.get("pos", "other"))].append(item)
    core = rec.setdefault("core_concept", {})
    core["core_clusters"] = [
        {
            "label_cn": "；".join(dict.fromkeys(x.get("definition_cn", "") for x in xs if x.get("definition_cn"))),
            "label_en": "; ".join(dict.fromkeys(x.get("definition_en", "") for x in xs if x.get("definition_en"))),
            "pos": pos,
            "sense_ids": [x["sense_id"] for x in xs],
        }
        for pos, xs in grouped.items()
    ]
    if cn is None:
        cn = "；".join(dict.fromkeys(x.get("definition_cn", "") for x in chosen if x.get("definition_cn")))
    if en is None:
        en = "; ".join(dict.fromkeys(x.get("definition_en", "") for x in chosen if x.get("definition_en")))
    core["core_meaning_cn"] = cn
    core["mental_model_cn"] = cn
    core["core_meaning_en"] = en
    store.mark(ordinal)


def _relation_views(store, ordinal: int):
    rec = store.record(ordinal)
    for field in ("semantic_neighbors", "confusables"):
        for idx, payload in enumerate(rec.get(field, []) or []):
            if isinstance(payload, dict):
                yield field, idx, payload


def relation_id(payload: dict[str, Any]) -> str | None:
    rid = payload.get("relation_id") or payload.get("fact_id")
    return rid if isinstance(rid, str) and rid else None


def find_relation_view(store, ordinal: int, *, target_word: str | None = None, rid: str | None = None):
    hits=[]
    for field, idx, payload in _relation_views(store, ordinal):
        if rid is not None and relation_id(payload) != rid:
            continue
        if target_word is not None and payload.get("target_word") != target_word:
            continue
        hits.append((field, idx, payload))
    if len(hits) != 1:
        raise RuntimeError(f"RELATION_VIEW_NOT_UNIQUE o{ordinal:04d} target={target_word} rid={rid} hits={len(hits)}")
    return hits[0]


def ensure_reciprocal_existing_relation(store, source_ordinal: int, target_ordinal: int, *,
                                        target_word: str | None = None, rid: str | None = None,
                                        source_sid: str | None = None, target_sid: str | None = None) -> str:
    source_word = store.record(source_ordinal)["word"]
    target_word = target_word or store.record(target_ordinal)["word"]
    field, _, payload = find_relation_view(store, source_ordinal, target_word=target_word, rid=rid)
    rid0 = relation_id(payload)
    if rid0 is None:
        raise RuntimeError(f"RELATION_ID_MISSING o{source_ordinal:04d}->{target_word}")
    if rid is not None and rid0 != rid:
        raise RuntimeError(f"RELATION_ID_DRIFT {rid0}!={rid}")
    target_arr = store.record(target_ordinal).setdefault(field, [])
    existing = [x for x in target_arr if isinstance(x, dict) and relation_id(x) == rid0]
    if len(existing) > 1:
        raise RuntimeError(f"RECIPROCAL_RELATION_DUPLICATE o{target_ordinal:04d} {rid0}")
    if existing:
        item = existing[0]
    else:
        item = copy.deepcopy(payload)
        if "source_expression" in item or "target_expression" in item:
            old_src = item.get("source_expression", source_word)
            old_tgt = item.get("target_expression", target_word)
            item["source_expression"] = old_tgt
            item["target_expression"] = old_src
        item["target_word"] = source_word
        old_source_sid = item.get("source_sense_id")
        old_target_sid = item.get("target_sense_id")
        if old_source_sid is not None or old_target_sid is not None:
            item["source_sense_id"] = target_sid or old_target_sid
            item["target_sense_id"] = source_sid or old_source_sid
        target_arr.append(item)
    if source_sid is not None:
        payload["source_sense_id"] = source_sid
        item["target_sense_id"] = source_sid
    if target_sid is not None:
        payload["target_sense_id"] = target_sid
        item["source_sense_id"] = target_sid
    store.mark(source_ordinal)
    store.mark(target_ordinal)
    return rid0


def ensure_target_relation_view(store, target_ordinal: int, source_ordinal: int, *, rid: str,
                                source_sid: str | None = None, target_sid: str | None = None) -> str:
    """Mirror an existing relation from source even when the target is the active audit owner."""
    return ensure_reciprocal_existing_relation(store, source_ordinal, target_ordinal, rid=rid,
                                               source_sid=source_sid, target_sid=target_sid)


def attach_new_reciprocal_relation(store, a_ordinal: int, b_ordinal: int, *, relation_type: str,
                                   field: str, a_sid: str | None, b_sid: str | None,
                                   boundary: str, priority: str = "A", regional_a: str | None = None,
                                   regional_b: str | None = None) -> str:
    a = store.record(a_ordinal); b = store.record(b_ordinal)
    key = {"relation_type": relation_type, "words": sorted([a["word"], b["word"]]), "a_sid": a_sid, "b_sid": b_sid}
    prefix = "confusable:horizontal" if relation_type == "confusable" else "relation:horizontal"
    rid = f"{prefix}:{hashlib.sha256(stable(key).encode('utf-8')).hexdigest()[:20]}"
    def payload(src, tgt, src_sid, tgt_sid, regional):
        p = {
            "relation_id": rid,
            "relation_type": relation_type,
            "relation_scope": "sense" if src_sid or tgt_sid else "lexeme",
            "direction": "C",
            "priority": priority,
            "publication_status": "codex_reviewed",
            "verification_status": "verified",
            "writing_safe": True,
            "target_word": tgt["word"],
            "boundary": boundary,
            "boundaries": [boundary],
            "learning_note": boundary,
            "task_tags": ["reading", "writing"],
        }
        if src_sid is not None: p["source_sense_id"] = src_sid
        if tgt_sid is not None: p["target_sense_id"] = tgt_sid
        if regional is not None: p["regional_label"] = regional
        return p
    for src_o, tgt_o, src, tgt, src_sid0, tgt_sid0, regional in (
        (a_ordinal,b_ordinal,a,b,a_sid,b_sid,regional_a),
        (b_ordinal,a_ordinal,b,a,b_sid,a_sid,regional_b),
    ):
        arr=store.record(src_o).setdefault(field,[])
        same=[x for x in arr if isinstance(x,dict) and relation_id(x)==rid]
        if not same:
            arr.append(payload(src,tgt,src_sid0,tgt_sid0,regional))
        elif len(same)>1:
            raise RuntimeError(f"NEW_RELATION_DUPLICATE o{src_o:04d} {rid}")
        store.mark(src_o)
    return rid


def attach_target_expression_relation(store, ordinal: int, *, field: str, relation_type: str,
                                      target_expression: str, boundary: str, source_sid: str | None = None) -> str:
    rec=store.record(ordinal)
    key={"relation_type":relation_type,"source":rec["word"],"target_expression":target_expression,"source_sid":source_sid}
    rid=f"relation:horizontal:{hashlib.sha256(stable(key).encode('utf-8')).hexdigest()[:20]}"
    arr=rec.setdefault(field,[])
    hits=[x for x in arr if isinstance(x,dict) and relation_id(x)==rid]
    if not hits:
        p={
            "relation_id":rid,"relation_type":relation_type,"relation_scope":"sense" if source_sid else "lexeme",
            "direction":"C","priority":"A","publication_status":"codex_reviewed","verification_status":"verified",
            "writing_safe":True,"source_expression":rec["word"],"target_expression":target_expression,
            "target_word":target_expression,"boundary":boundary,"boundaries":[boundary],"learning_note":boundary,
            "task_tags":["reading","writing"],
        }
        if source_sid: p["source_sense_id"]=source_sid
        arr.append(p)
    elif len(hits)>1:
        raise RuntimeError(f"TARGET_EXPRESSION_RELATION_DUPLICATE o{ordinal:04d} {rid}")
    store.mark(ordinal)
    return rid


def remove_relation_view(store, ordinal: int, rid: str) -> None:
    found=0
    for field in ("semantic_neighbors","confusables"):
        arr=store.record(ordinal).setdefault(field,[])
        keep=[]
        for item in arr:
            if isinstance(item,dict) and relation_id(item)==rid:
                found += 1
            else:
                keep.append(item)
        store.record(ordinal)[field]=keep
    if found > 1:
        raise RuntimeError(f"RELATION_REMOVE_DUPLICATE o{ordinal:04d} {rid} count={found}")
    if found:
        store.mark(ordinal)


def update_fact_anchor(fact_id: str, *, source_sid: str | None = None, target_sid: str | None = None) -> Path:
    hits=[]
    for path in sorted(FACT_SHARDS.glob("*.json")):
        rows=load(path)
        for row in rows:
            rec=row.get("record",{})
            if rec.get("fact_id")==fact_id:
                hits.append((path,rows,rec))
    if len(hits)!=1:
        raise RuntimeError(f"FACT_ID_NOT_UNIQUE {fact_id} hits={len(hits)}")
    path,rows,rec=hits[0]
    if source_sid is not None:
        rec["source_sense_id"]=source_sid
        if isinstance(rec.get("content"),dict): rec["content"]["source_sense_id"]=source_sid
        if isinstance(rec.get("semantic_stage_a"),dict): rec["semantic_stage_a"]["source_sense_id"]=source_sid
    if target_sid is not None:
        rec["target_sense_id"]=target_sid
        if isinstance(rec.get("content"),dict): rec["content"]["target_sense_id"]=target_sid
        if isinstance(rec.get("semantic_stage_a"),dict): rec["semantic_stage_a"]["target_sense_id"]=target_sid
    dump(path,rows,compact=True)
    return path
