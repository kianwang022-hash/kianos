#!/usr/bin/env python3
"""Execution wrapper for o4225-o4274.

Normalizes two learner-facing strings without changing semantic authority:
- salute patterns use learner form `salute sb/sth` / `a salute to sb/sth`;
- scale-up/down construction meaning_cn remains Chinese.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_execute_o4225_o4274 as impl

_orig_add_colloc=impl.base.Store.add_colloc
_orig_apply=impl.apply


def add_colloc(self, ordinal, sid, phrase, meaning, exam='fixed_pattern'):
    if phrase == 'salute + sb/sth':
        phrase = 'salute sb/sth'
    elif phrase == 'a salute to + sb/sth':
        phrase = 'a salute to sb/sth'
    return _orig_add_colloc(self, ordinal, sid, phrase, meaning, exam)


def apply(store):
    _orig_apply(store)
    desired={
        'scale up':'扩大规模、容量或运营能力',
        'scale down':'缩小规模、容量或运营能力',
    }
    rows=store.record(4268).get('constructions',[])
    for pattern,meaning in desired.items():
        hits=[x for x in rows if x.get('pattern')==pattern]
        if len(hits)!=1:
            raise RuntimeError(f'SCALE_CONSTRUCTION_NOT_UNIQUE {pattern} {len(hits)}')
        hits[0]['meaning_cn']=meaning
    store.mark(4268)


impl.base.Store.add_colloc=add_colloc
impl.apply=apply

if __name__=='__main__':
    impl.main()
