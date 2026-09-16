#!/usr/bin/env python3
"""Issue #245 executor v3.

Keeps v2 cluster-relation handling and makes retirement of an obsolete stable
fact id projection-safe: a fact id may be duplicated across canonical fact
shards, so every exact record carrying that id is retired consistently.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_execute_o4875_o5374_v2 as v2  # noqa: F401 -- installs cluster patch
import lexical_execute_o4875_o5374 as v1


def retire_fact_all(rid: str):
    hits=[]
    for p in sorted((v1.LEX/'canonical'/'facts'/'shards').glob('*.json')):
        rows=v1.load(p)
        changed=False
        for row in rows:
            rec=row.get('record',{})
            if rec.get('fact_id')==rid:
                rec['publication_status']='reference_only'
                rec['verification_status']='retired_duplicate_relation_identity'
                hits.append((str(p.relative_to(ROOT)), row.get('ordinal'), row.get('fact_id') or rec.get('fact_id')))
                changed=True
        if changed:
            p.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    if hits:
        print('FACT_RETIRE_ALL',rid,'records=',len(hits),'locations=',hits)


# Install only the transport-safe retirement behavior; semantic authority is unchanged.
v1.retire_fact=retire_fact_all

if __name__=='__main__':
    v1.main()
