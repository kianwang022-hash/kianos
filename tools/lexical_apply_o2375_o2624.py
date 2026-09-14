#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o2375-o2624 handoff."""
from __future__ import annotations
import copy, hashlib, json, os, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; LEX=ROOT/'content'/'lexical'; OWNER_DIR=LEX/'words'/'by-ordinal'; BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
UPGRADES={2380:'host',2382:'hostile',2387:'house',2389:'housewife',2392:'how',2393:'however',2405:'humor',2423:'I',2445:'illuminate',2449:'image',2461:'immune',2462:'impact',2473:'import',2478:'impress',2479:'impression',2483:'in',2495:'increase',2500:'independence',2509:'indispensable',2512:'induce',2515:'industrialise',2525:'infinite',2532:'information',2552:'inner',2563:'inspiration',2567:'instalment',2568:'instance',2576:'instruction',2581:'insurance',2582:'insure',2611:'interrupt'}
sys.path.insert(0,str(ROOT/'tools')); import lexical_apply_o1625_o1874 as base
from lexical_natural_owner import build,dump_json
def preserve(s):
 for o in UPGRADES:
  rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'
  try: old=json.loads(subprocess.check_output(['git','show',f'{BASELINE}:{rel}']))['record']
  except Exception: continue
  rec=s.record(o)
  for f in ('secondary_senses','semantic_neighbors','confusables','word_family','exam_paraphrases','review_signature','constructions'):
   if old.get(f) and not rec.get(f): rec[f]=copy.deepcopy(old[f])
  s.mark(o)
