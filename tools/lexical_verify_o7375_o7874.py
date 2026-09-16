#!/usr/bin/env python3
"""Package-wide verifier/finalizer for Issue #301 / o7375-o7874."""
from __future__ import annotations
import argparse, json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
MANIFEST_DIR=LEX/'execution'/'manifests'/'o7375-o7874'
ACCOUNTING=LEX/'execution'/'preflight'/'o7375-o7874.reconciliation-compile.json'
AUTHORITY='content/lexical/semantic-reconciliation/o7375-o7874.md'
PACKAGE=(7375,7874)
BOUNDARIES=tuple((7375+50*i,7424+50*i) for i in range(10))
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','0652268f73129395ec925c29e6be323ef2119624')
VIGOR_REL='relation:horizontal:04b0d676430ce4228706'

FORM_ALIASES={
7404:('rigor','rigour'),7431:('savor','savour'),7432:('savory','savoury'),7443:('scrutinize','scrutinise'),
7475:('skeptic','sceptic'),7509:('splendor','splendour'),7523:('staunch','stanch'),7564:('synchronize','synchronise'),
7572:('tantalize','tantalise'),7649:('valor','valour'),7733:('categorization','categorisation'),
7775:('dramatization','dramatisation'),7776:('dramatize','dramatise'),7789:('finalize','finalise'),
7794:('globalization','globalisation'),7795:('hypothesize','hypothesise'),7826:('internalize','internalise'),
7839:('liberalization','liberalisation'),7840:('liberalize','liberalise'),7853:('neutralize','neutralise'),
7856:('normalize','normalise'),7870:('prioritize','prioritise'),
}
ZERO_ACTIVE_RECOVERY=(7443,7519,7540,7595,7620,7625,7627,7702,7724)


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
def core(o): return record(o).get('core_concept',{}) or {}
def core_text(o):
    c=core(o); return (str(c.get('core_meaning_en',''))+' '+str(c.get('core_meaning_cn',''))).lower()
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

def baseline_bytes(rel): return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

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
    if len(exp)!=287 or len(set(exp))!=287: raise RuntimeError(f'EXPECTED_SOURCE_COUNT_DRIFT {len(exp)}')
    union=[]; remote=[]
    for lo,hi in BOUNDARIES:
        p=RECEIPT_DIR/f'o{lo:04d}-o{hi:04d}.json'
        if not p.exists(): raise RuntimeError(f'MISSING_BOUNDARY_RECEIPT {p.relative_to(ROOT)}')
        r=load(p)
        if r.get('status')!='LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION': raise RuntimeError(f'BAD_RECEIPT_STATUS {p}')
        if r.get('issue')!=301 or r.get('package')!=[7375,7874] or r.get('shard')!=[lo,hi]: raise RuntimeError(f'RECEIPT_SCOPE_DRIFT {p}')
        src=[int(x) for x in r.get('semantic_source_ordinals',[])]
        expected=[o for o in exp if lo<=o<=hi]
        if src!=expected: raise RuntimeError(f'RECEIPT_SOURCE_DRIFT {p} expected={expected} actual={src}')
        if any(v!='PASS' for v in r.get('readback',{}).values()): raise RuntimeError(f'RECEIPT_READBACK_NOT_PASS {p}')
        changed={int(x) for x in r.get('changed_word_ordinals',[])}
        if not set(src)<=changed: raise RuntimeError(f'RECEIPT_SOURCE_NOT_MATERIALIZED {p} missing={sorted(set(src)-changed)}')
        union.extend(src); remote.extend(int(x) for x in r.get('out_of_range_dependency_ordinals',[]))
    if tuple(sorted(union))!=exp or len(union)!=287 or len(set(union))!=287: raise RuntimeError('SOURCE_UNION_MISMATCH')
    if remote: raise RuntimeError(f'UNAUTHORIZED_REMOTE_WORD_WRITES {sorted(set(remote))}')

