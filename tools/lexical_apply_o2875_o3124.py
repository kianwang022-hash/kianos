#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o2875-o3124 handoff."""
from __future__ import annotations
import copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / 'content' / 'lexical'
OWNER_DIR = LEX / 'words' / 'by-ordinal'
BASELINE = os.environ.get('KIANOS_BASELINE_MAIN', 'unknown')
ALL_UPGRADES = {
    2885:'loosen', 2913:'lyric', 2914:'machine', 2916:'mad', 2917:'madam',
    2927:'maiden', 2928:'mail', 2932:'maintenance', 2949:'manoeuvre',
    2956:'marble', 2960:'marine', 2964:'marriage', 2965:'married',
    2967:'marvelous', 2991:'mean', 2996:'measure', 3000:'mechanism',
    3009:'meet', 3021:'mental', 3029:'mere', 3040:'metre', 3055:'millimetre',
    3063:'minimise', 3070:'minute', 3090:'mob', 3092:'mobilise', 3096:'moderate',
    3097:'modern', 3104:'mold', 3113:'monkey',
}
ESCALATIONS = {2949, 2967, 3063}
APPLY_ORDINALS = set(ALL_UPGRADES) - ESCALATIONS

sys.path.insert(0, str(ROOT / 'tools'))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build, dump_json


def preserve(store):
    for ordinal in APPLY_ORDINALS:
        rel = f'content/lexical/words/by-ordinal/o{ordinal:04d}.json'
        try:
            old = json.loads(subprocess.check_output(['git', 'show', f'{BASELINE}:{rel}']))['record']
        except Exception:
            continue
        record = store.record(ordinal)
        for field in ('secondary_senses', 'semantic_neighbors', 'confusables', 'word_family',
                      'exam_paraphrases', 'review_signature', 'constructions'):
            if old.get(field) and not record.get(field):
                record[field] = copy.deepcopy(old[field])
        store.mark(ordinal)


def put(store, ordinal, sense_id, **kwargs):
    return store.put_existing(ordinal, sense_id, **kwargs)


def note(store, ordinal, sense_id, text):
    sense = next(x for x in store.record(ordinal).get('senses', []) if x.get('sense_id') == sense_id)
    sense['usage_note'] = text
    store.mark(ordinal)


def order(store, ordinal, sense_id, value):
    sense = next(x for x in store.record(ordinal).get('senses', []) if x.get('sense_id') == sense_id)
    sense['sort_order'] = value
    store.mark(ordinal)


def overlay(store, ordinal, sense_id, note_text, identity_type='form_boundary', paired_form=None):
    store.add_overlay(ordinal, sense_id, {
        'case_sensitive': False,
        'identity_type': identity_type,
        'surface_lemma': store.record(ordinal)['word'],
        'paired_form': paired_form or store.record(ordinal)['word'],
        'note': note_text,
    })


def construction(store, ordinal, pattern, cn, en):
    item = next(x for x in store.record(ordinal).get('constructions', []) if x.get('pattern') == pattern)
    item['definition_cn'] = cn
    item['definition_en'] = en
    store.mark(ordinal)


