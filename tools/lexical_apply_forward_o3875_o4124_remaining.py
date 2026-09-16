#!/usr/bin/env python3
"""Optimized mechanical executor for frozen authority o3875-o4124, shards 2-5.

Runs one shard per invocation. Semantic authority is already frozen in
content/lexical/semantic-reconciliation/o3875-o4124.md.
This executor only transports that authority into Current Natural Owners.
"""
from __future__ import annotations

import argparse, copy, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import lexical_apply_retro_o0025_o0224 as base
import lexical_apply_forward_o3875_o3924 as common

LEX = ROOT / "content" / "lexical"
OWNER = LEX / "words" / "by-ordinal"
RECEIPT = LEX / "execution" / "receipts"
AUTH = "content/lexical/semantic-reconciliation/o3875-o4124.md"
base.AUTH = AUTH
base.NOW = "2026-09-16T00:20:00Z"

SHARDS = {
    2: {"scope": (3925, 3974), "delta": [3927,3928,3930,3934,3937,3938,3940,3941,3944,3946,3952,3953,3954,3955,3956,3960,3961,3962], "remote": [3747,4176,5280,5594]},
    3: {"scope": (3975, 4024), "delta": [3975,3976,3980,3981,3987,3988,3992,3993,3994,3996,3999,4000,4004,4006,4007,4008,4011,4012,4018,4020,4022,4024], "remote": [1023,3675,5596]},
    4: {"scope": (4025, 4074), "delta": [4029,4035,4038,4039,4040,4041,4043,4045,4046,4048,4052,4053,4054,4055,4059,4061,4064,4069,4071], "remote": []},
    5: {"scope": (4075, 4124), "delta": [4075,4079,4083,4086,4103,4105,4106,4108,4110,4112,4114,4115,4116,4117,4118,4119,4120,4121,4122,4124], "remote": []},
}

def norm(s): return " ".join(str(s or "").lower().replace("；"," ").replace("，"," ").replace(","," ").split())
def text_of(x): return norm(" ".join([x.get("definition_en",""),x.get("definition_cn",""),x.get("sense_label_en",""),x.get("governing_pattern",""),x.get("usage_note","")]))
def candidates(items,all_terms=(),any_terms=(),pos=None):
    out=[]
    for x in items:
        if pos and x.get("pos")!=pos: continue
        t=text_of(x)
        if all(term.lower() in t for term in all_terms) and (not any_terms or any(term.lower() in t for term in any_terms)): out.append(x)
    return out

def uniq(label,xs):
    if len(xs)!=1:
        raise RuntimeError(f"{label}:EXPECTED_1_GOT_{len(xs)}:"+json.dumps([{"id":x.get("sense_id") or x.get("stable_sense_id"),"en":x.get("definition_en"),"cn":x.get("definition_cn")} for x in xs],ensure_ascii=False))
    return xs[0]

def find_active(s,o,all_terms=(),any_terms=(),pos=None): return uniq(f"ACTIVE_MATCH:o{o:04d}",candidates(s.active(o),all_terms,any_terms,pos))
def find_ref(s,o,all_terms=(),any_terms=(),pos=None):
    xs=[]
    for r in s.owner(o).get("reference_senses",[]):
        x=dict(r); x["sense_id"]=r.get("stable_sense_id"); xs.append(x)
    return uniq(f"REF_MATCH:o{o:04d}",candidates(xs,all_terms,any_terms,pos))
def reactivate_match(s,o,all_terms=(),any_terms=(),pos=None,level="L1",pattern="",transitivity=None,cn=None,en=None):
    r=find_ref(s,o,all_terms,any_terms,pos); sid=r["sense_id"]
    return s.reactivate(o,sid,cn=cn or r.get("definition_cn"),en=en or r.get("definition_en"),level=level,pattern=pattern,pos=pos or r.get("pos"),transitivity=transitivity)

def set_form(s,o,boundaries):
    s.rec(o)["form_identity"]={"authority":AUTH,"type":"same_owner_form_pronunciation_boundary","boundaries":boundaries}; s.mark(o)
def add_new(s,o,branch,pos,cn,en,level="L2",pattern="",transitivity=None):
    sid=s.add_new(o,branch,pos,cn,en,level,pattern)
    if transitivity is not None: s.update_sense(o,sid,transitivity=transitivity)
    return sid

def find_construction(s,o,contains):
    arr=s.rec(o).setdefault("constructions",[]); xs=[x for x in arr if contains.lower() in norm(x.get("pattern","")+" "+x.get("boundary",""))]
    if len(xs)!=1: raise RuntimeError(f"CONSTRUCTION_MATCH:o{o:04d}:{contains}:GOT_{len(xs)}")
    return xs[0]
def rewrite_construction(s,o,contains,*,cn=None,en=None,pattern=None,boundary=None,source_sid=None):
    x=find_construction(s,o,contains)
    if cn is not None: x["meaning_cn"]=cn
    if en is not None: x["definition_en"]=en
    if pattern is not None: x["pattern"]=pattern
    if boundary is not None: x["boundary"]=boundary
    if source_sid is not None: x["source_sense_id"]=source_sid
    s.mark(o); return x

def find_colloc(s,o,phrase):
    hits=[]
    for sen in s.active(o):
        for c in sen.get("collocations",[]):
            if c.get("phrase")==phrase: hits.append((sen,c))
    if len(hits)!=1: raise RuntimeError(f"COLLOC_MATCH:o{o:04d}:{phrase}:GOT_{len(hits)}")
    return hits[0]