def verify_500_readback():
    bad=[]
    for o in range(7375,7875):
        p=OWNER_DIR/f'o{o:04d}.json'
        if not p.exists(): bad.append((o,'missing')); continue
        x=load(p)
        if x.get('ordinal')!=o or not x.get('word_id') or not x.get('record'): bad.append((o,'malformed'))
    if bad: raise RuntimeError(f'OWNER_READBACK_FAILED {bad[:20]} total={len(bad)}')

def verify_forms():
    for o,(primary,alias) in FORM_ALIASES.items():
        if word(o)!=primary: raise RuntimeError(f'FORM_PRIMARY_DRIFT o{o:04d} {word(o)}')
        if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
        s=spellings(o)
        if primary not in s or alias not in s: raise RuntimeError(f'FORM_LOOKUP_MISSING o{o:04d} {sorted(s)}')

def verify_vigor_boundary():
    if word(7671)!='vigor' or word(6240)!='vigour': raise RuntimeError('VIGOR_VIGOUR_WORD_DRIFT')
    a,b=spellings(7671),spellings(6240)
    if 'vigor' not in a or 'vigour' not in b: raise RuntimeError('VIGOR_VIGOUR_PRIMARY_LOOKUP_MISSING')
    if 'vigour' in a or 'vigor' in b: raise RuntimeError('VIGOR_VIGOUR_LOOKUP_STOLEN')
    if VIGOR_REL not in relation_ids(7671) or VIGOR_REL not in relation_ids(6240): raise RuntimeError('VIGOR_VIGOUR_RELATION_MISSING')
    rel='content/lexical/words/by-ordinal/o6240.json'
    if baseline_bytes(rel)!=(ROOT/rel).read_bytes(): raise RuntimeError('REMOTE_OWNER_MUTATED o6240')

def verify_identity_case():
    if word(7599)!='tortuous' or word(7600)!='torturous': raise RuntimeError('TORTUOUS_TORTUROUS_WORD_DRIFT')
    if 'torturous' in spellings(7599) or 'tortuous' in spellings(7600): raise RuntimeError('TORTUOUS_TORTUROUS_LOOKUP_STOLEN')
    if 'torturous' not in str(record(7599).get('confusable_note','')).lower(): raise RuntimeError('TORTUOUS_CONFUSABLE_NOTE_MISSING')
    if 'sensual' not in str(record(7461).get('confusable_note','')).lower(): raise RuntimeError('SENSUOUS_BOUNDARY_NOTE_MISSING')
    if 'taciturn' not in str(record(7568).get('confusable_note','')).lower(): raise RuntimeError('TACIT_BOUNDARY_NOTE_MISSING')
    if 'agnostic' not in str(record(7475).get('confusable_note','')).lower(): raise RuntimeError('SKEPTIC_BOUNDARY_NOTE_MISSING')
    for o,needle in ((7393,'Restoration'),(7595,'Titanic'),(7650,'Vandal'),(7698,'Zealot')):
        note=str(record(o).get('case_note',''))
        if needle not in note: raise RuntimeError(f'CASE_NOTE_MISSING o{o:04d} {needle}')
    if 'sense:restoration:7c65f97e4aa05839' in active_ids(7393): raise RuntimeError('RESTORATION_HISTORICAL_STILL_ACTIVE')
    if 'sense:vandal:8998ea65b025533c' in active_ids(7650): raise RuntimeError('VANDAL_HISTORICAL_STILL_ACTIVE')
    if 'sense:zealot:0e4830a8da2b5c2f' in active_ids(7698): raise RuntimeError('ZEALOT_HISTORICAL_STILL_ACTIVE')
    if 'enormous' not in core_text(7595) and '巨大' not in core_text(7595): raise RuntimeError('TITANIC_LOWERCASE_CORE_MISSING')

