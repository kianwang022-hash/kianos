#!/usr/bin/env python3
"""B-specific adversarial Projection tests for validator v1.2."""
from __future__ import annotations
import copy, json
from pathlib import Path
from validate_projection import ROOT, PREFIX, MANIFEST, Validator, validate_repository

B='digestive-metabolic-endocrine-tumor'
BROOT=PREFIX+'b-digestive-metabolic-endocrine-tumor/'
LEARN='content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json'

def encoded(value):
    return (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode('utf-8')

def run_suite(root: Path = ROOT) -> dict:
    cases=[]
    def check(name, fn):
        try:
            detail=fn(); cases.append({'name':name,'status':'PASS','detail':detail})
        except Exception as e:
            cases.append({'name':name,'status':'FAIL','error':f'{type(e).__name__}: {e}'})
            print(f'B_MUTATION_TEST_FAIL: {name}: {e}')

    report=validate_repository(root)
    def current():
        assert report['status']=='PASS',report['issues']
        assert (report['systems'],report['blocks'],report['assets'],report['canonical_kps'])==(4,76,80,1405)
        return {'coverage':'4/76/80/1405'}
    check('B_full_projection_coverage',current)

    assets={str(p.relative_to(root)):json.loads(p.read_text()) for p in (root/PREFIX).rglob('*.projection.json')}
    g5=BROOT+'blocks/g05.projection.json'; d15=BROOT+'blocks/d15.projection.json'; bsys=BROOT+'system.projection.json'

    def g5_order():
        v=Validator(root); assert v.run()['status']=='PASS'
        assert v.blocks['G5']['learner_order']==['b-g05-lg01','b-g05-lg02','b-g05-lg03']
        learn=json.loads((root/LEARN).read_text()); assert learn['blocks']['G5']['logic_groups']['b-g05-lg02']['kp']==[12,13]
        return {'order':v.blocks['G5']['learner_order'],'middle_range':[12,13]}
    check('B_G5_learning_order_not_file_order',g5_order)

    def neutral_map():
        v=Validator(root); assert v.run()['status']=='PASS'
        payload=v.neutral_payload(assets[d15],'BLOCK_RECALL_FRONT'); text=json.dumps(payload,ensure_ascii=False)
        assert '"goal"' not in text and '"closure"' not in text and '围术期' in text
        return {'labels_only':True}
    check('B_block_recall_front_labels_only',neutral_map)

    def empty_system_front():
        v=Validator(root); assert v.run()['status']=='PASS'; assert v.neutral_payload(assets[bsys],'SYSTEM_RECALL_FRONT')=={}
        return {'medical_payload_empty':True}
    check('B_system_recall_front_generic_renderer_only',empty_system_front)

    def bad_g5_order():
        learn=json.loads((root/LEARN).read_text()); learn['blocks']['G5']['learner_order']=['b-g05-lg01','b-g05-lg03','b-g05-lg02']
        r=validate_repository(root,{LEARN:encoded(learn)}); assert r['status']=='PASS',r['issues']
        v=Validator(root,{LEARN:encoded(learn)}); assert v.run()['status']=='PASS'; assert v.blocks['G5']['learner_order'][-1]=='b-g05-lg02'
        return {'binding_follows_learning_owner':True}
    check('B_order_is_bound_not_hardcoded',bad_g5_order)

    def missing_group():
        learn=json.loads((root/LEARN).read_text()); gid=learn['blocks']['D15']['learner_order'].pop(); learn['blocks']['D15']['logic_groups'].pop(gid)
        r=validate_repository(root,{LEARN:encoded(learn)}); assert r['status']=='FAIL' and any(i['code']=='OWNER' for i in r['issues']),r['issues']
        return {'rejected':'OWNER'}
    check('B_logic_group_gap_rejected',missing_group)

    def wrong_logic_owner():
        a=copy.deepcopy(assets[d15]); obj=next(o for o in a['objects'] if o['binding'].get('owner_type')=='LOGIC_GROUP_SET'); obj['binding']['block_id']='D14'
        r=validate_repository(root,{d15:encoded(a)}); assert r['status']=='FAIL' and any(i['asset']==d15 and i['code']=='OWNER' for i in r['issues']),r['issues']
        return {'rejected':'OWNER'}
    check('B_safe_logic_map_wrong_owner_rejected',wrong_logic_owner)

    def front_leak():
        a=copy.deepcopy(assets[d15]); a['views']['BLOCK_RECALL_FRONT']['learning_support_keys']=['logic_groups']
        r=validate_repository(root,{d15:encoded(a)}); assert r['status']=='FAIL' and any(i['asset']==d15 and i['code']=='VISIBILITY' for i in r['issues']),r['issues']
        return {'rejected':'VISIBILITY'}
    check('B_goal_closure_front_leak_rejected',front_leak)

    def no_second_lecture():
        for p,a in assets.items():
            if p.startswith(BROOT+'blocks/'):
                for oid in a['views']['BLOCK_ORIENT']['object_ids']:
                    o=next(x for x in a['objects'] if x['object_id']==oid)
                    assert not (o['binding'].get('kind')=='OWNER_REF' and o['binding'].get('role')=='CANONICAL_GUIDE'),p
        return {'B_block_orient_full_guide_count':0}
    check('B_block_orient_never_projects_full_canonical_guide',no_second_lecture)

    failed=sum(x['status']=='FAIL' for x in cases)
    return {'total':len(cases),'passed':len(cases)-failed,'failed':failed,'cases':cases}

if __name__=='__main__':
    r=run_suite(); print(json.dumps(r,ensure_ascii=False,indent=2)); raise SystemExit(1 if r['failed'] else 0)