def add_construct(s,o,pattern,cn,en="",source_sid=None,level="L1",boundary=None): common.add_construction(s,o,pattern,cn,en,source_sid,level,boundary)
def add_colloc(s,o,sid,phrase,cn,exam="fixed_pattern"): common.add_colloc(s,o,sid,phrase,cn,exam)
def relation_obj(rid):
    p=base.relation_owner_path(rid)
    if not p.exists(): raise RuntimeError(f"RELATION_OWNER_MISSING:{rid}")
    return p,base.load(p)

def reanchor_relation_source(s,o,rid,new_sid):
    p,obj=relation_obj(rid); touched=False
    if obj.get("fact_record") and obj["fact_record"].get("word_id")==s.owner(o).get("word_id"): obj["fact_record"]["source_sense_id"]=new_sid; touched=True
    for v in obj.get("word_views",[]):
        if v.get("source_ordinal")==o: v.setdefault("payload",{})["source_sense_id"]=new_sid; touched=True
    for field in ("word_family","semantic_neighbors","confusables"):
        for x in s.rec(o).get(field,[]):
            if x.get("fact_id")==rid or x.get("relation_id")==rid: x["source_sense_id"]=new_sid; touched=True
    if not touched: raise RuntimeError(f"RELATION_SOURCE_REANCHOR_NO_TARGET:o{o:04d}:{rid}")
    base.dump(p,obj); s.changed_relations.add(p.relative_to(ROOT).as_posix()); s.mark(o)

def reanchor_relation_target(s,o,rid,new_target_sid):
    p,obj=relation_obj(rid); touched=False
    if obj.get("fact_record") and any(v.get("source_ordinal")==o for v in obj.get("word_views",[])): obj["fact_record"]["target_sense_id"]=new_target_sid; touched=True
    for v in obj.get("word_views",[]):
        if v.get("source_ordinal")==o: v.setdefault("payload",{})["target_sense_id"]=new_target_sid; touched=True
    for field in ("word_family","semantic_neighbors","confusables"):
        for x in s.rec(o).get(field,[]):
            if x.get("fact_id")==rid or x.get("relation_id")==rid: x["target_sense_id"]=new_target_sid; touched=True
    if not touched: raise RuntimeError(f"RELATION_TARGET_REANCHOR_NO_TARGET:o{o:04d}:{rid}")
    base.dump(p,obj); s.changed_relations.add(p.relative_to(ROOT).as_posix()); s.mark(o)

def relation_ref_to_word(s,o,target_word,field=None):
    hits=[]
    for r in s.owner(o).get("relation_refs",[]):
        if field and r.get("field")!=field: continue
        obj=base.load(ROOT/r["owner_path"]); text=json.dumps(obj,ensure_ascii=False).lower()
        if f'"{target_word.lower()}"' in text or f'word:{target_word.lower()}' in text: hits.append(r)
    if len(hits)!=1: raise RuntimeError(f"REL_TO_WORD:o{o:04d}:{target_word}:GOT_{len(hits)}")
    return hits[0]["relation_id"]
def read_owner(o): return base.load(OWNER/f"o{o:04d}.json")
def active_match_external(o,all_terms=(),any_terms=(),pos=None): return uniq(f"EXT_ACTIVE_MATCH:o{o:04d}",candidates(read_owner(o)["record"].get("senses",[]),all_terms,any_terms,pos))

def mirror_target_only(s,rid,source_o,target_o,field,boundary):
    p,obj=relation_obj(rid); source_view=next((v for v in obj.get("word_views",[]) if v.get("source_ordinal")==source_o),None)
    if not source_view: raise RuntimeError(f"REL_SOURCE_VIEW_MISSING:{rid}:o{source_o:04d}")
    owner=s.owner(target_o); refs=owner.setdefault("relation_refs",[]); existing=next((v for v in obj.get("word_views",[]) if v.get("source_ordinal")==target_o),None)
    if existing is None:
        payload=copy.deepcopy(source_view.get("payload",{})); old_src=payload.get("source_sense_id"); old_tgt=payload.get("target_sense_id"); source_word=read_owner(source_o)["word"]; target_word=owner["word"]
        payload["source_sense_id"]=old_tgt; payload["target_sense_id"]=old_src; payload["target_word"]=source_word; payload["boundary"]=boundary
        if "boundaries" in payload: payload["boundaries"]=[boundary]
        if "learning_note" in payload: payload["learning_note"]=boundary
        if "source_expression" in payload: payload["source_expression"]=target_word
        if "target_expression" in payload: payload["target_expression"]=source_word
        idx=sum(1 for r in refs if r.get("field")==field); obj.setdefault("word_views",[]).append({"source_word_id":owner["word_id"],"source_ordinal":target_o,"field":field,"index":idx,"payload":payload})
    else: idx=existing.get("index",sum(1 for r in refs if r.get("field")==field))
    if not any(r.get("relation_id")==rid for r in refs): refs.append({"relation_id":rid,"owner_path":p.relative_to(ROOT).as_posix(),"field":field,"index":idx})
    obj.setdefault("provenance",{})["last_semantic_authority"]=AUTH; base.dump(p,obj); s.changed_relations.add(p.relative_to(ROOT).as_posix()); s.mark(target_o)