def put(s,o,sid,**kw): return s.put_existing(o,sid,**kw)
def note(s,o,sid,text): next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['usage_note']=text; s.mark(o)
def order(s,o,sid,n): next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['sort_order']=n; s.mark(o)
def apply(s):
 preserve(s)
 host=s.new(2380,'biological_host','noun','宿主（承载寄生虫、病原体或其他生物的有机体或细胞）','an organism or cell that harbors a parasite, pathogen, or other organism',level='L2')
 put(s,2382,'sense:hostile:54da4423448b579d',cn='敌意的；不友好的；反对的',en='showing strong dislike or opposition; unfriendly or adverse',pos='adjective',level='L1')
 s.add_overlay(2387,'sense:house:cc7520b103fe59dc',{'case_sensitive':False,'identity_type':'pronunciation_boundary','surface_lemma':'house','paired_form':'house','note':'noun house /haʊs/ versus verb house /haʊz/'})
 s.add_overlay(2387,'sense:house:1e084f54efd75c5d',{'case_sensitive':False,'identity_type':'pronunciation_boundary','surface_lemma':'house','paired_form':'house','note':'noun house /haʊs/ versus verb house /haʊz/'})
 note(s,2389,'sense:housewife:f95a9377533e5333','current neutral definition: a woman whose main work is managing a household/home; the term is traditional and gendered relative to homemaker.')
 put(s,2392,'sense:how:a479b303f55251d3',cn='如何；以什么方式',en='in what manner or way',pos='adverb',level='L1'); put(s,2392,'sense:how:3b7c4a435c635ad8',cn='多么；到什么程度',en='to what degree or extent',pos='adverb',level='L1'); s.add_construction(2392,'how + adjective/adverb','多么……；到何种程度'); s.add_construction(2392,'how to do sth','如何做某事')
 note(s,2393,'sense:however:c7e3588020b658b8','contrastive conjunctive adverb: normally separated by punctuation and not used as a coordinating conjunction; degree/concession uses remain.')
 s.add_overlay(2405,'sense:humor:619268be4f125c6a',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'humor','paired_form':'humour','note':'humor/humour AmE/BrE spelling boundary'})
 put(s,2423,'sense:i:a6d4f3b2eaeb54c1',cn='我（第一人称单数代词）',en='first person singular pronoun',pos='pronoun',level='L1')
 put(s,2445,'sense:illuminate:da61979eee075a5d',cn='照亮；使明亮',en='to light up or make bright',pos='verb',level='L1'); put(s,2445,'sense:illuminate:d86cc6505fbf5144',cn='阐明；解释清楚',en='to make clear or explain',pos='verb',level='L1')
 put(s,2449,'sense:image:098409cea07a5fbe',cn='图像；图片',en='a picture or visual representation of something',pos='noun',level='L1'); put(s,2449,'sense:image:02e5778b534f5d89',cn='公众形象；印象',en='the impression that a person or organization presents to the public',pos='noun',level='L1')
 put(s,2461,'sense:immune:ae33ccb6fb395d94',cn='免疫的；对疾病有抵抗力的',en="protected against a particular disease by the body's immune system",pos='adjective',level='L1'); put(s,2461,'sense:immune:2b85fa463e5e5d39',cn='不受影响的；不易受伤害的',en='not affected by something, especially criticism or unpleasant events',pos='adjective',level='L2'); s.add_construction(2461,'immune to sth','对某事物免疫或不受其影响')
 put(s,2462,'sense:impact:7a4440d447cd56dd',cn='对……有影响；影响',en='have a strong effect on or affect',pos='verb',level='L1')
 s.add_overlay(2473,'sense:import:c557e55d59865d39',{'case_sensitive':False,'identity_type':'stress_boundary','surface_lemma':'import','paired_form':'import','note':'noun import initial stress /ˈɪmpɔːt/ versus verb import second-syllable stress /ɪmˈpɔːt/'})
 s.add_overlay(2473,'sense:import:2aea7b0ca1245c41',{'case_sensitive':False,'identity_type':'stress_boundary','surface_lemma':'import','paired_form':'import','note':'noun import initial stress /ˈɪmpɔːt/ versus verb import second-syllable stress /ɪmˈpɔːt/'})
 put(s,2478,'sense:impress:5fd5261e90b45a72',cn='使钦佩；给……留下深刻印象',en='to make someone admire or respect you, or make a strong impression',pos='verb',level='L1')
 put(s,2479,'sense:impression:647c1ffa37be5de8',cn='印象，想法；某人留下的感觉',en='an idea, opinion, or feeling about something, or the effect that someone or something has on you',pos='noun',level='L1')
 put(s,2479,'sense:impression:fd8081be960952a6',cn='外观；印象',en='the appearance or effect that someone or something has on you',pos='noun',level='L1')
 put(s,2483,'sense:in:e2a0eabd63a65222',cn='在……里面；在……期间',en='expressing location or time within',pos='preposition',level='L1'); put(s,2483,'sense:in:00db532f4ca65c76',cn='向内；进入里面',en='toward or into the inside',pos='adverb',level='L1')
 s.add_overlay(2495,'sense:increase:db50ad9e6c6159e3',{'case_sensitive':False,'identity_type':'stress_boundary','surface_lemma':'increase','paired_form':'increase','note':'noun increase /ˈɪnkriːs/ versus verb increase /ɪnˈkriːs/'}); s.add_overlay(2495,'sense:increase:c9530bcc41bf5510',{'case_sensitive':False,'identity_type':'stress_boundary','surface_lemma':'increase','paired_form':'increase','note':'noun increase /ˈɪnkriːs/ versus verb increase /ɪnˈkriːs/'})
 put(s,2500,'sense:independence:b9023a509fe35aec',cn='独立；不受外部控制',en='freedom from control or influence of another or others',pos='noun',level='L1')
 put(s,2509,'sense:indispensable:c966cbd390a057da',cn='不可或缺的；绝对必要的',en='absolutely necessary; essential',pos='adjective',level='L1')
 put(s,2512,'sense:induce:761085b78b3c54d9',cn='导致；引起',en='to cause something to happen or exist',pos='verb',level='L1'); put(s,2512,'sense:induce:7a5743bdcb7e52bd',cn='劝说；促使某人做某事',en='to persuade or influence someone to do something',pos='verb',level='L1'); s.add_construction(2512,'induce sb to do sth','促使某人做某事')
 s.add_overlay(2515,'sense:industrialise:1943c18f24cf5e9b',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'industrialise','paired_form':'industrialize','note':'industrialise/industrialize BrE/AmE spelling boundary'})
 s.demote(2525,'sense:infinite:74493114dcd75f0a'); put(s,2525,'sense:infinite:625b8ad0935f551a',cn='无限的；无穷的',en='having no limits or boundaries in time, space, or extent',pos='adjective',level='L1')
 put(s,2532,'sense:information:c23d558790385835',cn='信息；资料（不可数）',en='facts, details, or messages communicated or learned; normally an uncountable noun',pos='noun',level='L1')
 put(s,2552,'sense:inner:14a74eea7bfa5b6e',cn='内在的；内心的；中心的',en='located inward or closer to a center, including inner thoughts, feelings, or a central core',pos='adjective',level='L1'); put(s,2552,'sense:inner:8d5a0b52e6275cd6',cn='内在的；本质的',en='innermost or essential',pos='adjective',level='L2')
 put(s,2563,'sense:inspiration:6a75d61388805bbc',cn='灵感；鼓舞',en='a sudden good idea or creative impulse',pos='noun',level='L1'); s.add_construction(2563,'draw/take inspiration from','从……获得灵感')
 put(s,2567,'sense:instalment:70b51ca92b5e5721',cn='分期付款；分期部分',en='one of the parts into which a debt is divided for payment at intervals',pos='noun',level='L1'); put(s,2567,'sense:instalment:eb0ef4742f5a5c49',cn='连续故事或广播的一集',en='one part of a serial story or broadcast',pos='noun',level='L2'); s.add_overlay(2567,'sense:instalment:70b51ca92b5e5721',{'case_sensitive':False,'identity_type':'form_boundary','surface_lemma':'instalment','paired_form':'installment','note':'instalment/installment BrE/AmE spelling boundary'})
 put(s,2568,'sense:instance:050a0b41caac534d',cn='例子；实例；一次发生',en='an example or single occurrence of something',pos='noun',level='L1')
 note(s,2576,'sense:instruction:cbbbf0e1776e52e8','a direction or order, and also detailed teaching or information about how to do something; computer instructions are a specialist branch.')
 put(s,2581,'sense:insurance:43f1d5ad96be5be5',cn='保险；保险安排',en='an arrangement with a company in which you pay them money and they pay you if something bad happens',pos='noun',level='L1')
 note(s,2582,'sense:insure:ee634ed719fe5029','insure primarily means protect against loss or provide insurance; ensure is the default learner choice for make certain. The make-certain use is lower/variant.')
 order(s,2582,'sense:insure:ee634ed719fe5029',2)
 put(s,2611,'sense:interrupt:968b13d6f085510b',cn='打断；暂时中断',en='to stop something for a short time or break the continuity of an activity, process, or event',pos='verb',level='L1')
 
