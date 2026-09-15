#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3625-o3874, shard o3625-o3674."""
from __future__ import annotations
import copy, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_retro_o0025_o0224 as base

LEX=ROOT/'content'/'lexical'; OWNER=LEX/'words'/'by-ordinal'; RECEIPT=LEX/'execution'/'receipts'
AUTH='content/lexical/semantic-reconciliation/o3625-o3874.md'
DELTA=[3627,3629,3630,3631,3634,3644,3646,3647,3650,3653,3656,3657,3658,3660,3662,3663,3664,3666]
REMOTE=[7278]
NO_CHANGE=[o for o in range(3625,3675) if o not in DELTA]
base.DELTA=DELTA; base.REMOTE_WORDS=REMOTE; base.AUTH=AUTH; base.NOW='2026-09-16T00:30:00Z'

NEW_BRANCHES={
  3629:('figurative_artificial_insincere','adjective','虚假的；做作的；不真诚的','artificial, insincere, or not genuine in manner or appearance','L2'),
  3630:('tectonic_plate','noun','构造板块；地壳板块','a large rigid section of the Earth’s lithosphere that moves as a tectonic unit','L2'),
  3631:('reach_stable_level_verb','verb','达到并停留在稳定水平；进入平台期','to reach and remain at a relatively stable level after growth or progress','L2'),
  3634:('figurative_role_contribution','verb','发挥作用；在……中起作用','to have or perform a role or part in an event, process, or outcome','L1'),
  3634:('figurative_role_contribution','verb','发挥作用；在……中起作用','to have or perform a role or part in an event, process, or outcome','L1'),
  3647:('promote_publicize','verb','宣传；推广；为……做广告','informal: to promote, publicize, or advertise something','L2'),
  3666:('polish_language','noun','波兰语','the Polish language','L2'),
}
# play needs two new branches; handled explicitly below because dict keys are unique.


