#!/usr/bin/env python3
"""Issue #215 shard4 executor using the generic reciprocal-relation primitive.

This wrapper preserves the already-frozen shard4 semantics in
lexical_execute_o4275_o4324.py and replaces only the Relation plumbing that
failed readback in attempt #1.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import lexical_execute_o4275_o4324 as shard4
import lexical_natural_owner as natural_owner
from lexical_relation_primitives import (
    attach_reciprocal_spelling_variant,
    materialize_relation_owner,
)

_orig_apply = shard4.apply
_orig_build = shard4.build
_RID: str | None = None


def apply(store):
    global _RID
    _orig_apply(store)
    boundary = (
        "sceptical is a common British spelling; skeptical is standard American spelling. "
        "Both frozen Word owners are preserved with local stable senses."
    )
    _RID = attach_reciprocal_spelling_variant(
        store,
        left_ordinal=4281,
        left_word="sceptical",
        left_word_id="word:sceptical",
        left_region="BrE spelling",
        right_ordinal=6139,
        right_word="skeptical",
        right_word_id="word:skeptical",
        right_region="AmE spelling",
        boundary=boundary,
    )


def write_spelling_relation():
    if _RID is None:
        raise RuntimeError("RELATION_NOT_ATTACHED_BEFORE_FINALIZE")
    digest = shard4.hashlib.sha256(_RID.encode("utf-8")).hexdigest()
    path = shard4.REL_DIR / digest[:2] / f"{digest}.json"
    return _RID, path


def build():
    natural, relations, report = _orig_build()
    if report.get("status") == "PASS" and _RID is not None:
        materialize_relation_owner(
            relation_owners=relations,
            rid=_RID,
            root=ROOT,
            dump_json=natural_owner.dump_json,
        )
    return natural, relations, report


shard4.apply = apply
shard4.write_spelling_relation = write_spelling_relation
shard4.build = build

if __name__ == "__main__":
    shard4.main()
