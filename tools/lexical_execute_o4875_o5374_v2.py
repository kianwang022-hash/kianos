#!/usr/bin/env python3
"""Issue #245 executor v2: adds cluster-relation reciprocity without changing v1 semantics."""
from __future__ import annotations

import copy
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_execute_o4875_o5374 as v1


def _mentions_target(payload:dict,target_word:str)->bool:
    if payload.get('target_word')==target_word:
        return True
    expr=' '.join(str(payload.get(k,'')) for k in ('target_expression','learning_note','relation_note','shared_meaning','boundary'))
    if target_word.lower() in expr.lower():
        return True
    for key in ('members','source_evidence_objects'):
        value=payload.get(key)
        if target_word.lower() in str(value).lower():
            return True
    return False


def close_existing_relation(store,o,target_word,*,source_sid=None,target_sid=None,rid=None):
    """Use v1 normal closure first; then handle multi-member horizontal clusters.

    Horizontal cluster payloads can intentionally have target_word=null while the
    target appears in target_expression / relation_targets.  They still need a
    reciprocal Word entrypoint, but must not be rewritten into a pairwise-only
    relation identity.
    """
    try:
        return v1.close_existing_relation(store,o,target_word,source_sid=source_sid,target_sid=target_sid,rid=rid)
    except RuntimeError as original:
        if not rid:
            raise
        try:
            field,_,payload=v1.rt.find_relation_view(store,o,rid=rid)
        except RuntimeError:
            raise original
        if not _mentions_target(payload,target_word):
            raise original
        wm=v1.word_map(store)
        if target_word not in wm:
            raise RuntimeError(f'CLUSTER_TARGET_WORD_NOT_FOUND {target_word}')
        target_o=wm[target_word]
        target_arr=store.record(target_o).setdefault(field,[])
        existing=[x for x in target_arr if isinstance(x,dict) and v1.relation_id(x)==rid]
        if len(existing)>1:
            raise RuntimeError(f'CLUSTER_RECIPROCAL_DUPLICATE o{target_o:04d} {rid}')
        if existing:
            mirror=existing[0]
        else:
            mirror=copy.deepcopy(payload)
            mirror['source_expression']=target_word
            # Preserve the multi-member target expression. target_word on the
            # reciprocal view is only an entrypoint pointer, not a new identity.
            mirror['target_word']=store.record(o)['word']
            target_arr.append(mirror)
        if source_sid is not None:
            payload['source_sense_id']=source_sid
            mirror['target_sense_id']=source_sid
        if target_sid is not None:
            payload['target_sense_id']=target_sid
            mirror['source_sense_id']=target_sid
        payload.setdefault('reciprocal_entrypoints',[])
        if target_word not in payload['reciprocal_entrypoints']:
            payload['reciprocal_entrypoints'].append(target_word)
        mirror.setdefault('reciprocal_entrypoints',[])
        src_word=store.record(o)['word']
        if src_word not in mirror['reciprocal_entrypoints']:
            mirror['reciprocal_entrypoints'].append(src_word)
        store.mark(o); store.mark(target_o)
        return rid


v1.close_existing_relation=close_existing_relation

if __name__=='__main__':
    v1.main()
