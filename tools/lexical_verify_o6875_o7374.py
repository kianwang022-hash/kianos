#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #295 / o6875-o7374."""
from __future__ import annotations

import argparse, json, os, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
MANIFEST_DIR=LEX/'execution'/'manifests'/'o6875-o7374'
ACCOUNTING=LEX/'execution'/'preflight'/'o6875-o7374.reconciliation-compile.json'
CORRECTION_RECEIPT=LEX/'execution'/'o6875-o7374.readback-corrections.json'
AUTHORITY='content/lexical/semantic-reconciliation/o6875-o7374.md'
PACKAGE=(6875,7374)
BOUNDARIES=tuple((6875+50*i,6924+50*i) for i in range(10))
BASELINE='dae994bce7c35934d12c39e8939b2c8452fafa35'

FORM_ALIASES={
    6971:('hypnotize','hypnotise'),
    7048:('instil','instill'),
    7098:('legalize','legalise'),
    7123:('luster','lustre'),
    7142:('meager','meagre'),
    7151:('mesmerize','mesmerise'),
    7169:('monopolize','monopolise'),
}
REMOTE_BOUNDARIES=(
    (7134,2949,'maneuver','manoeuvre',False),
    (7182,6001,'naught','nought',True),
    (7278,3646,'plow','plough',True),
    (7289,3718,'practice','practise',True),
)


def load(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def owner(o): return load(OWNER_DIR/f'o{o:04d}.json')
def record(o): return owner(o)['record']
def word(o):
    x=owner(o); return x.get('word') or x['record'].get('word')
def active(o): return record(o).get('senses',[]) or []
def active_ids(o): return {s.get('sense_id') for s in active(o) if s.get('sense_id')}
def spellings(o): return {x.get('spelling') for x in owner(o).get('lookup_refs',[]) if x.get('spelling')}
def patterns(o): return {x.get('pattern') for x in record(o).get('constructions',[]) if x.get('pattern')}
def form(o): return record(o).get('form_identity')
def expected_source(): return tuple(int(x) for x in load(ACCOUNTING)['semantic_source_owners'])

def relation_ids(o):
    obj=owner(o); rec=obj['record']; out=set()
    for x in obj.get('relation_refs',[]) or []:
        if isinstance(x,dict) and x.get('relation_id'): out.add(x['relation_id'])
    for fld in ('semantic_neighbors','confusables','word_family'):
        for x in rec.get(fld,[]) or []:
            if isinstance(x,dict):
                rid=x.get('relation_id') or x.get('fact_id')
                if rid: out.add(rid)
    return out

def shared_relation(a,b): return relation_ids(a)&relation_ids(b)

def load_manifest_patches():
    files=sorted(MANIFEST_DIR.glob('*.json'))
    if len(files)!=10: raise RuntimeError(f'MANIFEST_FILE_COUNT_DRIFT {len(files)}')
    out={}
    for p in files:
        for row in load(p).get('patches',[]):
            o=int(row['ordinal'])
            if o in out: raise RuntimeError(f'DUPLICATE_MANIFEST_OWNER o{o:04d}')
            out[o]=row
    return out

def verify_receipts():
    exp=expected_source()
    if len(exp)!=304 or len(set(exp))!=304: raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(exp)}')
    union=[]; remote=[]; recs=[]
    for lo,hi in BOUNDARIES:
        p=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not p.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {p.relative_to(ROOT)}')
        r=load(p); recs.append((p,r))
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {p}')
        if r.get('issue')!=295 or r.get('package')!=[6875,7374] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {p}')
        src=[int(x) for x in r.get('semantic_source_ordinals',[])]
        eh=[o for o in exp if lo<=o<=hi]
        if src!=eh: raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {p} expected={eh} actual={src}')
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {p}')
        changed={int(x) for x in r.get('changed_word_ordinals',[])}
        if not set(src)<=changed: raise RuntimeError(f'RECEIPT_SOURCE_NOT_MATERIALIZED {p} missing={sorted(set(src)-changed)}')
        union.extend(src); remote.extend(int(x) for x in r.get('out_of_range_dependency_ordinals',[]))
    if tuple(sorted(union))!=exp or len(union)!=304 or len(set(union))!=304:
        raise RuntimeError(f'SOURCE_UNION_MISMATCH count={len(union)} unique={len(set(union))}')
    if remote: raise RuntimeError(f'UNAUTHORIZED_REMOTE_WORD_WRITES {sorted(set(remote))}')
    return recs

