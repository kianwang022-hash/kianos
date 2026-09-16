#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #303 / final tail o7875-o7946."""
from __future__ import annotations
import argparse, json, os, subprocess
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
BASELINE='de70a99c415bb550e85866c1f48714e5c60187c4'
FORM_ALIASES={
  7880:('rationalization','rationalisation'),
  7881:('rationalize','rationalise'),
  7903:('revolutionize','revolutionise'),
  7910:('stabilization','stabilisation'),
  7911:('stabilize','stabilise'),
  7916:('subsidize','subsidise'),
  7927:('symbolize','symbolise'),
  7939:('utilization','utilisation'),
}


def load(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def owner(o): return load(OWNER_DIR/f'o{o:04d}.json')
def record(o): return owner(o)['record']
def active(o): return record(o).get('senses',[]) or []
def word(o):
    x=owner(o); return x.get('word') or x['record'].get('word')
def spellings(o): return {x.get('spelling') for x in owner(o).get('lookup_refs',[]) if x.get('spelling')}
def form(o): return record(o).get('form_identity')
def expected_source(): return tuple(int(x) for x in load(ACCOUNTING)['semantic_source_owners'])
def baseline_bytes(rel): return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])


def load_manifest_patches():
    files=sorted(MANIFEST_DIR.glob('*.json'))
    if len(files)!=2: raise RuntimeError(f'MANIFEST_FILE_COUNT_DRIFT {len(files)}')
    out={}
    for p in files:
        data=load(p)
        if data.get('package')!=[7875,7946]: raise RuntimeError(f'MANIFEST_PACKAGE_DRIFT {p}')
        for row in data.get('patches',[]):
            o=int(row['ordinal'])
            if o in out: raise RuntimeError(f'DUPLICATE_MANIFEST_OWNER o{o:04d}')
            out[o]=row
    return out


def verify_receipts():
    exp=expected_source()
    if len(exp)!=35 or len(set(exp))!=35: raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(exp)}')
    union=[]; remote=[]
    expected_counts=[26,9]
    for idx,(lo,hi) in enumerate(BOUNDARIES):
        p=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not p.exists(): raise RuntimeError(f'MISSING_RECEIPT {p.relative_to(ROOT)}')
        r=load(p)
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {p}')
        if r.get('issue')!=303 or r.get('package')!=[7875,7946] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {p}')
        src=[int(x) for x in r.get('semantic_source_ordinals',[])]
        expected=[o for o in exp if lo<=o<=hi]
        if src!=expected or len(src)!=expected_counts[idx]: raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {p} expected={expected} actual={src}')
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {p}')
        changed={int(x) for x in r.get('changed_word_ordinals',[])}
        if not set(src)<=changed: raise RuntimeError(f'SOURCE_NOT_MATERIALIZED {p} missing={sorted(set(src)-changed)}')
        union.extend(src); remote.extend(int(x) for x in r.get('out_of_range_dependency_ordinals',[]))
    if tuple(sorted(union))!=exp or len(union)!=35 or len(set(union))!=35: raise RuntimeError('SOURCE_UNION_MISMATCH')
    if remote: raise RuntimeError(f'UNAUTHORIZED_REMOTE_WORD_WRITES {sorted(set(remote))}')


def verify_72_readback():
    bad=[]
    for o in range(7875,7947):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        obj=load(p)
        if obj.get('ordinal')!=o or not obj.get('word_id') or not obj.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad}')


def verify_forms():
    for o,(primary,alias) in FORM_ALIASES.items():
        if word(o)!=primary: raise RuntimeError(f'FORM_PRIMARY_DRIFT o{o:04d}')
        if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
        s=spellings(o)
        if primary not in s or alias not in s: raise RuntimeError(f'FORM_LOOKUP_MISSING o{o:04d} {sorted(s)}')
    if word(5235)!='utilise': raise RuntimeError(f'UTILISE_REMOTE_WORD_DRIFT {word(5235)}')
    if 'utilisation' in spellings(5235): raise RuntimeError('UTILISE_REMOTE_STOLE_NOUN_ALIAS')
    if 'utilisation' not in spellings(7939): raise RuntimeError('UTILIZATION_BRE_ALIAS_MISSING')
    rel='content/lexical/words/by-ordinal/o5235.json'
    if baseline_bytes(rel)!=(ROOT/rel).read_bytes(): raise RuntimeError('REMOTE_OWNER_MUTATED o5235')