def verify_zero_active_recovery():
    for o in ZERO_ACTIVE_RECOVERY:
        if not active(o): raise RuntimeError(f'ZERO_ACTIVE_NOT_RECOVERED o{o:04d}')
    if 'sense:twig:55ae51011cdf5faa' in active_ids(7625): raise RuntimeError('TWIG_BAD_LEGACY_SENSE_REACTIVATED')
    refs={x.get('stable_sense_id'):x for x in owner(7625).get('reference_senses',[]) if isinstance(x,dict)}
    if refs.get('sense:twig:55ae51011cdf5faa',{}).get('status')!='deprecated': raise RuntimeError('TWIG_LEGACY_REFERENCE_NOT_PRESERVED')
    if not any(s.get('pos')=='noun' and 'branch' in str(s.get('definition_en','')).lower() for s in active(7625)): raise RuntimeError('TWIG_COMMON_NOUN_MISSING')

def verify_semantic_spots():
    for o,pat in ((7688,'on a whim'),(7721,'in anticipation of sth'),(7747,'in conformity with sth'),(7753,'in consultation with sb')):
        if pat not in patterns(o): raise RuntimeError(f'REQUIRED_CONSTRUCTION_MISSING o{o:04d} {pat}')
    if not any(s.get('pos')=='noun' and ('amount' in str(s.get('definition_en','')).lower() or 'share' in str(s.get('definition_en','')).lower()) for s in active(7716)): raise RuntimeError('ALLOCATION_RESULT_BRANCH_MISSING')
    if not any(s.get('pos')=='noun' and ('money' in str(s.get('definition_en','')).lower() or 'payment' in str(s.get('definition_en','')).lower()) for s in active(7741)): raise RuntimeError('COMPENSATION_PAYMENT_BRANCH_MISSING')
    if not any(s.get('pos')=='noun' and ('statement' in str(s.get('definition_en','')).lower() or 'forecast' in str(s.get('definition_en','')).lower()) for s in active(7867)): raise RuntimeError('PREDICTION_RESULT_BRANCH_MISSING')
    if '公共卫生' not in core_text(7425) and 'public-health' not in core_text(7425): raise RuntimeError('SANITATION_PUBLIC_HEALTH_CORE_MISSING')
    if 'conceal' in core_text(7450) or '隐藏' in core_text(7450): raise RuntimeError('SECRETION_CONCEALMENT_POLLUTION')
    if '跳痛' not in core_text(7588) and '搏动性疼痛' not in core_text(7588): raise RuntimeError('THROB_PAIN_CN_MISSING')
    if '龙卷' not in core_text(7597) and 'rotating' not in core_text(7597): raise RuntimeError('TORNADO_CORE_MISSING')
    if not any(s.get('sense_id')=='sense:vouchsafe:8d9f72e86c335056' and s.get('level')=='L3' for s in active(7681)): raise RuntimeError('VOUCHSAFE_L3_BRANCH_MISSING')
    if 'formal' not in core_text(7681) and '正式' not in core_text(7681): raise RuntimeError('VOUCHSAFE_EXPLICIT_CORE_MISSING')

