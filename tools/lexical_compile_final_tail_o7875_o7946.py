#!/usr/bin/env python3
"""Compile exact accounting for the final 72-owner Lexical tail o7875-o7946."""
from __future__ import annotations
import json, re, sys
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_compile_reconciliation_package as base

START,END=7875,7946
PRODUCTION='content/lexical/semantic-review/o7875-o7946.md'
AUDIT='content/lexical/semantic-audit/o7875-o7946.audit.md'
OUT=ROOT/'content/lexical/execution/preflight/o7875-o7946.reconciliation-compile.json'
VERDICT=r'(FLIP_TO_UPGRADE|FLIP_TO_NO_CHANGE|REFINE_UPGRADE|IDENTITY_RISK)'


def read(rel:str)->str:
    p=ROOT/rel
    if not p.exists(): raise RuntimeError(f'MISSING_SOURCE {rel}')
    return p.read_text(encoding='utf-8')


def audit_verdicts(text:str)->dict[int,str]:
    out=base.audit_verdicts(text,START,END)
    # Final Audit Pack uses numbered Markdown headings and explicit fenced fields:
    # ordinal: o7893 / audit verdict: FLIP_TO_UPGRADE.
    blocks=re.finditer(r'(?ms)^```text\s*\n(.*?)^```\s*$',text)
    for bm in blocks:
        block=bm.group(1)
        om=re.search(r'(?m)^ordinal:\s*o(\d{4})\s*$',block)
        vm=re.search(r'(?m)^audit verdict:\s*`?'+VERDICT+r'`?\s*$',block)
        if not om or not vm: continue
        o=int(om.group(1))
        if START<=o<=END: out[o]=vm.group(1)
    return out


def main():
    prod=base.production_upgrades(read(PRODUCTION),START,END)
    verdicts=audit_verdicts(read(AUDIT))
    source=set(prod)
    for o,v in verdicts.items():
        if v=='FLIP_TO_NO_CHANGE': source.discard(o)
        else: source.add(o)
    additions={o for o,v in verdicts.items() if v in {'FLIP_TO_UPGRADE','IDENTITY_RISK'} and o not in prod}
    refinements={o for o,v in verdicts.items() if v=='REFINE_UPGRADE'}
    risks={o for o,v in verdicts.items() if v=='IDENTITY_RISK'}
    expected_additions={7893,7894,7898,7902,7921}
    if len(prod)!=30: raise RuntimeError(f'PRODUCTION_COUNT_DRIFT {len(prod)}')
    if additions!=expected_additions: raise RuntimeError(f'AUDIT_ADDITION_DRIFT {sorted(additions)}')
    if refinements or risks: raise RuntimeError(f'UNEXPECTED_AUDIT_STATE refinements={sorted(refinements)} risks={sorted(risks)}')
    if len(source)!=35: raise RuntimeError(f'SOURCE_COUNT_DRIFT {len(source)}')
    receipts=[
      {'start':7875,'end':7924,'source_count':sum(7875<=x<=7924 for x in source)},
      {'start':7925,'end':7946,'source_count':sum(7925<=x<=7946 for x in source)},
    ]
    if [x['source_count'] for x in receipts] != [26,9]: raise RuntimeError(f'RECEIPT_COUNT_DRIFT {receipts}')
    payload={
      'schema':'kianos.lexical.reconciliation_compile.v1',
      'package':{'start':START,'end':END,'owner_count':72},
      'production_sources':[PRODUCTION],
      'production_upgrade_count':len(prod),
      'production_upgrade_owners':sorted(prod),
      'production_upgrades_by_file':{PRODUCTION:sorted(prod)},
      'audit_sources':[AUDIT],
      'audit_verdict_counts':dict(sorted(Counter(verdicts.values()).items())),
      'audit_verdicts':{f'o{o:04d}':verdicts[o] for o in sorted(verdicts)},
      'audit_verdict_sources':{f'o{o:04d}':[AUDIT] for o in sorted(verdicts)},
      'audit_flip_to_no_change':sorted(o for o,v in verdicts.items() if v=='FLIP_TO_NO_CHANGE'),
      'audit_additions_beyond_production':sorted(additions),
      'audit_refinements':sorted(refinements),
      'identity_risks':sorted(risks),
      'semantic_source_owner_count':len(source),
      'semantic_source_owners':sorted(source),
      'receipt_counts':receipts,
      'remote_dependency_candidates':[5235],
      'status':'COMPILED_FOR_SOL_RECONCILIATION',
    }
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('FINAL_TAIL_RECONCILIATION_COMPILE_PASS')
    print('production_upgrades',len(prod))
    print('audit_verdicts',dict(sorted(Counter(verdicts.values()).items())))
    print('semantic_source_union',len(source))
    print('receipt_counts',[x['source_count'] for x in receipts])

if __name__=='__main__': main()
