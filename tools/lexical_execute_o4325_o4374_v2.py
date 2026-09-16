#!/usr/bin/env python3
"""Issue #215 shard5 wrapper preserving registry split provenance in Natural Owner readback.

No semantic decision changes. The canonical sense registry already carries the
Sol-frozen shaft split provenance; this wrapper exposes that registry metadata
on the derived reference_sense view so the existing fail-closed readback and
package verifier can attest it.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import lexical_execute_o4325_o4374 as shard5

_orig_build = shard5.build
POLLUTED = "sense:shaft:8c68fc2e02025abd"


def build():
    natural, relations, report = _orig_build()
    if report.get("status") != "PASS":
        return natural, relations, report

    registry = shard5.base.Store()
    meta = registry.senses.get(POLLUTED)
    if not meta:
        raise RuntimeError("SHAFT_POLLUTED_REGISTRY_ROW_MISSING")
    children = meta.get("split_into_sense_ids", [])
    authority = meta.get("split_authority")
    if len(children) != 2 or authority != shard5.AUTHORITY:
        raise RuntimeError(
            f"SHAFT_REGISTRY_SPLIT_PROVENANCE_INVALID children={children} authority={authority}"
        )

    refs = natural[4372].get("reference_senses", [])
    target = next((x for x in refs if x.get("stable_sense_id") == POLLUTED), None)
    if not target or target.get("status") != "deprecated":
        raise RuntimeError("SHAFT_RETIRED_REFERENCE_NOT_FOUND")
    target["split_into_sense_ids"] = list(children)
    target["split_authority"] = authority
    return natural, relations, report


shard5.build = build

if __name__ == "__main__":
    shard5.main()
