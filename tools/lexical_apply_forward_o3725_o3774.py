#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3625-o3874, shard o3725-o3774."""
from __future__ import annotations
import copy, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_forward_o3625_o3674 as fwd
base=fwd.base
LEX=fwd.LEX; OWNER=fwd.OWNER; RECEIPT=fwd.RECEIPT; AUTH=fwd.AUTH
DELTA=[3725,3726,3730,3735,3737,3739,3744,3745,3747,3752,3753,3757,3766,3768,3769,3770,3774]
DEPENDENCIES=[3743,3756,3773,3788,3794]
NO_CHANGE=[o for o in range(3725,3775) if o not in DELTA]
base.DELTA=DELTA; base.REMOTE_WORDS=DEPENDENCIES; base.AUTH=AUTH; base.NOW='2026-09-16T01:00:00Z'

REL_PRECEDE='content/lexical/relations/by-id/5f/5f8ae4baa1990c22a75419b6a95f8847ed21d7f14ece00d6028929861cfcd3e2.json'
REL_PRECEDENT='content/lexical/relations/by-id/80/8099aa6580cd578e0304f99a0b27c88d0b4e22c9038dfc63cbdea661f010d668.json'
REL_PREMISE='content/lexical/relations/by-id/4e/4e8c8908dbcedcbd5e3102d76fe5798fdb8733e59bc5238535bb21d7724f804c.json'
REL_PRICE='content/lexical/relations/by-id/a9/a9b13c561e3cdcd41de7572851adf9bd6e91bcd03a19b4cbe464829dcef7c7fa.json'
PRIME_PRIMARY_REL='relation:horizontal:7ea7fd4d687d0efe38ce'


def ensure_reciprocal(s,source_o,target_o,relpath):
    p=ROOT/relpath
    data=base.load(p)
    rid=data['relation_id']
    if any(v.get('source_ordinal')==target_o for v in data.get('word_views',[])):
        if not any(r.get('relation_id')==rid for r in s.owner(target_o).get('relation_refs',[])):
            raise RuntimeError(f'RELATION_VIEW_REF_DRIFT:{rid}:o{target_o:04d}')
        return rid
    src=next((v for v in data.get('word_views',[]) if v.get('source_ordinal')==source_o),None)
    if not src: raise RuntimeError(f'RELATION_SOURCE_VIEW_MISSING:{rid}:o{source_o:04d}')
    payload=copy.deepcopy(src['payload'])
    sw=s.owner(source_o)['word']; tw=s.owner(target_o)['word']
    payload['source_expression']=tw; payload['target_expression']=sw; payload['target_word']=sw
    ss=payload.get('source_sense_id'); ts=payload.get('target_sense_id')
    if 'source_sense_id' in payload: payload['source_sense_id']=ts
    if 'target_sense_id' in payload: payload['target_sense_id']=ss
    if isinstance(payload.get('members'),list):
        payload['members']=[{'branch_id':None,'branch_label':None,'headword':tw,'participant_role':'CANONICAL_MEMBER','relevant_sense_ids':[],'word_id':s.owner(target_o)['word_id']}]
    idx=sum(1 for r in s.owner(target_o).get('relation_refs',[]) if r.get('field')==src.get('field'))
    data.setdefault('word_views',[]).append({'source_word_id':s.owner(target_o)['word_id'],'source_ordinal':target_o,'field':src.get('field'),'index':idx,'payload':payload})
    s.owner(target_o).setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':src.get('field'),'index':idx})
    base.dump(p,data); s.changed_relations.add(relpath); s.mark(target_o)
    return rid


