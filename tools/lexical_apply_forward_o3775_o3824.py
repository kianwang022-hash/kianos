#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3625-o3874, shard o3775-o3824."""
from __future__ import annotations
import copy, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_forward_o3625_o3674 as fwd
base=fwd.base
LEX=fwd.LEX; OWNER=fwd.OWNER; RECEIPT=fwd.RECEIPT; AUTH=fwd.AUTH
DELTA=[3775,3778,3791,3794,3799,3803,3804,3805,3806,3808,3809,3811,3812,3813,3816,3820]
DEPENDENCIES=[3779]
NO_CHANGE=[o for o in range(3775,3825) if o not in DELTA and o not in DEPENDENCIES]
base.DELTA=DELTA; base.REMOTE_WORDS=DEPENDENCIES; base.AUTH=AUTH; base.NOW='2026-09-16T01:20:00Z'
REL_PRINCIPAL='content/lexical/relations/by-id/49/49d7d9f99045fa5039ea2ab8c4046d8cc993b78d9fa3fa7f96824137dfb00c61.json'


def ensure_reciprocal(s,source_o,target_o,relpath):
    p=ROOT/relpath; data=base.load(p); rid=data['relation_id']
    if any(v.get('source_ordinal')==target_o for v in data.get('word_views',[])):
        if not any(r.get('relation_id')==rid for r in s.owner(target_o).get('relation_refs',[])):
            raise RuntimeError(f'RELATION_VIEW_REF_DRIFT:{rid}:o{target_o:04d}')
        return rid
    src=next((v for v in data.get('word_views',[]) if v.get('source_ordinal')==source_o),None)
    if not src: raise RuntimeError(f'RELATION_SOURCE_VIEW_MISSING:{rid}:o{source_o:04d}')
    payload=copy.deepcopy(src['payload']); sw=s.owner(source_o)['word']; tw=s.owner(target_o)['word']
    payload['source_expression']=tw; payload['target_expression']=sw; payload['target_word']=sw
    ss=payload.get('source_sense_id'); ts=payload.get('target_sense_id')
    if 'source_sense_id' in payload: payload['source_sense_id']=ts
    if 'target_sense_id' in payload: payload['target_sense_id']=ss
    if isinstance(payload.get('members'),list):
        payload['members']=[{'branch_id':None,'branch_label':None,'headword':tw,'participant_role':'CANONICAL_MEMBER','relevant_sense_ids':[],'word_id':s.owner(target_o)['word_id']}]
    idx=sum(1 for r in s.owner(target_o).get('relation_refs',[]) if r.get('field')==src.get('field'))
    data.setdefault('word_views',[]).append({'source_word_id':s.owner(target_o)['word_id'],'source_ordinal':target_o,'field':src.get('field'),'index':idx,'payload':payload})
    s.owner(target_o).setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':src.get('field'),'index':idx})
    base.dump(p,data); s.changed_relations.add(relpath); s.mark(target_o); return rid


def pronunciation_form(s,o,word,noun_ipa_bre,noun_ipa_ame,verb_ipa_bre,verb_ipa_ame):
    fwd.set_form(s,o,{'form_type':'same_spelling_pos_conditioned_pronunciation','spelling':word,'identity_rule':'same_word_owner_pos_conditioned_pronunciation','boundary':f'noun {word} has initial stress; verb {word} has final stress','variants':[{'variant_id':f'form:{word}:noun','surface':word,'pos':['noun'],'ipa_bre':noun_ipa_bre,'ipa_ame':noun_ipa_ame,'learner_key':'initial stress','role':'noun'},{'variant_id':f'form:{word}:verb','surface':word,'pos':['verb'],'ipa_bre':verb_ipa_bre,'ipa_ame':verb_ipa_ame,'learner_key':'final stress','role':'verb'}]})


