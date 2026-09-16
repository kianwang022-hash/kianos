#!/usr/bin/env python3
"""Prepare one frozen Lexical execution package in a single read-only compile pass.

Semantic authority must already be frozen in a package reconciliation. This tool
turns Current owners + accepted Production/Audit/Reconciliation text into:
1) Current identity evidence, 2) compact identity index, 3) execution sheet,
4) fail-closed manifest candidates, and 5) unresolved-resolution sheet.
It never mutates lexical canonical owners and never decides new semantics.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
SID_RE = re.compile(r"sense:[a-z0-9_-]+:[0-9a-f]{16}")
BT_RE = re.compile(r"`([^`]+)`")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip())


def load_owner(ordinal: int) -> dict[str, Any]:
    path = OWNER_DIR / f"o{ordinal:04d}.json"
    if not path.exists():
        raise RuntimeError(f"OWNER_MISSING o{ordinal:04d}")
    return load(path)


def compact_owner(ordinal: int) -> dict[str, Any]:
    owner = load_owner(ordinal)
    rec = owner.get("record", {})
    return {
        "ordinal": ordinal,
        "word_id": owner.get("word_id"),
        "word": owner.get("word"),
        "core_concept": rec.get("core_concept"),
        "active_senses": rec.get("senses", []),
        "reference_senses": owner.get("reference_senses", []),
        "identity_refs": owner.get("identity_refs", {}),
        "relation_refs": owner.get("relation_refs", []),
        "form_identity": rec.get("form_identity"),
        "constructions": rec.get("constructions", []),
        "word_family": rec.get("word_family", []),
        "semantic_neighbors": rec.get("semantic_neighbors", []),
        "confusables": rec.get("confusables", []),
        "secondary_senses": rec.get("secondary_senses", []),
        "exam_paraphrases": rec.get("exam_paraphrases", []),
        "lookup_refs": owner.get("lookup_refs", []),
    }


def slim_sense(row: dict[str, Any]) -> dict[str, Any]:
    return {k: row.get(k) for k in (
        "sense_id", "stable_sense_id", "status", "merged_into_sense_id", "pos",
        "definition_en", "definition_cn", "level", "governing_pattern",
    ) if row.get(k) is not None}


def identity_row(owner: dict[str, Any]) -> dict[str, Any]:
    return {
        "ordinal": owner["ordinal"], "word": owner["word"], "word_id": owner["word_id"],
        "active": [slim_sense(x) for x in owner.get("active_senses", [])],
        "reference": [slim_sense(x) for x in owner.get("reference_senses", [])],
        "relations": owner.get("relation_refs", []), "form_identity": owner.get("form_identity"),
        "constructions": [{k: x.get(k) for k in ("fact_id","construction_id","pattern","source_sense_id","meaning_cn","definition_en")} for x in owner.get("constructions", [])],
        "semantic_neighbors": [{k: x.get(k) for k in ("fact_id","relation_id","target_word","source_sense_id","target_sense_id","boundary","boundaries")} for x in owner.get("semantic_neighbors", [])],
        "confusables": [{k: x.get(k) for k in ("fact_id","relation_id","target_word","source_sense_id","target_sense_id","boundary","boundaries")} for x in owner.get("confusables", [])],
        "word_family": owner.get("word_family", []),
        "lookup_spellings": [x.get("spelling") for x in owner.get("lookup_refs", []) if x.get("spelling")],
    }


def production_blocks(path: Path) -> dict[int, dict[str, Any]]:
    lines = path.read_text(encoding="utf-8").splitlines(); out = {}; i = 0
    while i < len(lines):
        m = re.match(r"^- o(\d{4}) \*\*(.+?)\*\*\s*$", lines[i])
        if not m:
            i += 1; continue
        ordinal = int(m.group(1)); word = m.group(2); buf = []; j = i + 1
        while j < len(lines):
            if re.match(r"^- o\d{4} \*\*", lines[j]) or lines[j].startswith("### Checkpoint") or lines[j].startswith("## "):
                break
            if lines[j].strip().startswith("- "): buf.append(clean(lines[j].strip()[2:]))
            j += 1
        out[ordinal] = {"word": word, "instructions": buf}; i = j
    return out


def heading_sections(text: str) -> dict[int, list[str]]:
    lines = text.splitlines(); out = {}; i = 0
    while i < len(lines):
        m = re.match(r"^###\s+.*?\bo(\d{4})\b.*$", lines[i])
        if not m:
            i += 1; continue
        ordinal = int(m.group(1)); buf = [lines[i]]; j = i + 1
        while j < len(lines) and not lines[j].startswith("### ") and not lines[j].startswith("## "):
            if lines[j].strip(): buf.append(lines[j])
            j += 1
        out.setdefault(ordinal, []).append(clean(" ".join(buf))); i = j
    return out


def owner_marker(line: str):
    return re.match(r"^\s*(?:-\s+(?:\*\*|`)?|\|\s*`?)o(\d{4})\b", line)


def bullet_owner_hits(text: str, ordinal: int) -> list[str]:
    lines = text.splitlines(); key = f"o{ordinal:04d}"; hits = []
    for i, line in enumerate(lines):
        if key not in line: continue
        marker = owner_marker(line)
        if not marker or int(marker.group(1)) != ordinal: continue
        ctx = [line]; j = i + 1
        while j < len(lines):
            if owner_marker(lines[j]) or lines[j].startswith("## ") or lines[j].startswith("### "): break
            if lines[j].startswith("  ") and lines[j].strip(): ctx.append(lines[j])
            elif lines[j].strip(): break
            j += 1
        value = clean(" ".join(ctx))
        if value and value not in hits: hits.append(value)
    return hits


def directive_hits(path: Path, ordinal: int) -> list[str]:
    text = path.read_text(encoding="utf-8")
    sections = heading_sections(text).get(ordinal, [])
    return sections[:2] if sections else bullet_owner_hits(text, ordinal)[:3]


def sense_line(row: dict[str, Any]) -> str:
    sid = row.get("sense_id") or row.get("stable_sense_id") or "?"
    return f"{sid} [{row.get('status','active')}|{row.get('pos','?')}] {clean(str(row.get('definition_en','')))}"


def execution_sheet(index: dict[str, Any], accounting: dict[str, Any], reconciliation: Path) -> str:
    byord = {x["ordinal"]: x for x in index["owners"]}; source_set = set(accounting["semantic_source_owners"])
    production = {}
    for rel in accounting["production_sources"]: production.update(production_blocks(ROOT / rel))
    audit_paths = [ROOT / x for x in accounting["audit_sources"]]
    out = [f"# o{accounting['package']['start']:04d}–o{accounting['package']['end']:04d} concise execution sheet", "", f"Source owners: {len(source_set)}", ""]
    for ordinal in sorted(source_set):
        row = byord[ordinal]; out.append(f"## o{ordinal:04d} — {row['word']}")
        pb = production.get(ordinal)
        out.append("PRODUCTION: " + (" | ".join(pb["instructions"]) if pb and pb["instructions"] else "NO_CHANGE in Production / Audit-authorized source"))
        ah = []
        for path in audit_paths: ah.extend(directive_hits(path, ordinal))
        seen = []
        for value in ah:
            if value not in seen: seen.append(value)
        out.append("AUDIT: " + (" || ".join(seen[:3]) if seen else "no additional audit refinement extracted"))
        rh = directive_hits(reconciliation, ordinal)
        if rh: out.append("RECONCILIATION: " + " || ".join(rh[:2]))
        out.append("ACTIVE: " + (" ; ".join(sense_line(x) for x in row.get("active", [])) or "(none)"))
        out.append("REFERENCE: " + (" ; ".join(sense_line(x) for x in row.get("reference", [])) or "(none)"))
        if row.get("form_identity"): out.append("FORM: " + clean(json.dumps(row["form_identity"], ensure_ascii=False)))
        if row.get("constructions"): out.append("CONSTRUCTIONS: " + " ; ".join(clean(json.dumps(x, ensure_ascii=False)) for x in row["constructions"]))
        if row.get("word_family"): out.append("WORD_FAMILY: " + clean(json.dumps(row["word_family"], ensure_ascii=False)))
        if row.get("semantic_neighbors") or row.get("confusables") or row.get("relations"):
            rel = {"refs":row.get("relations",[]),"semantic_neighbors":row.get("semantic_neighbors",[]),"confusables":row.get("confusables",[])}
            out.append("RELATIONS: " + clean(json.dumps(rel, ensure_ascii=False)))
        out.append("LOOKUP: " + ", ".join(row.get("lookup_spellings", []))); out.append("")
    return "\n".join(out) + "\n"


def sheet_blocks(text: str):
    parts = re.split(r"(?m)^## o(\d{4}) — (.+)$", text); out = {}
    for i in range(1, len(parts), 3):
        fields = {}
        for line in parts[i+2].splitlines():
            if ": " in line:
                key, value = line.split(": ", 1); fields[key] = value
        out[int(parts[i])] = (parts[i+1].strip(), fields)
    return out


def slim_identity(value: dict[str, Any], reference: bool = False) -> str:
    sid = value.get("stable_sense_id") if reference else value.get("sense_id")
    return f"{sid}[{value.get('pos','?')}:{clean(str(value.get('definition_en','')))}]"


def compile_candidates(sheet: str, index: dict[str, Any]):
    byord = {x["ordinal"]: x for x in index["owners"]}; rows = []; stats = Counter()
    for ordinal, (word, fields) in sorted(sheet_blocks(sheet).items()):
        directive = " | ".join(v for v in (fields.get("PRODUCTION",""), fields.get("AUDIT",""), fields.get("RECONCILIATION","")) if v)
        current = byord[ordinal]
        active = {x.get("sense_id"):x for x in current.get("active",[]) if x.get("sense_id")}
        reference = {x.get("stable_sense_id"):x for x in current.get("reference",[]) if x.get("stable_sense_id")}
        mentioned = []
        for sid in SID_RE.findall(directive):
            if sid not in mentioned: mentioned.append(sid)
        operations = []; low = directive.lower()
        for sid in mentioned:
            if sid in reference and any(k in low for k in ("reactivate","restore","unmerge","learner-main","co-main","secondary","preserve stable")):
                operations.append({"kind":"reactivate_exact","sense_id":sid,"identity_status":reference[sid].get("status"),"definition_en":reference[sid].get("definition_en")})
            elif sid in active:
                operations.append({"kind":"existing_sense_target","sense_id":sid,"definition_en":active[sid].get("definition_en")})
            else:
                operations.append({"kind":"mentioned_identity_needs_check","sense_id":sid})
        if any(k in low for k in ("re-anchor","reanchor","anchor construction","attachment")) and current.get("constructions"):
            operations.append({"kind":"construction_reanchor","current_constructions":current.get("constructions")})
        if any(k in low for k in ("pronunciation","form/","form behavior","form identity","spelling","plural","singular","capitaliz","lookup","heteronym","invariant","participle")):
            operations.append({"kind":"form_or_lookup","instruction":directive})
        if any(k in low for k in ("reciprocal","relation","confusable","contrast","word-family","word family")):
            operations.append({"kind":"relation","instruction":directive,"current_relation_refs":current.get("relations",[])})
        if any(k in low for k in ("definition","broaden","narrow","scope","repair","wording")):
            operations.append({"kind":"definition_or_scope","instruction":directive})
        pats = []
        for value in BT_RE.findall(directive):
            if value.startswith("sense:") or value.startswith("o") or value in {"UPGRADE","NO_CHANGE","FLIP_TO_UPGRADE","REFINE_UPGRADE","IDENTITY_RISK"}: continue
            if len(value)>2 and any(ch.isalpha() for ch in value) and value not in pats: pats.append(value)
        if pats: operations.append({"kind":"surface_patterns","patterns":pats[:16]})
        unresolved = []
        if any(k in low for k in ("add/reuse","add the common","add common","add modern","branch is absent","sense is absent","restore/add","missing branch","is absent","ordinary count","new sense","add ")) and not any(x["kind"]=="reactivate_exact" for x in operations): unresolved.append("sense_identity_resolution")
        if any(x["kind"]=="mentioned_identity_needs_check" for x in operations): unresolved.append("mentioned_identity_check")
        if any(x["kind"]=="construction_reanchor" for x in operations): unresolved.append("construction_target_anchor")
        if any(x["kind"]=="relation" for x in operations): unresolved.append("relation_mechanics_or_anchor")
        if any(x["kind"]=="definition_or_scope" for x in operations): unresolved.append("definition_target")
        if any(x["kind"]=="form_or_lookup" for x in operations): unresolved.append("form_payload")
        kinds = {x["kind"] for x in operations}; has_exact = any(x["kind"]=="reactivate_exact" for x in operations)
        ready = has_exact and not unresolved and kinds <= {"reactivate_exact","existing_sense_target","surface_patterns"}
        row = {"ordinal":ordinal,"word":word,"directive":directive,"operations":operations,"ready_for_exact_compile":ready,"unresolved_classes":sorted(set(unresolved)),"active_ids":sorted(active),"reference_ids":sorted(reference)}
        rows.append(row); stats["READY" if ready else "NEEDS_COMPILE"] += 1
        for item in set(unresolved): stats[item] += 1
    payload = {"schema":"kianos.lexical.manifest_candidates.v2","owner_count":len(rows),"stats":dict(sorted(stats.items())),"owners":rows}
    summary = ["# Manifest candidate summary","",f"Owners: {len(rows)}","","## Stats",""] + [f"- {k}: {v}" for k,v in sorted(stats.items())] + ["","## Unresolved owners",""]
    detail = ["# Unresolved resolution sheet",""]
    for row in rows:
        if row["ready_for_exact_compile"]: continue
        summary.append(f"- o{row['ordinal']:04d} {row['word']}: {', '.join(row['unresolved_classes']) or 'manual operation compile'}")
        cur = byord[row["ordinal"]]
        a = " ; ".join(slim_identity(x) for x in cur.get("active",[])) or "-"; r = " ; ".join(slim_identity(x,True) for x in cur.get("reference",[])) or "-"
        detail.append(f"o{row['ordinal']:04d} {row['word']} | CLASS={','.join(row['unresolved_classes']) or 'manual'} | ACTIVE={a} | REF={r} | DIRECTIVE={clean(row['directive'])}")
    return payload, "\n".join(summary)+"\n", "\n".join(detail)+"\n"


def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("--accounting",required=True); ap.add_argument("--reconciliation",required=True); ap.add_argument("--issue",type=int,required=True); ap.add_argument("--remote",type=int,action="append",default=[]); ap.add_argument("--out-prefix",required=True); args = ap.parse_args()
    accounting = load(ROOT / args.accounting); reconciliation = ROOT / args.reconciliation
    start = int(accounting["package"]["start"]); end = int(accounting["package"]["end"]); sources = [int(x) for x in accounting["semantic_source_owners"]]; remotes = [int(x) for x in args.remote]
    if len(sources) != int(accounting["semantic_source_owner_count"]) or len(sources) != len(set(sources)): raise RuntimeError("SOURCE_CONTRACT_DRIFT")
    if any(not(start<=x<=end) for x in sources): raise RuntimeError("SOURCE_OUTSIDE_PACKAGE")
    if len(remotes)!=len(set(remotes)) or any(start<=x<=end for x in remotes): raise RuntimeError("REMOTE_CONTRACT_INVALID")
    receipts = [[int(x["start"]),int(x["end"]),int(x["source_count"])] for x in accounting["receipt_counts"]]
    if sum(x[2] for x in receipts)!=len(sources): raise RuntimeError("RECEIPT_COUNT_DRIFT")
    compact = [compact_owner(x) for x in sources+remotes]
    preflight = {"schema":"kianos.lexical.execution_identity_preflight.v3","status":"READ_ONLY_CURRENT_EVIDENCE","issue":args.issue,"authority":args.reconciliation,"accounting":args.accounting,"package_range":[start,end],"source_owner_count":len(sources),"source_owners":sources,"remote_word_dependencies":remotes,"identity_owner_count":len(compact),"internal_receipt_counts":receipts,"owners":compact}
    index = {"schema":"kianos.lexical.execution_identity_index.v2","package":[start,end],"owner_count":len(compact),"owners":[identity_row(x) for x in compact]}
    sheet = execution_sheet(index, accounting, reconciliation); candidates, summary, unresolved = compile_candidates(sheet,index)
    prefix = ROOT / args.out_prefix
    dump(Path(str(prefix)+".current-identities.json"),preflight); dump(Path(str(prefix)+".identity-index.json"),index); Path(str(prefix)+".execution-sheet.md").write_text(sheet,encoding="utf-8"); dump(Path(str(prefix)+".manifest-candidates.json"),candidates); Path(str(prefix)+".manifest-summary.md").write_text(summary,encoding="utf-8"); Path(str(prefix)+".unresolved-resolution.md").write_text(unresolved,encoding="utf-8")
    print("PACKAGE_PREPARATION_PASS"); print("package",start,end); print("sources",len(sources),"remotes",len(remotes),"identities",len(compact)); print("manifest_stats",candidates["stats"])

if __name__ == "__main__": main()