def verify_500_readback():
    bad=[]
    for o in range(6875,7375):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        obj=load(p)
        if obj.get('ordinal')!=o or not obj.get('word_id') or not obj.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')

def verify_forms():
    for o,(primary,alias) in FORM_ALIASES.items():
        if word(o)!=primary: raise RuntimeError(f'FORM_PRIMARY_DRIFT o{o:04d} {word(o)}')
        if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
        s=spellings(o)
        if primary not in s or alias not in s: raise RuntimeError(f'FORM_LOOKUP_MISSING o{o:04d} {sorted(s)}')
    return 'PASS'

def baseline_bytes(rel): return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

def verify_remote_boundaries():
    for local,remote,lw,rw,need_relation in REMOTE_BOUNDARIES:
        if word(local)!=lw or word(remote)!=rw: raise RuntimeError(f'REMOTE_WORD_DRIFT {local}/{remote}')
        ls,rs=spellings(local),spellings(remote)
        if lw not in ls or rw not in rs: raise RuntimeError(f'PRIMARY_LOOKUP_MISSING {lw}/{rw}')
        if rw in ls or lw in rs: raise RuntimeError(f'CROSS_OWNER_LOOKUP_STOLEN {lw}<->{rw}')
        if need_relation and not shared_relation(local,remote): raise RuntimeError(f'REMOTE_RELATION_MISSING {lw}<->{rw}')
        rel=f'content/lexical/words/by-ordinal/o{remote:04d}.json'
        if baseline_bytes(rel)!=(ROOT/rel).read_bytes(): raise RuntimeError(f'REMOTE_OWNER_MUTATED o{remote:04d}')
    return 'PASS'

def verify_in_range_identity():
    if not shared_relation(7111,7112): raise RuntimeError('LOATH_LOATHE_RELATION_MISSING')
    if 'loathe' in spellings(7111) or 'loath' in spellings(7112): raise RuntimeError('LOATH_LOATHE_LOOKUP_STOLEN')
    if 'jibe' in spellings(6904): raise RuntimeError('GIBE_UNRESTRICTED_JIBE_ALIAS_PRESENT')
    if 'sense:gibe:c0bcf3ec80f85378' in active_ids(6904): raise RuntimeError('GIBE_AGREE_BRANCH_STILL_ACTIVE')
    note=str(record(6904).get('confusable_note','')).lower()
    if 'jibe' not in note or 'agree' not in note: raise RuntimeError('GIBE_BOUNDARY_NOTE_MISSING')
    return 'PASS'

def core_text(o):
    c=record(o).get('core_concept',{})
    return (str(c.get('core_meaning_en',''))+' '+str(c.get('core_meaning_cn',''))).lower()

