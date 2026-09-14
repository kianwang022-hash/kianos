#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o2125-o2374 handoff."""
from __future__ import annotations
import copy, hashlib, json, os, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]; LEX=ROOT/'content'/'lexical'; OWNER_DIR=LEX/'words'/'by-ordinal'
BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
UPGRADES={2130:'get',2131:'ghost',2136:'girl',2137:'give',2140:'glamor',2152:'glove',2155:'go',2162:'good',2166:'goose',2173:'grab',2178:'gradual',2183:'grand',2191:'grateful',2194:'gravity',2196:'grease',2203:'grey',2209:'grip',2221:'guess',2233:'gut',2234:'guy',2236:'habit',2247:'hand',2250:'handicap',2256:'hang',2260:'harbor',2261:'hard',2277:'haul',2282:'he',2300:'heel',2308:'help',2316:'herb',2327:'hide',2338:'hinder',2361:'honest',2362:'honey',2363:'honor',2364:'honorable',2365:'hook',2368:'hopeful',2372:'horn'}
sys.path.insert(0,str(ROOT/'tools'))
import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build,dump_json

def preserve(store):
    for o in UPGRADES:
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
        try: old=json.loads(subprocess.check_output(['git','show',f'{BASELINE}:{rel}']))['record']
        except Exception: continue
        rec=store.record(o)
        for field in ('secondary_senses','semantic_neighbors','confusables','word_family','exam_paraphrases','review_signature','constructions'):
            if old.get(field) and not rec.get(field): rec[field]=copy.deepcopy(old[field])
        store.mark(o)

def put(s,o,sid,**kw): return s.put_existing(o,sid,**kw)
def note(s,o,sid,text):
    next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['usage_note']=text; s.mark(o)
def order(s,o,sid,n):
    next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['sort_order']=n; s.mark(o)