def stable(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha(v): return base.sha(v)

def add_colloc(s,o,sid,phrase,meaning,exam='fixed_pattern'):
    target=s.active_sense(o,sid)
    if not target: raise RuntimeError(f'COLLOCATION_TARGET_MISSING:{sid}')
    for sense in s.active(o):
        for c in sense.get('collocations',[]):
            if c.get('phrase')==phrase: return c
    word=s.owner(o)['word']; cid=base.colloc_id(word,sid,phrase)
    item={'collocation_id':cid,'exam_value':exam,'legacy_source_object_ids':[f'{sid}:collocation:forward-o3625-o3874'],'meaning_cn':meaning,'phrase':phrase}
    target.setdefault('collocations',[]).append(item)
    if cid not in s.coll_by_id:
        reg={'collocation_id':cid,'created_by':'forward-reconciliation-o3625-o3874','current_value_hash':base.sha(item),'legacy_source_object_ids':item['legacy_source_object_ids'],'record_type':'collocation_identity','schema_version':'kianos_collocation_identity_v1','sense_id':sid,'status':'active','word_id':f'word:{word}'}
        p=base.choose_shard(base.COLL_DIR,o); rows=base.load(p)
        row={'source_row':max([r.get('source_row',0) for r in rows]+[0])+1,'anchor_ordinal':o,'record':reg}
        rows.append(row); base.dump(p,rows); s.coll_rows[cid]=(p,len(rows)-1,row); s.coll_by_id[cid]=reg
    s.mark(o); return item

def add_construction(s,o,pattern,cn,en,source_sid=None,level='L1',boundary=None):
    cid='construction:'+sha({'word':s.owner(o)['word'],'pattern':pattern,'authority':AUTH})[:20]
    arr=s.rec(o).setdefault('constructions',[])
    if any(x.get('pattern')==pattern for x in arr): return
    x={'construction_id':cid,'direction':'R+P','level':level,'meaning_cn':cn,'definition_en':en,'pattern':pattern,'boundary':boundary or pattern}
    if source_sid: x['source_sense_id']=source_sid
    arr.append(x); s.mark(o)

def set_clusters(s,o,clusters,cn,en,mental=None):
    c=s.rec(o).setdefault('core_concept',{}); c['core_clusters']=clusters; c['core_meaning_cn']=cn; c['core_meaning_en']=en; c['mental_model_cn']=mental or cn; c.setdefault('mental_model_en',''); s.mark(o)

def set_form(s,o,obj):
    obj['authority']=AUTH; s.rec(o)['form_identity']=obj; s.mark(o)

def sync_owner(s,o):
    owner=s.owner(o); active_ids={x.get('sense_id') for x in s.active(o)}; refs=[]; ids=[]
    for sid,(p,_i,row) in s.sense_rows.items():
        if row.get('anchor_ordinal')!=o: continue
        reg=s.sense_by_id[sid]
        ids.append({'sense_id':sid,'status':reg.get('status'),'merged_into_sense_id':reg.get('merged_into_sense_id'),'source_row':row.get('source_row'),'source_path':p.relative_to(ROOT).as_posix()})
        if sid not in active_ids:
            ref={'stable_sense_id':sid,'status':reg.get('status'),'merged_into_sense_id':reg.get('merged_into_sense_id'),'pos':reg.get('pos'),'definition_cn':reg.get('definition_cn'),'definition_en':reg.get('definition_en'),'semantic_key':reg.get('semantic_key'),'semantic_key_history':reg.get('semantic_key_history',[]),'legacy_aliases':reg.get('legacy_aliases',[]),'legacy_alias_history':reg.get('legacy_alias_history',[]),'updated_at':reg.get('updated_at'),'source_row':row.get('source_row'),'source_path':p.relative_to(ROOT).as_posix(),'reference_only':True}
            if reg.get('lexical_identity_overlay') is not None: ref['lexical_identity_overlay']=reg['lexical_identity_overlay']
            refs.append(ref)
    owner.setdefault('identity_refs',{})['senses']=sorted(ids,key=lambda x:x['sense_id']); owner['reference_senses']=sorted(refs,key=lambda x:x['stable_sense_id'])
    owner['identity_refs']['active_collocations']=sorted({c.get('collocation_id') for x in s.active(o) for c in x.get('collocations',[]) if c.get('collocation_id')})
    collrefs=[]
    for cid,(p,_i,row) in s.coll_rows.items():
        if row.get('anchor_ordinal')==o: collrefs.append({'id':cid,'source_row':row.get('source_row'),'source_path':p.relative_to(ROOT).as_posix()})
    owner['identity_refs']['collocations']=sorted(collrefs,key=lambda x:x['id'])
    for cluster in s.rec(o).get('core_concept',{}).get('core_clusters',[]): cluster['sense_ids']=[sid for sid in cluster.get('sense_ids',[]) if sid in active_ids]
    s.rec(o)['senses'].sort(key=lambda x:(x.get('sort_order',999),x.get('sense_id','')))
    for i,x in enumerate(s.rec(o)['senses']): x['sort_order']=i
    sig=s.rec(o).setdefault('review_signature',[]); sig[:]=[x for x in sig if not x.startswith('semantic-reconciliation:o')]
    marker='semantic-reconciliation:o3625-o3874'
    if marker not in sig: sig.append(marker)
    s.rec(o)['needs_delta_review']=False
    s.rec(o)['content_hash']=base.sha({k:v for k,v in s.rec(o).items() if k!='content_hash'}); s.mark(o)

def add_plough_plow_relation(s):
    rid='relation:horizontal:'+sha({'type':'regional_spelling_variant','members':['plough','plow']})[:20]
    p=base.relation_owner_path(rid); relpath=p.relative_to(ROOT).as_posix()
    if p.exists(): raise RuntimeError(f'PLOUGH_PLOW_RELATION_ALREADY_EXISTS:{rid}')
    note='plough is the usual British spelling and plow the usual American spelling for the same farm-tool/soil-turning lexeme. Both frozen Main Word identities remain; the proper name the Plough is separately capitalization-bounded.'
    views=[]
    for o,target in [(3646,7278),(7278,3646)]:
        owner=s.owner(o); idx=sum(1 for r in owner.get('relation_refs',[]) if r.get('field')=='semantic_neighbors')
        payload={'relation_id':rid,'relation_type':'spelling_variant','relation_scope':'lexeme','direction':'C','priority':'A','publication_status':'codex_reviewed','verification_status':'verified','writing_safe':True,'source_expression':owner['word'],'target_expression':s.owner(target)['word'],'target_word':s.owner(target)['word'],'boundary':note,'boundaries':[note],'learning_note':note,'task_tags':['reading','writing'],'standard_form_bre':'plough','standard_form_ame':'plow'}
        views.append({'source_word_id':owner['word_id'],'source_ordinal':o,'field':'semantic_neighbors','index':idx,'payload':payload})
        owner.setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':'semantic_neighbors','index':idx}); s.mark(o)
    base.dump(p,{'schema':'kianos.lexical.relation_owner.v1','relation_id':rid,'canonical_record':None,'fact_record':None,'word_views':views,'provenance':{'materialized_from':'forward semantic reconciliation','semantic_delta':1,'authority':AUTH}}); s.changed_relations.add(relpath)
    m=base.load(LEX/'relations'/'manifest.json'); m['relation_count']=int(m.get('relation_count',0))+1; base.dump(LEX/'relations'/'manifest.json',m)
    return rid,relpath

def apply(s):
    # Production: plantation ordinary learner-main.
    plantation=s.reactivate(3627,'sense:plantation:e33749827a4a5a2b',cn='种植园；大农场（尤指种植经济作物的大型农场）',en='a large estate, farm, or area where crops are grown, especially cash crops',level='L1',pos='noun')
    add_colloc(s,3627,plantation,'tea/coffee plantation','茶园/咖啡种植园','usage_example')
    set_clusters(s,3627,[{'label_cn':'种植园；大农场','label_en':'a large estate or farm where crops are grown','pos':'noun','sense_ids':[plantation]},{'label_cn':'人工林；植树造林','label_en':'tree planting or an area planted with trees','pos':'noun','sense_ids':['sense:plantation:4516b4669c155c32']}],'种植园；人工林','a plantation is chiefly a large crop-growing estate; it can also denote planted forest/tree-planting')

    # Audit additions: familiar senses and bounded repairs.
    plastic=s.add_new(3629,'figurative_artificial_insincere','adjective','虚假的；做作的；不真诚的','artificial, insincere, or not genuine in manner or appearance','L2')
    add_colloc(s,3629,plastic,'a plastic smile/personality','做作的笑容/虚假的个性','usage_example'); s.add_cluster(3629,plastic,'adjective','虚假的；做作的','artificial or insincere')
    s.set_core(3629,'塑料；可塑的；也可指虚假做作','plastic material; moldable; figuratively artificial or insincere')

    plate=s.add_new(3630,'tectonic_plate','noun','构造板块；地壳板块','a large rigid section of the Earth’s lithosphere that moves as a tectonic unit','L2')
    add_colloc(s,3630,plate,'tectonic plate','构造板块','usage_example'); s.add_cluster(3630,plate,'noun','构造板块','tectonic plate')
    s.set_core(3630,'盘子；板；构造板块；镀层/电镀','a dish, flat plate, tectonic plate, or to plate with metal')

    plateau=s.add_new(3631,'reach_stable_level_verb','verb','达到并停留在稳定水平；进入平台期','to reach and remain at a relatively stable level after growth or progress','L2','vi.')
    add_colloc(s,3631,plateau,'sales/growth plateaued','销售额/增长进入平台期','usage_example'); s.add_cluster(3631,plateau,'verb','进入平台期','reach a stable level')
    s.set_core(3631,'高原；平台期；进入平台期','a high plateau; a stable level; to level off at a plateau')

    play_role=s.add_new(3634,'figurative_role_contribution','verb','发挥作用；在……中起作用','to have or perform a role or part in an event, process, or outcome','L1','vt. + object')
    add_colloc(s,3634,play_role,'play a role/part in sth','在某事中发挥作用')
    play_media=s.add_new(3634,'media_playback','verb','播放（音频、视频、录音等）','to start or reproduce recorded audio, video, or other media','L1','vt. + object / vi.')
    add_colloc(s,3634,play_media,'play a video/recording','播放视频/录音','usage_example')
    s.add_cluster(3634,play_role,'verb','发挥作用','have a role in something'); s.add_cluster(3634,play_media,'verb','播放','reproduce recorded media')
    s.set_core(3634,'玩；比赛；演奏；扮演/发挥作用；播放','to play for enjoyment/sport/music, act or play a role, and reproduce media')

    s.update_sense(3644,'sense:plight:a29e29f10bd65c81',level='L3',usage_note='archaic/literary: to pledge or promise solemnly; not a modern learner-main use')
    set_clusters(s,3644,[{'label_cn':'困境；窘境','label_en':'a difficult or unfortunate situation','pos':'noun','sense_ids':['sense:plight:4ba34d37bfe65d94']}],'困境；窘境','a difficult or unfortunate situation')

    # plough/plow regional spelling closure + collocation re-anchor + proper-name boundary.
    s.move_colloc(3646,'plough the field','sense:plough:7d16632b66b25178')
    s.overlay(3646,'sense:plough:0785c9a5719e589f','Capitalized the Plough is the BrE proper name for the Big Dipper/part of Ursa Major; keep it separate from ordinary farm-tool spelling truth.',case_sensitive=True,surface='Plough',paired='the Plough',identity_type='capitalized_proper_name')
    spelling_id,spelling_path=add_plough_plow_relation(s)

    plug=s.add_new(3647,'promote_publicize','verb','宣传；推广；为……做广告','informal: to promote, publicize, or advertise something','L2','vt. + object')
    add_colloc(s,3647,plug,'plug a book/show/product','宣传书籍/节目/产品','usage_example'); s.add_cluster(3647,plug,'verb','宣传；推广','promote or publicize informally')
    s.set_core(3647,'塞子/插头；堵住/接通；也可非正式地宣传推广','a plug or electrical plug; to plug/connect; informally to promote')

    s.update_sense(3650,'sense:plural:b1d5541399e053a3',cn='复数的；表示或指两个以上的；多元的',en='in grammar, denoting or referring to more than one; more generally, consisting of multiple members, kinds, or elements',level='L1')
    set_clusters(s,3650,[{'label_cn':'复数形式','label_en':'the form of a word used to denote more than one','pos':'noun','sense_ids':['sense:plural:c30d9862b3715501']},{'label_cn':'复数的；多元的','label_en':'denoting more than one; consisting of multiple members or kinds','pos':'adjective','sense_ids':['sense:plural:b1d5541399e053a3']}],'复数；表示两个以上或多元','plural form; denoting more than one or multiple')

    s.update_sense(3653,'sense:pocket:113535ab977b5347',cn='小块；小片；孤立的小区域/少量/群体',en='a small isolated area, amount, concentration, or group within a larger whole',level='L2')
    s.set_core(3653,'口袋；小块孤立区域/少量；装进口袋；袖珍的','a pocket in clothing; a small isolated pocket/area; to pocket; pocket-sized')

    s.update_sense(3656,'sense:poetry:f4273ad5a10f5b66',cn='诗歌；诗作',en='literary writing that uses concentrated, imaginative, or expressive language, often arranged in verse and not necessarily metrical',level='L1')
    s.set_core(3656,'诗歌；诗作','poetry: imaginative or expressive literary writing, often in verse')

    s.update_sense(3657,'sense:point:853a4834dc245a0d',cn='指；指向；表明；暗示',en='to direct attention physically, or to indicate, suggest, or provide evidence for something',level='L1',pattern='vi. + at/to',transitivity='vi',usage_note='point at is commonly physical; point to can be physical or mean indicate/suggest/provide evidence for a conclusion')
    set_clusters(s,3657,[{'label_cn':'地点/时刻；要点；尖端；得分','label_en':'a place or moment; main idea; sharp end; score','pos':'noun','sense_ids':['sense:point:5eac0d1ea501535e','sense:point:412a3c7814195a90','sense:point:caa0e65186ae593e','sense:point:d8772c0964da51a9']},{'label_cn':'指向；表明/暗示；瞄准','label_en':'point physically; indicate or suggest; aim','pos':'verb','sense_ids':['sense:point:853a4834dc245a0d','sense:point:abf01afd382052b7']}],'点/要点；指向或表明','a point or main idea; to point, indicate, or suggest')

    s.update_sense(3658,'sense:poison:92038f16196c5128',pattern='vt. + object',transitivity='vt',usage_note='ordinary transitive use: poison food/water/a well by putting poison into it')

    add_construction(s,3660,'poke fun at sb/sth','取笑；拿某人/某事开玩笑','to make fun of or mock someone or something',level='L1',boundary='idiomatic phrase; not literal physical poking')

    s.update_sense(3662,'sense:pole:5cce9fe4124753c5',cn='极点；（地理、磁、电等系统的）两极之一',en='one of two opposite points or ends in a system, especially a geographic, magnetic, or electrical pole',level='L1')
    add_colloc(s,3662,'sense:pole:5cce9fe4124753c5','magnetic pole','磁极','usage_example'); add_colloc(s,3662,'sense:pole:5cce9fe4124753c5','positive/negative pole','正极/负极','usage_example')
    s.update_sense(3662,'sense:pole:32f7d63d627d5de3',cn='波兰人（Pole，首字母大写）',en='a person from Poland; written with a capital P as Pole',level='L2',usage_note='Capitalized Pole is the person noun; plural Poles. Lowercase pole is not a nationality noun.')
    add_colloc(s,3662,'sense:pole:32f7d63d627d5de3','the Poles','波兰人（复数）','usage_example')
    set_clusters(s,3662,[{'label_cn':'杆；竿；极端；地理/磁/电极','label_en':'a rod; an extreme; a geographic, magnetic, or electrical pole','pos':'noun','sense_ids':['sense:pole:3db4fbae8b7350f0','sense:pole:0ae47d84e0905fd8','sense:pole:5cce9fe4124753c5']},{'label_cn':'Pole：波兰人（大写）','label_en':'Pole: a person from Poland, capitalized','pos':'noun','sense_ids':['sense:pole:32f7d63d627d5de3']},{'label_cn':'用竿支撑；撑篙','label_en':'support or propel with a pole','pos':'verb','sense_ids':['sense:pole:5e6a083f55025781','sense:pole:731e9d334abf5929']}],'杆/极点；Pole=波兰人','a pole/point of extremity; capitalized Pole = a person from Poland')

    s.update_sense(3663,'sense:police:0db7bfa45af75700',usage_note='Collective noun: the police normally takes plural agreement (the police are...). One individual is a police officer, not *a police.')
    set_form(s,3663,{'form_type':'collective_noun_grammar','spelling':'police','identity_rule':'same_word_owner_collective_grammar','boundary':'the police is a collective noun with plural agreement; an individual member is a police officer, not *a police','variants':[{'variant_id':'form:police:collective','surface':'the police','pos':['noun'],'agreement':'plural','learner_key':'the police are ...'},{'variant_id':'form:police:individual-expression','surface':'a police officer','pos':['noun_phrase'],'agreement':'singular','learner_key':'a police officer; not *a police'}]})
    s.set_core(3663,'警方（集合名词，通常用复数一致）；维持治安','the police as a plural-agreement collective; to police or keep order')

    s.set_core(3664,'男警察','a male police officer')
    s.update_sense(3664,'sense:policeman:02e13e7c6f755728',usage_note='policeman specifically means a male police officer; police officer is the neutral term for an individual officer')

    # Polish: retire wrong person sense, add language noun, and encode case/pronunciation boundary.
    s.demote(3666,'sense:polish:39482ccccdc650b0',status='deprecated')
    polish_lang=s.add_new(3666,'polish_language','noun','波兰语','the Polish language','L2')
    add_colloc(s,3666,polish_lang,'speak Polish','说波兰语','usage_example')
    s.update_sense(3666,'sense:polish:63c9b12482d25587',usage_note='Capitalized Polish is the adjective relating to Poland, its people, or language; it is not the person noun. A person is a Pole.')
    set_form(s,3666,{'form_type':'same_spelling_case_conditioned_lexeme_pronunciation','spelling':'polish','identity_rule':'same_word_owner_case_conditioned_roles','boundary':'lowercase polish (shine/refine; polish substance) and capitalized Polish (Poland adjective/language) are distinguished by case and pronunciation; a person from Poland is a Pole','variants':[{'variant_id':'form:polish:lowercase','surface':'polish','case':'lowercase','pos':['verb','noun'],'ipa_bre':'/ˈpɒl.ɪʃ/','ipa_ame':'/ˈpɑː.lɪʃ/','learner_key':'POL-ish','role':'shine/refine or polish substance'},{'variant_id':'form:polish:capitalized','surface':'Polish','case':'capitalized','pos':['adjective','noun'],'ipa_bre':'/ˈpəʊ.lɪʃ/','ipa_ame':'/ˈpoʊ.lɪʃ/','learner_key':'PO-lish','role':'Poland adjective or Polish language; person noun = Pole'}]})
    set_clusters(s,3666,[{'label_cn':'擦亮；润色','label_en':'polish or refine','pos':'verb','sense_ids':['sense:polish:7739caa4ae9d55e0','sense:polish:d1d5027d424759cf']},{'label_cn':'上光剂；光泽','label_en':'polish substance or a polished shine','pos':'noun','sense_ids':['sense:polish:9905efcead9455ea','sense:polish:5fc63fe5c9cc5970']},{'label_cn':'Polish：波兰的','label_en':'Polish: relating to Poland, its people, or language','pos':'adjective','sense_ids':['sense:polish:63c9b12482d25587']},{'label_cn':'Polish：波兰语','label_en':'the Polish language','pos':'noun','sense_ids':[polish_lang]}],'擦亮/润色；Polish=波兰的/波兰语','polish = shine/refine; capitalized Polish = Poland adjective or language')

    for o in DELTA+REMOTE: s.mark(o)
    return spelling_id,spelling_path

def verify(s,rid,relpath,before_nochange):
    errors=[]
    expected=set(DELTA+REMOTE)
    if set(s.changed_words)!=expected: errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    expected_new={
      base.sense_id('plastic','figurative_artificial_insincere'),base.sense_id('plate','tectonic_plate'),base.sense_id('plateau','reach_stable_level_verb'),
      base.sense_id('play','figurative_role_contribution'),base.sense_id('play','media_playback'),base.sense_id('plug','promote_publicize'),base.sense_id('polish','polish_language')}
    if set(s.new_senses)!=expected_new: errors.append(f'NEW_SENSE_SET:{sorted(s.new_senses)}')
    if 'sense:plantation:e33749827a4a5a2b' not in s.reactivated: errors.append('PLANTATION_NOT_REACTIVATED')
    if s.active_sense(3666,'sense:polish:39482ccccdc650b0') is not None: errors.append('POLISH_PERSON_STILL_ACTIVE')
    if s.active_sense(3666,base.sense_id('polish','polish_language')) is None: errors.append('POLISH_LANGUAGE_MISSING')
    if s.active_sense(3658,'sense:poison:92038f16196c5128').get('transitivity')!='vt': errors.append('POISON_TRANSITIVITY')
    if 'indicate' not in s.active_sense(3657,'sense:point:853a4834dc245a0d').get('definition_en',''): errors.append('POINT_INDICATE_MISSING')
    if not s.rec(3663).get('form_identity'): errors.append('POLICE_FORM_MISSING')
    if not s.rec(3666).get('form_identity'): errors.append('POLISH_FORM_MISSING')
    target=s.active_sense(3646,'sense:plough:7d16632b66b25178')
    if not any(c.get('phrase')=='plough the field' for c in target.get('collocations',[])): errors.append('PLOUGH_FIELD_NOT_ON_VERB')
    if relpath not in s.changed_relations: errors.append('PLOUGH_PLOW_RELATION_NOT_WRITTEN')
    for o in (3646,7278):
        if not any(r.get('relation_id')==rid for r in s.owner(o).get('relation_refs',[])): errors.append(f'PLOUGH_PLOW_REF_MISSING:{o}')
    for o in DELTA+REMOTE:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active': errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')
    for o,h in before_nochange.items():
        now=base.sha(base.load(OWNER/f'o{o:04d}.json'))
        if now!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    manifest=base.load(LEX/'relations'/'manifest.json')
    if manifest.get('relation_count')!=381: errors.append(f'RELATION_MANIFEST:{manifest.get("relation_count")}')
    return errors

