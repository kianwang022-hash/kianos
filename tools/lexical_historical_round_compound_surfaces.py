#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base
import lexical_historical_round_owner_surfaces as owner

ORIGINAL_PARSE_OWNER_GROUP_EXPANSION = owner.parse_owner_group_expansion


def parse_owner_group_expansion_with_compounds(body: str):
    rows = ORIGINAL_PARSE_OWNER_GROUP_EXPANSION(body)
    if not rows:
        return rows

    start, end = triage.parse_round_range(body)
    _by_ord, by_word, _by_id = triage.load_range_owners(start, end)

    for row in rows:
        target = row["approved_target"]
        if base.EXPANSION_OWNER_HINTS.get(target):
            continue

        norm = triage.normalize(target.replace("`", ""))
        compounds = re.findall(r"[a-z][a-z0-9']*(?:-[a-z0-9']+)+", norm)
        hits: list[str] = []
        for compound in compounds:
            for component in compound.split("-"):
                if not component:
                    continue
                for form in triage.possible_forms(component):
                    if form in by_word:
                        hits.append(form)

        if hits:
            base.EXPANSION_OWNER_HINTS[target] = list(dict.fromkeys(hits))
            row["owner_hint_status"] = "MAPPED_COMPOUND_COMPONENT"

    return rows


owner.parse_owner_group_expansion = parse_owner_group_expansion_with_compounds
base.parse_owner_group_expansion = parse_owner_group_expansion_with_compounds
base.parse_simple_targets_compatible = owner.parse_simple_targets_compatible
base.contrast_terms_compatible = owner.contrast_terms_compatible
triage.expansion_match = owner.expansion_match_compatible


if __name__ == "__main__":
    raise SystemExit(base.main())
