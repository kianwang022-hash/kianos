#!/usr/bin/env python3
"""Issue #245 executor v6.

The reconciliation requires same-owner lexicalized Form truth on verse@o5276 but
does not authorize replacing the pre-existing canonical word:versed@o7664.
Therefore the verse Form is materialized without stealing the global `versed`
spelling lookup from that independent existing owner.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import lexical_execute_o4875_o5374_v5 as v5  # installs all prior transport fixes
import lexical_execute_o4875_o5374 as v1
import lexical_manifest_o4875_o5374 as manifest

# Existing Current Truth: word:versed@o7664 already owns exact spelling `versed`.
# Keep verse@o5276's Form/lexicalized-participle semantics, but do not create a
# conflicting global spelling alias. This does not mutate o7664 or expand the
# frozen eight remote-write endpoints.
manifest.FORMS[5276]['aliases'] = []

if __name__ == '__main__':
    v1.main()
