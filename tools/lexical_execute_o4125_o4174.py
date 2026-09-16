#!/usr/bin/env python3
"""Exact identity resolution wrapper for Issue #215 shard o4125-o4174.

No semantic authority is added here. Every pin below is already evidenced by the
Current preflight or frozen reconciliation. Ring's telephone-call noun is the
only genuine NEW branch in this boundary because Current has no stable registry
carrier for that ordinary noun use.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o4125_o4374 as pkg

_orig_exact_sid = pkg.exact_sid
_orig_apply_shard1 = pkg.apply_shard1

PINNED = {
    ("revive", "verb"): "sense:revive:f64dfa923a725450",
    ("revolve", "verb"): "sense:revolve:189623b930a85018",
    ("ride", "noun"): "sense:ride:6e09ffc232ca527c",
    ("ride", "verb"): "sense:ride:a4e9c621e46b5bf9",
    ("rifle", "noun"): "sense:rifle:92c8aeb8c77f5abb",
    ("rifle", "verb"): "sense:rifle:7b179fc2eab95e7c",
    ("riot", "noun"): "sense:riot:0932cf2c16955193",
    ("riot", "verb"): "sense:riot:96b1061053b95551",
}


def exact_sid(store, word: str, **kwargs):
    pos = kwargs.get("pos")
    key = (word, pos)
    # Only intercept semantic-fragment lookups. Exact legacy-alias calls remain
    # under the package executor's own strict resolution.
    if key in PINNED and kwargs.get("any_terms"):
        sid = PINNED[key]
        if sid not in store.senses:
            raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
        if store.senses[sid].get("headword") != word or store.senses[sid].get("pos") != pos:
            raise RuntimeError(f"PINNED_STABLE_ID_DRIFT {sid}")
        return sid
    if word == "revelation" and pos == "noun" and kwargs.get("any_terms"):
        sid = "sense:revelation:ce739cd1286d5125"
        if sid not in store.senses:
            raise RuntimeError(f"PINNED_STABLE_ID_MISSING {sid}")
        return sid
    return _orig_exact_sid(store, word, **kwargs)


def apply_shard1(store):
    # No pre-existing stable telephone-call noun exists for ring in Current.
    # This is an explicitly authorized genuine new semantic branch.
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
