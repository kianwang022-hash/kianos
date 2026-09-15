#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3875-o4124, shard o3875-o3924."""
from __future__ import annotations
import copy, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_retro_o0025_o0224 as base

LEX=ROOT/'content'/'lexical'
OWNER=LEX/'words'/'by-ordinal'
RECEIPT=LEX/'execution'/'receipts'
AUTH='content/lexical/semantic-reconciliation/o3875-o4124.md'
DELTA=[3879,3881,3882,3883,3885,3886,3887,3888,3891,3895,3896,3898,3899,3900,3901,3903,3905,3907,3908,3909,3910,3915,3916,3918,3921,3923]
REMOTE=[1436,1981,2772]
NO_CHANGE=[o for o in range(3875,3925) if o not in DELTA]
base.DELTA=DELTA
base.REMOTE_WORDS=REMOTE
base.AUTH=AUTH
base.NOW='2026-09-16T00:00:00Z'

NEW_BRANCHES={
    3879:[('color_adjective','adjective','紫色的','having the color between red and blue','L1')],
    3881:[('handbag_ame','noun','女用手提包；手袋（美式英语）','a handbag, especially in American English','L1')],
    3888:[('credential_qualification','noun','资格证书；学历；资历；使人具备资格的技能或经历','a credential, training, examination result, skill, or experience that makes someone suitable or eligible','L1')],
    3898:[('north_american_25_cent_coin','noun','二十五分硬币（北美）','a coin worth twenty-five cents in the United States or Canada','L2')],
    3899:[
        ('chess_queen','noun','后；皇后（国际象棋中最强的棋子）','the most powerful piece in chess, able to move any number of squares in any direction','L2'),
        ('playing_card_queen','noun','Q牌；皇后牌','a playing card bearing the image or rank of a queen','L2'),
    ],
    3900:[('identity_adjective','adjective','酷儿的；以 queer 自我认同的','relating to people or communities whose sexual orientation or gender identity falls outside traditional heterosexual or cisgender categories','L1')],
    3903:[('matter_issue_noun','noun','问题；议题；需要考虑或解决的事项','a matter, issue, or problem that needs to be considered, discussed, or resolved','L1')],
    3916:[('humankind_noun','noun','人类；全人类','humankind; human beings collectively','L1')],
    3923:[('chemistry_free_radical','noun','自由基；（化学）基团','an atom, molecule, or group with an unpaired electron, especially a highly reactive free radical','L2')],
}

SURVIVOR_QUIET='deep:confusables:quiet:a62d52d0428c90d3'
DUP_QUIET='confusable:horizontal:6365310b0c8adfdd6004'
DUP_QUIET_PATH=LEX/'relations'/'by-id'/'f6'/'f68d421f2204b873367eca0e4fae3167f426d80c71a2d2af7d31291d775e7ae6.json'

def sha(v): return base.sha(v)

def add_colloc(s,o,sid,phrase,meaning,exam='fixed_pattern'):
    target=s.active_sense(o,sid)
    if not target: raise RuntimeError(f'COLLOCATION_TARGET_MISSING:{sid}')
    if any(c.get('phrase')==phrase for sense in s.active(o) for c in sense.get('collocations',[])):
        return
    word=s.owner(o)['word']
    cid=base.colloc_id(word,sid,phrase)
    item={
        'collocation_id':cid,
        'exam_value':exam,
        'legacy_source_object_ids':[f'{sid}:collocation:forward-o3875-o4124'],
        'meaning_cn':meaning,
        'phrase':phrase,
    }
    target.setdefault('collocations',[]).append(item)
    if cid not in s.coll_by_id:
        reg={
            'collocation_id':cid,
            'created_by':'forward-reconciliation-o3875-o4124',
            'current_value_hash':sha(item),
            'legacy_source_object_ids':item['legacy_source_object_ids'],
            'record_type':'collocation_identity',
            'schema_version':'kianos_collocation_identity_v1',
            'sense_id':sid,
            'status':'active',
            'word_id':f'word:{word}',
        }
        p=base.choose_shard(base.COLL_DIR,o)
        rows=base.load(p)
        row={'source_row':max([r.get('source_row',0) for r in rows]+[0])+1,'anchor_ordinal':o,'record':reg}
        rows.append(row)
        base.dump(p,rows)
        s.coll_rows[cid]=(p,len(rows)-1,row)
        s.coll_by_id[cid]=reg
    s.mark(o)

