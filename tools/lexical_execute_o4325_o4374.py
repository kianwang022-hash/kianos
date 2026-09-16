#!/usr/bin/env python3
"""Mechanical execution for Issue #215 boundary o4325-o4374.

Semantic authority is frozen in content/lexical/semantic-reconciliation/o4125-o4374.md.
This executor reuses exact stable IDs and creates only the explicitly-authorized
missing familiar branches proven absent by Current.
"""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content'/'lexical'
OWNER_DIR=LEX/'words'/'by-ordinal'
RECEIPT_DIR=LEX/'execution'/'receipts'
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
AUTHORITY='content/lexical/semantic-reconciliation/o4125-o4374.md'
SOURCE=(4328,4329,4340,4341,4343,4344,4347,4353,4354,4357,4359,4360,4365,4368,4372,4374)

sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build,dump_json


def sha_bytes(data:bytes)->str: return hashlib.sha256(data).hexdigest()
def baseline_bytes(rel):
    if BASELINE=='unknown': raise RuntimeError('KIANOS_BASELINE_MAIN must be pinned')
    return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

def put(s,o,sid,*,level,branch=None,pattern=None,cn=None,en=None):
    if sid not in s.senses: raise RuntimeError(f'PINNED_STABLE_ID_MISSING {sid}')
    return s.put_existing(o,sid,level=level,branch=branch,pattern=pattern,cn=cn,en=en)

def core(s,o,cn,en): s.core(o,cn=cn,en=en)

def set_form_identity(s,o,type_,boundaries):
    s.record(o)['form_identity']={'authority':AUTHORITY,'type':type_,'boundaries':boundaries}; s.mark(o)

def ensure_absent(s,word,terms):
    hits=[]
    for sid,rec in s.senses.items():
        if rec.get('headword')!=word: continue
        text=(str(rec.get('definition_en',''))+' '+str(rec.get('definition_cn',''))).lower()
        if any(t.lower() in text for t in terms): hits.append(sid)
    if hits: raise RuntimeError(f'EXPECTED_GENUINE_NEW_BUT_STABLE_EXISTS {word} {hits}')

def rebuild_core_exact(s,o,ids,cn,en):
    rec=s.record(o); active={x.get('sense_id'):x for x in rec.get('senses',[])}
    missing=[sid for sid in ids if sid not in active]
    if missing: raise RuntimeError(f'CORE_PIN_MISSING o{o:04d} {missing}')
    grouped=defaultdict(list)
    for sid in ids: grouped[str(active[sid].get('pos','other'))].append(active[sid])
    rec.setdefault('core_concept',{})['core_clusters']=[{
        'label_cn':'；'.join(dict.fromkeys(x.get('definition_cn','') for x in xs if x.get('definition_cn'))),
        'label_en':'; '.join(dict.fromkeys(x.get('definition_en','') for x in xs if x.get('definition_en'))),
        'pos':pos,'sense_ids':[x['sense_id'] for x in xs],
    } for pos,xs in grouped.items()]
    rec['core_concept']['core_meaning_cn']=cn
    rec['core_concept']['mental_model_cn']=cn
    rec['core_concept']['core_meaning_en']=en
    s.mark(o)

def drop_collocation(s,o,phrase):
    hits=[]
    for sense in s.record(o).get('senses',[]):
        for item in list(sense.get('collocations',[])):
            if item.get('phrase')==phrase: hits.append((sense,item))
    if len(hits)!=1: raise RuntimeError(f'COLLOCATION_MATCH_NOT_UNIQUE o{o:04d} {phrase} hits={len(hits)}')
    sense,item=hits[0]; sense['collocations'].remove(item); cid=item.get('collocation_id')
    if cid in s.colls:
        s.colls[cid]['status']='deprecated'; s.changed_collocation_ids.add(cid)
    s.mark(o)

def add_anchored_construction(s,o,pattern,meaning,sid,level='L2',note=None):
    s.add_construction(o,pattern,meaning,level=level)
    hits=[x for x in s.record(o).get('constructions',[]) if x.get('pattern')==pattern]
    if len(hits)!=1: raise RuntimeError(f'CONSTRUCTION_NOT_UNIQUE o{o:04d} {pattern}')
    hits[0]['source_sense_id']=sid
    if note: hits[0]['usage_note']=note
    s.mark(o)


