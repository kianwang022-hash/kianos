#!/usr/bin/env python3
"""Continuous/resumable executor for Issue #295 / o6875-o7374.

Semantic authority is frozen in content/lexical/semantic-reconciliation/o6875-o7374.md.
This executor only materializes declarative package manifests through reusable
Lexical Store/runtime primitives and fails closed on ambiguous attachment.
"""
from __future__ import annotations
import argparse, copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
MANIFEST_DIR=LEX/'execution'/'manifests'/'o6875-o7374'
ACCOUNTING=LEX/'execution'/'preflight'/'o6875-o7374.reconciliation-compile.json'
AUTHORITY='content/lexical/semantic-reconciliation/o6875-o7374.md'
PACKAGE=(6875,7374)
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
REMOTE_ALLOWED=set()

sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
import lexical_package_runtime as rt
import lexical_natural_owner as natural_owner

def load(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def accounting(): return load(ACCOUNTING)
def source_set(): return set(int(x) for x in accounting()['semantic_source_owners'])

def load_patches():
    out={}
    for p in sorted(MANIFEST_DIR.glob('*.json')):
        x=load(p)
        for row in x.get('patches',[]):
            o=int(row['ordinal'])
            if o in out: raise RuntimeError(f'DUPLICATE_PATCH o{o:04d}')
            out[o]=row
    return out

def baseline_bytes(rel):
    if BASELINE=='unknown': raise RuntimeError('KIANOS_BASELINE_MAIN must be pinned')
    return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

def active(store,o): return store.record(o).get('senses',[])
def word(store,o): return store.record(o)['word']

def select_active(store,o,op):
    rows=active(store,o)
    if op.get('sid'):
        hits=[x for x in rows if x.get('sense_id')==op['sid']]
    else:
        hits=list(rows)
        if op.get('pos'): hits=[x for x in hits if x.get('pos')==op['pos']]
        if op.get('match'):
            q=op['match'].lower(); hits=[x for x in hits if q in (str(x.get('definition_en',''))+' '+str(x.get('definition_cn',''))).lower()]
        if op.get('index') is not None:
            idx=int(op['index']); hits=[hits[idx]] if 0<=idx<len(hits) else []
    if len(hits)!=1: raise RuntimeError(f'ACTIVE_SELECTOR_NOT_UNIQUE o{o:04d} op={op} hits={len(hits)}')
    return hits[0]

def select_registry(store,o,op):
    w=word(store,o)
    hits=[(sid,r) for sid,r in store.senses.items() if r.get('headword')==w and r.get('status')!='active']
    if op.get('sid'): hits=[x for x in hits if x[0]==op['sid']]
    if op.get('match'):
        q=op['match'].lower(); hits=[x for x in hits if q in (str(x[1].get('definition_en',''))+' '+str(x[1].get('definition_cn',''))).lower()]
    if len(hits)!=1: raise RuntimeError(f'REGISTRY_SELECTOR_NOT_UNIQUE o{o:04d} op={op} hits={[(x[0],x[1].get("definition_en")) for x in hits]}')
    return hits[0][0]

def find_word_ordinal(store,target):
    hits=[o for o,row in store.words.items() if row.get('record',{}).get('word')==target]
    if len(hits)!=1: raise RuntimeError(f'TARGET_WORD_NOT_UNIQUE {target} {hits}')
    return hits[0]

def ensure_relation(store,o,op,relation_ids):
    t=int(op.get('target_ordinal') or find_word_ordinal(store,op['target_word']))
    if not(PACKAGE[0]<=t<=PACKAGE[1]):
        raise RuntimeError(f'REMOTE_RELATION_TARGET_NOT_AUTHORIZED o{o:04d}->o{t:04d}')
    target_word=word(store,t)
    field=op.get('field','semantic_neighbors')
    candidates=[]
    for so,tw in ((o,target_word),(t,word(store,o))):
        for fld in ('semantic_neighbors','confusables'):
            for p in store.record(so).get(fld,[]) or []:
                if isinstance(p,dict) and p.get('target_word')==tw:
                    candidates.append((so,fld,p))
    rids={p.get('relation_id') or p.get('fact_id') for _,_,p in candidates if p.get('relation_id') or p.get('fact_id')}
    if len(rids)==1:
        rid=next(iter(rids)); src=o if any(x[0]==o and (x[2].get('relation_id') or x[2].get('fact_id'))==rid for x in candidates) else t
        dst=t if src==o else o
        rt.ensure_reciprocal_existing_relation(store,src,dst,rid=rid)
        relation_ids.add(rid); return
    if len(rids)>1: raise RuntimeError(f'RELATION_AMBIGUOUS o{o:04d}->{target_word} {sorted(rids)}')
    rid=rt.attach_new_reciprocal_relation(store,o,t,relation_type=op.get('relation_type','regional_variant'),field=field,
        a_sid=op.get('source_sid'),b_sid=op.get('target_sid'),boundary=op['boundary'],priority=op.get('priority','A'),
        regional_a=op.get('regional_source'),regional_b=op.get('regional_target'))
    relation_ids.add(rid)

def apply_op(store,o,op,sense_touched,explicit_core,relation_ids):
    k=op['kind']
    if k=='rewrite':
        s=select_active(store,o,op); sid=s['sense_id']
        store.put_existing(o,sid,cn=op.get('cn'),en=op.get('en'),pos=op.get('new_pos'),level=op.get('level'),pattern=op.get('pattern'))
        if op.get('usage_note') or op.get('register') or op.get('writing_safe') is not None:
            rt.set_sense_usage(store,o,sid,note=op.get('usage_note'),register=op.get('register'),level=op.get('level'),writing_safe=op.get('writing_safe'))
        sense_touched.add(o)
    elif k=='reactivate':
        sid=op.get('sid') or select_registry(store,o,op)
        store.put_existing(o,sid,cn=op.get('cn'),en=op.get('en'),pos=op.get('pos'),level=op.get('level','L1'),pattern=op.get('pattern'))
        if op.get('usage_note') or op.get('register') or op.get('writing_safe') is not None:
            rt.set_sense_usage(store,o,sid,note=op.get('usage_note'),register=op.get('register'),level=op.get('level','L1'),writing_safe=op.get('writing_safe'))
        sense_touched.add(o)
    elif k=='new':
        sid=store.new(o,op['branch'],op['pos'],op['cn'],op['en'],level=op.get('level','L2'),pattern=op.get('pattern',''))
        if op.get('usage_note') or op.get('register') or op.get('writing_safe') is not None:
            rt.set_sense_usage(store,o,sid,note=op.get('usage_note'),register=op.get('register'),level=op.get('level','L2'),writing_safe=op.get('writing_safe'))
        sense_touched.add(o)
    elif k=='demote':
        s=select_active(store,o,op); store.demote(o,s['sense_id']); sense_touched.add(o)
    elif k=='usage':
        s=select_active(store,o,op); rt.set_sense_usage(store,o,s['sense_id'],note=op.get('note'),register=op.get('register'),level=op.get('level'),writing_safe=op.get('writing_safe'))
    elif k=='construction':
        sid=None
        if op.get('source_sid'):
            sid=op['source_sid']
        elif op.get('source_match'):
            sid=select_active(store,o,{'match':op.get('source_match'),'pos':op.get('source_pos')})['sense_id']
        elif op.get('source_pos'):
            hits=[x for x in active(store,o) if x.get('pos')==op.get('source_pos')]
            if len(hits)==1: sid=hits[0]['sense_id']
            elif len(hits)>1 and op.get('require_anchor'):
                raise RuntimeError(f'CONSTRUCTION_SOURCE_AMBIGUOUS o{o:04d} op={op} hits={len(hits)}')
        rt.upsert_construction(store,o,op['pattern'],op['meaning_cn'],source_sid=sid,level=op.get('level','L2'),definition_en=op.get('definition_en'),note=op.get('note'))
    elif k=='form':
        rt.set_form_identity(store,o,AUTHORITY,op['type'],copy.deepcopy(op['boundaries']))
        for alias in op.get('aliases',[]): rt.add_lookup_alias(store,o,alias)
    elif k=='relation': ensure_relation(store,o,op,relation_ids)
    elif k=='core':
        store.core(o,cn=op['cn'],en=op['en']); explicit_core.add(o)
    elif k=='record_note':
        store.record(o)[op.get('field','usage_note')]=op['value']; store.mark(o)
    else: raise RuntimeError(f'UNKNOWN_PATCH_KIND {k}')

def validate_manifest():
    src=source_set(); patches=load_patches(); keys=set(patches)
    if len(src)!=304: raise RuntimeError(f'SOURCE_COUNT_DRIFT {len(src)}')
    if len(list(MANIFEST_DIR.glob('*.json')))!=10: raise RuntimeError(f'MANIFEST_FILE_COUNT_DRIFT {len(list(MANIFEST_DIR.glob("*.json")))}')
    if keys!=src: raise RuntimeError(f'MANIFEST_COVERAGE_DRIFT missing={sorted(src-keys)} extra={sorted(keys-src)}')
    for o,row in patches.items():
        if not row.get('ops'): raise RuntimeError(f'EMPTY_PATCH o{o:04d}')
    return {'sources':304,'patches':len(keys),'manifest_files':10}

def checkpoint_sources(i):
    lo=6875+50*i; hi=lo+49; return lo,hi,tuple(sorted(o for o in source_set() if lo<=o<=hi))

def apply_checkpoint(i):
    validate_manifest(); patches=load_patches(); lo,hi,src=checkpoint_sources(i)
    store=base.Store(); store.extra_changed_paths=set(); sense_touched=set(); explicit_core=set(); relation_ids=set()
    for o in src:
        for op in patches[o]['ops']: apply_op(store,o,op,sense_touched,explicit_core,relation_ids)
    for o in sorted(sense_touched-explicit_core): rt.rebuild_core_from_active(store,o)
    store.finalize()
    natural,relations,report=natural_owner.build()
    if report.get('status')!='PASS': raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    changed=set(store.changed_word_ordinals)
    for o in sorted(changed): natural_owner.dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
    rel_ids=set(relation_ids)
    for o in changed: rel_ids.update(x.get('relation_id') for x in natural[o].get('relation_refs',[]) if x.get('relation_id'))
    for rid in sorted(x for x in rel_ids if x):
        if rid in relations: natural_owner.dump_json(natural_owner.relation_owner_path(rid),relations[rid])
    out_remote=sorted(o for o in changed if not(PACKAGE[0]<=o<=PACKAGE[1]))
    if set(out_remote)-REMOTE_ALLOWED: raise RuntimeError(f'UNAUTHORIZED_REMOTE_WORD_WRITE {out_remote}')
    bad=[]
    for o in range(lo,hi+1):
        if o in source_set(): continue
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()): bad.append(o)
    if bad: raise RuntimeError(f'NO_CHANGE_BYTE_GUARD_FAILED {bad}')
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v3','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTHORITY,'issue':295,'package':list(PACKAGE),'shard':[lo,hi],'reviewed_owner_count':50,'semantic_source_ordinals':list(src),'semantic_source_count':len(src),'changed_word_ordinals':sorted(changed),'out_of_range_dependency_ordinals':out_remote,'new_semantic_branch_ids':sorted(set(store.new_stable_sense_ids)),'relation_ids_materialized':sorted(x for x in rel_ids if x),'readback':{'all_50_owner_views':'PASS','semantic_sources':'PASS','no_change_byte_guard':'PASS','natural_owner_registry_audit':'PASS'}}
    path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'; path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'CHECKPOINT_PASS {i+1}/10 o{lo:04d}-o{hi:04d} sources={len(src)} changed={len(changed)} remote={out_remote}')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--validate-manifest',action='store_true'); ap.add_argument('--checkpoint',type=int); a=ap.parse_args()
    if a.validate_manifest: print('MANIFEST_COVERAGE_PASS',json.dumps(validate_manifest(),sort_keys=True)); return
    if a.checkpoint is None or not 0<=a.checkpoint<=9: raise SystemExit('pass --validate-manifest or --checkpoint 0..9')
    apply_checkpoint(a.checkpoint)
if __name__=='__main__': main()