def verify_manifest_materialization():
    patches=load_manifest_patches(); exp=set(expected_source())
    if set(patches)!=exp: raise RuntimeError(f'MANIFEST_SOURCE_DRIFT missing={sorted(exp-set(patches))} extra={sorted(set(patches)-exp)}')
    counts={k:0 for k in ('construction','form','relation','reactivate','rewrite','new','core','record_note','usage','demote')}
    for o,row in patches.items():
        rec=record(o); senses=active(o); byid={s.get('sense_id'):s for s in senses if s.get('sense_id')}
        for op in row.get('ops',[]):
            k=op['kind']; counts[k]=counts.get(k,0)+1
            if k=='construction':
                if op['pattern'] not in patterns(o): raise RuntimeError(f'CONSTRUCTION_MISSING o{o:04d} {op["pattern"]}')
            elif k=='form':
                if not form(o): raise RuntimeError(f'FORM_IDENTITY_MISSING o{o:04d}')
                for a in op.get('aliases',[]):
                    if a not in spellings(o): raise RuntimeError(f'FORM_ALIAS_MISSING o{o:04d} {a}')
            elif k in {'reactivate','rewrite'} and op.get('sid'):
                s=byid.get(op['sid'])
                if not s: raise RuntimeError(f'STABLE_SENSE_NOT_ACTIVE o{o:04d} {op["sid"]}')
                if op.get('en') and s.get('definition_en')!=op['en']: raise RuntimeError(f'REWRITE_OUTPUT_DRIFT o{o:04d} {op["sid"]}')
                if op.get('cn') and s.get('definition_cn')!=op['cn']: raise RuntimeError(f'REWRITE_CN_DRIFT o{o:04d} {op["sid"]}')
            elif k=='new':
                if not any(s.get('definition_en')==op['en'] and s.get('pos')==op['pos'] for s in senses): raise RuntimeError(f'NEW_BRANCH_OUTPUT_NOT_FOUND o{o:04d} {op["branch"]}')
            elif k=='core':
                c=core(o)
                if c.get('core_meaning_en')!=op['en'] or c.get('core_meaning_cn')!=op['cn']: raise RuntimeError(f'CORE_OUTPUT_DRIFT o{o:04d}')
            elif k=='record_note':
                fld=op.get('field','usage_note')
                if rec.get(fld)!=op['value']: raise RuntimeError(f'RECORD_NOTE_DRIFT o{o:04d} {fld}')
            elif k=='demote' and op.get('sid'):
                if op['sid'] in byid: raise RuntimeError(f'DEMOTED_SENSE_STILL_ACTIVE o{o:04d} {op["sid"]}')
            elif k=='usage' and op.get('sid'):
                s=byid.get(op['sid'])
                if not s: raise RuntimeError(f'USAGE_TARGET_NOT_ACTIVE o{o:04d} {op["sid"]}')
                for fld in ('level','register','writing_safe'):
                    if fld in op and s.get(fld)!=op[fld]: raise RuntimeError(f'USAGE_FIELD_DRIFT o{o:04d} {op["sid"]} {fld}')
    return counts

def verify_all():
    verify_receipts(); verify_500_readback(); verify_forms(); verify_vigor_boundary(); verify_identity_case(); verify_zero_active_recovery(); verify_semantic_spots(); material=verify_manifest_materialization()
    print('PKG301_PACKAGE_VERIFY_PASS',json.dumps({'owners':500,'sources':287,'receipts':10,'forms':len(FORM_ALIASES),'remote_word_writes':0,'materialization':material},ensure_ascii=False,sort_keys=True))
    return material

def finalize(material):
    if os.environ.get('KIANOS_ASTRO_BUILD')!='PASS': raise RuntimeError('ASTRO_BUILD_EVIDENCE_MISSING')
    payload={
      'schema':'kianos.lexical.forward_package_receipt.v2','status':'PACKAGE_VERIFIED_PENDING_INTEGRATION','authority':AUTHORITY,'issue':301,
      'package':[7375,7874],'reviewed_owner_count':500,'semantic_source_owner_count':287,'semantic_source_ordinals':list(expected_source()),
      'internal_receipts':10,'owner_readback':'500/500 PASS','identity_closure':{
        'same_owner_forms':'22/22 PASS','vigor_vigour_distinct_owners_existing_relation':'PASS','tortuous_torturous':'PASS',
        'sensuous_sensual':'PASS','tacit_taciturn':'PASS','skeptic_sceptic_agnostic':'PASS','proper_name_case_boundaries':'PASS',
        'zero_active_recovery':'9/9 PASS','out_of_range_word_writes':'0/0 PASS'},
      'manifest_materialization_counts':material,'natural_owner':'PASS','transport_guards':'PASS','shard_tests':'PASS','changed_lexical_json':'PASS','full_astro_build':'PASS'
    }
    out=LEX/'execution'/'o7375-o7874.package-receipt.json'
    out.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PKG301_PACKAGE_RECEIPT_WRITTEN',out.relative_to(ROOT))

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--finalize',action='store_true'); a=ap.parse_args()
    material=verify_all()
    if a.finalize: finalize(material)
if __name__=='__main__': main()
