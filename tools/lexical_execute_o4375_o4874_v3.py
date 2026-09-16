#!/usr/bin/env python3
"""Identity-corrected entrypoint for Issue #234 continuous executor.

Fail-closed package runs can expose stale hand-copied sense literals in the
compiled execution manifest. Current registry readback is authoritative; this
shim maps only those stale literals to the exact Current stable IDs without
changing any semantic decision.
"""
from __future__ import annotations

import lexical_execute_o4375_o4874_v2 as engine

ID_CORRECTIONS = {
    "sense:shot:acd704248c86524a": "sense:shot:acd2373a0bfc58a8",  # photo / film shot
    "sense:shot:9618a82fe51a5316": "sense:shot:b97165d2aaf45c2e",  # a chance / attempt
    "sense:shot:374167abb00057ad": "sense:shot:f92163ae7d955e56",  # injection
    "sense:sunday:03fe45c19be95669": "sense:sunday:03feaf7d6e315e9e",  # ordinary day-name noun
    "sense:sunday:f0d30625eb6f58a6": "sense:sunday:f0d5d3e00e635c61",  # adjective
    "sense:sunday:688e3f77747d56a1": "sense:sunday:688ffa49f6575e8e",  # rare verb
    "sense:super:8c535b9a8b8f59e9": "sense:super:8c5304445a475618",  # informal adjective
    "sense:super:4c81d3644494556c": "sense:super:4c8184c9c2f85c40",  # informal intensifying adverb
}

_original_ensure_active = engine.ensure_active

def ensure_active(store, ordinal, sid, **kwargs):
    return _original_ensure_active(store, ordinal, ID_CORRECTIONS.get(sid, sid), **kwargs)

engine.ensure_active = ensure_active

if __name__ == "__main__":
    engine.main()
