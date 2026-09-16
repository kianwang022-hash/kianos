from pathlib import Path

p = Path('tools/lexical_apply_forward_o3875_o4124_remaining.py')
t = p.read_text()


def rep(old: str, new: str) -> None:
    global t
    if old not in t:
        raise SystemExit('HARDEN_ANCHOR_MISSING:\n' + old[:260])
    t = t.replace(old, new, 1)


rep('''    try: relate_conn=find_active(s,4040,any_terms=("connect","relation","relationship"),pos="verb")
    except RuntimeError:
        refs=s.owner(4040).get("reference_senses",[]); xs=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("connect","relation","relationship"))]
        if len(xs)!=1: raise
        sid=s.reactivate(4040,xs[0]["stable_sense_id"],level="L1",pos="verb"); relate_conn=s.active_sense(4040,sid)''', '''    relate_conn=s.active_sense(4040,"sense:relate:72303290accf5db5")
    if relate_conn is None: raise RuntimeError("RELATE_CONNECTION_IDENTITY_NOT_ACTIVE")''')

rep('''    relay=find_active(s,4046,any_terms=("pass","transmit","communicat"),pos="verb"); s.update_sense(4046,relay["sense_id"],pattern="vt. + object + to + person",transitivity="vt")''', '''    relay=s.active_sense(4046,"sense:relay:ffca4f901f57541a")
    if relay is None: raise RuntimeError("RELAY_PASS_ALONG_IDENTITY_NOT_ACTIVE")
    s.update_sense(4046,relay["sense_id"],pattern="vt. + object + to + person",transitivity="vt")''')

rep('''    target=find_active(s,4052,any_terms=("lessen","alleviate","relieve","reduce"),pos="verb"); s.move_colloc(4052,"relieve the monotony",target["sense_id"],new_meaning="缓解/打破单调")''', '''    target=s.active_sense(4052,"sense:relieve:113b7ff025575161")
    if target is None: raise RuntimeError("RELIEVE_ALLEVIATE_IDENTITY_NOT_ACTIVE")
    s.move_colloc(4052,"relieve the monotony",target["sense_id"],new_meaning="缓解/打破单调")''')

rep('''    rel=find_active(s,4053,any_terms=("religion","belief","worship","faith"),pos="noun"); s.update_sense(4053,rel["sense_id"],cn="宗教；宗教信仰与实践体系",en="belief in and/or worship of a god or gods, or a system or tradition of religious belief and practice",level="L1"); s.set_core(4053,"宗教；宗教信仰与实践体系","religious belief and worship, or a tradition/system of religious belief and practice")''', '''    rel=s.active_sense(4053,"sense:religion:38cb70ea79da5023")
    if rel is None: raise RuntimeError("RELIGION_LEARNER_MAIN_IDENTITY_NOT_ACTIVE")
    s.update_sense(4053,rel["sense_id"],cn="宗教；宗教信仰与实践体系",en="belief in and/or worship of a god or gods, or a system or tradition of religious belief and practice",level="L1"); s.set_core(4053,"宗教；宗教信仰与实践体系","religious belief and worship, or a tradition/system of religious belief and practice")''')

rep('''    render=find_active(s,4071,any_terms=("return","give","render","compensation"),pos="verb"); s.update_sense(4071,render["sense_id"],pattern="vt. + object + to + person",transitivity="vt")''', '''    render=s.active_sense(4071,"sense:render:e78f97a1f92250a3")
    if render is None: raise RuntimeError("RENDER_COMPENSATION_IDENTITY_NOT_ACTIVE")
    s.update_sense(4071,render["sense_id"],pattern="vt. + object + to + person",transitivity="vt")''')