def add_construction(s,o,pattern,cn,en='',source_sid=None,level='L1',boundary=None):
    arr=s.rec(o).setdefault('constructions',[])
    if any(x.get('pattern')==pattern for x in arr):
        return
    cid='construction:'+sha({'word':s.owner(o)['word'],'pattern':pattern,'authority':AUTH})[:20]
    x={'construction_id':cid,'direction':'R+P','level':level,'meaning_cn':cn,'pattern':pattern}
    if en: x['definition_en']=en
    if source_sid: x['source_sense_id']=source_sid
    if boundary: x['boundary']=boundary
    arr.append(x)
    s.mark(o)

def set_clusters(s,o,clusters,cn,en,mental=None):
    c=s.rec(o).setdefault('core_concept',{})
    c['core_clusters']=clusters
    c['core_meaning_cn']=cn
    c['core_meaning_en']=en
    c['mental_model_cn']=mental or cn
    c.setdefault('mental_model_en','')
    s.mark(o)

def sync_owner(s,o):
    owner=s.owner(o)
    active_ids={x.get('sense_id') for x in s.active(o)}
    refs=[]; ids=[]
    for sid,(p,_i,row) in s.sense_rows.items():
        if row.get('anchor_ordinal')!=o: continue
        reg=s.sense_by_id[sid]
        ids.append({
            'sense_id':sid,'status':reg.get('status'),
            'merged_into_sense_id':reg.get('merged_into_sense_id'),
            'source_row':row.get('source_row'),
            'source_path':p.relative_to(ROOT).as_posix(),
        })
        if sid not in active_ids:
            ref={
                'stable_sense_id':sid,'status':reg.get('status'),
                'merged_into_sense_id':reg.get('merged_into_sense_id'),
                'pos':reg.get('pos'),'definition_cn':reg.get('definition_cn'),
                'definition_en':reg.get('definition_en'),
                'semantic_key':reg.get('semantic_key'),
                'semantic_key_history':reg.get('semantic_key_history',[]),
                'legacy_aliases':reg.get('legacy_aliases',[]),
                'legacy_alias_history':reg.get('legacy_alias_history',[]),
                'updated_at':reg.get('updated_at'),
                'source_row':row.get('source_row'),
                'source_path':p.relative_to(ROOT).as_posix(),
                'reference_only':True,
            }
            if reg.get('lexical_identity_overlay') is not None:
                ref['lexical_identity_overlay']=reg['lexical_identity_overlay']
            refs.append(ref)
    owner.setdefault('identity_refs',{})['senses']=sorted(ids,key=lambda x:x['sense_id'])
    owner['reference_senses']=sorted(refs,key=lambda x:x['stable_sense_id'])
    owner['identity_refs']['active_collocations']=sorted({
        c.get('collocation_id') for x in s.active(o)
        for c in x.get('collocations',[]) if c.get('collocation_id')
    })
    collrefs=[]
    for cid,(p,_i,row) in s.coll_rows.items():
        if row.get('anchor_ordinal')==o:
            collrefs.append({'id':cid,'source_row':row.get('source_row'),'source_path':p.relative_to(ROOT).as_posix()})
    owner['identity_refs']['collocations']=sorted(collrefs,key=lambda x:x['id'])
    for cluster in s.rec(o).get('core_concept',{}).get('core_clusters',[]):
        cluster['sense_ids']=[sid for sid in cluster.get('sense_ids',[]) if sid in active_ids]
    s.rec(o)['senses'].sort(key=lambda x:(x.get('sort_order',999),x.get('sense_id','')))
    for i,x in enumerate(s.rec(o)['senses']): x['sort_order']=i
    sig=s.rec(o).setdefault('review_signature',[])
    sig[:]=[x for x in sig if not x.startswith('semantic-reconciliation:o')]
    marker='semantic-reconciliation:o3875-o4124'
    if marker not in sig: sig.append(marker)
    s.rec(o)['needs_delta_review']=False
    s.rec(o)['content_hash']=sha({k:v for k,v in s.rec(o).items() if k!='content_hash'})
    s.mark(o)

def _relation_path(rid):
    return base.relation_owner_path(rid)

