#!/usr/bin/env python3
"""Compile explicit Production identity escalations and cross-package refs.

Accounting only: semantic authority remains the accepted Production/Audit handoffs
and the later Sol reconciliation. This parser exists so the next 500-owner package
does not rely on hand-copied identity or dependency lists.
"""
from __future__ import annotations
import argparse, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def read(path: str) -> str:
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f"MISSING_SOURCE {path}")
    return p.read_text(encoding="utf-8")

def owner_blocks(text: str):
    pat = re.compile(r"(?ms)^-\s+`?o(\d{4})`?\s+(?:\*\*)?([^\n*`]+?)(?:\*\*)?\s*\n(.*?)(?=^-\s+`?o\d{4}|^##\s+|^###\s+|\Z)")
    for m in pat.finditer(text):
        yield int(m.group(1)), m.group(2).strip(), m.group(3)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--start',type=int,required=True); ap.add_argument('--end',type=int,required=True)
    ap.add_argument('--production',action='append',default=[]); ap.add_argument('--audit',action='append',default=[])
    ap.add_argument('--out',required=True); a=ap.parse_args()
    identity=[]; remote={}; all_sources=a.production+a.audit
    for path in a.production:
        text=read(path)
        for o,word,body in owner_blocks(text):
            if a.start <= o <= a.end and 'ESCALATE_IDENTITY' in body:
                refs=sorted({int(x) for x in re.findall(r'@o(\d{4})', body) if not (a.start <= int(x) <= a.end)})
                identity.append({'ordinal':o,'word':word,'source':path,'remote_refs':refs,'excerpt':re.sub(r'\s+',' ',body).strip()[:1000]})
    for path in all_sources:
        text=read(path)
        refs=sorted({int(x) for x in re.findall(r'@o(\d{4})',text) if not (a.start <= int(x) <= a.end)})
        if refs: remote[path]=refs
    payload={'schema':'kianos.lexical.reconciliation_extras.v1','package':[a.start,a.end],
             'production_identity_escalations':sorted(identity,key=lambda x:x['ordinal']),
             'production_identity_escalation_count':len(identity),
             'all_out_of_range_references_by_source':remote,
             'all_out_of_range_references':sorted({x for xs in remote.values() for x in xs}),
             'status':'COMPILED_FOR_SOL_RECONCILIATION'}
    out=ROOT/a.out; out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('RECONCILIATION_EXTRAS_PASS',len(identity),payload['all_out_of_range_references'])
if __name__=='__main__': main()
