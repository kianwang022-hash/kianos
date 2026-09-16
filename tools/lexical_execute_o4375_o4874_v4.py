#!/usr/bin/env python3
"""Sense-local level inference for Issue #234 continuous executor.

The prior parser used a broad text window, so a later phrase such as "verb/noun
stay lower" could incorrectly demote an earlier explicitly named learner-main
sense. Current frozen directives already contain the intended level cues; this
entrypoint chooses cues only from the sentence that contains each stable sense ID.
If that sentence does not explicitly rank the named sense, default to L2 so a
reactivated ordinary branch remains Core-eligible without being over-promoted.
"""
from __future__ import annotations

import re
import lexical_execute_o4375_o4874_v3 as previous

engine = previous.engine

_LEVEL_TERMS = {
    "L1": ("learner-main", "learner main", "co-main", "ordinary main", "main branch", " as main", " l1"),
    "L2": ("secondary", "bounded technical", "high-value", "learner-worthy", "useful", " l2"),
    "L3": ("reference-only", "reference only", "stays lower", "stay lower", "remains lower", "remain lower", "low/reference", "rare/old", " l3"),
}


def _sentence_window(text: str, pos: int) -> tuple[str, int]:
    """Return the directive sentence containing pos and the local position.

    Only hard sentence/newline boundaries are used. Semicolons are intentionally
    kept inside the window because frozen directives often rank sibling senses in
    one semicolon-delimited sentence.
    """
    starts = [text.rfind(". ", 0, pos), text.rfind("\n", 0, pos)]
    left = max(starts)
    left = 0 if left < 0 else left + (2 if text[left:left+2] == ". " else 1)
    candidates = [x for x in (text.find(". ", pos), text.find("\n", pos)) if x >= 0]
    right = min(candidates) if candidates else len(text)
    return text[left:right], pos - left


def infer_level(directive: str, sid: str) -> str:
    text = directive.lower()
    pos = text.find(sid.lower())
    if pos < 0:
        return "L2"
    local, sid_local = _sentence_window(text, pos)
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