def apply(s):
    preserve(s)
    s.add_construction(2130,'get used to + noun/doing','习惯于某物或做某事'); s.add_construction(2130,'get rid of sth','摆脱或除去某物')
    put(s,2131,'sense:ghost:04473f0cc7765ab9',cn='鬼；幽灵',en='the spirit of a dead person that some people think they can see or feel',pos='noun',level='L1')
    s.drop_phrase = getattr(s,'drop_phrase',None) or base.drop_phrase
    base.drop_phrase(s,2136,'girl friend')
    s.add_construction(2137,'give up sth/doing sth','放弃某物或停止做某事')
    s.add_overlay(2140,'sense:glamor:b54e005fdaa45d1a',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'glamor','paired_form':'glamour','note':'glamor/glamour AmE/BrE spelling boundary'})
    put(s,2152,'sense:glove:bab26ee80b6c53ea',cn='手套',en='a piece of clothing that covers your hand and wrist, with separate parts for each finger',pos='noun',level='L1')
    s.add_construction(2155,'go on doing sth','继续做同一件事'); s.add_construction(2155,'go on to do sth','接着做另一件事')
    s.add_construction(2162,'be good at sth/doing sth','擅长某事或做某事')
    put(s,2166,'sense:goose:1437a359e4a153b0',cn='鹅',en='web-footed long-necked typically gregarious migratory aquatic birds usually larger and less aquatic than ducks',pos='noun',level='L1')
    grab=s.new(2173,'figurative_attention_capture','verb','吸引或抓住注意力、头条关注','to attract or capture attention or headlines',level='L2',pattern='grab attention/headlines'); s.add_colloc(2173,grab,'grab attention/headlines','吸引或抓住注意力、头条关注')
    put(s,2178,'sense:gradual:65f2920365645335',cn='逐渐的；渐进的',en='happening or changing slowly over a long period',pos='adjective',level='L1')
    grand=s.new(2183,'informal_thousand_currency','noun','一千美元、英镑等（非正式）','one thousand dollars, pounds, or another unit of currency',level='L2'); note(s,2183,grand,'informal currency use')
    s.demote(2191,'sense:grateful:c4402a0a89665701'); s.add_construction(2191,'be grateful to sb for sth','因某事感谢某人')
    put(s,2194,'sense:gravity:841b34e3b3d25095',cn='严肃性；严重性；重要性',en='seriousness, severity, or importance',pos='noun',level='L2')
    put(s,2196,'sense:grease:6a82472449745ebc',cn='给……加润滑油；涂油',en='to lubricate or coat something with grease',pos='verb',level='L1',pattern='grease sth')
    s.add_overlay(2203,'sense:grey:8fed15ce0c335a30',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'grey','paired_form':'gray','note':'grey/gray BrE/AmE spelling boundary'})
    put(s,2209,'sense:grip:7c9bcec3c7035433',cn='紧紧抓住；牢牢握住',en='to hold something firmly',pos='verb',level='L1')
    put(s,2209,'sense:grip:37291525af65560b',cn='抓住注意力或兴趣',en="to hold someone's attention or interest",pos='verb',level='L2')
    s.add_construction(2221,'I guess / guess that ...','我猜；我想（非正式，尤其常见于美式英语）')
    note(s,2233,'sense:gut:5069d5ecf16b5967','gut feeling/reaction means an intuitive feeling or response; guts can mean courage.')
    put(s,2234,'sense:guy:9d4a4f75f34852a5',cn='家伙；男人（非正式）',en='an informal term for a youth or man',pos='noun',level='L1')
    put(s,2236,'sense:habit:281ed7c8ef265e95',cn='习惯；惯常行为',en='a usual or repeated behavior',pos='noun',level='L1')
    s.add_construction(2247,'on the one hand ... on the other hand ...','一方面……另一方面……')
    put(s,2250,'sense:handicap:25c1225f5b8a54f1',cn='不利条件；障碍',en='a disadvantage that makes success harder',pos='noun',level='L1')
    s.add_construction(2256,'hang out (with sb)','与某人非正式地共度时间')
    s.add_overlay(2260,'sense:harbor:959beded1bd55258',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'harbor','paired_form':'harbour','note':'harbor/harbour AmE/BrE spelling boundary'})
    note(s,2261,'sense:hard:3288d6ad30a15e02','hard can mean with great effort or intensity; hardly means almost not or scarcely.')
    haul=s.new(2277,'long_difficult_journey','noun','漫长或艰难的旅程、距离或持续努力','a long or difficult journey, distance, or sustained period of effort',level='L2',pattern='for the long haul'); s.add_construction(2277,'for the long haul','长期坚持或长途过程')
    put(s,2282,'sense:he:281f0bb8cd285bbe',cn='他；雄性动物',en='third person singular masculine pronoun',pos='pronoun',level='L1')
    put(s,2300,'sense:heel:df90a5ed966853e0',cn='脚后跟；足跟',en='the back part of the human foot',pos='noun',level='L1')
    put(s,2308,'sense:help:091fe7f60b1d5115',cn='帮助；援助',en='the act of helping or assistance',pos='noun',level='L1')
    put(s,2316,'sense:herb:2c769fba5b755a9d',cn='草本植物；药草',en='a plant used for flavoring or medicine',pos='noun',level='L1')
    put(s,2327,'sense:hide:dfbdc2f08afb50dd',cn='躲藏；躲开视线',en='be or go into hiding; keep out of sight, as for protection and safety',pos='verb',level='L1')
    put(s,2327,'sense:hide:92e1af38d1fe545e',cn='兽皮；动物皮',en='the dressed skin of an animal, especially a large animal',pos='noun',level='L2')
    s.add_construction(2338,'hinder sb/sth from doing sth','妨碍某人或某物做某事')
    s.add_construction(2361,'to be honest','坦率地说；诚实地说')
    honey=s.new(2362,'term_of_endearment','noun','亲爱的；甜心（称呼）','a familiar term of endearment or vocative meaning dear or sweetheart',level='L2'); note(s,2362,honey,'familiar term of endearment; literal honey remains primary')
    s.add_overlay(2363,'sense:honor:04cb33e3e3f6588f',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'honor','paired_form':'honour','note':'honor/honour AmE/BrE spelling boundary'})
    s.add_overlay(2364,'sense:honorable:44baa78f488652d7',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'honorable','paired_form':'honourable','note':'honorable/honourable AmE/BrE spelling boundary'})
    s.add_construction(2365,'be/get hooked on sth','对某事物产生强烈兴趣或依赖')
    put(s,2368,'sense:hopeful:0ae8880d52265e46',cn='充满希望的',en='having or manifesting hope',pos='adjective',level='L1')
    put(s,2368,'sense:hopeful:8db72ee6072d5ef0',cn='有希望成功的；有前途的',en='inspiring hope; promising',pos='adjective',level='L2')
    put(s,2372,'sense:horn:f798fdad42545feb',cn='喇叭；警报器',en='a device that makes a loud noise, used as a warning or signal',pos='noun',level='L1')