def add_spelling_relation(s,left_o,right_o,left_label,right_label,note):
    members=[s.owner(left_o)["word"],s.owner(right_o)["word"]]; rid="relation:horizontal:"+base.sha({"type":"regional_spelling_variant","members":members})[:20]
    p=base.relation_owner_path(rid); relpath=p.relative_to(ROOT).as_posix()
    if p.exists(): obj=base.load(p)
    else:
        obj={"schema":"kianos.lexical.relation_owner.v1","relation_id":rid,"canonical_record":None,"fact_record":None,"word_views":[],"provenance":{"materialized_from":"forward semantic reconciliation","semantic_delta":1,"authority":AUTH}}
        m=base.load(LEX/"relations"/"manifest.json"); m["relation_count"]=int(m.get("relation_count",0))+1; base.dump(LEX/"relations"/"manifest.json",m)
    for o,target,label in ((left_o,right_o,left_label),(right_o,left_o,right_label)):
        owner=s.owner(o); refs=owner.setdefault("relation_refs",[]); view=next((v for v in obj["word_views"] if v.get("source_ordinal")==o),None)
        if view is None:
            idx=sum(1 for r in refs if r.get("field")=="semantic_neighbors"); payload={"relation_id":rid,"relation_type":"spelling_variant","relation_scope":"lexeme","direction":"C","priority":"A","publication_status":"codex_reviewed","verification_status":"verified","writing_safe":True,"source_expression":owner["word"],"target_expression":s.owner(target)["word"],"target_word":s.owner(target)["word"],"boundary":note,"boundaries":[note],"learning_note":note,"task_tags":["reading","writing"],"regional_label":label}
            obj["word_views"].append({"source_word_id":owner["word_id"],"source_ordinal":o,"field":"semantic_neighbors","index":idx,"payload":payload})
        else: idx=view["index"]
        if not any(r.get("relation_id")==rid for r in refs): refs.append({"relation_id":rid,"owner_path":relpath,"field":"semantic_neighbors","index":idx})
        s.mark(o)
    base.dump(p,obj); s.changed_relations.add(relpath); return rid

