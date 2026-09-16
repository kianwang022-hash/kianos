#!/usr/bin/env python3
"""Compile one bounded Lexical Sol-reconciliation package from accepted handoffs.

Accounting/transport only. Supports both accepted Production bullet formats:
`- oNNNN **word**` and `- `oNNNN word` — ...`.
"""
from __future__ import annotations
import argparse, json, re
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def read(path:str)->str:
    p=ROOT/path
    if not p.exists(): raise SystemExit(f'MISSING_SOURCE {path}')
    return p.read_text(encoding='utf-8')

def production_upgrades(text:str,start:int,end:int)->set[int]:
    out=set()
    pats=[r'(?m)^-\s+o(\d{4})\s+\*\*', r'(?m)^-\s+`o(\d{4})\s+[^`]+`\s+[—-]']
    for pat in pats:
        for m in re.finditer(pat,text):
            o=int(m.group(1))
            if start<=o<=end: out.add(o)
    return out

def audit_verdicts(text:str,start:int,end:int)->dict[int,str]:
    out={}
    inline=re.compile(r'(?m)^-\s+`?o(\d{4})\b[^\n]*?`(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)`')
    for m in inline.finditer(text):
        o=int(m.group(1))
        if start<=o<=end: out[o]=m.group(2)
    heading=re.compile(r'(?ms)^###\s+o(\d{4})\b.*?(?=^###\s+o\d{4}\b|^##\s+|\Z)')
    for hm in heading.finditer(text):
        o=int(hm.group(1))
        if not(start<=o<=end): continue
        vm=re.search(r'audit verdict:\s*(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)',hm.group(0))
        if vm: out[o]=vm.group(1)
    # New audit table format: | `o5827` `forsake` | `FLIP_TO_UPGRADE` | ...
    table=re.compile(r'(?m)^\|\s*`o(\d{4})`[^\n]*?\|\s*`(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)`\s*\|')
    for m in table.finditer(text):
        o=int(m.group(1))
        if start<=o<=end: out[o]=m.group(2)
    return out

def remote_candidates(text:str,start:int,end:int)->set[int]:
    out=set()
    for line in text.splitlines():
        if 'out-of-scope dependent owners:' in line:
            for m in re.finditer(r'@o(\d{4})',line):
                o=int(m.group(1))
                if not(start<=o<=end): out.add(o)
    return out

def receipt_counts(start,end,source):
    out=[]; lo=start
    while lo<=end:
        hi=min(lo+49,end); out.append({'start':lo,'end':hi,'source_count':sum(lo<=x<=hi for x in source)}); lo=hi+1
    return out

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--start',type=int,required=True); ap.add_argument('--end',type=int,required=True)
    ap.add_argument('--production',action='append',required=True); ap.add_argument('--audit',action='append',required=True); ap.add_argument('--out',required=True); a=ap.parse_args()
    if a.end-a.start+1!=500: raise SystemExit('PACKAGE_SIZE_MUST_BE_500')
    production=set(); production_by_file={}
    for path in a.production:
        vals=production_upgrades(read(path),a.start,a.end); production_by_file[path]=sorted(vals); production|=vals
    verdict_by_owner={}; verdict_sources={}; remote=set()
    for path in a.audit:
        text=read(path); remote|=remote_candidates(text,a.start,a.end)
        for o,v in audit_verdicts(text,a.start,a.end).items():
            prior=verdict_by_owner.get(o)
            if prior and prior!=v: raise SystemExit(f'CONFLICTING_AUDIT_VERDICT o{o:04d} {prior} {v}')
            verdict_by_owner[o]=v; verdict_sources.setdefault(o,[]).append(path)
    source=set(production); flipped=set()
    for o,v in verdict_by_owner.items():
        if v=='FLIP_TO_NO_CHANGE': source.discard(o); flipped.add(o)
        else: source.add(o)
    additions={o for o,v in verdict_by_owner.items() if v in {'FLIP_TO_UPGRADE','IDENTITY_RISK'} and o not in production}
    refinements={o for o,v in verdict_by_owner.items() if v=='REFINE_UPGRADE'}
    risks={o for o,v in verdict_by_owner.items() if v=='IDENTITY_RISK'}
    payload={'schema':'kianos.lexical.reconciliation_compile.v1','package':{'start':a.start,'end':a.end,'owner_count':500},
      'production_sources':a.production,'production_upgrade_count':len(production),'production_upgrade_owners':sorted(production),'production_upgrades_by_file':production_by_file,
      'audit_sources':a.audit,'audit_verdict_counts':dict(sorted(Counter(verdict_by_owner.values()).items())),'audit_verdicts':{f'o{o:04d}':verdict_by_owner[o] for o in sorted(verdict_by_owner)},
      'audit_verdict_sources':{f'o{o:04d}':verdict_sources[o] for o in sorted(verdict_sources)},'audit_flip_to_no_change':sorted(flipped),
      'audit_additions_beyond_production':sorted(additions),'audit_refinements':sorted(refinements),'identity_risks':sorted(risks),
      'semantic_source_owner_count':len(source),'semantic_source_owners':sorted(source),'receipt_counts':receipt_counts(a.start,a.end,source),
      'remote_dependency_candidates':sorted(remote),'status':'COMPILED_FOR_SOL_RECONCILIATION'}
    out=ROOT/a.out; out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('RECONCILIATION_COMPILE_PASS'); print('production_upgrades',len(production)); print('audit_verdicts',dict(sorted(Counter(verdict_by_owner.values()).items()))); print('semantic_source_union',len(source)); print('identity_risks',sorted(risks)); print('remote_candidates',sorted(remote)); print('receipt_counts',[x['source_count'] for x in payload['receipt_counts']])
if __name__=='__main__': main()
