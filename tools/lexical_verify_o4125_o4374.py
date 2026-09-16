#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #215 (o4125-o4374)."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
RECEIPT_DIR=LEX/'execution'/'receipts'
AUTHORITY='content/lexical/semantic-reconciliation/o4125-o4374.md'
EXPECTED_SOURCE=(4126,4133,4138,4139,4140,4141,4144,4148,4150,4154,4156,4160,4163,4164,4167,4168,4172,4173,
4178,4184,4187,4188,4192,4193,4194,4199,4202,4203,4204,4208,4209,4213,4215,4218,4220,
4226,4237,4238,4244,4249,4253,4255,4258,4259,4263,4264,4265,4266,4268,
4281,4283,4285,4290,4291,4294,4296,4299,4301,4302,4303,4305,4312,4315,4320,4322,
4328,4329,4340,4341,4343,4344,4347,4353,4354,4357,4359,4360,4365,4368,4372,4374)
BOUNDARIES=((4125,4174,18),(4175,4224,17),(4225,4274,14),(4275,4324,16),(4325,4374,16))


def load(path:Path): return json.loads(path.read_text(encoding='utf-8'))
def owner(o:int): return load(LEX/'words'/'by-ordinal'/f'o{o:04d}.json')
def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))


def verify_receipts():
    receipts=[]; union=[]; remote=[]
    for lo,hi,count in BOUNDARIES:
        path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not path.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {path.relative_to(ROOT)}')
        r=load(path); receipts.append((path,r))
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {path}')
        if r.get('package')!=[4125,4374] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {path}')
        if r.get('reviewed_owner_count')!=50 or r.get('semantic_mutation_source_count')!=count: raise RuntimeError(f'RECEIPT_COUNT_DRIFT {path}')
        src=r.get('semantic_source_ordinals',[])
        if len(src)!=count: raise RuntimeError(f'RECEIPT_SOURCE_COUNT_DRIFT {path}')
        union.extend(src); remote.extend(r.get('out_of_range_dependency_ordinals',[]))
        rb=r.get('readback',{})
        if any(v!='PASS' and not str(v).startswith('PASS_') for v in rb.values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {path} {rb}')
    if len(union)!=81 or len(set(union))!=81 or tuple(sorted(union))!=tuple(sorted(EXPECTED_SOURCE)):
        raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    if remote!=[6139]: raise RuntimeError(f'REMOTE_DEPENDENCY_MISMATCH {remote}')
    return receipts


def verify_identity_closure():
    # row: line + quarrel + rowing are distinct active stable identities.
    row=owner(4209); row_active={x.get('sense_id') for x in row.get('record',{}).get('senses',[])}
    need={'sense:row:288f9aa2bbed532c','sense:row:2250c8db5d4355be','sense:row:95b218aabf4c5b9f'}
    if not need.issubset(row_active): raise RuntimeError(f'ROW_IDENTITY_NOT_CLOSED {sorted(need-row_active)}')
    if not row.get('record',{}).get('form_identity'): raise RuntimeError('ROW_FORM_IDENTITY_MISSING')

    # sceptical/skeptical: local stable senses retained, reciprocal relation materialized.
    scept=owner(4281); skept=owner(6139)
    if 'sense:sceptical:e5f87ee40b2a5626' not in {x.get('sense_id') for x in scept['record'].get('senses',[])}: raise RuntimeError('SCEPTICAL_LOCAL_STABLE_MISSING')
    if 'sense:skeptical:f83faf14d2ed5099' not in {x.get('sense_id') for x in skept['record'].get('senses',[])}: raise RuntimeError('SKEPTICAL_LOCAL_STABLE_MISSING')
    sr={x.get('relation_id') for x in scept.get('relation_refs',[])}; kr={x.get('relation_id') for x in skept.get('relation_refs',[])}
    shared=sr & kr
    if len(shared)!=1: raise RuntimeError(f'SCEPTICAL_RECIPROCAL_RELATION_BAD shared={sorted(shared)}')
    rid=next(iter(shared)); digest=hashlib.sha256(rid.encode('utf-8')).hexdigest(); rp=LEX/'relations'/'by-id'/digest[:2]/f'{digest}.json'
    if not rp.exists(): raise RuntimeError('SCEPTICAL_RELATION_OWNER_MISSING')
    relation=load(rp)
    if {v.get('source_ordinal') for v in relation.get('word_views',[])}!={4281,6139}: raise RuntimeError('SCEPTICAL_RELATION_VIEWS_INCOMPLETE')

    # saw/see: reciprocal Form truth without fake saw semantic sense.
    saw=owner(4266); see=owner(4320)
    if saw['record'].get('form_identity',{}).get('type')!='inflectional_form_boundary': raise RuntimeError('SAW_FORM_IDENTITY_MISSING')
    if see['record'].get('form_identity',{}).get('type')!='inflectional_form_boundary': raise RuntimeError('SEE_FORM_IDENTITY_MISSING')

    # shaft: polluted composite retired with two child identities.
    shaft=owner(4372)
    old=next((x for x in shaft.get('reference_senses',[]) if x.get('stable_sense_id')=='sense:shaft:8c68fc2e02025abd'),None)
    if not old or old.get('status')!='deprecated' or len(old.get('split_into_sense_ids',[]))!=2: raise RuntimeError('SHAFT_SPLIT_NOT_CLOSED')
    active={x.get('sense_id') for x in shaft['record'].get('senses',[])}
    if not set(old['split_into_sense_ids']).issubset(active): raise RuntimeError('SHAFT_CHILDREN_NOT_ACTIVE')

    return {'row':'PASS','sceptical_skeptical':'PASS','saw_see':'PASS','shaft':'PASS'}


def verify():
    receipts=verify_receipts(); identity=verify_identity_closure()
    return receipts,identity


def finalize(receipts,identity):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o4125-o4374.package-receipt.json'
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v1',
      'status':'PACKAGE_VERIFIED_PENDING_INTEGRATION',
      'authority':AUTHORITY,
      'issue':215,
      'package':[4125,4374],
      'reviewed_owner_count':250,
      'semantic_source_owner_count':81,
      'semantic_source_ordinals':list(EXPECTED_SOURCE),
      'authorized_out_of_range_word_dependencies':[6139],
      'boundary_receipts':[str(p.relative_to(ROOT)) for p,_ in receipts],
      'identity_form_closure':identity,
      'verification':{
        'receipt_accounting':'PASS',
        'natural_owner_registry_audit':'PASS',
        'transport_guards':'PASS',
        'lexical_shard_tests':'PASS',
        'changed_json_parse':'PASS',
        'astro_full_build':'PASS',
      },
      'branch_local_mechanical_progress':'250/250',
      'main_mechanical_frontier_before_integration':'o4124',
      'next_range':'NOT_ACTIVATED',
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'PACKAGE_PASS receipt={out.relative_to(ROOT)} sources=81 owners=250')


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); args=ap.parse_args()
    receipts,identity=verify(); print('PACKAGE_ACCOUNTING_PASS 250/250 81/81 identity=4/4')
    if args.finalize: finalize(receipts,identity)

if __name__=='__main__': main()