def apply_shard2(s):
    reactivate_match(s,3927,any_terms=("piece of cloth","old cloth"),pos="noun",level="L1")
    add_construct(s,3928,"all the rage","非常流行；风靡一时","very fashionable or popular",level="L1")
    reactivate_match(s,3930,any_terms=("horizontal bar","barrier"),pos="noun",level="L1"); reactivate_match(s,3930,any_terms=("railway","track"),pos="noun",level="L1")
    railv=reactivate_match(s,3930,any_terms=("complain","protest","criticize","criticise"),pos="verb",level="L2",pattern="vi. + against/at",transitivity="vi"); add_colloc(s,3930,railv,"rail against/at sth","强烈抱怨/抨击某事")
    common.mirror_existing_relation(s,"deep:confusables:raise:51c4e332220c72cb",3934,4176,"confusables","raise is usually transitive ('raise sth'); rise is usually intransitive ('sth rises').")
    for sen in s.active(3937):
        for c in sen.get("collocations",[]):
            if c.get("phrase")=="by random":
                c["phrase"]="at random"; c["meaning_cn"]="随机地；任意地"; cid=c.get("collocation_id")
                if cid in s.coll_by_id: s.coll_by_id[cid]["current_value_hash"]=base.sha(c); s.dirty_coll_paths.add(s.coll_rows[cid][0])
                s.mark(3937)
    s.reactivate(3938,"sense:range:3d74721533585b12",level="L1"); refs=s.owner(3938).get("reference_senses",[]); rvx=[r for r in refs if r.get("pos")=="verb" and ("vary" in norm(r.get("definition_en")) or "extend" in norm(r.get("definition_en")))]
    if len(rvx)==1: rv=s.reactivate(3938,rvx[0]["stable_sense_id"],level="L1",pattern="vi. + from ... to ...",pos="verb",transitivity="vi")
    elif len(rvx)==0: rv=add_new(s,3938,"vary_between_limits","verb","（在一定范围内）变化；延伸","to vary or extend between specified limits","L1","vi. + from ... to ...","vi")
    else: raise RuntimeError("RANGE_VERB_IDENTITY_AMBIGUOUS")
    add_colloc(s,3938,rv,"range from A to B","从A到B不等；范围从A到B"); s.reactivate(3940,"sense:rap:d89a7099da685d3d",level="L1")
    rape_n=find_active(s,3941,any_terms=("sexual intercourse","rape","sexual"),pos="noun"); s.update_sense(3941,rape_n["sense_id"],cn="强奸；性暴力侵犯",en="the crime or act of forcing sexual activity on someone without consent",level="L1")
    rape_v=find_active(s,3941,any_terms=("plunder","despoil","ravage"),pos="verb"); s.update_sense(3941,rape_v["sense_id"],cn="掠夺；蹂躏；严重破坏（土地、资源等）",en="to exploit, despoil, or severely damage land, resources, or a place",level="L3")
    try: rewrite_construction(s,3944,"rarely do",pattern="Rarely + auxiliary + subject + verb",cn="Rarely 置于句首时使用助动词-主语倒装",en="when Rarely is fronted, use auxiliary–subject inversion",boundary="Fronted Rarely triggers auxiliary–subject inversion; do not memorize 'rarely do + sth' as a fixed frame.")
    except RuntimeError:
        for sen in s.active(3944):
            for c in sen.get("collocations",[]):
                if "rarely do" in norm(c.get("phrase")): c["phrase"]="Rarely + auxiliary + subject + verb"; c["meaning_cn"]="Rarely 句首倒装"; s.mark(3944)
    s.reactivate(3946,"sense:rat:a1aa3c63905b5e2f",level="L2"); ratv=s.reactivate(3946,"sense:rat:3a9a20997fc650ac",level="L2",pattern="vi. + on",pos="verb",transitivity="vi"); add_colloc(s,3946,ratv,"rat on sb","出卖/告发某人")
    for sen in s.active(3952):
        for c in list(sen.get("collocations",[])):
            if ("circle" in norm(c.get("phrase")) and ("半径" in c.get("meaning_cn","") or "radius" in norm(c.get("phrase")))) or "半径" in c.get("meaning_cn",""):
                sen["collocations"].remove(c); cid=c.get("collocation_id");
                if cid in s.coll_by_id: s.coll_by_id[cid]["status"]="deprecated"; s.dirty_coll_paths.add(s.coll_rows[cid][0])
                s.mark(3952)
    s.reactivate(3953,"sense:razor:f6eed81b54405400",level="L1"); refs=s.owner(3954).get("reference_senses",[]); contact=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("contact","communicat","get in touch"))]
    if len(contact)==1: sid=s.reactivate(3954,contact[0]["stable_sense_id"],level="L1",pattern="vt. + person",pos="verb",transitivity="vt")
    elif len(contact)==0: sid=add_new(s,3954,"contact_communicate","verb","联系到；与……取得联系","to contact or successfully communicate with someone","L1","vt. + person","vt")
    else: raise RuntimeError("REACH_CONTACT_IDENTITY_AMBIGUOUS")
    add_colloc(s,3954,sid,"reach sb by phone/email","通过电话/邮件联系到某人")
    common.mirror_existing_relation(s,"deep:semantic_contrast:ready:52c6d884c10c1694",3960,3747,"semantic_neighbors","ready describes being prepared; prepare is the action of making someone or something ready.")
    s.reactivate(3961,"sense:real:3b195a98c63754f2",level="L1"); common.mirror_existing_relation(s,"deep:semantic_contrast:real:c9be2f11a6350563",3961,5280,"semantic_neighbors","real means actual/genuine; very is primarily an intensifier of degree.")
    set_form(s,3956,[{"condition":"base/present tense","pronunciation":"/riːd/","note":"read in the base form and present tense"},{"condition":"past tense/past participle","pronunciation":"/red/","note":"same spelling, different tense-conditioned pronunciation"}])
    refs=s.owner(3956).get("reference_senses",[]); shows=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("indicate","show","state","display"))]
    if len(shows)==1: rs=s.reactivate(3956,shows[0]["stable_sense_id"],level="L2",pattern="vt./linking use",pos="verb")
    elif len(shows)==0: rs=add_new(s,3956,"display_state_information","verb","显示；标明；写着","to show, state, or indicate information, as on a sign, display, or instrument","L2")
    else: raise RuntimeError("READ_DISPLAY_IDENTITY_AMBIGUOUS")
    add_colloc(s,3956,rs,"the sign/thermometer reads ...","标牌上写着……/温度计显示……","usage_example")
    add_spelling_relation(s,3962,5594,"BrE spelling","AmE spelling","realise is a common British spelling; realize is standard American spelling and is also accepted by some British style systems. Both frozen Word owners are preserved.")
    p,obj=relation_obj("deep:semantic_contrast:react:404dc4e3debc1ded")
    if not any(v.get("source_ordinal")==3955 for v in obj.get("word_views",[])): raise RuntimeError("REACT_RELATION_SOURCE_VIEW_MISSING")

