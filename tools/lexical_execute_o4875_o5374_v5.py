#!/usr/bin/env python3
"""Issue #245 executor v5.

Extends v4 with an explicit mechanical fallback for accepted reciprocal
relations whose Current state contains no reusable relation identity.  The
fallback mints one deterministic horizontal relation via package runtime; it is
only enabled for relation pairs already frozen by the #245 manifest authority.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import lexical_execute_o4875_o5374_v4 as v4
import lexical_execute_o4875_o5374 as v1


# (source ordinal, target word) -> (relation_type, field, boundary)
# These are implementation classes of already-accepted semantic relations, not
# new review judgments.  Existing relations are always preferred by v4.
NEW_ACCEPTED_RELATIONS = {
    (5035, 'tired'): (
        'word_family', 'word_family',
        "tire is the base verb/noun lexeme; tired is its adjectival/past-participle family member. Keep tyre only as the wheel-noun regional spelling boundary.",
    ),
    (5044, 'tow'): (
        'confusable', 'confusables',
        "toe and tow are distinct words: toe the line is the fixed expression meaning obey a rule; tow means pull a vehicle/object.",
    ),
    (5070, 'full'): (
        'semantic_equivalent', 'semantic_neighbors',
        "total and full overlap in completeness/whole-amount contexts but are not interchangeable in every construction.",
    ),
    (5074, 'tour'): (
        'word_family', 'word_family',
        "tourist is the person noun related to tour; preserve the distinct lexemes with reciprocal family visibility.",
    ),
    (5103, 'transaction'): (
        'confusable', 'confusables',
        "transition means a change from one state to another; transaction means an exchange, deal, or recorded business operation.",
    ),
    (5118, 'three'): (
        'confusable', 'confusables',
        "tree and three are distinct high-frequency words with similar learner-visible form/sound risk.",
    ),
    (5138, 'tropic'): (
        'word_family', 'word_family',
        "tropical is the adjective family member related to tropic; keep their lexical/category distinction visible.",
    ),
    (5181, 'disclose'): (
        'semantic_equivalent', 'semantic_neighbors',
        "uncover and disclose overlap in revealing previously hidden information, with different ordinary collocational ranges.",
    ),
    (5205, 'whole'): (
        'semantic_equivalent', 'semantic_neighbors',
        "unit and whole are related part/organization concepts; reciprocal visibility supports the accepted unit↔whole contrast without collapsing them.",
    ),
    (5206, 'join'): (
        'semantic_equivalent', 'semantic_neighbors',
        "unite and join overlap in bringing people or things together; preserve their different transitivity and collocational behavior.",
    ),
    (5207, 'integrity'): (
        'semantic_contrast', 'semantic_neighbors',
        "unity concerns being joined or in agreement; integrity concerns wholeness/intactness and, in another sense, moral honesty.",
    ),
}


def close_existing_relation_v5(store, o, target_word, *, source_sid=None, target_sid=None, rid=None):
    try:
        return v4.close_existing_relation_v4(
            store, o, target_word,
            source_sid=source_sid, target_sid=target_sid, rid=rid,
        )
    except RuntimeError:
        spec = NEW_ACCEPTED_RELATIONS.get((o, target_word))
        if spec is None or rid is not None:
            raise
        wm = v1.word_map(store)
        if target_word not in wm:
            raise RuntimeError(f'NEW_ACCEPTED_RELATION_TARGET_MISSING {target_word}')
        target_o = wm[target_word]
        relation_type, field, boundary = spec
        return v1.rt.attach_new_reciprocal_relation(
            store, o, target_o,
            relation_type=relation_type,
            field=field,
            a_sid=source_sid,
            b_sid=target_sid,
            boundary=boundary,
            priority='A',
        )


v1.close_existing_relation = close_existing_relation_v5

if __name__ == '__main__':
    v1.main()
