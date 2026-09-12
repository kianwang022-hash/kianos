#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base
import lexical_historical_round_owner_surfaces as owner

ORIGINAL_PARSE_OWNER_GROUP_EXPANSION = owner.parse_owner_group_expansion


def parse_owner_group_expansion_with_compounds(body: str):
    # Compact execution manifests may document how their surface list is
    # grouped immediately after the list. That transport note is metadata, not
    # part of the last learner surface. Normalize it away before the generic
    # parser reads the semantic target block.
    #
    # Preserve the grouping signal separately: comma-grouped rounds (for
    # example R28) must still tell the generic owner-surface parser to split on
    # commas after the metadata line itself has been removed from the captured
    # learner-surface blob.
    grouping_match = re.search(
        r"\n\n(Surface grouping:[^\n]*)\n(?=\n### Contrast Gate)",
        body,
        flags=re.I,
    )
    body_for_expansion = re.sub(
        r"\n\nSurface grouping:[^\n]*\n(?=\n### Contrast Gate)",
        "\n\n",
        body,
        flags=re.I,
    )
    if grouping_match and "comma-or-semicolon" in grouping_match.group(1).lower():
        body_for_expansion = "Surface grouping: comma-or-semicolon.\n" + body_for_expansion

    rows = ORIGINAL_PARSE_OWNER_GROUP_EXPANSION(body_for_expansion)
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