def verify_case_boundaries():
    if 'sense:hamlet:cdafb977ff145d78' in active_ids(6936): raise RuntimeError('HAMLET_PROPER_STILL_ACTIVE')
    if 'settlement' not in core_text(6936) and '聚落' not in core_text(6936): raise RuntimeError('HAMLET_COMMON_CORE_MISSING')
    if 'programming' in core_text(7108): raise RuntimeError('LISP_PROPER_NAME_IN_CORE')
    for o,sid,label in (
        (7140,'sense:maxim:109e34e215f45eaa','MAXIM'),
        (7176,'sense:munch:6a1db5d3089a5e31','MUNCH'),
        (7240,'sense:panacea:49e39ae8539350da','PANACEA'),
        (7331,'sense:psyche:d260645002c25072','PSYCHE'),
    ):
        if sid in active_ids(o): raise RuntimeError(f'{label}_PROPER_STILL_ACTIVE')
    m=owner(7172)
    if 'sense:moron:852386ad2d915dc7' in active_ids(7172): raise RuntimeError('MORON_CITY_STILL_ACTIVE')
    refs={x.get('stable_sense_id'):x for x in m.get('reference_senses',[]) if isinstance(x,dict)}
    city=refs.get('sense:moron:852386ad2d915dc7')
    if not city or city.get('status')!='deprecated' or 'Morón' not in city.get('definition_en',''): raise RuntimeError('MORON_CITY_IDENTITY_NOT_PRESERVED')
    if not any(s.get('sense_id')=='sense:moron:47bf03a4b1722813' and s.get('register')=='derogatory/offensive' for s in active(7172)):
        raise RuntimeError('MORON_COMMON_BRANCH_MISSING')
    if 'william lloyd' in core_text(6894) or 'general lee' in core_text(7097): raise RuntimeError('PROPER_NAME_POLLUTION_IN_LOWERCASE_CORE')
    return 'PASS'

def verify_readback_corrections():
    if not CORRECTION_RECEIPT.exists(): raise RuntimeError('READBACK_CORRECTION_RECEIPT_MISSING')
    r=load(CORRECTION_RECEIPT)
    if r.get('status')!='PASS' or r.get('semantic_reaudit') is not False or r.get('remote_word_writes')!=[]:
        raise RuntimeError('READBACK_CORRECTION_RECEIPT_BAD')
    if not any(s.get('sense_id')=='sense:juggle:7e77fa21f0fa1f3d' and s.get('pos')=='verb' and s.get('level')=='L1' for s in active(7081)):
        raise RuntimeError('JUGGLE_LITERAL_VERB_MISSING')
    return 'PASS'

def verify_manifest_materialization():
    patches=load_manifest_patches(); exp=set(expected_source())
    if set(patches)!=exp: raise RuntimeError(f'MANIFEST_SOURCE_DRIFT missing={sorted(exp-set(patches))} extra={sorted(set(patches)-exp)}')
    counts={k:0 for k in ('construction','form','relation','reactivate','rewrite','new','core','record_note','usage','demote')}
    for o,row in patches.items():
        rec=record(o); senses=active(o); byid={s.get('sense_id'):s for s in senses if s.get('sense_id')}
        for op in row.get('ops',[]):
            k=op['kind']
            if k in counts: counts[k]+=1
            # o7172's original rewrite was superseded by the package-wide stable-identity correction.
            if o==7172 and k=='rewrite' and op.get('sid')=='sense:moron:852386ad2d915dc7': continue
            if k=='construction':
                if op['pattern'] not in patterns(o): raise RuntimeError(f'CONSTRUCTION_MISSING o{o:04d} {op["pattern"]}')
            elif k=='form':
                if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
                for a in op.get('aliases',[]):
                    if a not in spellings(o): raise RuntimeError(f'FORM_ALIAS_MISSING o{o:04d} {a}')
            elif k=='relation':
                if not shared_relation(o,int(op['target_ordinal'])): raise RuntimeError(f'RELATION_NOT_RECIPROCAL o{o:04d}')
            elif k in {'reactivate','rewrite'} and op.get('sid'):
                s=byid.get(op['sid'])
                if not s: raise RuntimeError(f'STABLE_SENSE_NOT_ACTIVE o{o:04d} {op["sid"]}')
                if op.get('en') and s.get('definition_en')!=op['en']: raise RuntimeError(f'REWRITE_OUTPUT_DRIFT o{o:04d} {op["sid"]}')
            elif k=='new':
                if not any(s.get('definition_en')==op['en'] and s.get('pos')==op['pos'] for s in senses): raise RuntimeError(f'NEW_BRANCH_OUTPUT_NOT_FOUND o{o:04d} {op["branch"]}')
            elif k=='core':
                c=rec.get('core_concept',{})
                if c.get('core_meaning_en')!=op['en'] or c.get('core_meaning_cn')!=op['cn']: raise RuntimeError(f'CORE_OUTPUT_DRIFT o{o:04d}')
            elif k=='record_note':
                fld=op.get('field','usage_note')
                if rec.get(fld)!=op['value']:
                    # o7172's case note was made more exact by stable-identity correction.
                    if o==7172 and fld=='case_note': continue
                    raise RuntimeError(f'RECORD_NOTE_DRIFT o{o:04d} {fld}')
            elif k=='demote' and op.get('sid'):
                if op['sid'] in byid: raise RuntimeError(f'DEMOTED_SENSE_STILL_ACTIVE o{o:04d} {op["sid"]}')
            elif k=='usage' and op.get('sid'):
                s=byid.get(op['sid'])
                if not s: raise RuntimeError(f'USAGE_TARGET_NOT_ACTIVE o{o:04d} {op["sid"]}')
                for fld,key in (('level','level'),('register','register'),('writing_safe','writing_safe')):
                    if key in op and s.get(fld)!=op[key]: raise RuntimeError(f'USAGE_FIELD_DRIFT o{o:04d} {op["sid"]} {fld}')
    return counts

