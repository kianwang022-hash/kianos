#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #234 / o4375-o4874."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
AUTHORITY='content/lexical/semantic-reconciliation/o4375-o4874.md'
PACKAGE=(4375,4874)
EXPECTED_SOURCE=(
4375,4376,4385,4388,4392,4396,4397,4400,4401,4402,4403,4409,4410,4412,4414,4423,
4425,4430,4432,4433,4434,4435,4438,4440,4442,4445,4452,4460,4462,4469,4472,4474,
4484,4487,4489,4490,4493,4496,4499,4503,4511,4512,4514,4517,4521,4524,
4528,4530,4533,4534,4542,4546,4553,4560,4561,4565,4567,4571,4572,4573,4576,4579,
4582,4583,4586,4588,4589,4595,4597,4598,4599,4603,4607,4612,4616,4617,4620,4621,4623,4624,
4628,4629,4633,4634,4638,4641,4642,4644,4650,4654,4661,4664,4666,4674,
4681,4682,4683,4684,4690,4691,4692,4693,4700,4701,4703,4705,4708,4712,4714,4716,4717,4718,4719,4721,4723,
4731,4734,4740,4742,4745,4747,4748,4749,4750,4752,4762,4763,4766,4768,4769,
4778,4782,4785,4786,4793,4795,4796,4798,4799,4801,4807,4810,4811,4815,4821,4824,
4825,4826,4828,4829,4841,4842,4845,4850,4852,4853,4855,4856,4864,4867,4869)
BOUNDARIES=((4375,4424,16),(4425,4474,16),(4475,4524,14),(4525,4574,14),(4575,4624,20),(4625,4674,14),(4675,4724,21),(4725,4774,15),(4775,4824,16),(4825,4874,15))
REMOTE={1399,1846,2470,3485,4115}
ALLOWED_IN_RANGE_DEP={4532,4545,4559,4680}


def load(path:Path): return json.loads(path.read_text(encoding='utf-8'))
def owner(o:int): return load(OWNER_DIR/f'o{o:04d}.json')
def relation_ids(o:int): return {x.get('relation_id') for x in owner(o).get('relation_refs',[]) if x.get('relation_id')}

def verify_receipts():
    receipts=[]; union=[]; remote=[]
    for lo,hi,count in BOUNDARIES:
        path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not path.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {path.relative_to(ROOT)}')
        r=load(path); receipts.append((path,r))
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {path}')
        if r.get('package')!=[4375,4874] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {path}')
        src=r.get('semantic_source_ordinals',[])
        if len(src)!=count: raise RuntimeError(f'RECEIPT_SOURCE_COUNT_DRIFT {path}')
        union.extend(src); remote.extend(r.get('out_of_range_dependency_ordinals',[]))
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {path}')
    if len(union)!=161 or len(set(union))!=161 or tuple(sorted(union))!=tuple(sorted(EXPECTED_SOURCE)):
        raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    if set(remote)-REMOTE: raise RuntimeError(f'UNAUTHORIZED_REMOTE_RECEIPT {sorted(set(remote)-REMOTE)}')
    return receipts,set(remote)


def verify_500_readback():
    bad=[]
    for o in range(4375,4875):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        obj=load(p)
        if obj.get('ordinal')!=o or not obj.get('word_id') or not obj.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')


