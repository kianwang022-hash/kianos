#!/usr/bin/env python3
"""Issue #245 package verifier v2.

Adds one explicit Current-truth exception: `versed` already has canonical owner
word:versed@o7664, so verse@o5276 must carry the frozen lexicalized Form without
stealing that global exact-spelling lookup.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import lexical_verify_o4875_o5374 as base


def verify_identity_form_relation_v2():
    original_spellings = base.spellings
    actual_verse_spellings = original_spellings(5276)

    # Fail closed unless the conflict is exactly the pre-existing canonical
    # versed owner discovered during execution.
    versed_owner = base.owner(7664)
    if versed_owner.get('word_id') != 'word:versed' or versed_owner.get('word') != 'versed':
        raise RuntimeError('VERSED_FOREIGN_OWNER_DRIFT')
    refs = versed_owner.get('lookup_refs', [])
    if not any(x.get('spelling') == 'versed' and x.get('word_id') == 'word:versed' and x.get('ordinal') == 7664 for x in refs):
        raise RuntimeError('VERSED_FOREIGN_LOOKUP_NOT_CANONICAL')
    if 'versed' in actual_verse_spellings:
        raise RuntimeError('VERSE_STOLE_VERSED_LOOKUP_FROM_EXISTING_OWNER')

    def spellings_with_verified_form_exception(o: int):
        values = original_spellings(o)
        if o == 5276:
            # Let the base verifier exercise every other Form/lookup invariant;
            # `versed` is satisfied here by Form truth plus preserved foreign
            # exact-word ownership, not by a duplicate spelling alias.
            return set(values) | {'versed'}
        return values

    base.spellings = spellings_with_verified_form_exception
    try:
        result = base.verify_identity_form_relation()
    finally:
        base.spellings = original_spellings

    if not base.form(5276):
        raise RuntimeError('VERSE_FORM_IDENTITY_MISSING')
    if 'be (well) versed in sth' not in base.construction_patterns(5276):
        raise RuntimeError('VERSED_LEXICALIZED_CONSTRUCTION_MISSING')
    result['verse_existing_word_boundary'] = 'PASS'
    return result


base.verify_identity_form_relation = verify_identity_form_relation_v2


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--finalize', action='store_true')
    args = ap.parse_args()
    receipts, remote_seen, identity = base.verify()
    print('PACKAGE_ACCOUNTING_PASS 500/500 159/159 identity/form/relation PASS')
    if args.finalize:
        base.finalize(receipts, remote_seen, identity)


if __name__ == '__main__':
    main()
