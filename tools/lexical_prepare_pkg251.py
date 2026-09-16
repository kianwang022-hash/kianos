#!/usr/bin/env python3
"""Thin package-251 adapter over the accepted generic execution preparer."""
from __future__ import annotations
import re
from pathlib import Path
import lexical_prepare_execution_package as base


def production_blocks(path: Path):
    lines=path.read_text(encoding='utf-8').splitlines(); out={}; i=0
    while i < len(lines):
        m_old=re.match(r'^- o(\d{4}) \*\*(.+?)\*\*\s*$',lines[i])
        m_new=re.match(r'^- `o(\d{4})\s+([^`]+)`\s*[—-]?\s*(.*)$',lines[i])
        m=m_old or m_new
        if not m:
            i+=1; continue
        ordinal=int(m.group(1)); word=m.group(2).strip(); buf=[]
        if m_new and m.group(3).strip(): buf.append(base.clean(m.group(3).strip()))
        j=i+1
        while j<len(lines):
            if re.match(r'^- (?:o\d{4} \*\*|`o\d{4}\s+)',lines[j]) or lines[j].startswith('### Checkpoint') or lines[j].startswith('## '): break
            if lines[j].strip().startswith('- '): buf.append(base.clean(lines[j].strip()[2:]))
            j+=1
        out[ordinal]={'word':word,'instructions':buf}; i=j
    return out

base.production_blocks=production_blocks

if __name__=='__main__':
    base.main()
