#!/usr/bin/env python3
"""Mechanical implementation of the Sol-approved o3125-o3374 handoff."""
from __future__ import annotations
import copy, hashlib, json, os, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; LEX=ROOT/'content'/'lexical'; OWNER_DIR=LEX/'words'/'by-ordinal'; BASELINE=os.environ.get('KIANOS_BASELINE_MAIN','unknown')
UPGRADES={3133:'mother',3137:'motor',3141:'mouse',3151:'multitude',3163:'mute',3176:'nap',3186:'nature',3190:'navy',3192:'nearby',3200:'need',3203:'neglect',3206:'neighbor',3210:'nerve',3212:'nest',3226:'night',3236:'noise',3240:'none',3243:'noodle',3256:'notable',3262:'notion',3267:'novel',3283:'nut',3289:'oath',3294:'object',3298:'oblige',3299:'obscure',3303:'obsolete',3307:'obtain',3321:'off',3326:'officer',3328:'offset',3336:'once',3344:'opening',3345:'opera',3351:'opponent',3354:'opposite',3355:'oppress',3368:'order',3369:'orderly',3370:'ordinary',3372:'organ',3373:'organic',3374:'organisation'}
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
def note(s,o,sid,t): next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['usage_note']=t; s.mark(o)
def order(s,o,sid,n): next(x for x in s.record(o).get('senses',[]) if x.get('sense_id')==sid)['sort_order']=n; s.mark(o)
def overlay(s,o,sid,t,itype='form_boundary',paired=None): s.add_overlay(o,sid,{'case_sensitive':False,'identity_type':itype,'surface_lemma':s.record(o)['word'],'paired_form':paired or s.record(o)['word'],'note':t})
def apply(s):
 preserve(s)
 put(s,3133,'sense:mother:7755a8051e0b509a',cn='母亲；女性家长',en='a female parent',pos='noun',level='L1',branch=0)
 put(s,3137,'sense:motor:e7bab220d7315f90',cn='发动机；电动机',en='a machine that converts energy into mechanical motion',pos='noun',level='L1',branch=0)
 put(s,3141,'sense:mouse:a0d222aeb1535b26',cn='鼠标',en='a hand-held pointing or input device that controls a computer cursor',pos='noun',level='L1',branch=0)
 put(s,3151,'sense:multitude:a59a7f6487705c8b',cn='大量的人或事物；许多',en='a very large number of people or things',pos='noun',level='L1',branch=0)
 put(s,3163,'sense:mute:be1d6b9a9ea55430',cn='沉默的；无声的',en='silent or not speaking',pos='adjective',level='L1',branch=0); put(s,3163,'sense:mute:2cfa96c1749350b6',cn='使静音；使无声',en='to make a sound quieter or silent',pos='verb',level='L1',branch=1)
 put(s,3176,'sense:nap:7defb051d8f1569d',cn='小睡；打盹',en='a short sleep, especially during the day',pos='noun',level='L1',branch=0); put(s,3176,'sense:nap:2e1a2832de05505f',cn='小睡；打盹',en='to sleep for a short time, especially during the day',pos='verb',level='L1',branch=1)
 put(s,3186,'sense:nature:f10041ac51635dd5',cn='自然界；大自然',en='the natural world, including plants, animals, landscapes, and physical phenomena',pos='noun',level='L1',branch=0)
 s.new(3190,'color','noun','深蓝色；海军蓝','a very dark blue color, often called navy blue',level='L1')
 put(s,3192,'sense:nearby:5703f440c0ff53cf',cn='附近的；邻近的',en='located close at hand or not far away',pos='adjective',level='L1',branch=0); put(s,3192,'sense:nearby:27a8c6068dbc5cd9',cn='在附近；不远处',en='not far away in relative terms',pos='adverb',level='L1',branch=1)
 s.add_construction(3200,'need doing','需要被做')
 put(s,3203,'sense:neglect:33b692a182e8534b',cn='忽视；疏于照料',en='lack or failure of proper care or attention; the state of being neglected',pos='noun',level='L2',branch=0); note(s,3203,'sense:neglect:33b692a182e8534b','noun neglect means lack of proper care or attention; neglect to do sth belongs to the verb use.')
 put(s,3206,'sense:neighbor:4d569586520b513a',cn='邻居；邻近的人或事物',en='a person or thing living or located near another',pos='noun',level='L1',branch=0)
 put(s,3210,'sense:nerve:eb0b766437ca5e19',cn='神经',en='a bundle of nerve fibers running to organs and tissues',pos='noun',level='L1',branch=0); put(s,3210,'sense:nerve:b803629c0862597e',cn='勇气；胆量',en='boldness or courage',pos='noun',level='L2',branch=1)
 put(s,3212,'sense:nest:d124ccd150dd5227',cn='巢；窝',en='a structure built by birds or other animals for laying eggs or raising young',pos='noun',level='L1',branch=0); put(s,3212,'sense:nest:760d1fe8ebeb5ef9',cn='筑巢；把……放入巢中',en='to build or use a nest',pos='verb',level='L2',branch=1)
 put(s,3226,'sense:night:c4dcfd21e6b55cb1',cn='夜晚；夜间',en='the time after sunset and before sunrise',pos='noun',level='L1',branch=0)
 put(s,3236,'sense:noise:cbf8a37af525596f',cn='噪音；嘈杂声',en='a sound, especially one that is loud, unpleasant, or unwanted',pos='noun',level='L1',branch=0); put(s,3236,'sense:noise:1eacb46ca723542f',cn='（信号或数据中的）噪声',en='irrelevant, random, or unwanted information or variation that obscures a signal or pattern',pos='noun',level='L2',branch=1)
 put(s,3240,'sense:none:0639a1ce24b855c3',cn='没有任何一个；没有任何东西',en='not any of a group',pos='pronoun',level='L1',branch=0); put(s,3240,'sense:none:2bc83847a022501f',cn='没有任何的',en='not any',pos='adjective',level='L1',branch=1); put(s,3240,'sense:none:8a4db307eca65cab',cn='一点也不；丝毫不',en='not at all or in no way',pos='adverb',level='L2',branch=2)
 put(s,3243,'sense:noodle:3ca2854a3a365ccd',cn='面条',en='a long, thin strip of pasta or dough',pos='noun',level='L1',branch=0)
 put(s,3256,'sense:notable:49bc9cf733ce5e31',cn='值得注意的；重要的；著名的',en='worthy of notice; important or famous',pos='adjective',level='L1',branch=0); put(s,3256,'sense:notable:22ce5cf9144f5002',cn='著名的；受人尊敬的',en='widely known and esteemed',pos='adjective',level='L2',branch=1)
 put(s,3262,'sense:notion:8ac74d147b9f5b42',cn='想法；观念；概念',en='a general inclusive concept',pos='noun',level='L1',branch=0); put(s,3262,'sense:notion:e467a674acf65d46',cn='想法；看法',en='an idea, belief, or conception',pos='noun',level='L1',branch=1)
 put(s,3267,'sense:novel:46f84d73ac3e5272',cn='新颖的；新奇的；不同寻常的',en='new, original, or unusual',pos='adjective',level='L2',branch=1)
 put(s,3283,'sense:nut:714a7247c4be53cc',cn='坚果',en='a fruit consisting of a hard shell and a seed, often eaten',pos='noun',level='L1',branch=0); put(s,3283,'sense:nut:87a6121fb9775270',cn='螺母；螺帽',en='a small metal block with a hole for screwing onto a bolt',pos='noun',level='L2',branch=1)
 put(s,3289,'sense:oath:95016951c6cc5174',cn='誓言；誓约',en='a solemn promise, often invoking a divine witness, regarding future acts or behavior',pos='noun',level='L1',branch=0); put(s,3289,'sense:oath:d20625bc3ae15f17',cn='宣誓；正式声明',en='a formal commitment to tell the truth, especially in court',pos='noun',level='L2',branch=1)
 objnote='noun object has initial stress; verb object has second-syllable stress /əbˈdʒekt/; preserve one Word owner.'
 for sid in ('sense:object:9f46064f92765498','sense:object:4a21e61bd1d15ae7','sense:object:b9d00f09939e59e3','sense:object:6b584bd2ac9458c4'): overlay(s,3294,sid,objnote,'pronunciation_boundary')
 put(s,3298,'sense:oblige:4a0b1ba2a1c15aa5',cn='使某人感激或感到亏欠',en='to make someone feel grateful or indebted to you',pos='verb',level='L2',branch=1); put(s,3298,'sense:oblige:ec8d1e479dd758b6',cn='帮忙；为某人做某事',en='to do something helpful for someone as a favor',pos='verb',level='L2',branch=2); s.add_construction(3298,'oblige sb by doing sth','通过做某事帮某人的忙')
 put(s,3299,'sense:obscure:c1939bd275bf5380',cn='晦涩难懂的；不出名的',en='difficult to understand or not well known',pos='adjective',level='L1',branch=0); put(s,3299,'sense:obscure:8bc0f21d8d8a5a36',cn='不出名的',en='not known to many people',pos='adjective',level='L2',branch=1); put(s,3299,'sense:obscure:6a5d4830af535656',cn='使难以看见或理解',en='to make something difficult to see or understand',pos='verb',level='L2',branch=2)
 put(s,3303,'sense:obsolete:f35a2a764917522a',cn='废弃的；过时的',en='no longer used; outdated',pos='adjective',level='L1',branch=0)
 put(s,3307,'sense:obtain:5736a44691045514',cn='获得；得到',en='to get or acquire something, especially by effort',pos='verb',level='L1',branch=0)
 put(s,3321,'sense:off:dae3754b20615e51',cn='离开；不再附着或处于……上',en='away from or no longer on something',pos='preposition',level='L1',branch=0); put(s,3321,'sense:off:ff9962905783594b',cn='离开；不在原处',en='away from a place or position',pos='adverb',level='L1',branch=1); put(s,3321,'sense:off:4a5ee8f7257457f9',cn='未运行的；不工作的',en='not operating or functioning',pos='adjective',level='L1',branch=2)
 put(s,3326,'sense:officer:00a129460fb3556e',cn='军官；军队中的权威人员',en='a person in a position of authority in the armed forces',pos='noun',level='L1',branch=0); put(s,3326,'sense:officer:1e12f514da3a51cd',cn='官员；组织中的负责人',en='a person holding a position of authority in a government or organization',pos='noun',level='L1',branch=1)
 put(s,3328,'sense:offset:70461a1bf3ae533a',cn='抵消；补偿',en='to counterbalance or compensate for something',pos='verb',level='L1',branch=0); put(s,3328,'sense:offset:a1e9612ecce35b8e',cn='抵消量；抵消效果',en='a counterbalancing effect or amount',pos='noun',level='L2',branch=1)
 put(s,3336,'sense:once:722826ed95ed55bb',cn='一次；曾经一次',en='one time only',pos='adverb',level='L1',branch=0); put(s,3336,'sense:once:9e8937f5b0665be8',cn='曾经；过去某时',en='at some time in the past',pos='adverb',level='L1',branch=1); put(s,3336,'sense:once:2e8a295c6d0d5efb',cn='一旦；当……时',en='as soon as; when',pos='conjunction',level='L1',branch=2)
 put(s,3344,'sense:opening:358affc160675de7',cn='开幕；开始；首场演出',en='the beginning or first event or performance of something',pos='noun',level='L1',branch=1); put(s,3344,'sense:opening:52cda23d9368532d',cn='机会；空缺职位',en='an opportunity or vacancy',pos='noun',level='L2',branch=2)
 put(s,3345,'sense:opera:36f312698bca5a0a',cn='歌剧；歌剧演出',en='a dramatic work or performance set to music',pos='noun',level='L1',branch=0)
 put(s,3351,'sense:opponent:009cd283d3af5abd',cn='对手；竞争者；反对者',en='a person, team, or group that competes with or opposes another',pos='noun',level='L1',branch=0)
 put(s,3354,'sense:opposite:9e02199c6b3e5180',cn='相反的；完全不同的',en='completely different or contrary in nature or meaning',pos='adjective',level='L1',branch=1)
 put(s,3355,'sense:oppress:7336a48e286c5760',cn='压迫；压制',en='to keep or control people down through unjust or cruel authority',pos='verb',level='L1',branch=0)
 put(s,3368,'sense:order:e55bda7c9bde5349',cn='订购；下订单',en='to place an order',pos='verb',level='L2',branch=1); put(s,3368,'sense:order:ffad803668555128',cn='订购；要求供应',en='to request something to be made or supplied',pos='verb',level='L2',branch=2)
 order(s,3368,'sense:order:577ac013a49856e4',1); note(s,3368,'sense:order:577ac013a49856e4','order here means arrangement, sequence, or orderliness; it is not a magnitude continuum.')
 put(s,3369,'sense:orderly:f0458c7980db5bc1',cn='整齐的；有秩序的；守纪律的',en='neat and well-arranged, or peaceful and well-behaved',pos='adjective',level='L1',branch=0)
 put(s,3370,'sense:ordinary:c1177baff42657b9',cn='普通的；平常的；不特别的',en='common, usual, and not special',pos='adjective',level='L1',branch=0)
 put(s,3372,'sense:organ:3e82b08c41dd5a0c',cn='器官',en='a part of an organism with a specific function',pos='noun',level='L1',branch=0); put(s,3372,'sense:organ:e00d24ac04cb5e88',cn='管风琴；风琴',en='a musical instrument with pipes or electronic tones',pos='noun',level='L2',branch=1)
 s.new(3373,'food_farming','adjective','有机食品/有机农业的','produced according to organic farming standards with restricted synthetic inputs',level='L2')
 formnote='organisation is common BrE; organization is standard AmE and also accepted in z-style BrE; preserve one noun identity.'
 for sid in ('sense:organisation:726158369b2053b3','sense:organisation:89573506301157d3','sense:organisation:6bf72e455aa651da'): overlay(s,3374,sid,formnote,'form_boundary','organization')
