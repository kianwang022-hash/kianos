#!/usr/bin/env python3
"""Issue #245 executor v4.

Keeps v3 projection-safe fact retirement and fixes reciprocal discoverability for
multi-member relation clusters without changing their canonical source payload.
"""
from __future__ import annotations

import copy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import lexical_execute_o4875_o5374_v3 as v3  # installs cluster/fact-retirement patches
import lexical_execute_o4875_o5374 as v1


def _cluster_mentions_target(payload: dict, target_word: str) -> bool:
    fields = (
        payload.get('target_word'),
        payload.get('target_expression'),
        payload.get('learning_note'),
        payload.get('relation_note'),
        payload.get('shared_meaning'),
        payload.get('boundary'),
        payload.get('boundaries'),
        payload.get('members'),
        payload.get('source_evidence_objects'),
        payload.get('relation_targets'),
    )
    haystack = ' '.join(str(x) for x in fields if x is not None).lower()
    return target_word.lower() in haystack


def close_existing_relation_v4(store, o, target_word, *, source_sid=None, target_sid=None, rid=None):
    """Close pairwise relations normally; mirror cluster payloads byte-semantically.

    A multi-member relation has one canonical source expression.  Reciprocal Word
    discoverability is represented by carrying the same relation payload on the
    target owner, not by rewriting source_expression/target_expression into a
    synthetic pairwise relation.
    """
    wm = v1.word_map(store)
    if target_word not in wm:
        raise RuntimeError(f'TARGET_WORD_NOT_FOUND {target_word}')
    t = wm[target_word]
    source_word = store.record(o)['word']

    pair_errors = []

    # Ordinary source -> target semantic/confusable relation.
    try:
        v1.rt.find_relation_view(store, o, target_word=target_word, rid=rid)
        return v1.rt.ensure_reciprocal_existing_relation(
            store, o, t, target_word=target_word, rid=rid,
            source_sid=source_sid, target_sid=target_sid,
        )
    except RuntimeError as e:
        pair_errors.append(e)

    # Ordinary relation may currently be stored only on the target owner.
    try:
        v1.rt.find_relation_view(store, t, target_word=source_word, rid=rid)
        return v1.rt.ensure_reciprocal_existing_relation(
            store, t, o, target_word=source_word, rid=rid,
            source_sid=target_sid, target_sid=source_sid,
        )
    except RuntimeError as e:
        pair_errors.append(e)

    # Word-family fallback.
    try:
        return v1.mirror_word_family(
            store, o, t, target_word,
            source_sid=source_sid, target_sid=target_sid, rid=rid,
        )
    except RuntimeError as e:
        pair_errors.append(e)

    # Multi-member horizontal cluster fallback.  Preserve its canonical payload
    # exactly; Natural Owner requires all views of one relation identity to agree
    # on the canonical source expression.
    if rid:
        try:
            field, _, payload = v1.rt.find_relation_view(store, o, rid=rid)
        except RuntimeError:
            payload = None
            field = None
        if payload is not None and _cluster_mentions_target(payload, target_word):
            arr = store.record(t).setdefault(field, [])
            existing = [x for x in arr if isinstance(x, dict) and v1.relation_id(x) == rid]
            if len(existing) > 1:
                raise RuntimeError(f'CLUSTER_RECIPROCAL_DUPLICATE o{t:04d} {rid}')
            if not existing:
                arr.append(copy.deepcopy(payload))
            # Deliberately do not rewrite source_expression, target_expression,
            # source/target sense ids, or target_word.  Those are relation-level
            # canonical semantics, not owner-view orientation fields.
            store.mark(o)
            store.mark(t)
            return rid

    raise pair_errors[-1] if pair_errors else RuntimeError(
        f'RELATION_NOT_FOUND o{o:04d} target={target_word} rid={rid}'
    )


v1.close_existing_relation = close_existing_relation_v4

if __name__ == '__main__':
    v1.main()
