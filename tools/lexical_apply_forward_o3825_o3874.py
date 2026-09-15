#!/usr/bin/env python3
"""Mechanical executor for frozen forward authority o3625-o3874, shard o3825-o3874."""
from __future__ import annotations
import copy, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_forward_o3625_o3674 as fwd
base=fwd.base
LEX=fwd.LEX; OWNER=fwd.OWNER; RECEIPT=fwd.RECEIPT; AUTH=fwd.AUTH
DELTA=[3826,3828,3831,3832,3833,3835,3837,3840,3841,3845,3847,3848,3849,3850,3858,3859,3863,3864,3867,3868,3870,3871]
REMOTE=[3880]
NO_CHANGE=[o for o in range(3825,3875) if o not in DELTA]
base.DELTA=DELTA; base.REMOTE_WORDS=REMOTE; base.AUTH=AUTH; base.NOW='2026-09-16T01:40:00Z'
REL_PROPOSE='content/lexical/relations/by-id/13/137de9b9c124c0247b8f7db36e2af48f2ec5ad67dcc03bcc9599603805558c44.json'


def ensure_reciprocal(s,source_o,target_o,relpath):
    p=ROOT/relpath; data=base.load(p); rid=data['relation_id']
    if any(v.get('source_ordinal')==target_o for v in data.get('word_views',[])):
        if not any(r.get('relation_id')==rid for r in s.owner(target_o).get('relation_refs',[])): raise RuntimeError('RELATION_VIEW_REF_DRIFT')
        return rid
    src=next((v for v in data.get('word_views',[]) if v.get('source_ordinal')==source_o),None)
    if not src: raise RuntimeError(f'RELATION_SOURCE_VIEW_MISSING:{rid}')
    payload=copy.deepcopy(src['payload']); sw=s.owner(source_o)['word']; tw=s.owner(target_o)['word']
    payload['source_expression']=tw; payload['target_expression']=sw; payload['target_word']=sw
    ss=payload.get('source_sense_id'); ts=payload.get('target_sense_id')
    if 'source_sense_id' in payload: payload['source_sense_id']=ts
    if 'target_sense_id' in payload: payload['target_sense_id']=ss
    if isinstance(payload.get('members'),list): payload['members']=[{'branch_id':None,'branch_label':None,'headword':tw,'participant_role':'CANONICAL_MEMBER','relevant_sense_ids':[],'word_id':s.owner(target_o)['word_id']}]
    idx=sum(1 for r in s.owner(target_o).get('relation_refs',[]) if r.get('field')==src.get('field'))
    data.setdefault('word_views',[]).append({'source_word_id':s.owner(target_o)['word_id'],'source_ordinal':target_o,'field':src.get('field'),'index':idx,'payload':payload})
    s.owner(target_o).setdefault('relation_refs',[]).append({'relation_id':rid,'owner_path':relpath,'field':src.get('field'),'index':idx})
    base.dump(p,data); s.changed_relations.add(relpath); s.mark(target_o); return rid