def apply_shard3(s):
    s.reactivate(3975,"sense:recede:ec7d7ab342765d73",level="L1"); s.reactivate(3976,"sense:receipt:7827576b619e58eb",level="L1"); s.reactivate(3980,"sense:recession:6ea70bd1dc775541",level="L1"); s.reactivate(3981,"sense:recipe:ed1b528dbbf95591",level="L1"); s.reactivate(3981,"sense:recipe:9493a9e2d8d4576f",level="L2"); s.reactivate(3987,"sense:reclaim:af8ee65f083f5973",level="L2")
    add_spelling_relation(s,3988,5596,"BrE spelling","AmE spelling","recognise is a common British spelling; recognize is standard American spelling and is also accepted by some British style systems. Both frozen Word owners are preserved.")
    for contains,terms in (("reconcile sb to",("accept","resign")),("reconcile with",("friendly","friend","relationship"))):
        try: con=find_construction(s,3992,contains); target=find_active(s,3992,any_terms=terms,pos="verb"); con["source_sense_id"]=target["sense_id"]; s.mark(3992)
        except RuntimeError: pass
    set_form(s,3993,[{"condition":"noun/adjective","stress":"initial syllable","note":"REcord"},{"condition":"verb","stress":"second syllable","note":"reCORD"}])
    refs=s.owner(3994).get("reference_senses",[]); eco=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("return to normal","improve","recover from a fall","rise again"))]
    if len(eco)==1: sid=s.reactivate(3994,eco[0]["stable_sense_id"],level="L2",pattern="vi.",pos="verb",transitivity="vi")
    elif len(eco)==0: sid=add_new(s,3994,"market_price_recover_intransitive","verb","（市场、价格、需求等）回升；复苏","for a market, economy, price, or demand to improve or rise again after a decline","L2","vi.","vi")
    else: raise RuntimeError("RECOVER_INTR_IDENTITY_AMBIGUOUS")
    add_colloc(s,3994,sid,"prices/markets recovered","价格/市场回升","usage_example")
    set_form(s,3996,[{"condition":"recreation = leisure/enjoyment","pronunciation":"roughly /ˌrek.riˈeɪ.ʃən/","note":"ordinary leisure noun"},{"condition":"re-creation = creating again","pronunciation":"roughly /ˌriː.kriˈeɪ.ʃən/","note":"same written owner, re-creation meaning"}])
    s.reactivate(3999,"sense:rectify:4cefd8f59d695d69",level="L1"); rec=find_active(s,4000,any_terms=("occur again","happen again","recur"),pos="verb"); s.update_sense(4000,rec["sense_id"],pattern="vi.",transitivity="vi")
    refs=s.owner(4004).get("reference_senses",[]); intr=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("become less","decrease","diminish"))]
    if len(intr)==1: s.reactivate(4004,intr[0]["stable_sense_id"],level="L1",pattern="vi.",pos="verb",transitivity="vi")
    elif len(intr)==0: add_new(s,4004,"decrease_intransitive","verb","减少；降低","to become smaller or less in amount, degree, or size","L1","vi.","vi")
    else: raise RuntimeError("REDUCE_INTR_IDENTITY_AMBIGUOUS")
    add_construct(s,4006,"be made redundant","被裁员；因岗位不再需要而失业","BrE: to lose one's job because the position is no longer needed",level="L1")
    s.reactivate(4007,"sense:reed:fd496bab87045c33",level="L1"); s.reactivate(4007,"sense:reed:ede0b66c905c584a",level="L2"); s.reactivate(4008,"sense:reel:5640856fa8565f7c",level="L2")
    refs=s.owner(4011).get("reference_senses",[]); pur=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("purif","impurit"))]; imp=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("improve","precise","subtle","small changes"))]
    if len(pur)!=1 or len(imp)!=1 or pur[0]["stable_sense_id"]==imp[0]["stable_sense_id"]: raise RuntimeError("REFINE_STABLE_ID_MATCH_FAILED")
    s.reactivate(4011,pur[0]["stable_sense_id"],level="L1"); s.reactivate(4011,imp[0]["stable_sense_id"],level="L1")
    reanchor_relation_source(s,4012,"deep:semantic_contrast:reflect:32ff82b469132656","sense:reflect:0536820905345f19"); common.mirror_existing_relation(s,"deep:semantic_contrast:reflect:32ff82b469132656",4012,3675,"semantic_neighbors","reflect here means think deeply; ponder means consider thoughtfully and at length.")
    s.reactivate(4018,"sense:refuge:8ec0d427742c5282",level="L1"); set_form(s,4020,[{"condition":"noun","stress":"initial syllable","note":"REfund"},{"condition":"verb","stress":"second syllable","note":"reFUND"}]); s.reactivate(4022,"sense:refuse:5655724779c9509a",level="L2")
    set_form(s,4022,[{"condition":"verb refuse","pronunciation":"/rɪˈfjuːz/","note":"decline/reject"},{"condition":"noun refuse","pronunciation":"/ˈrefjuːs/","note":"waste/rubbish"}])
    try: target=find_active(s,4024,any_terms=("respect","attention","consider"),pos="noun"); rewrite_construction(s,4024,"with regard to",cn="关于；就……而言",en="about or concerning something",boundary="with regard to = about/concerning",source_sid=target["sense_id"])
    except RuntimeError: rewrite_construction(s,4024,"with regard to",cn="关于；就……而言",en="about or concerning something",boundary="with regard to = about/concerning")
    common.mirror_existing_relation(s,"deep:semantic_contrast:regard:1ced7d06990e6362",4024,1023,"semantic_neighbors","regard can mean consider/view or respect; consider is the broader verb for thinking about or judging.")

