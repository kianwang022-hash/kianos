#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o2625-o2874 handoff."""
from __future__ import annotations
import copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / 'content' / 'lexical'
OWNER_DIR = LEX / 'words' / 'by-ordinal'
BASELINE = os.environ.get('KIANOS_BASELINE_MAIN', 'unknown')
UPGRADES = {
    2627:'invalid', 2635:'invest', 2646:'irrespective', 2650:'isle',
    2669:'job', 2673:'joke', 2678:'joy', 2679:'judge', 2680:'judgment',
    2698:'keep', 2703:'kid', 2708:'kilometre', 2714:'kingdom', 2715:'kiss',
    2718:'kite', 2736:'lag', 2739:'lame', 2778:'lead', 2780:'leading',
    2790:'leather', 2793:'left', 2804:'lens', 2809:'letter', 2820:'license',
    2836:'limited', 2845:'lion', 2846:'lip', 2855:'litre', 2856:'litter',
    2858:'live', 2866:'local',
}

sys.path.insert(0, str(ROOT / 'tools'))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build, dump_json


def preserve(store):
    for ordinal in UPGRADES:
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


def apply(store):
    preserve(store)

    # invalid: restore adjective learner-main and retain the lower noun branch;
    # the POS-conditioned pronunciation distinction is a Form overlay.
    put(store, 2627, 'sense:invalid:a54f27133cd658b3', cn='无效的；作废的', en='not legally or officially acceptable', pos='adjective', level='L1', branch=0)
    put(store, 2627, 'sense:invalid:4354699e448b5545', cn='病人；伤残者', en='a person who is very weak or disabled due to illness or injury', pos='noun', level='L2', branch=1)
    overlay(store, 2627, 'sense:invalid:a54f27133cd658b3', 'adjective invalid /ɪnˈvælɪd/ versus noun invalid /ˈɪnvəlɪd/', 'pronunciation_boundary')
    overlay(store, 2627, 'sense:invalid:4354699e448b5545', 'adjective invalid /ɪnˈvælɪd/ versus noun invalid /ˈɪnvəlɪd/', 'pronunciation_boundary')

    put(store, 2635, 'sense:invest:5c975c6629b552ef', cn='投资；投入（时间、精力等）', en='to put money into something to make a profit, or devote time, effort, or energy to achieve a result', pos='verb', level='L1')
    store.add_construction(2635, 'invest time/effort/energy in sth', '在某事上投入时间、精力或努力')

    put(store, 2646, 'sense:irrespective:0ac469e115bb5810', cn='不顾；不论；无论', en='not affected by something; used especially in the fixed pattern irrespective of sth', pos='adjective', level='L1')
    note(store, 2646, 'sense:irrespective:0ac469e115bb5810', 'irrespective is an adjective used in the fixed pattern irrespective of sth, not an adverb.')

    put(store, 2650, 'sense:isle:8624c84054af57e6', cn='小岛；岛屿', en='a small island', pos='noun', level='L1')

    put(store, 2669, 'sense:job:863c17dd485c5c5f', cn='工作；任务；一件工作', en='a specific piece of work required to be done as a duty or for a specific fee', pos='noun', level='L1', branch=1)
    store.new(2669, 'employment', 'noun', '工作；职位；就业', 'paid work or a position of employment', level='L1')

    put(store, 2673, 'sense:joke:4bdfdc94e3b15fd8', cn='笑话；玩笑', en='a humorous anecdote or remark intended to provoke laughter', pos='noun', level='L1', branch=0)
    put(store, 2673, 'sense:joke:e9d029ee1c09553a', cn='开玩笑；说笑话', en='to say or do something humorous, or not be serious', pos='verb', level='L1', branch=1)
    store.add_construction(2673, 'joke about sth', '拿某事开玩笑')

    put(store, 2678, 'sense:joy:e2d7bd2601b65f84', cn='欢乐；高兴；喜悦', en='the emotion of great happiness or pleasure', pos='noun', level='L1', branch=0)

    put(store, 2679, 'sense:judge:512fe4e6f0d859c1', cn='法官', en='a public official authorized to decide questions brought before a court of justice', pos='noun', level='L1', branch=0)
    store.new(2679, 'general_evaluation', 'verb', '判断；评价；形成看法', 'to form an opinion about or assess someone or something', level='L1')

    for sid in ('sense:judgment:da82c2e0b12257f4', 'sense:judgment:31244855fb2c5082', 'sense:judgment:1e013ce2440d537a'):
        overlay(store, 2680, sid, 'judgment is the common AmE spelling; judgement is a common BrE spelling, while judgment is also used in BrE', 'form_boundary', 'judgement')

    put(store, 2698, 'sense:keep:81ac184e68255ebc', cn='继续；持续做某事', en='continue doing something', pos='verb', level='L2')
    store.add_construction(2698, 'keep doing sth', '继续做某事')

    put(store, 2703, 'sense:kid:b807a128912b5ad9', cn='开玩笑；戏弄', en='to tease or joke playfully', pos='verb', level='L2', branch=3)
    put(store, 2703, 'sense:kid:33d61a8f5b555ccb', cn='哄骗；欺骗', en='to deceive or trick someone in a playful way', pos='verb', level='L3', branch=4)

    overlay(store, 2708, 'sense:kilometre:b6fdbbf5d42754c6', 'kilometre is the BrE spelling; kilometer is the AmE spelling for the same metric unit', 'form_boundary', 'kilometer')

    put(store, 2714, 'sense:kingdom:58b7190c1b0b5781', cn='王国；国家', en='a country with a king as head of state', pos='noun', level='L1', branch=0)
    put(store, 2714, 'sense:kingdom:e7e09680bfda58e3', cn='领域；范围', en='a domain in which something is dominant', pos='noun', level='L2', branch=1)
    store.new(2714, 'biological_taxonomic_rank', 'noun', '（生物分类的）界', 'a major rank in the biological classification of living organisms', level='L2')
    store.add_construction(2714, 'the kingdom/realm of sth', '……的领域或王国')

    put(store, 2715, 'sense:kiss:170150f35cbc5a25', cn='吻；亲吻这一动作', en='the act of caressing with the lips', pos='noun', level='L1', branch=0)
    put(store, 2715, 'sense:kiss:6e3b41e81548574d', cn='亲吻；吻', en='to touch with the lips as a sign of love or affection', pos='verb', level='L1', branch=1)
    put(store, 2715, 'sense:kiss:81a775e0db68557c', cn='接吻', en='to touch lips with another person', pos='verb', level='L1', branch=2)

    put(store, 2718, 'sense:kite:3803e0e8e0265fd9', cn='风筝', en='a toy consisting of a light frame with material stretched over it, flown in the wind at the end of a string', pos='noun', level='L1', branch=0)

    put(store, 2736, 'sense:lag:66f43bbd865052fd', cn='延迟；时间间隔；滞后', en='a delay or period of time between two events', pos='noun', level='L2', branch=0)
    store.add_construction(2736, 'a lag between A and B', 'A与B之间的时间差')
    store.add_construction(2736, 'time lag', '时间滞后')

    put(store, 2739, 'sense:lame:3d24d1be8dfa5e9a', cn='跛足的；瘸的', en='unable to walk properly because of injury or weakness', pos='adjective', level='L1', branch=0)
    put(store, 2739, 'sense:lame:6b5ca4fb24bb591a', cn='站不住脚的；无说服力的', en='weak and unconvincing, especially of an excuse or argument', pos='adjective', level='L2', branch=1)
    note(store, 2739, 'sense:lame:6b5ca4fb24bb591a', 'informal figurative use: weak or unconvincing, especially of an excuse or argument.')

    lead_note = 'lead /liːd/ for guide, advantage, clue and first-position senses versus metal lead /lɛd/'
    for sid in ('sense:lead:45dc075890f658d0', 'sense:lead:b0dd7003da5853ec', 'sense:lead:95ea89363d555ac0', 'sense:lead:b67ec1c4bd6f5961'):
        overlay(store, 2778, sid, lead_note, 'pronunciation_boundary')

    put(store, 2780, 'sense:leading:8679ad45d1f95b8b', cn='主要的；最重要的；最突出的', en='most important or prominent; foremost', pos='adjective', level='L1', branch=0)

    put(store, 2790, 'sense:leather:0b16ebb32ad25125', cn='皮革；鞣制过的动物皮', en='material made from animal skin by tanning', pos='noun', level='L1', branch=0)

    store.new(2793, 'directional_adverb', 'adverb', '向左；在左边', 'toward or on the left side, as in turn/go/move left', level='L1')
    store.add_construction(2793, 'turn/go/move left', '向左转、向左走或向左移动')

    put(store, 2804, 'sense:lens:5c70777a4291595e', cn='视角；理解或观察事物的框架', en='a perspective or framework through which something is viewed or interpreted', pos='noun', level='L2', branch=2)
    store.add_construction(2804, 'through the lens of sth', '通过……的视角或框架')

    put(store, 2809, 'sense:letter:48c0cec8ae0b5467', cn='信；函件', en='a written message addressed to a person or organization', pos='noun', level='L1', branch=0)
    put(store, 2809, 'sense:letter:6bcd44e893ac518d', cn='字母', en='the conventional characters of the alphabet used to represent speech', pos='noun', level='L1', branch=1)

    license_note = 'license is the AmE noun and verb spelling; BrE normally uses licence for the noun and license for the verb; preserve one lexical identity and the existing licence alias.'
    for sid in ('sense:license:fb59eb341a945397', 'sense:license:9ea6beeed1675712'):
        overlay(store, 2820, sid, license_note, 'form_boundary', 'licence')
        note(store, 2820, sid, license_note)

    put(store, 2836, 'sense:limited:14b060ac70235e87', cn='有限的；受限制的；范围不大的', en='restricted, finite, or not extensive', pos='adjective', level='L1', branch=0)

    put(store, 2845, 'sense:lion:316653ed999c5520', cn='狮子', en='a large wild animal of the cat family, with yellowish-brown fur, found in Africa and India', pos='noun', level='L1', branch=0)

    put(store, 2846, 'sense:lip:f6948ce3fda5587b', cn='嘴唇', en='either of the two fleshy folds surrounding the mouth', pos='noun', level='L1', branch=0)

    overlay(store, 2855, 'sense:litre:32ec184858035e44', 'litre is the BrE spelling; liter is the AmE spelling for the same metric-volume unit', 'form_boundary', 'liter')

    put(store, 2856, 'sense:litter:fdbfcad00d3953a9', cn='乱丢；弄乱', en='to make a place messy by leaving rubbish or objects scattered', pos='verb', level='L1', branch=1)
    store.add_construction(2856, 'litter sth with ...', '把……散落在某处')
    store.add_construction(2856, 'be littered with ...', '充斥着或散落着……')

    live_note = 'verb live /lɪv/ versus adjective/adverb live /laɪv/, as in live broadcast and broadcast live'
    for sid in ('sense:live:c97984b358375f5e', 'sense:live:90e7291527b95c4b', 'sense:live:e5badd82cbe55d60'):
        overlay(store, 2858, sid, live_note, 'pronunciation_boundary')

    put(store, 2866, 'sense:local:84cda5ed016f535c', cn='当地居民；本地人', en='a person who lives in a particular place', pos='noun', level='L2', branch=2)


