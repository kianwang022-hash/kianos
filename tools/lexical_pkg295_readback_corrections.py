#!/usr/bin/env python3
"""Apply two narrow materialization corrections found by pkg295 package-wide readback.

No new semantic judgment is made here. Both corrections are direct consequences
of the frozen Production authority for o7081 and o7172.
"""
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
import lexical_package_runtime as rt
import lexical_natural_owner as natural_owner

def dump(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main():
    store=base.Store(); store.extra_changed_paths=set()

    # o7081 juggle — Production requires both literal juggling verb and figurative management.
    sid_juggle=store.new(
        7081,'continuously_toss_catch_objects_verb','verb',
        '连续抛接多个物体；玩杂耍',
        'to continuously throw and catch several objects; to juggle',
        level='L1'
    )
    rt.rebuild_core_from_active(store,7081)

    # o7172 moron — preserve the pre-existing stable city sense identity as a
    # case-bounded deprecated/reference branch; create a genuinely new common
    # lowercase lexical branch rather than rewriting the proper-name sense ID.
    city_sid='sense:moron:852386ad2d915dc7'
    store.put_existing(
        7172,city_sid,
        cn='莫龙市；阿根廷布宜诺斯艾利斯以西的一座城市',
        en='Morón, a city in Argentina to the west of Buenos Aires',
        pos='noun',level='L3'
    )
    store.demote(7172,city_sid)
    sid_moron=store.new(
        7172,'derogatory_stupid_person','noun',
        '（贬义/冒犯）蠢货；侮辱性地指被认为很愚蠢的人',
        'derogatory/offensive: an insulting term for a person regarded as very stupid',
        level='L2'
    )
    rt.set_sense_usage(
        store,7172,sid_moron,
        note='Do not use as neutral clinical terminology; historical IQ-classification use is obsolete.',
        register='derogatory/offensive',level='L2',writing_safe=False
    )
    store.record(7172)['case_note']='Lowercase moron is the common derogatory noun. Capitalized/accented Morón is a geographic proper name and remains case-bounded reference truth.'
    store.mark(7172)
    rt.rebuild_core_from_active(store,7172)

    store.finalize()
    natural,relations,report=natural_owner.build()
    if report.get('status')!='PASS':
        raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    for o in (7081,7172):
        natural_owner.dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])

    # Hard readback assertions.
    j=natural[7081]['record']
    if not any(s.get('sense_id')==sid_juggle and s.get('pos')=='verb' and s.get('level')=='L1' for s in j.get('senses',[])):
        raise RuntimeError('JUGGLE_LITERAL_VERB_NOT_MATERIALIZED')
    m=natural[7172]['record']
    if any(s.get('sense_id')==city_sid for s in m.get('senses',[])):
        raise RuntimeError('MORON_CITY_SENSE_STILL_ACTIVE')
    if not any(s.get('sense_id')==sid_moron and s.get('register')=='derogatory/offensive' for s in m.get('senses',[])):
        raise RuntimeError('MORON_COMMON_BRANCH_NOT_MATERIALIZED')
    if store.senses[city_sid].get('status')!='deprecated':
        raise RuntimeError('MORON_CITY_REGISTRY_NOT_DEPRECATED')

    receipt={
        'schema':'kianos.lexical.pkg295.readback_corrections.v1',
        'status':'PASS',
        'authority':'content/lexical/semantic-reconciliation/o6875-o7374.md',
        'issue':295,
        'corrections':[
            {'ordinal':7081,'word':'juggle','action':'materialize frozen literal juggling verb','new_sense_id':sid_juggle},
            {'ordinal':7172,'word':'moron','action':'preserve proper-name stable identity and materialize new lowercase common lexeme sense','deprecated_proper_sense_id':city_sid,'new_sense_id':sid_moron}
        ],
        'semantic_reaudit':False,
        'remote_word_writes':[]
    }
    dump(LEX/'execution'/'o6875-o7374.readback-corrections.json',receipt)
    print('PKG295_READBACK_CORRECTIONS_PASS',json.dumps(receipt,ensure_ascii=False,sort_keys=True))
if __name__=='__main__': main()
