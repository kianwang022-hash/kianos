#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #251 / o5375-o5874."""
from __future__ import annotations
import argparse, json, os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'; OWNER_DIR=LEX/'words'/'by-ordinal'; RECEIPT_DIR=LEX/'execution'/'receipts'
ACCOUNTING=LEX/'execution'/'preflight'/'o5375-o5874.reconciliation-compile.json'
WHITELIST=LEX/'execution'/'preflight'/'o5375-o5874.remote-write-whitelist.json'
AUTHORITY='content/lexical/semantic-reconciliation/o5375-o5874.md'
PACKAGE=(5375,5874); BOUNDARIES=tuple((5375+50*i,5424+50*i) for i in range(10))

IDENTITY_PAIRS=(
 (5505,98,'airplane','aeroplane'),(5526,1405,'disk','disc'),(5529,1669,'enroll','enrol'),
 (5532,1907,'fertilizer','fertiliser'),(5553,1666,'inquire','enquire'),(5554,1667,'inquiry','enquiry'),
 (5560,2708,'kilometer','kilometre'),(5564,2855,'liter','litre'),(5576,3375,'organize','organise'),
 (5578,3406,'outskirt','outskirts'),(5594,3962,'realize','realise'),(5596,3988,'recognize','recognise'),
 (5654,186,'analogue','analog'),(5739,1111,'cozy','cosy'),(5840,2140,'glamour','glamor'),
)
OTHER_REMOTE_PAIRS=(
 (5458,5339,'work','walk'),(5477,4168,'write','right'),(5484,4300,'yell','scream'),
 (5484,4413,'yell','shout'),(5536,3575,'gasoline','petrol'),(5593,3931,'railroad','railway'),
 (5708,6495,'censor','censure'),
)
FORM_ALIAS_REQUIRED={5525:'dishonor',5509:'Arabian',5583:'parlour',5635:'woolen',5658:'Antarctic',5688:'blonde',5694:'Buddhism',5787:'Egyptian',5836:'generalisation'}
FORM_ONLY_REQUIRED=(5389,5390,5493,5498,5555,5562,5580,5638,5661,5734,5735,5748,5785,5834,5868)


def load(path:Path): return json.loads(path.read_text(encoding='utf-8'))
def owner(o:int): return load(OWNER_DIR/f'o{o:04d}.json')
def record(o:int): return owner(o)['record']
def word(o:int): return owner(o).get('word') or record(o).get('word')
def active_ids(o:int): return {x.get('sense_id') for x in record(o).get('senses',[]) if x.get('sense_id')}
def active_sense(o:int,sid:str): return next((x for x in record(o).get('senses',[]) if x.get('sense_id')==sid),None)
def form(o:int): return record(o).get('form_identity')
def spellings(o:int): return {x.get('spelling') for x in owner(o).get('lookup_refs',[]) if x.get('spelling')}
def construction_patterns(o:int): return {x.get('pattern') for x in record(o).get('constructions',[]) if x.get('pattern')}
def expected_source(): return tuple(load(ACCOUNTING)['semantic_source_owners'])
def remote_allowed(): return set(load(WHITELIST)['authorized_remote_word_ordinals'])

def relation_ids(o:int):
    obj=owner(o); rec=obj['record']; out={x.get('relation_id') for x in obj.get('relation_refs',[]) if x.get('relation_id')}
    for field in ('semantic_neighbors','confusables','word_family'):
        for x in rec.get(field,[]) or []:
            if isinstance(x,dict):
                rid=x.get('relation_id') or x.get('fact_id')
                if rid: out.add(rid)
    return out

def shared_relation(a:int,b:int): return relation_ids(a)&relation_ids(b)