rep('''    refs=s.owner(4083).get("reference_senses",[]); rv=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("answer","reply","respond"))]
    if len(rv)==1: reply=s.reactivate(4083,rv[0]["stable_sense_id"],level="L1",pattern="vi. + to / clause",pos="verb",transitivity="vi")
    elif len(rv)==0: reply=find_active(s,4083,any_terms=("answer","reply"),pos="verb")["sense_id"]
    else: raise RuntimeError("REPLY_VERB_IDENTITY_AMBIGUOUS")''', '''    reply=s.reactivate(4083,"sense:reply:904238cd08f95aeb",level="L1",pattern="vi. + to / clause",pos="verb",transitivity="vi")''')

rep('''    refs=s.owner(4086).get("reference_senses",[]); dep=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("depict","describe","portray","present"))]
    if len(dep)==1: ds=s.reactivate(4086,dep[0]["stable_sense_id"],level="L1",pos="verb")
    else: ds=find_active(s,4086,any_terms=("depict","describe","portray","present"),pos="verb")["sense_id"]''', '''    refs=s.owner(4086).get("reference_senses",[]); dep=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("depict","describe","portray","present"))]
    if len(dep)==1: ds=s.reactivate(4086,dep[0]["stable_sense_id"],level="L1",pos="verb")
    elif len(dep)==0:
        active_dep=candidates(s.active(4086),any_terms=("depict","describe","portray","present"),pos="verb")
        if len(active_dep)==1: ds=active_dep[0]["sense_id"]
        elif len(active_dep)==0: ds=add_new(s,4086,"depict_present_as","verb","描述；描绘；表现","to describe, depict, or present someone or something in a particular way","L1","vt. + object + as + complement","vt")
        else: raise RuntimeError("REPRESENT_DEPICTION_ACTIVE_IDENTITY_AMBIGUOUS")
    else: raise RuntimeError("REPRESENT_DEPICTION_REFERENCE_IDENTITY_AMBIGUOUS")''')

rep('''    booking=active_match_external(4102,any_terms=("book","reservation","reserve a room","hold for a customer"),pos="verb"); rid=relation_ref_to_word(s,4103,"reserve"); reanchor_relation_target(s,4103,rid,booking["sense_id"])''', '''    reserve_owner=read_owner(4104)
    booking_sid="sense:reserve:ce0182c14b8d5895"
    if not any(x.get("sense_id")==booking_sid for x in reserve_owner["record"].get("senses",[])): raise RuntimeError("RESERVE_BOOKING_IDENTITY_NOT_ACTIVE")
    rid=relation_ref_to_word(s,4103,"reserve"); reanchor_relation_target(s,4103,rid,booking_sid)''')

rep('''    refs=s.owner(4110).get("reference_senses",[]); oppose=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("oppose","refuse","resist"))]; withstand=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("withstand","unaffected","not be harmed"))]
    if len(oppose)==1: os=s.reactivate(4110,oppose[0]["stable_sense_id"],level="L1",pos="verb")
    else: os=find_active(s,4110,any_terms=("oppose","refuse"),pos="verb")["sense_id"]
    if len(withstand)==1: s.reactivate(4110,withstand[0]["stable_sense_id"],level="L1",pos="verb")''', '''    os=s.reactivate(4110,"sense:resist:d7ef5f9d8602522a",level="L1",pos="verb")
    s.reactivate(4110,"sense:resist:00751880ae935c7b",level="L1",pos="verb")''')

rep('''    refs=s.owner(4114).get("reference_senses",[]); got=0
    for terms,level in (("vote formal decision official decision".split(),"L1"),("solve settle solution".split(),"L1"),("determination firm decision resolve".split(),"L1"),("image display pixel".split(),"L2")):
        xs=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in terms)]
        if len(xs)==1: s.reactivate(4114,xs[0]["stable_sense_id"],level=level); got+=1
    if got<3 and len(s.active(4114))<3: raise RuntimeError("RESOLUTION_MAJOR_IDENTITIES_MISSING")''', '''    for sid,level in (("sense:resolution:e8e046932145526c","L1"),("sense:resolution:f56d6d2844295a58","L1"),("sense:resolution:d536b452a3a051ff","L1"),("sense:resolution:cbbdd75a73f954aa","L2")):
        s.reactivate(4114,sid,level=level)''')

