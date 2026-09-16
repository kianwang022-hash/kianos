from pathlib import Path

p = Path('tools/lexical_apply_forward_o3875_o4124_remaining.py')
t = p.read_text()
changed = 0


def rep(old: str, new: str, label: str) -> None:
    global t, changed
    if new in t:
        print(f'{label}: already applied')
        return
    if old not in t:
        raise SystemExit(f'{label}: PATCH_ANCHOR_MISSING')
    t = t.replace(old, new, 1)
    changed += 1
    print(f'{label}: applied')


rep('''    refs=s.owner(4061).get("reference_senses",[]); noun=[r for r in refs if r.get("pos")=="noun" and any(k in norm(r.get("definition_en")) for k in ("comment","statement"))]; verb=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("comment","say","observe"))]
    if len(noun)!=1 or len(verb)!=1: raise RuntimeError("REMARK_STABLE_MATCH_FAILED")
    s.reactivate(4061,noun[0]["stable_sense_id"],level="L1"); s.reactivate(4061,verb[0]["stable_sense_id"],level="L1",pos="verb")''', '''    s.reactivate(4061,"sense:remark:cd5888bfedd554dc",level="L1")
    remark_verb=s.reactivate(4061,"sense:remark:ef776ae04ac451b6",level="L1",pattern="vi. + on/upon",pos="verb",transitivity="vi")
    remark_constructions=[x for x in s.rec(4061).get("constructions",[]) if "remark on" in norm(x.get("pattern","")+" "+x.get("boundary",""))]
    if not remark_constructions: raise RuntimeError("REMARK_ON_CONSTRUCTION_MISSING")
    for x in remark_constructions: x["source_sense_id"]=remark_verb
    s.mark(4061)''', 'remark exact noun/verb + construction anchors')

rep('''    refs=s.owner(4079).get("reference_senses",[]); av=[r for r in refs if r.get("pos")=="verb" and any(k in norm(r.get("definition_en")) for k in ("disgust","strong dislike","aversion"))]
    if len(av)==1: s.reactivate(4079,av[0]["stable_sense_id"],level="L2",pos="verb")
    elif not any("disgust" in text_of(x) for x in s.active(4079)): raise RuntimeError("REPEL_AVERSION_IDENTITY_MISSING")''', '''    s.reactivate(4079,"sense:repel:ace5d6a63ee959f0",level="L1",pattern="vt. + object",pos="verb",transitivity="vt")''', 'repel aversion exact identity')

if not changed:
    raise SystemExit('NO_NEW_STAGE_EXECUTOR_PATCH')
p.write_text(t)
print('stage executor patches applied=', changed)