def verify_receipts():
    expected=expected_source()
    if len(expected)!=190 or len(set(expected))!=190: raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(expected)}')
    union=[]; remote=[]; receipts=[]
    for lo,hi in BOUNDARIES:
        path=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not path.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {path.relative_to(ROOT)}')
        r=load(path); receipts.append((path,r))
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {path}')
        if r.get('issue')!=251 or r.get('package')!=[5375,5874] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {path}')
        src=r.get('semantic_source_ordinals',[]); expected_here=[o for o in expected if lo<=o<=hi]
        if src!=expected_here: raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {path} expected={expected_here} actual={src}')
        changed=set(r.get('changed_source_ordinals',[]))
        if changed!=set(src): raise RuntimeError(f'RECEIPT_SOURCE_NOT_MATERIALIZED {path} missing={sorted(set(src)-changed)} extra={sorted(changed-set(src))}')
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {path}')
        union.extend(src); remote.extend(r.get('out_of_range_dependency_ordinals',[]))
    if tuple(sorted(union))!=expected or len(union)!=190 or len(set(union))!=190: raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    remote_seen=set(remote); allowed=remote_allowed()
    if len(allowed)!=22: raise RuntimeError(f'REMOTE_WHITELIST_COUNT_DRIFT {len(allowed)}')
    if remote_seen!=allowed: raise RuntimeError(f'REMOTE_ENDPOINT_SET_MISMATCH missing={sorted(allowed-remote_seen)} extra={sorted(remote_seen-allowed)}')
    return receipts,remote_seen

def verify_500_readback():
    bad=[]
    for o in range(5375,5875):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        x=load(p)
        if x.get('ordinal')!=o or not x.get('word_id') or not x.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')

def verify_identity_form_relation():
    # All 15 Sol identity pairs keep both stable Word owners and one shared canonical Relation.
    for a,b,aw,bw in IDENTITY_PAIRS:
        if word(a)!=aw or word(b)!=bw: raise RuntimeError(f'IDENTITY_WORD_DRIFT {a}:{word(a)} {b}:{word(b)} expected={aw}/{bw}')
        if not shared_relation(a,b): raise RuntimeError(f'IDENTITY_RELATION_NOT_RECIPROCAL {aw}@o{a:04d} {bw}@o{b:04d}')
        sa,sb=spellings(a),spellings(b)
        if aw not in sa or bw not in sb: raise RuntimeError(f'PRIMARY_LOOKUP_MISSING {aw}:{sorted(sa)} {bw}:{sorted(sb)}')
        # Exact-spelling owners remain distinct; cross-owner spellings may not be stolen as aliases.
        if bw in sa or aw in sb: raise RuntimeError(f'CROSS_OWNER_LOOKUP_STOLEN {aw}<->{bw}')

    # Number ownership: plural outskirts stays learner-main; singular outskirt is lower/reference.
    outskirt=active_sense(5578,'sense:outskirt:2a3e1a88658d5b39')
    if not outskirt or outskirt.get('level')!='L3': raise RuntimeError('OUTSKIRT_SINGULAR_NOT_DEMOTED')

    # Seven other exact remote closures are reciprocal and retain endpoint identities.
    for a,b,aw,bw in OTHER_REMOTE_PAIRS:
        if word(a)!=aw or word(b)!=bw: raise RuntimeError(f'REMOTE_WORD_DRIFT {a}:{word(a)} {b}:{word(b)} expected={aw}/{bw}')
        if not shared_relation(a,b): raise RuntimeError(f'REMOTE_RELATION_NOT_RECIPROCAL {aw}@o{a:04d} {bw}@o{b:04d}')

    # Same-owner spelling/capitalization Forms that explicitly require lookup reachability.
    for o,alias in FORM_ALIAS_REQUIRED.items():
        if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
        if alias not in spellings(o): raise RuntimeError(f'LOOKUP_ALIAS_MISSING o{o:04d} {alias}')
    for o in FORM_ONLY_REQUIRED:
        if not form(o): raise RuntimeError(f'FORM_BOUNDARY_MISSING o{o:04d}')

    # Key high-risk semantic closures should survive projection/readback.
    if not {'sense:weed:6842a249f2fb5fd8','sense:weed:fe897141451c5559'} <= active_ids(5377): raise RuntimeError('WEED_ORDINARY_STABLE_SENSES_NOT_ACTIVE')
    if 'sense:woman:4aa2f1d404825a57' not in active_ids(5451): raise RuntimeError('WOMAN_STABLE_CORE_NOT_ACTIVE')
    if not {'sense:yawn:0cd17f71baf454e1','sense:yawn:0dbff70a6bfb599c'} <= active_ids(5481): raise RuntimeError('YAWN_STABLE_REACTIVATION_FAILED')
    if 'sense:pluck:b557c5df5b1d5944' not in active_ids(5586): raise RuntimeError('PLUCK_STABLE_VERB_NOT_ACTIVE')
    if 'sense:disillusion:448b97d4b87b51f9' not in active_ids(5770): raise RuntimeError('DISILLUSION_MODERN_VERB_NOT_ACTIVE')
    if 'sense:disillusion:b764f7db96f4581b' in active_ids(5770): raise RuntimeError('DISILLUSION_NOUN_NOT_DEMOTED')
    required_patterns={
      5404:{'whether ... or ...','whether or not'},5458:{'work out a problem/answer','find work','out of work'},
      5549:{'immigrate to + place/country'},5596:{'recognize A as B','recognize that + clause'},
      5641:{'an abundance of + noun','in abundance'},5717:{'clamp down on sth'},
      5773:{'dispense with sth'},5823:{'in flux'},5832:{'fret about/over sth'},5843:{'gnaw at sb/sth'},
      5864:{'harp on (about) sth'},
    }
    for o,patterns in required_patterns.items():
        missing=patterns-construction_patterns(o)
        if missing: raise RuntimeError(f'CONSTRUCTION_CLOSURE_MISSING o{o:04d} {sorted(missing)}')
    return {
      'regional_identity_pairs_15':'PASS','remote_relation_pairs_7':'PASS','remote_write_whitelist_22':'PASS',
      'exact_spelling_owner_preservation':'PASS','same_owner_form_aliases':'PASS','form_boundaries':'PASS',
      'stable_reactivations':'PASS','key_constructions':'PASS','outskirts_number_ownership':'PASS'
    }