def add_prime_primary_relation(s):
    rid=PRIME_PRIMARY_REL; p=base.relation_owner_path(rid); relpath=p.relative_to(ROOT).as_posix()
    if p.exists():
        data=base.load(p)
        if {v.get('source_ordinal') for v in data.get('word_views',[])} != {3773,3774}:
            raise RuntimeError('PRIME_PRIMARY_EXISTING_OWNER_DRIFT')
        return rid,relpath
    note="primary and prime share the 'first/main' historical root, but primary is not a simple productive derivation learners should mechanically generate from prime."
    views=[]
    for o,target in [(3774,3773),(3773,3774)]:
        owner=s.owner(o); idx=sum(1 for r in owner.get('relation_refs',[]) if r.get('field')=='semantic_neighbors')
        payload={'relation_id':rid,'relation_type':'historical_relative','relation_scope':'lexeme','direction':'C','priority':'B','publication_status':'codex_reviewed','verification_status':'verified','writing_safe':False,'source_expression':owner['word'],'target_expression':s.owner(target)['word'],'target_word':s.owner(target)['word'],'boundary':note,'boundaries':[note],'learning_note':note,'shared_meaning':note,'task_tags':['reading']}
        views.append({'source_word_id':owner['word_id'],'source_ordinal':o,'field':'semantic_neighbors','index':idx,'payload':payload})
        owner.setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':'semantic_neighbors','index':idx}); s.mark(o)
    base.dump(p,{'schema':'kianos.lexical.relation_owner.v1','relation_id':rid,'canonical_record':None,'fact_record':None,'word_views':views,'provenance':{'materialized_from':'forward semantic reconciliation','semantic_delta':1,'authority':AUTH}})
    s.changed_relations.add(relpath)
    m=base.load(LEX/'relations'/'manifest.json'); m['relation_count']=int(m.get('relation_count',0))+1; base.dump(LEX/'relations'/'manifest.json',m)
    return rid,relpath


def set_present_form(s):
    fwd.set_form(s,3752,{'form_type':'same_spelling_pos_conditioned_pronunciation','spelling':'present','identity_rule':'same_word_owner_pos_conditioned_pronunciation','boundary':'noun/adjective present has initial stress; verb present has final stress','variants':[{'variant_id':'form:present:noun-adjective','surface':'present','pos':['noun','adjective'],'ipa_bre':'/ˈprez.ənt/','ipa_ame':'/ˈprez.ənt/','learner_key':'PRE-sent','role':'noun/adjective'},{'variant_id':'form:present:verb','surface':'present','pos':['verb'],'ipa_bre':'/prɪˈzent/','ipa_ame':'/prɪˈzent/','learner_key':'pre-SENT','role':'verb'}]})