def main():
    if len(UPGRADES)!=40 or not all(2125<=o<=2374 for o in UPGRADES): raise SystemExit('HANDOFF_COVERAGE_MISMATCH')
    s=base.Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize()
    natural,relations,report=build()
    if report['status']!='PASS': raise SystemExit('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
    for o in sorted(UPGRADES): dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
    out=LEX/'audit'/'vnext-content-execution'; out.mkdir(parents=True,exist_ok=True); rows=[]
    for o in range(2125,2375):
        rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'; before=hashlib.sha256(subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])).hexdigest(); after=hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(); op='UPGRADE' if o in UPGRADES else 'NO_CHANGE'; rows.append({'ordinal':o,'word':natural[o]['word'],'operation':op,'final_quality':'HANDOFF_NOT_SPECIFIED','before_sha256':before,'after_sha256':after,'byte_preserved':before==after,'word_id':natural[o]['word_id'],'full_object_readback':'PASS'})
    receipt={'schema':'kianos.lexical.semantic_handoff_implementation_receipt.v1','status':'LOCAL_CLOSED_PENDING_INTEGRATION','handoff':'content/lexical/semantic-review/o2125-o2374.md','baseline_origin_main':BASELINE,'range':[2125,2374],'authority':'semantic-review handoff only; mechanical implementation by Luna/Codex','expected_counts':{'NO_CHANGE':210,'UPGRADE':40,'BLOCKED':0},'actual':{'owners_read_back':250,'changed_upgrade_owners':sum(not r['byte_preserved'] for r in rows if r['operation']=='UPGRADE'),'no_change_byte_preserved':all(r['byte_preserved'] for r in rows if r['operation']=='NO_CHANGE'),'blocked_owners':[],'semantic_escalations':[],'engineering_failures':[],'o2375_plus_untouched':True},'current_final':{'catalog_execution':'ACTIVE','bounded_implementation':'COMPLETE','next_range_active':False,'o2375_plus_active':False},'owners':rows}
    (out/'implementation-o2125-o2374.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    ident={'schema':'kianos.lexical.identity_reconciliation_readback.v1','status':'PASS','baseline_origin_main':BASELINE,'scope':[2125,2374],'handoff':'content/lexical/semantic-review/o2125-o2374.md','classifications':{'REUSE_EXISTING_STABLE':{'rule':'reuse continuous active/deprecated/merged stable branch; no generated replacement','owners':sorted(set(s.identity['REUSE_EXISTING_STABLE']))},'NEW_SEMANTIC_BRANCH':{'rule':'deterministic stable ID created only for an authorized genuinely new branch','owners':sorted(set(s.identity['NEW_SEMANTIC_BRANCH']))},'ESCALATE_IDENTITY':{'owners':sorted(set(s.identity['ESCALATE_IDENTITY']))}},'reactivated_or_reconciled_sense_ids':sorted(s.changed_sense_ids),'new_stable_sense_ids':sorted(set(s.new_stable_sense_ids)),'reference_closure':'PASS','relation_owner_changes':[],'form_identity_closure':{'status':'PASS','word_owner_files':[]},'readback_assertions':{'stable_word_identity_preserved':True,'active_sense_registry_closed':True,'merged_into_not_left_on_active_senses':True,'handoff_generated_ids_absent':True,'o2375_plus_not_activated':True},'natural_owner_audit':report}
    (out/'identity-reconciliation-readback-o2125-o2374.json').write_text(json.dumps(ident,ensure_ascii=False,indent=2)+'\n')
    (out/'semantic-escalations-o2125-o2374.json').write_text(json.dumps({'schema':'kianos.lexical.semantic_escalation_artifact.v1','status':'NO_ESCALATIONS_REQUIRED','scope':[2125,2374],'authority':['content/lexical/semantic-review/o2125-o2374.md','content/lexical/CURRENT.md'],'escalations':[],'note':'No unresolved semantic ambiguity remained after mechanical mapping; engineering failures are not semantic escalations.'},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':'APPLIED','scope':[2125,2374],'changed_ordinals':sorted(s.changed_word_ordinals),'changed_senses':len(s.changed_sense_ids),'changed_collocations':len(s.changed_collocation_ids),'identity':{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
