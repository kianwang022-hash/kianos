#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path
from typing import Any

ROOT=Path(__file__).resolve().parents[1]
WORDS=ROOT/"content"/"lexical"/"words"/"by-ordinal"

def load(p:Path)->Any:
    return json.loads(p.read_text(encoding="utf-8"))

def dump(p:Path,v:Any)->None:
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--report",type=Path,required=True)
    args=ap.parse_args()

    changed=[]
    removed_total=0
    unresolved=0
    for path in sorted(WORDS.glob("o*.json")):
        owner=load(path)
        record=owner.get("record") or {}
        current_ids=set()
        for sense in [*(record.get("senses") or []),*(record.get("secondary_senses") or [])]:
            if not isinstance(sense,dict): continue
            for coll in sense.get("collocations") or []:
                if isinstance(coll,dict) and coll.get("collocation_id"):
                    current_ids.add(str(coll["collocation_id"]))

        constructions=record.get("constructions") or []
        keep=[]
        removed=[]
        for idx,con in enumerate(constructions):
            if not isinstance(con,dict):
                keep.append(con); continue
            pm=con.get("presentation_merge")
            survivor=str((pm or {}).get("surviving_object_id") or "")
            if survivor and survivor in current_ids:
                removed.append({
                    "index":idx,
                    "construction_id":con.get("construction_id") or con.get("fact_id"),
                    "surviving_object_id":survivor,
                    "pattern":con.get("pattern") or con.get("boundary") or con.get("label_en"),
                })
            else:
                keep.append(con)
                if survivor:
                    unresolved += 1

        if removed:
            record["constructions"]=keep
            owner["record"]=record
            provenance=owner.setdefault("provenance",{})
            provenance["semantic_delta"]=max(1,int(provenance.get("semantic_delta") or 0))
            dump(path,owner)
            removed_total += len(removed)
            changed.append({
                "ordinal":owner.get("ordinal"),
                "word":owner.get("word"),
                "word_id":owner.get("word_id"),
                "path":path.relative_to(ROOT).as_posix(),
                "removed":removed,
            })

    report={
        "schema":"kianos.lexical.materialized_merge_cleanup.v1",
        "changed_word_count":len(changed),
        "removed_construction_count":removed_total,
        "unresolved_presentation_merge_count":unresolved,
        "changed":changed,
    }
    args.report.parent.mkdir(parents=True,exist_ok=True)
    dump(args.report,report)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
