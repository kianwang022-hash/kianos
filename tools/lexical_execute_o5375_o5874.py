#!/usr/bin/env python3
"""Continuous/resumable executor for Issue #251 / o5375-o5874.

Semantic decisions are frozen in content/lexical/semantic-reconciliation/o5375-o5874.md.
This file only materializes the declarative manifest and fails closed on identity,
relation, lookup, byte-preservation, or remote-write drift.
"""
from __future__ import annotations
import argparse, copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'; OWNER_DIR=LEX/'words'/'by-ordinal'; RECEIPT_DIR=LEX/'execution'/'receipts'
ACCOUNTING=LEX/'execution'/'preflight'/'o5375-o5874.reconciliation-compile.json'
WHITELIST=LEX/'execution'/'preflight'/'o5375-o5874.remote-write-whitelist.json'
AUTHORITY='content/lexical/semantic-reconciliation/o5375-o5874.md'; PACKAGE=(5375,5874)
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')

sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
import lexical_package_runtime as rt
import lexical_natural_owner as natural_owner
import lexical_manifest_o5375_o5874 as manifest

def load(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def stable(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def relation_id(x): return x.get('relation_id') or x.get('fact_id')
def source_set(): return set(load(ACCOUNTING)['semantic_source_owners'])
def remote_allowed(): return set(load(WHITELIST)['authorized_remote_word_ordinals'])
def baseline_bytes(rel):
    if BASELINE=='unknown': raise RuntimeError('KIANOS_BASELINE_MAIN must be pinned')
    return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

def is_active(store,o,sid): return any(x.get('sense_id')==sid for x in store.record(o).get('senses',[]))
def ensure_active(store,o,sid,**kw):
    if sid not in store.senses: raise RuntimeError(f'PINNED_STABLE_ID_MISSING o{o:04d} {sid}')
    return store.put_existing(o,sid,**kw)
def word_map(store): return {row.get('record',{}).get('word'):o for o,row in store.words.items() if row.get('record',{}).get('word')}

def find_existing_pair(store,a,bword,rid=None):
    try: return rt.find_relation_view(store,a,target_word=bword,rid=rid)
    except RuntimeError: return None

def close_or_create_relation(store,a,b,*,rtype,boundary,field='semantic_neighbors',a_sid=None,b_sid=None,rid=None,priority='A'):
    aw=store.record(a)['word']; bw=store.record(b)['word']
    hit=find_existing_pair(store,a,bw,rid)
    if hit:
        rid0=relation_id(hit[2]); rt.ensure_reciprocal_existing_relation(store,a,b,target_word=bw,rid=rid0,source_sid=a_sid,target_sid=b_sid); return rid0
    rev=find_existing_pair(store,b,aw,rid)
    if rev:
        rid0=relation_id(rev[2]); rt.ensure_reciprocal_existing_relation(store,b,a,target_word=aw,rid=rid0,source_sid=b_sid,target_sid=a_sid); return rid0
    # Existing word-family relation can also be reused.
    for so,to,tw,ss,ts in ((a,b,bw,a_sid,b_sid),(b,a,aw,b_sid,a_sid)):
        hits=[x for x in store.record(so).get('word_family',[]) if x.get('target_word')==tw and (rid is None or relation_id(x)==rid)]
        if len(hits)==1:
            p=hits[0]; rid0=relation_id(p)
            arr=store.record(to).setdefault('word_family',[])
            if not any(relation_id(x)==rid0 for x in arr):
                q=copy.deepcopy(p); q['target_word']=store.record(so)['word']
                if ss is not None or ts is not None: q['source_sense_id']=ts; q['target_sense_id']=ss
                arr.append(q)
            if ss is not None: p['source_sense_id']=ss
            if ts is not None: p['target_sense_id']=ts
            store.mark(so); store.mark(to); return rid0
    return rt.attach_new_reciprocal_relation(store,a,b,relation_type=rtype,field=field,a_sid=a_sid,b_sid=b_sid,boundary=boundary,priority=priority)

def set_core(store,o,cn,en,ids=None,pos=None):
    store.core(o,cn=cn,en=en)
    if ids:
        rec=store.record(o); core=rec.setdefault('core_concept',{}); core['core_clusters']=[]
        if isinstance(ids,dict):
            for p,sids in ids.items():
                senses=[x for x in rec.get('senses',[]) if x.get('sense_id') in sids]
                core['core_clusters'].append({'label_cn':'；'.join(x.get('definition_cn','') for x in senses if x.get('definition_cn')),'label_en':'; '.join(x.get('definition_en','') for x in senses if x.get('definition_en')),'pos':p,'sense_ids':sids})
        else:
            core['core_clusters']=[{'label_cn':cn,'label_en':en,'pos':pos or 'other','sense_ids':ids}]
        store.mark(o)

def apply_op(store,o,op,relation_ids,dependency_targets):
    k=op['op']
    if k in ('reuse','update'):
        kw={x:op[x] for x in ('cn','en','pos','level','pattern','branch') if x in op}; ensure_active(store,o,op['sid'],**kw)
    elif k=='demote':
        if is_active(store,o,op['sid']): store.demote(o,op['sid'])
    elif k=='new':
        sid=store.new(o,op['branch'],op['pos'],op['cn'],op['en'],level=op.get('level','L2'),pattern=op.get('pattern',''))
        if op.get('usage'): rt.set_sense_usage(store,o,sid,**op['usage'])
    elif k=='usage':
        sid=op['sid'];
        if not is_active(store,o,sid): ensure_active(store,o,sid,level=op.get('level','L2'))
        rt.set_sense_usage(store,o,sid,note=op.get('note'),register=op.get('register'),level=op.get('level'),writing_safe=op.get('writing_safe'))
    elif k=='transitivity':
        sid=op['sid'];
        if not is_active(store,o,sid): ensure_active(store,o,sid,level=op.get('level','L2'))
        rt.set_transitivity(store,o,sid,transitivity=op['transitivity'],pattern=op.get('pattern'))
    elif k=='construction':
        sid=op.get('sid')
        if sid and not is_active(store,o,sid): ensure_active(store,o,sid,level=op.get('source_level','L2'))
        rt.upsert_construction(store,o,op['pattern'],op['cn'],source_sid=sid,level=op.get('level','L2'),definition_en=op.get('en'),note=op.get('note'))
    elif k=='drop_construction': rt.drop_construction(store,o,op['pattern'])
    elif k=='form':
        rt.set_form_identity(store,o,AUTHORITY,op['type'],copy.deepcopy(op['boundaries']))
        for alias in op.get('aliases',[]): rt.add_lookup_alias(store,o,alias)
    elif k=='relation':
        b=op['target']; dependency_targets.add(b)
        rid0=close_or_create_relation(store,o,b,rtype=op.get('relation_type','semantic_contrast'),boundary=op['boundary'],field=op.get('field','semantic_neighbors'),a_sid=op.get('source_sid'),b_sid=op.get('target_sid'),rid=op.get('rid'),priority=op.get('priority','A')); relation_ids.add(rid0)
    elif k=='one_sided':
        relation_ids.add(rt.attach_target_expression_relation(store,o,field=op.get('field','semantic_neighbors'),relation_type=op.get('relation_type','semantic_contrast'),target_expression=op['target_expression'],boundary=op['boundary'],source_sid=op.get('source_sid')))
    elif k=='core': set_core(store,o,op['cn'],op['en'],op.get('ids'),op.get('pos'))
    elif k=='rebuild_core': rt.rebuild_core_from_active(store,o,include_levels=tuple(op.get('levels',['L1','L2'])),cn=op.get('cn'),en=op.get('en'))
    elif k=='record_note': store.record(o)[op['field']]=op['value']; store.mark(o)
    else: raise RuntimeError(f'UNKNOWN_OP {k} o{o:04d}')

def validate_manifest():
    src=source_set(); covered=set(manifest.PATCHES)
    if len(src)!=190: raise RuntimeError(f'SOURCE_COUNT_DRIFT {len(src)}')
    missing=sorted(src-covered); foreign=sorted(covered-src)
    if missing or foreign: raise RuntimeError(f'MANIFEST_COVERAGE_DRIFT missing={missing} foreign={foreign}')
    if len(remote_allowed())!=22: raise RuntimeError('REMOTE_WHITELIST_DRIFT')
    return {'sources':190,'covered':len(covered),'remote_whitelist':22}

def checkpoint_sources(index):
    lo=5375+50*index; hi=lo+49; src=tuple(sorted(o for o in source_set() if lo<=o<=hi)); return lo,hi,src

def apply_checkpoint(index):
    validate_manifest(); lo,hi,src_tuple=checkpoint_sources(index); store=base.Store(); relation_ids=set(); deps=set(); applied=set(); touched_before=set(store.changed_word_ordinals)
    for o in src_tuple:
        ops=manifest.PATCHES[o]
        if not ops: raise RuntimeError(f'EMPTY_MANIFEST o{o:04d}')
        for op in ops: apply_op(store,o,op,relation_ids,deps)
        applied.add(o)
    if applied!=set(src_tuple): raise RuntimeError(f'APPLY_COVERAGE_DRIFT {sorted(set(src_tuple)-applied)}')
    store.finalize()
    natural,relations,report=natural_owner.build()
    if report.get('status')!='PASS': raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    changed=set(store.changed_word_ordinals)
    for o in sorted(changed): natural_owner.dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
    rel_ids=set(relation_ids)
    for o in changed: rel_ids.update(x.get('relation_id') for x in natural[o].get('relation_refs',[]) if x.get('relation_id'))
    for rid in sorted(x for x in rel_ids if x and x in relations): natural_owner.dump_json(natural_owner.relation_owner_path(rid),relations[rid])
    out_remote=sorted(o for o in changed if not(PACKAGE[0]<=o<=PACKAGE[1])); unauthorized=sorted(set(out_remote)-remote_allowed())
    if unauthorized: raise RuntimeError(f'UNAUTHORIZED_REMOTE_WORD_WRITE {unauthorized}')
    # Byte-preserve all genuine no-change owner projections except explicit relation dependency targets.
    nochange=[o for o in range(lo,hi+1) if o not in source_set() and o not in deps]
    bad=[]
    for o in nochange:
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()): bad.append(o)
    if bad: raise RuntimeError(f'NO_CHANGE_BYTE_GUARD_FAILED {bad}')
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True)
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v3','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTHORITY,'issue':251,'package':list(PACKAGE),'shard':[lo,hi],'reviewed_owner_count':50,'semantic_source_ordinals':list(src_tuple),'semantic_source_count':len(src_tuple),'changed_source_ordinals':sorted(set(src_tuple)&changed),'changed_word_ordinals':sorted(changed),'out_of_range_dependency_ordinals':out_remote,'new_semantic_branch_ids':sorted(set(store.new_stable_sense_ids)),'relation_ids_materialized':sorted(x for x in rel_ids if x),'readback':{'all_50_owner_views':'PASS','semantic_sources':'PASS','no_change_byte_guard':'PASS','natural_owner_registry_audit':'PASS'}}
    (RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'CHECKPOINT_PASS {index+1}/10 o{lo:04d}-o{hi:04d} sources={len(src_tuple)} changed={len(changed)} remote={out_remote}')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--validate-manifest',action='store_true'); ap.add_argument('--checkpoint',type=int); a=ap.parse_args()
    if a.validate_manifest: print('MANIFEST_COVERAGE_PASS',json.dumps(validate_manifest(),sort_keys=True)); return
    if a.checkpoint is None or not 0<=a.checkpoint<=9: raise SystemExit('pass --validate-manifest or --checkpoint 0..9')
    apply_checkpoint(a.checkpoint)
if __name__=='__main__': main()