def mirror_existing_relation(s,rid,source_o,target_o,field,boundary):
    p=_relation_path(rid)
    obj=base.load(p)
    if obj.get('relation_id')!=rid:
        raise RuntimeError(f'RELATION_ID_MISMATCH:{rid}')
    source_view=next((v for v in obj.get('word_views',[]) if v.get('source_ordinal')==source_o),None)
    if not source_view:
        raise RuntimeError(f'RELATION_SOURCE_VIEW_MISSING:{rid}:o{source_o:04d}')
    owner=s.owner(target_o)
    existing_view=next((v for v in obj.get('word_views',[]) if v.get('source_ordinal')==target_o),None)
    relpath=p.relative_to(ROOT).as_posix()
    refs=owner.setdefault('relation_refs',[])
    if existing_view is None:
        payload=copy.deepcopy(source_view.get('payload',{}))
        old_source_sid=payload.get('source_sense_id')
        old_target_sid=payload.get('target_sense_id')
        source_word=s.owner(source_o)['word']
        target_word=s.owner(target_o)['word']
        payload['source_sense_id']=old_target_sid
        payload['target_sense_id']=old_source_sid
        payload['target_word']=source_word
        payload['boundary']=boundary
        if 'boundaries' in payload: payload['boundaries']=[boundary]
        if 'learning_note' in payload: payload['learning_note']=boundary
        if 'source_expression' in payload: payload['source_expression']=target_word
        if 'target_expression' in payload: payload['target_expression']=source_word
        idx=sum(1 for r in refs if r.get('field')==field)
        obj.setdefault('word_views',[]).append({
            'source_word_id':owner['word_id'],
            'source_ordinal':target_o,
            'field':field,
            'index':idx,
            'payload':payload,
        })
    else:
        idx=existing_view.get('index',sum(1 for r in refs if r.get('field')==field))
    if not any(r.get('relation_id')==rid for r in refs):
        refs.append({'relation_id':rid,'owner_path':relpath,'field':field,'index':idx})
    obj.setdefault('provenance',{})['last_semantic_authority']=AUTH
    base.dump(p,obj)
    s.changed_relations.add(relpath)
    s.mark(target_o)
    return relpath

def retire_quiet_duplicate(s):
    if not DUP_QUIET_PATH.exists():
        raise RuntimeError('QUIET_DUPLICATE_RELATION_MISSING')
    dup=base.load(DUP_QUIET_PATH)
    if dup.get('relation_id')!=DUP_QUIET:
        raise RuntimeError('QUIET_DUPLICATE_ID_MISMATCH')
    for o in (3907,3910):
        owner=s.owner(o)
        before=len(owner.get('relation_refs',[]))
        owner['relation_refs']=[r for r in owner.get('relation_refs',[]) if r.get('relation_id')!=DUP_QUIET]
        if len(owner.get('relation_refs',[]))!=before:
            counters={}
            for r in owner['relation_refs']:
                f=r.get('field')
                r['index']=counters.get(f,0)
                counters[f]=r['index']+1
            s.mark(o)
    DUP_QUIET_PATH.unlink()
    s.changed_relations.add(DUP_QUIET_PATH.relative_to(ROOT).as_posix())
    mp=LEX/'relations'/'manifest.json'
    manifest=base.load(mp)
    if manifest.get('relation_count')!=383:
        raise RuntimeError(f'RELATION_MANIFEST_PRECOUNT:{manifest.get("relation_count")}')
    manifest['relation_count']=382
    base.dump(mp,manifest)

def set_usage(s,o,sid,note):
    x=s.active_sense(o,sid)
    if not x: raise RuntimeError(f'USAGE_TARGET_MISSING:{sid}')
    x['usage_note']=note
    s.mark(o)

