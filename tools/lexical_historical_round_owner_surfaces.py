#!/usr/bin/env python3
from __future__ import annotations

import re

import lexical_historical_round_bulk_triage as triage
import lexical_historical_round_from_file as base

ORIGINAL_PARSE_CORE = base.parse_core_compatible
ORIGINAL_CONTRAST_TERMS = base.contrast_terms_compatible
ORIGINAL_PARSE_SIMPLE = base.parse_simple_targets_compatible

# These are filler for phrase matching only. Deliberately retain structurally
# meaningful words such as that/do/done/doing and particles/prepositions.
PHRASE_FILLER = {
    "a", "an", "the", "and", "or", "vs", "sth", "sb", "someone", "something",
    "one", "ones", "be", "is", "are", "was", "were", "your", "their", "his",
    "her", "its", "this", "these", "those",
}


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


def parse_core_compatible(body: str):
    rows = ORIGINAL_PARSE_CORE(body)
    if rows:
        return rows
    m = re.search(r"Exact revision ordinals:\s*`([^`]+)`", body, flags=re.S)
    if not m:
        return rows
    ordinals = expand_ordinal_spec(m.group(1))
    start, end = triage.parse_round_range(body)
    by_ord, _by_word, _by_id = triage.load_range_owners(start, end)
    out = []
    for i, ordinal in enumerate(ordinals, 1):
        owner = by_ord.get(ordinal)
        if owner is None:
            raise RuntimeError(f"Core revision ordinal has no Current owner: {ordinal}")
        word_id = owner.get("word_id") or (owner.get("record") or {}).get("word_id")
        if not word_id:
            raise RuntimeError(f"Core revision owner missing word_id: {ordinal}")
        out.append({
            "index": i,
            "ordinal": ordinal,
            "word_id": word_id,
            "approved_revision": "historical approved revision; exact wording remains owned by the cited source comment",
        })
    return out


def expansion_targets_from_body(body: str) -> list[str] | None:
    m_targets = re.search(r"### Expansion Gate[^\n]*\n(?:.*\n)*?Targets:\s*`([^`]+)`\.", body)
    if m_targets:
        return [w.strip().lower() for w in m_targets.group(1).split(",") if w.strip()]

    m_ordinals = re.search(r"(?:Approved target ordinals|Exact target ordinal set|Exact\s+\d+\s+target ordinals):\s*\n?`([^`]+)`\.?", body, flags=re.S)
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
        r"(?:Mandatory high-value surfaces include|Named high-transfer learner surface/family groups compiled from the historical representative approvals include|Representative high-transfer surfaces include|Representative surfaces include)\s*:?\s*(.+?)(?:\n\nThese\s+\d+|\n\nEquivalent existing objects|\n\nReuse rather than duplicate|\n\n### Contrast Gate)",
        body,
        flags=re.S,
    )
    if not targets or not m_surfaces:
        return None

    base.EXPANSION_OWNER_TARGETS = targets
    m_declared = re.search(r"(?:declared|Historical Expansion owner targets:)\s*`?(\d+)`?\s*(?:owner targets)?", body, flags=re.I)
    if not m_declared:
        m_declared = re.search(r"### Expansion Gate\s+—\s+(\d+)\s+target words", body, flags=re.I)
    if not m_declared:
        m_declared = re.search(r"Exact\s+(\d+)\s+target ordinals", body, flags=re.I)
    base.EXPANSION_DECLARED_COUNT = int(m_declared.group(1)) if m_declared else None
    target_set = set(base.EXPANSION_OWNER_TARGETS)
    start, end = triage.parse_round_range(body)
    _by_ord, round_by_word, _by_id = triage.load_range_owners(start, end)

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

        special_owner_hints = {
            "set sail": ["sail", "set"],
            "and the major stick phrasal family": ["stick"],
            "noun/verb use pronunciation": ["use"],
        }
        if norm in special_owner_hints:
            hints = [w for w in special_owner_hints[norm] if w in round_by_word]
        elif "shipping/product-release" in norm:
            hints = ["ship"] if "ship" in round_by_word else []
        elif norm.startswith("select/elect"):
            hints = ["select"] if "select" in round_by_word else []

        if not hints:
            round_candidates: list[tuple[int, str]] = []
            for pos, token in enumerate(tokens):
                for form in triage.possible_forms(token):
                    if form in round_by_word:
                        round_candidates.append((pos, form))
            if round_candidates:
                first_pos = min(pos for pos, _ in round_candidates)
                hints = list(dict.fromkeys(word for pos, word in round_candidates if pos == first_pos))

        if not hints:
            raise RuntimeError(f"cannot map named Expansion surface to any Current owner in round: {chunk}")

        base.EXPANSION_OWNER_HINTS[chunk] = hints
        rows.append({"index": i, "approved_target": chunk, "kind": "expansion"})

    return rows


def parse_inline_contrast(body: str) -> list[dict] | None:
    m = re.search(
        r"### Contrast Gate[^\n]*\n(.+?)(?:\n\n### Existing|\n\n### Mechanical|\n\n### Apply|\n\nReuse rather than duplicate|\n\nCanonical Apply:)",
        body,
        flags=re.S,
    )
    if not m:
        return None
    blob = m.group(1).strip()
    if re.search(r"^\s*\d+\.\s+", blob, flags=re.M):
        return None
    codes = [c.strip() for c in re.findall(r"`([^`]+)`", blob) if c.strip()]
    if not codes:
        return None
    return [{"index": i, "approved_target": target} for i, target in enumerate(codes, 1)]


