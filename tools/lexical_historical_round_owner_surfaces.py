#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base

ORIGINAL_CONTRAST_TERMS = base.contrast_terms_compatible


def expand_ordinal_spec(spec: str) -> list[int]:
    out: list[int] = []
    for raw in spec.split(","):
        part = raw.strip()
        if not part:
            continue
        if "-" in part:
            a_raw, b_raw = part.split("-", 1)
            a, b = int(a_raw.strip()), int(b_raw.strip())
            if b < a:
                raise RuntimeError(f"invalid descending ordinal range: {part}")
            out.extend(range(a, b + 1))
        else:
            out.append(int(part))
    return list(dict.fromkeys(out))


def expansion_targets_from_body(body: str) -> list[str] | None:
    m_targets = re.search(r"### Expansion Gate[^\n]*\n(?:.*\n)*?Targets:\s*`([^`]+)`\.", body)
    if m_targets:
        return [w.strip().lower() for w in m_targets.group(1).split(",") if w.strip()]

    m_ordinals = re.search(r"Approved target ordinals:\s*\n`([^`]+)`\.", body, flags=re.S)
    if not m_ordinals:
        return None

    start, end = triage.parse_round_range(body)
    by_ord, _by_word, _by_id = triage.load_range_owners(start, end)
    words: list[str] = []
    for ordinal in expand_ordinal_spec(m_ordinals.group(1)):
        owner = by_ord.get(ordinal)
        if owner is None:
            raise RuntimeError(f"Expansion target ordinal has no Current owner: {ordinal}")
        word = triage.normalize(owner.get("word") or (owner.get("record") or {}).get("word") or "")
        if not word:
            raise RuntimeError(f"Expansion target owner missing word: {ordinal}")
        words.append(word)
    return words


def parse_owner_group_expansion(body: str):
    targets = expansion_targets_from_body(body)
    m_surfaces = re.search(
        r"(?:Mandatory high-value surfaces include|Named high-transfer learner surface/family groups compiled from the historical representative approvals include):\s*(.+?)(?:\n\nThese\s+\d+|\n\nEquivalent existing objects|\n\n### Contrast Gate)",
        body,
        flags=re.S,
    )
    if not targets or not m_surfaces:
        return None

    base.EXPANSION_OWNER_TARGETS = targets
    m_declared = re.search(r"(?:declared|Historical Expansion owner targets:)\s*`?(\d+)`?\s*(?:owner targets)?", body, flags=re.I)
    if not m_declared:
        m_declared = re.search(r"### Expansion Gate\s+—\s+(\d+)\s+target words", body, flags=re.I)
    base.EXPANSION_DECLARED_COUNT = int(m_declared.group(1)) if m_declared else None
    target_set = set(base.EXPANSION_OWNER_TARGETS)

    surface_blob = m_surfaces.group(1).strip()
    if surface_blob.startswith("`") and surface_blob.endswith("`."):
        surface_blob = surface_blob[1:-2]
    elif surface_blob.startswith("`") and surface_blob.endswith("`"):
        surface_blob = surface_blob[1:-1]

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
        elif norm.startswith("and the major stick"):
            hints = ["stick"] if "stick" in target_set else []

        if not hints:
            raise RuntimeError(f"cannot map named Expansion surface to owner target: {chunk}")

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