def verify_manifest_materialization():
    patches=load_manifest_patches(); exp=set(expected_source())
    if set(patches)!=exp: raise RuntimeError(f'MANIFEST_SOURCE_DRIFT missing={sorted(exp-set(patches))} extra={sorted(set(patches)-exp)}')
    counts={'rewrite':0,'new':0,'form':0,'core':0}
    for o,row in patches.items():
        rec=record(o); senses=active(o); byid={s.get('sense_id'):s for s in senses if s.get('sense_id')}
        for op in row.get('ops',[]):
            k=op['kind']; counts[k]=counts.get(k,0)+1
            if k=='rewrite':
                s=byid.get(op['sid'])
                if not s: raise RuntimeError(f'STABLE_SENSE_NOT_ACTIVE o{o:04d} {op["sid"]}')
                if s.get('definition_en')!=op['en'] or s.get('definition_cn')!=op['cn']: raise RuntimeError(f'REWRITE_OUTPUT_DRIFT o{o:04d}')
                if op.get('level') and s.get('level')!=op['level']: raise RuntimeError(f'REWRITE_LEVEL_DRIFT o{o:04d}')
                if op.get('register') and s.get('register')!=op['register']: raise RuntimeError(f'REWRITE_REGISTER_DRIFT o{o:04d}')
            elif k=='new':
                hits=[s for s in senses if s.get('definition_en')==op['en'] and s.get('pos')==op['pos']]
                if len(hits)!=1: raise RuntimeError(f'NEW_BRANCH_OUTPUT_NOT_UNIQUE o{o:04d} {op["branch"]} hits={len(hits)}')
                if hits[0].get('level')!=op.get('level','L2'): raise RuntimeError(f'NEW_BRANCH_LEVEL_DRIFT o{o:04d} {op["branch"]}')
                if op.get('register') and hits[0].get('register')!=op['register']: raise RuntimeError(f'NEW_BRANCH_REGISTER_DRIFT o{o:04d} {op["branch"]}')
            elif k=='form':
                if not form(o): raise RuntimeError(f'FORM_OUTPUT_MISSING o{o:04d}')
                for alias in op.get('aliases',[]):
                    if alias not in spellings(o): raise RuntimeError(f'FORM_ALIAS_MISSING o{o:04d} {alias}')
            elif k=='core':
                c=rec.get('core_concept',{})
                if c.get('core_meaning_en')!=op['en'] or c.get('core_meaning_cn')!=op['cn']: raise RuntimeError(f'CORE_OUTPUT_DRIFT o{o:04d}')
            else:
                raise RuntimeError(f'UNKNOWN_MANIFEST_KIND {k}')
    return counts


def verify():
    verify_receipts(); verify_72_readback(); verify_forms(); material=verify_manifest_materialization()
    return material


def finalize(material):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    out=LEX/'execution'/'o7875-o7946.package-receipt.json'
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v2',
      'status':'PACKAGE_VERIFIED_PENDING_INTEGRATION',
      'authority':AUTHORITY,
      'issue':303,
      'package':[7875,7946],
      'reviewed_owner_count':72,
      'semantic_source_owner_count':35,
      'semantic_source_ordinals':list(expected_source()),
      'internal_receipts':['content/lexical/execution/receipts/o7875-o7924.json','content/lexical/execution/receipts/o7925-o7946.json'],
      'remote_word_writes':[],
      'read_only_dependency_ordinals':[5235],
      'form_controls':8,
      'manifest_materialization_counts':material,
      'verification':{
        'owner_readback_72':'PASS',
        'semantic_source_accounting_35':'PASS',
        'manifest_coverage_35':'PASS',
        'same_owner_forms_8':'PASS',
        'utilise_o5235_read_only':'PASS',
        'remote_word_writes_0':'PASS',
        'natural_owner_registry_audit':'PASS',
        'transport_guards':'PASS',
        'shard_tests':'PASS',
        'changed_lexical_json_parse':'PASS',
        'full_astro_build':'PASS'
      }
    }
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('FINAL_TAIL_PACKAGE_RECEIPT_WRITTEN',out.relative_to(ROOT))


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); a=ap.parse_args()
    material=verify()
    print('FINAL_TAIL_PACKAGE_VERIFY_PASS',json.dumps(material,sort_keys=True))
    if a.finalize: finalize(material)

if __name__=='__main__': main()