def apply(s):
    # primitive: keep ordinary adjective + technical noun; human-reference noun is dated/offensive.
    s.update_sense(3775,'sense:primitive:df6a9f75ec1857af',level='L3',usage_note='dated and potentially offensive/dehumanizing when used as a noun for a person or people; avoid as neutral modern human reference')
    fwd.set_clusters(s,3775,[{'label_cn':'原始的；早期的；简单基本的','label_en':'early, undeveloped, simple, or basic','pos':'adjective','sense_ids':['sense:primitive:a4518d2581bd5c87']},{'label_cn':'基元；原语；图元','label_en':'a basic element or unit in computing or mathematics','pos':'noun','sense_ids':['sense:primitive:4cfd381955f450ef']}],'原始的；早期/简单基本的；技术上也可指基元','early/simple/basic; technical noun for a primitive element')

    ensure_reciprocal(s,3778,3779,REL_PRINCIPAL)

    s.update_sense(3791,'sense:probe:18d74906c8795a82',pattern='vt. + object / vi. + into',transitivity='vt/vi',usage_note='Common both with a direct object (probe the issue) and with into (probe into the matter).')
    fwd.add_construction(s,3794,'proceed to do sth','接着做下一件事；进而做某事','to continue by doing the next action','sense:proceed:ce58f7f8b25d52e6','L1')

    pronunciation_form(s,3799,'produce','/ˈprɒd.juːs/','/ˈproʊ.duːs/','/prəˈdjuːs/','/prəˈduːs/')

    s.update_sense(3803,'sense:productivity:e4c2da4fc74c5f32',cn='生产率；生产效率；单位投入的产出效率',en='the efficiency or rate of output relative to inputs such as labor, time, capital, or other resources',level='L1',usage_note='labor productivity is a common subtype; productivity is not limited to labor input')
    s.set_core(3803,'单位投入的产出效率/生产率','output or efficiency relative to labor, time, capital, or other inputs')

    profession=s.reactivate(3804,'sense:profession:fa33664877415888',cn='职业；专业（尤指需要专门教育、训练或技能的职业）',en='a job or career requiring special education, training, or skill, especially a recognized profession',level='L1',pos='noun')
    fwd.add_colloc(s,3804,profession,'the medical/legal profession','医学界/法律界','usage_example')
    fwd.set_clusters(s,3804,[{'label_cn':'职业；专业','label_en':'a trained or skilled occupation/profession','pos':'noun','sense_ids':[profession]},{'label_cn':'公开声明；信仰表白','label_en':'a formal declaration or profession of belief','pos':'noun','sense_ids':['sense:profession:670c410a0e095f46']}],'职业；专业；正式声明','a trained occupation/profession; formally, a declaration')

    evalp=s.add_new(3805,'competent_standard_evaluative','adjective','专业的；表现出应有职业水准的','showing the skill, competence, conduct, or standards expected of a trained professional','L1')
    fwd.add_colloc(s,3805,evalp,'professional manner/behavior/quality','专业的举止/行为/质量','usage_example'); s.add_cluster(3805,evalp,'adjective','专业的；符合职业水准的','showing professional competence or standards')
    s.set_core(3805,'职业的/专业人士的；也指表现得专业、符合职业水准','relating to a profession; also showing professional competence and standards')

    s.update_sense(3806,'sense:professor:8c4acab60ea959a4',cn='大学教授；在高校使用 professor 头衔的教师/学者',en='a college or university teacher or scholar who holds the title professor; the exact rank covered by the title varies by academic system',level='L1',usage_note='In many BrE/institutional systems professor often denotes a senior/full chair rank; in AmE professor is used across titles such as assistant, associate, and full professor. Do not force one regional ranking as universal.')
    s.set_core(3806,'大学教授（具体职级范围因地区/制度而异）','a university/college academic with a professor title; rank scope varies by system')

    profile=s.add_new(3808,'digital_account_profile','noun','（网站/应用中的）用户资料页；个人档案',en='a page or set of information describing a user, account, or person on an online service',level='L1')
    fwd.add_colloc(s,3808,profile,'user profile/profile page','用户资料/个人资料页','usage_example'); s.add_cluster(3808,profile,'noun','数字平台个人资料/用户档案','an online user/account profile')
    s.set_core(3808,'侧面/轮廓；简介/概况；数字平台个人资料','a side view or profile; a brief description; an online user/account profile')

    profit_n=s.reactivate(3809,'sense:profit:1c9fadfb470553b4',cn='利润；盈利',en='money or financial gain remaining after costs and expenses are paid',level='L1',pos='noun')
    profit_v=s.reactivate(3809,'sense:profit:f0ec702cc8c057e2',cn='获益；受益',en='to gain benefit or advantage from something',level='L1',pattern='vi. + from/by',pos='verb',transitivity='vi')
    fwd.add_colloc(s,3809,profit_n,'make a profit','获利；盈利','usage_example'); fwd.add_colloc(s,3809,profit_v,'profit from/by sth','从某事中获益','fixed_pattern')
    fwd.set_clusters(s,3809,[{'label_cn':'利润；盈利','label_en':'financial gain after costs','pos':'noun','sense_ids':[profit_n]},{'label_cn':'获益；受益','label_en':'gain benefit from something','pos':'verb','sense_ids':[profit_v]}],'利润；获益','financial profit; to benefit from something')

    profound=s.reactivate(3811,'sense:profound:ffebbbd863995474',cn='深刻的；思想深邃的；显示深刻洞见的',en='showing or causing deep knowledge, insight, understanding, or significance',level='L1',pos='adjective')
    fwd.add_colloc(s,3811,profound,'profound insight/understanding','深刻的洞见/理解','usage_example')
    fwd.set_clusters(s,3811,[{'label_cn':'深刻的；影响深远/程度极大的','label_en':'very great, deep, or intense','pos':'adjective','sense_ids':['sense:profound:829036b94b1356aa']},{'label_cn':'思想深邃的；有深刻洞见的','label_en':'showing deep insight or understanding','pos':'adjective','sense_ids':[profound]}],'深刻的；深远的；思想深邃的','very deep/intense or showing deep insight')

    fwd.set_form(s,3812,{'form_type':'regional_spelling_by_sense','spelling':'program','identity_rule':'same_word_owner_regional_spelling_by_sense','boundary':'AmE generally uses program; BrE commonly uses programme for planned activities/broadcasts, but program is standard for computing','variants':[{'variant_id':'form:program:ame','surface':'program','region':'AmE','roles':['computing','plan','broadcast']},{'variant_id':'form:programme:bre-general','surface':'programme','region':'BrE','roles':['plan_of_activities','broadcast']},{'variant_id':'form:program:bre-computing','surface':'program','region':'BrE','roles':['computing']} ]})

    pronunciation_form(s,3813,'progress','/ˈprəʊ.ɡres/','/ˈprɑː.ɡres/','/prəˈɡres/','/prəˈɡres/')

    pronunciation_form(s,3816,'project','/ˈprɒdʒ.ekt/','/ˈprɑː.dʒekt/','/prəˈdʒekt/','/prəˈdʒekt/')
    proj=s.add_new(3816,'convey_image_impression','verb','展示；传达（某种形象、印象、信心等）',en='to convey, communicate, or present a particular image, impression, confidence, authority, or quality',level='L2')
    fwd.add_colloc(s,3816,proj,'project confidence/an image of competence','展现自信/专业形象','usage_example'); s.add_cluster(3816,proj,'verb','展现/传达形象或印象','convey an image, impression, or confidence')
    s.set_core(3816,'项目；投射/放映；预测；展现某种形象/印象','a planned project; to project light/data; to forecast; to project an image/impression')

    promise_v=s.reactivate(3820,'sense:promise:03e39be070a25a7a',cn='承诺；答应',en='to tell or assure someone that something will happen or that you will do something',level='L1',pattern='vt. + object / to do / that-clause',pos='verb',transitivity='vt')
    promise_future=s.reactivate(3820,'sense:promise:87733f89ca3f5d9b',cn='希望；前途；成功的迹象',en='signs or potential of future success or good results',level='L2',pos='noun')
    fwd.add_colloc(s,3820,promise_v,'promise to do sth','承诺做某事','fixed_pattern'); fwd.add_colloc(s,3820,promise_future,'show promise','显示出潜力/前途','fixed_pattern')
    fwd.set_clusters(s,3820,[{'label_cn':'诺言；承诺','label_en':'a promise or assurance','pos':'noun','sense_ids':['sense:promise:05d0b6dde03d55fd']},{'label_cn':'承诺；答应','label_en':'promise or assure someone','pos':'verb','sense_ids':[promise_v]},{'label_cn':'希望；前途；潜力','label_en':'signs of future success or potential','pos':'noun','sense_ids':[promise_future]}],'承诺；诺言；也可指前途/潜力','a promise; to promise; signs of future success')

    for o in DELTA+DEPENDENCIES: s.mark(o)
    return base.load(ROOT/REL_PRINCIPAL)['relation_id']


