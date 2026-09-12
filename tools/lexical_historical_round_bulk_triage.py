#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WORDS_DIR = ROOT / "content" / "lexical" / "words" / "by-ordinal"
RELATIONS_DIR = ROOT / "content" / "lexical" / "relations" / "by-id"

STOPWORDS = {
    "a","an","the","of","to","in","on","at","for","from","with","by","and","or","vs",
    "sth","sb","someone","something","one","ones","doing","do","did","done","be","is","are",
    "was","were","as","into","out","up","down","over","under","between","about","through",
    "toward","towards","your","their","his","her","its","this","that","these","those",
}

# Expansion matching needs to retain particles/prepositions because they are often
# the lexical value being audited (sort out, stem from, stand up to, etc.).
# Remove only grammatical filler/placeholders here; owner discovery still uses STOPWORDS.
SURFACE_FILLER = {
    "a","an","the","and","or","vs","sth","sb","someone","something","one","ones",
    "doing","do","did","done","be","is","are","was","were","your","their","his","her",
    "its","this","that","these","those",
}

def normalize(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).lower()
    s = (s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("…", "..."))
    s = re.sub(r"\b(sb|somebody|someone)\b", "sb", s)
    s = re.sub(r"\b(sth|something)\b", "sth", s)
    s = re.sub(r"\bone['’]?s\b", "one's", s)
    s = re.sub(r"[^a-z0-9+'/-]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def fetch_comment(repo: str, comment_id: int) -> dict[str, Any]:
    url = f"https://api.github.com/repos/{repo}/issues/comments/{comment_id}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "kianos-lexical-historical-round-triage",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def section_lines(body: str, heading_prefix: str, end_prefixes: tuple[str, ...]) -> list[str]:
    lines = body.splitlines()
    start = None
    for i, line in enumerate(lines):
        if line.strip().startswith(heading_prefix):
            start = i + 1
            break
    if start is None:
        raise RuntimeError(f"missing section heading: {heading_prefix}")
    out: list[str] = []
    for line in lines[start:]:
        stripped = line.strip()
        if any(stripped.startswith(p) for p in end_prefixes):
            break
        out.append(line)
    return out

def numbered_lines(lines: list[str]) -> list[str]:
    return [ln.strip() for ln in lines if re.match(r"^\s*\d+\.\s+", ln)]

def parse_round_range(body: str) -> tuple[int, int]:
    m = re.search(r"ordinals\s+(\d+)[–-](\d+)", body, flags=re.I)
    if not m:
        raise RuntimeError("cannot parse ordinal range")
    return int(m.group(1)), int(m.group(2))

def parse_core(body: str) -> list[dict[str, Any]]:
    lines = section_lines(body, "### Core Gate", ("All other ordinals", "### Expansion Gate"))
    rows: list[dict[str, Any]] = []
    rx = re.compile(r"^\s*(\d+)\.\s+`(\d+)\s+(word:[^`]+)`\s+—\s+(.+)$")
    for line in numbered_lines(lines):
        m = rx.match(line)
        if not m:
            raise RuntimeError(f"unparsed core line: {line}")
        rows.append({"index": int(m.group(1)), "ordinal": int(m.group(2)), "word_id": m.group(3), "approved_revision": m.group(4).strip()})
    return rows

def parse_simple_numbered_targets(body: str, heading_prefix: str, end_prefixes: tuple[str, ...], kind: str) -> list[dict[str, Any]]:
    lines = section_lines(body, heading_prefix, end_prefixes)
    rows: list[dict[str, Any]] = []
    rx = re.compile(r"^\s*(\d+)\.\s+(.+)$")
    for line in numbered_lines(lines):
        m = rx.match(line)
        if not m:
            raise RuntimeError(f"unparsed {kind} line: {line}")
        rows.append({"index": int(m.group(1)), "approved_target": m.group(2).strip()})
    return rows

def sense_status_map(owner: dict[str, Any]) -> dict[str, str]:
    out: dict[str, str] = {}
    for row in (owner.get("identity_refs") or {}).get("senses") or []:
        sid = row.get("sense_id")
        if sid:
            out[sid] = row.get("status") or "unknown"
    return out

def owner_health(owner: dict[str, Any]) -> dict[str, Any]:
    rec = owner.get("record") or {}
    status = sense_status_map(owner)
    active = rec.get("senses") or []
    stale: list[str] = []
    for cluster in ((rec.get("core_concept") or {}).get("core_clusters") or []):
        for sid in cluster.get("sense_ids") or []:
            if status.get(sid) != "active":
                stale.append(sid)
    dead: list[dict[str, str]] = []
    for cons in rec.get("constructions") or []:
        sid = cons.get("source_sense_id")
        if sid and status.get(sid) != "active":
            dead.append({
                "construction_id": cons.get("construction_id") or cons.get("fact_id") or "",
                "source_sense_id": sid,
                "source_sense_status": status.get(sid) or "missing",
            })
    flags: list[str] = []
    if len(active) == 0:
        flags.append("NO_ACTIVE_SENSE")
    if stale:
        flags.append(f"STALE_CORE:{len(set(stale))}")
    if dead:
        flags.append(f"DEAD_CONSTRUCTION_ANCHOR:{len(dead)}")
    return {"active_sense_count": len(active), "stale_core_sense_refs": sorted(set(stale)), "dangling_construction_anchors": dead, "health_flags": flags}

def compact_owner(owner: dict[str, Any] | None) -> dict[str, Any] | None:
    if owner is None:
        return None
    rec = owner.get("record") or {}
    return {
        "ordinal": owner.get("ordinal"),
        "word_id": owner.get("word_id") or rec.get("word_id"),
        "word": rec.get("word"),
        "core_concept": rec.get("core_concept") or {},
        "active_senses": [
            {
                "sense_id": s.get("sense_id"), "pos": s.get("pos"), "level": s.get("level"), "sort_order": s.get("sort_order"),
                "definition_cn": s.get("definition_cn"), "definition_en": s.get("definition_en"), "governing_pattern": s.get("governing_pattern"),
                "collocations": [{"phrase": c.get("phrase"), "meaning_cn": c.get("meaning_cn"), "exam_value": c.get("exam_value")} for c in s.get("collocations") or []],
            }
            for s in rec.get("senses") or []
        ],
        "reference_senses": [
            {"stable_sense_id": s.get("stable_sense_id"), "status": s.get("status"), "merged_into_sense_id": s.get("merged_into_sense_id"), "pos": s.get("pos"), "definition_cn": s.get("definition_cn"), "definition_en": s.get("definition_en")}
            for s in owner.get("reference_senses") or []
        ],
        "constructions": [
            {"construction_id": c.get("construction_id") or c.get("fact_id"), "pattern": c.get("pattern"), "boundary": c.get("boundary"), "meaning_cn": c.get("meaning_cn"), "definition_cn": c.get("definition_cn"), "source_sense_id": c.get("source_sense_id")}
            for c in rec.get("constructions") or []
        ],
        "semantic_neighbors": rec.get("semantic_neighbors") or [],
        "confusables": rec.get("confusables") or [],
        "health": owner_health(owner),
    }

def load_range_owners(start: int, end: int) -> tuple[dict[int, dict[str, Any]], dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_ord: dict[int, dict[str, Any]] = {}
    by_word: dict[str, dict[str, Any]] = {}
    by_id: dict[str, dict[str, Any]] = {}
    for ordinal in range(start, end + 1):
        path = WORDS_DIR / f"o{ordinal:04d}.json"
        if not path.is_file():
            raise RuntimeError(f"missing owner: {path.relative_to(ROOT)}")
        owner = load_json(path)
        rec = owner.get("record") or {}
        word = str(rec.get("word") or "").lower()
        wid = owner.get("word_id") or rec.get("word_id")
        by_ord[ordinal] = owner
        if word:
            by_word[word] = owner
        if wid:
            by_id[wid] = owner
    return by_ord, by_word, by_id

def collect_surfaces(owner: dict[str, Any]) -> list[dict[str, Any]]:
    rec = owner.get("record") or {}
    rows: list[dict[str, Any]] = []
    def add(kind: str, text: Any, *, visible: bool = True, object_id: str | None = None):
        if isinstance(text, str) and text.strip():
            rows.append({"kind": kind, "text": text, "normalized": normalize(text), "learner_visible": visible, "object_id": object_id})
    core = rec.get("core_concept") or {}
    for key in ("core_meaning_cn","core_meaning_en","mental_model_cn","mental_model_en"):
        add(key, core.get(key))
    for cluster in core.get("core_clusters") or []:
        add("core_cluster_label_cn", cluster.get("label_cn")); add("core_cluster_label_en", cluster.get("label_en"))
    for sense in rec.get("senses") or []:
        sid = sense.get("sense_id")
        for key in ("definition_cn","definition_en","sense_label_en","governing_pattern"):
            add(f"active_sense_{key}", sense.get(key), object_id=sid)
        for coll in sense.get("collocations") or []:
            cid = coll.get("collocation_id")
            add("collocation_phrase", coll.get("phrase"), object_id=cid); add("collocation_meaning_cn", coll.get("meaning_cn"), object_id=cid)
    for cons in rec.get("constructions") or []:
        cid = cons.get("construction_id") or cons.get("fact_id")
        for key in ("pattern","boundary","meaning_cn","definition_cn","definition_en"):
            add(f"construction_{key}", cons.get(key), object_id=cid)
    for field in ("secondary_senses","semantic_neighbors","confusables","word_family"):
        for obj in rec.get(field) or []:
            oid = obj.get("fact_id") or obj.get("relation_id")
            for key in ("boundary","meaning_cn","definition_cn","definition_en","pattern","target_word","label_en"):
                add(f"{field}_{key}", obj.get(key), object_id=oid)
    for ref in owner.get("reference_senses") or []:
        sid = ref.get("stable_sense_id")
        add("reference_definition_cn", ref.get("definition_cn"), visible=False, object_id=sid); add("reference_definition_en", ref.get("definition_en"), visible=False, object_id=sid)
    return rows

def target_code_text(text: str) -> str:
    codes = re.findall(r"`([^`]+)`", text)
    return " ; ".join(codes) if codes else text

def content_tokens(text: str) -> list[str]:
    n = normalize(target_code_text(text))
    raw = re.findall(r"[a-z][a-z0-9'-]*", n)
    return [token for token in raw if token not in STOPWORDS and len(token) > 1]

def surface_tokens(text: str) -> list[str]:
    n = normalize(target_code_text(text))
    raw = re.findall(r"[a-z][a-z0-9'-]*", n)
    return [token for token in raw if token not in SURFACE_FILLER and len(token) > 1]

def possible_forms(token: str) -> list[str]:
    forms = [token]
    if token.endswith("ies") and len(token) > 4: forms.append(token[:-3] + "y")
    if token.endswith("es") and len(token) > 4: forms.append(token[:-2])
    if token.endswith("s") and len(token) > 3: forms.append(token[:-1])
    if token.endswith("ing") and len(token) > 5: forms.extend([token[:-3], token[:-3] + "e"])
    if token.endswith("ed") and len(token) > 4: forms.extend([token[:-2], token[:-1]])
    return list(dict.fromkeys(forms))

def expansion_owner_candidates(target: str, by_word: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    tokens = content_tokens(target)
    hits: list[tuple[int, int, dict[str, Any]]] = []
    for pos, token in enumerate(tokens):
        for form in possible_forms(token):
            owner = by_word.get(form)
            if owner:
                hits.append((pos, -len(form), owner))
    seen: set[str] = set(); out: list[dict[str, Any]] = []
    for _, _, owner in sorted(hits, key=lambda x: (x[0], x[1])):
        wid = owner.get("word_id") or (owner.get("record") or {}).get("word_id")
        if not wid or wid in seen: continue
        seen.add(wid); out.append(owner)
        if len(out) >= 4: break
    return out

def expansion_match(target: str, owners: list[dict[str, Any]]) -> dict[str, Any]:
    discovery_tokens = content_tokens(target)
    target_tokens = surface_tokens(target)
    raw_norm = normalize(target_code_text(target))
    candidates: list[dict[str, Any]] = []
    best_score = 0
    exact = False

    for owner in owners:
        word = normalize((owner.get("record") or {}).get("word") or "")
        owner_forms = set(possible_forms(word)) if word else set()
        target_modifiers = [t for t in target_tokens if t not in owner_forms]

        for surface in collect_surfaces(owner):
            sn = surface["normalized"]
            if not sn:
                continue
            stokens = set(surface_tokens(sn))
            owner_hit = any(form in stokens for form in owner_forms)
            modifier_hits = {t for t in target_modifiers if t in stokens}
            score = (1 if owner_hit else 0) + len(modifier_hits)

            this_exact = bool(raw_norm and (raw_norm in sn or sn in raw_norm) and min(len(raw_norm), len(sn)) >= 5)
            if this_exact:
                exact = True
                score = max(score, len(set(target_tokens)) + 2)

            best_score = max(best_score, score)
            # Phrase-aware candidate rule: an owner surface plus at least one
            # meaningful target particle/content token is evidence worth Chat review.
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
                    "matched_target_modifiers": sorted(modifier_hits),
                })

    candidates = sorted(candidates, key=lambda r: (-r["score"], r["ordinal"] or 0, r["kind"], r["text"]))[:10]
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

def load_relations() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(RELATIONS_DIR.glob("*/*.json")):
        obj = load_json(path); fr = obj.get("fact_record") or {}
        source = (fr.get("word") or "").lower(); target = (fr.get("target_word") or ((fr.get("content") or {}).get("target_word")) or "").lower()
        if source and target:
            rows.append({"relation_id": obj.get("relation_id"), "source": source, "target": target, "boundary": fr.get("boundary"), "publication_status": fr.get("publication_status"), "presentation_status": fr.get("presentation_status"), "word_views": obj.get("word_views") or [], "path": str(path.relative_to(ROOT))})
    return rows

def contrast_terms(text: str) -> list[str]:
    codes = re.findall(r"`([^`]+)`", text)
    if not codes: return []
    expr = codes[0].strip()
    if "/" in expr:
        parts = [p.strip() for p in expr.split("/") if p.strip()]
        if len(parts) >= 2 and all(re.fullmatch(r"[A-Za-z][A-Za-z -]*", p) for p in parts):
            return [normalize(p) for p in parts]
    if " vs " in expr.lower():
        return [normalize(p) for p in re.split(r"\s+vs\s+", expr, flags=re.I) if p.strip()]
    return [normalize(expr)]

def contrast_readback(target: str, relations: list[dict[str, Any]], by_word: dict[str, dict[str, Any]]) -> dict[str, Any]:
    terms = [t for t in contrast_terms(target) if t]
    if len(terms) <= 1:
        owner = by_word.get(terms[0]) if terms else None
        return {"mechanical_label": "SELF_FORM_REVIEW", "terms": terms, "owner": compact_owner(owner), "relation_candidates": []}
    termset = set(terms); rels: list[dict[str, Any]] = []
    for rel in relations:
        if rel["source"] in termset and rel["target"] in termset:
            rels.append(rel)
    return {"mechanical_label": "RELATION_PRESENT_CANDIDATE" if rels else "RELATION_MISSING_CANDIDATE", "terms": terms, "relation_candidates": rels}

def validate_counts(core: list[Any], expansion: list[Any], contrast: list[Any], args: argparse.Namespace):
    if args.expected_core is not None and len(core) != args.expected_core: raise RuntimeError(f"Core count mismatch: {len(core)} != {args.expected_core}")
    if args.expected_expansion is not None and len(expansion) != args.expected_expansion: raise RuntimeError(f"Expansion count mismatch: {len(expansion)} != {args.expected_expansion}")
    if args.expected_contrast is not None and len(contrast) != args.expected_contrast: raise RuntimeError(f"Contrast count mismatch: {len(contrast)} != {args.expected_contrast}")

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--legacy-repo", required=True); p.add_argument("--comment-id", required=True, type=int); p.add_argument("--audit-id", required=True)
    p.add_argument("--expected-core", type=int); p.add_argument("--expected-expansion", type=int); p.add_argument("--expected-contrast", type=int)
    p.add_argument("--output", required=True); p.add_argument("--summary", required=True)
    args = p.parse_args()
    comment = fetch_comment(args.legacy_repo, args.comment_id); body = comment["body"]
    start, end = parse_round_range(body); by_ord, by_word, by_id = load_range_owners(start, end)
    core = parse_core(body)
    expansion = parse_simple_numbered_targets(body, "### Expansion Gate", ("### Contrast Gate", "### Existing"), "expansion")
    contrast = parse_simple_numbered_targets(body, "### Contrast Gate", ("### Existing", "### Apply", "Canonical Apply:"), "contrast")
    validate_counts(core, expansion, contrast, args)
    core_out = []
    for row in core:
        owner = by_ord.get(row["ordinal"])
        core_out.append({**row, "owner": compact_owner(owner)})
    expansion_out = []
    expansion_counts: dict[str, int] = {}
    for row in expansion:
        owners = expansion_owner_candidates(row["approved_target"], by_word)
        match = expansion_match(row["approved_target"], owners)
        expansion_counts[match["mechanical_label"]] = expansion_counts.get(match["mechanical_label"], 0) + 1
        expansion_out.append({**row, "owner_candidates": [{"ordinal": o.get("ordinal"), "word_id": o.get("word_id"), "word": (o.get("record") or {}).get("word"), "health_flags": owner_health(o)["health_flags"]} for o in owners], **match})
    relations = load_relations(); contrast_out = []; contrast_counts: dict[str, int] = {}
    for row in contrast:
        rb = contrast_readback(row["approved_target"], relations, by_word)
        contrast_counts[rb["mechanical_label"]] = contrast_counts.get(rb["mechanical_label"], 0) + 1
        contrast_out.append({**row, **rb})
    report = {
        "schema": "kianos.lexical.historical_round_bulk_triage.v1", "audit_id": args.audit_id,
        "semantic_authority": {"repo": args.legacy_repo, "issue": 113, "comment_id": args.comment_id, "url": comment.get("html_url")},
        "range": {"start_ordinal": start, "end_ordinal": end}, "counts": {"core": len(core), "expansion": len(expansion), "contrast": len(contrast)},
        "semantic_mutation_performed": 0, "learner_state_mutation_performed": 0, "mechanical_semantic_judgment_performed": False,
        "core": core_out, "expansion": expansion_out, "contrast": contrast_out,
        "expansion_label_counts": dict(sorted(expansion_counts.items())), "contrast_label_counts": dict(sorted(contrast_counts.items())),
        "interpretation_rule": "Mechanical labels identify candidate presence/absence only. Chat remains semantic authority and must review present/partial/self-form candidates before acceptance; no Natural Owner or learner-state mutation is performed by this triage.",
    }
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    health_counts: dict[str, int] = {}
    for row in core_out:
        flags = ((row.get("owner") or {}).get("health") or {}).get("health_flags") or []
        key = ",".join(flags) if flags else "HEALTH_OK"; health_counts[key] = health_counts.get(key, 0) + 1
    summary = [
        f"# Lexical Historical Round Bulk Triage — {args.audit_id}", "",
        f"- Range: **{start}–{end}**", f"- Core revisions: **{len(core)}**", f"- Expansion targets: **{len(expansion)}**", f"- Contrast targets: **{len(contrast)}**",
        "- Semantic mutation: **0** · Learner-state mutation: **0**", "- Mechanical labels are triage only; Chat owns semantic acceptance.", "",
        "## Core owner health", "",
    ]
    for k,v in sorted(health_counts.items()): summary.append(f"- `{k}`: **{v}**")
    summary += ["", "## Expansion mechanical labels", ""]
    for k,v in sorted(expansion_counts.items()): summary.append(f"- `{k}`: **{v}**")
    summary += ["", "## Contrast mechanical labels", ""]
    for k,v in sorted(contrast_counts.items()): summary.append(f"- `{k}`: **{v}**")
    summary += ["", "## Chat review queue", "", f"- Core: **{len(core)} compact owner projections** in one packet; prioritize owner-health warnings and operation/binding ambiguity.", "- Expansion: manually inspect only present/partial/reference candidates; concrete no-match targets remain strong missing candidates.", "- Contrast: manually inspect present/self-form candidates; relation-missing targets are mechanically explicit."]
    Path(args.summary).write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(json.dumps({"status":"PASS","audit_id":args.audit_id,"range":[start,end],"counts":report["counts"],"expansion_labels":report["expansion_label_counts"],"contrast_labels":report["contrast_label_counts"],"output":args.output,"summary":args.summary}, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