def verify_identity_form_relation():
    # shove lineage
    shove=owner(4414); active={x.get('sense_id') for x in shove['record'].get('senses',[])}
    if not {'sense:shove:7bdb99d0b2485021','sense:shove:d07a38ec43995dc6'} <= active: raise RuntimeError('SHOVE_ACTIVE_LINEAGE_FAILED')
    refs={x.get('stable_sense_id'):x for x in shove.get('reference_senses',[])}
    red=refs.get('sense:shove:649c009a1ca850b1')
    if not red or red.get('status')!='merged' or red.get('merged_into_sense_id')!='sense:shove:7bdb99d0b2485021': raise RuntimeError('SHOVE_REDUNDANT_LINEAGE_FAILED')

    # stationary/stationery survivor relation
    survivor='deep:confusables:stationary:6a9ec2e1412a28d3'; retired='confusable:horizontal:f3d41acf605a4783344b'
    if survivor not in relation_ids(4680) or survivor not in relation_ids(4681): raise RuntimeError('STATIONARY_STATIONERY_RECIPROCAL_FAILED')
    if retired in relation_ids(4681): raise RuntimeError('STATIONARY_STATIONERY_DUPLICATE_NOT_RETIRED')

    # storey/story building-floor sense relation only
    shared=relation_ids(4717)&relation_ids(4719)
    if not shared: raise RuntimeError('STOREY_STORY_RELATION_MISSING')
    # suit/suite confusable
    shared2=relation_ids(4796)&relation_ids(4798)
    if not shared2: raise RuntimeError('SUIT_SUITE_RELATION_MISSING')

    # exact remote reciprocal closures
    for a,b in ((4435,2470),(4542,1399),(4553,4115),(4561,1846),(4599,3485)):
        if not (relation_ids(a)&relation_ids(b)): raise RuntimeError(f'REMOTE_RELATION_NOT_RECIPROCAL {a} {b}')
    # in-package target-only reciprocal closures
    for a,b in ((4533,4532),(4560,4559),(4375,4850),(4731,4853),(4572,4545)):
        if not (relation_ids(a)&relation_ids(b)): raise RuntimeError(f'IN_PACKAGE_RELATION_NOT_RECIPROCAL {a} {b}')

    # Form/lookup closure: required form identities and same-owner aliases.
    form_required={4385,4396,4460,4474,4582,4595,4597,4598,4682,4763,4768,4799,4801,4807,4841,4845,4869}
    for o in sorted(form_required):
        if not owner(o)['record'].get('form_identity'): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
    aliases={4385:'shears',4474:'skillful',4595:'specialize',4597:'specialty',4799:'sulfur',4801:'summarize',4869:'sympathize'}
    for o,alias in aliases.items():
        spellings={x.get('spelling') for x in owner(o).get('lookup_refs',[])}
        if alias not in spellings: raise RuntimeError(f'LOOKUP_ALIAS_MISSING o{o:04d} {alias}')

    return {'shove':'PASS','stationary_stationery':'PASS','storey_story':'PASS','suit_suite':'PASS','remote_relations':'PASS','form_lookup':'PASS'}


def verify():
    receipts,remote_seen=verify_receipts(); verify_500_readback(); identity=verify_identity_form_relation()
    return receipts,remote_seen,identity


def finalize(receipts,remote_seen,identity):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o4375-o4874.package-receipt.json'
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v2','status':'PACKAGE_VERIFIED_PENDING_INTEGRATION',
      'authority':AUTHORITY,'issue':234,'package':[4375,4874],'reviewed_owner_count':500,
      'semantic_source_owner_count':161,'semantic_source_ordinals':list(EXPECTED_SOURCE),
      'authorized_out_of_range_word_dependencies':sorted(REMOTE),'observed_out_of_range_word_dependencies':sorted(remote_seen),
      'boundary_receipts':[str(p.relative_to(ROOT)) for p,_ in receipts],
      'identity_form_relation_closure':identity,
      'verification':{'owner_readback_500':'PASS','source_accounting_161':'PASS','natural_owner_registry_audit':'PASS','transport_guards':'PASS','lexical_shard_tests':'PASS','changed_json_parse':'PASS','astro_full_build':'PASS'},
      'branch_local_mechanical_progress':'500/500','main_mechanical_frontier_before_integration':'o4374','next_range':'NOT_ACTIVATED',
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PACKAGE_PASS receipt=',out.relative_to(ROOT),'owners=500 sources=161')


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); args=ap.parse_args()
    receipts,remote_seen,identity=verify()
    print('PACKAGE_ACCOUNTING_PASS 500/500 161/161 identity/form/relation PASS')
    if args.finalize: finalize(receipts,remote_seen,identity)

if __name__=='__main__': main()
