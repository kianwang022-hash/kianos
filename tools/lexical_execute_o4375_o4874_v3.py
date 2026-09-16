#!/usr/bin/env python3
"""Identity-corrected entrypoint for Issue #234 continuous executor.

Fail-closed package runs can expose stale hand-copied sense literals in the
compiled execution manifest. Current registry readback is authoritative; this
shim maps only those stale literals to the exact Current stable IDs without
changing any semantic decision.

Corrections are applied both at the ensure_active boundary and to frozen manifest
constants before execution. The latter matters because some runtime operations
(such as usage/register updates) consume the manifest sense ID directly after
reactivation instead of routing the ID through ensure_active a second time.
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
    "sense:swan:22e46dc6c8db56cc": "sense:swan:22e7e5585ba45ebe",  # informal movement verb
}


def _remap_value(value):
    if isinstance(value, str):
        return ID_CORRECTIONS.get(value, value)
    if isinstance(value, tuple):
        return tuple(_remap_value(x) for x in value)
    if isinstance(value, list):
        return [_remap_value(x) for x in value]
    if isinstance(value, dict):
        return {_remap_value(k): _remap_value(v) for k, v in value.items()}
    return value


# Compile exact Current identities into every declarative manifest constant once,
# before the v2 executor reads any table. Only exact strings listed above change.
for _name in dir(engine.manifest):
    if _name.isupper():
        _value = getattr(engine.manifest, _name)
        if isinstance(_value, (tuple, list, dict)):
            setattr(engine.manifest, _name, _remap_value(_value))


_original_ensure_active = engine.ensure_active

def ensure_active(store, ordinal, sid, **kwargs):
    return _original_ensure_active(store, ordinal, ID_CORRECTIONS.get(sid, sid), **kwargs)

engine.ensure_active = ensure_active

if __name__ == "__main__":
    engine.main()