def parse_simple_targets_compatible(body: str, heading_prefix: str, end_prefixes: tuple[str, ...], kind: str):
    if kind == "expansion":
        grouped = parse_owner_group_expansion(body)
        if grouped is not None:
            return grouped
    rows = ORIGINAL_PARSE_SIMPLE(body, heading_prefix, end_prefixes, kind)
    if kind == "contrast" and not rows:
        inline = parse_inline_contrast(body)
        if inline is not None:
            return inline
    return rows


def phrase_tokens(text: str) -> list[str]:
    norm = triage.normalize(triage.target_code_text(text))
    raw = re.findall(r"[a-z][a-z0-9'-]*", norm)
    return [token for token in raw if token not in PHRASE_FILLER and (len(token) > 1 or token == "i")]


def raw_tokens(text: str) -> list[str]:
    norm = triage.normalize(triage.target_code_text(text))
    return re.findall(r"[a-z][a-z0-9'-]*", norm)


def token_forms(token: str) -> set[str]:
    return set(triage.possible_forms(token))


def expanded_forms(tokens: list[str]) -> set[str]:
    out: set[str] = set()
    for token in tokens:
        out.update(token_forms(token))
    return out


def expansion_match_compatible(target: str, owners: list[dict]):
    discovery_tokens = triage.content_tokens(target)
    target_tokens = phrase_tokens(target)
    raw_norm = triage.normalize(triage.target_code_text(target))
    candidates: list[dict] = []
    exact = False

    for owner in owners:
        word = triage.normalize((owner.get("record") or {}).get("word") or "")
        owner_forms = token_forms(word) if word else set()
        target_modifier_tokens = [t for t in target_tokens if not (token_forms(t) & owner_forms)]

        for surface in triage.collect_surfaces(owner):
            sn = surface["normalized"]
            if not sn:
                continue
            surface_raw_forms = expanded_forms(raw_tokens(sn))
            surface_forms = expanded_forms(phrase_tokens(sn))
            owner_hit = bool(owner_forms & surface_raw_forms)
            modifier_hits = [
                token for token in target_modifier_tokens
                if token_forms(token) & surface_forms
            ]
            modifier_hits = list(dict.fromkeys(modifier_hits))
            score = (1 if owner_hit else 0) + len(modifier_hits)

            this_exact = bool(raw_norm and (raw_norm in sn or sn in raw_norm) and min(len(raw_norm), len(sn)) >= 5)
            if this_exact:
                exact = True
                score = max(score, len(set(target_tokens)) + 2)

            if this_exact or (owner_hit and modifier_hits):
                candidates.append({
                    "word": word,
                    "ordinal": owner.get("ordinal"),
                    "word_id": owner.get("word_id"),
                    "kind": surface["kind"],
                    "object_id": surface.get("object_id"),
                    "text": surface["text"],
                    "learner_visible": surface["learner_visible"],
                    "score": score,
                    "matched_target_modifiers": modifier_hits,
                })

    candidates = sorted(
        candidates,
        key=lambda r: (-r["score"], r["ordinal"] or 0, r["kind"], r["text"]),
    )[:12]
    visible = [r for r in candidates if r["learner_visible"]]
    if exact and visible:
        label = "PRESENT_CANDIDATE"
    elif visible:
        label = "PARTIAL_OR_EQUIVALENT_CANDIDATE"
    elif candidates:
        label = "REFERENCE_ONLY_CANDIDATE"
    else:
        label = "NO_MATCH_CANDIDATE"
    return {
        "mechanical_label": label,
        "content_tokens": discovery_tokens,
        "surface_tokens": target_tokens,
        "candidate_surfaces": candidates,
    }


def contrast_terms_compatible(text: str) -> list[str]:
    norm = triage.normalize(text)
    if "pronunciation-identity" in norm or "heteronym" in norm or "contronym" in norm or "past of" in norm:
        m = re.match(r"\s*(?:regional\s+)?([A-Za-z][A-Za-z'-]*)", text)
        return [triage.normalize(m.group(1))] if m else []
    if norm.startswith("regional tire/tyre"):
        return ["tire"]
    if norm.startswith("noun use ") or (norm.startswith("use ") and "/ju" in text):
        return ["use"]
    if norm.startswith("intern noun"):
        return ["intern"]
    if norm.startswith("proper pacific"):
        return ["pacific"]
    if norm == "outskirt / outskirts":
        return ["outskirt"]
    if norm == "workout / work out":
        return ["workout"]
    if norm.startswith("converse stress"):
        return ["converse"]
    if norm.startswith("incense noun/verb stress"):
        return ["incense"]
    return ORIGINAL_CONTRAST_TERMS(text)


base.parse_core_compatible = parse_core_compatible
base.parse_owner_group_expansion = parse_owner_group_expansion
base.parse_simple_targets_compatible = parse_simple_targets_compatible
base.contrast_terms_compatible = contrast_terms_compatible
triage.expansion_match = expansion_match_compatible


if __name__ == "__main__":
    raise SystemExit(base.main())
