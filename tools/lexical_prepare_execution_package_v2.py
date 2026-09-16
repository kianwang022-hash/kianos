#!/usr/bin/env python3
"""Format-complete wrapper for Lexical execution-package preparation.

The generic preparer historically parsed only `- oNNNN **word**` Production
records. Current accepted handoffs also use `- `oNNNN word` — directive`.
This wrapper patches only that transport/parser seam and delegates all other
behavior to lexical_prepare_execution_package.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_prepare_execution_package as base


def clean(value:str)->str:
    return re.sub(r'\s+',' ',value.strip())


def production_blocks(path:Path):
    lines=path.read_text(encoding='utf-8').splitlines(); out={}; i=0
    while i<len(lines):
        m1=re.match(r'^-\s+o(\d{4})\s+\*\*([^*]+)\*\*\s*(.*)$',lines[i])
        m2=re.match(r'^-\s+`o(\d{4})\s+([^`]+)`\s*[—-]\s*(.*)$',lines[i])
        m=m1 or m2
        if not m:
            i+=1; continue
        ordinal=int(m.group(1)); word=m.group(2).strip(); buf=[]
        if m.group(3).strip(): buf.append(clean(m.group(3)))
        j=i+1
        while j<len(lines):
            if (re.match(r'^-\s+o\d{4}\s+\*\*',lines[j]) or
                re.match(r'^-\s+`o\d{4}\s+[^`]+`\s*[—-]',lines[j]) or
                lines[j].startswith('### Checkpoint') or lines[j].startswith('## ')):
                break
            if lines[j].strip().startswith('- '): buf.append(clean(lines[j].strip()[2:]))
            elif lines[j].startswith('  ') and lines[j].strip(): buf.append(clean(lines[j]))
            j+=1
        out[ordinal]={'word':word,'instructions':buf}; i=j
    return out

base.production_blocks=production_blocks

if __name__=='__main__':
    base.main()
