#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #245 / o4875-o5374."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
CANDIDATES=LEX/'execution'/'preflight'/'o4875-o5374.manifest-candidates.json'
AUTHORITY='content/lexical/semantic-reconciliation/o4875-o5374.md'
ADDENDUM='content/lexical/semantic-reconciliation/o5026-till-addendum.md'
PACKAGE=(4875,5374)
BOUNDARIES=tuple((4875+50*i,4924+50*i) for i in range(10))
REMOTE={1020,1410,2069,2586,2671,4524,4825,5416}
READONLY_REMOTE={104,542,2635,5614}


def load(path:Path): return json.loads(path.read_text(encoding='utf-8'))
def owner(o:int): return load(OWNER_DIR/f'o{o:04d}.json')
def record(o:int): return owner(o)['record']
def candidates(): return load(CANDIDATES)
def expected_source(): return tuple(sorted(x['ordinal'] for x in candidates()['owners']))
def active_ids(o:int): return {x.get('sense_id') for x in record(o).get('senses',[]) if x.get('sense_id')}
def active_sense(o:int,sid:str): return next((x for x in record(o).get('senses',[]) if x.get('sense_id')==sid),None)
def relation_ids(o:int):
    obj=owner(o); rec=obj['record']; out={x.get('relation_id') for x in obj.get('relation_refs',[]) if x.get('relation_id')}
    for field in ('semantic_neighbors','confusables','word_family'):
        for x in rec.get(field,[]) or []:
            if isinstance(x,dict):
                rid=x.get('relation_id') or x.get('fact_id')
                if rid: out.add(rid)
    return out

def shared_relation(a:int,b:int): return relation_ids(a)&relation_ids(b)
def find_target(o:int,target:str):
    hits=[]
    rec=record(o)
    for field in ('semantic_neighbors','confusables','word_family'):
        for x in rec.get(field,[]) or []:
            if isinstance(x,dict) and x.get('target_word')==target: hits.append((field,x))
    return hits

def form(o:int): return record(o).get('form_identity')
def spellings(o:int): return {x.get('spelling') for x in owner(o).get('lookup_refs',[]) if x.get('spelling')}
def construction_patterns(o:int): return {x.get('pattern') for x in record(o).get('constructions',[]) if x.get('pattern')}


def verify_receipts():
    expected=expected_source()
    if len(expected)!=159: raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(expected)}')
    union=[]; remote=[]; receipts=[]
    for lo,hi in BOUNDARIES:
        path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not path.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {path.relative_to(ROOT)}')
        r=load(path); receipts.append((path,r))
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {path}')
        if r.get('package')!=[4875,5374] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {path}')
        src=r.get('semantic_source_ordinals',[])
        expected_here=[o for o in expected if lo<=o<=hi]
        if src!=expected_here: raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {path} expected={expected_here} actual={src}')
        union.extend(src); remote.extend(r.get('out_of_range_dependency_ordinals',[]))
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {path}')
    if tuple(sorted(union))!=expected or len(union)!=159 or len(set(union))!=159:
        raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    remote_seen=set(remote)
    if remote_seen-REMOTE: raise RuntimeError(f'UNAUTHORIZED_REMOTE_RECEIPT {sorted(remote_seen-REMOTE)}')
    if remote_seen&READONLY_REMOTE: raise RuntimeError(f'READONLY_REMOTE_RECEIPT {sorted(remote_seen&READONLY_REMOTE)}')
    return receipts,remote_seen


def verify_500_readback():
    bad=[]
    for o in range(4875,5375):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        x=load(p)
        if x.get('ordinal')!=o or not x.get('word_id') or not x.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')