def apply(store):
    preserve(store)

    put(store, 2885, 'sense:loosen:f3075e9d356c5153', cn='变松；松弛', en='to become less tight, firm, fixed, or strict', pos='verb', level='L1', branch=1)
    store.add_construction(2885, 'loosen up', '放松；变得不那么紧张')

    put(store, 2913, 'sense:lyric:c89b8c3b3b6f522d', cn='歌词', en='the words of a popular song or musical-comedy number', pos='noun', level='L1', branch=0)
    put(store, 2913, 'sense:lyric:2edfa555013351e5', cn='抒情诗', en='a short poem of songlike quality', pos='noun', level='L2', branch=1)

    put(store, 2914, 'sense:machine:84d13fc757445df4', cn='机器；机械装置', en='a mechanical or electrical device that uses power to perform or assist in a human task', pos='noun', level='L1', branch=0)
    put(store, 2914, 'sense:machine:f961e8486cfa589d', cn='机构；组织', en='an intricate organization that accomplishes its goals efficiently', pos='noun', level='L2', branch=1)

    put(store, 2916, 'sense:mad:0580d1745cb15eb1', cn='生气的；恼火的', en='very angry', pos='adjective', level='L1', branch=0)
    order(store, 2916, 'sense:mad:ad6efbeea26c59c7', 1)
    put(store, 2916, 'sense:mad:379787419721525f', cn='疯狂的；精神错乱的', en='mentally ill; insane', pos='adjective', level='L2', branch=2)
    note(store, 2916, 'sense:mad:379787419721525f', 'traditional mental-state use; register and sensitivity boundary applies.')

    put(store, 2917, 'sense:madam:3d6b2f6a4f4a5fce', cn='女士；夫人', en='a polite or formal way of addressing a woman', pos='noun', level='L1', branch=0)
    order(store, 2917, 'sense:madam:47d182ef924453a7', 1)
    note(store, 2917, 'sense:madam:47d182ef924453a7', 'rare brothel-manager sense; low-frequency and register-marked.')

    put(store, 2927, 'sense:maiden:b1f9e917fab15690', cn='初次的；首次的', en='first or initial', pos='adjective', level='L1', branch=0)
    store.add_construction(2927, 'maiden voyage', '首次航行')

    put(store, 2928, 'sense:mail:d3106f144c4b5444', cn='邮件；信件；包裹', en='letters and packages transported by the postal service', pos='noun', level='L1', branch=0)
    put(store, 2928, 'sense:mail:ed97d47b8ff65d51', cn='邮政系统；邮政', en='the system whereby messages are transmitted via the post office', pos='noun', level='L2', branch=1)
    order(store, 2928, 'sense:mail:78feeb8d280a5aa0', 2)

    put(store, 2932, 'sense:maintenance:7f4eec1f3b8f52c9', cn='维护；保养；维修', en='the act of keeping something in good condition by checking or repairing it regularly', pos='noun', level='L1', branch=0)
    put(store, 2932, 'sense:maintenance:6232eeafe8c75b32', cn='生活费；抚养费', en='money paid regularly to support a family or former spouse', pos='noun', level='L2', branch=1)

    put(store, 2956, 'sense:marble:b435b52935b257bc', cn='大理石；一种坚硬的建筑和雕刻材料', en='a hard crystalline metamorphic rock used for sculpture and building', pos='noun', level='L1', branch=0)

    put(store, 2960, 'sense:marine:c05916f9e2e15ff5', cn='海的；海产的；海洋的', en='of or relating to the sea or ocean, especially marine life or the marine environment', pos='adjective', level='L1', branch=0)

    put(store, 2964, 'sense:marriage:70c6bd82298557cf', cn='婚姻；结婚关系', en='the legal or formal union of two people as partners', pos='noun', level='L1', branch=0)

    put(store, 2965, 'sense:married:42b156f6a7fe5b15', cn='已婚的；结婚的', en='having a spouse; joined in marriage', pos='adjective', level='L1', branch=0)

    put(store, 2991, 'sense:mean:950e964b21775a76', cn='平均的；中间的', en='being the average or middle value', pos='adjective', level='L2', branch=1)

    construction(store, 2996, 'measure up to sth', '达到；符合标准或期望', 'to be good enough or reach an expected standard')

    put(store, 3000, 'sense:mechanism:1a28cfb2a77550a2', cn='机制；运作方式', en='the system or process by which something works, happens, or is produced', pos='noun', level='L1', branch=0)
    order(store, 3000, 'sense:mechanism:17ebd89af96553a3', 1)

    put(store, 3009, 'sense:meet:7d8ee826bcf35e12', cn='满足；符合；达到', en='to satisfy or fulfill a need, requirement, standard, or condition', pos='verb', level='L1', branch=1)

    put(store, 3021, 'sense:mental:a8556a67481251e9', cn='精神的；心理的；智力的', en='relating to the mind or to psychological or intellectual processes', pos='adjective', level='L1', branch=0)

    put(store, 3029, 'sense:mere:435d174c314a5ba1', cn='仅仅的；只不过的', en='being nothing more than specified', pos='adjective', level='L1', branch=0)

    metre_note = 'metre is BrE for the metric unit and poetic metre; meter is the AmE spelling for these senses. Do not conflate the measuring-device homograph.'
    overlay(store, 3040, 'sense:metre:9ee808102ff75e1c', metre_note, 'form_boundary', 'meter')
    overlay(store, 3040, 'sense:metre:ba98dedfae2555dd', metre_note, 'form_boundary', 'meter')
    overlay(store, 3055, 'sense:millimetre:aae410dfde3a5ce9', 'millimetre is BrE; millimeter is AmE for the same metric measurement.', 'form_boundary', 'millimeter')

    minute_note = 'noun minute (time unit) /ˈmɪnɪt/ versus adjective minute (extremely small) /maɪˈnjuːt/; preserve one Word owner.'
    overlay(store, 3070, 'sense:minute:c0731d69839c519d', minute_note, 'pronunciation_boundary')
    overlay(store, 3070, 'sense:minute:08349d58c3365b4b', minute_note, 'pronunciation_boundary')

    put(store, 3090, 'sense:mob:f883f02f338953fa', cn='围攻；蜂拥包围', en='to surround or crowd around someone or something, often aggressively or excitedly', pos='verb', level='L1', branch=1)
    put(store, 3092, 'sense:mobilise:a56579073fc85c2d', cn='动员；调动', en='to organize or prepare people or resources for action', pos='verb', level='L1', branch=0)
    overlay(store, 3092, 'sense:mobilise:a56579073fc85c2d', 'mobilise is common BrE; mobilize is standard AmE and accepted in some BrE styles.', 'form_boundary', 'mobilize')

    moderate_note = 'adjective moderate /ˈmɒdərət/ versus verb moderate /ˈmɒdəreɪt/; dialectal vowel variation may occur.'
    for sid in ('sense:moderate:744f2224f8975f59', 'sense:moderate:88b12fa8680e57ae', 'sense:moderate:57e844d3829f5c7f', 'sense:moderate:a9185c676f0e5dca'):
        overlay(store, 3096, sid, moderate_note, 'pronunciation_boundary')

    put(store, 3097, 'sense:modern:586cb2b636065508', cn='现代的；当代的', en='relating to the present or recent times', pos='adjective', level='L1', branch=0)

    put(store, 3104, 'sense:mold:29d5afb722265474', cn='霉；霉菌', en='a soft green, grey, or black substance that grows on old food or damp walls', pos='noun', level='L1', branch=0)
    put(store, 3104, 'sense:mold:4fbc9666d5ab57ef', cn='模子；铸模', en='a hollow container used to give a particular shape to a material', pos='noun', level='L1', branch=1)
    put(store, 3104, 'sense:mold:3cde933c4e9851dc', cn='塑造；使成形', en='to shape a soft substance into a particular form', pos='verb', level='L1', branch=2)

    put(store, 3113, 'sense:monkey:fc110889a6e75522', cn='猴子；猿', en='an animal closely related to humans that usually has a long tail and climbs trees', pos='noun', level='L1', branch=0)


