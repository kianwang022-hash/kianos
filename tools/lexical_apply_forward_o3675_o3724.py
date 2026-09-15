#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3625-o3874, shard o3675-o3724."""
from __future__ import annotations
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_forward_o3625_o3674 as fwd
base=fwd.base
LEX=fwd.LEX; OWNER=fwd.OWNER; RECEIPT=fwd.RECEIPT; AUTH=fwd.AUTH
DELTA=[3675,3676,3680,3683,3685,3686,3691,3694,3695,3698,3699,3704,3711,3717,3718,3720,3722,3723]
REMOTE=[7289]
NO_CHANGE=[o for o in range(3675,3725) if o not in DELTA]
base.DELTA=DELTA; base.REMOTE_WORDS=REMOTE; base.AUTH=AUTH; base.NOW='2026-09-16T00:45:00Z'

def add_practise_practice_relation(s):
    rid='relation:horizontal:'+fwd.sha({'type':'regional_spelling_pos_variant','members':['practise','practice']})[:20]
    p=base.relation_owner_path(rid); relpath=p.relative_to(ROOT).as_posix()
    if p.exists(): raise RuntimeError(f'PRACTISE_PRACTICE_RELATION_ALREADY_EXISTS:{rid}')
    note='BrE normally uses practice as the noun and practise as the verb; AmE normally uses practice for both noun and verb. Both frozen Main Word identities remain, and the relation carries the regional/POS spelling boundary.'
    views=[]
    for o,target in [(3718,7289),(7289,3718)]:
        owner=s.owner(o); idx=sum(1 for r in owner.get('relation_refs',[]) if r.get('field')=='semantic_neighbors')
        payload={'relation_id':rid,'relation_type':'spelling_variant','relation_scope':'lexeme','direction':'C','priority':'A','publication_status':'codex_reviewed','verification_status':'verified','writing_safe':True,'source_expression':owner['word'],'target_expression':s.owner(target)['word'],'target_word':s.owner(target)['word'],'boundary':note,'boundaries':[note],'learning_note':note,'task_tags':['reading','writing'],'standard_form_bre_noun':'practice','standard_form_bre_verb':'practise','standard_form_ame_noun':'practice','standard_form_ame_verb':'practice'}
        views.append({'source_word_id':owner['word_id'],'source_ordinal':o,'field':'semantic_neighbors','index':idx,'payload':payload})
        owner.setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':'semantic_neighbors','index':idx}); s.mark(o)
    base.dump(p,{'schema':'kianos.lexical.relation_owner.v1','relation_id':rid,'canonical_record':None,'fact_record':None,'word_views':views,'provenance':{'materialized_from':'forward semantic reconciliation','semantic_delta':1,'authority':AUTH}}); s.changed_relations.add(relpath)
    m=base.load(LEX/'relations'/'manifest.json'); m['relation_count']=int(m.get('relation_count',0))+1; base.dump(LEX/'relations'/'manifest.json',m)
    return rid,relpath