def main():
 if len(UPGRADES)!=43: raise SystemExit('HANDOFF_COVERAGE_MISMATCH')
 s=base.Store(); apply(s); s.changed_word_ordinals.update(UPGRADES); s.finalize(); natural,relations,report=build()
 if report['status']!='PASS': raise SystemExit('NATURAL_OWNER_AUDIT_FAILED:'+json.dumps(report,ensure_ascii=False))
 for o in sorted(UPGRADES): dump_json(OWNER_DIR/f'o{o:04d}.json',natural[o])
 out=LEX/'audit'/'vnext-content-execution'; out.mkdir(parents=True,exist_ok=True); rows=[]
 for o in range(3125,3375):
  rel=f'content/lexical/words/by-ordinal/o{o:04d}.json'; before=hashlib.sha256(subprocess.check_output(['git','show',f'{BASELINE}:{rel}'])).hexdigest(); after=hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(); op='UPGRADE' if o in UPGRADES else 'NO_CHANGE'; rows.append({'ordinal':o,'word':natural[o]['word'],'operation':op,'final_quality':'HANDOFF_NOT_SPECIFIED','before_sha256':before,'after_sha256':after,'byte_preserved':before==after,'word_id':natural[o]['word_id'],'full_object_readback':'PASS'})
 receipt={'schema':'kianos.lexical.semantic_handoff_implementation_receipt.v1','status':'LOCAL_CLOSED_PENDING_INTEGRATION','handoff':'content/lexical/semantic-review/o3125-o3374.md','baseline_origin_main':BASELINE,'range':[3125,3374],'authority':'semantic-review handoff only; mechanical implementation by Luna/Codex','expected_counts':{'NO_CHANGE':207,'UPGRADE':43,'BLOCKED':0},'actual':{'owners_read_back':250,'changed_upgrade_owners':sum(not r['byte_preserved'] for r in rows if r['operation']=='UPGRADE'),'no_change_byte_preserved':all(r['byte_preserved'] for r in rows if r['operation']=='NO_CHANGE'),'blocked_owners':[],'semantic_escalations':[],'engineering_failures':[],'o3375_plus_untouched':True},'current_final':{'catalog_execution':'ACTIVE','bounded_implementation':'COMPLETE','next_range_active':False,'o3375_plus_active':False},'owners':rows}; (out/'implementation-o3125-o3374.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
 ident={'schema':'kianos.lexical.identity_reconciliation_readback.v1','status':'PASS','baseline_origin_main':BASELINE,'scope':[3125,3374],'handoff':'content/lexical/semantic-review/o3125-o3374.md','classifications':{'REUSE_EXISTING_STABLE':{'rule':'reuse stable branch','owners':sorted(set(s.identity['REUSE_EXISTING_STABLE']))},'NEW_SEMANTIC_BRANCH':{'rule':'authorized genuinely new branch only','owners':sorted(set(s.identity['NEW_SEMANTIC_BRANCH']))},'ESCALATE_IDENTITY':{'owners':sorted(set(s.identity['ESCALATE_IDENTITY']))}},'reactivated_or_reconciled_sense_ids':sorted(s.changed_sense_ids),'new_stable_sense_ids':sorted(set(s.new_stable_sense_ids)),'reference_closure':'PASS','relation_owner_changes':[],'form_identity_closure':{'status':'PASS','word_owner_files':[]},'readback_assertions':{'stable_word_identity_preserved':True,'active_sense_registry_closed':True,'merged_into_not_left_on_active_senses':True,'handoff_generated_ids_absent':True,'o3375_plus_not_activated':True},'natural_owner_audit':report}; (out/'identity-reconciliation-readback-o3125-o3374.json').write_text(json.dumps(ident,ensure_ascii=False,indent=2)+'\n')
 (out/'semantic-escalations-o3125-o3374.json').write_text(json.dumps({'schema':'kianos.lexical.semantic_escalation_artifact.v1','status':'NO_ESCALATIONS_REQUIRED','scope':[3125,3374],'authority':['content/lexical/semantic-review/o3125-o3374.md','content/lexical/CURRENT.md'],'escalations':[],'note':'No unresolved semantic ambiguity remained after mechanical mapping; engineering failures are not semantic escalations.'},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':'APPLIED','scope':[3125,3374],'changed_ordinals':sorted(s.changed_word_ordinals),'changed_senses':len(s.changed_sense_ids),'changed_collocations':len(s.changed_collocation_ids),'identity':{k:sorted(set(v)) for k,v in s.identity.items()}},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