def apply(s):
    fwd.add_construction(s,3826,'pronounce sb/sth + adj/n','宣布某人/某物处于某状态；宣判为……','to declare or formally state that someone or something has a particular status or quality','sense:pronounce:4d4cc01115995f52','L1','predicative declaration: pronounced dead/guilty')

    proof_ev=s.reactivate(3828,'sense:proof:8ab8175ab48c58e6',cn='证据；证明',en='factual evidence that helps establish the truth of something',level='L1',pos='noun')
    proof_formal=s.reactivate(3828,'sense:proof:71547ac788cd561c',cn='证明；论证（尤指数学或逻辑证明）',en='a formal argument or series of statements demonstrating that a proposition follows or is true',level='L1',pos='noun')
    fwd.add_colloc(s,3828,proof_ev,'proof of sth','某事的证据/证明','fixed_pattern'); fwd.add_colloc(s,3828,proof_formal,'mathematical proof','数学证明','usage_example')
    fwd.set_clusters(s,3828,[{'label_cn':'证据；证明','label_en':'evidence establishing truth','pos':'noun','sense_ids':[proof_ev]},{'label_cn':'数学/逻辑证明','label_en':'a formal mathematical or logical proof','pos':'noun','sense_ids':[proof_formal]}],'证据；证明；数学/逻辑证明','evidence or a formal proof')

    s.rename_colloc(3831,'propel + sb/sth + to + sth','propel sb/sth into/towards/to + destination/state','推动某人/某物进入、朝向某处或达到某状态')
    s.update_sense(3831,'sense:propel:64493ab0a926561c',usage_note='Use licensed destination/state frames such as propel sb/sth into/towards/to a destination or state; avoid malformed “to + sth” as a universal template.')

    proper=s.reactivate(3832,'sense:proper:5aacda5f144453cf',cn='适当的；合适的；正确的',en='suitable, appropriate, or correct for the circumstances',level='L1',pos='adjective')
    fwd.add_colloc(s,3832,proper,'proper procedure/way','适当的程序/正确方式','usage_example'); fwd.set_clusters(s,3832,[{'label_cn':'适当的；合适的；正确的','label_en':'suitable, appropriate, or correct','pos':'adjective','sense_ids':[proper]}],'适当的；正确的','suitable, appropriate, or correct')

    prop=s.reactivate(3833,'sense:property:e8f9398f1bf15486',cn='性质；属性；特性',en='a characteristic, quality, or attribute of something',level='L1',pos='noun')
    fwd.add_colloc(s,3833,prop,'properties of materials','材料的性质','usage_example'); fwd.set_clusters(s,3833,[{'label_cn':'财产；所有物','label_en':'property or something owned','pos':'noun','sense_ids':['sense:property:9a1058a3861c5a35']},{'label_cn':'性质；属性','label_en':'a characteristic or attribute','pos':'noun','sense_ids':[prop]},{'label_cn':'舞台/影视道具','label_en':'a stage or film property/prop','pos':'noun','sense_ids':['sense:property:a56f18865e615218']}],'财产；性质/属性','something owned; a characteristic or property')

    proportion=s.reactivate(3835,'sense:proportion:e26cd9308ffe5921',cn='比例；比率；两数量之间的比例关系',en='a ratio or relationship between two amounts, or a part of a whole expressed relative to the whole',level='L1',pos='noun')
    fwd.add_colloc(s,3835,proportion,'the proportion of A to B','A 与 B 的比例','fixed_pattern'); fwd.set_clusters(s,3835,[{'label_cn':'比例；比率','label_en':'ratio or quantitative relationship','pos':'noun','sense_ids':[proportion]},{'label_cn':'一部分；占比','label_en':'a part or share of a whole','pos':'noun','sense_ids':['sense:proportion:5e6b1c9b2fb8ef9d']},{'label_cn':'均衡；匀称','label_en':'balanced or appropriate relative dimensions','pos':'noun','sense_ids':['sense:proportion:a24763cd1e655205']}],'比例；占比；均衡','ratio/proportion, share of a whole, or balanced dimensions')

    s.rename_colloc(3837,'propose to do + sth','propose to do sth','打算做某事')
    fwd.add_construction(s,3837,'propose doing sth','提议做某事','to suggest doing something','sense:propose:7fb845ce74115c26','L1')
    ensure_reciprocal(s,3837,3880,REL_PROPOSE)

    prosecute=s.reactivate(3840,'sense:prosecute:f23c39bbde4b55f3',cn='从事；执行；继续进行（活动、计划等）',en='to carry out, pursue, or continue an activity, plan, or undertaking',level='L2',pattern='vt. + object',pos='verb',transitivity='vt')
    fwd.add_colloc(s,3840,prosecute,'prosecute a campaign/war','进行一场运动/战争','usage_example'); fwd.set_clusters(s,3840,[{'label_cn':'起诉；检控','label_en':'bring criminal/legal proceedings','pos':'verb','sense_ids':['sense:prosecute:d8c125abf8125d52']},{'label_cn':'从事；执行；继续进行','label_en':'carry out or pursue an activity/plan','pos':'verb','sense_ids':[prosecute]}],'起诉；也可正式地指执行/进行某项活动','prosecute legally; formally carry out/pursue an activity')

    prospect=s.add_new(3841,'potential_customer_candidate','noun','潜在客户；可能的人选；有希望的人',en='a person who may become a customer, client, candidate, recruit, or other desired participant',level='L2')
    fwd.add_colloc(s,3841,prospect,'a sales/job prospect','潜在客户/有希望的人选','usage_example'); s.add_cluster(3841,prospect,'noun','潜在客户/人选','a likely customer or candidate')
    s.set_core(3841,'前景/可能性；潜在客户或人选；景色；勘探','prospects for success; a potential customer/candidate; a view; to prospect')

    prosperous=s.reactivate(3845,'sense:prosperous:3ebacf2b43325c6c',cn='繁荣的；成功的；富裕的',en='successful, thriving, and often financially or economically well-off',level='L1',pos='adjective')
    fwd.add_colloc(s,3845,prosperous,'a prosperous economy/business','繁荣的经济/兴旺的企业','usage_example'); fwd.set_clusters(s,3845,[{'label_cn':'繁荣的；成功富裕的','label_en':'successful, thriving, and wealthy','pos':'adjective','sense_ids':[prosperous]}],'繁荣的；成功富裕的','successful, thriving, and prosperous')

    s.update_sense(3847,'sense:protein:1050f036b9705084',cn='蛋白质；由氨基酸链构成的生物大分子',en='a biological macromolecule made of one or more amino-acid chains, essential to structure and function in living organisms and also obtained through diet',level='L1',usage_note='Foods such as meat, eggs, beans, and dairy are sources of dietary protein; they do not define what a protein is.')
    s.set_core(3847,'蛋白质：由氨基酸链构成的重要生物大分子，也是重要营养素','proteins are amino-acid-chain biological macromolecules and an essential nutrient')

    protest=s.reactivate(3848,'sense:protest:fdac161584ea532b',cn='抗议；反对',en='to express strong disagreement or objection, especially publicly',level='L1',pattern='vt./vi. + against/about',pos='verb',transitivity='vt/vi')
    fwd.add_colloc(s,3848,protest,'protest against/about sth','抗议/反对某事','fixed_pattern')
    fwd.set_clusters(s,3848,[{'label_cn':'抗议；反对','label_en':'a public objection or protest','pos':'noun','sense_ids':['sense:protest:adbb5a2ec1aa5567']},{'label_cn':'抗议；反对','label_en':'express strong disagreement publicly','pos':'verb','sense_ids':[protest]}],'抗议；反对','a protest or to protest')
    fwd.set_form(s,3848,{'form_type':'same_spelling_pos_conditioned_pronunciation_with_dialect_variation','spelling':'protest','identity_rule':'same_word_owner_pos_conditioned_pronunciation','boundary':'noun protest normally has initial stress; verb stress is commonly final in BrE and can vary in AmE, so do not teach one universal verb stress pattern','variants':[{'variant_id':'form:protest:noun','surface':'protest','pos':['noun'],'ipa_bre':'/ˈprəʊ.test/','ipa_ame':'/ˈproʊ.test/','learner_key':'noun: initial stress'},{'variant_id':'form:protest:verb','surface':'protest','pos':['verb'],'ipa_bre':'/prəˈtest/','ipa_ame':'/prəˈtest/ or /ˈproʊ.test/','learner_key':'verb: final stress common; AmE variation exists'}]})

    s.update_sense(3849,'sense:protocol:5931eb054a3c5098',cn='规程；协议；正式程序；一套约定规则',en='an agreed formal procedure or set of rules for carrying out an activity, study, treatment, safety process, or other organized task',level='L1')
    computing=s.reactivate(3849,'sense:protocol:98996b77c5705eac',cn='（计算机/网络）协议',en='rules governing the format, transmission, and exchange of data between systems',level='L2',pos='noun')
    diplomatic=s.reactivate(3849,'sense:protocol:772a748c60d25636',cn='外交礼仪；礼节',en='formal ceremony, etiquette, and rules observed in diplomacy or official occasions',level='L2',pos='noun')
    fwd.add_colloc(s,3849,computing,'network protocol','网络协议','usage_example'); fwd.add_colloc(s,3849,diplomatic,'diplomatic protocol','外交礼仪','usage_example')
    fwd.set_clusters(s,3849,[{'label_cn':'规程；正式程序；约定规则','label_en':'an agreed formal procedure or set of rules','pos':'noun','sense_ids':['sense:protocol:5931eb054a3c5098']},{'label_cn':'计算机/网络协议','label_en':'data-communication rules/protocol','pos':'noun','sense_ids':[computing]},{'label_cn':'外交礼仪','label_en':'diplomatic etiquette/protocol','pos':'noun','sense_ids':[diplomatic]}],'规程/协议；计算机协议；外交礼仪','formal procedures/rules; computing protocol; diplomatic protocol')

    s.set_core(3850,'原型；样机；用于测试和发展后续版本的初步模型','a first/preliminary model used to test, develop, or create later versions')
    s.update_sense(3850,'sense:prototype:3851e15aeedb51f8',en='a first, preliminary, or original model built to test or develop later versions',cn='原型；样机；用于测试和发展后续版本的初步模型',level='L1')

    s.set_core(3858,'最近的；最接近的；直接的（空间、时间、次序或因果链）','nearest or closest in space, time, order, degree, or causal chain')
    s.update_sense(3858,'sense:proximate:65f5001275c65977',usage_note='proximate means nearest/closest or most direct in a chain; it does not ordinarily mean approximate')

    s.move_colloc(3859,'a prudent investor','sense:prudent:05cdac8135b55a76')
    s.update_sense(3859,'sense:prudent:05cdac8135b55a76',cn='审慎的；谨慎而明智的',en='careful, sensible, and showing sound judgment about possible consequences',level='L1')
    s.demote(3859,'sense:prudent:9e4626ecb85b531f',status='deprecated')
    fwd.set_clusters(s,3859,[{'label_cn':'审慎的；谨慎明智的','label_en':'careful, sensible, and showing sound judgment','pos':'adjective','sense_ids':['sense:prudent:05cdac8135b55a76']}],'审慎的；谨慎明智的','careful and sensible; marked by sound judgment')

    s.update_sense(3863,'sense:public:e4c7bfa29ab2559d',cn='公共的；公众的；公开的；由政府/公共机构提供的',en='relating to the public or community; open or available to everyone; or provided/owned by government or public bodies rather than privately',level='L1')
    fwd.add_colloc(s,3863,'sense:public:e4c7bfa29ab2559d','public place/service/sector','公共场所/公共服务/公共部门','usage_example')
    s.set_core(3863,'公共的/公众的；公开可用的；政府或公共机构提供的；the public=公众','public/community-wide, open to everyone, or publicly provided; the public = people in general')

    s.update_sense(3864,'sense:publication:8f7939826f8f5a53',cn='出版物；已公开发布的作品（纸质或数字）',en='a work made available or published for public, professional, or scholarly distribution, in print or digital form',level='L1')
    s.update_sense(3864,'sense:publication:f25c875b53405cc0',cn='出版业；出版业务',en='the business or activity of publishing works for distribution, in print or digital form',level='L2')
    s.set_core(3864,'出版/公布；出版物（纸质或数字）','publication as making public/publishing, or a published work in print or digital form')

    s.update_sense(3867,'sense:puff:acd82ee888b95f39',cn='一阵阵地吹/喷；抽一口（烟）',en='to emit, blow, draw, or take something in short puffs, including taking a puff of smoke',level='L1',usage_note='Smoking use belongs with taking/drawing a puff, not with the breathe-heavily sense.')
    s.move_colloc(3867,'puff on + a cigarette','sense:puff:acd82ee888b95f39')

    fwd.add_construction(s,3868,'pull off sth','成功完成困难的事','to succeed in doing something difficult or unexpected',level='L1')
    fwd.add_construction(s,3868,'pull out','离开；退出；驶出','to leave, withdraw, or move out from a place/commitment',level='L1')
    fwd.add_construction(s,3868,'pull through','熬过难关；康复','to survive a difficult situation or recover from serious illness',level='L1')

    pump_n=s.reactivate(3870,'sense:pump:4a77d2e885525f5a',cn='泵；抽水机；打气筒',en='a mechanical device that moves fluid or gas by pressure or suction',level='L1',pos='noun')
    pump_v=s.reactivate(3870,'sense:pump:5d10b6eece8f5349',cn='用泵抽送；打气',en='to move a fluid or gas using a pump or pumping action',level='L1',pattern='vt. + object',pos='verb',transitivity='vt')
    fwd.add_colloc(s,3870,pump_n,'water/air pump','水泵/气泵','usage_example'); fwd.add_colloc(s,3870,pump_v,'pump water/air','抽水/打气','usage_example')
    fwd.set_clusters(s,3870,[{'label_cn':'泵；抽水机；打气筒','label_en':'a device moving fluid or gas','pos':'noun','sense_ids':[pump_n]},{'label_cn':'用泵抽送；打气','label_en':'move fluid or gas with a pump','pos':'verb','sense_ids':[pump_v]}],'泵；泵送/打气','a pump and to pump fluid/gas')

    s.update_sense(3871,'sense:punch:91bec9abc085513b',cn='潘趣饮料；混合饮料（可含酒精也可不含）',en='a mixed drink, often fruit- or juice-based, that may be alcoholic or non-alcoholic',level='L2')
    hole=s.add_new(3871,'make_hole_with_punch','verb','打孔；冲孔',en='to make a hole or indentation in something using a punch, tool, or similar action',level='L2')
    s.move_colloc(3871,'punch a hole',hole); fwd.add_colloc(s,3871,hole,'punch holes in paper','在纸上打孔','usage_example'); s.add_cluster(3871,hole,'verb','打孔；冲孔','make a hole with a punch')
    s.set_core(3871,'拳打；打孔/冲孔；打孔器；潘趣饮料','to punch with a fist or make a hole; a punch tool; punch drink')

    for o in DELTA+REMOTE: s.mark(o)
    return base.load(ROOT/REL_PROPOSE)['relation_id']


