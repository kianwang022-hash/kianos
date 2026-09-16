#!/usr/bin/env python3
"""Final Issue #295 verifier entrypoint.

The base verifier intentionally treats remote spelling owners as read-only.
Only naught/nought is frozen to require an already-existing reciprocal relation;
plow/plough and practice/practise require exact-spelling ownership and zero remote
writes, not a newly materialized shared relation.
"""
from __future__ import annotations
import lexical_verify_o6875_o7374 as verifier

verifier.REMOTE_BOUNDARIES=(
    (7134,2949,'maneuver','manoeuvre',False),
    (7182,6001,'naught','nought',True),
    (7278,3646,'plow','plough',False),
    (7289,3718,'practice','practise',False),
)

if __name__=='__main__':
    verifier.main()
