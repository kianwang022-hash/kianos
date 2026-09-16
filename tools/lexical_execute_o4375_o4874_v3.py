#!/usr/bin/env python3
"""Identity-corrected entrypoint for Issue #234 continuous executor.

The first fail-closed run exposed stale hand-copied shot IDs.  Current registry
readback is authoritative; this shim maps only those three stale literals to the
exact Current stable IDs without changing any semantic decision.
"""
from __future__ import annotations

import lexical_execute_o4375_o4874_v2 as engine

ID_CORRECTIONS = {
    "sense:shot:acd704248c86524a": "sense:shot:acd2373a0bfc58a8",  # photo / film shot
    "sense:shot:9618a82fe51a5316": "sense:shot:b97165d2aaf45c2e",  # a chance / attempt
    "sense:shot:374167abb00057ad": "sense:shot:f92163ae7d955e56",  # injection
}

_original_ensure_active = engine.ensure_active

def ensure_active(store, ordinal, sid, **kwargs):
    return _original_ensure_active(store, ordinal, ID_CORRECTIONS.get(sid, sid), **kwargs)

engine.ensure_active = ensure_active

if __name__ == "__main__":
    engine.main()
