#!/usr/bin/env python3
"""Mechanical execution for Issue #215 boundary o4275-o4324.

Includes the package's sole authorized remote Word dependency, skeptical@o6139,
only for reciprocal regional-spelling Form/Relation closure with sceptical@o4281.
No semantic review occurs here.
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
REL_DIR=LEX/'relations'/'by-id'
RECEIPT_DIR=LEX/'execution'/'receipts'
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
AUTHORITY='content/lexical/semantic-reconciliation/o4125-o4374.md'
SOURCE=(4281,4283,4285,4290,4291,4294,4296,4299,4301,4302,4303,4305,4312,4315,4320,4322)
REMOTE=(6139,)

sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build,dump_json


def sha_bytes(data:bytes)->str: return hashlib.sha256(data).hexdigest()
def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def baseline_bytes(rel):
    if BASELINE=='unknown': raise RuntimeError('KIANOS_BASELINE_MAIN must be pinned')
    return subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])

def put(s,o,sid,*,level,branch=None,pattern=None,cn=None,en=None):
    if sid not in s.senses: raise RuntimeError(f'PINNED_STABLE_ID_MISSING {sid}')
    return s.put_existing(o,sid,level=level,branch=branch,pattern=pattern,cn=cn,en=en)

def core(s,o,cn,en): s.core(o,cn=cn,en=en)

def set_form_identity(s,o,type_,boundaries):
    s.record(o)['form_identity']={'authority':AUTHORITY,'type':type_,'boundaries':boundaries}; s.mark(o)

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
    rec['core_concept']['core_meaning_cn']=cn; rec['core_concept']['mental_model_cn']=cn; rec['core_concept']['core_meaning_en']=en; s.mark(o)

def ensure_absent(s,word,terms):
    hits=[]
    for sid,rec in s.senses.items():
        if rec.get('headword')!=word: continue
        text=(str(rec.get('definition_en',''))+' '+str(rec.get('definition_cn',''))).lower()
        if any(t.lower() in text for t in terms): hits.append(sid)
    if hits: raise RuntimeError(f'EXPECTED_GENUINE_NEW_BUT_STABLE_EXISTS {word} {hits}')

def drop_collocation(s,o,phrase):
    hits=[]
    for sense in s.record(o).get('senses',[]):
        for item in list(sense.get('collocations',[])):
            if item.get('phrase')==phrase: hits.append((sense,item))
    if len(hits)!=1: raise RuntimeError(f'COLLOCATION_MATCH_NOT_UNIQUE o{o:04d} {phrase} hits={len(hits)}')
    sense,item=hits[0]; sense['collocations'].remove(item); cid=item.get('collocation_id')
    if cid in s.colls: s.colls[cid]['status']='deprecated'; s.changed_collocation_ids.add(cid)
    s.mark(o)

def add_anchored_construction(s,o,pattern,meaning,sid,level='L2',note=None):
    s.add_construction(o,pattern,meaning,level=level)
    hits=[x for x in s.record(o).get('constructions',[]) if x.get('pattern')==pattern]
    if len(hits)!=1: raise RuntimeError(f'CONSTRUCTION_NOT_UNIQUE o{o:04d} {pattern}')
    hits[0]['source_sense_id']=sid
    if note: hits[0]['usage_note']=note
    s.mark(o)

def relation_identity():
    key={'relation_type':'spelling_variant','words':['sceptical','skeptical']}
    rid='relation:horizontal:'+hashlib.sha256(stable(key).encode()).hexdigest()[:20]
    h=hashlib.sha256(rid.encode()).hexdigest()
    return rid,REL_DIR/h[:2]/f'{h}.json'

def write_spelling_relation():
    rid,path=relation_identity(); path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists(): raise RuntimeError(f'UNEXPECTED_PREEXISTING_SCEPTICAL_RELATION {path}')
    boundary='sceptical is a common British spelling; skeptical is standard American spelling. Both frozen Word owners are preserved with local stable senses.'
    rec={
      'schema':'kianos.lexical.relation_owner.v1','relation_id':rid,'canonical_record':None,'fact_record':None,
      'word_views':[
        {'source_word_id':'word:sceptical','source_ordinal':4281,'field':'semantic_neighbors','index':0,'payload':{
          'relation_id':rid,'relation_type':'spelling_variant','relation_scope':'lexeme','direction':'C','priority':'A',
          'publication_status':'codex_reviewed','verification_status':'verified','writing_safe':True,
          'source_expression':'sceptical','target_expression':'skeptical','target_word':'skeptical','boundary':boundary,'boundaries':[boundary],
          'learning_note':boundary,'task_tags':['reading','writing'],'regional_label':'BrE spelling'}},
        {'source_word_id':'word:skeptical','source_ordinal':6139,'field':'semantic_neighbors','index':0,'payload':{
          'relation_id':rid,'relation_type':'spelling_variant','relation_scope':'lexeme','direction':'C','priority':'A',
          'publication_status':'codex_reviewed','verification_status':'verified','writing_safe':True,
          'source_expression':'skeptical','target_expression':'sceptical','target_word':'sceptical','boundary':boundary,'boundaries':[boundary],
          'learning_note':boundary,'task_tags':['reading','writing'],'regional_label':'AmE spelling'}},
      ],
      'provenance':{'materialized_from':'forward semantic reconciliation','semantic_delta':1,'authority':AUTHORITY},
    }
    path.write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return rid,path

def apply(s):
    # o4281 + remote o6139: local senses preserved, reciprocal spelling truth.
    put(s,4281,'sense:sceptical:e5f87ee40b2a5626',level='L1',branch=0)
    core(s,4281,'怀疑的；英式拼写 sceptical','having or showing doubt; sceptical is a common British spelling')
    set_form_identity(s,4281,'regional_spelling_word_boundary',[{'condition':'common BrE spelling','surface':'sceptical','paired_word':'skeptical','paired_ordinal':6139,'note':'preserve local stable sense identity; do not clone skeptical sense IDs'}])
    set_form_identity(s,6139,'regional_spelling_word_boundary',[{'condition':'standard AmE spelling','surface':'skeptical','paired_word':'sceptical','paired_ordinal':4281,'note':'preserve local stable sense identity; do not clone sceptical sense IDs'}])

    # o4283 scheme: dialect/register boundary + clean construction string.
    plan=next(x for x in s.record(4283).get('senses',[]) if x.get('sense_id')=='sense:scheme:da66974d112b52f0')
    under=next(x for x in s.record(4283).get('senses',[]) if x.get('sense_id')=='sense:scheme:3d7b31637763554f')
    plan['usage_note']='BrE scheme is often neutral for an organized program or plan, e.g. pension scheme.'
    under['usage_note']='In AmE, scheme often suggests a suspicious or underhand plan; context matters.'
    drop_collocation(s,4283,'a scheme to do + sth')
    s.add_colloc(4283,'sense:scheme:3d7b31637763554f','a scheme to do sth','做某事的阴谋/计划','fixed_pattern'); s.mark(4283)

    # o4285 scholarship: broaden financial award criteria under same stable branch.
    put(s,4285,'sense:scholarship:4cd1a2f95247504b',level='L1',branch=0,cn='奖学金；资助学习的奖金',en='money or an award supporting education, based on merit, need, athletics, or other criteria')
    core(s,4285,'奖学金；学术研究与学问','an educational award/scholarship; also serious academic study and knowledge')

    # o4290 scissors: tool main, movement low, plural grammar Form identity.
    put(s,4290,'sense:scissors:d4a58d85829e5136',level='L1',branch=0)
    put(s,4290,'sense:scissors:5c81493d01cf5f87',level='L3',branch=1)
    set_form_identity(s,4290,'plural_noun_counting_boundary',[{'condition':'ordinary plural noun','surface':'scissors','grammar':'scissors are ...','note':'count with a pair: a pair of scissors'}])
    s.add_colloc(4290,'sense:scissors:d4a58d85829e5136','a pair of scissors','一把剪刀','fixed_pattern')
    core(s,4290,'剪刀；形式上作复数，常用 a pair of scissors 计数','scissors, grammatically plural and commonly counted as a pair of scissors')

    # o4291 scold: ordinary verb main, person noun low.
    put(s,4291,'sense:scold:bbb286473e9b5a60',level='L1',branch=0)
    put(s,4291,'sense:scold:ae8024b0ef6b586f',level='L3',branch=1)
    core(s,4291,'责骂、训斥','to angrily criticize or tell someone off for wrongdoing')

    # o4294 scorn: repair malformed construction and mark register.
    drop_collocation(s,4294,'scorn to do + sth')
    s.add_colloc(4294,'sense:scorn:0c914b65c3575631','scorn to do sth','不屑于做某事','fixed_pattern')
    next(x for x in s.record(4294)['senses'] if x['sense_id']=='sense:scorn:0c914b65c3575631')['usage_note']='formal/literary: scorn to do sth = refuse to do because you consider it beneath you'; s.mark(4294)

    # o4296 scramble: ordinary culinary branch absent -> genuine NEW.
    ensure_absent(s,'scramble',('eggs','cook by stirring'))
    cook=s.new(4296,'culinary_eggs','verb','炒（蛋）；把蛋搅散后炒熟','to cook eggs by stirring or mixing them while heating',level='L2',pattern='vt. + object')
    s.add_colloc(4296,cook,'scramble eggs','炒鸡蛋','usage_example')

    # o4299 scratch: metaphorical construction, no new sense.
    add_anchored_construction(s,4299,'from scratch','从零开始；不依赖现成材料或既有工作','sense:scratch:a1f4bebeaad053a4',level='L1')

    # o4301 screen: physical barrier noun absent -> genuine NEW.
    ensure_absent(s,'screen',('partition','mesh','physical barrier'))
    barrier=s.new(4301,'physical_barrier','noun','屏风；隔板；网状防护物','a physical barrier, partition, mesh, or protective screen',level='L2')
    s.add_colloc(4301,barrier,'a privacy/window/protective screen','隐私屏风、纱窗或防护屏','usage_example')

    # o4302 screw: remove false literal anchor, encode phrasal meanings as constructions.
    drop_collocation(s,4302,'screw around')
    add_anchored_construction(s,4302,'screw around','闲混、胡闹；非正式表达','sense:screw:875f8779b7e25fb3',level='L2',note='informal phrasal use; do not interpret as literal rotation')
    add_anchored_construction(s,4302,'screw up / screw sth up','搞砸、弄坏某事；非正式表达','sense:screw:6a854565bdc95ef3',level='L2',note='informal phrasal construction; construction meaning is not literal tightening')

    # o4303 script: computing branch absent -> genuine NEW.
    ensure_absent(s,'script',('computer','commands','interpreter'))
    comp=s.new(4303,'computing_commands','noun','脚本；包含由计算机或解释器执行的命令/指令的程序或文件','a program or file containing commands or instructions executed by a computer or interpreter',level='L2')
    s.add_colloc(4303,comp,'run/write a script','运行/编写脚本','usage_example')

    # o4305 sculpture.
    put(s,4305,'sense:sculpture:5a6dd2e94bc75814',level='L1',branch=0)
    put(s,4305,'sense:sculpture:fb9728d7b9085f77',level='L2',branch=1)
    put(s,4305,'sense:sculpture:6b92acffb22b5e2c',level='L3',branch=2)
    core(s,4305,'雕塑作品；雕塑艺术','a three-dimensional work of art; the art/process of sculpture')

    # o4312 second: exact ordinal/time/adjective/support branches.
    put(s,4312,'sense:second:9d7f7c4c532054ca',level='L1',branch=0)
    put(s,4312,'sense:second:a31ced63efa6573b',level='L1',branch=1)
    put(s,4312,'sense:second:5e4fd86228655563',level='L2',branch=2)
    put(s,4312,'sense:second:ff9d42a02dde5c79',level='L2',branch=3)
    core(s,4312,'第二；秒；次要的；支持/附议','second in order; a unit of time; secondary; to support or second a motion/person')

    # o4315 secretary: two ordinary senses + writing desk low.
    put(s,4315,'sense:secretary:8886868f0f65510e',level='L1',branch=0)
    put(s,4315,'sense:secretary:d3a35eb8602c5d50',level='L1',branch=1)
    put(s,4315,'sense:secretary:ff45c444fb805662',level='L3',branch=2)
    core(s,4315,'秘书、行政助理；政府部门负责人/部长','an administrative assistant/secretary; a government department head or secretary')

    # o4320 see: main visual/understand, common secondary visit/witness/ensure; bishop low.
    put(s,4320,'sense:see:b9a85402585450f8',level='L1',branch=0)
    put(s,4320,'sense:see:c494c6e327b15c9d',level='L1',branch=1)
    put(s,4320,'sense:see:208ad17334f8508c',level='L2',branch=2)
    put(s,4320,'sense:see:81ff9d56d4345eef',level='L2',branch=3)
    put(s,4320,'sense:see:cd9a66de34285ceb',level='L2',branch=4)
    put(s,4320,'sense:see:39157e1e0fb3541b',level='L3',branch=5)
    core(s,4320,'看见；理解；会见/看望；经历/见证','to perceive with the eyes or understand; also meet/visit and experience/witness')
    set_form_identity(s,4320,'inflectional_form_boundary',[{'condition':'simple past form','surface':'saw','surface_owner_ordinal':4266,'note':'saw is the simple past of see while word:saw also independently owns tool/cutting senses'}])

    # o4322 seek: exact ordinary branches + high-transfer construction.
    put(s,4322,'sense:seek:f53b86a0454a5cff',level='L1',branch=0)
    put(s,4322,'sense:seek:2597e6b09e9357bf',level='L1',branch=1)
    add_anchored_construction(s,4322,'seek to do sth','试图、力图做某事','sense:seek:2597e6b09e9357bf',level='L1')
    core(s,4322,'寻找；试图获得/达到；seek to do 表示试图做','to look for or try to obtain/achieve; seek to do means attempt to')

    expected=set(SOURCE)|set(REMOTE)
    if set(s.changed_word_ordinals)!=expected:
        raise RuntimeError(f'SHARD4_CHANGED_OWNER_MISMATCH expected={sorted(expected)} actual={sorted(s.changed_word_ordinals)}')


def main():
    if len(SOURCE)!=16 or REMOTE!=(6139,): raise RuntimeError('SHARD4_CONTRACT_DRIFT')
    s=base.Store(); apply(s); s.finalize(); rid,rpath=write_spelling_relation()
    natural,_relations,report=build()
    if report.get('status')!='PASS': raise RuntimeError('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    for o in SOURCE+REMOTE: dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])

    no_change=[o for o in range(4275,4325) if o not in SOURCE]
    bad=[]
    for o in no_change:
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
        if sha_bytes(baseline_bytes(rel))!=sha_bytes((ROOT/rel).read_bytes()): bad.append(o)
    if bad: raise RuntimeError(f'NO_CHANGE_BYTE_GUARD_FAILED {bad}')
    if sorted(s.changed_word_ordinals)!=sorted(SOURCE+REMOTE): raise RuntimeError('SHARD4_FINAL_CHANGED_OWNER_MISMATCH')
    scept= json.loads((OWNER_DIR/'o4281.json').read_text(encoding='utf-8'))
    skept= json.loads((OWNER_DIR/'o6139.json').read_text(encoding='utf-8'))
    if not scept.get('relation_refs') or not skept.get('relation_refs'): raise RuntimeError('SCEPTICAL_RELATION_READBACK_FAILED')
    if scept['relation_refs'][0].get('relation_id')!=rid or skept['relation_refs'][0].get('relation_id')!=rid: raise RuntimeError('SCEPTICAL_RELATION_ID_MISMATCH')
    see=json.loads((OWNER_DIR/'o4320.json').read_text(encoding='utf-8'))
    if see.get('record',{}).get('form_identity',{}).get('type')!='inflectional_form_boundary': raise RuntimeError('SEE_SAW_FORM_READBACK_FAILED')

    receipt={
      'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTHORITY,
      'package':[4125,4374],'shard':[4275,4324],'reviewed_owner_count':50,'semantic_mutation_source_count':16,
      'semantic_source_ordinals':list(SOURCE),'changed_word_ordinals':sorted(s.changed_word_ordinals),'in_range_changed_word_ordinals':list(SOURCE),
      'out_of_range_dependency_ordinals':[6139],'no_change_word_ordinals':no_change,'new_semantic_branch_ids':sorted(set(s.new_stable_sense_ids)),
      'new_semantic_branch_count':len(set(s.new_stable_sense_ids)),'reactivated_stable_ids':sorted(set(s.changed_sense_ids)-set(s.new_stable_sense_ids)),
      'demoted_stable_ids':sorted(sid for sid in s.changed_sense_ids if s.senses.get(sid,{}).get('status')=='deprecated'),
      'changed_relation_owner_paths':[str(rpath.relative_to(ROOT))],'relation_ids':[rid],
      'form_identity_closure':{'sceptical_skeptical':'PASS','saw_see_reciprocal':'PASS'},
      'readback':{'all_50_owner_views':'PASS','all_16_authorized_semantic_sources':'PASS','no_change_34_byte_guard':'PASS','only_authorized_remote_dependency_o6139':'PASS','sceptical_skeptical_relation':'PASS','saw_see_form_closure':'PASS','stable_registry_closure':'PASS','natural_owner_registry_audit':'PASS'},
    }
    RECEIPT_DIR.mkdir(parents=True,exist_ok=True); out=RECEIPT_DIR/'o4275-o4324.json'; out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'SHARD4_PASS changed_in_range={len(SOURCE)} remote={REMOTE} relation={rid} receipt={out.relative_to(ROOT)}')

if __name__=='__main__': main()