def verify(s,principal_rel,before):
    errors=[]; expected=set(DELTA+DEPENDENCIES)
    if set(s.changed_words)!=expected: errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    expected_new={base.sense_id('professional','competent_standard_evaluative'),base.sense_id('profile','digital_account_profile'),base.sense_id('project','convey_image_impression')}
    if set(s.new_senses)!=expected_new: errors.append(f'NEW_SENSE_SET:{sorted(s.new_senses)}')
    for sid in ['sense:profession:fa33664877415888','sense:profit:1c9fadfb470553b4','sense:profit:f0ec702cc8c057e2','sense:profound:ffebbbd863995474','sense:promise:03e39be070a25a7a','sense:promise:87733f89ca3f5d9b']:
        if sid not in s.reactivated: errors.append(f'REACTIVATION_MISSING:{sid}')
    if not any(r.get('relation_id')==principal_rel for r in s.owner(3779).get('relation_refs',[])): errors.append('PRINCIPLE_RECIPROCAL_MISSING')
    for o in [3799,3812,3813,3816]:
        if not s.rec(o).get('form_identity'): errors.append(f'FORM_MISSING:o{o:04d}')
    for o in DELTA+DEPENDENCIES:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active': errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')
    for o,h in before.items():
        if base.sha(base.load(OWNER/f'o{o:04d}.json'))!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    if base.load(LEX/'relations'/'manifest.json').get('relation_count')!=383: errors.append('RELATION_MANIFEST_DRIFT')
    return errors


