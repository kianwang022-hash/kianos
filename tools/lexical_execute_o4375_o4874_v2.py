#!/usr/bin/env python3
"""Continuous/resumable executor for Issue #234 / o4375-o4874.

The semantic authority is already frozen on main.  This executable interprets a
single declarative 500-owner manifest and exposes internal 50-owner checkpoints
only for receipt/rollback isolation.  The Chat-level work unit remains the whole
package.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "content" / "lexical"
OWNER_DIR = LEX / "words" / "by-ordinal"
RECEIPT_DIR = LEX / "execution" / "receipts"
CANDIDATES = LEX / "execution" / "preflight" / "o4375-o4874.manifest-candidates.json"
AUTHORITY = "content/lexical/semantic-reconciliation/o4375-o4874.md"
BASELINE = os.environ.get("KIANOS_BASELINE_MAIN", "unknown")
PACKAGE = (4375, 4874)

sys.path.insert(0, str(ROOT / "tools"))
import lexical_apply_o1625_o1874 as base
import lexical_execute_o4375_o4874 as contract
import lexical_manifest_o4375_o4874 as manifest
import lexical_package_runtime as rt
import lexical_natural_owner as natural_owner

SOURCE_SET = set(contract.SOURCE_OWNERS)
REMOTE_ALLOWED = set(contract.REMOTE_WORDS)
IN_PACKAGE_RELATION_DEPENDENCIES = {4532, 4545, 4559, 4680}
BESPOKE_ORDINALS = {4409, 4410, 4414, 4573, 4621, 4681, 4824, 4825}


def baseline_bytes(rel: str) -> bytes:
    if BASELINE == "unknown":
        raise RuntimeError("KIANOS_BASELINE_MAIN must be pinned")
    return subprocess.check_output(["git", "show", f"{BASELINE}:{rel}"])


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def checkpoint_source(index: int) -> tuple[int, int, tuple[int, ...]]:
    if not 0 <= index < len(contract.RECEIPT_COUNTS):
        raise RuntimeError(f"CHECKPOINT_OUT_OF_RANGE {index}")
    lo, hi, expected = contract.RECEIPT_COUNTS[index]
    owners = tuple(o for o in contract.SOURCE_OWNERS if lo <= o <= hi)
    if len(owners) != expected:
        raise RuntimeError(f"CHECKPOINT_SOURCE_COUNT_DRIFT index={index} expected={expected} actual={len(owners)}")
    return lo, hi, owners


def load_candidates() -> dict:
    obj = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    if obj.get("owner_count") != 161:
        raise RuntimeError("CANDIDATE_OWNER_COUNT_DRIFT")
    return obj


def manifest_manual_ordinals() -> set[int]:
    out=set()
    table_names=(
        "DEFINITION_UPDATES","USAGE_UPDATES","LEVEL_UPDATES","NEW_BRANCHES","CONSTRUCTIONS","COLLOCATION_REPLACEMENTS",
        "DEMOTIONS","TRANSITIVITY","TARGET_EXPRESSION_RELATIONS","RELATION_REANCHORS","CONSTRUCTION_OVERRIDES",
        "COLLOCATION_MEANINGS","SENSE_NOTES",
    )
    for name in table_names:
        for row in getattr(manifest,name):
            if name == "TARGET_EXPRESSION_RELATIONS": out.add(row[0])
            elif name == "RELATION_REANCHORS": out.add(row[0])
            else: out.add(row[0])
    out.update(manifest.FORMS)
    out.update(manifest.CORE_OVERRIDES)
    for row in manifest.EXISTING_RELATIONS:
        if row["source"] in SOURCE_SET: out.add(row["source"])
        if row["target"] in SOURCE_SET: out.add(row["target"])
    for row in manifest.NEW_RELATIONS:
        if row["a"] in SOURCE_SET: out.add(row["a"])
        if row["b"] in SOURCE_SET: out.add(row["b"])
    out.update(BESPOKE_ORDINALS)
    return out


def validate_manifest() -> dict:
    candidates=load_candidates()
    auto={row["ordinal"] for row in candidates["owners"] if row.get("ready_for_exact_compile")}
    manual=manifest_manual_ordinals()
    covered=auto | manual
    missing=sorted(SOURCE_SET-covered)
    foreign=sorted((covered-SOURCE_SET)-IN_PACKAGE_RELATION_DEPENDENCIES-REMOTE_ALLOWED)
    if missing:
        raise RuntimeError(f"MANIFEST_SOURCE_COVERAGE_MISSING {missing}")
    if foreign:
        raise RuntimeError(f"MANIFEST_FOREIGN_OWNER {foreign}")
    return {"auto_exact":len(auto),"manual_or_relation":len(manual & SOURCE_SET),"covered":len(SOURCE_SET),"missing":missing}


def active_sid(store, ordinal: int, sid: str) -> bool:
    return any(x.get("sense_id") == sid for x in store.record(ordinal).get("senses", []))


def ensure_active(store, ordinal: int, sid: str, *, level: str | None = None, pattern: str | None = None,
                  cn: str | None = None, en: str | None = None, branch: int | None = None):
    if sid not in store.senses:
        raise RuntimeError(f"PINNED_STABLE_ID_MISSING o{ordinal:04d} {sid}")
    if active_sid(store, ordinal, sid):
        current=next(x for x in store.record(ordinal)["senses"] if x.get("sense_id")==sid)
        level = level if level is not None else current.get("level")
        pattern = pattern if pattern is not None else current.get("governing_pattern")
    return store.put_existing(ordinal,sid,level=level,pattern=pattern,cn=cn,en=en,branch=branch)


def infer_level(directive: str, sid: str) -> str:
    i=directive.find(sid)
    window=(directive[max(0,i-220): i+len(sid)+220] if i>=0 else directive).lower()
    if any(k in window for k in ("reference-only","reference only","stays lower","stay lower","remains lower","remain lower","low/reference","rare/old","l3")):
        return "L3"
    if any(k in window for k in ("learner-main","co-main","learner main","ordinary main","main branch","l1")):
        return "L1"
    if any(k in window for k in ("secondary","bounded technical","l2")):
        return "L2"
    return "L2"


def apply_auto_exact(store, checkpoint_sources: set[int], semantic_touched: set[int]) -> None:
    for row in load_candidates()["owners"]:
        o=row["ordinal"]
        if o not in checkpoint_sources or not row.get("ready_for_exact_compile"):
            continue
        exact=[x for x in row.get("operations",[]) if x.get("kind")=="reactivate_exact"]
        if not exact:
            raise RuntimeError(f"AUTO_READY_WITHOUT_EXACT o{o:04d}")
        for op in exact:
            sid=op["sense_id"]
            ensure_active(store,o,sid,level=infer_level(row.get("directive",""),sid))
            semantic_touched.add(o)


def add_new_branch(store, row, semantic_touched: set[int], new_sids: dict[tuple[int,str],str]) -> None:
    o,branch,pos,cn,en,level,pattern=row
    sid=store.new(o,branch,pos,cn,en,level=level,pattern=pattern)
    if not active_sid(store,o,sid):
        ensure_active(store,o,sid,level=level,pattern=pattern)
    new_sids[(o,branch)]=sid
    semantic_touched.add(o)


def relation_driver(spec: dict) -> int:
    candidates=[o for o in (spec["source"],spec["target"]) if o in SOURCE_SET]
    if not candidates:
        raise RuntimeError(f"RELATION_WITHOUT_PACKAGE_SOURCE {spec}")
    return min(candidates)


def reciprocal_without_false_source_write(store, spec: dict, relation_ids: set[str]) -> str:
    src=spec["source"]; tgt=spec["target"]
    before=rt.stable(store.record(src))
    rid=rt.ensure_reciprocal_existing_relation(
        store,src,tgt,target_word=spec.get("target_word"),rid=spec.get("rid"),
        source_sid=spec.get("source_sid"),target_sid=spec.get("target_sid"),
    )
    if rt.stable(store.record(src)) == before:
        store.changed_word_ordinals.discard(src)
    relation_ids.add(rid)
    return rid


def apply_bespoke(store, current_sources: set[int], semantic_touched: set[int], relation_ids: set[str]) -> None:
    # o4409 shorthand: fixed high-transfer construction.
    if 4409 in current_sources:
        rt.upsert_construction(store,4409,"shorthand for sth","……的简称、简写或简便表达",source_sid="sense:shorthand:857892592780524c",level="L1")

    # o4410 shot: exact accepted independent noun identities plus three genuine familiar branches.
    if 4410 in current_sources:
        ensure_active(store,4410,"sense:shot:acd704248c86524a",level="L1")
        ensure_active(store,4410,"sense:shot:9618a82fe51a5316",level="L2")
        ensure_active(store,4410,"sense:shot:374167abb00057ad",level="L2")
        semantic_touched.add(4410)
        for row in [x for x in manifest.NEW_BRANCHES if x[0]==4410]:
            add_new_branch(store,row,semantic_touched,{})

    # o4414 shove frozen Sol decision: restore noun lineage, preserve verb survivor, keep redundant verb merged.
    if 4414 in current_sources:
        ensure_active(store,4414,"sense:shove:7bdb99d0b2485021",level="L1",branch=0)
        ensure_active(store,4414,"sense:shove:d07a38ec43995dc6",level="L2",branch=1)
        redundant=store.senses.get("sense:shove:649c009a1ca850b1")
        if not redundant or redundant.get("status")!="merged" or redundant.get("merged_into_sense_id")!="sense:shove:7bdb99d0b2485021":
            raise RuntimeError("SHOVE_REDUNDANT_VERB_LINEAGE_DRIFT")
        semantic_touched.add(4414)

    # o4573 sound: corrected learner collocation, keeping literal adjective carrier.
    if 4573 in current_sources:
        try:
            rt.update_collocation_meaning(store,4573,"a sound sleep","熟睡；安稳、深沉且不受打扰的睡眠")
        except RuntimeError:
            ensure_active(store,4573,"sense:sound:6f08f7aa091c56a3",level="L2")
            store.add_colloc(4573,"sense:sound:6f08f7aa091c56a3","a sound sleep","熟睡；安稳、深沉且不受打扰的睡眠","usage_example")
        semantic_touched.add(4573)

    # o4621 spiritual: replace dated learner collocation while retaining historical awareness only in note.
    if 4621 in current_sources:
        rt.replace_collocation(store,4621,"Negro spiritual","African American spiritual",sid="sense:spiritual:74c6bb80b558545f",meaning_cn="非裔美国人灵歌",exam="usage_example")
        rt.set_sense_usage(store,4621,"sense:spiritual:74c6bb80b558545f",note="Use 'spiritual' or 'African American spiritual' in contemporary neutral wording; the older expression 'Negro spiritual' is historical and dated.",register="historical term exists; contemporary neutral wording preferred",level="L3",writing_safe=True)

    # o4681 stationery: exact Sol survivor Relation + competing one-sided representation retirement.
    if 4681 in current_sources:
        spec={"source":4680,"target":4681,"target_word":"stationery","rid":"deep:confusables:stationary:6a9ec2e1412a28d3","source_sid":"sense:stationary:8ad4997d0a965b87","target_sid":"sense:stationery:52d6d1a820725f2e"}
        reciprocal_without_false_source_write(store,spec,relation_ids)
        rt.remove_relation_view(store,4681,"confusable:horizontal:f3d41acf605a4783344b")
        digest=hashlib.sha256("confusable:horizontal:f3d41acf605a4783344b".encode("utf-8")).hexdigest()
        stale=LEX/"relations"/"by-id"/digest[:2]/f"{digest}.json"
        if stale.exists(): stale.unlink()

    # o4824 support: exact evidence-verb anchor on existing support↔confirm Relation and fact registry.
    if 4824 in current_sources:
        field,_,payload=rt.find_relation_view(store,4824,target_word="confirm")
        rid=rt.relation_id(payload)
        if not rid: raise RuntimeError("SUPPORT_CONFIRM_RELATION_ID_MISSING")
        payload["source_sense_id"]="sense:support:3634d77028575765"
        store.mark(4824)
        if rid.startswith("deep:"):
            rt.update_fact_anchor(rid,source_sid="sense:support:3634d77028575765")
        relation_ids.add(rid)
        semantic_touched.add(4824)

    # o4825 suppose: exact hypothetical branch is an explicit audit source.
    if 4825 in current_sources:
        ensure_active(store,4825,"sense:suppose:96cc73303f245e81",level="L2")
        semantic_touched.add(4825)


def apply_checkpoint(index: int) -> dict:
    validate_manifest()
    lo,hi,source_tuple=checkpoint_source(index)
    current_sources=set(source_tuple)
    store=base.Store()
    semantic_touched:set[int]=set()
    relation_ids:set[str]=set()
    new_sids:dict[tuple[int,str],str]={}

    apply_auto_exact(store,current_sources,semantic_touched)

    # Exact definition updates; put_existing preserves stable identity and registry continuity.
    for o,sid,cn,en,level,pattern in manifest.DEFINITION_UPDATES:
        if o not in current_sources: continue
        ensure_active(store,o,sid,level=level,pattern=pattern,cn=cn,en=en)
        semantic_touched.add(o)

    # Explicit levels / reactivations.
    for o,sid,level in manifest.LEVEL_UPDATES:
        if o not in current_sources: continue
        ensure_active(store,o,sid,level=level)
        semantic_touched.add(o)

    # Usage/register safety.
    for o,sid,note,register,level,writing_safe in manifest.USAGE_UPDATES:
        if o not in current_sources: continue
        if not active_sid(store,o,sid): ensure_active(store,o,sid,level=level or "L2")
        rt.set_sense_usage(store,o,sid,note=note,register=register,level=level,writing_safe=writing_safe)
        if level is not None: semantic_touched.add(o)

    # Genuine new branches frozen by reconciliation/preflight.
    for row in manifest.NEW_BRANCHES:
        if row[0] in current_sources:
            add_new_branch(store,row,semantic_touched,new_sids)

    # Construction layer.
    for o,pattern,meaning,sid,level in manifest.CONSTRUCTIONS:
        if o not in current_sources: continue
        if sid is not None and not active_sid(store,o,sid): ensure_active(store,o,sid,level="L2")
        rt.upsert_construction(store,o,pattern,meaning,source_sid=sid,level=level)
    for o,pattern,meaning,sid,level,note in manifest.CONSTRUCTION_OVERRIDES:
        if o not in current_sources: continue
        if sid is not None and not active_sid(store,o,sid): ensure_active(store,o,sid,level="L2")
        rt.upsert_construction(store,o,pattern,meaning,source_sid=sid,level=level,note=note)

    # Malformed collocations and collocation meanings.
    for o,old,new,sid,meaning in manifest.COLLOCATION_REPLACEMENTS:
        if o not in current_sources: continue
        if not active_sid(store,o,sid): ensure_active(store,o,sid,level="L2")
        rt.replace_collocation(store,o,old,new,sid=sid,meaning_cn=meaning)
    for o,phrase,meaning in manifest.COLLOCATION_MEANINGS:
        if o not in current_sources: continue
        rt.update_collocation_meaning(store,o,phrase,meaning)

    # Demotion / transitivity.
    for o,sid in manifest.DEMOTIONS:
        if o not in current_sources: continue
        if active_sid(store,o,sid): store.demote(o,sid)
        semantic_touched.add(o)
    for o,sid,trans,pattern in manifest.TRANSITIVITY:
        if o not in current_sources: continue
        if not active_sid(store,o,sid): ensure_active(store,o,sid,level="L2")
        rt.set_transitivity(store,o,sid,transitivity=trans,pattern=pattern)
        semantic_touched.add(o)

    # Form + same-owner lookup aliases.
    for o,spec in manifest.FORMS.items():
        if o not in current_sources: continue
        rt.set_form_identity(store,o,AUTHORITY,spec["type"],copy.deepcopy(spec["boundaries"]))
        for alias in spec.get("aliases",[]): rt.add_lookup_alias(store,o,alias)

    # Sense/word notes not otherwise represented.
    for o,sid,note in manifest.SENSE_NOTES:
        if o not in current_sources: continue
        if sid is None:
            store.record(o)["usage_note"]=note; store.mark(o)
        else:
            if not active_sid(store,o,sid): ensure_active(store,o,sid,level="L2")
            rt.set_sense_usage(store,o,sid,note=note)

    # Existing reciprocal Relations.  Execute once at the earliest semantic source.
    for spec in manifest.EXISTING_RELATIONS:
        if relation_driver(spec) != min(current_sources, default=-1) and relation_driver(spec) not in current_sources:
            continue
        if relation_driver(spec) in current_sources:
            reciprocal_without_false_source_write(store,spec,relation_ids)

    # New approved pair Relations.
    for spec in manifest.NEW_RELATIONS:
        driver=min(o for o in (spec["a"],spec["b"]) if o in SOURCE_SET)
        if driver not in current_sources: continue
        rid=rt.attach_new_reciprocal_relation(store,spec["a"],spec["b"],relation_type=spec["relation_type"],field=spec["field"],
            a_sid=spec.get("a_sid"),b_sid=spec.get("b_sid"),boundary=spec["boundary"],regional_a=spec.get("regional_a"),regional_b=spec.get("regional_b"))
        relation_ids.add(rid)

    for o,field,rtype,target_expression,boundary,sid in manifest.TARGET_EXPRESSION_RELATIONS:
        if o not in current_sources: continue
        rid=rt.attach_target_expression_relation(store,o,field=field,relation_type=rtype,target_expression=target_expression,boundary=boundary,source_sid=sid)
        relation_ids.add(rid)

    # Relation source-anchor repair rows.
    for o,target_word,source_sid,target_sid in manifest.RELATION_REANCHORS:
        if o not in current_sources: continue
        field,_,payload=rt.find_relation_view(store,o,target_word=target_word)
        rid=rt.relation_id(payload)
        if not rid: raise RuntimeError(f"RELATION_REANCHOR_ID_MISSING o{o:04d}")
        payload["source_sense_id"]=source_sid
        if target_sid is not None: payload["target_sense_id"]=target_sid
        store.mark(o)
        if rid.startswith("deep:"): rt.update_fact_anchor(rid,source_sid=source_sid,target_sid=target_sid)
        relation_ids.add(rid)

    apply_bespoke(store,current_sources,semantic_touched,relation_ids)

    # Small direct learner-presentation repairs not requiring new identities.
    if 4617 in current_sources:
        semantic_touched.add(4617)
    if 4628 in current_sources:
        store.core(4628,cn="男发言人；中性泛称通常用 spokesperson",en="a male spokesperson; spokesperson is the neutral generic alternative")
    if 4793 in current_sources:
        store.record(4793)["writing_note"]="Recommendation pattern: suggest (that) ...; avoid *suggest sb to do sth."
        store.mark(4793)

    # Core↔active rebuild only when sense inventory/definition/ranking actually changed.
    for o in sorted(semantic_touched & current_sources):
        override=manifest.CORE_OVERRIDES.get(o)
        rt.rebuild_core_from_active(store,o,cn=override[0] if override else None,en=override[1] if override else None)

    # Fail closed if an authorized semantic source has neither a write nor an already-accepted
    # relation-side state in this checkpoint.  Relation pairs can legitimately leave the source
    # side byte-preserved when only the missing reciprocal target required materialization.
    relation_sources=set()
    for spec in manifest.EXISTING_RELATIONS:
        if spec["source"] in current_sources or spec["target"] in current_sources:
            relation_sources.update(o for o in (spec["source"],spec["target"]) if o in SOURCE_SET)
    for spec in manifest.NEW_RELATIONS:
        if spec["a"] in current_sources or spec["b"] in current_sources:
            relation_sources.update({spec["a"],spec["b"]} & SOURCE_SET)
    allowed_readback_only=relation_sources | {o for o,_,_,_,_,_ in manifest.TARGET_EXPRESSION_RELATIONS if o in current_sources}
    untouched=sorted(current_sources - set(store.changed_word_ordinals) - allowed_readback_only)
    if untouched:
        raise RuntimeError(f"CHECKPOINT_SOURCE_WITHOUT_MATERIALIZED_DELTA o{lo:04d}-o{hi:04d} {untouched}")

    store.finalize()
    natural,relations,report=natural_owner.build()
    if report.get("status")!="PASS":
        raise RuntimeError("NATURAL_OWNER_AUDIT_FAILED:"+json.dumps(report,ensure_ascii=False))
    changed_ordinals=set(store.changed_word_ordinals)
    for o in sorted(changed_ordinals):
        natural_owner.dump_json(OWNER_DIR/f"o{o:04d}.json",natural[o])
    # Materialize all relations referenced by changed owners and explicit relation operations.
    relation_ids2=set(relation_ids)
    for o in changed_ordinals:
        relation_ids2.update(x.get("relation_id") for x in natural[o].get("relation_refs",[]) if x.get("relation_id"))
    for rid in sorted(relation_ids2):
        if rid not in relations: continue
        natural_owner.dump_json(natural_owner.relation_owner_path(rid),relations[rid])

    # No-change guard for the current 50-owner interval.  Explicit dependency targets are excluded.
    excluded=set(source_tuple) | IN_PACKAGE_RELATION_DEPENDENCIES
    no_change=[o for o in range(lo,hi+1) if o not in excluded]
    bad=[]
    for o in no_change:
        rel=f"content/lexical/words/by-ordinal/o{o:04d}.json"
        if sha_bytes(baseline_bytes(rel)) != sha_bytes((ROOT/rel).read_bytes()): bad.append(o)
    if bad: raise RuntimeError(f"NO_CHANGE_BYTE_GUARD_FAILED {bad}")

    # Out-of-range Word writes must be the exact globally authorized set subset.
    out_of_range=sorted(o for o in changed_ordinals if not (PACKAGE[0] <= o <= PACKAGE[1]))
    unauthorized=sorted(set(out_of_range)-REMOTE_ALLOWED)
    if unauthorized: raise RuntimeError(f"UNAUTHORIZED_REMOTE_WORD_WRITE {unauthorized}")

    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    receipt={
      "schema":"kianos.lexical.forward_shard_receipt.v3",
      "status":"LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION",
      "authority":AUTHORITY,"issue":234,"package":list(PACKAGE),"shard":[lo,hi],
      "reviewed_owner_count":50,"semantic_source_ordinals":list(source_tuple),"semantic_source_count":len(source_tuple),
      "changed_source_ordinals":sorted(current_sources & changed_ordinals),
      "changed_word_ordinals":sorted(changed_ordinals),"out_of_range_dependency_ordinals":out_of_range,
      "new_semantic_branch_ids":sorted(set(store.new_stable_sense_ids)),
      "relation_ids_materialized":sorted(relation_ids2),
      "readback":{"all_50_owner_views":"PASS","semantic_sources":"PASS","no_change_byte_guard":"PASS","natural_owner_registry_audit":"PASS"},
    }
    out=RECEIPT_DIR/f"o{lo:04d}-o{hi:04d}.json"
    out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"CHECKPOINT_PASS {index+1}/10 o{lo:04d}-o{hi:04d} sources={len(source_tuple)} changed={len(changed_ordinals)} remote={out_of_range}")
    return receipt


def main() -> None:
    ap=argparse.ArgumentParser()
    ap.add_argument("--validate-manifest",action="store_true")
    ap.add_argument("--checkpoint",type=int)
    args=ap.parse_args()
    if args.validate_manifest:
        report=validate_manifest(); print("MANIFEST_COVERAGE_PASS",json.dumps(report,sort_keys=True)); return
    if args.checkpoint is None:
        raise SystemExit("pass --validate-manifest or --checkpoint 0..9")
    apply_checkpoint(args.checkpoint)

if __name__=="__main__":
    main()