def apply(s):
    # o4328 seldom: ordinary adverb main; rare adjective low.
    put(s,4328,'sense:seldom:28c69b7c04ab5867',level='L1',branch=0)
    put(s,4328,'sense:seldom:9933bd96e372510a',level='L3',branch=1)
    core(s,4328,'很少；不常','not often; rarely')

    # o4329 select: verb main, adjective secondary, noun low.
    put(s,4329,'sense:select:2baa3c8d5c835f59',level='L1',branch=0)
    put(s,4329,'sense:select:b424628e511b5345',level='L2',branch=1)
    put(s,4329,'sense:select:dc58513403345186',level='L3',branch=2)
    core(s,4329,'选择、挑选；精选的','to choose from a group; specially chosen or high-quality')

    # o4340 senior: preserve rank senses; add AmE final-year noun/adjective + senior to sb.
    ensure_absent(s,'senior',('final-year','final year','high school or college'))
    senior_student=s.new(4340,'ame_final_year_student','noun','（美式）高中或大学毕业年级学生','AmE: a student in the final year of high school or college',level='L2')
    senior_year=s.new(4340,'ame_final_year_level','adjective','（美式）毕业年级的；最高年级的','AmE: relating to the final year of high school or college',level='L2')
    s.add_colloc(4340,senior_student,'a high-school/college senior','高中/大学毕业年级学生','usage_example')
    s.add_colloc(4340,senior_year,'senior year','毕业年级','usage_example')
    add_anchored_construction(s,4340,'be senior to sb','比某人年长或级别更高','sense:senior:7502dd9002615e1b',level='L1')
    rebuild_core_exact(s,4340,['sense:senior:7502dd9002615e1b','sense:senior:57fcaa4b995e5002',senior_student,senior_year],
        '年长/级别更高；美式毕业年级学生或毕业年级的','older/higher in rank; in AmE also a final-year student or final-year level')

    # o4341 sensation: preserve state vs cause/entity distinction.
    ensure_absent(s,'sensation',('person or thing causing','causes great excitement','becomes extremely popular'))
    cause=s.new(4341,'cause_of_public_excitement','noun','引起轰动或广受关注的人/事物','a person or thing that causes great excitement or becomes extremely popular',level='L2')
    drop_collocation(s,4341,'media sensation')
    s.add_colloc(4341,cause,'a media/internet sensation','媒体/网络轰动人物或事物','usage_example')
    rebuild_core_exact(s,4341,['sense:sensation:d2ab604e42f65f1c','sense:sensation:57233352acf55bd3',cause],
        '感觉；公众轰动状态；引起轰动的人或事物','a physical sensation; public excitement; a person or thing causing a sensation')

    # o4343 sensible: ordinary judgment main, older/technical branches low.
    put(s,4343,'sense:sensible:1f473616dc295903',level='L1',branch=0)
    put(s,4343,'sense:sensible:950a111aaac35e0e',level='L3',branch=1)
    put(s,4343,'sense:sensible:28388d75efb357e2',level='L3',branch=2)
    core(s,4343,'明智的；合理的','having or showing good sense or judgment')

    # o4344 sensitive: repair bodily definition; broaden confidential; add delicate-topic branch.
    bodily=next(x for x in s.record(4344)['senses'] if x.get('sense_id')=='sense:sensitive:be67ee99fa2955bd')
    bodily['definition_cn']='（皮肤、牙齿或身体部位）易受刺激、易疼痛或触痛的'
    bodily['definition_en']='easily irritated, painful, or tender, especially of skin, teeth, or a body area'
    bodily['sense_label_en']=bodily['definition_en']
    s.senses['sense:sensitive:be67ee99fa2955bd']['definition_cn']=bodily['definition_cn']
    s.senses['sense:sensitive:be67ee99fa2955bd']['definition_en']=bodily['definition_en']
    s.changed_sense_ids.add('sense:sensitive:be67ee99fa2955bd'); s.mark(4344)
    confidential=next(x for x in s.record(4344)['senses'] if x.get('sense_id')=='sense:sensitive:d97984d4b1105312')
    confidential['definition_cn']='敏感或机密的；需谨慎处理的信息/数据'
    confidential['definition_en']='confidential, private, or otherwise requiring careful handling, especially information or data'
    confidential['sense_label_en']=confidential['definition_en']
    s.senses['sense:sensitive:d97984d4b1105312']['definition_cn']=confidential['definition_cn']
    s.senses['sense:sensitive:d97984d4b1105312']['definition_en']=confidential['definition_en']
    s.changed_sense_ids.add('sense:sensitive:d97984d4b1105312'); s.mark(4344)
    ensure_absent(s,'sensitive',('likely to cause strong reactions','requiring tact','delicate subject'))
    topic=s.new(4344,'delicate_topic','adjective','（话题/问题）敏感的；需谨慎处理、易引发强烈反应的','of a subject or issue: requiring care or tact, or likely to cause strong reactions',level='L2')
    s.add_colloc(4344,topic,'a sensitive subject/issue','敏感话题/问题','usage_example')
    core(s,4344,'敏感/灵敏；善解人意；身体部位易刺激/疼痛；敏感信息或话题','responsive/sensitive; considerate; physically tender; confidential information or delicate topics')

    # o4347 separate: same-owner POS-conditioned pronunciation boundary only.
    set_form_identity(s,4347,'same_owner_pos_pronunciation_boundary',[
        {'condition':'verb separate','pronunciation':'/ˈsepəreɪt/','note':'verb pronunciation'},
        {'condition':'adjective/noun separate','pronunciation':'/ˈsepərət/','note':'adjective/noun pronunciation'},
    ])

    # o4353 servant: keep domestic servant; move public servant to a distinct service-to-state branch.
    ensure_absent(s,'servant',('public or state','serves the public','government or public institution'))
    public=s.new(4353,'public_service_person','noun','为公众、政府或公共机构服务的人；公仆、公务人员','a person who serves the public, government, or a public institution',level='L2')
    drop_collocation(s,4353,'public servant')
    s.add_colloc(4353,public,'public servant','公务员；公仆','fixed_pattern')
    rebuild_core_exact(s,4353,['sense:servant:48cb3f67c9905b3e',public],'仆人、佣人；也可指为公众/政府服务的人','a domestic servant; also a person serving the public or government')

    # o4354 serve: add ordinary verb sports serve + serve a sentence/time.
    ensure_absent(s,'serve',('hit the ball to start play','serve a sentence','spend a period in prison'))
    sports=s.new(4354,'sports_serve_verb','verb','（网球等）发球','to hit the ball to start play in a sport such as tennis',level='L2',pattern='I/T')
    sentence=s.new(4354,'serve_sentence_time','verb','服（刑）；服满一段刑期','to spend a stated period in prison or serve a sentence',level='L2',pattern='vt. + object')
    s.add_colloc(4354,sports,'serve the ball / serve first','发球/先发球','usage_example')
    s.add_colloc(4354,sentence,'serve a sentence / serve time','服刑','fixed_pattern')
    core(s,4354,'服务/供应；担任/任职；起作用；体育发球；服刑','to provide service, function or hold a post; sports serve; serve a sentence/time')

    # o4357 set: include active L1 device-control sense in compressed Core.
    rebuild_core_exact(s,4357,['sense:set:02ddfcfef7f55fb9','sense:set:9c13282fed205952','sense:set:e35a11f071fd57ae','sense:set:c1fcf35dafba5ae3','sense:set:8b693cfaf27a535e'],
        '放置；设定/确定；调节设备；一套/一组；日月落下','to place; establish/set; adjust a device or control; a group/set; for the sun or moon to go down')

    # o4359 setting: modern device/app/system configuration branch absent -> genuine NEW.
    ensure_absent(s,'setting',('device','app','configuration','selected value'))
    config=s.new(4359,'device_configuration','noun','（设备、应用或系统的）设置、配置项或选定值','a selected configuration, value, or option on a device, app, or system',level='L1')
    s.add_colloc(4359,config,'change/check the settings','更改/查看设置','usage_example')
    rebuild_core_exact(s,4359,['sense:setting:c783edf4c54a53d8',config,'sense:setting:a93aed55229450b2'],
        '环境/背景；设备或应用设置；物理位置','context/environment; a device or app setting; physical position')

    # o4360 settle: restore exact common stable branches; bench stays reference-only.
    put(s,4360,'sense:settle:dea8fffb756f5923',level='L1',branch=0)
    put(s,4360,'sense:settle:04ecc4f1d5475067',level='L1',branch=1)
    put(s,4360,'sense:settle:30084435b7b15901',level='L2',branch=2)
    put(s,4360,'sense:settle:be4bab6651795b84',level='L2',branch=3)
    core(s,4360,'解决/达成协议；定居；结清款项；落下/停稳','to resolve or reach agreement; settle somewhere; pay an account; come to rest')

    # o4365 several: quantifier/adjective and pronoun main; distinct/individual low.
    put(s,4365,'sense:several:822fe029d2025093',level='L1',branch=0)
    put(s,4365,'sense:several:a0af9491546e5399',level='L1',branch=1)
    put(s,4365,'sense:several:30dbfbafd9b4549f',level='L3',branch=2)
    core(s,4365,'几个、数个；数量多于两个但不算多','more than two but not many; several as adjective/quantifier or pronoun')

    # o4368 sex: separate biological/physical classification from sexual activity; preserve existing relation.
    rebuild_core_exact(s,4368,['sense:sex:3f9e8ab531e75f26','sense:sex:a44092c869815937'],
        '生物/身体性别分类；性行为/性活动（与 gender 有关联但不等同）','biological/physical sex classification; sexual activity; related to but not identical with gender')

    # o4372 shaft: Sol-owned split of polluted composite identity into two genuine child branches.
    polluted='sense:shaft:8c68fc2e02025abd'
    if polluted not in s.senses: raise RuntimeError('SHAFT_POLLUTED_ID_MISSING')
    s.remove_sense(4372,polluted)
    fit=s.new(4372,'fit_with_shaft','verb','给……装杆、轴或柄','to fit something with a shaft, axle, or handle',level='L3',pattern='vt. + object')
    unfair=s.new(4372,'treat_unfairly_slang','verb','（非正式/俚语）不公平对待、坑害','informal/slang: to treat someone unfairly or cheat them',level='L3',pattern='vt. + object')
    s.senses[polluted]['split_into_sense_ids']=[fit,unfair]
    s.senses[polluted]['split_authority']=AUTHORITY
    s.changed_sense_ids.add(polluted)
    s.add_colloc(4372,fit,'shaft a tool/implement','给工具装柄/杆','usage_example')
    s.add_colloc(4372,unfair,'get/be shafted','被坑、被不公平对待','usage_example')
    rebuild_core_exact(s,4372,['sense:shaft:5770b0454fa754cd','sense:shaft:fce6cf981a615744','sense:shaft:ef20ebd91fcc5c7b','sense:shaft:c99d0f2414b75fe8'],
        '长杆/轴/柄；垂直井道等狭长结构','a long rod/shaft or narrow vertical passage; low-frequency verb extensions remain separate')

    # o4374 shall: modern learner model using existing modal identities + constructions.
    future=next(x for x in s.record(4374)['senses'] if x.get('sense_id')=='sense:shall:bd9664016b6f547b')
    future['level']='L3'; future['definition_cn']='（较正式/较传统）与 I/we 连用表示将来'
    future['definition_en']='formal or traditional: used with I/we for future reference'
    future['sense_label_en']=future['definition_en']
    s.senses['sense:shall:bd9664016b6f547b']['definition_cn']=future['definition_cn']
    s.senses['sense:shall:bd9664016b6f547b']['definition_en']=future['definition_en']
    s.changed_sense_ids.add('sense:shall:bd9664016b6f547b'); s.mark(4374)
    obligation=next(x for x in s.record(4374)['senses'] if x.get('sense_id')=='sense:shall:187243bceee15677')
    obligation['level']='L1'; obligation['definition_cn']='（正式/法律）应当、必须；表示义务或要求'
    obligation['definition_en']='formal/legal: used to express an obligation, requirement, or mandatory provision'
    obligation['sense_label_en']=obligation['definition_en']
    s.senses['sense:shall:187243bceee15677']['definition_cn']=obligation['definition_cn']
    s.senses['sense:shall:187243bceee15677']['definition_en']=obligation['definition_en']
    s.changed_sense_ids.add('sense:shall:187243bceee15677'); s.mark(4374)
    add_anchored_construction(s,4374,'Shall I/we ...?','我/我们……好吗？用于提议、建议或主动提出做某事','sense:shall:bd9664016b6f547b',level='L1',note='especially BrE or formal')
    add_anchored_construction(s,4374,'shall + base verb (formal/legal)','正式或法律文本中表示义务、要求或强制规定','sense:shall:187243bceee15677',level='L1')
    core(s,4374,'Shall I/we...? 用于提议/建议；正式法律 shall 表义务/要求；第一人称将来用法较正式/传统','Shall I/we...? for offers/suggestions; formal/legal shall for obligation; first-person future is formal/traditional')

    if set(s.changed_word_ordinals)!=set(SOURCE):
        raise RuntimeError(f'SHARD5_CHANGED_OWNER_MISMATCH expected={list(SOURCE)} actual={sorted(s.changed_word_ordinals)}')


