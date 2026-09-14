#!/usr/bin/env python3
"""Companion gate for Xizong Projection freeze accounting/provenance.

Asset binding/visibility semantics stay owned by validate_projection.py. This file only
checks repository-wide System eligibility accounting, per-eligible-Block disposition/
stale accounting, and commit provenance.
"""
from __future__ import annotations
import argparse, copy, json, re, subprocess, sys
from collections import Counter
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[4]
PROJ = ROOT / "content/xizong/projection"
MANIFEST = PROJ / "manifest.json"
KM = ROOT / "content/xizong/knowledge/manifest.json"
DISP = {"PASS","REFERENCE_ONLY","BLOCKED"}
STALE = {"FRESH","STALE","BLOCKED"}
LEVELS = {"RICH_CURRENT","BASELINE_CURRENT"}

def load(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def rootize(v):
    v=v.strip("/")
    if v.startswith("systems/"): v="content/xizong/knowledge/"+v
    return v+"/"
def commit(sha):
    return isinstance(sha,str) and bool(re.fullmatch(r"[0-9a-f]{40}",sha)) and subprocess.run(
        ["git","cat-file","-e",f"{sha}^{{commit}}"],cwd=ROOT,
        stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
def ancestor(a,b):
    return subprocess.run(["git","merge-base","--is-ancestor",a,b],cwd=ROOT,
        stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
def expected_roots():
    km=load(KM); out=set()
    domains=km.get("macro_domain_taxonomy",{}).get("domains",{})
    if not isinstance(domains,dict): raise ValueError("knowledge manifest domains missing")
    for d in domains.values():
        owners=d.get("system_owners",[]) if isinstance(d,dict) else []
        if not isinstance(owners,list): raise ValueError("system_owners must be list")
        for x in owners:
            if not isinstance(x,str) or not x: raise ValueError("invalid system owner")
            out.add(rootize(x))
    return out

def validate(m):
    e=[]
    def bad(code,msg): e.append(f"{code}: {msg}")
    req={"schema","schema_version","status","runtime_authority","source_baseline_commit",
         "source_current_head","compiled_commit","current_reconciliation_head","systems",
         "coverage","eligibility_accounting","validation"}
    if req-set(m): bad("SCHEMA",f"missing {sorted(req-set(m))}")
    if m.get("schema")!="kianos.xizong.cognitive_projection.manifest.v1": bad("SCHEMA","wrong schema")
    if m.get("runtime_authority") is not False: bad("BOUNDARY","Projection must remain non-runtime authority")
    if m.get("status") not in {"V1_FREEZE_CANDIDATE_RECONCILED","V1_ASSET_CONTRACT_FROZEN_VALIDATED"}:
        bad("SCHEMA","unsupported freeze status")

    shas=[m.get(x) for x in ("source_baseline_commit","source_current_head","compiled_commit","current_reconciliation_head")]
    for name,sha in zip(("source_baseline_commit","source_current_head","compiled_commit","current_reconciliation_head"),shas):
        if not commit(sha): bad("PROVENANCE",f"{name} unavailable: {sha!r}")
    if all(commit(x) for x in shas):
        if not ancestor(shas[1],shas[2]): bad("PROVENANCE","source_current_head not ancestor of compiled_commit")
        if not ancestor(shas[2],shas[3]): bad("PROVENANCE","compiled_commit not ancestor of reconciliation head")
        if not ancestor(shas[3],"HEAD"): bad("PROVENANCE","reconciliation head not ancestor of HEAD")

    systems=m.get("systems",{})
    if not isinstance(systems,dict) or not systems: bad("SCHEMA","systems must be nonempty mapping"); systems={}
    elig=m.get("eligibility_accounting",{})
    comp=elig.get("compiled",[]) if isinstance(elig,dict) else []
    defer=elig.get("not_eligible",[]) if isinstance(elig,dict) else []
    if not isinstance(comp,list) or not isinstance(defer,list): bad("ELIGIBILITY","compiled/not_eligible must be lists"); comp=[]; defer=[]
    roots=[]; bysid={}; cids=[]
    for x in comp:
        if not isinstance(x,dict): bad("ELIGIBILITY","compiled entry not object"); continue
        sid=x.get("system_id"); cids.append(x.get("canonical_id"))
        if x.get("status")!="ELIGIBLE_COMPILED": bad("ELIGIBILITY",f"{sid}: wrong compiled status")
        if not isinstance(sid,str) or sid in bysid: bad("ELIGIBILITY",f"invalid/duplicate system_id {sid!r}"); continue
        bysid[sid]=x
        if isinstance(x.get("owner_root"),str): roots.append(rootize(x["owner_root"]))
        else: bad("ELIGIBILITY",f"{sid}: owner_root missing")
    for x in defer:
        if not isinstance(x,dict): bad("ELIGIBILITY","not_eligible entry not object"); continue
        cid=x.get("canonical_id"); cids.append(cid)
        if x.get("status")!="NOT_ELIGIBLE": bad("ELIGIBILITY",f"{cid}: wrong deferred status")
        if not isinstance(x.get("reason"),str) or not x["reason"].strip(): bad("ELIGIBILITY",f"{cid}: reason required")
        if isinstance(x.get("owner_root"),str): roots.append(rootize(x["owner_root"]))
        else: bad("ELIGIBILITY",f"{cid}: owner_root missing")
    try: exp=expected_roots()
    except Exception as ex: bad("ELIGIBILITY",str(ex)); exp=set()
    if set(roots)!=exp: bad("ELIGIBILITY",f"owner roots mismatch missing={sorted(exp-set(roots))} extra={sorted(set(roots)-exp)}")
    if len(roots)!=len(set(roots)): bad("ELIGIBILITY","owner_root accounted more than once")
    if len(cids)!=len(set(cids)): bad("ELIGIBILITY","canonical_id accounted more than once")
    if set(bysid)!=set(systems): bad("ELIGIBILITY","compiled systems != manifest systems")

    cov=m.get("coverage",{})
    declared_rich=cov.get("rich_calibration_blocks",[])
    if not isinstance(declared_rich,list) or len(declared_rich)!=len(set(declared_rich)):
        bad("ACCOUNTING","rich_calibration_blocks must be unique list"); declared_rich=[]
    richset=set(declared_rich)
    dc=Counter({x:0 for x in DISP}); sc=Counter({x:0 for x in STALE}); rich=[]; baseline=0
    for sid,spec in systems.items():
        x=bysid.get(sid,{})
        if x.get("canonical_id")!=spec.get("canonical_id") or x.get("block_count")!=spec.get("block_count"):
            bad("ELIGIBILITY",f"{sid}: canonical/block count mismatch")
        rr=spec.get("owner_root"); ss=spec.get("system_source")
        if not isinstance(rr,str) or not isinstance(ss,str): bad("OWNER",f"{sid}: owner_root/system_source required")
        else:
            rr=rootize(rr); want=str(PurePosixPath(rr)/"system.json")
            if ss!=want: bad("OWNER",f"{sid}: system_source mismatch")
            if x and rootize(x.get("owner_root",""))!=rr: bad("ELIGIBILITY",f"{sid}: compiled owner_root mismatch")
        if spec.get("system_disposition") not in DISP or spec.get("stale_status") not in STALE:
            bad("ACCOUNTING",f"{sid}: bad System disposition/stale")
        if spec.get("system_disposition")=="PASS" and spec.get("stale_status")!="FRESH":
            bad("ACCOUNTING",f"{sid}: PASS System must be FRESH")
        blocks=spec.get("blocks",[]); acc=spec.get("block_accounting",[])
        if not isinstance(blocks,list) or not isinstance(acc,list): bad("ACCOUNTING",f"{sid}: blocks/accounting must be lists"); continue
        if len(acc)!=len(blocks) or spec.get("block_count")!=len(blocks): bad("ACCOUNTING",f"{sid}: count mismatch")
        amap={}
        for a in acc:
            p=a.get("asset") if isinstance(a,dict) else None
            if not isinstance(p,str) or p in amap: bad("ACCOUNTING",f"{sid}: bad/duplicate asset {p!r}")
            else: amap[p]=a
        if set(amap)!=set(blocks): bad("ACCOUNTING",f"{sid}: accounting assets != blocks list")
        for rel in blocks:
            a=amap.get(rel)
            if not a: continue
            p=PROJ/rel
            if not p.is_file(): bad("ACCOUNTING",f"{sid}: missing {rel}"); continue
            try: obj=load(p)
            except Exception as ex: bad("ACCOUNTING",f"{sid}: unreadable {rel}: {ex}"); continue
            bid=obj.get("block_id"); explicit=obj.get("projection_level"); declared=a.get("projection_level")
            if a.get("block_id")!=bid: bad("ACCOUNTING",f"{sid}/{rel}: block_id mismatch")
            if explicit is None:
                if declared!="RICH_CURRENT" or bid not in richset: bad("ACCOUNTING",f"{sid}/{bid}: implicit calibration richness inconsistent")
                level="RICH_CURRENT"
            else:
                if explicit not in LEVELS or declared!=explicit: bad("ACCOUNTING",f"{sid}/{bid}: projection_level mismatch")
                level=explicit
            d=a.get("disposition"); s=a.get("stale_status")
            if d not in DISP: bad("ACCOUNTING",f"{sid}/{bid}: bad disposition")
            else: dc[d]+=1
            if s not in STALE: bad("ACCOUNTING",f"{sid}/{bid}: bad stale status")
            else: sc[s]+=1
            if d=="PASS" and s!="FRESH": bad("ACCOUNTING",f"{sid}/{bid}: PASS requires FRESH")
            if level=="RICH_CURRENT": rich.append(bid)
            else: baseline+=1

    disp={k:dc[k] for k in ("PASS","REFERENCE_ONLY","BLOCKED")}
    stale={k:sc[k] for k in ("FRESH","STALE","BLOCKED")}
    if cov.get("eligible_block_accounting")!=disp: bad("ACCOUNTING",f"eligible summary mismatch {disp}")
    if cov.get("stale_accounting")!=stale: bad("ACCOUNTING",f"stale summary mismatch {stale}")
    if cov.get("baseline_projection_blocks")!=baseline: bad("ACCOUNTING",f"baseline count mismatch {baseline}")
    if Counter(declared_rich)!=Counter(rich): bad("ACCOUNTING",f"rich calibration mismatch {sorted(rich)}")
    return e

def selftests(m):
    fails=[]
    def expect(name,x,prefix):
        got=validate(x)
        if not any(z.startswith(prefix+":") for z in got): fails.append(f"{name}: expected {prefix}, got {got}")
    x=copy.deepcopy(m); sid=next(iter(x["systems"])); x["systems"][sid]["block_accounting"].pop(); expect("missing_block",x,"ACCOUNTING")
    x=copy.deepcopy(m); x["eligibility_accounting"]["not_eligible"][0]["owner_root"]=x["eligibility_accounting"]["compiled"][0]["owner_root"]; expect("duplicate_owner",x,"ELIGIBILITY")
    x=copy.deepcopy(m); x["current_reconciliation_head"]="0"*40; expect("bad_commit",x,"PROVENANCE")
    return fails

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--self-test",action="store_true"); ap.add_argument("--json",type=Path); a=ap.parse_args()
    m=load(MANIFEST); issues=validate(m); tf=selftests(m) if a.self_test else []; status="PASS" if not issues and not tf else "FAIL"
    report={"status":status,"scope":"PROJECTION_FREEZE_ACCOUNTING_AND_PROVENANCE_ONLY","issues":issues,"self_test_failures":tf,
            "compiled_systems":len(m.get("systems",{})),"eligible_blocks":m.get("coverage",{}).get("blocks"),
            "accounted_system_owner_roots":len(expected_roots()),
            "not_claimed":["medical_semantic_acceptance","browser_answer_leak_safety","Mac_visual_acceptance","runtime_adoption","learner_progress"]}
    if a.json: a.json.parent.mkdir(parents=True,exist_ok=True); a.json.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    for x in issues: print("FAIL",x)
    for x in tf: print("SELF_TEST_FAIL",x)
    print("XIZONG_PROJECTION_ACCEPTANCE:",status)
    print("eligibility_owner_accounting:","FAIL" if any(x.startswith("ELIGIBILITY:") for x in issues) else "PASS")
    print("block_disposition_and_stale_accounting:","FAIL" if any(x.startswith("ACCOUNTING:") for x in issues) else "PASS")
    print("commit_provenance:","FAIL" if any(x.startswith("PROVENANCE:") for x in issues) else "PASS")
    if a.self_test: print("acceptance_self_tests:","FAIL" if tf else "PASS")
    print("boundary: accounting/provenance only; validate_projection.py remains authoritative for bindings/visibility")
    return 0 if status=="PASS" else 1
if __name__=="__main__": sys.exit(main())