def apply(s):
    new_ids={}
    for o,rows in NEW_BRANCHES.items():
        for branch,pos,cn,en,level in rows:
            sid=s.add_new(o,branch,pos,cn,en,level)
            new_ids[(o,branch)]=sid

    purple=new_ids[(3879,'color_adjective')]
    add_colloc(s,3879,purple,'purple dress/light','紫色的衣服/光线','usage_example')
    set_clusters(s,3879,[
        {'label_cn':'紫色；紫色颜料','label_en':'the color or pigment purple','pos':'noun','sense_ids':['sense:purple:4c80605da9015b0f']},
        {'label_cn':'紫色的','label_en':'having the color purple','pos':'adjective','sense_ids':[purple]},
        {'label_cn':'帝王的；皇室的','label_en':'imperial or royal','pos':'adjective','sense_ids':['sense:purple:e2f629dff93c5d64']},
        {'label_cn':'（使）成紫色','label_en':'make or become purple','pos':'verb','sense_ids':['sense:purple:575e5807a3e75993']},
    ],'紫色；紫色的；也可指帝王/皇室','purple as a color or adjective; also imperial/royal')

    purse=new_ids[(3881,'handbag_ame')]
    add_colloc(s,3881,purse,'carry a purse','随身带手提包','usage_example')
    set_usage(s,3881,purse,'Common AmE use: purse often means a handbag carried for personal items; BrE purse more often means a small money holder.')

    mirror_existing_relation(s,'deep:semantic_contrast:pursue:2e9426401086822d',3882,1981,'semantic_neighbors',
        'follow means go/come after; pursue adds active pursuit of a person, target, or goal.')
    mirror_existing_relation(s,'deep:semantic_contrast:put:b67ea3da7de6a557',3885,2772,'semantic_neighbors',
        'lay usually means put something down/in a position, often flat; put is the broader placement verb.')

    s.update_sense(3883,'sense:pursuit:f5f2de91859a5a65',
        cn='追求；寻求（目标、知识、幸福等）',
        en='the act of trying to achieve, obtain, or continue toward a goal, knowledge, happiness, or another desired end',
        level='L1')
    s.move_colloc(3883,'the pursuit of happiness','sense:pursuit:f5f2de91859a5a65')
    set_clusters(s,3883,[
        {'label_cn':'追赶；追捕','label_en':'physical chase or pursuit','pos':'noun','sense_ids':['sense:pursuit:ddcdf24e95dc52d1']},
        {'label_cn':'追求；寻求','label_en':'effort to achieve or obtain a goal','pos':'noun','sense_ids':['sense:pursuit:f5f2de91859a5a65']},
        {'label_cn':'消遣；职业活动','label_en':'an activity or occupation','pos':'noun','sense_ids':['sense:pursuit:3ce0a70deff159d2']},
    ],'追赶；追求；从事的活动','physical pursuit, pursuit of a goal, or an activity')

    add_construction(s,3885,'put sth into practice','把…付诸实践；实施…','to make an idea, plan, or method actually happen or be used','sense:put:e87d388f5c425826','L1','put sth into practice')
    add_construction(s,3885,'put sth to use','使用；利用…','to use something for a practical purpose','sense:put:e87d388f5c425826','L2','put sth to use')

    pv1=s.reactivate(3886,'sense:puzzle:4b96e70aaebd5666',cn='使困惑；使迷惑',en='to confuse or perplex someone',level='L1',pattern='vt. + object',pos='verb',transitivity='vt')
    pv2=s.reactivate(3886,'sense:puzzle:ff58bb3419245834',cn='苦思；琢磨',en='to think hard about something because it is difficult to understand or solve',level='L1',pattern='vi. + over/about',pos='verb',transitivity='vi')
    add_colloc(s,3886,pv2,'puzzle over/about sth','苦思；琢磨某事','fixed_pattern')
    set_clusters(s,3886,[
        {'label_cn':'谜题；智力游戏','label_en':'a puzzle or problem to solve','pos':'noun','sense_ids':['sense:puzzle:c4a7fc6d038d58ab']},
        {'label_cn':'使困惑','label_en':'confuse or perplex','pos':'verb','sense_ids':[pv1]},
        {'label_cn':'苦思；琢磨','label_en':'think hard about a problem','pos':'verb','sense_ids':[pv2]},
    ],'谜题；使困惑；苦思','a puzzle, to perplex, or to puzzle over something')

    py_geo=s.reactivate(3887,'sense:pyramid:21236deb84d956f6',cn='角锥体；棱锥体',en='a solid or structure with a polygonal base and triangular sides meeting at a point',level='L2',pos='noun')
    py_mon=s.reactivate(3887,'sense:pyramid:7bc840f77bcb5188',cn='金字塔',en='a monumental structure with a broad base and sloping triangular sides, especially one from ancient Egypt',level='L1',pos='noun')
    add_colloc(s,3887,py_mon,'Egyptian pyramids','埃及金字塔','usage_example')
    set_clusters(s,3887,[
        {'label_cn':'金字塔','label_en':'a monumental pyramid, especially in ancient Egypt','pos':'noun','sense_ids':[py_mon]},
        {'label_cn':'角锥体；棱锥体','label_en':'a geometric pyramid','pos':'noun','sense_ids':[py_geo]},
    ],'金字塔；角锥体','a pyramid-shaped monumental or geometric structure')

    qual=new_ids[(3888,'credential_qualification')]
    s.move_colloc(3888,'professional qualification',qual)
    add_colloc(s,3888,qual,'academic qualifications','学历；学术资历','usage_example')
    set_clusters(s,3888,[
        {'label_cn':'资格；条件','label_en':'a condition for eligibility','pos':'noun','sense_ids':['sense:qualification:7a92bc487928513d']},
        {'label_cn':'资格证书；学历；资历','label_en':'credential, training, or experience showing suitability','pos':'noun','sense_ids':[qual]},
        {'label_cn':'限制条件；保留','label_en':'a limitation or reservation','pos':'noun','sense_ids':['sense:qualification:0ca9d33fc2f95339']},
    ],'资格；资历；限定','eligibility, credentials, or a limiting qualification')

    ql1=s.reactivate(3891,'sense:quality:3e6c819b49475652',cn='质量；品质；优劣程度',en='the standard or degree of excellence of something',level='L1',pos='noun')
    ql2=s.reactivate(3891,'sense:quality:4f1b1c97f11f584b',cn='特性；特质',en='a characteristic or feature of someone or something',level='L1',pos='noun')
    add_colloc(s,3891,ql1,'high-quality work','高质量的工作','usage_example')
    add_colloc(s,3891,ql2,'personal qualities','个人品质/特质','usage_example')
    set_clusters(s,3891,[
        {'label_cn':'质量；品质','label_en':'standard or degree of excellence','pos':'noun','sense_ids':[ql1]},
        {'label_cn':'特性；特质','label_en':'a characteristic or feature','pos':'noun','sense_ids':[ql2]},
    ],'质量；品质；特性','quality as standard/excellence or as a characteristic')

    qv=s.reactivate(3895,'sense:quarantine:c09eac6bf29054ce',cn='隔离；对…实施检疫',en='to place a person, animal, or place in isolation to prevent the spread of disease',level='L1',pattern='vt. + object',pos='verb',transitivity='vt')
    add_colloc(s,3895,qv,'quarantine sb/sth','隔离某人/某物；对…实施检疫','fixed_pattern')
    s.set_core(3895,'隔离；检疫','isolation or quarantine to prevent disease spread')

    mirror_existing_relation(s,'deep:semantic_contrast:quarrel:308daf36a517cd80',3896,1436,'semantic_neighbors',
        'dispute is often a more formal disagreement or contested claim; quarrel more often suggests a personal argument.')

    coin=new_ids[(3898,'north_american_25_cent_coin')]
    add_colloc(s,3898,coin,'a quarter','一枚二十五分硬币','usage_example')
    set_usage(s,3898,coin,'North American use: a quarter is a coin worth 25 cents.')

    qi=s.reactivate(3899,'sense:queen:80c266a48f0e5354',cn='蜂王；蚁后等群居昆虫的产卵雌体',en='the fertile egg-laying female in a colony of social insects such as bees or ants',level='L1',pos='noun')
    add_colloc(s,3899,qi,'queen bee','蜂王','usage_example')
    chess=new_ids[(3899,'chess_queen')]
    card=new_ids[(3899,'playing_card_queen')]
    add_colloc(s,3899,chess,'chess queen','国际象棋中的后','usage_example')
    add_colloc(s,3899,card,'queen of hearts','红桃Q；红心皇后牌','usage_example')
    set_clusters(s,3899,[
        {'label_cn':'女王；女君主','label_en':'a female monarch','pos':'noun','sense_ids':['sense:queen:9e36113e1353510b']},
        {'label_cn':'王后','label_en':'the wife or widow of a king','pos':'noun','sense_ids':['sense:queen:6c68b4dedf3c5858']},
        {'label_cn':'蜂王；蚁后','label_en':'fertile female in a social-insect colony','pos':'noun','sense_ids':[qi]},
        {'label_cn':'国际象棋的后','label_en':'the queen in chess','pos':'noun','sense_ids':[chess]},
        {'label_cn':'Q牌；皇后牌','label_en':'a queen playing card','pos':'noun','sense_ids':[card]},
    ],'女王/王后；蜂王；棋类或纸牌中的 queen','female monarch/consort; insect queen; chess/card queen')

    oldq=s.reactivate(3900,'sense:queer:a9caf508d8e055fe',cn='奇怪的；古怪的（较旧或语境敏感用法）',en='strange or odd; an older or context-sensitive use',level='L3',pos='adjective')
    set_usage(s,3900,oldq,'Older/context-sensitive use. In current contexts queer more often has identity/community meanings; interpret by context.')
    qnoun='sense:queer:af7a2e2821725385'
    s.update_sense(3900,qnoun,cn='酷儿；以 queer 自我认同的人',en='a person who self-identifies as queer',level='L2')
    set_usage(s,3900,qnoun,'Queer is reclaimed and self-identifying for many people and communities, but it can still be offensive to some people, especially when imposed as a label.')
    qadj=new_ids[(3900,'identity_adjective')]
    set_usage(s,3900,qadj,'Widely used as a reclaimed/self-identifying umbrella adjective, but it may still be offensive to some people; prefer people’s own labels where known.')
    add_colloc(s,3900,qadj,'queer community','酷儿社群','usage_example')
    s.update_sense(3900,'sense:queer:bd1219801f17509a',level='L3',usage_note='Older/informal verb use; not learner-main.')
    set_clusters(s,3900,[
        {'label_cn':'酷儿的；以 queer 自我认同的','label_en':'identity/community adjective','pos':'adjective','sense_ids':[qadj]},
        {'label_cn':'酷儿；以 queer 自我认同的人','label_en':'a person who self-identifies as queer','pos':'noun','sense_ids':[qnoun]},
        {'label_cn':'奇怪的；古怪的（较旧）','label_en':'strange or odd (older/context-sensitive)','pos':'adjective','sense_ids':[oldq]},
        {'label_cn':'搞糟；使陷入困境（旧/非主干）','label_en':'spoil or put in difficulty (older/lower priority)','pos':'verb','sense_ids':['sense:queer:bd1219801f17509a']},
    ],'当前常见为身份/社群用法；也有较旧的“奇怪”义','current identity/community use; older strange/odd use remains context-dependent')

    mirror_existing_relation(s,'deep:semantic_contrast:query:06e0b392e0e44be3',3901,3903,'semantic_neighbors',
        'question is the broad everyday word for asking or an issue; query often means a request for information or a doubt requiring clarification.')

    issue=new_ids[(3903,'matter_issue_noun')]
    add_colloc(s,3903,issue,'the question of funding','资金问题；关于资金的议题','usage_example')
    for c in s.active_sense(3903,'sense:question:b676ef4ce4815bad').get('collocations',[]):
        if c.get('phrase')=='in question':
            c['meaning_cn']='所讨论/所指的；有疑问的'
            if c.get('collocation_id') in s.coll_by_id:
                reg=s.coll_by_id[c['collocation_id']]
                reg['current_value_hash']=sha(c)
                s.dirty_coll_paths.add(s.coll_rows[c['collocation_id']][0])
            s.mark(3903)
    hit=False
    for c in s.rec(3903).get('constructions',[]):
        if c.get('pattern')=='in question':
            c['definition_en']='the person or thing being discussed or referred to; or something whose truth, validity, or quality is being doubted'
            c['meaning_cn']='所讨论/所指的；有疑问的'
            c['boundary']='in question = being discussed/referred to, or subject to doubt'
            hit=True
            s.mark(3903)
    if not hit: raise RuntimeError('QUESTION_IN_QUESTION_CONSTRUCTION_MISSING')

    qverb=s.reactivate(3905,'sense:queue:cebf61132cdc5f87',cn='排队；列队等候',en='to wait or form a line of people or vehicles',level='L1',pattern='vi. + up / for',pos='verb',transitivity='vi')
    add_colloc(s,3905,qverb,'queue up / queue for sth','排队；排队等候某物','fixed_pattern')
    set_clusters(s,3905,[
        {'label_cn':'队列；长队','label_en':'a line of people or vehicles waiting','pos':'noun','sense_ids':['sense:queue:e44024e301e45403']},
        {'label_cn':'排队；列队等候','label_en':'wait or form a line','pos':'verb','sense_ids':[qverb]},
        {'label_cn':'将数据排入队列','label_en':'arrange or store data in a queue','pos':'verb','sense_ids':['sense:queue:8061e3485b8457d5']},
    ],'队列；排队；计算中的队列','a queue/line; to queue; also a computing queue')

    s.update_sense(3910,'sense:quite:dfb9864e3a2e5118',en='to a noticeable or moderate degree; fairly',cn='相当；颇',level='L1')
    retire_quiet_duplicate(s)
    mirror_existing_relation(s,SURVIVOR_QUIET,3907,3910,'confusables',
        'quite is a degree adverb meaning fairly/completely depending context; quiet means making little/no noise or calm.')

    quilt_n=s.reactivate(3908,'sense:quilt:0651d8944bca5f16',cn='被子；拼布被',en='a bed covering made from layers of fabric stitched together, often with padding',level='L1',pos='noun')
    quilt_v=s.reactivate(3908,'sense:quilt:4a98edcf2bf85806',cn='缝制成被；把多层材料绗缝在一起',en='to stitch layers of fabric or material together, especially to make a quilted covering',level='L2',pattern='vt. + object / vi.',pos='verb',transitivity='vt/vi')
    add_colloc(s,3908,quilt_n,'patchwork quilt','拼布被','usage_example')
    set_clusters(s,3908,[
        {'label_cn':'被子；拼布被','label_en':'a quilted bed covering','pos':'noun','sense_ids':[quilt_n]},
        {'label_cn':'缝制；绗缝','label_en':'stitch layers together','pos':'verb','sense_ids':[quilt_v]},
    ],'被子；把材料缝成多层覆盖物','a quilt; to stitch layers together')

    s.move_colloc(3909,'quit a job','sense:quit:d6e168e0a1275749')

    rabbit=s.reactivate(3915,'sense:rabbit:1871d5639d9452f5',cn='兔；兔子',en='a small burrowing mammal with long ears and a short tail',level='L1',pos='noun')
    add_colloc(s,3915,rabbit,'a pet/wild rabbit','宠物兔/野兔','usage_example')
    set_clusters(s,3915,[
        {'label_cn':'兔；兔子','label_en':'the animal rabbit','pos':'noun','sense_ids':[rabbit]},
        {'label_cn':'兔肉','label_en':'rabbit meat','pos':'noun','sense_ids':['sense:rabbit:14ff55ea63455fac']},
    ],'兔子；兔肉','the animal rabbit; also rabbit meat')

    s.update_sense(3916,'sense:race:62a1187b2b655ab0',
        cn='种族；族群类别（社会和历史形成的分类概念）',
        en='a socially and historically constructed category used to group people, often by perceived physical characteristics or ancestry',
        level='L1')
    human=new_ids[(3916,'humankind_noun')]
    s.move_colloc(3916,'human race',human)
    set_clusters(s,3916,[
        {'label_cn':'赛跑；比赛','label_en':'a competition of speed','pos':'noun','sense_ids':['sense:race:85bf965ffe0d5a87']},
        {'label_cn':'种族；族群类别','label_en':'a socially and historically constructed human category','pos':'noun','sense_ids':['sense:race:62a1187b2b655ab0']},
        {'label_cn':'人类；全人类','label_en':'humankind','pos':'noun','sense_ids':[human]},
        {'label_cn':'赛跑；竞赛','label_en':'compete in a race','pos':'verb','sense_ids':['sense:race:24710a00c8fb5294']},
    ],'比赛；种族类别；the human race = 人类','race as competition; human social category; the human race = humankind')

    rackv=s.reactivate(3918,'sense:rack:d49e8b3ee3955412',cn='折磨；使痛苦',en='to cause severe physical or mental pain or distress',level='L2',pattern='vt. + object',pos='verb',transitivity='vt')
    add_construction(s,3918,"rack one's brains",'绞尽脑汁；苦思冥想','to think very hard in order to remember or solve something',rackv,'L1',"rack one's brains")

    s.move_colloc(3921,'a radiant smile','sense:radiant:d5e7cc5c8c5b5d4b')

    chem=new_ids[(3923,'chemistry_free_radical')]
    add_colloc(s,3923,chem,'free radical','自由基','fixed_pattern')
    s.add_cluster(3923,chem,'noun','自由基；化学基团','a chemical radical/free radical')

    for o in DELTA: s.mark(o)

