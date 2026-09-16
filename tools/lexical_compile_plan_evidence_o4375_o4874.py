#!/usr/bin/env python3
from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content/lexical'
INDEX=LEX/'execution/preflight/o4375-o4874.identity-index.json'
OUT=LEX/'execution/preflight/o4375-o4874.plan-evidence.json'
SOURCES=[
 LEX/'semantic-review/o4375-o4624.md',LEX/'semantic-review/o4625-o4874.md',
 LEX/'semantic-audit/o4225-o4424.audit.md',LEX/'semantic-audit/o4425-o4624.audit.md',
 LEX/'semantic-audit/o4625-o4824.audit.md',LEX/'semantic-audit/o4825-o5024.audit.md',
 LEX/'semantic-reconciliation/o4375-o4874.md',
]

def snippets(text:str, ordinal:int):
    lines=text.splitlines(); pat=re.compile(rf'\bo{ordinal:04d}\b')
    hits=[]
    for i,line in enumerate(lines):
        if not pat.search(line): continue
        lo=max(0,i-2); hi=min(len(lines),i+8)
        snippet='\n'.join(lines[lo:hi]).strip()
        if snippet and snippet not in hits: hits.append(snippet)
    return hits

def main():
    idx=json.loads(INDEX.read_text(encoding='utf-8'))
    docs=[(p.relative_to(ROOT).as_posix(),p.read_text(encoding='utf-8')) for p in SOURCES]
    owners=[]
    for row in idx['owners']:
        o=row['ordinal']; evidence=[]
        for path,text in docs:
            ss=snippets(text,o)
            if ss: evidence.append({'source':path,'snippets':ss})
        owners.append({'ordinal':o,'word':row['word'],'evidence':evidence})
    payload={'schema':'kianos.lexical.package_plan_evidence.v1','package':[4375,4874],'owner_count':len(owners),'owners':owners}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    missing=[x['ordinal'] for x in owners[:161] if not x['evidence']]
    if missing: raise RuntimeError(f'SOURCE_EVIDENCE_MISSING {missing}')
    print('PLAN_EVIDENCE_PASS owners=',len(owners),'sources_with_evidence=',sum(bool(x['evidence']) for x in owners),'out=',OUT.relative_to(ROOT))
if __name__=='__main__': main()