def apply(s):
    s.update_sense(3675,'sense:ponder:3aa36e074f805629',pattern='vt. + object / vi. + over/on/upon',transitivity='vt/vi',usage_note='Commonly transitive (ponder the question/problem) as well as prepositional/intransitive (ponder over/on/upon sth).')

    pool=s.add_new(3676,'cue_sport_pool','noun','普尔台球；美式台球','the cue sport played on a pool table, especially forms of pocket billiards','L2')
    fwd.add_colloc(s,3676,pool,'play pool','打普尔台球','usage_example'); s.add_cluster(3676,pool,'noun','普尔台球','the cue sport pool')
    s.set_core(3676,'水池；共享资源；普尔台球；汇聚','a pool of water/resources; the cue sport; to pool resources')

    popular=s.reactivate(3680,'sense:popular:56bc6ae178a25629',cn='大众的；民众的；面向普通公众的',en='of, relating to, or intended for the general public; widely current among ordinary people',level='L1',pos='adjective')
    fwd.add_colloc(s,3680,popular,'popular culture/belief/press','大众文化/普遍信念/大众报刊','usage_example'); fwd.set_clusters(s,3680,[{'label_cn':'受欢迎的；广受喜爱的','label_en':'liked or admired by many people','pos':'adjective','sense_ids':['sense:popular:8483fdba56405bcb']},{'label_cn':'大众的；面向公众的；广泛流行的','label_en':'of or relating to the general public; widely current','pos':'adjective','sense_ids':[popular]}],'受欢迎的；大众的/广泛流行的','liked by many; of or widespread among the general public')

    s.update_sense(3683,'sense:porch:766c260e4a385ed6',cn='门廊；建筑物入口处或外侧的有顶平台/结构',en='a structure attached to the exterior of a building, often forming a covered entrance',level='L1')
    s.set_core(3683,'门廊；建筑物入口外侧的有顶结构','a covered entrance or exterior porch structure')

    s.update_sense(3685,'sense:port:18c3f1faf4bb5600',cn='港口；海港',en='a harbor or seaport where ships load, unload, arrive, or depart; broader entry-point uses occur in compounds such as port of entry',level='L1',usage_note='Plain port ordinarily means a harbor/seaport; airport belongs only in bounded expressions such as port of entry, not as the default meaning of port.')
    portwine=s.add_new(3685,'fortified_wine_port','noun','波特酒；葡萄牙加强葡萄酒','a sweet fortified wine, traditionally from Portugal','L2')
    fwd.add_colloc(s,3685,portwine,'a glass of port','一杯波特酒','usage_example'); s.add_cluster(3685,portwine,'noun','波特酒','fortified wine called port')
    s.set_core(3685,'港口；左舷；端口；波特酒；移植软件','a seaport; port side; computer port; port wine; to port software')

    # False historical family teaching: portable is not productively derived from modern port 'harbor/endpoint'.
    s.rec(3686)['word_family']=[]; s.mark(3686)
    s.update_sense(3686,'sense:portable:de179d4ff4cc5bbe',usage_note='portable means easily carried or moved; do not learn it as a productive derivative of modern port “harbor/endpoint”.')

    s.update_sense(3691,'sense:portray:27f7c015dc585e14',cn='描绘；描写；表现；扮演（角色）',en='to depict or represent someone or something in words, pictures, film, or acting',level='L1',usage_note='Covers representation across words, images, film, and acting; portray a character/person is an ordinary performance use.')
    fwd.add_construction(s,3691,'portray sb/sth as + adj/n','把某人/某事描绘成……','to represent or present someone or something as having a particular character, quality, or role','sense:portray:27f7c015dc585e14','L1')
    s.set_core(3691,'描绘；表现；扮演','depict or represent in words, images, film, or acting')

    s.update_sense(3694,'sense:positive:b14428dae66d5e05',cn='肯定的；积极的；有利的；建设性的',en='affirmative, optimistic, beneficial, favorable, or constructive',level='L1')
    fwd.add_colloc(s,3694,'sense:positive:b14428dae66d5e05','positive effect/outcome','积极/有利的影响或结果','usage_example')
    sign=s.add_new(3694,'greater_than_zero_positive_charge','adjective','正的；大于零的；带正电的','greater than zero in mathematics or having positive electric charge','L2')
    fwd.add_colloc(s,3694,sign,'positive number/charge','正数/正电荷','usage_example'); s.add_cluster(3694,sign,'adjective','正的；正电的','greater than zero or positively charged')
    s.set_core(3694,'肯定/积极/有利的；阳性的；正数/正电的','affirmative or beneficial; positive test; greater than zero or positively charged')

    s.update_sense(3695,'sense:possess:f134c6d5241251fd',cn='拥有；具有；占有',en='to have, own, hold, or come to have something, including property, wealth, qualities, knowledge, or skills',level='L1')
    s.set_core(3695,'拥有/占有；具有；（情绪/观念）支配','to own or have something; to possess a quality; to be controlled by an emotion/idea')

    s.rename_colloc(3698,'possible to do + sth','it is possible to do sth','可能做某事')
    fwd.add_construction(s,3698,'possible for sb to do sth','某人有可能做某事','used when a particular person or group can do something','sense:possible:0f704184829a523c','L1')

    fwd.set_clusters(s,3699,[{'label_cn':'岗位/哨位；柱；邮件系统；职位','label_en':'a station/post; upright post; mail system; job position','pos':'noun','sense_ids':['sense:post:15fa5b8a06c35faa','sense:post:4b389a84646b5db5','sense:post:eec6784c57165208','sense:post:0ee377ea18f553ab']},{'label_cn':'网络帖子；发布网络内容','label_en':'an online post; to post/publish content online','pos':'noun/verb','sense_ids':['sense:post:e6a8ac9694615c8e','sense:post:33032e9e4b1b5368']},{'label_cn':'邮寄；张贴公告','label_en':'send by post; display a notice','pos':'verb','sense_ids':['sense:post:e330787d6a6e54c4','sense:post:eb8f34a5115356a0']}],'岗位/柱/邮件/职位；网络帖子与发布','a post/position or upright post; mail; an online post and to post content')

    fwd.add_construction(s,3704,'postpone doing sth','推迟做某事','to delay an action until a later time','sense:postpone:768dbb0d0b305b8b','L1')

    throb=s.add_new(3711,'throb_beat_heavily','verb','剧烈跳动；怦怦地跳；阵阵作痛','to beat, throb, or pulse heavily and repeatedly, as the heart or head may do','L2')
    fwd.add_colloc(s,3711,throb,'heart/head pounded','心怦怦跳/头阵阵作痛','usage_example'); s.add_cluster(3711,throb,'verb','剧烈跳动；怦怦跳','throb or beat heavily')
    s.set_core(3711,'磅/英镑；反复猛击；心或头怦怦跳','pound as weight/currency; hit repeatedly; throb heavily')

    sensible=s.add_new(3717,'sensible_realistic','adjective','实际可行的；现实而明智的','sensible, realistic, and workable in the circumstances','L1')
    fwd.add_colloc(s,3717,sensible,'a practical solution/decision','实际可行的解决方案/明智决定','usage_example'); s.add_cluster(3717,sensible,'adjective','实际可行的；现实明智的','sensible and realistic in the circumstances')
    s.set_core(3717,'实际的；实用的；现实可行/明智的','real-world; useful; sensible and realistic')

    rid,relpath=add_practise_practice_relation(s)
    s.update_sense(3718,'sense:practise:cbcaec17dc4a53d9',usage_note='BrE verb spelling: practise. AmE normally spells the verb practice; the noun is practice in both varieties.')
    s.update_sense(3718,'sense:practise:acdba0b73d935045',usage_note='BrE verb spelling: practise (e.g. practise medicine/law). AmE normally uses practice as the verb spelling.')

    s.rename_colloc(3720,'sing high praise for + sth','sing the praises of sb/sth','盛赞某人/某事')

    prayer=s.reactivate(3722,'sense:prayer:2a448d26d40d5d44',cn='祷告；祈祷词；向神提出的请求',en='words or a request addressed to God or a deity in prayer',level='L1',pos='noun')
    s.move_colloc(3722,'say a prayer',prayer)
    fwd.add_colloc(s,3722,prayer,'a prayer for sb/sth','为某人/某事的祈祷','usage_example')
    fwd.set_clusters(s,3722,[{'label_cn':'祈祷这一行为','label_en':'the act or practice of praying','pos':'noun','sense_ids':['sense:prayer:4ac918d9cd655700']},{'label_cn':'祈祷词；祷告；祈求','label_en':'words or a request addressed to a deity','pos':'noun','sense_ids':[prayer]}],'祈祷；祈祷词/祈求','the act of praying or the words/request used in a prayer')

    fwd.add_construction(s,3723,'practice what you preach','言行一致；身体力行自己所宣扬的主张','to behave according to the advice or principles that you tell other people to follow','sense:preach:d2211346965b5527','L1','idiom tied to the advocacy/preaching branch')

    for o in DELTA+REMOTE: s.mark(o)
    return rid,relpath