def apply(s):
    # ordinary precede branch + reciprocal relation to proceed
    precede=s.reactivate(3725,'sense:precede:54c0db3b8aee53c5',cn='在……之前；先于',en='to come before something in time or order',level='L1',pattern='vt. + object',pos='verb',transitivity='vt')
    fwd.add_colloc(s,3725,precede,'A precedes B','A 在时间/顺序上先于 B','usage_example')
    fwd.set_clusters(s,3725,[{'label_cn':'在时间/顺序上先于','label_en':'come before in time or order','pos':'verb','sense_ids':[precede]},{'label_cn':'优先于；在前面','label_en':'have priority over; go before','pos':'verb','sense_ids':['sense:precede:56262efce5715517','sense:precede:85eb0546ebec5138']}],'先于；在……之前','to come before in time or order; sometimes have priority over')
    ensure_reciprocal(s,3725,3794,REL_PRECEDE)

    ensure_reciprocal(s,3726,3756,REL_PRECEDENT)

    # precision: attributive noun use, not an independent ordinary adjective identity
    s.move_colloc(3730,'precision instrument','sense:precision:5fc1aa34a3de50e6')
    s.move_colloc(3730,'Precision engineering is essential for aerospace.','sense:precision:5fc1aa34a3de50e6')
    s.update_sense(3730,'sense:precision:5fc1aa34a3de50e6',usage_note='precision is also commonly used attributively before another noun, as in precision instrument/engineering; this is noun modification, not a separate ordinary adjective lexeme')
    s.demote(3730,'sense:precision:b3ff04d32aff5941',status='deprecated')
    fwd.set_clusters(s,3730,[{'label_cn':'精确；精度；精密性','label_en':'exactness, accuracy, or degree of measurement refinement','pos':'noun','sense_ids':['sense:precision:5fc1aa34a3de50e6','sense:precision:49a466b61b9253e9']}],'精确；精度','exactness/accuracy and degree of precision')

    pred=s.reactivate(3735,'sense:predominant:09a78806d81c5797',cn='占主导地位的；最重要的；最有影响力的',en='main, most important, dominant, or having superior power and influence',level='L1',pos='adjective')
    fwd.add_colloc(s,3735,pred,'predominant influence/role','主导影响/主要作用','usage_example')
    fwd.set_clusters(s,3735,[{'label_cn':'最常见的；占多数的','label_en':'most common or frequent','pos':'adjective','sense_ids':['sense:predominant:f5d03bef5c305a25']},{'label_cn':'占主导的；最重要/最有影响力的','label_en':'dominant, main, or most influential','pos':'adjective','sense_ids':[pred]}],'占主导地位的；主要的','most common or dominant/most important')

    fwd.add_construction(s,3737,'prefer doing A to doing B','比做 B 更喜欢做 A','to like doing A better than doing B','sense:prefer:f5bc1b1b4076562f','L1')
    fwd.add_construction(s,3737,'prefer to do A rather than do B','宁愿做 A 而不做 B','to choose to do A instead of B','sense:prefer:f5bc1b1b4076562f','L1')
    fwd.add_construction(s,3737,'would prefer to do sth','更愿意做某事','polite/current preference for an action','sense:prefer:f5bc1b1b4076562f','L1')

    s.update_sense(3739,'sense:preference:b660ab6b6a7c501b',cn='优先；优待；较有利的待遇',en='priority or favorable treatment given to one person, option, or thing over another',level='L1',usage_note='give preference to means give priority or favorable treatment, not merely give someone the right to choose')

    s.update_sense(3744,'sense:premise:7fdb1a182d0b5799',cn='场所；房屋及所属土地（通常用复数 premises）',en='premises (normally plural): buildings and the land belonging to them, especially business or institutional property',level='L2',usage_note='The property/buildings sense is lexicalized mainly in the plural premises: on the premises, business premises. Do not teach singular premise as the ordinary property noun.')
    fwd.set_form(s,3744,{'form_type':'lexicalized_plural_boundary','spelling':'premise','identity_rule':'same_word_owner_plural_lexicalization','boundary':'the reasoning noun is singular premise; the buildings/property meaning is normally the lexicalized plural premises','variants':[{'variant_id':'form:premise:reasoning','surface':'premise','pos':['noun'],'number':'singular/countable','role':'assumption/basis for reasoning'},{'variant_id':'form:premises:property','surface':'premises','pos':['noun'],'number':'plural_lexicalized','role':'buildings and land/property'}]})
    fwd.set_clusters(s,3744,[{'label_cn':'前提；假定','label_en':'a statement/idea used as a basis for reasoning','pos':'noun','sense_ids':['sense:premise:605a4d9ea28953b6']},{'label_cn':'premises：场所；房屋及土地','label_en':'premises: buildings and land, normally plural','pos':'noun','sense_ids':['sense:premise:7fdb1a182d0b5799']},{'label_cn':'以……为前提','label_en':'base on a premise or assumption','pos':'verb','sense_ids':['sense:premise:a8897b2397bd5650']}],'前提；premises=场所','premise = assumption; premises = buildings/property')
    ensure_reciprocal(s,3744,3743,REL_PREMISE)

    fwd.add_construction(s,3745,'put/place a premium on sth','高度重视某事；认为某事特别有价值','to value, emphasize, or attach special importance to something',level='L1')
    fwd.add_construction(s,3747,'prepare to do sth','准备做某事','to make oneself ready to do something','sense:prepare:0bebb9d5b3595c55','L1')

    set_present_form(s)
    fwd.add_construction(s,3752,'present sb with sth','把某物赠予/授予某人','to give or formally award something to someone','sense:present:fd9aa1c9d2865256','L1')
    fwd.add_construction(s,3752,'present sth to sb','把某物赠予/授予某人','to give or formally award something to someone','sense:present:fd9aa1c9d2865256','L1')
    s.update_sense(3752,'sense:present:fd9aa1c9d2865256',en='to show, offer, give, or formally award something',cn='呈现；提出；赠予；授予',level='L1')

    s.update_sense(3753,'sense:presently:ce6ce96d2d6f51e5',usage_note='presently = now/currently is common especially in AmE and modern general use; context decides')
    s.update_sense(3753,'sense:presently:ee31daf6125a5336',usage_note='presently = soon/in a short time is established but style/region-sensitive; avoid bare fragments and use a full future context')
    s.rename_colloc(3753,'presently arrive','will arrive presently','不久将到达')

    fwd.add_construction(s,3757,'press on/ahead','继续前进；克服困难继续做','to continue or move forward despite difficulty or delay',level='L1')

    s.update_sense(3766,'sense:prevalent:90831bcc6f5c53a1',cn='普遍的；盛行的；广泛存在的',en='widespread, common, or frequently occurring in a particular place, group, or time',level='L1',usage_note='prevalent means widespread/common; it does not necessarily mean the single most frequent or dominant, which is closer to predominant')
    s.set_core(3766,'普遍的；盛行的','widespread or common, not necessarily predominant')

    s.update_sense(3768,'sense:previous:85ccf45925fd543b',cn='先前的；以前的；此前的',en='existing, happening, or occurring earlier or before the present or mentioned time/event; not necessarily immediately preceding',level='L1')
    s.set_core(3768,'先前的；以前的','earlier/before now or a mentioned time, not necessarily immediately before')

    fwd.add_construction(s,3769,"prey on one's mind",'萦绕心头；使人持续担忧','to worry, trouble, or occupy someone’s mind persistently',level='L1','idiomatic psychological use, not literal predation')

    ensure_reciprocal(s,3770,3788,REL_PRICE)

    # prime ↔ primary survivor relationship; remove duplicate learner-facing deep word-family projections only.
    s.rec(3774)['word_family']=[x for x in s.rec(3774).get('word_family',[]) if x.get('target_word')!='primary']
    s.rec(3773)['word_family']=[x for x in s.rec(3773).get('word_family',[]) if x.get('target_word')!='prime']
    s.mark(3774); s.mark(3773)
    rid,relpath=add_prime_primary_relation(s)

    for o in DELTA+DEPENDENCIES: s.mark(o)
    return rid,relpath