def main():
    if len(SOURCE)!=16: raise RuntimeError('SHARD5_CONTRACT_DRIFT')
    s=base.Store(); apply(s); s.finalize()
    natural,_relations,report=build()
    if report.get('status')!='PASS': raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    for o in SOURCE: dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])

    no_change=[o for o in range(4325,4375) if o not in SOURCE]
    bad=[]
    for o in no_change:
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()): bad.append(o)
    if bad: raise RuntimeError(f'NO_CHANGE_BYTE_GUARD_FAILED {bad}')
    if sorted(s.changed_word_ordinals)!=sorted(SOURCE): raise RuntimeError('SHARD5_FINAL_CHANGED_OWNER_MISMATCH')

    shaft=json.loads((OWNER_DIR/'o4372.json').read_text(encoding='utf-8'))
    refs={x.get('stable_sense_id'):x for x in shaft.get('reference_senses',[])}
    old=refs.get('sense:shaft:8c68fc2e02025abd')
    if not old or old.get('status')!='deprecated': raise RuntimeError('SHAFT_COMPOSITE_NOT_RETIRED')
    if len(old.get('split_into_sense_ids',[]))!=2: raise RuntimeError('SHAFT_SPLIT_PROVENANCE_MISSING')
    shall=json.loads((OWNER_DIR/'o4374.json').read_text(encoding='utf-8'))
    patterns={x.get('pattern') for x in shall.get('record',{}).get('constructions',[])}
    if 'Shall I/we ...?' not in patterns or 'shall + base verb (formal/legal)' not in patterns: raise RuntimeError('SHALL_MODERN_MODEL_READBACK_FAILED')

    receipt={
      'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTHORITY,
      'package':[4125,4374],'shard':[4325,4374],'reviewed_owner_count':50,'semantic_mutation_source_count':16,
      'semantic_source_ordinals':list(SOURCE),'changed_word_ordinals':sorted(s.changed_word_ordinals),'in_range_changed_word_ordinals':list(SOURCE),
      'out_of_range_dependency_ordinals':[],'no_change_word_ordinals':no_change,'new_semantic_branch_ids':sorted(set(s.new_stable_sense_ids)),
      'new_semantic_branch_count':len(set(s.new_stable_sense_ids)),'reactivated_stable_ids':sorted(set(s.changed_sense_ids)-set(s.new_stable_sense_ids)),
      'demoted_stable_ids':sorted(sid for sid in s.changed_sense_ids if s.senses.get(sid,{}).get('status')=='deprecated'),
      'changed_relation_owner_paths':[],
      'identity_closure':{'shaft_polluted_composite_split':'PASS','separate_pronunciation':'PASS'},
      'readback':{'all_50_owner_views':'PASS','all_16_authorized_semantic_sources':'PASS','no_change_34_byte_guard':'PASS','no_remote_dependency_writes':'PASS','shaft_split':'PASS','shall_modern_model':'PASS','stable_registry_closure':'PASS','natural_owner_registry_audit':'PASS'},
    }
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True); out=RECEIPT_DIR/'o4325-o4374.json'; out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'SHARD5_PASS changed_in_range={len(SOURCE)} new={len(set(s.new_stable_sense_ids))} receipt={out.relative_to(ROOT)}')

if __name__=='__main__': main()