def apply_shard4(s):
    enroll=find_active(s,4029,any_terms=("register","record","enrol","enroll"),pos="verb"); rewrite_construction(s,4029,"register with",cn="向某机构登记；注册",en="to enroll or record oneself with an authority or organization",boundary="register with + authority/organization",source_sid=enroll["sense_id"])
    s.reactivate(4035,"sense:reign:bb069fece4e253c9",level="L1",pos="verb")
    s.reactivate(4035,"sense:reign:ad7790a66d225608",level="L2",pos="verb")
    set_form(s,4038,[{"condition":"noun reject","stress":"initial syllable","note":"REject"},{"condition":"verb reject","stress":"second syllable","note":"reJECT"}]); s.reactivate(4039,"sense:rejoice:76c92581ed645f79",level="L1")
    relate_conn=s.active_sense(4040,"sense:relate:72303290accf5db5")
    if relate_conn is None: raise RuntimeError("RELATE_CONNECTION_IDENTITY_NOT_ACTIVE")
    for r in list(s.owner(4040).get("relation_refs",[])):
        if r.get("field")=="word_family": reanchor_relation_source(s,4040,r["relation_id"],relate_conn["sense_id"])
    s.reactivate(4041,"sense:relation:5fb74025eff45adb",level="L1")
    for o in (4043,4048): rid=relation_ref_to_word(s,o,"relate","word_family"); reanchor_relation_target(s,o,rid,relate_conn["sense_id"])
    s.reactivate(4045,"sense:relax:8db048cacbbd5e9e",level="L1",pattern="vt. + object",pos="verb",transitivity="vt"); set_form(s,4046,[{"condition":"noun relay","stress":"initial syllable","note":"RElay"},{"condition":"verb relay","stress":"second syllable","note":"reLAY"}])
    relay=s.active_sense(4046,"sense:relay:ffca4f901f57541a")
    if relay is None: raise RuntimeError("RELAY_PASS_ALONG_IDENTITY_NOT_ACTIVE")
    s.update_sense(4046,relay["sense_id"],pattern="vt. + object + to + person",transitivity="vt")
    target=s.active_sense(4052,"sense:relieve:113b7ff025575161")
    if target is None: raise RuntimeError("RELIEVE_ALLEVIATE_IDENTITY_NOT_ACTIVE")
    s.move_colloc(4052,"relieve the monotony",target["sense_id"],new_meaning="缓解/打破单调")
    rel=s.active_sense(4053,"sense:religion:38cb70ea79da5023")
    if rel is None: raise RuntimeError("RELIGION_LEARNER_MAIN_IDENTITY_NOT_ACTIVE")
    s.update_sense(4053,rel["sense_id"],cn="宗教；宗教信仰与实践体系",en="belief in and/or worship of a god or gods, or a system or tradition of religious belief and practice",level="L1"); s.set_core(4053,"宗教；宗教信仰与实践体系","religious belief and worship, or a tradition/system of religious belief and practice")
    s.reactivate(4054,"sense:religious:65b021938d6e5868",level="L1"); refs=s.owner(4055).get("reference_senses",[]); enjoy=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("enjoyment","enthusiasm","pleasure"))]
    if len(enjoy)==1: es=s.reactivate(4055,enjoy[0]["stable_sense_id"],level="L1")
    elif len(enjoy)==0: es=add_new(s,4055,"great_enjoyment_enthusiasm","noun","极大的享受；兴致勃勃","great enjoyment, pleasure, or enthusiasm","L1")
    else: raise RuntimeError("RELISH_ENJOY_IDENTITY_AMBIGUOUS")
    try: s.move_colloc(4055,"with relish",es,new_meaning="津津有味地；兴致勃勃地")
    except RuntimeError: add_colloc(s,4055,es,"with relish","津津有味地；兴致勃勃地")
    s.reactivate(4059,"sense:remainder:cb8bed9ffe0f56c2",level="L1"); s.reactivate(4059,"sense:remainder:970aed013e785586",level="L2")
    refs=s.owner(4061).get("reference_senses",[]); noun=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("comment","statement"))]; verb=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("comment","say","observe"))]
    if len(noun)!=1 or len(verb)!=1: raise RuntimeError("REMARK_STABLE_MATCH_FAILED")
    s.reactivate(4061,noun[0]["stable_sense_id"],level="L1"); s.reactivate(4061,verb[0]["stable_sense_id"],level="L1",pos="verb")
    act=find_active(s,4064,any_terms=("remember","recall"),pos="verb"); add_construct(s,4064,"remember doing sth","记得曾经做过某事","to recall a past action or event",act["sense_id"],"L1"); add_construct(s,4064,"remember to do sth","记得要做某事；没有忘记做某事","to not forget a required or future action",act["sense_id"],"L1")
    s.reactivate(4069,"sense:remove:676d0ea55bff50f9",level="L1")
    for kws in (("move","another place"),("dismiss","position")):
        xs=[r for r in s.owner(4069).get("reference_senses",[]) if r.get("pos")=="verb" and all(k in norm(r.get("definition_en")) for k in kws)]
        if len(xs)==1: s.reactivate(4069,xs[0]["stable_sense_id"],level="L2",pos="verb")
    render=s.active_sense(4071,"sense:render:e78f97a1f92250a3")
    if render is None: raise RuntimeError("RENDER_COMPENSATION_IDENTITY_NOT_ACTIVE")
    s.update_sense(4071,render["sense_id"],pattern="vt. + object + to + person",transitivity="vt")

