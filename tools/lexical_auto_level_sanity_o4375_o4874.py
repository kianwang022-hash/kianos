#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content/lexical'
sys.path.insert(0,str(ROOT/'tools'))
import lexical_execute_o4375_o4874_v4 as runtime

CAND=LEX/'execution/preflight/o4375-o4874.manifest-candidates.json'
OUT=LEX/'execution/preflight/o4375-o4874.auto-level-sanity.md'

def main():
    obj=json.loads(CAND.read_text(encoding='utf-8'))
    lines=['# o4375–o4874 auto-exact level sanity','']
    count=0
    for row in obj['owners']:
        if not row.get('ready_for_exact_compile'): continue
        exact=[x for x in row.get('operations',[]) if x.get('kind')=='reactivate_exact']
        preds=[]
        for op in exact:
            sid=op['sense_id']
            preds.append(f"{sid}=>{runtime.infer_level(row.get('directive',''),sid)} [{op.get('definition_en','')}]")
        lines.append(f"o{row['ordinal']:04d} {row['word']} | "+' ; '.join(preds)+f" | DIRECTIVE={row.get('directive','')}")
        count+=1
    if count!=24: raise RuntimeError(f'AUTO_READY_COUNT_DRIFT {count}')
    OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print('AUTO_LEVEL_SANITY_PASS',count)
if __name__=='__main__': main()