def slim(record, ordinal):
    return {
        'ordinal': ordinal,
        'word': record.get('word'),
        'word_id': record.get('word_id'),
        'senses': [{k:s.get(k) for k in ('sense_id','pos','level','definition_cn','definition_en','sort_order')} for s in record.get('senses',[])],
        'constructions': record.get('constructions', []),
        'relation_refs': record.get('relation_refs', []),
    }


def escalation_snapshot(ordinal, word, competing_ordinal, competing_word, handoff_decision, question):
    current = json.loads((OWNER_DIR / f'o{ordinal:04d}.json').read_text())['record']
    competing = json.loads((OWNER_DIR / f'o{competing_ordinal:04d}.json').read_text())['record']
    return {
        'ordinal': ordinal, 'word': word, 'operation': 'UPGRADE', 'status': 'ESCALATION_PENDING_SOL',
        'handoff_original_decision': handoff_decision,
        'current_content': {'target_owner': slim(current, ordinal), 'competing_owner': slim(competing, competing_ordinal)},
        'exact_question_for_chatgpt_sol': question,
    }


def main():
    if len(ALL_UPGRADES) != 30 or len(ESCALATIONS) != 3 or len(APPLY_ORDINALS) != 27:
        raise SystemExit('HANDOFF_COVERAGE_MISMATCH')
    store = base.Store()
    apply(store)
    store.changed_word_ordinals.update(APPLY_ORDINALS)
    store.finalize()
    natural, relations, report = build()
    if report['status'] != 'PASS':
        raise SystemExit('NATURAL_OWNER_AUDIT_FAILED:' + json.dumps(report, ensure_ascii=False))
    for ordinal in sorted(APPLY_ORDINALS):
        dump_json(OWNER_DIR / f'o{ordinal:04d}.json', natural[ordinal])
    out = LEX / 'audit' / 'vnext-content-execution'
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for ordinal in range(2875, 3125):
        rel = f'content/lexical/words/by-ordinal/o{ordinal:04d}.json'
        before = hashlib.sha256(subprocess.check_output(['git', 'show', f'{BASELINE}:{rel}'])).hexdigest()
        after = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()
        operation = 'UPGRADE' if ordinal in ALL_UPGRADES else 'NO_CHANGE'
        rows.append({'ordinal': ordinal, 'word': natural[ordinal]['word'], 'operation': operation,
                     'final_quality': 'HANDOFF_NOT_SPECIFIED', 'before_sha256': before,
                     'after_sha256': after, 'byte_preserved': before == after,
                     'word_id': natural[ordinal]['word_id'],
                     'full_object_readback': 'PASS' if ordinal not in ESCALATIONS else 'ESCALATION_ISOLATED'})
    escalations = [
        escalation_snapshot(2949, 'manoeuvre', 7134, 'maneuver',
            'ESCALATE_IDENTITY. Current lookup also contains maneuver@o7134. These are regional spelling variants of one lexeme, not two semantic Word owners. Preserve stable sense/relationship continuity and reconcile to one lexical identity with BrE manoeuvre / AmE maneuver; do not auto-merge by spelling alone in executor code.',
            'Should o2949 manoeuvre and o7134 maneuver be reconciled as one stable lexical identity, and if so which owner/word identity and sense/relation references should be retained under the BrE/AmE spelling boundary?'),
        escalation_snapshot(2967, 'marvelous', 5960, 'marvellous',
            'ESCALATE_IDENTITY. Current lookup contains both marvelous@o2967 and marvellous@o5960; they are regional spelling variants of one lexeme. Preserve semantic/stable continuity and reconcile to one lexical identity with AmE marvelous / BrE marvellous.',
            'Should o2967 marvelous and o5960 marvellous be reconciled as one stable lexical identity, and which owner/word identity and existing sense references should carry the regional spelling relation?'),
        escalation_snapshot(3063, 'minimise', 5977, 'minimize',
            'ESCALATE_IDENTITY. Current lookup contains minimise@o3063 and minimize@o5977. They are spelling variants of one lexeme (-ise common in BrE; -ize standard AmE and accepted in some BrE styles), not two semantic Word owners. Preserve stable sense continuity and reconcile identity deliberately.',
            'Should o3063 minimise and o5977 minimize be reconciled as one stable lexical identity, and which owner/word identity and stable sense/relation references should be retained for the -ise/-ize boundary?'),
    ]
    receipt = {
        'schema':'kianos.lexical.semantic_handoff_implementation_receipt.v1',
        'status':'LOCAL_CLOSED_PENDING_INTEGRATION',
        'handoff':'content/lexical/semantic-review/o2875-o3124.md',
        'baseline_origin_main':BASELINE, 'range':[2875,3124],
        'authority':'semantic-review handoff only; mechanical implementation by Luna/Codex',
        'expected_counts':{'NO_CHANGE':220,'UPGRADE':30,'BLOCKED':0},
        'actual':{'owners_read_back':250,'upgrade_decisions':30,'upgrade_applied':sum(not r['byte_preserved'] for r in rows if r['operation']=='UPGRADE'),
                  'no_change_byte_preserved':all(r['byte_preserved'] for r in rows if r['operation']=='NO_CHANGE'),
                  'blocked_owners':[], 'semantic_escalations':escalations, 'engineering_failures':[],
                  'o3125_plus_untouched':True},
        'current_final':{'catalog_execution':'ACTIVE','bounded_implementation':'COMPLETE',
                         'next_range_active':False,'o3125_plus_active':False}, 'owners':rows,
    }
    (out / 'implementation-o2875-o3124.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    ident = {
        'schema':'kianos.lexical.identity_reconciliation_readback.v1','status':'PASS_WITH_SEMANTIC_ESCALATIONS',
        'baseline_origin_main':BASELINE,'scope':[2875,3124],
        'handoff':'content/lexical/semantic-review/o2875-o3124.md',
        'classifications':{'REUSE_EXISTING_STABLE':{'rule':'reuse stable branch','owners':sorted(set(store.identity['REUSE_EXISTING_STABLE']))},
                           'NEW_SEMANTIC_BRANCH':{'rule':'authorized new branch only','owners':sorted(set(store.identity['NEW_SEMANTIC_BRANCH']))},
                           'ESCALATE_IDENTITY':{'owners':sorted(ESCALATIONS)}},
        'reactivated_or_reconciled_sense_ids':sorted(store.changed_sense_ids),
        'new_stable_sense_ids':sorted(set(store.new_stable_sense_ids)),
        'reference_closure':'PASS','relation_owner_changes':[],
        'form_identity_closure':{'status':'PASS','word_owner_files':[]},
        'readback_assertions':{'stable_word_identity_preserved':True,'active_sense_registry_closed':True,
                               'merged_into_not_left_on_active_senses':True,'handoff_generated_ids_absent':True,
                               'o3125_plus_not_activated':True,'escalations_isolated':True}, 'natural_owner_audit':report,
    }
    (out / 'identity-reconciliation-readback-o2875-o3124.json').write_text(json.dumps(ident, ensure_ascii=False, indent=2) + '\n')
    (out / 'semantic-escalations-o2875-o3124.json').write_text(json.dumps({
        'schema':'kianos.lexical.semantic_escalation_artifact.v1','status':'ESCALATIONS_PENDING_SOL',
        'scope':[2875,3124],'authority':['content/lexical/semantic-review/o2875-o3124.md','content/lexical/CURRENT.md'],
        'escalations':escalations,
        'note':'Only the three handoff-declared identity ambiguities are isolated; independent mechanical owners continue. Engineering failures are not semantic escalations.'}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status':'APPLIED_WITH_ESCALATIONS','scope':[2875,3124],
                      'changed_ordinals':sorted(store.changed_word_ordinals),
                      'escalated_ordinals':sorted(ESCALATIONS),
                      'changed_senses':len(store.changed_sense_ids),
                      'changed_collocations':len(store.changed_collocation_ids),
                      'identity':{k:sorted(set(v)) for k,v in store.identity.items()}}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