def verify(s,rel_id,before):
    errors=[]; expected=set(DELTA+REMOTE)
    if set(s.changed_words)!=expected: errors.append(f'WORD_WRITE_SET:{sorted(s.changed_words)}')
    expected_new={base.sense_id('prospect','potential_customer_candidate'),base.sense_id('punch','make_hole_with_punch')}
    if set(s.new_senses)!=expected_new: errors.append(f'NEW_SENSE_SET:{sorted(s.new_senses)}')
    required=['sense:proof:8ab8175ab48c58e6','sense:proof:71547ac788cd561c','sense:proper:5aacda5f144453cf','sense:property:e8f9398f1bf15486','sense:proportion:e26cd9308ffe5921','sense:prosecute:f23c39bbde4b55f3','sense:prosperous:3ebacf2b43325c6c','sense:protest:fdac161584ea532b','sense:protocol:98996b77c5705eac','sense:protocol:772a748c60d25636','sense:pump:4a77d2e885525f5a','sense:pump:5d10b6eece8f5349']
    for sid in required:
        if sid not in s.reactivated: errors.append(f'REACTIVATION_MISSING:{sid}')
    if s.active_sense(3859,'sense:prudent:9e4626ecb85b531f') is not None: errors.append('PRUDENT_SECONDARY_STILL_ACTIVE')
    if not any(r.get('relation_id')==rel_id for r in s.owner(3880).get('relation_refs',[])): errors.append('PURPOSE_RECIPROCAL_MISSING')
    if not s.rec(3848).get('form_identity'): errors.append('PROTEST_FORM_MISSING')
    for o in DELTA+REMOTE:
        for x in s.active(o):
            reg=s.sense_by_id.get(x.get('sense_id'))
            if not reg or reg.get('status')!='active': errors.append(f'ACTIVE_REGISTRY_CLOSURE:o{o:04d}:{x.get("sense_id")}')
    for o,h in before.items():
        if base.sha(base.load(OWNER/f'o{o:04d}.json'))!=h: errors.append(f'NO_CHANGE_OWNER_DRIFT:o{o:04d}')
    if base.load(LEX/'relations'/'manifest.json').get('relation_count')!=383: errors.append('RELATION_MANIFEST_DRIFT')
    return errors


