#!/usr/bin/env python3
from __future__ import annotations
import argparse,json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORDS=ROOT/"content"/"lexical"/"words"/"by-ordinal"

def load(p): return json.loads(p.read_text(encoding="utf-8"))
def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(",",":"))

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--output",type=Path,required=True); args=ap.parse_args()
    exact=[]; enriched=[]; malformed=[]
    ignore={"fact_id","verification_status","publication_status","priority","codex_reviewed","evidence","dimensions","direction","module","task_tags","writing_safe","family_sources","level","presentation_merge"}
    for p in sorted(WORDS.glob("o*.json")):
        o=load(p); rec=o.get("record") or {}
        active={str(s.get("sense_id")):s for s in rec.get("senses") or [] if isinstance(s,dict) and s.get("sense_id")}
        for idx,sec in enumerate(rec.get("secondary_senses") or []):
            if not isinstance(sec,dict):
                malformed.append({"ordinal":o.get("ordinal"),"word":o.get("word"),"index":idx,"reason":"not_object"}); continue
            sid=str(sec.get("source_sense_id") or "")
            if sid not in active: continue
            act=active[sid]
            # Compare learner semantic fields that could materially add information.
            sec_sem={
                "definition_cn":sec.get("definition_cn") or sec.get("meaning_cn"),
                "definition_en":sec.get("definition_en"),
                "boundary":sec.get("boundary"),
                "pattern":sec.get("pattern"),
                "pos":sec.get("pos"),
                "shared_definition":sec.get("shared_definition"),
            }
            act_sem={
                "definition_cn":act.get("definition_cn"),
                "definition_en":act.get("definition_en"),
                "boundary":act.get("boundary"),
                "pattern":act.get("governing_pattern"),
                "pos":act.get("pos"),
                "shared_definition":act.get("shared_definition"),
            }
            unique={k:v for k,v in sec_sem.items() if v not in (None,"") and v != act_sem.get(k)}
            row={"ordinal":o.get("ordinal"),"word":o.get("word"),"word_id":o.get("word_id"),"secondary_index":idx,"source_sense_id":sid,"secondary":sec_sem,"active":act_sem,"unique_semantics":unique}
            if unique: enriched.append(row)
            else: exact.append(row)
    report={"schema":"kianos.lexical.secondary_duplicate_audit.v1","counts":{"exact_duplicate":len(exact),"enriched_duplicate":len(enriched),"malformed":len(malformed)},"findings":{"exact_duplicate":exact,"enriched_duplicate":enriched,"malformed":malformed}}
    args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=="__main__": main()
