#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORDS=ROOT/"content"/"lexical"/"words"/"by-ordinal"
COLL=ROOT/"content"/"lexical"/"canonical"/"collocations"/"shards"

def load(p): return json.loads(p.read_text(encoding="utf-8"))
def norm(v):
    s=str(v or "").lower().replace("’","'").replace("‘","'")
    return re.sub(r"\s+"," ",s).strip()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",type=Path)
    args=ap.parse_args()

    canonical={}
    for p in sorted(COLL.glob("*.json")):
        for row in load(p):
            rec=row.get("record") or {}
            cid=rec.get("collocation_id")
            if cid: canonical[cid]=rec

    cats={k:[] for k in [
        "already_materialized_by_id",
        "same_surface_present",
        "identity_matches_active_sense_but_missing",
        "identity_matches_secondary_sense_but_missing",
        "identity_points_to_missing_sense",
        "survivor_identity_missing"
    ]}

    for p in sorted(WORDS.glob("o*.json")):
        o=load(p); rec=o.get("record") or {}
        active=rec.get("senses") or []
        secondary=rec.get("secondary_senses") or []
        active_ids={str(s.get("sense_id")) for s in active if isinstance(s,dict) and s.get("sense_id")}
        secondary_ids={str(s.get("sense_id") or s.get("source_sense_id")) for s in secondary if isinstance(s,dict) and (s.get("sense_id") or s.get("source_sense_id"))}
        current=[]
        for bucket_name,bucket in [("active",active),("secondary",secondary)]:
            for s in bucket:
                if not isinstance(s,dict): continue
                sid=str(s.get("sense_id") or s.get("source_sense_id") or "")
                for c in s.get("collocations") or []:
                    if isinstance(c,dict):
                        current.append({
                            "bucket":bucket_name,"sense_id":sid,
                            "collocation_id":c.get("collocation_id"),
                            "phrase":c.get("phrase"),"meaning_cn":c.get("meaning_cn")
                        })
        by_id={x["collocation_id"]:x for x in current if x.get("collocation_id")}
        by_surface={}
        for x in current:
            s=norm(x.get("phrase"))
            if s: by_surface.setdefault(s,[]).append(x)

        for i,con in enumerate(rec.get("constructions") or []):
            if not isinstance(con,dict): continue
            pm=con.get("presentation_merge")
            if not isinstance(pm,dict) or not pm.get("surviving_object_id"): continue
            cid=str(pm["surviving_object_id"])
            row={
                "ordinal":o.get("ordinal"),"word":o.get("word"),"word_id":o.get("word_id"),
                "construction_index":i,
                "construction_id":con.get("construction_id") or con.get("fact_id"),
                "pattern":con.get("pattern") or con.get("boundary") or con.get("label_en"),
                "meaning_cn":con.get("meaning_cn") or con.get("definition_cn"),
                "source_sense_id":con.get("source_sense_id"),
                "surviving_object_id":cid
            }
            if cid in by_id:
                row["current_collocation"]=by_id[cid]
                cats["already_materialized_by_id"].append(row); continue
            surf=norm(row["pattern"])
            if surf and surf in by_surface:
                row["surface_matches"]=by_surface[surf]
                cats["same_surface_present"].append(row); continue
            ident=canonical.get(cid)
            if not ident:
                cats["survivor_identity_missing"].append(row); continue
            row["survivor_identity"]=ident
            sid=str(ident.get("sense_id") or "")
            if sid in active_ids:
                cats["identity_matches_active_sense_but_missing"].append(row)
            elif sid in secondary_ids:
                cats["identity_matches_secondary_sense_but_missing"].append(row)
            else:
                cats["identity_points_to_missing_sense"].append(row)

    report={
        "schema":"kianos.lexical.merge_materialization_audit.v1",
        "counts":{k:len(v) for k,v in cats.items()},
        "findings":cats
    }
    txt=json.dumps(report,ensure_ascii=False,indent=2)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(txt,encoding="utf-8")
    print(txt,end="")

if __name__=="__main__": main()