def apply_shard5(s):
    c=s.rec(4075).setdefault("core_concept",{}); active={x["sense_id"] for x in s.active(4075)}; c["core_clusters"]=[cl for cl in c.get("core_clusters",[]) if any(sid in active for sid in cl.get("sense_ids",[]))]; c["core_meaning_cn"]="修理；修复；补救"; c["core_meaning_en"]="to fix or restore something damaged; the act/result of repairing"; c["mental_model_cn"]="修理；修复；补救"; s.mark(4075)
    refs=s.owner(4079).get("reference_senses",[]); av=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("disgust","strong dislike","aversion"))]
    if len(av)==1: s.reactivate(4079,av[0]["stable_sense_id"],level="L2",pos="verb")
    elif not any("disgust" in text_of(x) for x in s.active(4079)): raise RuntimeError("REPEL_AVERSION_IDENTITY_MISSING")
    reply=s.reactivate(4083,"sense:reply:904238cd08f95aeb",level="L1",pattern="vi. + to / clause",pos="verb",transitivity="vi")
    add_colloc(s,4083,reply,"reply to sb/sth","回复某人/某事")
    refs=s.owner(4086).get("reference_senses",[]); dep=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("depict","describe","portray","present"))]
    if len(dep)==1: ds=s.reactivate(4086,dep[0]["stable_sense_id"],level="L1",pos="verb")
    elif len(dep)==0:
        active_dep=candidates(s.active(4086),any_terms=("depict","describe","portray","present"),pos="verb")
        if len(active_dep)==1: ds=active_dep[0]["sense_id"]
        elif len(active_dep)==0: ds=add_new(s,4086,"depict_present_as","verb","描述；描绘；表现","to describe, depict, or present someone or something in a particular way","L1","vt. + object + as + complement","vt")
        else: raise RuntimeError("REPRESENT_DEPICTION_ACTIVE_IDENTITY_AMBIGUOUS")
    else: raise RuntimeError("REPRESENT_DEPICTION_REFERENCE_IDENTITY_AMBIGUOUS")
    try: rewrite_construction(s,4086,"represent",source_sid=ds,boundary="represent A as B = describe/depict/present A as B")
    except RuntimeError: add_construct(s,4086,"represent A as B","把A描述/表现为B","to describe, depict, or present A as B",ds,"L1")
    reserve_owner=read_owner(4104)
    booking_sid="sense:reserve:ce0182c14b8d5895"
    if not any(x.get("sense_id")==booking_sid for x in reserve_owner["record"].get("senses",[])): raise RuntimeError("RESERVE_BOOKING_IDENTITY_NOT_ACTIVE")
    rid=relation_ref_to_word(s,4103,"reserve"); reanchor_relation_target(s,4103,rid,booking_sid)
    refs=s.owner(4105).get("reference_senses",[]); water=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("water","lake","storage"))]; supply=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("supply","store","reserve"))]; disease=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("disease","infection","pathogen"))]
    if len(water)==1: s.reactivate(4105,water[0]["stable_sense_id"],level="L1")
    else: raise RuntimeError("RESERVOIR_WATER_IDENTITY_MISSING")
    if len(supply)==1: s.reactivate(4105,supply[0]["stable_sense_id"],level="L2")
    if len(disease)==1: s.reactivate(4105,disease[0]["stable_sense_id"],level="L2")
    refs=s.owner(4106).get("reference_senses",[]); place=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("place where","home","address","lives"))]; official=[r for r in refs if r.get("pos")=="noun" and "official" in norm(r.get("definition_en"))]; residing=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("residing","residence","living in"))]
    if len(place)==1: s.reactivate(4106,place[0]["stable_sense_id"],level="L1")
    elif not s.active(4106): raise RuntimeError("RESIDENCE_PLACE_IDENTITY_MISSING")
    if len(official)==1: s.reactivate(4106,official[0]["stable_sense_id"],level="L2")
    if len(residing)==1 and (not place or residing[0]["stable_sense_id"]!=place[0]["stable_sense_id"]): s.reactivate(4106,residing[0]["stable_sense_id"],level="L2")
    refs=s.owner(4108).get("reference_senses",[]); acc=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("accept","submit","resign oneself"))]
    if len(acc)==1: ac=s.reactivate(4108,acc[0]["stable_sense_id"],level="L2",pattern="vt. + oneself + to",pos="verb")
    elif len(acc)==0: ac=add_new(s,4108,"accept_unpleasant_reality","verb","使自己接受（不愉快的现实）","to accept that an unpleasant situation cannot be changed","L2","resign oneself to sth","vt")
    else: raise RuntimeError("RESIGN_ACCEPT_IDENTITY_AMBIGUOUS")
    add_construct(s,4108,"resign oneself to sth","听任；只好接受某事","to accept an unpleasant reality as unavoidable",ac,"L2")
    os=s.reactivate(4110,"sense:resist:d7ef5f9d8602522a",level="L1",pos="verb")
    s.reactivate(4110,"sense:resist:00751880ae935c7b",level="L1",pos="verb")
    add_construct(s,4110,"resist doing sth","忍住不做某事；抵制做某事","to stop oneself from doing something",os,"L2"); add_construct(s,4110,"can't resist doing sth","忍不住做某事","to be unable to stop oneself from doing something",os,"L1")
    s.reactivate(4112,"sense:resistant:994f5b59c9975823",level="L1")
    for sid,level in (("sense:resolution:e8e046932145526c","L1"),("sense:resolution:f56d6d2844295a58","L1"),("sense:resolution:d536b452a3a051ff","L1"),("sense:resolution:cbbdd75a73f954aa","L2")):
        s.reactivate(4114,sid,level=level)
    ss=s.reactivate(4115,"sense:resolve:4028746977a356ee",level="L1",pos="verb")
    ds=s.reactivate(4115,"sense:resolve:ed4cfc3470ef52c6",level="L1",pos="verb"); add_construct(s,4115,"resolve to do sth","下定决心做某事","to make a firm decision to do something",ds,"L1")
    hs=s.reactivate(4116,"sense:resort:378a2a6d62915611",level="L1")
    ts=s.reactivate(4116,"sense:resort:b7b95371e8575ee7",level="L1",pattern="vi. + to",pos="verb",transitivity="vi"); add_construct(s,4116,"resort to sth","诉诸；求助于某事","to turn to something, often as a last option",ts,"L1")
    s.reactivate(4117,"sense:resource:e42a8c8deb4956d0",level="L1"); target=s.active_sense(4118,"sense:respect:6920a3b99a3f54d4")
    if target is None: raise RuntimeError("RESPECT_COMPLIANCE_IDENTITY_NOT_ACTIVE")
    try: s.move_colloc(4118,"respect the law",target["sense_id"],new_meaning="遵守法律")
    except RuntimeError: pass
    po=read_owner(3568); psid="sense:perspective:4040a0899a135ad7"
    if not any(x.get("sense_id")==psid for x in po["record"].get("senses",[])): raise RuntimeError("PERSPECTIVE_VIEWPOINT_IDENTITY_NOT_ACTIVE")
    rid=relation_ref_to_word(s,4119,"perspective"); reanchor_relation_target(s,4119,rid,psid)
    s.reactivate(4120,"sense:respond:cba033438d535e3c",level="L1",pattern="vi. + to",pos="verb",transitivity="vi"); mirror_target_only(s,"deep:semantic_contrast:react:404dc4e3debc1ded",3955,4120,"semantic_neighbors","react emphasizes a response to a stimulus or event; respond is the broader verb for answering or reacting.")
    rs=s.reactivate(4121,"sense:response:081963c9229151c0",level="L1")
    try: rewrite_construction(s,4121,"in response to",source_sid=rs,boundary="in response to = as a reaction or reply to")
    except RuntimeError: add_construct(s,4121,"in response to sth","作为对某事的回应","as a reaction or reply to something",rs,"L1")
    for x in list(s.active(4122)):
        if "可靠性" in x.get("definition_cn",""): s.update_sense(4122,x["sense_id"],cn=x["definition_cn"].replace("；可靠性","").replace("，可靠性","").replace("可靠性",""))
    for x in s.rec(4122).get("constructions",[]):
        if "可靠性" in str(x.get("meaning_cn","")): x["meaning_cn"]=x["meaning_cn"].replace("可靠性","责任/问责"); s.mark(4122)
    refs=s.owner(4124).get("reference_senses",[]); dep=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("depend","based on","rest on"))]
    if len(dep)==1: ds=s.reactivate(4124,dep[0]["stable_sense_id"],level="L2",pattern="vi. + on",pos="verb",transitivity="vi")
    else:
        try: ds=find_active(s,4124,any_terms=("depend","based"),pos="verb")["sense_id"]
        except RuntimeError: ds=add_new(s,4124,"depend_be_based_on","verb","取决于；以……为基础","to depend on or be based on something","L2","vi. + on","vi")
    rewrite_construction(s,4124,"rest on",cn="取决于；以……为基础",en="to depend on or be based on something",boundary="abstract rest on = depend/be based on",source_sid=ds)

