#!/usr/bin/env python3
"""Exact identity resolution wrapper for Issue #215 shard o4125-o4174.

This wrapper does not add semantic authority. It closes three execution-time
identity facts proven by the Current preflight:
- revive intransitive branch reuses sense:revive:f64dfa923a725450;
- ride vehicle/passenger branch reuses sense:ride:a4e9c621e46b5bf9;
- ring telephone-call noun has no stable registry branch, so the reconciled
  genuine-NEW rule is used before moving the existing `give a ring` carrier.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o4125_o4374 as pkg

_orig_exact_sid = pkg.exact_sid
_orig_apply_shard1 = pkg.apply_shard1


def exact_sid(store, word: str, **kwargs):
    pos = kwargs.get("pos")
    if word == "revive" and pos == "verb" and kwargs.get("any_terms"):
        sid = "sense:revive:f64dfa923a725450"
        if sid not in store.senses:
            raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
        return sid
    if word == "ride" and pos == "verb" and kwargs.get("any_terms"):
        sid = "sense:ride:a4e9c621e46b5bf9"
        if sid not in store.senses:
            raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
        return sid
    return _orig_exact_sid(store, word, **kwargs)


def apply_shard1(store):
    # Preflight proves no historical/stable telephone-call noun exists for ring.
    # This is therefore a genuine NEW_SEMANTIC_BRANCH, not a replacement ID.
    store.new(
        4172,
        "telephone_call_noun",
        "noun",
        "电话；一次电话通话",
        "a telephone call or the act of calling someone by telephone",
        level="L1",
    )
    _orig_apply_shard1(store)


pkg.exact_sid = exact_sid
pkg.apply_shard1 = apply_shard1

if __name__ == "__main__":
    pkg.run_shard1()
