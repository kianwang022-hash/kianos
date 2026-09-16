from pathlib import Path

p = Path('tools/lexical_apply_forward_o3875_o4124_remaining.py')
t = p.read_text()

def rep(old: str, new: str) -> None:
    global t
    if old not in t:
        raise SystemExit('LOCAL_FAMILY_PATCH_ANCHOR_MISSING:\n' + old[:300])
    t = t.replace(old, new, 1)

rep('''    for r in list(s.owner(4040).get("relation_refs",[])):
        if r.get("field")=="word_family": reanchor_relation_source(s,4040,r["relation_id"],relate_conn["sense_id"])
    s.reactivate(4041,"sense:relation:5fb74025eff45adb",level="L1")
    for o in (4043,4048): rid=relation_ref_to_word(s,o,"relate","word_family"); reanchor_relation_target(s,o,rid,relate_conn["sense_id"])''', '''    relate_family=[x for x in s.rec(4040).get("word_family",[]) if x.get("target_word")=="relation"]
    if len(relate_family)!=1: raise RuntimeError(f"RELATE_LOCAL_FAMILY_SOURCE:GOT_{len(relate_family)}")
    relate_family[0]["source_sense_id"]=relate_conn["sense_id"]; s.mark(4040)
    s.reactivate(4041,"sense:relation:5fb74025eff45adb",level="L1")
    for o in (4043,4048):
        local_family=[x for x in s.rec(o).get("word_family",[]) if x.get("target_word")=="relate"]
        if len(local_family)!=1: raise RuntimeError(f"RELATE_LOCAL_FAMILY_TARGET:o{o:04d}:GOT_{len(local_family)}")
        local_family[0]["target_sense_id"]=relate_conn["sense_id"]; s.mark(o)''')

rep('''    rid=relation_ref_to_word(s,4103,"reserve"); reanchor_relation_target(s,4103,rid,booking_sid)''', '''    booking_family=[x for x in s.rec(4103).get("word_family",[]) if x.get("target_word")=="reserve"]
    if len(booking_family)!=1: raise RuntimeError(f"RESERVATION_LOCAL_FAMILY_TARGET:GOT_{len(booking_family)}")
    booking_family[0]["target_sense_id"]=booking_sid; s.mark(4103)''')

p.write_text(t)
print('patched local family anchors for relate/relative/relevant/reservation')