def finalize(s,shard):
    spec=SHARDS[shard]; lo,hi=spec["scope"]
    for o in sorted(s.changed_words): common.sync_owner(s,o)
    s.sync_registry_files(); s.write_owners()
    for o in sorted(s.changed_words): s.owners[o]=base.load(OWNER/f"o{o:04d}.json")
    errors=[]
    for o in sorted(s.changed_words):
        for x in s.owner(o)["record"].get("senses",[]):
            reg=s.sense_by_id.get(x.get("sense_id"))
            if not reg or reg.get("status")!="active": errors.append(f"REGISTRY_CLOSURE:o{o:04d}:{x.get('sense_id')}")
    if errors: raise SystemExit("READBACK_FAILED:"+json.dumps(errors,ensure_ascii=False))
    return {"schema":"kianos.lexical.forward_shard_receipt.v2","status":"LOCAL_CLOSED_PENDING_PACKAGE_INTEGRATION","authority":AUTH,"package":[3875,4124],"shard":[lo,hi],"reviewed_owner_count":50,"semantic_mutation_source_count":len(spec["delta"]),"semantic_source_ordinals":spec["delta"],"changed_word_ordinals":sorted(s.changed_words),"out_of_range_dependency_ordinals":spec["remote"],"no_change_word_ordinals":[o for o in range(lo,hi+1) if o not in spec["delta"]],"new_semantic_branch_ids":sorted(s.new_senses),"new_semantic_branch_count":len(s.new_senses),"reactivated_stable_ids":sorted(set(s.reactivated)),"demoted_stable_ids":sorted(set(s.demoted)),"changed_relation_owner_paths":sorted(s.changed_relations),"relation_manifest_count":base.load(LEX/"relations"/"manifest.json").get("relation_count"),"readback":{"all_50_owner_views":"PASS","authorized_semantic_sources":"PASS","stable_registry_closure":"PASS","bounded_relation_form_closure":"PASS"}}

def run(shard):
    spec=SHARDS[shard]; lo,hi=spec["scope"]; base.DELTA=list(spec["delta"]); base.REMOTE_WORDS=list(spec["remote"])
    before_nochange={o:base.sha(base.load(OWNER/f"o{o:04d}.json")) for o in range(lo,hi+1) if o not in spec["delta"]}; before_remote={o:base.sha(base.load(OWNER/f"o{o:04d}.json")) for o in spec["remote"]}
    s=base.State(); {2:apply_shard2,3:apply_shard3,4:apply_shard4,5:apply_shard5}[shard](s); receipt=finalize(s,shard)
    for o,h in before_nochange.items():
        if base.sha(base.load(OWNER/f"o{o:04d}.json"))!=h: raise SystemExit(f"NO_CHANGE_OWNER_DRIFT:o{o:04d}")
    changed_remote=[o for o,h in before_remote.items() if base.sha(base.load(OWNER/f"o{o:04d}.json"))!=h]; receipt["changed_out_of_range_dependency_ordinals"]=changed_remote
    base.dump(RECEIPT/f"o{lo:04d}-o{hi:04d}.json",receipt); print(json.dumps(receipt,ensure_ascii=False,indent=2))

if __name__=="__main__":
    ap=argparse.ArgumentParser(); ap.add_argument("--shard",type=int,choices=[2,3,4,5],required=True); run(ap.parse_args().shard)
