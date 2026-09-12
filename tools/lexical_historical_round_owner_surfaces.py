#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base

ORIGINAL_CONTRAST_TERMS = base.contrast_terms_compatible


def parse_owner_group_expansion(body: str):
    m_targets = re.search(r"### Expansion Gate[^\n]*\n(?:.*\n)*?Targets:\s*`([^`]+)`\.", body)
    m_surfaces = re.search(r"Mandatory high-value surfaces include:\s*(.+?)\n\nEquivalent existing objects", body, flags=re.S)
    if not m_targets or not m_surfaces:
        return None

    base.EXPANSION_OWNER_TARGETS = [w.strip().lower() for w in m_targets.group(1).split(",") if w.strip()]
    m_declared = re.search(r"declared\s+(\d+)\s+owner targets", body, flags=re.I)
    base.EXPANSION_DECLARED_COUNT = int(m_declared.group(1)) if m_declared else None
    target_set = set(base.EXPANSION_OWNER_TARGETS)

    surface_blob = m_surfaces.group(1)
    if "Surface grouping: comma-or-semicolon." in body:
        chunks = [c.strip().rstrip(".") for c in re.split(r"[;,]", surface_blob) if c.strip()]
    else:
        chunks = [c.strip().rstrip(".") for c in surface_blob.split(";") if c.strip()]

    base.EXPANSION_OWNER_HINTS = {}
    rows = []
    for i, chunk in enumerate(chunks, 1):
        norm = triage.normalize(chunk.replace("`", ""))
        tokens = re.findall(r"[a-z][a-z'-]*", norm)
        candidates: list[tuple[int, str]] = []
        for pos, token in enumerate(tokens):
            token_forms = triage.possible_forms(token)
            if token.endswith("ing") and len(token) > 6 and token[-4] == token[-5]:
                token_forms.append(token[:-4])
            for form in token_forms:
                if form in target_set:
                    candidates.append((pos, form))

        hints: list[str] = []
        if candidates:
            first_pos = min(pos for pos, _ in candidates)
            hints = list(dict.fromkeys(word for pos, word in candidates if pos == first_pos))

        lead = norm.split()[0] if norm.split() else ""
        slash_parts = [p for p in lead.split("/") if p]
        slash_hits = [p for p in slash_parts if p in target_set]
        if len(slash_hits) >= 2:
            hints = slash_hits

        if norm == "set sail":
            hints = [w for w in ("sail", "set") if w in target_set]
        elif "shipping/product-release" in norm:
            hints = ["ship"] if "ship" in target_set else []
        elif norm.startswith("select/elect"):
            hints = ["select"] if "select" in target_set else []

        if not hints:
            raise RuntimeError(f"cannot map mandatory Expansion surface to owner target: {chunk}")

        base.EXPANSION_OWNER_HINTS[chunk] = hints
        rows.append({"index": i, "approved_target": chunk, "kind": "expansion"})

    return rows


def contrast_terms_compatible(text: str) -> list[str]:
    norm = triage.normalize(text)
    if "pronunciation-identity" in norm:
        first = triage.normalize(text.split("/", 1)[0])
        return [first] if first else []
    if "contronym" in norm:
        m = re.match(r"\s*([A-Za-z][A-Za-z'-]*)", text)
        return [triage.normalize(m.group(1))] if m else []
    if "past of" in norm:
        m = re.match(r"\s*([A-Za-z][A-Za-z'-]*)", text)
        return [triage.normalize(m.group(1))] if m else []
    return ORIGINAL_CONTRAST_TERMS(text)


base.parse_owner_group_expansion = parse_owner_group_expansion
base.contrast_terms_compatible = contrast_terms_compatible


if __name__ == "__main__":
    raise SystemExit(base.main())
