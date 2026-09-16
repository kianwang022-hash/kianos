#!/usr/bin/env python3
"""Continuous/resumable executor for Issue #303 / final tail o7875-o7946."""
from __future__ import annotations
import argparse, copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
MANIFEST_DIR=LEX/'execution'/'manifests'/'o7875-o7946'
ACCOUNTING=LEX/'execution'/'preflight'/'o7875-o7946.reconciliation-compile.json'
AUTHORITY='content/lexical/semantic-reconciliation/o7875-o7946.md'
PACKAGE=(7875,7946)
BOUNDARIES=((7875,7924),(7925,7946))
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
def active(store,o): return store.record(o).get('senses',[])


def load_patches():
    out={}
    files=sorted(MANIFEST_DIR.glob('*.json'))
    for p in files:
        x=load(p)
        if x.get('package')!=[7875,7946]: raise RuntimeError(f'MANIFEST_PACKAGE_DRIFT {p}')
        for row in x.get('patches',[]):
            o=int(row['ordinal'])
            if o in out: raise RuntimeError(f'DUPLICATE_PATCH o{o:04d}')
            out[o]=row
    return files,out


def baseline_bytes(rel):
    if BASELINE=='unknown': raise RuntimeError('KIANOS_BASELINE_MAIN must be pinned')
    return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])


def select_active(store,o,op):
    rows=active(store,o)
    if op.get('sid'):
        hits=[x for x in rows if x.get('sense_id')==op['sid']]
    else:
        hits=list(rows)
        if op.get('pos'): hits=[x for x in hits if x.get('pos')==op['pos']]
        if op.get('match'):
            q=op['match'].lower(); hits=[x for x in hits if q in (str(x.get('definition_en',''))+' '+str(x.get('definition_cn',''))).lower()]
    if len(hits)!=1: raise RuntimeError(f'ACTIVE_SELECTOR_NOT_UNIQUE o{o:04d} op={op} hits={len(hits)}')
    return hits[0]


def apply_op(store,o,op,sense_touched,explicit_core):
    k=op['kind']
    if k=='rewrite':
        s=select_active(store,o,op); sid=s['sense_id']
        store.put_existing(o,sid,cn=op.get('cn'),en=op.get('en'),pos=op.get('new_pos'),level=op.get('level'),pattern=op.get('pattern'))
        if op.get('register') or op.get('usage_note') or op.get('writing_safe') is not None:
            rt.set_sense_usage(store,o,sid,note=op.get('usage_note'),register=op.get('register'),level=op.get('level'),writing_safe=op.get('writing_safe'))
        sense_touched.add(o)
    elif k=='new':
        sid=store.new(o,op['branch'],op['pos'],op['cn'],op['en'],level=op.get('level','L2'),pattern=op.get('pattern',''))
        if op.get('register') or op.get('usage_note') or op.get('writing_safe') is not None:
            rt.set_sense_usage(store,o,sid,note=op.get('usage_note'),register=op.get('register'),level=op.get('level','L2'),writing_safe=op.get('writing_safe'))
        sense_touched.add(o)
    elif k=='form':
        rt.set_form_identity(store,o,AUTHORITY,op['type'],copy.deepcopy(op['boundaries']))
        for alias in op.get('aliases',[]): rt.add_lookup_alias(store,o,alias)
    elif k=='core':
        store.core(o,cn=op['cn'],en=op['en']); explicit_core.add(o)
    else:
        raise RuntimeError(f'UNKNOWN_PATCH_KIND {k}')


def validate_manifest():
    src=source_set(); files,patches=load_patches(); keys=set(patches)
    if len(src)!=35: raise RuntimeError(f'SOURCE_COUNT_DRIFT {len(src)}')
    if len(files)!=2: raise RuntimeError(f'MANIFEST_FILE_COUNT_DRIFT {len(files)}')
    if keys!=src: raise RuntimeError(f'MANIFEST_COVERAGE_DRIFT missing={sorted(src-keys)} extra={sorted(keys-src)}')
    for o,row in patches.items():
        if not row.get('ops'): raise RuntimeError(f'EMPTY_PATCH o{o:04d}')
    return {'sources':35,'patches':len(keys),'manifest_files':2}


def checkpoint_sources(i):
    lo,hi=BOUNDARIES[i]
    return lo,hi,tuple(sorted(o for o in source_set() if lo<=o<=hi))


def apply_checkpoint(i):
    validate_manifest(); _,patches=load_patches(); lo,hi,src=checkpoint_sources(i)
    store=base.Store(); store.extra_changed_paths=set(); sense_touched=set(); explicit_core=set()
    for o in src:
        for op in patches[o]['ops']: apply_op(store,o,op,sense_touched,explicit_core)
    for o in sorted(sense_touched-explicit_core): rt.rebuild_core_from_active(store,o)
    store.finalize()
    natural,relations,report=natural_owner.build()
    if report.get('status')!='PASS': raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    changed=set(store.changed_word_ordinals)
    for o in sorted(changed): natural_owner.dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
    rel_ids=set()
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
    receipt={
      'schema':'kianos.lexical.forward_shard_receipt.v3',
      'status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION',
      'authority':AUTHORITY,
      'issue':303,
      'package':[7875,7946],
      'shard':[lo,hi],
      'reviewed_owner_count':hi-lo+1,
      'semantic_source_ordinals':list(src),
      'semantic_source_count':len(src),
      'changed_word_ordinals':sorted(changed),
      'out_of_range_dependency_ordinals':out_remote,
      'new_semantic_branch_ids':sorted(set(store.new_stable_sense_ids)),
      'relation_ids_materialized':sorted(x for x in rel_ids if x),
      'readback':{
        'all_owner_views':'PASS',
        'semantic_sources':'PASS',
        'no_change_byte_guard':'PASS',
        'natural_owner_registry_audit':'PASS'
      }
    }
    path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
    path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'CHECKPOINT_PASS {i+1}/2 o{lo:04d}-o{hi:04d} sources={len(src)} changed={len(changed)} remote={out_remote}')


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--validate-manifest',action='store_true'); ap.add_argument('--checkpoint',type=int); a=ap.parse_args()
    if a.validate_manifest:
        print('MANIFEST_COVERAGE_PASS',json.dumps(validate_manifest(),sort_keys=True)); return
    if a.checkpoint is None or not 0<=a.checkpoint<=1: raise SystemExit('pass --validate-manifest or --checkpoint 0..1')
    apply_checkpoint(a.checkpoint)

if __name__=='__main__': main()