def verify(s,prime_rid,prime_path,before_nochange):
    errors=[]; expected=set(DELTA+DEPENDENCIES)
    if set(s.changed_words)!=expected: errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    if s.new_senses: errors.append(f'UNEXPECTED_NEW_SENSES:{sorted(s.new_senses)}')
    for sid in ['sense:precede:54c0db3b8aee53c5','sense:predominant:09a78806d81c5797']:
        if sid not in s.reactivated: errors.append(f'REACTIVATION_MISSING:{sid}')
    if s.active_sense(3730,'sense:precision:b3ff04d32aff5941') is not None: errors.append('PRECISION_ADJECTIVE_STILL_ACTIVE')
    if any(x.get('target_word')=='primary' for x in s.rec(3774).get('word_family',[])): errors.append('PRIME_DUP_FAMILY_REMAINS')
    if any(x.get('target_word')=='prime' for x in s.rec(3773).get('word_family',[])): errors.append('PRIMARY_DUP_FAMILY_REMAINS')
    if prime_path not in s.changed_relations: errors.append('PRIME_PRIMARY_RELATION_NOT_WRITTEN')
    for o in (3773,3774):
        if not any(r.get('relation_id')==prime_rid for r in s.owner(o).get('relation_refs',[])): errors.append(f'PRIME_PRIMARY_REF_MISSING:{o}')
    for source,target,relpath in [(3725,3794,REL_PRECEDE),(3726,3756,REL_PRECEDENT),(3744,3743,REL_PREMISE),(3770,3788,REL_PRICE)]:
        rid=base.load(ROOT/relpath)['relation_id']
        if not any(r.get('relation_id')==rid for r in s.owner(target).get('relation_refs',[])): errors.append(f'RECIPROCAL_REF_MISSING:{source}:{target}')
    for o in DELTA+DEPENDENCIES:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active': errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')
    for o,h in before_nochange.items():
        if base.sha(base.load(OWNER/f'o{o:04d}.json'))!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    if base.load(LEX/'relations'/'manifest.json').get('relation_count')!=383: errors.append('RELATION_MANIFEST_NOT_383')
    return errors


def main():
    before={o:base.sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State(); rid,relpath=apply(s); s.sync_registry_files()
    for o in sorted(s.changed_words): fwd.sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,rid,relpath,before)
    if errors: raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTH,'package':[3625,3874],'shard':[3725,3774],'reviewed_owner_count':50,'semantic_mutation_source_count':17,'semantic_source_ordinals':DELTA,'changed_word_ordinals':sorted(s.changed_words),'in_range_dependency_ordinals':DEPENDENCIES,'no_change_word_ordinals':NO_CHANGE,'new_semantic_branch_ids':[],'new_semantic_branch_count':0,'reactivated_stable_ids':sorted(set(s.reactivated)),'demoted_stable_ids':sorted(set(s.demoted)),'new_relation_id':rid,'changed_relation_owner_paths':sorted(s.changed_relations),'relation_manifest_count':383,'readback':{'all_50_owner_views':'PASS','all_17_authorized_semantic_sources':'PASS','reciprocal_relations':'PASS','prime_primary_survivor':'PASS','stable_registry_closure':'PASS'}}
    base.dump(RECEIPT/'o3725-o3774.json',receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