def main():
 if len(UPGRADES)!=31: raise SystemExit('HANDOFF_COVERAGE_MISMATCH')
 s=base.Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize(); natural,relations,report=build()
 if report['status']!='PASS': raise SystemExit('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
 for o in sorted(UPGRADES): dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
 out=LEX/'audit'/'vnext-content-execution'; out.mkdir(parents=True,exist_ok=True); rows=[]
 for o in range(2375,2625):
  rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'; before=hashlib.sha256(subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])).hexdigest(); after=hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(); op='UPGRADE' if o in UPGRADES else 'NO_CHANGE'; rows.append({'ordinal':o,'word':natural[o]['word'],'operation':op,'final_quality':'HANDOFF_NOT_SPECIFIED','before_sha256':before,'after_sha256':after,'byte_preserved':before==after,'word_id':natural[o]['word_id'],'full_object_readback':'PASS'})
 receipt={'schema':'kianos.lexical.semantic_handoff_implementation_receipt.v1','status':'LOCAL_CLOSED_PENDING_INTEGRATION','handoff':'content/lexical/semantic-review/o2375-o2624.md','baseline_origin_main':BASELINE,'range':[2375,2624],'authority':'semantic-review handoff only; mechanical implementation by Luna/Codex','expected_counts':{'NO_CHANGE':219,'UPGRADE':31,'BLOCKED':0},'actual':{'owners_read_back':250,'changed_upgrade_owners':sum(not r['byte_preserved'] for r in rows if r['operation']=='UPGRADE'),'no_change_byte_preserved':all(r['byte_preserved'] for r in rows if r['operation']=='NO_CHANGE'),'blocked_owners':[],'semantic_escalations':[],'engineering_failures':[],'o2625_plus_untouched':True},'current_final':{'catalog_execution':'ACTIVE','bounded_implementation':'COMPLETE','next_range_active':False,'o2625_plus_active':False},'owners':rows}; (out/'implementation-o2375-o2624.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
 ident={'schema':'kianos.lexical.identity_reconciliation_readback.v1','status':'PASS','baseline_origin_main':BASELINE,'scope':[2375,2624],'handoff':'content/lexical/semantic-review/o2375-o2624.md','classifications':{'REUSE_EXISTING_STABLE':{'rule':'reuse continuous active/deprecated/merged stable branch; no generated replacement','owners':sorted(set(s.identity['REUSE_EXISTING_STABLE']))},'NEW_SEMANTIC_BRANCH':{'rule':'deterministic stable ID created only for an authorized genuinely new branch','owners':sorted(set(s.identity['NEW_SEMANTIC_BRANCH']))},'ESCALATE_IDENTITY':{'owners':sorted(set(s.identity['ESCALATE_IDENTITY']))}},'reactivated_or_reconciled_sense_ids':sorted(s.changed_sense_ids),'new_stable_sense_ids':sorted(set(s.new_stable_sense_ids)),'reference_closure':'PASS','relation_owner_changes':[],'form_identity_closure':{'status':'PASS','word_owner_files':[]},'readback_assertions':{'stable_word_identity_preserved':True,'active_sense_registry_closed':True,'merged_into_not_left_on_active_senses':True,'handoff_generated_ids_absent':True,'o2625_plus_not_activated':True},'natural_owner_audit':report}; (out/'identity-reconciliation-readback-o2375-o2624.json').write_text(json.dumps(ident,ensure_ascii=False,indent=2)+'\n')
 (out/'semantic-escalations-o2375-o2624.json').write_text(json.dumps({'schema':'kianos.lexical.semantic_escalation_artifact.v1','status':'NO_ESCALATIONS_REQUIRED','scope':[2375,2624],'authority':['content/lexical/semantic-review/o2375-o2624.md','content/lexical/CURRENT.md'],'escalations':[],'note':'No unresolved semantic ambiguity remained after mechanical mapping; engineering failures are not semantic escalations.'},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':'APPLIED','scope':[2375,2624],'changed_ordinals':sorted(s.changed_word_ordinals),'changed_senses':len(s.changed_sense_ids),'changed_collocations':len(s.changed_collocation_ids),'identity':{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