def main():
    before_nochange={o:base.sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State(); rid,relpath=apply(s)
    s.sync_registry_files()
    for o in sorted(s.changed_words): sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,rid,relpath,before_nochange)
    if errors: raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    RECEIPT.mkdir(parents=True,exist_ok=True)
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTH,'package':[3625,3874],'shard':[3625,3674],'reviewed_owner_count':50,'semantic_mutation_source_count':18,'semantic_source_ordinals':DELTA,'changed_word_ordinals':sorted(s.changed_words),'in_range_changed_word_ordinals':DELTA,'out_of_range_dependency_ordinals':REMOTE,'no_change_word_ordinals':NO_CHANGE,'new_semantic_branch_ids':sorted(s.new_senses),'new_semantic_branch_count':len(s.new_senses),'reactivated_stable_ids':sorted(set(s.reactivated)),'demoted_stable_ids':sorted(set(s.demoted)),'new_relation_id':rid,'changed_relation_owner_paths':sorted(s.changed_relations),'relation_manifest_count':381,'readback':{'all_50_owner_views':'PASS','all_18_authorized_semantic_sources':'PASS','no_change_32_byte_guard':'PASS','plough_plow_boundary':'PASS','stable_registry_closure':'PASS','o3675_plus_not_touched_except_o7278':'PASS'}}
    base.dump(RECEIPT/'o3625-o3674.json',receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