def verify(s,rid,relpath,before_nochange):
    errors=[]; expected=set(DELTA+REMOTE)
    if set(s.changed_words)!=expected: errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    expected_new={base.sense_id('pool','cue_sport_pool'),base.sense_id('port','fortified_wine_port'),base.sense_id('positive','greater_than_zero_positive_charge'),base.sense_id('pound','throb_beat_heavily'),base.sense_id('practical','sensible_realistic')}
    if set(s.new_senses)!=expected_new: errors.append(f'NEW_SENSE_SET:{sorted(s.new_senses)}')
    for sid in ['sense:popular:56bc6ae178a25629','sense:prayer:2a448d26d40d5d44']:
        if sid not in s.reactivated: errors.append(f'REACTIVATION_MISSING:{sid}')
    if s.rec(3686).get('word_family'): errors.append('PORTABLE_FALSE_FAMILY_REMAINS')
    if 'vt/vi'!=s.active_sense(3675,'sense:ponder:3aa36e074f805629').get('transitivity'): errors.append('PONDER_FRAME')
    if any(c.get('phrase')=='possible to do + sth' for x in s.active(3698) for c in x.get('collocations',[])): errors.append('POSSIBLE_MALFORMED_REMAINS')
    if any(c.get('phrase')=='sing high praise for + sth' for x in s.active(3720) for c in x.get('collocations',[])): errors.append('PRAISE_BAD_PHRASE_REMAINS')
    if relpath not in s.changed_relations: errors.append('PRACTISE_PRACTICE_RELATION_NOT_WRITTEN')
    for o in (3718,7289):
        if not any(r.get('relation_id')==rid for r in s.owner(o).get('relation_refs',[])): errors.append(f'PRACTISE_PRACTICE_REF_MISSING:{o}')
    for o in DELTA+REMOTE:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active': errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')
    for o,h in before_nochange.items():
        if base.sha(base.load(OWNER/f'o{o:04d}.json'))!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    if base.load(LEX/'relations'/'manifest.json').get('relation_count')!=382: errors.append('RELATION_MANIFEST_NOT_382')
    return errors

def main():
    before={o:base.sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State(); rid,relpath=apply(s); s.sync_registry_files()
    for o in sorted(s.changed_words): fwd.sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,rid,relpath,before)
    if errors: raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTH,'package':[3625,3874],'shard':[3675,3724],'reviewed_owner_count':50,'semantic_mutation_source_count':18,'semantic_source_ordinals':DELTA,'changed_word_ordinals':sorted(s.changed_words),'in_range_changed_word_ordinals':DELTA,'out_of_range_dependency_ordinals':REMOTE,'no_change_word_ordinals':NO_CHANGE,'new_semantic_branch_ids':sorted(s.new_senses),'new_semantic_branch_count':len(s.new_senses),'reactivated_stable_ids':sorted(set(s.reactivated)),'new_relation_id':rid,'changed_relation_owner_paths':sorted(s.changed_relations),'relation_manifest_count':382,'readback':{'all_50_owner_views':'PASS','all_18_authorized_semantic_sources':'PASS','no_change_32_byte_guard':'PASS','practise_practice_boundary':'PASS','stable_registry_closure':'PASS'}}
    base.dump(RECEIPT/'o3675-o3724.json',receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