rep('''    refs=s.owner(4115).get("reference_senses",[]); solve=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("solve","settle","resolve a problem"))]; decide=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("decide","firm decision","resolve to"))]
    ss=s.reactivate(4115,solve[0]["stable_sense_id"],level="L1",pos="verb") if len(solve)==1 else find_active(s,4115,any_terms=("solve","settle"),pos="verb")["sense_id"]
    ds=s.reactivate(4115,decide[0]["stable_sense_id"],level="L1",pos="verb") if len(decide)==1 else find_active(s,4115,any_terms=("decide","determin"),pos="verb")["sense_id"]; add_construct(s,4115,"resolve to do sth","下定决心做某事","to make a firm decision to do something",ds,"L1")''', '''    ss=s.reactivate(4115,"sense:resolve:4028746977a356ee",level="L1",pos="verb")
    ds=s.reactivate(4115,"sense:resolve:ed4cfc3470ef52c6",level="L1",pos="verb"); add_construct(s,4115,"resolve to do sth","下定决心做某事","to make a firm decision to do something",ds,"L1")''')

rep('''    refs=s.owner(4116).get("reference_senses",[]); holiday=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("holiday","vacation","recreation"))]; turn=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("turn to","last resort","seek help"))]
    hs=s.reactivate(4116,holiday[0]["stable_sense_id"],level="L1") if len(holiday)==1 else find_active(s,4116,any_terms=("holiday","vacation"),pos="noun")["sense_id"]
    ts=s.reactivate(4116,turn[0]["stable_sense_id"],level="L1",pattern="vi. + to",pos="verb",transitivity="vi") if len(turn)==1 else add_new(s,4116,"turn_to_last_option","verb","诉诸；求助于（常指最后手段）","to turn to something for help, especially as a last option","L1","vi. + to","vi"); add_construct(s,4116,"resort to sth","诉诸；求助于某事","to turn to something, often as a last option",ts,"L1")''', '''    hs=s.reactivate(4116,"sense:resort:378a2a6d62915611",level="L1")
    ts=s.reactivate(4116,"sense:resort:b7b95371e8575ee7",level="L1",pattern="vi. + to",pos="verb",transitivity="vi"); add_construct(s,4116,"resort to sth","诉诸；求助于某事","to turn to something, often as a last option",ts,"L1")''')

rep('''    s.reactivate(4117,"sense:resource:e42a8c8deb4956d0",level="L1"); target=find_active(s,4118,any_terms=("comply","rule","law","obey"),pos="verb")''', '''    s.reactivate(4117,"sense:resource:e42a8c8deb4956d0",level="L1"); target=s.active_sense(4118,"sense:respect:6920a3b99a3f54d4")
    if target is None: raise RuntimeError("RESPECT_COMPLIANCE_IDENTITY_NOT_ACTIVE")''')

rep('''    po=read_owner(3568); pcs=[x for x in po["record"].get("senses",[]) if x.get("pos")=="noun" and any(k in text_of(x) for k in ("view","perspective","point of view"))] or po["record"].get("senses",[]); psid=uniq("PERSPECTIVE_TARGET_CURRENT",pcs)["sense_id"]; rid=relation_ref_to_word(s,4119,"perspective"); reanchor_relation_target(s,4119,rid,psid)''', '''    po=read_owner(3568); psid="sense:perspective:4040a0899a135ad7"
    if not any(x.get("sense_id")==psid for x in po["record"].get("senses",[])): raise RuntimeError("PERSPECTIVE_VIEWPOINT_IDENTITY_NOT_ACTIVE")
    rid=relation_ref_to_word(s,4119,"perspective"); reanchor_relation_target(s,4119,rid,psid)''')

p.write_text(t)
print('hardened frozen identity replacements=13')