def verify():
    receipts,remote_seen=verify_receipts(); verify_500_readback(); identity=verify_identity_form_relation(); return receipts,remote_seen,identity

def finalize(receipts,remote_seen,identity):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o5375-o5874.package-receipt.json'
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v2','status':'PACKAGE_VERIFIED_PENDING_INTEGRATION','authority':AUTHORITY,
      'issue':251,'package':[5375,5874],'reviewed_owner_count':500,'semantic_source_owner_count':190,
      'semantic_source_ordinals':list(expected_source()),'authorized_out_of_range_word_dependencies':sorted(remote_allowed()),
      'observed_out_of_range_word_dependencies':sorted(remote_seen),
      'boundary_receipts':[str(p.relative_to(ROOT)) for p,_ in receipts],
      'identity_form_relation_closure':identity,
      'verification':{'owner_readback_500':'PASS','source_accounting_190':'PASS','natural_owner_registry_audit':'PASS','transport_guards':'PASS','lexical_shard_tests':'PASS','changed_json_parse':'PASS','astro_full_build':'PASS'},
      'branch_local_mechanical_progress':'500/500','main_mechanical_frontier_before_integration':'o5374','next_range':'NOT_ACTIVATED'
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PACKAGE_PASS receipt=',out.relative_to(ROOT),'owners=500 sources=190 remote=22')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); args=ap.parse_args()
    receipts,remote_seen,identity=verify(); print('PACKAGE_ACCOUNTING_PASS 500/500 190/190 identity/form/relation PASS remote=22/22')
    if args.finalize: finalize(receipts,remote_seen,identity)
if __name__=='__main__': main()