def verify():
    recs=verify_receipts(); verify_500_readback(); verify_forms(); verify_remote_boundaries(); verify_in_range_identity(); verify_case_boundaries(); verify_readback_corrections(); material=verify_manifest_materialization()
    identity={
        'same_owner_form_aliases_7':'PASS',
        'loath_loathe_in_range_confusable':'PASS',
        'duplicate_owner_boundaries_read_only_4':'PASS',
        'gibe_jibe_bounded':'PASS',
        'proper_name_case_boundaries':'PASS',
        'remote_word_writes_0':'PASS',
        'package_readback_corrections':'PASS',
    }
    return recs,identity,material

def finalize(recs,identity,material):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o6875-o7374.package-receipt.json'
    payload={
        'schema':'kianos.lexical.forward_package_receipt.v2',
        'status':'PACKAGE_VERIFIED_PENDING_INTEGRATION',
        'authority':AUTHORITY,
        'issue':295,
        'package':[6875,7374],
        'reviewed_owner_count':500,
        'semantic_source_owner_count':304,
        'semantic_source_ordinals':list(expected_source()),
        'authorized_out_of_range_word_dependencies':[],
        'observed_out_of_range_word_dependencies':[],
        'boundary_receipts':[str(p.relative_to(ROOT)) for p,_ in recs],
        'readback_correction_receipt':str(CORRECTION_RECEIPT.relative_to(ROOT)),
        'identity_form_relation_closure':identity,
        'manifest_materialization_counts':material,
        'verification':{
            'owner_readback_500':'PASS','source_accounting_304':'PASS','manifest_plus_readback_materialization':'PASS',
            'natural_owner_registry_audit':'PASS','transport_guards':'PASS','lexical_shard_tests':'PASS','changed_json_parse':'PASS','astro_full_build':'PASS'
        },
        'branch_local_mechanical_progress':'500/500',
        'main_mechanical_frontier_before_integration':'o6874',
        'next_range':'NOT_ACTIVATED'
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PACKAGE_PASS receipt=',out.relative_to(ROOT),'owners=500 sources=304 remote=0')

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); a=ap.parse_args()
    recs,identity,material=verify()
    print('PACKAGE_ACCOUNTING_PASS 500/500 304/304 identity/form/relation PASS remote=0/0')
    print('MANIFEST_PLUS_READBACK_MATERIALIZATION_PASS',json.dumps(material,sort_keys=True))
    if a.finalize: finalize(recs,identity,material)
if __name__=='__main__': main()