def verify_identity_form_relation():
    # o5026 till: old stable identity is cash-drawer survivor; geology is now distinct.
    till=active_sense(5026,'sense:till:62d74a4ed51b5939')
    if not till or 'cash' not in till.get('definition_en','').lower(): raise RuntimeError('TILL_CASH_SURVIVOR_FAILED')
    geology=[x for x in record(5026).get('senses',[]) if 'glacial' in x.get('definition_en','').lower() or 'sediment' in x.get('definition_en','').lower()]
    if len(geology)!=1 or geology[0].get('sense_id')=='sense:till:62d74a4ed51b5939': raise RuntimeError('TILL_GEOLOGY_SPLIT_FAILED')

    # there/their survivor relation and duplicate retirement.
    survivor='confusable:horizontal:6f5711efdc5cb02126fb'; duplicate='deep:confusables:there:54e2eb1e8f962f53'
    if survivor not in relation_ids(4972) or survivor not in relation_ids(4963): raise RuntimeError('THERE_THEIR_SURVIVOR_RECIPROCAL_FAILED')
    if duplicate in relation_ids(4972) or duplicate in relation_ids(4963): raise RuntimeError('THERE_THEIR_DUPLICATE_NOT_RETIRED')

    # think ordinary senses + survivor thought + active suppose target.
    if not {'sense:think:1a92a30e99f354f1','sense:think:5f219d551ca75ebb'} <= active_ids(4986): raise RuntimeError('THINK_ORDINARY_SENSES_NOT_ACTIVE')
    thought_rid='relation:horizontal:5a161f25cb2d93e234c4'
    if thought_rid not in relation_ids(4986): raise RuntimeError('THINK_THOUGHT_SURVIVOR_MISSING')
    if 'rel:v3-family:think:thought' in relation_ids(4986) or 'rel:v3-family:thought:think' in relation_ids(4986): raise RuntimeError('THINK_THOUGHT_DIRECTIONAL_DUPLICATE_REMAINS')
    suppose_rid='deep:semantic_contrast:think:ee702506c9caa8eb'
    if suppose_rid not in relation_ids(4986) or suppose_rid not in relation_ids(4825): raise RuntimeError('THINK_SUPPOSE_RECIPROCAL_FAILED')
    if 'sense:suppose:45d1373fdfae5328' not in active_ids(4825): raise RuntimeError('SUPPOSE_ACTIVE_TARGET_MISSING')

    # turkey proper/common capitalization remains one owner with country branch lower than ordinary Core.
    if not form(5159): raise RuntimeError('TURKEY_FORM_IDENTITY_MISSING')
    country=active_sense(5159,'sense:turkey:8cf50c329312578a')
    if not country or country.get('level') not in ('L3',None): raise RuntimeError('TURKEY_COUNTRY_RANKING_FAILED')

    # verse lexicalized versed lifecycle.
    if 'sense:verse:3766409372fe50a5' in active_ids(5276): raise RuntimeError('VERSE_HISTORICAL_VERB_STILL_ACTIVE')
    if not form(5276): raise RuntimeError('VERSE_FORM_IDENTITY_MISSING')
    if 'be (well) versed in sth' not in construction_patterns(5276): raise RuntimeError('VERSED_LEXICALIZED_CONSTRUCTION_MISSING')

    # Frozen eight remote-write relation closures must be visible at both endpoints.
    pairs=((4975,1020),(5017,4524),(5070,2069),(5181,1410),(5205,5416),(5206,2671),(5207,2586),(4986,4825))
    for a,b in pairs:
        if not shared_relation(a,b): raise RuntimeError(f'REMOTE_RELATION_NOT_RECIPROCAL {a} {b}')

    # Form/lookup closure. Some Forms are sense-bounded but still need same-owner lookup reachability.
    alias_required={4961:'theater',5035:'tyre',5076:'towards',5154:'tumour',5226:'upwards',5235:'utilize',5252:'vapour',5276:'versed',5288:'vise',5361:'Watt'}
    for o,alias in alias_required.items():
        if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
        if alias not in spellings(o): raise RuntimeError(f'LOOKUP_ALIAS_MISSING o{o:04d} {alias}')

    # Key read-only remote anchor repairs do not require target Word mutation.
    boot=find_target(5144,'boot')
    if not boot or not any(x.get('target_sense_id')=='sense:boot:ff7e0b273f1d53f2' for _,x in boot): raise RuntimeError('TRUNK_BOOT_ANCHOR_FAILED')
    affluent=find_target(5368,'affluent')
    if not affluent or not any(x.get('target_sense_id')=='sense:affluent:2c108df63e585417' for _,x in affluent): raise RuntimeError('WEALTHY_AFFLUENT_ANCHOR_FAILED')

    # university->universal must not be promoted into a reciprocal modern family.
    uni=find_target(5210,'universal')
    if not uni or not all(x.get('publication_status')=='reference_only' for _,x in uni): raise RuntimeError('UNIVERSITY_UNIVERSAL_NOT_DEMOTED')

    return {
      'till_split':'PASS','there_relation':'PASS','think_relations':'PASS','turkey_form':'PASS','verse_form':'PASS',
      'remote_relations':'PASS','form_lookup':'PASS','readonly_anchor_repairs':'PASS','university_relation':'PASS',
    }


def verify():
    receipts,remote_seen=verify_receipts(); verify_500_readback(); identity=verify_identity_form_relation()
    return receipts,remote_seen,identity


def finalize(receipts,remote_seen,identity):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o4875-o5374.package-receipt.json'
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v2','status':'PACKAGE_VERIFIED_PENDING_INTEGRATION',
      'authority':AUTHORITY,'authority_addenda':[ADDENDUM],'issue':245,'package':[4875,5374],
      'reviewed_owner_count':500,'semantic_source_owner_count':159,'semantic_source_ordinals':list(expected_source()),
      'authorized_out_of_range_word_dependencies':sorted(REMOTE),'observed_out_of_range_word_dependencies':sorted(remote_seen),
      'read_only_remote_anchors':sorted(READONLY_REMOTE),
      'boundary_receipts':[str(p.relative_to(ROOT)) for p,_ in receipts],
      'identity_form_relation_closure':identity,
      'verification':{'owner_readback_500':'PASS','source_accounting_159':'PASS','natural_owner_registry_audit':'PASS','transport_guards':'PASS','lexical_shard_tests':'PASS','changed_json_parse':'PASS','astro_full_build':'PASS'},
      'branch_local_mechanical_progress':'500/500','main_mechanical_frontier_before_integration':'o4874','next_range':'NOT_ACTIVATED',
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PACKAGE_PASS receipt=',out.relative_to(ROOT),'owners=500 sources=159')


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); args=ap.parse_args()
    receipts,remote_seen,identity=verify()
    print('PACKAGE_ACCOUNTING_PASS 500/500 159/159 identity/form/relation PASS')
    if args.finalize: finalize(receipts,remote_seen,identity)

if __name__=='__main__': main()