def main():
    before={o:base.sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State(); principal_rel=ensure_reciprocal(s,3778,3779,REL_PRINCIPAL); apply_result=apply(s)
    if apply_result!=principal_rel: raise SystemExit('PRINCIPAL_RELATION_ID_DRIFT')
    s.sync_registry_files()
    for o in sorted(s.changed_words): fwd.sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,principal_rel,before)
    if errors: raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTH,'package':[3625,3874],'shard':[3775,3824],'reviewed_owner_count':50,'semantic_mutation_source_count':16,'semantic_source_ordinals':DELTA,'changed_word_ordinals':sorted(s.changed_words),'in_range_dependency_ordinals':DEPENDENCIES,'no_change_word_ordinals':NO_CHANGE,'new_semantic_branch_ids':sorted(s.new_senses),'new_semantic_branch_count':len(s.new_senses),'reactivated_stable_ids':sorted(set(s.reactivated)),'changed_relation_owner_paths':sorted(s.changed_relations),'relation_manifest_count':383,'readback':{'all_50_owner_views':'PASS','all_16_authorized_semantic_sources':'PASS','principal_principle_reciprocal':'PASS','form_identity_closure':'PASS','stable_registry_closure':'PASS'}}
    base.dump(RECEIPT/'o3775-o3824.json',receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
