#!/usr/bin/env python3
"""Mutation and positive-control tests against the production asset validator.

Every mutation lives in an in-memory overlay. Assertions check actual validation
results/error classes and affected scopes, not just helper exceptions or strings.
"""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from typing import Callable

from validate_projection import (
    ROOT, PREFIX, MANIFEST, Invalid, Validator, blob_sha, pointer_get,
    select_text, strict_json, validate_repository,
)


def encoded(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf-8')


def run_suite(root: Path = ROOT) -> dict:
    cases = []
    manifest = json.loads((root/MANIFEST).read_text())
    assets = {str(p.relative_to(root)): json.loads(p.read_text()) for p in (root/PREFIX).rglob('*.projection.json')}
    b1 = PREFIX+'a1-circulation/blocks/b01.projection.json'
    b2 = PREFIX+'a1-circulation/blocks/b02.projection.json'
    b7 = PREFIX+'a1-circulation/blocks/b07.projection.json'
    r1 = PREFIX+'a2-respiratory/blocks/r01.projection.json'
    r2 = PREFIX+'a2-respiratory/blocks/r02.projection.json'
    u5 = PREFIX+'a3-urinary/blocks/b05.projection.json'
    system = PREFIX+'a1-circulation/system.projection.json'

    def check(name: str, fn: Callable):
        try:
            detail = fn()
            cases.append({'name': name, 'status': 'PASS', 'detail': detail})
        except Exception as e:
            cases.append({'name': name, 'status': 'FAIL', 'error': f'{type(e).__name__}: {e}'})
            print(f'MUTATION_TEST_FAIL: {name}: {e}')

    def changed(rel, mutate):
        a = copy.deepcopy(assets[rel]); mutate(a)
        return {rel: encoded(a)}

    def negative(rel, mutate, code):
        result = validate_repository(root, changed(rel, mutate))
        issues = [i for i in result['issues'] if i['asset'] == rel and i['code'] == code]
        assert result['status'] == 'FAIL' and issues, result['issues']
        return {'expected_rejection':code, 'affected_asset':rel}

    def positive(overrides=None):
        report = validate_repository(root, overrides)
        assert report['status'] == 'PASS', report['issues']
        return {'accepted_assets':report['assets']}

    def source_path(rel, kind):
        return next(s['path'] for s in assets[rel]['sources'] if s['kind'] == kind)

    def edited_json(path, mutate):
        obj = json.loads((root/path).read_text());mutate(obj)
        return {path:encoded(obj)}

    def expect_scope(overrides, bad_path, code):
        report = validate_repository(root, overrides)
        failed = {p for p, item in report['results'].items() if item['status'] == 'FAIL'}
        assert failed == {bad_path}, (failed, report['issues'])
        assert any(i['asset'] == bad_path and i['code'] == code for i in report['issues']), report['issues']
        return {'failed_assets':sorted(failed), 'unaffected_pass':sum(x['status']=='PASS' for x in report['results'].values())}

    check('current_full_manifest_41_assets', positive)
    def seven():
        report = validate_repository(root)
        expected = set(manifest['coverage']['rich_calibration_blocks'])
        got = {a['block_id'] for p,a in assets.items() if a.get('block_id') in expected and report['results'][p]['status'] == 'PASS'}
        assert got == expected and len(got) == 7
        assert all(len({o['geometry'] for o in a['objects']}) > 1 for a in assets.values() if a.get('block_id') in expected)
        return {'calibration_pass':sorted(got)}
    check('seven_heterogeneous_calibration_assets',seven)

    # Schema and identity: manipulate the same valid asset each time.
    negatives = [
        ('unknown_exact_schema',b1,lambda a:a.update(schema='not.kianos.block.v1'),'SCHEMA'),
        ('unknown_object_geometry',b1,lambda a:a['objects'][1].update(geometry='MAGIC'),'SCHEMA'),
        ('unknown_object_role',b1,lambda a:a['objects'][1].update(role='MAGIC'),'SCHEMA'),
        ('duplicate_source_ids',b1,lambda a:a['sources'].append(copy.deepcopy(a['sources'][0])),'DUPLICATE'),
        ('duplicate_object_ids',b1,lambda a:a['objects'].append(copy.deepcopy(a['objects'][0])),'DUPLICATE'),
        ('invented_inline_medical_body',b1,lambda a:a['objects'][1].update(content='invented answer'),'SCHEMA'),
        ('invented_top_level_answer',b1,lambda a:a.update(answer='invented answer'),'SCHEMA'),
        ('manifest_system_slot_mismatch',b1,lambda a:a.update(system_id='respiratory'),'OWNER'),
        ('canonical_scope_wrong_block',b1,lambda a:a['canonical_scope'].update(id='circulation-b02'),'OWNER'),
        ('kp_set_nonexistent_owner',b1,lambda a:a['kp_set'].update(block_id='circulation-b99'),'OWNER'),
        ('owner_ref_points_to_sibling_guide',b2,lambda a:a['objects'][1]['binding'].update(id='circulation-b03'),'OWNER'),
        ('owner_ref_unknown_role',b2,lambda a:a['objects'][1]['binding'].update(role='MADE_UP_OWNER'),'OWNER'),
        ('owner_ref_nonexistent_kp',b1,lambda a:a.update(kp_set={'kind':'OWNER_REF','owner_type':'KP','block_id':'circulation-b01','id':'circulation-b01-kp99'}),'OWNER'),
        ('owner_ref_nonexistent_logic_group',b1,lambda a:a.update(kp_set={'kind':'OWNER_REF','owner_type':'LOGIC_GROUP','block_id':'circulation-b01','id':'circulation-b01-lg99'}),'OWNER'),
        ('structured_binding_wrong_block',b1,lambda a:a['learning_support']['recall_spine']['selector'].update(value='/blocks/circulation-b02/recall_spine'),'OWNER'),
        ('missing_pin',b1,lambda a:a['sources'][0].pop('blob_sha'),'FRESHNESS'),
        ('invalid_pin',b1,lambda a:a['sources'][0].update(blob_sha='bad'),'FRESHNESS'),
        ('strict_hash_mismatch',b1,lambda a:a['sources'][0].update(blob_sha='0'*40),'STALE'),
        ('strict_derived_cannot_downgrade_to_resolve',b1,lambda a:a['sources'][0].update(freshness='RESOLVE_BINDING'),'FRESHNESS'),
        ('wrong_source_path',b1,lambda a:a['sources'][0].update(path='../outside.md'),'PATH'),
        ('missing_binding_type_guard',b1,lambda a:a['learning_support']['recall_spine'].pop('value_type'),'TYPE'),
        ('missing_source_id',b1,lambda a:a['objects'][1]['binding'].update(source_id='missing'),'SOURCE'),
        ('selector_unknown',b1,lambda a:a['objects'][1]['binding']['selector'].update(type='SEMANTIC_SEARCH'),'SELECTOR'),
        ('heading_fuzzy_typo',b1,lambda a:a['objects'][-1]['binding']['selector'].update(value='总 Framewor'),'SELECTOR'),
        ('remove_neutral_flag',b1,lambda a:a['views']['KP_RECALL_FRONT'].pop('protection'),'VISIBILITY'),
        ('remove_required_view',b1,lambda a:a['views'].pop('KP_RECALL_FRONT'),'VISIBILITY'),
        ('expose_recall_spine_via_support',b1,lambda a:a['views']['KP_RECALL_FRONT'].update(learning_support_keys=['recall_spine']),'VISIBILITY'),
        ('expose_closure_via_support',b1,lambda a:a['views']['BLOCK_RECALL_FRONT'].update(learning_support_keys=['logic_groups']),'VISIBILITY'),
        ('expose_canonical_kp_answer_policy',b1,lambda a:a['views']['KP_RECALL_FRONT'].update(kp_content_policy='CANONICAL_CORE_FULL'),'VISIBILITY'),
        ('remove_kp_neutral_policy',b1,lambda a:a['views']['KP_RECALL_FRONT'].pop('kp_content_policy'),'VISIBILITY'),
        ('unsafe_binding_falsely_tagged_safe',b1,lambda a:(a['objects'][1].update(answer_bearing=False),a['views']['KP_RECALL_FRONT'].update(object_ids=[a['objects'][1]['object_id']])),'VISIBILITY'),
        ('guide_falsely_tagged_problem_safe',b2,lambda a:(a['objects'][1].update(answer_bearing=False,role='PROBLEM'),a['views']['BLOCK_RECALL_FRONT'].update(object_ids=[a['objects'][1]['object_id']])),'VISIBILITY'),
        ('unsafe_system_prompt_binding',system,lambda a:next(o for o in a['objects'] if o['object_id']=='circulation-recall-prompt')['binding']['selector'].update(value='/system_recall/reverse_case_algorithm'),'TYPE'),
        ('front_context_leak',b1,lambda a:a['views']['KP_RECALL_FRONT'].update(context_policy='OWNED_ONLY'),'VISIBILITY'),
        ('front_extra_sidebar',b1,lambda a:a['views']['KP_RECALL_FRONT'].update(sidebar={'answer':'leak'}),'SCHEMA'),
        ('front_enrichment_leak',r1,lambda a:a['views']['KP_RECALL_FRONT'].update(enrichment_policy='ANCHOR_AND_TIMING_ONLY'),'VISIBILITY'),
        ('front_enrichment_deny_missing',r1,lambda a:a['views']['KP_RECALL_FRONT'].pop('enrichment_policy'),'VISIBILITY'),
        ('front_route_policy_missing',b2,lambda a:a['views']['BLOCK_RECALL_FRONT'].pop('logic_map_policy'),'VISIBILITY'),
        ('unknown_view_object',b1,lambda a:a['views']['BLOCK_ORIENT'].update(object_ids=['missing']),'VISIBILITY'),
        ('unknown_view_support',b1,lambda a:a['views']['BLOCK_ORIENT'].update(learning_support_keys=['missing']),'VISIBILITY'),
        ('index_filter_field_typo',r2,lambda a:a['enrichment_bindings'][0].update(where={'anchor.blok_id':'respiratory-r02'}),'SELECTOR'),
        ('index_filter_empty',r2,lambda a:a['enrichment_bindings'][0].update(where={}),'SELECTOR'),
        ('index_filter_selects_sibling',r2,lambda a:a['enrichment_bindings'][0].update(where={'anchor.block_id':'respiratory-r03'}),'OWNER'),
        ('index_id_missing',r1,lambda a:a['enrichment_bindings'][0].update(item_id='missing'),'SELECTOR'),
        ('index_anchor_contradicts_source',r1,lambda a:a['enrichment_bindings'][0]['anchor'].update(logic_group_id='respiratory-r01-lg02'),'OWNER'),
        ('index_timing_not_preserved',r1,lambda a:a['enrichment_bindings'][0].update(timing_semantics='ALWAYS_SHOW_EVERYTHING'),'TIMING'),
        ('external_scope_widening',u5,lambda a:a['provenance_bindings'][0].update(scope_policy='ALL_TREATMENTS'),'PROVENANCE'),
        ('external_hash_bypass',u5,lambda a:next(s for s in a['sources'] if s['kind']=='EXTERNAL_SOURCE_CONTRACT').update(freshness='RESOLVE_BINDING'),'FRESHNESS'),
        ('external_contract_as_learner_object',u5,lambda a:a['objects'][1].update(binding=copy.deepcopy(a['provenance_bindings'][0])),'PROVENANCE'),
        ('external_provenance_front_leak',u5,lambda a:a['views']['KP_RECALL_FRONT'].update(provenance_policy='SHOW_ALL'),'VISIBILITY'),
    ]
    for name, rel, mutate, code in negatives:
        check(name, lambda r=rel,m=mutate,c=code:negative(r,m,c))

    # Source mutations exercise the full validator and inspect locality.
    learn = source_path(b1,'LEARNING_SUPPORT')
    core = source_path(b7,'MEDICAL_CORE')
    check('shared_file_unrelated_sibling_change_stays_green',lambda:positive(edited_json(learn,lambda x:x['blocks']['circulation-b02'].update(_test_sibling_metadata=True))))
    check('shared_file_target_text_edit_direct_ref_revalidates',lambda:positive(edited_json(learn,lambda x:x['blocks']['circulation-b07'].update(recall_spine=x['blocks']['circulation-b07']['recall_spine']+' '))))
    check('shared_file_remove_b7_ref_only_b7_fails',lambda:expect_scope(edited_json(learn,lambda x:x['blocks']['circulation-b07'].pop('recall_spine')),b7,'SELECTOR'))
    check('shared_file_wrong_b7_type_only_b7_fails',lambda:expect_scope(edited_json(learn,lambda x:x['blocks']['circulation-b07'].update(recall_spine={'wrong':'shape'})),b7,'TYPE'))
    original=(root/core).read_bytes();changed_core=original+b'\n<!-- test-only source revision -->\n'
    check('local_core_change_only_b7_stale',lambda:expect_scope({core:changed_core},b7,'STALE'))
    def repin():
        a=copy.deepcopy(assets[b7]);next(s for s in a['sources'] if s['kind']=='MEDICAL_CORE')['blob_sha']=blob_sha(changed_core)
        return positive({core:changed_core,b7:encoded(a)})
    check('targeted_repin_restores_all_without_page_change',repin)
    check('presentation_object_reorder_requires_no_page_change',lambda:positive(changed(b7,lambda a:a['objects'].reverse())))
    check('same_current_binding_new_presentation_object',lambda:positive(changed(b7,lambda a:(a['objects'].append(dict(copy.deepcopy(a['objects'][2]),object_id='test-extra-view-object')),a['views']['BLOCK_ORIENT']['object_ids'].append('test-extra-view-object')))))
    def source_bad(rel, kind, fn, code):
        path=source_path(rel,kind)
        return expect_scope(edited_json(path,fn),rel,code)
    check('external_admission_change_is_local_stale',lambda:source_bad(u5,'EXTERNAL_SOURCE_CONTRACT',lambda x:x.update(_test_revision=True),'STALE'))

    def index_duplicates():
        path=source_path(r1,'SELECTIVE_CUES')
        overrides=edited_json(path,lambda x:x['visual_bindings'].append(copy.deepcopy(x['visual_bindings'][0])))
        report=validate_repository(root,overrides)
        assert any(i['asset']==r1 and i['code']=='DUPLICATE' for i in report['issues']),report['issues']
        return {'rejected':'duplicate reviewed index id'}
    check('duplicate_index_id_rejected',index_duplicates)
    def exact_filter():
        v=Validator(root);assert v.run()['status']=='PASS'
        a=assets[r2];b=a['enrichment_bindings'][0]
        source=next(s for s in a['sources'] if s['id']==b['source_id'])
        all_items=json.loads((root/source['path']).read_text())[b['index']]
        expected=[i for i in all_items if i['anchor']['block_id']==a['block_id']]
        result=v.resolve(a,b)
        assert result==expected and isinstance(result,list)
        return {'matched_ids':[x['id'] for x in result],'not_all_items':len(result)<len(all_items)}
    check('index_filter_returns_exact_items_not_boolean',exact_filter)
    def optional_zero():
        v=Validator(root);assert v.run()['status']=='PASS'
        for p,a in assets.items():
            for b in a.get('enrichment_bindings',[]):
                if b['kind']=='INDEX_MATCH' and v.resolve(a,b)==[]:
                    return {'zero_match_is_legal':p,'binding_id':b['binding_id']}
        raise AssertionError('No real zero-match optional binding found')
    check('real_optional_zero_match_is_legal',optional_zero)
    check('A1_absent_enrichment_requires_no_fake_sidecar',lambda:positive())
    def route_sanitization():
        path=source_path(b2,'SYSTEM_CORE')
        overrides=edited_json(path,lambda x:x['logic_index']['circulation-b02'][0].update(answer='SECRET_ANSWER',closure='SECRET_CLOSURE'))
        v=Validator(root,overrides);report=v.run();assert report['status']=='PASS',report['issues']
        payload=v.neutral_payload(assets[b2],'BLOCK_RECALL_FRONT')
        assert 'SECRET' not in json.dumps(payload,ensure_ascii=False)
        return {'route_fields':['id','label'],'added_answer_fields_excluded':True}
    check('added_route_answer_fields_do_not_leak',route_sanitization)
    def source_neutral_rebind():
        a=copy.deepcopy(assets[system]);o=next(o for o in a['objects'] if o['object_id']=='circulation-recall-prompt')
        o['binding']['selector']['value']='/mission';o['binding']['value_type']='string'
        report=validate_repository(root,{system:encoded(a)})
        assert any(i['asset']==system and i['code']=='VISIBILITY' for i in report['issues']),report['issues']
        return {'safe_flag_alone_insufficient':True}
    check('system_prompt_same_type_wrong_binding_rejected',source_neutral_rebind)

    # Exact text selection: exercise with fixtures without touching Current bytes.
    def text_case(text,selector,code='SELECTOR'):
        try: select_text(text,selector)
        except Invalid as e:
            assert e.code==code;return {'rejected':code}
        raise AssertionError('invalid selector was accepted')
    check('anchor_must_not_rescue_from_later_section',lambda:text_case('anchor\n\n# other\n\n```text\nwrong\n```\n',{'type':'STRUCTURE_AFTER_ANCHOR','anchor':'anchor','structure_type':'CODE_BLOCK'}))
    check('duplicate_heading_is_ambiguous',lambda:text_case('# Same\nx\n# Same\ny\n',{'type':'HEADING_EXACT','value':'Same'}))
    check('heading_inside_fence_is_not_heading',lambda:text_case('```text\n# Same\nx\n```\n',{'type':'HEADING_EXACT','value':'Same'}))
    check('plain_id_string_is_not_canonical_marker',lambda:text_case('text id="test"\n',{'type':'MARKER_ID','value':'test'}))
    check('duplicate_anchor_is_ambiguous',lambda:text_case('anchor\n```text\nx\n```\nanchor\n```text\ny\n```',{'type':'STRUCTURE_AFTER_ANCHOR','anchor':'anchor','structure_type':'CODE_BLOCK'}))
    check('table_requires_separator_and_rows',lambda:text_case('anchor\n|a|b|\nnot a table\n',{'type':'STRUCTURE_AFTER_ANCHOR','anchor':'anchor','structure_type':'TABLE'}))
    check('unterminated_code_block_rejected',lambda:text_case('anchor\n```text\nx\n',{'type':'STRUCTURE_AFTER_ANCHOR','anchor':'anchor','structure_type':'CODE_BLOCK'}))
    def pointer_bad(p):
        try:pointer_get({'a':[1,2]},p)
        except Invalid as e:return {'rejected':e.code}
        raise AssertionError('invalid pointer accepted')
    for p in ['/a/-1','/a/01','/a/-','/a/99','/a/~2']:
        check('invalid_json_pointer_'+p,lambda p=p:pointer_bad(p))
    def pointer_valid():
        data={'':'empty-key','a/b':{'~key':['zero']}}
        assert pointer_get(data,'')==data
        assert pointer_get(data,'/')=='empty-key'
        assert pointer_get(data,'/a~1b/~0key/0')=='zero'
        return {'empty_root_and_empty_key_distinct':True}
    check('valid_pointer_root_escapes_and_empty_key',pointer_valid)
    def duplicate_json():
        try:strict_json('{"x":1,"x":2}')
        except Invalid as e:return {'rejected':e.code}
        raise AssertionError('duplicate JSON key accepted')
    check('duplicate_json_keys_rejected',duplicate_json)

    def bad_manifest(fn):
        m=copy.deepcopy(manifest);fn(m)
        result=validate_repository(root,{MANIFEST:encoded(m)})
        assert result['status']=='FAIL' and any(i['code']=='COVERAGE' for i in result['issues']),result['issues']
        return {'rejected':'COVERAGE'}
    check('manifest_duplicate_path_rejected',lambda:bad_manifest(lambda m:m['systems']['circulation']['blocks'].__setitem__(1,m['systems']['circulation']['blocks'][0])))
    check('manifest_missing_block_rejected',lambda:bad_manifest(lambda m:m['systems']['circulation']['blocks'].pop()))
    check('manifest_false_coverage_metadata_rejected',lambda:bad_manifest(lambda m:m['coverage'].update(blocks=999)))
    def unlisted():
        result=validate_repository(root,{PREFIX+'a1-circulation/blocks/extra.projection.json':encoded(assets[b1])})
        assert any(i['code']=='COVERAGE' for i in result['issues']),result['issues']
        return {'rejected':'COVERAGE'}
    check('unlisted_projection_file_rejected',unlisted)
    check('final_baseline_unchanged_after_mutations',positive)
    passed=sum(c['status']=='PASS' for c in cases)
    return {'total':len(cases),'passed':passed,'failed':len(cases)-passed,'cases':cases,
            'mutation_storage':'IN_MEMORY_ONLY','evidence_mode':'EXECUTED + ADVERSARIAL',
            'independence':'SELF','browser_or_medical_acceptance':False}


if __name__=='__main__':
    root=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT
    report=run_suite(root)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    sys.exit(1 if report['failed'] else 0)