def main():
    before={o:base.sha(base.load(OWNER/f'o{o:04d}.json')) for o in NO_CHANGE}
    s=base.State(); rel_id=ensure_reciprocal(s,3837,3880,REL_PROPOSE); apply_result=apply(s)
    if rel_id!=apply_result: raise SystemExit('PROPOSE_RELATION_ID_DRIFT')
    s.sync_registry_files()
    for o in sorted(s.changed_words): fwd.sync_owner(s,o)
    s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f'o{o:04d}.json')
    errors=verify(s,rel_id,before)
    if errors: raise SystemExit('READBACK_FAILED:'+json.dumps(errors,ensure_ascii=False))
    receipt={'schema':'kianos.lexical.forward_shard_receipt.v2','status':'LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION','authority':AUTH,'package':[3625,3874],'shard':[3825,3874],'reviewed_owner_count':50,'semantic_mutation_source_count':22,'semantic_source_ordinals':DELTA,'changed_word_ordinals':sorted(s.changed_words),'out_of_range_dependency_ordinals':REMOTE,'no_change_word_ordinals':NO_CHANGE,'new_semantic_branch_ids':sorted(s.new_senses),'new_semantic_branch_count':len(s.new_senses),'reactivated_stable_ids':sorted(set(s.reactivated)),'demoted_stable_ids':sorted(set(s.demoted)),'changed_relation_owner_paths':sorted(s.changed_relations),'relation_manifest_count':383,'readback':{'all_50_owner_views':'PASS','all_22_authorized_semantic_sources':'PASS','propose_purpose_reciprocal':'PASS','protest_form_identity':'PASS','stable_registry_closure':'PASS'}}
    base.dump(RECEIPT/'o3825-o3874.json',receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