def verify(s,before_nochange):
    errors=[]
    expected=set(DELTA+REMOTE)
    if set(s.changed_words)!=expected:
        errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    expected_new={
        base.sense_id(s.owner(o)['word'],branch)
        for o,rows in NEW_BRANCHES.items()
        for branch,*_ in rows
    }
    if set(s.new_senses)!=expected_new:
        errors.append(f'NEW_BRANCH_SET:{sorted(s.new_senses)}')

    for o,sid in [
        (3886,'sense:puzzle:4b96e70aaebd5666'),
        (3886,'sense:puzzle:ff58bb3419245834'),
        (3887,'sense:pyramid:21236deb84d956f6'),
        (3887,'sense:pyramid:7bc840f77bcb5188'),
        (3891,'sense:quality:3e6c819b49475652'),
        (3891,'sense:quality:4f1b1c97f11f584b'),
        (3895,'sense:quarantine:c09eac6bf29054ce'),
        (3899,'sense:queen:80c266a48f0e5354'),
        (3900,'sense:queer:a9caf508d8e055fe'),
        (3905,'sense:queue:cebf61132cdc5f87'),
        (3908,'sense:quilt:0651d8944bca5f16'),
        (3908,'sense:quilt:4a98edcf2bf85806'),
        (3915,'sense:rabbit:1871d5639d9452f5'),
        (3918,'sense:rack:d49e8b3ee3955412'),
    ]:
        if not s.active_sense(o,sid): errors.append(f'REACTIVATION_MISSING:o{o:04d}:{sid}')

    if not any(c.get('phrase')=='quit a job' for c in s.active_sense(3909,'sense:quit:d6e168e0a1275749').get('collocations',[])):
        errors.append('QUIT_JOB_NOT_ON_LEAVE_JOB')
    if not any(c.get('phrase')=='a radiant smile' for c in s.active_sense(3921,'sense:radiant:d5e7cc5c8c5b5d4b').get('collocations',[])):
        errors.append('RADIANT_SMILE_NOT_FIGURATIVE')
    issue=base.sense_id('question','matter_issue_noun')
    if not s.active_sense(3903,issue): errors.append('QUESTION_ISSUE_MISSING')
    if not any(x.get('pattern')=='in question' and 'discussed' in x.get('definition_en','') for x in s.rec(3903).get('constructions',[])):
        errors.append('IN_QUESTION_NOT_REPAIRED')
    if 'negative' in s.active_sense(3910,'sense:quite:dfb9864e3a2e5118').get('definition_en',''):
        errors.append('QUITE_NEGATION_FALSE_CLAIM')

    closures=[
        ('deep:semantic_contrast:pursue:2e9426401086822d',3882,1981),
        ('deep:semantic_contrast:put:b67ea3da7de6a557',3885,2772),
        ('deep:semantic_contrast:quarrel:308daf36a517cd80',3896,1436),
        ('deep:semantic_contrast:query:06e0b392e0e44be3',3901,3903),
        (SURVIVOR_QUIET,3907,3910),
    ]
    for rid,a,b in closures:
        p=_relation_path(rid)
        if not p.exists():
            errors.append(f'RELATION_MISSING:{rid}'); continue
        obj=base.load(p)
        ords={v.get('source_ordinal') for v in obj.get('word_views',[])}
        if not {a,b}.issubset(ords): errors.append(f'RECIPROCAL_VIEW_MISSING:{rid}:{sorted(ords)}')
        for o in (a,b):
            if not any(r.get('relation_id')==rid for r in s.owner(o).get('relation_refs',[])):
                errors.append(f'RECIPROCAL_REF_MISSING:{rid}:o{o:04d}')
    if DUP_QUIET_PATH.exists(): errors.append('QUIET_DUPLICATE_STILL_ACTIVE')
    for o in (3907,3910):
        if any(r.get('relation_id')==DUP_QUIET for r in s.owner(o).get('relation_refs',[])):
            errors.append(f'QUIET_DUPLICATE_REF:o{o:04d}')
    manifest=base.load(LEX/'relations'/'manifest.json')
    if manifest.get('relation_count')!=382:
        errors.append(f'RELATION_MANIFEST:{manifest.get("relation_count")}')

    for o in DELTA+REMOTE:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active':
                errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')

    for o,h in before_nochange.items():
        now=sha(base.load(OWNER/f'o{o:04d}.json'))
        if now!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    return errors

