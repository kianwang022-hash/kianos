#!/usr/bin/env python3
"""Sense-local level inference for Issue #234 continuous executor.

The prior parser used a broad text window, so a later phrase such as "verb/noun
stay lower" could incorrectly demote an earlier explicitly named learner-main
sense.  Current frozen directives already contain the intended level cues; this
entrypoint chooses the nearest explicit cue to each stable sense ID.
"""
from __future__ import annotations

import re
import lexical_execute_o4375_o4874_v3 as previous

engine = previous.engine

_LEVEL_TERMS = {
    "L1": ("learner-main", "learner main", "co-main", "ordinary main", "main branch", " as main", " l1"),
    "L2": ("secondary", "bounded technical", " l2"),
    "L3": ("reference-only", "reference only", "stays lower", "stay lower", "remains lower", "remain lower", "low/reference", "rare/old", " l3"),
}

def infer_level(directive: str, sid: str) -> str:
    text = directive.lower()
    pos = text.find(sid.lower())
    if pos < 0:
        return "L2"
    # Keep the search local to the named identity and score explicit cues by
    # character distance.  This preserves the directive's own semantic ranking
    # without allowing a later sibling-sense clause to leak backwards.
    lo = max(0, pos - 140)
    hi = min(len(text), pos + len(sid) + 140)
    local = text[lo:hi]
    sid_local = pos - lo
    scored = []
    for level, terms in _LEVEL_TERMS.items():
        for term in terms:
            start = 0
            while True:
                j = local.find(term, start)
                if j < 0:
                    break
                center = j + len(term) / 2
                dist = abs(center - sid_local)
                scored.append((dist, level, term))
                start = j + 1
    if not scored:
        return "L2"
    scored.sort(key=lambda x: (x[0], {"L1":0,"L2":1,"L3":2}[x[1]]))
    return scored[0][1]

engine.infer_level = infer_level

if __name__ == "__main__":
    engine.main()