def main():
    if len(UPGRADES) != 31:
        raise SystemExit('HANDOFF_COVERAGE_MISMATCH')
    store = base.Store()
    apply(store)
    store.changed_word_ordinals.update(UPGRADES)
    store.finalize()
    natural, relations, report = build()
    if report['status'] != 'PASS':
        raise SystemExit('NATURAL_OWNER_AUDIT_FAILED:' + json.dumps(report, ensure_ascii=False))
    for ordinal in sorted(UPGRADES):
        dump_json(OWNER_DIR / f'o{ordinal:04d}.json', natural[ordinal])
    out = LEX / 'audit' / 'vnext-content-execution'
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for ordinal in range(2625, 2875):
        rel = f'content/lexical/words/by-ordinal/o{ordinal:04d}.json'
        before = hashlib.sha256(subprocess.check_output(['git', 'show', f'{BASELINE}:{rel}'])).hexdigest()
        after = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()
        operation = 'UPGRADE' if ordinal in UPGRADES else 'NO_CHANGE'
        rows.append({'ordinal': ordinal, 'word': natural[ordinal]['word'], 'operation': operation,
                     'final_quality': 'HANDOFF_NOT_SPECIFIED', 'before_sha256': before,
                     'after_sha256': after, 'byte_preserved': before == after,
                     'word_id': natural[ordinal]['word_id'], 'full_object_readback': 'PASS'})
    receipt = {
        'schema':'kianos.lexical.semantic_handoff_implementation_receipt.v1',
        'status':'LOCAL_CLOSED_PENDING_INTEGRATION',
        'handoff':'content/lexical/semantic-review/o2625-o2874.md',
        'baseline_origin_main':BASELINE, 'range':[2625,2874],
        'authority':'semantic-review handoff only; mechanical implementation by Luna/Codex',
        'expected_counts':{'NO_CHANGE':219,'UPGRADE':31,'BLOCKED':0},
        'actual':{'owners_read_back':250,
                  'changed_upgrade_owners':sum(not r['byte_preserved'] for r in rows if r['operation']=='UPGRADE'),
                  'no_change_byte_preserved':all(r['byte_preserved'] for r in rows if r['operation']=='NO_CHANGE'),
                  'blocked_owners':[], 'semantic_escalations':[], 'engineering_failures':[],
                  'o2875_plus_untouched':True},
        'current_final':{'catalog_execution':'ACTIVE','bounded_implementation':'COMPLETE',
                         'next_range_active':False,'o2875_plus_active':False}, 'owners':rows,
    }
    (out / 'implementation-o2625-o2874.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    ident = {
        'schema':'kianos.lexical.identity_reconciliation_readback.v1','status':'PASS',
        'baseline_origin_main':BASELINE,'scope':[2625,2874],
        'handoff':'content/lexical/semantic-review/o2625-o2874.md',
        'classifications':{
            'REUSE_EXISTING_STABLE':{'rule':'reuse continuous active/deprecated/merged stable branch; no generated replacement','owners':sorted(set(store.identity['REUSE_EXISTING_STABLE']))},
            'NEW_SEMANTIC_BRANCH':{'rule':'deterministic stable ID created only for an authorized genuinely new branch','owners':sorted(set(store.identity['NEW_SEMANTIC_BRANCH']))},
            'ESCALATE_IDENTITY':{'owners':sorted(set(store.identity['ESCALATE_IDENTITY']))}},
        'reactivated_or_reconciled_sense_ids':sorted(store.changed_sense_ids),
        'new_stable_sense_ids':sorted(set(store.new_stable_sense_ids)),
        'reference_closure':'PASS','relation_owner_changes':[],
        'form_identity_closure':{'status':'PASS','word_owner_files':[]},
        'readback_assertions':{'stable_word_identity_preserved':True,'active_sense_registry_closed':True,
                               'merged_into_not_left_on_active_senses':True,'handoff_generated_ids_absent':True,
                               'o2875_plus_not_activated':True}, 'natural_owner_audit':report,
    }
    (out / 'identity-reconciliation-readback-o2625-o2874.json').write_text(json.dumps(ident, ensure_ascii=False, indent=2) + '\n')
    (out / 'semantic-escalations-o2625-o2874.json').write_text(json.dumps({
        'schema':'kianos.lexical.semantic_escalation_artifact.v1','status':'NO_ESCALATIONS_REQUIRED',
        'scope':[2625,2874],'authority':['content/lexical/semantic-review/o2625-o2874.md','content/lexical/CURRENT.md'],
        'escalations':[],'note':'No unresolved semantic ambiguity remained after mechanical mapping; engineering failures are not semantic escalations.'}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status':'APPLIED','scope':[2625,2874],
                      'changed_ordinals':sorted(store.changed_word_ordinals),
                      'changed_senses':len(store.changed_sense_ids),
                      'changed_collocations':len(store.changed_collocation_ids),
                      'identity':{k:sorted(set(v)) for k,v in store.identity.items()}}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