def main():
    before_nochange={o:sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State()
    apply(s)
    s.sync_registry_files()
    for o in sorted(s.changed_words): sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,before_nochange)
    if errors:
        raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    RECEIPT.mkdir(parents=True,exist_ok=True)
    receipt={
        'schema':'kianos.lexical.forward_shard_receipt.v2',
        'status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION',
        'authority':AUTH,
        'package':[3875,4124],
        'shard':[3875,3924],
        'reviewed_owner_count':50,
        'semantic_mutation_source_count':26,
        'semantic_source_ordinals':DELTA,
        'changed_word_ordinals':sorted(s.changed_words),
        'in_range_changed_word_ordinals':DELTA,
        'out_of_range_dependency_ordinals':REMOTE,
        'no_change_word_ordinals':NO_CHANGE,
        'new_semantic_branch_ids':sorted(s.new_senses),
        'new_semantic_branch_count':len(s.new_senses),
        'reactivated_stable_ids':sorted(set(s.reactivated)),
        'demoted_stable_ids':sorted(set(s.demoted)),
        'changed_relation_owner_paths':sorted(s.changed_relations),
        'retired_relation_ids':[DUP_QUIET],
        'surviving_relation_ids':[SURVIVOR_QUIET],
        'relation_manifest_count':382,
        'readback':{
            'all_50_owner_views':'PASS',
            'all_26_authorized_semantic_sources':'PASS',
            'no_change_24_byte_guard':'PASS',
            'three_remote_dependencies_only':'PASS',
            'reciprocal_relation_closure':'PASS',
            'quiet_quite_duplicate_retired':'PASS',
            'stable_registry_closure':'PASS',
        },
    }
    base.dump(RECEIPT/'o3875-o3924.json',receipt)
    print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
